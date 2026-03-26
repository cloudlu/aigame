/**
 * 副本敌人图鉴记录回归测试
 * 测试副本战斗胜利后敌人记录到图鉴的功能
 *
 * Bug历史：
 * 副本敌人没有记录到图鉴 - 修复：dungeon.js的onBattleVictory()添加battle:victory事件发射
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CollectionSystem } from '../../collectionSystem.js';
import { createMockGame, createTestEnemy } from '../utils/TestHelper.js';

describe('副本敌人图鉴记录回归测试', () => {
    let game;
    let collectionSystem;

    beforeEach(() => {
        game = createMockGame();
        collectionSystem = new CollectionSystem(game);
        collectionSystem.init();
    });

    // ==================== Bug修复：副本敌人应该记录到图鉴 ====================

    describe('Bug修复：副本敌人应该正确记录', () => {
        it('应该记录普通敌人', () => {
            const enemy = createTestEnemy({
                baseName: 'testDungeonEnemy',
                isElite: false,
                isBoss: false
            });

            collectionSystem.recordEnemy(enemy);

            expect(game.persistentState.collection.enemies).toContain('testDungeonEnemy');
        });

        it('应该记录副本精英敌人', () => {
            const eliteEnemy = createTestEnemy({
                baseName: 'eliteMonster',
                isElite: true,
                isBoss: false
            });

            collectionSystem.recordEnemy(eliteEnemy);

            expect(game.persistentState.collection.enemies).toContain('eliteMonster_elite');
        });

        it('应该记录副本Boss', () => {
            const bossEnemy = createTestEnemy({
                baseName: 'dungeonBoss',
                isElite: false,
                isBoss: true
            });

            collectionSystem.recordEnemy(bossEnemy);

            expect(game.persistentState.collection.enemies).toContain('BOSSdungeonBoss');
        });

        it('不应该重复记录相同敌人', () => {
            const enemy = createTestEnemy({ baseName: 'testMob' });

            collectionSystem.recordEnemy(enemy);
            collectionSystem.recordEnemy(enemy);
            collectionSystem.recordEnemy(enemy);

            const count = game.persistentState.collection.enemies.filter(e => e === 'testMob').length;
            expect(count).toBe(1);
        });
    });

    // ==================== 场景测试 ====================

    describe('场景测试：各种副本战斗场景', () => {
        it('普通副本应该记录普通敌人', () => {
            const normalEnemy = createTestEnemy({
                baseName: 'normalMob',
                isElite: false,
                isBoss: false
            });

            collectionSystem.recordEnemy(normalEnemy);

            expect(collectionSystem.isEnemyUnlocked('normalMob')).toBe(true);
        });

        it('精英副本应该记录精英敌人', () => {
            const eliteEnemy = createTestEnemy({
                baseName: 'eliteMob',
                isElite: true,
                isBoss: false
            });

            collectionSystem.recordEnemy(eliteEnemy);

            expect(collectionSystem.isEnemyUnlocked('eliteMob_elite')).toBe(true);
        });

        it('Boss副本应该记录Boss敌人', () => {
            const bossEnemy = createTestEnemy({
                baseName: 'bossMob',
                isElite: false,
                isBoss: true
            });

            collectionSystem.recordEnemy(bossEnemy);

            expect(collectionSystem.isEnemyUnlocked('BOSSbossMob')).toBe(true);
        });
    });

    // ==================== 集成测试 ====================

    describe('集成测试：完整的副本战斗流程', () => {
        it('连续战斗多个敌人应该全部记录', () => {
            const enemies = [
                createTestEnemy({ baseName: 'mob1', isElite: false, isBoss: false }),
                createTestEnemy({ baseName: 'mob2', isElite: false, isBoss: false }),
                createTestEnemy({ baseName: 'elite1', isElite: true, isBoss: false }),
                createTestEnemy({ baseName: 'boss1', isElite: false, isBoss: true })
            ];

            enemies.forEach(enemy => {
                collectionSystem.recordEnemy(enemy);
            });

            expect(collectionSystem.isEnemyUnlocked('mob1')).toBe(true);
            expect(collectionSystem.isEnemyUnlocked('mob2')).toBe(true);
            expect(collectionSystem.isEnemyUnlocked('elite1_elite')).toBe(true);
            expect(collectionSystem.isEnemyUnlocked('BOSSboss1')).toBe(true);
        });
    });
});
