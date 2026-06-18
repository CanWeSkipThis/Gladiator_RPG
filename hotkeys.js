document.addEventListener('keydown', (event) => {
    if (event.key === 'Control') {
        updateCtrlHotkeyState(true);
        return;
    }

    if (event.key === 'Escape' && !DOM.modalOverlay.classList.contains('hidden')) {
        closeModal();
        return;
    }

    if (event.altKey || event.metaKey) {
        return;
    }

    if (isEditableTarget(event.target)) {
        return;
    }

    const action = handleHotkeyAction(event.code);
    if (action) {
        event.preventDefault();
        action();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'Control' || !event.ctrlKey) {
        updateCtrlHotkeyState(false);
    }
});

window.addEventListener('blur', () => updateCtrlHotkeyState(false));
document.addEventListener('visibilitychange', () => {
    if (document.hidden) updateCtrlHotkeyState(false);
});

let ctrlHotkeysVisible = false;

function makeButtonWithHotkey({ id, cls = 'secondary', label, hotkey = '', extraClass = '' }) {
    const classes = [cls, extraClass, hotkey ? 'hotkey-button' : ''].filter(Boolean).join(' ');
    const hotkeyAttr = hotkey ? ` data-hotkey="${hotkey}"` : '';
    return `<button class="${classes}" id="${id}" type="button"${hotkeyAttr}><span>${label}</span></button>`;
}

function isEditableTarget(target) {
    if (!target || !target.tagName) return false;
    const tag = target.tagName.toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function getCurrentHotkeyEntries() {
    if (state.modalContext === 'battlePreview') {
        return [
            { combo: 'F', label: T('fightNow') },
            { combo: 'R', label: T('refreshOpponent') },
            { combo: 'B', label: T('back') }
        ];
    }

    if (getCurrentScreen() === 'menu') {
        const hasSave = hasSavedGame();
        return [
            { combo: 'N', label: T('newGame'), available: true },
            { combo: 'C', label: T('continueGame'), available: hasSave },
            { combo: 'A', label: T('achievements'), available: true },
            { combo: 'L', label: T('leaderboard'), available: true },
            { combo: 'P', label: T('settings'), available: true },
			{ combo: 'U', label: T('account'), available: true }
        ].filter(item => item.available);
    }

    if (state.battle) {
        return [
            { combo: 'A', label: T('attack'), available: true },
            { combo: 'X', label: T('specialAttack'), available: true },
            { combo: 'I', label: T('usePotion'), available: true },
            { combo: 'F', label: T('flee'), available: true }
        ];
    }

    const boss = getAvailableBoss(state);
    return [
        { combo: 'A', label: T('arena'), available: true },
        { combo: 'B', label: T('bossArena'), available: Boolean(boss) },
        { combo: 'S', label: T('shop'), available: true },
        { combo: 'R', label: T('sleep'), available: true },
        { combo: 'I', label: T('usePotion'), available: true },
        { combo: 'U', label: T('progression'), available: (state.player.points.skill + state.player.points.attribute) > 0 },
        { combo: 'C', label: T('characteristics'), available: true },
        { combo: 'Q', label: T('quests'), available: true },
        { combo: 'T', label: T('stats'), available: true },
        { combo: 'E', label: T('achievements'), available: true },
        { combo: 'L', label: T('leaderboard'), available: true },
        { combo: 'P', label: T('settings'), available: true },
        { combo: 'M', label: T('menu'), available: true }
    ].filter(item => item.available);
}

function renderHotkeyOverlay() {
    if (!DOM.hotkeyOverlay) return;

    const show = ctrlHotkeysVisible && DOM.modalOverlay.classList.contains('hidden');
    if (!show) {
        DOM.hotkeyOverlay.classList.add('hidden');
        DOM.hotkeyOverlay.innerHTML = '';
        return;
    }

    const entries = getCurrentHotkeyEntries();
    if (!entries.length) {
        DOM.hotkeyOverlay.classList.add('hidden');
        DOM.hotkeyOverlay.innerHTML = '';
        return;
    }

    DOM.hotkeyOverlay.innerHTML = `
        <div class="hotkey-overlay-card">
            <div class="hotkey-overlay-title">${T('hotkeys')}</div>
            <div class="hotkey-overlay-subtitle">${T('holdCtrlForHotkeys')}</div>
            <div class="hotkey-overlay-list">
                ${entries.map(item => `
                    <div class="hotkey-row">
                        <span>${item.label}</span>
                        <span class="hotkey-badge">${item.combo}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    DOM.hotkeyOverlay.classList.remove('hidden');
}

function handleHotkeyAction(key) {
    const code = String(key || '');
    const resolve = (name) => (typeof window[name] === 'function' ? window[name] : null);
	
    if (
        state.modalContext === 'shop' ||
        state.modalContext === 'equipmentShop' ||
        state.modalContext === 'potionShop' ||
        state.modalContext === 'saveConflict' || 
		state.modalContext === 'account'
    ) {
		if (code === 'ArrowUp') {
            state.modalNavigation.selectedIndex--;

        if (state.modalNavigation.selectedIndex < 0) {
            state.modalNavigation.selectedIndex = state.modalNavigation.items.length - 1;
        }

    updateModalSelection();

    return () => {};
	}
	if (code === 'ArrowDown') {
        state.modalNavigation.selectedIndex++;

        if (
            state.modalNavigation.selectedIndex >=
            state.modalNavigation.items.length
        ) {
            state.modalNavigation.selectedIndex = 0;
        }

        updateModalSelection();

        return () => {};
    }
	
	if (code === 'Enter') {
        return () => {
            const button =
                state.modalNavigation.items[
                    state.modalNavigation.selectedIndex
                ];

            button?.click();
        };
    }
	
	if (code === 'KeyB') {
    return closeModal;
    }
}
	
	if (state.modalContext === 'battlePreview') {
    const previewActions = {
        KeyF: () => document.getElementById('battlePreviewFightBtn')?.click(),
        KeyR: () => document.getElementById('battlePreviewRefreshBtn')?.click(),
        KeyB: () => document.getElementById('battlePreviewBackBtn')?.click()
    };

    return previewActions[code] || null;
}

    if (getCurrentScreen() === 'menu') {
        const hasSave = hasSavedGame();
        const menuActions = {
            KeyN: resolve('startNewGame'),
            KeyC: hasSave ? resolve('continueGame') : null,
            KeyA: resolve('showAchievements'),
            KeyL: resolve('showLeaderboard'),
            KeyP: resolve('openSettings'),
            KeyU: resolve('openAccountMenu')
        };
        return menuActions[code] || null;
    }

    if (state.battle) {
        const battleActions = {
            'a': () => battleAction(false),
            'x': () => battleAction(true),
            'i': resolve('openPotionInventory'),
            'f': resolve('fleeBattle')
        };
        return battleActions[code] || null;
    }

    const bossAvailable = Boolean(typeof window.getAvailableBoss === 'function' ? window.getAvailableBoss(state) : null);
    const gameActions = {
    KeyA: resolve('enterArena') || resolve('startBattle'),
    KeyB: bossAvailable ? resolve('enterBossArena') : null,
    KeyS: resolve('openShopHub'),
    KeyR: resolve('sleep'),
    KeyI: resolve('openPotionInventory'),
    KeyU: (state.player.points.skill + state.player.points.attribute) > 0
        ? resolve('openProgression')
        : null,
    KeyC: resolve('showCharacterSheet'),
    KeyQ: resolve('showQuests'),
    KeyT: resolve('showStats'),
    KeyE: resolve('showAchievements'),
    KeyL: resolve('showLeaderboard'),
    KeyP: resolve('openSettings'),
    KeyM: resolve('goToMenu')
};
    return gameActions[code] || null;
}

function updateCtrlHotkeyState(isDown) {
    ctrlHotkeysVisible = isDown;
    renderHotkeyOverlay();
}