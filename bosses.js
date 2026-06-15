
// =====================================================
// Bosses with unique mechanics and trophy loot
// =====================================================

window.BOSSES = [
    {
        id: 'boss_marcus',
        level: 5,
        names: { uk: 'Марк, Капітан арени', en: 'Marcus, Arena Captain' },
        description: {
            uk: 'На половині здоров’я входить у стан люті.',
            en: 'Enters fury mode at half health.'
        },
        hpMult: 1.35,
        dmgMult: 1.15,
        defMult: 1.0,
        mechanism: 'enrage',
        loot: 'weapon_iron_sword'
    },
    {
        id: 'boss_sandstalker',
        level: 10,
        names: { uk: 'Піщаний Сталкер', en: 'Sand Stalker' },
        description: {
            uk: 'Час від часу знижує точність гравця та отруює його.',
            en: 'Occasionally lowers player accuracy and poisons them.'
        },
        hpMult: 1.45,
        dmgMult: 1.05,
        defMult: 1.05,
        mechanism: 'poison',
        loot: 'armor_reinforced'
    },
    {
        id: 'boss_oracle',
        level: 15,
        names: { uk: 'Оракул Боєць', en: 'Oracle Fighter' },
        description: {
            uk: 'Поглинає ману гравця та лікується нею.',
            en: 'Drains player mana and heals with it.'
        },
        hpMult: 1.55,
        dmgMult: 1.10,
        defMult: 1.10,
        mechanism: 'drain',
        loot: 'weapon_steel_sword'
    },
    {
        id: 'boss_colossus',
        level: 20,
        names: { uk: 'Колос арени', en: 'Arena Colossus' },
        description: {
            uk: 'Має міцний щит, який ламається лише після кількох сильних ударів.',
            en: 'Has a strong shield that breaks only after several hard hits.'
        },
        hpMult: 1.75,
        dmgMult: 1.18,
        defMult: 1.20,
        mechanism: 'shield',
        loot: 'armor_titan'
    },
    {
        id: 'boss_emperor',
        level: 25,
        names: { uk: 'Імператорський Чемпіон', en: 'Imperial Champion' },
        description: {
            uk: 'Лікується один раз і карає за затягування бою.',
            en: 'Heals once and punishes long fights.'
        },
        hpMult: 2.0,
        dmgMult: 1.25,
        defMult: 1.25,
        mechanism: 'revive',
        loot: 'weapon_emperor_blade'
    }
];

window.getBossByIndex = function getBossByIndex(index) {
    return window.BOSSES[index] || null;
};

window.getAvailableBoss = function getAvailableBoss(state) {
    return window.BOSSES.find((boss, index) => {
        const unlocked = state.player.level >= boss.level;
        const already = state.progress.bosses[boss.id]?.won;
        return unlocked && !already;
    }) || null;
};
