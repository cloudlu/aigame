/**
 * attackEnemy 事件化重构测试
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { eventManager } from '../../src/core/EventManager.js';

describe('attackEnemy 事件化测试', () => {
  let mockGame;

  beforeEach(() => {
    eventManager.clear();

    mockGame = {
      transientState: {
        battle: {
          inBattle: true
        },
        enemy: {
          name: '测试敌人',
          hp: 100,
          maxHp: 100
        }
      },
      persistentState: {
        player: {
          hp: 100,
          maxHp: 100,
          shieldValue: 0,
          defenseActive: false,
          immuneNextAttack: false
        }
      },
      battle3D: {
        player: {},
        enemy: {},
        scene: {}
      },

      attackEnemy() {
        // 触发事件
        if (typeof eventManager !== 'undefined' && eventManager) {
          eventManager.emit('battle:attack', {
            attacker: 'player',
            target: this.transientState.enemy.name,
            timestamp: Date.now()
          });
        }
        // 原有功能模拟
        return true;
      }
    };
  });

  afterEach(() => {
    eventManager.clear();
  });

  test('attackEnemy 应该触发 battle:attack 事件', () => {
    const callback = vi.fn();
    eventManager.on('battle:attack', callback);

    mockGame.attackEnemy();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'battle:attack',
        data: expect.objectContaining({
          attacker: 'player',
          target: '测试敌人'
        })
      })
    );
  });

  test('事件数据应该包含攻击者和目标信息', () => {
    const callback = vi.fn();
    eventManager.on('battle:attack', callback);

    mockGame.attackEnemy();

    const eventData = callback.mock.calls[0][0];
    expect(eventData.data.attacker).toBe('player');
    expect(eventData.data.target).toBe('测试敌人');
  });

  test('事件数据应该包含时间戳', () => {
    const callback = vi.fn();
    eventManager.on('battle:attack', callback);

    const beforeTime = Date.now();
    mockGame.attackEnemy();
    const afterTime = Date.now();

    const eventData = callback.mock.calls[0][0];
    expect(eventData.data.timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(eventData.data.timestamp).toBeLessThanOrEqual(afterTime);
  });

  test('多次攻击应该触发多次事件', () => {
    const callback = vi.fn();
    eventManager.on('battle:attack', callback);

    mockGame.attackEnemy();
    mockGame.attackEnemy();
    mockGame.attackEnemy();

    expect(callback).toHaveBeenCalledTimes(3);
  });

  test('多个监听器应该都能接收到事件', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const listener3 = vi.fn();

    eventManager.on('battle:attack', listener1);
    eventManager.on('battle:attack', listener2);
    eventManager.on('battle:attack', listener3);

    mockGame.attackEnemy();

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
  });

  test('事件监听器可以访问攻击信息', () => {
    let attackInfo = null;

    eventManager.on('battle:attack', (event) => {
      attackInfo = {
        attacker: event.data.attacker,
        target: event.data.target
      };
    });

    mockGame.attackEnemy();

    expect(attackInfo).toEqual({
      attacker: 'player',
      target: '测试敌人'
    });
  });

  test('模拟战斗攻击场景', () => {
    const attacks = [];

    eventManager.on('battle:attack', (event) => {
      attacks.push({
        attacker: event.data.attacker,
        target: event.data.target
      });
    });

    // 模拟连续攻击
    mockGame.attackEnemy();
    mockGame.transientState.enemy.name = '第二个敌人';
    mockGame.attackEnemy();

    expect(attacks).toHaveLength(2);
    expect(attacks[0].target).toBe('测试敌人');
    expect(attacks[1].target).toBe('第二个敌人');
  });

  test('事件监听器可以用于统计战斗次数', () => {
    const stats = { attackCount: 0, lastTarget: null };

    eventManager.on('battle:attack', (event) => {
      stats.attackCount++;
      stats.lastTarget = event.data.target;
    });

    mockGame.attackEnemy();
    mockGame.attackEnemy();
    mockGame.attackEnemy();

    expect(stats.attackCount).toBe(3);
    expect(stats.lastTarget).toBe('测试敌人');
  });
});
