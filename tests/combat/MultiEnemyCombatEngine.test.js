/**
 * 多敌人战斗系统纯函数式单元测试
 * 测试 CombatEngine 新增的多敌人/AOE/宠物相关方法
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CombatEngine } from '../../src/combat/CombatEngine.js';

describe('多敌人战斗系统测试', () => {
    let multiEnemyContext;

    beforeEach(() => {
        // 创建多敌人战斗上下文
        multiEnemyContext = {
            player: {
                hp: 500,
                maxHp: 500,
                attack: 100,
                defense: 50,
                speed: 120,
                luck: 20,
                accuracy: 0.95,
                dodgeRate: 0.15,
                criticalRate: 0.25,
                critDamage: 2.0,
                tenacity: 0.1,
                energy: 100,
                currentEnergy: 100,
                buffs: {},
                skills: {},
                defenseActive: false,
                defenseBonusValue: 0,
                dodgeActive: false,
                dodgeBonus: 0
            },
            enemies: [
                {
                    id: 'enemy_0',
                    name: '妖狼',
                    baseName: '狼',
                    hp: 150,
                    maxHp: 150,
                    attack: 60,
                    defense: 20,
                    speed: 80,
                    accuracy: 85,
                    dodgeRate: 5,
                    criticalRate: 10,
                    critDamage: 1.5,
                    level: 15,
                    isBoss: false,
                    isElite: false,
                    buffs: {},
                    skills: [],
                    energy: 0,
                    maxEnergy: 0
                },
                {
                    id: 'enemy_1',
                    name: '精英妖狼',
                    baseName: '狼',
                    hp: 300,
                    maxHp: 300,
                    attack: 90,
                    defense: 35,
                    speed: 100,
                    accuracy: 90,
                    dodgeRate: 8,
                    criticalRate: 15,
                    critDamage: 1.8,
                    level: 20,
                    isBoss: false,
                    isElite: true,
                    buffs: {},
                    skills: [
                        { id: 'eliteStrike', name: '精准打击', targeting: { side: 'enemy', count: 'single', selection: 'auto' }, damageMultiplier: 1.5, energyCost: 30 }
                    ],
                    energy: 50,
                    maxEnergy: 50
                },
                {
                    id: 'enemy_2',
                    name: 'BOSS妖狼王',
                    baseName: '狼',
                    hp: 800,
                    maxHp: 800,
                    attack: 150,
                    defense: 60,
                    speed: 130,
                    accuracy: 95,
                    dodgeRate: 12,
                    criticalRate: 20,
                    critDamage: 2.0,
                    level: 30,
                    isBoss: true,
                    isElite: false,
                    buffs: {},
                    skills: [
                        { id: 'bossAOE', name: '范围碾压', targeting: { side: 'enemy', count: 'all' }, aoe: { mode: 'full' }, damageMultiplier: 1.2, energyCost: 60 },
                        { id: 'bossSmash', name: '狂暴打击', targeting: { side: 'enemy', count: 'single', selection: 'auto' }, damageMultiplier: 1.8, energyCost: 40 }
                    ],
                    energy: 100,
                    maxEnergy: 100
                }
            ],
            pets: [
                {
                    id: 'pet_0',
                    name: '灵狐',
                    hp: 200,
                    maxHp: 200,
                    attack: 80,
                    defense: 30,
                    speed: 100,
                    criticalRate: 15,
                    critDamage: 1.6,
                    skills: [],
                    energy: 100,
                    maxEnergy: 100
                }
            ],
            battleState: {
                inBattle: true,
                turnCount: 1,
                currentTurn: 'player'
            },
            config: {}
        };
    });

    describe('calculatePlayerAttackTargeted()', () => {
        it('应该成功攻击指定目标', () => {
            const result = CombatEngine.calculatePlayerAttackTargeted(multiEnemyContext, 0);

            expect(result.success).toBe(true);
            expect(result.updatedEnemies).toBeDefined();
            // 攻击可能命中也可能闪避，都是有效结果
            if (result.data.isHit) {
                expect(result.updatedEnemies[0].hp).toBeLessThan(multiEnemyContext.enemies[0].hp);
            }
        });

        it('攻击死亡敌人应该失败', () => {
            multiEnemyContext.enemies[0].hp = 0;
            const result = CombatEngine.calculatePlayerAttackTargeted(multiEnemyContext, 0);

            expect(result.success).toBe(false);
            expect(result.error).toBe('无效目标');
        });

        it('不应该影响其他敌人', () => {
            const originalEnemy1Hp = multiEnemyContext.enemies[1].hp;
            const result = CombatEngine.calculatePlayerAttackTargeted(multiEnemyContext, 0);

            expect(result.updatedEnemies[1].hp).toBe(originalEnemy1Hp);
        });
    });

    describe('calculateMultiEnemyCounterAttack()', () => {
        it('所有存活敌人应该反击', () => {
            // 杀死第一个敌人
            multiEnemyContext.enemies[0].hp = 0;

            const results = CombatEngine.calculateMultiEnemyCounterAttack(multiEnemyContext);

            // 只有精英和Boss反击
            expect(results.length).toBe(2);
            expect(results[0].enemyIndex).toBe(1);
            expect(results[1].enemyIndex).toBe(2);
        });

        it('死亡敌人不应该反击', () => {
            multiEnemyContext.enemies[0].hp = 0;
            multiEnemyContext.enemies[1].hp = 0;

            const results = CombatEngine.calculateMultiEnemyCounterAttack(multiEnemyContext);

            expect(results.length).toBe(1);
            expect(results[0].enemyIndex).toBe(2);
        });
    });

    describe('checkMultiBattleEnd()', () => {
        it('所有敌人死亡=胜利', () => {
            multiEnemyContext.enemies.forEach(e => e.hp = 0);

            const result = CombatEngine.checkMultiBattleEnd(multiEnemyContext);

            expect(result.ended).toBe(true);
            expect(result.result).toBe('victory');
        });

        it('玩家死亡=战败', () => {
            multiEnemyContext.player.hp = 0;
            multiEnemyContext.pets[0].hp = 0;

            const result = CombatEngine.checkMultiBattleEnd(multiEnemyContext);

            expect(result.ended).toBe(true);
            expect(result.result).toBe('defeat');
        });

        it('玩家死亡但宠物存活=继续战斗', () => {
            multiEnemyContext.player.hp = 0;
            multiEnemyContext.pets[0].hp = 100;

            const result = CombatEngine.checkMultiBattleEnd(multiEnemyContext);

            expect(result.ended).toBe(false);
        });

        it('双方存活=继续战斗', () => {
            const result = CombatEngine.checkMultiBattleEnd(multiEnemyContext);

            expect(result.ended).toBe(false);
            expect(result.remainingEnemies).toBe(3);
        });
    });

    describe('resolveTargeting()', () => {
        it('single+manual应该返回选中目标', () => {
            const skill = { targeting: { side: 'enemy', count: 'single', selection: 'manual' } };
            const targets = CombatEngine.resolveTargeting(multiEnemyContext, skill, 'player', 1);

            expect(targets.length).toBe(1);
            expect(targets[0].id).toBe('enemy_1');
        });

        it('all应该返回所有存活敌人', () => {
            const skill = { targeting: { side: 'enemy', count: 'all' } };
            multiEnemyContext.enemies[0].hp = 0; // 杀死第一个

            const targets = CombatEngine.resolveTargeting(multiEnemyContext, skill, 'player', 0);

            expect(targets.length).toBe(2);
            expect(targets[0].id).toBe('enemy_1');
            expect(targets[1].id).toBe('enemy_2');
        });

        it('self应该返回SELF标记', () => {
            const skill = { targeting: { side: 'self', count: 'single' } };
            const targets = CombatEngine.resolveTargeting(multiEnemyContext, skill, 'player', 0);

            expect(targets).toBe('SELF');
        });

        it('敌人视角的enemy应该映射为玩家方', () => {
            const skill = { targeting: { side: 'enemy', count: 'all' } };
            const targets = CombatEngine.resolveTargeting(multiEnemyContext, skill, 'enemy', 0);

            // 应该包含玩家和宠物
            expect(targets.length).toBe(2);
            expect(targets[0].hp).toBe(500); // 玩家
            expect(targets[1].hp).toBe(200); // 宠物
        });
    });

    describe('decideEnemyAction()', () => {
        it('Boss能量足够应该优先使用AOE技能', () => {
            const result = CombatEngine.decideEnemyAction(multiEnemyContext, 2);

            expect(result.action).toBe('skill');
            expect(result.skill.name).toBe('范围碾压'); // AOE技能
        });

        it('精英能量足够应该使用技能', () => {
            const result = CombatEngine.decideEnemyAction(multiEnemyContext, 1);

            expect(result.action).toBe('skill');
            expect(result.skillId).toBe('eliteStrike');
        });

        it('能量不足应该使用普通攻击', () => {
            multiEnemyContext.enemies[2].energy = 10; // 不够用技能

            const result = CombatEngine.decideEnemyAction(multiEnemyContext, 2);

            expect(result.action).toBe('attack');
            expect(result.skill).toBeNull();
        });

        it('无技能敌人应该使用普通攻击', () => {
            const result = CombatEngine.decideEnemyAction(multiEnemyContext, 0);

            expect(result.action).toBe('attack');
        });
    });

    describe('calculateEnemySkillAttack()', () => {
        it('Boss AOE应该同时伤害玩家和宠物', () => {
            const skill = multiEnemyContext.enemies[2].skills[0]; // AOE技能
            const result = CombatEngine.calculateEnemySkillAttack(multiEnemyContext, 2, skill);

            expect(result.success).toBe(true);
            // Boss AOE伤害玩家
            if (result.data.totalPlayerDamage) {
                expect(result.data.totalPlayerDamage).toBeGreaterThan(0);
            }
            // 消耗Boss能量
            expect(result.updatedEnemies[2].energy).toBeLessThan(multiEnemyContext.enemies[2].energy);
        });

        it('精英单体技能应该只伤害玩家', () => {
            const skill = multiEnemyContext.enemies[1].skills[0]; // 单体技能
            const result = CombatEngine.calculateEnemySkillAttack(multiEnemyContext, 1, skill);

            expect(result.success).toBe(true);
            expect(result.data.totalPlayerDamage).toBeGreaterThan(0);
            // 皂露：petDamages is data 中
            const pd = result.data.petDamages;
            expect(pd.length).toBe(0);
        });
    });

    describe('calculatePetAttack()', () => {
        it('宠物攻击应该成功', () => {
            const result = CombatEngine.calculatePetAttack(multiEnemyContext, 0, 0);

            expect(result.success).toBe(true);
            expect(result.data.damage).toBeGreaterThan(0);
            expect(result.updatedEnemies[0].hp).toBeLessThan(multiEnemyContext.enemies[0].hp);
        });

        it('宠物攻击死亡目标应该失败', () => {
            multiEnemyContext.enemies[0].hp = 0;
            const result = CombatEngine.calculatePetAttack(multiEnemyContext, 0, 0);

            expect(result.success).toBe(false);
        });

        it('死亡宠物攻击应该失败', () => {
            multiEnemyContext.pets[0].hp = 0;
            const result = CombatEngine.calculatePetAttack(multiEnemyContext, 0, 0);

            expect(result.success).toBe(false);
        });
    });

    describe('decidePetAction()', () => {
        it('宠物应该选择存活敌人攻击', () => {
            const result = CombatEngine.decidePetAction(multiEnemyContext, 0);

            expect(result.action).toBe('attack');
            expect(result.targetIndex).toBeDefined();
            expect(multiEnemyContext.enemies[result.targetIndex].hp).toBeGreaterThan(0);
        });

        it('无存活敌人时应该返回null', () => {
            multiEnemyContext.enemies.forEach(e => e.hp = 0);
            const result = CombatEngine.decidePetAction(multiEnemyContext, 0);

            expect(result.action).toBeNull();
        });

        it('死亡宠物应该返回null', () => {
            multiEnemyContext.pets[0].hp = 0;
            const result = CombatEngine.decidePetAction(multiEnemyContext, 0);

            expect(result.action).toBeNull();
        });
    });

    describe('技能targeting渐进表验证', () => {
        it('武者境攻击Lv.1应该是单目标', () => {
            // 模拟武者境powerStrike Lv.1技能
            const skill = {
                type: 'attack',
                damageMultiplier: 1.2,
                targeting: { side: 'enemy', count: 'single', selection: 'manual' }
            };

            const targets = CombatEngine.resolveTargeting(multiEnemyContext, skill, 'player', 0);
            expect(targets.length).toBe(1);
        });

        it('金丹境攻击Lv.4应该是AOE full模式', () => {
            const skill = {
                type: 'attack',
                damageMultiplier: 2.5,
                targeting: { side: 'enemy', count: 'all' },
                aoe: { mode: 'full' }
            };

            const targets = CombatEngine.resolveTargeting(multiEnemyContext, skill, 'player', 0);
            expect(targets.length).toBe(3);
        });

        it('辅助技能allies覆盖应该包含玩家和宠物', () => {
            const skill = {
                type: 'recovery',
                healPercentage: 0.3,
                targeting: { side: 'ally', count: 'all' }
            };

            const targets = CombatEngine.resolveTargeting(multiEnemyContext, skill, 'player', 0);
            expect(targets.length).toBe(2); // 玩家 + 宠物
        });
    });
});