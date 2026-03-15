# 无尽战斗 (Endless Winter)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Web-orange.svg)

**一个基于 Babylon.js 的 3D 修仙战斗网页游戏**

[功能特性](#功能特性) • [快速开始](#快速开始) • [系统说明](#系统说明) • [技术架构](#技术架构)

</div>

---

## 📖 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [核心系统](#核心系统)
- [游戏机制](#游戏机制)
- [API 文档](#api-文档)
- [开发指南](#开发指南)
- [部署说明](#部署说明)
- [常见问题](#常见问题)

---

## 🎮 项目简介

**无尽战斗 (Endless Winter)** 是一款以修仙为题材的 3D 网页游戏。玩家从"武者境"开始修炼，通过战斗、升级技能、装备强化等方式不断提升境界，最终达到"化神境"的巅峰。

### 核心玩法
- 🗡️ **回合制战斗**：策略性的技能释放和战斗系统
- 🎯 **技能树系统**：6大境界 × 4系技能树 = 24个技能树，96个技能等级
- ⚔️ **装备系统**：武器、护甲、头盔、下裳、靴子、灵宝、法器、护符共8种装备
- 🗺️ **3D地图探索**：基于 Babylon.js 的3D场景，实时战斗
- 💾 **云端存档**：基于 Node.js 的后端服务，支持用户注册、登录、存档

---

## ✨ 功能特性

### 用户系统
- ✅ 用户注册与登录
- ✅ 密码加密存储（bcrypt）
- ✅ Token 认证机制
- ✅ 角色性别选择
- ✅ 管理员权限系统

### 战斗系统
- ✅ 回合制战斗机制
- ✅ 3D 战斗场景
- ✅ 技能特效与音效
- ✅ 自动战斗模式
- ✅ 战斗日志记录

### 技能系统
- ✅ 24个技能树（6境界 × 4系）
- ✅ 96个技能等级
- ✅ 4种技能类型：攻击、防御、恢复、特殊
- ✅ 技能升级与解锁机制
- ✅ 技能特效与音效

### 装备系统
- ✅ 8种装备槽位：武器、护甲、头盔、下裳、靴子、灵宝、法器、护符
- ✅ 装备品质：白、蓝、紫、金、彩 5种品质
- ✅ 装备前缀按境界×品质分级（30种前缀组合）
- ✅ 装备强化系统（精炼等级 0-10级）
- ✅ 装备属性刷新与合成
- ✅ 装备属性加成

### 资源系统
- ✅ 木材、铁矿、水晶等资源
- ✅ 自动资源采集
- ✅ 资源存储上限机制
- ✅ 资源交易与购买

### 地图系统
- ✅ 3D 地图场景
- ✅ 7x7 小地图显示（43+ 敌人/地图）
- ✅ 怪物生成与分布
- ✅ 区域探索
- ✅ 空中飞行敌人（鸟类、幽灵类）
- ✅ 点击移动碰撞检测
- ✅ 小地图点击跑向敌人

---

## 🛠️ 技术栈

### 前端
- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **JavaScript (ES6+)** - 游戏逻辑
- **Babylon.js** - 3D 渲染引擎
- **Tailwind CSS** - UI 框架
- **Font Awesome** - 图标库

### 后端
- **Node.js** - 运行环境
- **Express.js** - Web 框架
- **bcrypt** - 密码加密
- **CORS** - 跨域支持

### 数据存储
- **JSON 文件系统** - 用户数据与游戏存档

---

## 🚀 快速开始

### 前置要求

- Node.js >= 14.0.0
- npm >= 6.0.0
- 现代浏览器（支持 WebGL）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <your-repository-url>
   cd endlessWinter
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动服务器**
   ```bash
   npm start
   # 或
   node server.js
   ```

4. **访问游戏**
   
   打开浏览器访问：`http://localhost:3002`

### 首次运行

1. 点击"注册"按钮创建账号
2. 填写用户名、密码和性别
3. 登录后即可开始游戏

---

## 📁 项目结构

```
endlessWinter/
├── 📄 index.html              # 主游戏页面
├── 📄 login.html              # 登录/注册页面
├── 📄 skill-image-check.html  # 技能图标检查工具
│
├── 📂 js/                     # JavaScript 模块
│   ├── 🎮 game.js             # 游戏核心逻辑
│   ├── ⚔️ combatlogic.js      # 战斗逻辑
│   ├── 🎨 battle3d.js         # 3D战斗场景
│   ├── 🗺️ map.js              # 地图系统
│   ├── 🎯 realmSkillSystem.js  # 境界技能系统
│   ├── ⚙️ equipment.js        # 装备系统
│   ├── 🔊 audio.js            # 音效系统
│   ├── 🎨 models.js           # 3D模型
│   └── 📊 game-metadata.js    # 游戏元数据
│
├── 📂 server/                 # 后端服务
│   └── 🖥️ server.js           # Express 服务器
│
├── 📂 Images/                 # 游戏图片资源
│   ├── 🖼️ equipment/          # 装备图标
│   ├── 🖼️ characters/         # 角色图片
│   ├── 🖼️ skills/             # 技能图标
│   └── 🖼️ buttons/            # 按钮图片
│
├── 📂 assets/                 # 静态资源
│   └── 📂 textures/           # 3D纹理
│
├── 📂 lib/                    # 第三方库
│   ├── 📚 babylon.js          # Babylon.js引擎
│   └── 📚 babylonjs.loaders.min.js
│
├── 📂 docs/                   # 项目文档
│   ├── systems/               # 系统设计文档
│   ├── guides/                # 开发指南
│   ├── api/                   # API 文档
│   └── ui/                    # UI 设计
│
├── 📂 saves/                  # 游戏存档目录
├── 📂 users/                  # 用户数据目录
│
├── 📄 package.json            # 项目配置
├── 📄 .gitignore              # Git忽略配置
└── 📄 README.md               # 项目说明文档
```

---

## 🎯 核心系统

### 1. 技能树系统

游戏共有 **6个境界**，每个境界包含 **4个技能树**，共计 **24个技能树**，**96个技能等级**。

#### 境界划分
| 境界 | 等级 | 解锁条件 |
|------|------|----------|
| 武者境 | 0 | 初始解锁 |
| 炼气境 | 1 | 完成武者境修炼 |
| 筑基境 | 2 | 完成炼气境修炼 |
| 金丹境 | 3 | 完成筑基境修炼 |
| 元婴境 | 4 | 完成金丹境修炼 |
| 化神境 | 5 | 完成元婴境修炼 |

#### 技能类型
- **攻击型**：造成伤害，倍率递增
- **防御型**：减少伤害，百分比递增
- **恢复型**：恢复生命值，百分比递增
- **特殊型**：特殊效果（如暴击、吸血等）

#### 技能升级
- 每个技能树有4个等级（Lv.1 - Lv.4）
- 需要满足境界要求和阶段要求
- 消耗灵力（能量）释放技能
- 技能等级越高，效果越强

**详细设计文档**：参见 [docs/systems/skill-system.md](./docs/systems/skill-system.md)

---

### 2. 装备系统

#### 装备槽位（8种）
| 槽位 | 定位 | 核心属性 |
|------|------|----------|
| **武器** | 物理攻击主输出 | 攻击、速度、幸运、暴击率 |
| **护甲** | 身体防护 | 防御、生命、速度、闪避率 |
| **头盔** | 头部防护 | 防御、生命、幸运、精准 |
| **下裳** | 下身防护 | 防御、生命、速度、韧性 |
| **靴子** | 足部防护 | 防御、幸运、速度、移速 |
| **灵宝** | 修炼辅助 | 幸运、生命、灵力恢复、速度 |
| **法器** | 战斗强化 | 攻击、防御、生命、暴击率 |
| **护符** | 佩戴型护身物 | 幸运、生命、速度、灵力恢复 |

#### 装备品质
- 白色（1条属性）→ 蓝色（2条）→ 紫色（3条）→ 金色（4条）→ 彩色（5条）

#### 装备命名
- 前缀按**境界×品质**分级：武者期白色装备为"凡铁剑"，化神期彩色为"造化剑"
- 后缀修仙化：飞履、仙裳、灵符、灵珠等

#### 装备强化
- **精炼等级**：0-10级
- **精炼效果**：每级提升装备属性百分比
- **精炼消耗**：金币 + 材料

#### 装备商店
- 使用资源购买装备
- 不同装备有不同的属性加成
- 稀有度系统（普通、稀有、史诗、传说）

---

### 3. 战斗系统

#### 战斗流程
1. 玩家选择技能
2. 计算伤害（基础伤害 × 技能倍率 × 装备加成）
3. 应用防御减伤
4. 扣除生命值
5. 检查战斗结果

#### 战斗模式
- **手动战斗**：玩家主动选择技能
- **自动战斗**：AI自动选择最优技能
- **快速战斗**：跳过动画，快速结算

#### 战斗场景
- 3D 实时渲染场景
- 角色模型与动作
- 技能特效与粒子效果
- 血条与状态显示

---

### 4. 资源系统

#### 资源类型
- **木材（Wood）**：基础建设材料
- **铁矿（Iron）**：装备打造材料
- **水晶（Crystal）**：高级强化材料
- **金币（Gold）**：通用货币

#### 资源获取
- 自动采集（每秒增长）
- 战斗掉落
- 任务奖励
- 商店购买

#### 资源上限
- 每种资源有存储上限
- 升级仓库提升上限
- 超过上限不再增长

---

### 5. 用户系统

#### 用户数据
```javascript
{
  username: "玩家用户名",
  password: "加密后的密码",
  gender: "male/female",
  role: "player/admin",
  playerData: {
    level: 等级,
    exp: 经验值,
    realm: 境界,
    stage: 阶段,
    // ... 更多属性
  }
}
```

#### 认证流程
1. 用户注册/登录
2. 服务器生成 Token
3. 客户端保存 Token
4. 每次请求携带 Token
5. 服务器验证 Token 有效性

---

## 🎲 游戏机制

### 境界压制
高境界 Lv.1 > 低境界 Lv.4

### 属性系统
- **生命值（HP）**：角色生命，归零则失败
- **灵力（Energy）**：释放技能消耗
- **攻击力（Attack）**：伤害基础
- **防御力（Defense）**：减伤基础
- **速度（Speed）**：行动顺序

### 成长曲线
- **经验值**：战斗获得，升级需要
- **境界提升**：完成特定条件解锁
- **技能点**：升级获得，用于技能升级

### 战斗公式
```
最终伤害 = (基础攻击 × 技能倍率 × 装备加成) × (1 - 防御减伤率)
```

---

## 🌐 API 文档

### 认证 API

#### 注册
```
POST /api/register
Body: { username, password, gender }
Response: { success: true, token, user }
```

#### 登录
```
POST /api/login
Body: { username, password }
Response: { success: true, token, user }
```

### 游戏 API

#### 获取游戏元数据
```
GET /api/metadata
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, metadata }
```

#### 保存游戏
```
POST /api/save
Headers: { Authorization: "Bearer <token>" }
Body: { gameState }
Response: { success: true }
```

#### 加载游戏
```
GET /api/load
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, gameState }
```

---

## 💻 开发指南

### 代码规范
- 使用 ES6+ 语法
- 类和模块化开发
- 统一的元数据管理（game-metadata.js）
- 清晰的注释

### 添加新技能
1. 在 `game-metadata.js` 中添加技能数据
2. 配置技能参数（伤害倍率、消耗等）
3. 添加技能图标到 `Images/skills/`
4. 测试技能平衡性

### 添加新装备
1. 在 `game-metadata.js` 的 `equipmentSlotConfig` 中添加槽位配置
2. 在 `equipmentTemplates` 中添加装备模板（属性、后缀）
3. 准备装备图片到 `Images/` 目录
4. 所有系统自动适配（合成、精炼、掉落、UI等）

### 调试技巧
```javascript
// 在浏览器控制台中
game.gameState  // 查看游戏状态
game.player     // 查看玩家数据
game.metadata   // 查看元数据
```

---

## 🚢 部署说明

### 本地部署
```bash
npm start
```

### 生产环境部署

#### 使用 PM2
```bash
npm install -g pm2
pm2 start server.js --name endless-winter
```

#### 使用 Docker
```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3002
CMD ["node", "server.js"]
```

#### 环境变量
- `PORT`: 服务端口（默认 3002）
- `NODE_ENV`: 运行环境（development/production）

---

## ❓ 常见问题

### Q: 游戏无法启动？
**A**: 检查以下几点：
1. Node.js 版本是否 >= 14
2. 依赖是否安装完成（`npm install`）
3. 端口 3002 是否被占用

### Q: 3D 场景无法显示？
**A**: 
1. 检查浏览器是否支持 WebGL
2. 更新显卡驱动
3. 尝试其他浏览器（Chrome、Firefox）

### Q: 存档丢失？
**A**: 
1. 检查 `saves/` 目录权限
2. 确保服务器正常启动
3. 查看服务器日志

### Q: 如何修改游戏数值？
**A**:
1. 修改 `game-metadata.js` 中的元数据
2. 重启服务器

---

## 📝 更新日志

### v1.13 (2024-03-07)
- 优化技能系统
- 修复已知bug

### v1.12 (2024-03-06)
- 新增装备强化系统
- 优化3D场景性能

### v1.11 (2024-03-05)
- 完善技能树系统
- 添加音效系统

### v1.10 (2024-03-04)
- 新增用户系统
- 实现云端存档

### v1.09 (2024-03-03)
- 初始版本发布
- 基础战斗系统
- 3D场景搭建

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 👨‍💻 作者

开发团队 - 无尽战斗项目组

---

## 🙏 致谢

- [Babylon.js](https://www.babylonjs.com/) - 强大的 3D 引擎
- [Tailwind CSS](https://tailwindcss.com/) - 实用的 CSS 框架
- [Express.js](https://expressjs.com/) - 灵活的 Node.js 框架
- 所有贡献者和玩家

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star ⭐**

</div>
