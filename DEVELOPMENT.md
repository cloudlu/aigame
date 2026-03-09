# 开发指南

## 快速开始

### 环境要求
- Node.js >= 14.0.0
- 现代浏览器（Chrome/Firefox/Edge）
- 代码编辑器（推荐 VSCode）

### 本地运行

1. 安装依赖
```bash
npm install
```

2. 启动服务器
```bash
npm start
```

3. 访问游戏
```
http://localhost:3002
```

## 项目结构说明

### 核心文件

- `index.html` - 游戏主页面
- `login.html` - 登录注册页面
- `game.js` - 游戏核心逻辑
- `server.js` - 后端服务器

### 模块文件

- `combatlogic.js` - 战斗逻辑
- `battle3d.js` - 3D战斗场景
- `map.js` - 地图系统
- `realmSkillSystem.js` - 境界技能系统
- `equipment.js` - 装备系统
- `audio.js` - 音效系统
- `game-metadata.js` - 游戏元数据

## 主要类说明

### EndlessWinterGame

主游戏类，管理游戏状态。

```javascript
class EndlessWinterGame {
    constructor() {
        this.gameState = {}  // 游戏状态
        this.timers = {}     // 计时器
        this.metadata = null // 元数据
    }
}
```

### EquipmentSystem

装备系统管理。

```javascript
class EquipmentSystem {
    calculateEquipmentEffects()  // 计算装备效果
    refineEquipment(slot)        // 强化装备
}
```

### RealmSkillSystem

境界技能系统（原技能树系统）。

```javascript
class RealmSkillSystem {
    getAvailableSkills()  // 获取可用技能
    upgradeSkill(id)      // 升级技能
}
```

## 数据结构

### 玩家数据

```javascript
player = {
    name: "玩家名",
    level: 1,
    realm: 0,      // 境界
    stage: 1,      // 阶段
    maxHp: 100,
    attack: 10,
    defense: 5
}
```

### 装备数据

```javascript
equipment = {
    weapon: { attack: 10, refineLevel: 0 },
    armor: { defense: 15, refineLevel: 0 }
}
```

## 添加新功能

### 添加新技能

1. 在 `game-metadata.js` 中添加技能数据
2. 配置技能参数
3. 添加技能图标

### 添加新装备

1. 在装备系统定义装备
2. 添加到商店
3. 测试效果

### 添加新敌人

1. 定义敌人数据
2. 设置属性和掉落
3. 添加到地图生成

## 调试技巧

### 浏览器控制台

```javascript
// 查看游戏状态
game.gameState

// 修改属性
game.gameState.player.attack = 1000

// 更新界面
game.updateUI()
```

### 服务器日志

查看服务器输出的日志信息。

## 常见问题

### 端口被占用
修改 `server.js` 中的端口号。

### 3D场景不显示
检查浏览器是否支持WebGL。

### 存档问题
检查 `saves/` 目录权限。

## 代码规范

- 使用 ES6+ 语法
- 添加清晰注释
- 统一命名规范
- 模块化开发

## 性能优化

- 预加载资源
- LOD优化
- 实例化复用
- 避免内存泄漏

## 更多资源

- Babylon.js: https://doc.babylonjs.com/
- Express.js: https://expressjs.com/
- Tailwind CSS: https://tailwindcss.com/
