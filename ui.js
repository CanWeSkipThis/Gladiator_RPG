// Extracted UI layer from game.js

// =====================================================
// Settings and theme
// =====================================================

function applySettings() {
    document.documentElement.style.setProperty('--bg-color', state.settings.bgColor);
    document.documentElement.style.setProperty('--text-color', state.settings.textColor);
    document.body.classList.toggle('no-gradient', !state.settings.gradient);

    DOM.appTitle.textContent = `${T('appTitle')} v${GAME_VERSION}`;
    document.title = `${T('appTitle')} v${GAME_VERSION}`;
}

function setLanguage(lang) {
    state.settings.language = lang === 'en' ? 'en' : 'uk';
    window.gameSettings = state.settings;
    saveSettings();
    refreshAllUI({ persistGame: hasSavedGame() || !DOM.gameScreen.classList.contains('hidden') });
    showToast(T('settingsSaved'));
    if (hasSavedGame() || !DOM.gameScreen.classList.contains('hidden')) {
        pushLog(`${T('language')}: ${state.settings.language.toUpperCase()}`, 'good');
    }
}

function applyDefaultSettings() {
    state.settings = clone(DEFAULT_SETTINGS);
    window.gameSettings = state.settings;
    applySettings();
    saveSettings();
    refreshAllUI({ persistGame: hasSavedGame() || !DOM.gameScreen.classList.contains('hidden') });
    showToast(T('settingsReset'));
    if (hasSavedGame() || !DOM.gameScreen.classList.contains('hidden')) {
        pushLog(T('settingsReset'), 'warning');
    }
}

function updateThemeFromInputs(form) {
    const gradient = form.querySelector('#settingGradient').checked;
    const bgColor = form.querySelector('#settingBgColor').value;
    const textColor = form.querySelector('#settingTextColor').value;
    const preview = form.querySelector('#settingEnemyPreview').checked;
    const bossPreview = form.querySelector('#settingBossPreview').checked;
    const language = form.querySelector('#settingLanguage').value;

    state.settings.gradient = gradient;
    state.settings.bgColor = bgColor;
    state.settings.textColor = textColor;
    state.settings.showEnemyPreview = preview;
    state.settings.showBossPreview = bossPreview;
    state.settings.language = language;

    window.gameSettings = state.settings;
    applySettings();
    saveSettings();
    refreshAllUI({ persistGame: hasSavedGame() || !DOM.gameScreen.classList.contains('hidden') });
    showToast(T('settingsSaved'));
}

function openSettings() {
    const html = `
        <h2 class="modal-title">⚙️ ${T('settings')}</h2>
        <div class="modal-body">
            <div class="modal-section">
                <div class="control-row">
                    <label for="settingLanguage">${T('language')}</label>
                    <select id="settingLanguage">
                        <option value="uk" ${state.settings.language === 'uk' ? 'selected' : ''}>Українська</option>
                        <option value="en" ${state.settings.language === 'en' ? 'selected' : ''}>English</option>
                    </select>
                </div>

                <div class="control-row">
                    <label for="settingGradient">${T('gradient')}</label>
                    <input id="settingGradient" type="checkbox" ${state.settings.gradient ? 'checked' : ''}>
                </div>

                <div class="control-row">
                    <label for="settingBgColor">${T('backgroundColor')}</label>
                    <input id="settingBgColor" type="color" value="${state.settings.bgColor}">
                </div>

                <div class="control-row">
                    <label for="settingTextColor">${T('textColor')}</label>
                    <input id="settingTextColor" type="color" value="${state.settings.textColor}">
                </div>

                <div class="control-row">
                    <label for="settingEnemyPreview">${T('showEnemyPreview')}</label>
                    <input id="settingEnemyPreview" type="checkbox" ${state.settings.showEnemyPreview ? 'checked' : ''}>
                </div>

                <div class="control-row">
                    <label for="settingBossPreview">${T('showBossPreview')}</label>
                    <input id="settingBossPreview" type="checkbox" ${state.settings.showBossPreview ? 'checked' : ''}>
                </div>
            </div>

            <div class="modal-section subtle">
                ${T('leaderboardHint')}
            </div>
        </div>

        <div class="modal-footer">
            <button class="good" id="settingsSaveBtn">${T('save')}</button>
            <button class="secondary" id="settingsDefaultBtn">${T('defaults')}</button>
            <button class="danger" id="settingsResetProgressBtn">${T('resetProgress')}</button>
            <button class="secondary" id="settingsCloseBtn">${T('close')}</button>
        </div>
    `;

    showModal(html);

    const box = DOM.modalBox;
    box.querySelector('#settingsSaveBtn').onclick = () => updateThemeFromInputs(box);
    box.querySelector('#settingsDefaultBtn').onclick = () => {
        applyDefaultSettings();
        openSettings();
    };
    box.querySelector('#settingsResetProgressBtn').onclick = resetProgress;
    box.querySelector('#settingsCloseBtn').onclick = closeModal;
}

// =====================================================
// Modal, toast and log
// =====================================================

function showModal(html) {
    DOM.modalBox.innerHTML = `
        <button class="modal-close-btn" id="modalCloseGlobal" aria-label="${T('close')}" type="button">×</button>
        <div class="modal-content">
            ${html}
        </div>
    `;
    DOM.modalOverlay.classList.remove('hidden');
    const closeBtn = DOM.modalBox.querySelector('#modalCloseGlobal');
    if (closeBtn) closeBtn.onclick = closeModal;
}

function closeModal() {
    if (state.pendingBattle) {
        state.pendingBattle = null;
    }

    state.modalContext = null;

    state.modalNavigation = {
        context: null,
        selectedIndex: 0,
        items: []
    };

    DOM.modalOverlay.classList.add('hidden');
    DOM.modalBox.innerHTML = '';

    renderHotkeyOverlay();
}




function showToast(message, type = 'info') {
    DOM.toast.className = `toast ${type}`;
    DOM.toast.innerHTML = message;
    DOM.toast.classList.remove('hidden');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
        DOM.toast.classList.add('hidden');
    }, 1800);
}

function pushLog(message, type = 'info') {
    state.log.unshift({
        text: message,
        type,
        time: Date.now()
    });
    state.log = state.log.slice(0, 10);
    renderLog();
    saveState();
}

function renderLog() {
    if (DOM.journalCount) {
        DOM.journalCount.textContent = String(state.log.length);
    }

    if (!state.log.length) {
        DOM.actionLog.innerHTML = `<div class="log-item"><span class="log-dot"></span><span>${T('journalEmpty')}</span></div>`;
        return;
    }

    DOM.actionLog.innerHTML = state.log.map(entry => `
        <div class="log-item ${entry.type}">
            <span class="log-dot"></span>
            <span>${entry.text}</span>
        </div>
    `).join('');
}

// =====================================================
// UI rendering
// =====================================================

function showGameScreen() {
    DOM.menuScreen.classList.add('hidden');
    DOM.gameScreen.classList.remove('hidden');
    renderHotkeyOverlay();
}

function showMenuScreen() {
    DOM.gameScreen.classList.add('hidden');
    DOM.menuScreen.classList.remove('hidden');
    renderHotkeyOverlay();
}

function refreshAllUI({ persistGame = true } = {}) {
    applySettings();
    renderMenu();
    renderHUD();
    renderStory(getIntroText());
    renderSecondaryInfo('');
    renderMainActions();
    renderLog();
    renderDynamicScreenLabels();

    if (persistGame) {
        saveState();
    } else {
        saveSettings();
    }
}

function renderDynamicScreenLabels() {
    DOM.btnSettingsTop.title = T('settings');
    DOM.btnMenuTop.title = T('menu');
    DOM.menuHeading.textContent = `${T('appTitle')} v${GAME_VERSION}`;
    DOM.menuSubtitle.textContent = T('storyIntro');
    if (DOM.journalTitle) DOM.journalTitle.textContent = T('journalTitle');
    renderHotkeyOverlay();
}

window.DEFAULT_SETTINGS = {
    language: 'uk',
    gradient: true,
    bgColor: '#1e1e2f',
    textColor: '#ffffff',
    showEnemyPreview: true,
    showBossPreview: true
};


function renderMenu() {
    const hasSave = hasSavedGame();
    const buttons = [
        `${makeButtonWithHotkey({ id: 'menuStartBtn', cls: 'good', label: T('newGame'), hotkey: 'N' })}`,
        hasSave ? `${makeButtonWithHotkey({ id: 'menuContinueBtn', cls: 'secondary', label: T('continueGame'), hotkey: 'C' })}` : '',
        `${makeButtonWithHotkey({ id: 'menuAchievementsBtn', cls: 'secondary', label: T('achievements'), hotkey: 'A' })}`,
        `${makeButtonWithHotkey({ id: 'menuLeaderboardBtn', cls: 'secondary', label: T('leaderboard'), hotkey: 'L' })}`,
        `${makeButtonWithHotkey({ id: 'menuSettingsBtn', cls: 'secondary', label: T('settings'), hotkey: 'P' })}`
    ].filter(Boolean).join('');

    DOM.menuButtons.innerHTML = buttons;

    const bind = (id, fn) => {
        const node = document.getElementById(id);
        if (node) node.onclick = fn;
    };

    bind('menuStartBtn', startNewGame);
    bind('menuContinueBtn', continueGame);
    bind('menuAchievementsBtn', showAchievements);
    bind('menuLeaderboardBtn', showLeaderboard);
    bind('menuSettingsBtn', openSettings);
    renderHotkeyOverlay();
}
function renderHUD() {
    const p = state.player;
    const hpPct = p.maxHp ? (p.hp / p.maxHp) * 100 : 0;
    const manaPct = p.maxMana ? (p.mana / p.maxMana) * 100 : 0;
    const xpPct = p.expToNextLevel ? (p.xp / p.expToNextLevel) * 100 : 0;

    DOM.hudLeft.innerHTML = `
        <div class="hud-row">
            <span class="stat-pill">⭐ ${T('level')}: ${p.level}</span>
            <span class="stat-pill">🌙 ${T('day')}: ${p.day}</span>
            <span class="stat-pill">💰 ${T('gold')}: ${p.gold}</span>
        </div>
        <div>
            <div class="subtle">${T('health')}: ${p.hp}/${p.maxHp}</div>
            <div class="progress-bar"><div style="width:${hpPct}%"></div></div>
        </div>
        <div>
            <div class="subtle">${T('mana')}: ${p.mana}/${p.maxMana}</div>
            <div class="progress-bar"><div style="width:${manaPct}%"></div></div>
        </div>
        <div>
            <div class="subtle">${T('xp')}: ${p.xp}/${p.expToNextLevel}</div>
            <div class="progress-bar"><div style="width:${xpPct}%"></div></div>
        </div>
    `;

    DOM.hudRight.innerHTML = `
        <div class="hud-row">
            <span class="stat-pill">🏆 ${T('bossWins')}: ${p.stats.bossWins}</span>
            ${state.progress.romanPatron ? `<span class="tag">${T('romanPatron')}</span>` : ''}
            <button class="small-btn secondary" id="hudCharacterBtn">${T('characteristics')}</button>
        </div>
        <div class="subtle">
            ⚔️ ${localItemName(p.equipment.weapon)} (+${p.equipment.weapon.stats.damage} ${T('damage')})<br>
            🛡️ ${localItemName(p.equipment.armor)} (+${p.equipment.armor.stats.defense} ${T('defense')} / +${p.equipment.armor.stats.hp} HP)
        </div>
    `;

    const hudCharacterBtn = document.getElementById('hudCharacterBtn');
    if (hudCharacterBtn) hudCharacterBtn.onclick = showCharacterSheet;
}


function getPlayerDamagePreview(isSpecial = false) {
    return calculatePlayerDamage(isSpecial);
}

function getPlayerDefensePreview() {
    const armorDefense = state.player.equipment.armor?.stats?.defense || 0;
    const armorHp = state.player.equipment.armor?.stats?.hp || 0;
    return roundInt(armorDefense + state.player.buffs.defenseBonus + Math.floor(state.player.attributes.dexterity / 4) + Math.floor(armorHp / 10));
}

function getPlayerCritChancePreview() {
    const weaponCrit = state.player.equipment.weapon?.stats?.crit || 0;
    const base = 0.05 + state.player.attributes.dexterity * 0.01 + weaponCrit + state.player.bonuses.critBonus;
    return clamp(base, 0.05, 0.40);
}

function getPlayerDodgeChancePreview() {
    return clamp(0.04 + state.player.attributes.dexterity * 0.012, 0.04, 0.35);
}

function showCharacterSheet() {
    const p = state.player;
    const skillBlock = p.points.skill > 0 ? `<div class="card-row"><span>${T('skillPoints')}</span><strong>${p.points.skill}</strong></div>` : '';
    const attrBlock = p.points.attribute > 0 ? `<div class="card-row"><span>${T('attributePoints')}</span><strong>${p.points.attribute}</strong></div>` : '';
    const bonusRows = [];
    if (p.bonuses.damageBonus) bonusRows.push(`<div class="card-row"><span>${T('attackBonus')}</span><strong>+${p.bonuses.damageBonus}</strong></div>`);
    if (p.bonuses.critBonus) bonusRows.push(`<div class="card-row"><span>${T('critChance')}</span><strong>+${percent(p.bonuses.critBonus)}</strong></div>`);
    if (p.buffs.attackBonus) bonusRows.push(`<div class="card-row"><span>${T('attackBonus')}</span><strong>+${p.buffs.attackBonus}</strong></div>`);
    if (p.buffs.defenseBonus) bonusRows.push(`<div class="card-row"><span>${T('defenseBonus')}</span><strong>+${p.buffs.defenseBonus}</strong></div>`);

    // Кнопки швидкого перемикання між вікнами (використовують новий CSS-клас)
    const navButtonsBlock = `
        <div class="modal-nav-group">
            ${makeButtonWithHotkey({ id: 'sheetPotionBtn', cls: 'secondary', label: T('usePotion'), hotkey: 'I' })}
            ${makeButtonWithHotkey({ id: 'sheetStatsBtn', cls: 'secondary', label: T('stats'), hotkey: 'T' })}
        </div>
    `;

    showModal(`
        ${navButtonsBlock}
        
        <h2 class="modal-title">🧾 ${T('playerSheet')}</h2>
        <div class="modal-body">
            <div class="modal-section list">
                <div class="card-row"><span>${T('level')}</span><strong>${p.level}</strong></div>
                <div class="card-row"><span>${T('health')}</span><strong>${p.hp}/${p.maxHp}</strong></div>
                <div class="card-row"><span>${T('mana')}</span><strong>${p.mana}/${p.maxMana}</strong></div>
                <div class="card-row"><span>${T('damage')}</span><strong>${getPlayerDamagePreview(false)}</strong></div>
                <div class="card-row"><span>${T('defense')}</span><strong>${getPlayerDefensePreview()}</strong></div>
                <div class="card-row"><span>${T('critChance')}</span><strong>${percent(getPlayerCritChancePreview())}</strong></div>
                <div class="card-row"><span>${T('dodgeChance')}</span><strong>${percent(getPlayerDodgeChancePreview())}</strong></div>
                <div class="card-row"><span>${T('gold')}</span><strong>${p.gold}</strong></div>
            </div>

            <div class="modal-section list">
                <div class="card-row"><span>${T('strength')}</span><strong>${p.attributes.strength}</strong></div>
                <div class="card-row"><span>${T('dexterity')}</span><strong>${p.attributes.dexterity}</strong></div>
                <div class="card-row"><span>${T('intelligence')}</span><strong>${p.attributes.intelligence}</strong></div>
            </div>

            ${(skillBlock || attrBlock) ? `<div class="modal-section list">${skillBlock}${attrBlock}</div>` : ''}

            ${bonusRows.length ? `<div class="modal-section list">${bonusRows.join('')}</div>` : ''}

            <div class="modal-section list">
                <div class="card-row">
                    <span>${T('equipmentStats')} — ${localItemName(p.equipment.weapon)}</span>
                    <strong>+${p.equipment.weapon.stats.damage} ${T('damage')}</strong>
                </div>
                <div class="card-row">
                    <span>${T('equipmentStats')} — ${localItemName(p.equipment.armor)}</span>
                    <strong>+${p.equipment.armor.stats.defense} ${T('defense')}</strong>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="secondary" id="sheetCloseBtn">${T('close')}</button>
        </div>
    `);

    // Прив'язка кліків до кнопок навігації
    const potionBtn = document.getElementById('sheetPotionBtn');
    if (potionBtn) potionBtn.onclick = openPotionInventory;

    const statsBtn = document.getElementById('sheetStatsBtn');
    if (statsBtn) statsBtn.onclick = showStats;

    const closeBtn = document.getElementById('sheetCloseBtn');
    if (closeBtn) closeBtn.onclick = closeModal;
}

function renderStory(html) {
    DOM.story.innerHTML = html;
}

function renderSecondaryInfo(html) {
    DOM.secondaryInfo.innerHTML = html || '';
}

function getIntroText() {
    return `
        <div>${Text.bold(T('story'))}:</div>
        <div>${T('storyIntro')}</div>
        <div class="subtle">${state.progress.romanPatron ? Text.gold(T('romanJoined')) : ''}</div>
    `;
}


function renderMainActions() {
    if (state.battle) {
        renderBattleActions();
        return;
    }

    // Перевіряємо наявність функції перед викликом, щоб уникнути крашу
    const boss = typeof window.getAvailableBoss === 'function' ? window.getAvailableBoss(state) : null;

    const controls = [
        `${makeButtonWithHotkey({ id: 'actionArenaBtn', cls: 'good', label: T('arena'), hotkey: 'A' })}`,
        boss ? `${makeButtonWithHotkey({ id: 'actionBossBtn', cls: 'warning', label: T('bossArena'), hotkey: 'B' })}` : '',
        `${makeButtonWithHotkey({ id: 'actionShopBtn', cls: 'secondary', label: T('shop'), hotkey: 'S' })}`,
        `${makeButtonWithHotkey({ id: 'actionSleepBtn', cls: 'secondary', label: T('sleep'), hotkey: 'R' })}`,
        (state.player.points.skill + state.player.points.attribute) > 0
            ? `${makeButtonWithHotkey({ id: 'actionProgressBtn', cls: 'good', label: T('progression'), hotkey: 'U' })}`
            : '',
        `${makeButtonWithHotkey({ id: 'actionCharacterBtn', cls: 'secondary', label: T('characteristics'), hotkey: 'C' })}`,
        `${makeButtonWithHotkey({ id: 'actionQuestsBtn', cls: 'secondary', label: T('quests'), hotkey: 'Q' })}`,
        state.progress.endlessUnlocked ? `<button class="warning" id="actionEndlessBtn">${T('endlessMode')}</button>` : '',
        `${makeButtonWithHotkey({ id: 'actionMenuBtn', cls: 'danger', label: T('menu'), hotkey: 'M' })}`
    ].filter(Boolean).join('');

    DOM.actions.innerHTML = controls;

    // БЕЗПЕЧНЕ зв'язування подій через window, щоб уникнути ReferenceError
    bindActionButtons({
        actionArenaBtn: window.enterArena || window.startBattle, 
        actionBossBtn: window.enterBossArena,
        actionShopBtn: window.openShopHub,
        actionSleepBtn: window.sleep,
        actionPotionBtn: window.openPotionInventory,
        actionProgressBtn: openProgression,
        actionCharacterBtn: showCharacterSheet,
        actionQuestsBtn: showQuests,
        actionStatsBtn: showStats,
        actionAchievementsBtn: showAchievements,
        actionLeaderboardBtn: showLeaderboard,
        actionSettingsBtn: openSettings,
        actionEndlessBtn: window.continueEndlessMode,
        actionMenuBtn: goToMenu
    });

    renderSecondaryInfo(`
        <div class="hud-row">
            <span class="tag">${state.mode === 'endless' ? T('endlessMode') : T('story')}</span>
            ${state.progress.romanPatron ? `<span class="tag">${T('romanPatron')}</span>` : ''}
        </div>
    `);
    renderHotkeyOverlay();
}

function renderBattleActions() {
    DOM.actions.innerHTML = [
        `${makeButtonWithHotkey({ id: 'battleAttackBtn', cls: 'good', label: T('attack'), hotkey: 'A' })}`,
        `${makeButtonWithHotkey({ id: 'battleSpecialBtn', cls: 'warning', label: T('specialAttack') + ' (-10 MP)', hotkey: 'X' })}`,
        `${makeButtonWithHotkey({ id: 'battlePotionBtn', cls: 'secondary', label: T('usePotion'), hotkey: 'I' })}`,
        `${makeButtonWithHotkey({ id: 'battleFleeBtn', cls: 'secondary', label: T('flee'), hotkey: 'F' })}`
    ].join('');

    bindActionButtons({
        battleAttackBtn: () => battleAction(false),
        battleSpecialBtn: () => battleAction(true),
        battlePotionBtn: openPotionInventory,
        battleFleeBtn: fleeBattle
    });
    renderHotkeyOverlay();
}
function bindActionButtons(map) {
    Object.entries(map).forEach(([id, fn]) => {
        const node = document.getElementById(id);
        if (node) node.onclick = fn;
    });
}

// =====================================================
// Game start / menu
// =====================================================

function startNewGame() {
    if (hasSavedGame() && !confirm(T('overwriteSave'))) {
        return;
    }

    closeModal();

    const fresh = createDefaultState();
    const keepSettings = clone(state.settings);
    state = fresh;
    state.settings = keepSettings;
    state.mode = 'campaign';
    state.battle = null;
    window.gameSettings = state.settings;
    window.gameState = state;
    applySettings();
    showGameScreen();
    pushLog(T('gameStarted'), 'good');
    renderHUD();
    renderStory(getIntroText());
    renderSecondaryInfo('');
    renderMainActions();
    saveState();
}

function continueGame() {
    if (!hasSavedGame()) {
        showToast(T('noSave'), 'warning');
        renderMenu();
        return;
    }

    const loaded = loadState();
    if (!loaded) {
        showToast(T('noSave'), 'warning');
        renderMenu();
        return;
    }
    closeModal();
    showGameScreen();
    pushLog(T('loadedSave'), 'good');
    renderHUD();
    renderStory(getIntroText());
    renderSecondaryInfo('');
    renderMainActions();
    saveState();
}

function goToMenu() {
    if (!DOM.gameScreen.classList.contains('hidden')) {
        saveState();
    }
    closeModal();
    showMenuScreen();
    renderMenu();
    renderDynamicScreenLabels();
    showToast(T('menu'));
}

// =====================================================
// Stats, achievements, quests, leaderboard
// =====================================================

function showStats() {
    const p = state.player;
    showModal(`
        <h2 class="modal-title">📊 ${T('stats')}</h2>
        <div class="modal-body">
            <div class="modal-section list">
                <div class="card-row"><span>${T('wins')}</span><strong>${p.stats.wins}</strong></div>
                <div class="card-row"><span>${T('losses')}</span><strong>${p.stats.losses}</strong></div>
                <div class="card-row"><span>${T('hits')}</span><strong>${p.stats.hits}</strong></div>
                <div class="card-row"><span>${T('potionsUsed')}</span><strong>${p.stats.potionsUsed}</strong></div>
                <div class="card-row"><span>${T('bossWins')}</span><strong>${p.stats.bossWins}</strong></div>
                <div class="card-row"><span>${T('day')}</span><strong>${p.day}</strong></div>
                <div class="card-row"><span>${T('inventoryValue')}</span><strong>${calculateInventoryValue()}</strong></div>
                <div class="card-row"><span>${T('score')}</span><strong>${calculateScore()}</strong></div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="secondary" id="statsCloseBtn">${T('close')}</button>
        </div>
    `);
    document.getElementById('statsCloseBtn').onclick = closeModal;
}

function showAchievements() {
    const items = window.ACHIEVEMENT_DEFS.map(a => {
        const done = Boolean(state.progress.achievements[a.id]);
        return `
            <div class="card-row">
                <div>
                    <div>${done ? '✅' : '⬜'} ${getLocalizedName(a.names)}</div>
                    <div class="subtle">${getLocalizedDesc(a.descriptions)}</div>
                </div>
                <span class="tag">${done ? T('achievementComplete') : '...'}</span>
            </div>
        `;
    }).join('');

    showModal(`
        <h2 class="modal-title">🏆 ${T('achievements')}</h2>
        <div class="modal-body">
            <div class="modal-section list">${items}</div>
        </div>
        <div class="modal-footer">
            <button class="secondary" id="achievementsCloseBtn">${T('close')}</button>
        </div>
    `);
    document.getElementById('achievementsCloseBtn').onclick = closeModal;
}


function showQuests() {
    const quests = window.QUEST_DEFS
        .filter(q => typeof q.visible === 'function' ? q.visible(state) : true);

    const items = quests.map(q => {
        const qState = state.progress.quests[q.id] || { done: false, claimed: false, dialogueSeen: false };
        const status = qState.claimed ? '✅' : qState.done ? '⏳' : '⬜';
        const badge = qState.claimed
            ? T('questComplete')
            : qState.done
                ? T('chooseUpgrade')
                : T('questJournal');

        const descriptionText = getLocalizedDesc(q.description);
        const triggerLabel = q.triggerLabel ? getLocalizedDesc(q.triggerLabel) : '';

        const resumeButton = q.dialogue && qState.done && !qState.claimed
            ? `<button class="secondary" id="questResume_${q.id}">${T('resumeDialogue')}</button>`
            : '';

        return `
            <div class="quest-card">
                <div class="card-row">
                    <div>
                        <div>${status} ${getLocalizedName(q.names)}</div>
                    </div>
                    <span class="tag">${badge}</span>
                </div>
                ${descriptionText ? `<div class="quest-description">${descriptionText}</div>` : ''}
                ${triggerLabel ? `<div class="quest-meta"><span class="tag">${triggerLabel}</span></div>` : ''}
                ${resumeButton ? `<div class="modal-footer" style="justify-content:flex-start; padding-top: 8px;">${resumeButton}</div>` : ''}
            </div>
        `;
    }).join('');

    showModal(`
        <h2 class="modal-title">📜 ${T('quests')}</h2>
        <div class="modal-body">
            <div class="modal-section list">${items || `<div class="subtle">${T('questsUnlocked')}</div>`}</div>
        </div>
        <div class="modal-footer">
            <button class="secondary" id="questsCloseBtn">${T('close')}</button>
        </div>
    `);

    const closeBtn = document.getElementById('questsCloseBtn');
    if (closeBtn) closeBtn.onclick = closeModal;

    quests.forEach(q => {
        const btn = document.getElementById(`questResume_${q.id}`);
        if (btn) btn.onclick = () => openQuestDialogue(q);
    });
}

function showLeaderboard() {
    const records = getLeaderboardRecords();
    const rows = records.slice(0, 10).map((row, index) => `
        <div class="card-row">
            <div>
                <div><strong>#${index + 1}</strong> ${row.name}</div>
                <div class="subtle">${new Date(row.date).toLocaleString()}</div>
            </div>
            <div class="tag">${T('score')}: ${row.score}</div>
        </div>
    `).join('');

    showModal(`
        <h2 class="modal-title">🏅 ${T('leaderboard')}</h2>
        <div class="modal-body">
            <div class="modal-section subtle">${T('leaderboardHint')}</div>
            <div class="modal-section list">${rows || `<div class="subtle">—</div>`}</div>
            <div class="modal-section">
                <div class="card-row"><span>${T('score')}</span><strong>${calculateScore()}</strong></div>
                <div class="card-row"><span>${T('inventoryValue')}</span><strong>${calculateInventoryValue()}</strong></div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="good" id="leaderboardShareBtn">${T('shareRecord')}</button>
            <button class="secondary" id="leaderboardCloseBtn">${T('close')}</button>
        </div>
    `);

    document.getElementById('leaderboardShareBtn').onclick = shareRecord;
    document.getElementById('leaderboardCloseBtn').onclick = closeModal;
}

function getLeaderboardRecords() {
    try {
        const saved = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
        if (Array.isArray(saved) && saved.length) return saved;
    } catch (error) {
        console.warn(error);
    }
    return Array.isArray(state.leaderboard) ? state.leaderboard : [];
}

function addLeaderboardRecord(name, score) {
    const records = getLeaderboardRecords();
    records.push({
        name,
        score,
        date: new Date().toISOString()
    });
    records.sort((a, b) => b.score - a.score);
    const top = records.slice(0, 10);
    state.leaderboard = top;
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top));
    saveState();
}

function shareRecord() {
    const text = `${T('score')}: ${calculateScore()}\n${T('wins')}: ${state.player.stats.wins}\n${T('bossWins')}: ${state.player.stats.bossWins}\n${T('inventoryValue')}: ${calculateInventoryValue()}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(T('recordShared'));
            pushLog(T('recordShared'), 'good');
        }).catch(() => {
            showModal(`
                <h2 class="modal-title">📣 ${T('shareRecord')}</h2>
                <div class="modal-body">
                    <div class="modal-section"><pre style="white-space:pre-wrap;margin:0">${text}</pre></div>
                </div>
                <div class="modal-footer">
                    <button class="secondary" id="shareCloseBtn">${T('close')}</button>
                </div>
            `);
            document.getElementById('shareCloseBtn').onclick = closeModal;
        });
    } else {
        showModal(`
            <h2 class="modal-title">📣 ${T('shareRecord')}</h2>
            <div class="modal-body">
                <div class="modal-section"><pre style="white-space:pre-wrap;margin:0">${text}</pre></div>
            </div>
            <div class="modal-footer">
                <button class="secondary" id="shareCloseBtn2">${T('close')}</button>
            </div>
        `);
        document.getElementById('shareCloseBtn2').onclick = closeModal;
    }
}

function saveCurrentLeaderboardRecordIfBetter() {
    const score = calculateScore();
    const name = state.player.name || 'Gladiator';
    addLeaderboardRecord(name, score);
}

// =====================================================
// Progression and level up
// =====================================================

function gainXp(amount) {
    let xpGain = roundInt(amount);

    if (state.progress.romanPatron) {
        xpGain = roundInt(xpGain * 1.2);
    }

    state.player.xp += xpGain;

    while (state.player.xp >= state.player.expToNextLevel) {
        state.player.xp -= state.player.expToNextLevel;
        levelUp();
    }

    saveState();
    renderHUD();
}

function levelUp() {
    state.player.level += 1;
    state.player.points.skill += 1;
    state.player.points.attribute += 2;

    state.player.maxHp = roundInt(state.player.maxHp + 10);
    state.player.maxMana = roundInt(state.player.maxMana + 5);
    state.player.hp = state.player.maxHp;
    state.player.mana = state.player.maxMana;

    state.player.expToNextLevel = roundInt(state.player.expToNextLevel * 1.35);

    renderHUD();
    renderStory(`
        ${Text.bold(Text.gold(T('newLevel')))}
        <br>${T('levelPoints')}
    `);
    pushLog(`${Text.gold(T('newLevel'))} ${Text.gray('(+1 level)')}`, 'achievement');
    showToast(T('newLevel'));

    saveState();
    renderMainActions();
    checkQuestCompletion();
    checkAchievements();
}

function openProgression() {
    renderProgressionModal();
}

function renderProgressionModal() {
    const p = state.player;
    const skillButtons = p.points.skill > 0 ? `
        <div class="modal-section">
            <h3>${T('skillPoints')}: ${p.points.skill}</h3>
            <div class="menu-buttons">
                <button class="good" id="skillDamageBtn">+ ${T('attack')}</button>
                <button class="good" id="skillHpBtn">+ HP</button>
                <button class="good" id="skillCritBtn">+ Crit</button>
            </div>
        </div>
    ` : '';

    const attrButtons = p.points.attribute > 0 ? `
        <div class="modal-section">
            <h3>${T('attributePoints')}: ${p.points.attribute}</h3>
            <div class="menu-buttons">
                <button class="good" id="attrStrengthBtn">+ ${T('strength')}</button>
                <button class="good" id="attrDexterityBtn">+ ${T('dexterity')}</button>
                <button class="good" id="attrIntelligenceBtn">+ ${T('intelligence')}</button>
            </div>
        </div>
    ` : '';

    showModal(`
        <h2 class="modal-title">🧠 ${T('progression')}</h2>
        <div class="modal-body">
            ${skillButtons || `<div class="modal-section subtle">${T('needPoints')}</div>`}
            ${attrButtons}
        </div>
        <div class="modal-footer">
            <button class="secondary" id="progressCloseBtn">${T('close')}</button>
        </div>
    `);

    const box = DOM.modalBox;
    const spendSkill = (applyFn) => {
        if (p.points.skill <= 0) return;
        p.points.skill -= 1;
        applyFn();
        saveState();
        renderHUD();
        renderProgressionModal();
        renderMainActions();
        checkQuestCompletion();
    };

    const spendAttr = (applyFn) => {
        if (p.points.attribute <= 0) return;
        p.points.attribute -= 1;
        applyFn();
        saveState();
        renderHUD();
        renderProgressionModal();
        renderMainActions();
        checkQuestCompletion();
    };

    const skillDamageBtn = box.querySelector('#skillDamageBtn');
    const skillHpBtn = box.querySelector('#skillHpBtn');
    const skillCritBtn = box.querySelector('#skillCritBtn');
    const attrStrengthBtn = box.querySelector('#attrStrengthBtn');
    const attrDexterityBtn = box.querySelector('#attrDexterityBtn');
    const attrIntelligenceBtn = box.querySelector('#attrIntelligenceBtn');
    const progressCloseBtn = box.querySelector('#progressCloseBtn');

    if (skillDamageBtn) skillDamageBtn.onclick = () => spendSkill(() => {
        state.player.bonuses.damageBonus += 2;
        pushLog(`${Text.green('+2')} ${T('attack')}`, 'good');
    });

    if (skillHpBtn) skillHpBtn.onclick = () => spendSkill(() => {
        state.player.maxHp = roundInt(state.player.maxHp + 20);
        state.player.hp = state.player.maxHp;
        pushLog(`${Text.green('+20')} HP`, 'good');
    });

    if (skillCritBtn) skillCritBtn.onclick = () => spendSkill(() => {
        state.player.bonuses.critBonus = roundInt((state.player.bonuses.critBonus + 0.03) * 1000) / 1000;
        pushLog(`${Text.green('+crit')}`, 'good');
    });

    if (attrStrengthBtn) attrStrengthBtn.onclick = () => spendAttr(() => {
        state.player.attributes.strength += 1;
        pushLog(`${Text.green('+1')} ${T('strength')}`, 'good');
    });

    if (attrDexterityBtn) attrDexterityBtn.onclick = () => spendAttr(() => {
        state.player.attributes.dexterity += 1;
        pushLog(`${Text.green('+1')} ${T('dexterity')}`, 'good');
    });

    if (attrIntelligenceBtn) attrIntelligenceBtn.onclick = () => spendAttr(() => {
        state.player.attributes.intelligence += 1;
        state.player.maxMana = roundInt(state.player.maxMana + 4);
        state.player.mana = Math.min(state.player.maxMana, state.player.mana + 4);
        pushLog(`${Text.green('+1')} ${T('intelligence')}`, 'good');
    });

    progressCloseBtn.onclick = closeModal;
}

function openPotionInventory() {
    const entries = Object.entries(state.player.potions || {});
    if (!entries.length) {
        showToast(T('noPotions'));
        return;
    }

    const list = entries.map(([id, qty]) => {
        const item = getItemById(id);
        return `
            <div class="card-row">
                <div>
                    <div>${getLocalizedName(item.name)} × ${qty}</div>
                    <div class="subtle">${getLocalizedDesc(item.desc)}</div>
                </div>
                <button class="good" data-use-potion="${id}">${T('usePotion')}</button>
            </div>
        `;
    }).join('');

    showModal(`
        <h2 class="modal-title">🧪 ${T('usePotion')}</h2>
        <div class="modal-body">
            <div class="modal-section list">${list}</div>
        </div>
        <div class="modal-footer">
            <button class="secondary" id="inventoryCloseBtn">${T('close')}</button>
        </div>
    `);

    const box = DOM.modalBox;
    box.querySelector('#inventoryCloseBtn').onclick = closeModal;
    box.querySelectorAll('[data-use-potion]').forEach(btn => {
        btn.onclick = () => usePotion(btn.getAttribute('data-use-potion'));
    });
}

function usePotion(itemId) {
    const qty = state.player.potions[itemId] || 0;
    if (qty <= 0) {
        showToast(T('noPotions'), 'warning');
        return;
    }

    const item = getItemById(itemId);
    if (!item) {
        showToast(T('noPotions'), 'warning');
        return;
    }

    state.player.potions[itemId] = qty - 1;
    if (state.player.potions[itemId] <= 0) delete state.player.potions[itemId];

    state.player.stats.potionsUsed += 1;

    if (item.category === 'health') {
        state.player.hp = Math.min(state.player.maxHp, roundInt(state.player.hp + item.value));
        pushLog(`${Text.green(getLocalizedName(item.name))} +${item.value} HP`, 'good');
    } else if (item.category === 'mana') {
        state.player.mana = Math.min(state.player.maxMana, roundInt(state.player.mana + item.value));
        pushLog(`${Text.blue(getLocalizedName(item.name))} +${item.value} MP`, 'good');
    } else if (item.category === 'attack') {
        state.player.buffs.attackBonus = item.value + Math.floor(state.player.attributes.strength / 2);
        state.player.buffs.attackTurns = item.turns || 3;
        pushLog(`${Text.red(getLocalizedName(item.name))} +${state.player.buffs.attackBonus} ATK`, 'good');
    } else if (item.category === 'defense') {
        state.player.buffs.defenseBonus = item.value + Math.floor(state.player.attributes.dexterity / 3);
        state.player.buffs.defenseTurns = item.turns || 3;
        pushLog(`${Text.blue(getLocalizedName(item.name))} +${state.player.buffs.defenseBonus} DEF`, 'good');
    }

    saveState();
    renderHUD();
    if (state.battle) {
        renderBattleScene();
    } else {
        renderMainActions();
    }
    checkAchievements();
    checkQuestCompletion();
    showToast(`${getLocalizedName(item.name)} ${T('used')}`);
    closeModal();
}

function calculateScore() {
	const p = state.player;
    if (!p) return 0;
    return roundInt(
        state.player.stats.wins * 100 +
        state.player.stats.bossWins * 1000 +
        calculateInventoryValue() +
        state.player.level * 50 +
        state.player.day * 10
    );
}

function calculateInventoryValue() {
    let value = 0;
    // Рахуємо вартість екіпірованої зброї та броні
    value += state.player.equipment.weapon?.sell || 0;
    value += state.player.equipment.armor?.sell || 0;

    // Рахуємо вартість усіх зіллів в інвентарі
    Object.entries(state.player.potions || {}).forEach(([id, qty]) => {
        const item = getItemById(id);
        value += (item?.sell || 0) * qty;
    });

    return roundInt(value);
}

function updateModalSelection() {
    const items = state.modalNavigation?.items;
    if (!items?.length) return;

    const selected =
        items[
            Math.max(
                0,
                Math.min(
                    state.modalNavigation.selectedIndex,
                    items.length - 1
                )
            )
        ];

    items.forEach(el =>
        el?.classList?.remove('keyboard-selected')
    );

    if (!selected) return;

    selected.classList.add('keyboard-selected');

    const container = DOM.modalBox;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const selectedRect = selected.getBoundingClientRect();
    const padding = 96;

    let targetY;

    if (selectedRect.top < containerRect.top + padding) {
        targetY =
            container.scrollTop +
            selectedRect.top -
            containerRect.top -
            padding;
    } else if (
        selectedRect.bottom >
        containerRect.bottom - padding
    ) {
        targetY =
            container.scrollTop +
            selectedRect.bottom -
            containerRect.bottom +
            padding;
    } else {
        return;
    }

    smoothScrollModalTo(targetY);
}

function smoothScrollModalTo(targetY) {
    const container = DOM.modalBox;
    if (!container) return;

    const maxScroll =
        container.scrollHeight -
        container.clientHeight;

    smoothScrollModalTo._targetY = Math.max(
        0,
        Math.min(targetY, maxScroll)
    );

    if (smoothScrollModalTo._running) {
        return;
    }

    smoothScrollModalTo._running = true;

    function animate() {
        const target =
            smoothScrollModalTo._targetY;

        const current =
            container.scrollTop;

        const distance =
            target - current;

        if (Math.abs(distance) < 0.5) {
            container.scrollTop = target;
            smoothScrollModalTo._running = false;
            return;
        }

        container.scrollTop =
            current + distance * 0.12;

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}