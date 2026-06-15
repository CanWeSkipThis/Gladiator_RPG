
// =====================================================
// 5 random sleep events
// =====================================================

window.SLEEP_EVENTS = [
    {
        id: 'event_restful',
        weight: 3,
        kind: 'good',
        names: {
            uk: 'Спокійний сон',
            en: 'Peaceful sleep'
        },
        apply: (state) => {
            const heal = Math.round(12 + state.player.attributes.intelligence * 1.5 + (state.progress.romanPatron ? 6 : 0));
            const mana = Math.round(10 + state.player.attributes.intelligence);
            state.player.hp = Math.min(state.player.maxHp, Math.round(state.player.hp + heal));
            state.player.mana = Math.min(state.player.maxMana, Math.round(state.player.mana + mana));
            return {
                hp: heal,
                mana
            };
        },
        text: {
            uk: 'Тіло відновилося під час спокійного сну.',
            en: 'Your body recovered during a peaceful sleep.'
        }
    },
    {
        id: 'event_training_dream',
        weight: 3,
        kind: 'good',
        names: {
            uk: 'Сон тренування',
            en: 'Training dream'
        },
        apply: (state) => {
            const xp = Math.round(10 + state.player.level * 2 + (state.progress.romanPatron ? 10 : 0));
            state.player.xp += xp;
            return { xp };
        },
        text: {
            uk: 'Уві сні ти тренувався з тінями та отримав досвід.',
            en: 'You trained with shadows in your sleep and gained experience.'
        }
    },
    {
        id: 'event_lucky_find',
        weight: 2,
        kind: 'neutral',
        names: {
            uk: 'Щаслива знахідка',
            en: 'Lucky find'
        },
        apply: (state) => {
            const gold = Math.round(15 + state.player.level * 3);
            state.player.gold += gold;
            return { gold };
        },
        text: {
            uk: 'Під подушкою знайшовся дрібний скарб.',
            en: 'A small treasure was found under the pillow.'
        }
    },
    {
        id: 'event_nightmare',
        weight: 1,
        kind: 'bad',
        names: {
            uk: 'Нічний кошмар',
            en: 'Nightmare'
        },
        apply: (state) => {
            const loss = Math.round(8 + state.player.level);
            state.player.hp = Math.max(1, Math.round(state.player.hp - loss));
            return { loss };
        },
        text: {
            uk: 'Тобі приснився жахливий бій, після якого ти прокинувся стомленим.',
            en: 'A terrible fight haunted your dream and left you exhausted.'
        }
    },
    {
        id: 'event_tavern_feast',
        weight: 1,
        kind: 'good',
        names: {
            uk: 'Свято у таверні',
            en: 'Tavern feast'
        },
        apply: (state) => {
            const heal = Math.round(20 + (state.progress.romanPatron ? 10 : 0));
            state.player.hp = Math.min(state.player.maxHp, Math.round(state.player.hp + heal));
            state.player.gold = Math.max(0, state.player.gold - 5);
            return { hp: heal, gold: -5 };
        },
        text: {
            uk: 'Тебе запросили на нічну вечерю, що поліпшила відновлення.',
            en: 'A night feast improved your recovery.'
        }
    }
];

window.pickSleepEvent = function pickSleepEvent() {
    let totalWeight = 0;

    for (const ev of window.SLEEP_EVENTS) {
        totalWeight += ev.weight;
    }

    let roll = Math.random() * totalWeight;

    for (const ev of window.SLEEP_EVENTS) {
        roll -= ev.weight;
        if (roll < 0) return ev;
    }

    return window.SLEEP_EVENTS[0];
};