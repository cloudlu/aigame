/**
 * CombatContextBuilder - 战斗上下文构建器
 * 从game对象构建纯函数式CombatEngine所需的上下文
 */

class CombatContextBuilder {
    /**
     * 构建完整的战斗上下文
     * @param {EndlessCultivationGame} game - 游戏实例
     * @returns {CombatContext} 战斗上下文
     */
    static build(game) {
        const playerStats = game.getActualStats();
        const enemyStats = game.getEnemyActualStats();

        return {
            player: this.buildPlayerContext(game, playerStats),
            enemy: this.buildEnemyContext(game, enemyStats),
            battleState: this.buildBattleState(game),
            config: this.buildConfig(game)
        };
    }

    /**
     * 构建玩家上下文
     */
    static buildPlayerContext(game, playerStats) {
        return {
            hp: game.persistentState.player.hp,
            maxHp: game.persistentState.player.maxHp,
            attack: playerStats.attack,
            defense: playerStats.defense,
            speed: playerStats.speed,
            luck: playerStats.luck,
            accuracy: playerStats.accuracy,
            dodgeRate: playerStats.dodgeRate,
            criticalRate: playerStats.criticalRate,
            critDamage: playerStats.critDamage,
            tenacity: playerStats.tenacity || 0,
            currentEnergy: game.persistentState.player.currentEnergy || 100,
            buffs: game.persistentState.player.buffs || {},
            skills: game.persistentState.player.skills || {}
        };
    }

    /**
     * 构建敌人上下文
     */
    static buildEnemyContext(game, enemyStats) {
        const enemy = game.transientState.enemy;
        return {
            name: enemy.name,
            baseName: enemy.baseName,
            hp: enemy.hp,
            maxHp: enemy.maxHp,
            attack: enemyStats.attack,
            defense: enemyStats.defense,
            speed: enemyStats.speed,
            accuracy: enemyStats.accuracy,
            dodgeRate: enemyStats.dodgeRate,
            criticalRate: enemyStats.criticalRate,
            critDamage: enemyStats.critDamage,
            level: enemy.level,
            isBoss: enemy.isBoss || false,
            isElite: enemy.isElite || false,
            buffs: enemy.buffs || {}
        };
    }

    /**
     * 构建战斗状态上下文
     */
    static buildBattleState(game) {
        return {
            inBattle: game.transientState.battle?.inBattle || false,
            turnCount: game.transientState.battle?.turnCount || 1,
            currentTurn: 'player'
        };
    }

    /**
     * 构建配置上下文
     */
    static buildConfig(game) {
        return {
            skillConfig: game.metadata.skills || {},
            realmConfig: game.metadata.realmConfig || [],
            dropRates: game.metadata.dropRates || {}
        };
    }
}

// 挂载到全局（浏览器环境）
if (typeof window !== 'undefined') {
    window.CombatContextBuilder = CombatContextBuilder;
}

// 导出（Node/Vitest 环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CombatContextBuilder };
}