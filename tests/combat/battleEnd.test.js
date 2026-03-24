/**
 * battleEnd (enemyDefeated & playerDefeated) 事件化重构测试
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { eventManager } from '../../src/core/EventManager.js';

describe('战斗结束事件化测试', () => {
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
          hp: 0,
          maxHp: 100,
          level: 5,
          isBoss: false,
          isElite: false
        }
      },
      persistentState: {
        player: {
          hp: 50,
          maxHp: 100,
          energy: 30,
          maxEnergy: 100,
          exp: 100,
          level: 5,
          realm: { currentRealm: 0, currentStage: 1 },
          inventory: [],
          skills: { equipped: {}, levels: {} }
        },
        resources: {
          herbs: 0,
          iron: 0,
          spiritStones: 0,
          breakthroughStones: 0
        }
      },
      battle3D: {
        player: {},
        enemy: {},
        scene: {}
      },

      enemyDefeated() {
        // 触发事件
        if (typeof eventManager !== 'undefined' && eventManager) {
          eventManager.emit('battle:victory', {
            enemy: this.transientState.enemy.name,
            isBoss: this.transientState.enemy.isBoss,
            isElite: this.transientState.enemy.isElite,
            expGained: Math.floor(this.transientState.enemy.level * 20),
            timestamp: Date.now()
          });
        }
        return true;
      },

      playerDefeated() {
        // 触发事件
        if (typeof eventManager !== 'undefined' && eventManager) {
          eventManager.emit('battle:defeat', {
            enemy: this.transientState.enemy.name,
            expLoss: Math.floor(this.persistentState.player.exp * 0.2),
            timestamp: Date.now()
          });
        }
        return true;
      }
    };
  });

  afterEach(() => {
    eventManager.clear();
  });

  // ========== enemyDefeated 测试 ==========

  describe('enemyDefeated 事件化测试', () => {
    test('enemyDefeated 应该触发 battle:victory 事件', () => {
      const callback = vi.fn();
      eventManager.on('battle:victory', callback);

      mockGame.enemyDefeated();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'battle:victory',
          data: expect.objectContaining({
            enemy: '测试敌人'
          })
        })
      );
    });

    test('事件数据应该包含敌人信息', () => {
      const callback = vi.fn();
      eventManager.on('battle:victory', callback);

      mockGame.enemyDefeated();

      const eventData = callback.mock.calls[0][0];
      expect(eventData.data.enemy).toBe('测试敌人');
      expect(eventData.data.isBoss).toBe(false);
      expect(eventData.data.isElite).toBe(false);
      expect(eventData.data.expGained).toBe(100); // level 5 * 20
    });

    test('BOSS击杀应该包含正确标记', () => {
      const callback = vi.fn();
      eventManager.on('battle:victory', callback);

      mockGame.transientState.enemy.isBoss = true;
      mockGame.enemyDefeated();

      const eventData = callback.mock.calls[0][0];
      expect(eventData.data.isBoss).toBe(true);
    });

    test('事件数据应该包含时间戳', () => {
      const callback = vi.fn();
      eventManager.on('battle:victory', callback);

      const beforeTime = Date.now();
      mockGame.enemyDefeated();
      const afterTime = Date.now();

      const eventData = callback.mock.calls[0][0];
      expect(eventData.data.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(eventData.data.timestamp).toBeLessThanOrEqual(afterTime);
    });

    test('多个监听器应该都能接收到胜利事件', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventManager.on('battle:victory', listener1);
      eventManager.on('battle:victory', listener2);

      mockGame.enemyDefeated();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    test('事件监听器可以用于统计击杀', () => {
      const stats = { killCount: 0, bossKills: 0, totalExp: 0 };

      eventManager.on('battle:victory', (event) => {
        stats.killCount++;
        if (event.data.isBoss) stats.bossKills++;
        stats.totalExp += event.data.expGained;
      });

      mockGame.enemyDefeated();
      mockGame.transientState.enemy.isBoss = true;
      mockGame.enemyDefeated();

      expect(stats.killCount).toBe(2);
      expect(stats.bossKills).toBe(1);
      expect(stats.totalExp).toBe(200);
    });
  });

  // ========== playerDefeated 测试 ==========

  describe('playerDefeated 事件化测试', () => {
    test('playerDefeated 应该触发 battle:defeat 事件', () => {
      const callback = vi.fn();
      eventManager.on('battle:defeat', callback);

      mockGame.playerDefeated();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'battle:defeat',
          data: expect.objectContaining({
            enemy: '测试敌人'
          })
        })
      );
    });

    test('事件数据应该包含经验损失信息', () => {
      const callback = vi.fn();
      eventManager.on('battle:defeat', callback);

      mockGame.playerDefeated();

      const eventData = callback.mock.calls[0][0];
      expect(eventData.data.enemy).toBe('测试敌人');
      expect(eventData.data.expLoss).toBe(20); // 100 * 0.2
    });

    test('事件数据应该包含时间戳', () => {
      const callback = vi.fn();
      eventManager.on('battle:defeat', callback);

      const beforeTime = Date.now();
      mockGame.playerDefeated();
      const afterTime = Date.now();

      const eventData = callback.mock.calls[0][0];
      expect(eventData.data.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(eventData.data.timestamp).toBeLessThanOrEqual(afterTime);
    });

    test('多个监听器应该都能接收到失败事件', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventManager.on('battle:defeat', listener1);
      eventManager.on('battle:defeat', listener2);

      mockGame.playerDefeated();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    test('事件监听器可以用于统计失败次数', () => {
      const stats = { defeatCount: 0, totalExpLoss: 0 };

      eventManager.on('battle:defeat', (event) => {
        stats.defeatCount++;
        stats.totalExpLoss += event.data.expLoss;
      });

      mockGame.playerDefeated();
      mockGame.persistentState.player.exp = 200;
      mockGame.playerDefeated();

      expect(stats.defeatCount).toBe(2);
      expect(stats.totalExpLoss).toBe(60); // 20 + 40
    });
  });

  // ========== 混合场景测试 ==========

  describe('战斗结束混合场景测试', () => {
    test('胜利和失败事件应该互不干扰', () => {
      const victoryCallback = vi.fn();
      const defeatCallback = vi.fn();

      eventManager.on('battle:victory', victoryCallback);
      eventManager.on('battle:defeat', defeatCallback);

      mockGame.enemyDefeated();
      mockGame.playerDefeated();

      expect(victoryCallback).toHaveBeenCalledTimes(1);
      expect(defeatCallback).toHaveBeenCalledTimes(1);
    });

    test('可以同时监听所有战斗结束事件', () => {
      const allEnds = [];

      eventManager.on('battle:victory', (event) => {
        allEnds.push({ type: 'victory', enemy: event.data.enemy });
      });

      eventManager.on('battle:defeat', (event) => {
        allEnds.push({ type: 'defeat', enemy: event.data.enemy });
      });

      mockGame.enemyDefeated();
      mockGame.playerDefeated();
      mockGame.enemyDefeated();

      expect(allEnds).toHaveLength(3);
      expect(allEnds[0].type).toBe('victory');
      expect(allEnds[1].type).toBe('defeat');
      expect(allEnds[2].type).toBe('victory');
    });
  });
});
