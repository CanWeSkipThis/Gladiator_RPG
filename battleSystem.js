// Extracted battle and endgame system from game.js

function sleep() {
    state.player.stats.sleeps += 1;
    state.player.day += 1;

    const event = pickSleepEvent();
    const result = event.apply(state);

    // Sleeping always fully restores health.
    state.player.hp = state.player.maxHp;

    // Keep mana/event results, but never allow broken decimals.
    state.player.mana = roundInt(clamp(state.player.mana, 0, state.player.maxMana));

    if (state.progress.romanPatron) {
        const bonusMana = roundInt(5 + state.player.attributes.intelligence * 0.6);
        state.player.mana = Math.min(state.player.maxMana, roundInt(state.player.mana + bonusMana));
    }

    checkQuestCompletion();
    checkAchievements();
    saveState();
    renderHUD();

    const eventName = getLocalizedName(event.names);
    const eventText = getLocalizedDesc(event.text);
    const effectText = formatEventEffect(result);
    const message = `
        <div>${Text.bold(T('sleepEvent'))}: ${eventName}</div>
        <div>${eventText}</div>
        <div class="subtle">${effectText}</div>
    `;

    renderStory(message);
    pushLog(`${Text.gold('🌙')} ${eventName} — ${stripHtml(effectText)}`, event.kind === 'bad' ? 'bad' : event.kind === 'good' ? 'good' : 'info');
    renderMainActions();
}

function formatEventEffect(result) {
    const parts = [];
    if (result.hp) parts.push(`+${result.hp} HP`);
    if (result.mana) parts.push(`+${result.mana} MP`);
    if (result.xp) parts.push(`+${result.xp} XP`);
    if (result.gold) parts.push(`${result.gold > 0 ? '+' : ''}${result.gold} Gold`);
    if (result.loss) parts.push(`-${result.loss} HP`);
    if (result.manaLoss) parts.push(`-${result.manaLoss} MP`);
    if (result.goldLoss) parts.push(`-${result.goldLoss} Gold`);
    return parts.join(' | ');
}

// =====================================================
// Enemy and boss battles
// =====================================================

function enterArena() {
    if (state.battle) return;

    state.pendingBattle = createArenaPreviewEnemy();

    if (state.settings.showEnemyPreview) {
        showBattlePreview(false);
    } else {
        state.battle = state.pendingBattle;
        state.pendingBattle = null;

        beginBattle();
    }
}

function createArenaPreviewEnemy() {
    return {
        type: 'enemy',
        enemy: generateEnemy({
            day: state.player.day,
            level: state.player.level,
            endless: state.mode === 'endless'
        }),
        turn: 1,
        bossState: null
    };
}

function enterBossArena() {
    if (state.battle) return;

    const boss = getAvailableBoss(state);
    if (!boss) {
        showToast(T('endlessUnlocked'));
        return;
    }

    state.battle = {
        type: 'boss',
        enemy: generateBossEnemy(boss),
        boss: boss,
        turn: 1,
        bossState: createBossState(boss)
    };

    if (state.settings.showBossPreview) {
        showBattlePreview(true);
    } else {
        beginBattle();
    }
}

function generateBossEnemy(boss) {
    const baseLevel = state.player.level;
    const day = state.player.day;

    const hp = roundInt((180 + baseLevel * 35 + day * 18) * boss.hpMult);
    const damage = roundInt((12 + baseLevel * 5 + day * 2) * boss.dmgMult);
    const defense = roundInt((6 + baseLevel * 2 + day) * boss.defMult);
    const strength = roundInt((10 + baseLevel * 2) * boss.dmgMult);
    const dexterity = roundInt((8 + baseLevel * 1.2));
    const intelligence = roundInt((8 + baseLevel * 1.1));

    return {
        id: boss.id,
        type: 'boss',
        name: getLocalizedName(boss.names),
        level: boss.level,
        hp,
        maxHp: hp,
        damage,
        defense,
        strength,
        dexterity,
        intelligence,
        crit: 0.08,
        dodge: 0.08,
        mechanism: boss.mechanism,
        rewardGold: roundInt(120 + hp * 0.28),
        rewardExp: roundInt(120 + hp * 0.30),
        loot: boss.loot
    };
}

function createBossState(boss) {
    return {
        enraged: false,
        shield: boss.mechanism === 'shield' ? 2 : 0,
        poisonedTurns: 0,
        drained: false,
        revived: false
    };
}

function showBattlePreview(isBoss) {
    const enemy = state.pendingBattle.enemy;
    const title = isBoss ? T('bossPreview') : T('enemyPreview');
	state.modalContext = 'battlePreview';

    showModal(`
        <h2 class="modal-title">⚔️ ${title}</h2>
        <div class="modal-body">
            <div class="modal-section">
                <div class="card-row">
                    <div>
                        <div><strong>${enemy.name}</strong> ${isBoss ? '👑' : ''}</div>
                        <div class="subtle">${isBoss ? getLocalizedDesc(state.battle.boss.description) : enemy.archetypeLabel}</div>
                    </div>
                    <span class="tag">${T('level')}: ${enemy.level}</span>
                </div>
                <div class="list">
                    <div class="card-row"><span>HP</span><strong>${enemy.hp}</strong></div>
                    <div class="card-row"><span>DMG</span><strong>${enemy.damage}</strong></div>
                    <div class="card-row"><span>DEF</span><strong>${enemy.defense}</strong></div>
                    <div class="card-row"><span>${T('strength')}</span><strong>${enemy.strength}</strong></div>
                    <div class="card-row"><span>${T('dexterity')}</span><strong>${enemy.dexterity}</strong></div>
                    <div class="card-row"><span>${T('intelligence')}</span><strong>${enemy.intelligence}</strong></div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
		    <button class="good" id="battlePreviewFightBtn">${T('fightNow')}</button>
			
			<button class="secondary" id="battlePreviewRefreshBtn">
			    ${T('refreshOpponent')} 
			</button>
			
			<button class="secondary" id="battlePreviewBackBtn">
			    ${T('back')} 
			</button>
        </div>
    `);

    document.getElementById('battlePreviewFightBtn').onclick = () => {
        state.battle = state.pendingBattle;
        state.pendingBattle = null;
        closeModal();
        beginBattle();
    };
    document.getElementById('battlePreviewRefreshBtn').onclick = () => {
        state.pendingBattle = {
            type: 'enemy',
            enemy: generateEnemy({
                day: state.player.day,
                level: state.player.level,
                endless: state.mode === 'endless'
            }),
            turn: 1,
            bossState: null
        };
        closeModal();
    state.pendingBattle = createArenaPreviewEnemy();
    showBattlePreview(false);
	};
	document.getElementById('battlePreviewBackBtn').onclick = () => {
		closeModal();
		state.modalContext = null;
	}
}

function beginBattle() {
    closeModal();
    renderBattleScene();
    renderMainActions();
    pushLog(`${Text.red('⚔️')} ${state.battle.enemy.name}`, state.battle.type === 'boss' ? 'boss' : 'info');
}

function renderBattleScene() {
    if (!state.battle) return;

    const enemy = state.battle.enemy;
    const battleType = state.battle.type === 'boss' ? T('currentBoss') : T('currentEnemy');

    renderStory(`
        <div>${Text.bold(battleType)}: ${Text.red(enemy.name)}</div>
        <div>${T('level')}: ${enemy.level}</div>
        <div class="subtle">${enemy.mechanism ? `Mechanic: ${enemy.mechanism}` : ''}</div>
    `);

    renderSecondaryInfo(`
        <div class="hud-row">
            <span class="tag">${enemy.hp}/${enemy.maxHp} HP</span>
            <span class="tag">${enemy.damage} DMG</span>
            <span class="tag">${enemy.defense} DEF</span>
            <span class="tag">${state.battle.type === 'boss' ? '👑 Boss' : enemy.type}</span>
        </div>
    `);

    renderBattleActions();
}

function battleAction(isSpecial) {
    if (!state.battle) return;

    const enemy = state.battle.enemy;
    const boss = state.battle.type === 'boss' ? state.battle.boss : null;

    if (isSpecial && state.player.mana < 10) {
        showToast(T('notEnoughMana'));
        return;
    }

    state.player.stats.hits += 1;

    if (isSpecial) {
        state.player.mana = Math.max(0, state.player.mana - 10);
    }

    // Player hit calculation
    let damage = calculatePlayerDamage(isSpecial);

    // Enemy archetype special dodge
    let dodgeChance = clamp(0.03 + enemy.dodge + state.player.attributes.dexterity * 0.002 - enemy.dexterity * 0.001, 0.02, 0.35);

    // Boss shield mechanic
    if (boss && boss.mechanism === 'shield' && state.battle.bossState.shield > 0) {
        damage = Math.round(damage * 0.4);
        state.battle.bossState.shield -= 1;
        pushLog(`${Text.blue(T('shieldBreak'))}: ${boss.names[state.settings.language]}`, 'boss');
    }

    const isCrit = Math.random() < calculateCritChance(enemy);
    if (isCrit) {
        damage = Math.round(damage * 1.6);
    }

    if (Math.random() < dodgeChance) {
        pushLog(`${Text.blue(T('dodge'))}: ${enemy.name}`, 'info');
        damage = 0;
    } else {
        enemy.hp = Math.max(0, roundInt(enemy.hp - damage));
    }

    if (damage > 0) {
        pushLog(`${isCrit ? Text.red(T('criticalHit')) : Text.gold(T('attack'))}: ${damage}`, isCrit ? 'boss' : 'good');
    }

    // Boss-specific reaction after being hit
    if (boss) {
        applyBossOnHit(boss);
    }

    if (enemy.hp <= 0) {
        winBattle();
        return;
    }

    // Enemy retaliates
    enemyTurn();
    tickBuffs();
    renderBattleScene();
    renderHUD();
    saveState();
}

function calculatePlayerDamage(isSpecial) {
    const p = state.player;
    let damage = 6 + p.attributes.strength * 2 + p.equipment.weapon.stats.damage + p.buffs.attackBonus + p.bonuses.damageBonus;
    damage += Math.floor(p.attributes.dexterity / 4);

    if (isSpecial) {
        damage = Math.round(damage * 1.75 + p.attributes.intelligence);
    }

    // Intel gives slight utility to damage via focus
    damage += Math.floor(p.attributes.intelligence / 5);

    return roundInt(Math.max(1, damage));
}

function calculateCritChance(enemy) {
    const p = state.player;
    const weaponCrit = p.equipment.weapon.stats.crit || 0;
    const buffCrit = p.points.skill ? 0 : 0;
    const base = 0.05 + p.attributes.dexterity * 0.01 + weaponCrit + buffCrit + p.bonuses.critBonus;
    return clamp(base - (enemy.dexterity * 0.001), 0.05, 0.40);
}

function enemyTurn() {
    const enemy = state.battle.enemy;
    const boss = state.battle.type === 'boss' ? state.battle.boss : null;
    const bossState = state.battle.bossState;

    let damage = roundInt(enemy.damage + Math.floor(enemy.strength * 0.35));
    damage -= state.player.equipment.armor.stats.defense + state.player.buffs.defenseBonus;
    damage = Math.max(0, damage);

    // Player dodge
    const dodgeChance = clamp(0.04 + state.player.attributes.dexterity * 0.012 - enemy.dexterity * 0.002, 0.03, 0.40);
    if (Math.random() < dodgeChance) {
        pushLog(`${Text.blue(T('dodge'))}: ${T('health')}`, 'good');
        damage = 0;
    }

    // Enemy archetype effects
    if (enemy.type === 'strong' && Math.random() < 0.25) {
        damage = roundInt(damage * 1.25);
    }
    if (enemy.type === 'smart' && Math.random() < 0.20) {
        const drain = Math.min(state.player.mana, 6);
        state.player.mana -= drain;
        pushLog(`${Text.blue(T('manaDrained'))}: -${drain}`, 'warning');
    }
    if (enemy.type === 'tough') {
        damage = roundInt(damage * 0.88);
    }
    if (enemy.type === 'agile' && Math.random() < 0.20) {
        damage = roundInt(damage * 0.85);
    }

    // Boss mechanics
    if (boss) {
        if (boss.mechanism === 'enrage' && !bossState.enraged && enemy.hp <= enemy.maxHp / 2) {
            bossState.enraged = true;
            damage = roundInt(damage * 1.4);
            pushLog(`${Text.red('🔥')} ${boss.names[state.settings.language]} ${Text.red('ENRAGED')}`, 'boss');
        }
        if (boss.mechanism === 'poison') {
            if (Math.random() < 0.35) {
                bossState.poisonedTurns = 3;
                pushLog(`${Text.green(T('poison'))}`, 'boss');
            }
        }
        if (boss.mechanism === 'drain' && !bossState.drained) {
            const drain = Math.min(state.player.mana, 10);
            state.player.mana -= drain;
            enemy.hp = Math.min(enemy.maxHp, roundInt(enemy.hp + Math.floor(drain / 2)));
            bossState.drained = true;
            pushLog(`${Text.blue(T('manaDrained'))}: -${drain}`, 'boss');
        }
        if (boss.mechanism === 'revive' && !bossState.revived && enemy.hp <= enemy.maxHp * 0.30) {
            bossState.revived = true;
            const heal = Math.round(enemy.maxHp * 0.35);
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal);
            damage = roundInt(damage * 0.6);
            pushLog(`${Text.gold('👑')} ${boss.names[state.settings.language]} ${Text.green('+heal')}`, 'boss');
        }
    }

    // Apply poison damage from boss
    if (boss && bossState.poisonedTurns > 0) {
        const poisonDamage = 5;
        state.player.hp = Math.max(0, roundInt(state.player.hp - poisonDamage));
        bossState.poisonedTurns -= 1;
        pushLog(`${Text.green(T('poison'))}: -${poisonDamage}`, 'warning');
    }

    if (damage > 0) {
        state.player.hp = Math.max(0, roundInt(state.player.hp - damage));
        pushLog(`${Text.red('💥')} ${damage}`, 'bad');
    }

    if (state.player.hp <= 0) {
        loseBattle();
        return;
    }
}

function applyBossOnHit(boss) {
    const enemy = state.battle.enemy;
    if (boss.mechanism === 'enrage' && enemy.hp <= enemy.maxHp / 2) {
        enemy.damage = roundInt(enemy.damage * 1.05);
    }
}

function tickBuffs() {
    if (state.player.buffs.attackTurns > 0) {
        state.player.buffs.attackTurns -= 1;
        if (state.player.buffs.attackTurns <= 0) state.player.buffs.attackBonus = 0;
    }
    if (state.player.buffs.defenseTurns > 0) {
        state.player.buffs.defenseTurns -= 1;
        if (state.player.buffs.defenseTurns <= 0) state.player.buffs.defenseBonus = 0;
    }
}

function winBattle() {
    const enemy = state.battle.enemy;
    const isBoss = state.battle.type === 'boss';

    if (isBoss) {
        state.player.stats.bossWins += 1;
    } else {
        state.player.stats.wins += 1;
    }

    state.player.gold += enemy.rewardGold;
    gainXp(enemy.rewardExp);

    if (isBoss) {
        const boss = state.battle.boss;
        state.progress.bosses[boss.id].won = true;

        // Give boss trophy item directly to the player.
        const lootItem = getItemById(boss.loot);
        if (lootItem) {
            if (lootItem.slot === 'armor') {
                const oldHpBonus = state.player.equipment.armor?.stats?.hp || 0;
                const newHpBonus = lootItem.stats.hp || 0;
                state.player.equipment.armor = clone(lootItem);
                state.player.maxHp = roundInt(state.player.maxHp - oldHpBonus + newHpBonus);
                state.player.hp = Math.min(state.player.maxHp, roundInt(state.player.hp - oldHpBonus + newHpBonus));
            } else {
                state.player.equipment[lootItem.slot] = clone(lootItem);
            }
            pushLog(`${Text.gold('👑')} ${getLocalizedName(lootItem.name)}`, 'boss');
        }

        pushLog(`${Text.gold(T('battleWon'))}: ${boss.names[state.settings.language]}`, 'boss');
        showToast(`${T('battleWon')}: ${boss.names[state.settings.language]}`);

        checkQuestCompletion();
        checkAchievements();
        saveState();
        renderHUD();
        renderStory(`
            <div>${Text.bold(Text.gold(T('battleWon')))}!</div>
            <div>${boss.names[state.settings.language]}</div>
        `);
        state.battle = null;
        renderMainActions();

        if (allMainBossesWon()) {
            state.progress.endlessUnlocked = true;
            pushLog(`${Text.gold('∞')} ${T('endlessUnlocked')}`, 'boss');
            showEndgameChoice();
        }
        return;
    }

    pushLog(`${Text.green(T('battleWon'))}: ${enemy.name}`, 'good');
    showToast(`${T('battleWon')}: ${enemy.name}`);

    checkQuestCompletion();
    checkAchievements();
    saveState();
    renderHUD();
    renderStory(`
        <div>${Text.bold(Text.green(T('battleWon')))}!</div>
        <div>${enemy.name}</div>
    `);
    state.battle = null;
    renderMainActions();
}

function loseBattle() {
    state.player.stats.losses += 1;
    state.player.hp = 1;
    state.battle = null;

    checkQuestCompletion();
    checkAchievements();

    pushLog(`${Text.red(T('battleLost'))}`, 'bad');
    showToast(T('battleLost'), 'bad');
    saveState();
    renderHUD();
    renderStory(`
        <div>${Text.bold(Text.red(T('battleLost')))}</div>
        <div>${Text.italic('Try again.')}</div>
    `);
    renderMainActions();
}

function fleeBattle() {
    if (!state.battle) return;
    const enemyName = state.battle.enemy.name;
    state.battle = null;
    pushLog(`${Text.gray(T('flee'))}: ${enemyName}`, 'warning');
    renderStory(getIntroText());
    renderMainActions();
    saveState();
}

function allMainBossesWon() {
    return window.BOSSES.every(b => state.progress.bosses[b.id]?.won);
}

// =====================================================
// Endgame and endless mode
// =====================================================

function showEndgameChoice() {
    saveCurrentLeaderboardRecordIfBetter();

    showModal(`
        <h2 class="modal-title">∞ ${T('endlessUnlocked')}</h2>
        <div class="modal-body">
            <div class="modal-section">
                ${T('shareRecord')} або ${T('continueEndless')}
            </div>
            <div class="modal-section">
                <div class="card-row"><span>${T('score')}</span><strong>${calculateScore()}</strong></div>
                <div class="card-row"><span>${T('day')}</span><strong>${state.player.day}</strong></div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="good" id="endShareBtn">${T('shareRecord')}</button>
            <button class="warning" id="endContinueBtn">${T('continueEndless')}</button>
            <button class="secondary" id="endCloseBtn">${T('close')}</button>
        </div>
    `);

    const box = DOM.modalBox;
    box.querySelector('#endShareBtn').onclick = shareRecord;
    box.querySelector('#endContinueBtn').onclick = () => {
        state.mode = 'endless';
        closeModal();
        pushLog(`${Text.gold('∞')} ${T('endlessMode')}`, 'boss');
        renderMainActions();
    };
    box.querySelector('#endCloseBtn').onclick = closeModal;
}

function continueEndlessMode() {
    state.mode = 'endless';
    pushLog(`${Text.gold('∞')} ${T('endlessMode')}`, 'boss');
    renderMainActions();
    showToast(T('endlessMode'));
}

// =====================================================
// Random quests and battle previews from campaign flow
// =====================================================

