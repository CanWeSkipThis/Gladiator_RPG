// Extracted save / state system from game.js

// =====================================================
// Default state
// =====================================================

function createDefaultPlayer() {
    return {
        name: 'Gladiator',
        level: 1,
        xp: 0,
        expToNextLevel: 100,
        hp: 100,
        maxHp: 100,
        mana: 30,
        maxMana: 30,
        gold: 50,
        day: 1,
        attributes: {
            strength: 5,
            dexterity: 5,
            intelligence: 5
        },
        stats: {
            hits: 0,
            wins: 0,
            losses: 0,
            potionsUsed: 0,
            bossWins: 0,
            sleeps: 0
        },
        points: {
            skill: 0,
            attribute: 0
        },
        equipment: {
            weapon: clone(getItemById('weapon_fists')),
            armor: clone(getItemById('armor_cloth'))
        },
        potions: {},
        bonuses: {
            damageBonus: 0,
            critBonus: 0
        },
        buffs: {
            attackBonus: 0,
            defenseBonus: 0,
            attackTurns: 0,
            defenseTurns: 0
        }
    };
}

function createDefaultProgress() {
    const quests = {};
    window.QUEST_DEFS.forEach(q => {
        quests[q.id] = {
            done: false,
            claimed: false,
            dialogueSeen: false
        };
    });

    const achievements = {};
    window.ACHIEVEMENT_DEFS.forEach(a => {
        achievements[a.id] = false;
    });

    const bosses = {};
    window.BOSSES.forEach(b => {
        bosses[b.id] = { won: false };
    });

    return {
        quests,
        achievements,
        bosses,
        purchases: 0,
        romanPatron: false,
        endlessUnlocked: false,
        selectedLanguage: 'uk',
        lastScore: 0
    };
}

function createDefaultState() {
    return {
        player: createDefaultPlayer(),
        settings: clone(DEFAULT_SETTINGS),
        progress: createDefaultProgress(),
        log: [],
		screen: 'menu',
        leaderboard: [],
        battle: null,
        mode: 'campaign',
        loaded: false
    };
}

function resetToHardDefaults() {
    state = createDefaultState();
    window.gameSettings = state.settings;
    window.gameState = state;
    applySettings();
    saveState();
    refreshAllUI();
}

// =====================================================
// Persistence
// =====================================================

function saveState() {
    const payload = {
        player: state.player,
        settings: state.settings,
        progress: state.progress,
        log: state.log,
        leaderboard: state.leaderboard,
        mode: state.mode,
        savedAt: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(state.leaderboard));
	
	if (window.getCurrentUser && window.saveStateOnline) {
        saveStateOnline().catch(error => {
            console.error('Online save failed:', error);
        });
    }
}

function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
}

function hasSavedGame() {
    try {
        return localStorage.getItem(SAVE_KEY) !== null;
    } catch (error) {
        console.warn("Не вдалося перевірити localStorage:", error);
        return false;
    }
}

function loadState() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
        state = createDefaultState();
        const settingsRaw = localStorage.getItem(SETTINGS_KEY);
        if (settingsRaw) {
            try {
                state.settings = {
                    ...state.settings,
                    ...JSON.parse(settingsRaw)
                };
            } catch (error) {
                console.warn('Failed to load settings', error);
            }
        }
        window.gameSettings = state.settings;
        window.gameState = state;
        return false;
    }

    try {
        const parsed = JSON.parse(raw);
        const fresh = createDefaultState();

        state = {
            ...fresh,
            ...parsed,
            player: {
                ...fresh.player,
                ...(parsed.player || {}),
                attributes: {
                    ...fresh.player.attributes,
                    ...((parsed.player && parsed.player.attributes) || {})
                },
                stats: {
                    ...fresh.player.stats,
                    ...((parsed.player && parsed.player.stats) || {})
                },
                points: {
                    ...fresh.player.points,
                    ...((parsed.player && parsed.player.points) || {})
                },
                equipment: {
                    ...fresh.player.equipment,
                    ...((parsed.player && parsed.player.equipment) || {})
                },
                buffs: {
                    ...fresh.player.buffs,
                    ...((parsed.player && parsed.player.buffs) || {})
                },
                potions: {
                    ...((parsed.player && parsed.player.potions) || {})
                }
            },
            settings: {
                ...fresh.settings,
                ...(parsed.settings || {})
            },
            progress: {
                ...fresh.progress,
                ...(parsed.progress || {}),
                quests: {
                    ...fresh.progress.quests,
                    ...((parsed.progress && parsed.progress.quests) || {})
                },
                achievements: {
                    ...fresh.progress.achievements,
                    ...((parsed.progress && parsed.progress.achievements) || {})
                },
                bosses: {
                    ...fresh.progress.bosses,
                    ...((parsed.progress && parsed.progress.bosses) || {})
                }
            },
            log: Array.isArray(parsed.log) ? parsed.log : [],
            leaderboard: Array.isArray(parsed.leaderboard)
                ? parsed.leaderboard
                : JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]'),
            battle: null,
            loaded: true
        };

        normalizeLoadedState();
        window.gameSettings = state.settings;
        window.gameState = state;
        return true;
    } catch (error) {
        console.error('Failed to load save', error);
        state = createDefaultState();
        window.gameSettings = state.settings;
        window.gameState = state;
        return false;
    }
}

function normalizeLoadedState() {
    const p = state.player;

    p.hp = roundInt(clamp(Number(p.hp) || 0, 0, Number(p.maxHp) || 100));
    p.maxHp = roundInt(Number(p.maxHp) || 100);
    p.mana = roundInt(clamp(Number(p.mana) || 0, 0, Number(p.maxMana) || 30));
    p.maxMana = roundInt(Number(p.maxMana) || 30);
    p.gold = roundInt(Number(p.gold) || 0);
    p.level = roundInt(Number(p.level) || 1);
    p.xp = roundInt(Number(p.xp) || 0);
    p.expToNextLevel = roundInt(Number(p.expToNextLevel) || 100);
    p.day = roundInt(Number(p.day) || 1);

    p.attributes.strength = roundInt(Number(p.attributes.strength) || 5);
    p.attributes.dexterity = roundInt(Number(p.attributes.dexterity) || 5);
    p.attributes.intelligence = roundInt(Number(p.attributes.intelligence) || 5);

    p.stats.hits = roundInt(Number(p.stats.hits) || 0);
    p.stats.wins = roundInt(Number(p.stats.wins) || 0);
    p.stats.losses = roundInt(Number(p.stats.losses) || 0);
    p.stats.potionsUsed = roundInt(Number(p.stats.potionsUsed) || 0);
    p.stats.bossWins = roundInt(Number(p.stats.bossWins) || 0);
    p.stats.sleeps = roundInt(Number(p.stats.sleeps) || 0);

    p.points.skill = roundInt(Number(p.points.skill) || 0);
    p.points.attribute = roundInt(Number(p.points.attribute) || 0);

    p.equipment.weapon = normalizeItem(p.equipment.weapon, 'weapon_fists');
    p.equipment.armor = normalizeItem(p.equipment.armor, 'armor_cloth');

    if (!p.bonuses || typeof p.bonuses !== 'object') p.bonuses = { damageBonus: 0, critBonus: 0 };
    p.bonuses.damageBonus = roundInt(Number(p.bonuses.damageBonus) || 0);
    p.bonuses.critBonus = Number(p.bonuses.critBonus) || 0;

    p.buffs.attackBonus = roundInt(Number(p.buffs.attackBonus) || 0);
    p.buffs.defenseBonus = roundInt(Number(p.buffs.defenseBonus) || 0);
    p.buffs.attackTurns = roundInt(Number(p.buffs.attackTurns) || 0);
    p.buffs.defenseTurns = roundInt(Number(p.buffs.defenseTurns) || 0);

    if (!p.potions || typeof p.potions !== 'object') p.potions = {};
    if (!state.progress) state.progress = createDefaultProgress();

    window.QUEST_DEFS.forEach(q => {
        if (!state.progress.quests[q.id]) {
            state.progress.quests[q.id] = { done: false, claimed: false, dialogueSeen: false };
            return;
        }
        if (typeof state.progress.quests[q.id].dialogueSeen !== 'boolean') {
            state.progress.quests[q.id].dialogueSeen = false;
        }
    });

    window.ACHIEVEMENT_DEFS.forEach(a => {
        if (typeof state.progress.achievements[a.id] !== 'boolean') {
            state.progress.achievements[a.id] = false;
        }
    });

    window.BOSSES.forEach(b => {
        if (!state.progress.bosses[b.id]) state.progress.bosses[b.id] = { won: false };
    });

    state.log = (state.log || []).slice(0, 10);
    state.mode = state.mode || 'campaign';
}

function normalizeItem(item, fallbackId) {
    const base = item && item.id ? getItemById(item.id) : null;
    return clone(base || getItemById(fallbackId));
}

function resetProgress() {
    if (!confirm(`${T('progressReset')}?`)) {
        return;
    }

    closeModal();
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(LEADERBOARD_KEY);

    state = createDefaultState();
    window.gameSettings = state.settings;
    window.gameState = state;

    applySettings();
    showMenuScreen();
    DOM.actions.innerHTML = '';
    renderHUD();
    renderStory(getIntroText());
    renderSecondaryInfo('');
    renderLog();
    renderMenu();
    showToast(T('progressReset'), 'warning');
}

function getLocalSaveInfo() {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw);

        return {
            savedAt: parsed.savedAt || null
        };
    } catch {
        return null;
    }
}

window.getLocalSaveInfo = getLocalSaveInfo;

function getCurrentScreen() {
    return state?.screen || 'menu';
}

window.getCurrentScreen = getCurrentScreen;