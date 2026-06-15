function openShopHub() {
    showModal(`
        <h2 class="modal-title">🏪 ${T('shop')}</h2>
        <div class="modal-body">
            <div class="modal-section list">
                <button class="good" id="openEquipmentShopBtn">${T('equipmentShop')}</button>
                <button class="good" id="openPotionShopBtn">${T('potionShop')}</button>
            </div>
        </div>
        <div class="modal-footer">
            <button class="secondary" id="shopCloseBtn">${T('close')}</button>
        </div>
    `);

    const box = DOM.modalBox;
    box.querySelector('#openEquipmentShopBtn').onclick = openEquipmentShop;
    box.querySelector('#openPotionShopBtn').onclick = openPotionShop;
    box.querySelector('#shopCloseBtn').onclick = closeModal;
	state.modalContext = 'shop';

    state.modalNavigation = {
        context: 'shop',
        selectedIndex: 0,
        items: [
            box.querySelector('#openEquipmentShopBtn'),
            box.querySelector('#openPotionShopBtn'),
            box.querySelector('#shopCloseBtn')
        ]
   };

   updateModalSelection();
}

function openEquipmentShop() {
    const weapons = window.ITEMS.weapons
        .filter(item => item.id !== 'weapon_fists' && !item.bossLoot)
        .map(item => {
            const locked = state.player.level < item.level;
            return `
                <div class="card-row">
                    <div>
                        <div>${getLocalizedName(item.name)} ${item.bossLoot ? '👑' : ''}</div>
                        <div class="subtle">${getLocalizedDesc(item.desc)}</div>
                        <div class="subtle">Lv ${item.level} | +${item.stats.damage} dmg | +${item.stats.crit ? percent(item.stats.crit) : '0%' } crit</div>
                    </div>
                    <div>
                        <div class="tag">${item.price > 0 ? `${item.price} 💰` : T('bossArena')}</div>
                        <button class="good" data-buy="${item.id}" ${locked || state.player.gold < item.price ? 'disabled' : ''}>${T('buy')}</button>
                    </div>
                </div>
            `;
        }).join('');

    const armors = window.ITEMS.armors
        .filter(item => item.id !== 'armor_cloth' && !item.bossLoot)
        .map(item => {
            const locked = state.player.level < item.level;
            return `
                <div class="card-row">
                    <div>
                        <div>${getLocalizedName(item.name)} ${item.bossLoot ? '👑' : ''}</div>
                        <div class="subtle">${getLocalizedDesc(item.desc)}</div>
                        <div class="subtle">Lv ${item.level} | +${item.stats.defense} def | +${item.stats.hp} HP</div>
                    </div>
                    <div>
                        <div class="tag">${item.price > 0 ? `${item.price} 💰` : T('bossArena')}</div>
                        <button class="good" data-buy="${item.id}" ${locked || state.player.gold < item.price ? 'disabled' : ''}>${T('buy')}</button>
                    </div>
                </div>
            `;
        }).join('');

    showModal(`
        <h2 class="modal-title">🗡️ ${T('equipmentShop')}</h2>
        <div class="modal-body">
            <div class="modal-section">
                <div class="card-row">
                    <div>
                        <div><strong>${getLocalizedName(state.player.equipment.weapon.name || state.player.equipment.weapon)}</strong></div>
                        <div class="subtle">${getLocalizedDesc(state.player.equipment.weapon.desc || state.player.equipment.weapon)}</div>
                    </div>
                    <button class="warning" id="sellWeaponBtn">${T('sell')}</button>
                </div>
                <div class="list">${weapons}</div>
            </div>

            <div class="modal-section">
                <div class="card-row">
                    <div>
                        <div><strong>${getLocalizedName(state.player.equipment.armor.name || state.player.equipment.armor)}</strong></div>
                        <div class="subtle">${getLocalizedDesc(state.player.equipment.armor.desc || state.player.equipment.armor)}</div>
                    </div>
                    <button class="warning" id="sellArmorBtn">${T('sell')}</button>
                </div>
                <div class="list">${armors}</div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="secondary" id="equipmentCloseBtn">${T('close')}</button>
        </div>
    `);

    const box = DOM.modalBox;
    box.querySelector('#sellWeaponBtn').onclick = sellCurrentWeapon;
    box.querySelector('#sellArmorBtn').onclick = sellCurrentArmor;
    box.querySelector('#equipmentCloseBtn').onclick = closeModal;
    box.querySelectorAll('[data-buy]').forEach(btn => {
        btn.onclick = () => buyItem(btn.getAttribute('data-buy'));
    });
	state.modalContext = 'equipmentShop';

    state.modalNavigation = {
        context: 'equipmentShop',
        selectedIndex: 0,
        items: Array.from(
            box.querySelectorAll(
                '#sellWeaponBtn, #sellArmorBtn, button[data-buy], #equipmentCloseBtn'
            )
        )
    };
	console.log(
    state.modalNavigation.items.map(btn => btn.textContent.trim())
);

    updateModalSelection();
}

function openPotionShop() {
    const items = window.ITEMS.potions.map(item => `
        <div class="card-row">
            <div>
                <div>${getLocalizedName(item.name)}</div>
                <div class="subtle">${getLocalizedDesc(item.desc)}</div>
                <div class="subtle">${item.category} | ${item.size}</div>
            </div>
            <div>
                <div class="tag">${item.price} 💰</div>
                <button class="good" data-buy-potion="${item.id}">${T('buy')}</button>
            </div>
        </div>
    `).join('');

    showModal(`
        <h2 class="modal-title">🧪 ${T('potionShop')}</h2>
        <div class="modal-body">
            <div class="modal-section list">${items}</div>
        </div>
        <div class="modal-footer">
            <button class="secondary" id="potionCloseBtn">${T('close')}</button>
        </div>
    `);

    const box = DOM.modalBox;
    box.querySelector('#potionCloseBtn').onclick = closeModal;
    box.querySelectorAll('[data-buy-potion]').forEach(btn => {
        btn.onclick = () => buyItem(btn.getAttribute('data-buy-potion'));
    });
	state.modalContext = 'potionShop';

    state.modalNavigation = {
        context: 'potionShop',
        selectedIndex: 0,
        items: [
        ...Array.from(box.querySelectorAll('[data-buy-potion]')),
            box.querySelector('#potionCloseBtn')
        ]
    };

updateModalSelection();
}

function openPotionInventory() {
    const entries = Object.entries(state.player.potions || {});
    if (!entries.length) {
        showToast(T('noPotions'));
        return;
    }

    const list = entries.map(([id, qty]) => {
        const item = getItemById(id);
        return `
            <div class="card-row">
                <div>
                    <div>${getLocalizedName(item.name)} × ${qty}</div>
                    <div class="subtle">${getLocalizedDesc(item.desc)}</div>
                </div>
                <button class="good" data-use-potion="${id}">${T('usePotion')}</button>
            </div>
        `;
    }).join('');

    showModal(`
        <h2 class="modal-title">🧪 ${T('usePotion')}</h2>
        <div class="modal-body">
            <div class="modal-section list">${list}</div>
        </div>
        <div class="modal-footer">
            <button class="secondary" id="inventoryCloseBtn">${T('close')}</button>
        </div>
    `);

    const box = DOM.modalBox;
    box.querySelector('#inventoryCloseBtn').onclick = closeModal;
    box.querySelectorAll('[data-use-potion]').forEach(btn => {
        btn.onclick = () => usePotion(btn.getAttribute('data-use-potion'));
    });
}

function equipItem(item) {
    if (!item) return;

    if (item.slot === 'weapon') {
        state.player.equipment.weapon = clone(item);
    } else if (item.slot === 'armor') {
        state.player.equipment.armor = clone(item);
        state.player.maxHp = roundInt(state.player.maxHp + (item.stats.hp || 0));
        state.player.hp = Math.min(state.player.maxHp, roundInt(state.player.hp + (item.stats.hp || 0)));
    }

    saveState();
    renderHUD();
}

function buyItem(itemId) {
    const item = getItemById(itemId);
    if (!item) return;

    if (state.player.level < (item.level || 1)) {
        showToast(`${T('level')}: ${item.level}`);
        return;
    }

    if (state.player.gold < item.price) {
        showToast(T('notEnoughGold'));
        return;
    }

    state.player.gold -= item.price;
    state.progress.purchases += 1;

    if (item.slot === 'weapon') {
        state.player.equipment.weapon = clone(item);
        pushLog(`${Text.green(T('bought'))}: ${getLocalizedName(item.name)}`, 'good');
    } else if (item.slot === 'armor') {
        const oldHpBonus = state.player.equipment.armor?.stats?.hp || 0;
        const newHpBonus = item.stats.hp || 0;
        state.player.equipment.armor = clone(item);
        state.player.maxHp = roundInt(state.player.maxHp - oldHpBonus + newHpBonus);
        state.player.hp = Math.min(state.player.maxHp, roundInt(state.player.hp - oldHpBonus + newHpBonus));
        pushLog(`${Text.green(T('bought'))}: ${getLocalizedName(item.name)}`, 'good');
    } else if (item.category) {
        gainPotion(itemId, 1);
        pushLog(`${Text.green(T('bought'))}: ${getLocalizedName(item.name)}`, 'good');
    }

    saveState();
    renderHUD();
    renderMainActions();
    checkQuestCompletion();
    checkAchievements();
    showToast(`${T('bought')}: ${getLocalizedName(item.name)}`);
}

function gainPotion(potionId, qty = 1) {
    state.player.potions[potionId] = (state.player.potions[potionId] || 0) + qty;
    saveState();
}

function sellCurrentWeapon() {
    const weapon = state.player.equipment.weapon;
    if (!weapon || weapon.id === 'weapon_fists') {
        showToast(T('nothingToSell'));
        return;
    }
    state.player.gold += weapon.sell || 0;
    state.player.equipment.weapon = clone(getItemById('weapon_fists'));
    pushLog(`${Text.gold(T('sold'))}: ${getLocalizedName(weapon.name || weapon)}`, 'warning');
    saveState();
    renderHUD();
    showToast(`${T('sold')}: ${getLocalizedName(weapon.name || weapon)}`);
}

function sellCurrentArmor() {
    const armor = state.player.equipment.armor;
    if (!armor || armor.id === 'armor_cloth') {
        showToast(T('nothingToSell'));
        return;
    }
    state.player.gold += armor.sell || 0;
    const hpBonus = armor.stats?.hp || 0;
    state.player.maxHp = Math.max(1, roundInt(state.player.maxHp - hpBonus));
    state.player.hp = Math.min(state.player.maxHp, roundInt(state.player.hp));
    state.player.equipment.armor = clone(getItemById('armor_cloth'));
    pushLog(`${Text.gold(T('sold'))}: ${getLocalizedName(armor.name || armor)}`, 'warning');
    saveState();
    renderHUD();
    showToast(`${T('sold')}: ${getLocalizedName(armor.name || armor)}`);
}