# 🎵 游戏音效完整清单

**生成日期**: 2026-03-21
**实现方案**: Web Audio API 程序合成（无需外部文件）

---

## 📊 音效分类总览

### ⚔️ 战斗音效（10个）
- 普通攻击音效
- 命中反馈音效
- 暴击爆炸音效
- 技能释放音效
- 元素爆发音效
- 闪避音效
- 护盾破碎音效
- 敌人死亡音效
- 胜利音效
- 战败音效

### 🎶 背景音乐（1个）
- 战斗背景音乐（循环）

### 🔔 系统音效（4个）
- 升级音效
- 战斗结束音效
- 合成成功音效
- 合成失败音效

### 🎯 技能音效（4个）
- 技能0音效（通用）
- 技能1音效（通用）
- 技能2音效（通用）
- 技能3音效（通用）

---

## 📋 详细音效列表

| 编号 | 音效名称 | 元素ID | 合成函数 | 时长 | 音量 | 使用场景 |
|-----|---------|--------|---------|------|------|---------|
| 1 | 挥剑攻击 | `attack-sound` | `generateSwordSwingBuffer()` | 0.3s | 0.6 | 普通攻击时 |
| 2 | 命中反馈 | `hit-impact-sound` | `generateHitBuffer()` | 0.2s | 0.7 | 攻击命中时 |
| 3 | 暴击爆炸 | `critical-explosion-sound` | `generateCriticalBuffer()` | 0.6s | 0.9 | 暴击时 |
| 4 | 技能释放 | `skill-0-sound` | `generateSkillBuffer()` | 0.5s | 0.7 | 技能施放时 |
| 5 | 元素爆发 | `skill-1-sound` | `generateElementBurstBuffer()` | 0.8s | 0.8 | 高级技能时 |
| 6 | 闪避音效 | `dodge-sound` | `generateDodgeBuffer()` | 0.3s | 0.5 | 闪避成功时 |
| 7 | 护盾破碎 | `shield-break-sound` | `generateShieldBreakBuffer()` | 0.5s | 0.8 | 护盾被击破时 |
| 8 | 敌人死亡 | `enemy-death-sound` | `generateEnemyDeathBuffer()` | 0.8s | 0.7 | 敌人死亡时 |
| 9 | 胜利音效 | `victory-sound` | `generateVictoryBuffer()` | 1.5s | 1.0 | 战斗胜利时 |
| 10 | 战败音效 | `defeat-sound` | `generateDefeatBuffer()` | 1.5s | 1.0 | 战斗失败时 |
| 11 | 战斗音乐 | `battle-music` | `generateBattleMusicBuffer()` | 8.0s | 0.4 | 战斗场景（循环） |
| 12 | 战斗结束 | `battle-end-sound` | `generateBattleEndBuffer()` | 1.0s | 0.8 | 战斗结算时 |
| 13 | 升级音效 | `levelup-sound` | `generateLevelUpBuffer()` | 1.2s | 1.0 | 角色升级时 |
| 14 | 合成成功 | `craft-success-sound` | `generateCraftSuccessBuffer()` | 0.6s | 0.8 | 装备合成成功 |
| 15 | 合成失败 | `craft-fail-sound` | `generateCraftFailBuffer()` | 0.4s | 0.6 | 装备合成失败 |
| 16 | 技能音效2 | `skill-2-sound` | `generateSkillBuffer2()` | 0.5s | 0.7 | 备用技能音效 |
| 17 | 技能音效3 | `skill-3-sound` | `generateSkillBuffer3()` | 0.5s | 0.7 | 备用技能音效 |

---

## 🎨 合成原理

### 基础组件
- **振荡器（Oscillator）**: 正弦波、方波、锯齿波
- **噪声发生器**: 白噪声、粉红噪声
- **增益包络（ADSR）**: Attack-Decay-Sustain-Release
- **滤波器**: 低通、高通、带通

### 合成策略

| 音效类型 | 合成方法 |
|---------|---------|
| 挥剑 | 正弦波扫频（200Hz→1000Hz）+ 白噪声 |
| 命中 | 短促噪声脉冲 + 低频冲击（80Hz） |
| 暴击 | 宽频噪声 + 低频扫频 + 高频嘶鸣 |
| 技能 | 正弦波上升扫频（300Hz→1200Hz）+ 谐波 |
| 元素爆发 | 多层噪声 + 快速频率调制 |
| 闪避 | 高频扫频（800Hz→2000Hz）+ 噪声 |
| 护盾破碎 | 高频噪声 + 金属质感调频（1000-3000Hz） |
| 死亡 | 下降正弦波（300Hz→80Hz）+ 低八度 |
| 胜利 | 上升音阶（C-E-G-C）+ 和弦 |
| 战败 | 下降音阶 + 不协和音程 |
| 音乐 | 简单旋律循环 + 打击节拍 |

---

## 🔧 实现方案

### 文件结构
```
assets/audio/
├── README.md                        ← 本文档
└── (无需实体音频文件)

audio-synthesizer.js                 ← 音效合成系统
├── AudioSynthesizer 类
├── 17个音效生成函数
├── 预加载系统
└── 播放控制接口
```

### 集成步骤
1. 创建 `audio-synthesizer.js`
2. 实现 AudioSynthesizer 类
3. 为每个音效编写生成函数
4. 在 `index.html` 中引入脚本
5. 在 `game.js` 中初始化合成器
6. 替换原有 `<audio>` 元素调用

---

## 📈 优势对比

| 特性 | 外部文件方案 | Web Audio API 合成 |
|-----|-------------|-------------------|
| 文件大小 | 5-10 MB | 0 KB（代码生成） |
| 加载时间 | 需预加载 | 即时生成 |
| 音质 | 真实录音 | 8-bit 风格 |
| 可定制性 | 低 | 高（可调参数） |
| 兼容性 | 依赖格式 | 原生支持 |

---

## 🎮 使用示例

### 初始化
```javascript
const synthesizer = new AudioSynthesizer();
await synthesizer.init();
```

### 播放音效
```javascript
// 普通攻击
synthesizer.play('attack');

// 暴击
synthesizer.play('critical', { volume: 0.9 });

// 战斗音乐（循环）
synthesizer.play('battle-music', { loop: true });
```

### 停止音乐
```javascript
synthesizer.stop('battle-music');
```

---

## 📝 注意事项

1. **首次交互后初始化**: 浏览器要求在用户点击后才能播放音频
2. **音量标准化**: 所有音效音量已统一校准
3. **性能优化**: 音效预生成并缓存到 AudioBuffer
4. **移动端兼容**: iOS/Android 均支持 Web Audio API
5. **降级方案**: 如不支持，可静默失败（不影响游戏）

---

## 🚀 下一步

1. ✅ 音效清单已确认
2. ⏳ 实现 AudioSynthesizer 类
3. ⏳ 编写17个音效生成函数
4. ⏳ 集成到游戏系统
5. ⏳ 测试并调整音效参数

---

**文档版本**: v1.0
**最后更新**: 2026-03-21