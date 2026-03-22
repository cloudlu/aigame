// 图鉴系统模块 (collectionSystem.js)
// 敌人图鉴 + 装备图鉴，记录/查询/奖励检查

class CollectionSystem {
    constructor(game) {
        this.game = game;
    }

    // 初始化（旧存档兼容）
    init() {
        if (!this.game.persistentState.collection) {
            this.game.persistentState.collection = {
                enemies: [],
                equipmentTypes: [],
                rewardedCategories: []
            };
        }
    }

    // ==================== 敌人图鉴 ====================

    // 获取所有地图及其敌人列表（从元数据构建）
    getEnemyCategories() {
        const mapNames = this.game.metadata.mapNames || {};
        const mapEnemyMapping = this.game.metadata.mapEnemyMapping || {};
        const mapRealmReq = this.game.metadata.mapRealmRequirements || {};
        const categories = [];
        for (const [mapId, enemies] of Object.entries(mapEnemyMapping)) {
            // 每个baseName有3种变体：普通、精英、Boss
            const allKeys = [];
            for (const baseName of enemies) {
                allKeys.push(baseName);            // 普通
                allKeys.push(baseName + '_elite'); // 精英
                allKeys.push('BOSS' + baseName);   // Boss
            }
            categories.push({
                mapId,
                name: mapNames[mapId] || mapId,
                realm: mapRealmReq[mapId]?.realm ?? 0,
                realmName: mapRealmReq[mapId]?.name || '',
                enemyKeys: allKeys
            });
        }
        return categories;
    }

    // 获取敌人图鉴总条目数
    getEnemyTotal() {
        const categories = this.getEnemyCategories();
        return categories.reduce((sum, cat) => sum + cat.enemyKeys.length, 0);
    }

    // 记录击杀敌人
    recordEnemy(enemy) {
        const collection = this.game.persistentState.collection;
        if (!collection) return;

        let key;
        if (enemy.isBoss) {
            key = 'BOSS' + enemy.baseName;
        } else if (enemy.isElite) {
            key = enemy.baseName + '_elite';
        } else {
            key = enemy.baseName;
        }

        if (!collection.enemies.includes(key)) {
            collection.enemies.push(key);
            this.checkAndGrantEnemyRewards();
        }
    }

    // 查询敌人是否已解锁
    isEnemyUnlocked(key) {
        return this.game.persistentState.collection?.enemies?.includes(key) || false;
    }

    // 获取敌人图鉴进度
    getEnemyProgress() {
        return {
            unlocked: (this.game.persistentState.collection?.enemies?.length) || 0,
            total: this.getEnemyTotal()
        };
    }

    // ==================== 装备图鉴 ====================

    // 获取装备分类列表（境界×品质）
    getEquipmentCategories() {
        const realmConfig = this.game.metadata.realmConfig || [];
        const rarities = this.game.metadata.equipmentRarities || [];
        const templates = this.game.metadata.equipmentTemplates || [];
        const categories = [];

        for (let realmIdx = 0; realmIdx < realmConfig.length; realmIdx++) {
            const realm = realmConfig[realmIdx];
            for (const rarity of rarities) {
                // 构建该分类下所有装备key
                const equipKeys = [];
                for (const template of templates) {
                    const suffixes = Array.isArray(template.nameSuffixes[0])
                        ? template.nameSuffixes[realmIdx]
                        : template.nameSuffixes;
                    if (suffixes) {
                        for (const suffix of suffixes) {
                            equipKeys.push(`${template.type}_${rarity.name}_${suffix}`);
                        }
                    }
                }
                categories.push({
                    realmIdx,
                    realmName: realm.name,
                    rarity,
                    equipKeys
                });
            }
        }
        return categories;
    }

    // 获取装备图鉴总条目数
    getEquipmentTotal() {
        const categories = this.getEquipmentCategories();
        return categories.reduce((sum, cat) => sum + cat.equipKeys.length, 0);
    }

    // 记录获取装备
    recordEquipment(equipment) {
        const collection = this.game.persistentState.collection;
        if (!collection || !equipment) return;

        const key = `${equipment.type}_${equipment.rarity}_${equipment.suffix}`;
        if (!collection.equipmentTypes.includes(key)) {
            collection.equipmentTypes.push(key);
            this.checkAndGrantEquipmentRewards();
        }
    }

    // 查询装备是否已解锁
    isEquipmentUnlocked(key) {
        return this.game.persistentState.collection?.equipmentTypes?.includes(key) || false;
    }

    // 获取装备图鉴进度
    getEquipmentProgress() {
        return {
            unlocked: (this.game.persistentState.collection?.equipmentTypes?.length) || 0,
            total: this.getEquipmentTotal()
        };
    }

    // ==================== 奖励系统 ====================

    // 检查并发放敌人图鉴奖励（按地图分类全解锁）
    checkAndGrantEnemyRewards() {
        const collection = this.game.persistentState.collection;
        if (!collection) return;

        const categories = this.getEnemyCategories();
        for (const cat of categories) {
            const rewardKey = `enemy_${cat.mapId}`;
            if (collection.rewardedCategories.includes(rewardKey)) continue;

            const allUnlocked = cat.enemyKeys.every(key => collection.enemies.includes(key));
            if (!allUnlocked) continue;

            // 发放奖励：经验丹×5(500经验) + 灵木×100
            collection.rewardedCategories.push(rewardKey);
            this.game.addBattleLog(`[图鉴] ${cat.name} 全解锁奖励：经验+2500，灵木+100！`);

            // 增加经验
            if (this.game.persistentState.player) {
                this.game.persistentState.player.exp = (this.game.persistentState.player.exp || 0) + 2500;
            }
            // 增加资源
            if (this.game.persistentState.resources) {
                this.game.persistentState.resources.wood = (this.game.persistentState.resources.wood || 0) + 100;
            }
        }
    }

    // 检查并发放装备图鉴奖励（按境界×品质分类全解锁）
    checkAndGrantEquipmentRewards() {
        const collection = this.game.persistentState.collection;
        if (!collection) return;

        const categories = this.getEquipmentCategories();
        for (const cat of categories) {
            const rewardKey = `equipment_${cat.realmIdx}_${cat.rarity.name}`;
            if (collection.rewardedCategories.includes(rewardKey)) continue;

            const allUnlocked = cat.equipKeys.every(key => collection.equipmentTypes.includes(key));
            if (!allUnlocked) continue;

            // 发放奖励：对应境界保底品质装备箱×1
            collection.rewardedCategories.push(rewardKey);
            this.game.addBattleLog(`[图鉴] ${cat.realmName}境·${cat.rarity.displayName}品质 全解锁奖励：保底${cat.rarity.displayName}装备箱×1！`);

            // 生成一件对应境界和品质的装备
            const level = cat.realmIdx + 1;
            const templates = this.game.metadata.equipmentTemplates;
            if (templates && templates.length > 0) {
                const templateIdx = Math.floor(Math.random() * templates.length);
                const equipment = this.game.equipmentSystem.generateEquipment(
                    templates[templateIdx].type, level, cat.rarity.name
                );
                // 放入背包
                if (!this.game.persistentState.player.inventory) {
                    this.game.persistentState.player.inventory = [];
                }
                if (!this.game.persistentState.player.inventory.items) {
                    this.game.persistentState.player.inventory.items = [];
                }
                this.game.persistentState.player.inventory.items.push(equipment);
                this.game.addBattleLog(`[图鉴] 获得保底装备：${equipment.rarityDisplayName} ${equipment.name}`);
            }
        }
    }

    // 查询分类是否已领奖
    isCategoryRewarded(categoryKey) {
        return this.game.persistentState.collection?.rewardedCategories?.includes(categoryKey) || false;
    }
}

// 挂载到全局（浏览器环境）
if (typeof window !== 'undefined') {
    window.CollectionSystem = CollectionSystem;
}

// 导出（Node/Vitest 环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CollectionSystem };
}
