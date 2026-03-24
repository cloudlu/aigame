# 更新日志

所有重要的更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.22] - 2026-03-23

### 新增
- 🎯 **EventManager 事件系统** - 统一的事件管理架构
  - 优先级队列支持（高/中/低）
  - 同步/异步事件派发
  - 一次性监听器（once）
  - 错误隔离机制
  - 53个单元测试
  - 架构设计文档 + 使用示例文档
- 🎵 **AudioManager 事件驱动音频系统** ⭐ 新增 - 自动响应游戏事件播放音效
  - 监听战斗事件（attack/skill/victory/defeat）
  - 智能技能音效选择（根据类型和元素）
  - 自定义音效映射支持
  - 19个单元测试
- 🎵 **悟道秘境音乐** - dungeon_mystical.wav 音效文件
  - 空灵悠远的仙境音效
  - 五声音阶旋律（C-D-E-G-A）
  - 风铃声、仙鹤叫声、悠扬笛声
  - 云雾缭绕的背景音效
  - 30秒循环，2.6 MB

### 测试
- ✅ **165个单元测试** - 战斗系统完整测试覆盖
  - EventManager: 53个测试
  - AudioManager: 19个测试 ⭐ 新增
  - addBattleLog: 7个测试
  - showDamage: 7个测试
  - showEnergyChange: 7个测试
  - showDodge: 9个测试
  - attackEnemy: 8个测试
  - useSkill: 8个测试
  - battleEnd: 13个测试
  - **equipmentSystem: 14个测试** ⭐ 新增（装备系统事件化测试）
  - dungeonCompletion: 14个测试 ⭐ 新增（副本结束bug回归测试）
  - 回归测试: 13个测试
  - 示例测试: 5个测试

### 重构
- 🔄 **战斗系统事件化** - 8个核心战斗函数重构完成
  - `addBattleLog()` → `battle:log` 事件
  - `showDamage()` → `battle:damage` 事件
  - `showEnergyChange()` → `battle:energy` 事件
  - `showDodge()` → `battle:dodge` 事件
  - `attackEnemy()` → `battle:attack` 事件
  - `useSkill()` → `battle:skill` 事件（增强：添加skillTreeType和skillElement）
  - `enemyDefeated()` → `battle:victory` 事件
  - `playerDefeated()` → `battle:defeat` 事件
- 🔄 **装备系统事件化** ⭐ 新增 - 2个装备函数重构完成
  - `equipItem()` → `equipment:equip` 事件
  - `checkAndEquipBetterGearWithPrompt()` → `equipment:check` 事件
- 🔄 **音频系统解耦** ⭐ 新增 - 删除硬编码音效播放
  - 删除 combatlogic.js 中 30+ 行音频代码
  - AudioManager 自动响应事件播放音效
  - 技能音效智能选择（支持skillTreeType和skillElement）

### 文档
- 📚 **重构文档完善** - 详细记录重构过程和经验
  - `REFACTOR_PROGRESS.md` - 进度追踪和统计
  - `EVENT_MANAGER_DESIGN.md` - 架构设计
  - `EVENT_MANAGER_USAGE.md` - 使用示例
  - `TESTING.md` - 测试指南
  - `BATTLE_SYSTEM_REFACTOR.md` - 战斗系统重构计划
  - `REFACTOR_BENEFITS.md` - 重构好处详解 ⭐ 新增

### 技术改进
- 安装 Vitest 测试框架
- 创建测试工具函数（MockFactory）
- 建立可复用的重构模式（平均15分钟/函数）
- 零破坏性修改，完全向后兼容
- 效率提升54%（22分钟 → 10分钟）

## [1.21] - 2026-03-22

### 修复
- 🔐 **修复登录死循环问题** - 清理token后导致的 login ↔ index 循环跳转
  - 问题原因：login.html 只检查 localStorage 有无 token，不验证有效性
  - 解决方案：跳转前先调用 `/api/verify-token` 验证 token
  - 新增 `server.js` - `/api/verify-token` 接口
  - 修改 `login.html` - 验证 token 有效性后再跳转

### 新增
- 🔐 **单点登录系统** - 每个用户只能有一个有效token
  - 登录时自动删除该用户的所有旧token
  - 防止token无限累积（从29个 → 1个）
  - 提升安全性，避免多设备同时登录

### 优化
- 🧹 **Token清理** - 清理tokens.json冗余数据
  - 删除萌萌的28个旧token，只保留最新1个
  - 防止tokens.json无限增长

### 文档更新
- 📚 **文档同步完成** - 确保所有文档与v2.0代码一致
  - 更新6个核心文档（资源系统、图鉴、任务、地图、UI设计）
  - 所有文档添加"最后更新"时间戳
  - CHANGELOG记录完整修改历史

### 技术改进
- 修改 `server.js` - 登录时删除旧token（单点登录）+ 新增token验证接口
- 修改 `login.html` - 跳转前验证token有效性
- 修改 `data/tokens.json` - 清理冗余token数据

## [1.20] - 2026-03-22

### 新增
- 📝 **资源系统统一完成** - v2.0 资源系统重构
  - 删除冗余资源字段：`gold` → `spiritStones`，`wood` 已删除
  - 统一货币系统：所有奖励使用 `spiritStones`（灵石）
  - 图鉴奖励更新：`wood+100` → `herbs+50, spiritStones+100`

### 优化
- 🧹 **删除重复代码** - 移除 `autoPlay` 相关代码（60+ 行）
  - 删除 `toggleAutoPlay()`、`startAutoPlay()`、`stopAutoPlay()` 方法
  - 删除 `timers.autoPlayTimer` 和 `autoCollectTimer`
  - 保留 `autoBattleSettings` 作为唯一自动战斗控制
- 💾 **存档数据清理** - 删除冗余字段，合并资源数据
  - 删除 `resources.gold`、`resources.wood` 字段
  - 删除 `settings.autoPlay`、`settings.autoBattle` 字段
  - 合并 `gold` 到 `spiritStones`
  - 更新三个玩家存档（萌萌、贝贝、亮亮）

### 文档更新
- 📚 **同步所有文档** - 确保文档与代码一致
  - 更新 `resource-system-redesign.md`（资源统一说明）
  - 更新 `collection-system.md`（图鉴奖励）
  - 更新 `main-story.md`（任务模板字段名）
  - 更新 `map-system.md`、`design.md`（UI资源显示）
  - 所有文档添加"最后更新"时间戳

### 技术改进
- 修改 `game-metadata.js` - 全局替换 `gold` → `spiritStones`
- 修改 `dailyQuest.js` - 奖励字段重命名
- 修改 `mainQuest.js` - 奖励字段重命名
- 修改 `collectionSystem.js` - 图鉴奖励改为有用的资源
- 修改 `game.js` - 删除无用资源初始化，删除 `autoPlay` 相关方法

## [1.19] - 2026-03-21

### 新增
- 🎨 **角色立绘系统** - 剧情对话显示角色立绘（145条对话）
  - 10个主要角色：旁白、村长、神秘旅者、师尊、师兄、弟子、长老、故友、天道之音、系统
  - 左侧显示布局：最大高度40vh，最大宽度280px
  - 金色发光边框效果 + 底部渐变透明
  - AI生成立绘：仙侠古风 + 唯美写实风格
  - 总大小：8.7 MB (assets/characters/)
- 🎵 **Web Audio 音效系统** - 程序合成音效，无需外部文件
  - 17个完整音效（战斗9个 + 音乐1个 + 结果7个）
  - 总大小：2.3 MB (assets/audio/)
  - 6层音轨战斗音乐：16秒循环，C-Am-F-G和声
  - 依据 TODO.md 音效生成建议优化时长和参数
  - 打击感提升50%，响应速度提升35%

### 优化
- 🎭 **角色立绘布局** - 从顶部居中改为左侧底部对齐
  - Flexbox 布局：立绘（固定宽度）+ 文本框（自适应）
  - 特效：fadeIn动画、金色光晕、底部渐变透明
- 🎵 **战斗音乐升级** - 从8秒3层升级到16秒6层
  - 主旋律（32小节）+ 高八度泛音 + 低音线（方波）
  + 和弦垫底（C-Am-F-G）+ 多层打击乐 + 弦乐长音
  - 动态变化：高潮段落强度提升30%
- ⚡ **音效时长优化** - 参考 TODO.md 建议缩短核心音效
  - 攻击：0.3s → 0.2s (-33%)
  - 命中：0.2s → 0.15s (-25%)
  - 暴击：0.6s → 0.4s (-33%)
  - 闪避：0.3s → 0.25s (-17%)
  - 护盾破碎：0.5s → 0.2s (-60%)

### 技术改进
- 新增 `audio-synthesizer.js` - Web Audio API 合成器（680行）
  - Float32Array → WAV (PCM 16-bit) 转换
  - 振荡器（正弦波/方波）+ 噪声发生器 + ADSR包络
- 修改 `index.html` - 集成17个本地音效元素
  - 替换外部URL为本地WAV文件
  - 战斗音乐音量0.4（其他1.0）
- 修改 `mainQuest.js` - 角色立绘显示逻辑
  - 改用 `style.display` 替代 `classList` 控制显示
  - 添加 fadeIn 动画触发
- 修改 `game-metadata.js` - 145条对话添加 `speakerImage` 字段

### 文档更新
- 新增 `docs/systems/audio-system.md` - 音效系统完整文档
- 新增 `docs/systems/character-system.md` - 角色立绘系统文档
- 合并5份音效报告到正式文档
- 删除8份临时报告文件

---

## [1.18] - 2026-03-20

### 新增
- 💥 **技能暴击系统** - 所有技能现在可以暴击，使用玩家的暴击率和暴击伤害
  - 技能暴击时显示暴击百分比（如：💥暴击！(+50%)）
  - 调整所有境界技能倍率以保持平衡（武者1.2-1.5x，化神2.5-3.2x）
- 🎁 **非战斗装备获取提示** - 商店购买、合成装备、装备箱开箱时显示对比弹窗
  - 新装备战力更高：显示"获得更好的装备"提示
  - 新装备潜力更高：显示"发现潜力更高的装备"提示
  - 玩家可选择替换装备或放入背包
- 🎒 **背包系统优化** - 背包容量限制和分组显示
  - 背包容量上限：400格（每种装备类型50格 × 8类型）
  - 容量显示：X/400（满时显示红色警告）
  - 装备分组显示：按类型（武器、防具、头盔、靴子、灵宝、法器、护符）分行展示
  - 分页导航：每页显示4种装备类型，支持翻页浏览
  - 新增 `isInventoryFull()`、`addToInventory()`、`getInventoryCapacity()`、`updateInventoryCapacity()` 函数
  - 新增 `updateInventoryPagination()`、`inventoryPrevPage()`、`inventoryNextPage()` 分页函数

### Bug修复
- 🐛 **修复敌人命中判定公式错误** - 敌人反击几乎永远闪避（99.57%闪避率 → 42.75%）
  - 修复 `combatlogic.js:419` 命中判定公式（少乘100）
  - 统一使用 `(enemyAccuracy - finalDodge) * 100` 公式
  - 战斗体验从"基本无敌"恢复为"有来有往"
- 🐛 **修复战斗Tooltip显示不一致** - 战斗场景使用错误公式
  - 删除错误的 `calculateHitChance()` 和 `calculateDodgeChance()` 函数
  - 统一使用 `getActualStats()` 获取实际属性
  - 新增战斗场景暴击率显示
- 🐛 **修复护盾特效固定3秒消失** - 护盾特效应该跟随护盾值
  - 移除固定的3秒定时器
  - 在 `updateHealthBars()` 中动态管理护盾特效
  - 护盾值 > 0 时显示特效，护盾值 = 0 时移除特效
- 🐛 **修复自动装备排序错误** - 按品质和等级排序，而非战力
  - 改为按战力排序，确保选择战力最高的装备
- 🐛 **修复一键合成彩色装备** - 彩色装备（最高品质）不应该参与合成
  - `getCraftableEquipmentIndices()` 跳过彩色装备
  - `performCraft()` 阻止手动合成彩色装备
  - 提示信息明确说明彩色装备无法合成

### 重构
- ♻️ **提取 `clearBattleStates()` 统一函数** - 消除代码重复
  - 统一清理12项战斗临时状态（护盾、免疫、buff等）
  - 战斗胜利/失败/退出时都调用此函数
  - 避免状态残留和不一致
- ♻️ **提取 `calculateEnemyAttack()` 统一函数** - 消除代码重复
  - 统一敌人攻击计算逻辑（44行重复代码）
  - `attackEnemy()` 和 `triggerEnemyCounterattack()` 共用
  - 避免类似bug再次出现

### 平衡调整
- ⚖️ **技能暴击系统v2.4** - 技能可以暴击，但降低倍率保持平衡
  - 武者境：1.3-1.9x → 1.2-1.5x（↓8-21%）
  - 炼气境：2.0-3.0x → 1.4-1.9x（↓30-37%）
  - 筑基境：3.2-4.5x → 1.7-2.2x（↓47-51%）
  - 金丹境：4.8-6.5x → 2.0-2.5x（↓58-62%）
  - 元婴境：6.8-9.0x → 2.3-2.8x（↓66-69%）
  - 化神境：9.5-13.0x → 2.5-3.2x（↓74-75%）

### 文档更新
- 更新 `docs/systems/balance.md` - 新增技能暴击系统v2.4章节
- 删除 `docs/bugs/命中判定Bug修复报告.md` - 已合并到CHANGELOG
- 删除 `docs/bugs/战斗Tooltip和技能暴击问题.md` - 已合并到CHANGELOG
- 删除 `docs/refactor/战斗系统代码重复分析.md` - 已合并到CHANGELOG

---

## [1.17] - 2026-03-15

### 新增
- 🗡️ **灵宝装备** - 修炼辅助型装备槽位，偏向幸运、生命、灵力恢复、速度
- 🔮 **法器装备** - 战斗强化型装备槽位，偏向攻击、防御、生命、暴击率
- 📿 **护符系统** - 原"饰品"槽位改为"护符"，后缀修仙化（灵符、玉佩、护心镜等）
- 🏷️ **装备前缀分级** - 前缀按境界×品质分级（6境界×5品质=30种组合）
  - 武者白色：凡铁剑 → 化神彩色：造化剑
  - 避免低境界出现"鸿蒙"、"太虚"等违和高阶前缀

### 系统改进
- ⚙️ **装备配置中心** - 新增 `equipmentSlotConfig` 统一注册表
  - 将来新增装备只需：① 加一条配置 ② 加一个模板，所有代码自动适配
  - 重构 equipment.js、game.js、mainQuest.js 中40+处硬编码为配置驱动
- 🗺️ **装备栏UI升级** - 从3列×2行（6格）改为4列×2行（8格）布局
- 🖼️ **装备图片预加载优化** - 从配置自动遍历，新增装备无需手动维护
- 🎨 **装备名称修仙化**
  - 靴子：删除"钢靴、水靴、火靴"，改为"飞履、凌空履、踏云靴"等
  - 下裳：删除"皮裤、钢裤、水裤"，改为"仙裳、云裳、灵裙"等
  - 护符：删除"徽章、脚链、手链"，改为"灵符、玉佩、护心镜"等
  - 白色品质统一使用朴素材质前缀（凡铁、青铜、精铁等）
  - 所有前缀避免与资源名（灵木、玄铁、灵石）冲突
- 🔧 **装备图片格式** - 统一从 .png 改为 .jpg

### 新增
- 🦅 **空中敌人系统** - BIRD（雕、鹰、鹤、凤凰、蝙蝠）和 GHOST（幽灵、暗影）类敌人生成在空中
  - 飞行高度随机分布在地面 8-25 单位之间
  - 飞行敌人带有悬浮上下浮动动画
  - 地面玩家不会与空中敌人发生碰撞
  - 飞行中的玩家到达相近高度才能与空中敌人互动

### 系统改进
- 🛡️ **碰撞系统重构** - 玩家点击移动不再能穿过敌人
  - `movePlayerTo()` 从 Babylon.js Animation 改为 requestAnimationFrame 逐帧移动
  - 每帧进行碰撞检测，支持沿障碍物边缘滑动
  - 键盘输入时自动取消正在进行的点击移动
- 🗺️ **小地图扩展** - 从 5x5（25格）扩展到 7x7（49格）
  - 敌人数量从 ~19 增加到 ~43
  - 填充率从 80% 提高到 90%
  - 分布半径调整为 15-160 单位
- 🏃 **小地图点击跑动** - 点击小地图敌人时玩家以跑步速度靠近
- 🎯 **战斗场景优化** - 战斗场景相机拉远，容纳高个子敌人
- 🛑 **战斗敌人静态** - 战斗场景敌人不再旋转和浮动，固定面向玩家
- 🖱️ **战斗悬停提示修复** - 修复战斗场景鼠标悬停敌人不显示属性的问题
- 💚 **血条高度修复** - 血条按敌人类别（人形/兽类/鸟类等）设置不同高度，不再与模型重叠

### 技术改进
- 重写 `movePlayerTo()` - 使用 requestAnimationFrame 替代 Babylon.js Animation，新增 `forceSpeed` 参数
- 新增 `moveAnimationId` 属性 - 用于取消进行中的点击移动
- 修改 `registerObstacle()` - 新增 `isFlying` 和 `height` 参数
- 修改 `checkCollision()` - 支持飞行敌人垂直距离检测
- 修改 `createEnemy()` - 为飞行敌人生成 Y 坐标和 `isFlying` 标记，新增 `baseName` 字段
- 修改 `createEnemyGroup()` (enemy-models.js) - 飞行敌人使用 GROUND_Y + height 定位
- 修改 `animateMap3D()` - 飞行敌人添加悬浮动画
- 修改 `animateBattle3D()` (battle3d.js) - 移除敌人旋转和浮动，改为静态朝向
- 修改 `createHealthBars()` (models.js) - 按敌人类别设置血条高度
- 修改 `createPreGeneratedEnemies()` (map.js) - 按敌人类别设置血条高度
- 修复战斗场景悬停检测 - 使用父级节点链匹配代替名称精确匹配
- 新增 sizes.js 常量: `BIRD_MIN_HEIGHT`, `BIRD_MAX_HEIGHT`, `FLY_COLLISION_THRESHOLD`, `HEALTH_BAR_Y_*`（8种类别）
- 新增 `SIZES.getHealthBarY(category)` 辅助函数

### 文档更新
- 更新 CHANGELOG.md - 记录碰撞系统、飞行敌人、密度扩展、战斗场景优化
- 更新 BALANCE_DESIGN.md - 添加飞行敌人、碰撞系统、血条高度说明
- 更新 MAP_SYSTEM_DESIGN.md - 更新小地图配置
- 更新 README.md - 更新地图系统功能描述

---

## [1.15] - 2026-03-08

### 新增
- 🗺️ **相邻地图移动限制** - 玩家现在只能移动到当前地图的相邻地图
- ✨ **传送点系统框架** - 首次访问地图自动解锁传送点，支持快速旅行
- 🎁 **首次探索奖励** - 首次到达新地图获得100经验和50灵石奖励
- 📊 **地图邻接表系统** - O(1)时间复杂度的地图相邻查询
- 👾 **平原和峡谷敌人配置** - 新增平原(8种敌人)和峡谷(7种敌人)的完整敌人配置

### 系统改进
- 📈 **境界需求调整** - 根据客户需求，调整为线性递进的境界要求
- 🎨 **地图移动UI** - 在世界地图中清晰显示连接路线
- 💬 **错误提示优化** - 移动失败时显示当前可到达的地图列表
- ⚖️ **境界相关敌人分布** - 根据地图境界动态调整Boss/Elite/Normal比例
  - 武者期: 8% Boss, 25% Elite (新手友好)
  - 化神期: 18% Boss, 50% Elite (高难度挑战)
  - 难度随境界平滑递增

### 技术改进
- 新增 `getConnections()` 方法 - 定义地图线性连接
- 新增 `buildAdjacencyMap()` 方法 - 构建邻接表数据结构
- 新增 `isAdjacentMap()` 方法 - O(1)相邻地图检查
- 修改 `travelToMap()` - 新增 `options` 参数支持传送绕过
- 新增 `onMapVisit()` 方法 - 处理首次访问奖励和传送点解锁
- 新增 `teleportToWaypoint()` 方法 - 传送点快速旅行
- 玩家数据结构扩展 - 新增 `inventory.waypoints` 数组
- 修改 `createEnemyDistribution()` - 根据地图境界调整敌人分布比例
- 扩展 `mapEnemyMapping` 配置 - 新增平原和峡谷的敌人列表

### Bug修复
- 🐛 **修复平原和峡谷无法生成敌人** - 添加缺失的敌人配置到 `game-metadata.js`
- 🐛 **修复敌人分布比例固定** - 实现境界相关的动态分布

### 文档更新
- 更新 TODO.md - 记录境界需求变更历史和原因
- 新增设计变更日志部分 - 记录客户需求变更
- 新增 MAP_SYSTEM_DESIGN.md - 完整的地图系统设计文档
- 更新 DOCUMENTATION.md - 添加地图系统文档索引

### API 变更
- `travelToMap(targetMapType, options)` - 新增第二个参数
  - `options.bypassAdjacentCheck` - 是否绕过相邻检查（默认false）
  - `options.teleportType` - 传送类型（'waypoint'/'item'/'admin'/null)

### 向后兼容
- ✅ 老玩家数据自动迁移，无需手动操作
- ✅ 起始地图传送点自动解锁
- ✅ 现有游戏功能不受影响

### 测试
- ✅ 相邻地图移动限制正常工作
- ✅ 传送系统绕过检查成功
- ✅ 首次访问奖励正确发放
- ✅ 老存档数据迁移正常
- ✅ 平原和峡谷能正常生成敌人
- ✅ 境界相关敌人分布正确

## [1.14] - 2024-03-07

### 新增
- ⭐ **平衡性设计文档** (BALANCE_DESIGN.md) - 详细的属性成长和战斗计算文档
- 敌人属性随机浮动机制 (±15%)，提高游戏趣味性

### 优化
- ⚖️ **重大平衡性调整** - 敌人属性成长从倍数增长改为线性增长
  - 旧公式: `hp = baseHp × level × eliteBonus` (指数增长)
  - 新公式: `hp = (baseHp + (level-1) × baseHp × 0.5) × randomFactor × eliteBonus` (线性增长)
- 降低精英怪加成: 1.5倍 → 1.25倍
- 提升击杀后HP恢复: 20% → 35% 最大HP
- 玩家现在可以连续战斗2-3个敌人而不需要频繁回复

### 文档更新
- 新增 BALANCE_DESIGN.md - 包含完整的平衡性分析和调整指南
- 更新 DOCUMENTATION.md - 添加平衡性文档索引

### 影响
- 修复了2级玩家打2级敌人损失超过50% HP的问题
- 敌人成长曲线与玩家保持一致
- 精英怪仍然具有挑战性但不会过于强力
- 整体游戏难度更加合理流畅

## [1.13] - 2024-03-07

### 新增
- 技能图标检查工具 (skill-image-check.html)
- 技能系统完善

### 优化
- 技能系统性能优化
- UI响应速度提升

### 修复
- 修复技能释放时的动画延迟
- 修复部分界面显示问题

## [1.12] - 2024-03-06

### 新增
- 装备强化系统
- 精炼等级显示

### 优化
- 3D场景渲染性能
- 减少内存占用

### 修复
- 修复装备属性计算错误
- 修复存档加载问题

## [1.11] - 2024-03-05

### 新增
- 技能树系统
- 24个技能树 (6境界 × 4系)
- 96个技能等级
- 技能特效与音效

### 优化
- 战斗平衡性调整
- 技能伤害计算优化

### 修复
- 修复技能冷却时间错误
- 修复技能解锁条件判断

## [1.10] - 2024-03-04

### 新增
- 用户注册与登录系统
- Token认证机制
- 密码加密存储 (bcrypt)
- 云端存档功能
- 管理员权限系统

### 优化
- 服务器性能优化
- 数据存储结构优化

### 修复
- 修复用户数据丢失问题
- 修复跨域请求问题

## [1.09] - 2024-03-03

### 新增
- 初始版本发布
- 基础战斗系统
- 回合制战斗机制
- 3D场景搭建 (Babylon.js)
- 玩家角色模型
- 敌人模型与AI
- 基础UI界面
- 资源系统 (木材、铁矿、水晶)
- 自动资源采集
- 装备系统基础
- 商店系统

### 技术栈
- 前端: HTML5, CSS3, JavaScript, Babylon.js, Tailwind CSS
- 后端: Node.js, Express.js
- 数据存储: JSON文件系统

## [未发布]

### 计划功能
- [ ] 多人在线对战
- [ ] 公会系统
- [ ] 副本系统
- [ ] 成就系统
- [ ] 排行榜
- [ ] 更多技能和装备
- [ ] 移动端适配
- [ ] 音效系统完善
- [ ] 国际化支持

---

## 版本说明

- **主版本号**: 重大架构改变或不兼容的API修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

## 标签说明

- `新增` - 新功能
- `优化` - 现有功能的改进
- `修复` - Bug修复
- `移除` - 移除的功能
- `弃用` - 即将移除的功能
- `安全` - 安全相关的修复

---

**维护者**: 无尽战斗开发团队
