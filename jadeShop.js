// 仙玉商店模块 (jadeShop.js)
// 仙玉专属商品、购买逻辑、装备箱、重铸

class JadeShop {
    constructor(game) {
        this.game = game;
    }

    // 商品配置
    static SHOP_ITEMS = [
        { id: 'purple_box',      name: '紫装宝箱',   jade: 100,  type: 'equipment_box', rarity: 'purple',   desc: '保底紫色品质装备' },
        { id: 'gold_box',        name: '金装宝箱',   jade: 300,  type: 'equipment_box', rarity: 'gold',     desc: '保底金色品质装备' },
        { id: 'rainbow_box',     name: '彩装宝箱',   jade: 800,  type: 'equipment_box', rarity: 'rainbow',  desc: '保底彩色品质装备' },
        { id: 'breakthrough_x5', name: '突破石×5',   jade: 50,   type: 'item', item: 'breakthrough_stone', amount: 5, desc: '5颗突破石' },
        { id: 'breakthrough_x20',name: '突破石×20',  jade: 180,  type: 'item', item: 'breakthrough_stone', amount: 20, desc: '20颗突破石' },
        { id: 'exp_pill',        name: '修为丹',     jade: 30,   type: 'exp', expAmount: 500, desc: '获得500经验值' },
        { id: 'exp_pill_lg',     name: '高级修为丹', jade: 100,  type: 'exp', expAmount: 2000, desc: '获得2000经验值' },
        { id: 'reforge_stone',   name: '重铸石',     jade: 80,   type: 'reforge', desc: '重铸一件装备的随机属性' },
        { id: 'fusion_stone',    name: '合成石',     jade: 50,   type: 'fusion', desc: '提高装备合成成功率20%' }
    ];

    // 获取商品列表
    getItems() {
        return JadeShop.SHOP_ITEMS;
    }

    // 获取当前仙玉余额
    getJadeBalance() {
        return this.game.gameState?.resources?.jade || 0;
    }

    // 购买商品
    buyItem(itemId) {
        const item = JadeShop.SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) {
            return { success: false, message: '商品不存在！' };
        }

        const jadeBalance = this.getJadeBalance();
        if (jadeBalance < item.jade) {
            return { success: false, message: `仙玉不足！需要${item.jade}仙玉，当前${jadeBalance}仙玉` };
        }

        // 扣除仙玉
        this.game.gameState.resources.jade -= item.jade;

        // 根据类型发放商品
        let result = { success: true, message: `购买${item.name}成功！`, item: item };

        switch (item.type) {
            case 'equipment_box':
                const equipment = this.generateEquipmentBox(item.rarity);
                result.equipment = equipment;
                result.message = `购买${item.name}成功！获得：${equipment.rarityDisplayName} ${equipment.name}`;
                break;

            case 'item':
                if (item.item === 'breakthrough_stone') {
                    this.game.gameState.resources.breakthroughStones =
                        (this.game.gameState.resources.breakthroughStones || 0) + item.amount;
                    result.message = `购买${item.name}成功！突破石+${item.amount}`;
                }
                break;

            case 'exp':
                this.game.gameState.player.exp =
                    (this.game.gameState.player.exp || 0) + item.expAmount;
                result.message = `购买${item.name}成功！获得${item.expAmount}经验值`;
                // 检查升级
                if (this.game.checkLevelUp) {
                    this.game.checkLevelUp();
                }
                break;

            case 'reforge':
                // 重铸石放入背包，使用时选择装备
                if (!this.game.gameState.player.inventory.consumables) {
                    this.game.gameState.player.inventory.consumables = {};
                }
                this.game.gameState.player.inventory.consumables.reforge_stone =
                    (this.game.gameState.player.inventory.consumables.reforge_stone || 0) + 1;
                result.message = `购买${item.name}成功！可在背包中使用`;
                break;

            case 'fusion':
                // 合成石放入背包，合成装备时使用提高成功率
                if (!this.game.gameState.player.inventory.consumables) {
                    this.game.gameState.player.inventory.consumables = {};
                }
                this.game.gameState.player.inventory.consumables.fusion_stone =
                    (this.game.gameState.player.inventory.consumables.fusion_stone || 0) + 1;
                result.message = `购买${item.name}成功！合成装备时可使用`;
                break;
        }

        // 保存游戏
        if (this.game.saveGameState) {
            this.game.saveGameState();
        }

        return result;
    }

    // 生成保底品质装备箱
    generateEquipmentBox(rarity) {
        // 随机选择装备类型
        const templates = this.game.metadata.equipmentTemplates;
        const templateIndex = Math.floor(Math.random() * templates.length);
        const template = templates[templateIndex];
        const type = template.type;

        // 根据人物境界确定装备等级
        const realm = this.game.gameState.player.realm;
        const equipmentLevel = realm.currentRealm + 1;

        // 使用装备系统的生成函数
        const equipment = this.game.equipmentSystem.generateEquipment(type, equipmentLevel, rarity);
        return equipment;
    }

    // 重铸装备（重新随机属性，保留品质和等级）
    reforgeEquipment(slot) {
        const equipment = this.game.gameState.player.equipment[slot];
        if (!equipment) {
            return { success: false, message: '该槽位没有装备！' };
        }

        // 检查重铸石
        const reforgeStones = this.game.gameState.player.inventory.consumables?.reforge_stone || 0;
        if (reforgeStones <= 0) {
            return { success: false, message: '没有重铸石！' };
        }

        // 消耗重铸石
        this.game.gameState.player.inventory.consumables.reforge_stone -= 1;

        // 获取模板
        const template = this.game.metadata.equipmentTemplates.find(t => t.type === equipment.type);
        const rarityInfo = this.game.metadata.equipmentRarities.find(r => r.name === equipment.rarity);
        if (!template || !rarityInfo) {
            return { success: false, message: '装备数据异常！' };
        }

        // 重新随机属性
        const statCount = rarityInfo.statCount;
        const allStatNames = Object.keys(template.baseStats);
        const shuffledStats = allStatNames.sort(() => Math.random() - 0.5);
        const selectedStats = shuffledStats.slice(0, Math.min(statCount, allStatNames.length));

        const percentageStats = ['criticalRate', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen'];
        const stats = {};
        const rarityMultiplier = rarityInfo.multiplier;

        for (const statName of selectedStats) {
            const baseValue = template.baseStats[statName];
            const calculatedValue = baseValue * equipment.level * rarityMultiplier;
            if (percentageStats.includes(statName)) {
                stats[statName] = Math.round(calculatedValue * 100) / 100;
            } else {
                stats[statName] = Math.max(1, Math.floor(calculatedValue));
            }
        }

        // 更新装备属性
        equipment.stats = stats;

        // 保存
        if (this.game.saveGameState) {
            this.game.saveGameState();
        }

        return {
            success: true,
            message: `重铸成功！${equipment.rarityDisplayName} ${equipment.name} 属性已刷新`,
            equipment: equipment
        };
    }
}

// 挂载到全局（浏览器环境）
if (typeof window !== 'undefined') {
    window.JadeShop = JadeShop;
}

// 导出（Node/Vitest 环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JadeShop };
}