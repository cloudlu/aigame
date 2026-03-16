# 文档中心

欢迎使用无尽战斗项目文档！本页面提供了所有文档的索引和导航。

---

## 快速导航

### 新手入门
- **[README.md](../README.md)** - 项目总览和快速开始指南

### 系统设计 ([docs/systems/](./systems/))
- **[VIP充值系统](./systems/vip-system.md)** - 密码充值、仙玉商店、VIP等级特权
- **[图鉴系统](./systems/collection-system.md)** - 敌人图鉴、装备图鉴、分类全解锁奖励
- **[技能系统](./systems/skill-system.md)** - 24个技能树详细设计、伤害公式、境界压制机制
- **[技能表](./systems/skill-table.md)** - 技能名称与图片ID对照表
- **[地图系统](./systems/map-system.md)** - 地图配置、传送点、移动成本
- **[主线剧情](./systems/main-story.md)** - 主线任务与剧情框架设计
- **[平衡性设计](./systems/balance.md)** - 属性成长公式、战斗计算、平衡性调整
- **[安全设计](./systems/security.md)** - 认证与数据安全

### 开发指南 ([docs/guides/](./guides/))
- **[开发指南](./guides/development.md)** - 环境搭建、项目结构、调试技巧
- **[贡献指南](./guides/contributing.md)** - 代码提交流程与规范

### API与UI
- **[REST API](./api/rest-api.md)** - 完整的API接口文档
- **[UI设计](./ui/design.md)** - 界面设计规范

### 维护
- **[CHANGELOG.md](../CHANGELOG.md)** - 版本更新日志
- **[TODO.md](../TODO.md)** - 待办事项

---

## 按主题查找

### 游戏系统
| 系统 | 文档 |
|------|------|
| VIP充值 | [vip-system.md](./systems/vip-system.md) |
| 图鉴系统 | [collection-system.md](./systems/collection-system.md) |
| 技能系统 | [skill-system.md](./systems/skill-system.md) |
| 地图系统 | [map-system.md](./systems/map-system.md) |
| 主线任务 | [main-story.md](./systems/main-story.md) |
| 平衡性 | [balance.md](./systems/balance.md) |
| 装备系统 | [README.md](../README.md#装备系统) |
| 战斗系统 | [README.md](../README.md#战斗系统) |
| 资源系统 | [README.md](../README.md#资源系统) |

### 技术实现
| 模块 | 文档 |
|------|------|
| REST API | [rest-api.md](./api/rest-api.md) |
| UI设计 | [design.md](./ui/design.md) |
| 安全设计 | [security.md](./systems/security.md) |
| 3D渲染 | [README.md](../README.md#技术栈) |

---

## 学习路径

### 路径1：快速上手
1. [README.md](../README.md) - 了解项目
2. [development.md](./guides/development.md) - 搭建环境
3. 开始开发

### 路径2：深入理解
1. [README.md](../README.md) - 项目概况
2. [balance.md](./systems/balance.md) - 核心属性系统
3. [skill-system.md](./systems/skill-system.md) - 技能系统
4. [rest-api.md](./api/rest-api.md) - 接口文档

### 路径3：修改特定模块
1. 找到对应模块文档（上表）
2. 阅读设计文档理解原理
3. 修改代码
4. 更新对应文档

---

## 文档维护

修改代码时请同步更新相关文档：
- 修改API → 更新 `docs/api/rest-api.md`
- 添加功能 → 更新 `README.md` 和 `CHANGELOG.md`
- 修改技能 → 更新 `docs/systems/skill-system.md`
- 修改地图 → 更新 `docs/systems/map-system.md`
- 修改平衡性 → 更新 `docs/systems/balance.md`
- 修改VIP充值 → 更新 `docs/systems/vip-system.md`
- 修改图鉴 → 更新 `docs/systems/collection-system.md`

---

**最后更新**: 2026-03-16
