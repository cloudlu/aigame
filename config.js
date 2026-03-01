// 游戏常量配置文件
// 统一管理所有魔法数字，便于维护和修改

const CONSTANTS = {
    // ==================== 3D场景常量 ====================
    SCENE: {
        // 地面设置
        GROUND: {
            Y: -1.5,                    // 地面高度
            WIDTH: 20,                  // 地面宽度
            HEIGHT: 20,                 // 地面高度
            SUBDIVISIONS: 4,            // 地面细分程度
            COLOR: new BABYLON.Color3(0.8, 0.85, 0.9), // 雪地颜色
            SPECULAR: new BABYLON.Color3(0.1, 0.1, 0.1), // 高光颜色
            SPECULAR_POWER: 64          // 高光强度
        },
        // 雪堆设置
        SNOW_PILE: {
            BASE_SIZE: 0.5,
            BASE_HEIGHT: 0.2
        },
        // 灯光设置
        LIGHTING: {
            HEMISPHERIC: {
                INTENSITY: 0.6                        // 环境光强度
            },
            DIRECTIONAL: {
                INTENSITY: 0.8,                        // 方向光强度
                POSITION: new BABYLON.Vector3(20, 40, 20), // 光源位置
                DIRECTION: new BABYLON.Vector3(-1, -2, -1)  // 光照方向
            }
        },
        // 摄像机设置
        CAMERA: {
            POSITION_IN_BATTLE: new BABYLON.Vector3(0, 2, 6),     // 战斗场景摄像机位置
            POSITION_IN_MAP: new BABYLON.Vector3(0, 3, 10),      // 地图场景摄像机位置
            INCLINATION: Math.PI / 2.5,                           // 俯仰角
            ANGLE: -Math.PI / 2                                    // 方向角
        }
    },

    // ==================== 玩家模型常量 ====================
    PLAYER: {
        // 整体位置
        BODY_POSITION_Y: 1.5,
        BODY_POSITION_X: -2,

        // 血条属性
        HEALTH_BAR: {
            ABSOLUTE_Y: 2.0,           // 血条绝对高度
            RELATIVE_Y: 0.2            // 相对身体的高度
        },

        // 能量条属性
        ENERGY_BAR: {
            ABSOLUTE_Y: 1.8,           // 能量条绝对高度
            RELATIVE_Y: 0.5            // 相对身体的高度
        },

        // 身体属性
        BODY: {
            DIAMETER_TOP: 0.8,
            DIAMETER_BOTTOM: 1.0,
            HEIGHT: 0.8,
            TESSELLATION: 8
        },

        // 头部属性
        HEAD: {
            DIAMETER: 0.6,
            POSITION_Y: 0.9,           // 相对身体的位置
            BODY_RELATION: 0.7         // 绝对位置（从地面）
        },

        // 头发属性
        HAIR: {
            DIAMETER_TOP: 0.64,
            DIAMETER_BOTTOM: 0.7,
            HEIGHT: 0.2,
            TESSELLATION: 8
        },

        // 手臂属性
        ARM: {
            DIAMETER: 0.3,
            HEIGHT: 0.6,
            TESSELLATION: 8,
            POSITION_Y: 0.3,
            ROTATION_Z: Math.PI / 4    // 手臂旋转角度
        },

        // 腿部属性
        LEG: {
            DIAMETER: 0.4,
            HEIGHT: 0.8,
            TESSELLATION: 8,
            POSITION_Y: -0.8
        },

        // 眼睛属性
        EYE: {
            DIAMETER: 0.1,
            POSITION_Y: 0.95,           // 相对身体
            BODY_RELATION: 0.65         // 绝对位置
        },

        // 嘴巴属性
        MOUTH: {
            DIAMETER: 0.1,
            HEIGHT: 0.02,
            TESSELLATION: 8,
            POSITION_Y: 0.75            // 相对身体
        },

        // 总高度
        TOTAL_HEIGHT: 2.3,            // 玩家总高度（从地面到头顶）
        TOTAL_HEIGHT_WITH_HAIR: 2.5,  // 包含头发的高度
        HEIGHT_PERCENTAGE: 0.6        // 敌人高度应该是玩家的60%
    },

    // ==================== 敌人模型常量 ====================
    ENEMY: {
        // 整体位置
        BODY_POSITION_Y: 1.5,
        BODY_POSITION_X: 2,

        // 几何体尺寸
        SIZE: 1.5,                    // 所有敌人统一尺寸

        // 立方体属性
        BOX: {
            SIZE: 1.5,                 // 立方体大小
            HEIGHT: 1.5,               // 高度
            WIDTH: 1.5,                // 宽度
            DEPTH: 1.5                 // 深度
        },

        // 球体属性
        SPHERE: {
            DIAMETER: 1.5,             // 球体直径
            TESSELLATION: 8            // 细分程度
        },

        // 圆柱体属性
        CYLINDER: {
            HEIGHT: 1.5,               // 高度
            DIAMETER_TOP: 1.0,         // 顶部直径
            DIAMETER_BOTTOM: 1.5,      // 底部直径
            TESSELLATION: 8            // 细分程度
        },

        // 血条属性
        HEALTH_BAR: {
            RELATIVE_Y: 0.3,           // 相对于敌人的高度
            ABSOLUTE_Y: 2.0,           // 绝对高度
            WIDTH: 2.0,
            HEIGHT: 0.3,
            SCALING: 0.5,
            COLOR: 0xff0000,           // 红色血条
            MAX_WIDTH_PERCENTAGE: 1.0
        },

        // 能量条属性
        ENERGY_BAR: {
            RELATIVE_Y: 0.5,           // 相对于敌人的高度
            ABSOLUTE_Y: 1.8,           // 绝对高度
            WIDTH: 2.0,
            HEIGHT: 0.3,
            SCALING: 0.5,
            COLOR: 0x0000ff            // 蓝色能量条
        },

        // 狼模型特殊参数
        WOLF: {
            BODY: {
                DIAMETER_TOP: 0.8,
                DIAMETER_BOTTOM: 1.2,
                HEIGHT: 1.2,
                TESSELLATION: 8
            },
            HEAD: {
                DIAMETER_TOP: 0.6,
                DIAMETER_BOTTOM: 0.8,
                HEIGHT: 0.5,
                TESSELLATION: 8,
                POSITION_Y: 0.7,
                ROTATION_X: Math.PI / 2
            },
            EAR: {
                DIAMETER: 0.3,
                HEIGHT: 0.3,
                TESSELLATION: 8,
                ROTATION_X: Math.PI / 4
            },
            TAIL: {
                DIAMETER: 0.2,
                HEIGHT: 0.6,
                TESSELLATION: 8,
                ROTATION_X: -Math.PI / 4
            },
            LEG: {
                DIAMETER: 0.3,
                HEIGHT: 0.6,
                TESSELLATION: 8,
                POSITION_Y: -0.6
            },
            EYE: {
                DIAMETER: 0.1,
                POSITION_Y: 1.0,
                RING_POSITION_Z: 0.5
            },
            NOSE: {
                DIAMETER: 0.2,
                HEIGHT: 0.1,
                TESSELLATION: 8,
                POSITION_Y: 1.0,
                RING_POSITION_Z: 0.7,
                ROTATION_X: Math.PI
            }
        },

        // 熊模型特殊参数
        BEAR: {
            BODY: {
                DIAMETER_TOP: 1.2,
                DIAMETER_BOTTOM: 1.6,
                HEIGHT: 1.5,
                TESSELLATION: 8
            },
            HEAD: {
                DIAMETER: 0.8,
                TESSELLATION: 8,
                POSITION_Y: 0.7
            },
            EAR: {
                DIAMETER: 0.4,
                HEIGHT: 0.4,
                TESSELLATION: 8
            },
            ARM: {
                DIAMETER: 0.4,
                HEIGHT: 0.8,
                TESSELLATION: 8,
                POSITION_Y: 0.5
            },
            LEG: {
                DIAMETER: 0.5,
                HEIGHT: 1.0,
                TESSELLATION: 8,
                POSITION_Y: -0.8
            },
            EYE: {
                DIAMETER: 0.15,
                POSITION_Y: 1.3
            },
            NOSE: {
                DIAMETER: 0.3,
                HEIGHT: 0.15,
                TESSELLATION: 8,
                POSITION_Y: 1.1
            }
        },

        // 蛇模型特殊参数
        SNAKE: {
            BODY: {
                DIAMETER: 0.4,
                HEIGHT: 1.5,
                TESSELLATION: 8
            },
            HEAD: {
                DIAMETER: 0.5,
                HEIGHT: 0.7,
                TESSELLATION: 8,
                POSITION_Y: 0.7
            },
            EAR: {
                DIAMETER: 0.3,
                HEIGHT: 0.3,
                TESSELLATION: 8,
                POSITION_Y: 1.0
            },
            LEG: {
                DIAMETER: 0.2,
                HEIGHT: 0.4,
                TESSELLATION: 8,
                POSITION_Y: -0.6
            },
            EYE: {
                DIAMETER: 0.1,
                POSITION_Y: 1.0,
                BODY_RELATION_Z: 0.5
            },
            NOSE: {
                DIAMETER: 0.3,
                HEIGHT: 0.2,
                TESSELLATION: 8,
                POSITION_Y: 1.0,
                BODY_RELATION_Z: 0.7
            }
        }
    },

    // ==================== 血条常量 ====================
    HEALTH_BAR: {
        WIDTH: 2.0,
        HEIGHT: 0.3,
        SCALING: 0.5,
        MAX_WIDTH_PERCENTAGE: 1.0
    },

    // ==================== 敌人生成常量 ====================
    ENEMY_SPAWN: {
        MAP_WIDTH: 16,
        MAP_HEIGHT: 16,
        MIN_DISTANCE_FROM_PLAYER: 1.0,
        MAX_ENEMIES: 10,
        MIN_ENEMIES: 3
    },

    // ==================== 游戏数值常量 ====================
    NUMBERS: {
        // 玩家属性
        PLAYER: {
            BASE_ATTACK: 10,
            BASE_DEFENSE: 5,
            BASE_HP: 100,
            BASE_LUCK: 2,
            BASE_ENERGY: 100,
            MAX_ENERGY: 100,
            BASE_HP_COLOR: 0xff0000,      // 红色血条颜色
            BASE_ENERGY_COLOR: 0x0000ff, // 蓝色能量条颜色
            ENERGY_REGEN_RATE: 2,       // 能量恢复：+2/秒
            HP_REGEN_RATE: 1            // 生命恢复：+1/秒
        },

        // 资源生成
        RESOURCE: {
            WOOD_RATE: 1,                // 木材产量：+1/秒
            IRON_RATE: 0.5,              // 铁矿产量：+0.5/秒
            CRYSTAL_RATE: 0.2,           // 水晶产量：+0.2/秒
            AUTO_COLLECT_ENERGY_COST: 5  // 自动收集能量消耗
        },

        // 战斗系统
        COMBAT: {
            SKILL_COSTS: {
                POWER_ATTACK: 20,
                DEFENSE_STANCE: 15,
                HEAL: 25,
                LUCKY_STRIKE: 30
            },
            SKILL_MULTIPLIERS: {
                POWER_ATTACK: 2.0,
                DEFENSE_STANCE_DAMAGE_REDUCTION: 0.5,
                HEAL_PERCENTAGE: 0.2,
                LUCKY_STRIKE_CHANCE: 0.7,
                LUCKY_STRIKE_MULTIPLIER: 3.0
            },
            MIN_DAMAGE: 1,               // 最小伤害值
            DAMAGE_FORMULA: 'subtraction' // 伤害公式类型
        },

        // 经验值
        EXP: {
            BASE: 100,
            LEVEL_UP_MULTIPLIER: 1.5,
            EXP_RATE: 10                 // 每次战斗获得的经验值倍数
        }
    },

    // ==================== 装备系统常量 ====================
    EQUIPMENT: {
        MAX_LEVEL: 100,
        RARITY_NAMES: ['white', 'blue', 'purple', 'gold', 'legend'],
        RARITY_COLORS: {
            white: new BABYLON.Color3(1, 1, 1),
            blue: new BABYLON.Color3(0.2, 0.5, 1),
            purple: new BABYLON.Color3(0.6, 0.2, 1),
            gold: new BABYLON.Color3(1, 0.8, 0),
            legend: new BABYLON.Color3(1, 0, 0.5)
        },
        RARITY_DROP_RATES: {
            white: 0.40,
            blue: 0.30,
            purple: 0.15,
            gold: 0.10,
            legend: 0.05
        },
        REQUIRED_EQUIPMENT_COUNT: 3,
        REFINEMENT_LEVELS: 10
    },

    // ==================== 技能常量 ====================
    SKILLS: {
        POWER_ATTACK: {
            LEVEL_REQUIREMENT: 1,
            NAME: '强力攻击',
            DESCRIPTION: '造成2倍普通伤害',
            ENERGY_COST: 20,
            DAMAGE_MULTIPLIER: 2.0
        },
        DEFENSE_STANCE: {
            LEVEL_REQUIREMENT: 10,
            NAME: '防御姿态',
            DESCRIPTION: '减少50%受到的敌人伤害',
            ENERGY_COST: 15,
            DAMAGE_REDUCTION: 0.5
        },
        HEAL: {
            LEVEL_REQUIREMENT: 20,
            NAME: '生命恢复',
            DESCRIPTION: '恢复20%最大生命值',
            ENERGY_COST: 25,
            HEAL_PERCENTAGE: 0.2
        },
        LUCKY_STRIKE: {
            LEVEL_REQUIREMENT: 30,
            NAME: '幸运一击',
            DESCRIPTION: '有70%几率造成3倍伤害',
            ENERGY_COST: 30,
            CHANCE: 0.7,
            MULTIPLIER: 3.0
        }
    },

    // ==================== UI常量 ====================
    UI: {
        // 角色卡片
        CHARACTER_CARD: {
            WIDTH: 'w-64',
            HEIGHT: 'h-64',
            MIN_HEIGHT: '1.25rem'
        },

        // 按钮
        BUTTON: {
            WIDTH: 'w-10',
            HEIGHT: 'w-10',
            HOVER_TRANSITION: 'transition-all duration-200'
        },

        // 动画
        ANIMATION: {
            FADE_IN_DURATION: 1000,      // 淡入持续时间(ms)
            PULSE_DURATION: 2,            // 脉冲动画持续时间(s)
            LEVEL_UP_DURATION: 1          // 升级动画持续时间(s)
        }
    },

    // ==================== 存档常量 ====================
    SAVE: {
        FILE_EXTENSION: '.json',
        FILENAME: 'endlessWinter_save.json',
        MAX_HISTORY: 5,
        AUTO_SAVE_INTERVAL: 30000,     // 30秒自动保存
        VERSION: '1.0.0'
    },

    // ==================== 服务器常量 ====================
    SERVER: {
        PORT: 3000,
        TOKEN_EXPIRY: 24 * 60 * 60 * 1000,  // Token过期时间(ms)
        TOKEN_LENGTH: 32,
        USER_DATA_DIR: 'users',
        SAVE_DATA_DIR: 'saves'
    },

    // ==================== 音频常量 ====================
    AUDIO: {
        DEFAULT_VOLUME: 1.0,
        BATTLE_MUSIC_LOOP: true,
        SFX_LOOP: false
    }
};
