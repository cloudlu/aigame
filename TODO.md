---


## 📝 设计变更日志

### 2026-03-08: 境界需求配置变更（v1.15）
**变更原因**: 客户需求调整，采用更线性的地图解锁体验

**变更内容**:
- 将境界需求改为按线性路线递进
- 取消原计划的复杂网络连接（保留 `mapConnections` 供未来扩展）
- 新增相邻地图移动限制
- 新增传送系统预留接口

**原设计** (已废弃):
- 多个地图在同一境界解锁（如森林、湖泊同为筑基期）
- 复杂的地图连接网络
- 玩家可以自由移动到任何已解锁地图

**当前实现** (v1.15+):
- 线性递进：每个地图需要比前一个更高的境界
- 相邻地图移动限制：玩家只能移动到当前地图的相邻地图
- 传送点系统：首次访问地图自动解锁传送点，支持快速旅行
- 首次探索奖励：首次到达新地图获得100经验和50灵石奖励

---

## 🗺️ 地图系统设计

**地图系统设计已迁移至专属文档** 👉 **[MAP_SYSTEM_DESIGN.md](MAP_SYSTEM_DESIGN.md)**

该文档包含：
- 地图境界需求配置
- 相邻地图移动限制
- 传送点系统
- 首次访问奖励
- 地图连接系统
- 移动成本设计
- UI设计方案
- 未来扩展计划
- 测试用例

---


---

## 📚 其他 TODO 事项

### 🎯 回合制增强开发计划（2026-2027）

> **设计决策**：保持回合制战斗系统，重点增强策略深度和视觉体验
> **开发策略**：先架构后功能，测试驱动开发（TDD），防止回归bug
> **理由**：回合制更适合修仙题材+碎片化游戏时间+中低端设备用户群
> **参考案例**：《崩坏：星穹铁道》、《阴阳师》、《一念逍遥》

---

## 🧪 测试系统设计（防止回归Bug）

### 测试目标
- ✅ 防止回归bug（同样的bug不出现第二次）
- ✅ 确保新功能不影响现有功能
- ✅ 自动化测试，快速发现问题
- ✅ 覆盖核心系统：战斗、装备、副本

### 测试类型

**1. 单元测试（Unit Tests）**
- 测试单个函数/类的功能
- 例如：伤害计算、套装效果、精炼成功率

**2. 集成测试（Integration Tests）**
- 测试系统间的协作
- 例如：战斗流程、装备穿脱、副本通关

**3. 回归测试（Regression Tests）**
- 确保bug修复后不会再次出现
- 每个 bug 对应一个测试用例

### 测试框架选择
```javascript
// 使用 Jest 作为测试框架
// 安装：npm install --save-dev jest

// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 测试覆盖率目标
- 核心战斗系统：80%+
- 装备系统：70%+
- 副本系统：70%+
- 其他系统：60%+

### 已知Bug回归测试清单
```javascript
// tests/regression/shieldEffect.test.js
// Bug: 闪避后护盾效果消失
test('闪避后护盾效果应该保留', () => {
  const player = createTestPlayer({ shieldValue: 100 });
  player.dodge();
  expect(player.shieldValue).toBe(100);
  expect(player.defenseShield.isVisible).toBe(true);
});

// Bug: 防御和护盾效果混淆
test('防御和护盾是独立的效果', () => {
  const player = createTestPlayer({ defenseActive: true, shieldValue: 100 });
  player.removeDefenseEffect();
  expect(player.defenseEffect).toBeNull();
  expect(player.defenseShield).toBeDefined();
});

// Bug: 敌人被击败后血条不消失
test('敌人被击败后血条应该隐藏', () => {
  const enemy = createTestEnemy();
  enemy.takeDamage(99999);
  enemy.updateHealthBars();
  expect(enemy.healthBar.isVisible).toBe(false);
  expect(enemy.energyBar.isVisible).toBe(false);
});
```

---

#### 第一阶段：基础架构 + 测试框架（2周）⚡ 最高优先级

**任务 1.1: 测试框架搭建**
- [ ] Day 1: 安装和配置 Jest 测试框架
- [ ] Day 2: 创建测试目录结构和测试工具函数
- [ ] Day 3: 编写已知bug的回归测试用例
- [ ] Day 4: 配置测试覆盖率报告
- [ ] Day 5-7: 为现有核心系统补充单元测试

测试目录结构:
```
tests/
  core/
    EventManager.test.js
    DataManager.test.js
  combat/
    CombatEngine.test.js
    damageCalculator.test.js
  equipment/
    EquipmentManager.test.js
    setBonus.test.js
  regression/            # 回归测试
    shieldEffect.test.js
    enemyHealthBar.test.js
  utils/
    TestHelper.js        # 测试工具函数
    MockFactory.js       # Mock对象工厂
```

**任务 1.2: EventManager 事件系统**
- [ ] Day 1-2: 实现核心 EventManager 类
- [ ] Day 3-4: 编写 EventManager 单元测试
- [ ] Day 5-6: 重构现有代码使用事件系统
- [ ] Day 7: 集成测试确保功能不受影响

参考实现:
```javascript
// src/core/EventManager.js
class EventManager {
  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.isProcessing = false;
  }

  /**
   * 注册事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} options - 选项 { priority: 优先级, once: 是否只触发一次 }
   */
  on(eventName, callback, options = {}) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    const listener = {
      callback,
      priority: options.priority || 0,
      once: options.once || false
    };

    this.listeners.get(eventName).push(listener);
    this.listeners.get(eventName).sort((a, b) => b.priority - a.priority);

    return () => this.off(eventName, callback);
  }

  emit(eventName, data, async = false) {
    const event = {
      name: eventName,
      data,
      timestamp: Date.now()
    };

    if (async) {
      this.eventQueue.push(event);
      if (!this.isProcessing) {
        this.processQueue();
      }
    } else {
      this.dispatchEvent(event);
    }
  }

  dispatchEvent(event) {
    const listeners = this.listeners.get(event.name);
    if (!listeners) return;

    const toRemove = [];
    listeners.forEach(listener => {
      try {
        listener.callback(event.data);
        if (listener.once) {
          toRemove.push(listener);
        }
      } catch (error) {
        console.error(`事件处理器错误 [${event.name}]:`, error);
      }
    });

    toRemove.forEach(listener => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    });
  }

  off(eventName, callback) {
    const listeners = this.listeners.get(eventName);
    if (!listeners) return;
    const index = listeners.findIndex(l => l.callback === callback);
    if (index > -1) listeners.splice(index, 1);
  }

  once(eventName, callback, options = {}) {
    return this.on(eventName, callback, { ...options, once: true });
  }

  clear(eventName) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }
}

const eventManager = new EventManager();
module.exports = { EventManager, eventManager };
```

测试代码:
```javascript
// tests/core/EventManager.test.js
const { EventManager } = require('../../src/core/EventManager');

describe('EventManager', () => {
  let eventManager;

  beforeEach(() => {
    eventManager = new EventManager();
  });

  afterEach(() => {
    eventManager.clear();
  });

  test('应该正确注册和触发事件', () => {
    const callback = jest.fn();
    eventManager.on('test', callback);
    eventManager.emit('test', { value: 123 });
    expect(callback).toHaveBeenCalledWith({ value: 123 });
  });

  test('应该支持优先级触发', () => {
    const order = [];
    eventManager.on('test', () => order.push(1), { priority: 1 });
    eventManager.on('test', () => order.push(2), { priority: 3 });
    eventManager.on('test', () => order.push(3), { priority: 2 });
    eventManager.emit('test', {});
    expect(order).toEqual([2, 3, 1]);
  });

  test('once 应该只触发一次', () => {
    const callback = jest.fn();
    eventManager.once('test', callback);
    eventManager.emit('test', {});
    eventManager.emit('test', {});
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

**任务 1.3: 模块化重构**
- [ ] Day 1-2: 重构战斗逻辑到 CombatEngine 模块
- [ ] Day 3-4: 重构装备系统到 EquipmentManager 模块
- [ ] Day 5-6: 编写模块的单元测试
- [ ] Day 7: 集成测试确保功能不受影响

**任务 1.4: 数据持久化优化**
- [ ] Day 1-2: 实现增量保存机制
- [ ] Day 3-4: 添加数据版本控制和迁移
- [ ] Day 5-6: 实现自动备份到 IndexedDB
- [ ] Day 7: 编写数据持久化测试

---

#### 第二阶段：战斗系统核心增强（2-3周）⚡ 高优先级

**任务 2.1: 多敌人战斗系统（1v2-4）**
- [ ] Day 1-2: 修改战斗初始化，支持多敌人配置
- [ ] Day 3-4: 实现敌人行动队列管理
- [ ] Day 5-6: 添加目标选择UI（点击敌人选择攻击目标）
- [ ] Day 7: 平衡性调整
- [ ] Day 8-9: 编写多敌人战斗测试

参考实现:
```javascript
// 副本配置支持多敌人
{
  id: 'demon_cave',
  name: '妖魔洞窟',
  enemies: [
    { type: '小妖', level: 10, position: 'left' },
    { type: '小妖', level: 10, position: 'right' },
    { type: '妖王', level: 15, position: 'center' }
  ]
}

// tests/combat/multiEnemy.test.js
describe('多敌人战斗系统', () => {
  test('应该正确初始化多个敌人', () => {
    const combat = new CombatEngine();
    combat.initBattle(player, [enemy1, enemy2, enemy3]);
    expect(combat.enemies).toHaveLength(3);
  });

  test('敌人应该按速度顺序行动', () => {
    const combat = new CombatEngine();
    combat.initBattle(player, [
      { name: '慢速敌人', speed: 50 },
      { name: '快速敌人', speed: 150 }
    ]);
    const order = combat.calculateTurnOrder();
    expect(order[0].name).toBe('快速敌人');
  });

  test('所有敌人被击败后战斗胜利', () => {
    const combat = new CombatEngine();
    combat.enemies = [
      { isDead: true },
      { isDead: true },
      { isDead: true }
    ];
    expect(combat.checkAllEnemiesDefeated()).toBe(true);
  });
});
```

**任务 2.2: AI队友系统（2-3人小队）**
- [ ] Day 1-2: 队伍管理UI（队友列表、状态显示）
- [ ] Day 3-4: AI队友自动战斗逻辑
- [ ] Day 5: 队友技能配置和策略设置
- [ ] Day 6-7: 队友招募系统（NPC雇佣）
- [ ] Day 8-9: 编写AI队友测试

参考实现:
```javascript
// tests/combat/teammateAI.test.js
describe('AI队友系统', () => {
  test('AI应该优先治疗低血量队友', () => {
    const ai = new TeammateAI({ role: 'healer' });
    const team = [
      { name: '玩家', hp: 100, maxHp: 100 },
      { name: '队友A', hp: 20, maxHp: 100 }
    ];
    const action = ai.chooseAction(team);
    expect(action.type).toBe('heal');
    expect(action.target.name).toBe('队友A');
  });

  test('AI应该攻击玩家选中的目标', () => {
    const ai = new TeammateAI({ role: 'dps' });
    ai.playerTarget = enemy1;
    const action = ai.chooseAction();
    expect(action.target).toBe(enemy1);
  });
});
```

**任务 2.3: 速度条系统（ATB机制）**
- [ ] Day 1-2: 实现速度条UI显示
- [ ] Day 3-4: 根据速度属性计算行动顺序
- [ ] Day 5-6: 添加速度buff/debuff效果
- [ ] Day 7: 平衡性调整
- [ ] Day 8-9: 编写ATB系统测试

参考实现:
```javascript
// tests/combat/atbSystem.test.js
describe('ATB速度条系统', () => {
  test('速度条应该随时间增长', () => {
    const atb = new ATBSystem({ speed: 100 });
    atb.update(1000); // 更新1秒
    expect(atb.speedBar).toBeGreaterThan(0);
  });

  test('高速度角色行动更频繁', () => {
    const fast = new ATBSystem({ speed: 200 });
    const slow = new ATBSystem({ speed: 100 });

    fast.update(1000);
    slow.update(1000);

    expect(fast.speedBar).toBeGreaterThan(slow.speedBar);
  });

  test('速度条满后可以行动', () => {
    const atb = new ATBSystem({ speed: 100 });
    atb.speedBar = 100;
    expect(atb.canAct).toBe(true);
  });
});
```

---

#### 第三阶段：策略深度增强（1-2周）⚡ 高优先级

**任务 3.1: 技能组合系统**
- [ ] Day 1-2: 设计组合技能配方
- [ ] Day 3-4: 实现连招判定和效果触发
- [ ] Day 5-6: 添加连招提示UI
- [ ] Day 7: 平衡性调整
- [ ] Day 8-9: 编写技能组合测试

**任务 3.2: 装备套装效果**
- [ ] Day 1-2: 套装配置数据结构
- [ ] Day 3-4: 套装效果触发和计算
- [ ] Day 5-6: 套装UI显示
- [ ] Day 7: 套装收集成就
- [ ] Day 8-9: 编写套装效果测试

参考实现:
```javascript
// tests/equipment/setBonus.test.js
describe('装备套装效果', () => {
  test('应该正确计算套装数量', () => {
    const equipment = [
      { set: '烈焰套装' },
      { set: '烈焰套装' },
      { set: '其他套装' }
    ];
    const bonus = calculateSetBonus(equipment);
    expect(bonus).toContainEqual({
      set: '烈焰套装',
      pieces: 2,
      bonus: { attack: 100 }
    });
  });

  test('没有套装应该不触发效果', () => {
    const equipment = [
      { set: '套装A' },
      { set: '套装B' }
    ];
    const bonus = calculateSetBonus(equipment);
    expect(bonus).toHaveLength(0);
  });
});
```

**任务 3.3: 战前策略系统**
- [ ] Day 1-2: 战前配置UI
- [ ] Day 3-4: 战术预设系统
- [ ] Day 5-6: 战斗配置保存
- [ ] Day 7: 测试和优化

---

#### 第四阶段：视觉效果增强（1周）🎨 中优先级

**任务 4.1: 华丽战斗动画**
- [ ] Day 1-2: 必杀技演出动画
- [ ] Day 3-4: 技能特效升级
- [ ] Day 5-6: 角色受击动画
- [ ] Day 7: BOSS死亡动画优化

**任务 4.2: 战斗数字动画**
- [ ] Day 1-2: 浮动伤害数字
- [ ] Day 3: 暴击数字放大+震动
- [ ] Day 4-5: 治疗数字动画
- [ ] Day 6-7: Buff/Debuff图标动画

**任务 4.3: UI动画优化**
- [ ] Day 1-2: 面板滑入滑出效果
- [ ] Day 3-4: 技能冷却动画
- [ ] Day 5-6: 状态栏平滑变化
- [ ] Day 7: 点击反馈动画

---

#### 第五阶段：内容扩展（2周）📦 中优先级

**任务 5.1: 新增副本类型**
- [ ] Day 1-3: 仙缘秘境（随机事件副本）
- [ ] Day 4-6: 炼器洞府（装备材料副本）
- [ ] Day 7-10: 试炼之塔（无限层级）
- [ ] Day 11-14: 副本首通奖励优化
- [ ] Day 15-16: 编写新副本测试

**任务 5.2: 装备打造系统**
- [ ] Day 1-3: 打造配方数据
- [ ] Day 4-6: 材料收集系统
- [ ] Day 7-10: 打造界面UI
- [ ] Day 11-14: 品质随机机制和保底系统
- [ ] Day 15-16: 编写打造系统测试

---

#### 第六阶段：系统优化（1周）⚙️ 低优先级

**任务 6.1: 自动战斗优化**
- [ ] Day 1-2: 智能技能选择AI
- [ ] Day 3-4: 自动战斗速度调节
- [ ] Day 5-6: 自动战斗策略配置
- [ ] Day 7: 挂机收益优化

**任务 6.2: 新手引导完善**
- [ ] Day 1-2: 交互式教程系统
- [ ] Day 3-4: 引导步骤设计
- [ ] Day 5-6: 元素高亮和提示
- [ ] Day 7: 新手礼包和首充奖励

---

#### 开发时间表（10-12周）

| 周次 | 阶段 | 主要任务 | 测试任务 | 预期成果 |
|------|------|---------|---------|---------|
| 第1-2周 | 基础架构 | EventManager + 模块化 | 测试框架 + 回归测试 | 架构基础 + 测试系统 |
| 第3-5周 | 战斗核心 | 多敌人 + AI队友 + ATB | 战斗系统测试 | 1vN战斗系统 |
| 第6-7周 | 策略深度 | 技能组合 + 套装 | 策略系统测试 | 组合技、套装效果 |
| 第8周 | 视觉效果 | 战斗动画 | - | 华丽演出 |
| 第9-10周 | 内容扩展 | 新副本 + 打造 | 内容测试 | 新副本类型 |
| 第11-12周 | 系统优化 | 自动战斗 + 引导 | - | 体验优化 |

---

#### 优先级排序（带测试）

**🚀 立即开始（P0）- 必须有测试：**
1. 测试框架搭建 ⭐⭐⭐
2. 已知bug回归测试 ⭐⭐⭐
3. EventManager 事件系统 ⭐⭐⭐
4. 模块化重构 ⭐⭐

**⚡ 尽快完成（P1）- 核心功能 + 测试：**
5. 多敌人战斗系统 + 测试
6. AI队友系统 + 测试
7. 速度条系统（ATB）+ 测试
8. 技能组合系统 + 测试
9. 装备套装效果 + 测试

**📅 计划中（P2）- 功能为主：**
10. 华丽战斗动画
11. 战斗数字动画
12. 新增副本类型 + 测试
13. 装备打造系统 + 测试

**🕐 有时间再做（P3）：**
14. 自动战斗优化
15. 新手引导完善

---

#### 测试驱动开发流程（TDD）

**每个功能的标准开发流程：**

1. **编写测试用例**（先写测试）
   ```javascript
   test('功能应该正确工作', () => {
     // 预期行为
   });
   ```

2. **运行测试**（应该失败）
   ```bash
   npm test
   # ❌ 测试失败
   ```

3. **编写功能代码**（让测试通过）
   ```javascript
   function feature() {
     // 实现功能
   }
   ```

4. **运行测试**（应该通过）
   ```bash
   npm test
   # ✅ 测试通过
   ```

5. **重构优化**（保持测试通过）
   ```javascript
   // 优化代码
   ```

6. **提交代码**（包含测试）
   ```bash
   git commit -m "feat: 新功能 + 测试"
   ```

---

#### Bug修复流程（防止回归）

**每次修复bug必须：**

1. **编写失败测试**（重现bug）
   ```javascript
   test('Bug: 闪避后护盾消失', () => {
     // 重现bug
     const player = createPlayer({ shieldValue: 100 });
     player.dodge();
     expect(player.shieldValue).toBe(100); // ❌ 当前会失败
   });
   ```

2. **修复bug**
   ```javascript
   // 修复代码
   ```

3. **确认测试通过**
   ```bash
   npm test
   # ✅ 测试通过
   ```

4. **添加到回归测试套件**
   ```
   tests/regression/bug-shield-dodge.test.js
   ```

5. **永远保留这个测试**（防止bug再次出现）

---

