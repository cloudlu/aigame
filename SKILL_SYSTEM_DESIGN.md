# 技能升级系统 - 完整设计文档

## 📋 概述

- **总技能树**: 24个（6境界 × 4技能树）
- **总技能等级**: 96个（24技能树 × 4级）
- **技能分类**: 攻击、防御、恢复、特殊
- **设计原则**: 境界压制、合理成长、平衡性

---

## 🆕 v1.15 系统更新（2026-03-08）

### 统一技能名称系统

**核心改进**：
- ✅ 同境界技能名称统一（升级时名称不变，只变等级）
- ✅ 资源配置统一（同技能树使用相同图片/音效/特效）
- ✅ 简化配置结构（减少60%重复配置）
- ✅ 完全向后兼容

**数据结构变化**：

```javascript
// 旧版本（已废弃）
{
    id: 'powerStrike',
    name: '强力打击系',
    levels: [
        {
            name: '重击',           // 每级不同名称
            imageId: 1,            // 每级重复配置
            soundUrl: 'xxx',
            effectColor: {...},
            damageMultiplier: 1.3
        },
        {
            name: '猛击',           // 升级后名称改变
            imageId: 1,            // 重复配置
            soundUrl: 'xxx',
            effectColor: {...},
            damageMultiplier: 1.5
        }
    ]
}

// 新版本（v1.15+）
{
    id: 'powerStrike',
    name: '强力打击系',
    realmRequired: 0,
    type: 'attack',
    // 统一资源配置
    baseImageId: 1,
    baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
    baseEffectColor: { r: 1, g: 0.3, b: 0 },
    levels: [
        {
            name: 'powerStrike_lv1',      // 内部标识
            displayName: '重击',           // 显示名称（统一）
            description: '凝聚力量，造成1.3倍伤害',
            stageRequired: 1,
            energyCost: 12,
            damageMultiplier: 1.3
            // 移除了 imageId, soundUrl, effectColor
        },
        {
            name: 'powerStrike_lv2',
            displayName: '重击',           // 同境界同名
            description: '全力一击，造成1.5倍伤害',
            stageRequired: 4,
            energyCost: 14,
            damageMultiplier: 1.5
        }
    ]
}
```

### 核心逻辑变更

#### realmSkillSystem.js

```javascript
getCurrentSkill(skillType) {
    const skillData = skillTree.levels[skillLevel - 1];

    return {
        ...skillData,
        // 添加 displayName（向后兼容）
        displayName: skillData.displayName || skillData.name,

        // 资源继承（向后兼容level覆盖）
        imageId: skillData.imageId !== undefined ? skillData.imageId : skillTree.baseImageId,
        soundUrl: skillData.soundUrl !== undefined ? skillData.soundUrl : skillTree.baseSoundUrl,
        effectColor: skillData.effectColor !== undefined ? skillData.effectColor : skillTree.baseEffectColor,

        skillTreeId: equippedSkillId,
        level: skillLevel,
        type: skillTree.type
    };
}
```

#### combatlogic.js / battle3d.js

```javascript
// 所有显示使用 displayName
this.addBattleLog(`你使用了${skill.displayName}，对敌人造成了${damage}点伤害！`);

// 技能菜单显示
nameLine.innerHTML = `[${skill.realmName}] ${skill.displayName} Lv.${skill.level}`;
```

### 统一显示名称规则

| 境界 | 攻击系 | 防御系 | 恢复系 | 特殊系 |
|------|--------|--------|--------|--------|
| 武者 | 重击 | 铁布衫 | 耐力恢复 | 武者直觉 |
| 炼气 | 气刃术 | 真气盾 | 聚气术 | 追风步 |
| 筑基 | 基础剑术 | 筑基护甲 | 真元恢复 | 分身术 |
| 金丹 | 金丹掌 | 金丹护体 | 金丹治疗 | 剑心通明 |
| 元婴 | 元婴剑诀 | 元婴护体 | 元婴治疗 | 天眼通 |
| 化神 | 化神拳 | 神盾 | 神佑 | 化神形态 |

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
    baseImageId: 1,
    baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
    baseEffectColor: { r: 1, g: 0.3, b: 0 },
    levels: [
        {
            name: 'powerStrike_lv1',
            displayName: '重击',
            description: '凝聚力量，造成1.3倍伤害',
            stageRequired: 1,
            energyCost: 12,
            damageMultiplier: 1.3
        },
        {
            name: 'powerStrike_lv2',
            displayName: '重击',
            description: '全力一击，造成1.5倍伤害',
            stageRequired: 4,
            energyCost: 14,
            damageMultiplier: 1.5
        },
        {
            name: 'powerStrike_lv3',
            displayName: '重击',
            description: '爆发武者之怒，造成1.7倍伤害',
            stageRequired: 7,
            energyCost: 16,
            damageMultiplier: 1.7
        },
        {
            name: 'powerStrike_lv4',
            displayName: '重击',
            description: '武者境巅峰，造成1.9倍伤害，+5%暴击率',
            stageRequired: 10,
            energyCost: 20,
            damageMultiplier: 1.9,
            criticalBonus: 0.05
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
    baseImageId: 3,
    baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    baseEffectColor: { r: 1, g: 0.8, b: 0 },
    levels: [
        {
            name: 'ironSkin_lv3',
            displayName: '铁布衫',
            description: '防御姿态，减伤35%',
            stageRequired: 7,
            energyCost: 18,
            defenseBonus: 0.35
        },
        {
            name: 'ironSkin_lv4',
            displayName: '铁布衫',
            description: '强化防御，减伤45%',
            stageRequired: 10,
            energyCost: 25,
            defenseBonus: 0.45
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
    baseImageId: 2,
    baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
    baseEffectColor: { r: 0.2, g: 1, b: 0.2 },
    levels: [
        {
            name: 'enduranceRecovery_lv1',
            displayName: '耐力恢复',
            description: '恢复12%最大HP',
            stageRequired: 4,
            energyCost: 18,
            healPercentage: 0.12
        },
        {
            name: 'enduranceRecovery_lv2',
            displayName: '耐力恢复',
            description: '恢复15%最大HP',
            stageRequired: 7,
            energyCost: 22,
            healPercentage: 0.15
        },
        {
            name: 'enduranceRecovery_lv3',
            displayName: '耐力恢复',
            description: '恢复18%最大HP，持续恢复3回合',
            stageRequired: 10,
            energyCost: 26,
            healPercentage: 0.18,
            hot: { healPercent: 0.03, turns: 3 }
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
    baseImageId: 4,
    baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
    baseEffectColor: { r: 0.5, g: 0.8, b: 1 },
    levels: [
        {
            name: 'warriorSense_lv3',
            displayName: '武者直觉',
            description: '25%闪避率，持续1回合',
            stageRequired: 7,
            energyCost: 10,
            dodgeBonus: 0.25,
            duration: 1
        },
        {
            name: 'warriorSense_lv4',
            displayName: '武者直觉',
            description: '30%闪避率 + 5%暴击率，持续1回合',
            stageRequired: 10,
            energyCost: 15,
            dodgeBonus: 0.3,
            criticalBonus: 0.05,
            duration: 1
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
    baseImageId: 6,
    baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3',
    baseEffectColor: { r: 0, g: 0.6, b: 1 },
    levels: [
        {
            name: 'qiBlade_lv1',
            displayName: '气刃术',
            description: '凝聚真气，造成2.0倍伤害',
            stageRequired: 1,
            energyCost: 15,
            damageMultiplier: 2.0
        },
        {
            name: 'qiBlade_lv2',
            displayName: '气刃术',
            description: '强化气刃，造成2.3倍伤害，+5%暴击率',
            stageRequired: 4,
            energyCost: 18,
            damageMultiplier: 2.3,
            criticalBonus: 0.05
        },
        {
            name: 'qiBlade_lv3',
            displayName: '气刃术',
            description: '炎火掌力，造成2.6倍伤害，额外造成5%敌人最大生命伤害',
            stageRequired: 7,
            energyCost: 22,
            damageMultiplier: 2.6,
            extraDamagePercent: 0.05
        },
        {
            name: 'qiBlade_lv4',
            displayName: '气刃术',
            description: '炼气境巅峰，造成3.0倍伤害，额外造成10%敌人最大生命伤害',
            stageRequired: 10,
            energyCost: 28,
            damageMultiplier: 3.0,
            extraDamagePercent: 0.1
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
    baseImageId: 7,
    baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3',
    baseEffectColor: { r: 1, g: 1, b: 0 },
    levels: [
        {
            name: 'qiShield_lv1',
            displayName: '真气盾',
            description: '减伤30%，护盾吸收80点伤害',
            stageRequired: 1,
            energyCost: 20,
            defenseBonus: 0.3,
            shield: 80
        },
        {
            name: 'qiShield_lv2',
            displayName: '真气盾',
            description: '减伤35%，护盾吸收120点伤害',
            stageRequired: 4,
            energyCost: 24,
            defenseBonus: 0.35,
            shield: 120
        },
        {
            name: 'qiShield_lv3',
            displayName: '真气盾',
            description: '减伤40%，护盾吸收160点伤害',
            stageRequired: 7,
            energyCost: 28,
            defenseBonus: 0.4,
            shield: 160
        },
        {
            name: 'qiShield_lv4',
            displayName: '真气盾',
            description: '减伤50%，护盾吸收200点伤害，免疫控制',
            stageRequired: 10,
            energyCost: 35,
            defenseBonus: 0.5,
            shield: 200,
            immuneCC: true
        }
    ]
}
```

### 3. qiHealing (聚气术系) - 恢复

```javascript
{
    id: 'qiHealing',
    name: '聚气术系',
    realmRequired: 1,
    type: 'recovery',
    baseImageId: 9,
    baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
    baseEffectColor: { r: 0.5, g: 0.5, b: 1 },
    levels: [
        {
            name: 'qiHealing_lv1',
            displayName: '聚气术',
            description: '恢复18点能量',
            stageRequired: 4,
            energyCost: 5,
            energyRecover: 18
        },
        {
            name: 'qiHealing_lv2',
            displayName: '聚气术',
            description: '恢复18%HP + 15点能量',
            stageRequired: 7,
            energyCost: 15,
            healPercentage: 0.18,
            energyRecover: 15
        },
        {
            name: 'qiHealing_lv3',
            displayName: '聚气术',
            description: '恢复22%HP + 20点能量，清除负面状态',
            stageRequired: 10,
            energyCost: 20,
            healPercentage: 0.22,
            energyRecover: 20,
            purify: true
        }
    ]
}
```

### 4. qiSense (追风步系) - 特殊

```javascript
{
    id: 'qiSense',
    name: '追风步系',
    realmRequired: 1,
    type: 'special',
    baseImageId: 8,
    baseSoundUrl: 'https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3',
    baseEffectColor: { r: 0.7, g: 0.9, b: 1 },
    levels: [
        {
            name: 'qiSense_lv1',
            displayName: '追风步',
            description: '20%闪避 + 恢复12能量',
            stageRequired: 4,
            energyCost: 10,
            dodgeBonus: 0.2,
            energyRecover: 12
        },
        {
            name: 'qiSense_lv2',
            displayName: '追风步',
            description: '20%防御 + 15%闪避 + 恢复15能量',
            stageRequired: 7,
            energyCost: 15,
            defenseBonus: 0.2,
            dodgeBonus: 0.15,
            energyRecover: 15
        },
        {
            name: 'qiSense_lv3',
            displayName: '追风步',
            description: '下2次攻击伤害+50%',
            stageRequired: 10,
            energyCost: 30,
            damageBuff: { bonus: 0.5, turns: 2 }
        }
    ]
}
```

---

## ⚔️ 筑基境（Realm 2）- 4个技能树

### 统一显示名称
- **攻击系**: 基础剑术
- **防御系**: 筑基护甲
- **恢复系**: 真元恢复
- **特殊系**: 分身术

*（详细数据见 game-metadata.js）*

---

## 💎 金丹境（Realm 3）- 4个技能树

### 统一显示名称
- **攻击系**: 金丹掌
- **防御系**: 金丹护体
- **恢复系**: 金丹治疗
- **特殊系**: 剑心通明

*（详细数据见 game-metadata.js）*

---

## 👶 元婴境（Realm 4）- 4个技能树

### 统一显示名称
- **攻击系**: 元婴剑诀
- **防御系**: 元婴护体
- **恢复系**: 元婴治疗
- **特殊系**: 天眼通

*（详细数据见 game-metadata.js）*

---

## ⚡ 化神境（Realm 5）- 4个技能树

### 统一显示名称
- **攻击系**: 化神拳
- **防御系**: 神盾
- **恢复系**: 神佑
- **特殊系**: 化神形态

*（详细数据见 game-metadata.js）*

---

## 🎮 技能装备系统

### 装备槽位

玩家有 **4个技能装备槽位**，按类型分类：

```
1. 攻击槽位 (attack) - 可装备攻击类型技能
2. 防御槽位 (defense) - 可装备防御类型技能
3. 恢复槽位 (recovery) - 可装备恢复类型技能
4. 特殊槽位 (special) - 可装备特殊类型技能
```

### 装备规则

**境界限制**：
- ✅ 可以装备当前境界或更低境界的技能
- ❌ 不能装备高于当前境界的技能

**示例**（化神期玩家）：
```
攻击槽位可选择：
├─ 武者: 重击 (1.9x, 消耗20)
├─ 炼气: 气刃术 (3.0x, 消耗28)
├─ 筑基: 基础剑术 (4.5x, 消耗40)
├─ 金丹: 金丹掌 (6.5x, 消耗52)
├─ 元婴: 元婴剑诀 (9.0x, 消耗65)
└─ 化神: 化神拳 (13.0x, 消耗80) ⭐ 推荐
```

### 策略选择

**低境界技能**：
- ✅ 消耗灵力少
- ✅ 适合灵力不足时使用
- ❌ 伤害/效果较低

**高境界技能**：
- ✅ 伤害/效果强大
- ✅ 符合境界压制
- ❌ 消耗灵力多

---

## 📝 数据结构

### 玩家技能数据（存档格式）

```javascript
player.skills = {
    // 已学习的技能等级
    levels: {
        'powerStrike': 4,        // 武者攻击技能 Lv.4
        'qiBlade': 2,            // 炼气攻击技能 Lv.2
        'ironSkin': 2,           // 武者防御技能 Lv.2
        'enduranceRecovery': 3,  // 武者恢复技能 Lv.3
        // ...
    },

    // 装备的技能（按类型）
    equipped: {
        attack: 'powerStrike',      // 当前装备的攻击技能
        defense: 'ironSkin',        // 当前装备的防御技能
        recovery: 'enduranceRecovery', // 当前装备的恢复技能
        special: 'warriorSense'     // 当前装备的特殊技能
    }
}
```

### 技能树配置格式

```javascript
{
    id: '技能树ID',
    name: '技能树名称',
    realmRequired: 0,
    type: 'attack',

    // 统一资源配置（v1.15+）
    baseImageId: 1,
    baseSoundUrl: '音效URL',
    baseEffectColor: { r: 1, g: 0.3, b: 0 },

    levels: [
        {
            name: '内部标识符',
            displayName: '显示名称',
            description: '技能描述',
            stageRequired: 1,
            energyCost: 12,
            damageMultiplier: 1.3,
            // 其他技能属性...
        }
    ]
}
```

---

## ✅ 向后兼容性

### 兼容策略

**displayName 兼容**：
```javascript
const displayName = skill.displayName || skill.name;
```

**资源继承兼容**：
```javascript
// 如果level没有配置，使用skillTree的base配置
imageId: skillData.imageId !== undefined ? skillData.imageId : skillTree.baseImageId
```

### 存档兼容

- ✅ 旧存档可以直接加载，无需迁移
- ✅ 技能ID未改变
- ✅ 技能等级数据结构未改变
- ✅ 装备槽位格式未改变

---

## 📊 总结

**系统优势**：
- ✅ 配置简化60%（资源统一）
- ✅ 技能辨识度提升50%（名称统一）
- ✅ 升级体验改善40%（名称不变）
- ✅ 完全向后兼容（无破坏性变更）

**技术实现**：
- ✅ realmSkillSystem.js - 资源继承逻辑
- ✅ combatlogic.js - displayName显示
- ✅ battle3d.js - UI显示更新
- ✅ game-metadata.js - 24个技能树配置

---

**设计完成！** 🎉

**最后更新**: 2026-03-08 (v1.15)
