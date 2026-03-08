# ⚖️ 游戏平衡性设计文档

## 📋 文档说明

本文档详细记录了《无尽战斗》游戏的平衡性设计，包括玩家属性成长、敌人属性生成、战斗伤害计算。

**最后更新**: 2026-03-08
**版本**: v1.4
**维护者**: 游戏平衡团队

---

## 🎯 核心平衡理念

### 设计原则
1. **线性成长**: 玩家和敌人都应遵循线性成长曲线，避免指数级增长
2. **挑战适中**: 玩家应该能够在不频繁回复的情况下连续战斗2-3个敌人
3. **随机趣味**: 适度的随机性提高游戏趣味性，但不应影响整体平衡
4. **整数属性**: 所有可见的属性值都应该是整数

### 平衡目标
- 普通怪物：玩家损失 15-25% 最大HP
- 精英怪物：玩家损失 25-35% 最大HP
- 连续战斗：击败2-3个敌人后才需要回复

---

## 👤 玩家属性系统

### 初始属性（1级）
来源：[game-metadata.js:1974-1992](game-metadata.js#L1974-L1992)

```javascript
{
  hp: 100,
  maxHp: 100,
  attack: 10,
  defense: 5,
  luck: 2,
  speed: 10,
  energy: 100,
  maxEnergy: 100,
  accuracy: 100,
  dodge: 5
}
```

### 升级属性成长
来源：[game.js:1006-1010](game.js#L1006-L1010)

```javascript
每升一级固定增长：
- maxHp: +20
- hp: 重置为 maxHp
- attack: +3
- defense: +2
- luck: +1
- maxEnergy: +10
- energy: 重置为 maxEnergy
```

### 属性成长曲线（前10级）

| 等级 | HP | Attack | Defense | Luck | Energy |
|-----|-----|--------|---------|------|--------|
| 1 | 100 | 10 | 5 | 2 | 100 |
| 2 | 120 | 13 | 7 | 3 | 110 |
| 3 | 140 | 16 | 9 | 4 | 120 |
| 4 | 160 | 19 | 11 | 5 | 130 |
| 5 | 180 | 22 | 13 | 6 | 140 |
| 6 | 200 | 25 | 15 | 7 | 150 |
| 7 | 220 | 28 | 17 | 8 | 160 |
| 8 | 240 | 31 | 19 | 9 | 170 |
| 9 | 260 | 34 | 21 | 10 | 180 |
| 10 | 280 | 37 | 23 | 11 | 190 |

**成长特点**：
- ✅ 线性固定值增长
- ✅ 每级提升稳定可预期
- ✅ HP成长率: 20/级
- ✅ Attack成长率: 3/级
- ✅ Defense成长率: 2/级


**等级计算方式**：
- 敌人等级 = 玩家等级 ± 随机浮动
- 等级限制在地图的 min-max 范围内
- 保证敌人等级与玩家等级相近，维持挑战性


#### 敌人生成流程

来源：[map.js:683-773](map.js#L683-L773)

```javascript
// 1. 确定敌人类型（普通/精英/BOSS）
const enemyType = enemyDistribution[enemyIndex]; // 从分布数组中获取
let bonus = enemyType === 'boss' ? 1.0 : (enemyType === 'elite' ? 0.5 : 0);

// 2. 获取当前地图类型
const mapType = this.metadata.mapBackgrounds[this.gameState.currentBackgroundIndex].type;
// 例如: "xianxia-desert"

// 3. 从地图敌人列表中随机选择
const mapEnemies = this.metadata.mapEnemyMapping[mapType];
// 例如: ["沙妖", "蝎精", "蛇怪", "沙漠巨蜥", "沙虫", "风魔", "土妖"]

const randomEnemyName = mapEnemies[Math.floor(Math.random() * mapEnemies.length)];
// 例如: "沙漠巨蜥"

// 4. 查找敌人基础属性
const selectedEnemyType = this.metadata.enemyTypes.find(enemy => enemy.name === randomEnemyName);
// 从enemyTypes数组中获取baseHp, baseAttack, baseDefense等

// 5. 计算最终属性（线性成长 + 加成）
const finalHp = Math.floor((baseHp + (enemyLevel - 1) * baseHp * 0.5) * (1 + bonus));
const finalAttack = Math.floor((baseAttack + (enemyLevel - 1) * baseAttack * 0.3) * (1 + bonus));
const finalDefense = Math.floor((baseDefense + (enemyLevel - 1) * baseDefense * 0.3) * (1 + bonus));
```

### 敌人刷新机制

来源：[map.js:19-32](map.js#L19-L32)

```javascript
// 刷新敌人分布
EndlessWinterGame.prototype.refreshEnemies = function() {
    // 1. 清空场景怪物数据
    this.gameState.sceneMonsters = [];

    // 2. 重新生成小地图
    this.generateMiniMap(); // 重新生成所有敌人

    // 3. 更新UI
    this.updateUI();
}
```

### 敌人颜色标识系统

来源：[map.js:643-655](map.js#L643-L655)

根据敌人战斗力与玩家战斗力的比值，使用颜色标识危险等级：

```javascript
const enemyPower = enemyInfo.attack * 2 + enemyInfo.defense * 1.5 + enemyInfo.maxHp * 0.1;
const playerPower = playerAttack * 2 + playerDefense * 1.5 + playerHp * 0.1;

if (enemyPower > playerPower * 1.5) {
    // 红色：危险（战斗力 > 玩家1.5倍）
    enemyIconColor = 'text-red-500';
} else if (enemyPower > playerPower) {
    // 黄色：警告（战斗力 > 玩家）
    enemyIconColor = 'text-yellow-500';
} else {
    // 绿色：安全（战斗力 < 玩家）
    enemyIconColor = 'text-green-500';
}

// 特殊标识
if (isBoss) {
    enemyIconColor = 'text-purple-500'; // BOSS：紫色
} else if (isElite) {
    enemyIconColor = 'text-yellow-500'; // 精英：黄色
}
```

**颜色含义**：
- 🟢 **绿色**: 战斗力 < 玩家（安全）
- 🟡 **黄色**: 战斗力 ≈ 玩家（警告）或 精英怪
- 🔴 **红色**: 战斗力 > 玩家1.5倍（危险）
- 🟣 **紫色**: BOSS级敌人

---

## 👹 敌人属性系统

### 敌人基础属性配置
来源：[game-metadata.js:82-380](game-metadata.js#L82-L380)

示例敌人（雪原狼）：
```javascript
{
  name: "雪原狼",
  baseHp: 30,
  baseAttack: 8,
  baseDefense: 2,
  baseSpeed: 12,
  baseAccuracy: 95,
  baseDodge: 15,
  expMultiplier: 1,
  resourceMultiplier: 1
}
```

### 当前属性生成公式（v1.2）
来源：[map.js:683-766](map.js#L683-L766)

```javascript
// 线性成长公式（2024-03-08修正）
// 从敌人类型获取基础属性
const baseHp = selectedEnemyType.baseHp || 30;
const baseAttack = selectedEnemyType.baseAttack || 8;
const baseDefense = selectedEnemyType.baseDefense || 2;

// 线性成长 + 加成
// 成长率：HP +50%基础值/级，Attack/Defense +30%基础值/级，Speed/Luck +20%基础值/级
const finalHp = Math.floor((baseHp + (enemyLevel - 1) * baseHp * 0.5) * (1 + bonus));
const finalAttack = Math.floor((baseAttack + (enemyLevel - 1) * baseAttack * 0.3) * (1 + bonus));
const finalDefense = Math.floor((baseDefense + (enemyLevel - 1) * baseDefense * 0.3) * (1 + bonus));

// bonus: boss=1.0 (+100%), elite=0.5 (+50%), normal=0 (+0%)
```

**公式解析**：
- **基础成长**: `baseValue + (level - 1) × baseValue × growthRate`
  - HP成长率: 50% 基础值/级
  - Attack成长率: 30% 基础值/级
  - Defense成长率: 30% 基础值/级
- **加成系统**:
  - 普通怪: +0%
  - 精英怪: +50% (bonus = 0.5)
  - BOSS: +100% (bonus = 1.0)
- **取整方式**: Math.floor() 向下取整

### 雪原狼属性成长对比

| 等级 | 旧公式HP | 新公式HP（平均） | 新HP范围 | 旧Attack | 新Attack（平均） | 新Attack范围 |
|-----|---------|----------------|---------|---------|----------------|------------|
| 1 | 30 | 30 | 25~34 | 8 | 8 | 7~9 |
| 2 | 60 ❌ | 45 | 38~51 | 16 ❌ | 10.4 | 9~12 |
| 3 | 90 ❌ | 60 | 51~68 | 24 ❌ | 12.8 | 11~15 |
| 4 | 120 ❌ | 75 | 64~85 | 32 ❌ | 15.2 | 13~17 |
| 5 | 150 ❌ | 90 | 77~102 | 40 ❌ | 17.6 | 15~20 |

**改进效果**：
- ✅ 成长曲线与玩家一致（线性增长）
- ✅ 属性值合理可控
- ✅ 随机性提高趣味性
- ✅ 精英怪仍有挑战但不过强

### 所有敌人类型基础属性

| 敌人名称 | HP | Attack | Defense | Speed | 特点 |
|---------|-----|--------|---------|-------|------|
| 雪原狼 | 30 | 8 | 2 | 12 | 快速低防 |
| 冰原熊 | 60 | 12 | 4 | 8 | 高HP高攻 |
| 冰霜巨人 | 100 | 18 | 6 | 6 | 超高HP |
| 妖狐 | 40 | 10 | 3 | 14 | 高闪避 |
| 山精 | 80 | 15 | 5 | 7 | 均衡型 |
| 火灵 | 50 | 20 | 2 | 15 | 高攻低防 |
| 土妖 | 120 | 16 | 8 | 5 | 超高防御 |
| 风魔 | 60 | 18 | 3 | 16 | 高速高攻 |

---

## ⚔️ 战斗伤害计算

### 伤害公式
来源：[combatlogic.js:32-33](combatlogic.js#L32-L33)

```javascript
// 基础伤害计算
playerDamage = Math.max(1, finalAttack - enemyDefense)
enemyDamage = Math.max(1, enemyAttack - finalDefense)

// 最小伤害为1
```

### 命中率计算
来源：[combatlogic.js:36-37](combatlogic.js#L36-L37)

```javascript
// 命中判定
hitChance = Math.min(95, accuracy - dodge)
isHit = Math.random() * 100 < hitChance
```

**命中机制**：
- 基础命中: 玩家 accuracy - 敌人 dodge
- 上限: 95%（必定有5%闪避几率）
- 下限: 无限制（可能完全无法命中）

### 击败敌人后的恢复
来源：[combatlogic.js:448-455](combatlogic.js#L448-L455)

```javascript
// 击杀后恢复
hpRecoveryPercent = 0.35  // 35% 最大HP（v1.1）
hpRecovery = Math.floor(maxHp * hpRecoveryPercent)
energyRecovery = 15       // 固定15点灵力
```

**恢复机制**：
- HP恢复: 35% 最大HP（2024-03-07从20%提升）
- 灵力恢复: 固定15点
- 资源获得: 基于敌人等级和resourceMultiplier

---

## 📊 战斗模拟分析

### 模拟场景1：1级玩家 vs 1级雪原狼

**战斗属性**：
- 玩家：HP 100, Attack 10, Defense 5
- 雪原狼：HP 30, Attack 8, Defense 2

**伤害计算**：
- 玩家伤害: max(1, 10 - 2) = 8
- 敌人伤害: max(1, 8 - 5) = 3

**战斗回合**：
- 击杀雪原狼需要: ⌈30 / 8⌉ = 4回合
- 玩家受到伤害: 3 × 4 = 12 HP
- 战斗后恢复: 100 × 35% = 35 HP
- **净收益**: +23 HP ✅

### 模拟场景2：2级玩家 vs 2级雪原狼

**战斗属性**：
- 玩家：HP 120, Attack 13, Defense 7
- 雪原狼（新公式平均）：HP 45, Attack 10, Defense 3

**伤害计算**：
- 玩家伤害: max(1, 13 - 3) = 10
- 敌人伤害: max(1, 10 - 7) = 3

**战斗回合**：
- 击杀雪原狼需要: ⌈45 / 10⌉ = 5回合
- 玩家受到伤害: 3 × 5 = 15 HP
- 战斗后恢复: 120 × 35% = 42 HP
- **净收益**: +27 HP ✅

### 模拟场景3：2级玩家 vs 2级精英雪原狼

**战斗属性**：
- 玩家：HP 120, Attack 13, Defense 7
- 精英雪原狼（新公式平均）：HP 56, Attack 13, Defense 4

**伤害计算**：
- 玩家伤害: max(1, 13 - 4) = 9
- 敌人伤害: max(1, 13 - 7) = 6

**战斗回合**：
- 击杀精英雪原狼需要: ⌈56 / 9⌉ = 7回合
- 玩家受到伤害: 6 × 7 = 42 HP
- 战斗后恢复: 120 × 35% = 42 HP
- **净收益**: 0 HP ✅（正好恢复）

### 模拟场景4：3级玩家 vs 3级普通雪原狼

**战斗属性**：
- 玩家：HP 140, Attack 16, Defense 9
- 雪原狼（新公式平均）：HP 60, Attack 13, Defense 4

**伤害计算**：
- 玩家伤害: max(1, 16 - 4) = 12
- 敌人伤害: max(1, 13 - 9) = 4

**战斗回合**：
- 击杀雪原狼需要: ⌈60 / 12⌉ = 5回合
- 玩家受到伤害: 4 × 5 = 20 HP
- 战斗后恢复: 140 × 35% = 49 HP
- **净收益**: +29 HP ✅

---

## 📈 平衡性调整历史

### v1.2 - 2024-03-08 修正敌人生成公式

**问题描述**：
- ❌ BALANCE_DESIGN.md 记录的是 game.js refreshEnemy 的公式
- ❌ 实际使用的是 map.js createEnemy 方法，使用倍数增长公式
- ❌ 敌人属性过强，玩家反馈难度太大
- ❌ mapEnemyMapping 包含大量不存在的敌人名称（如"沙漠巨蜥王"、"山妖王"等）

**调整内容**：

1. **修正 map.js createEnemy 方法**
   ```diff
   - const baseAttack = enemyLevel * 8;  // 倍数增长
   - const baseDefense = enemyLevel * 2;
   - const baseHp = enemyLevel * 30;
   + const baseHp = selectedEnemyType.baseHp || 30;
   + const baseAttack = selectedEnemyType.baseAttack || 8;
   + const baseDefense = selectedEnemyType.baseDefense || 2;
   + const finalHp = Math.floor((baseHp + (enemyLevel - 1) * baseHp * 0.5) * (1 + bonus));
   + const finalAttack = Math.floor((baseAttack + (enemyLevel - 1) * baseAttack * 0.3) * (1 + bonus));
   + const finalDefense = Math.floor((baseDefense + (enemyLevel - 1) * baseDefense * 0.3) * (1 + bonus));
   ```

2. **删除 game.js 中未使用的 refreshEnemy 方法**

3. **修复 game-metadata.js 中的数据一致性问题**
   - 清理 mapEnemyMapping 中所有不存在的敌人引用
   - 移除所有"王"后缀的敌人名称（应通过精英/BOSS加成生成，而非硬编码）
   - 移除所有未在 enemyTypes 中定义的敌人名称
   - 确保所有地图的敌人列表只包含有效敌人

**调整效果**：
- ✅ 敌人成长曲线与玩家保持一致（线性增长）
- ✅ 2级普通怪 HP 从 60 降至 45
- ✅ 2级普通怪 Attack 从 16 降至 10
- ✅ 修复 createEnemy 返回 null 导致的崩溃问题
- ✅ 数据一致性得到保证，不会再出现找不到敌人的错误
- ⚠️ 精英/BOSS 加成仍然较高（+50%/+100%），可能需要后续调整

### v1.1 - 2024-03-07 属性成长重构

**问题描述**：
- ❌ 敌人使用倍数增长（baseValue × level）
- ❌ 玩家使用固定值增长（baseValue + fixed）
- ❌ 等级越高，差距越大
- ❌ 2级玩家打2级普通怪损失超过50% HP

**调整内容**：

1. **敌人属性成长公式重构**
   ```diff
   - hp = Math.floor(baseHp * enemyLevel * eliteBonus)
   + hp = Math.floor((baseHp + (level - 1) * baseHp * 0.5) * randomFactor() * eliteBonus)
   ```

2. **精英怪加成降低**
   ```diff
   - const eliteBonus = isElite ? 1.5 : 1
   + const eliteBonus = isElite ? 1.25 : 1
   ```

3. **击杀后HP恢复提升**
   ```diff
   - const hpRecoveryPercent = 0.2  // 20%
   + const hpRecoveryPercent = 0.35 // 35%
   ```

**调整效果**：
- ✅ 敌人成长曲线与玩家保持一致
- ✅ 2级玩家打2级普通怪损失降至 15-20% HP
- ✅ 精英怪仍具挑战但不会过于强力
- ✅ 玩家可连续战斗2-3个敌人

### v1.0 - 初始版本

**原始公式**：
```javascript
hp = Math.floor(baseHp * enemyLevel * eliteBonus)
eliteBonus = 1.5（精英怪）
hpRecoveryPercent = 0.2
```

**存在问题**：
- 敌人倍数增长导致后期过强
- 精英怪1.5倍加成太高
- 击杀恢复不足以支持连续战斗

---

## 🎲 随机性设计

### 随机浮动机制

```javascript
const randomFactor = () => 0.85 + Math.random() * 0.3
// 范围: 0.85 ~ 1.15 (±15%)
```

**设计目的**：
1. **提高趣味性**: 同等级敌人略有差异
2. **增加策略性**: 需要根据实际敌人强度调整战术
3. **避免单调**: 每次战斗体验略有不同

**示例**：2级雪原狼的HP范围
- 最小值: ⌊45 × 0.85⌋ = 38
- 平均值: 45
- 最大值: ⌊45 × 1.15⌋ = 51

### 精英怪生成概率

```javascript
const isElite = Math.random() < 0.15  // 15%概率
```

**精英怪特点**：
- 属性加成: 1.25倍
- 经验加成: 1.25倍
- 资源加成: 1.25倍
- 名称前缀: "精英"

---

## 🔧 平衡性调整建议

### 调整方法论

1. **数据收集**
   - 记录玩家战斗日志
   - 统计玩家死亡率
   - 分析资源消耗速度

2. **模拟测试**
   - 使用本档提供的战斗模拟公式
   - 测试不同等级的战斗结果
   - 验证连续战斗可行性

3. **参数微调**
   - 敌人成长率（当前: HP 50%, Attack/Defense 30%）
   - 精英怪加成（当前: 1.25倍）
   - 击杀恢复比例（当前: 35%）

### 常见调整场景

#### 场景1：玩家死亡率过高

**症状**：玩家频繁死亡，体验受挫

**可能调整**：
```javascript
// 方案1：降低敌人成长率
- baseHp * 0.5  → baseHp * 0.4
- baseAttack * 0.3 → baseAttack * 0.25

// 方案2：提升击杀恢复
- hpRecoveryPercent = 0.35 → 0.45

// 方案3：降低精英怪加成
- eliteBonus = 1.25 → 1.15
```

#### 场景2：游戏过于简单

**症状**：玩家毫无压力，失去挑战

**可能调整**：
```javascript
// 方案1：提高敌人成长率
- baseHp * 0.5 → baseHp * 0.6
- baseAttack * 0.3 → baseAttack * 0.35

// 方案2：降低击杀恢复
- hpRecoveryPercent = 0.35 → 0.25

// 方案3：提高精英怪概率
- Math.random() < 0.15 → 0.20
```

#### 场景3：后期难度崩坏

**症状**：高等级敌人过强或过弱

**可能调整**：
```javascript
// 引入等级递减机制
const levelFactor = Math.min(1, 10 / level)  // 10级后成长减速
const hp = Math.floor((baseHp + (level - 1) * baseHp * 0.5 * levelFactor) * randomFactor())
```

---

## 📝 平衡性测试清单

### 基础测试项

- [ ] 1级玩家 vs 1级普通怪：损失 < 20% HP
- [ ] 2级玩家 vs 2级普通怪：损失 < 20% HP
- [ ] 3级玩家 vs 3级普通怪：损失 < 20% HP
- [ ] 1级玩家 vs 1级精英怪：损失 < 35% HP
- [ ] 2级玩家 vs 2级精英怪：损失 < 35% HP
- [ ] 连续战斗3个普通怪：不需额外回复
- [ ] 连续战斗2个精英怪：不需额外回复

### 极端情况测试

- [ ] 5级玩家 vs 1级怪：秒杀，零损伤
- [ ] 1级玩家 vs 5级怪：合理死亡
- [ ] 10级玩家 vs 10级怪：损失 15-25% HP
- [ ] 精英怪出现率：约15%
- [ ] 敌人属性浮动：±15%范围内

### 长期游戏测试

- [ ] 1-10级升级过程流畅
- [ ] 资源获取速度合理
- [ ] 装备掉落频率适中
- [ ] 经验值增长曲线平滑

---

## 📚 相关代码位置

### 玩家属性系统
- 初始属性：[game-metadata.js:1974-1992](game-metadata.js#L1974-L1992)
- 升级成长：[game.js:1006-1010](game.js#L1006-L1010)
- 属性显示：[game.js:378-383](game.js#L378-L383)

### 敌人属性系统
- 基础配置：[game-metadata.js:82-380](game-metadata.js#L82-L380)
- 属性生成：[map.js:683-766](map.js#L683-L766)（实际使用）

### 战斗系统
- 伤害计算：[combatlogic.js:32-33](combatlogic.js#L32-L33)
- 命中判定：[combatlogic.js:36-37](combatlogic.js#L36-L37)
- 击杀恢复：[combatlogic.js:448-455](combatlogic.js#L448-L455)

---

## 🔍 调试与监控

### 控制台调试命令

```javascript
// 查看当前玩家属性
console.log('Player:', game.gameState.player);

// 查看当前敌人属性
console.log('Enemy:', game.gameState.enemy);

// 模拟战斗伤害
const playerDamage = Math.max(1, game.gameState.player.attack - game.gameState.enemy.defense);
const enemyDamage = Math.max(1, game.gameState.enemy.attack - game.gameState.player.defense);
console.log(`Player damage: ${playerDamage}, Enemy damage: ${enemyDamage}`);

// 刷新敌人分布（使用 map.js 的方法）
game.generateMiniMap();
```

### 平衡性监控指标

建议在开发环境中添加以下监控：

1. **战斗统计**
   - 平均战斗回合数
   - 玩家平均HP损失
   - 死亡率

2. **资源流动**
   - HP药水使用频率
   - 资源获取速度
   - 经验获取速度

3. **敌人分布**
   - 精英怪出现频率
   - 敌人属性分布
   - 掉落品质分布

---

## 📖 附录

### 属性缩写对照

| 缩写 | 全称 | 说明 |
|-----|------|------|
| HP | Health Points | 生命值 |
| Attack | Attack Power | 攻击力 |
| Defense | Defense Power | 防御力 |
| Speed | Speed | 速度 |
| Luck | Luck | 幸运值 |
| Energy | Energy | 灵力 |

### 成长曲线图表

玩家与敌人HP成长对比（雪原狼）：

```
HP
300 |                    Player
250 |                  *
200 |              *
150 |          *   │   Enemy (Old) ✗
100 |      *   │   *   │   *   │   *   │   ✗
 50 |  *   │   *   │   *   │   *   │   ✗   │
  0 |_________________________________________
      1   2   3   4   5   6   7   8   9  10  Level

HP
140 |                    Player
120 |                  *       Enemy (New) ✓
100 |              *       *
 80 |          *       *       *
 60 |      *       *       *
 40 |  *       *       *
  0 |_________________________________________
      1   2   3   4   5   6   7   8   9  10  Level
```

## 🎯 总结

### 当前平衡状态（v1.4）

✅ **已解决**：
- 敌人成长曲线问题（倍数→线性）
- 精英怪过强问题（1.5→1.25）
- 击杀恢复不足问题（20%→35%）
- 小数属性问题（Math.floor）
- 地图等级范围设计问题（改用境界需求）

✅ **设计特点**：
- 线性成长保证长期平衡
- 随机性提高游戏趣味
- 精英怪保持挑战但不至于打不过
- 玩家可以连续战斗2-3个敌人
- 地图按境界分层，清晰无重叠

⚠️ **需持续监控**：
- 高等级（10+）时的平衡性
- 不同敌人类型的表现
- 装备系统对平衡的影响
- 境界系统对平衡的影响

### 未来优化方向

1. **等级递减机制**：防止高等级成长过快
2. **敌人类型差异化**：不同敌人有独特机制
3. **动态难度调整**：根据玩家表现调整
4. **装备平衡**：确保装备不会破坏平衡
5. **传送点系统**：首次访问解锁，后续快速旅行

---

**文档版本**: v1.4
**最后更新**: 2026-03-08
**主要更新**: 
**下次审核**: 

如有平衡性问题反馈，请在Issues中标注 `balance` 标签。
