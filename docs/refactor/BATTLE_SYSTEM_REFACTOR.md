# 战斗系统事件化重构计划

## 1. 当前架构分析

### 1.1 现有问题

**耦合度高：**
```javascript
// combatlogic.js
function attackEnemy() {
  // 业务逻辑
  calculateDamage();

  // 直接调用UI更新
  this.showDamage();        // ❌ 耦合
  this.addBattleLog();      // ❌ 耦合
  this.updateHealthBars();  // ❌ 耦合

  // 直接调用音效
  this.playSound('hit');    // ❌ 耦合

  // 直接调用动画
  this.playAnimation();     // ❌ 耦合
}
```

**难以测试：**
- 想测试伤害计算，必须mock所有UI函数
- 想测试战斗流程，必须mock音效、动画等

**难以扩展：**
- 想添加成就系统，需要修改战斗代码
- 想添加排行榜，需要修改战斗代码

### 1.2 目标架构

**事件驱动：**
```javascript
// combatlogic.js
function attackEnemy() {
  // 只负责业务逻辑
  const damage = calculateDamage();

  // 触发事件
  eventManager.emit('battle:attack', {
    attacker: player,
    target: enemy,
    damage
  });
}

// ui.js
eventManager.on('battle:attack', (event) => {
  showDamage(event.data.damage);
  updateHealthBars();
});

// audio.js
eventManager.on('battle:attack', () => {
  playSound('hit');
});

// achievement.js
eventManager.on('battle:attack', (event) => {
  if (event.data.damage > 10000) {
    unlockAchievement('heavy_hitter');
  }
});
```

**优势：**
- ✅ 解耦：模块通过事件通信
- ✅ 可测试：测试业务逻辑不需要mock UI
- ✅ 可扩展：添加功能只需注册监听器

---

## 2. 重构计划

### 2.1 第一阶段：创建事件系统（已完成）✅

- ✅ 实现 EventManager
- ✅ 编写单元测试
- ✅ 创建使用文档

### 2.2 第二阶段：战斗系统重构

#### 2.2.1 定义战斗事件

```javascript
// 战斗生命周期事件
'battle:init'          // 初始化战斗场景
'battle:start'         // 战斗开始
'battle:turnStart'     // 回合开始
'battle:playerAction'  // 玩家行动
'battle:enemyAction'   // 敌人行动
'battle:attack'        // 攻击事件
'battle:skill'         // 技能事件
'battle:dodge'         // 闪避事件
'battle:defend'        // 防御事件
'battle:turnEnd'       // 回合结束
'battle:end'           // 战斗结束

// 伤害相关事件
'battle:damage'        // 造成伤害
'battle:heal'          // 治疗
'battle:crit'          // 暴击

// 状态变化事件
'battle:buff'          // 添加buff
'battle:debuff'        // 添加debuff
'battle:death'         // 角色死亡
```

#### 2.2.2 重构顺序（按优先级）

**Step 1: 简单函数（低风险）**
1. `addBattleLog()` → 事件化
2. `playBattleSound()` → 事件化
3. `showDamage()` → 事件化

**Step 2: 核心流程（中风险）**
1. `attackEnemy()` → 事件化攻击流程
2. `useSkill()` → 事件化技能流程
3. `endBattle()` → 事件化结束流程

**Step 3: 复杂流程（高风险）**
1. `startBattle()` → 事件化初始化
2. 自动战斗系统 → 事件化

#### 2.2.3 每个函数的重构步骤

**模板：**

```javascript
// 1. 保留原函数的核心逻辑
function originalFunction() {
  // 核心业务逻辑
  const result = doBusinessLogic();

  // 2. 触发事件（新增）
  eventManager.emit('module:action', {
    result,
    // ...其他数据
  });

  // 3. 保留旧调用（兼容期）
  // TODO: 下一版本移除
  this.updateUI();
}

// 4. 创建事件监听器（新文件或同一文件）
eventManager.on('module:action', (event) => {
  // 原 UI 逻辑
});

// 5. 添加测试
test('事件应该正确触发', () => {
  const callback = vi.fn();
  eventManager.on('module:action', callback);

  originalFunction();

  expect(callback).toHaveBeenCalled();
});
```

---

## 3. 详细重构计划

### 3.1 addBattleLog() 重构

**当前代码：**
```javascript
// game.js
addBattleLog(message) {
  const logDiv = document.getElementById('battle-log');
  if (logDiv) {
    const entry = document.createElement('div');
    entry.textContent = message;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
  }
}
```

**重构后：**
```javascript
// game.js
addBattleLog(message) {
  // 触发事件
  eventManager.emit('battle:log', { message });

  // 保留旧逻辑（兼容）
  const logDiv = document.getElementById('battle-log');
  if (logDiv) {
    const entry = document.createElement('div');
    entry.textContent = message;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
  }
}

// ui.js（新建）
eventManager.on('battle:log', (event) => {
  const { message } = event.data;
  const logDiv = document.getElementById('battle-log');
  if (logDiv) {
    const entry = document.createElement('div');
    entry.textContent = message;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
  }
});
```

**测试：**
```javascript
// tests/combat/battleLog.test.js
describe('战斗日志事件', () => {
  test('应该触发 battle:log 事件', () => {
    const callback = vi.fn();
    eventManager.on('battle:log', callback);

    game.addBattleLog('测试日志');

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { message: '测试日志' }
      })
    );
  });
});
```

---

### 3.2 showDamage() 重构

**当前代码：**
```javascript
// models.js
showDamage(target, value, type = 'normal') {
  // 创建3D浮动文字
  const textMesh = this.createFloatingText(value, type);
  // 动画效果
  this.animateText(textMesh, { y: 2, alpha: 0 });
}
```

**重构后：**
```javascript
// models.js
showDamage(target, value, type = 'normal') {
  // 触发事件
  eventManager.emit('battle:damage', {
    target,
    value,
    type
  });

  // 保留旧逻辑（兼容）
  const textMesh = this.createFloatingText(value, type);
  this.animateText(textMesh, { y: 2, alpha: 0 });
}

// effects.js（新建）
eventManager.on('battle:damage', (event) => {
  const { target, value, type } = event.data;
  // 3D特效逻辑
  createDamageNumber(value, target.position, type);
});
```

---

### 3.3 attackEnemy() 重构（核心）

**当前代码结构：**
```javascript
attackEnemy() {
  // 1. 计算
  const damage = calculateDamage();
  const hit = checkHit();

  // 2. 播放动画
  this.playAttackAnimation(() => {
    // 3. 应用伤害
    enemy.hp -= damage;

    // 4. UI更新
    this.showDamage(enemy, damage);
    this.addBattleLog('造成伤害');
    this.updateHealthBars();

    // 5. 检查结束
    if (enemy.hp <= 0) {
      this.endBattle();
    }

    // 6. 敌人回合
    this.enemyTurn();
  });
}
```

**重构后：**
```javascript
attackEnemy() {
  // 1. 计算（核心逻辑）
  const { damage, hit, crit } = this.calculateAttack();

  // 2. 触发事件
  eventManager.emit('battle:playerAction', {
    type: 'attack',
    attacker: this.player,
    target: this.enemy,
    damage,
    hit,
    crit
  });

  // 3. 播放动画（保留）
  this.playAttackAnimation(() => {
    // 4. 应用伤害（核心逻辑）
    if (hit) {
      this.enemy.hp -= damage;

      // 5. 触发伤害事件
      eventManager.emit('battle:damage', {
        target: this.enemy,
        value: damage,
        type: crit ? 'crit' : 'normal'
      });

      // 6. 检查死亡
      if (this.enemy.hp <= 0) {
        eventManager.emit('battle:death', {
          target: this.enemy
        });
        this.endBattle(true);
        return;
      }
    }

    // 7. 敌人回合
    this.enemyTurn();
  });
}

// ui.js
eventManager.on('battle:playerAction', (event) => {
  const { hit, damage, crit } = event.data;

  if (hit) {
    const message = crit
      ? `💥暴击！造成${damage}点伤害！`
      : `造成${damage}点伤害`;
    game.addBattleLog(message);
  } else {
    game.addBattleLog('攻击未命中');
  }
});

eventManager.on('battle:damage', (event) => {
  const { target, value, type } = event.data;
  game.showDamage(target, value, type);
  game.updateHealthBars();
});

eventManager.on('battle:death', (event) => {
  const { target } = event.data;
  game.addBattleLog(`${target.name}被击败！`);
  // 播放死亡动画
});
```

---

## 4. 测试策略

### 4.1 单元测试（每个事件）

```javascript
// tests/combat/attackEvent.test.js
describe('attackEnemy 事件', () => {
  test('应该触发 battle:playerAction 事件', () => {
    const callback = vi.fn();
    eventManager.on('battle:playerAction', callback);

    game.attackEnemy();

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'attack',
          damage: expect.any(Number),
          hit: expect.any(Boolean)
        })
      })
    );
  });

  test('命中时应该触发 battle:damage 事件', () => {
    const damageCallback = vi.fn();
    eventManager.on('battle:damage', damageCallback);

    // Mock 必定命中
    game.calculateAttack = () => ({
      damage: 100,
      hit: true,
      crit: false
    });

    game.attackEnemy();
    // 等待动画完成
    await sleep(1000);

    expect(damageCallback).toHaveBeenCalled();
  });
});
```

### 4.2 集成测试（整个流程）

```javascript
// tests/combat/battleFlow.test.js
describe('战斗流程', () => {
  test('完整的攻击流程应该触发正确的事件序列', async () => {
    const events = [];

    eventManager.on('battle:playerAction', (e) => events.push(e.name));
    eventManager.on('battle:damage', (e) => events.push(e.name));
    eventManager.on('battle:death', (e) => events.push(e.name));
    eventManager.on('battle:end', (e) => events.push(e.name));

    // 一击必杀
    game.enemy.hp = 1;
    game.attackEnemy();

    await sleep(1000);

    expect(events).toEqual([
      'battle:playerAction',
      'battle:damage',
      'battle:death',
      'battle:end'
    ]);
  });
});
```

---

## 5. 迁移计划

### 5.1 阶段 1：并行运行（当前）

```javascript
function oldFunction() {
  // 新代码：触发事件
  eventManager.emit('event', data);

  // 旧代码：直接调用（保留）
  updateUI();
}
```

**目的：** 确保新事件系统正常工作，旧代码仍然可用

### 5.2 阶段 2：切换监听器

```javascript
function oldFunction() {
  eventManager.emit('event', data);
  // 旧代码注释掉
  // updateUI(); // TODO: 移除
}

// 新建监听器文件
// ui.js
eventManager.on('event', (e) => {
  updateUI(e.data);
});
```

**目的：** 验证事件监听器能替代旧代码

### 5.3 阶段 3：移除旧代码

```javascript
function newFunction() {
  // 只保留事件触发
  eventManager.emit('event', data);
}
```

**目的：** 完全迁移到事件驱动

---

## 6. 风险控制

### 6.1 回滚策略

- ✅ 每个重构点都可以单独回滚
- ✅ 保留旧代码（注释）
- ✅ 完整的测试覆盖

### 6.2 验证检查点

**每次重构后检查：**
- ✅ 所有现有测试通过
- ✅ 新事件测试通过
- ✅ 游戏功能正常（手动测试）
- ✅ 性能无明显下降

---

## 7. 实施时间表

| 任务 | 预计时间 | 优先级 |
|------|---------|--------|
| 重构 addBattleLog | 30分钟 | P0 |
| 重构 showDamage | 30分钟 | P0 |
| 重构 attackEnemy | 2小时 | P0 |
| 重构 useSkill | 2小时 | P1 |
| 重构 endBattle | 1小时 | P1 |
| 重构 startBattle | 1小时 | P2 |
| 添加集成测试 | 1小时 | P1 |

**总计：** 约8小时

---

## 8. 成功标准

- ✅ 所有现有功能正常
- ✅ 测试覆盖率 > 70%
- ✅ 事件系统测试通过
- ✅ 性能无明显下降
- ✅ 代码更清晰、更易维护

---

**开始实施：** 先从简单的 `addBattleLog` 开始，逐步推进。
