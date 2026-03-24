/**
 * EventManager - 浏览器版本
 * 将src/core/EventManager.js包装为浏览器可用版本
 */

// 导入并暴露为全局变量
import { EventManager, eventManager as eventManagerInstance } from './src/core/EventManager.js';

// 暴露到全局
window.EventManager = EventManager;
window.eventManager = eventManagerInstance;

console.log('✅ EventManager已加载并暴露为全局变量');