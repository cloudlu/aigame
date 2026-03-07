// 技能树系统 - 完整实现

// ==================== 核心功能 ====================

class SkillTreeSystem {
    constructor(game) {
        this.game = game;
    }

    // 学习技能树(境界提升时自动解锁第一个技能等级)
    learnSkillTree(skillTreeId) {
        if (!this.game.gameState.metadata.skillTrees) {
            console.warn('skillTrees not found in metadata');
            return false;
        }

        const skillTree = this.game.gameState.metadata.skillTrees.find(tree => tree.id === skillTreeId);
        if (!skillTree) {
            console.warn(`Skill tree ${skillTreeId} not found`);
            return false;
        }

        // 检查境界要求
        const currentRealm = this.game.gameState.player.realm.currentRealm;
        if (currentRealm < skillTree.realmRequired) {
            console.warn(`Skill tree ${skillTreeId} requires realm ${skillTree.realmRequired}, current realm ${currentRealm}`);
            return false;
        }

        // 初始化技能等级数据
        if (!this.game.gameState.player.skills.levels) {
            this.game.gameState.player.skills.levels = {};
        }

        // 解锁第一个技能等级
        this.game.gameState.player.skills.levels[skillTreeId] = 1;
        console.log(`学习了技能树: ${skillTree.name} (Lv.1: ${skillTree.levels[0].name})`);

        // 自动装备技能
        if (!this.game.gameState.player.skills.equipped) {
            this.game.gameState.player.skills.equipped = [];
        }
        this.game.gameState.player.skills.equipped[currentRealm] = skillTreeId;

        console.log(`自动装备技能: ${skillTree.name}`);

        return true;
    }

    // 升级技能树
    upgradeSkillTree(skillTreeId) {
        if (!this.game.gameState.metadata.skillTrees) {
            console.warn('skillTrees not found in metadata');
            return false;
        }

        const skillTree = this.game.gameState.metadata.skillTrees.find(tree => tree.id === skillTreeId);
        if (!skillTree) {
            console.warn(`Skill tree ${skillTreeId} not found`);
            return false;
        }

        // 检查技能等级
        if (!this.game.gameState.player.skills.levels) {
            this.game.gameState.player.skills.levels = {};
        }
        const currentLevel = this.game.gameState.player.skills.levels[skillTreeId] || 0;

        // 检查升级条件
        if (currentLevel >= skillTree.levels.length) {
            console.warn(`技能树 ${skillTreeId} already at max level ${currentLevel}`);
            return false;
        }

        // 检查阶段要求
        const currentStage = this.game.gameState.player.realm.currentStage;
        const nextLevelData = skillTree.levels[currentLevel];
        if (nextLevelData && nextLevelData.stageRequired !== undefined && currentStage < nextLevelData.stageRequired) {
            console.warn(`技能树 ${skillTreeId} requires stage ${nextLevelData.stageRequired}, current stage ${currentStage}`);
            return false;
        }

        // 检查玩家境界是否满足升级条件
        const requiredRealm = skillTree.realmRequired;
        if (this.game.gameState.player.realm.currentRealm !== requiredRealm) {
            console.warn(`Cannot upgrade ${skillTree.name}: 境界不足 (需要 ${requiredRealm})`);
            return false;
        }

        // 检查灵力消耗
        const upgradeCost = nextLevelData.energyCost;
        if (this.game.gameState.player.energy < upgradeCost) {
            console.warn(`Not enough energy to upgrade ${skillTree.name} (需要 ${upgradeCost}, current energy ${this.game.gameState.player.energy})`);
            return false;
        }

        // 执行升级
        this.game.gameState.player.energy -= upgradeCost;
        this.game.gameState.player.skills.levels[skillTreeId] = currentLevel + 1;
        this.game.gameState.player.skills.equipped[skillTree.realmRequired] = skillTreeId;

        const skill = skillTree.levels[currentLevel];
        this.game.addBattleLog(`技能 ${skill.name} 升级到 Lv.${currentLevel + 1}`);

        console.log(`技能树 ${skillTree.name} 升级成功`);

        return true;
    }

    // 获取当前技能数据(整合技能树和等级)
    getCurrentSkill() {
        const currentRealm = this.game.gameState.player.realm.currentRealm;
        const equippedSkillTreeId = this.game.gameState.player.skills.equipped[currentRealm];

        if (!equippedSkillTreeId) {
            return null;
        }

        const skillTree = this.game.metadata.skillTrees.find(tree => tree.id === equippedSkillTreeId);
        if (!skillTree) {
            console.warn(`Skill tree ${equippedSkillTreeId} not found`);
            return null;
        }

        const skillLevel = this.game.gameState.player.skills.levels[equippedSkillTreeId] || 0;
        if (skillLevel === 0) {
            return null;
        }

        const skillData = skillTree.levels[skillLevel - 1];
        if (!skillData) {
            console.warn(`Skill tree ${equippedSkillTreeId} level ${skillLevel} data not found`);
            return null;
        }

        return skillData;
    }

    // 获取指定技能树的当前等级
    getSkillTreeLevel(skillTreeId) {
        return this.game.gameState.player.skills.levels[skillTreeId] || 0;
    }

    // 获取可用的技能树列表(当前境界已解锁且满足阶段要求)
    getAvailableSkillTrees() {
        const currentRealm = this.game.gameState.player.realm.currentRealm;
        const currentStage = this.game.gameState.player.realm.currentStage;

        return this.game.gameState.metadata.skillTrees.filter(tree => {
            // 检查境界要求
            if (tree.realmRequired > currentRealm) return false;

            // 检查是否已学习
            const level = this.game.gameState.player.skills.levels[tree.id] || 0;
            if (level === 0) return false;

            // 检查是否有可升级的技能等级
            const nextLevel = level + 1;
            if (nextLevel > tree.levels.length) return false;

            // 检查阶段要求
            const nextLevelData = tree.levels[nextLevel - 1];
            if (nextLevelData && nextLevelData.stageRequired !== undefined &&
                currentStage < nextLevelData.stageRequired) {
                return false;
            }

            return true;
        });
    }

    // 初始化默认技能树(新玩家)
    initializeDefaultSkillTrees() {
        // 初始化技能树等级
        if (!this.game.gameState.player.skills.levels) {
            this.game.gameState.player.skills.levels = {};
        }

        // 为每个境界装备默认攻击技能
        if (this.game.gameState.metadata.skillTrees) {
            for (let realm = 0; realm < this.game.gameState.metadata.realmConfig.length; realm++) {
                const attackSkills = this.game.gameState.metadata.skillTrees.filter(
                    tree => tree.realmRequired === realm && tree.type === 'attack'
                );
                if (attackSkills.length > 0 && !this.game.gameState.player.skills.levels[attackSkills[0].id]) {
                    // 学习第一个攻击技能
                    const firstAttackSkill = attackSkills[0];
                    this.learnSkillTree(firstAttackSkill.id);

                    if (!this.game.gameState.player.skills.equipped[realm]) {
                        this.game.gameState.player.skills.equipped[realm] = firstAttackSkill.id;
                    }
                }
            }
        }
    }
}

// 导出技能树系统
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillTreeSystem;
} else {
    window.SkillTreeSystem = SkillTreeSystem;
}
