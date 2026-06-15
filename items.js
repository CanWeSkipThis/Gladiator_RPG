
// =====================================================
// Items: weapons, armor and potions
// =====================================================

window.ITEMS = {
    weapons: [
        {
            id: 'weapon_fists',
            slot: 'weapon',
            tier: 0,
            level: 1,
            price: 0,
            sell: 0,
            stats: { damage: 0, crit: 0 },
            name: { uk: 'Кулаки', en: 'Fists' },
            desc: { uk: 'Початковий стан без зброї.', en: 'Starting unarmed state.' }
        },
        {
            id: 'weapon_bronze_gladius',
            slot: 'weapon',
            tier: 1,
            level: 1,
            price: 40,
            sell: 20,
            stats: { damage: 4, crit: 0.01 },
            name: { uk: 'Бронзовий гладіус', en: 'Bronze Gladius' },
            desc: { uk: 'Надійний меч для першої арени.', en: 'A reliable blade for the first arena.' }
        },
        {
            id: 'weapon_iron_sword',
            slot: 'weapon',
            tier: 2,
            level: 3,
            price: 90,
            sell: 45,
            stats: { damage: 8, crit: 0.02 },
            name: { uk: 'Залізний меч', en: 'Iron Sword' },
            desc: { uk: 'Сильніший удар і краще пробиття броні.', en: 'Stronger strikes and better armor penetration.' }
        },
        {
            id: 'weapon_steel_sword',
            slot: 'weapon',
            tier: 3,
            level: 6,
            price: 170,
            sell: 85,
            stats: { damage: 13, crit: 0.03 },
            name: { uk: 'Сталевий меч', en: 'Steel Sword' },
            desc: { uk: 'Підходить для досвідчених гладіаторів.', en: 'Fit for experienced gladiators.' }
        },
        {
            id: 'weapon_mythril_blade',
            slot: 'weapon',
            tier: 4,
            level: 10,
            price: 320,
            sell: 160,
            stats: { damage: 19, crit: 0.05 },
            name: { uk: 'Міфриловий клинок', en: 'Mythril Blade' },
            desc: { uk: 'Легкий та смертельно точний.', en: 'Light and deadly precise.' }
        },
        {
            id: 'weapon_emperor_blade',
            slot: 'weapon',
            tier: 5,
            level: 15,
            price: 0,
            sell: 300,
            stats: { damage: 26, crit: 0.08 },
            name: { uk: 'Клинок імператора', en: 'Emperor Blade' },
            desc: { uk: 'Трофей боса. Символ сили та слави.', en: 'A boss trophy and symbol of power.' },
            bossLoot: true
        }
    ],
    armors: [
        {
            id: 'armor_cloth',
            slot: 'armor',
            tier: 0,
            level: 1,
            price: 0,
            sell: 0,
            stats: { defense: 0, hp: 0 },
            name: { uk: 'Тряпки', en: 'Rags' },
            desc: { uk: 'Мінімальний захист.', en: 'Minimal protection.' }
        },
        {
            id: 'armor_leather',
            slot: 'armor',
            tier: 1,
            level: 1,
            price: 35,
            sell: 18,
            stats: { defense: 2, hp: 8 },
            name: { uk: 'Шкіряна броня', en: 'Leather Armor' },
            desc: { uk: 'Легка і зручна.', en: 'Light and comfortable.' }
        },
        {
            id: 'armor_reinforced',
            slot: 'armor',
            tier: 2,
            level: 3,
            price: 85,
            sell: 42,
            stats: { defense: 4, hp: 18 },
            name: { uk: 'Посилена броня', en: 'Reinforced Armor' },
            desc: { uk: 'Стійкіша до ударів.', en: 'Better against heavy blows.' }
        },
        {
            id: 'armor_legion',
            slot: 'armor',
            tier: 3,
            level: 6,
            price: 160,
            sell: 80,
            stats: { defense: 7, hp: 28 },
            name: { uk: 'Легіонерська броня', en: 'Legion Armor' },
            desc: { uk: 'Надійний захист арени.', en: 'Reliable arena protection.' }
        },
        {
            id: 'armor_titan',
            slot: 'armor',
            tier: 4,
            level: 10,
            price: 300,
            sell: 150,
            stats: { defense: 11, hp: 45 },
            name: { uk: 'Броня титана', en: 'Titan Armor' },
            desc: { uk: 'Важка броня для фінальних сутичок.', en: 'Heavy armor for final clashes.' }
        },
        {
            id: 'armor_sand_ward',
            slot: 'armor',
            tier: 5,
            level: 15,
            price: 0,
            sell: 260,
            stats: { defense: 16, hp: 60 },
            name: { uk: 'Пісочна мантія', en: 'Sand Mantle' },
            desc: { uk: 'Трофей, що зменшує шкоду босів.', en: 'A trophy that blunts boss damage.' },
            bossLoot: true
        }
    ],
    potions: [
        {
            id: 'potion_small_health',
            category: 'health',
            size: 'small',
            price: 15,
            sell: 8,
            value: 30,
            name: { uk: 'Мале зілля здоров’я', en: 'Small Health Potion' },
            desc: { uk: 'Повертає небагато здоров’я.', en: 'Restores a bit of health.' }
        },
        {
            id: 'potion_medium_health',
            category: 'health',
            size: 'medium',
            price: 35,
            sell: 18,
            value: 70,
            name: { uk: 'Середнє зілля здоров’я', en: 'Medium Health Potion' },
            desc: { uk: 'Добре лікує після бою.', en: 'Solid recovery after battle.' }
        },
        {
            id: 'potion_large_health',
            category: 'health',
            size: 'large',
            price: 70,
            sell: 35,
            value: 140,
            name: { uk: 'Велике зілля здоров’я', en: 'Large Health Potion' },
            desc: { uk: 'Сильне відновлення для важких битв.', en: 'Big recovery for hard fights.' }
        },
        {
            id: 'potion_small_mana',
            category: 'mana',
            size: 'small',
            price: 15,
            sell: 8,
            value: 20,
            name: { uk: 'Мале зілля мани', en: 'Small Mana Potion' },
            desc: { uk: 'Повертає трохи мани.', en: 'Restores a small amount of mana.' }
        },
        {
            id: 'potion_medium_mana',
            category: 'mana',
            size: 'medium',
            price: 35,
            sell: 18,
            value: 45,
            name: { uk: 'Середнє зілля мани', en: 'Medium Mana Potion' },
            desc: { uk: 'Добре підходить для спецатак.', en: 'Useful for special attacks.' }
        },
        {
            id: 'potion_large_mana',
            category: 'mana',
            size: 'large',
            price: 70,
            sell: 35,
            value: 90,
            name: { uk: 'Велике зілля мани', en: 'Large Mana Potion' },
            desc: { uk: 'Відновлює багато мани.', en: 'Restores a lot of mana.' }
        },
        {
            id: 'potion_small_attack',
            category: 'attack',
            size: 'small',
            price: 30,
            sell: 15,
            value: 3,
            turns: 3,
            name: { uk: 'Мале бойове зілля', en: 'Small Attack Potion' },
            desc: { uk: 'Тимчасово підвищує атаку.', en: 'Temporarily boosts attack.' }
        },
        {
            id: 'potion_medium_attack',
            category: 'attack',
            size: 'medium',
            price: 60,
            sell: 30,
            value: 6,
            turns: 4,
            name: { uk: 'Середнє бойове зілля', en: 'Medium Attack Potion' },
            desc: { uk: 'Дає сильніший бонус до атаки.', en: 'Provides a stronger attack boost.' }
        },
        {
            id: 'potion_large_attack',
            category: 'attack',
            size: 'large',
            price: 110,
            sell: 55,
            value: 10,
            turns: 5,
            name: { uk: 'Велике бойове зілля', en: 'Large Attack Potion' },
            desc: { uk: 'Сильний тимчасовий приріст урону.', en: 'A powerful temporary damage boost.' }
        },
        {
            id: 'potion_small_defense',
            category: 'defense',
            size: 'small',
            price: 30,
            sell: 15,
            value: 3,
            turns: 3,
            name: { uk: 'Мале захисне зілля', en: 'Small Defense Potion' },
            desc: { uk: 'Тимчасово підвищує захист.', en: 'Temporarily boosts defense.' }
        },
        {
            id: 'potion_medium_defense',
            category: 'defense',
            size: 'medium',
            price: 60,
            sell: 30,
            value: 6,
            turns: 4,
            name: { uk: 'Середнє захисне зілля', en: 'Medium Defense Potion' },
            desc: { uk: 'Сильніший бонус до захисту.', en: 'A stronger defense boost.' }
        },
        {
            id: 'potion_large_defense',
            category: 'defense',
            size: 'large',
            price: 110,
            sell: 55,
            value: 10,
            turns: 5,
            name: { uk: 'Велике захисне зілля', en: 'Large Defense Potion' },
            desc: { uk: 'Потужний тимчасовий захист.', en: 'Powerful temporary protection.' }
        }
    ]
};

window.getItemById = function getItemById(id) {
    return [
        ...window.ITEMS.weapons,
        ...window.ITEMS.armors,
        ...window.ITEMS.potions
    ].find(item => item.id === id) || null;
};

window.getLocalizedName = function getLocalizedName(obj) {
    const lang = window.gameSettings?.language || window.DEFAULT_SETTINGS.language;
    return obj?.[lang] || obj?.uk || obj?.en || '';
};

window.getLocalizedDesc = function getLocalizedDesc(obj) {
    const lang = window.gameSettings?.language || window.DEFAULT_SETTINGS.language;
    return obj?.[lang] || obj?.uk || obj?.en || '';
};
