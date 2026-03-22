# 图鉴系统设计文档

**最后更新**: 2026-03-22

## 概述

图鉴系统记录玩家击杀过的敌人和获取过的装备，提供分类全解锁奖励。

## 文件结构

| 文件 | 说明 |
|------|------|
| `collectionSystem.js` | CollectionSystem class — 图鉴记录、查询、奖励检查 |
| `collection.test.js` | Vitest 单元测试（待实现） |

---

## 一、装备后缀池重构

### 1.1 背景

原有14个后缀跨6个境界共享，组合过多（14×5×8=560种装备名），无法穷举图鉴。

### 1.2 新方案

每种装备类型 **6个唯一后缀**，按境界提供变体。`nameSuffixes` 从扁平数组改为二维数组（6境界 × 6后缀）。

| 类型 | 后缀概念 | 中文 |
|------|---------|------|
| weapon | 剑、刀、枪、棍、斧、杖 | 武器 |
| armor | 袍、衣、铠、甲、衫、褂 | 护甲（不全以"甲"结尾） |
| helmet | 冠、帽、盔、巾、环、带 | 头盔 |
| boots | 靴、鞋、履、步、行、踏 | 靴子 |
| pants | 裙、裳、裤、绔、袴、服 | 下裳 |
| amulet | 符、佩、牌、坠、珠、玉 | 护符 |
| spiritTreasure | 珠、鼎、鉴、钟、莲、塔 | 灵宝 |
| magicArtifact | 杖、扇、铃、印、幡、鼎 | 法器 |

共 **48个全局唯一后缀**，每个有6个境界变体（288个字符串）。

### 1.3 装备对象新增 suffix 字段

`generateEquipment()` 返回对象新增 `suffix` 字段，供图鉴追踪：

```js
{ id, name, type, suffix, level, ... }
```

---

## 二、数据结构

### 2.1 gameState.collection

```js
gameState.collection = {
    enemies: [],            // 已解锁敌人key列表
    equipmentTypes: [],     // 已解锁装备key列表
    rewardedCategories: []  // 已领取奖励的分类key列表
};
```

### 2.2 Key 格式

| 图鉴 | Key 格式 | 示例 |
|------|---------|------|
| 敌人（普通） | `baseName` | `"雪原狼"` |
| 敌人（精英） | `baseName_elite` | `"雪原狼_elite"` |
| 敌人（Boss） | `BOSS` + baseName | `"BOSS雪原狼"` |
| 装备 | `type_rarity_suffix` | `"weapon_purple_宝剑"` |
| 敌人奖励分类 | `enemy_地图名` | `"enemy_仙霞山"` |
| 装备奖励分类 | `equipment_境界idx_品质` | `"equipment_3_purple"` |

### 2.3 旧存档兼容

`loadGame` 迁移代码中自动初始化 `collection` 字段。

---

## 三、图鉴统计

| 图鉴 | 总条目 | 分类维度 | 分类数 | 全解锁奖励 |
|------|--------|---------|--------|-----------|
| 敌人 | 249 | 10张地图 | 10 | 经验+2500，灵草+50，灵石+100 |
| 装备 | 1440 | 6境界×5品质 | 30 | 对应境界保底品质装备箱×1 |

**总条目**: 249 + 1440 = **1689**
**奖励分类**: 10 + 30 = **40个**

---

## 四、Class API 参考

### CollectionSystem

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getEnemyProgress()` | - | `{unlocked, total}` | 敌人图鉴进度 |
| `getEquipmentProgress()` | - | `{unlocked, total}` | 装备图鉴进度 |
| `isEnemyUnlocked(key)` | `string` | `boolean` | 是否已解锁 |
| `isEquipmentUnlocked(key)` | `string` | `boolean` | 是否已解锁 |
| `recordEnemy(enemy)` | `object` | - | 记录击杀敌人 |
| `recordEquipment(equipment)` | `object` | - | 记录获取装备 |
| `checkAndGrantRewards()` | - | - | 检查并发放分类全解锁奖励 |

---

## 五、追踪钩子

### 5.1 敌人击杀

**位置**: `combatlogic.js` → `enemyDefeated()` 开头
```js
const key = enemy.isBoss ? 'BOSS' + enemy.baseName
        : enemy.isElite ? enemy.baseName + '_elite'
        : enemy.baseName;
this.collectionSystem.recordEnemy(key);
```

### 5.2 装备获取

**位置**: `combatlogic.js` → `enemyDefeated()` 装备掉落后 + `game.js` → `buyVIPItem()` 装备箱购买后
```js
const key = equipment.type + '_' + equipment.rarity + '_' + equipment.suffix;
this.collectionSystem.recordEquipment(key);
```

---

## 六、UI 元素

| 元素ID | 类型 | 说明 |
|--------|------|------|
| `#collection-btn` | 导航栏按钮 | 打开图鉴弹窗 |
| `#collection-modal` | 弹窗 | 图鉴主界面（敌人/装备 Tab） |
| `#collection-total` | 弹窗内 | 总解锁进度 |
| `#collection-enemy-tab` | Tab按钮 | 切换敌人图鉴 |
| `#collection-equip-tab` | Tab按钮 | 切换装备图鉴 |
| `#collection-content` | 弹窗内 | 图鉴内容区域（动态渲染） |

---

**创建日期**: 2026-03-16
**最后更新**: 2026-03-16
