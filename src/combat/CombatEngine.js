/**
 * CombatEngine - 纯函数式战斗引擎
 *
 * 设计原则：
 * 1. 所有方法都是纯函数，不修改输入参数
 * 2. 返回结果对象，由调用方（game.js）应用状态变化
 * 3. 所有副作用（日志、UI更新）以事件形式返回
 * 4. 易于测试：输入数据 → 输出结果，无需mock
 */

class CombatEngine {
    /**
     * 计算玩家攻击
     * 纯函数：输入上下文 → 输出结果
     *
     * @param {CombatContext} context - 战斗上下文
     * @returns {CombatResult} 攻击结果
     */
    static calculatePlayerAttack(context) {
        const { player, enemy, config } = context;

        // 1. 命中判定
        const hitChance = Math.min(95, Math.max(5, player.accuracy * 100 - enemy.dodgeRate * 100));
        const isHit = Math.random() * 100 < hitChance;

        // 2. 暴击判定（命中后才判定暴击）
        const isCrit = isHit && Math.random() * 100 < player.criticalRate * 100;

        // 3. 伤害计算
        let damage = 0;
        let critResult = null;

        if (isHit) {
            if (isCrit) {
                critResult = this.rollCritDamage(player.critDamage);
                damage = Math.max(1, Math.floor(player.attack * critResult.multiplier) - enemy.defense);
            } else {
                damage = Math.max(1, player.attack - enemy.defense);
            }
        }

        // 4. 返回结果（不修改状态）
        return {
            type: 'playerAttack',
            success: true,
            data: {
                isHit,
                isCrit,
                damage,
                critResult,
                hitChance
            },
            updatedEnemy: isHit ? {
                ...enemy,
                hp: Math.max(0, enemy.hp - damage)
            } : enemy,
            logs: this.generateAttackLogs(isHit, isCrit, damage, enemy.name),
            events: [
                {
                    type: 'battle:attack',
                    data: {
                        attacker: 'player',
                        target: enemy.name,
                        isHit,
                        isCrit,
                        damage,
                        timestamp: Date.now()
                    }
                }
            ]
        };
    }

    /**
     * 计算敌人攻击
     * 纯函数
     *
     * @param {CombatContext} context - 战斗上下文
     * @returns {CombatResult} 敌人攻击结果
     */
    static calculateEnemyAttack(context) {
        const { player, enemy, config } = context;

        // 1. 命中判定（包含闪避技能加成）
        let hitChance = Math.min(95, Math.max(5, enemy.accuracy * 100 - player.dodgeRate * 100));

        // ✅ 应用闪避技能加成
        if (player.dodgeActive && player.dodgeBonus) {
            hitChance -= player.dodgeBonus * 100;
            hitChance = Math.max(5, hitChance);
        }

        const isHit = Math.random() * 100 < hitChance;

        // 2. 暴击判定
        const isCrit = isHit && Math.random() * 100 < enemy.criticalRate * 100;

        // 3. 基础伤害计算
        const minDamage = Math.floor(enemy.attack * 0.2);
        const baseDamage = Math.max(minDamage, enemy.attack - player.defense);

        // 4. 韧性减伤（只对暴击有效）
        let damage = 0;
        let critResult = null;
        let tenacityReduction = 0;

        if (isHit) {
            if (isCrit) {
                // 暴击：应用韧性减免到暴击倍率
                critResult = this.rollCritDamage(enemy.critDamage || 1.5);

                // 韧性减免：tenacityReduction = tenacity / (tenacity + 1)
                tenacityReduction = (player.tenacity || 0) / ((player.tenacity || 0) + 1);

                // 应用减免后的暴击倍率（最低1.1倍）
                const reducedMultiplier = Math.max(1.1, critResult.multiplier * (1 - tenacityReduction));
                damage = Math.max(1, Math.floor(baseDamage * reducedMultiplier));
            } else {
                // 普通攻击：不应用韧性
                damage = baseDamage;
            }
        }

        // 5. 返回结果
        const dodgeUsed = player.dodgeActive && player.dodgeBonus;

        return {
            type: 'enemyAttack',
            success: true,
            data: {
                isHit,
                isCrit,
                damage,
                critResult,
                tenacityReduction,
                hitChance,
                baseDamage,
                dodgeUsed  // ✅ 是否使用了闪避技能
            },
            updatedPlayer: isHit ? {
                ...player,
                hp: Math.max(0, player.hp - damage),
                // ✅ 重置闪避技能状态（如果使用过）
                ...(dodgeUsed && { dodgeActive: false, dodgeBonus: 0 })
            } : {
                ...player,
                // ✅ 即使未命中，也要重置闪避技能状态（如果使用过）
                ...(dodgeUsed && { dodgeActive: false, dodgeBonus: 0 })
            },
            logs: this.generateEnemyAttackLogs(isHit, isCrit, damage, enemy.name, tenacityReduction),
            events: [
                {
                    type: 'battle:enemyAction',
                    data: {
                        attacker: enemy.name,
                        target: 'player',
                        isHit,
                        isCrit,
                        damage,
                        timestamp: Date.now()
                    }
                }
            ]
        };
    }

    /**
     * 检查战斗结束
     * 纯函数
     *
     * @param {CombatContext} context - 战斗上下文
     * @returns {Object} 战斗结束检查结果
     */
    static checkBattleEnd(context) {
        const { player, enemy } = context;

        if (enemy.hp <= 0) {
            return {
                isEnded: true,
                winner: 'player',
                result: {
                    type: 'victory',
                    data: {
                        enemy: enemy.name,
                        isBoss: enemy.isBoss,
                        isElite: enemy.isElite,
                        level: enemy.level
                    }
                }
            };
        }

        if (player.hp <= 0) {
            return {
                isEnded: true,
                winner: 'enemy',
                result: {
                    type: 'defeat',
                    data: {
                        enemy: enemy.name
                    }
                }
            };
        }

        return {
            isEnded: false,
            winner: null,
            result: null
        };
    }

    /**
     * 暴击伤害随机
     * 纯函数
     *
     * @param {number} critDamage - 暴击伤害倍数
     * @returns {Object} 暴击结果
     */
    static rollCritDamage(critDamage) {
        // 暴击伤害计算：基础1.5倍 + (critDamage / 100)
        // critDamage 是暴击伤害加成值（装备属性），每100点增加1倍暴击倍率
        const baseMultiplier = 1.5 + (critDamage / 100);

        // 暴击伤害浮动范围：基础倍数的 90% - 110%
        const variance = 0.1;
        const randomMultiplier = 1 + (Math.random() * 2 - 1) * variance;
        const finalMultiplier = baseMultiplier * randomMultiplier;

        return {
            baseMultiplier: baseMultiplier,
            variance: randomMultiplier - 1,
            multiplier: finalMultiplier,
            roll: Math.random()
        };
    }

    /**
     * 生成攻击日志
     * 纯函数
     *
     * @param {boolean} isHit - 是否命中
     * @param {boolean} isCrit - 是否暴击
     * @param {number} damage - 伤害值
     * @param {string} enemyName - 敌人名称
     * @returns {Array<string>} 日志数组
     */
    static generateAttackLogs(isHit, isCrit, damage, enemyName) {
        if (!isHit) {
            return [`攻击${enemyName}未命中`];
        }

        if (isCrit) {
            return [`💥暴击！对${enemyName}造成${damage}点伤害！`];
        }

        return [`对${enemyName}造成${damage}点伤害`];
    }

    /**
     * 生成敌人攻击日志
     * 纯函数
     *
     * @param {boolean} isHit - 是否命中
     * @param {boolean} isCrit - 是否暴击
     * @param {number} damage - 伤害值
     * @param {string} enemyName - 敌人名称
     * @param {number} tenacityReduction - 韧性减免比例
     * @returns {Array<string>} 日志数组
     */
    static generateEnemyAttackLogs(isHit, isCrit, damage, enemyName, tenacityReduction = 0) {
        if (!isHit) {
            return [`${enemyName}的攻击被你闪避了`];
        }

        if (isCrit) {
            const reductionText = tenacityReduction > 0 ? ` 韧性减免${Math.floor(tenacityReduction * 100)}%` : '';
            return [`💥${enemyName}暴击！你受到${damage}点伤害！${reductionText}`];
        }

        return [`${enemyName}对你造成${damage}点伤害`];
    }

    /**
     * 计算技能效果
     * 纯函数
     *
     * @param {CombatContext} context - 战斗上下文
     * @param {string} skillId - 技能ID
     * @returns {CombatResult} 技能结果
     */
    static calculateSkillEffect(context, skillId) {
        const { player, enemy, config } = context;
        const skill = config.skillConfig?.[skillId];

        if (!skill) {
            return {
                type: 'skill',
                success: false,
                error: '技能不存在',
                logs: [`技能${skillId}不存在`],
                events: []
            };
        }

        // 检查灵力消耗
        if (player.currentEnergy < skill.energyCost) {
            return {
                type: 'skill',
                success: false,
                error: '灵力不足',
                logs: ['灵力不足，无法使用技能'],
                events: []
            };
        }

        // 根据技能类型计算效果
        const effects = skill.effects || [];
        const result = {
            type: 'skill',
            success: true,
            data: {
                skillId,
                skillName: skill.displayName,
                energyCost: skill.energyCost
            },
            updatedPlayer: {
                ...player,
                currentEnergy: player.currentEnergy - skill.energyCost
            },
            logs: [`使用技能【${skill.displayName}】`],
            events: [
                {
                    type: 'battle:skill',
                    data: {
                        skillId,
                        skillName: skill.displayName,
                        energyCost: skill.energyCost,
                        timestamp: Date.now()
                    }
                }
            ]
        };

        // 处理技能效果
        effects.forEach(effect => {
            this.processSkillEffect(result, effect, context);
        });

        return result;
    }

    /**
     * 处理单个技能效果
     * 纯函数（修改result对象，但不修改输入参数）
     *
     * @param {CombatResult} result - 技能结果（会被修改）
     * @param {Object} effect - 技能效果
     * @param {CombatContext} context - 战斗上下文
     */
    static processSkillEffect(result, effect, context) {
        const { player, enemy } = context;

        switch (effect.type) {
            case 'damage':
                const damage = Math.floor(player.attack * effect.multiplier || 1);
                result.updatedEnemy = {
                    ...(result.updatedEnemy || enemy),
                    hp: Math.max(0, (result.updatedEnemy?.hp || enemy.hp) - damage)
                };
                result.logs.push(`造成${damage}点伤害`);
                result.events.push({
                    type: 'battle:damage',
                    data: { target: enemy.name, value: damage, type: 'skill' }
                });
                break;

            case 'heal':
                const healAmount = Math.floor(player.maxHp * (effect.percentage || 0.1));
                result.updatedPlayer = {
                    ...result.updatedPlayer,
                    hp: Math.min(player.maxHp, result.updatedPlayer.hp + healAmount)
                };
                result.logs.push(`恢复${healAmount}点生命`);
                result.events.push({
                    type: 'battle:heal',
                    data: { target: 'player', value: healAmount }
                });
                break;

            // 可以继续添加其他效果类型...
        }
    }
    /**
     * 计算技能效果（伤害类技能）
     * 纯函数：输入上下文 → 输出结果
     *
     * @param {CombatContext} context - 战斗上下文
     * @param {string} skillType - 技能类型 ('attack' | 'defense' | 'recovery' | 'special')
     * @param {Object} skillData - 技能数据对象
     * @param {number} skillLevel - 技能等级
     * @returns {CombatResult} 技能结果
     */
    static calculateSkillDamage(context, skillType, skillData, skillLevel) {
        const { player, enemy } = context;
        const logs = [];
        const events = [];

        // 检查灵力消耗
        const energyCost = skillData.energyCost || 0;
        if (player.energy < energyCost) {
            return {
                type: 'skill',
                success: false,
                error: '灵力不足',
                logs: [`灵力不足！需要${energyCost}灵力`],
                events: []
            };
        }

        // 计算命中和伤害
        let hit = true;
        let playerDamage = 0;
        let playerCrit = false;
        let playerCritResult = null;
        let isLuckyStrike = false;

        // 伤害类技能
        if (skillData.damageMultiplier || skillData.criticalMultiplier) {
            // 命中判定
            const hitChance = Math.min(95, Math.max(5, player.accuracy * 100 - enemy.dodgeRate * 100));
            hit = Math.random() * 100 < hitChance;

            if (hit) {
                if (skillData.damageMultiplier) {
                    // 计算技能基础伤害
                    let baseSkillDamage = Math.floor(player.attack * skillData.damageMultiplier) - enemy.defense;
                    if (skillData.extraDamagePercent) {
                        baseSkillDamage += Math.floor(enemy.maxHp * skillData.extraDamagePercent);
                    }
                    if (skillData.ignoreDefense) {
                        baseSkillDamage += Math.floor(enemy.defense * skillData.ignoreDefense);
                    }

                    // 暴击判定
                    playerCrit = Math.random() * 100 < player.criticalRate * 100;

                    if (playerCrit) {
                        playerCritResult = this.rollCritDamage(player.critDamage);
                        playerDamage = Math.max(1, Math.floor(baseSkillDamage * playerCritResult.multiplier));
                    } else {
                        playerDamage = Math.max(1, baseSkillDamage);
                    }
                } else if (skillData.criticalMultiplier) {
                    isLuckyStrike = Math.random() < skillData.criticalChance;
                    playerDamage = isLuckyStrike
                        ? Math.max(1, Math.floor(player.attack * skillData.criticalMultiplier) - enemy.defense)
                        : Math.max(1, player.attack - enemy.defense);
                }
            }
        }

        // 生成日志
        const skillName = skillData.name || '技能';
        if (!hit) {
            logs.push(`使用【${skillName}】攻击${enemy.name}未命中！`);
        } else if (playerCrit) {
            logs.push(`💥使用【${skillName}】暴击！对${enemy.name}造成${playerDamage}点伤害！`);
        } else if (isLuckyStrike) {
            logs.push(`💫使用【${skillName}】幸运一击！对${enemy.name}造成${playerDamage}点伤害！`);
        } else {
            logs.push(`使用【${skillName}】对${enemy.name}造成${playerDamage}点伤害！`);
        }

        return {
            type: 'skill',
            success: true,
            data: {
                skillType,
                skillName,
                skillLevel,
                energyCost,
                hit,
                damage: playerDamage,
                isCrit: playerCrit,
                isLuckyStrike,
                critResult: playerCritResult
            },
            updatedPlayer: {
                ...player,
                energy: player.energy - energyCost
            },
            updatedEnemy: hit ? {
                ...enemy,
                hp: Math.max(0, enemy.hp - playerDamage)
            } : enemy,
            logs,
            events: [
                {
                    type: 'battle:skill',
                    data: {
                        skillType,
                        skillName,
                        energyCost,
                        damage: playerDamage,
                        isCrit: playerCrit,
                        target: enemy.name,
                        timestamp: Date.now()
                    }
                }
            ]
        };
    }

    /**
     * 计算防御技能
     * 纯函数：输入上下文 → 输出结果
     *
     * @param {CombatContext} context - 战斗上下文
     * @param {string} skillType - 技能类型
     * @param {Object} skillData - 技能数据
     * @param {number} skillLevel - 技能等级
     * @returns {CombatResult} 技能结果
     */
    static calculateDefenseSkill(context, skillType, skillData, skillLevel) {
        const { player } = context;
        const logs = [];
        const events = [];
        const skillName = skillData.name || '防御技能';

        // 检查灵力消耗
        const energyCost = skillData.energyCost || 0;
        if (player.energy < energyCost) {
            return {
                type: 'skill',
                success: false,
                error: '灵力不足',
                logs: [`灵力不足！需要${energyCost}灵力`],
                events: []
            };
        }

        // 防御加成
        const defenseBonus = skillData.defenseBonus || 0.5;
        const defensePercent = Math.floor(defenseBonus * 100);

        logs.push(`激活防御姿态！下次受到的伤害减少${defensePercent}%`);

        return {
            type: 'skill',
            success: true,
            data: {
                skillType,
                skillName,
                skillLevel,
                energyCost,
                defenseBonus,
                defensePercent
            },
            updatedPlayer: {
                ...player,
                energy: player.energy - energyCost,
                defenseActive: true,
                defenseBonusValue: defenseBonus
            },
            logs,
            events: [{
                type: 'battle:defense',
                data: {
                    skillName,
                    defenseBonus,
                    timestamp: Date.now()
                }
            }]
        };
    }

    /**
     * 计算治疗技能
     * 纯函数：输入上下文 → 输出结果
     *
     * @param {CombatContext} context - 战斗上下文
     * @param {string} skillType - 技能类型
     * @param {Object} skillData - 技能数据
     * @param {number} skillLevel - 技能等级
     * @returns {CombatResult} 技能结果
     */
    static calculateHealSkill(context, skillType, skillData, skillLevel) {
        const { player } = context;
        const logs = [];
        const events = [];
        const skillName = skillData.name || '治疗技能';

        // 🔍 DEBUG: 记录输入参数
        console.log('🔧 [calculateHealSkill] 输入参数:', {
            playerHp: player.hp,
            playerMaxHp: player.maxHp,
            healPercentage: skillData.healPercentage,
            energy: player.energy,
            energyCost: skillData.energyCost
        });

        // 检查灵力消耗
        const energyCost = skillData.energyCost || 0;
        if (player.energy < energyCost) {
            return {
                type: 'skill',
                success: false,
                error: '灵力不足',
                logs: [`灵力不足！需要${energyCost}灵力`],
                events: []
            };
        }

        // 计算治疗量
        const healPercentage = skillData.healPercentage || 0;
        const healAmount = Math.floor(player.maxHp * healPercentage);
        const newHp = Math.min(player.hp + healAmount, player.maxHp);
        const actualHeal = newHp - player.hp;

        // 🔍 DEBUG: 记录计算过程
        console.log('🔧 [calculateHealSkill] 计算过程:', {
            healAmount,
            newHp,
            actualHeal,
            'hp > maxHp?': player.hp > player.maxHp
        });

        logs.push(`恢复了${actualHeal}点生命值！`);

        return {
            type: 'skill',
            success: true,
            data: {
                skillType,
                skillName,
                skillLevel,
                energyCost,
                healPercentage,
                healAmount: actualHeal,
                oldHp: player.hp,
                newHp
            },
            updatedPlayer: {
                ...player,
                energy: player.energy - energyCost,
                hp: newHp
            },
            logs,
            events: [{
                type: 'battle:heal',
                data: {
                    skillName,
                    healAmount: actualHeal,
                    timestamp: Date.now()
                }
            }]
        };
    }

    /**
     * 计算闪避技能
     * 纯函数：输入上下文 → 输出结果
     *
     * @param {CombatContext} context - 战斗上下文
     * @param {string} skillType - 技能类型
     * @param {Object} skillData - 技能数据
     * @param {number} skillLevel - 技能等级
     * @returns {CombatResult} 技能结果
     */
    static calculateDodgeSkill(context, skillType, skillData, skillLevel) {
        const { player } = context;
        const logs = [];
        const events = [];
        const skillName = skillData.name || '闪避技能';

        // 检查灵力消耗
        const energyCost = skillData.energyCost || 0;
        if (player.energy < energyCost) {
            return {
                type: 'skill',
                success: false,
                error: '灵力不足',
                logs: [`灵力不足！需要${energyCost}灵力`],
                events: []
            };
        }

        // 闪避加成
        const dodgeBonus = skillData.dodgeBonus || 0;
        const dodgePercent = Math.floor(dodgeBonus * 100);

        logs.push(`激活闪避姿态！闪避率提高${dodgePercent}%`);

        return {
            type: 'skill',
            success: true,
            data: {
                skillType,
                skillName,
                skillLevel,
                energyCost,
                dodgeBonus,
                dodgePercent
            },
            updatedPlayer: {
                ...player,
                energy: player.energy - energyCost,
                dodgeActive: true,
                dodgeBonus
            },
            logs,
            events: [{
                type: 'battle:dodge',
                data: {
                    skillName,
                    dodgeBonus,
                    timestamp: Date.now()
                }
            }]
        };
    }

    /**
     * 计算玩家战败
     * 纯函数：输入上下文 → 输出结果
     *
     * @param {CombatContext} context - 战斗上下文
     * @returns {CombatResult} 战败结果
     */
    static calculatePlayerDefeat(context) {
        const { player, enemy } = context;

        // 计算经验损失（20%）
        const expLoss = Math.floor(player.exp * 0.2);
        const remainingExp = Math.floor(player.exp * 0.8);

        return {
            type: 'playerDefeat',
            success: true,
            data: {
                enemy: enemy.name,
                expLoss,
                expRemaining: remainingExp
            },
            updatedPlayer: {
                ...player,
                exp: remainingExp,
                hp: player.maxHp,
                energy: player.maxEnergy
            },
            updatedEnemy: {
                ...enemy,
                hp: enemy.maxHp,
                energy: enemy.maxEnergy
            },
            logs: [
                `你被${enemy.name}击败了！`,
                `你失去了 ${expLoss} 点经验！(20%)`
            ],
            events: [
                {
                    type: 'battle:defeat',
                    data: {
                        enemy: enemy.name,
                        expLoss,
                        timestamp: Date.now()
                    }
                }
            ]
        };
    }

    /**
     * 计算敌人被击败
     * 纯函数：输入上下文 → 输出结果
     *
     * @param {CombatContext} context - 战斗上下文
     * @returns {CombatResult} 胜利结果
     */
    static calculateEnemyDefeat(context) {
        const { player, enemy, config } = context;

        // 计算经验奖励
        const expMultiplier = enemy.expMultiplier || 1;
        const expGained = Math.floor(enemy.level * 20 * expMultiplier);

        // 计算资源掉落
        const resourceMultiplier = enemy.resourceMultiplier || 1;
        const herbsGained = Math.floor((enemy.level * 5 + Math.random() * 5) * resourceMultiplier);
        const ironGained = Math.floor((enemy.level * 2 + Math.random() * 3) * resourceMultiplier);
        const spiritStonesGained = Math.floor((enemy.level * 1 + Math.random() * 2) * resourceMultiplier);

        // 计算HP/灵力恢复
        const killEnergyRecovery = 15;
        const hpRecoveryPercent = 0.35;
        const hpRecovery = Math.floor(player.maxHp * hpRecoveryPercent);
        const actualHpRecovered = Math.min(hpRecovery, player.maxHp - player.hp);

        // 突破石掉落计算（只有BOSS有几率）
        let breakthroughStonesGained = 0;
        if (enemy.isBoss) {
            // 简化版突破石掉落逻辑（不依赖realm详情）
            const dropChance = 0.05 + (Math.random() * 0.2); // 5-25%概率
            if (Math.random() < dropChance) {
                breakthroughStonesGained = Math.floor(Math.random() * 3) + 1;
            }
        }

        // 生成日志
        const logs = [];
        if (enemy.isElite) {
            logs.push(`你击败了${enemy.name}！`);
            logs.push(`精英敌人奖励翻倍！获得了${expGained}点经验！`);
        } else {
            logs.push(`你击败了${enemy.name}，获得了${expGained}点经验！`);
        }
        logs.push(`获得了${herbsGained}灵草，${ironGained}玄铁，${spiritStonesGained}灵石！`);
        logs.push(`杀死敌人恢复了${killEnergyRecovery}点灵力！`);
        if (actualHpRecovered > 0) {
            logs.push(`战斗胜利恢复了${actualHpRecovered}点生命值！`);
        }
        if (breakthroughStonesGained > 0) {
            logs.push(`获得了${breakthroughStonesGained}个突破石！`);
        }

        return {
            type: 'enemyDefeat',
            success: true,
            data: {
                enemy: enemy.name,
                isBoss: enemy.isBoss || false,
                isElite: enemy.isElite || false,
                expGained,
                herbsGained,
                ironGained,
                spiritStonesGained,
                breakthroughStonesGained,
                killEnergyRecovery,
                actualHpRecovered
            },
            updatedPlayer: {
                ...player,
                exp: player.exp + expGained,
                hp: player.hp + actualHpRecovered,
                energy: Math.min(player.energy + killEnergyRecovery, player.maxEnergy),
                resources: {
                    ...player.resources,
                    herbs: (player.resources?.herbs || 0) + herbsGained,
                    iron: (player.resources?.iron || 0) + ironGained,
                    spiritStones: (player.resources?.spiritStones || 0) + spiritStonesGained,
                    breakthroughStones: (player.resources?.breakthroughStones || 0) + breakthroughStonesGained
                }
            },
            logs,
            events: [
                {
                    type: 'battle:victory',
                    data: {
                        enemy: enemy.name,
                        isBoss: enemy.isBoss || false,
                        isElite: enemy.isElite || false,
                        expGained,
                        timestamp: Date.now()
                    }
                }
            ]
        };
    }

    /**
     * 处理回合开始时的Buff效果
     * 纯函数：输入上下文 → 输出结果
     *
     * @param {CombatContext} context - 战斗上下文
     * @returns {CombatResult} Buff处理结果
     */
    static processBuffsAtTurnStart(context) {
        const { player } = context;
        const logs = [];
        const events = [];

        // 初始化临时加成
        let tempAttackBonus = 0;
        let tempDefenseBonus = 0;
        let tempSkillCostReduce = 0;

        // 处理每个buff
        if (player.buffs && player.buffs.length > 0) {
            for (const buff of player.buffs) {
                switch (buff.type) {
                    case 'allStatsBonus':
                        tempAttackBonus += buff.value || 0;
                        tempDefenseBonus += buff.value || 0;
                        logs.push(`全属性加成生效：攻击+${Math.floor((buff.value || 0) * 100)}%，防御+${Math.floor((buff.value || 0) * 100)}%`);
                        break;
                    case 'skillCostReduce':
                        tempSkillCostReduce = buff.value || 0;
                        logs.push(`技能消耗减少${Math.floor((buff.value || 0) * 100)}%`);
                        break;
                    case 'damageBonus':
                        // 伤害加成在使用技能时应用
                        logs.push(`伤害加成buff生效`);
                        break;
                }
            }
        }

        // 返回结果
        return {
            type: 'buffsAtTurnStart',
            success: true,
            data: {
                buffsProcessed: player.buffs?.length || 0
            },
            updatedPlayer: {
                ...player,
                tempAttackBonus,
                tempDefenseBonus,
                tempSkillCostReduce
            },
            logs,
            events
        };
    }

    /**
     * 处理Buff/Debuff衰减
     * 纯函数：输入上下文 → 输出结果
     *
     * @param {CombatContext} context - 战斗上下文
     * @returns {CombatResult} Buff衰减结果
     */
    static processBuffDecay(context) {
        const { player, enemy } = context;
        const logs = [];
        const events = [];

        // 1. 处理玩家buff衰减
        const updatedPlayerBuffs = (player.buffs || []).map(buff => ({
            ...buff,
            turns: buff.turns - 1
        })).filter(buff => {
            if (buff.turns <= 0) {
                logs.push(`${buff.type}效果已消失`);
                events.push({
                    type: 'battle:buffExpired',
                    data: {
                        target: 'player',
                        buffType: buff.type,
                        timestamp: Date.now()
                    }
                });
                return false;
            }
            return true;
        });

        // 2. 处理敌人debuff衰减
        const updatedEnemyDebuffs = (enemy.debuffs || []).map(debuff => ({
            ...debuff,
            turns: debuff.turns - 1
        })).filter(debuff => {
            if (debuff.turns <= 0) {
                logs.push(`敌人的${debuff.type}效果已消失`);
                events.push({
                    type: 'battle:debuffExpired',
                    data: {
                        target: enemy.name,
                        debuffType: debuff.type,
                        timestamp: Date.now()
                    }
                });
                return false;
            }
            return true;
        });

        // 3. 返回结果（包括清除临时加成）
        return {
            type: 'buffDecay',
            success: true,
            data: {
                expiredPlayerBuffs: (player.buffs || []).filter(b => b.turns - 1 <= 0),
                expiredEnemyDebuffs: (enemy.debuffs || []).filter(d => d.turns - 1 <= 0)
            },
            updatedPlayer: {
                ...player,
                buffs: updatedPlayerBuffs,
                tempAttackBonus: 0,
                tempDefenseBonus: 0,
                tempAccuracyBonus: 0,
                tempSkillCostReduce: 0
            },
            updatedEnemy: {
                ...enemy,
                debuffs: updatedEnemyDebuffs
            },
            logs,
            events
        };
    }

    /**
     * 获取技能元素类型
     * 纯函数：根据技能的effectColor返回元素类型
     *
     * @param {Object} skill - 技能对象
     * @returns {string} 元素类型 ('fire' | 'ice' | 'thunder' | 'wind')
     */
    static getSkillElementType(skill) {
        if (!skill || !skill.effectColor) return 'wind';

        const color = skill.effectColor;

        // 红色系 -> 火元素
        if (color.r > 0.7 && color.g < 0.5 && color.b < 0.5) {
            return 'fire';
        }
        // 蓝色系 -> 冰元素
        else if (color.b > 0.7 && color.r < 0.5 && color.g < 0.7) {
            return 'ice';
        }
        // 黄色/紫色系 -> 雷元素
        else if ((color.r > 0.7 && color.g > 0.7) || (color.r > 0.5 && color.b > 0.5)) {
            return 'thunder';
        }
        // 绿色/白色系 -> 风元素
        else {
            return 'wind';
        }
    }

    // ==================== 多敌人战斗系统 ====================

    /**
     * 攻击指定敌人（多敌人模式）
     * @param {Object} context - 战斗上下文（含 enemies[]）
     * @param {number} targetIndex - 目标敌人索引
     * @returns {Object} { success, data, updatedEnemies, logs, events }
     */
    static calculatePlayerAttackTargeted(context, targetIndex) {
        const { enemies } = context;
        const enemy = enemies[targetIndex];
        if (!enemy || enemy.hp <= 0) {
            return { success: false, error: '无效目标', logs: ['目标无效！'] };
        }

        // 复用现有攻击逻辑，但作用于指定敌人
        const singleContext = { ...context, enemy };
        const result = CombatEngine.calculatePlayerAttack(singleContext);

        // 更新 enemies 数组中对应敌人
        const updatedEnemies = [...enemies];
        updatedEnemies[targetIndex] = result.updatedEnemy;

        return {
            ...result,
            updatedEnemies,
            targetIndex
        };
    }

    /**
     * 所有存活敌人依次反击（多敌人模式）
     * @param {Object} context - 战斗上下文（含 enemies[]）
     * @returns {Object[]} 每个敌人的反击结果数组
     */
    static calculateMultiEnemyCounterAttack(context) {
        const { enemies } = context;
        const results = [];
        const currentEnemies = [...enemies];

        for (let i = 0; i < currentEnemies.length; i++) {
            if (currentEnemies[i].hp <= 0) continue;

            const singleContext = { ...context, enemy: currentEnemies[i], enemies: currentEnemies };
            const result = CombatEngine.calculateEnemyAttack(singleContext);

            results.push({
                enemyIndex: i,
                enemyName: currentEnemies[i].name,
                ...result
            });

            // 更新后续敌人上下文中的玩家状态
            if (result.updatedPlayer) {
                context = { ...context, player: result.updatedPlayer };
            }
        }

        return results;
    }

    /**
     * 检查多敌人战斗结束
     * @param {Object} context - 含 player, enemies[], pets[]
     * @returns {Object} { ended, result:'victory'|'defeat'|null, remainingEnemies }
     */
    static checkMultiBattleEnd(context) {
        const { player, enemies, pets } = context;

        // 玩家死亡 = 战败（宠物存活不算输）
        const playerAlive = player.hp > 0;
        const petsAlive = (pets || []).some(p => p.hp > 0);

        if (!playerAlive && !petsAlive) {
            return { ended: true, result: 'defeat', remainingEnemies: enemies.filter(e => e.hp > 0).length };
        }

        // 所有敌人死亡 = 胜利
        const aliveEnemies = enemies.filter(e => e.hp > 0);
        if (aliveEnemies.length === 0) {
            return { ended: true, result: 'victory', remainingEnemies: 0 };
        }

        return { ended: false, result: null, remainingEnemies: aliveEnemies.length };
    }

    /**
     * 解析技能 targeting 元数据，返回实际目标列表
     * @param {Object} context - 战斗上下文
     * @param {Object} skill - 技能对象（含 targeting）
     * @param {string} userSide - 'player'|'enemy'|'pet' 使用者阵营
     * @param {number} targetIndex - 手动选择的目标索引
     * @returns {Object[]} 目标数组
     */
    static resolveTargeting(context, skill, userSide, targetIndex = 0) {
        const { player, enemies, pets } = context;
        const targeting = skill.targeting || { side: 'enemy', count: 'single', selection: 'manual' };
        let { side, count, selection } = targeting;

        // 映射 side：敌人视角自动转换
        if (userSide === 'enemy') {
            if (side === 'enemy') side = 'playerSide'; // 敌人的"enemy" = 玩家方
            else if (side === 'ally') side = 'enemySide'; // 敌人的"ally" = 其他敌人
        }

        let targets = [];

        if (side === 'enemy' || side === 'playerSide') {
            // 目标是敌方阵营
            if (userSide === 'enemy') {
                // 敌人攻击玩家方 → 目标是玩家 + 宠物
                targets = [
                    ...(player.hp > 0 ? [player] : []),
                    ...(pets || []).filter(p => p.hp > 0)
                ];
            } else {
                // 玩家/宠物攻击敌人方
                targets = enemies.filter(e => e.hp > 0);
            }
        } else if (side === 'ally' || side === 'enemySide') {
            // 目标是友方阵营
            if (userSide === 'enemy') {
                targets = enemies.filter(e => e.hp > 0);
            } else {
                targets = [
                    ...(player.hp > 0 ? [player] : []),
                    ...(pets || []).filter(p => p.hp > 0)
                ];
            }
        } else if (side === 'self') {
            // 目标是自己（由调用方处理）
            return 'SELF';
        }

        // 根据 count 筛选
        if (count === 'single') {
            if (selection === 'manual' && targetIndex < targets.length) {
                return [targets[targetIndex]];
            }
            if (selection === 'auto' || selection === 'manual') {
                // auto: 选HP最低的 / manual fallback: 选第一个
                if (selection === 'auto') {
                    targets.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
                }
                return [targets[0]];
            }
            return targets.length > 0 ? [targets[0]] : [];
        }

        if (count === 'all') {
            return targets;
        }

        // upTo_N 模式
        const maxTargets = parseInt(String(count).replace('upTo_', '')) || targets.length;
        if (selection === 'auto') {
            targets.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
        }
        return targets.slice(0, maxTargets);
    }

    /**
     * 统一技能结算（基于 targeting 元数据）
     * @param {Object} context - 战斗上下文
     * @param {Object} skill - 技能对象（含 targeting, aoe, 效果属性）
     * @param {string} userSide - 'player'|'enemy'|'pet'
     * @param {number} targetIndex - 手动选择的目标索引
     * @returns {Object} { updatedContext, results[], logs[], events[] }
     */
    static calculateSkillWithTargeting(context, skill, userSide, targetIndex = 0) {
        const targets = CombatEngine.resolveTargeting(context, skill, userSide, targetIndex);

        // self 类型：返回标记，由调用方处理自身效果
        if (targets === 'SELF') {
            return CombatEngine._calculateSelfSkill(context, skill, userSide);
        }

        if (targets.length === 0) {
            return { updatedContext: context, results: [], logs: ['没有有效目标！'], events: [] };
        }

        const skillType = skill.type || (skill.damageMultiplier ? 'attack' : 'support');
        const logs = [];
        const events = [];
        const results = [];

        if (skillType === 'attack' || skill.damageMultiplier) {
            // 攻击技能：按 aoe.mode 分配伤害
            const aoe = skill.aoe || { mode: 'full' };

            if (aoe.mode === 'full') {
                // 每个目标独立全额计算
                for (let i = 0; i < targets.length; i++) {
                    const singleCtx = { ...context, enemy: targets[i] };
                    const result = CombatEngine.calculateSkillDamage(singleCtx, skill.type || 'attack', skill, skill.skillLevel || 1);
                    results.push({ target: targets[i], ...result });
                }
            } else if (aoe.mode === 'splash') {
                // 主目标100%，其他按 splashRatio 衰减
                for (let i = 0; i < targets.length; i++) {
                    const ratio = i === 0 ? 1.0 : (aoe.splashRatio || 0.5);
                    const modifiedSkill = { ...skill, damageMultiplier: (skill.damageMultiplier || 1) * ratio };
                    const singleCtx = { ...context, enemy: targets[i] };
                    const result = CombatEngine.calculateSkillDamage(singleCtx, skill.type || 'attack', modifiedSkill, skill.skillLevel || 1);
                    result.data.splashRatio = ratio;
                    results.push({ target: targets[i], ...result });
                }
            } else if (aoe.mode === 'split') {
                // 总伤害固定，按目标数均分
                const totalMultiplier = skill.damageMultiplier || 1;
                const perTargetMultiplier = totalMultiplier / targets.length;
                const modifiedSkill = { ...skill, damageMultiplier: perTargetMultiplier };
                for (let i = 0; i < targets.length; i++) {
                    const singleCtx = { ...context, enemy: targets[i] };
                    const result = CombatEngine.calculateSkillDamage(singleCtx, skill.type || 'attack', modifiedSkill, skill.skillLevel || 1);
                    result.data.splitCount = targets.length;
                    results.push({ target: targets[i], ...result });
                }
            }
        } else {
            // 辅助技能：按效果覆盖所有目标
            for (const target of targets) {
                results.push({ target, effect: CombatEngine._applySupportEffect(target, skill) });
            }
        }

        return { updatedContext: context, results, logs, events };
    }

    /**
     * 自身技能处理（self targeting）
     */
    static _calculateSelfSkill(context, skill, userSide) {
        const self = userSide === 'player' ? context.player :
                     userSide === 'pet' ? context.pets?.[0] :
                     context.enemies?.[0]; // enemy: 选第一个（Boss自身）

        const effect = {};
        if (skill.healPercentage) effect.healAmount = Math.floor(self.maxHp * skill.healPercentage);
        if (skill.defenseBonus) effect.defenseBonus = skill.defenseBonus;
        if (skill.attackBonus) effect.attackBonus = skill.attackBonus;

        return {
            updatedContext: context,
            results: [{ target: self, effect, isSelf: true }],
            logs: [],
            events: []
        };
    }

    /**
     * 应用辅助技能效果
     */
    static _applySupportEffect(target, skill) {
        const effect = {};
        if (skill.healPercentage) {
            effect.healAmount = Math.min(
                Math.floor(target.maxHp * skill.healPercentage),
                target.maxHp - target.hp
            );
        }
        if (skill.defenseBonus) effect.defenseBonus = skill.defenseBonus;
        if (skill.dodgeBonus) effect.dodgeBonus = skill.dodgeBonus;
        if (skill.shield) effect.shield = skill.shield;
        return effect;
    }

    /**
     * 敌人AI决策（Boss/精英技能选择）
     * @param {Object} context - 战斗上下文
     * @param {number} enemyIndex - 敌人索引
     * @returns {Object} { action:'skill'|'attack', skillId, skill, targetIndex }
     */
    static decideEnemyAction(context, enemyIndex) {
        const enemy = context.enemies[enemyIndex];
        if (!enemy || !enemy.skills || enemy.skills.length === 0) {
            return { action: 'attack', skillId: null, skill: null, targetIndex: 0 };
        }

        // 检查能量，优先使用高伤害AOE技能
        const availableSkills = enemy.skills.filter(s => (enemy.energy || 0) >= (s.energyCost || 0));
        if (availableSkills.length === 0) {
            return { action: 'attack', skillId: null, skill: null, targetIndex: 0 };
        }

        // 优先选AOE技能（count:'all'），其次选高伤害技能
        const aoeSkills = availableSkills.filter(s => s.targeting?.count === 'all');
        const selectedSkill = aoeSkills.length > 0 ? aoeSkills[0] :
                              availableSkills.sort((a, b) => (b.damageMultiplier || 1) - (a.damageMultiplier || 1))[0];

        // 选择目标：如果有宠物，随机打玩家或宠物
        const playerAlive = context.player.hp > 0;
        const alivePets = (context.pets || []).filter(p => p.hp > 0);
        let targetIndex = 0;
        if (playerAlive && alivePets.length > 0 && Math.random() < 0.3) {
            targetIndex = 1 + Math.floor(Math.random() * alivePets.length); // 1=玩家, 2+=宠物
        }

        return { action: 'skill', skillId: selectedSkill.id, skill: selectedSkill, targetIndex };
    }

    /**
     * Boss/精英技能攻击计算
     * @param {Object} context - 战斗上下文
     * @param {number} enemyIndex - 敌人索引
     * @param {Object} skill - 技能对象
     * @returns {Object} { updatedPlayer, updatedPets, updatedEnemies, data, logs, events }
     */
    static calculateEnemySkillAttack(context, enemyIndex, skill) {
        const enemy = context.enemies[enemyIndex];
        if (!enemy || enemy.hp <= 0) {
            return { success: false, error: '无效敌人' };
        }

        const result = CombatEngine.calculateSkillWithTargeting(context, skill, 'enemy', 0);

        // 聚合伤害结果
        const logs = [];
        const events = [];
        let totalPlayerDamage = 0;
        const petDamages = [];

        for (const r of result.results) {
            if (r.data?.damage) {
                const targetRef = r.target;
                // 判断目标是玩家还是宠物
                if (targetRef === context.player || targetRef.id === context.player.id) {
                    totalPlayerDamage += r.data.damage;
                } else {
                    petDamages.push({ pet: targetRef, damage: r.data.damage });
                }
                logs.push(`${enemy.name}使用${skill.name}，对${targetRef.name || '目标'}造成${r.data.damage}点伤害！`);
            }
        }

        const updatedPlayer = totalPlayerDamage > 0
            ? { ...context.player, hp: Math.max(0, context.player.hp - totalPlayerDamage) }
            : context.player;

        const updatedPets = petDamages.length > 0
            ? (context.pets || []).map(p => {
                const dmg = petDamages.find(d => d.pet.id === p.id);
                return dmg ? { ...p, hp: Math.max(0, p.hp - dmg.damage) } : p;
            })
            : context.pets || [];

        const updatedEnemies = [...context.enemies];
        updatedEnemies[enemyIndex] = {
            ...enemy,
            energy: Math.max(0, (enemy.energy || 0) - (skill.energyCost || 0))
        };

        return {
            success: true,
            data: { totalPlayerDamage, petDamages, skillName: skill.name },
            updatedPlayer,
            updatedPets,
            updatedEnemies,
            logs,
            events
        };
    }

    /**
     * 宠物AI决策
     * @param {Object} context - 战斗上下文
     * @param {number} petIndex - 宠物索引
     * @returns {Object} { action:'attack'|'skill', targetIndex, skillId }
     */
    static decidePetAction(context, petIndex) {
        const pet = context.pets?.[petIndex];
        if (!pet || pet.hp <= 0) {
            return { action: null };
        }

        // 简单AI：如果有技能且能量足够，随机使用技能，否则普通攻击
        const aliveEnemies = context.enemies
            .map((e, i) => ({ ...e, originalIndex: i }))
            .filter(e => e.hp > 0);

        if (aliveEnemies.length === 0) {
            return { action: null };
        }

        // 选HP最低的敌人
        const target = aliveEnemies.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];

        return {
            action: 'attack',
            targetIndex: target.originalIndex,
            skillId: null
        };
    }

    /**
     * 宠物攻击计算
     * @param {Object} context - 战斗上下文
     * @param {number} petIndex - 宠物索引
     * @param {number} targetIndex - 目标敌人索引
     * @returns {Object} { success, data, updatedEnemy, updatedEnemies, logs }
     */
    static calculatePetAttack(context, petIndex, targetIndex) {
        const pet = context.pets?.[petIndex];
        const enemy = context.enemies?.[targetIndex];

        if (!pet || pet.hp <= 0 || !enemy || enemy.hp <= 0) {
            return { success: false, error: '无效攻击', logs: [] };
        }

        // 宠物攻击公式（简化版）
        const baseDamage = Math.max(1, pet.attack - enemy.defense * 0.5);
        const isCrit = Math.random() * 100 < (pet.criticalRate || 5);
        const damage = isCrit
            ? Math.floor(baseDamage * (pet.critDamage || 1.5))
            : Math.floor(baseDamage);

        const updatedEnemy = {
            ...enemy,
            hp: Math.max(0, enemy.hp - damage)
        };

        const updatedEnemies = [...context.enemies];
        updatedEnemies[targetIndex] = updatedEnemy;

        return {
            success: true,
            data: { damage, isCrit, petName: pet.name || '宠物' },
            updatedEnemy,
            updatedEnemies,
            logs: [`${pet.name || '宠物'}${isCrit ? '暴击' : '攻击'}${enemy.name}，造成${damage}点伤害！`],
            events: [{ type: 'pet:attack', data: { petIndex, targetIndex, damage, isCrit } }]
        };
    }
}

// 挂载到全局（浏览器环境）
if (typeof window !== 'undefined') {
    window.CombatEngine = CombatEngine;
}

// 导出（Node/Vitest 环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CombatEngine };
}
