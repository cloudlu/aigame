# EventManager 使用示例

## 快速开始

### 基本用法

```javascript
import { eventManager } from './src/core/EventManager.js';

// 1. 注册事件监听器
eventManager.on('battle:start', (event) => {
  console.log('战斗开始！', event.data);
});

// 2. 触发事件
eventManager.emit('battle:start', {
  enemies: [
    { name: '小妖', level: 10 },
    { name: '妖王', level: 15 }
  ]
});
```

---

## 实战示例

### 示例 1：战斗系统集成

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

  // 检查成就
  checkAchievements();
}
```

**新代码（事件驱动）：**
```javascript
// combatlogic.js
import { eventManager } from './src/core/EventManager.js';

function startBattle(player, enemy) {
  // 只负责核心业务逻辑
  initBattleScene();

  // 触发事件，让其他模块响应
  eventManager.emit('battle:start', { player, enemy });
}

// ui.js
eventManager.on('battle:start', (event) => {
  updateBattleUI(event.data.player, event.data.enemy);
});

// audio.js
eventManager.on('battle:start', () => {
  playBattleMusic();
});

// logger.js
eventManager.on('battle:start', (event) => {
  logBattleStart(event.data);
});

// achievement.js
eventManager.on('battle:start', (event) => {
  if (event.data.enemy.level >= 50) {
    unlockAchievement('challenge_seeker');
  }
});
```

**优势：**
- ✅ 战斗逻辑更清晰
- ✅ 模块解耦
- ✅ 易于添加新功能（只需注册监听器）
- ✅ 易于测试

---

### 示例 2：装备系统

```javascript
// equipment.js
import { eventManager } from './src/core/EventManager.js';

function equipItem(player, item, slot) {
  // 核心逻辑
  player.equipment[slot] = item;
  recalculateStats(player);

  // 触发事件
  eventManager.emit('equipment:equip', {
    player,
    item,
    slot
  });
}

function unequipItem(player, slot) {
  const item = player.equipment[slot];
  player.equipment[slot] = null;
  recalculateStats(player);

  // 触发事件
  eventManager.emit('equipment:unequip', {
    player,
    item,
    slot
  });
}

// setBonus.js - 套装效果
eventManager.on('equipment:equip', (event) => {
  const { player, item } = event.data;
  checkSetBonus(player);
});

eventManager.on('equipment:unequip', (event) => {
  const { player } = event.data;
  recalculateSetBonus(player);
});

// achievement.js - 成就系统
eventManager.on('equipment:equip', (event) => {
  const { item } = event.data;

  if (item.quality === 'legendary') {
    unlockAchievement('legendary_collector');
  }

  if (item.level >= 100) {
    unlockAchievement('high_level_equipment');
  }
});

// stats.js - 属性计算
eventManager.on('equipment:equip equipment:unequip', (event) => {
  const { player } = event.data;
  updatePlayerStats(player);
});
```

---

### 示例 3：优先级系统

```javascript
import { eventManager } from './src/core/EventManager.js';

// 高优先级：日志记录（最先执行）
eventManager.on('battle:attack', (event) => {
  logAttack(event.data);
}, { priority: 100 });

// 中优先级：伤害计算
eventManager.on('battle:attack', (event) => {
  const { attacker, defender } = event.data;
  const damage = calculateDamage(attacker, defender);
  defender.takeDamage(damage);
}, { priority: 50 });

// 低优先级：UI更新（最后执行）
eventManager.on('battle:attack', (event) => {
  updateHealthBars();
  showDamageNumber(event.data.damage);
}, { priority: 1 });

// 执行顺序：日志 → 伤害 → UI
```

---

### 示例 4：一次性监听器

```javascript
import { eventManager } from './src/core/EventManager.js';

// 副本首通奖励
eventManager.once('dungeon:firstClear:demon_cave', (event) => {
  grantFirstClearBonus({
    exp: 5000,
    gold: 1000,
    item: 'rare_sword'
  });
});

// 玩家首次达到50级
eventManager.once('player:levelUp:50', (event) => {
  showTutorial('advanced_features');
  grantReward({ jade: 100 });
});
```

---

### 示例 5：事件取消

```javascript
import { eventManager } from './src/core/EventManager.js';

// 护盾效果：取消伤害事件
eventManager.on('battle:damage', (event) => {
  const { target, damage } = event.data;

  if (target.shieldValue > 0) {
    // 护盾吸收伤害
    const absorbed = Math.min(target.shieldValue, damage);
    target.shieldValue -= absorbed;
    event.data.damage -= absorbed;

    // 如果伤害完全被吸收，取消事件
    if (event.data.damage <= 0) {
      event.canceled = true;
      showShieldEffect(target);
    }
  }
}, { priority: 100 }); // 高优先级

// 后续监听器检查取消状态
eventManager.on('battle:damage', (event) => {
  if (event.canceled) return; // 伤害被护盾吸收

  const { target, damage } = event.data;
  target.takeDamage(damage);
  showDamageNumber(target, damage);
});
```

---

### 示例 6：异步事件

```javascript
import { eventManager } from './src/core/EventManager.js';

// 异步保存数据
eventManager.on('system:save', async (event) => {
  await saveToServer(event.data);
  showNotification('保存成功');
});

// 触发异步事件
eventManager.emit('system:save', { playerData }, true); // 第三个参数 true = 异步

// 不会阻塞主线程
console.log('这行代码会立即执行');
```

---

### 示例 7：错误隔离

```javascript
import { eventManager } from './src/core/EventManager.js';

// 即使这个监听器出错
eventManager.on('battle:end', (event) => {
  throw new Error('模拟错误');
});

// 这个监听器仍然会执行
eventManager.on('battle:end', (event) => {
  giveRewards(event.data);
});

// 触发事件
eventManager.emit('battle:end', { victory: true });
// 第一个监听器抛出错误，但第二个监听器仍然执行
```

---

### 示例 8：统计和调试

```javascript
import { eventManager } from './src/core/EventManager.js';

// 启用调试模式
eventManager.setDebug(true);

// 注册监听器
eventManager.on('battle:start', () => {});
eventManager.on('battle:end', () => {});

// 触发事件
eventManager.emit('battle:start', {});
eventManager.emit('battle:end', {});

// 获取统计信息
const stats = eventManager.getStats();
console.log(stats);
// {
//   totalEvents: 2,
//   totalListeners: 2,
//   eventCount: 2
// }

// 查看所有事件名称
const events = eventManager.eventNames();
console.log(events); // ['battle:start', 'battle:end']

// 查看监听器数量
console.log(eventManager.listenerCount('battle:start')); // 1
console.log(eventManager.listenerCount()); // 2
```

---

### 示例 9：取消订阅

```javascript
import { eventManager } from './src/core/EventManager.js';

// 方式1：使用返回的取消函数
const unsubscribe = eventManager.on('test:event', (event) => {
  console.log('触发事件');
});

eventManager.emit('test:event', {}); // 输出：触发事件

unsubscribe(); // 取消订阅

eventManager.emit('test:event', {}); // 不输出

// 方式2：使用 off()
const callback = (event) => {
  console.log('触发事件');
};

eventManager.on('test:event', callback);
eventManager.emit('test:event', {}); // 输出：触发事件

eventManager.off('test:event', callback);
eventManager.emit('test:event', {}); // 不输出
```

---

### 示例 10：复杂业务场景

```javascript
import { eventManager } from './src/core/EventManager.js';

// ===== 副本系统 =====
function enterDungeon(player, dungeon) {
  // 检查条件
  if (!canEnterDungeon(player, dungeon)) {
    return false;
  }

  // 进入副本
  initDungeon(dungeon);

  // 触发事件
  eventManager.emit('dungeon:enter', {
    player,
    dungeon,
    timestamp: Date.now()
  });

  return true;
}

function completeDungeon(player, dungeon, time) {
  // 计算奖励
  const rewards = calculateRewards(dungeon, time);

  // 给予奖励
  giveRewards(player, rewards);

  // 触发事件
  eventManager.emit('dungeon:complete', {
    player,
    dungeon,
    rewards,
    time
  });

  // 检查首通
  if (isFirstClear(player, dungeon)) {
    eventManager.emit(`dungeon:firstClear:${dungeon.id}`, {
      player,
      dungeon
    });
  }
}

// ===== 监听器 =====

// 疲劳度系统
eventManager.on('dungeon:enter', (event) => {
  const { player } = event.data;
  player.fatigue += 10;
});

// 每日任务系统
eventManager.on('dungeon:complete', (event) => {
  updateDailyQuest('dungeon_complete', event.data);
});

// 成就系统
eventManager.on('dungeon:firstClear:*', (event) => {
  unlockAchievement('explorer');
});

// 排行榜系统
eventManager.on('dungeon:complete', (event) => {
  const { player, dungeon, time } = event.data;
  updateLeaderboard(dungeon.id, player.name, time);
});

// 通知系统
eventManager.on('dungeon:firstClear:*', (event) => {
  const { player, dungeon } = event.data;
  broadcastMessage(`${player.name} 首次通关了 ${dungeon.name}！`);
});
```

---

## 事件命名规范

### 推荐格式：`模块:动作`

```javascript
// ✅ 好的命名
'battle:start'           // 战斗开始
'battle:attack'          // 攻击
'player:levelUp'         // 升级
'equipment:equip'        // 穿戴装备
'dungeon:enter'          // 进入副本
'system:save'            // 保存数据

// ❌ 不好的命名
'start'                  // 不清楚是哪个模块
'battleStart'            // 没有使用冒号分隔
'battle-start'           // 应该用冒号，不是短横线
```

### 常用事件列表

| 模块 | 事件名称 | 数据 |
|------|---------|------|
| **战斗** | `battle:start` | `{ player, enemies }` |
| | `battle:end` | `{ victory, rewards }` |
| | `battle:attack` | `{ attacker, target, damage }` |
| | `battle:skill` | `{ caster, skill, targets }` |
| | `battle:dodge` | `{ dodger }` |
| **玩家** | `player:levelUp` | `{ player, oldLevel, newLevel }` |
| | `player:death` | `{ player, killer }` |
| | `player:respawn` | `{ player }` |
| **装备** | `equipment:equip` | `{ player, item, slot }` |
| | `equipment:unequip` | `{ player, item, slot }` |
| | `equipment:refine` | `{ player, item, level }` |
| **副本** | `dungeon:enter` | `{ player, dungeon }` |
| | `dungeon:complete` | `{ player, dungeon, rewards }` |
| | `dungeon:firstClear:{id}` | `{ player, dungeon }` |
| **系统** | `system:save` | `{ playerData }` |
| | `system:load` | `{ playerData }` |
| | `system:error` | `{ error, context }` |

---

## 最佳实践

### 1. 单一职责

```javascript
// ✅ 好：每个监听器只做一件事
eventManager.on('battle:end', (event) => {
  giveRewards(event.data);
});

eventManager.on('battle:end', (event) => {
  updateQuestProgress(event.data);
});

// ❌ 坏：一个监听器做多件事
eventManager.on('battle:end', (event) => {
  giveRewards(event.data);
  updateQuestProgress(event.data);
  checkAchievements(event.data);
  updateLeaderboard(event.data);
});
```

### 2. 使用优先级控制顺序

```javascript
// 高优先级：数据验证
eventManager.on('player:levelUp', validateLevelUp, { priority: 100 });

// 中优先级：核心逻辑
eventManager.on('player:levelUp', applyLevelUp, { priority: 50 });

// 低优先级：副作用（UI、通知等）
eventManager.on('player:levelUp', showLevelUpAnimation, { priority: 1 });
```

### 3. 及时清理监听器

```javascript
// 在组件卸载时清理
class BattleUI {
  constructor() {
    this.unsubscribe = eventManager.on('battle:start', this.onStart.bind(this));
  }

  destroy() {
    this.unsubscribe(); // 清理监听器
  }
}
```

### 4. 错误处理

```javascript
// 监听器内部错误处理
eventManager.on('battle:end', async (event) => {
  try {
    await saveToServer(event.data);
  } catch (error) {
    console.error('保存失败:', error);
    // 不影响其他监听器
  }
});
```

---

## 调试技巧

### 查看所有事件

```javascript
// 启用调试模式
eventManager.setDebug(true);

// 查看所有事件名称
console.log('所有事件:', eventManager.eventNames());

// 查看统计信息
console.log('统计信息:', eventManager.getStats());
```

### 记录所有事件

```javascript
// 全局事件日志（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  eventManager.on('*', (event) => {
    console.log(`[Event] ${event.name}`, event.data);
  });
}
```

---

## 总结

EventManager 是一个强大的事件管理系统，核心优势：

- ✅ **解耦模块**：通过事件通信，减少直接依赖
- ✅ **灵活扩展**：轻松添加新功能（只需注册监听器）
- ✅ **优先级控制**：精确控制执行顺序
- ✅ **错误隔离**：一个监听器出错不影响其他
- ✅ **易于测试**：基于事件的系统更容易测试
- ✅ **性能优化**：支持异步事件，避免阻塞

**下一步**：在实际代码中应用事件系统，逐步重构现有模块。