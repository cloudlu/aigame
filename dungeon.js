/**
 * 资源副本系统
 *
 * 功能：
 * - 3种副本：灵石矿脉、灵草园、玄铁矿
 * - 3个难度：简单(3敌人)、普通(5敌人)、困难(7敌人)
 * - VIP特权：更多次数 + 扫荡功能
 * - 境界加成：高境界获得更多资源
 * - 连续战斗：复用3D战斗场景
 */

class DungeonSystem {
    constructor(game) {
        this.game = game;

        // 当前副本状态
        this.currentDungeon = null;
        this.currentDifficulty = null;
        this.currentEnemyIndex = 0;
        this.enemyQueue = [];
        this.playerStateBackup = null;

        // 背景音乐
        this.dungeonMusic = {
            spirit_stone_mine: null,
            herb_garden: null,
            iron_mine: null
        };

        this.initDungeonMusic();
    }

    /**
     * 初始化副本背景音乐
     */
    initDungeonMusic() {
        // 灵石矿脉 - 神秘矿洞音效
        this.dungeonMusic.spirit_stone_mine = new Audio('assets/audio/dungeon_mine.wav');
        this.dungeonMusic.spirit_stone_mine.loop = true;
        this.dungeonMusic.spirit_stone_mine.volume = 0.5;

        // 灵草园 - 自然森林音效
        this.dungeonMusic.herb_garden = new Audio('assets/audio/dungeon_forest.wav');
        this.dungeonMusic.herb_garden.loop = true;
        this.dungeonMusic.herb_garden.volume = 0.5;

        // 玄铁矿 - 熔岩地狱音效
        this.dungeonMusic.iron_mine = new Audio('assets/audio/dungeon_lava.wav');
        this.dungeonMusic.iron_mine.loop = true;
        this.dungeonMusic.iron_mine.volume = 0.5;
    }

    /**
     * 播放副本背景音乐
     */
    playDungeonMusic(dungeonId) {
        // 停止所有其他音乐
        this.stopAllDungeonMusic();

        // 播放当前副本音乐
        const music = this.dungeonMusic[dungeonId];
        if (music) {
            music.currentTime = 0;
            music.play().catch(err => console.log('副本音乐播放失败:', err));
        }
    }

    /**
     * 停止所有副本音乐
     */
    stopAllDungeonMusic() {
        Object.values(this.dungeonMusic).forEach(music => {
            if (music) {
                music.pause();
                music.currentTime = 0;
            }
        });
    }

    /**
     * 获取副本配置
     */
    getDungeonConfig(dungeonId) {
        return this.game.metadata.resourceDungeons[dungeonId];
    }

    /**
     * 获取难度配置
     */
    getDifficultyConfig(dungeonId, difficulty) {
        const dungeon = this.getDungeonConfig(dungeonId);
        return dungeon.difficulties[difficulty];
    }

    /**
     * 检查玩家等级要求
     */
    checkLevelRequirement(dungeonId, difficulty) {
        const config = this.getDifficultyConfig(dungeonId, difficulty);
        const playerLevel = this.game.persistentState.player.level;

        if (playerLevel < config.level_req) {
            this.game.showNotification(`需要等级 ${config.level_req} 才能挑战`, 'error');
            return false;
        }

        return true;
    }

    /**
     * 获取VIP允许的挑战次数
     */
    getMaxAttempts(vipLevel) {
        const limits = {
            0: 3,
            1: 5, 2: 5,
            3: 8, 4: 8,
            5: 12, 6: 12,
            7: 20, 8: 20, 9: 20, 10: 20
        };
        return limits[vipLevel] || 3;
    }

    /**
     * 检查剩余挑战次数
     */
    hasRemainingAttempts(dungeonId, difficulty) {
        const vipLevel = this.game.persistentState.player.vipLevel || 0;
        const maxAttempts = this.getMaxAttempts(vipLevel);
        const currentAttempts = this.getCurrentAttempts(dungeonId, difficulty);

        return currentAttempts < maxAttempts;
    }

    /**
     * 获取今日已用次数
     */
    getCurrentAttempts(dungeonId, difficulty) {
        const playerData = this.game.persistentState.player.resourceDungeons;
        if (!playerData[dungeonId]) {
            return 0;
        }

        const attempts = playerData[dungeonId].attempts[difficulty];
        const today = new Date().toDateString();

        // 检查是否需要重置（跨天）
        if (attempts.lastReset !== today) {
            attempts.count = 0;
            attempts.lastReset = today;
        }

        return attempts.count;
    }

    /**
     * 消耗挑战次数
     */
    consumeAttempt(dungeonId, difficulty) {
        const playerData = this.game.persistentState.player.resourceDungeons;
        if (!playerData[dungeonId]) {
            this.initPlayerDungeonData(dungeonId);
        }

        const attempts = playerData[dungeonId].attempts[difficulty];
        const today = new Date().toDateString();

        // 检查是否需要重置（跨天）
        if (attempts.lastReset !== today) {
            attempts.count = 0;
            attempts.lastReset = today;
        }

        attempts.count++;
        this.game.saveGameState();
    }

    /**
     * 检查是否可以扫荡
     */
    canSweep(dungeonId, difficulty) {
        const vipLevel = this.game.persistentState.player.vipLevel || 0;

        // VIP1+ 才能扫荡
        if (vipLevel < 1) {
            return false;
        }

        // 必须通关过一次
        const playerData = this.game.persistentState.player.resourceDungeons;
        if (!playerData[dungeonId] || !playerData[dungeonId].cleared[difficulty]) {
            return false;
        }

        // 检查次数
        if (!this.hasRemainingAttempts(dungeonId, difficulty)) {
            return false;
        }

        return true;
    }

    /**
     * 获取境界加成系数
     */
    getRealmBonus() {
        const realm = this.game.persistentState.player.realm.currentRealm;
        const bonuses = {
            0: 1.0,   // 武者
            1: 1.5,   // 炼气
            2: 2.0,   // 筑基
            3: 3.0,   // 金丹
            4: 5.0,   // 元婴
            5: 10.0   // 化神
        };
        return bonuses[realm] || 1.0;
    }

    /**
     * 获取VIP加成系数
     */
    getVIPBonus() {
        const vipLevel = this.game.persistentState.player.vipLevel || 0;

        if (vipLevel >= 7) return 0.3;  // +30%
        if (vipLevel >= 4) return 0.2;  // +20%
        if (vipLevel >= 1) return 0.1;  // +10%

        return 0;
    }

    /**
     * 计算最终奖励
     */
    calculateReward(dungeonId, difficulty) {
        const config = this.getDifficultyConfig(dungeonId);
        const baseReward = config.reward;

        const realmBonus = this.getRealmBonus();
        const vipBonus = this.getVIPBonus();

        const finalReward = {};
        Object.keys(baseReward).forEach(key => {
            finalReward[key] = Math.floor(
                baseReward[key] * realmBonus * (1 + vipBonus)
            );
        });

        return finalReward;
    }

    /**
     * 生成敌人队列
     */
    generateEnemyQueue(dungeonId, difficulty) {
        const dungeon = this.getDungeonConfig(dungeonId);
        const config = this.getDifficultyConfig(dungeonId, difficulty);
        const playerLevel = this.game.persistentState.player.level;

        const enemies = [];

        for (let i = 0; i < config.enemies; i++) {
            let enemyType;

            // 最后一个是Boss（困难模式）
            if (difficulty === 'hard' && i === config.enemies - 1) {
                enemyType = {
                    type: 'boss',
                    name: dungeon.boss_type,
                    level: playerLevel + 2,
                    scale: 3.0
                };
            }
            // 倒数第二个是精英（普通和困难）
            else if ((difficulty === 'medium' || difficulty === 'hard') && i === config.enemies - 2) {
                enemyType = {
                    type: 'elite',
                    name: '精英' + dungeon.enemy_types[0],
                    level: difficulty === 'hard' ? playerLevel + 2 : playerLevel,
                    scale: 2.0
                };
            }
            // 其他是普通怪
            else {
                const randomType = dungeon.enemy_types[Math.floor(Math.random() * dungeon.enemy_types.length)];
                const levelMod = difficulty === 'easy' ? -2 : difficulty === 'hard' ? 2 : 0;

                enemyType = {
                    type: 'normal',
                    name: randomType,
                    level: playerLevel + levelMod,
                    scale: 1.0
                };
            }

            // 生成敌人数据
            const enemy = this.generateDungeonEnemy(enemyType, playerLevel, difficulty);
            enemies.push(enemy);
        }

        return enemies;
    }

    /**
     * 生成副本敌人 - 完整复用探险场景的敌人属性计算逻辑
     */
    generateDungeonEnemy(enemyType, playerLevel, difficulty) {
        console.log('=== [generateDungeonEnemy] 开始生成 ===');
        console.log('enemyType:', enemyType);
        console.log('playerLevel:', playerLevel, 'difficulty:', difficulty);

        // ✅ 从enemyTypes中查找敌人基础属性
        const selectedEnemyType = this.game.metadata.enemyTypes.find(enemy => enemy.name === enemyType.name);

        if (!selectedEnemyType) {
            console.warn(`副本敌人 ${enemyType.name} 未在enemyTypes中定义，使用默认属性`);
        } else {
            console.log('找到敌人定义:', selectedEnemyType.name, 'baseHp:', selectedEnemyType.baseHp);
        }

        // ✅ 获取基础属性（优先使用定义的，否则使用默认值）
        const baseHp = selectedEnemyType?.baseHp || 50;
        const baseAttack = selectedEnemyType?.baseAttack || 10;
        const baseDefense = selectedEnemyType?.baseDefense || 5;
        const baseSpeed = selectedEnemyType?.baseSpeed || 8;
        const baseLuck = selectedEnemyType?.baseLuck || 5;

        console.log('基础属性:', { baseHp, baseAttack, baseDefense, baseSpeed, baseLuck });

        // ✅ 计算敌人等级（与探险场景一致）
        const enemyLevel = enemyType.level;

        // ✅ 类型加成（与探险场景一致）
        let bonus = 0;
        if (enemyType.type === 'boss') {
            bonus = 1.0;
        } else if (enemyType.type === 'elite') {
            bonus = 0.5;
        }

        // ✅ 副本难度加成
        const difficultyMod = {
            'easy': 0.8,
            'medium': 1.0,
            'hard': 1.5
        }[difficulty];

        // ✅ 类型倍率（与探险场景一致）
        const typeMod = {
            'normal': 1.0,
            'elite': 2.5,
            'boss': 5.0
        }[enemyType.type];

        console.log('倍率:', { bonus, difficultyMod, typeMod });

        // ✅ 计算最终属性（使用探险场景的线性成长公式）
        // 成长率：HP +50%基础值/级，Attack/Defense +30%基础值/级，Speed/Luck +20%基础值/级
        const finalHp = Math.floor((baseHp + (enemyLevel - 1) * baseHp * 0.5) * (1 + bonus) * difficultyMod * typeMod / (1 + bonus));
        const finalAttack = Math.floor((baseAttack + (enemyLevel - 1) * baseAttack * 0.3) * (1 + bonus) * difficultyMod * typeMod / (1 + bonus));
        const finalDefense = Math.floor((baseDefense + (enemyLevel - 1) * baseDefense * 0.3) * (1 + bonus) * difficultyMod * typeMod / (1 + bonus));
        const finalSpeed = Math.floor((baseSpeed + (enemyLevel - 1) * baseSpeed * 0.2) * (1 + bonus));
        const finalLuck = Math.floor((baseLuck + (enemyLevel - 1) * baseLuck * 0.2) * (1 + bonus));

        console.log('计算结果:', { finalHp, finalAttack, finalDefense, finalSpeed, finalLuck });

        // ✅ 构造完整的敌人数据（与探险场景一致）
        const enemyData = {
            level: enemyLevel,
            hp: finalHp,
            maxHp: finalHp,
            attack: finalAttack,
            defense: finalDefense,
            speed: finalSpeed,
            luck: finalLuck,
            energy: enemyType.type === 'boss' ? 100 : 0,
            maxEnergy: enemyType.type === 'boss' ? 100 : 0,
            isElite: enemyType.type === 'elite',
            isBoss: enemyType.type === 'boss',
            bonus: bonus,
            name: enemyType.type === 'boss' ? `BOSS${enemyType.name}` :
                  (enemyType.type === 'elite' ? `精英${enemyType.name}` : enemyType.name),
            icon: enemyType.type === 'boss' ? 'fa-star' :
                  (enemyType.type === 'elite' ? 'fa-diamond' : (selectedEnemyType?.icon || 'fa-skull')),
            image: selectedEnemyType?.image,
            expMultiplier: (selectedEnemyType?.expMultiplier || 1) * (enemyType.type === 'boss' ? 2.0 : (enemyType.type === 'elite' ? 1.5 : 1)),
            resourceMultiplier: (selectedEnemyType?.resourceMultiplier || 1) * (enemyType.type === 'boss' ? 2.0 : (enemyType.type === 'elite' ? 1.5 : 1)),
            position: { x: 0, z: 0, y: 0 },
            isFlying: false,
            baseName: enemyType.name
        };

        console.log('✅ 最终敌人数据:', enemyData);

        return enemyData;
    }

    /**
     * 获取敌人基础属性
     */
    getEnemyBaseStats(enemyName) {
        // 基于玩家等级的基础属性
        const playerLevel = this.game.persistentState.player.level;
        const baseHp = 100 + playerLevel * 50;
        const baseAttack = 10 + playerLevel * 8;
        const baseDefense = 5 + playerLevel * 6;
        const baseSpeed = 10 + Math.random() * 5;

        return {
            hp: baseHp,
            attack: baseAttack,
            defense: baseDefense,
            speed: baseSpeed
        };
    }

    /**
     * 备份玩家状态
     */
    backupPlayerState() {
        const player = this.game.persistentState.player;
        return {
            hp: player.hp,
            maxHp: player.maxHp,
            mp: player.mp,
            maxMp: player.maxMp,
            buffs: JSON.parse(JSON.stringify(player.buffs || []))
        };
    }

    /**
     * 恢复玩家状态
     */
    restorePlayerState() {
        if (!this.playerStateBackup) return;

        const player = this.game.persistentState.player;
        player.hp = this.playerStateBackup.hp;
        player.maxHp = this.playerStateBackup.maxHp;
        player.mp = this.playerStateBackup.mp;
        player.maxMp = this.playerStateBackup.maxMp;
        player.buffs = JSON.parse(JSON.stringify(this.playerStateBackup.buffs));

        this.playerStateBackup = null;
    }

    /**
     * 进入副本
     */
    enterDungeon(dungeonId, difficulty) {
        // 检查等级
        if (!this.checkLevelRequirement(dungeonId, difficulty)) {
            return;
        }

        // 检查次数
        if (!this.hasRemainingAttempts(dungeonId, difficulty)) {
            this.game.showNotification('今日挑战次数已用完', 'error');
            return;
        }

        // 备份玩家状态
        this.playerStateBackup = this.backupPlayerState();

        // 生成敌人队列
        this.enemyQueue = this.generateEnemyQueue(dungeonId, difficulty);
        this.currentEnemyIndex = 0;
        this.currentDungeon = dungeonId;
        this.currentDifficulty = difficulty;

        // 播放副本背景音乐
        this.playDungeonMusic(dungeonId);

        // 开始战斗第1个敌人（复用battle3d场景）
        this.startNextBattle();
    }

    /**
     * 开始下一场战斗
     */
    startNextBattle() {
        if (this.currentEnemyIndex >= this.enemyQueue.length) {
            console.error('敌人索引越界');
            return;
        }

        const enemy = this.enemyQueue[this.currentEnemyIndex];
        const dungeon = this.getDungeonConfig(this.currentDungeon);

        // 设置游戏状态中的敌人（复用现有战斗系统）
        this.game.transientState.enemy = enemy;

        // ✅ 隐藏敌人信息面板（副本战斗不需要）
        const enemyInfoPanel = document.getElementById('enemy-info-panel');
        if (enemyInfoPanel) {
            enemyInfoPanel.classList.add('hidden');
        }

        // 设置战斗场景（根据副本类型选择场景）
        const sceneMap = {
            spirit_stone_mine: BATTLE_SCENES.LAVA_HELL,      // 矿洞用熔岩场景
            herb_garden: BATTLE_SCENES.LAKE_SIDE,            // 灵草园用湖畔场景
            iron_mine: BATTLE_SCENES.LAVA_HELL               // 铁矿用熔岩场景
        };

        const sceneType = sceneMap[this.currentDungeon] || BATTLE_SCENES.IMMORTAL_PEAK;

        // 显示3D战斗界面
        document.getElementById('game-area-container').classList.add('hidden');
        document.getElementById('battle-modal').classList.remove('hidden');

        // 显示退出副本按钮
        const exitBtn = document.getElementById('exit-dungeon-btn');
        if (exitBtn) {
            exitBtn.classList.remove('hidden');
        }

        // 调用battle3d系统创建战斗场景（复用）
        if (this.game.battle3D && this.game.battle3D.isSceneReady) {
            // 场景已存在，只替换敌人（复用场景，100ms）
            this.game.replaceEnemyInBattle(enemy);
        } else {
            // 首次创建场景（2000ms）
            this.game.createBattleScene(enemy);
        }

        // 显示进度提示
        this.game.showNotification(
            `第 ${this.currentEnemyIndex + 1}/${this.enemyQueue.length} 个敌人`,
            'info'
        );
    }

    /**
     * 战斗胜利 - 进入下一个敌人或通关
     */
    onBattleVictory() {
        this.currentEnemyIndex++;

        // 检查是否通关
        if (this.currentEnemyIndex >= this.enemyQueue.length) {
            // 通关副本
            this.completeDungeon();
        } else {
            // 进入下一个敌人（延迟1.5秒，让玩家看到胜利动画）
            setTimeout(() => {
                this.startNextBattle();
            }, 1500);
        }
    }

    /**
     * 战斗失败 - 强制退出
     */
    onBattleDefeat() {
        // 消耗次数
        this.consumeAttempt(this.currentDungeon, this.currentDifficulty);

        // 停止音乐
        this.stopAllDungeonMusic();

        // 清理并退出
        this.exitDungeon('战斗失败', false);
    }

    /**
     * 玩家主动退出
     */
    exitDungeonManually() {
        // 确认对话框
        if (confirm('确定要退出副本吗？退出将消耗1次挑战次数且无法获得奖励。')) {
            // 消耗次数
            this.consumeAttempt(this.currentDungeon, this.currentDifficulty);

            // 停止音乐
            this.stopAllDungeonMusic();

            // 清理并退出
            this.exitDungeon('主动退出', true);
        }
    }

    /**
     * 退出副本（内部清理逻辑）
     */
    exitDungeon(reason, restoreState) {
        // 恢复玩家状态（仅在失败/退出时恢复）
        if (restoreState) {
            this.restorePlayerState();
        }

        // 清理战斗场景
        if (this.game.battle3d) {
            this.game.battle3d.cleanupScene();
        }

        // ✅ 清理副本敌人数据
        this.game.transientState.enemy = null;

        // 隐藏退出副本按钮
        const exitBtn = document.getElementById('exit-dungeon-btn');
        if (exitBtn) {
            exitBtn.classList.add('hidden');
        }

        // 隐藏战斗模态框，显示主游戏区域
        document.getElementById('battle-modal').classList.add('hidden');
        document.getElementById('game-area-container').classList.remove('hidden');

        // 重置副本状态
        this.currentDungeon = null;
        this.currentDifficulty = null;
        this.enemyQueue = [];
        this.currentEnemyIndex = 0;

        // 显示提示
        this.game.showNotification(`副本挑战失败：${reason}`, 'warning');

        // 返回副本列表
        this.game.showDungeonList();
    }

    /**
     * 通关副本
     */
    completeDungeon() {
        // 停止音乐
        this.stopAllDungeonMusic();

        // 消耗次数
        this.consumeAttempt(this.currentDungeon, this.currentDifficulty);

        // 计算奖励（含境界加成）
        const reward = this.calculateReward(this.currentDungeon, this.currentDifficulty);

        // 发放奖励
        this.giveReward(reward);

        // 检查首次通关奖励
        this.checkFirstClearBonus(this.currentDungeon, this.currentDifficulty);

        // 标记为已通关
        this.markDungeonCleared(this.currentDungeon, this.currentDifficulty);

        // ✅ 清理副本敌人数据
        this.game.transientState.enemy = null;

        // 清理
        this.playerStateBackup = null; // 通关不恢复状态
        this.currentDungeon = null;
        this.currentDifficulty = null;
        this.enemyQueue = [];

        // 隐藏战斗模态框，显示主游戏区域
        document.getElementById('battle-modal').classList.add('hidden');
        document.getElementById('game-area-container').classList.remove('hidden');

        // 显示通关界面
        this.game.showDungeonComplete(reward);
    }

    /**
     * 扫荡副本（VIP1+）
     */
    sweepDungeon(dungeonId, difficulty) {
        // 检查是否可以扫荡
        if (!this.canSweep(dungeonId, difficulty)) {
            const vipLevel = this.game.persistentState.player.vipLevel || 0;
            if (vipLevel < 1) {
                this.game.showNotification('VIP1以上才能扫荡', 'error');
            } else {
                this.game.showNotification('需要先通关一次才能扫荡', 'error');
            }
            return;
        }

        // 消耗次数
        this.consumeAttempt(dungeonId, difficulty);

        // 计算奖励
        const reward = this.calculateReward(dungeonId, difficulty);

        // 发放奖励
        this.giveReward(reward);

        // 显示扫荡结果
        this.game.showNotification('扫荡成功！', 'success');
        this.game.showDungeonComplete(reward);
    }

    /**
     * 发放奖励
     */
    giveReward(reward) {
        const player = this.game.persistentState.player;

        if (reward.spirit_stones) {
            player.spiritStones += reward.spirit_stones;
        }

        if (reward.herbs) {
            player.resources.herbs += reward.herbs;
        }

        if (reward.iron) {
            player.resources.iron += reward.iron;
        }

        if (reward.exp) {
            this.game.gainExp(reward.exp);
        }

        this.game.saveGameState();
        this.game.updateUI();
    }

    /**
     * 检查首次通关奖励
     */
    checkFirstClearBonus(dungeonId, difficulty) {
        const playerData = this.game.persistentState.player.resourceDungeons;
        if (!playerData[dungeonId]) {
            this.initPlayerDungeonData(dungeonId);
        }

        // 检查是否首次通关
        if (!playerData[dungeonId].cleared[difficulty]) {
            const config = this.getDifficultyConfig(dungeonId, difficulty);
            const bonus = config.first_clear_bonus;

            if (bonus) {
                this.giveReward(bonus);
                this.game.showNotification('首次通关奖励！', 'success');
            }
        }
    }

    /**
     * 标记副本为已通关
     */
    markDungeonCleared(dungeonId, difficulty) {
        const playerData = this.game.persistentState.player.resourceDungeons;
        if (!playerData[dungeonId]) {
            this.initPlayerDungeonData(dungeonId);
        }

        playerData[dungeonId].cleared[difficulty] = true;
        this.game.saveGameState();
    }

    /**
     * 初始化玩家副本数据
     */
    initPlayerDungeonData(dungeonId) {
        if (!this.game.persistentState.player.resourceDungeons) {
            this.game.persistentState.player.resourceDungeons = {};
        }

        const today = new Date().toDateString();

        this.game.persistentState.player.resourceDungeons[dungeonId] = {
            cleared: { easy: false, medium: false, hard: false },
            attempts: {
                easy: { count: 0, lastReset: today },
                medium: { count: 0, lastReset: today },
                hard: { count: 0, lastReset: today }
            }
        };
    }

    /**
     * 初始化所有副本数据
     */
    initAllDungeonData() {
        const dungeons = this.game.metadata.resourceDungeons;
        if (!dungeons) return;

        Object.keys(dungeons).forEach(dungeonId => {
            if (!this.game.persistentState.player.resourceDungeons[dungeonId]) {
                this.initPlayerDungeonData(dungeonId);
            }
        });
    }
}
