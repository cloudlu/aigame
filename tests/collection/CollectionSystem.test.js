/**
 * CollectionSystem 单元测试
 * 测试图鉴系统的记录、查询和奖励功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CollectionSystem } from '../../collectionSystem.js';
import { createMockGame, createTestEquipment, createTestEnemy } from '../utils/TestHelper.js';

describe('CollectionSystem', () => {
    let game;
    let collectionSystem;

    beforeEach(() => {
        game = createMockGame();
        collectionSystem = new CollectionSystem(game);
        collectionSystem.init();
    });

    // ==================== 敌人图鉴测试 ====================

    describe('敌人图鉴', () => {
        describe('recordEnemy() - 记录敌人', () => {
            it('应该记录普通敌人', () => {
                const enemy = createTestEnemy({
                    baseName: 'testEnemy',
                    isElite: false,
                    isBoss: false
                });

                collectionSystem.recordEnemy(enemy);

                expect(game.persistentState.collection.enemies).toContain('testEnemy');
            });

            it('应该记录精英敌人', () => {
                const enemy = createTestEnemy({
                    baseName: 'testEnemy',
                    isElite: true,
                    isBoss: false
                });

                collectionSystem.recordEnemy(enemy);

                expect(game.persistentState.collection.enemies).toContain('testEnemy_elite');
            });

            it('应该记录Boss敌人', () => {
                const enemy = createTestEnemy({
                    baseName: 'testBoss',
                    isElite: false,
                    isBoss: true
                });

                collectionSystem.recordEnemy(enemy);

                expect(game.persistentState.collection.enemies).toContain('BOSStestBoss');
            });

            it('不应该重复记录相同敌人', () => {
                const enemy = createTestEnemy({ baseName: 'testEnemy' });

                collectionSystem.recordEnemy(enemy);
                collectionSystem.recordEnemy(enemy);
                collectionSystem.recordEnemy(enemy);

                const count = game.persistentState.collection.enemies.filter(e => e === 'testEnemy').length;
                expect(count).toBe(1);
            });
        });

        describe('isEnemyUnlocked() - 查询敌人解锁状态', () => {
            it('应该返回true如果敌人已解锁', () => {
                game.persistentState.collection.enemies.push('testEnemy');

                expect(collectionSystem.isEnemyUnlocked('testEnemy')).toBe(true);
            });

            it('应该返回false如果敌人未解锁', () => {
                expect(collectionSystem.isEnemyUnlocked('testEnemy')).toBe(false);
            });
        });

        describe('getEnemyProgress() - 获取敌人图鉴进度', () => {
            it('应该返回正确的进度统计', () => {
                game.persistentState.collection.enemies = ['enemy1', 'enemy2', 'enemy3'];

                const progress = collectionSystem.getEnemyProgress();

                expect(progress.unlocked).toBe(3);
                expect(progress.total).toBeGreaterThan(0);
            });
        });
    });

    // ==================== 装备图鉴测试 ====================

    describe('装备图鉴', () => {
        describe('recordEquipment() - 记录装备', () => {
            it('应该记录装备并生成正确的key（包含境界索引）', () => {
                const equipment = createTestEquipment({
                    type: 'weapon',
                    rarity: 'gold',
                    level: 1, // realmIdx = 0
                    name: '青铜铁剑',
                    suffix: '铁剑'
                });

                collectionSystem.recordEquipment(equipment);

                expect(game.persistentState.collection.equipmentTypes).toContain('0_weapon_gold_铁剑');
            });

            it('应该正确区分不同境界的同名装备', () => {
                const equip1 = createTestEquipment({
                    type: 'weapon',
                    rarity: 'gold',
                    level: 1, // realmIdx = 0
                    suffix: '铁剑'
                });

                const equip2 = createTestEquipment({
                    type: 'weapon',
                    rarity: 'gold',
                    level: 2, // realmIdx = 1
                    suffix: '铁剑'
                });

                collectionSystem.recordEquipment(equip1);
                collectionSystem.recordEquipment(equip2);

                expect(game.persistentState.collection.equipmentTypes).toContain('0_weapon_gold_铁剑');
                expect(game.persistentState.collection.equipmentTypes).toContain('1_weapon_gold_铁剑');
            });

            it('应该从装备名称中提取后缀（当suffix字段为undefined时）', () => {
                const equipment = createTestEquipment({
                    type: 'weapon',
                    rarity: 'gold',
                    level: 1,
                    name: '青铜铁剑',
                    suffix: undefined // suffix字段缺失
                });

                collectionSystem.recordEquipment(equipment);

                expect(game.persistentState.collection.equipmentTypes).toContain('0_weapon_gold_铁剑');
            });

            it('应该支持各种品质前缀提取', () => {
                const testCases = [
                    { name: '凡铁铁剑', expected: '铁剑' },
                    { name: '精钢钢刀', expected: '钢刀' },
                    { name: '百炼木枪', expected: '木枪' },
                    { name: '青铜石斧', expected: '石斧' },
                    { name: '白银木杖', expected: '木杖' }
                ];

                testCases.forEach(({ name, expected }) => {
                    const equipment = createTestEquipment({
                        type: 'weapon',
                        rarity: 'gold',
                        level: 1,
                        name: name,
                        suffix: undefined
                    });

                    collectionSystem.recordEquipment(equipment);
                });

                expect(game.persistentState.collection.equipmentTypes).toContain('0_weapon_gold_铁剑');
                expect(game.persistentState.collection.equipmentTypes).toContain('0_weapon_gold_钢刀');
                expect(game.persistentState.collection.equipmentTypes).toContain('0_weapon_gold_木枪');
            });

            it('不应该重复记录相同装备', () => {
                const equipment = createTestEquipment({
                    type: 'weapon',
                    rarity: 'gold',
                    level: 1,
                    suffix: '铁剑'
                });

                collectionSystem.recordEquipment(equipment);
                collectionSystem.recordEquipment(equipment);
                collectionSystem.recordEquipment(equipment);

                const count = game.persistentState.collection.equipmentTypes.filter(
                    e => e === '0_weapon_gold_铁剑'
                ).length;
                expect(count).toBe(1);
            });

            it('应该忽略无效的装备对象', () => {
                collectionSystem.recordEquipment(null);
                collectionSystem.recordEquipment({});
                collectionSystem.recordEquipment({ type: 'weapon' }); // 缺少rarity
                collectionSystem.recordEquipment({ rarity: 'gold' }); // 缺少type

                expect(game.persistentState.collection.equipmentTypes).toHaveLength(0);
            });
        });

        describe('isEquipmentUnlocked() - 查询装备解锁状态', () => {
            it('应该返回true如果装备已解锁', () => {
                game.persistentState.collection.equipmentTypes.push('0_weapon_gold_铁剑');

                expect(collectionSystem.isEquipmentUnlocked('0_weapon_gold_铁剑')).toBe(true);
            });

            it('应该返回false如果装备未解锁', () => {
                expect(collectionSystem.isEquipmentUnlocked('0_weapon_gold_铁剑')).toBe(false);
            });
        });

        describe('getEquipmentProgress() - 获取装备图鉴进度', () => {
            it('应该返回正确的进度统计', () => {
                game.persistentState.collection.equipmentTypes = [
                    '0_weapon_gold_铁剑',
                    '0_weapon_gold_钢刀',
                    '1_weapon_gold_铁剑'
                ];

                const progress = collectionSystem.getEquipmentProgress();

                expect(progress.unlocked).toBe(3);
                expect(progress.total).toBeGreaterThan(0);
            });
        });
    });

    // ==================== 奖励系统测试 ====================

    describe('奖励系统', () => {
        describe('checkAndGrantEnemyRewards() - 敌人图鉴奖励', () => {
            it('应该在地图全解锁时发放奖励', () => {
                // 获取第一个地图的所有敌人
                const categories = collectionSystem.getEnemyCategories();
                const firstCategory = categories[0];

                // 解锁该地图所有敌人
                firstCategory.enemyKeys.forEach(key => {
                    game.persistentState.collection.enemies.push(key);
                });

                collectionSystem.checkAndGrantEnemyRewards();

                const rewardKey = `enemy_${firstCategory.mapId}`;
                expect(game.persistentState.collection.rewardedCategories).toContain(rewardKey);
                expect(game.addBattleLog).toHaveBeenCalled();
            });

            it('不应该重复发放奖励', () => {
                const categories = collectionSystem.getEnemyCategories();
                const firstCategory = categories[0];

                firstCategory.enemyKeys.forEach(key => {
                    game.persistentState.collection.enemies.push(key);
                });

                collectionSystem.checkAndGrantEnemyRewards();
                collectionSystem.checkAndGrantEnemyRewards(); // 第二次调用

                const rewardKey = `enemy_${firstCategory.mapId}`;
                const rewardCount = game.persistentState.collection.rewardedCategories.filter(
                    r => r === rewardKey
                ).length;
                expect(rewardCount).toBe(1);
            });
        });

        describe('checkAndGrantEquipmentRewards() - 装备图鉴奖励', () => {
            it('应该在境界×品质分类全解锁时发放奖励', () => {
                // 获取第一个分类
                const categories = collectionSystem.getEquipmentCategories();
                const firstCategory = categories[0];

                // 解锁该分类所有装备
                firstCategory.equipKeys.forEach(key => {
                    game.persistentState.collection.equipmentTypes.push(key);
                });

                collectionSystem.checkAndGrantEquipmentRewards();

                const rewardKey = `equipment_${firstCategory.realmIdx}_${firstCategory.rarity.name}`;
                expect(game.persistentState.collection.rewardedCategories).toContain(rewardKey);
                expect(game.addBattleLog).toHaveBeenCalled();
            });
        });

        describe('isCategoryRewarded() - 查询分类奖励状态', () => {
            it('应该返回true如果分类已领奖', () => {
                game.persistentState.collection.rewardedCategories.push('test_category');

                expect(collectionSystem.isCategoryRewarded('test_category')).toBe(true);
            });

            it('应该返回false如果分类未领奖', () => {
                expect(collectionSystem.isCategoryRewarded('test_category')).toBe(false);
            });
        });
    });

    // ==================== 事件监听测试 ====================

    describe('事件监听', () => {
        it('应该监听battle:victory事件并自动记录敌人', () => {
            const mockEventManager = {
                on: vi.fn()
            };

            // 模拟全局eventManager
            global.window = { eventManager: mockEventManager };

            const newCollectionSystem = new CollectionSystem(game);
            newCollectionSystem.init();

            expect(mockEventManager.on).toHaveBeenCalledWith('battle:victory', expect.any(Function));

            delete global.window;
        });
    });
});
