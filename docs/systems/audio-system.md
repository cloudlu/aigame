# 音效系统

**版本**: v2.1
**最后更新**: 2026-03-21

---

## 概述

无尽修仙游戏采用 **Web Audio API 程序合成** 音效系统，无需外部音频文件，所有音效实时生成。

---

## 音效清单（20个）

### 战斗音效（3个）

| ID | 文件名 | 时长 | 描述 | 生成方法 |
|----|--------|------|------|----------|
| `attack-sound` | attack_sword.wav | 0.2s | 挥剑攻击 | 扫频正弦波（200-1000Hz）+ 噪声 |
| `hit-impact-sound` | hit_impact.wav | 0.15s | 命中反馈 | 短促噪声 + 低频冲击（80Hz） |
| `critical-explosion-sound` | critical_explosion.wav | 0.4s | 暴击爆炸 | 宽频噪声 + 低频扫频 + 高频嘶鸣 |

### 技能音效（7个）

| ID | 文件名 | 时长 | 描述 | 生成方法 |
|----|--------|------|------|----------|
| `skill-0-sound` | skill_cast.wav | 0.5s | 技能释放（通用） | 上升扫频（300-1200Hz）+ 二次谐波 |
| `skill-1-sound` | element_burst.wav | 0.8s | 元素爆发（火） | 多层噪声 + 频率调制 |
| `skill-2-sound` | skill_ice.wav | 0.5s | 冰系技能 | 高频清脆 + 噪声 |
| `skill-3-sound` | skill_thunder.wav | 0.5s | 雷系技能 | 随机噼啪 + 嗡鸣 |
| `skill-defense-sound` | skill_defense.wav | 0.6s | 防御技能 | 低频嗡鸣（150Hz）+ 金属共鸣（650Hz） |
| `skill-heal-sound` | skill_heal.wav | 0.8s | 恢复技能 | C大调和弦（C-E-G，523-659-784Hz） |
| `skill-special-sound` | skill_special.wav | 0.5s | 特殊技能（风） | 宽频扫频（1000-3000Hz）+ 风声 |

### 战斗反馈音效（3个）

| ID | 文件名 | 时长 | 描述 | 生成方法 |
|----|--------|------|------|----------|
| `dodge-sound` | dodge_whoosh.wav | 0.25s | 闪避成功 | 高频扫频（800-2000Hz）+ 噪声 |
| `shield-break-sound` | shield_break.wav | 0.2s | 护盾破碎 | 高频噪声 + 金属调频（1000-3000Hz） |
| `enemy-death-sound` | enemy_death.wav | 0.8s | 敌人死亡 | 下降音调（300-80Hz）+ 低八度 |

### 战斗结果音效（2个）

| ID | 文件名 | 时长 | 描述 | 生成方法 |
|----|--------|------|------|----------|
| `victory-sound` | victory.wav | 1.5s | 胜利 | 上升音阶（C-E-G-C）+ 和弦 |
| `defeat-sound` | defeat.wav | 1.5s | 战败 | 下降音阶 + 不协和音程 |

### 背景音乐（2个）

| ID | 文件名 | 时长 | 描述 | 特点 |
|----|--------|------|------|------|
| `battle-music` | battle_music.wav | 16s | 战斗音乐（循环） | 6层音轨，32小节，C-Am-F-G和声 |
| `battle-end-sound` | battle_end.wav | 1.0s | 战斗结束 | 凯旋音效（G-C-E-G-C） |

### 系统音效（3个）

| ID | 文件名 | 时长 | 描述 | 生成方法 |
|----|--------|------|------|----------|
| `levelup-sound` | levelup.wav | 1.2s | 角色升级 | 凯旋上升和弦（C-E-G系列） |
| `craft-success-sound` | craft_success.wav | 0.6s | 合成成功 | 清脆叮咚双音（C6-E6） |
| `craft-fail-sound` | craft_fail.wav | 0.4s | 合成失败 | 低沉嗡鸣（150Hz） |

---

## 战斗音乐详解

### 16秒循环结构

**A段（0-8秒）**:
- 主旋律上升（G→E）
- 和弦：C → Am
- 氛围铺垫

**B段（8-16秒）**:
- 主旋律下降（E→G）
- 和弦：F → G
- 回归平稳

**C段（16-24秒）- 高潮**:
- 主旋律高点（G→G高八度）
- 强度提升30%
- 张力最大

**D段（24-32秒）**:
- 主旋律回归（E→F）
- 和弦解决
- 平稳过渡到循环

### 6层音轨

1. **主旋律**: 32小节仙侠风格（G A C D E D C A...）
2. **高八度泛音**: 增加亮度
3. **低音线**: 方波八度跳跃（更有力）
4. **和弦垫底**: C-Am-F-G 经典和声
5. **多层打击乐**: Kick + Snare + Hi-hat
6. **弦乐长音**: 渐入渐出氛围音

---

## 技术实现

### 合成原理

所有音效使用 **Web Audio API** 程序合成：

```
振荡器（Oscillator）
  ├── 正弦波（Sine）
  ├── 方波（Square）
  └── 锯齿波（Sawtooth）
      ↓
噪声发生器
  └── 白噪声（White Noise）
      ↓
包络控制（ADSR）
  ├── Attack（起音）
  ├── Decay（衰减）
  ├── Sustain（持续）
  └── Release（释放）
      ↓
输出（AudioContext.destination）
```

### 代码示例

```javascript
// 挥剑攻击音效
function generateSwordSwing(duration = 0.2) {
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const freq = 200 + 800 * (t / duration);  // 扫频
        const envelope = Math.exp(-t * 20);       // 包络
        const noise = (Math.random() * 2 - 1) * 0.3;
        const oscillator = Math.sin(2 * Math.PI * freq * t);
        data[i] = (oscillator + noise) * envelope * 0.5;
    }
}
```

### WAV转换

```javascript
// Float32Array → WAV（PCM 16-bit）
function float32ArrayToWav(audioData) {
    // 写入 WAV 头
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    // ... 完整实现见 audio-synthesizer.js
}
```

---

## 使用指南

### HTML配置

```html
<!-- 战斗音效 -->
<audio id="attack-sound" preload="auto" volume="1" loop="false">
    <source src="assets/audio/attack_sword.wav" type="audio/wav">
</audio>

<!-- 背景音乐 -->
<audio id="battle-music" preload="auto" volume="0.4" loop="true">
    <source src="assets/audio/battle_music.wav" type="audio/wav">
</audio>
```

### JavaScript调用

```javascript
// 播放音效
this.audioSystem.playSound('attack-sound', 1, 200);

// 播放战斗音乐（循环）
this.audioSystem.playSound('battle-music', 0.4);

// 停止音乐
this.audioSystem.stopBattleMusic();
```

---

## 音量配置

| 音效类型 | 音量 | 说明 |
|---------|------|------|
| 战斗音乐 | 0.4 | 较低，不干扰游戏 |
| 其他音效 | 1.0 | 正常音量 |

---

## 文件信息

- **总文件数**: 20个 WAV 文件
- **总大小**: 2.5 MB
- **音质**: 44.1kHz, 16-bit, 单声道
- **格式**: WAV（PCM）
- **位置**: `assets/audio/`

---

## 参考资料

- **TODO.md** - 音效生成原理（第274-550行）
- **audio-synthesizer.js** - Web Audio API 合成器实现
- **assets/audio/README.md** - 音效文件清单
- **assets/audio/USAGE_GUIDE.md** - 详细使用指南

---

## 更新历史

### v2.1 (2026-03-21)
- ✅ 新增3个技能类型专属音效：防御、恢复、特殊
- ✅ 技能音效智能分类：按技能类型和元素选择
- ✅ 战斗背景音乐音量优化：0.4 → 0.2
- ✅ 总计20个完整音效

### v2.0 (2026-03-21)
- ✅ 战斗音乐升级：8秒 → 16秒，3层 → 6层
- ✅ 所有音效按 TODO.md 建议优化时长
- ✅ 新增7个缺失音效（命中、暴击、闪避、护盾、死亡等）
- ✅ 总计17个完整音效

### v1.0 (2026-03-20)
- 初始音效系统实现

---

**维护者**: 开发团队
**相关系统**: [战斗系统](./balance.md) | [技能系统](./skill-system.md)