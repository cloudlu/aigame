/**
 * EventManager - 全局事件管理系统
 *
 * 功能：
 * - 事件注册和触发
 * - 优先级队列
 * - 一次性监听器
 * - 异步事件处理
 * - 错误隔离
 */

/**
 * 自定义错误类
 */
class EventManagerError extends Error {
  constructor(type, message) {
    super(message);
    this.name = 'EventManagerError';
    this.type = type;
  }
}

/**
 * EventManager 核心类
 */
export class EventManager {
  constructor() {
    // 事件监听器存储（Map<eventName, Listener[]>）
    this.listeners = new Map();

    // 异步事件队列
    this.eventQueue = [];

    // 是否正在处理队列
    this.isProcessing = false;

    // 调试模式
    this.debug = false;

    // 事件统计
    this.stats = {
      totalEvents: 0,
      totalListeners: 0
    };
  }

  /**
   * 注册事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} options - 配置选项
   * @param {number} options.priority - 优先级（默认0，数值越大优先级越高）
   * @param {boolean} options.once - 是否只触发一次（默认false）
   * @returns {Function} 取消订阅函数
   */
  on(eventName, callback, options = {}) {
    // 参数验证
    this._validateEventName(eventName);
    this._validateCallback(callback);

    // 创建监听器对象
    const listener = {
      callback,
      priority: options.priority || 0,
      once: options.once || false,
      context: options.context || null
    };

    // 获取或创建监听器数组
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    const listeners = this.listeners.get(eventName);

    // 按优先级插入（保持有序）
    this._insertSorted(listeners, listener);

    // 更新统计
    this.stats.totalListeners++;

    // 调试日志
    if (this.debug) {
      console.log(`[EventManager] 注册监听器: ${eventName}, 优先级: ${listener.priority}`);
    }

    // 返回取消订阅函数
    return () => this.off(eventName, callback);
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {Object} data - 事件数据
   * @param {boolean} async - 是否异步执行（默认false）
   */
  emit(eventName, data = {}, async = false) {
    // 参数验证
    this._validateEventName(eventName);

    // 创建事件对象
    const event = {
      name: eventName,
      data,
      timestamp: Date.now(),
      canceled: false
    };

    // 更新统计
    this.stats.totalEvents++;

    // 调试日志
    if (this.debug) {
      console.log(`[EventManager] 触发事件: ${eventName}`, data);
    }

    if (async) {
      // 异步模式：加入队列
      this.eventQueue.push(event);
      if (!this.isProcessing) {
        this._processQueue();
      }
    } else {
      // 同步模式：立即执行
      this._dispatchEvent(event);
    }
  }

  /**
   * 注销事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(eventName, callback) {
    // 参数验证
    this._validateEventName(eventName);
    this._validateCallback(callback);

    const listeners = this.listeners.get(eventName);
    if (!listeners) return;

    // 查找并移除监听器
    const index = listeners.findIndex(l => l.callback === callback);
    if (index > -1) {
      listeners.splice(index, 1);
      this.stats.totalListeners--;

      if (this.debug) {
        console.log(`[EventManager] 注销监听器: ${eventName}`);
      }
    }

    // 如果没有监听器了，移除整个事件
    if (listeners.length === 0) {
      this.listeners.delete(eventName);
    }
  }

  /**
   * 注册一次性监听器
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} options - 配置选项
   * @returns {Function} 取消订阅函数
   */
  once(eventName, callback, options = {}) {
    return this.on(eventName, callback, { ...options, once: true });
  }

  /**
   * 清空事件监听器
   * @param {string} eventName - 事件名称（可选，不传则清空所有）
   */
  clear(eventName) {
    if (eventName) {
      // 清空指定事件
      const listeners = this.listeners.get(eventName);
      if (listeners) {
        this.stats.totalListeners -= listeners.length;
        this.listeners.delete(eventName);
      }

      if (this.debug) {
        console.log(`[EventManager] 清空事件: ${eventName}`);
      }
    } else {
      // 清空所有事件
      this.listeners.clear();
      this.stats.totalListeners = 0;

      if (this.debug) {
        console.log('[EventManager] 清空所有事件');
      }
    }
  }

  /**
   * 获取事件监听器数量
   * @param {string} eventName - 事件名称（可选）
   * @returns {number} 监听器数量
   */
  listenerCount(eventName) {
    if (eventName) {
      const listeners = this.listeners.get(eventName);
      return listeners ? listeners.length : 0;
    }
    return this.stats.totalListeners;
  }

  /**
   * 获取所有事件名称
   * @returns {string[]} 事件名称列表
   */
  eventNames() {
    return Array.from(this.listeners.keys());
  }

  /**
   * 设置调试模式
   * @param {boolean} enabled - 是否启用
   */
  setDebug(enabled) {
    this.debug = enabled;
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      eventCount: this.listeners.size
    };
  }

  // ========== 私有方法 ==========

  /**
   * 分发事件到监听器
   * @private
   */
  _dispatchEvent(event) {
    const listeners = this.listeners.get(event.name);
    if (!listeners || listeners.length === 0) return;

    // 收集需要移除的一次性监听器
    const toRemove = [];

    // 遍历并执行监听器
    for (const listener of listeners) {
      // 检查事件是否被取消
      if (event.canceled) {
        break;
      }

      try {
        // 执行回调
        if (listener.context) {
          listener.callback.call(listener.context, event);
        } else {
          listener.callback(event);
        }

        // 标记一次性监听器
        if (listener.once) {
          toRemove.push(listener);
        }
      } catch (error) {
        console.error(`[EventManager] 事件处理器错误 [${event.name}]:`, error);

        // 在开发环境下抛出错误
        if (process.env.NODE_ENV === 'development') {
          throw new EventManagerError('CALLBACK_ERROR', error.message);
        }
      }
    }

    // 移除一次性监听器
    if (toRemove.length > 0) {
      for (const listener of toRemove) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
          this.stats.totalListeners--;
        }
      }

      // 如果没有监听器了，移除整个事件
      if (listeners.length === 0) {
        this.listeners.delete(event.name);
      }
    }
  }

  /**
   * 处理异步事件队列
   * @private
   */
  async _processQueue() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      this._dispatchEvent(event);

      // 让出执行权，避免阻塞
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    this.isProcessing = false;
  }

  /**
   * 按优先级插入监听器（保持数组有序）
   * @private
   */
  _insertSorted(listeners, newListener) {
    // 使用二分查找确定插入位置
    let left = 0;
    let right = listeners.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (listeners[mid].priority >= newListener.priority) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    listeners.splice(left, 0, newListener);
  }

  /**
   * 验证事件名称
   * @private
   */
  _validateEventName(eventName) {
    if (typeof eventName !== 'string') {
      throw new EventManagerError(
        'INVALID_EVENT_NAME',
        `事件名称必须是字符串，但得到: ${typeof eventName}`
      );
    }

    if (eventName.length === 0) {
      throw new EventManagerError('INVALID_EVENT_NAME', '事件名称不能为空');
    }

    // 建议使用 module:action 格式
    if (!eventName.includes(':') && this.debug) {
      console.warn(
        `[EventManager] 建议使用 "module:action" 格式的事件名称，当前: ${eventName}`
      );
    }
  }

  /**
   * 验证回调函数
   * @private
   */
  _validateCallback(callback) {
    if (typeof callback !== 'function') {
      throw new EventManagerError(
        'INVALID_CALLBACK',
        `回调必须是函数，但得到: ${typeof callback}`
      );
    }
  }
}

// 创建全局单例
export const eventManager = new EventManager();

// 默认导出
export default EventManager;
