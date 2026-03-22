// 境界技能系统 - 完整实现

// ==================== 核心功能 ====================

class RealmSkillSystem {
    constructor(game) {
        this.game = game;
    }

    // 学习技能树(境界提升时自动解锁第一个技能等级)
    learnSkillTree(skillTreeId) {
        if (!this.game.metadata?.realmSkills) {
            console.warn('realmSkills not found in metadata');
            return false;
        }

        const skillTree = this.game.metadata.realmSkills.find(tree => tree.id === skillTreeId);
        if (!skillTree) {
            console.warn(`Skill tree ${skillTreeId} not found`);
            return false;
        }

        // 检查境界要求
        const currentRealm = this.game.persistentState.player.realm.currentRealm;
        if (currentRealm < skillTree.realmRequired) {
            console.warn(`Skill tree ${skillTreeId} requires realm ${skillTree.realmRequired}, current realm ${currentRealm}`);
            return false;
        }

        // 初始化技能等级数据
        if (!this.game.persistentState.player.skills.levels) {
            this.game.persistentState.player.skills.levels = {};
        }

        // 解锁第一个技能等级
        this.game.persistentState.player.skills.levels[skillTreeId] = 1;
        console.log(`学习了技能树: ${skillTree.name} (Lv.1: ${skillTree.levels[0].name})`);

        // 自动装备技能（按类型装备）
        if (!this.game.persistentState.player.skills.equipped) {
            this.game.persistentState.player.skills.equipped = {
                attack: null,
                defense: null,
                recovery: null,
                special: null
            };
        }

        // 装备到对应类型的槽位
        const skillType = skillTree.type; // attack, defense, recovery, special
        if (!this.game.persistentState.player.skills.equipped[skillType]) {
            this.game.persistentState.player.skills.equipped[skillType] = skillTreeId;
            console.log(`自动装备技能到 ${skillType} 槽位: ${skillTree.name}`);
        }

        return true;
    }

    // 升级技能树
    upgradeSkillTree(skillTreeId) {
        if (!this.game.metadata?.realmSkills) {
            console.warn('realmSkills not found in metadata');
            return false;
        }

        const skillTree = this.game.metadata.realmSkills.find(tree => tree.id === skillTreeId);
        if (!skillTree) {
            console.warn(`Skill tree ${skillTreeId} not found`);
            return false;
        }

        // 检查技能等级
        if (!this.game.persistentState.player.skills.levels) {
            this.game.persistentState.player.skills.levels = {};
        }
        const currentLevel = this.game.persistentState.player.skills.levels[skillTreeId] || 0;

        // 检查升级条件
        if (currentLevel >= skillTree.levels.length) {
            console.warn(`技能树 ${skillTreeId} already at max level ${currentLevel}`);
            return false;
        }

        // 检查阶段要求
        const currentStage = this.game.persistentState.player.realm.currentStage;
        const nextLevelData = skillTree.levels[currentLevel];
        if (nextLevelData && nextLevelData.stageRequired !== undefined && currentStage < nextLevelData.stageRequired) {
            console.warn(`技能树 ${skillTreeId} requires stage ${nextLevelData.stageRequired}, current stage ${currentStage}`);
            return false;
        }

        // 检查玩家境界是否满足升级条件
        const requiredRealm = skillTree.realmRequired;
        if (this.game.persistentState.player.realm.currentRealm < requiredRealm) {
            console.warn(`Cannot upgrade ${skillTree.name}: 境界不足 (需要 ${requiredRealm}, 当前 ${this.game.persistentState.player.realm.currentRealm})`);
            return false;
        }

        // 检查灵力消耗
        const upgradeCost = nextLevelData.energyCost;
        if (this.game.persistentState.player.energy < upgradeCost) {
            console.warn(`Not enough energy to upgrade ${skillTree.name} (需要 ${upgradeCost}, current energy ${this.game.persistentState.player.energy})`);
            return false;
        }

        // 执行升级
        this.game.persistentState.player.energy -= upgradeCost;
        this.game.persistentState.player.skills.levels[skillTreeId] = currentLevel + 1;

        // 自动装备到对应类型的槽位（如果该槽位为空）
        const skillType = skillTree.type;
        if (!this.game.persistentState.player.skills.equipped[skillType]) {
            this.game.persistentState.player.skills.equipped[skillType] = skillTreeId;
            console.log(`自动装备技能到 ${skillType} 槽位: ${skillTree.name}`);
        }

        const skill = skillTree.levels[currentLevel];
        this.game.addBattleLog(`技能 ${skill.name} 升级到 Lv.${currentLevel + 1}`);

        console.log(`技能树 ${skillTree.name} 升级成功`);

        return true;
    }

    // 获取指定类型的当前装备技能
    getCurrentSkill(skillType = 'attack') {
        const equippedSkillId = this.game.persistentState.player.skills.equipped?.[skillType];

        if (!equippedSkillId) {
            return null;
        }

        const skillTree = this.game.metadata.realmSkills.find(tree => tree.id === equippedSkillId);
        if (!skillTree) {
            console.warn(`Skill tree ${equippedSkillId} not found`);
            return null;
        }

        const skillLevel = this.game.persistentState.player.skills.levels[equippedSkillId] || 0;
        if (skillLevel === 0) {
            return null;
        }

        const skillData = skillTree.levels[skillLevel - 1];
        if (!skillData) {
            console.warn(`Skill tree ${equippedSkillId} level ${skillLevel} data not found`);
            return null;
        }

        const realmName = this.game.metadata.realmConfig?.[skillTree.realmRequired]?.name || '未知境界';

        return {
            ...skillData,
            // 添加displayName（支持level重载baseDisplayName）
            displayName: skillData.displayName !== undefined ? skillData.displayName : (skillTree.baseDisplayName || skillData.name),
            // 资源继承（向后兼容level覆盖）
            imageId: skillData.imageId !== undefined ? skillData.imageId : skillTree.baseImageId,
            soundUrl: skillData.soundUrl !== undefined ? skillData.soundUrl : skillTree.baseSoundUrl,
            effectColor: skillData.effectColor !== undefined ? skillData.effectColor : skillTree.baseEffectColor,
            skillTreeId: equippedSkillId,
            skillTreeName: skillTree.name,
            level: skillLevel,
            type: skillTree.type,
            realmRequired: skillTree.realmRequired,
            realmName: realmName
        };
    }

    // 获取指定类型的所有可用技能（已学习且符合境界要求）
    getAvailableSkillsByType(skillType) {
        const currentRealm = this.game.persistentState.player.realm.currentRealm;

        return this.game.metadata.realmSkills.filter(tree => {
            // 检查类型
            if (tree.type !== skillType) return false;

            // 检查境界要求（可以装备当前或更低境界的技能）
            if (tree.realmRequired > currentRealm) return false;

            // 检查是否已学习
            const level = this.game.persistentState.player.skills.levels[tree.id] || 0;
            if (level === 0) return false;

            return true;
        }).map(tree => {
            const level = this.game.persistentState.player.skills.levels[tree.id];
            const skillData = tree.levels[level - 1];
            const realmName = this.game.metadata.realmConfig?.[tree.realmRequired]?.name || '未知境界';

            return {
                ...skillData,
                // 添加displayName（支持level重载baseDisplayName）
                displayName: skillData.displayName !== undefined ? skillData.displayName : (tree.baseDisplayName || skillData.name),
                // 资源继承（向后兼容level覆盖）
                imageId: skillData.imageId !== undefined ? skillData.imageId : tree.baseImageId,
                soundUrl: skillData.soundUrl !== undefined ? skillData.soundUrl : tree.baseSoundUrl,
                effectColor: skillData.effectColor !== undefined ? skillData.effectColor : tree.baseEffectColor,
                skillTreeId: tree.id,
                skillTreeName: tree.name,
                level: level,
                type: tree.type,
                realmRequired: tree.realmRequired,
                realmName: realmName
            };
        });
    }

    // 获取指定技能树的当前等级
    getSkillTreeLevel(skillTreeId) {
        return this.game.persistentState.player.skills.levels[skillTreeId] || 0;
    }

    // 获取可用的技能树列表(当前境界已解锁且满足阶段要求)
    getAvailableSkillTrees() {
        const currentRealm = this.game.persistentState.player.realm.currentRealm;
        const currentStage = this.game.persistentState.player.realm.currentStage;

        return this.game.metadata.realmSkills.filter(tree => {
            // 检查境界要求
            if (tree.realmRequired > currentRealm) return false;

            // 检查是否已学习
            const level = this.game.persistentState.player.skills.levels[tree.id] || 0;
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
        // 初始化技能等级
        if (!this.game.persistentState.player.skills.levels) {
            this.game.persistentState.player.skills.levels = {};
        }

        // 初始化装备槽位（按类型）
        if (!this.game.persistentState.player.skills.equipped) {
            this.game.persistentState.player.skills.equipped = {
                attack: null,
                defense: null,
                recovery: null,
                special: null
            };
        }

        // 为每种类型学习一个默认技能（武者境的第一个技能）
        if (this.game.metadata.realmSkills) {
            const skillTypes = ['attack', 'defense', 'recovery', 'special'];

            skillTypes.forEach(type => {
                const skillsOfType = this.game.metadata.realmSkills.filter(
                    tree => tree.realmRequired === 0 && tree.type === type
                );

                if (skillsOfType.length > 0) {
                    const firstSkill = skillsOfType[0];

                    // 如果还没学习，则学习
                    if (!this.game.persistentState.player.skills.levels[firstSkill.id]) {
                        this.learnSkillTree(firstSkill.id);
                    }

                    // 如果该类型槽位为空，则装备
                    if (!this.game.persistentState.player.skills.equipped[type]) {
                        this.game.persistentState.player.skills.equipped[type] = firstSkill.id;
                    }
                }
            });
        }
    }
}

// 导出境界技能系统
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealmSkillSystem;
} else {
    window.RealmSkillSystem = RealmSkillSystem;
}
