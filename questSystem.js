// Extracted quest / achievement system from game.js

window.activeQuestDialogue = window.activeQuestDialogue || null;

function getQuestById(questOrId) {
    if (!questOrId) return null;
    if (typeof questOrId === 'string') {
        return window.QUEST_DEFS.find(q => q.id === questOrId) || null;
    }

    return questOrId;
}

function getQuestDialogue(quest) {
    const resolved = getQuestById(quest);
    if (!resolved) return null;

    return window.QUEST_DIALOGUES?.[resolved.id] || null;
}

function appendQuestLog(message, type = 'info') {
    state.log.unshift({
        text: message,
        type,
        time: Date.now()
    });
    state.log = state.log.slice(0, 10);
    renderLog();
}

function applyQuestRewards(quest) {
    const resolved = getQuestById(quest);
    if (!resolved) return;

    if (typeof resolved.reward === 'function') {
        resolved.reward(state);
    }

    const rewards = resolved.rewards;
    if (!rewards || typeof rewards !== 'object') return;

    if (Number.isFinite(rewards.gold)) {
        state.player.gold = roundInt(state.player.gold + rewards.gold);
    }
    if (Number.isFinite(rewards.xp)) {
        state.player.xp = roundInt(state.player.xp + rewards.xp);
    }
    if (Number.isFinite(rewards.hp)) {
        state.player.hp = roundInt(clamp(state.player.hp + rewards.hp, 0, state.player.maxHp));
    }
    if (Number.isFinite(rewards.mana)) {
        state.player.mana = roundInt(clamp(state.player.mana + rewards.mana, 0, state.player.maxMana));
    }
}

function getQuestRewardText(quest) {
    const resolved = getQuestById(quest);
    if (!resolved || !resolved.rewards) return '';

    const parts = [];
    const rewards = resolved.rewards;

    if (Number.isFinite(rewards.gold)) parts.push(`${rewards.gold > 0 ? '+' : ''}${rewards.gold} ${T('gold')}`);
    if (Number.isFinite(rewards.xp)) parts.push(`${rewards.xp > 0 ? '+' : ''}${rewards.xp} ${T('xp')}`);
    if (Number.isFinite(rewards.hp)) parts.push(`${rewards.hp > 0 ? '+' : ''}${rewards.hp} ${T('health')}`);
    if (Number.isFinite(rewards.mana)) parts.push(`${rewards.mana > 0 ? '+' : ''}${rewards.mana} ${T('mana')}`);

    return parts.join(' · ');
}

function openQuestDialogue(questOrId) {
    const quest = getQuestById(questOrId);
    const dialogue = getQuestDialogue(quest);
    if (!quest || !dialogue) return;

    const qState = state.progress.quests[quest.id] || (state.progress.quests[quest.id] = {
        done: false,
        claimed: false,
        dialogueSeen: false
    });

    qState.done = true;
    qState.dialogueSeen = true;
    window.activeQuestDialogue = quest.id;

    const speaker = getLocalizedDesc(dialogue.speaker || quest.names);
    const lines = (dialogue.lines || [])
        .map(line => `<p>${getLocalizedDesc(line)}</p>`)
        .join('');

    const choices = (dialogue.choices || []).map((choice, index) => `
        <button class="quest-choice good" type="button" data-choice-index="${index}">
            ${getLocalizedDesc(choice.text)}
        </button>
    `).join('');

    showModal(`
        <h2 class="modal-title">${speaker}</h2>
        <div class="modal-body">
            <div class="modal-section">
                ${lines}
            </div>

            <div class="modal-section list quest-choice-list">
                ${choices}
            </div>
        </div>
        <div class="modal-footer">
            <button class="secondary" id="questDialogueCloseBtn">${T('close')}</button>
        </div>
    `);

    const closeBtn = document.getElementById('questDialogueCloseBtn');
    if (closeBtn) closeBtn.onclick = closeModal;

    DOM.modalBox.querySelectorAll('[data-choice-index]').forEach(btn => {
        btn.onclick = () => {
            const index = Number(btn.dataset.choiceIndex);
            chooseQuestOption(quest.id, index);
        };
    });
}

window.openQuestDialogue = openQuestDialogue;
window.getQuestDialogue = getQuestDialogue;
window.cancelActiveQuestDialogue = function cancelActiveQuestDialogue() {
    window.activeQuestDialogue = null;
};

window.chooseQuestOption = function chooseQuestOption(questId, choiceIndex) {
    const quest = getQuestById(questId);
    if (!quest) return;

    const dialogue = getQuestDialogue(quest);
    const choice = dialogue?.choices?.[choiceIndex];
    if (!choice) return;

    const qState = state.progress.quests[quest.id] || (state.progress.quests[quest.id] = {
        done: false,
        claimed: false,
        dialogueSeen: false
    });

    if (typeof choice.effect === 'function') {
        choice.effect(state);
    }

    applyQuestRewards(quest);

    qState.done = true;
    qState.claimed = true;
    qState.dialogueSeen = true;
    window.activeQuestDialogue = null;

    saveState();
    renderHUD();
    renderMainActions();

    const resultText = getLocalizedDesc(choice.result);

    showModal(`
        <h2 class="modal-title">✅ ${getLocalizedName(quest.names)}</h2>
        <div class="modal-body">
            <div class="modal-section">${resultText}</div>
        </div>
        <div class="modal-footer">
            <button class="secondary" id="questResultCloseBtn">${T('close')}</button>
        </div>
    `);

    const closeBtn = document.getElementById('questResultCloseBtn');
    if (closeBtn) closeBtn.onclick = closeModal;
};;

function checkQuestCompletion() {
    let changed = false;
    let questToOpen = null;

    for (const quest of window.QUEST_DEFS) {
        const qState = state.progress.quests[quest.id];
        if (!qState || qState.claimed) continue;
        if (typeof quest.trigger !== 'function' || !quest.trigger(state)) continue;

        if (!qState.done) {
            qState.done = true;
            changed = true;
        }

        const questName = getLocalizedName(quest.names);

        if (getQuestDialogue(quest)) {
            if (!qState.dialogueSeen) {
                qState.dialogueSeen = true;
                changed = true;
                appendQuestLog(`${Text.gold('📜')} ${T('questComplete')}: ${questName}`, 'achievement');
                showToast(`${T('questComplete')}: ${questName}`);
                questToOpen = quest;
            }
            continue;
        }

        applyQuestRewards(quest);
        qState.claimed = true;
        changed = true;
        appendQuestLog(`${Text.gold('📜')} ${T('questComplete')}: ${questName}`, 'achievement');
        showToast(`${T('questComplete')}: ${questName}`);
    }

    if (changed) {
        saveState();
        renderHUD();
    }

    if (questToOpen && window.activeQuestDialogue !== questToOpen.id) {
        openQuestDialogue(questToOpen);
    }
}

function checkAchievements() {
    let changed = false;

    window.ACHIEVEMENT_DEFS.forEach(a => {
        if (!state.progress.achievements[a.id] && a.check(state)) {
            state.progress.achievements[a.id] = true;
            const name = getLocalizedName(a.names);
            const desc = getLocalizedDesc(a.descriptions);
            appendQuestLog(`${Text.gold('🏆')} ${T('achievementComplete')}: ${name} — ${desc}`, 'achievement');
            showToast(`${T('achievementComplete')}: ${name}`);
            changed = true;
        }
    });

    if (changed) {
        saveState();
    }
}
