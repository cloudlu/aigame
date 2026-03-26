// mainQuest.js - 主线任务系统 + 剧情框架

class MainQuestSystem {
    constructor(game) {
        this.game = game;
        this.storyPageIndex = 0;
        this.typewriterTimer = null;

        // 任务缓存（运行时，不存储）
        this._questCache = {};
        // ID到名称的映射缓存（持久保存已完成任务的名称）
        this._questNameMap = {};

        // ✅ 构造函数中注册事件监听器（确保从存档加载时也能监听）
        this.registerEventListeners();
    }

    // ========== 任务模板生成引擎 ==========

    /**
     * 生成当前等级的主线任务 (2个任务/级)
     */
    generateQuestForLevel(realmIndex, stageNum, levelInStage) {
        const templates = this.selectQuestTemplates(realmIndex, stageNum, levelInStage);
        const quests = [];

        for (let i = 0; i < templates.length; i++) {
            const questId = `r${realmIndex}_s${stageNum}_l${levelInStage}_q${i + 1}`;
            const quest = this.generateQuestFromTemplate(templates[i], questId, realmIndex, stageNum, levelInStage, i);
            quests.push(quest);
        }

        return quests;
    }

    /**
     * 根据分配规则选择当前等级的任务模板
     */
    selectQuestTemplates(realmIndex, stageNum, levelInStage) {
        const config = this.game.metadata.questTemplateConfig;
        const theme = config.realmThemes[realmIndex];
        const realmStages = this.game.metadata.realmConfig[realmIndex].stages;
        const levelCap = realmStages[stageNum - 1].levelCap;
        const isStageLastLevel = (levelInStage === levelCap);
        const isBossLevel = (levelInStage % 5 === 0);
        const isStageStart = (levelInStage === 1);
        const isStageTransition = [4, 7, 10].includes(stageNum) && isStageStart;

        if (stageNum === 10 && isStageLastLevel) {
            return ['kill_boss', 'kill_elite'];
        }

        if (isBossLevel && !isStageLastLevel) {
            return ['kill_boss', 'kill_elite'];
        }

        if (isStageStart && !isStageTransition) {
            return ['visit_map', 'kill_normal'];
        }

        if (levelInStage % 2 === 1) {
            const resource = this.selectCollectResource(realmIndex, stageNum, levelInStage);
            return ['kill_normal', resource];
        }

        const resource = this.selectCollectResource(realmIndex, stageNum, levelInStage);
        return ['kill_elite', resource];
    }

    /**
     * 选择收集资源类型 - 改为选择副本任务
     */
    selectCollectResource(realmIndex, stageNum, levelInStage) {
        // 3个副本轮换
        const dungeons = ['dungeon_stone', 'dungeon_herb', 'dungeon_iron'];
        return dungeons[levelInStage % 3];
    }

    /**
     * 根据模板生成单个任务
     */
    generateQuestFromTemplate(templateType, questId, realmIndex, stageNum, levelInStage, questIndex) {
        const config = this.game.metadata.questTemplateConfig;
        const theme = config.realmThemes[realmIndex];
        const stageMult = config.stageMultiplier[stageNum - 1];
        const realmMult = config.realmMultiplier[realmIndex];
        const base = config.scalingBase;

        const realmName = theme.name;
        const stageConfig = this.game.metadata.realmConfig[realmIndex].stages[stageNum - 1];
        const stageLabel = stageConfig.name;
        const stageDisplay = `${realmName}${stageLabel}`;

        let objectives = [];
        let name = '';
        let description = '';
        let isMilestone = false;
        let storyTrigger = null;
        let templateTypeKey = templateType;

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
            case 'collect_herbs':
            case 'dungeon_herb': {
                objectives = [{ type: 'dungeon', dungeonId: 'herb_garden', difficulty: 'easy' }];
                name = `${stageDisplay}·灵草园通关`;
                description = `通关灵草园副本`;
                templateTypeKey = 'dungeon';
                break;
            }
            case 'collect_iron':
            case 'dungeon_iron': {
                objectives = [{ type: 'dungeon', dungeonId: 'iron_mine', difficulty: 'easy' }];
                name = `${stageDisplay}·玄铁矿通关`;
                description = `通关玄铁矿副本`;
                templateTypeKey = 'dungeon';
                break;
            }
            case 'collect_spiritStones':
            case 'collect_stones':
            case 'dungeon_stone': {
                objectives = [{ type: 'dungeon', dungeonId: 'spirit_stone_mine', difficulty: 'easy' }];
                name = `${stageDisplay}·灵石矿脉通关`;
                description = `通关灵石矿脉副本`;
                templateTypeKey = 'dungeon';
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

        const isBossMilestone = (levelInStage % 5 === 0);
        const expReward = Math.floor(base.baseExp * stageMult * realmMult * (1 + levelInStage * 0.1));
        const spiritStonesReward = Math.floor(base.baseGold * stageMult * realmMult * (1 + levelInStage * 0.12));

        let rewards = { exp: expReward, spiritStones: spiritStonesReward };

        if (isBossMilestone || templateType === 'kill_boss') {
            rewards.skillPoints = Math.max(1, Math.ceil(stageNum * 0.3));
        }

        const realmStages = this.game.metadata.realmConfig[realmIndex].stages;
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
    }

    /**
     * 按境界阶段选取 Boss 名
     */
    generateBossName(realmIndex, stageNum, levelInStage) {
        const theme = this.game.metadata.questTemplateConfig.realmThemes[realmIndex];
        const pool = theme.bossPool;

        if (stageNum === 10) {
            const realmStages = this.game.metadata.realmConfig[realmIndex].stages;
            const levelCap = realmStages[9].levelCap;
            if (levelInStage === levelCap) {
                return pool[pool.length - 1];
            }
        }

        const bossIndex = Math.floor((levelInStage - 1) / 5) % pool.length;
        return pool[bossIndex];
    }

    /**
     * 获取/缓存当前等级的任务
     */
    getCurrentLevelQuests() {
        const mq = this.game.persistentState.mainQuest;
        const levelKey = `r${mq.currentRealm}_s${mq.currentStage}_l${mq.currentLevel}`;

        // 使用内存缓存（不存储到存档）
        if (this._questCache[levelKey]) {
            return this._questCache[levelKey];
        }

        const quests = this.generateQuestForLevel(mq.currentRealm, mq.currentStage, mq.currentLevel);

        // 缓存到内存
        this._questCache[levelKey] = quests;
        // 同时缓存 ID→名称 映射，用于显示已完成任务
        quests.forEach(q => {
            this._questNameMap[q.id] = q.name;
        });
        return quests;
    }

    /**
     * 初始化当前等级的任务
     */
    initLevelQuests(realmIndex, stageNum, levelInStage) {
        const mq = this.game.persistentState.mainQuest;
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
                    if (o.type === 'visit_map' || o.type === 'kill_boss' || o.type === 'dungeon') {
                        currentVal = false;
                    } else if (o.type === 'reach_level') {
                        currentVal = this.game.persistentState.player.realm?.currentLevel || 1;
                    } else if (o.type === 'reach_stage') {
                        currentVal = this.game.persistentState.player.realm?.currentStage || 1;
                    } else {
                        currentVal = 0;
                    }
                    return { ...o, current: currentVal };
                }),
                completed: false
            };
        }

        this.checkStageTransitionStory(realmIndex, stageNum, levelInStage);

        this.updateMainQuestUI();
        this.game.saveGameState();
    }

    /**
     * 检查并触发阶段转换剧情
     */
    checkStageTransitionStory(realmIndex, stageNum, levelInStage) {
        if (levelInStage === 1 && [4, 7, 10].includes(stageNum)) {
            const sceneId = `r${realmIndex}_stage_${stageNum}_start`;
            const scene = this.game.metadata.storyScenes?.scenes?.[sceneId];
            if (scene) {
                setTimeout(() => this.triggerStory(sceneId), 500);
            }
        }
    }

    /**
     * 显示日志叙事文字
     */
    showNarrativeLog(templateType, realmIndex, stageNum) {
        const config = this.game.metadata.questTemplateConfig;
        const templates = config.narrativeTemplates[templateType];
        if (!templates || templates.length === 0) return;

        const text = templates[Math.floor(Math.random() * templates.length)];
        const theme = config.realmThemes[realmIndex];
        const stageConfig = this.game.metadata.realmConfig[realmIndex].stages[stageNum - 1];
        const stageDisplay = `${theme.name}${stageConfig.name}`;

        let nextGoal = '';
        if (stageNum < 4) nextGoal = '武者中期';
        else if (stageNum < 7) nextGoal = '修炼后期';
        else if (stageNum < 10) nextGoal = '境界巅峰';
        else nextGoal = '下一个境界';

        const mapName = config.mapNames[theme.maps[0]] || theme.maps[0];

        const narrative = text
            .replace(/\{stageName\}/g, stageDisplay)
            .replace(/\{mapName\}/g, mapName)
            .replace(/\{realmName\}/g, theme.name)
            .replace(/\{companion\}/g, theme.companion)
            .replace(/\{realmGoal\}/g, theme.realmGoal)
            .replace(/\{nextGoal\}/g, nextGoal);

        this.game.addBattleLog(`📜 ${narrative}`);
    }

    // ========== 主线任务核心逻辑 ==========

    /**
     * 初始化主线任务（新玩家/境界突破后调用）
     */
    /**
     * 初始化主线任务
     */
    initMainQuest(realmIndex) {
        const realm = this.game.persistentState.player.realm;
        const stageNum = realm?.currentStage || 1;
        const levelInStage = realm?.currentLevel || 1;

        this.initLevelQuests(realmIndex, stageNum, levelInStage);

        this.triggerStory(realmIndex + '_chapter_start');

        // ✅ 注册事件监听器，自动追踪任务进度
        this.registerEventListeners();
    }

    /**
     * 注册事件监听器（自动追踪任务进度）
     */
    registerEventListeners() {
        if (typeof window === 'undefined' || !window.eventManager) {
            console.warn('[主线任务] eventManager未加载，跳过事件监听注册');
            return;
        }

        // 避免重复注册
        if (this._eventListenersRegistered) {
            console.log('[主线任务] 事件监听器已注册，跳过重复注册');
            return;
        }

        // 监听敌人击杀事件
        window.eventManager.on('battle:victory', (event) => {
            console.log('[主线任务] 收到战斗胜利事件:', event);
            if (event && event.data) {
                // 确定敌人类型
                let enemyType = 'normal';  // 默认是普通怪
                if (event.data.isBoss) {
                    enemyType = 'boss';
                } else if (event.data.isElite) {
                    enemyType = 'elite';
                }

                console.log('[主线任务] 敌人类型判定:', {
                    enemyName: event.data.enemy,
                    isBoss: event.data.isBoss,
                    isElite: event.data.isElite,
                    enemyType: enemyType
                });

                this.trackMainQuestProgress('enemy_killed', {
                    name: event.data.enemy,
                    type: enemyType,
                    isBoss: event.data.isBoss || false,
                    isElite: event.data.isElite || false
                });
            } else {
                console.warn('[主线任务] 战斗胜利事件数据无效:', event);
            }
        });

        // 监听副本完成事件（注意：事件名称为 dungeon:complete，追踪类型为 dungeon_completed）
        window.eventManager.on('dungeon:complete', (event) => {
            console.log('[主线任务] 收到副本完成事件:', event.data);
            if (event.data) {
                this.trackMainQuestProgress('dungeon_completed', {
                    dungeonId: event.data.dungeonId,
                    difficulty: event.data.difficulty
                });
            }
        });

        // 监听地图访问事件
        window.eventManager.on('map:visit', (event) => {
            if (event.data) {
                this.trackMainQuestProgress('map_visited', {
                    mapType: event.data.mapType
                });
            }
        });

        // 监听资源采集事件
        window.eventManager.on('resource:collect', (event) => {
            if (event.data) {
                this.trackMainQuestProgress('resource_collected', {
                    resource: event.data.resource,
                    amount: event.data.amount
                });
            }
        });

        this._eventListenersRegistered = true;
        console.log('✅ MainQuestSystem事件监听已注册');
    }

    /**
     * 统一进度追踪入口 — 被各钩子调用
     */
    trackMainQuestProgress(eventType, eventData) {
        const questState = this.getCurrentQuestState();
        if (!questState || questState.completed) {
            console.log('[主线任务] 无当前任务或任务已完成，跳过进度追踪');
            return;
        }

        const questDef = this.getCurrentQuestDef();
        if (!questDef) {
            console.log('[主线任务] 无法获取当前任务定义');
            return;
        }

        console.log('[主线任务] 追踪进度:', {
            eventType,
            eventData,
            questId: questDef.id,
            objectives: questState.objectives
        });

        let changed = false;

        for (const objective of questState.objectives) {
            if (objective.current === true || objective.current >= objective.target) continue;

            switch (objective.type) {
                case 'kill':
                    if (eventType === 'enemy_killed') {
                        if (!objective.subType || eventData.type === objective.subType) {
                            objective.current = (objective.current || 0) + 1;
                            changed = true;
                        }
                    }
                    break;

                case 'kill_boss':
                    if (eventType === 'enemy_killed' && eventData.isBoss) {
                        if (eventData.name && eventData.name.includes(objective.targetBoss)) {
                            objective.current = true;
                            changed = true;
                        }
                    }
                    break;

                case 'kill_elite':
                    if (eventType === 'enemy_killed' && eventData.isElite) {
                        if (!objective.subType || eventData.type === objective.subType) {
                            objective.current = (objective.current || 0) + 1;
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

                case 'dungeon':
                    if (eventType === 'dungeon_completed' && eventData.dungeonId === objective.dungeonId) {
                        console.log('[主线任务] 副本任务匹配:', {
                            dungeonId: eventData.dungeonId,
                            objectiveDungeonId: objective.dungeonId,
                            difficulty: eventData.difficulty,
                            objectiveDifficulty: objective.difficulty
                        });
                        if (!objective.difficulty || eventData.difficulty === objective.difficulty) {
                            objective.current = true;
                            changed = true;
                            console.log('[主线任务] 副本任务完成！');
                        }
                    }
                    break;

                case 'reach_level':
                    {
                        const currentLevel = this.game.persistentState.player.realm?.currentLevel || 1;
                        if (currentLevel !== objective.current) {
                            objective.current = Math.min(currentLevel, objective.target);
                            changed = true;
                        }
                    }
                    break;

                case 'reach_stage':
                    {
                        const currentStage = this.game.persistentState.player.realm?.currentStage || 1;
                        if (currentStage !== objective.current) {
                            objective.current = Math.min(currentStage, objective.target);
                            changed = true;
                        }
                    }
                    break;
            }
        }

        if (changed) {
            console.log('[主线任务] 进度已更新');
            this.updateMainQuestUI();

            // 检查任务是否完成
            if (this.isQuestComplete(questState)) {
                questState.completed = true;
                console.log('[主线任务] 任务已完成！');
                this.onMainQuestComplete(questDef);
            }

            this.game.saveGameState();
        }
    }

    /**
     * 检查任务是否完成
     */
    isQuestComplete(questState) {
        return questState.objectives.every(o =>
            o.current === true || o.current >= o.target
        );
    }

    /**
     * 任务完成处理
     */
    onMainQuestComplete(questDef) {
        const mq = this.game.persistentState.mainQuest;

        if (!mq.completedQuests.includes(questDef.id)) {
            mq.completedQuests.push(questDef.id);
        }

        this.grantQuestRewards(questDef);

        this.game.addBattleLog(`✨ 主线任务【${questDef.name}】已完成！`);
        this.showQuestCompletePopup(questDef);

        if (questDef.isMilestone && questDef.storyTrigger) {
            setTimeout(() => {
                this.triggerStory(questDef.storyTrigger);
            }, 1500);
        } else if (questDef.templateTypeKey) {
            const templateType = questDef.templateTypeKey;
            this.showNarrativeLog(templateType, questDef.realm || mq.currentRealm, questDef.stage || mq.currentStage);
        }

        if (questDef.isFinalQuest) {
            const realmFinalSceneId = `r${mq.currentRealm}_realm_final`;
            setTimeout(() => {
                const scene = this.game.metadata.storyScenes?.scenes?.[realmFinalSceneId];
                if (scene) {
                    this.triggerStory(realmFinalSceneId);
                }
            }, 3000);

            this.onRealmQuestLineComplete();
            return;
        }

        const currentQuests = this.getCurrentLevelQuests();
        if (mq.currentLevelQuestIndex < currentQuests.length - 1) {
            mq.currentLevelQuestIndex++;
            const nextQuest = currentQuests[mq.currentLevelQuestIndex];

            mq.questData[nextQuest.id] = {
                objectives: nextQuest.objectives.map(o => {
                    let currentVal;
                    if (o.type === 'visit_map' || o.type === 'kill_boss' || o.type === 'dungeon') {
                        currentVal = false;
                    } else if (o.type === 'reach_level') {
                        currentVal = this.game.persistentState.player.realm?.currentLevel || 1;
                    } else if (o.type === 'reach_stage') {
                        currentVal = this.game.persistentState.player.realm?.currentStage || 1;
                    } else {
                        currentVal = 0;
                    }
                    return { ...o, current: currentVal };
                }),
                completed: false
            };
            this.updateMainQuestUI();
        } else {
            this.game.addBattleLog(`📚 当前等级任务已全部完成，继续修炼升级以解锁新任务！`);

            // 玩家可能已经升到更高等级（通过每日任务奖励等），直接初始化新任务
            const realm = this.game.persistentState.player.realm;
            if (realm && (realm.currentLevel > mq.currentLevel || realm.currentStage !== mq.currentStage || realm.currentRealm !== mq.currentRealm)) {
                this.initLevelQuests(realm.currentRealm, realm.currentStage, realm.currentLevel);
            }
        }
    }

    /**
     * 奖励发放
     */
    grantQuestRewards(questDef) {
        const rewards = questDef.rewards;
        if (!rewards) return;

        if (rewards.exp) {
            this.game.persistentState.player.exp += rewards.exp;
        }

        if (rewards.spiritStones) {
            this.game.persistentState.resources.spiritStones = (this.game.persistentState.resources.spiritStones || 0) + rewards.spiritStones;
        }

        if (rewards.skillPoints) {
            this.game.persistentState.player.skillPoints = (this.game.persistentState.player.skillPoints || 0) + rewards.skillPoints;
        }

        if (questDef.rewardItems && this.game.equipmentSystem) {
            for (const item of questDef.rewardItems) {
                if (item.type === 'equipment') {
                    try {
                        this.game.equipmentSystem.generateAndAddEquipment(item.slot, item.rarity);
                    } catch (e) {
                        console.warn('生成装备奖励失败:', e);
                    }
                }
            }
        }

        this.game.updateUI();
        this.game.checkLevelUp();
    }

    /**
     * 境界任务线完成 → 通知玩家可以突破
     */
    onRealmQuestLineComplete() {
        const currentRealm = this.game.persistentState.mainQuest.currentRealm;

        if (currentRealm >= 5) {
            return;
        }

        const nextRealmName = this.game.metadata.realmConfig[currentRealm + 1]?.name || '下一境界';
        this.game.addBattleLog(`🌟 主线任务线已完成！你现在可以尝试突破到【${nextRealmName}境】了！`);
        this.showBreakthroughNotification(nextRealmName);
    }

    /**
     * 显示突破提示通知
     */
    showBreakthroughNotification(nextRealmName) {
        const notification = document.getElementById('breakthrough-notification');
        const realmNameEl = document.getElementById('next-realm-name');

        if (notification && realmNameEl) {
            realmNameEl.textContent = nextRealmName;
            notification.classList.remove('hidden');

            setTimeout(() => {
                notification.classList.add('hidden');
            }, 5000);
        }
    }

    /**
     * 获取当前任务状态
     */
    getCurrentQuestState() {
        const questDef = this.getCurrentQuestDef();
        if (!questDef) return null;

        return this.game.persistentState.mainQuest.questData[questDef.id] || null;
    }

    /**
     * 获取当前任务定义
     */
    getCurrentQuestDef() {
        const mq = this.game.persistentState.mainQuest;
        const currentQuests = this.getCurrentLevelQuests();

        if (!currentQuests || mq.currentLevelQuestIndex >= currentQuests.length) return null;
        return currentQuests[mq.currentLevelQuestIndex];
    }

    // ========== 剧情系统 ==========

    /**
     * 触发剧情播放
     */
    triggerStory(sceneId) {
        if (this.game.persistentState.mainStory.currentScene) return;

        const scene = this.game.metadata.storyScenes?.scenes?.[sceneId];
        if (!scene) return;

        this.game.persistentState.mainStory.currentScene = sceneId;
        this.storyPageIndex = 0;

        this.showStoryOverlay(scene, 0);
    }

    /**
     * 显示剧情覆盖层
     */
    showStoryOverlay(scene, pageIndex) {
        const overlay = document.getElementById('story-overlay');
        const titleEl = document.getElementById('story-chapter-title');
        const speakerEl = document.getElementById('story-speaker');
        const textEl = document.getElementById('story-text');
        const indicatorEl = document.getElementById('story-page-indicator');
        const speakerImageEl = document.getElementById('story-speaker-image');

        if (!overlay || !scene.pages[pageIndex]) return;

        const page = scene.pages[pageIndex];

        overlay.classList.remove('hidden');

        if (titleEl) {
            titleEl.textContent = scene.title || '';
        }

        if (speakerEl) {
            speakerEl.textContent = page.speaker || '';
        }

        if (textEl) {
            this.typewriterEffect(textEl, page.text, 25);
        }

        if (indicatorEl) {
            indicatorEl.textContent = `${pageIndex + 1} / ${scene.pages.length}`;
        }

        // 显示角色立绘
        if (speakerImageEl) {
            if (page.speakerImage) {
                speakerImageEl.src = page.speakerImage;
                speakerImageEl.style.display = 'block';
                speakerImageEl.style.animation = 'none';
                // 触发重新播放动画（缩放淡入）
                speakerImageEl.offsetHeight; // 触发重排
                speakerImageEl.style.animation = 'fadeIn 0.5s ease-out';
            } else {
                speakerImageEl.style.display = 'none';
            }
        }

        this.storyPageIndex = pageIndex;
    }

    /**
     * 剧情页面切换
     */
    nextStoryPage() {
        const sceneId = this.game.persistentState.mainStory.currentScene;
        if (!sceneId) return;

        const scene = this.game.metadata.storyScenes?.scenes?.[sceneId];
        if (!scene) return;

        const nextIndex = (this.storyPageIndex || 0) + 1;

        if (nextIndex >= scene.pages.length) {
            this.closeStoryOverlay();

            if (!this.game.persistentState.mainStory.viewedScenes.includes(sceneId)) {
                this.game.persistentState.mainStory.viewedScenes.push(sceneId);
            }

            this.game.persistentState.mainStory.currentScene = null;
            this.game.saveGameState();
        } else {
            this.showStoryOverlay(scene, nextIndex);
        }
    }

    /**
     * 关闭剧情覆盖层
     */
    closeStoryOverlay() {
        const overlay = document.getElementById('story-overlay');
        const speakerImageEl = document.getElementById('story-speaker-image');

        if (overlay) {
            overlay.classList.add('hidden');
        }

        if (speakerImageEl) {
            speakerImageEl.style.display = 'none';
        }

        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
            this.typewriterTimer = null;
        }
    }

    /**
     * 打字机效果
     */
    typewriterEffect(element, text, speed = 30) {
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
    }

    // ========== 剧情回顾 ==========

    /**
     * 显示剧情回顾列表
     */
    showStoryReview() {
        const container = document.getElementById('quest-tab-story-content');
        if (!container) return;

        const viewedScenes = this.game.persistentState.mainStory.viewedScenes || [];

        const chapters = {};
        for (const sceneId of viewedScenes) {
            const scene = this.game.metadata.storyScenes?.scenes?.[sceneId];
            if (scene) {
                const chapter = scene.chapter || 0;
                if (!chapters[chapter]) chapters[chapter] = [];
                chapters[chapter].push({ id: sceneId, ...scene });
            }
        }

        let html = '';
        const realmNames = ['武者卷', '炼气卷', '筑基卷', '金丹卷', '元婴卷', '化神卷'];

        for (let i = 0; i <= 5; i++) {
            const scenes = chapters[i] || [];
            if (scenes.length === 0) continue;

            html += `
                <div class="mb-4">
                    <div class="text-spiritStones font-bold mb-2">${realmNames[i]}</div>
                    <div class="space-y-2">
                        ${scenes.map(s => `
                            <button class="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/80 transition-colors flex items-center justify-between" onclick="game.mainQuestSystem.replayStory('${s.id}')">
                                <span>${s.title}</span>
                                <i class="fa fa-play text-spiritStones/60"></i>
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
    }

    /**
     * 重播剧情
     */
    replayStory(sceneId) {
        const scene = this.game.metadata.storyScenes?.scenes?.[sceneId];
        if (!scene) return;

        const modal = document.getElementById('main-quest-modal');
        if (modal) modal.classList.add('hidden');

        setTimeout(() => {
            this.game.persistentState.mainStory.currentScene = sceneId;
            this.storyPageIndex = 0;
            this.showStoryOverlay(scene, 0);
        }, 300);
    }

    // ========== UI 辅助方法 ==========

    /**
     * 获取当前境界的阶段显示名称
     */
    getStageDisplay(stageNum) {
        const realmIndex = this.game.persistentState.mainQuest.currentRealm;
        const realmNames = ['武者', '炼气', '筑基', '金丹', '元婴', '化神'];
        const realm = this.game.metadata.realmConfig[realmIndex];
        if (!realm) return '';

        const st = stageNum || (this.game.persistentState.player.realm?.currentStage || 1);
        const stage = realm.stages[st - 1];
        if (!stage) return `${realmNames[realmIndex]}第${st}阶`;
        return `${realmNames[realmIndex]}${stage.name}${st}阶`;
    }

    /**
     * 获取阶段的简短名称（不含境界前缀）
     */
    getStageShortName(stageNum) {
        const realmIndex = this.game.persistentState.mainQuest.currentRealm;
        const realm = this.game.metadata.realmConfig[realmIndex];
        if (!realm) return '';
        const stage = realm.stages[stageNum - 1];
        if (!stage) return `第${stageNum}阶`;
        return `${stage.name}${stageNum}阶`;
    }

    // ========== UI 渲染 ==========

    /**
     * 从任务ID重新生成任务名称（用于已完成任务的显示）
     */
    regenerateQuestNameFromId(questId) {
        // 解析 questId: r{realm}_s{stage}_l{level}_q{index}
        const match = questId.match(/^r(\d+)_s(\d+)_l(\d+)_q(\d+)$/);
        if (!match) return questId;

        const realmIndex = parseInt(match[1]);
        const stageNum = parseInt(match[2]);
        const levelInStage = parseInt(match[3]);
        const questIndex = parseInt(match[4]);

        // 获取当前等级的所有任务模板
        const templates = this.selectQuestTemplates(realmIndex, stageNum, levelInStage);

        // 根据索引选择对应模板
        if (questIndex < 1 || questIndex > templates.length) return questId;
        const templateType = templates[questIndex - 1];

        // 使用模板生成名称（简化版）
        const config = this.game.metadata.questTemplateConfig;
        const theme = config.realmThemes[realmIndex];
        const realmName = theme.name;
        const stageConfig = this.game.metadata.realmConfig[realmIndex]?.stages[stageNum - 1];
        const stageLabel = stageConfig?.name || '';
        const stageDisplay = `${realmName}${stageLabel}`;

        // 根据模板类型生成名称
        switch (templateType) {
            case 'kill_normal':
                return `${stageDisplay}·妖兽讨伐`;
            case 'kill_elite':
                return `${stageDisplay}·精英猎杀`;
            case 'kill_boss':
                return `${stageDisplay}·Boss挑战`;
            case 'dungeon_herb':
            case 'collect_herbs':
                return `${stageDisplay}·灵草园通关`;
            case 'dungeon_iron':
            case 'collect_iron':
                return `${stageDisplay}·玄铁矿通关`;
            case 'dungeon_stone':
            case 'collect_stones':
            case 'collect_spiritStones':
                return `${stageDisplay}·灵石矿脉通关`;
            case 'visit_map':
                return `${stageDisplay}·地图探索`;
            default:
                return questId;
        }
    }

    /**
     * 更新主线任务 UI
     */
    updateMainQuestUI() {
        const mq = this.game.persistentState.mainQuest;
        const questDef = this.getCurrentQuestDef();
        const questState = this.getCurrentQuestState();

        const badge = document.getElementById('main-quest-badge');
        if (badge) {
            if (questState && !questState.completed) {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

        const contentEl = document.getElementById('quest-tab-current-content');
        if (!contentEl) return;

        if (!questDef || !questState) {
            contentEl.innerHTML = '<div class="text-white/50 text-center py-8">暂无主线任务</div>';
            return;
        }

        const realmNames = ['武者', '炼气', '筑基', '金丹', '元婴', '化神'];
        const currentRealm = mq.currentRealm;
        const realmName = realmNames[currentRealm] || '未知';
        const currentStage = mq.currentStage;
        const currentLevel = mq.currentLevel;

        const stageConfig = this.game.metadata.realmConfig[currentRealm]?.stages[currentStage - 1];
        const levelCap = stageConfig?.levelCap || 10;
        const stageLabel = stageConfig?.name || '';
        const stageDisplay = `${realmName}${stageLabel}`;

        const currentQuests = this.getCurrentLevelQuests();
        const questInLevel = mq.currentLevelQuestIndex + 1;
        const totalQuestsInLevel = currentQuests.length;

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
                const resourceNames = { herbs: '灵草', iron: '玄铁', spiritStones: '灵石' };
                progressText = `收集 ${current}/${target} ${resourceNames[obj.resource] || obj.resource}`;
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
            } else if (obj.type === 'dungeon') {
                const dungeonNames = {
                    'spirit_stone_mine': '灵石矿脉',
                    'herb_garden': '灵草园',
                    'iron_mine': '玄铁矿'
                };
                const difficultyNames = { 'easy': '简单', 'medium': '普通', 'hard': '困难' };
                const dungeonName = dungeonNames[obj.dungeonId] || '副本';
                const diffName = obj.difficulty ? difficultyNames[obj.difficulty] || '' : '';
                progressText = current ? `已通关 ${dungeonName}${diffName ? `(${diffName})` : ''}` : `通关 ${dungeonName}${diffName ? `(${diffName})` : ''}`;
                progressPercent = current ? 100 : 0;
            } else if (obj.type === 'reach_level') {
                const currentLevel = this.game.persistentState.player.realm?.currentLevel || 1;
                const stageLabel = this.getStageDisplay();
                progressText = currentLevel >= target ? `${stageLabel} 已达到 ${target} 级` : `${stageLabel} 达到 ${target} 级 (当前: ${currentLevel}级)`;
                progressPercent = Math.min(100, (currentLevel / target) * 100);
            } else if (obj.type === 'reach_stage') {
                const currentStage = this.game.persistentState.player.realm?.currentStage || 1;
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
                        ${!isComplete && progressPercent > 0 ? `<div class="h-1 bg-white/10 rounded-full mt-1 overflow-hidden"><div class="h-full bg-spiritStones rounded-full transition-all" style="width: ${progressPercent}%"></div></div>` : ''}
                    </div>
                </div>
            `;
        }

        let rewardsHtml = '';
        const rewards = questDef.rewards || {};
        if (rewards.exp) rewardsHtml += `<span class="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">+${rewards.exp} 经验</span>`;
        if (rewards.spiritStones) rewardsHtml += `<span class="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">+${rewards.spiritStones} 灵石</span>`;
        if (rewards.skillPoints) rewardsHtml += `<span class="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">+${rewards.skillPoints} 技能点</span>`;

        let levelQuestProgressHtml = '';
        if (totalQuestsInLevel > 1) {
            levelQuestProgressHtml = `
                <div class="mt-3 flex gap-1">
                    ${currentQuests.map((q, i) => {
                        const isDone = i < mq.currentLevelQuestIndex;
                        const isActive = i === mq.currentLevelQuestIndex;
                        return `<div class="flex-1 h-1.5 rounded-full ${isDone ? 'bg-green-500' : isActive ? 'bg-spiritStones' : 'bg-white/20'}"></div>`;
                    }).join('')}
                </div>
            `;
        }

        contentEl.innerHTML = `
            <!-- 进度概览 -->
            <div class="text-sm text-spiritStones/80 mb-1">
                第${currentRealm + 1}卷 · ${realmName}之路
            </div>
            <div class="text-xs text-white/50 mb-3">
                ${stageDisplay} · 第${currentStage}阶 · Lv.${currentLevel}/${levelCap}
                <span class="ml-2">任务 ${questInLevel}/${totalQuestsInLevel}</span>
            </div>

            <!-- 当前任务卡片 -->
            <div class="bg-white/5 rounded-xl p-4 border border-spiritStones/20">
                <h3 class="text-lg font-bold text-spiritStones mb-2">${questDef.name}</h3>
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
                        // 优先从名称映射缓存查找
                        let name = this._questNameMap[id];
                        if (!name) {
                            // 从内存缓存中查找任务名称
                            for (const key in this._questCache) {
                                const cached = this._questCache[key];
                                const found = cached.find(q => q.id === id);
                                if (found) {
                                    name = found.name;
                                    this._questNameMap[id] = name; // 缓存起来
                                    break;
                                }
                            }
                        }
                        // 回退到 metadata 查找
                        if (!name) {
                            for (let r = 0; r <= 5; r++) {
                                const quests = this.game.metadata.mainStoryQuests[r] || [];
                                const q = quests.find(q => q.id === id);
                                if (q) {
                                    name = q.name;
                                    this._questNameMap[id] = name; // 缓存起来
                                    break;
                                }
                            }
                        }
                        // 最后从ID重新生成名称
                        if (!name || name === id) {
                            name = this.regenerateQuestNameFromId(id);
                            if (name !== id) {
                                this._questNameMap[id] = name; // 缓存起来
                            }
                        }
                        return `<div class="text-sm text-white/40 flex items-center gap-2"><i class="fa fa-check text-green-500"></i>${name}</div>`;
                    }).join('')}
                </div>
            </div>
        `;

        const toggleBtn = document.getElementById('toggle-completed-quests');
        const completedList = document.getElementById('completed-quests-list');
        if (toggleBtn && completedList) {
            toggleBtn.addEventListener('click', () => {
                const isHidden = completedList.classList.contains('hidden');
                completedList.classList.toggle('hidden');
                toggleBtn.querySelector('i').style.transform = isHidden ? 'rotate(90deg)' : '';
            });
        }
    }

    /**
     * 显示主线任务面板
     */
    showMainQuestPanel() {
        const modal = document.getElementById('main-quest-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.updateMainQuestUI();
            this.showStoryReview();
        }
    }

    /**
     * 隐藏主线任务面板
     */
    hideMainQuestPanel() {
        const modal = document.getElementById('main-quest-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * 显示任务完成弹窗
     */
    showQuestCompletePopup(questDef) {
        const popup = document.getElementById('quest-complete-popup');
        const titleEl = document.getElementById('quest-complete-title');
        const rewardsEl = document.getElementById('quest-complete-rewards');

        if (!popup || !titleEl || !rewardsEl) return;

        titleEl.textContent = `✨ ${questDef.name} 完成！`;

        const rewards = questDef.rewards || {};
        let rewardsHtml = '';

        if (rewards.exp) {
            rewardsHtml += `<div class="flex items-center gap-2 text-blue-300"><i class="fa fa-star"></i> 经验 +${rewards.exp}</div>`;
        }
        if (rewards.spiritStones) {
            rewardsHtml += `<div class="flex items-center gap-2 text-yellow-300"><i class="fa fa-coins"></i> 灵石 +${rewards.spiritStones}</div>`;
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

        popup.classList.remove('hidden');

        setTimeout(() => {
            popup.classList.add('hidden');
        }, 3000);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainQuestSystem;
} else {
    window.MainQuestSystem = MainQuestSystem;
}
