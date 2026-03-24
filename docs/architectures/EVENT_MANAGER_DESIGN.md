# EventManager 架构设计文档

## 1. 系统概述

### 1.1 目标
EventManager 是一个全局事件管理系统，用于解耦游戏各模块之间的通信。

**核心价值：**
- ✅ 解耦：模块间通过事件通信，减少直接依赖
- ✅ 灵活：支持优先级、一次性监听、异步事件
- ✅ 可维护：统一的事件管理，便于调试和追踪
- ✅ 可测试：基于事件的系统更容易测试

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **单一职责** | EventManager 只负责事件管理，不涉及业务逻辑 |
| **开闭原则** | 对扩展开放（新增事件类型），对修改封闭 |
| **依赖倒置** | 模块依赖抽象的事件接口，而不是具体实现 |
| **接口隔离** | 提供简洁的API，隐藏实现细节 |

---

## 2. 核心接口设计

### 2.1 公共 API

```javascript
class EventManager {
  /**
   * 注册事件监听器
   * @param {string} eventName - 事件名称（如 'battle:start', 'player:levelUp'）
   * @param {Function} callback - 回调函数
   * @param {Object} options - 配置选项
   * @param {number} options.priority - 优先级（默认0，数值越大优先级越高）
   * @param {boolean} options.once - 是否只触发一次（默认false）
   * @returns {Function} 取消订阅函数
   */
  on(eventName, callback, options = {})

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {Object} data - 事件数据
   * @param {boolean} async - 是否异步执行（默认false）
   */
  emit(eventName, data, async = false)

  /**
   * 注销事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(eventName, callback)

  /**
   * 注册一次性监听器
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} options - 配置选项
   * @returns {Function} 取消订阅函数
   */
  once(eventName, callback, options = {})

  /**
   * 清空事件监听器
   * @param {string} eventName - 事件名称（可选，不传则清空所有）
   */
  clear(eventName)
}
```

### 2.2 事件数据结构

```javascript
// 标准事件对象
{
  name: 'battle:start',      // 事件名称
  data: {                     // 事件数据
    enemies: [...],
    dungeon: 'demon_cave'
  },
  timestamp: 1234567890,      // 时间戳
  canceled: false             // 是否被取消
}
```

### 2.3 监听器结构

```javascript
// 监听器对象
{
  callback: Function,         // 回调函数
  priority: 0,                // 优先级
  once: false,                // 是否一次性
  context: null               // 上下文（可选）
}
```

---

## 3. 数据结构设计

### 3.1 存储结构

```javascript
// 使用 Map 存储事件监听器
listeners: Map<string, Listener[]>

// 示例：
{
  'battle:start': [
    { callback: fn1, priority: 10, once: false },
    { callback: fn2, priority: 5, once: true }
  ],
  'player:levelUp': [
    { callback: fn3, priority: 0, once: false }
  ]
}
```

### 3.2 事件队列（异步事件）

```javascript
// 事件队列
eventQueue: Event[]

// 异步处理标志
isProcessing: boolean
```

---

## 4. 核心功能实现

### 4.1 事件注册（on）

**算法流程：**
1. 检查事件名称是否合法
2. 获取或创建监听器数组
3. 创建监听器对象
4. 按优先级插入到正确位置
5. 返回取消订阅函数

**优先级排序：**
```javascript
// 高优先级先执行
listeners.sort((a, b) => b.priority - a.priority)
```

### 4.2 事件触发（emit）

**同步模式：**
```javascript
emit('battle:start', data)
// → 立即执行所有监听器
// → 按优先级顺序执行
// → 一个监听器出错不影响其他
```

**异步模式：**
```javascript
emit('battle:end', data, true)
// → 加入事件队列
// → 使用 processQueue() 异步处理
// → 避免阻塞主线程
```

### 4.3 事件取消

**监听器可以取消事件：**
```javascript
eventManager.on('battle:attack', (event) => {
  if (shouldCancel()) {
    event.canceled = true; // 取消事件
  }
});

// 后续监听器检查取消状态
eventManager.on('battle:attack', (event) => {
  if (event.canceled) return; // 事件已取消
  // 执行逻辑
});
```

### 4.4 错误隔离

**每个监听器独立 try-catch：**
```javascript
listeners.forEach(listener => {
  try {
    listener.callback(event);
  } catch (error) {
    console.error(`事件处理器错误 [${eventName}]:`, error);
    // 继续执行其他监听器
  }
});
```

---

## 5. 性能优化

### 5.1 优先级优化

**问题：** 每次 emit 都要排序会降低性能

**解决方案：** 在 on() 时就维护有序数组
```javascript
// 使用插入排序（对于基本有序的数组效率高）
insertSorted(listeners, newListener);
```

### 5.2 内存优化

**问题：** 大量一次性监听器会占用内存

**解决方案：** 执行后立即移除
```javascript
const toRemove = [];
listeners.forEach(listener => {
  listener.callback(event);
  if (listener.once) {
    toRemove.push(listener);
  }
});
// 批量移除
toRemove.forEach(l => removeListener(l));
```

### 5.3 事件池（可选）

**对于频繁触发的事件：**
```javascript
// 重用事件对象，减少GC
const eventPool = new EventPool();
const event = eventPool.acquire('battle:attack', data);
```

---

## 6. 错误处理

### 6.1 错误类型

```javascript
class EventManagerError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type; // 'INVALID_EVENT_NAME', 'CALLBACK_ERROR', etc.
  }
}
```

### 6.2 错误处理策略

| 错误类型 | 处理方式 |
|---------|---------|
| 无效事件名 | 抛出错误（开发时发现问题） |
| 回调函数错误 | 捕获并记录日志（不影响其他监听器） |
| 重复注册 | 允许（但记录警告） |
| 注销不存在的监听器 | 忽略（静默失败） |

---

## 7. 使用示例

### 7.1 战斗系统集成

**旧代码（直接调用）：**
```javascript
// combatlogic.js
function startBattle(player, enemy) {
  // 初始化战斗
  initBattleScene();

  // 更新UI
  updateBattleUI();

  // 播放音乐
  playBattleMusic();

  // 记录日志
  logBattleStart();
}
```

**新代码（事件驱动）：**
```javascript
// combatlogic.js
function startBattle(player, enemy) {
  // 只负责业务逻辑
  initBattleScene();

  // 触发事件，让其他模块响应
  eventManager.emit('battle:start', { player, enemy });
}

// ui.js
eventManager.on('battle:start', (event) => {
  updateBattleUI(event.data);
});

// audio.js
eventManager.on('battle:start', () => {
  playBattleMusic();
});

// logger.js
eventManager.on('battle:start', (event) => {
  logBattleStart(event.data);
});
```

### 7.2 装备系统集成

```javascript
// 装备穿脱
function equipItem(player, item) {
  // 业务逻辑
  player.equipment[slot] = item;
  recalculateStats(player);

  // 触发事件
  eventManager.emit('equipment:equip', {
    player,
    item,
    slot
  });
}

// 套装效果监听
eventManager.on('equipment:equip', (event) => {
  checkSetBonus(event.data.player);
});

// 成就系统监听
eventManager.on('equipment:equip', (event) => {
  if (event.data.item.quality === 'legendary') {
    unlockAchievement('legendary_collector');
  }
});
```

### 7.3 副本系统集成

```javascript
// 副本开始
eventManager.emit('dungeon:enter', {
  dungeon: dungeonData,
  difficulty: 'hard'
});

// 副本完成
eventManager.emit('dungeon:complete', {
  dungeon: dungeonData,
  rewards: { exp: 1000, gold: 500 },
  time: 120 // 秒
});

// 首通奖励
eventManager.once(`dungeon:firstClear:${dungeonId}`, (event) => {
  grantFirstClearBonus(event.data);
});
```

---

## 8. 事件命名规范

### 8.1 命名约定

**格式：** `模块:动作`

**示例：**
```javascript
// 战斗相关
'battle:start'         // 战斗开始
'battle:end'           // 战斗结束
'battle:attack'        // 攻击
'battle:skill'         // 使用技能
'battle:dodge'         // 闪避

// 玩家相关
'player:levelUp'       // 升级
'player:death'         // 死亡
'player:respawn'       // 复活

// 装备相关
'equipment:equip'      // 穿戴装备
'equipment:unequip'    // 卸下装备
'equipment:refine'     // 精炼装备

// 副本相关
'dungeon:enter'        // 进入副本
'dungeon:complete'     // 完成副本
'dungeon:fail'         // 副本失败

// 系统相关
'system:save'          // 保存数据
'system:load'          // 加载数据
'system:error'         // 系统错误
```

### 8.2 事件数据规范

**统一结构：**
```javascript
{
  // 必需字段
  type: 'battle:start',  // 事件类型
  timestamp: Date.now(), // 时间戳

  // 可选字段（根据事件类型）
  player: {...},         // 相关玩家
  target: {...},         // 目标对象
  value: 100,            // 数值
  // ... 其他业务数据
}
```

---

## 9. 调试和监控

### 9.1 事件日志

```javascript
// 开发环境自动记录事件
if (process.env.NODE_ENV === 'development') {
  eventManager.on('*', (event) => {
    console.log(`[Event] ${event.name}`, event.data);
  });
}
```

### 9.2 性能监控

```javascript
// 监控事件处理时间
eventManager.on('battle:attack', (event) => {
  const start = performance.now();
  // ... 处理逻辑
  const duration = performance.now() - start;
  if (duration > 100) {
    console.warn(`事件处理耗时过长: ${duration}ms`);
  }
});
```

### 9.3 事件统计

```javascript
// 统计事件触发次数
class EventStats {
  constructor() {
    this.stats = new Map();
  }

  record(eventName) {
    this.stats.set(eventName, (this.stats.get(eventName) || 0) + 1);
  }

  getTopEvents(n = 10) {
    return Array.from(this.stats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n);
  }
}
```

---

## 10. 测试策略

### 10.1 单元测试覆盖

- ✅ 事件注册和触发
- ✅ 优先级排序
- ✅ 一次性监听器
- ✅ 事件取消
- ✅ 错误隔离
- ✅ 异步事件队列
- ✅ 边界条件

### 10.2 集成测试

- ✅ 与战斗系统集成
- ✅ 与装备系统集成
- ✅ 与副本系统集成
- ✅ 性能测试

---

## 11. 迁移计划

### 11.1 现有代码迁移步骤

1. **第一阶段**：实现 EventManager 并编写测试
2. **第二阶段**：在战斗系统中试用
3. **第三阶段**：逐步迁移其他模块
4. **第四阶段**：移除旧的直接调用方式

### 11.2 兼容性考虑

**渐进式迁移：**
```javascript
// 保留旧接口，内部使用事件
function startBattle(player, enemy) {
  // 新代码：触发事件
  eventManager.emit('battle:start', { player, enemy });

  // 旧代码：保持兼容（标记为 deprecated）
  // TODO: 下一版本移除
  updateBattleUI();
  playBattleMusic();
}
```

---

## 12. 风险和缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 性能下降 | 中 | 使用优先级插入、事件池 |
| 调试困难 | 低 | 提供事件日志、统计工具 |
| 事件风暴 | 高 | 限制单个事件监听器数量 |
| 循环依赖 | 中 | 事件命名规范、文档说明 |

---

## 13. 总结

EventManager 是一个轻量级、高性能的事件管理系统，核心特性：

- ✅ **简洁API**：on/off/emit/once/clear
- ✅ **优先级支持**：控制监听器执行顺序
- ✅ **错误隔离**：一个监听器出错不影响其他
- ✅ **异步支持**：避免阻塞主线程
- ✅ **可测试**：完整的单元测试覆盖
- ✅ **可扩展**：易于添加新功能

**下一步**：根据此设计文档实现 EventManager 核心类。
