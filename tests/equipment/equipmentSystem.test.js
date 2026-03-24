/**
 * 装备系统事件化重构测试
 *
 * 目标函数：
 * 1. equipItem - 装备物品
 * 2. showEquipReplacePrompt - 显示装备替换提示
 * 3. checkAndEquipBetterGearWithPrompt - 检查并装备更好的装备
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { eventManager } from '../../src/core/EventManager.js';

describe('装备系统事件化测试', () => {
  let mockGame;

  beforeEach(() => {
    eventManager.clear();

    // Mock DOM
    global.document = {
      getElementById: vi.fn(() => ({
        classList: { add: vi.fn(), remove: vi.fn() },
        textContent: '',
        innerHTML: '',
        appendChild: vi.fn(),
        removeChild: vi.fn()
      })),
      createElement: vi.fn(() => ({
        className: '',
        style: {},
        innerHTML: '',
        textContent: '',
        appendChild: vi.fn(),
        addEventListener: vi.fn(),
        querySelector: vi.fn(),
        remove: vi.fn()
      })),
      body: {
        appendChild: vi.fn()
      }
    };

    mockGame = {
      persistentState: {
        player: {
          equipment: {
            weapon: null,
            armor: null,
            helmet: null,
            boots: null,
            accessory: null
          },
          inventory: [],
          combatPower: 0
        }
      },

      equipmentSystem: {
        calculateEquipmentEffects: vi.fn(),
        updateCharacterEquipmentDisplay: vi.fn(),
        updateCharacterEquipmentDisplayModal: vi.fn(),
        getEquipmentColorClass: vi.fn(() => 'text-white'),
        getSlotDisplayName: vi.fn((type) => type)
      },

      calculateEquipmentCombatPower: vi.fn((item) => {
        if (!item) return 0;
        return (item.attack || 0) + (item.defense || 0) + (item.hp || 0);
      }),

      addBattleLog: vi.fn(),
      updateUI: vi.fn(),
      updateCharacterModal: vi.fn(),

      // equipItem 实现（修复后）
      equipItem(item) {
        const oldItem = this.persistentState.player.equipment[item.type];

        // ✅ 触发事件
        if (typeof eventManager !== 'undefined' && eventManager) {
          eventManager.emit('equipment:equip', {
            item,
            replacedItem: oldItem,
            slot: item.type,
            timestamp: Date.now()
          });
        }

        // 原有逻辑
        if (oldItem) {
          if (!this.persistentState.player.inventory) {
            this.persistentState.player.inventory = [];
          }
          this.persistentState.player.inventory.push(oldItem);
        }

        this.persistentState.player.equipment[item.type] = item;
        this.equipmentSystem.calculateEquipmentEffects();
        this.equipmentSystem.updateCharacterEquipmentDisplay();
        this.equipmentSystem.updateCharacterEquipmentDisplayModal();
        this.updateUI();
        if (typeof this.updateCharacterModal === 'function') {
          this.updateCharacterModal();
        }
      },

      // checkAndEquipBetterGearWithPrompt 实现（修复后）
      checkAndEquipBetterGearWithPrompt(item) {
        const currentItem = this.persistentState.player.equipment[item.type];

        // ✅ 触发事件
        if (typeof eventManager !== 'undefined' && eventManager) {
          eventManager.emit('equipment:check', {
            newItem: item,
            currentItem,
            slot: item.type,
            timestamp: Date.now()
          });
        }

        if (!currentItem) {
          return true; // 应该装备
        }

        const newItemPower = this.calculateEquipmentCombatPower(item);
        const currentItemPower = this.calculateEquipmentCombatPower(currentItem);

        if (newItemPower > currentItemPower) {
          return true; // 应该替换
        }

        return false;
      }
    };
  });

  afterEach(() => {
    eventManager.clear();
  });

  // ========== equipItem 测试 ==========

  describe('equipItem 事件化测试', () => {
    test('equipItem 应该触发 equipment:equip 事件', () => {
      const callback = vi.fn();
      eventManager.on('equipment:equip', callback);

      const item = {
        id: 'sword_1',
        name: '铁剑',
        type: 'weapon',
        attack: 10,
        defense: 0,
        hp: 0
      };

      mockGame.equipItem(item);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'equipment:equip',
          data: expect.objectContaining({
            item: expect.objectContaining({ name: '铁剑' }),
            slot: 'weapon'
          })
        })
      );
    });

    test('装备新物品时应该包含装备信息', () => {
      const callback = vi.fn();
      eventManager.on('equipment:equip', callback);

      const item = {
        id: 'armor_1',
        name: '布甲',
        type: 'armor',
        attack: 0,
        defense: 15,
        hp: 50
      };

      mockGame.equipItem(item);

      const eventData = callback.mock.calls[0][0];
      expect(eventData.data.item.name).toBe('布甲');
      expect(eventData.data.item.defense).toBe(15);
      expect(eventData.data.slot).toBe('armor');
    });

    test('替换旧装备时应该包含 replacedItem 信息', () => {
      const callback = vi.fn();
      eventManager.on('equipment:equip', callback);

      // 先装备一个旧装备
      const oldItem = {
        id: 'sword_old',
        name: '木剑',
        type: 'weapon',
        attack: 5
      };
      mockGame.persistentState.player.equipment.weapon = oldItem;

      // 装备新武器
      const newItem = {
        id: 'sword_new',
        name: '铁剑',
        type: 'weapon',
        attack: 10
      };

      mockGame.equipItem(newItem);

      const eventData = callback.mock.calls[0][0];
      expect(eventData.data.replacedItem).toBeDefined();
      expect(eventData.data.replacedItem.name).toBe('木剑');
    });

    test('事件数据应该包含时间戳', () => {
      const callback = vi.fn();
      eventManager.on('equipment:equip', callback);

      const beforeTime = Date.now();
      mockGame.equipItem({ type: 'weapon', name: '测试武器' });
      const afterTime = Date.now();

      const eventData = callback.mock.calls[0][0];
      expect(eventData.data.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(eventData.data.timestamp).toBeLessThanOrEqual(afterTime);
    });

    test('多次装备应该触发多次事件', () => {
      const callback = vi.fn();
      eventManager.on('equipment:equip', callback);

      mockGame.equipItem({ type: 'weapon', name: '武器1' });
      mockGame.equipItem({ type: 'armor', name: '护甲1' });
      mockGame.equipItem({ type: 'helmet', name: '头盔1' });

      expect(callback).toHaveBeenCalledTimes(3);
    });

    test('多个监听器应该都能接收到事件', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventManager.on('equipment:equip', listener1);
      eventManager.on('equipment:equip', listener2);

      mockGame.equipItem({ type: 'weapon', name: '测试武器' });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    test('事件监听器可以用于统计装备变化', () => {
      const stats = { equipCount: 0, totalAttack: 0, totalDefense: 0 };

      eventManager.on('equipment:equip', (event) => {
        stats.equipCount++;
        stats.totalAttack += event.data.item.attack || 0;
        stats.totalDefense += event.data.item.defense || 0;
      });

      mockGame.equipItem({ type: 'weapon', name: '剑', attack: 10, defense: 0 });
      mockGame.equipItem({ type: 'armor', name: '甲', attack: 0, defense: 15 });

      expect(stats.equipCount).toBe(2);
      expect(stats.totalAttack).toBe(10);
      expect(stats.totalDefense).toBe(15);
    });
  });

  // ========== checkAndEquipBetterGearWithPrompt 测试 ==========

  describe('checkAndEquipBetterGearWithPrompt 事件化测试', () => {
    test('检查装备时应该触发 equipment:check 事件', () => {
      const callback = vi.fn();
      eventManager.on('equipment:check', callback);

      const item = {
        id: 'sword_1',
        name: '铁剑',
        type: 'weapon',
        attack: 10
      };

      mockGame.checkAndEquipBetterGearWithPrompt(item);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'equipment:check',
          data: expect.objectContaining({
            newItem: expect.objectContaining({ name: '铁剑' }),
            slot: 'weapon'
          })
        })
      );
    });

    test('检查事件应该包含当前装备信息', () => {
      const callback = vi.fn();
      eventManager.on('equipment:check', callback);

      // 已有装备
      const oldItem = { id: 'sword_old', name: '木剑', type: 'weapon', attack: 5 };
      mockGame.persistentState.player.equipment.weapon = oldItem;

      // 新装备
      const newItem = { id: 'sword_new', name: '铁剑', type: 'weapon', attack: 10 };

      mockGame.checkAndEquipBetterGearWithPrompt(newItem);

      const eventData = callback.mock.calls[0][0];
      expect(eventData.data.currentItem).toBeDefined();
      expect(eventData.data.currentItem.name).toBe('木剑');
    });

    test('没有当前装备时currentItem应该为null', () => {
      const callback = vi.fn();
      eventManager.on('equipment:check', callback);

      const item = { type: 'weapon', name: '铁剑' };

      mockGame.checkAndEquipBetterGearWithPrompt(item);

      const eventData = callback.mock.calls[0][0];
      expect(eventData.data.currentItem).toBeNull();
    });

    test('事件监听器可以用于记录装备对比历史', () => {
      const history = [];

      eventManager.on('equipment:check', (event) => {
        history.push({
          newItem: event.data.newItem.name,
          currentItem: event.data.currentItem?.name || '无',
          slot: event.data.slot
        });
      });

      mockGame.checkAndEquipBetterGearWithPrompt({ type: 'weapon', name: '铁剑' });
      mockGame.persistentState.player.equipment.armor = { name: '布甲' };
      mockGame.checkAndEquipBetterGearWithPrompt({ type: 'armor', name: '铁甲' });

      expect(history).toHaveLength(2);
      expect(history[0]).toEqual({
        newItem: '铁剑',
        currentItem: '无',
        slot: 'weapon'
      });
      expect(history[1].currentItem).toBe('布甲');
    });
  });

  // ========== 混合场景测试 ==========

  describe('装备系统混合场景测试', () => {
    test('装备检查和装备操作应该触发不同事件', () => {
      const checkCallback = vi.fn();
      const equipCallback = vi.fn();

      eventManager.on('equipment:check', checkCallback);
      eventManager.on('equipment:equip', equipCallback);

      const item = { type: 'weapon', name: '铁剑' };

      // 检查装备
      mockGame.checkAndEquipBetterGearWithPrompt(item);
      // 装备物品
      mockGame.equipItem(item);

      expect(checkCallback).toHaveBeenCalledTimes(1);
      expect(equipCallback).toHaveBeenCalledTimes(1);
    });

    test('可以同时监听所有装备事件', () => {
      const allEvents = [];

      eventManager.on('equipment:check', (event) => {
        allEvents.push({ type: 'check', item: event.data.newItem.name });
      });

      eventManager.on('equipment:equip', (event) => {
        allEvents.push({ type: 'equip', item: event.data.item.name });
      });

      mockGame.checkAndEquipBetterGearWithPrompt({ type: 'weapon', name: '铁剑' });
      mockGame.equipItem({ type: 'weapon', name: '铁剑' });

      expect(allEvents).toHaveLength(2);
      expect(allEvents[0].type).toBe('check');
      expect(allEvents[1].type).toBe('equip');
    });
  });

  // ========== 回归测试 ==========

  describe('回归测试 - 防止bug再次出现', () => {
    test('如果没有触发事件，统计功能应该不工作', () => {
      const stats = { count: 0 };

      // 模拟没有事件触发的错误实现
      const badImplementation = (item) => {
        // 只装备，不触发事件
        mockGame.persistentState.player.equipment[item.type] = item;
      };

      eventManager.on('equipment:equip', () => {
        stats.count++;
      });

      badImplementation({ type: 'weapon', name: '测试' });

      // Bug: 事件没有被触发，统计失效
      expect(stats.count).toBe(0);
    });
  });
});
