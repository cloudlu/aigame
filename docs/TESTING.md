# 测试框架使用指南

## 概述

本项目使用 **Vitest** 作为测试框架，用于：
- ✅ 单元测试（函数级别）
- ✅ 集成测试（系统级别）
- ✅ 回归测试（防止bug重现）

## 快速开始

### 运行所有测试
```bash
npm test
```

### 运行特定测试文件
```bash
npx vitest run tests/regression/shieldEffect.test.js
```

### 监听模式（开发时使用）
```bash
npm run test:watch
```

### 生成测试覆盖率报告
```bash
npm run test:coverage
```

## 测试目录结构

```
tests/
├── core/              # 核心系统测试
│   ├── EventManager.test.js
│   └── DataManager.test.js
├── combat/            # 战斗系统测试
│   ├── CombatEngine.test.js
│   └── damageCalculator.test.js
├── equipment/         # 装备系统测试
│   ├── EquipmentManager.test.js
│   └── setBonus.test.js
├── regression/        # 回归测试（防止bug重现）
│   ├── shieldEffect.test.js
│   └── enemyHealthBar.test.js
├── utils/             # 测试工具函数
│   ├── MockFactory.js
│   └── TestHelper.js
└── dungeon/           # 副本系统测试
```

## 编写测试

### 基本测试结构

```javascript
import { describe, test, expect } from 'vitest';
import { createTestPlayer } from '../utils/MockFactory.js';

describe('测试套件名称', () => {
  test('测试用例描述', () => {
    // 准备（Arrange）
    const player = createTestPlayer({ hp: 1000 });

    // 执行（Act）
    player.takeDamage(100);

    // 断言（Assert）
    expect(player.hp).toBe(900);
  });
});
```

### 使用 Mock 工厂

```javascript
import {
  createTestPlayer,
  createTestEnemy,
  createTestSkill
} from '../utils/MockFactory.js';

// 创建默认玩家
const player = createTestPlayer();

// 创建自定义属性玩家
const player = createTestPlayer({
  name: '高级玩家',
  level: 50,
  hp: 10000
});

// 创建敌人
const enemy = createTestEnemy({ level: 20, hp: 2000 });

// 创建技能
const skill = createTestSkill({ multiplier: 3.0 });
```

### 常用断言

```javascript
// 相等
expect(value).toBe(expected);

// 深度相等
expect(object).toEqual({ a: 1, b: 2 });

// 布尔值
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// 包含
expect(array).toContain(element);
expect(string).toContain('substring');

// 数值比较
expect(value).toBeGreaterThan(10);
expect(value).toBeLessThan(100);

// 类型检查
expect(value).toBeDefined();
expect(value).toBeNull();
expect(value).toBeInstanceOf(Class);

// 异常
expect(() => fn()).toThrow(Error);
```

### 异步测试

```javascript
test('异步测试', async () => {
  const result = await asyncFunction();
  expect(result).toBe('success');
});
```

### 测试前后操作

```javascript
describe('测试套件', () => {
  let player;

  beforeEach(() => {
    // 每个测试前执行
    player = createTestPlayer();
  });

  afterEach(() => {
    // 每个测试后执行
    player = null;
  });

  test('测试1', () => {
    // player 已经初始化好了
  });
});
```

## 回归测试

回归测试用于确保已修复的bug不会再次出现。

### 如何添加回归测试

1. **发现Bug**：例如"闪避后护盾消失"

2. **编写测试**（重现bug）：
```javascript
test('Bug修复：闪避后护盾效果应该保留', () => {
  const player = createTestPlayer({ shieldValue: 100 });

  player.dodge();

  // 如果bug存在，这个断言会失败
  expect(player.shieldValue).toBe(100);
  expect(player.defenseShield.isVisible).toBe(true);
});
```

3. **运行测试**（应该失败）：
```bash
npm test
# ❌ 测试失败（bug存在）
```

4. **修复Bug**：修改源代码

5. **再次运行测试**（应该通过）：
```bash
npm test
# ✅ 测试通过（bug已修复）
```

6. **保留测试**：永远不要删除回归测试，防止bug重现

## 测试驱动开发（TDD）流程

1. **红灯**：先写失败的测试
2. **绿灯**：写最简单的代码让测试通过
3. **重构**：优化代码，保持测试通过

### 示例

```javascript
// 1. 红灯：写测试
test('伤害计算应该考虑防御', () => {
  const attacker = { attack: 100 };
  const defender = { defense: 50 };
  const damage = calculateDamage(attacker, defender);
  expect(damage).toBeLessThan(100); // 有防御减伤
});

// 2. 绿灯：实现功能
function calculateDamage(attacker, defender) {
  const reduction = defender.defense / (defender.defense + 100);
  return attacker.attack * (1 - reduction);
}

// 3. 重构：优化代码（可选）
```

## 测试覆盖率

### 查看覆盖率报告

```bash
npm run test:coverage
```

### 覆盖率目标

| 系统类型 | 目标覆盖率 |
|---------|-----------|
| 核心战斗系统 | 80%+ |
| 装备系统 | 70%+ |
| 副本系统 | 70%+ |
| 其他系统 | 60%+ |

### 覆盖率报告位置

运行 `npm run test:coverage` 后，打开：
```
coverage/index.html
```

查看详细的覆盖率报告。

## 测试最佳实践

### ✅ DO（应该做的）

1. **测试行为，而不是实现**
   ```javascript
   // ✅ 好：测试行为
   test('玩家受伤后HP应该减少', () => {
     player.takeDamage(100);
     expect(player.hp).toBe(900);
   });

   // ❌ 坏：测试实现细节
   test('takeDamage应该调用内部方法', () => {
     // ...
   });
   ```

2. **使用描述性的测试名称**
   ```javascript
   // ✅ 好
   test('当HP为0时，玩家应该被标记为死亡', () => {});

   // ❌ 坏
   test('test1', () => {});
   ```

3. **一个测试只测一个功能**
   ```javascript
   // ✅ 好
   test('伤害计算应该考虑暴击', () => {});
   test('伤害计算应该考虑防御', () => {});

   // ❌ 坏
   test('伤害计算', () => {
     // 测试暴击、防御、闪避、元素克制...
   });
   ```

4. **使用 Mock 工厂创建测试数据**
   ```javascript
   // ✅ 好
   const player = createTestPlayer({ hp: 100 });

   // ❌ 坏
   const player = {
     name: '测试玩家',
     hp: 100,
     // ... 手动创建大量属性
   };
   ```

### ❌ DON'T（不应该做的）

1. **不要测试私有方法**
2. **不要在测试中使用 `setTimeout`（使用 `sleep` 工具函数）**
3. **不要依赖测试执行顺序**
4. **不要在测试中修改全局状态**

## 持续集成（CI）

在 CI/CD 流程中自动运行测试：

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

## 故障排查

### 测试失败怎么办？

1. **阅读错误信息**：Vitest 会显示详细的错误信息
2. **检查断言**：确认期望值是否正确
3. **检查测试数据**：使用 `console.log` 查看中间值
4. **单独运行失败的测试**：
   ```bash
   npx vitest run tests/failing-test.test.js
   ```

### 常见问题

**Q: 测试超时怎么办？**
```javascript
test('长时间测试', async () => {
  // ...
}, 20000); // 设置20秒超时
```

**Q: 如何跳过某个测试？**
```javascript
test.skip('暂时跳过的测试', () => {
  // ...
});
```

**Q: 如何只运行某个测试？**
```javascript
test.only('只运行这个测试', () => {
  // ...
});
```

## 更多资源

- [Vitest 官方文档](https://vitest.dev/)
- [测试最佳实践](https://testingjavascript.com/)
- [项目 TODO](./TODO.md)

---

**记住**：测试不是负担，而是保护网。每修复一个bug，就添加一个回归测试，确保它永远不会回来！ 🛡️
