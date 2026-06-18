// =====================================================
// Gladiator RPG core bootstrap
// Keeps shared utilities, DOM bindings and app startup.
// Game systems are split into separate modules.
// =====================================================

const GAME_VERSION = '0.16.5';
const SAVE_KEY = 'gladiator_rpg_save_v2';
const SETTINGS_KEY = 'gladiator_rpg_settings_v2';
const LEADERBOARD_KEY = 'gladiator_rpg_leaderboard_v2';

const DOM = {
    menuScreen: document.getElementById('menuScreen'),
    gameScreen: document.getElementById('gameScreen'),
    menuButtons: document.getElementById('menuButtons'),
    appTitle: document.getElementById('appTitle'),
    menuHeading: document.getElementById('menuHeading'),
    menuSubtitle: document.getElementById('menuSubtitle'),
    hudLeft: document.getElementById('hudLeft'),
    hudRight: document.getElementById('hudRight'),
    story: document.getElementById('story'),
    actions: document.getElementById('actions'),
    secondaryInfo: document.getElementById('secondaryInfo'),
    actionLog: document.getElementById('actionLog'),
    journalTitle: document.getElementById('journalTitle'),
    journalCount: document.getElementById('journalCount'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalBox: document.getElementById('modalBox'),
    toast: document.getElementById('toast'),
    hotkeyOverlay: document.getElementById('hotkeyOverlay'),
    btnSettingsTop: document.getElementById('btnSettingsTop'),
    btnMenuTop: document.getElementById('btnMenuTop')
};

let state = null;
window.gameSettings = null;
window.gameState = null;

// =====================================================
// Helpers shared by multiple modules
// =====================================================

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function hasSavedGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return Boolean(parsed && typeof parsed === 'object' && parsed.player && parsed.progress);
    } catch (error) {
        return false;
    }
}

function roundInt(value) {
    return Math.round(value);
}

function percent(value) {
    return `${Math.round(value * 100)}%`;
}

function localItemName(item) {
    return getLocalizedName(item?.name || item);
}

function localItemDesc(item) {
    return getLocalizedDesc(item?.desc || item);
}

function stripHtml(text) {
    return String(text).replace(/<[^>]*>/g, '');
}

window.T = window.T || ((key, vars = {}) => key);

// =====================================================
// App bootstrap
// =====================================================

async function init() {
const offlineExists = hasSavedGame();
const onlineExists = await hasOnlineSave();

if (!state) {
    state = createDefaultState();
    window.gameSettings = state.settings;
    window.gameState = state;
}

if (offlineExists && onlineExists) {
    const choice = await chooseSaveSource();

    if (choice === 'online') {
        await loadStateOnline();
        saveState();
    } else {
        loadState();
        await saveStateOnline();
    }
} else if (offlineExists) {
    loadState();
} else if (onlineExists) {
    await loadStateOnline();
    saveState();
} else {
    state = createDefaultState();
    window.gameSettings = state.settings;
    window.gameState = state;
}

    applySettings();
    renderMenu();
    renderHUD();
    renderStory(getIntroText());
    renderSecondaryInfo('');
    renderLog();
    renderDynamicScreenLabels();

    DOM.btnSettingsTop.onclick = openSettings;
    DOM.btnMenuTop.onclick = goToMenu;

    if (DOM.modalOverlay) {
        DOM.modalOverlay.onclick = function (e) {
            if (e.target === DOM.modalOverlay) {
                if (typeof closeModal === 'function') closeModal();
                else if (window.closeModal) window.closeModal();
            }
        };
    }

    if (state.screen === 'game') {
        DOM.menuScreen.classList.add('hidden');
        DOM.gameScreen.classList.remove('hidden');
    } else {
           showMenuScreen();
    }
    await updateHeaderStatus();
}

window.addEventListener('DOMContentLoaded', async () => {
    await init();
});