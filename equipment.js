// 装备系统模块
class EquipmentSystem {
    constructor(game) {
        this.game = game;
    }

    // ==================== 装备槽位辅助方法 ====================

    // 获取槽位配置
    getSlotConfig(slot) {
        return this.game.metadata.equipmentSlotConfig?.[slot] || {
            name: slot, icon: 'fa-box', image: '', fallbackIcon: 'fa-box', order: 99
        };
    }

    // 获取所有槽位类型（按order排序）
    getAllSlotTypes() {
        const config = this.game.metadata.equipmentSlotConfig || {};
        return Object.keys(config).sort((a, b) => config[a].order - config[b].order);
    }

    // 判断是否为装备类型
    isEquipmentType(type) {
        return type in (this.game.metadata.equipmentSlotConfig || {});
    }

    // 获取品质索引 (0=白, 1=蓝, 2=紫, 3=金, 4=彩)
    getRarityIndex(rarity) {
        const rarityOrder = ['white', 'blue', 'purple', 'gold', 'rainbow'];
        return rarityOrder.indexOf(rarity);
    }

    // ==================== 装备掉落与生成 ====================
    
    // 生成装备掉落
    generateEquipmentDrop() {
        // 计算掉落概率（普通、精英、BOSS怪物不同掉落概率）
        let baseDropChance;
        if (this.game.gameState.enemy.isBoss) {
            baseDropChance = 1.0; // BOSS必定掉落
        } else if (this.game.gameState.enemy.isElite) {
            baseDropChance = 0.8; // 精英怪高掉落概率
        } else {
            baseDropChance = 0.5; // 普通怪物基础掉落概率
        }

        // 随机决定是否掉落
        if (Math.random() > baseDropChance) {
            return null;
        }

        // 随机选择装备类型
        const templateIndex = Math.floor(Math.random() * this.game.metadata.equipmentTemplates.length);
        const template = this.game.metadata.equipmentTemplates[templateIndex];
        const type = template.type;

        // 根据人物境界确定装备等级
        const realm = this.game.gameState.player.realm;
        const equipmentLevel = realm.currentRealm + 1; // 境界从0开始，装备等级从1开始

        // 使用 getRandomRarity() 获取随机品质（考虑怪物类型和幸运值）
        const rarity = this.getRandomRarity();

        // 使用统一的装备生成函数
        return this.generateEquipment(type, equipmentLevel, rarity);
    }
    
    // 随机获取装备品质（考虑怪物类型和幸运值）
    getRandomRarity() {
        // 从 metadata 获取掉率配置
        const dropRatesConfig = this.game.metadata.dropRates;

        // 根据怪物类型选择对应的掉率表
        let dropRates;
        if (this.game.gameState.enemy.isBoss) {
            dropRates = dropRatesConfig.boss;
        } else if (this.game.gameState.enemy.isElite) {
            dropRates = dropRatesConfig.elite;
        } else {
            dropRates = dropRatesConfig.normal;
        }

        // 考虑幸运值影响（每点幸运值提高0.5%的高品质装备掉率）
        const luck = this.game.gameState.player.luck || 0;
        const luckBonus = luck * 0.005;

        // 调整掉率，提高高品质装备的概率（彩色幸运加成降低）
        const adjustedRates = {
            white: Math.max(0, dropRates.white - luckBonus * 3),
            blue: Math.max(0, dropRates.blue - luckBonus * 1.5),
            purple: Math.max(0, dropRates.purple + luckBonus * 1),
            gold: Math.max(0, dropRates.gold + luckBonus * 1.5),
            rainbow: Math.max(0, dropRates.rainbow + luckBonus * 0.5)  // 幸运对彩色加成降低
        };

        // 归一化概率
        const totalProbability = Object.values(adjustedRates).reduce((sum, rate) => sum + rate, 0);
        const normalizedRates = {};
        for (const [rarity, rate] of Object.entries(adjustedRates)) {
            normalizedRates[rarity] = rate / totalProbability;
        }

        // 随机选择品质
        const rand = Math.random();
        let cumulativeProbability = 0;

        for (const [rarity, probability] of Object.entries(normalizedRates)) {
            cumulativeProbability += probability;
            if (rand <= cumulativeProbability) {
                return rarity;
            }
        }

        return "white"; // 默认白色
    }

    // 计算装备属性
    calculateEquipmentStats(template, level, rarityInfo) {
        const stats = {};
        const rarityMultiplier = rarityInfo ? rarityInfo.multiplier : 1;

        // 定义百分比属性列表（这些属性值小于1，表示百分比）
        const percentageStats = ['criticalRate', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen', 'critDamage'];

        // 计算基础属性
        for (const stat in template.baseStats) {
            const baseValue = template.baseStats[stat];
            const calculatedValue = baseValue * level * rarityMultiplier;

            if (percentageStats.includes(stat)) {
                // 百分比属性：保留2位小数
                stats[stat] = Math.round(calculatedValue * 100) / 100;
            } else {
                // 整数属性：向下取整
                stats[stat] = Math.floor(calculatedValue);
            }
        }

        return stats;
    }
    
    // 计算武器精炼所需材料
    calculateRefineCost(refineLevel) {
        // 基础材料需求
        const baseSpiritWood = 50;
        const baseBlackIron = 30;
        const baseSpiritCrystal = 10;
        
        // 每级精炼增加的材料倍数
        const multiplier = Math.pow(1.5, refineLevel);
        
        return {
            spiritWood: Math.floor(baseSpiritWood * multiplier),
            blackIron: Math.floor(baseBlackIron * multiplier),
            spiritCrystal: Math.floor(baseSpiritCrystal * multiplier)
        };
    }
    
    // 精炼装备
    refineEquipment(slot = 'weapon') {
        const item = this.game.gameState.player.equipment[slot];
        if (!item) {
            this.game.addBattleLog(`没有装备${this.getSlotDisplayName(slot)}，无法精炼！`);
            return;
        }
        
        // 确保refineLevel有值
        if (item.refineLevel === undefined) {
            item.refineLevel = 0;
        }
        
        // 检查是否已达到最大精炼等级
        if (item.refineLevel >= 10) {
            this.game.addBattleLog(`${this.getSlotDisplayName(slot)}已达到最大精炼等级+10！`);
            return;
        }
        
        // 计算精炼所需材料
        const nextLevel = item.refineLevel + 1;
        const cost = this.calculateRefineCost(item.refineLevel);
        
        // 检查材料是否足够
        if (this.game.gameState.resources.spiritWood < cost.spiritWood ||
            this.game.gameState.resources.blackIron < cost.blackIron ||
            this.game.gameState.resources.spiritCrystal < cost.spiritCrystal) {
            this.game.addBattleLog('材料不足，无法精炼装备！');
            return;
        }
        
        // 消耗材料
        this.game.gameState.resources.spiritWood -= cost.spiritWood;
        this.game.gameState.resources.blackIron -= cost.blackIron;
        this.game.gameState.resources.spiritCrystal -= cost.spiritCrystal;
        
        // 提升精炼等级
        item.refineLevel = nextLevel;

        // 记录精炼前战力
        const oldPower = this.game.calculatePlayerCombatPower();

        // 重新计算装备效果
        this.calculateEquipmentEffects();

        // 更新UI
        this.game.updateUI();

        // 更新人物属性面板
        if (typeof this.game.updateCharacterModal === 'function') {
            this.game.updateCharacterModal();
        }

        // 更新血条显示
        if (typeof this.game.updateHealthBars === 'function') {
            this.game.updateHealthBars();
        }

        // 添加日志
        this.game.addBattleLog(`${this.getSlotDisplayName(slot)}精炼成功！当前精炼等级：+${item.refineLevel}`);
        this.game.addBattleLog(`消耗了 ${cost.spiritWood} 灵木，${cost.blackIron} 玄铁，${cost.spiritCrystal} 灵石`);

        // 显示战力变化
        const newPower = this.game.calculatePlayerCombatPower();
        this.game.showCombatPowerChange(newPower - oldPower);
    }
    
    // 精炼武器（保留向后兼容）
    refineWeapon() {
        this.refineEquipment('weapon');
    }

    // 脱下装备
    unequipEquipment(slot = 'weapon') {
        const item = this.game.gameState.player.equipment[slot];
        if (!item) {
            this.game.addBattleLog(`${this.getSlotDisplayName(slot)}槽位没有装备！`);
            return false;
        }

        // 检查背包是否有空位
        if (this.game.gameState.player.inventory.length >= 50) {
            this.game.addBattleLog('背包已满，无法脱下装备！');
            return false;
        }

        // 保存装备名称用于日志
        const itemName = item.name;

        // 将装备从装备槽移到背包
        if (!Array.isArray(this.game.gameState.player.inventory)) {
            this.game.gameState.player.inventory = [];
        }
        this.game.gameState.player.inventory.push(item);
        this.game.gameState.player.equipment[slot] = null;

        // 更新UI
        this.game.updateUI();

        // 更新装备显示
        this.updateCharacterEquipmentDisplayModal();

        // 更新精炼信息
        this.updateRefineInfoModal(slot);

        // 更新血条显示
        if (typeof this.game.updateHealthBars === 'function') {
            this.game.updateHealthBars();
        }

        // 更新人物面板属性
        if (typeof this.game.updateCharacterModal === 'function') {
            this.game.updateCharacterModal();
        }

        // 添加日志
        this.game.addBattleLog(`脱下了 ${itemName}`);

        return true;
    }

    // 计算分解返还材料
    calculateDisassembleReturns(item) {
        // 确保refineLevel有值
        const refineLevel = item.refineLevel || 0;

        // 计算精炼材料返还（只返还50%的精炼材料，保持游戏经济平衡）
        let refineSpiritWood = 0;
        let refineBlackIron = 0;
        let refineSpiritCrystal = 0;

        // 计算从0级到当前精炼等级的所有材料消耗
        for (let i = 0; i < refineLevel; i++) {
            const cost = this.calculateRefineCost(i);
            refineSpiritWood += Math.floor(cost.spiritWood * 0.5);
            refineBlackIron += Math.floor(cost.blackIron * 0.5);
            refineSpiritCrystal += Math.floor(cost.spiritCrystal * 0.5);
        }

        // 计算品质材料返还
        let qualitySpiritWood = 0;
        let qualityBlackIron = 0;
        let qualitySpiritCrystal = 0;

        // 根据装备品质确定返还材料（仅支持标准品质：white, blue, purple, gold, rainbow）
        if (item.rarity) {
            switch (item.rarity) {
                case 'white':
                    qualitySpiritWood = 30;
                    qualityBlackIron = 15;
                    qualitySpiritCrystal = 5;
                    break;
                case 'blue':
                    qualitySpiritWood = 60;
                    qualityBlackIron = 30;
                    qualitySpiritCrystal = 12;
                    break;
                case 'purple':
                    qualitySpiritWood = 100;
                    qualityBlackIron = 50;
                    qualitySpiritCrystal = 20;
                    break;
                case 'gold':
                    qualitySpiritWood = 150;
                    qualityBlackIron = 75;
                    qualitySpiritCrystal = 30;
                    break;
                case 'rainbow':
                    qualitySpiritWood = 220;
                    qualityBlackIron = 110;
                    qualitySpiritCrystal = 50;
                    break;
                // 非标准品质不返还材料
            }
        }

        return {
            spiritWood: qualitySpiritWood + refineSpiritWood,
            blackIron: qualityBlackIron + refineBlackIron,
            spiritCrystal: qualitySpiritCrystal + refineSpiritCrystal
        };
    }
    
    // 根据稀有度和类型获取装备颜色
    getEquipmentColor(rarity, type = 'text') {
        const colorMap = {
            white: {
                text: 'text-gray-400',
                border: 'border-gray-400',
                color: '#9ca3af'
            },
            blue: {
                text: 'text-blue-400',
                border: 'border-blue-400',
                color: '#60a5fa'
            },
            purple: {
                text: 'text-purple-400',
                border: 'border-purple-400',
                color: '#a78bfa'
            },
            gold: {
                text: 'text-yellow-400',
                border: 'border-yellow-400',
                color: '#fbbf24'
            },
            rainbow: {
                text: 'text-pink-400',
                border: 'border-pink-400',
                color: '#f87171'
            }
        };

        // 处理中文稀有度名称
        const rarityMap = {
            '白色': 'white',
            '蓝色': 'blue',
            '紫色': 'purple',
            '黄金': 'gold',
            '彩色': 'rainbow'
        };

        const normalizedRarity = rarityMap[rarity] || rarity;
        return colorMap[normalizedRarity]?.[type] || colorMap.white[type];
    }
    
    // 获取装备的颜色类
    getEquipmentColorClass(item) {
        const rarity = item.rarityDisplayName || item.rarity;
        return this.getEquipmentColor(rarity, 'text');
    }
    
    // 清理装备的colorClass属性
    cleanupEquipmentColorClass() {
        // 清理已装备的装备
        if (this.game.gameState.player && this.game.gameState.player.equipment) {
            for (const slot in this.game.gameState.player.equipment) {
                const item = this.game.gameState.player.equipment[slot];
                if (item && item.colorClass) {
                    delete item.colorClass;
                }
            }
        }

        // 清理背包中的装备
        if (this.game.gameState.player && this.game.gameState.player.inventory) {
            const inventory = this.game.gameState.player.inventory;

            // 兼容旧版本：如果 inventory 是数组
            if (Array.isArray(inventory)) {
                inventory.forEach(item => {
                    if (item && item.colorClass) {
                        delete item.colorClass;
                    }
                });
            }
            // 新版本：inventory.items 是数组
            else if (inventory.items && Array.isArray(inventory.items)) {
                inventory.items.forEach(item => {
                    if (item && item.colorClass) {
                        delete item.colorClass;
                    }
                });
            }
        }
    }
    
    // 更新人物装备显示
    updateCharacterEquipmentDisplay() {
        if (!this.game.gameState.player?.equipment) {
            return;
        }

        const equipment = this.game.gameState.player.equipment;

        // 遍历所有装备槽位（从统一配置获取）
        for (const slot of this.getAllSlotTypes()) {
            const config = this.getSlotConfig(slot);
            const elementId = `character-${slot}`;
            const element = document.getElementById(elementId);
            const elementModal = document.getElementById(`${elementId}-modal`);
            const item = equipment[slot];

            // 更新主界面装备槽
            if (element) {
                this.updateSingleEquipmentSlot(element, item, slot, config.image);
            }
            // 更新弹框内装备槽
            if (elementModal) {
                this.updateSingleEquipmentSlot(elementModal, item, slot, config.image);
            }
        }
    }


    // 更新单个装备槽的通用方法
    updateSingleEquipmentSlot(element, item, slot, imageUrl) {
        if (item) {
            // 显示装备并设置图片
            element.style.opacity = '1';
            element.style.display = ''; // 重置display，防止之前onerror导致的display:none
            element.src = imageUrl || '';
            element.onerror = function() { this.style.display = 'none'; };

            // 根据装备品质设置边框颜色
            const container = element.parentElement;
            if (container) {
                const rarity = item.rarityDisplayName || item.rarity;
                container.style.borderColor = this.getEquipmentColor(rarity, 'color');

                // 隐藏占位图标（图标是container的第二个子元素）
                const placeholderIcon = container.querySelector('i.fa');
                if (placeholderIcon) {
                    placeholderIcon.style.display = 'none';
                }
            }
        } else {
            // 隐藏装备
            element.style.opacity = '0';
            element.src = '';
            const container = element.parentElement;
            if (container) {
                container.style.borderColor = 'rgba(74, 158, 255, 0.3)';

                // 显示占位图标
                const placeholderIcon = container.querySelector('i.fa');
                if (placeholderIcon) {
                    placeholderIcon.style.display = '';
                }
            }
        }
    }

    // 更新弹框内的装备槽显示
    updateCharacterEquipmentDisplayModal() {
        if (!this.game.gameState.player?.equipment) {
            return;
        }

        const equipment = this.game.gameState.player.equipment;

        // 从统一配置获取所有槽位
        for (const slot of this.getAllSlotTypes()) {
            const config = this.getSlotConfig(slot);
            const elementId = `character-${slot}-modal`;
            const element = document.getElementById(elementId);
            const item = equipment[slot];

            if (element) {
                this.updateSingleEquipmentSlot(element, item, slot, config.image);
            }
        }
    }

    // 更新精炼信息UI
    updateRefineInfo(selectedSlot = 'weapon') {
        const item = this.game.gameState.player.equipment[selectedSlot];
        const refineInfo = document.getElementById('refine-info');

        // 如果主界面的精炼面板不存在，直接返回（新界面设计）
        if (!refineInfo) {
            return;
        }

        // 从统一配置获取装备图片
        const equipmentImage = this.getSlotConfig(selectedSlot).image;

        if (item) {
            // 确保refineLevel有值
            if (item.refineLevel === undefined) {
                item.refineLevel = 0;
            }

            // 显示精炼信息
            refineInfo.classList.remove('hidden');

            // 更新装备图片
            const refineImage = document.getElementById('refine-equipment-image');
            const refineIcon = document.getElementById('refine-equipment-icon');
            if (refineImage && refineIcon) {
                const imgSrc = equipmentImage || '';
                if (imgSrc) {
                    refineImage.src = imgSrc;
                    refineImage.style.opacity = '1';
                    refineImage.style.display = 'block';
                    refineIcon.style.display = 'none';
                    refineImage.onerror = function() {
                        refineImage.style.opacity = '0';
                        refineIcon.style.display = 'block';
                    };
                }
            }

            // 更新装备名称
            const refineWeaponNameElement = document.getElementById('refine-weapon-name');
            if (refineWeaponNameElement) {
                refineWeaponNameElement.textContent = item.name;
                // 设置装备颜色
                const colorClass = this.getEquipmentColorClass(item);
                refineWeaponNameElement.className = `text-xs font-medium ${colorClass}`;
            }

            // 更新精炼等级
            const refineWeaponLevelElement = document.getElementById('refine-weapon-level');
            if (refineWeaponLevelElement) {
                refineWeaponLevelElement.textContent = `+${item.refineLevel}`;
            }

            // 计算下一级精炼所需材料
            const refineRequirementsElement = document.getElementById('refine-requirements');
            if (refineRequirementsElement) {
                if (item.refineLevel < 10) {
                    const cost = this.calculateRefineCost(item.refineLevel);
                    refineRequirementsElement.textContent =
                        `木:${cost.spiritWood} 铁:${cost.blackIron} 石:${cost.spiritCrystal}`;
                } else {
                    refineRequirementsElement.textContent = '已满级';
                }
            }
        } else {
            // 没有装备时隐藏精炼信息
            if (refineInfo) {
                refineInfo.classList.add('hidden');
            }
        }
    }

    // 更新弹框内的精炼信息
    updateRefineInfoModal(selectedSlot = 'weapon') {
        const item = this.game.gameState.player.equipment[selectedSlot];
        const refineInfoModal = document.getElementById('refine-info-modal');

        // 装备类型图片映射
        // 从统一配置获取装备图片
        const equipmentImage = this.getSlotConfig(selectedSlot).image;


        if (item) {
            // 确保refineLevel有值
            if (item.refineLevel === undefined) {
                item.refineLevel = 0;
            }

            // 更新装备图片
            const refineImage = document.getElementById('refine-equipment-image-modal');
            const refineIcon = document.getElementById('refine-equipment-icon-modal');
            if (refineImage && refineIcon) {
                const imgSrc = equipmentImage || '';
                if (imgSrc) {
                    refineImage.src = imgSrc;
                    refineImage.style.opacity = '1';
                    refineImage.style.display = 'block';
                    refineIcon.style.display = 'none';
                    refineImage.onerror = function() {
                        refineImage.style.opacity = '0';
                        refineIcon.style.display = 'block';
                    };
                }
            }

            // 更新装备名称
            const refineWeaponNameModal = document.getElementById('refine-weapon-name-modal');
            if (refineWeaponNameModal) {
                refineWeaponNameModal.textContent = item.name;
                const colorClass = this.getEquipmentColorClass(item);
                refineWeaponNameModal.className = `text-sm font-medium ${colorClass}`;
            }

            // 更新精炼等级
            const refineWeaponLevelModal = document.getElementById('refine-weapon-level-modal');
            if (refineWeaponLevelModal) {
                refineWeaponLevelModal.textContent = `+${item.refineLevel}`;
            }

            // 计算下一级精炼所需材料
            if (item.refineLevel < 10) {
                const cost = this.calculateRefineCost(item.refineLevel);
                const requirementsModal = document.getElementById('refine-requirements-modal');
                if (requirementsModal) {
                    requirementsModal.textContent = `木:${cost.spiritWood} 铁:${cost.blackIron} 石:${cost.spiritCrystal}`;
                }
            } else {
                const requirementsModal = document.getElementById('refine-requirements-modal');
                if (requirementsModal) {
                    requirementsModal.textContent = '已满级';
                }
            }

            // 更新装备属性详情
            this.updateRefineEquipmentStats(item);
        } else {
            // 没有装备时重置
            const refineImage = document.getElementById('refine-equipment-image-modal');
            const refineIcon = document.getElementById('refine-equipment-icon-modal');
            if (refineImage) refineImage.style.opacity = '0';
            if (refineIcon) refineIcon.style.display = 'block';


            const refineWeaponNameModal = document.getElementById('refine-weapon-name-modal');
            if (refineWeaponNameModal) {
                refineWeaponNameModal.textContent = '无';
                refineWeaponNameModal.className = 'text-sm font-medium text-white';
            }

            const refineWeaponLevelModal = document.getElementById('refine-weapon-level-modal');
            if (refineWeaponLevelModal) {
                refineWeaponLevelModal.textContent = '+0';
            }

            const requirementsModal = document.getElementById('refine-requirements-modal');
            if (requirementsModal) {
                requirementsModal.textContent = '请选择装备';
            }

            // 隐藏装备属性面板
            const statsPanel = document.getElementById('refine-equipment-stats-panel');
            if (statsPanel) {
                statsPanel.classList.add('hidden');
            }
        }

        // 同时更新装备详情面板（已移到精炼区域，不再需要）
    }

    // 更新精炼面板中的装备属性显示（显示原属性和加成）
    updateRefineEquipmentStats(item) {
        const statsPanel = document.getElementById('refine-equipment-stats-panel');
        const statsContainer = document.getElementById('refine-equipment-stats');

        if (!statsPanel || !statsContainer || !item || !item.stats) {
            if (statsPanel) statsPanel.classList.add('hidden');
            return;
        }

        // 显示属性面板
        statsPanel.classList.remove('hidden');

        const statNames = {
            attack: '攻击',
            defense: '防御',
            hp: '生命',
            maxEnergy: '灵力上限',
            luck: '幸运',
            speed: '速度',
            criticalRate: '暴击率',
            dodgeRate: '闪避率',
            tenacity: '韧性',
            accuracy: '命中率',
            moveSpeed: '移动速度',
            energyRegen: '灵力回复',
            critDamage: '暴击伤害'
        };

        const percentageStats = ['criticalRate', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen', 'critDamage'];

        // 格式化属性值
        const formatValue = (stat, value) => {
            if (percentageStats.includes(stat)) {
                return `${(value * 100).toFixed(1)}%`;
            }
            return Math.floor(value);
        };

        // 生成属性HTML
        const statsHtml = [];

        // 按优先级排序
        const statOrder = ['attack', 'defense', 'hp', 'luck', 'speed', 'criticalRate', 'critDamage', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen'];

        for (const stat of statOrder) {
            if (!item.stats[stat]) continue;

            // item.stats 存储的是基础属性（精炼不会修改它）
            const baseValue = item.stats[stat];
            const refineLevel = item.refineLevel || 0;

            // 精炼加成：百分比属性用百分比加成，整数属性用百分比+保底
            let bonusValue = 0;
            if (refineLevel > 0) {
                if (percentageStats.includes(stat)) {
                    // 百分比属性：纯百分比加成，不做保底
                    bonusValue = baseValue * refineLevel * 0.1;
                } else {
                    // 整数属性：保底每级+1
                    bonusValue = Math.max(refineLevel, Math.floor(baseValue * refineLevel * 0.1));
                }
            }

            const statName = statNames[stat] || stat;
            const baseStr = formatValue(stat, baseValue);

            if (refineLevel > 0 && bonusValue > 0) {
                // 有精炼加成，显示基础+加成
                const bonusStr = formatValue(stat, bonusValue);
                statsHtml.push(`
                    <div class="flex justify-between items-center py-0.5">
                        <span class="text-light/70">${statName}</span>
                        <div class="flex items-center gap-1">
                            <span class="text-light/80">${baseStr}</span>
                            <span class="text-accent text-xs">+${bonusStr}</span>
                        </div>
                    </div>
                `);
            } else {
                // 无精炼加成，只显示基础值
                statsHtml.push(`
                    <div class="flex justify-between items-center py-0.5">
                        <span class="text-light/70">${statName}</span>
                        <span class="text-light/80">${baseStr}</span>
                    </div>
                `);
            }
        }

        statsContainer.innerHTML = statsHtml.join('');
    }

    // 更新装备详情面板
    updateEquipmentDetailPanel(slot, item, imageMap) {
        const detailPanel = document.getElementById('equipment-detail-panel');
        if (!detailPanel) return;

        if (item) {
            detailPanel.classList.remove('hidden');

            // 更新装备图片
            const detailImage = document.getElementById('detail-equipment-image');
            const detailIcon = document.getElementById('detail-equipment-icon');
            if (detailImage && detailIcon) {
                const imgSrc = imageMap[slot] || '';
                if (imgSrc) {
                    detailImage.src = imgSrc;
                    detailImage.style.opacity = '1';
                    detailImage.style.display = 'block';
                    detailIcon.style.display = 'none';
                    detailImage.onerror = function() {
                        detailImage.style.opacity = '0';
                        detailIcon.style.display = 'block';
                    };
                }
            }

            // 更新装备名称
            const detailName = document.getElementById('detail-equipment-name');
            if (detailName) {
                detailName.textContent = item.name;
                const colorClass = this.getEquipmentColorClass(item);
                detailName.className = `text-sm font-bold ${colorClass}`;
            }

            // 更新等级和精炼
            const detailLevel = document.getElementById('detail-equipment-level');
            if (detailLevel) {
                detailLevel.textContent = item.realmName ? item.realmName : `Lv.${item.level}`;
            }

            const detailRefine = document.getElementById('detail-equipment-refine');
            if (detailRefine) {
                detailRefine.textContent = `+${item.refineLevel || 0}`;
            }

            // 更新属性列表
            const detailStats = document.getElementById('detail-equipment-stats');
            if (detailStats && item.stats) {
                const statsHtml = this.getStatsDescription(item.stats).split(', ').map(stat =>
                    `<div class="flex items-center gap-1"><i class="fa fa-circle text-accent text-xs" style="font-size: 4px;"></i>${stat}</div>`
                ).join('');
                detailStats.innerHTML = statsHtml;
            }
        } else {
            detailPanel.classList.add('hidden');
        }
    }



    // 获取槽位显示名称
    getSlotDisplayName(slot) {
        return this.getSlotConfig(slot).name || slot;
    }

    // 计算装备刷新所需材料
    calculateRefreshCost(equipment) {
        // 基础材料需求
        const baseSpiritWood = 30;
        const baseBlackIron = 20;
        const baseSpiritCrystal = 10;

        // 品质系数
        const rarityMultipliers = {
            white: 1.0,
            blue: 1.5,
            purple: 2.0,
            gold: 2.8,
            rainbow: 4.0
        };

        const rarityMultiplier = rarityMultipliers[equipment.rarity] || 1.0;

        // 精炼系数（每级+15%）
        const refineLevel = equipment.refineLevel || 0;
        const refineMultiplier = 1 + (refineLevel * 0.15);

        // 计算最终消耗
        const totalMultiplier = rarityMultiplier * refineMultiplier;

        return {
            spiritWood: Math.floor(baseSpiritWood * totalMultiplier),
            blackIron: Math.floor(baseBlackIron * totalMultiplier),
            spiritCrystal: Math.floor(baseSpiritCrystal * totalMultiplier)
        };
    }

    // 刷新装备属性（预览模式）
    previewRefreshStats(slot = 'weapon') {
        const item = this.game.gameState.player.equipment[slot];
        if (!item) {
            this.game.addBattleLog(`没有装备${this.getSlotDisplayName(slot)}，无法刷新属性！`);
            return false;
        }

        // 计算刷新所需材料
        const cost = this.calculateRefreshCost(item);

        // 检查材料是否足够
        if (this.game.gameState.resources.spiritWood < cost.spiritWood ||
            this.game.gameState.resources.blackIron < cost.blackIron ||
            this.game.gameState.resources.spiritCrystal < cost.spiritCrystal) {
            this.game.addBattleLog('材料不足，无法刷新装备属性！');
            return false;
        }

        // 获取装备模板和品质信息
        const template = this.game.metadata.equipmentTemplates.find(t => t.type === item.type);
        const rarityInfo = this.game.metadata.equipmentRarities.find(r => r.name === item.rarity);

        if (!template) {
            this.game.addBattleLog('装备模板错误，无法刷新！');
            return false;
        }

        // 保存旧的属性
        const oldStats = { ...item.stats };
        const oldName = item.name;

        // 立即消耗材料（刷新即消耗，无论是否接受结果）
        this.game.gameState.resources.spiritWood -= cost.spiritWood;
        this.game.gameState.resources.blackIron -= cost.blackIron;
        this.game.gameState.resources.spiritCrystal -= cost.spiritCrystal;

        // 根据品质获取属性条数限制
        const statCount = rarityInfo ? rarityInfo.statCount : 1;

        // 从模板的baseStats中随机选择statCount个属性
        const allStatNames = Object.keys(template.baseStats);
        const shuffledStats = allStatNames.sort(() => Math.random() - 0.5);
        const selectedStats = shuffledStats.slice(0, Math.min(statCount, allStatNames.length));

        // 计算选中属性的值
        const rarityMultiplier = rarityInfo ? rarityInfo.multiplier : 1;
        const percentageStats = ['criticalRate', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen', 'critDamage'];
        const newStats = {};

        for (const statName of selectedStats) {
            const baseValue = template.baseStats[statName];
            // 添加随机浮动（80%~120%），使每次刷新结果不同
            const variance = 0.8 + Math.random() * 0.4;
            const calculatedValue = baseValue * item.level * rarityMultiplier * variance;

            if (percentageStats.includes(statName)) {
                newStats[statName] = Math.round(calculatedValue * 100) / 100;
            } else {
                newStats[statName] = Math.floor(calculatedValue);
            }
        }

        // 生成新名称（按境界×品质分级）
        const rarityIdx = this.getRarityIndex(item.rarity);
        const realmIdx = Math.min(Math.max(0, item.level - 1), (this.game.metadata.equipmentPrefixesByRealm?.length || 1) - 1);
        const prefixes = this.game.metadata.equipmentPrefixesByRealm?.[realmIdx] || ["", "", "", "", ""];
        const prefix = prefixes[rarityIdx] || "";
        const suffixIndex = Math.floor(Math.random() * template.nameSuffixes.length);
        const suffix = template.nameSuffixes[suffixIndex] || "装备";
        const newName = prefix + suffix;

        // 保存预览数据到临时状态
        this.pendingRefresh = {
            slot: slot,
            oldStats: oldStats,
            oldName: oldName,
            newStats: newStats,
            newName: newName,
            cost: cost
        };

        // 更新UI显示资源消耗
        this.game.updateUI();

        // 显示确认模态框
        this.showRefreshConfirmModal(slot, oldStats, newStats, oldName, newName, cost);

        return true;
    }

    // 显示刷新确认模态框
    showRefreshConfirmModal(slot, oldStats, newStats, oldName, newName, cost) {
        // 移除已存在的模态框
        const existingModal = document.getElementById('refresh-confirm-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // 生成属性对比HTML
        const comparisonHtml = this.generateStatsComparisonHtml(oldStats, newStats);

        const modalHtml = `
            <div id="refresh-confirm-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div class="bg-dark border border-glass rounded-xl p-6 max-w-lg w-full mx-4">
                    <h3 class="text-xl font-bold text-accent mb-2 text-center">装备属性刷新预览</h3>
                    <div class="text-center text-sm text-light/70 mb-3">${this.getSlotDisplayName(slot)} · ${oldName} → ${newName}</div>

                    <div class="bg-dark/50 rounded-lg p-4 mb-4">
                        <div class="text-xs text-light/60 mb-2 text-center">
                            消耗: <span class="text-light/80">${cost.spiritWood}</span> 灵木,
                            <span class="text-light/80">${cost.blackIron}</span> 玄铁,
                            <span class="text-light/80">${cost.spiritCrystal}</span> 灵石
                        </div>

                        <div class="border-t border-glass/30 pt-3 mt-2">
                            <div class="space-y-1">
                                ${comparisonHtml}
                            </div>
                        </div>
                    </div>

                    <div class="flex space-x-3">
                        <button id="cancel-refresh-btn" class="flex-1 bg-dark border border-glass rounded-lg px-4 py-2 text-light hover:bg-dark/80 transition-all flex items-center justify-center">
                            <i class="fa fa-times mr-2"></i> 取消
                        </button>
                        <button id="confirm-refresh-btn" class="flex-1 bg-success rounded-lg px-4 py-2 text-white font-medium hover:bg-success/80 transition-all flex items-center justify-center">
                            <i class="fa fa-check mr-2"></i> 确认刷新
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 绑定按钮事件
        document.getElementById('cancel-refresh-btn').addEventListener('click', () => {
            this.cancelRefreshStats();
        });

        document.getElementById('confirm-refresh-btn').addEventListener('click', () => {
            this.confirmRefreshStats();
        });
    }

    // 生成属性对比HTML（显示变化情况）
    generateStatsComparisonHtml(oldStats, newStats) {
        const statNames = {
            attack: '攻击',
            defense: '防御',
            hp: '生命',
            maxEnergy: '灵力上限',
            luck: '幸运',
            speed: '速度',
            criticalRate: '暴击率',
            dodgeRate: '闪避率',
            tenacity: '韧性',
            accuracy: '命中率',
            moveSpeed: '移动速度',
            energyRegen: '灵力回复',
            critDamage: '暴击伤害'
        };

        const percentageStats = ['criticalRate', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen', 'critDamage'];

        // 格式化属性值
        const formatValue = (stat, value) => {
            if (percentageStats.includes(stat)) {
                return `+${(value * 100).toFixed(1)}%`;
            }
            return `+${value}`;
        };

        // 获取所有涉及的属性
        const allStats = new Set([...Object.keys(oldStats), ...Object.keys(newStats)]);
        const lines = [];

        // 按优先级排序
        const statOrder = ['attack', 'defense', 'hp', 'luck', 'speed', 'criticalRate', 'critDamage', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen'];
        const sortedStats = [...allStats].sort((a, b) => {
            return statOrder.indexOf(a) - statOrder.indexOf(b);
        });

        for (const stat of sortedStats) {
            if (!statNames[stat]) continue;

            const oldValue = oldStats[stat];
            const newValue = newStats[stat];
            const statName = statNames[stat];

            if (oldValue !== undefined && newValue !== undefined) {
                // 属性都存在，比较变化
                if (newValue > oldValue) {
                    // 变好了
                    lines.push(`
                        <div class="flex justify-between items-center py-1">
                            <span class="text-light/80">${statName}</span>
                            <div class="flex items-center space-x-2">
                                <span class="text-light/50 line-through">${formatValue(stat, oldValue)}</span>
                                <span class="text-success">→ ${formatValue(stat, newValue)} ↑</span>
                            </div>
                        </div>
                    `);
                } else if (newValue < oldValue) {
                    // 变差了
                    lines.push(`
                        <div class="flex justify-between items-center py-1">
                            <span class="text-light/80">${statName}</span>
                            <div class="flex items-center space-x-2">
                                <span class="text-light/50 line-through">${formatValue(stat, oldValue)}</span>
                                <span class="text-danger">→ ${formatValue(stat, newValue)} ↓</span>
                            </div>
                        </div>
                    `);
                } else {
                    // 没变化
                    lines.push(`
                        <div class="flex justify-between items-center py-1">
                            <span class="text-light/80">${statName}</span>
                            <span class="text-light/70">${formatValue(stat, newValue)}</span>
                        </div>
                    `);
                }
            } else if (oldValue === undefined && newValue !== undefined) {
                // 新增属性
                lines.push(`
                    <div class="flex justify-between items-center py-1">
                        <span class="text-light/80">${statName}</span>
                        <span class="text-accent">${formatValue(stat, newValue)} +新增</span>
                    </div>
                `);
            } else if (oldValue !== undefined && newValue === undefined) {
                // 删除属性
                lines.push(`
                    <div class="flex justify-between items-center py-1">
                        <span class="text-light/50">${statName}</span>
                        <span class="text-light/40 line-through">${formatValue(stat, oldValue)} -移除</span>
                    </div>
                `);
            }
        }

        return lines.join('');
    }

    // 生成属性列表HTML（保留用于其他地方）
    generateStatsListHtml(stats, colorClass) {
        const statNames = {
            attack: '攻击',
            defense: '防御',
            hp: '生命',
            maxEnergy: '灵力上限',
            luck: '幸运',
            speed: '速度',
            criticalRate: '暴击率',
            dodgeRate: '闪避率',
            tenacity: '韧性',
            accuracy: '命中率',
            moveSpeed: '移动速度',
            energyRegen: '灵力回复',
            critDamage: '暴击伤害'
        };

        const percentageStats = ['criticalRate', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen', 'critDamage'];

        const lines = [];
        for (const stat in stats) {
            if (statNames[stat]) {
                const value = stats[stat];
                let valueStr;
                if (percentageStats.includes(stat)) {
                    valueStr = `+${(value * 100).toFixed(1)}%`;
                } else {
                    valueStr = `+${value}`;
                }
                lines.push(`<div class="${colorClass}">${statNames[stat]}: ${valueStr}</div>`);
            }
        }

        return lines.join('');
    }

    // 确认刷新属性
    confirmRefreshStats() {
        if (!this.pendingRefresh) {
            this.game.addBattleLog('没有待确认的刷新操作！');
            return false;
        }

        const { slot, oldStats, newStats, newName } = this.pendingRefresh;
        const item = this.game.gameState.player.equipment[slot];

        if (!item) {
            this.closeRefreshConfirmModal();
            this.pendingRefresh = null;
            return false;
        }

        // 应用新属性（资源已在预览时扣除）
        const oldPower = this.game.calculatePlayerCombatPower();
        item.stats = newStats;
        item.name = newName;
        item.id = `${item.type}_${item.level}_${item.rarity}_${Math.floor(Math.random() * 100000)}`;

        // 重新计算装备效果
        this.calculateEquipmentEffects();

        // 更新UI
        this.game.updateUI();
        if (typeof this.game.updateCharacterModal === 'function') {
            this.game.updateCharacterModal();
        }
        if (typeof this.game.updateHealthBars === 'function') {
            this.game.updateHealthBars();
        }

        // 添加日志
        const oldStatsDesc = this.getStatsDescription(oldStats);
        const newStatsDesc = this.getStatsDescription(newStats);
        this.game.addBattleLog(`${this.getSlotDisplayName(slot)}属性刷新成功！`);
        this.game.addBattleLog(`原属性: ${oldStatsDesc}`);
        this.game.addBattleLog(`新属性: ${newStatsDesc}`);

        // 显示战力变化
        const newPower = this.game.calculatePlayerCombatPower();
        this.game.showCombatPowerChange(newPower - oldPower);

        // 关闭模态框
        this.closeRefreshConfirmModal();
        this.pendingRefresh = null;

        return true;
    }

    // 取消刷新属性
    cancelRefreshStats() {
        this.closeRefreshConfirmModal();
        this.pendingRefresh = null;
        this.game.addBattleLog('取消了装备属性刷新');
    }

    // 关闭刷新确认模态框
    closeRefreshConfirmModal() {
        const modal = document.getElementById('refresh-confirm-modal');
        if (modal) {
            modal.remove();
        }
    }

    // 计算装备效果
    calculateEquipmentEffects() {
        // 初始化装备效果，包含所有可能的属性
        this.game.gameState.player.equipmentEffects = {
            attack: 0,
            defense: 0,
            hp: 0,
            maxEnergy: 0,
            luck: 0,
            speed: 0,
            criticalRate: 0,
            critDamage: 0,  // 暴击伤害值
            dodgeRate: 0,
            accuracy: 0,
            moveSpeed: 0,
            tenacity: 0,
            energyRegen: 0
        };
        
        // 遍历所有装备槽位
        for (const slot in this.game.gameState.player.equipment) {
            const item = this.game.gameState.player.equipment[slot];
            if (item && item.stats) {
                // 计算基础属性
                const percentageStats = ['criticalRate', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen', 'critDamage'];
                for (const stat in item.stats) {
                    const refineLevel = item.refineLevel || 0;
                    let bonus = 0;
                    if (refineLevel > 0) {
                        if (percentageStats.includes(stat)) {
                            // 百分比属性：固定成长（每级+0.5%），不受装备基础值影响
                            bonus = 0.005 * refineLevel;
                        } else {
                            // 整数属性：保底每级+1
                            bonus = Math.max(refineLevel, Math.floor(item.stats[stat] * refineLevel * 0.1));
                        }
                    }
                    if (this.game.gameState.player.equipmentEffects[stat] !== undefined) {
                        this.game.gameState.player.equipmentEffects[stat] += item.stats[stat] + bonus;
                    } else {
                        this.game.gameState.player.equipmentEffects[stat] = item.stats[stat] + bonus;
                    }
                }
            }
        }

        // 叠加VIP等级加成
        if (this.game.vipSystem) {
            const bonus = this.game.vipSystem.getBonus();
            const effects = this.game.gameState.player.equipmentEffects;
            if (bonus.attackBonus > 0) {
                effects.attack = Math.floor(effects.attack * (1 + bonus.attackBonus / 100));
            }
            if (bonus.defenseBonus > 0) {
                effects.defense = Math.floor(effects.defense * (1 + bonus.defenseBonus / 100));
            }
            if (bonus.hpBonus > 0) {
                effects.hp = Math.floor(effects.hp * (1 + bonus.hpBonus / 100));
            }
            if (bonus.critBonus > 0) {
                // VIP暴击加成：从百分比格式转换为小数格式（除以100）
                effects.criticalRate = (effects.criticalRate || 0) + (bonus.critBonus / 100);
            }
        }
    }

    // 获取属性描述
    getStatsDescription(stats) {
        if (!stats) return '';

        const statNames = {
            attack: '攻击',
            defense: '防御',
            hp: '生命',
            maxEnergy: '灵力上限',
            luck: '幸运',
            speed: '速度',
            criticalRate: '暴击率',
            dodgeRate: '闪避率',
            tenacity: '韧性',
            accuracy: '命中率',
            moveSpeed: '移动速度',
            energyRegen: '灵力回复',
            critDamage: '暴击伤害'
        };

        // 百分比属性列表
        const percentageStats = ['criticalRate', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen', 'critDamage'];

        const descriptions = [];
        for (const stat in stats) {
            if (statNames[stat]) {
                const value = stats[stat];
                if (percentageStats.includes(stat)) {
                    // 百分比属性：转换为百分比显示
                    const percentage = (value * 100).toFixed(1);
                    descriptions.push(`${statNames[stat]}: +${percentage}%`);
                } else {
                    // 整数属性：直接显示
                    descriptions.push(`${statNames[stat]}: +${value}`);
                }
            }
        }

        return descriptions.join(', ');
    }
    
    // 一键装备最好的装备
    autoEquipBestGear() {
        // 确保背包存在
        if (!this.game.gameState.player.inventory) {
            this.game.addBattleLog('背包为空，无法一键装备！');
            return;
        }

        // 装备槽位列表
        const equipmentSlots = this.getAllSlotTypes();
        let equippedCount = 0;

        // 遍历每个装备槽位
        for (const slot of equipmentSlots) {
            // 从背包中筛选出适合该槽位的装备
            const suitableItems = this.game.gameState.player.inventory.filter(item =>
                item.type === slot &&
                (!item.level || item.level <= this.game.calculateTotalLevel())
            );

            if (suitableItems.length > 0) {
                // ✅ 按战力排序（从高到低），选择最好的装备
                suitableItems.sort((a, b) => {
                    const powerA = this.game.calculateEquipmentCombatPower(a);
                    const powerB = this.game.calculateEquipmentCombatPower(b);
                    return powerB - powerA;  // 战力从高到低
                });

                const bestItem = suitableItems[0];
                const currentItem = this.game.gameState.player.equipment[slot];

                // 用战力比较：新装备战力 > 当前装备战力 才替换
                const newItemPower = this.game.calculateEquipmentCombatPower(bestItem);
                const currentItemPower = currentItem ? this.game.calculateEquipmentCombatPower(currentItem) : 0;

                if (!currentItem || newItemPower > currentItemPower) {

                    // 卸下当前装备（如果有）
                    if (currentItem) {
                        this.game.gameState.player.inventory.push(currentItem);
                    }

                    // 装备新装备
                    this.game.gameState.player.equipment[slot] = bestItem;

                    // 从背包中移除新装备
                    const itemIndex = this.game.gameState.player.inventory.indexOf(bestItem);
                    if (itemIndex > -1) {
                        this.game.gameState.player.inventory.splice(itemIndex, 1);
                    }

                    equippedCount++;
                }
            }
        }

        // 重新计算装备效果
        this.calculateEquipmentEffects();

        // 更新UI（会再次调用calculateEquipmentEffects）
        this.game.updateUI();

        // 更新人物面板属性（内部会调用updateCharacterEquipmentDisplayModal）
        this.updateCharacterEquipmentDisplay();
        if (typeof this.game.updateCharacterModal === 'function') {
            this.game.updateCharacterModal();
        }

        // 添加日志
        if (equippedCount > 0) {
            this.game.addBattleLog(`一键装备完成，共装备了 ${equippedCount} 件装备！`);
        } else {
            this.game.addBattleLog('没有找到更好的装备！');
        }
    }
    
    // 生成装备（统一接口）
    generateEquipment(type, level, rarity) {
        // 找到对应类型的装备模板
        const template = this.game.metadata.equipmentTemplates.find(t => t.type === type);
        if (!template) {
            console.warn(`未找到装备类型 ${type} 的模板，生成默认装备`);
            // 如果找不到模板，返回一个基础装备
            return {
                id: `${type}_${level}_${rarity}_${Math.floor(Math.random() * 1000)}`,
                name: `${rarity} ${type}`,
                type: type,
                level: level,
                refineLevel: 0,
                stats: {
                    attack: 10 * level,
                    defense: 5 * level
                },
                description: `${rarity}品质的${type}`,
                rarity: rarity,
                rarityDisplayName: rarity,
                rarityMultiplier: 1
            };
        }

        // 获取品质信息
        const rarityInfo = this.game.metadata.equipmentRarities.find(r => r.name === rarity);
        const rarityMultiplier = rarityInfo ? rarityInfo.multiplier : 1;
        const pctMultiplier = rarityInfo ? rarityInfo.pctMultiplier : 1;  // 百分比属性乘数

        // 获取境界系数（用于百分比属性）
        const realmIndex = Math.max(0, level - 1);  // level从1开始，realm从0开始
        const realmConfig = this.game.metadata.realmConfig?.[realmIndex];
        const pctFactor = realmConfig?.pctFactor || 1.0;

        // 根据品质获取属性条数限制
        const statCount = rarityInfo ? rarityInfo.statCount : 1;

        // 从模板的baseStats中随机选择statCount个属性
        const allStatNames = Object.keys(template.baseStats);
        const shuffledStats = allStatNames.sort(() => Math.random() - 0.5);
        const selectedStats = shuffledStats.slice(0, Math.min(statCount, allStatNames.length));

        // 计算选中属性的值
        const percentageStats = ['criticalRate', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen', 'critDamage'];
        const stats = {};

        for (const statName of selectedStats) {
            const baseValue = template.baseStats[statName];

            if (percentageStats.includes(statName)) {
                // 百分比属性：baseValue × pctMultiplier × pctFactor（不乘level）
                const calculatedValue = baseValue * pctMultiplier * pctFactor;
                stats[statName] = Math.round(calculatedValue * 1000) / 1000;  // 保留3位小数
            } else {
                // 整数属性：baseValue × level × multiplier（原公式）
                const calculatedValue = baseValue * level * rarityMultiplier;
                stats[statName] = Math.max(1, Math.floor(calculatedValue));
            }
        }

        // 生成装备名称（按境界×品质分级）
        const rarityIdx = this.getRarityIndex(rarity);
        const realmIdx = Math.min(Math.max(0, level - 1), (this.game.metadata.equipmentPrefixesByRealm?.length || 1) - 1);
        const prefixes = this.game.metadata.equipmentPrefixesByRealm?.[realmIdx] || ["", "", "", "", ""];
        const prefix = prefixes[rarityIdx] || "";
        // 二维数组：nameSuffixes[realmIdx][suffixIndex]
        const suffixPool = Array.isArray(template.nameSuffixes[0]) ? template.nameSuffixes[realmIdx] : template.nameSuffixes;
        const suffixIndex = Math.floor(Math.random() * suffixPool.length);
        const suffix = suffixPool[suffixIndex] || "装备";
        const name = prefix + suffix;

        // 获取境界名称
        const realmIdxForName = Math.max(0, level - 1); // level从1开始，realm从0开始
        const realmName = this.game.metadata.realmConfig?.[realmIdxForName]?.name || `等级${level}`;

        // 创建装备对象
        return {
            id: `${type}_${level}_${rarity}_${Math.floor(Math.random() * 1000)}`,
            name: name,
            type: type,
            suffix: suffix,
            level: level,
            realmName: realmName,
            refineLevel: 0,
            stats: stats,
            description: `${rarityInfo ? rarityInfo.displayName : rarity}品质的${type}`,
            rarity: rarity,
            rarityDisplayName: rarityInfo ? rarityInfo.displayName : rarity,
            rarityMultiplier: rarityInfo ? rarityInfo.multiplier : 1
        };
    }
    
    // 检查装备是否已装备
    isEquipmentEquipped(item) {
        const player = this.game.gameState.player;
        if (!player || !player.equipment) return false;
        
        // 检查各个装备槽位
        const equipmentSlots = this.getAllSlotTypes();
        for (const slot of equipmentSlots) {
            const equippedItem = player.equipment[slot];
            if (equippedItem && equippedItem.id === item.id) {
                return true;
            }
        }
        return false;
    }
    
    // 获取装备图标
    getEquipmentIcon(type) {
        return this.getSlotConfig(type).fallbackIcon || 'fa-box';
    }
    
    // 获取品质颜色（向后兼容方法）
    getRarityColor(rarity) {
        return this.getEquipmentColor(rarity, 'text');
    }
}

// 导出装备系统
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EquipmentSystem;
} else {
    window.EquipmentSystem = EquipmentSystem;
}