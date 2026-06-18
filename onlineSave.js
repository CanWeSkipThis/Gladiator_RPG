const SUPABASE_SAVE_TABLE = 'game_saves';

async function hasOnlineSave() {
    await window.supabaseReady;

    const user = await getCurrentUser();
    if (!user) {
        return false;
    }

    const { data, error } = await window.supabase
        .from(SUPABASE_SAVE_TABLE)
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('Online save check failed:', error);
        return false;
    }

    return !!data;
}

async function saveStateOnline() {
    await window.supabaseReady;

    const user = await getCurrentUser();
    if (!user) return false;

    const payload = {
        player: state.player,
        settings: state.settings,
        progress: state.progress,
        log: state.log,
        leaderboard: state.leaderboard,
        mode: state.mode,
        savedAt: Date.now()
    };

    const { error } = await window.supabase
        .from(SUPABASE_SAVE_TABLE)
        .upsert(
            {
                user_id: user.id,
                data: payload,
                updated_at: new Date().toISOString()
            },
            { onConflict: 'user_id' }
        );

    if (error) {
        console.error('Online save failed:', error);
        return false;
    }

    return true;
}

async function loadStateOnline() {
    await window.supabaseReady;

    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await window.supabase
        .from(SUPABASE_SAVE_TABLE)
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('Online load failed:', error);
        return false;
    }

    if (!data?.data) return false;

    const parsed = data.data;
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
        leaderboard: Array.isArray(parsed.leaderboard) ? parsed.leaderboard : [],
        battle: null,
        loaded: true
    };

    normalizeLoadedState();
    window.gameSettings = state.settings;
    window.gameState = state;
    return true;
}

async function getOnlineSaveInfo() {
    await window.supabaseReady;

    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await window.supabase
        .from(SUPABASE_SAVE_TABLE)
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error || !data?.data) {
        return null;
    }

    return {
        savedAt: data.data.savedAt || null
    };
}

window.getOnlineSaveInfo = getOnlineSaveInfo;

function openSaveConflictModal(localInfo, onlineInfo, onSelect) {
	const formatDate = value => {
        if (!value) {
            return 'Невідомо';
        }

        return new Date(value).toLocaleString();
    };

    const localDate = formatDate(localInfo?.savedAt);
    const onlineDate = formatDate(onlineInfo?.savedAt);

    const localNewer =
        localInfo?.savedAt &&
        onlineInfo?.savedAt &&
        localInfo.savedAt > onlineInfo.savedAt;

    const onlineNewer =
        localInfo?.savedAt &&
        onlineInfo?.savedAt &&
        onlineInfo.savedAt > localInfo.savedAt;
    showModal(`
        <h2 class="modal-title">💾 Знайдено два сейви</h2>

        <div class="modal-body">

            <div class="modal-section">
                Виявлено локальний та хмарний сейв.
            </div>

            <div class="modal-section">
                <strong>Локальний сейв</strong>
                ${localNewer ? ' ⭐ Новіший' : ''}
                <br>
                ${localDate}
            </div>

            <div class="modal-section">
                <strong>Хмарний сейв</strong>
                ${onlineNewer ? ' ⭐ Новіший' : ''}
                <br>
                ${onlineDate}
            </div>

            <div class="modal-section list">
                <button class="good" id="useLocalSaveBtn">
                    Завантажити локальний
                </button>

            <button class="good" id="useOnlineSaveBtn">
                Завантажити хмарний
            </button>
        </div>

    </div>
    `);

    const box = DOM.modalBox;
	
	const closeBtn = DOM.modalBox.querySelector('#modalCloseGlobal');

    if (closeBtn) {
        closeBtn.remove();
    }

    box.querySelector('#useLocalSaveBtn').onclick = () => {
        closeModal();
        onSelect('local');
    };

    box.querySelector('#useOnlineSaveBtn').onclick = () => {
        closeModal();
        onSelect('online');
    };
    state.modalContext = 'saveConflict';
	
    state.modalNavigation = {
        context: 'saveConflict',
        selectedIndex: 0,
        items: [
            box.querySelector('#useLocalSaveBtn'),
            box.querySelector('#useOnlineSaveBtn')
        ]
    };

    updateModalSelection();
}

async function chooseSaveSource() {
    const localInfo = getLocalSaveInfo();
    const onlineInfo = await getOnlineSaveInfo();

    return new Promise(resolve => {
        openSaveConflictModal(
            localInfo,
            onlineInfo,
            resolve
        );
    });
}

async function submitScoreToLeaderboard() {
    const user = await getCurrentUser();
    if (!user) return false;

    const record = {
        user_id: user.id,
        name: state.player.name || 'Gladiator',
        score: calculateScore(),
        savedAt: Date.now()
    };

    const { error } = await window.supabase
        .from('leaderboard_records')
        .upsert(record, { onConflict: 'user_id' });

    if (error) {
        console.error('Leaderboard submit failed:', error);
        return false;
    }

    return true;
}

async function updateHeaderStatus() {
    const accountStatus =
        document.getElementById('accountStatus');

    if (!accountStatus) return;

    if (state.screen === 'game') {
        accountStatus.classList.add('hidden');
        return;
    }

    accountStatus.classList.remove('hidden');

    const user = await getCurrentUser();

    if (user) {
        accountStatus.textContent = `☁ ${user.email}`;
    } else {
        accountStatus.textContent = '💾 Гість';
    }

    accountStatus.onclick = openAccountMenu;
}

window.hasOnlineSave = hasOnlineSave;

window.chooseSaveSource = chooseSaveSource;

window.saveStateOnline = saveStateOnline;
window.loadStateOnline = loadStateOnline;