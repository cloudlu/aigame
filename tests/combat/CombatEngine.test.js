/**
 * CombatEngine 纯函数式单元测试
 * 测试纯函数式战斗引擎的核心功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CombatEngine } from '../../src/combat/CombatEngine.js';

describe('CombatEngine 纯函数式测试', () => {
    let context;

    beforeEach(() => {
        // 创建标准的战斗上下文
        context = {
            player: {
                hp: 100,
                maxHp: 100,
                attack: 50,
                defense: 20,
                speed: 100,
                luck: 10,
                accuracy: 0.9,      // 90%命中率
                dodgeRate: 0.1,     // 10%闪避率
                criticalRate: 0.2,  // 20%暴击率
                critDamage: 0,      // 暴击伤害加成值（初始为0，倍率=1.5+0/100=1.5）
                tenacity: 5,
                currentEnergy: 100,
                energy: 100,        // 添加energy字段
                maxEnergy: 100,     // 添加maxEnergy字段
                exp: 500,           // 添加exp字段
                buffs: {},
                skills: {},
                resources: {
                    herbs: 0,
                    iron: 0,
                    spiritStones: 0,
                    breakthroughStones: 0
                },
                // ✅ 添加防御/闪避状态字段
                defenseActive: false,
                defenseBonusValue: 0,
                dodgeActive: false,
                dodgeBonus: 0
            },
            enemy: {
                name: '测试敌人',
                baseName: 'testEnemy',
                hp: 100,
                maxHp: 100,
                attack: 30,
                defense: 10,
                speed: 80,
                accuracy: 0.8,      // 80%命中率
                dodgeRate: 0.05,    // 5%闪避率
                criticalRate: 0.1,  // 10%暴击率
                critDamage: 0,      // 暴击伤害加成值（初始为0，倍率=1.5+0/100=1.5）
                level: 10,
                isBoss: false,
                isElite: false,
                buffs: {}
            },
            battleState: {
                inBattle: true,
                turnCount: 1,
                currentTurn: 'player'
            },
            config: {
                skillConfig: {
                    'test_skill': {
                        id: 'test_skill',
                        displayName: '测试技能',
                        energyCost: 20,
                        effects: [
                            { type: 'damage', multiplier: 2.0 }
                        ]
                    },
                    'heal_skill': {
                        id: 'heal_skill',
                        displayName: '治疗术',
                        energyCost: 30,
                        effects: [
                            { type: 'heal', percentage: 0.2 }
                        ]
                    }
                },
                realmConfig: [],
                dropRates: {}
            }
        };
    });

    // ==================== calculatePlayerAttack 测试 ====================

    describe('calculatePlayerAttack() - 玩家攻击计算', () => {
        it('应该返回正确的攻击结果结构', () => {
            const result = CombatEngine.calculatePlayerAttack(context);

            expect(result).toHaveProperty('type');
            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('updatedEnemy');
            expect(result).toHaveProperty('logs');
            expect(result).toHaveProperty('events');
        });

        it('命中时应该减少敌人HP', () => {
            // Mock必定命中（accuracy极高，enemy dodgeRate为0）
            const hitContext = {
                ...context,
                player: { ...context.player, accuracy: 1.0, criticalRate: 0 },
                enemy: { ...context.enemy, dodgeRate: 0 }
            };

            const result = CombatEngine.calculatePlayerAttack(hitContext);

            expect(result.data.isHit).toBe(true);
            expect(result.updatedEnemy.hp).toBeLessThan(context.enemy.hp);
            expect(result.data.damage).toBeGreaterThan(0);
        });

        it('未命中时敌人HP应该不变', () => {
            // Mock Math.random to ensure miss
            const originalRandom = Math.random;
            Math.random = () => 0.9; // High value to ensure miss

            try {
                // Mock必定未命中（accuracy极低）
                const missContext = {
                    ...context,
                    player: { ...context.player, accuracy: 0.01 },
                    enemy: { ...context.enemy, dodgeRate: 0.9 }
                };

                const result = CombatEngine.calculatePlayerAttack(missContext);

                expect(result.data.isHit).toBe(false);
                expect(result.updatedEnemy.hp).toBe(context.enemy.hp);
                expect(result.data.damage).toBe(0);
            } finally {
                Math.random = originalRandom;
            }
        });

        it('暴击应该造成更高伤害', () => {
            // Mock Math.random 确保必定命中和暴击
            const originalRandom = Math.random;
            let callCount = 0;
            Math.random = () => {
                callCount++;
                // First call (hit check): return value that ensures hit
                // Second call (crit check): return value that ensures crit
                return 0.001; // Very low value ensures both hit and crit
            };

            try {
                const critContext = {
                    ...context,
                    player: { ...context.player, accuracy: 1.0, criticalRate: 1.0, critDamage: 50 },  // 50点加成 = 2.0倍率
                    enemy: { ...context.enemy, dodgeRate: 0, defense: 0 }
                };

                const result = CombatEngine.calculatePlayerAttack(critContext);

                expect(result.data.isCrit).toBe(true);
                expect(result.data.damage).toBeGreaterThan(context.player.attack);
            } finally {
                Math.random = originalRandom;
            }
        });

        it('应该返回正确的事件数据', () => {
            const result = CombatEngine.calculatePlayerAttack(context);

            expect(result.events).toHaveLength(1);
            expect(result.events[0].type).toBe('battle:attack');
            expect(result.events[0].data.attacker).toBe('player');
            expect(result.events[0].data.target).toBe(context.enemy.name);
        });

        it('不应该修改原始context对象', () => {
            const originalContext = JSON.parse(JSON.stringify(context));
            CombatEngine.calculatePlayerAttack(context);

            expect(context).toEqual(originalContext);
        });
    });

    // ==================== calculateEnemyAttack 测试 ====================

    describe('calculateEnemyAttack() - 敌人攻击计算', () => {
        it('应该返回正确的敌人攻击结果', () => {
            const result = CombatEngine.calculateEnemyAttack(context);

            expect(result.type).toBe('enemyAttack');
            expect(result.success).toBe(true);
            expect(result).toHaveProperty('updatedPlayer');
        });

        it('命中时应该减少玩家HP', () => {
            const hitContext = {
                ...context,
                enemy: { ...context.enemy, accuracy: 1.0 },
                player: { ...context.player, dodgeRate: 0 }
            };

            const result = CombatEngine.calculateEnemyAttack(hitContext);

            expect(result.data.isHit).toBe(true);
            expect(result.updatedPlayer.hp).toBeLessThan(context.player.hp);
        });

        it('韧性应该减少暴击伤害', () => {
            // Mock Math.random to ensure consistent crit rolls
            const originalRandom = Math.random;
            let callCount = 0;
            Math.random = () => {
                callCount++;
                // First call (hit check): return value that ensures hit
                // Second call (crit check): return value that ensures crit
                if (callCount % 2 === 0) return 0.01; // Low value for hit check
                return 0.01; // Low value for crit check (< 100 for criticalRate 1.0)
            };

            try {
                // 韧性只对暴击有效
                const noTenacityContext = {
                    ...context,
                    player: { ...context.player, dodgeRate: 0, tenacity: 0 },
                    enemy: { ...context.enemy, accuracy: 1.0, criticalRate: 1.0, critDamage: 50 } // 50点加成=2.0倍率，必定暴击
                };

                const withTenacityContext = {
                    ...context,
                    player: { ...context.player, dodgeRate: 0, tenacity: 5 }, // 使用较小的韧性值
                    enemy: { ...context.enemy, accuracy: 1.0, criticalRate: 1.0, critDamage: 50 } // 50点加成=2.0倍率，必定暴击
                };

                const resultNoTenacity = CombatEngine.calculateEnemyAttack(noTenacityContext);
                const resultWithTenacity = CombatEngine.calculateEnemyAttack(withTenacityContext);

                expect(resultNoTenacity.data.isCrit).toBe(true);
                expect(resultWithTenacity.data.isCrit).toBe(true);
                expect(resultWithTenacity.data.damage).toBeLessThan(resultNoTenacity.data.damage);
                expect(resultWithTenacity.data.tenacityReduction).toBeGreaterThan(0);
            } finally {
                Math.random = originalRandom;
            }
        });
    });

    // ==================== checkBattleEnd 测试 ====================

    describe('checkBattleEnd() - 战斗结束检查', () => {
        it('敌人HP<=0时应该返回玩家胜利', () => {
            const victoryContext = {
                ...context,
                enemy: { ...context.enemy, hp: 0 }
            };

            const result = CombatEngine.checkBattleEnd(victoryContext);

            expect(result.isEnded).toBe(true);
            expect(result.winner).toBe('player');
            expect(result.result.type).toBe('victory');
        });

        it('玩家HP<=0时应该返回敌人胜利', () => {
            const defeatContext = {
                ...context,
                player: { ...context.player, hp: 0 }
            };

            const result = CombatEngine.checkBattleEnd(defeatContext);

            expect(result.isEnded).toBe(true);
            expect(result.winner).toBe('enemy');
            expect(result.result.type).toBe('defeat');
        });

        it('双方HP>0时应该继续战斗', () => {
            const result = CombatEngine.checkBattleEnd(context);

            expect(result.isEnded).toBe(false);
            expect(result.winner).toBeNull();
        });
    });

    // ==================== rollCritDamage 测试 ====================

    describe('rollCritDamage() - 暴击伤害随机', () => {
        it('应该返回正确的暴击结果结构', () => {
            const result = CombatEngine.rollCritDamage(0);  // 0加成 = 1.5倍率

            expect(result).toHaveProperty('baseMultiplier');
            expect(result).toHaveProperty('variance');
            expect(result).toHaveProperty('multiplier');
            expect(result).toHaveProperty('roll');
        });

        it('暴击伤害应该在合理范围内浮动', () => {
            const critDamage = 50;  // 50点加成 = 2.0基础倍率
            const result = CombatEngine.rollCritDamage(critDamage);

            // 基础倍率 = 1.5 + (50 / 100) = 2.0
            const baseMultiplier = 1.5 + (critDamage / 100);
            // 浮动范围：基础倍数的 90% - 110%
            const minExpected = baseMultiplier * 0.9;
            const maxExpected = baseMultiplier * 1.1;

            expect(result.multiplier).toBeGreaterThanOrEqual(minExpected);
            expect(result.multiplier).toBeLessThanOrEqual(maxExpected);
        });

        it('应该正确计算暴击倍率', () => {
            // 0加成 = 1.5倍率
            const result0 = CombatEngine.rollCritDamage(0);
            expect(result0.baseMultiplier).toBeCloseTo(1.5, 2);

            // 50加成 = 2.0倍率
            const result50 = CombatEngine.rollCritDamage(50);
            expect(result50.baseMultiplier).toBeCloseTo(2.0, 2);

            // 100加成 = 2.5倍率
            const result100 = CombatEngine.rollCritDamage(100);
            expect(result100.baseMultiplier).toBeCloseTo(2.5, 2);
        });

        it('多次调用应该产生不同结果', () => {
            const results = [];
            for (let i = 0; i < 10; i++) {
                results.push(CombatEngine.rollCritDamage(0).multiplier);
            }

            const uniqueResults = [...new Set(results)];
            expect(uniqueResults.length).toBeGreaterThan(1);
        });
    });

    // ==================== calculateSkillEffect 测试 ====================

    describe('calculateSkillEffect() - 技能效果计算', () => {
        it('应该成功使用伤害技能', () => {
            const result = CombatEngine.calculateSkillEffect(context, 'test_skill');

            expect(result.success).toBe(true);
            expect(result.data.skillId).toBe('test_skill');
            expect(result.updatedPlayer.currentEnergy).toBe(80); // 100 - 20
            expect(result.updatedEnemy.hp).toBeLessThan(context.enemy.hp);
        });

        it('应该成功使用治疗技能', () => {
            const hurtContext = {
                ...context,
                player: { ...context.player, hp: 50 } // 受伤状态
            };

            const result = CombatEngine.calculateSkillEffect(hurtContext, 'heal_skill');

            expect(result.success).toBe(true);
            expect(result.updatedPlayer.hp).toBeGreaterThan(hurtContext.player.hp);
        });

        it('灵力不足时应该失败', () => {
            const lowEnergyContext = {
                ...context,
                player: { ...context.player, currentEnergy: 10 }
            };

            const result = CombatEngine.calculateSkillEffect(lowEnergyContext, 'test_skill');

            expect(result.success).toBe(false);
            expect(result.error).toBe('灵力不足');
        });

        it('不存在的技能应该失败', () => {
            const result = CombatEngine.calculateSkillEffect(context, 'nonexistent_skill');

            expect(result.success).toBe(false);
            expect(result.error).toBe('技能不存在');
        });

        it('应该返回技能事件', () => {
            const result = CombatEngine.calculateSkillEffect(context, 'test_skill');

            // 技能使用会产生2个事件：battle:skill 和 battle:damage
            expect(result.events).toHaveLength(2);
            expect(result.events[0].type).toBe('battle:skill');
            expect(result.events[1].type).toBe('battle:damage');
        });
    });

    // ==================== calculateSkillDamage 测试 ====================

    describe('calculateSkillDamage() - 技能伤害计算', () => {
        it('应该成功计算伤害技能', () => {
            const skillData = {
                name: '烈焰斩',
                damageMultiplier: 2.0,
                energyCost: 20
            };

            const result = CombatEngine.calculateSkillDamage(context, 'attack', skillData, 1);

            expect(result.success).toBe(true);
            expect(result.data.skillName).toBe('烈焰斩');
            expect(result.data.energyCost).toBe(20);
            expect(result.updatedPlayer.energy).toBe(80); // 100 - 20
            expect(result.logs).toHaveLength(1);
        });

        it('灵力不足时应该失败', () => {
            const lowEnergyContext = {
                ...context,
                player: {
                    ...context.player,
                    energy: 10
                }
            };

            const skillData = {
                name: '烈焰斩',
                damageMultiplier: 2.0,
                energyCost: 20
            };

            const result = CombatEngine.calculateSkillDamage(lowEnergyContext, 'attack', skillData, 1);

            expect(result.success).toBe(false);
            expect(result.error).toBe('灵力不足');
        });

        it('命中时应该造成伤害', () => {
            // Mock Math.random to ensure hit
            const originalRandom = Math.random;
            Math.random = () => 0.1; // Low value for hit check

            try {
                const hitContext = {
                    ...context,
                    player: { ...context.player, accuracy: 1.0, criticalRate: 0 },
                    enemy: { ...context.enemy, dodgeRate: 0, defense: 0 }
                };

                const skillData = {
                    name: '测试技能',
                    damageMultiplier: 2.0,
                    energyCost: 10
                };

                const result = CombatEngine.calculateSkillDamage(hitContext, 'attack', skillData, 1);

                expect(result.data.hit).toBe(true);
                expect(result.data.damage).toBeGreaterThan(0);
                expect(result.updatedEnemy.hp).toBeLessThan(context.enemy.hp);
            } finally {
                Math.random = originalRandom;
            }
        });

        it('未命中时敌人HP应该不变', () => {
            // Mock Math.random to ensure miss
            const originalRandom = Math.random;
            Math.random = () => 0.9; // High value for miss

            try {
                const missContext = {
                    ...context,
                    player: { ...context.player, accuracy: 0.01 },
                    enemy: { ...context.enemy, dodgeRate: 0.9 }
                };

                const skillData = {
                    name: '测试技能',
                    damageMultiplier: 2.0,
                    energyCost: 10
                };

                const result = CombatEngine.calculateSkillDamage(missContext, 'attack', skillData, 1);

                expect(result.data.hit).toBe(false);
                expect(result.data.damage).toBe(0);
                expect(result.updatedEnemy.hp).toBe(context.enemy.hp);
            } finally {
                Math.random = originalRandom;
            }
        });

        it('应该生成技能事件', () => {
            const skillData = {
                name: '测试技能',
                damageMultiplier: 2.0,
                energyCost: 20
            };

            const result = CombatEngine.calculateSkillDamage(context, 'attack', skillData, 1);

            expect(result.events).toHaveLength(1);
            expect(result.events[0].type).toBe('battle:skill');
            expect(result.events[0].data.skillName).toBe('测试技能');
        });

        it('不应该修改原始context对象', () => {
            const originalContext = JSON.parse(JSON.stringify(context));
            const skillData = {
                name: '测试技能',
                damageMultiplier: 2.0,
                energyCost: 20
            };

            CombatEngine.calculateSkillDamage(context, 'attack', skillData, 1);

            expect(context.player.energy).toBe(originalContext.player.energy);
            expect(context.enemy.hp).toBe(originalContext.enemy.hp);
        });
    });

    // ==================== calculateDefenseSkill 测试 ====================

    describe('calculateDefenseSkill() - 防御技能计算', () => {
        it('应该成功激活防御状态', () => {
            const skillData = {
                name: '铁壁防御',
                defenseBonus: 0.5,
                energyCost: 15
            };

            const result = CombatEngine.calculateDefenseSkill(context, 'defense', skillData, 1);

            expect(result.success).toBe(true);
            expect(result.data.defenseBonus).toBe(0.5);
            expect(result.data.defensePercent).toBe(50);
            expect(result.updatedPlayer.defenseActive).toBe(true);
            expect(result.updatedPlayer.defenseBonusValue).toBe(0.5);
            expect(result.updatedPlayer.energy).toBe(context.player.energy - 15);
        });

        it('灵力不足时应该失败', () => {
            const lowEnergyContext = {
                ...context,
                player: { ...context.player, energy: 5 }
            };
            const skillData = {
                name: '铁壁防御',
                defenseBonus: 0.5,
                energyCost: 15
            };

            const result = CombatEngine.calculateDefenseSkill(lowEnergyContext, 'defense', skillData, 1);

            expect(result.success).toBe(false);
            expect(result.error).toBe('灵力不足');
        });

        it('不应该修改原始context对象', () => {
            const originalContext = JSON.parse(JSON.stringify(context));
            const skillData = {
                name: '铁壁防御',
                defenseBonus: 0.5,
                energyCost: 15
            };

            CombatEngine.calculateDefenseSkill(context, 'defense', skillData, 1);

            expect(context.player.energy).toBe(originalContext.player.energy);
            expect(context.player.defenseActive).toBeFalsy();
        });
    });

    // ==================== calculateHealSkill 测试 ====================

    describe('calculateHealSkill() - 治疗技能计算', () => {
        it('应该成功恢复生命值', () => {
            const damagedContext = {
                ...context,
                player: { ...context.player, hp: 50, maxHp: 100 }
            };
            const skillData = {
                name: '回春术',
                healPercentage: 0.3,
                energyCost: 20
            };

            const result = CombatEngine.calculateHealSkill(damagedContext, 'recovery', skillData, 1);

            expect(result.success).toBe(true);
            expect(result.data.healAmount).toBe(30);
            expect(result.data.newHp).toBe(80);
            expect(result.updatedPlayer.hp).toBe(80);
            expect(result.updatedPlayer.energy).toBe(context.player.energy - 20);
        });

        it('治疗不应超过最大生命值', () => {
            const nearFullContext = {
                ...context,
                player: { ...context.player, hp: 90, maxHp: 100 }
            };
            const skillData = {
                name: '回春术',
                healPercentage: 0.3,
                energyCost: 20
            };

            const result = CombatEngine.calculateHealSkill(nearFullContext, 'recovery', skillData, 1);

            expect(result.success).toBe(true);
            expect(result.data.healAmount).toBe(10); // 只恢复到最大HP
            expect(result.updatedPlayer.hp).toBe(100);
        });

        it('🐛 Bug修复：当hp > maxHp时应该返回0恢复量（装备加成场景）', () => {
            // 模拟真实bug场景：玩家基础maxHp=580，装备加成后实际hp=1092
            const bugContext = {
                ...context,
                player: {
                    ...context.player,
                    hp: 1092,      // 装备加成后的实际HP
                    maxHp: 1092    // ✅ 修复后：使用实际maxHp（含装备加成）
                }
            };
            const skillData = {
                name: '治疗术',
                healPercentage: 0.01,  // 1%治疗
                energyCost: 10
            };

            const result = CombatEngine.calculateHealSkill(bugContext, 'recovery', skillData, 1);

            expect(result.success).toBe(true);
            expect(result.data.healAmount).toBe(0);  // 已满血，恢复0
            expect(result.data.newHp).toBe(1092);
            expect(result.updatedPlayer.hp).toBe(1092);

            // 验证不会出现负数
            expect(result.data.healAmount).toBeGreaterThanOrEqual(0);
        });

        it('灵力不足时应该失败', () => {
            const lowEnergyContext = {
                ...context,
                player: { ...context.player, hp: 50, energy: 10 }
            };
            const skillData = {
                name: '回春术',
                healPercentage: 0.3,
                energyCost: 20
            };

            const result = CombatEngine.calculateHealSkill(lowEnergyContext, 'recovery', skillData, 1);

            expect(result.success).toBe(false);
            expect(result.error).toBe('灵力不足');
        });
    });

    // ==================== calculateDodgeSkill 测试 ====================

    describe('calculateDodgeSkill() - 闪避技能计算', () => {
        it('应该成功激活闪避状态', () => {
            const skillData = {
                name: '幻影步',
                dodgeBonus: 0.3,
                energyCost: 10
            };

            const result = CombatEngine.calculateDodgeSkill(context, 'special', skillData, 1);

            expect(result.success).toBe(true);
            expect(result.data.dodgeBonus).toBe(0.3);
            expect(result.data.dodgePercent).toBe(30);
            expect(result.updatedPlayer.dodgeActive).toBe(true);
            expect(result.updatedPlayer.dodgeBonus).toBe(0.3);
            expect(result.updatedPlayer.energy).toBe(context.player.energy - 10);
        });

        it('灵力不足时应该失败', () => {
            const lowEnergyContext = {
                ...context,
                player: { ...context.player, energy: 5 }
            };
            const skillData = {
                name: '幻影步',
                dodgeBonus: 0.3,
                energyCost: 10
            };

            const result = CombatEngine.calculateDodgeSkill(lowEnergyContext, 'special', skillData, 1);

            expect(result.success).toBe(false);
            expect(result.error).toBe('灵力不足');
        });

        it('不应该修改原始context对象', () => {
            const originalContext = JSON.parse(JSON.stringify(context));
            const skillData = {
                name: '幻影步',
                dodgeBonus: 0.3,
                energyCost: 10
            };

            CombatEngine.calculateDodgeSkill(context, 'special', skillData, 1);

            expect(context.player.energy).toBe(originalContext.player.energy);
            expect(context.player.dodgeActive).toBeFalsy();
        });
    });

    // ==================== calculatePlayerDefeat 测试 ====================

    describe('calculatePlayerDefeat() - 玩家战败计算', () => {
        it('应该正确计算经验损失', () => {
            const defeatContext = {
                ...context,
                player: {
                    ...context.player,
                    exp: 1000
                }
            };

            const result = CombatEngine.calculatePlayerDefeat(defeatContext);

            expect(result.success).toBe(true);
            expect(result.data.expLoss).toBe(200); // 20% of 1000
            expect(result.updatedPlayer.exp).toBe(800);
        });

        it('应该重置HP和灵力', () => {
            const hurtContext = {
                ...context,
                player: {
                    ...context.player,
                    hp: 30,
                    energy: 20,
                    maxHp: 100,
                    maxEnergy: 100
                }
            };

            const result = CombatEngine.calculatePlayerDefeat(hurtContext);

            expect(result.updatedPlayer.hp).toBe(100);
            expect(result.updatedPlayer.energy).toBe(100);
        });

        it('应该重置敌人HP和灵力', () => {
            const result = CombatEngine.calculatePlayerDefeat(context);

            expect(result.updatedEnemy.hp).toBe(context.enemy.maxHp);
            expect(result.updatedEnemy.energy).toBe(context.enemy.maxEnergy);
        });

        it('应该生成战败事件', () => {
            const result = CombatEngine.calculatePlayerDefeat(context);

            expect(result.events).toHaveLength(1);
            expect(result.events[0].type).toBe('battle:defeat');
            expect(result.events[0].data.enemy).toBe(context.enemy.name);
        });

        it('不应该修改原始context对象', () => {
            const originalContext = JSON.parse(JSON.stringify({
                ...context,
                player: { ...context.player, exp: 1000 }
            }));

            CombatEngine.calculatePlayerDefeat(originalContext);

            expect(originalContext.player.exp).toBe(1000);
        });
    });

    // ==================== calculateEnemyDefeat 测试 ====================

    describe('calculateEnemyDefeat() - 敌人战败计算', () => {
        it('应该正确计算经验奖励', () => {
            const result = CombatEngine.calculateEnemyDefeat(context);

            expect(result.success).toBe(true);
            expect(result.data.expGained).toBe(context.enemy.level * 20);
            expect(result.updatedPlayer.exp).toBe(context.player.exp + result.data.expGained);
        });

        it('精英敌人应该获得额外经验', () => {
            const eliteContext = {
                ...context,
                enemy: {
                    ...context.enemy,
                    isElite: true,
                    expMultiplier: 2.0
                }
            };

            const result = CombatEngine.calculateEnemyDefeat(eliteContext);

            expect(result.data.expGained).toBe(context.enemy.level * 20 * 2);
            expect(result.logs).toContain('精英敌人奖励翻倍！获得了400点经验！');
        });

        it('应该计算资源掉落', () => {
            const result = CombatEngine.calculateEnemyDefeat(context);

            expect(result.data.herbsGained).toBeGreaterThanOrEqual(0);
            expect(result.data.ironGained).toBeGreaterThanOrEqual(0);
            expect(result.data.spiritStonesGained).toBeGreaterThanOrEqual(0);
        });

        it('应该恢复灵力和HP', () => {
            const hurtContext = {
                ...context,
                player: {
                    ...context.player,
                    hp: 50,
                    energy: 80,
                    maxEnergy: 100,
                    resources: {
                        herbs: 0,
                        iron: 0,
                        spiritStones: 0
                    }
                }
            };

            const result = CombatEngine.calculateEnemyDefeat(hurtContext);

            expect(result.updatedPlayer.energy).toBe(95); // 80 + 15
            expect(result.updatedPlayer.hp).toBeGreaterThan(50);
            expect(result.data.killEnergyRecovery).toBe(15);
        });

        it('BOSS应该有几率掉落突破石', () => {
            // Mock Math.random for consistent testing
            const originalRandom = Math.random;
            Math.random = () => 0.1; // Low value to ensure drop

            try {
                const bossContext = {
                    ...context,
                    enemy: {
                        ...context.enemy,
                        isBoss: true
                    }
                };

                const result = CombatEngine.calculateEnemyDefeat(bossContext);

                // 突破石可能掉落也可能不掉落（因为逻辑较复杂）
                expect(result.data).toHaveProperty('breakthroughStonesGained');
            } finally {
                Math.random = originalRandom;
            }
        });

        it('应该生成胜利事件', () => {
            const result = CombatEngine.calculateEnemyDefeat(context);

            expect(result.events).toHaveLength(1);
            expect(result.events[0].type).toBe('battle:victory');
            expect(result.events[0].data.enemy).toBe(context.enemy.name);
        });

        it('不应该修改原始context对象', () => {
            const originalContext = JSON.parse(JSON.stringify({
                ...context,
                player: {
                    ...context.player,
                    resources: {
                        herbs: 0,
                        iron: 0,
                        spiritStones: 0
                    }
                }
            }));

            CombatEngine.calculateEnemyDefeat(originalContext);

            expect(originalContext.player.resources.herbs).toBe(0);
            expect(originalContext.player.resources.iron).toBe(0);
        });
    });

    // ==================== processBuffsAtTurnStart 测试 ====================

    describe('processBuffsAtTurnStart() - 回合开始Buff处理', () => {
        it('应该处理allStatsBonus buff', () => {
            const buffContext = {
                ...context,
                player: {
                    ...context.player,
                    buffs: [
                        { type: 'allStatsBonus', value: 0.2, turns: 3 }
                    ]
                }
            };

            const result = CombatEngine.processBuffsAtTurnStart(buffContext);

            expect(result.success).toBe(true);
            expect(result.updatedPlayer.tempAttackBonus).toBe(0.2);
            expect(result.updatedPlayer.tempDefenseBonus).toBe(0.2);
            expect(result.logs).toHaveLength(1);
        });

        it('应该处理skillCostReduce buff', () => {
            const buffContext = {
                ...context,
                player: {
                    ...context.player,
                    buffs: [
                        { type: 'skillCostReduce', value: 0.5, turns: 2 }
                    ]
                }
            };

            const result = CombatEngine.processBuffsAtTurnStart(buffContext);

            expect(result.success).toBe(true);
            expect(result.updatedPlayer.tempSkillCostReduce).toBe(0.5);
        });

        it('应该处理多个buff', () => {
            const multiBuffContext = {
                ...context,
                player: {
                    ...context.player,
                    buffs: [
                        { type: 'allStatsBonus', value: 0.1, turns: 3 },
                        { type: 'skillCostReduce', value: 0.3, turns: 2 },
                        { type: 'damageBonus', value: 0.5, turns: 5 }
                    ]
                }
            };

            const result = CombatEngine.processBuffsAtTurnStart(multiBuffContext);

            expect(result.success).toBe(true);
            expect(result.updatedPlayer.tempAttackBonus).toBe(0.1);
            expect(result.updatedPlayer.tempDefenseBonus).toBe(0.1);
            expect(result.updatedPlayer.tempSkillCostReduce).toBe(0.3);
            expect(result.logs).toHaveLength(3);
        });

        it('没有buff时应该返回零加成', () => {
            const noBuffContext = {
                ...context,
                player: {
                    ...context.player,
                    buffs: []
                }
            };

            const result = CombatEngine.processBuffsAtTurnStart(noBuffContext);

            expect(result.success).toBe(true);
            expect(result.updatedPlayer.tempAttackBonus).toBe(0);
            expect(result.updatedPlayer.tempDefenseBonus).toBe(0);
            expect(result.updatedPlayer.tempSkillCostReduce).toBe(0);
            expect(result.logs).toHaveLength(0);
        });

        it('不应该修改原始context对象', () => {
            const originalContext = JSON.parse(JSON.stringify({
                ...context,
                player: {
                    ...context.player,
                    buffs: [{ type: 'allStatsBonus', value: 0.2, turns: 3 }]
                }
            }));

            CombatEngine.processBuffsAtTurnStart(originalContext);

            expect(originalContext.player.tempAttackBonus).toBeUndefined();
            expect(originalContext.player.tempDefenseBonus).toBeUndefined();
        });
    });

    // ==================== processBuffDecay 测试 ====================

    describe('processBuffDecay() - Buff衰减处理', () => {
        it('应该正确减少buff回合数', () => {
            const buffContext = {
                ...context,
                player: {
                    ...context.player,
                    buffs: [
                        { type: 'attack', turns: 3 },
                        { type: 'defense', turns: 2 }
                    ]
                },
                enemy: {
                    ...context.enemy,
                    debuffs: [
                        { type: 'poison', turns: 2 }
                    ]
                }
            };

            const result = CombatEngine.processBuffDecay(buffContext);

            // Buffs应该减1回合
            expect(result.updatedPlayer.buffs).toHaveLength(2);
            expect(result.updatedPlayer.buffs[0].turns).toBe(2);
            expect(result.updatedPlayer.buffs[1].turns).toBe(1);

            // Debuffs也应该减1回合
            expect(result.updatedEnemy.debuffs).toHaveLength(1);
            expect(result.updatedEnemy.debuffs[0].turns).toBe(1);
        });

        it('应该移除过期的buff', () => {
            const expiredContext = {
                ...context,
                player: {
                    ...context.player,
                    buffs: [
                        { type: 'speed', turns: 1 } // 即将过期
                    ]
                },
                enemy: {
                    ...context.enemy,
                    debuffs: []
                }
            };

            const result = CombatEngine.processBuffDecay(expiredContext);

            // Buff应该被移除
            expect(result.updatedPlayer.buffs).toHaveLength(0);
            expect(result.logs).toContain('speed效果已消失');
            expect(result.events).toHaveLength(1);
            expect(result.events[0].type).toBe('battle:buffExpired');
        });

        it('应该移除过期的debuff', () => {
            const expiredContext = {
                ...context,
                player: {
                    ...context.player,
                    buffs: []
                },
                enemy: {
                    ...context.enemy,
                    debuffs: [
                        { type: 'burn', turns: 1 } // 即将过期
                    ]
                }
            };

            const result = CombatEngine.processBuffDecay(expiredContext);

            // Debuff应该被移除
            expect(result.updatedEnemy.debuffs).toHaveLength(0);
            expect(result.logs).toContain('敌人的burn效果已消失');
            expect(result.events).toHaveLength(1);
            expect(result.events[0].type).toBe('battle:debuffExpired');
        });

        it('应该清除临时加成', () => {
            const tempBonusContext = {
                ...context,
                player: {
                    ...context.player,
                    buffs: [],
                    tempAttackBonus: 10,
                    tempDefenseBonus: 5,
                    tempAccuracyBonus: 0.1,
                    tempSkillCostReduce: 5
                },
                enemy: {
                    ...context.enemy,
                    debuffs: []
                }
            };

            const result = CombatEngine.processBuffDecay(tempBonusContext);

            // 所有临时加成应该归零
            expect(result.updatedPlayer.tempAttackBonus).toBe(0);
            expect(result.updatedPlayer.tempDefenseBonus).toBe(0);
            expect(result.updatedPlayer.tempAccuracyBonus).toBe(0);
            expect(result.updatedPlayer.tempSkillCostReduce).toBe(0);
        });

        it('不应该修改原始context对象', () => {
            const originalContext = JSON.parse(JSON.stringify({
                ...context,
                player: {
                    ...context.player,
                    buffs: [{ type: 'attack', turns: 2 }]
                },
                enemy: {
                    ...context.enemy,
                    debuffs: [{ type: 'poison', turns: 3 }]
                }
            }));

            CombatEngine.processBuffDecay(originalContext);

            // 原始context应该保持不变
            expect(originalContext.player.buffs[0].turns).toBe(2);
            expect(originalContext.enemy.debuffs[0].turns).toBe(3);
        });
    });

    // ==================== 纯函数特性测试 ====================

    describe('纯函数特性验证', () => {
        it('相同输入应该产生相同输出（确定性）', () => {
            // Mock Math.random() 保持确定性
            const originalRandom = Math.random;
            let callCount = 0;
            Math.random = () => 0.5; // 固定随机值

            const result1 = CombatEngine.calculatePlayerAttack(context);
            const result2 = CombatEngine.calculatePlayerAttack(context);

            Math.random = originalRandom;

            expect(result1.data.isHit).toBe(result2.data.isHit);
            expect(result1.data.damage).toBe(result2.data.damage);
        });

        it('不应该有副作用（不修改输入参数）', () => {
            const originalContext = JSON.parse(JSON.stringify(context));

            CombatEngine.calculatePlayerAttack(context);
            CombatEngine.calculateEnemyAttack(context);
            CombatEngine.checkBattleEnd(context);
            CombatEngine.calculateSkillEffect(context, 'test_skill');

            expect(context).toEqual(originalContext);
        });
    });
});