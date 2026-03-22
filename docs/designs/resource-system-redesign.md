# 资源系统重新设计方案

**创建时间**: 2026-03-21
**最后更新**: 2026-03-22 (v2.0资源统一完成)
**问题**: 资源供给过剩，消耗不足，资源副本无意义

---

## 📢 v2.0 更新说明

**2026-03-22 资源系统统一**:
- ✅ 删除冗余资源：`gold` → `spiritStones`，`wood` 已删除
- ✅ 统一货币系统：任务奖励使用 `spiritStones`
- ✅ 图鉴奖励更新：`wood+100` → `herbs+50, spiritStones+100`
- ✅ 删除重复自动战斗：移除 `autoPlay`，保留 `autoBattleSettings`

**当前资源系统**：
- `spiritStones` - 灵石（主要货币）
- `jade` - 仙玉（充值货币）
- `herbs` - 灵草（材料）
- `iron` - 玄铁（材料）
- `breakthroughStones` - 突破石

---

## 🔍 **现状分析**

### 当前问题

| 问题 | 现状 | 影响 |
|------|------|------|
| 自动采集 | ❌ 已移除（v2.0） | 资源获取途径单一 |
| 资源消耗 | ✅ 装备强化系统已实现 | 资源有消耗途径 |
| 装备合成 | ❌ 不消耗资源 | 木材/铁矿无用 |
| VIP特权 | ✅ 免费灵石 | 灵石获取途径之一 |

### 数据统计

```
资源产出（每日）:
- 副本挑战: 3副本 × 3次 = 9次挑战
- 灵石矿脉: 约9000-90000灵石（根据难度）
- 灵草园: 约270-2700灵草（根据难度）
- 玄铁矿: 约540-5400玄铁（根据难度）
- VIP每日: 500-5000灵石（根据等级）

资源消耗（每日）:
- 装备强化: 约1000-500000灵石 + 50-20000玄铁（根据强化等级）
- 装备属性刷新: 消耗灵草、玄铁、灵石
```

---

## 💡 **解决方案对比**

### 方案A：降低产出 ⭐⭐⭐⭐
**状态**: ❌ 已废弃（自动采集已移除）
**优点**: 简单有效
**缺点**: 玩家体验下降（感觉变"肝"了）

**具体调整**:
```javascript
// 已移除自动采集系统
// 资源现在只能通过副本获取
```

---

### 方案B：增加消耗 ⭐⭐⭐⭐⭐（推荐）
**优点**: 增加玩法深度
**缺点**: 需要开发新系统

**具体方案**:

#### 1. 装备强化系统 ✅ 已实现
```javascript
// 装备强化消耗（实际实现）
calculateRefineCost(refineLevel) {
    const spiritStonesBase = 1000;  // 灵石基数
    const ironBase = 50;            // 玄铁基数

    // 指数增长（配合副本产出）
    const spiritStonesMultiplier = Math.pow(2.0, refineLevel);
    const ironMultiplier = Math.pow(1.8, refineLevel);

    return {
        spiritStones: Math.floor(spiritStonesBase * spiritStonesMultiplier),
        iron: Math.floor(ironBase * ironMultiplier)
    };
}
```

#### 2. 炼丹系统 ❌ 未实现
```javascript
alchemy: {
    healing_pill: {
        materials: { herbs: 10, spiritStones: 100 },
        result: { healing_pill: 1 }
    },
    cultivation_pill: {
        materials: { herbs: 50, spiritStones: 500, crystal: 5 },
        result: { cultivation_pill: 1, exp_bonus: 200 }
    }
}
```

#### 3. 技能升级消耗 ❌ 未实现
```javascript
skillUpgrade: {
    cost: {
        spiritStones: 1000 * (skillLevel ** 2),
        wood: 100 * skillLevel,
        iron: 100 * skillLevel
    }
}
```

#### 4. 建筑升级系统（新） ❌ 未实现
```javascript
buildings: {
    meditation_room: {
        level_1: { wood: 1000, iron: 500, crystal: 50 },
        bonus: 'cultivation_speed +10%'
    },
    alchemy_lab: {
        level_1: { wood: 1500, iron: 1000, crystal: 100 },
        bonus: 'alchemy_success_rate +5%'
    }
}
```

---

### 方案C：改变副本定位 ⭐⭐⭐
**优点**: 立即有用
**缺点**: 治标不治本

**具体调整**:
```javascript
// 修改前：资源副本
resourceDungeons: {
    spirit_stone_mine: {
        reward: { spirit_stones: 5000 }  // ❌ 玩家不缺
    }
}

// 修改后：稀有材料副本
rareMaterialDungeons: {
    dragon_lair: {
        reward: {
            dragon_scale: 1,      // ✅ 稀有材料
            dragon_blood: 1,      // ✅ 稀有材料
            rare_equipment_box: 1  // ✅ 装备箱
        }
    },
    phoenix_nest: {
        reward: {
            phoenix_feather: 1,
            rebirth_ash: 1
        }
    }
}
```

---

### 方案D：混合方案 ⭐⭐⭐⭐⭐（最佳）
**组合策略**:

1. **移除自动采集**（已实现）
   - ✅ 完全取消自动采集
   - ✅ 资源只能通过副本获取

2. **大幅增加消耗**（方案B的部分实现）
   - ✅ 装备强化系统（已实现）
   - ❌ 炼丹系统（未实现）
   - ❌ 技能升级消耗（未实现）
   - ⏳ 建筑系统（第二期）

3. **副本提供基础资源**（已实现）
   - ✅ 灵石矿脉：提供灵石
   - ✅ 灵草园：提供灵草
   - ✅ 玄铁矿：提供玄铁

---

## 📊 **平衡计算**

### 资源产出（当前实现）

```
副本挑战（每日）:
- 3个副本 × 3次 = 9次挑战
- 灵石矿脉：1000-10000灵石/次（根据难度）
- 灵草园：30-300灵草/次（根据难度）
- 玄铁矿：60-600玄铁/次（根据难度）

VIP特权（每日）:
- 500-5000灵石（根据VIP等级）
```

### 资源消耗（当前实现）

```
装备强化（Lv.1 → Lv.10）:
- 总消耗: 约1,000-500,000灵石 + 50-20,000玄铁
- 时间: 约1-50天副本挑战（根据难度和VIP等级）

装备属性刷新:
- 消耗: 30-110灵草 + 20-75玄铁 + 10-50灵石（根据装备品质）
```

### 结论

- ✅ **资源紧张但合理**
- ✅ **副本成为必需**（唯一资源来源）
- ❌ **自动采集已移除**（资源只能通过副本获取）
- ✅ **玩家有长期目标**（装备强化）

---

## 🎯 **推荐实现步骤**

### 已完成
1. **移除自动采集** ✅ 已完成
   - 完全取消自动采集系统
   - 资源现在只能通过副本获取

2. **增加装备强化消耗** ✅ 已完成
   - 实现 `calculateRefineCost()` 函数
   - 添加资源消耗检查
   - 消耗灵石和玄铁

### 待实现

#### 第二阶段（本周，3-5天）
3. **炼丹系统** ❌ 未实现
   - 新增炼丹界面
   - 消耗灵草和灵石
   - 产出丹药（恢复、增益）

4. **技能升级消耗** ❌ 未实现
   - 修改技能升级逻辑
   - 消耗灵石和材料

#### 第三阶段（下周，5-7天）
5. **稀有材料副本** ❌ 未实现
   - 龙穴（龙鳞、龙血）
   - 凤巢（凤羽、涅槃灰）
   - 妖塔（妖丹、妖核）

---

## 🚀 **快速实现代码示例**

### 1. 移除自动采集

```javascript
// game.js
// 已移除自动采集系统
// 相关代码已删除或注释
// startAutoCollect() { ... } - 已删除
```

### 2. 装备强化消耗资源（实际实现）

```javascript
// equipment.js
calculateRefineCost(refineLevel) {
    // 新的强化消耗公式（基于副本产出）
    // +1: 1,000灵石 + 50玄铁
    // +2: 2,500灵石 + 100玄铁
    // +3: 5,000灵石 + 200玄铁
    // ...
    // +10: 500,000灵石 + 20,000玄铁

    const spiritStonesBase = 1000;  // 灵石基数
    const ironBase = 50;            // 玄铁基数

    // 指数增长（配合副本产出）
    const spiritStonesMultiplier = Math.pow(2.0, refineLevel);
    const ironMultiplier = Math.pow(1.8, refineLevel);

    return {
        spiritStones: Math.floor(spiritStonesBase * spiritStonesMultiplier),
        iron: Math.floor(ironBase * ironMultiplier)
    };
}

refineEquipment(slot = 'weapon') {
    const item = this.game.persistentState.player.equipment[slot];
    if (!item) {
        this.game.addBattleLog(`没有装备${this.getSlotDisplayName(slot)}，无法精炼！`);
        return;
    }

    // 确保refineLevel有值
    if (item.refineLevel === undefined) {
        item.refineLevel = 0;
    }

    // 检查是否已达到最大精炼等级
    if (item.refineLevel >= 10) {
        this.game.addBattleLog(`${this.getSlotDisplayName(slot)}已达到最大精炼等级+10！`);
        return;
    }

    // 计算强化所需资源
    const nextLevel = item.refineLevel + 1;
    const cost = this.calculateRefineCost(item.refineLevel);

    // 检查资源是否足够（v2.0改为灵石+玄铁）
    const player = this.game.persistentState.player;
    const resources = this.game.persistentState.resources;

    if ((player.spiritStones || 0) < cost.spiritStones ||
        (resources.iron || 0) < cost.iron) {
        this.game.addBattleLog(`资源不足！需要 ${cost.spiritStones} 灵石，${cost.iron} 玄铁`);
        this.game.addBattleLog(`当前：${player.spiritStones || 0} 灵石，${resources.iron || 0} 玄铁`);
        return;
    }

    // 消耗资源
    player.spiritStones = (player.spiritStones || 0) - cost.spiritStones;
    resources.iron = (resources.iron || 0) - cost.iron;

    // 提升精炼等级
    item.refineLevel = nextLevel;

    // 记录精炼前战力
    const oldPower = this.game.calculatePlayerCombatPower();

    // 清除装备效果缓存
    this.game.invalidateEquipmentEffectsCache();

    // 更新UI
    this.game.updateUI();

    // 更新人物属性面板
    if (typeof this.game.updateCharacterModal === 'function') {
        this.game.updateCharacterModal();
    }

    // 更新血条显示
    if (typeof this.game.updateHealthBars === 'function') {
        this.game.updateHealthBars();
    }

    // 添加日志
    this.game.addBattleLog(`${this.getSlotDisplayName(slot)}强化成功！当前强化等级：+${item.refineLevel}`);
    this.game.addBattleLog(`消耗了 ${cost.spiritStones} 灵石，${cost.iron} 玄铁`);

    // 显示战力变化
    const newPower = this.game.calculatePlayerCombatPower();
    this.game.showCombatPowerChange(newPower - oldPower);
}
```

---

## 📝 **总结**

**核心思路**: 移除自动采集 + 增加装备强化消耗 + 副本提供基础资源

**当前实现**:
- ✅ 移除自动采集系统
- ✅ 实现装备强化消耗系统
- ✅ 副本提供基础资源（灵石、灵草、玄铁）
- ❌ 炼丹系统未实现
- ❌ 技能升级消耗未实现
- ❌ 稀有材料副本未实现

**预期效果**:
- ✅ 资源有价值了
- ✅ 副本有意义了
- ✅ 玩家有长期目标（装备强化）
- ⚠️ 资源获取途径单一（仅副本）

**风险**:
- ⚠️ 玩家初期可能感觉资源紧张
- ⚠️ 需要平衡数值，避免太难
- ⚠️ 灵草资源消耗途径不足

**应对**:
- 💡 新手保护：Lv.10前消耗减半
- 💡 首通奖励：大量资源
- 💡 活动加成：周末资源掉落×2
- 💡 开发炼丹系统：消耗灵草
- 💡 开发技能升级消耗：消耗灵草和玄铁

---

**维护者**: 游戏平衡团队
**相关系统**: 自动采集 | 装备强化 | 炼丹系统 | 技能系统
