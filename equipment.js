// 装备系统模块
class EquipmentSystem {
    constructor(game) {
        this.game = game;
    }
    
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

        // 调整掉率，提高高品质装备的概率
        const adjustedRates = {
            white: Math.max(0, dropRates.white - luckBonus * 3),
            blue: Math.max(0, dropRates.blue - luckBonus * 1.5),
            purple: Math.max(0, dropRates.purple + luckBonus * 1),
            gold: Math.max(0, dropRates.gold + luckBonus * 1.5),
            rainbow: Math.max(0, dropRates.rainbow + luckBonus * 2)
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
        const percentageStats = ['criticalRate', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen'];

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
            this.game.addBattleLog(`没有装备${slot === 'weapon' ? '武器' : slot === 'armor' ? '护甲' : slot === 'helmet' ? '头盔' : slot === 'boots' ? '靴子' : '饰品'}，无法精炼！`);
            return;
        }
        
        // 确保refineLevel有值
        if (item.refineLevel === undefined) {
            item.refineLevel = 0;
        }
        
        // 检查是否已达到最大精炼等级
        if (item.refineLevel >= 10) {
            this.game.addBattleLog(`${slot === 'weapon' ? '武器' : slot === 'armor' ? '护甲' : slot === 'helmet' ? '头盔' : slot === 'boots' ? '靴子' : '饰品'}已达到最大精炼等级+10！`);
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
        
        // 重新计算装备效果
        this.calculateEquipmentEffects();
        
        // 更新UI
        this.game.updateUI();
        
        // 更新血条显示
        if (typeof this.game.updateHealthBars === 'function') {
            this.game.updateHealthBars();
        }
        
        // 添加日志
        this.game.addBattleLog(`${slot === 'weapon' ? '武器' : slot === 'armor' ? '护甲' : slot === 'helmet' ? '头盔' : slot === 'boots' ? '靴子' : '饰品'}精炼成功！当前精炼等级：+${item.refineLevel}`);
        this.game.addBattleLog(`消耗了 ${cost.spiritWood} 灵木，${cost.blackIron} 玄铁，${cost.spiritCrystal} 灵晶`);
    }
    
    // 精炼武器（保留向后兼容）
    refineWeapon() {
        this.refineEquipment('weapon');
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

        // 根据装备品质确定返还材料
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
            this.game.gameState.player.inventory.forEach(item => {
                if (item && item.colorClass) {
                    delete item.colorClass;
                }
            });
        }
    }
    
    // 更新人物装备显示
    updateCharacterEquipmentDisplay() {
        // 确保玩家装备存在
        if (!this.game.gameState.player || !this.game.gameState.player.equipment) {
            return;
        }
        
        const equipment = this.game.gameState.player.equipment;
        
        // 装备槽位映射
        const equipmentSlots = {
            'weapon': 'character-weapon',
            'armor': 'character-armor',
            'helmet': 'character-helmet',
            'boots': 'character-boots',
            'accessory': 'character-accessory',
            'pants': 'character-pants'
        };
        
        // 遍历所有装备槽位
        for (const slot in equipmentSlots) {
            const elementId = equipmentSlots[slot];
            const element = document.getElementById(elementId);
            
            if (element) {
                const item = equipment[slot];
                
                if (item) {
                    // 显示装备
                    element.style.opacity = '1';
                    
                    // 根据装备品质设置颜色
                    let colorClass = this.getEquipmentColorClass(item);
                    
                    element.className = element.className.replace(/quality-\w+/g, '');
                    element.classList.add(colorClass);
                    
                    // 根据装备品质设置边框颜色
                    const container = element.parentElement;
                    const rarity = item.rarity || item.rarityDisplayName;
                    
                    // 使用getEquipmentColor函数获取边框颜色
                    container.style.borderColor = this.getEquipmentColor(rarity, 'color');
                    
                    // 更新装备提示窗口
                    const tooltip = container.querySelector('.equipment-tooltip');
                    if (tooltip) {
                        // 填充装备信息
                        const nameElement = tooltip.querySelector('.equipment-name');
                        const levelElement = tooltip.querySelector('.equipment-level');
                        const qualityElement = tooltip.querySelector('.equipment-quality');
                        const refineElement = tooltip.querySelector('.equipment-refine');
                        const statsElement = tooltip.querySelector('.equipment-stats');
                        const imageElement = tooltip.querySelector('.equipment-image');
                        
                        if (nameElement) {
                            nameElement.textContent = item.name;
                            // 根据装备品质设置装备名称颜色
                            nameElement.className = `font-bold ${colorClass}`;
                        }
                        if (levelElement) {
                            levelElement.textContent = item.realmName ? item.realmName : item.level;
                        }
                        if (qualityElement) {
                            qualityElement.textContent = item.rarityDisplayName || '白色';
                            // 根据装备品质设置品质文本颜色
                            qualityElement.className = `equipment-quality ${colorClass}`;
                        }
                        if (refineElement) {
                            refineElement.textContent = `+${item.refineLevel || 0}`;
                        }
                        if (statsElement) {
                            const statsDescription = this.getStatsDescription(item.stats);
                            statsElement.textContent = statsDescription;
                        }
                        if (imageElement) {
                            // 设置装备图片
                            const equipmentImage = element.src;
                            imageElement.src = equipmentImage;
                            imageElement.alt = item.name;
                            imageElement.style.display = 'block';
                        }
                        // 显示图片容器
                        const imageContainer = tooltip.querySelector('.w-32');
                        if (imageContainer) {
                            imageContainer.style.display = 'flex';
                        }
                    }
                    // 绑定鼠标悬停事件
                    container.addEventListener('mouseenter', () => {
                        const tooltip = container.querySelector('.equipment-tooltip');
                        if (tooltip && item) {
                            tooltip.classList.remove('hidden');
                        }
                    });
                    
                    container.addEventListener('mouseleave', () => {
                        const tooltip = container.querySelector('.equipment-tooltip');
                        if (tooltip) {
                            tooltip.classList.add('hidden');
                        }
                    });
                } else {
                    // 隐藏装备
                    element.style.opacity = '0';
                    // 清除颜色类
                    element.className = element.className.replace(/quality-\w+/g, '');
                    // 移除鼠标悬停事件
                    const container = element.parentElement;
                    container.style.borderColor = '#ffffff80'; // 白色半透明
                    const tooltip = container.querySelector('.equipment-tooltip');
                    if (tooltip) {
                        // 确保弹窗保持隐藏
                        tooltip.classList.add('hidden');
                    }
                }
            }
        }
    }
    
    // 更新精炼信息UI
    updateRefineInfo(selectedSlot = 'weapon') {
        const item = this.game.gameState.player.equipment[selectedSlot];
        const refineInfo = document.getElementById('refine-info');
        
        if (item) {
            // 确保refineLevel有值
            if (item.refineLevel === undefined) {
                item.refineLevel = 0;
            }
            
            // 显示精炼信息
            refineInfo.classList.remove('hidden');
            
            // 更新装备名称
            const refineWeaponNameElement = document.getElementById('refine-weapon-name');
            refineWeaponNameElement.textContent = item.name;
            // 设置装备颜色
            const colorClass = this.getEquipmentColorClass(item);
            refineWeaponNameElement.className = `text-sm font-medium ${colorClass}`;
            
            // 更新精炼等级
            document.getElementById('refine-weapon-level').textContent = `+${item.refineLevel}`;
            
            // 计算下一级精炼所需材料
            if (item.refineLevel < 10) {
                const cost = this.calculateRefineCost(item.refineLevel);
                document.getElementById('refine-requirements').textContent = 
                    `灵木: ${cost.spiritWood}, 玄铁: ${cost.blackIron}, 灵晶: ${cost.spiritCrystal}`;
            } else {
                document.getElementById('refine-requirements').textContent = '已达到最大等级';
            }
            
            // 更新属性提升
            const bonus = item.refineLevel * 10;
            document.getElementById('refine-bonus').textContent = `+${bonus}%`;
        } else {
            // 隐藏精炼信息
            refineInfo.classList.add('hidden');
        }
    }
    
    // 更新分解信息UI
    updateDisassembleInfo(selectedSlot = 'weapon') {
        const item = this.game.gameState.player.equipment[selectedSlot];
        const disassembleInfo = document.getElementById('disassemble-info');
        
        if (item) {
            // 确保refineLevel有值
            if (item.refineLevel === undefined) {
                item.refineLevel = 0;
            }
            
            // 显示分解信息
            disassembleInfo.classList.remove('hidden');
            
            // 更新装备名称
            const disassembleWeaponNameElement = document.getElementById('disassemble-weapon-name');
            disassembleWeaponNameElement.textContent = item.name;
            // 设置装备颜色
            const colorClass = this.getEquipmentColorClass(item);
            disassembleWeaponNameElement.className = `text-sm font-medium ${colorClass}`;
            
            // 更新精炼等级
            document.getElementById('disassemble-weapon-level').textContent = `+${item.refineLevel}`;
            
            // 计算分解返还材料
            const returns = this.calculateDisassembleReturns(item);
            document.getElementById('disassemble-returns').textContent = 
                `灵木: ${returns.spiritWood}, 玄铁: ${returns.blackIron}, 灵晶: ${returns.spiritCrystal}`;
        } else {
            // 隐藏分解信息
            disassembleInfo.classList.add('hidden');
        }
    }

    // ==================== 装备属性刷新系统 ====================

    // 获取槽位显示名称
    getSlotDisplayName(slot) {
        const slotNames = {
            weapon: '武器',
            armor: '护甲',
            helmet: '头盔',
            boots: '靴子',
            pants: '裤子',
            accessory: '饰品'
        };
        return slotNames[slot] || slot;
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

    // 刷新装备属性
    refreshEquipmentStats(slot = 'weapon') {
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

        // 保存旧的属性用于日志
        const oldStats = { ...item.stats };
        const oldStatsDesc = this.getStatsDescription(oldStats);

        // 消耗材料
        this.game.gameState.resources.spiritWood -= cost.spiritWood;
        this.game.gameState.resources.blackIron -= cost.blackIron;
        this.game.gameState.resources.spiritCrystal -= cost.spiritCrystal;

        // 获取装备模板和品质信息
        const template = this.game.metadata.equipmentTemplates.find(t => t.type === item.type);
        const rarityInfo = this.game.metadata.equipmentRarities.find(r => r.name === item.rarity);

        if (!template) {
            this.game.addBattleLog('装备模板错误，无法刷新！');
            return false;
        }

        // 根据品质获取属性条数限制
        const statCount = rarityInfo ? rarityInfo.statCount : 1;

        // 从模板的baseStats中随机选择statCount个属性
        const allStatNames = Object.keys(template.baseStats);
        const shuffledStats = allStatNames.sort(() => Math.random() - 0.5);
        const selectedStats = shuffledStats.slice(0, Math.min(statCount, allStatNames.length));

        // 计算选中属性的值
        const rarityMultiplier = rarityInfo ? rarityInfo.multiplier : 1;
        const percentageStats = ['criticalRate', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen'];
        const newStats = {};

        for (const statName of selectedStats) {
            const baseValue = template.baseStats[statName];
            const calculatedValue = baseValue * item.level * rarityMultiplier;

            if (percentageStats.includes(statName)) {
                newStats[statName] = Math.round(calculatedValue * 100) / 100;
            } else {
                newStats[statName] = Math.floor(calculatedValue);
            }
        }

        // 更新装备属性
        item.stats = newStats;
        item.id = `${item.type}_${item.level}_${item.rarity}_${Math.floor(Math.random() * 100000)}`; // 新的唯一ID

        // 重新生成名称
        const prefixIndex = Math.floor(Math.min((rarityInfo ? rarityInfo.multiplier : 1) - 1, template.namePrefixes.length - 1));
        const suffixIndex = Math.floor(Math.random() * template.nameSuffixes.length);
        const prefix = template.namePrefixes[prefixIndex] || "";
        const suffix = template.nameSuffixes[suffixIndex] || "装备";
        item.name = prefix + suffix;

        // 重新计算装备效果
        this.calculateEquipmentEffects();

        // 更新UI
        this.game.updateUI();

        // 更新血条显示
        if (typeof this.game.updateHealthBars === 'function') {
            this.game.updateHealthBars();
        }

        // 生成新的属性描述
        const newStatsDesc = this.getStatsDescription(newStats);

        // 添加日志
        this.game.addBattleLog(`${this.getSlotDisplayName(slot)}属性刷新成功！`);
        this.game.addBattleLog(`原属性: ${oldStatsDesc}`);
        this.game.addBattleLog(`新属性: ${newStatsDesc}`);
        this.game.addBattleLog(`消耗了 ${cost.spiritWood} 灵木，${cost.blackIron} 玄铁，${cost.spiritCrystal} 灵晶`);

        return true;
    }

    // 更新刷新信息UI
    updateRefreshInfo(selectedSlot = 'weapon') {
        const item = this.game.gameState.player.equipment[selectedSlot];
        const refreshInfo = document.getElementById('refresh-info');

        if (item) {
            // 显示刷新信息
            refreshInfo.classList.remove('hidden');

            // 更新装备名称
            const refreshEquipmentNameElement = document.getElementById('refresh-equipment-name');
            refreshEquipmentNameElement.textContent = item.name;
            // 设置装备颜色
            const colorClass = this.getEquipmentColorClass(item);
            refreshEquipmentNameElement.className = `text-sm font-medium ${colorClass}`;

            // 更新精炼等级
            document.getElementById('refresh-equipment-level').textContent = `+${item.refineLevel || 0}`;

            // 计算刷新所需材料
            const cost = this.calculateRefreshCost(item);
            document.getElementById('refresh-requirements').textContent =
                `灵木: ${cost.spiritWood}, 玄铁: ${cost.blackIron}, 灵晶: ${cost.spiritCrystal}`;

            // 显示当前属性
            const currentStatsDesc = this.getStatsDescription(item.stats);
            document.getElementById('refresh-current-stats').textContent = currentStatsDesc;
        } else {
            // 隐藏刷新信息
            refreshInfo.classList.add('hidden');
        }
    }

    // 计算装备效果
    calculateEquipmentEffects() {
        // 初始化装备效果，包含所有可能的属性
        this.game.gameState.player.equipmentEffects = {
            attack: 0,
            defense: 0,
            hp: 0,
            luck: 0,
            speed: 0,
            criticalRate: 0,
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
                for (const stat in item.stats) {
                    // 即使是新属性，也要添加到装备效果中
                    if (this.game.gameState.player.equipmentEffects[stat] !== undefined) {
                        // 应用精炼加成（每级精炼增加10%属性）
                        const refineBonus = item.refineLevel ? (item.refineLevel * 0.1) : 0;
                        this.game.gameState.player.equipmentEffects[stat] += Math.floor(item.stats[stat] * (1 + refineBonus));
                    } else {
                        // 如果是新属性，添加到装备效果对象中
                        const refineBonus = item.refineLevel ? (item.refineLevel * 0.1) : 0;
                        this.game.gameState.player.equipmentEffects[stat] = Math.floor(item.stats[stat] * (1 + refineBonus));
                    }
                }
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
            luck: '幸运',
            speed: '速度',
            criticalRate: '暴击率',
            dodgeRate: '闪避率',
            tenacity: '韧性',
            accuracy: '命中率',
            moveSpeed: '移动速度',
            energyRegen: '能量回复'
        };

        // 百分比属性列表
        const percentageStats = ['criticalRate', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen'];

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
        const equipmentSlots = ['weapon', 'armor', 'helmet', 'boots', 'accessory', 'pants'];
        // 品质排序顺序（从低到高）
        const rarityOrder = ['white', 'blue', 'purple', 'gold', 'rainbow'];
        let equippedCount = 0;

        // 遍历每个装备槽位
        for (const slot of equipmentSlots) {
            // 从背包中筛选出适合该槽位的装备
            const suitableItems = this.game.gameState.player.inventory.filter(item =>
                item.type === slot &&
                (!item.level || item.level <= this.game.calculateTotalLevel())
            );

            if (suitableItems.length > 0) {
                // 按品质和等级排序，选择最好的装备
                suitableItems.sort((a, b) => {
                    // 首先按品质排序
                    const rarityA = rarityOrder.indexOf(a.rarity) || 0;
                    const rarityB = rarityOrder.indexOf(b.rarity) || 0;
                    if (rarityA !== rarityB) {
                        return rarityB - rarityA;
                    }
                    // 品质相同时按等级排序
                    return (b.level || 0) - (a.level || 0);
                });

                const bestItem = suitableItems[0];
                const currentItem = this.game.gameState.player.equipment[slot];

                // 只有当新装备比当前装备好时才装备
                if (!currentItem ||
                    (bestItem.level || 0) > (currentItem.level || 0) ||
                    (bestItem.level === currentItem.level &&
                     rarityOrder.indexOf(bestItem.rarity) > rarityOrder.indexOf(currentItem.rarity))) {

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

        // 更新UI
        this.game.updateUI();

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

        // 使用统一的属性计算函数
        const stats = this.calculateEquipmentStats(template, level, rarityInfo);

        // 生成装备名称
        const prefixIndex = Math.floor(Math.min((rarityInfo ? rarityInfo.multiplier : 1) - 1, template.namePrefixes.length - 1));
        const suffixIndex = Math.floor(Math.random() * template.nameSuffixes.length);
        const prefix = template.namePrefixes[prefixIndex] || "";
        const suffix = template.nameSuffixes[suffixIndex] || "装备";
        const name = prefix + suffix;

        // 获取境界名称
        const realmIndex = Math.max(0, level - 1); // level从1开始，realm从0开始
        const realmName = this.game.metadata.realmConfig?.[realmIndex]?.name || `等级${level}`;

        // 创建装备对象
        return {
            id: `${type}_${level}_${rarity}_${Math.floor(Math.random() * 1000)}`,
            name: name,
            type: type,
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
        const equipmentSlots = ['weapon', 'armor', 'helmet', 'boots', 'accessory', 'pants'];
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
        const icons = {
            weapon: 'fa-sword',
            armor: 'fa-shield',
            helmet: 'fa-hat-wizard',
            boots: 'fa-boot',
            accessory: 'fa-gem',
            pants: 'fa-pants'
        };
        return icons[type] || 'fa-box';
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