// 游戏元数据 - 共享的游戏数据

const gameMetadata = {
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
        },
        {
            name: "山妖",
            baseHp: 75,
            baseAttack: 14,
            baseDefense: 5,
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
            name: "强力攻击",
            description: "造成2倍普通伤害",
            energyCost: 20,
            damageMultiplier: 2,
            levelRequired: 1
        },
        {
            name: "防御姿态",
            description: "本回合减少50%受到的伤害",
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
            level: 1,
            exp: 0,
            maxExp: 100,
            attack: 10,
            defense: 5,
            hp: 100,
            maxHp: 100,
            luck: 2,
            energy: 100,
            maxEnergy: 100
        },
        // 升级属性增长
        levelUpStats: {
            attack: 2,
            defense: 1,
            maxHp: 20,
            luck: 0.5,
            maxEnergy: 10
        },
        // 回复速度（每秒）
        regenRates: {
            hp: 0.5, // 每秒恢复0.5点生命值
            energy: 2 // 每秒恢复2点能量
        }
    },
    
    // 资源元数据
    resources: {
        types: [
            {
                name: "wood",
                displayName: "木材",
                initialAmount: 0,
                baseRate: 1,
                description: "基础资源，用于装备精炼"
            },
            {
                name: "iron",
                displayName: "铁矿",
                initialAmount: 0,
                baseRate: 0.5,
                description: "中级资源，用于装备精炼"
            },
            {
                name: "crystal",
                displayName: "水晶",
                initialAmount: 0,
                baseRate: 0.2,
                description: "高级资源，用于装备精炼"
            }
        ]
    },
    
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