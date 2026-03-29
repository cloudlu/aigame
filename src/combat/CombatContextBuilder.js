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
            // 🔧 FIX: 使用 getActualStats() 的实际值，而不是 persistentState 的基础值
            hp: game.persistentState.player.hp,
            maxHp: playerStats.maxHp,  // ✅ 使用包含装备/buff加成的实际maxHp
            attack: playerStats.attack,
            defense: playerStats.defense,
            speed: playerStats.speed,
            luck: playerStats.luck,
            accuracy: playerStats.accuracy,
            dodgeRate: playerStats.dodgeRate,
            criticalRate: playerStats.criticalRate,
            critDamage: playerStats.critDamage,
            tenacity: playerStats.tenacity || 0,
            energy: game.persistentState.player.energy,  // ✅ 添加energy字段
            currentEnergy: game.persistentState.player.currentEnergy || 100,
            buffs: game.persistentState.player.buffs || {},
            skills: game.persistentState.player.skills || {},
            // ✅ 添加防御/闪避状态
            defenseActive: game.persistentState.player.defenseActive || false,
            defenseBonusValue: game.persistentState.player.defenseBonusValue || 0,
            dodgeActive: game.persistentState.player.dodgeActive || false,
            dodgeBonus: game.persistentState.player.dodgeBonus || 0
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
    /**
     * 构建完整的战斗上下文（多敌人模式）
     * @param {EndlessCultivationGame} game - 游戏实例
     * @returns {CombatContext} 战斗上下文（含 enemies[] 和 pets[]）
     */
    static buildMultiEnemy(game) {
        const playerStats = game.getActualStats();

        return {
            player: this.buildPlayerContext(game, playerStats),
            enemy: this.buildEnemyContext(game, game.getEnemyActualStats()),
            enemies: this.buildEnemiesContext(game),
            pets: this.buildPetsContext(game),
            battleState: this.buildBattleState(game),
            config: this.buildConfig(game)
        };
    }

    /**
     * 构建多敌人上下文数组（兼容单敌人模式）
     */
    static buildEnemiesContext(game) {
        // 多敌人模式
        const enemies = game.transientState.enemies || [];
        if (enemies.length > 0) {
            return enemies.map(enemy => ({
                id: enemy.id || enemy.name,
                name: enemy.name,
                baseName: enemy.baseName,
                hp: enemy.hp,
                maxHp: enemy.maxHp,
                attack: enemy.attack,
                defense: enemy.defense,
                speed: enemy.speed,
                accuracy: enemy.accuracy || enemy.baseAccuracy || 85,
                dodgeRate: enemy.dodgeRate || enemy.baseDodge || 3,
                criticalRate: enemy.criticalRate || 5,
                critDamage: enemy.critDamage || 1.5,
                level: enemy.level,
                isBoss: enemy.isBoss || false,
                isElite: enemy.isElite || false,
                buffs: enemy.buffs || {},
                skills: enemy.skills || [],
                energy: enemy.energy || 0,
                maxEnergy: enemy.maxEnergy || 0
            }));
        }

        // 单敌人模式（fallback）
        const enemy = game.transientState.enemy;
        if (enemy) {
            return [{
                id: enemy.id || enemy.name,
                name: enemy.name,
                baseName: enemy.baseName,
                hp: enemy.hp,
                maxHp: enemy.maxHp,
                attack: enemy.attack,
                defense: enemy.defense,
                speed: enemy.speed,
                accuracy: enemy.accuracy || enemy.baseAccuracy || 85,
                dodgeRate: enemy.dodgeRate || enemy.baseDodge || 3,
                criticalRate: enemy.criticalRate || 5,
                critDamage: enemy.critDamage || 1.5,
                level: enemy.level,
                isBoss: enemy.isBoss || false,
                isElite: enemy.isElite || false,
                buffs: enemy.buffs || {},
                skills: enemy.skills || [],
                energy: enemy.energy || 0,
                maxEnergy: enemy.maxEnergy || 0
            }];
        }

        return [];
    }

    /**
     * 构建宠物上下文数组
     */
    static buildPetsContext(game) {
        const pets = game.transientState.pets || [];
        return pets.map(pet => ({
            id: pet.id,
            name: pet.name,
            hp: pet.hp,
            maxHp: pet.maxHp,
            attack: pet.attack,
            defense: pet.defense,
            speed: pet.speed,
            criticalRate: pet.criticalRate || 5,
            critDamage: pet.critDamage || 1.5,
            skills: pet.skills || [],
            energy: pet.energy || 100,
            maxEnergy: pet.maxEnergy || 100
        }));
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