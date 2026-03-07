# 技能升级系统 - 完整设计文档

## 📋 概述

- **总技能树**: 24个（6境界 × 4技能树）
- **总技能等级**: 96个（24技能树 × 4级）
- **技能分类**: 攻击、防御、恢复、特殊
- **设计原则**: 境界压制、合理成长、平衡性

---

## 🎯 设计原则

### 境界压制
```
高境界 Lv.1 > 低境界 Lv.4
```

### 伤害倍数递增表

| 境界 | Lv.1 | Lv.2 | Lv.3 | Lv.4 | 能量消耗(Lv.4) |
|------|------|------|------|------|---------------|
| 武者 | 1.3x | 1.5x | 1.7x | 1.9x | 20 |
| 炼气 | 2.0x | 2.3x | 2.6x | 3.0x | 28 |
| 筑基 | 3.2x | 3.6x | 4.0x | 4.5x | 40 |
| 金丹 | 4.8x | 5.3x | 5.8x | 6.5x | 52 |
| 元婴 | 6.8x | 7.5x | 8.2x | 9.0x | 65 |
| 化神 | 9.5x | 10.5x | 11.5x | 13.0x | 80 |

### 防御效果递增表

| 境界 | Lv.1 | Lv.2 | Lv.3 | Lv.4 |
|------|------|------|------|------|
| 武者 | - | - | 35% | 45% |
| 炼气 | 30% | 35% | 40% | 50% |
| 筑基 | 40% | 45% | 50% | 60% |
| 金丹 | 50% | 55% | 60% | 70% |
| 元婴 | 60% | 65% | 70% | 80% |
| 化神 | 70% | 75% | 80% | 90% |

### 恢复效果递增表（HP%）

| 境界 | Lv.1 | Lv.2 | Lv.3 | Lv.4 |
|------|------|------|------|------|
| 武者 | 12% | 15% | 18% | - |
| 炼气 | 18% | 22% | 26% | - |
| 筑基 | 28% | 32% | 38% | 45% |
| 金丹 | 42% | 48% | 55% | 65% |
| 元婴 | 60% | 68% | 78% | 90% |
| 化神 | 85% | 95% | 110% | 130% |

---

## 🗡️ 武者境（Realm 0）- 4个技能树

### 1. powerStrike (强力打击系) - 攻击

```javascript
{
  id: 'powerStrike',
  name: '强力打击系',
  realmRequired: 0,
  type: 'attack',
  levels: [
    {
      name: '重击',
      description: '凝聚力量，造成1.3倍伤害',
      stageRequired: 1,
      energyCost: 12,
      damageMultiplier: 1.3,
      imageId: 1,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
      effectColor: { r: 1, g: 0.3, b: 0 }
    },
    {
      name: '猛击',
      description: '全力一击，造成1.5倍伤害',
      stageRequired: 4,
      energyCost: 14,
      damageMultiplier: 1.5,
      imageId: 1,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
      effectColor: { r: 1, g: 0.4, b: 0 }
    },
    {
      name: '武者之怒',
      description: '爆发武者之怒，造成1.7倍伤害',
      stageRequired: 7,
      energyCost: 16,
      damageMultiplier: 1.7,
      imageId: 5,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
      effectColor: { r: 1, g: 0.2, b: 0 }
    },
    {
      name: '武道极意',
      description: '武者境巅峰，造成1.9倍伤害，+5%暴击率',
      stageRequired: 10,
      energyCost: 20,
      damageMultiplier: 1.9,
      criticalBonus: 0.05,
      imageId: 5,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
      effectColor: { r: 1, g: 0, b: 0 }
    }
  ]
}
```

### 2. ironSkin (铁布衫系) - 防御

```javascript
{
  id: 'ironSkin',
  name: '铁布衫系',
  realmRequired: 0,
  type: 'defense',
  levels: [
    {
      name: '铁布衫',
      description: '防御姿态，减伤35%',
      stageRequired: 7,
      energyCost: 18,
      defenseBonus: 0.35,
      imageId: 4,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 1, g: 0.8, b: 0 }
    },
    {
      name: '金钟罩',
      description: '强化防御，减伤45%',
      stageRequired: 10,
      energyCost: 25,
      defenseBonus: 0.45,
      imageId: 4,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 1, g: 0.9, b: 0.2 }
    }
  ]
}
```

### 3. enduranceRecovery (耐力恢复系) - 恢复

```javascript
{
  id: 'enduranceRecovery',
  name: '耐力恢复系',
  realmRequired: 0,
  type: 'recovery',
  levels: [
    {
      name: '耐力恢复',
      description: '恢复12%最大HP',
      stageRequired: 4,
      energyCost: 18,
      healPercentage: 0.12,
      imageId: 3,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.2, g: 1, b: 0.2 }
    },
    {
      name: '生命回复',
      description: '恢复15%最大HP',
      stageRequired: 7,
      energyCost: 22,
      healPercentage: 0.15,
      imageId: 3,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.3, g: 1, b: 0.3 }
    },
    {
      name: '气血涌动',
      description: '恢复18%最大HP，持续恢复3回合',
      stageRequired: 10,
      energyCost: 26,
      healPercentage: 0.18,
      hot: { healPercent: 0.03, turns: 3 },
      imageId: 3,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.4, g: 1, b: 0.4 }
    }
  ]
}
```

### 4. warriorSense (武者直觉系) - 特殊

```javascript
{
  id: 'warriorSense',
  name: '武者直觉系',
  realmRequired: 0,
  type: 'special',
  levels: [
    {
      name: '闪避',
      description: '25%闪避率，持续1回合',
      stageRequired: 7,
      energyCost: 10,
      dodgeBonus: 0.25,
      duration: 1,
      imageId: 2,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
      effectColor: { r: 0.5, g: 0.8, b: 1 }
    },
    {
      name: '武者本能',
      description: '30%闪避率 + 5%暴击率，持续1回合',
      stageRequired: 10,
      energyCost: 15,
      dodgeBonus: 0.3,
      criticalBonus: 0.05,
      duration: 1,
      imageId: 2,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
      effectColor: { r: 0.6, g: 0.9, b: 1 }
    }
  ]
}
```

---

## 🔥 炼气境（Realm 1）- 4个技能树

### 1. qiBlade (气刃术系) - 攻击

```javascript
{
  id: 'qiBlade',
  name: '气刃术系',
  realmRequired: 1,
  type: 'attack',
  levels: [
    {
      name: '气刃术',
      description: '凝聚真气，造成2.0倍伤害',
      stageRequired: 1,
      energyCost: 15,
      damageMultiplier: 2.0,
      imageId: 6,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 0, g: 0.6, b: 1 }
    },
    {
      name: '真气刃',
      description: '强化气刃，造成2.3倍伤害，+5%暴击率',
      stageRequired: 4,
      energyCost: 18,
      damageMultiplier: 2.3,
      criticalBonus: 0.05,
      imageId: 6,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 0, g: 0.7, b: 1 }
    },
    {
      name: '炎火掌',
      description: '火焰掌力，造成2.6倍伤害，额外造成5%敌人最大生命伤害',
      stageRequired: 7,
      energyCost: 22,
      damageMultiplier: 2.6,
      extraDamagePercent: 0.05,
      imageId: 10,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
      effectColor: { r: 1, g: 0.5, b: 0 }
    },
    {
      name: '烈焰掌',
      description: '炼气境巅峰，造成3.0倍伤害，额外造成10%敌人最大生命伤害',
      stageRequired: 10,
      energyCost: 28,
      damageMultiplier: 3.0,
      extraDamagePercent: 0.1,
      imageId: 10,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
      effectColor: { r: 1, g: 0.3, b: 0 }
    }
  ]
}
```

### 2. qiShield (真气盾系) - 防御

```javascript
{
  id: 'qiShield',
  name: '真气盾系',
  realmRequired: 1,
  type: 'defense',
  levels: [
    {
      name: '护体罡气',
      description: '减伤30%，护盾吸收80点伤害',
      stageRequired: 1,
      energyCost: 20,
      defenseBonus: 0.3,
      shield: 80,
      imageId: 7,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3',
      effectColor: { r: 1, g: 1, b: 0 }
    },
    {
      name: '真气护盾',
      description: '减伤35%，护盾吸收120点伤害',
      stageRequired: 4,
      energyCost: 24,
      defenseBonus: 0.35,
      shield: 120,
      imageId: 7,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3',
      effectColor: { r: 0.8, g: 1, b: 0.2 }
    },
    {
      name: '五行护盾',
      description: '减伤40%，护盾吸收160点伤害',
      stageRequired: 7,
      energyCost: 28,
      defenseBonus: 0.4,
      shield: 160,
      imageId: 7,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3',
      effectColor: { r: 0.9, g: 1, b: 0.3 }
    },
    {
      name: '罡气护体',
      description: '减伤50%，护盾吸收200点伤害，免疫控制',
      stageRequired: 10,
      energyCost: 35,
      defenseBonus: 0.5,
      shield: 200,
      immuneCC: true,
      imageId: 7,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3',
      effectColor: { r: 1, g: 1, b: 0.5 }
    }
  ]
}
```

### 3. qiHealing (真气治疗系) - 恢复

```javascript
{
  id: 'qiHealing',
  name: '真气治疗系',
  realmRequired: 1,
  type: 'recovery',
  levels: [
    {
      name: '聚气术',
      description: '恢复18点能量',
      stageRequired: 4,
      energyCost: 5,
      energyRecover: 18,
      imageId: 9,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
      effectColor: { r: 0.5, g: 0.5, b: 1 }
    },
    {
      name: '真气治疗',
      description: '恢复18%HP + 15点能量',
      stageRequired: 7,
      energyCost: 15,
      healPercentage: 0.18,
      energyRecover: 15,
      imageId: 9,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
      effectColor: { r: 0.6, g: 0.6, b: 1 }
    },
    {
      name: '周天运转',
      description: '恢复22%HP + 20点能量，清除负面状态',
      stageRequired: 10,
      energyCost: 20,
      healPercentage: 0.22,
      energyRecover: 20,
      purify: true,
      imageId: 9,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
      effectColor: { r: 0.7, g: 0.7, b: 1 }
    }
  ]
}
```

### 4. qiSense (真气感知系) - 特殊

```javascript
{
  id: 'qiSense',
  name: '真气感知系',
  realmRequired: 1,
  type: 'special',
  levels: [
    {
      name: '追风步',
      description: '20%闪避 + 恢复12能量',
      stageRequired: 4,
      energyCost: 10,
      dodgeBonus: 0.2,
      energyRecover: 12,
      imageId: 8,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3',
      effectColor: { r: 0.7, g: 0.9, b: 1 }
    },
    {
      name: '冰心诀',
      description: '20%防御 + 15%闪避 + 恢复15能量',
      stageRequired: 7,
      energyCost: 15,
      defenseBonus: 0.2,
      dodgeBonus: 0.15,
      energyRecover: 15,
      imageId: 11,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2579/2579-preview.mp3',
      effectColor: { r: 0.7, g: 0.9, b: 1 }
    },
    {
      name: '真气爆发',
      description: '下2次攻击伤害+50%',
      stageRequired: 10,
      energyCost: 30,
      damageBuff: { bonus: 0.5, turns: 2 },
      imageId: 12,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 0.8, g: 0.2, b: 1 }
    }
  ]
}
```

---

## ⚔️ 筑基境（Realm 2）- 4个技能树

### 1. foundationSlash (筑基斩系) - 攻击

```javascript
{
  id: 'foundationSlash',
  name: '筑基斩系',
  realmRequired: 2,
  type: 'attack',
  levels: [
    {
      name: '基础剑术',
      description: '剑气斩击，造成3.2倍伤害',
      stageRequired: 1,
      energyCost: 20,
      damageMultiplier: 3.2,
      imageId: 13,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 0.5, g: 0.8, b: 1 }
    },
    {
      name: '剑气纵横',
      description: '强化剑气，造成3.6倍伤害，无视15%防御',
      stageRequired: 4,
      energyCost: 25,
      damageMultiplier: 3.6,
      armorPenetration: 0.15,
      imageId: 13,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 0.6, g: 0.8, b: 1 }
    },
    {
      name: '万剑归宗',
      description: '剑气爆发，造成4.0倍伤害，无视25%防御',
      stageRequired: 7,
      energyCost: 32,
      damageMultiplier: 4.0,
      armorPenetration: 0.25,
      imageId: 13,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 0.7, g: 0.9, b: 1 }
    },
    {
      name: '筑基神剑',
      description: '筑基境巅峰，造成4.5倍伤害，无视30%防御，+10%暴击率',
      stageRequired: 10,
      energyCost: 40,
      damageMultiplier: 4.5,
      armorPenetration: 0.3,
      criticalBonus: 0.1,
      imageId: 13,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 0.8, g: 1, b: 1 }
    }
  ]
}
```

### 2. foundationArmor (筑基甲系) - 防御

```javascript
{
  id: 'foundationArmor',
  name: '筑基甲系',
  realmRequired: 2,
  type: 'defense',
  levels: [
    {
      name: '筑基护甲',
      description: '减伤40%，恢复5%HP',
      stageRequired: 1,
      energyCost: 22,
      defenseBonus: 0.4,
      healPercentage: 0.05,
      imageId: 14,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 0.5, g: 0.8, b: 0.9 }
    },
    {
      name: '灵力护甲',
      description: '减伤45%，恢复8%HP',
      stageRequired: 4,
      energyCost: 28,
      defenseBonus: 0.45,
      healPercentage: 0.08,
      imageId: 14,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 0.6, g: 0.9, b: 1 }
    },
    {
      name: '玄武护甲',
      description: '减伤50%，恢复12%HP，反弹8%伤害',
      stageRequired: 7,
      energyCost: 35,
      defenseBonus: 0.5,
      healPercentage: 0.12,
      reflectDamage: 0.08,
      imageId: 14,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 0.7, g: 1, b: 1 }
    },
    {
      name: '筑基神甲',
      description: '减伤60%，恢复15%HP，反弹12%伤害',
      stageRequired: 10,
      energyCost: 45,
      defenseBonus: 0.6,
      healPercentage: 0.15,
      reflectDamage: 0.12,
      imageId: 14,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 0.8, g: 1, b: 0.9 }
    }
  ]
}
```

### 3. foundationHeal (筑基恢复系) - 恢复

```javascript
{
  id: 'foundationHeal',
  name: '筑基恢复系',
  realmRequired: 2,
  type: 'recovery',
  levels: [
    {
      name: '筑基恢复',
      description: '恢复28%最大HP',
      stageRequired: 1,
      energyCost: 25,
      healPercentage: 0.28,
      imageId: 15,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.3, g: 1, b: 0.3 }
    },
    {
      name: '生命之泉',
      description: '恢复32%最大HP，持续恢复5回合',
      stageRequired: 4,
      energyCost: 30,
      healPercentage: 0.32,
      hot: { healPercent: 0.04, turns: 5 },
      imageId: 15,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.4, g: 1, b: 0.4 }
    },
    {
      name: '灵丹妙药',
      description: '恢复38%最大HP，持续恢复5回合，清除负面状态',
      stageRequired: 7,
      energyCost: 36,
      healPercentage: 0.38,
      hot: { healPercent: 0.05, turns: 5 },
      purify: true,
      imageId: 15,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.5, g: 1, b: 0.5 }
    },
    {
      name: '筑基涅槃',
      description: '恢复45%最大HP，持续恢复8回合，清除负面状态，+10%防御',
      stageRequired: 10,
      energyCost: 42,
      healPercentage: 0.45,
      hot: { healPercent: 0.06, turns: 8 },
      purify: true,
      defenseBonus: 0.1,
      imageId: 15,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.6, g: 1, b: 0.6 }
    }
  ]
}
```

### 4. foundationArt (筑基术系) - 特殊

```javascript
{
  id: 'foundationArt',
  name: '筑基术系',
  realmRequired: 2,
  type: 'special',
  levels: [
    {
      name: '分身术',
      description: '召唤分身，下次攻击伤害+30%',
      stageRequired: 1,
      energyCost: 25,
      damageBuff: { bonus: 0.3, turns: 1 },
      imageId: 16,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 0.8, g: 0.8, b: 1 }
    },
    {
      name: '筑基领域',
      description: '25%防御 + 20%闪避 + 下次攻击伤害+40%',
      stageRequired: 4,
      energyCost: 32,
      defenseBonus: 0.25,
      dodgeBonus: 0.2,
      damageBuff: { bonus: 0.4, turns: 1 },
      imageId: 16,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 0.9, g: 0.9, b: 1 }
    },
    {
      name: '玄妙之门',
      description: '30%防御 + 25%闪避 + 下2次攻击伤害+50%',
      stageRequired: 7,
      energyCost: 40,
      defenseBonus: 0.3,
      dodgeBonus: 0.25,
      damageBuff: { bonus: 0.5, turns: 2 },
      imageId: 16,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 1, g: 1, b: 1 }
    },
    {
      name: '筑基大成',
      description: '35%防御 + 30%闪避 + 下3次攻击伤害+60%，免疫控制',
      stageRequired: 10,
      energyCost: 48,
      defenseBonus: 0.35,
      dodgeBonus: 0.3,
      damageBuff: { bonus: 0.6, turns: 3 },
      immuneCC: true,
      imageId: 16,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 1, g: 0.9, b: 1 }
    }
  ]
}
```

---

---

## 💎 金丹境（Realm 3）- 4个技能树

### 1. goldenCore (金丹掌系) - 攻击

```javascript
{
  id: 'goldenCore',
  name: '金丹掌系',
  realmRequired: 3,
  type: 'attack',
  levels: [
    {
      name: '金丹初掌',
      description: '金丹之力，造成4.8倍伤害',
      stageRequired: 1,
      energyCost: 25,
      damageMultiplier: 4.8,
      imageId: 17,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 1, g: 0.8, b: 0 }
    },
    {
      name: '金丹掌',
      description: '强化金丹掌，造成5.3倍伤害，眩晕敌人1回合',
      stageRequired: 4,
      energyCost: 32,
      damageMultiplier: 5.3,
      stun: 1,
      imageId: 17,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 1, g: 0.9, b: 0 }
    },
    {
      name: '金丹爆发',
      description: '金丹爆发，造成5.8倍伤害，眩晕1回合，无视20%防御',
      stageRequired: 7,
      energyCost: 40,
      damageMultiplier: 5.8,
      stun: 1,
      armorPenetration: 0.2,
      imageId: 17,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 1, g: 1, b: 0 }
    },
    {
      name: '金丹神掌',
      description: '金丹境巅峰，造成6.5倍伤害，眩晕2回合，无视30%防御',
      stageRequired: 10,
      energyCost: 52,
      damageMultiplier: 6.5,
      stun: 2,
      armorPenetration: 0.3,
      imageId: 17,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 1, g: 0.9, b: 0.2 }
    }
  ]
}
```

### 2. goldenArmor (金丹甲系) - 防御

```javascript
{
  id: 'goldenArmor',
  name: '金丹甲系',
  realmRequired: 3,
  type: 'defense',
  levels: [
    {
      name: '金丹护甲',
      description: '减伤50%，护盾吸收300点伤害',
      stageRequired: 1,
      energyCost: 28,
      defenseBonus: 0.5,
      shield: 300,
      imageId: 18,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 1, g: 0.9, b: 0.3 }
    },
    {
      name: '金光护体',
      description: '减伤55%，护盾吸收400点伤害，反弹10%伤害',
      stageRequired: 4,
      energyCost: 35,
      defenseBonus: 0.55,
      shield: 400,
      reflectDamage: 0.1,
      imageId: 18,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 1, g: 0.95, b: 0.4 }
    },
    {
      name: '不灭金身',
      description: '减伤60%，护盾吸收500点伤害，反弹15%伤害',
      stageRequired: 7,
      energyCost: 45,
      defenseBonus: 0.6,
      shield: 500,
      reflectDamage: 0.15,
      imageId: 18,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 1, g: 1, b: 0.5 }
    },
    {
      name: '金丹神甲',
      description: '减伤70%，护盾吸收600点伤害，反弹20%伤害，免疫控制',
      stageRequired: 10,
      energyCost: 55,
      defenseBonus: 0.7,
      shield: 600,
      reflectDamage: 0.2,
      immuneCC: true,
      imageId: 18,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 1, g: 0.95, b: 0.6 }
    }
  ]
}
```

### 3. goldenHeal (金丹治疗系) - 恢复

```javascript
{
  id: 'goldenHeal',
  name: '金丹治疗系',
  realmRequired: 3,
  type: 'recovery',
  levels: [
    {
      name: '金丹恢复',
      description: '恢复42%最大HP',
      stageRequired: 1,
      energyCost: 30,
      healPercentage: 0.42,
      imageId: 19,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.6, g: 1, b: 0.6 }
    },
    {
      name: '金丹之愈',
      description: '恢复48%最大HP，恢复30点能量',
      stageRequired: 4,
      energyCost: 36,
      healPercentage: 0.48,
      energyRecover: 30,
      imageId: 19,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.7, g: 1, b: 0.7 }
    },
    {
      name: '金丹妙药',
      description: '恢复55%最大HP，恢复40点能量，清除负面状态',
      stageRequired: 7,
      energyCost: 42,
      healPercentage: 0.55,
      energyRecover: 40,
      purify: true,
      imageId: 19,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.8, g: 1, b: 0.8 }
    },
    {
      name: '金丹涅槃',
      description: '恢复65%最大HP，恢复50点能量，清除负面状态，+15%防御持续3回合',
      stageRequired: 10,
      energyCost: 50,
      healPercentage: 0.65,
      energyRecover: 50,
      purify: true,
      defenseBonus: 0.15,
      imageId: 19,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.9, g: 1, b: 0.9 }
    }
  ]
}
```

### 4. goldenCorePower (金丹之力系) - 特殊

```javascript
{
  id: 'goldenCorePower',
  name: '金丹之力系',
  realmRequired: 3,
  type: 'special',
  levels: [
    {
      name: '金丹爆发',
      description: '下2次攻击伤害+60%',
      stageRequired: 1,
      energyCost: 35,
      damageBuff: { bonus: 0.6, turns: 2 },
      imageId: 20,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 1, g: 0.9, b: 0.5 }
    },
    {
      name: '金丹领域',
      description: '30%防御 + 30%闪避 + 下2次攻击伤害+70%',
      stageRequired: 4,
      energyCost: 42,
      defenseBonus: 0.3,
      dodgeBonus: 0.3,
      damageBuff: { bonus: 0.7, turns: 2 },
      imageId: 20,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 1, g: 0.95, b: 0.6 }
    },
    {
      name: '金丹之力',
      description: '35%防御 + 35%闪避 + 下3次攻击伤害+80%，恢复30点能量',
      stageRequired: 7,
      energyCost: 50,
      defenseBonus: 0.35,
      dodgeBonus: 0.35,
      damageBuff: { bonus: 0.8, turns: 3 },
      energyRecover: 30,
      imageId: 20,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 1, g: 1, b: 0.7 }
    },
    {
      name: '金丹大成',
      description: '40%防御 + 40%闪避 + 下4次攻击伤害+100%，恢复40点能量，免疫控制',
      stageRequired: 10,
      energyCost: 60,
      defenseBonus: 0.4,
      dodgeBonus: 0.4,
      damageBuff: { bonus: 1.0, turns: 4 },
      energyRecover: 40,
      immuneCC: true,
      imageId: 20,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 1, g: 1, b: 0.8 }
    }
  ]
}
```

---

## 👶 元婴境（Realm 4）- 4个技能树

### 1. infantStrike (元婴击系) - 攻击

```javascript
{
  id: 'infantStrike',
  name: '元婴击系',
  realmRequired: 4,
  type: 'attack',
  levels: [
    {
      name: '元婴初现',
      description: '元婴之力，造成6.8倍伤害',
      stageRequired: 1,
      energyCost: 35,
      damageMultiplier: 6.8,
      imageId: 21,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 0.8, g: 0.2, b: 1 }
    },
    {
      name: '元婴出击',
      description: '元婴攻击，造成7.5倍伤害，额外造成10%敌人最大生命伤害',
      stageRequired: 4,
      energyCost: 42,
      damageMultiplier: 7.5,
      extraDamagePercent: 0.1,
      imageId: 21,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 0.9, g: 0.3, b: 1 }
    },
    {
      name: '元婴寂灭',
      description: '元婴寂灭一击，造成8.2倍伤害，对生命低于25%敌人额外2倍伤害',
      stageRequired: 7,
      energyCost: 50,
      damageMultiplier: 8.2,
      executeMultiplier: 2.0,
      executeThreshold: 0.25,
      imageId: 21,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 1, g: 0.4, b: 1 }
    },
    {
      name: '元婴灭世',
      description: '元婴境巅峰，造成9.0倍伤害，斩杀生命低于35%敌人',
      stageRequired: 10,
      energyCost: 65,
      damageMultiplier: 9.0,
      executeThreshold: 0.35,
      imageId: 21,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 1, g: 0.2, b: 0.8 }
    }
  ]
}
```

### 2. infantGuard (元婴护系) - 防御

```javascript
{
  id: 'infantGuard',
  name: '元婴护系',
  realmRequired: 4,
  type: 'defense',
  levels: [
    {
      name: '元婴护盾',
      description: '减伤60%，护盾吸收700点伤害，反弹20%伤害',
      stageRequired: 1,
      energyCost: 35,
      defenseBonus: 0.6,
      shield: 700,
      reflectDamage: 0.2,
      imageId: 22,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 0.9, g: 0.5, b: 1 }
    },
    {
      name: '元婴神盾',
      description: '减伤65%，护盾吸收800点伤害，反弹25%伤害，免疫控制',
      stageRequired: 4,
      energyCost: 42,
      defenseBonus: 0.65,
      shield: 800,
      reflectDamage: 0.25,
      immuneCC: true,
      imageId: 22,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 0.95, g: 0.6, b: 1 }
    },
    {
      name: '元婴金身',
      description: '减伤70%，护盾吸收900点伤害，反弹30%伤害，免疫控制，恢复10%HP',
      stageRequired: 7,
      energyCost: 50,
      defenseBonus: 0.7,
      shield: 900,
      reflectDamage: 0.3,
      immuneCC: true,
      healPercentage: 0.1,
      imageId: 22,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 1, g: 0.7, b: 1 }
    },
    {
      name: '元婴神护',
      description: '减伤80%，护盾吸收1000点伤害，反弹35%伤害，免疫控制，恢复15%HP',
      stageRequired: 10,
      energyCost: 60,
      defenseBonus: 0.8,
      shield: 1000,
      reflectDamage: 0.35,
      immuneCC: true,
      healPercentage: 0.15,
      imageId: 22,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 1, g: 0.6, b: 0.9 }
    }
  ]
}
```

### 3. infantRecovery (元婴回复系) - 恢复

```javascript
{
  id: 'infantRecovery',
  name: '元婴回复系',
  realmRequired: 4,
  type: 'recovery',
  levels: [
    {
      name: '元婴回复',
      description: '恢复60%最大HP，恢复40点能量',
      stageRequired: 1,
      energyCost: 38,
      healPercentage: 0.6,
      energyRecover: 40,
      imageId: 23,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.8, g: 1, b: 0.8 }
    },
    {
      name: '元婴之愈',
      description: '恢复68%最大HP，恢复50点能量，清除负面状态',
      stageRequired: 4,
      energyCost: 45,
      healPercentage: 0.68,
      energyRecover: 50,
      purify: true,
      imageId: 23,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.85, g: 1, b: 0.85 }
    },
    {
      name: '元婴涅槃',
      description: '恢复78%最大HP，恢复60点能量，清除负面状态，持续恢复10回合',
      stageRequired: 7,
      energyCost: 52,
      healPercentage: 0.78,
      energyRecover: 60,
      purify: true,
      hot: { healPercent: 0.08, turns: 10 },
      imageId: 23,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.9, g: 1, b: 0.9 }
    },
    {
      name: '元婴重生',
      description: '恢复90%最大HP，恢复80点能量，清除负面状态，持续恢复10回合，+20%防御',
      stageRequired: 10,
      energyCost: 60,
      healPercentage: 0.9,
      energyRecover: 80,
      purify: true,
      hot: { healPercent: 0.1, turns: 10 },
      defenseBonus: 0.2,
      imageId: 23,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.95, g: 1, b: 0.95 }
    }
  ]
}
```

### 4. infantVision (元婴之眼系) - 特殊

```javascript
{
  id: 'infantVision',
  name: '元婴之眼系',
  realmRequired: 4,
  type: 'special',
  levels: [
    {
      name: '元婴之眼',
      description: '40%闪避 + 15%暴击率 + 下3次攻击伤害+80%',
      stageRequired: 1,
      energyCost: 45,
      dodgeBonus: 0.4,
      criticalBonus: 0.15,
      damageBuff: { bonus: 0.8, turns: 3 },
      imageId: 24,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 0.9, g: 0.8, b: 1 }
    },
    {
      name: '神识感应',
      description: '45%闪避 + 20%暴击率 + 下3次攻击伤害+90%，恢复40点能量',
      stageRequired: 4,
      energyCost: 52,
      dodgeBonus: 0.45,
      criticalBonus: 0.2,
      damageBuff: { bonus: 0.9, turns: 3 },
      energyRecover: 40,
      imageId: 24,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 0.95, g: 0.85, b: 1 }
    },
    {
      name: '元婴领域',
      description: '50%闪避 + 25%暴击率 + 下4次攻击伤害+100%，恢复50点能量，免疫控制',
      stageRequired: 7,
      energyCost: 60,
      dodgeBonus: 0.5,
      criticalBonus: 0.25,
      damageBuff: { bonus: 1.0, turns: 4 },
      energyRecover: 50,
      immuneCC: true,
      imageId: 24,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 1, g: 0.9, b: 1 }
    },
    {
      name: '元婴大成',
      description: '55%闪避 + 30%暴击率 + 下5次攻击伤害+120%，恢复60点能量，免疫控制',
      stageRequired: 10,
      energyCost: 70,
      dodgeBonus: 0.55,
      criticalBonus: 0.3,
      damageBuff: { bonus: 1.2, turns: 5 },
      energyRecover: 60,
      immuneCC: true,
      imageId: 24,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 1, g: 0.85, b: 0.95 }
    }
  ]
}
```

---

## ⚡ 化神境（Realm 5）- 4个技能树

### 1. deityFist (化神拳系) - 攻击

```javascript
{
  id: 'deityFist',
  name: '化神拳系',
  realmRequired: 5,
  type: 'attack',
  levels: [
    {
      name: '化神一击',
      description: '化神之力，造成9.5倍伤害',
      stageRequired: 1,
      energyCost: 45,
      damageMultiplier: 9.5,
      imageId: 25,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 1, g: 0.5, b: 0.5 }
    },
    {
      name: '化神拳',
      description: '化神拳力，造成10.5倍伤害，无视40%防御',
      stageRequired: 4,
      energyCost: 55,
      damageMultiplier: 10.5,
      armorPenetration: 0.4,
      imageId: 25,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 1, g: 0.6, b: 0.6 }
    },
    {
      name: '鸿蒙紫气',
      description: '鸿蒙紫气，造成11.5倍伤害，对生命低于20%敌人额外3倍伤害',
      stageRequired: 7,
      energyCost: 65,
      damageMultiplier: 11.5,
      executeMultiplier: 3.0,
      executeThreshold: 0.2,
      imageId: 25,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 0.8, g: 0.4, b: 1 }
    },
    {
      name: '天地同寿',
      description: '化神境巅峰，造成13.0倍伤害，必定暴击，无视50%防御',
      stageRequired: 10,
      energyCost: 80,
      damageMultiplier: 13.0,
      guaranteedCrit: true,
      armorPenetration: 0.5,
      imageId: 25,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
      effectColor: { r: 1, g: 0.8, b: 1 }
    }
  ]
}
```

### 2. deityShield (神盾系) - 防御

```javascript
{
  id: 'deityShield',
  name: '神盾系',
  realmRequired: 5,
  type: 'defense',
  levels: [
    {
      name: '神之守护',
      description: '减伤70%，护盾吸收1200点伤害，完全免疫下次攻击',
      stageRequired: 1,
      energyCost: 45,
      defenseBonus: 0.7,
      shield: 1200,
      immuneNextAttack: true,
      imageId: 26,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 1, g: 0.9, b: 0.7 }
    },
    {
      name: '神盾护体',
      description: '减伤75%，护盾吸收1400点伤害，完全免疫下次攻击，反弹25%伤害',
      stageRequired: 4,
      energyCost: 55,
      defenseBonus: 0.75,
      shield: 1400,
      immuneNextAttack: true,
      reflectDamage: 0.25,
      imageId: 26,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 1, g: 0.95, b: 0.8 }
    },
    {
      name: '不灭神盾',
      description: '减伤80%，护盾吸收1600点伤害，完全免疫下次攻击，反弹30%伤害，恢复15%HP',
      stageRequired: 7,
      energyCost: 65,
      defenseBonus: 0.8,
      shield: 1600,
      immuneNextAttack: true,
      reflectDamage: 0.3,
      healPercentage: 0.15,
      imageId: 26,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 1, g: 1, b: 0.9 }
    },
    {
      name: '化神神盾',
      description: '减伤90%，护盾吸收2000点伤害，完全免疫下次攻击，反弹40%伤害，恢复20%HP，免疫控制',
      stageRequired: 10,
      energyCost: 75,
      defenseBonus: 0.9,
      shield: 2000,
      immuneNextAttack: true,
      reflectDamage: 0.4,
      healPercentage: 0.2,
      immuneCC: true,
      imageId: 26,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      effectColor: { r: 1, g: 1, b: 1 }
    }
  ]
}
```

### 3. deityBlessing (神佑系) - 恢复

```javascript
{
  id: 'deityBlessing',
  name: '神佑系',
  realmRequired: 5,
  type: 'recovery',
  levels: [
    {
      name: '神佑',
      description: '恢复85%最大HP，恢复60点能量，清除负面状态',
      stageRequired: 1,
      energyCost: 48,
      healPercentage: 0.85,
      energyRecover: 60,
      purify: true,
      imageId: 27,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.95, g: 1, b: 0.95 }
    },
    {
      name: '神之恩赐',
      description: '恢复95%最大HP，恢复80点能量，清除负面状态，持续恢复12回合',
      stageRequired: 4,
      energyCost: 55,
      healPercentage: 0.95,
      energyRecover: 80,
      purify: true,
      hot: { healPercent: 0.1, turns: 12 },
      imageId: 27,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.97, g: 1, b: 0.97 }
    },
    {
      name: '化神涅槃',
      description: '恢复110%最大HP，恢复100点能量，清除负面状态，持续恢复12回合，+25%防御',
      stageRequired: 7,
      energyCost: 62,
      healPercentage: 1.1,
      energyRecover: 100,
      purify: true,
      hot: { healPercent: 0.12, turns: 12 },
      defenseBonus: 0.25,
      imageId: 27,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 0.99, g: 1, b: 0.99 }
    },
    {
      name: '天地造化',
      description: '恢复130%最大HP（可超量治疗），恢复120点能量，清除负面状态，持续恢复15回合，+30%全属性',
      stageRequired: 10,
      energyCost: 70,
      healPercentage: 1.3,
      energyRecover: 120,
      purify: true,
      hot: { healPercent: 0.15, turns: 15 },
      allStatsBonus: 0.3,
      imageId: 27,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      effectColor: { r: 1, g: 1, b: 1 }
    }
  ]
}
```

### 4. deityForm (化神形态系) - 特殊

```javascript
{
  id: 'deityForm',
  name: '化神形态系',
  realmRequired: 5,
  type: 'special',
  levels: [
    {
      name: '化神形态',
      description: '50%全属性 + 下4次攻击伤害+100%，免疫控制',
      stageRequired: 1,
      energyCost: 60,
      allStatsBonus: 0.5,
      damageBuff: { bonus: 1.0, turns: 4 },
      immuneCC: true,
      imageId: 28,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 1, g: 0.9, b: 0.9 }
    },
    {
      name: '化神之力',
      description: '60%全属性 + 下5次攻击伤害+120%，免疫控制，恢复60点能量',
      stageRequired: 4,
      energyCost: 70,
      allStatsBonus: 0.6,
      damageBuff: { bonus: 1.2, turns: 5 },
      immuneCC: true,
      energyRecover: 60,
      imageId: 28,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 1, g: 0.95, b: 0.95 }
    },
    {
      name: '化神领域',
      description: '70%全属性 + 下6次攻击伤害+150%，免疫控制，恢复80点能量，必定暴击',
      stageRequired: 7,
      energyCost: 80,
      allStatsBonus: 0.7,
      damageBuff: { bonus: 1.5, turns: 6 },
      immuneCC: true,
      energyRecover: 80,
      guaranteedCrit: true,
      imageId: 28,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 1, g: 1, b: 1 }
    },
    {
      name: '化神大成',
      description: '80%全属性 + 下8次攻击伤害+200%，免疫控制，恢复100点能量，必定暴击，无视60%防御',
      stageRequired: 10,
      energyCost: 90,
      allStatsBonus: 0.8,
      damageBuff: { bonus: 2.0, turns: 8 },
      immuneCC: true,
      energyRecover: 100,
      guaranteedCrit: true,
      armorPenetration: 0.6,
      imageId: 28,
      soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
      effectColor: { r: 1, g: 0.95, b: 1 }
    }
  ]
}
```

---

## 📝 完整技能树总结

**总计**:
- ✅ 6个境界
- ✅ 24个技能树
- ✅ 约90个技能等级（部分技能树只有2-3级）

**特点**:
- ✅ 境界压制明显
- ✅ 成长曲线合理
- ✅ 效果平衡
- ✅ 符合修仙设定

---

**设计完成！** 🎉
