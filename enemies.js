
// =====================================================
// Random enemies and archetypes
// =====================================================

function rInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

window.ENEMY_ARCHETYPES = {
    strong: {
        id: 'strong',
        names: {
            uk: ['Сильний гладіатор', 'Розлючений гладіатор', 'Білений мечем боєць'],
            en: ['Strong Gladiator', 'Furious Gladiator', 'Blade-hardened Fighter']
        },
        strShift: 10,
        dexShift: -5,
        intShift: -5,
        hpMult: 1.1,
        dmgMult: 1.25,
        defenseMult: 0.95,
        critBonus: 0.03,
        dodgeBonus: 0.01,
        special: 'brute'
    },
    agile: {
        id: 'agile',
        names: {
            uk: ['Спритний гладіатор', 'Танцюючий боєць', 'Майстер ухилення'],
            en: ['Agile Gladiator', 'Dancing Fighter', 'Dodge Master']
        },
        strShift: -4,
        dexShift: 10,
        intShift: -6,
        hpMult: 0.9,
        dmgMult: 1.0,
        defenseMult: 0.9,
        critBonus: 0.06,
        dodgeBonus: 0.12,
        special: 'dodge'
    },
    smart: {
        id: 'smart',
        names: {
            uk: ['Розумний гладіатор', 'Хитрий стратег', 'Арена-інтелект'],
            en: ['Smart Gladiator', 'Cunning Strategist', 'Arena Mind']
        },
        strShift: -5,
        dexShift: 0,
        intShift: 12,
        hpMult: 0.95,
        dmgMult: 0.95,
        defenseMult: 1.0,
        critBonus: 0.08,
        dodgeBonus: 0.03,
        special: 'drain'
    },
    tough: {
        id: 'tough',
        names: {
            uk: ['Живучий гладіатор', 'Непохитний боєць', 'Кам’яний воїн'],
            en: ['Tough Gladiator', 'Unyielding Fighter', 'Stone Warrior']
        },
        strShift: 0,
        dexShift: -8,
        intShift: 8,
        hpMult: 1.35,
        dmgMult: 0.9,
        defenseMult: 1.25,
        critBonus: 0.01,
        dodgeBonus: 0.0,
        special: 'shield'
    }
};

window.generateEnemy = function generateEnemy(context = {}) {
    const lang = window.gameSettings?.language || window.DEFAULT_SETTINGS.language;
    const day = Math.max(1, Number(context.day) || 1);
    const level = Math.max(1, Number(context.level) || 1);
    const endless = Boolean(context.endless);

    const archetypeList = Object.values(window.ENEMY_ARCHETYPES);
    const archetype = pick(archetypeList);

    // Campaign enemies stay intentionally moderate.
    // Endless mode scales faster, but only after the main story is finished.
    let strengthShare = clamp(rInt(40, 60) + archetype.strShift, 35, 70);
    let dexterityShare = clamp(rInt(20, 40) + archetype.dexShift, 10, 50);
    if (strengthShare + dexterityShare > 92) {
        dexterityShare = 92 - strengthShare;
    }
    let intelligenceShare = 100 - strengthShare - dexterityShare;
    if (intelligenceShare < 5) {
        intelligenceShare = 5;
        dexterityShare = Math.max(10, 95 - strengthShare);
    }

    const campaignGrowth = (1 + level * 0.0015 + day * 0.0005);
    const endlessGrowth = (1 + level * 0.2 + day * 0.005);
    const poolBase = endless
        ? (16 + level * 6 + day * 4)
        : (12 + level * 2.2 + day * 0.9);
    const pool = Math.round(poolBase * (endless ? endlessGrowth : campaignGrowth));

    const strength = Math.max(1, Math.round(pool * strengthShare / 100));
    const dexterity = Math.max(1, Math.round(pool * dexterityShare / 100));
    const intelligence = Math.max(1, pool - strength - dexterity);

    const hp = Math.round((40 + strength * 6 + dexterity * 2.6 + intelligence * 1.7) * archetype.hpMult);
    const damage = Math.round((3 + strength * 1.45 + dexterity * 0.5 + intelligence * 0.25) * archetype.dmgMult);
    const defense = Math.round((dexterity * 0.18 + intelligence * 0.14) * archetype.defenseMult);
    const crit = Math.min(0.22, 0.02 + dexterity * 0.0018 + archetype.critBonus);
    const dodge = Math.min(0.24, 0.03 + dexterity * 0.0016 + archetype.dodgeBonus);

    const names = archetype.names[lang] || archetype.names.uk;
    const name = pick(names);

    return {
        id: `enemy_${archetype.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: archetype.id,
        name,
        level: Math.max(1, Math.round(level + (endless ? day / 2 : day / 6))),
        hp,
        maxHp: hp,
        damage,
        defense,
        strength,
        dexterity,
        intelligence,
        crit,
        dodge,
        special: archetype.special,
        rewardGold: Math.round(18 + hp * 0.22),
        rewardExp: Math.round(18 + hp * 0.28),
        archetypeLabel: archetype.id,
        endless
    };
};
