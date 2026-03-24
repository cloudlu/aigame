/**
 * AudioManager - 事件驱动的音频管理系统
 *
 * 功能：
 * - 监听战斗事件，自动播放对应音效
 * - 解耦音频播放逻辑和游戏逻辑
 * - 支持音效配置和扩展
 */

// AudioManager 核心类
class AudioManager {
    constructor(game) {
        this.game = game;
        this.eventManager = null;
        this.listeners = [];

        // 音效配置映射
        this.soundConfig = {
            // 战斗事件 → 音效ID映射
            'battle:attack': {
                soundId: 'attack-sound',
                volume: 1,
                timeout: 200
            },
            'battle:victory': {
                soundId: 'victory-sound',
                volume: 1,
                timeout: 1000
            },
            'battle:defeat': {
                soundId: 'defeat-sound',
                volume: 1,
                timeout: 1000
            }
        };

        // 技能类型 → 音效ID映射
        this.skillSoundMap = {
            'defense': 'skill-defense-sound',
            'heal': 'skill-heal-sound',
            'special': 'skill-special-sound',
            '1': 'skill-1-sound',
            '2': 'skill-2-sound',
            '3': 'skill-3-sound',
            '0': 'skill-0-sound'
        };
    }

    /**
     * 初始化 - 注册所有事件监听器
     */
    init(eventManager) {
        if (!eventManager) {
            console.warn('AudioManager: eventManager未提供');
            return;
        }

        this.eventManager = eventManager;

        // 注册战斗音效监听器
        this.registerBattleSounds();

        console.log('AudioManager 初始化完成');
    }

    /**
     * 注册战斗音效监听器
     */
    registerBattleSounds() {
        // 攻击音效
        this.addListener('battle:attack', (event) => {
            this.playSound('attack-sound', 1, 200);
        });

        // 技能音效
        this.addListener('battle:skill', (event) => {
            const { soundUrl, skillTreeType, skillElement } = event.data;

            // 如果有自定义音效URL，使用playSkillSound
            if (soundUrl) {
                this.playSkillSound(soundUrl);
                return;
            }

            // 根据技能类型和元素选择音效
            if (skillTreeType === 'defense') {
                this.playSound('skill-defense-sound', 0.7, 300);
            } else if (skillTreeType === 'heal') {
                this.playSound('skill-heal-sound', 0.6, 300);
            } else if (skillTreeType === 'special') {
                this.playSound('skill-special-sound', 0.6, 300);
            } else {
                // 攻击系：根据元素类型选择音效
                if (skillElement === 'fire') {
                    this.playSound('skill-1-sound', 0.8, 300);
                } else if (skillElement === 'ice') {
                    this.playSound('skill-2-sound', 0.7, 300);
                } else if (skillElement === 'thunder') {
                    this.playSound('skill-3-sound', 0.7, 300);
                } else {
                    // 默认攻击音效
                    this.playSound('skill-0-sound', 0.7, 300);
                }
            }
        });

        // 胜利音效
        this.addListener('battle:victory', (event) => {
            this.playSound('victory-sound', 1, 1000);
        });

        // 失败音效
        this.addListener('battle:defeat', (event) => {
            this.playSound('defeat-sound', 1, 1000);
        });

        // 伤害音效（可选，根据类型播放不同音效）
        this.addListener('battle:damage', (event) => {
            const { type, amount } = event.data;
            // 可以根据伤害类型播放不同音效
            // 例如：暴击音效、普通伤害音效等
        });

        // 闪避音效
        this.addListener('battle:dodge', (event) => {
            // 可以添加闪避音效
            // this.playSound('dodge-sound', 0.5, 300);
        });
    }

    /**
     * 添加事件监听器（记录以便清理）
     */
    addListener(eventName, callback) {
        if (!this.eventManager) {
            console.warn(`AudioManager: 无法添加监听器 ${eventName}，eventManager未初始化`);
            return;
        }

        this.eventManager.on(eventName, callback);
        this.listeners.push({ eventName, callback });
    }

    /**
     * 播放声音（委托给AudioSystem）
     */
    playSound(id, volume = 0.25, timeout = null) {
        if (!this.game.audioSystem) {
            console.warn('AudioManager: audioSystem未初始化');
            return;
        }

        this.game.audioSystem.playSound(id, volume, timeout);
    }

    /**
     * 播放技能音效（委托给AudioSystem）
     */
    playSkillSound(soundUrl) {
        if (!this.game.audioSystem) {
            console.warn('AudioManager: audioSystem未初始化');
            return;
        }

        this.game.audioSystem.playSkillSound(soundUrl);
    }

    /**
     * 停止战斗音乐
     */
    stopBattleMusic() {
        if (!this.game.audioSystem) {
            console.warn('AudioManager: audioSystem未初始化');
            return;
        }

        this.game.audioSystem.stopBattleMusic();
    }

    /**
     * 添加自定义音效映射
     */
    addSoundMapping(eventName, soundConfig) {
        this.soundConfig[eventName] = soundConfig;

        // 注册监听器
        this.addListener(eventName, (event) => {
            const config = this.soundConfig[eventName];
            if (config) {
                this.playSound(config.soundId, config.volume, config.timeout);
            }
        });
    }

    /**
     * 清理所有监听器
     */
    destroy() {
        if (!this.eventManager) {
            return;
        }

        // 移除所有注册的监听器
        this.listeners.forEach(({ eventName, callback }) => {
            this.eventManager.off(eventName, callback);
        });

        this.listeners = [];
        console.log('AudioManager 已清理');
    }
}

// ✅ 多环境适配导出
// ES6导出（用于测试环境和现代打包工具）
export { AudioManager };

// 同时挂载到全局对象（用于浏览器环境的传统脚本）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
} else if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}