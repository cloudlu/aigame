// 地图与战斗3D场景模块 (map3d.js)
// 拆分自 game.js，可在 <script> 标签中跟在 game.js 之后加载

// 为后续创建锥形网格提供辅助方法
EndlessWinterGame.prototype.createConeMesh = function(name, options, scene) {
    // 使用圆柱体模拟锥形，通过设置不同的diameterTop和diameterBottom来实现
    const coneOptions = {
        diameterTop: options.diameter ? options.diameter * 0.2 : 0.2, // 顶部直径较小
        diameterBottom: options.diameter || 1,
        height: options.height || 1,
        tessellation: options.tessellation || 8
    };
    return BABYLON.MeshBuilder.CreateCylinder(name, coneOptions, scene);
};

// 初始化3D地图/战斗场景
EndlessWinterGame.prototype.initMap3DScene = function() {
    const container = document.getElementById('map-3d-container');
    if (!container) return;

    // 清除旧的3D场景
    if (this.battle3D && this.battle3D.engine) {
        try {
            this.battle3D.engine.dispose();
        } catch (e) {
            console.log('清理旧引擎时出错:', e);
        }
    }

    // 无论是否存在 battle3D，都先清空容器，避免出现重复 canvas
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    this.battle3D = null;
    const isBattle = this.gameState.battle.inBattle;

    if (!isBattle) {
        this.gameState.enemy = {
            name: "",
            level: "",
            hp: "",
            maxHp: "",
            attack: "",
            defense: "",
            energy: 0,
            maxEnergy: 0,
            isElite: false,
            isBoss: false,
            bonus: 0,
            icon: "fa-question",
            image: "",
            expMultiplier: 1,
            resourceMultiplier: 1
        };
        this.updateUI();
    }

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';

    const containerRect = container.getBoundingClientRect();
    canvas.width = Math.max(containerRect.width || 1024, 1);
    canvas.height = Math.max(containerRect.height || 500, 1);

    container.appendChild(canvas);

    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new BABYLON.Scene(engine);

    if (isBattle) {
        scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.05, 1);
    } else {
        // 探险场景背景设置
        if (this.gameState.mapBackgrounds.length > 0 && this.gameState.currentBackgroundIndex !== undefined) {
            const currentBackground = this.gameState.mapBackgrounds[this.gameState.currentBackgroundIndex];
            if (currentBackground) {
                // 辅助函数：转换色值为hex字符串
                const toHexColor = (color) => {
                    if (typeof color === 'number') {
                        return '#' + color.toString(16).padStart(6, '0');
                    }
                    return color;
                };
                
                // 设置天空颜色
                scene.clearColor = new BABYLON.Color4.FromHexString(toHexColor(currentBackground.skyColor), 1);
                
                // 设置雾效
                scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
                scene.fogColor = new BABYLON.Color3.FromHexString(toHexColor(currentBackground.fogColor));
                scene.fogStart = currentBackground.fogNear;
                scene.fogEnd = currentBackground.fogFar;
            } else {
                // 默认设置
                scene.clearColor = new BABYLON.Color4(0.537, 0.808, 0.922, 1); // 默认天空的蓝色
                scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
                scene.fogColor = new BABYLON.Color3(0.537, 0.808, 0.922);
                scene.fogStart = 10;
                scene.fogEnd = 50;
            }
        } else {
            // 默认设置
            scene.clearColor = new BABYLON.Color4(0.537, 0.808, 0.922, 1); // 默认天空的蓝色
            scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
            scene.fogColor = new BABYLON.Color3(0.537, 0.808, 0.922);
            scene.fogStart = 10;
            scene.fogEnd = 50;
        }
    }

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, isBattle ? 6 : 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(container, true);

    if (isBattle) {
        camera.setPosition(new BABYLON.Vector3(0, 2, 6));
    } else {
        camera.setPosition(new BABYLON.Vector3(0, 3, 10));
    }

    // 添加灯光系统
    // 1. 环境光（提供基础亮度）
    const hemisphericLight = new BABYLON.HemisphericLight(
        "hemisphericLight",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    hemisphericLight.intensity = 0.6;

    // 2. 方向光（模拟太阳光，产生阴影和高光）
    const dirLight = new BABYLON.DirectionalLight(
        "dirLight",
        new BABYLON.Vector3(-1, -2, -1),
        scene
    );
    dirLight.intensity = 0.8;
    dirLight.position = new BABYLON.Vector3(20, 40, 20);

    // 添加地面
    const ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 20, height: 20, subdivisions: 4 },
        scene
    );
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.85, 0.9); // 雪地颜色
    groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    groundMaterial.specularPower = 64;
    ground.material = groundMaterial;
    // 设置地面高度，使其与其他模型兼容
    ground.position.y = -1.5;

    // 确保地面可交互
    ground.isPickable = true;

    // 设置场景的点击事件 - 调用handleMouseClick函数实现鼠标移动
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
            const pickResult = scene.pick(scene.pointerX, scene.pointerY);

            if (pickResult.hit && pickResult.pickedMesh) {
                console.log('点击了:', pickResult.pickedMesh.name);

                // 调用handleMouseClick处理鼠标点击，实现人物移动
                // 直接使用 canvas，因为它是作为引擎的第一个参数创建的
                this.handleMouseClick(
                    { clientX: scene.pointerX, clientY: scene.pointerY },
                    canvas.parentElement
                );
            }
        }
    });

    // 添加灯光、地面、特效、模型等，原内容照搬
    // 省略以示例为主

    this.battle3D = {
        engine: engine,
        scene: scene,
        camera: camera,
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
        enemies: []
    };

    this.createPlayerModel();
    if (isBattle) {
        this.createEnemyModel();
    } else {
        this.createTrees();
        this.createPreGeneratedEnemies();
        this.createSnowSystem();
    }

    this.createHealthBars();

    engine.runRenderLoop(() => {
        this.animateBattle3D();
        scene.render();
    });

    window.addEventListener('resize', () => {
        if (this.battle3D && this.battle3D.engine) {
            this.battle3D.engine.resize();
        }
    });
};

// 淡入战斗场景
EndlessWinterGame.prototype.fadeInBattleScene = function() {
    if (!this.battle3D) return;
    const container = document.getElementById('battle-modal-3d-container');
    if (!container || !container.firstChild) return;
    const rendererElement = container.firstChild;
    if (!rendererElement || !rendererElement.style) return;
    let opacity = 0;
    const fadeDuration = 1000;
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
};

// 恢复地图场景
EndlessWinterGame.prototype.restoreMapScene = function() {
    // 清理前一个战斗场景（如果存在）以避免额外的3D画面和引擎泄漏
    if (this.battle3D && this.battle3D.engine) {
        try {
            this.battle3D.engine.dispose();
        } catch (e) {
            console.log('restoreMapScene 清理旧引擎失败:', e);
        }
    }
    this.battle3D = null;
    
    // 设置战斗状态为false
    this.gameState.battle.inBattle = false;
    
    // 恢复保存的敌人分布
    if (this.mapState && this.mapState.sceneMonsters) {
        
        // 检查当前敌人是否被击败
        const enemyDefeated = this.gameState.enemy && this.gameState.enemy.hp <= 0;
        
        if (enemyDefeated) {
            // 如果敌人被击败，从保存的场景怪物中移除该敌人
            const currentEnemyCellIndex = this.gameState.enemy.cellIndex;
            if (currentEnemyCellIndex !== undefined) {
                this.mapState.sceneMonsters = this.mapState.sceneMonsters.filter(monster => 
                    monster.cellIndex !== currentEnemyCellIndex
                );
            }
        }
        
        // 恢复场景怪物状态
        this.gameState.sceneMonsters = JSON.parse(JSON.stringify(this.mapState.sceneMonsters));
        
        // 只有当所有敌人都被击败时才重新生成新的敌人分布
        if (this.gameState.sceneMonsters.length === 0) {
            this.generateMiniMap();
        } else {
            // 重新渲染小地图
            this.renderMiniMap();
        }
    } else {
        // 如果没有保存的状态，重新生成小地图
        this.generateMiniMap();
    }
    
    // 重新初始化地图场景
    this.initMap3DScene();
    
    // 隐藏敌人信息区
    this.hideEnemyInfo();
    
    // 恢复玩家位置
    if (this.mapState && this.mapState.playerPosition && this.battle3D && this.battle3D.player) {
        this.battle3D.player.position.copyFrom(this.mapState.playerPosition);
    }
};
