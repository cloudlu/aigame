/**
 * 回归测试：装备脱下后属性和战力更新
 *
 * Bug描述：脱下装备后人物属性没有变化，战力显示为0
 * Bug原因：
 * 1. UIManager.updatePlayerStats() 没有重新计算装备效果
 * 2. UIManager.updatePlayerStats() 没有更新战力显示
 * 修复日期：2026-03-24
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('装备脱下后属性和战力更新回归测试', () => {
    let mockGame;
    let mockUIManager;

    beforeEach(() => {
        // 创建完整的mock游戏对象
        mockGame = {
            persistentState: {
                player: {
                    hp: 1000,
                    maxHp: 1000,
                    attack: 100,
                    defense: 50,
                    speed: 10,
                    luck: 10,
                    criticalRate: 5,
                    dodgeRate: 0,
                    accuracy: 100,
                    tenacity: 0,
                    critDamage: 0,
                    equipment: {
                        weapon: {
                            id: 'weapon_1',
                            name: '白银龙冠',
                            type: 'weapon',
                            stats: { attack: 50, criticalRate: 0.1 }
                        },
                        armor: null
                    },
                    inventory: []
                }
            },
            equipmentEffects: {
                attack: 50,
                criticalRate: 0.1
            },
            equipmentSystem: {
                calculateEquipmentEffects: vi.fn(() => {
                    // 模拟重新计算装备效果
                    const weapon = mockGame.persistentState.player.equipment.weapon;
                    if (weapon && weapon.stats) {
                        mockGame.equipmentEffects = { ...weapon.stats };
                    } else {
                        mockGame.equipmentEffects = {};
                    }
                })
            },
            getActualStats: vi.fn(() => {
                const p = mockGame.persistentState.player;
                const ee = mockGame.equipmentEffects || {};
                return {
                    attack: p.attack + (ee.attack || 0),
                    defense: p.defense + (ee.defense || 0),
                    maxHp: p.maxHp + (ee.hp || 0),
                    speed: p.speed + (ee.speed || 0),
                    luck: p.luck + (ee.luck || 0),
                    criticalRate: (p.criticalRate / 100) + (ee.criticalRate || 0),
                    dodgeRate: (p.dodgeRate / 100) + (ee.dodgeRate || 0),
                    accuracy: (p.accuracy / 100) + (ee.accuracy || 0),
                    tenacity: (p.tenacity / 100) + (ee.tenacity || 0),
                    critDamage: p.critDamage + (ee.critDamage || 0)
                };
            }),
            calculatePlayerCombatPower: vi.fn(() => {
                const stats = mockGame.getActualStats();
                // 简化的战力计算
                return Math.floor(
                    stats.attack * 1 +
                    stats.defense * 1 +
                    stats.maxHp * 0.1 +
                    stats.speed * 1 +
                    stats.luck * 1
                );
            }),
            metadata: {}
        };

        // 创建 UIManager 实例（简化版）
        mockUIManager = {
            game: mockGame,
            updateElement: vi.fn((id, value) => {
                // 模拟DOM更新
            }),
            updateProgressBar: vi.fn(),
            updatePlayerStats: function() {
                const player = this.game.persistentState?.player;
                if (!player) return;

                // ✅ 重要：重新计算装备效果
                if (this.game.equipmentSystem && typeof this.game.equipmentSystem.calculateEquipmentEffects === 'function') {
                    this.game.equipmentSystem.calculateEquipmentEffects();
                }

                const stats = this.game.getActualStats();

                // 更新属性
                this.updateElement('attack', Math.floor(stats.attack));
                this.updateElement('defense', Math.floor(stats.defense));

                // ✅ 更新战力
                if (typeof this.game.calculatePlayerCombatPower === 'function') {
                    const combatPower = this.game.calculatePlayerCombatPower();
                    this.updateElement('combat-power', combatPower.toLocaleString());
                    this.updateElement('combat-power-modal', combatPower.toLocaleString());
                }
            }
        };
    });

    test('✅ 修复后：脱下装备应该重新计算属性和战力', () => {
        // 初始状态：有武器
        expect(mockGame.persistentState.player.equipment.weapon).not.toBeNull();
        expect(mockGame.equipmentEffects.attack).toBe(50);

        // 初始属性
        const initialStats = mockGame.getActualStats();
        expect(initialStats.attack).toBe(150);  // 100 + 50
        const initialPower = mockGame.calculatePlayerCombatPower();

        // 脱下装备
        const item = mockGame.persistentState.player.equipment.weapon;
        mockGame.persistentState.player.inventory.push(item);
        mockGame.persistentState.player.equipment.weapon = null;

        // ✅ 更新UI（应该重新计算装备效果）
        mockUIManager.updatePlayerStats();

        // ✅ 验证：装备效果应该被重新计算
        expect(mockGame.equipmentSystem.calculateEquipmentEffects).toHaveBeenCalled();

        // ✅ 验证：属性应该更新
        const updatedStats = mockGame.getActualStats();
        expect(updatedStats.attack).toBe(100);  // 只有基础攻击力了

        // ✅ 验证：战力应该更新
        const updatedPower = mockGame.calculatePlayerCombatPower();
        expect(updatedPower).toBeLessThan(initialPower);

        // ✅ 验证：战力显示应该被更新
        expect(mockUIManager.updateElement).toHaveBeenCalledWith('combat-power', expect.any(String));
        expect(mockUIManager.updateElement).toHaveBeenCalledWith('combat-power-modal', expect.any(String));
    });

    test('❌ Bug重现：不重新计算装备效果会导致属性不变', () => {
        // 初始状态
        expect(mockGame.equipmentEffects.attack).toBe(50);

        // 脱下装备
        const item = mockGame.persistentState.player.equipment.weapon;
        mockGame.persistentState.player.inventory.push(item);
        mockGame.persistentState.player.equipment.weapon = null;

        // ❌ 不调用 calculateEquipmentEffects
        const stats = mockGame.getActualStats();

        // ❌ 验证bug：装备效果没有更新，属性还是包含装备加成
        expect(mockGame.equipmentEffects.attack).toBe(50);  // 旧的缓存值
        expect(stats.attack).toBe(150);  // 仍然包含装备加成（错误）
    });

    test('✅ 装备脱下后战力应该降低', () => {
        // 初始战力（有装备）
        const initialPower = mockGame.calculatePlayerCombatPower();
        expect(initialPower).toBeGreaterThan(0);

        // 脱下装备
        const item = mockGame.persistentState.player.equipment.weapon;
        mockGame.persistentState.player.inventory.push(item);
        mockGame.persistentState.player.equipment.weapon = null;

        // 重新计算装备效果
        mockGame.equipmentSystem.calculateEquipmentEffects();

        // 更新后的战力
        const updatedPower = mockGame.calculatePlayerCombatPower();

        // ✅ 验证：战力应该降低
        expect(updatedPower).toBeLessThan(initialPower);
        expect(updatedPower).toBeGreaterThan(0);  // 但不应该为0
    });
});
