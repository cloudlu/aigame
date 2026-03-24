/**
 * 事件系统初始化
 * 创建全局eventManager实例
 */

// 导入EventManager类
const EventManagerClass = typeof window !== 'undefined' ? window.EventManager : null;

// 创建全局eventManager实例
if (typeof window !== 'undefined') {
    // 浏览器环境 - 从src/core/EventManager.js加载
    if (window.EventManager) {
        window.eventManager = new window.EventManager();
        console.log('✅ 全局eventManager已创建');
    } else {
        console.warn('⚠️ EventManager类未加载，事件系统不可用');
        // 创建空的事件管理器，避免报错
        window.eventManager = {
            on: () => {},
            off: () => {},
            emit: () => {},
            once: () => {},
            clear: () => {}
        };
    }
}