/**
 * 测试工具函数
 */

import { sleep } from './MockFactory.js';

/**
 * 测试套件 - 用于组织相关的测试
 */
export function describeSuite(name, fn) {
  describe(name, () => {
    fn();
  });
}

/**
 * 测试用例 - 异步版本
 */
export async function testAsync(name, fn) {
  test(name, async () => {
    await fn();
  });
}

/**
 * 设置测试环境 - 在所有测试之前运行
 */
export function setupTestEnvironment() {
  // 清理环境
  beforeEach(() => {
    // 可以在这里重置全局状态
  });

  afterEach(() => {
    // 清理测试产生的副作用
  });
}

/**
 * 创建临时测试数据
 */
export class TestData {
  constructor() {
    this.data = new Map();
  }

  set(key, value) {
    this.data.set(key, value);
    return value;
  }

  get(key) {
    return this.data.get(key);
  }

  clear() {
    this.data.clear();
  }

  has(key) {
    return this.data.has(key);
  }
}

/**
 * 性能测试工具 - 测量函数执行时间
 */
export async function measurePerformance(name, fn, iterations = 1000) {
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    await fn();
  }

  const end = performance.now();
  const duration = end - start;
  const avgTime = duration / iterations;

  console.log(`[性能测试] ${name}:`);
  console.log(`  总时间: ${duration.toFixed(2)}ms`);
  console.log(`  平均时间: ${avgTime.toFixed(4)}ms`);
  console.log(`  迭代次数: ${iterations}`);

  return { duration, avgTime, iterations };
}

/**
 * 内存泄漏检测（简单版本）
 */
export function checkMemoryUsage() {
  if (global.gc) {
    global.gc();
  }

  const used = process.memoryUsage();
  console.log('[内存使用]');
  console.log(`  堆内存: ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  总堆: ${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  外部: ${(used.external / 1024 / 1024).toFixed(2)} MB`);

  return used;
}

/**
 * 测试快照 - 用于比较复杂对象
 */
export class SnapshotTester {
  constructor() {
    this.snapshots = new Map();
  }

  save(name, data) {
    this.snapshots.set(name, JSON.stringify(data));
  }

  compare(name, data) {
    const saved = this.snapshots.get(name);
    const current = JSON.stringify(data);

    if (saved !== current) {
      throw new Error(`快照不匹配: ${name}\n期望: ${saved}\n实际: ${current}`);
    }

    return true;
  }
}

/**
 * 随机测试数据生成器
 */
export class RandomDataGenerator {
  static number(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static string(length = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static boolean() {
    return Math.random() < 0.5;
  }

  static array(length, generator) {
    return Array.from({ length }, () => generator());
  }

  static pick(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

/**
 * 测试装饰器 - 重复测试
 */
export function repeat(times) {
  return function (target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args) {
      for (let i = 0; i < times; i++) {
        originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * 跳过测试的条件装饰器
 */
export function skipIf(condition) {
  return function (target, propertyKey, descriptor) {
    if (condition) {
      descriptor.value = () => {
        console.log(`跳过测试: ${propertyKey}`);
      };
    }
    return descriptor;
  };
}

/**
 * 测试清理器 - 确保测试后清理资源
 */
export class TestCleaner {
  constructor() {
    this.cleanupFns = [];
  }

  addCleanup(fn) {
    this.cleanupFns.push(fn);
  }

  async cleanup() {
    for (const fn of this.cleanupFns.reverse()) {
      try {
        await fn();
      } catch (error) {
        console.error('清理失败:', error);
      }
    }
    this.cleanupFns = [];
  }
}

/**
 * 断言扩展
 */
export const expectExtended = {
  /**
   * 断言数值在范围内
   */
  toBeInRange(received, min, max) {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () =>
        pass
          ? `期望 ${received} 不在范围 [${min}, ${max}] 内`
          : `期望 ${received} 在范围 [${min}, ${max}] 内`
    };
  },

  /**
   * 断言数组包含元素
   */
  toContainElement(received, element) {
    const pass = received.includes(element);
    return {
      pass,
      message: () =>
        pass
          ? `期望数组不包含 ${JSON.stringify(element)}`
          : `期望数组包含 ${JSON.stringify(element)}`
    };
  },

  /**
   * 断言对象有指定类型
   */
  toBeTypeOf(received, type) {
    const actualType = typeof received;
    const pass = actualType === type;
    return {
      pass,
      message: () =>
        pass
          ? `期望类型不是 ${type}`
          : `期望类型是 ${type}，但得到 ${actualType}`
    };
  }
};
