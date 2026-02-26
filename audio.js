// 音频处理模块 (audio.js)
// 该文件扩展 EndlessWinterGame 的原型, 在 game.js 定义之后加载

// 声音定时器集合，每个实例拥有自己的定时器表
EndlessWinterGame.prototype.soundTimers = {};

// 播放声音
EndlessWinterGame.prototype.playSound = function(id, volume = 0.25, timeout = null) {
    try {
        const soundElement = document.getElementById(id);
        soundElement.volume = volume;
        soundElement.pause();
        soundElement.currentTime = 0;
        soundElement.play().catch(error => {
            if (error.name !== 'AbortError') {
                console.log('播放声音失败:', error);
            }
        });

        // battle-music 循环播放，其它声音设置 loop=false
        if (id === 'battle-music') {
            soundElement.loop = true;
        } else {
            soundElement.loop = false;
            if (timeout !== null && timeout !== undefined) {
                // 取消之前的定时器
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
};

// 停止战斗音乐
EndlessWinterGame.prototype.stopBattleMusic = function() {
    const battleMusicElement = document.getElementById('battle-music');
    if (battleMusicElement) {
        try {
            battleMusicElement.pause();
            battleMusicElement.currentTime = 0;
        } catch (e) {
            console.log('停止战斗音乐时出错:', e);
        }
    }
};
