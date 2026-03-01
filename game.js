// 游戏核心数据结构和状态管理
class EndlessWinterGame {
    constructor() {
        // 游戏状态 - 只初始化基本结构
        this.gameState = {
            // 用户信息
            user: [],
            // 玩家属性 - 留空，由登录获取或创建新用户时初始化
            player: {},
            // 资源系统 - 留空，由登录获取或创建新用户时初始化
            resources: {},
            // 游戏设置 - 留空，由登录获取或创建新用户时从metadata初始化
            settings: {},
            // 战斗状态
            battle: {
                inBattle: false,
                battleLog: []
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
    }
    
    // 登录成功后初始化游戏
    initAfterLogin() {
        // 登录和加载完成后继续初始化
        this.preloadImages();
        
        // 加载纹理（提前加载，确保3D场景初始化时纹理已准备好）
        this.loadTextures();
        
        // 确保所有装备都有refineLevel属性
        for (const slot in this.gameState.player.equipment) {
            const item = this.gameState.player.equipment[slot];
            if (item && item.refineLevel === undefined) {
                item.refineLevel = 0;
            }
        }
        
        // 延迟执行需要map.js的方法
        setTimeout(() => {
            // 只有在没有保存的场景怪物数据时才生成新的
            if (typeof this.generateMiniMap === 'function') {
                this.generateMiniMap();
            }
            
            // 初始化3D战斗场景
            if (typeof this.initMap3DScene === 'function') {
                this.initMap3DScene();
            }
            
            // 更新 UI 和绑定事件
            this.updateMapBackgroundUI(); // 设置初始地图背景
            this.updateCharacterBodyImage();
            this.updateUI();
            this.updateAdminControls(); // 根据用户角色更新管理控制按钮
            this.bindEvents();
            // 开始资源生成
            this.startResourceGeneration();
        }, 100);
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
                this.playerMetadata = metadata.player;
            }
            if (metadata.resources && metadata.resources.types) {
                // 保存资源元数据供后续使用
                this.resourceMetadata = metadata.resources;
            }
            
            // 加载境界系统配置
            if (metadata.realmConfig) {
                this.realmConfig = metadata.realmConfig;
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
        const playerLevel = this.calculateTotalLevel();
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
                    
                    // 显示登录成功消息
                    this.addBattleLog(`登录成功！欢迎回来，${userInfo.username}！`);
                    
                    // 登录成功后初始化游戏
                    this.initAfterLogin();
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
                spiritWood: 0,
                spiritWoodRate: 1,
                blackIron: 0,
                blackIronRate: 0.5,
                spiritCrystal: 0,
                spiritCrystalRate: 0.2
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
        const spiritWoodElement = document.getElementById('spiritWood');
        if (spiritWoodElement) {
            spiritWoodElement.textContent = Math.floor(this.gameState.resources.spiritWood || 0);
        }
        const spiritWoodRateElement = document.getElementById('spiritWood-rate');
        if (spiritWoodRateElement) {
            spiritWoodRateElement.textContent = `+${this.gameState.resources.spiritWoodRate || 0}/秒`;
        }
        const blackIronElement = document.getElementById('blackIron');
        if (blackIronElement) {
            blackIronElement.textContent = Math.floor(this.gameState.resources.blackIron || 0);
        }
        const blackIronRateElement = document.getElementById('blackIron-rate');
        if (blackIronRateElement) {
            blackIronRateElement.textContent = `+${this.gameState.resources.blackIronRate || 0}/秒`;
        }
        const spiritCrystalElement = document.getElementById('spiritCrystal');
        if (spiritCrystalElement) {
            spiritCrystalElement.textContent = Math.floor(this.gameState.resources.spiritCrystal || 0);
        }
        const spiritCrystalRateElement = document.getElementById('spiritCrystal-rate');
        if (spiritCrystalRateElement) {
            spiritCrystalRateElement.textContent = `+${this.gameState.resources.spiritCrystalRate || 0}/秒`;
        }
        
        // 计算装备效果
        this.calculateEquipmentEffects();
        
        // 计算境界加成
        let realmBonus = { attack: 0, defense: 0, hp: 0, luck: 0 };
        if (this.realmConfig) {
            realmBonus = this.calculateRealmBonus();
        }
        
        // 计算最终属性（基础属性 + 装备效果 + 境界加成）
        const finalAttack = this.gameState.player.attack + this.gameState.player.equipmentEffects.attack + realmBonus.attack;
        const finalDefense = this.gameState.player.defense + this.gameState.player.equipmentEffects.defense + realmBonus.defense;
        const finalHp = this.gameState.player.hp + this.gameState.player.equipmentEffects.hp + realmBonus.hp;
        const finalLuck = this.gameState.player.luck + this.gameState.player.equipmentEffects.luck + realmBonus.luck;
        const finalSpeed = this.gameState.player.speed + (this.gameState.player.equipmentEffects.speed || 0) + (realmBonus.speed || 0);
        
        // 更新玩家属性显示
            const levelElement = document.getElementById('level');
            if (levelElement) {
                if (this.realmConfig) {
                    const realm = this.gameState.player.realm;
                    const realmName = this.realmConfig[realm.currentRealm].name;
                    const stageConfig = this.realmConfig[realm.currentRealm].stages[realm.currentStage - 1];
                    const stageName = stageConfig.name;
                    levelElement.textContent = `${realmName} ${stageName} ${realm.currentStage}阶 ${realm.currentLevel}级`;
                } else {
                    levelElement.textContent = this.calculateTotalLevel();
                }
            }
            const expElement = document.getElementById('exp');
            if (expElement) {
                expElement.textContent = this.gameState.player.exp;
            }
            const maxExpElement = document.getElementById('max-exp');
            if (maxExpElement) {
                maxExpElement.textContent = this.gameState.player.maxExp;
            }
            // 更新经验条
            const expBarElement = document.getElementById('exp-bar');
            if (expBarElement) {
                const expPercentage = (this.gameState.player.exp / this.gameState.player.maxExp) * 100;
                expBarElement.style.width = `${Math.min(expPercentage, 100)}%`;
            }
            // 更新突破石显示
            const breakthroughStonesElement = document.getElementById('breakthrough-stones');
            if (breakthroughStonesElement) {
                breakthroughStonesElement.textContent = `突破石: ${this.gameState.resources.breakthroughStones || 0}`;
            }
            // 更新突破按钮状态
            const breakthroughBtnElement = document.getElementById('breakthrough-btn');
            if (breakthroughBtnElement && this.realmConfig) {
                const realm = this.gameState.player.realm;
                const currentStageConfig = this.realmConfig[realm.currentRealm].stages[realm.currentStage - 1];
                const requiredStones = currentStageConfig.breakthroughStones;
                const hasEnoughLevel = realm.currentLevel >= currentStageConfig.levelCap;
                const hasEnoughStones = (this.gameState.resources.breakthroughStones || 0) >= requiredStones;
                
                if (hasEnoughLevel && hasEnoughStones) {
                    breakthroughBtnElement.disabled = false;
                    breakthroughBtnElement.setAttribute('data-tooltip', `突破到下一级需要${requiredStones}个突破石`);
                } else {
                    breakthroughBtnElement.disabled = true;
                    if (!hasEnoughLevel) {
                        breakthroughBtnElement.setAttribute('data-tooltip', `需要达到${currentStageConfig.levelCap}级才能突破`);
                    } else {
                        breakthroughBtnElement.setAttribute('data-tooltip', `需要${requiredStones}个突破石才能突破`);
                    }
                }
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
                const maxHp = this.gameState.player.maxHp + this.gameState.player.equipmentEffects.hp + realmBonus.hp;
                hpElement.textContent = `${Math.floor(finalHp)}/${Math.floor(maxHp)}`;
                // 更新生命值恢复提示（每秒钟恢复1%最大生命值）
                hpElement.setAttribute('data-tooltip', `生命值恢复: +${Math.floor(maxHp * 0.01)}/秒`);
            }
            const luckElement = document.getElementById('luck');
            if (luckElement) {
                luckElement.textContent = finalLuck;
            }
            const speedElement = document.getElementById('speed');
            if (speedElement) {
                speedElement.textContent = Math.floor(finalSpeed);
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
                    const colorClass = this.getEquipmentColorClass(item);
                    equipmentElement.className = `text-sm ${colorClass}`;
                    // 设置装备属性的tooltip
                    const statsDescription = this.getStatsDescription(item.stats);
                    const levelDisplay = item.realmName ? item.realmName : item.level;
                    const tooltipText = `${item.name}\n等级: ${levelDisplay}\n品质: ${item.rarityDisplayName || '白色'}\n精炼: +${item.refineLevel || 0}\n属性: ${statsDescription}`;
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
        
        // 更新人物装备显示
        this.updateCharacterEquipmentDisplay();
        
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
        
        // 更新精炼信息
        this.updateRefineInfo(this.selectedRefineSlot);
        
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
        // 获取资源速率，添加默认值
        const spiritWoodRate = this.gameState.resources.spiritWoodRate || 1;
        const blackIronRate = this.gameState.resources.blackIronRate || 0.5;
        const spiritCrystalRate = this.gameState.resources.spiritCrystalRate || 0.2;
        
        // 生成灵木
        this.gameState.resources.spiritWood += spiritWoodRate;
        
        // 生成玄铁
        this.gameState.resources.blackIron += blackIronRate;
        
        // 生成灵晶
        this.gameState.resources.spiritCrystal += spiritCrystalRate;
        
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
        if (typeof this.updateHealthBars === 'function') {
            this.updateHealthBars();
        }
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
        bindEvent('#auto-collect-spiritWood', 'change', () => {
            this.updateAutoCollectResourceTypes();
        });
        bindEvent('#auto-collect-blackIron', 'change', () => {
            this.updateAutoCollectResourceTypes();
        });
        bindEvent('#auto-collect-spiritCrystal', 'change', () => {
            this.updateAutoCollectResourceTypes();
        });
        
        // 自动挂机开关
        bindEvent('#auto挂机', 'change', (e) => {
            this.toggleAutoPlay(e.target.checked);
        });
        
        // 资源收集按钮
        bindEvent('#collect-spiritWood', 'click', () => {
            this.collectResource('spiritWood');
        });
        
        bindEvent('#collect-blackIron', 'click', () => {
            this.collectResource('blackIron');
        });
        
        bindEvent('#collect-spiritCrystal', 'click', () => {
            this.collectResource('spiritCrystal');
        });
        
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
        
        // 突破按钮
        bindEvent('#breakthrough-btn', 'click', () => {
            this.attemptBreakthrough();
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
            console.log('点击设置按钮');
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
    




    // 隐藏敌人血条
    hideEnemyHealthBars() {
        if (!this.battle3D || !this.battle3D.enemies) return;

        // 隐藏所有预生成敌人的血条
        for (const enemy of this.battle3D.enemies) {
            if (enemy.active && enemy.healthBar) {
                enemy.healthBar.isVisible = false;
            }
        }

        // 隐藏当前战斗的敌人血条
        if (this.battle3D.enemyHealthBar) {
            this.battle3D.enemyHealthBar.isVisible = false;
        }

        // 隐藏Boss的能量条
        if (this.battle3D.enemyEnergyBar) {
            this.battle3D.enemyEnergyBar.isVisible = false;
        }
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
        
        // 根据人物境界确定装备等级
        const realm = this.gameState.player.realm;
        const equipmentLevel = realm.currentRealm + 1; // 境界从0开始，装备等级从1开始
        const realmName = this.realmConfig[realm.currentRealm].name; // 获取境界名称
        
        // 根据人物阶段确定装备品质范围
        let phaseRarities = [];
        if (realm.currentStage <= 3) {
            // 前期
            phaseRarities = ['white', 'green'];
        } else if (realm.currentStage <= 6) {
            // 中期
            phaseRarities = ['blue', 'cyan'];
        } else if (realm.currentStage <= 9) {
            // 后期
            phaseRarities = ['purple', 'pink'];
        } else {
            // 大圆满
            phaseRarities = ['gold', 'legendary'];
        }
        
        // 从对应阶段的品质中随机选择
        const rarity = phaseRarities[Math.floor(Math.random() * phaseRarities.length)];
        const rarityInfo = this.gameState.equipmentRarities.find(r => r.name === rarity);
        
        // 使用公共函数计算装备属性
        const stats = this.calculateEquipmentStats(template, equipmentLevel, rarityInfo);
        
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
            realmName: realmName,
            refineLevel: 0,
            stats: stats,
            description: `${rarityInfo.displayName}品质的${template.type}`,
            rarity: rarity,
            rarityDisplayName: rarityInfo.displayName,
            rarityMultiplier: rarityInfo.multiplier
        };
    }
    
    // 随机获取装备品质（考虑怪物类型和幸运值）
    getRandomRarity() {
        // 基础掉率
        let dropRates = {
            white: 0.3,
            green: 0.25,
            blue: 0.2,
            cyan: 0.1,
            purple: 0.08,
            pink: 0.04,
            gold: 0.02,
            legendary: 0.01
        };
        
        // 根据怪物类型调整掉率
        if (this.gameState.enemy.isBoss) {
            // BOSS掉率调整
            dropRates = {
                white: 0.1,
                green: 0.15,
                blue: 0.2,
                cyan: 0.15,
                purple: 0.15,
                pink: 0.1,
                gold: 0.1,
                legendary: 0.05
            };
        } else if (this.gameState.enemy.isElite) {
            // 精英怪掉率调整
            dropRates = {
                white: 0.2,
                green: 0.2,
                blue: 0.2,
                cyan: 0.15,
                purple: 0.1,
                pink: 0.08,
                gold: 0.05,
                legendary: 0.02
            };
        }
        
        // 考虑幸运值影响（每点幸运值提高0.5%的高品质装备掉率）
        const luck = this.gameState.player.luck || 0;
        const luckBonus = luck * 0.005;
        
        // 调整掉率，提高高品质装备的概率
        const adjustedRates = {
            white: Math.max(0, dropRates.white - luckBonus * 3),
            green: Math.max(0, dropRates.green - luckBonus * 2),
            blue: Math.max(0, dropRates.blue - luckBonus),
            cyan: Math.max(0, dropRates.cyan),
            purple: Math.max(0, dropRates.purple + luckBonus * 0.5),
            pink: Math.max(0, dropRates.pink + luckBonus * 1),
            gold: Math.max(0, dropRates.gold + luckBonus * 1.5),
            legendary: Math.max(0, dropRates.legendary + luckBonus * 2)
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
        if (typeof this.updateHealthBars === 'function') {
            this.updateHealthBars();
        }
        
        // 战斗结束，延迟后关闭战斗模态窗口并返回主界面
        setTimeout(() => {
            this.closeBattleModal();
        }, 2000);
    }
    
    // 检查升级
    checkLevelUp() {
   
        if (this.gameState.player.exp >= this.gameState.player.maxExp) {
            const realm = this.gameState.player.realm;
            const currentRealmConfig = this.realmConfig[realm.currentRealm];
            const currentStageConfig = currentRealmConfig.stages[realm.currentStage - 1];
            
            // 检查是否达到当前阶段的等级上限
            if (realm.currentLevel < currentStageConfig.levelCap) {
                // 升级
                realm.currentLevel++;
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
                this.gameState.resources.spiritWoodRate += 0.2;
                this.gameState.resources.blackIronRate += 0.1;
                this.gameState.resources.spiritCrystalRate += 0.05;
                
                // 播放升级声音
                this.playSound('levelup-sound', 1, 2000);
                
                this.addBattleLog(`恭喜你升级到${realm.currentLevel}级！能量上限提升了10点！`);
                
                // 触发升级动画
                this.triggerLevelUpAnimation();
                
                console.log('升级逻辑执行完成');
            } else {
                // 达到当前阶段等级上限，提示突破
                this.addBattleLog(`已达到${currentStageConfig.name}等级上限，需要突破到下一阶段！`);
                this.gameState.player.exp = this.gameState.player.maxExp; // 保持经验值不变
            }
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
                    characterBodyElement.src = `Images/male-character-${this.gameState.player.realm.currentRealm + 1}.png?${timestamp}`;
                } else if (this.gameState.user.gender === '女') {
                    characterBodyElement.src = `Images/female-character-${this.gameState.player.realm.currentRealm + 1}.png?${timestamp}`;
                }
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
    
    // 计算境界加成
    calculateRealmBonus() {
        const realm = this.gameState.player.realm;
        const currentRealmConfig = this.realmConfig[realm.currentRealm];
        const currentStageConfig = currentRealmConfig.stages[realm.currentStage - 1];
        
        // 基础加成（当前阶段）
        const baseBonus = currentStageConfig.bonus;
        
        // 累计加成（前面所有阶段）
        let totalBonus = { attack: 0, defense: 0, hp: 0, luck: 0 };
        
        // 计算当前境界之前所有境界的加成
        for (let i = 0; i < realm.currentRealm; i++) {
            const previousRealm = this.realmConfig[i];
            const maxStage = previousRealm.stages[previousRealm.stages.length - 1];
            totalBonus.attack += maxStage.bonus.attack;
            totalBonus.defense += maxStage.bonus.defense;
            totalBonus.hp += maxStage.bonus.hp;
            totalBonus.luck += maxStage.bonus.luck;
        }
        
        // 计算当前境界之前所有阶段的加成
        for (let i = 0; i < realm.currentStage - 1; i++) {
            const previousStage = currentRealmConfig.stages[i];
            totalBonus.attack += previousStage.bonus.attack;
            totalBonus.defense += previousStage.bonus.defense;
            totalBonus.hp += previousStage.bonus.hp;
            totalBonus.luck += previousStage.bonus.luck;
        }
        
        // 添加当前阶段的加成
        totalBonus.attack += baseBonus.attack;
        totalBonus.defense += baseBonus.defense;
        totalBonus.hp += baseBonus.hp;
        totalBonus.luck += baseBonus.luck;
        
        return totalBonus;
    }
    
    // 计算总等级（基于境界、阶段和当前等级）
    calculateTotalLevel() {
        const realm = this.gameState.player.realm;
        // 每个境界有10个阶段，每个阶段最多30级
        const realmLevel = realm.currentRealm * 10 * 30;
        const stageLevel = (realm.currentStage - 1) * 30;
        const currentLevel = realm.currentLevel;
        return realmLevel + stageLevel + currentLevel;
    }



    // 清理装备的colorClass属性
    cleanupEquipmentColorClass() {
        // 清理已装备的装备
        if (this.gameState.player && this.gameState.player.equipment) {
            for (const slot in this.gameState.player.equipment) {
                const item = this.gameState.player.equipment[slot];
                if (item && item.colorClass) {
                    delete item.colorClass;
                }
            }
        }
        
        // 清理背包中的装备
        if (this.gameState.player && this.gameState.player.inventory) {
            this.gameState.player.inventory.forEach(item => {
                if (item && item.colorClass) {
                    delete item.colorClass;
                }
            });
        }
    }
    
    // 获取突破所需突破石数量
    getRequiredBreakthroughStones(realmIndex, stage) {
        // 从realmConfig中获取突破石数量
        const realmConfig = this.realmConfig[realmIndex];
        const stageConfig = realmConfig.stages[stage - 1];
        return stageConfig.breakthroughStones;
    }

    // 尝试突破
    attemptBreakthrough() {
        const realm = this.gameState.player.realm;
        const currentRealmConfig = this.realmConfig[realm.currentRealm];
        const currentStageConfig = currentRealmConfig.stages[realm.currentStage - 1];
        
        // 检查等级是否达到上限
        if (realm.currentLevel < currentStageConfig.levelCap) {
            this.addBattleLog('等级未达到当前阶段上限，无法突破！');
            return false;
        }
        
        // 检查突破石是否足够
        const requiredStones = this.getRequiredBreakthroughStones(realm.currentRealm, realm.currentStage);
        if (this.gameState.resources.breakthroughStones < requiredStones) {
            this.addBattleLog('突破石不足，无法突破！');
            return false;
        }
        
        // 执行突破
        this.gameState.resources.breakthroughStones -= requiredStones;
        
        // 更新境界/阶段/等级
        if (realm.currentStage < 10) {
            // 同一境界内突破
            realm.currentStage++;
            realm.currentLevel = 1;
        } else {
            // 突破到下一个大境界
            if (realm.currentRealm < this.realmConfig.length - 1) {
                realm.currentRealm++;
                realm.currentStage = 1;
                realm.currentLevel = 1;
            } else {
                // 已达到最高境界
                this.addBattleLog('已达到最高境界，无法继续突破！');
                return false;
            }
        }
        
        // 发放突破奖励
        this.addBattleLog('突破成功！');
        this.updateCharacterBodyImage();
        this.updateUI();
        return true;
    }
    
    // 根据稀有度和类型获取装备颜色
    getEquipmentColor(rarity, type = 'text') {
        const colorMap = {
            white: {
                text: 'text-gray-400',
                border: 'border-gray-400',
                color: '#9ca3af'
            },
            green: {
                text: 'text-green-400',
                border: 'border-green-400',
                color: '#4ade80'
            },
            blue: {
                text: 'text-blue-400',
                border: 'border-blue-400',
                color: '#60a5fa'
            },
            cyan: {
                text: 'text-cyan-400',
                border: 'border-cyan-400',
                color: '#22d3ee'
            },
            purple: {
                text: 'text-purple-400',
                border: 'border-purple-400',
                color: '#a78bfa'
            },
            pink: {
                text: 'text-pink-400',
                border: 'border-pink-400',
                color: '#f9a8d4'
            },
            gold: {
                text: 'text-yellow-400',
                border: 'border-yellow-400',
                color: '#fbbf24'
            },
            legendary: {
                text: 'text-orange-400',
                border: 'border-orange-400',
                color: '#f87171'
            }
        };
        
        // 处理中文稀有度名称
        const rarityMap = {
            '白色': 'white',
            '绿色': 'green',
            '蓝色': 'blue',
            '青色': 'cyan',
            '紫色': 'purple',
            '粉色': 'pink',
            '黄金': 'gold',
            '传奇': 'legendary'
        };
        
        const normalizedRarity = rarityMap[rarity] || rarity;
        return colorMap[normalizedRarity]?.[type] || colorMap.white[type];
    }
    
    // 获取装备的颜色类
    getEquipmentColorClass(item) {
        const rarity = item.rarityDisplayName || item.rarity;
        return this.getEquipmentColor(rarity, 'text');
    }
    
    // 刷新敌人
    refreshEnemy() {
        // 敌人等级与玩家等级差距不超过3级
        const playerLevel = this.calculateTotalLevel();
        const minLevel = Math.max(1, playerLevel - 3);
        const maxLevel = playerLevel + 3;
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
        
        // 计算敌人属性，确保所有属性都有值
        const baseHp = enemyType.baseHp || 30;
        const baseAttack = enemyType.baseAttack || 8;
        const baseDefense = enemyType.baseDefense || 2;
        const baseSpeed = enemyType.baseSpeed || 5;
        const baseLuck = enemyType.baseLuck || 1;
        const expMultiplier = enemyType.expMultiplier || 1;
        const resourceMultiplier = enemyType.resourceMultiplier || 1;
        
        const hp = Math.floor(baseHp * enemyLevel * eliteBonus);
        const attack = Math.floor(baseAttack * enemyLevel * eliteBonus);
        const defense = Math.floor(baseDefense * enemyLevel * eliteBonus);
        const speed = Math.floor(baseSpeed * enemyLevel * eliteBonus);
        const luck = Math.floor(baseLuck * enemyLevel * eliteBonus);
        
        // 创建完整的敌人对象，确保所有必要属性都有值
        this.gameState.enemy = {
            name: isElite ? `精英${enemyType.name}` : enemyType.name,
            level: enemyLevel,
            hp: hp,
            maxHp: hp,
            attack: attack,
            defense: defense,
            speed: speed,
            luck: luck,
            isElite: isElite,
            eliteBonus: eliteBonus,
            icon: enemyType.icon || 'fa-skull',
            image: enemyType.image || '',
            expMultiplier: expMultiplier * eliteBonus,
            resourceMultiplier: resourceMultiplier * eliteBonus,
            // 添加额外的默认属性，确保完整
            accuracy: 90,
            dodge: 10
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
        if (document.getElementById('auto-collect-spiritWood').checked) {
            resourceTypes.push('spiritWood');
        }
        if (document.getElementById('auto-collect-blackIron').checked) {
            resourceTypes.push('blackIron');
        }
        if (document.getElementById('auto-collect-spiritCrystal').checked) {
            resourceTypes.push('spiritCrystal');
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
            const spiritWoodRate = this.gameState.resources.spiritWoodRate || 1;
            const blackIronRate = this.gameState.resources.blackIronRate || 0.5;
            const spiritCrystalRate = this.gameState.resources.spiritCrystalRate || 0.2;
            
            switch (type) {
                case 'spiritWood':
                    amount = Math.floor(spiritWoodRate * 10 + Math.random() * 5);
                    this.gameState.resources.spiritWood += amount;
                    break;
                case 'blackIron':
                    amount = Math.floor(blackIronRate * 10 + Math.random() * 3);
                    this.gameState.resources.blackIron += amount;
                    break;
                case 'spiritCrystal':
                    amount = Math.floor(spiritCrystalRate * 10 + Math.random() * 2);
                    this.gameState.resources.spiritCrystal += amount;
                    break;
            }
            
            this.gameState.settings.collectedResources += amount;
            this.addBattleLog(`收集了${amount}${type === 'spiritWood' ? '灵木' : type === 'blackIron' ? '玄铁' : '灵晶'}！`);
            
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
        // 确保battle对象存在
        if (!this.gameState.battle) {
            this.gameState.battle = {
                inBattle: false,
                battleLog: []
            };
        }
        // 确保battleLog数组存在
        if (!this.gameState.battle.battleLog) {
            this.gameState.battle.battleLog = [];
        }
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
               // 保存用户信息
            const userInfo = { ...this.gameState.user };
            
            // 只从服务器加载
            if (this.gameState.user.loggedIn) {
                (async () => {
                    const serverGameState = await this.loadFromServer();
                    if (serverGameState) {
                        if (serverGameState.success && serverGameState.gameState) {
                            this.addBattleLog('从服务器加载游戏成功！');
                            // 保留用户信息，只更新游戏的其他部分
                            const { user, ...gameData } = serverGameState.gameState;                            
                            // 补充缺失的资源属性
                            if (gameData.resources) {
                                gameData.resources.spiritWood = gameData.resources.spiritWood || 0;
                                gameData.resources.spiritWoodRate = gameData.resources.spiritWoodRate || 1;
                                gameData.resources.blackIron = gameData.resources.blackIron || 0;
                                gameData.resources.blackIronRate = gameData.resources.blackIronRate || 0.5;
                                gameData.resources.spiritCrystal = gameData.resources.spiritCrystal || 0;
                                gameData.resources.spiritCrystalRate = gameData.resources.spiritCrystalRate || 0.2;
                                gameData.resources.breakthroughStones = gameData.resources.breakthroughStones || 0;
                            }
                        
                            this.gameState = { ...gameData, user: userInfo };
                        
                            // 清理装备的colorClass属性
                            this.cleanupEquipmentColorClass();
                        
                            await this.fetchGameMetadata();
                            // 检查临时状态是否过期
                            this.checkTemporaryStats();                        
                        } else {
                            // 如果token无效，重定向到登录页面
                            if (serverGameState.error === 'Invalid token' || serverGameState.error === 'No token provided') {
                                console.warn('Token无效，正在退出登录...');
                                this.logout();
                                return null;
                            }
                            // 如果是保存文件未找到错误，返回一个标记对象
                            if (serverGameState.error === 'Save file not found') {
                                this.addBattleLog('没有找到保存的游戏，初始化新游戏！');
                                // 先获取游戏元数据
                                await this.fetchGameMetadata();
                                // 然后初始化新的游戏状态
                                this.initNewGameState();
                            }   
                        }
                    } else {
                        console.error('服务器端加载失败:', serverGameState.error);
                        this.logout();
                    }
                })();
            } else {
                this.addBattleLog('访客模式无法加载游戏！');
                return null;
            }
        } catch (error) {
            this.addBattleLog('游戏加载失败！');
            console.error('加载游戏失败:', error);
        }
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
        if (this.gameState.resources.spiritWood < cost.spiritWood ||
            this.gameState.resources.blackIron < cost.blackIron ||
            this.gameState.resources.spiritCrystal < cost.spiritCrystal) {
            this.addBattleLog('材料不足，无法精炼装备！');
            return;
        }
        
        // 消耗材料
        this.gameState.resources.spiritWood -= cost.spiritWood;
        this.gameState.resources.blackIron -= cost.blackIron;
        this.gameState.resources.spiritCrystal -= cost.spiritCrystal;
        
        // 提升精炼等级
        item.refineLevel = nextLevel;
        
        // 重新计算装备效果
        this.calculateEquipmentEffects();
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        if (typeof this.updateHealthBars === 'function') {
            this.updateHealthBars();
        }
        
        // 添加日志
        this.addBattleLog(`${slot === 'weapon' ? '武器' : slot === 'armor' ? '护甲' : slot === 'helmet' ? '头盔' : slot === 'boots' ? '靴子' : '饰品'}精炼成功！当前精炼等级：+${item.refineLevel}`);
        this.addBattleLog(`消耗了 ${cost.spiritWood} 灵木，${cost.blackIron} 玄铁，${cost.spiritCrystal} 灵晶`);
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
            // 优先使用rarity属性
            switch (item.rarity) {
                case 'white':
                    qualitySpiritWood = 30;
                    qualityBlackIron = 15;
                    qualitySpiritCrystal = 5;
                    break;
                case 'blue':
                    qualitySpiritWood = 50;
                    qualityBlackIron = 25;
                    qualitySpiritCrystal = 10;
                    break;
                case 'purple':
                    qualitySpiritWood = 80;
                    qualityBlackIron = 40;
                    qualitySpiritCrystal = 15;
                    break;
                case 'gold':
                    qualitySpiritWood = 120;
                    qualityBlackIron = 60;
                    qualitySpiritCrystal = 25;
                    break;
                case 'legendary':
                    qualitySpiritWood = 180;
                    qualityBlackIron = 90;
                    qualitySpiritCrystal = 40;
                    break;
            }
        } else if (item.rarity) {
            // 根据稀有度判断品质
            switch(item.rarity) {
                case 'white':
                    // 白色品质
                    qualitySpiritWood = 30;
                    qualityBlackIron = 15;
                    qualitySpiritCrystal = 5;
                    break;
                case 'green':
                    // 绿色品质
                    qualitySpiritWood = 40;
                    qualityBlackIron = 20;
                    qualitySpiritCrystal = 8;
                    break;
                case 'blue':
                    // 蓝色品质
                    qualitySpiritWood = 50;
                    qualityBlackIron = 25;
                    qualitySpiritCrystal = 10;
                    break;
                case 'cyan':
                    // 青色品质
                    qualitySpiritWood = 65;
                    qualityBlackIron = 32;
                    qualitySpiritCrystal = 12;
                    break;
                case 'purple':
                    // 紫色品质
                    qualitySpiritWood = 80;
                    qualityBlackIron = 40;
                    qualitySpiritCrystal = 15;
                    break;
                case 'pink':
                    // 粉色品质
                    qualitySpiritWood = 100;
                    qualityBlackIron = 50;
                    qualitySpiritCrystal = 20;
                    break;
                case 'gold':
                    // 黄金品质
                    qualitySpiritWood = 120;
                    qualityBlackIron = 60;
                    qualitySpiritCrystal = 25;
                    break;
                case 'legendary':
                    // 传奇品质
                    qualitySpiritWood = 180;
                    qualityBlackIron = 90;
                    qualitySpiritCrystal = 40;
                    break;
            }
        }
        
        // 总返还材料
        return {
            spiritWood: refineSpiritWood + qualitySpiritWood,
            blackIron: refineBlackIron + qualityBlackIron,
            spiritCrystal: refineSpiritCrystal + qualitySpiritCrystal
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
灵木：${returns.spiritWood}
玄铁：${returns.blackIron}
灵晶：${returns.spiritCrystal}`;
        
        if (!confirm(confirmMessage)) {
            this.addBattleLog('分解操作已取消！');
            return;
        }
        
        // 获得材料
        this.gameState.resources.spiritWood += returns.spiritWood;
        this.gameState.resources.blackIron += returns.blackIron;
        this.gameState.resources.spiritCrystal += returns.spiritCrystal;
        
        // 卸下并移除装备
        this.gameState.player.equipment[slot] = null;
        
        // 重新计算装备效果
        this.calculateEquipmentEffects();
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        if (typeof this.updateHealthBars === 'function') {
            this.updateHealthBars();
        }
        
        // 添加日志
        this.addBattleLog(`成功分解${slot === 'weapon' ? '武器' : slot === 'armor' ? '护甲' : slot === 'helmet' ? '头盔' : slot === 'boots' ? '靴子' : '饰品'} ${item.name}！`);
        this.addBattleLog(`获得了 ${returns.spiritWood} 灵木，${returns.blackIron} 玄铁，${returns.spiritCrystal} 灵晶！`);
    }
    
    // 保存游戏状态
    async saveGameState() {
        try {
            if (this.gameState.user.loggedIn) {
                const currentUserId = this.gameState.user.userId;
                // 只使用服务器端保存
                const token = localStorage.getItem('endlessWinterToken');

                const response = await fetch('http://localhost:3002/api/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ gameState: this.gameState })
                });
                
                const result = await response.json();
                if (!result.success) {
                    console.error('服务器端保存失败:', result.error);
                    // 如果token无效，重定向到登录页面
                    if (result.error === 'Invalid token' || result.error === 'No token provided') {
                        this.logout();
                    }
                }
            }
        } catch (error) {
            console.error('保存游戏状态失败:', error);
        }
    }
    
    // 从服务器加载
    async loadFromServer() {
        try {
            const token = localStorage.getItem('endlessWinterToken');
            
            const response = await fetch('http://localhost:3002/api/load', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            return await response.json();
            
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
            const newEquipmentColorClass = this.getEquipmentColorClass(newEquipment);
            resultSlot.innerHTML = `
                <div class="text-xs ${newEquipmentColorClass} text-center animate-pulse">
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
            const failedEquipmentColorClass = this.getEquipmentColorClass(failedEquipment);
            resultSlot.innerHTML = `
                <div class="text-xs ${failedEquipmentColorClass} text-center animate-pulse">
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
            rarityMultiplier: 1
            };
        }
        
        // 获取品质信息
        const rarityInfo = this.gameState.equipmentRarities.find(r => r.name === rarity);
        
        // 计算装备属性（基础属性 * 等级 * 品质倍数）
        const stats = {};
        for (const stat in template.baseStats) {
            const value = template.baseStats[stat] * level * (rarityInfo ? rarityInfo.multiplier : 1);
            // 对于小数属性，使用Math.max确保至少为1，对于整数属性使用Math.floor
            if (template.baseStats[stat] < 1) {
                stats[stat] = Math.max(1, Math.floor(value));
            } else {
                stats[stat] = Math.floor(value);
            }
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
            // 不再需要colorClass属性，颜色由getEquipmentColorClass函数动态计算
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
    
    // 计算装备属性的公共函数
    calculateEquipmentStats(template, level, rarityInfo) {
        // 计算属性（基础属性 * 等级 * 品质倍数）
        const stats = {};
        
        // 获取该品质的属性数量
        const statCount = rarityInfo.statCount || 3;
        
        // 获取所有基础属性的键
        const statKeys = Object.keys(template.baseStats);
        
        // 随机选择指定数量的属性
        const selectedStats = [];
        const tempKeys = [...statKeys];
        
        for (let i = 0; i < statCount && tempKeys.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * tempKeys.length);
            selectedStats.push(tempKeys.splice(randomIndex, 1)[0]);
        }
        
        // 为选中的属性计算值
        for (const stat of selectedStats) {
            let value = template.baseStats[stat] * level * rarityInfo.multiplier;
            
            // 为基础属性较低的装备类型增加额外系数
            if (template.type === 'boots') {
                // 靴子基础属性较低，增加额外系数
                value *= 1.5;
            }
            
            // 使用Math.max确保最低属性值
            const minValue = level; // 最低值至少为装备等级
            stats[stat] = Math.max(minValue, Math.floor(value));
        }
        
        return stats;
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
        
        // 使用公共函数计算装备属性
        const stats = this.calculateEquipmentStats(template, level, rarityInfo);
        
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
                    spiritWood: 0,
                    spiritWoodRate: 1,
                    blackIron: 0,
                    blackIronRate: 0.5,
                    spiritCrystal: 0,
                    spiritCrystalRate: 0.2
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
                await fetch('http://localhost:3002/api/logout', {
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
                    const response = await fetch('http://localhost:3002/api/delete-account', {
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
    initNewGameState() {
        // 使用metadata中的数据初始化游戏状态
        if (this.playerMetadata) {
            // 加载初始属性
            if (this.playerMetadata.initialStats) {
                Object.assign(this.gameState.player, this.playerMetadata.initialStats);
            }
            
            this.gameState.player.equipment = {}; // 重置装备栏

            this.gameState.player.equipmentEffects = {}; // 重置装备效果

            this.gameState.player.inventory = []; // 重置背包

            // 加载技能
            if (this.playerMetadata.skills) {
                this.gameState.player.skills = this.playerMetadata.skills;
            }
            
            // 使用metadata中的默认设置初始化
            if (this.playerMetadata.defaultSettings) {
                this.gameState.settings = JSON.parse(JSON.stringify(this.playerMetadata.defaultSettings));
            }
            
            // 使用metadata中的默认战斗状态初始化
            if (this.playerMetadata.defaultBattleState) {
                this.gameState.battle = JSON.parse(JSON.stringify(this.playerMetadata.defaultBattleState));
            }

            // 只在新游戏时初始化资源速率
            if (this.resourceMetadata) {
                this.resourceMetadata.types.forEach(resource => {
                    if (this.gameState.resources[resource.name]) {
                        this.gameState.resources[`${resource.name}Rate`] = resource.baseRate;
                    }
                });
            }
        }
    }
    
    // 计算装备效果
    calculateEquipmentEffects() {
        // 重置装备效果
        this.gameState.player.equipmentEffects = {
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
            item => item.level <= this.calculateTotalLevel()
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
        if (typeof this.updateHealthBars === 'function') {
            this.updateHealthBars();
        }
        
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
        
        // 检查灵木是否足够
        if (this.gameState.resources.spiritWood < item.price) {
            this.addBattleLog(`灵木不足，无法购买 ${item.name}！`);
            return;
        }
        
        // 扣除灵木
        this.gameState.resources.spiritWood -= item.price;
        
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
            rarityMultiplier: 1
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
        if (typeof this.updateHealthBars === 'function') {
            this.updateHealthBars();
        }
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
        const rarityColor = this.getEquipmentColorClass(item);
        
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
                    const woodAmount = returns.spiritWood || 0;
                    const ironAmount = returns.blackIron || 0;
                    const crystalAmount = returns.spiritCrystal || 0;
                    
                    const confirmDisassemble = confirm(`分解 ${itemName} 将会获得：\n灵木: ${woodAmount}\n玄铁: ${ironAmount}\n灵晶: ${crystalAmount}\n\n确定分解吗？`);
                    
                    if (confirmDisassemble) {
                        inventory.splice(index, 1);
                        this.gameState.resources.spiritWood += woodAmount;
                        this.gameState.resources.blackIron += ironAmount;
                        this.gameState.resources.spiritCrystal += crystalAmount;
                        this.addBattleLog(`分解 ${itemName} 获得了 ${woodAmount} 灵木, ${ironAmount} 玄铁, ${crystalAmount} 灵晶！`);
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
                case 'speed': statName = '速度'; break;
                case 'criticalRate': statName = '暴击'; break;
                case 'dodgeRate': statName = '闪避'; break;
                case 'accuracy': statName = '命中'; break;
                case 'moveSpeed': statName = '移速'; break;
                case 'tenacity': statName = '韧性'; break;
                case 'energyRegen': statName = '回蓝'; break;
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
