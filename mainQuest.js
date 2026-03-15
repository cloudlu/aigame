// mainQuest.js - 主线任务系统 + 剧情框架
// 使用 EndlessWinterGame.prototype 扩展主游戏类

// ========== 任务模板生成引擎 ==========

/**
 * 生成当前等级的主线任务 (2个任务/级)
 * @param {number} realmIndex - 境界索引 (0-5)
 * @param {number} stageNum - 阶段编号 (1-10)
 * @param {number} levelInStage - 阶段内等级 (1-levelCap)
 * @returns {Array} 生成的任务数组
 */
EndlessWinterGame.prototype.generateQuestForLevel = function(realmIndex, stageNum, levelInStage) {
    const templates = this.selectQuestTemplates(realmIndex, stageNum, levelInStage);
    const quests = [];

    for (let i = 0; i < templates.length; i++) {
        const questId = `r${realmIndex}_s${stageNum}_l${levelInStage}_q${i + 1}`;
        const quest = this.generateQuestFromTemplate(templates[i], questId, realmIndex, stageNum, levelInStage, i);
        quests.push(quest);
    }

    return quests;
};

/**
 * 根据分配规则选择当前等级的任务模板
 * @param {number} realmIndex - 境界索引
 * @param {number} stageNum - 阶段编号
 * @param {number} levelInStage - 阶段内等级
 * @returns {Array} 模板类型数组 (2个)
 */
EndlessWinterGame.prototype.selectQuestTemplates = function(realmIndex, stageNum, levelInStage) {
    const config = this.metadata.questTemplateConfig;
    const theme = config.realmThemes[realmIndex];
    const realmStages = this.metadata.realmConfig[realmIndex].stages;
    const levelCap = realmStages[stageNum - 1].levelCap;
    const isStageLastLevel = (levelInStage === levelCap);
    const isBossLevel = (levelInStage % 5 === 0);
    const isStageStart = (levelInStage === 1);
    const isStageTransition = [4, 7, 10].includes(stageNum) && isStageStart;

    // 阶段 10 最后一级: 最终Boss + 精英
    if (stageNum === 10 && isStageLastLevel) {
        return ['kill_boss', 'kill_elite'];
    }

    // 每 5 的倍数级: Boss + 精英
    if (isBossLevel && !isStageLastLevel) {
        return ['kill_boss', 'kill_elite'];
    }

    // 阶段第 1 级: 地图探索 + 杀怪 (阶段转换时不加 visit_map，用剧情代替)
    if (isStageStart && !isStageTransition) {
        return ['visit_map', 'kill_normal'];
    }

    // 奇数级: 杀怪 + 收集
    if (levelInStage % 2 === 1) {
        const resource = this.selectCollectResource(realmIndex, stageNum, levelInStage);
        return ['kill_normal', resource];
    }

    // 偶数级: 精英 + 收集
    const resource = this.selectCollectResource(realmIndex, stageNum, levelInStage);
    return ['kill_elite', resource];
};

/**
 * 选择收集资源类型
 */
EndlessWinterGame.prototype.selectCollectResource = function(realmIndex, stageNum, levelInStage) {
    const theme = this.metadata.questTemplateConfig.realmThemes[realmIndex];

    // 灵石需要解锁阶段
    if (stageNum >= theme.crystalUnlockStage) {
        // 交替选择灵石和次要资源
        if (levelInStage % 4 === 0) return 'collect_crystal';
    }

    // 交替主/次资源
    if (levelInStage % 2 === 0) return 'collect_' + theme.primaryResource;
    return 'collect_' + theme.secondaryResource;
};

/**
 * 根据模板生成单个任务
 */
EndlessWinterGame.prototype.generateQuestFromTemplate = function(templateType, questId, realmIndex, stageNum, levelInStage, questIndex) {
    const config = this.metadata.questTemplateConfig;
    const theme = config.realmThemes[realmIndex];
    const stageMult = config.stageMultiplier[stageNum - 1];
    const realmMult = config.realmMultiplier[realmIndex];
    const base = config.scalingBase;

    const realmName = theme.name;
    const stageConfig = this.metadata.realmConfig[realmIndex].stages[stageNum - 1];
    const stageLabel = stageConfig.name;
    const stageDisplay = `${realmName}${stageLabel}`;

    let objectives = [];
    let name = '';
    let description = '';
    let isMilestone = false;
    let storyTrigger = null;
    let templateTypeKey = templateType; // 用于叙事模板

    switch (templateType) {
        case 'kill_normal': {
            const target = Math.max(3, Math.floor(base.baseKill * stageMult * (1 + levelInStage * 0.06)));
            objectives = [{ type: 'kill', subType: 'normal', target }];
            name = `${stageDisplay}·妖兽讨伐`;
            description = `击败${target}只普通妖兽`;
            break;
        }
        case 'kill_elite': {
            const target = Math.max(1, Math.floor(2 * stageMult * (1 + levelInStage * 0.05)));
            objectives = [{ type: 'kill', subType: 'elite', target }];
            name = `${stageDisplay}·精英猎杀`;
            description = `击败${target}只精英妖兽`;
            break;
        }
        case 'kill_boss': {
            const bossName = this.generateBossName(realmIndex, stageNum, levelInStage);
            objectives = [{ type: 'kill_boss', targetBoss: bossName }];
            name = `${stageDisplay}·Boss挑战`;
            description = `击败${bossName}`;
            isMilestone = true;
            storyTrigger = `r${realmIndex}_boss_${bossName}`;
            break;
        }
        case 'collect_spiritWood': {
            const target = Math.max(5, Math.floor(base.baseCollect * stageMult * (1 + levelInStage * 0.08)));
            objectives = [{ type: 'collect', resource: 'spiritWood', target }];
            name = `${stageDisplay}·灵木收集`;
            description = `收集${target}个灵木`;
            templateTypeKey = 'collect_wood';
            break;
        }
        case 'collect_blackIron': {
            const target = Math.max(3, Math.floor(base.baseCollect * 0.7 * stageMult * (1 + levelInStage * 0.08)));
            objectives = [{ type: 'collect', resource: 'blackIron', target }];
            name = `${stageDisplay}·玄铁收集`;
            description = `收集${target}个玄铁`;
            templateTypeKey = 'collect_iron';
            break;
        }
        case 'collect_spiritCrystal': {
            const target = Math.max(3, Math.floor(base.baseCollect * 0.5 * stageMult * (1 + levelInStage * 0.08)));
            objectives = [{ type: 'collect', resource: 'spiritCrystal', target }];
            name = `${stageDisplay}·灵石收集`;
            description = `收集${target}个灵石`;
            templateTypeKey = 'collect_crystal';
            break;
        }
        case 'visit_map': {
            const mapPool = theme.maps;
            const mapType = mapPool[levelInStage % mapPool.length];
            const mapName = config.mapNames[mapType] || mapType;
            objectives = [{ type: 'visit_map', targetMap: mapType }];
            name = `${stageDisplay}·地图探索`;
            description = `前往${mapName}探索`;
            break;
        }
    }

    // 计算奖励
    const isBossMilestone = (levelInStage % 5 === 0);
    const expReward = Math.floor(base.baseExp * stageMult * realmMult * (1 + levelInStage * 0.1));
    const goldReward = Math.floor(base.baseGold * stageMult * realmMult * (1 + levelInStage * 0.12));

    let rewards = { exp: expReward, gold: goldReward };

    // Boss 级别给技能点
    if (isBossMilestone || templateType === 'kill_boss') {
        rewards.skillPoints = Math.max(1, Math.ceil(stageNum * 0.3));
    }

    // 境界最终任务
    const realmStages = this.metadata.realmConfig[realmIndex].stages;
    const levelCap = realmStages[stageNum - 1].levelCap;
    const isFinalQuest = (stageNum === 10 && levelInStage === levelCap);

    return {
        id: questId,
        name,
        description,
        objectives,
        rewards,
        templateType: templateTypeKey,
        templateTypeKey,
        isMilestone,
        storyTrigger,
        isFinalQuest,
        questIndex,
        realm: realmIndex,
        stage: stageNum,
        level: levelInStage
    };
};

/**
 * 按境界阶段选取 Boss 名
 */
EndlessWinterGame.prototype.generateBossName = function(realmIndex, stageNum, levelInStage) {
    const theme = this.metadata.questTemplateConfig.realmThemes[realmIndex];
    const pool = theme.bossPool;

    // 阶段 10 最后一级: 使用最后一名 Boss
    if (stageNum === 10) {
        const realmStages = this.metadata.realmConfig[realmIndex].stages;
        const levelCap = realmStages[9].levelCap;
        if (levelInStage === levelCap) {
            return pool[pool.length - 1];
        }
    }

    // 根据阶段分配 Boss (5级一次)
    const bossIndex = Math.floor((levelInStage - 1) / 5) % pool.length;
    return pool[bossIndex];
};

/**
 * 获取/缓存当前等级的任务
 */
EndlessWinterGame.prototype.getCurrentLevelQuests = function() {
    const mq = this.gameState.mainQuest;
    const levelKey = `r${mq.currentRealm}_s${mq.currentStage}_l${mq.currentLevel}`;

    if (mq.generatedCache && mq.generatedCache[levelKey]) {
        return mq.generatedCache[levelKey];
    }

    const quests = this.generateQuestForLevel(mq.currentRealm, mq.currentStage, mq.currentLevel);

    if (!mq.generatedCache) mq.generatedCache = {};
    mq.generatedCache[levelKey] = quests;
    return quests;
};

/**
 * 初始化当前等级的任务
 * @param {number} realmIndex - 境界索引
 * @param {number} stageNum - 阶段编号
 * @param {number} levelInStage - 阶段内等级
 */
EndlessWinterGame.prototype.initLevelQuests = function(realmIndex, stageNum, levelInStage) {
    const mq = this.gameState.mainQuest;
    mq.currentRealm = realmIndex;
    mq.currentStage = stageNum;
    mq.currentLevel = levelInStage;
    mq.currentLevelQuestIndex = 0;

    const quests = this.getCurrentLevelQuests();
    if (quests.length > 0) {
        const firstQuest = quests[0];
        mq.questData[firstQuest.id] = {
            objectives: firstQuest.objectives.map(o => {
                let currentVal;
                if (o.type === 'visit_map' || o.type === 'kill_boss') {
                    currentVal = false;
                } else if (o.type === 'reach_level') {
                    currentVal = this.gameState.player.realm?.currentLevel || 1;
                } else if (o.type === 'reach_stage') {
                    currentVal = this.gameState.player.realm?.currentStage || 1;
                } else {
                    currentVal = 0;
                }
                return { ...o, current: currentVal };
            }),
            completed: false
        };
    }

    // 检查阶段转换剧情
    this.checkStageTransitionStory(realmIndex, stageNum, levelInStage);

    this.updateMainQuestUI();
    this.saveGameState();
};

/**
 * 检查并触发阶段转换剧情
 */
EndlessWinterGame.prototype.checkStageTransitionStory = function(realmIndex, stageNum, levelInStage) {
    // 仅在阶段转换点 (stage 4/7/10) 的第1级触发
    if (levelInStage === 1 && [4, 7, 10].includes(stageNum)) {
        const sceneId = `r${realmIndex}_stage_${stageNum}_start`;
        const scene = this.metadata.storyScenes?.scenes?.[sceneId];
        if (scene) {
            setTimeout(() => this.triggerStory(sceneId), 500);
        }
    }
};

/**
 * 显示日志叙事文字
 * @param {string} templateType - 模板类型
 * @param {number} realmIndex - 境界索引
 * @param {number} stageNum - 阶段编号
 */
EndlessWinterGame.prototype.showNarrativeLog = function(templateType, realmIndex, stageNum) {
    const config = this.metadata.questTemplateConfig;
    const templates = config.narrativeTemplates[templateType];
    if (!templates || templates.length === 0) return;

    // 随机选取一条
    const text = templates[Math.floor(Math.random() * templates.length)];
    const theme = config.realmThemes[realmIndex];
    const stageConfig = this.metadata.realmConfig[realmIndex].stages[stageNum - 1];
    const stageDisplay = `${theme.name}${stageConfig.name}`;

    // 构建下一个目标描述
    let nextGoal = '';
    if (stageNum < 4) nextGoal = '武者中期';
    else if (stageNum < 7) nextGoal = '修炼后期';
    else if (stageNum < 10) nextGoal = '境界巅峰';
    else nextGoal = '下一个境界';

    // 选取一个地图名
    const mapName = config.mapNames[theme.maps[0]] || theme.maps[0];

    // 变量替换
    const narrative = text
        .replace(/\{stageName\}/g, stageDisplay)
        .replace(/\{mapName\}/g, mapName)
        .replace(/\{realmName\}/g, theme.name)
        .replace(/\{companion\}/g, theme.companion)
        .replace(/\{realmGoal\}/g, theme.realmGoal)
        .replace(/\{nextGoal\}/g, nextGoal);

    this.addBattleLog(`📜 ${narrative}`);
};

// ========== 主线任务核心逻辑 ==========

/**
 * 初始化主线任务（新玩家/境界突破后调用）
 * @param {number} realmIndex - 境界索引 (0-5)
 */
EndlessWinterGame.prototype.initMainQuest = function(realmIndex) {
    const realm = this.gameState.player.realm;
    const stageNum = realm?.currentStage || 1;
    const levelInStage = realm?.currentLevel || 1;

    this.initLevelQuests(realmIndex, stageNum, levelInStage);

    // 触发卷章开篇剧情
    this.triggerStory(realmIndex + '_chapter_start');
};

/**
 * 统一进度追踪入口 — 被各钩子调用
 * @param {string} eventType - 事件类型
 * @param {object} eventData - 事件数据
 */
EndlessWinterGame.prototype.trackMainQuestProgress = function(eventType, eventData) {
    const questState = this.getCurrentQuestState();
    if (!questState || questState.completed) return;

    const questDef = this.getCurrentQuestDef();
    if (!questDef) return;

    let changed = false;

    for (const objective of questState.objectives) {
        // 跳过已完成的目标
        if (objective.current === true || objective.current >= objective.target) continue;

        switch (objective.type) {
            case 'kill':
                if (eventType === 'enemy_killed') {
                    // 如果有 subType 限制，检查是否匹配
                    if (!objective.subType || eventData.type === objective.subType) {
                        objective.current = (objective.current || 0) + 1;
                        changed = true;
                    }
                }
                break;

            case 'kill_boss':
                if (eventType === 'enemy_killed' && eventData.isBoss) {
                    // 检查 Boss 名称是否匹配
                    if (eventData.name && eventData.name.includes(objective.targetBoss)) {
                        objective.current = true;
                        changed = true;
                    }
                }
                break;

            case 'collect':
                if (eventType === 'resource_collected' && eventData.resource === objective.resource) {
                    objective.current = Math.min(
                        (objective.current || 0) + eventData.amount,
                        objective.target
                    );
                    changed = true;
                }
                break;

            case 'visit_map':
                if (eventType === 'map_visited' && eventData.mapType === objective.targetMap) {
                    objective.current = true;
                    changed = true;
                }
                break;

            case 'reach_level':
                // 同步当前阶段内等级
                {
                    const currentLevel = this.gameState.player.realm?.currentLevel || 1;
                    if (currentLevel !== objective.current) {
                        objective.current = Math.min(currentLevel, objective.target);
                        changed = true;
                    }
                }
                break;

            case 'reach_stage':
                // 同步当前阶段数
                {
                    const currentStage = this.gameState.player.realm?.currentStage || 1;
                    if (currentStage !== objective.current) {
                        objective.current = Math.min(currentStage, objective.target);
                        changed = true;
                    }
                }
                break;
        }
    }

    if (changed) {
        // 检查所有目标是否完成
        const allComplete = questState.objectives.every(o =>
            o.current === true || o.current >= o.target
        );

        if (allComplete) {
            questState.completed = true;
            this.onMainQuestComplete(questDef);
        }

        this.updateMainQuestUI();
        this.saveGameState();
    }
};

/**
 * 任务完成处理
 * @param {object} questDef - 任务定义
 */
EndlessWinterGame.prototype.onMainQuestComplete = function(questDef) {
    const mq = this.gameState.mainQuest;

    // 1. 记录已完成
    if (!mq.completedQuests.includes(questDef.id)) {
        mq.completedQuests.push(questDef.id);
    }

    // 2. 发放奖励
    this.grantQuestRewards(questDef);

    // 3. 显示完成弹窗 + 战斗日志
    this.addBattleLog(`✨ 主线任务【${questDef.name}】已完成！`);
    this.showQuestCompletePopup(questDef);

    // 4. 触发剧情 / 日志叙事
    if (questDef.isMilestone && questDef.storyTrigger) {
        // 里程碑任务: 完整剧情弹窗
        setTimeout(() => {
            this.triggerStory(questDef.storyTrigger);
        }, 1500);
    } else if (questDef.templateTypeKey) {
        // 普通任务: 日志叙事
        const templateType = questDef.templateTypeKey;
        this.showNarrativeLog(templateType, questDef.realm || mq.currentRealm, questDef.stage || mq.currentStage);
    }

    // 5. 检查是否是境界最终任务
    if (questDef.isFinalQuest) {
        // 境界最终 Boss 完成 → 触发境界最终剧情
        const realmFinalSceneId = `r${mq.currentRealm}_realm_final`;
        setTimeout(() => {
            const scene = this.metadata.storyScenes?.scenes?.[realmFinalSceneId];
            if (scene) {
                this.triggerStory(realmFinalSceneId);
            }
        }, 3000);

        // 通知玩家可以突破
        this.onRealmQuestLineComplete();
        return;
    }

    // 6. 检查本等级是否还有下一个任务
    const currentQuests = this.getCurrentLevelQuests();
    if (mq.currentLevelQuestIndex < currentQuests.length - 1) {
        // 激活下一个任务
        mq.currentLevelQuestIndex++;
        const nextQuest = currentQuests[mq.currentLevelQuestIndex];

        mq.questData[nextQuest.id] = {
            objectives: nextQuest.objectives.map(o => {
                let currentVal;
                if (o.type === 'visit_map' || o.type === 'kill_boss') {
                    currentVal = false;
                } else if (o.type === 'reach_level') {
                    currentVal = this.gameState.player.realm?.currentLevel || 1;
                } else if (o.type === 'reach_stage') {
                    currentVal = this.gameState.player.realm?.currentStage || 1;
                } else {
                    currentVal = 0;
                }
                return { ...o, current: currentVal };
            }),
            completed: false
        };
        this.updateMainQuestUI();
    } else {
        // 本等级任务全部完成，等待升级
        this.addBattleLog(`📚 当前等级任务已全部完成，继续修炼升级以解锁新任务！`);
    }
};

/**
 * 奖励发放
 * @param {object} questDef - 任务定义
 */
EndlessWinterGame.prototype.grantQuestRewards = function(questDef) {
    const rewards = questDef.rewards;
    if (!rewards) return;

    // 经验奖励
    if (rewards.exp) {
        this.gameState.player.exp += rewards.exp;
    }

    // 金币（灵石）奖励
    if (rewards.gold) {
        this.gameState.resources.gold = (this.gameState.resources.gold || 0) + rewards.gold;
    }

    // 技能点奖励
    if (rewards.skillPoints) {
        this.gameState.player.skillPoints = (this.gameState.player.skillPoints || 0) + rewards.skillPoints;
    }

    // 装备奖励
    if (questDef.rewardItems && this.equipmentSystem) {
        for (const item of questDef.rewardItems) {
            if (item.type === 'equipment') {
                try {
                    this.equipmentSystem.generateAndAddEquipment(item.slot, item.rarity);
                } catch (e) {
                    console.warn('生成装备奖励失败:', e);
                }
            }
        }
    }

    // 更新 UI 和检查升级
    this.updateUI();
    this.checkLevelUp();
};

/**
 * 境界任务线完成 → 通知玩家可以突破（不自动突破）
 */
EndlessWinterGame.prototype.onRealmQuestLineComplete = function() {
    const currentRealm = this.gameState.mainQuest.currentRealm;

    if (currentRealm >= 5) {
        // 最后一境 → 飞升结局（已经在 final_ascending 剧情中处理）
        return;
    }

    // 弹出通知：提示玩家去突破
    const nextRealmName = this.metadata.realmConfig[currentRealm + 1]?.name || '下一境界';
    this.addBattleLog(`🌟 主线任务线已完成！你现在可以尝试突破到【${nextRealmName}境】了！`);
    this.showBreakthroughNotification(nextRealmName);
};

/**
 * 显示突破提示通知
 * @param {string} nextRealmName - 下一境界名称
 */
EndlessWinterGame.prototype.showBreakthroughNotification = function(nextRealmName) {
    const notification = document.getElementById('breakthrough-notification');
    const realmNameEl = document.getElementById('next-realm-name');

    if (notification && realmNameEl) {
        realmNameEl.textContent = nextRealmName;
        notification.classList.remove('hidden');

        // 5秒后自动隐藏
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }
};

/**
 * 获取当前任务状态
 * @returns {object|null} 任务状态
 */
EndlessWinterGame.prototype.getCurrentQuestState = function() {
    const questDef = this.getCurrentQuestDef();
    if (!questDef) return null;

    return this.gameState.mainQuest.questData[questDef.id] || null;
};

/**
 * 获取当前任务定义
 * @returns {object|null} 任务定义
 */
EndlessWinterGame.prototype.getCurrentQuestDef = function() {
    const mq = this.gameState.mainQuest;
    const currentQuests = this.getCurrentLevelQuests();

    if (!currentQuests || mq.currentLevelQuestIndex >= currentQuests.length) return null;
    return currentQuests[mq.currentLevelQuestIndex];
};

// ========== 剧情系统 ==========

/**
 * 触发剧情播放
 * @param {string} sceneId - 场景 ID
 */
EndlessWinterGame.prototype.triggerStory = function(sceneId) {
    // 如果正在播放其他剧情，跳过
    if (this.gameState.mainStory.currentScene) return;

    const scene = this.metadata.storyScenes?.scenes?.[sceneId];
    if (!scene) return;

    // 标记为正在播放
    this.gameState.mainStory.currentScene = sceneId;
    this.storyPageIndex = 0;

    // 显示剧情覆盖层
    this.showStoryOverlay(scene, 0);
};

/**
 * 显示剧情覆盖层
 * @param {object} scene - 场景数据
 * @param {number} pageIndex - 页面索引
 */
EndlessWinterGame.prototype.showStoryOverlay = function(scene, pageIndex) {
    const overlay = document.getElementById('story-overlay');
    const titleEl = document.getElementById('story-chapter-title');
    const speakerEl = document.getElementById('story-speaker');
    const textEl = document.getElementById('story-text');
    const indicatorEl = document.getElementById('story-page-indicator');

    if (!overlay || !scene.pages[pageIndex]) return;

    const page = scene.pages[pageIndex];

    // 显示覆盖层
    overlay.classList.remove('hidden');

    // 设置标题
    if (titleEl) {
        titleEl.textContent = scene.title || '';
    }

    // 设置说话人
    if (speakerEl) {
        speakerEl.textContent = page.speaker || '';
    }

    // 打字机效果显示文本
    if (textEl) {
        this.typewriterEffect(textEl, page.text, 25);
    }

    // 设置页码
    if (indicatorEl) {
        indicatorEl.textContent = `${pageIndex + 1} / ${scene.pages.length}`;
    }

    // 存储当前索引
    this.storyPageIndex = pageIndex;
};

/**
 * 剧情页面切换
 */
EndlessWinterGame.prototype.nextStoryPage = function() {
    const sceneId = this.gameState.mainStory.currentScene;
    if (!sceneId) return;

    const scene = this.metadata.storyScenes?.scenes?.[sceneId];
    if (!scene) return;

    const nextIndex = (this.storyPageIndex || 0) + 1;

    if (nextIndex >= scene.pages.length) {
        // 剧情结束
        this.closeStoryOverlay();

        // 记录已观看
        if (!this.gameState.mainStory.viewedScenes.includes(sceneId)) {
            this.gameState.mainStory.viewedScenes.push(sceneId);
        }

        this.gameState.mainStory.currentScene = null;
        this.saveGameState();
    } else {
        this.showStoryOverlay(scene, nextIndex);
    }
};

/**
 * 关闭剧情覆盖层
 */
EndlessWinterGame.prototype.closeStoryOverlay = function() {
    const overlay = document.getElementById('story-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }

    // 清除打字机定时器
    if (this.typewriterTimer) {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
    }
};

/**
 * 打字机效果
 * @param {HTMLElement} element - 目标元素
 * @param {string} text - 要显示的文本
 * @param {number} speed - 打字速度（毫秒）
 */
EndlessWinterGame.prototype.typewriterEffect = function(element, text, speed = 30) {
    // 清除之前的定时器
    if (this.typewriterTimer) {
        clearInterval(this.typewriterTimer);
    }

    let i = 0;
    element.textContent = '';

    this.typewriterTimer = setInterval(() => {
        if (i < text.length) {
            element.textContent += text[i];
            i++;
        } else {
            clearInterval(this.typewriterTimer);
            this.typewriterTimer = null;
        }
    }, speed);
};

// ========== 剧情回顾 ==========

/**
 * 显示剧情回顾列表
 */
EndlessWinterGame.prototype.showStoryReview = function() {
    const container = document.getElementById('quest-tab-story-content');
    if (!container) return;

    const viewedScenes = this.gameState.mainStory.viewedScenes || [];

    // 按章节分组
    const chapters = {};
    for (const sceneId of viewedScenes) {
        const scene = this.metadata.storyScenes?.scenes?.[sceneId];
        if (scene) {
            const chapter = scene.chapter || 0;
            if (!chapters[chapter]) chapters[chapter] = [];
            chapters[chapter].push({ id: sceneId, ...scene });
        }
    }

    // 生成 HTML
    let html = '';
    const realmNames = ['武者卷', '炼气卷', '筑基卷', '金丹卷', '元婴卷', '化神卷'];

    for (let i = 0; i <= 5; i++) {
        const scenes = chapters[i] || [];
        if (scenes.length === 0) continue;

        html += `
            <div class="mb-4">
                <div class="text-gold font-bold mb-2">${realmNames[i]}</div>
                <div class="space-y-2">
                    ${scenes.map(s => `
                        <button class="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/80 transition-colors flex items-center justify-between" onclick="game.replayStory('${s.id}')">
                            <span>${s.title}</span>
                            <i class="fa fa-play text-gold/60"></i>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (html === '') {
        html = '<div class="text-white/50 text-center py-8">暂无已解锁的剧情</div>';
    }

    container.innerHTML = html;
};

/**
 * 重播剧情
 * @param {string} sceneId - 场景 ID
 */
EndlessWinterGame.prototype.replayStory = function(sceneId) {
    const scene = this.metadata.storyScenes?.scenes?.[sceneId];
    if (!scene) return;

    // 关闭任务面板
    const modal = document.getElementById('main-quest-modal');
    if (modal) modal.classList.add('hidden');

    // 延迟播放
    setTimeout(() => {
        this.gameState.mainStory.currentScene = sceneId;
        this.storyPageIndex = 0;
        this.showStoryOverlay(scene, 0);
    }, 300);
};

// ========== UI 辅助方法 ==========

/**
 * 获取当前境界的阶段显示名称
 * @param {number} stageNum - 阶段编号 (1-10)，不传则取玩家当前阶段
 * @returns {string} 如 "武者初期一阶"
 */
EndlessWinterGame.prototype.getStageDisplay = function(stageNum) {
    const realmIndex = this.gameState.mainQuest.currentRealm;
    const realmNames = ['武者', '炼气', '筑基', '金丹', '元婴', '化神'];
    const realm = this.metadata.realmConfig[realmIndex];
    if (!realm) return '';

    const st = stageNum || (this.gameState.player.realm?.currentStage || 1);
    const stage = realm.stages[st - 1];
    if (!stage) return `${realmNames[realmIndex]}第${st}阶`;
    return `${realmNames[realmIndex]}${stage.name}${st}阶`;
};

/**
 * 获取阶段的简短名称（不含境界前缀）
 * @param {number} stageNum - 阶段编号 (1-10)
 * @returns {string} 如 "初期一阶"
 */
EndlessWinterGame.prototype.getStageShortName = function(stageNum) {
    const realmIndex = this.gameState.mainQuest.currentRealm;
    const realm = this.metadata.realmConfig[realmIndex];
    if (!realm) return '';
    const stage = realm.stages[stageNum - 1];
    if (!stage) return `第${stageNum}阶`;
    return `${stage.name}${stageNum}阶`;
};

// ========== UI 渲染 ==========

/**
 * 更新主线任务 UI
 */
EndlessWinterGame.prototype.updateMainQuestUI = function() {
    const mq = this.gameState.mainQuest;
    const questDef = this.getCurrentQuestDef();
    const questState = this.getCurrentQuestState();

    // 更新红点提示
    const badge = document.getElementById('main-quest-badge');
    if (badge) {
        if (questState && !questState.completed) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    // 更新任务面板内容
    const contentEl = document.getElementById('quest-tab-current-content');
    if (!contentEl) return;

    if (!questDef || !questState) {
        contentEl.innerHTML = '<div class="text-white/50 text-center py-8">暂无主线任务</div>';
        return;
    }

    // 境界名称
    const realmNames = ['武者', '炼气', '筑基', '金丹', '元婴', '化神'];
    const currentRealm = mq.currentRealm;
    const realmName = realmNames[currentRealm] || '未知';
    const currentStage = mq.currentStage;
    const currentLevel = mq.currentLevel;

    // 获取阶段信息
    const stageConfig = this.metadata.realmConfig[currentRealm]?.stages[currentStage - 1];
    const levelCap = stageConfig?.levelCap || 10;
    const stageLabel = stageConfig?.name || '';
    const stageDisplay = `${realmName}${stageLabel}`;

    // 当前等级任务索引
    const currentQuests = this.getCurrentLevelQuests();
    const questInLevel = mq.currentLevelQuestIndex + 1;
    const totalQuestsInLevel = currentQuests.length;

    // 生成目标列表 HTML
    let objectivesHtml = '';
    for (let i = 0; i < questDef.objectives.length; i++) {
        const obj = questDef.objectives[i];
        const state = questState.objectives[i];
        const current = state?.current || 0;
        const target = obj.target;
        const isComplete = current === true || current >= target;

        let progressText = '';
        let progressPercent = 0;

        if (obj.type === 'kill') {
            progressText = `击败 ${current}/${target} 个${obj.subType === 'elite' ? '精英' : obj.subType === 'boss' ? 'Boss' : '怪物'}`;
            progressPercent = Math.min(100, (current / target) * 100);
        } else if (obj.type === 'kill_boss') {
            progressText = current ? `已击败 ${obj.targetBoss}` : `击败 ${obj.targetBoss}`;
            progressPercent = current ? 100 : 0;
        } else if (obj.type === 'collect') {
            progressText = `收集 ${current}/${target} ${obj.resource === 'spiritWood' ? '灵木' : obj.resource === 'blackIron' ? '玄铁' : '灵石'}`;
            progressPercent = Math.min(100, (current / target) * 100);
        } else if (obj.type === 'visit_map') {
            const mapNames = {
                'xianxia-mountain': '山峰',
                'xianxia-beach': '海滩',
                'xianxia-plains': '平原',
                'xianxia-canyon': '峡谷',
                'xianxia-desert': '沙漠',
                'xianxia-lake': '湖泊',
                'xianxia-forest': '森林',
                'xianxia-volcano': '火山',
                'xianxia-cave': '洞穴',
                'xianxia-heaven': '仙境'
            };
            progressText = current ? `已到达 ${mapNames[obj.targetMap] || obj.targetMap}` : `前往 ${mapNames[obj.targetMap] || obj.targetMap}`;
            progressPercent = current ? 100 : 0;
        } else if (obj.type === 'reach_level') {
            const currentLevel = this.gameState.player.realm?.currentLevel || 1;
            const stageLabel = this.getStageDisplay();
            progressText = currentLevel >= target ? `${stageLabel} 已达到 ${target} 级` : `${stageLabel} 达到 ${target} 级 (当前: ${currentLevel}级)`;
            progressPercent = Math.min(100, (currentLevel / target) * 100);
        } else if (obj.type === 'reach_stage') {
            const currentStage = this.gameState.player.realm?.currentStage || 1;
            const targetLabel = this.getStageDisplay(target);
            const currentLabel = this.getStageDisplay(currentStage);
            progressText = currentStage >= target ? `已突破到 ${targetLabel}` : `突破到 ${targetLabel} (当前: ${currentLabel})`;
            progressPercent = Math.min(100, (currentStage / target) * 100);
        }

        objectivesHtml += `
            <div class="flex items-center gap-3 ${isComplete ? 'opacity-60' : ''}">
                <div class="w-5 h-5 rounded-full flex items-center justify-center ${isComplete ? 'bg-green-500' : 'bg-white/20'}">
                    ${isComplete ? '<i class="fa fa-check text-white text-xs"></i>' : ''}
                </div>
                <div class="flex-1">
                    <div class="text-sm ${isComplete ? 'line-through text-white/50' : 'text-white/90'}">${progressText}</div>
                    ${!isComplete && progressPercent > 0 ? `<div class="h-1 bg-white/10 rounded-full mt-1 overflow-hidden"><div class="h-full bg-gold rounded-full transition-all" style="width: ${progressPercent}%"></div></div>` : ''}
                </div>
            </div>
        `;
    }

    // 生成奖励预览 HTML
    let rewardsHtml = '';
    const rewards = questDef.rewards || {};
    if (rewards.exp) rewardsHtml += `<span class="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">+${rewards.exp} 经验</span>`;
    if (rewards.gold) rewardsHtml += `<span class="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">+${rewards.gold} 灵石</span>`;
    if (rewards.skillPoints) rewardsHtml += `<span class="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">+${rewards.skillPoints} 技能点</span>`;

    // 等级内任务进度条
    let levelQuestProgressHtml = '';
    if (totalQuestsInLevel > 1) {
        levelQuestProgressHtml = `
            <div class="mt-3 flex gap-1">
                ${currentQuests.map((q, i) => {
                    const isDone = i < mq.currentLevelQuestIndex;
                    const isActive = i === mq.currentLevelQuestIndex;
                    return `<div class="flex-1 h-1.5 rounded-full ${isDone ? 'bg-green-500' : isActive ? 'bg-gold' : 'bg-white/20'}"></div>`;
                }).join('')}
            </div>
        `;
    }

    contentEl.innerHTML = `
        <!-- 进度概览 -->
        <div class="text-sm text-gold/80 mb-1">
            第${currentRealm + 1}卷 · ${realmName}之路
        </div>
        <div class="text-xs text-white/50 mb-3">
            ${stageDisplay} · 第${currentStage}阶 · Lv.${currentLevel}/${levelCap}
            <span class="ml-2">任务 ${questInLevel}/${totalQuestsInLevel}</span>
        </div>

        <!-- 当前任务卡片 -->
        <div class="bg-white/5 rounded-xl p-4 border border-gold/20">
            <h3 class="text-lg font-bold text-gold mb-2">${questDef.name}</h3>
            <p class="text-sm text-white/70 mb-4">${questDef.description}</p>

            <!-- 目标列表 -->
            <div class="space-y-3 mb-4">
                ${objectivesHtml}
            </div>

            ${levelQuestProgressHtml}

            <!-- 奖励预览 -->
            ${rewardsHtml ? `<div class="flex flex-wrap gap-2 pt-3 border-t border-white/10">${rewardsHtml}</div>` : ''}
        </div>

        <!-- 已完成任务 -->
        <div class="mt-4">
            <button id="toggle-completed-quests" class="text-sm text-white/50 hover:text-white/80 flex items-center gap-2">
                <i class="fa fa-chevron-right text-xs transition-transform"></i>
                已完成任务 (${mq.completedQuests.length})
            </button>
            <div id="completed-quests-list" class="hidden mt-2 space-y-1 max-h-40 overflow-y-auto">
                ${mq.completedQuests.map(id => {
                    // 从缓存中查找任务名称
                    let name = id;
                    // 从缓存中查找
                    if (mq.generatedCache) {
                        for (const key in mq.generatedCache) {
                            const cached = mq.generatedCache[key];
                            const found = cached.find(q => q.id === id);
                            if (found) { name = found.name; break; }
                        }
                    }
                    // 从旧静态数据中查找 (兼容)
                    if (name === id) {
                        for (let r = 0; r <= 5; r++) {
                            const quests = this.metadata.mainStoryQuests[r] || [];
                            const q = quests.find(q => q.id === id);
                            if (q) { name = q.name; break; }
                        }
                    }
                    return `<div class="text-sm text-white/40 flex items-center gap-2"><i class="fa fa-check text-green-500"></i>${name}</div>`;
                }).join('')}
            </div>
        </div>
    `;

    // 绑定已完成任务列表切换
    const toggleBtn = document.getElementById('toggle-completed-quests');
    const completedList = document.getElementById('completed-quests-list');
    if (toggleBtn && completedList) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = completedList.classList.contains('hidden');
            completedList.classList.toggle('hidden');
            toggleBtn.querySelector('i').style.transform = isHidden ? 'rotate(90deg)' : '';
        });
    }
};

/**
 * 显示主线任务面板
 */
EndlessWinterGame.prototype.showMainQuestPanel = function() {
    const modal = document.getElementById('main-quest-modal');
    if (modal) {
        modal.classList.remove('hidden');
        this.updateMainQuestUI();
        this.showStoryReview();
    }
};

/**
 * 隐藏主线任务面板
 */
EndlessWinterGame.prototype.hideMainQuestPanel = function() {
    const modal = document.getElementById('main-quest-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

/**
 * 显示任务完成弹窗
 * @param {object} questDef - 任务定义
 */
EndlessWinterGame.prototype.showQuestCompletePopup = function(questDef) {
    const popup = document.getElementById('quest-complete-popup');
    const titleEl = document.getElementById('quest-complete-title');
    const rewardsEl = document.getElementById('quest-complete-rewards');

    if (!popup || !titleEl || !rewardsEl) return;

    // 设置标题
    titleEl.textContent = `✨ ${questDef.name} 完成！`;

    // 设置奖励列表
    const rewards = questDef.rewards || {};
    let rewardsHtml = '';

    if (rewards.exp) {
        rewardsHtml += `<div class="flex items-center gap-2 text-blue-300"><i class="fa fa-star"></i> 经验 +${rewards.exp}</div>`;
    }
    if (rewards.gold) {
        rewardsHtml += `<div class="flex items-center gap-2 text-yellow-300"><i class="fa fa-coins"></i> 灵石 +${rewards.gold}</div>`;
    }
    if (rewards.skillPoints) {
        rewardsHtml += `<div class="flex items-center gap-2 text-purple-300"><i class="fa fa-bolt"></i> 技能点 +${rewards.skillPoints}</div>`;
    }
    if (questDef.rewardItems) {
        for (const item of questDef.rewardItems) {
            if (item.type === 'equipment') {
                rewardsHtml += `<div class="flex items-center gap-2 text-green-300"><i class="fa fa-shield"></i> ${item.rarity === 'white' ? '普通' : item.rarity === 'blue' ? '稀有' : '史诗'}${this.game.metadata.equipmentSlotConfig?.[item.slot]?.name || '装备'}</div>`;
            }
        }
    }

    rewardsEl.innerHTML = rewardsHtml || '<div class="text-white/50">无奖励</div>';

    // 显示弹窗
    popup.classList.remove('hidden');

    // 3秒后自动隐藏
    setTimeout(() => {
        popup.classList.add('hidden');
    }, 3000);
};
