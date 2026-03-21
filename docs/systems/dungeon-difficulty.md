# 资源副本难度设计系统

**版本**: v1.0
**最后更新**: 2026-03-21

---

## 🎯 **难度设计原则**

### 核心理念
1. **简单**：新手友好，几乎100%胜率
2. **普通**：中期玩家，需要一定装备
3. **困难**：后期玩家，需要策略和好装备

---

## 📊 **难度维度对比**

| 维度 | 简单 | 普通 | 困难 |
|------|------|------|------|
| **敌人数量** | 3个 | 5个 | 7个 |
| **敌人类型** | 普通×3 | 普通×4 + 精英×1 | 普通×5 + 精英×1 + Boss×1 |
| **敌人等级** | 玩家等级 - 2 | 玩家等级 | 玩家等级 + 2 |
| **属性倍率** | ×0.8 | ×1.0 | ×1.5 |
| **预估时长** | 2分钟 | 4分钟 | 7分钟 |
| **胜率预估** | 95% | 70% | 40% |

---

## ⚔️ **敌人配置详解**

### 1. 灵石矿脉 💎

#### 简单难度（3个敌人）

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

#### 普通难度（5个敌人）

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

#### 困难难度（7个敌人）

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

### 2. 灵草园 🌿

#### 简单难度（3个敌人）

```javascript
enemies: [
    { type: 'normal', name: '藤蔓怪', level: playerLevel - 2 },
    { type: 'normal', name: '花仙子', level: playerLevel - 2 },
    { type: 'normal', name: '藤蔓怪', level: playerLevel - 2 }
]
```

**特点**：植物类敌人，血量较低但攻击快

#### 普通难度（5个敌人）

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

#### 困难难度（7个敌人）

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

### 3. 玄铁矿 ⛏️

#### 简单难度（3个敌人）

```javascript
enemies: [
    { type: 'normal', name: '铁甲兽', level: playerLevel - 2 },
    { type: 'normal', name: '矿石魔', level: playerLevel - 2 },
    { type: 'normal', name: '铁甲兽', level: playerLevel - 2 }
]
```

**特点**：防御高，攻击低

#### 普通难度（5个敌人）

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

#### 困难难度（7个敌人）

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

## 🔢 **数值计算公式**

### 敌人属性生成

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

### 示例计算（Lv.10玩家，困难难度）

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

## 🎮 **玩家等级要求**

### 等级门槛设计

| 难度 | 等级要求 | 理由 |
|------|---------|------|
| 简单 | Lv.1 | 新手友好，引导玩家了解副本 |
| 普通 | Lv.10 | 中期，需要一定装备基础 |
| 困难 | Lv.20 | 后期，需要高级装备和策略 |

### 境界推荐

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

## ⚖️ **难度平衡调整**

### 胜率监控

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

### 动态调整策略

**如果胜率过高（>80%）**：
- 提高敌人属性 ×1.1
- 增加敌人数量
- 添加新技能

**如果胜率过低（<40%）**：
- 降低敌人属性 ×0.9
- 减少敌人数量
- 移除部分技能

---

## 🚀 **实现代码**

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

## 📝 **总结**

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

---

**维护者**: 游戏平衡团队
**相关文档**: [dungeon-system.md](./dungeon-system.md)