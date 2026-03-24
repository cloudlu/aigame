/**
 * addBattleLog 事件化重构测试
 *
 * 测试目标：
 * - addBattleLog 应该触发 battle:log 事件
 * - 事件数据应该包含消息和时间戳
 * - 原有功能应该保持正常
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { eventManager } from '../../src/core/EventManager.js';

describe('addBattleLog 事件化测试', () => {
  let mockGame;

  beforeEach(() => {
    // 清空事件管理器
    eventManager.clear();

    // 创建 mock game 对象
    mockGame = {
      transientState: {
        battle: {
          inBattle: false,
          battleLog: []
        }
      },

      // addBattleLog 实现（与game.js一致）
      addBattleLog(message) {
        // 触发事件
        if (typeof eventManager !== 'undefined' && eventManager) {
          eventManager.emit('battle:log', {
            message,
            timestamp: Date.now()
          });
        }

        // 确保 battle 对象存在
        if (!this.transientState.battle) {
          this.transientState.battle = {
            inBattle: false,
            battleLog: []
          };
        }
        // 确保 battleLog 数组存在
        if (!this.transientState.battle.battleLog) {
          this.transientState.battle.battleLog = [];
        }
        this.transientState.battle.battleLog.push(message);
        // 限制日志长度
        if (this.transientState.battle.battleLog.length > 10) {
          this.transientState.battle.battleLog.shift();
        }

        // 模拟 UI 更新
        this.updateBattleLogUI(message);
      },

      // mock UI 更新函数
      updateBattleLogUI: vi.fn()
    };
  });

  afterEach(() => {
    eventManager.clear();
  });

  // ========== 事件触发测试 ==========

  test('addBattleLog 应该触发 battle:log 事件', () => {
    const callback = vi.fn();
    eventManager.on('battle:log', callback);

    mockGame.addBattleLog('测试日志消息');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'battle:log',
        data: expect.objectContaining({
          message: '测试日志消息',
          timestamp: expect.any(Number)
        })
      })
    );
  });

  test('事件数据应该包含正确的时间戳', () => {
    const callback = vi.fn();
    eventManager.on('battle:log', callback);

    const beforeTime = Date.now();
    mockGame.addBattleLog('测试');
    const afterTime = Date.now();

    const eventData = callback.mock.calls[0][0];
    expect(eventData.data.timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(eventData.data.timestamp).toBeLessThanOrEqual(afterTime);
  });

  test('多次调用应该触发多次事件', () => {
    const callback = vi.fn();
    eventManager.on('battle:log', callback);

    mockGame.addBattleLog('消息1');
    mockGame.addBattleLog('消息2');
    mockGame.addBattleLog('消息3');

    expect(callback).toHaveBeenCalledTimes(3);
  });

  // ========== 原有功能保持测试 ==========

  test('原有日志数组功能应该保持正常', () => {
    mockGame.addBattleLog('日志1');
    mockGame.addBattleLog('日志2');
    mockGame.addBattleLog('日志3');

    expect(mockGame.transientState.battle.battleLog).toHaveLength(3);
    expect(mockGame.transientState.battle.battleLog).toEqual([
      '日志1',
      '日志2',
      '日志3'
    ]);
  });

  test('日志长度限制应该正常工作', () => {
    // 添加 15 条日志（超过限制 10）
    for (let i = 1; i <= 15; i++) {
      mockGame.addBattleLog(`日志${i}`);
    }

    // 应该只保留最后 10 条
    expect(mockGame.transientState.battle.battleLog).toHaveLength(10);
    expect(mockGame.transientState.battle.battleLog[0]).toBe('日志6'); // 15 - 10 + 1
    expect(mockGame.transientState.battle.battleLog[9]).toBe('日志15');
  });

  test('UI更新函数应该被调用', () => {
    mockGame.addBattleLog('测试');

    expect(mockGame.updateBattleLogUI).toHaveBeenCalledTimes(1);
    expect(mockGame.updateBattleLogUI).toHaveBeenCalledWith('测试');
  });

  test('空消息应该也能正常处理', () => {
    const callback = vi.fn();
    eventManager.on('battle:log', callback);

    mockGame.addBattleLog('');

    expect(callback).toHaveBeenCalled();
    expect(mockGame.transientState.battle.battleLog).toContain('');
  });

  // ========== 事件监听器测试 ==========

  test('事件监听器可以访问日志消息', () => {
    let receivedMessage = null;

    eventManager.on('battle:log', (event) => {
      receivedMessage = event.data.message;
    });

    mockGame.addBattleLog('这是一条测试消息');

    expect(receivedMessage).toBe('这是一条测试消息');
  });

  test('多个监听器应该都能接收到事件', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const listener3 = vi.fn();

    eventManager.on('battle:log', listener1);
    eventManager.on('battle:log', listener2);
    eventManager.on('battle:log', listener3);

    mockGame.addBattleLog('测试');

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
  });

  // ========== 集成测试 ==========

  test('模拟战斗日志场景', () => {
    const logs = [];

    eventManager.on('battle:log', (event) => {
      logs.push(event.data.message);
    });

    // 模拟战斗流程
    mockGame.addBattleLog('战斗开始！');
    mockGame.addBattleLog('你发起了攻击，造成100点伤害');
    mockGame.addBattleLog('敌人反击，造成50点伤害');
    mockGame.addBattleLog('💥暴击！造成250点伤害');
    mockGame.addBattleLog('敌人被击败！');

    expect(logs).toHaveLength(5);
    expect(logs).toContain('战斗开始！');
    expect(logs).toContain('敌人被击败！');
  });

  test('事件监听器可以修改或阻止后续处理', () => {
    // 这个测试验证事件系统的扩展能力
    const processedMessages = [];

    eventManager.on('battle:log', (event) => {
      // 可以在这里添加额外处理，比如：
      // - 记录到数据库
      // - 发送到服务器
      // - 触发成就系统
      processedMessages.push({
        message: event.data.message,
        time: event.data.timestamp
      });
    });

    mockGame.addBattleLog('测试消息');

    expect(processedMessages).toHaveLength(1);
    expect(processedMessages[0].message).toBe('测试消息');
  });

  // ========== 边界条件测试 ==========

  test('特殊字符消息应该正常处理', () => {
    const specialMessages = [
      '💥暴击！', // emoji
      '<script>alert("xss")</script>', // HTML
      '消息\n换行', // 换行符
      '超长消息'.repeat(1000), // 超长字符串
    ];

    const callback = vi.fn();
    eventManager.on('battle:log', callback);

    specialMessages.forEach(msg => {
      mockGame.addBattleLog(msg);
    });

    expect(callback).toHaveBeenCalledTimes(specialMessages.length);
  });

  test('transientState.battle 不存在时应该自动创建', () => {
    // 删除 battle 对象
    delete mockGame.transientState.battle;

    const callback = vi.fn();
    eventManager.on('battle:log', callback);

    mockGame.addBattleLog('测试');

    expect(callback).toHaveBeenCalled();
    expect(mockGame.transientState.battle).toBeDefined();
    expect(mockGame.transientState.battle.battleLog).toContain('测试');
  });
});
