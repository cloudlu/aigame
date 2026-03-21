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

## 🗺️ 地图系统设计

**地图系统设计已迁移至专属文档** 👉 **[MAP_SYSTEM_DESIGN.md](MAP_SYSTEM_DESIGN.md)**

该文档包含：
- 地图境界需求配置
- 相邻地图移动限制
- 传送点系统
- 首次访问奖励
- 地图连接系统
- 移动成本设计
- UI设计方案
- 未来扩展计划
- 测试用例

---

## ⚔️ 战斗场景优化 TODO

> **📋 完整改造方案**: [BATTLE_EFFECTS_PLAN.md](BATTLE_EFFECTS_PLAN.md)

### Phase 1: 场景特效改造 ✅ 已完成
- [x] 修复页面卡死问题（无限循环）
- [x] 场景名称显示在标题
- [x] 修复场景地面颜色
- [x] 修复云雾粒子灰色方块问题
- [x] 增强粒子效果（6种）
- [x] **🔥 熔岩地狱：熔岩喷泉 + 黑烟 + 岩浆流动**
- [x] **❄️ 冰封雪谷：雪堆 + 雪人装饰（替代冰晶粒子）**
- [x] **🌊 碧波湖畔：水滴 + 水面波纹**
- [x] **✨ 仙山峰顶：桃树装饰（替代飞花粒子）**
- [x] **🌌 虚空秘境：星辰 + 星云漩涡**

### Phase 2: 技能特效集成 ✅ 已完成
- [x] 剑气特效函数 (createSwordQiEffect)
- [x] 元素爆发特效函数 (createSkillBurstEffect)
- [x] **⚔️ 在攻击时调用冲击光环**
- [x] **🔥 在技能释放时调用元素爆发特效**
- [x] **💚 治愈特效 (createHealingEffect)**
- [x] **💥 暴击爆炸特效 (createCriticalHitEffect)**
- [x] **💨 闪避残影特效 (createDodgeEffect)**
- [x] **☠️ 击杀特效 (createKillEffect)**

### Phase 3: 战斗反馈增强 ✅ 已完成
- [x] **💥 暴击时相机震动效果 + 光照闪光**
- [x] **🛡️ 护盾破碎粒子效果**
- [x] **✨ 技能释放前摇能量聚集**
- [x] **🌈 动态光照系统（技能闪光）**
- [ ] **🎯 命中反馈音效集成**（音效系统已存在，需要音效文件）

---

## 📊 完成度总结

### ✅ 100% 完成（Phase 1-3）

**场景特效**：
- 🔥 熔岩地狱：3层粒子系统（喷泉+黑烟+岩浆流动）
- ❄️ 冰封雪谷：5个雪堆 + 2个雪人
- 🌊 碧波湖畔：水滴 + 水面波纹
- ✨ 仙山峰顶：灵气 + 云雾 + 2棵桃树
- 🌌 虚空秘境：星辰 + 星云漩涡

**战斗特效**：
- ⚔️ 攻击特效：冲击光环、暴击爆炸、击杀爆发
- 🔥 技能特效：元素爆发、能量聚集、技能闪光
- 💨 闪避特效：蓝白残影
- 💚 治愈特效：绿色光芒环绕

**战斗反馈**：
- 💥 相机震动：暴击0.08，击杀0.12
- 🌈 光照闪光：暴击金色，技能彩色
- 🛡️ 护盾破碎：蓝色碎片飞溅
- ✨ 技能前摇：能量聚集效果

### ⏳ 待完成（非必需）

- **🎯 命中反馈音效**：需要音效文件（.mp3/.ogg）
  - 普通攻击音效
  - 暴击音效
  - 技能释放音效
  - 命中音效
  - 闪避音效

---

## 🎵 Phase 4: 音效系统（待实现）

### 音效资源获取方案

#### 方案1：免费音效素材网站（推荐）
- **Freesound.org** - 最大免费音效库
- **Mixkit.co** - 完全免费无需注册
- **Zapsplat.com** - 高质量免费音效
- **OpenGameArt.org** - 游戏专用开源素材
- **爱给网 (aigei.com)** - 中文音效平台

#### 方案2：代码合成音效（最快速）
- 使用 Web Audio API 程序生成
- 无需外部文件，加载快
- 8-bit 风格简单音效
- 适合基础音效（打击、挥剑）

#### 方案3：AI生成音效
- **ElevenLabs Sound Effects** - 免费额度
- **AudioCraft by Meta** - 开源免费

### 需要的音效文件

| 音效类型 | 文件名 | 英文搜索关键词 | 时长建议 |
|---------|--------|---------------|---------|
| 普通攻击 | `attack_sword.mp3` | "sword swing" "sword whoosh" | 0.3-0.5s |
| 命中反馈 | `hit_impact.mp3` | "sword hit" "metal impact" | 0.2-0.4s |
| 暴击音效 | `critical_explosion.mp3` | "explosion" "heavy impact" | 0.5-0.8s |
| 技能释放 | `skill_cast.mp3` | "magic spell" "cast spell" | 0.4-0.6s |
| 元素爆发 | `element_burst.mp3` | "magic explosion" "element burst" | 0.6-1.0s |
| 闪避音效 | `dodge_whoosh.mp3` | "whoosh" "dodge" "swift" | 0.3-0.4s |
| 护盾破碎 | `shield_break.mp3` | "glass break" "shield shatter" | 0.5-0.7s |
| 敌人死亡 | `enemy_death.mp3` | "monster death" "enemy defeat" | 0.6-1.0s |
| 胜利音效 | `victory.mp3` | "victory fanfare" "win" | 1.0-2.0s |
| 战败音效 | `defeat.mp3` | "defeat" "game over" | 1.0-2.0s |

### 实现步骤

1. **收集音效文件**
   - [ ] 从免费网站下载10个基础音效
   - [ ] 格式转换：统一转为 .mp3 格式
   - [ ] 音量标准化：确保音量一致
   - [ ] 放置到 `assets/sounds/` 目录

2. **代码合成音效系统**（备选方案）
   - [ ] 实现 `AudioSynthesizer` 类
   - [ ] 创建基础音效生成函数：
     - `generateHitSound()` - 打击音效
     - `generateSwordSwingSound()` - 挥剑音效
     - `generateExplosionSound()` - 爆炸音效
     - `generateMagicSound()` - 魔法音效

3. **集成到战斗系统**
   - [ ] 在 `combatlogic.js` 中添加音效调用
   - [ ] 暴击时：`playSound('critical_explosion')`
   - [ ] 技能释放：`playSound('skill_cast')`
   - [ ] 命中时：`playSound('hit_impact')`
   - [ ] 闪避时：`playSound('dodge_whoosh')`
   - [ ] 击杀时：`playSound('enemy_death')`

4. **音效系统优化**
   - [ ] 添加音量控制UI
   - [ ] 实现音效池（避免重复播放延迟）
   - [ ] 添加音效预加载
   - [ ] 支持静音切换

### 音效配置示例

```javascript
// 在 game-audio.js 中添加
const BATTLE_SOUNDS = {
    attack: { file: 'attack_sword.mp3', volume: 0.6 },
    hit: { file: 'hit_impact.mp3', volume: 0.7 },
    critical: { file: 'critical_explosion.mp3', volume: 0.9 },
    skill: { file: 'skill_cast.mp3', volume: 0.7 },
    dodge: { file: 'dodge_whoosh.mp3', volume: 0.5 },
    shield_break: { file: 'shield_break.mp3', volume: 0.8 },
    enemy_death: { file: 'enemy_death.mp3', volume: 0.7 }
};
```

---

## 📚 其他 TODO 事项

（在此添加其他待办事项）

