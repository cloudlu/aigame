// 游戏核心数据结构和状态管理
class EndlessWinterGame {
    constructor() {
        // 游戏状态
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
                    nameSuffixes: ["剑", "长刀", "战斧", "长矛", "匕首", "大剑"]
                },
                {
                    type: "armor",
                    baseStats: { defense: 3 },
                    namePrefixes: ["", "轻便的", "坚固的", "魔法的", "神圣的", "传奇的"],
                    nameSuffixes: ["护甲", "胸甲", "锁甲", "板甲", "皮甲", "鳞甲"]
                },
                {
                    type: "helmet",
                    baseStats: { defense: 2, hp: 10 },
                    namePrefixes: ["", "轻便的", "坚固的", "魔法的", "神圣的", "传奇的"],
                    nameSuffixes: ["头盔", "头冠", "兜帽", "面具", "头盔", "战盔"]
                },
                {
                    type: "boots",
                    baseStats: { defense: 1, luck: 1 },
                    namePrefixes: ["", "轻便的", "坚固的", "魔法的", "神圣的", "传奇的"],
                    nameSuffixes: ["靴子", "战靴", "皮靴", "钢靴", "魔靴", "神靴"]
                },
                {
                    type: "accessory",
                    baseStats: { luck: 2, hp: 5 },
                    namePrefixes: ["", "简单的", "精致的", "魔法的", "神圣的", "传奇的"],
                    nameSuffixes: ["戒指", "项链", "护符", "徽章"]
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
                },
                {
                    name: "妖狐",
                    baseHp: 40,
                    baseAttack: 10,
                    baseDefense: 3,
                    expMultiplier: 1.2,
                    resourceMultiplier: 1.1,
                    icon: "fa-cat",
                    image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20fox%20spirit%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
                },
                {
                    name: "山精",
                    baseHp: 80,
                    baseAttack: 15,
                    baseDefense: 5,
                    expMultiplier: 1.8,
                    resourceMultiplier: 1.3,
                    icon: "fa-tree",
                    image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20mountain%20spirit%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
                },
                {
                    name: "水怪",
                    baseHp: 70,
                    baseAttack: 14,
                    baseDefense: 4,
                    expMultiplier: 1.6,
                    resourceMultiplier: 1.25,
                    icon: "fa-tint",
                    image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20water%20monster%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
                },
                {
                    name: "火灵",
                    baseHp: 50,
                    baseAttack: 20,
                    baseDefense: 2,
                    expMultiplier: 1.4,
                    resourceMultiplier: 1.15,
                    icon: "fa-fire",
                    image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20fire%20spirit%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
                },
                {
                    name: "土妖",
                    baseHp: 120,
                    baseAttack: 16,
                    baseDefense: 8,
                    expMultiplier: 2.2,
                    resourceMultiplier: 1.6,
                    icon: "fa-mountain",
                    image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20earth%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
                },
                {
                    name: "风魔",
                    baseHp: 60,
                    baseAttack: 18,
                    baseDefense: 3,
                    expMultiplier: 1.7,
                    resourceMultiplier: 1.3,
                    icon: "fa-wind",
                    image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20wind%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
                },
                {
                    name: "雷兽",
                    baseHp: 90,
                    baseAttack: 22,
                    baseDefense: 4,
                    expMultiplier: 2.0,
                    resourceMultiplier: 1.4,
                    icon: "fa-bolt",
                    image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20thunder%20beast%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
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
                        level: 1,
                        refineLevel: 0
                    },
                    {
                        id: "basic_armor",
                        name: "基础护甲",
                        description: "基础防御力+8",
                        price: 80,
                        type: "equipment",
                        equipmentType: "armor",
                        stats: { defense: 8 },
                        level: 1,
                        refineLevel: 0
                    },
                    {
                        id: "basic_helmet",
                        name: "基础头盔",
                        description: "基础防御力+5，生命值+20",
                        price: 60,
                        type: "equipment",
                        equipmentType: "helmet",
                        stats: { defense: 5, hp: 20 },
                        level: 1,
                        refineLevel: 0
                    },
                    {
                        id: "basic_boots",
                        name: "基础靴子",
                        description: "基础防御力+3，幸运值+2",
                        price: 40,
                        type: "equipment",
                        equipmentType: "boots",
                        stats: { defense: 3, luck: 2 },
                        level: 1,
                        refineLevel: 0
                    }
                ]
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
        
        // 检查保存的登录状态
        this.checkSavedLogin();
        this.generateMapBackgrounds();
        this.preloadImages();
        this.generateMiniMap();
        this.updateMapBackgroundUI(); // 设置初始地图背景
        this.updateCharacterBodyImage();
        this.updateUI();
        this.startResourceGeneration();
        this.bindEvents();
        
        // 确保所有装备都有refineLevel属性
        for (const slot in this.gameState.player.equipment) {
            const item = this.gameState.player.equipment[slot];
            if (item && item.refineLevel === undefined) {
                item.refineLevel = 0;
            }
        }
        
        // 隐藏敌人信息区
        this.hideEnemyInfo();
        
        // 加载纹理
        this.loadTextures();
        
        // 初始化3D战斗场景
        this.initBattle3DScene();
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
        console.log('开始加载纹理...');
        
        // 存储纹理
        this.textures = {};
        
        // 创建纹理加载器
        this.textureLoader = new THREE.TextureLoader();
        
        // 添加时间戳避免缓存
        const timestamp = new Date().getTime();
        
        // 加载地面纹理 - 使用URL形式
        const groundUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20ground%20texture%2C%20ancient%20chinese%20landscape%2C%20high%20quality%20texture%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`;
        console.log('加载地面纹理:', groundUrl);
        this.textureLoader.load(
            groundUrl,
            (texture) => {
                this.textures.ground = texture;
                this.textures.ground.wrapS = THREE.RepeatWrapping;
                this.textures.ground.wrapT = THREE.RepeatWrapping;
                this.textures.ground.repeat.set(5, 5);
                console.log('地面纹理加载完成');
            },
            (xhr) => {
                console.log('地面纹理加载进度:', (xhr.loaded / xhr.total * 100) + '%');
            },
            (error) => {
                console.log('地面纹理加载失败:', error);
                // 加载失败时不创建空纹理，让后续代码使用默认颜色
                this.textures.ground = null;
            }
        );
        
        // 加载天空纹理 - 使用URL形式
        const skyUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20sky%20texture%2C%20ancient%20chinese%20sky%2C%20clouds%2C%20high%20quality%20texture%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`;
        console.log('加载天空纹理:', skyUrl);
        this.textureLoader.load(
            skyUrl,
            (texture) => {
                this.textures.sky = texture;
                console.log('天空纹理加载完成');
            },
            (xhr) => {
                console.log('天空纹理加载进度:', (xhr.loaded / xhr.total * 100) + '%');
            },
            (error) => {
                console.log('天空纹理加载失败:', error);
                // 加载失败时不创建空纹理，让后续代码使用默认颜色
                this.textures.sky = null;
            }
        );
        
        // 加载人物纹理 - 使用URL形式
        const characterUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20character%20texture%2C%20ancient%20chinese%20warrior%2C%20high%20quality%20texture%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`;
        console.log('加载人物纹理:', characterUrl);
        this.textureLoader.load(
            characterUrl,
            (texture) => {
                this.textures.character = texture;
                console.log('人物纹理加载完成');
            },
            (xhr) => {
                console.log('人物纹理加载进度:', (xhr.loaded / xhr.total * 100) + '%');
            },
            (error) => {
                console.log('人物纹理加载失败:', error);
                // 加载失败时不创建空纹理，让后续代码使用默认颜色
                this.textures.character = null;
            }
        );
        
        // 加载敌人纹理 - 使用URL形式
        const enemyUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20fantasy%20beast%20texture%2C%20ancient%20chinese%20mythical%20creature%2C%20high%20quality%20texture%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`;
        console.log('加载敌人纹理:', enemyUrl);
        this.textureLoader.load(
            enemyUrl,
            (texture) => {
                this.textures.enemy = texture;
                console.log('敌人纹理加载完成');
            },
            (xhr) => {
                console.log('敌人纹理加载进度:', (xhr.loaded / xhr.total * 100) + '%');
            },
            (error) => {
                console.log('敌人纹理加载失败:', error);
                // 加载失败时不创建空纹理，让后续代码使用默认颜色
                this.textures.enemy = null;
            }
        );
        
        console.log('纹理加载完成');
    }
    
    // 生成3D地图背景配置
    generateMapBackgrounds() {
        // 添加时间戳避免缓存
        const timestamp = new Date().getTime();
        
        // 生成10个不同的仙侠风格3D地图背景配置
        this.gameState.mapBackgrounds = [
            {
                type: "xianxia-mountain",
                name: "仙侠山峰",
                skyColor: 0x87ceeb,
                groundColor: 0x8b4513,
                fogColor: 0x87ceeb,
                fogNear: 10,
                fogFar: 50,
                features: ["mountains", "clouds", "ancient temples"],
                imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20mountain%20landscape%2C%20ancient%20chinese%20mountains%2C%20high%20quality%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`
            },
            {
                type: "xianxia-forest",
                name: "仙侠森林",
                skyColor: 0x4d88ff,
                groundColor: 0x228b22,
                fogColor: 0x4d88ff,
                fogNear: 10,
                fogFar: 50,
                features: ["ancient trees", "magical creatures", "spirit stones"],
                imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20forest%2C%20ancient%20chinese%20forest%2C%20high%20quality%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`
            },
            {
                type: "xianxia-lake",
                name: "仙侠湖泊",
                skyColor: 0x0066cc,
                groundColor: 0x0099ff,
                fogColor: 0x0066cc,
                fogNear: 10,
                fogFar: 50,
                features: ["crystal clear water", "lotus flowers", "water spirits"],
                imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20lake%2C%20ancient%20chinese%20lake%2C%20lotus%20flowers%2C%20high%20quality%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`
            },
            {
                type: "xianxia-desert",
                name: "仙侠沙漠",
                skyColor: 0xffcc66,
                groundColor: 0xffcc66,
                fogColor: 0xffcc66,
                fogNear: 10,
                fogFar: 50,
                features: ["ancient ruins", "sand dunes", "mirages"],
                imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20desert%2C%20ancient%20chinese%20desert%2C%20ancient%20ruins%2C%20high%20quality%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`
            },
            {
                type: "xianxia-cave",
                name: "仙侠洞穴",
                skyColor: 0x333333,
                groundColor: 0x666666,
                fogColor: 0x333333,
                fogNear: 5,
                fogFar: 20,
                features: ["spirit crystals", "ancient inscriptions", "magical beasts"],
                imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20cave%2C%20ancient%20chinese%20cave%2C%20spirit%20crystals%2C%20high%20quality%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`
            },
            {
                type: "xianxia-heaven",
                name: "仙侠仙境",
                skyColor: 0x87ceeb,
                groundColor: 0xffffff,
                fogColor: 0x87ceeb,
                fogNear: 10,
                fogFar: 50,
                features: ["floating islands", "celestial palaces", "divine beasts"],
                imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20heaven%2C%20floating%20islands%2C%20celestial%20palaces%2C%20high%20quality%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`
            },
            {
                type: "xianxia-volcano",
                name: "仙侠火山",
                skyColor: 0xff6633,
                groundColor: 0x8b4513,
                fogColor: 0xff6633,
                fogNear: 10,
                fogFar: 50,
                features: ["magical lava", "fire spirits", "ancient fire temples"],
                imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20volcano%2C%20magical%20lava%2C%20fire%20spirits%2C%20high%20quality%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`
            },
            {
                type: "xianxia-beach",
                name: "仙侠海滩",
                skyColor: 0x87ceeb,
                groundColor: 0xffffcc,
                fogColor: 0x87ceeb,
                fogNear: 10,
                fogFar: 50,
                features: ["golden sand", "magical pearls", "sea spirits"],
                imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20beach%2C%20golden%20sand%2C%20magical%20pearls%2C%20high%20quality%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`
            },
            {
                type: "xianxia-plains",
                name: "仙侠平原",
                skyColor: 0x87ceeb,
                groundColor: 0x90ee90,
                fogColor: 0x87ceeb,
                fogNear: 10,
                fogFar: 50,
                features: ["ancient battlefields", "spirit herbs", "wandering cultivators"],
                imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20plains%2C%20ancient%20battlefields%2C%20spirit%20herbs%2C%20high%20quality%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`
            },
            {
                type: "xianxia-canyon",
                name: "仙侠峡谷",
                skyColor: 0x87ceeb,
                groundColor: 0x8b4513,
                fogColor: 0x87ceeb,
                fogNear: 10,
                fogFar: 50,
                features: ["deep gorges", "ancient bridges", "wind spirits"],
                imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20style%20xianxia%20canyon%2C%20deep%20gorges%2C%20ancient%20bridges%2C%20high%20quality%2C%20ink%20painting%20style&image_size=square&t=${timestamp}`
            }
        ];
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
                    // 更新天空颜色
                    this.battle3D.renderer.setClearColor(currentBackground.skyColor, 1);
                    
                    // 更新地面颜色
                    const ground = this.battle3D.scene.children.find(child => child.type === 'Mesh' && child.geometry instanceof THREE.PlaneGeometry);
                    if (ground) {
                        ground.material.color.setHex(currentBackground.groundColor);
                    }
                    
                    // 更新雾效
                    if (this.battle3D.scene.fog) {
                        this.battle3D.scene.fog.color.setHex(currentBackground.fogColor);
                        this.battle3D.scene.fog.near = currentBackground.fogNear;
                        this.battle3D.scene.fog.far = currentBackground.fogFar;
                    } else {
                        this.battle3D.scene.fog = new THREE.Fog(currentBackground.fogColor, currentBackground.fogNear, currentBackground.fogFar);
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
    
    // 生成小地图
    generateMiniMap() {
        const mapGrid = document.getElementById('map-grid');
        mapGrid.innerHTML = '';
        
        // 清空场景怪物数据
        this.gameState.sceneMonsters = [];
        
        // 生成5x5的地图格子
        const totalCells = 25;
        const playerCell = 12; // 玩家初始位置
        const availableCells = totalCells - 1; // 减去玩家位置
        
        // 计算敌人数量和类型
        const totalEnemies = Math.max(10, Math.floor(availableCells * 0.8)); // 至少10个敌人，最多80%的格子
        const bossCount = Math.ceil(totalEnemies * 0.1); // 10% BOSS
        const eliteCount = Math.ceil(totalEnemies * 0.3); // 30% 精英
        const normalCount = totalEnemies - bossCount - eliteCount; // 剩下的普通怪
        
        console.log(`生成敌人: 总数=${totalEnemies}, BOSS=${bossCount}, 精英=${eliteCount}, 普通=${normalCount}`);
        
        // 创建敌人分布
        const enemyDistribution = [];
        
        // 添加BOSS
        for (let i = 0; i < bossCount; i++) {
            enemyDistribution.push('boss');
        }
        
        // 添加精英
        for (let i = 0; i < eliteCount; i++) {
            enemyDistribution.push('elite');
        }
        
        // 添加普通怪
        for (let i = 0; i < normalCount; i++) {
            enemyDistribution.push('normal');
        }
        
        // 随机打乱敌人分布
        for (let i = enemyDistribution.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [enemyDistribution[i], enemyDistribution[j]] = [enemyDistribution[j], enemyDistribution[i]];
        }
        
        let enemyIndex = 0;
        
        for (let i = 0; i < 25; i++) {
            const gridCell = document.createElement('div');
            gridCell.className = 'bg-dark/30 rounded flex items-center justify-center';
            gridCell.dataset.cellIndex = i;
            
            // 计算格子在3D空间中的位置
            const row = Math.floor(i / 5);
            const col = i % 5;
            const x = (col - 2) * 4; // 每个格子4单位宽度
            const z = (row - 2) * 4; // 每个格子4单位高度
            
            // 在非玩家位置生成敌人
            if (i !== playerCell && enemyIndex < enemyDistribution.length) {
                // 生成随机敌人等级（与玩家等级相近）
                const playerLevel = this.gameState.player.level;
                const enemyLevel = Math.max(1, Math.min(playerLevel + 3, playerLevel + Math.floor(Math.random() * 3) - 1));
                
                // 生成随机敌人属性
                const baseAttack = enemyLevel * 8;
                const baseDefense = enemyLevel * 2;
                const baseHp = enemyLevel * 30;
                
                // 根据分布生成敌人类型
                const enemyType = enemyDistribution[enemyIndex];
                let isElite = false;
                let isBoss = false;
                let bonus = 0;
                
                if (enemyType === 'boss') {
                    // BOSS
                    isBoss = true;
                    bonus = 1.0;
                } else if (enemyType === 'elite') {
                    // 精英怪
                    isElite = true;
                    bonus = 0.5;
                }
                
                enemyIndex++;
                
                // 计算最终属性
                const finalAttack = Math.floor(baseAttack * (1 + bonus));
                const finalDefense = Math.floor(baseDefense * (1 + bonus));
                const finalHp = Math.floor(baseHp * (1 + bonus));
                
                // 评估敌人强弱
                const playerAttack = this.gameState.player.attack + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.attack : 0);
                const playerDefense = this.gameState.player.defense + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.defense : 0);
                const playerHp = this.gameState.player.maxHp + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.hp : 0);
                
                // 计算敌人和玩家的战斗力
                const enemyPower = finalAttack * 2 + finalDefense * 1.5 + finalHp * 0.1;
                const playerPower = playerAttack * 2 + playerDefense * 1.5 + playerHp * 0.1;
                
                // 根据战斗力对比确定敌人颜色
                let enemyColorClass = '';
                let enemyTextColorClass = '';
                
                if (isBoss) {
                    // BOSS始终显示紫色
                    enemyColorClass = 'bg-purple-500/70 hover:bg-purple-500/90';
                    enemyTextColorClass = 'text-white';
                } else if (isElite) {
                    // 精英怪始终显示黄色
                    enemyColorClass = 'bg-yellow-500/70 hover:bg-yellow-500/90';
                    enemyTextColorClass = 'text-white';
                } else {
                    // 普通怪根据强弱显示不同颜色
                    const powerRatio = enemyPower / playerPower;
                    if (powerRatio < 0.7) {
                        // 比玩家弱
                        enemyColorClass = 'bg-green-500/70 hover:bg-green-500/90';
                        enemyTextColorClass = 'text-white';
                    } else if (powerRatio < 1.3) {
                        // 和玩家差不多
                        enemyColorClass = 'bg-yellow-500/70 hover:bg-yellow-500/90';
                        enemyTextColorClass = 'text-white';
                    } else {
                        // 比玩家厉害
                        enemyColorClass = 'bg-red-500/70 hover:bg-red-500/90';
                        enemyTextColorClass = 'text-white';
                    }
                }
                
                // 根据当前地图背景选择敌人类型
                let enemyTypes = [];
                const currentBackground = this.gameState.mapBackgrounds[this.gameState.currentBackgroundIndex];
                
                if (currentBackground) {
                    switch (currentBackground.type) {
                        case 'xianxia-mountain':
                            enemyTypes = ['山妖', '岩怪', '神雕', '石精', '山魈'];
                            break;
                        case 'xianxia-forest':
                            enemyTypes = ['树精', '花妖', '狐仙', '鹿灵', '木怪'];
                            break;
                        case 'xianxia-lake':
                            enemyTypes = ['水怪', '蛟蛇', '龟妖', '鱼精', '水仙'];
                            break;
                        case 'xianxia-desert':
                            enemyTypes = ['沙妖', '蝎精', '蛇怪', '沙漠巨蜥', '沙虫'];
                            break;
                        case 'xianxia-cave':
                            enemyTypes = ['洞穴蝙蝠', '石怪', '蜘蛛精', '蚯蚓怪', '洞穴幽灵'];
                            break;
                        default:
                            enemyTypes = ['妖狐', '山精', '水怪', '火灵', '土妖', '风魔', '雷兽'];
                    }
                } else {
                    enemyTypes = ['妖狐', '山精', '水怪', '火灵', '土妖', '风魔', '雷兽'];
                }
                
                const enemyTypeName = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                
                // 创建敌人信息
                const enemyInfo = {
                    level: enemyLevel,
                    hp: finalHp,
                    maxHp: finalHp,
                    attack: finalAttack,
                    defense: finalDefense,
                    energy: isBoss ? 100 : 0,
                    maxEnergy: isBoss ? 100 : 0,
                    isElite: isElite,
                    isBoss: isBoss,
                    bonus: bonus,
                    name: isBoss ? `BOSS${enemyTypeName}` : (isElite ? `精英${enemyTypeName}` : enemyTypeName),
                    icon: isBoss ? 'fa-star' : (isElite ? 'fa-diamond' : 'fa-skull'),
                    image: `https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20${enemyTypeName.toLowerCase().replace(/\s+/g, '%20')}%2C%20cute%20style%2C%20winter%20theme%2C%20simple%20background&size=512x512`,
                    expMultiplier: 1.5 * (isBoss ? 2.0 : (isElite ? 1.5 : 1)),
                    resourceMultiplier: 1.2 * (isBoss ? 2.0 : (isElite ? 1.5 : 1)),
                    position: { x, z }, // 存储3D空间中的位置
                    cellIndex: i // 存储对应的2D格子索引
                };
                
                // 存储到场景怪物数据中
                this.gameState.sceneMonsters.push(enemyInfo);
                
                // 使用通用方法创建敌人图标
                const enemyIcon = this.createEnemyIcon(enemyInfo);
                
                gridCell.appendChild(enemyIcon);
            }
            
            mapGrid.appendChild(gridCell);
        }
        
        // 更新地图背景
        this.updateMapBackground();
    }
    
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
                            console.log('移除3D敌人模型时出错:', e);
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
            console.log('Setting battle state to true');
            this.gameState.battle.inBattle = true;
            console.log('Battle state after setting:', this.gameState.battle.inBattle);
            
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
            
            // 播放战斗音乐
            this.playSound('battle-music');
        }
    }
    
    // 检查保存的登录状态
    checkSavedLogin() {
        try {
            const savedUser = localStorage.getItem('endlessWinterCurrentUser');
            if (savedUser) {
                const userData = JSON.parse(savedUser);
                if (userData.loggedIn) {
                    this.gameState.user = userData;
                    this.addBattleLog(`自动登录成功！欢迎回来，${userData.username}！`);
                    this.updateCharacterBodyImage();
                }
            }
        } catch (error) {
            console.error('检查登录状态失败:', error);
        }
    }
    
    // 更新UI显示
    updateUI() {
        // 更新资源显示
        const energyElement = document.getElementById('energy');
        if (energyElement) {
            energyElement.textContent = Math.floor(this.gameState.resources.energy);
            // 更新能量恢复提示
            energyElement.setAttribute('data-tooltip', `能量恢复: +${this.gameState.resources.energyRate}/秒`);
        }
        const woodElement = document.getElementById('wood');
        if (woodElement) {
            woodElement.textContent = Math.floor(this.gameState.resources.wood);
        }
        const woodRateElement = document.getElementById('wood-rate');
        if (woodRateElement) {
            woodRateElement.textContent = `+${this.gameState.resources.woodRate}/秒`;
        }
        const ironElement = document.getElementById('iron');
        if (ironElement) {
            ironElement.textContent = Math.floor(this.gameState.resources.iron);
        }
        const ironRateElement = document.getElementById('iron-rate');
        if (ironRateElement) {
            ironRateElement.textContent = `+${this.gameState.resources.ironRate}/秒`;
        }
        const crystalElement = document.getElementById('crystal');
        if (crystalElement) {
            crystalElement.textContent = Math.floor(this.gameState.resources.crystal);
        }
        const crystalRateElement = document.getElementById('crystal-rate');
        if (crystalRateElement) {
            crystalRateElement.textContent = `+${this.gameState.resources.crystalRate}/秒`;
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
                attackElement.textContent = finalAttack;
            }
            const defenseElement = document.getElementById('defense');
            if (defenseElement) {
                defenseElement.textContent = finalDefense;
            }
            const hpElement = document.getElementById('hp');
            if (hpElement) {
                hpElement.textContent = finalHp;
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
        console.log('更新敌人显示，敌人信息:', this.gameState.enemy);
        const enemyNameElement = document.getElementById('enemy-name');
        if (enemyNameElement) {
            console.log('更新敌人名称:', this.gameState.enemy.name || '');
            enemyNameElement.textContent = this.gameState.enemy.name || '';
        }
        const enemyLevelElement = document.getElementById('enemy-level');
        if (enemyLevelElement) {
            console.log('更新敌人等级:', this.gameState.enemy.level || '');
            enemyLevelElement.textContent = this.gameState.enemy.level || '';
        }
        const enemyHpElement = document.getElementById('enemy-hp');
        if (enemyHpElement) {
            console.log('更新敌人HP:', this.gameState.enemy.hp || '');
            enemyHpElement.textContent = this.gameState.enemy.hp || '';
        }
        const enemyMaxHpElement = document.getElementById('enemy-max-hp');
        if (enemyMaxHpElement) {
            console.log('更新敌人最大HP:', this.gameState.enemy.maxHp || '');
            enemyMaxHpElement.textContent = this.gameState.enemy.maxHp || '';
        }
        const enemyAttackElement = document.getElementById('enemy-attack');
        if (enemyAttackElement) {
            console.log('更新敌人攻击:', this.gameState.enemy.attack || '');
            enemyAttackElement.textContent = this.gameState.enemy.attack || '';
        }
        
        // 更新敌人图标
        const enemyIconElement = document.querySelector('#enemy-icon i');
        if (enemyIconElement) {
            if (this.gameState.enemy.name) {
                // 计算敌人和玩家的战斗力
                const enemyPower = this.gameState.enemy.attack * 2 + this.gameState.enemy.defense * 1.5 + this.gameState.enemy.maxHp * 0.1;
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
            if (this.gameState.enemy.name) {
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
            if (this.gameState.enemy.name) {
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
        
        // 更新用户按钮状态
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');
        if (loginBtn && registerBtn && logoutBtn) {
            if (this.gameState.user.loggedIn) {
                loginBtn.classList.add('hidden');
                registerBtn.classList.add('hidden');
                logoutBtn.classList.remove('hidden');
            } else {
                loginBtn.classList.remove('hidden');
                registerBtn.classList.remove('hidden');
                logoutBtn.classList.add('hidden');
            }
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
        if (!this.gameState.battle.inBattle && !this.gameState.enemy.name) {
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
    
    // 生成资源
    generateResources() {
        // 生成能量
        this.gameState.resources.energy = Math.min(
            this.gameState.resources.energy + this.gameState.resources.energyRate,
            this.gameState.resources.maxEnergy
        );
        
        // 生成木材
        this.gameState.resources.wood += this.gameState.resources.woodRate;
        
        // 生成铁矿
        this.gameState.resources.iron += this.gameState.resources.ironRate;
        
        // 生成水晶
        this.gameState.resources.crystal += this.gameState.resources.crystalRate;
        
        // 生命自动恢复
        if (this.gameState.player.hp < this.gameState.player.maxHp) {
            // 每秒钟恢复1%的最大生命值
            const healAmount = Math.floor(this.gameState.player.maxHp * 0.01);
            this.gameState.player.hp = Math.min(
                this.gameState.player.hp + healAmount,
                this.gameState.player.maxHp
            );
        }
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        this.updateHealthBars();
    }
    
    // 声音播放冷却时间
    soundCooldowns = {};
    
    // 播放声音
    playSound(soundId) {
        console.log('尝试播放声音:', soundId);
        
        // 检查声音是否在冷却中
        const now = Date.now();
        if (this.soundCooldowns[soundId] && now - this.soundCooldowns[soundId] < 1000) {
            console.log('声音在冷却中，跳过播放:', soundId);
            return;
        }
        
        // 设置冷却时间
        this.soundCooldowns[soundId] = now;
        
        const soundElement = document.getElementById(soundId);
        if (soundElement) {
            try {
                console.log('找到声音元素:', soundId);
                console.log('声音元素readyState:', soundElement.readyState);
                console.log('声音元素src:', soundElement.src);
                
                // 确保音量设置为最大
                soundElement.volume = 1;
                console.log('音量设置为:', soundElement.volume);
                
                // 先停止当前声音，确保不会重复播放
                soundElement.pause();
                soundElement.currentTime = 0;
                console.log('重置播放位置为:', soundElement.currentTime);
                
                // 停止所有正在播放的声音
                if (soundId === 'battle-music') {
                    const otherSounds = [
                        'attack-sound',
                        'victory-sound',
                        'defeat-sound',
                        'skill-0-sound',
                        'skill-1-sound',
                        'skill-2-sound',
                        'skill-3-sound',
                        'levelup-sound'
                    ];
                    otherSounds.forEach(sound => {
                        const otherSoundElement = document.getElementById(sound);
                        if (otherSoundElement) {
                            try {
                                otherSoundElement.pause();
                                otherSoundElement.currentTime = 0;
                            } catch (e) {
                                console.log('停止其他声音失败:', sound, e);
                            }
                        }
                    });
                } else {
                    // 对于非战斗音乐，停止战斗音乐
                    const battleMusicElement = document.getElementById('battle-music');
                    if (battleMusicElement) {
                        try {
                            battleMusicElement.pause();
                            battleMusicElement.currentTime = 0;
                        } catch (e) {
                            console.log('停止战斗音乐失败:', e);
                        }
                    }
                    
                    // 对于升级声音，停止其他所有音效
                    if (soundId === 'levelup-sound') {
                        const otherSounds = [
                            'attack-sound',
                            'victory-sound',
                            'defeat-sound',
                            'skill-0-sound',
                            'skill-1-sound',
                            'skill-2-sound',
                            'skill-3-sound'
                        ];
                        otherSounds.forEach(sound => {
                            const otherSoundElement = document.getElementById(sound);
                            if (otherSoundElement) {
                                try {
                                    otherSoundElement.pause();
                                    otherSoundElement.currentTime = 0;
                                } catch (e) {
                                    console.log('停止其他声音失败:', sound, e);
                                }
                            }
                        });
                    }
                }
                
                // 初始化事件监听器存储对象
                if (!this.soundPlayHandlers) {
                    this.soundPlayHandlers = {};
                }
                
                // 先移除可能存在的监听器，避免重复触发
                if (this.soundPlayHandlers[soundId]) {
                    soundElement.removeEventListener('canplaythrough', this.soundPlayHandlers[soundId]);
                }
                
                // 检查声音元素是否已经准备好
                if (soundElement.readyState >= 2) {
                    // 播放声音
                    soundElement.play().then(() => {
                        console.log('声音播放成功:', soundId);
                        
                        // 对于升级声音，设置定时器确保只播放一次
                        if (soundId === 'levelup-sound') {
                            console.log('为升级声音设置自动停止定时器');
                            setTimeout(() => {
                                try {
                                    soundElement.pause();
                                    soundElement.currentTime = 0;
                                    console.log('升级声音自动停止');
                                } catch (error) {
                                    console.log('停止升级声音失败:', error);
                                }
                            }, 3000); // 3秒后停止声音
                        }
                    }).catch(error => {
                        console.log('播放声音失败:', error);
                        
                        // 忽略AbortError，这是由于快速切换声音导致的
                        if (error.name !== 'AbortError') {
                            // 尝试另一种播放方式
                            try {
                                soundElement.currentTime = 0;
                                soundElement.play();
                                console.log('尝试另一种播放方式:', soundId);
                            } catch (e) {
                                console.log('第二种播放方式也失败:', e);
                            }
                        }
                    });
                } else {
                    // 定义一次性的播放处理函数
                    this.soundPlayHandlers[soundId] = () => {
                        console.log('声音元素加载完成，开始播放:', soundId);
                        soundElement.play().then(() => {
                            console.log('声音播放成功:', soundId);
                            
                            // 对于升级声音，设置定时器确保只播放一次
                            if (soundId === 'levelup-sound') {
                                console.log('为升级声音设置自动停止定时器');
                                setTimeout(() => {
                                    try {
                                        soundElement.pause();
                                        soundElement.currentTime = 0;
                                        console.log('升级声音自动停止');
                                    } catch (error) {
                                        console.log('停止升级声音失败:', error);
                                    }
                                }, 3000); // 3秒后停止声音
                            }
                        }).catch(error => {
                            console.log('播放声音失败:', error);
                        });
                    };
                    
                    // 添加一次性的事件监听器
                    soundElement.addEventListener('canplaythrough', this.soundPlayHandlers[soundId], { once: true });
                    
                    // 尝试加载声音
                    soundElement.load();
                    console.log('开始加载声音:', soundId);
                }
            } catch (error) {
                console.log('播放声音失败:', error);
            }
        } else {
            console.log('未找到声音元素:', soundId);
        }
    }
    
    // 初始化3D战斗场景
    initBattle3DScene() {
        const container = document.getElementById('battle-3d-container');
        if (!container) return;
        
        // 清除旧的3D场景
        if (this.battle3D) {
            // 取消动画循环
            if (this.battle3D.animationId) {
                cancelAnimationFrame(this.battle3D.animationId);
                this.battle3D.animationId = null;
            }
            
            // 移除渲染器
            if (this.battle3D.renderer && this.battle3D.renderer.domElement) {
                try {
                    // 检查渲染器是否是容器的子节点
                    if (container.contains(this.battle3D.renderer.domElement)) {
                        container.removeChild(this.battle3D.renderer.domElement);
                    }
                } catch (e) {
                    console.log('移除渲染器时出错:', e);
                }
                this.battle3D.renderer.dispose();
                this.battle3D.renderer = null;
            }
            
            // 清理场景资源
            if (this.battle3D.scene) {
                // 移除所有对象
                while (this.battle3D.scene.children.length > 0) {
                    const object = this.battle3D.scene.children[0];
                    this.battle3D.scene.remove(object);
                    
                    // 释放几何体和材质
                    if (object.geometry) {
                        object.geometry.dispose();
                    }
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                }
                this.battle3D.scene = null;
            }
            
            // 重置其他属性
            this.battle3D.player = null;
            this.battle3D.enemy = null;
            this.battle3D = null;
        }
        
        // 保存当前战斗状态
        const isBattle = this.gameState.battle.inBattle;
        console.log('Current battle state before creating scene:', isBattle);
        
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
        
        // 创建场景
        this.battle3D = {
            scene: new THREE.Scene(),
            camera: new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000),
            renderer: new THREE.WebGLRenderer({ antialias: true, alpha: true }),
            player: null,
            enemy: null,
            playerHealthBar: null,
            enemyHealthBar: null,
            playerEnergyBar: null,
            enemyEnergyBar: null,
            snowSystem: null,
            animationId: null,
            isAttacking: false,
            playerDefeated: false,
            enemyDefeated: false,
            // 战斗特效
            battleEffects: [],
            fireEffects: [],
            // 预生成的敌人列表
            enemies: []
        };
        
        // 设置渲染器
        this.battle3D.renderer.setSize(container.clientWidth, container.clientHeight);
        
        // 调试：检查战斗状态
        console.log('initBattle3DScene - inBattle:', isBattle);
        
        // 当不在战斗状态且没有敌人时，确保敌人信息区域显示为默认状态
        if (!isBattle && (!this.gameState.enemy || !this.gameState.enemy.name)) {
            this.hideEnemyInfo();
        }
        
        // 设置背景颜色和雾效
        if (isBattle) {
            // 战斗场景背景设置 - 火山背景
            console.log('Using battle scene background');
            this.battle3D.renderer.setClearColor(0x1a1a2e, 1); // 深色火山背景
            // 战斗场景不使用雾效，以便更好地显示火山效果
        } else {
            // 探险场景背景设置
            console.log('Using exploration scene background');
            if (this.gameState.mapBackgrounds.length > 0 && this.gameState.currentBackgroundIndex !== undefined) {
                const currentBackground = this.gameState.mapBackgrounds[this.gameState.currentBackgroundIndex];
                if (currentBackground) {
                    // 设置天空颜色
                    this.battle3D.renderer.setClearColor(currentBackground.skyColor, 1);
                    
                    // 设置雾效
                    this.battle3D.scene.fog = new THREE.Fog(
                        currentBackground.fogColor,
                        currentBackground.fogNear,
                        currentBackground.fogFar
                    );
                } else {
                    // 默认设置
                    this.battle3D.renderer.setClearColor(0x87ceeb, 1); // 默认天空的蓝色
                    this.battle3D.scene.fog = new THREE.Fog(0x87ceeb, 10, 50); // 默认雾效
                }
            } else {
                // 默认设置
                this.battle3D.renderer.setClearColor(0x87ceeb, 1); // 默认天空的蓝色
                this.battle3D.scene.fog = new THREE.Fog(0x87ceeb, 10, 50); // 默认雾效
            }
        }
        
        // 清空容器，确保没有旧的渲染器元素
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        // 添加渲染器到容器
        const rendererElement = this.battle3D.renderer.domElement;
        rendererElement.style.opacity = '0'; // 初始透明度为0，用于淡入效果
        container.appendChild(rendererElement);
        
        // 存储鼠标目标位置
        this.mouseTarget = null;
        this.isMoving = false;
        
        // 设置相机位置
        if (isBattle) {
            // 战斗场景相机位置
            this.battle3D.camera.position.z = 6;
            this.battle3D.camera.position.y = 2;
        } else {
            // 探险场景相机位置
            this.battle3D.camera.position.z = 10;
            this.battle3D.camera.position.y = 3;
        }
        
        // 添加灯光
        if (isBattle) {
            // 战斗场景灯光 - 火山氛围
            const ambientLight = new THREE.AmbientLight(0x442222, 1);
            this.battle3D.scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffaa66, 1.5);
            directionalLight.position.set(5, 5, 3);
            this.battle3D.scene.add(directionalLight);
            
            // 添加火山特效光源
            const pointLight = new THREE.PointLight(0xff4400, 1.5, 10);
            pointLight.position.set(0, 2, 0);
            this.battle3D.scene.add(pointLight);
        } else {
            // 探险场景灯光
            const ambientLight = new THREE.AmbientLight(0xffffff, 1);
            this.battle3D.scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(2, 2, 2);
            this.battle3D.scene.add(directionalLight);
        }
        
        // 添加地面
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        
        // 创建地面材质
        let groundMaterial;
        if (this.textures && this.textures.ground) {
            // 使用加载的地面纹理
            groundMaterial = new THREE.MeshPhongMaterial({ 
                map: this.textures.ground,
                side: THREE.DoubleSide,
                shininess: isBattle ? 20 : 50,
                specular: isBattle ? 0x442200 : 0xffffff
            });
        } else {
            // 使用默认颜色
            const groundColor = isBattle ? 0x8b4513 : 0xf0f8ff;
            groundMaterial = new THREE.MeshPhongMaterial({ 
                color: groundColor, 
                side: THREE.DoubleSide,
                shininess: isBattle ? 20 : 50,
                specular: isBattle ? 0x442200 : 0xffffff
            });
        }
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1.5;
        this.battle3D.scene.add(ground);
        
        // 战斗场景添加火山陆地边缘和特效
        if (isBattle) {
            // 添加火山陆地边缘
            const edgeGeometry = new THREE.RingGeometry(7, 7.5, 32);
            const edgeMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xff4400, 
                side: THREE.DoubleSide,
                shininess: 100,
                specular: 0xffffff
            });
            const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
            edge.rotation.x = -Math.PI / 2;
            edge.position.y = -0.99;
            this.battle3D.scene.add(edge);
            
            // 添加喷火效果
            this.createFireEffects();
            
            // 添加火山烟雾效果
            this.createVolcanoSmoke();
        }
        
        // 只在探险场景中添加雪包
        if (!isBattle) {
            this.createSnowPiles();
        }
        
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
        this.animateBattle3D();
        
        // 绑定鼠标点击事件来处理人物移动（只在探险场景中）
        if (!isBattle) {
            const container = document.getElementById('battle-3d-container');
            if (container) {
                // 移除可能存在的旧事件监听器
                container.onclick = null;
                // 添加新的鼠标点击事件监听器
                container.addEventListener('click', (event) => {
                    this.handleMouseClick(event, container);
                });
                console.log('鼠标点击事件已绑定到3D场景容器');
            }
        }
        
        // 战斗场景执行淡入效果
        if (isBattle) {
            this.fadeInBattleScene();
        } else {
            // 确保渲染器元素的透明度为1，解决游戏首次启动时3D场景黑屏的问题
            setTimeout(() => {
                if (this.battle3D && this.battle3D.renderer && this.battle3D.renderer.domElement) {
                    this.battle3D.renderer.domElement.style.opacity = '1';
                }
            }, 200);
        }
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
            const fireGeometry = new THREE.BufferGeometry();
            const fireCount = 50;
            const positions = [];
            const colors = [];
            
            for (let i = 0; i < fireCount; i++) {
                positions.push(
                    pos.x + (Math.random() - 0.5) * 2,
                    0,
                    pos.z + (Math.random() - 0.5) * 2
                );
                
                // 火焰颜色从黄色到红色
                const color = new THREE.Color();
                color.setHSL(0.1 * Math.random(), 1, 0.5 + 0.3 * Math.random());
                colors.push(color.r, color.g, color.b);
            }
            
            fireGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            fireGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            
            const fireMaterial = new THREE.PointsMaterial({
                size: 0.2,
                transparent: true,
                opacity: 0.8,
                vertexColors: true,
                sizeAttenuation: true
            });
            
            const fireSystem = new THREE.Points(fireGeometry, fireMaterial);
            this.battle3D.scene.add(fireSystem);
            
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
        const smokeGeometry = new THREE.BufferGeometry();
        const smokeCount = 100;
        const positions = [];
        
        for (let i = 0; i < smokeCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 15,
                Math.random() * 8,
                (Math.random() - 0.5) * 15
            );
        }
        
        smokeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        const smokeMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.5,
            transparent: true,
            opacity: 0.3,
            sizeAttenuation: true
        });
        
        const smokeSystem = new THREE.Points(smokeGeometry, smokeMaterial);
        this.battle3D.scene.add(smokeSystem);
        this.battle3D.battleEffects.push(smokeSystem);
    }
    
    // 淡入战斗场景
    fadeInBattleScene() {
        if (!this.battle3D || !this.battle3D.renderer || !this.battle3D.renderer.domElement) return;
        
        const rendererElement = this.battle3D.renderer.domElement;
        let opacity = 0;
        const fadeDuration = 1000; // 淡入持续时间（毫秒）
        const startTime = Date.now();
        
        const fadeIn = () => {
            const elapsed = Date.now() - startTime;
            opacity = Math.min(elapsed / fadeDuration, 1);
            rendererElement.style.opacity = opacity.toString();
            
            if (opacity < 1) {
                requestAnimationFrame(fadeIn);
            }
        };
        
        fadeIn();
    }
    

    
    // 创建雪花粒子系统
    createSnowSystem() {
        // 雪花材质
        const snowMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        // 创建雪花几何体
        const snowGeometry = new THREE.BufferGeometry();
        const snowCount = 200;
        const positions = [];
        
        // 随机生成雪花位置
        for (let i = 0; i < snowCount; i++) {
            const x = (Math.random() - 0.5) * 10;
            const y = Math.random() * 5;
            const z = (Math.random() - 0.5) * 10;
            positions.push(x, y, z);
        }
        
        snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        // 创建雪花粒子系统
        const snowSystem = new THREE.Points(snowGeometry, snowMaterial);
        this.battle3D.scene.add(snowSystem);
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
                const enemyGroup = new THREE.Group();
                
                // 敌人材质
                let enemyMaterial;
                let enemyGeometry;
                
                // 从敌人名称中提取敌人类型
                let enemyTypeName = '雪原狼';
                if (enemyInfo.name.includes('冰原熊')) {
                    enemyTypeName = '冰原熊';
                } else if (enemyInfo.name.includes('冰霜巨人')) {
                    enemyTypeName = '冰霜巨人';
                }
                
                // 根据敌人类型设置不同的颜色和几何体
                switch (enemyTypeName) {
                    case '雪原狼':
                        enemyMaterial = new THREE.MeshPhongMaterial({ 
                            color: enemyInfo.isBoss ? 0xff00ff : (enemyInfo.isElite ? 0xffff00 : 0x8b4513), 
                            shininess: 50,
                            specular: 0x111111
                        });
                        enemyGeometry = new THREE.CylinderGeometry(0.15, 0.25, 0.4, 8); // 狼形（圆柱体）
                        break;
                    case '冰原熊':
                        enemyMaterial = new THREE.MeshPhongMaterial({ 
                            color: enemyInfo.isBoss ? 0xff00ff : (enemyInfo.isElite ? 0xffff00 : 0x696969), 
                            shininess: 50,
                            specular: 0x111111
                        });
                        enemyGeometry = new THREE.SphereGeometry(0.2); // 熊形（球体）
                        break;
                    case '冰霜巨人':
                        enemyMaterial = new THREE.MeshPhongMaterial({ 
                            color: enemyInfo.isBoss ? 0xff00ff : (enemyInfo.isElite ? 0xffff00 : 0x4682b4), 
                            shininess: 50,
                            specular: 0x111111
                        });
                        enemyGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.2); // 巨人形（立方体）
                        break;
                    default:
                        enemyMaterial = new THREE.MeshPhongMaterial({ 
                            color: enemyInfo.isBoss ? 0xff00ff : (enemyInfo.isElite ? 0xffff00 : 0xff0000), 
                            shininess: 50,
                            specular: 0x111111
                        });
                        enemyGeometry = new THREE.SphereGeometry(0.15); // 默认（小球体）
                }
                
                const enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
                enemyGroup.add(enemyMesh);
                
                // 设置敌人位置
                enemyGroup.position.x = enemyInfo.position.x;
                enemyGroup.position.z = enemyInfo.position.z;
                enemyGroup.position.y = 0;
                
                // 添加敌人到场景
                this.battle3D.scene.add(enemyGroup);
                
                // 创建敌人血条
                const enemyHealthBar = this.createHealthBar(0xff0000); // 红色血条
                enemyHealthBar.scale.set(0.5, 0.5, 0.5); // 缩小血条以匹配敌人大小
                enemyHealthBar.position.set(0, 0.5, 0); // 调整血条位置
                enemyGroup.add(enemyHealthBar);
                
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
            for (let i = 0; i < 3; i++) {
                // 随机位置，确保在场景范围内且不与玩家重叠
                let x, z;
                do {
                    x = (Math.random() - 0.5) * 16;
                    z = (Math.random() - 0.5) * 16;
                } while (Math.sqrt(x * x + z * z) < 1); // 确保敌人离玩家初始位置至少1单位
                
                // 生成随机敌人等级（与玩家等级相近）
                const playerLevel = this.gameState.player.level;
                const enemyLevel = Math.max(1, Math.min(playerLevel + 3, playerLevel + Math.floor(Math.random() * 3) - 1));
                
                // 生成随机敌人属性
                const baseAttack = enemyLevel * 8;
                const baseDefense = enemyLevel * 2;
                const baseHp = enemyLevel * 30;
                
                // 随机生成敌人类型
                const randomValue = Math.random();
                let isElite = false;
                let isBoss = false;
                let bonus = 0;
                
                if (randomValue < 0.05) {
                    // 5%概率生成boss
                    isBoss = true;
                    bonus = 1.0;
                } else if (randomValue < 0.15) {
                    // 10%概率生成精英怪
                    isElite = true;
                    bonus = 0.5;
                }
                
                // 计算最终属性
                const finalAttack = Math.floor(baseAttack * (1 + bonus));
                const finalDefense = Math.floor(baseDefense * (1 + bonus));
                const finalHp = Math.floor(baseHp * (1 + bonus));
                
                // 根据当前地图背景选择敌人类型
                let enemyTypes = [];
                const currentBackground = this.gameState.mapBackgrounds[this.gameState.currentBackgroundIndex];
                
                if (currentBackground) {
                    switch (currentBackground.type) {
                        case 'xianxia-mountain':
                            enemyTypes = ['山妖', '岩怪', '神雕', '石精', '山魈'];
                            break;
                        case 'xianxia-forest':
                            enemyTypes = ['树精', '花妖', '狐仙', '鹿灵', '木怪'];
                            break;
                        case 'xianxia-lake':
                            enemyTypes = ['水怪', '蛟蛇', '龟妖', '鱼精', '水仙'];
                            break;
                        case 'xianxia-desert':
                            enemyTypes = ['沙妖', '蝎精', '蛇怪', '沙漠巨蜥', '沙虫'];
                            break;
                        case 'xianxia-cave':
                            enemyTypes = ['洞穴蝙蝠', '石怪', '蜘蛛精', '蚯蚓怪', '洞穴幽灵'];
                            break;
                        default:
                            enemyTypes = ['妖狐', '山精', '水怪', '火灵', '土妖', '风魔', '雷兽'];
                    }
                } else {
                    enemyTypes = ['妖狐', '山精', '水怪', '火灵', '土妖', '风魔', '雷兽'];
                }
                
                const enemyTypeName = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                
                // 创建敌人信息
                const enemyInfo = {
                    level: enemyLevel,
                    hp: finalHp,
                    maxHp: finalHp,
                    attack: finalAttack,
                    defense: finalDefense,
                    energy: isBoss ? 100 : 0,
                    maxEnergy: isBoss ? 100 : 0,
                    isElite: isElite,
                    isBoss: isBoss,
                    bonus: bonus,
                    name: isBoss ? `BOSS${enemyTypeName}` : (isElite ? `精英${enemyTypeName}` : enemyTypeName),
                    icon: isBoss ? 'fa-star' : (isElite ? 'fa-diamond' : 'fa-skull'),
                    image: `https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20${enemyTypeName.toLowerCase().replace(/\s+/g, '%20')}%2C%20cute%20style%2C%20winter%20theme%2C%20simple%20background&size=512x512`,
                    expMultiplier: 1.5 * (isBoss ? 2.0 : (isElite ? 1.5 : 1)),
                    resourceMultiplier: 1.2 * (isBoss ? 2.0 : (isElite ? 1.5 : 1)),
                    position: { x, z }, // 存储3D空间中的位置
                    cellIndex: Math.floor(Math.random() * 25) // 随机分配一个2D格子索引
                };
                
                // 创建简单的敌人模型
                const enemyGroup = new THREE.Group();
                
                // 敌人材质
                let enemyMaterial;
                let enemyGeometry;
                
                // 根据敌人类型设置不同的颜色和几何体
                switch (enemyTypeName) {
                    case '雪原狼':
                        enemyMaterial = new THREE.MeshPhongMaterial({ 
                            color: isBoss ? 0xff00ff : (isElite ? 0xffff00 : 0x8b4513), 
                            shininess: 50,
                            specular: 0x111111
                        });
                        enemyGeometry = new THREE.CylinderGeometry(0.15, 0.25, 0.4, 8); // 狼形（圆柱体）
                        break;
                    case '冰原熊':
                        enemyMaterial = new THREE.MeshPhongMaterial({ 
                            color: isBoss ? 0xff00ff : (isElite ? 0xffff00 : 0x696969), 
                            shininess: 50,
                            specular: 0x111111
                        });
                        enemyGeometry = new THREE.SphereGeometry(0.2); // 熊形（球体）
                        break;
                    case '冰霜巨人':
                        enemyMaterial = new THREE.MeshPhongMaterial({ 
                            color: isBoss ? 0xff00ff : (isElite ? 0xffff00 : 0x4682b4), 
                            shininess: 50,
                            specular: 0x111111
                        });
                        enemyGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.2); // 巨人形（立方体）
                        break;
                    default:
                        enemyMaterial = new THREE.MeshPhongMaterial({ 
                            color: isBoss ? 0xff00ff : (isElite ? 0xffff00 : 0xff0000), 
                            shininess: 50,
                            specular: 0x111111
                        });
                        enemyGeometry = new THREE.SphereGeometry(0.15); // 默认（小球体）
                }
                
                const enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
                enemyGroup.add(enemyMesh);
                
                // 设置敌人位置
                enemyGroup.position.x = x;
                enemyGroup.position.z = z;
                enemyGroup.position.y = 0;
                
                // 添加敌人到场景
                this.battle3D.scene.add(enemyGroup);
                
                // 创建敌人血条
                const enemyHealthBar = this.createHealthBar(0xff0000); // 红色血条
                enemyHealthBar.scale.set(0.5, 0.5, 0.5); // 缩小血条以匹配敌人大小
                enemyHealthBar.position.set(0, 0.5, 0); // 调整血条位置
                enemyGroup.add(enemyHealthBar);
                
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
    
    // 创建血条
    createHealthBars() {
        // 创建玩家血条
        const playerHealthBar = this.createHealthBar(0xff0000); // 红色血条
        playerHealthBar.position.set(0, 2, 0);
        if (this.battle3D.player) {
            this.battle3D.player.add(playerHealthBar);
        }
        this.battle3D.playerHealthBar = playerHealthBar;
        
        // 创建玩家能量条
        const playerEnergyBar = this.createHealthBar(0x0000ff); // 蓝色能量条
        playerEnergyBar.position.set(0, 1.8, 0);
        if (this.battle3D.player) {
            this.battle3D.player.add(playerEnergyBar);
        }
        this.battle3D.playerEnergyBar = playerEnergyBar;
        
        // 创建敌人血条
        const enemyHealthBar = this.createHealthBar(0xff0000); // 红色血条
        enemyHealthBar.position.set(0, 2, 0);
        if (this.battle3D.enemy) {
            this.battle3D.enemy.add(enemyHealthBar);
        }
        this.battle3D.enemyHealthBar = enemyHealthBar;
        
        // 创建敌人能量条（如果是BOSS）
        if (this.gameState.enemy.isBoss) {
            const enemyEnergyBar = this.createHealthBar(0x0000ff); // 蓝色能量条
            enemyEnergyBar.position.set(0, 1.8, 0);
            if (this.battle3D.enemy) {
                this.battle3D.enemy.add(enemyEnergyBar);
            }
            this.battle3D.enemyEnergyBar = enemyEnergyBar;
        }
        
        // 初始更新血条
        this.updateHealthBars();
    }
    
    // 创建单个血条
    createHealthBar(color = 0xff0000) {
        const healthBarGroup = new THREE.Group();
        
        // 血条背景
        const backgroundGeometry = new THREE.PlaneGeometry(1.5, 0.2);
        const backgroundMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
        healthBarGroup.add(background);
        
        // 血条填充
        const fillGeometry = new THREE.PlaneGeometry(1.4, 0.1);
        const fillMaterial = new THREE.MeshPhongMaterial({ color: color });
        const fill = new THREE.Mesh(fillGeometry, fillMaterial);
        fill.position.set(0, 0, 0.1);
        healthBarGroup.add(fill);
        
        // 存储填充部分用于后续更新
        healthBarGroup.fill = fill;
        
        return healthBarGroup;
    }
    
    // 更新血条显示
    updateHealthBars() {
        if (!this.battle3D) return;
        
        // 更新玩家血条
        if (this.battle3D.playerHealthBar && this.battle3D.playerHealthBar.fill) {
            const playerHealthPercent = Math.max(0, this.gameState.player.hp / this.gameState.player.maxHp);
            this.battle3D.playerHealthBar.fill.scale.x = playerHealthPercent;
            this.battle3D.playerHealthBar.fill.position.x = (playerHealthPercent - 1) * 0.7;
        }
        
        // 更新玩家能量条
        if (this.battle3D.playerEnergyBar && this.battle3D.playerEnergyBar.fill) {
            const playerEnergyPercent = Math.max(0, this.gameState.resources.energy / this.gameState.resources.maxEnergy);
            this.battle3D.playerEnergyBar.fill.scale.x = playerEnergyPercent;
            this.battle3D.playerEnergyBar.fill.position.x = (playerEnergyPercent - 1) * 0.7;
        }
        
        // 更新敌人血条
        if (this.battle3D.enemyHealthBar && this.battle3D.enemyHealthBar.fill) {
            const enemyHealthPercent = Math.max(0, this.gameState.enemy.hp / this.gameState.enemy.maxHp);
            this.battle3D.enemyHealthBar.fill.scale.x = enemyHealthPercent;
            this.battle3D.enemyHealthBar.fill.position.x = (enemyHealthPercent - 1) * 0.7;
        }
        
        // 更新敌人能量条（如果是BOSS）
        if (this.battle3D.enemyEnergyBar && this.battle3D.enemyEnergyBar.fill && this.gameState.enemy.isBoss) {
            const enemyEnergyPercent = Math.max(0, this.gameState.enemy.energy / this.gameState.enemy.maxEnergy);
            this.battle3D.enemyEnergyBar.fill.scale.x = enemyEnergyPercent;
            this.battle3D.enemyEnergyBar.fill.position.x = (enemyEnergyPercent - 1) * 0.7;
        }
    }
    
    // 创建雪包
    createSnowPiles() {
        const snowMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff, 
            shininess: 30,
            specular: 0xffffff
        });
        
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
            const snowGeometry = new THREE.SphereGeometry(size, 8, 8);
            const snowPile = new THREE.Mesh(snowGeometry, snowMaterial);
            snowPile.position.set(x, -1.5 + size / 2, z);
            this.battle3D.scene.add(snowPile);
        }
    }
    
    // 创建树
    createTrees() {
        // 树干材质
        const trunkMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8b4513, 
            shininess: 10,
            specular: 0x111111
        });
        
        // 树叶材质
        const leavesMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x228b22, 
            shininess: 20,
            specular: 0x111111
        });
        
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
            const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 8);
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(x, -1.5 + trunkHeight / 2, z);
            this.battle3D.scene.add(trunk);
            
            // 创建树叶
            const leavesGeometry = new THREE.SphereGeometry(leavesSize, 8, 8);
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.set(x, -1.5 + trunkHeight + leavesSize / 2, z);
            this.battle3D.scene.add(leaves);
        }
    }
    
    // 创建玩家3D模型
    createPlayerModel() {
        // 直接使用默认的人类卡通模型
        this.createDefaultPlayerModel();
    }
    
    // 创建默认玩家模型（当外部模型加载失败时使用）
    createDefaultPlayerModel() {
        const playerGroup = new THREE.Group();
        
        // 玩家材质
        let playerBodyMaterial;
        let playerHeadMaterial;
        let playerClothesMaterial;
        
        if (this.textures && this.textures.character) {
            playerBodyMaterial = new THREE.MeshPhongMaterial({ 
                map: this.textures.character,
                shininess: 100,
                specular: 0x111111
            });
            
            playerHeadMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffd7b5, 
                shininess: 100,
                specular: 0x111111
            });
            
            playerClothesMaterial = new THREE.MeshPhongMaterial({ 
                map: this.textures.character,
                shininess: 100,
                specular: 0x111111
            });
        } else {
            playerBodyMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x60a5fa, 
                shininess: 100,
                specular: 0x111111
            });
            
            playerHeadMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffd7b5, 
                shininess: 100,
                specular: 0x111111
            });
            
            playerClothesMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x3b82f6, 
                shininess: 100,
                specular: 0x111111
            });
        }
        
        // 身体（使用圆柱体）
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.8, 8);
        const body = new THREE.Mesh(bodyGeometry, playerClothesMaterial);
        playerGroup.add(body);
        
        // 头部（球体）
        const headGeometry = new THREE.SphereGeometry(0.3);
        const head = new THREE.Mesh(headGeometry, playerHeadMaterial);
        head.position.y = 0.9;
        playerGroup.add(head);
        
        // 头发（圆柱体）
        const hairGeometry = new THREE.CylinderGeometry(0.32, 0.35, 0.2, 8);
        const hair = new THREE.Mesh(hairGeometry, playerBodyMaterial);
        hair.position.y = 1.1;
        playerGroup.add(hair);
        
        // 手臂
        const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
        
        const leftArm = new THREE.Mesh(armGeometry, playerClothesMaterial);
        leftArm.position.x = -0.6;
        leftArm.position.y = 0.3;
        leftArm.rotation.z = Math.PI / 4;
        playerGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, playerClothesMaterial);
        rightArm.position.x = 0.6;
        rightArm.position.y = 0.3;
        rightArm.rotation.z = -Math.PI / 4;
        playerGroup.add(rightArm);
        
        // 腿部
        const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
        
        const leftLeg = new THREE.Mesh(legGeometry, playerBodyMaterial);
        leftLeg.position.x = -0.2;
        leftLeg.position.y = -0.8;
        playerGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, playerBodyMaterial);
        rightLeg.position.x = 0.2;
        rightLeg.position.y = -0.8;
        playerGroup.add(rightLeg);
        
        // 眼睛
        const eyeGeometry = new THREE.SphereGeometry(0.05);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.x = -0.1;
        leftEye.position.y = 0.95;
        leftEye.position.z = 0.3;
        playerGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.x = 0.1;
        rightEye.position.y = 0.95;
        rightEye.position.z = 0.3;
        playerGroup.add(rightEye);
        
        // 嘴巴
        const mouthGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8);
        const mouth = new THREE.Mesh(mouthGeometry, eyeMaterial);
        mouth.position.x = 0;
        mouth.position.y = 0.75;
        mouth.position.z = 0.3;
        playerGroup.add(mouth);
        
        playerGroup.position.x = -2;
        playerGroup.position.y = 0;
        
        this.battle3D.scene.add(playerGroup);
        this.battle3D.player = playerGroup;
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
        const wolfGroup = new THREE.Group();
        
        // 狼材质
        let wolfBodyMaterial;
        let wolfAccentMaterial;
        
        if (this.textures && this.textures.enemy) {
            wolfBodyMaterial = new THREE.MeshPhongMaterial({ 
                map: this.textures.enemy,
                shininess: 50,
                specular: 0x111111
            });
            
            wolfAccentMaterial = new THREE.MeshPhongMaterial({ 
                map: this.textures.enemy,
                shininess: 50,
                specular: 0x111111
            });
        } else {
            wolfBodyMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x8b4513, 
                shininess: 50,
                specular: 0x111111
            });
            
            wolfAccentMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xd2b48c, 
                shininess: 50,
                specular: 0x111111
            });
        }
        
        // 身体
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.2, 8);
        const body = new THREE.Mesh(bodyGeometry, wolfBodyMaterial);
        wolfGroup.add(body);
        
        // 头部
        const headGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
        const head = new THREE.Mesh(headGeometry, wolfBodyMaterial);
        head.position.y = 0.7;
        head.rotation.x = Math.PI / 2;
        wolfGroup.add(head);
        
        // 耳朵（使用圆锥体几何）
        const earGeometry = new THREE.ConeGeometry(0.15, 0.3);
        
        const leftEar = new THREE.Mesh(earGeometry, wolfAccentMaterial);
        leftEar.position.x = -0.2;
        leftEar.position.y = 1.0;
        leftEar.position.z = 0.3;
        leftEar.rotation.x = Math.PI / 4;
        leftEar.rotation.z = -Math.PI / 4;
        wolfGroup.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, wolfAccentMaterial);
        rightEar.position.x = 0.2;
        rightEar.position.y = 1.0;
        rightEar.position.z = 0.3;
        rightEar.rotation.x = Math.PI / 4;
        rightEar.rotation.z = Math.PI / 4;
        wolfGroup.add(rightEar);
        
        // 尾巴（使用圆锥体几何）
        const tailGeometry = new THREE.ConeGeometry(0.1, 0.6);
        const tail = new THREE.Mesh(tailGeometry, wolfAccentMaterial);
        tail.position.y = -0.6;
        tail.position.z = 0.3;
        tail.rotation.x = -Math.PI / 4;
        wolfGroup.add(tail);
        
        // 腿部
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
        
        // 前腿
        const frontLeftLeg = new THREE.Mesh(legGeometry, wolfBodyMaterial);
        frontLeftLeg.position.x = -0.3;
        frontLeftLeg.position.y = -0.6;
        frontLeftLeg.position.z = 0.4;
        wolfGroup.add(frontLeftLeg);
        
        const frontRightLeg = new THREE.Mesh(legGeometry, wolfBodyMaterial);
        frontRightLeg.position.x = 0.3;
        frontRightLeg.position.y = -0.6;
        frontRightLeg.position.z = 0.4;
        wolfGroup.add(frontRightLeg);
        
        // 后腿
        const backLeftLeg = new THREE.Mesh(legGeometry, wolfBodyMaterial);
        backLeftLeg.position.x = -0.3;
        backLeftLeg.position.y = -0.6;
        backLeftLeg.position.z = -0.4;
        wolfGroup.add(backLeftLeg);
        
        const backRightLeg = new THREE.Mesh(legGeometry, wolfBodyMaterial);
        backRightLeg.position.x = 0.3;
        backRightLeg.position.y = -0.6;
        backRightLeg.position.z = -0.4;
        wolfGroup.add(backRightLeg);
        
        // 眼睛
        const eyeGeometry = new THREE.SphereGeometry(0.05);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.x = -0.1;
        leftEye.position.y = 1.0;
        leftEye.position.z = 0.5;
        wolfGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.x = 0.1;
        rightEye.position.y = 1.0;
        rightEye.position.z = 0.5;
        wolfGroup.add(rightEye);
        
        // 鼻子
        const noseGeometry = new THREE.ConeGeometry(0.1, 0.1, 8);
        const nose = new THREE.Mesh(noseGeometry, eyeMaterial);
        nose.position.y = 1.0;
        nose.position.z = 0.7;
        nose.rotation.x = Math.PI;
        wolfGroup.add(nose);
        
        wolfGroup.position.x = 2;
        wolfGroup.position.y = 0;
        
        this.battle3D.scene.add(wolfGroup);
        this.battle3D.enemy = wolfGroup;
        
        return wolfGroup;
    }
    
    // 创建熊模型
    createBearModel() {
        const bearGroup = new THREE.Group();
        
        // 熊材质
        let bearBodyMaterial;
        let bearAccentMaterial;
        
        if (this.textures && this.textures.enemy) {
            bearBodyMaterial = new THREE.MeshPhongMaterial({ 
                map: this.textures.enemy,
                shininess: 50,
                specular: 0x111111
            });
            
            bearAccentMaterial = new THREE.MeshPhongMaterial({ 
                map: this.textures.enemy,
                shininess: 50,
                specular: 0x111111
            });
        } else {
            bearBodyMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x8b4513, 
                shininess: 50,
                specular: 0x111111
            });
            
            bearAccentMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xd2b48c, 
                shininess: 50,
                specular: 0x111111
            });
        }
        
        // 身体
        const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.8, 1.5, 8);
        const body = new THREE.Mesh(bodyGeometry, bearBodyMaterial);
        bearGroup.add(body);
        
        // 头部
        const headGeometry = new THREE.SphereGeometry(0.4);
        const head = new THREE.Mesh(headGeometry, bearBodyMaterial);
        head.position.y = 1.2;
        bearGroup.add(head);
        
        // 耳朵（使用圆锥体几何）
        const earGeometry = new THREE.ConeGeometry(0.2, 0.3);
        
        const leftEar = new THREE.Mesh(earGeometry, bearAccentMaterial);
        leftEar.position.x = -0.3;
        leftEar.position.y = 1.6;
        leftEar.position.z = 0.2;
        leftEar.rotation.x = Math.PI / 4;
        leftEar.rotation.z = -Math.PI / 4;
        bearGroup.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, bearAccentMaterial);
        rightEar.position.x = 0.3;
        rightEar.position.y = 1.6;
        rightEar.position.z = 0.2;
        rightEar.rotation.x = Math.PI / 4;
        rightEar.rotation.z = Math.PI / 4;
        bearGroup.add(rightEar);
        
        // 手臂
        const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
        
        const leftArm = new THREE.Mesh(armGeometry, bearBodyMaterial);
        leftArm.position.x = -0.7;
        leftArm.position.y = 0.5;
        leftArm.rotation.z = Math.PI / 4;
        bearGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, bearBodyMaterial);
        rightArm.position.x = 0.7;
        rightArm.position.y = 0.5;
        rightArm.rotation.z = -Math.PI / 4;
        bearGroup.add(rightArm);
        
        // 腿部
        const legGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
        
        const leftLeg = new THREE.Mesh(legGeometry, bearBodyMaterial);
        leftLeg.position.x = -0.3;
        leftLeg.position.y = -1.1;
        bearGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, bearBodyMaterial);
        rightLeg.position.x = 0.3;
        rightLeg.position.y = -1.1;
        bearGroup.add(rightLeg);
        
        // 眼睛
        const eyeGeometry = new THREE.SphereGeometry(0.08);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.x = -0.15;
        leftEye.position.y = 1.3;
        leftEye.position.z = 0.4;
        bearGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.x = 0.15;
        rightEye.position.y = 1.3;
        rightEye.position.z = 0.4;
        bearGroup.add(rightEye);
        
        // 鼻子
        const noseGeometry = new THREE.ConeGeometry(0.15, 0.2, 8);
        const nose = new THREE.Mesh(noseGeometry, bearAccentMaterial);
        nose.position.y = 1.1;
        nose.position.z = 0.45;
        nose.rotation.x = Math.PI;
        bearGroup.add(nose);
        
        bearGroup.position.x = 2;
        bearGroup.position.y = 0;
        
        this.battle3D.scene.add(bearGroup);
        this.battle3D.enemy = bearGroup;
        
        return bearGroup;
    }
    
    // 创建蛇模型
    createSnakeModel() {
        const snakeGroup = new THREE.Group();
        
        // 蛇材质
        let snakeBodyMaterial;
        
        if (this.textures && this.textures.enemy) {
            snakeBodyMaterial = new THREE.MeshPhongMaterial({ 
                map: this.textures.enemy,
                shininess: 50,
                specular: 0x111111
            });
        } else {
            snakeBodyMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x006400, 
                shininess: 50,
                specular: 0x111111
            });
        }
        
        // 身体（使用多个圆柱体连接）
        for (let i = 0; i < 5; i++) {
            const segmentGeometry = new THREE.CylinderGeometry(0.3 - i * 0.05, 0.3 - (i + 1) * 0.05, 0.4, 8);
            const segment = new THREE.Mesh(segmentGeometry, snakeBodyMaterial);
            segment.position.x = i * 0.3;
            segment.position.y = Math.sin(i * 0.5) * 0.2;
            segment.rotation.z = Math.sin(i * 0.5) * 0.3;
            snakeGroup.add(segment);
        }
        
        // 头部
        const headGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
        const head = new THREE.Mesh(headGeometry, snakeBodyMaterial);
        head.position.x = 1.5;
        head.position.y = Math.sin(4 * 0.5) * 0.2;
        head.rotation.z = Math.sin(4 * 0.5) * 0.3;
        snakeGroup.add(head);
        
        // 眼睛
        const eyeGeometry = new THREE.SphereGeometry(0.08);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.x = 1.7;
        leftEye.position.y = Math.sin(4 * 0.5) * 0.2 + 0.15;
        leftEye.position.z = 0.2;
        leftEye.rotation.z = Math.sin(4 * 0.5) * 0.3;
        snakeGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.x = 1.7;
        rightEye.position.y = Math.sin(4 * 0.5) * 0.2 - 0.15;
        rightEye.position.z = 0.2;
        rightEye.rotation.z = Math.sin(4 * 0.5) * 0.3;
        snakeGroup.add(rightEye);
        
        // 舌头
        const tongueGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
        const tongueMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const tongue = new THREE.Mesh(tongueGeometry, tongueMaterial);
        tongue.position.x = 1.9;
        tongue.position.y = Math.sin(4 * 0.5) * 0.2;
        tongue.position.z = 0.2;
        tongue.rotation.z = Math.sin(4 * 0.5) * 0.3 + Math.PI;
        snakeGroup.add(tongue);
        
        snakeGroup.position.x = 2;
        snakeGroup.position.y = -0.5;
        snakeGroup.rotation.y = Math.PI / 2;
        
        this.battle3D.scene.add(snakeGroup);
        this.battle3D.enemy = snakeGroup;
        
        return snakeGroup;
    }
    
    // 创建默认敌人模型（当外部模型加载失败时使用）
    createDefaultEnemyModel() {
        const wolfGroup = new THREE.Group();
        
        // 敌人材质 - 狼的颜色
        let wolfBodyMaterial;
        let wolfAccentMaterial;
        
        if (this.textures && this.textures.enemy) {
            wolfBodyMaterial = new THREE.MeshPhongMaterial({ 
                map: this.textures.enemy,
                shininess: 50,
                specular: 0x111111
            });
            
            wolfAccentMaterial = new THREE.MeshPhongMaterial({ 
                map: this.textures.enemy,
                shininess: 50,
                specular: 0x111111
            });
        } else {
            wolfBodyMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x8b4513, 
                shininess: 50,
                specular: 0x111111
            });
            
            wolfAccentMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xd2b48c, 
                shininess: 50,
                specular: 0x111111
            });
        }
        
        // 身体
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.2, 8);
        const body = new THREE.Mesh(bodyGeometry, wolfBodyMaterial);
        wolfGroup.add(body);
        
        // 头部
        const headGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
        const head = new THREE.Mesh(headGeometry, wolfBodyMaterial);
        head.position.y = 0.7;
        head.rotation.x = Math.PI / 2;
        wolfGroup.add(head);
        
        // 耳朵（使用圆锥体几何）
        const earGeometry = new THREE.ConeGeometry(0.15, 0.3);
        
        const leftEar = new THREE.Mesh(earGeometry, wolfAccentMaterial);
        leftEar.position.x = -0.2;
        leftEar.position.y = 1.0;
        leftEar.position.z = 0.3;
        leftEar.rotation.x = Math.PI / 4;
        leftEar.rotation.z = -Math.PI / 4;
        wolfGroup.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, wolfAccentMaterial);
        rightEar.position.x = 0.2;
        rightEar.position.y = 1.0;
        rightEar.position.z = 0.3;
        rightEar.rotation.x = Math.PI / 4;
        rightEar.rotation.z = Math.PI / 4;
        wolfGroup.add(rightEar);
        
        // 尾巴（使用圆锥体几何）
        const tailGeometry = new THREE.ConeGeometry(0.1, 0.6);
        const tail = new THREE.Mesh(tailGeometry, wolfAccentMaterial);
        tail.position.y = -0.6;
        tail.position.z = 0.3;
        tail.rotation.x = -Math.PI / 4;
        wolfGroup.add(tail);
        
        // 腿部
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
        
        // 前腿
        const frontLeftLeg = new THREE.Mesh(legGeometry, wolfBodyMaterial);
        frontLeftLeg.position.x = -0.3;
        frontLeftLeg.position.y = -0.6;
        frontLeftLeg.position.z = 0.4;
        wolfGroup.add(frontLeftLeg);
        
        const frontRightLeg = new THREE.Mesh(legGeometry, wolfBodyMaterial);
        frontRightLeg.position.x = 0.3;
        frontRightLeg.position.y = -0.6;
        frontRightLeg.position.z = 0.4;
        wolfGroup.add(frontRightLeg);
        
        // 后腿
        const backLeftLeg = new THREE.Mesh(legGeometry, wolfBodyMaterial);
        backLeftLeg.position.x = -0.3;
        backLeftLeg.position.y = -0.6;
        backLeftLeg.position.z = -0.4;
        wolfGroup.add(backLeftLeg);
        
        const backRightLeg = new THREE.Mesh(legGeometry, wolfBodyMaterial);
        backRightLeg.position.x = 0.3;
        backRightLeg.position.y = -0.6;
        backRightLeg.position.z = -0.4;
        wolfGroup.add(backRightLeg);
        
        // 眼睛
        const eyeGeometry = new THREE.SphereGeometry(0.05);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.x = -0.1;
        leftEye.position.y = 1.0;
        leftEye.position.z = 0.5;
        wolfGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.x = 0.1;
        rightEye.position.y = 1.0;
        rightEye.position.z = 0.5;
        wolfGroup.add(rightEye);
        
        // 鼻子
        const noseGeometry = new THREE.ConeGeometry(0.1, 0.1, 8);
        const nose = new THREE.Mesh(noseGeometry, eyeMaterial);
        nose.position.y = 1.0;
        nose.position.z = 0.7;
        nose.rotation.x = Math.PI;
        wolfGroup.add(nose);
        
        wolfGroup.position.x = 2;
        wolfGroup.position.y = 0;
        
        this.battle3D.scene.add(wolfGroup);
        this.battle3D.enemy = wolfGroup;
        
        return wolfGroup;
    }
    
    // 3D战斗场景动画循环
    animateBattle3D() {
        if (!this.battle3D || !this.battle3D.renderer || !this.battle3D.scene || !this.battle3D.camera) {
            console.log('战斗场景未初始化，停止动画循环');
            return;
        }
        
        try {
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
                        console.log('到达鼠标目标位置');
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
            
            // 更新火山烟雾效果
            if (this.battle3D.battleEffects && this.battle3D.battleEffects.length > 0) {
                this.battle3D.battleEffects.forEach(effect => {
                    if (effect instanceof THREE.Points && effect.geometry && effect.geometry.attributes && effect.geometry.attributes.position) {
                        const positions = effect.geometry.attributes.position.array;
                        for (let i = 0; i < positions.length; i += 3) {
                            // 烟雾缓慢上升
                            positions[i + 1] += 0.005;
                            
                            // 烟雾到达顶部后重新从底部出现
                            if (positions[i + 1] > 8) {
                                positions[i + 1] = 0;
                                positions[i] = (Math.random() - 0.5) * 15;
                                positions[i + 2] = (Math.random() - 0.5) * 15;
                            }
                            
                            // 烟雾左右飘散
                            positions[i] += Math.sin(Date.now() * 0.0005 + i) * 0.008;
                            positions[i + 2] += Math.cos(Date.now() * 0.0005 + i) * 0.008;
                        }
                        effect.geometry.attributes.position.needsUpdate = true;
                    }
                });
            }
            
            // 更新喷火效果
            if (this.battle3D.fireEffects && this.battle3D.fireEffects.length > 0) {
                this.battle3D.fireEffects.forEach(fireEffect => {
                    if (fireEffect.system && fireEffect.system.geometry && fireEffect.system.geometry.attributes && fireEffect.system.geometry.attributes.position) {
                        const fireSystem = fireEffect.system;
                        const basePosition = fireEffect.basePosition;
                        const positions = fireSystem.geometry.attributes.position.array;
                        
                        for (let i = 0; i < positions.length; i += 3) {
                            // 火焰向上喷发
                            positions[i + 1] += 0.05;
                            
                            // 火焰到达顶部后重新从底部出现
                            if (positions[i + 1] > 5) {
                                positions[i + 1] = 0;
                                positions[i] = basePosition[0] + (Math.random() - 0.5) * 2;
                                positions[i + 2] = basePosition[2] + (Math.random() - 0.5) * 2;
                            }
                            
                            // 火焰摇曳效果
                            positions[i] += Math.sin(Date.now() * 0.002 + i) * 0.02;
                            positions[i + 2] += Math.cos(Date.now() * 0.002 + i) * 0.02;
                        }
                        
                        fireSystem.geometry.attributes.position.needsUpdate = true;
                    }
                });
            }
            
            // 确保相机看向场景中心
            this.battle3D.camera.lookAt(0, 0, 0);
            
            // 渲染场景
            this.battle3D.renderer.render(this.battle3D.scene, this.battle3D.camera);
            
            // 继续动画循环
            this.battle3D.animationId = requestAnimationFrame(() => this.animateBattle3D());
        } catch (e) {
            console.log('动画循环中出错:', e);
        }
    }
    
    // 播放攻击动画
    playAttackAnimation() {
        if (!this.battle3D || !this.battle3D.player || !this.battle3D.enemy) return;
        
        // 标记正在攻击
        this.battle3D.isAttacking = true;
        
        // 玩家攻击动画
        const player = this.battle3D.player;
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
                player.position.copy(originalPosition);
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
                enemy.position.copy(originalPosition);
                return;
            }
            
            requestAnimationFrame(shakeAnimation);
        };
        
        shakeAnimation();
    }
    
    // 绑定事件
    bindEvents() {
        // 攻击按钮
        document.getElementById('attack-btn').addEventListener('click', () => {
            this.attackEnemy();
        });
        
        // 自动战斗按钮
        document.getElementById('auto-battle-btn').addEventListener('click', () => {
            this.toggleAutoBattle();
        });
        
        // 自动收集资源按钮
        document.getElementById('auto-collect-btn').addEventListener('click', () => {
            this.toggleAutoCollect();
        });
        
        // 自动战斗目标颜色设置
        document.getElementById('auto-battle-green').addEventListener('change', () => {
            this.updateAutoBattleTargetColors();
        });
        document.getElementById('auto-battle-yellow').addEventListener('change', () => {
            this.updateAutoBattleTargetColors();
        });
        document.getElementById('auto-battle-red').addEventListener('change', () => {
            this.updateAutoBattleTargetColors();
        });
        
        // 自动收集资源类型设置
        document.getElementById('auto-collect-wood').addEventListener('change', () => {
            this.updateAutoCollectResourceTypes();
        });
        document.getElementById('auto-collect-iron').addEventListener('change', () => {
            this.updateAutoCollectResourceTypes();
        });
        document.getElementById('auto-collect-crystal').addEventListener('change', () => {
            this.updateAutoCollectResourceTypes();
        });
        
        // 自动挂机开关
        document.getElementById('auto挂机').addEventListener('change', (e) => {
            this.toggleAutoPlay(e.target.checked);
        });
        
        // 资源收集按钮
        document.getElementById('collect-wood').addEventListener('click', () => {
            this.collectResource('wood');
        });
        
        document.getElementById('collect-iron').addEventListener('click', () => {
            this.collectResource('iron');
        });
        
        document.getElementById('collect-crystal').addEventListener('click', () => {
            this.collectResource('crystal');
        });
        
        // 游戏设置按钮
        document.getElementById('save-game').addEventListener('click', () => {
            this.saveGame();
        });
        
        document.getElementById('load-game').addEventListener('click', () => {
            this.resetGame();
        });
        
        // 导出存档按钮
        document.getElementById('export-game').addEventListener('click', () => {
            this.exportGame();
        });
        
        // 导入存档按钮
        document.getElementById('import-game').addEventListener('change', (e) => {
            this.importGame(e.target.files[0]);
        });
        
        // 用户相关按钮
        document.getElementById('login-btn').addEventListener('click', () => {
            this.showLoginForm();
        });
        
        document.getElementById('register-btn').addEventListener('click', () => {
            this.showRegisterForm();
        });
        
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
        
        // 装备相关按钮
        document.getElementById('equip-item-btn').addEventListener('click', () => {
            this.showEquipMenu();
        });
        
        document.getElementById('unequip-item-btn').addEventListener('click', () => {
            this.showUnequipMenu();
        });
        
        // 背包按钮
        document.getElementById('open-inventory-btn').addEventListener('click', () => {
            this.showInventory();
        });
        
        // 为装备槽位添加点击事件
        document.querySelectorAll('.equipment-slot').forEach(slot => {
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
        
        // 精炼装备按钮
        document.getElementById('refine-weapon-btn').addEventListener('click', () => {
            const slot = this.selectedRefineSlot || 'weapon';
            this.refineEquipment(slot);
        });
        
        // 分解装备按钮
        document.getElementById('disassemble-item-btn').addEventListener('click', () => {
            const slot = this.selectedRefineSlot || 'weapon';
            this.disassembleEquipment(slot);
        });
        
        // 合成装备按钮
        document.getElementById('craft-equipment-btn').addEventListener('click', () => {
            this.showCraftMenu();
        });
        
        // 自动合成装备按钮
        document.getElementById('auto-craft-equipment-btn').addEventListener('click', () => {
            this.autoCraftEquipment();
        });
        
        // 一键装备最好的装备按钮
        document.getElementById('auto-equip-btn').addEventListener('click', () => {
            this.autoEquipBestGear();
        });
        
        // 特殊技按钮
        document.getElementById('skill-0').addEventListener('click', () => {
            this.useSkill(0);
        });
        
        document.getElementById('skill-1').addEventListener('click', () => {
            this.useSkill(1);
        });
        
        document.getElementById('skill-2').addEventListener('click', () => {
            this.useSkill(2);
        });
        
        document.getElementById('skill-3').addEventListener('click', () => {
            this.useSkill(3);
        });
        
        // 商店购买按钮
        document.getElementById('buy-health-potion').addEventListener('click', () => {
            this.buyShopItem('health_potion');
        });
        
        document.getElementById('buy-energy-potion').addEventListener('click', () => {
            this.buyShopItem('energy_potion');
        });
        
        document.getElementById('buy-attack-potion').addEventListener('click', () => {
            this.buyShopItem('attack_potion');
        });
        
        document.getElementById('buy-defense-potion').addEventListener('click', () => {
            this.buyShopItem('defense_potion');
        });
        
        document.getElementById('buy-basic-sword').addEventListener('click', () => {
            this.buyShopItem('basic_sword');
        });
        
        document.getElementById('buy-basic-armor').addEventListener('click', () => {
            this.buyShopItem('basic_armor');
        });
        
        document.getElementById('buy-basic-helmet').addEventListener('click', () => {
            this.buyShopItem('basic_helmet');
        });
        
        document.getElementById('buy-basic-boots').addEventListener('click', () => {
            this.buyShopItem('basic_boots');
        });
        
        document.getElementById('reset-game').addEventListener('click', () => {
            this.resetGame();
        });
        
        // 设置按钮下拉菜单
        document.getElementById('settings-btn').addEventListener('click', () => {
            const dropdown = document.getElementById('settings-dropdown');
            dropdown.classList.toggle('hidden');
        });
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', (e) => {
            const settingsBtn = document.getElementById('settings-btn');
            const dropdown = document.getElementById('settings-dropdown');
            if (!settingsBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
        
        // 刷新敌人按钮
        document.getElementById('refresh-enemy-btn').addEventListener('click', () => {
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
        document.getElementById('attack-confirm-btn').addEventListener('click', () => {
            if (this.gameState.enemy) {
                this.encounterEnemy(this.gameState.enemy);
            }
        });
        
        // 初始化所有按钮的tooltip
        this.initTooltips();
        
        // 添加键盘事件监听器，控制3D人物移动
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // 添加页面卸载时保存数据的事件监听器
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
            console.log('页面卸载前保存游戏状态');
        });
        
        // 添加定期保存机制
        setInterval(() => {
            this.saveGameState();
            console.log('定期保存游戏状态');
        }, 30000); // 每30秒自动保存一次
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
                this.battle3D.player.position.x -= moveSpeed;
                break;
            case 'd':
            case 'D':
                this.battle3D.player.position.x += moveSpeed;
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
        if (!this.battle3D || !this.battle3D.player || !this.battle3D.camera) return;
        
        // 计算鼠标在容器中的相对坐标
        const rect = container.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        
        // 创建射线投射器
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x: mouseX, y: mouseY }, this.battle3D.camera);
        
        // 创建一个平面，用于检测鼠标点击的位置
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // y=0平面
        const intersectionPoint = new THREE.Vector3();
        
        // 计算射线与平面的交点
        if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
            // 设置目标位置，只使用x和z坐标
            this.mouseTarget = {
                x: intersectionPoint.x,
                z: intersectionPoint.z
            };
            
            // 限制目标位置在场景范围内
            this.mouseTarget.x = Math.max(-8, Math.min(8, this.mouseTarget.x));
            this.mouseTarget.z = Math.max(-8, Math.min(8, this.mouseTarget.z));
            
            this.isMoving = true;
            console.log('设置鼠标目标位置:', this.mouseTarget);
        }
    }
    
    // 检查玩家与敌人的碰撞
    checkEnemyCollision() {
        if (!this.battle3D || !this.battle3D.player || !this.battle3D.enemies) return;
        
        const playerPos = this.battle3D.player.position;
        let enemyEncountered = false;
        
        // 遍历所有敌人，检查碰撞
        for (let i = 0; i < this.battle3D.enemies.length; i++) {
            const enemy = this.battle3D.enemies[i];
            
            // 只检查活跃的敌人
            if (enemy.active) {
                const enemyPos = enemy.model.position;
                const distance = Math.sqrt(
                    Math.pow(playerPos.x - enemyPos.x, 2) +
                    Math.pow(playerPos.z - enemyPos.z, 2)
                );
                
                // 如果玩家离敌人足够近（小于0.5单位），触发遇敌
                if (distance < 0.5) {
                    this.triggerEnemyEncounter(enemy);
                    enemyEncountered = true;
                    break;
                }
            }
        }
        
        // 如果没有碰到敌人，确保敌人信息区域显示默认状态（空白）
        if (!enemyEncountered && !this.gameState.battle.inBattle) {
            // 无论当前是否有敌人信息，都隐藏敌人信息区
            this.hideEnemyInfo();
            // 清除游戏状态中的敌人信息
            this.gameState.enemy = null;
        }
    }
    
    // 触发敌人遭遇
    triggerEnemyEncounter(enemy) {
        console.log('3D场景遇到敌人:', enemy.info.name);
        
        // 与2D场景行为一致，直接更新敌人信息区域
        this.showAttackConfirmation(enemy.info);
        
        // 不标记敌人为非活跃，也不从场景中移除敌人模型
        // 敌人只有在被击败后才会消失
    }
    
    // 保存地图场景状态
    saveMapState() {
        this.mapState = {
            playerPosition: this.battle3D ? this.battle3D.player.position.clone() : null,
            enemies: this.battle3D ? this.battle3D.enemies.filter(e => e.active) : [],
            sceneMonsters: JSON.parse(JSON.stringify(this.gameState.sceneMonsters))
        };
    }
    
    // 创建单独的3D战斗场景
    createBattleScene(enemyInfo) {
        console.log('开始创建战斗场景...');
        
        // 播放战斗音乐
        this.playSound('battle-music');
        
        // 清理当前场景
        if (this.battle3D) {
            // 取消动画循环
            if (this.battle3D.animationId) {
                cancelAnimationFrame(this.battle3D.animationId);
            }
            
            // 移除渲染器
            if (this.battle3D.renderer && this.battle3D.renderer.domElement) {
                const container = document.getElementById('battle-3d-container');
                if (container) {
                    try {
                        container.removeChild(this.battle3D.renderer.domElement);
                    } catch (e) {
                        console.log('移除渲染器时出错:', e);
                    }
                    this.battle3D.renderer.dispose();
                }
            }
        }
        
        // 创建新的战斗场景
        const container = document.getElementById('battle-3d-container');
        if (!container) {
            console.error('找不到battle-3d-container元素');
            return;
        }
        
        console.log('容器大小:', container.clientWidth, 'x', container.clientHeight);
        
        this.battle3D = {
            scene: new THREE.Scene(),
            camera: new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000),
            renderer: new THREE.WebGLRenderer({ antialias: true, alpha: true }),
            player: null,
            enemy: null,
            playerHealthBar: null,
            enemyHealthBar: null,
            playerEnergyBar: null,
            enemyEnergyBar: null,
            animationId: null,
            isAttacking: false,
            playerDefeated: false,
            enemyDefeated: false,
            battleEffects: [],
            fireEffects: [],
            opacity: 0 // 初始透明度为0，用于淡入效果
        };
        
        // 设置渲染器
        this.battle3D.renderer.setSize(container.clientWidth, container.clientHeight);
        this.battle3D.renderer.setClearColor(0x1a1a2e, 1); // 深色火山背景
        
        // 确保容器为空，然后添加渲染器
        container.innerHTML = '';
        const rendererElement = this.battle3D.renderer.domElement;
        rendererElement.style.opacity = '0';
        container.appendChild(rendererElement);
        
        // 重置鼠标移动状态，确保在战斗场景中禁用鼠标移动
        this.mouseTarget = null;
        this.isMoving = false;
        
        // 设置相机位置
        this.battle3D.camera.position.z = 10;
        this.battle3D.camera.position.y = 4;
        this.battle3D.camera.lookAt(0, 0, 0);
        
        // 添加火山氛围灯光
        const ambientLight = new THREE.AmbientLight(0x442222, 1);
        this.battle3D.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffaa66, 1.5);
        directionalLight.position.set(5, 5, 3);
        this.battle3D.scene.add(directionalLight);
        
        // 添加火山特效光源
        const pointLight = new THREE.PointLight(0xff4400, 1.5, 10);
        pointLight.position.set(0, 2, 0);
        this.battle3D.scene.add(pointLight);
        
        // 添加火山陆地
        const groundGeometry = new THREE.PlaneGeometry(15, 15);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8b4513, 
            side: THREE.DoubleSide,
            shininess: 20,
            specular: 0x442200
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        this.battle3D.scene.add(ground);
        
        // 添加火山陆地边缘
        const edgeGeometry = new THREE.RingGeometry(7, 7.5, 32);
        const edgeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff4400, 
            side: THREE.DoubleSide,
            shininess: 100,
            specular: 0xffffff
        });
        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge.rotation.x = -Math.PI / 2;
        edge.position.y = -0.99;
        this.battle3D.scene.add(edge);
        
        // 添加周围喷火效果
        this.createFireEffects();
        
        // 添加火山烟雾效果
        this.createVolcanoSmoke();
        
        // 创建玩家模型
        this.createPlayerModel();
        
        // 创建敌人模型
        this.createEnemyModel();
        
        // 创建血条
        this.createHealthBars();
        
        // 开始渲染循环
        this.animateBattle3D();
        
        // 执行淡入效果
        this.fadeInBattleScene();
        
        console.log('战斗场景创建完成');
    }
    
    // 淡入战斗场景
    fadeInBattleScene() {
        if (!this.battle3D || !this.battle3D.renderer || !this.battle3D.renderer.domElement) return;
        
        const rendererElement = this.battle3D.renderer.domElement;
        let opacity = 0;
        const fadeDuration = 1000; // 淡入持续时间（毫秒）
        const startTime = Date.now();
        
        const fadeIn = () => {
            const elapsed = Date.now() - startTime;
            opacity = Math.min(elapsed / fadeDuration, 1);
            rendererElement.style.opacity = opacity.toString();
            
            if (opacity < 1) {
                requestAnimationFrame(fadeIn);
            }
        };
        
        fadeIn();
    }
    
    // 淡出战斗场景并恢复地图场景
    fadeOutAndRestoreMapScene() {
        if (!this.battle3D || !this.battle3D.renderer || !this.battle3D.renderer.domElement) {
            this.restoreMapScene();
            return;
        }
        
        const rendererElement = this.battle3D.renderer.domElement;
        let opacity = 1;
        const fadeDuration = 1000; // 淡出持续时间（毫秒）
        const startTime = Date.now();
        
        const fadeOut = () => {
            const elapsed = Date.now() - startTime;
            opacity = Math.max(1 - elapsed / fadeDuration, 0);
            rendererElement.style.opacity = opacity.toString();
            
            if (opacity > 0) {
                requestAnimationFrame(fadeOut);
            } else {
                // 淡出完成，恢复地图场景
                this.restoreMapScene();
            }
        };
        
        fadeOut();
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
        const battle3DContainer = document.getElementById('battle-3d-container');
        if (battle3DContainer) {
            battle3DContainer.style.height = '600px';
            battle3DContainer.style.width = '100%';
        }
    }
    
    // 恢复原始UI布局
    restoreUILayout() {
        // 保留人物属性卡片显示，不做修改
        
        // 恢复资源栏和挂机区域
        const resourceBars = document.querySelector('[class*="grid-cols-3"]');
        if (resourceBars && this.uiState) {
            resourceBars.style.display = this.uiState.resourceGrid;
        }
        
        // 恢复3D战斗场景容器大小
        const battle3DContainer = document.getElementById('battle-3d-container');
        if (battle3DContainer) {
            battle3DContainer.style.height = '500px';
            battle3DContainer.style.width = '100%';
        }
    }
    
    // 创建喷火效果
    createFireEffects() {
        // 在四个角落创建喷火效果
        const firePositions = [
            [-8, 0, -8],  // 左下角
            [8, 0, -8],   // 右下角
            [-8, 0, 8],   // 左上角
            [8, 0, 8]     // 右上角
        ];
        
        firePositions.forEach(position => {
            // 创建火焰粒子系统
            const fireGeometry = new THREE.BufferGeometry();
            const fireCount = 30;
            const positions = new Float32Array(fireCount * 3);
            const colors = new Float32Array(fireCount * 3);
            
            for (let i = 0; i < fireCount * 3; i += 3) {
                // 初始位置
                positions[i] = position[0] + (Math.random() - 0.5) * 2;
                positions[i + 1] = position[1] + Math.random() * 5;
                positions[i + 2] = position[2] + (Math.random() - 0.5) * 2;
                
                // 火焰颜色（从黄色到红色）
                const fireColor = Math.random();
                if (fireColor < 0.3) {
                    // 黄色火焰
                    colors[i] = 1.0;
                    colors[i + 1] = 1.0;
                    colors[i + 2] = 0.0;
                } else if (fireColor < 0.7) {
                    // 橙色火焰
                    colors[i] = 1.0;
                    colors[i + 1] = 0.5;
                    colors[i + 2] = 0.0;
                } else {
                    // 红色火焰
                    colors[i] = 1.0;
                    colors[i + 1] = 0.0;
                    colors[i + 2] = 0.0;
                }
            }
            
            fireGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            fireGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const fireMaterial = new THREE.PointsMaterial({
                size: 0.3,
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            });
            
            const fireSystem = new THREE.Points(fireGeometry, fireMaterial);
            this.battle3D.scene.add(fireSystem);
            this.battle3D.fireEffects.push({
                system: fireSystem,
                basePosition: position
            });
        });
    }
    
    // 创建火山烟雾效果
    createVolcanoSmoke() {
        // 创建烟雾粒子系统
        const smokeGeometry = new THREE.BufferGeometry();
        const smokeCount = 40;
        const positions = new Float32Array(smokeCount * 3);
        const colors = new Float32Array(smokeCount * 3);
        
        for (let i = 0; i < smokeCount * 3; i += 3) {
            // 随机位置
            positions[i] = (Math.random() - 0.5) * 15;
            positions[i + 1] = Math.random() * 8;
            positions[i + 2] = (Math.random() - 0.5) * 15;
            
            // 烟雾颜色
            colors[i] = 0.6;
            colors[i + 1] = 0.6;
            colors[i + 2] = 0.6;
        }
        
        smokeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        smokeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const smokeMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.4
        });
        
        const smokeSystem = new THREE.Points(smokeGeometry, smokeMaterial);
        this.battle3D.scene.add(smokeSystem);
        this.battle3D.battleEffects.push(smokeSystem);
    }
    
    // 恢复地图场景
    restoreMapScene() {
        console.log('开始恢复地图场景...');
        
        // 停止所有声音
        const soundElements = [
            'battle-music',
            'attack-sound',
            'victory-sound',
            'defeat-sound',
            'skill-0-sound',
            'skill-1-sound',
            'skill-2-sound',
            'skill-3-sound'
        ];
        
        soundElements.forEach(soundId => {
            const soundElement = document.getElementById(soundId);
            if (soundElement) {
                try {
                    // 移除可能存在的事件监听器
                    if (this.soundPlayHandler) {
                        soundElement.removeEventListener('canplaythrough', this.soundPlayHandler);
                    }
                    
                    // 停止声音并重置播放位置
                    soundElement.pause();
                    soundElement.currentTime = 0;
                    console.log('停止声音:', soundId);
                } catch (error) {
                    console.log('停止声音失败:', soundId, error);
                }
            }
        });
        
        // 清理战斗场景
        if (this.battle3D) {
            // 取消动画循环
            if (this.battle3D.animationId) {
                cancelAnimationFrame(this.battle3D.animationId);
            }
            
            // 移除渲染器
            if (this.battle3D.renderer && this.battle3D.renderer.domElement) {
                const container = document.getElementById('battle-3d-container');
                if (container) {
                    try {
                        container.removeChild(this.battle3D.renderer.domElement);
                    } catch (e) {
                        console.log('移除渲染器时出错:', e);
                    }
                    this.battle3D.renderer.dispose();
                }
            }
            
            // 重置战斗状态
            this.battle3D = null;
        }
        
        // 设置战斗状态为false
        this.gameState.battle.inBattle = false;
        
        // 恢复保存的敌人分布
        if (this.mapState && this.mapState.sceneMonsters) {
            console.log('恢复保存的敌人分布，原始数量:', this.mapState.sceneMonsters.length);
            
            // 检查当前敌人是否被击败
            const enemyDefeated = this.gameState.enemy && this.gameState.enemy.hp <= 0;
            
            if (enemyDefeated) {
                // 如果敌人被击败，从保存的场景怪物中移除该敌人
                const currentEnemyCellIndex = this.gameState.enemy.cellIndex;
                if (currentEnemyCellIndex !== undefined) {
                    console.log('敌人被击败，移除cellIndex:', currentEnemyCellIndex);
                    this.mapState.sceneMonsters = this.mapState.sceneMonsters.filter(monster => 
                        monster.cellIndex !== currentEnemyCellIndex
                    );
                    console.log('移除后剩余敌人数量:', this.mapState.sceneMonsters.length);
                }
            }
            
            // 恢复场景怪物状态
            this.gameState.sceneMonsters = JSON.parse(JSON.stringify(this.mapState.sceneMonsters));
            console.log('恢复后的场景怪物数量:', this.gameState.sceneMonsters.length);
            console.log('恢复后的场景怪物数据:', this.gameState.sceneMonsters);
            
            // 只有当所有敌人都被击败时才重新生成新的敌人分布
            if (this.gameState.sceneMonsters.length === 0) {
                console.log('所有敌人已被击败，重新生成敌人分布');
                this.generateMiniMap();
            } else {
                console.log('恢复之前的敌人分布，剩余敌人数量:', this.gameState.sceneMonsters.length);
                // 重新渲染小地图
                this.renderMiniMap();
            }
        } else {
            // 如果没有保存的状态，重新生成小地图
            console.log('没有保存的状态，重新生成敌人分布');
            this.generateMiniMap();
        }
        
        // 重新初始化地图场景
        this.initBattle3DScene();
        
        // 恢复UI布局
        this.restoreUILayout();
        
        // 隐藏敌人信息区
        this.hideEnemyInfo();
        
        // 恢复玩家位置
        if (this.mapState && this.mapState.playerPosition && this.battle3D && this.battle3D.player) {
            this.battle3D.player.position.copy(this.mapState.playerPosition);
            console.log('恢复玩家位置:', this.mapState.playerPosition);
        }
        
        // 淡入地图场景
        this.fadeInMapScene();
        
        // 设置战斗状态
        this.gameState.battle.inBattle = false;
        
        console.log('地图场景恢复完成');
    }
    
    // 创建敌人图标
    createEnemyIcon(enemyInfo) {
        // 调试信息
        console.log('createEnemyIcon - enemyInfo:', enemyInfo);
        
        // 计算敌人和玩家的战斗力
        const enemyPower = enemyInfo.attack * 2 + (enemyInfo.defense || 0) * 1.5 + enemyInfo.maxHp * 0.1;
        const playerAttack = this.gameState.player.attack + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.attack : 0);
        const playerDefense = this.gameState.player.defense + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.defense : 0);
        const playerPower = playerAttack * 2 + playerDefense * 1.5 + this.gameState.player.maxHp * 0.1;
        
        // 调试信息
        console.log('Enemy power:', enemyPower);
        console.log('Player power:', playerPower);
        console.log('Power ratio:', enemyPower / playerPower);
        
        // 根据战斗力差距设置敌人图标颜色
        let enemyIconColor = 'text-green-500';
        let enemyBgColor = 'bg-green-500/30';
        if (enemyPower > playerPower * 1.5) {
            enemyIconColor = 'text-red-500';
            enemyBgColor = 'bg-red-500/30';
        } else if (enemyPower > playerPower) {
            enemyIconColor = 'text-yellow-500';
            enemyBgColor = 'bg-yellow-500/30';
        }
        
        const enemyIcon = document.createElement('div');
        enemyIcon.className = `w-6 h-6 rounded-full ${enemyBgColor} flex items-center justify-center ${enemyIconColor} cursor-pointer transition-colors`;
        enemyIcon.innerHTML = `<i class="fa fa-skull text-xs ${enemyIconColor}"></i>`;
        
        // 存储敌人信息
        enemyIcon.dataset.enemyInfo = JSON.stringify(enemyInfo);
        
        // 添加敌人信息提示
        enemyIcon.setAttribute('data-tooltip', `${enemyInfo.name}\n等级: ${enemyInfo.level}\nHP: ${enemyInfo.hp}/${enemyInfo.maxHp}\n攻击: ${enemyInfo.attack}\n防御: ${enemyInfo.defense}${enemyInfo.isBoss ? '\n能量: 100/100' : ''}`);
        
        // 添加点击事件
        enemyIcon.addEventListener('click', () => {
            try {
                const enemyInfo = JSON.parse(enemyIcon.dataset.enemyInfo);
                console.log('点击了2D敌人，敌人信息:', enemyInfo);
                this.showAttackConfirmation(enemyInfo);
            } catch (error) {
                console.error('解析敌人信息失败:', error);
            }
        });
        
        return enemyIcon;
    }
    
    // 重新渲染小地图
    renderMiniMap() {
        const mapGrid = document.getElementById('map-grid');
        mapGrid.innerHTML = '';
        
        // 生成5x5的地图格子
        for (let i = 0; i < 25; i++) {
            const gridCell = document.createElement('div');
            gridCell.className = 'bg-dark/30 rounded flex items-center justify-center';
            gridCell.dataset.cellIndex = i;
            
            // 检查当前格子是否有敌人
            const enemyInCell = this.gameState.sceneMonsters.find(monster => monster.cellIndex === i);
            if (enemyInCell) {
                // 使用通用方法创建敌人图标
                const enemyIcon = this.createEnemyIcon(enemyInCell);
                gridCell.appendChild(enemyIcon);
            }
            
            mapGrid.appendChild(gridCell);
        }
        
        // 更新地图背景
        this.updateMapBackground();
        
        // 重新初始化tooltip
        this.initTooltips();
    }
    
    // 淡入地图场景
    fadeInMapScene() {
        if (!this.battle3D || !this.battle3D.renderer || !this.battle3D.renderer.domElement) return;
        
        const rendererElement = this.battle3D.renderer.domElement;
        rendererElement.style.opacity = '0';
        
        let opacity = 0;
        const fadeDuration = 1000; // 淡入持续时间（毫秒）
        const startTime = Date.now();
        
        const fadeIn = () => {
            const elapsed = Date.now() - startTime;
            opacity = Math.min(elapsed / fadeDuration, 1);
            rendererElement.style.opacity = opacity.toString();
            
            if (opacity < 1) {
                requestAnimationFrame(fadeIn);
            }
        };
        
        fadeIn();
    }
    
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
        this.playSound('attack-sound');
        
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
        
        // 普通攻击恢复能量
        const energyRecovery = 5;
        this.gameState.resources.energy = Math.min(this.gameState.resources.energy + energyRecovery, this.gameState.resources.maxEnergy);
        this.addBattleLog(`普通攻击恢复了${energyRecovery}点能量！`);
        
        // 检查敌人是否死亡
        if (this.gameState.enemy.hp <= 0) {
            this.enemyDefeated();
        } else {
            // 敌人反击
            let finalEnemyDamage = enemyDamage;
            
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
        }
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        this.updateHealthBars();
    }
    
    // 显示攻击确认窗口（修改为更新敌人信息区）
    showAttackConfirmation(enemyInfo) {
        console.log('调用了showAttackConfirmation，敌人信息:', enemyInfo);
        // 更新游戏状态中的敌人信息
        this.gameState.enemy = enemyInfo;
        console.log('更新后的游戏状态敌人信息:', this.gameState.enemy);
        
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
        console.log('显示攻击确认按钮，隐藏技能按钮');
        console.log('attackConfirmBtn:', attackConfirmBtn);
        console.log('attackSkills:', attackSkills);
        if (attackConfirmBtn) {
            console.log('攻击确认按钮当前类:', attackConfirmBtn.className);
            // 强制移除hidden类，确保按钮显示
            attackConfirmBtn.classList.remove('hidden');
            console.log('攻击确认按钮修改后类:', attackConfirmBtn.className);
        }
        if (attackSkills) {
            attackSkills.classList.add('hidden');
        }
        
        console.log('敌人信息更新完成');
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

    // 敌人被击败
    enemyDefeated() {
        // 显示敌人倒地的画面
        this.showEnemyDefeatedAnimation();
        
        // 设置敌人被击败状态
        if (this.battle3D) {
            this.battle3D.enemyDefeated = true;
        }
        
        // 播放胜利声音
        this.playSound('victory-sound');
        
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
        this.gameState.resources.energy = Math.min(this.gameState.resources.energy + killEnergyRecovery, this.gameState.resources.maxEnergy);
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
        
        // 战斗结束，渐进式返回到地图场景
        setTimeout(() => {
            // 淡出战斗场景并恢复地图场景
            this.fadeOutAndRestoreMapScene();
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
        if (this.gameState.resources.energy < skill.energyCost) {
            this.addBattleLog(`能量不足，需要${skill.energyCost}点能量！`);
            return;
        }
        
        // 播放技能释放声音（根据技能索引播放不同的声音）
        this.playSound(`skill-${skillIndex}-sound`);
        
        // 播放攻击动画
        this.playAttackAnimation();
        
        // 延迟执行技能效果，让动画有时间播放
        setTimeout(() => {
            // 消耗能量
            this.gameState.resources.energy -= skill.energyCost;
            
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
                
                // 检查敌人是否死亡
                if (this.gameState.enemy.hp <= 0) {
                    this.enemyDefeated();
                    return;
                }
            } else if (skill.defenseBonus) {
                // 防御姿态
                this.addBattleLog(`你使用了${skill.name}，防御力提高了50%！`);
                // 减少敌人反击伤害
                const enemyDamage = Math.max(1, Math.floor((this.gameState.enemy.attack - finalDefense) * (1 - skill.defenseBonus)));
                this.gameState.player.hp -= enemyDamage;
                this.addBattleLog(`${this.gameState.enemy.name}对你造成了${enemyDamage}点伤害（已防御）！`);
            } else if (skill.healPercentage) {
                // 生命恢复
                const healAmount = Math.floor(this.gameState.player.maxHp * skill.healPercentage);
                this.gameState.player.hp = Math.min(this.gameState.player.hp + healAmount, this.gameState.player.maxHp);
                this.addBattleLog(`你使用了${skill.name}，恢复了${healAmount}点生命值！`);
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
                
                // 检查敌人是否死亡
                if (this.gameState.enemy.hp <= 0) {
                    this.enemyDefeated();
                    return;
                }
            }
            
            // 敌人反击（除了防御姿态和生命恢复）
            if (!skill.defenseBonus && !skill.healPercentage) {
                const enemyDamage = Math.max(1, this.gameState.enemy.attack - finalDefense);
                this.gameState.player.hp -= enemyDamage;
                // 确保玩家血量不会小于0
                if (this.gameState.player.hp < 0) {
                    this.gameState.player.hp = 0;
                }
                this.addBattleLog(`${this.gameState.enemy.name}对你造成了${enemyDamage}点伤害！`);
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
        this.playSound('defeat-sound');
        
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
        
        // 战斗结束，返回地图场景
        setTimeout(() => {
            this.restoreMapScene();
        }, 2000);
    }
    
    // 检查升级
    checkLevelUp() {
        console.log('调用checkLevelUp函数');
        console.log('当前经验:', this.gameState.player.exp, '最大经验:', this.gameState.player.maxExp);
        
        if (this.gameState.player.exp >= this.gameState.player.maxExp) {
            console.log('触发升级逻辑');
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
            this.gameState.resources.maxEnergy += 10;
            this.gameState.resources.energy = this.gameState.resources.maxEnergy; // 升级时充满能量
            
            // 提升资源产出率
            this.gameState.resources.energyRate += 0.5;
            this.gameState.resources.woodRate += 0.2;
            this.gameState.resources.ironRate += 0.1;
            this.gameState.resources.crystalRate += 0.05;
            
            console.log('准备播放升级声音');
            // 播放升级声音
            this.playSound('levelup-sound');
            
            this.addBattleLog(`恭喜你升级到${this.gameState.player.level}级！能量上限提升了10点！`);
            
            // 触发升级动画
            this.triggerLevelUpAnimation();
            
            console.log('升级逻辑执行完成');
        } else {
            console.log('经验不足，未触发升级');
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
        
        // 获取人物身体元素
        const characterBodyElement = document.getElementById('character-body');
        if (characterBodyElement) {
            // 获取人物身体元素的位置和尺寸
            const bodyRect = characterBodyElement.getBoundingClientRect();
            const containerRect = characterBodyElement.parentElement.getBoundingClientRect();
            
            // 计算相对位置（相对于容器）
            const relativeX = 0;
            const relativeY = 0;
            
            // 武器
            const weaponElement = document.getElementById('character-weapon');
            if (weaponElement) {
                if (equipment.weapon) {
                    weaponElement.style.opacity = '1';
                    // 动态设置武器位置
                    weaponElement.style.top = '60%';
                    weaponElement.style.left = '15%';
                    weaponElement.style.transform = 'translateY(-50%) rotate(-30deg)';
                } else {
                    weaponElement.style.opacity = '0';
                }
            }
            
            // 护甲
            const armorElement = document.getElementById('character-armor');
            if (armorElement) {
                if (equipment.armor) {
                    armorElement.style.opacity = '1';
                    // 动态设置护甲位置
                    armorElement.style.top = '60%';
                    armorElement.style.left = '50%';
                    armorElement.style.transform = 'translate(-50%, -50%)';
                } else {
                    armorElement.style.opacity = '0';
                }
            }
            
            // 头盔
            const helmetElement = document.getElementById('character-helmet');
            if (helmetElement) {
                if (equipment.helmet) {
                    helmetElement.style.opacity = '1';
                    // 动态设置头盔位置
                    helmetElement.style.top = '15%';
                    helmetElement.style.left = '50%';
                    helmetElement.style.transform = 'translateX(-50%)';
                } else {
                    helmetElement.style.opacity = '0';
                }
            }
            
            // 靴子
            const bootsElement = document.getElementById('character-boots');
            if (bootsElement) {
                if (equipment.boots) {
                    bootsElement.style.opacity = '1';
                    // 动态设置靴子位置
                    bootsElement.style.bottom = '5%';
                    bootsElement.style.left = '50%';
                    bootsElement.style.transform = 'translateX(-50%)';
                } else {
                    bootsElement.style.opacity = '0';
                }
            }
            
            // 饰品
            const accessoryElement = document.getElementById('character-accessory');
            if (accessoryElement) {
                if (equipment.accessory) {
                    accessoryElement.style.opacity = '1';
                    // 动态设置饰品位置
                    accessoryElement.style.top = '45%';
                    accessoryElement.style.left = '50%';
                    accessoryElement.style.transform = 'translate(-50%, -50%)';
                } else {
                    accessoryElement.style.opacity = '0';
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
        
        // 根据玩家等级选择敌人类型
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
        
        const enemyType = this.gameState.enemyTypes[enemyTypeIndex];
        
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
                if (this.gameState.settings.autoBattleSettings.enabled && this.gameState.resources.energy >= 10) {
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
                        if (this.gameState.resources.energy >= 5) {
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
                        if (this.gameState.resources.energy >= 5) {
                            this.collectResource(resourceType);
                        }
                    }
                }
                
                // 自动战斗（如果启用）
                if (this.gameState.settings.autoBattleSettings.enabled && this.gameState.resources.energy >= 10) {
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
        if (this.gameState.resources.energy < 5) {
            this.addBattleLog('能量不足，无法收集资源！');
            return;
        }
        
        // 消耗能量
        this.gameState.resources.energy -= 5;
        
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
    
    // 保存游戏
    saveGame() {
        try {
            const userId = this.gameState.user.loggedIn ? this.gameState.user.userId : 'guest';
            localStorage.setItem(`endlessWinterGame_${userId}`, JSON.stringify(this.gameState));
            this.addBattleLog('游戏保存成功！');
        } catch (error) {
            this.addBattleLog('游戏保存失败！');
            console.error('保存游戏失败:', error);
        }
    }
    
    // 加载游戏
    loadGame() {
        try {
            const userId = this.gameState.user.loggedIn ? this.gameState.user.userId : 'guest';
            const savedGame = localStorage.getItem(`endlessWinterGame_${userId}`);
            if (savedGame) {
                this.gameState = JSON.parse(savedGame);
                this.addBattleLog('游戏加载成功！');
                this.updateUI();
            } else {
                this.addBattleLog('没有找到保存的游戏！');
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
        if (item.colorClass) {
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
        } else if (item.rarity) {
            // 兼容旧装备
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
        
        // 分解后保存游戏状态
        this.saveGameState();
    }
    
    // 保存游戏状态
    saveGameState() {
        try {
            if (this.gameState.user.loggedIn) {
                const currentUserId = this.gameState.user.userId;
                localStorage.setItem(`endlessWinterGame_${currentUserId}`, JSON.stringify(this.gameState));
                localStorage.setItem('endlessWinterCurrentUser', JSON.stringify(this.gameState.user));
                console.log('游戏状态已保存');
            } else {
                // 保存访客状态
                const guestId = 'guest';
                localStorage.setItem(`endlessWinterGame_${guestId}`, JSON.stringify(this.gameState));
                console.log('访客游戏状态已保存');
            }
        } catch (error) {
            console.error('保存游戏状态失败:', error);
        }
    }
    
    // 显示合成菜单
    showCraftMenu() {
        const craftableEquipment = this.checkCraftableEquipment();
        
        if (craftableEquipment.length === 0) {
            this.addBattleLog('背包中没有足够的装备进行合成！');
            return;
        }
        
        let craftMenu = '可合成装备：\n';
        craftableEquipment.forEach((craftable, index) => {
            craftMenu += `${index + 1}. ${craftable.typeName} (等级 ${craftable.level}) - 需要3个\n`;
        });
        
        const choice = prompt(craftMenu + '\n请输入要合成的装备编号：');
        const selectedIndex = parseInt(choice) - 1;
        
        if (selectedIndex >= 0 && selectedIndex < craftableEquipment.length) {
            this.craftEquipment(craftableEquipment[selectedIndex]);
        }
    }
    
    // 检查可合成的装备
    checkCraftableEquipment() {
        const inventory = this.gameState.player.inventory || [];
        const equipmentByTypeAndLevel = {};
        
        // 按类型和等级分组装备
        inventory.forEach(item => {
            // 检查是否是装备类型
            if ((item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || 
                 item.type === 'helmet' || item.type === 'boots' || item.type === 'accessory') || 
                item.equipmentType) {
                const equipmentType = item.equipmentType || item.type;
                const level = item.level || 1;
                const key = `${equipmentType}_${level}`;
                
                if (!equipmentByTypeAndLevel[key]) {
                    equipmentByTypeAndLevel[key] = {
                        type: equipmentType,
                        level: level,
                        items: [],
                        typeName: this.getEquipmentTypeName(equipmentType)
                    };
                }
                
                equipmentByTypeAndLevel[key].items.push(item);
            }
        });
        
        // 筛选出有至少3个同类型同等级装备的组合
        return Object.values(equipmentByTypeAndLevel).filter(craftable => {
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
                (item.level || 1) === craftable.level) {
                itemsToRemove.push(i);
                originalItems.push(item);
            }
        }
        
        // 移除选中的装备（从后往前移除，避免索引混乱）
        itemsToRemove.reverse().forEach(index => {
            inventory.splice(index, 1);
        });
        
        // 确定合成后的品质（根据原始装备品质升级）
        const baseRarity = originalItems[0]?.rarity || 'white';
        const newRarity = this.getNextRarity(baseRarity);
        
        // 检查合成是否成功
        const success = this.checkCraftSuccess(baseRarity);
        
        if (success) {
            // 合成成功：生成新装备
            const newEquipment = this.generateCraftedEquipment(craftable.type, craftable.level + 1, newRarity);
            
            // 检查并自动穿戴更好的装备
            const equipped = this.checkAndEquipBetterGear(newEquipment);
            if (!equipped) {
                // 将新装备添加到背包
                inventory.push(newEquipment);
                this.addBattleLog(`成功合成${craftable.typeName}！`);
                this.addBattleLog(`消耗了3个${craftable.level}级${craftable.typeName}，获得了1个${craftable.level + 1}级${newEquipment.name}，已放入背包！`);
            } else {
                this.addBattleLog(`成功合成${craftable.typeName}！`);
                this.addBattleLog(`消耗了3个${craftable.level}级${craftable.typeName}，获得了1个${craftable.level + 1}级${newEquipment.name}，属性更好，已自动装备！`);
            }
        } else {
            // 合成失败：返还一个原品质的装备
            const failedEquipment = this.generateCraftedEquipment(craftable.type, craftable.level, baseRarity);
            inventory.push(failedEquipment);
            this.addBattleLog(`合成${craftable.typeName}失败！`);
            this.addBattleLog(`消耗了3个${craftable.level}级${craftable.typeName}，只获得了1个${craftable.level}级${failedEquipment.name}！`);
        }
        
        // 合成后保存游戏状态
        this.saveGameState();
    }
    
    // 自动合成装备
    autoCraftEquipment() {
        let hasCraftable = true;
        let craftedCount = 0;
        
        // 循环合成，直到没有可合成的装备为止
        while (hasCraftable) {
            const craftableEquipment = this.checkCraftableEquipment();
            
            if (craftableEquipment.length === 0) {
                hasCraftable = false;
                break;
            }
            
            // 按等级从低到高排序，优先合成低等级装备
            craftableEquipment.sort((a, b) => a.level - b.level);
            
            // 合成第一个可合成的装备
            this.craftEquipment(craftableEquipment[0]);
            craftedCount++;
            
            // 限制最大合成次数，防止无限循环
            if (craftedCount >= 10) {
                break;
            }
        }
        
        if (craftedCount > 0) {
            this.addBattleLog(`自动合成完成！共合成了${craftedCount}次装备。`);
        } else {
            this.addBattleLog('没有可合成的装备！');
        }
    }
    
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
        
        // 保存游戏状态
        this.saveGameState();
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
    
    // 导出存档
    exportGame() {
        try {
            // 先保存当前的游戏状态到localStorage，确保导出的存档包含最新的游戏状态
            this.saveGame();
            
            // 收集所有用户的游戏状态
            const allUsersData = [];
            
            // 遍历localStorage，找出所有用户的游戏数据
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('endlessWinterGame_')) {
                    try {
                        const userData = JSON.parse(localStorage.getItem(key));
                        if (userData && userData.user) {
                            allUsersData.push({
                                userId: key.replace('endlessWinterGame_', ''),
                                gameState: userData
                            });
                        }
                    } catch (e) {
                        console.error('解析用户数据失败:', e);
                    }
                }
            }
            
            // 获取用户认证数据
            const usersAuthData = localStorage.getItem('endlessWinterUsers');
            let usersAuth;
            try {
                usersAuth = JSON.parse(usersAuthData || '{}');
            } catch (e) {
                console.error('解析用户认证数据失败:', e);
                usersAuth = {};
            }
            
            // 创建存档数据
            const saveData = {
                currentUser: this.gameState.user,
                allUsers: allUsersData,
                usersAuth: usersAuth,
                timestamp: new Date().toISOString(),
                version: "1.0"
            };
            
            // 转换为JSON字符串
            const jsonData = JSON.stringify(saveData, null, 2);
            
            // 创建Blob对象
            const blob = new Blob([jsonData], { type: 'application/json' });
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `endlessWinter_save_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            
            // 清理
            URL.revokeObjectURL(url);
            
            this.addBattleLog('存档导出成功！已导出所有用户数据！');
        } catch (error) {
            this.addBattleLog('存档导出失败！');
            console.error('导出存档失败:', error);
        }
    }
    
    // 导入存档
    importGame(file) {
        if (!file) return;
        
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const saveData = JSON.parse(e.target.result);
                    
                    // 验证存档数据
                    if (saveData.allUsers) {
                        // 导入所有用户的游戏状态
                        let importedUserCount = 0;
                        
                        // 遍历所有用户数据并保存
                        for (const userData of saveData.allUsers) {
                            if (userData.userId && userData.gameState) {
                                localStorage.setItem(`endlessWinterGame_${userData.userId}`, JSON.stringify(userData.gameState));
                                importedUserCount++;
                            }
                        }
                        
                        // 导入用户认证数据
                        if (saveData.usersAuth) {
                            localStorage.setItem('endlessWinterUsers', JSON.stringify(saveData.usersAuth));
                            console.log('用户认证数据导入成功');
                        }
                        
                        // 设置当前用户的游戏状态
                        if (saveData.currentUser) {
                            // 查找当前用户的游戏状态
                            const currentUserData = saveData.allUsers.find(user => 
                                user.userId === (saveData.currentUser.loggedIn ? saveData.currentUser.userId : 'guest')
                            );
                            
                            if (currentUserData) {
                                this.gameState = currentUserData.gameState;
                            }
                        } else if (saveData.allUsers.length > 0) {
                            // 如果没有指定当前用户，使用第一个用户的数据
                            this.gameState = saveData.allUsers[0].gameState;
                        }
                        
                        this.addBattleLog(`存档导入成功！已导入 ${importedUserCount} 个用户的数据！`);
                        this.updateUI();
                        
                        // 同时更新用户登录状态
                        if (this.gameState.user) {
                            localStorage.setItem('endlessWinterCurrentUser', JSON.stringify(this.gameState.user));
                        }
                    } else if (saveData.gameState) {
                        // 兼容旧版本存档格式
                        this.gameState = saveData.gameState;
                        this.addBattleLog('存档导入成功！（旧版本格式）');
                        this.updateUI();
                        
                        // 保存到本地存储（使用用户ID作为键）
                        const userId = this.gameState.user.loggedIn ? this.gameState.user.userId : 'guest';
                        localStorage.setItem(`endlessWinterGame_${userId}`, JSON.stringify(this.gameState));
                        
                        // 同时更新用户登录状态
                        if (this.gameState.user) {
                            localStorage.setItem('endlessWinterCurrentUser', JSON.stringify(this.gameState.user));
                        }
                    } else {
                        this.addBattleLog('无效的存档文件！');
                    }
                } catch (error) {
                    this.addBattleLog('存档解析失败！');
                    console.error('解析存档失败:', error);
                }
            };
            reader.onerror = () => {
                this.addBattleLog('文件读取失败！');
            };
            reader.readAsText(file);
        } catch (error) {
            this.addBattleLog('存档导入失败！');
            console.error('导入存档失败:', error);
        }
    }
    
    // 显示登录表单
    showLoginForm() {
        const username = prompt('请输入用户名:');
        const password = prompt('请输入密码:');
        
        if (username && password) {
            this.login(username, password);
        }
    }
    
    // 显示注册表单
    showRegisterForm() {
        const username = prompt('请输入新用户名:');
        const password = prompt('请输入新密码:');
        const confirmPassword = prompt('请确认密码:');
        const gender = prompt('请选择性别 (男/女):');
        
        if (username && password && password === confirmPassword && (gender === '男' || gender === '女')) {
            this.register(username, password, gender);
        } else if (password !== confirmPassword) {
            this.addBattleLog('密码确认不一致！');
        } else if (gender !== '男' && gender !== '女') {
            this.addBattleLog('请输入正确的性别 (男/女)！');
        }
    }
    
    // 登录
    login(username, password) {
        try {
            // 从本地存储获取用户数据
            console.log('开始登录，用户名:', username);
            const usersData = localStorage.getItem('endlessWinterUsers');
            console.log('用户数据:', usersData);
            
            let users;
            try {
                users = JSON.parse(usersData || '{}');
                console.log('解析后的用户数据:', users);
            } catch (parseError) {
                console.error('解析用户数据失败:', parseError);
                users = {};
                this.addBattleLog('用户数据损坏，正在修复...');
            }
            
            let isPasswordCorrect = false;
            let userGender = null;
            let needUpdateGender = false;
            
            // 检查用户是否存在
            if (!users[username]) {
                console.log('用户不存在:', username);
                
                // 检查是否存在对应的游戏状态数据
                const savedGame = localStorage.getItem(`endlessWinterGame_${username}`);
                if (savedGame) {
                    console.log('发现对应的游戏状态数据，提示用户创建密码');
                    // 如果存在游戏状态数据，提示用户设置新密码
                    const newPassword = prompt('用户不存在，但发现对应的游戏数据。请设置新密码以恢复账号:');
                    if (newPassword) {
                        // 创建新的用户认证数据
                        users[username] = {
                            password: newPassword,
                            gender: '男' // 默认性别，可以后续修改
                        };
                        localStorage.setItem('endlessWinterUsers', JSON.stringify(users));
                        this.addBattleLog('用户账号已恢复！请使用新设置的密码登录。');
                        return;
                    }
                }
                
                this.addBattleLog('登录失败！用户不存在。');
                return;
            }
            
            // 兼容旧的用户数据格式
            if (typeof users[username] === 'string') {
                // 旧格式：直接存储密码字符串
                isPasswordCorrect = users[username] === password;
                needUpdateGender = true;
                console.log('使用旧格式验证密码，结果:', isPasswordCorrect);
            } else if (users[username] && users[username].password) {
                // 新格式：存储包含password和gender的对象
                isPasswordCorrect = users[username].password === password;
                userGender = users[username].gender;
                needUpdateGender = !userGender;
                console.log('使用新格式验证密码，结果:', isPasswordCorrect);
            } else {
                console.log('用户数据格式错误:', users[username]);
                this.addBattleLog('登录失败！用户数据格式错误。');
                return;
            }
            
            if (isPasswordCorrect) {
                console.log('密码验证成功，开始加载游戏状态');
                // 如果需要更新性别信息
                if (needUpdateGender) {
                    const gender = prompt('请为您的账号选择性别 (男/女):');
                    if (gender === '男' || gender === '女') {
                        userGender = gender;
                        // 更新本地存储中的用户数据
                        users[username] = {
                            password: typeof users[username] === 'string' ? users[username] : users[username].password,
                            gender: gender
                        };
                        localStorage.setItem('endlessWinterUsers', JSON.stringify(users));
                        this.addBattleLog('性别信息已更新！');
                    }
                }
                
                // 保存当前游戏状态（如果用户已登录）
                if (this.gameState.user.loggedIn) {
                    const currentUserId = this.gameState.user.userId;
                    localStorage.setItem(`endlessWinterGame_${currentUserId}`, JSON.stringify(this.gameState));
                }
                
                // 加载用户对应的游戏状态
                const userId = username;
                const savedGame = localStorage.getItem(`endlessWinterGame_${userId}`);
                console.log('游戏状态数据:', savedGame);
                
                try {
                    if (savedGame) {
                        // 使用保存的游戏状态
                        this.gameState = JSON.parse(savedGame);
                        // 更新用户信息
                        this.gameState.user = {
                            loggedIn: true,
                            username: username,
                            userId: userId,
                            gender: userGender
                        };
                        console.log('游戏状态加载成功');
                    } else {
                        // 创建新的游戏状态
                        console.log('游戏状态不存在，创建新状态');
                        this.gameState.user = {
                            loggedIn: true,
                            username: username,
                            userId: userId,
                            gender: userGender
                        };
                        // 重置玩家属性
                        this.gameState.player = {
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
                        };
                    }
                } catch (gameLoadError) {
                    console.error('加载游戏状态失败:', gameLoadError);
                    this.addBattleLog('游戏数据损坏，正在创建新的游戏状态...');
                    // 创建新的游戏状态
                    this.gameState.user = {
                        loggedIn: true,
                        username: username,
                        userId: userId,
                        gender: userGender
                    };
                    // 重置玩家属性
                    this.gameState.player = {
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
                    };
                }
                
                this.addBattleLog(`登录成功！欢迎回来，${username}！`);
                this.updateUI();
                this.updateCharacterBodyImage();
                this.generateMiniMap(); // 刷新敌人，确保与用户等级匹配
                
                // 保存登录状态
                localStorage.setItem('endlessWinterCurrentUser', JSON.stringify(this.gameState.user));
                console.log('登录完成，状态已保存');
            } else {
                console.log('密码错误');
                this.addBattleLog('登录失败！密码错误。');
            }
        } catch (error) {
            console.error('登录过程中发生错误:', error);
            this.addBattleLog('登录失败！系统错误，请刷新页面重试。');
        }
    }
    
    // 注册
    register(username, password, gender) {
        try {
            // 从本地存储获取用户数据
            const users = JSON.parse(localStorage.getItem('endlessWinterUsers') || '{}');
            
            if (users[username]) {
                this.addBattleLog('注册失败！用户名已存在。');
            } else {
                // 注册成功
                users[username] = { password: password, gender: gender };
                localStorage.setItem('endlessWinterUsers', JSON.stringify(users));
                
                // 自动登录
                this.gameState.user = {
                    loggedIn: true,
                    username: username,
                    userId: username,
                    gender: gender
                };
                
                this.addBattleLog(`注册成功！欢迎，${username}！`);
                this.updateUI();
                this.updateCharacterBodyImage();
                this.generateMiniMap(); // 刷新敌人，确保与用户等级匹配
                
                // 保存登录状态
                localStorage.setItem('endlessWinterCurrentUser', JSON.stringify(this.gameState.user));
            }
        } catch (error) {
            this.addBattleLog('注册失败！');
            console.error('注册失败:', error);
        }
    }
    
    // 登出
    logout() {
        // 保存当前用户的游戏状态
        if (this.gameState.user.loggedIn) {
            const currentUserId = this.gameState.user.userId;
            localStorage.setItem(`endlessWinterGame_${currentUserId}`, JSON.stringify(this.gameState));
        }
        
        // 加载访客的游戏状态
        const guestId = 'guest';
        const savedGame = localStorage.getItem(`endlessWinterGame_${guestId}`);
        
        if (savedGame) {
            // 使用保存的访客游戏状态
            this.gameState = JSON.parse(savedGame);
            this.gameState.user = {
                loggedIn: false,
                username: "Guest",
                userId: "guest"
            };
        } else {
            // 创建新的访客游戏状态
            this.gameState.user = {
                loggedIn: false,
                username: "Guest",
                userId: "guest"
            };
            // 重置玩家属性
            this.gameState.player = {
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
            };
        }
        
        this.addBattleLog('登出成功！');
        this.updateUI();
        
        // 清除登录状态
        localStorage.removeItem('endlessWinterCurrentUser');
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
                this.gameState.resources.energy = this.gameState.resources.maxEnergy;
                this.addBattleLog(`使用了 ${item.name}，能量恢复满了！`);
                break;
            case 'attack':
                // 临时提升攻击力
                this.gameState.player.attack *= (1 + item.value);
                this.addBattleLog(`使用了 ${item.name}，攻击力提升了 ${item.value * 100}%！`);
                // 30秒后效果消失
                setTimeout(() => {
                    this.gameState.player.attack /= (1 + item.value);
                    this.addBattleLog(`${item.name}的效果消失了！`);
                    this.updateUI();
                }, 30000);
                break;
            case 'defense':
                // 临时提升防御力
                this.gameState.player.defense *= (1 + item.value);
                this.addBattleLog(`使用了 ${item.name}，防御力提升了 ${item.value * 100}%！`);
                // 30秒后效果消失
                setTimeout(() => {
                    this.gameState.player.defense /= (1 + item.value);
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
            
            if (inventory.length === 0) {
                this.addBattleLog('背包是空的！');
                return;
            }
            
            // 创建背包物品列表
            const itemList = inventory.map((item, index) => {
                let itemInfo = `${index + 1}. ${item.name}`;
                if (item.type === 'consumable') {
                    itemInfo += ` - ${item.description}`;
                } else {
                    if (item.stats) {
                        itemInfo += ` (${item.type}) - ${this.getStatsDescription(item.stats)}`;
                    } else {
                        itemInfo += ` (${item.type}) - 无属性`;
                    }
                }
                return itemInfo;
            }).join('\n');
            
            const choice = prompt(`背包物品:\n${itemList}\n\n输入物品编号查看详情，0 取消:`);
            
            if (choice === '0') {
                return;
            }
            
            if (choice) {
                const index = parseInt(choice) - 1;
                if (index >= 0 && index < inventory.length) {
                    const selectedItem = inventory[index];
                    if (selectedItem) {
                        let itemDetail = `物品: ${selectedItem.name}\n`;
                        itemDetail += `类型: ${selectedItem.type === 'consumable' ? '消耗品' : '装备'}\n`;
                        if (selectedItem.type === 'consumable') {
                            itemDetail += `描述: ${selectedItem.description || '无描述'}\n`;
                        } else {
                            itemDetail += `等级: ${selectedItem.level || 1}\n`;
                            if (selectedItem.stats) {
                                itemDetail += `属性: ${this.getStatsDescription(selectedItem.stats)}\n`;
                            } else {
                                itemDetail += `属性: 无\n`;
                            }
                            itemDetail += `品质: ${selectedItem.rarityDisplayName || '普通'}\n`;
                        }
                        
                        // 询问是否使用或装备
                        const action = prompt(`${itemDetail}\n\n选择操作:\n1. 使用/装备\n2. 丢弃\n3. 取消`);
                        
                        switch (action) {
                            case '1':
                                if (selectedItem.type === 'consumable') {
                                    // 使用消耗品
                                    inventory.splice(index, 1);
                                    this.useConsumable(selectedItem);
                                } else {
                                    // 装备物品
                                    const equippedItem = this.gameState.player.equipment[selectedItem.type];
                                    // 从背包中移除
                                    inventory.splice(index, 1);
                                    // 装备新物品
                                    this.equipItem(selectedItem);
                                }
                                break;
                            case '2':
                                // 丢弃物品
                                inventory.splice(index, 1);
                                this.addBattleLog(`已丢弃 ${selectedItem.name}！`);
                                break;
                            case '3':
                                // 取消
                                break;
                        }
                        
                        // 更新UI
                        this.updateUI();
                    }
                }
            }
        } catch (error) {
            console.error('显示背包失败:', error);
            this.addBattleLog('显示背包时出错，请重试！');
        }
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

// 检查THREE.js是否加载完成
function checkThreeJsLoaded() {
    if (typeof THREE !== 'undefined') {
        console.log('THREE.js 加载成功');
        window.game = new EndlessWinterGame();
    } else {
        console.log('等待 THREE.js 加载...');
        setTimeout(checkThreeJsLoaded, 100);
    }
}

// 初始化游戏
window.onload = function() {
    console.log('页面加载完成，开始检查 THREE.js');
    checkThreeJsLoaded();
};