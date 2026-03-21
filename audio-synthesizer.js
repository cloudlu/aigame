// audio-synthesizer.js - Web Audio API 音效合成系统

class AudioSynthesizer {
    constructor() {
        this.audioCtx = null;
        this.soundBuffers = {};
        this.activeSources = {};
        this.initialized = false;

        // 音效配置
        this.soundConfig = {
            'attack': { volume: 0.6, generator: () => this.generateSwordSwingBuffer() },
            'hit-impact': { volume: 0.7, generator: () => this.generateHitBuffer() },
            'critical': { volume: 0.9, generator: () => this.generateCriticalBuffer() },
            'skill-0': { volume: 0.7, generator: () => this.generateSkillBuffer() },
            'skill-1': { volume: 0.8, generator: () => this.generateElementBurstBuffer() },
            'skill-2': { volume: 0.7, generator: () => this.generateSkillBuffer2() },
            'skill-3': { volume: 0.7, generator: () => this.generateSkillBuffer3() },
            'skill-defense': { volume: 0.7, generator: () => this.generateDefenseSkillBuffer() },
            'skill-heal': { volume: 0.6, generator: () => this.generateHealSkillBuffer() },
            'skill-special': { volume: 0.6, generator: () => this.generateSpecialSkillBuffer() },
            'dodge': { volume: 0.5, generator: () => this.generateDodgeBuffer() },
            'shield-break': { volume: 0.8, generator: () => this.generateShieldBreakBuffer() },
            'enemy-death': { volume: 0.7, generator: () => this.generateEnemyDeathBuffer() },
            'victory': { volume: 1.0, generator: () => this.generateVictoryBuffer() },
            'defeat': { volume: 1.0, generator: () => this.generateDefeatBuffer() },
            'battle-music': { volume: 0.4, generator: () => this.generateBattleMusicBuffer() },
            'battle-end': { volume: 0.8, generator: () => this.generateBattleEndBuffer() },
            'levelup': { volume: 1.0, generator: () => this.generateLevelUpBuffer() },
            'craft-success': { volume: 0.8, generator: () => this.generateCraftSuccessBuffer() },
            'craft-fail': { volume: 0.6, generator: () => this.generateCraftFailBuffer() }
        };

        // ID映射（兼容现有代码）
        this.idMapping = {
            'attack-sound': 'attack',
            'hit-impact-sound': 'hit-impact',
            'critical-explosion-sound': 'critical',
            'skill-0-sound': 'skill-0',
            'skill-1-sound': 'skill-1',
            'skill-2-sound': 'skill-2',
            'skill-3-sound': 'skill-3',
            'skill-defense-sound': 'skill-defense',
            'skill-heal-sound': 'skill-heal',
            'skill-special-sound': 'skill-special',
            'dodge-sound': 'dodge',
            'shield-break-sound': 'shield-break',
            'enemy-death-sound': 'enemy-death',
            'victory-sound': 'victory',
            'defeat-sound': 'defeat',
            'battle-music': 'battle-music',
            'battle-end-sound': 'battle-end',
            'levelup-sound': 'levelup',
            'craft-success-sound': 'craft-success',
            'craft-fail-sound': 'craft-fail'
        };
    }

    /**
     * 初始化音频上下文（必须在用户交互后调用）
     */
    async init() {
        if (this.initialized) return;

        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

            // 恢复音频上下文（某些浏览器需要）
            if (this.audioCtx.state === 'suspended') {
                await this.audioCtx.resume();
            }

            // 预生成所有音效
            this.preGenerateSounds();

            this.initialized = true;
            console.log('🎵 音效合成系统已初始化');
        } catch (error) {
            console.error('音效系统初始化失败:', error);
        }
    }

    /**
     * 预生成所有音效缓冲区
     */
    preGenerateSounds() {
        console.log('🎚️ 正在生成音效...');
        for (const [key, config] of Object.entries(this.soundConfig)) {
            try {
                this.soundBuffers[key] = config.generator();
                console.log(`  ✓ ${key}`);
            } catch (error) {
                console.error(`  ✗ ${key}:`, error);
            }
        }
        console.log('✅ 所有音效已生成');
    }

    /**
     * 播放音效
     * @param {string} soundId - 音效ID
     * @param {object} options - 选项 { volume, loop }
     */
    play(soundId, options = {}) {
        if (!this.initialized) {
            console.warn('音效系统未初始化，请先调用 init()');
            return;
        }

        // 映射ID
        const mappedId = this.idMapping[soundId] || soundId;
        const buffer = this.soundBuffers[mappedId];

        if (!buffer) {
            console.warn(`未找到音效: ${soundId} (mapped: ${mappedId})`);
            return;
        }

        // 合并配置
        const config = this.soundConfig[mappedId] || {};
        const volume = options.volume !== undefined ? options.volume : config.volume;
        const loop = options.loop || false;

        try {
            // 创建音频源
            const source = this.audioCtx.createBufferSource();
            source.buffer = buffer;
            source.loop = loop;

            // 创建增益节点（音量控制）
            const gainNode = this.audioCtx.createGain();
            gainNode.gain.value = volume;

            // 连接节点
            source.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            // 播放
            source.start(0);

            // 保存活动源（用于停止）
            if (!this.activeSources[mappedId]) {
                this.activeSources[mappedId] = [];
            }
            this.activeSources[mappedId].push(source);

            // 播放结束后清理
            source.onended = () => {
                const index = this.activeSources[mappedId]?.indexOf(source);
                if (index > -1) {
                    this.activeSources[mappedId].splice(index, 1);
                }
            };
        } catch (error) {
            console.error('播放音效失败:', error);
        }
    }

    /**
     * 停止指定音效
     * @param {string} soundId - 音效ID
     */
    stop(soundId) {
        const mappedId = this.idMapping[soundId] || soundId;
        const sources = this.activeSources[mappedId];

        if (sources && sources.length > 0) {
            sources.forEach(source => {
                try {
                    source.stop();
                } catch (e) {
                    // 忽略已停止的源
                }
            });
            this.activeSources[mappedId] = [];
        }
    }

    // ========== 音效生成函数 ==========

    /**
     * 挥剑攻击音效（正弦波扫频 + 噪声）
     * 参考 TODO.md 2.1 实现
     */
    generateSwordSwingBuffer() {
        const duration = 0.2; // TODO建议0.2秒
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            // 频率从 200Hz 扫到 1000Hz（TODO建议）
            const freq = 200 + 800 * (t / duration);
            const envelope = Math.exp(-t * 20); // 快速衰减包络
            const noise = (Math.random() * 2 - 1) * 0.3;
            const oscillator = Math.sin(2 * Math.PI * freq * t);
            data[i] = (oscillator + noise) * envelope * 0.5;
        }
        return buffer;
    }

    /**
     * 命中音效（短促噪声 + 低频冲击）
     * 参考 TODO.md 2.2 实现
     */
    generateHitBuffer() {
        const duration = 0.15; // TODO建议0.15秒
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 30); // 极快衰减
            // 低频噪声为主
            const noise = (Math.random() * 2 - 1) * 0.8;
            // 增加一点低频振荡模拟"砰"
            const thump = Math.sin(2 * Math.PI * 80 * t) * 0.4;
            data[i] = (noise + thump) * envelope;
        }
        return buffer;
    }

    /**
     * 暴击爆炸音效（宽频噪声 + 低频扫频 + 高频嘶鸣）
     * 参考 TODO.md 2.3 实现
     */
    generateCriticalBuffer() {
        const duration = 0.4; // TODO建议0.4秒
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 15);
            // 主要噪声
            let noise = (Math.random() * 2 - 1) * 0.9;
            // 低频扫频
            const bass = Math.sin(2 * Math.PI * (60 + 100 * t) * t) * 0.5;
            // 高频嘶嘶
            const high = Math.sin(2 * Math.PI * 2000 * t) * 0.3;
            data[i] = (noise + bass + high) * envelope;
        }
        return buffer;
    }

    /**
     * 技能释放音效（正弦波上升扫频 + 谐波）
     * 参考 TODO.md 2.4 实现
     */
    generateSkillBuffer() {
        const duration = 0.5;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            // 频率从 300Hz 扫到 1200Hz（TODO建议）
            const freq = 300 + 900 * (t / duration);
            const envelope = Math.sin(Math.PI * t / duration); // 升-降形状
            const tone = Math.sin(2 * Math.PI * freq * t);
            // 加入二次谐波
            const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * 0.3;
            data[i] = (tone + harmonic) * envelope * 0.6;
        }
        return buffer;
    }

    /**
     * 元素爆发音效（多层噪声 + 快速频率调制）
     */
    generateElementBurstBuffer() {
        const duration = 0.8;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 8);

            // 多层噪声
            let sample = 0;
            sample += (Math.random() * 2 - 1) * 0.5;

            // 快速频率调制
            const mod = Math.sin(2 * Math.PI * 8 * t);
            const carrier = Math.sin(2 * Math.PI * 400 * (1 + mod * 0.5) * t);
            sample += carrier * 0.5;

            // 高频嘶嘶
            sample += Math.sin(2 * Math.PI * 1500 * t) * 0.2;

            data[i] = sample * envelope;
        }
        return buffer;
    }

    /**
     * 闪避音效（高频扫频 + 噪声）
     * 参考 TODO.md 2.5 实现
     */
    generateDodgeBuffer() {
        const duration = 0.25; // TODO建议0.25秒
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            // 频率从 800Hz 扫到 2000Hz（TODO建议）
            const freq = 800 + 1200 * (t / duration);
            const envelope = Math.sin(Math.PI * t / duration); // 逐渐增大后减小
            const osc = Math.sin(2 * Math.PI * freq * t);
            const noise = (Math.random() * 2 - 1) * 0.5;
            data[i] = (osc + noise) * envelope * 0.5;
        }
        return buffer;
    }

    /**
     * 护盾破碎音效（高频噪声 + 金属质感）
     * 参考 TODO.md 2.6 实现
     */
    generateShieldBreakBuffer() {
        const duration = 0.2; // TODO建议0.2秒
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 25);
            // 高频噪声为主
            let noise = (Math.random() * 2 - 1) * 0.8;
            // 添加一些金属吱吱声：快速调频（TODO建议）
            const metallic = Math.sin(2 * Math.PI * (1000 + 2000 * t) * t) * 0.5;
            data[i] = (noise + metallic) * envelope;
        }
        return buffer;
    }

    /**
     * 敌人死亡音效（下降正弦波 + 低八度）
     * 参考 TODO.md 2.7 实现
     */
    generateEnemyDeathBuffer() {
        const duration = 0.8; // TODO建议0.8秒
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            // 频率从 300Hz 下降到 80Hz（TODO建议）
            const freq = 300 * Math.exp(-t * 3);
            const envelope = Math.exp(-t * 4);
            const tone = Math.sin(2 * Math.PI * freq * t);
            // 加入低八度
            const bass = Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.4;
            data[i] = (tone + bass) * envelope * 0.7;
        }
        return buffer;
    }

    /**
     * 胜利音效（上升音阶 C-E-G-C）
     */
    generateVictoryBuffer() {
        const duration = 1.5;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // C大调音阶：C-E-G-C (523, 659, 784, 1047 Hz)
        const notes = [523, 659, 784, 1047];
        const noteLength = duration / notes.length;

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const noteIndex = Math.floor(t / noteLength);
            const freq = notes[Math.min(noteIndex, notes.length - 1)];
            const noteT = t - noteIndex * noteLength;

            const envelope = Math.exp(-noteT * 3) * (1 - t / duration);
            const tone = Math.sin(2 * Math.PI * freq * t);
            const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * 0.2;
            data[i] = (tone + harmonic) * envelope * 0.6;
        }
        return buffer;
    }

    /**
     * 战败音效（下降音阶 + 不协和音程）
     */
    generateDefeatBuffer() {
        const duration = 1.5;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // 下降音阶：C-A-F-D (261, 220, 174, 146 Hz)
        const notes = [261, 220, 174, 146];
        const noteLength = duration / notes.length;

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const noteIndex = Math.floor(t / noteLength);
            const freq = notes[Math.min(noteIndex, notes.length - 1)];
            const noteT = t - noteIndex * noteLength;

            const envelope = Math.exp(-noteT * 4) * (1 - t / duration);
            const tone = Math.sin(2 * Math.PI * freq * t);
            const dissonance = Math.sin(2 * Math.PI * freq * 1.06 * t) * 0.3;
            data[i] = (tone + dissonance) * envelope * 0.6;
        }
        return buffer;
    }

    /**
     * 战斗背景音乐（多层旋律 + 和弦 + 节拍）
     * 参考 TODO.md 战斗背景音乐设计
     */
    generateBattleMusicBuffer() {
        const duration = 16.0; // 延长到16秒，更丰富的循环
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // 主旋律（仙侠风格）
        const melody1 = [
            392, 440, 523, 587, 659, 587, 523, 440,  // G A C D E D C A (上升)
            392, 349, 330, 294, 261, 294, 330, 349,  // G F E D C D E F (下降)
            392, 523, 659, 784, 659, 523, 392, 349,  // G C E G E C G F (高潮)
            330, 294, 261, 247, 261, 294, 330, 349   // E D C B C D E F (回归)
        ];

        // 低音线（八度跳跃）
        const bassline = [
            130, 130, 196, 196, 130, 130, 98, 98,   // C C G G C C C2 C2
            130, 130, 196, 196, 130, 130, 98, 98,
            130, 130, 196, 196, 174, 174, 130, 130,
            110, 110, 98, 98, 130, 130, 130, 130
        ];

        // 和弦进行（C - Am - F - G）
        const chords = [
            [261, 329, 392], // C大三和弦
            [220, 261, 329], // A小三和弦
            [174, 220, 261], // F大三和弦
            [196, 247, 294]  // G大三和弦
        ];

        const beatLength = duration / melody1.length;

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const beatIndex = Math.floor(t / beatLength);
            const noteIndex = beatIndex % melody1.length;

            // ===== 主旋律（正弦波 + 包络） =====
            const freq1 = melody1[noteIndex];
            const noteT = t - beatIndex * beatLength;
            const envelope1 = Math.exp(-noteT * 1.5) * Math.min(1, t * 0.5); // 渐入
            const tone1 = Math.sin(2 * Math.PI * freq1 * t) * envelope1 * 0.25;

            // ===== 高八度泛音（增加亮度） =====
            const tone2 = Math.sin(2 * Math.PI * freq1 * 2 * t) * envelope1 * 0.1;

            // ===== 低音线（方波，更有力） =====
            const freqBass = bassline[noteIndex];
            const envelopeBass = Math.exp(-noteT * 0.8) * 0.3;
            const squareBass = (Math.sin(2 * Math.PI * freqBass * t) > 0 ? 1 : -1);
            const bass = squareBass * envelopeBass;

            // ===== 和弦垫底（每4拍换一个和弦） =====
            const chordIndex = Math.floor(beatIndex / 8) % chords.length;
            const chord = chords[chordIndex];
            let padSound = 0;
            for (const note of chord) {
                padSound += Math.sin(2 * Math.PI * note * t) * 0.08;
            }

            // ===== 打击乐层 =====
            const drumT = t % 0.5;
            let drumSound = 0;

            // 强拍（每0.5秒）
            if (beatIndex % 2 === 0) {
                drumSound += (Math.random() * 2 - 1) * Math.exp(-drumT * 25) * 0.2; // Kick
            }

            // 弱拍（每0.25秒）
            const snareT = t % 0.25;
            if (beatIndex % 2 === 1 && snareT < 0.1) {
                drumSound += (Math.random() * 2 - 1) * Math.exp(-snareT * 40) * 0.15; // Snare
            }

            // Hi-hat（快速噪声，每0.125秒）
            const hihatT = t % 0.125;
            drumSound += (Math.random() * 2 - 1) * Math.exp(-hihatT * 60) * 0.08;

            // ===== 弦乐长音（增加氛围） =====
            const stringFreq = 196; // G3
            const stringEnv = Math.sin(Math.PI * t / duration) * 0.1; // 渐入渐出
            const stringTone = Math.sin(2 * Math.PI * stringFreq * t) * stringEnv;

            // ===== 动态变化（高潮部分增强） =====
            const intensityMultiplier = t > 8 && t < 12 ? 1.3 : 1.0; // 8-12秒高潮

            // ===== 混合所有层 =====
            data[i] = (tone1 + tone2 + bass + padSound + drumSound + stringTone) * intensityMultiplier * 0.6;
        }

        return buffer;
    }

    /**
     * 战斗结束音效（凯旋音效）
     */
    generateBattleEndBuffer() {
        const duration = 1.0;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // 快速上升音阶
        const notes = [392, 523, 659, 784, 1047]; // G C E G C

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const noteIndex = Math.floor(t / (duration / notes.length));
            const freq = notes[Math.min(noteIndex, notes.length - 1)];

            const envelope = Math.sin(Math.PI * t / duration);
            const tone = Math.sin(2 * Math.PI * freq * t);
            const harmonic = Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.3;
            data[i] = (tone + harmonic) * envelope * 0.7;
        }
        return buffer;
    }

    /**
     * 升级音效（凯旋上升和弦）
     */
    generateLevelUpBuffer() {
        const duration = 1.2;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // C大调三和弦上升
        const chords = [
            [261, 329, 392], // C E G
            [329, 392, 494], // E G B
            [392, 494, 587], // G B D
            [523, 659, 784]  // C E G (高八度)
        ];

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const chordIndex = Math.floor(t / (duration / chords.length));
            const chord = chords[Math.min(chordIndex, chords.length - 1)];

            let sample = 0;
            for (const freq of chord) {
                const envelope = Math.exp(-t * 2);
                sample += Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
            }
            data[i] = sample;
        }
        return buffer;
    }

    /**
     * 合成成功音效（清脆叮咚）
     */
    generateCraftSuccessBuffer() {
        const duration = 0.6;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // 双音叮咚
        const freq1 = 1047; // C6
        const freq2 = 1318; // E6

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 5);
            const tone1 = Math.sin(2 * Math.PI * freq1 * t) * (t < 0.3 ? 1 : 0);
            const tone2 = Math.sin(2 * Math.PI * freq2 * t) * (t >= 0.3 ? 1 : 0);
            data[i] = (tone1 + tone2) * envelope * 0.5;
        }
        return buffer;
    }

    /**
     * 合成失败音效（低沉嗡鸣）
     */
    generateCraftFailBuffer() {
        const duration = 0.4;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 5);
            const freq = 150;
            const tone = Math.sin(2 * Math.PI * freq * t);
            const noise = (Math.random() * 2 - 1) * 0.2;
            data[i] = (tone + noise) * envelope * 0.5;
        }
        return buffer;
    }

    /**
     * 技能音效2（冰系音效）
     */
    generateSkillBuffer2() {
        const duration = 0.5;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.sin(Math.PI * t / duration);
            const freq = 600 + 400 * (t / duration);
            const tone = Math.sin(2 * Math.PI * freq * t);
            const high = Math.sin(2 * Math.PI * 3000 * t) * 0.2;
            const noise = (Math.random() * 2 - 1) * 0.15;
            data[i] = (tone + high + noise) * envelope * 0.6;
        }
        return buffer;
    }

    /**
     * 技能音效3（雷系音效）
     */
    generateSkillBuffer3() {
        const duration = 0.5;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 4);
            const noise = (Math.random() * 2 - 1) * 0.6;
            const crackle = Math.sin(2 * Math.PI * 100 * Math.random() * t);
            const buzz = Math.sin(2 * Math.PI * 800 * t) * 0.4;
            data[i] = (noise + crackle + buzz) * envelope;
        }
        return buffer;
    }

    /**
     * 防御技能音效（低沉护盾声）
     */
    generateDefenseSkillBuffer() {
        const duration = 0.6;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.sin(Math.PI * t / duration);

            // 低频嗡鸣（150Hz基础）
            const bass = Math.sin(2 * Math.PI * 150 * t) * 0.5;

            // 金属共鸣（500-800Hz）
            const metallic = Math.sin(2 * Math.PI * 650 * t) * 0.3;

            // 高频泛音（1200Hz）
            const harmonic = Math.sin(2 * Math.PI * 1200 * t) * 0.15;

            // 轻微噪声
            const noise = (Math.random() * 2 - 1) * 0.1;

            data[i] = (bass + metallic + harmonic + noise) * envelope * 0.6;
        }
        return buffer;
    }

    /**
     * 恢复技能音效（轻柔治疗声）
     */
    generateHealSkillBuffer() {
        const duration = 0.8;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            // 渐入渐出包络
            const envelope = Math.sin(Math.PI * t / duration);

            // 柔和的基础音（C大调和弦：C-E-G，523-659-784Hz）
            const c = Math.sin(2 * Math.PI * 523 * t) * 0.3;
            const e = Math.sin(2 * Math.PI * 659 * t) * 0.25;
            const g = Math.sin(2 * Math.PI * 784 * t) * 0.2;

            // 高频泛音（1047Hz，C高八度）
            const highC = Math.sin(2 * Math.PI * 1047 * t) * 0.15;

            // 非常轻的噪声（营造水滴感）
            const noise = (Math.random() * 2 - 1) * 0.05;

            data[i] = (c + e + g + highC + noise) * envelope * 0.5;
        }
        return buffer;
    }

    /**
     * 特殊技能音效（风属性）
     */
    generateSpecialSkillBuffer() {
        const duration = 0.5;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 3);

            // 宽频风声（高频扫频 1000-3000Hz）
            const freq = 1000 + 2000 * (t / duration);
            const wind = Math.sin(2 * Math.PI * freq * t) * 0.3;

            // 白噪声
            const noise = (Math.random() * 2 - 1) * 0.5;

            // 低频震动（200Hz）
            const rumble = Math.sin(2 * Math.PI * 200 * t) * 0.2;

            data[i] = (wind + noise + rumble) * envelope * 0.6;
        }
        return buffer;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioSynthesizer;
} else {
    window.AudioSynthesizer = AudioSynthesizer;
}
