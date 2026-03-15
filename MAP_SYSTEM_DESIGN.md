# 🗺️ 地图系统设计文档

## 📋 文档说明

本文档详细记录了《无尽战斗》游戏的地图系统设计，包括地图境界需求、移动限制、传送系统等。

**最后更新**: 2026-03-14
**版本**: v1.16
**维护者**: 游戏系统团队

---

## 🎯 设计目标

1. **玩家自主选择**: 允许玩家主动选择前往哪个地图
2. **境界递进**: 高境界地图需要达到一定境界才能进入（而非等级）
3. **风险收益平衡**: 高境界地图敌人更强，但奖励更丰厚
4. **世界探索**: 提供世界地图界面，展示所有可探索区域

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

## 🎨 设计理念

### 地图主题一致性
- 每个地图的敌人列表符合地图的主题风格
- 例如：沙漠地图 → 沙妖、蝎精、沙漠巨蜥等沙漠生物
- 例如：湖泊地图 → 水怪、蛟蛇、龟妖等水生生物

### 敌人多样性
- 每个地图配置7-9种不同的敌人类型
- 提供丰富的战斗体验
- 避免单调重复

### 跨地图敌人共享
- 部分敌人类型在多个地图中出现
- 例如：风魔出现在山峰、森林、沙漠、仙境
- 例如：土妖出现在沙漠、洞穴
- 增加世界观的一致性

### 等级递进设计
- 低级地图（1-10级）：山峰、海滩
- 中级地图（10-20级）：森林、湖泊
- 高级地图（20-30级）：沙漠、洞穴
- 顶级地图（30-40级）：仙境、火山
- 玩家随着等级提升解锁新地图

---

## 🏔️ 地图配置

### 境界系统

游戏共有 **6个境界**：

| 境界索引 | 名称 | 等级上限范围 |
|---------|------|-------------|
| 0 | 武者 | 10 → 20 → 30 |
| 1 | 炼气 | 10 → 15 → 20 → 25 |
| 2 | 筑基 | 20 → 25 → 30 → 35 |
| 3 | 金丹 | 30 → 35 → 40 → 45 |
| 4 | 元婴 | 40 → 45 → 50 → 55 |
| 5 | 化神 | 50 → 55 → 60 → 65 |

来源：[game-metadata.js:2060-2180](game-metadata.js#L2060-L2180)

### 当前配置：地图境界需求（v1.15+ 实现）

> ⚠️ **客户需求变更记录**:
> 原设计为"高等级地图更多"的分布方式（武者1个、炼气1个、筑基2个、金丹3个、元婴3个、化神2个）
> 现改为更线性的递进方式，并新增相邻地图移动限制

来源：[game-metadata.js:644-655](game-metadata.js#L644-L655)

```javascript
mapRealmRequirements: {
    "xianxia-mountain":  { realm: 0, name: "武者" },   // 起始地图
    "xianxia-beach":     { realm: 1, name: "炼气" },   // 需要炼气期
    "xianxia-plains":    { realm: 2, name: "筑基" },   // 需要筑基期
    "xianxia-canyon":    { realm: 3, name: "金丹" },   // 需要金丹期
    "xianxia-desert":    { realm: 3, name: "金丹" },   // 需要金丹期
    "xianxia-lake":      { realm: 4, name: "元婴" },   // 需要元婴期
    "xianxia-forest":    { realm: 4, name: "元婴" },   // 需要元婴期
    "xianxia-volcano":   { realm: 4, name: "元婴" },   // 需要元婴期
    "xianxia-cave":      { realm: 5, name: "化神" },   // 需要化神期
    "xianxia-heaven":    { realm: 5, name: "化神" }    // 需要化神期
}
```

### 地图路线图

```
仙境(化神) ← 洞穴(化神) ← 火山(元婴) ← 森林(元婴) ← 湖泊(元婴)
                                                      ↑
                                                    沙漠(金丹)
                                                      ↑
                                                    峡谷(金丹)
                                                      ↑
                                                    平原(筑基)
                                                      ↑
                                                    海滩(炼气)
                                                      ↑
                                                    山峰(武者)
```

### 设计理念

- **线性递进**：玩家按固定路线推进，每个地图都是下一阶段的准备
- **部分境界有多个地图**：金丹期2个、元婴期3个，提供更多资源获取选择
- **高境界玩家可以回低境界图刷材料**：境界限制是下限，不是上限
- **相邻地图限制**：玩家只能移动到当前地图的相邻地图（传送除外）

### 原设计（已废弃）

```javascript
// 旧设计 - 高等级地图分布更多
// 武者1个、炼气1个、筑基2个、金丹3个、元婴3个、化神2个
// 允许复杂网络连接，玩家可自由移动到任何已解锁地图
```

**地图与境界对应图示**：

```
境界:  武者    炼气     筑基     金丹      元婴       化神
       [0]     [1]      [2]      [3]       [4]        [5]
         │       │        │        │         │          │
地图:   ┌┴┐    ┌┴┐     ┌┴┐     ┌─┴─┐    ┌──┴──┐    ┌──┴──┐
       山峰   海滩     森林    平原     峡谷       仙境
                        湖泊     沙漠       火山
                                 洞穴

数量:   1个     1个      2个      3个       3个        2个
       ↑低级                          高级↓
```

---

## 🚶 地图移动系统

### 为什么用境界而非等级？

#### 等级范围的问题

1. **重叠严重，难以区分**
   ```
   山峰:  1-10
   海滩:  1-10   ← 和山峰完全一样
   森林:  5-15   ← 和山峰/海滩重叠
   平原:  8-18   ← 和森林/湖泊重叠
   ```

2. **等级增长快，范围很快失效**
   - 玩家1-10级在山峰，可能只花几分钟就超过了
   - 等级范围"上限"没有意义（高等级还能回低级图刷）

3. **不符合仙侠世界观**
   - "30-45级" 让人出戏
   - 仙侠小说里通常说 "金丹期才能进入此秘境"

#### 境界需求的优势

| 方面 | 等级范围 | 境界需求 |
|-----|---------|---------|
| 世界观 | "30-45级"（出戏） | "金丹期方可入"（代入感强） |
| 判断逻辑 | `min ≤ level ≤ max` | `realm >= requiredRealm` |
| 重叠问题 | 大量重叠，混乱 | 清晰分明，无重叠 |
| 玩家理解 | 需要记数字 | 一目了然 |
| 扩展性 | 新境界需调整所有范围 | 直接追加高境界地图 |

---

## 🔒 相邻地图移动限制（v1.15+ 新增）

### 系统说明

- 玩家只能移动到当前地图相邻的地图
- 使用线性连接路线（非复杂网络）
- UI 显示连接线和可到达地图
- 传送系统可以绕过此限制

### 实现位置

- `game.js:265-306` - 辅助方法（getConnections, buildAdjacencyMap, isAdjacentMap）
- `game.js:309-392` - travelToMap 主逻辑
- `game.js:417-446` - onMapVisit 首次访问处理
- `game.js:446-460` - teleportToWaypoint 传送点系统

### 连接定义

来源：[game.js:265-278](game.js#L265-L278)

```javascript
// 线性连接（山峰→海滩→平原→峡谷→沙漠→湖泊→森林→火山→洞穴→仙境）
const connections = [
    ["xianxia-mountain", "xianxia-beach"],
    ["xianxia-beach", "xianxia-plains"],
    ["xianxia-plains", "xianxia-canyon"],
    ["xianxia-canyon", "xianxia-desert"],
    ["xianxia-desert", "xianxia-lake"],
    ["xianxia-lake", "xianxia-forest"],
    ["xianxia-forest", "xianxia-volcano"],
    ["xianxia-volcano", "xianxia-cave"],
    ["xianxia-cave", "xianxia-heaven"]
];
```

### 地图路线图

```
仙境 ← 洞穴 ← 火山 ← 森林 ← 湖泊 ← 沙漠 ← 峡谷 ← 平原 ← 海滩 ← 山峰
(化神)  (化神) (元婴) (元婴) (元婴) (金丹) (金丹) (筑基) (炼气) (武者)
```

### 核心逻辑

1. **`getConnections()`** - 定义地图线性连接
2. **`buildAdjacencyMap(connections)`** - 将连接数组转换为邻接表（O(1)查询）
3. **`isAdjacentMap(currentMapType, targetMapType)`** - 检查两个地图是否相邻
4. **`travelToMap(targetMapType, options)`** - 执行移动时检查相邻性
5. **`onMapVisit(mapType)`** - 首次访问解锁传送点并给奖励
6. **`teleportToWaypoint(mapType)`** - 传送到已解锁的传送点

### 错误提示示例

```
只能移动到相邻的地图！当前可到达: 仙侠海滩
提示: 使用传送道具可以到达更远的地图
```

### 扩展预留

- `game-metadata.js:658-669` 保留了 `mapConnections` 配置（复杂网络）
- 未来可切换到复杂连接系统
- 传送系统 API 已设计完成（waypoint/item/admin 三种模式）

---

## 💰 移动成本

### 当前实现（v1.15+）

```javascript
// 正常移动
const movementCost = {
    energy: 10,        // 消耗10点灵力
    teleportType: null // 正常移动
};

// 传送点传送（免费）
const waypointCost = {
    energy: 0,         // 免费
    teleportType: 'waypoint'
};

// 道具传送（消耗道具）
const itemCost = {
    energy: 0,         // 不消耗灵力
    teleportType: 'item',
    itemRequired: "传送符"
};

// 管理员传送（免费无限制）
const adminCost = {
    energy: 0,
    teleportType: 'admin'
};
```

### 原设计（已废弃）

```javascript
// 移动成本设计（原设计，未实现）
const movementCost = {
    spiritStone: 0,    // 灵石成本（暂无）
    energy: 10,        // 灵力消耗
    cooldown: 0,       // 冷却时间（秒）
    itemRequired: null // 特殊道具（如传送符）
};

// 跨境界区域移动（如武者→金丹）需要额外成本（原设计，未实现）
const longDistanceCost = {
    energy: 50,
    itemRequired: "传送符" // 需要消耗道具
};
```

---

## ✨ 传送点系统（v1.15+ 新增）

### 系统说明

- 首次访问地图自动解锁传送点
- 传送点之间可以免费快速旅行
- 传送点绕过相邻地图限制

### 首次访问奖励

```javascript
const bonus = {
    exp: 100,           // 100点经验
    spiritCrystal: 50   // 50点灵石
};
```

### 玩家数据结构

```javascript
gameState.player.inventory = {
    consumables: {
        "teleport_scroll": 0,      // 传送符（待实现）
        "town_portal_scroll": 0    // 回城卷（待实现）
    },
    waypoints: [                   // 已解锁的传送点
        "xianxia-mountain",        // 起始地图自动解锁
        "xianxia-beach",           // 首次访问后解锁
        // ... 其他地图
    ]
};
```

### API 使用示例

```javascript
// 正常移动（受相邻限制）
game.travelToMap('xianxia-beach');

// 传送点传送（免费，需先解锁）
game.teleportToWaypoint('xianxia-beach');

// 道具传送（待实现）
game.travelToMap('xianxia-heaven', {
    bypassAdjacentCheck: true,
    teleportType: 'item'
});

// 管理员传送（测试用）
game.travelToMap('xianxia-heaven', {
    bypassAdjacentCheck: true,
    teleportType: 'admin'
});
```

---

## 🎮 UI 设计

### 世界地图面板（当前实现）

来源：[game.js:416-627](game.js#L416-L627)

**功能特性**：
- 使用绝对定位的地图节点
- SVG 绘制连接线
- 节点样式区分（已解锁/未解锁/当前位置）
- 点击节点触发移动
- 背景图片支持（Images/world_map.jpg）

**节点样式类**：
- `.map-node-abs.unlocked` - 已解锁（蓝色渐变）
- `.map-node-abs.current` - 当前位置（绿色渐变 + 脉动动画）
- `.map-node-abs.locked` - 未解锁（灰色）

### 原设计方案（已废弃）

#### 方案A：世界地图面板（原设计）

```
┌─────────────────────────────────────┐
│           世界地图                    │
├─────────────────────────────────────┤
│                                     │
│    [仙境]───[火山]                   │
│     元婴      化神                   │
│       │       │                     │
│    [洞穴]───[沙漠]───[峡谷]          │
│     金丹      金丹      筑基         │
│       │       │       │             │
│    [森林]───[湖泊]───[平原]          │
│     炼气      筑基      炼气         │
│       │       │                     │
│    [山峰]───[海滩]                   │
│     武者      武者                   │
│                                     │
├─────────────────────────────────────┤
│ 当前位置: 仙侠山峰 (武者境界)         │
│ 选择目标: [取消] [确认移动]           │
└─────────────────────────────────────┘
```

#### 方案B：简化列表（原设计）

```
┌─────────────────────────────────────┐
│           选择目的地                  │
├─────────────────────────────────────┤
│ ✅ 仙侠山峰 (武者) - 当前位置         │
│ ✅ 仙侠森林 (炼气) - 已解锁           │
│ ✅ 仙侠海滩 (武者) - 已解锁           │
│ 🔒 仙侠湖泊 (筑基) - 境界不足         │
│ 🔒 仙侠沙漠 (金丹) - 境界不足         │
│ ...                                 │
├─────────────────────────────────────┤
│         [关闭]                       │
└─────────────────────────────────────┘
```

---

## 🔮 未来扩展

### 复杂网络连接（已预留）

来源：[game-metadata.js:658-669](game-metadata.js#L658-L669)

```javascript
mapConnections: {
    "xianxia-mountain": ["xianxia-beach", "xianxia-forest"],
    "xianxia-beach": ["xianxia-mountain", "xianxia-forest"],
    "xianxia-forest": ["xianxia-mountain", "xianxia-beach", "xianxia-plains", "xianxia-lake"],
    "xianxia-plains": ["xianxia-forest", "xianxia-lake", "xianxia-canyon"],
    "xianxia-lake": ["xianxia-forest", "xianxia-plains", "xianxia-canyon", "xianxia-desert"],
    "xianxia-canyon": ["xianxia-plains", "xianxia-lake", "xianxia-desert", "xianxia-cave", "xianxia-heaven"],
    "xianxia-desert": ["xianxia-lake", "xianxia-canyon", "xianxia-cave"],
    "xianxia-cave": ["xianxia-canyon", "xianxia-desert", "xianxia-heaven", "xianxia-volcano"],
    "xianxia-heaven": ["xianxia-canyon", "xianxia-cave", "xianxia-volcano"],
    "xianxia-volcano": ["xianxia-cave", "xianxia-heaven"]
}
```

**切换方法**（未来可启用）：

```javascript
getConnections() {
    // 从 mapConnections 转换为连接数组
    const connections = [];
    for (const [mapA, neighbors] of Object.entries(this.metadata.mapConnections)) {
        neighbors.forEach(mapB => {
            if (mapA < mapB) {  // 避免重复
                connections.push([mapA, mapB]);
            }
        });
    }
    return connections;
}
```

### 传送道具系统（待实现）

**建议配置**（game-metadata.js 中新增）：

```javascript
shopItems: [
    {
        id: "teleport_scroll",
        name: "传送符",
        description: "传送到任意已解锁境界的地图（无视相邻限制）",
        price: 200,
        type: "consumable",
        effect: "teleport",
        value: "any_unlocked"
    },
    {
        id: "town_portal_scroll",
        name: "回城卷",
        description: "立即返回起始地图（仙侠山峰）",
        price: 50,
        type: "consumable",
        effect: "teleport",
        value: "xianxia-mountain"
    }
]
```

### 地图奖励倍率（待实现）

```javascript
mapRewardMultipliers: {
    "xianxia-mountain":  { exp: 1.0, dropRate: 1.0 },
    "xianxia-beach":     { exp: 1.2, dropRate: 1.1 },
    "xianxia-forest":    { exp: 1.5, dropRate: 1.2 },
    "xianxia-plains":    { exp: 2.0, dropRate: 1.4 },
    "xianxia-lake":      { exp: 2.0, dropRate: 1.4 },
    "xianxia-canyon":    { exp: 3.0, dropRate: 1.8 },
    "xianxia-desert":    { exp: 3.0, dropRate: 1.8 },
    "xianxia-cave":      { exp: 3.0, dropRate: 1.8 },
    "xianxia-heaven":    { exp: 4.0, dropRate: 2.2 },
    "xianxia-volcano":   { exp: 4.0, dropRate: 2.2 }
}
```

### 成就系统（待实现）

- "First Steps": 访问3个不同地图
- "Explorer": 访问所有地图
- "World Traveler": 解锁所有传送点
- "Speedrunner": 访问所有地图在1小时内

---

## 🧪 测试

### 自动化测试

运行测试脚本：[test-map-movement.js](test-map-movement.js)

```javascript
// 在浏览器控制台运行
const script = document.createElement('script');
script.src = 'test-map-movement.js';
document.head.appendChild(script);
```

### 手动测试用例

1. **相邻地图限制**
   - 在山峰尝试移动到沙漠（应失败）
   - 在山峰移动到海滩（应成功）

2. **传送绕过**
   - 使用 admin 模式传送到仙境（应成功）

3. **首次访问奖励**
   - 清空 waypoints
   - 移动到新地图
   - 检查是否获得100经验和50灵石

4. **传送点系统**
   - 尝试传送到未解锁的地图（应失败）
   - 传送到已解锁的地图（应成功且免费）

---

## 📊 实现优先级

| 阶段 | 功能 | 优先级 | 状态 |
|-----|------|--------|------|
| 1 | 境界需求配置 | 🔴 高 | ✅ 已完成 |
| 2 | 相邻地图移动限制 | 🔴 高 | ✅ 已完成 |
| 3 | 传送点系统框架 | 🟡 中 | ✅ 已完成 |
| 4 | 首次访问奖励 | 🟡 中 | ✅ 已完成 |
| 5 | 世界地图UI | 🟢 低 | ✅ 已完成 |
| 6 | 传送道具系统 | 🟢 低 | ⏳ 待实现 |
| 7 | 地图奖励倍率 | 🔵 可选 | ⏳ 待实现 |
| 8 | 复杂网络连接 | 🔵 可选 | ⏳ 待实现 |
| 9 | 成就系统 | 🔵 可选 | ⏳ 待实现 |

---

## 📚 相关文档

- [CHANGELOG.md](CHANGELOG.md) - 版本更新日志
- [BALANCE_DESIGN.md](BALANCE_DESIGN.md) - 游戏平衡性设计
- [DEVELOPMENT.md](DEVELOPMENT.md) - 开发指南
- [test-map-movement.js](test-map-movement.js) - 测试脚本

---

## 🔗 相关代码

- [game.js](game.js) - 游戏核心逻辑
  - `getConnections()` - L265-278
  - `buildAdjacencyMap()` - L280-293
  - `isAdjacentMap()` - L296-306
  - `travelToMap()` - L309-392
  - `onMapVisit()` - L417-446
  - `teleportToWaypoint()` - L446-460
  - `showMapSelectionPanel()` - L416-627

- [game-metadata.js](game-metadata.js) - 游戏元数据
  - `mapRealmRequirements` - L644-655
  - `mapConnections` - L658-669
  - `realmConfig` - L2060-2180

- [map.js](map.js) - 地图渲染和敌人生成
- [test-map-movement.js](test-map-movement.js) - 自动化测试

---

*本文档随游戏版本持续更新。如有疑问或建议，请联系游戏系统团队。*
