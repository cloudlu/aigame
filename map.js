// 探险场景模块 (map.js)
// 包含探险场景的所有3D渲染、敌人分布、人物移动等功能
// ⚠️ 注意：这个文件只负责探险场景，不包含任何战斗相关代码

// 为后续创建锥形网格提供辅助方法
EndlessWinterGame.prototype.createConeMesh = function(name, options, scene) {
    const coneOptions = {
        diameterTop: options.diameter ? options.diameter * 0.2 : 0.2,
        diameterBottom: options.diameter || 1,
        height: options.height || 1,
        tessellation: options.tessellation || 8
    };
    return BABYLON.MeshBuilder.CreateCylinder(name, coneOptions, scene);
};

// ==================== 刷新系统 ====================

// 刷新敌人分布和地图
EndlessWinterGame.prototype.refreshEnemies = function() {
    console.log('刷新敌人分布...');

    // 清空场景怪物数据
    this.gameState.sceneMonsters = [];

    // 重新生成小地图
    this.generateMiniMap();

    // 更新UI
    this.updateUI();

    this.addBattleLog('敌人分布已刷新！');
};

// ==================== 敌人信息区域 ====================

// 显示敌人信息区域
EndlessWinterGame.prototype.showEnemyInfo = function(enemyInfo) {
    // 更新敌人信息区域UI
    const enemyName = document.getElementById('enemy-name');
    const enemyLevel = document.getElementById('enemy-level');
    const enemyHp = document.getElementById('enemy-hp');
    const enemyMaxHp = document.getElementById('enemy-max-hp');
    const enemyAttack = document.getElementById('enemy-attack');
    const enemyDefense = document.getElementById('enemy-defense');
    const enemySpeed = document.getElementById('enemy-speed');
    const enemyLuck = document.getElementById('enemy-luck');
    const confirmBtn = document.getElementById('confirm-attack-btn');

    if (enemyName) enemyName.textContent = enemyInfo.name;
    if (enemyLevel) enemyLevel.textContent = enemyInfo.level;
    if (enemyHp) enemyHp.textContent = enemyInfo.hp;
    if (enemyMaxHp) enemyMaxHp.textContent = enemyInfo.maxHp;
    if (enemyAttack) enemyAttack.textContent = enemyInfo.attack;
    if (enemyDefense) enemyDefense.textContent = enemyInfo.defense || 0;
    if (enemySpeed) enemySpeed.textContent = enemyInfo.speed || 0;
    if (enemyLuck) enemyLuck.textContent = enemyInfo.luck || 0;

    // 更新敌人图标
    const enemyIconElement = document.querySelector('#enemy-icon i');
    if (enemyIconElement) {
        if (this.gameState.enemy?.name) {
            // 计算敌人和玩家的战斗力
            const enemyPower = this.gameState.enemy.attack * 2 + this.gameState.enemy.defense * 1.5 + this.gameState.enemy.maxHp * 0.1;
            const playerAttack = this.gameState.player.attack + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.attack : 0);
            const playerDefense = this.gameState.player.defense + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.defense : 0);
            const playerHp = this.gameState.player.maxHp + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.hp : 0);
            const playerPower = playerAttack * 2 + playerDefense * 1.5 + playerHp * 0.1;
            
            // 根据战斗力对比确定敌人颜色
            let enemyColorClass = 'text-danger'; // 默认红色
            if (this.gameState.enemy.isBoss) {
                enemyColorClass = 'text-purple-500'; // BOSS显示紫色
            } else if (this.gameState.enemy.isElite) {
                enemyColorClass = 'text-yellow-500'; // 精英怪显示黄色
            } else {
                const powerRatio = enemyPower / playerPower;
                if (powerRatio < 0.7) {
                    enemyColorClass = 'text-green-500'; // 比玩家弱显示绿色
                } else if (powerRatio < 1.3) {
                    enemyColorClass = 'text-yellow-500'; // 和玩家差不多显示黄色
                } else {
                    enemyColorClass = 'text-red-500'; // 比玩家厉害显示红色
                }
            }
            enemyIconElement.className = `fa ${this.gameState.enemy.icon} text-xl ${enemyColorClass}`;
        }
    }
    
    // 更新精英标识
    const eliteBadge = document.getElementById('enemy-elite-badge');
    const enemyInfoElement = document.getElementById('enemy-info-panel');
    
    // 重置之前的样式
    eliteBadge.textContent = '精英';
    eliteBadge.className = 'ml-2 text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded hidden font-bold';
    enemyInfoElement.classList.remove('border-yellow-500', 'bg-yellow-900/20', 'border-purple-500', 'bg-purple-900/20');
 
    if (this.gameState.enemy.isElite) {
        eliteBadge.classList.remove('hidden');
        // 为精英怪添加特殊样式
        enemyInfoElement.classList.add('border-yellow-500');
        enemyInfoElement.classList.add('bg-yellow-900/20');
    } else if (this.gameState.enemy.isBoss) {
        eliteBadge.classList.remove('hidden');
        eliteBadge.textContent = 'BOSS';
        eliteBadge.className = 'ml-2 text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded font-bold';
        // 为BOSS添加特殊样式
        enemyInfoElement.classList.add('border-purple-500');
        enemyInfoElement.classList.add('bg-purple-900/20');
    } else {
        // 普通怪隐藏精英徽章
        eliteBadge.classList.add('hidden');
    }

    // 更新敌人装备掉率信息
    const enemyDropRatesElement = document.getElementById('enemy-drop-rates');
    if (this.gameState.enemy?.name) {
        // 从 metadata 获取掉率配置
        const dropRatesConfig = this.metadata.dropRates;

        // 根据怪物类型选择对应的掉率表
        let dropRates;
        if (this.gameState.enemy.isBoss) {
            dropRates = dropRatesConfig.boss;
        } else if (this.gameState.enemy.isElite) {
            dropRates = dropRatesConfig.elite;
        } else {
            dropRates = dropRatesConfig.normal;
        }

        // 考虑幸运值影响（每点幸运值提高0.5%的高品质装备掉率）
        const luck = this.gameState.player.luck || 0;
        const luckBonus = luck * 0.005;

        // 调整掉率，提高高品质装备的概率
        const adjustedRates = {
            white: Math.max(0, dropRates.white - luckBonus * 3),
            blue: Math.max(0, dropRates.blue - luckBonus * 1.5),
            purple: Math.max(0, dropRates.purple + luckBonus * 1),
            gold: Math.max(0, dropRates.gold + luckBonus * 1.5),
            rainbow: Math.max(0, dropRates.rainbow + luckBonus * 2)
        };

        // 归一化概率
        const totalProbability = Object.values(adjustedRates).reduce((sum, rate) => sum + rate, 0);
        const normalizedRates = {};
        for (const [rarity, rate] of Object.entries(adjustedRates)) {
            normalizedRates[rarity] = rate / totalProbability;
        }

        // 生成掉率显示元素
        enemyDropRatesElement.innerHTML = '';

        // 品质颜色映射（5种品质）
        const rarityColors = {
            white: 'bg-white/10',
            blue: 'bg-blue-500/20',
            purple: 'bg-purple-500/20',
            gold: 'bg-yellow-500/20',
            rainbow: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500/20'
        };

        // 品质名称映射（5种品质）
        const rarityNames = {
            white: '白色',
            blue: '蓝色',
            purple: '紫色',
            gold: '金色',
            rainbow: '彩虹'
        };

        // 添加掉率信息
        for (const [rarity, rate] of Object.entries(normalizedRates)) {
            const ratePercent = Math.round(rate * 100);
            if (ratePercent > 0) {
                const rateElement = document.createElement('span');
                rateElement.className = `text-xs ${rarityColors[rarity]} px-1.5 py-0.5 rounded`;
                rateElement.textContent = `${rarityNames[rarity]}: ${ratePercent}%`;
                enemyDropRatesElement.appendChild(rateElement);
            }
        }
    }
    
    // 显示攻击按钮
    if (confirmBtn) {
        confirmBtn.classList.remove('hidden');
    }

};

// 敌人信息区默认状态配置（统一管理，避免重复代码）
EndlessWinterGame.prototype.ENEMY_INFO_DEFAULTS = {
    name: '等待敌人...',
    level: '?',
    hp: '?',
    maxHp: '?',
    attack: '?',
    defense: '?',
    speed: '?',
    luck: '?',
    icon: 'fa fa-question text-base text-gray-400'
};

// 清空敌人信息并隐藏攻击按钮（恢复到默认状态）
EndlessWinterGame.prototype.clearEnemyInfo = function() {
    const defaults = this.ENEMY_INFO_DEFAULTS;

    const enemyName = document.getElementById('enemy-name');
    const enemyLevel = document.getElementById('enemy-level');
    const enemyHp = document.getElementById('enemy-hp');
    const enemyMaxHp = document.getElementById('enemy-max-hp');
    const enemyAttack = document.getElementById('enemy-attack');
    const enemyDefense = document.getElementById('enemy-defense');
    const enemySpeed = document.getElementById('enemy-speed');
    const enemyLuck = document.getElementById('enemy-luck');
    const confirmBtn = document.getElementById('confirm-attack-btn');
    const enemyEliteBadge = document.getElementById('enemy-elite-badge');

    // 恢复到默认状态
    if (enemyName) enemyName.textContent = defaults.name;
    if (enemyLevel) enemyLevel.textContent = defaults.level;
    if (enemyHp) enemyHp.textContent = defaults.hp;
    if (enemyMaxHp) enemyMaxHp.textContent = defaults.maxHp;
    if (enemyAttack) enemyAttack.textContent = defaults.attack;
    if (enemyDefense) enemyDefense.textContent = defaults.defense;
    if (enemySpeed) enemySpeed.textContent = defaults.speed;
    if (enemyLuck) enemyLuck.textContent = defaults.luck;
    if (enemyEliteBadge) enemyEliteBadge.classList.add('hidden');

    const enemyIconElement = document.querySelector('#enemy-icon i');
    if (enemyIconElement) {
        enemyIconElement.className = defaults.icon;
    }

    const enemyInfoElement = document.getElementById('enemy-info-panel');
    if (enemyInfoElement) {
        // 移除精英怪和BOSS特殊样式
        enemyInfoElement.classList.remove('border-yellow-500');
        enemyInfoElement.classList.remove('bg-yellow-900/20');
        enemyInfoElement.classList.remove('border-purple-500');
        enemyInfoElement.classList.remove('bg-purple-900/20');
    }

    const enemyDropRatesElement = document.getElementById('enemy-drop-rates');
    if (enemyDropRatesElement) {
        enemyDropRatesElement.innerHTML = '';
    }

    // 隐藏攻击按钮
    if (confirmBtn) {
        confirmBtn.classList.add('hidden');
        confirmBtn.onclick = null;
    }
};

// 显示攻击确认对话框
EndlessWinterGame.prototype.showAttackConfirmation = function(enemyInfo) {

    // 设置游戏状态中的敌人信息
    this.gameState.enemy = enemyInfo;
    
    // 显示敌人信息
    this.showEnemyInfo(enemyInfo);

    // 显示确认按钮
    const confirmBtn = document.getElementById('confirm-attack-btn');
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            // 进入战斗场景 - 这个调用应该移到 battle3d.js
            this.encounterEnemy(enemyInfo);
        };
    }
};

// 遭遇敌人
EndlessWinterGame.prototype.encounterEnemy = function(enemyInfo, initScene = true) {
    if (enemyInfo) {
        // 保存当前地图场景状态，包括玩家位置
        this.saveMapState();
        
        // 从场景怪物数据中移除该敌人
        if (this.gameState.sceneMonsters) {
            const index = this.gameState.sceneMonsters.findIndex(monster => 
                monster.cellIndex === enemyInfo.cellIndex
            );
            if (index > -1) {
                this.gameState.sceneMonsters.splice(index, 1);
            }
        }
        
        // 从3D场景中移除对应的敌人模型
        if (this.battle3D && this.battle3D.enemies) {
            for (let i = this.battle3D.enemies.length - 1; i >= 0; i--) {
                const enemy = this.battle3D.enemies[i];
                if (enemy.info.name === enemyInfo.name && 
                    enemy.info.level === enemyInfo.level &&
                    enemy.info.position.x === enemyInfo.position.x &&
                    enemy.info.position.z === enemyInfo.position.z) {
                    // 从场景中移除敌人模型
                    try {
                        if (this.battle3D.scene && enemy.model) {
                            this.battle3D.scene.remove(enemy.model);
                        }
                    } catch (e) {

                    }
                    // 从敌人列表中移除
                    this.battle3D.enemies.splice(i, 1);
                    break;
                }
            }
        }
    }
        
    // 创建完整的战斗场景
    this.createBattleScene(this.gameState.enemy);

}

// ==================== 探险3D场景初始化 ====================

// 初始化3D探险场景
EndlessWinterGame.prototype.initMap3DScene = function() {
    console.log('开始初始化3D探险场景');

    // 移动模式状态
    this.movementMode = 'walk';  // 'walk' | 'run' | 'fly'
    this.isFlying = false;
    this.flyHeight = 0;
    this.lastClickTime = 0;
    this.flyKeys = { q: false, e: false };  // 飞行升降按键状态
    // 使用现有的 canvas 元素
    const canvas = document.getElementById('map-canvas');
    if (!canvas) {
        console.error('找不到 map-canvas 元素');
        return;
    }

    // 清理旧的3D场景
    if (this.battle3D && this.battle3D.engine) {
        try {
            this.battle3D.engine.dispose();
            console.log('清理旧引擎成功');
        } catch (e) {
            console.log('清理旧引擎时出错:', e);
        }
    }

    this.battle3D = null;

    // 获取 canvas 的父容器
    const container = canvas.parentElement;
    if (!container) {
        console.error('找不到 canvas 的父容器');
        return;
    }

    // 使用容器的实际尺寸
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    canvas.width = Math.max(containerWidth || 1024, 1);
    canvas.height = Math.max(containerHeight || 500, 1);

    // ========== 场景配置常量（来自 SIZES）==========
    const SKY_SIZE = SIZES.SKY_SIZE;
    const GROUND_Y = SIZES.GROUND_Y;
    const PLAYER_HEIGHT = SIZES.PLAYER_HEIGHT_OFFSET;
    const PLAYER_BOUNDARY = SIZES.PLAYER_BOUNDARY;

    // ========== 移动速度常量（来自 SIZES）==========
    const WALK_SPEED = SIZES.WALK_SPEED;
    const RUN_SPEED = SIZES.RUN_SPEED;
    const FLY_SPEED = SIZES.FLY_SPEED;
    const FLY_VERTICAL_SPEED = SIZES.FLY_VERTICAL_SPEED;
    const WALK_CLICK_SPEED = SIZES.WALK_CLICK_SPEED;
    const RUN_CLICK_SPEED = SIZES.RUN_CLICK_SPEED;
    const FLY_CLICK_SPEED = SIZES.FLY_CLICK_SPEED;
    const DOUBLE_CLICK_THRESHOLD = SIZES.DOUBLE_CLICK_THRESHOLD;
    const MAX_FLY_HEIGHT = SKY_SIZE / 3;


    // 创建引擎和场景
    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new BABYLON.Scene(engine);

    // 场景默认氛围
    scene.clearColor = new BABYLON.Color4(0.537, 0.808, 0.922, 1);
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogColor = new BABYLON.Color3(0.537, 0.808, 0.922);
    scene.fogStart = Math.round(SKY_SIZE * 0.10);
    scene.fogEnd = Math.round(SKY_SIZE * 0.40);

    // 创建相机（全景探索模式 - 可以环顾四周）
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 20, new BABYLON.Vector3(0, GROUND_Y, 0), scene);
    camera.attachControl(canvas, true);
    camera.minZ = 0.1;
    camera.maxZ = SKY_SIZE;  // 全景模式需要看很远

    // 限制相机位置
    camera.upperRadiusLimit = Math.round(SKY_SIZE * 0.07);
    camera.lowerRadiusLimit = 5;

    // 视角限制（允许抬头看天空 + 低头看地面）
    camera.lowerBetaLimit = Math.PI / 8;    // 最高可以接近天顶俯视
    camera.upperBetaLimit = Math.PI / 2.1; // 最低可以仰视看天空

    // 设置相机控制方式
    camera.useAutoRotationBehavior = false; // 禁用自动旋转
    camera.wheelPrecision = 30; // 鼠标滚轮灵敏度
    camera.panningSensibility = 0; // 禁用平移
    camera.angularSensibilityX = 500; // 水平旋转灵敏度
    camera.angularSensibilityY = 800; // 垂直旋转灵敏度（降低，减少误操作）

    // 添加灯光（优化光照系统）
    const hemisphericLight = new BABYLON.HemisphericLight("hemisphericLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 0.5;
    hemisphericLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.25);

    // 主方向光（带阴影）
    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.intensity = 0.9;
    dirLight.position = new BABYLON.Vector3(Math.round(SKY_SIZE * 0.06), GROUND_Y + Math.round(SKY_SIZE * 0.10), Math.round(SKY_SIZE * 0.06));  // 相对地面上方

    // 启用阴影生成器（先保存到局部变量，稍后添加到 battle3D 对象）
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
    shadowGenerator.darkness = 0.3;

    // 添加环境光补充光照
    const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, -1, 0), scene);
    ambientLight.intensity = 0.2;
    ambientLight.diffuse = new BABYLON.Color3(0.6, 0.6, 0.65);

    // 添加地面
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: SKY_SIZE, height: SKY_SIZE, subdivisions: 32 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);

    groundMaterial.diffuseTexture = new BABYLON.Texture(
        "Images/ground_texture_grass.jpg", 
        scene
    );

    groundMaterial.diffuseTexture.uScale = 4.0;
    groundMaterial.diffuseTexture.vScale = 4.0;

    // 根据地图类型设置不同的地面颜色
    if (this.metadata.mapBackgrounds.length > 0 && this.gameState.currentBackgroundIndex !== undefined) {
        const currentBackground = this.metadata.mapBackgrounds[this.gameState.currentBackgroundIndex];
        const mapType = currentBackground.type;

        // 为不同地图类型设置不同的地面颜色
        switch(mapType) {
            case 'snow':
                groundMaterial.diffuseColor = new BABYLON.Color3(0.95, 0.97, 1.0);
                groundMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.35);
                break;
            case 'forest':
                groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.3);
                groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.15, 0.1);
                break;
            case 'desert':
                groundMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.6);
                groundMaterial.specularColor = new BABYLON.Color3(0.2, 0.18, 0.15);
                break;
            case 'mountain':
                groundMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.55, 0.5);
                groundMaterial.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
                break;
            default:
                groundMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.75, 0.6);
                groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        }
    } else {
        groundMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.75, 0.6);
        groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    }

    groundMaterial.specularPower = 32;
    ground.material = groundMaterial;
    ground.position.y = GROUND_Y;
    ground.isPickable = true;
    ground.receiveShadows = true;

    // 用于跟踪鼠标点击和拖动的变量
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    const dragThreshold = 5; // 拖动阈值，超过这个值认为是拖动操作

    // 设置场景点击事件
    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                // 记录鼠标按下的位置
                dragStartX = pointerInfo.event.clientX;
                dragStartY = pointerInfo.event.clientY;
                isDragging = false;
                break;
            case BABYLON.PointerEventTypes.POINTERMOVE:
                // 检查是否超过拖动阈值
                if (!isDragging) {
                    const deltaX = Math.abs(pointerInfo.event.clientX - dragStartX);
                    const deltaY = Math.abs(pointerInfo.event.clientY - dragStartY);
                    if (deltaX > dragThreshold || deltaY > dragThreshold) {
                        isDragging = true;
                    }
                }
                break;
            case BABYLON.PointerEventTypes.POINTERUP:
                // 只有当不是拖动操作时，才处理人物移动
                if (!isDragging) {
                    const pickResult = scene.pick(scene.pointerX, scene.pointerY);
                    if (pickResult.hit) {
                        // 处理鼠标点击，人物移动
                        this.handleMouseClick();
                        
                        // 点击后检查敌人碰撞
                        if (!this.gameState.battle.inBattle) {
                            this.checkSceneMonsterCollision();
                        }
                    }
                }
                break;
        }
    });

    // 初始化 battle3D 对象（探险专用）
    this.battle3D = {
        engine: engine,
        scene: scene,
        camera: camera,
        player: null,
        enemy: null,
        canvas: canvas,
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
        shadowGenerator: shadowGenerator, // 添加阴影生成器
        SKY_SIZE: SKY_SIZE,
        GROUND_Y: GROUND_Y,
        PLAYER_HEIGHT: PLAYER_HEIGHT,
        PLAYER_BOUNDARY: PLAYER_BOUNDARY,
        // 移动速度常量
        WALK_SPEED: WALK_SPEED,
        RUN_SPEED: RUN_SPEED,
        FLY_SPEED: FLY_SPEED,
        FLY_VERTICAL_SPEED: FLY_VERTICAL_SPEED,
        WALK_CLICK_SPEED: WALK_CLICK_SPEED,
        RUN_CLICK_SPEED: RUN_CLICK_SPEED,
        FLY_CLICK_SPEED: FLY_CLICK_SPEED,
        DOUBLE_CLICK_THRESHOLD: DOUBLE_CLICK_THRESHOLD,
        MAX_FLY_HEIGHT: MAX_FLY_HEIGHT
    };
    console.log('初始化 battle3D 对象成功');

    // ========== 碰撞系统 - 障碍物列表 ==========
    this.battle3D.obstacles = [];

    // 添加 resize 事件处理程序
    window.addEventListener('resize', () => {
        if (this.battle3D && this.battle3D.engine) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            canvas.width = Math.max(containerWidth || 1024, 1);
            canvas.height = Math.max(containerHeight || 500, 1);
            
            this.battle3D.engine.resize();
        }
    });

    // 创建探险元素
   this.createPlayerModel();
    // 设置玩家初始位置，让脚接触地面
    if (this.battle3D.player) {
        this.battle3D.player.position.x = 0;
        this.battle3D.player.position.y = GROUND_Y + PLAYER_HEIGHT;  // 相对地面高度
        this.battle3D.player.position.z = 0;
    }
    this.createSkyDome(); // 创建修仙场景背景（渐变色+远景山脉）
    this.createTrees();
    this.createBuildings(); // 创建建筑物（小屋、草庐、石碑）
    this.createBoundaryObstacles(); // 创建边界遮挡物环
    this.createPreGeneratedEnemies();

    // 粒子特效系统
    this.createSnowSystem();       // 雪花
    this.createSpiritParticles();  // 仙气光点
    this.createLeafParticles();    // 落叶（森林地图）

    this.createHealthBars();
    
    // 渲染循环
    engine.runRenderLoop(() => {
        this.animateMap3D();
        scene.render();
    });

    window.addEventListener('resize', () => {
        if (this.battle3D && this.battle3D.engine) {
            this.battle3D.engine.resize();
        }
    });
    console.log('3D探险场景初始化完成');
};

// ==================== 小地图系统 ====================

// 生成小地图并初始化场景怪物数据
EndlessWinterGame.prototype.generateMiniMap = function() {
    const mapGrid = document.getElementById('map-grid');
    if (!mapGrid) return;
    mapGrid.innerHTML = '';

    const SKY_SIZE = this.battle3D ? this.battle3D.SKY_SIZE : SIZES.SKY_SIZE;

    this.gameState.sceneMonsters = [];
    const totalCells = 49;  // 7x7 网格
    const enemyDistribution = this.createEnemyDistribution(totalCells);
    const playerCell = 24;  // 7x7 中心格
    let enemyIndex = 0;
    mapGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';

    for (let i = 0; i < totalCells; i++) {
        const gridCell = document.createElement('div');
        gridCell.className = 'bg-dark/30 rounded flex items-center justify-center';
        gridCell.dataset.cellIndex = i;

        if (i !== playerCell && enemyIndex < enemyDistribution.length) {
            // 敌人3D位置：随机分布在较大范围内（从 SKY_SIZE 派生）
            const maxDist = Math.round(SKY_SIZE * 0.32);
            const minDist = Math.max(5, Math.round(SKY_SIZE * 0.03));
            const angle = Math.random() * Math.PI * 2;
            const dist = minDist + Math.random() * (maxDist - minDist);
            const enemyX = Math.cos(angle) * dist;
            const enemyZ = Math.sin(angle) * dist;

            const enemyInfo = this.createEnemy(enemyDistribution, enemyIndex, enemyX, enemyZ, i);
            enemyIndex++;
            this.gameState.sceneMonsters.push(enemyInfo);
            const enemyIcon = this.createEnemyIcon(enemyInfo);
            gridCell.appendChild(enemyIcon);
        }

        mapGrid.appendChild(gridCell);
    }

    this.updateMapBackground();
};

// 根据格子总数生成敌人分布（根据地图境界调整难度）
EndlessWinterGame.prototype.createEnemyDistribution = function(totalCells) {
    const availableCells = totalCells - 1;
    const totalEnemies = Math.max(30, Math.floor(availableCells * 0.9));

    // 获取当前地图的境界需求
    const mapType = this.metadata.mapBackgrounds[this.gameState.currentBackgroundIndex]?.type;
    const realmReq = this.metadata.mapRealmRequirements[mapType];
    const realmLevel = realmReq ? realmReq.realm : 0; // 0-5

    // 根据境界调整分布（高境界更多精英和Boss）
    // 武者(0): 8% Boss, 25% Elite, 67% Normal
    // 炼气(1): 10% Boss, 30% Elite, 60% Normal
    // 筑基(2): 12% Boss, 35% Elite, 53% Normal
    // 金丹(3): 14% Boss, 40% Elite, 46% Normal
    // 元婴(4): 16% Boss, 45% Elite, 39% Normal
    // 化神(5): 18% Boss, 50% Elite, 32% Normal
    const bossRatio = 0.08 + realmLevel * 0.02;  // 8% + 2%*境界
    const eliteRatio = 0.25 + realmLevel * 0.05; // 25% + 5%*境界

    const bossCount = Math.ceil(totalEnemies * bossRatio);
    const eliteCount = Math.ceil(totalEnemies * eliteRatio);
    const normalCount = totalEnemies - bossCount - eliteCount;

    const enemyDistribution = [];

    for (let i = 0; i < bossCount; i++) {
        enemyDistribution.push('boss');
    }

    for (let i = 0; i < eliteCount; i++) {
        enemyDistribution.push('elite');
    }

    for (let i = 0; i < normalCount; i++) {
        enemyDistribution.push('normal');
    }

    // 随机打乱
    for (let i = enemyDistribution.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [enemyDistribution[i], enemyDistribution[j]] = [enemyDistribution[j], enemyDistribution[i]];
    }

    return enemyDistribution;
};

// 重新渲染小地图
EndlessWinterGame.prototype.renderMiniMap = function() {
    const mapGrid = document.getElementById('map-grid');
    if (!mapGrid) return;
    mapGrid.innerHTML = '';
    mapGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';

    for (let i = 0; i < 49; i++) {
        const gridCell = document.createElement('div');
        gridCell.className = 'bg-dark/30 rounded flex items-center justify-center';
        gridCell.dataset.cellIndex = i;

        const enemyInCell = this.gameState.sceneMonsters.find(monster => monster.cellIndex === i);
        if (enemyInCell) {
            const icon = this.createEnemyIcon(enemyInCell);
            gridCell.appendChild(icon);
        }

        mapGrid.appendChild(gridCell);
    }
};

// 创建敌人图标，用于2D小地图
EndlessWinterGame.prototype.createEnemyIcon = function(enemyInfo) {
    let enemyPower = enemyInfo.attack * 2 + enemyInfo.defense * 1.5 + enemyInfo.maxHp * 0.1;
    const playerAttack = this.gameState.player.attack + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.attack : 0);
    const playerDefense = this.gameState.player.defense + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.defense : 0);
    const playerPower = playerAttack * 2 + playerDefense * 1.5 + this.gameState.player.maxHp * 0.1;

    let enemyIconColor = 'text-green-500';
    let enemyBgColor = 'bg-green-500/30';
    if (enemyPower > playerPower * 1.5) {
        enemyIconColor = 'text-red-500';
        enemyBgColor = 'bg-red-500/30';
    } else if (enemyPower > playerPower) {
        enemyIconColor = 'text-yellow-500';
        enemyBgColor = 'bg-yellow-500/30';
    }

    const enemyIcon = document.createElement('div');
    enemyIcon.className = `w-5 h-5 rounded-full ${enemyBgColor} flex items-center justify-center ${enemyIconColor} cursor-pointer transition-colors`;
    enemyIcon.innerHTML = `<i class="fa fa-skull text-xs ${enemyIconColor}"></i>`;

    enemyIcon.dataset.enemyInfo = JSON.stringify(enemyInfo);
    enemyIcon.setAttribute('data-tooltip', `${enemyInfo.name}\n等级: ${enemyInfo.level}\nHP: ${enemyInfo.hp}/${enemyInfo.maxHp}\n攻击: ${enemyInfo.attack}\n防御: ${enemyInfo.defense}${enemyInfo.isBoss ? '\n灵力: 100/100' : ''}`);

    enemyIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        try {
            const info = JSON.parse(enemyIcon.dataset.enemyInfo);
            // 移动玩家到敌人附近，到达后显示攻击确认
            this.movePlayerToEnemy(info);
        } catch (error) {
            console.error('解析敌人信息失败:', error);
        }
    });

    return enemyIcon;
};

// 创建敌人实体并返回信息对象
EndlessWinterGame.prototype.createEnemy = function(enemyDistribution, enemyIndex, x, z, i) {
    const playerLevel = this.calculateTotalLevel(this.gameState.player);
    const enemyLevel = Math.max(1, Math.min(playerLevel + 3, playerLevel + Math.floor(Math.random() * 3) - 1));

    const enemyType = enemyDistribution[enemyIndex];
    let isElite = false;
    let isBoss = false;
    let bonus = 0;

    if (enemyType === 'boss') {
        isBoss = true;
        bonus = 1.0;
    } else if (enemyType === 'elite') {
        isElite = true;
        bonus = 0.5;
    }

    // 获取当前地图类型
    const currentBackground = this.metadata.mapBackgrounds && this.gameState.currentBackgroundIndex !== undefined ?
        this.metadata.mapBackgrounds[this.gameState.currentBackgroundIndex] : null;
    const mapType = currentBackground ? currentBackground.type : null;

    if (!mapType) {
        console.error('createEnemy: 当前地图类型未定义', {
            currentBackgroundIndex: this.gameState.currentBackgroundIndex,
            mapBackgroundsLength: this.metadata.mapBackgrounds?.length
        });
        return null;
    }

    // 获取当前地图的敌人列表
    if (!this.metadata.mapEnemyMapping || !this.metadata.mapEnemyMapping[mapType]) {
        console.error('createEnemy: mapEnemyMapping 中未找到当前地图类型', {
            mapType: mapType,
            availableMapTypes: this.metadata.mapEnemyMapping ? Object.keys(this.metadata.mapEnemyMapping) : []
        });
        return null;
    }
    const mapEnemies = this.metadata.mapEnemyMapping[mapType];

    // 检查敌人类型配置
    if (!this.metadata.enemyTypes || this.metadata.enemyTypes.length === 0) {
        console.error('createEnemy: enemyTypes 未配置或为空');
        return null;
    }

    // 随机选择敌人
    const randomEnemyName = mapEnemies[Math.floor(Math.random() * mapEnemies.length)];
    const selectedEnemyType = this.metadata.enemyTypes.find(enemy => enemy.name === randomEnemyName);

    if (!selectedEnemyType) {
        console.error('createEnemy: 在 enemyTypes 中找不到选中的敌人', {
            randomEnemyName: randomEnemyName,
            availableEnemyTypes: this.metadata.enemyTypes.map(e => e.name)
        });
        return null;
    }

    // 从敌人类型获取基础属性
    const baseHp = selectedEnemyType.baseHp || 30;
    const baseAttack = selectedEnemyType.baseAttack || 8;
    const baseDefense = selectedEnemyType.baseDefense || 2;
    const baseSpeed = selectedEnemyType.baseSpeed || 5;
    const baseLuck = selectedEnemyType.baseLuck || 1;

    // 线性成长公式（与 BALANCE_DESIGN.md 一致）
    // 成长率：HP +50%基础值/级，Attack/Defense +30%基础值/级，Speed/Luck +20%基础值/级
    const finalHp = Math.floor((baseHp + (enemyLevel - 1) * baseHp * 0.5) * (1 + bonus));
    const finalAttack = Math.floor((baseAttack + (enemyLevel - 1) * baseAttack * 0.3) * (1 + bonus));
    const finalDefense = Math.floor((baseDefense + (enemyLevel - 1) * baseDefense * 0.3) * (1 + bonus));
    const finalSpeed = Math.floor((baseSpeed + (enemyLevel - 1) * baseSpeed * 0.2) * (1 + bonus));
    const finalLuck = Math.floor((baseLuck + (enemyLevel - 1) * baseLuck * 0.2) * (1 + bonus));

    // 检测飞行敌人（鸟类和幽灵类）
    const category = this.getEnemyCategory ? this.getEnemyCategory(selectedEnemyType.name) : null;
    const isFlyingEnemy = category === 'BIRD' || category === 'GHOST';
    const flyHeight = isFlyingEnemy ?
        SIZES.BIRD_MIN_HEIGHT + Math.random() * (SIZES.BIRD_MAX_HEIGHT - SIZES.BIRD_MIN_HEIGHT) : 0;

    return {
        level: enemyLevel,
        hp: finalHp,
        maxHp: finalHp,
        attack: finalAttack,
        defense: finalDefense,
        speed: finalSpeed,
        luck: finalLuck,
        energy: isBoss ? 100 : 0,
        maxEnergy: isBoss ? 100 : 0,
        isElite: isElite,
        isBoss: isBoss,
        bonus: bonus,
        name: isBoss ? `BOSS${selectedEnemyType.name}` : (isElite ? `精英${selectedEnemyType.name}` : selectedEnemyType.name),
        icon: isBoss ? 'fa-star' : (isElite ? 'fa-diamond' : selectedEnemyType.icon),
        image: selectedEnemyType.image,
        expMultiplier: selectedEnemyType.expMultiplier * (isBoss ? 2.0 : (isElite ? 1.5 : 1)),
        resourceMultiplier: selectedEnemyType.resourceMultiplier * (isBoss ? 2.0 : (isElite ? 1.5 : 1)),
        position: { x, z, y: flyHeight },
        isFlying: isFlyingEnemy,
        baseName: selectedEnemyType.name,
        cellIndex: i
    };
};

// 保存地图场景状态
EndlessWinterGame.prototype.saveMapState = function() {
    this.mapState = {
        playerPosition: this.battle3D ? this.battle3D.player.position.clone() : null,
        enemies: this.battle3D ? this.battle3D.enemies.filter(e => e.active) : [],
        sceneMonsters: JSON.parse(JSON.stringify(this.gameState.sceneMonsters)),
        needsRefresh: false
    };
};

// 检查玩家与场景怪物的碰撞（2D映射碰撞）
EndlessWinterGame.prototype.checkSceneMonsterCollision = function() {
    // 检查 battle3D 和玩家是否存在
    if (!this.battle3D || !this.battle3D.player) {
        console.warn('checkSceneMonsterCollision: battle3D 或 player 不存在');
        return;
    }

    // 检查场景怪物数据是否存在
    if (!this.gameState.sceneMonsters || this.gameState.sceneMonsters.length === 0) {
        console.warn('checkSceneMonsterCollision: sceneMonsters 为空');
        this.gameState.battle.inBattle = false;
        this.clearEnemyInfo();
        this.gameState.enemy = null;
        return;
    }

    const playerPos = this.battle3D.player.position;
    const COLLISION_THRESHOLD = SIZES.COLLISION_THRESHOLD;  // 碰撞距离（触发攻击确认）
    const DETECTION_RANGE = SIZES.DETECTION_RANGE;      // 敌人感知范围（显示敌人信息）
    const playerHeightAboveGround = playerPos.y - this.battle3D.GROUND_Y;

    let nearestEnemy = null;
    let nearestDistance = Infinity;
    let enemyInCollision = false;

    // 遍历所有场景怪物，找到最近的敌人
    for (let i = 0; i < this.gameState.sceneMonsters.length; i++) {
        const monster = this.gameState.sceneMonsters[i];

        // 飞行敌人：垂直距离太远则跳过
        if (monster.isFlying) {
            if (Math.abs(playerHeightAboveGround - (monster.position.y || 0)) > SIZES.FLY_COLLISION_THRESHOLD) {
                continue;
            }
        }
        const distance = Math.sqrt(
            Math.pow(playerPos.x - monster.position.x, 2) +
            Math.pow(playerPos.z - monster.position.z, 2)
        );

        // 记录最近的敌人
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestEnemy = monster;
        }

        // 检查是否有碰撞（在攻击范围内）
        if (distance < COLLISION_THRESHOLD) {
            enemyInCollision = true;
        }
    }

    // 如果最近的敌人在感知范围内，显示敌人信息
    if (nearestDistance < DETECTION_RANGE && nearestEnemy) {
        // 只有当敌人信息发生变化时才更新
        const currentEnemyName = this.gameState.enemy?.name;
        const currentEnemyLevel = this.gameState.enemy?.level;
        if (currentEnemyName !== nearestEnemy.name || currentEnemyLevel !== nearestEnemy.level) {
            this.showAttackConfirmation(nearestEnemy);
        }

        // 如果在碰撞范围内，显示攻击按钮
        const confirmBtn = document.getElementById('confirm-attack-btn');
        if (confirmBtn && enemyInCollision) {
            confirmBtn.classList.remove('hidden');
        }
    } else {
        // 玩家离开了所有敌人的感知范围，清除敌人信息
        console.log('玩家离开敌人感知范围，清除敌人信息');
        this.gameState.battle.inBattle = false;
        this.clearEnemyInfo();
        this.gameState.enemy = null;
    }
};

// 恢复地图场景（从战斗退出时调用）
EndlessWinterGame.prototype.restoreMapScene = function() {
    console.log('恢复地图场景...');

    // 显示敌人信息面板（退出战斗场景时）
    const enemyInfoPanel = document.getElementById('enemy-info-panel');
    if (enemyInfoPanel) {
        enemyInfoPanel.classList.remove('hidden');
    }

    // 清理旧引擎
    if (this.battle3D && this.battle3D.engine) {
        try {
            this.battle3D.engine.dispose();
        } catch (e) {
            console.log('restoreMapScene 清理旧引擎失败:', e);
        }
    }

    this.battle3D = null;
    this.gameState.battle.inBattle = false;

    // 恢复场景怪物状态
    if (this.mapState && this.mapState.sceneMonsters) {
        const enemyDefeated = this.gameState.enemy && this.gameState.enemy.hp <= 0;

        if (enemyDefeated) {
            const currentEnemyCellIndex = this.gameState.enemy.cellIndex;
            if (currentEnemyCellIndex !== undefined) {
                this.mapState.sceneMonsters = this.mapState.sceneMonsters.filter(monster =>
                    monster.cellIndex !== currentEnemyCellIndex
                );
            }
        }

        this.gameState.sceneMonsters = JSON.parse(JSON.stringify(this.mapState.sceneMonsters));

        if (this.gameState.sceneMonsters.length === 0) {
            // 所有敌人都被击败，刷新地图
            this.generateMiniMap();
        } else {
            // 还有敌人，保持原有分布
            this.renderMiniMap();
        }
    } else {
        // 没有地图状态，生成新地图
        this.generateMiniMap();
    }

    // 清空敌人信息
    this.clearEnemyInfo();

    // 重新初始化探险场景
    this.initMap3DScene();

    // 恢复玩家位置
    if (this.mapState && this.mapState.playerPosition) {
        setTimeout(() => {
            if (this.battle3D && this.battle3D.player && this.mapState.playerPosition) {
                this.battle3D.player.position.copyFrom(this.mapState.playerPosition);
                console.log('玩家位置已恢复');
            }
        }, 100);
    }
};

// 初始化地图（新登录时调用）
EndlessWinterGame.prototype.initMap = function() {
    console.log('初始化探险地图...');

    // 重置敌人分布标记
    this.mapState = {
        needsRefresh: true,
        playerPosition: null,
        sceneMonsters: []
    };

    // 清空敌人信息
    this.clearEnemyInfo();

    // 重新生成敌人
    this.generateMiniMap();

    // 初始化探险3D场景
    this.initMap3DScene();

    console.log('探险地图初始化完成');
};

// ==================== 探险控制 ====================

// 处理键盘按键（人物移动和技能快捷键）
EndlessWinterGame.prototype.handleKeyPress = function(e) {
    console.log('检测到键盘按键:', e.key);

    // 优先处理战斗中的技能快捷键
    if (this.gameState.battle.inBattle) {
        const attackSkillsContainer = document.getElementById('attack-skills');
        if (attackSkillsContainer) {
            const skillButtons = attackSkillsContainer.querySelectorAll('button');

            // 使用 hjkl; 键对应技能按钮（更方便的键盘布局）
            const keyMap = {
                'h': 0,  // 普通攻击
                'j': 1,  // 攻击技能
                'k': 2,  // 防御技能
                'l': 3,  // 恢复技能
                ';': 4   // 特殊技能
            };

            const lowerKey = e.key.toLowerCase();
            if (keyMap.hasOwnProperty(lowerKey)) {
                const buttonIndex = keyMap[lowerKey];
                if (skillButtons[buttonIndex]) {
                    console.log(`触发快捷键 ${e.key}，点击按钮 ${buttonIndex}`);
                    skillButtons[buttonIndex].click();
                    e.preventDefault();
                    return;
                }
            }
        }

        console.log('正在战斗中，无法移动');
        return;
    }

    if (!this.battle3D) {
        console.log('battle3D 不存在');
        return;
    }
    if (!this.battle3D.player) {
        console.log('player 不存在');
        return;
    }

    // 键盘输入时取消点击移动
    if (this.moveAnimationId) {
        cancelAnimationFrame(this.moveAnimationId);
        this.moveAnimationId = null;
        this.isMoving = false;
    }

    // 根据当前移动模式获取速度
    const speed = this.isFlying ? this.battle3D.FLY_SPEED :
                  this.movementMode === 'run' ? this.battle3D.RUN_SPEED :
                  this.battle3D.WALK_SPEED;
    const boundary = this.battle3D.PLAYER_BOUNDARY;  // 使用统一的边界配置
    const cameraAlpha = this.battle3D.camera.alpha; // 相机水平旋转角
    let needUpdate = false;

    // 根据按键计算相机朝向的局部方向
    let localDir = new BABYLON.Vector3(0, 0, 0);
    switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
            localDir.z += speed;
            needUpdate = true;
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            localDir.z -= speed;
            needUpdate = true;
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            localDir.x -= speed;
            needUpdate = true;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            localDir.x += speed;
            needUpdate = true;
            break;
        case 'q':
        case 'Q':
            // 飞行模式：按住持续上升
            if (this.isFlying) {
                this.flyKeys.q = true;
                e.preventDefault();
            }
            break;
        case 'e':
        case 'E':
            // 飞行模式：按住持续下降
            if (this.isFlying) {
                this.flyKeys.e = true;
                e.preventDefault();
            }
            break;
        case ' ':
            // 空格键：切换飞行模式
            this.toggleFlight();
            e.preventDefault();
            break;
        case 'Escape':
            // 按ESC键退出战斗或停止移动
            if (this.gameState.battle.inBattle) {
                this.stopAutoBattle();
                this.stopAutoPlay();
            }
            break;
        case 'r':
        case 'R':
            // 按R键刷新敌人分布
            this.refreshEnemies();
            e.preventDefault();
            break;
    }

    if (needUpdate && localDir.length() > 0) {
        e.preventDefault();

        // 将局部方向按相机水平角度旋转，使 WASD 始终跟随相机朝向
        const cosA = Math.cos(cameraAlpha);
        const sinA = Math.sin(cameraAlpha);
        const direction = new BABYLON.Vector3(
            localDir.x * cosA - localDir.z * sinA,
            0,
            localDir.x * sinA + localDir.z * cosA
        );

        // 设置移动状态
        this.isMoving = true;
        
        // 清除之前的移动状态计时器
        if (this.moveTimer) {
            clearTimeout(this.moveTimer);
        }
        
        // 300毫秒后设置为不移动状态
        this.moveTimer = setTimeout(() => {
            this.isMoving = false;
        }, 300);

        // 计算新位置
        let newPos = this.battle3D.player.position.clone().add(direction);

        // 边界限制
        newPos.x = Math.max(-boundary, Math.min(boundary, newPos.x));
        newPos.z = Math.max(-boundary, Math.min(boundary, newPos.z));

        // 碰撞检测
        const validPos = this.getValidPosition(newPos.x, newPos.z);
        if (validPos) {
            this.battle3D.player.position.x = validPos.x;
            this.battle3D.player.position.z = validPos.z;

            // 设置角色朝向移动方向
            this.battle3D.player.rotation.y = Math.atan2(direction.x, direction.z);
        } else {
            // 完全被阻挡，不移动
        }

        // 摄像机跟随玩家
        const target = this.battle3D.player.position.clone();
        this.battle3D.camera.setTarget(target);
    }
};

// 切换飞行模式
EndlessWinterGame.prototype.toggleFlight = function() {
    if (this.gameState.battle.inBattle) return;
    if (!this.battle3D || !this.battle3D.player) return;

    this.isFlying = !this.isFlying;
    if (this.isFlying) {
        this.movementMode = 'fly';
        this.flyHeight = 0;
        console.log('进入飞行模式：按住Q上升 按住E下降 空格退出');
    } else {
        this.movementMode = 'walk';
        this.flyHeight = 0;
        this.flyKeys = { q: false, e: false };  // 清除按键状态
        // 恢复地面高度
        this.battle3D.player.position.y = this.battle3D.GROUND_Y + this.battle3D.PLAYER_HEIGHT;
        console.log('退出飞行模式');
    }
};

// 处理鼠标点击（鼠标引导移动 + 双击跑步）
EndlessWinterGame.prototype.handleMouseClick = function() {
    if (!this.battle3D) {
        console.log('battle3D 不存在');
        return;
    }
    if (!this.battle3D.player) {
        console.log('player 不存在');
        return;
    }
    if (this.gameState.battle.inBattle) {
        console.log('正在战斗中，无法移动');
        return;
    }

    // 双击检测
    const now = Date.now();
    const isDoubleClick = (now - this.lastClickTime) < this.battle3D.DOUBLE_CLICK_THRESHOLD;
    this.lastClickTime = now;

    // 根据双击切换步行/跑步模式（飞行中不受影响）
    if (!this.isFlying) {
        this.movementMode = isDoubleClick ? 'run' : 'walk';
    }

    // 获取点击位置的世界坐标
    const pickResult = this.battle3D.scene.pick(this.battle3D.scene.pointerX, this.battle3D.scene.pointerY);

    if (pickResult.hit && pickResult.pickedPoint) {
        this.movePlayerTo(pickResult.pickedPoint);
    }
};

// 移动玩家到指定位置（通用移动函数）
EndlessWinterGame.prototype.movePlayerTo = function(targetPos, onArrival, forceSpeed) {
    if (!this.battle3D || !this.battle3D.player) return;

    // 取消之前的点击移动
    if (this.moveAnimationId) {
        cancelAnimationFrame(this.moveAnimationId);
        this.moveAnimationId = null;
    }

    const playerPos = this.battle3D.player.position;

    // 限制目标位置在地图范围内
    const boundary = this.battle3D.PLAYER_BOUNDARY;
    targetPos.x = Math.max(-boundary, Math.min(boundary, targetPos.x));
    targetPos.z = Math.max(-boundary, Math.min(boundary, targetPos.z));

    // 碰撞检测 - 如果目标位置被阻挡，尝试滑动
    const validPos = this.getValidPosition(targetPos.x, targetPos.z);
    if (validPos) {
        targetPos.x = validPos.x;
        targetPos.z = validPos.z;
    } else {
        // 完全被阻挡，不移动
        return;
    }

    // 计算移动距离
    const distance = BABYLON.Vector3.Distance(playerPos, new BABYLON.Vector3(targetPos.x, playerPos.y, targetPos.z));

    // 如果距离太近，直接完成
    if (distance <= 0.3) {
        if (typeof onArrival === 'function') onArrival();
        return;
    }

    // 确定速度
    const moveSpeed = forceSpeed ||
        (this.isFlying ? this.battle3D.FLY_CLICK_SPEED :
         this.movementMode === 'run' ? this.battle3D.RUN_CLICK_SPEED :
         this.battle3D.WALK_CLICK_SPEED);

    // 方向向量
    const dx = targetPos.x - playerPos.x;
    const dz = targetPos.z - playerPos.z;
    const dirLen = Math.sqrt(dx * dx + dz * dz);
    const dirX = dx / dirLen;
    const dirZ = dz / dirLen;

    // 设置角色朝向
    this.battle3D.player.rotation.y = Math.atan2(dx, dz);

    this.isMoving = true;
    let stuckFrames = 0;
    const STUCK_LIMIT = 30;
    const ARRIVAL_THRESHOLD = 0.5;
    let lastTime = performance.now();

    const step = (currentTime) => {
        if (!this.battle3D || !this.battle3D.player) {
            this.isMoving = false;
            return;
        }

        const dt = Math.min((currentTime - lastTime) / 1000, 0.1); // 限制最大dt防止跳帧
        lastTime = currentTime;

        const currentPos = this.battle3D.player.position;
        const remaining = Math.sqrt(
            Math.pow(targetPos.x - currentPos.x, 2) +
            Math.pow(targetPos.z - currentPos.z, 2)
        );

        if (remaining < ARRIVAL_THRESHOLD) {
            this.isMoving = false;
            this.moveAnimationId = null;
            if (typeof onArrival === 'function') onArrival();
            return;
        }

        // 计算期望位置
        const stepDist = moveSpeed * dt;
        let desiredX = currentPos.x + dirX * stepDist;
        let desiredZ = currentPos.z + dirZ * stepDist;

        // 边界限制
        desiredX = Math.max(-boundary, Math.min(boundary, desiredX));
        desiredZ = Math.max(-boundary, Math.min(boundary, desiredZ));

        // 碰撞检测+滑动
        const validMovePos = this.getValidPosition(desiredX, desiredZ);
        if (validMovePos) {
            // 只有实际移动了才更新
            const moved = Math.abs(validMovePos.x - currentPos.x) > 0.01 ||
                          Math.abs(validMovePos.z - currentPos.z) > 0.01;
            if (moved) {
                currentPos.x = validMovePos.x;
                currentPos.z = validMovePos.z;
                stuckFrames = 0;
            } else {
                stuckFrames++;
            }
        } else {
            stuckFrames++;
        }

        // 被卡住太久，放弃移动
        if (stuckFrames >= STUCK_LIMIT) {
            this.isMoving = false;
            this.moveAnimationId = null;
            if (typeof onArrival === 'function') onArrival();
            return;
        }

        // 更新摄像机
        if (this.battle3D.camera) {
            this.battle3D.camera.setTarget(currentPos);
        }

        this.moveAnimationId = requestAnimationFrame(step);
    };

    this.moveAnimationId = requestAnimationFrame(step);
};

// 移动玩家到敌人附近（用于点击2D小地图敌人时）
EndlessWinterGame.prototype.movePlayerToEnemy = function(enemyInfo) {
    if (!this.battle3D || !this.battle3D.player) {
        // 如果3D场景不存在，直接显示敌人信息
        this.showAttackConfirmation(enemyInfo);
        return;
    }

    if (this.gameState.battle.inBattle) {
        // 如果正在战斗，直接显示敌人信息
        this.showAttackConfirmation(enemyInfo);
        return;
    }

    // 获取敌人的3D位置
    const enemyPos = enemyInfo.position;
    if (!enemyPos) {
        // 如果没有位置信息，直接显示敌人信息
        this.showAttackConfirmation(enemyInfo);
        return;
    }

    // 计算敌人附近的位置（在敌人旁边约1单位距离）
    const playerPos = this.battle3D.player.position;
    const direction = new BABYLON.Vector3(
        playerPos.x - enemyPos.x,
        0,
        playerPos.z - enemyPos.z
    );
    direction.normalize();

    // 目标位置在敌人旁边
    const targetPos = {
        x: enemyPos.x + direction.x * 0.8,
        z: enemyPos.z + direction.z * 0.8
    };

    // 移动玩家到敌人附近，到达后显示敌人信息（使用跑步速度）
    this.movePlayerTo(targetPos, () => {
        this.showAttackConfirmation(enemyInfo);
    }, this.battle3D.RUN_CLICK_SPEED);
};

// 统一的场景氛围设置（clearColor + 雾效）
EndlessWinterGame.prototype.applySceneAtmosphere = function(scene, background) {
    if (!scene || !background) return;

    if (background.imageUrl) {
        scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
    } else {
        const toHexColor = (color) => {
            if (typeof color === 'number') {
                return '#' + color.toString(16).padStart(6, '0');
            }
            return color;
        };
        scene.clearColor = new BABYLON.Color4.FromHexString(toHexColor(background.skyColor), 1);
        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogColor = new BABYLON.Color3.FromHexString(toHexColor(background.fogColor));
        scene.fogStart = background.fogNear;
        scene.fogEnd = background.fogFar;
    }
};

// 更新地图背景（UI + 3D场景统一入口）
EndlessWinterGame.prototype.updateMapBackground = function() {
    if (this.metadata.mapBackgrounds.length === 0) return;
    const currentBackground = this.metadata.mapBackgrounds[this.gameState.currentBackgroundIndex];
    if (!currentBackground) return;

    // 更新地图名称显示
    const mapNameElement = document.getElementById('current-map-name');
    if (mapNameElement) {
        mapNameElement.textContent = currentBackground.name;
    }

    // 更新2D地图背景图片
    const backgroundElement = document.querySelector('#map-background img');
    if (backgroundElement && currentBackground.imageUrl) {
        backgroundElement.src = currentBackground.imageUrl;
    }

    // 更新3D场景氛围
    this.applySceneAtmosphere(this.battle3D && this.battle3D.scene, currentBackground);
};

// ==================== 探险动画循环 ====================

// 探险场景动画循环
EndlessWinterGame.prototype.animateMap3D = function() {
    if (!this.battle3D) return;

    const player = this.battle3D.player;
    const camera = this.battle3D.camera;

    if (player && camera) {
        // 飞行模式：按住 Q/E 持续升降
        if (this.isFlying && this.flyKeys) {
            if (this.flyKeys.q) {
                this.flyHeight = Math.min(this.flyHeight + this.battle3D.FLY_VERTICAL_SPEED, this.battle3D.MAX_FLY_HEIGHT);
            }
            if (this.flyKeys.e) {
                this.flyHeight = Math.max(this.flyHeight - this.battle3D.FLY_VERTICAL_SPEED, 0);
            }
        }

        // 计算基础高度
        const baseY = this.battle3D.GROUND_Y + this.battle3D.PLAYER_HEIGHT;

        // 更新玩家位置（走动/飞行动画效果）
        if (this.isFlying) {
            // 飞行模式：悬浮高度 + 轻微上下浮动
            const time = Date.now() * 0.003;
            player.position.y = baseY + this.flyHeight + Math.sin(time) * 0.15;
        } else if (this.isMoving) {
            // 地面移动：行走起伏
            const time = Date.now() * 0.005;
            const bounce = this.movementMode === 'run' ? 0.15 : 0.1;  // 跑步起伏更大
            player.position.y = baseY + Math.sin(time) * bounce;
        } else {
            player.position.y = baseY;
        }

        // 边界限制（防止玩家走出地图）
        const boundary = this.battle3D.PLAYER_BOUNDARY;
        player.position.x = Math.max(-boundary, Math.min(boundary, player.position.x));
        player.position.z = Math.max(-boundary, Math.min(boundary, player.position.z));

        // 对于 ArcRotateCamera，只需要更新目标点
        camera.setTarget(new BABYLON.Vector3(player.position.x, player.position.y, player.position.z));
    }

    // 更新敌人动画
    this.battle3D.enemies.forEach(enemy => {
        if (enemy.model && enemy.active) {
            enemy.model.rotation.y += 0.01;
            // 飞行敌人悬浮动画
            if (enemy.info.isFlying) {
                const baseY = this.battle3D.GROUND_Y + (enemy.info.position.y || 0);
                enemy.model.position.y = baseY + Math.sin(Date.now() * 0.002 + enemy.model.uniqueId) * 0.5;
            }
        }
    });

    // 更新血条显示
    this.updateHealthBars();

    // 雪花跟随玩家位置
    if (this.battle3D.snowSystem && this.battle3D.player) {
        const p = this.battle3D.player.position;
        this.battle3D.snowSystem.emitter = new BABYLON.Vector3(p.x, p.y + 15, p.z);
    }
};

// ==================== 探险3D元素创建 ====================

// 创建雪花粒子系统
EndlessWinterGame.prototype.createSnowSystem = function() {
    if (!this.battle3D || !this.battle3D.scene) return;

    // 创建雪花粒子系统
    const snowSystem = new BABYLON.ParticleSystem("snowSystem", 200, this.battle3D.scene);

    // 设置粒子纹理（使用默认纹理）
    snowSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.battle3D.scene);

    // 设置粒子发射位置（初始位置，会在动画循环中跟随玩家）
    snowSystem.emitter = new BABYLON.Vector3(0, 5, 0);
    snowSystem.minEmitBox = new BABYLON.Vector3(-10, 0, -10);
    snowSystem.maxEmitBox = new BABYLON.Vector3(10, 0, 10);

    // 设置粒子颜色
    snowSystem.color1 = new BABYLON.Color4(1, 1, 1, 0.8);
    snowSystem.color2 = new BABYLON.Color4(0.9, 0.9, 1, 0.8);
    snowSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

    // 设置粒子大小
    snowSystem.minSize = 0.03;
    snowSystem.maxSize = 0.07;

    // 设置粒子生命周期
    snowSystem.minLifeTime = 5;
    snowSystem.maxLifeTime = 10;

    // 设置粒子速度
    snowSystem.minSpeed = 0.5;
    snowSystem.maxSpeed = 1;

    // 设置粒子方向
    snowSystem.direction1 = new BABYLON.Vector3(-0.5, -1, -0.5);
    snowSystem.direction2 = new BABYLON.Vector3(0.5, -1, 0.5);

    // 设置发射率
    snowSystem.emitRate = 20;

    // 启动粒子系统
    snowSystem.start();

    this.battle3D.snowSystem = snowSystem;
};

// 创建仙气粒子系统（飘浮的光点）
EndlessWinterGame.prototype.createSpiritParticles = function() {
    if (!this.battle3D || !this.battle3D.scene) return;

    // 创建仙气粒子系统
    const spiritSystem = new BABYLON.ParticleSystem("spiritSystem", 100, this.battle3D.scene);

    // 设置粒子纹理
    spiritSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.battle3D.scene);

    // 发射位置（围绕玩家周围）
    spiritSystem.emitter = new BABYLON.Vector3(0, 0, 0);
    spiritSystem.minEmitBox = new BABYLON.Vector3(-30, 0, -30);
    spiritSystem.maxEmitBox = new BABYLON.Vector3(30, 10, 30);

    // 粒子颜色（蓝绿色发光）
    spiritSystem.color1 = new BABYLON.Color4(0.5, 0.8, 1.0, 0.6);
    spiritSystem.color2 = new BABYLON.Color4(0.7, 1.0, 0.9, 0.5);
    spiritSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

    // 粒子大小
    spiritSystem.minSize = 0.05;
    spiritSystem.maxSize = 0.12;

    // 生命周期
    spiritSystem.minLifeTime = 8;
    spiritSystem.maxLifeTime = 15;

    // 速度（缓慢上升）
    spiritSystem.minSpeed = 0.05;
    spiritSystem.maxSpeed = 0.15;
    spiritSystem.direction1 = new BABYLON.Vector3(-0.2, 0.5, -0.2);
    spiritSystem.direction2 = new BABYLON.Vector3(0.2, 1, 0.2);

    // 发射率（稀疏分布）
    spiritSystem.emitRate = 3;

    // 启动
    spiritSystem.start();

    this.battle3D.spiritSystem = spiritSystem;
};

// 创建落叶粒子系统（森林地图）
EndlessWinterGame.prototype.createLeafParticles = function() {
    const mapType = this.metadata.mapBackgrounds[this.gameState.currentBackgroundIndex]?.type;

    // 只在森林地图显示
    if (mapType !== 'xianxia-forest' || !this.battle3D || !this.battle3D.scene) return;

    const leafSystem = new BABYLON.ParticleSystem("leafSystem", 50, this.battle3D.scene);

    leafSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.battle3D.scene);

    leafSystem.emitter = new BABYLON.Vector3(0, 8, 0);
    leafSystem.minEmitBox = new BABYLON.Vector3(-25, 0, -25);
    leafSystem.maxEmitBox = new BABYLON.Vector3(25, 0, 25);

    // 落叶颜色（黄绿色）
    leafSystem.color1 = new BABYLON.Color4(0.8, 0.9, 0.3, 0.9);
    leafSystem.color2 = new BABYLON.Color4(0.5, 0.8, 0.2, 0.8);
    leafSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

    leafSystem.minSize = 0.08;
    leafSystem.maxSize = 0.15;

    leafSystem.minLifeTime = 6;
    leafSystem.maxLifeTime = 12;

    leafSystem.minSpeed = 0.3;
    leafSystem.maxSpeed = 0.8;
    leafSystem.direction1 = new BABYLON.Vector3(-0.5, -1, -0.5);
    leafSystem.direction2 = new BABYLON.Vector3(0.5, -1, 0.5);

    leafSystem.emitRate = 5;

    leafSystem.start();

    this.battle3D.leafSystem = leafSystem;
};

// 预生成多个敌人（探险场景）
EndlessWinterGame.prototype.createPreGeneratedEnemies = function() {
    // 清空敌人列表
    this.battle3D.enemies = [];

    // 使用场景怪物数据生成敌人
    if (this.gameState.sceneMonsters && this.gameState.sceneMonsters.length > 0) {
        // 遍历场景怪物数据
        for (const enemyInfo of this.gameState.sceneMonsters) {
            // 创建简单的敌人模型（不使用复杂的模型创建函数，避免冲突）
            const enemyGroup = this.createEnemyGroup(enemyInfo);

            // 根据敌人类型确定缩放倍率（用于反缩放血条）
            const isBoss = String(enemyInfo.name || '').startsWith('BOSS') || enemyInfo.isBoss;
            const isElite = String(enemyInfo.name || '').startsWith('精英') || enemyInfo.isElite;
            const scale = isBoss ? SIZES.ENEMY_SCALE_BOSS : (isElite ? SIZES.ENEMY_SCALE_ELITE : SIZES.ENEMY_SCALE_NORMAL);

            // 根据敌人类别确定血条高度
            const baseName = enemyInfo.baseName || enemyInfo.name?.replace(/^(BOSS|精英)/, '') || enemyInfo.name || '';
            const category = this.getEnemyCategory ? this.getEnemyCategory(baseName) : 'HUMANOID';
            const healthBarY = SIZES.getHealthBarY(category);

            // 创建敌人血条（反缩放，保持血条大小一致）
            const enemyHealthBar = this.createHealthBar(0xff0000);
            enemyHealthBar.scaling.x = 0.5 / scale;
            enemyHealthBar.scaling.y = 1.0 / scale;
            enemyHealthBar.scaling.z = 0.5 / scale;
            enemyHealthBar.position.x = 0;
            enemyHealthBar.position.y = healthBarY; // 按类别设置血条高度
            enemyHealthBar.position.z = 0;
            enemyHealthBar.parent = enemyGroup;

            // 在探险场景中显示血条
            enemyHealthBar.isVisible = true;

            // 存储敌人信息
            this.battle3D.enemies.push({
                model: enemyGroup,
                info: enemyInfo,
                active: true,
                healthBar: enemyHealthBar
            });

            // 注册敌人作为碰撞障碍物
            if (enemyInfo.position) {
                this.registerObstacle(
                    enemyInfo.position.x, enemyInfo.position.z, 0.6, 'enemy',
                    !!enemyInfo.isFlying, enemyInfo.position.y || 0
                );
            }
        }
    } else {
        // 如果没有场景怪物数据，生成默认敌人
        const enemyDistribution = this.createEnemyDistribution(49);
        let enemyIndex = 0;
        for (let i = 0; i < 3; i++) {
            // 随机位置，确保在场景范围内且不与玩家重叠
            let x, z;
            do {
                x = (Math.random() - 0.5) * 16;
                z = (Math.random() - 0.5) * 16;
            } while (Math.sqrt(x * x + z * z) < 1);

            // 创建敌人信息
            const enemyInfo = this.createEnemy(enemyDistribution, enemyIndex, x, z, Math.floor(Math.random() * 25));
            const enemyGroup = this.createEnemyGroup(enemyInfo);
            enemyIndex++;

            // 根据敌人类型确定缩放倍率（用于反缩放血条）
            const eName = String(enemyInfo.name || '');
            const eIsBoss = eName.startsWith('BOSS') || enemyInfo.isBoss;
            const eIsElite = eName.startsWith('精英') || enemyInfo.isElite;
            const eScale = eIsBoss ? SIZES.ENEMY_SCALE_BOSS : (eIsElite ? SIZES.ENEMY_SCALE_ELITE : SIZES.ENEMY_SCALE_NORMAL);

            // 根据敌人类别确定血条高度
            const eBaseName = enemyInfo.baseName || eName.replace(/^(BOSS|精英)/, '') || eName;
            const eCategory = this.getEnemyCategory ? this.getEnemyCategory(eBaseName) : 'HUMANOID';
            const eHealthBarY = SIZES.getHealthBarY(eCategory);

            // 创建敌人血条（反缩放）
            const enemyHealthBar = this.createHealthBar(0xff0000);
            enemyHealthBar.scaling.x = 0.5 / eScale;
            enemyHealthBar.scaling.y = 1.0 / eScale;
            enemyHealthBar.scaling.z = 0.5 / eScale;
            enemyHealthBar.position.x = 0;
            enemyHealthBar.position.y = eHealthBarY;
            enemyHealthBar.position.z = 0;
            enemyHealthBar.parent = enemyGroup;
            enemyHealthBar.isVisible = false;

            this.battle3D.enemies.push({
                model: enemyGroup,
                info: enemyInfo,
                active: true,
                healthBar: enemyHealthBar
            });

            // 注册敌人作为碰撞障碍物
            this.registerObstacle(x, z, 0.6, 'enemy');
        }
    }
};

// ==================== 3D天空背景系统 ====================

// 创建修仙场景背景（多层次远景系统 + 立方体贴图）
// 创建修仙场景背景（使用全景图或渐变色）
EndlessWinterGame.prototype.createSkyDome = function() {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;
    const currentIndex = this.gameState.currentBackgroundIndex;

    console.log('创建修仙场景背景，地图索引:', currentIndex);

    // 获取当前地图的背景图片URL
    const currentBackground = this.metadata.mapBackgrounds[currentIndex];

    // 使用统一的场景大小配置
    const SKY_SIZE = this.battle3D.SKY_SIZE;

    // 如果有图片URL，使用 PhotoDome 全景图（球面投影，360度环绕）
    if (currentBackground && currentBackground.imageUrl) {
        try {
            const dome = new BABYLON.PhotoDome(
                "photoDome",
                currentBackground.imageUrl,
                {
                    resolution: 64,
                    size: SKY_SIZE
                },
                scene
            );

            dome.mesh.isPickable = false;
            this.battle3D.skyDome = dome.mesh;

            dome.onLoadObservable.add(() => {
                console.log('PhotoDome 纹理加载成功');
            });
            dome.onLoadErrorObservable.add((err) => {
                console.error('PhotoDome 纹理加载失败:', err);
            });

            // 全景模式：使用统一氛围设置（禁用雾效 + 黑色背景）
            this.applySceneAtmosphere(scene, currentBackground);

            console.log('PhotoDome 创建完成，size:', SKY_SIZE, 'imageUrl:', currentBackground.imageUrl);
        } catch (error) {
            console.error('创建 PhotoDome 失败，使用渐变色背景:', error);
            this.createGradientBackground(scene);
        }
    } else {
        // 没有图片URL，使用渐变色背景
        this.createGradientBackground(scene);
    }
};

// ========== 碰撞检测系统 ==========

// 检测新位置是否与障碍物碰撞
EndlessWinterGame.prototype.checkCollision = function(newX, newZ) {
    if (!this.battle3D || !this.battle3D.obstacles) return false;

    const playerRadius = 0.5;  // 玩家碰撞半径
    const playerY = this.battle3D.player ? this.battle3D.player.position.y : 0;
    const groundY = this.battle3D.GROUND_Y;

    for (const obstacle of this.battle3D.obstacles) {
        // 飞行敌人：玩家在地面时忽略空中碰撞，反之亦然
        if (obstacle.isFlying) {
            const playerHeightAboveGround = playerY - groundY;
            if (Math.abs(playerHeightAboveGround - obstacle.height) > SIZES.FLY_COLLISION_THRESHOLD) {
                continue;
            }
        }

        const dx = newX - obstacle.x;
        const dz = newZ - obstacle.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minDist = obstacle.radius + playerRadius;

        if (dist < minDist) {
            return obstacle;  // 返回碰撞的障碍物
        }
    }

    return null;  // 没有碰撞
};

// 获取新位置（如果碰撞则返回null）
EndlessWinterGame.prototype.getValidPosition = function(newX, newZ) {
    const obstacle = this.checkCollision(newX, newZ);
    if (!obstacle) {
        return { x: newX, z: newZ };  // 没有碰撞，返回新位置
    }

    // 有碰撞，尝试只移动X或只移动Z（滑行效果）
    // 获取当前玩家位置
    const playerPos = this.battle3D.player ? this.battle3D.player.position : null;
    const currentX = playerPos ? playerPos.x : 0;
    const currentZ = playerPos ? playerPos.z : 0;

    // 尝试只移动X，保持当前Z
    if (!this.checkCollision(newX, currentZ)) {
        return { x: newX, z: currentZ };
    }
    // 尝试只移动Z，保持当前X
    if (!this.checkCollision(currentX, newZ)) {
        return { x: currentX, z: newZ };
    }

    return null;  // 完全被堵住
};

// 注册障碍物
EndlessWinterGame.prototype.registerObstacle = function(x, z, radius, type, isFlying, height) {
    if (!this.battle3D) return;
    this.battle3D.obstacles.push({ x, z, radius, type: type || 'obstacle', isFlying: !!isFlying, height: height || 0 });
};

// 创建渐变色背景（备用方案）
EndlessWinterGame.prototype.createGradientBackground = function(scene) {
    console.log('使用渐变色背景...');

    const SKY_SIZE = this.battle3D ? this.battle3D.SKY_SIZE : SIZES.SKY_SIZE;

    // 根据地图类型设置天空颜色
    const mapType = this.metadata.mapBackgrounds[this.gameState.currentBackgroundIndex]?.type || 'default';
    let skyColorTop, fogColor, mountainColorFar, mountainColorNear;

    // 不同地图类型的配色方案
    switch(mapType) {
        case 'xianxia-mountain':
            skyColorTop = new BABYLON.Color3(0.4, 0.6, 0.9);
            fogColor = new BABYLON.Color3(0.75, 0.85, 0.95);
            mountainColorFar = new BABYLON.Color3(0.5, 0.55, 0.7);
            mountainColorNear = new BABYLON.Color3(0.4, 0.45, 0.5);
            break;
        case 'xianxia-forest':
            skyColorTop = new BABYLON.Color3(0.3, 0.6, 0.4);
            fogColor = new BABYLON.Color3(0.65, 0.75, 0.65);
            mountainColorFar = new BABYLON.Color3(0.35, 0.5, 0.4);
            mountainColorNear = new BABYLON.Color3(0.3, 0.4, 0.35);
            break;
        case 'xianxia-desert':
            skyColorTop = new BABYLON.Color3(0.9, 0.7, 0.5);
            fogColor = new BABYLON.Color3(0.95, 0.85, 0.75);
            mountainColorFar = new BABYLON.Color3(0.8, 0.65, 0.5);
            mountainColorNear = new BABYLON.Color3(0.7, 0.55, 0.45);
            break;
        default:
            skyColorTop = new BABYLON.Color3(0.5, 0.7, 1.0);
            fogColor = new BABYLON.Color3(0.8, 0.88, 0.95);
            mountainColorFar = new BABYLON.Color3(0.6, 0.65, 0.75);
            mountainColorNear = new BABYLON.Color3(0.5, 0.55, 0.6);
    }

    // 设置场景雾效和背景色
    scene.clearColor = new BABYLON.Color4(skyColorTop.r, skyColorTop.g, skyColorTop.b, 1);
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogColor = fogColor;
    scene.fogStart = Math.round(SKY_SIZE * 0.08);
    scene.fogEnd = Math.round(SKY_SIZE * 0.24);

    // 创建远景山脉
    this.createDistantMountains(scene, mountainColorFar, mountainColorNear);

    console.log('渐变色背景创建完成');
};

// ==================== 远景系统 ====================

// 创建远景山脉（多层次，营造深度感）
EndlessWinterGame.prototype.createDistantMountains = function(scene, farColor, nearColor) {
    if (!scene) return;

    const SKY_SIZE = this.battle3D ? this.battle3D.SKY_SIZE : SIZES.SKY_SIZE;

    // 创建三层山脉，由远及近
    const layers = [
        { distance: Math.round(SKY_SIZE * 0.18), height: Math.round(SKY_SIZE * 0.04), count: 8, color: farColor, opacity: 0.3 },   // 远景，最淡
        { distance: Math.round(SKY_SIZE * 0.14), height: Math.round(SKY_SIZE * 0.05), count: 6, color: farColor, opacity: 0.5 },   // 中远景
        { distance: Math.round(SKY_SIZE * 0.10), height: Math.round(SKY_SIZE * 0.06), count: 5, color: nearColor, opacity: 0.7 }    // 中景，较清晰
    ];

    layers.forEach((layer, layerIndex) => {
        for (let i = 0; i < layer.count; i++) {
            const angle = (i / layer.count) * Math.PI * 2;

            // 创建山脉（使用圆锥体模拟山峰）
            const mountain = BABYLON.MeshBuilder.CreateCylinder("mountain_" + layerIndex + "_" + i, {
                diameterTop: 0,
                diameterBottom: 15 + Math.random() * 10,
                height: layer.height + Math.random() * 10,
                tessellation: 6  // 六边形，更像山峰
            }, scene);

            // 设置位置（围成一圈）
            mountain.position.x = Math.cos(angle) * layer.distance;
            mountain.position.z = Math.sin(angle) * layer.distance;
            mountain.position.y = this.battle3D.GROUND_Y + (layer.height + Math.random() * 10) / 2;

            // 山脉材质
            const mountainMaterial = new BABYLON.StandardMaterial("mountainMat_" + layerIndex + "_" + i, scene);
            mountainMaterial.diffuseColor = layer.color;
            mountainMaterial.emissiveColor = layer.color.scale(0.3);  // 添加一点自发光
            mountainMaterial.alpha = layer.opacity;
            mountainMaterial.fogEnabled = true;  // 受雾效影响

            // 禁用光照，使用纯色
            mountainMaterial.disableLighting = true;
            mountainMaterial.backFaceCulling = false;

            mountain.material = mountainMaterial;
        }
    });

    console.log('远景山脉创建完成');
};

// ==================== 装饰元素 ====================

// 创建边界障碍物（岩石+树木环，自然遮挡地面边缘）
EndlessWinterGame.prototype.createBoundaryObstacles = function() {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;
    const GROUND_Y = this.battle3D.GROUND_Y;

    // 边界参数
    const boundaryRadius = SIZES.BOUNDARY_RADIUS;
    const obstacleCount = SIZES.BOUNDARY_OBSTACLE_COUNT;

    // 创建两环障碍物（外环 + 内环），增加密度
    for (let ring = 0; ring < 2; ring++) {
        const ringRadius = boundaryRadius - ring * 10;
        const count = obstacleCount - ring * (obstacleCount - SIZES.BOUNDARY_INNER_COUNT);

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + ring * 0.1; // 内环错开角度
            const radiusJitter = (Math.random() - 0.5) * 8;      // 随机偏移
            const x = Math.cos(angle) * (ringRadius + radiusJitter);
            const z = Math.sin(angle) * (ringRadius + radiusJitter);

            // 随机选择岩石或树木
            if (Math.random() > 0.5) {
                this.createBoundaryTree(x, z, scene, GROUND_Y);
            } else {
                this.createBoundaryRock(x, z, scene, GROUND_Y);
            }
        }
    }

    console.log('边界障碍物创建完成');
};

// 创建边界岩石
EndlessWinterGame.prototype.createBoundaryRock = function(x, z, scene, groundY) {
    const rockSize = SIZES.BOUNDARY_ROCK_SIZE_MIN + Math.random() * (SIZES.BOUNDARY_ROCK_SIZE_MAX - SIZES.BOUNDARY_ROCK_SIZE_MIN);

    const rock = BABYLON.MeshBuilder.CreateBox("boundaryRock_" + x.toFixed(0) + "_" + z.toFixed(0), {
        width: rockSize,
        height: rockSize * 0.6,
        depth: rockSize * 0.8
    }, scene);

    rock.position = new BABYLON.Vector3(x, groundY + rockSize * 0.3, z);
    rock.rotation.y = Math.random() * Math.PI * 2;

    const rockMat = new BABYLON.StandardMaterial("boundaryRockMat", scene);
    rockMat.diffuseColor = new BABYLON.Color3(0.35 + Math.random() * 0.1, 0.33 + Math.random() * 0.08, 0.3 + Math.random() * 0.08);
    rock.material = rockMat;

    this.battle3D.obstacles.push({
        x: x,
        z: z,
        radius: rockSize * 0.6,
        type: 'boundary'
    });
};

// 创建边界树木
EndlessWinterGame.prototype.createBoundaryTree = function(x, z, scene, groundY) {
    const trunkHeight = SIZES.BOUNDARY_TREE_HEIGHT_MIN + Math.random() * (SIZES.BOUNDARY_TREE_HEIGHT_MAX - SIZES.BOUNDARY_TREE_HEIGHT_MIN);
    const leavesSize = SIZES.BOUNDARY_TREE_CROWN_MIN + Math.random() * (SIZES.BOUNDARY_TREE_CROWN_MAX - SIZES.BOUNDARY_TREE_CROWN_MIN);
    const trunkRadius = SIZES.BOUNDARY_TREE_RADIUS_MIN + Math.random() * (SIZES.BOUNDARY_TREE_RADIUS_MAX - SIZES.BOUNDARY_TREE_RADIUS_MIN);

    // 树干
    const trunk = BABYLON.MeshBuilder.CreateCylinder("boundaryTrunk_" + x.toFixed(0) + "_" + z.toFixed(0), {
        diameter: trunkRadius * 2,
        height: trunkHeight,
        tessellation: 6
    }, scene);
    trunk.position = new BABYLON.Vector3(x, groundY + trunkHeight / 2, z);

    // 树冠
    const leaves = BABYLON.MeshBuilder.CreateSphere("boundaryLeaves_" + x.toFixed(0) + "_" + z.toFixed(0), {
        diameter: leavesSize * 2,
        segments: 8
    }, scene);
    leaves.position = new BABYLON.Vector3(x, groundY + trunkHeight + leavesSize * 0.3, z);

    const trunkMat = new BABYLON.StandardMaterial("trunkMat", scene);
    trunkMat.diffuseColor = new BABYLON.Color3(0.35, 0.22, 0.08);
    trunk.material = trunkMat;

    const leavesMat = new BABYLON.StandardMaterial("leavesMat", scene);
    leavesMat.diffuseColor = new BABYLON.Color3(0.15 + Math.random() * 0.15, 0.35 + Math.random() * 0.2, 0.1 + Math.random() * 0.1);
    leaves.material = leavesMat;

    this.battle3D.obstacles.push({
        x: x,
        z: z,
        radius: leavesSize + 0.5,
        type: 'boundary'
    });
};

// 创建装饰元素（树木、岩石、草丛等）
EndlessWinterGame.prototype.createTrees = function() {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    // 根据地图类型调整装饰
    const mapType = this.metadata.mapBackgrounds[this.gameState.currentBackgroundIndex]?.type || 'default';

    // ===== 树木材质 =====
    const trunkMaterial = new BABYLON.StandardMaterial("trunkMaterial", scene);
    trunkMaterial.diffuseColor = new BABYLON.Color3(0.545, 0.271, 0.075);
    trunkMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
    trunkMaterial.specularPower = 10;

    const leavesMaterial = new BABYLON.StandardMaterial("leavesMaterial", scene);
    leavesMaterial.diffuseColor = new BABYLON.Color3(0.133, 0.545, 0.133);
    leavesMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
    leavesMaterial.specularPower = 20;

    // 雪地地图用白雪覆盖的树
    if (mapType === 'snow') {
        leavesMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.95, 0.98);
    }

    // ===== 创建树木（分布到更大区域）=====
    const treeCount = SIZES.TREE_COUNT_MIN + Math.floor(Math.random() * (SIZES.TREE_COUNT_MAX - SIZES.TREE_COUNT_MIN));
    const maxDist = SIZES.TREE_DISTRIBUTION_RADIUS;
    const SKY_SIZE = this.battle3D.SKY_SIZE;
    for (let i = 0; i < treeCount; i++) {
        let x, z;
        do {
            // 随机分布在圆形区域内
            const angle = Math.random() * Math.PI * 2;
            const dist = SIZES.TREE_MIN_SPAWN_DIST + Math.random() * (maxDist - SIZES.TREE_MIN_SPAWN_DIST);
            x = Math.cos(angle) * dist;
            z = Math.sin(angle) * dist;
        } while (Math.sqrt(x * x + z * z) < SIZES.TREE_MIN_CENTER_DIST);

        const trunkHeight = SIZES.TREE_TRUNK_HEIGHT_MIN + Math.random() * (SIZES.TREE_TRUNK_HEIGHT_MAX - SIZES.TREE_TRUNK_HEIGHT_MIN);
        const trunkRadius = SIZES.TREE_TRUNK_RADIUS_MIN + Math.random() * (SIZES.TREE_TRUNK_RADIUS_MAX - SIZES.TREE_TRUNK_RADIUS_MIN);
        const leavesSize = SIZES.TREE_CROWN_SIZE_MIN + Math.random() * (SIZES.TREE_CROWN_SIZE_MAX - SIZES.TREE_CROWN_SIZE_MIN);

        // 创建树干
        const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk" + i, {
            diameter: trunkRadius * 2,
            height: trunkHeight,
            tessellation: 8
        }, scene);
        trunk.material = trunkMaterial;
        trunk.position.set(x, this.battle3D.GROUND_Y + trunkHeight / 2, z);

        // 创建树叶（使用多个球体增加层次感）
        const leaves1 = BABYLON.MeshBuilder.CreateSphere("leaves1_" + i, {
            diameter: leavesSize * 2,
            segments: 8
        }, scene);
        leaves1.material = leavesMaterial;
        leaves1.position.set(x, this.battle3D.GROUND_Y + trunkHeight + leavesSize * 0.3, z);

        const leaves2 = BABYLON.MeshBuilder.CreateSphere("leaves2_" + i, {
            diameter: leavesSize * 1.5,
            segments: 8
        }, scene);
        leaves2.material = leavesMaterial;
        leaves2.position.set(x + leavesSize * 0.3, this.battle3D.GROUND_Y + trunkHeight + leavesSize * 0.6, z);

        // 注册树木为碰撞障碍物
        this.battle3D.obstacles.push({
            x: x,
            z: z,
            radius: leavesSize + 0.3,  // 碰撞半径（树冠大小 + 余量）
            type: 'tree'
        });
    }

    // ===== 创建岩石 =====
    const rockMaterial = new BABYLON.StandardMaterial("rockMaterial", scene);
    rockMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.55);
    rockMaterial.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
    rockMaterial.specularPower = 8;

    const rockCount = 25 + Math.floor(Math.random() * 15);  // 25-40块
    for (let i = 0; i < rockCount; i++) {
        let x, z;
        do {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.round(SKY_SIZE * 0.03) + Math.random() * (maxDist - Math.round(SKY_SIZE * 0.03));
            x = Math.cos(angle) * dist;
            z = Math.sin(angle) * dist;
        } while (Math.sqrt(x * x + z * z) < 4);

        const rockSize = SIZES.ROCK_SIZE_MIN + Math.random() * (SIZES.ROCK_SIZE_MAX - SIZES.ROCK_SIZE_MIN);
        const rock = BABYLON.MeshBuilder.CreateBox("rock" + i, {
            width: rockSize,
            height: rockSize * 0.6,
            depth: rockSize * 0.8
        }, scene);
        rock.material = rockMaterial;
        rock.position.set(x, this.battle3D.GROUND_Y + rockSize * 0.3, z);
        rock.rotation.y = Math.random() * Math.PI * 2;
        rock.rotation.x = (Math.random() - 0.5) * 0.3;
        rock.rotation.z = (Math.random() - 0.5) * 0.3;

        // 注册岩石为碰撞障碍物
        this.battle3D.obstacles.push({
            x: x,
            z: z,
            radius: rockSize * 0.6 + 0.2,  // 碰撞半径
            type: 'rock'
        });
    }

    // ===== 创建草丛（非雪地地图）=====
    if (mapType !== 'snow' && mapType !== 'desert') {
        const grassMaterial = new BABYLON.StandardMaterial("grassMaterial", scene);
        grassMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
        grassMaterial.specularColor = new BABYLON.Color3(0.05, 0.1, 0.05);
        grassMaterial.specularPower = 16;

        const grassCount = 40 + Math.floor(Math.random() * 20);  // 40-60丛
        for (let i = 0; i < grassCount; i++) {
            let x, z;
            do {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.round(SKY_SIZE * 0.02) + Math.random() * (maxDist - Math.round(SKY_SIZE * 0.02));
                x = Math.cos(angle) * dist;
                z = Math.sin(angle) * dist;
            } while (Math.sqrt(x * x + z * z) < 3);

            // 创建草丛（用细长的圆柱体）
            const grass = BABYLON.MeshBuilder.CreateCylinder("grass" + i, {
                diameterTop: 0.04,
                diameterBottom: 0.16,
                height: SIZES.GRASS_HEIGHT_MIN + Math.random() * (SIZES.GRASS_HEIGHT_MAX - SIZES.GRASS_HEIGHT_MIN),
                tessellation: 4
            }, scene);
            grass.material = grassMaterial;
            grass.position.set(x, this.battle3D.GROUND_Y + SIZES.GRASS_HEIGHT_MAX / 2, z);
            grass.rotation.x = (Math.random() - 0.5) * 0.4;
            grass.rotation.z = (Math.random() - 0.5) * 0.4;
        }
    }

    // ===== 创建修仙特色装饰 =====
    // 仙石（发光的灵石）
    const spiritStoneMaterial = new BABYLON.StandardMaterial("spiritStoneMaterial", scene);
    spiritStoneMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.8);
    spiritStoneMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.4, 0.7);  // 蓝色发光
    spiritStoneMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
    spiritStoneMaterial.specularPower = 64;

    const spiritStoneCount = 10 + Math.floor(Math.random() * 5);  // 10-15个
    for (let i = 0; i < spiritStoneCount; i++) {
        let x, z;
        do {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.round(SKY_SIZE * 0.04) + Math.random() * (maxDist - Math.round(SKY_SIZE * 0.04));
            x = Math.cos(angle) * dist;
            z = Math.sin(angle) * dist;
        } while (Math.sqrt(x * x + z * z) < 8);

        const stoneSize = SIZES.SPIRIT_STONE_SIZE_MIN + Math.random() * (SIZES.SPIRIT_STONE_SIZE_MAX - SIZES.SPIRIT_STONE_SIZE_MIN);
        const spiritStone = BABYLON.MeshBuilder.CreateBox("spiritStone" + i, {
            width: stoneSize,
            height: stoneSize * 1.2,
            depth: stoneSize * 0.6
        }, scene);
        spiritStone.material = spiritStoneMaterial;
        spiritStone.position.set(x, this.battle3D.GROUND_Y + stoneSize * 0.6, z);
        spiritStone.rotation.y = Math.random() * Math.PI * 2;
    }

    // 灵草（发光的仙草）
    if (mapType !== 'desert') {
        const spiritHerbMaterial = new BABYLON.StandardMaterial("spiritHerbMaterial", scene);
        spiritHerbMaterial.diffuseColor = new BABYLON.Color3(0.5, 1.0, 0.5);
        spiritHerbMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.6, 0.3);  // 绿色发光

        const herbCount = 15 + Math.floor(Math.random() * 5);  // 15-20株
        for (let i = 0; i < herbCount; i++) {
            let x, z;
            do {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.round(SKY_SIZE * 0.03) + Math.random() * (maxDist - Math.round(SKY_SIZE * 0.03));
                x = Math.cos(angle) * dist;
                z = Math.sin(angle) * dist;
            } while (Math.sqrt(x * x + z * z) < 5);

            const herb = BABYLON.MeshBuilder.CreateCylinder("spiritHerb" + i, {
                diameterTop: 0.1,
                diameterBottom: 0.3,
                height: SIZES.HERB_HEIGHT_MIN + Math.random() * (SIZES.HERB_HEIGHT_MAX - SIZES.HERB_HEIGHT_MIN),
                tessellation: 5
            }, scene);
            herb.material = spiritHerbMaterial;
            herb.position.set(x, this.battle3D.GROUND_Y + SIZES.HERB_HEIGHT_MAX / 2, z);
            herb.rotation.x = (Math.random() - 0.5) * 0.3;
            herb.rotation.z = (Math.random() - 0.5) * 0.3;
        }
    }
};

// 创建建筑物（仙侠风格小屋、草庐、石碑等）
EndlessWinterGame.prototype.createBuildings = function() {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;
    const GROUND_Y = this.battle3D.GROUND_Y;
    const SKY_SIZE = this.battle3D.SKY_SIZE;
    const woodMaterial = new BABYLON.StandardMaterial("buildingWoodMat", scene);
    woodMaterial.diffuseColor = new BABYLON.Color3(0.55, 0.35, 0.15);
    woodMaterial.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);

    // 屋顶材质
    const roofMaterial = new BABYLON.StandardMaterial("roofMat", scene);
    roofMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.12);

    // 草庐材质
    const thatchMaterial = new BABYLON.StandardMaterial("thatchMat", scene);
    thatchMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.45, 0.2);

    // 石材材质
    const stoneMaterial = new BABYLON.StandardMaterial("buildingStoneMat", scene);
    stoneMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.48, 0.45);

    // 门材质
    const doorMaterial = new BABYLON.StandardMaterial("doorMat", scene);
    doorMaterial.diffuseColor = new BABYLON.Color3(0.25, 0.15, 0.05);

    // ===== 创建小屋（3-5个）=====
    const houseCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < houseCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.round(SKY_SIZE * 0.10) + Math.random() * Math.round(SKY_SIZE * 0.26);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const rotation = Math.random() * Math.PI * 2;

        const houseGroup = new BABYLON.TransformNode("house_" + i, scene);
        houseGroup.position.set(x, GROUND_Y, z);
        houseGroup.rotation.y = rotation;

        // 墙壁
        const wallW = SIZES.HOUSE_WIDTH_MIN + Math.random() * (SIZES.HOUSE_WIDTH_MAX - SIZES.HOUSE_WIDTH_MIN);
        const wallH = SIZES.HOUSE_HEIGHT_MIN + Math.random() * (SIZES.HOUSE_HEIGHT_MAX - SIZES.HOUSE_HEIGHT_MIN);
        const wallD = SIZES.HOUSE_WIDTH_MIN * 0.8 + Math.random() * SIZES.HOUSE_WIDTH_MAX * 0.4;
        const wall = BABYLON.MeshBuilder.CreateBox("houseWall_" + i, {
            width: wallW, height: wallH, depth: wallD
        }, scene);
        wall.parent = houseGroup;
        wall.position.y = wallH / 2;
        wall.material = woodMaterial;

        // 屋顶（用锥形圆柱）
        const roof = BABYLON.MeshBuilder.CreateCylinder("houseRoof_" + i, {
            diameterTop: 0,
            diameterBottom: Math.max(wallW, wallD) * 1.4,
            height: SIZES.HOUSE_ROOF_HEIGHT,
            tessellation: 4
        }, scene);
        roof.parent = houseGroup;
        roof.position.y = wallH + SIZES.HOUSE_ROOF_HEIGHT / 2;
        roof.rotation.y = Math.PI / 4;
        roof.material = roofMaterial;

        // 门
        const door = BABYLON.MeshBuilder.CreateBox("houseDoor_" + i, {
            width: SIZES.DOOR_WIDTH, height: SIZES.DOOR_HEIGHT, depth: 0.1
        }, scene);
        door.parent = houseGroup;
        door.position.set(0, SIZES.DOOR_HEIGHT / 2, wallD / 2 + 0.05);
        door.material = doorMaterial;

        // 注册为障碍物
        this.battle3D.obstacles.push({
            x: x, z: z,
            radius: Math.max(wallW, wallD) / 2 + 0.5,
            type: 'building'
        });
    }

    // ===== 创建草庐（2-3个）=====
    const hutCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < hutCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.round(SKY_SIZE * 0.16) + Math.random() * Math.round(SKY_SIZE * 0.20);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;

        const hutGroup = new BABYLON.TransformNode("hut_" + i, scene);
        hutGroup.position.set(x, GROUND_Y, z);

        // 圆形墙壁
        const hutWall = BABYLON.MeshBuilder.CreateCylinder("hutWall_" + i, {
            diameter: SIZES.HUT_DIAMETER,
            height: SIZES.HUT_HEIGHT,
            tessellation: 12
        }, scene);
        hutWall.parent = hutGroup;
        hutWall.position.y = SIZES.HUT_HEIGHT / 2;
        hutWall.material = thatchMaterial;

        // 圆锥屋顶
        const hutRoof = BABYLON.MeshBuilder.CreateCylinder("hutRoof_" + i, {
            diameterTop: 0.2,
            diameterBottom: SIZES.HUT_DIAMETER + 1.4,
            height: SIZES.HUT_ROOF_HEIGHT,
            tessellation: 12
        }, scene);
        hutRoof.parent = hutGroup;
        hutRoof.position.y = SIZES.HUT_HEIGHT + SIZES.HUT_ROOF_HEIGHT / 2;
        hutRoof.material = thatchMaterial;

        // 门
        const hutDoor = BABYLON.MeshBuilder.CreateBox("hutDoor_" + i, {
            width: SIZES.DOOR_WIDTH * 0.8, height: SIZES.DOOR_HEIGHT * 0.85, depth: 0.1
        }, scene);
        hutDoor.parent = hutGroup;
        hutDoor.position.set(0, SIZES.DOOR_HEIGHT * 0.85 / 2, SIZES.HUT_DIAMETER / 2 + 0.05);
        hutDoor.material = doorMaterial;

        this.battle3D.obstacles.push({
            x: x, z: z,
            radius: SIZES.HUT_DIAMETER / 2 + 0.5,
            type: 'building'
        });
    }

    // ===== 创建石碑/祭坛（3-4个）=====
    const steleCount = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < steleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.round(SKY_SIZE * 0.06) + Math.random() * Math.round(SKY_SIZE * 0.30);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;

        const steleHeight = SIZES.STELE_HEIGHT_MIN + Math.random() * (SIZES.STELE_HEIGHT_MAX - SIZES.STELE_HEIGHT_MIN);

        // 石碑主体
        const stele = BABYLON.MeshBuilder.CreateBox("stele_" + i, {
            width: SIZES.STELE_WIDTH,
            height: steleHeight,
            depth: SIZES.STELE_WIDTH * 0.4
        }, scene);
        stele.position.set(x, GROUND_Y + steleHeight / 2, z);
        stele.rotation.y = Math.random() * Math.PI * 2;
        stele.material = stoneMaterial;

        // 底座
        const base = BABYLON.MeshBuilder.CreateBox("steleBase_" + i, {
            width: SIZES.STELE_WIDTH * 1.3,
            height: SIZES.STELE_WIDTH * 0.4,
            depth: SIZES.STELE_WIDTH * 0.65
        }, scene);
        base.position.set(x, GROUND_Y + SIZES.STELE_WIDTH * 0.2, z);
        base.rotation.y = stele.rotation.y;
        base.material = stoneMaterial;

        // 石碑不需要碰撞（可以走近看）
    }

    console.log('建筑物创建完成');
};

// 创建玩家3D模型（探险场景）




