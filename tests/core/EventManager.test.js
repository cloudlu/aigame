/**
 * EventManager 单元测试
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventManager, eventManager } from '../../src/core/EventManager.js';

describe('EventManager', () => {
  let manager;

  beforeEach(() => {
    // 每个测试创建新的 EventManager 实例
    manager = new EventManager();
  });

  afterEach(() => {
    // 清理
    manager.clear();
  });

  // ========== 基础功能测试 ==========

  describe('基础功能', () => {
    test('应该正确注册和触发事件', () => {
      const callback = vi.fn();
      manager.on('test:event', callback);
      manager.emit('test:event', { value: 123 });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test:event',
          data: { value: 123 }
        })
      );
    });

    test('应该支持多个监听器', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      manager.on('test:event', callback1);
      manager.on('test:event', callback2);
      manager.on('test:event', callback3);

      manager.emit('test:event', {});

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });

    test('应该正确传递事件数据', () => {
      const callback = vi.fn();
      const data = {
        player: { name: '张三', level: 10 },
        enemy: { name: '小妖', hp: 100 }
      };

      manager.on('battle:start', callback);
      manager.emit('battle:start', data);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'battle:start',
          data
        })
      );
    });
  });

  // ========== 优先级测试 ==========

  describe('优先级系统', () => {
    test('应该按优先级执行监听器', () => {
      const order = [];

      manager.on('test:event', () => order.push(1), { priority: 1 });
      manager.on('test:event', () => order.push(2), { priority: 3 });
      manager.on('test:event', () => order.push(3), { priority: 2 });

      manager.emit('test:event', {});

      // 优先级高的先执行: 3 > 2 > 1
      expect(order).toEqual([2, 3, 1]);
    });

    test('相同优先级应该按注册顺序执行', () => {
      const order = [];

      manager.on('test:event', () => order.push(1), { priority: 1 });
      manager.on('test:event', () => order.push(2), { priority: 1 });
      manager.on('test:event', () => order.push(3), { priority: 1 });

      manager.emit('test:event', {});

      // 相同优先级，按注册顺序
      expect(order).toEqual([1, 2, 3]);
    });

    test('默认优先级应该是0', () => {
      const order = [];

      manager.on('test:event', () => order.push(1)); // 默认 0
      manager.on('test:event', () => order.push(2), { priority: 1 });

      manager.emit('test:event', {});

      expect(order).toEqual([2, 1]);
    });
  });

  // ========== 一次性监听器测试 ==========

  describe('once() - 一次性监听器', () => {
    test('once 应该只触发一次', () => {
      const callback = vi.fn();
      manager.once('test:event', callback);

      manager.emit('test:event', {});
      manager.emit('test:event', {});
      manager.emit('test:event', {});

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('once 触发后应该自动移除', () => {
      const callback = vi.fn();
      manager.once('test:event', callback);

      expect(manager.listenerCount('test:event')).toBe(1);

      manager.emit('test:event', {});

      expect(manager.listenerCount('test:event')).toBe(0);
    });

    test('once 应该支持优先级', () => {
      const order = [];

      manager.once('test:event', () => order.push(1), { priority: 2 });
      manager.once('test:event', () => order.push(2), { priority: 1 });

      manager.emit('test:event', {});

      expect(order).toEqual([1, 2]);
    });
  });

  // ========== off() - 注销监听器测试 ==========

  describe('off() - 注销监听器', () => {
    test('off 应该正确注销监听器', () => {
      const callback = vi.fn();
      manager.on('test:event', callback);

      manager.emit('test:event', {});
      expect(callback).toHaveBeenCalledTimes(1);

      manager.off('test:event', callback);

      manager.emit('test:event', {});
      expect(callback).toHaveBeenCalledTimes(1); // 还是1次
    });

    test('注销不存在的监听器应该静默失败', () => {
      const callback = vi.fn();

      // 不应该抛出错误
      expect(() => {
        manager.off('test:event', callback);
      }).not.toThrow();
    });

    test('on() 返回的取消函数应该正确工作', () => {
      const callback = vi.fn();
      const unsubscribe = manager.on('test:event', callback);

      manager.emit('test:event', {});
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      manager.emit('test:event', {});
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  // ========== clear() - 清空监听器测试 ==========

  describe('clear() - 清空监听器', () => {
    test('clear(eventName) 应该清空指定事件', () => {
      manager.on('test:event1', () => {});
      manager.on('test:event1', () => {});
      manager.on('test:event2', () => {});

      manager.clear('test:event1');

      expect(manager.listenerCount('test:event1')).toBe(0);
      expect(manager.listenerCount('test:event2')).toBe(1);
    });

    test('clear() 应该清空所有事件', () => {
      manager.on('test:event1', () => {});
      manager.on('test:event2', () => {});
      manager.on('test:event3', () => {});

      manager.clear();

      expect(manager.listenerCount()).toBe(0);
      expect(manager.eventNames()).toHaveLength(0);
    });
  });

  // ========== 错误处理测试 ==========

  describe('错误处理', () => {
    test('无效事件名称应该抛出错误', () => {
      expect(() => {
        manager.on(123, () => {});
      }).toThrow('事件名称必须是字符串');

      expect(() => {
        manager.on('', () => {});
      }).toThrow('事件名称不能为空');
    });

    test('无效回调应该抛出错误', () => {
      expect(() => {
        manager.on('test:event', 'not a function');
      }).toThrow('回调必须是函数');
    });

    test('一个监听器出错不应该影响其他监听器', () => {
      const callback1 = vi.fn(() => {
        throw new Error('测试错误');
      });
      const callback2 = vi.fn();

      manager.on('test:event', callback1);
      manager.on('test:event', callback2);

      // 不应该抛出错误
      expect(() => {
        manager.emit('test:event', {});
      }).not.toThrow();

      // 第二个监听器应该仍然执行
      expect(callback2).toHaveBeenCalled();
    });
  });

  // ========== 事件取消测试 ==========

  describe('事件取消', () => {
    test('监听器应该能够取消事件', () => {
      const callback1 = vi.fn((event) => {
        event.canceled = true; // 取消事件
      });
      const callback2 = vi.fn();

      manager.on('test:event', callback1, { priority: 10 });
      manager.on('test:event', callback2, { priority: 1 });

      manager.emit('test:event', {});

      expect(callback1).toHaveBeenCalled();
      // 低优先级的监听器不应该执行
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  // ========== 异步事件测试 ==========

  describe('异步事件', () => {
    test('异步事件应该加入队列', async () => {
      const callback = vi.fn();
      manager.on('test:event', callback);

      manager.emit('test:event', {}, true);

      // 立即检查，可能还没执行
      // await new Promise(resolve => setTimeout(resolve, 10));

      // 等待事件队列处理完成
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(callback).toHaveBeenCalled();
    });
  });

  // ========== 统计功能测试 ==========

  describe('统计功能', () => {
    test('listenerCount() 应该返回正确的监听器数量', () => {
      manager.on('test:event1', () => {});
      manager.on('test:event1', () => {});
      manager.on('test:event2', () => {});

      expect(manager.listenerCount('test:event1')).toBe(2);
      expect(manager.listenerCount('test:event2')).toBe(1);
      expect(manager.listenerCount()).toBe(3);
    });

    test('eventNames() 应该返回所有事件名称', () => {
      manager.on('event1', () => {});
      manager.on('event2', () => {});
      manager.on('event3', () => {});

      const names = manager.eventNames();

      expect(names).toContain('event1');
      expect(names).toContain('event2');
      expect(names).toContain('event3');
      expect(names).toHaveLength(3);
    });

    test('getStats() 应该返回统计信息', () => {
      manager.on('test:event', () => {});
      manager.emit('test:event', {});
      manager.emit('test:event', {});

      const stats = manager.getStats();

      expect(stats.totalEvents).toBe(2);
      expect(stats.totalListeners).toBe(1);
      expect(stats.eventCount).toBe(1);
    });
  });

  // ========== 调试模式测试 ==========

  describe('调试模式', () => {
    test('setDebug(true) 应该启用调试日志', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      manager.setDebug(true);
      manager.on('test:event', () => {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[EventManager]')
      );

      consoleSpy.mockRestore();
    });
  });

  // ========== 边界条件测试 ==========

  describe('边界条件', () => {
    test('没有监听器的事件应该静默失败', () => {
      expect(() => {
        manager.emit('nonexistent:event', {});
      }).not.toThrow();
    });

    test('重复注册相同监听器应该允许', () => {
      const callback = vi.fn();
      manager.on('test:event', callback);
      manager.on('test:event', callback);

      manager.emit('test:event', {});

      // 应该调用2次
      expect(callback).toHaveBeenCalledTimes(2);
    });

    test('大量监听器应该正常工作', () => {
      const callbacks = [];
      for (let i = 0; i < 100; i++) {
        const callback = vi.fn();
        callbacks.push(callback);
        manager.on('test:event', callback);
      }

      manager.emit('test:event', {});

      callbacks.forEach(callback => {
        expect(callback).toHaveBeenCalled();
      });
    });

    test('大量事件触发应该正常工作', () => {
      const callback = vi.fn();
      manager.on('test:event', callback);

      for (let i = 0; i < 1000; i++) {
        manager.emit('test:event', { index: i });
      }

      expect(callback).toHaveBeenCalledTimes(1000);
    });
  });

  // ========== 性能测试 ==========

  describe('性能测试', () => {
    test('优先级插入应该高效', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        manager.on('test:event', () => {}, {
          priority: Math.floor(Math.random() * 100)
        });
      }

      const duration = performance.now() - start;

      // 应该在100ms内完成
      expect(duration).toBeLessThan(100);
    });

    test('事件触发应该高效', () => {
      manager.on('test:event', () => {}, { priority: 1 });

      const start = performance.now();

      for (let i = 0; i < 10000; i++) {
        manager.emit('test:event', {});
      }

      const duration = performance.now() - start;

      // 应该在500ms内完成
      expect(duration).toBeLessThan(500);
    });
  });
});

// ========== 全局单例测试 ==========

describe('全局单例', () => {
  test('eventManager 应该是 EventManager 的实例', () => {
    expect(eventManager).toBeInstanceOf(EventManager);
  });

  test('全局单例应该可以正常使用', () => {
    const callback = vi.fn();
    eventManager.on('test:global', callback);
    eventManager.emit('test:global', { test: true });

    expect(callback).toHaveBeenCalled();

    // 清理
    eventManager.clear('test:global');
  });
});
