/**
 * CombatContext - 战斗上下文数据结构
 *
 * 用途：为纯函数式战斗引擎提供所有必要的数据，避免直接依赖game对象
 */

/**
 * @typedef {Object} CombatContext
 * @property {PlayerContext} player - 玩家数据
 * @property {EnemyContext} enemy - 敌人数据
 * @property {BattleStateContext} battleState - 战斗状态
 * @property {ConfigContext} config - 配置数据
 */

/**
 * @typedef {Object} PlayerContext
 * @property {number} hp - 当前HP
 * @property {number} maxHp - 最大HP
 * @property {number} attack - 攻击力
 * @property {number} defense - 防御力
 * @property {number} speed - 速度
 * @property {number} luck - 幸运
 * @property {number} accuracy - 命中率
 * @property {number} dodgeRate - 闪避率
 * @property {number} criticalRate - 暴击率
 * @property {number} critDamage - 暴击伤害倍数
 * @property {number} tenacity - 韧性
 * @property {Object} buffs - Buff状态
 * @property {Object} skills - 技能配置
 */

/**
 * @typedef {Object} EnemyContext
 * @property {string} name - 敌人名称
 * @property {string} baseName - 基础名称
 * @property {number} hp - 当前HP
 * @property {number} maxHp - 最大HP
 * @property {number} attack - 攻击力
 * @property {number} defense - 防御力
 * @property {number} speed - 速度
 * @property {number} accuracy - 命中率
 * @property {number} dodgeRate - 闪避率
 * @property {number} criticalRate - 暴击率
 * @property {number} critDamage - 暴击伤害倍数
 * @property {number} level - 等级
 * @property {boolean} isBoss - 是否Boss
 * @property {boolean} isElite - 是否精英
 * @property {Object} buffs - Buff状态
 */

/**
 * @typedef {Object} BattleStateContext
 * @property {boolean} inBattle - 是否在战斗中
 * @property {number} turnCount - 回合数
 * @property {string} currentTurn - 当前回合方 ('player' | 'enemy')
 */

/**
 * @typedef {Object} ConfigContext
 * @property {Object} skillConfig - 技能配置
 * @property {Object} realmConfig - 境界配置
 * @property {Object} dropRates - 掉落率配置
 */

/**
 * @typedef {Object} CombatResult
 * @property {string} type - 结果类型 ('attack' | 'skill' | 'defeat' | 'victory')
 * @property {Object} data - 结果数据
 * @property {PlayerContext} [updatedPlayer] - 更新后的玩家数据
 * @property {EnemyContext} [updatedEnemy] - 更新后的敌人数据
 * @property {Array<string>} logs - 战斗日志
 * @property {Array<Object>} events - 触发的事件
 */

// 导出类型定义（用于文档和IDE提示）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // 仅仅用于类型提示，不导出实际代码
    };
}
