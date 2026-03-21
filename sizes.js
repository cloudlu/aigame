// 尺寸常量模块 (sizes.js)
// 统一的3D场景尺寸系统
// 基准：玩家高度约2单位 ≈ 1.7米，1单位 ≈ 0.85米

const SIZES = {
    // ========== 基础单位 ==========
    UNIT: 1,

    // ========== 树木尺寸 ==========
    // 真实高度: 5-12米
    TREE_TRUNK_HEIGHT_MIN: 5,
    TREE_TRUNK_HEIGHT_MAX: 10,
    TREE_TRUNK_RADIUS_MIN: 0.3,
    TREE_TRUNK_RADIUS_MAX: 0.6,
    TREE_CROWN_SIZE_MIN: 3,
    TREE_CROWN_SIZE_MAX: 6,

    // ========== 岩石尺寸 ==========
    // 真实高度: 0.5-2米
    ROCK_SIZE_MIN: 1,
    ROCK_SIZE_MAX: 3,

    // ========== 草丛尺寸 ==========
    // 真实高度: 0.3-0.8米
    GRASS_HEIGHT_MIN: 0.6,
    GRASS_HEIGHT_MAX: 1.2,

    // ========== 灵石尺寸 ==========
    SPIRIT_STONE_SIZE_MIN: 1,
    SPIRIT_STONE_SIZE_MAX: 2,

    // ========== 灵草尺寸 ==========
    HERB_HEIGHT_MIN: 0.8,
    HERB_HEIGHT_MAX: 1.5,

    // ========== 建筑尺寸 ==========
    // 小屋
    HOUSE_WIDTH_MIN: 6,
    HOUSE_WIDTH_MAX: 10,
    HOUSE_HEIGHT_MIN: 4,
    HOUSE_HEIGHT_MAX: 6,
    HOUSE_ROOF_HEIGHT: 3,
    DOOR_WIDTH: 1.2,
    DOOR_HEIGHT: 2.4,

    // 草庐
    HUT_DIAMETER: 5,
    HUT_HEIGHT: 4,
    HUT_ROOF_HEIGHT: 3,

    // 石碑
    STELE_WIDTH: 1.5,
    STELE_HEIGHT_MIN: 3,
    STELE_HEIGHT_MAX: 5,

    // ========== 边界障碍物尺寸 ==========
    // 边界树木（更大更显眼）
    BOUNDARY_TREE_HEIGHT_MIN: 8,
    BOUNDARY_TREE_HEIGHT_MAX: 15,
    BOUNDARY_TREE_CROWN_MIN: 5,
    BOUNDARY_TREE_CROWN_MAX: 10,
    BOUNDARY_TREE_RADIUS_MIN: 0.4,
    BOUNDARY_TREE_RADIUS_MAX: 0.8,

    // 边界岩石
    BOUNDARY_ROCK_SIZE_MIN: 3,
    BOUNDARY_ROCK_SIZE_MAX: 6,

    // ========== 敌人基准尺寸（普通级 = 1倍）==========
    // 精英 = 基准 × 1.25，Boss = 基准 × 1.5
    // ========== 四足兽类（狼、熊、豹、狮、牛、鹿）==========
    QUAD_BODY_WIDTH: 0.8,      // 身体宽度（左右）
    QUAD_BODY_HEIGHT: 0.7,     // 身体高度（上下）
    QUAD_BODY_LENGTH: 1.6,     // 身体长度（前后）
    QUAD_HEAD_SIZE: 0.5,       // 头部大小
    QUAD_LEG_HEIGHT: 0.5,      // 腿高
    QUAD_LEG_RADIUS: 0.1,      // 腿粗
    QUAD_TAIL_LENGTH: 0.8,     // 尾巴长度
    QUAD_EYE_SIZE: 0.08,       // 眼睛大小

    // ========== 蛇虫类（蛇、蜥蜴、虫、蠕虫、蚯蚓）==========
    SERPENT_BODY_RADIUS: 0.2,  // 身体粗细
    SERPENT_LENGTH: 2.5,       // 身体长度
    SERPENT_HEAD_SIZE: 0.35,   // 头部大小
    SERPENT_EYE_SIZE: 0.06,    // 眼睛大小

    // ========== 飞行类（雕、鹰、鹤、凤凰、蝙蝠）==========
    BIRD_BODY_WIDTH: 0.4,
    BIRD_BODY_HEIGHT: 0.35,
    BIRD_BODY_LENGTH: 0.8,
    BIRD_HEAD_SIZE: 0.3,
    BIRD_WING_WIDTH: 2.0,      // 翅膀展幅
    BIRD_WING_HEIGHT: 0.05,    // 翅膀厚度
    BIRD_BEAK_SIZE: 0.15,      // 喙
    BIRD_EYE_SIZE: 0.06,

    // ========== 飞行敌人高度 ==========
    BIRD_MIN_HEIGHT: 8,       // 最低飞行高度（相对地面）
    BIRD_MAX_HEIGHT: 25,      // 最高飞行高度（相对地面）
    FLY_COLLISION_THRESHOLD: 28, // 飞行碰撞垂直检测阈值

    // ========== 水生类（鱼、蟹、虾、龟、蛟、鲛人）==========
    AQUA_BODY_WIDTH: 0.6,
    AQUA_BODY_HEIGHT: 0.5,
    AQUA_BODY_LENGTH: 1.4,
    AQUA_HEAD_SIZE: 0.4,
    AQUA_FIN_WIDTH: 0.8,       // 鳍/爪展幅
    AQUA_SHELL_RADIUS: 0.7,    // 龟壳半径
    AQUA_EYE_SIZE: 0.06,

    // ========== 人形类（人、仙、将、天女、游侠）==========
    HUMANOID_BODY_WIDTH: 0.5,
    HUMANOID_BODY_HEIGHT: 1.2,
    HUMANOID_HEAD_SIZE: 0.35,
    HUMANOID_ARM_LENGTH: 0.8,
    HUMANOID_ARM_RADIUS: 0.08,
    HUMANOID_LEG_HEIGHT: 0.7,
    HUMANOID_LEG_RADIUS: 0.1,
    HUMANOID_EYE_SIZE: 0.06,

    // ========== 植物/树类（树精、花妖、藤蔓、仙人掌）==========
    PLANT_TRUNK_RADIUS: 0.3,
    PLANT_TRUNK_HEIGHT: 1.5,
    PLANT_CROWN_SIZE: 1.0,     // 树冠/花冠大小
    PLANT_EYE_SIZE: 0.1,

    // ========== 岩石/巨人类（石怪、岩怪、巨人）==========
    GOLEM_BODY_WIDTH: 1.0,
    GOLEM_BODY_HEIGHT: 1.5,
    GOLEM_HEAD_SIZE: 0.6,
    GOLEM_ARM_LENGTH: 1.0,
    GOLEM_ARM_RADIUS: 0.2,
    GOLEM_LEG_HEIGHT: 0.6,
    GOLEM_LEG_RADIUS: 0.25,
    GOLEM_EYE_SIZE: 0.12,

    // ========== 幽灵/元素类（幽灵、暗影、火灵、风）==========
    GHOST_BODY_SIZE: 0.8,      // 球体大小
    GHOST_TAIL_LENGTH: 1.0,    // 下飘尾迹
    GHOST_EYE_SIZE: 0.1,

    // ========== 敌人等级缩放 ==========
    ENEMY_SCALE_NORMAL: 1,
    ENEMY_SCALE_ELITE: 1.25,
    ENEMY_SCALE_BOSS: 1.5,

    // ========== 敌人血条高度（按类别，相对于敌人模型原点）==========
    // 高度 = 模型最高点 + 0.3 间距，避免与模型重叠
    HEALTH_BAR_Y_HUMANOID: 2.6,   // 人形：头顶(2.25) + 0.35
    HEALTH_BAR_Y_QUAD: 1.5,       // 四足兽：头顶(1.2) + 0.3
    HEALTH_BAR_Y_BIRD: 2.0,       // 飞行类：头顶(1.6) + 0.4
    HEALTH_BAR_Y_SERPENT: 0.8,    // 蛇虫类：头顶(0.35) + 0.45
    HEALTH_BAR_Y_AQUA: 1.0,       // 水生类：头顶(0.6) + 0.4
    HEALTH_BAR_Y_PLANT: 3.2,      // 植物类：树冠(2.5) + 0.7
    HEALTH_BAR_Y_GOLEM: 3.1,      // 岩石巨人：头顶(2.7) + 0.4
    HEALTH_BAR_Y_GHOST: 1.9,      // 幽灵类：头顶(1.5) + 0.4

    // ========== 玩家尺寸参考 ==========
    // 玩家总高度约2单位
    PLAYER_HEIGHT: 2,

    // ========== 地图场景尺寸 ==========
    SKY_SIZE: 250,                // 天空盒/地面尺寸（唯一基准值，其他距离从此派生）
    // 注意：以下距离值在文件末尾从 SKY_SIZE 派生计算
    // GROUND_Y, PLAYER_BOUNDARY, BOUNDARY_RADIUS, TREE_DISTRIBUTION_RADIUS 等
    PLAYER_HEIGHT_OFFSET: 1.1,    // 玩家相对地面的高度偏移（角色身高，不随地图缩放）

    // ========== 移动速度 ==========
    WALK_SPEED: 0.1,              // 键盘步行速度
    RUN_SPEED: 0.25,              // 键盘跑步速度（2.5倍）
    FLY_SPEED: 0.5,               // 键盘飞行速度（5倍）
    FLY_VERTICAL_SPEED: 0.5,      // 飞行垂直升降速度
    WALK_CLICK_SPEED: 2.0,        // 鼠标点击步行速度
    RUN_CLICK_SPEED: 5.0,         // 鼠标点击跑步速度
    FLY_CLICK_SPEED: 10.0,        // 鼠标点击飞行速度
    DOUBLE_CLICK_THRESHOLD: 300,  // 双击检测阈值（毫秒）

    // ========== 碰撞检测 ==========
    COLLISION_THRESHOLD: 1.0,     // 敌人碰撞触发距离
    DETECTION_RANGE: 5.0,         // 敌人信息显示范围

    // ========== 边界障碍物 ==========
    // BOUNDARY_RADIUS 在文件末尾从 SKY_SIZE 派生
    BOUNDARY_OBSTACLE_COUNT: 40,  // 外环障碍物数量（密度，不随距离缩放）
    BOUNDARY_INNER_COUNT: 28,     // 内环障碍物数量

    // ========== 场景生成 ==========
    TREE_COUNT_MIN: 20,           // 树木数量范围（密度）
    TREE_COUNT_MAX: 30,

    // ========== 背包系统 ==========
    MAX_INVENTORY_SIZE: 400,      // 背包最大容量（格）- 每种装备类型50格 × 8类型
    INVENTORY_PAGE_SIZE: 50,      // 每页显示物品数量
};

// ========== 从 SKY_SIZE 派生距离值 ==========
// 只需修改 SKY_SIZE 一个值，所有距离自动等比缩放
(function() {
    const S = SIZES.SKY_SIZE;
    SIZES.GROUND_Y = -S / 10;
    SIZES.PLAYER_BOUNDARY = Math.round(S * 0.47);
    SIZES.BOUNDARY_RADIUS = Math.round(S * 0.48);
    SIZES.TREE_DISTRIBUTION_RADIUS = Math.round(S * 0.36);
    SIZES.TREE_MIN_SPAWN_DIST = Math.max(5, Math.round(S * 0.03));
    SIZES.TREE_MIN_CENTER_DIST = Math.max(1, Math.round(S * 0.01));
})();

// 获取敌人血条Y高度（按类别）
SIZES.getHealthBarY = function(category) {
    const map = {
        'HUMANOID': SIZES.HEALTH_BAR_Y_HUMANOID,
        'QUAD': SIZES.HEALTH_BAR_Y_QUAD,
        'BIRD': SIZES.HEALTH_BAR_Y_BIRD,
        'SERPENT': SIZES.HEALTH_BAR_Y_SERPENT,
        'AQUA': SIZES.HEALTH_BAR_Y_AQUA,
        'PLANT': SIZES.HEALTH_BAR_Y_PLANT,
        'GOLEM': SIZES.HEALTH_BAR_Y_GOLEM,
        'GHOST': SIZES.HEALTH_BAR_Y_GHOST,
    };
    return map[category] || SIZES.HEALTH_BAR_Y_HUMANOID; // 默认人形高度
};

// 如果在Node.js环境中，导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SIZES;
}
