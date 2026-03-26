// dailyQuest.js - 每日任务系统

class DailyQuestSystem {
    constructor(game) {
        this.game = game;

        // ✅ 构造函数中注册事件监听器（确保从存档加载时也能监听）
        this.registerEventListeners();
    }

    // ========== 每日任务初始化 ==========

    /**
     * 初始化每日任务（登录时调用）
     */
    initDailyQuests() {
        if (!this.game.metadata.dailyQuestConfig) {
            console.log('[每日任务] 没有dailyQuestConfig，跳过初始化');
            return;
        }

        const needsRefresh = this.checkDailyQuestRefresh();

        if (needsRefresh) {
            console.log('[每日任务] 正在生成新任务...');
            this.generateDailyQuests();
            this.game.persistentState.dailyQuests.completedToday = false;
        }

        this.updateDailyQuestUI();

        // ✅ 注册事件监听器，自动追踪任务进度
        this.registerEventListeners();
    }

    /**
     * 注册事件监听器（自动追踪任务进度）
     */
    registerEventListeners() {
        if (typeof window === 'undefined' || !window.eventManager) {
            console.warn('[每日任务] eventManager未加载，跳过事件监听注册');
            return;
        }

        // 避免重复注册
        if (this._eventListenersRegistered) {
            console.log('[每日任务] 事件监听器已注册，跳过重复注册');
            return;
        }

        // 监听敌人击杀事件
        window.eventManager.on('battle:victory', (event) => {
            console.log('[每日任务] 收到战斗胜利事件:', event.data);
            if (event.data) {
                // 确定敌人类型
                let enemyType = 'normal';  // 默认是普通怪
                if (event.data.isBoss) {
                    enemyType = 'boss';
                } else if (event.data.isElite) {
                    enemyType = 'elite';
                }

                this.trackDailyQuestProgress('enemy_killed', {
                    type: enemyType,
                    isBoss: event.data.isBoss || false,
                    isElite: event.data.isElite || false
                });
            }
        });

        // 监听副本完成事件
        window.eventManager.on('dungeon:complete', (event) => {
            console.log('[每日任务] 收到副本完成事件:', event.data);
            if (event.data) {
                this.trackDailyQuestProgress('dungeon_completed', {
                    dungeonId: event.data.dungeonId
                });
            }
        });

        // 监听地图访问事件
        window.eventManager.on('map:visit', (event) => {
            if (event.data) {
                this.trackDailyQuestProgress('map_visited', {
                    mapType: event.data.mapType
                });
            }
        });

        this._eventListenersRegistered = true;
        console.log('✅ DailyQuestSystem事件监听已注册');
    }

    /**
     * 检查是否需要刷新每日任务（日期对比）
     */
    checkDailyQuestRefresh() {
        const dq = this.game.persistentState.dailyQuests;
        // 使用本地日期而非UTC日期，避免时区问题
        const today = this.getLocalDateString();

        console.debug(`[每日任务] 检查刷新: today=${today}, lastRefreshDate=${dq?.lastRefreshDate}`);

        if (!dq || dq.lastRefreshDate !== today) {
            console.debug(`[每日任务] 需要刷新 (dq=${!dq ? '不存在' : '日期不同'})`);
            return true;
        }

        if (!dq.quests || dq.quests.length === 0) {
            console.debug(`[每日任务] 需要刷新 (没有任务)`);
            return true;
        }

        console.debug(`[每日任务] 不需要刷新`);
        return false;
    }

    /**
     * 获取本地日期字符串 (YYYY-MM-DD)
     */
    getLocalDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // ========== 每日任务生成 ==========

    /**
     * 生成今天的 3 个每日任务
     */
    generateDailyQuests() {
        const config = this.game.metadata.dailyQuestConfig;
        const templates = config.templates;
        const realmIndex = this.game.persistentState.player.realm?.currentRealm || 0;
        const stageNum = this.game.persistentState.player.realm?.currentStage || 1;
        const theme = config.baseValues;
        const tc = this.game.metadata.questTemplateConfig;
        const stageMult = tc.stageMultiplier[stageNum - 1];
        const realmMult = tc.realmMultiplier[realmIndex];

        const shuffled = [...templates].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, config.questsPerDay);

        const dq = this.game.persistentState.dailyQuests;

        if (dq.lastRefreshDate) {
            const lastDate = new Date(dq.lastRefreshDate);
            const today = new Date();
            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                dq.streak = 0;
            }
        } else {
            dq.streak = 0;
        }

        const quests = [];
        for (const template of selected) {
            const quest = this.generateDailyQuest(template, realmIndex, stageNum, theme, tc, stageMult, realmMult);
            quests.push(quest);
        }

        const today = this.getLocalDateString();
        this.game.persistentState.dailyQuests = {
            lastRefreshDate: today,
            quests,
            activityPoints: dq.activityPoints || 0,
            streak: dq.streak || 0,
            totalCompleted: dq.totalCompleted || 0,
            completedToday: false
        };

        console.log(`[每日任务] 已生成 ${quests.length} 个新任务，lastRefreshDate=${today}`);

        this.game.saveGameState();
    }

    /**
     * 生成单个每日任务
     */
    generateDailyQuest(template, realmIndex, stageNum, baseValues, tc, stageMult, realmMult) {
        let target, description;

        switch (template.type) {
            case 'kill':
                target = Math.max(3, Math.floor(baseValues.kill * stageMult));
                description = template.descTemplate.replace('{target}', target);
                break;
            case 'kill_boss':
                target = Math.max(1, Math.floor(baseValues.boss * stageMult));
                description = template.descTemplate.replace('{target}', target);
                break;
            case 'collect':
                target = Math.max(3, Math.floor(baseValues.collect * stageMult));
                description = template.descTemplate.replace('{target}', target);
                break;
            case 'dungeon':
                target = 1;
                description = template.descTemplate;
                break;
            case 'visit_map': {
                // 从玩家当前可进入的地图中随机选择一个
                const availableMaps = this.game.getAvailableMaps();
                const unlockedMaps = availableMaps.filter(m => m.isUnlocked && !m.isCurrent);
                if (unlockedMaps.length > 0) {
                    const randomMap = unlockedMaps[Math.floor(Math.random() * unlockedMaps.length)];
                    target = 1;
                    description = `前往${randomMap.name}探索`;
                    return {
                        id: template.id,
                        type: template.type,
                        subType: template.subType || null,
                        resource: template.resource || null,
                        targetMap: randomMap.type,
                        name: template.name,
                        description,
                        target,
                        current: 0,
                        completed: false,
                        claimed: false,
                        rewards: {
                            exp: Math.floor(baseValues.exp * stageMult * realmMult),
                            spiritStones: Math.floor(baseValues.spiritStones * stageMult * realmMult),
                            activityPoints: Math.floor(baseValues.activity * stageMult * realmMult)
                        }
                    };
                } else {
                    // 如果没有其他可探索地图，改为击杀任务
                    target = Math.max(3, Math.floor(baseValues.kill * stageMult));
                    description = `击败${target}只妖兽`;
                    return {
                        id: 'daily_kill_fallback',
                        type: 'kill',
                        subType: null,
                        resource: null,
                        name: '妖兽讨伐',
                        description,
                        target,
                        current: 0,
                        completed: false,
                        claimed: false,
                        rewards: {
                            exp: Math.floor(baseValues.exp * stageMult * realmMult),
                            spiritStones: Math.floor(baseValues.spiritStones * stageMult * realmMult),
                            activityPoints: Math.floor(baseValues.activity * stageMult * realmMult)
                        }
                    };
                }
            }
        }

        const expReward = Math.floor(baseValues.exp * stageMult * realmMult);
        const spiritStonesReward = Math.floor(baseValues.spiritStones * stageMult * realmMult);
        const activityReward = Math.floor(baseValues.activity * stageMult * realmMult);

        return {
            id: template.id,
            type: template.type,
            subType: template.subType || null,
            resource: template.resource || null,
            dungeonId: template.dungeonId || null,
            name: template.name,
            description,
            target,
            current: 0,
            completed: false,
            claimed: false,
            rewards: {
                exp: expReward,
                spiritStones: spiritStonesReward,
                activityPoints: activityReward
            }
        };
    }

    // ========== 每日任务进度追踪 ==========

    /**
     * 每日任务进度追踪（被主线事件钩子调用）
     */
    trackDailyQuestProgress(eventType, eventData) {
        const dq = this.game.persistentState.dailyQuests;
        if (!dq || !dq.quests) {
            console.log('[每日任务] 无任务数据');
            return;
        }

        console.log('[每日任务] 追踪进度:', {
            eventType,
            eventData,
            quests: dq.quests.map(q => ({ id: q.id, type: q.type, current: q.current, completed: q.completed }))
        });

        let changed = false;

        for (const quest of dq.quests) {
            if (quest.completed || quest.claimed) continue;

            switch (quest.type) {
                case 'kill':
                    if (eventType === 'enemy_killed') {
                        if (!quest.subType || eventData.type === quest.subType) {
                            quest.current = (quest.current || 0) + 1;
                            changed = true;
                            console.log(`[每日任务] 击杀任务进度更新: ${quest.name} - ${quest.current}/${quest.target}`);
                        }
                    }
                    break;

                case 'kill_boss':
                    console.log('[每日任务] Boss任务检查:', {
                        eventType,
                        isBoss: eventData.isBoss,
                        current: quest.current,
                        target: quest.target
                    });
                    if (eventType === 'enemy_killed' && eventData.isBoss) {
                        quest.current = (quest.current || 0) + 1;
                        changed = true;
                        console.log(`[每日任务] Boss任务进度更新: ${quest.name} - ${quest.current}/${quest.target}`);
                    }
                    break;

                case 'dungeon':
                    if (eventType === 'dungeon_completed' && eventData.dungeonId === quest.dungeonId) {
                        quest.current = 1;
                        changed = true;
                        console.log(`[每日任务] 副本任务完成: ${quest.name}`);
                    }
                    break;

                case 'visit_map':
                    if (eventType === 'map_visited' && eventData.mapType === quest.targetMap) {
                        quest.current = 1;
                        changed = true;
                        console.log(`[每日任务] 地图任务完成: ${quest.name}`);
                    }
                    break;
            }

            if (changed && quest.current >= quest.target) {
                quest.completed = true;
                this.game.addBattleLog(`📋 每日任务【${quest.name}】已完成！点击领取奖励。`);
                console.log(`[每日任务] 任务完成: ${quest.name}`);
            }
        }

        if (changed) {
            this.updateDailyQuestUI();
            this.game.saveGameState();
        }
    }

    // ========== 每日任务完成与奖励 ==========

    /**
     * 领取每日任务奖励
     */
    claimDailyQuestReward(questIndex) {
        const dq = this.game.persistentState.dailyQuests;
        if (!dq || !dq.quests[questIndex]) return;

        const quest = dq.quests[questIndex];

        if (!quest.completed) {
            this.game.addBattleLog('❌ 任务尚未完成！');
            return;
        }
        if (quest.claimed) {
            this.game.addBattleLog('❌ 奖励已领取！');
            return;
        }

        const streakConfig = this.getStreakBonus();
        const bonusMult = streakConfig ? streakConfig.bonusPercent : 0;

        // 兼容旧数据：优先使用spiritStones，其次gold
        const baseSpiritStones = quest.rewards.spiritStones ?? quest.rewards.gold ?? 0;
        const expReward = Math.floor(quest.rewards.exp * (1 + bonusMult));
        const spiritStonesReward = Math.floor(baseSpiritStones * (1 + bonusMult));
        const activityReward = quest.rewards.activityPoints;

        if (expReward) this.game.persistentState.player.exp += expReward;
        if (spiritStonesReward) this.game.persistentState.resources.spiritStones = (this.game.persistentState.resources.spiritStones || 0) + spiritStonesReward;
        dq.activityPoints = (dq.activityPoints || 0) + activityReward;
        dq.totalCompleted = (dq.totalCompleted || 0) + 1;
        quest.claimed = true;

        let rewardText = `获得 经验+${expReward}，灵石+${spiritStonesReward}，活跃度+${activityReward}`;
        if (bonusMult > 0) {
            rewardText += ` (${Math.floor(bonusMult * 100)}%连续加成)`;
        }

        this.game.addBattleLog(`✅ 领取奖励：${rewardText}`);
        this.showDailyRewardPopup(quest, expReward, spiritStonesReward, activityReward, bonusMult);

        this.game.updateUI();
        this.game.checkLevelUp();
        this.updateDailyQuestUI();
        this.game.saveGameState();

        this.checkDailyAllComplete();
    }

    /**
     * 检查今日所有每日任务是否全部完成
     */
    checkDailyAllComplete() {
        const dq = this.game.persistentState.dailyQuests;
        if (!dq || dq.completedToday) return;

        const allClaimed = dq.quests.every(q => q.claimed);
        if (!allClaimed) return;

        dq.completedToday = true;
        dq.streak = (dq.streak || 0) + 1;

        const streakConfig = this.getStreakBonus();
        if (streakConfig) {
            this.game.addBattleLog(`🔥 连续完成 ${dq.streak} 天！${streakConfig.title} - 所有奖励加成 ${Math.floor(streakConfig.bonusPercent * 100)}%！`);
            dq.activityPoints += streakConfig.extraActivity;
        }

        this.game.addBattleLog(`📅 今日每日任务全部完成！累计活跃度：${dq.activityPoints}`);
        this.updateDailyQuestUI();
        this.game.saveGameState();
    }

    // ========== 仙玉速通功能 ==========

    /**
     * 仙玉速通单个任务
     */
    instantCompleteQuest(questIndex) {
        const dq = this.game.persistentState.dailyQuests;
        if (!dq || !dq.quests[questIndex]) {
            this.game.addBattleLog('❌ 任务不存在！');
            return { success: false };
        }

        const quest = dq.quests[questIndex];

        if (quest.completed || quest.claimed) {
            this.game.addBattleLog('❌ 任务已完成，无需速通！');
            return { success: false };
        }

        const JADE_COST = 80;
        const jade = this.game.persistentState.resources?.jade || 0;

        if (jade < JADE_COST) {
            this.game.addBattleLog(`❌ 仙玉不足！速通需要 ${JADE_COST} 仙玉，当前 ${jade} 仙玉`);
            return { success: false };
        }

        // 扣除仙玉
        this.game.persistentState.resources.jade -= JADE_COST;

        // 完成任务
        quest.current = quest.target;
        quest.completed = true;

        this.game.addBattleLog(`💎 消耗 ${JADE_COST} 仙玉，速通任务【${quest.name}】完成！`);
        this.game.addBattleLog(`📋 每日任务【${quest.name}】已完成！点击领取奖励。`);

        this.updateDailyQuestUI();
        this.game.updateUI();
        this.game.saveGameState();

        return { success: true };
    }

    /**
     * 仙玉速通所有未完成的任务
     */
    instantCompleteAll() {
        const dq = this.game.persistentState.dailyQuests;
        if (!dq || !dq.quests) {
            this.game.addBattleLog('❌ 没有每日任务！');
            return { success: false };
        }

        // 找出未完成的任务
        const incompleteQuests = dq.quests.filter(q => !q.completed && !q.claimed);

        if (incompleteQuests.length === 0) {
            this.game.addBattleLog('❌ 所有任务已完成，无需速通！');
            return { success: false };
        }

        const JADE_COST_PER_QUEST = 80;
        const JADE_COST_ALL = 200; // 一键速通优惠价

        const totalCost = incompleteQuests.length > 1 ? JADE_COST_ALL : JADE_COST_PER_QUEST;
        const jade = this.game.persistentState.resources?.jade || 0;

        if (jade < totalCost) {
            this.game.addBattleLog(`❌ 仙玉不足！一键速通需要 ${totalCost} 仙玉，当前 ${jade} 仙玉`);
            return { success: false };
        }

        // 扣除仙玉
        this.game.persistentState.resources.jade -= totalCost;

        // 完成所有未完成任务
        let completedCount = 0;
        for (const quest of dq.quests) {
            if (!quest.completed && !quest.claimed) {
                quest.current = quest.target;
                quest.completed = true;
                completedCount++;
                this.game.addBattleLog(`📋 每日任务【${quest.name}】已完成！`);
            }
        }

        this.game.addBattleLog(`💎 消耗 ${totalCost} 仙玉，一键速通 ${completedCount} 个任务完成！`);

        this.updateDailyQuestUI();
        this.game.updateUI();
        this.game.saveGameState();

        return { success: true };
    }

    /**
     * 获取速通所需仙玉数量
     */
    getInstantCompleteCost() {
        const dq = this.game.persistentState.dailyQuests;
        if (!dq || !dq.quests) return { single: 80, all: 200, hasIncomplete: false };

        const incompleteCount = dq.quests.filter(q => !q.completed && !q.claimed).length;

        return {
            single: 80,
            all: incompleteCount > 1 ? 200 : 80,
            hasIncomplete: incompleteCount > 0,
            incompleteCount
        };
    }

    /**
     * 确认单个任务速通（显示确认弹窗）
     */
    confirmInstantComplete(questIndex) {
        const dq = this.game.persistentState.dailyQuests;
        if (!dq || !dq.quests[questIndex]) return;

        const quest = dq.quests[questIndex];
        const JADE_COST = 80;
        const jade = this.game.persistentState.resources?.jade || 0;

        if (jade < JADE_COST) {
            this.game.addBattleLog(`❌ 仙玉不足！速通需要 ${JADE_COST} 仙玉，当前 ${jade} 仙玉`);
            return;
        }

        // 显示确认弹窗
        const modal = document.getElementById('instant-complete-modal');
        if (modal) {
            document.getElementById('instant-complete-quest-name').textContent = quest.name;
            document.getElementById('instant-complete-cost').textContent = JADE_COST;
            document.getElementById('instant-complete-confirm-btn').onclick = () => {
                this.instantCompleteQuest(questIndex);
                modal.classList.add('hidden');
            };
            modal.classList.remove('hidden');
        } else {
            // 如果没有弹窗，直接执行
            this.instantCompleteQuest(questIndex);
        }
    }

    /**
     * 确认一键速通全部（显示确认弹窗）
     */
    confirmInstantCompleteAll() {
        const costInfo = this.getInstantCompleteCost();
        const jade = this.game.persistentState.resources?.jade || 0;

        if (jade < costInfo.all) {
            this.game.addBattleLog(`❌ 仙玉不足！一键速通需要 ${costInfo.all} 仙玉，当前 ${jade} 仙玉`);
            return;
        }

        // 显示确认弹窗
        const modal = document.getElementById('instant-complete-modal');
        if (modal) {
            document.getElementById('instant-complete-quest-name').textContent = `全部 ${costInfo.incompleteCount} 个任务`;
            document.getElementById('instant-complete-cost').textContent = costInfo.all;
            document.getElementById('instant-complete-confirm-btn').onclick = () => {
                this.instantCompleteAll();
                modal.classList.add('hidden');
            };
            modal.classList.remove('hidden');
        } else {
            // 如果没有弹窗，直接执行
            this.instantCompleteAll();
        }
    }

    /**
     * 获取当前连续完成奖励配置
     */
    getStreakBonus() {
        const dq = this.game.persistentState.dailyQuests;
        if (!dq || !dq.streak) return null;

        const streakRewards = this.game.metadata.dailyQuestConfig.streakRewards;
        let bestMatch = null;
        for (const sr of streakRewards) {
            if (dq.streak >= sr.days) {
                bestMatch = sr;
            }
        }
        return bestMatch;
    }

    /**
     * 获取下一个连续完成奖励配置（用于UI显示）
     */
    getNextStreakBonus() {
        const dq = this.game.persistentState.dailyQuests;
        if (!dq) return null;

        const streakDays = dq.streak || 0;
        const streakRewards = this.game.metadata.dailyQuestConfig.streakRewards;

        // 找到第一个未达成的里程碑
        for (const sr of streakRewards) {
            if (streakDays < sr.days) {
                return sr;
            }
        }
        // 所有里程碑都已达成
        return null;
    }

    /**
     * 显示每日任务奖励弹窗
     */
    showDailyRewardPopup(quest, exp, spiritStones, activity, bonusMult) {
        const popup = document.getElementById('daily-reward-popup');
        if (!popup) return;

        const titleEl = document.getElementById('daily-reward-title');
        const rewardsEl = document.getElementById('daily-reward-rewards');

        if (titleEl) titleEl.textContent = `✅ ${quest.name} 完成！`;
        if (rewardsEl) {
            let html = `<div class="flex items-center gap-2 text-blue-300"><i class="fa fa-star"></i> 经验 +${exp}</div>`;
            html += `<div class="flex items-center gap-2 text-yellow-300"><i class="fa fa-coins"></i> 灵石 +${spiritStones}</div>`;
            html += `<div class="flex items-center gap-2 text-green-300"><i class="fa fa-bolt"></i> 活跃度 +${activity}</div>`;
            if (bonusMult > 0) {
                html += `<div class="flex items-center gap-2 text-orange-300"><i class="fa fa-fire"></i> 连续加成 +${Math.floor(bonusMult * 100)}%</div>`;
            }
            rewardsEl.innerHTML = html;
        }

        popup.classList.remove('hidden');
        setTimeout(() => popup.classList.add('hidden'), 3000);
    }

    // ========== 每日任务 UI ==========

    /**
     * 更新每日任务面板 UI
     */
    updateDailyQuestUI() {
        const contentEl = document.getElementById('quest-tab-daily-content');
        if (!contentEl) return;

        const dq = this.game.persistentState.dailyQuests;
        if (!dq || !dq.quests || dq.quests.length === 0) {
            contentEl.innerHTML = '<div class="text-white/50 text-center py-8">暂无每日任务</div>';
            return;
        }

        const tc = this.game.metadata.questTemplateConfig;
        const realmNames = ['武者', '炼气', '筑基', '金丹', '元婴', '化神'];
        const realmIndex = this.game.persistentState.player.realm?.currentRealm || 0;
        const stageNum = this.game.persistentState.player.realm?.currentStage || 1;
        const stageConfig = this.game.metadata.realmConfig[realmIndex]?.stages[stageNum - 1];
        const stageLabel = stageConfig?.name || '';
        const stageDisplay = `${realmNames[realmIndex]}${stageLabel}`;

        const streakDays = dq.streak || 0;
        const allClaimed = dq.quests.every(q => q.claimed);
        const currentStreakConfig = this.getStreakBonus();
        const nextStreakConfig = this.getNextStreakBonus();

        let questsHtml = '';
        for (let i = 0; i < dq.quests.length; i++) {
            const q = dq.quests[i];
            let progressPercent = Math.min(100, (q.current / q.target) * 100);
            const isComplete = q.completed;
            const isClaimed = q.claimed;

            let progressText = '';
            if (q.type === 'kill') {
                progressText = `${q.current}/${q.target} ${q.subType === 'elite' ? '精英' : q.subType === 'boss' ? 'Boss' : '怪物'}`;
            } else if (q.type === 'dungeon') {
                const dungeonNames = {
                    'spirit_stone_mine': '灵石矿脉',
                    'herb_garden': '灵草园',
                    'iron_mine': '玄铁矿'
                };
                const dungeonName = dungeonNames[q.dungeonId] || '副本';
                progressText = isComplete ? `已通关 ${dungeonName}` : `通关 ${dungeonName}`;
                progressPercent = isComplete ? 100 : 0;
            } else if (q.type === 'visit_map') {
                const mapName = tc?.mapNames?.[q.targetMap] || '未知地图';
                progressText = isComplete ? `已到达 ${mapName}` : `前往 ${mapName}`;
                progressPercent = isComplete ? 100 : 0;
            }

            const btnClass = isClaimed ? 'bg-white/10 text-white/30 cursor-not-allowed' :
                (isComplete ? 'bg-green-500 hover:bg-green-600' : 'bg-white/10 hover:bg-white/20');
            const btnText = isClaimed ? '已领取' : '领取';

            // 速通按钮（仅未完成任务显示）
            const instantBtn = (!isComplete && !isClaimed) ?
                `<button class="px-2 py-1 rounded text-xs font-medium bg-purple-600/80 hover:bg-purple-500 text-white transition-colors flex items-center gap-1" onclick="game.dailyQuestSystem.confirmInstantComplete(${i})">
                    <i class="fa fa-bolt"></i> 80仙玉
                </button>` : '';

            questsHtml += `
                <div class="bg-white/5 rounded-xl p-3 mb-2 border ${isClaimed ? 'border-white/5 opacity-50' : isComplete ? 'border-green-500/30' : 'border-white/10'}">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium ${isClaimed ? 'text-white/30' : 'text-white/90'}">${q.name}</span>
                        <span class="text-xs ${isClaimed ? 'text-green-500/50' : isComplete ? 'text-green-400' : 'text-white/50'}">${q.completed ? '✓' : ''}</span>
                    </div>
                    <p class="text-xs text-white/50 mb-2">${q.description}</p>
                    <div class="flex items-center gap-3 mb-2">
                        <div class="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div class="h-full ${isClaimed ? 'bg-green-500' : isComplete ? 'bg-green-500' : 'bg-spiritStones'} rounded-full transition-all" style="width: ${progressPercent}%"></div>
                        </div>
                        <span class="text-xs text-white/60">${progressText}</span>
                    </div>
                    <!-- 奖励预览 -->
                    <div class="flex items-center gap-3 mb-2 text-xs text-white/50">
                        <span><i class="fa fa-star text-yellow-400"></i> ${q.rewards.exp}经验</span>
                        <span><i class="fa fa-coins text-spiritStones"></i> ${q.rewards.spiritStones}灵石</span>
                        <span><i class="fa fa-fire text-orange-400"></i> ${q.rewards.activityPoints}活跃度</span>
                        ${currentStreakConfig ? `<span class="text-green-400">(+${Math.floor(currentStreakConfig.bonusPercent * 100)}%加成)</span>` : ''}
                    </div>
                    <div class="flex gap-2">
                        ${!isClaimed && isComplete ? `<button class="flex-1 py-1.5 rounded-lg text-sm font-medium ${btnClass} text-white transition-colors" onclick="game.dailyQuestSystem.claimDailyQuestReward(${i})">${btnText}</button>` : ''}
                        ${instantBtn}
                    </div>
                </div>
            `;
        }

        let headerHtml = `
            <div class="flex items-center justify-between mb-3">
                <div class="text-xs text-spiritStones/70">${stageDisplay} · 今日任务</div>
                <div class="text-xs text-white/40">${dq.lastRefreshDate || '未刷新'}</div>
            </div>

            <!-- 系统说明 -->
            <div class="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-2 mb-3 border border-indigo-500/20">
                <div class="text-xs text-white/70 mb-1">
                    <i class="fa fa-info-circle text-indigo-400 mr-1"></i>
                    <strong>每日任务系统</strong>
                </div>
                <ul class="text-xs text-white/50 space-y-0.5 ml-4">
                    <li>• 完成任务获得经验、灵石、活跃度奖励</li>
                    <li>• 连续完成天数获得奖励加成</li>
                    <li>• 可用仙玉速通任务（忙时功能）</li>
                </ul>
            </div>

            <div class="bg-white/5 rounded-lg p-3 mb-3 border border-white/10">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-white/60">累计活跃度</span>
                        <span class="text-sm font-bold text-green-400">${dq.activityPoints || 0}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <i class="fa fa-fire text-orange-400 text-xs"></i>
                        <span class="text-xs text-orange-300">连续 ${streakDays} 天${currentStreakConfig ? ` (${currentStreakConfig.title})` : ''}</span>
                    </div>
                </div>
                ${nextStreakConfig ? `
                    <div class="mt-1 pt-2 border-t border-white/10">
                        <div class="text-xs text-spiritStones/70">下一个里程碑: ${nextStreakConfig.title} (${nextStreakConfig.days}天) - 奖励+${Math.floor(nextStreakConfig.bonusPercent * 100)}%</div>
                        <div class="h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                            <div class="h-full bg-orange-400 rounded-full transition-all" style="width: ${Math.min(100, (streakDays / nextStreakConfig.days) * 100)}%"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // 一键速通按钮（有未完成任务时显示）
        const costInfo = this.getInstantCompleteCost();
        if (!allClaimed && costInfo.hasIncomplete) {
            const jadeBalance = this.game.persistentState.resources?.jade || 0;
            const canAfford = jadeBalance >= costInfo.all;
            headerHtml += `
                <button
                    class="w-full py-2 rounded-lg text-sm font-medium ${canAfford ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400' : 'bg-white/10 text-white/30 cursor-not-allowed'} text-white transition-all mb-2 flex items-center justify-center gap-2"
                    onclick="${canAfford ? 'game.dailyQuestSystem.confirmInstantCompleteAll()' : ''}"
                    ${!canAfford ? 'disabled' : ''}>
                    <i class="fa fa-bolt"></i>
                    一键速通全部
                    <span class="px-1.5 py-0.5 bg-white/20 rounded text-xs">${costInfo.all}仙玉</span>
                    ${costInfo.incompleteCount > 1 ? '<span class="text-xs text-white/60">(优惠价)</span>' : ''}
                </button>
            `;
        }

        if (allClaimed) {
            headerHtml += `<div class="text-center text-xs text-green-400 mb-2 py-1">今日任务已全部完成</div>`;
        }

        contentEl.innerHTML = headerHtml + questsHtml;

        this.updateDailyQuestBadge();
    }

    /**
     * 更新主界面每日任务按钮红点
     */
    updateDailyQuestBadge() {
        const badge = document.getElementById('daily-quest-badge');
        if (!badge) return;

        const dq = this.game.persistentState.dailyQuests;
        if (!dq || !dq.quests) {
            badge.classList.add('hidden');
            return;
        }

        const hasUnclaimed = dq.quests.some(q => q.completed && !q.claimed);
        if (hasUnclaimed) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    /**
     * 显示每日任务面板（切换到每日任务 tab）
     */
    showDailyQuestPanel() {
        const modal = document.getElementById('main-quest-modal');
        if (!modal) return;

        modal.classList.remove('hidden');

        const currentBtn = document.getElementById('quest-tab-current-btn');
        const storyBtn = document.getElementById('quest-tab-story-btn');
        const dailyBtn = document.getElementById('quest-tab-daily-btn');
        const currentContent = document.getElementById('quest-tab-current-content');
        const storyContent = document.getElementById('quest-tab-story-content');
        const dailyContent = document.getElementById('quest-tab-daily-content');

        if (currentContent) currentContent.classList.add('hidden');
        if (storyContent) storyContent.classList.add('hidden');
        if (dailyContent) dailyContent.classList.remove('hidden');

        const deactivate = (btn) => {
            if (btn) {
                btn.classList.remove('text-spiritStones', 'border-b-2', 'border-spiritStones', 'font-medium');
                btn.classList.add('text-white/50');
            }
        };
        const activate = (btn) => {
            if (btn) {
                btn.classList.add('text-spiritStones', 'border-b-2', 'border-spiritStones', 'font-medium');
                btn.classList.remove('text-white/50');
            }
        };
        deactivate(currentBtn);
        deactivate(storyBtn);
        activate(dailyBtn);

        this.updateDailyQuestUI();
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DailyQuestSystem;
} else {
    window.DailyQuestSystem = DailyQuestSystem;
}
