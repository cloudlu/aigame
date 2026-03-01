// 游戏元数据 - 共享的游戏数据

const gameMetadata = {
    // 装备品质定义
    equipmentRarities: [
        { name: "white", displayName: "白色", multiplier: 1, realmPhase: "前期", statCount: 1 },
        { name: "green", displayName: "绿色", multiplier: 1.5, realmPhase: "前期", statCount: 1 },
        { name: "blue", displayName: "蓝色", multiplier: 2, realmPhase: "中期", statCount: 2 },
        { name: "cyan", displayName: "青色", multiplier: 2.5, realmPhase: "中期", statCount: 2 },
        { name: "purple", displayName: "紫色", multiplier: 3, realmPhase: "后期", statCount: 3 },
        { name: "pink", displayName: "粉色", multiplier: 3.5, realmPhase: "后期", statCount: 3 },
        { name: "gold", displayName: "黄金", multiplier: 4, realmPhase: "大圆满", statCount: 4 },
        { name: "legendary", displayName: "传奇", multiplier: 5, realmPhase: "大圆满", statCount: 4 }
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
    
    // 装备掉落概率
    dropRates: {
        white: 0.3,
        green: 0.25,
        blue: 0.2,
        cyan: 0.1,
        purple: 0.08,
        pink: 0.04,
        gold: 0.02,
        legendary: 0.01
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
            name: "妖狐",
            baseHp: 40,
            baseAttack: 10,
            baseDefense: 3,
            baseSpeed: 14,
            baseAccuracy: 92,
            baseDodge: 20,
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
            baseHp: 70,
            baseAttack: 14,
            baseDefense: 4,
            baseSpeed: 9,
            baseAccuracy: 90,
            baseDodge: 12,
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
            baseSpeed: 15,
            baseAccuracy: 94,
            baseDodge: 18,
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
            baseSpeed: 5,
            baseAccuracy: 85,
            baseDodge: 4,
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
            baseHp: 90,
            baseAttack: 22,
            baseDefense: 4,
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
            baseHp: 75,
            baseAttack: 14,
            baseDefense: 5,
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
            baseHp: 100,
            baseAttack: 12,
            baseDefense: 8,
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
            baseHp: 60,
            baseAttack: 16,
            baseDefense: 4,
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
            baseHp: 90,
            baseAttack: 13,
            baseDefense: 7,
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
            baseHp: 85,
            baseAttack: 15,
            baseDefense: 5,
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
            baseHp: 95,
            baseAttack: 12,
            baseDefense: 6,
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
            baseHp: 55,
            baseAttack: 14,
            baseDefense: 3,
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
            baseHp: 45,
            baseAttack: 18,
            baseDefense: 2,
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
            baseHp: 65,
            baseAttack: 13,
            baseDefense: 4,
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
            baseHp: 80,
            baseAttack: 11,
            baseDefense: 6,
            baseSpeed: 7,
            baseAccuracy: 87,
            baseDodge: 7,
            expMultiplier: 1.7,
            resourceMultiplier: 1.25,
            icon: "fa-tree",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20wood%20monster%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "蛟蛇",
            baseHp: 85,
            baseAttack: 16,
            baseDefense: 4,
            baseSpeed: 11,
            baseAccuracy: 91,
            baseDodge: 15,
            expMultiplier: 1.75,
            resourceMultiplier: 1.3,
            icon: "fa-dragon",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20water%20serpent%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "龟妖",
            baseHp: 110,
            baseAttack: 10,
            baseDefense: 9,
            baseSpeed: 3,
            baseAccuracy: 85,
            baseDodge: 2,
            expMultiplier: 2.0,
            resourceMultiplier: 1.4,
            icon: "fa-tint",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20turtle%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "鱼精",
            baseHp: 40,
            baseAttack: 12,
            baseDefense: 2,
            baseSpeed: 13,
            baseAccuracy: 90,
            baseDodge: 18,
            expMultiplier: 1.3,
            resourceMultiplier: 1.1,
            icon: "fa-tint",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20fish%20spirit%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "水仙",
            baseHp: 50,
            baseAttack: 15,
            baseDefense: 3,
            baseSpeed: 12,
            baseAccuracy: 92,
            baseDodge: 15,
            expMultiplier: 1.5,
            resourceMultiplier: 1.15,
            icon: "fa-tint",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20water%20fairy%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "沙妖",
            baseHp: 70,
            baseAttack: 14,
            baseDefense: 5,
            baseSpeed: 9,
            baseAccuracy: 89,
            baseDodge: 10,
            expMultiplier: 1.6,
            resourceMultiplier: 1.25,
            icon: "fa-mountain",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20sand%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "蝎精",
            baseHp: 65,
            baseAttack: 17,
            baseDefense: 3,
            baseSpeed: 11,
            baseAccuracy: 92,
            baseDodge: 12,
            expMultiplier: 1.65,
            resourceMultiplier: 1.25,
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
            baseHp: 95,
            baseAttack: 15,
            baseDefense: 6,
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
            baseHp: 35,
            baseAttack: 12,
            baseDefense: 2,
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
            baseHp: 55,
            baseAttack: 14,
            baseDefense: 3,
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
            baseHp: 70,
            baseAttack: 10,
            baseDefense: 5,
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
            baseHp: 45,
            baseAttack: 16,
            baseDefense: 2,
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
            baseHp: 120,
            baseAttack: 18,
            baseDefense: 7,
            baseSpeed: 4,
            baseAccuracy: 85,
            baseDodge: 3,
            expMultiplier: 2.2,
            resourceMultiplier: 1.6,
            icon: "fa-fire",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20lava%20beast%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "凤凰",
            baseHp: 85,
            baseAttack: 20,
            baseDefense: 4,
            baseSpeed: 17,
            baseAccuracy: 95,
            baseDodge: 22,
            expMultiplier: 1.9,
            resourceMultiplier: 1.4,
            icon: "fa-fire",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20phoenix%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "火凤凰",
            baseHp: 95,
            baseAttack: 22,
            baseDefense: 5,
            baseSpeed: 18,
            baseAccuracy: 96,
            baseDodge: 25,
            expMultiplier: 2.0,
            resourceMultiplier: 1.45,
            icon: "fa-fire",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20fire%20phoenix%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "仙鹤",
            baseHp: 60,
            baseAttack: 14,
            baseDefense: 4,
            baseSpeed: 20,
            baseAccuracy: 94,
            baseDodge: 28,
            expMultiplier: 1.6,
            resourceMultiplier: 1.2,
            icon: "fa-dove",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20celestial%20crane%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "麒麟",
            baseHp: 110,
            baseAttack: 19,
            baseDefense: 7,
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
            baseHp: 130,
            baseAttack: 21,
            baseDefense: 8,
            baseSpeed: 10,
            baseAccuracy: 93,
            baseDodge: 12,
            expMultiplier: 2.3,
            resourceMultiplier: 1.65,
            icon: "fa-dragon",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20dragon%20king%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "海妖",
            baseHp: 75,
            baseAttack: 16,
            baseDefense: 4,
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
            baseHp: 105,
            baseAttack: 15,
            baseDefense: 6,
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
            baseHp: 65,
            baseAttack: 17,
            baseDefense: 3,
            baseSpeed: 13,
            baseAccuracy: 92,
            baseDodge: 18,
            expMultiplier: 1.65,
            resourceMultiplier: 1.25,
            icon: "fa-user",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20mermaid%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        }
    ],
    
    // 地图与敌人的映射关系
    mapEnemyMapping: {
        "xianxia-mountain": ["山妖", "岩怪", "神雕", "石精", "山魈", "山精", "风魔", "雷兽", "麒麟", "岩巨人", "山神", "山鬼", "山妖王", "岩妖", "石怪", "山魈王", "神雕王", "石精王", "岩怪王", "山妖王"],
        "xianxia-forest": ["树精", "花妖", "狐仙", "鹿灵", "木怪", "妖狐", "风魔", "树妖", "花仙", "狐妖", "鹿妖", "木妖", "树精王", "花妖王", "狐仙王", "鹿灵王", "木怪王", "森林守护者", "森林精灵", "森林之王"],
        "xianxia-lake": ["水怪", "蛟蛇", "龟妖", "鱼精", "水仙", "鲛人", "海妖", "海怪", "龙王", "水精灵", "湖妖", "水妖", "水怪王", "蛟蛇王", "龟妖王", "鱼精王", "水仙王", "鲛人王", "海妖王", "龙王"],
        "xianxia-desert": ["沙妖", "蝎精", "蛇怪", "沙漠巨蜥", "沙虫", "风魔", "土妖", "沙漠精灵", "沙漠巨人", "沙漠守护者", "沙妖王", "蝎精王", "蛇怪王", "沙漠巨蜥王", "沙虫王", "沙漠领主", "沙漠守护神", "沙漠妖皇", "沙漠兽王", "沙漠尊者"],
        "xianxia-cave": ["洞穴蝙蝠", "石怪", "蜘蛛精", "蚯蚓怪", "洞穴幽灵", "土妖", "岩怪", "石精", "洞穴守护者", "洞穴精灵", "洞穴蝙蝠王", "石怪王", "蜘蛛精王", "蚯蚓怪王", "洞穴幽灵王", "洞穴领主", "洞穴守护神", "洞穴妖皇", "洞穴兽王", "洞穴尊者"],
        "xianxia-heaven": ["仙鹤", "麒麟", "凤凰", "火凤凰", "雷兽", "风魔", "天庭守卫", "天仙境者", "天庭神将", "天庭仙女", "仙鹤王", "麒麟王", "凤凰王", "火凤凰王", "雷兽王", "风魔王", "天庭守护者", "天仙境主", "天庭神将", "天庭仙女"],
        "xianxia-volcano": ["火灵", "熔岩巨兽", "凤凰", "火凤凰", "火妖", "火山精灵", "火山守护者", "熔岩巨人", "火凤凰王", "火灵王", "熔岩巨兽王", "火山领主", "火山守护神", "火山妖皇", "火山兽王", "火山尊者", "火凤凰", "熔岩巨兽", "火灵", "火山精灵"],
        "xianxia-beach": ["水怪", "鱼精", "鲛人", "海妖", "海怪", "龙王", "海滩精灵", "海滩守护者", "水怪王", "鱼精王", "鲛人王", "海妖王", "海怪王", "龙王", "海滩领主", "海滩守护神", "海滩妖皇", "海滩兽王", "海滩尊者", "海精灵"]
    },
    
    // 地图等级范围
    mapLevelRanges: {
        "xianxia-mountain": { min: 1, max: 10 },
        "xianxia-forest": { min: 5, max: 15 },
        "xianxia-lake": { min: 10, max: 20 },
        "xianxia-desert": { min: 15, max: 25 },
        "xianxia-cave": { min: 20, max: 30 },
        "xianxia-heaven": { min: 25, max: 35 },
        "xianxia-volcano": { min: 30, max: 40 },
        "xianxia-beach": { min: 1, max: 10 }
    },
    
    // 特殊技
    skills: [
        {
            name: "重击",
            description: "造成1.5倍普通伤害",
            energyCost: 15,
            damageMultiplier: 1.5,
            levelRequired: 1,
            realmRequired: 0
        },
        {
            name: "闪避",
            description: "提高闪避率，本回合有30%几率闪避攻击",
            energyCost: 10,
            dodgeBonus: 0.3,
            levelRequired: 5,
            realmRequired: 0
        },
        {
            name: "耐力恢复",
            description: "恢复10%最大生命值",
            energyCost: 20,
            healPercentage: 0.1,
            levelRequired: 15,
            realmRequired: 0
        },
        {
            name: "强力攻击",
            description: "造成2倍普通伤害",
            energyCost: 20,
            damageMultiplier: 2,
            levelRequired: 1,
            realmRequired: 1
        },
        {
            name: "防御姿态",
            description: "本回合减少50%受到的伤害",
            energyCost: 15,
            defenseBonus: 0.5,
            levelRequired: 10,
            realmRequired: 1
        },
        {
            name: "生命恢复",
            description: "恢复20%最大生命值",
            energyCost: 25,
            healPercentage: 0.2,
            levelRequired: 20,
            realmRequired: 1
        },
        {
            name: "幸运一击",
            description: "有几率造成3倍伤害",
            energyCost: 30,
            criticalMultiplier: 3,
            criticalChance: 0.7,
            levelRequired: 30,
            realmRequired: 1
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
            energy: 2 // 每秒恢复2点能量
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
                displayName: "灵晶",
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