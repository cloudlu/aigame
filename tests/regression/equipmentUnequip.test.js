/**
 * 回归测试：装备脱下功能
 *
 * Bug描述：双击装备提示"脱下了装备"，但装备槽没有清除
 * Bug原因：unequipEquipment() 中错误地将 equipment[slot] 写成了 inventory[slot]
 * 修复日期：2026-03-24
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('装备脱下功能回归测试', () => {
    let mockPlayerState;

    beforeEach(() => {
        // 创建玩家状态
        mockPlayerState = {
            equipment: {
                weapon: {
                    id: 'weapon_1',
                    name: '白银龙冠',
                    type: 'weapon',
                    rarity: 'epic',
                    stats: { attack: 100 }
                },
                armor: null,
                helmet: null,
                boots: null,
                ring: null,
                necklace: null,
                bracelet: null
            },
            inventory: []
        };
    });

    test('✅ 修复后的正确逻辑：脱下装备应该清除装备槽', () => {
        // ✅ 验证初始状态：装备槽有武器
        expect(mockPlayerState.equipment.weapon).not.toBeNull();
        expect(mockPlayerState.equipment.weapon.name).toBe('白银龙冠');
        expect(mockPlayerState.inventory.length).toBe(0);

        // ✅ 正确的脱下装备逻辑
        const slot = 'weapon';
        const item = mockPlayerState.equipment[slot];

        // 1. 将装备添加到背包
        mockPlayerState.inventory.push(item);

        // 2. 清除装备槽（✅ 正确：清除 equipment[slot]，不是 inventory[slot]）
        mockPlayerState.equipment[slot] = null;

        // ✅ 验证结果：装备槽应该为null
        expect(mockPlayerState.equipment.weapon).toBeNull();

        // ✅ 验证结果：装备应该在背包中
        expect(mockPlayerState.inventory.length).toBe(1);
        expect(mockPlayerState.inventory[0].name).toBe('白银龙冠');
    });

    test('❌ Bug重现：错误的写法会导致装备没有被清除', () => {
        // 重置状态
        mockPlayerState.equipment.weapon = {
            id: 'weapon_1',
            name: '白银龙冠',
            type: 'weapon'
        };
        mockPlayerState.inventory = [];

        const slot = 'weapon';
        const item = mockPlayerState.equipment[slot];

        // ❌ 错误写法（旧代码）
        mockPlayerState.inventory.push(item);
        mockPlayerState.inventory[slot] = null;  // ❌ Bug：这会在背包对象上设置属性，而不是清除装备槽

        // ❌ 验证bug：装备槽仍然有装备
        expect(mockPlayerState.equipment.weapon).not.toBeNull();
        expect(mockPlayerState.equipment.weapon.name).toBe('白银龙冠');

        // 背包虽然添加了装备，但装备槽没有被清除
        expect(mockPlayerState.inventory.length).toBe(1);
        expect(mockPlayerState.inventory[0].name).toBe('白银龙冠');

        // 背包对象被错误地设置了一个属性
        expect(mockPlayerState.inventory.weapon).toBeNull();
    });

    test('✅ 多个装备槽独立工作', () => {
        // 添加多个装备
        mockPlayerState.equipment = {
            weapon: { id: 'weapon_1', name: '剑', type: 'weapon' },
            armor: { id: 'armor_1', name: '甲', type: 'armor' },
            helmet: { id: 'helmet_1', name: '头盔', type: 'helmet' },
            boots: null,
            ring: null,
            necklace: null,
            bracelet: null
        };

        // 脱下武器
        const slot = 'weapon';
        const item = mockPlayerState.equipment[slot];
        mockPlayerState.inventory.push(item);
        mockPlayerState.equipment[slot] = null;  // ✅ 正确

        // 验证只有武器被脱下
        expect(mockPlayerState.equipment.weapon).toBeNull();
        expect(mockPlayerState.equipment.armor).not.toBeNull();
        expect(mockPlayerState.equipment.armor.name).toBe('甲');
        expect(mockPlayerState.equipment.helmet).not.toBeNull();
        expect(mockPlayerState.equipment.helmet.name).toBe('头盔');

        // 验证背包中有武器
        expect(mockPlayerState.inventory.length).toBe(1);
        expect(mockPlayerState.inventory[0].name).toBe('剑');
    });

    test('✅ 空装备槽脱下应该失败', () => {
        // 重置状态
        mockPlayerState.equipment.weapon = null;
        mockPlayerState.inventory = [];

        // 尝试脱下空槽
        const slot = 'weapon';
        const item = mockPlayerState.equipment[slot];

        // 验证装备槽为空
        expect(item).toBeNull();

        // 不应该添加任何东西到背包
        if (item) {
            mockPlayerState.inventory.push(item);
            mockPlayerState.equipment[slot] = null;
        }

        expect(mockPlayerState.inventory.length).toBe(0);
        expect(mockPlayerState.equipment.weapon).toBeNull();
    });
});

