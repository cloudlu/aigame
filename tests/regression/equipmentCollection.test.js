/**
 * 装备图鉴记录回归测试
 * 测试装备图鉴记录功能的bug修复
 *
 * Bug历史：
 * 1. 黄金品质装备不显示 - 修复：metadata中rarity name从"spiritStones"改为"gold"
 * 2. 装备suffix字段undefined - 修复：从装备名称中提取后缀
 * 3. 不同境界同名装备冲突 - 修复：key格式改为${realmIdx}_${type}_${rarity}_${suffix}
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CollectionSystem } from '../../collectionSystem.js';
import { createMockGame, createTestEquipment } from '../utils/TestHelper.js';

describe('装备图鉴记录回归测试', () => {
    let game;
    let collectionSystem;

    beforeEach(() => {
        game = createMockGame();
        collectionSystem = new CollectionSystem(game);
        collectionSystem.init();
    });

    // ==================== Bug 1: 黄金品质装备不显示 ====================

    describe('Bug修复：黄金品质装备应该正确记录', () => {
        it('应该记录rarity为"gold"的装备', () => {
            const equipment = createTestEquipment({
                type: 'weapon',
                rarity: 'gold',
                level: 1,
                suffix: '铁剑'
            });

            collectionSystem.recordEquipment(equipment);

            const key = game.persistentState.collection.equipmentTypes[0];
            expect(key).toContain('gold');
            expect(key).toBe('0_weapon_gold_铁剑');
        });

        it('黄金装备应该被isEquipmentUnlocked()正确识别', () => {
            const equipment = createTestEquipment({
                type: 'spiritTreasure',
                rarity: 'gold',
                level: 1,
                suffix: '铁钟'
            });

            collectionSystem.recordEquipment(equipment);

            expect(collectionSystem.isEquipmentUnlocked('0_spiritTreasure_gold_铁钟')).toBe(true);
        });

        it('黄金装备应该能够触发图鉴奖励', () => {
            // 模拟完整的武者境界黄金品质装备收集
            const categories = collectionSystem.getEquipmentCategories();
            const wuzheGoldCategory = categories.find(
                cat => cat.realmIdx === 0 && cat.rarity.name === 'gold'
            );

            wuzheGoldCategory.equipKeys.forEach(key => {
                game.persistentState.collection.equipmentTypes.push(key);
            });

            collectionSystem.checkAndGrantEquipmentRewards();

            const rewardKey = `equipment_0_gold`;
            expect(collectionSystem.isCategoryRewarded(rewardKey)).toBe(true);
        });
    });

    // ==================== Bug 2: 装备suffix字段undefined ====================

    describe('Bug修复：suffix字段undefined时应该从名称提取', () => {
        it('应该从"青铜铁剑"提取"铁剑"', () => {
            const equipment = createTestEquipment({
                type: 'weapon',
                rarity: 'gold',
                level: 1,
                name: '青铜铁剑',
                suffix: undefined
            });

            collectionSystem.recordEquipment(equipment);

            expect(game.persistentState.collection.equipmentTypes).toContain('0_weapon_gold_铁剑');
        });

        it('应该从"凡铁布冠"提取"布冠"', () => {
            const equipment = createTestEquipment({
                type: 'helmet',
                rarity: 'white',
                level: 1,
                name: '凡铁布冠',
                suffix: undefined
            });

            collectionSystem.recordEquipment(equipment);

            expect(game.persistentState.collection.equipmentTypes).toContain('0_helmet_white_布冠');
        });

        it('应该从"精钢木珠"提取"木珠"', () => {
            const equipment = createTestEquipment({
                type: 'spiritTreasure',
                rarity: 'blue',
                level: 1,
                name: '精钢木珠',
                suffix: undefined
            });

            collectionSystem.recordEquipment(equipment);

            expect(game.persistentState.collection.equipmentTypes).toContain('0_spiritTreasure_blue_木珠');
        });

        it('应该从"白银木杖"提取"木杖"', () => {
            const equipment = createTestEquipment({
                type: 'magicArtifact',
                rarity: 'rainbow',
                level: 1,
                name: '白银木杖',
                suffix: undefined
            });

            collectionSystem.recordEquipment(equipment);

            expect(game.persistentState.collection.equipmentTypes).toContain('0_magicArtifact_rainbow_木杖');
        });

        it('如果suffix存在，应该优先使用suffix', () => {
            const equipment = createTestEquipment({
                type: 'weapon',
                rarity: 'gold',
                level: 1,
                name: '青铜铁剑',
                suffix: '自定义后缀'
            });

            collectionSystem.recordEquipment(equipment);

            expect(game.persistentState.collection.equipmentTypes).toContain('0_weapon_gold_自定义后缀');
        });
    });

    // ==================== Bug 3: 不同境界同名装备冲突 ====================

    describe('Bug修复：不同境界同名装备应该区分', () => {
        it('武者境界(level=1)的铁剑应该使用realmIdx=0', () => {
            const equipment = createTestEquipment({
                type: 'weapon',
                rarity: 'gold',
                level: 1,
                suffix: '铁剑'
            });

            collectionSystem.recordEquipment(equipment);

            expect(game.persistentState.collection.equipmentTypes).toContain('0_weapon_gold_铁剑');
        });

        it('练气境界(level=2)的铁剑应该使用realmIdx=1', () => {
            const equipment = createTestEquipment({
                type: 'weapon',
                rarity: 'gold',
                level: 2,
                suffix: '铁剑'
            });

            collectionSystem.recordEquipment(equipment);

            expect(game.persistentState.collection.equipmentTypes).toContain('1_weapon_gold_铁剑');
        });

        it('筑基境界(level=3)的铁剑应该使用realmIdx=2', () => {
            const equipment = createTestEquipment({
                type: 'weapon',
                rarity: 'gold',
                level: 3,
                suffix: '铁剑'
            });

            collectionSystem.recordEquipment(equipment);

            expect(game.persistentState.collection.equipmentTypes).toContain('2_weapon_gold_铁剑');
        });

        it('相同名称不同境界的装备应该生成不同的key', () => {
            const wuzheEquip = createTestEquipment({
                type: 'weapon',
                rarity: 'gold',
                level: 1,
                suffix: '铁剑'
            });

            const lianqiEquip = createTestEquipment({
                type: 'weapon',
                rarity: 'gold',
                level: 2,
                suffix: '铁剑'
            });

            collectionSystem.recordEquipment(wuzheEquip);
            collectionSystem.recordEquipment(lianqiEquip);

            const types = game.persistentState.collection.equipmentTypes;
            expect(types).toHaveLength(2);
            expect(types).toContain('0_weapon_gold_铁剑');
            expect(types).toContain('1_weapon_gold_铁剑');
        });

        it('不同境界装备应该分别计算图鉴进度', () => {
            // 武者境界铁剑
            collectionSystem.recordEquipment(createTestEquipment({
                type: 'weapon',
                rarity: 'gold',
                level: 1,
                suffix: '铁剑'
            }));

            // 练气境界铁剑
            collectionSystem.recordEquipment(createTestEquipment({
                type: 'weapon',
                rarity: 'gold',
                level: 2,
                suffix: '铁剑'
            }));

            const wuzheUnlocked = collectionSystem.isEquipmentUnlocked('0_weapon_gold_铁剑');
            const lianqiUnlocked = collectionSystem.isEquipmentUnlocked('1_weapon_gold_铁剑');

            expect(wuzheUnlocked).toBe(true);
            expect(lianqiUnlocked).toBe(true);
        });
    });

    // ==================== 集成测试 ====================

    describe('集成测试：完整的装备记录流程', () => {
        it('应该正确记录武者境界的全套黄金装备', () => {
            const types = ['weapon', 'helmet', 'armor', 'spiritTreasure', 'pants', 'boots', 'magicArtifact', 'amulet'];
            const suffixes = ['铁剑', '布冠', '布袍', '木珠', '布裙', '布靴', '木杖', '木符'];

            types.forEach((type, index) => {
                const equipment = createTestEquipment({
                    type: type,
                    rarity: 'gold',
                    level: 1,
                    suffix: suffixes[index]
                });

                collectionSystem.recordEquipment(equipment);
            });

            const progress = collectionSystem.getEquipmentProgress();
            expect(progress.unlocked).toBeGreaterThanOrEqual(8);

            types.forEach((type, index) => {
                const expectedKey = `0_${type}_gold_${suffixes[index]}`;
                expect(collectionSystem.isEquipmentUnlocked(expectedKey)).toBe(true);
            });
        });

        it('应该正确处理装备刷新后的suffix更新', () => {
            // 模拟装备刷新场景：旧装备有suffix，刷新后更新suffix
            const oldEquipment = createTestEquipment({
                type: 'weapon',
                rarity: 'gold',
                level: 1,
                suffix: '铁剑'
            });

            collectionSystem.recordEquipment(oldEquipment);

            // 模拟刷新后的装备
            const newEquipment = createTestEquipment({
                type: 'weapon',
                rarity: 'gold',
                level: 1,
                suffix: '钢刀' // 刷新后变为钢刀
            });

            collectionSystem.recordEquipment(newEquipment);

            // 两个都应该存在
            expect(collectionSystem.isEquipmentUnlocked('0_weapon_gold_铁剑')).toBe(true);
            expect(collectionSystem.isEquipmentUnlocked('0_weapon_gold_钢刀')).toBe(true);
        });
    });
});
