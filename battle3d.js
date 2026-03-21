// 战斗场景模块 (battle3d.js)
// 包含战斗3D场景、动画、特效和结束逻辑

// ==================== 战斗场景配置 ====================

// 场景主题枚举
const BATTLE_SCENES = {
    IMMORTAL_PEAK: 'immortal_peak',      // 仙山峰顶
    LAKE_SIDE: 'lake_side',               // 碧波湖畔
    VOID_REALM: 'void_realm',             // 虚空秘境
    LAVA_HELL: 'lava_hell',               // 熔岩地狱
    ICE_VALLEY: 'ice_valley'              // 冰封雪谷
};

// 场景配置
const SCENE_CONFIGS = {
    [BATTLE_SCENES.IMMORTAL_PEAK]: {
        name: '仙山峰顶',
        skyColor: new BABYLON.Color4(0.53, 0.81, 0.92, 1),  // 天蓝色
        groundColor: new BABYLON.Color3(0.35, 0.50, 0.25),  // ✅ 自然草绿色
        ambientLight: { color: new BABYLON.Color3(0.3, 0.4, 0.5), intensity: 1.2 },
        directionalLight: { color: new BABYLON.Color3(1, 0.95, 0.8), intensity: 1.5 },
        fog: { enabled: true, color: new BABYLON.Color3(0.9, 0.95, 1), density: 0.02 },
        particles: ['spirit_energy', 'clouds'],  // ✅ 只保留灵气和云雾
        decorations: ['peach_trees']  // ✅ 新增桃树装饰物
    },
    [BATTLE_SCENES.LAKE_SIDE]: {
        name: '碧波湖畔',
        skyColor: new BABYLON.Color4(0.4, 0.6, 0.8, 1),      // 湖蓝色
        groundColor: new BABYLON.Color3(0.76, 0.70, 0.50),   // ✅ 沙滩米黄色（温暖自然）
        ambientLight: { color: new BABYLON.Color3(0.4, 0.5, 0.6), intensity: 1.0 },
        directionalLight: { color: new BABYLON.Color3(1, 1, 0.9), intensity: 1.3 },
        fog: { enabled: true, color: new BABYLON.Color3(0.8, 0.9, 1), density: 0.015 },
        particles: ['water_drops', 'water_ripples'],  // ✅ 水滴 + 水面波纹
        waterEnabled: true
    },
    [BATTLE_SCENES.VOID_REALM]: {
        name: '虚空秘境',
        skyColor: new BABYLON.Color4(0.05, 0.02, 0.15, 1),  // 深紫色
        groundColor: new BABYLON.Color3(0.1, 0.1, 0.15),     // 暗紫色
        ambientLight: { color: new BABYLON.Color3(0.2, 0.1, 0.3), intensity: 0.8 },
        directionalLight: { color: new BABYLON.Color3(0.6, 0.5, 1), intensity: 1.0 },
        fog: { enabled: false },
        particles: ['stars', 'nebula_vortex'],  // ✅ 星辰 + 星云漩涡
        starsEnabled: true
    },
    [BATTLE_SCENES.LAVA_HELL]: {
        name: '熔岩地狱',
        skyColor: new BABYLON.Color4(0.15, 0.05, 0.05, 1),  // 暗红色
        groundColor: new BABYLON.Color3(0.2, 0.15, 0.1),     // 黑褐色
        ambientLight: { color: new BABYLON.Color3(0.5, 0.2, 0.1), intensity: 1.0 },
        directionalLight: { color: new BABYLON.Color3(1, 0.4, 0.2), intensity: 1.8 },
        pointLight: { color: new BABYLON.Color3(1, 0.3, 0), intensity: 2.0, position: [0, 0, 0] },
        fog: { enabled: true, color: new BABYLON.Color3(0.3, 0.1, 0.05), density: 0.025 },
        particles: ['fire_sparks'],  // ✅ 只保留已实现的：火星
        lavaEnabled: true
    },
    [BATTLE_SCENES.ICE_VALLEY]: {
        name: '冰封雪谷',
        skyColor: new BABYLON.Color4(0.85, 0.92, 1.0, 1),   // 冰蓝色
        groundColor: new BABYLON.Color3(0.65, 0.72, 0.78),   // ✅ 淡灰蓝色（降低亮度）
        ambientLight: { color: new BABYLON.Color3(0.6, 0.7, 0.8), intensity: 1.3 },
        directionalLight: { color: new BABYLON.Color3(1, 1, 1), intensity: 1.2 },
        fog: { enabled: true, color: new BABYLON.Color3(0.95, 0.98, 1), density: 0.02 },
        particles: ['snowflakes'],  // ✅ 只保留雪花，移除冰晶
        decorations: ['snow_piles', 'snowmen']  // ✅ 新增装饰物：雪堆、雪人
    }
};

// 随机选择场景
function getRandomBattleScene() {
    const scenes = Object.values(BATTLE_SCENES);
    return scenes[Math.floor(Math.random() * scenes.length)];
}

// ==================== 战斗场景初始化 ====================

// 创建单独的3D战斗场景
EndlessCultivationGame.prototype.createBattleScene = function(enemyInfo) {
    // 停止玩家移动（进入战斗场景时）
    if (this.moveAnimationId) {
        cancelAnimationFrame(this.moveAnimationId);
        this.moveAnimationId = null;
    }
    if (this.movementInterval) {
        clearInterval(this.movementInterval);
        this.movementInterval = null;
    }
    if (this.moveTimer) {
        clearTimeout(this.moveTimer);
        this.moveTimer = null;
    }
    this.isMoving = false;

    // 播放战斗音乐
    this.audioSystem.playSound('battle-music');

    // 隐藏敌人信息面板（进入战斗场景时）
    const enemyInfoPanel = document.getElementById('enemy-info-panel');
    if (enemyInfoPanel) {
        enemyInfoPanel.classList.add('hidden');
    }

    // 显示战斗模态窗口
    const battleModal = document.getElementById('battle-modal');
    if (battleModal) {
        battleModal.classList.remove('hidden');
    }

    // 设置战斗状态
    this.gameState.battle.inBattle = true;

    // 清理当前场景
    if (this.battle3D) {
        if (this.battle3D.engine) {
            try {
                this.battle3D.engine.dispose();
            } catch (e) {
                console.log('清理旧引擎时出错:', e);
            }
        }
    }

    // 使用战斗模态中的容器
    const container = document.getElementById('battle-modal-3d-container');
    if (!container) {
        console.error('找不到battle-modal-3d-container元素');
        return;
    }

        // ✅ 清空容器（不再需要保留场景名称元素）
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // 创建canvas
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';

    const containerRect = container.getBoundingClientRect();
    canvas.width = Math.max(containerRect.width || 1024, 1);
    canvas.height = Math.max(containerRect.height || 600, 1);

    container.appendChild(canvas);

    // 创建引擎和场景
    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new BABYLON.Scene(engine);

    // ✅ 随机选择场景主题
    const sceneType = getRandomBattleScene();
    const sceneConfig = SCENE_CONFIGS[sceneType];
    console.log(`战斗场景: ${sceneConfig.name}`);

    // 设置场景背景色
    scene.clearColor = sceneConfig.skyColor;

    // 创建相机
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(container, false); // 禁用鼠标控制，防止地图移动
    camera.setPosition(new BABYLON.Vector3(0, 3, 10));
    // 禁用相机的旋转和移动
    camera.upperRadiusLimit = 10;
    camera.lowerRadiusLimit = 10;
    camera.upperBetaLimit = Math.PI / 2;
    camera.lowerBetaLimit = Math.PI / 2;
    camera.upperAlphaLimit = -Math.PI / 2;
    camera.lowerAlphaLimit = -Math.PI / 2;

    // ✅ 根据场景配置添加环境光
    const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = sceneConfig.ambientLight.intensity;
    ambientLight.diffuse = sceneConfig.ambientLight.color;

    // ✅ 根据场景配置添加方向光
    const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(5, 5, 3), scene);
    directionalLight.intensity = sceneConfig.directionalLight.intensity;
    directionalLight.diffuse = sceneConfig.directionalLight.color;

    // ✅ 根据场景配置添加点光源（如果有）
    let pointLight = null;
    if (sceneConfig.pointLight) {
        pointLight = new BABYLON.PointLight("pointLight",
            new BABYLON.Vector3(...sceneConfig.pointLight.position), scene);
        pointLight.intensity = sceneConfig.pointLight.intensity;
        pointLight.diffuse = sceneConfig.pointLight.color;
    } else {
        // 默认点光源（保持兼容性）
        pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 2, 0), scene);
        pointLight.intensity = 1.5;
        pointLight.diffuse = new BABYLON.Color3(1, 0.25, 0);
    }

    // ✅ 根据场景配置添加雾效（如果有）
    if (sceneConfig.fog && sceneConfig.fog.enabled) {
        scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        scene.fogColor = sceneConfig.fog.color;
        scene.fogDensity = sceneConfig.fog.density;
    }

    // 创建地面
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 15, height: 15 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = sceneConfig.groundColor;
    groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);  // ✅ 降低高光（避免形成"太阳"光斑）
    groundMaterial.shininess = 5;  // ✅ 降低光泽度（更柔和的地面）
    ground.material = groundMaterial;
    ground.position.y = -1;

    // ✅ 保存场景配置到 battle3D 对象，供后续使用
    this.battle3D = {
        engine: engine,
        scene: scene,
        camera: camera,
        canvas: canvas,
        container: container,
        sceneType: sceneType,
        sceneConfig: sceneConfig,
        particleSystems: [],  // 存储粒子系统
        // 战斗模型和状态
        player: null,
        enemy: null,
        playerHealthBar: null,
        enemyHealthBar: null,
        playerEnergyBar: null,
        enemyEnergyBar: null,
        snowSystem: null,
        isAttacking: false,
        playerDefeated: false,
        enemyDefeated: false,
        battleEffects: [],
        fireEffects: [],
        enemies: [],
        defenseEffect: null,
        defenseShield: null,
        // 战斗布局配置（修改间距只需调整这里）
        playerStartX: -2.5,
        enemyStartX: 2.5
    };

    // 设置场景点击事件
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
            const pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (pickResult.hit) {
                console.log('点击了:', pickResult.pickedMesh ? pickResult.pickedMesh.name : '地面');
            }
        }
    });

    // 创建玩家信息工具提示元素
    let playerTooltip = null;
    
    // 设置鼠标悬停事件
    scene.onPointerObservable.add((pointerInfo) => {
        // 清理之前的工具提示
        if (playerTooltip) {
            playerTooltip.remove();
            playerTooltip = null;
        }

        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
            const pickResult = scene.pick(scene.pointerX, scene.pointerY);
            // 检查点击的是否是玩家模型的子网格
            if (pickResult.hit && pickResult.pickedMesh &&
                (pickResult.pickedMesh.name === 'player' ||
                 (pickResult.pickedMesh.parent && pickResult.pickedMesh.parent.name === 'player'))) {
                // 显示玩家信息工具提示
                playerTooltip = document.createElement('div');
                playerTooltip.className = 'absolute bg-dark/90 text-white p-2 rounded text-xs z-50 pointer-events-none';
                playerTooltip.style.position = 'fixed';
                playerTooltip.style.left = `${pointerInfo.event.clientX + 10}px`;
                playerTooltip.style.top = `${pointerInfo.event.clientY + 10}px`;

                // 获取实际属性（包含装备和境界加成）
                const stats = this.getActualStats();

                // 直接使用实际属性（修复：统一使用getActualStats，避免公式不一致）
                const hitChance = (stats.accuracy * 100).toFixed(1);
                const dodgeChance = (stats.dodgeRate * 100).toFixed(1);
                const critChance = (stats.criticalRate * 100).toFixed(1);

                // 构建工具提示内容（含装备效果和境界加成）
                playerTooltip.innerHTML = `
                    <div class="font-bold">${this.gameState.user?.username || '玩家'}</div>
                    <div>等级: ${this.calculateTotalLevel()}</div>
                    <div>生命值: ${stats.hp}/${stats.maxHp}</div>
                    <div>灵力: ${this.gameState.player.energy}/${this.gameState.player.maxEnergy}</div>
                    <div>攻击: ${stats.attack}</div>
                    <div>防御: ${stats.defense}</div>
                    <div>速度: ${stats.speed}</div>
                    <div>幸运: ${stats.luck}</div>
                    <div>命中率: ${hitChance}%</div>
                    <div>闪避率: ${dodgeChance}%</div>
                    <div>暴击率: ${critChance}%</div>
                `;
                
                document.body.appendChild(playerTooltip);
            }
        }
    });

    // 鼠标离开场景时清理工具提示
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP || 
            pointerInfo.type === BABYLON.PointerEventTypes.POINTERLEAVE) {
            if (playerTooltip) {
                playerTooltip.remove();
                playerTooltip = null;
            }
            if (enemyTooltip) {
                enemyTooltip.remove();
                enemyTooltip = null;
            }
        }
    });

    // 创建敌人信息工具提示元素
    let enemyTooltip = null;
    
    // 设置敌人鼠标悬停事件
    scene.onPointerObservable.add((pointerInfo) => {
        // 清理之前的工具提示
        if (enemyTooltip) {
            enemyTooltip.remove();
            enemyTooltip = null;
        }

        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
            const pickResult = scene.pick(scene.pointerX, scene.pointerY);
            // 检查点击的是否是敌人模型的子网格
            const pickedMesh = pickResult.pickedMesh;
            const isEnemyMesh = pickedMesh &&
                (pickedMesh.name === 'enemyBattleGroup' ||
                 (pickedMesh.parent && pickedMesh.parent.name === 'enemyBattleGroup') ||
                 (pickedMesh.parent && pickedMesh.parent.parent && pickedMesh.parent.parent.name === 'enemyBattleGroup'));
            if (pickResult.hit && isEnemyMesh) {
                // 显示敌人信息工具提示
                enemyTooltip = document.createElement('div');
                enemyTooltip.className = 'absolute bg-dark/90 text-white p-2 rounded text-xs z-50 pointer-events-none';
                enemyTooltip.style.position = 'fixed';
                enemyTooltip.style.left = `${pointerInfo.event.clientX + 10}px`;
                enemyTooltip.style.top = `${pointerInfo.event.clientY + 10}px`;

                // 获取敌人实际属性
                const enemyStats = this.getEnemyActualStats();

                // 直接使用实际属性（修复：统一使用getEnemyActualStats，避免公式不一致）
                const enemyHitChance = (enemyStats.accuracy * 100).toFixed(1);
                const enemyDodgeChance = (enemyStats.dodgeRate * 100).toFixed(1);
                const enemyCritChance = (enemyStats.criticalRate * 100).toFixed(1);

                // 构建工具提示内容
                enemyTooltip.innerHTML = `
                    <div class="font-bold">${this.gameState.enemy.name}</div>
                    <div>等级: ${this.gameState.enemy.level}</div>
                    <div>生命值: ${this.gameState.enemy.hp}/${this.gameState.enemy.maxHp}</div>
                    ${this.gameState.enemy.isBoss || this.gameState.enemy.energy > 0 ? `<div>灵力: ${this.gameState.enemy.energy}/${this.gameState.enemy.maxEnergy || 100}</div>` : ''}
                    <div>攻击: ${enemyStats.attack}</div>
                    <div>防御: ${enemyStats.defense}</div>
                    <div>速度: ${enemyStats.speed}</div>
                    <div>幸运: ${enemyStats.luck}</div>
                    <div>命中率: ${enemyHitChance}%</div>
                    <div>闪避率: ${enemyDodgeChance}%</div>
                    <div>暴击率: ${enemyCritChance}%</div>
                `;

                document.body.appendChild(enemyTooltip);
            }
        }
    });

        // ✅ 创建场景粒子特效
    if (sceneConfig.particles && sceneConfig.particles.length > 0) {
        sceneConfig.particles.forEach(particleType => {
            this.createSceneParticles(particleType);
        });
    }

    // ✅ 创建场景装饰物
    if (sceneConfig.decorations && sceneConfig.decorations.length > 0) {
        sceneConfig.decorations.forEach(decorationType => {
            this.createSceneDecorations(decorationType);
        });
    }

    // ✅ 更新战斗标题为场景名称
    const sceneTitleElement = document.getElementById('battle-scene-title');
    if (sceneTitleElement) {
        sceneTitleElement.textContent = sceneConfig.name;
        console.log(`✅ 战斗标题已更新为: ${sceneConfig.name}`);
    }

    // 创建玩家和敌人模型
    this.createPlayerModel();
    // 设置玩家位置（左侧）
    if (this.battle3D.player) {
        this.battle3D.player.position.x = this.battle3D.playerStartX;
        this.battle3D.player.position.y = 0;
        this.battle3D.player.position.z = 0;
        this.battle3D.player.rotation.y = Math.PI / 2; // 面向右侧敌人（+X方向）
    }
    this.createEnemyModel();

    // 创建血条
    this.createHealthBars();

    // 创建战斗特效
    this.createFireEffects();

    // 渲染循环
    engine.runRenderLoop(() => {
        this.animateBattle3D();
        scene.render();
    });

    window.addEventListener('resize', () => {
        if (this.battle3D && this.battle3D.engine) {
            this.battle3D.engine.resize();
        }
    });

    // 动态生成技能按钮（按类型生成4个技能按钮）
    if (this.gameState.player && this.gameState.player.skills) {
        const attackSkillsContainer = document.getElementById('attack-skills');
        if (!attackSkillsContainer) {
            console.error('attack-skills container not found');
            return;
        }

        // 清空现有按钮
        attackSkillsContainer.innerHTML = '';

        // 创建普通攻击按钮
        const attackButton = document.createElement('button');
        attackButton.id = 'attack-btn';
        attackButton.className = 'btn-primary bg-primary hover:bg-primary/80 w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all relative';
        attackButton.setAttribute('data-tooltip', '对敌人进行普通攻击，不消耗灵力');
        attackButton.innerHTML = '<img src="Images/skill-0.jpg" alt="普通攻击" class="w-full h-full object-cover rounded-full">';
        attackButton.addEventListener('click', () => this.attackEnemy());
        attackSkillsContainer.appendChild(attackButton);

        // 定义技能类型配置
        const skillTypes = [
            { type: 'attack', icon: 'skill-1.jpg', defaultName: '攻击技能' },
            { type: 'defense', icon: 'skill-4.jpg', defaultName: '防御技能' },
            { type: 'recovery', icon: 'skill-3.jpg', defaultName: '恢复技能' },
            { type: 'special', icon: 'skill-2.jpg', defaultName: '特殊技能' }
        ];

        // 为每种类型生成一个技能按钮
        skillTypes.forEach(skillTypeConfig => {
            const skillType = skillTypeConfig.type;

            // 获取当前装备的该类型技能
            const equippedSkillId = this.gameState.player.skills.equipped?.[skillType];
            let skill = null;
            let skillTree = null;

            if (equippedSkillId) {
                skillTree = this.metadata.realmSkills?.find(tree => tree.id === equippedSkillId);
                if (skillTree) {
                    const skillLevel = this.gameState.player.skills.levels[equippedSkillId] || 0;
                    const playerRealm = this.gameState.player.realm.currentRealm;

                    // 检查境界要求：只有境界满足时才显示技能
                    if (skillLevel > 0 && skillTree.realmRequired <= playerRealm) {
                        skill = skillTree.levels[skillLevel - 1];
                    }
                }
            }

            // 创建技能按钮
            const skillButton = document.createElement('button');
            skillButton.className = 'btn-primary bg-accent hover:bg-accent/80 w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all relative';
            skillButton.setAttribute('data-skill-type', skillType);

            if (skill && skillTree) {
                // 有装备的技能
                const realmName = this.metadata.realmConfig?.[skillTree.realmRequired]?.name || '未知境界';
                const skillDisplayName = skillTree.baseDisplayName || skill.displayName || skill.name;
                skillButton.setAttribute('data-tooltip', `${skillDisplayName}: ${skill.description || ''}，消耗${skill.energyCost}灵力，${realmName} (右键切换)`);
                const skillImage = skill.imageId ? `Images/skill-${skill.imageId}.jpg` : (skillTree.baseImageId ? `Images/skill-${skillTree.baseImageId}.jpg` : `Images/${skillTypeConfig.icon}`);
                skillButton.innerHTML = `<img src="${skillImage}" alt="${skillDisplayName}" class="w-full h-full object-cover rounded-full">`;
            } else {
                // 没有装备技能
                skillButton.setAttribute('data-tooltip', `${skillTypeConfig.defaultName}（未装备）- 点击或右键选择技能`);
                skillButton.innerHTML = `<img src="Images/${skillTypeConfig.icon}" alt="${skillTypeConfig.defaultName}" class="w-full h-full object-cover rounded-full opacity-50">`;
            }

            // 左键点击 - 使用技能（或提示选择技能）
            skillButton.addEventListener('click', (e) => {
                if (skill) {
                    this.useSkill(skillType);
                } else {
                    this.showSkillSelectionMenu(skillType, e);
                }
            });

            // 右键点击 - 显示技能选择菜单
            skillButton.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showSkillSelectionMenu(skillType, e);
            });

            attackSkillsContainer.appendChild(skillButton);
        });

        console.log(`生成了 1 个普通攻击按钮 + 4 个技能按钮`);
    }

    // 淡入效果
    this.fadeInBattleScene();
};

// 淡入战斗场景
EndlessCultivationGame.prototype.fadeInBattleScene = function() {
    if (!this.battle3D) return;
    
    const container = document.getElementById('battle-modal-3d-container');
    if (!container || !container.firstChild) return;
    
    const rendererElement = container.firstChild;
    
    // 确保rendererElement是一个有效的DOM元素
    if (!rendererElement || !rendererElement.style) return;
    
    let opacity = 0;
    const fadeDuration = 1000; // 淡入持续时间（毫秒）
    const startTime = Date.now();
    
    const fadeIn = () => {
        const elapsed = Date.now() - startTime;
        opacity = Math.min(elapsed / fadeDuration, 1);
        
        if (rendererElement && rendererElement.style) {
            rendererElement.style.opacity = opacity.toString();
        }
        
        if (opacity < 1) {
            requestAnimationFrame(fadeIn);
        }
    };
    
    fadeIn();
}

// ==================== 战斗动画 ====================

// 播放玩家普通攻击动画
// hitCallback: 碰撞到敌人时调用（~45%进度），用于显示伤害数字
// endCallback: 动画结束时调用（100%进度），用于触发反击等后续逻辑
EndlessCultivationGame.prototype.playAttackAnimation = function(hitCallback, endCallback) {
    if (!this.battle3D || !this.battle3D.player || !this.battle3D.enemy) return;
    // 动画进行中时忽略新操作（不执行任何回调，防止位置偏移）
    if (this.battle3D.isAttacking) return;

    this.battle3D.isAttacking = true;
    const player = this.battle3D.player;
    const originalX = player.position.x;
    const attackRange = this.battle3D.enemyStartX - this.battle3D.playerStartX;
    const startTime = Date.now();
    const animationDuration = 500;
    let hitFired = false;

    const animateAttack = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        if (progress < 0.5) {
            player.position.x = originalX + Math.sin(progress * Math.PI) * attackRange;
        } else {
            player.position.x = originalX + Math.sin((1 - progress) * Math.PI) * attackRange;
        }

        // 碰撞点触发（~45%进度，玩家到达敌人位置时）
        if (!hitFired && progress >= 0.45) {
            hitFired = true;
            if (hitCallback) hitCallback();
        }

        if (progress < 1) {
            requestAnimationFrame(animateAttack);
        } else {
            player.position.x = originalX;
            this.battle3D.isAttacking = false;
            if (endCallback) endCallback();
        }
    };

    animateAttack();
    this.audioSystem.playSound('attack-sound', 1, 200);
};

// 播放玩家技能攻击动画
// hitCallback: 碰撞到敌人时调用（~45%进度）
// endCallback: 动画结束时调用（100%进度）
EndlessCultivationGame.prototype.playSkillAttackAnimation = function(isLuckyStrike = false, skillColor = { r: 0, g: 0.5, b: 1 }, hitCallback, endCallback) {
    if (!this.battle3D || !this.battle3D.player || !this.battle3D.enemy) return;
    if (this.battle3D.isAttacking) return;

    this.battle3D.isAttacking = true;
    const player = this.battle3D.player;
    const originalX = player.position.x;
    const attackRange = this.battle3D.enemyStartX - this.battle3D.playerStartX;
    const startTime = Date.now();
    const animationDuration = 800;
    let hitFired = false;

    const animateSkill = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        player.rotation.y = Math.PI / 2 + progress * Math.PI * 2;
        player.position.x = originalX + Math.sin(progress * Math.PI) * attackRange;

        // 技能特效（30%-70%进度）
        if (progress > 0.3 && progress < 0.7 && this.battle3D.scene) {
            const skillEffect = BABYLON.MeshBuilder.CreateSphere("skillEffect", { diameter: 0.5 }, this.battle3D.scene);
            const skillMaterial = new BABYLON.StandardMaterial("skillMaterial", this.battle3D.scene);
            if (isLuckyStrike) {
                skillMaterial.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
                skillMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
            } else {
                skillMaterial.diffuseColor = new BABYLON.Color3(skillColor.r, skillColor.g, skillColor.b);
                skillMaterial.emissiveColor = new BABYLON.Color3(skillColor.r, skillColor.g, skillColor.b);
            }
            skillMaterial.alpha = 0.8;
            skillEffect.material = skillMaterial;
            skillEffect.position.x = player.position.x;
            skillEffect.position.y = player.position.y;
            skillEffect.position.z = player.position.z;

            const effectStartTime = Date.now();
            const animateEffect = () => {
                const ep = Math.min((Date.now() - effectStartTime) / 300, 1);
                skillEffect.scaling.x = 1 + ep * 2;
                skillEffect.scaling.y = 1 + ep * 2;
                skillEffect.scaling.z = 1 + ep * 2;
                skillMaterial.alpha = 0.8 - ep * 0.8;
                if (ep < 1) requestAnimationFrame(animateEffect);
                else skillEffect.dispose();
            };
            animateEffect();
        }

        // 碰撞点触发（~45%进度）
        if (!hitFired && progress >= 0.45) {
            hitFired = true;
            if (hitCallback) hitCallback();
        }

        if (progress < 1) {
            requestAnimationFrame(animateSkill);
        } else {
            player.rotation.y = Math.PI / 2;
            player.position.x = originalX;
            this.battle3D.isAttacking = false;
            if (endCallback) endCallback();
        }
    };

    animateSkill();
};

// 播放玩家防御动画
EndlessCultivationGame.prototype.playDefenseAnimation = function(callback) {
    if (!this.battle3D || !this.battle3D.player) {
        if (callback) callback();
        return;
    }

    const player = this.battle3D.player;
    const originalY = player.position.y;
    const startTime = Date.now();
    const animationDuration = 1000;

    if (this.battle3D.scene) {
        if (this.battle3D.defenseEffect) {
            this.battle3D.defenseEffect.dispose();
        }
        const defenseEffect = BABYLON.MeshBuilder.CreateSphere("defenseEffect", { diameter: 1.2 }, this.battle3D.scene);
        const defenseMaterial = new BABYLON.StandardMaterial("defenseMaterial", this.battle3D.scene);
        defenseMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
        defenseMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);
        defenseMaterial.alpha = 0.5;
        defenseEffect.material = defenseMaterial;
        defenseEffect.parent = player;
        defenseEffect.position = new BABYLON.Vector3(0, 0, 0);

        const effectStartTime = Date.now();
        const animateEffect = () => {
            const ep = Math.min((Date.now() - effectStartTime) / 500, 1);
            defenseEffect.scaling.x = 1 + ep * 1.5;
            defenseEffect.scaling.y = 1 + ep * 1.5;
            defenseEffect.scaling.z = 1 + ep * 1.5;
            if (ep < 1) requestAnimationFrame(animateEffect);
        };
        animateEffect();
        this.battle3D.defenseEffect = defenseEffect;
    }

    const animateDefense = () => {
        const progress = Math.min((Date.now() - startTime) / animationDuration, 1);
        if (progress < 1) {
            player.position.y = originalY - Math.sin(progress * Math.PI) * 0.5;
            player.rotation.x = -Math.sin(progress * Math.PI) * 0.3;
            requestAnimationFrame(animateDefense);
        } else {
            player.position.y = originalY;
            player.rotation.x = 0;
            if (callback) callback();
        }
    };

    animateDefense();
};

// 播放敌人攻击动画
// hitCallback: 碰撞到玩家时调用（~45%进度），用于显示伤害数字
// endCallback: 动画结束时调用（100%进度），用于更新UI等后续逻辑
EndlessCultivationGame.prototype.playEnemyAttackAnimation = function(hitCallback, endCallback) {
    if (!this.battle3D || !this.battle3D.enemy) return;

    this.battle3D.isAttacking = true;
    const enemy = this.battle3D.enemy;
    const originalX = enemy.position.x;
    const attackRange = this.battle3D.enemyStartX - this.battle3D.playerStartX;
    const startTime = Date.now();
    const animationDuration = 600;
    let hitFired = false;

    const animateAttack = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        if (progress < 0.5) {
            enemy.position.x = originalX - Math.sin(progress * Math.PI) * attackRange;
        } else {
            enemy.position.x = originalX - Math.sin((1 - progress) * Math.PI) * attackRange;
        }

        // 碰撞点触发（~45%进度，敌人到达玩家位置时）
        if (!hitFired && progress >= 0.45) {
            hitFired = true;
            if (hitCallback) hitCallback();
        }

        if (progress < 1) {
            requestAnimationFrame(animateAttack);
        } else {
            enemy.position.x = originalX;
            if (this.battle3D.defenseEffect) {
                this.battle3D.defenseEffect.dispose();
                this.battle3D.defenseEffect = null;
            }
            this.battle3D.isAttacking = false;
            if (endCallback) endCallback();
        }
    };

    animateAttack();
};

// ==================== 受击动画（共享） ====================

// 通用受击动画方法，随机选择一种受击动作
// direction: -1 = 向后退（玩家），+1 = 向后退（敌人）
// flagKey: 'isPlayerHitAnimating' 或 'isEnemyHitAnimating'
EndlessCultivationGame.prototype.playHitReaction = function(mesh, direction, flagKey) {
    if (!this.battle3D || !mesh) return;

    // 如果正在播放受击动画，跳过
    if (this.battle3D[flagKey]) return;
    this.battle3D[flagKey] = true;

    const originalX = mesh.position.x;
    const originalY = mesh.position.y;
    const originalRotZ = mesh.rotation.z;
    const animType = Math.floor(Math.random() * 4); // 0-3 四种动作

    const startTime = Date.now();
    const durations = [400, 300, 400, 350]; // knockback, hop, stagger, duck
    const animationDuration = durations[animType];

    const animateHit = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        switch (animType) {
            case 0: // 后退踉跄
                this._animateKnockback(mesh, progress, originalX, originalY, direction);
                break;
            case 1: // 向上跳起
                this._animateHop(mesh, progress, originalY);
                break;
            case 2: // 左右摇晃
                this._animateStagger(mesh, progress, originalX, originalY);
                break;
            case 3: // 下蹲
                this._animateDuck(mesh, progress, originalX, originalY);
                break;
        }

        if (progress < 1) {
            requestAnimationFrame(animateHit);
        } else {
            // 恢复原始位置和旋转
            mesh.position.x = originalX;
            mesh.position.y = originalY;
            mesh.rotation.z = originalRotZ;
            this.battle3D[flagKey] = false;
        }
    };

    animateHit();
};

// 后退踉跄：向后退一步，身体后倾，然后恢复
EndlessCultivationGame.prototype._animateKnockback = function(mesh, progress, originalX, originalY, direction) {
    // 先快退后慢回（ease-out曲线）
    const knockback = Math.sin(progress * Math.PI) * 0.6;
    mesh.position.x = originalX + direction * knockback;
    // 身体后倾
    mesh.rotation.z = Math.sin(progress * Math.PI) * 0.3 * direction;
    // 轻微跳起
    mesh.position.y = originalY + Math.sin(progress * Math.PI) * 0.2;
};

// 向上跳起：原地跳起落下
EndlessCultivationGame.prototype._animateHop = function(mesh, progress, originalY) {
    mesh.position.y = originalY + Math.sin(progress * Math.PI) * 0.5;
};

// 左右摇晃：快速左右晃动2-3次
EndlessCultivationGame.prototype._animateStagger = function(mesh, progress, originalX, originalY) {
    const shake = Math.sin(progress * Math.PI * 5) * 0.3 * (1 - progress);
    mesh.position.x = originalX + shake;
    mesh.rotation.z = shake * 0.5;
    // 轻微下沉
    mesh.position.y = originalY - (1 - progress) * 0.1;
};

// 下蹲：身体下沉后恢复
EndlessCultivationGame.prototype._animateDuck = function(mesh, progress, originalX, originalY) {
    // 先蹲下后站起
    const duck = Math.sin(progress * Math.PI);
    mesh.position.y = originalY - duck * 0.4;
    // 蹲下时身体前倾
    mesh.rotation.z = -duck * 0.2;
    // 轻微后退
    mesh.position.x = originalX - duck * 0.15;
};

// 播放敌人受击动画
EndlessCultivationGame.prototype.playEnemyHitAnimation = function() {
    this.playHitReaction(this.battle3D.enemy, 1, 'isEnemyHitAnimating');
};

// 播放玩家受击动画
EndlessCultivationGame.prototype.playPlayerHitAnimation = function() {
    this.playHitReaction(this.battle3D.player, -1, 'isPlayerHitAnimating');
};

// ==================== 战斗特效 ====================

// 创建攻击特效（命中时的冲击光环）
EndlessCultivationGame.prototype.createAttackEffect = function(position, color = '#ffffff') {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    // 创建发光的光环
    const ring = BABYLON.MeshBuilder.CreateTorus("attackRing", {
        diameter: 1.5,
        thickness: 0.15,
        tessellation: 32
    }, scene);

    const ringMaterial = new BABYLON.StandardMaterial("ringMaterial", scene);

    // ✅ 根据颜色设置光环颜色
    if (color === '#ffcc00' || color === 'gold') {
        // 暴击：金色光环
        ringMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
        ringMaterial.diffuseColor = new BABYLON.Color3(1, 0.85, 0.2);
    } else {
        // 普通攻击：白色光环
        ringMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        ringMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.95, 1);
    }

    ring.material = ringMaterial;

    // ✅ 设置位置（传入的position已经包含了正确的y高度）
    ring.position = position.clone();
    ring.rotation.x = Math.PI / 2; // 水平放置
    ring.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1); // 从小开始

    // 动画
    const startTime = Date.now();
    const duration = 400; // ✅ 300 -> 400 延长一点

    const animateRing = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 1) {
            // 扩散效果（从中心向外扩散）
            const scale = 0.1 + progress * 2.5; // ✅ 调整扩散范围
            ring.scaling.x = scale;
            ring.scaling.y = scale;
            ring.scaling.z = scale;

            ringMaterial.alpha = 1 - progress; // ✅ 透明度渐变

            requestAnimationFrame(animateRing);
        } else {
            // 清理
            ring.dispose();
        }
    };

    animateRing();
};

// 创建防御特效
EndlessCultivationGame.prototype.createDefenseEffect = function() {
    if (!this.battle3D || !this.battle3D.player) return;

    // ✅ 如果已经存在护盾，先移除（避免重复创建）
    if (this.battle3D.defenseShield) {
        return;
    }

    const player = this.battle3D.player;
    const scene = this.battle3D.scene;

    // 创建护盾效果
    const shield = BABYLON.MeshBuilder.CreateTorus("defenseShield", { diameter: 2, thickness: 0.1 }, scene);
    const shieldMaterial = new BABYLON.StandardMaterial("shieldMaterial", scene);

    // ✅ 改进护盾颜色（更明显的蓝色）
    shieldMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.6, 1.0);  // 更亮的蓝色
    shieldMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.7, 1.0);
    shieldMaterial.specularColor = new BABYLON.Color3(0.5, 0.8, 1.0);
    shieldMaterial.opacity = 0.6;

    // ✅ 使用ADD混合模式（让护盾更透明发光）
    shieldMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;

    shield.material = shieldMaterial;

    // 将护盾作为玩家的子对象，使其跟随玩家移动
    shield.parent = player;
    shield.position = new BABYLON.Vector3(0, 1.5, 0);
    shield.rotation.x = Math.PI / 2;

    // 存储在 battle3D 中以便移除
    this.battle3D.defenseShield = shield;
};

// 移除防御特效
EndlessCultivationGame.prototype.removeDefenseEffect = function() {
    // ✅ 防御性检查：确保 battle3D 存在
    if (!this.battle3D) return;

    if (this.battle3D.defenseShield) {
        this.battle3D.defenseShield.dispose();
        this.battle3D.defenseShield = null;
    }
    if (this.battle3D.defenseEffect) {
        this.battle3D.defenseEffect.dispose();
        this.battle3D.defenseEffect = null;
    }
};

// 创建治疗特效（绿色光华上升）
EndlessCultivationGame.prototype.createHealEffect = function() {
    if (!this.battle3D || !this.battle3D.player) return;

    const player = this.battle3D.player;
    const scene = this.battle3D.scene;

    // 创建粒子系统
    const particleSystem = new BABYLON.ParticleSystem("healParticles", 50, scene);

    // 使用程序化创建圆形纹理
    const textureSize = 64;
    const dynamicTexture = new BABYLON.DynamicTexture("healParticleTexture", textureSize, scene);
    const ctx = dynamicTexture.getContext();

    // 绘制渐变圆
    const gradient = ctx.createRadialGradient(textureSize/2, textureSize/2, 0, textureSize/2, textureSize/2, textureSize/2);
    gradient.addColorStop(0, "rgba(100, 255, 150, 1)");
    gradient.addColorStop(0.5, "rgba(80, 255, 130, 0.6)");
    gradient.addColorStop(1, "rgba(50, 200, 100, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, textureSize, textureSize);
    dynamicTexture.update();

    particleSystem.particleTexture = dynamicTexture;

    // 发射器位置（玩家脚下）
    particleSystem.emitter = player.position.clone();
    particleSystem.emitter.y = 0;

    // 粒子颜色（绿色）
    particleSystem.color1 = new BABYLON.Color4(0.2, 1.0, 0.3, 0.8);
    particleSystem.color2 = new BABYLON.Color4(0.4, 1.0, 0.5, 0.6);
    particleSystem.colorDead = new BABYLON.Color4(0.1, 0.8, 0.2, 0.0);

    // 粒子大小
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.3;

    // 粒子生命周期
    particleSystem.minLifeTime = 0.8;
    particleSystem.maxLifeTime = 1.2;

    // 发射速率
    particleSystem.emitRate = 30;

    // 向上运动
    particleSystem.direction1 = new BABYLON.Vector3(-0.5, 2, -0.5);
    particleSystem.direction2 = new BABYLON.Vector3(0.5, 3, 0.5);

    // 重力（向上飘）
    particleSystem.gravity = new BABYLON.Vector3(0, 1, 0);

    // 持续时间
    particleSystem.targetStopDuration = 1.0;

    // 开始粒子系统
    particleSystem.start();

    // 存储以便清理
    if (!this.battle3D.particleSystems) this.battle3D.particleSystems = [];
    this.battle3D.particleSystems.push(particleSystem);
};

// 创建闪避特效（风属性残影）
EndlessCultivationGame.prototype.createDodgeEffect = function(position) {
    if (!this.battle3D || !this.battle3D.scene) {
        console.warn('⚠️ battle3D未初始化，无法创建闪避特效');
        return;
    }

    const scene = this.battle3D.scene;

    // 确定位置：如果有传入位置使用传入的，否则使用玩家位置
    let emitterPosition;
    if (position) {
        emitterPosition = position;
        console.log('🌪️ 使用传入位置创建闪避特效:', position);
    } else if (this.battle3D.player) {
        emitterPosition = this.battle3D.player.position.clone();
        emitterPosition.y = 1.0;
        console.log('🌪️ 使用玩家位置创建闪避特效:', emitterPosition);
    } else {
        console.warn('⚠️ 没有有效位置，无法创建闪避特效');
        return;
    }

    console.log('✨ 开始创建闪避特效...');

    // 创建主粒子系统（风属性残影）
    const particleSystem = new BABYLON.ParticleSystem("dodgeParticles", 200, scene);

    // 使用程序化创建圆形纹理
    const textureSize = 64;
    const dynamicTexture = new BABYLON.DynamicTexture("dodgeParticleTexture", textureSize, scene);
    const ctx = dynamicTexture.getContext();

    // 绘制渐变圆（青白色）
    const gradient = ctx.createRadialGradient(textureSize/2, textureSize/2, 0, textureSize/2, textureSize/2, textureSize/2);
    gradient.addColorStop(0, "rgba(220, 255, 255, 1)");
    gradient.addColorStop(0.5, "rgba(180, 240, 255, 0.8)");
    gradient.addColorStop(1, "rgba(150, 220, 240, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, textureSize, textureSize);
    dynamicTexture.update();

    particleSystem.particleTexture = dynamicTexture;

    // 发射器位置
    particleSystem.emitter = emitterPosition;

    // 粒子颜色（青色/白色，风属性）- 更亮更明显
    particleSystem.color1 = new BABYLON.Color4(0.9, 1.0, 1.0, 0.9);
    particleSystem.color2 = new BABYLON.Color4(0.7, 0.95, 1.0, 0.7);
    particleSystem.colorDead = new BABYLON.Color4(0.6, 0.85, 0.95, 0.0);

    // 粒子大小（增大）
    particleSystem.minSize = 0.15;
    particleSystem.maxSize = 0.35;

    // 粒子生命周期（延长）
    particleSystem.minLifeTime = 0.5;
    particleSystem.maxLifeTime = 0.8;

    // 高速发射（增加粒子数量）
    particleSystem.emitRate = 250;

    // 随机方向（模拟风，范围更大）
    particleSystem.direction1 = new BABYLON.Vector3(-3, 1, -3);
    particleSystem.direction2 = new BABYLON.Vector3(3, 2, 3);

    // 速度（更快）
    particleSystem.minEmitPower = 4;
    particleSystem.maxEmitPower = 6;

    // 持续时间
    particleSystem.targetStopDuration = 0.5;

    // 开始粒子系统
    particleSystem.start();

    // 存储以便清理
    if (!this.battle3D.particleSystems) this.battle3D.particleSystems = [];
    this.battle3D.particleSystems.push(particleSystem);

    // ✅ 额外添加光环效果（增强可见度）
    setTimeout(() => {
        if (!this.battle3D || !this.battle3D.scene) return;

        // 创建光环粒子（第二个粒子系统）
        const ringSystem = new BABYLON.ParticleSystem("dodgeRing", 100, scene);
        ringSystem.particleTexture = dynamicTexture;

        ringSystem.emitter = emitterPosition.clone();

        // 光环颜色（白色/青色）
        ringSystem.color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 0.6);
        ringSystem.color2 = new BABYLON.Color4(0.8, 1.0, 1.0, 0.4);
        ringSystem.colorDead = new BABYLON.Color4(0.7, 0.9, 1.0, 0.0);

        // 光环大小（大圆环）
        ringSystem.minSize = 0.3;
        ringSystem.maxSize = 0.6;

        // 生命周期
        ringSystem.minLifeTime = 0.3;
        ringSystem.maxLifeTime = 0.5;

        // 发射速率
        ringSystem.emitRate = 80;

        // 向外扩散
        ringSystem.direction1 = new BABYLON.Vector3(-2, 0.5, -2);
        ringSystem.direction2 = new BABYLON.Vector3(2, 1, 2);

        // 速度
        ringSystem.minEmitPower = 5;
        ringSystem.maxEmitPower = 7;

        // 持续时间
        ringSystem.targetStopDuration = 0.3;

        ringSystem.start();

        this.battle3D.particleSystems.push(ringSystem);
    }, 100);
};


// 创建火焰特效（✅ 改用粒子系统，移除丑陋的圆锥体）
EndlessCultivationGame.prototype.createFireEffects = function() {
    if (!this.battle3D || !this.battle3D.scene) return;

    // ✅ 只在熔岩地狱场景创建熔岩特效
    if (this.battle3D.sceneType !== BATTLE_SCENES.LAVA_HELL) {
        console.log('当前场景不是熔岩地狱，跳过熔岩特效创建');
        return;
    }

    console.log('🌋 创建熔岩地狱特效...');

    const scene = this.battle3D.scene;
    this.battle3D.fireEffects = []; // 保留数组结构以兼容现有代码

    // ✅ 创建熔岩喷泉粒子（5个喷泉点）
    for (let i = 0; i < 5; i++) {
        const geyserSystem = this.createLavaGeyser(scene, i);
        this.battle3D.particleSystems.push(geyserSystem);
    }

    // ✅ 创建黑烟粒子系统
    const smokeSystem = this.createLavaSmoke(scene);
    this.battle3D.particleSystems.push(smokeSystem);

    // ✅ 创建地面岩浆流动效果
    const lavaFlowSystem = this.createLavaFlow(scene);
    this.battle3D.particleSystems.push(lavaFlowSystem);

    console.log('✅ 熔岩地狱特效创建完成');
};

// 显示伤害数字
EndlessCultivationGame.prototype.showDamage = function(target, amount, type = 'red') {
    if (!this.battle3D || !this.battle3D.scene) return;

    // 使用HTML元素显示伤害数字
    const damageElement = document.createElement('div');
    damageElement.className = 'absolute pointer-events-none';

    // 根据类型设置不同样式
    if (type === 'crit') {
        // 暴击：更大字体、橙色、带爆炸效果
        damageElement.style.fontSize = '42px';
        damageElement.style.fontWeight = 'bold';
        damageElement.style.color = '#ff6600';
        damageElement.style.textShadow = '0 0 10px #ff0000, 0 0 20px #ff6600, 2px 2px 4px rgba(0, 0, 0, 0.8)';
        damageElement.textContent = '💥' + Math.floor(amount);
    } else if (type === 'red') {
        // 普通伤害
        damageElement.style.fontSize = '24px';
        damageElement.style.fontWeight = 'bold';
        damageElement.style.color = 'red';
        damageElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
        damageElement.textContent = '-' + Math.floor(amount);
    } else if (type === 'green') {
        // 治疗
        damageElement.style.fontSize = '24px';
        damageElement.style.fontWeight = 'bold';
        damageElement.style.color = 'green';
        damageElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
        damageElement.textContent = '+' + Math.floor(amount);
    } else {
        // 其他
        damageElement.style.fontSize = '24px';
        damageElement.style.fontWeight = 'bold';
        damageElement.style.color = 'white';
        damageElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
        damageElement.textContent = Math.floor(amount);
    }

    damageElement.style.zIndex = '9999';
    damageElement.style.position = 'absolute';

    // 获取战斗模态窗口
    const battleModal = document.getElementById('battle-modal');
    if (battleModal) {
        battleModal.appendChild(damageElement);

        // 计算屏幕坐标 - 使用世界坐标
        const camera = this.battle3D.camera;
        const engine = this.battle3D.engine;
        const scene = this.battle3D.scene;
        // 获取目标的世界坐标位置
        const worldPos = target.getAbsolutePosition ? target.getAbsolutePosition() : target.position;
        const screenPoint = BABYLON.Vector3.Project(
            worldPos,
            BABYLON.Matrix.Identity(),
            scene.getTransformMatrix(),
            camera.viewport
        );

        // 设置元素位置
        damageElement.style.left = `${screenPoint.x * engine.getRenderWidth()}px`;
        damageElement.style.top = `${(1 - screenPoint.y) * engine.getRenderHeight()}px`;
        damageElement.style.transform = 'translate(-50%, -50%)';

        // 动画（向上飘动并消失）
        const startTime = Date.now();
        const duration = type === 'crit' ? 1500 : 1000;  // 暴击持续更久

        const animateDamage = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 暴击有缩放效果
            if (type === 'crit') {
                const scale = 1 + Math.sin(progress * Math.PI) * 0.3;  // 先放大再缩小
                damageElement.style.transform = `translate(-50%, -${50 + progress * 100}px) scale(${scale})`;
            } else {
                damageElement.style.transform = `translate(-50%, -${50 + progress * 100}px)`;
            }
            // 渐隐
            damageElement.style.opacity = (1 - progress).toString();

            if (progress < 1) {
                requestAnimationFrame(animateDamage);
            } else {
                // 清理
                if (battleModal.contains(damageElement)) {
                    battleModal.removeChild(damageElement);
                }
            }
        };
        
        animateDamage();
    }
};

// 显示灵力变化
EndlessCultivationGame.prototype.showEnergyChange = function(target, amount) {
    if (!this.battle3D || !this.battle3D.scene) return;

    // 使用HTML元素显示灵力变化
    const energyElement = document.createElement('div');
    energyElement.className = 'absolute pointer-events-none';
    energyElement.style.fontSize = '20px';
    energyElement.style.fontWeight = 'bold';
    energyElement.style.color = amount > 0 ? 'cyan' : 'magenta';
    energyElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    energyElement.style.zIndex = '9999';
    energyElement.style.position = 'absolute';
    energyElement.textContent = amount > 0 ? `+${Math.floor(amount)}` : Math.floor(amount);
    
    // 获取战斗模态窗口
    const battleModal = document.getElementById('battle-modal');
    if (battleModal) {
        battleModal.appendChild(energyElement);
        
        // 计算屏幕坐标
        const camera = this.battle3D.camera;
        const engine = this.battle3D.engine;
        const scene = this.battle3D.scene;
        const screenPoint = BABYLON.Vector3.Project(
            target.position, 
            BABYLON.Matrix.Identity(), 
            scene.getTransformMatrix(), 
            camera.viewport
        );
        
        // 设置元素位置
        energyElement.style.left = `${screenPoint.x * engine.getRenderWidth()}px`;
        energyElement.style.top = `${(1 - screenPoint.y) * engine.getRenderHeight()}px`;
        energyElement.style.transform = 'translate(-50%, -50%)';
        
        // 动画（向上飘动并消失）
        const startTime = Date.now();
        const duration = 800;
        
        const animateEnergy = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 向上移动
            energyElement.style.transform = `translate(-50%, -${50 + progress * 100}px)`;
            // 渐隐
            energyElement.style.opacity = (1 - progress).toString();
            
            if (progress < 1) {
                requestAnimationFrame(animateEnergy);
            } else {
                // 清理
                if (battleModal.contains(energyElement)) {
                    battleModal.removeChild(energyElement);
                }
            }
        };
        
        animateEnergy();
    }
};

// 显示闪避提示
EndlessCultivationGame.prototype.showDodge = function(target, text) {
    if (!this.battle3D || !this.battle3D.scene) return;

    // 使用HTML元素显示闪避提示
    const dodgeElement = document.createElement('div');
    dodgeElement.className = 'absolute pointer-events-none';
    dodgeElement.style.fontSize = '20px';
    dodgeElement.style.fontWeight = 'bold';
    dodgeElement.style.color = 'yellow';
    dodgeElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    dodgeElement.style.zIndex = '9999';
    dodgeElement.style.position = 'absolute';
    dodgeElement.textContent = text;

    // 获取战斗模态窗口
    const battleModal = document.getElementById('battle-modal');
    if (battleModal) {
        battleModal.appendChild(dodgeElement);

        // 计算屏幕坐标 - 使用世界坐标
        const camera = this.battle3D.camera;
        const engine = this.battle3D.engine;
        const scene = this.battle3D.scene;
        // 获取目标的世界坐标位置
        const worldPos = target.getAbsolutePosition ? target.getAbsolutePosition() : target.position;
        const screenPoint = BABYLON.Vector3.Project(
            worldPos,
            BABYLON.Matrix.Identity(),
            scene.getTransformMatrix(),
            camera.viewport
        );

        // 设置元素位置
        const initialTop = (1 - screenPoint.y) * engine.getRenderHeight();
        dodgeElement.style.left = `${screenPoint.x * engine.getRenderWidth()}px`;
        dodgeElement.style.top = `${initialTop}px`;
        dodgeElement.style.transform = 'translate(-50%, -50%)';

        // 动画（向上飘动并消失）
        const startTime = Date.now();
        const duration = 1000;

        const animateDodge = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 向上移动（修改 top 值而不是 transform）
            dodgeElement.style.top = `${initialTop - progress * 100}px`;
            // 渐隐
            dodgeElement.style.opacity = (1 - progress).toString();

            if (progress < 1) {
                requestAnimationFrame(animateDodge);
            } else {
                // 清理元素
                if (battleModal.contains(dodgeElement)) {
                    battleModal.removeChild(dodgeElement);
                }
            }
        };

        animateDodge();
    }
};

// ==================== 战斗动画循环（战斗场景专用） ====================

// 动画循环（处理战斗场景的动画）
EndlessCultivationGame.prototype.animateBattle3D = function() {
    if (!this.battle3D) return;

    // 玩家和敌人动画（受击动画期间暂停闲置动画）
    if (this.battle3D.player && !this.battle3D.isPlayerHitAnimating) {
        const time = Date.now() * 0.003;
        this.battle3D.player.position.y = Math.sin(time) * 0.05;
    }

    if (this.battle3D.enemy && !this.battle3D.isEnemyHitAnimating) {
        // 战斗场景敌人保持静态面向玩家，不旋转
        this.battle3D.enemy.rotation.y = -Math.PI / 2; // 面向玩家方向（-X方向）
        // 飞行类敌人添加微小浮动动画
        if (this.battle3D.enemyIsFlying) {
            const time = Date.now() * 0.002;
            this.battle3D.enemy.position.y = -0.7 + Math.sin(time) * 0.05;
        }
    }

    // ✅ 火焰特效已改用粒子系统（自动动画，无需手动控制）
};

// ==================== 技能选择菜单 ====================

// 显示技能选择菜单
EndlessCultivationGame.prototype.showSkillSelectionMenu = function(skillType, event) {
    // 移除已存在的菜单
    const existingMenu = document.getElementById('skill-selection-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    // 获取该类型的所有可用技能
    const availableSkills = this.realmSkillSystem.getAvailableSkillsByType(skillType);

    if (availableSkills.length === 0) {
        this.addBattleLog(`没有可用的${skillType === 'attack' ? '攻击' : skillType === 'defense' ? '防御' : skillType === 'recovery' ? '恢复' : '特殊'}技能！`);
        return;
    }

    // 创建菜单容器
    const menu = document.createElement('div');
    menu.id = 'skill-selection-menu';
    menu.className = 'fixed bg-dark/95 border border-accent/50 rounded-lg shadow-xl p-3 z-50 max-h-96 overflow-y-auto';
    // 临时隐藏以计算尺寸
    menu.style.visibility = 'hidden';
    menu.style.position = 'fixed';

    // 标题
    const title = document.createElement('div');
    title.className = 'text-sm font-bold text-accent mb-2 border-b border-accent/30 pb-2';
    title.textContent = `选择${skillType === 'attack' ? '攻击' : skillType === 'defense' ? '防御' : skillType === 'recovery' ? '恢复' : '特殊'}技能`;
    menu.appendChild(title);

    // 当前装备的技能ID
    const currentEquippedId = this.gameState.player.skills.equipped?.[skillType];

    // 技能列表
    availableSkills.forEach(skill => {
        const skillItem = document.createElement('div');
        skillItem.className = `cursor-pointer p-2 rounded hover:bg-accent/20 transition-colors mb-1 ${
            skill.skillTreeId === currentEquippedId ? 'bg-accent/30 border border-accent' : ''
        }`;

        // 技能信息
        const skillInfo = document.createElement('div');
        skillInfo.className = 'flex items-center justify-between';

        const leftInfo = document.createElement('div');
        leftInfo.className = 'flex-1';

        // 技能名称和境界
        const nameLine = document.createElement('div');
        nameLine.className = 'text-sm font-medium text-white';
        const skillDisplayName = skill.displayName || skill.name;
        nameLine.innerHTML = `<span class="text-accent">[${skill.realmName}]</span> ${skillDisplayName} <span class="text-light/60">Lv.${skill.level}</span>`;
        leftInfo.appendChild(nameLine);

        // 技能描述
        if (skill.description) {
            const descLine = document.createElement('div');
            descLine.className = 'text-xs text-light/70 mt-1';
            descLine.textContent = skill.description;
            leftInfo.appendChild(descLine);
        }

        // 消耗和效果
        const statsLine = document.createElement('div');
        statsLine.className = 'text-xs text-light/60 mt-1';
        statsLine.textContent = `消耗${skill.energyCost}灵力`;

        // 根据类型显示不同效果
        if (skill.damageMultiplier) {
            statsLine.textContent += ` | ${skill.damageMultiplier}x伤害`;
        }
        if (skill.defenseBonus) {
            statsLine.textContent += ` | 减伤${Math.round(skill.defenseBonus * 100)}%`;
        }
        if (skill.healPercentage) {
            statsLine.textContent += ` | 恢复${Math.round(skill.healPercentage * 100)}%HP`;
        }
        if (skill.dodgeBonus) {
            statsLine.textContent += ` | +${Math.round(skill.dodgeBonus * 100)}%闪避`;
        }
        if (skill.criticalBonus) {
            statsLine.textContent += ` | +${Math.round(skill.criticalBonus * 100)}%暴击`;
        }

        leftInfo.appendChild(statsLine);

        skillInfo.appendChild(leftInfo);

        // 当前装备标识
        if (skill.skillTreeId === currentEquippedId) {
            const equippedBadge = document.createElement('div');
            equippedBadge.className = 'text-xs text-accent ml-2';
            equippedBadge.textContent = '已装备';
            skillInfo.appendChild(equippedBadge);
        }

        skillItem.appendChild(skillInfo);

        // 点击选择技能
        skillItem.addEventListener('click', () => {
            // 装备技能
            if (!this.gameState.player.skills.equipped) {
                this.gameState.player.skills.equipped = {
                    attack: null,
                    defense: null,
                    recovery: null,
                    special: null
                };
            }
            this.gameState.player.skills.equipped[skillType] = skill.skillTreeId;

            const skillDisplay = skill.displayName || skill.name;
            this.addBattleLog(`装备了技能: ${skillDisplay}`);

            // 移除菜单
            menu.remove();

            // 重新生成技能按钮
            this.updateBattleSkillButtons();
        });

        menu.appendChild(skillItem);
    });

    // 先将菜单添加到DOM以计算尺寸
    document.body.appendChild(menu);

    // 智能定位：计算最佳显示位置
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 10; // 距离屏幕边缘的最小距离

    let left = event.clientX;
    let top = event.clientY;

    // 水平位置：优先向右展开，如果超出则向左
    if (left + menuRect.width + padding > viewportWidth) {
        left = viewportWidth - menuRect.width - padding;
    }
    if (left < padding) {
        left = padding;
    }

    // 垂直位置：优先向上展开（更友好），如果空间不足则向下
    const spaceAbove = event.clientY - padding;
    const spaceBelow = viewportHeight - event.clientY - padding;

    if (spaceAbove >= menuRect.height || spaceAbove > spaceBelow) {
        // 向上展开
        top = event.clientY - menuRect.height;
        if (top < padding) {
            top = padding;
        }
    } else {
        // 向下展开
        top = event.clientY + padding;
        if (top + menuRect.height + padding > viewportHeight) {
            top = viewportHeight - menuRect.height - padding;
        }
    }

    // 应用最终位置并显示
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.visibility = 'visible';

    // 点击其他地方关闭菜单
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
};

// 更新战斗技能按钮（不重新生成整个战斗场景）
EndlessCultivationGame.prototype.updateBattleSkillButtons = function() {
    const attackSkillsContainer = document.getElementById('attack-skills');
    if (!attackSkillsContainer) return;

    // 获取所有技能按钮（跳过普通攻击按钮）
    const skillButtons = attackSkillsContainer.querySelectorAll('button[data-skill-type]');

    skillButtons.forEach(button => {
        const skillType = button.getAttribute('data-skill-type');
        const equippedSkillId = this.gameState.player.skills.equipped?.[skillType];

        let skill = null;
        let skillTree = null;

        if (equippedSkillId) {
            skillTree = this.metadata.realmSkills?.find(tree => tree.id === equippedSkillId);
            if (skillTree) {
                const skillLevel = this.gameState.player.skills.levels[equippedSkillId] || 0;
                if (skillLevel > 0) {
                    skill = skillTree.levels[skillLevel - 1];
                }
            }
        }

        if (skill && skillTree) {
            // 更新按钮
            const realmName = this.metadata.realmConfig?.[skillTree.realmRequired]?.name || '未知境界';
            const skillDisplayName = skill.displayName || skill.name;
            button.setAttribute('data-tooltip', `${skillDisplayName}: ${skill.description || ''}，消耗${skill.energyCost}灵力，${realmName} (右键切换)`);
            const skillImage = skill.imageId ? `Images/skill-${skill.imageId}.jpg` : `Images/skill-${skillType === 'attack' ? 1 : skillType === 'defense' ? 4 : skillType === 'recovery' ? 3 : 2}.jpg`;
            button.innerHTML = `<img src="${skillImage}" alt="${skillDisplayName}" class="w-full h-full object-cover">`;
            button.classList.remove('opacity-50');
        } else {
            // 没有装备技能
            const typeConfig = {
                attack: { icon: 'skill-1.jpg', name: '攻击技能' },
                defense: { icon: 'skill-4.jpg', name: '防御技能' },
                recovery: { icon: 'skill-3.jpg', name: '恢复技能' },
                special: { icon: 'skill-2.jpg', name: '特殊技能' }
            };
            const config = typeConfig[skillType];
            button.setAttribute('data-tooltip', `${config.name}（未装备）- 点击或右键选择技能`);
            button.innerHTML = `<img src="Images/${config.icon}" alt="${config.name}" class="w-full h-full object-cover opacity-50">`;
        }
    });
};

// ==================== 场景粒子系统 ====================

/**
 * 创建场景粒子特效
 * @param {string} particleType - 粒子类型（'spirit_energy', 'clouds', 'water_drops' 等）
 */
EndlessCultivationGame.prototype.createSceneParticles = function(particleType) {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    switch (particleType) {
        case 'spirit_energy':
            this.createSpiritEnergyParticles(scene);
            break;
        case 'clouds':
            this.createCloudParticles(scene);
            break;
        case 'water_drops':
            this.createWaterDropParticles(scene);
            break;
        case 'stars':
            this.createStarParticles(scene);
            break;
        case 'fire_sparks':
            this.createFireSparkParticles(scene);
            break;
        case 'snowflakes':
            this.createSnowflakeParticles(scene);
            break;
        case 'ice_crystals':
            this.createIceCrystalParticles(scene);
            break;
        case 'water_ripples':
            this.createWaterRippleParticles(scene);
            break;
        case 'nebula_vortex':
            this.createNebulaVortexParticles(scene);
            break;
        case 'flying_flowers':
            this.createFlyingFlowerParticles(scene);
            break;
    }
};

/**
 * 创建场景装饰物
 * @param {string} decorationType - 装饰物类型（'snow_piles', 'snowmen' 等）
 */
EndlessCultivationGame.prototype.createSceneDecorations = function(decorationType) {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    switch (decorationType) {
        case 'snow_piles':
            this.createSnowPiles(scene);
            break;
        case 'snowmen':
            this.createSnowmen(scene);
            break;
        case 'peach_trees':
            this.createPeachTrees(scene);
            break;
    }
};

/**
 * 灵气粒子 - 淡蓝色光点向上漂浮（仙山峰顶）
 * ✅ 增强版：更大的粒子、更强的发光效果、更高的密度
 */
EndlessCultivationGame.prototype.createSpiritEnergyParticles = function(scene) {
    const particleSystem = new BABYLON.ParticleSystem("spiritEnergy", 300, scene); // ✅ 100 -> 300

    // 使用内置的圆形纹理
    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置（地面）
    particleSystem.emitter = new BABYLON.Vector3(0, -0.5, 0);

    // 粒子属性
    particleSystem.minSize = 0.12; // ✅ 0.05 -> 0.12
    particleSystem.maxSize = 0.35; // ✅ 0.15 -> 0.35

    particleSystem.minLifeTime = 4; // ✅ 3 -> 4 (更持久)
    particleSystem.maxLifeTime = 7; // ✅ 5 -> 7

    particleSystem.emitRate = 40; // ✅ 15 -> 40

    // 颜色（✨ 增强的淡蓝色发光 - 更亮、更饱和）
    particleSystem.color1 = new BABYLON.Color4(0.4, 0.9, 1.0, 1.0); // ✅ alpha 0.8 -> 1.0
    particleSystem.color2 = new BABYLON.Color4(0.6, 0.95, 1.0, 0.9); // ✅ alpha 0.6 -> 0.9
    particleSystem.colorDead = new BABYLON.Color4(0.7, 0.95, 1.0, 0.0);

    // 方向和速度（向上）
    particleSystem.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
    particleSystem.direction2 = new BABYLON.Vector3(0.5, 1.5, 0.5);

    particleSystem.minEmitPower = 0.6; // ✅ 0.5 -> 0.6
    particleSystem.maxEmitPower = 1.2; // ✅ 1.0 -> 1.2

    // 发射范围（整个战场）
    particleSystem.minEmitBox = new BABYLON.Vector3(-6, 0, -6);
    particleSystem.maxEmitBox = new BABYLON.Vector3(6, 0, 6);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 启动
    particleSystem.start();

    // 保存到 battle3D
    this.battle3D.particleSystems.push(particleSystem);
};

/**
 * 飞花粒子 - 花瓣飘落（仙山峰顶）
 * ✅ 终极增强版：非常大且明显的粉红色花瓣，降低高度确保可见
 */
EndlessCultivationGame.prototype.createFlyingFlowerParticles = function(scene) {
    console.log('🌸 开始创建飞花粒子...');

    const particleSystem = new BABYLON.ParticleSystem("flyingFlowers", 500, scene); // ✅ 400 -> 500

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // ✅ 发射器位置（降低高度，更容易看到）
    particleSystem.emitter = new BABYLON.Vector3(0, 5, 0); // ✅ 8 -> 5 降低发射高度

    // ✅ 粒子属性（超大花瓣，确保可见）
    particleSystem.minSize = 0.4; // ✅ 0.25 -> 0.4 再次增大60%
    particleSystem.maxSize = 0.8; // ✅ 0.5 -> 0.8 再次增大60%

    particleSystem.minLifeTime = 6;
    particleSystem.maxLifeTime = 10;

    particleSystem.emitRate = 50; // ✅ 40 -> 50 再次提高发射率

    // ✅ 颜色（柔和的粉红色，降低亮度50%）
    particleSystem.color1 = new BABYLON.Color4(0.5, 0.1, 0.2, 0.5); // ✅ 降低亮度：R1.0->0.5, alpha 1.0->0.5
    particleSystem.color2 = new BABYLON.Color4(0.7, 0.25, 0.35, 0.4); // ✅ 降低亮度：R1.0->0.7, alpha 1.0->0.4
    particleSystem.colorDead = new BABYLON.Color4(0.5, 0.15, 0.25, 0.0);

    // ✅ 方向和速度（明显的飘落+风吹）
    particleSystem.direction1 = new BABYLON.Vector3(-1.2, -0.8, -1.2);
    particleSystem.direction2 = new BABYLON.Vector3(1.2, -0.3, 1.2);

    particleSystem.minEmitPower = 0.6;
    particleSystem.maxEmitPower = 1.5;

    // 重力（缓慢下落）
    particleSystem.gravity = new BABYLON.Vector3(0, -0.1, 0);

    // ✅ 发射范围（降低高度，更容易看到）
    particleSystem.minEmitBox = new BABYLON.Vector3(-10, -2, -10);
    particleSystem.maxEmitBox = new BABYLON.Vector3(10, 2, 10);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 启动
    particleSystem.start();

    // ✅ 延迟500ms后检查粒子数量
    setTimeout(() => {
        const count = particleSystem.getActiveCount();
        console.log(`🌸 飞花粒子运行中 - 当前粒子数: ${count}`);
    }, 500);

    // 保存
    this.battle3D.particleSystems.push(particleSystem);

    console.log('🌸 飞花粒子已启动（终极增强版）- 发射高度: 5米');

    return particleSystem;
};

/**
 * 云雾粒子 - 白色雾气在地面流动（仙山峰顶）
 * ✅ 修复版：半透明云雾效果，不再遮挡视野
 */
EndlessCultivationGame.prototype.createCloudParticles = function(scene) {
    const particleSystem = new BABYLON.ParticleSystem("clouds", 60, scene); // ✅ 120 -> 60 (减少数量)

    // 使用白色半透明纹理
    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置
    particleSystem.emitter = new BABYLON.Vector3(0, -0.8, 0);

    // 粒子属性（✅ 减小尺寸，避免遮挡屏幕）
    particleSystem.minSize = 0.8; // ✅ 2.5 -> 0.8
    particleSystem.maxSize = 1.5; // ✅ 5.0 -> 1.5

    particleSystem.minLifeTime = 6; // ✅ 10 -> 6
    particleSystem.maxLifeTime = 8; // ✅ 15 -> 8

    particleSystem.emitRate = 2; // ✅ 6 -> 2 (降低发射率)

    // 颜色（✅ 大幅降低透明度，让云雾更柔和）
    particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 0.15); // ✅ alpha 0.5 -> 0.15
    particleSystem.color2 = new BABYLON.Color4(0.95, 0.98, 1, 0.1); // ✅ alpha 0.4 -> 0.1
    particleSystem.colorDead = new BABYLON.Color4(0.9, 0.95, 1, 0.0);

    // 方向和速度（水平移动）
    particleSystem.direction1 = new BABYLON.Vector3(-1, 0.1, -1);
    particleSystem.direction2 = new BABYLON.Vector3(1, 0.2, 1);

    particleSystem.minEmitPower = 0.2;
    particleSystem.maxEmitPower = 0.5;

    // 发射范围
    particleSystem.minEmitBox = new BABYLON.Vector3(-8, 0, -8);
    particleSystem.maxEmitBox = new BABYLON.Vector3(8, 0, 8);

    // 混合模式（✅ 改用ADD模式，更透明更梦幻）
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 启动
    particleSystem.start();

    // 保存
    this.battle3D.particleSystems.push(particleSystem);
};

/**
 * 水滴粒子 - 湖面水珠飞溅（碧波湖畔）
 * ✅ 增强版：更大的水滴、更强的反光效果、更高的密度
 */
EndlessCultivationGame.prototype.createWaterDropParticles = function(scene) {
    const particleSystem = new BABYLON.ParticleSystem("waterDrops", 180, scene); // ✅ 80 -> 180

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置（低空）
    particleSystem.emitter = new BABYLON.Vector3(0, 0.5, 0);

    // 粒子属性
    particleSystem.minSize = 0.06; // ✅ 0.03 -> 0.06
    particleSystem.maxSize = 0.15; // ✅ 0.08 -> 0.15

    particleSystem.minLifeTime = 2; // ✅ 1.5 -> 2
    particleSystem.maxLifeTime = 4; // ✅ 3 -> 4

    particleSystem.emitRate = 35; // ✅ 20 -> 35

    // 颜色（✨ 增强的淡蓝色水滴 - 更亮、更强的反光感）
    particleSystem.color1 = new BABYLON.Color4(0.5, 0.9, 1.0, 1.0); // ✅ alpha 0.9 -> 1.0
    particleSystem.color2 = new BABYLON.Color4(0.6, 0.95, 1.0, 0.95); // ✅ alpha 0.7 -> 0.95
    particleSystem.colorDead = new BABYLON.Color4(0.7, 0.98, 1.0, 0.0);

    // 方向和速度（向上后下落）
    particleSystem.direction1 = new BABYLON.Vector3(-0.3, 1, -0.3);
    particleSystem.direction2 = new BABYLON.Vector3(0.3, 1.2, 0.3);

    particleSystem.minEmitPower = 1.0; // ✅ 0.8 -> 1.0
    particleSystem.maxEmitPower = 1.8; // ✅ 1.5 -> 1.8

    // 重力（水滴会下落）
    particleSystem.gravity = new BABYLON.Vector3(0, -3, 0);

    // 发射范围
    particleSystem.minEmitBox = new BABYLON.Vector3(-5, 0, -5);
    particleSystem.maxEmitBox = new BABYLON.Vector3(5, 0, 5);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 启动
    particleSystem.start();

    // 保存
    this.battle3D.particleSystems.push(particleSystem);
};

/**
 * 星辰粒子 - 星空闪烁（虚空秘境）
 * ✅ 增强版：更大的星星、更强的闪烁效果、更多的颜色变化
 */
EndlessCultivationGame.prototype.createStarParticles = function(scene) {
    const particleSystem = new BABYLON.ParticleSystem("stars", 400, scene); // ✅ 150 -> 400

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置（整个空间）
    particleSystem.emitter = new BABYLON.Vector3(0, 3, 0);

    // 粒子属性
    particleSystem.minSize = 0.04; // ✅ 0.02 -> 0.04
    particleSystem.maxSize = 0.12; // ✅ 0.06 -> 0.12

    particleSystem.minLifeTime = 6; // ✅ 5 -> 6
    particleSystem.maxLifeTime = 12; // ✅ 10 -> 12

    particleSystem.emitRate = 15; // ✅ 8 -> 15

    // 颜色（✨ 增强的白色/金色星星 - 更亮、更丰富的颜色）
    particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 1.0);
    particleSystem.color2 = new BABYLON.Color4(1, 0.9, 0.6, 1.0); // ✅ 增强金色
    particleSystem.colorDead = new BABYLON.Color4(0.7, 0.85, 1, 0.0);

    // 方向和速度（缓慢漂浮）
    particleSystem.direction1 = new BABYLON.Vector3(-0.1, -0.1, -0.1);
    particleSystem.direction2 = new BABYLON.Vector3(0.1, 0.1, 0.1);

    particleSystem.minEmitPower = 0.05;
    particleSystem.maxEmitPower = 0.15;

    // 发射范围（球形空间）
    particleSystem.minEmitBox = new BABYLON.Vector3(-8, -2, -8);
    particleSystem.maxEmitBox = new BABYLON.Vector3(8, 6, 8);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 启动
    particleSystem.start();

    // 保存
    this.battle3D.particleSystems.push(particleSystem);
};

/**
 * 创建星云漩涡粒子（虚空秘境）
 * @param {BABYLON.Scene} scene - 场景
 */
EndlessCultivationGame.prototype.createNebulaVortexParticles = function(scene) {
    const particleSystem = new BABYLON.ParticleSystem("nebulaVortex", 100, scene);

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置（高空）
    particleSystem.emitter = new BABYLON.Vector3(0, 3, 0);

    // ✅ 粒子属性（大型星云雾气）
    particleSystem.minSize = 1.5;
    particleSystem.maxSize = 3.5;

    particleSystem.minLifeTime = 6;
    particleSystem.maxLifeTime = 10;

    particleSystem.emitRate = 6;

    // ✅ 颜色（降低亮度50%的紫色星云）
    particleSystem.color1 = new BABYLON.Color4(0.25, 0.1, 0.4, 0.13); // ✅ 降低50%亮度
    particleSystem.color2 = new BABYLON.Color4(0.35, 0.25, 0.5, 0.1); // ✅ 降低50%亮度
    particleSystem.colorDead = new BABYLON.Color4(0.15, 0.05, 0.3, 0.0);

    // ✅ 方向和速度（螺旋缓慢旋转）
    particleSystem.direction1 = new BABYLON.Vector3(-0.5, 0, -0.5);
    particleSystem.direction2 = new BABYLON.Vector3(0.5, 0.3, 0.5);

    particleSystem.minEmitPower = 0.2;
    particleSystem.maxEmitPower = 0.5;

    // 发射范围（球形空间）
    particleSystem.minEmitBox = new BABYLON.Vector3(-8, -2, -8);
    particleSystem.maxEmitBox = new BABYLON.Vector3(8, 6, 8);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 启动
    particleSystem.start();

    console.log('🌌 星云漩涡粒子已启动');

    // 保存
    this.battle3D.particleSystems.push(particleSystem);
};

/**
 * 火星粒子 - 火星四溅（熔岩地狱）
 * ✅ 增强版：更密集的火星、更强的火焰效果、更炫目的颜色
 */
EndlessCultivationGame.prototype.createFireSparkParticles = function(scene) {
    const particleSystem = new BABYLON.ParticleSystem("fireSparks", 500, scene); // ✅ 200 -> 500

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置（地面随机位置）
    particleSystem.emitter = new BABYLON.Vector3(0, -0.8, 0);

    // 粒子属性
    particleSystem.minSize = 0.04; // ✅ 0.02 -> 0.04
    particleSystem.maxSize = 0.18; // ✅ 0.1 -> 0.18

    particleSystem.minLifeTime = 0.8; // ✅ 0.5 -> 0.8
    particleSystem.maxLifeTime = 2.5; // ✅ 2 -> 2.5

    particleSystem.emitRate = 80; // ✅ 50 -> 80

    // 颜色（✨ 增强的橙红色火焰 - 更亮、更强的对比）
    particleSystem.color1 = new BABYLON.Color4(1.0, 0.6, 0.1, 1.0); // ✅ 更亮的橙色
    particleSystem.color2 = new BABYLON.Color4(1.0, 0.9, 0.3, 1.0); // ✅ 更亮的黄色
    particleSystem.colorDead = new BABYLON.Color4(0.6, 0.2, 0.0, 0.0);

    // 方向和速度（向上喷射）
    particleSystem.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
    particleSystem.direction2 = new BABYLON.Vector3(0.5, 2.5, 0.5); // ✅ 增强垂直速度

    particleSystem.minEmitPower = 2.5; // ✅ 2 -> 2.5
    particleSystem.maxEmitPower = 5; // ✅ 4 -> 5

    // 重力（火星会下落）
    particleSystem.gravity = new BABYLON.Vector3(0, -8, 0);

    // 发射范围
    particleSystem.minEmitBox = new BABYLON.Vector3(-6, 0, -6);
    particleSystem.maxEmitBox = new BABYLON.Vector3(6, 0, 6);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 启动
    particleSystem.start();

    // 保存
    this.battle3D.particleSystems.push(particleSystem);
};

/**
 * 雪花粒子 - 雪花飘落（冰封雪谷）
 * ✅ 增强版：更大的雪花、更密集的飘落、更真实的飘动效果
 */
EndlessCultivationGame.prototype.createSnowflakeParticles = function(scene) {
    const particleSystem = new BABYLON.ParticleSystem("snowflakes", 600, scene); // ✅ 300 -> 600

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置（高空）
    particleSystem.emitter = new BABYLON.Vector3(0, 8, 0);

    // 粒子属性
    particleSystem.minSize = 0.08; // ✅ 0.05 -> 0.08
    particleSystem.maxSize = 0.22; // ✅ 0.15 -> 0.22

    particleSystem.minLifeTime = 5; // ✅ 4 -> 5
    particleSystem.maxLifeTime = 10; // ✅ 8 -> 10

    particleSystem.emitRate = 70; // ✅ 40 -> 70

    // ✨ 颜色（增强的白色雪花 - 更明显、更柔和）
    particleSystem.color1 = new BABYLON.Color4(0.95, 0.98, 1.0, 0.7); // ✅ alpha 0.5 -> 0.7
    particleSystem.color2 = new BABYLON.Color4(0.98, 1.0, 1.0, 0.6); // ✅ alpha 0.4 -> 0.6
    particleSystem.colorDead = new BABYLON.Color4(0.9, 0.95, 1.0, 0.0);

    // 方向和速度（缓慢下落，有风吹动效果）
    particleSystem.direction1 = new BABYLON.Vector3(-0.5, -1, -0.5);
    particleSystem.direction2 = new BABYLON.Vector3(0.5, -1, 0.5);

    particleSystem.minEmitPower = 0.4; // ✅ 0.3 -> 0.4
    particleSystem.maxEmitPower = 1.0; // ✅ 0.8 -> 1.0

    // 重力（缓慢下落）
    particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);

    // 发射范围（高空大面积）
    particleSystem.minEmitBox = new BABYLON.Vector3(-10, 0, -10);
    particleSystem.maxEmitBox = new BABYLON.Vector3(10, 0, 10);

    // ✅ 混合模式改为ADD（更柔和透明）
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 启动
    particleSystem.start();

    // 保存
    this.battle3D.particleSystems.push(particleSystem);
};

// ==================== 碧波湖畔专属特效 ====================

/**
 * 创建水面波纹粒子（碧波湖畔）
 * ✅ 优化版：柔和不刺眼的湖蓝色波纹
 */
EndlessCultivationGame.prototype.createWaterRippleParticles = function(scene) {
    const particleSystem = new BABYLON.ParticleSystem("waterRipples", 80, scene);

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置（地面/水面）
    particleSystem.emitter = new BABYLON.Vector3(0, -0.85, 0);

    // ✅ 粒子属性（适中的波纹大小）
    particleSystem.minSize = 1.2;
    particleSystem.maxSize = 2.8;

    particleSystem.minLifeTime = 2.5;
    particleSystem.maxLifeTime = 4.5;

    particleSystem.emitRate = 12;

    // ✅ 颜色（降低亮度50%的柔和湖蓝色）
    particleSystem.color1 = new BABYLON.Color4(0.15, 0.3, 0.4, 0.18); // ✅ 再降低50%
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.35, 0.48, 0.14); // ✅ 再降低50%
    particleSystem.colorDead = new BABYLON.Color4(0.1, 0.25, 0.4, 0.0);

    // ✅ 方向和速度（缓慢扩散，主要是水平方向）
    particleSystem.direction1 = new BABYLON.Vector3(-0.3, 0.05, -0.3);
    particleSystem.direction2 = new BABYLON.Vector3(0.3, 0.15, 0.3);

    particleSystem.minEmitPower = 0.08;
    particleSystem.maxEmitPower = 0.25;

    // 发射范围（整个水面）
    particleSystem.minEmitBox = new BABYLON.Vector3(-6, 0, -6);
    particleSystem.maxEmitBox = new BABYLON.Vector3(6, 0, 6);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 启动
    particleSystem.start();

    console.log('🌊 水面波纹粒子已启动（柔和版）');

    // 保存
    this.battle3D.particleSystems.push(particleSystem);
};

// ==================== 熔岩地狱专属特效 ====================

/**
 * 创建熔岩喷泉粒子（熔岩地狱）
 * @param {BABYLON.Scene} scene - 场景
 * @param {number} index - 喷泉索引
 */
EndlessCultivationGame.prototype.createLavaGeyser = function(scene, index) {
    const particleSystem = new BABYLON.ParticleSystem(`lavaGeyser${index}`, 150, scene);

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // ✅ 发射器位置（随机分布在战场）
    const randomX = (Math.random() - 0.5) * 10;
    const randomZ = (Math.random() - 0.5) * 10;
    particleSystem.emitter = new BABYLON.Vector3(randomX, -0.8, randomZ);

    // ✅ 粒子属性（大型熔岩颗粒）
    particleSystem.minSize = 0.15;
    particleSystem.maxSize = 0.35;

    particleSystem.minLifeTime = 1.0;
    particleSystem.maxLifeTime = 2.0;

    particleSystem.emitRate = 25;

    // ✅ 颜色（降低亮度50%的橙红色熔岩）
    particleSystem.color1 = new BABYLON.Color4(0.5, 0.2, 0.0, 0.5); // ✅ 降低50%亮度
    particleSystem.color2 = new BABYLON.Color4(0.5, 0.3, 0.05, 0.45); // ✅ 降低50%亮度
    particleSystem.colorDead = new BABYLON.Color4(0.3, 0.1, 0.0, 0.0);

    // ✅ 方向和速度（向上喷射后下落）
    particleSystem.direction1 = new BABYLON.Vector3(-0.3, 1, -0.3);
    particleSystem.direction2 = new BABYLON.Vector3(0.3, 1.5, 0.3);

    particleSystem.minEmitPower = 3;
    particleSystem.maxEmitPower = 5;

    // ✅ 重力（熔岩颗粒会下落）
    particleSystem.gravity = new BABYLON.Vector3(0, -6, 0);

    // 发射范围（小范围）
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.3, 0, -0.3);
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.3, 0, 0.3);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 启动
    particleSystem.start();

    return particleSystem;
};

/**
 * 创建熔岩黑烟粒子（熔岩地狱）
 * ✅ 修复版：避免灰色长方形问题
 * @param {BABYLON.Scene} scene - 场景
 */
EndlessCultivationGame.prototype.createLavaSmoke = function(scene) {
    const particleSystem = new BABYLON.ParticleSystem("lavaSmoke", 40, scene); // ✅ 80 -> 40 减少数量

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置（地面）
    particleSystem.emitter = new BABYLON.Vector3(0, 0, 0);

    // ✅ 粒子属性（减小尺寸，避免遮挡屏幕）
    particleSystem.minSize = 0.4; // ✅ 1.0 -> 0.4
    particleSystem.maxSize = 0.9; // ✅ 2.5 -> 0.9

    particleSystem.minLifeTime = 4; // ✅ 3 -> 4 稍微延长
    particleSystem.maxLifeTime = 6; // ✅ 5 -> 6

    particleSystem.emitRate = 3; // ✅ 8 -> 3 大幅减少发射率

    // ✅ 颜色（降低亮度50%的深灰色半透明烟雾）
    particleSystem.color1 = new BABYLON.Color4(0.1, 0.08, 0.05, 0.04); // ✅ 降低50%亮度
    particleSystem.color2 = new BABYLON.Color4(0.12, 0.1, 0.08, 0.025); // ✅ 降低50%亮度
    particleSystem.colorDead = new BABYLON.Color4(0.08, 0.05, 0.03, 0.0);

    // ✅ 方向和速度（缓慢上升）
    particleSystem.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
    particleSystem.direction2 = new BABYLON.Vector3(0.5, 1.5, 0.5);

    particleSystem.minEmitPower = 0.5;
    particleSystem.maxEmitPower = 1.0;

    // 发射范围（整个战场）
    particleSystem.minEmitBox = new BABYLON.Vector3(-6, -0.8, -6);
    particleSystem.maxEmitBox = new BABYLON.Vector3(6, -0.8, 6);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

    // 启动
    particleSystem.start();

    return particleSystem;
};

/**
 * 创建岩浆流动效果（熔岩地狱地面）
 * @param {BABYLON.Scene} scene - 场景
 */
EndlessCultivationGame.prototype.createLavaFlow = function(scene) {
    const particleSystem = new BABYLON.ParticleSystem("lavaFlow", 100, scene);

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置（地面）
    particleSystem.emitter = new BABYLON.Vector3(0, -0.9, 0);

    // ✅ 粒子属性（扁平发光熔岩）
    particleSystem.minSize = 0.5;
    particleSystem.maxSize = 1.2;

    particleSystem.minLifeTime = 4;
    particleSystem.maxLifeTime = 6;

    particleSystem.emitRate = 10;

    // ✅ 颜色（降低亮度50%的橙黄色岩浆）
    particleSystem.color1 = new BABYLON.Color4(0.5, 0.25, 0.0, 0.3); // ✅ 降低50%亮度
    particleSystem.color2 = new BABYLON.Color4(0.5, 0.35, 0.1, 0.25); // ✅ 降低50%亮度
    particleSystem.colorDead = new BABYLON.Color4(0.4, 0.15, 0.0, 0.0);

    // ✅ 方向和速度（缓慢流动）
    particleSystem.direction1 = new BABYLON.Vector3(-1, 0, -1);
    particleSystem.direction2 = new BABYLON.Vector3(1, 0.1, 1);

    particleSystem.minEmitPower = 0.2;
    particleSystem.maxEmitPower = 0.4;

    // 发射范围（整个地面）
    particleSystem.minEmitBox = new BABYLON.Vector3(-7, 0, -7);
    particleSystem.maxEmitBox = new BABYLON.Vector3(7, 0, 7);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 启动
    particleSystem.start();

    return particleSystem;
};

// ==================== 冰封雪谷专属特效 ====================

/**
 * 创建冰晶闪烁粒子（冰封雪谷）
 * @param {BABYLON.Scene} scene - 场景
 * ✅ 增强版：更大更亮的冰晶，更容易看到
 */
EndlessCultivationGame.prototype.createIceCrystalParticles = function(scene) {
    console.log('❄️ 开始创建冰晶粒子（深金色+ADD模式，超低亮度）...');

    const particleSystem = new BABYLON.ParticleSystem("iceCrystals", 150, scene);

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // ✅ 发射器位置（场景中心，低空）
    particleSystem.emitter = new BABYLON.Vector3(0, 1, 0); // ✅ y=2 -> 1

    // ✅ 粒子属性（超大金色冰晶）
    particleSystem.minSize = 0.3; // ✅ 0.2 -> 0.3 再增大
    particleSystem.maxSize = 0.8; // ✅ 0.45 -> 0.8 再增大

    particleSystem.minLifeTime = 4; // ✅ 3 -> 4
    particleSystem.maxLifeTime = 6; // ✅ 5 -> 6

    particleSystem.emitRate = 30; 

    particleSystem.color1 = new BABYLON.Color4(0.4, 0.28, 0.03, 0.75); // ✅ 进一步降低
    particleSystem.color2 = new BABYLON.Color4(0.35, 0.24, 0.06, 0.65); // ✅ 略暗的金色
    particleSystem.colorDead = new BABYLON.Color4(0.25, 0.18, 0.04, 0.0); // ✅ 死亡时变暗金色

    // ✅ 方向和速度（明显的缓慢漂浮）
    particleSystem.direction1 = new BABYLON.Vector3(-0.3, -0.3, -0.3);
    particleSystem.direction2 = new BABYLON.Vector3(0.3, 0.3, 0.3);

    particleSystem.minEmitPower = 0.2; // ✅ 0.1 -> 0.2
    particleSystem.maxEmitPower = 0.5; // ✅ 0.3 -> 0.5

    // ✅ 发射范围（调整到玩家可视范围）
    particleSystem.minEmitBox = new BABYLON.Vector3(-6, 0, -6); // ✅ y: -1 -> 0
    particleSystem.maxEmitBox = new BABYLON.Vector3(6, 3, 6); // ✅ y: 5 -> 3

    // 混合模式（✅ ADD模式可以隐藏黑色背景，颜色值要低）
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 启动
    particleSystem.start();

    // 延迟检查粒子数量
    setTimeout(() => {
        const count = particleSystem.getActiveCount();
        console.log(`❄️ 冰晶粒子运行中（暗金色+STANDARD模式）- 当前粒子数: ${count}`);
    }, 1000);

    // 保存
    this.battle3D.particleSystems.push(particleSystem);

    console.log('❄️ 冰晶粒子已启动（超增强版）- 总容量: 600, 发射率: 100/秒');

    return particleSystem;
};

/**
 * 创建雪堆装饰物（冰封雪谷）
 */
EndlessCultivationGame.prototype.createSnowPiles = function(scene) {
    console.log('⛄ 开始创建雪堆装饰物...');

    // 创建多个雪堆，随机分布在场景中
    const pilePositions = [
        { x: -5, z: -3 },
        { x: 4, z: -4 },
        { x: -3, z: 5 },
        { x: 6, z: 3 },
        { x: -7, z: 1 }
    ];

    const snowMaterial = new BABYLON.StandardMaterial("snowPileMaterial", scene);
    snowMaterial.diffuseColor = new BABYLON.Color3(0.95, 0.98, 1.0);  // 白色
    snowMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.35);  // 轻微反光
    snowMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.15);  // 轻微发光

    pilePositions.forEach((pos, index) => {
        // 创建雪堆（使用球体并压扁）
        const snowPile = BABYLON.MeshBuilder.CreateSphere(`snowPile_${index}`, {
            diameter: 1.5 + Math.random() * 0.5,
            segments: 8
        }, scene);

        snowPile.position = new BABYLON.Vector3(pos.x, -0.7, pos.z); // ✅ y: -0.3 -> -0.7，使其落在地面上
        snowPile.scaling.y = 0.4;  // 压扁成雪堆形状
        snowPile.material = snowMaterial;
    });

    console.log(`⛄ 已创建 ${pilePositions.length} 个雪堆`);
};

/**
 * 创建雪人装饰物（冰封雪谷）
 */
EndlessCultivationGame.prototype.createSnowmen = function(scene) {
    console.log('☃️ 开始创建雪人装饰物...');

    // 创建2个雪人
    const snowmanPositions = [
        { x: -6, z: -5 },
        { x: 7, z: -2 }
    ];

    const snowMaterial = new BABYLON.StandardMaterial("snowmanMaterial", scene);
    snowMaterial.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);  // 纯白
    snowMaterial.specularColor = new BABYLON.Color3(0.4, 0.4, 0.45);  // 冰晶反光
    snowMaterial.emissiveColor = new BABYLON.Color3(0.15, 0.15, 0.2);  // 轻微发光

    const coalMaterial = new BABYLON.StandardMaterial("coalMaterial", scene);
    coalMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);  // 黑色（眼睛、纽扣）
    coalMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    const carrotMaterial = new BABYLON.StandardMaterial("carrotMaterial", scene);
    carrotMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.5, 0.0);  // 橙色（鼻子）

    snowmanPositions.forEach((pos, index) => {
        const snowmanGroup = new BABYLON.TransformNode(`snowman_${index}`, scene);

        // 底部球体（最大）
        const bottom = BABYLON.MeshBuilder.CreateSphere(`snowman_bottom_${index}`, {
            diameter: 1.2,
            segments: 12
        }, scene);
        bottom.position.y = 0.6;
        bottom.material = snowMaterial;
        bottom.parent = snowmanGroup;

        // 中部球体
        const middle = BABYLON.MeshBuilder.CreateSphere(`snowman_middle_${index}`, {
            diameter: 0.9,
            segments: 12
        }, scene);
        middle.position.y = 1.4;
        middle.material = snowMaterial;
        middle.parent = snowmanGroup;

        // 头部球体（最小）
        const head = BABYLON.MeshBuilder.CreateSphere(`snowman_head_${index}`, {
            diameter: 0.6,
            segments: 12
        }, scene);
        head.position.y = 2.0;
        head.material = snowMaterial;
        head.parent = snowmanGroup;

        // 眼睛（两个黑色小球）
        const leftEye = BABYLON.MeshBuilder.CreateSphere(`snowman_leftEye_${index}`, {
            diameter: 0.08,
            segments: 6
        }, scene);
        leftEye.position = new BABYLON.Vector3(-0.12, 2.1, 0.25);
        leftEye.material = coalMaterial;
        leftEye.parent = snowmanGroup;

        const rightEye = BABYLON.MeshBuilder.CreateSphere(`snowman_rightEye_${index}`, {
            diameter: 0.08,
            segments: 6
        }, scene);
        rightEye.position = new BABYLON.Vector3(0.12, 2.1, 0.25);
        rightEye.material = coalMaterial;
        rightEye.parent = snowmanGroup;

        // 鼻子（橙色锥体）
        const nose = BABYLON.MeshBuilder.CreateCylinder(`snowman_nose_${index}`, {
            height: 0.2,
            diameterTop: 0,
            diameterBottom: 0.08,
            tessellation: 6
        }, scene);
        nose.position = new BABYLON.Vector3(0, 2.0, 0.3);
        nose.rotation.x = Math.PI / 2;
        nose.material = carrotMaterial;
        nose.parent = snowmanGroup;

        // 纽扣（三个黑色小球）
        [1.2, 1.4, 1.6].forEach((yPos, btnIndex) => {
            const button = BABYLON.MeshBuilder.CreateSphere(`snowman_button_${index}_${btnIndex}`, {
                diameter: 0.08,
                segments: 6
            }, scene);
            button.position = new BABYLON.Vector3(0, yPos, 0.4);
            button.material = coalMaterial;
            button.parent = snowmanGroup;
        });

        // 设置雪人位置
        snowmanGroup.position = new BABYLON.Vector3(pos.x, -1, pos.z); // ✅ y: 0 -> -1，使其站在地面上
        snowmanGroup.rotation.y = Math.random() * Math.PI * 2;  // 随机朝向
    });

    console.log(`☃️ 已创建 ${snowmanPositions.length} 个雪人`);
};

/**
 * 创建桃树装饰物（仙山峰顶）
 */
EndlessCultivationGame.prototype.createPeachTrees = function(scene) {
    console.log('🍑 开始创建桃树装饰物...');

    // 创建2棵桃树（更靠近后方）
    const treePositions = [
        { x: -8, z: 6 },
        { x: 8, z: 6 }
    ];

    // 树干材质
    const trunkMaterial = new BABYLON.StandardMaterial("trunkMaterial", scene);
    trunkMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.25, 0.15);  // 棕色
    trunkMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // 桃花材质（粉色）
    const leavesMaterial = new BABYLON.StandardMaterial("blossomsMaterial", scene);
    leavesMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.6, 0.7);  // ✅ 粉红色桃花
    leavesMaterial.specularColor = new BABYLON.Color3(0.4, 0.3, 0.35);
    leavesMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.15, 0.2);  // ✅ 发光的桃花

    // 桃子材质（粉色）
    const peachMaterial = new BABYLON.StandardMaterial("peachMaterial", scene);
    peachMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.6, 0.7);  // 粉红色
    peachMaterial.specularColor = new BABYLON.Color3(0.4, 0.3, 0.35);
    peachMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.1, 0.15);  // 轻微发光

    treePositions.forEach((pos, index) => {
        const treeGroup = new BABYLON.TransformNode(`peachTree_${index}`, scene);

        // 树干（圆柱体）
        const trunk = BABYLON.MeshBuilder.CreateCylinder(`trunk_${index}`, {
            height: 2.5,  // ✅ 增高：2.0 -> 2.5
            diameter: 0.35,  // ✅ 增粗：0.3 -> 0.35
            tessellation: 8
        }, scene);
        trunk.position.y = 1.25;  // ✅ 调整：1.0 -> 1.25
        trunk.material = trunkMaterial;
        trunk.parent = treeGroup;

        // 树冠（使用多个球体模拟，粉色桃花）
        const crown1 = BABYLON.MeshBuilder.CreateSphere(`crown1_${index}`, {
            diameter: 3.5,  // ✅ 增大：2.5 -> 3.5
            segments: 12
        }, scene);
        crown1.position = new BABYLON.Vector3(0, 3.0, 0);  // ✅ 调整：2.5 -> 3.0
        crown1.scaling.y = 0.7;  // 压扁一点
        crown1.material = leavesMaterial;
        crown1.parent = treeGroup;

        // 第二层树冠（稍小）
        const crown2 = BABYLON.MeshBuilder.CreateSphere(`crown2_${index}`, {
            diameter: 2.8,  // ✅ 增大：2.0 -> 2.8
            segments: 12
        }, scene);
        crown2.position = new BABYLON.Vector3(0, 4.3, 0);  // ✅ 调整：3.8 -> 4.3
        crown2.scaling.y = 0.7;
        crown2.material = leavesMaterial;
        crown2.parent = treeGroup;

        // 添加桃子装饰（粉色小球，更多数量）
        const peachPositions = [
            { x: 1.0, y: 2.5, z: 0.7 },
            { x: -0.8, y: 2.8, z: 0.9 },
            { x: 0.6, y: 3.2, z: -0.7 },
            { x: -0.9, y: 3.4, z: -0.6 },
            { x: 0.4, y: 3.8, z: 0.5 },
            { x: -0.5, y: 2.6, z: 0.8 },
            { x: 0.8, y: 4.2, z: -0.4 },
            { x: -0.7, y: 4.0, z: 0.6 },
            { x: 0.3, y: 4.5, z: -0.3 },
            { x: -0.4, y: 4.6, z: 0.4 }  // ✅ 调整y坐标以匹配新树高
        ];

        peachPositions.forEach((peachPos, peachIndex) => {
            const peach = BABYLON.MeshBuilder.CreateSphere(`peach_${index}_${peachIndex}`, {
                diameter: 0.2 + Math.random() * 0.15,  // ✅ 增大：0.15 -> 0.2
                segments: 6
            }, scene);
            peach.position = new BABYLON.Vector3(peachPos.x, peachPos.y, peachPos.z);
            peach.material = peachMaterial;
            peach.parent = treeGroup;
        });

        // 设置树的位置（站在地面上）
        treeGroup.position = new BABYLON.Vector3(pos.x, -1, pos.z); // ✅ y=-1，使树干底部在地面
        treeGroup.rotation.y = Math.random() * Math.PI * 2;  // 随机朝向
    });

    console.log(`🍑 已创建 ${treePositions.length} 棵桃树`);
};

// ==================== 战斗特效系统 ====================

/**
 * 创建剑气特效（攻击轨迹）
 * @param {BABYLON.Vector3} startPos - 起始位置
 * @param {BABYLON.Vector3} endPos - 结束位置
 * @param {string} color - 颜色类型（'white', 'red', 'blue', 'gold'）
 */
EndlessCultivationGame.prototype.createSwordQiEffect = function(startPos, endPos, color = 'white') {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    // 创建粒子系统
    const particleSystem = new BABYLON.ParticleSystem("swordQi", 100, scene);

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置（攻击起点）
    particleSystem.emitter = startPos;

    // 粒子属性
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.3;

    particleSystem.minLifeTime = 0.2;
    particleSystem.maxLifeTime = 0.5;

    particleSystem.emitRate = 200;

    // 颜色（根据类型）
    let color1, color2, colorDead;
    switch (color) {
        case 'red':
            color1 = new BABYLON.Color4(1.0, 0.2, 0.2, 1.0);
            color2 = new BABYLON.Color4(1.0, 0.5, 0.3, 0.9);
            colorDead = new BABYLON.Color4(1.0, 0.3, 0.2, 0.0);
            break;
        case 'blue':
            color1 = new BABYLON.Color4(0.3, 0.7, 1.0, 1.0);
            color2 = new BABYLON.Color4(0.5, 0.8, 1.0, 0.9);
            colorDead = new BABYLON.Color4(0.4, 0.7, 1.0, 0.0);
            break;
        case 'gold':
            color1 = new BABYLON.Color4(1.0, 0.9, 0.3, 1.0);
            color2 = new BABYLON.Color4(1.0, 0.95, 0.5, 0.9);
            colorDead = new BABYLON.Color4(1.0, 0.9, 0.4, 0.0);
            break;
        default: // white
            color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
            color2 = new BABYLON.Color4(0.9, 0.95, 1.0, 0.9);
            colorDead = new BABYLON.Color4(0.95, 0.98, 1.0, 0.0);
    }

    particleSystem.color1 = color1;
    particleSystem.color2 = color2;
    particleSystem.colorDead = colorDead;

    // 方向（从起点到终点）
    const direction = endPos.subtract(startPos).normalize();
    particleSystem.direction1 = direction.scale(2);
    particleSystem.direction2 = direction.scale(5);

    particleSystem.minEmitPower = 3;
    particleSystem.maxEmitPower = 6;

    // 发射范围
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.2, -0.2, -0.2);
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, 0.2);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 短暂爆发（攻击瞬间）
    particleSystem.targetStopDuration = 0.1;

    // 启动
    particleSystem.start();

    // 自动清理（0.6秒后）
    setTimeout(() => {
        particleSystem.dispose();
    }, 600);

    // 保存
    this.battle3D.particleSystems.push(particleSystem);
};

/**
 * 创建技能释放特效（元素爆发）
 * @param {BABYLON.Vector3} position - 释放位置
 * @param {string} elementType - 元素类型（'fire', 'ice', 'thunder', 'wind'）
 */
EndlessCultivationGame.prototype.createSkillBurstEffect = function(position, elementType) {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    const particleSystem = new BABYLON.ParticleSystem("skillBurst", 200, scene);

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置
    particleSystem.emitter = position;

    // 粒子属性
    particleSystem.minSize = 0.15;
    particleSystem.maxSize = 0.4;

    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 0.8;

    particleSystem.emitRate = 300;

    // 颜色（根据元素类型）
    let color1, color2, colorDead;
    switch (elementType) {
        case 'fire':
            color1 = new BABYLON.Color4(1.0, 0.4, 0.0, 1.0);
            color2 = new BABYLON.Color4(1.0, 0.7, 0.2, 0.9);
            colorDead = new BABYLON.Color4(1.0, 0.3, 0.0, 0.0);
            break;
        case 'ice':
            color1 = new BABYLON.Color4(0.5, 0.9, 1.0, 1.0);
            color2 = new BABYLON.Color4(0.7, 0.95, 1.0, 0.9);
            colorDead = new BABYLON.Color4(0.6, 0.9, 1.0, 0.0);
            break;
        case 'thunder':
            color1 = new BABYLON.Color4(0.8, 0.8, 1.0, 1.0);
            color2 = new BABYLON.Color4(1.0, 1.0, 0.9, 0.9);
            colorDead = new BABYLON.Color4(0.7, 0.7, 1.0, 0.0);
            break;
        case 'wind':
            color1 = new BABYLON.Color4(0.6, 1.0, 0.6, 1.0);
            color2 = new BABYLON.Color4(0.8, 1.0, 0.8, 0.9);
            colorDead = new BABYLON.Color4(0.7, 1.0, 0.7, 0.0);
            break;
        default:
            color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
            color2 = new BABYLON.Color4(1.0, 1.0, 1.0, 0.9);
            colorDead = new BABYLON.Color4(1.0, 1.0, 1.0, 0.0);
    }

    particleSystem.color1 = color1;
    particleSystem.color2 = color2;
    particleSystem.colorDead = colorDead;

    // 方向（爆发式向外）
    particleSystem.direction1 = new BABYLON.Vector3(-1, -1, -1);
    particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);

    particleSystem.minEmitPower = 5;
    particleSystem.maxEmitPower = 10;

    // 发射范围
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.1, -0.1, -0.1);
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.1, 0.1, 0.1);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 短暂爆发
    particleSystem.targetStopDuration = 0.15;

    // 启动
    particleSystem.start();

    // 自动清理
    setTimeout(() => {
        particleSystem.dispose();
    }, 1000);

    // 保存
    this.battle3D.particleSystems.push(particleSystem);
};

/**
 * 创建治愈特效（恢复系技能）
 * @param {BABYLON.Vector3} position - 目标位置
 */
EndlessCultivationGame.prototype.createHealingEffect = function(position) {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    const particleSystem = new BABYLON.ParticleSystem("healing", 150, scene);

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置（目标脚下）
    particleSystem.emitter = position;

    // 粒子属性
    particleSystem.minSize = 0.15;
    particleSystem.maxSize = 0.35;

    particleSystem.minLifeTime = 0.8;
    particleSystem.maxLifeTime = 1.5;

    particleSystem.emitRate = 100;

    // 颜色（绿色治愈光芒）
    particleSystem.color1 = new BABYLON.Color4(0.3, 1.0, 0.4, 0.9);
    particleSystem.color2 = new BABYLON.Color4(0.5, 1.0, 0.6, 0.8);
    particleSystem.colorDead = new BABYLON.Color4(0.2, 0.8, 0.3, 0.0);

    // 方向（向上环绕）
    particleSystem.direction1 = new BABYLON.Vector3(-0.5, 2, -0.5);
    particleSystem.direction2 = new BABYLON.Vector3(0.5, 3, 0.5);

    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 2;

    // 发射范围（圆形区域）
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.8, 0, -0.8);
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.8, 0, 0.8);

    // 重力（轻微向上）
    particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 持续时间
    particleSystem.targetStopDuration = 0.8;

    // 启动
    particleSystem.start();

    // 自动清理
    setTimeout(() => {
        particleSystem.dispose();
    }, 1500);

    // 保存
    this.battle3D.particleSystems.push(particleSystem);
};

/**
 * 创建暴击爆炸特效（增强打击感）
 * @param {BABYLON.Vector3} position - 命中位置
 * @param {string} color - 颜色类型（'gold', 'red'）
 */
EndlessCultivationGame.prototype.createCriticalHitEffect = function(position, color = 'gold') {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    // 创建两层特效：冲击波 + 爆炸粒子

    // 第一层：冲击波（扁平扩散）
    const shockwave = new BABYLON.ParticleSystem("criticalShockwave", 50, scene);
    shockwave.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);
    shockwave.emitter = position;

    shockwave.minSize = 0.3;
    shockwave.maxSize = 0.6;
    shockwave.minLifeTime = 0.3;
    shockwave.maxLifeTime = 0.5;
    shockwave.emitRate = 80;

    // 金色/红色冲击波
    if (color === 'gold') {
        shockwave.color1 = new BABYLON.Color4(1.0, 0.85, 0.3, 0.95);
        shockwave.color2 = new BABYLON.Color4(1.0, 0.9, 0.5, 0.85);
        shockwave.colorDead = new BABYLON.Color4(1.0, 0.8, 0.2, 0.0);
    } else {
        shockwave.color1 = new BABYLON.Color4(1.0, 0.3, 0.2, 0.95);
        shockwave.color2 = new BABYLON.Color4(1.0, 0.5, 0.3, 0.85);
        shockwave.colorDead = new BABYLON.Color4(1.0, 0.2, 0.1, 0.0);
    }

    // 水平扩散
    shockwave.direction1 = new BABYLON.Vector3(-3, 0.2, -3);
    shockwave.direction2 = new BABYLON.Vector3(3, 0.5, 3);
    shockwave.minEmitPower = 6;
    shockwave.maxEmitPower = 10;

    shockwave.minEmitBox = new BABYLON.Vector3(0, 0, 0);
    shockwave.maxEmitBox = new BABYLON.Vector3(0, 0, 0);

    shockwave.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    shockwave.targetStopDuration = 0.1;
    shockwave.start();

    // 第二层：爆炸粒子（向上飞溅）
    const explosion = new BABYLON.ParticleSystem("criticalExplosion", 100, scene);
    explosion.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);
    explosion.emitter = position;

    explosion.minSize = 0.15;
    explosion.maxSize = 0.35;
    explosion.minLifeTime = 0.4;
    explosion.maxLifeTime = 0.8;
    explosion.emitRate = 150;

    if (color === 'gold') {
        explosion.color1 = new BABYLON.Color4(1.0, 0.9, 0.4, 1.0);
        explosion.color2 = new BABYLON.Color4(1.0, 0.95, 0.6, 0.9);
        explosion.colorDead = new BABYLON.Color4(1.0, 0.85, 0.3, 0.0);
    } else {
        explosion.color1 = new BABYLON.Color4(1.0, 0.4, 0.3, 1.0);
        explosion.color2 = new BABYLON.Color4(1.0, 0.6, 0.4, 0.9);
        explosion.colorDead = new BABYLON.Color4(1.0, 0.3, 0.2, 0.0);
    }

    // 向四周爆炸
    explosion.direction1 = new BABYLON.Vector3(-2, 1, -2);
    explosion.direction2 = new BABYLON.Vector3(2, 4, 2);
    explosion.minEmitPower = 5;
    explosion.maxEmitPower = 8;
    explosion.gravity = new BABYLON.Vector3(0, -8, 0);

    explosion.minEmitBox = new BABYLON.Vector3(-0.1, -0.1, -0.1);
    explosion.maxEmitBox = new BABYLON.Vector3(0.1, 0.1, 0.1);

    explosion.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    explosion.targetStopDuration = 0.12;
    explosion.start();

    // 自动清理
    setTimeout(() => {
        shockwave.dispose();
        explosion.dispose();
    }, 1000);

    // 保存
    this.battle3D.particleSystems.push(shockwave, explosion);
};

/**
 * 创建闪避残影特效（闪避反馈）
 * @param {BABYLON.Vector3} position - 闪避者位置
 */
EndlessCultivationGame.prototype.createDodgeEffect = function(position) {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    const particleSystem = new BABYLON.ParticleSystem("dodge", 80, scene);

    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置
    particleSystem.emitter = position;

    // 粒子属性
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.25;

    particleSystem.minLifeTime = 0.5;
    particleSystem.maxLifeTime = 1.0;

    particleSystem.emitRate = 60;

    // 颜色（蓝白色残影）
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.9, 1.0, 0.7);
    particleSystem.color2 = new BABYLON.Color4(0.9, 0.95, 1.0, 0.5);
    particleSystem.colorDead = new BABYLON.Color4(0.6, 0.85, 1.0, 0.0);

    // 方向（缓慢扩散）
    particleSystem.direction1 = new BABYLON.Vector3(-0.3, 0, -0.3);
    particleSystem.direction2 = new BABYLON.Vector3(0.3, 0.2, 0.3);

    particleSystem.minEmitPower = 0.2;
    particleSystem.maxEmitPower = 0.5;

    // 发射范围（人物周围）
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 2, 0.5);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 持续时间
    particleSystem.targetStopDuration = 0.3;

    // 启动
    particleSystem.start();

    // 自动清理
    setTimeout(() => {
        particleSystem.dispose();
    }, 1200);

    // 保存
    this.battle3D.particleSystems.push(particleSystem);
};

/**
 * 创建击杀特效（敌人死亡爆发）
 * @param {BABYLON.Vector3} position - 敌人位置
 */
EndlessCultivationGame.prototype.createKillEffect = function(position) {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    // 创建三层特效：冲击波 + 爆炸粒子 + 光芒上升

    // 第一层：冲击波
    const shockwave = new BABYLON.ParticleSystem("killShockwave", 60, scene);
    shockwave.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);
    shockwave.emitter = position;

    shockwave.minSize = 0.4;
    shockwave.maxSize = 0.8;
    shockwave.minLifeTime = 0.4;
    shockwave.maxLifeTime = 0.6;
    shockwave.emitRate = 100;

    // 金色冲击波
    shockwave.color1 = new BABYLON.Color4(1.0, 0.8, 0.3, 0.9);
    shockwave.color2 = new BABYLON.Color4(1.0, 0.9, 0.5, 0.7);
    shockwave.colorDead = new BABYLON.Color4(1.0, 0.7, 0.2, 0.0);

    // 水平扩散
    shockwave.direction1 = new BABYLON.Vector3(-4, 0.1, -4);
    shockwave.direction2 = new BABYLON.Vector3(4, 0.3, 4);
    shockwave.minEmitPower = 8;
    shockwave.maxEmitPower = 12;

    shockwave.minEmitBox = new BABYLON.Vector3(0, 0, 0);
    shockwave.maxEmitBox = new BABYLON.Vector3(0, 0, 0);

    shockwave.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    shockwave.targetStopDuration = 0.15;
    shockwave.start();

    // 第二层：爆炸粒子
    const explosion = new BABYLON.ParticleSystem("killExplosion", 150, scene);
    explosion.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);
    explosion.emitter = position;

    explosion.minSize = 0.12;
    explosion.maxSize = 0.3;
    explosion.minLifeTime = 0.6;
    explosion.maxLifeTime = 1.2;
    explosion.emitRate = 200;

    explosion.color1 = new BABYLON.Color4(1.0, 0.85, 0.4, 1.0);
    explosion.color2 = new BABYLON.Color4(1.0, 0.9, 0.6, 0.85);
    explosion.colorDead = new BABYLON.Color4(0.8, 0.7, 0.3, 0.0);

    // 向四周爆炸
    explosion.direction1 = new BABYLON.Vector3(-3, 1, -3);
    explosion.direction2 = new BABYLON.Vector3(3, 5, 3);
    explosion.minEmitPower = 6;
    explosion.maxEmitPower = 10;
    explosion.gravity = new BABYLON.Vector3(0, -6, 0);

    explosion.minEmitBox = new BABYLON.Vector3(-0.2, -0.2, -0.2);
    explosion.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, 0.2);

    explosion.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    explosion.targetStopDuration = 0.2;
    explosion.start();

    // 第三层：光芒上升（灵魂升华效果）
    const ascension = new BABYLON.ParticleSystem("killAscension", 80, scene);
    ascension.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);
    ascension.emitter = position;

    ascension.minSize = 0.15;
    ascension.maxSize = 0.3;
    ascension.minLifeTime = 1.0;
    ascension.maxLifeTime = 1.8;
    ascension.emitRate = 50;

    // 白色/金色光芒
    ascension.color1 = new BABYLON.Color4(1.0, 0.95, 0.8, 0.8);
    ascension.color2 = new BABYLON.Color4(1.0, 1.0, 0.9, 0.6);
    ascension.colorDead = new BABYLON.Color4(0.9, 0.95, 1.0, 0.0);

    // 向上升起
    ascension.direction1 = new BABYLON.Vector3(-0.3, 3, -0.3);
    ascension.direction2 = new BABYLON.Vector3(0.3, 5, 0.3);
    ascension.minEmitPower = 1;
    ascension.maxEmitPower = 2;

    ascension.minEmitBox = new BABYLON.Vector3(-0.3, 0, -0.3);
    ascension.maxEmitBox = new BABYLON.Vector3(0.3, 1, 0.3);

    ascension.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    ascension.targetStopDuration = 0.3;
    ascension.start();

    // 自动清理
    setTimeout(() => {
        shockwave.dispose();
        explosion.dispose();
        ascension.dispose();
    }, 2000);

    // 保存
    this.battle3D.particleSystems.push(shockwave, explosion, ascension);
};

/**
 * 相机震动效果（增强打击感）
 * @param {number} intensity - 震动强度（0.05-0.15 推荐）
 * @param {number} duration - 震动持续时间（毫秒）
 */
EndlessCultivationGame.prototype.cameraShake = function(intensity = 0.08, duration = 250) {
    if (!this.battle3D || !this.battle3D.camera) return;

    const camera = this.battle3D.camera;
    const originalAlpha = camera.alpha;
    const originalBeta = camera.beta;
    const originalRadius = camera.radius;

    const startTime = Date.now();
    const shakeInterval = 16; // 约60fps

    const shake = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
            // 恢复原始位置
            camera.alpha = originalAlpha;
            camera.beta = originalBeta;
            camera.radius = originalRadius;
            return;
        }

        // 计算当前震动强度（逐渐衰减）
        const progress = elapsed / duration;
        const currentIntensity = intensity * (1 - progress);

        // 随机偏移
        camera.alpha = originalAlpha + (Math.random() - 0.5) * currentIntensity;
        camera.beta = originalBeta + (Math.random() - 0.5) * currentIntensity * 0.3;

        setTimeout(shake, shakeInterval);
    };

    shake();
};

/**
 * 动态光照闪光效果（技能释放时）
 * @param {number} intensity - 光照强度峰值（2.0-4.0 推荐）
 * @param {number} duration - 持续时间（毫秒）
 * @param {BABYLON.Color3} color - 闪光颜色（可选）
 */
EndlessCultivationGame.prototype.lightFlash = function(intensity = 3.0, duration = 200, color = null) {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    // 找到场景中的主光源（方向光）
    const directionalLight = scene.getLightByName("directionalLight");
    if (!directionalLight) return;

    const originalIntensity = directionalLight.intensity;
    const originalColor = directionalLight.diffuse.clone();

    // 如果指定了颜色，临时改变光色
    if (color) {
        directionalLight.diffuse = color;
    }

    // 突然增强光照
    directionalLight.intensity = intensity;

    // 快速衰减回原始强度
    const fadeSteps = 10;
    const stepDuration = duration / fadeSteps;
    let step = 0;

    const fade = () => {
        step++;
        const progress = step / fadeSteps;
        directionalLight.intensity = intensity - (intensity - originalIntensity) * progress;

        if (step < fadeSteps) {
            setTimeout(fade, stepDuration);
        } else {
            // 恢复原始颜色
            if (color) {
                directionalLight.diffuse = originalColor;
            }
        }
    };

    setTimeout(fade, stepDuration);
};

/**
 * 技能释放前摇能量聚集特效
 * @param {BABYLON.Vector3} position - 施法者位置
 * @param {BABYLON.Color3} skillColor - 技能颜色
 * @param {number} duration - 前摇时间（毫秒）
 */
EndlessCultivationGame.prototype.createSkillChargeEffect = function(position, skillColor, duration = 500) {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    const particleSystem = new BABYLON.ParticleSystem("skillCharge", 80, scene);
    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);

    // 发射器位置（施法者周围）
    particleSystem.emitter = position;

    // 粒子属性
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.25;

    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 0.6;

    particleSystem.emitRate = 60;

    // 颜色（使用技能颜色）
    const color4 = new BABYLON.Color4(skillColor.r, skillColor.g, skillColor.b, 0.8);
    const color4Light = new BABYLON.Color4(
        Math.min(skillColor.r + 0.2, 1.0),
        Math.min(skillColor.g + 0.2, 1.0),
        Math.min(skillColor.b + 0.2, 1.0),
        0.6
    );
    particleSystem.color1 = color4;
    particleSystem.color2 = color4Light;
    particleSystem.colorDead = new BABYLON.Color4(skillColor.r, skillColor.g, skillColor.b, 0.0);

    // 向施法者聚集（负方向）
    particleSystem.direction1 = new BABYLON.Vector3(0, 0, 0);
    particleSystem.direction2 = new BABYLON.Vector3(0, 0, 0);

    particleSystem.minEmitPower = 0;
    particleSystem.maxEmitPower = 0;

    // 发射范围（身体周围大范围）
    particleSystem.minEmitBox = new BABYLON.Vector3(-1.5, 0, -1.5);
    particleSystem.maxEmitBox = new BABYLON.Vector3(1.5, 2.5, 1.5);

    // 重力向内（聚集效果通过负速度实现）
    particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);

    // 混合模式
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

    // 前摇结束后自动停止
    particleSystem.targetStopDuration = duration / 1000;

    // 启动
    particleSystem.start();

    // 自动清理
    setTimeout(() => {
        particleSystem.dispose();
    }, duration + 500);

    // 保存
    this.battle3D.particleSystems.push(particleSystem);
};

/**
 * 护盾破碎粒子效果
 * @param {BABYLON.Vector3} position - 护盾位置
 */
EndlessCultivationGame.prototype.createShieldBreakEffect = function(position) {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    // 创建两层特效：碎片飞溅 + 光芒消散

    // 第一层：护盾碎片
    const fragments = new BABYLON.ParticleSystem("shieldFragments", 100, scene);
    fragments.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);
    fragments.emitter = position;

    fragments.minSize = 0.15;
    fragments.maxSize = 0.35;
    fragments.minLifeTime = 0.5;
    fragments.maxLifeTime = 1.0;
    fragments.emitRate = 150;

    // 蓝色护盾碎片
    fragments.color1 = new BABYLON.Color4(0.4, 0.7, 1.0, 0.9);
    fragments.color2 = new BABYLON.Color4(0.6, 0.8, 1.0, 0.8);
    fragments.colorDead = new BABYLON.Color4(0.3, 0.6, 0.9, 0.0);

    // 向四周飞溅
    fragments.direction1 = new BABYLON.Vector3(-2, 0, -2);
    fragments.direction2 = new BABYLON.Vector3(2, 1, 2);
    fragments.minEmitPower = 3;
    fragments.maxEmitPower = 5;
    fragments.gravity = new BABYLON.Vector3(0, -4, 0);

    fragments.minEmitBox = new BABYLON.Vector3(-0.5, 0.5, -0.5);
    fragments.maxEmitBox = new BABYLON.Vector3(0.5, 1.5, 0.5);

    fragments.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    fragments.targetStopDuration = 0.15;
    fragments.start();

    // 第二层：光芒消散
    const glow = new BABYLON.ParticleSystem("shieldGlow", 60, scene);
    glow.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", scene);
    glow.emitter = position;

    glow.minSize = 0.2;
    glow.maxSize = 0.5;
    glow.minLifeTime = 0.8;
    glow.maxLifeTime = 1.5;
    glow.emitRate = 40;

    // 白色光芒
    glow.color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 0.7);
    glow.color2 = new BABYLON.Color4(0.8, 0.9, 1.0, 0.5);
    glow.colorDead = new BABYLON.Color4(0.7, 0.85, 1.0, 0.0);

    // 向上缓慢消散
    glow.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
    glow.direction2 = new BABYLON.Vector3(0.5, 2, 0.5);
    glow.minEmitPower = 0.5;
    glow.maxEmitPower = 1;

    glow.minEmitBox = new BABYLON.Vector3(-0.3, 0.5, -0.3);
    glow.maxEmitBox = new BABYLON.Vector3(0.3, 1.5, 0.3);

    glow.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    glow.targetStopDuration = 0.2;
    glow.start();

    // 自动清理
    setTimeout(() => {
        fragments.dispose();
        glow.dispose();
    }, 1500);

    // 保存
    this.battle3D.particleSystems.push(fragments, glow);
};


