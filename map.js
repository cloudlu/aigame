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
    }

    // 更新敌人装备掉率信息
    const enemyDropRatesElement = document.getElementById('enemy-drop-rates');
    if (this.gameState.enemy?.name) {
        // 基础掉率
        let dropRates = {
            white: 0.3,
            green: 0.25,
            blue: 0.2,
            cyan: 0.1,
            purple: 0.08,
            pink: 0.04,
            gold: 0.02,
            legendary: 0.01
        };
        
        // 根据怪物类型调整掉率
        if (this.gameState.enemy.isBoss) {
            // BOSS掉率调整
            dropRates = {
                white: 0.1,
                green: 0.15,
                blue: 0.2,
                cyan: 0.15,
                purple: 0.15,
                pink: 0.1,
                gold: 0.1,
                legendary: 0.05
            };
        } else if (this.gameState.enemy.isElite) {
            // 精英怪掉率调整
            dropRates = {
                white: 0.2,
                green: 0.2,
                blue: 0.2,
                cyan: 0.15,
                purple: 0.1,
                pink: 0.08,
                gold: 0.05,
                legendary: 0.02
            };
        }
        
        // 考虑幸运值影响（每点幸运值提高0.5%的高品质装备掉率）
        const luck = this.gameState.player.luck || 0;
        const luckBonus = luck * 0.005;
        
        // 调整掉率，提高高品质装备的概率
        const adjustedRates = {
            white: Math.max(0, dropRates.white - luckBonus * 3),
            green: Math.max(0, dropRates.green - luckBonus * 2),
            blue: Math.max(0, dropRates.blue - luckBonus),
            cyan: Math.max(0, dropRates.cyan),
            purple: Math.max(0, dropRates.purple + luckBonus * 0.5),
            pink: Math.max(0, dropRates.pink + luckBonus * 1),
            gold: Math.max(0, dropRates.gold + luckBonus * 1.5),
            legendary: Math.max(0, dropRates.legendary + luckBonus * 2)
        };
        
        // 归一化概率
        const totalProbability = Object.values(adjustedRates).reduce((sum, rate) => sum + rate, 0);
        const normalizedRates = {};
        for (const [rarity, rate] of Object.entries(adjustedRates)) {
            normalizedRates[rarity] = rate / totalProbability;
        }
        
        // 生成掉率显示元素
        enemyDropRatesElement.innerHTML = '';
        
        // 品质颜色映射
        const rarityColors = {
            white: 'bg-white/10',
            green: 'bg-green-500/20',
            blue: 'bg-blue-500/20',
            cyan: 'bg-cyan-500/20',
            purple: 'bg-purple-500/20',
            pink: 'bg-pink-500/20',
            gold: 'bg-yellow-500/20',
            legendary: 'bg-red-500/20'
        };
        
        // 品质名称映射
        const rarityNames = {
            white: '白色',
            green: '绿色',
            blue: '蓝色',
            cyan: '青色',
            purple: '紫色',
            pink: '粉色',
            gold: '金色',
            legendary: '传说'
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

// 清空敌人信息并隐藏攻击按钮
EndlessWinterGame.prototype.clearEnemyInfo = function() {
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

    if (enemyName) enemyName.textContent = '';
    if (enemyLevel) enemyLevel.textContent = '';
    if (enemyHp) enemyHp.textContent = '';
    if (enemyMaxHp) enemyMaxHp.textContent = '';
    if (enemyAttack) enemyAttack.textContent = '';
    if (enemyDefense) enemyDefense.textContent = '';
    if (enemySpeed) enemySpeed.textContent = '';
    if (enemyLuck) enemyLuck.textContent = '';
    if (enemyEliteBadge) enemyEliteBadge.classList.add('hidden');
    
    if (enemyEliteBadge) {
        enemyEliteBadge.classList.add('hidden');
    }
    
    const enemyIconElement = document.querySelector('#enemy-icon i');
    enemyIconElement.className = 'fa fa-question text-xl text-gray-500';

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

    // 创建引擎和场景
    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new BABYLON.Scene(engine);

    // 探险场景背景设置
    if (this.gameState.mapBackgrounds.length > 0 && this.gameState.currentBackgroundIndex !== undefined) {
        const currentBackground = this.gameState.mapBackgrounds[this.gameState.currentBackgroundIndex];
        const toHexColor = (color) => {
            if (typeof color === 'number') {
                return '#' + color.toString(16).padStart(6, '0');
            }
            return color;
        };

        scene.clearColor = new BABYLON.Color4.FromHexString(toHexColor(currentBackground.skyColor), 1);
        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogColor = new BABYLON.Color3.FromHexString(toHexColor(currentBackground.fogColor));
        scene.fogStart = currentBackground.fogNear;
        scene.fogEnd = currentBackground.fogFar;
    } else {
        scene.clearColor = new BABYLON.Color4(0.537, 0.808, 0.922, 1);
        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogColor = new BABYLON.Color3(0.537, 0.808, 0.922);
        scene.fogStart = 10;
        scene.fogEnd = 50;
    }

    // 创建相机（观察相机 - 适合跟随玩家）
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, new BABYLON.Vector3(0, -1, 0), scene);
    camera.attachControl(canvas, true);
    camera.minZ = 0.1;
    camera.maxZ = 1000;
    camera.fov = 0.7; // 增大视场角，获得更广阔的视野
    
    // 限制相机位置
    camera.upperRadiusLimit = 20;
    camera.lowerRadiusLimit = 6;
    
    // 限制相机旋转角度
    camera.upperBetaLimit = Math.PI / 2.2; // 限制向上看的角度
    camera.lowerBetaLimit = Math.PI / 4; // 限制向下看的角度，增加俯视角
    
    // 设置相机控制方式
    camera.useAutoRotationBehavior = false; // 禁用自动旋转
    camera.wheelPrecision = 100; // 鼠标滚轮灵敏度
    camera.panningSensibility = 100; // 平移灵敏度
    camera.angularSensibilityX = 800; // 水平旋转灵敏度
    camera.angularSensibilityY = 800; // 垂直旋转灵敏度

    // 添加灯光
    const hemisphericLight = new BABYLON.HemisphericLight("hemisphericLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 0.6;

    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.intensity = 0.8;
    dirLight.position = new BABYLON.Vector3(20, 40, 20);

    // 添加地面
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20, subdivisions: 4 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.85, 0.9);
    groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    groundMaterial.specularPower = 64;
    ground.material = groundMaterial;
    ground.position.y = -1.5;
    ground.isPickable = true;

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
        enemies: []
    };
    console.log('初始化 battle3D 对象成功');
    
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
        this.battle3D.player.position.y = -0.4;
        this.battle3D.player.position.z = 0;
    }
    this.createTrees();
    this.createPreGeneratedEnemies();
    this.createSnowSystem();
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

    this.gameState.sceneMonsters = [];
    const totalCells = 25;
    const enemyDistribution = this.createEnemyDistribution(totalCells);
    const playerCell = 12;
    let enemyIndex = 0;

    for (let i = 0; i < totalCells; i++) {
        const gridCell = document.createElement('div');
        gridCell.className = 'bg-dark/30 rounded flex items-center justify-center';
        gridCell.dataset.cellIndex = i;

        const row = Math.floor(i / 5);
        const col = i % 5;
        const x = (col - 2) * 4;
        const z = (row - 2) * 4;

        if (i !== playerCell && enemyIndex < enemyDistribution.length) {
            const enemyInfo = this.createEnemy(enemyDistribution, enemyIndex, x, z, i);
            enemyIndex++;
            this.gameState.sceneMonsters.push(enemyInfo);
            const enemyIcon = this.createEnemyIcon(enemyInfo);
            gridCell.appendChild(enemyIcon);
        }

        mapGrid.appendChild(gridCell);
    }

    this.updateMapBackground();
};

// 根据格子总数生成敌人分布
EndlessWinterGame.prototype.createEnemyDistribution = function(totalCells) {
    const availableCells = totalCells - 1;
    const totalEnemies = Math.max(10, Math.floor(availableCells * 0.8));
    const bossCount = Math.ceil(totalEnemies * 0.1);
    const eliteCount = Math.ceil(totalEnemies * 0.3);
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

    for (let i = 0; i < 25; i++) {
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
    enemyIcon.className = `w-6 h-6 rounded-full ${enemyBgColor} flex items-center justify-center ${enemyIconColor} cursor-pointer transition-colors`;
    enemyIcon.innerHTML = `<i class="fa fa-skull text-xs ${enemyIconColor}"></i>`;

    enemyIcon.dataset.enemyInfo = JSON.stringify(enemyInfo);
    enemyIcon.setAttribute('data-tooltip', `${enemyInfo.name}\n等级: ${enemyInfo.level}\nHP: ${enemyInfo.hp}/${enemyInfo.maxHp}\n攻击: ${enemyInfo.attack}\n防御: ${enemyInfo.defense}${enemyInfo.isBoss ? '\n能量: 100/100' : ''}`);

    enemyIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        try {
            const info = JSON.parse(enemyIcon.dataset.enemyInfo);
            this.showAttackConfirmation(info);
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

    const baseAttack = enemyLevel * 8;
    const baseDefense = enemyLevel * 2;
    const baseHp = enemyLevel * 30;

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

    const currentBackground = this.gameState.mapBackgrounds && this.gameState.currentBackgroundIndex !== undefined ? 
        this.gameState.mapBackgrounds[this.gameState.currentBackgroundIndex] : null;
    let mapType = currentBackground ? currentBackground.type : null;

    const mapEnemies = this.gameState.mapEnemyMapping && this.gameState.mapEnemyMapping[mapType] ?
        this.gameState.mapEnemyMapping[mapType] :
        (this.gameState.enemyTypes && this.gameState.enemyTypes.length > 0) ?
            this.gameState.enemyTypes.map(enemy => enemy.name) :
            ['雪原狼'];

    const randomEnemyName = mapEnemies[Math.floor(Math.random() * mapEnemies.length)];
    let selectedEnemyType = this.gameState.enemyTypes && this.gameState.enemyTypes.length > 0 ?
        this.gameState.enemyTypes.find(enemy => enemy.name === randomEnemyName) : null;

    if (!selectedEnemyType) {
        // 使用默认敌人类型
        selectedEnemyType = {
            name: '雪原狼',
            baseHp: 30,
            baseAttack: 8,
            baseDefense: 2,
            baseSpeed: 5,
            baseLuck: 1,
            expMultiplier: 1,
            resourceMultiplier: 1,
            icon: 'fa-skull',
            image: ''
        };
    }

    const finalAttack = Math.floor(baseAttack * (1 + bonus));
    const finalDefense = Math.floor(baseDefense * (1 + bonus));
    const finalHp = Math.floor(baseHp * (1 + bonus));
    const baseSpeed = enemyLevel * (selectedEnemyType.baseSpeed || 5);
    const baseLuck = enemyLevel * (selectedEnemyType.baseLuck || 1);
    const finalSpeed = Math.floor(baseSpeed * (1 + bonus));
    const finalLuck = Math.floor(baseLuck * (1 + bonus));

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
        position: { x, z },
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
        this.gameState.enemy = null;
        return;
    }

    const playerPos = this.battle3D.player.position;
    let enemyEncountered = false;

    // 遍历所有场景怪物
    for (let i = 0; i < this.gameState.sceneMonsters.length; i++) {
        const monster = this.gameState.sceneMonsters[i];
        const distance = Math.sqrt(
            Math.pow(playerPos.x - monster.position.x, 2) +
            Math.pow(playerPos.z - monster.position.z, 2)
        );

        // 碰撞检测阈值（0.5单位）
        if (distance < 0.5) {
            this.showAttackConfirmation(monster);
            enemyEncountered = true;
            break;
        }
    }

    // 只有当没有通过点击2D地图选择敌人时，才清空敌人信息
    // 检查是否有敌人信息显示（通过检查敌人名称是否为空）
    const enemyName = document.getElementById('enemy-name');
    const hasEnemyInfo = enemyName && enemyName.textContent.trim() !== '';
    
    // 检查是否是通过点击2D地图选择的敌人（通过检查是否有攻击按钮事件）
    const confirmBtn = document.getElementById('confirm-attack-btn');
    const hasAttackHandler = confirmBtn && typeof confirmBtn.onclick === 'function';
    
    console.log('checkSceneMonsterCollision - 状态检查:', {
        enemyEncountered,
        hasEnemyInfo,
        hasAttackHandler,
        enemyName: enemyName ? enemyName.textContent : 'N/A',
        confirmBtn: confirmBtn ? '存在' : '不存在'
    });
    
    // 只有当没有敌人碰撞，且没有敌人信息显示，且没有攻击按钮事件时，才清空敌人信息
    // 这样可以确保点击2D地图选择的敌人信息不会被清空
    if (!enemyEncountered && !hasEnemyInfo && !hasAttackHandler) {
        console.log('清空敌人信息：没有敌人碰撞，且没有敌人信息显示，且没有攻击按钮事件');
        this.gameState.battle.inBattle = false;
        this.clearEnemyInfo();
        this.gameState.enemy = null;
    } else if (!enemyEncountered && hasEnemyInfo && hasAttackHandler) {
        console.log('保留敌人信息：没有敌人碰撞，但有敌人信息显示且有攻击按钮事件（可能是通过点击2D地图选择的敌人）');
    }
};

// 恢复地图场景（从战斗退出时调用）
EndlessWinterGame.prototype.restoreMapScene = function() {
    console.log('恢复地图场景...');
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

// 处理键盘按键（人物移动）
EndlessWinterGame.prototype.handleKeyPress = function(e) {
    console.log('检测到键盘按键:', e.key);
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

    const speed = 0.1;
    const boundary = 9;
    const direction = new BABYLON.Vector3(0, 0, 0);
    let needUpdate = false;

    switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
            direction.z += speed;
            needUpdate = true;
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            direction.z -= speed;
            needUpdate = true;
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            direction.x -= speed;
            needUpdate = true;
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            direction.x += speed;
            needUpdate = true;
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

    if (needUpdate && direction.length() > 0) {
        e.preventDefault();

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

        // 更新玩家位置
        this.battle3D.player.position = newPos;

        // 摄像机跟随玩家
        const target = this.battle3D.player.position.clone();
        this.battle3D.camera.setTarget(target);
    }
};

// 处理鼠标点击（鼠标引导移动）
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

    // 获取点击位置的世界坐标
    const pickResult = this.battle3D.scene.pick(this.battle3D.scene.pointerX, this.battle3D.scene.pointerY);

    if (pickResult.hit && pickResult.pickedPoint) {
        const targetPos = pickResult.pickedPoint.clone();
        const playerPos = this.battle3D.player.position;
        // 限制目标位置在地图范围内
        const boundary = 9;
        targetPos.x = Math.max(-boundary, Math.min(boundary, targetPos.x));
        targetPos.z = Math.max(-boundary, Math.min(boundary, targetPos.z));

        // 计算移动距离
        const distance = BABYLON.Vector3.Distance(playerPos, new BABYLON.Vector3(targetPos.x, playerPos.y, targetPos.z));

        // 如果距离大于0.1，开始平滑移动
        if (distance > 0.1) {
            // 移动速度
            const moveSpeed = 2.0; // 单位/秒
            // 计算移动时间
            const moveTime = distance / moveSpeed;

            // 创建动画
            const animation = new BABYLON.Animation(
                "moveAnimation",
                "position",
                60, // 帧率
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            // 动画关键帧
            const keyframes = [
                { frame: 0, value: playerPos.clone() },
                { frame: moveTime * 60, value: new BABYLON.Vector3(targetPos.x, playerPos.y, targetPos.z) }
            ];

            animation.setKeys(keyframes);

            // 应用动画
            this.battle3D.player.animations = [];
            this.battle3D.player.animations.push(animation);

            // 开始动画
            this.battle3D.scene.beginAnimation(this.battle3D.player, 0, moveTime * 60, false, 1);

            // 摄像机跟随玩家
            const followCamera = () => {
                if (this.battle3D && this.battle3D.player && this.battle3D.camera) {
                    this.battle3D.camera.setTarget(this.battle3D.player.position);
                }
            };

            // 每帧更新摄像机位置
            const animationInterval = setInterval(followCamera, 16); // 约60fps

            // 设置移动状态
            this.isMoving = true;
            
            // 动画结束后清理
            setTimeout(() => {
                clearInterval(animationInterval);
                this.isMoving = false;
            }, moveTime * 1000);
        } else {
            // 距离太近，直接设置位置
            const newPlayerPos = new BABYLON.Vector3(targetPos.x, playerPos.y, targetPos.z);
            this.battle3D.player.position = newPlayerPos;
            this.battle3D.camera.setTarget(newPlayerPos);
        }
    }
};

// 更新地图背景
EndlessWinterGame.prototype.updateMapBackground = function() {
    const currentBackground = this.gameState.mapBackgrounds[this.gameState.currentBackgroundIndex];
    if (currentBackground && this.battle3D && this.battle3D.scene) {
        const toHexColor = (color) => {
            if (typeof color === 'number') {
                return '#' + color.toString(16).padStart(6, '0');
            }
            return color;
        };

        this.battle3D.scene.clearColor = new BABYLON.Color4.FromHexString(toHexColor(currentBackground.skyColor), 1);
        this.battle3D.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        this.battle3D.scene.fogColor = new BABYLON.Color3.FromHexString(toHexColor(currentBackground.fogColor));
        this.battle3D.scene.fogStart = currentBackground.fogNear;
        this.battle3D.scene.fogEnd = currentBackground.fogFar;
    }
};

// ==================== 探险动画循环 ====================

// 探险场景动画循环
EndlessWinterGame.prototype.animateMap3D = function() {
    if (!this.battle3D) return;

    const player = this.battle3D.player;
    const camera = this.battle3D.camera;

    if (player && camera) {
        // 更新玩家位置（走动动画效果）
        if (this.isMoving) {
            const time = Date.now() * 0.005;
            player.position.y = -0.4 + Math.sin(time) * 0.1;
        } else {
            player.position.y = -0.4;
        }

        // 边界限制（防止玩家走出地图）
        const boundary = 9;
        player.position.x = Math.max(-boundary, Math.min(boundary, player.position.x));
        player.position.z = Math.max(-boundary, Math.min(boundary, player.position.z));

        // 对于 ArcRotateCamera，只需要更新目标点
        camera.setTarget(new BABYLON.Vector3(player.position.x, player.position.y, player.position.z));
    }

    // 更新敌人动画
    this.battle3D.enemies.forEach(enemy => {
        if (enemy.model && enemy.active) {
            enemy.model.rotation.y += 0.01;
        }
    });

    // 更新血条显示
    this.updateHealthBars();
};

// 淡入战斗场景（为战斗场景单独准备）
EndlessWinterGame.prototype.fadeInBattleScene = function() {
    // 这个函数应该移到 battle3d.js
    console.warn('fadeInBattleScene 应该在 battle3d.js 中实现');
};

// ==================== 探险3D元素创建 ====================

// 创建雪花粒子系统
EndlessWinterGame.prototype.createSnowSystem = function() {
    if (!this.battle3D || !this.battle3D.scene) return;

    // 创建雪花粒子系统
    const snowSystem = new BABYLON.ParticleSystem("snowSystem", 200, this.battle3D.scene);

    // 设置粒子纹理（使用默认纹理）
    snowSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.battle3D.scene);

    // 设置粒子发射位置
    snowSystem.emitter = new BABYLON.Vector3(0, 5, 0);
    snowSystem.minEmitBox = new BABYLON.Vector3(-5, 0, -5);
    snowSystem.maxEmitBox = new BABYLON.Vector3(5, 0, 5);

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

// 创建敌人组（简单的敌人模型）
EndlessWinterGame.prototype.createEnemyGroup = function(enemyInfo) {
    if (!this.battle3D || !this.battle3D.scene) return;

    // 根据敌人名称设置颜色
    let color;
    const enemyTypeName = String(enemyInfo.name || '');
    if (enemyTypeName.startsWith('BOSS')) {
        color = new BABYLON.Color3(1, 0, 1); // 紫色
    } else if (enemyTypeName.startsWith('精英') || enemyTypeName === '精英') {
        color = new BABYLON.Color3(1, 1, 0); // 黄色
    } else {
        // 默认颜色
        color = new BABYLON.Color3(0.439, 0.502, 0.565); // 灰色
    }

    // 创建材质
    const material = new BABYLON.StandardMaterial("enemyMaterial", this.battle3D.scene);
    material.diffuseColor = color;
    material.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
    material.specularPower = 50;

    // 创建球体敌人模型
    const enemyMesh = BABYLON.MeshBuilder.CreateSphere("enemy", {
        diameter: 0.8, // 默认敌人直径
        tessellation: 16 // 默认细分度
    }, this.battle3D.scene);

    enemyMesh.material = material;

    // 设置敌人位置
    enemyMesh.position.x = enemyInfo.position.x;
    enemyMesh.position.z = enemyInfo.position.z;
    enemyMesh.position.y = -1.5 + 0.4; // 地面高度 + 敌人半径

    return enemyMesh;
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

            // 创建敌人血条
            const enemyHealthBar = this.createHealthBar(0xff0000); // 默认红色血条
            enemyHealthBar.scaling.x = 0.5; // 默认缩放（与玩家血条宽度一致）
            enemyHealthBar.scaling.y = 1.0; // 默认缩放（与玩家血条高度一致）
            enemyHealthBar.scaling.z = 0.5; // 默认缩放
            enemyHealthBar.position.x = 0;
            enemyHealthBar.position.y = 1.0; // 默认血条位置
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
        }
    } else {
        // 如果没有场景怪物数据，生成默认敌人
        const enemyDistribution = this.createEnemyDistribution(25);
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

            // 创建敌人血条
            const enemyHealthBar = this.createHealthBar(0xff0000); // 默认红色血条
            enemyHealthBar.scaling.x = 0.5; // 默认缩放（与玩家血条宽度一致）
            enemyHealthBar.scaling.y = 1.0; // 默认缩放（与玩家血条高度一致）
            enemyHealthBar.scaling.z = 0.5; // 默认缩放
            enemyHealthBar.position.x = 0;
            enemyHealthBar.position.y = 1.0; // 默认血条位置
            enemyHealthBar.position.z = 0;
            enemyHealthBar.parent = enemyGroup;
            enemyHealthBar.isVisible = false;

            this.battle3D.enemies.push({
                model: enemyGroup,
                info: enemyInfo,
                active: true,
                healthBar: enemyHealthBar
            });
        }
    }
};

// 创建树木（探险场景）
EndlessWinterGame.prototype.createTrees = function() {
    if (!this.battle3D || !this.battle3D.scene) return;

    // 树干材质
    const trunkMaterial = new BABYLON.StandardMaterial("trunkMaterial", this.battle3D.scene);
    trunkMaterial.diffuseColor = new BABYLON.Color3(0.545, 0.271, 0.075);
    trunkMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
    trunkMaterial.specularPower = 10;

    // 树叶材质
    const leavesMaterial = new BABYLON.StandardMaterial("leavesMaterial", this.battle3D.scene);
    leavesMaterial.diffuseColor = new BABYLON.Color3(0.133, 0.545, 0.133);
    leavesMaterial.specularColor = new BABYLON.Color3(0.067, 0.067, 0.067);
    leavesMaterial.specularPower = 20;

    // 创建几棵树，放在远处
    for (let i = 0; i < 3; i++) {
        let x, z;
        do {
            x = (Math.random() - 0.5) * 12;
            z = (Math.random() - 0.5) * 12;
        } while (Math.abs(x) < 3 && Math.abs(z) < 3);

        const trunkHeight = 1 + Math.random() * 0.5;
        const trunkRadius = 0.15 + Math.random() * 0.05;
        const leavesSize = 0.8 + Math.random() * 0.3;

        // 创建树干
        const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", {
            diameter: trunkRadius * 2,
            height: trunkHeight,
            tessellation: 8
        }, this.battle3D.scene);
        trunk.material = trunkMaterial;
        trunk.position.set(x, -1.5 + trunkHeight / 2, z);

        // 创建树叶
        const leaves = BABYLON.MeshBuilder.CreateSphere("leaves", {
            diameter: leavesSize * 2,
            segments: 8
        }, this.battle3D.scene);
        leaves.material = leavesMaterial;
        leaves.position.set(x, -1.5 + trunkHeight + leavesSize / 2, z);
    }
};

// 创建玩家3D模型（探险场景）




