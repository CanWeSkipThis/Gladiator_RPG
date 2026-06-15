
// =====================================================
// Achievements (shown in the journal, no alert dialogs)
// =====================================================

window.ACHIEVEMENT_DEFS = [
    {
        id: 'ach_first_blood',
        names: { uk: 'Перша кров', en: 'First Blood' },
        descriptions: { uk: 'Здійсни першу перемогу.', en: 'Win your first battle.' },
        check: (state) => state.player.stats.wins >= 1
    },
    {
        id: 'ach_five_wins',
        names: { uk: 'Підкорювач арени', en: 'Arena Conqueror' },
        descriptions: { uk: 'Переможи 5 ворогів.', en: 'Defeat 5 enemies.' },
        check: (state) => state.player.stats.wins >= 5
    },
    {
        id: 'ach_ten_hits',
        names: { uk: 'Серія ударів', en: 'Strike Chain' },
        descriptions: { uk: 'Завдай 10 ударів.', en: 'Land 10 hits.' },
        check: (state) => state.player.stats.hits >= 10
    },
    {
        id: 'ach_first_loss',
        names: { uk: 'Невдача теж досвід', en: 'Failure is Experience' },
        descriptions: { uk: 'Програй один бій.', en: 'Lose one battle.' },
        check: (state) => state.player.stats.losses >= 1
    },
    {
        id: 'ach_potion_user',
        names: { uk: 'Любитель зіль', en: 'Potion Lover' },
        descriptions: { uk: 'Використай 3 зілля.', en: 'Use 3 potions.' },
        check: (state) => state.player.stats.potionsUsed >= 3
    },
    {
        id: 'ach_boss_slayer',
        names: { uk: 'Вбивця босів', en: 'Boss Slayer' },
        descriptions: { uk: 'Переможи 1 боса.', en: 'Defeat 1 boss.' },
        check: (state) => state.player.stats.bossWins >= 1
    },
    {
        id: 'ach_roman_friend',
        names: { uk: 'Школа римлянина', en: 'Roman School' },
        descriptions: { uk: 'Отримай покровительство римлянина.', en: 'Gain the Roman patron.' },
        check: (state) => Boolean(state.progress.romanPatron)
    },
    {
        id: 'ach_collector',
        names: { uk: 'Колекціонер', en: 'Collector' },
        descriptions: { uk: 'Придбай 5 різних предметів.', en: 'Buy 5 different items.' },
        check: (state) => state.progress.purchases >= 5
    },
    {
        id: 'ach_day_10',
        names: { uk: 'Десятий день', en: 'Tenth Day' },
        descriptions: { uk: 'Проживи 10 днів.', en: 'Reach day 10.' },
        check: (state) => state.player.day >= 10
    },
    {
        id: 'ach_endless',
        names: { uk: 'Нескінченний гладіатор', en: 'Endless Gladiator' },
        descriptions: { uk: 'Відкрий нескінченний режим.', en: 'Unlock endless mode.' },
        check: (state) => state.progress.endlessUnlocked
    }
];
