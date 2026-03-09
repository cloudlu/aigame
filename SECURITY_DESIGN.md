# 游戏安全设计文档

## 📋 文档信息

- **创建日期**: 2026-03-08
- **最后更新**: 2026-03-08
- **当前方案**: 方案1 - 后端最小骨架 + 前端生成
- **游戏类型**: 单机修仙游戏 + 云存档

---

## 🎯 当前架构（方案1）

### **实现方式**

#### 后端职责（最小化）
- ✅ 用户认证（注册/登录）
- ✅ Token 管理
- ✅ 创建最小游戏骨架
- ✅ 存档读写

**代码位置**: `server.js:42-84`

```javascript
function createInitialGameState(username, gender) {
    return {
        user: { loggedIn, username, userId, gender, role },
        player: {
            isNewPlayer: true  // 👈 标记：告诉前端需要初始化
        }
        // 其他字段由前端从 metadata 初始化
    };
}
```

#### 前端职责（游戏逻辑）
- ✅ 检测 `isNewPlayer` 标记
- ✅ 从 `game-metadata.js` 读取配置
- ✅ 初始化完整游戏状态
- ✅ 处理所有游戏逻辑

**代码位置**: `game.js:2613-2675`

```javascript
initializeNewPlayer() {
    // 1. 从 metadata 初始化玩家属性
    if (this.metadata.player?.initialStats) {
        Object.assign(this.gameState.player, this.metadata.player.initialStats);
    }

    // 2. 从 metadata 初始化资源
    if (this.metadata.resources?.types) {
        this.gameState.resources = {};
        this.metadata.resources.types.forEach(resource => {
            this.gameState.resources[resource.name] = resource.initialAmount || 0;
        });
    }

    // 3. 初始化境界技能系统
    this.realmSkillSystem.initializeDefaultSkillTrees();

    // 4. 初始化设置和战斗状态
    // 5. 计算装备效果
}
```

---

## ⚠️ 风险评估

### **1. 作弊风险（高危）**

#### 可利用的漏洞
```javascript
// 浏览器控制台直接修改
game.gameState.player.attack = 999999;          // 修改攻击力
game.gameState.resources.spiritWood = 999999;   // 修改资源
game.gameState.player.realm.currentRealm = 5;   // 直接升到化神

// 多次调用初始化刷初始资源
game.initializeNewPlayer();
game.saveGame();

// 篡改存档
game.gameState.player.exp = 9999999;
game.gameState.player.breakthroughStones = 999999;
await game.saveGame();
```

#### 影响范围
- ⚠️ **单机体验**: 低影响（玩家自己选择作弊）
- ⚠️ **云存档**: 中影响（作弊数据保存到服务器）
- 🔴 **排行榜**: 高影响（未实现，但会有问题）
- 🔴 **PVP**: 高影响（未实现，但会有问题）
- 🔴 **交易系统**: 高影响（未实现，但会有问题）

### **2. 数据完整性风险（中危）**

#### 问题场景
- 玩家手动修改存档文件
- 浏览器插件自动修改游戏数据
- 网络传输中数据被篡改（中间人攻击）

#### 当前防护
- ✅ HTTPS 传输（需要配置）
- ❌ 无数据签名验证
- ❌ 无操作日志审计

### **3. 多开刷号风险（中危）**

#### 漏洞
```javascript
// 玩家可以：
// 1. 注册多个账号
// 2. 每个账号获取初始资源
// 3. 转移资源（如果有交易系统）
```

#### 当前防护
- ✅ 需要注册账号（有一定门槛）
- ❌ 无设备限制
- ❌ 无IP限制
- ❌ 无行为分析

---

## 🔒 安全方案对比

### **方案1: 后端最小骨架 + 前端生成**（当前方案）

```
实现难度: ⭐
服务器成本: ⭐
安全性: ⭐⭐⭐⭐⭐ (低)
用户体验: ⭐⭐⭐⭐⭐

优点:
✅ 开发简单，快速迭代
✅ 服务器负载低
✅ 前端完全控制游戏逻辑
✅ 离线模式容易实现

缺点:
❌ 玩家可以轻松作弊
❌ 数据完整性无法保证
❌ 不适合有竞争要素的游戏

适用场景:
✅ 纯单机游戏
✅ 无排行榜
✅ 无PVP
✅ 无交易系统
✅ 玩家自己选择作弊与否
```

---

### **方案2: 服务器端生成 + 关键操作验证**（推荐）

```
实现难度: ⭐⭐⭐
服务器成本: ⭐⭐
安全性: ⭐⭐ (高)
用户体验: ⭐⭐⭐⭐

优点:
✅ 服务器生成初始数据（防刷号）
✅ 关键操作服务器验证（防作弊）
✅ 数据完整性有保障
✅ 可以添加反作弊机制

缺点:
❌ 开发复杂度增加
❌ 需要维护服务器端游戏逻辑
❌ 实时性要求高

实现要点:
1. 服务器端完整初始化
   - server.js 创建完整初始数据
   - 包含所有字段，从 metadata 读取配置

2. 关键操作API化
   POST /api/levelUp - 升级操作
   POST /api/breakthrough - 突破境界
   POST /api/upgradeSkill - 升级技能

3. 服务器端验证
   - 验证经验值是否足够
   - 验证资源是否足够
   - 验证境界是否满足要求

4. 存档验证
   - 保存时验证数据合理性
   - 检测异常数值（如攻击力 > 10000）
   - 记录操作日志

适用场景:
✅ 有排行榜的游戏
✅ 有PVP的游戏
✅ 有交易系统的游戏
✅ 需要公平竞争的游戏
```

**示例代码**:

```javascript
// server.js

// 完整的初始数据生成
function createInitialGameState(username, gender, metadata) {
    return {
        user: { loggedIn: true, username, userId: username, gender, role: 'player' },
        player: {
            ...metadata.player.initialStats,
            skills: {
                levels: { powerStrike: 1, ironSkin: 1, warriorSense: 1, enduranceRecovery: 1 },
                equipped: {
                    attack: 'powerStrike',
                    defense: 'ironSkin',
                    recovery: 'enduranceRecovery',
                    special: 'warriorSense'
                }
            },
            equipment: {},
            equipmentEffects: { attack: 0, defense: 0, hp: 0, ... },
            inventory: { items: [], consumables: {}, waypoints: ['xianxia-mountain'] }
        },
        resources: {
            spiritWood: 0, spiritWoodRate: 1,
            blackIron: 0, blackIronRate: 0.5,
            spiritCrystal: 0, spiritCrystalRate: 0.2,
            breakthroughStones: 0
        },
        settings: { ...metadata.player.defaultSettings },
        battle: { ...metadata.player.defaultBattleState },
        currentBackgroundIndex: 0,
        currentMapType: 'xianxia-mountain',
        sceneMonsters: []
    };
}

// 升级API
app.post('/api/levelUp', verifyToken, (req, res) => {
    const userId = req.user.userId;
    const saveFilePath = path.join(SAVE_DIR, `${userId}.json`);
    const gameState = JSON.parse(fs.readFileSync(saveFilePath, 'utf8'));

    // 验证经验值
    if (gameState.player.exp < gameState.player.maxExp) {
        return res.status(400).json({ error: '经验值不足' });
    }

    // 执行升级
    gameState.player.exp -= gameState.player.maxExp;
    gameState.player.maxExp = Math.floor(gameState.player.maxExp * 1.5);
    gameState.player.attack += 2;
    gameState.player.defense += 1;
    gameState.player.maxHp += 20;

    // 保存
    fs.writeFileSync(saveFilePath, JSON.stringify(gameState, null, 2));
    res.json({ success: true, gameState });
});

// 存档验证
function validateGameState(gameState) {
    const rules = {
        'player.attack': { min: 10, max: 10000 },
        'player.defense': { min: 5, max: 5000 },
        'player.hp': { min: 100, max: 100000 },
        'resources.spiritWood': { min: 0, max: 10000000 },
        'player.realm.currentRealm': { min: 0, max: 5 }
    };

    for (const [path, rule] of Object.entries(rules)) {
        const value = getNestedValue(gameState, path);
        if (value < rule.min || value > rule.max) {
            console.warn(`[安全警告] 用户 ${gameState.user.username} 数据异常: ${path}=${value}`);
            return false;
        }
    }
    return true;
}
```

---

### **方案3: 混合方案**（折中）

```
实现难度: ⭐⭐
服务器成本: ⭐⭐⭐
安全性: ⭐⭐⭐ (中)
用户体验: ⭐⭐⭐⭐

实现要点:
✅ 服务器生成初始数据
✅ 前端自由操作，保存时验证
✅ 定期扫描异常数据
✅ 记录关键操作日志

优点:
✅ 平衡开发成本和安全性
✅ 服务器负载可控
✅ 基本防作弊能力

缺点:
⚠️ 非实时验证，可能有延迟
⚠️ 仍可能被绕过

适用场景:
✅ 单机游戏为主
✅ 有云存档
✅ 有简单排行榜（不严格）
✅ 无PVP
```

---

## 📊 升级路径

### **何时需要升级安全方案？**

#### 从方案1升级到方案3的触发条件:
- ✅ 添加排行榜功能
- ✅ 发现大量作弊行为
- ✅ 玩家投诉数据异常

#### 从方案3升级到方案2的触发条件:
- ✅ 添加PVP系统
- ✅ 添加交易系统
- ✅ 添加竞技场
- ✅ 需要公平竞争

---

## 🔍 当前已知问题

### **问题1: 前后端数据结构不一致**
- **位置**: `server.js:70-72` vs `game.js:2644-2647`
- **描述**: 后端 `inventory: []`，前端 `inventory: { items: [], consumables: {}, waypoints: [] }`
- **影响**: 前端完全覆盖后端数据
- **状态**: ⚠️ 待修复

### **问题2: 技能系统重复初始化**
- **位置**: `server.js:61-68` vs `game.js:2650-2652`
- **描述**: 后端使用旧技能结构，前端使用新技能树系统
- **影响**: 浪费服务器资源
- **状态**: ⚠️ 待修复

### **问题3: isNewPlayer 标记可能被绕过**
- **位置**: `game.js:2520-2525`
- **描述**: 玩家可以删除标记后重新调用初始化
- **影响**: 可以多次获取初始资源
- **状态**: ⚠️ 待修复

---

## 🛠️ 改进建议（短期）

### **优先级 P0（立即修复）**

1. **修复前后端数据结构不一致**
   - 后端只创建最小骨架
   - 删除后端的多余字段初始化
   - 避免前后端重复逻辑

2. **添加 isNewPlayer 标记验证**
   ```javascript
   // 服务器端检查
   if (!gameState.player.isNewPlayer && gameState.player.realm) {
       // 已经初始化过，拒绝重复初始化
       return res.status(400).json({ error: 'Player already initialized' });
   }
   ```

### **优先级 P1（近期优化）**

3. **添加存档验证**
   - 保存时验证数据合理性
   - 记录异常操作日志
   - 设置数值上下限

4. **添加操作日志**
   - 记录关键操作（升级、突破、获得装备等）
   - 用于事后审计
   - 检测异常行为

### **优先级 P2（长期规划）**

5. **实现方案2或方案3**
   - 根据游戏发展方向决定
   - 如果添加排行榜/PVP，必须升级
   - 如果保持纯单机，可以保持当前方案

---

## 📝 开发指南

### **安全编码规范**

1. **永远不要信任客户端数据**
   ```javascript
   // ❌ 错误：直接使用客户端数据
   gameState.player.exp = req.body.exp;

   // ✅ 正确：服务器验证
   if (req.body.exp < 0 || req.body.exp > 1000000) {
       return res.status(400).json({ error: 'Invalid exp value' });
   }
   ```

2. **关键操作必须服务器验证**
   ```javascript
   // ✅ 升级操作应该由服务器计算
   app.post('/api/levelUp', verifyToken, (req, res) => {
       const gameState = loadGameState(req.user.userId);

       // 验证
       if (gameState.player.exp < gameState.player.maxExp) {
           return res.status(400).json({ error: '经验值不足' });
       }

       // 服务器端计算
       gameState.player.exp -= gameState.player.maxExp;
       gameState.player.maxExp = calculateNextExp(gameState.player.maxExp);
       gameState.player.attack += 2;

       saveGameState(req.user.userId, gameState);
       res.json({ success: true, gameState });
   });
   ```

3. **记录所有关键操作**
   ```javascript
   function logAction(userId, action, before, after) {
       const log = {
           timestamp: new Date().toISOString(),
           userId,
           action,
           before,
           after
       };

       fs.appendFileSync(
           path.join(LOG_DIR, `${userId}.log`),
           JSON.stringify(log) + '\n'
       );
   }
   ```

---

## 📚 参考资料

### **相关文档**
- [CHANGELOG.md](CHANGELOG.md) - 版本更新日志
- [DOCUMENTATION.md](DOCUMENTATION.md) - 游戏文档
- [TODO.md](TODO.md) - 待办事项

### **相关代码**
- [server.js](server.js) - 后端服务器
- [game.js:2613-2675](game.js#L2613-L2675) - 前端初始化
- [game-metadata.js:2004-2062](game-metadata.js#L2004-L2062) - 元数据配置

---

## 📊 决策记录

| 日期 | 决策 | 原因 | 影响范围 |
|------|------|------|----------|
| 2026-03-08 | 采用方案1（后端最小骨架） | 快速开发，游戏类型为单机 | 前端完全控制初始化 |
| 2026-03-08 | 记录未来升级方案 | 为后续添加竞争要素做准备 | 需要时可升级到方案2/3 |

---

## ✅ 行动项

- [ ] **P0**: 修复前后端数据结构不一致
- [ ] **P0**: 添加 isNewPlayer 重复初始化检查
- [ ] **P1**: 添加存档数据验证
- [ ] **P1**: 添加操作日志记录
- [ ] **P2**: 根据游戏发展决定是否升级到方案2/3
- [ ] **P2**: 定期审查安全策略

---

**最后更新**: 2026-03-08
**下次审查**: 添加排行榜/PVP功能前
