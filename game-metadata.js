// 游戏元数据 - 共享的游戏数据

const gameMetadata = {
    // 装备品质定义（简化为5个品质：白、蓝、紫、金、彩）
    equipmentRarities: [
        { name: "white", displayName: "白色", multiplier: 1.0, statCount: 1 },
        { name: "blue", displayName: "蓝色", multiplier: 1.5, statCount: 2 },
        { name: "purple", displayName: "紫色", multiplier: 2.2, statCount: 3 },
        { name: "gold", displayName: "黄金", multiplier: 3.2, statCount: 4 },
        { name: "rainbow", displayName: "彩色", multiplier: 4.5, statCount: 5 }
    ],
    
    // 装备模板
    equipmentTemplates: [
        {
            type: "weapon",
            baseStats: { attack: 5, speed: 1, luck: 0.5, criticalRate: 0.05 },
            namePrefixes: ["", "玄铁", "龙泉", "青冥", "紫电", "赤霄", "太阴", "纯阳", "玄冰", "炎阳", "流光", "星陨", "龙渊", "凤羽"],
            nameSuffixes: ["剑", "长刀", "战斧", "长矛", "匕首", "大剑", "重剑", "弯刀", "戟", "枪", "棍", "扇", "箫", "琴"]
        },
        {
            type: "armor",
            baseStats: { defense: 3, hp: 5, speed: 0.5, dodgeRate: 0.05 },
            namePrefixes: ["", "玄铁", "金丝", "锁子", "青铜", "白银", "黄金", "紫金", "玄冰", "炎阳", "流光", "星陨", "龙鳞", "凤羽"],
            nameSuffixes: ["护甲", "胸甲", "锁甲", "板甲", "皮甲", "鳞甲", "宝甲", "战衣", "道袍", "法衣", "仙袍", "神甲", "圣甲", "天甲"]
        },
        {
            type: "helmet",
            baseStats: { defense: 2, hp: 10, luck: 1, accuracy: 0.1 },
            namePrefixes: ["", "玄铁", "青铜", "白银", "黄金", "紫金", "凤羽", "龙鳞", "玄冰", "炎阳", "流光", "星陨", "纯阳", "太阴"],
            nameSuffixes: ["头盔", "头冠", "兜帽", "面具", "战盔", "道冠", "宝冠", "凤冠", "龙冠", "仙冠", "神冠", "圣冠", "天冠", "法冠"]
        },
        {
            type: "boots",
            baseStats: { defense: 1, luck: 1, speed: 2, moveSpeed: 0.1 },
            namePrefixes: ["", "云纹", "风驰", "踏雪", "追星", "逐日", "腾云", "御空", "流光", "星陨", "玄冰", "炎阳", "龙鳞", "凤羽"],
            nameSuffixes: ["靴子", "战靴", "皮靴", "钢靴", "魔靴", "神靴", "仙靴", "道靴", "法靴", "云靴", "风靴", "火靴", "水靴", "土靴"]
        },
        {
            type: "pants",
            baseStats: { defense: 2, hp: 8, speed: 1, tenacity: 0.05 },
            namePrefixes: ["", "玄铁", "金丝", "锁子", "青铜", "白银", "黄金", "紫金", "玄冰", "炎阳", "流光", "星陨", "龙鳞", "凤羽"],
            nameSuffixes: ["长裤", "战裤", "皮裤", "钢裤", "魔裤", "神裤", "仙裤", "道裤", "法裤", "云裤", "风裤", "火裤", "水裤", "土裤"]
        },
        {
            type: "accessory",
            baseStats: { luck: 2, hp: 5, speed: 1, energyRegen: 0.5 },
            namePrefixes: ["", "通灵", "如意", "静心", "镇魂", "御魂", "封神", "辟邪", "招财", "纳福", "聚气", "凝神", "悟道", "升仙"],
            nameSuffixes: ["戒指", "项链", "护符", "徽章", "玉佩", "手串", "宝镜", "手镯", "耳环", "发簪", "腰坠", "脚链", "手链", "项圈"]
        }
    ],
    
    // 装备掉落概率配置（5个品质：白、蓝、紫、金、彩）
    dropRates: {
        // 普通怪物掉率
        normal: {
            white: 0.50,
            blue: 0.30,
            purple: 0.14,
            gold: 0.05,
            rainbow: 0.01
        },
        // 精英怪物掉率
        elite: {
            white: 0.30,
            blue: 0.35,
            purple: 0.20,
            gold: 0.12,
            rainbow: 0.03
        },
        // BOSS掉率
        boss: {
            white: 0.10,
            blue: 0.30,
            purple: 0.30,
            gold: 0.22,
            rainbow: 0.08
        }
    },
    
    // 敌人类型
    enemyTypes: [
        {
            name: "雪原狼",
            baseHp: 30,
            baseAttack: 8,
            baseDefense: 2,
            baseSpeed: 12,
            baseAccuracy: 95,
            baseDodge: 15,
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
            baseSpeed: 8,
            baseAccuracy: 90,
            baseDodge: 5,
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
            baseSpeed: 6,
            baseAccuracy: 85,
            baseDodge: 3,
            expMultiplier: 2,
            resourceMultiplier: 1.5,
            icon: "fa-user",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20frost%20giant%2C%20cute%20style%2C%20winter%20theme%2C%20simple%20background&size=512x512"
        },
        {
            name: "妖狐王",
            baseHp: 650,
            baseAttack: 60,
            baseDefense: 18,
            baseSpeed: 16,
            baseAccuracy: 96,
            baseDodge: 28,
            expMultiplier: 2.3,
            resourceMultiplier: 1.55,
            icon: "fa-cat",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20fox%20king%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        // 海滩地图敌人 (Realm 1)
        {
            name: "蟹将",
            baseHp: 60,
            baseAttack: 10,
            baseDefense: 6,
            baseSpeed: 6,
            baseAccuracy: 88,
            baseDodge: 8,
            expMultiplier: 1.6,
            resourceMultiplier: 1.25,
            icon: "fa-grip-lines",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20crab%20general%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "虾兵",
            baseHp: 50,
            baseAttack: 9,
            baseDefense: 5,
            baseSpeed: 8,
            baseAccuracy: 90,
            baseDodge: 10,
            expMultiplier: 1.5,
            resourceMultiplier: 1.2,
            icon: "fa-shrimp",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20shrimp%20soldier%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "贝壳精",
            baseHp: 60,
            baseAttack: 10,
            baseDefense: 6,
            baseSpeed: 5,
            baseAccuracy: 85,
            baseDodge: 6,
            expMultiplier: 1.5,
            resourceMultiplier: 1.2,
            icon: "fa-circle",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20shell%20spirit%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "海马精",
            baseHp: 90,
            baseAttack: 16,
            baseDefense: 7,
            baseSpeed: 9,
            baseAccuracy: 92,
            baseDodge: 14,
            expMultiplier: 2.0,
            resourceMultiplier: 1.4,
            icon: "fa-horse",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20seahorse%20spirit%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        // 平原地图敌人 (Realm 2)
        {
            name: "草原狮",
            baseHp: 80,
            baseAttack: 18,
            baseDefense: 8,
            baseSpeed: 10,
            baseAccuracy: 92,
            baseDodge: 12,
            expMultiplier: 2.0,
            resourceMultiplier: 1.4,
            icon: "fa-cat",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20grassland%20lion%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "花豹",
            baseHp: 100,
            baseAttack: 19,
            baseDefense: 7,
            baseSpeed: 14,
            baseAccuracy: 94,
            baseDodge: 18,
            expMultiplier: 2.2,
            resourceMultiplier: 1.5,
            icon: "fa-paw",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20leopard%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "草原之王",
            baseHp: 250,
            baseAttack: 36,
            baseDefense: 12,
            baseSpeed: 11,
            baseAccuracy: 95,
            baseDodge: 15,
            expMultiplier: 3.5,
            resourceMultiplier: 2.5,
            icon: "fa-crown",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20king%20of%20grassland%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        // 峡谷地图敌人 (Realm 3)
        {
            name: "峡谷之风",
            baseHp: 130,
            baseAttack: 25,
            baseDefense: 6,
            baseSpeed: 18,
            baseAccuracy: 93,
            baseDodge: 20,
            expMultiplier: 2.4,
            resourceMultiplier: 1.6,
            icon: "fa-wind",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20canyon%20wind%20spirit%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "秃鹫",
            baseHp: 130,
            baseAttack: 22,
            baseDefense: 7,
            baseSpeed: 13,
            baseAccuracy: 90,
            baseDodge: 14,
            expMultiplier: 2.3,
            resourceMultiplier: 1.55,
            icon: "fa-dove",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20vulture%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "岩蛇",
            baseHp: 140,
            baseAttack: 24,
            baseDefense: 9,
            baseSpeed: 9,
            baseAccuracy: 88,
            baseDodge: 10,
            expMultiplier: 2.5,
            resourceMultiplier: 1.7,
            icon: "fa-strikethrough",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20rock%20snake%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "峡谷领主",
            baseHp: 320,
            baseAttack: 49,
            baseDefense: 18,
            baseSpeed: 12,
            baseAccuracy: 95,
            baseDodge: 16,
            expMultiplier: 4.0,
            resourceMultiplier: 3.0,
            icon: "fa-chess-king",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20canyon%20lord%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        // 沙漠地图敌人 (Realm 3)
        {
            name: "沙暴魔",
            baseHp: 200,
            baseAttack: 34,
            baseDefense: 12,
            baseSpeed: 16,
            baseAccuracy: 88,
            baseDodge: 18,
            expMultiplier: 3.2,
            resourceMultiplier: 2.2,
            icon: "fa-tornado",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20sandstorm%20demon%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "仙人掌精",
            baseHp: 200,
            baseAttack: 28,
            baseDefense: 12,
            baseSpeed: 7,
            baseAccuracy: 85,
            baseDodge: 8,
            expMultiplier: 2.8,
            resourceMultiplier: 1.9,
            icon: "fa-tree",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20cactus%20spirit%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "沙漠之王",
            baseHp: 325,
            baseAttack: 52,
            baseDefense: 17,
            baseSpeed: 13,
            baseAccuracy: 94,
            baseDodge: 17,
            expMultiplier: 4.2,
            resourceMultiplier: 3.2,
            icon: "fa-crown",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20king%20of%20desert%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        // 湖泊地图敌人 (Realm 4)
        {
            name: "鲤鱼精",
            baseHp: 150,
            baseAttack: 24,
            baseDefense: 8,
            baseSpeed: 10,
            baseAccuracy: 90,
            baseDodge: 12,
            expMultiplier: 2.6,
            resourceMultiplier: 1.8,
            icon: "fa-fish",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20carp%20spirit%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "淡水鲛人",
            baseHp: 280,
            baseAttack: 44,
            baseDefense: 16,
            baseSpeed: 11,
            baseAccuracy: 92,
            baseDodge: 16,
            expMultiplier: 3.8,
            resourceMultiplier: 2.6,
            icon: "fa-swimmer",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20mermaid%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "湖妖",
            baseHp: 320,
            baseAttack: 48,
            baseDefense: 20,
            baseSpeed: 12,
            baseAccuracy: 93,
            baseDodge: 18,
            expMultiplier: 4.2,
            resourceMultiplier: 2.9,
            icon: "fa-water",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20lake%20demon%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "湖怪",
            baseHp: 500,
            baseAttack: 68,
            baseDefense: 29,
            baseSpeed: 10,
            baseAccuracy: 90,
            baseDodge: 12,
            expMultiplier: 5.5,
            resourceMultiplier: 4.0,
            icon: "fa-dragon",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20lake%20monster%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "湖龙王",
            baseHp: 580,
            baseAttack: 76,
            baseDefense: 33,
            baseSpeed: 13,
            baseAccuracy: 96,
            baseDodge: 20,
            expMultiplier: 6.5,
            resourceMultiplier: 5.0,
            icon: "fa-crown",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20lake%20dragon%20king%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        // 洞穴地图敌人 (Realm 5)
        {
            name: "暗影蝙蝠",
            baseHp: 370,
            baseAttack: 54,
            baseDefense: 17,
            baseSpeed: 18,
            baseAccuracy: 94,
            baseDodge: 24,
            expMultiplier: 4.5,
            resourceMultiplier: 3.2,
            icon: "fa-moon",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20shadow%20bat%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "地下蠕虫",
            baseHp: 490,
            baseAttack: 67,
            baseDefense: 27,
            baseSpeed: 8,
            baseAccuracy: 86,
            baseDodge: 10,
            expMultiplier: 5.8,
            resourceMultiplier: 4.2,
            icon: "fa-worm",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20underground%20worm%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        // 仙境地图敌人 (Realm 5)
        {
            name: "云兽",
            baseHp: 430,
            baseAttack: 63,
            baseDefense: 24,
            baseSpeed: 16,
            baseAccuracy: 95,
            baseDodge: 22,
            expMultiplier: 5.2,
            resourceMultiplier: 3.8,
            icon: "fa-cloud",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20cloud%20beast%2C%20chinese%20mythology%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "山精",
            baseHp: 60,
            baseAttack: 14,
            baseDefense: 5,
            baseSpeed: 7,
            baseAccuracy: 88,
            baseDodge: 8,
            expMultiplier: 1.8,
            resourceMultiplier: 1.3,
            icon: "fa-tree",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20mountain%20spirit%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "水怪",
            baseHp: 150,
            baseAttack: 24,
            baseDefense: 8,
            baseSpeed: 10,
            baseAccuracy: 90,
            baseDodge: 12,
            expMultiplier: 1.7,
            resourceMultiplier: 1.28,
            icon: "fa-tint",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20water%20monster%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "火灵",
            baseHp: 200,
            baseAttack: 28,
            baseDefense: 6,
            baseSpeed: 11,
            baseAccuracy: 90,
            baseDodge: 18,
            expMultiplier: 1.4,
            resourceMultiplier: 1.15,
            icon: "fa-fire",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20fire%20spirit%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "土妖",
            baseHp: 850,
            baseAttack: 68,
            baseDefense: 32,
            baseSpeed: 7,
            baseAccuracy: 86,
            baseDodge: 6,
            expMultiplier: 2.3,
            resourceMultiplier: 1.65,
            icon: "fa-mountain",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20earth%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "风魔",
            baseHp: 360,
            baseAttack: 48,
            baseDefense: 10,
            baseSpeed: 16,
            baseAccuracy: 93,
            baseDodge: 22,
            expMultiplier: 1.7,
            resourceMultiplier: 1.3,
            icon: "fa-wind",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20wind%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "雷兽",
            baseHp: 580,
            baseAttack: 66,
            baseDefense: 16,
            baseSpeed: 13,
            baseAccuracy: 92,
            baseDodge: 15,
            expMultiplier: 2.0,
            resourceMultiplier: 1.4,
            icon: "fa-bolt",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20thunder%20beast%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "山妖",
            baseHp: 40,
            baseAttack: 10,
            baseDefense: 3,
            baseSpeed: 8,
            baseAccuracy: 89,
            baseDodge: 10,
            expMultiplier: 1.7,
            resourceMultiplier: 1.3,
            icon: "fa-mountain",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20mountain%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "岩怪",
            baseHp: 680,
            baseAttack: 48,
            baseDefense: 24,
            baseSpeed: 4,
            baseAccuracy: 85,
            baseDodge: 3,
            expMultiplier: 1.9,
            resourceMultiplier: 1.4,
            icon: "fa-mountain",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20rock%20golem%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "神雕",
            baseHp: 45,
            baseAttack: 11,
            baseDefense: 3,
            baseSpeed: 18,
            baseAccuracy: 94,
            baseDodge: 25,
            expMultiplier: 1.6,
            resourceMultiplier: 1.2,
            icon: "fa-dove",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20celestial%20eagle%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "石精",
            baseHp: 600,
            baseAttack: 52,
            baseDefense: 20,
            baseSpeed: 5,
            baseAccuracy: 87,
            baseDodge: 5,
            expMultiplier: 1.8,
            resourceMultiplier: 1.35,
            icon: "fa-mountain",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20stone%20spirit%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "山魈",
            baseHp: 50,
            baseAttack: 11,
            baseDefense: 4,
            baseSpeed: 10,
            baseAccuracy: 90,
            baseDodge: 12,
            expMultiplier: 1.75,
            resourceMultiplier: 1.3,
            icon: "fa-user",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20mountain%20spirit%20monkey%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "树精",
            baseHp: 280,
            baseAttack: 28,
            baseDefense: 12,
            baseSpeed: 6,
            baseAccuracy: 88,
            baseDodge: 8,
            expMultiplier: 1.8,
            resourceMultiplier: 1.3,
            icon: "fa-tree",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20tree%20spirit%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "花妖",
            baseHp: 200,
            baseAttack: 30,
            baseDefense: 8,
            baseSpeed: 12,
            baseAccuracy: 91,
            baseDodge: 18,
            expMultiplier: 1.5,
            resourceMultiplier: 1.15,
            icon: "fa-leaf",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20flower%20spirit%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "狐仙",
            baseHp: 250,
            baseAttack: 32,
            baseDefense: 9,
            baseSpeed: 15,
            baseAccuracy: 95,
            baseDodge: 22,
            expMultiplier: 1.6,
            resourceMultiplier: 1.2,
            icon: "fa-cat",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20fox%20fairy%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "鹿灵",
            baseHp: 400,
            baseAttack: 42,
            baseDefense: 12,
            baseSpeed: 14,
            baseAccuracy: 92,
            baseDodge: 20,
            expMultiplier: 1.6,
            resourceMultiplier: 1.2,
            icon: "fa-paw",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20deer%20spirit%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "木怪",
            baseHp: 550,
            baseAttack: 48,
            baseDefense: 18,
            baseSpeed: 7,
            baseAccuracy: 87,
            baseDodge: 7,
            expMultiplier: 1.7,
            resourceMultiplier: 1.25,
            icon: "fa-tree",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20wood%20monster%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "藤蔓怪",
            baseHp: 180,
            baseAttack: 26,
            baseDefense: 12,
            baseSpeed: 8,
            baseAccuracy: 88,
            baseDodge: 10,
            expMultiplier: 1.6,
            resourceMultiplier: 1.2,
            icon: "fa-leaf",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20vine%20monster%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "森林蜘蛛",
            baseHp: 160,
            baseAttack: 32,
            baseDefense: 8,
            baseSpeed: 12,
            baseAccuracy: 92,
            baseDodge: 18,
            expMultiplier: 1.5,
            resourceMultiplier: 1.15,
            icon: "fa-spider",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20forest%20spider%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "花仙子",
            baseHp: 130,
            baseAttack: 28,
            baseDefense: 6,
            baseSpeed: 14,
            baseAccuracy: 94,
            baseDodge: 22,
            expMultiplier: 1.45,
            resourceMultiplier: 1.1,
            icon: "fa-seedling",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20flower%20fairy%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "森林守护者",
            baseHp: 520,
            baseAttack: 42,
            baseDefense: 24,
            baseSpeed: 9,
            baseAccuracy: 90,
            baseDodge: 12,
            expMultiplier: 2.0,
            resourceMultiplier: 1.5,
            icon: "fa-tree-alt",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20forest%20guardian%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "蛟蛇",
            baseHp: 180,
            baseAttack: 28,
            baseDefense: 12,
            baseSpeed: 13,
            baseAccuracy: 91,
            baseDodge: 16,
            expMultiplier: 1.95,
            resourceMultiplier: 1.38,
            icon: "fa-dragon",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20flood%20dragon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "龟妖",
            baseHp: 220,
            baseAttack: 20,
            baseDefense: 18,
            baseSpeed: 5,
            baseAccuracy: 87,
            baseDodge: 3,
            expMultiplier: 2.0,
            resourceMultiplier: 1.4,
            icon: "fa-tint",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20turtle%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "鱼精",
            baseHp: 120,
            baseAttack: 22,
            baseDefense: 6,
            baseSpeed: 14,
            baseAccuracy: 91,
            baseDodge: 20,
            expMultiplier: 1.5,
            resourceMultiplier: 1.2,
            icon: "fa-tint",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20fish%20spirit%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "水仙",
            baseHp: 480,
            baseAttack: 55,
            baseDefense: 18,
            baseSpeed: 14,
            baseAccuracy: 94,
            baseDodge: 18,
            expMultiplier: 1.7,
            resourceMultiplier: 1.25,
            icon: "fa-tint",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20water%20fairy%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "沙妖",
            baseHp: 180,
            baseAttack: 32,
            baseDefense: 15,
            baseSpeed: 10,
            baseAccuracy: 89,
            baseDodge: 10,
            expMultiplier: 1.65,
            resourceMultiplier: 1.28,
            icon: "fa-mountain",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20sand%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "蝎精",
            baseHp: 190,
            baseAttack: 32,
            baseDefense: 14,
            baseSpeed: 11,
            baseAccuracy: 92,
            baseDodge: 12,
            expMultiplier: 1.75,
            resourceMultiplier: 1.3,
            icon: "fa-bug",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20scorpion%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "蛇怪",
            baseHp: 60,
            baseAttack: 16,
            baseDefense: 3,
            baseSpeed: 12,
            baseAccuracy: 91,
            baseDodge: 15,
            expMultiplier: 1.55,
            resourceMultiplier: 1.2,
            icon: "fa-dragon",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20snake%20monster%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "沙漠巨蜥",
            baseHp: 210,
            baseAttack: 30,
            baseDefense: 16,
            baseSpeed: 8,
            baseAccuracy: 88,
            baseDodge: 8,
            expMultiplier: 1.85,
            resourceMultiplier: 1.35,
            icon: "fa-dragon",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20desert%20lizard%20giant%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "沙虫",
            baseHp: 80,
            baseAttack: 13,
            baseDefense: 5,
            baseSpeed: 7,
            baseAccuracy: 87,
            baseDodge: 7,
            expMultiplier: 1.7,
            resourceMultiplier: 1.3,
            icon: "fa-bug",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20sand%20worm%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "洞穴蝙蝠",
            baseHp: 380,
            baseAttack: 52,
            baseDefense: 10,
            baseSpeed: 19,
            baseAccuracy: 94,
            baseDodge: 25,
            expMultiplier: 1.2,
            resourceMultiplier: 1.05,
            icon: "fa-bat",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20cave%20bat%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "蜘蛛精",
            baseHp: 450,
            baseAttack: 56,
            baseDefense: 12,
            baseSpeed: 10,
            baseAccuracy: 91,
            baseDodge: 15,
            expMultiplier: 1.5,
            resourceMultiplier: 1.15,
            icon: "fa-bug",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20spider%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "蚯蚓怪",
            baseHp: 600,
            baseAttack: 48,
            baseDefense: 18,
            baseSpeed: 6,
            baseAccuracy: 86,
            baseDodge: 6,
            expMultiplier: 1.6,
            resourceMultiplier: 1.2,
            icon: "fa-bug",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20earthworm%20monster%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "洞穴幽灵",
            baseHp: 400,
            baseAttack: 60,
            baseDefense: 10,
            baseSpeed: 14,
            baseAccuracy: 93,
            baseDodge: 20,
            expMultiplier: 1.5,
            resourceMultiplier: 1.15,
            icon: "fa-ghost",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20cave%20ghost%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "熔岩巨兽",
            baseHp: 420,
            baseAttack: 38,
            baseDefense: 18,
            baseSpeed: 6,
            baseAccuracy: 85,
            baseDodge: 5,
            expMultiplier: 1.85,
            resourceMultiplier: 1.4,
            icon: "fa-fire",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20lava%20beast%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "凤凰",
            baseHp: 620,
            baseAttack: 65,
            baseDefense: 15,
            baseSpeed: 17,
            baseAccuracy: 95,
            baseDodge: 22,
            expMultiplier: 2.0,
            resourceMultiplier: 1.45,
            icon: "fa-fire",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20phoenix%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "火凤凰",
            baseHp: 550,
            baseAttack: 68,
            baseDefense: 16,
            baseSpeed: 18,
            baseAccuracy: 96,
            baseDodge: 25,
            expMultiplier: 2.0,
            resourceMultiplier: 1.45,
            icon: "fa-fire",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20fire%20phoenix%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "熔岩史莱姆",
            baseHp: 180,
            baseAttack: 24,
            baseDefense: 10,
            baseSpeed: 6,
            baseAccuracy: 88,
            baseDodge: 5,
            expMultiplier: 1.35,
            resourceMultiplier: 1.15,
            icon: "fa-circle",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20lava%20slime%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "火焰精",
            baseHp: 320,
            baseAttack: 38,
            baseDefense: 10,
            baseSpeed: 12,
            baseAccuracy: 90,
            baseDodge: 15,
            expMultiplier: 1.6,
            resourceMultiplier: 1.25,
            icon: "fa-fire-alt",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20fire%20spirit%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "火山领主",
            baseHp: 720,
            baseAttack: 70,
            baseDefense: 28,
            baseSpeed: 8,
            baseAccuracy: 88,
            baseDodge: 8,
            expMultiplier: 2.5,
            resourceMultiplier: 1.75,
            icon: "fa-volcano",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20volcano%20lord%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "仙鹤",
            baseHp: 280,
            baseAttack: 38,
            baseDefense: 8,
            baseSpeed: 18,
            baseAccuracy: 94,
            baseDodge: 26,
            expMultiplier: 1.65,
            resourceMultiplier: 1.25,
            icon: "fa-dove",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20celestial%20crane%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "麒麟",
            baseHp: 620,
            baseAttack: 60,
            baseDefense: 18,
            baseSpeed: 12,
            baseAccuracy: 92,
            baseDodge: 15,
            expMultiplier: 2.1,
            resourceMultiplier: 1.55,
            icon: "fa-dragon",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20qilin%20mythical%20beast%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "龙王",
            baseHp: 720,
            baseAttack: 72,
            baseDefense: 28,
            baseSpeed: 10,
            baseAccuracy: 93,
            baseDodge: 12,
            expMultiplier: 2.3,
            resourceMultiplier: 1.65,
            icon: "fa-dragon",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20dragon%20king%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "风神",
            baseHp: 420,
            baseAttack: 60,
            baseDefense: 14,
            baseSpeed: 18,
            baseAccuracy: 96,
            baseDodge: 28,
            expMultiplier: 2.0,
            resourceMultiplier: 1.45,
            icon: "fa-wind",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20wind%20god%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "天将",
            baseHp: 480,
            baseAttack: 64,
            baseDefense: 20,
            baseSpeed: 14,
            baseAccuracy: 94,
            baseDodge: 16,
            expMultiplier: 2.1,
            resourceMultiplier: 1.5,
            icon: "fa-user-shield",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20celestial%20general%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "仙人",
            baseHp: 450,
            baseAttack: 62,
            baseDefense: 14,
            baseSpeed: 16,
            baseAccuracy: 95,
            baseDodge: 24,
            expMultiplier: 1.95,
            resourceMultiplier: 1.42,
            icon: "fa-user-tie",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20immortal%20sage%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "天女",
            baseHp: 240,
            baseAttack: 34,
            baseDefense: 6,
            baseSpeed: 16,
            baseAccuracy: 95,
            baseDodge: 28,
            expMultiplier: 1.75,
            resourceMultiplier: 1.3,
            icon: "fa-feather-alt",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20celestial%20maiden%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "元始天尊",
            baseHp: 880,
            baseAttack: 82,
            baseDefense: 35,
            baseSpeed: 12,
            baseAccuracy: 97,
            baseDodge: 18,
            expMultiplier: 2.8,
            resourceMultiplier: 1.95,
            icon: "fa-crown",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20primordial%20celestial%20lord%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "海妖",
            baseHp: 420,
            baseAttack: 48,
            baseDefense: 14,
            baseSpeed: 11,
            baseAccuracy: 90,
            baseDodge: 15,
            expMultiplier: 1.7,
            resourceMultiplier: 1.3,
            icon: "fa-tint",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20sea%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "海怪",
            baseHp: 680,
            baseAttack: 62,
            baseDefense: 24,
            baseSpeed: 7,
            baseAccuracy: 88,
            baseDodge: 8,
            expMultiplier: 1.95,
            resourceMultiplier: 1.4,
            icon: "fa-tint",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20sea%20monster%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "鲛人",
            baseHp: 380,
            baseAttack: 42,
            baseDefense: 12,
            baseSpeed: 13,
            baseAccuracy: 92,
            baseDodge: 18,
            expMultiplier: 1.65,
            resourceMultiplier: 1.25,
            icon: "fa-user",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20mermaid%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "草原狼",
            baseHp: 55,
            baseAttack: 16,
            baseDefense: 4,
            baseSpeed: 14,
            baseAccuracy: 92,
            baseDodge: 18,
            expMultiplier: 1.5,
            resourceMultiplier: 1.2,
            icon: "fa-wolf-pack",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20grassland%20wolf%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "野牛精",
            baseHp: 75,
            baseAttack: 14,
            baseDefense: 6,
            baseSpeed: 8,
            baseAccuracy: 88,
            baseDodge: 7,
            expMultiplier: 1.6,
            resourceMultiplier: 1.25,
            icon: "fa-cow",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20wild%20bull%20spirit%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "鹰妖",
            baseHp: 50,
            baseAttack: 16,
            baseDefense: 3,
            baseSpeed: 16,
            baseAccuracy: 94,
            baseDodge: 22,
            expMultiplier: 1.55,
            resourceMultiplier: 1.2,
            icon: "fa-dove",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20eagle%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "草原巨兽",
            baseHp: 130,
            baseAttack: 23,
            baseDefense: 10,
            baseSpeed: 6,
            baseAccuracy: 86,
            baseDodge: 5,
            expMultiplier: 1.85,
            resourceMultiplier: 1.35,
            icon: "fa-paw",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20grassland%20giant%20beast%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "风狼",
            baseHp: 60,
            baseAttack: 17,
            baseDefense: 4,
            baseSpeed: 15,
            baseAccuracy: 93,
            baseDodge: 20,
            expMultiplier: 1.65,
            resourceMultiplier: 1.25,
            icon: "fa-wolf-pack",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20wind%20wolf%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "游侠",
            baseHp: 65,
            baseAttack: 18,
            baseDefense: 5,
            baseSpeed: 12,
            baseAccuracy: 95,
            baseDodge: 15,
            expMultiplier: 1.7,
            resourceMultiplier: 1.3,
            icon: "fa-user",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20wandering%20swordsman%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "峡谷巨鹰",
            baseHp: 90,
            baseAttack: 20,
            baseDefense: 6,
            baseSpeed: 17,
            baseAccuracy: 94,
            baseDodge: 20,
            expMultiplier: 1.9,
            resourceMultiplier: 1.4,
            icon: "fa-dove",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20canyon%20giant%20eagle%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "石巨人",
            baseHp: 130,
            baseAttack: 19,
            baseDefense: 12,
            baseSpeed: 5,
            baseAccuracy: 85,
            baseDodge: 3,
            expMultiplier: 2.0,
            resourceMultiplier: 1.45,
            icon: "fa-mountain",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20stone%20golem%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "峡谷蜥蜴",
            baseHp: 85,
            baseAttack: 17,
            baseDefense: 8,
            baseSpeed: 11,
            baseAccuracy: 89,
            baseDodge: 10,
            expMultiplier: 1.75,
            resourceMultiplier: 1.3,
            icon: "fa-dragon",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20canyon%20lizard%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "鹰王",
            baseHp: 100,
            baseAttack: 22,
            baseDefense: 7,
            baseSpeed: 19,
            baseAccuracy: 95,
            baseDodge: 23,
            expMultiplier: 2.05,
            resourceMultiplier: 1.5,
            icon: "fa-dove",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20eagle%20king%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        }
    ],
    
    // 地图与敌人的映射关系
    mapEnemyMapping: {
        "xianxia-mountain": ["雪原狼", "冰原熊", "山妖", "岩怪", "神雕", "石精", "山魈", "山精", "冰霜巨人", "麒麟"],
        "xianxia-beach": ["鱼精", "蟹将", "虾兵", "鲛人", "贝壳精", "海马精", "海妖", "海怪", "龙王"],
        "xianxia-plains": ["草原狼", "野牛精", "鹰妖", "草原巨兽", "草原狮", "游侠", "风狼", "花豹", "草原之王"],
        "xianxia-canyon": ["峡谷巨鹰", "石巨人", "峡谷之风", "岩怪", "峡谷蜥蜴", "鹰王", "秃鹫", "岩蛇", "峡谷领主"],
        "xianxia-desert": ["沙妖", "蝎精", "蛇怪", "沙漠巨蜥", "沙虫", "沙暴魔", "土妖", "仙人掌精", "沙漠之王"],
        "xianxia-lake": ["水怪", "蛟蛇", "龟妖", "鲤鱼精", "水仙", "淡水鲛人", "湖妖", "湖怪", "湖龙王"],
        "xianxia-forest": ["树精", "花妖", "狐仙", "鹿灵", "木怪", "藤蔓怪", "森林蜘蛛", "花仙子", "妖狐王", "森林守护者"],
        "xianxia-volcano": ["火灵", "熔岩史莱姆", "火焰精", "熔岩巨兽", "火凤凰", "凤凰", "火山领主"],
        "xianxia-cave": ["洞穴蝙蝠", "蜘蛛精", "蚯蚓怪", "洞穴幽灵", "土妖", "岩怪", "石精", "暗影蝙蝠", "地下蠕虫"],
        "xianxia-heaven": ["天女", "仙鹤", "云兽", "雷兽", "风神", "天将", "仙人", "元始天尊"]
    },

    // 地图境界需求（替代旧的 mapLevelRanges）- 按线性路线配置
    mapRealmRequirements: {
        "xianxia-mountain":  { realm: 0, name: "武者" },   // 起始地图
        "xianxia-beach":     { realm: 1, name: "炼气" },
        "xianxia-plains":    { realm: 2, name: "筑基" },
        "xianxia-canyon":    { realm: 3, name: "金丹" },
        "xianxia-desert":    { realm: 3, name: "金丹" },
        "xianxia-lake":      { realm: 4, name: "元婴" },
        "xianxia-forest":    { realm: 4, name: "元婴" },
        "xianxia-volcano":   { realm: 4, name: "元婴" },
        "xianxia-cave":      { realm: 5, name: "化神" },
        "xianxia-heaven":    { realm: 5, name: "化神" }
    },

    // 地图连接关系
    mapConnections: {
        "xianxia-mountain": ["xianxia-beach", "xianxia-forest"],
        "xianxia-beach": ["xianxia-mountain", "xianxia-forest"],
        "xianxia-forest": ["xianxia-mountain", "xianxia-beach", "xianxia-plains", "xianxia-lake"],
        "xianxia-plains": ["xianxia-forest", "xianxia-lake", "xianxia-canyon"],
        "xianxia-lake": ["xianxia-forest", "xianxia-plains", "xianxia-canyon", "xianxia-desert"],
        "xianxia-canyon": ["xianxia-plains", "xianxia-lake", "xianxia-desert", "xianxia-cave", "xianxia-heaven"],
        "xianxia-desert": ["xianxia-lake", "xianxia-canyon", "xianxia-cave"],
        "xianxia-cave": ["xianxia-canyon", "xianxia-desert", "xianxia-heaven", "xianxia-volcano"],
        "xianxia-heaven": ["xianxia-canyon", "xianxia-cave", "xianxia-volcano"],
        "xianxia-volcano": ["xianxia-cave", "xianxia-heaven"]
    },

    // 地图奖励倍率（按境界递进）
    mapRewardMultipliers: {
        "xianxia-mountain":  { exp: 1.0, dropRate: 1.0 },
        "xianxia-beach":     { exp: 1.2, dropRate: 1.1 },
        "xianxia-forest":    { exp: 1.5, dropRate: 1.2 },
        "xianxia-plains":    { exp: 2.0, dropRate: 1.4 },
        "xianxia-lake":      { exp: 2.0, dropRate: 1.4 },
        "xianxia-canyon":    { exp: 3.0, dropRate: 1.8 },
        "xianxia-desert":    { exp: 3.0, dropRate: 1.8 },
        "xianxia-cave":      { exp: 3.0, dropRate: 1.8 },
        "xianxia-heaven":    { exp: 4.0, dropRate: 2.2 },
        "xianxia-volcano":   { exp: 4.0, dropRate: 2.2 }
    },
    
    // 技能树系统（新的升级系统）
    realmSkills: [
        // 武者境 (Realm 0) - 4个技能树
        {
            id: 'powerStrike',
            name: '强力打击系',
            realmRequired: 0,
            type: 'attack',
            // 统一资源配置
            baseDisplayName: '重击',
            baseImageId: 1,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
            baseEffectColor: { r: 1, g: 0.3, b: 0 },
            levels: [
                {
                    name: 'heavyStrike_lv1',
                    description: '凝聚力量，造成1.3倍伤害',
                    stageRequired: 1,
                    energyCost: 12,
                    damageMultiplier: 1.3
                },
                {
                    name: 'heavyStrike_lv2',
                    description: '全力一击，造成1.5倍伤害',
                    stageRequired: 4,
                    energyCost: 14,
                    damageMultiplier: 1.5
                },
                {
                    name: 'heavyStrike_lv3',
                    description: '爆发力量，造成1.7倍伤害',
                    stageRequired: 7,
                    energyCost: 16,
                    damageMultiplier: 1.7
                },
                {
                    name: 'heavyStrike_lv4',
                    description: '武者境巅峰，造成1.9倍伤害，+5%暴击率',
                    stageRequired: 10,
                    energyCost: 20,
                    damageMultiplier: 1.9,
                    criticalBonus: 0.05
                }
            ]
        },
        {
            id: 'ironSkin',
            name: '铁布衫系',
            realmRequired: 0,
            type: 'defense',
            // 统一资源配置
            baseDisplayName: '铁布衫',
            baseImageId: 2,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
            baseEffectColor: { r: 1, g: 0.8, b: 0 },
            levels: [
                {
                    name: 'ironSkin_lv1',
                    description: '防御姿态，减伤35%',
                    stageRequired: 7,
                    energyCost: 18,
                    defenseBonus: 0.35
                },
                {
                    name: 'ironSkin_lv2',
                    description: '强化防御，减伤45%',
                    stageRequired: 10,
                    energyCost: 25,
                    defenseBonus: 0.45
                }
            ]
        },
        {
            id: 'enduranceRecovery',
            name: '耐力恢复系',
            realmRequired: 0,
            type: 'recovery',
            baseDisplayName: '耐力恢复',
            baseImageId: 3,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
            baseEffectColor: { r: 0.2, g: 1, b: 0.2 },
            levels: [
                {
                    name: 'enduranceRecovery_lv1',
                    description: '恢复12%最大HP',
                    stageRequired: 4,
                    energyCost: 18,
                    healPercentage: 0.12
                },
                {
                    name: 'enduranceRecovery_lv2',
                    description: '恢复15%最大HP',
                    stageRequired: 7,
                    energyCost: 22,
                    healPercentage: 0.15
                },
                {
                    name: 'enduranceRecovery_lv3',
                    description: '恢复18%最大HP，持续恢复3回合',
                    stageRequired: 10,
                    energyCost: 26,
                    healPercentage: 0.18,
                    hot: { healPercent: 0.03, turns: 3 }
                }
            ]
        },
        {
            id: 'warriorSense',
            name: '武者直觉系',
            realmRequired: 0,
            type: 'special',
            baseDisplayName: '武者直觉',
            baseImageId: 4,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
            baseEffectColor: { r: 0.5, g: 0.8, b: 1 },
            levels: [
                {
                    name: 'warriorSense_lv1',
                    description: '25%闪避率，持续1回合',
                    stageRequired: 7,
                    energyCost: 10,
                    dodgeBonus: 0.25,
                    duration: 1
                },
                {
                    name: 'warriorSense_lv2',
                    description: '30%闪避率 + 5%暴击率，持续1回合',
                    stageRequired: 10,
                    energyCost: 15,
                    dodgeBonus: 0.3,
                    criticalBonus: 0.05,
                    duration: 1
                }
            ]
        },
        // 炼气境 (Realm 1) - 4个技能树
        {
            id: 'qiBlade',
            name: '气刃术系',
            realmRequired: 1,
            type: 'attack',
            baseDisplayName: '气刃斩',
            baseImageId: 5,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
            baseEffectColor: { r: 0, g: 0.6, b: 1 },
            levels: [
                {
                    name: 'qiBlade_lv1',
                    description: '凝聚气刃，造成2.0倍伤害',
                    stageRequired: 1,
                    energyCost: 15,
                    damageMultiplier: 2.0
                },
                {
                    name: 'qiBlade_lv2',
                    description: '强化气刃，造成2.3倍伤害，+5%暴击率',
                    stageRequired: 4,
                    energyCost: 18,
                    damageMultiplier: 2.3,
                    criticalBonus: 0.05
                },
                {
                    name: 'qiBlade_lv3',
                    description: '气刃爆发，造成2.6倍伤害，额外造成5%敌人最大生命伤害',
                    stageRequired: 7,
                    energyCost: 22,
                    damageMultiplier: 2.6,
                    extraDamagePercent: 0.05
                },
                {
                    name: 'qiBlade_lv4',
                    description: '炼气境巅峰，造成3.0倍伤害，额外造成10%敌人最大生命伤害',
                    stageRequired: 10,
                    energyCost: 28,
                    damageMultiplier: 3.0,
                    extraDamagePercent: 0.1
                }
            ]
        },
        {
            id: 'qiShield',
            name: '真气盾系',
            realmRequired: 1,
            type: 'defense',
            baseDisplayName: '真气护盾',
            baseImageId: 6,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3',
            baseEffectColor: { r: 1, g: 1, b: 0 },
            levels: [
                {
                    name: 'qiShield_lv1',
                    description: '减伤30%，护盾吸收80点伤害',
                    stageRequired: 1,
                    energyCost: 20,
                    defenseBonus: 0.3,
                    shield: 80
                },
                {
                    name: 'qiShield_lv2',
                    description: '减伤35%，护盾吸收120点伤害',
                    stageRequired: 4,
                    energyCost: 24,
                    defenseBonus: 0.35,
                    shield: 120
                },
                {
                    name: 'qiShield_lv3',
                    description: '减伤40%，护盾吸收160点伤害',
                    stageRequired: 7,
                    energyCost: 28,
                    defenseBonus: 0.4,
                    shield: 160
                },
                {
                    name: 'qiShield_lv4',
                    description: '减伤50%，护盾吸收200点伤害，免疫控制',
                    stageRequired: 10,
                    energyCost: 35,
                    defenseBonus: 0.5,
                    shield: 200,
                    immuneCC: true
                }
            ]
        },
        {
            id: 'qiHealing',
            name: '真气治疗系',
            realmRequired: 1,
            type: 'recovery',
            baseDisplayName: '回春术',
            baseImageId: 7,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
            baseEffectColor: { r: 0.5, g: 0.5, b: 1 },
            levels: [
                {
                    name: 'qiHealing_lv1',
                    description: '灵气回春，恢复18点灵力',
                    stageRequired: 4,
                    energyCost: 5,
                    energyRecover: 18
                },
                {
                    name: 'qiHealing_lv2',
                    description: '恢复18%HP + 15点灵力',
                    stageRequired: 7,
                    energyCost: 15,
                    healPercentage: 0.18,
                    energyRecover: 15
                },
                {
                    name: 'qiHealing_lv3',
                    description: '恢复22%HP + 20点灵力，清除负面状态',
                    stageRequired: 10,
                    energyCost: 20,
                    healPercentage: 0.22,
                    energyRecover: 20,
                    purify: true
                }
            ]
        },
        {
            id: 'qiSense',
            name: '真气感知系',
            realmRequired: 1,
            type: 'special',
            baseDisplayName: '追风步',
            baseImageId: 8,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3',
            baseEffectColor: { r: 0.7, g: 0.9, b: 1 },
            levels: [
                {
                    name: 'qiSense_lv1',
                    description: '20%闪避 + 恢复12灵力',
                    stageRequired: 4,
                    energyCost: 10,
                    dodgeBonus: 0.2,
                    energyRecover: 12
                },
                {
                    name: 'qiSense_lv2',
                    description: '20%防御 + 15%闪避 + 恢复15灵力',
                    stageRequired: 7,
                    energyCost: 15,
                    defenseBonus: 0.2,
                    dodgeBonus: 0.15,
                    energyRecover: 15
                },
                {
                    name: 'qiSense_lv3',
                    description: '身法入微，25%闪避 + 恢复20灵力，下2次攻击伤害+50%',
                    stageRequired: 10,
                    energyCost: 30,
                    dodgeBonus: 0.25,
                    energyRecover: 20,
                    damageBuff: { bonus: 0.5, turns: 2 }
                }
            ]
        },
        // 筑基境 (Realm 2) - 4个技能树
        {
            id: 'foundationSlash',
            name: '筑基斩系',
            realmRequired: 2,
            type: 'attack',
            baseDisplayName: '玄剑诀',
            baseImageId: 9,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
            baseEffectColor: { r: 0.5, g: 0.8, b: 1 },
            levels: [
                {
                    name: 'foundationSlash_lv1',
                    description: '剑气斩击，造成3.2倍伤害',
                    stageRequired: 1,
                    energyCost: 20,
                    damageMultiplier: 3.2
                },
                {
                    name: 'foundationSlash_lv2',
                    description: '强化剑气，造成3.6倍伤害，无视15%防御',
                    stageRequired: 4,
                    energyCost: 25,
                    damageMultiplier: 3.6,
                    armorPenetration: 0.15
                },
                {
                    name: 'foundationSlash_lv3',
                    description: '剑气爆发，造成4.0倍伤害，无视25%防御',
                    stageRequired: 7,
                    energyCost: 32,
                    damageMultiplier: 4.0,
                    armorPenetration: 0.25
                },
                {
                    name: 'foundationSlash_lv4',
                    description: '筑基境巅峰，造成4.5倍伤害，无视30%防御，+10%暴击率',
                    stageRequired: 10,
                    energyCost: 40,
                    damageMultiplier: 4.5,
                    armorPenetration: 0.3,
                    criticalBonus: 0.1
                }
            ]
        },
        {
            id: 'foundationArmor',
            name: '筑基甲系',
            realmRequired: 2,
            type: 'defense',
            baseDisplayName: '灵甲术',
            baseImageId: 10,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
            baseEffectColor: { r: 0.5, g: 0.8, b: 0.9 },
            levels: [
                {
                    name: 'foundationArmor_lv1',
                    description: '灵甲护体，减伤40%，反弹5%伤害',
                    stageRequired: 1,
                    energyCost: 22,
                    defenseBonus: 0.4,
                    reflectDamage: 0.05
                },
                {
                    name: 'foundationArmor_lv2',
                    description: '灵甲强化，减伤45%，反弹8%伤害',
                    stageRequired: 4,
                    energyCost: 28,
                    defenseBonus: 0.45,
                    reflectDamage: 0.08
                },
                {
                    name: 'foundationArmor_lv3',
                    description: '灵甲反震，减伤50%，反弹12%伤害',
                    stageRequired: 7,
                    energyCost: 35,
                    defenseBonus: 0.5,
                    reflectDamage: 0.12
                },
                {
                    name: 'foundationArmor_lv4',
                    description: '灵甲圆满，减伤60%，反弹15%伤害',
                    stageRequired: 10,
                    energyCost: 45,
                    defenseBonus: 0.6,
                    reflectDamage: 0.15
                }
            ]
        },
        {
            id: 'foundationHeal',
            name: '筑基恢复系',
            realmRequired: 2,
            type: 'recovery',
            baseDisplayName: '春风化雨',
            baseImageId: 11,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
            baseEffectColor: { r: 0.3, g: 1, b: 0.3 },
            levels: [
                {
                    name: 'foundationHeal_lv1',
                    description: '恢复28%最大HP',
                    stageRequired: 1,
                    energyCost: 25,
                    healPercentage: 0.28
                },
                {
                    name: 'foundationHeal_lv2',
                    description: '恢复32%最大HP，持续恢复5回合',
                    stageRequired: 4,
                    energyCost: 30,
                    healPercentage: 0.32,
                    hot: { healPercent: 0.04, turns: 5 }
                },
                {
                    name: 'foundationHeal_lv3',
                    description: '恢复38%最大HP，持续恢复5回合，清除负面状态',
                    stageRequired: 7,
                    energyCost: 36,
                    healPercentage: 0.38,
                    hot: { healPercent: 0.05, turns: 5 },
                    purify: true
                },
                {
                    name: 'foundationHeal_lv4',
                    description: '恢复45%最大HP，持续恢复8回合，清除负面状态，+10%防御',
                    stageRequired: 10,
                    energyCost: 42,
                    healPercentage: 0.45,
                    hot: { healPercent: 0.06, turns: 8 },
                    purify: true,
                    defenseBonus: 0.1
                }
            ]
        },
        {
            id: 'foundationArt',
            name: '筑基术系',
            realmRequired: 2,
            type: 'special',
            baseDisplayName: '分身术',
            baseImageId: 12,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
            baseEffectColor: { r: 0.8, g: 0.8, b: 1 },
            levels: [
                {
                    name: 'foundationArt_lv1',
                    description: '化身千万，下次攻击伤害+30%',
                    stageRequired: 1,
                    energyCost: 25,
                    damageBuff: { bonus: 0.3, turns: 1 }
                },
                {
                    name: 'foundationArt_lv2',
                    description: '25%防御 + 20%闪避 + 下次攻击伤害+40%',
                    stageRequired: 4,
                    energyCost: 32,
                    defenseBonus: 0.25,
                    dodgeBonus: 0.2,
                    damageBuff: { bonus: 0.4, turns: 1 }
                },
                {
                    name: 'foundationArt_lv3',
                    description: '30%防御 + 25%闪避 + 下2次攻击伤害+50%',
                    stageRequired: 7,
                    energyCost: 40,
                    defenseBonus: 0.3,
                    dodgeBonus: 0.25,
                    damageBuff: { bonus: 0.5, turns: 2 }
                },
                {
                    name: 'foundationArt_lv4',
                    description: '35%防御 + 30%闪避 + 下3次攻击伤害+60%，免疫控制',
                    stageRequired: 10,
                    energyCost: 48,
                    defenseBonus: 0.35,
                    dodgeBonus: 0.3,
                    damageBuff: { bonus: 0.6, turns: 3 },
                    immuneCC: true
                }
            ]
        },
        // 金丹境 (Realm 3) - 4个技能树
        {
            id: 'goldenCore',
            name: '金丹掌系',
            realmRequired: 3,
            type: 'attack',
            baseDisplayName: '紫焰掌',
            baseImageId: 13,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
            baseEffectColor: { r: 1, g: 0.8, b: 0 },
            levels: [
                {
                    name: 'goldenCore_lv1',
                    description: '金丹之力，造成4.8倍伤害',
                    stageRequired: 1,
                    energyCost: 25,
                    damageMultiplier: 4.8
                },
                {
                    name: 'goldenCore_lv2',
                    description: '强化金丹掌，造成5.3倍伤害，眩晕敌人1回合',
                    stageRequired: 4,
                    energyCost: 32,
                    damageMultiplier: 5.3,
                    stun: 1
                },
                {
                    name: 'goldenCore_lv3',
                    description: '金丹爆发，造成5.8倍伤害，眩晕1回合，无视20%防御',
                    stageRequired: 7,
                    energyCost: 40,
                    damageMultiplier: 5.8,
                    stun: 1,
                    armorPenetration: 0.2
                },
                {
                    name: 'goldenCore_lv4',
                    description: '金丹境巅峰，造成6.5倍伤害，眩晕2回合，无视30%防御',
                    stageRequired: 10,
                    energyCost: 52,
                    damageMultiplier: 6.5,
                    stun: 2,
                    armorPenetration: 0.3
                }
            ]
        },
        {
            id: 'goldenArmor',
            name: '金丹甲系',
            realmRequired: 3,
            type: 'defense',
            baseDisplayName: '金光护体',
            baseImageId: 14,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
            baseEffectColor: { r: 1, g: 0.9, b: 0.3 },
            levels: [
                {
                    name: 'goldenArmor_lv1',
                    description: '减伤50%，护盾吸收300点伤害',
                    stageRequired: 1,
                    energyCost: 28,
                    defenseBonus: 0.5,
                    shield: 300
                },
                {
                    name: 'goldenArmor_lv2',
                    description: '减伤55%，护盾吸收400点伤害，反弹10%伤害',
                    stageRequired: 4,
                    energyCost: 35,
                    defenseBonus: 0.55,
                    shield: 400,
                    reflectDamage: 0.1
                },
                {
                    name: 'goldenArmor_lv3',
                    description: '减伤60%，护盾吸收500点伤害，反弹15%伤害',
                    stageRequired: 7,
                    energyCost: 45,
                    defenseBonus: 0.6,
                    shield: 500,
                    reflectDamage: 0.15
                },
                {
                    name: 'goldenArmor_lv4',
                    description: '减伤70%，护盾吸收600点伤害，反弹20%伤害，免疫控制',
                    stageRequired: 10,
                    energyCost: 55,
                    defenseBonus: 0.7,
                    shield: 600,
                    reflectDamage: 0.2,
                    immuneCC: true
                }
            ]
        },
        {
            id: 'goldenHeal',
            name: '金丹治疗系',
            realmRequired: 3,
            type: 'recovery',
            baseDisplayName: '涅槃之光',
            baseImageId: 15,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
            baseEffectColor: { r: 0.6, g: 1, b: 0.6 },
            levels: [
                {
                    name: 'goldenHeal_lv1',
                    description: '恢复42%最大HP',
                    stageRequired: 1,
                    energyCost: 30,
                    healPercentage: 0.42
                },
                {
                    name: 'goldenHeal_lv2',
                    description: '恢复48%最大HP，恢复30点灵力',
                    stageRequired: 4,
                    energyCost: 36,
                    healPercentage: 0.48,
                    energyRecover: 30
                },
                {
                    name: 'goldenHeal_lv3',
                    description: '恢复55%最大HP，恢复40点灵力，清除负面状态',
                    stageRequired: 7,
                    energyCost: 42,
                    healPercentage: 0.55,
                    energyRecover: 40,
                    purify: true
                },
                {
                    name: 'goldenHeal_lv4',
                    description: '恢复65%最大HP，恢复50点灵力，清除负面状态，+15%防御持续3回合',
                    stageRequired: 10,
                    energyCost: 50,
                    healPercentage: 0.65,
                    energyRecover: 50,
                    purify: true,
                    defenseBonus: 0.15
                }
            ]
        },
        {
            id: 'goldenCorePower',
            name: '金丹之力系',
            realmRequired: 3,
            type: 'special',
            baseDisplayName: '丹火焚天',
            baseImageId: 16,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
            baseEffectColor: { r: 1, g: 0.9, b: 0.5 },
            levels: [
                {
                    name: 'goldenCorePower_lv1',
                    description: '下2次攻击伤害+60%',
                    stageRequired: 1,
                    energyCost: 35,
                    damageBuff: { bonus: 0.6, turns: 2 }
                },
                {
                    name: 'goldenCorePower_lv2',
                    description: '30%防御 + 30%闪避 + 下2次攻击伤害+70%',
                    stageRequired: 4,
                    energyCost: 42,
                    defenseBonus: 0.3,
                    dodgeBonus: 0.3,
                    damageBuff: { bonus: 0.7, turns: 2 }
                },
                {
                    name: 'goldenCorePower_lv3',
                    description: '35%防御 + 35%闪避 + 下3次攻击伤害+80%，恢复30点灵力',
                    stageRequired: 7,
                    energyCost: 50,
                    defenseBonus: 0.35,
                    dodgeBonus: 0.35,
                    damageBuff: { bonus: 0.8, turns: 3 },
                    energyRecover: 30
                },
                {
                    name: 'goldenCorePower_lv4',
                    description: '40%防御 + 40%闪避 + 下4次攻击伤害+100%，恢复40点灵力，免疫控制',
                    stageRequired: 10,
                    energyCost: 60,
                    defenseBonus: 0.4,
                    dodgeBonus: 0.4,
                    damageBuff: { bonus: 1.0, turns: 4 },
                    energyRecover: 40,
                    immuneCC: true
                }
            ]
        },
        // 元婴境 (Realm 4) - 4个技能树
        {
            id: 'infantStrike',
            name: '元婴击系',
            realmRequired: 4,
            type: 'attack',
            baseDisplayName: '寂灭一击',
            baseImageId: 17,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
            baseEffectColor: { r: 0.8, g: 0.2, b: 1 },
            levels: [
                {
                    name: 'infantStrike_lv1',
                    description: '元婴之力，造成6.8倍伤害',
                    stageRequired: 1,
                    energyCost: 35,
                    damageMultiplier: 6.8
                },
                {
                    name: 'infantStrike_lv2',
                    description: '元婴攻击，造成7.5倍伤害，额外造成10%敌人最大生命伤害',
                    stageRequired: 4,
                    energyCost: 42,
                    damageMultiplier: 7.5,
                    extraDamagePercent: 0.1
                },
                {
                    name: 'infantStrike_lv3',
                    description: '元婴寂灭一击，造成8.2倍伤害，对生命低于25%敌人额外2倍伤害',
                    stageRequired: 7,
                    energyCost: 50,
                    damageMultiplier: 8.2,
                    executeMultiplier: 2.0,
                    executeThreshold: 0.25
                },
                {
                    name: 'infantStrike_lv4',
                    description: '元婴境巅峰，造成9.0倍伤害，斩杀生命低于35%敌人',
                    stageRequired: 10,
                    energyCost: 65,
                    damageMultiplier: 9.0,
                    executeThreshold: 0.35
                }
            ]
        },
        {
            id: 'infantGuard',
            name: '元婴护系',
            realmRequired: 4,
            type: 'defense',
            baseDisplayName: '五行神护',
            baseImageId: 18,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
            baseEffectColor: { r: 0.9, g: 0.5, b: 1 },
            levels: [
                {
                    name: 'infantGuard_lv1',
                    description: '减伤60%，护盾吸收700点伤害，反弹20%伤害',
                    stageRequired: 1,
                    energyCost: 35,
                    defenseBonus: 0.6,
                    shield: 700,
                    reflectDamage: 0.2
                },
                {
                    name: 'infantGuard_lv2',
                    description: '减伤65%，护盾吸收800点伤害，反弹25%伤害，免疫控制',
                    stageRequired: 4,
                    energyCost: 42,
                    defenseBonus: 0.65,
                    shield: 800,
                    reflectDamage: 0.25,
                    immuneCC: true
                },
                {
                    name: 'infantGuard_lv3',
                    description: '减伤70%，护盾吸收900点伤害，反弹30%伤害，免疫控制，恢复10%HP',
                    stageRequired: 7,
                    energyCost: 50,
                    defenseBonus: 0.7,
                    shield: 900,
                    reflectDamage: 0.3,
                    immuneCC: true,
                    healPercentage: 0.1
                },
                {
                    name: 'infantGuard_lv4',
                    description: '减伤80%，护盾吸收1000点伤害，反弹35%伤害，免疫控制，恢复15%HP',
                    stageRequired: 10,
                    energyCost: 60,
                    defenseBonus: 0.8,
                    shield: 1000,
                    reflectDamage: 0.35,
                    immuneCC: true,
                    healPercentage: 0.15
                }
            ]
        },
        {
            id: 'infantRecovery',
            name: '元婴回复系',
            realmRequired: 4,
            type: 'recovery',
            baseDisplayName: '凤凰涅槃',
            baseImageId: 19,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
            baseEffectColor: { r: 0.8, g: 1, b: 0.8 },
            levels: [
                {
                    name: 'infantRecovery_lv1',
                    description: '恢复60%最大HP，恢复40点灵力',
                    stageRequired: 1,
                    energyCost: 38,
                    healPercentage: 0.6,
                    energyRecover: 40
                },
                {
                    name: 'infantRecovery_lv2',
                    description: '恢复68%最大HP，恢复50点灵力，清除负面状态',
                    stageRequired: 4,
                    energyCost: 45,
                    healPercentage: 0.68,
                    energyRecover: 50,
                    purify: true
                },
                {
                    name: 'infantRecovery_lv3',
                    description: '恢复78%最大HP，恢复60点灵力，清除负面状态，持续恢复10回合',
                    stageRequired: 7,
                    energyCost: 52,
                    healPercentage: 0.78,
                    energyRecover: 60,
                    purify: true,
                    hot: { healPercent: 0.08, turns: 10 }
                },
                {
                    name: 'infantRecovery_lv4',
                    description: '恢复90%最大HP，恢复80点灵力，清除负面状态，持续恢复10回合，+20%防御',
                    stageRequired: 10,
                    energyCost: 60,
                    healPercentage: 0.9,
                    energyRecover: 80,
                    purify: true,
                    hot: { healPercent: 0.1, turns: 10 },
                    defenseBonus: 0.2
                }
            ]
        },
        {
            id: 'infantVision',
            name: '元婴之眼系',
            realmRequired: 4,
            type: 'special',
            baseDisplayName: '神识感应',
            baseImageId: 20,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
            baseEffectColor: { r: 0.9, g: 0.8, b: 1 },
            levels: [
                {
                    name: 'infantVision_lv1',
                    description: '40%闪避 + 15%暴击率 + 下3次攻击伤害+80%',
                    stageRequired: 1,
                    energyCost: 45,
                    dodgeBonus: 0.4,
                    criticalBonus: 0.15,
                    damageBuff: { bonus: 0.8, turns: 3 }
                },
                {
                    name: 'infantVision_lv2',
                    description: '45%闪避 + 20%暴击率 + 下3次攻击伤害+90%，恢复40点灵力',
                    stageRequired: 4,
                    energyCost: 52,
                    dodgeBonus: 0.45,
                    criticalBonus: 0.2,
                    damageBuff: { bonus: 0.9, turns: 3 },
                    energyRecover: 40
                },
                {
                    name: 'infantVision_lv3',
                    description: '50%闪避 + 25%暴击率 + 下4次攻击伤害+100%，恢复50点灵力，免疫控制',
                    stageRequired: 7,
                    energyCost: 60,
                    dodgeBonus: 0.5,
                    criticalBonus: 0.25,
                    damageBuff: { bonus: 1.0, turns: 4 },
                    energyRecover: 50,
                    immuneCC: true
                },
                {
                    name: 'infantVision_lv4',
                    description: '55%闪避 + 30%暴击率 + 下5次攻击伤害+120%，恢复60点灵力，免疫控制',
                    stageRequired: 10,
                    energyCost: 70,
                    dodgeBonus: 0.55,
                    criticalBonus: 0.3,
                    damageBuff: { bonus: 1.2, turns: 5 },
                    energyRecover: 60,
                    immuneCC: true
                }
            ]
        },
        // 化神境 (Realm 5) - 4个技能树
        {
            id: 'deityFist',
            name: '化神拳系',
            realmRequired: 5,
            type: 'attack',
            baseDisplayName: '鸿蒙紫气',
            baseImageId: 21,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
            baseEffectColor: { r: 1, g: 0.5, b: 0.5 },
            levels: [
                {
                    name: 'deityFist_lv1',
                    description: '化神之力，造成9.5倍伤害',
                    stageRequired: 1,
                    energyCost: 45,
                    damageMultiplier: 9.5
                },
                {
                    name: 'deityFist_lv2',
                    description: '紫气东来，造成10.5倍伤害，无视40%防御',
                    stageRequired: 4,
                    energyCost: 55,
                    damageMultiplier: 10.5,
                    armorPenetration: 0.4
                },
                {
                    name: 'deityFist_lv3',
                    description: '鸿蒙紫气，造成11.5倍伤害，对生命低于20%敌人额外3倍伤害',
                    stageRequired: 7,
                    energyCost: 65,
                    damageMultiplier: 11.5,
                    executeMultiplier: 3.0,
                    executeThreshold: 0.2
                },
                {
                    name: 'deityFist_lv4',
                    description: '化神境巅峰，造成13.0倍伤害，必定暴击，无视50%防御',
                    stageRequired: 10,
                    energyCost: 80,
                    damageMultiplier: 13.0,
                    guaranteedCrit: true,
                    armorPenetration: 0.5
                }
            ]
        },
        {
            id: 'deityShield',
            name: '神盾系',
            realmRequired: 5,
            type: 'defense',
            baseDisplayName: '混沌神盾',
            baseImageId: 22,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
            baseEffectColor: { r: 1, g: 0.9, b: 0.7 },
            levels: [
                {
                    name: 'deityShield_lv1',
                    description: '减伤70%，护盾吸收1200点伤害，完全免疫下次攻击',
                    stageRequired: 1,
                    energyCost: 45,
                    defenseBonus: 0.7,
                    shield: 1200,
                    immuneNextAttack: true
                },
                {
                    name: 'deityShield_lv2',
                    description: '减伤75%，护盾吸收1400点伤害，完全免疫下次攻击，反弹25%伤害',
                    stageRequired: 4,
                    energyCost: 55,
                    defenseBonus: 0.75,
                    shield: 1400,
                    immuneNextAttack: true,
                    reflectDamage: 0.25
                },
                {
                    name: 'deityShield_lv3',
                    description: '减伤80%，护盾吸收1600点伤害，完全免疫下次攻击，反弹30%伤害，恢复15%HP',
                    stageRequired: 7,
                    energyCost: 65,
                    defenseBonus: 0.8,
                    shield: 1600,
                    immuneNextAttack: true,
                    reflectDamage: 0.3,
                    healPercentage: 0.15
                },
                {
                    name: 'deityShield_lv4',
                    description: '减伤90%，护盾吸收2000点伤害，完全免疫下次攻击，反弹40%伤害，恢复20%HP，免疫控制',
                    stageRequired: 10,
                    energyCost: 75,
                    defenseBonus: 0.9,
                    shield: 2000,
                    immuneNextAttack: true,
                    reflectDamage: 0.4,
                    healPercentage: 0.2,
                    immuneCC: true
                }
            ]
        },
        {
            id: 'deityBlessing',
            name: '神佑系',
            realmRequired: 5,
            type: 'recovery',
            baseDisplayName: '天道神佑',
            baseImageId: 23,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
            baseEffectColor: { r: 0.95, g: 1, b: 0.95 },
            levels: [
                {
                    name: 'deityBlessing_lv1',
                    description: '恢复85%最大HP，恢复60点灵力，清除负面状态',
                    stageRequired: 1,
                    energyCost: 48,
                    healPercentage: 0.85,
                    energyRecover: 60,
                    purify: true
                },
                {
                    name: 'deityBlessing_lv2',
                    description: '恢复95%最大HP，恢复80点灵力，清除负面状态，持续恢复12回合',
                    stageRequired: 4,
                    energyCost: 55,
                    healPercentage: 0.95,
                    energyRecover: 80,
                    purify: true,
                    hot: { healPercent: 0.1, turns: 12 }
                },
                {
                    name: 'deityBlessing_lv3',
                    description: '恢复110%最大HP，恢复100点灵力，清除负面状态，持续恢复12回合，+25%防御',
                    stageRequired: 7,
                    energyCost: 62,
                    healPercentage: 1.1,
                    energyRecover: 100,
                    purify: true,
                    hot: { healPercent: 0.12, turns: 12 },
                    defenseBonus: 0.25
                },
                {
                    name: 'deityBlessing_lv4',
                    description: '恢复130%最大HP（可超量治疗），恢复120点灵力，清除负面状态，持续恢复15回合，+30%全属性',
                    stageRequired: 10,
                    energyCost: 70,
                    healPercentage: 1.3,
                    energyRecover: 120,
                    purify: true,
                    hot: { healPercent: 0.15, turns: 15 },
                    allStatsBonus: 0.3
                }
            ]
        },
        {
            id: 'deityForm',
            name: '化神形态系',
            realmRequired: 5,
            type: 'special',
            baseDisplayName: '万象归一',
            baseImageId: 24,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
            baseEffectColor: { r: 1, g: 0.9, b: 0.9 },
            levels: [
                {
                    name: 'deityForm_lv1',
                    description: '50%全属性 + 下4次攻击伤害+100%，免疫控制',
                    stageRequired: 1,
                    energyCost: 60,
                    allStatsBonus: 0.5,
                    damageBuff: { bonus: 1.0, turns: 4 },
                    immuneCC: true
                },
                {
                    name: 'deityForm_lv2',
                    description: '60%全属性 + 下5次攻击伤害+120%，免疫控制，恢复60点灵力',
                    stageRequired: 4,
                    energyCost: 70,
                    allStatsBonus: 0.6,
                    damageBuff: { bonus: 1.2, turns: 5 },
                    immuneCC: true,
                    energyRecover: 60
                },
                {
                    name: 'deityForm_lv3',
                    description: '70%全属性 + 下6次攻击伤害+150%，免疫控制，恢复80点灵力，必定暴击',
                    stageRequired: 7,
                    energyCost: 80,
                    allStatsBonus: 0.7,
                    damageBuff: { bonus: 1.5, turns: 6 },
                    immuneCC: true,
                    energyRecover: 80,
                    guaranteedCrit: true
                },
                {
                    name: 'deityForm_lv4',
                    description: '80%全属性 + 下8次攻击伤害+200%，免疫控制，恢复100点灵力，必定暴击，无视60%防御',
                    stageRequired: 10,
                    energyCost: 90,
                    allStatsBonus: 0.8,
                    damageBuff: { bonus: 2.0, turns: 8 },
                    immuneCC: true,
                    energyRecover: 100,
                    guaranteedCrit: true,
                    armorPenetration: 0.6
                }
            ]
        }
    ],
    
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
                name: "灵力药水",
                description: "恢复满灵力",
                price: 30,
                type: "consumable",
                effect: "energy",
                value: 1
            },
            {
                id: "attack_potion",
                name: "攻击药水",
                description: "临时提升20%攻击力，持续30秒",
                price: 40,
                type: "consumable",
                effect: "attack",
                value: 0.2
            },
            {
                id: "defense_potion",
                name: "防御药水",
                description: "临时提升20%防御力，持续30秒",
                price: 40,
                type: "consumable",
                effect: "defense",
                value: 0.2
            },
            {
                id: "speed_potion",
                name: "速度药水",
                description: "临时提升20%速度，持续30秒",
                price: 40,
                type: "consumable",
                effect: "speed",
                value: 0.2
            },
            {
                id: "luck_potion",
                name: "幸运药水",
                description: "临时提升20%幸运，持续30秒",
                price: 40,
                type: "consumable",
                effect: "luck",
                value: 0.2
            },
            {
                id: "white_equipment_box",
                name: "白色装备箱",
                description: "随机获得一件对应境界的白色装备",
                price: 100,
                type: "random_equipment",
                rarity: "white"
            }
        ]
    },
    
    // 玩家元数据
    player: {
        // 初始属性
        initialStats: {
            exp: 0,
            maxExp: 100,
            attack: 10,
            defense: 5,
            hp: 100,
            maxHp: 100,
            luck: 2,
            energy: 100,
            maxEnergy: 100,
            speed: 10,
            accuracy: 100,
            dodge: 5,
            breakthroughStones: 0,
            realm: {
                currentRealm: 0,
                currentStage: 1,
                currentLevel: 1
            }
        },
        // 升级属性增长
        levelUpStats: {
            attack: 2,
            defense: 1,
            maxHp: 20,
            luck: 0.5,
            maxEnergy: 10,
            speed: 1,
            accuracy: 2,
            dodge: 1
        },
        // 回复速度（每秒）
        regenRates: {
            hp: 0.5, // 每秒恢复0.5点生命值
            energy: 2 // 每秒恢复2点灵力
        },
        // 默认游戏设置
        defaultSettings: {
            autoPlay: false,
            autoBattle: false,
            afkTime: 0,
            collectedResources: 0,
            autoBattleSettings: {
                enabled: false,
                targetColors: ['green', 'yellow', 'red']
            },
            autoCollectSettings: {
                enabled: false,
                resourceTypes: ['spiritWood', 'blackIron', 'spiritCrystal']
            }
        },
        // 默认战斗状态
        defaultBattleState: {
            inBattle: false,
            battleLog: []
        }
    },
    
    // 资源元数据
    resources: {
        types: [
            {
                name: "spiritWood",
                displayName: "灵木",
                initialAmount: 0,
                baseRate: 1,
                description: "基础修仙资源，用于装备精炼"
            },
            {
                name: "blackIron",
                displayName: "玄铁",
                initialAmount: 0,
                baseRate: 0.5,
                description: "中级修仙资源，用于装备精炼"
            },
            {
                name: "spiritCrystal",
                displayName: "灵石",
                initialAmount: 0,
                baseRate: 0.2,
                description: "高级修仙资源，用于装备精炼"
            }
        ]
    },
    
    // 境界系统配置
    realmConfig: [
        {
            name: "武者",
            stages: [
                { stage: 1, name: "初期", levelCap: 10, bonus: { attack: 0, defense: 0, hp: 0, luck: 0 }, breakthroughStones: 0 },
                { stage: 2, name: "初期", levelCap: 10, bonus: { attack: 0, defense: 0, hp: 0, luck: 0 }, breakthroughStones: 0 },
                { stage: 3, name: "初期", levelCap: 10, bonus: { attack: 0, defense: 0, hp: 0, luck: 0 }, breakthroughStones: 0 },
                { stage: 4, name: "中期", levelCap: 20, bonus: { attack: 0, defense: 0, hp: 0, luck: 0 }, breakthroughStones: 0 },
                { stage: 5, name: "中期", levelCap: 20, bonus: { attack: 0, defense: 0, hp: 0, luck: 0 }, breakthroughStones: 0 },
                { stage: 6, name: "中期", levelCap: 20, bonus: { attack: 0, defense: 0, hp: 0, luck: 0 }, breakthroughStones: 0 },
                { stage: 7, name: "后期", levelCap: 30, bonus: { attack: 0, defense: 0, hp: 0, luck: 0 }, breakthroughStones: 0 },
                { stage: 8, name: "后期", levelCap: 30, bonus: { attack: 0, defense: 0, hp: 0, luck: 0 }, breakthroughStones: 0 },
                { stage: 9, name: "后期", levelCap: 30, bonus: { attack: 0, defense: 0, hp: 0, luck: 0 }, breakthroughStones: 0 },
                { stage: 10, name: "巅峰", levelCap: 30, bonus: { attack: 0, defense: 0, hp: 0, luck: 0 }, breakthroughStones: 1 }
            ]
        },
        {
            name: "炼气",
            stages: [
                { stage: 1, name: "前期", levelCap: 10, bonus: { attack: 1, defense: 1, hp: 10, luck: 0.1 }, breakthroughStones: 5 },
                { stage: 2, name: "前期", levelCap: 10, bonus: { attack: 2, defense: 2, hp: 20, luck: 0.2 }, breakthroughStones: 10 },
                { stage: 3, name: "前期", levelCap: 10, bonus: { attack: 3, defense: 3, hp: 30, luck: 0.3 }, breakthroughStones: 15 },
                { stage: 4, name: "中期", levelCap: 15, bonus: { attack: 5, defense: 5, hp: 50, luck: 0.5 }, breakthroughStones: 25 },
                { stage: 5, name: "中期", levelCap: 15, bonus: { attack: 7, defense: 7, hp: 70, luck: 0.7 }, breakthroughStones: 35 },
                { stage: 6, name: "中期", levelCap: 15, bonus: { attack: 9, defense: 9, hp: 90, luck: 0.9 }, breakthroughStones: 45 },
                { stage: 7, name: "后期", levelCap: 20, bonus: { attack: 12, defense: 12, hp: 120, luck: 1.2 }, breakthroughStones: 60 },
                { stage: 8, name: "后期", levelCap: 20, bonus: { attack: 15, defense: 15, hp: 150, luck: 1.5 }, breakthroughStones: 75 },
                { stage: 9, name: "后期", levelCap: 20, bonus: { attack: 18, defense: 18, hp: 180, luck: 1.8 }, breakthroughStones: 90 },
                { stage: 10, name: "大圆满", levelCap: 25, bonus: { attack: 25, defense: 25, hp: 250, luck: 2.5 }, breakthroughStones: 125 }
            ]
        },
        {
            name: "筑基",
            stages: [
                { stage: 1, name: "前期", levelCap: 20, bonus: { attack: 30, defense: 30, hp: 300, luck: 3 }, breakthroughStones: 150 },
                { stage: 2, name: "前期", levelCap: 20, bonus: { attack: 35, defense: 35, hp: 350, luck: 3.5 }, breakthroughStones: 175 },
                { stage: 3, name: "前期", levelCap: 20, bonus: { attack: 40, defense: 40, hp: 400, luck: 4 }, breakthroughStones: 200 },
                { stage: 4, name: "中期", levelCap: 25, bonus: { attack: 50, defense: 50, hp: 500, luck: 5 }, breakthroughStones: 250 },
                { stage: 5, name: "中期", levelCap: 25, bonus: { attack: 60, defense: 60, hp: 600, luck: 6 }, breakthroughStones: 300 },
                { stage: 6, name: "中期", levelCap: 25, bonus: { attack: 70, defense: 70, hp: 700, luck: 7 }, breakthroughStones: 350 },
                { stage: 7, name: "后期", levelCap: 30, bonus: { attack: 85, defense: 85, hp: 850, luck: 8.5 }, breakthroughStones: 425 },
                { stage: 8, name: "后期", levelCap: 30, bonus: { attack: 100, defense: 100, hp: 1000, luck: 10 }, breakthroughStones: 500 },
                { stage: 9, name: "后期", levelCap: 30, bonus: { attack: 115, defense: 115, hp: 1150, luck: 11.5 }, breakthroughStones: 575 },
                { stage: 10, name: "大圆满", levelCap: 35, bonus: { attack: 150, defense: 150, hp: 1500, luck: 15 }, breakthroughStones: 750 }
            ]
        },
        {
            name: "金丹",
            stages: [
                { stage: 1, name: "前期", levelCap: 30, bonus: { attack: 180, defense: 180, hp: 1800, luck: 18 }, breakthroughStones: 900 },
                { stage: 2, name: "前期", levelCap: 30, bonus: { attack: 200, defense: 200, hp: 2000, luck: 20 }, breakthroughStones: 1000 },
                { stage: 3, name: "前期", levelCap: 30, bonus: { attack: 220, defense: 220, hp: 2200, luck: 22 }, breakthroughStones: 1100 },
                { stage: 4, name: "中期", levelCap: 35, bonus: { attack: 250, defense: 250, hp: 2500, luck: 25 }, breakthroughStones: 1250 },
                { stage: 5, name: "中期", levelCap: 35, bonus: { attack: 280, defense: 280, hp: 2800, luck: 28 }, breakthroughStones: 1400 },
                { stage: 6, name: "中期", levelCap: 35, bonus: { attack: 310, defense: 310, hp: 3100, luck: 31 }, breakthroughStones: 1550 },
                { stage: 7, name: "后期", levelCap: 40, bonus: { attack: 350, defense: 350, hp: 3500, luck: 35 }, breakthroughStones: 1750 },
                { stage: 8, name: "后期", levelCap: 40, bonus: { attack: 390, defense: 390, hp: 3900, luck: 39 }, breakthroughStones: 1950 },
                { stage: 9, name: "后期", levelCap: 40, bonus: { attack: 430, defense: 430, hp: 4300, luck: 43 }, breakthroughStones: 2150 },
                { stage: 10, name: "大圆满", levelCap: 45, bonus: { attack: 500, defense: 500, hp: 5000, luck: 50 }, breakthroughStones: 2500 }
            ]
        },
        {
            name: "元婴",
            stages: [
                { stage: 1, name: "前期", levelCap: 40, bonus: { attack: 550, defense: 550, hp: 5500, luck: 55 }, breakthroughStones: 2750 },
                { stage: 2, name: "前期", levelCap: 40, bonus: { attack: 600, defense: 600, hp: 6000, luck: 60 }, breakthroughStones: 3000 },
                { stage: 3, name: "前期", levelCap: 40, bonus: { attack: 650, defense: 650, hp: 6500, luck: 65 }, breakthroughStones: 3250 },
                { stage: 4, name: "中期", levelCap: 45, bonus: { attack: 720, defense: 720, hp: 7200, luck: 72 }, breakthroughStones: 3600 },
                { stage: 5, name: "中期", levelCap: 45, bonus: { attack: 790, defense: 790, hp: 7900, luck: 79 }, breakthroughStones: 3950 },
                { stage: 6, name: "中期", levelCap: 45, bonus: { attack: 860, defense: 860, hp: 8600, luck: 86 }, breakthroughStones: 4300 },
                { stage: 7, name: "后期", levelCap: 50, bonus: { attack: 950, defense: 950, hp: 9500, luck: 95 }, breakthroughStones: 4750 },
                { stage: 8, name: "后期", levelCap: 50, bonus: { attack: 1040, defense: 1040, hp: 10400, luck: 104 }, breakthroughStones: 5200 },
                { stage: 9, name: "后期", levelCap: 50, bonus: { attack: 1130, defense: 1130, hp: 11300, luck: 113 }, breakthroughStones: 5650 },
                { stage: 10, name: "大圆满", levelCap: 55, bonus: { attack: 1250, defense: 1250, hp: 12500, luck: 125 }, breakthroughStones: 6250 }
            ]
        },
        {
            name: "化神",
            stages: [
                { stage: 1, name: "前期", levelCap: 50, bonus: { attack: 1350, defense: 1350, hp: 13500, luck: 135 }, breakthroughStones: 6750 },
                { stage: 2, name: "前期", levelCap: 50, bonus: { attack: 1450, defense: 1450, hp: 14500, luck: 145 }, breakthroughStones: 7250 },
                { stage: 3, name: "前期", levelCap: 50, bonus: { attack: 1550, defense: 1550, hp: 15500, luck: 155 }, breakthroughStones: 7750 },
                { stage: 4, name: "中期", levelCap: 55, bonus: { attack: 1700, defense: 1700, hp: 17000, luck: 170 }, breakthroughStones: 8500 },
                { stage: 5, name: "中期", levelCap: 55, bonus: { attack: 1850, defense: 1850, hp: 18500, luck: 185 }, breakthroughStones: 9250 },
                { stage: 6, name: "中期", levelCap: 55, bonus: { attack: 2000, defense: 2000, hp: 20000, luck: 200 }, breakthroughStones: 10000 },
                { stage: 7, name: "后期", levelCap: 60, bonus: { attack: 2200, defense: 2200, hp: 22000, luck: 220 }, breakthroughStones: 11000 },
                { stage: 8, name: "后期", levelCap: 60, bonus: { attack: 2400, defense: 2400, hp: 24000, luck: 240 }, breakthroughStones: 12000 },
                { stage: 9, name: "后期", levelCap: 60, bonus: { attack: 2600, defense: 2600, hp: 26000, luck: 260 }, breakthroughStones: 13000 },
                { stage: 10, name: "大圆满", levelCap: 65, bonus: { attack: 3000, defense: 3000, hp: 30000, luck: 300 }, breakthroughStones: 15000 }
            ]
        }
    ],

    // 地图背景
    mapBackgrounds: [
        {
            "type": "xianxia-mountain",
            "name": "仙侠山峰",
            "skyColor": 8900331,
            "groundColor": 9127187,
            "fogColor": 8900331,
            "fogNear": 10,
            "fogFar": 50,
            "features": [
                "mountains",
                "clouds",
                "ancient temples"
            ],
            "imageUrl": "Images/map-background-1.png"
        },
        {
            "type": "xianxia-forest",
            "name": "仙侠森林",
            "skyColor": 5081343,
            "groundColor": 2263842,
            "fogColor": 5081343,
            "fogNear": 10,
            "fogFar": 50,
            "features": [
                "ancient trees",
                "magical creatures",
                "spirit stones"
            ],
            "imageUrl": "Images/map-background-2.png"
        },
        {
            "type": "xianxia-lake",
            "name": "仙侠湖泊",
            "skyColor": 26316,
            "groundColor": 39423,
            "fogColor": 26316,
            "fogNear": 10,
            "fogFar": 50,
            "features": [
                "crystal clear water",
                "lotus flowers",
                "water spirits"
            ],
            "imageUrl": "Images/map-background-3.png"
        },
        {
            "type": "xianxia-desert",
            "name": "仙侠沙漠",
            "skyColor": 16764006,
            "groundColor": 16764006,
            "fogColor": 16764006,
            "fogNear": 10,
            "fogFar": 50,
            "features": [
                "ancient ruins",
                "sand dunes",
                "mirages"
            ],
            "imageUrl": "Images/map-background-4.png"
        },
        {
            "type": "xianxia-cave",
            "name": "仙侠洞穴",
            "skyColor": 3355443,
            "groundColor": 6710886,
            "fogColor": 3355443,
            "fogNear": 5,
            "fogFar": 20,
            "features": [
                "spirit crystals",
                "ancient inscriptions",
                "magical beasts"
            ],
            "imageUrl": "Images/map-background-5.png"
        },
        {
            "type": "xianxia-heaven",
            "name": "仙侠仙境",
            "skyColor": 8900331,
            "groundColor": 16777215,
            "fogColor": 8900331,
            "fogNear": 10,
            "fogFar": 50,
            "features": [
                "floating islands",
                "celestial palaces",
                "divine beasts"
            ],
            "imageUrl": "Images/map-background-6.png"
        },
        {
            "type": "xianxia-volcano",
            "name": "仙侠火山",
            "skyColor": 16737843,
            "groundColor": 9127187,
            "fogColor": 16737843,
            "fogNear": 10,
            "fogFar": 50,
            "features": [
                "magical lava",
                "fire spirits",
                "ancient fire temples"
            ],
            "imageUrl": "Images/map-background-7.png"
        },
        {
            "type": "xianxia-beach",
            "name": "仙侠海滩",
            "skyColor": 8900331,
            "groundColor": 16777164,
            "fogColor": 8900331,
            "fogNear": 10,
            "fogFar": 50,
            "features": [
                "golden sand",
                "magical pearls",
                "sea spirits"
            ],
            "imageUrl": "Images/map-background-8.png"
        },
        {
            "type": "xianxia-plains",
            "name": "仙侠平原",
            "skyColor": 8900331,
            "groundColor": 9498256,
            "fogColor": 8900331,
            "fogNear": 10,
            "fogFar": 50,
            "features": [
                "ancient battlefields",
                "spirit herbs",
                "wandering cultivators"
            ],
            "imageUrl": "Images/map-background-9.png"
        },
        {
            "type": "xianxia-canyon",
            "name": "仙侠峡谷",
            "skyColor": 8900331,
            "groundColor": 9127187,
            "fogColor": 8900331,
            "fogNear": 10,
            "fogFar": 50,
            "features": [
                "deep gorges",
                "ancient bridges",
                "wind spirits"
            ],
            "imageUrl": "Images/map-background-10.png"
        }
    ]
};

export default gameMetadata;