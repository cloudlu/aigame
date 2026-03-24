/**
 * showDodge 事件化重构测试
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { eventManager } from '../../src/core/EventManager.js';

describe('showDodge 事件化测试', () => {
  let mockGame;

  beforeEach(() => {
    eventManager.clear();

    mockGame = {
      battle3D: { scene: {} },

      showDodge(target, text) {
        // 触发事件
        if (typeof eventManager !== 'undefined' && eventManager) {
          eventManager.emit('battle:dodge', {
            target,
            text,
            timestamp: Date.now()
          });
        }
      }
    };
  });

  afterEach(() => {
    eventManager.clear();
  });

  test('showDodge 应该触发 battle:dodge 事件', () => {
    const callback = vi.fn();
    eventManager.on('battle:dodge', callback);

    const mockTarget = { position: { x: 0, y: 0, z: 0 } };
    mockGame.showDodge(mockTarget, '闪避！');

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          target: mockTarget,
          text: '闪避！'
        })
      })
    );
  });

  test('闪避提示文本应该正确传递', () => {
    const callback = vi.fn();
    eventManager.on('battle:dodge', callback);

    mockGame.showDodge({}, 'MISS');
    mockGame.showDodge({}, '闪避成功');
    mockGame.showDodge({}, 'DODGE');

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ data: expect.objectContaining({ text: 'MISS' }) })
    );
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ data: expect.objectContaining({ text: '闪避成功' }) })
    );
    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ data: expect.objectContaining({ text: 'DODGE' }) })
    );
  });

  test('事件数据应该包含时间戳', () => {
    const callback = vi.fn();
    eventManager.on('battle:dodge', callback);

    const beforeTime = Date.now();
    mockGame.showDodge({}, '闪避！');
    const afterTime = Date.now();

    const eventData = callback.mock.calls[0][0];
    expect(eventData.data.timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(eventData.data.timestamp).toBeLessThanOrEqual(afterTime);
  });

  test('事件监听器可以访问闪避目标', () => {
    const mockTarget = {
      id: 'enemy1',
      name: '敌人',
      position: { x: 10, y: 0, z: 5 }
    };

    let receivedTarget = null;

    eventManager.on('battle:dodge', (event) => {
      receivedTarget = event.data.target;
    });

    mockGame.showDodge(mockTarget, '闪避！');

    expect(receivedTarget).toBe(mockTarget);
    expect(receivedTarget.id).toBe('enemy1');
  });

  test('多个监听器应该都能接收到事件', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const listener3 = vi.fn();

    eventManager.on('battle:dodge', listener1);
    eventManager.on('battle:dodge', listener2);
    eventManager.on('battle:dodge', listener3);

    mockGame.showDodge({}, '闪避！');

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
  });

  test('模拟战斗闪避场景', () => {
    const dodges = [];

    eventManager.on('battle:dodge', (event) => {
      dodges.push({
        text: event.data.text,
        target: event.data.target
      });
    });

    const playerTarget = { id: 'player', name: '玩家' };
    const enemyTarget = { id: 'enemy', name: '敌人' };

    mockGame.showDodge(enemyTarget, '闪避！');    // 敌人闪避
    mockGame.showDodge(playerTarget, 'MISS');     // 玩家闪避

    expect(dodges).toHaveLength(2);
    expect(dodges[0]).toEqual({
      text: '闪避！',
      target: enemyTarget
    });
    expect(dodges[1]).toEqual({
      text: 'MISS',
      target: playerTarget
    });
  });

  test('事件监听器可以用于统计闪避次数', () => {
    const stats = {
      playerDodges: 0,
      enemyDodges: 0
    };

    eventManager.on('battle:dodge', (event) => {
      if (event.data.target.id === 'player') {
        stats.playerDodges++;
      } else {
        stats.enemyDodges++;
      }
    });

    const player = { id: 'player' };
    const enemy = { id: 'enemy' };

    mockGame.showDodge(player, '闪避！');
    mockGame.showDodge(enemy, '闪避！');
    mockGame.showDodge(player, '闪避！');

    expect(stats.playerDodges).toBe(2);
    expect(stats.enemyDodges).toBe(1);
  });

  test('空文本应该正常处理', () => {
    const callback = vi.fn();
    eventManager.on('battle:dodge', callback);

    mockGame.showDodge({}, '');

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          text: ''
        })
      })
    );
  });

  test('特殊字符文本应该正常处理', () => {
    const specialTexts = [
      '💥闪避！',
      '<script>alert("xss")</script>',
      '闪避\n成功',
      'DODGE'.repeat(10)
    ];

    const callback = vi.fn();
    eventManager.on('battle:dodge', callback);

    specialTexts.forEach(text => {
      mockGame.showDodge({}, text);
    });

    expect(callback).toHaveBeenCalledTimes(specialTexts.length);
  });
});
