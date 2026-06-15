// Quest definitions
// Compatibility:
// - description: used in quest details
// =====================================================

window.QUEST_DEFS = [
    {
        id: 'quest_first_victory',
        stage: 'early',
        names: { uk: 'Перша перемога', en: 'First Victory' },
        description: {
            uk: 'Твій перший бій на арені завершився перемогою, і хоча натовп ще не встиг запам’ятати твоє ім’я, досвідчені люди вже звернули на тебе увагу. Старий тренер арени бачить у цій перемозі не випадковість, а перший знак того, що з новачка може вирости справжній гладіатор. Зустріч із ним відкриє тобі невелику, але важливу нагороду та задасть тон твоїй подальшій кар’єрі.',
            en: 'Your first fight in the arena ended in victory, and while the crowd has not yet learned your name, experienced eyes have already taken notice. An old arena trainer sees this win not as luck, but as the first sign that a true gladiator may be rising from the ranks of a beginner. Meeting him will bring a small but meaningful reward and set the tone for your future career.'
        },
        objective: {
            uk: 'Перемогти 1 супротивника на арені.',
            en: 'Defeat 1 opponent in the arena.'
        },

        triggerLabel: { uk: 'Після 1 перемоги', en: 'After 1 win' },

        rewards: {
            gold: 25,
            xp: 10
        },

        lore: {
            uk: 'Старий тренер колись сам виступав на арені. Кажуть, він пережив понад сотню поєдинків і навчив не одне покоління гладіаторів.',
            en: 'The old trainer once fought in the arena himself. Rumor says he survived more than a hundred battles and trained multiple generations of gladiators.'
        },

        trigger: (state) => state.player.stats.wins >= 1,
        dialogue: {
            speaker: { uk: 'Тренер', en: 'Trainer' },
            intro: {
                uk: 'Я бачив твою першу перемогу. Це гарний початок для гладіатора.',
                en: 'I saw your first victory. That is a good start for a gladiator.'
            },
            lines: [
                {
                    uk: 'Після першого бою тебе помічає старий тренер арени.',
                    en: 'After the first fight, an old arena trainer notices you.'
                }
            ],
            choices: [
                {
                    id: 'victory_accept',
                    text: { uk: 'Прийняти похвалу', en: 'Accept the praise' },
                    result: {
                        uk: 'Тренер підбадьорює тебе й дає монети на відновлення.',
                        en: 'The trainer cheers you up and gives you coins for recovery.'
                    },
                    effect(state) {
                        state.player.gold += 25;
                        state.player.hp = state.player.maxHp;
                        state.player.mana = state.player.maxMana;
                        state.player.xp += 10;
                    }
                },
                {
                    id: 'victory_humble',
                    text: { uk: 'Сказати, що це лише початок', en: 'Say it is only the beginning' },
                    result: {
                        uk: 'Тренер цінує твою стриманість і обіцяє стежити за твоїм прогресом.',
                        en: 'The trainer respects your restraint and promises to watch your progress.'
                    },
                    effect(state) {
                        state.player.xp += 20;
                    }
                }
            ]
        }
    },
    {
        id: 'quest_loss_training',
        stage: 'early',
        names: { uk: 'Урок поразки', en: 'Lesson of Defeat' },
        description: {
            uk: 'Поразка в арені завжди болюча, але саме вона часто відділяє самовпевненість від справжньої сили. Після невдалого бою до тебе підходить старий гладіатор, який пережив десятки поєдинків і добре знає ціну помилкам. Він пропонує не просто пораду, а шанс перетворити сором на нову силу через жорстке, але корисне тренування.',
            en: 'Defeat in the arena always hurts, but it is often what separates arrogance from real strength. After a failed battle, an old gladiator who has survived dozens of matches approaches you. He offers not just advice, but a chance to turn humiliation into new strength through brutal yet useful training.'
        },
        triggerLabel: { uk: 'Після 1 поразки', en: 'After 1 loss' },
        trigger: (state) => state.player.stats.losses >= 1,
        dialogue: {
            speaker: { uk: 'Старий гладіатор', en: 'Old Gladiator' },
            intro: {
                uk: 'Поразка болить. Але саме після неї з’являється шанс стати сильнішим.',
                en: 'Defeat hurts. But it can also make you stronger.'
            },
            lines: [
                {
                    uk: 'Сивий гладіатор підходить до тебе та пропонує тренування.',
                    en: 'A grey-haired gladiator approaches and offers training.'
                }
            ],
            choices: [
                {
                    id: 'loss_train',
                    text: { uk: 'Заплатити за тренування', en: 'Pay for training' },
                    result: {
                        uk: 'Ти проходиш важке тренування під його наглядом.',
                        en: 'You go through harsh training under his watch.'
                    },
                    effect(state) {
                        const fee = Math.min(20, state.player.gold);
                        state.player.gold -= fee;
                        state.player.attributes.strength += 1;
                        state.player.maxHp += 10;
                        state.player.hp = state.player.maxHp;
                        state.player.xp += 15;
                    }
                },
                {
                    id: 'loss_advice',
                    text: { uk: 'Попросити безкоштовну пораду', en: 'Ask for free advice' },
                    result: {
                        uk: 'Він дає короткий урок про витримку та таймінг.',
                        en: 'He gives you a short lesson about endurance and timing.'
                    },
                    effect(state) {
                        state.player.attributes.dexterity += 1;
                        state.player.xp += 10;
                    }
                }
            ]
        }
    },
    {
        id: 'quest_first_purchase',
        stage: 'early',
        names: { uk: 'Перші покупки', en: 'First Purchase' },
        description: {
            uk: 'Перші монети в арені рідко лежать без діла, адже кожна покупка може змінити твою підготовку до наступного бою. Після першого вдалого походу до магазину місцевий крамар починає сприймати тебе не як випадкового відвідувача, а як людину, з якою вже варто мати справу. Саме так відкриваються маленькі переваги, з яких і виростає майбутня сила.',
            en: 'The first coins in the arena rarely stay unused, because every purchase can change how you prepare for the next battle. After your first successful shop visit, a local merchant starts seeing you not as a random customer, but as someone worth dealing with. Small advantages like this are exactly what later grow into real strength.'
        },
        triggerLabel: { uk: 'Після 1 покупки', en: 'After 1 purchase' },
        trigger: (state) => state.progress.purchases >= 1,
        dialogue: {
            speaker: { uk: 'Крамар', en: 'Merchant' },
            intro: {
                uk: 'Гарна покупка. Тепер усі на ринку знають, що ти не боїшся витрачати золото.',
                en: 'Good purchase. Now the market knows you are not afraid to spend gold.'
            },
            lines: [
                {
                    uk: 'Крамар помічає твою покупку й пропонує маленьку угоду.',
                    en: 'The merchant notices your purchase and offers a small deal.'
                }
            ],
            choices: [
                {
                    id: 'purchase_coupon',
                    text: { uk: 'Взяти купон на знижку', en: 'Take a discount coupon' },
                    result: {
                        uk: 'Тобі видають купон і пляшечку для відновлення.',
                        en: 'You receive a coupon and a small recovery potion.'
                    },
                    effect(state) {
                        state.player.gold += 15;
                        state.player.potions.small_health = (state.player.potions.small_health || 0) + 1;
                    }
                },
                {
                    id: 'purchase_trade',
                    text: { uk: 'Обмінятися порадами', en: 'Trade advice' },
                    result: {
                        uk: 'Крамар розповідає, як краще витрачати золото на підготовку.',
                        en: 'The merchant explains how to spend gold more wisely.'
                    },
                    effect(state) {
                        state.player.xp += 15;
                        state.player.gold += 5;
                    }
                }
            ]
        }
    },
    {
        id: 'quest_roman_patron',
        stage: 'story',
        names: { uk: 'Заможний римлянин', en: 'Wealthy Roman' },
        description: {
            uk: 'Коли серія перемог стає помітною навіть за межами арени, поруч з’являються зовсім інші люди — багаті, впливові та готові вкладати золото у переможців. Один із заможних римлян бачить у тобі не просто бійця, а майбутнього чемпіона, з якого можна зробити відому фігуру міста. Його пропозиція може принести величезну користь, але також змінити твою свободу та шлях у грі.',
            en: 'When a streak of victories becomes visible beyond the arena itself, a very different kind of person appears nearby: rich, influential, and eager to invest in winners. One wealthy Roman sees not just a fighter in you, but a future champion who could become a known figure in the city. His offer can bring great benefits, but it may also change your freedom and the direction of your journey.'
        },
        triggerLabel: { uk: 'Після 10 перемог + 1 бос', en: 'After 10 wins + 1 boss' },
        trigger: (state) => state.player.stats.wins >= 10 && state.player.stats.bossWins >= 1 && state.player.stats.losses === 0 && state.player.level >= 5,
        dialogue: {
            speaker: { uk: 'Заможний римлянин', en: 'Wealthy Roman' },
            intro: {
                uk: 'Твоя бездоганна серія боїв вразила навіть знатних глядачів.',
                en: 'Your flawless fighting streak impressed even the nobles.'
            },
            lines: [
                {
                    uk: 'Римлянин пропонує тобі дім, школу тренувань і захист.',
                    en: 'The Roman offers you a home, a training school, and protection.'
                }
            ],
            choices: [
                {
                    id: 'roman_adopt',
                    text: { uk: 'Прийняти опіку', en: 'Accept patronage' },
                    result: {
                        uk: 'Тепер сон і тренування приносять більше користі.',
                        en: 'Sleep and training now give you more value.'
                    },
                    effect(state) {
                        state.progress.romanPatron = true;
                        state.player.gold += 150;
                        state.player.maxHp += 20;
                        state.player.maxMana += 15;
                        state.player.hp = state.player.maxHp;
                        state.player.mana = state.player.maxMana;
                        state.player.xp += 50;
                    }
                },
                {
                    id: 'roman_student',
                    text: { uk: 'Стати лише учнем', en: 'Become only a student' },
                    result: {
                        uk: 'Ти залишаєш свободу, але отримуєш підтримку школи.',
                        en: 'You keep your freedom, but gain the school’s support.'
                    },
                    effect(state) {
                        state.player.xp += 80;
                        state.player.gold += 60;
                    }
                },
                {
                    id: 'roman_decline',
                    text: { uk: 'Відмовитися', en: 'Decline' },
                    result: {
                        uk: 'Ти обираєш шлях самостійного гладіатора.',
                        en: 'You choose the path of a self-made gladiator.'
                    },
                    effect(state) {
                        state.player.xp += 20;
                    }
                }
            ]
        }
    },
    {
        id: 'quest_arena_champion',
        stage: 'story',
        names: { uk: 'Чемпіон арени', en: 'Arena Champion' },
        description: {
            uk: 'Після багатьох сутичок, коли боси вже не здаються нездоланними, сама арена починає сприймати тебе як легенду. Натовп вигукує твоє ім’я, а власник арени розуміє, що настав час назвати нового чемпіона. Це не просто формальність — це момент, який завершує великий етап твоєї історії та підводить тебе до нового статусу в світі гладіаторів.',
            en: 'After many clashes, when bosses no longer seem impossible, the arena itself begins to treat you like a legend. The crowd chants your name, and the arena owner realizes it is time to crown a new champion. This is more than a formality — it is the moment that closes one major chapter of your story and moves you into a new status among gladiators.'
        },
        triggerLabel: { uk: 'Після 3 босів', en: 'After 3 bosses' },
        trigger: (state) => state.player.stats.bossWins >= 3,
        dialogue: {
            speaker: { uk: 'Власник арени', en: 'Arena Owner' },
            intro: {
                uk: 'Публіка вже вигукує твоє ім’я. Арена хоче дати тобі титул.',
                en: 'The crowd already chants your name. The arena wants to give you a title.'
            },
            lines: [
                {
                    uk: 'Власник арени запрошує тебе до окремої кімнати для розмови.',
                    en: 'The arena owner invites you to a private room for a talk.'
                }
            ],
            choices: [
                {
                    id: 'champion_title',
                    text: { uk: 'Прийняти титул', en: 'Accept the title' },
                    result: {
                        uk: 'Ти стаєш офіційним чемпіоном та отримуєш щедру винагороду.',
                        en: 'You become the official champion and receive a rich reward.'
                    },
                    effect(state) {
                        state.player.gold += 200;
                        state.player.xp += 100;
                        state.player.maxHp += 10;
                        state.player.hp = state.player.maxHp;
                    }
                },
                {
                    id: 'champion_refuse',
                    text: { uk: 'Відмовитися від титулу', en: 'Refuse the title' },
                    result: {
                        uk: 'Ти зберігаєш свободу, але арена пам’ятає твій вибір.',
                        en: 'You keep your freedom, but the arena remembers your choice.'
                    },
                    effect(state) {
                        state.player.gold += 80;
                        state.player.xp += 60;
                    }
                }
            ]
        }
    },
    {
        id: 'quest_freedom',
        stage: 'final',
        names: { uk: 'Свобода', en: 'Freedom' },
        description: {
            uk: 'Коли останній бос падає, історія гладіатора входить у найважливіший момент. Усі випробування позаду, і тепер перед тобою стоїть вибір між свободою, славою та новим шляхом. Це не просто нагорода за перемогу — це фінал основної кампанії та ворота до режиму, де випробування можуть тривати безкінечно.',
            en: 'When the final boss falls, the gladiator’s story reaches its most important moment. All trials lie behind you, and now you must choose between freedom, glory, and a new path. This is not just a reward for victory — it is the end of the main campaign and the gateway to a mode where challenges can continue forever.'
        },
        triggerLabel: { uk: 'Після всіх босів', en: 'After all bosses' },
        trigger: (state) => window.BOSSES.every(b => state.progress.bosses[b.id]?.won),
        dialogue: {
            speaker: { uk: 'Натовп', en: 'Crowd' },
            intro: {
                uk: 'Усі боси впали. Тепер настав момент вирішити, що далі.',
                en: 'All bosses have fallen. Now it is time to decide what comes next.'
            },
            lines: [
                {
                    uk: 'Тебе чекають або свобода, або новий шлях у нескінченному режимі.',
                    en: 'Freedom or a new path in endless mode awaits you.'
                }
            ],
            choices: [
                {
                    id: 'freedom_continue',
                    text: { uk: 'Піти у нескінченний режим', en: 'Enter endless mode' },
                    result: {
                        uk: 'Ти обираєш новий шлях після завершення кампанії.',
                        en: 'You choose a new path after finishing the campaign.'
                    },
                    effect(state) {
                        state.progress.endlessUnlocked = true;
                        state.mode = 'endless';
                        state.player.gold += 250;
                        state.player.xp += 120;
                    }
                },
                {
                    id: 'freedom_share',
                    text: { uk: 'Поділитися рекордом і піти на спочинок', en: 'Share the record and rest' },
                    result: {
                        uk: 'Твоя історія стає частиною легенди арени.',
                        en: 'Your story becomes part of the arena’s legend.'
                    },
                    effect(state) {
                        state.progress.endlessUnlocked = true;
                        state.player.gold += 100;
                    }
                }
            ]
        }
    }
];

window.getQuestState = function getQuestState(state) {
    const list = {};
    window.QUEST_DEFS.forEach(q => {
        list[q.id] = state.progress.quests[q.id] || { available: false, done: false, claimed: false, revealed: false };
    });
    return list;
};
window.QUEST_DIALOGUES = Object.fromEntries(
    window.QUEST_DEFS
        .filter(q => q.dialogue)
        .map(q => [q.id, q.dialogue])
);
