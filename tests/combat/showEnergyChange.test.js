/**
 * showEnergyChange 事件化重构测试
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { eventManager } from '../../src/core/EventManager.js';

describe('showEnergyChange 事件化测试', () => {
  let mockGame;

  beforeEach(() => {
    eventManager.clear();

    mockGame = {
      battle3D: { scene: {} },

      showEnergyChange(target, amount) {
        // 触发事件
        if (typeof eventManager !== 'undefined' && eventManager) {
          eventManager.emit('battle:energy', {
            target,
            amount: Math.floor(amount),
            timestamp: Date.now()
          });
        }
      }
    };
  });

  afterEach(() => {
    eventManager.clear();
  });

  test('showEnergyChange 应该触发 battle:energy 事件', () => {
    const callback = vi.fn();
    eventManager.on('battle:energy', callback);

    mockGame.showEnergyChange({}, 50);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 50
        })
      })
    );
  });

  test('灵力值应该被 floor 处理', () => {
    const callback = vi.fn();
    eventManager.on('battle:energy', callback);

    mockGame.showEnergyChange({}, 49.7);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 49
        })
      })
    );
  });

  test('正值灵力（恢复）应该正常触发', () => {
    const callback = vi.fn();
    eventManager.on('battle:energy', callback);

    mockGame.showEnergyChange({}, 100);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 100
        })
      })
    );
  });

  test('负值灵力（消耗）应该正常触发', () => {
    const callback = vi.fn();
    eventManager.on('battle:energy', callback);

    mockGame.showEnergyChange({}, -50);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: -50
        })
      })
    );
  });

  test('事件数据应该包含时间戳', () => {
    const callback = vi.fn();
    eventManager.on('battle:energy', callback);

    const beforeTime = Date.now();
    mockGame.showEnergyChange({}, 50);
    const afterTime = Date.now();

    const eventData = callback.mock.calls[0][0];
    expect(eventData.data.timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(eventData.data.timestamp).toBeLessThanOrEqual(afterTime);
  });

  test('模拟灵力变化场景', () => {
    const energyChanges = [];

    eventManager.on('battle:energy', (event) => {
      energyChanges.push({
        amount: event.data.amount
      });
    });

    mockGame.showEnergyChange({}, 50);   // 恢复灵力
    mockGame.showEnergyChange({}, -30);  // 消耗灵力
    mockGame.showEnergyChange({}, 100);  // 大量恢复

    expect(energyChanges).toHaveLength(3);
    expect(energyChanges[0]).toEqual({ amount: 50 });
    expect(energyChanges[1]).toEqual({ amount: -30 });
    expect(energyChanges[2]).toEqual({ amount: 100 });
  });

  test('事件监听器可以用于记录灵力统计', () => {
    const stats = { totalRecovered: 0, totalConsumed: 0 };

    eventManager.on('battle:energy', (event) => {
      if (event.data.amount > 0) {
        stats.totalRecovered += event.data.amount;
      } else {
        stats.totalConsumed += Math.abs(event.data.amount);
      }
    });

    mockGame.showEnergyChange({}, 50);
    mockGame.showEnergyChange({}, -30);
    mockGame.showEnergyChange({}, 100);

    expect(stats.totalRecovered).toBe(150);
    expect(stats.totalConsumed).toBe(30);
  });
});
