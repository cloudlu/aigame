// 游戏核心数据结构和状态管理
class EndlessCultivationGame {
    // ========== 战力系统配置 ==========
    // 战力基数（调大此值可整体放大战力数字，提升爽感）
    static COMBAT_POWER_BASE = 100;

    // 战力权重配置（平坦属性）
    static COMBAT_POWER_WEIGHTS = {
        attack: 3.0,
        defense: 2.0,
        hp: 0.15,
        speed: 1.0,
        luck: 0.5,
        critDamage: 0.5  // 暴击伤害值权重（v2.3新增）
    };

    // 百分比属性权重（只计算超出基础值的部分）
    // 注意：stats使用小数格式（0.05表示5%），权重相应调整为原来的100倍
    static COMBAT_POWER_PCT_WEIGHTS = {
        criticalRate: 2500,
        dodgeRate: 2500,
        accuracy: 2000,
        tenacity: 1500
    };

    // 百分比属性基础值（低于此部分不计入战力）
    // 注意：使用小数格式（0.05表示5%），与getActualStats()返回格式一致
    static COMBAT_POWER_PCT_BASELINE = {
        criticalRate: 0.05,  // 5%
        dodgeRate: 0.05,     // 5%
        accuracy: 1.0,       // 100%
        tenacity: 0
    };

    constructor() {
        // ========== 新架构：数据按生命周期分类 ==========

        // 持久化数据 - 需要保存到服务器（不包含 user，user 从服务器获取）
        this.persistentState = {
            player: {},         // 玩家属性（不含资源）
            resources: {        // 统一资源系统 (v2.0清理 - 删除wood/gold)
                spiritStones: 0,
                jade: 0,
                herbs: 0,
                iron: 0,
                breakthroughStones: 0
            },
            currentBackgroundIndex: 0,
            settings: {},       // 游戏设置
            mainQuest: {},      // 主线任务
            mainStory: {},      // 主线剧情
            dailyQuests: {},    // 每日任务
            vip: {},            // VIP系统
            collection: {}      // 图鉴系统
        };

        // 用户信息 - 内存中保存，不从存档加载
        this._user = {
            userId: null,
            username: null,
            loggedIn: false,
            role: 'player'
        };

        // 临时数据 - 不保存，运行时生成
        this.transientState = {
            enemy: null,        // 当前敌人
            sceneMonsters: [],  // 场景怪物
            battle: {           // 战斗状态
                inBattle: false,
                battleLog: []
            }
        };

        // 计算属性缓存 - 不保存，运行时计算
        this._computedCache = {
            equipmentEffects: null,
            questCache: null
        };

        // 游戏计时器
        this.timers = {
            resourceTimer: null,
            autoBattleTimer: null,
            afkTimer: null
        };

        // 初始化装备系统（浏览器环境使用window，Node环境使用require的模块）
        const EquipmentSystemClass = typeof window !== 'undefined' ? window.EquipmentSystem : require('./equipment');
        this.equipmentSystem = new EquipmentSystemClass(this);

        // 初始化境界技能系统
        const RealmSkillSystemClass = typeof window !== 'undefined' ? window.RealmSkillSystem : require('./realmSkillSystem');
        this.realmSkillSystem = new RealmSkillSystemClass(this);

        // 初始化主线任务系统
        const MainQuestSystemClass = typeof window !== 'undefined' ? window.MainQuestSystem : require('./mainQuest');
        this.mainQuestSystem = new MainQuestSystemClass(this);

        // 初始化每日任务系统
        const DailyQuestSystemClass = typeof window !== 'undefined' ? window.DailyQuestSystem : require('./dailyQuest');
        this.dailyQuestSystem = new DailyQuestSystemClass(this);

        // 初始化VIP系统
        const VIPSystemClass = typeof window !== 'undefined' ? window.VIPSystem : require('./vipSystem').VIPSystem;
        this.vipSystem = new VIPSystemClass(this);

        // 初始化仙玉商店
        const JadeShopClass = typeof window !== 'undefined' ? window.JadeShop : require('./jadeShop').JadeShop;
        this.jadeShop = new JadeShopClass(this);

        // 初始化图鉴系统
        const CollectionSystemClass = typeof window !== 'undefined' ? window.CollectionSystem : require('./collectionSystem').CollectionSystem;
        this.collectionSystem = new CollectionSystemClass(this);

        // 初始化音频系统
        const AudioSystemClass = typeof window !== 'undefined' ? window.AudioSystem : require('./audio');
        this.audioSystem = new AudioSystemClass(this);

        // 初始化游戏
        this.initGame();
    }

    // ==================== 用户信息 Getter/Setter ====================

    // 兼容性：persistentState.user 指向 _user
    get user() {
        return this._user;
    }

    set user(value) {
        Object.assign(this._user, value);
    }

    // ==================== 计算属性 Getter ====================

    // 获取装备效果（懒加载 + 缓存）
    get equipmentEffects() {
        if (this._computedCache.equipmentEffects) {
            return this._computedCache.equipmentEffects;
        }
        this._computedCache.equipmentEffects = this.equipmentSystem.calculateEquipmentEffects();
        return this._computedCache.equipmentEffects;
    }

    // 清除装备效果缓存（装备变化时调用）
    invalidateEquipmentEffectsCache() {
        this._computedCache.equipmentEffects = null;
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
        console.log('开始初始化登录后系统...');

        // 初始化资源副本系统
        if (typeof DungeonSystem !== 'undefined') {
            this.dungeon = new DungeonSystem(this);
            this.dungeon.initAllDungeonData();
        } else {
            console.error('DungeonSystem未定义，跳过副本系统初始化');
        }

        // ✅ 重置战斗状态（防止页面刷新后残留战斗状态）
        if (this.transientState.battle) {
            this.transientState.battle.inBattle = false;
            console.log('✅ 重置战斗状态为 false');
        }

        // 登录和加载完成后继续初始化
        this.preloadImages();
        
        // 加载纹理（提前加载，确保3D场景初始化时纹理已准备好）
        this.loadTextures();
        
        // 确保所有装备都有refineLevel属性
            for (const slot in this.persistentState.player.equipment) {
                const item = this.persistentState.player.equipment[slot];
                if (item && item.refineLevel === undefined) {
                    item.refineLevel = 0;
                }
            }

            // 数据迁移：确保玩家有 inventory 结构（v1.15+ 新增）
            if (!this.persistentState.player.inventory) {
                this.persistentState.player.inventory = {
                    consumables: {},
                    waypoints: []
                };
            }

            if (!this.persistentState.player.inventory.waypoints) {
                this.persistentState.player.inventory.waypoints = [];
            }

            // 自动解锁起始地图的传送点
            if (!this.persistentState.player.inventory.waypoints.includes('xianxia-mountain')) {
                this.persistentState.player.inventory.waypoints.push('xianxia-mountain');
            }

            // 初始化地图邻接表
            this.adjacencyMap = this.buildAdjacencyMap(this.getConnections());

            // 初始化图鉴系统（确保数据结构存在）
            this.collectionSystem.init();

            // 计算初始装备效果
            this.equipmentSystem.calculateEquipmentEffects();
        
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
            if (this.persistentState.currentBackgroundIndex === undefined) {
                this.persistentState.currentBackgroundIndex = 0; // 默认山峰（武者起始地图）
            }
            this.updateMapBackground(); // 设置初始地图背景
            this.updateCharacterBodyImage();
            this.updateUI();
            this.updateAdminControls(); // 根据用户角色更新管理控制按钮
            this.bindEvents();
            // 渲染VIP充值和仙玉商店UI（充值码异步加载后渲染）
            this.vipSystem.loadRechargeCodes().then(() => {
                this.renderRechargePackages();
            });
            this.renderVIPShopItems();
            // 开始属性恢复（生命/灵力自动恢复）
            this.startStatRegeneration();

            // 初始化主线任务系统
            // 始终验证当前等级的任务是否正确初始化
            if (this.persistentState.mainQuest && this.mainQuestSystem) {
                const mq = this.persistentState.mainQuest;
                const realm = this.persistentState.player.realm?.currentRealm || 0;
                const stage = this.persistentState.player.realm?.currentStage || 1;
                const level = this.persistentState.player.realm?.currentLevel || 1;

                // 检查是否需要重新初始化任务（保留已有进度）
                const hasQuestData = mq.questData && Object.keys(mq.questData).length > 0;

                if (!hasQuestData) {
                    // 无存档数据，初始化新任务
                    mq.questData = {};
                    try {
                        this.mainQuestSystem.initLevelQuests(realm, stage, level);
                        console.log('[主线任务] 初始化新任务 -', realm, '境', stage, '阶', level, '级');
                    } catch (e) {
                        console.error('[主线任务] 初始化失败:', e);
                        if (this.mainQuestSystem) {
                            this.mainQuestSystem.initMainQuest(realm);
                        }
                    }
                } else if (mq.currentLevel !== level) {
                    // 玩家等级发生变化，检查旧任务是否全部完成
                    const allCompleted = Object.values(mq.questData).every(q => q.completed);
                    if (allCompleted) {
                        // 旧任务已全部完成，初始化新等级任务
                        mq.questData = {};
                        try {
                            this.mainQuestSystem.initLevelQuests(realm, stage, level);
                            console.debug('[主线任务] 升级后初始化新任务 -', realm, '境', stage, '阶', level, '级');
                        } catch (e) {
                            console.error('[主线任务] 初始化失败:', e);
                        }
                    } else {
                        // 旧任务未完成，保留当前任务进度
                        console.debug('[主线任务] 保留未完成任务 - 当前等级', level, '任务等级', mq.currentLevel);
                        this.mainQuestSystem.updateMainQuestUI();
                    }
                } else {
                    // 同等级，恢复已有进度（任务缓存会在首次访问时自动生成）
                    this.mainQuestSystem.getCurrentLevelQuests();
                    this.mainQuestSystem.updateMainQuestUI();
                    console.log('[主线任务] 恢复任务进度 -', realm, '境', stage, '阶', level, '级');
                }

                // 检查当前位置是否已满足 visit_map 类型的目标
                const currentMapType = this.metadata.mapBackgrounds[this.persistentState.currentBackgroundIndex]?.type;
                if (currentMapType && this.mainQuestSystem) {
                    this.mainQuestSystem.trackMainQuestProgress('map_visited', { mapType: currentMapType });
                }

                // 初始化每日任务系统
                if (this.dailyQuestSystem) {
                    this.dailyQuestSystem.initDailyQuests();
                }
            }
        }, 100);
    }
    
    // 从服务器获取游戏元数据
    async fetchGameMetadata() {
        try {
            // 获取token
            const token = localStorage.getItem('cultivationToken');
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

            // 保存metadata引用供后续使用
            this.metadata = metadata;
            
            // 添加辅助方法
            this.metadata.getSkillById = function(skillId) {
                // 从技能树系统中查找技能
                if (this.realmSkills) {
                    for (let skillTree of this.realmSkills) {
                        // 在技能树的等级中查找
                        if (skillTree.levels) {
                            for (let level of skillTree.levels) {
                                // 检查是否匹配技能树ID或技能名称
                                if (skillTree.id === skillId || level.name === skillId) {
                                    return {
                                        ...level,
                                        id: skillTree.id,
                                        treeName: skillTree.name,
                                        type: skillTree.type,
                                        realmRequired: skillTree.realmRequired
                                    };
                                }
                            }
                        }
                    }
                }
                return null;
            };

            // 更新游戏状态中的元数据
          
            if (metadata.dropRates) {
                this.metadata.dropRates = metadata.dropRates;
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
        
        // 预加载装备图片（从统一配置获取）
        const slotConfig = this.metadata.equipmentSlotConfig || {};
        for (const slot in slotConfig) {
            const img = new Image();
            img.src = slotConfig[slot].image;
        }

        this.addBattleLog('图片预加载中...');
    }
    
    // 加载纹理
    loadTextures() {
        // 存储纹理
        this.textures = {};
    }

    // ===== 地图移动系统 =====

    // 获取地图连接定义（线性路线）
    getConnections() {
        return [
            ["xianxia-mountain", "xianxia-beach"],
            ["xianxia-beach", "xianxia-plains"],
            ["xianxia-plains", "xianxia-canyon"],
            ["xianxia-canyon", "xianxia-desert"],
            ["xianxia-desert", "xianxia-lake"],
            ["xianxia-lake", "xianxia-forest"],
            ["xianxia-forest", "xianxia-volcano"],
            ["xianxia-volcano", "xianxia-cave"],
            ["xianxia-cave", "xianxia-heaven"]
        ];
    }

    // 构建邻接表（双向）
    buildAdjacencyMap(connections) {
        const adjacencyMap = {};

        connections.forEach(([mapA, mapB]) => {
            if (!adjacencyMap[mapA]) adjacencyMap[mapA] = [];
            if (!adjacencyMap[mapB]) adjacencyMap[mapB] = [];

            adjacencyMap[mapA].push(mapB);
            adjacencyMap[mapB].push(mapA);
        });

        return adjacencyMap;
    }

    // 检查两个地图是否相邻
    isAdjacentMap(currentMapType, targetMapType) {
        if (currentMapType === targetMapType) return false;

        if (!this.adjacencyMap) {
            this.adjacencyMap = this.buildAdjacencyMap(this.getConnections());
        }

        const adjacentMaps = this.adjacencyMap[currentMapType] || [];
        return adjacentMaps.includes(targetMapType);
    }

    // 移动到指定地图
    travelToMap(targetMapType, options = {}) {
        // 解构选项参数
        const {
            bypassAdjacentCheck = false,  // 允许传送绕过
            teleportType = null           // 'waypoint', 'item', 'admin', null
        } = options;

        const playerRealm = this.persistentState.player.realm.currentRealm;
        const realmRequirement = this.metadata.mapRealmRequirements[targetMapType];
        const currentMapType = this.metadata.mapBackgrounds[
            this.persistentState.currentBackgroundIndex
        ]?.type;

        // 检查1：境界限制
        if (!realmRequirement) {
            this.addBattleLog('找不到目标地图的境界需求配置！');
            return false;
        }

        if (playerRealm < realmRequirement.realm) {
            this.addBattleLog(`境界不足！需要达到 ${realmRequirement.name} 期才能进入该地图。`);
            return false;
        }

        // 检查2：相邻地图限制（可被传送绕过）
        if (!bypassAdjacentCheck && currentMapType !== targetMapType) {
            if (!this.isAdjacentMap(currentMapType, targetMapType)) {
                // 获取相邻地图列表用于友好提示
                if (!this.adjacencyMap) {
                    this.adjacencyMap = this.buildAdjacencyMap(this.getConnections());
                }
                const adjacentMaps = this.adjacencyMap[currentMapType] || [];
                const adjacentNames = adjacentMaps.map(mapType => {
                    const map = this.metadata.mapBackgrounds.find(bg => bg.type === mapType);
                    return map ? map.name : mapType;
                }).join('、');

                this.addBattleLog(`只能移动到相邻的地图！当前可到达: ${adjacentNames}`);
                this.addBattleLog(`提示: 使用传送道具可以到达更远的地图`);
                return false;
            }
        }

        // 检查3：能量消耗（传送点免费，正常移动消耗10点）
        const energyCost = teleportType === 'waypoint' ? 0 : 10;

        if (this.persistentState.player.energy < energyCost) {
            this.addBattleLog(`灵力不足！需要 ${energyCost} 点灵力才能移动。`);
            return false;
        }

        // 查找目标地图索引
        const targetIndex = this.metadata.mapBackgrounds.findIndex(
            bg => bg.type === targetMapType
        );

        if (targetIndex === -1) {
            this.addBattleLog('找不到目标地图！');
            return false;
        }

        // 执行移动
        this.persistentState.player.energy -= energyCost;
        this.persistentState.currentBackgroundIndex = targetIndex;
        this.updateMapBackground();
        this.generateMiniMap();

        const mapInfo = this.metadata.mapBackgrounds[targetIndex];

        // 根据移动类型显示不同消息
        if (teleportType === 'waypoint') {
            this.addBattleLog(`通过传送点，瞬间到达 ${mapInfo.name}！`);
        } else if (teleportType === 'item') {
            this.addBattleLog(`使用传送符，传送到了 ${mapInfo.name}！`);
        } else {
            this.addBattleLog(`消耗 ${energyCost} 灵力，移动到了 ${mapInfo.name}！`);
        }

        // 首次访问处理
        this.onMapVisit(targetMapType);

        // 主线任务进度追踪 - 地图访问
        if (this.mainQuestSystem) {
            this.mainQuestSystem.trackMainQuestProgress('map_visited', { mapType: targetMapType });
        }

        // 每日任务进度追踪 - 地图访问
        if (this.dailyQuestSystem) {
            this.dailyQuestSystem.trackDailyQuestProgress('map_visited', { mapType: targetMapType });
        }

        this.updateUI();
        return true;
    }

    // 获取当前可进入的地图列表
    getAvailableMaps() {
        const playerRealm = this.persistentState.player.realm.currentRealm;
        const currentMapType = this.metadata.mapBackgrounds[this.persistentState.currentBackgroundIndex]?.type;

        return this.metadata.mapBackgrounds.map((mapBg, index) => {
            const realmReq = this.metadata.mapRealmRequirements[mapBg.type] || { realm: 0, name: "武者" };
            const isUnlocked = playerRealm >= realmReq.realm;
            const isCurrent = mapBg.type === currentMapType;

            return {
                index,
                type: mapBg.type,
                name: mapBg.name,
                realmRequired: realmReq.realm,
                realmName: realmReq.name,
                isUnlocked,
                isCurrent
            };
        });
    }

    // 地图首次访问处理
    onMapVisit(mapType) {
        // 确保玩家有 inventory 结构
        if (!this.persistentState.player.inventory) {
            this.persistentState.player.inventory = {
                consumables: {},
                waypoints: []
            };
        }

        if (!this.persistentState.player.inventory.waypoints) {
            this.persistentState.player.inventory.waypoints = [];
        }

        // 首次访问解锁传送点
        if (!this.persistentState.player.inventory.waypoints.includes(mapType)) {
            this.persistentState.player.inventory.waypoints.push(mapType);

            const map = this.metadata.mapBackgrounds.find(bg => bg.type === mapType);
            this.addBattleLog(`解锁了 ${map.name} 的传送点！`);

            // 首次探索奖励
            const bonus = { exp: 100, spiritStones: 50 };
            this.persistentState.player.exp += bonus.exp;
            this.persistentState.resources.spiritStones = (this.persistentState.resources.spiritStones || 0) + bonus.spiritStones;
            this.addBattleLog(`首次探索！获得 ${bonus.exp} 经验和 ${bonus.spiritStones} 灵石`);
        }
    }

    // 传送到已解锁的传送点
    teleportToWaypoint(mapType) {
        // 确保有传送点数据
        if (!this.persistentState.player.inventory || !this.persistentState.player.inventory.waypoints) {
            this.addBattleLog('尚未解锁任何传送点！');
            return false;
        }

        if (!this.persistentState.player.inventory.waypoints.includes(mapType)) {
            this.addBattleLog('尚未解锁该地图的传送点！');
            return false;
        }

        return this.travelToMap(mapType, {
            bypassAdjacentCheck: true,
            teleportType: 'waypoint'
        });
    }

    // 显示地图选择面板 - 绝对定位（配合背景图片）
    showMapSelectionPanel() {
        const maps = this.getAvailableMaps();

        // 地图节点位置（基于背景图片的地理布局 - 百分比坐标）
        const mapPositions = {
            "xianxia-mountain": { x: 5, y: 80, name: "山峰" },   
            "xianxia-beach":    { x: 8,  y: 25, name: "海滩" },   
            "xianxia-forest":   { x: 50, y: 36, name: "森林" },   
            "xianxia-plains":   { x: 22, y: 28, name: "平原" },   
            "xianxia-lake":     { x: 60, y: 55, name: "湖泊" },   
            "xianxia-canyon":   { x: 42, y: 55, name: "峡谷" },   
            "xianxia-desert":   { x: 42, y: 72, name: "沙漠" },   
            "xianxia-cave":     { x: 78, y: 28, name: "洞穴" },   
            "xianxia-heaven":   { x: 95, y: 15, name: "仙境" },   
            "xianxia-volcano":  { x: 68, y: 38, name: "火山" }    
        };

        // 连接线定义（按路线顺序：山峰→海滩→平原→峡谷→沙漠→湖泊→森林→火山→洞穴→仙境）
        const connections = [
            ["xianxia-mountain", "xianxia-beach"],
            ["xianxia-beach", "xianxia-plains"],
            ["xianxia-plains", "xianxia-canyon"],
            ["xianxia-canyon", "xianxia-desert"],
            ["xianxia-desert", "xianxia-lake"],
            ["xianxia-lake", "xianxia-forest"],
            ["xianxia-forest", "xianxia-volcano"],
            ["xianxia-volcano", "xianxia-cave"],
            ["xianxia-cave", "xianxia-heaven"]
        ];

        // 构建HTML
        let html = `
        <style>
            .world-map-container {
                position: relative;
                width: 100%;
                height: 520px;
                border-radius: 12px;
                overflow: hidden;
            }
            .world-map-bg {
                position: absolute;
                inset: 0;
                opacity: 0.55;
            }
            .world-map-bg img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .map-svg-layer {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            .map-connection {
                stroke: rgba(150, 180, 220, 0.3);
                stroke-width: 1;
                fill: none;
            }
            .map-connection.active {
                stroke: rgba(96, 165, 250, 0.4);
                stroke-width: 1.5;
            }
            .map-node-abs {
                position: absolute;
                width: 65px;
                height: 65px;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 11px;
                text-align: center;
                transform: translate(-50%, -50%);
                pointer-events: auto;
                backdrop-filter: blur(8px);
                z-index: 10;
            }
            .map-node-abs.unlocked {
                background: linear-gradient(135deg, rgba(74, 158, 255, 0.95), rgba(59, 130, 246, 0.95));
                border: 3px solid #60a5fa;
                color: white;
                box-shadow: 0 0 18px rgba(74, 158, 255, 0.6);
            }
            .map-node-abs.unlocked:hover {
                transform: translate(-50%, -50%) scale(1.25);
                box-shadow: 0 0 35px rgba(74, 158, 255, 1);
                z-index: 20;
            }
            .map-node-abs.current {
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
                border: 4px solid #34d399;
                animation: pulse-glow 2s infinite;
                box-shadow: 0 0 30px rgba(16, 185, 129, 0.9);
            }
            .map-node-abs.locked {
                background: rgba(30, 30, 50, 0.9);
                border: 3px solid rgba(74, 158, 255, 0.3);
                color: #9ca3af;
                cursor: not-allowed;
            }
            .map-node-abs .name {
                font-weight: bold;
                font-size: 12px;
                line-height: 1.2;
                text-shadow: 0 1px 3px rgba(0,0,0,0.8);
            }
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); }
                50% { box-shadow: 0 0 45px rgba(16, 185, 129, 1); }
            }
        </style>
        <div class="world-map-container">
            <!-- 背景图片 -->
            <div class="world-map-bg">
                <img src="Images/world_map.jpg" alt="世界地图" onerror="this.parentElement.style.opacity=0">
            </div>

            <!-- SVG连接线层 -->
            <svg class="map-svg-layer" viewBox="0 0 100 100" preserveAspectRatio="none">`;

        // 绘制连接线
        connections.forEach(([from, to]) => {
            const fromPos = mapPositions[from];
            const toPos = mapPositions[to];
            if (!fromPos || !toPos) return;

            const fromMap = maps.find(m => m.type === from);
            const toMap = maps.find(m => m.type === to);
            const isActive = (fromMap?.isUnlocked || toMap?.isUnlocked);

            html += `<line class="map-connection ${isActive ? 'active' : ''}"
                x1="${fromPos.x}" y1="${fromPos.y}"
                x2="${toPos.x}" y2="${toPos.y}"/>`;
        });

        html += '</svg>';

        // 绘制地图节点
        Object.entries(mapPositions).forEach(([mapType, pos]) => {
            const map = maps.find(m => m.type === mapType);
            if (!map) return;

            let nodeClass = 'locked';
            let prefix = '🔒';
            if (map.isCurrent) {
                nodeClass = 'current';
                prefix = '📍';
            } else if (map.isUnlocked) {
                nodeClass = 'unlocked';
                prefix = '';
            }

            if (map.isUnlocked && !map.isCurrent) {
                html += `<div class="map-node-abs ${nodeClass}"
                    style="left: ${pos.x}%; top: ${pos.y}%;"
                    onclick="game.travelToMap('${mapType}')">
                    <span class="name">${pos.name}</span>
                </div>`;
            } else {
                html += `<div class="map-node-abs ${nodeClass}"
                    style="left: ${pos.x}%; top: ${pos.y}%;">
                    <span class="name">${prefix}${pos.name}</span>
                </div>`;
            }
        });

        html += '</div>';
        html += `
        <div class="text-center mt-4 p-3 rounded-lg bg-dark/50 border border-primary/10">
            <p class="text-sm text-light/70 flex items-center justify-center gap-4 flex-wrap">
                <span class="flex items-center gap-1.5">
                    <i class="fa fa-mouse-pointer text-primary text-xs"></i>
                    <span>点击节点移动</span>
                </span>
                <span class="w-px h-4 bg-primary/30"></span>
                <span class="flex items-center gap-1.5">
                    <i class="fa fa-bolt text-spirit text-xs"></i>
                    <span>消耗 10 灵力</span>
                </span>
                <span class="w-px h-4 bg-primary/30"></span>
                <span class="flex items-center gap-1.5">
                    <i class="fa fa-map-marker text-life text-xs"></i>
                    <span>当前位置</span>
                </span>
            </p>
        </div>`;

        // 显示在模态框中
        this.showSimpleMapModal(html);
    }

    // 简单地图选择弹窗
    showSimpleMapModal(html) {
        // 创建临时模态框
        let modal = document.createElement('div');
        modal.id = 'temp-map-modal';
        modal.className = 'fixed inset-0 bg-black/85 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="relative bg-dark-card rounded-xl p-5 w-[95vw] max-w-5xl mx-4 max-h-[90vh] overflow-auto border border-primary/30 backdrop-blur-sm shadow-2xl">
                <!-- 装饰性背景 -->
                <div class="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                <div class="absolute bottom-0 left-0 w-64 h-64 bg-spirit/5 rounded-full blur-3xl pointer-events-none"></div>
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/3 rounded-full blur-3xl pointer-events-none"></div>

                <!-- 标题 -->
                <div class="text-center mb-4 relative z-10">
                    <div class="flex items-center justify-center gap-3 mb-2">
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/40">
                            <i class="fa fa-globe text-white text-lg"></i>
                        </div>
                        <h2 class="text-2xl font-bold bg-gradient-to-r from-primary to-spirit-light bg-clip-text text-transparent">修仙世界</h2>
                    </div>
                    <p class="text-sm text-light/60">沿着灵脉探索各个神秘区域</p>
                </div>
                <!-- 内容区域 -->
                <div class="relative z-10">
                    ${html}
                </div>
                <!-- 关闭按钮 -->
                <button onclick="document.getElementById('temp-map-modal').remove()"
                    class="relative z-10 mt-4 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-gray-600 to-gray-500 text-white font-medium hover:opacity-80 transition-all hover:shadow-lg hover:shadow-gray-500/30 flex items-center justify-center gap-2">
                    <i class="fa fa-times"></i> 关闭地图
                </button>
            </div>
        `;
        document.body.appendChild(modal);

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 检查保存的登录状态
    async loadUserFromSession() {
        // 防止无限跳转循环
        const redirectCount = parseInt(sessionStorage.getItem('redirectCount') || '0');
        if (redirectCount > 3) {
            console.error('检测到跳转循环，停止自动跳转');
            sessionStorage.removeItem('redirectCount');
            this.addBattleLog('登录状态异常，请刷新页面或手动登录');
            return;
        }

        try {
            // 从 localStorage 中获取 token 和用户信息
            const token = localStorage.getItem('cultivationToken');
            const userStr = localStorage.getItem('cultivationUser');

            if (token && userStr) {
                try {
                    const userInfo = JSON.parse(userStr);

                    // 设置用户信息（loadGame 需要检查登录状态）
                    this._user = {
                        loggedIn: true,
                        username: userInfo.username,
                        userId: userInfo.userId,
                        gender: userInfo.gender,
                        role: userInfo.role || 'player'
                    };

                    // 加载游戏状态（等待完成）
                    const loadResult = await this.loadGame();

                    // ✅ 如果加载失败，停止后续初始化
                    if (loadResult === null) {
                        console.error('游戏加载失败，停止初始化');
                        return;
                    }

                    // ✅ 清理存档中可能残留的临时数据（防止脏数据）
                    this.transientState.enemy = null;
                    this.transientState.sceneMonsters = [];
                    this.transientState.battle = { inBattle: false, battleLog: [] };
                    console.log('✅ 已清理临时数据（enemy, sceneMonsters, battle）');

                    // 登录成功，清除跳转计数
                    sessionStorage.removeItem('redirectCount');

                    // 显示登录成功消息
                    this.addBattleLog(`登录成功！欢迎回来，${userInfo.username}！`);

                    // 登录成功后初始化游戏
                    this.initAfterLogin();
                } catch (parseError) {
                    console.error('解析用户信息失败:', parseError);
                    // 清除无效的登录状态，但不立即跳转
                    localStorage.removeItem('cultivationToken');
                    localStorage.removeItem('cultivationUser');
                    this.addBattleLog('登录状态已过期，请重新登录');

                    // 记录跳转次数
                    sessionStorage.setItem('redirectCount', (redirectCount + 1).toString());

                    // 延迟跳转，避免循环
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                }
            } else {
                // 未登录，延迟跳转到登录页面（给页面加载时间）
                console.log('未找到登录信息，2秒后跳转到登录页面');
                sessionStorage.setItem('redirectCount', (redirectCount + 1).toString());

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            console.error('检查登录状态失败:', error);
            // 发生错误，清除状态并延迟跳转
            localStorage.removeItem('cultivationToken');
            localStorage.removeItem('cultivationUser');
            sessionStorage.setItem('redirectCount', (redirectCount + 1).toString());

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }
    
    // 更新管理员控制按钮的显示状态
    updateAdminControls() {
        const isAdmin = this._user.role === 'admin';
        console.debug("新功能，待开发！");
    }

    // 可复用的条形更新函数（统一更新条形和文本显示）
    // elementPrefix: 元素ID前缀，如 'hp' 或 'energy'
    // current: 当前值
    // max: 最大值
    // suffixes: { bar: '-bar', display: '-display' } 后缀配置（可选，使用默认值）
    updateProgressBar(elementPrefix, current, max, suffixes = { bar: '-bar', display: '-display' }) {
        const percentage = max > 0 ? (current / max) * 100 : 0;

        // 更新条形宽度
        const barElement = document.getElementById(elementPrefix + suffixes.bar);
        if (barElement) {
            barElement.style.width = `${Math.min(percentage, 100)}%`;
        }

        // 更新文本显示
        const displayElement = document.getElementById(elementPrefix + suffixes.display);
        if (displayElement) {
            displayElement.textContent = `${Math.floor(current)}/${Math.floor(max)}`;
        }
    }

    // 更新UI显示
    updateUI() {
        // 确保persistentState和resources对象存在
        if (!this.persistentState) {
            this.persistentState = {};
        }
        if (!this.persistentState.resources) {
            this.persistentState.resources = {
                spiritStones: 0,
                jade: 0,
                herbs: 0,
                iron: 0,
                breakthroughStones: 0
            };
        }
        if (!this.persistentState.player) {
            this.persistentState.player = {
                energy: 100,
                maxEnergy: 100
            };
        }
        
        // 更新灵力条（使用统一函数更新主页面和人物面板）
        const energyCurrent = this.persistentState.player.energy || 0;
        const energyMax = this.persistentState.player.maxEnergy || 100;
        this.updateProgressBar('energy', energyCurrent, energyMax);  // 主页面
        this.updateProgressBar('energy', energyCurrent, energyMax, { bar: '-bar-modal', display: '-display-modal' });  // 人物面板

        // 保留旧的 energy 元素兼容性
        const energyElement = document.getElementById('energy');
        if (energyElement) {
            energyElement.textContent = Math.floor(energyCurrent);
        }

        // 新增：更新max-energy显示
        const maxEnergyElement = document.getElementById('max-energy');
        if (maxEnergyElement) {
            maxEnergyElement.textContent = energyMax;
        }

        // ✅ v2.0资源系统重构：更新资源显示
        // 灵石（spiritStones）
        const spiritStonesElement = document.getElementById('spirit-stones');
        if (spiritStonesElement) {
            spiritStonesElement.textContent = Math.floor(this.persistentState.resources.spiritStones || 0);
        }

        // 灵草（herbs）
        const herbsElement = document.getElementById('herbs');
        if (herbsElement) {
            herbsElement.textContent = Math.floor(this.persistentState.resources.herbs || 0);
        }

        // 玄铁（iron）
        const ironElement = document.getElementById('iron');
        if (ironElement) {
            ironElement.textContent = Math.floor(this.persistentState.resources.iron || 0);
        }
        
        // 计算装备效果
        this.equipmentSystem.calculateEquipmentEffects();

        // 使用统一方法获取最终属性
        const stats = this.getActualStats();
        const statsBreakdown = this.getStatsBreakdown();  // 用于获取各部分加成
        const realmBonus = {
            attack: statsBreakdown.attack.realm,
            defense: statsBreakdown.defense.realm,
            hp: statsBreakdown.maxHp.realm,
            luck: statsBreakdown.luck.realm,
            speed: statsBreakdown.speed.realm
        };

        const finalAttack = stats.attack;
        const finalDefense = stats.defense;
        const finalHp = this.persistentState.player.hp;  // 当前血量直接使用
        const finalLuck = stats.luck;
        const finalSpeed = stats.speed;
        const finalMaxHp = stats.maxHp;

        // 更新玩家属性显示
            const levelElement = document.getElementById('level');
            if (levelElement) {
                if (this.metadata.realmConfig) {
                    const realm = this.persistentState.player.realm;
                    const realmName = this.metadata.realmConfig[realm.currentRealm].name;
                    const stageConfig = this.metadata.realmConfig[realm.currentRealm].stages[realm.currentStage - 1];
                    const stageName = stageConfig.name;
                    levelElement.textContent = `${realmName} ${stageName} ${realm.currentStage}阶 ${realm.currentLevel}级`;
                } else {
                    levelElement.textContent = this.calculateTotalLevel();
                }
            }
            const expElement = document.getElementById('exp');
            if (expElement) {
                expElement.textContent = this.persistentState.player.exp;
            }
            const maxExpElement = document.getElementById('max-exp');
            if (maxExpElement) {
                maxExpElement.textContent = this.persistentState.player.maxExp;
            }
            // 更新经验条
            const expBarElement = document.getElementById('exp-bar');
            if (expBarElement) {
                const expPercentage = (this.persistentState.player.exp / this.persistentState.player.maxExp) * 100;
                expBarElement.style.width = `${Math.min(expPercentage, 100)}%`;
            }
            // 更新突破石显示
            const breakthroughStonesElement = document.getElementById('breakthrough-stones');
            if (breakthroughStonesElement) {
                breakthroughStonesElement.textContent = `${this.persistentState.resources.breakthroughStones || 0}`;
            }
            // 更新仙玉显示
            const jadeElement = document.getElementById('jade');
            if (jadeElement) {
                jadeElement.textContent = `${this.persistentState.resources.jade || 0}`;
            }
            // 更新VIP等级显示
            const vipBadgeElement = document.getElementById('nav-vip-badge');
            if (vipBadgeElement) {
                const vipLevel = this.persistentState.vip?.level || 0;
                const vipInfo = this.vipSystem.getVIPInfo();
                vipBadgeElement.textContent = vipLevel > 0 ? `VIP${vipLevel}·${vipInfo.label}` : '';
                vipBadgeElement.style.display = vipLevel > 0 ? 'flex' : 'none';
            }
            // 更新突破按钮状态
            this.updateBreakthroughState();

            const attackElement = document.getElementById('attack');
            if (attackElement) {
                const baseAttack = this.persistentState.player.baseAttack || (this.persistentState.player.attack - this.equipmentEffects.attack);
                const baseFinalAttack = baseAttack + this.equipmentEffects.attack;
                if (this.persistentState.player.tempAttack) {
                    attackElement.innerHTML = `${Math.floor(baseFinalAttack)}<span class="text-yellow-400">(${Math.floor(finalAttack)})</span>`;
                } else {
                    attackElement.textContent = Math.floor(finalAttack);
                }
                // 主UI使用简化版tooltip（纯文本）
                attackElement.title = this.getStatTooltipPlain('attack');
            }
            const defenseElement = document.getElementById('defense');
            if (defenseElement) {
                const baseDefense = this.persistentState.player.baseDefense || (this.persistentState.player.defense - this.equipmentEffects.defense);
                const baseFinalDefense = baseDefense + this.equipmentEffects.defense;
                if (this.persistentState.player.tempDefense) {
                    defenseElement.innerHTML = `${Math.floor(baseFinalDefense)}<span class="text-yellow-400">(${Math.floor(finalDefense)})</span>`;
                } else {
                    defenseElement.textContent = Math.floor(finalDefense);
                }
                // 主UI使用简化版tooltip（纯文本）
                defenseElement.title = this.getStatTooltipPlain('defense');
            }
            const hpDisplayElement = document.getElementById('hp-display');
            if (hpDisplayElement) {
                hpDisplayElement.textContent = `${Math.floor(finalHp)}/${Math.floor(finalMaxHp)}`;
            }

            // 保留旧的 hp 元素兼容性（某些地方可能还在使用）
            const hpElement = document.getElementById('hp');
            if (hpElement) {
                hpElement.textContent = Math.floor(finalHp);
            }

            // 更新血条（使用统一函数更新主页面和人物面板）
            this.updateProgressBar('hp', finalHp, finalMaxHp);  // 主页面
            this.updateProgressBar('hp', finalHp, finalMaxHp, { bar: '-bar-modal', display: '-display-modal' });  // 人物面板

            // 新增：更新max-hp显示
            const maxHpElement = document.getElementById('max-hp');
            if (maxHpElement) {
                maxHpElement.textContent = Math.floor(finalMaxHp);
            }

            // 新增：更新导航栏境界显示
            if (this.metadata.realmConfig) {
                const realm = this.persistentState.player.realm;
                const realmName = this.metadata.realmConfig[realm.currentRealm].name;
                const stageConfig = this.metadata.realmConfig[realm.currentRealm].stages[realm.currentStage - 1];
                const stageName = stageConfig.name;

                // 更新导航栏境界
                const navRealmName = document.getElementById('nav-realm-name');
                if (navRealmName) {
                    navRealmName.textContent = `${realmName}期`;
                }
                const navRealmStage = document.getElementById('nav-realm-stage');
                if (navRealmStage) {
                    navRealmStage.textContent = `· ${stageName}`;
                }
                // 更新境界阶数
                const navRealmLevel = document.getElementById('nav-realm-level');
                if (navRealmLevel) {
                    navRealmLevel.textContent = `（${realm.currentStage}阶）`;
                }

                // 更新人物面板境界显示
                const realmDisplay = document.getElementById('realm-display');
                if (realmDisplay) {
                    realmDisplay.textContent = `${realmName}期 · ${stageName}`;
                }
            }
            const luckElement = document.getElementById('luck');
            if (luckElement) {
                const baseLuck = this.persistentState.player.baseLuck || (this.persistentState.player.luck - this.equipmentEffects.luck);
                const baseFinalLuck = baseLuck + this.equipmentEffects.luck + realmBonus.luck;
                if (this.persistentState.player.tempLuck) {
                    luckElement.innerHTML = `${Math.floor(baseFinalLuck)}<span class="text-yellow-400">(${Math.floor(finalLuck)})</span>`;
                } else {
                    luckElement.textContent = Math.floor(finalLuck);
                }
            }
            const speedElement = document.getElementById('speed');
            if (speedElement) {
                const baseSpeed = this.persistentState.player.baseSpeed || (this.persistentState.player.speed - (this.equipmentEffects.speed || 0));
                const baseFinalSpeed = baseSpeed + (this.equipmentEffects.speed || 0) + (realmBonus.speed || 0);
                if (this.persistentState.player.tempSpeed) {
                    speedElement.innerHTML = `${Math.floor(baseFinalSpeed)}<span class="text-yellow-400">(${Math.floor(finalSpeed)})</span>`;
                } else {
                    speedElement.textContent = Math.floor(finalSpeed);
                }
            }

            // 更新暴击率显示（使用getActualStats获取小数格式，乘100显示百分比）
            const criticalRateElement = document.getElementById('critical-rate');
            if (criticalRateElement) {
                const criticalRate = stats.criticalRate;
                criticalRateElement.textContent = Math.floor(criticalRate * 100);
            }

        // 更新战力显示
        const combatPower = this.calculatePlayerCombatPower();
        const cpElement = document.getElementById('combat-power');
        if (cpElement) cpElement.textContent = combatPower.toLocaleString();
        const cpModalElement = document.getElementById('combat-power-modal');
        if (cpModalElement) cpModalElement.textContent = combatPower.toLocaleString();
        
        // 更新人物装备显示
        this.equipmentSystem.updateCharacterEquipmentDisplay();
        
        // 更新挂机时间显示
        const afkTimeElement = document.getElementById('afk-time');
        if (afkTimeElement) {
            afkTimeElement.textContent = this.formatTime(this.persistentState.settings.afkTime);
        }

        // 更新战斗日志
        this.updateBattleLog();
        
        // 更新用户信息
        const currentUserNav = document.getElementById('current-user-nav');
        if (currentUserNav) {
            currentUserNav.textContent = this._user.username;
        }
        const survivorName = document.getElementById('survivor-name');
        if (survivorName) {
            survivorName.textContent = this._user.username;
        }
        
        // 更新精炼信息
        this.equipmentSystem.updateRefineInfo(this.selectedRefineSlot);
        
    }
    
    // 格式化时间
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 开始属性恢复（生命/灵力）
    startStatRegeneration() {
        this.timers.resourceTimer = setInterval(() => {
            this.regeneratePlayerStats();
        }, 1000);
    }

    // 停止战斗音乐（移至 audio.js）
    stopBattleMusic() {
        // placeholder to avoid undefined calls
    }

    // 玩家属性自动恢复（生命/灵力）
    regeneratePlayerStats() {
        // 生命自动恢复（百分比恢复）
        const actualMaxHp = this.getActualStats().maxHp;
        if (this.persistentState.player.hp < actualMaxHp) {
            // 基础恢复0.5% + 装备加成百分比
            const hpRegenPercent = 0.5 + (this.equipmentEffects?.hpRegen || 0);
            const hpRegenRate = actualMaxHp * hpRegenPercent / 100;
            this.persistentState.player.hp = Math.min(
                this.persistentState.player.hp + hpRegenRate,
                actualMaxHp  // 恢复到加成后的最大血量
            );
        }

        // 灵力自动恢复（百分比恢复）
        const actualMaxEnergy = this.getActualStats().maxEnergy || this.persistentState.player.maxEnergy;
        if (this.persistentState.player && this.persistentState.player.energy !== undefined) {
            if (this.persistentState.player.energy < actualMaxEnergy) {
                // 基础恢复2% + 装备加成（energyRegen已是小数格式，乘100转为百分比）
                const stats = this.getActualStats();
                const baseRegenPercent = 2;
                const equipRegenBonus = (stats.energyRegen || 0) * 100; // 小数转百分比
                const energyRegenPercent = baseRegenPercent + equipRegenBonus;
                const energyRegenRate = actualMaxEnergy * energyRegenPercent / 100;
                this.persistentState.player.energy = Math.min(
                    this.persistentState.player.energy + energyRegenRate,
                    actualMaxEnergy
                );
            }
        } else {
            // 确保灵力属性存在
            if (!this.persistentState.player) {
                this.persistentState.player = {};
            }
            if (this.persistentState.player.energy === undefined) {
                this.persistentState.player.energy = 100;
            }
            if (this.persistentState.player.maxEnergy === undefined) {
                this.persistentState.player.maxEnergy = 100;
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

        // 自动战斗按钮 - 打开配置弹窗
        bindEvent('#auto-battle-btn', 'click', () => {
            this.openAutoBattleModal();
        });

        // 自动战斗配置弹窗
        bindEvent('#close-auto-battle-modal', 'click', () => {
            this.closeAutoBattleModal();
        });

        // 点击弹窗外部关闭
        const autoBattleModal = document.getElementById('auto-battle-modal');
        if (autoBattleModal) {
            autoBattleModal.addEventListener('click', (e) => {
                if (e.target === autoBattleModal) {
                    this.closeAutoBattleModal();
                }
            });
        }

        // 弹窗内的自动战斗目标颜色设置
        bindEvent('#modal-auto-battle-green', 'change', () => {
            this.updateAutoBattleTargetColorsFromModal();
        });
        bindEvent('#modal-auto-battle-yellow', 'change', () => {
            this.updateAutoBattleTargetColorsFromModal();
        });
        bindEvent('#modal-auto-battle-red', 'change', () => {
            this.updateAutoBattleTargetColorsFromModal();
        });

        // 弹窗内的开始/停止自动战斗按钮
        bindEvent('#modal-toggle-auto-battle-btn', 'click', () => {
            this.toggleAutoBattle();
        });

        // 手动攻击按钮
        bindEvent('#manual-attack-btn', 'click', () => {
            this.attackEnemy();
            this.closeAutoBattleModal();
        });

        // 注销账号按钮（导航栏）
        bindEvent('#delete-account-nav-btn', 'click', () => {
            this.openDeleteAccountModal();
        });

        // 注销账号弹窗
        bindEvent('#close-delete-account-modal', 'click', () => {
            this.closeDeleteAccountModal();
        });

        bindEvent('#cancel-delete-account', 'click', () => {
            this.closeDeleteAccountModal();
        });

        bindEvent('#confirm-delete-account', 'click', () => {
            this.confirmDeleteAccount();
        });

        // 点击弹窗外部关闭
        const deleteAccountModal = document.getElementById('delete-account-modal');
        if (deleteAccountModal) {
            deleteAccountModal.addEventListener('click', (e) => {
                if (e.target === deleteAccountModal) {
                    this.closeDeleteAccountModal();
                }
            });
        }

        // 自动战斗目标颜色设置（导航栏 - 保留兼容性）
        bindEvent('#auto-battle-green', 'change', () => {
            this.updateAutoBattleTargetColors();
        });
        bindEvent('#auto-battle-yellow', 'change', () => {
            this.updateAutoBattleTargetColors();
        });
        bindEvent('#auto-battle-red', 'change', () => {
            this.updateAutoBattleTargetColors();
        });

        // ❌ 已移除自动挂机开关（v2.0 - 使用autoBattleSettings替代）
        // ❌ 已移除资源采集弹窗（v2.0资源系统重构）
        // bindEvent('#collect-resources-btn', 'click', () => {
        //     this.openCollectResourcesModal();
        // });

        // bindEvent('#close-collect-resources-modal', 'click', () => {
        //     this.closeCollectResourcesModal();
        // });

        // const collectModal = document.getElementById('collect-resources-modal');
        // if (collectModal) {
        //     collectModal.addEventListener('click', (e) => {
        //         if (e.target === collectModal) {
        //             this.closeCollectResourcesModal();
        //         }
        //     });
        // }

        // ❌ 已移除自动采集checkbox的事件绑定（v2.0资源系统重构）
        // bindEvent('#modal-auto-collect-spiritWood', 'change', () => { ... });
        // bindEvent('#modal-auto-collect-blackIron', 'change', () => { ... });
        // bindEvent('#modal-auto-collect-spiritCrystal', 'change', () => { ... });

        // ❌ 已移除自动采集按钮事件（v2.0资源系统重构）
        // bindEvent('#modal-toggle-auto-collect-btn', 'click', () => {
        //     this.toggleAutoCollect();
        // });

        // ❌ 已移除手动采集按钮事件绑定（v2.0资源系统重构）
        // 资源现在只能通过资源副本获取

        // 商店弹窗
        bindEvent('#shop-btn', 'click', () => {
            this.openShopModal();
        });

        bindEvent('#close-shop-modal', 'click', () => {
            this.closeShopModal();
        });

        // 点击商店弹窗外部关闭
        const shopModal = document.getElementById('shop-modal');
        if (shopModal) {
            shopModal.addEventListener('click', (e) => {
                if (e.target === shopModal) {
                    this.closeShopModal();
                }
            });
        }

        // ==================== VIP充值按钮 ====================
        bindEvent('#recharge-btn', 'click', () => {
            this.openRechargeModal();
        });
        bindEvent('#close-recharge-modal', 'click', () => {
            this.closeRechargeModal();
        });
        const rechargeModal = document.getElementById('recharge-modal');
        if (rechargeModal) {
            rechargeModal.addEventListener('click', (e) => {
                if (e.target === rechargeModal) this.closeRechargeModal();
            });
        }

        // ==================== 仙玉商店按钮 ====================
        bindEvent('#vip-shop-btn', 'click', () => {
            this.openVIPShopModal();
        });
        bindEvent('#close-vip-shop-modal', 'click', () => {
            this.closeVIPShopModal();
        });
        const vipShopModal = document.getElementById('vip-shop-modal');
        if (vipShopModal) {
            vipShopModal.addEventListener('click', (e) => {
                if (e.target === vipShopModal) this.closeVIPShopModal();
            });
        }

        // ==================== 图鉴按钮 ====================
        bindEvent('#collection-btn', 'click', () => {
            this.openCollectionModal();
        });
        bindEvent('#close-collection-modal', 'click', () => {
            this.closeCollectionModal();
        });
        const collectionModal = document.getElementById('collection-modal');
        if (collectionModal) {
            collectionModal.addEventListener('click', (e) => {
                if (e.target === collectionModal) this.closeCollectionModal();
            });
        }
        bindEvent('#collection-enemy-tab', 'click', () => {
            this.renderCollection('enemy');
        });
        bindEvent('#collection-equip-tab', 'click', () => {
            this.renderCollection('equipment');
        });

        // 用户相关按钮
        
        bindEvent('#logout-btn', 'click', () => {
            this.logout();
        });

        // 悬浮战斗日志窗口最小化/展开
        bindEvent('#toggle-battle-log-btn', 'click', () => {
            this.toggleBattleLogWindow();
        });

        // 小地图弹窗切换
        bindEvent('#toggle-mini-map-btn', 'click', () => {
            this.toggleMiniMapPopup();
        });

        bindEvent('#close-mini-map-btn', 'click', () => {
            this.toggleMiniMapPopup(false);
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

        // 主线任务按钮
        bindEvent('#main-quest-btn', 'click', () => {
            this.mainQuestSystem.showMainQuestPanel();
        });

        // 每日任务按钮
        bindEvent('#daily-quest-btn', 'click', () => {
            this.dailyQuestSystem.showDailyQuestPanel();
        });

        // 资源副本按钮
        bindEvent('#dungeon-btn', 'click', () => {
            this.showDungeonList();
        });

        // 关闭主线任务模态框
        bindEvent('#close-quest-modal', 'click', () => {
            this.mainQuestSystem.hideMainQuestPanel();
        });

        // 主线任务标签页切换
        bindEvent('#quest-tab-current-btn', 'click', () => {
            const currentContent = document.getElementById('quest-tab-current-content');
            const storyContent = document.getElementById('quest-tab-story-content');
            const dailyContent = document.getElementById('quest-tab-daily-content');
            const currentBtn = document.getElementById('quest-tab-current-btn');
            const storyBtn = document.getElementById('quest-tab-story-btn');
            const dailyBtn = document.getElementById('quest-tab-daily-btn');
            if (currentContent) currentContent.classList.remove('hidden');
            if (storyContent) storyContent.classList.add('hidden');
            if (dailyContent) dailyContent.classList.add('hidden');
            if (currentBtn) { currentBtn.classList.add('text-gold', 'border-b-2', 'border-gold', 'font-medium'); currentBtn.classList.remove('text-white/50'); }
            if (storyBtn) { storyBtn.classList.remove('text-gold', 'border-b-2', 'border-gold', 'font-medium'); storyBtn.classList.add('text-white/50'); }
            if (dailyBtn) { dailyBtn.classList.remove('text-gold', 'border-b-2', 'border-gold', 'font-medium'); dailyBtn.classList.add('text-white/50'); }
        });

        bindEvent('#quest-tab-story-btn', 'click', () => {
            const currentContent = document.getElementById('quest-tab-current-content');
            const storyContent = document.getElementById('quest-tab-story-content');
            const dailyContent = document.getElementById('quest-tab-daily-content');
            const currentBtn = document.getElementById('quest-tab-current-btn');
            const storyBtn = document.getElementById('quest-tab-story-btn');
            const dailyBtn = document.getElementById('quest-tab-daily-btn');
            if (currentContent) currentContent.classList.add('hidden');
            if (storyContent) storyContent.classList.remove('hidden');
            if (dailyContent) dailyContent.classList.add('hidden');
            if (storyBtn) { storyBtn.classList.add('text-gold', 'border-b-2', 'border-gold', 'font-medium'); storyBtn.classList.remove('text-white/50'); }
            if (currentBtn) { currentBtn.classList.remove('text-gold', 'border-b-2', 'border-gold', 'font-medium'); currentBtn.classList.add('text-white/50'); }
            if (dailyBtn) { dailyBtn.classList.remove('text-gold', 'border-b-2', 'border-gold', 'font-medium'); dailyBtn.classList.add('text-white/50'); }
            this.mainQuestSystem.showStoryReview();
        });

        bindEvent('#quest-tab-daily-btn', 'click', () => {
            const currentContent = document.getElementById('quest-tab-current-content');
            const storyContent = document.getElementById('quest-tab-story-content');
            const dailyContent = document.getElementById('quest-tab-daily-content');
            const currentBtn = document.getElementById('quest-tab-current-btn');
            const storyBtn = document.getElementById('quest-tab-story-btn');
            const dailyBtn = document.getElementById('quest-tab-daily-btn');
            if (currentContent) currentContent.classList.add('hidden');
            if (storyContent) storyContent.classList.add('hidden');
            if (dailyContent) dailyContent.classList.remove('hidden');
            if (dailyBtn) { dailyBtn.classList.add('text-gold', 'border-b-2', 'border-gold', 'font-medium'); dailyBtn.classList.remove('text-white/50'); }
            if (currentBtn) { currentBtn.classList.remove('text-gold', 'border-b-2', 'border-gold', 'font-medium'); currentBtn.classList.add('text-white/50'); }
            if (storyBtn) { storyBtn.classList.remove('text-gold', 'border-b-2', 'border-gold', 'font-medium'); storyBtn.classList.add('text-white/50'); }
            this.dailyQuestSystem.updateDailyQuestUI();
        });

        // 剧情覆盖层点击翻页
        bindEvent('#story-overlay', 'click', () => {
            this.mainQuestSystem.nextStoryPage();
        });

        // 突破按钮
        bindEvent('#breakthrough-btn', 'click', () => {
            this.attemptBreakthrough();
        });

        // 技能树按钮
        bindEvent('#skill-tree-btn', 'click', () => {
            this.openSkillTreeModal();
        });

        // 关闭技能树模态窗口
        bindEvent('#close-skill-tree-modal', 'click', () => {
            this.closeSkillTreeModal();
        });
        
        // 关闭技能树模态窗口
        bindEvent('#close-skill-tree-modal', 'click', () => {
            this.closeSkillTreeModal();
        });

        // 点击模态窗口外部关闭
        const skillTreeModal = document.getElementById('skill-tree-modal');
        if (skillTreeModal) {
            skillTreeModal.addEventListener('click', (e) => {
                if (e.target === skillTreeModal) {
                    this.closeSkillTreeModal();
                }
            });
        }

        // 打开人物详情弹框
        bindEvent('#character-info-trigger', 'click', () => {
            this.openCharacterModal();
        });

        // 关闭人物详情弹框
        bindEvent('#close-character-modal', 'click', () => {
            this.closeCharacterModal();
        });

        // 点击人物弹框外部关闭
        const characterModal = document.getElementById('character-modal');
        if (characterModal) {
            characterModal.addEventListener('click', (e) => {
                if (e.target === characterModal) {
                    this.closeCharacterModal();
                }
            });
        }

        // 人物弹框内的装备槽点击
        document.querySelectorAll('.equipment-slot-modal').forEach(slot => {
            slot.addEventListener('click', () => {
                const selectedSlot = slot.dataset.slot;
                this.selectedRefineSlot = selectedSlot;
                // 更新精炼信息
                this.equipmentSystem.updateRefineInfoModal(selectedSlot);
                // 更新选中样式
                document.querySelectorAll('.equipment-slot-modal').forEach(s => {
                    s.classList.remove('border-accent', 'border-gold');
                    s.classList.add('border-primary/30');
                });
                slot.classList.remove('border-primary/30');
                slot.classList.add('border-gold');
            });

            // 双击装备槽脱下装备
            slot.addEventListener('dblclick', () => {
                const selectedSlot = slot.dataset.slot;
                this.equipmentSystem.unequipEquipment(selectedSlot);
            });
        });

        // 人物弹框内的精炼按钮
        bindEvent('#refine-weapon-btn-modal', 'click', () => {
            const slot = this.selectedRefineSlot || 'weapon';
            this.equipmentSystem.refineEquipment(slot);
            this.equipmentSystem.updateRefineInfoModal(slot);
        });

        // 人物弹框内的刷新按钮
        bindEvent('#refresh-equipment-btn-modal', 'click', () => {
            const slot = this.selectedRefineSlot || 'weapon';
            this.equipmentSystem.previewRefreshStats(slot);
        });

        // 人物弹框内的突破按钮
        bindEvent('#breakthrough-btn-modal', 'click', () => {
            this.attemptBreakthrough();
        });

        // 人物弹框内的自动装备按钮
        bindEvent('#auto-equip-btn-modal', 'click', () => {
            this.equipmentSystem.autoEquipBestGear();
        });

        // 关闭技能详情面板
        bindEvent('#close-skill-detail', 'click', () => {
            const placeholder = document.getElementById('skill-detail-placeholder');
            const content = document.getElementById('skill-detail-content');

            if (content) content.classList.add('hidden');
            if (placeholder) placeholder.classList.remove('hidden');
        });

        // 为装备槽位添加点击事件
        try {
            const equipmentSlots = document.querySelectorAll('.equipment-slot');
            equipmentSlots.forEach(slot => {
                slot.addEventListener('click', () => {
                        const selectedSlot = slot.dataset.slot;
                        this.equipmentSystem.updateRefineInfo(selectedSlot);
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
                    const item = this.persistentState.player.equipment[selectedSlot];
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
            this.equipmentSystem.refineEquipment(slot);
        });

        // 刷新装备属性按钮
        bindEvent('#refresh-equipment-btn', 'click', () => {
            const slot = this.selectedRefineSlot || 'weapon';
            this.equipmentSystem.previewRefreshStats(slot);
        });



        // 一键装备最好的装备按钮
        bindEvent('#auto-equip-btn', 'click', () => {
            this.equipmentSystem.autoEquipBestGear();
        });
        
        // 特殊技按钮
        bindEvent('#skill-0', 'click', () => {
            this.useSkill();
        });

        bindEvent('#skill-1', 'click', () => {
            this.useSkill();
        });

        bindEvent('#skill-2', 'click', () => {
            this.useSkill();
        });


        bindEvent('#skill-3', 'click', () => {
            this.useSkill();
        });

        bindEvent('#skill-4', 'click', () => {
            this.useSkill();
        });

        bindEvent('#skill-5', 'click', () => {
            this.useSkill();
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

        bindEvent('#buy-speed-potion', 'click', () => {
            this.buyShopItem('speed_potion');
        });

        bindEvent('#buy-luck-potion', 'click', () => {
            this.buyShopItem('luck_potion');
        });

        bindEvent('#buy-white-equipment-box', 'click', () => {
            this.buyShopItem('white_equipment_box');
        });
        
        // 注销账号按钮
        bindEvent('#delete-account-btn', 'click', () => {
            this.deleteAccount();
        });

        // 刷新敌人按钮
        bindEvent('#refresh-enemy-btn', 'click', () => {
            // 不再随机切换地图，只刷新当前地图的敌人
            this.generateMiniMap();
            const currentMap = this.metadata.mapBackgrounds[this.persistentState.currentBackgroundIndex];
            this.addBattleLog(`刷新了${currentMap ? currentMap.name : '当前地图'}的敌人！`);
            this.updateUI();
        });

        // 召唤任务Boss按钮
        bindEvent('#spawn-quest-boss-btn', 'click', () => {
            this.forceSpawnQuestBoss();
        });

        // 地图移动按钮
        bindEvent('#travel-map-btn', 'click', () => {
            this.showMapSelectionPanel();
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

        // 键盘松开事件（飞行升降按键状态清除）
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (this.flyKeys) {
                if (key === 'q') this.flyKeys.q = false;
                if (key === 'e') this.flyKeys.e = false;
            }
        });
        
        // 添加页面卸载时保存数据的事件监听器
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
        });

        // 添加定期保存机制
        setInterval(() => {
            this.saveGameState();
        }, 60000); // 每60秒自动保存

        // ==================== 资源副本事件绑定 ====================

        // 副本按钮委托事件（动态生成的按钮需要委托）
        document.addEventListener('click', (e) => {
            // 副本挑战按钮
            if (e.target.closest('.dungeon-btn')) {
                const btn = e.target.closest('.dungeon-btn');
                const dungeonId = btn.dataset.dungeon;
                const difficulty = btn.dataset.difficulty;

                if (dungeonId && difficulty && !btn.disabled) {
                    this.dungeon.enterDungeon(dungeonId, difficulty);
                }
            }

            // 扫荡按钮
            if (e.target.closest('.sweep-btn')) {
                const btn = e.target.closest('.sweep-btn');
                const dungeonId = btn.dataset.dungeon;
                const difficulty = btn.dataset.difficulty;

                if (dungeonId && difficulty && !btn.disabled) {
                    this.dungeon.sweepDungeon(dungeonId, difficulty);
                }
            }

            // 退出副本按钮（在3D战斗场景中）
            if (e.target.closest('#exit-dungeon-btn')) {
                if (this.dungeon.currentDungeon) {
                    this.dungeon.exitDungeonManually();
                }
            }
        });
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

        // 隐藏Boss的灵力条
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

    // 检查升级
    checkLevelUp() {
   
        if (this.persistentState.player.exp >= this.persistentState.player.maxExp) {
            const realm = this.persistentState.player.realm;
            const currentRealmConfig = this.metadata.realmConfig[realm.currentRealm];
            const currentStageConfig = currentRealmConfig.stages[realm.currentStage - 1];
            
            // 检查是否达到当前阶段的等级上限
            if (realm.currentLevel < currentStageConfig.levelCap) {
                // 升级
                realm.currentLevel++;
                this.persistentState.player.exp -= this.persistentState.player.maxExp;
                this.persistentState.player.maxExp = Math.floor(this.persistentState.player.maxExp * 1.5);

                // 记录升级前战力
                const oldPower = this.calculatePlayerCombatPower();

                // 根据境界提升属性加成
                const realmBonus = {
                    0: { hp: 20, atk: 3, def: 2, energy: 10 },  // 武者
                    1: { hp: 30, atk: 4, def: 3, energy: 15 },  // 炼气
                    2: { hp: 50, atk: 6, def: 4, energy: 20 },  // 筑基
                    3: { hp: 80, atk: 10, def: 6, energy: 30 }, // 金丹
                    4: { hp: 120, atk: 15, def: 10, energy: 50 }, // 元婴
                    5: { hp: 200, atk: 25, def: 15, energy: 80 }  // 化神
                };
                const bonus = realmBonus[realm.currentRealm] || realmBonus[0];

                // 提升属性
                this.persistentState.player.attack += bonus.atk;
                this.persistentState.player.defense += bonus.def;
                this.persistentState.player.maxHp += bonus.hp;
                this.persistentState.player.luck += 1;

                // 提升灵力上限
                this.persistentState.player.maxEnergy += bonus.energy;

                // 升级时恢复到加成后的最大值
                const actualStats = this.getActualStats();
                this.persistentState.player.hp = actualStats.maxHp;
                this.persistentState.player.energy = actualStats.maxEnergy;

                // 播放升级声音
                this.audioSystem.playSound('levelup-sound', 1, 2000);
                
                this.addBattleLog(`恭喜你升级到${realm.currentLevel}级！灵力上限提升了10点！`);

                // 显示战力变化
                const newPower = this.calculatePlayerCombatPower();
                this.showCombatPowerChange(newPower - oldPower);

                // 主线任务进度追踪 - 达到等级
                if (this.mainQuestSystem) {
                    this.mainQuestSystem.trackMainQuestProgress('level_up', {
                        newLevel: realm.currentLevel
                    });
                }

                // 升级后：仅在当前等级所有任务完成时才初始化新任务
                if (this.mainQuestSystem) {
                    const mq = this.persistentState.mainQuest;
                    const currentQuests = this.mainQuestSystem.getCurrentLevelQuests();
                    const isAllDone = !currentQuests || currentQuests.length === 0 ||
                        mq.currentLevelQuestIndex >= currentQuests.length ||
                        (mq.currentLevelQuestIndex === currentQuests.length - 1 &&
                         mq.questData[currentQuests[mq.currentLevelQuestIndex]?.id]?.completed);
                    if (isAllDone) {
                        this.mainQuestSystem.initLevelQuests(realm.currentRealm, realm.currentStage, realm.currentLevel);
                    }
                }

                // 触发升级动画
                this.triggerLevelUpAnimation();
                
                console.log('升级逻辑执行完成');
            } else {
                // 达到当前阶段等级上限，提示突破
                this.addBattleLog(`已达到${currentStageConfig.name}等级上限，需要突破到下一阶段！`);
                this.persistentState.player.exp = this.persistentState.player.maxExp; // 保持经验值不变
            }
        }
    }
    
    // 触发升级动画
    triggerLevelUpAnimation() {
        const levelElement = document.getElementById('level-modal');
        if (levelElement) {
            levelElement.classList.add('level-up-animation');
            setTimeout(() => {
                levelElement.classList.remove('level-up-animation');
            }, 1000);
        }
    }
    
    // 根据性别更新人物形象
    updateCharacterBodyImage() {
        const characterBodyElement = document.getElementById('character-body');
        const characterAvatarElement = document.getElementById('character-avatar');
        const timestamp = new Date().getTime();

        let imageSrc = 'Images/default-character.png';
        if (this._user.loggedIn && this._user.gender) {
            if (this._user.gender === '男') {
                imageSrc = `Images/male-character-${this.persistentState.player.realm.currentRealm + 1}.png?${timestamp}`;
            } else if (this._user.gender === '女') {
                imageSrc = `Images/female-character-${this.persistentState.player.realm.currentRealm + 1}.png?${timestamp}`;
            }
        }

        // 更新人物立绘
        if (characterBodyElement) {
            characterBodyElement.src = imageSrc;
        }

        // 更新头像
        if (characterAvatarElement) {
            characterAvatarElement.src = imageSrc;
        }
    }
    
    // 更新人物装备显示

    
    // 计算境界加成
    calculateRealmBonus() {
        const realm = this.persistentState.player.realm;
        const currentRealmConfig = this.metadata.realmConfig[realm.currentRealm];
        const currentStageConfig = currentRealmConfig.stages[realm.currentStage - 1];
        
        // 基础加成（当前阶段）
        const baseBonus = currentStageConfig.bonus;
        
        // 累计加成（前面所有阶段）
        let totalBonus = { attack: 0, defense: 0, hp: 0, luck: 0 };
        
        // 计算当前境界之前所有境界的加成
        for (let i = 0; i < realm.currentRealm; i++) {
            const previousRealm = this.metadata.realmConfig[i];
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

    /**
     * 获取玩家的所有实际属性（包含装备、境界和VIP加成）
     * @returns {Object} 包含所有实际属性的对象
     */
    getActualStats() {
        // 使用 getter 获取装备效果（自动缓存）
        const ee = this.equipmentEffects || {};
        const p = this.persistentState.player;
        const rb = this.metadata.realmConfig ? this.calculateRealmBonus() : { attack: 0, defense: 0, hp: 0, luck: 0, speed: 0 };

                // 百分比属性列表
        const percentageStats = ['criticalRate', 'dodgeRate', 'accuracy', 'tenacity', 'moveSpeed', 'energyRegen'];

        // 先计算基础+装备+境界的属性
        // 注意：内部统一使用小数格式（0.05表示5%），显示时才转换为百分比
        const baseStats = {
            attack: p.attack + (ee.attack || 0) + rb.attack,
            defense: p.defense + (ee.defense || 0) + rb.defense,
            hp: p.hp,  // 当前血量（无加成）
            maxHp: p.maxHp + (ee.hp || 0) + rb.hp,
            speed: (p.speed || 0) + (ee.speed || 0) + (rb.speed || 0),
            luck: p.luck + (ee.luck || 0) + rb.luck,
            // 百分比属性：玩家基础需要转换为小数格式（除以100），装备已是小数格式
            // 幸运加成：命中率 +luck×0.001(每点幸运+0.1%)，暴击率 +luck×0.0005(每点幸运+0.05%)
            criticalRate: ((p.criticalRate || 5) / 100) + (ee.criticalRate || 0) + ((p.luck + (ee.luck || 0) + rb.luck) * 0.0005),
            // 速度加成：闪避率 +(speed-10)×0.0025 (每10点速度超基础+2.5%闪避)
            dodgeRate: ((p.dodgeRate || 0) / 100) + (ee.dodgeRate || 0) + Math.max(0, ((p.speed || 0) + (ee.speed || 0) + (rb.speed || 0) - 10) * 0.0025),
            // 幸运加成：命中率 +luck×0.001
            accuracy: ((p.accuracy || 100) / 100) + (ee.accuracy || 0) + ((p.luck + (ee.luck || 0) + rb.luck) * 0.001),
            tenacity: ((p.tenacity || 0) / 100) + (ee.tenacity || 0),
            moveSpeed: ((p.moveSpeed || 0) / 100) + (ee.moveSpeed || 0),
            energyRegen: ((p.energyRegen || 0) / 100) + (ee.energyRegen || 0),
            maxEnergy: (p.maxEnergy || 100) + (ee.maxEnergy || 0),  // 最大灵力（含装备加成）
            critDamage: (p.critDamage || 0) + (ee.critDamage || 0)  // 暴击伤害值（用于计算暴击倍率）
        };

        // 注意：VIP加成已在 equipmentSystem.calculateEquipmentEffects() 中
        // 叠加到 equipmentEffects 上，因此这里不需要再单独计算
        return baseStats;
    }

    /**
     * 获取敌人的实际属性（统一属性计算）
     * 敌人没有装备，只有基础属性
     * @returns {Object} 包含所有实际属性的对象
     */
    getEnemyActualStats() {
        const e = this.transientState.enemy;
        if (!e) return null;

        // 敌人属性：直接使用基础值，但需要转换百分比属性为小数格式
        // 注意：敌人的 accuracy/dodge/criticalRate 存储的是百分比格式（如90表示90%）
        // 速度和幸运也会影响命中、暴击和闪避
        const speed = e.speed || 10;
        const luck = e.luck || 0;

        return {
            attack: e.attack || 0,
            defense: e.defense || 0,
            hp: e.hp || 0,
            maxHp: e.maxHp || 0,
            speed: speed,
            luck: luck,
            // 百分比属性转换为小数格式（90% → 0.9）
            // 幸运加成：命中率 +luck×0.001，暴击率 +luck×0.0005
            criticalRate: ((e.criticalRate || 0) / 100) + (luck * 0.0005),
            // 速度加成：闪避率 +(speed-10)×0.0025
            dodgeRate: ((e.dodge || 0) / 100) + Math.max(0, (speed - 10) * 0.0025),
            // 幸运加成：命中率 +luck×0.001
            accuracy: ((e.accuracy || 90) / 100) + (luck * 0.001),
            tenacity: ((e.tenacity || 0) / 100),
            moveSpeed: ((e.moveSpeed || 0) / 100),
            energyRegen: ((e.energyRegen || 0) / 100),
            maxEnergy: e.maxEnergy || 100,
            critDamage: e.critDamage || 0  // 敌人暴击伤害值
        };
    }

    /**
     * 计算暴击倍率（线性公式）
     * critDamage值越高，暴击倍率越高
     * 公式：暴击倍率 = 1.5 + (critDamage / 100)
     * @param {number} critDamageValue - 暴击伤害值
     * @returns {Object} { multiplier, name }
     */
    rollCritDamage(critDamageValue) {
        const critDmg = critDamageValue || 0;
        // 线性公式：基础1.5倍，每100点暴伤增加1倍
        const multiplier = 1.5 + (critDmg / 100);
        return { multiplier: Math.round(multiplier * 100) / 100, name: '暴击' };
    }

    /**
     * 绑定自定义tooltip到元素（与背包tooltip风格一致）
     * @param {HTMLElement} element - 目标元素
     * @param {Function} contentGetter - 获取tooltip内容的函数
     */
    bindCustomTooltip(element, contentGetter) {
        if (!element) return;

        // 移除原生title属性
        const originalTitle = element.title;
        element.removeAttribute('title');
        element.dataset.originalTitle = originalTitle || '';

        // 鼠标进入 - 显示tooltip
        element.addEventListener('mouseenter', (e) => {
            // ✅ 清理旧的tooltip（防止多个tooltip同时存在）
            document.querySelectorAll('#custom-stat-tooltip').forEach(tooltip => tooltip.remove());

            const content = typeof contentGetter === 'function' ? contentGetter() : contentGetter;
            if (!content) return;

            const tooltip = document.createElement('div');
            tooltip.className = 'fixed z-[9999] bg-dark/95 border border-accent/50 rounded-lg px-3 py-2 text-xs text-white shadow-xl backdrop-blur-sm max-w-xs';
            tooltip.id = 'custom-stat-tooltip';
            tooltip.innerHTML = content;
            tooltip.style.pointerEvents = 'none';

            document.body.appendChild(tooltip);

            // 计算位置（确保不超出屏幕）
            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            let left = rect.left;
            let top = rect.bottom + 8;

            // 如果右边超出屏幕，向左对齐
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }

            // 如果下边超出屏幕，显示在上方
            if (top + tooltipRect.height > window.innerHeight - 10) {
                top = rect.top - tooltipRect.height - 8;
            }

            tooltip.style.left = `${Math.max(10, left)}px`;
            tooltip.style.top = `${top}px`;
        });

        // 鼠标离开 - 隐藏tooltip
        element.addEventListener('mouseleave', () => {
            const tooltip = document.getElementById('custom-stat-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    }

    /**
     * 获取属性详细来源（用于UI显示）
     * @returns {Object} 包含各部分加成详情
     */
    getStatsBreakdown() {
        const p = this.persistentState.player;
        const ee = this.equipmentEffects || {};
        const rb = this.metadata.realmConfig ? this.calculateRealmBonus() : { attack: 0, defense: 0, hp: 0, luck: 0, speed: 0 };
        const vipBonus = this.vipSystem ? this.vipSystem.getBonus() : { attackBonus: 0, defenseBonus: 0, hpBonus: 0, critBonus: 0 };

        return {
            attack: {
                base: p.attack,
                equipment: ee.attack || 0,
                realm: rb.attack,
                vipPercent: vipBonus.attackBonus,
                final: p.attack + (ee.attack || 0) + rb.attack
            },
            defense: {
                base: p.defense,
                equipment: ee.defense || 0,
                realm: rb.defense,
                vipPercent: vipBonus.defenseBonus,
                final: p.defense + (ee.defense || 0) + rb.defense
            },
            maxHp: {
                base: p.maxHp,
                equipment: ee.hp || 0,
                realm: rb.hp,
                vipPercent: vipBonus.hpBonus,
                final: p.maxHp + (ee.hp || 0) + rb.hp
            },
            luck: {
                base: p.luck,
                equipment: ee.luck || 0,
                realm: rb.luck,
                final: p.luck + (ee.luck || 0) + rb.luck
            },
            speed: {
                base: p.speed || 0,
                equipment: ee.speed || 0,
                realm: rb.speed || 0,
                final: (p.speed || 0) + (ee.speed || 0) + (rb.speed || 0)
            },
            criticalRate: {
                base: (p.criticalRate || 5) / 100,  // 转换为小数
                equipment: ee.criticalRate || 0,
                luckBonus: ((p.luck + (ee.luck || 0) + (rb.luck || 0)) * 0.001),  // 幸运加成
                vip: (vipBonus.critBonus || 0) / 100,  // VIP加成也转为小数
                final: ((p.criticalRate || 5) / 100) + (ee.criticalRate || 0) + ((p.luck + (ee.luck || 0) + (rb.luck || 0)) * 0.001)
            },
            dodgeRate: {
                base: (p.dodgeRate || 0) / 100,
                equipment: ee.dodgeRate || 0,
                speedBonus: Math.max(0, ((p.speed || 0) + (ee.speed || 0) + (rb.speed || 0) - 10) * 0.005),  // 速度加成
                final: ((p.dodgeRate || 0) / 100) + (ee.dodgeRate || 0) + Math.max(0, ((p.speed || 0) + (ee.speed || 0) + (rb.speed || 0) - 10) * 0.005)
            },
            accuracy: {
                base: (p.accuracy || 100) / 100,
                equipment: ee.accuracy || 0,
                luckBonus: ((p.luck + (ee.luck || 0) + (rb.luck || 0)) * 0.002),  // 幸运加成
                final: ((p.accuracy || 100) / 100) + (ee.accuracy || 0) + ((p.luck + (ee.luck || 0) + (rb.luck || 0)) * 0.002)
            },
            tenacity: {
                base: (p.tenacity || 0) / 100,
                equipment: ee.tenacity || 0,
                final: ((p.tenacity || 0) / 100) + (ee.tenacity || 0)
            },
            moveSpeed: {
                base: (p.moveSpeed || 0) / 100,
                equipment: ee.moveSpeed || 0,
                final: ((p.moveSpeed || 0) / 100) + (ee.moveSpeed || 0)
            },
            energyRegen: {
                base: (p.energyRegen || 0) / 100,
                equipment: ee.energyRegen || 0,
                final: ((p.energyRegen || 0) / 100) + (ee.energyRegen || 0)
            },
            maxEnergy: {
                base: p.maxEnergy || 100,
                equipment: ee.maxEnergy || 0,
                final: (p.maxEnergy || 100) + (ee.maxEnergy || 0)
            },
            critDamage: {
                base: p.critDamage || 0,
                equipment: ee.critDamage || 0,
                final: (p.critDamage || 0) + (ee.critDamage || 0)
            }
        };
    }

    /**
     * 生成属性详情提示文本
     * @param {string} statName - 属性名称 (attack/defense/maxHp等)
     * @returns {string} 提示文本
     */
    getStatTooltip(statName) {
        const breakdown = this.getStatsBreakdown();
        const stat = breakdown[statName];
        if (!stat) return '';

        // 百分比属性列表（内部使用小数，显示时乘100）
        const percentageStats = ['criticalRate', 'dodgeRate', 'accuracy', 'tenacity', 'moveSpeed', 'energyRegen'];
        const isPercentage = percentageStats.includes(statName);

        // 格式化函数：百分比属性乘100显示
        const formatValue = (val) => isPercentage ? (val * 100).toFixed(1) : Math.floor(val);
        // 单位后缀
        const unit = isPercentage ? '%' : '';

        const lines = [];
        lines.push(`<div class="flex justify-between gap-4"><span class="text-light/60">基础</span><span class="text-white font-medium">${formatValue(stat.base)}${unit}</span></div>`);

        if (stat.equipment > 0) {
            lines.push(`<div class="flex justify-between gap-4"><span class="text-light/60">装备</span><span class="text-accent">+${formatValue(stat.equipment)}${unit}</span></div>`);
        }

        if (stat.realm > 0) {
            lines.push(`<div class="flex justify-between gap-4"><span class="text-light/60">境界</span><span class="text-spirit">+${formatValue(stat.realm)}${unit}</span></div>`);
        }

        // 显示幸运加成（暴击率、命中率）
        if (stat.luckBonus && stat.luckBonus > 0) {
            lines.push(`<div class="flex justify-between gap-4"><span class="text-light/60">幸运加成</span><span class="text-yellow-400">+${formatValue(stat.luckBonus)}${unit}</span></div>`);
        }

        // 显示速度加成（闪避率）
        if (stat.speedBonus && stat.speedBonus > 0) {
            lines.push(`<div class="flex justify-between gap-4"><span class="text-light/60">速度加成</span><span class="text-cyan-400">+${formatValue(stat.speedBonus)}${unit}</span></div>`);
        }

        if (stat.vip && stat.vip > 0) {
            lines.push(`<div class="flex justify-between gap-4"><span class="text-light/60">VIP</span><span class="text-gold">+${formatValue(stat.vip)}${unit}</span></div>`);
        }

        lines.push(`<div class="border-t border-white/10 my-1"></div>`);
        lines.push(`<div class="flex justify-between gap-4"><span class="text-light/70 font-medium">最终</span><span class="text-white font-bold">${formatValue(stat.final)}${unit}</span></div>`);

        return lines.join('');
    }

    /**
     * 获取属性tooltip纯文本版本（用于主UI的title属性）
     */
    getStatTooltipPlain(statName) {
        const breakdown = this.getStatsBreakdown();
        const stat = breakdown[statName];
        if (!stat) return '';

        const percentageStats = ['criticalRate', 'dodgeRate', 'accuracy', 'tenacity', 'moveSpeed', 'energyRegen'];
        const isPercentage = percentageStats.includes(statName);
        const formatValue = (val) => isPercentage ? (val * 100).toFixed(1) : Math.floor(val);
        const unit = isPercentage ? '%' : '';

        const lines = [];
        lines.push(`基础: ${formatValue(stat.base)}${unit}`);
        if (stat.equipment > 0) lines.push(`装备: +${formatValue(stat.equipment)}${unit}`);
        if (stat.realm > 0) lines.push(`境界: +${formatValue(stat.realm)}${unit}`);
        if (stat.luckBonus > 0) lines.push(`幸运: +${formatValue(stat.luckBonus)}${unit}`);
        if (stat.speedBonus > 0) lines.push(`速度: +${formatValue(stat.speedBonus)}${unit}`);
        if (stat.vip > 0) lines.push(`VIP: +${formatValue(stat.vip)}${unit}`);
        lines.push(`──────`);
        lines.push(`最终: ${formatValue(stat.final)}${unit}`);

        return lines.join('\n');
    }

    // ========== 战力系统 ==========

    /**
     * 通用战力计算
     * @param {Object} stats - 含 attack/defense/hp/speed/luck/criticalRate/dodgeRate/accuracy/tenacity
     * @returns {number} 战力值
     */
    /**
     * 递减收益函数（类似韧性公式）
     * 基础值内的部分正常计算，超出部分收益减半
     */
    calculateDiminishingValue(value, baseline, weightAbove, weightBelow) {
        if (value <= baseline) {
            return value * weightBelow;
        }
        return baseline * weightBelow + (value - baseline) * weightAbove;
    }

    /**
     * 计算战力（基于属性）
     * 百分比属性使用递减收益：超过阈值后收益减半
     */
    calculateCombatPower(stats) {
        const BASE = EndlessCultivationGame.COMBAT_POWER_BASE;
        const W = EndlessCultivationGame.COMBAT_POWER_WEIGHTS;
        const PW = EndlessCultivationGame.COMBAT_POWER_PCT_WEIGHTS;
        const PB = EndlessCultivationGame.COMBAT_POWER_PCT_BASELINE;

        let power = 0;

        // 平坦属性：全量计算
        power += (stats.attack || 0) * W.attack;
        power += (stats.defense || 0) * W.defense;
        power += (stats.hp || 0) * W.hp;
        power += (stats.speed || 0) * W.speed;
        power += (stats.luck || 0) * W.luck;
        power += (stats.critDamage || 0) * (W.critDamage || 0.5);  // v2.3新增

        // 百分比属性：使用递减收益
        // 暴击率：0-50%正常权重，50%以上收益减半
        const critValue = (stats.criticalRate || 0) - (PB.criticalRate || 0);
        if (critValue > 0) {
            power += this.calculateDiminishingValue(
                critValue + PB.criticalRate,
                0.50,  // 50%是分界点
                PW.criticalRate * 0.5,  // 超出部分权重减半
                PW.criticalRate
            ) - PB.criticalRate * PW.criticalRate;
        }

        // 闪避率：0-50%正常权重，50%以上收益减半
        const dodgeValue = (stats.dodgeRate || 0) - (PB.dodgeRate || 0);
        if (dodgeValue > 0) {
            power += this.calculateDiminishingValue(
                dodgeValue + PB.dodgeRate,
                0.50,
                PW.dodgeRate * 0.5,
                PW.dodgeRate
            ) - PB.dodgeRate * PW.dodgeRate;
        }

        // 命中率：0-120%正常权重，120%以上收益减半
        const accValue = (stats.accuracy || 0) - (PB.accuracy || 0);
        if (accValue > 0) {
            power += this.calculateDiminishingValue(
                accValue + PB.accuracy,
                1.20,  // 120%是分界点
                PW.accuracy * 0.5,
                PW.accuracy
            ) - PB.accuracy * PW.accuracy;
        }

        // 韧性：0-50%正常权重，50%以上收益减半
        const tenacityValue = (stats.tenacity || 0) - (PB.tenacity || 0);
        if (tenacityValue > 0) {
            power += this.calculateDiminishingValue(
                tenacityValue + PB.tenacity,
                0.50,
                PW.tenacity * 0.5,
                PW.tenacity
            );
        }

        return Math.floor(power * BASE / 100);
    }

    /**
     * 计算玩家总战力（基础 + 装备 + 境界加成）
     */
    calculatePlayerCombatPower() {
        const stats = this.getActualStats();
        return this.calculateCombatPower({
            attack: stats.attack,
            defense: stats.defense,
            hp: stats.maxHp,
            speed: stats.speed,
            luck: stats.luck,
            criticalRate: stats.criticalRate,
            dodgeRate: stats.dodgeRate,
            accuracy: stats.accuracy,
            tenacity: stats.tenacity,
            critDamage: stats.critDamage  // v2.3新增
        });
    }

    /**
     * 计算单件装备战力（含精炼加成）
     */
    calculateEquipmentCombatPower(item) {
        if (!item || !item.stats) return 0;
        const refineLevel = item.refineLevel || 0;
        const percentageStats = ['criticalRate', 'dodgeRate', 'tenacity', 'accuracy', 'moveSpeed', 'energyRegen'];
        const effectiveStats = {};
        for (const stat in item.stats) {
            let bonus = 0;
            if (refineLevel > 0) {
                if (percentageStats.includes(stat)) {
                    bonus = item.stats[stat] * refineLevel * 0.1;
                } else {
                    bonus = Math.max(refineLevel, Math.floor(item.stats[stat] * refineLevel * 0.1));
                }
            }
            effectiveStats[stat] = item.stats[stat] + bonus;
        }
        return this.calculateCombatPower(effectiveStats);
    }

    /**
     * 计算敌人战力
     */
    calculateEnemyCombatPower(enemyInfo) {
        return this.calculateCombatPower({
            attack: enemyInfo.attack,
            defense: enemyInfo.defense,
            hp: enemyInfo.maxHp,
            speed: enemyInfo.speed,
            luck: enemyInfo.luck
        });
    }

    /**
     * 显示战力变化浮动提示
     */
    showCombatPowerChange(delta) {
        if (delta === 0) return;
        const isPositive = delta > 0;
        const sign = isPositive ? '+' : '';
        const colorClass = isPositive ? 'text-green-400' : 'text-red-400';

        const notification = document.createElement('div');
        notification.className = `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none ${colorClass} font-bold text-2xl animate-bounce transition-opacity duration-1000`;
        notification.textContent = `⚔ 战力 ${sign}${delta}`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 1000);
        }, 1500);

        this.addBattleLog(`⚔ 战力变化: ${sign}${delta}`);
    }

    // 计算总等级（基于境界、阶段和当前等级）
    calculateTotalLevel() {
        const realm = this.persistentState.player.realm;
        const realmConfig = this.metadata.realmConfig;

        // 累加之前所有境界的等级
        let totalLevel = 0;
        for (let i = 0; i < realm.currentRealm; i++) {
            const currentRealmConfig = realmConfig[i];
            if (currentRealmConfig && currentRealmConfig.stages) {
                for (const stage of currentRealmConfig.stages) {
                    totalLevel += stage.levelCap;
                }
            }
        }

        // 累加当前境界之前阶段的等级
        const currentRealmConfig = realmConfig[realm.currentRealm];
        if (currentRealmConfig && currentRealmConfig.stages) {
            for (let i = 0; i < realm.currentStage - 1; i++) {
                totalLevel += currentRealmConfig.stages[i].levelCap;
            }
        }

        // 加上当前阶段的当前等级
        totalLevel += realm.currentLevel;

        return totalLevel;
    }



    // 清理装备的colorClass属性

    
    // 获取突破所需突破石数量
    getRequiredBreakthroughStones(realmIndex, stage) {
        // 从realmConfig中获取突破石数量
        const realmConfig = this.metadata.realmConfig[realmIndex];
        const stageConfig = realmConfig.stages[stage - 1];
        return stageConfig.breakthroughStones;
    }

    // 显示突破条件满足的提示
    showBreakthroughReadyNotification() {
        const notification = document.getElementById('breakthrough-notification');
        if (notification) {
            const nextRealmNameEl = document.getElementById('next-realm-name');
            const realm = this.persistentState.player.realm;

            // 计算下一阶段/境界名称
            const realmNames = ['武者', '炼气', '筑基', '金丹', '元婴', '化神'];
            let nextName = '';

            if (realm.currentStage < 10) {
                // 下一阶段
                const stageNames = ['初期', '中期', '后期', '巅峰'];
                const nextStageIndex = Math.floor((realm.currentStage) / 3);
                nextName = `${realmNames[realm.currentRealm]}${stageNames[nextStageIndex] || ''}`;
            } else {
                // 下一境界
                nextName = realm.currentRealm < 5 ? `${realmNames[realm.currentRealm + 1]}初期` : '化神巅峰';
            }

            if (nextRealmNameEl) {
                nextRealmNameEl.textContent = nextName;
            }

            notification.classList.remove('hidden');
            this.addBattleLog(`🌟 突破条件已满足！可以进行境界突破了！`);

            setTimeout(() => {
                notification.classList.add('hidden');
            }, 5000);
        }
    }

    // 尝试突破
    attemptBreakthrough() {
        const realm = this.persistentState.player.realm;
        const currentRealmConfig = this.metadata.realmConfig[realm.currentRealm];
        const currentStageConfig = currentRealmConfig.stages[realm.currentStage - 1];
        
        // 检查等级是否达到上限
        if (realm.currentLevel < currentStageConfig.levelCap) {
            this.addBattleLog('等级未达到当前阶段上限，无法突破！');
            return false;
        }
        
        // 检查突破石是否足够
        const requiredStones = this.getRequiredBreakthroughStones(realm.currentRealm, realm.currentStage);
        if (this.persistentState.resources.breakthroughStones < requiredStones) {
            this.addBattleLog('突破石不足，无法突破！');
            return false;
        }
        
        // 执行突破
        this.persistentState.resources.breakthroughStones -= requiredStones;
        
        // 更新境界/阶段/等级
        if (realm.currentStage < 10) {
            // 同一境界内突破
            realm.currentStage++;
            realm.currentLevel = 1;
        } else {
            // 突破到下一个大境界
            if (realm.currentRealm < this.metadata.realmConfig.length - 1) {
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
        this.updateCharacterModal(); // 同时更新弹框内容

        // 主线任务 - 境界提升时启动下一境任务
        if (realm.currentStage === 1 && this.mainQuestSystem) {
            this.mainQuestSystem.initMainQuest(realm.currentRealm);
        } else if (this.mainQuestSystem) {
            this.mainQuestSystem.initLevelQuests(realm.currentRealm, realm.currentStage, realm.currentLevel);
        }

        return true;
    }

    /**
     * 更新突破按钮状态（统一方法）
     * @returns {object} { canBreakthrough, hasEnoughLevel, hasEnoughStones, requiredStones, levelCap }
     */
    updateBreakthroughState() {
        const breakthroughBtnElement = document.getElementById('breakthrough-btn');
        const breakthroughBtnModal = document.getElementById('breakthrough-btn-modal');
        const breakthroughRequirement = document.getElementById('breakthrough-requirement-modal');

        if (!this.metadata.realmConfig) {
            return { canBreakthrough: false, hasEnoughLevel: false, hasEnoughStones: false };
        }

        const realm = this.persistentState.player.realm;
        const currentStageConfig = this.metadata.realmConfig[realm.currentRealm].stages[realm.currentStage - 1];
        const levelCap = currentStageConfig.levelCap;
        const requiredStones = currentStageConfig.breakthroughStones;
        const hasEnoughLevel = realm.currentLevel >= levelCap;
        const hasEnoughStones = (this.persistentState.resources.breakthroughStones || 0) >= requiredStones;
        const canBreakthrough = hasEnoughLevel && hasEnoughStones;

        // 更新主界面按钮
        if (breakthroughBtnElement) {
            breakthroughBtnElement.disabled = !canBreakthrough;
            if (!hasEnoughLevel) {
                breakthroughBtnElement.setAttribute('data-tooltip', `需要达到 Lv.${levelCap} 才能突破`);
            } else if (!hasEnoughStones) {
                breakthroughBtnElement.setAttribute('data-tooltip', `需要 ${requiredStones} 个突破石才能突破`);
            } else {
                breakthroughBtnElement.setAttribute('data-tooltip', `点击突破到下一阶段`);
            }
        }

        // 更新弹框按钮
        if (breakthroughBtnModal) {
            breakthroughBtnModal.disabled = !canBreakthrough;
        }

        // 更新弹框中的突破需求提示
        if (breakthroughRequirement) {
            const currentStones = this.persistentState.resources.breakthroughStones || 0;
            if (hasEnoughLevel && hasEnoughStones) {
                breakthroughRequirement.textContent = '✓ 已满足突破条件，点击突破';
                breakthroughRequirement.className = 'text-center text-xs text-green-400';
            } else if (!hasEnoughLevel) {
                breakthroughRequirement.textContent = `需要达到 Lv.${levelCap} 才能突破`;
                breakthroughRequirement.className = 'text-center text-xs text-light/50';
            } else {
                breakthroughRequirement.textContent = `突破需要 ${requiredStones} 个突破石（当前 ${currentStones}）`;
                breakthroughRequirement.className = 'text-center text-xs text-yellow-400';
            }
        }

        // 满足突破条件时显示提示（只提示一次）
        if (canBreakthrough && !this._breakthroughNotified) {
            this._breakthroughNotified = true;
            this.showBreakthroughReadyNotification();
        } else if (!canBreakthrough) {
            this._breakthroughNotified = false;
        }

        return { canBreakthrough, hasEnoughLevel, hasEnoughStones, requiredStones, levelCap };
    }

    // ==================== 技能树系统 ====================

    // 打开技能树模态窗口
    openSkillTreeModal() {
        const modal = document.getElementById('skill-tree-modal');
        if (!modal) {
            console.error('技能树模态窗口未找到');
            return;
        }

        // 更新模态窗口信息
        this.updateSkillTreeModal();

        // 显示模态窗口
        modal.classList.remove('hidden');
    }

    // 关闭技能树模态窗口
    closeSkillTreeModal() {
        const modal = document.getElementById('skill-tree-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        // 隐藏技能详情面板
        const detailPanel = document.getElementById('skill-detail-panel');
        if (detailPanel) {
            detailPanel.classList.add('hidden');
        }
    }

    // 打开人物详情弹框
    openCharacterModal() {
        const modal = document.getElementById('character-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // 更新弹框内的数据
            this.updateCharacterModal();
        }
    }

    // 关闭人物详情弹框
    closeCharacterModal() {
        const modal = document.getElementById('character-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // 更新人物详情弹框内容
    updateCharacterModal() {
        if (!this.persistentState.player) return;

        // 更新境界显示
        if (this.metadata.realmConfig) {
            const realm = this.persistentState.player.realm;
            const realmName = this.metadata.realmConfig[realm.currentRealm].name;
            const stageConfig = this.metadata.realmConfig[realm.currentRealm].stages[realm.currentStage - 1];
            const stageName = stageConfig.name;

            const realmDisplay = document.getElementById('realm-display-modal');
            if (realmDisplay) {
                realmDisplay.textContent = `${realmName}期 · ${stageName}`;
            }

            // 更新阶数显示
            const realmStageModal = document.getElementById('realm-stage-modal');
            if (realmStageModal) {
                realmStageModal.textContent = realm.currentStage;
            }

            // 突破需求提示已由 updateBreakthroughState() 统一处理
        }

        // 更新等级（使用境界等级）
        const levelModal = document.getElementById('level-modal');
        if (levelModal && this.persistentState.player.realm) {
            levelModal.textContent = this.persistentState.player.realm.currentLevel || 1;
        }

        // 更新经验
        const expModal = document.getElementById('exp-modal');
        const maxExpModal = document.getElementById('max-exp-modal');
        const expBarModal = document.getElementById('exp-bar-modal');
        if (expModal && maxExpModal) {
            expModal.textContent = Math.floor(this.persistentState.player.exp);
            maxExpModal.textContent = Math.floor(this.persistentState.player.maxExp);
            if (expBarModal) {
                const expPercent = (this.persistentState.player.exp / this.persistentState.player.maxExp) * 100;
                expBarModal.style.width = `${expPercent}%`;
            }
        }

        // ✅ v2.0资源系统重构：更新资源显示（模态框）
        const spiritStonesModal = document.getElementById('spirit-stones-modal');
        const herbsModal = document.getElementById('herbs-modal');
        const ironModal = document.getElementById('iron-modal');
        const stonesModal = document.getElementById('breakthrough-stones-modal');

        if (spiritStonesModal) {
            spiritStonesModal.textContent = Math.floor(this.persistentState.resources.spiritStones || 0);
        }
        if (herbsModal) {
            herbsModal.textContent = Math.floor(this.persistentState.resources.herbs || 0);
        }
        if (ironModal) {
            ironModal.textContent = Math.floor(this.persistentState.resources.iron || 0);
        }
        if (stonesModal) {
            stonesModal.textContent = Math.floor(this.persistentState.resources.breakthroughStones || 0);
        }

        // 更新属性
        this.equipmentSystem.calculateEquipmentEffects();

        // 使用统一方法获取最终属性
        const stats = this.getActualStats();

        const finalAttack = stats.attack;
        const finalDefense = stats.defense;
        const finalLuck = stats.luck;
        const finalSpeed = stats.speed;

        const attackModalEl = document.getElementById('attack-modal');
        if (attackModalEl) {
            const baseAttack = this.persistentState.player.baseAttack || (this.persistentState.player.attack - this.equipmentEffects.attack);
            if (this.persistentState.player.tempAttack) {
                attackModalEl.innerHTML = `${Math.floor(baseAttack + this.equipmentEffects.attack)}<span class="text-yellow-400 ml-1">→ ${Math.floor(finalAttack)}</span>`;
            } else {
                attackModalEl.textContent = Math.floor(finalAttack);
            }
            // 使用自定义tooltip
            this.bindCustomTooltip(attackModalEl, () => this.getStatTooltip('attack'));
        }

        const defenseModalEl = document.getElementById('defense-modal');
        if (defenseModalEl) {
            const baseDefense = this.persistentState.player.baseDefense || (this.persistentState.player.defense - this.equipmentEffects.defense);
            if (this.persistentState.player.tempDefense) {
                defenseModalEl.innerHTML = `${Math.floor(baseDefense + this.equipmentEffects.defense)}<span class="text-yellow-400 ml-1">→ ${Math.floor(finalDefense)}</span>`;
            } else {
                defenseModalEl.textContent = Math.floor(finalDefense);
            }
            // 使用自定义tooltip
            this.bindCustomTooltip(defenseModalEl, () => this.getStatTooltip('defense'));
        }

        const maxHpAttrModal = document.getElementById('max-hp-attr-modal');
        if (maxHpAttrModal) {
            maxHpAttrModal.textContent = Math.floor(stats.maxHp);
            // 使用自定义tooltip
            this.bindCustomTooltip(maxHpAttrModal, () => this.getStatTooltip('maxHp'));
        }

        const speedModalEl = document.getElementById('speed-modal');
        if (speedModalEl) {
            if (this.persistentState.player.tempSpeed) {
                speedModalEl.innerHTML = `${Math.floor(this.persistentState.player.speed)}<span class="text-yellow-400 ml-1">→ ${Math.floor(finalSpeed)}</span>`;
            } else {
                speedModalEl.textContent = Math.floor(finalSpeed);
            }
            // 使用自定义tooltip
            this.bindCustomTooltip(speedModalEl, () => this.getStatTooltip('speed'));
        }

        const luckModalEl = document.getElementById('luck-modal');
        if (luckModalEl) {
            if (this.persistentState.player.tempLuck) {
                luckModalEl.innerHTML = `${Math.floor(this.persistentState.player.luck)}<span class="text-yellow-400 ml-1">→ ${Math.floor(finalLuck)}</span>`;
            } else {
                luckModalEl.textContent = Math.floor(finalLuck);
            }
            // 使用自定义tooltip
            this.bindCustomTooltip(luckModalEl, () => this.getStatTooltip('luck'));
        }

        const criticalRateModal = document.getElementById('critical-rate-modal');
        if (criticalRateModal) {
            // 百分比属性：显示时乘100转换为百分比格式
            criticalRateModal.textContent = Math.floor(stats.criticalRate * 100);
            // 使用自定义tooltip
            this.bindCustomTooltip(criticalRateModal, () => this.getStatTooltip('criticalRate'));
        }

        // 更新命中和闪避
        const accuracyModal = document.getElementById('accuracy-modal');
        if (accuracyModal) {
            // 百分比属性：显示时乘100转换为百分比格式
            accuracyModal.textContent = Math.floor(stats.accuracy * 100);
            // 使用自定义tooltip
            this.bindCustomTooltip(accuracyModal, () => this.getStatTooltip('accuracy'));
        }

        const dodgeModal = document.getElementById('dodge-modal');
        if (dodgeModal) {
            // 百分比属性：显示时乘100转换为百分比格式
            dodgeModal.textContent = Math.floor(stats.dodgeRate * 100);
            // 使用自定义tooltip
            this.bindCustomTooltip(dodgeModal, () => this.getStatTooltip('dodgeRate'));
        }

        // 更新韧性显示
        const tenacityModal = document.getElementById('tenacity-modal');
        if (tenacityModal) {
            tenacityModal.textContent = Math.floor((stats.tenacity || 0) * 100);
            this.bindCustomTooltip(tenacityModal, () => this.getStatTooltip('tenacity'));
        }

        // 更新暴击伤害显示
        const critDamageModal = document.getElementById('crit-damage-modal');
        if (critDamageModal) {
            critDamageModal.textContent = stats.critDamage || 0;
            this.bindCustomTooltip(critDamageModal, () => `
                <div class="font-bold text-rose-400 mb-1">暴击伤害值</div>
                <div class="text-light/70">影响高倍率暴击的概率</div>
                <div class="text-light/60 text-[10px] mt-1">每10点提升1%高倍率概率</div>
            `);
        }

        // 更新人物立绘
        this.updateCharacterBodyImageModal();

        // 更新装备显示
        this.equipmentSystem.updateCharacterEquipmentDisplayModal();

        // 更新精炼信息
        this.equipmentSystem.updateRefineInfoModal(this.selectedRefineSlot || 'weapon');
    }

    // 更新弹框内人物立绘
    updateCharacterBodyImageModal() {
        const characterBodyModal = document.getElementById('character-body-modal');
        if (characterBodyModal) {
            const timestamp = new Date().getTime();
            let imageSrc = 'Images/default-character.png';
            if (this._user.loggedIn && this._user.gender) {
                if (this._user.gender === '男') {
                    imageSrc = `Images/male-character-${this.persistentState.player.realm.currentRealm + 1}.png?${timestamp}`;
                } else if (this._user.gender === '女') {
                    imageSrc = `Images/female-character-${this.persistentState.player.realm.currentRealm + 1}.png?${timestamp}`;
                }
            }
            characterBodyModal.src = imageSrc;
        }
    }

    // 更新技能树模态窗口内容
    updateSkillTreeModal() {
        // 更新顶部信息
        const realmName = this.metadata.realmConfig?.[this.persistentState.player.realm.currentRealm]?.name || '未知境界';
        document.getElementById('skill-tree-realm').textContent = realmName + '境';
        document.getElementById('skill-tree-energy').textContent =
            `${Math.floor(this.persistentState.player.energy)}/${this.persistentState.player.maxEnergy}`;

        // 生成境界Tabs
        this.generateRealmTabs();

        // 默认显示当前境界的技能树
        this.showRealmSkillTree(this.persistentState.player.realm.currentRealm);
    }

    // 生成境界选择Tabs
    generateRealmTabs() {
        const tabsContainer = document.getElementById('skill-realm-tabs');
        if (!tabsContainer) return;

        tabsContainer.innerHTML = '';
        const currentRealm = this.persistentState.player.realm.currentRealm;

        // 只显示当前已达到的境界
        this.metadata.realmConfig.forEach((realmConfig, realmIndex) => {
            if (realmIndex > currentRealm) return;

            const tab = document.createElement('button');
            tab.className = `px-4 py-2 border-b-2 transition-colors font-semibold text-sm ${
                realmIndex === currentRealm
                    ? 'border-purple text-purple'
                    : 'border-transparent text-light/50 hover:text-light/80'
            }`;
            tab.textContent = realmConfig.name + '境';
            tab.dataset.realm = realmIndex;

            tab.addEventListener('click', () => {
                this.showRealmSkillTree(realmIndex);
                // 更新tab样式
                tabsContainer.querySelectorAll('button').forEach(t => {
                    t.classList.remove('border-purple', 'text-purple');
                    t.classList.add('border-transparent', 'text-light/50');
                });
                tab.classList.remove('border-transparent', 'text-light/50');
                tab.classList.add('border-purple', 'text-purple');
            });

            tabsContainer.appendChild(tab);
        });
    }

    // 显示指定境界的技能树
    showRealmSkillTree(realmIndex) {
        const container = document.getElementById('skill-tree-container');
        if (!container) return;

        // 创建技能树可视化
        container.innerHTML = `
            <div class="relative w-full h-full">
                <!-- 背景图片 -->
                <div class="absolute inset-0 bg-gradient-radial from-purple/10 to-dark/50">
                    <img src="Images/skill-tree.jpg"
                         alt="技能树"
                         class="w-full h-full object-contain opacity-80"
                         onerror="this.style.display='none'">
                </div>

                <!-- 技能节点叠加层 -->
                <div id="skill-nodes-layer" class="absolute inset-0">
                    <!-- 节点将在这里动态生成 -->
                </div>
            </div>
        `;

        // 生成技能节点
        this.generateSkillNodes(realmIndex);
    }

    // 生成技能节点
    generateSkillNodes(realmIndex) {
        const nodesLayer = document.getElementById('skill-nodes-layer');
        if (!nodesLayer) return;

        // 获取该境界的所有技能树
        const realmSkillTrees = this.metadata.realmSkills.filter(tree => tree.realmRequired === realmIndex);

        // 按类型分配位置（四个方向）
        const positions = [
            { type: 'attack', x: '50%', y: '13%', label: '攻击技能' },
            { type: 'defense', x: '78%', y: '50%', label: '防御技能' },
            { type: 'recovery', x: '22%', y: '50%', label: '恢复技能' },
            { type: 'special', x: '50%', y: '86%', label: '特殊技能' }
        ];

        positions.forEach(pos => {
            const skillTree = realmSkillTrees.find(tree => tree.type === pos.type);
            if (!skillTree) return;

            const currentLevel = this.persistentState.player.skills.levels?.[skillTree.id] || 0;
            const maxLevel = skillTree.levels.length;
            const isUnlocked = currentLevel > 0;
            const canUpgrade = this.canUpgradeSkill(skillTree, currentLevel);

            // 创建节点
            const node = document.createElement('div');
            node.className = `absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                isUnlocked ? 'skill-node-active' : 'skill-node-locked'
            } ${canUpgrade.canUpgrade ? 'skill-node-upgradeable' : ''}`;
            node.style.left = pos.x;
            node.style.top = pos.y;

            // 节点图标
            const iconColors = {
                'attack': '#f87171',
                'defense': '#fbbf24',
                'recovery': '#4ade80',
                'special': '#a78bfa'
            };

            node.innerHTML = `
                <div class="relative">
                    <!-- 外圈光环 -->
                    <div class="absolute inset-0 rounded-full ${isUnlocked ? 'animate-pulse' : ''}"
                         style="background: radial-gradient(circle, ${iconColors[pos.type]}40 0%, transparent 70%);
                                width: 120px; height: 120px; left: -12px; top: -12px;"></div>

                    <!-- 节点本体 -->
                    <div class="w-24 h-24 rounded-full border-4 flex items-center justify-center relative ${
                        isUnlocked
                            ? 'border-purple bg-purple/30'
                            : 'border-light/20 bg-dark/50'
                    } ${canUpgrade.canUpgrade ? 'ring-2 ring-yellow/50 ring-offset-2 ring-offset-dark' : ''}">
                        ${isUnlocked
                            ? `<img src="Images/skill-${skillTree.baseImageId || 1}.jpg"
                                    alt="${skillTree.name}"
                                    class="w-full h-full rounded-full object-cover"
                                    onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fa fa-magic text-4xl text-purple\\'></i>'">`
                            : `<i class="fa fa-lock text-3xl text-light/30"></i>`
                        }
                    </div>

                    <!-- 等级标签 -->
                    <div class="absolute left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-base font-bold shadow-lg z-10 ${
                        isUnlocked
                            ? 'bg-purple/90 text-white'
                            : 'bg-dark/90 text-light/50'
                    }" style="bottom: -28px;">
                        Lv.${currentLevel}/${maxLevel}
                    </div>

                    <!-- 升级提示 -->
                    ${canUpgrade.canUpgrade ? `
                        <div class="absolute -top-2 -right-2 w-8 h-8 bg-yellow rounded-full flex items-center justify-center animate-bounce">
                            <i class="fa fa-arrow-up text-base text-dark"></i>
                        </div>
                    ` : ''}
                </div>
            `;

            // 点击事件
            node.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showSkillDetail(skillTree, realmIndex, node);
            });

            nodesLayer.appendChild(node);
        });
    }

    // 显示技能详情面板
    showSkillDetail(skillTree, realmIndex, nodeElement) {
        const detailPanel = document.getElementById('skill-detail-panel');
        if (!detailPanel) return;

        const currentLevel = this.persistentState.player.skills.levels?.[skillTree.id] || 0;
        const maxLevel = skillTree.levels.length;
        const currentSkill = currentLevel > 0 ? skillTree.levels[currentLevel - 1] : null;
        const nextSkill = currentLevel < maxLevel ? skillTree.levels[currentLevel] : null;
        const canUpgrade = this.canUpgradeSkill(skillTree, currentLevel);

        // 更新详情面板内容
        document.getElementById('skill-detail-name').textContent = skillTree.name;

        // 等级显示
        document.getElementById('skill-detail-level').textContent =
            currentLevel > 0 ? `Lv.${currentLevel}` : '未学习';

        document.getElementById('skill-detail-type').textContent =
            `${this.metadata.realmConfig[realmIndex].name}境 · ${
                skillTree.type === 'attack' ? '攻击技能' :
                skillTree.type === 'defense' ? '防御技能' :
                skillTree.type === 'recovery' ? '恢复技能' : '特殊技能'
            }`;

        document.getElementById('skill-detail-desc').textContent =
            currentSkill?.description || '未学习此技能';

        // 技能属性 - 改为紧凑的标签式显示
        const statsDiv = document.getElementById('skill-detail-stats');
        statsDiv.innerHTML = '';
        if (currentSkill) {
            const stats = [];

            if (currentSkill.damageMultiplier) {
                stats.push(`<span class="px-2 py-1 bg-red/20 text-red-200 rounded">伤害 ${currentSkill.damageMultiplier}x</span>`);
            }
            if (currentSkill.defenseBonus) {
                stats.push(`<span class="px-2 py-1 bg-blue/20 text-blue-200 rounded">减伤 ${Math.round(currentSkill.defenseBonus * 100)}%</span>`);
            }
            if (currentSkill.healPercentage) {
                stats.push(`<span class="px-2 py-1 bg-green/20 text-green-200 rounded">恢复 ${Math.round(currentSkill.healPercentage * 100)}%</span>`);
            }
            if (currentSkill.dodgeBonus) {
                stats.push(`<span class="px-2 py-1 bg-yellow/20 text-yellow-200 rounded">闪避 +${Math.round(currentSkill.dodgeBonus * 100)}%</span>`);
            }
            stats.push(`<span class="px-2 py-1 bg-purple/20 text-purple-200 rounded">消耗 ${currentSkill.energyCost}</span>`);

            statsDiv.innerHTML = stats.join('');
        }

        // 升级成本 - 更紧凑的显示
        const costDiv = document.getElementById('skill-upgrade-cost');
        if (nextSkill && canUpgrade.canUpgrade) {
            costDiv.innerHTML = `<span class="text-purple">${nextSkill.energyCost} 灵力</span>`;
        } else if (currentLevel >= maxLevel) {
            costDiv.innerHTML = '<span class="text-accent text-xs">已满级</span>';
        } else {
            costDiv.innerHTML = `<span class="text-red/60 text-xs">${canUpgrade.reason}</span>`;
        }

        // 升级按钮
        const upgradeBtn = document.getElementById('skill-upgrade-btn');
        upgradeBtn.disabled = !canUpgrade.canUpgrade;

        if (canUpgrade.canUpgrade) {
            upgradeBtn.className = 'px-4 py-1.5 bg-gradient-to-r from-purple/40 to-purple/60 hover:from-purple/50 hover:to-purple/70 text-white text-xs rounded-full transition-all font-semibold shadow-sm hover:shadow-md hover:shadow-purple/30';
            upgradeBtn.textContent = '升级';
        } else {
            upgradeBtn.className = 'px-4 py-1.5 bg-dark/50 text-light/40 text-xs rounded-full cursor-not-allowed';
            upgradeBtn.textContent = currentLevel >= maxLevel ? '已满级' : '无法升级';
        }

        // 移除旧的点击事件监听器
        const newUpgradeBtn = upgradeBtn.cloneNode(true);
        upgradeBtn.parentNode.replaceChild(newUpgradeBtn, upgradeBtn);

        // 添加新的点击事件
        if (canUpgrade.canUpgrade) {
            newUpgradeBtn.addEventListener('click', () => {
                this.upgradeSkill(skillTree.id);
                // 重新生成节点和更新详情
                this.generateSkillNodes(realmIndex);
                this.showSkillDetail(skillTree, realmIndex, nodeElement);
            });
        }

        // 显示详情内容
        const placeholder = document.getElementById('skill-detail-placeholder');
        const content = document.getElementById('skill-detail-content');

        if (placeholder) placeholder.classList.add('hidden');
        if (content) content.classList.remove('hidden');
    }

    // 检查是否可以升级技能
    canUpgradeSkill(skillTree, currentLevel) {
        const player = this.persistentState.player;
        const nextSkill = skillTree.levels[currentLevel];

        // 检查是否满级
        if (currentLevel >= skillTree.levels.length) {
            return { canUpgrade: false, reason: '已满级' };
        }

        // 检查境界要求
        if (player.realm.currentRealm < skillTree.realmRequired) {
            return { canUpgrade: false, reason: '境界不足' };
        }

        // 检查阶段要求
        if (nextSkill.stageRequired && player.realm.currentStage < nextSkill.stageRequired) {
            const realmName = this.metadata.realmConfig[player.realm.currentRealm]?.stages[nextSkill.stageRequired - 1]?.name || nextSkill.stageRequired;
            return { canUpgrade: false, reason: `需要${realmName}阶段` };
        }

        // 检查灵力消耗
        if (player.energy < nextSkill.energyCost) {
            return { canUpgrade: false, reason: `灵力不足 (需要${nextSkill.energyCost})` };
        }

        return { canUpgrade: true, reason: '' };
    }

    // 升级技能
    upgradeSkill(skillTreeId) {
        if (!this.realmSkillSystem) {
            console.error('技能树系统未初始化');
            return false;
        }

        const success = this.realmSkillSystem.upgradeSkillTree(skillTreeId);

        if (success) {
            // 更新UI
            this.updateUI();
            this.addBattleLog('技能升级成功！');
        }

        return success;
    }

    // 根据稀有度和类型获取装备颜色

    // 打开自动战斗配置弹窗
    openAutoBattleModal() {
        const modal = document.getElementById('auto-battle-modal');
        if (modal) {
            this.syncAutoBattleSettingsToModal();
            modal.classList.remove('hidden');
        }
    }

    // 关闭自动战斗配置弹窗
    closeAutoBattleModal() {
        const modal = document.getElementById('auto-battle-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // 同步自动战斗设置到弹窗
    syncAutoBattleSettingsToModal() {
        const settings = this.persistentState.settings.autoBattleSettings;

        // 同步复选框状态
        const modalGreen = document.getElementById('modal-auto-battle-green');
        const modalYellow = document.getElementById('modal-auto-battle-yellow');
        const modalRed = document.getElementById('modal-auto-battle-red');

        if (modalGreen) {
            modalGreen.checked = settings.targetColors.includes('green');
        }
        if (modalYellow) {
            modalYellow.checked = settings.targetColors.includes('yellow');
        }
        if (modalRed) {
            modalRed.checked = settings.targetColors.includes('red');
        }

        // 同步按钮状态
        const modalBtn = document.getElementById('modal-toggle-auto-battle-btn');
        if (modalBtn) {
            if (settings.enabled) {
                modalBtn.innerHTML = '<i class="fa fa-pause"></i> 停止自动战斗';
                modalBtn.classList.remove('from-green-600', 'to-green-500');
                modalBtn.classList.add('from-red-600', 'to-red-500');
            } else {
                modalBtn.innerHTML = '<i class="fa fa-play"></i> 开始自动战斗';
                modalBtn.classList.remove('from-red-600', 'to-red-500');
                modalBtn.classList.add('from-green-600', 'to-green-500');
            }
        }
    }

    // 切换自动战斗
    toggleAutoBattle() {
        this.persistentState.settings.autoBattleSettings.enabled = !this.persistentState.settings.autoBattleSettings.enabled;
        const btn = document.getElementById('auto-battle-btn');
        const modalBtn = document.getElementById('modal-toggle-auto-battle-btn');

        if (this.persistentState.settings.autoBattleSettings.enabled) {
            if (btn) {
                btn.innerHTML = '<i class="fa fa-pause mr-1"></i> 停止自动战斗';
                btn.setAttribute('data-tooltip', '停止自动战斗');
            }
            if (modalBtn) {
                modalBtn.innerHTML = '<i class="fa fa-pause"></i> 停止自动战斗';
                modalBtn.classList.remove('from-green-600', 'to-green-500');
                modalBtn.classList.add('from-red-600', 'to-red-500');
            }
            this.startAutoBattle();
        } else {
            if (btn) {
                btn.innerHTML = '<img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=auto%20battle%20button%20winter%20theme%20green%20crystal%20style%20clean%20minimal&image_size=square" alt="自动战斗" class="w-full h-full object-cover">';
                btn.setAttribute('data-tooltip', '自动进行战斗，消耗灵力');
            }
            if (modalBtn) {
                modalBtn.innerHTML = '<i class="fa fa-play"></i> 开始自动战斗';
                modalBtn.classList.remove('from-red-600', 'to-red-500');
                modalBtn.classList.add('from-green-600', 'to-green-500');
            }
            this.stopAutoBattle();
        }
    }

    // 更新自动战斗目标颜色（从弹窗读取）
    updateAutoBattleTargetColorsFromModal() {
        const targetColors = [];

        const modalGreen = document.getElementById('modal-auto-battle-green');
        const modalYellow = document.getElementById('modal-auto-battle-yellow');
        const modalRed = document.getElementById('modal-auto-battle-red');

        if (modalGreen && modalGreen.checked) {
            targetColors.push('green');
        }
        if (modalYellow && modalYellow.checked) {
            targetColors.push('yellow');
        }
        if (modalRed && modalRed.checked) {
            targetColors.push('red');
        }

        // 同步到导航栏中的复选框（如果存在）
        const navGreen = document.getElementById('auto-battle-green');
        const navYellow = document.getElementById('auto-battle-yellow');
        const navRed = document.getElementById('auto-battle-red');

        if (navGreen) navGreen.checked = targetColors.includes('green');
        if (navYellow) navYellow.checked = targetColors.includes('yellow');
        if (navRed) navRed.checked = targetColors.includes('red');

        this.persistentState.settings.autoBattleSettings.targetColors = targetColors;
    }

    // 打开注销账号弹窗
    openDeleteAccountModal() {
        const modal = document.getElementById('delete-account-modal');
        if (modal) {
            // 清空密码输入
            const passwordInput = document.getElementById('delete-account-password');
            if (passwordInput) {
                passwordInput.value = '';
            }
            // 隐藏错误提示
            const errorMsg = document.getElementById('delete-password-error');
            if (errorMsg) {
                errorMsg.classList.add('hidden');
            }
            modal.classList.remove('hidden');
        }
    }

    // 关闭注销账号弹窗
    closeDeleteAccountModal() {
        const modal = document.getElementById('delete-account-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // 确认注销账号
    confirmDeleteAccount() {
        const passwordInput = document.getElementById('delete-account-password');
        const errorMsg = document.getElementById('delete-password-error');

        if (!passwordInput) return;

        const password = passwordInput.value;

        // 验证密码
        if (password !== this.persistentState.player.password) {
            if (errorMsg) {
                errorMsg.classList.remove('hidden');
            }
            return;
        }

        // 密码正确，执行注销
        this.closeDeleteAccountModal();
        this.deleteAccount();
    }
    
    // ❌ 已移除自动收集资源系统（v2.0资源系统重构）
    // 资源现在只能通过资源副本获取
    // toggleAutoCollect() { ... } - 已删除
    // startAutoCollect() { ... } - 已删除
    // stopAutoCollect() { ... } - 已删除

    // 打开资源采集弹窗
    // ❌ 已移除资源采集弹窗（v2.0资源系统重构）
    // openCollectResourcesModal() { ... }
    // closeCollectResourcesModal() { ... }

    // 打开商店弹窗
    openShopModal() {
        const modal = document.getElementById('shop-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // 关闭商店弹窗
    closeShopModal() {
        const modal = document.getElementById('shop-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // ==================== VIP充值系统 ====================

    openRechargeModal() {
        const modal = document.getElementById('recharge-modal');
        if (modal) {
            // 更新余额和VIP显示
            const jadeDisplay = document.getElementById('recharge-jade-balance');
            if (jadeDisplay) jadeDisplay.textContent = this.persistentState.resources.jade || 0;
            const vipDisplay = document.getElementById('recharge-vip-level');
            if (vipDisplay) {
                const level = this.persistentState.vip?.level || 0;
                const info = this.vipSystem.getVIPInfo();
                vipDisplay.textContent = level > 0 ? `VIP${level}·${info.label}` : '普通修士';
            }
            // 隐藏所有密码输入框
            document.querySelectorAll('.recharge-password-group').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.recharge-message').forEach(el => { el.textContent = ''; el.classList.add('hidden'); });
            modal.classList.remove('hidden');
        }
    }

    closeRechargeModal() {
        const modal = document.getElementById('recharge-modal');
        if (modal) modal.classList.add('hidden');
    }

    // 点击充值套餐，展开密码输入
    selectRechargePackage(index) {
        const codes = this.vipSystem.getRechargeCodes();
        if (!codes[index]) return;

        // 隐藏所有密码输入框
        document.querySelectorAll('.recharge-password-group').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.recharge-message').forEach(el => { el.textContent = ''; el.classList.add('hidden'); });

        // 显示对应的密码输入框
        const group = document.getElementById(`recharge-pw-${index}`);
        if (group) {
            group.classList.remove('hidden');
            const input = group.querySelector('input');
            if (input) { input.value = ''; input.focus(); }
        }
    }

    // 确认充值
    async confirmRecharge(index) {
        const group = document.getElementById(`recharge-pw-${index}`);
        if (!group) return;

        const input = group.querySelector('input');
        const msgEl = document.getElementById(`recharge-msg-${index}`);
        if (!input || !msgEl) return;

        const result = await this.vipSystem.recharge(input.value.trim());
        msgEl.classList.remove('hidden');

        if (result.success) {
            msgEl.textContent = result.message;
            msgEl.className = 'recharge-message text-green-400 text-xs mt-1';

            // 更新余额显示
            const jadeDisplay = document.getElementById('recharge-jade-balance');
            if (jadeDisplay) jadeDisplay.textContent = result.totalJade || this.persistentState.resources.jade;
            const vipDisplay = document.getElementById('recharge-vip-level');
            if (vipDisplay) {
                const level = this.persistentState.vip?.level || 0;
                const info = this.vipSystem.getVIPInfo();
                vipDisplay.textContent = level > 0 ? `VIP${level}·${info.label}` : '普通修士';
            }

            this.updateUI();
            this.addBattleLog(result.message);
        } else {
            msgEl.textContent = result.message;
            msgEl.className = 'recharge-message text-red-400 text-xs mt-1';
        }
    }

    // ==================== 仙玉商店 ====================

    openVIPShopModal() {
        const modal = document.getElementById('vip-shop-modal');
        if (modal) {
            // 更新仙玉余额
            const jadeDisplay = document.getElementById('vip-shop-jade-balance');
            if (jadeDisplay) jadeDisplay.textContent = this.persistentState.resources.jade || 0;
            modal.classList.remove('hidden');
        }
    }

    closeVIPShopModal() {
        const modal = document.getElementById('vip-shop-modal');
        if (modal) modal.classList.add('hidden');
    }

    // ==================== 图鉴系统 ====================

    openCollectionModal(tab) {
        const modal = document.getElementById('collection-modal');
        if (modal) modal.classList.remove('hidden');
        this.renderCollection(tab || 'enemy', 0, 0);
    }

    closeCollectionModal() {
        const modal = document.getElementById('collection-modal');
        if (modal) modal.classList.add('hidden');
    }

    renderCollection(tab, realmIdx = 0, rarityIdx = 0) {
        const content = document.getElementById('collection-content');
        const subtabsContainer = document.getElementById('collection-subtabs');
        const enemyTabBtn = document.getElementById('collection-enemy-tab');
        const equipTabBtn = document.getElementById('collection-equip-tab');
        const totalEl = document.getElementById('collection-total');

        if (!content) return;

        // 更新主Tab样式
        if (enemyTabBtn) {
            enemyTabBtn.className = tab === 'enemy'
                ? 'px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white'
                : 'px-4 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white';
        }
        if (equipTabBtn) {
            equipTabBtn.className = tab === 'equipment'
                ? 'px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white'
                : 'px-4 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white';
        }

        // 总进度
        const enemyProgress = this.collectionSystem.getEnemyProgress();
        const equipProgress = this.collectionSystem.getEquipmentProgress();
        const totalUnlocked = enemyProgress.unlocked + equipProgress.unlocked;
        const totalAll = enemyProgress.total + equipProgress.total;
        if (totalEl) {
            totalEl.textContent = `已解锁 ${totalUnlocked}/${totalAll} (${(totalAll > 0 ? (totalUnlocked / totalAll * 100).toFixed(1) : 0)}%)`;
        }

        // 添加说明面板（只在首次渲染时显示）
        let helpHtml = `
            <div class="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-3 mb-4 border border-indigo-500/20">
                <div class="text-xs text-white/70 mb-1">
                    <i class="fa fa-info-circle text-indigo-400 mr-1"></i>
                    <strong>图鉴系统</strong>
                </div>
                <ul class="text-xs text-white/50 space-y-0.5 ml-4">
                    <li>• <span class="text-yellow-300">敌人图鉴</span>：收集各地图敌人，全解锁获得经验和资源奖励</li>
                    <li>• <span class="text-purple-300">装备图鉴</span>：收集各境界品质装备，全解锁获得保底装备箱</li>
                    <li>• 奖励自动发放到背包，请注意查收</li>
                </ul>
            </div>
        `;

        // 将说明添加到content的上方
        const helpContainer = document.getElementById('collection-help');
        if (helpContainer) {
            helpContainer.innerHTML = helpHtml;
        }

        // Tab内容
        if (tab === 'enemy') {
            this.renderEnemyCollection(content, subtabsContainer, realmIdx);
        } else {
            this.renderEquipmentCollection(content, subtabsContainer, realmIdx, rarityIdx);
        }
    }

    renderEnemyCollection(container, subtabsContainer, selectedRealmIdx = 0) {
        const categories = this.collectionSystem.getEnemyCategories();
        const collection = this.persistentState.collection;
        const realmConfig = this.metadata.realmConfig || [];

        // 按境界分组
        const byRealm = {};
        for (const cat of categories) {
            if (!byRealm[cat.realm]) byRealm[cat.realm] = { name: cat.realmName, maps: [] };
            byRealm[cat.realm].maps.push(cat);
        }

        // 境界子Tab - 渲染到单独容器
        if (subtabsContainer) {
            let subtabsHtml = '<div class="flex flex-wrap gap-1 px-2">';
            for (let i = 0; i < realmConfig.length; i++) {
                const realm = realmConfig[i];
                const isActive = i === selectedRealmIdx;
                const realmCats = byRealm[i]?.maps || [];
                const realmUnlocked = realmCats.reduce((sum, cat) =>
                    sum + cat.enemyKeys.filter(k => collection.enemies.includes(k)).length, 0);
                const realmTotal = realmCats.reduce((sum, cat) => sum + cat.enemyKeys.length, 0);

                subtabsHtml += `<button onclick="game.renderCollection('enemy', ${i})" class="px-3 py-1 rounded text-xs ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}">
                    ${realm.name}境 (${realmUnlocked}/${realmTotal})
                </button>`;
            }
            subtabsHtml += '</div>';
            subtabsContainer.innerHTML = subtabsHtml;
        }

        // 选中境界的内容
        let html = '';
        const realmData = byRealm[selectedRealmIdx];
        if (realmData && realmData.maps.length > 0) {
            for (const cat of realmData.maps) {
                const unlocked = cat.enemyKeys.filter(k => collection.enemies.includes(k)).length;
                const total = cat.enemyKeys.length;
                const rewardKey = `enemy_${cat.mapId}`;
                const rewarded = collection.rewardedCategories.includes(rewardKey);
                const allComplete = unlocked === total;

                const titleClass = allComplete ? 'text-yellow-400 font-bold' : 'text-blue-300 font-medium';
                const rewardBadge = rewarded
                    ? '<span class="text-green-400 text-xs">✅奖励已领</span>'
                    : allComplete
                    ? '<span class="text-yellow-300 text-xs cursor-help" title="奖励：经验+2500，灵木+100">🎉可领取</span>'
                    : '<span class="text-white/30 text-xs" title="全解锁奖励：经验+2500，灵木+100">🎁经验+2500</span>';

                html += `<div class="mb-4">
                    <div class="flex items-center justify-between mb-2 px-2">
                        <span class="${titleClass} text-sm">${cat.name} (${unlocked}/${total})</span>
                        ${rewardBadge}
                    </div>
                    <div class="grid grid-cols-3 gap-1.5 px-2">`;

                // 每个敌人显示：图标+名称+类型
                for (const key of cat.enemyKeys) {
                    const isUnlocked = collection.enemies.includes(key);
                    let icon, displayName;
                    if (key.startsWith('BOSS')) {
                        icon = '👑';
                        displayName = key.replace('BOSS', '');
                    } else if (key.endsWith('_elite')) {
                        icon = '⭐';
                        displayName = key.replace('_elite', '');
                    } else {
                        icon = '👤';
                        displayName = key;
                    }
                    const bgClass = isUnlocked ? 'bg-green-900/30 border-green-500/30' : 'bg-gray-800/50 border-gray-700/30';
                    const textClass = isUnlocked ? 'text-green-400' : 'text-gray-600';
                    html += `<div class="${bgClass} border rounded p-1.5 text-center">
                        <div class="text-sm">${icon}</div>
                        <div class="${textClass} text-xs truncate">${displayName}</div>
                    </div>`;
                }

                html += '</div></div>';
            }
        } else {
            html += '<div class="text-center text-gray-500 py-8">该境界暂无地图</div>';
        }

        container.innerHTML = html;
    }

    renderEquipmentCollection(container, subtabsContainer, selectedRealmIdx = 0, selectedRarityIdx = 0) {
        const categories = this.collectionSystem.getEquipmentCategories();
        const collection = this.persistentState.collection;
        const templates = this.metadata.equipmentTemplates || [];
        const slotConfig = this.metadata.equipmentSlotConfig || {};
        const realmConfig = this.metadata.realmConfig || [];
        const rarities = this.metadata.equipmentRarities || [];

        const rarityColors = {
            white: { bg: 'bg-gray-600', text: 'text-gray-200' },
            blue: { bg: 'bg-blue-600', text: 'text-blue-200' },
            purple: { bg: 'bg-purple-600', text: 'text-purple-200' },
            gold: { bg: 'bg-yellow-600', text: 'text-yellow-200' },
            rainbow: { bg: 'bg-pink-600', text: 'text-pink-200' }
        };

        // 子Tab渲染到单独容器
        if (subtabsContainer) {
            let subtabsHtml = '';

            // 境界子Tab
            subtabsHtml += '<div class="flex flex-wrap gap-1 mb-2 px-2">';
            for (let i = 0; i < realmConfig.length; i++) {
                const realm = realmConfig[i];
                const isActive = i === selectedRealmIdx;
                subtabsHtml += `<button onclick="game.renderCollection('equipment', ${i}, ${selectedRarityIdx})" class="px-3 py-1 rounded text-xs ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}">
                    ${realm.name}境
                </button>`;
            }
            subtabsHtml += '</div>';

            // 品质子Tab
            subtabsHtml += '<div class="flex flex-wrap gap-1 px-2">';
            for (let i = 0; i < rarities.length; i++) {
                const rarity = rarities[i];
                const isActive = i === selectedRarityIdx;
                const colors = rarityColors[rarity.name] || rarityColors.white;
                subtabsHtml += `<button onclick="game.renderCollection('equipment', ${selectedRealmIdx}, ${i})" class="px-3 py-1 rounded text-xs ${isActive ? colors.bg + ' text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}">
                    ${rarity.displayName}
                </button>`;
            }
            subtabsHtml += '</div>';

            subtabsContainer.innerHTML = subtabsHtml;
        }

        // 当前选中境界+品质的装备
        const currentRarity = rarities[selectedRarityIdx];
        if (!currentRarity) {
            container.innerHTML = '<div class="text-center text-gray-500 py-8">无数据</div>';
            return;
        }

        // 检查该分类是否全解锁
        const catKey = `equipment_${selectedRealmIdx}_${currentRarity.name}`;
        const category = categories.find(c => c.realmIdx === selectedRealmIdx && c.rarity.name === currentRarity.name);
        const equipKeys = category?.equipKeys || [];
        const unlocked = equipKeys.filter(k => collection.equipmentTypes.includes(k)).length;
        const total = equipKeys.length;
        const rewarded = collection.rewardedCategories.includes(catKey);
        const allComplete = unlocked === total && total > 0;

        let html = '';

        // 进度条
        const progressPercent = total > 0 ? (unlocked / total * 100) : 0;
        html += `<div class="px-2 mb-3">
            <div class="flex items-center justify-between mb-1">
                <span class="${rarityColors[currentRarity.name]?.text || 'text-gray-300'} text-sm font-medium">
                    ${realmConfig[selectedRealmIdx]?.name || ''}境 · ${currentRarity.displayName}品质 (${unlocked}/${total})
                </span>
                ${rewarded ? '<span class="text-green-400 text-xs">✅奖励已领</span>' : allComplete ? '<span class="text-yellow-300 text-xs cursor-help" title="奖励：保底该品质装备箱×1">🎉可领取</span>' : `<span class="text-white/30 text-xs cursor-help" title="全解锁奖励：保底${currentRarity.displayName}装备箱×1">🎁${currentRarity.displayName}装备</span>`}
            </div>
            <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full ${rarityColors[currentRarity.name]?.bg || 'bg-gray-500'}" style="width: ${progressPercent}%"></div>
            </div>
        </div>`;

        // 按装备类型显示
        html += '<div class="space-y-3 px-2">';
        for (const template of templates) {
            const suffixes = Array.isArray(template.nameSuffixes[0])
                ? template.nameSuffixes[selectedRealmIdx]
                : template.nameSuffixes;

            if (!suffixes) continue;

            const typeName = slotConfig[template.type]?.name || template.type;
            const typeIcon = slotConfig[template.type]?.fallbackIcon || 'fa-box';

            html += `<div class="bg-black/20 rounded p-2">
                <div class="text-gray-400 text-xs mb-2 flex items-center gap-1">
                    <i class="fa ${typeIcon}"></i> ${typeName}
                </div>
                <div class="grid grid-cols-3 gap-1">`;

            for (const suffix of suffixes) {
                const key = `${template.type}_${currentRarity.name}_${suffix}`;
                const isUnlocked = collection.equipmentTypes.includes(key);
                const bgClass = isUnlocked ? 'bg-green-900/30 border-green-500/30' : 'bg-gray-800/30 border-gray-700/20';
                const textClass = isUnlocked ? 'text-green-400' : 'text-gray-600';

                html += `<div class="${bgClass} border rounded px-2 py-1.5 text-center">
                    <div class="${textClass} text-xs">${suffix}</div>
                </div>`;
            }

            html += '</div></div>';
        }
        html += '</div>';

        container.innerHTML = html;
    }

    // 购买仙玉商品
    buyVIPItem(itemId) {
        const result = this.jadeShop.buyItem(itemId);
        const msgEl = document.getElementById('vip-shop-message');
        if (msgEl) {
            msgEl.textContent = result.message;
            msgEl.className = result.success ? 'text-green-400 text-center text-sm mb-4' : 'text-red-400 text-center text-sm mb-4';
            msgEl.classList.remove('hidden');
        }

        if (result.success) {
            // 装备箱掉落处理
            if (result.equipment) {
                // 图鉴：记录获取装备
                if (this.collectionSystem) {
                    this.collectionSystem.recordEquipment(result.equipment);
                }
                // 检查并提示用户是否装备更好的装备（非战斗场景）
                const equipped = this.checkAndEquipBetterGearWithPrompt(result.equipment);
                if (!equipped) {
                    this.persistentState.player.inventory.items.push(result.equipment);
                    this.addBattleLog(`获得${result.equipment.rarityDisplayName} ${result.equipment.name}，已放入背包！`);
                } else {
                    this.addBattleLog(`获得${result.equipment.rarityDisplayName} ${result.equipment.name}！`);
                }
            }
            // 更新UI
            const jadeDisplay = document.getElementById('vip-shop-jade-balance');
            if (jadeDisplay) jadeDisplay.textContent = this.persistentState.resources.jade || 0;
            this.updateUI();
            this.updateHealthBars();

            // 3秒后隐藏消息
            setTimeout(() => { if (msgEl) msgEl.classList.add('hidden'); }, 3000);
        }
    }

    // 渲染充值套餐卡片
    renderRechargePackages() {
        const container = document.getElementById('recharge-packages');
        if (!container) return;

        container.innerHTML = this.vipSystem.getRechargeCodes().map((pkg, index) => `
            <div class="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-3">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-yellow-300 font-bold text-sm">${pkg.label}</span>
                    <span class="text-purple-300 font-bold text-lg">${pkg.jade}仙玉</span>
                </div>
                <button class="w-full py-1.5 rounded bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-medium text-xs hover:opacity-80 transition-opacity" onclick="game.selectRechargePackage(${index})">
                    立即充值
                </button>
                <div id="recharge-pw-${index}" class="recharge-password-group mt-2 hidden">
                    <input type="text" placeholder="请输入充值码" class="w-full px-2 py-1 rounded bg-black/40 border border-yellow-500/30 text-white text-xs mb-1 focus:outline-none focus:border-yellow-400">
                    <button class="w-full py-1 rounded bg-gradient-to-r from-green-600 to-green-500 text-white text-xs hover:opacity-80" onclick="game.confirmRecharge(${index})">确认</button>
                </div>
                <div id="recharge-msg-${index}" class="recharge-message hidden text-xs mt-1"></div>
            </div>
        `).join('');
    }

    // 渲染仙玉商店商品
    renderVIPShopItems() {
        const container = document.getElementById('vip-shop-items');
        if (!container) return;

        container.innerHTML = JadeShop.SHOP_ITEMS.map(item => `
            <div class="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-lg p-3">
                <div class="flex items-center justify-between mb-1">
                    <span class="text-purple-200 font-bold">${item.name}</span>
                    <span class="text-purple-300 text-sm">${item.jade}仙玉</span>
                </div>
                <p class="text-light/60 text-xs mb-2">${item.desc}</p>
                <button class="w-full py-1.5 rounded bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-medium hover:opacity-80 transition-opacity" onclick="game.buyVIPItem('${item.id}')">
                    购买
                </button>
            </div>
        `).join('');
    }

    // ❌ 已移除自动采集相关功能（v2.0资源系统重构）
  
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
        this.persistentState.settings.autoBattleSettings.targetColors = targetColors;
    }

    // ❌ 已移除自动采集资源类型更新（v2.0资源系统重构）
    // updateAutoCollectResourceTypes() 已不再使用

    // 开始自动战斗
    startAutoBattle() {
        if (!this.timers.autoBattleTimer) {
            this.timers.autoBattleTimer = setInterval(() => {
                // 检查自动战斗是否启用
                if (this.persistentState.settings.autoBattleSettings.enabled && this.persistentState.player.energy >= 10) {
                    // 检查当前敌人是否符合目标颜色
                    const enemyPower = this.transientState.enemy.attack * 2 + this.transientState.enemy.defense * 1.5 + this.transientState.enemy.maxHp * 0.1;
                    const playerStats = this.getActualStats();
                    const playerPower = playerStats.attack * 2 + playerStats.defense * 1.5 + playerStats.maxHp * 0.1;
                    
                    let enemyColor = 'red'; // 默认红色
                    if (this.transientState.enemy.isBoss) {
                        enemyColor = 'purple';
                    } else if (this.transientState.enemy.isElite) {
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
                    if (this.persistentState.settings.autoBattleSettings.targetColors.includes(enemyColor)) {
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
    
    // ❌ 已移除自动挂机系统（v2.0 - 使用autoBattleSettings替代）
    // toggleAutoPlay() { ... } - 已删除
    // startAutoPlay() { ... } - 已删除
    // stopAutoPlay() { ... } - 已删除
    // ❌ 已移除自动收集资源（v2.0资源系统重构）
    // 资源现在只能通过资源副本获取
    // startAutoCollect() { ... } - 已删除

    // ❌ 已移除自动收集资源系统（v2.0资源系统重构）
    // stopAutoCollect() { ... } - 已删除

    // 开始挂机计时器
    startAfkTimer() {
        if (!this.timers.afkTimer) {
            this.timers.afkTimer = setInterval(() => {
                this.persistentState.settings.afkTime++;
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

    // ❌ 已移除 collectResource() 函数（v2.0资源系统重构）
    // 资源现在只能通过资源副本获取

    // 添加战斗日志
    addBattleLog(message) {
        // 确保battle对象存在
        if (!this.transientState.battle) {
            this.transientState.battle = {
                inBattle: false,
                battleLog: []
            };
        }
        // 确保battleLog数组存在
        if (!this.transientState.battle.battleLog) {
            this.transientState.battle.battleLog = [];
        }
        this.transientState.battle.battleLog.push(message);
        // 限制日志长度
        if (this.transientState.battle.battleLog.length > 10) {
            this.transientState.battle.battleLog.shift();
        }

        // 更新UI（不影响原有逻辑）
        this.updateBattleLogUI(message);
    }

    // 更新战斗日志UI
    updateBattleLogUI(message) {
        // 更新悬浮战斗日志窗口
        const battleLogContent = document.getElementById('battle-log-content');
        const lastLogMessage = document.getElementById('last-log-message');

        if (battleLogContent) {
            const logEntry = document.createElement('p');
            logEntry.textContent = message;
            logEntry.className = 'text-light/80';
            battleLogContent.appendChild(logEntry);

            // 限制显示数量
            while (battleLogContent.children.length > 50) {
                battleLogContent.removeChild(battleLogContent.firstChild);
            }

            // 自动滚动到底部
            battleLogContent.scrollTop = battleLogContent.scrollHeight;
        }

        // 更新最小化状态的最后一条消息
        if (lastLogMessage) {
            lastLogMessage.textContent = message;
        }
    }

    // 切换战斗日志窗口的最小化状态
    toggleBattleLogWindow() {
        const battleLogContent = document.getElementById('battle-log-content');
        const battleLogMinimized = document.getElementById('battle-log-minimized');
        const toggleBtn = document.getElementById('toggle-battle-log-btn');

        if (!battleLogContent || !battleLogMinimized || !toggleBtn) return;

        const isMinimized = battleLogContent.classList.contains('hidden');

        if (isMinimized) {
            // 展开
            battleLogContent.classList.remove('hidden');
            battleLogMinimized.classList.add('hidden');
            toggleBtn.innerHTML = '<i class="fa fa-minus text-xs"></i>';
        } else {
            // 最小化
            battleLogContent.classList.add('hidden');
            battleLogMinimized.classList.remove('hidden');
            toggleBtn.innerHTML = '<i class="fa fa-plus text-xs"></i>';
        }
    }

    // 切换小地图弹窗显示/隐藏
    toggleMiniMapPopup(show = null) {
        const popup = document.getElementById('mini-map-popup');
        if (!popup) return;

        if (show === null) {
            // 切换状态
            popup.classList.toggle('hidden');
        } else if (show) {
            popup.classList.remove('hidden');
        } else {
            popup.classList.add('hidden');
        }
    }

    // ==================== 模态框工具函数 ====================

    // 显示选择模态框
    showSelectionModal(title, description, items, onSelect) {
        const modal = document.getElementById('selection-modal');
        const titleElement = document.getElementById('selection-modal-title');
        const descElement = document.getElementById('selection-modal-description');
        const contentElement = document.getElementById('selection-modal-content');

        titleElement.textContent = title;
        descElement.textContent = description || '';

        // 清空内容
        contentElement.innerHTML = '';

        // 添加选项
        items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'bg-dark/50 hover:bg-dark/70 border border-glass/50 rounded-lg p-3 cursor-pointer transition-all flex items-center';
            itemElement.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-3 text-accent font-bold">
                    ${index + 1}
                </div>
                <div class="flex-1">
                    <div class="text-light font-medium">${item.name}</div>
                    <div class="text-light/60 text-sm">${item.description || ''}</div>
                </div>
                <i class="fa fa-chevron-right text-light/40"></i>
            `;
            itemElement.addEventListener('click', () => {
                this.hideSelectionModal();
                if (onSelect) onSelect(index);
            });
            contentElement.appendChild(itemElement);
        });

        // 显示模态框
        modal.classList.remove('hidden');

        // 绑定关闭事件
        document.getElementById('close-selection-modal').onclick = () => this.hideSelectionModal();
        document.getElementById('cancel-selection').onclick = () => this.hideSelectionModal();
    }

    // 隐藏选择模态框
    hideSelectionModal() {
        const modal = document.getElementById('selection-modal');
        modal.classList.add('hidden');
    }

    // 显示提示模态框
    showAlertModal(title, message, type = 'info') {
        const modal = document.getElementById('alert-modal');
        const titleElement = document.getElementById('alert-modal-title');
        const messageElement = document.getElementById('alert-modal-message');
        const iconElement = document.getElementById('alert-modal-icon');

        titleElement.textContent = title;
        messageElement.textContent = message;

        // 根据类型设置图标
        const icons = {
            info: 'fa-info-circle text-accent',
            warning: 'fa-exclamation-triangle text-warning',
            error: 'fa-times-circle text-danger',
            success: 'fa-check-circle text-success'
        };
        iconElement.className = `fa ${icons[type] || icons.info} text-2xl mr-3`;

        modal.classList.remove('hidden');

        // 绑定关闭事件
        document.getElementById('close-alert-modal').onclick = () => this.hideAlertModal();
    }

    // 显示通知（简化版本，直接调用alertModal）
    showNotification(message, type = 'info') {
        const titles = {
            info: '提示',
            warning: '警告',
            error: '错误',
            success: '成功'
        };
        this.showAlertModal(titles[type] || '提示', message, type);
    }

    // 隐藏提示模态框
    hideAlertModal() {
        const modal = document.getElementById('alert-modal');
        modal.classList.add('hidden');
    }

    // 显示获得装备的弹框
    showEquipmentObtainModal(equipment, boxName, callback) {
        // 移除已存在的模态框
        const existingModal = document.getElementById('equipment-obtain-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // 获取装备颜色
        const colorClass = this.equipmentSystem.getEquipmentColorClass(equipment);
        const borderColor = this.equipmentSystem.getEquipmentColor(equipment.rarity, 'color');

        // 获取装备属性描述
        const statsDesc = this.equipmentSystem.getStatsDescription(equipment.stats);

        // 装备类型名称（从统一配置获取）
        const typeName = this.metadata.equipmentSlotConfig?.[equipment.type]?.name || '装备';

        const modalHtml = `
            <div id="equipment-obtain-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div class="bg-dark border border-glass rounded-xl p-6 max-w-md w-full mx-4">
                    <h3 class="text-xl font-bold text-accent mb-4 text-center">
                        <i class="fa fa-gift mr-2"></i> ${boxName}
                    </h3>

                    <div class="bg-dark/50 rounded-lg p-4 mb-4 border-2" style="border-color: ${borderColor}">
                        <div class="text-center mb-3">
                            <div class="text-lg font-bold ${colorClass}">${equipment.name}</div>
                            <div class="text-sm text-light/60">${equipment.realmName || '等级' + equipment.level} · ${equipment.rarityDisplayName || '白色'}${typeName}</div>
                        </div>

                        <div class="text-sm text-light/80 text-center">
                            ${statsDesc || '无属性'}
                        </div>
                    </div>

                    <div class="text-center text-sm text-light/60 mb-4">
                        点击确认后将自动装备或放入背包
                    </div>

                    <button id="confirm-equipment-obtain" class="w-full bg-accent hover:bg-accent/80 rounded-lg px-4 py-2 text-white font-medium transition-all flex items-center justify-center">
                        <i class="fa fa-check mr-2"></i> 确认
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 绑定确认按钮事件
        document.getElementById('confirm-equipment-obtain').addEventListener('click', () => {
            // 移除模态框
            const modal = document.getElementById('equipment-obtain-modal');
            if (modal) {
                modal.remove();
            }
            // 执行回调
            if (callback) {
                callback(true);
            }
        });
    }

    // 更新战斗日志UI
    updateBattleLog() {
        // 悬浮战斗日志窗口会通过 addBattleLog 自动更新，这里不需要额外处理
        // 保留此方法以保持向后兼容
    }
    

    // 加载游戏
    async loadGame() {
        try {
            // 保存用户信息（内存中的 _user）
            const userInfo = { ...this._user };

            // 只从服务器加载（如果已登录）
            if (this._user.loggedIn) {
                const serverGameState = await this.loadFromServer();

                if (serverGameState) {
                    if (serverGameState.success && serverGameState.gameState) {
                        this.addBattleLog('从服务器加载游戏成功！');

                        // 加载存档数据（不包含 user）
                        const { user, ...gameData } = serverGameState.gameState;
                        this.persistentState = gameData;

                        // 恢复用户信息到内存
                        this._user = userInfo;

                        // 重置临时数据
                        this.transientState = {
                            enemy: null,
                            sceneMonsters: [],
                            battle: { inBattle: false, battleLog: [] }
                        };

                        // 清空计算缓存
                        this._computedCache = {
                            equipmentEffects: null,
                            questCache: null
                        };

                        // 补充缺失的资源副本数据（v2.0新增）
                        if (this.persistentState.player && !this.persistentState.player.resourceDungeons) {
                            console.log('[数据迁移] 添加资源副本数据...');
                            this.persistentState.player.resourceDungeons = {};
                            // 如果dungeon系统已初始化，调用其初始化方法
                            if (this.dungeon) {
                                this.dungeon.initAllDungeonData();
                            }
                        }

                        // 先加载 metadata（初始化需要从 metadata 读取配置）
                        await this.fetchGameMetadata();

                        // 检查是否是新玩家，需要初始化
                        if (this.persistentState.player?.isNewPlayer) {
                            console.log('检测到新玩家，开始初始化游戏状态...');
                            this.initializeNewPlayer();
                            delete this.persistentState.player.isNewPlayer; // 移除标记
                            this.saveGameState(); // 保存初始化后的状态
                        }

                        // 清理装备的colorClass属性
                        this.equipmentSystem.cleanupEquipmentColorClass();

                        // 主线任务系统数据迁移（兼容旧存档）
                        if (!this.persistentState.mainQuest) {
                            this.persistentState.mainQuest = {
                                currentRealm: 0,
                                currentStage: 1,
                                currentLevel: 1,
                                currentLevelQuestIndex: 0,
                                currentQuestIndex: 0,
                                completedQuests: [],
                                questData: {}
                            };
                        } else {
                            // 迁移旧存档到新的模板系统字段
                            if (this.persistentState.mainQuest.currentStage === undefined) {
                                this.persistentState.mainQuest.currentStage = this.persistentState.player?.realm?.currentStage || 1;
                            }
                            if (this.persistentState.mainQuest.currentLevel === undefined) {
                                this.persistentState.mainQuest.currentLevel = this.persistentState.player?.realm?.currentLevel || 1;
                            }
                            if (this.persistentState.mainQuest.currentLevelQuestIndex === undefined) {
                                this.persistentState.mainQuest.currentLevelQuestIndex = 0;
                            }
                            // 移除旧存档中的 generatedCache（不再存储）
                            if (this.persistentState.mainQuest.generatedCache !== undefined) {
                                delete this.persistentState.mainQuest.generatedCache;
                            }
                        }
                        if (!this.persistentState.mainStory) {
                            this.persistentState.mainStory = {
                                viewedScenes: [],
                                currentScene: null
                            };
                        }

                        // 每日任务系统数据迁移（兼容旧存档）
                        if (!this.persistentState.dailyQuests) {
                            this.persistentState.dailyQuests = {
                                lastRefreshDate: null,
                                quests: [],
                                activityPoints: 0,
                                streak: 0,
                                totalCompleted: 0,
                                completedToday: false
                            };
                        }

                        // VIP系统数据迁移（兼容旧存档）
                        if (!this.persistentState.vip) {
                            this.persistentState.vip = { level: 0, totalRecharged: 0 };
                        }
                        if (this.persistentState.resources.jade === undefined) {
                            this.persistentState.resources.jade = 0;
                        }

                        // 图鉴系统数据迁移（兼容旧存档）
                        if (!this.persistentState.collection) {
                            this.persistentState.collection = {
                                enemies: [],
                                equipmentTypes: [],
                                rewardedCategories: []
                            };
                        }

                        // 背包分页状态初始化（兼容旧存档）
                        if (!this.inventoryPagination) {
                            this.inventoryPagination = {
                                currentPage: 1,
                                totalPages: 1,
                                itemsPerPage: SIZES.INVENTORY_PAGE_SIZE || 50
                            };
                        }

                        // 检查临时状态是否过期
                        this.checkTemporaryStats();
                    } else {
                        // 如果token无效，重定向到登录页面
                        if (serverGameState.error === 'Invalid token' || serverGameState.error === 'No token provided') {
                            console.warn('Token无效，正在退出登录...');
                            this.logout();
                            return null;
                        }
                    }
                } else {
                    console.error('服务器端加载失败:', serverGameState?.error || '未知错误');
                    this.addBattleLog('从服务器加载存档失败，请重新登录');
                    this.logout();
                    return null; // ✅ 添加 return，防止继续执行
                }
            } else {
                this.addBattleLog('访客模式无法加载游戏！');
                return null;
            }
        } catch (error) {
            this.addBattleLog('游戏加载失败！');
            console.error('加载游戏失败:', error);
            this.logout();
            return null; // ✅ 添加 return，防止继续执行
        }
    }
    
    // 计算武器精炼所需材料

    

    


    // 保存游戏状态
    async saveGameState() {
        try {
            if (this._user.loggedIn) {
                console.log('💾 准备保存游戏状态...');

                const token = localStorage.getItem('cultivationToken');

                // 直接保存 persistentState，无需过滤
                const response = await fetch('http://localhost:3002/api/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ gameState: this.persistentState })
                });

                const result = await response.json();
                if (!result.success) {
                    console.error('服务器端保存失败:', result.error);
                    if (result.error === 'Invalid token' || result.error === 'No token provided') {
                        this.logout();
                    }
                } else {
                    console.log('✅ 游戏状态保存成功');
                }
            }
        } catch (error) {
            console.error('保存游戏状态失败:', error);
        }
    }
    
    // 从服务器加载
    async loadFromServer() {
        try {
            const token = localStorage.getItem('cultivationToken');

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

    // 初始化新玩家
    initializeNewPlayer() {
        console.log('正在初始化新玩家数据...');

        // 1. 初始化玩家属性（从metadata）
        if (this.metadata.player?.initialStats) {
            Object.assign(this.persistentState.player, this.metadata.player.initialStats);
        }

        // 2. 初始化资源（v2.0资源系统重构 - 统一到 resources）
        if (!this.persistentState.resources) {
            this.persistentState.resources = {
                spiritStones: 0,
                jade: 0,
                herbs: 0,
                iron: 0,
                breakthroughStones: 0
            };
        }

        // 3. 初始化装备和背包
        this.persistentState.player.equipment = {};
        // 注意：equipmentEffects 现在是 getter，会自动计算，无需初始化
        this.persistentState.player.inventory = {
            items: [],          // 装备和物品
            consumables: {},    // 消耗品
            waypoints: []       // 解锁的传送点
        };

        // 4. 初始化技能（使用新的技能树系统）
        if (this.metadata.realmSkills && this.realmSkillSystem) {
            this.realmSkillSystem.initializeDefaultSkillTrees();
        }

        // 5. 初始化设置（从metadata）
        if (this.metadata.player?.defaultSettings) {
            this.persistentState.settings = JSON.parse(JSON.stringify(this.metadata.player.defaultSettings));
        }

        // 6. 初始化战斗状态
        if (this.metadata.player?.defaultBattleState) {
            this.transientState.battle = JSON.parse(JSON.stringify(this.metadata.player.defaultBattleState));
        }

        // 7. 计算初始装备效果
        this.equipmentSystem.calculateEquipmentEffects();

        // 8. 初始化地图状态
        this.persistentState.currentBackgroundIndex = 0;
        this.transientState.sceneMonsters = [];

        // 9. 初始化主线任务系统
        this.persistentState.mainQuest = {
            currentRealm: 0,
            currentStage: 1,
            currentLevel: 1,
            currentLevelQuestIndex: 0,
            currentQuestIndex: 0,  // 保留兼容
            completedQuests: [],
            questData: {}
        };
        this.persistentState.mainStory = {
            viewedScenes: [],
            currentScene: null
        };

        // 10. 初始化每日任务系统
        this.persistentState.dailyQuests = {
            lastRefreshDate: null,
            quests: [],
            activityPoints: 0,
            streak: 0,
            totalCompleted: 0,
            completedToday: false
        };

        // 11. 初始化VIP系统
        this.persistentState.vip = { level: 0, totalRecharged: 0 };

        // 12. 初始化图鉴系统
        this.persistentState.collection = {
            enemies: [],
            equipmentTypes: [],
            rewardedCategories: []
        };

        // 13. 初始化背包分页状态
        this.inventoryPagination = {
            currentPage: 1,
            totalPages: 1,
            itemsPerPage: SIZES.INVENTORY_PAGE_SIZE || 50,
            currentEquipmentType: 'all'  // 当前选中的装备类型（'all'表示全部）
        };

        console.log('新玩家初始化完成');
        this.addBattleLog('欢迎来到无尽修仙的世界！踏入修仙之路，成就无上仙道！');
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

        // 更新合成石数量显示
        this.updateFusionStoneCount();

        // 重置合成石复选框
        const useFusionStoneCheckbox = document.getElementById('use-fusion-stone');
        if (useFusionStoneCheckbox) {
            useFusionStoneCheckbox.checked = false;
            // 绑定复选框变化事件
            useFusionStoneCheckbox.onchange = () => {
                this.updateCraftSuccessRate();
            };
        }

        // 禁用合成按钮
        const confirmCraftBtn = document.getElementById('confirm-craft');
        if (confirmCraftBtn) {
            confirmCraftBtn.disabled = true;
            confirmCraftBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }

        // 绑定拖放事件
        this.bindDragAndDrop();
    }

    // 更新合成石数量显示
    updateFusionStoneCount() {
        const fusionStoneCount = this.persistentState.player.inventory.consumables?.fusion_stone || 0;
        const countElement = document.getElementById('fusion-stone-count');
        if (countElement) {
            countElement.textContent = `拥有: ${fusionStoneCount}`;
        }
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
        const inventory = this.persistentState.player.inventory;
        const item = inventory[index];
        
        // 检查是否是装备
        if (!(this.equipmentSystem.isEquipmentType(item.type) || item.type === 'equipment' || item.equipmentType)) {
            this.addBattleLog('只能合成装备！');
            return;
        }
        
        // 显示装备信息
        const itemType = item.equipmentType || item.type;
        const rarityColor = this.equipmentSystem.getRarityColor(item.rarity || 'white');

        slot.innerHTML = `
            <div class="text-xs ${rarityColor} text-center">
                <i class="fa ${this.equipmentSystem.getEquipmentIcon(itemType)}"></i><br>
                ${item.name}
            </div>
        `;
        
        slot.dataset.itemId = index;
        
        // 更新成功率
        this.updateCraftSuccessRate();
    }
    
    // 获取装备图标


    // 更新合成成功率
    updateCraftSuccessRate() {
        const slots = document.querySelectorAll('[craft-data-slot]');
        const items = [];
        const confirmCraftBtn = document.getElementById('confirm-craft');
        const rateElement = document.getElementById('craft-success-rate');

        // 收集所有放入槽位的物品
        slots.forEach(slot => {
            const itemId = slot.dataset.itemId;
            if (itemId) {
                const item = this.persistentState.player.inventory[itemId];
                if (item) {
                    items.push(item);
                }
            }
        });

        // 检查是否有3个物品
        if (items.length !== 3) {
            rateElement.textContent = '需要3件装备';
            rateElement.title = '';
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

        let mismatchDetails = [];
        const isValid = items.every((item) => {
            const itemType = item.equipmentType || item.type;
            const itemLevel = item.level || 1;
            const itemRarity = item.rarity || 'white';

            if (itemType !== firstType) {
                mismatchDetails.push(`${item.name}: 类型(${itemType})`);
            }
            if (itemLevel !== firstLevel) {
                mismatchDetails.push(`${item.name}: 等级(${itemLevel})`);
            }
            if (itemRarity !== firstRarity) {
                mismatchDetails.push(`${item.name}: 品质(${itemRarity})`);
            }
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
                case 'rainbow':
                    successRate = 30;  // 彩色合成成功率降低（原50%）
                    break;
            }

            // 检查是否使用合成石
            const useFusionStoneCheckbox = document.getElementById('use-fusion-stone');
            const fusionStones = this.persistentState.player.inventory.consumables?.fusion_stone || 0;
            let bonusRate = 0;

            if (useFusionStoneCheckbox && useFusionStoneCheckbox.checked && fusionStones > 0) {
                bonusRate = 20;  // 合成石提供20%加成
            }

            const totalRate = Math.min(successRate + bonusRate, 100);  // 最高100%
            rateElement.textContent = bonusRate > 0 ? `${totalRate}% (+${bonusRate}%)` : `${successRate}%`;
            rateElement.title = bonusRate > 0 ? `基础${successRate}% + 合成石${bonusRate}%` : '';
            // 启用合成按钮
            if (confirmCraftBtn) {
                confirmCraftBtn.disabled = false;
                confirmCraftBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        } else {
            rateElement.textContent = '条件不满足';
            rateElement.title = mismatchDetails.join('\n');
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

        // 检查是否使用合成石
        const useFusionStoneCheckbox = document.getElementById('use-fusion-stone');
        const fusionStones = this.persistentState.player.inventory.consumables?.fusion_stone || 0;
        let useFusionStone = false;
        let bonusRate = 0;

        if (useFusionStoneCheckbox && useFusionStoneCheckbox.checked && fusionStones > 0) {
            useFusionStone = true;
            bonusRate = 20;
        }

        // 收集所有放入槽位的物品
        slots.forEach(slot => {
            const itemId = slot.dataset.itemId;
            if (itemId) {
                itemIds.push(parseInt(itemId));
                const item = this.persistentState.player.inventory[itemId];
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

        let mismatchReason = '';
        const isValid = items.every((item) => {
            const itemType = item.equipmentType || item.type;
            const itemLevel = item.level || 1;
            const itemRarity = item.rarity || 'white';

            if (itemType !== firstType) {
                mismatchReason = `类型不匹配: ${items[0].name}(${firstType}) vs ${item.name}(${itemType})`;
                return false;
            }
            if (itemLevel !== firstLevel) {
                mismatchReason = `等级不匹配: ${items[0].name}(Lv.${firstLevel}) vs ${item.name}(Lv.${itemLevel})`;
                return false;
            }
            if (itemRarity !== firstRarity) {
                mismatchReason = `品质不匹配: ${items[0].name}(${firstRarity}) vs ${item.name}(${itemRarity})`;
                return false;
            }
            return true;
        });

        if (!isValid) {
            this.addBattleLog(`合成失败！${mismatchReason}`);
            return;
        }

        // ✅ 检查是否为彩色装备（最高品质，无法继续合成）
        if (firstRarity === 'rainbow') {
            this.addBattleLog('彩色装备已经是最高品质，无法继续合成！');
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
            case 'rainbow':
                successRate = 30;  // 彩色合成成功率30%
                break;
        }

        // 添加合成石加成
        const totalRate = Math.min(successRate + bonusRate, 100);

        // 从背包中移除物品（从后往前移除，避免索引混乱）
        itemIds.sort((a, b) => b - a);
        itemIds.forEach(id => {
            this.persistentState.player.inventory.splice(id, 1);
        });

        // 消耗合成石
        if (useFusionStone) {
            this.persistentState.player.inventory.consumables.fusion_stone -= 1;
            this.addBattleLog('使用了合成石，成功率+20%！');
        }

        // 生成新装备
        const newRarity = this.getNextRarity(firstRarity);
        const newEquipment = this.equipmentSystem.generateEquipment(firstType, firstLevel, newRarity);

        // 合成结果
        const resultSlot = document.getElementById('craft-result-slot');

        if (Math.random() * 100 < totalRate) {
            // 合成成功
            this.persistentState.player.inventory.push(newEquipment);
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
            const newEquipmentColorClass = this.equipmentSystem.getEquipmentColorClass(newEquipment);
            resultSlot.innerHTML = `
                <div class="text-xs ${newEquipmentColorClass} text-center animate-pulse">
                    <i class="fa ${this.equipmentSystem.getEquipmentIcon(firstType)}"></i><br>
                    ${newEquipment.name}
                </div>
            `;
        } else {
            // 合成失败，返回一个原品质的装备
            const failedEquipment = this.equipmentSystem.generateEquipment(firstType, firstLevel, firstRarity);
            this.persistentState.player.inventory.push(failedEquipment);
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
            const failedEquipmentColorClass = this.equipmentSystem.getEquipmentColorClass(failedEquipment);
            resultSlot.innerHTML = `
                <div class="text-xs ${failedEquipmentColorClass} text-center animate-pulse">
                    <i class="fa ${this.equipmentSystem.getEquipmentIcon(firstType)}"></i><br>
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
        const rarityOrder = ['white', 'blue', 'purple', 'gold', 'rainbow'];
        const currentIndex = rarityOrder.indexOf(rarity);
        return rarityOrder[Math.min(currentIndex + 1, rarityOrder.length - 1)];
    }

    // 获取可用于合成的3件装备（公共方法）
    getCraftableEquipmentIndices(inventory) {
        // 按类型、等级、品质分组装备，排除正在穿戴的装备
        const equipmentGroups = {};
        inventory.forEach((item, index) => {
            // 检查装备是否正在穿戴
            const isEquipped = this.equipmentSystem.isEquipmentEquipped(item);
            if (isEquipped) {
                return; // 跳过正在穿戴的装备
            }

            if (this.equipmentSystem.isEquipmentType(item.type) || item.type === 'equipment' || item.equipmentType) {
                const type = item.equipmentType || item.type;
                const level = item.level || 1;
                const rarity = item.rarity || 'white';

                // ✅ 跳过彩色装备（已经是最高品质，无法继续升级）
                if (rarity === 'rainbow') {
                    return;
                }

                const key = `${type}_${level}_${rarity}`;

                if (!equipmentGroups[key]) {
                    equipmentGroups[key] = [];
                }
                equipmentGroups[key].push(index);
            }
        });

        // 找到有3个或以上相同类型、等级、品质装备的组
        for (const key in equipmentGroups) {
            if (equipmentGroups[key].length >= 3) {
                return equipmentGroups[key].slice(0, 3);
            }
        }

        return null;
    }

    // 一键添加装备到合成槽
    autoAddToCraftSlots() {
        const inventory = this.persistentState.player.inventory;
        const craftSlots = document.querySelectorAll('[craft-data-slot]');

        // 清空现有槽位
        craftSlots.forEach(slot => {
            slot.innerHTML = '<div class="text-xs text-light/60">拖放装备</div>';
        });

        // 使用公共方法获取符合条件的3件装备
        const selectedIndices = this.getCraftableEquipmentIndices(inventory);

        if (!selectedIndices) {
            this.addBattleLog('没有找到符合条件的3件装备（相同类型、等级、品质且未穿戴，彩色装备除外）！');
            return;
        }

        // 添加到槽位
        for (let i = 0; i < selectedIndices.length; i++) {
            const index = selectedIndices[i];
            const slot = craftSlots[i];
            const item = inventory[index];
            const itemType = item.equipmentType || item.type;
            const rarityColor = this.equipmentSystem.getRarityColor(item.rarity || 'white');

            if (slot) {
                slot.innerHTML = `
                    <div class="text-xs ${rarityColor} text-center">
                        <i class="fa ${this.equipmentSystem.getEquipmentIcon(itemType)}"></i><br>
                        ${item.name}
                    </div>
                `;
                slot.dataset.itemId = index;
            }
        }

        // 更新成功率
        this.updateCraftSuccessRate();

        this.addBattleLog(`已添加3件装备到合成槽！`);
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
                const currentInventory = this.persistentState.player.inventory || [];

                // 清空所有合成槽位
                craftSlots.forEach(slot => {
                    slot.innerHTML = '<div class="text-xs text-light/60">拖放装备</div>';
                    slot.dataset.itemId = '';
                });

                // 使用公共方法获取符合条件的3件装备
                const indices = this.getCraftableEquipmentIndices(currentInventory);

                if (!indices) {
                    break; // 没有可合成的装备
                }

                // 动态显示装备放入圆圈（每个间隔200ms）
                for (let i = 0; i < indices.length; i++) {
                    if (!this.isAutoCrafting) break;

                    const index = indices[i];
                    const slot = craftSlots[i];
                    const item = currentInventory[index];
                    const itemType = item.equipmentType || item.type;
                    const rarityColor = this.equipmentSystem.getRarityColor(item.rarity || 'white');

                    // 确保槽位存在
                    if (slot) {
                        slot.innerHTML = `
                            <div class="text-xs ${rarityColor} text-center">
                                <i class="fa ${this.equipmentSystem.getEquipmentIcon(itemType)}"></i><br>
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
                craftedCount++;

                // 等待2秒后进行下一次合成，给用户足够时间看到合成结果
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            if (craftedCount > 0) {
                this.addBattleLog(`一键合成完成！共合成了${craftedCount}次装备。（彩色装备已跳过）`);
            } else {
                this.addBattleLog('没有足够的装备进行合成！（彩色装备无法合成）');
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

    // 检查可合成的装备
    checkCraftableEquipment() {
        const inventory = this.persistentState.player.inventory || [];
        const equipmentByTypeLevelRarity = {};
        
        // 按类型、等级和品质分组装备
        inventory.forEach(item => {
            // 检查是否是装备类型
            if (this.equipmentSystem.isEquipmentType(item.type) || item.type === 'equipment' || item.equipmentType) {
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
        return this.metadata.equipmentSlotConfig?.[type]?.name || type;
    }
    
    // 获取品质的中文名称
    getRarityDisplayName(rarity) {
        const rarityNames = {
            white: '',
            blue: '蓝色',
            purple: '紫色',
            gold: '金色',
            rainbow: '彩色'
        };
        return rarityNames[rarity] || '';
    }
    
    // 合成装备
    craftEquipment(craftable, useFusionStone = false) {
        // 从背包中取出3个装备
        const inventory = this.persistentState.player.inventory;
        const itemsToRemove = [];
        const originalItems = [];

        // 检查是否使用合成石
        let bonusRate = 0;
        let fusionStoneUsed = false;
        if (useFusionStone) {
            const fusionStones = this.persistentState.player.inventory.consumables?.fusion_stone || 0;
            if (fusionStones > 0) {
                bonusRate = 0.2; // 合成石提供20%成功率加成
                fusionStoneUsed = true;
            }
        }

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
        const success = this.checkCraftSuccess(baseRarity, bonusRate);

        // 消耗合成石（在合成前消耗，无论成功失败）
        if (fusionStoneUsed) {
            this.persistentState.player.inventory.consumables.fusion_stone -= 1;
        }

        if (success) {
            // 合成成功：生成新装备（同等级，更高品质）
            const newEquipment = this.generateCraftedEquipment(craftable.type, craftable.level, newRarity);

            // 检查并提示用户是否装备更好的装备（非战斗场景）
            const equipped = this.checkAndEquipBetterGearWithPrompt(newEquipment);
            if (!equipped) {
                // 将新装备添加到背包
                inventory.push(newEquipment);
                this.addBattleLog(`成功合成${craftable.typeName}！`);
                const stoneMsg = fusionStoneUsed ? '（使用了合成石）' : '';
                this.addBattleLog(`消耗了3个${craftable.level}级${this.getRarityDisplayName(baseRarity)}${craftable.typeName}，获得了1个${craftable.level}级${this.getRarityDisplayName(newRarity)}${newEquipment.name}，已放入背包！${stoneMsg}`);
            } else {
                this.addBattleLog(`成功合成${craftable.typeName}！`);
                const stoneMsg = fusionStoneUsed ? '（使用了合成石）' : '';
                this.addBattleLog(`消耗了3个${craftable.level}级${this.getRarityDisplayName(baseRarity)}${craftable.typeName}，获得了1个${craftable.level}级${this.getRarityDisplayName(newRarity)}${newEquipment.name}！${stoneMsg}`);
            }
        } else {
            // 合成失败：返还一个原品质的装备
            const failedEquipment = this.generateCraftedEquipment(craftable.type, craftable.level, baseRarity);
            inventory.push(failedEquipment);
            this.addBattleLog(`合成${craftable.typeName}失败！`);
            const stoneMsg = fusionStoneUsed ? '（使用了合成石）' : '';
            this.addBattleLog(`消耗了3个${craftable.level}级${this.getRarityDisplayName(baseRarity)}${craftable.typeName}，只获得了1个${craftable.level}级${this.getRarityDisplayName(baseRarity)}${failedEquipment.name}！${stoneMsg}`);
        }

    }
    
    // 自动合成装备

    

    
    // 计算合成装备属性的公共函数（用于合成装备，随机选择属性）
    calculateCraftedEquipmentStats(template, level, rarityInfo) {
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
        // 装备模板
        const template = this.metadata.equipmentTemplates.find(t => t.type === type);
        if (!template) {
            return null;
        }

        // 使用指定的品质
        const rarityInfo = this.metadata.equipmentRarities.find(r => r.name === rarity);

        // 使用公共函数计算装备属性
        const stats = this.calculateCraftedEquipmentStats(template, level, rarityInfo);
        
        // 生成装备名称（按境界×品质分级）
        const rarityIdx = this.equipmentSystem.getRarityIndex(rarity);
        const realmIdx = Math.min(Math.max(0, level - 1), (this.metadata.equipmentPrefixesByRealm?.length || 1) - 1);
        const prefixes = this.metadata.equipmentPrefixesByRealm?.[realmIdx] || ["", "", "", "", ""];
        const prefix = prefixes[rarityIdx] || "";
        const suffixIndex = Math.floor(Math.random() * template.nameSuffixes.length);
        const suffix = template.nameSuffixes[suffixIndex] || "装备";
        const name = prefix + suffix;
        
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
    
    // 获取下一个品质（固定升级路径）
    getNextRarity(currentRarity) {
        const rarityOrder = ['white', 'blue', 'purple', 'gold', 'rainbow'];
        const currentIndex = rarityOrder.indexOf(currentRarity);
        
        if (currentIndex < rarityOrder.length - 1) {
            return rarityOrder[currentIndex + 1];
        }
        
        // 已经是最高品质，返回当前品质
        return currentRarity;
    }
    
    // 检查合成是否成功
    checkCraftSuccess(currentRarity, bonusRate = 0) {
        const successRates = {
            white: 1.0,    // 白色到蓝色：100%成功
            blue: 0.8,     // 蓝色到紫色：80%成功
            purple: 0.6,   // 紫色到黄金：60%成功
            gold: 0.3,     // 黄金到彩色：30%成功
            rainbow: 1.0   // 彩色已经是最高品质，返回当前品质
        };

        const successRate = successRates[currentRarity] || 1.0;
        return Math.random() < (successRate + bonusRate);
    }
    
    // 登出
    async logout() {
        try {
            // 保存当前用户的游戏状态到服务器
            if (this._user.loggedIn) {
                const currentUserId = this._user.userId;
                await this.saveToServer(currentUserId, this.persistentState);
            }
            
            // 调用服务器端登出API
            const token = localStorage.getItem('cultivationToken');
            if (token) {
                await fetch('http://localhost:3002/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            
            // 清除localStorage中的token和用户信息
            localStorage.removeItem('cultivationToken');
            localStorage.removeItem('cultivationUser');

            // 立即重定向到登录页面，添加logout参数以触发强制清除
            // 使用 replace 方法避免浏览器历史记录问题
            setTimeout(() => {
                // 清除跳转计数
                sessionStorage.removeItem('redirectCount');
                // 使用 replace 方法确保不会回到已登录状态，并添加logout参数
                window.location.replace('login.html?logout=true');
            }, 100);
        } catch (error) {
            console.error('登出错误:', error);
            // 即使出错，也要清除本地存储并重定向到登录页面
            localStorage.removeItem('cultivationToken');
            localStorage.removeItem('cultivationUser');
            sessionStorage.removeItem('redirectCount');
            window.location.replace('login.html?logout=true');
        }
    }
    
    // 注销用户
    async deleteAccount() {
        try {
            const username = this._user.username;
            const self = this; // 保存this引用

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
                            <button id="cancel-delete" class="flex-1 bg-dark border border-glass rounded-lg px-4 py-2 text-light hover:bg-dark/80 flex items-center justify-center">
                                <i class="fa fa-times mr-2"></i>取消
                            </button>
                            <button id="confirm-delete" class="flex-1 bg-danger rounded-lg px-4 py-2 text-white hover:bg-danger/80 flex items-center justify-center">
                                <i class="fa fa-trash mr-2"></i>确认注销
                            </button>
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
                    self.showAlertModal('提示', '请输入密码', 'warning');
                    return;
                }

                const token = localStorage.getItem('cultivationToken');

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
                        self.addBattleLog('账号注销成功！');
                        // 清除本地存储的token和用户信息
                        localStorage.removeItem('cultivationToken');
                        localStorage.removeItem('cultivationUser');
                        sessionStorage.removeItem('redirectCount'); // 清除跳转计数
                        // 重定向到登录页面
                        setTimeout(() => {
                            window.location.href = 'login.html?logout=true';
                        }, 2000);
                    } else {
                        self.addBattleLog(`注销失败：${result.error}`);
                    }
                } catch (error) {
                    console.error('注销用户失败:', error);
                    self.addBattleLog('注销用户失败，请稍后再试');
                    modal.remove();
                }
            });
        } catch (error) {
            console.error('注销用户失败:', error);
            this.addBattleLog('注销用户失败，请稍后再试');
        }
    }

    // 计算装备效果

    
    // 显示装备菜单
    showEquipMenu() {
        // 确保背包存在
        if (!this.persistentState.player.inventory) {
            this.persistentState.player.inventory = [];
        }

        // 过滤背包中可用的装备（玩家等级 >= 装备等级）
        const availableEquipment = this.persistentState.player.inventory.filter(
            item => item.level <= this.calculateTotalLevel()
        );

        if (availableEquipment.length === 0) {
            this.showAlertModal('提示', '背包中没有可用的装备！', 'warning');
            return;
        }

        // 创建选项列表
        const items = availableEquipment.map(item => ({
            name: item.name,
            description: `${item.type} | 等级: ${item.level} | ${this.equipmentSystem.getStatsDescription(item.stats)}`
        }));

        // 显示选择模态框
        this.showSelectionModal('选择要装备的物品', '点击选择要装备的物品', items, (index) => {
            const selectedItem = availableEquipment[index];
            // 从背包中移除装备
            const inventoryIndex = this.persistentState.player.inventory.indexOf(selectedItem);
            if (inventoryIndex > -1) {
                this.persistentState.player.inventory.splice(inventoryIndex, 1);
            }
            // 装备物品
            this.equipItem(selectedItem);
        });
    }

    // 显示卸下装备菜单
    showUnequipMenu() {
        // 获取已装备的物品
        const equippedItems = [];
        for (const slot in this.persistentState.player.equipment) {
            const item = this.persistentState.player.equipment[slot];
            if (item) {
                equippedItems.push({ ...item, slot });
            }
        }

        if (equippedItems.length === 0) {
            this.showAlertModal('提示', '没有已装备的物品！', 'warning');
            return;
        }

        // 创建选项列表
        const items = equippedItems.map(item => ({
            name: item.name,
            description: `${item.slot} | ${this.equipmentSystem.getStatsDescription(item.stats)}`
        }));

        // 显示选择模态框
        this.showSelectionModal('选择要卸下的物品', '点击选择要卸下的物品', items, (index) => {
            this.unequipItem(equippedItems[index].slot);
        });
    }
    
    // 装备物品
    equipItem(item) {
        // 记录装备前战力
        const oldPower = this.calculatePlayerCombatPower();
        // 检查是否已有同类型装备
        const existingItem = this.persistentState.player.equipment[item.type];
        
        // 装备新物品
        this.persistentState.player.equipment[item.type] = item;
        
        // 如果有旧装备，将其放回背包
        if (existingItem) {
            // 确保背包存在
            if (!this.persistentState.player.inventory) {
                this.persistentState.player.inventory = [];
            }
            // 将旧装备放回背包
            this.persistentState.player.inventory.push(existingItem);
        }
        
        // 计算装备效果
        this.equipmentSystem.calculateEquipmentEffects();

        // 更新装备栏显示
        this.equipmentSystem.updateCharacterEquipmentDisplay();
        this.equipmentSystem.updateCharacterEquipmentDisplayModal();

        // 更新UI
        this.updateUI();

        // 更新人物面板属性
        if (typeof this.updateCharacterModal === 'function') {
            this.updateCharacterModal();
        }

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
        // 显示战力变化
        const newPower = this.calculatePlayerCombatPower();
        this.showCombatPowerChange(newPower - oldPower);
    }
    
    // 卸下物品
    unequipItem(slot) {
        const item = this.persistentState.player.equipment[slot];
        if (item) {
            const oldPower = this.calculatePlayerCombatPower();
            // 卸下物品
            this.persistentState.player.equipment[slot] = null;
            
            // 将卸下的装备放回背包
            this.persistentState.player.inventory.push(item);
            
            // 计算装备效果
            this.equipmentSystem.calculateEquipmentEffects();

            // 更新装备栏显示
            this.equipmentSystem.updateCharacterEquipmentDisplay();
            this.equipmentSystem.updateCharacterEquipmentDisplayModal();

            // 更新UI
            this.updateUI();

            // 更新人物面板属性
            if (typeof this.updateCharacterModal === 'function') {
                this.updateCharacterModal();
            }

            // 添加日志
            this.addBattleLog(`卸下了 ${item.name}，已放回背包！`);
            // 显示战力变化
            const newPower = this.calculatePlayerCombatPower();
            this.showCombatPowerChange(newPower - oldPower);
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
        const currentItem = this.persistentState.player.equipment[item.type];

        // 没有当前装备，直接穿上
        if (!currentItem) {
            const inventoryIndex = this.persistentState.player.inventory.indexOf(item);
            if (inventoryIndex > -1) this.persistentState.player.inventory.splice(inventoryIndex, 1);
            this.equipItem(item);
            return true;
        }

        // 比较总战力（含精炼）
        const newItemPower = this.calculateEquipmentCombatPower(item);
        const currentItemPower = this.calculateEquipmentCombatPower(currentItem);

        if (newItemPower > currentItemPower) {
            const inventoryIndex = this.persistentState.player.inventory.indexOf(item);
            if (inventoryIndex > -1) this.persistentState.player.inventory.splice(inventoryIndex, 1);
            this.equipItem(item);
            return true;
        }

        // 总战力不如当前，但基础战力更高 → 提示潜力装备
        const newItemBase = this.calculateEquipmentCombatPower({ ...item, refineLevel: 0 });
        const currentItemBase = this.calculateEquipmentCombatPower({ ...currentItem, refineLevel: 0 });

        if (newItemBase > currentItemBase) {
            this.showEquipUpgradePrompt(item, currentItem);
            return true; // 不放入背包，等用户确认
        }

        return false;
    }

    /**
     * 检查并提示用户是否装备更好的装备（非战斗场景使用）
     * @param {Object} item - 新装备
     * @returns {boolean} - true表示处理完成（装备或显示提示），false表示应放入背包
     */
    checkAndEquipBetterGearWithPrompt(item) {
        const currentItem = this.persistentState.player.equipment[item.type];

        // 没有当前装备，直接穿上
        if (!currentItem) {
            this.showEquipReplacePrompt(item, null);
            return true;
        }

        // 比较总战力（含精炼）
        const newItemPower = this.calculateEquipmentCombatPower(item);
        const currentItemPower = this.calculateEquipmentCombatPower(currentItem);

        if (newItemPower > currentItemPower) {
            // 新装备战力更高，显示替换提示
            this.showEquipReplacePrompt(item, currentItem);
            return true;
        }

        // 总战力不如当前，但基础战力更高 → 提示潜力装备
        const newItemBase = this.calculateEquipmentCombatPower({ ...item, refineLevel: 0 });
        const currentItemBase = this.calculateEquipmentCombatPower({ ...currentItem, refineLevel: 0 });

        if (newItemBase > currentItemBase) {
            this.showEquipUpgradePrompt(item, currentItem);
            return true; // 不放入背包，等用户确认
        }

        return false;
    }

    /**
     * 显示装备替换确认弹窗（非战斗场景，新装备更强时）
     */
    showEquipReplacePrompt(newItem, currentItem) {
        const newItemPower = this.calculateEquipmentCombatPower(newItem);
        const currentItemPower = currentItem ? this.calculateEquipmentCombatPower(currentItem) : 0;

        const newStats = this.equipmentSystem.getStatsDescription(newItem.stats);
        const curStats = currentItem ? this.equipmentSystem.getStatsDescription(currentItem.stats) : '无';
        const newColor = this.equipmentSystem.getEquipmentColorClass(newItem);
        const curColor = currentItem ? this.equipmentSystem.getEquipmentColorClass(currentItem) : '';
        const slotName = this.equipmentSystem.getSlotDisplayName(newItem.type);

        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-[200]';
        overlay.innerHTML = `
            <div class="bg-dark-card border border-gold/40 rounded-xl p-5 max-w-sm w-full mx-4 shadow-2xl">
                <h3 class="text-gold font-bold text-base mb-3 text-center">
                    <i class="fa fa-star mr-1"></i> 获得更好的${slotName}
                </h3>
                <div class="grid grid-cols-2 gap-3 mb-4">
                    ${currentItem ? `
                    <div class="bg-black/40 rounded-lg p-3 border border-red-500/30">
                        <div class="text-xs text-red-400 mb-1">当前装备</div>
                        <div class="text-sm ${curColor} font-bold mb-1">${currentItem.name}</div>
                        <div class="text-xs text-white/70">精炼: +${currentItem.refineLevel || 0}</div>
                        <div class="text-xs text-white/70">${curStats}</div>
                        <div class="text-xs text-gold mt-1">⚔ 战力: ${currentItemPower}</div>
                    </div>
                    ` : `
                    <div class="bg-black/40 rounded-lg p-3 border border-gray-500/30">
                        <div class="text-xs text-gray-400 mb-1">当前装备</div>
                        <div class="text-sm text-gray-500 font-bold mb-1">无装备</div>
                    </div>
                    `}
                    <div class="bg-black/40 rounded-lg p-3 border border-green-500/30">
                        <div class="text-xs text-green-400 mb-1">新装备</div>
                        <div class="text-sm ${newColor} font-bold mb-1">${newItem.name}</div>
                        <div class="text-xs text-white/70">精炼: +${newItem.refineLevel || 0}</div>
                        <div class="text-xs text-white/70">${newStats}</div>
                        <div class="text-xs text-gold mt-1">⚔ 战力: ${newItemPower}</div>
                    </div>
                </div>
                <p class="text-xs text-green-400 text-center mb-4">
                    <i class="fa fa-check-circle mr-1"></i>
                    新装备战力更高，推荐替换${currentItem ? '' : '装备'}
                </p>
                <div class="flex gap-3">
                    <button id="equip-replace-cancel" class="flex-1 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors">
                        放入背包
                    </button>
                    <button id="equip-replace-confirm" class="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-gold-dark to-gold hover:opacity-80 text-black text-sm font-bold transition-colors">
                        ${currentItem ? '替换装备' : '装备'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector('#equip-replace-cancel').addEventListener('click', () => {
            this.persistentState.player.inventory.push(newItem);
            this.addBattleLog(`${newItem.name} 已放入背包`);
            this.updateUI();
            overlay.remove();
        });

        overlay.querySelector('#equip-replace-confirm').addEventListener('click', () => {
            // 旧装备放入背包
            if (currentItem) {
                this.persistentState.player.inventory.push(currentItem);
            }
            // 卸下旧装备
            this.persistentState.player.equipment[newItem.type] = null;
            // 穿上新装备
            this.equipItem(newItem);
            this.addBattleLog(`${newItem.name}${currentItem ? '替换了 ' + currentItem.name : '已装备'}！`);
            overlay.remove();
        });
    }

    /**
     * 显示潜力装备替换确认弹窗
     */
    showEquipUpgradePrompt(newItem, currentItem) {
        const newItemPower = this.calculateEquipmentCombatPower(newItem);
        const currentItemPower = this.calculateEquipmentCombatPower(currentItem);
        const newItemBase = this.calculateEquipmentCombatPower({ ...newItem, refineLevel: 0 });
        const currentItemBase = this.calculateEquipmentCombatPower({ ...currentItem, refineLevel: 0 });

        const newStats = this.equipmentSystem.getStatsDescription(newItem.stats);
        const curStats = this.equipmentSystem.getStatsDescription(currentItem.stats);
        const newColor = this.equipmentSystem.getEquipmentColorClass(newItem);
        const curColor = this.equipmentSystem.getEquipmentColorClass(currentItem);
        const slotName = this.equipmentSystem.getSlotDisplayName(newItem.type);

        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-[200]';
        overlay.innerHTML = `
            <div class="bg-dark-card border border-gold/40 rounded-xl p-5 max-w-sm w-full mx-4 shadow-2xl">
                <h3 class="text-gold font-bold text-base mb-3 text-center">
                    <i class="fa fa-arrow-up mr-1"></i> 发现潜力更高的${slotName}
                </h3>
                <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="bg-black/40 rounded-lg p-3 border border-red-500/30">
                        <div class="text-xs text-red-400 mb-1">当前装备</div>
                        <div class="text-sm ${curColor} font-bold mb-1">${currentItem.name}</div>
                        <div class="text-xs text-white/70">精炼: +${currentItem.refineLevel || 0}</div>
                        <div class="text-xs text-white/70">${curStats}</div>
                        <div class="text-xs text-gold mt-1">⚔ 战力: ${currentItemPower}</div>
                    </div>
                    <div class="bg-black/40 rounded-lg p-3 border border-green-500/30">
                        <div class="text-xs text-green-400 mb-1">新装备</div>
                        <div class="text-sm ${newColor} font-bold mb-1">${newItem.name}</div>
                        <div class="text-xs text-white/70">精炼: +${newItem.refineLevel || 0}</div>
                        <div class="text-xs text-white/70">${newStats}</div>
                        <div class="text-xs text-gold mt-1">⚔ 战力: ${newItemPower}</div>
                    </div>
                </div>
                <p class="text-xs text-yellow-400 text-center mb-4">
                    <i class="fa fa-info-circle mr-1"></i>
                    新装备基础属性更好，精炼后可超越当前装备
                </p>
                <div class="flex gap-3">
                    <button id="equip-upgrade-cancel" class="flex-1 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors">
                        放入背包
                    </button>
                    <button id="equip-upgrade-confirm" class="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-gold-dark to-gold hover:opacity-80 text-black text-sm font-bold transition-colors">
                        替换装备
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector('#equip-upgrade-cancel').addEventListener('click', () => {
            this.persistentState.player.inventory.push(newItem);
            this.addBattleLog(`${newItem.name} 已放入背包（潜力装备）`);
            this.updateUI();
            overlay.remove();
        });

        overlay.querySelector('#equip-upgrade-confirm').addEventListener('click', () => {
            // 旧装备放入背包
            this.persistentState.player.inventory.push(currentItem);
            // 卸下旧装备
            this.persistentState.player.equipment[newItem.type] = null;
            // 从背包移除新装备并穿上
            const idx = this.persistentState.player.inventory.indexOf(newItem);
            if (idx > -1) this.persistentState.player.inventory.splice(idx, 1);
            this.equipItem(newItem);
            this.addBattleLog(`${newItem.name} 替换了 ${currentItem.name}！`);
            overlay.remove();
        });
    }
    
    // 购买商店物品（v2.0资源系统重构：使用灵石）
    buyShopItem(itemId) {
        const item = this.metadata.shop.items.find(item => item.id === itemId);

        if (!item) {
            this.addBattleLog('无效的商品！');
            return;
        }

        // 检查灵石是否足够
        if ((this.persistentState.resources.spiritStones || 0) < item.price) {
            this.addBattleLog(`灵石不足，无法购买 ${item.name}！`);
            return;
        }

        // 扣除灵石
        this.persistentState.resources.spiritStones = (this.persistentState.resources.spiritStones || 0) - item.price;
        
        if (item.type === 'consumable') {
            // 药水类物品放入背包
            this.persistentState.player.inventory.push(item);
            this.addBattleLog(`购买了 ${item.name}，已放入背包！`);
        } else if (item.type === 'random_equipment') {
            // 随机装备箱：根据玩家境界生成随机白色装备
            const realm = this.persistentState.player.realm;
            const equipmentLevel = realm.currentRealm + 1;

            // 随机选择装备类型
            const types = Object.keys(this.metadata.equipmentSlotConfig || {});
            const randomType = types[Math.floor(Math.random() * types.length)];

            // 使用装备系统生成随机装备
            const equipment = this.equipmentSystem.generateEquipment(
                randomType,
                equipmentLevel,
                item.rarity || 'white'
            );

            // 显示获得装备的弹框
            this.showEquipmentObtainModal(equipment, item.name, (confirmed) => {
                // 检查并提示用户是否装备更好的装备（非战斗场景）
                const equipped = this.checkAndEquipBetterGearWithPrompt(equipment);
                if (!equipped) {
                    this.persistentState.player.inventory.push(equipment);
                    this.addBattleLog(`${equipment.name} 已放入背包！`);
                } else {
                    this.addBattleLog(`${equipment.name}！`);
                }

                // 更新UI
                this.updateUI();

                // 更新血条显示
                if (typeof this.updateHealthBars === 'function') {
                    this.updateHealthBars();
                }
            });
            return; // 提前返回，UI更新在回调中处理
        } else if (item.type === 'equipment') {
            // 固定装备类物品（保留兼容性）
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

            // 检查并提示用户是否装备更好的装备（非战斗场景）
            const equipped = this.checkAndEquipBetterGearWithPrompt(equipment);
            if (!equipped) {
                this.persistentState.player.inventory.push(equipment);
                this.addBattleLog(`购买了 ${item.name}，已放入背包！`);
            } else {
                this.addBattleLog(`购买了 ${item.name}！`);
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
        if (this.persistentState.player) {
            // 移除临时状态属性
            delete this.persistentState.player.baseAttack;
            delete this.persistentState.player.baseDefense;
            delete this.persistentState.player.baseSpeed;
            delete this.persistentState.player.baseLuck;
            delete this.persistentState.player.tempAttack;
            delete this.persistentState.player.tempDefense;
            delete this.persistentState.player.tempSpeed;
            delete this.persistentState.player.tempLuck;
            delete this.persistentState.player.tempAttackExpires;
            delete this.persistentState.player.tempDefenseExpires;
            delete this.persistentState.player.tempSpeedExpires;
            delete this.persistentState.player.tempLuckExpires;
        }
    }

    // 检查临时状态是否过期
    checkTemporaryStats() {
        if (!this.persistentState.player) return;
        
        const now = Date.now();
        
        // 检查攻击药水效果
        if (this.persistentState.player.tempAttackExpires) {
            const attackExpires = this.persistentState.player.tempAttackExpires;
            if (now > attackExpires) {
                // 攻击药水效果已过期
                if (this.persistentState.player.baseAttack) {
                    this.persistentState.player.attack = this.persistentState.player.baseAttack;
                }
                delete this.persistentState.player.baseAttack;
                delete this.persistentState.player.tempAttack;
                delete this.persistentState.player.tempAttackExpires;
            } else {
                // 攻击药水效果仍然有效，重新设置计时器
                const remainingTime = attackExpires - now;
                setTimeout(() => {
                    if (this.persistentState.player && this.persistentState.player.baseAttack) {
                        this.persistentState.player.attack = this.persistentState.player.baseAttack;
                        this.persistentState.player.tempAttack = null;
                        this.persistentState.player.tempAttackExpires = null;
                        this.addBattleLog('攻击药水的效果消失了！');
                        this.updateUI();
                    }
                }, remainingTime);
            }
        }
        
        // 检查防御药水效果
        if (this.persistentState.player.tempDefenseExpires) {
            const defenseExpires = this.persistentState.player.tempDefenseExpires;
            if (now > defenseExpires) {
                // 防御药水效果已过期
                if (this.persistentState.player.baseDefense) {
                    this.persistentState.player.defense = this.persistentState.player.baseDefense;
                }
                delete this.persistentState.player.baseDefense;
                delete this.persistentState.player.tempDefense;
                delete this.persistentState.player.tempDefenseExpires;
            } else {
                // 防御药水效果仍然有效，重新设置计时器
                const remainingTime = defenseExpires - now;
                setTimeout(() => {
                    if (this.persistentState.player && this.persistentState.player.baseDefense) {
                        this.persistentState.player.defense = this.persistentState.player.baseDefense;
                        this.persistentState.player.tempDefense = null;
                        this.persistentState.player.tempDefenseExpires = null;
                        this.addBattleLog('防御药水的效果消失了！');
                        this.updateUI();
                    }
                }, remainingTime);
            }
        }

        // 检查速度药水效果
        if (this.persistentState.player.tempSpeedExpires) {
            const speedExpires = this.persistentState.player.tempSpeedExpires;
            if (now > speedExpires) {
                if (this.persistentState.player.baseSpeed) {
                    this.persistentState.player.speed = this.persistentState.player.baseSpeed;
                }
                delete this.persistentState.player.baseSpeed;
                delete this.persistentState.player.tempSpeed;
                delete this.persistentState.player.tempSpeedExpires;
            } else {
                const remainingTime = speedExpires - now;
                setTimeout(() => {
                    if (this.persistentState.player && this.persistentState.player.baseSpeed) {
                        this.persistentState.player.speed = this.persistentState.player.baseSpeed;
                        this.persistentState.player.tempSpeed = null;
                        this.persistentState.player.tempSpeedExpires = null;
                        this.addBattleLog('速度药水的效果消失了！');
                        this.updateUI();
                    }
                }, remainingTime);
            }
        }

        // 检查幸运药水效果
        if (this.persistentState.player.tempLuckExpires) {
            const luckExpires = this.persistentState.player.tempLuckExpires;
            if (now > luckExpires) {
                if (this.persistentState.player.baseLuck) {
                    this.persistentState.player.luck = this.persistentState.player.baseLuck;
                }
                delete this.persistentState.player.baseLuck;
                delete this.persistentState.player.tempLuck;
                delete this.persistentState.player.tempLuckExpires;
            } else {
                const remainingTime = luckExpires - now;
                setTimeout(() => {
                    if (this.persistentState.player && this.persistentState.player.baseLuck) {
                        this.persistentState.player.luck = this.persistentState.player.baseLuck;
                        this.persistentState.player.tempLuck = null;
                        this.persistentState.player.tempLuckExpires = null;
                        this.addBattleLog('幸运药水的效果消失了！');
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
                const healAmount = Math.floor(this.persistentState.player.maxHp * item.value);
                this.persistentState.player.hp = Math.min(this.persistentState.player.hp + healAmount, this.persistentState.player.maxHp);
                this.addBattleLog(`使用了 ${item.name}，恢复了 ${healAmount} 点生命值！`);
                break;
            case 'energy':
                // 恢复灵力
                this.persistentState.player.energy = this.persistentState.player.maxEnergy;
                this.addBattleLog(`使用了 ${item.name}，灵力恢复满了！`);
                break;
            case 'attack':
                // 临时提升攻击力
                if (!this.persistentState.player.baseAttack) {
                    this.persistentState.player.baseAttack = this.persistentState.player.attack;
                }
                const attackMultiplier = 1 + item.value;
                this.persistentState.player.attack = this.persistentState.player.baseAttack * attackMultiplier;
                this.persistentState.player.tempAttack = this.persistentState.player.attack;
                this.persistentState.player.tempAttackExpires = Date.now() + 30000; // 30秒后过期
                this.addBattleLog(`使用了 ${item.name}，攻击力提升了 ${item.value * 100}%，持续30秒！`);
                // 30秒后效果消失
                setTimeout(() => {
                    if (this.persistentState.player.baseAttack) {
                        this.persistentState.player.attack = this.persistentState.player.baseAttack;
                        this.persistentState.player.tempAttack = null;
                        this.persistentState.player.tempAttackExpires = null;
                    }
                    this.addBattleLog(`${item.name}的效果消失了！`);
                    this.updateUI();
                }, 30000);
                break;
            case 'defense':
                // 临时提升防御力
                if (!this.persistentState.player.baseDefense) {
                    this.persistentState.player.baseDefense = this.persistentState.player.defense;
                }
                const defenseMultiplier = 1 + item.value;
                this.persistentState.player.defense = this.persistentState.player.baseDefense * defenseMultiplier;
                this.persistentState.player.tempDefense = this.persistentState.player.defense;
                this.persistentState.player.tempDefenseExpires = Date.now() + 30000; // 30秒后过期
                this.addBattleLog(`使用了 ${item.name}，防御力提升了 ${item.value * 100}%，持续30秒！`);
                // 30秒后效果消失
                setTimeout(() => {
                    if (this.persistentState.player.baseDefense) {
                        this.persistentState.player.defense = this.persistentState.player.baseDefense;
                        this.persistentState.player.tempDefense = null;
                        this.persistentState.player.tempDefenseExpires = null;
                    }
                    this.addBattleLog(`${item.name}的效果消失了！`);
                    this.updateUI();
                }, 30000);
                break;
            case 'speed':
                // 临时提升速度
                if (!this.persistentState.player.baseSpeed) {
                    this.persistentState.player.baseSpeed = this.persistentState.player.speed;
                }
                const speedMultiplier = 1 + item.value;
                this.persistentState.player.speed = this.persistentState.player.baseSpeed * speedMultiplier;
                this.persistentState.player.tempSpeed = this.persistentState.player.speed;
                this.persistentState.player.tempSpeedExpires = Date.now() + 30000; // 30秒后过期
                this.addBattleLog(`使用了 ${item.name}，速度提升了 ${item.value * 100}%，持续30秒！`);
                // 30秒后效果消失
                setTimeout(() => {
                    if (this.persistentState.player.baseSpeed) {
                        this.persistentState.player.speed = this.persistentState.player.baseSpeed;
                        this.persistentState.player.tempSpeed = null;
                        this.persistentState.player.tempSpeedExpires = null;
                    }
                    this.addBattleLog(`${item.name}的效果消失了！`);
                    this.updateUI();
                }, 30000);
                break;
            case 'luck':
                // 临时提升幸运
                if (!this.persistentState.player.baseLuck) {
                    this.persistentState.player.baseLuck = this.persistentState.player.luck;
                }
                const luckMultiplier = 1 + item.value;
                this.persistentState.player.luck = this.persistentState.player.baseLuck * luckMultiplier;
                this.persistentState.player.tempLuck = this.persistentState.player.luck;
                this.persistentState.player.tempLuckExpires = Date.now() + 30000; // 30秒后过期
                this.addBattleLog(`使用了 ${item.name}，幸运提升了 ${item.value * 100}%，持续30秒！`);
                // 30秒后效果消失
                setTimeout(() => {
                    if (this.persistentState.player.baseLuck) {
                        this.persistentState.player.luck = this.persistentState.player.baseLuck;
                        this.persistentState.player.tempLuck = null;
                        this.persistentState.player.tempLuckExpires = null;
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
        const potions = this.persistentState.player.inventory.filter(
            item => item.type === 'consumable'
        );

        if (potions.length === 0) {
            this.showAlertModal('提示', '背包中没有药水！', 'warning');
            return;
        }

        // 创建选项列表
        const items = potions.map(potion => ({
            name: potion.name,
            description: potion.description || ''
        }));

        // 显示选择模态框
        this.showSelectionModal('选择要使用的药水', '点击选择要使用的药水', items, (index) => {
            const selectedPotion = potions[index];
            // 从背包中移除药水
            const inventoryIndex = this.persistentState.player.inventory.indexOf(selectedPotion);
            if (inventoryIndex > -1) {
                this.persistentState.player.inventory.splice(inventoryIndex, 1);
            }
            // 使用药水
            this.useConsumable(selectedPotion);
            // 更新UI
            this.updateUI();
        });
    }

    // 显示分解确认模态框
    showDisassembleModal(item, inventory, index) {
        const returns = this.equipmentSystem.calculateDisassembleReturns(item);
        const itemName = item.name || '未知装备';
        const stonesAmount = returns.spiritStones || 0;
        const ironAmount = returns.iron || 0;

        const modal = document.getElementById('disassemble-modal');
        const infoDiv = document.getElementById('disassemble-modal-info');
        const confirmBtn = document.getElementById('confirm-disassemble');
        const cancelBtn = document.getElementById('cancel-disassemble');

        // 设置分解信息
        infoDiv.innerHTML = `
            <div class="mb-3">
                <span class="text-light/60">装备：</span>
                <span class="text-white font-medium">${itemName}</span>
            </div>
            <div class="bg-dark/30 rounded p-3 mb-3">
                <p class="text-sm text-light/70 mb-2">分解可获得：</p>
                <div class="flex justify-around">
                    <div class="text-center">
                        <i class="fa fa-gem text-accent mb-1"></i>
                        <p class="text-sm text-light/60">灵石</p>
                        <p class="text-lg font-bold text-success">${stonesAmount}</p>
                    </div>
                    <div class="text-center">
                        <i class="fa fa-gem text-accent mb-1"></i>
                        <p class="text-sm text-light/60">玄铁</p>
                        <p class="text-lg font-bold text-success">${ironAmount}</p>
                    </div>
                </div>
            </div>
        `;

        // 移除旧的事件监听器
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        // 添加新的事件监听器
        newConfirmBtn.addEventListener('click', () => {
            inventory.splice(index, 1);
            this.persistentState.resources.spiritStones = (this.persistentState.resources.spiritStones || 0) + stonesAmount;
            this.persistentState.resources.iron = (this.persistentState.resources.iron || 0) + ironAmount;
            this.addBattleLog(`分解 ${itemName} 获得了 ${stonesAmount} 灵石, ${ironAmount} 玄铁！`);
            this.updateUI();
            this.showInventory();
            modal.classList.add('hidden');
        });

        newCancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // 点击模态框外部关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        };

        // 显示模态框
        modal.classList.remove('hidden');
    }

    // 显示背包
    showInventory() {
        try {
            // ✅ 清理所有旧的tooltip（防止残留）
            document.querySelectorAll('#item-tooltip').forEach(tooltip => tooltip.remove());

            // 确保背包存在
            if (!this.persistentState.player.inventory) {
                this.persistentState.player.inventory = [];
            }

            // 重置分页到第1页（保持当前装备类型筛选）
            this.inventoryPagination.currentPage = 1;

            const inventory = this.persistentState.player.inventory;
            const inventoryModal = document.getElementById('inventory-modal');
            const inventoryEquipment = document.getElementById('inventory-equipment');
            const inventoryConsumables = document.getElementById('inventory-consumables');

            // ✅ 显示背包容量
            this.updateInventoryCapacity();

            // 清空物品列表
            inventoryEquipment.innerHTML = '';
            inventoryConsumables.innerHTML = '';

            // 分类物品
            const equipmentItems = inventory.filter(item => item.type !== 'consumable');
            const consumableItems = inventory.filter(item => item.type === 'consumable');

            if (inventory.length === 0) {
                // 显示空背包消息
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'col-span-full text-center py-16 text-light/70';
                emptyMessage.textContent = '背包是空的！';
                inventoryEquipment.appendChild(emptyMessage);

                // 隐藏分页控件
                const paginationDiv = document.getElementById('inventory-pagination');
                if (paginationDiv) paginationDiv.classList.add('hidden');
            } else {
                // ✅ 渲染装备（支持类型筛选 + 分页）
                this.renderEquipmentWithFilter(equipmentItems);

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

            // ✅ 绑定装备类型子Tab点击事件
            this.bindEquipmentTypeTabs();

            // 绑定Tab切换事件
            document.getElementById('tab-equipment').onclick = () => {
                // 切换到装备Tab
                document.getElementById('tab-equipment').classList.add('bg-gradient-to-r', 'from-primary/20', 'to-accent/10', 'text-primary', 'border-primary/30');
                document.getElementById('tab-equipment').classList.remove('text-light/60');
                document.getElementById('tab-consumables').classList.add('text-light/60');
                document.getElementById('tab-consumables').classList.remove('bg-gradient-to-r', 'from-primary/20', 'to-accent/10', 'text-primary', 'border-primary/30');

                // 显示装备区域，隐藏消耗品区域
                document.getElementById('inventory-equipment').classList.remove('hidden');
                document.getElementById('inventory-consumables').classList.add('hidden');

                // ✅ 显示类型子Tab和分页控件
                const typeTabsDiv = document.getElementById('equipment-type-tabs');
                if (typeTabsDiv) typeTabsDiv.classList.remove('hidden');
                const paginationDiv = document.getElementById('inventory-pagination');
                if (paginationDiv) paginationDiv.classList.remove('hidden');
            };

            document.getElementById('tab-consumables').onclick = () => {
                // 切换到消耗品Tab
                document.getElementById('tab-consumables').classList.add('bg-gradient-to-r', 'from-primary/20', 'to-accent/10', 'text-primary', 'border-primary/30');
                document.getElementById('tab-consumables').classList.remove('text-light/60');
                document.getElementById('tab-equipment').classList.add('text-light/60');
                document.getElementById('tab-equipment').classList.remove('bg-gradient-to-r', 'from-primary/20', 'to-accent/10', 'text-primary', 'border-primary/30');

                // 显示消耗品区域，隐藏装备区域
                document.getElementById('inventory-consumables').classList.remove('hidden');
                document.getElementById('inventory-equipment').classList.add('hidden');

                // ✅ 隐藏类型子Tab和分页控件
                const typeTabsDiv = document.getElementById('equipment-type-tabs');
                if (typeTabsDiv) typeTabsDiv.classList.add('hidden');
                const paginationDiv = document.getElementById('inventory-pagination');
                if (paginationDiv) paginationDiv.classList.add('hidden');
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

            // 绑定一键添加按钮事件
            document.getElementById('auto-add').onclick = () => {
                this.autoAddToCraftSlots();
            };
            
            // 绑定关闭按钮事件
            document.getElementById('close-inventory').addEventListener('click', () => {
                // ✅ 清理所有tooltip
                document.querySelectorAll('#item-tooltip').forEach(tooltip => tooltip.remove());
                inventoryModal.classList.add('hidden');
            });

            // ✅ 绑定分页按钮事件
            document.getElementById('inventory-prev-page')?.addEventListener('click', () => {
                this.inventoryPrevPage();
            });

            document.getElementById('inventory-next-page')?.addEventListener('click', () => {
                this.inventoryNextPage();
            });

            // 点击模态框外部关闭
            inventoryModal.addEventListener('click', (e) => {
                if (e.target === inventoryModal) {
                    // ✅ 清理所有tooltip
                    document.querySelectorAll('#item-tooltip').forEach(tooltip => tooltip.remove());
                    inventoryModal.classList.add('hidden');
                }
            });
        } catch (error) {
            console.error('显示背包失败:', error);
        }
    }

    // ✅ 渲染装备（支持类型筛选 + 分页）
    renderEquipmentWithFilter(equipmentItems) {
        const inventory = this.persistentState.player.inventory;
        const inventoryEquipment = document.getElementById('inventory-equipment');
        const paginationDiv = document.getElementById('inventory-pagination');

        // 清空装备区域
        inventoryEquipment.innerHTML = '';

        if (equipmentItems.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'col-span-full text-center py-16 text-light/70';
            emptyMessage.textContent = '没有装备！';
            inventoryEquipment.appendChild(emptyMessage);
            if (paginationDiv) paginationDiv.classList.add('hidden');
            return;
        }

        // ✅ 按当前类型筛选
        const currentType = this.inventoryPagination.currentEquipmentType;
        let filteredItems = equipmentItems;

        if (currentType !== 'all') {
            filteredItems = equipmentItems.filter(item => {
                const itemType = item.equipmentType || item.type;
                return itemType === currentType;
            });
        }

        if (filteredItems.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'col-span-full text-center py-16 text-light/70';
            const slotConfig = this.equipmentSystem.getSlotConfig(currentType);
            emptyMessage.textContent = `没有${slotConfig?.name || currentType}类装备！`;
            inventoryEquipment.appendChild(emptyMessage);
            if (paginationDiv) paginationDiv.classList.add('hidden');
            return;
        }

        // ✅ 分页
        const itemsPerPage = 40; // 每页显示40个物品
        this.inventoryPagination.totalPages = Math.ceil(filteredItems.length / itemsPerPage);

        // 确保当前页在有效范围内
        if (this.inventoryPagination.currentPage > this.inventoryPagination.totalPages) {
            this.inventoryPagination.currentPage = 1;
        }

        const startIndex = (this.inventoryPagination.currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length);
        const pageItems = filteredItems.slice(startIndex, endIndex);

        // 渲染物品
        pageItems.forEach(item => {
            const originalIndex = inventory.indexOf(item);
            this.createItemElement(item, originalIndex, inventoryEquipment);
        });

        // ✅ 更新分页控件
        this.updateInventoryPagination();
    }

    // ✅ 绑定装备类型子Tab点击事件
    bindEquipmentTypeTabs() {
        const typeTabs = document.querySelectorAll('.equipment-type-tab');
        const inventory = this.persistentState.player.inventory;
        const equipmentItems = inventory.filter(item => item.type !== 'consumable');

        typeTabs.forEach(tab => {
            tab.onclick = () => {
                // 更新选中状态
                typeTabs.forEach(t => {
                    t.classList.remove('bg-primary/20', 'text-primary', 'border-primary/30');
                    t.classList.add('text-light/50');
                });
                tab.classList.add('bg-primary/20', 'text-primary', 'border-primary/30');
                tab.classList.remove('text-light/50');

                // 更新当前类型
                const selectedType = tab.dataset.type;
                this.inventoryPagination.currentEquipmentType = selectedType;
                this.inventoryPagination.currentPage = 1;

                // 重新渲染装备
                this.renderEquipmentWithFilter(equipmentItems);
            };
        });

        // ✅ 恢复当前选中的Tab状态
        const currentType = this.inventoryPagination.currentEquipmentType;
        const activeTab = document.querySelector(`.equipment-type-tab[data-type="${currentType}"]`);
        if (activeTab) {
            typeTabs.forEach(t => {
                t.classList.remove('bg-primary/20', 'text-primary', 'border-primary/30');
                t.classList.add('text-light/50');
            });
            activeTab.classList.add('bg-primary/20', 'text-primary', 'border-primary/30');
            activeTab.classList.remove('text-light/50');
        }
    }

    // 创建物品元素
    createItemElement(item, index, container) {
        const itemElement = document.createElement('div');
        itemElement.className = 'bg-dark/30 rounded p-0.5 hover:bg-dark/40 transition-colors border border-dark/50 shadow-sm cursor-pointer aspect-square flex flex-col items-center justify-center';
        itemElement.dataset.index = index;

        // 物品品质颜色
        const rarityColor = item.type === 'consumable' ? 'text-white' : this.equipmentSystem.getEquipmentColorClass(item);

        // 消耗品显示图片
        if (item.type === 'consumable') {
            // 根据药水类型获取图片
            const potionImages = {
                'health_potion': 'Images/health-potion.jpg',
                'energy_potion': 'Images/energy-potion.jpg',
                'attack_potion': 'Images/attack-potion.jpg',
                'defense_potion': 'Images/defense-potion.jpg',
                'speed_potion': 'Images/speed-potion.jpg',
                'luck_potion': 'Images/lucky-potion.jpg'
            };
            const imagePath = potionImages[item.id] || 'Images/potion-default.jpg';

            itemElement.innerHTML = `
                <img src="${imagePath}" alt="${item.name}" class="w-full h-full object-cover rounded">
            `;
        } else {
            // 装备显示图标（从统一配置获取）
            const itemIcon = this.equipmentSystem.getEquipmentIcon(item.type);

            itemElement.innerHTML = `
                <div class="text-xs ${rarityColor} mb-0.5">
                    <i class="fa ${itemIcon}"></i>
                </div>
                <div class="text-[8px] text-center ${rarityColor} truncate w-full">
                    ${item.name}
                </div>
            `;
        }

        // 绑定鼠标悬停事件
        itemElement.addEventListener('mouseenter', (e) => {
            // ✅ 清理旧的tooltip（防止多个tooltip同时存在）
            document.querySelectorAll('#item-tooltip').forEach(tooltip => tooltip.remove());

            // 创建提示框
            const tooltip = document.createElement('div');
            tooltip.className = 'absolute z-50 bg-dark/90 border border-accent/50 rounded p-2 text-xs text-white shadow-lg';
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
            tooltip.style.pointerEvents = 'none';
            tooltip.id = 'item-tooltip';

            // 生成物品信息
            let info = `<div class="font-bold mb-1 ${rarityColor}">${item.name}</div>`;
            if (item.type === 'consumable') {
                info += `<div class="text-light/70">类型: 消耗品</div>`;
                info += `<div class="text-light/60 mt-1">${item.description || '无描述'}</div>`;
            } else {
                info += `<div class="text-light/70">类型: 装备 (${this.equipmentSystem.getSlotDisplayName(item.type)})</div>`;
                info += `<div class="text-light/70">等级: ${item.realmName || item.level || 1}</div>`;
                if (item.stats) {
                    info += `<div class="text-light/60 mt-1">${this.equipmentSystem.getStatsDescription(item.stats)}</div>`;
                }
                info += `<div class="text-light/70 mt-1">品质: <span class="${rarityColor}">${item.rarityDisplayName || '白色'}</span></div>`;
                if (item.refineLevel && item.refineLevel > 0) {
                    info += `<div class="text-light/70">精炼: +${item.refineLevel}</div>`;
                }
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
            
            const inventory = this.persistentState.player.inventory;
            
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
                    const equippedItem = this.persistentState.player.equipment[item.type];
                    inventory.splice(index, 1);
                    this.equipItem(item);
                    this.updateUI();
                    this.showInventory();
                    contextMenu.classList.add('hidden');
                };
                
                document.getElementById('context-disassemble').onclick = () => {
                    // 分解 - 使用自定义模态框
                    contextMenu.classList.add('hidden');
                    this.showDisassembleModal(item, inventory, index);
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

    /**
     * 检查背包是否已满
     * @returns {boolean} - true表示背包已满
     */
    isInventoryFull() {
        if (!this.persistentState.player.inventory) {
            this.persistentState.player.inventory = [];
        }
        const maxSize = SIZES.MAX_INVENTORY_SIZE || 50;
        return this.persistentState.player.inventory.length >= maxSize;
    }

    /**
     * 统一添加物品到背包（带容量检查）
     * @param {Object} item - 要添加的物品
     * @returns {boolean} - true表示添加成功，false表示背包已满
     */
    addToInventory(item) {
        if (!this.persistentState.player.inventory) {
            this.persistentState.player.inventory = [];
        }

        // 检查背包是否已满
        if (this.isInventoryFull()) {
            this.addBattleLog('⚠️ 背包已满！无法添加更多物品！');
            return false;
        }

        // 添加物品
        this.persistentState.player.inventory.push(item);
        return true;
    }

    /**
     * 获取背包容量信息
     * @returns {Object} - {current: 当前数量, max: 最大容量, percent: 使用百分比}
     */
    getInventoryCapacity() {
        if (!this.persistentState.player.inventory) {
            this.persistentState.player.inventory = [];
        }
        const current = this.persistentState.player.inventory.length;
        const max = SIZES.MAX_INVENTORY_SIZE || 50;
        const percent = Math.floor((current / max) * 100);
        return { current, max, percent };
    }

    /**
     * 更新背包容量显示
     */
    updateInventoryCapacity() {
        const capacity = this.getInventoryCapacity();
        const capacityElement = document.getElementById('inventory-capacity');

        if (capacityElement) {
            // 根据容量使用情况显示不同颜色
            let colorClass = 'text-green-400';
            if (capacity.percent >= 90) {
                colorClass = 'text-red-400';
            } else if (capacity.percent >= 70) {
                colorClass = 'text-yellow-400';
            }

            capacityElement.innerHTML = `
                <span class="${colorClass}">${capacity.current}</span>
                <span class="text-light/50">/</span>
                <span class="text-light/70">${capacity.max}</span>
            `;
        }
    }

    /**
     * 更新背包分页控件
     */
    updateInventoryPagination() {
        const paginationDiv = document.getElementById('inventory-pagination');
        const pageInfo = document.getElementById('inventory-page-info');
        const prevBtn = document.getElementById('inventory-prev-page');
        const nextBtn = document.getElementById('inventory-next-page');

        if (!paginationDiv) return;

        // 显示分页控件
        paginationDiv.classList.remove('hidden');

        // 更新页码信息
        if (pageInfo) {
            pageInfo.textContent = `第 ${this.inventoryPagination.currentPage} 页 / 共 ${this.inventoryPagination.totalPages} 页`;
        }

        // 更新按钮状态
        if (prevBtn) {
            prevBtn.disabled = this.inventoryPagination.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.inventoryPagination.currentPage >= this.inventoryPagination.totalPages;
        }
    }

    /**
     * 背包上一页
     */
    inventoryPrevPage() {
        if (this.inventoryPagination.currentPage > 1) {
            this.inventoryPagination.currentPage--;
            // ✅ 只重新渲染装备，不重置分页
            const inventory = this.persistentState.player.inventory;
            const equipmentItems = inventory.filter(item => item.type !== 'consumable');
            this.renderEquipmentWithFilter(equipmentItems);
        }
    }

    /**
     * 背包下一页
     */
    inventoryNextPage() {
        if (this.inventoryPagination.currentPage < this.inventoryPagination.totalPages) {
            this.inventoryPagination.currentPage++;
            // ✅ 只重新渲染装备，不重置分页
            const inventory = this.persistentState.player.inventory;
            const equipmentItems = inventory.filter(item => item.type !== 'consumable');
            this.renderEquipmentWithFilter(equipmentItems);
        }
    }

    // ==================== 资源副本系统 ====================

    /**
     * 显示副本列表界面
     */
    showDungeonList() {
        const container = document.getElementById('dungeon-list-container');
        if (!container) return;

        container.classList.remove('hidden');
        this.renderDungeonList();
    }

    /**
     * 渲染副本列表
     */
    renderDungeonList() {
        const dungeons = this.metadata.resourceDungeons;
        if (!dungeons) return;

        const container = document.getElementById('dungeon-cards');
        if (!container) return;

        container.innerHTML = '';

        Object.keys(dungeons).forEach(dungeonId => {
            const dungeon = dungeons[dungeonId];
            const card = this.createDungeonCard(dungeonId, dungeon);
            container.appendChild(card);
        });
    }

    /**
     * 创建副本卡片
     */
    createDungeonCard(dungeonId, dungeon) {
        const card = document.createElement('div');
        card.className = 'dungeon-card bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700';

        const iconMap = {
            spirit_stone_mine: 'fa-gem',
            herb_garden: 'fa-leaf',
            iron_mine: 'fa-gem',
            exp_dungeon: 'fa-brain'
        };

        const colorMap = {
            spirit_stone_mine: 'text-blue-400',
            herb_garden: 'text-green-400',
            iron_mine: 'text-orange-400',
            exp_dungeon: 'text-purple-400'
        };

        card.innerHTML = `
            <div class="dungeon-header mb-4">
                <div class="flex items-center gap-3">
                    <i class="fa ${iconMap[dungeonId]} ${colorMap[dungeonId]} text-3xl"></i>
                    <div>
                        <h3 class="text-xl font-bold text-white">${dungeon.name}</h3>
                        <p class="text-sm text-gray-400">${dungeon.description}</p>
                    </div>
                </div>
            </div>

            <div class="difficulty-buttons space-y-2">
                ${this.createDifficultyButtons(dungeonId, dungeon)}
            </div>

            <div class="dungeon-info mt-4 text-xs text-gray-400">
                <p>VIP特权: VIP1可扫荡</p>
            </div>
        `;

        return card;
    }

    /**
     * 创建难度按钮
     */
    createDifficultyButtons(dungeonId, dungeon) {
        const difficulties = ['easy', 'medium', 'hard'];
        const difficultyNames = { easy: '简单', medium: '普通', hard: '困难' };
        const difficultyColors = {
            easy: 'from-green-600 to-green-500',
            medium: 'from-yellow-600 to-yellow-500',
            hard: 'from-red-600 to-red-500'
        };

        const vipLevel = this.persistentState.vip?.level || 0;
        const canSweep = vipLevel >= 1;

        let html = '';

        difficulties.forEach(diff => {
            const config = dungeon.difficulties[diff];
            const currentAttempts = this.dungeon.getCurrentAttempts(dungeonId, diff);
            const maxAttempts = this.dungeon.getMaxAttempts(vipLevel);
            const hasRemaining = currentAttempts < maxAttempts;
            const isLocked = this.persistentState.player.level < config.level_req;
            const hasCleared = this.hasClearedDungeon(dungeonId, diff);

            html += `
                <div class="difficulty-row flex gap-2">
                    <button class="flex-1 dungeon-btn bg-gradient-to-r ${difficultyColors[diff]} text-white py-2 px-4 rounded-lg font-bold
                        ${isLocked || !hasRemaining ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}"
                        data-dungeon="${dungeonId}"
                        data-difficulty="${diff}"
                        ${isLocked || !hasRemaining ? 'disabled' : ''}>
                        <div class="flex justify-between items-center">
                            <span>${difficultyNames[diff]}</span>
                            <span class="text-xs">${currentAttempts}/${maxAttempts}</span>
                        </div>
                        ${isLocked ? `<div class="text-xs">Lv.${config.level_req}解锁</div>` : ''}
                    </button>
                    ${canSweep && hasCleared ? `
                        <button class="sweep-btn bg-gradient-to-r from-purple-600 to-purple-500 text-white py-2 px-4 rounded-lg font-bold
                            ${!hasRemaining ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}"
                            data-dungeon="${dungeonId}"
                            data-difficulty="${diff}"
                            ${!hasRemaining ? 'disabled' : ''}>
                            一键扫荡
                        </button>
                    ` : ''}
                </div>
            `;
        });

        return html;
    }

    /**
     * 检查是否已通关
     */
    hasClearedDungeon(dungeonId, difficulty) {
        const playerData = this.persistentState.player.resourceDungeons;
        return playerData && playerData[dungeonId] && playerData[dungeonId].cleared[difficulty];
    }

    /**
     * 显示副本通关界面
     */
    showDungeonComplete(reward) {
        const container = document.getElementById('dungeon-complete-container');
        if (!container) return;

        container.classList.remove('hidden');

        // 渲染奖励
        const rewardDiv = document.getElementById('dungeon-reward');
        if (rewardDiv) {
            let rewardHtml = '<h3 class="text-2xl font-bold text-yellow-400 mb-4">副本通关！</h3>';
            rewardHtml += '<div class="space-y-2">';

            if (reward.spirit_stones) {
                rewardHtml += `<div class="flex items-center gap-2 text-blue-400">
                    <i class="fa fa-gem"></i>
                    <span>灵石 +${reward.spirit_stones.toLocaleString()}</span>
                </div>`;
            }

            if (reward.herbs) {
                rewardHtml += `<div class="flex items-center gap-2 text-green-400">
                    <i class="fa fa-leaf"></i>
                    <span>灵草 +${reward.herbs}</span>
                </div>`;
            }

            if (reward.iron) {
                rewardHtml += `<div class="flex items-center gap-2 text-orange-400">
                    <i class="fa fa-gem"></i>
                    <span>玄铁 +${reward.iron}</span>
                </div>`;
            }

            if (reward.exp) {
                rewardHtml += `<div class="flex items-center gap-2 text-purple-400">
                    <i class="fa fa-star"></i>
                    <span>经验 +${reward.exp.toLocaleString()}</span>
                </div>`;
            }

            rewardHtml += '</div>';
            rewardDiv.innerHTML = rewardHtml;
        }
    }

    /**
     * 关闭副本通关界面
     */
    closeDungeonComplete() {
        const container = document.getElementById('dungeon-complete-container');
        if (container) {
            container.classList.add('hidden');
        }
        this.showDungeonList();
    }
};

// 检查Babylon.js是否加载完成
function checkBabylonJsLoaded() {
    if (typeof BABYLON !== 'undefined') {
        window.game = new EndlessCultivationGame();
    } else {
        setTimeout(checkBabylonJsLoaded, 100);
    }
}

// 初始化游戏
window.onload = function() {
    checkBabylonJsLoaded();
};
