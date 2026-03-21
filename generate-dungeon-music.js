// 生成副本背景音乐的脚本
// 使用Web Audio API生成wav格式音频

import fs from 'fs';
import { Writable } from 'stream';

// 模拟浏览器环境的AudioContext
class MockAudioContext {
    constructor() {
        this.sampleRate = 44100;
    }

    createBuffer(channels, length, sampleRate) {
        return {
            numberOfChannels: channels,
            length: length,
            sampleRate: sampleRate,
            duration: length / sampleRate,
            channelData: new Array(channels).fill(null).map(() => new Float32Array(length)),

            getChannelData(channel) {
                return this.channelData[channel];
            }
        };
    }
}

// 将AudioBuffer转换为WAV格式
function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // 写入音频数据
    const channels = [];
    for (let i = 0; i < numChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            let sample = channels[channel][i];
            sample = Math.max(-1, Math.min(1, sample));
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, sample, true);
            offset += 2;
        }
    }

    return Buffer.from(arrayBuffer);
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// ========== 副本音乐生成器 ==========

class DungeonMusicGenerator {
    constructor() {
        this.audioCtx = new MockAudioContext();
    }

    /**
     * 灵石矿脉音乐 - 神秘矿洞音效
     * 特点：低频回声、滴水声、采矿回响
     */
    generateMineMusic() {
        const duration = 30.0; // 30秒循环
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // 矿洞回声基础音（低频）
        const baseFreq = 80;

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            let sample = 0;

            // 1. 低频环境音（持续嗡鸣）
            const drone = Math.sin(2 * Math.PI * baseFreq * t) * 0.15;
            const drone2 = Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * 0.1;
            sample += drone + drone2;

            // 2. 滴水声效果（随机间隔）
            if (Math.random() < 0.001) {
                const dripEnv = Math.exp(-((t % 30) - Math.floor(t)) * 20);
                const drip = Math.sin(2 * Math.PI * 1200 * t) * dripEnv * 0.3;
                sample += drip;
            }

            // 3. 采矿回响（偶尔）
            const pickTime = t % 3;
            if (pickTime < 0.1 && Math.random() < 0.3) {
                const pickEnv = Math.exp(-pickTime * 30);
                const pick = (Math.random() * 2 - 1) * pickEnv * 0.4;
                sample += pick;
            }

            // 4. 神秘感高频泛音（缓慢变化）
            const mystery = Math.sin(2 * Math.PI * (300 + 100 * Math.sin(t * 0.1)) * t) * 0.08;

            // 5. 回声效果（延迟）
            const delayTime = 0.3;
            const delayIndex = Math.floor(delayTime * sampleRate);
            if (i > delayIndex) {
                sample += data[i - delayIndex] * 0.3;
            }

            data[i] = (sample + mystery) * 0.5;
        }

        return buffer;
    }

    /**
     * 灵草园音乐 - 自然森林音效
     * 特点：鸟鸣、风声、树叶沙沙声、溪流声
     */
    generateForestMusic() {
        const duration = 30.0;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            let sample = 0;

            // 1. 基础自然环境音（柔和的和弦）
            const chord = [261, 329, 392]; // C大三和弦（C-E-G）
            for (const freq of chord) {
                const envelope = Math.sin(Math.PI * t / duration) * 0.1;
                sample += Math.sin(2 * Math.PI * freq * t) * envelope;
            }

            // 2. 鸟鸣声（随机高频短音）
            if (Math.random() < 0.002) {
                const birdFreq = 1500 + Math.random() * 1000;
                const birdEnv = Math.exp(-(Math.random() * 5));
                const bird = Math.sin(2 * Math.PI * birdFreq * t) * birdEnv * 0.15;
                sample += bird;
            }

            // 3. 风声（低频噪声 + 缓慢调制）
            const windNoise = (Math.random() * 2 - 1) * 0.08;
            const windMod = Math.sin(2 * Math.PI * 0.2 * t);
            sample += windNoise * windMod;

            // 4. 树叶沙沙声（高频噪声脉冲）
            if (Math.random() < 0.01) {
                const rustle = (Math.random() * 2 - 1) * 0.1;
                sample += rustle;
            }

            // 5. 溪流声（持续的轻柔噪声）
            const stream = (Math.random() * 2 - 1) * 0.05;
            sample += stream;

            data[i] = sample * 0.6;
        }

        return buffer;
    }

    /**
     * 玄铁矿音乐 - 熔岩地狱音效
     * 特点：火焰燃烧、岩浆流动、蒸汽喷发、低频震动
     */
    generateLavaMusic() {
        const duration = 30.0;
        const sampleRate = this.audioCtx.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioCtx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            let sample = 0;

            // 1. 低频震动（岩浆涌动）
            const rumble = Math.sin(2 * Math.PI * 40 * t) * 0.2;
            const rumble2 = Math.sin(2 * Math.PI * 60 * t) * 0.15;
            sample += rumble + rumble2;

            // 2. 火焰燃烧声（持续噪声）
            const fireNoise = (Math.random() * 2 - 1) * 0.15;
            const fireMod = Math.sin(2 * Math.PI * 3 * t); // 缓慢波动
            sample += fireNoise * (0.5 + fireMod * 0.5);

            // 3. 岩浆流动（低频扫频）
            const lavaFreq = 100 + 50 * Math.sin(t * 0.5);
            const lava = Math.sin(2 * Math.PI * lavaFreq * t) * 0.1;
            sample += lava;

            // 4. 蒸汽喷发（随机高频爆发）
            if (Math.random() < 0.003) {
                const steamEnv = Math.exp(-((t % 30) - Math.floor(t)) * 15);
                const steam = (Math.random() * 2 - 1) * steamEnv * 0.5;
                const steamHigh = Math.sin(2 * Math.PI * 2000 * t) * steamEnv * 0.2;
                sample += steam + steamHigh;
            }

            // 5. 热浪感（中频噪声）
            const heatNoise = (Math.random() * 2 - 1) * 0.05;
            const heatTone = Math.sin(2 * Math.PI * 400 * t) * 0.05;
            sample += heatNoise + heatTone;

            data[i] = sample * 0.5;
        }

        return buffer;
    }
}

// 生成并保存音频文件
async function generateDungeonMusic() {
    const generator = new DungeonMusicGenerator();

    console.log('🎵 开始生成副本背景音乐...\n');

    // 1. 灵石矿脉
    console.log('⛏️  生成灵石矿脉音乐...');
    const mineBuffer = generator.generateMineMusic();
    const mineWav = audioBufferToWav(mineBuffer);
    fs.writeFileSync('assets/audio/dungeon_mine.wav', mineWav);
    console.log('  ✓ 保存至 assets/audio/dungeon_mine.wav\n');

    // 2. 灵草园
    console.log('🌿 生成灵草园音乐...');
    const forestBuffer = generator.generateForestMusic();
    const forestWav = audioBufferToWav(forestBuffer);
    fs.writeFileSync('assets/audio/dungeon_forest.wav', forestWav);
    console.log('  ✓ 保存至 assets/audio/dungeon_forest.wav\n');

    // 3. 玄铁矿
    console.log('🔥 生成玄铁矿音乐...');
    const lavaBuffer = generator.generateLavaMusic();
    const lavaWav = audioBufferToWav(lavaBuffer);
    fs.writeFileSync('assets/audio/dungeon_lava.wav', lavaWav);
    console.log('  ✓ 保存至 assets/audio/dungeon_lava.wav\n');

    console.log('✅ 所有副本音乐已生成！');
}

// 运行生成器
generateDungeonMusic().catch(console.error);
