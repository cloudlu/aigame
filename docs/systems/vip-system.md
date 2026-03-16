# VIP充值系统设计文档

## 概述

VIP充值系统提供密码充值获取仙玉的功能，仙玉可用于专属商店购买稀有道具。累计充值自动解锁VIP等级，获得永久属性加成。

## 文件结构

| 文件 | 说明 |
|------|------|
| `vipSystem.js` | VIPSystem class — 充值验证、等级计算、特权加成 |
| `jadeShop.js` | JadeShop class — 商品配置、购买逻辑、装备箱、重铸 |
| `vip.test.js` | Vitest 单元测试 |

---

## 一、仙玉资源

- 资源名称：`jade`（仙玉）
- 初始值：0
- 产出速率：0（不自动产出，仅通过充值获得）
- 存储位置：`gameState.resources.jade`
- 持久化：随 `gameState` 自动保存/加载
- 旧存档兼容：加载时自动初始化为 0

---

## 二、密码充值系统

### 2.1 安全架构

充值码验证在**服务端**进行，确保密码不暴露给客户端：

```
客户端                              服务端
   |                                   |
   |-- GET /api/recharge/packages --> | 获取套餐列表（不含密码）
   |<-- [{jade, label}, ...] ---------|
   |                                   |
   |-- POST /api/recharge {code} ---> | 验证充值码
   |<-- {success, jade, totalJade} ---| 返回结果
```

### 2.2 充值码配置

定义在服务端 `config/vipcode.json`（不提交到仓库）：

```json
[
    { "code": "******",   "jade": 60,   "label": "6元档" },
    { "code": "******",  "jade": 300,  "label": "30元档" },
    ...
]
```

**安全建议**：
- 将 `config/vipcode.json` 添加到 `.gitignore`
- 密码不区分大小写
- 密码可无限重复使用

### 2.3 充值流程

```
玩家点击充值按钮 → 打开充值弹窗
    → GET /api/recharge/packages 获取套餐列表
    → 渲染套餐卡片
    → 选择套餐卡片 → 展开密码输入框
    → 输入密码 → 点击确认
    → POST /api/recharge {code} 服务端验证
    → 成功：服务端增加仙玉、计算VIP等级，客户端更新UI
    → 失败：显示错误提示
```

### 2.4 服务端API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/recharge/packages` | GET | 获取套餐列表（不含密码） |
| `/api/recharge` | POST | 验证充值码并增加仙玉 |

**POST /api/recharge 请求体**：
```json
{ "code": "******" }
```

**响应**：
```json
{
    "success": true,
    "jade": 300,
    "totalJade": 360,
    "message": "充值成功！获得300仙玉",
    "label": "30元档",
    "vipLevel": 2,
    "vipLeveledUp": true,
    "vipInfo": { "level": 2, "label": "外门弟子", ... }
}
```

### 2.5 UI 入口

- 导航栏金色"充值"按钮（`#recharge-btn`）
- 弹窗ID：`#recharge-modal`
- 动态渲染套餐卡片（`renderRechargePackages()`）

---

## 三、VIP 等级系统

### 3.1 等级配置

定义在 `VIPSystem.VIP_LEVELS` 静态属性中，共 13 级（0-12）：

| VIP | 累计仙玉 | 称号 | 攻击% | 防御% | 生命% | 暴击% |
|-----|---------|------|-------|-------|-------|-------|
| 0 | 0 | 普通修士 | 0 | 0 | 0 | 0 |
| 1 | 60 | 入门弟子 | 3 | 0 | 0 | 0 |
| 2 | 360 | 外门弟子 | 5 | 2 | 0 | 0 |
| 3 | 680 | 内门弟子 | 8 | 4 | 3 | 0 |
| 4 | 1280 | 精英弟子 | 10 | 6 | 5 | 2 |
| 5 | 2000 | 核心弟子 | 13 | 8 | 7 | 3 |
| 6 | 3280 | 长老候选 | 16 | 10 | 10 | 4 |
| 7 | 5000 | 执事长老 | 18 | 12 | 12 | 5 |
| 8 | 6480 | 副掌门 | 22 | 15 | 15 | 6 |
| 9 | 10000 | 掌门 | 25 | 18 | 18 | 7 |
| 10 | 15000 | 太上长老 | 30 | 20 | 20 | 8 |
| 11 | 20000 | 圣者 | 35 | 25 | 25 | 10 |
| 12 | 30000 | 仙尊 | 40 | 30 | 30 | 12 |

### 3.2 等级计算逻辑

- VIP等级由 `totalRecharged`（累计充值仙玉）决定
- 等级只升不降（即使通过其他方式消耗仙玉）
- 每次充值后自动检查升级：`addJade()` → `getLevel()`

### 3.3 加成应用

VIP加成在 `EquipmentSystem.calculateEquipmentEffects()` 末尾叠加：
- **攻击/防御/生命**：百分比乘算（如 VIP12 攻击 *1.40）
- **暴击率**：固定值加算（如 VIP12 +12%）

加成应用在装备效果之上，最终属性 = (基础属性 + 装备加成) × VIP百分比 + VIP固定值

### 3.4 数据存储

```js
gameState.vip = {
    level: 0,           // 当前VIP等级
    totalRecharged: 0   // 累计充值仙玉数（只增不减）
}
```

---

## 四、仙玉商店

### 4.1 商品配置

定义在 `JadeShop.SHOP_ITEMS` 静态属性中：

| ID | 名称 | 仙玉 | 类型 | 说明 |
|----|------|------|------|------|
| purple_box | 紫装宝箱 | 100 | equipment_box | 保底紫色品质装备 |
| gold_box | 金装宝箱 | 300 | equipment_box | 保底金色品质装备 |
| rainbow_box | 彩装宝箱 | 800 | equipment_box | 保底彩色品质装备 |
| breakthrough_x5 | 突破石×5 | 50 | item | 5颗突破石 |
| breakthrough_x20 | 突破石×20 | 180 | item | 20颗突破石 |
| exp_pill | 修为丹 | 30 | exp | 获得500经验值 |
| exp_pill_lg | 高级修为丹 | 100 | exp | 获得2000经验值 |
| reforge_stone | 重铸石 | 80 | reforge | 重铸一件装备属性 |

### 4.2 购买流程

```
玩家点击仙玉商店按钮 → 打开商店弹窗（显示余额和商品）
    → 点击商品购买按钮
    → JadeShop.buyItem(itemId) 验证余额
    → 成功：扣除仙玉、发放商品、更新UI
        → equipment_box: 生成保底品质装备（自动装备或放入背包）
        → item: 直接增加资源数量
        → exp: 增加经验值
        → reforge: 重铸石放入背包消耗品
    → 失败：显示余额不足提示
```

### 4.3 装备箱机制

- 使用 `EquipmentSystem.generateEquipment(type, level, rarity)` 生成
- 装备等级跟随玩家当前境界
- 装备类型随机（8个槽位之一）
- 属性条数和倍率由品质决定（复用现有稀有度系统）

### 4.4 重铸石机制

- 购买后存入 `inventory.consumables.reforge_stone`
- 使用时调用 `JadeShop.reforgeEquipment(slot)`
- 重铸保留：品质、等级、类型
- 重铸刷新：随机属性组合和数值

---

## 五、Class API 参考

### VIPSystem

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getLevel()` | - | `number` | 当前VIP等级（0-12） |
| `getVIPInfo()` | - | `object` | 当前等级完整配置 |
| `getBonus()` | - | `{attackBonus, defenseBonus, hpBonus, critBonus}` | 加成对象 |
| `recharge(code)` | `string` | `{success, jade, message}` | 验证充值码 |
| `addJade(amount)` | `number` | `{leveledUp, oldLevel?, newLevel?, info?}` | 增加仙玉 |
| `applyBonuses(baseStats)` | `object` | `object` | 叠加加成（不修改原对象） |

### JadeShop

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getItems()` | - | `array` | 商品列表 |
| `getJadeBalance()` | - | `number` | 当前仙玉余额 |
| `buyItem(itemId)` | `string` | `{success, message, equipment?}` | 购买商品 |
| `generateEquipmentBox(rarity)` | `string` | `object` | 生成保底装备 |
| `reforgeEquipment(slot)` | `string` | `{success, message, equipment?}` | 重铸装备 |

---

## 六、UI 元素

| 元素ID | 类型 | 说明 |
|--------|------|------|
| `#jade` | 导航栏 | 仙玉数量显示 |
| `#nav-vip-badge` | 导航栏 | VIP等级徽章 |
| `#recharge-btn` | 按钮 | 打开充值弹窗 |
| `#recharge-modal` | 弹窗 | 充值套餐选择 |
| `#recharge-jade-balance` | 弹窗内 | 当前仙玉余额 |
| `#recharge-vip-level` | 弹窗内 | 当前VIP等级 |
| `#vip-shop-btn` | 按钮 | 打开仙玉商店 |
| `#vip-shop-modal` | 弹窗 | 仙玉商品列表 |
| `#vip-shop-jade-balance` | 弹窗内 | 当前仙玉余额 |

---

**创建日期**: 2026-03-15
**最后更新**: 2026-03-15
