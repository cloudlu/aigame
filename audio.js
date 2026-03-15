// audio.js - 音频处理模块

class AudioSystem {
    constructor(game) {
        this.game = game;
        this.soundTimers = {};
    }

    /**
     * 播放声音
     */
    playSound(id, volume = 0.25, timeout = null) {
        try {
            const soundElement = document.getElementById(id);
            if (!soundElement) {
                console.log('未找到声音元素:', id);
                return;
            }
            soundElement.volume = volume;
            soundElement.pause();
            soundElement.currentTime = 0;
            soundElement.play().catch(error => {
                if (error.name !== 'AbortError') {
                    console.log('播放声音失败:', error);
                }
            });

            if (id === 'battle-music') {
                soundElement.loop = true;
            } else {
                soundElement.loop = false;
                if (timeout !== null && timeout !== undefined) {
                    if (this.soundTimers[id]) {
                        clearTimeout(this.soundTimers[id]);
                    }
                    this.soundTimers[id] = setTimeout(() => {
                        try {
                            soundElement.pause();
                            soundElement.currentTime = 0;
                        } catch (e) {}
                        delete this.soundTimers[id];
                    }, timeout);
                }
            }
        } catch (error) {
            console.log('播放声音失败:', error);
        }
    }

    /**
     * 停止战斗音乐
     */
    stopBattleMusic() {
        const battleMusicElement = document.getElementById('battle-music');
        if (battleMusicElement) {
            try {
                battleMusicElement.pause();
                battleMusicElement.currentTime = 0;
            } catch (e) {
                console.log('停止战斗音乐时出错:', e);
            }
        }
    }

    /**
     * 播放技能特定音效
     */
    playSkillSound(soundUrl) {
        try {
            const audioId = `skill-sound-${soundUrl.hashCode ? soundUrl.hashCode() : soundUrl.replace(/[^a-zA-Z0-9]/g, '')}`;

            let audioElement = document.getElementById(audioId);

            if (!audioElement) {
                audioElement = document.createElement('audio');
                audioElement.id = audioId;
                audioElement.preload = 'auto';
                audioElement.volume = 1;
                audioElement.loop = false;

                const source = document.createElement('source');
                source.src = soundUrl;
                source.type = 'audio/mpeg';
                audioElement.appendChild(source);

                document.body.appendChild(audioElement);
            }

            audioElement.pause();
            audioElement.currentTime = 0;
            audioElement.play().catch(error => {
                if (error.name !== 'AbortError') {
                    console.log('播放技能音效失败:', error);
                }
            });
        } catch (error) {
            console.log('播放技能音效失败:', error);
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioSystem;
} else {
    window.AudioSystem = AudioSystem;
}
