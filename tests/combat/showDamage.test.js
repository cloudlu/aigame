/**
 * showDamage 事件化重构测试
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { eventManager } from '../../src/core/EventManager.js';

describe('showDamage 事件化测试', () => {
  let mockGame;

  beforeEach(() => {
    eventManager.clear();

    mockGame = {
      battle3D: { scene: {} },

      showDamage(target, amount, type = 'red') {
        // 触发事件
        if (typeof eventManager !== 'undefined' && eventManager) {
          eventManager.emit('battle:damage', {
            target,
            amount: Math.floor(amount),
            type,
            timestamp: Date.now()
          });
        }
      }
    };
  });

  afterEach(() => {
    eventManager.clear();
  });

  test('showDamage 应该触发 battle:damage 事件', () => {
    const callback = vi.fn();
    eventManager.on('battle:damage', callback);

    mockGame.showDamage({}, 100, 'red');

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 100,
          type: 'red'
        })
      })
    );
  });

  test('伤害值应该被 floor 处理', () => {
    const callback = vi.fn();
    eventManager.on('battle:damage', callback);

    mockGame.showDamage({}, 99.7, 'red');

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 99
        })
      })
    );
  });

  test('不同类型伤害应该触发相同事件', () => {
    const callback = vi.fn();
    eventManager.on('battle:damage', callback);

    mockGame.showDamage({}, 100, 'crit');
    mockGame.showDamage({}, 50, 'red');
    mockGame.showDamage({}, 30, 'green');

    expect(callback).toHaveBeenCalledTimes(3);
  });

  test('事件数据应该包含时间戳', () => {
    const callback = vi.fn();
    eventManager.on('battle:damage', callback);

    const beforeTime = Date.now();
    mockGame.showDamage({}, 100, 'red');
    const afterTime = Date.now();

    const eventData = callback.mock.calls[0][0];
    expect(eventData.data.timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(eventData.data.timestamp).toBeLessThanOrEqual(afterTime);
  });

  test('多个监听器应该都能接收到事件', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    eventManager.on('battle:damage', listener1);
    eventManager.on('battle:damage', listener2);

    mockGame.showDamage({}, 100, 'red');

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  test('模拟战斗伤害场景', () => {
    const damages = [];

    eventManager.on('battle:damage', (event) => {
      damages.push({
        amount: event.data.amount,
        type: event.data.type
      });
    });

    mockGame.showDamage({}, 100, 'red');
    mockGame.showDamage({}, 250, 'crit');
    mockGame.showDamage({}, -30, 'green');

    expect(damages).toHaveLength(3);
    expect(damages[0]).toEqual({ amount: 100, type: 'red' });
    expect(damages[1]).toEqual({ amount: 250, type: 'crit' });
    expect(damages[2]).toEqual({ amount: -30, type: 'green' });
  });

  test('事件监听器可以用于记录战斗统计', () => {
    const stats = { totalDamage: 0, critCount: 0 };

    eventManager.on('battle:damage', (event) => {
      if (event.data.type === 'crit') {
        stats.critCount++;
      }
      stats.totalDamage += event.data.amount;
    });

    mockGame.showDamage({}, 100, 'red');
    mockGame.showDamage({}, 200, 'crit');

    expect(stats.totalDamage).toBe(300);
    expect(stats.critCount).toBe(1);
  });
});
