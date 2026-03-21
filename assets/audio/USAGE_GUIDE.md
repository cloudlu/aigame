# 🎵 音效文件使用指南

## ✅ 音效文件已生成

**生成日期**: 2026-03-21
**总计**: 17个WAV文件
**总大小**: ~1.7 MB
**音质**: 44.1kHz, 16-bit, 单声道

---

## 📂 文件清单

| 文件名 | 大小 | 时长 | 用途 |
|--------|------|------|------|
| `attack_sword.wav` | 26 KB | 0.3s | 普通攻击 |
| `hit_impact.wav` | 17 KB | 0.2s | 命中反馈 |
| `critical_explosion.wav` | 52 KB | 0.6s | 暴击爆炸 |
| `skill_cast.wav` | 43 KB | 0.5s | 技能释放 |
| `element_burst.wav` | 69 KB | 0.8s | 元素爆发 |
| `skill_ice.wav` | 43 KB | 0.5s | 冰系技能 |
| `skill_thunder.wav` | 43 KB | 0.5s | 雷系技能 |
| `dodge_whoosh.wav` | 26 KB | 0.3s | 闪避 |
| `shield_break.wav` | 43 KB | 0.5s | 护盾破碎 |
| `enemy_death.wav` | 69 KB | 0.8s | 敌人死亡 |
| `victory.wav` | 129 KB | 1.5s | 胜利 |
| `defeat.wav` | 129 KB | 1.5s | 战败 |
| `battle_music.wav` | 689 KB | 8.0s | 战斗音乐（循环） |
| `battle_end.wav` | 86 KB | 1.0s | 战斗结束 |
| `levelup.wav` | 103 KB | 1.2s | 升级 |
| `craft_success.wav` | 52 KB | 0.6s | 合成成功 |
| `craft_fail.wav` | 35 KB | 0.4s | 合成失败 |

---

## 🔧 集成到游戏

### 方案1：使用现有AudioSystem（推荐）

**步骤1**: 移除 `<audio>` 元素的 `src` 属性（如果存在）

在 [index.html](../index.html) 中：
```html
<audio id="attack-sound" preload="auto">
    <source src="assets/audio/attack_sword.wav" type="audio/wav">
</audio>
```

**步骤2**: 为所有音效添加 `<source>` 标签

```html
<!-- 战斗音效 -->
<audio id="attack-sound" preload="auto">
    <source src="assets/audio/attack_sword.wav" type="audio/wav">
</audio>
<audio id="hit-impact-sound" preload="auto">
    <source src="assets/audio/hit_impact.wav" type="audio/wav">
</audio>
<audio id="critical-explosion-sound" preload="auto">
    <source src="assets/audio/critical_explosion.wav" type="audio/wav">
</audio>
<!-- ... 其他音效 ... -->
```

**完整HTML配置**:

```html
<!-- ========== 音效元素 ========== -->
<audio id="attack-sound" preload="auto"><source src="assets/audio/attack_sword.wav" type="audio/wav"></audio>
<audio id="hit-impact-sound" preload="auto"><source src="assets/audio/hit_impact.wav" type="audio/wav"></audio>
<audio id="critical-explosion-sound" preload="auto"><source src="assets/audio/critical_explosion.wav" type="audio/wav"></audio>
<audio id="skill-0-sound" preload="auto"><source src="assets/audio/skill_cast.wav" type="audio/wav"></audio>
<audio id="skill-1-sound" preload="auto"><source src="assets/audio/element_burst.wav" type="audio/wav"></audio>
<audio id="skill-2-sound" preload="auto"><source src="assets/audio/skill_ice.wav" type="audio/wav"></audio>
<audio id="skill-3-sound" preload="auto"><source src="assets/audio/skill_thunder.wav" type="audio/wav"></audio>
<audio id="dodge-sound" preload="auto"><source src="assets/audio/dodge_whoosh.wav" type="audio/wav"></audio>
<audio id="shield-break-sound" preload="auto"><source src="assets/audio/shield_break.wav" type="audio/wav"></audio>
<audio id="enemy-death-sound" preload="auto"><source src="assets/audio/enemy_death.wav" type="audio/wav"></audio>
<audio id="victory-sound" preload="auto"><source src="assets/audio/victory.wav" type="audio/wav"></audio>
<audio id="defeat-sound" preload="auto"><source src="assets/audio/defeat.wav" type="audio/wav"></audio>
<audio id="battle-music" preload="auto" loop="true"><source src="assets/audio/battle_music.wav" type="audio/wav"></audio>
<audio id="battle-end-sound" preload="auto"><source src="assets/audio/battle_end.wav" type="audio/wav"></audio>
<audio id="levelup-sound" preload="auto"><source src="assets/audio/levelup.wav" type="audio/wav"></audio>
<audio id="craft-success-sound" preload="auto"><source src="assets/audio/craft_success.wav" type="audio/wav"></audio>
<audio id="craft-fail-sound" preload="auto"><source src="assets/audio/craft_fail.wav" type="audio/wav"></audio>
```

### 方案2：Web Audio API（实时合成）

保留 [audio-synthesizer.js](../audio-synthesizer.js) 作为备选方案。

**优势**:
- 零文件体积（无需加载）
- 即时生成

**劣势**:
- 8-bit 风格（非真实录音）
- 需要浏览器支持

---

## 🎮 使用示例

### 基础播放

```javascript
// 在任何地方调用
this.audioSystem.playSound('attack-sound', 1, 200);
```

### 音效ID映射

| 代码中的ID | 文件名 | 描述 |
|-----------|--------|------|
| `attack-sound` | attack_sword.wav | 挥剑攻击 |
| `hit-impact-sound` | hit_impact.wav | 命中反馈 |
| `critical-explosion-sound` | critical_explosion.wav | 暴击爆炸 |
| `skill-0-sound` | skill_cast.wav | 技能释放 |
| `skill-1-sound` | element_burst.wav | 元素爆发 |
| `skill-2-sound` | skill_ice.wav | 冰系技能 |
| `skill-3-sound` | skill_thunder.wav | 雷系技能 |
| `dodge-sound` | dodge_whoosh.wav | 闪避 |
| `shield-break-sound` | shield_break.wav | 护盾破碎 |
| `enemy-death-sound` | enemy_death.wav | 敌人死亡 |
| `victory-sound` | victory.wav | 胜利 |
| `defeat-sound` | defeat.wav | 战败 |
| `battle-music` | battle_music.wav | 战斗音乐 |
| `battle-end-sound` | battle_end.wav | 战斗结束 |
| `levelup-sound` | levelup.wav | 升级 |
| `craft-success-sound` | craft_success.wav | 合成成功 |
| `craft-fail-sound` | craft_fail.wav | 合成失败 |

---

## 📝 修改现有代码

### 在 combatlogic.js 中添加音效

**位置1: 普通攻击命中** (约第90行)
```javascript
if (playerCrit) {
    // 暴击
    this.audioSystem.playSound('critical-explosion-sound', 0.9, 600);
    this.cameraShake(0.08, 250);
    this.lightFlash(3.0, 200, new BABYLON.Color3(1.0, 0.9, 0.6));
} else {
    // 普通命中
    this.audioSystem.playSound('hit-impact-sound', 0.7, 200);
}
```

**位置2: 技能释放** (约第300行)
```javascript
// 技能释放前
this.audioSystem.playSound('skill-0-sound', 0.7, 500);

// 或根据技能类型选择
if (skill.element === 'ice') {
    this.audioSystem.playSound('skill-2-sound', 0.7, 500);
} else if (skill.element === 'thunder') {
    this.audioSystem.playSound('skill-3-sound', 0.7, 500);
} else {
    this.audioSystem.playSound('skill-1-sound', 0.8, 800);
}
```

**位置3: 闪避** (约第170行)
```javascript
if (evaded) {
    this.audioSystem.playSound('dodge-sound', 0.5, 300);
    // ... 闪避特效 ...
}
```

**位置4: 护盾破碎** (约第180行)
```javascript
if (shieldBroken) {
    this.audioSystem.playSound('shield-break-sound', 0.8, 500);
    // ... 护盾破碎特效 ...
}
```

**位置5: 敌人死亡** (约第110行)
```javascript
if (this.gameState.enemy.hp <= 0) {
    this.audioSystem.playSound('enemy-death-sound', 0.7, 800);
    this.cameraShake(0.12, 400);
    // ... 死亡特效 ...
}
```

**位置6: 战斗结果** (约第720行)
```javascript
// 胜利
this.audioSystem.playSound('victory-sound', 1.0, 1500);

// 战败
this.audioSystem.playSound('defeat-sound', 1.0, 1500);
```

---

## 🎨 音效风格说明

### 8-bit 复古风格

这些音效采用 **程序合成** 方式生成，风格特点：
- ✅ 怀旧的8-bit游戏音效
- ✅ 简洁明了的音色
- ✅ 与仙侠修仙主题契合
- ⚠️ 非真实录音音效

### 合成原理

| 音效类型 | 合成方法 |
|---------|---------|
| 挥剑 | 正弦波扫频（200Hz→1000Hz）+ 噪声 |
| 命中 | 短促噪声 + 低频冲击 |
| 暴击 | 宽频噪声 + 低频扫频 + 高频 |
| 技能 | 上升扫频 + 谐波 |
| 胜利/战败 | 音阶组合 |

---

## 🔄 重新生成音效

如果需要修改音效参数（如音色、时长）：

1. 编辑 [generate-audio-files.js](../generate-audio-files.js)
2. 修改对应函数的参数
3. 运行：
   ```bash
   node generate-audio-files.js
   ```
4. 所有音效将重新生成

---

## 📊 性能优化

### 预加载建议

```html
<!-- 关键音效预加载 -->
<audio id="attack-sound" preload="auto">...</audio>
<audio id="victory-sound" preload="auto">...</audio>

<!-- 背景音乐预加载 -->
<audio id="battle-music" preload="auto" loop="true">...</audio>

<!-- 次要音效按需加载 -->
<audio id="craft-success-sound" preload="none">...</audio>
```

### 音量标准化

所有音效已按照统一音量标准生成：
- 基础音效：0.5-0.7
- 重要音效（胜利/升级）：0.8-1.0
- 背景音乐：0.4

---

## 📖 相关文档

- [音效清单文档](README.md)
- [音频合成系统](../audio-synthesizer.js)
- [生成工具](../generate-audio-files.js)
- [Phase 4 完成报告](../PHASE4_COMPLETION_REPORT.md)

---

**文件版本**: v1.0
**最后更新**: 2026-03-21
**状态**: ✅ 可直接使用