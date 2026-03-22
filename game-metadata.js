// 游戏元数据 - 共享的游戏数据

const gameMetadata = {
    // 装备品质定义（简化为5个品质：白、蓝、紫、金、彩）
    // multiplier: 整数属性乘数，pctMultiplier: 百分比属性乘数
    equipmentRarities: [
        { name: "white", displayName: "白色", multiplier: 1.0, pctMultiplier: 1.0, statCount: 1 },
        { name: "blue", displayName: "蓝色", multiplier: 1.5, pctMultiplier: 1.2, statCount: 2 },
        { name: "purple", displayName: "紫色", multiplier: 2.2, pctMultiplier: 1.4, statCount: 3 },
        { name: "spiritStones", displayName: "黄金", multiplier: 3.2, pctMultiplier: 1.6, statCount: 4 },
        { name: "rainbow", displayName: "彩色", multiplier: 4.5, pctMultiplier: 2.0, statCount: 5 }
    ],
    
    // 装备模板
    equipmentTemplates: [
        {
            type: "weapon",
            baseStats: { attack: 5, speed: 2, luck: 2, criticalRate: 0.05, critDamage: 10 },
            // 剑、刀、枪、棍、斧、杖（6后缀 × 6境界）
            nameSuffixes: [
                ['铁剑','钢刀','木枪','木棍','石斧','木杖'],         // 武者境
                ['长剑','长刀','长枪','齐眉棍','战斧','法杖'],       // 炼气境
                ['重剑','大刀','重枪','哨棒','巨斧','灵杖'],         // 筑基境
                ['宝剑','宝刀','银枪','降魔棍','金斧','仙杖'],       // 金丹境
                ['神剑','神刀','神枪','神棍','神斧','神杖'],         // 元婴境
                ['天剑','天刀','天枪','天棍','天斧','天杖']          // 化神境
            ]
        },
        {
            type: "armor",
            baseStats: { defense: 3, hp: 8, speed: 1, dodgeRate: 0.05 },
            // 袍、衣、铠、甲、衫、褂（6后缀 × 6境界）
            nameSuffixes: [
                ['布袍','布衣','皮铠','铁甲','布衫','布褂'],         // 武者境
                ['长袍','法衣','铜铠','银甲','道衫','道褂'],         // 炼气境
                ['战袍','战衣','精铁铠','金甲','武衫','战褂'],       // 筑基境
                ['宝袍','宝衣','宝铠','宝甲','仙衫','宝褂'],         // 金丹境
                ['神袍','神衣','神铠','神甲','神衫','神褂'],         // 元婴境
                ['天袍','天衣','天铠','天甲','天衫','天褂']          // 化神境
            ]
        },
        {
            type: "helmet",
            baseStats: { defense: 2, hp: 10, luck: 2, accuracy: 0.1 },
            // 冠、帽、盔、巾、环、带（6后缀 × 6境界）
            nameSuffixes: [
                ['布冠','布帽','皮盔','头巾','铁环','布带'],         // 武者境
                ['道冠','道帽','铁盔','方巾','银环','丝带'],         // 炼气境
                ['玉冠','玉帽','精铁盔','武巾','金环','锦带'],       // 筑基境
                ['宝冠','宝帽','宝盔','仙巾','宝环','宝带'],         // 金丹境
                ['神冠','神帽','神盔','神巾','神环','神带'],         // 元婴境
                ['天冠','天帽','天盔','天巾','天环','天带']          // 化神境
            ]
        },
        {
            type: "boots",
            baseStats: { defense: 1, luck: 1, speed: 3, moveSpeed: 0.1 },
            // 靴、鞋、履、步、行、踏（6后缀 × 6境界）
            nameSuffixes: [
                ['布靴','布鞋','草履','木步','铁行','布踏'],         // 武者境
                ['道靴','道鞋','布履','云步','银行','云踏'],         // 炼气境
                ['战靴','战鞋','皮履','风步','金行','风踏'],         // 筑基境
                ['宝靴','宝鞋','宝履','飞步','宝行','宝踏'],         // 金丹境
                ['神靴','神鞋','神履','神步','神行','神踏'],         // 元婴境
                ['天靴','天鞋','天履','天步','天行','天踏']          // 化神境
            ]
        },
        {
            type: "pants",
            baseStats: { defense: 2, hp: 8, speed: 2, tenacity: 0.05 },
            // 裙、裳、裤、绔、袴、服（6后缀 × 6境界）
            nameSuffixes: [
                ['布裙','布裳','麻裤','布绔','粗袴','短服'],         // 武者境
                ['道裙','道裳','丝裤','丝绔','锦袴','道服'],         // 炼气境
                ['战裙','战裳','革裤','革绔','锦袴','战服'],         // 筑基境
                ['宝裙','宝裳','宝裤','宝绔','仙袴','仙服'],         // 金丹境
                ['神裙','神裳','神裤','神绔','神袴','神服'],         // 元婴境
                ['天裙','天裳','天裤','天绔','天袴','天服']          // 化神境
            ]
        },
        {
            type: "amulet",
            baseStats: { luck: 3, maxEnergy: 15, speed: 2, energyRegen: 0.05 },  // 改为加灵力上限
            // 符、佩、牌、坠、珠、玉（6后缀 × 6境界）
            nameSuffixes: [
                ['木符','木佩','铁牌','石坠','木珠','原玉'],         // 武者境
                ['灵符','玉佩','铜牌','银坠','灵珠','灵玉'],         // 炼气境
                ['宝符','宝佩','银牌','金坠','宝珠','宝玉'],         // 筑基境
                ['仙符','仙佩','金牌','宝坠','仙珠','仙玉'],         // 金丹境
                ['神符','神佩','神牌','神坠','神珠','神玉'],         // 元婴境
                ['天符','天佩','天牌','天坠','天珠','天玉']          // 化神境
            ]
        },
        {
            type: "spiritTreasure",
            baseStats: { luck: 3, maxEnergy: 20, energyRegen: 0.08, speed: 2 },  // 改为加灵力上限
            // 珠、鼎、鉴、钟、莲、塔（6后缀 × 6境界）
            nameSuffixes: [
                ['木珠','木鼎','铜鉴','铁钟','铜莲','木塔'],         // 武者境
                ['灵珠','灵鼎','灵鉴','道钟','灵莲','石塔'],         // 炼气境
                ['宝珠','宝鼎','宝鉴','金钟','宝莲','宝塔'],         // 筑基境
                ['仙珠','仙鼎','仙鉴','仙钟','仙莲','仙塔'],         // 金丹境
                ['神珠','神鼎','神鉴','神钟','神莲','神塔'],         // 元婴境
                ['天珠','天鼎','天鉴','天钟','天莲','天塔']          // 化神境
            ]
        },
        {
            type: "magicArtifact",
            baseStats: { attack: 4, defense: 2, hp: 8, criticalRate: 0.08 },
            // 杖、扇、铃、印、幡、鼎（6后缀 × 6境界）
            nameSuffixes: [
                ['木杖','木扇','铜铃','木印','布幡','铜鼎'],         // 武者境
                ['法杖','灵扇','银铃','法印','灵幡','法鼎'],         // 炼气境
                ['灵杖','宝扇','金铃','宝印','宝幡','宝鼎'],         // 筑基境
                ['仙杖','仙扇','仙铃','仙印','仙幡','仙鼎'],         // 金丹境
                ['神杖','神扇','神铃','神印','神幡','神鼎'],         // 元婴境
                ['天杖','天扇','天铃','天印','天幡','天鼎']          // 化神境
            ]
        }
    ],

    // 装备槽位统一配置（新增装备只需在此添加一条）
    equipmentSlotConfig: {
        weapon:         { name: '武器', icon: 'fa-sword',        image: 'Images/weapon-sword.jpg',       fallbackIcon: 'fa-sword',        order: 1 },
        helmet:         { name: '头盔', icon: 'fa-hat-wizard',   image: 'Images/helmet.jpg',             fallbackIcon: 'fa-hat-wizard',   order: 2 },
        armor:          { name: '护甲', icon: 'fa-shield',       image: 'Images/armor-chestplate.jpg',   fallbackIcon: 'fa-shield',       order: 3 },
        spiritTreasure: { name: '灵宝', icon: 'fa-gem',          image: 'Images/spirit-treasure.jpg',    fallbackIcon: 'fa-gem',          order: 4 },
        pants:          { name: '下裳', icon: 'fa-user',         image: 'Images/pants.jpg',              fallbackIcon: 'fa-user',         order: 5 },
        boots:          { name: '靴子', icon: 'fa-shoe-prints',  image: 'Images/boots.jpg',              fallbackIcon: 'fa-shoe-prints',  order: 6 },
        magicArtifact:  { name: '法器', icon: 'fa-wand-sparkles',image: 'Images/magic-artifact.jpg',     fallbackIcon: 'fa-wand-sparkles',order: 7 },
        amulet:         { name: '护符', icon: 'fa-scroll',       image: 'Images/amulet.jpg',             fallbackIcon: 'fa-scroll',       order: 8 }
    },

    // 装备前缀按境界×品质分级 [realm][rarityIndex]
    // rarityIndex: 0=白, 1=蓝, 2=紫, 3=金, 4=彩
    // 注意：白色品质统一使用朴素材质（铁/铜类），避免与资源名（灵木、玄铁、灵石）冲突
    equipmentPrefixesByRealm: [
        // 武者境 (realm 0)
        ["凡铁", "精钢", "百炼", "青铜", "白银"],
        // 炼气境 (realm 1)
        ["青铜", "寒铁", "青玉", "紫玉", "水晶"],
        // 筑基境 (realm 2)
        ["精铁", "龙泉", "紫金", "玄冰", "天蚕"],
        // 金丹境 (realm 3)
        ["寒铁", "紫霄", "太乙", "天罡", "玄冥"],
        // 元婴境 (realm 4)
        ["仙铜", "九天", "混元", "太虚", "两仪"],
        // 化神境 (realm 5)
        ["苍铁", "鸿蒙", "混沌", "须弥", "造化"]
    ],
    
    // 装备掉落概率配置（5个品质：白、蓝、紫、金、彩）
    dropRates: {
        // 普通怪物掉率
        normal: {
            white: 0.50,
            blue: 0.30,
            purple: 0.148,
            spiritStones: 0.05,
            rainbow: 0.002   // 0.2%（原1%）
        },
        // 精英怪物掉率
        elite: {
            white: 0.30,
            blue: 0.35,
            purple: 0.20,
            spiritStones: 0.145,
            rainbow: 0.005   // 0.5%（原3%）
        },
        // BOSS掉率
        boss: {
            white: 0.10,
            blue: 0.30,
            purple: 0.30,
            spiritStones: 0.285,
            rainbow: 0.015   // 1.5%（原8%）
        }
    },
    
    // 敌人类型
    enemyTypes: [
        {
            name: "雪原狼",
            baseHp: 28,
            baseAttack: 7,
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
            baseHp: 48,
            baseAttack: 11,
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
            baseHp: 48,
            baseAttack: 13,
            baseDefense: 5,
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
            baseHp: 130,
            baseAttack: 48,
            baseDefense: 14,
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
            baseHp: 50,
            baseAttack: 9,
            baseDefense: 5,
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
            baseHp: 42,
            baseAttack: 8,
            baseDefense: 4,
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
            baseHp: 52,
            baseAttack: 9,
            baseDefense: 5,
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
            baseHp: 65,
            baseAttack: 14,
            baseDefense: 6,
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
            baseHp: 90,
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
            baseHp: 140,
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
            baseHp: 64,
            baseAttack: 39,
            baseDefense: 14,
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
            baseHp: 65,
            baseAttack: 42,
            baseDefense: 14,
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
            baseHp: 112,
            baseAttack: 35,
            baseDefense: 13,
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
            baseHp: 128,
            baseAttack: 38,
            baseDefense: 16,
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
            baseHp: 100,
            baseAttack: 54,
            baseDefense: 23,
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
            baseHp: 116,
            baseAttack: 61,
            baseDefense: 26,
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
            baseHp: 48,
            baseAttack: 12,
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
            baseHp: 170,
            baseAttack: 54,
            baseDefense: 25,
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
            baseHp: 116,
            baseAttack: 53,
            baseDefense: 13,
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
            baseHp: 32,
            baseAttack: 8,
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
            baseHp: 45,
            baseAttack: 18,
            baseDefense: 7,
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
            baseHp: 36,
            baseAttack: 9,
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
            baseHp: 40,
            baseAttack: 15,
            baseDefense: 6,
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
            baseHp: 40,
            baseAttack: 10,
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
            baseHp: 160,
            baseAttack: 34,
            baseDefense: 10,
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
            baseHp: 110,
            baseAttack: 38,
            baseDefense: 14,
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
            baseHp: 104,
            baseAttack: 34,
            baseDefense: 19,
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
            baseHp: 75,
            baseAttack: 16,
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
            baseHp: 96,
            baseAttack: 44,
            baseDefense: 14,
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
            baseHp: 76,
            baseAttack: 42,
            baseDefense: 8,
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
            baseHp: 90,
            baseAttack: 45,
            baseDefense: 10,
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
            baseHp: 120,
            baseAttack: 38,
            baseDefense: 14,
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
            baseHp: 80,
            baseAttack: 48,
            baseDefense: 8,
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
            baseHp: 124,
            baseAttack: 52,
            baseDefense: 12,
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
            baseHp: 110,
            baseAttack: 54,
            baseDefense: 13,
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
            baseHp: 144,
            baseAttack: 56,
            baseDefense: 22,
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
            baseHp: 40,
            baseAttack: 16,
            baseDefense: 6,
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
            baseHp: 170,
            baseAttack: 35,
            baseDefense: 15,
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
            baseHp: 176,
            baseAttack: 66,
            baseDefense: 28,
            baseSpeed: 12,
            baseAccuracy: 97,
            baseDodge: 18,
            expMultiplier: 2.8,
            resourceMultiplier: 1.95,
            icon: "fa-crown",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20primordial%20celestial%20lord%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        // ========== 副本专用敌人 ==========
        {
            name: "矿石怪",
            baseHp: 55,
            baseAttack: 12,
            baseDefense: 8,
            baseSpeed: 6,
            baseAccuracy: 85,
            baseDodge: 5,
            expMultiplier: 1.5,
            resourceMultiplier: 1.2,
            icon: "fa-gem",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20ore%20monster%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "矿工幽灵",
            baseHp: 45,
            baseAttack: 15,
            baseDefense: 5,
            baseSpeed: 12,
            baseAccuracy: 90,
            baseDodge: 20,
            expMultiplier: 1.6,
            resourceMultiplier: 1.25,
            icon: "fa-ghost",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20miner%20ghost%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "精英石巨人",
            baseHp: 120,
            baseAttack: 28,
            baseDefense: 15,
            baseSpeed: 5,
            baseAccuracy: 80,
            baseDodge: 3,
            expMultiplier: 2.5,
            resourceMultiplier: 1.8,
            icon: "fa-monument",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20elite%20stone%20golem%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "花仙子",
            baseHp: 42,
            baseAttack: 11,
            baseDefense: 4,
            baseSpeed: 10,
            baseAccuracy: 88,
            baseDodge: 18,
            expMultiplier: 1.5,
            resourceMultiplier: 1.2,
            icon: "fa-spa",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20flower%20fairy%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "千年树妖",
            baseHp: 130,
            baseAttack: 30,
            baseDefense: 12,
            baseSpeed: 6,
            baseAccuracy: 85,
            baseDodge: 8,
            expMultiplier: 2.5,
            resourceMultiplier: 1.8,
            icon: "fa-tree",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20millennium%20tree%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "铁甲兽",
            baseHp: 65,
            baseAttack: 14,
            baseDefense: 10,
            baseSpeed: 7,
            baseAccuracy: 85,
            baseDodge: 6,
            expMultiplier: 1.6,
            resourceMultiplier: 1.3,
            icon: "fa-dragon",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20iron%20armored%20beast%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "矿石魔",
            baseHp: 58,
            baseAttack: 16,
            baseDefense: 9,
            baseSpeed: 5,
            baseAccuracy: 82,
            baseDodge: 4,
            expMultiplier: 1.5,
            resourceMultiplier: 1.25,
            icon: "fa-cube",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20ore%20demon%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "熔岩怪",
            baseHp: 70,
            baseAttack: 18,
            baseDefense: 11,
            baseSpeed: 4,
            baseAccuracy: 80,
            baseDodge: 3,
            expMultiplier: 1.7,
            resourceMultiplier: 1.35,
            icon: "fa-fire",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20lava%20monster%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        {
            name: "熔岩巨人",
            baseHp: 140,
            baseAttack: 32,
            baseDefense: 16,
            baseSpeed: 5,
            baseAccuracy: 78,
            baseDodge: 4,
            expMultiplier: 2.8,
            resourceMultiplier: 2.0,
            icon: "fa-fire-alt",
            image: "https://neeko-copilot.bytedance.net/api/text2image?prompt=cartoon%20lava%20giant%2C%20chinese%20xianxia%20style%2C%20cute%20style%2C%20simple%20background&size=512x512"
        },
        // ========== 以下是原有的敌人 ==========
        {
            name: "海妖",
            baseHp: 120,
            baseAttack: 25,
            baseDefense: 11,
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
            baseHp: 150,
            baseAttack: 30,
            baseDefense: 13,
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
            baseHp: 100,
            baseAttack: 20,
            baseDefense: 9,
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
            baseHp: 110,
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
                    description: '凝聚力量，造成1.2倍伤害',
                    stageRequired: 1,
                    energyCost: 12,
                    damageMultiplier: 1.2
                },
                {
                    name: 'heavyStrike_lv2',
                    description: '全力一击，造成1.3倍伤害',
                    stageRequired: 4,
                    energyCost: 14,
                    damageMultiplier: 1.3
                },
                {
                    name: 'heavyStrike_lv3',
                    description: '爆发力量，造成1.4倍伤害',
                    stageRequired: 7,
                    energyCost: 16,
                    damageMultiplier: 1.4
                },
                {
                    name: 'heavyStrike_lv4',
                    description: '武者境巅峰，造成1.5倍伤害，+5%暴击率',
                    stageRequired: 10,
                    energyCost: 20,
                    damageMultiplier: 1.5,
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
                    description: '凝聚气刃，造成1.4倍伤害',
                    stageRequired: 1,
                    energyCost: 15,
                    damageMultiplier: 1.4
                },
                {
                    name: 'qiBlade_lv2',
                    description: '强化气刃，造成1.5倍伤害，+5%暴击率',
                    stageRequired: 4,
                    energyCost: 18,
                    damageMultiplier: 1.5,
                    criticalBonus: 0.05
                },
                {
                    name: 'qiBlade_lv3',
                    description: '气刃爆发，造成1.7倍伤害，额外造成5%敌人最大生命伤害',
                    stageRequired: 7,
                    energyCost: 22,
                    damageMultiplier: 1.7,
                    extraDamagePercent: 0.05
                },
                {
                    name: 'qiBlade_lv4',
                    description: '炼气境巅峰，造成1.9倍伤害，额外造成10%敌人最大生命伤害',
                    stageRequired: 10,
                    energyCost: 28,
                    damageMultiplier: 1.9,
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
                    description: '剑气斩击，造成1.7倍伤害',
                    stageRequired: 1,
                    energyCost: 20,
                    damageMultiplier: 1.7
                },
                {
                    name: 'foundationSlash_lv2',
                    description: '强化剑气，造成1.8倍伤害，无视15%防御',
                    stageRequired: 4,
                    energyCost: 25,
                    damageMultiplier: 1.8,
                    armorPenetration: 0.15
                },
                {
                    name: 'foundationSlash_lv3',
                    description: '剑气爆发，造成2.0倍伤害，无视25%防御',
                    stageRequired: 7,
                    energyCost: 32,
                    damageMultiplier: 2.0,
                    armorPenetration: 0.25
                },
                {
                    name: 'foundationSlash_lv4',
                    description: '筑基境巅峰，造成2.2倍伤害，无视30%防御，+10%暴击率',
                    stageRequired: 10,
                    energyCost: 40,
                    damageMultiplier: 2.2,
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
            id: 'spiritStonesenCore',
            name: '金丹掌系',
            realmRequired: 3,
            type: 'attack',
            baseDisplayName: '紫焰掌',
            baseImageId: 13,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
            baseEffectColor: { r: 1, g: 0.8, b: 0 },
            levels: [
                {
                    name: 'spiritStonesenCore_lv1',
                    description: '金丹之力，造成2.0倍伤害',
                    stageRequired: 1,
                    energyCost: 25,
                    damageMultiplier: 2.0
                },
                {
                    name: 'spiritStonesenCore_lv2',
                    description: '强化金丹掌，造成2.2倍伤害，眩晕敌人1回合',
                    stageRequired: 4,
                    energyCost: 32,
                    damageMultiplier: 2.2,
                    stun: 1
                },
                {
                    name: 'spiritStonesenCore_lv3',
                    description: '金丹爆发，造成2.3倍伤害，眩晕1回合，无视20%防御',
                    stageRequired: 7,
                    energyCost: 40,
                    damageMultiplier: 2.3,
                    stun: 1,
                    armorPenetration: 0.2
                },
                {
                    name: 'spiritStonesenCore_lv4',
                    description: '金丹境巅峰，造成2.5倍伤害，眩晕2回合，无视30%防御',
                    stageRequired: 10,
                    energyCost: 52,
                    damageMultiplier: 2.5,
                    stun: 2,
                    armorPenetration: 0.3
                }
            ]
        },
        {
            id: 'spiritStonesenArmor',
            name: '金丹甲系',
            realmRequired: 3,
            type: 'defense',
            baseDisplayName: '金光护体',
            baseImageId: 14,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
            baseEffectColor: { r: 1, g: 0.9, b: 0.3 },
            levels: [
                {
                    name: 'spiritStonesenArmor_lv1',
                    description: '减伤50%，护盾吸收300点伤害',
                    stageRequired: 1,
                    energyCost: 28,
                    defenseBonus: 0.5,
                    shield: 300
                },
                {
                    name: 'spiritStonesenArmor_lv2',
                    description: '减伤55%，护盾吸收400点伤害，反弹10%伤害',
                    stageRequired: 4,
                    energyCost: 35,
                    defenseBonus: 0.55,
                    shield: 400,
                    reflectDamage: 0.1
                },
                {
                    name: 'spiritStonesenArmor_lv3',
                    description: '减伤60%，护盾吸收500点伤害，反弹15%伤害',
                    stageRequired: 7,
                    energyCost: 45,
                    defenseBonus: 0.6,
                    shield: 500,
                    reflectDamage: 0.15
                },
                {
                    name: 'spiritStonesenArmor_lv4',
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
            id: 'spiritStonesenHeal',
            name: '金丹治疗系',
            realmRequired: 3,
            type: 'recovery',
            baseDisplayName: '涅槃之光',
            baseImageId: 15,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
            baseEffectColor: { r: 0.6, g: 1, b: 0.6 },
            levels: [
                {
                    name: 'spiritStonesenHeal_lv1',
                    description: '恢复42%最大HP',
                    stageRequired: 1,
                    energyCost: 30,
                    healPercentage: 0.42
                },
                {
                    name: 'spiritStonesenHeal_lv2',
                    description: '恢复48%最大HP，恢复30点灵力',
                    stageRequired: 4,
                    energyCost: 36,
                    healPercentage: 0.48,
                    energyRecover: 30
                },
                {
                    name: 'spiritStonesenHeal_lv3',
                    description: '恢复55%最大HP，恢复40点灵力，清除负面状态',
                    stageRequired: 7,
                    energyCost: 42,
                    healPercentage: 0.55,
                    energyRecover: 40,
                    purify: true
                },
                {
                    name: 'spiritStonesenHeal_lv4',
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
            id: 'spiritStonesenCorePower',
            name: '金丹之力系',
            realmRequired: 3,
            type: 'special',
            baseDisplayName: '丹火焚天',
            baseImageId: 16,
            baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
            baseEffectColor: { r: 1, g: 0.9, b: 0.5 },
            levels: [
                {
                    name: 'spiritStonesenCorePower_lv1',
                    description: '下2次攻击伤害+60%',
                    stageRequired: 1,
                    energyCost: 35,
                    damageBuff: { bonus: 0.6, turns: 2 }
                },
                {
                    name: 'spiritStonesenCorePower_lv2',
                    description: '30%防御 + 30%闪避 + 下2次攻击伤害+70%',
                    stageRequired: 4,
                    energyCost: 42,
                    defenseBonus: 0.3,
                    dodgeBonus: 0.3,
                    damageBuff: { bonus: 0.7, turns: 2 }
                },
                {
                    name: 'spiritStonesenCorePower_lv3',
                    description: '35%防御 + 35%闪避 + 下3次攻击伤害+80%，恢复30点灵力',
                    stageRequired: 7,
                    energyCost: 50,
                    defenseBonus: 0.35,
                    dodgeBonus: 0.35,
                    damageBuff: { bonus: 0.8, turns: 3 },
                    energyRecover: 30
                },
                {
                    name: 'spiritStonesenCorePower_lv4',
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
                    description: '元婴之力，造成2.3倍伤害',
                    stageRequired: 1,
                    energyCost: 35,
                    damageMultiplier: 2.3
                },
                {
                    name: 'infantStrike_lv2',
                    description: '元婴攻击，造成2.5倍伤害，额外造成10%敌人最大生命伤害',
                    stageRequired: 4,
                    energyCost: 42,
                    damageMultiplier: 2.5,
                    extraDamagePercent: 0.1
                },
                {
                    name: 'infantStrike_lv3',
                    description: '元婴寂灭一击，造成2.6倍伤害，对生命低于25%敌人额外2倍伤害',
                    stageRequired: 7,
                    energyCost: 50,
                    damageMultiplier: 2.6,
                    executeMultiplier: 2.0,
                    executeThreshold: 0.25
                },
                {
                    name: 'infantStrike_lv4',
                    description: '元婴境巅峰，造成2.8倍伤害，斩杀生命低于35%敌人',
                    stageRequired: 10,
                    energyCost: 65,
                    damageMultiplier: 2.8,
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
                    description: '化神之力，造成2.5倍伤害',
                    stageRequired: 1,
                    energyCost: 45,
                    damageMultiplier: 2.5
                },
                {
                    name: 'deityFist_lv2',
                    description: '紫气东来，造成2.7倍伤害，无视40%防御',
                    stageRequired: 4,
                    energyCost: 55,
                    damageMultiplier: 2.7,
                    armorPenetration: 0.4
                },
                {
                    name: 'deityFist_lv3',
                    description: '鸿蒙紫气，造成3.0倍伤害，对生命低于20%敌人额外3倍伤害',
                    stageRequired: 7,
                    energyCost: 65,
                    damageMultiplier: 3.0,
                    executeMultiplier: 3.0,
                    executeThreshold: 0.2
                },
                {
                    name: 'deityFist_lv4',
                    description: '化神境巅峰，造成3.2倍伤害，必定暴击，无视50%防御',
                    stageRequired: 10,
                    energyCost: 80,
                    damageMultiplier: 3.2,
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
            critDamage: 0,  // 暴击伤害值（初始为0，只能通过装备获得）
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
            autoBattleSettings: {
                enabled: false,
                targetColors: ['green', 'yellow', 'red']
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
                name: "jade",
                displayName: "仙玉",
                initialAmount: 0,
                // ❌ 已移除 baseRate（v2.0资源系统重构）
                description: "珍贵货币，通过充值获得"
            }
        ]
    },
    
    // 境界系统配置
    // pctFactor: 百分比属性境界系数（影响装备百分比属性）
    realmConfig: [
        {
            name: "武者",
            pctFactor: 1.0,
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
            pctFactor: 1.1,
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
            pctFactor: 1.2,
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
            pctFactor: 1.25,
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
            pctFactor: 1.3,
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
            pctFactor: 1.4,
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
            "imageUrl": "Images/map-background-1.jpg"
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
            "imageUrl": "Images/map-background-2.jpg"
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
            "imageUrl": "Images/map-background-3.jpg"
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
            "imageUrl": "Images/map-background-4.jpg"
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
            "imageUrl": "Images/map-background-5.jpg"
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
            "imageUrl": "Images/map-background-6.jpg"
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
            "imageUrl": "Images/map-background-7.jpg"
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
                "spiritStonesen sand",
                "magical pearls",
                "sea spirits"
            ],
            "imageUrl": "Images/map-background-8.jpg"
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
            "imageUrl": "Images/map-background-9.jpg"
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
            "imageUrl": "Images/map-background-10.jpg"
        }
    ],

    // ========== 每日任务系统配置 ==========
    dailyQuestConfig: {
        // 每日任务模板池 (7种，每天随机选3个不重复)
        templates: [
            { id: 'daily_kill_normal', type: 'kill', subType: 'normal', name: '妖兽讨伐', descTemplate: '击败{target}只普通妖兽' },
            { id: 'daily_kill_elite', type: 'kill', subType: 'elite', name: '精英猎杀', descTemplate: '击败{target}只精英妖兽' },
            { id: 'daily_kill_boss', type: 'kill_boss', name: 'Boss 挑战', descTemplate: '击败{target}只Boss' },
            { id: 'daily_dungeon_stone', type: 'dungeon', dungeonId: 'spirit_stone_mine', name: '灵石矿脉', descTemplate: '通关灵石矿脉副本' },
            { id: 'daily_dungeon_herb', type: 'dungeon', dungeonId: 'herb_garden', name: '灵草园', descTemplate: '通关灵草园副本' },
            { id: 'daily_dungeon_iron', type: 'dungeon', dungeonId: 'iron_mine', name: '玄铁矿', descTemplate: '通关玄铁矿副本' },
            { id: 'daily_visit_map', type: 'visit_map', name: '地图探索', descTemplate: '前往指定地图探索' }
        ],
        questsPerDay: 3,
        // 基础数值
        baseValues: { kill: 10, collect: 12, boss: 1, exp: 60, spiritStones: 30, activity: 10 },
        // 连续完成奖励
        streakRewards: [
            { days: 3, bonusPercent: 0.5, extraActivity: 30, title: '小有成就' },
            { days: 5, bonusPercent: 0.8, extraActivity: 60, title: '初窥门径' },
            { days: 7, bonusPercent: 1.0, extraActivity: 100, title: '七日修炼' },
            { days: 14, bonusPercent: 1.5, extraActivity: 200, title: '半月精进' },
            { days: 30, bonusPercent: 2.0, extraActivity: 500, title: '一月大成' }
        ]
    },

    // ========== 主线任务模板系统配置 ==========
    // 使用模板动态生成每个等级的任务，替代静态定义
    questTemplateConfig: {
        // 境界主题配置 - 每个境界的地图、Boss、资源等
        realmThemes: [
            {   // 武者境 (realm 0)
                name: '武者',
                maps: ['xianxia-mountain'],
                bossPool: ['冰霜巨人'],
                primaryResource: 'herbs',
                secondaryResource: 'iron',
                crystalUnlockStage: 5,
                companion: '师尊',
                realmGoal: '突破武者境的极限'
            },
            {   // 炼气境 (realm 1)
                name: '炼气',
                maps: ['xianxia-mountain', 'xianxia-beach'],
                bossPool: ['龙王', '海怪'],
                primaryResource: 'herbs',
                secondaryResource: 'iron',
                crystalUnlockStage: 1,
                companion: '师兄',
                realmGoal: '筑基凝真，踏入修仙正途'
            },
            {   // 筑基境 (realm 2)
                name: '筑基',
                maps: ['xianxia-beach', 'xianxia-plains'],
                bossPool: ['草原之王'],
                primaryResource: 'iron',
                secondaryResource: 'herbs',
                crystalUnlockStage: 1,
                companion: '弟子',
                realmGoal: '结成金丹，大道可期'
            },
            {   // 金丹境 (realm 3)
                name: '金丹',
                maps: ['xianxia-canyon', 'xianxia-desert'],
                bossPool: ['峡谷领主', '沙漠之王'],
                primaryResource: 'spiritStones',
                secondaryResource: 'iron',
                crystalUnlockStage: 1,
                companion: '长老',
                realmGoal: '元婴出世，神通无量'
            },
            {   // 元婴境 (realm 4)
                name: '元婴',
                maps: ['xianxia-lake', 'xianxia-forest', 'xianxia-volcano'],
                bossPool: ['湖龙王', '妖狐王', '火山领主'],
                primaryResource: 'spiritStones',
                secondaryResource: 'iron',
                crystalUnlockStage: 1,
                companion: '故友',
                realmGoal: '化神超脱，打破寒冬枷锁'
            },
            {   // 化神境 (realm 5)
                name: '化神',
                maps: ['xianxia-cave', 'xianxia-heaven'],
                bossPool: ['地下蠕虫', '麒麟', '元始天尊'],
                primaryResource: 'spiritStones',
                secondaryResource: 'iron',
                crystalUnlockStage: 1,
                companion: '天道之音',
                realmGoal: '飞升成仙，打破世界枷锁'
            }
        ],

        // 阶段乘数 (stage 1-10)
        stageMultiplier: [1.0, 1.3, 1.6, 2.0, 2.4, 2.8, 3.3, 3.8, 4.3, 5.0],

        // 境界乘数
        realmMultiplier: [1.0, 1.5, 2.2, 3.2, 4.5, 6.5],

        // 基础数值
        scalingBase: {
            baseKill: 5,        // 基础击杀数
            baseCollect: 8,     // 基础收集数
            baseExp: 80,        // 基础经验奖励
            baseGold: 40        // 基础灵石奖励
        },

        // 资源名称映射
        resourceNames: {
            herbs: '灵草',
            iron: '玄铁',
            spiritStones: '灵石'
        },

        // 地图名称映射
        mapNames: {
            'xianxia-mountain': '仙侠山峰',
            'xianxia-beach': '仙侠海滩',
            'xianxia-plains': '仙侠平原',
            'xianxia-canyon': '仙侠峡谷',
            'xianxia-desert': '仙侠沙漠',
            'xianxia-lake': '仙侠湖泊',
            'xianxia-forest': '仙侠森林',
            'xianxia-volcano': '仙侠火山',
            'xianxia-cave': '仙侠洞穴',
            'xianxia-heaven': '仙侠仙境'
        },

        // 日志叙事文字模板
        narrativeTemplates: {
            kill_normal: [
                '你在{stageName}的修炼渐入佳境，今日又消灭了一批妖兽。',
                '战斗之余，你抬头望向远方——{realmGoal}。',
                '妖兽纷纷倒下，{companion}对你的成长感到欣慰。',
                '今日的战斗让你对{realmName}境的灵力运用更加纯熟。',
                '这些妖兽虽弱，但每一次战斗都是修炼的一部分。'
            ],
            kill_elite: [
                '精英妖兽的实力不容小觑，但你已今非昔比！',
                '击败精英怪物后，你感到{realmName}的灵力更加精纯了。',
                '{companion}看着你击败精英的身影，默默点了点头。',
                '精英级别的战斗考验着你的应变能力，你应对自如。',
                '又一只精英怪物倒下了，你的实力稳步提升。'
            ],
            collect_herbs: [
                '灵草散发着淡淡的光芒，这些修炼资源对你大有裨益。',
                '收集灵草的过程中，你感悟到了木属性灵力的奥妙。',
                '充足的灵草是炼丹的基础，你的储备越来越丰富了。',
                '{companion}教你辨别灵草的品质，收获颇丰。'
            ],
            collect_iron: [
                '沉甸甸的玄铁是锻造法宝的上好材料。',
                '你将玄铁小心收好，这些资源足够修炼一阵了。',
                '玄铁中蕴含着大地之力，对修炼大有帮助。',
                '{companion}指点你寻找玄铁矿脉，效率提升不少。'
            ],
            collect_stones: [
                '灵石中蕴含着精纯的灵力，{realmName}功法正需要此物。',
                '每一颗灵石都在你手中闪烁着光芒，前路越来越清晰。',
                '高纯度的灵石是修仙者的硬通货，这些收获非常可观。',
                '{companion}看到你收集的灵石，露出赞许的目光。'
            ],
            visit_map: [
                '{mapName}的景色令人叹为观止，也许这里藏着什么机缘...',
                '踏入{mapName}，一股熟悉的灵力波动扑面而来。',
                '在{mapName}中探索，你发现了一些有价值的线索。',
                '{companion}带你来到{mapName}，这里的灵气果然浓郁。'
            ],
            reach_level: [
                '修为精进，你离{nextGoal}又近了一步。',
                '{companion}为你指引了接下来的修炼方向。',
                '灵力在体内缓缓流动，你感到{realmName}的境界正在巩固。',
                '这一级的突破虽然不大，但稳扎稳打才是正道。'
            ]
        }
    },

    // ========== 主线任务系统配置 (旧版静态定义，保留兼容) ==========
    // 6 个境界 × 10 个任务 = 60 个主线任务
    mainStoryQuests: {
        // === 武者境 (realm 0) ===
        // 任务分布：前期(1-4) → 突破中期(5) → 中期(6) → 突破后期(7) → 后期(8-9) → 巅峰(10)
        0: [
            {
                id: 'warrior_awaken',
                name: '觉醒之路',
                description: '村民被妖兽袭击，挺身而出保护村庄',
                objectives: [
                    { type: 'kill', subType: 'normal', target: 5 }
                ],
                rewards: { exp: 80, spiritStones: 40 },
                rewardItems: [{ type: 'equipment', slot: 'weapon', rarity: 'white' }],
                storyTrigger: 'realm0_Q1',
                nextQuest: 1
            },
            {
                id: 'warrior_seek_master',
                name: '拜师学艺',
                description: '在山峰地区收集修炼资源，为入门做准备',
                objectives: [
                    { type: 'collect', resource: 'herbs', target: 8 }
                ],
                rewards: { exp: 100, spiritStones: 60 },
                storyTrigger: 'realm0_Q2',
                nextQuest: 2
            },
            {
                id: 'warrior_train',
                name: '基础修炼',
                description: '完成门派的基础修炼任务，提升修为',
                objectives: [
                    { type: 'reach_level', target: 5 }
                ],
                rewards: { exp: 130, spiritStones: 80 },
                rewardItems: [{ type: 'equipment', slot: 'armor', rarity: 'white' }],
                storyTrigger: 'realm0_Q3',
                nextQuest: 3
            },
            {
                id: 'warrior_first_battle',
                name: '首次实战',
                description: '前往山峰地图，击败15只妖兽积累经验',
                objectives: [
                    { type: 'kill', subType: 'normal', target: 15 }
                ],
                rewards: { exp: 150, spiritStones: 100, skillPoints: 1 },
                storyTrigger: 'realm0_Q4',
                nextQuest: 4
            },
            {
                id: 'warrior_challenge_elite',
                name: '突破中期',
                description: '修炼有成，突破到武者中期',
                objectives: [
                    { type: 'reach_stage', target: 4 }
                ],
                rewards: { exp: 180, spiritStones: 120 },
                storyTrigger: 'realm0_Q5',
                nextQuest: 5
            },
            {
                id: 'warrior_resource',
                name: '资源储备',
                description: '收集大量修炼资源，巩固中期修为',
                objectives: [
                    { type: 'collect', resource: 'herbs', target: 15 },
                    { type: 'collect', resource: 'iron', target: 10 }
                ],
                rewards: { exp: 210, spiritStones: 150 },
                storyTrigger: 'realm0_Q6',
                nextQuest: 6
            },
            {
                id: 'warrior_advance',
                name: '突破后期',
                description: '修为精进，突破到武者后期',
                objectives: [
                    { type: 'reach_stage', target: 7 }
                ],
                rewards: { exp: 240, spiritStones: 180, skillPoints: 1 },
                storyTrigger: 'realm0_Q7',
                nextQuest: 7
            },
            {
                id: 'warrior_hunt',
                name: '战斗历练',
                description: '在山峰地区战斗历练，击杀30只妖兽',
                objectives: [
                    { type: 'kill', subType: 'normal', target: 30 }
                ],
                rewards: { exp: 260, spiritStones: 200 },
                storyTrigger: 'realm0_Q8',
                nextQuest: 8
            },
            {
                id: 'warrior_elite_hunter',
                name: '精英猎手',
                description: '击杀精英妖兽，证明自己的实力',
                objectives: [
                    { type: 'kill', subType: 'elite', target: 5 }
                ],
                rewards: { exp: 280, spiritStones: 250 },
                storyTrigger: 'realm0_Q9',
                nextQuest: 9
            },
            {
                id: 'warrior_peak',
                name: '武者巅峰',
                description: '挑战山峰地图的BOSS冰霜巨人',
                objectives: [
                    { type: 'kill_boss', targetBoss: '冰霜巨人' }
                ],
                rewards: { exp: 300, spiritStones: 300, skillPoints: 2 },
                storyTrigger: 'realm0_Q10',
                isFinalQuest: true
            }
        ],

        // === 炼气境 (realm 1) ===
        1: [
            {
                id: 'qi_sect_mission',
                name: '门派任务',
                description: '完成门派分配的任务，收集资源',
                objectives: [
                    { type: 'collect', resource: 'herbs', target: 15 },
                    { type: 'collect', resource: 'iron', target: 10 }
                ],
                rewards: { exp: 150, spiritStones: 100 },
                storyTrigger: 'realm1_Q1',
                nextQuest: 1
            },
            {
                id: 'qi_beach_explore',
                name: '海滩探索',
                description: '前往海滩地图，探索新的区域',
                objectives: [
                    { type: 'visit_map', targetMap: 'xianxia-beach' }
                ],
                rewards: { exp: 180, spiritStones: 120 },
                storyTrigger: 'realm1_Q2',
                nextQuest: 2
            },
            {
                id: 'qi_cultivation',
                name: '修炼提升',
                description: '在海滩修炼，提升到5级',
                objectives: [
                    { type: 'reach_level', target: 5 }
                ],
                rewards: { exp: 220, spiritStones: 160 },
                storyTrigger: 'realm1_Q3',
                nextQuest: 3
            },
            {
                id: 'qi_beach_battle',
                name: '海滩战斗',
                description: '在海滩地图击败15只妖兽',
                objectives: [
                    { type: 'kill', subType: 'normal', target: 15 }
                ],
                rewards: { exp: 260, spiritStones: 200, skillPoints: 1 },
                storyTrigger: 'realm1_Q4',
                nextQuest: 4
            },
            {
                id: 'qi_secret_realm',
                name: '秘境挑战',
                description: '进入炼气境秘境，击败秘境守卫龙王',
                objectives: [
                    { type: 'kill_boss', targetBoss: '龙王' }
                ],
                rewards: { exp: 300, spiritStones: 250 },
                storyTrigger: 'realm1_Q5',
                nextQuest: 5
            },
            {
                id: 'qi_crystal',
                name: '灵石猎人',
                description: '收集灵石，修炼炼气功法',
                objectives: [
                    { type: 'collect', resource: 'spiritStones', target: 15 }
                ],
                rewards: { exp: 350, spiritStones: 280 },
                storyTrigger: 'realm1_Q6',
                nextQuest: 6
            },
            {
                id: 'qi_compete',
                name: '同门切磋',
                description: '与弟子们切磋，击败精英怪物',
                objectives: [
                    { type: 'kill', subType: 'elite', target: 5 }
                ],
                rewards: { exp: 400, spiritStones: 320, skillPoints: 2 },
                storyTrigger: 'realm1_Q7',
                nextQuest: 7
            },
            {
                id: 'qi_advance',
                name: '深入修炼',
                description: '深入修炼，达到当前阶段的巅峰',
                objectives: [
                    { type: 'reach_level', target: 10 }
                ],
                rewards: { exp: 450, spiritStones: 370 },
                storyTrigger: 'realm1_Q8',
                nextQuest: 8
            },
            {
                id: 'qi_hunt',
                name: '战斗提升',
                description: '在海滩地区战斗提升，击杀30只妖兽',
                objectives: [
                    { type: 'kill', subType: 'normal', target: 30 }
                ],
                rewards: { exp: 500, spiritStones: 410 },
                storyTrigger: 'realm1_Q9',
                nextQuest: 9
            },
            {
                id: 'qi_peak',
                name: '炼气巅峰',
                description: '挑战海滩地图的BOSS海怪',
                objectives: [
                    { type: 'kill_boss', targetBoss: '海怪' }
                ],
                rewards: { exp: 550, spiritStones: 450, skillPoints: 2 },
                storyTrigger: 'realm1_Q10',
                isFinalQuest: true
            }
        ],

        // === 筑基境 (realm 2) ===
        2: [
            {
                id: 'foundation_establish',
                name: '开山立派',
                description: '在门派中建立自己的势力，收集资源',
                objectives: [
                    { type: 'collect', resource: 'herbs', target: 20 },
                    { type: 'collect', resource: 'iron', target: 15 }
                ],
                rewards: { exp: 250, spiritStones: 200 },
                storyTrigger: 'realm2_Q1',
                nextQuest: 1
            },
            {
                id: 'foundation_plains',
                name: '平原探索',
                description: '前往平原地图，探索新的区域',
                objectives: [
                    { type: 'visit_map', targetMap: 'xianxia-plains' }
                ],
                rewards: { exp: 300, spiritStones: 240 },
                storyTrigger: 'realm2_Q2',
                nextQuest: 2
            },
            {
                id: 'foundation_cultivate',
                name: '修炼突破',
                description: '在平原修炼，提升到5级',
                objectives: [
                    { type: 'reach_level', target: 5 }
                ],
                rewards: { exp: 350, spiritStones: 290 },
                storyTrigger: 'realm2_Q3',
                nextQuest: 3
            },
            {
                id: 'foundation_resource',
                name: '资源争夺',
                description: '参与门派资源分配，收集灵石',
                objectives: [
                    { type: 'collect', resource: 'spiritStones', target: 20 }
                ],
                rewards: { exp: 400, spiritStones: 340, skillPoints: 1 },
                storyTrigger: 'realm2_Q4',
                nextQuest: 4
            },
            {
                id: 'foundation_battle',
                name: '平原战斗',
                description: '在平原地图击败20只妖兽',
                objectives: [
                    { type: 'kill', subType: 'normal', target: 20 }
                ],
                rewards: { exp: 450, spiritStones: 390 },
                storyTrigger: 'realm2_Q5',
                nextQuest: 5
            },
            {
                id: 'foundation_challenge',
                name: '秘境挑战',
                description: '挑战平原秘境中的精英怪物',
                objectives: [
                    { type: 'kill', subType: 'elite', target: 3 }
                ],
                rewards: { exp: 500, spiritStones: 430 },
                storyTrigger: 'realm2_Q6',
                nextQuest: 6
            },
            {
                id: 'foundation_elite',
                name: '精英猎手',
                description: '击杀精英妖兽，证明筑基实力',
                objectives: [
                    { type: 'kill', subType: 'elite', target: 8 }
                ],
                rewards: { exp: 560, spiritStones: 480, skillPoints: 2 },
                storyTrigger: 'realm2_Q7',
                nextQuest: 7
            },
            {
                id: 'foundation_advance',
                name: '深入修炼',
                description: '深入修炼，达到当前阶段的巅峰',
                objectives: [
                    { type: 'reach_level', target: 10 }
                ],
                rewards: { exp: 620, spiritStones: 530 },
                storyTrigger: 'realm2_Q8',
                nextQuest: 8
            },
            {
                id: 'foundation_hunt',
                name: '战斗历练',
                description: '在平原地区战斗历练，击杀40只妖兽',
                objectives: [
                    { type: 'kill', subType: 'normal', target: 40 }
                ],
                rewards: { exp: 700, spiritStones: 610 },
                storyTrigger: 'realm2_Q9',
                nextQuest: 9
            },
            {
                id: 'foundation_peak',
                name: '筑基巅峰',
                description: '挑战平原地图的BOSS草原之王',
                objectives: [
                    { type: 'kill_boss', targetBoss: '草原之王' }
                ],
                rewards: { exp: 800, spiritStones: 700, skillPoints: 3 },
                storyTrigger: 'realm2_Q10',
                isFinalQuest: true
            }
        ],

        // === 金丹境 (realm 3) ===
        3: [
            {
                id: 'spiritStonesen_status',
                name: '门派地位',
                description: '在门派中获得更高地位，击杀妖兽立功',
                objectives: [
                    { type: 'kill', subType: 'normal', target: 20 }
                ],
                rewards: { exp: 400, spiritStones: 300 },
                storyTrigger: 'realm3_Q1',
                nextQuest: 1
            },
            {
                id: 'spiritStonesen_canyon',
                name: '峡谷探索',
                description: '前往峡谷地图，探索新的区域',
                objectives: [
                    { type: 'visit_map', targetMap: 'xianxia-canyon' }
                ],
                rewards: { exp: 470, spiritStones: 360 },
                storyTrigger: 'realm3_Q2',
                nextQuest: 2
            },
            {
                id: 'spiritStonesen_desert',
                name: '沙漠寻宝',
                description: '前往沙漠地图，寻找传说中的宝物',
                objectives: [
                    { type: 'visit_map', targetMap: 'xianxia-desert' }
                ],
                rewards: { exp: 540, spiritStones: 410 },
                storyTrigger: 'realm3_Q3',
                nextQuest: 3
            },
            {
                id: 'spiritStonesen_collect',
                name: '收集灵石',
                description: '收集大量灵石，修炼金丹功法',
                objectives: [
                    { type: 'collect', resource: 'spiritStones', target: 25 }
                ],
                rewards: { exp: 600, spiritStones: 460, skillPoints: 2 },
                storyTrigger: 'realm3_Q4',
                nextQuest: 4
            },
            {
                id: 'spiritStonesen_evil',
                name: '对抗邪修',
                description: '与邪恶修士战斗，保护正道',
                objectives: [
                    { type: 'kill', subType: 'elite', target: 5 }
                ],
                rewards: { exp: 660, spiritStones: 510 },
                storyTrigger: 'realm3_Q5',
                nextQuest: 5
            },
            {
                id: 'spiritStonesen_battle',
                name: '深入战斗',
                description: '在峡谷和沙漠地区深入战斗',
                objectives: [
                    { type: 'kill', subType: 'normal', target: 30 }
                ],
                rewards: { exp: 720, spiritStones: 560 },
                storyTrigger: 'realm3_Q6',
                nextQuest: 6
            },
            {
                id: 'spiritStonesen_elite',
                name: '精英挑战',
                description: '挑战强大的精英修士',
                objectives: [
                    { type: 'kill', subType: 'elite', target: 10 }
                ],
                rewards: { exp: 780, spiritStones: 620, skillPoints: 2 },
                storyTrigger: 'realm3_Q7',
                nextQuest: 7
            },
            {
                id: 'spiritStonesen_advance',
                name: '修炼突破',
                description: '深入修炼，达到当前阶段的巅峰',
                objectives: [
                    { type: 'reach_level', target: 10 }
                ],
                rewards: { exp: 850, spiritStones: 700 },
                storyTrigger: 'realm3_Q8',
                nextQuest: 8
            },
            {
                id: 'spiritStonesen_boss',
                name: '秘境守卫',
                description: '击败秘境中的守卫BOSS',
                objectives: [
                    { type: 'kill', subType: 'boss', target: 2 }
                ],
                rewards: { exp: 950, spiritStones: 820 },
                storyTrigger: 'realm3_Q9',
                nextQuest: 9
            },
            {
                id: 'spiritStonesen_peak',
                name: '金丹巅峰',
                description: '挑战峡谷或沙漠地图的BOSS峡谷领主',
                objectives: [
                    { type: 'kill_boss', targetBoss: '峡谷领主' }
                ],
                rewards: { exp: 1050, spiritStones: 950, skillPoints: 3 },
                storyTrigger: 'realm3_Q10',
                isFinalQuest: true
            }
        ],

        // === 元婴境 (realm 4) ===
        4: [
            {
                id: 'nascent_explore',
                name: '探索世界',
                description: '离开门派，探索湖泊和森林',
                objectives: [
                    { type: 'visit_map', targetMap: 'xianxia-lake' },
                    { type: 'visit_map', targetMap: 'xianxia-forest' }
                ],
                rewards: { exp: 600, spiritStones: 400 },
                storyTrigger: 'realm4_Q1',
                nextQuest: 1
            },
            {
                id: 'nascent_volcano',
                name: '火山探索',
                description: '前往火山地图，探索新的区域',
                objectives: [
                    { type: 'visit_map', targetMap: 'xianxia-volcano' }
                ],
                rewards: { exp: 680, spiritStones: 460 },
                storyTrigger: 'realm4_Q2',
                nextQuest: 2
            },
            {
                id: 'nascent_collect',
                name: '资源储备',
                description: '收集大量资源，为元婴突破做准备',
                objectives: [
                    { type: 'collect', resource: 'spiritStones', target: 30 },
                    { type: 'collect', resource: 'iron', target: 25 }
                ],
                rewards: { exp: 750, spiritStones: 520 },
                storyTrigger: 'realm4_Q3',
                nextQuest: 3
            },
            {
                id: 'nascent_demon',
                name: '对抗大妖',
                description: '与强大的妖兽战斗，击败湖龙王',
                objectives: [
                    { type: 'kill_boss', targetBoss: '湖龙王' }
                ],
                rewards: { exp: 830, spiritStones: 580, skillPoints: 2 },
                storyTrigger: 'realm4_Q4',
                nextQuest: 4
            },
            {
                id: 'nascent_battle',
                name: '战斗提升',
                description: '在各地图战斗提升实力',
                objectives: [
                    { type: 'kill', subType: 'normal', target: 30 }
                ],
                rewards: { exp: 900, spiritStones: 650 },
                storyTrigger: 'realm4_Q5',
                nextQuest: 5
            },
            {
                id: 'nascent_elite',
                name: '精英猎手',
                description: '击杀大量精英怪物，证明元婴实力',
                objectives: [
                    { type: 'kill', subType: 'elite', target: 12 }
                ],
                rewards: { exp: 970, spiritStones: 720 },
                storyTrigger: 'realm4_Q6',
                nextQuest: 6
            },
            {
                id: 'nascent_trial',
                name: '天道考验',
                description: '面对突破化神的天道考验',
                objectives: [
                    { type: 'kill', subType: 'boss', target: 3 }
                ],
                rewards: { exp: 1050, spiritStones: 800, skillPoints: 3 },
                storyTrigger: 'realm4_Q7',
                nextQuest: 7
            },
            {
                id: 'nascent_advance',
                name: '深入修炼',
                description: '深入修炼，达到当前阶段的巅峰',
                objectives: [
                    { type: 'reach_level', target: 10 }
                ],
                rewards: { exp: 1120, spiritStones: 880 },
                storyTrigger: 'realm4_Q8',
                nextQuest: 8
            },
            {
                id: 'nascent_hunt',
                name: '战斗历练',
                description: '在各地区战斗历练，击杀50只妖兽',
                objectives: [
                    { type: 'kill', subType: 'normal', target: 50 }
                ],
                rewards: { exp: 1200, spiritStones: 1050 },
                storyTrigger: 'realm4_Q9',
                nextQuest: 9
            },
            {
                id: 'nascent_peak',
                name: '元婴巅峰',
                description: '挑战火山地图的BOSS火山领主',
                objectives: [
                    { type: 'kill_boss', targetBoss: '火山领主' }
                ],
                rewards: { exp: 1300, spiritStones: 1200, skillPoints: 3 },
                storyTrigger: 'realm4_Q10',
                isFinalQuest: true
            }
        ],

        // === 化神境 (realm 5) ===
        5: [
            {
                id: 'deity_truth',
                name: '世界真相',
                description: '发现永恒寒冬的真相，探索洞穴和仙境',
                objectives: [
                    { type: 'visit_map', targetMap: 'xianxia-cave' },
                    { type: 'visit_map', targetMap: 'xianxia-heaven' }
                ],
                rewards: { exp: 800, spiritStones: 500 },
                storyTrigger: 'realm5_Q1',
                nextQuest: 1
            },
            {
                id: 'deity_collect',
                name: '探索收集',
                description: '收集大量灵石，修炼化神功法',
                objectives: [
                    { type: 'collect', resource: 'spiritStones', target: 40 }
                ],
                rewards: { exp: 880, spiritStones: 570 },
                storyTrigger: 'realm5_Q2',
                nextQuest: 2
            },
            {
                id: 'deity_heaven',
                name: '对抗天道',
                description: '与控制世界的力量对抗，击败地下蠕虫',
                objectives: [
                    { type: 'kill_boss', targetBoss: '地下蠕虫' }
                ],
                rewards: { exp: 960, spiritStones: 650 },
                storyTrigger: 'realm5_Q3',
                nextQuest: 3
            },
            {
                id: 'deity_challenge',
                name: '终极挑战',
                description: '面对最终的敌人，击败精英怪物',
                objectives: [
                    { type: 'kill', subType: 'elite', target: 5 }
                ],
                rewards: { exp: 1050, spiritStones: 740, skillPoints: 2 },
                storyTrigger: 'realm5_Q4',
                nextQuest: 4
            },
            {
                id: 'deity_battle',
                name: '战斗提升',
                description: '在各地图战斗提升实力',
                objectives: [
                    { type: 'kill', subType: 'normal', target: 40 }
                ],
                rewards: { exp: 1120, spiritStones: 820 },
                storyTrigger: 'realm5_Q5',
                nextQuest: 5
            },
            {
                id: 'deity_boss',
                name: '深入战斗',
                description: '击败多个BOSS，积累战斗经验',
                objectives: [
                    { type: 'kill', subType: 'boss', target: 5 }
                ],
                rewards: { exp: 1200, spiritStones: 910 },
                storyTrigger: 'realm5_Q6',
                nextQuest: 6
            },
            {
                id: 'deity_advance',
                name: '修炼巅峰',
                description: '深入修炼，达到当前阶段的巅峰',
                objectives: [
                    { type: 'reach_level', target: 10 }
                ],
                rewards: { exp: 1280, spiritStones: 1010, skillPoints: 3 },
                storyTrigger: 'realm5_Q7',
                nextQuest: 7
            },
            {
                id: 'deity_lock',
                name: '突破枷锁',
                description: '打破世界的束缚，击败麒麟',
                objectives: [
                    { type: 'kill_boss', targetBoss: '麒麟' }
                ],
                rewards: { exp: 1400, spiritStones: 1200 },
                storyTrigger: 'realm5_Q8',
                nextQuest: 8
            },
            {
                id: 'deity_elite',
                name: '精英挑战',
                description: '击败最强的精英怪物，证明化神实力',
                objectives: [
                    { type: 'kill', subType: 'elite', target: 8 }
                ],
                rewards: { exp: 1480, spiritStones: 1350 },
                storyTrigger: 'realm5_Q9',
                nextQuest: 9
            },
            {
                id: 'deity_ascending',
                name: '飞升',
                description: '成功飞升，击败元始天尊，成为真正的仙',
                objectives: [
                    { type: 'kill_boss', targetBoss: '元始天尊' }
                ],
                rewards: { exp: 1550, spiritStones: 1450, skillPoints: 4 },
                storyTrigger: 'realm5_Q10',
                isFinalQuest: true
            }
        ]
    },

    // ========== 资源副本配置 ==========
    resourceDungeons: {
        spirit_stone_mine: {
            id: 'spirit_stone_mine',
            name: '灵石矿脉',
            description: '深入矿脉采集灵石',
            icon: 'fa-gem',
            scene: 'mine',
            type: 'spirit_stones',
            difficulties: {
                easy: {
                    name: '简单',
                    enemies: 3,
                    reward: { spirit_stones: 1000, exp: 2000 },
                    first_clear_bonus: { spirit_stones: 500 },
                    level_req: 1
                },
                medium: {
                    name: '普通',
                    enemies: 5,
                    reward: { spirit_stones: 3000, exp: 5000 },
                    first_clear_bonus: { spirit_stones: 1500 },
                    level_req: 10
                },
                hard: {
                    name: '困难',
                    enemies: 7,
                    reward: { spirit_stones: 10000, exp: 15000 },
                    first_clear_bonus: { spirit_stones: 5000 },
                    level_req: 20
                }
            },
            enemy_types: ['矿石怪', '石巨人', '矿工幽灵'],
            boss_type: '精英石巨人'
        },
        herb_garden: {
            id: 'herb_garden',
            name: '灵草园',
            description: '采摘珍稀灵草',
            icon: 'fa-leaf',
            scene: 'garden',
            type: 'herbs',
            difficulties: {
                easy: {
                    name: '简单',
                    enemies: 3,
                    reward: { herbs: 30, exp: 2000 },
                    first_clear_bonus: { herbs: 15 },
                    level_req: 1
                },
                medium: {
                    name: '普通',
                    enemies: 5,
                    reward: { herbs: 100, exp: 5000 },
                    first_clear_bonus: { herbs: 50 },
                    level_req: 10
                },
                hard: {
                    name: '困难',
                    enemies: 7,
                    reward: { herbs: 300, exp: 15000 },
                    first_clear_bonus: { herbs: 150 },
                    level_req: 20
                }
            },
            enemy_types: ['藤蔓怪', '花仙子', '树精'],
            boss_type: '千年树妖'
        },
        iron_mine: {
            id: 'iron_mine',
            name: '玄铁矿',
            description: '开采玄铁矿石',
            icon: 'fa-gem',
            scene: 'iron_mine',
            type: 'iron',
            difficulties: {
                easy: {
                    name: '简单',
                    enemies: 3,
                    reward: { iron: 60, exp: 2000 },
                    first_clear_bonus: { iron: 30 },
                    level_req: 1
                },
                medium: {
                    name: '普通',
                    enemies: 5,
                    reward: { iron: 200, exp: 5000 },
                    first_clear_bonus: { iron: 100 },
                    level_req: 10
                },
                hard: {
                    name: '困难',
                    enemies: 7,
                    reward: { iron: 600, exp: 15000 },
                    first_clear_bonus: { iron: 300 },
                    level_req: 20
                }
            },
            enemy_types: ['铁甲兽', '矿石魔', '熔岩怪'],
            boss_type: '熔岩巨人'
        }
    },

    // ========== 主线剧情场景配置 ==========
    storyScenes: {
        scenes: {
            // ===== 武者卷 =====
            '0_chapter_start': {
                chapter: 0,
                title: '第一卷 · 武者之路',
                pages: [
                    { text: '在遥远的极北之地，一个被永恒寒冬笼罩的世界里，修仙者们为了突破境界、追求永生而不断奋斗。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '你是一个普通山村少年，今天村庄突然传来警报——妖兽来袭！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '快！保护村民们！拿起你的武器，击退这些妖兽！', speaker: '村长', speakerImage: 'assets/characters/character_02_village_chief.jpg' }
                ]
            },
            'awaken_complete': {
                chapter: 0,
                title: '觉醒',
                pages: [
                    { text: '你成功击退了妖兽！但你体内突然涌出一股奇异的力量...', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '这是...修仙者的灵力！想不到在这偏远山村竟然有修仙资质出众之人。', speaker: '神秘旅者', speakerImage: 'assets/characters/character_03_mysterious_traveler.jpg' },
                    { text: '少年，你可愿随我修仙问道？前方的路虽然艰险，但也许能打破这永恒寒冬的诅咒。', speaker: '神秘旅者', speakerImage: 'assets/characters/character_03_mysterious_traveler.jpg' }
                ]
            },
            'seek_master_complete': {
                chapter: 0,
                title: '拜师',
                pages: [
                    { text: '你来到了山顶的门派，云雾缭绕中，一座古朴的大殿矗立眼前。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '入门弟子先从基础功法修炼起，等到武者初期修炼有成，便可下山历练。', speaker: '师尊', speakerImage: 'assets/characters/character_04_master.jpg' }
                ]
            },
            'train_complete': {
                chapter: 0,
                title: '初窥门径',
                pages: [
                    { text: '经过刻苦修炼，你终于掌握了基础功法的精髓！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '不错，根基已稳。是时候下山历练一番了，记住：实战才是最好的老师。', speaker: '师尊', speakerImage: 'assets/characters/character_04_master.jpg' }
                ]
            },
            'first_battle_complete': {
                chapter: 0,
                title: '实战归来',
                pages: [
                    { text: '战斗归来，你浑身是伤，但眼神愈发坚定。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '你已经有了武者的资格。但要真正突破武者巅峰，你需要不断历练，最终击败冰霜巨人！', speaker: '师尊', speakerImage: 'assets/characters/character_04_master.jpg' }
                ]
            },
            'warrior_peak_complete': {
                chapter: 0,
                title: '武者巅峰',
                pages: [
                    { text: '冰霜巨人倒下了！你感到体内灵力涌动，武者境已达巅峰！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '你已经准备好突破到炼气境了。当你准备好时，前往角色面板进行突破。', speaker: '师尊', speakerImage: 'assets/characters/character_04_master.jpg' }
                ]
            },

            // ===== 炼气卷 =====
            '1_chapter_start': {
                chapter: 1,
                title: '第二卷 · 炼气有成',
                pages: [
                    { text: '一股强大的灵力在你体内爆发，你的修为突破了武者境的桎梏！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '恭喜你踏入了炼气境，更广阔的修仙世界正在等待你探索。', speaker: '师尊', speakerImage: 'assets/characters/character_04_master.jpg' }
                ]
            },
            'sect_mission_complete': {
                chapter: 1,
                title: '门派贡献',
                pages: [
                    { text: '你完成了门派分配的任务，获得了资源和声望。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '很好，你已经证明了自己的价值。接下来前往海滩秘境探索，炼气境的路还很长。', speaker: '师尊', speakerImage: 'assets/characters/character_04_master.jpg' }
                ]
            },
            'beach_explore_complete': {
                chapter: 1,
                title: '海滩初探',
                pages: [
                    { text: '你来到了海滩，海浪拍打着礁石，远处有强大的气息。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'secret_realm_complete': {
                chapter: 1,
                title: '秘境之战',
                pages: [
                    { text: '你击败了秘境守卫，获得了珍贵的宝物！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'compete_complete': {
                chapter: 1,
                title: '同门切磋',
                pages: [
                    { text: '你与同门弟子切磋武艺，实力大增！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '你的进步很快，炼气境的路已经走了一半。继续修炼，突破大圆满就在前方。', speaker: '师尊', speakerImage: 'assets/characters/character_04_master.jpg' }
                ]
            },
            'qi_peak_complete': {
                chapter: 1,
                title: '炼气巅峰',
                pages: [
                    { text: '你击败了海滩的BOSS，炼气境已达到巅峰！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '你已经准备好突破到筑基境了。', speaker: '师尊', speakerImage: 'assets/characters/character_04_master.jpg' }
                ]
            },

            // ===== 筑基卷 =====
            '2_chapter_start': {
                chapter: 2,
                title: '第三卷 · 筑基求真',
                pages: [
                    { text: '你的修为再次突破，踏入了筑基境！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'foundation_establish_complete': {
                chapter: 2,
                title: '开山立派',
                pages: [
                    { text: '你收集了足够的资源，开始在门派中建立自己的势力。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'foundation_plains_complete': {
                chapter: 2,
                title: '平原探索',
                pages: [
                    { text: '你来到了广阔的平原，风中带着青草的芬芳。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'foundation_resource_complete': {
                chapter: 2,
                title: '资源充足',
                pages: [
                    { text: '你收集了大量的灵石，修为更加稳固！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'foundation_challenge_complete': {
                chapter: 2,
                title: '秘境挑战',
                pages: [
                    { text: '你击败了秘境守卫，获得了珍贵的传承！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'foundation_peak_complete': {
                chapter: 2,
                title: '筑基巅峰',
                pages: [
                    { text: '你的筑基境已达到巅峰，是时候冲击金丹境了！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },

            // ===== 金丹卷 =====
            '3_chapter_start': {
                chapter: 3,
                title: '第四卷 · 金丹大道',
                pages: [
                    { text: '金丹已成，大道可期！你踏入了金丹境！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'spiritStonesen_sect_status_complete': {
                chapter: 3,
                title: '门派地位',
                pages: [
                    { text: '你在门派中的地位越来越高，获得了更多的资源和支持。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'spiritStonesen_canyon_complete': {
                chapter: 3,
                title: '峡谷探索',
                pages: [
                    { text: '你来到了险峻的峡谷，四周是悬崖峭壁。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'spiritStonesen_desert_complete': {
                chapter: 3,
                title: '沙漠寻宝',
                pages: [
                    { text: '你穿越了茫茫沙漠，发现了传说中的遗迹！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'spiritStonesen_evil_complete': {
                chapter: 3,
                title: '正道守护',
                pages: [
                    { text: '你击败了邪恶修士，保护了正道的尊严！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'spiritStonesen_peak_complete': {
                chapter: 3,
                title: '金丹巅峰',
                pages: [
                    { text: '你的金丹境已达到巅峰，元婴境就在眼前！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },

            // ===== 元婴卷 =====
            '4_chapter_start': {
                chapter: 4,
                title: '第五卷 · 元婴无双',
                pages: [
                    { text: '元婴出世，神通无量！你踏入了元婴境！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'nascent_explore_complete': {
                chapter: 4,
                title: '探索世界',
                pages: [
                    { text: '你离开了门派，开始探索这个广阔的世界。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'nascent_volcano_complete': {
                chapter: 4,
                title: '火山探索',
                pages: [
                    { text: '你来到了炽热的火山，岩浆在脚下流淌。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'nascent_demon_complete': {
                chapter: 4,
                title: '斩妖除魔',
                pages: [
                    { text: '你击败了强大的妖兽，保护了人类的安宁！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'nascent_trial_complete': {
                chapter: 4,
                title: '天道考验',
                pages: [
                    { text: '你通过了天道的考验，距离化神只有一步之遥！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'nascent_peak_complete': {
                chapter: 4,
                title: '元婴巅峰',
                pages: [
                    { text: '你的元婴境已达到巅峰，化神境的门槛已经打开！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },

            // ===== 化神卷 =====
            '5_chapter_start': {
                chapter: 5,
                title: '第六卷 · 化神超脱',
                pages: [
                    { text: '化神已成，超脱凡俗！你踏入了化神境！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'deity_truth_complete': {
                chapter: 5,
                title: '世界真相',
                pages: [
                    { text: '你发现了永恒寒冬的真相——这是一个被古老封印笼罩的世界！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'deity_heaven_complete': {
                chapter: 5,
                title: '对抗天道',
                pages: [
                    { text: '你击败了天道的使者，向着自由迈出了重要一步！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'deity_challenge_complete': {
                chapter: 5,
                title: '终极挑战',
                pages: [
                    { text: '你击败了最终守护者，只剩下最后一步了！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'deity_lock_complete': {
                chapter: 5,
                title: '突破枷锁',
                pages: [
                    { text: '你打破了世界的束缚，天空裂开一道金光！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },

            // ===== 飞升结局 =====
            'final_ascending': {
                chapter: 5,
                title: '飞升',
                pages: [
                    { text: '你击败了元始天尊，打破了永恒寒冬的枷锁，天空裂开一道金光...', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '无尽的修仙之路，终于迎来了终点...或者说，新的起点。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '恭喜你飞升成功！感谢你的旅途！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                    { text: '【游戏通关】你已完成了无尽战斗的全部主线内容！', speaker: '系统', speakerImage: 'assets/characters/character_10_system.jpg' }
                ]
            },

            // ===== 境界突破剧情 =====
            'realm_breakthrough_1': {
                chapter: 1,
                title: '突破！炼气境',
                pages: [
                    { text: '恭喜你突破到炼气境！新的冒险正在等待你。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'realm_breakthrough_2': {
                chapter: 2,
                title: '突破！筑基境',
                pages: [
                    { text: '恭喜你突破到筑基境！你的修为更加深厚了。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'realm_breakthrough_3': {
                chapter: 3,
                title: '突破！金丹境',
                pages: [
                    { text: '恭喜你突破到金丹境！金丹已成，大道可期！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'realm_breakthrough_4': {
                chapter: 4,
                title: '突破！元婴境',
                pages: [
                    { text: '恭喜你突破到元婴境！元婴出世，神通无量！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },
            'realm_breakthrough_5': {
                chapter: 5,
                title: '突破！化神境',
                pages: [
                    { text: '恭喜你突破到化神境！你已经是这个世界最强大的存在之一！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
                ]
            },

            // ===== 模板系统：阶段转换里程碑剧情 =====
            // 初期→中期 (stage 4 第1级触发)
            'r0_stage_4_start': { chapter: 0, title: '武者·踏入中期', pages: [
                { text: '经过初期的磨练，你的身体越来越强健。师尊点了点头，"是时候面对更强的对手了。"', speaker: '师尊', speakerImage: 'assets/characters/character_04_master.jpg' },
                { text: '山峰深处的妖兽更加凶猛，但你已经有了足够的实力。中期修炼，正式开始！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
            ]},
            'r1_stage_4_start': { chapter: 1, title: '炼气·踏入中期', pages: [
                { text: '炼气前期的修炼已告一段落，你体内的灵力流转更加顺畅。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"海滩深处的妖兽越来越强，正好拿来磨砺你的灵力。"师兄递给你一瓶丹药。', speaker: '师兄' }
            ]},
            'r2_stage_4_start': { chapter: 2, title: '筑基·踏入中期', pages: [
                { text: '筑基的基础已经稳固，你可以感受到灵力在经脉中奔涌。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '弟子来报："师尊，平原深处发现了大量妖兽活动，需要您前去查看！"', speaker: '弟子', speakerImage: 'assets/characters/character_06_disciple.jpg' }
            ]},
            'r3_stage_4_start': { chapter: 3, title: '金丹·踏入中期', pages: [
                { text: '金丹前期的修炼让你的内丹更加凝实，金光隐隐透体而出。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '长老捋了捋胡须："金丹中期是修炼的关键节点，峡谷和沙漠中的机缘不可错过。"', speaker: '长老', speakerImage: 'assets/characters/character_07_elder.jpg' }
            ]},
            'r4_stage_4_start': { chapter: 4, title: '元婴·踏入中期', pages: [
                { text: '元婴前期的探索让你对这个世界有了更深的了解。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '故友传讯："你在湖泊和森林的探索引起了某些势力的注意，小心行事。"', speaker: '故友', speakerImage: 'assets/characters/character_08_old_friend.jpg' }
            ]},
            'r5_stage_4_start': { chapter: 5, title: '化神·踏入中期', pages: [
                { text: '化神前期的修炼让你感受到了天道的力量。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '一个声音在你脑海中回荡："你已经触碰到了世界真相的边缘，继续前进..."', speaker: '天道之音', speakerImage: 'assets/characters/character_09_heavenly_dao.jpg' }
            ]},

            // 中期→后期 (stage 7 第1级触发)
            'r0_stage_7_start': { chapter: 0, title: '武者·踏入后期', pages: [
                { text: '中期的战斗让你脱胎换骨，肌肉中蕴含着惊人的力量。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"你的进步超出了我的预期。"师尊露出欣慰的笑容，"武者巅峰就在前方！"', speaker: '师尊' }
            ]},
            'r1_stage_7_start': { chapter: 1, title: '炼气·踏入后期', pages: [
                { text: '灵力在体内运转自如，你已经可以操控灵力进行各种攻击。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"后期的修炼需要更多的灵石支持。"师兄为你指点了几个灵石丰富的地点。', speaker: '师兄' }
            ]},
            'r2_stage_7_start': { chapter: 2, title: '筑基·踏入后期', pages: [
                { text: '筑基后期的修炼让你对灵力有了全新的感悟。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"师尊，前方有一处秘境，据说藏有筑基突破的机缘！"弟子带来了好消息。', speaker: '弟子' }
            ]},
            'r3_stage_7_start': { chapter: 3, title: '金丹·踏入后期', pages: [
                { text: '金丹后期，你的丹田中金光大盛，修为已臻化境。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '长老严肃道："金丹后期是结婴的关键，务必小心应对每一次战斗。"', speaker: '长老', speakerImage: 'assets/characters/character_07_elder.jpg' }
            ]},
            'r4_stage_7_start': { chapter: 4, title: '元婴·踏入后期', pages: [
                { text: '元婴后期的你，已经可以感应到方圆百里的灵力波动。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"火山深处有远古遗迹的消息，你打算亲自去探一探。"故友为你整理了情报。', speaker: '故友' }
            ]},
            'r5_stage_7_start': { chapter: 5, title: '化神·踏入后期', pages: [
                { text: '化神后期的你，已经可以与天道进行初步的沟通。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '天道之音再次响起："你距离真相越来越近了，但最后的考验也最为凶险。"', speaker: '天道之音', speakerImage: 'assets/characters/character_09_heavenly_dao.jpg' }
            ]},

            // 后期→巅峰 (stage 10 第1级触发)
            'r0_stage_10_start': { chapter: 0, title: '武者·巅峰之路', pages: [
                { text: '后期的磨练让你拥有了远超常人的实力，武者巅峰就在眼前！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"武者巅峰是通往更高境界的关键。"师尊目光深邃，"击败冰霜巨人，你的修仙之路才算真正开始。"', speaker: '师尊' }
            ]},
            'r1_stage_10_start': { chapter: 1, title: '炼气·大圆满', pages: [
                { text: '炼气大圆满的境界近在咫尺，你的灵力已经精纯到了极致。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"海滩深处有一只远古海怪，击败它，你就能突破到筑基境！"师兄为你打气。', speaker: '师兄' }
            ]},
            'r2_stage_10_start': { chapter: 2, title: '筑基·大圆满', pages: [
                { text: '筑基大圆满，你的灵力根基稳如磐石。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"师尊，平原之王出现了！它就在东方！"弟子的声音中带着一丝紧张。', speaker: '弟子' }
            ]},
            'r3_stage_10_start': { chapter: 3, title: '金丹·大圆满', pages: [
                { text: '金丹大圆满，丹田中的金丹散发出璀璨光芒。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '长老沉声道："峡谷领主是金丹境最终的考验，战胜它，元婴可期。"', speaker: '长老', speakerImage: 'assets/characters/character_07_elder.jpg' }
            ]},
            'r4_stage_10_start': { chapter: 4, title: '元婴·大圆满', pages: [
                { text: '元婴大圆满的境界让你拥有了移山填海的力量。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '故友："火山领主是这个世界最强大的妖兽之一，也是你通往化神的最后考验。"', speaker: '故友', speakerImage: 'assets/characters/character_08_old_friend.jpg' }
            ]},
            'r5_stage_10_start': { chapter: 5, title: '化神·大圆满', pages: [
                { text: '化神大圆满——你已经是这个世界上最接近仙的存在了。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '天道之音轰然响起："元始天尊是永恒寒冬的守护者，击败他，你就能打破枷锁，飞升成仙！"', speaker: '天道之音', speakerImage: 'assets/characters/character_09_heavenly_dao.jpg' }
            ]},

            // ===== 模板系统：Boss 战后剧情 =====
            // 武者境 Boss
            'r0_boss_冰霜巨人': { chapter: 0, title: '冰霜巨人之战', pages: [
                { text: '冰霜巨人轰然倒地，冰屑飞溅！你在武者境的实力已经无人能敌。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"好！很好！"师尊眼中闪过光芒，"你已经做好了踏入炼气境的准备。"', speaker: '师尊', speakerImage: 'assets/characters/character_04_master.jpg' }
            ]},
            // 炼气境 Boss
            'r1_boss_龙王': { chapter: 1, title: '龙王之战', pages: [
                { text: '龙王发出最后的咆哮，倒在了你的脚下。海面的波涛渐渐平息。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"龙王的内丹是炼气的绝佳材料！"师兄兴奋地捡起战利品。', speaker: '师兄' }
            ]},
            'r1_boss_海怪': { chapter: 1, title: '海怪之战', pages: [
                { text: '海怪巨大的身躯沉入海底，溅起滔天巨浪。炼气境，圆满！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"你已经准备好突破到筑基境了。"师兄为你递上突破丹药。', speaker: '师兄' }
            ]},
            // 筑基境 Boss
            'r2_boss_草原之王': { chapter: 2, title: '草原之王之战', pages: [
                { text: '草原之王倒下了，平原上的妖兽纷纷逃散。筑基境，圆满！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"师尊威武！"弟子们欢呼雀跃，你的声望在门派中达到了顶峰。', speaker: '弟子' }
            ]},
            // 金丹境 Boss
            'r3_boss_峡谷领主': { chapter: 3, title: '峡谷领主之战', pages: [
                { text: '峡谷领主的巨大身躯轰然倒塌，峡谷中回荡着胜利的回声。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '长老捋须微笑："金丹圆满，元婴可期。你的成就已经超过了我的预期。"', speaker: '长老', speakerImage: 'assets/characters/character_07_elder.jpg' }
            ]},
            'r3_boss_沙漠之王': { chapter: 3, title: '沙漠之王之战', pages: [
                { text: '沙漠之王在烈日下化为飞灰，沙漠恢复了往日的宁静。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"金丹境的考验你已经全部通过了。"长老为你指引前方的道路。', speaker: '长老' }
            ]},
            // 元婴境 Boss
            'r4_boss_湖龙王': { chapter: 4, title: '湖龙王之战', pages: [
                { text: '湖龙王的咆哮声渐渐消失在湖面上。湖水晶莹如镜。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"元婴的力量果然非同凡响。"故友感叹道，"你已经是这个世界最顶尖的强者之一了。"', speaker: '故友' }
            ]},
            'r4_boss_妖狐王': { chapter: 4, title: '妖狐王之战', pages: [
                { text: '妖狐王的幻术在你面前土崩瓦解，它化作一缕青烟消散。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"妖狐王已除，森林恢复了安宁。"故友望着远方，"火山领主还在等着你。"', speaker: '故友' }
            ]},
            'r4_boss_火山领主': { chapter: 4, title: '火山领主之战', pages: [
                { text: '火山领主的火焰在你面前熄灭！岩浆凝固，火山归于沉寂。元婴境，圆满！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"化神境的考验才是真正的挑战。"故友的眼中闪过一丝担忧。', speaker: '故友' }
            ]},
            // 化神境 Boss
            'r5_boss_地下蠕虫': { chapter: 5, title: '地下蠕虫之战', pages: [
                { text: '巨大的蠕虫在洞穴中化为灰烬，洞穴恢复了光明。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '天道之音："这个世界的守护者不止一个，真正的考验才刚刚开始。"', speaker: '天道之音', speakerImage: 'assets/characters/character_09_heavenly_dao.jpg' }
            ]},
            'r5_boss_麒麟': { chapter: 5, title: '麒麟之战', pages: [
                { text: '远古神兽麒麟发出最后的咆哮，化作金色光点消散。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '天道之音："你打破了世界的第二层封印...元始天尊正在等待你。"', speaker: '天道之音', speakerImage: 'assets/characters/character_09_heavenly_dao.jpg' }
            ]},
            'r5_boss_元始天尊': { chapter: 5, title: '最终之战', pages: [
                { text: '元始天尊的身影在天空中渐渐消散，永恒寒冬的枷锁出现了裂痕...', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '天空裂开一道金光，温暖的阳光洒落大地。寒冬，终于要结束了。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }
            ]},

            // ===== 模板系统：境界最终剧情 =====
            'r0_realm_final': { chapter: 0, title: '武者圆满', pages: [
                { text: '武者境的修炼已经圆满！你的身体和意志都达到了凡人的巅峰。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"从今天起，你正式踏入修仙者的行列。"师尊将一枚令牌递给你。', speaker: '师尊' }
            ]},
            'r1_realm_final': { chapter: 1, title: '炼气圆满', pages: [
                { text: '炼气境的修炼已经圆满！你的灵力已经精纯到了极致。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"筑基境的修炼需要更多悟性，但我相信你一定可以。"师兄拍了拍你的肩膀。', speaker: '师兄' }
            ]},
            'r2_realm_final': { chapter: 2, title: '筑基圆满', pages: [
                { text: '筑基圆满！你的灵力根基已经稳如磐石。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '"师尊，我一定会成为门派的骄傲！"你的弟子眼中满是崇敬。', speaker: '弟子' }
            ]},
            'r3_realm_final': { chapter: 3, title: '金丹圆满', pages: [
                { text: '金丹圆满！丹田中金光万丈，你的修为已经达到了一个全新的高度。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '长老感慨："老夫当年修炼到金丹境用了三百年，你只用了不到一年...后生可畏！"', speaker: '长老', speakerImage: 'assets/characters/character_07_elder.jpg' }
            ]},
            'r4_realm_final': { chapter: 4, title: '元婴圆满', pages: [
                { text: '元婴圆满！你拥有了移山填海的力量，已经站上了这个世界的顶端。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '故友望着你："化神境...那是传说中的领域。去完成你的使命吧！"', speaker: '故友', speakerImage: 'assets/characters/character_08_old_friend.jpg' }
            ]},
            'r5_realm_final': { chapter: 5, title: '化神圆满', pages: [
                { text: '化神圆满！你已经达到了这个世界修仙者的巅峰。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' },
                { text: '天道之音："永恒寒冬的真相即将揭开...你准备好了吗？"', speaker: '天道之音', speakerImage: 'assets/characters/character_09_heavenly_dao.jpg' }
            ]},

            // ===== 武者卷新增场景 (Q4-Q9) =====
            'realm0_Q4': { chapter: 0, title: '实战归来', pages: [{ text: '战斗归来，你的武者修为又精进了不少。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm0_Q5': { chapter: 0, title: '精英挑战', pages: [{ text: '精英怪物比普通妖兽强大不少，但你也变得更强了！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm0_Q6': { chapter: 0, title: '资源充足', pages: [{ text: '充足的修炼资源是突破的基础，你已经准备好了。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm0_Q7': { chapter: 0, title: '进阶修炼', pages: [{ text: '你的修为更进一步，武者境的巅峰就在眼前。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm0_Q8': { chapter: 0, title: '战斗历练', pages: [{ text: '在与妖兽的战斗中，你的实力不断提升。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm0_Q9': { chapter: 0, title: '精英猎手', pages: [{ text: '你已经可以轻松击败精英怪物了，是时候挑战最终BOSS！', speaker: '师尊', speakerImage: 'assets/characters/character_04_master.jpg' }] },

            // ===== 炼气卷新增场景 (Q3-Q9) =====
            'realm1_Q3': { chapter: 1, title: '修炼提升', pages: [{ text: '炼气境的修炼比武者境更加精深，你感受到了灵力的流动。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm1_Q4': { chapter: 1, title: '海滩战斗', pages: [{ text: '海滩上的妖兽比山峰的更加强大，但你应对自如。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm1_Q6': { chapter: 1, title: '灵石猎人', pages: [{ text: '灵石是高级修仙的必备资源，你已经学会了如何高效收集。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm1_Q8': { chapter: 1, title: '深入修炼', pages: [{ text: '你的灵力越来越精纯，炼气境的巅峰即将到来。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm1_Q9': { chapter: 1, title: '战斗提升', pages: [{ text: '你已经准备好挑战海滩的最终BOSS了。', speaker: '师尊', speakerImage: 'assets/characters/character_04_master.jpg' }] },

            // ===== 筑基卷场景 (Q1-Q9) =====
            '2_chapter_start': { chapter: 2, title: '第三卷 · 筑基求真', pages: [{ text: '你的修为再次突破，踏入了筑基境！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm2_Q1': { chapter: 2, title: '开山立派', pages: [{ text: '你收集了足够的资源，开始在门派中建立自己的势力。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm2_Q2': { chapter: 2, title: '平原探索', pages: [{ text: '你来到了广阔的平原，风中带着青草的芬芳。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm2_Q3': { chapter: 2, title: '修炼突破', pages: [{ text: '筑基境的修炼更加深入，你感受到了灵力的质变。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm2_Q7': { chapter: 2, title: '精英猎手', pages: [{ text: '平原上的精英怪物已经被你一一击败。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm2_Q8': { chapter: 2, title: '深入修炼', pages: [{ text: '你距离筑基境的巅峰只差一步了。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm2_Q9': { chapter: 2, title: '战斗历练', pages: [{ text: '你已经准备好挑战平原的最终BOSS了。', speaker: '师尊', speakerImage: 'assets/characters/character_04_master.jpg' }] },

            // ===== 金丹卷场景 (Q1-Q9) =====
            '3_chapter_start': { chapter: 3, title: '第四卷 · 金丹大道', pages: [{ text: '金丹已成，大道可期！你踏入了金丹境！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm3_Q1': { chapter: 3, title: '门派地位', pages: [{ text: '你在门派中的地位越来越高，获得了更多的资源和支持。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm3_Q2': { chapter: 3, title: '峡谷探索', pages: [{ text: '你来到了险峻的峡谷，四周是悬崖峭壁。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm3_Q3': { chapter: 3, title: '沙漠寻宝', pages: [{ text: '你穿越了茫茫沙漠，发现了传说中的遗迹！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm3_Q7': { chapter: 3, title: '精英挑战', pages: [{ text: '金丹境的精英怪物实力强大，但你也不弱。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm3_Q8': { chapter: 3, title: '修炼突破', pages: [{ text: '金丹的修炼接近圆满，元婴境的大门即将打开。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm3_Q9': { chapter: 3, title: '秘境守卫', pages: [{ text: '击败了两位秘境守卫，你已准备好最终挑战。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },

            // ===== 元婴卷场景 (Q1-Q9) =====
            '4_chapter_start': { chapter: 4, title: '第五卷 · 元婴无双', pages: [{ text: '元婴出世，神通无量！你踏入了元婴境！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm4_Q1': { chapter: 4, title: '探索世界', pages: [{ text: '你离开了门派，开始探索这个广阔的世界。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm4_Q2': { chapter: 4, title: '火山探索', pages: [{ text: '你来到了炽热的火山，岩浆在脚下流淌。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm4_Q5': { chapter: 4, title: '战斗提升', pages: [{ text: '元婴境的战斗让你实力大增。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm4_Q6': { chapter: 4, title: '精英猎手', pages: [{ text: '你已经可以轻松应对各种精英挑战。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm4_Q8': { chapter: 4, title: '深入修炼', pages: [{ text: '元婴境的巅峰就在眼前，化神境的门槛已经打开。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm4_Q9': { chapter: 4, title: '战斗历练', pages: [{ text: '一切准备就绪，最终之战即将到来。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },

            // ===== 化神卷新增场景 (Q2-Q9) =====
            'realm5_Q2': { chapter: 5, title: '探索收集', pages: [{ text: '在化神境的修炼中，每一份资源都至关重要。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm5_Q5': { chapter: 5, title: '战斗提升', pages: [{ text: '化神境的战斗已经接近神级。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm5_Q8': { chapter: 5, title: '修炼巅峰', pages: [{ text: '你已达到化神境的修炼巅峰。', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] },
            'realm5_Q9': { chapter: 5, title: '突破枷锁', pages: [{ text: '你击败了麒麟，打破了世界的一层封印！', speaker: '旁白', speakerImage: 'assets/characters/character_01_narrator.jpg' }] }
        }
    }
};

export default gameMetadata;