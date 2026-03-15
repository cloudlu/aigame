// dailyQuest.js - 每日任务系统

class DailyQuestSystem {
    constructor(game) {
        this.game = game;
    }

    // ========== 每日任务初始化 ==========

    /**
     * 初始化每日任务（登录时调用）
     */
    initDailyQuests() {
        if (!this.game.metadata.dailyQuestConfig) return;

        const needsRefresh = this.checkDailyQuestRefresh();

        if (needsRefresh) {
            this.generateDailyQuests();
            this.game.gameState.dailyQuests.completedToday = false;
        }

        this.updateDailyQuestUI();
    }

    /**
     * 检查是否需要刷新每日任务（日期对比）
     */
    checkDailyQuestRefresh() {
        const dq = this.game.gameState.dailyQuests;
        const today = new Date().toISOString().split('T')[0];

        if (!dq || dq.lastRefreshDate !== today) {
            return true;
        }

        if (!dq.quests || dq.quests.length === 0) {
            return true;
        }

        return false;
    }

    // ========== 每日任务生成 ==========

    /**
     * 生成今天的 3 个每日任务
     */
    generateDailyQuests() {
        const config = this.game.metadata.dailyQuestConfig;
        const templates = config.templates;
        const realmIndex = this.game.gameState.player.realm?.currentRealm || 0;
        const stageNum = this.game.gameState.player.realm?.currentStage || 1;
        const theme = config.baseValues;
        const tc = this.game.metadata.questTemplateConfig;
        const stageMult = tc.stageMultiplier[stageNum - 1];
        const realmMult = tc.realmMultiplier[realmIndex];

        const shuffled = [...templates].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, config.questsPerDay);

        const dq = this.game.gameState.dailyQuests;

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

        const today = new Date().toISOString().split('T')[0];
        this.game.gameState.dailyQuests = {
            lastRefreshDate: today,
            quests,
            activityPoints: dq.activityPoints || 0,
            streak: dq.streak || 0,
            totalCompleted: dq.totalCompleted || 0,
            completedToday: false
        };

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
            case 'visit_map':
                target = 1;
                description = template.descTemplate;
                break;
        }

        const expReward = Math.floor(baseValues.exp * stageMult * realmMult);
        const goldReward = Math.floor(baseValues.gold * stageMult * realmMult);
        const activityReward = Math.floor(baseValues.activity * stageMult * realmMult);

        return {
            id: template.id,
            type: template.type,
            subType: template.subType || null,
            resource: template.resource || null,
            name: template.name,
            description,
            target,
            current: 0,
            completed: false,
            claimed: false,
            rewards: {
                exp: expReward,
                gold: goldReward,
                activityPoints: activityReward
            }
        };
    }

    // ========== 每日任务进度追踪 ==========

    /**
     * 每日任务进度追踪（被主线事件钩子调用）
     */
    trackDailyQuestProgress(eventType, eventData) {
        const dq = this.game.gameState.dailyQuests;
        if (!dq || !dq.quests) return;

        let changed = false;

        for (const quest of dq.quests) {
            if (quest.completed || quest.claimed) continue;

            switch (quest.type) {
                case 'kill':
                    if (eventType === 'enemy_killed') {
                        if (!quest.subType || eventData.type === quest.subType) {
                            quest.current = (quest.current || 0) + 1;
                            changed = true;
                        }
                    }
                    break;

                case 'kill_boss':
                    if (eventType === 'enemy_killed' && eventData.isBoss) {
                        quest.current = (quest.current || 0) + 1;
                        changed = true;
                    }
                    break;

                case 'collect':
                    if (eventType === 'resource_collected' && eventData.resource === quest.resource) {
                        quest.current = Math.min(
                            (quest.current || 0) + eventData.amount,
                            quest.target
                        );
                        changed = true;
                    }
                    break;

                case 'visit_map':
                    if (eventType === 'map_visited') {
                        quest.current = 1;
                        changed = true;
                    }
                    break;
            }

            if (changed && quest.current >= quest.target) {
                quest.completed = true;
                this.game.addBattleLog(`📋 每日任务【${quest.name}】已完成！点击领取奖励。`);
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
        const dq = this.game.gameState.dailyQuests;
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

        const expReward = Math.floor(quest.rewards.exp * (1 + bonusMult));
        const goldReward = Math.floor(quest.rewards.gold * (1 + bonusMult));
        const activityReward = quest.rewards.activityPoints;

        if (expReward) this.game.gameState.player.exp += expReward;
        if (goldReward) this.game.gameState.resources.gold = (this.game.gameState.resources.gold || 0) + goldReward;
        dq.activityPoints = (dq.activityPoints || 0) + activityReward;
        dq.totalCompleted = (dq.totalCompleted || 0) + 1;
        quest.claimed = true;

        let rewardText = `获得 经验+${expReward}，灵石+${goldReward}，活跃度+${activityReward}`;
        if (bonusMult > 0) {
            rewardText += ` (${Math.floor(bonusMult * 100)}%连续加成)`;
        }

        this.game.addBattleLog(`✅ 领取奖励：${rewardText}`);
        this.showDailyRewardPopup(quest, expReward, goldReward, activityReward, bonusMult);

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
        const dq = this.game.gameState.dailyQuests;
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

    /**
     * 获取当前连续完成奖励配置
     */
    getStreakBonus() {
        const dq = this.game.gameState.dailyQuests;
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
     * 显示每日任务奖励弹窗
     */
    showDailyRewardPopup(quest, exp, gold, activity, bonusMult) {
        const popup = document.getElementById('daily-reward-popup');
        if (!popup) return;

        const titleEl = document.getElementById('daily-reward-title');
        const rewardsEl = document.getElementById('daily-reward-rewards');

        if (titleEl) titleEl.textContent = `✅ ${quest.name} 完成！`;
        if (rewardsEl) {
            let html = `<div class="flex items-center gap-2 text-blue-300"><i class="fa fa-star"></i> 经验 +${exp}</div>`;
            html += `<div class="flex items-center gap-2 text-yellow-300"><i class="fa fa-coins"></i> 灵石 +${gold}</div>`;
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

        const dq = this.game.gameState.dailyQuests;
        if (!dq || !dq.quests || dq.quests.length === 0) {
            contentEl.innerHTML = '<div class="text-white/50 text-center py-8">暂无每日任务</div>';
            return;
        }

        const tc = this.game.metadata.questTemplateConfig;
        const realmNames = ['武者', '炼气', '筑基', '金丹', '元婴', '化神'];
        const realmIndex = this.game.gameState.player.realm?.currentRealm || 0;
        const stageNum = this.game.gameState.player.realm?.currentStage || 1;
        const stageConfig = this.game.metadata.realmConfig[realmIndex]?.stages[stageNum - 1];
        const stageLabel = stageConfig?.name || '';
        const stageDisplay = `${realmNames[realmIndex]}${stageLabel}`;

        const streakConfig = this.getStreakBonus();
        const streakDays = dq.streak || 0;
        const allClaimed = dq.quests.every(q => q.claimed);

        let questsHtml = '';
        for (let i = 0; i < dq.quests.length; i++) {
            const q = dq.quests[i];
            const progressPercent = Math.min(100, (q.current / q.target) * 100);
            const isComplete = q.completed;
            const isClaimed = q.claimed;

            let progressText = '';
            if (q.type === 'kill') {
                progressText = `${q.current}/${q.target} ${q.subType === 'elite' ? '精英' : q.subType === 'boss' ? 'Boss' : '怪物'}`;
            } else if (q.type === 'collect') {
                const resName = tc?.resourceNames?.[q.resource] || q.resource;
                progressText = `${q.current}/${q.target} ${resName}`;
            } else if (q.type === 'visit_map') {
                const mapName = tc?.mapNames?.[q.targetMap] || '未知地图';
                progressText = isComplete ? `已到达 ${mapName}` : `前往 ${mapName}`;
                progressPercent = isComplete ? 100 : 0;
            }

            const btnClass = isClaimed ? 'bg-white/10 text-white/30 cursor-not-allowed' :
                (isComplete ? 'bg-green-500 hover:bg-green-600' : 'bg-white/10 hover:bg-white/20');
            const btnText = isClaimed ? '已领取' : '领取';

            questsHtml += `
                <div class="bg-white/5 rounded-xl p-3 mb-2 border ${isClaimed ? 'border-white/5 opacity-50' : isComplete ? 'border-green-500/30' : 'border-white/10'}">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium ${isClaimed ? 'text-white/30' : 'text-white/90'}">${q.name}</span>
                        <span class="text-xs ${isClaimed ? 'text-green-500/50' : isComplete ? 'text-green-400' : 'text-white/50'}">${q.completed ? '✓' : ''}</span>
                    </div>
                    <p class="text-xs text-white/50 mb-2">${q.description}</p>
                    <div class="flex items-center gap-3 mb-2">
                        <div class="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div class="h-full ${isClaimed ? 'bg-green-500' : isComplete ? 'bg-green-500' : 'bg-gold'} rounded-full transition-all" style="width: ${progressPercent}%"></div>
                        </div>
                        <span class="text-xs text-white/60">${progressText}</span>
                    </div>
                    ${!isClaimed && isComplete ? `<button class="w-full py-1.5 rounded-lg text-sm font-medium ${btnClass} text-white transition-colors" onclick="game.dailyQuestSystem.claimDailyQuestReward(${i})">${btnText}</button>` : ''}
                </div>
            `;
        }

        let headerHtml = `
            <div class="flex items-center justify-between mb-3">
                <div class="text-xs text-gold/70">${stageDisplay} · 今日任务</div>
                <div class="text-xs text-white/40">${dq.lastRefreshDate || '未刷新'}</div>
            </div>

            <div class="bg-white/5 rounded-lg p-3 mb-3 border border-white/10">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-white/60">累计活跃度</span>
                        <span class="text-sm font-bold text-green-400">${dq.activityPoints || 0}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <i class="fa fa-fire text-orange-400 text-xs"></i>
                        <span class="text-xs text-orange-300">连续 ${streakDays} 天</span>
                    </div>
                </div>
                ${streakConfig ? `
                    <div class="mt-1 pt-2 border-t border-white/10">
                        <div class="text-xs text-gold/70">下一个里程碑: ${streakConfig.title} (${streakConfig.days}天)</div>
                        <div class="h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                            <div class="h-full bg-orange-400 rounded-full transition-all" style="width: ${Math.min(100, (streakDays / streakConfig.days) * 100)}%"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

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

        const dq = this.game.gameState.dailyQuests;
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
                btn.classList.remove('text-gold', 'border-b-2', 'border-gold', 'font-medium');
                btn.classList.add('text-white/50');
            }
        };
        const activate = (btn) => {
            if (btn) {
                btn.classList.add('text-gold', 'border-b-2', 'border-gold', 'font-medium');
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
