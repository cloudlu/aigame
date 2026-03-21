# 资源副本系统完整设计文档 v2.0

**版本**: v2.0（配合资源系统重构）
**最后更新**: 2026-03-21
**实现难度**: ⭐⭐
**预计耗时**: 2-3天

---

## 🎯 核心变更

### v2.0 更新（2026-03-21）
- ❌ **移除自动采集** - 完全取消挂机资源获取
- ✅ **副本主要来源** - 资源副本成为资源唯一来源
- ✅ **VIP扫荡特权** - VIP玩家可扫荡 + 更多次数
- ✅ **手动战斗优先** - 普通玩家需要手动战斗
- ✅ **配合装备强化** - 消耗匹配装备强化需求
- ✅ **特色背景音乐** - 每个副本独立音效

---

## 📋 目录

1. [概述](#概述)
2. [副本清单](#副本清单)
3. [难度设计](#难度设计)
4. [VIP特权系统](#vip特权系统)
5. [装备强化消耗](#装备强化消耗)
6. [背景音乐](#背景音乐)
7. [技术实现](#技术实现)

---

## 概述

资源副本是**唯一的资源获取途径**（除了VIP特权），分为3个难度，每个难度有不同的敌人数量和奖励。玩家需要**主动参与战斗**，VIP玩家可以**扫荡**（自动战斗）。

---

## 副本清单

### 1. 灵石矿脉 💎

| 难度 | 敌人数量 | 奖励 | 等级要求 | 首次通关奖励 |
|------|---------|------|---------|-------------|
| 简单 | 3 | 1000灵石 + 2000经验 | Lv.1 | 额外500灵石 |
| 普通 | 5 | 3000灵石 + 5000经验 | Lv.10 | 额外1500灵石 |
| 困难 | 7 | 10000灵石 + 15000经验 | Lv.20 | 额外5000灵石 |

**敌人类型**: 矿石怪、石巨人、矿工幽灵
**场景**: 深邃矿洞（LAVA_HELL场景）
**特色**: Boss层（第7个敌人）有精英石巨人
**背景音乐**: `assets/audio/dungeon_mine.wav` - 神秘矿洞音效

---

### 2. 灵草园 🌿

| 难度 | 敌人数量 | 奖励 | 等级要求 | 首次通关奖励 |
|------|---------|------|---------|-------------|
| 简单 | 3 | 30灵草 + 2000经验 | Lv.1 | 额外15灵草 |
| 普通 | 5 | 100灵草 + 5000经验 | Lv.10 | 额外50灵草 |
| 困难 | 7 | 300灵草 + 15000经验 | Lv.20 | 额外150灵草 |

**敌人类型**: 藤蔓怪、花仙子、树精
**场景**: 仙草园（LAKE_SIDE场景）
**特色**: Boss层有千年树精
**背景音乐**: `assets/audio/dungeon_forest.wav` - 自然森林音效

---

### 3. 玄铁矿 ⛏️

| 难度 | 敌人数量 | 奖励 | 等级要求 | 首次通关奖励 |
|------|---------|------|---------|-------------|
| 简单 | 3 | 60玄铁 + 2000经验 | Lv.1 | 额外30玄铁 |
| 普通 | 5 | 200玄铁 + 5000经验 | Lv.10 | 额外100玄铁 |
| 困难 | 7 | 600玄铁 + 15000经验 | Lv.20 | 额外300玄铁 |

**敌人类型**: 铁甲兽、矿石魔、熔岩怪
**场景**: 地下矿场（LAVA_HELL场景）
**特色**: Boss层有熔岩巨人
**背景音乐**: `assets/audio/dungeon_lava.wav` - 熔岩地狱音效

---

## 难度设计

### 🎯 难度设计原则

#### 核心理念
1. **简单**：新手友好，几乎100%胜率
2. **普通**：中期玩家，需要一定装备
3. **困难**：后期玩家，需要策略和好装备

---

### 📊 难度维度对比

| 维度 | 简单 | 普通 | 困难 |
|------|------|------|------|
| **敌人数量** | 3个 | 5个 | 7个 |
| **敌人类型** | 普通×3 | 普通×4 + 精英×1 | 普通×5 + 精英×1 + Boss×1 |
| **敌人等级** | 玩家等级 - 2 | 玩家等级 | 玩家等级 + 2 |
| **属性倍率** | ×0.8 | ×1.0 | ×1.5 |
| **预估时长** | 2分钟 | 4分钟 | 7分钟 |
| **胜率预估** | 95% | 70% | 40% |

---

### ⚔️ 敌人配置详解

#### 1. 灵石矿脉 💎

**简单难度（3个敌人）**

```javascript
enemies: [
    { type: 'normal', name: '矿石怪', level: playerLevel - 2, scale: 1.0 },
    { type: 'normal', name: '矿石怪', level: playerLevel - 2, scale: 1.0 },
    { type: 'normal', name: '石巨人', level: playerLevel - 2, scale: 1.0 }
]
```

**敌人属性**（以Lv.10玩家为例）：
- 等级：8级
- HP：500
- 攻击：80
- 防御：60

**普通难度（5个敌人）**

```javascript
enemies: [
    { type: 'normal', name: '矿石怪', level: playerLevel, scale: 1.0 },
    { type: 'normal', name: '矿石怪', level: playerLevel, scale: 1.0 },
    { type: 'normal', name: '石巨人', level: playerLevel, scale: 1.0 },
    { type: 'normal', name: '矿工幽灵', level: playerLevel, scale: 1.0 },
    { type: 'elite', name: '精英石巨人', level: playerLevel, scale: 2.0 }  // ← 精英怪
]
```

**精英石巨人属性**：
- 等级：10级
- HP：1500（普通×3）
- 攻击：160（普通×2）
- 防御：120（普通×2）
- 颜色：金色
- 发光特效

**困难难度（7个敌人）**

```javascript
enemies: [
    { type: 'normal', name: '矿石怪', level: playerLevel + 2, scale: 1.0 },
    { type: 'normal', name: '矿石怪', level: playerLevel + 2, scale: 1.0 },
    { type: 'normal', name: '石巨人', level: playerLevel + 2, scale: 1.0 },
    { type: 'normal', name: '矿工幽灵', level: playerLevel + 2, scale: 1.0 },
    { type: 'normal', name: '石巨人', level: playerLevel + 2, scale: 1.0 },
    { type: 'elite', name: '精英石巨人', level: playerLevel + 2, scale: 2.0 },
    { type: 'boss', name: 'BOSS石巨人王', level: playerLevel + 2, scale: 3.0 }  // ← Boss
]
```

**BOSS石巨人王属性**：
- 等级：12级
- HP：5000（普通×10）
- 攻击：240（普通×3）
- 防御：180（普通×3）
- 技能：地震（群体伤害）
- 颜色：紫红色
- 强发光特效

---

#### 2. 灵草园 🌿

**简单难度（3个敌人）**

```javascript
enemies: [
    { type: 'normal', name: '藤蔓怪', level: playerLevel - 2 },
    { type: 'normal', name: '花仙子', level: playerLevel - 2 },
    { type: 'normal', name: '藤蔓怪', level: playerLevel - 2 }
]
```

**特点**：植物类敌人，血量较低但攻击快

**普通难度（5个敌人）**

```javascript
enemies: [
    { type: 'normal', name: '藤蔓怪', level: playerLevel },
    { type: 'normal', name: '花仙子', level: playerLevel },
    { type: 'normal', name: '树精', level: playerLevel },
    { type: 'normal', name: '藤蔓怪', level: playerLevel },
    { type: 'elite', name: '精英树精', level: playerLevel }  // ← 精英
]
```

**精英树精**：
- HP：1200
- 技能：缠绕（降低玩家速度）

**困难难度（7个敌人）**

```javascript
enemies: [
    { type: 'normal', name: '藤蔓怪', level: playerLevel + 2 },
    { type: 'normal', name: '花仙子', level: playerLevel + 2 },
    { type: 'normal', name: '树精', level: playerLevel + 2 },
    { type: 'normal', name: '藤蔓怪', level: playerLevel + 2 },
    { type: 'normal', name: '树精', level: playerLevel + 2 },
    { type: 'elite', name: '精英树精', level: playerLevel + 2 },
    { type: 'boss', name: 'BOSS千年树妖', level: playerLevel + 2 }  // ← Boss
]
```

**BOSS千年树妖**：
- HP：4500
- 技能：
  - 树根穿刺（高伤害）
  - 自然之力（恢复HP）
  - 花粉迷雾（降低命中率）

---

#### 3. 玄铁矿 ⛏️

**简单难度（3个敌人）**

```javascript
enemies: [
    { type: 'normal', name: '铁甲兽', level: playerLevel - 2 },
    { type: 'normal', name: '矿石魔', level: playerLevel - 2 },
    { type: 'normal', name: '铁甲兽', level: playerLevel - 2 }
]
```

**特点**：防御高，攻击低

**普通难度（5个敌人）**

```javascript
enemies: [
    { type: 'normal', name: '铁甲兽', level: playerLevel },
    { type: 'normal', name: '矿石魔', level: playerLevel },
    { type: 'normal', name: '熔岩怪', level: playerLevel },
    { type: 'normal', name: '铁甲兽', level: playerLevel },
    { type: 'elite', name: '精英熔岩怪', level: playerLevel }  // ← 精英
]
```

**精英熔岩怪**：
- HP：1800
- 技能：熔岩护甲（反弹伤害）

**困难难度（7个敌人）**

```javascript
enemies: [
    { type: 'normal', name: '铁甲兽', level: playerLevel + 2 },
    { type: 'normal', name: '矿石魔', level: playerLevel + 2 },
    { type: 'normal', name: '熔岩怪', level: playerLevel + 2 },
    { type: 'normal', name: '铁甲兽', level: playerLevel + 2 },
    { type: 'normal', name: '熔岩怪', level: playerLevel + 2 },
    { type: 'elite', name: '精英熔岩怪', level: playerLevel + 2 },
    { type: 'boss', name: 'BOSS熔岩巨人', level: playerLevel + 2 }  // ← Boss
]
```

**BOSS熔岩巨人**：
- HP：6000
- 技能：
  - 熔岩喷发（大范围伤害）
  - 岩石护盾（免疫50%伤害）
  - 大地之怒（连续攻击）

---

### 🔢 数值计算公式

#### 敌人属性生成

```javascript
function generateDungeonEnemy(enemyType, playerLevel, difficulty) {
    // 基础属性（从game-metadata.js获取）
    const baseStats = getEnemyBaseStats(enemyType.name);

    // 等级修正
    const levelMod = enemyType.level / playerLevel;

    // 难度修正
    const difficultyMod = {
        'easy': 0.8,
        'medium': 1.0,
        'hard': 1.5
    }[difficulty];

    // 类型修正
    const typeMod = {
        'normal': 1.0,
        'elite': 2.5,   // 精英属性×2.5
        'boss': 5.0     // Boss属性×5
    }[enemyType.type];

    // 最终属性
    return {
        name: enemyType.name,
        level: enemyType.level,
        hp: Math.floor(baseStats.hp * levelMod * difficultyMod * typeMod),
        attack: Math.floor(baseStats.attack * levelMod * difficultyMod * typeMod),
        defense: Math.floor(baseStats.defense * levelMod * difficultyMod * typeMod),
        speed: baseStats.speed,
        scale: enemyType.scale,
        isElite: enemyType.type === 'elite',
        isBoss: enemyType.type === 'boss'
    };
}
```

#### 示例计算（Lv.10玩家，困难难度）

**普通矿石怪**：
```javascript
baseStats = { hp: 500, attack: 80, defense: 60 }
levelMod = 12 / 10 = 1.2
difficultyMod = 1.5
typeMod = 1.0

最终属性:
- HP = 500 × 1.2 × 1.5 × 1.0 = 900
- 攻击 = 80 × 1.2 × 1.5 × 1.0 = 144
- 防御 = 60 × 1.2 × 1.5 × 1.0 = 108
```

**BOSS石巨人王**：
```javascript
baseStats = { hp: 500, attack: 80, defense: 60 }
levelMod = 1.2
difficultyMod = 1.5
typeMod = 5.0

最终属性:
- HP = 500 × 1.2 × 1.5 × 5.0 = 4500
- 攻击 = 80 × 1.2 × 1.5 × 5.0 = 720
- 防御 = 60 × 1.2 × 1.5 × 5.0 = 540
```

---

### 🎮 玩家等级要求

#### 等级门槛设计

| 难度 | 等级要求 | 理由 |
|------|---------|------|
| 简单 | Lv.1 | 新手友好，引导玩家了解副本 |
| 普通 | Lv.10 | 中期，需要一定装备基础 |
| 困难 | Lv.20 | 后期，需要高级装备和策略 |

#### 境界推荐

```javascript
const difficultyRecommendations = {
    easy: {
        minLevel: 1,
        recommendedRealm: 0,  // 武者
        recommendedEquipLevel: '+3'
    },
    medium: {
        minLevel: 10,
        recommendedRealm: 1,  // 炼气
        recommendedEquipLevel: '+6'
    },
    hard: {
        minLevel: 20,
        recommendedRealm: 2,  // 筑基
        recommendedEquipLevel: '+9'
    }
};
```

---

### ⚖️ 难度平衡调整

#### 胜率监控

```javascript
// 数据埋点
trackDungeonResult(dungeonId, difficulty, victory, timeUsed) {
    // 发送到服务器
    analytics.track('dungeon_complete', {
        dungeon: dungeonId,
        difficulty: difficulty,
        victory: victory,
        time: timeUsed,
        playerLevel: this.gameState.player.level,
        equipScore: this.calculateEquipScore()
    });
}
```

#### 动态调整策略

**如果胜率过高（>80%）**：
- 提高敌人属性 ×1.1
- 增加敌人数量
- 添加新技能

**如果胜率过低（<40%）**：
- 降低敌人属性 ×0.9
- 减少敌人数量
- 移除部分技能

---

## VIP特权系统

### 每日挑战次数

| VIP等级 | 每日次数/副本 | 每日总次数 | 扫谈权限 |
|---------|-------------|-----------|---------|
| **VIP 0** | 3次 | 9次 | ❌ 只能手战斗 |
| **VIP 1-2** | 5次 | 15次 | ✅ 可扫荡 |
| **VIP 3-4** | 8次 | 24次 | ✅ 可扫荡 |
| **VIP 5-6** | 12次 | 36次 | ✅ 可扫荡 |
| **VIP 7+** | 20次 | 60次 | ✅ 可扫荡 |

### 扫荡说明

- **扫荡条件**: 通关该难度1次后解锁扫荡
- **扫荡时间**: 立即完成（消耗1次挑战次数）
- **扫荡奖励**: 与手动战斗相同
- **扫荡限制**: 只有VIP1+可以扫荡

---

## 装备强化消耗

### 强化消耗设计

| 强化等级 | 灵石消耗 | 玄铁消耗 | 成功率 | 累计资源需求 |
|---------|---------|---------|--------|-------------|
| **+1** | 1,000 | 50 | 100% | 1次简单灵石矿 + 1次简单玄铁矿 |
| **+2** | 2,500 | 100 | 95% | 2-3次简单副本 |
| **+3** | 5,000 | 200 | 90% | 5次简单副本 |
| **+4** | 10,000 | 400 | 85% | 10次简单副本 |
| **+5** | 20,000 | 800 | 80% | 20次副本（2-3天） |
| **+6** | 40,000 | 1,500 | 75% | 40次副本（4-5天） |
| **+7** | 80,000 | 3,000 | 70% | 80次副本（1-2周） |
| **+8** | 150,000 | 5,000 | 60% | 150次副本（2-3周） |
| **+9** | 300,000 | 10,000 | 50% | 300次副本（1个月） |
| **+10** | 500,000 | 20,000 | 40% | 500次副本（2个月） |

### 资源平衡计算

**普通玩家（VIP0）**:
- 每日副本次数: 9次（3副本 × 3次）
- 每日资源: 9000灵石 + 390灵草 + 860玄铁（平均）
- 强化+5装备: 需要20天（单件装备）
- 强化+10装备: 需要55天（单件装备）

**VIP玩家（VIP3）**:
- 每日副本次数: 24次
- 每日资源: 24000灵石 + 1040灵草 + 2290玄铁
- 强化+5装备: 需要8天
- 强化+10装备: 需要21天

**结论**: ✅ 资源紧张但合理，VIP有明显优势但不破坏平衡

---

## 背景音乐

### 音频文件

所有副本音乐已生成WAV格式音频文件，保存在 `assets/audio/` 目录：

1. **灵石矿脉** - `dungeon_mine.wav` (2.6MB)
   - 神秘矿洞音效
   - 低频回声、滴水声、采矿回响
   - 营造深邃地下空间感

2. **灵草园** - `dungeon_forest.wav` (2.6MB)
   - 自然森林音效
   - 鸟鸣、风声、树叶沙沙声、溪流声
   - 轻柔的自然氛围

3. **玄铁矿** - `dungeon_lava.wav` (2.6MB)
   - 熔岩地狱音效
   - 火焰燃烧、岩浆流动、蒸汽喷发、低频震动
   - 危险而炽热的感觉

### 音乐生成代码

音乐通过 `generate-dungeon-music.js` 生成，使用 Web Audio API 合成：

```javascript
// 示例：灵石矿脉音乐生成
generateMineMusic() {
    const duration = 30.0; // 30秒循环
    // ... 音频合成逻辑
}
```

运行生成器：
```bash
node generate-dungeon-music.js
```

---

## 战斗流程

### 手动战斗（VIP0）

```
1. 进入副本 → 选择难度
2. 战斗第1个敌人 → 胜利后自动进入下一个
3. 战斗第2个敌人 → ...
4. 战斗第3/5/7个敌人（Boss）→ 胜利
5. 发放奖励 → 消耗1次挑战次数
6. 评价界面 → 返回副本列表
```

### 扫荡（VIP1+）

```
1. 进入副本 → 选择难度
2. 点击"扫荡"按钮 → 立即完成
3. 显示战斗日志（简化）
4. 发放奖励 → 消耗1次挑战次数
```

---

## 技术实现

### 1. 移除自动采集

```javascript
// game.js
// ❌ 已移除自动收集资源系统（v2.0资源系统重构）
// 资源现在只能通过资源副本获取
```

### 2. 数据结构

```javascript
// game-metadata.js
resourceDungeons: {
    spirit_stone_mine: {
        id: 'spirit_stone_mine',
        name: '灵石矿脉',
        description: '深入矿脉采集灵石',
        icon: 'fa-gem',
        scene: 'mine',
        type: 'spirit_stones',
        difficulties: {
            easy: {
                name: '简单',
                enemies: 3,
                reward: { spirit_stones: 1000, exp: 2000 },
                first_clear_bonus: { spirit_stones: 500 },
                level_req: 1
            },
            medium: { ... },
            hard: { ... }
        },
        enemy_types: ['矿石怪', '石巨人', '矿工幽灵'],
        boss_type: '精英石巨人'
    },
    herb_garden: { ... },
    iron_mine: { ... }
}
```

### 3. 玩家数据存储

```javascript
// game.js - gameState.player
resourceDungeons: {
    spirit_stone_mine: {
        cleared: { easy: false, medium: false, hard: false },
        attempts: {
            easy: { count: 0, lastReset: Date.now() },
            medium: { count: 0, lastReset: Date.now() },
            hard: { count: 0, lastReset: Date.now() }
        }
    },
    herb_garden: { ... },
    iron_mine: { ... }
}
```

### 4. 境界加成系统

```javascript
const REALM_BONUSES = {
    0: 1.0,    // 武者境
    1: 1.5,    // 炼气境（+50%）
    2: 2.0,    // 筑基境（+100%）
    3: 3.0,    // 金丹境（+200%）
    4: 5.0,    // 元婴境（+400%）
    5: 10.0    // 化神境（+900%）
};
```

---

## 🚀 实现代码

### 生成副本敌人队列

```javascript
// dungeon.js

/**
 * 生成副本敌人队列
 */
generateEnemyQueue(dungeonId, difficulty) {
    const dungeon = this.game.metadata.resourceDungeons[dungeonId];
    const config = dungeon.difficulties[difficulty];
    const playerLevel = this.game.gameState.player.level;

    const enemies = [];

    // 根据难度生成敌人
    for (let i = 0; i < config.enemies; i++) {
        let enemyType;

        // 最后一个是Boss（困难模式）
        if (difficulty === 'hard' && i === config.enemies - 1) {
            enemyType = {
                type: 'boss',
                name: dungeon.boss_type,
                level: playerLevel + 2,
                scale: 3.0
            };
        }
        // 倒数第二个是精英（普通和困难）
        else if ((difficulty === 'medium' || difficulty === 'hard') && i === config.enemies - 2) {
            enemyType = {
                type: 'elite',
                name: '精英' + dungeon.enemy_types[0],
                level: difficulty === 'hard' ? playerLevel + 2 : playerLevel,
                scale: 2.0
            };
        }
        // 其他是普通怪
        else {
            const randomType = dungeon.enemy_types[Math.floor(Math.random() * dungeon.enemy_types.length)];
            enemyType = {
                type: 'normal',
                name: randomType,
                level: difficulty === 'easy' ? playerLevel - 2 :
                       difficulty === 'hard' ? playerLevel + 2 : playerLevel,
                scale: 1.0
            };
        }

        // 生成敌人数据
        const enemy = this.generateDungeonEnemy(enemyType, playerLevel, difficulty);
        enemies.push(enemy);
    }

    return enemies;
}
```

---

## 📝 总结

**难度设计核心**：
- 敌人数量递增（3 → 5 → 7）
- 敌人等级调整（-2 → 0 → +2）
- 敌人类型升级（普通 → 精英 → Boss）
- 属性倍率提升（×0.8 → ×1.0 → ×1.5）

**平衡保障**：
- 等级门槛限制
- 推荐装备提示
- 胜率数据监控
- 动态调整机制

**特色功能**：
- ✅ 每个副本独立背景音乐
- ✅ 连续战斗复用3D场景
- ✅ VIP特权系统
- ✅ 境界加成机制
- ✅ 首次通关奖励

---

**维护者**: 游戏平衡团队
**相关系统**: VIP系统 | 装备系统 | 战斗系统
**生成工具**: `generate-dungeon-music.js`
