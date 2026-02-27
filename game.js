// 游戏核心数据结构和状态管理
class EndlessWinterGame {
    constructor() {
        // 游戏状态
        this.gameState = {
            // 用户信息
            user: {
                loggedIn: false,
                username: "",
                userId: ""
            },
            // 玩家属性
            player: {
                level: 1,
                exp: 0,
                maxExp: 100,
                attack: 10,
                defense: 5,
                hp: 100,
                maxHp: 100,
                luck: 2,
                energy: 100,
                maxEnergy: 100,
                // 装备栏
                equipment: {
                    weapon: null,    // 武器
                    armor: null,     //  armor
                    helmet: null,    // 头盔
                    boots: null,     // 靴子
                    accessory: null  // 饰品
                },
                // 装备效果
                equipmentEffects: {
                    attack: 0,
                    defense: 0,
                    hp: 0,
                    luck: 0
                },
                // 背包
                inventory: [],
                // 特殊技
                skills: []
            },
            // 装备品质定义
            equipmentRarities: [],
            // 装备模板
            equipmentTemplates: [],
            // 装备掉落概率
            dropRates: {},
            // 资源系统
            resources: {
                wood: 0,
                woodRate: 1,
                iron: 0,
                ironRate: 0.5,
                crystal: 0,
                crystalRate: 0.2
            },
            // 敌人类型
            enemyTypes: [],
            // 默认当前敌人为空
            enemy: [],
            // 游戏设置
            settings: {
                autoPlay: false,
                autoBattle: false,
                afkTime: 0,
                collectedResources: 0,
                // 自动打怪设置
                autoBattleSettings: {
                    enabled: false,
                    targetColors: ['green', 'yellow', 'red'] // 默认攻击所有颜色的怪物
                },
                // 自动收集资源设置
                autoCollectSettings: {
                    enabled: false,
                    resourceTypes: ['wood', 'iron', 'crystal'] // 默认收集所有类型的资源
                }
            },
            // 地图背景
            mapBackgrounds: [],
            currentBackgroundIndex: 0,
            // 场景怪物数据
            sceneMonsters: [],
            // 战斗状态
            battle: {
                inBattle: false,
                battleLog: []
            },
            // 商店系统
            shop: {
                items: []
            }
        };
        
        // 游戏计时器
        this.timers = {
            resourceTimer: null,
            autoPlayTimer: null,
            autoBattleTimer: null,
            autoCollectTimer: null,
            afkTimer: null
        };
        
        // 初始化游戏
        this.initGame();
    }
    
    // 初始化游戏
    initGame() {
        // 设置默认选中的装备槽位
        this.selectedRefineSlot = 'weapon';
        
        // 初始化3D场景相关变量
        this.isMoving = false;
        this.mouseTarget = null;
        
        // 检查保存的登录状态（异步）
        this.loadUserFromSession();
        
        // 只有在用户登录成功后才继续初始化
        if (this.gameState.user.loggedIn) {
            // 先获取元数据，然后再初始化其他内容
            this.fetchGameMetadata().then(() => {
                // 登录和加载完成后继续初始化
                this.preloadImages();
                
                // 加载纹理（提前加载，确保3D场景初始化时纹理已准备好）
                this.loadTextures();
                
                // 只有在没有保存的场景怪物数据时才生成新的
                this.generateMiniMap();
                
                // 确保所有装备都有refineLevel属性
                for (const slot in this.gameState.player.equipment) {
                    const item = this.gameState.player.equipment[slot];
                    if (item && item.refineLevel === undefined) {
                        item.refineLevel = 0;
                    }
                }
                
                // 隐藏敌人信息区
                this.hideEnemyInfo();
                
                // 初始化3D战斗场景
                this.initMap3DScene();
                
                // 更新 UI 和绑定事件
                this.updateMapBackgroundUI(); // 设置初始地图背景
                this.updateCharacterBodyImage();
                this.updateUI();
                this.updateAdminControls(); // 根据用户角色更新管理控制按钮
                this.bindEvents();
                
                // 开始资源生成
                this.startResourceGeneration();
            });
        }
    }
    
    // 从服务器获取游戏元数据
    async fetchGameMetadata() {
        try {
            // 获取token
            const token = localStorage.getItem('endlessWinterToken');
            if (!token) {
                throw new Error('用户未登录，无法获取游戏数据');
            }
            
            // 确保使用正确的端口和路径
            const response = await fetch('/api/metadata', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // 检查响应结构
            if (!data.success || !data.metadata) {
                throw new Error('无效的元数据响应');
            }
            
            const metadata = data.metadata;
            
            // 更新游戏状态中的元数据
            if (metadata.equipmentRarities) {
                this.gameState.equipmentRarities = metadata.equipmentRarities;
            }
            if (metadata.equipmentTemplates) {
                this.gameState.equipmentTemplates = metadata.equipmentTemplates;
            }
            if (metadata.dropRates) {
                this.gameState.dropRates = metadata.dropRates;
            }
            if (metadata.enemyTypes) {
                this.gameState.enemyTypes = metadata.enemyTypes;
            }
            if (metadata.skills) {
                this.gameState.player.skills = metadata.skills;
            }
            if (metadata.shop) {
                this.gameState.shop = metadata.shop;
            }
            if (metadata.mapBackgrounds) {
                this.gameState.mapBackgrounds = metadata.mapBackgrounds;
            }
            if (metadata.mapEnemyMapping) {
                this.gameState.mapEnemyMapping = metadata.mapEnemyMapping;
            }
            if (metadata.player) {
                // 保存player元数据供后续使用
                this.playerMetadata = metadata.player;
                // 如果是新游戏，使用初始属性
                if (this.gameState.player.level === 1 && this.gameState.player.exp === 0) {
                    if (metadata.player.initialStats) {
                        Object.assign(this.gameState.player, metadata.player.initialStats);
                    }
                }
            }
            if (metadata.resources && metadata.resources.types) {
                // 保存资源元数据供后续使用
                this.resourceMetadata = metadata.resources;
                // 初始化资源速率
                metadata.resources.types.forEach(resource => {
                    if (this.gameState.resources[resource.name]) {
                        this.gameState.resources[`${resource.name}Rate`] = resource.baseRate;
                    }
                });
            }
            
            this.addBattleLog('从服务器加载游戏数据成功！');
        } catch (error) {
            console.error('获取元数据失败:', error);
            throw error;
        }
    }
    
    // 预加载图片
    preloadImages() {
        // 预加载人物形象图片
        const maleCharacter = new Image();
        maleCharacter.src = 'Images/male-character.png';
        
        const femaleCharacter = new Image();
        femaleCharacter.src = 'Images/female-character.png';
        
        const defaultCharacter = new Image();
        defaultCharacter.src = 'Images/default-character.png';
        
        // 预加载装备图片
        const weaponImage = new Image();
        weaponImage.src = 'Images/weapon-sword.png';
        
        const armorImage = new Image();
        armorImage.src = 'Images/armor-chestplate.png';
        
        const helmetImage = new Image();
        helmetImage.src = 'Images/helmet.png';
        
        const bootsImage = new Image();
        bootsImage.src = 'Images/boots.png';
        
        const accessoryImage = new Image();
        accessoryImage.src = 'Images/accessory-necklace.png';
        
        this.addBattleLog('图片预加载中...');
    }
    
    // 加载纹理
    loadTextures() {
        // 存储纹理
        this.textures = {};
    }
    
    // 更新地图背景
    updateMapBackground() {
        // 根据玩家等级计算当前背景索引（每10级更换一次背景）
        const playerLevel = this.gameState.player.level;
        const newBackgroundIndex = Math.min(9, Math.floor((playerLevel - 1) / 10));
        
        // 如果背景索引变化，更新背景
        if (newBackgroundIndex !== this.gameState.currentBackgroundIndex) {
            this.gameState.currentBackgroundIndex = newBackgroundIndex;
            this.updateMapBackgroundUI();
        }
    }
    
    // 更新地图背景UI
    updateMapBackgroundUI() {
        if (this.gameState.mapBackgrounds.length > 0) {
            const currentBackground = this.gameState.mapBackgrounds[this.gameState.currentBackgroundIndex];
            if (currentBackground) {
                // 更新3D场景背景
                if (this.battle3D) {
                    // 辅助函数：转换色值为hex字符串
                    const toHexColor = (color) => {
                        if (typeof color === 'number') {
                            return '#' + color.toString(16).padStart(6, '0');
                        }
                        return color;
                    };
                    
                    // 更新天空颜色
                    this.battle3D.scene.clearColor = new BABYLON.Color4.FromHexString(toHexColor(currentBackground.skyColor), 1);
                    
                    // 更新雾效
                    if (this.battle3D.scene.fogMode === BABYLON.Scene.FOGMODE_LINEAR) {
                        this.battle3D.scene.fogColor = new BABYLON.Color3.FromHexString(toHexColor(currentBackground.fogColor));
                        this.battle3D.scene.fogStart = currentBackground.fogNear;
                        this.battle3D.scene.fogEnd = currentBackground.fogFar;
                    } else {
                        this.battle3D.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
                        this.battle3D.scene.fogColor = new BABYLON.Color3.FromHexString(toHexColor(currentBackground.fogColor));
                        this.battle3D.scene.fogStart = currentBackground.fogNear;
                        this.battle3D.scene.fogEnd = currentBackground.fogFar;
                    }
                }
                
                // 更新2D地图背景图片
                const backgroundElement = document.querySelector('#map-background img');
                if (backgroundElement && currentBackground.imageUrl) {
                    backgroundElement.src = currentBackground.imageUrl;
                }
            }
        }
    }
    
    // generateMiniMap moved to mapLogic.js
    // (mapLogic.js handles map generation, enemy distribution, and 2D grid rendering)

    // createEnemyDistribution moved to mapLogic.js

    // createEnemy moved to mapLogic.js

    // 遭遇敌人
    encounterEnemy(enemyInfo, initScene = true) {
        if (enemyInfo) {
            // 保存当前地图场景状态，包括玩家位置
            this.saveMapState();
            
            // 使用传入的敌人信息
            this.gameState.enemy = enemyInfo;
            
            // 从场景怪物数据中移除该敌人
            if (this.gameState.sceneMonsters) {
                const index = this.gameState.sceneMonsters.findIndex(monster => 
                    monster.cellIndex === enemyInfo.cellIndex
                );
                if (index > -1) {
                    this.gameState.sceneMonsters.splice(index, 1);
                }
            }
            
            // 从3D场景中移除对应的敌人模型
            if (this.battle3D && this.battle3D.enemies) {
                for (let i = this.battle3D.enemies.length - 1; i >= 0; i--) {
                    const enemy = this.battle3D.enemies[i];
                    if (enemy.info.name === enemyInfo.name && 
                        enemy.info.level === enemyInfo.level &&
                        enemy.info.position.x === enemyInfo.position.x &&
                        enemy.info.position.z === enemyInfo.position.z) {
                        // 从场景中移除敌人模型
                        try {
                            if (this.battle3D.scene && enemy.model) {
                                this.battle3D.scene.remove(enemy.model);
                            }
                        } catch (e) {

                        }
                        // 从敌人列表中移除
                        this.battle3D.enemies.splice(i, 1);
                        break;
                    }
                }
            }
        } else {
            // 刷新敌人
            this.refreshEnemy();
        }
        this.addBattleLog('遭遇了敌人！准备战斗！');
        this.updateUI();
        
        // 刷新3D战斗场景（如果需要）
        if (initScene) {
            // 保存当前UI布局
            this.saveUILayout();
            
            // 设置战斗状态
            this.gameState.battle.inBattle = true;
            
            // 切换到战斗UI布局
            this.switchToBattleUILayout();
            
            // 隐藏攻击确认按钮，显示技能按钮
            const attackConfirmBtn = document.getElementById('attack-confirm-btn');
            const attackSkills = document.getElementById('attack-skills');
            if (attackConfirmBtn) {
                attackConfirmBtn.classList.add('hidden');
            }
            if (attackSkills) {
                attackSkills.classList.remove('hidden');
            }
            
            // 创建完整的战斗场景
            this.createBattleScene(this.gameState.enemy);
            
        }
    }
    
    // 检查保存的登录状态
    loadUserFromSession() {
        try {
            // 从 localStorage 中获取 token 和用户信息
            const token = localStorage.getItem('endlessWinterToken');
            const userStr = localStorage.getItem('endlessWinterUser');
            
            if (token && userStr) {
                try {
                    const userInfo = JSON.parse(userStr);
                    
                    // 设置用户信息
                    this.gameState.user = {
                        loggedIn: true,
                        username: userInfo.username,
                        userId: userInfo.userId,
                        gender: userInfo.gender,
                        role: userInfo.role || 'player'
                    };
                    
                    // 加载游戏状态
                    this.loadGame();
                    
                    
                    // 如果没有保存的游戏状态，初始化新的游戏状态
                    if (!this.gameState.player || !this.gameState.player.inventory) {
                        this.initNewGameState(userInfo.username, userInfo.gender);
                    }
                    
                    // 显示登录成功消息
                    this.addBattleLog(`登录成功！欢迎回来，${userInfo.username}！`);
                    
                    // 不需要在这里更新 UI 和生成地图，因为 initGame 方法会处理这些
                } catch (parseError) {
                    console.error('解析用户信息失败:', parseError);
                    // 解析失败，重定向到登录页面
                    window.location.href = 'login.html';
                }
            } else {
                // 未登录，重定向到登录页面
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('检查登录状态失败:', error);
            // 发生错误，重定向到登录页面
            window.location.href = 'login.html';
        }
    }
    
    // 更新管理员控制按钮的显示状态
    updateAdminControls() {
        const isAdmin = this.gameState.user.role === 'admin';
        console.debug("新功能，待开发！");
    }
    
    // 更新UI显示
    updateUI() {
        // 确保gameState和resources对象存在
        if (!this.gameState) {
            this.gameState = {};
        }
        if (!this.gameState.resources) {
            this.gameState.resources = {
                wood: 0,
                woodRate: 1,
                iron: 0,
                ironRate: 0.5,
                crystal: 0,
                crystalRate: 0.2
            };
        }
        if (!this.gameState.player) {
            this.gameState.player = {
                energy: 100,
                maxEnergy: 100
            };
        }
        
        // 更新资源显示
        const energyElement = document.getElementById('energy');
        if (energyElement) {
            const energyCurrent = Math.floor(this.gameState.player.energy || 0);
            const energyMax = this.gameState.player.maxEnergy || 100;
            energyElement.textContent = `${energyCurrent}/${energyMax}`;
            // 使用元数据中的回复速率，如果没有则使用默认值2
            const energyRegenRate = this.playerMetadata?.regenRates?.energy || 2;
            energyElement.setAttribute('data-tooltip', `能量恢复: +${energyRegenRate}/秒`);
        }
        const woodElement = document.getElementById('wood');
        if (woodElement) {
            woodElement.textContent = Math.floor(this.gameState.resources.wood || 0);
        }
        const woodRateElement = document.getElementById('wood-rate');
        if (woodRateElement) {
            woodRateElement.textContent = `+${this.gameState.resources.woodRate || 0}/秒`;
        }
        const ironElement = document.getElementById('iron');
        if (ironElement) {
            ironElement.textContent = Math.floor(this.gameState.resources.iron || 0);
        }
        const ironRateElement = document.getElementById('iron-rate');
        if (ironRateElement) {
            ironRateElement.textContent = `+${this.gameState.resources.ironRate || 0}/秒`;
        }
        const crystalElement = document.getElementById('crystal');
        if (crystalElement) {
            crystalElement.textContent = Math.floor(this.gameState.resources.crystal || 0);
        }
        const crystalRateElement = document.getElementById('crystal-rate');
        if (crystalRateElement) {
            crystalRateElement.textContent = `+${this.gameState.resources.crystalRate || 0}/秒`;
        }
        
        // 计算装备效果
        this.calculateEquipmentEffects();
        
        // 计算最终属性（基础属性 + 装备效果）
        const finalAttack = this.gameState.player.attack + this.gameState.player.equipmentEffects.attack;
        const finalDefense = this.gameState.player.defense + this.gameState.player.equipmentEffects.defense;
        const finalHp = this.gameState.player.hp + this.gameState.player.equipmentEffects.hp;
        const finalLuck = this.gameState.player.luck + this.gameState.player.equipmentEffects.luck;
        
        // 更新玩家属性显示
            const levelElement = document.getElementById('level');
            if (levelElement) {
                levelElement.textContent = this.gameState.player.level;
            }
            const expElement = document.getElementById('exp');
            if (expElement) {
                expElement.textContent = this.gameState.player.exp;
            }
            const maxExpElement = document.getElementById('max-exp');
            if (maxExpElement) {
                maxExpElement.textContent = this.gameState.player.maxExp;
            }
            const attackElement = document.getElementById('attack');
            if (attackElement) {
                const baseAttack = this.gameState.player.baseAttack || (this.gameState.player.attack - this.gameState.player.equipmentEffects.attack);
                const baseFinalAttack = baseAttack + this.gameState.player.equipmentEffects.attack;
                if (this.gameState.player.tempAttack) {
                    attackElement.innerHTML = `${Math.floor(baseFinalAttack)}<span class="text-yellow-400">(${Math.floor(finalAttack)})</span>`;
                } else {
                    attackElement.textContent = Math.floor(finalAttack);
                }
            }
            const defenseElement = document.getElementById('defense');
            if (defenseElement) {
                const baseDefense = this.gameState.player.baseDefense || (this.gameState.player.defense - this.gameState.player.equipmentEffects.defense);
                const baseFinalDefense = baseDefense + this.gameState.player.equipmentEffects.defense;
                if (this.gameState.player.tempDefense) {
                    defenseElement.innerHTML = `${Math.floor(baseFinalDefense)}<span class="text-yellow-400">(${Math.floor(finalDefense)})</span>`;
                } else {
                    defenseElement.textContent = Math.floor(finalDefense);
                }
            }
            const hpElement = document.getElementById('hp');
            if (hpElement) {
                const maxHp = this.gameState.player.maxHp + this.gameState.player.equipmentEffects.hp;
                hpElement.textContent = `${Math.floor(finalHp)}/${Math.floor(maxHp)}`;
                // 更新生命值恢复提示（每秒钟恢复1%最大生命值）
                hpElement.setAttribute('data-tooltip', `生命值恢复: +${Math.floor(this.gameState.player.maxHp * 0.01)}/秒`);
            }
            const luckElement = document.getElementById('luck');
            if (luckElement) {
                luckElement.textContent = finalLuck;
            }
        
        // 更新装备栏显示
        for (const slot in this.gameState.player.equipment) {
            const item = this.gameState.player.equipment[slot];
            const equipmentElement = document.getElementById(`equipment-${slot}`);
            if (equipmentElement) {
                if (item) {
                    // 显示装备名称和精炼等级
                    let displayName = item.name;
                    if (item.refineLevel && item.refineLevel > 0) {
                        displayName += ` +${item.refineLevel}`;
                    }
                    equipmentElement.textContent = displayName;
                    // 根据装备稀有度设置颜色
                    if (item.colorClass) {
                        equipmentElement.className = `text-sm ${item.colorClass}`;
                    } else {
                        // 兼容旧装备
                        const rarityInfo = this.gameState.equipmentRarities.find(r => r.name === item.rarity);
                        if (rarityInfo) {
                            equipmentElement.className = `text-sm ${rarityInfo.color}`;
                        } else {
                            equipmentElement.className = 'text-sm';
                        }
                    }
                    // 设置装备属性的tooltip
                    const statsDescription = this.getStatsDescription(item.stats);
                    const tooltipText = `${item.name}\n等级: ${item.level}\n品质: ${item.rarityDisplayName || '白色'}\n精炼: +${item.refineLevel || 0}\n属性: ${statsDescription}`;
                    equipmentElement.setAttribute('data-tooltip', tooltipText);
                } else {
                    equipmentElement.textContent = '无';
                    equipmentElement.className = 'text-sm';
                    equipmentElement.setAttribute('data-tooltip', '未装备');
                }
            }
        }
        
        // 重新初始化tooltip
        this.initTooltips();
        
        // 更新敌人显示
        const enemyNameElement = document.getElementById('enemy-name');
        if (enemyNameElement) {
            enemyNameElement.textContent = this.gameState.enemy?.name || '';
        }
        const enemyLevelElement = document.getElementById('enemy-level');
        if (enemyLevelElement) {
            enemyLevelElement.textContent = this.gameState.enemy?.level || '';
        }
        const enemyHpElement = document.getElementById('enemy-hp');
        if (enemyHpElement) {
            enemyHpElement.textContent = this.gameState.enemy?.hp || '';
        }
        const enemyMaxHpElement = document.getElementById('enemy-max-hp');
        if (enemyMaxHpElement) {
            enemyMaxHpElement.textContent = this.gameState.enemy?.maxHp || '';
        }
        const enemyAttackElement = document.getElementById('enemy-attack');
        if (enemyAttackElement) {
            enemyAttackElement.textContent = this.gameState.enemy?.attack || '';
        }
        
        // 更新敌人图标
        const enemyIconElement = document.querySelector('#enemy-icon i');
        if (enemyIconElement) {
            if (this.gameState.enemy?.name) {
                // 计算敌人和玩家的战斗力
                const enemyPower = (this.gameState.enemy.attack || 0) * 2 + (this.gameState.enemy.defense || 0) * 1.5 + (this.gameState.enemy.maxHp || 0) * 0.1;
                const playerAttack = this.gameState.player.attack + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.attack : 0);
                const playerDefense = this.gameState.player.defense + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.defense : 0);
                const playerHp = this.gameState.player.maxHp + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.hp : 0);
                const playerPower = playerAttack * 2 + playerDefense * 1.5 + playerHp * 0.1;
                
                // 根据战斗力对比确定敌人颜色
                let enemyColorClass = 'text-danger'; // 默认红色
                if (this.gameState.enemy.isBoss) {
                    enemyColorClass = 'text-purple-500'; // BOSS显示紫色
                } else if (this.gameState.enemy.isElite) {
                    enemyColorClass = 'text-yellow-500'; // 精英怪显示黄色
                } else {
                    const powerRatio = enemyPower / playerPower;
                    if (powerRatio < 0.7) {
                        enemyColorClass = 'text-green-500'; // 比玩家弱显示绿色
                    } else if (powerRatio < 1.3) {
                        enemyColorClass = 'text-yellow-500'; // 和玩家差不多显示黄色
                    } else {
                        enemyColorClass = 'text-red-500'; // 比玩家厉害显示红色
                    }
                }
                enemyIconElement.className = `fa ${this.gameState.enemy.icon} text-xl ${enemyColorClass}`;
            } else {
                // 没有敌人时显示问号图标
                enemyIconElement.className = 'fa fa-question text-xl text-gray-500';
            }
        }
        
        // 更新人物装备显示
        this.updateCharacterEquipmentDisplay();
        
        // 更新精英标识
        const eliteBadge = document.getElementById('enemy-elite-badge');
        const enemyInfo = document.getElementById('enemy-info');
        if (eliteBadge && enemyInfo) {
            if (this.gameState.enemy?.name) {
                if (this.gameState.enemy.isElite) {
                    eliteBadge.classList.remove('hidden');
                    // 为精英怪添加特殊样式
                    enemyInfo.classList.add('border-yellow-500');
                    enemyInfo.classList.add('bg-yellow-900/20');
                } else if (this.gameState.enemy.isBoss) {
                    eliteBadge.classList.remove('hidden');
                    eliteBadge.textContent = 'BOSS';
                    eliteBadge.className = 'ml-2 text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded font-bold';
                    // 为BOSS添加特殊样式
                    enemyInfo.classList.add('border-purple-500');
                    enemyInfo.classList.add('bg-purple-900/20');
                } else {
                    eliteBadge.classList.add('hidden');
                    // 移除精英怪和BOSS特殊样式
                    enemyInfo.classList.remove('border-yellow-500');
                    enemyInfo.classList.remove('bg-yellow-900/20');
                    enemyInfo.classList.remove('border-purple-500');
                    enemyInfo.classList.remove('bg-purple-900/20');
                }
            } else {
                eliteBadge.classList.add('hidden');
                // 移除精英怪和BOSS特殊样式
                enemyInfo.classList.remove('border-yellow-500');
                enemyInfo.classList.remove('bg-yellow-900/20');
                enemyInfo.classList.remove('border-purple-500');
                enemyInfo.classList.remove('bg-purple-900/20');
            }
        }
        
        // 更新敌人装备掉率信息
        const enemyDropRatesElement = document.getElementById('enemy-drop-rates');
        if (enemyDropRatesElement) {
            if (this.gameState.enemy?.name) {
                // 基础掉率
                let dropRates = {
                    white: 0.4,
                    blue: 0.3,
                    purple: 0.15,
                    gold: 0.1,
                    legendary: 0.05
                };
                
                // 根据怪物类型调整掉率
                if (this.gameState.enemy.isBoss) {
                    // BOSS掉率调整
                    dropRates = {
                        white: 0.2,
                        blue: 0.3,
                        purple: 0.25,
                        gold: 0.2,
                        legendary: 0.05
                    };
                } else if (this.gameState.enemy.isElite) {
                    // 精英怪掉率调整
                    dropRates = {
                        white: 0.3,
                        blue: 0.35,
                        purple: 0.2,
                        gold: 0.1,
                        legendary: 0.05
                    };
                }
                
                // 考虑幸运值影响（每点幸运值提高0.5%的高品质装备掉率）
                const luck = this.gameState.player.luck || 0;
                const luckBonus = luck * 0.005;
                
                // 调整掉率，提高高品质装备的概率
                const adjustedRates = {
                    white: Math.max(0, dropRates.white - luckBonus * 2),
                    blue: Math.max(0, dropRates.blue - luckBonus),
                    purple: Math.max(0, dropRates.purple + luckBonus * 0.5),
                    gold: Math.max(0, dropRates.gold + luckBonus * 1),
                    legendary: Math.max(0, dropRates.legendary + luckBonus * 1.5)
                };
                
                // 归一化概率
                const totalProbability = Object.values(adjustedRates).reduce((sum, rate) => sum + rate, 0);
                const normalizedRates = {};
                for (const [rarity, rate] of Object.entries(adjustedRates)) {
                    normalizedRates[rarity] = rate / totalProbability;
                }
                
                // 生成掉率显示元素
                enemyDropRatesElement.innerHTML = '';
                
                // 品质颜色映射
                const rarityColors = {
                    white: 'bg-white/10',
                    blue: 'bg-blue-500/20',
                    purple: 'bg-purple-500/20',
                    gold: 'bg-yellow-500/20',
                    legendary: 'bg-red-500/20'
                };
                
                // 品质名称映射
                const rarityNames = {
                    white: '白色',
                    blue: '蓝色',
                    purple: '紫色',
                    gold: '金色',
                    legendary: '传说'
                };
                
                // 添加掉率信息
                for (const [rarity, rate] of Object.entries(normalizedRates)) {
                    const ratePercent = Math.round(rate * 100);
                    if (ratePercent > 0) {
                        const rateElement = document.createElement('span');
                        rateElement.className = `text-xs ${rarityColors[rarity]} px-1.5 py-0.5 rounded`;
                        rateElement.textContent = `${rarityNames[rarity]}: ${ratePercent}%`;
                        enemyDropRatesElement.appendChild(rateElement);
                    }
                }
            } else {
                // 没有敌人时清空掉率信息
                enemyDropRatesElement.innerHTML = '';
            }
        }
        
        // 更新挂机时间显示
        const afkTimeElement = document.getElementById('afk-time');
        if (afkTimeElement) {
            afkTimeElement.textContent = this.formatTime(this.gameState.settings.afkTime);
        }
        const collectedResourcesElement = document.getElementById('collected-resources');
        if (collectedResourcesElement) {
            collectedResourcesElement.textContent = this.gameState.settings.collectedResources;
        }
        
        // 更新战斗日志
        this.updateBattleLog();
        
        // 更新用户信息
        const currentUserNav = document.getElementById('current-user-nav');
        if (currentUserNav) {
            currentUserNav.textContent = this.gameState.user.username;
        }
        const survivorName = document.getElementById('survivor-name');
        if (survivorName) {
            survivorName.textContent = this.gameState.user.username;
        }
        
        // 更新技能按钮状态
        if (this.gameState.player && this.gameState.player.skills) {
            for (let i = 0; i < this.gameState.player.skills.length; i++) {
                const skill = this.gameState.player.skills[i];
                const skillButton = document.getElementById(`skill-${i}`);
                if (skillButton) {
                    if (this.gameState.player.level >= skill.levelRequired) {
                        // 等级满足，显示并启用技能按钮
                        skillButton.style.display = 'flex';
                        skillButton.disabled = false;
                        skillButton.classList.remove('bg-dark/50', 'cursor-not-allowed');
                        skillButton.classList.add('bg-accent', 'hover:bg-accent/80');
                    } else {
                        // 等级不足，隐藏技能按钮
                        skillButton.style.display = 'none';
                    }
                }
            }
        }
        
        // 更新精炼信息
        this.updateRefineInfo(this.selectedRefineSlot);
        
        // 只有在没有敌人信息时才隐藏敌人信息区
        // 这样2D敌人点击后信息会保持显示
        if (!this.gameState.battle.inBattle && !this.gameState.enemy) {
            this.hideEnemyInfo();
        }
    }
    
    // 格式化时间
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 开始资源生成
    startResourceGeneration() {
        this.timers.resourceTimer = setInterval(() => {
            this.generateResources();
        }, 1000);
    }
    
    // 停止战斗音乐（移至 audio.js）
    stopBattleMusic() {
        // placeholder to avoid undefined calls
    }
    
    // 生成资源
    generateResources() {
        // 生成木材
        this.gameState.resources.wood += this.gameState.resources.woodRate;
        
        // 生成铁矿
        this.gameState.resources.iron += this.gameState.resources.ironRate;
        
        // 生成水晶
        this.gameState.resources.crystal += this.gameState.resources.crystalRate;
        
        // 生命自动恢复
        if (this.gameState.player.hp < this.gameState.player.maxHp) {
            // 使用元数据中的回复速率，如果没有则使用默认值0.5
            const hpRegenRate = this.playerMetadata?.regenRates?.hp || 0.5;
            this.gameState.player.hp = Math.min(
                this.gameState.player.hp + hpRegenRate,
                this.gameState.player.maxHp
            );
        }
        
        // 能量自动恢复
        if (this.gameState.player && this.gameState.player.energy !== undefined && this.gameState.player.maxEnergy !== undefined) {
            if (this.gameState.player.energy < this.gameState.player.maxEnergy) {
                // 使用元数据中的回复速率，如果没有则使用默认值2
                const energyRegenRate = this.playerMetadata?.regenRates?.energy || 2;
                this.gameState.player.energy = Math.min(
                    this.gameState.player.energy + energyRegenRate,
                    this.gameState.player.maxEnergy
                );
            }
        } else {
            // 确保能量属性存在
            if (!this.gameState.player) {
                this.gameState.player = {};
            }
            if (this.gameState.player.energy === undefined) {
                this.gameState.player.energy = 100;
            }
            if (this.gameState.player.maxEnergy === undefined) {
                this.gameState.player.maxEnergy = 100;
            }
        }
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        this.updateHealthBars();
    }
    
    // 音频功能已移至 audio.js；3D场景初始化移至 map3d.js
    // (保留引用以避免调用失败)

    // 初始化3D地图场景
    initMap3DScene() {
        const container = document.getElementById('map-3d-container');
        if (!container) return;
        
        // 清除旧的3D场景
        if (this.battle3D && this.battle3D.engine) {
            // 停止并清理旧引擎
            try {
                this.battle3D.engine.dispose();
            } catch (e) {
                console.log('清理旧引擎时出错:', e);
            }
        }

        // 无论是否存在 battle3D，都先清空容器，避免出现重复 canvas
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // 重置引用，这样后续逻辑会重新设置它
        this.battle3D = null;
        
        // 保存当前战斗状态
        const isBattle = this.gameState.battle.inBattle;
        
        // 如果不是战斗状态，重置敌人信息，确保敌人信息区域显示为默认状态
        if (!isBattle) {
            // 重置敌人信息
            this.gameState.enemy = {
                name: "",
                level: "",
                hp: "",
                maxHp: "",
                attack: "",
                defense: "",
                energy: 0,
                maxEnergy: 0,
                isElite: false,
                isBoss: false,
                bonus: 0,
                icon: "fa-question",
                image: "",
                expMultiplier: 1,
                resourceMultiplier: 1
            };
            // 更新UI，确保敌人信息区域显示为默认状态
            this.updateUI();
        }
        
        // 创建canvas元素用于Babylon.js渲染
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        
        // 设置canvas的实际宽高属性（WebGL必需）
        const containerRect = container.getBoundingClientRect();
        canvas.width = Math.max(containerRect.width || 1024, 1);
        canvas.height = Math.max(containerRect.height || 500, 1);
        
        container.appendChild(canvas);
        
        // 创建引擎，传递canvas而不是div
        const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        
        // 创建场景
        const scene = new BABYLON.Scene(engine);
        
        // 设置背景颜色和雾效
        if (isBattle) {
            // 战斗场景背景设置 - 深灰色背景，便于显示各种颜色的特效
            scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.05, 1); // 深灰色背景
            // 战斗场景不使用雾效，以便更好地显示火山效果
        } else {
            // 探险场景背景设置
            if (this.gameState.mapBackgrounds.length > 0 && this.gameState.currentBackgroundIndex !== undefined) {
                const currentBackground = this.gameState.mapBackgrounds[this.gameState.currentBackgroundIndex];
                if (currentBackground) {
                    // 辅助函数：转换色值为hex字符串
                    const toHexColor = (color) => {
                        if (typeof color === 'number') {
                            return '#' + color.toString(16).padStart(6, '0');
                        }
                        return color;
                    };
                    
                    // 设置天空颜色
                    scene.clearColor = new BABYLON.Color4.FromHexString(toHexColor(currentBackground.skyColor), 1);
                    
                    // 设置雾效
                    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
                    scene.fogColor = new BABYLON.Color3.FromHexString(toHexColor(currentBackground.fogColor));
                    scene.fogStart = currentBackground.fogNear;
                    scene.fogEnd = currentBackground.fogFar;
                } else {
                    // 默认设置
                    scene.clearColor = new BABYLON.Color4(0.537, 0.808, 0.922, 1); // 默认天空的蓝色
                    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
                    scene.fogColor = new BABYLON.Color3(0.537, 0.808, 0.922);
                    scene.fogStart = 10;
                    scene.fogEnd = 50;
                }
            } else {
                // 默认设置
                scene.clearColor = new BABYLON.Color4(0.537, 0.808, 0.922, 1); // 默认天空的蓝色
                scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
                scene.fogColor = new BABYLON.Color3(0.537, 0.808, 0.922);
                scene.fogStart = 10;
                scene.fogEnd = 50;
            }
        }
        
        // 创建相机
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, isBattle ? 6 : 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(container, true);
        
        // 设置相机位置
        if (isBattle) {
            // 战斗场景相机位置
            camera.setPosition(new BABYLON.Vector3(0, 2, 6));
        } else {
            // 探险场景相机位置
            camera.setPosition(new BABYLON.Vector3(0, 3, 10));
        }
        
        // 添加灯光
        if (isBattle) {
            // 战斗场景灯光 - 火山氛围
            const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
            ambientLight.intensity = 1;
            ambientLight.diffuse = new BABYLON.Color3(0.25, 0.125, 0.125);
            
            const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(5, 5, 3), scene);
            directionalLight.intensity = 1.5;
            directionalLight.diffuse = new BABYLON.Color3(1, 0.667, 0.4);
            
            // 添加火山特效光源
            const pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 2, 0), scene);
            pointLight.intensity = 1.5;
            pointLight.diffuse = new BABYLON.Color3(1, 0.25, 0);
        } else {
            // 探险场景灯光
            const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
            ambientLight.intensity = 1;
            
            const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(2, 2, 2), scene);
            directionalLight.intensity = 1;
        }
        
        // 添加地面
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {
            width: CONSTANTS.SCENE.GROUND.WIDTH,
            height: CONSTANTS.SCENE.GROUND.HEIGHT,
            subdivisions: CONSTANTS.SCENE.GROUND.SUBDIVISIONS
        }, scene);
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseColor = isBattle ? new BABYLON.Color3(0.75, 0.85, 0.95) : CONSTANTS.SCENE.GROUND.COLOR;
        groundMaterial.specularColor = isBattle ? new BABYLON.Color3(0.5, 0.6, 0.7) : CONSTANTS.SCENE.GROUND.SPECULAR;
        groundMaterial.shininess = isBattle ? 30 : CONSTANTS.SCENE.GROUND.SPECULAR_POWER;
        ground.material = groundMaterial;
        ground.position.y = CONSTANTS.SCENE.GROUND.Y;
        
        // 战斗场景添加火山陆地边缘和特效
        if (isBattle) {
            // 添加火山陆地边缘
            const edge = BABYLON.MeshBuilder.CreateTorus("edge", { diameter: 14, thickness: 0.5, tessellation: 32 }, scene);
            edge.rotation.x = Math.PI / 2;
            edge.position.y = -0.99;
            const edgeMaterial = new BABYLON.StandardMaterial("edgeMaterial", scene);
            edgeMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.2, 0.2);
            edgeMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
            edgeMaterial.shininess = 100;
            edge.material = edgeMaterial;
        }
        
        // 存储场景信息
        this.battle3D = {
            engine: engine,
            scene: scene,
            camera: camera,
            player: null,
            enemy: null,
            playerHealthBar: null,
            enemyHealthBar: null,
            playerEnergyBar: null,
            enemyEnergyBar: null,
            snowSystem: null,
            isAttacking: false,
            playerDefeated: false,
            enemyDefeated: false,
            // 战斗特效
            battleEffects: [],
            fireEffects: [],
            // 预生成的敌人列表
            enemies: []
        };
        
        // 创建玩家模型
        this.createPlayerModel();
        
        if (isBattle) {
            // 创建当前敌人模型
            this.createEnemyModel();
        } else {
            // 添加树
            this.createTrees();
            // 预生成多个敌人
            this.createPreGeneratedEnemies();
            // 添加雪花粒子系统
            this.createSnowSystem();
        }
        
        // 创建血条
        this.createHealthBars();
        
        // 开始渲染循环
        engine.runRenderLoop(() => {
            this.animateBattle3D();
            scene.render();
        });

        // 响应窗口大小变化
        window.addEventListener('resize', () => {
            if (this.battle3D && this.battle3D.engine) {
                this.battle3D.engine.resize();
            }
        });
    }
    
    // 创建喷火效果
    createFireEffects() {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        this.battle3D.fireEffects = [];
        
        // 创建多个喷火点
        const firePositions = [
            { x: -3, z: -3 },
            { x: 3, z: -3 },
            { x: -3, z: 3 },
            { x: 3, z: 3 }
        ];
        
        firePositions.forEach(pos => {
            // 创建火焰粒子系统
            const fireSystem = new BABYLON.ParticleSystem("fireSystem", 50, this.battle3D.scene);
            
            // 设置粒子纹理（使用默认纹理）
            fireSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.battle3D.scene);
            
            // 设置粒子发射位置
            fireSystem.emitter = new BABYLON.Vector3(pos.x, 0, pos.z);
            fireSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
            fireSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 1);
            
            // 设置粒子颜色
            fireSystem.color1 = new BABYLON.Color4(1, 0.6, 0, 0.8);
            fireSystem.color2 = new BABYLON.Color4(1, 0.2, 0, 0.8);
            fireSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
            
            // 设置粒子大小
            fireSystem.minSize = 0.1;
            fireSystem.maxSize = 0.3;
            
            // 设置粒子生命周期
            fireSystem.minLifeTime = 0.5;
            fireSystem.maxLifeTime = 1.5;
            
            // 设置粒子速度
            fireSystem.minSpeed = 1;
            fireSystem.maxSpeed = 3;
            
            // 设置粒子方向
            fireSystem.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
            fireSystem.direction2 = new BABYLON.Vector3(0.5, 2, 0.5);
            
            // 设置粒子旋转
            fireSystem.minRotation = 0;
            fireSystem.maxRotation = Math.PI * 2;
            
            // 设置发射率
            fireSystem.emitRate = 50;
            
            // 启动粒子系统
            fireSystem.start();
            
            // 存储火焰系统和基础位置
            this.battle3D.fireEffects.push({
                system: fireSystem,
                basePosition: [pos.x, 0, pos.z]
            });
        });
    }
    
    // 创建火山烟雾效果
    createVolcanoSmoke() {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        this.battle3D.battleEffects = [];
        
        // 创建烟雾粒子系统
        const smokeSystem = new BABYLON.ParticleSystem("smokeSystem", 100, this.battle3D.scene);
        
        // 设置粒子纹理（使用默认纹理）
        smokeSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.battle3D.scene);
        
        // 设置粒子发射位置
        smokeSystem.emitter = new BABYLON.Vector3(0, 0, 0);
        smokeSystem.minEmitBox = new BABYLON.Vector3(-7.5, 0, -7.5);
        smokeSystem.maxEmitBox = new BABYLON.Vector3(7.5, 0, 7.5);
        
        // 设置粒子颜色
        smokeSystem.color1 = new BABYLON.Color4(0.6, 0.6, 0.6, 0.3);
        smokeSystem.color2 = new BABYLON.Color4(0.8, 0.8, 0.8, 0.3);
        smokeSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        // 设置粒子大小
        smokeSystem.minSize = 0.3;
        smokeSystem.maxSize = 0.8;
        
        // 设置粒子生命周期
        smokeSystem.minLifeTime = 2;
        smokeSystem.maxLifeTime = 4;
        
        // 设置粒子速度
        smokeSystem.minSpeed = 0.5;
        smokeSystem.maxSpeed = 1.5;
        
        // 设置粒子方向
        smokeSystem.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
        smokeSystem.direction2 = new BABYLON.Vector3(0.5, 2, 0.5);
        
        // 设置发射率
        smokeSystem.emitRate = 25;
        
        // 启动粒子系统
        smokeSystem.start();
        
        this.battle3D.battleEffects.push(smokeSystem);
    }
    
    // 淡入战斗场景
    

    
    // 创建雪花粒子系统
    createSnowSystem() {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        // 创建雪花粒子系统
        const snowSystem = new BABYLON.ParticleSystem("snowSystem", 200, this.battle3D.scene);
        
        // 设置粒子纹理（使用默认纹理）
        snowSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.battle3D.scene);
        
        // 设置粒子发射位置
        snowSystem.emitter = new BABYLON.Vector3(0, 5, 0);
        snowSystem.minEmitBox = new BABYLON.Vector3(-5, 0, -5);
        snowSystem.maxEmitBox = new BABYLON.Vector3(5, 0, 5);
        
        // 设置粒子颜色
        snowSystem.color1 = new BABYLON.Color4(1, 1, 1, 0.8);
        snowSystem.color2 = new BABYLON.Color4(0.9, 0.9, 1, 0.8);
        snowSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        // 设置粒子大小
        snowSystem.minSize = 0.03;
        snowSystem.maxSize = 0.07;
        
        // 设置粒子生命周期
        snowSystem.minLifeTime = 5;
        snowSystem.maxLifeTime = 10;
        
        // 设置粒子速度
        snowSystem.minSpeed = 0.5;
        snowSystem.maxSpeed = 1;
        
        // 设置粒子方向
        snowSystem.direction1 = new BABYLON.Vector3(-0.5, -1, -0.5);
        snowSystem.direction2 = new BABYLON.Vector3(0.5, -1, 0.5);
        
        // 设置发射率
        snowSystem.emitRate = 20;
        
        // 启动粒子系统
        snowSystem.start();
        
        this.battle3D.snowSystem = snowSystem;
    }
    
    // 预生成多个敌人
    createPreGeneratedEnemies() {
        // 清空敌人列表
        this.battle3D.enemies = [];
        
        // 使用场景怪物数据生成敌人
        if (this.gameState.sceneMonsters && this.gameState.sceneMonsters.length > 0) {
            // 遍历场景怪物数据
            for (const enemyInfo of this.gameState.sceneMonsters) {
                // 创建简单的敌人模型（不使用复杂的模型创建函数，避免冲突）
                const enemyGroup = this.createEnemyGroup(enemyInfo);
                // 在Babylon.js中，创建mesh时会自动添加到scene，不需要额外调用add()
                
                // 创建敌人血条
                const enemyHealthBar = this.createHealthBar(CONSTANTS.ENEMY.HEALTH_BAR.COLOR); // 红色血条
                enemyHealthBar.scaling.x = CONSTANTS.ENEMY.HEALTH_BAR.SCALING;
                enemyHealthBar.scaling.y = CONSTANTS.ENEMY.HEALTH_BAR.SCALING;
                enemyHealthBar.scaling.z = CONSTANTS.ENEMY.HEALTH_BAR.SCALING;
                enemyHealthBar.position.x = 0;
                enemyHealthBar.position.y = CONSTANTS.ENEMY.HEALTH_BAR.RELATIVE_Y; // 血条位于敌人顶部上方（相对高度）
                enemyHealthBar.position.z = 0;
                enemyHealthBar.parent = enemyGroup; // Babylon.js中使用parent而不是add()
                
                // 存储敌人信息
                this.battle3D.enemies.push({
                    model: enemyGroup,
                    info: enemyInfo,
                    active: true,
                    healthBar: enemyHealthBar
                });
            }
        } else {
            // 如果没有场景怪物数据，生成默认敌人
            const enemyDistribution = this.createEnemyDistribution(25);
            let enemyIndex = 0;
            for (let i = 0; i < 3; i++) {
                // 随机位置，确保在场景范围内且不与玩家重叠
                let x, z;
                do {
                    x = (Math.random() - 0.5) * 16;
                    z = (Math.random() - 0.5) * 16;
                } while (Math.sqrt(x * x + z * z) < 1); // 确保敌人离玩家初始位置至少1单位
  
                // 创建敌人信息
                const enemyInfo = this.createEnemy(enemyDistribution, enemyIndex, x, z, Math.floor(Math.random() * 25)); // 随机分配一个2D格子索引
                // 创建简单的敌人模型
                const enemyGroup = this.createEnemyGroup(enemyInfo);
                enemyIndex++;
                // 在Babylon.js中，创建mesh时会自动添加到scene，不需要额外调用add()
                
                // 创建敌人血条
                const enemyHealthBar = this.createHealthBar(CONSTANTS.ENEMY.HEALTH_BAR.COLOR); // 红色血条
                enemyHealthBar.scaling.x = CONSTANTS.ENEMY.HEALTH_BAR.SCALING;
                enemyHealthBar.scaling.y = CONSTANTS.ENEMY.HEALTH_BAR.SCALING;
                enemyHealthBar.scaling.z = CONSTANTS.ENEMY.HEALTH_BAR.SCALING;
                enemyHealthBar.position.x = 0;
                enemyHealthBar.position.y = CONSTANTS.ENEMY.HEALTH_BAR.RELATIVE_Y; // 血条位于敌人顶部上方（相对高度）
                enemyHealthBar.position.z = 0;
                enemyHealthBar.parent = enemyGroup; // Babylon.js中使用parent而不是add()
                
                // 存储敌人信息
                this.battle3D.enemies.push({
                    model: enemyGroup,
                    info: enemyInfo,
                    active: true,
                    healthBar: enemyHealthBar
                });
            }
        }
    }

    createEnemyGroup(enemyInfo) {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        // 从敌人名称中提取敌人类型（移除BOSS和精英前缀）
        // 确保名称为字符串
        let enemyTypeName = String(enemyInfo.name || '');
        if (enemyTypeName.startsWith('BOSS')) {
            enemyTypeName = enemyTypeName.substring(4); // 移除'BOSS'前缀
        } else if (enemyTypeName.startsWith('精英')) {
            enemyTypeName = enemyTypeName.substring(2); // 移除'精英'前缀
        }

        // 根据敌人类型设置不同的颜色和几何体
        let enemyMesh;
        let color;
        
        // 确定颜色
        if (enemyInfo.isBoss) {
            color = new BABYLON.Color3(1, 0, 1); // 紫色
        } else if (enemyInfo.isElite) {
            color = new BABYLON.Color3(1, 1, 0); // 黄色
        } else {
            // 根据敌人类型设置颜色
            switch (enemyTypeName) {
                // 山地敌人
                case '山妖':
                case '岩怪':
                case '石精':
                case '山魈':
                case '龟妖':
                case '沙漠巨蜥':
                case '土妖':
                case '雪原狼':
                    color = new BABYLON.Color3(0.545, 0.271, 0.075); // 棕色
                    break;
                case '神雕':
                    color = new BABYLON.Color3(0.753, 0.753, 0.753); // 银色
                    break;
                // 森林敌人
                case '树精':
                case '木怪':
                case '山精':
                    color = new BABYLON.Color3(0.133, 0.545, 0.133); // 绿色
                    break;
                case '花妖':
                case '狐仙':
                case '鹿灵':
                case '妖狐':
                    color = new BABYLON.Color3(1, 0.412, 0.71); // 粉色
                    break;
                // 湖泊敌人
                case '水怪':
                case '蛟蛇':
                case '鱼精':
                case '水仙':
                    color = new BABYLON.Color3(0.255, 0.412, 0.882); // 蓝色
                    break;
                // 沙漠敌人
                case '沙妖':
                case '蝎精':
                case '蛇怪':
                case '沙虫':
                    color = new BABYLON.Color3(0.824, 0.412, 0.118); // 沙色
                    break;
                // 洞穴敌人
                case '洞穴蝙蝠':
                case '蜘蛛精':
                    color = new BABYLON.Color3(0.184, 0.306, 0.306); // 深灰色
                    break;
                case '蚯蚓怪':
                case '洞穴幽灵':
                    color = new BABYLON.Color3(0.467, 0.533, 0.596); // 灰色
                    break;
                // 仙境敌人
                case '仙鹤':
                case '凤凰':
                case '火凤凰':
                    color = new BABYLON.Color3(1, 0.843, 0); // 金色
                    break;
                case '麒麟':
                    color = new BABYLON.Color3(1, 0.271, 0); // 橙色
                    break;
                // 火山敌人
                case '火灵':
                case '熔岩巨兽':
                    color = new BABYLON.Color3(1, 0.271, 0); // 橙色
                    break;
                // 海滩敌人
                case '海妖':
                case '海怪':
                case '鲛人':
                case '龙王':
                    color = new BABYLON.Color3(0.118, 0.565, 1); // 海蓝色
                    break;
                // 传统敌人
                case '风魔':
                    color = new BABYLON.Color3(0.529, 0.808, 0.922); // 天蓝色
                    break;
                case '雷兽':
                    color = new BABYLON.Color3(0.576, 0.439, 0.859); // 紫色
                    break;
                case '冰原熊':
                    color = new BABYLON.Color3(0.412, 0.412, 0.412); // 灰色
                    break;
                case '冰霜巨人':
                    color = new BABYLON.Color3(0.275, 0.506, 0.706); // 钢蓝色
                    break;
                default:
                    color = new BABYLON.Color3(0.439, 0.502, 0.565); // 默认灰色
            }
        }
        
        // 创建材质
        const material = new BABYLON.StandardMaterial("enemyMaterial", this.battle3D.scene);
        material.diffuseColor = color;
        material.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
        material.specularPower = 50;
        
        // 根据敌人类型创建几何体（尺寸统一为1.5，约是玩家高度的一半）
        switch (enemyTypeName) {
            // 立方体类型
            case '山妖':
            case '岩怪':
            case '石精':
            case '山魈':
            case '麒麟':
            case '土妖':
            case '冰霜巨人':
                if (enemyTypeName === '冰霜巨人') {
                    enemyMesh = BABYLON.MeshBuilder.CreateBox("enemy", {
                        width: CONSTANTS.ENEMY.BOX.WIDTH,
                        height: CONSTANTS.ENEMY.BOX.HEIGHT,
                        depth: CONSTANTS.ENEMY.BOX.DEPTH
                    }, this.battle3D.scene);
                } else {
                    enemyMesh = BABYLON.MeshBuilder.CreateBox("enemy", {
                        size: CONSTANTS.ENEMY.BOX.SIZE
                    }, this.battle3D.scene);
                }
                break;
            // 球体类型
            case '神雕':
            case '花妖':
            case '狐仙':
            case '鹿灵':
            case '龟妖':
            case '沙漠巨蜥':
            case '洞穴蝙蝠':
            case '蜘蛛精':
            case '仙鹤':
            case '凤凰':
            case '火凤凰':
            case '火灵':
            case '熔岩巨兽':
            case '海妖':
            case '海怪':
            case '鲛人':
            case '龙王':
            case '风魔':
            case '雷兽':
            case '冰原熊':
                enemyMesh = BABYLON.MeshBuilder.CreateSphere("enemy", {
                    diameter: CONSTANTS.ENEMY.SPHERE.DIAMETER,
                    tessellation: CONSTANTS.ENEMY.SPHERE.TESSELLATION
                }, this.battle3D.scene);
                break;
            // 圆柱体类型
            case '树精':
            case '木怪':
            case '水怪':
            case '蛟蛇':
            case '鱼精':
            case '水仙':
            case '沙妖':
            case '蝎精':
            case '蛇怪':
            case '沙虫':
            case '蚯蚓怪':
            case '洞穴幽灵':
            case '妖狐':
            case '山精':
            case '雪原狼':
                enemyMesh = BABYLON.MeshBuilder.CreateCylinder("enemy", {
                    height: CONSTANTS.ENEMY.CYLINDER.HEIGHT,
                    diameterTop: CONSTANTS.ENEMY.CYLINDER.DIAMETER_TOP,
                    diameterBottom: CONSTANTS.ENEMY.CYLINDER.DIAMETER_BOTTOM,
                    tessellation: CONSTANTS.ENEMY.CYLINDER.TESSELLATION
                }, this.battle3D.scene);
                break;
            default:
                enemyMesh = BABYLON.MeshBuilder.CreateSphere("enemy", {
                    diameter: CONSTANTS.ENEMY.SPHERE.DIAMETER,
                    tessellation: CONSTANTS.ENEMY.SPHERE.TESSELLATION
                }, this.battle3D.scene);
        }
        
        // 应用材质
        enemyMesh.material = material;

        // 设置敌人位置
        enemyMesh.position.x = enemyInfo.position.x;
        enemyMesh.position.z = enemyInfo.position.z;
        // 让敌人站在地面上：地面在y=-1.5
        // 所有敌人现在都是1.5单位高度，中心在0.75
        enemyMesh.position.y = CONSTANTS.SCENE.GROUND.Y + (CONSTANTS.ENEMY.SIZE / 2);

        return enemyMesh;
    }

    // 创建血条
    createHealthBars() {
        // 创建玩家血条
        const playerHealthBar = this.createHealthBar(CONSTANTS.NUMBERS.PLAYER.BASE_HP_COLOR); // 红色血条
        playerHealthBar.position.x = 0;
        playerHealthBar.position.y = CONSTANTS.PLAYER.HEALTH_BAR.ABSOLUTE_Y;
        playerHealthBar.position.z = 0;
        if (this.battle3D.player) {
            playerHealthBar.parent = this.battle3D.player;
        }
        this.battle3D.playerHealthBar = playerHealthBar;

        // 创建玩家能量条
        const playerEnergyBar = this.createHealthBar(CONSTANTS.NUMBERS.PLAYER.BASE_ENERGY_COLOR); // 蓝色能量条
        playerEnergyBar.position.x = 0;
        playerEnergyBar.position.y = CONSTANTS.PLAYER.ENERGY_BAR.ABSOLUTE_Y;
        playerEnergyBar.position.z = 0;
        if (this.battle3D.player) {
            playerEnergyBar.parent = this.battle3D.player;
        }
        this.battle3D.playerEnergyBar = playerEnergyBar;
        
        // 创建敌人血条
        const enemyHealthBar = this.createHealthBar(CONSTANTS.ENEMY.HEALTH_BAR.COLOR); // 红色血条
        enemyHealthBar.position.x = 0;
        enemyHealthBar.position.y = CONSTANTS.ENEMY.HEALTH_BAR.ABSOLUTE_Y;
        enemyHealthBar.position.z = 0;
        if (this.battle3D.enemy) {
            enemyHealthBar.parent = this.battle3D.enemy;
        }
        this.battle3D.enemyHealthBar = enemyHealthBar;
        
        // 创建敌人能量条（如果是BOSS）
        if (this.gameState.enemy.isBoss) {
            const enemyEnergyBar = this.createHealthBar(0x0000ff); // 蓝色能量条
            enemyEnergyBar.position.x = 0;
            enemyEnergyBar.position.y = CONSTANTS.ENEMY.HEALTH_BAR.ABSOLUTE_Y;
            enemyEnergyBar.position.z = 0;
            if (this.battle3D.enemy) {
                enemyEnergyBar.parent = this.battle3D.enemy;
            }
            this.battle3D.enemyEnergyBar = enemyEnergyBar;
        }
        
        // 初始更新血条
        this.updateHealthBars();
    }
    
    // 创建单个血条
    createHealthBar(color = 0xff0000) {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        // 创建血条背景
        const background = BABYLON.MeshBuilder.CreatePlane("healthBarBackground", { width: 2.0, height: 0.3 }, this.battle3D.scene);
        const backgroundMaterial = new BABYLON.StandardMaterial("healthBarBackgroundMaterial", this.battle3D.scene);
        backgroundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        backgroundMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        background.material = backgroundMaterial;
        // 始终面向相机并显著层级
        background.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        background.renderingGroupId = 2;
        
        // 创建血条填充
        const fill = BABYLON.MeshBuilder.CreatePlane("healthBarFill", { width: 1.9, height: 0.2 }, this.battle3D.scene);
        const fillMaterial = new BABYLON.StandardMaterial("healthBarFillMaterial", this.battle3D.scene);
        // 转换数值颜色为hex字符串，添加#前缀
        const hexColor = '#' + color.toString(16).padStart(6, '0');
        fillMaterial.diffuseColor = new BABYLON.Color3.FromHexString(hexColor);
        fillMaterial.emissiveColor = new BABYLON.Color3.FromHexString(hexColor);
        fill.material = fillMaterial;
        fill.position.z = 0.01;
        fill.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        fill.renderingGroupId = 2;
        
        // 设置填充为背景的子对象
        fill.parent = background;
        
        // 存储填充部分用于后续更新
        background.fill = fill;
        
        return background;
    }
    
    // 更新血条显示
    updateHealthBars() {
        if (!this.battle3D) return;
        
        // 更新玩家血条（从左边开始减少）
        if (this.battle3D.playerHealthBar && this.battle3D.playerHealthBar.fill) {
            const playerHealthPercent = Math.max(0, this.gameState.player.hp / this.gameState.player.maxHp);
            this.battle3D.playerHealthBar.fill.scaling.x = playerHealthPercent;
            // 从左边开始减少：位置向右移动，使左边对齐保持不变
            this.battle3D.playerHealthBar.fill.position.x = (1 - playerHealthPercent) * 0.95;
        }
        
        // 更新玩家能量条（从左边开始减少）
        if (this.battle3D.playerEnergyBar && this.battle3D.playerEnergyBar.fill) {
            const playerEnergyPercent = Math.max(0, this.gameState.player.energy / this.gameState.player.maxEnergy);
            this.battle3D.playerEnergyBar.fill.scaling.x = playerEnergyPercent;
            // 从左边开始减少：位置向右移动，使左边对齐保持不变
            this.battle3D.playerEnergyBar.fill.position.x = (1 - playerEnergyPercent) * 0.95;
        }
        
        if(this.gameState.enemy && this.gameState.enemy.name) {
            // 更新敌人血条（从左边开始减少）
            if (this.battle3D.enemyHealthBar && this.battle3D.enemyHealthBar.fill) {
                const enemyHealthPercent = Math.max(0, this.gameState.enemy.hp / this.gameState.enemy.maxHp);
                this.battle3D.enemyHealthBar.fill.scaling.x = enemyHealthPercent;
                // 从左边开始减少：位置向右移动，使左边对齐保持不变
                this.battle3D.enemyHealthBar.fill.position.x = (1 - enemyHealthPercent) * 0.95;
            }
            
            // 更新敌人能量条（如果是BOSS）
            if (this.battle3D.enemyEnergyBar && this.battle3D.enemyEnergyBar.fill && this.gameState.enemy.isBoss) {
                const enemyEnergyPercent = Math.max(0, this.gameState.enemy.energy / this.gameState.enemy.maxEnergy);
                this.battle3D.enemyEnergyBar.fill.scaling.x = enemyEnergyPercent;
                // 从左边开始减少：位置向右移动，与血条保持一致
                this.battle3D.enemyEnergyBar.fill.position.x = (1 - enemyEnergyPercent) * 0.95;
            }
        }
    }
    
    // 创建雪包
    createSnowPiles() {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        const snowMaterial = new BABYLON.StandardMaterial("snowMaterial", this.battle3D.scene);
        snowMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        snowMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        snowMaterial.specularPower = 30;
        
        // 创建多个雪包，放在远处
        for (let i = 0; i < 5; i++) {
            // 随机位置，确保在远处
            let x, z;
            do {
                x = (Math.random() - 0.5) * 12;
                z = (Math.random() - 0.5) * 12;
            } while (Math.abs(x) < 3 && Math.abs(z) < 3); // 确保离中心较远
            
            // 随机大小
            const size = 0.3 + Math.random() * 0.5;
            
            // 创建雪包几何体（使用球体）
            const snowPile = BABYLON.MeshBuilder.CreateSphere("snowPile", { diameter: size * 2, segments: 8 }, this.battle3D.scene);
            snowPile.material = snowMaterial;
            snowPile.position.x = x;
            snowPile.position.y = CONSTANTS.SCENE.GROUND.Y + size / 2;
            snowPile.position.z = z;
        }
    }
    
    // 创建树
    createTrees() {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        // 树干材质
        const trunkMaterial = new BABYLON.StandardMaterial("trunkMaterial", this.battle3D.scene);
        trunkMaterial.diffuseColor = new BABYLON.Color3(0.545, 0.271, 0.075);
        trunkMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
        trunkMaterial.specularPower = 10;
        
        // 树叶材质
        const leavesMaterial = new BABYLON.StandardMaterial("leavesMaterial", this.battle3D.scene);
        leavesMaterial.diffuseColor = new BABYLON.Color3(0.133, 0.545, 0.133);
        leavesMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
        leavesMaterial.specularPower = 20;
        
        // 创建几棵树，放在远处
        for (let i = 0; i < 3; i++) {
            // 随机位置，确保在远处
            let x, z;
            do {
                x = (Math.random() - 0.5) * 12;
                z = (Math.random() - 0.5) * 12;
            } while (Math.abs(x) < 3 && Math.abs(z) < 3); // 确保离中心较远
            
            // 随机大小
            const trunkHeight = 1 + Math.random() * 0.5;
            const trunkRadius = 0.15 + Math.random() * 0.05;
            const leavesSize = 0.8 + Math.random() * 0.3;
            
            // 创建树干
            const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", { 
                diameter: trunkRadius * 2, 
                height: trunkHeight, 
                tessellation: 8 
            }, this.battle3D.scene);
            trunk.material = trunkMaterial;
            trunk.position.set(x, -1.5 + trunkHeight / 2, z);
            
            // 创建树叶
            const leaves = BABYLON.MeshBuilder.CreateSphere("leaves", { 
                diameter: leavesSize * 2, 
                segments: 8 
            }, this.battle3D.scene);
            leaves.material = leavesMaterial;
            leaves.position.set(x, -1.5 + trunkHeight + leavesSize / 2, z);
        }
    }
    
    // 创建玩家3D模型
    createPlayerModel() {
        // 直接使用默认的人类卡通模型
        this.createDefaultPlayerModel();
    }
    
    // 创建默认玩家模型（当外部模型加载失败时使用）
    createDefaultPlayerModel() {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        // 创建玩家身体
        const body = BABYLON.MeshBuilder.CreateCylinder("body", { diameterTop: 0.8, diameterBottom: 1, height: 0.8, tessellation: 8 }, this.battle3D.scene);
        const bodyMaterial = new BABYLON.StandardMaterial("bodyMaterial", this.battle3D.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.235, 0.51, 0.98);
        bodyMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
        bodyMaterial.specularPower = 100;
        body.material = bodyMaterial;
        
        // 创建头部
        const head = BABYLON.MeshBuilder.CreateSphere("head", { diameter: 0.6 }, this.battle3D.scene);
        const headMaterial = new BABYLON.StandardMaterial("headMaterial", this.battle3D.scene);
        headMaterial.diffuseColor = new BABYLON.Color3(1, 0.843, 0.71);
        headMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
        headMaterial.specularPower = 100;
        head.material = headMaterial;
        head.position.y = CONSTANTS.PLAYER.HEAD.POSITION_Y;
        head.parent = body;
        
        // 创建头发
        const hair = BABYLON.MeshBuilder.CreateCylinder("hair", { diameterTop: 0.64, diameterBottom: 0.7, height: 0.2, tessellation: 8 }, this.battle3D.scene);
        const hairMaterial = new BABYLON.StandardMaterial("hairMaterial", this.battle3D.scene);
        hairMaterial.diffuseColor = new BABYLON.Color3(0.376, 0.647, 0.98);
        hairMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
        hairMaterial.specularPower = 100;
        hair.material = hairMaterial;
        hair.position.y = CONSTANTS.PLAYER.HAIR.POSITION_Y;
        hair.parent = body;
        
        // 创建手臂
        const leftArm = BABYLON.MeshBuilder.CreateCylinder("leftArm", { diameter: 0.3, height: 0.6, tessellation: 8 }, this.battle3D.scene);
        leftArm.material = bodyMaterial;
        leftArm.position.x = -0.6;
        leftArm.position.y = CONSTANTS.PLAYER.ARM.POSITION_Y;
        leftArm.rotation.z = Math.PI / 4;
        leftArm.parent = body;
        
        const rightArm = BABYLON.MeshBuilder.CreateCylinder("rightArm", { diameter: 0.3, height: 0.6, tessellation: 8 }, this.battle3D.scene);
        rightArm.material = bodyMaterial;
        rightArm.position.x = 0.6;
        rightArm.position.y = CONSTANTS.ENEMY.HEALTH_BAR.RELATIVE_Y;
        rightArm.rotation.z = -Math.PI / 4;
        rightArm.parent = body;
        
        // 创建腿部
        const leftLeg = BABYLON.MeshBuilder.CreateCylinder("leftLeg", { diameter: 0.4, height: 0.8, tessellation: 8 }, this.battle3D.scene);
        leftLeg.material = hairMaterial;
        leftLeg.position.x = -0.2;
        leftLeg.position.y = CONSTANTS.PLAYER.LEG.POSITION_Y;
        leftLeg.parent = body;
        
        const rightLeg = BABYLON.MeshBuilder.CreateCylinder("rightLeg", { diameter: 0.4, height: 0.8, tessellation: 8 }, this.battle3D.scene);
        rightLeg.material = hairMaterial;
        rightLeg.position.x = 0.2;
        rightLeg.position.y = CONSTANTS.PLAYER.LEG.POSITION_Y;
        rightLeg.parent = body;
        
        // 创建眼睛
        const eyeMaterial = new BABYLON.StandardMaterial("eyeMaterial", this.battle3D.scene);
        eyeMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        
        const leftEye = BABYLON.MeshBuilder.CreateSphere("leftEye", { diameter: 0.1 }, this.battle3D.scene);
        leftEye.material = eyeMaterial;
        leftEye.position.x = -0.1;
        leftEye.position.y = CONSTANTS.PLAYER.EYE.POSITION_Y;
        leftEye.position.z = 0.3;
        leftEye.parent = body;
        
        const rightEye = BABYLON.MeshBuilder.CreateSphere("rightEye", { diameter: 0.1 }, this.battle3D.scene);
        rightEye.material = eyeMaterial;
        rightEye.position.x = 0.1;
        rightEye.position.y = CONSTANTS.PLAYER.EYE.POSITION_Y;
        rightEye.position.z = 0.3;
        rightEye.parent = body;
        
        // 创建嘴巴
        const mouth = BABYLON.MeshBuilder.CreateCylinder("mouth", { diameter: 0.1, height: 0.02, tessellation: 8 }, this.battle3D.scene);
        mouth.material = eyeMaterial;
        mouth.position.x = 0;
        mouth.position.y = CONSTANTS.PLAYER.MOUTH.POSITION_Y;
        mouth.position.z = 0.3;
        mouth.parent = body;
        
        // 设置玩家位置（调整到地面上方）
        body.position.x = CONSTANTS.PLAYER.BODY_POSITION_X;
        body.position.y = CONSTANTS.PLAYER.BODY_POSITION_Y;
        
        // 存储玩家模型
        this.battle3D.player = body;
    }
    
    // 创建敌人3D模型
    createEnemyModel() {
        // 根据敌人名称创建对应的卡通形象
        const enemyName = this.gameState.enemy.name;
        
        if (enemyName.includes('狼')) {
            this.createWolfModel();
        } else if (enemyName.includes('熊')) {
            this.createBearModel();
        } else if (enemyName.includes('蛇')) {
            this.createSnakeModel();
        } else {
            // 如果没有对应的模型，使用默认模型
            this.createDefaultEnemyModel();
        }
    }
    
    // 创建狼模型
    createWolfModel() {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        // 创建狼身体
        const body = BABYLON.MeshBuilder.CreateCylinder("body", { diameterTop: 0.8, diameterBottom: 1.2, height: 1.2, tessellation: 8 }, this.battle3D.scene);
        const bodyMaterial = new BABYLON.StandardMaterial("bodyMaterial", this.battle3D.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.545, 0.271, 0.075);
        bodyMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
        bodyMaterial.specularPower = 50;
        body.material = bodyMaterial;
        
        // 创建头部
        const head = BABYLON.MeshBuilder.CreateCylinder("head", { diameterTop: 0.6, diameterBottom: 0.8, height: 0.5, tessellation: 8 }, this.battle3D.scene);
        head.material = bodyMaterial;
        head.position.y = CONSTANTS.ENEMY.WOLF.HEAD.POSITION_Y;
        head.rotation.x = Math.PI / 2;
        head.parent = body;
        
        // 创建耳朵
        const earMaterial = new BABYLON.StandardMaterial("earMaterial", this.battle3D.scene);
        earMaterial.diffuseColor = new BABYLON.Color3(0.824, 0.706, 0.545);
        earMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
        earMaterial.specularPower = 50;
        
        const leftEar = this.createConeMesh("leftEar", { diameter: 0.3, height: 0.3 }, this.battle3D.scene);
        leftEar.material = earMaterial;
        leftEar.position.x = -0.2;
        leftEar.position.y = CONSTANTS.ENEMY.WOLF.EAR.POSITION_Y;
        leftEar.position.z = 0.3;
        leftEar.rotation.x = Math.PI / 4;
        leftEar.rotation.z = -Math.PI / 4;
        leftEar.parent = body;
        
        const rightEar = this.createConeMesh("rightEar", { diameter: 0.3, height: 0.3 }, this.battle3D.scene);
        rightEar.material = earMaterial;
        rightEar.position.x = 0.2;
        rightEar.position.y = CONSTANTS.ENEMY.SNAKE.EAR.POSITION_Y;
        rightEar.position.z = 0.3;
        rightEar.rotation.x = Math.PI / 4;
        rightEar.rotation.z = Math.PI / 4;
        rightEar.parent = body;
        
        // 创建尾巴
        const tail = this.createConeMesh("tail", { diameter: 0.2, height: 0.6 }, this.battle3D.scene);
        tail.material = earMaterial;
        tail.position.y = CONSTANTS.ENEMY.WOLF.LEG.POSITION_Y;
        tail.position.z = 0.3;
        tail.rotation.x = -Math.PI / 4;
        tail.parent = body;
        
        // 创建腿部
        const legMaterial = bodyMaterial;
        
        // 前腿
        const frontLeftLeg = BABYLON.MeshBuilder.CreateCylinder("frontLeftLeg", { diameter: 0.3, height: 0.6, tessellation: 8 }, this.battle3D.scene);
        frontLeftLeg.material = legMaterial;
        frontLeftLeg.position.x = -0.3;
        frontLeftLeg.position.y = CONSTANTS.ENEMY.SNAKE.LEG.POSITION_Y;
        frontLeftLeg.position.z = 0.4;
        frontLeftLeg.parent = body;
        
        const frontRightLeg = BABYLON.MeshBuilder.CreateCylinder("frontRightLeg", { diameter: 0.3, height: 0.6, tessellation: 8 }, this.battle3D.scene);
        frontRightLeg.material = legMaterial;
        frontRightLeg.position.x = 0.3;
        frontRightLeg.position.y = CONSTANTS.ENEMY.WOLF.LEG.POSITION_Y;
        frontRightLeg.position.z = 0.4;
        frontRightLeg.parent = body;
        
        // 后腿
        const backLeftLeg = BABYLON.MeshBuilder.CreateCylinder("backLeftLeg", { diameter: 0.3, height: 0.6, tessellation: 8 }, this.battle3D.scene);
        backLeftLeg.material = legMaterial;
        backLeftLeg.position.x = -0.3;
        backLeftLeg.position.y = CONSTANTS.ENEMY.SNAKE.LEG.POSITION_Y;
        backLeftLeg.position.z = -0.4;
        backLeftLeg.parent = body;
        
        const backRightLeg = BABYLON.MeshBuilder.CreateCylinder("backRightLeg", { diameter: 0.3, height: 0.6, tessellation: 8 }, this.battle3D.scene);
        backRightLeg.material = legMaterial;
        backRightLeg.position.x = 0.3;
        backRightLeg.position.y = -0.6;
        backRightLeg.position.z = -0.4;
        backRightLeg.parent = body;
        
        // 创建眼睛
        const eyeMaterial = new BABYLON.StandardMaterial("eyeMaterial", this.battle3D.scene);
        eyeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        
        const leftEye = BABYLON.MeshBuilder.CreateSphere("leftEye", { diameter: 0.1 }, this.battle3D.scene);
        leftEye.material = eyeMaterial;
        leftEye.position.x = -0.1;
        leftEye.position.y = CONSTANTS.ENEMY.SNAKE.EYE.POSITION_Y;
        leftEye.position.z = 0.5;
        leftEye.parent = body;
        
        const rightEye = BABYLON.MeshBuilder.CreateSphere("rightEye", { diameter: 0.1 }, this.battle3D.scene);
        rightEye.material = eyeMaterial;
        rightEye.position.x = 0.1;
        rightEye.position.y = CONSTANTS.ENEMY.SNAKE.NOSE.POSITION_Y;
        rightEye.position.z = 0.5;
        rightEye.parent = body;
        
        // 创建鼻子
        const nose = this.createConeMesh("nose", { diameter: 0.2, height: 0.1 }, this.battle3D.scene);
        nose.material = eyeMaterial;
        nose.position.y = CONSTANTS.ENEMY.WOLF.EAR.POSITION_Y;
        nose.position.z = 0.7;
        nose.rotation.x = Math.PI;
        nose.parent = body;
        
        // 设置狼的位置
        body.position.x = 2;
        body.position.y = CONSTANTS.PLAYER.BODY_POSITION_Y;
        
        // 存储敌人模型
        this.battle3D.enemy = body;
        
        return body;
    }
    
    // 创建熊模型
    createBearModel() {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        // 创建熊身体
        const body = BABYLON.MeshBuilder.CreateCylinder("body", { diameterTop: 1.2, diameterBottom: 1.6, height: 1.5, tessellation: 8 }, this.battle3D.scene);
        const bodyMaterial = new BABYLON.StandardMaterial("bodyMaterial", this.battle3D.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.545, 0.271, 0.075); // 棕色
        bodyMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
        bodyMaterial.specularPower = 50;
        body.material = bodyMaterial;
        
        // 创建头部
        const head = BABYLON.MeshBuilder.CreateSphere("head", { diameter: 0.8 }, this.battle3D.scene);
        head.material = bodyMaterial;
        head.position.y = 1.2;
        head.parent = body;
        
        // 创建耳朵
        const earMaterial = new BABYLON.StandardMaterial("earMaterial", this.battle3D.scene);
        earMaterial.diffuseColor = new BABYLON.Color3(0.824, 0.706, 0.545); // 浅棕色
        earMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
        earMaterial.specularPower = 50;
        
        const leftEar = this.createConeMesh("leftEar", { diameter: 0.4, height: 0.3 }, this.battle3D.scene);
        leftEar.material = earMaterial;
        leftEar.position.x = -0.3;
        leftEar.position.y = CONSTANTS.ENEMY.BEAR.EAR.POSITION_Y;
        leftEar.position.z = 0.2;
        leftEar.rotation.x = Math.PI / 4;
        leftEar.rotation.z = -Math.PI / 4;
        leftEar.parent = body;
        
        const rightEar = this.createConeMesh("rightEar", { diameter: 0.4, height: 0.3 }, this.battle3D.scene);
        rightEar.material = earMaterial;
        rightEar.position.x = 0.3;
        rightEar.position.y = CONSTANTS.ENEMY.BEAR.EAR.POSITION_Y;
        rightEar.position.z = 0.2;
        rightEar.rotation.x = Math.PI / 4;
        rightEar.rotation.z = Math.PI / 4;
        rightEar.parent = body;
        
        // 创建手臂
        const leftArm = BABYLON.MeshBuilder.CreateCylinder("leftArm", { diameter: 0.4, height: 0.8, tessellation: 8 }, this.battle3D.scene);
        leftArm.material = bodyMaterial;
        leftArm.position.x = -0.7;
        leftArm.position.y = CONSTANTS.ENEMY.BEAR.ARM.POSITION_Y;
        leftArm.rotation.z = Math.PI / 4;
        leftArm.parent = body;
        
        const rightArm = BABYLON.MeshBuilder.CreateCylinder("rightArm", { diameter: 0.4, height: 0.8, tessellation: 8 }, this.battle3D.scene);
        rightArm.material = bodyMaterial;
        rightArm.position.x = 0.7;
        rightArm.position.y = CONSTANTS.ENEMY.BEAR.ARM.POSITION_Y;
        rightArm.rotation.z = -Math.PI / 4;
        rightArm.parent = body;
        
        // 创建腿部
        const leftLeg = BABYLON.MeshBuilder.CreateCylinder("leftLeg", { diameter: 0.6, height: 0.8, tessellation: 8 }, this.battle3D.scene);
        leftLeg.material = bodyMaterial;
        leftLeg.position.x = -0.3;
        leftLeg.position.y = -1.1;
        leftLeg.parent = body;
        
        const rightLeg = BABYLON.MeshBuilder.CreateCylinder("rightLeg", { diameter: 0.6, height: 0.8, tessellation: 8 }, this.battle3D.scene);
        rightLeg.material = bodyMaterial;
        rightLeg.position.x = 0.3;
        rightLeg.position.y = -1.1;
        rightLeg.parent = body;
        
        // 创建眼睛
        const eyeMaterial = new BABYLON.StandardMaterial("eyeMaterial", this.battle3D.scene);
        eyeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // 白色
        
        const leftEye = BABYLON.MeshBuilder.CreateSphere("leftEye", { diameter: 0.16 }, this.battle3D.scene);
        leftEye.material = eyeMaterial;
        leftEye.position.x = -0.15;
        leftEye.position.y = CONSTANTS.ENEMY.BEAR.EYE.POSITION_Y;
        leftEye.position.z = 0.4;
        leftEye.parent = body;
        
        const rightEye = BABYLON.MeshBuilder.CreateSphere("rightEye", { diameter: 0.16 }, this.battle3D.scene);
        rightEye.material = eyeMaterial;
        rightEye.position.x = 0.15;
        rightEye.position.y = CONSTANTS.ENEMY.BEAR.EYE.POSITION_Y;
        rightEye.position.z = 0.4;
        rightEye.parent = body;
        
        // 创建鼻子
        const nose = this.createConeMesh("nose", { diameter: 0.3, height: 0.2, tessellation: 8 }, this.battle3D.scene);
        nose.material = earMaterial;
        nose.position.y = CONSTANTS.ENEMY.BEAR.NOSE.POSITION_Y;
        nose.position.z = 0.45;
        nose.rotation.x = Math.PI;
        nose.parent = body;
        
        // 设置熊的位置
        body.position.x = 2;
        body.position.y = CONSTANTS.PLAYER.BODY_POSITION_Y;
        
        // 存储敌人模型
        this.battle3D.enemy = body;
        
        return body;
    }
    
    // 创建蛇模型
    createSnakeModel() {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        // 创建蛇身体组
        const snakeBody = BABYLON.MeshBuilder.CreateBox("snakeBody", { size: 0.1 }, this.battle3D.scene);
        const bodyMaterial = new BABYLON.StandardMaterial("bodyMaterial", this.battle3D.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0, 0.392, 0); // 绿色
        bodyMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
        bodyMaterial.specularPower = 50;
        snakeBody.material = bodyMaterial;
        
        // 身体（使用多个圆柱体连接）
        for (let i = 0; i < 5; i++) {
            const segment = BABYLON.MeshBuilder.CreateCylinder(`segment${i}`, { 
                diameterTop: 0.6 - i * 0.1, 
                diameterBottom: 0.6 - (i + 1) * 0.1, 
                height: 0.4, 
                tessellation: 8 
            }, this.battle3D.scene);
            segment.material = bodyMaterial;
            segment.position.x = i * 0.3;
            segment.position.y = Math.sin(i * 0.5) * 0.2;
            segment.rotation.z = Math.sin(i * 0.5) * 0.3;
            segment.parent = snakeBody;
        }
        
        // 头部
        const head = BABYLON.MeshBuilder.CreateCylinder("head", { 
            diameterTop: 0.6, 
            diameterBottom: 0.8, 
            height: 0.5, 
            tessellation: 8 
        }, this.battle3D.scene);
        head.material = bodyMaterial;
        head.position.x = 1.5;
        head.position.y = Math.sin(4 * 0.5) * 0.2;
        head.rotation.z = Math.sin(4 * 0.5) * 0.3;
        head.parent = snakeBody;
        
        // 眼睛
        const eyeMaterial = new BABYLON.StandardMaterial("eyeMaterial", this.battle3D.scene);
        eyeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // 白色
        
        const leftEye = BABYLON.MeshBuilder.CreateSphere("leftEye", { diameter: 0.16 }, this.battle3D.scene);
        leftEye.material = eyeMaterial;
        leftEye.position.x = 1.7;
        leftEye.position.y = Math.sin(4 * 0.5) * 0.2 + 0.15;
        leftEye.position.z = 0.2;
        leftEye.rotation.z = Math.sin(4 * 0.5) * 0.3;
        leftEye.parent = snakeBody;
        
        const rightEye = BABYLON.MeshBuilder.CreateSphere("rightEye", { diameter: 0.16 }, this.battle3D.scene);
        rightEye.material = eyeMaterial;
        rightEye.position.x = 1.7;
        rightEye.position.y = Math.sin(4 * 0.5) * 0.2 - 0.15;
        rightEye.position.z = 0.2;
        rightEye.rotation.z = Math.sin(4 * 0.5) * 0.3;
        rightEye.parent = snakeBody;
        
        // 舌头
        const tongueMaterial = new BABYLON.StandardMaterial("tongueMaterial", this.battle3D.scene);
        tongueMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // 红色
        
        const tongue = this.createConeMesh("tongue", { 
            diameter: 0.1, 
            height: 0.2, 
            tessellation: 8 
        }, this.battle3D.scene);
        tongue.material = tongueMaterial;
        tongue.position.x = 1.9;
        tongue.position.y = Math.sin(4 * 0.5) * 0.2;
        tongue.position.z = 0.2;
        tongue.rotation.z = Math.sin(4 * 0.5) * 0.3 + Math.PI;
        tongue.parent = snakeBody;
        
        // 设置蛇的位置
        snakeBody.position.x = 2;
        snakeBody.position.y = 1.5;
        snakeBody.rotation.y = Math.PI / 2;
        
        // 存储敌人模型
        this.battle3D.enemy = snakeBody;
        
        return snakeBody;
    }
    
    // 创建默认敌人模型（当外部模型加载失败时使用）
    createDefaultEnemyModel() {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        // 创建狼身体
        const body = BABYLON.MeshBuilder.CreateCylinder("body", { diameterTop: 0.8, diameterBottom: 1.2, height: 1.2, tessellation: 8 }, this.battle3D.scene);
        const bodyMaterial = new BABYLON.StandardMaterial("bodyMaterial", this.battle3D.scene);
        bodyMaterial.diffuseColor = new BABYLON.Color3(0.545, 0.271, 0.075); // 棕色
        bodyMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
        bodyMaterial.specularPower = 50;
        body.material = bodyMaterial;
        
        // 创建头部
        const head = BABYLON.MeshBuilder.CreateCylinder("head", { diameterTop: 0.6, diameterBottom: 0.8, height: 0.5, tessellation: 8 }, this.battle3D.scene);
        head.material = bodyMaterial;
        head.position.y = CONSTANTS.ENEMY.BEAR.HEAD.POSITION_Y;
        head.rotation.x = Math.PI / 2;
        head.parent = body;
        
        // 创建耳朵
        const earMaterial = new BABYLON.StandardMaterial("earMaterial", this.battle3D.scene);
        earMaterial.diffuseColor = new BABYLON.Color3(0.824, 0.706, 0.545); // 浅棕色
        earMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
        earMaterial.specularPower = 50;
        
        const leftEar = this.createConeMesh("leftEar", { diameter: 0.3, height: 0.3 }, this.battle3D.scene);
        leftEar.material = earMaterial;
        leftEar.position.x = -0.2;
        leftEar.position.y = CONSTANTS.ENEMY.SNAKE.EAR.POSITION_Y;
        leftEar.position.z = 0.3;
        leftEar.rotation.x = Math.PI / 4;
        leftEar.rotation.z = -Math.PI / 4;
        leftEar.parent = body;
        
        const rightEar = this.createConeMesh("rightEar", { diameter: 0.3, height: 0.3 }, this.battle3D.scene);
        rightEar.material = earMaterial;
        rightEar.position.x = 0.2;
        rightEar.position.y = CONSTANTS.ENEMY.SNAKE.EYE.POSITION_Y;
        rightEar.position.z = 0.3;
        rightEar.rotation.x = Math.PI / 4;
        rightEar.rotation.z = Math.PI / 4;
        rightEar.parent = body;
        
        // 创建尾巴
        const tail = this.createConeMesh("tail", { diameter: 0.2, height: 0.6 }, this.battle3D.scene);
        tail.material = earMaterial;
        tail.position.y = -0.6;
        tail.position.z = 0.3;
        tail.rotation.x = -Math.PI / 4;
        tail.parent = body;
        
        // 创建腿部
        const legMaterial = bodyMaterial;
        
        // 前腿
        const frontLeftLeg = BABYLON.MeshBuilder.CreateCylinder("frontLeftLeg", { diameter: 0.3, height: 0.6, tessellation: 8 }, this.battle3D.scene);
        frontLeftLeg.material = legMaterial;
        frontLeftLeg.position.x = -0.3;
        frontLeftLeg.position.y = -0.6;
        frontLeftLeg.position.z = 0.4;
        frontLeftLeg.parent = body;
        
        const frontRightLeg = BABYLON.MeshBuilder.CreateCylinder("frontRightLeg", { diameter: 0.3, height: 0.6, tessellation: 8 }, this.battle3D.scene);
        frontRightLeg.material = legMaterial;
        frontRightLeg.position.x = 0.3;
        frontRightLeg.position.y = -0.6;
        frontRightLeg.position.z = 0.4;
        frontRightLeg.parent = body;
        
        // 后腿
        const backLeftLeg = BABYLON.MeshBuilder.CreateCylinder("backLeftLeg", { diameter: 0.3, height: 0.6, tessellation: 8 }, this.battle3D.scene);
        backLeftLeg.material = legMaterial;
        backLeftLeg.position.x = -0.3;
        backLeftLeg.position.y = -0.6;
        backLeftLeg.position.z = -0.4;
        backLeftLeg.parent = body;
        
        const backRightLeg = BABYLON.MeshBuilder.CreateCylinder("backRightLeg", { diameter: 0.3, height: 0.6, tessellation: 8 }, this.battle3D.scene);
        backRightLeg.material = legMaterial;
        backRightLeg.position.x = 0.3;
        backRightLeg.position.y = -0.6;
        backRightLeg.position.z = -0.4;
        backRightLeg.parent = body;
        
        // 创建眼睛
        const eyeMaterial = new BABYLON.StandardMaterial("eyeMaterial", this.battle3D.scene);
        eyeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // 白色
        
        const leftEye = BABYLON.MeshBuilder.CreateSphere("leftEye", { diameter: 0.1 }, this.battle3D.scene);
        leftEye.material = eyeMaterial;
        leftEye.position.x = -0.1;
        leftEye.position.y = CONSTANTS.ENEMY.SNAKE.NOSE.POSITION_Y;
        leftEye.position.z = 0.5;
        leftEye.parent = body;
        
        const rightEye = BABYLON.MeshBuilder.CreateSphere("rightEye", { diameter: 0.1 }, this.battle3D.scene);
        rightEye.material = eyeMaterial;
        rightEye.position.x = 0.1;
        rightEye.position.y = 1.0;
        rightEye.position.z = 0.5;
        rightEye.parent = body;
        
        // 创建鼻子
        const nose = this.createConeMesh("nose", { diameter: 0.2, height: 0.1 }, this.battle3D.scene);
        nose.material = eyeMaterial;
        nose.position.y = 1.0;
        nose.position.z = 0.7;
        nose.rotation.x = Math.PI;
        nose.parent = body;
        
        // 设置狼的位置
        body.position.x = 2;
        body.position.y = 1.5;
        
        // 存储敌人模型
        this.battle3D.enemy = body;
        
        return body;
    }
    
    // 3D战斗场景动画循环
    animateBattle3D() {
        // 在Babylon.js中，动画循环由引擎自动处理
        // 这里只需要处理玩家和敌人的动画逻辑
        if (!this.battle3D || !this.battle3D.scene || !this.battle3D.camera) {
            return;
        }
        
        // 玩家和敌人的默认动画
        if (this.battle3D.player && !this.battle3D.isAttacking && !this.battle3D.playerDefeated) {
            // 检查是否处于战斗场景（通过检查是否有enemy模型）
            const isBattleScene = !!this.battle3D.enemy;
            
            // 只有在非战斗场景中才允许鼠标移动
            if (!isBattleScene && this.isMoving && this.mouseTarget) {
                // 计算玩家到目标位置的方向和距离
                const dx = this.mouseTarget.x - this.battle3D.player.position.x;
                const dz = this.mouseTarget.z - this.battle3D.player.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                // 如果距离大于阈值，继续移动
                if (distance > 0.1) {
                    // 计算移动方向
                    const moveSpeed = 0.05;
                    const moveX = (dx / distance) * moveSpeed;
                    const moveZ = (dz / distance) * moveSpeed;
                    
                    // 移动玩家
                    this.battle3D.player.position.x += moveX;
                    this.battle3D.player.position.z += moveZ;
                    
                    // 限制人物移动范围，防止走出场景
                    this.battle3D.player.position.x = Math.max(-8, Math.min(8, this.battle3D.player.position.x));
                    this.battle3D.player.position.z = Math.max(-8, Math.min(8, this.battle3D.player.position.z));
                    
                    // 检查玩家与预生成敌人的碰撞
                    this.checkEnemyCollision();
                } else {
                    // 到达目标位置
                    this.isMoving = false;
                    this.mouseTarget = null;
                }
            } else {
                // 战斗场景中玩家轻微呼吸动画
                this.battle3D.player.position.y = Math.sin(Date.now() * 0.001) * 0.05;
            }
        }
        
        if (this.battle3D.enemy && !this.battle3D.isAttacking && !this.battle3D.enemyDefeated) {
            // 战斗场景中敌人轻微晃动
            this.battle3D.enemy.position.y = Math.sin(Date.now() * 0.0015) * 0.05;
            this.battle3D.enemy.rotation.z = Math.sin(Date.now() * 0.001) * 0.02;
        }
        
        // 确保相机看向场景中心
        if (this.battle3D.camera) {
            this.battle3D.camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        }
    }
    
    // 播放攻击动画
    playAttackAnimation() {
        if (!this.battle3D || !this.battle3D.player || !this.battle3D.enemy) return;
        
        // 标记正在攻击
        this.battle3D.isAttacking = true;
        
        // 玩家攻击动画
        const player = this.battle3D.player;
        // ensure position exists before cloning
        if (!player.position || typeof player.position.clone !== 'function') {
            console.warn('playAttackAnimation: player position 无效', player);
            return;
        }
        const originalPosition = player.position.clone();
        
        // 攻击动画：玩家向敌人移动
        let attackProgress = 0;
        const attackSpeed = 0.1;
        
        const attackAnimation = () => {
            attackProgress += attackSpeed;
            
            if (attackProgress <= 0.5) {
                // 向前移动
                const targetX = originalPosition.x + (this.battle3D.enemy.position.x - originalPosition.x) * (attackProgress * 2);
                player.position.x = targetX;
            } else if (attackProgress <= 1) {
                // 向后移动
                const targetX = originalPosition.x + (this.battle3D.enemy.position.x - originalPosition.x) * ((1 - attackProgress) * 2);
                player.position.x = targetX;
            } else {
                // 动画结束
                player.position.copyFrom(originalPosition);
                this.battle3D.isAttacking = false;
                return;
            }
            
            requestAnimationFrame(attackAnimation);
        };
        
        attackAnimation();
        
        // 敌人被攻击反馈
        setTimeout(() => {
            this.playEnemyHitAnimation();
        }, 200);
    }
    
    // 播放防御动画
    playDefenseAnimation() {
        if (!this.battle3D || !this.battle3D.player) return;
        
        // 简单的防御动画：角色模型稍微后退并缩小
        const player = this.battle3D.player;
        
        // 防御动画依赖 position 和 scale
        if (!player.position || typeof player.position.clone !== 'function' ||
            !player.scale || typeof player.scale.clone !== 'function') {
            console.warn('playDefenseAnimation: player position/scale 不可用', player);
            return;
        }
        
        // 保存初始状态
        const initialPosition = player.position.clone();
        const initialScale = player.scale.clone();
        
        // 动画持续时间
        const duration = 500; // 500毫秒
        const startTime = Date.now();
        
        // 动画函数
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 计算新位置和缩放
            const newX = initialPosition.x - Math.sin(progress * Math.PI) * 0.3;
            const newScale = initialScale.x * (1 - Math.sin(progress * Math.PI) * 0.1);
            
            player.position.x = newX;
            player.scale.set(newScale, newScale, newScale);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 动画结束，恢复初始状态
                player.position.x = initialPosition.x;
                player.scale.set(initialScale.x, initialScale.y, initialScale.z);
            }
        };
        
        // 开始动画
        animate();
    }
    
    // 创建防御特效
    createDefenseEffect() {
        if (!this.battle3D || !this.battle3D.player || !this.battle3D.scene) return;
        
        const player = this.battle3D.player;
        
        // 移除旧的防御特效（如果存在）
        this.removeDefenseEffect();
        
        // 创建防御圆圈
        const defenseCircle = BABYLON.MeshBuilder.CreateDisc("defenseCircle", { radius: 1.2, tessellation: 32 }, this.battle3D.scene);
        const circleMaterial = new BABYLON.StandardMaterial("circleMaterial", this.battle3D.scene);
        circleMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1); // 青色
        circleMaterial.alpha = 0.7;
        circleMaterial.backFaceCulling = false;
        defenseCircle.material = circleMaterial;
        
        // 旋转和定位
        defenseCircle.rotation.x = Math.PI / 2;
        defenseCircle.position.y = CONSTANTS.ENEMY.DEFENSE_CIRCLE_Y;
        
        // 添加到玩家
        defenseCircle.parent = player;
        
        // 持续的扫动动画（不会自动消失）
        const startTime = Date.now();
        
        const animate = () => {
            if (!this.gameState.player.defenseActive) {
                // 防御状态已清除，停止动画
                return;
            }
            
            const elapsed = Date.now() - startTime;
            const progress = (elapsed / 1000) % 1; // 循环动画
            
            // 缩放和透明度变化
            const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.2;
            const opacity = 0.5 + Math.sin(progress * Math.PI * 2) * 0.2; // 0.3-0.7之间变化
            
            defenseCircle.scaling.set(scale, scale, scale);
            defenseCircle.material.alpha = opacity;
            
            requestAnimationFrame(animate);
        };
        
        // 存储防御特效的引用
        this.gameState.player.defenseEffects = {
            circle: defenseCircle,
            material: circleMaterial,
            animationId: null
        };
        
        animate();
    }

    // 移除防御特效
    removeDefenseEffect() {
        if (!this.gameState.player.defenseEffects) return;
        
        const effects = this.gameState.player.defenseEffects;
        
        // 移除防御圆圈网格
        if (effects.circle && effects.circle.dispose) {
            effects.circle.dispose();
        }
        
        // 移除材质
        if (effects.material && effects.material.dispose) {
            effects.material.dispose();
        }
        
        // 清除引用
        this.gameState.player.defenseEffects = null;
    }
    
    // 创建攻击特效
    createAttackEffect(skillIndex) {
        if (!this.battle3D || !this.battle3D.player || !this.battle3D.scene) return;
        
        const player = this.battle3D.player;
        
        // 优先使用显式的 enemy，如果没有则从 enemies 列表中回退查找一个活动的敌人模型
        let enemy = this.battle3D.enemy;
        if (!enemy && Array.isArray(this.battle3D.enemies) && this.battle3D.enemies.length > 0) {
            const active = this.battle3D.enemies.find(e => e && e.active && e.model);
            enemy = active ? active.model : (this.battle3D.enemies[0] && this.battle3D.enemies[0].model);
        }
        
        // 根据技能索引创建不同的特效颜色
        let color;
        if (skillIndex === -1) {
            // 普通攻击
            color = new BABYLON.Color3(0, 1, 0); // 绿色
        } else {
            switch (skillIndex) {
                case 0: // 强力攻击
                    color = new BABYLON.Color3(1, 0, 0); // 红色
                    break;
                case 1: // 防御姿态
                    color = new BABYLON.Color3(0, 0, 1); // 蓝色
                    break;
                case 2: // 生命恢复
                    color = new BABYLON.Color3(0, 1, 0); // 绿色
                    break;
                case 3: // 幸运一击
                    color = new BABYLON.Color3(1, 1, 0); // 黄色
                    break;
                default:
                    color = new BABYLON.Color3(0, 1, 1); // 青色
            }
        }
        
        // 创建粒子系统
        const particleSystem = new BABYLON.ParticleSystem("attackParticles", 100, this.battle3D.scene);
        
        // 设置粒子纹理（使用默认纹理）
        particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.battle3D.scene);
        
        // 设置粒子发射位置（稍微抬高），如果 player.position 不可用则使用场景中心
        let emitterPos = new BABYLON.Vector3(0, 1, 0);
        if (player.position && typeof player.position.clone === 'function') {
            emitterPos = player.position.clone().add(new BABYLON.Vector3(0, 1, 0));
        }
        particleSystem.emitter = emitterPos;
        
        // 设置粒子颜色
        particleSystem.color1 = new BABYLON.Color4(color.r, color.g, color.b, 0.8);
        particleSystem.color2 = new BABYLON.Color4(color.r, color.g, color.b, 0.8);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        // 设置粒子大小
        particleSystem.minSize = 0.08;
        particleSystem.maxSize = 0.15;
        
        // 设置粒子生命周期
        particleSystem.minLifeTime = 0.6;
        particleSystem.maxLifeTime = 0.8;
        
        // 设置粒子速度
        particleSystem.minSpeed = 5;
        particleSystem.maxSpeed = 10;
        
        // 设置粒子方向（朝向敌人），如果没有 enemy 则朝向 +Z
        if (enemy && enemy.position && player.position) {
            const dir = enemy.position.subtract(player.position).normalize();
            particleSystem.direction1 = dir.scale(5);
            particleSystem.direction2 = dir.scale(10);
        } else {
            particleSystem.direction1 = new BABYLON.Vector3(0, 0, 1).scale(5);
            particleSystem.direction2 = new BABYLON.Vector3(0, 0, 1).scale(10);
        }
        
        // 设置发射率（更高的发射率使特效更明显）
        particleSystem.emitRate = 150;
        
        // 启动粒子系统
        particleSystem.start();
        
        // 800毫秒后停止并清理粒子系统
        setTimeout(() => {
            try { particleSystem.stop(); } catch (e) {}
            setTimeout(() => {
                try { particleSystem.dispose(); } catch (e) {}
            }, 1000);
        }, 800);
    }
    
    // 显示伤害数字
    showDamage(target, damage, color) {
        if (!this.battle3D || !this.battle3D.scene || !this.battle3D.camera) return;
        
        // 创建伤害文本
        const canvas = document.createElement('canvas');
        canvas.width = 384; // 增大3倍
        canvas.height = 192; // 增大3倍
        const context = canvas.getContext('2d');
        
        // 设置文本样式
        context.font = 'bold 72px Arial'; // 增大3倍
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // 绘制文本
        const text = damage > 0 ? `-${damage}` : `+${Math.abs(damage)}`;
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // 创建纹理（从canvas生成动态纹理）
        const dynamicTexture = new BABYLON.DynamicTexture("damageTexture", {width: canvas.width, height: canvas.height}, this.battle3D.scene, false);
        const dtCtx = dynamicTexture.getContext();
        dtCtx.drawImage(canvas, 0, 0);
        dynamicTexture.update();
        const texture = dynamicTexture;
        
        // 创建平面
        const damageText = BABYLON.MeshBuilder.CreatePlane("damageText", { width: 3, height: 1.5 }, this.battle3D.scene);
        const material = new BABYLON.StandardMaterial("damageMaterial", this.battle3D.scene);
        material.diffuseTexture = texture;
        material.diffuseTexture.hasAlpha = true;
        material.backFaceCulling = false;
        material.alpha = 1;
        damageText.material = material;
        
        // 设置位置
        if (target === this.gameState.player && this.battle3D.player) {
            damageText.position.copyFrom(this.battle3D.player.position);
            damageText.position.y += 3; // 稍微提高位置，避免与角色重叠
        } else if (target === this.gameState.enemy && this.battle3D.enemy) {
            damageText.position.copyFrom(this.battle3D.enemy.position);
            damageText.position.y += 3; // 稍微提高位置，避免与敌人重叠
        } else {
            return;
        }
        
        // 确保文本始终面向相机（在Babylon.js中使用billboardMode）
        damageText.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        
        // 动画效果
        const duration = 1000; // 1秒
        const startTime = Date.now();
        const initialPosition = damageText.position.clone();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 向上移动
            damageText.position.y = initialPosition.y + progress * 1.5; // 稍微增加移动距离
            
            // 透明度变化
            damageText.material.alpha = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 动画结束，移除文本
                if (damageText && damageText.dispose) {
                    damageText.dispose();
                }
                if (material && material.dispose) {
                    material.dispose();
                }
                if (texture && texture.dispose) {
                    texture.dispose();
                }
            }
        };
        
        // 开始动画
        animate();
    }

    // 显示能量变化提示
    showEnergyChange(target, energyChange) {
        if (!this.battle3D || !this.battle3D.scene || !this.battle3D.camera) return;
        
        // 创建能量变化文本
        const canvas = document.createElement('canvas');
        canvas.width = 384; // 增大3倍
        canvas.height = 192; // 增大3倍
        const context = canvas.getContext('2d');
        
        // 设置文本样式
        context.font = 'bold 72px Arial'; // 增大3倍
        context.fillStyle = '#FFD700'; // 金黄色表示能量
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // 绘制文本
        const text = energyChange > 0 ? `+${energyChange}` : `-${Math.abs(energyChange)}`;
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // 创建纹理（从canvas生成动态纹理）
        const dynamicTexture = new BABYLON.DynamicTexture("energyTexture", {width: canvas.width, height: canvas.height}, this.battle3D.scene, false);
        const dtCtx = dynamicTexture.getContext();
        dtCtx.drawImage(canvas, 0, 0);
        dynamicTexture.update();
        const texture = dynamicTexture;
        
        // 创建平面
        const energyText = BABYLON.MeshBuilder.CreatePlane("energyText", { width: 3, height: 1.5 }, this.battle3D.scene);
        const material = new BABYLON.StandardMaterial("energyMaterial", this.battle3D.scene);
        material.diffuseTexture = texture;
        material.diffuseTexture.hasAlpha = true;
        material.backFaceCulling = false;
        material.alpha = 1;
        energyText.material = material;
        
        // 设置位置
        if (target === this.gameState.player && this.battle3D.player) {
            energyText.position.copyFrom(this.battle3D.player.position);
            energyText.position.y += 3; // 稍微提高位置，避免与角色重叠
        } else if (target === this.gameState.enemy && this.battle3D.enemy) {
            energyText.position.copyFrom(this.battle3D.enemy.position);
            energyText.position.y += 3; // 稍微提高位置，避免与敌人重叠
        } else {
            return;
        }
        
        // 确保文本始终面向相机（在Babylon.js中使用billboardMode）
        energyText.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        
        // 动画效果
        const duration = 1000; // 1秒
        const startTime = Date.now();
        const initialPosition = energyText.position.clone();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 向上移动
            energyText.position.y = initialPosition.y + progress * 1.5;
            
            // 透明度变化
            energyText.material.alpha = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 动画结束，移除文本
                if (energyText && energyText.dispose) {
                    energyText.dispose();
                }
                if (material && material.dispose) {
                    material.dispose();
                }
                if (texture && texture.dispose) {
                    texture.dispose();
                }
            }
        };
        
        // 开始动画
        animate();
    }
    
    // 播放敌人被攻击动画
    playEnemyHitAnimation() {
        if (!this.battle3D || !this.battle3D.enemy) return;
        
        const enemy = this.battle3D.enemy;
        
        // 敌人震动效果
        let shakeProgress = 0;
        const shakeSpeed = 0.1;
        const originalPosition = enemy.position.clone();
        
        const shakeAnimation = () => {
            shakeProgress += shakeSpeed;
            
            if (shakeProgress <= 1) {
                // 震动效果
                const shakeAmount = (1 - shakeProgress) * 0.1;
                enemy.position.x = originalPosition.x + (Math.random() - 0.5) * shakeAmount;
                enemy.position.y = originalPosition.y + (Math.random() - 0.5) * shakeAmount;
            } else {
                // 动画结束
                enemy.position.copyFrom(originalPosition);
                return;
            }
            
            requestAnimationFrame(shakeAnimation);
        };
        
        shakeAnimation();
    }
    
    // 绑定事件
    bindEvents() {
        
        // 安全的事件绑定函数
        const bindEvent = (selector, event, callback) => {
            try {
                const element = document.querySelector(selector);
                if (element) {
                    element.addEventListener(event, callback);
                    (`成功绑定 ${event} 事件到 ${selector}`);
                } else {
                    (`未找到元素 ${selector}`);
                }
            } catch (error) {
                console.error(`绑定事件到 ${selector} 时出错:`, error);
            }
        };
        
        // 关闭战斗模态窗口按钮
        bindEvent('#close-battle-modal', 'click', () => {
            this.closeBattleModal();
        });
        
        // 攻击按钮
        bindEvent('#attack-btn', 'click', () => {
            this.attackEnemy();
        });
        
        // 自动战斗按钮
        bindEvent('#auto-battle-btn', 'click', () => {
            this.toggleAutoBattle();
        });
        
        // 自动收集资源按钮
        bindEvent('#auto-collect-btn', 'click', () => {
            this.toggleAutoCollect();
        });
        
        // 自动战斗目标颜色设置
        bindEvent('#auto-battle-green', 'change', () => {
            this.updateAutoBattleTargetColors();
        });
        bindEvent('#auto-battle-yellow', 'change', () => {
            this.updateAutoBattleTargetColors();
        });
        bindEvent('#auto-battle-red', 'change', () => {
            this.updateAutoBattleTargetColors();
        });
        
        // 自动收集资源类型设置
        bindEvent('#auto-collect-wood', 'change', () => {
            this.updateAutoCollectResourceTypes();
        });
        bindEvent('#auto-collect-iron', 'change', () => {
            this.updateAutoCollectResourceTypes();
        });
        bindEvent('#auto-collect-crystal', 'change', () => {
            this.updateAutoCollectResourceTypes();
        });
        
        // 自动挂机开关
        bindEvent('#auto挂机', 'change', (e) => {
            this.toggleAutoPlay(e.target.checked);
        });
        
        // 资源收集按钮
        bindEvent('#collect-wood', 'click', () => {
            this.collectResource('wood');
        });
        
        bindEvent('#collect-iron', 'click', () => {
            this.collectResource('iron');
        });
        
        bindEvent('#collect-crystal', 'click', () => {
            this.collectResource('crystal');
        });
        
        // 游戏设置按钮

        

        
        // 用户相关按钮
        
        bindEvent('#logout-btn', 'click', () => {
            this.logout();
        });
        
        // 装备相关按钮
        bindEvent('#equip-item-btn', 'click', () => {
            this.showEquipMenu();
        });
        
        bindEvent('#unequip-item-btn', 'click', () => {
            this.showUnequipMenu();
        });
        
        // 背包按钮
        bindEvent('#open-inventory-btn', 'click', () => {
            this.showInventory();
        });
        
        // 为装备槽位添加点击事件
        try {
            const equipmentSlots = document.querySelectorAll('.equipment-slot');
            equipmentSlots.forEach(slot => {
                slot.addEventListener('click', () => {
                    const selectedSlot = slot.dataset.slot;
                    this.updateRefineInfo(selectedSlot);
                    this.updateDisassembleInfo(selectedSlot);
                    // 存储当前选中的装备槽位
                    this.selectedRefineSlot = selectedSlot;
                    // 更新装备槽位的样式
                    document.querySelectorAll('.equipment-slot').forEach(s => {
                        s.classList.remove('border-accent');
                    });
                    slot.classList.add('border-accent');
                });
                
                // 添加双击事件来卸下装备
                slot.addEventListener('dblclick', () => {
                    const selectedSlot = slot.dataset.slot;
                    const item = this.gameState.player.equipment[selectedSlot];
                    if (item) {
                        this.unequipItem(selectedSlot);
                    }
                });
            });
            (`成功绑定 ${equipmentSlots.length} 个装备槽位事件`);
        } catch (error) {
            console.error('绑定装备槽位事件时出错:', error);
        }
        
        // 精炼装备按钮
        bindEvent('#refine-weapon-btn', 'click', () => {
            const slot = this.selectedRefineSlot || 'weapon';
            this.refineEquipment(slot);
        });
        

        
        // 一键装备最好的装备按钮
        bindEvent('#auto-equip-btn', 'click', () => {
            this.autoEquipBestGear();
        });
        
        // 特殊技按钮
        bindEvent('#skill-0', 'click', () => {
            this.useSkill(0);
        });
        
        bindEvent('#skill-1', 'click', () => {
            this.useSkill(1);
        });
        
        bindEvent('#skill-2', 'click', () => {
            this.useSkill(2);
        });
        
        bindEvent('#skill-3', 'click', () => {
            this.useSkill(3);
        });
        
        // 商店购买按钮
        bindEvent('#buy-health-potion', 'click', () => {
            this.buyShopItem('health_potion');
        });
        
        bindEvent('#buy-energy-potion', 'click', () => {
            this.buyShopItem('energy_potion');
        });
        
        bindEvent('#buy-attack-potion', 'click', () => {
            this.buyShopItem('attack_potion');
        });
        
        bindEvent('#buy-defense-potion', 'click', () => {
            this.buyShopItem('defense_potion');
        });
        
        bindEvent('#buy-basic-sword', 'click', () => {
            this.buyShopItem('basic_sword');
        });
        
        bindEvent('#buy-basic-armor', 'click', () => {
            this.buyShopItem('basic_armor');
        });
        
        bindEvent('#buy-basic-helmet', 'click', () => {
            this.buyShopItem('basic_helmet');
        });
        
        // 剩余的按钮事件绑定
        bindEvent('#buy-basic-boots', 'click', () => {
            this.buyShopItem('basic_boots');
        });
        
        bindEvent('#reset-game', 'click', () => {
            this.resetGame();
        });
        
        // 注销账号按钮
        bindEvent('#delete-account-btn', 'click', () => {
            this.deleteAccount();
        });
        
        // 设置按钮下拉菜单
        bindEvent('#settings-btn', 'click', () => {
            const dropdown = document.getElementById('settings-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('hidden');
            }
        });
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', (e) => {
            const settingsBtn = document.getElementById('settings-btn');
            const dropdown = document.getElementById('settings-dropdown');
            if (settingsBtn && dropdown && !settingsBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
        
        // 刷新敌人按钮
        bindEvent('#refresh-enemy-btn', 'click', () => {
            this.generateMiniMap(); // 重新生成整个地图的敌人，确保与用户等级匹配
            
            // 随机刷新3D场景背景
            if (this.gameState.mapBackgrounds.length > 0) {
                const randomBackgroundIndex = Math.floor(Math.random() * this.gameState.mapBackgrounds.length);
                this.gameState.currentBackgroundIndex = randomBackgroundIndex;
                this.updateMapBackgroundUI();
                this.addBattleLog(`刷新了敌人和场景背景为：${this.gameState.mapBackgrounds[randomBackgroundIndex].name}！`);
            } else {
                this.addBattleLog('刷新了敌人！');
            }
            
            this.updateUI();
        });
        
        // 攻击确认按钮
        bindEvent('#attack-confirm-btn', 'click', () => {
            if (this.gameState.enemy) {
                this.encounterEnemy(this.gameState.enemy);
            }
        });
        
        // 初始化所有按钮的tooltip
        this.initTooltips();
        
        // 添加键盘事件监听器，控制3D人物移动和关闭模态窗口
        document.addEventListener('keydown', (e) => {
            // ESC键关闭战斗模态
            if (e.key === 'Escape') {
                const battleModal = document.getElementById('battle-modal');
                if (battleModal && !battleModal.classList.contains('hidden')) {
                    this.closeBattleModal();
                    //this.restoreUILayout();
                    return;
                }
            }
            this.handleKeyPress(e);
        });
        
        // 添加页面卸载时保存数据的事件监听器
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
        });
        
        // 添加定期保存机制
        setInterval(() => {
            this.saveGameState();
        }, 60000); // 每60秒自动保存
        
    }
    
    // 处理键盘按键事件
    handleKeyPress(e) {
        // 处理攻击和技能快捷键
        switch (e.key) {
            case 'h':
            case 'H':
                // 普通攻击
                this.attackEnemy();
                return; // 避免继续处理移动逻辑
            case 'j':
            case 'J':
                // 第一个技能
                this.useSkill(0);
                return; // 避免继续处理移动逻辑
            case 'k':
            case 'K':
                // 第二个技能
                this.useSkill(1);
                return; // 避免继续处理移动逻辑
            case 'l':
            case 'L':
                // 第三个技能
                this.useSkill(2);
                return; // 避免继续处理移动逻辑
            case ';':
                // 最后一个技能
                this.useSkill(3);
                return; // 避免继续处理移动逻辑
        }
        
        // 处理移动逻辑
        if (!this.battle3D || !this.battle3D.player) return;
        
        const moveSpeed = 0.1;
        
        switch (e.key) {
            case 'w':
            case 'W':
                this.battle3D.player.position.z -= moveSpeed;
                break;
            case 's':
            case 'S':
                this.battle3D.player.position.z += moveSpeed;
                break;
            case 'a':
            case 'A':
                this.battle3D.player.position.x += moveSpeed;
                break;
            case 'd':
            case 'D':
                this.battle3D.player.position.x -= moveSpeed;
                break;
        }
        
        // 限制人物移动范围，防止走出场景
        this.battle3D.player.position.x = Math.max(-8, Math.min(8, this.battle3D.player.position.x));
        this.battle3D.player.position.z = Math.max(-8, Math.min(8, this.battle3D.player.position.z));
        
        // 检查玩家与预生成敌人的碰撞
        this.checkEnemyCollision();
    }
    
    // 处理鼠标点击事件，实现鼠标引导人物移动
    handleMouseClick(event, container) {
        if (!this.battle3D || !this.battle3D.player || !this.battle3D.camera || !this.battle3D.scene) return;
        
        try {
            // 获取容器中鼠标的相对位置
            const rect = container.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // 使用Babylon.js的picking方法获取射线
            const pickInfo = this.battle3D.scene.pick(x, y);
            if (!pickInfo || !pickInfo.ray) return;
            
            const ray = pickInfo.ray;
            
            // 计算射线与y=1.5平面的交点（人物所在高度）
            // 射线：point + t*direction
            // 平面：y = 1.5
            // 解：origin.y + t*direction.y = 1.5 => t = (1.5 - origin.y) / direction.y

            if (Math.abs(ray.direction.y) > 0.0001) { // 确保射线不平行于平面
                const t = (1.5 - ray.origin.y) / ray.direction.y;

                if (t > 0) { // 确保交点在射线前方
                    const intersectionPoint = new BABYLON.Vector3(
                        ray.origin.x + t * ray.direction.x,
                        1.5, // 保持人物的高度
                        ray.origin.z + t * ray.direction.z
                    );

                    // 设置目标位置，只使用x和z坐标
                    this.mouseTarget = {
                        x: intersectionPoint.x,
                        z: intersectionPoint.z
                    };

                    // 限制目标位置在场景范围内
                    this.mouseTarget.x = Math.max(-8, Math.min(8, this.mouseTarget.x));
                    this.mouseTarget.z = Math.max(-8, Math.min(8, this.mouseTarget.z));

                    this.isMoving = true;
                }
            }
        } catch (error) {
            console.error('处理鼠标点击时出错:', error);
        }
    }
    
    // checkEnemyCollision moved to mapLogic.js
    
    
    // saveMapState moved to mapLogic.js
    
    // 创建单独的3D战斗场景
    createBattleScene(enemyInfo) {
        
        // 播放战斗音乐
        this.playSound('battle-music');
        

        
        // 显示战斗模态窗口
        const battleModal = document.getElementById('battle-modal');
        if (battleModal) {
            battleModal.classList.remove('hidden');
        }
        
        // 清理当前场景
        if (this.battle3D) {
            // 停止并清理旧引擎
            if (this.battle3D.engine) {
                try {
                    this.battle3D.engine.dispose();
                } catch (e) {
                    console.log('清理旧引擎时出错:', e);
                }
            }
        }
        
        // 使用战斗模态中的容器而不是主页面中的容器
        const container = document.getElementById('battle-modal-3d-container');
        if (!container) {
            console.error('找不到battle-modal-3d-container元素');
            return;
        }
        
        // 清空容器
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        // 创建canvas元素用于Babylon.js渲染
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        
        // 设置canvas的实际宽高属性（WebGL必需）
        const containerRect = container.getBoundingClientRect();
        canvas.width = Math.max(containerRect.width || 1024, 1);
        canvas.height = Math.max(containerRect.height || 600, 1);
        
        container.appendChild(canvas);
        
        // 创建引擎，传递canvas而不是div
        const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        
        // 创建场景
        const scene = new BABYLON.Scene(engine);
        
        // 设置背景颜色（深灰色背景，便于显示各种颜色的特效）
        scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.05, 1);
        
        // 创建相机
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(container, true);
        
        // 设置相机位置和目标
        camera.setPosition(new BABYLON.Vector3(0, 4, 10));
        camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        
        // 添加火山氛围灯光
        const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
        ambientLight.intensity = 1;
        ambientLight.diffuse = new BABYLON.Color3(0.25, 0.125, 0.125);
        
        const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(5, 5, 3), scene);
        directionalLight.intensity = 1.5;
        directionalLight.diffuse = new BABYLON.Color3(1, 0.667, 0.4);
        
        // 添加火山特效光源
        const pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 2, 0), scene);
        pointLight.intensity = 1.5;
        pointLight.diffuse = new BABYLON.Color3(1, 0.25, 0);
        
        // 添加火山陆地
        const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 15, height: 15 }, scene);
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.75, 0.85, 0.95); // 冷色调地面
        groundMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 0.7);
        groundMaterial.shininess = 30;
        ground.material = groundMaterial;
        ground.position.y = -1;
        
        // 添加火山陆地边缘
        const edge = BABYLON.MeshBuilder.CreateTorus("edge", { diameter: 15, thickness: 0.5, tessellation: 32 }, scene);
        edge.rotation.x = Math.PI / 2;
        edge.position.y = -0.99;
        const edgeMaterial = new BABYLON.StandardMaterial("edgeMaterial", scene);
        edgeMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.2, 0.2);
        edgeMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        edgeMaterial.shininess = 100;
        edge.material = edgeMaterial;
        
        // 存储场景信息
        this.battle3D = {
            engine: engine,
            scene: scene,
            camera: camera,
            player: null,
            enemy: null,
            playerHealthBar: null,
            enemyHealthBar: null,
            playerEnergyBar: null,
            enemyEnergyBar: null,
            isAttacking: false,
            playerDefeated: false,
            enemyDefeated: false,
            // 战斗特效
            battleEffects: [],
            fireEffects: [],
            // 将模型/UI原始父元素存储用于还原
            _originalSkillsParent: null,
            _originalSkillsNext: null,
            _originalAttackConfirmParent: null,
            _originalAttackConfirmNext: null
        };
        
        // 重置鼠标移动状态，确保在战斗场景中禁用鼠标移动
        this.mouseTarget = null;
        this.isMoving = false;
        
        // 添加周围喷火效果
        this.createFireEffects();
        
        // 添加火山烟雾效果
        this.createVolcanoSmoke();
        
        // 创建玩家模型并随机放置在左侧（增加距离）
        this.createPlayerModel();
        if (this.battle3D.player) {
            this.battle3D.player.position.x = -(4 + Math.random() * 3);
            this.battle3D.player.position.z = (Math.random() - 0.5) * 2; // 扩大前后扰动范围
        }
        
        // 创建敌人模型并随机放置在右侧（增加距离）
        this.createEnemyModel();
        if (this.battle3D.enemy) {
            this.battle3D.enemy.position.x = 4 + Math.random() * 3;
            this.battle3D.enemy.position.z = (Math.random() - 0.5) * 2;
        }
        
        // 调整摄像机目标到两者中点
        if (this.battle3D.camera && this.battle3D.player && this.battle3D.enemy) {
            const mid = this.battle3D.player.position.add(this.battle3D.enemy.position).scale(0.5);
            this.battle3D.camera.setTarget(mid);
        }
        
        // 创建血条（模型定位后）
        this.createHealthBars();
        
        // 开始渲染循环
        engine.runRenderLoop(() => {
            this.animateBattle3D();
            scene.render();
        });
        
        // 执行淡入效果
        this.fadeInBattleScene();
        
        // 响应窗口大小变化
        window.addEventListener('resize', () => {
            if (this.battle3D && this.battle3D.engine) {
                this.battle3D.engine.resize();
            }
        });
    }
    
    // 淡入战斗场景
    fadeInBattleScene() {
        if (!this.battle3D) return;
        
        const container = document.getElementById('battle-modal-3d-container');
        if (!container || !container.firstChild) return;
        
        const rendererElement = container.firstChild;
        
        // 确保rendererElement是一个有效的DOM元素
        if (!rendererElement || !rendererElement.style) return;
        
        let opacity = 0;
        const fadeDuration = 1000; // 淡入持续时间（毫秒）
        const startTime = Date.now();
        
        const fadeIn = () => {
            const elapsed = Date.now() - startTime;
            opacity = Math.min(elapsed / fadeDuration, 1);
            
            if (rendererElement && rendererElement.style) {
                rendererElement.style.opacity = opacity.toString();
            }
            
            if (opacity < 1) {
                requestAnimationFrame(fadeIn);
            }
        };
        
        fadeIn();
    }
    
    // 保存当前UI布局状态
    saveUILayout() {
        // 保存UI元素的显示状态（不保存人物属性卡片，因为它始终显示）
        this.uiState = {
            resourceGrid: document.querySelector('[class*="grid-cols-3"]') ? document.querySelector('[class*="grid-cols-3"]').style.display : 'grid',
            afkSection: document.querySelector('[class*="grid-cols-3"]') ? document.querySelector('[class*="grid-cols-3"]').style.display : 'grid'
        };
    }
    
    // 切换到战斗UI布局
    switchToBattleUILayout() {
        // 保留人物属性卡片显示
        // 隐藏资源栏和挂机区域
        const resourceBars = document.querySelector('[class*="grid-cols-3"]');
        if (resourceBars) {
            resourceBars.style.display = 'none';
        }
        
        // 调整3D战斗场景容器大小
        const battle3DContainer = document.getElementById('map-3d-container');
        if (battle3DContainer) {
            battle3DContainer.style.height = '600px';
            battle3DContainer.style.width = '100%';
        }
    }
    
    // 创建喷火效果
    createFireEffects() {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        // 在四个角落创建喷火效果
        const firePositions = [
            [-8, 0, -8],  // 左下角
            [8, 0, -8],   // 右下角
            [-8, 0, 8],   // 左上角
            [8, 0, 8]     // 右上角
        ];
        
        this.battle3D.fireEffects = [];
        
        firePositions.forEach(position => {
            // 创建火焰粒子系统
            const fireSystem = new BABYLON.ParticleSystem("fireSystem", 30, this.battle3D.scene);
            
            // 设置粒子纹理（使用默认纹理）
            fireSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.battle3D.scene);
            
            // 设置粒子发射位置
            fireSystem.emitter = new BABYLON.Vector3(position[0], position[1], position[2]);
            fireSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
            fireSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 1);
            
            // 设置粒子颜色
            fireSystem.color1 = new BABYLON.Color4(1, 1, 0, 0.8); // 黄色
            fireSystem.color2 = new BABYLON.Color4(1, 0, 0, 0.8); // 红色
            fireSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
            
            // 设置粒子大小
            fireSystem.minSize = 0.2;
            fireSystem.maxSize = 0.4;
            
            // 设置粒子生命周期
            fireSystem.minLifeTime = 1;
            fireSystem.maxLifeTime = 2;
            
            // 设置粒子速度
            fireSystem.minSpeed = 1;
            fireSystem.maxSpeed = 3;
            
            // 设置粒子方向
            fireSystem.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
            fireSystem.direction2 = new BABYLON.Vector3(0.5, 2, 0.5);
            
            // 设置粒子旋转
            fireSystem.minRotation = 0;
            fireSystem.maxRotation = Math.PI * 2;
            
            // 设置发射率
            fireSystem.emitRate = 15;
            
            // 启动粒子系统
            fireSystem.start();
            
            // 存储火焰系统和基础位置
            this.battle3D.fireEffects.push({
                system: fireSystem,
                basePosition: position
            });
        });
    }
    
    // 创建火山烟雾效果
    createVolcanoSmoke() {
        if (!this.battle3D || !this.battle3D.scene) return;
        
        this.battle3D.battleEffects = [];
        
        // 创建烟雾粒子系统
        const smokeSystem = new BABYLON.ParticleSystem("smokeSystem", 40, this.battle3D.scene);
        
        // 设置粒子纹理（使用默认纹理）
        smokeSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.battle3D.scene);
        
        // 设置粒子发射位置
        smokeSystem.emitter = new BABYLON.Vector3(0, 0, 0);
        smokeSystem.minEmitBox = new BABYLON.Vector3(-7.5, 0, -7.5);
        smokeSystem.maxEmitBox = new BABYLON.Vector3(7.5, 0, 7.5);
        
        // 设置粒子颜色
        smokeSystem.color1 = new BABYLON.Color4(0.6, 0.6, 0.6, 0.4);
        smokeSystem.color2 = new BABYLON.Color4(0.8, 0.8, 0.8, 0.4);
        smokeSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        // 设置粒子大小
        smokeSystem.minSize = 0.4;
        smokeSystem.maxSize = 0.8;
        
        // 设置粒子生命周期
        smokeSystem.minLifeTime = 2;
        smokeSystem.maxLifeTime = 4;
        
        // 设置粒子速度
        smokeSystem.minSpeed = 0.5;
        smokeSystem.maxSpeed = 1.5;
        
        // 设置粒子方向
        smokeSystem.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
        smokeSystem.direction2 = new BABYLON.Vector3(0.5, 2, 0.5);
        
        // 设置发射率
        smokeSystem.emitRate = 10;
        
        // 启动粒子系统
        smokeSystem.start();
        
        this.battle3D.battleEffects.push(smokeSystem);
    }
    
    // 恢复地图场景
    restoreMapScene() {
        // 清理前一个战斗场景（如果存在）以避免额外的3D画面和引擎泄漏
        if (this.battle3D && this.battle3D.engine) {
            try {
                this.battle3D.engine.dispose();
            } catch (e) {
                console.log('restoreMapScene 清理旧引擎失败:', e);
            }
        }
        this.battle3D = null;
        
        // 设置战斗状态为false
        this.gameState.battle.inBattle = false;
        
        // 恢复保存的敌人分布
        if (this.mapState && this.mapState.sceneMonsters) {
            
            // 检查当前敌人是否被击败
            const enemyDefeated = this.gameState.enemy && this.gameState.enemy.hp <= 0;
            
            if (enemyDefeated) {
                // 如果敌人被击败，从保存的场景怪物中移除该敌人
                const currentEnemyCellIndex = this.gameState.enemy.cellIndex;
                if (currentEnemyCellIndex !== undefined) {
                    this.mapState.sceneMonsters = this.mapState.sceneMonsters.filter(monster => 
                        monster.cellIndex !== currentEnemyCellIndex
                    );
                }
            }
            
            // 恢复场景怪物状态
            this.gameState.sceneMonsters = JSON.parse(JSON.stringify(this.mapState.sceneMonsters));
            
            // 只有当所有敌人都被击败时才重新生成新的敌人分布
            if (this.gameState.sceneMonsters.length === 0) {
                this.generateMiniMap();
            } else {
                // 重新渲染小地图
                this.renderMiniMap();
            }
        } else {
            // 如果没有保存的状态，重新生成小地图
            this.generateMiniMap();
        }
        
        // 重新初始化地图场景
        this.initMap3DScene();
        
        // 隐藏敌人信息区
        this.hideEnemyInfo();
        
        // 恢复玩家位置
        if (this.mapState && this.mapState.playerPosition && this.battle3D && this.battle3D.player) {
            this.battle3D.player.position.copyFrom(this.mapState.playerPosition);
        }
    }
    
    // createEnemyIcon moved to mapLogic.js
    
    // renderMiniMap moved to mapLogic.js
    
    
    // 攻击敌人
    attackEnemy() {
        // 只有在战斗模式中才能使用普通攻击
        if (!this.gameState.battle.inBattle) {
            this.addBattleLog('只有在战斗模式中才能使用普通攻击！');
            return;
        }
        
        // 确保战斗场景已初始化
        if (!this.battle3D || !this.battle3D.player || !this.battle3D.enemy) {
            this.addBattleLog('战斗场景未初始化！');
            return;
        }
        
        // 播放攻击声音
        this.playSound('attack-sound',1, 200);
        
        // 播放3D攻击动画
        this.playAttackAnimation();
        
        // 计算装备效果
        this.calculateEquipmentEffects();
        
        // 计算最终属性（基础属性 + 装备效果）
        const finalAttack = this.gameState.player.attack + this.gameState.player.equipmentEffects.attack;
        const finalDefense = this.gameState.player.defense + this.gameState.player.equipmentEffects.defense;
        
        // 计算伤害
        const playerDamage = Math.max(1, finalAttack - this.gameState.enemy.defense);
        const enemyDamage = Math.max(1, this.gameState.enemy.attack - finalDefense);
        
        // 敌人受到伤害
        this.gameState.enemy.hp -= playerDamage;
        // 确保敌人血量不会小于0
        if (this.gameState.enemy.hp < 0) {
            this.gameState.enemy.hp = 0;
        }
        this.addBattleLog(`你对${this.gameState.enemy.name}造成了${playerDamage}点伤害！`);
        
        // 显示伤害数字（与技能一致，传入 gameState 中的目标和颜色字符串）
        this.showDamage(this.gameState.enemy, playerDamage, 'red');

        // 显示攻击特效（普通攻击使用绿色）
        this.createAttackEffect(-1);
        
        // 普通攻击恢复能量
        const energyRecovery = 5;
        this.gameState.player.energy = Math.min(this.gameState.player.energy + energyRecovery, this.gameState.player.maxEnergy);
        this.addBattleLog(`普通攻击恢复了${energyRecovery}点能量！`);
        
        // 显示能量恢复提示（延迟300ms，在伤害提示之后）
        setTimeout(() => {
            this.showEnergyChange(this.gameState.player, energyRecovery);
        }, 300);
        
        // 检查敌人是否死亡
        if (this.gameState.enemy.hp <= 0) {
            this.enemyDefeated();
        } else {
            // 敌人反击
            let finalEnemyDamage = enemyDamage;
            
            // 检查防御状态（防御技能效果持续）
            if (this.gameState.player.defenseActive) {
                finalEnemyDamage = Math.max(1, Math.floor(finalEnemyDamage * 0.5));
                if (this.gameState.enemy.isBoss && this.gameState.enemy.energy >= 50) {
                    // BOSS技能释放逻辑
                    const skillDamage = Math.floor(enemyDamage * 1.5);
                    finalEnemyDamage = Math.max(1, Math.floor((enemyDamage + skillDamage) * 0.5));
                    
                    // 消耗能量
                    this.gameState.enemy.energy -= 50;
                    
                    // 添加技能释放日志（带防御减免）
                    this.addBattleLog(`${this.gameState.enemy.name}释放了技能，对你造成了${finalEnemyDamage}点伤害！（防御减免50%）`);
                } else {
                    // 普通攻击（带防御减免）
                    this.addBattleLog(`${this.gameState.enemy.name}对你造成了${finalEnemyDamage}点伤害！（防御减免50%）`);
                }
                // 清除防御状态和特效
                this.gameState.player.defenseActive = false;
                this.removeDefenseEffect();
            } else {
                // BOSS技能释放逻辑
                if (this.gameState.enemy.isBoss && this.gameState.enemy.energy >= 50) {
                    // BOSS释放技能，造成额外伤害
                    const skillDamage = Math.floor(enemyDamage * 1.5);
                    finalEnemyDamage = enemyDamage + skillDamage;
                    
                    // 消耗能量
                    this.gameState.enemy.energy -= 50;
                    
                    // 添加技能释放日志
                    this.addBattleLog(`${this.gameState.enemy.name}释放了技能，对你造成了${finalEnemyDamage}点伤害！`);
                } else {
                    // 普通攻击
                    this.addBattleLog(`${this.gameState.enemy.name}对你造成了${finalEnemyDamage}点伤害！`);
                }
            }
            
            // 玩家受到伤害
            this.gameState.player.hp -= finalEnemyDamage;
            // 确保玩家血量不会小于0
            if (this.gameState.player.hp < 0) {
                this.gameState.player.hp = 0;
            }
            
            // BOSS能量恢复
            if (this.gameState.enemy.isBoss) {
                this.gameState.enemy.energy = Math.min(this.gameState.enemy.energy + 20, this.gameState.enemy.maxEnergy);
            }
            
            // 检查玩家是否死亡
            if (this.gameState.player.hp <= 0) {
                this.playerDefeated();
            }

            // 显示玩家受到的伤害数字（与技能显示一致）
            this.showDamage(this.gameState.player, finalEnemyDamage, 'red');
        }
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        this.updateHealthBars();
    }
    
    // 显示攻击确认窗口（修改为更新敌人信息区）
    showAttackConfirmation(enemyInfo) {
        // 更新游戏状态中的敌人信息
        this.gameState.enemy = enemyInfo;
        // 设置战斗状态
        this.gameState.battle.inBattle = true;
        
        // 直接更新敌人信息区域的UI元素
        const enemyNameElement = document.getElementById('enemy-name');
        if (enemyNameElement) {
            enemyNameElement.textContent = enemyInfo.name || '';
        }
        const enemyLevelElement = document.getElementById('enemy-level');
        if (enemyLevelElement) {
            enemyLevelElement.textContent = enemyInfo.level || '';
        }
        const enemyHpElement = document.getElementById('enemy-hp');
        if (enemyHpElement) {
            enemyHpElement.textContent = enemyInfo.hp || '';
        }
        const enemyMaxHpElement = document.getElementById('enemy-max-hp');
        if (enemyMaxHpElement) {
            enemyMaxHpElement.textContent = enemyInfo.maxHp || '';
        }
        const enemyAttackElement = document.getElementById('enemy-attack');
        if (enemyAttackElement) {
            enemyAttackElement.textContent = enemyInfo.attack || '';
        }
        
        // 更新敌人图标
        const enemyIconElement = document.querySelector('#enemy-icon i');
        if (enemyIconElement) {
            // 计算敌人和玩家的战斗力
            const enemyPower = enemyInfo.attack * 2 + (enemyInfo.defense || 0) * 1.5 + enemyInfo.maxHp * 0.1;
            const playerAttack = this.gameState.player.attack + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.attack : 0);
            const playerDefense = this.gameState.player.defense + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.defense : 0);
            const playerHp = this.gameState.player.maxHp + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.hp : 0);
            const playerPower = playerAttack * 2 + playerDefense * 1.5 + playerHp * 0.1;
            
            // 根据战斗力对比确定敌人颜色
            let enemyColorClass = 'text-danger'; // 默认红色
            if (enemyInfo.isBoss) {
                enemyColorClass = 'text-purple-500'; // BOSS显示紫色
            } else if (enemyInfo.isElite) {
                enemyColorClass = 'text-yellow-500'; // 精英怪显示黄色
            } else {
                const powerRatio = enemyPower / playerPower;
                if (powerRatio < 0.7) {
                    enemyColorClass = 'text-green-500'; // 比玩家弱显示绿色
                } else if (powerRatio < 1.3) {
                    enemyColorClass = 'text-yellow-500'; // 和玩家差不多显示黄色
                } else {
                    enemyColorClass = 'text-red-500'; // 比玩家厉害显示红色
                }
            }
            enemyIconElement.className = `fa ${enemyInfo.icon || 'fa-skull'} text-xl ${enemyColorClass}`;
        }
        
        // 更新精英标识
        const eliteBadge = document.getElementById('enemy-elite-badge');
        const enemyInfoElement = document.getElementById('enemy-info');
        if (eliteBadge && enemyInfoElement) {
            if (enemyInfo.isElite) {
                eliteBadge.classList.remove('hidden');
                eliteBadge.textContent = '精英';
                eliteBadge.className = 'ml-2 text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold';
                // 为精英怪添加特殊样式
                enemyInfoElement.classList.add('border-yellow-500');
                enemyInfoElement.classList.add('bg-yellow-900/20');
                enemyInfoElement.classList.remove('border-purple-500');
                enemyInfoElement.classList.remove('bg-purple-900/20');
            } else if (enemyInfo.isBoss) {
                eliteBadge.classList.remove('hidden');
                eliteBadge.textContent = 'BOSS';
                eliteBadge.className = 'ml-2 text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded font-bold';
                // 为BOSS添加特殊样式
                enemyInfoElement.classList.add('border-purple-500');
                enemyInfoElement.classList.add('bg-purple-900/20');
                enemyInfoElement.classList.remove('border-yellow-500');
                enemyInfoElement.classList.remove('bg-yellow-900/20');
            } else {
                eliteBadge.classList.add('hidden');
                // 移除精英怪和BOSS特殊样式
                enemyInfoElement.classList.remove('border-yellow-500');
                enemyInfoElement.classList.remove('bg-yellow-900/20');
                enemyInfoElement.classList.remove('border-purple-500');
                enemyInfoElement.classList.remove('bg-purple-900/20');
            }
        }
        
        // 更新敌人装备掉率信息
        const enemyDropRatesElement = document.getElementById('enemy-drop-rates');
        if (enemyDropRatesElement) {
            // 基础掉率
            let dropRates = {
                white: 0.4,
                blue: 0.3,
                purple: 0.15,
                gold: 0.1,
                legendary: 0.05
            };
            
            // 根据怪物类型调整掉率
            if (enemyInfo.isBoss) {
                // BOSS掉率调整
                dropRates = {
                    white: 0.2,
                    blue: 0.3,
                    purple: 0.25,
                    gold: 0.2,
                    legendary: 0.05
                };
            } else if (enemyInfo.isElite) {
                // 精英怪掉率调整
                dropRates = {
                    white: 0.3,
                    blue: 0.35,
                    purple: 0.2,
                    gold: 0.1,
                    legendary: 0.05
                };
            }
            
            // 考虑幸运值影响（每点幸运值提高0.5%的高品质装备掉率）
            const luck = this.gameState.player.luck || 0;
            const luckBonus = luck * 0.005;
            
            // 调整掉率，提高高品质装备的概率
            const adjustedRates = {
                white: Math.max(0, dropRates.white - luckBonus * 2),
                blue: Math.max(0, dropRates.blue - luckBonus),
                purple: Math.max(0, dropRates.purple + luckBonus * 0.5),
                gold: Math.max(0, dropRates.gold + luckBonus * 1),
                legendary: Math.max(0, dropRates.legendary + luckBonus * 1.5)
            };
            
            // 归一化概率
            const totalProbability = Object.values(adjustedRates).reduce((sum, rate) => sum + rate, 0);
            const normalizedRates = {};
            for (const [rarity, rate] of Object.entries(adjustedRates)) {
                normalizedRates[rarity] = rate / totalProbability;
            }
            
            // 生成掉率显示元素
            enemyDropRatesElement.innerHTML = '';
            
            // 品质颜色映射
            const rarityColors = {
                white: 'bg-white/10',
                blue: 'bg-blue-500/20',
                purple: 'bg-purple-500/20',
                gold: 'bg-yellow-500/20',
                legendary: 'bg-red-500/20'
            };
            
            // 品质名称映射
            const rarityNames = {
                white: '白色',
                blue: '蓝色',
                purple: '紫色',
                gold: '金色',
                legendary: '传说'
            };
            
            // 添加掉率信息
            for (const [rarity, rate] of Object.entries(normalizedRates)) {
                const ratePercent = Math.round(rate * 100);
                if (ratePercent > 0) {
                    const rateElement = document.createElement('span');
                    rateElement.className = `text-xs ${rarityColors[rarity]} px-1.5 py-0.5 rounded`;
                    rateElement.textContent = `${rarityNames[rarity]}: ${ratePercent}%`;
                    enemyDropRatesElement.appendChild(rateElement);
                }
            }
        }
        
        // 显示攻击确认按钮，隐藏技能按钮
        const attackConfirmBtn = document.getElementById('attack-confirm-btn');
        const attackSkills = document.getElementById('attack-skills');
        if (attackConfirmBtn) {
            // 强制移除hidden类，确保按钮显示
            attackConfirmBtn.classList.remove('hidden');
        }
        if (attackSkills) {
            attackSkills.classList.add('hidden');
        }
    }
    
    // 显示敌人操作按钮
    showEnemyActionButtons() {
        // 检查是否已有按钮容器
        let buttonContainer = document.getElementById('enemy-action-buttons');
        if (!buttonContainer) {
            // 创建按钮容器
            buttonContainer = document.createElement('div');
            buttonContainer.id = 'enemy-action-buttons';
            buttonContainer.className = 'mt-3 pt-3 border-t border-dark/50 flex justify-between';
            
            // 创建攻击按钮
            const attackButton = document.createElement('button');
            attackButton.id = 'enemy-attack-btn';
            attackButton.className = 'flex-1 bg-accent hover:bg-accent/80 text-white py-2 px-4 rounded transition-colors';
            attackButton.textContent = '攻击';
            attackButton.addEventListener('click', () => {
                // 遭遇敌人
                this.encounterEnemy(this.gameState.enemy);
            });
            
            // 创建取消按钮
            const cancelButton = document.createElement('button');
            cancelButton.id = 'enemy-cancel-btn';
            cancelButton.className = 'flex-1 bg-dark/50 hover:bg-dark/70 text-white py-2 px-4 rounded border border-dark/70 transition-colors';
            cancelButton.textContent = '取消';
            cancelButton.addEventListener('click', () => {
                // 隐藏敌人信息区
                this.hideEnemyInfo();
            });
            
            // 添加按钮到容器
            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(attackButton);
            
            // 添加到敌人信息区
            const enemyInfoElement = document.getElementById('enemy-info');
            if (enemyInfoElement) {
                enemyInfoElement.appendChild(buttonContainer);
            }
        } else {
            // 显示已有的按钮容器
            buttonContainer.classList.remove('hidden');
        }
    }
    
    // 清空敌人信息区
    hideEnemyInfo() {
        // 清空敌人信息
        const enemyNameElement = document.getElementById('enemy-name');
        if (enemyNameElement) {
            enemyNameElement.textContent = '';
        }
        const enemyLevelElement = document.getElementById('enemy-level');
        if (enemyLevelElement) {
            enemyLevelElement.textContent = '';
        }
        const enemyHpElement = document.getElementById('enemy-hp');
        if (enemyHpElement) {
            enemyHpElement.textContent = '';
        }
        const enemyMaxHpElement = document.getElementById('enemy-max-hp');
        if (enemyMaxHpElement) {
            enemyMaxHpElement.textContent = '';
        }
        const enemyAttackElement = document.getElementById('enemy-attack');
        if (enemyAttackElement) {
            enemyAttackElement.textContent = '';
        }
        
        // 清空敌人图标
        const enemyIconElement = document.querySelector('#enemy-icon i');
        if (enemyIconElement) {
            enemyIconElement.className = 'fa fa-question text-xl text-gray-500';
        }
        
        // 隐藏精英标识
        const eliteBadge = document.getElementById('enemy-elite-badge');
        if (eliteBadge) {
            eliteBadge.classList.add('hidden');
        }
        
        // 清空掉率信息
        const enemyDropRatesElement = document.getElementById('enemy-drop-rates');
        if (enemyDropRatesElement) {
            enemyDropRatesElement.innerHTML = '';
        }
        
        // 隐藏攻击确认按钮和技能按钮
        const attackConfirmBtn = document.getElementById('attack-confirm-btn');
        const attackSkills = document.getElementById('attack-skills');
        if (attackConfirmBtn) {
            attackConfirmBtn.classList.add('hidden');
        }
        if (attackSkills) {
            attackSkills.classList.add('hidden');
        }
        
        // 隐藏敌人操作按钮
        const buttonContainer = document.getElementById('enemy-action-buttons');
        if (buttonContainer) {
            buttonContainer.classList.add('hidden');
        }
    }

    // 关闭战斗模态窗口
    closeBattleModal() {
        const battleModal = document.getElementById('battle-modal');
        if (battleModal) {
            battleModal.classList.add('hidden');
        }
        
        // 停止战斗音乐
        this.stopBattleMusic();
        
        // 清理3D场景
        if (this.battle3D && this.battle3D.engine) {
            try {
                this.battle3D.engine.dispose();
            } catch (e) {
                console.log('清理战斗场景引擎时出错:', e);
            }
        }
        
        // 清理容器
        const container = document.getElementById('battle-modal-3d-container');
        if (container) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
        
        // 不在此处重新初始化地图，让调用者决定何时恢复地图
        if (this.gameState.battle) {
            this.gameState.battle.inBattle = false;
        }
        
        this.battle3D = null;

        this.restoreMapScene();
    }
    
    // 敌人被击败
    enemyDefeated() {
        // 显示敌人倒地的画面
        this.showEnemyDefeatedAnimation();
        
        // 设置敌人被击败状态
        if (this.battle3D) {
            this.battle3D.enemyDefeated = true;
        }
        
        // 播放胜利声音
        this.playSound('victory-sound', 1, 1000);
        
        // 获得经验（根据敌人类型和精英状态）
        const expMultiplier = this.gameState.enemy.expMultiplier || 1;
        const expGained = Math.floor(this.gameState.enemy.level * 20 * expMultiplier);
        this.gameState.player.exp += expGained;
        
        // 精英怪额外提示
        if (this.gameState.enemy.isElite) {
            this.addBattleLog(`你击败了${this.gameState.enemy.name}！`);
            this.addBattleLog(`精英敌人奖励翻倍！获得了${expGained}点经验！`);
        } else {
            this.addBattleLog(`你击败了${this.gameState.enemy.name}，获得了${expGained}点经验！`);
        }
        
        // 获得资源（根据敌人类型和精英状态）
        const resourceMultiplier = this.gameState.enemy.resourceMultiplier || 1;
        const woodGained = Math.floor((this.gameState.enemy.level * 5 + Math.random() * 5) * resourceMultiplier);
        const ironGained = Math.floor((this.gameState.enemy.level * 2 + Math.random() * 3) * resourceMultiplier);
        const crystalGained = Math.floor((this.gameState.enemy.level * 1 + Math.random() * 2) * resourceMultiplier);
        
        this.gameState.resources.wood += woodGained;
        this.gameState.resources.iron += ironGained;
        this.gameState.resources.crystal += crystalGained;
        
        this.addBattleLog(`获得了${woodGained}木材，${ironGained}铁矿，${crystalGained}水晶！`);
        
        // 杀死敌人恢复能量
        const killEnergyRecovery = 15;
        this.gameState.player.energy = Math.min(this.gameState.player.energy + killEnergyRecovery, this.gameState.player.maxEnergy);
        this.addBattleLog(`杀死敌人恢复了${killEnergyRecovery}点能量！`);
        
        // 装备掉落
        const droppedEquipment = this.generateEquipmentDrop();
        if (droppedEquipment) {
            // 检查并自动穿戴更好的装备
            const equipped = this.checkAndEquipBetterGear(droppedEquipment);
            if (!equipped) {
                // 将装备添加到背包
                this.gameState.player.inventory.push(droppedEquipment);
                this.addBattleLog(`获得了${droppedEquipment.rarityDisplayName} ${droppedEquipment.name}，已放入背包！`);
            } else {
                this.addBattleLog(`获得了${droppedEquipment.rarityDisplayName} ${droppedEquipment.name}，属性更好，已自动装备！`);
            }
        } else {
            // 添加掉落失败的日志，方便调试
            this.addBattleLog(`敌人没有掉落装备。`);
        }
        
        // 检查是否升级
        this.checkLevelUp();
        
        // 不刷新敌人，保持当前敌人状态
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        this.updateHealthBars();
        
        // 战斗结束，延迟后关闭战斗模态窗口并返回主界面
        setTimeout(() => {
            this.closeBattleModal();
        }, 3000);
    }
    
    // 显示敌人被击败的动画（倒地效果）
    showEnemyDefeatedAnimation() {
        if (!this.battle3D || !this.battle3D.enemy) return;
        
        const enemy = this.battle3D.enemy;
        
        // 敌人倒地动画
        let animationProgress = 0;
        const animationDuration = 1000; // 动画持续时间（毫秒）
        const startTime = Date.now();
        const originalPosition = enemy.position.clone();
        const originalRotation = enemy.rotation.clone();
        
        const defeatAnimation = () => {
            const elapsed = Date.now() - startTime;
            animationProgress = Math.min(elapsed / animationDuration, 1);
            
            // 敌人逐渐倒下
            const fallProgress = animationProgress;
            
            // 位置：逐渐降低
            enemy.position.y = originalPosition.y - fallProgress * 1.5;
            
            // 旋转：逐渐向前倒下
            enemy.rotation.z = originalRotation.z + fallProgress * Math.PI / 2;
            
            if (animationProgress < 1) {
                requestAnimationFrame(defeatAnimation);
            }
        };
        
        defeatAnimation();
    }
    
    // 显示玩家被击败的动画（倒地效果）
    showPlayerDefeatedAnimation() {
        if (!this.battle3D || !this.battle3D.player) return;
        
        const player = this.battle3D.player;
        
        // 玩家倒地动画
        let animationProgress = 0;
        const animationDuration = 1000; // 动画持续时间（毫秒）
        const startTime = Date.now();
        const originalPosition = player.position.clone();
        const originalRotation = player.rotation.clone();
        
        const defeatAnimation = () => {
            const elapsed = Date.now() - startTime;
            animationProgress = Math.min(elapsed / animationDuration, 1);
            
            // 玩家逐渐倒下
            const fallProgress = animationProgress;
            
            // 位置：逐渐降低
            player.position.y = originalPosition.y - fallProgress * 1.5;
            
            // 旋转：逐渐向前倒下
            player.rotation.z = originalRotation.z + fallProgress * Math.PI / 2;
            
            if (animationProgress < 1) {
                requestAnimationFrame(defeatAnimation);
            }
        };
        
        defeatAnimation();
    }
    
    // 使用特殊技
    useSkill(skillIndex) {
        // 只有在战斗模式中才能使用技能
        if (!this.gameState.battle.inBattle) {
            this.addBattleLog('只有在战斗模式中才能使用技能！');
            return;
        }
        
        const skill = this.gameState.player.skills[skillIndex];
        if (!skill) {
            this.addBattleLog('无效的技能！');
            return;
        }
        
        // 检查等级是否满足需求
        if (this.gameState.player.level < skill.levelRequired) {
            this.addBattleLog(`等级不足，需要${skill.levelRequired}级才能使用${skill.name}！`);
            return;
        }
        
        // 检查能量是否足够
        if (this.gameState.player.energy < skill.energyCost) {
            this.addBattleLog(`能量不足，需要${skill.energyCost}点能量！`);
            return;
        }
        
        // 播放技能释放声音（根据技能索引播放不同的声音）
        this.playSound(`skill-${skillIndex}-sound`, 1, 200);
        
        // 根据技能类型播放不同的动画和特效
        if (skill.defenseBonus) {
            // 防御技能
            this.playDefenseAnimation();
            this.createDefenseEffect();
        } else {
            // 攻击技能
            this.playAttackAnimation();
            this.createAttackEffect(skillIndex);
        }
        
        // 延迟执行技能效果，让动画有时间播放
        setTimeout(() => {
            // 消耗能量
            this.gameState.player.energy -= skill.energyCost;
            
            // 显示能量消耗提示（延迟300ms，在伤害提示之后）
            setTimeout(() => {
                this.showEnergyChange(this.gameState.player, -skill.energyCost);
            }, 300);
            
            // 计算装备效果
            this.calculateEquipmentEffects();
            
            // 计算最终属性（基础属性 + 装备效果）
            const finalAttack = this.gameState.player.attack + this.gameState.player.equipmentEffects.attack;
            const finalDefense = this.gameState.player.defense + this.gameState.player.equipmentEffects.defense;
            
            // 根据技能类型执行不同效果
            if (skill.damageMultiplier) {
                // 强力攻击
                const playerDamage = Math.max(1, Math.floor(finalAttack * skill.damageMultiplier) - this.gameState.enemy.defense);
                this.gameState.enemy.hp -= playerDamage;
                // 确保敌人血量不会小于0
                if (this.gameState.enemy.hp < 0) {
                    this.gameState.enemy.hp = 0;
                }
                this.addBattleLog(`你使用了${skill.name}，对${this.gameState.enemy.name}造成了${playerDamage}点伤害！`);
                
                // 显示敌人伤害
                this.showDamage(this.gameState.enemy, playerDamage, 'red');
                
                // 检查敌人是否死亡
                if (this.gameState.enemy.hp <= 0) {
                    this.enemyDefeated();
                    return;
                }
            } else if (skill.defenseBonus) {
                // 防御姿态 - 设置防御状态标记为下一回合生效
                this.gameState.player.defenseActive = true;
                this.addBattleLog(`你使用了${skill.name}，防御力在下一回合内提高50%！`);
            } else if (skill.healPercentage) {
                // 生命恢复
                const healAmount = Math.floor(this.gameState.player.maxHp * skill.healPercentage);
                this.gameState.player.hp = Math.min(this.gameState.player.hp + healAmount, this.gameState.player.maxHp);
                this.addBattleLog(`你使用了${skill.name}，恢复了${healAmount}点生命值！`);
                
                // 显示恢复效果
                this.showDamage(this.gameState.player, healAmount, 'green');
            } else if (skill.criticalMultiplier) {
                // 幸运一击
                let playerDamage;
                if (Math.random() < skill.criticalChance) {
                    // 暴击成功
                    playerDamage = Math.max(1, Math.floor(finalAttack * skill.criticalMultiplier) - this.gameState.enemy.defense);
                    this.addBattleLog(`你使用了${skill.name}，触发了暴击！对${this.gameState.enemy.name}造成了${playerDamage}点伤害！`);
                } else {
                    // 暴击失败
                    playerDamage = Math.max(1, finalAttack - this.gameState.enemy.defense);
                    this.addBattleLog(`你使用了${skill.name}，但没有触发暴击，对${this.gameState.enemy.name}造成了${playerDamage}点伤害！`);
                }
                this.gameState.enemy.hp -= playerDamage;
                // 确保敌人血量不会小于0
                if (this.gameState.enemy.hp < 0) {
                    this.gameState.enemy.hp = 0;
                }
                
                // 显示敌人伤害
                this.showDamage(this.gameState.enemy, playerDamage, 'red');
                
                // 检查敌人是否死亡
                if (this.gameState.enemy.hp <= 0) {
                    this.enemyDefeated();
                    return;
                }
            }
            
            // 敌人反击（除了防御姿态和生命恢复）
            if (!skill.defenseBonus && !skill.healPercentage) {
                // 检查是否有防御状态活跃
                let enemyDamage = Math.max(1, this.gameState.enemy.attack - finalDefense);
                if (this.gameState.player.defenseActive) {
                    // 防御状态减少50%伤害
                    enemyDamage = Math.max(1, Math.floor(enemyDamage * 0.5));
                    this.addBattleLog(`${this.gameState.enemy.name}对你造成了${enemyDamage}点伤害（防御态中，伤害已减半）！`);
                    // 防御效果用完，清除标记和特效
                    this.gameState.player.defenseActive = false;
                    this.removeDefenseEffect();
                } else {
                    this.addBattleLog(`${this.gameState.enemy.name}对你造成了${enemyDamage}点伤害！`);
                }
                this.gameState.player.hp -= enemyDamage;
                // 确保玩家血量不会小于0
                if (this.gameState.player.hp < 0) {
                    this.gameState.player.hp = 0;
                }
                
                // 显示玩家伤害
                this.showDamage(this.gameState.player, enemyDamage, 'red');
            }
            
            // 检查玩家是否死亡
            if (this.gameState.player.hp <= 0) {
                this.playerDefeated();
            }
            
            // 更新UI
            this.updateUI();
            
            // 更新血条显示
            this.updateHealthBars();
        }, 500); // 延迟500毫秒，让动画有时间播放
    }
    
    // 生成装备掉落
    generateEquipmentDrop() {
        // 计算掉落概率（普通、精英、BOSS怪物不同掉落概率）
        let baseDropChance;
        if (this.gameState.enemy.isBoss) {
            baseDropChance = 1.0; // BOSS必定掉落
        } else if (this.gameState.enemy.isElite) {
            baseDropChance = 0.8; // 精英怪高掉落概率
        } else {
            baseDropChance = 0.5; // 普通怪物基础掉落概率
        }
        
        // 随机决定是否掉落
        if (Math.random() > baseDropChance) {
            return null;
        }
        
        // 随机选择装备类型
        const templateIndex = Math.floor(Math.random() * this.gameState.equipmentTemplates.length);
        const template = this.gameState.equipmentTemplates[templateIndex];
        
        // 根据敌人等级确定装备等级（每10级怪物掉同一等级装备）
        const equipmentLevel = Math.max(1, Math.floor((this.gameState.enemy.level - 1) / 10) + 1);
        
        // 随机确定装备品质（考虑怪物类型和幸运值）
        const rarity = this.getRandomRarity();
        const rarityInfo = this.gameState.equipmentRarities.find(r => r.name === rarity);
        
        // 计算装备属性（基础属性 * 等级 * 品质倍数）
        const stats = {};
        for (const stat in template.baseStats) {
            stats[stat] = Math.floor(template.baseStats[stat] * equipmentLevel * rarityInfo.multiplier);
        }
        
        // 生成装备名称
        const prefixIndex = Math.floor(Math.min((rarityInfo ? rarityInfo.multiplier : 1) - 1, template.namePrefixes.length - 1));
        const suffixIndex = Math.floor(Math.random() * template.nameSuffixes.length);
        const prefix = template.namePrefixes[prefixIndex] || "";
        const suffix = template.nameSuffixes[suffixIndex] || "装备";
        const name = prefix + suffix;
        
        // 创建装备对象
        return {
            id: `${template.type}_${equipmentLevel}_${rarity}_${Math.floor(Math.random() * 1000)}`,
            name: name,
            type: template.type,
            level: equipmentLevel,
            refineLevel: 0,
            stats: stats,
            description: `${rarityInfo.displayName}品质的${template.type}`,
            rarity: rarity,
            rarityDisplayName: rarityInfo.displayName,
            rarityMultiplier: rarityInfo.multiplier,
            colorClass: rarityInfo.color
        };
    }
    
    // 随机获取装备品质（考虑怪物类型和幸运值）
    getRandomRarity() {
        // 基础掉率
        let dropRates = {
            white: 0.4,
            blue: 0.3,
            purple: 0.15,
            gold: 0.1,
            legendary: 0.05
        };
        
        // 根据怪物类型调整掉率
        if (this.gameState.enemy.isBoss) {
            // BOSS掉率调整
            dropRates = {
                white: 0.2,
                blue: 0.3,
                purple: 0.25,
                gold: 0.2,
                legendary: 0.05
            };
        } else if (this.gameState.enemy.isElite) {
            // 精英怪掉率调整
            dropRates = {
                white: 0.3,
                blue: 0.35,
                purple: 0.2,
                gold: 0.1,
                legendary: 0.05
            };
        }
        
        // 考虑幸运值影响（每点幸运值提高0.5%的高品质装备掉率）
        const luck = this.gameState.player.luck || 0;
        const luckBonus = luck * 0.005;
        
        // 调整掉率，提高高品质装备的概率
        const adjustedRates = {
            white: Math.max(0, dropRates.white - luckBonus * 2),
            blue: Math.max(0, dropRates.blue - luckBonus),
            purple: Math.max(0, dropRates.purple + luckBonus * 0.5),
            gold: Math.max(0, dropRates.gold + luckBonus * 1),
            legendary: Math.max(0, dropRates.legendary + luckBonus * 1.5)
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
    
    // 玩家被击败
    playerDefeated() {
        // 显示玩家倒地的画面
        this.showPlayerDefeatedAnimation();
        
        // 设置玩家被击败状态
        if (this.battle3D) {
            this.battle3D.playerDefeated = true;
        }
        
        // 播放失败声音
        this.playSound('defeat-sound', 1, 1000);

        this.addBattleLog('你被击败了！');
        // 重置玩家状态
        this.gameState.player.hp = this.gameState.player.maxHp;
        this.gameState.player.exp = Math.floor(this.gameState.player.exp * 0.8); // 失去20%经验
        this.addBattleLog('你失去了20%的经验！');
        
        // 刷新敌人
        this.refreshEnemy();
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        this.updateHealthBars();
        
        // 战斗结束，延迟后关闭战斗模态窗口并返回主界面
        setTimeout(() => {
            this.closeBattleModal();
        }, 2000);
    }
    
    // 检查升级
    checkLevelUp() {
   
        if (this.gameState.player.exp >= this.gameState.player.maxExp) {

            // 升级
            this.gameState.player.level++;
            this.gameState.player.exp -= this.gameState.player.maxExp;
            this.gameState.player.maxExp = Math.floor(this.gameState.player.maxExp * 1.5);
            
            // 提升属性
            this.gameState.player.attack += 3;
            this.gameState.player.defense += 2;
            this.gameState.player.maxHp += 20;
            this.gameState.player.hp = this.gameState.player.maxHp;
            this.gameState.player.luck += 1;
            
            // 提升能量上限
            this.gameState.player.maxEnergy += 10;
            this.gameState.player.energy = this.gameState.player.maxEnergy; // 升级时充满能量
            
            // 提升资源产出率
            this.gameState.resources.woodRate += 0.2;
            this.gameState.resources.ironRate += 0.1;
            this.gameState.resources.crystalRate += 0.05;
            
            // 播放升级声音
            this.playSound('levelup-sound', 1, 2000);
            
            this.addBattleLog(`恭喜你升级到${this.gameState.player.level}级！能量上限提升了10点！`);
            
            // 触发升级动画
            this.triggerLevelUpAnimation();
            
            console.log('升级逻辑执行完成');
        }
    }
    
    // 触发升级动画
    triggerLevelUpAnimation() {
        const levelElement = document.getElementById('level');
        levelElement.classList.add('level-up-animation');
        setTimeout(() => {
            levelElement.classList.remove('level-up-animation');
        }, 1000);
    }
    
    // 根据性别更新人物形象
    updateCharacterBodyImage() {
        const characterBodyElement = document.getElementById('character-body');
        if (characterBodyElement) {
            const timestamp = new Date().getTime();
            if (this.gameState.user.loggedIn && this.gameState.user.gender) {
                if (this.gameState.user.gender === '男') {
                    characterBodyElement.src = `Images/male-character.png?${timestamp}`;
                } else if (this.gameState.user.gender === '女') {
                    characterBodyElement.src = `Images/female-character.png?${timestamp}`;
                }
            } else {
                // 未登录时使用默认形象
                characterBodyElement.src = `Images/default-character.png?${timestamp}`;
            }
        }
    }
    
    // 更新人物装备显示
    updateCharacterEquipmentDisplay() {
        // 确保玩家装备存在
        if (!this.gameState.player || !this.gameState.player.equipment) {
            return;
        }
        
        const equipment = this.gameState.player.equipment;
        
        // 装备槽位映射
        const equipmentSlots = {
            'weapon': 'character-weapon',
            'armor': 'character-armor',
            'helmet': 'character-helmet',
            'boots': 'character-boots',
            'accessory': 'character-accessory',
            'pants': 'character-pants'
        };
        
        // 装备品质颜色映射
        const qualityColors = {
            '白色': 'quality-white',
            '蓝色': 'quality-blue',
            '紫色': 'quality-purple',
            '金色': 'quality-gold',
            '传说': 'quality-red'
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
                    
                    // 设置悬停提示
                    const statsDescription = this.getStatsDescription(item.stats);
                    const tooltipText = `${item.name}\n等级: ${item.level}\n品质: ${item.rarityDisplayName || '白色'}\n精炼: +${item.refineLevel || 0}\n属性: ${statsDescription}`;
                    element.setAttribute('data-tooltip', tooltipText);
                    
                    // 根据装备品质设置颜色
                    if (item.rarityDisplayName && qualityColors[item.rarityDisplayName]) {
                        element.className = element.className.replace(/quality-\w+/g, '');
                        element.classList.add(qualityColors[item.rarityDisplayName]);
                    } else if (item.colorClass) {
                        // 兼容旧装备
                        element.className = element.className.replace(/quality-\w+/g, '');
                        element.classList.add(item.colorClass);
                    } else {
                        // 兼容旧装备
                        const rarityInfo = this.gameState.equipmentRarities.find(r => r.name === item.rarity);
                        if (rarityInfo && rarityInfo.color) {
                            element.className = element.className.replace(/quality-\w+/g, '');
                            element.classList.add(rarityInfo.color);
                        }
                    }
                } else {
                    // 隐藏装备
                    element.style.opacity = '0';
                    // 清除悬停提示
                    element.removeAttribute('data-tooltip');
                    // 清除颜色类
                    element.className = element.className.replace(/quality-\w+/g, '');
                }
            }
        }
    }
    
    // 从颜色类名获取颜色值
    getColorFromClass(colorClass) {
        // 定义颜色映射
        const colorMap = {
            'text-gray-400': 'rgba(156, 163, 175, 0.7)',
            'text-blue-400': 'rgba(96, 165, 250, 0.7)',
            'text-purple-400': 'rgba(168, 85, 247, 0.7)',
            'text-yellow-400': 'rgba(250, 204, 21, 0.7)',
            'text-orange-400': 'rgba(251, 146, 60, 0.7)'
        };
        
        return colorMap[colorClass] || 'rgba(96, 165, 250, 0.5)';
    }
    
    // 刷新敌人
    refreshEnemy() {
        // 敌人等级与玩家等级差距不超过3级
        const minLevel = Math.max(1, this.gameState.player.level - 3);
        const maxLevel = this.gameState.player.level + 3;
        const enemyLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
        
        // 获取当前地图类型
        let mapType = 'xianxia-mountain'; // 默认地图
        if (this.gameState.mapBackgrounds && this.gameState.currentBackgroundIndex !== undefined) {
            const currentBackground = this.gameState.mapBackgrounds[this.gameState.currentBackgroundIndex];
            if (currentBackground && currentBackground.type) {
                mapType = currentBackground.type;
            }
        }
        
        // 从地图敌人映射中获取当前地图的敌人列表
        const mapEnemies = this.gameState.mapEnemyMapping && this.gameState.mapEnemyMapping[mapType] ? 
            this.gameState.mapEnemyMapping[mapType] : 
            this.gameState.enemyTypes.map(enemy => enemy.name);
        
        // 随机选择一个敌人名称
        const randomEnemyName = mapEnemies[Math.floor(Math.random() * mapEnemies.length)];
        
        // 从enemyTypes中找到对应的敌人类型
        let enemyType = this.gameState.enemyTypes.find(enemy => enemy.name === randomEnemyName);
        
        // 如果找不到对应敌人，使用默认敌人
        if (!enemyType) {
            // 根据玩家等级选择合适的敌人类型
            let enemyTypeIndex = 0;
            if (enemyLevel >= 5) {
                enemyTypeIndex = Math.min(Math.floor(enemyLevel / 5), this.gameState.enemyTypes.length - 1);
            } else {
                enemyTypeIndex = Math.floor(Math.random() * Math.min(enemyLevel, this.gameState.enemyTypes.length));
            }
            
            // 随机选择敌人类型（有概率遇到高级敌人）
            const randomFactor = Math.random();
            if (randomFactor > 0.7 && enemyTypeIndex < this.gameState.enemyTypes.length - 1) {
                enemyTypeIndex++;
            }
            
            enemyType = this.gameState.enemyTypes[enemyTypeIndex];
        }
        
        // 计算是否为精英怪（15%概率）
        const isElite = Math.random() < 0.15;
        const eliteBonus = isElite ? 1.5 : 1;
        
        // 计算敌人属性
        const hp = Math.floor(enemyType.baseHp * enemyLevel * eliteBonus);
        const attack = Math.floor(enemyType.baseAttack * enemyLevel * eliteBonus);
        const defense = Math.floor(enemyType.baseDefense * enemyLevel * eliteBonus);
        
        this.gameState.enemy = {
            name: isElite ? `精英${enemyType.name}` : enemyType.name,
            level: enemyLevel,
            hp: hp,
            maxHp: hp,
            attack: attack,
            defense: defense,
            isElite: isElite,
            eliteBonus: eliteBonus,
            icon: enemyType.icon,
            image: enemyType.image,
            expMultiplier: enemyType.expMultiplier * eliteBonus,
            resourceMultiplier: enemyType.resourceMultiplier * eliteBonus
        };
    }
    
    // 切换自动战斗
    toggleAutoBattle() {
        this.gameState.settings.autoBattleSettings.enabled = !this.gameState.settings.autoBattleSettings.enabled;
        const btn = document.getElementById('auto-battle-btn');
        
        if (this.gameState.settings.autoBattleSettings.enabled) {
            btn.innerHTML = '<i class="fa fa-pause mr-1"></i> 停止自动战斗';
            btn.setAttribute('data-tooltip', '停止自动战斗');
            this.startAutoBattle();
        } else {
            btn.innerHTML = '<img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=auto%20battle%20button%20winter%20theme%20green%20crystal%20style%20clean%20minimal&image_size=square" alt="自动战斗" class="w-full h-full object-cover">';
            btn.setAttribute('data-tooltip', '自动进行战斗，消耗能量');
            this.stopAutoBattle();
        }
    }
    
    // 切换自动收集资源
    toggleAutoCollect() {
        this.gameState.settings.autoCollectSettings.enabled = !this.gameState.settings.autoCollectSettings.enabled;
        const btn = document.getElementById('auto-collect-btn');
        
        if (this.gameState.settings.autoCollectSettings.enabled) {
            btn.innerHTML = '<i class="fa fa-pause mr-1"></i> 停止自动收集';
            btn.setAttribute('data-tooltip', '停止自动收集');
            this.startAutoCollect();
        } else {
            btn.innerHTML = '<img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=auto%20collect%20resources%20button%20winter%20theme%20blue%20crystal%20style%20clean%20minimal&image_size=square" alt="自动收集" class="w-full h-full object-cover">';
            btn.setAttribute('data-tooltip', '自动收集资源，消耗能量');
            this.stopAutoCollect();
        }
    }
    
    // 更新自动战斗目标颜色
    updateAutoBattleTargetColors() {
        const targetColors = [];
        if (document.getElementById('auto-battle-green').checked) {
            targetColors.push('green');
        }
        if (document.getElementById('auto-battle-yellow').checked) {
            targetColors.push('yellow');
        }
        if (document.getElementById('auto-battle-red').checked) {
            targetColors.push('red');
        }
        this.gameState.settings.autoBattleSettings.targetColors = targetColors;
    }
    
    // 更新自动收集资源类型
    updateAutoCollectResourceTypes() {
        const resourceTypes = [];
        if (document.getElementById('auto-collect-wood').checked) {
            resourceTypes.push('wood');
        }
        if (document.getElementById('auto-collect-iron').checked) {
            resourceTypes.push('iron');
        }
        if (document.getElementById('auto-collect-crystal').checked) {
            resourceTypes.push('crystal');
        }
        this.gameState.settings.autoCollectSettings.resourceTypes = resourceTypes;
    }
    
    // 开始自动战斗
    startAutoBattle() {
        if (!this.timers.autoBattleTimer) {
            this.timers.autoBattleTimer = setInterval(() => {
                // 检查自动战斗是否启用
                if (this.gameState.settings.autoBattleSettings.enabled && this.gameState.player.energy >= 10) {
                    // 检查当前敌人是否符合目标颜色
                    const enemyPower = this.gameState.enemy.attack * 2 + this.gameState.enemy.defense * 1.5 + this.gameState.enemy.maxHp * 0.1;
                    const playerAttack = this.gameState.player.attack + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.attack : 0);
                    const playerDefense = this.gameState.player.defense + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.defense : 0);
                    const playerHp = this.gameState.player.maxHp + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.hp : 0);
                    const playerPower = playerAttack * 2 + playerDefense * 1.5 + playerHp * 0.1;
                    
                    let enemyColor = 'red'; // 默认红色
                    if (this.gameState.enemy.isBoss) {
                        enemyColor = 'purple';
                    } else if (this.gameState.enemy.isElite) {
                        enemyColor = 'yellow';
                    } else {
                        const powerRatio = enemyPower / playerPower;
                        if (powerRatio < 0.7) {
                            enemyColor = 'green';
                        } else if (powerRatio < 1.3) {
                            enemyColor = 'yellow';
                        } else {
                            enemyColor = 'red';
                        }
                    }
                    
                    // 检查当前敌人颜色是否在目标颜色列表中
                    if (this.gameState.settings.autoBattleSettings.targetColors.includes(enemyColor)) {
                        this.attackEnemy();
                    }
                }
            }, 1000);
        }
    }
    
    // 停止自动战斗
    stopAutoBattle() {
        if (this.timers.autoBattleTimer) {
            clearInterval(this.timers.autoBattleTimer);
            this.timers.autoBattleTimer = null;
        }
    }
    
    // 切换自动挂机
    toggleAutoPlay(enabled) {
        this.gameState.settings.autoPlay = enabled;
        
        if (enabled) {
            this.startAutoPlay();
            this.startAfkTimer();
        } else {
            this.stopAutoPlay();
            this.stopAfkTimer();
        }
    }
    
    // 开始自动收集资源
    startAutoCollect() {
        if (!this.timers.autoCollectTimer) {
            this.timers.autoCollectTimer = setInterval(() => {
                // 检查自动收集是否启用
                if (this.gameState.settings.autoCollectSettings.enabled) {
                    // 收集指定类型的资源
                    for (const resourceType of this.gameState.settings.autoCollectSettings.resourceTypes) {
                        if (this.gameState.player.energy >= 5) {
                            this.collectResource(resourceType);
                        }
                    }
                }
            }, 2000);
        }
    }
    
    // 停止自动收集资源
    stopAutoCollect() {
        if (this.timers.autoCollectTimer) {
            clearInterval(this.timers.autoCollectTimer);
            this.timers.autoCollectTimer = null;
        }
    }
    
    // 开始自动挂机
    startAutoPlay() {
        if (!this.timers.autoPlayTimer) {
            this.timers.autoPlayTimer = setInterval(() => {
                // 自动收集资源（如果启用）
                if (this.gameState.settings.autoCollectSettings.enabled) {
                    for (const resourceType of this.gameState.settings.autoCollectSettings.resourceTypes) {
                        if (this.gameState.player.energy >= 5) {
                            this.collectResource(resourceType);
                        }
                    }
                }
                
                // 自动战斗（如果启用）
                if (this.gameState.settings.autoBattleSettings.enabled && this.gameState.player.energy >= 10) {
                    // 检查当前敌人是否符合目标颜色
                    const enemyPower = this.gameState.enemy.attack * 2 + this.gameState.enemy.defense * 1.5 + this.gameState.enemy.maxHp * 0.1;
                    const playerAttack = this.gameState.player.attack + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.attack : 0);
                    const playerDefense = this.gameState.player.defense + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.defense : 0);
                    const playerHp = this.gameState.player.maxHp + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.hp : 0);
                    const playerPower = playerAttack * 2 + playerDefense * 1.5 + playerHp * 0.1;
                    
                    let enemyColor = 'red'; // 默认红色
                    if (this.gameState.enemy.isBoss) {
                        enemyColor = 'purple';
                    } else if (this.gameState.enemy.isElite) {
                        enemyColor = 'yellow';
                    } else {
                        const powerRatio = enemyPower / playerPower;
                        if (powerRatio < 0.7) {
                            enemyColor = 'green';
                        } else if (powerRatio < 1.3) {
                            enemyColor = 'yellow';
                        } else {
                            enemyColor = 'red';
                        }
                    }
                    
                    // 检查当前敌人颜色是否在目标颜色列表中
                    if (this.gameState.settings.autoBattleSettings.targetColors.includes(enemyColor)) {
                        this.attackEnemy();
                    }
                }
            }, 3000);
        }
    }
    
    // 停止自动挂机
    stopAutoPlay() {
        if (this.timers.autoPlayTimer) {
            clearInterval(this.timers.autoPlayTimer);
            this.timers.autoPlayTimer = null;
        }
        // 停止自动收集资源
        this.stopAutoCollect();
        // 停止自动战斗
        this.stopAutoBattle();
    }
    
    // 开始挂机计时器
    startAfkTimer() {
        if (!this.timers.afkTimer) {
            this.timers.afkTimer = setInterval(() => {
                this.gameState.settings.afkTime++;
                this.updateUI();
            }, 1000);
        }
    }
    
    // 停止挂机计时器
    stopAfkTimer() {
        if (this.timers.afkTimer) {
            clearInterval(this.timers.afkTimer);
            this.timers.afkTimer = null;
        }
    }
    
    // 收集资源
    collectResource(type) {
        if (this.gameState.player.energy < 5) {
            this.addBattleLog('能量不足，无法收集资源！');
            return;
        }
        
        // 消耗能量
        this.gameState.player.energy -= 5;
        
        // 显示进度条动画
        const progressBar = document.getElementById(`${type}-progress`);
        if (progressBar) {
            // 重置进度条
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
            
            // 触发重排
            void progressBar.offsetWidth;
            
            // 恢复过渡效果
            progressBar.style.transition = '';
            
            // 增加到100%
            progressBar.style.width = '100%';
            
            // 收集资源
            let amount = 0;
            switch (type) {
                case 'wood':
                    amount = Math.floor(this.gameState.resources.woodRate * 10 + Math.random() * 5);
                    this.gameState.resources.wood += amount;
                    break;
                case 'iron':
                    amount = Math.floor(this.gameState.resources.ironRate * 10 + Math.random() * 3);
                    this.gameState.resources.iron += amount;
                    break;
                case 'crystal':
                    amount = Math.floor(this.gameState.resources.crystalRate * 10 + Math.random() * 2);
                    this.gameState.resources.crystal += amount;
                    break;
            }
            
            this.gameState.settings.collectedResources += amount;
            this.addBattleLog(`收集了${amount}${type === 'wood' ? '木材' : type === 'iron' ? '铁矿' : '水晶'}！`);
            
            // 更新UI
            this.updateUI();
            
            // 等待动画完成后重置进度条
            setTimeout(() => {
                // 禁用过渡效果，瞬间重置进度条
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';
                
                // 恢复过渡效果，以便下次使用
                setTimeout(() => {
                    progressBar.style.transition = '';
                }, 100);
            }, 500); // 等待动画完成（与CSS transition duration一致）
        }
    }
    
    // 添加战斗日志
    addBattleLog(message) {
        this.gameState.battle.battleLog.push(message);
        // 限制日志长度
        if (this.gameState.battle.battleLog.length > 10) {
            this.gameState.battle.battleLog.shift();
        }
    }
    
    // 更新战斗日志UI
    updateBattleLog() {
        const battleLogContainer = document.getElementById('battle-log');
        const battleLogElement = battleLogContainer.querySelector('div');
        battleLogElement.innerHTML = '';
        
        if (this.gameState.battle.battleLog.length === 0) {
            battleLogElement.innerHTML = '<p class="text-light/70">探索日志...</p>';
            return;
        }
        
        this.gameState.battle.battleLog.forEach(log => {
            const logElement = document.createElement('p');
            logElement.textContent = log;
            battleLogElement.appendChild(logElement);
        });
        
        // 滚动到底部
        battleLogElement.scrollTop = battleLogElement.scrollHeight;
    }
    
    
    // 加载游戏
    loadGame() {
        try {
            const userId = this.gameState.user.loggedIn ? this.gameState.user.userId : 'guest';
            
            // 保存用户信息
            const userInfo = { ...this.gameState.user };
            
            // 只从服务器加载
            if (this.gameState.user.loggedIn) {
                (async () => {
                    const serverGameState = await this.loadFromServer(userId);
                    if (serverGameState) {
                        // 保留用户信息，只更新游戏的其他部分
                        const { user, ...gameData } = serverGameState;
                        this.gameState = { ...gameData, user: userInfo };
                        this.addBattleLog('从服务器加载游戏成功！');
                        
                        await this.fetchGameMetadata();
                        // 检查临时状态是否过期
                        this.checkTemporaryStats();
                        // 重新生成场景怪物
                        this.generateMiniMap();
                        // 更新UI
                        this.updateUI();
                        
                    } else {
                        this.addBattleLog('没有找到保存的游戏！');
                    }
                })();
            } else {
                this.addBattleLog('访客模式无法加载游戏！');
            }
        } catch (error) {
            this.addBattleLog('游戏加载失败！');
            console.error('加载游戏失败:', error);
        }
    }
    
    // 计算武器精炼所需材料
    calculateRefineCost(refineLevel) {
        // 基础材料需求
        const baseWood = 50;
        const baseIron = 30;
        const baseCrystal = 10;
        
        // 每级精炼增加的材料倍数
        const multiplier = Math.pow(1.5, refineLevel);
        
        return {
            wood: Math.floor(baseWood * multiplier),
            iron: Math.floor(baseIron * multiplier),
            crystal: Math.floor(baseCrystal * multiplier)
        };
    }
    
    // 精炼装备
    refineEquipment(slot = 'weapon') {
        const item = this.gameState.player.equipment[slot];
        if (!item) {
            this.addBattleLog(`没有装备${slot === 'weapon' ? '武器' : slot === 'armor' ? '护甲' : slot === 'helmet' ? '头盔' : slot === 'boots' ? '靴子' : '饰品'}，无法精炼！`);
            return;
        }
        
        // 确保refineLevel有值
        if (item.refineLevel === undefined) {
            item.refineLevel = 0;
        }
        
        // 检查是否已达到最大精炼等级
        if (item.refineLevel >= 10) {
            this.addBattleLog(`${slot === 'weapon' ? '武器' : slot === 'armor' ? '护甲' : slot === 'helmet' ? '头盔' : slot === 'boots' ? '靴子' : '饰品'}已达到最大精炼等级+10！`);
            return;
        }
        
        // 计算精炼所需材料
        const nextLevel = item.refineLevel + 1;
        const cost = this.calculateRefineCost(item.refineLevel);
        
        // 检查材料是否足够
        if (this.gameState.resources.wood < cost.wood ||
            this.gameState.resources.iron < cost.iron ||
            this.gameState.resources.crystal < cost.crystal) {
            this.addBattleLog('材料不足，无法精炼装备！');
            return;
        }
        
        // 消耗材料
        this.gameState.resources.wood -= cost.wood;
        this.gameState.resources.iron -= cost.iron;
        this.gameState.resources.crystal -= cost.crystal;
        
        // 提升精炼等级
        item.refineLevel = nextLevel;
        
        // 重新计算装备效果
        this.calculateEquipmentEffects();
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        this.updateHealthBars();
        
        // 添加日志
        this.addBattleLog(`${slot === 'weapon' ? '武器' : slot === 'armor' ? '护甲' : slot === 'helmet' ? '头盔' : slot === 'boots' ? '靴子' : '饰品'}精炼成功！当前精炼等级：+${item.refineLevel}`);
        this.addBattleLog(`消耗了 ${cost.wood} 木材，${cost.iron} 铁矿，${cost.crystal} 水晶`);
    }
    
    // 精炼武器（保留向后兼容）
    refineWeapon() {
        this.refineEquipment('weapon');
    }
    
    // 更新精炼信息UI
    updateRefineInfo(selectedSlot = 'weapon') {
        const item = this.gameState.player.equipment[selectedSlot];
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
            if (item.colorClass) {
                refineWeaponNameElement.className = `text-sm font-medium ${item.colorClass}`;
            } else {
                // 兼容旧装备
                const rarityInfo = this.gameState.equipmentRarities.find(r => r.name === item.rarity);
                if (rarityInfo) {
                    refineWeaponNameElement.className = `text-sm font-medium ${rarityInfo.color}`;
                } else {
                    refineWeaponNameElement.className = 'text-sm font-medium text-white';
                }
            }
            
            // 更新精炼等级
            document.getElementById('refine-weapon-level').textContent = `+${item.refineLevel}`;
            
            // 计算下一级精炼所需材料
            if (item.refineLevel < 10) {
                const cost = this.calculateRefineCost(item.refineLevel);
                document.getElementById('refine-requirements').textContent = 
                    `木材: ${cost.wood}, 铁矿: ${cost.iron}, 水晶: ${cost.crystal}`;
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
        const item = this.gameState.player.equipment[selectedSlot];
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
            if (item.colorClass) {
                disassembleWeaponNameElement.className = `text-sm font-medium ${item.colorClass}`;
            } else {
                // 兼容旧装备
                const rarityInfo = this.gameState.equipmentRarities.find(r => r.name === item.rarity);
                if (rarityInfo) {
                    disassembleWeaponNameElement.className = `text-sm font-medium ${rarityInfo.color}`;
                } else {
                    disassembleWeaponNameElement.className = 'text-sm font-medium text-white';
                }
            }
            
            // 更新精炼等级
            document.getElementById('disassemble-weapon-level').textContent = `+${item.refineLevel}`;
            
            // 计算分解返还材料
            const returns = this.calculateDisassembleReturns(item);
            document.getElementById('disassemble-returns').textContent = 
                `木材: ${returns.wood}, 铁矿: ${returns.iron}, 水晶: ${returns.crystal}`;
        } else {
            // 隐藏分解信息
            disassembleInfo.classList.add('hidden');
        }
    }
    
    // 计算分解返还材料
    calculateDisassembleReturns(item) {
        // 确保refineLevel有值
        const refineLevel = item.refineLevel || 0;
        
        // 计算精炼材料返还（只返还50%的精炼材料，保持游戏经济平衡）
        let refineWood = 0;
        let refineIron = 0;
        let refineCrystal = 0;
        
        // 计算从0级到当前精炼等级的所有材料消耗
        for (let i = 0; i < refineLevel; i++) {
            const cost = this.calculateRefineCost(i);
            refineWood += Math.floor(cost.wood * 0.5);
            refineIron += Math.floor(cost.iron * 0.5);
            refineCrystal += Math.floor(cost.crystal * 0.5);
        }
        
        // 计算品质材料返还
        let qualityWood = 0;
        let qualityIron = 0;
        let qualityCrystal = 0;
        
        // 根据装备品质确定返还材料
        if (item.rarity) {
            // 优先使用rarity属性
            switch (item.rarity) {
                case 'white':
                    qualityWood = 30;
                    qualityIron = 15;
                    qualityCrystal = 5;
                    break;
                case 'blue':
                    qualityWood = 50;
                    qualityIron = 25;
                    qualityCrystal = 10;
                    break;
                case 'purple':
                    qualityWood = 80;
                    qualityIron = 40;
                    qualityCrystal = 15;
                    break;
                case 'gold':
                    qualityWood = 120;
                    qualityIron = 60;
                    qualityCrystal = 25;
                    break;
                case 'legendary':
                    qualityWood = 180;
                    qualityIron = 90;
                    qualityCrystal = 40;
                    break;
            }
        } else if (item.colorClass) {
            // 根据颜色类名判断品质
            if (item.colorClass.includes('gray')) {
                // 白色品质
                qualityWood = 30;
                qualityIron = 15;
                qualityCrystal = 5;
            } else if (item.colorClass.includes('blue')) {
                // 蓝色品质
                qualityWood = 50;
                qualityIron = 25;
                qualityCrystal = 10;
            } else if (item.colorClass.includes('purple')) {
                // 紫色品质
                qualityWood = 80;
                qualityIron = 40;
                qualityCrystal = 15;
            } else if (item.colorClass.includes('yellow')) {
                // 黄金品质
                qualityWood = 120;
                qualityIron = 60;
                qualityCrystal = 25;
            } else if (item.colorClass.includes('orange')) {
                // 传奇品质
                qualityWood = 180;
                qualityIron = 90;
                qualityCrystal = 40;
            }
        }
        
        // 总返还材料
        return {
            wood: refineWood + qualityWood,
            iron: refineIron + qualityIron,
            crystal: refineCrystal + qualityCrystal
        };
    }
    
    // 分解装备
    disassembleEquipment(slot = 'weapon') {
        const item = this.gameState.player.equipment[slot];
        if (!item) {
            this.addBattleLog(`没有装备${slot === 'weapon' ? '武器' : slot === 'armor' ? '护甲' : slot === 'helmet' ? '头盔' : slot === 'boots' ? '靴子' : '饰品'}，无法分解！`);
            return;
        }
        
        // 计算分解返还材料
        const returns = this.calculateDisassembleReturns(item);
        
        // 添加确认窗口，防止误分解操作
        const confirmMessage = `确定要分解${slot === 'weapon' ? '武器' : slot === 'armor' ? '护甲' : slot === 'helmet' ? '头盔' : slot === 'boots' ? '靴子' : '饰品'} ${item.name}吗？

分解后将获得：
木材：${returns.wood}
铁矿：${returns.iron}
水晶：${returns.crystal}`;
        
        if (!confirm(confirmMessage)) {
            this.addBattleLog('分解操作已取消！');
            return;
        }
        
        // 获得材料
        this.gameState.resources.wood += returns.wood;
        this.gameState.resources.iron += returns.iron;
        this.gameState.resources.crystal += returns.crystal;
        
        // 卸下并移除装备
        this.gameState.player.equipment[slot] = null;
        
        // 重新计算装备效果
        this.calculateEquipmentEffects();
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        this.updateHealthBars();
        
        // 添加日志
        this.addBattleLog(`成功分解${slot === 'weapon' ? '武器' : slot === 'armor' ? '护甲' : slot === 'helmet' ? '头盔' : slot === 'boots' ? '靴子' : '饰品'} ${item.name}！`);
        this.addBattleLog(`获得了 ${returns.wood} 木材，${returns.iron} 铁矿，${returns.crystal} 水晶！`);
    }
    
    // 保存游戏状态
    saveGameState() {
        try {
            if (this.gameState.user.loggedIn) {
                const currentUserId = this.gameState.user.userId;
                // 只使用服务器端保存
                this.saveToServer(currentUserId, this.gameState);
            }
        } catch (error) {
            console.error('保存游戏状态失败:', error);
        }
    }
    
    // 保存到服务器
    async saveToServer(userId, gameState) {
        try {
            const token = localStorage.getItem('endlessWinterToken');
            
            const response = await fetch('http://localhost:3001/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ gameState })
            });
            
            const result = await response.json();
            if (!result.success) {
                console.error('服务器端保存失败:', result.error);
                // 如果token无效，重定向到登录页面
                if (result.error === 'Invalid token' || result.error === 'No token provided') {
                    this.logout();
                }
            }
        } catch (error) {
            console.error('服务器端保存出错:', error);
        }
    }
    
    // 从服务器加载
    async loadFromServer(userId) {
        try {
            const token = localStorage.getItem('endlessWinterToken');
            
            const response = await fetch('http://localhost:3001/api/load', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const result = await response.json();
            if (result.success) {
                return result.gameState;
            } else {
                console.error('服务器端加载失败:', result.error);
                // 如果token无效，重定向到登录页面
                if (result.error === 'Invalid token' || result.error === 'No token provided') {
                    this.logout();
                }
                return null;
            }
        } catch (error) {
            console.error('服务器端加载出错:', error);
            return null;
        }
    }
    
    // 显示合成菜单
    showCraftMenu() {
        // 直接打开背包，因为合成功能已经整合到背包中
        this.showInventory();
    }
    
    // 初始化合成界面
    initCraftInterface() {
        // 清空所有槽位
        const slots = document.querySelectorAll('[craft-data-slot]');
        slots.forEach(slot => {
            slot.innerHTML = '<div class="text-xs text-light/60">拖放装备</div>';
            slot.dataset.itemId = '';
        });
        
        // 清空结果槽位
        const resultSlot = document.getElementById('craft-result-slot');
        resultSlot.innerHTML = '<div class="text-xs text-light/60">合成结果</div>';
        
        // 重置成功率
        document.getElementById('craft-success-rate').textContent = '0%';
        
        // 禁用合成按钮
        const confirmCraftBtn = document.getElementById('confirm-craft');
        if (confirmCraftBtn) {
            confirmCraftBtn.disabled = true;
            confirmCraftBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        
        // 绑定拖放事件
        this.bindDragAndDrop();
    }
    
    // 绑定拖放事件
    bindDragAndDrop() {
        const inventoryItems = document.querySelectorAll('#inventory-equipment > div, #inventory-consumables > div');
        const craftSlots = document.querySelectorAll('[craft-data-slot]');
        
        // 为背包物品添加拖拽事件
        inventoryItems.forEach(itemElement => {
            itemElement.draggable = true;
            itemElement.addEventListener('dragstart', (e) => {
                const index = itemElement.dataset.index;
                e.dataTransfer.setData('text/plain', index);
            });
        });
        
        // 为合成槽位添加拖放事件
        craftSlots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('border-accent');
            });
            
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('border-accent');
            });
            
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('border-accent');
                const index = e.dataTransfer.getData('text/plain');
                this.dropItemToCraftSlot(index, slot);
            });
        });
    }
    
    // 处理物品拖放到合成槽位
    dropItemToCraftSlot(index, slot) {
        const inventory = this.gameState.player.inventory;
        const item = inventory[index];
        
        // 检查是否是装备
        if (!((item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || 
             item.type === 'helmet' || item.type === 'boots' || item.type === 'accessory') || 
            item.equipmentType)) {
            this.addBattleLog('只能合成装备！');
            return;
        }
        
        // 显示装备信息
        const itemType = item.equipmentType || item.type;
        const rarityColor = this.getRarityColor(item.rarity || 'white');
        
        slot.innerHTML = `
            <div class="text-xs ${rarityColor} text-center">
                <i class="fa ${this.getEquipmentIcon(itemType)}"></i><br>
                ${item.name}
            </div>
        `;
        
        slot.dataset.itemId = index;
        
        // 更新成功率
        this.updateCraftSuccessRate();
    }
    
    // 获取装备图标
    getEquipmentIcon(type) {
        const icons = {
            weapon: 'fa-sword',
            armor: 'fa-shield',
            helmet: 'fa-hat-wizard',
            boots: 'fa-boot',
            accessory: 'fa-gem'
        };
        return icons[type] || 'fa-box';
    }
    
    // 获取品质颜色
    getRarityColor(rarity) {
        const colors = {
            white: 'text-gray-400',
            blue: 'text-blue-400',
            purple: 'text-purple-400',
            gold: 'text-yellow-400',
            legendary: 'text-orange-400'
        };
        return colors[rarity] || 'text-gray-400';
    }
    
    // 更新合成成功率
    updateCraftSuccessRate() {
        const slots = document.querySelectorAll('[craft-data-slot]');
        const items = [];
        const confirmCraftBtn = document.getElementById('confirm-craft');
        
        // 收集所有放入槽位的物品
        slots.forEach(slot => {
            const itemId = slot.dataset.itemId;
            if (itemId) {
                const item = this.gameState.player.inventory[itemId];
                if (item) {
                    items.push(item);
                }
            }
        });
        
        // 检查是否有3个物品
        if (items.length !== 3) {
            document.getElementById('craft-success-rate').textContent = '0%';
            // 禁用合成按钮
            if (confirmCraftBtn) {
                confirmCraftBtn.disabled = true;
                confirmCraftBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
            return;
        }
        
        // 检查物品是否相同类型、等级和品质
        const firstItem = items[0];
        const firstType = firstItem.equipmentType || firstItem.type;
        const firstLevel = firstItem.level || 1;
        const firstRarity = firstItem.rarity || 'white';
        
        const isValid = items.every(item => {
            const itemType = item.equipmentType || item.type;
            const itemLevel = item.level || 1;
            const itemRarity = item.rarity || 'white';
            
            return itemType === firstType && itemLevel === firstLevel && itemRarity === firstRarity;
        });
        
        if (isValid) {
            // 计算成功率（根据品质）
            let successRate = 70; // 基础成功率
            
            switch (firstRarity) {
                case 'white':
                    successRate = 90;
                    break;
                case 'blue':
                    successRate = 80;
                    break;
                case 'purple':
                    successRate = 70;
                    break;
                case 'gold':
                    successRate = 60;
                    break;
                case 'legendary':
                    successRate = 50;
                    break;
            }
            
            document.getElementById('craft-success-rate').textContent = `${successRate}%`;
            // 启用合成按钮
            if (confirmCraftBtn) {
                confirmCraftBtn.disabled = false;
                confirmCraftBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        } else {
            document.getElementById('craft-success-rate').textContent = '0%';
            // 禁用合成按钮
            if (confirmCraftBtn) {
                confirmCraftBtn.disabled = true;
                confirmCraftBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
    }
    
    // 执行合成
    performCraft(skipInventoryUpdate = false) {
        const slots = document.querySelectorAll('[craft-data-slot]');
        const itemIds = [];
        const items = [];
        
        // 收集所有放入槽位的物品
        slots.forEach(slot => {
            const itemId = slot.dataset.itemId;
            if (itemId) {
                itemIds.push(parseInt(itemId));
                const item = this.gameState.player.inventory[itemId];
                if (item) {
                    items.push(item);
                }
            }
        });
        
        // 检查是否有3个物品
        if (items.length !== 3) {
            this.addBattleLog('需要3个装备才能合成！');
            return;
        }
        
        // 检查物品是否相同类型、等级和品质
        const firstItem = items[0];
        const firstType = firstItem.equipmentType || firstItem.type;
        const firstLevel = firstItem.level || 1;
        const firstRarity = firstItem.rarity || 'white';
        
        const isValid = items.every(item => {
            const itemType = item.equipmentType || item.type;
            const itemLevel = item.level || 1;
            const itemRarity = item.rarity || 'white';
            
            return itemType === firstType && itemLevel === firstLevel && itemRarity === firstRarity;
        });
        
        if (!isValid) {
            this.addBattleLog('只能合成相同类型、等级和品质的装备！');
            return;
        }
        
        // 计算成功率
        let successRate = 70;
        switch (firstRarity) {
            case 'white':
                successRate = 90;
                break;
            case 'blue':
                successRate = 80;
                break;
            case 'purple':
                successRate = 70;
                break;
            case 'gold':
                successRate = 60;
                break;
            case 'legendary':
                successRate = 50;
                break;
        }
        
        // 从背包中移除物品（从后往前移除，避免索引混乱）
        itemIds.sort((a, b) => b - a);
        itemIds.forEach(id => {
            this.gameState.player.inventory.splice(id, 1);
        });
        
        // 生成新装备
        const newRarity = this.getNextRarity(firstRarity);
        const newEquipment = this.generateEquipment(firstType, firstLevel, newRarity);
        
        // 合成结果
        const resultSlot = document.getElementById('craft-result-slot');
        
        if (Math.random() * 100 < successRate) {
            // 合成成功
            this.gameState.player.inventory.push(newEquipment);
            this.addBattleLog(`合成成功！获得了${newEquipment.rarityDisplayName} ${newEquipment.name}！`);
            
            // 播放合成成功声音
            const successSound = document.getElementById('craft-success-sound');
            if (successSound) {
                successSound.currentTime = 0;
                successSound.play();
                // 2秒后停止播放
                setTimeout(() => {
                    successSound.pause();
                    successSound.currentTime = 0;
                }, 2000);
            }
            
            // 显示合成成功动画，使用装备品质对应的颜色
            resultSlot.innerHTML = `
                <div class="text-xs ${newEquipment.colorClass} text-center animate-pulse">
                    <i class="fa ${this.getEquipmentIcon(firstType)}"></i><br>
                    ${newEquipment.name}
                </div>
            `;
        } else {
            // 合成失败，返回一个原品质的装备
            const failedEquipment = this.generateEquipment(firstType, firstLevel, firstRarity);
            this.gameState.player.inventory.push(failedEquipment);
            this.addBattleLog(`合成失败！获得了${failedEquipment.rarityDisplayName} ${failedEquipment.name}！`);
            
            // 播放合成失败声音
            const failSound = document.getElementById('craft-fail-sound');
            if (failSound) {
                failSound.currentTime = 0;
                failSound.play();
                // 2秒后停止播放
                setTimeout(() => {
                    failSound.pause();
                    failSound.currentTime = 0;
                }, 2000);
            }
            
            // 显示合成失败动画，使用装备品质对应的颜色
            resultSlot.innerHTML = `
                <div class="text-xs ${failedEquipment.colorClass} text-center animate-pulse">
                    <i class="fa ${this.getEquipmentIcon(firstType)}"></i><br>
                    ${failedEquipment.name}
                </div>
            `;
        }
        
        // 更新UI
        this.updateUI();
        
        // 3秒后重新显示背包，更新物品（如果不是一键合成模式）
        if (!skipInventoryUpdate) {
            setTimeout(() => {
                this.showInventory();
            }, 3000);
        }
    }
    
    // 获取下一个品质
    getNextRarity(rarity) {
        const rarityOrder = ['white', 'blue', 'purple', 'gold', 'legendary'];
        const currentIndex = rarityOrder.indexOf(rarity);
        return rarityOrder[Math.min(currentIndex + 1, rarityOrder.length - 1)];
    }
    
    // 生成装备
    generateEquipment(type, level, rarity) {
        // 找到对应类型的装备模板
        const template = this.gameState.equipmentTemplates.find(t => t.type === type);
        if (!template) {
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
                rarityMultiplier: 1,
                colorClass: 'text-white'
            };
        }
        
        // 获取品质信息
        const rarityInfo = this.gameState.equipmentRarities.find(r => r.name === rarity);
        
        // 计算装备属性（基础属性 * 等级 * 品质倍数）
        const stats = {};
        for (const stat in template.baseStats) {
            stats[stat] = Math.floor(template.baseStats[stat] * level * (rarityInfo ? rarityInfo.multiplier : 1));
        }
        
        // 生成装备名称
        const prefixIndex = Math.floor(Math.min((rarityInfo ? rarityInfo.multiplier : 1) - 1, template.namePrefixes.length - 1));
        const suffixIndex = Math.floor(Math.random() * template.nameSuffixes.length);
        const prefix = template.namePrefixes[prefixIndex] || "";
        const suffix = template.nameSuffixes[suffixIndex] || "装备";
        const name = prefix + suffix;
        
        // 创建装备对象
        return {
            id: `${type}_${level}_${rarity}_${Math.floor(Math.random() * 1000)}`,
            name: name,
            type: type,
            level: level,
            refineLevel: 0,
            stats: stats,
            description: `${rarityInfo ? rarityInfo.displayName : rarity}品质的${type}`,
            rarity: rarity,
            rarityDisplayName: rarityInfo ? rarityInfo.displayName : rarity,
            rarityMultiplier: rarityInfo ? rarityInfo.multiplier : 1,
            colorClass: rarityInfo ? rarityInfo.color : 'text-white'
        };
    }
    
    // 一键合成相关变量
    isAutoCrafting = false;
    autoCraftInterval = null;
    
    // 一键合成功能
    async autoCraft() {
        // 检查是否已经在进行一键合成
        if (this.isAutoCrafting) {
            return;
        }
        
        this.isAutoCrafting = true;
        let craftedCount = 0;
        
        // 添加停止按钮
        const autoCraftBtn = document.getElementById('auto-craft');
        if (autoCraftBtn) {
            autoCraftBtn.innerHTML = '<i class="fa fa-stop"></i> 停止合成';
            autoCraftBtn.onclick = () => this.stopAutoCraft();
        }
        
        try {
            // 循环合成，直到没有可合成的装备为止
            while (this.isAutoCrafting) {
                const craftSlots = document.querySelectorAll('[craft-data-slot]');
                const currentInventory = this.gameState.player.inventory || [];
                
                // 清空所有合成槽位
                craftSlots.forEach(slot => {
                    slot.innerHTML = '<div class="text-xs text-light/60">拖放装备</div>';
                    slot.dataset.itemId = '';
                });
                
                // 按类型、等级、品质分组装备，排除正在穿戴的装备
                const equipmentGroups = {};
                currentInventory.forEach((item, index) => {
                    // 检查装备是否正在穿戴
                    const isEquipped = this.isEquipmentEquipped(item);
                    if (isEquipped) {
                        return; // 跳过正在穿戴的装备
                    }
                    
                    if (item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || 
                        item.type === 'helmet' || item.type === 'boots' || item.type === 'accessory' || 
                        item.equipmentType) {
                        const type = item.equipmentType || item.type;
                        const level = item.level || 1;
                        const rarity = item.rarity || 'white';
                        const key = `${type}_${level}_${rarity}`;
                        
                        if (!equipmentGroups[key]) {
                            equipmentGroups[key] = [];
                        }
                        equipmentGroups[key].push(index);
                    }
                });
                
                // 找到有3个或以上相同类型、等级、品质装备的组
                let found = false;
                for (const key in equipmentGroups) {
                    if (equipmentGroups[key].length >= 3) {
                        // 选择前3个装备
                        const indices = equipmentGroups[key].slice(0, 3);
                        
                        // 动态显示装备放入圆圈（每个间隔200ms）
                        for (let i = 0; i < indices.length; i++) {
                            if (!this.isAutoCrafting) break;
                            
                            const index = indices[i];
                            const slot = craftSlots[i];
                            const item = currentInventory[index];
                            const itemType = item.equipmentType || item.type;
                            const rarityColor = this.getRarityColor(item.rarity || 'white');
                            
                            // 确保槽位存在
                            if (slot) {
                                slot.innerHTML = `
                                    <div class="text-xs ${rarityColor} text-center">
                                        <i class="fa ${this.getEquipmentIcon(itemType)}"></i><br>
                                        ${item.name}
                                    </div>
                                `;
                                slot.dataset.itemId = index;
                            }
                            
                            // 等待200ms
                            await new Promise(resolve => setTimeout(resolve, 200));
                        }
                        
                        if (!this.isAutoCrafting) break;
                        
                        // 更新成功率
                        this.updateCraftSuccessRate();
                        
                        // 等待500ms
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        if (!this.isAutoCrafting) break;
                        
                        // 执行合成，跳过背包更新
                        this.performCraft(true);
                        found = true;
                        craftedCount++;
                        
                        // 等待2秒后进行下一次合成，给用户足够时间看到合成结果
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        break;
                    }
                }
                
                if (!found || !this.isAutoCrafting) {
                    break;
                }
            }
            
            if (craftedCount > 0) {
                this.addBattleLog(`一键合成完成！共合成了${craftedCount}次装备。`);
            } else {
                this.addBattleLog('没有足够的装备进行合成！');
            }
        } finally {
            // 恢复一键合成按钮
            if (autoCraftBtn) {
                autoCraftBtn.innerHTML = '<i class="fa fa-magic"></i> 一键合成';
                autoCraftBtn.onclick = () => this.autoCraft();
            }
            this.isAutoCrafting = false;
            
            // 一键合成完成后更新背包显示
            setTimeout(() => {
                this.showInventory();
            }, 1000);
        }
    }
    
    // 停止一键合成
    stopAutoCraft() {
        this.isAutoCrafting = false;
        const autoCraftBtn = document.getElementById('auto-craft');
        if (autoCraftBtn) {
            autoCraftBtn.innerHTML = '<i class="fa fa-magic"></i> 一键合成';
            autoCraftBtn.onclick = () => this.autoCraft();
        }
        this.addBattleLog('一键合成已停止！');
    }
    
    // 检查装备是否正在穿戴
    isEquipmentEquipped(item) {
        const player = this.gameState.player;
        if (!player) return false;
        
        // 检查各个装备槽位
        const equipmentSlots = ['weapon', 'armor', 'helmet', 'boots', 'accessory'];
        for (const slot of equipmentSlots) {
            const equippedItem = player[slot];
            if (equippedItem && equippedItem.id === item.id) {
                return true;
            }
        }
        return false;
    }
    
    // 检查可合成的装备
    checkCraftableEquipment() {
        const inventory = this.gameState.player.inventory || [];
        const equipmentByTypeLevelRarity = {};
        
        // 按类型、等级和品质分组装备
        inventory.forEach(item => {
            // 检查是否是装备类型
            if ((item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || 
                 item.type === 'helmet' || item.type === 'boots' || item.type === 'accessory') || 
                item.equipmentType) {
                const equipmentType = item.equipmentType || item.type;
                const level = item.level || 1;
                const rarity = item.rarity || 'white';
                const key = `${equipmentType}_${level}_${rarity}`;
                
                if (!equipmentByTypeLevelRarity[key]) {
                    equipmentByTypeLevelRarity[key] = {
                        type: equipmentType,
                        level: level,
                        rarity: rarity,
                        items: [],
                        typeName: this.getEquipmentTypeName(equipmentType)
                    };
                }
                
                equipmentByTypeLevelRarity[key].items.push(item);
            }
        });
        
        // 筛选出有至少3个同类型、同等级、同品质装备的组合
        return Object.values(equipmentByTypeLevelRarity).filter(craftable => {
            return craftable.items.length >= 3;
        });
    }
    
    // 获取装备类型的中文名称
    getEquipmentTypeName(type) {
        const typeNames = {
            weapon: '武器',
            armor: '护甲',
            helmet: '头盔',
            boots: '靴子',
            accessory: '饰品'
        };
        return typeNames[type] || type;
    }
    
    // 获取品质的中文名称
    getRarityDisplayName(rarity) {
        const rarityNames = {
            white: '',
            blue: '蓝色',
            purple: '紫色',
            gold: '金色',
            legendary: '传奇'
        };
        return rarityNames[rarity] || '';
    }
    
    // 合成装备
    craftEquipment(craftable) {
        // 从背包中取出3个装备
        const inventory = this.gameState.player.inventory;
        const itemsToRemove = [];
        const originalItems = [];
        
        for (let i = 0; i < inventory.length && itemsToRemove.length < 3; i++) {
            const item = inventory[i];
            if ((item.type === 'equipment' || item.equipmentType) && 
                (item.equipmentType || item.type) === craftable.type && 
                (item.level || 1) === craftable.level &&
                (item.rarity || 'white') === craftable.rarity) {
                itemsToRemove.push(i);
                originalItems.push(item);
            }
        }
        
        // 移除选中的装备（从后往前移除，避免索引混乱）
        itemsToRemove.reverse().forEach(index => {
            inventory.splice(index, 1);
        });
        
        // 确定合成后的品质（根据原始装备品质升级）
        const baseRarity = craftable.rarity || 'white';
        const newRarity = this.getNextRarity(baseRarity);
        
        // 检查合成是否成功
        const success = this.checkCraftSuccess(baseRarity);
        
        if (success) {
            // 合成成功：生成新装备（同等级，更高品质）
            const newEquipment = this.generateCraftedEquipment(craftable.type, craftable.level, newRarity);
            
            // 检查并自动穿戴更好的装备
            const equipped = this.checkAndEquipBetterGear(newEquipment);
            if (!equipped) {
                // 将新装备添加到背包
                inventory.push(newEquipment);
                this.addBattleLog(`成功合成${craftable.typeName}！`);
                this.addBattleLog(`消耗了3个${craftable.level}级${this.getRarityDisplayName(baseRarity)}${craftable.typeName}，获得了1个${craftable.level}级${this.getRarityDisplayName(newRarity)}${newEquipment.name}，已放入背包！`);
            } else {
                this.addBattleLog(`成功合成${craftable.typeName}！`);
                this.addBattleLog(`消耗了3个${craftable.level}级${this.getRarityDisplayName(baseRarity)}${craftable.typeName}，获得了1个${craftable.level}级${this.getRarityDisplayName(newRarity)}${newEquipment.name}，属性更好，已自动装备！`);
            }
        } else {
            // 合成失败：返还一个原品质的装备
            const failedEquipment = this.generateCraftedEquipment(craftable.type, craftable.level, baseRarity);
            inventory.push(failedEquipment);
            this.addBattleLog(`合成${craftable.typeName}失败！`);
            this.addBattleLog(`消耗了3个${craftable.level}级${this.getRarityDisplayName(baseRarity)}${craftable.typeName}，只获得了1个${craftable.level}级${this.getRarityDisplayName(baseRarity)}${failedEquipment.name}！`);
        }
        
    }
    
    // 自动合成装备

    
    // 一键装备最好的装备
    autoEquipBestGear() {
        const inventory = this.gameState.player.inventory;
        if (!inventory || inventory.length === 0) {
            this.addBattleLog('背包中没有装备！');
            return;
        }
        
        // 按装备类型分组
        const equipmentByType = {};
        for (const item of inventory) {
            if (item.type && item.type !== 'consumable') {
                if (!equipmentByType[item.type]) {
                    equipmentByType[item.type] = [];
                }
                equipmentByType[item.type].push(item);
            }
        }
        
        let equippedCount = 0;
        
        // 对每种类型的装备，找出最好的并装备
        for (const type in equipmentByType) {
            const items = equipmentByType[type];
            if (items.length === 0) continue;
            
            // 按装备好坏排序
            items.sort((a, b) => {
                if (this.compareEquipment(a, b)) {
                    return -1;
                } else {
                    return 1;
                }
            });
            
            // 获得最好的装备
            const bestItem = items[0];
            
            // 检查是否比当前装备更好
            const currentItem = this.gameState.player.equipment[type];
            if (!currentItem || this.compareEquipment(bestItem, currentItem)) {
                // 从背包中移除该装备
                const index = inventory.indexOf(bestItem);
                if (index > -1) {
                    inventory.splice(index, 1);
                }
                
                // 装备最好的装备
                this.equipItem(bestItem);
                equippedCount++;
            }
        }
        
        if (equippedCount > 0) {
            this.addBattleLog(`一键装备完成！共装备了${equippedCount}件最好的装备。`);
        } else {
            this.addBattleLog('背包中没有比当前装备更好的装备！');
        }
    }
    
    // 生成合成后的装备
    generateCraftedEquipment(type, level, rarity) {
        // 获取装备模板
        const template = this.gameState.equipmentTemplates.find(t => t.type === type);
        if (!template) {
            return null;
        }
        
        // 使用指定的品质
        const rarityInfo = this.gameState.equipmentRarities.find(r => r.name === rarity);
        
        // 计算属性（基础属性 * 等级 * 品质倍数）
        const stats = {};
        for (const stat in template.baseStats) {
            stats[stat] = Math.floor(template.baseStats[stat] * level * rarityInfo.multiplier);
        }
        
        // 生成装备名称
        const prefixIndex = Math.floor(Math.random() * template.namePrefixes.length);
        const suffixIndex = Math.floor(Math.random() * template.nameSuffixes.length);
        const name = template.namePrefixes[prefixIndex] + template.nameSuffixes[suffixIndex];
        
        // 创建装备对象
        return {
            id: `${type}_${level}_${Date.now()}`,
            name: name,
            type: type,
            equipmentType: type,
            level: level,
            stats: stats,
            rarity: rarity,
            rarityDisplayName: rarityInfo.displayName,
            rarityMultiplier: rarityInfo.multiplier,
            colorClass: rarityInfo.color,
            refineLevel: 0
        };
    }
    
    // 获取随机品质
    getRandomRarity() {
        const dropRates = this.gameState.dropRates;
        const random = Math.random();
        let cumulative = 0;
        
        for (const [rarity, rate] of Object.entries(dropRates)) {
            cumulative += rate;
            if (random <= cumulative) {
                return rarity;
            }
        }
        
        return 'white'; // 默认白色品质
    }
    
    // 获取下一个品质（固定升级路径）
    getNextRarity(currentRarity) {
        const rarityOrder = ['white', 'blue', 'purple', 'gold', 'legendary'];
        const currentIndex = rarityOrder.indexOf(currentRarity);
        
        if (currentIndex < rarityOrder.length - 1) {
            return rarityOrder[currentIndex + 1];
        }
        
        // 已经是最高品质，返回当前品质
        return currentRarity;
    }
    
    // 检查合成是否成功
    checkCraftSuccess(currentRarity) {
        const successRates = {
            white: 1.0,    // 白色到蓝色：100%成功
            blue: 0.8,     // 蓝色到紫色：80%成功
            purple: 0.6,   // 紫色到黄金：60%成功
            gold: 0.4,     // 黄金到传奇：40%成功
            legendary: 1.0 // 传奇已经是最高品质，返回当前品质
        };
        
        const successRate = successRates[currentRarity] || 1.0;
        return Math.random() < successRate;
    }
    
    // 重置游戏
    resetGame() {
        if (confirm('确定要重置游戏吗？所有进度将会丢失！')) {
            // 重置游戏状态
            this.gameState = {
                // 用户信息
                user: {
                    loggedIn: false,
                    username: "Guest",
                    userId: "guest"
                },
                // 玩家属性
                player: {
                    level: 1,
                    exp: 0,
                    maxExp: 100,
                    attack: 10,
                    defense: 5,
                    hp: 100,
                    maxHp: 100,
                    luck: 2,
                    // 装备栏
                    equipment: {
                        weapon: null,    // 武器
                        armor: null,     //  armor
                        helmet: null,    // 头盔
                        boots: null,     // 靴子
                        accessory: null  // 饰品
                    },
                    // 装备效果
                    equipmentEffects: {
                        attack: 0,
                        defense: 0,
                        hp: 0,
                        luck: 0
                    },
                    // 背包
                    inventory: [],
                    // 特殊技
                    skills: [
                        {
                            name: "强力攻击",
                            description: "造成2倍普通伤害",
                            energyCost: 20,
                            damageMultiplier: 2,
                            levelRequired: 1
                        },
                        {
                            name: "防御姿态",
                            description: "减少50%受到的伤害",
                            energyCost: 15,
                            defenseBonus: 0.5,
                            levelRequired: 10
                        },
                        {
                            name: "生命恢复",
                            description: "恢复20%最大生命值",
                            energyCost: 25,
                            healPercentage: 0.2,
                            levelRequired: 20
                        },
                        {
                            name: "幸运一击",
                            description: "有几率造成3倍伤害",
                            energyCost: 30,
                            criticalMultiplier: 3,
                            criticalChance: 0.7,
                            levelRequired: 30
                        }
                    ]
                },
                // 装备品质定义
                equipmentRarities: [
                    { name: "white", displayName: "白色", multiplier: 1, color: "text-gray-400" },
                    { name: "blue", displayName: "蓝色", multiplier: 1.5, color: "text-blue-400" },
                    { name: "purple", displayName: "紫色", multiplier: 2, color: "text-purple-400" },
                    { name: "gold", displayName: "黄金", multiplier: 2.5, color: "text-yellow-400" },
                    { name: "legendary", displayName: "传奇", multiplier: 3, color: "text-orange-400" }
                ],
                // 装备模板
                equipmentTemplates: [
                    {
                        type: "weapon",
                        baseStats: { attack: 5 },
                        namePrefixes: ["", "锋利的", "坚固的", "魔法的", "神圣的", "传奇的"],
                        nameSuffixes: ["剑", "长刀", "战斧", "长矛", "匕首", "大剑", "短剑", "弯刀", "战锤", "法杖", "弓箭", "弩箭"]
                    },
                    {
                        type: "armor",
                        baseStats: { defense: 3 },
                        namePrefixes: ["", "轻便的", "坚固的", "魔法的", "神圣的", "传奇的"],
                        nameSuffixes: ["护甲", "胸甲", "锁甲", "板甲", "皮甲", "鳞甲", "皮胸甲", "链甲", "布甲", "魔法护甲", "骑士甲", "巫师袍"]
                    },
                    {
                        type: "helmet",
                        baseStats: { defense: 2, hp: 10 },
                        namePrefixes: ["", "轻便的", "坚固的", "魔法的", "神圣的", "传奇的"],
                        nameSuffixes: ["头盔", "头冠", "兜帽", "面具", "战盔", "钢盔", "皮帽", "魔法帽", "骑士盔", "巫师帽", "头巾", "护额"]
                    },
                    {
                        type: "boots",
                        baseStats: { defense: 1, luck: 1 },
                        namePrefixes: ["", "轻便的", "坚固的", "魔法的", "神圣的", "传奇的"],
                        nameSuffixes: ["靴子", "战靴", "皮靴", "钢靴", "魔靴", "神靴", "长靴", "短靴", "雪地靴", "登山靴", "骑士靴", "巫师靴"]
                    },
                    {
                        type: "accessory",
                        baseStats: { luck: 2, hp: 5 },
                        namePrefixes: ["", "简单的", "精致的", "魔法的", "神圣的", "传奇的"],
                        nameSuffixes: ["戒指", "项链", "护符", "徽章", "耳环", "手镯", "脚链", "腰带", "披风", "手套", "护腕", "戒指"]
                    }
                ],
                // 装备掉落概率
                dropRates: {
                    white: 0.4,
                    blue: 0.3,
                    purple: 0.15,
                    gold: 0.1,
                    legendary: 0.05
                },
                // 资源系统
                resources: {
                    energy: 100,
                    maxEnergy: 100,
                    energyRate: 2,
                    wood: 0,
                    woodRate: 1,
                    iron: 0,
                    ironRate: 0.5,
                    crystal: 0,
                    crystalRate: 0.2
                },
                // 敌人类型
                enemyTypes: [
                    {
                        name: "雪原狼",
                        baseHp: 30,
                        baseAttack: 8,
                        baseDefense: 2,
                        expMultiplier: 1,
                        resourceMultiplier: 1,
                        icon: "fa-skull",
                        image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20snow%20wolf%2C%20cute%20style%2C%20winter%20theme%2C%20simple%20background&size=512x512"
                    },
                    {
                        name: "冰原熊",
                        baseHp: 60,
                        baseAttack: 12,
                        baseDefense: 4,
                        expMultiplier: 1.5,
                        resourceMultiplier: 1.2,
                        icon: "fa-paw",
                        image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20ice%20bear%2C%20cute%20style%2C%20winter%20theme%2C%20simple%20background&size=512x512"
                    },
                    {
                        name: "冰霜巨人",
                        baseHp: 100,
                        baseAttack: 18,
                        baseDefense: 6,
                        expMultiplier: 2,
                        resourceMultiplier: 1.5,
                        icon: "fa-user",
                        image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20frost%20giant%2C%20cute%20style%2C%20winter%20theme%2C%20simple%20background&size=512x512"
                    }
                ],
                // 当前敌人
                enemy: {
                    name: "雪原狼",
                    level: 1,
                    hp: 30,
                    maxHp: 30,
                    attack: 8,
                    defense: 2,
                    isElite: false,
                    eliteBonus: 0,
                    icon: "fa-skull",
                    image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20snow%20wolf%2C%20cute%20style%2C%20winter%20theme%2C%20simple%20background&size=512x512"
                },
                // 游戏设置
                settings: {
                    autoPlay: false,
                    autoBattle: false,
                    afkTime: 0,
                    collectedResources: 0
                },
                // 战斗状态
                battle: {
                    inBattle: false,
                    battleLog: []
                },
                // 商店系统
                shop: {
                    items: [
                        {
                            id: "health_potion",
                            name: "生命药水",
                            description: "恢复50%最大生命值",
                            price: 50,
                            type: "consumable",
                            effect: "heal",
                            value: 0.5
                        },
                        {
                            id: "energy_potion",
                            name: "能量药水",
                            description: "恢复满能量",
                            price: 30,
                            type: "consumable",
                            effect: "energy",
                            value: 1
                        },
                        {
                            id: "attack_potion",
                            name: "攻击药水",
                            description: "临时提升20%攻击力",
                            price: 40,
                            type: "consumable",
                            effect: "attack",
                            value: 0.2
                        },
                        {
                            id: "defense_potion",
                            name: "防御药水",
                            description: "临时提升20%防御力",
                            price: 40,
                            type: "consumable",
                            effect: "defense",
                            value: 0.2
                        },
                        {
                            id: "basic_sword",
                            name: "基础剑",
                            description: "基础攻击力+10",
                            price: 100,
                            type: "equipment",
                            equipmentType: "weapon",
                            stats: { attack: 10 },
                            level: 1
                        },
                        {
                            id: "basic_armor",
                            name: "基础护甲",
                            description: "基础防御力+8",
                            price: 80,
                            type: "equipment",
                            equipmentType: "armor",
                            stats: { defense: 8 },
                            level: 1
                        },
                        {
                            id: "basic_helmet",
                            name: "基础头盔",
                            description: "基础防御力+5，生命值+20",
                            price: 60,
                            type: "equipment",
                            equipmentType: "helmet",
                            stats: { defense: 5, hp: 20 },
                            level: 1
                        },
                        {
                            id: "basic_boots",
                            name: "基础靴子",
                            description: "基础防御力+3，幸运值+2",
                            price: 40,
                            type: "equipment",
                            equipmentType: "boots",
                            stats: { defense: 3, luck: 2 },
                            level: 1
                        }
                    ]
                }
            };
            
            // 重置UI
            document.getElementById('auto挂机').checked = false;
            document.getElementById('auto-battle-btn').innerHTML = '<i class="fa fa-play mr-1"></i> 自动战斗';
            
            // 停止所有计时器
            this.stopAutoBattle();
            this.stopAutoPlay();
            this.stopAfkTimer();
            
            // 清除本地存储
            localStorage.removeItem('endlessWinterGame');
            
            this.addBattleLog('游戏已重置！');
            this.updateUI();
        }
    }
    
    
    
 
    
    
    
    
    // 登出
    async logout() {
        try {
            // 保存当前用户的游戏状态到服务器
            if (this.gameState.user.loggedIn) {
                const currentUserId = this.gameState.user.userId;
                await this.saveToServer(currentUserId, this.gameState);
            }
            
            // 调用服务器端登出API
            const token = localStorage.getItem('endlessWinterToken');
            if (token) {
                await fetch('http://localhost:3001/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            
            // 清除localStorage中的token和用户信息
            localStorage.removeItem('endlessWinterToken');
            localStorage.removeItem('endlessWinterUser');
            
            // 立即重定向到登录页面，添加logout参数以触发强制清除
            // 使用 replace 方法避免浏览器历史记录问题
            setTimeout(() => {
                // 使用 replace 方法确保不会回到已登录状态，并添加logout参数
                window.location.replace('login.html?logout=true');
            }, 100);
        } catch (error) {
            console.error('登出错误:', error);
            // 即使出错，也要清除本地存储并重定向到登录页面
            localStorage.removeItem('endlessWinterToken');
            localStorage.removeItem('endlessWinterUser');
            window.location.replace('login.html?logout=true');
        }
    }
    
    // 注销用户
    async deleteAccount() {
        try {
            const username = this.gameState.user.username;
            
            // 创建密码输入模态框
            const modalHtml = `
                <div id="password-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div class="bg-dark border border-glass rounded-xl p-6 max-w-md w-full">
                        <h3 class="text-xl font-bold text-accent mb-4">确认注销账号</h3>
                        <p class="text-light mb-4">请输入密码以确认注销账号：</p>
                        <div class="mb-4">
                            <input type="password" id="delete-password" class="w-full bg-dark/50 border border-glass rounded-lg px-4 py-2 text-light focus:outline-none">
                        </div>
                        <div class="flex space-x-3">
                            <button id="cancel-delete" class="flex-1 bg-dark border border-glass rounded-lg px-4 py-2 text-light hover:bg-dark/80">取消</button>
                            <button id="confirm-delete" class="flex-1 bg-danger rounded-lg px-4 py-2 text-white hover:bg-danger/80">确认注销</button>
                        </div>
                    </div>
                </div>
            `;
            
            // 添加模态框到页面
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // 获取模态框元素
            const modal = document.getElementById('password-modal');
            const passwordInput = document.getElementById('delete-password');
            const cancelBtn = document.getElementById('cancel-delete');
            const confirmBtn = document.getElementById('confirm-delete');
            
            // 聚焦密码输入框
            passwordInput.focus();
            
            // 回车键确认
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                }
            });
            
            // 取消按钮点击事件
            cancelBtn.addEventListener('click', function() {
                modal.remove();
            });
            
            // 确认按钮点击事件
            confirmBtn.addEventListener('click', async function() {
                const password = passwordInput.value;
                
                if (!password) {
                    alert('请输入密码');
                    return;
                }
                
                const token = localStorage.getItem('endlessWinterToken');
                
                try {
                    const response = await fetch('http://localhost:3001/api/delete-account', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ username, password })
                    });
                    
                    const result = await response.json();
                    modal.remove();
                    
                    if (result.success) {
                        this.addBattleLog('账号注销成功！');
                        // 清除本地存储的token和用户信息
                        localStorage.removeItem('endlessWinterToken');
                        localStorage.removeItem('endlessWinterUser');
                        // 重定向到登录页面
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 2000);
                    } else {
                        this.addBattleLog(`注销失败：${result.error}`);
                    }
                } catch (error) {
                    console.error('注销用户失败:', error);
                    this.addBattleLog('注销用户失败，请稍后再试');
                    modal.remove();
                }
            }.bind(this));
        } catch (error) {
            console.error('注销用户失败:', error);
            this.addBattleLog('注销用户失败，请稍后再试');
        }
    }
    
    // 初始化新的游戏状态
    initNewGameState(username, gender) {
        // 保存用户信息
        const userInfo = { ...this.gameState.user };
        
        // 重置游戏状态
        this.gameState = {
            user: userInfo,
            player: {
                level: 1,
                exp: 0,
                maxExp: 100,
                attack: 10,
                defense: 5,
                hp: 100,
                maxHp: 100,
                luck: 2,
                equipment: {
                    weapon: null,
                    armor: null,
                    helmet: null,
                    boots: null,
                    accessory: null
                },
                equipmentEffects: {
                    attack: 0,
                    defense: 0,
                    hp: 0,
                    luck: 0
                },
                inventory: [],
                skills: [
                    {
                        name: "强力攻击",
                        description: "造成2倍普通伤害",
                        energyCost: 20,
                        damageMultiplier: 2,
                        levelRequired: 1
                    },
                    {
                        name: "防御姿态",
                        description: "减少50%受到的伤害",
                        energyCost: 15,
                        defenseBonus: 0.5,
                        levelRequired: 10
                    },
                    {
                        name: "生命恢复",
                        description: "恢复20%最大生命值",
                        energyCost: 25,
                        healPercentage: 0.2,
                        levelRequired: 20
                    },
                    {
                        name: "幸运一击",
                        description: "有几率造成3倍伤害",
                        energyCost: 30,
                        criticalMultiplier: 3,
                        criticalChance: 0.7,
                        levelRequired: 30
                    }
                ]
            },
            resources: {
                wood: 0,
                iron: 0,
                crystal: 0
            },
            sceneMonsters: [],
            battle: {
                inBattle: false,
                enemy: null,
                battleLog: []
            },
            map: {
                currentBackground: 'forest',
                currentLocation: 'forest'
            }
        };
    }
    
    // 计算装备效果
    calculateEquipmentEffects() {
        // 重置装备效果
        this.gameState.player.equipmentEffects = {
            attack: 0,
            defense: 0,
            hp: 0,
            luck: 0
        };
        
        // 遍历所有装备
        for (const slot in this.gameState.player.equipment) {
            const item = this.gameState.player.equipment[slot];
            if (item) {
                // 计算精炼加成（每级精炼增加10%属性）
                const refineBonus = (item.refineLevel || 0) * 0.1;
                
                // 添加装备属性（包括精炼加成）
                for (const stat in item.stats) {
                    if (this.gameState.player.equipmentEffects[stat] !== undefined) {
                        const baseValue = item.stats[stat];
                        const refinedValue = Math.floor(baseValue * (1 + refineBonus));
                        this.gameState.player.equipmentEffects[stat] += refinedValue;
                    }
                }
            }
        }
    }
    
    // 显示装备菜单
    showEquipMenu() {
        // 确保背包存在
        if (!this.gameState.player.inventory) {
            this.gameState.player.inventory = [];
        }
        
        // 过滤背包中可用的装备（玩家等级 >= 装备等级）
        const availableEquipment = this.gameState.player.inventory.filter(
            item => item.level <= this.gameState.player.level
        );
        
        if (availableEquipment.length === 0) {
            this.addBattleLog('背包中没有可用的装备！');
            return;
        }
        
        // 创建装备选择菜单
        const itemList = availableEquipment.map((item, index) => 
            `${index + 1}. ${item.name} (${item.type}) - 等级: ${item.level} - ${this.getStatsDescription(item.stats)}`
        ).join('\n');
        
        const choice = prompt(`请选择要装备的物品:\n${itemList}\n\n输入物品编号:`);
        
        if (choice) {
            const index = parseInt(choice) - 1;
            if (index >= 0 && index < availableEquipment.length) {
                const selectedItem = availableEquipment[index];
                // 从背包中移除装备
                const inventoryIndex = this.gameState.player.inventory.indexOf(selectedItem);
                if (inventoryIndex > -1) {
                    this.gameState.player.inventory.splice(inventoryIndex, 1);
                }
                // 装备物品
                this.equipItem(selectedItem);
            }
        }
    }
    
    // 显示卸下装备菜单
    showUnequipMenu() {
        // 获取已装备的物品
        const equippedItems = [];
        for (const slot in this.gameState.player.equipment) {
            const item = this.gameState.player.equipment[slot];
            if (item) {
                equippedItems.push({ ...item, slot });
            }
        }
        
        if (equippedItems.length === 0) {
            this.addBattleLog('没有已装备的物品！');
            return;
        }
        
        // 创建卸下装备选择菜单
        const itemList = equippedItems.map((item, index) => 
            `${index + 1}. ${item.name} (${item.slot}) - ${this.getStatsDescription(item.stats)}`
        ).join('\n');
        
        const choice = prompt(`请选择要卸下的物品:\n${itemList}\n\n输入物品编号:`);
        
        if (choice) {
            const index = parseInt(choice) - 1;
            if (index >= 0 && index < equippedItems.length) {
                this.unequipItem(equippedItems[index].slot);
            }
        }
    }
    
    // 装备物品
    equipItem(item) {
        // 检查是否已有同类型装备
        const existingItem = this.gameState.player.equipment[item.type];
        
        // 装备新物品
        this.gameState.player.equipment[item.type] = item;
        
        // 如果有旧装备，将其放回背包
        if (existingItem) {
            // 确保背包存在
            if (!this.gameState.player.inventory) {
                this.gameState.player.inventory = [];
            }
            // 将旧装备放回背包
            this.gameState.player.inventory.push(existingItem);
        }
        
        // 计算装备效果
        this.calculateEquipmentEffects();
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        this.updateHealthBars();
        
        // 添加日志
        if (existingItem) {
            this.addBattleLog(`卸下了 ${existingItem.name}，装备了 ${item.name}！`);
        } else {
            this.addBattleLog(`装备了 ${item.name}！`);
        }
    }
    
    // 卸下物品
    unequipItem(slot) {
        const item = this.gameState.player.equipment[slot];
        if (item) {
            // 卸下物品
            this.gameState.player.equipment[slot] = null;
            
            // 将卸下的装备放回背包
            this.gameState.player.inventory.push(item);
            
            // 计算装备效果
            this.calculateEquipmentEffects();
            
            // 更新UI
            this.updateUI();
            
            // 添加日志
            this.addBattleLog(`卸下了 ${item.name}，已放回背包！`);
        }
    }
    
    // 比较装备好坏
    compareEquipment(newItem, currentItem) {
        if (!currentItem) {
            // 当前没有装备，新装备更好
            return true;
        }
        
        // 计算装备评分
        const calculateScore = (item) => {
            let score = 0;
            if (item.stats) {
                // 权重设置
                const weights = {
                    attack: 2,     // 攻击权重最高
                    defense: 1.5,  // 防御次之
                    hp: 0.5,       // 生命值次之
                    luck: 1        // 幸运值
                };
                
                for (const stat in item.stats) {
                    if (weights[stat]) {
                        score += item.stats[stat] * weights[stat];
                    }
                }
            }
            // 考虑装备品质加成
            if (item.rarityMultiplier) {
                score *= item.rarityMultiplier;
            }
            return score;
        };
        
        const newScore = calculateScore(newItem);
        const currentScore = calculateScore(currentItem);
        
        return newScore > currentScore;
    }
    
    // 检查并自动穿戴更好的装备
    checkAndEquipBetterGear(item) {
        // 检查物品是否是装备
        if (!item || item.type === 'consumable') {
            return false;
        }
        
        // 检查当前是否有同类型装备
        const currentItem = this.gameState.player.equipment[item.type];
        
        // 比较装备好坏
        if (this.compareEquipment(item, currentItem)) {
            // 从背包中移除新装备
            const inventoryIndex = this.gameState.player.inventory.indexOf(item);
            if (inventoryIndex > -1) {
                this.gameState.player.inventory.splice(inventoryIndex, 1);
            }
            
            // 装备新物品
            this.equipItem(item);
            
            return true;
        }
        
        return false;
    }
    
    // 购买商店物品
    buyShopItem(itemId) {
        const item = this.gameState.shop.items.find(item => item.id === itemId);
        
        if (!item) {
            this.addBattleLog('无效的商品！');
            return;
        }
        
        // 检查木材是否足够
        if (this.gameState.resources.wood < item.price) {
            this.addBattleLog(`木材不足，无法购买 ${item.name}！`);
            return;
        }
        
        // 扣除木材
        this.gameState.resources.wood -= item.price;
        
        if (item.type === 'consumable') {
            // 药水类物品放入背包
            this.gameState.player.inventory.push(item);
            this.addBattleLog(`购买了 ${item.name}，已放入背包！`);
        } else if (item.type === 'equipment') {
            // 装备类物品放入背包
            // 创建装备对象
            const equipment = {
                id: item.id,
                name: item.name,
                type: item.equipmentType,
                equipmentType: item.equipmentType,
                level: item.level,
                stats: item.stats,
                description: item.description,
                rarity: 'white',
                rarityDisplayName: '白色',
                rarityMultiplier: 1,
                colorClass: 'text-gray-400'
            };
            
            // 检查并自动穿戴更好的装备
            const equipped = this.checkAndEquipBetterGear(equipment);
            if (!equipped) {
                this.gameState.player.inventory.push(equipment);
                this.addBattleLog(`购买了 ${item.name}，已放入背包！`);
            } else {
                this.addBattleLog(`购买了 ${item.name}，属性更好，已自动装备！`);
            }
        }
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        this.updateHealthBars();
    }
    
    // 重置临时状态
    resetTemporaryStats() {
        // 重置临时攻击和防御状态
        if (this.gameState.player) {
            // 移除临时状态属性
            delete this.gameState.player.baseAttack;
            delete this.gameState.player.baseDefense;
            delete this.gameState.player.tempAttack;
            delete this.gameState.player.tempDefense;
            delete this.gameState.player.tempAttackExpires;
            delete this.gameState.player.tempDefenseExpires;
        }
    }

    // 检查临时状态是否过期
    checkTemporaryStats() {
        if (!this.gameState.player) return;
        
        const now = Date.now();
        
        // 检查攻击药水效果
        if (this.gameState.player.tempAttackExpires) {
            const attackExpires = this.gameState.player.tempAttackExpires;
            if (now > attackExpires) {
                // 攻击药水效果已过期
                if (this.gameState.player.baseAttack) {
                    this.gameState.player.attack = this.gameState.player.baseAttack;
                }
                delete this.gameState.player.baseAttack;
                delete this.gameState.player.tempAttack;
                delete this.gameState.player.tempAttackExpires;
            } else {
                // 攻击药水效果仍然有效，重新设置计时器
                const remainingTime = attackExpires - now;
                setTimeout(() => {
                    if (this.gameState.player && this.gameState.player.baseAttack) {
                        this.gameState.player.attack = this.gameState.player.baseAttack;
                        this.gameState.player.tempAttack = null;
                        this.gameState.player.tempAttackExpires = null;
                        this.addBattleLog('攻击药水的效果消失了！');
                        this.updateUI();
                    }
                }, remainingTime);
            }
        }
        
        // 检查防御药水效果
        if (this.gameState.player.tempDefenseExpires) {
            const defenseExpires = this.gameState.player.tempDefenseExpires;
            if (now > defenseExpires) {
                // 防御药水效果已过期
                if (this.gameState.player.baseDefense) {
                    this.gameState.player.defense = this.gameState.player.baseDefense;
                }
                delete this.gameState.player.baseDefense;
                delete this.gameState.player.tempDefense;
                delete this.gameState.player.tempDefenseExpires;
            } else {
                // 防御药水效果仍然有效，重新设置计时器
                const remainingTime = defenseExpires - now;
                setTimeout(() => {
                    if (this.gameState.player && this.gameState.player.baseDefense) {
                        this.gameState.player.defense = this.gameState.player.baseDefense;
                        this.gameState.player.tempDefense = null;
                        this.gameState.player.tempDefenseExpires = null;
                        this.addBattleLog('防御药水的效果消失了！');
                        this.updateUI();
                    }
                }, remainingTime);
            }
        }
    }

    // 使用消耗品
    useConsumable(item) {
        switch (item.effect) {
            case 'heal':
                // 恢复生命值
                const healAmount = Math.floor(this.gameState.player.maxHp * item.value);
                this.gameState.player.hp = Math.min(this.gameState.player.hp + healAmount, this.gameState.player.maxHp);
                this.addBattleLog(`使用了 ${item.name}，恢复了 ${healAmount} 点生命值！`);
                break;
            case 'energy':
                // 恢复能量
                this.gameState.player.energy = this.gameState.player.maxEnergy;
                this.addBattleLog(`使用了 ${item.name}，能量恢复满了！`);
                break;
            case 'attack':
                // 临时提升攻击力
                if (!this.gameState.player.baseAttack) {
                    this.gameState.player.baseAttack = this.gameState.player.attack;
                }
                const attackMultiplier = 1 + item.value;
                this.gameState.player.attack = this.gameState.player.baseAttack * attackMultiplier;
                this.gameState.player.tempAttack = this.gameState.player.attack;
                this.gameState.player.tempAttackExpires = Date.now() + 30000; // 30秒后过期
                this.addBattleLog(`使用了 ${item.name}，攻击力提升了 ${item.value * 100}%，持续30秒！`);
                // 30秒后效果消失
                setTimeout(() => {
                    if (this.gameState.player.baseAttack) {
                        this.gameState.player.attack = this.gameState.player.baseAttack;
                        this.gameState.player.tempAttack = null;
                        this.gameState.player.tempAttackExpires = null;
                    }
                    this.addBattleLog(`${item.name}的效果消失了！`);
                    this.updateUI();
                }, 30000);
                break;
            case 'defense':
                // 临时提升防御力
                if (!this.gameState.player.baseDefense) {
                    this.gameState.player.baseDefense = this.gameState.player.defense;
                }
                const defenseMultiplier = 1 + item.value;
                this.gameState.player.defense = this.gameState.player.baseDefense * defenseMultiplier;
                this.gameState.player.tempDefense = this.gameState.player.defense;
                this.gameState.player.tempDefenseExpires = Date.now() + 30000; // 30秒后过期
                this.addBattleLog(`使用了 ${item.name}，防御力提升了 ${item.value * 100}%，持续30秒！`);
                // 30秒后效果消失
                setTimeout(() => {
                    if (this.gameState.player.baseDefense) {
                        this.gameState.player.defense = this.gameState.player.baseDefense;
                        this.gameState.player.tempDefense = null;
                        this.gameState.player.tempDefenseExpires = null;
                    }
                    this.addBattleLog(`${item.name}的效果消失了！`);
                    this.updateUI();
                }, 30000);
                break;
        }
    }
    
    // 使用药水
    usePotion() {
        // 过滤背包中的药水
        const potions = this.gameState.player.inventory.filter(
            item => item.type === 'consumable'
        );
        
        if (potions.length === 0) {
            this.addBattleLog('背包中没有药水！');
            return;
        }
        
        // 创建药水选择菜单
        const potionList = potions.map((potion, index) => 
            `${index + 1}. ${potion.name} - ${potion.description}`
        ).join('\n');
        
        const choice = prompt(`选择要使用的药水:\n${potionList}\n\n输入编号使用，0 取消:`);
        
        if (choice === '0') {
            return;
        }
        
        if (choice) {
            const index = parseInt(choice) - 1;
            if (index >= 0 && index < potions.length) {
                const selectedPotion = potions[index];
                // 从背包中移除药水
                const inventoryIndex = this.gameState.player.inventory.indexOf(selectedPotion);
                if (inventoryIndex > -1) {
                    this.gameState.player.inventory.splice(inventoryIndex, 1);
                }
                // 使用药水
                this.useConsumable(selectedPotion);
                // 更新UI
                this.updateUI();
            }
        }
    }
    
    // 显示背包
    showInventory() {
        try {
            // 确保背包存在
            if (!this.gameState.player.inventory) {
                this.gameState.player.inventory = [];
            }
            
            const inventory = this.gameState.player.inventory;
            const inventoryModal = document.getElementById('inventory-modal');
            const inventoryEquipment = document.getElementById('inventory-equipment');
            const inventoryConsumables = document.getElementById('inventory-consumables');
            
            // 清空物品列表
            inventoryEquipment.innerHTML = '';
            inventoryConsumables.innerHTML = '';
            
            if (inventory.length === 0) {
                // 显示空背包消息
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'col-span-full text-center py-16 text-light/70';
                emptyMessage.textContent = '背包是空的！';
                inventoryEquipment.appendChild(emptyMessage);
            } else {
                // 分类物品
                const equipmentItems = inventory.filter(item => item.type !== 'consumable');
                const consumableItems = inventory.filter(item => item.type === 'consumable');
                
                // 创建装备物品格子
                if (equipmentItems.length === 0) {
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'col-span-full text-center py-16 text-light/70';
                    emptyMessage.textContent = '没有装备！';
                    inventoryEquipment.appendChild(emptyMessage);
                } else {
                    equipmentItems.forEach((item, index) => {
                        // 找到原始索引
                        const originalIndex = inventory.indexOf(item);
                        this.createItemElement(item, originalIndex, inventoryEquipment);
                    });
                }
                
                // 创建消耗品物品格子
                if (consumableItems.length === 0) {
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'col-span-full text-center py-16 text-light/70';
                    emptyMessage.textContent = '没有消耗品！';
                    inventoryConsumables.appendChild(emptyMessage);
                } else {
                    consumableItems.forEach((item, index) => {
                        // 找到原始索引
                        const originalIndex = inventory.indexOf(item);
                        this.createItemElement(item, originalIndex, inventoryConsumables);
                    });
                }
            }
            
            // 绑定Tab切换事件
            document.getElementById('tab-equipment').onclick = () => {
                // 切换到装备Tab
                document.getElementById('tab-equipment').classList.add('text-accent', 'border-accent');
                document.getElementById('tab-equipment').classList.remove('text-light/60');
                document.getElementById('tab-consumables').classList.add('text-light/60');
                document.getElementById('tab-consumables').classList.remove('text-accent', 'border-accent');
                
                // 显示装备区域，隐藏消耗品区域
                document.getElementById('inventory-equipment').classList.remove('hidden');
                document.getElementById('inventory-consumables').classList.add('hidden');
            };
            
            document.getElementById('tab-consumables').onclick = () => {
                // 切换到消耗品Tab
                document.getElementById('tab-consumables').classList.add('text-accent', 'border-accent');
                document.getElementById('tab-consumables').classList.remove('text-light/60');
                document.getElementById('tab-equipment').classList.add('text-light/60');
                document.getElementById('tab-equipment').classList.remove('text-accent', 'border-accent');
                
                // 显示消耗品区域，隐藏装备区域
                document.getElementById('inventory-consumables').classList.remove('hidden');
                document.getElementById('inventory-equipment').classList.add('hidden');
            };
            
            // 显示模态框
            inventoryModal.classList.remove('hidden');
            
            // 初始化合成界面
            this.initCraftInterface();
            
            // 绑定清空按钮事件
            document.getElementById('clear-craft').onclick = () => {
                this.initCraftInterface();
            };
            
            // 绑定合成按钮事件
            document.getElementById('confirm-craft').onclick = () => {
                this.performCraft();
            };
            
            // 绑定一键合成按钮事件
            document.getElementById('auto-craft').onclick = () => {
                this.autoCraft();
            };
            
            // 绑定关闭按钮事件
            document.getElementById('close-inventory').addEventListener('click', () => {
                inventoryModal.classList.add('hidden');
            });
            
            // 点击模态框外部关闭
            inventoryModal.addEventListener('click', (e) => {
                if (e.target === inventoryModal) {
                    inventoryModal.classList.add('hidden');
                }
            });
        } catch (error) {
            console.error('显示背包失败:', error);
        }
    }
    
    // 创建物品元素
    createItemElement(item, index, container) {
        const itemElement = document.createElement('div');
        itemElement.className = 'bg-dark/30 rounded p-0.5 hover:bg-dark/40 transition-colors border border-dark/50 shadow-sm cursor-pointer aspect-square flex flex-col items-center justify-center';
        itemElement.dataset.index = index;
        
        // 物品图标（使用字体图标作为占位符）
        let itemIcon = 'fa-box';
        if (item.type === 'consumable') {
            itemIcon = 'fa-potion';
        } else if (item.type === 'weapon') {
            itemIcon = 'fa-sword';
        } else if (item.type === 'armor') {
            itemIcon = 'fa-shield';
        } else if (item.type === 'helmet') {
            itemIcon = 'fa-hat-wizard';
        } else if (item.type === 'boots') {
            itemIcon = 'fa-boot';
        } else if (item.type === 'accessory') {
            itemIcon = 'fa-gem';
        }
        
        // 物品品质颜色
        let rarityColor = item.colorClass || 'text-white';
        // 如果没有colorClass，则根据rarity属性判断
        if (!item.colorClass) {
            const rarity = item.rarityDisplayName || item.rarity;
            if (rarity === '传奇' || rarity === 'legendary') {
                rarityColor = 'text-yellow-500';
            } else if (rarity === '金色' || rarity === 'gold') {
                rarityColor = 'text-yellow-400';
            } else if (rarity === '紫色' || rarity === 'purple') {
                rarityColor = 'text-purple-400';
            } else if (rarity === '蓝色' || rarity === 'blue') {
                rarityColor = 'text-blue-400';
            }
        }
        
        itemElement.innerHTML = `
            <div class="text-xs ${rarityColor} mb-0.5">
                <i class="fa ${itemIcon}"></i>
            </div>
            <div class="text-[8px] text-center ${rarityColor} truncate w-full">
                ${item.name}
            </div>
        `;
        
        // 绑定鼠标悬停事件
        itemElement.addEventListener('mouseenter', (e) => {
            // 创建提示框
            const tooltip = document.createElement('div');
            tooltip.className = 'absolute z-50 bg-dark/90 border border-accent/50 rounded p-2 text-xs text-white shadow-lg';
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
            tooltip.style.pointerEvents = 'none';
            tooltip.id = 'item-tooltip';
            
            // 生成物品信息
            let info = `<div class="font-bold mb-1">${item.name}</div>`;
            if (item.type === 'consumable') {
                info += `类型: 消耗品<br>`;
                info += `描述: ${item.description || '无描述'}`;
            } else {
                info += `类型: 装备 (${item.type})<br>`;
                info += `等级: ${item.level || 1}<br>`;
                if (item.stats) {
                    info += `属性: ${this.getStatsDescription(item.stats)}<br>`;
                } else {
                    info += `属性: 无<br>`;
                }
                info += `品质: ${item.rarityDisplayName || '普通'}`;
            }
            tooltip.innerHTML = info;
            
            // 添加到文档
            document.body.appendChild(tooltip);
        });
        
        // 绑定鼠标离开事件
        itemElement.addEventListener('mouseleave', () => {
            // 移除提示框
            const tooltip = document.getElementById('item-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
        
        // 绑定鼠标移动事件
        itemElement.addEventListener('mousemove', (e) => {
            // 更新提示框位置
            const tooltip = document.getElementById('item-tooltip');
            if (tooltip) {
                tooltip.style.left = `${e.pageX + 10}px`;
                tooltip.style.top = `${e.pageY + 10}px`;
            }
        });
        
        // 绑定拖拽事件
        itemElement.draggable = true;
        itemElement.addEventListener('dragstart', (e) => {
            const index = itemElement.dataset.index;
            e.dataTransfer.setData('text/plain', index);
        });
        
        // 绑定左键点击事件
        itemElement.addEventListener('click', (e) => {
            // 检查是否是拖拽操作
            if (e.defaultPrevented) {
                return; // 如果是拖拽操作，不执行点击事件
            }
            
            e.stopPropagation(); // 阻止事件冒泡
            
            const inventory = this.gameState.player.inventory;
            
            if (item.type === 'consumable') {
                // 消耗品直接使用
                inventory.splice(index, 1);
                this.useConsumable(item);
                this.updateUI();
                this.showInventory();
            } else {
                // 显示操作菜单
                const contextMenu = document.getElementById('context-menu');
                
                // 计算鼠标位置，确保菜单在可视区域内
                let left = e.clientX;
                let top = e.clientY;
                
                // 获取菜单尺寸
                const menuWidth = contextMenu.offsetWidth;
                const menuHeight = contextMenu.offsetHeight;
                
                // 检查是否会超出屏幕右侧
                if (left + menuWidth > window.innerWidth) {
                    left = window.innerWidth - menuWidth - 10;
                }
                
                // 检查是否会超出屏幕底部
                if (top + menuHeight > window.innerHeight) {
                    top = window.innerHeight - menuHeight - 10;
                }
                
                // 设置菜单位置
                contextMenu.style.left = `${left}px`;
                contextMenu.style.top = `${top}px`;
                contextMenu.style.position = 'fixed';
                contextMenu.style.zIndex = '9999';
                contextMenu.classList.remove('hidden');
                
                // 绑定菜单选项点击事件
                document.getElementById('context-use').onclick = () => {
                    // 使用/装备
                    const equippedItem = this.gameState.player.equipment[item.type];
                    inventory.splice(index, 1);
                    this.equipItem(item);
                    this.updateUI();
                    this.showInventory();
                    contextMenu.classList.add('hidden');
                };
                
                document.getElementById('context-disassemble').onclick = () => {
                    // 分解
                    const returns = this.calculateDisassembleReturns(item);
                    const itemName = item.name || '未知装备';
                    const woodAmount = returns.wood || 0;
                    const ironAmount = returns.iron || 0;
                    const crystalAmount = returns.crystal || 0;
                    
                    const confirmDisassemble = confirm(`分解 ${itemName} 将会获得：\n木材: ${woodAmount}\n铁矿: ${ironAmount}\n水晶: ${crystalAmount}\n\n确定分解吗？`);
                    
                    if (confirmDisassemble) {
                        inventory.splice(index, 1);
                        this.gameState.resources.wood += woodAmount;
                        this.gameState.resources.iron += ironAmount;
                        this.gameState.resources.crystal += crystalAmount;
                        this.addBattleLog(`分解 ${itemName} 获得了 ${woodAmount} 木材, ${ironAmount} 铁矿, ${crystalAmount} 水晶！`);
                        this.updateUI();
                        this.showInventory();
                    }
                    contextMenu.classList.add('hidden');
                };
                
                document.getElementById('context-drop').onclick = () => {
                    // 丢弃
                    const confirmDrop = confirm(`确定要丢弃 ${item.name} 吗？`);
                    if (confirmDrop) {
                        inventory.splice(index, 1);
                        this.addBattleLog(`已丢弃 ${item.name}！`);
                        this.updateUI();
                        this.showInventory();
                    }
                    contextMenu.classList.add('hidden');
                };
            }
        });
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', (e) => {
            const contextMenu = document.getElementById('context-menu');
            if (contextMenu && !contextMenu.contains(e.target)) {
                contextMenu.classList.add('hidden');
            }
        });
        
        container.appendChild(itemElement);
    }
    
    // 获取属性描述
    getStatsDescription(stats) {
        const statDescriptions = [];
        for (const stat in stats) {
            let statName = stat;
            switch (stat) {
                case 'attack': statName = '攻击'; break;
                case 'defense': statName = '防御'; break;
                case 'hp': statName = '生命'; break;
                case 'luck': statName = '幸运'; break;
            }
            statDescriptions.push(`${statName}+${stats[stat]}`);
        }
        return statDescriptions.join(', ');
    }
    
    // 初始化tooltip
    initTooltips() {
        // 移除所有现有的tooltip
        document.querySelectorAll('.custom-tooltip').forEach(tooltip => {
            tooltip.remove();
        });
        
        // 找到所有带有data-tooltip属性的元素
        const elements = document.querySelectorAll('[data-tooltip]');
        
        elements.forEach(element => {
            // 检查元素是否已经有tooltip事件监听器
            if (element._hasTooltipListeners) {
                return; // 跳过已添加监听器的元素
            }
            
            // 标记元素已添加tooltip监听器
            element._hasTooltipListeners = true;
            
            // 添加鼠标悬停事件
            element.addEventListener('mouseenter', (e) => {
                const tooltipText = element.getAttribute('data-tooltip');
                if (!tooltipText) return;
                
                // 检查元素是否已经有一个tooltip元素存在
                if (element._tooltip) {
                    return; // 跳过已存在tooltip的元素
                }
                
                // 创建tooltip元素
                const tooltip = document.createElement('div');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = tooltipText;
                
                // 设置tooltip样式
                tooltip.style.position = 'fixed';
                tooltip.style.backgroundColor = 'rgba(30, 41, 59, 0.9)';
                tooltip.style.color = '#f1f5f9';
                tooltip.style.padding = '6px 10px';
                tooltip.style.borderRadius = '6px';
                tooltip.style.fontSize = '12px';
                tooltip.style.whiteSpace = 'nowrap';
                tooltip.style.zIndex = '9999';
                tooltip.style.border = '1px solid rgba(96, 165, 250, 0.5)';
                tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                tooltip.style.pointerEvents = 'none';
                
                // 计算tooltip位置
                const rect = element.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top - 30}px`;
                tooltip.style.transform = 'translateX(-50%)';
                
                // 添加到文档
                document.body.appendChild(tooltip);
                
                // 存储tooltip引用
                element._tooltip = tooltip;
            });
            
            // 添加鼠标离开事件
            element.addEventListener('mouseleave', () => {
                if (element._tooltip) {
                    element._tooltip.remove();
                    delete element._tooltip;
                }
            });
            
            // 添加鼠标移动事件，使tooltip跟随鼠标
            element.addEventListener('mousemove', (e) => {
                if (element._tooltip) {
                    element._tooltip.style.left = `${e.clientX}px`;
                    element._tooltip.style.top = `${e.clientY - 20}px`;
                    element._tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
                }
            });
        });
    }
};

// 检查Babylon.js是否加载完成
function checkBabylonJsLoaded() {
    if (typeof BABYLON !== 'undefined') {
        window.game = new EndlessWinterGame();
    } else {
        setTimeout(checkBabylonJsLoaded, 100);
    }
}

// 初始化游戏
window.onload = function() {
    checkBabylonJsLoaded();
};