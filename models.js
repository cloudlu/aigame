// 模型模块 (models.js)
// 包含所有3D模型的创建逻辑，供探险和战斗场景共享

// 创建玩家3D模型
EndlessWinterGame.prototype.createPlayerModel = function() {
    if (!this.battle3D || !this.battle3D.scene) return;

    // 创建玩家身体
    const player = BABYLON.MeshBuilder.CreateCylinder("player", { diameterTop: 0.8, diameterBottom: 1, height: 0.8, tessellation: 8 }, this.battle3D.scene);
    const playerMaterial = new BABYLON.StandardMaterial("playerMaterial", this.battle3D.scene);
    playerMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.8);
    playerMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    playerMaterial.specularPower = 100;
    player.material = playerMaterial;

    // 创建玩家头部
    const playerHead = BABYLON.MeshBuilder.CreateSphere("playerHead", { diameter: 0.6 }, this.battle3D.scene);
    const playerHeadMaterial = new BABYLON.StandardMaterial("playerHeadMaterial", this.battle3D.scene);
    playerHeadMaterial.diffuseColor = new BABYLON.Color3(1, 0.8, 0.7);
    playerHeadMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    playerHeadMaterial.specularPower = 100;
    playerHead.material = playerHeadMaterial;
    playerHead.position.y = 0.5;
    playerHead.parent = player;

    // 创建玩家头盔
    const helmet = BABYLON.MeshBuilder.CreateCylinder("helmet", { diameterTop: 0.5, diameterBottom: 0.6, height: 0.3, tessellation: 8 }, this.battle3D.scene);
    const helmetMaterial = new BABYLON.StandardMaterial("helmetMaterial", this.battle3D.scene);
    helmetMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    helmetMaterial.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);
    helmetMaterial.specularPower = 200;
    helmet.material = helmetMaterial;
    helmet.position.y = 0.8;
    helmet.parent = player;

    // 创建玩家眼睛
    const playerEyeMaterial = new BABYLON.StandardMaterial("playerEyeMaterial", this.battle3D.scene);
    playerEyeMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);

    const leftEye = BABYLON.MeshBuilder.CreateSphere("leftEye", { diameter: 0.1 }, this.battle3D.scene);
    leftEye.material = playerEyeMaterial;
    leftEye.position.x = -0.1;
    leftEye.position.y = 0.6;
    leftEye.position.z = 0.3;
    leftEye.parent = player;

    const rightEye = BABYLON.MeshBuilder.CreateSphere("rightEye", { diameter: 0.1 }, this.battle3D.scene);
    rightEye.material = playerEyeMaterial;
    rightEye.position.x = 0.1;
    rightEye.position.y = 0.6;
    rightEye.position.z = 0.3;
    rightEye.parent = player;

    // 创建玩家嘴巴
    const playerMouth = BABYLON.MeshBuilder.CreateCylinder("playerMouth", { diameter: 0.1, height: 0.02, tessellation: 8 }, this.battle3D.scene);
    const playerMouthMaterial = new BABYLON.StandardMaterial("playerMouthMaterial", this.battle3D.scene);
    playerMouthMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    playerMouth.material = playerMouthMaterial;
    playerMouth.position.y = 0.4;
    playerMouth.position.z = 0.3;
    playerMouth.parent = player;

    // 创建玩家手臂
    const armMaterial = new BABYLON.StandardMaterial("armMaterial", this.battle3D.scene);
    armMaterial.diffuseColor = new BABYLON.Color3(1, 0.8, 0.7);
    armMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    armMaterial.specularPower = 100;

    // 左臂
    const leftArm = BABYLON.MeshBuilder.CreateCylinder("leftArm", { diameter: 0.2, height: 0.6, tessellation: 6 }, this.battle3D.scene);
    leftArm.material = armMaterial;
    leftArm.position.x = -0.5;
    leftArm.position.y = 0.1;
    leftArm.position.z = 0;
    leftArm.rotation.z = Math.PI / 4;
    leftArm.parent = player;

    // 右臂
    const rightArm = BABYLON.MeshBuilder.CreateCylinder("rightArm", { diameter: 0.2, height: 0.6, tessellation: 6 }, this.battle3D.scene);
    rightArm.material = armMaterial;
    rightArm.position.x = 0.5;
    rightArm.position.y = 0.1;
    rightArm.position.z = 0;
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.parent = player;

    // 创建玩家手
    const handMaterial = new BABYLON.StandardMaterial("handMaterial", this.battle3D.scene);
    handMaterial.diffuseColor = new BABYLON.Color3(1, 0.8, 0.7);
    handMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    handMaterial.specularPower = 100;

    // 左手 - 调整位置，使其连接到左臂末端
    const leftHand = BABYLON.MeshBuilder.CreateSphere("leftHand", { diameter: 0.15 }, this.battle3D.scene);
    leftHand.material = handMaterial;
    leftHand.position.x = -0.8;
    leftHand.position.y = 0.35;
    leftHand.position.z = 0;
    leftHand.parent = player;

    // 右手 - 调整位置，使其连接到右臂末端
    const rightHand = BABYLON.MeshBuilder.CreateSphere("rightHand", { diameter: 0.15 }, this.battle3D.scene);
    rightHand.material = handMaterial;
    rightHand.position.x = 0.8;
    rightHand.position.y = 0.35;
    rightHand.position.z = 0.;
    rightHand.parent = player;

    // 创建玩家腿部
    const legMaterial = new BABYLON.StandardMaterial("legMaterial", this.battle3D.scene);
    legMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.8);
    legMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    legMaterial.specularPower = 100;

    // 左腿
    const leftLeg = BABYLON.MeshBuilder.CreateCylinder("leftLeg", { diameter: 0.25, height: 0.6, tessellation: 6 }, this.battle3D.scene);
    leftLeg.material = legMaterial;
    leftLeg.position.x = -0.2;
    leftLeg.position.y = -0.7;
    leftLeg.position.z = 0;
    leftLeg.parent = player;

    // 右腿
    const rightLeg = BABYLON.MeshBuilder.CreateCylinder("rightLeg", { diameter: 0.25, height: 0.6, tessellation: 6 }, this.battle3D.scene);
    rightLeg.material = legMaterial;
    rightLeg.position.x = 0.2;
    rightLeg.position.y = -0.7;
    rightLeg.position.z = 0;
    rightLeg.parent = player;

    // 创建玩家脚
    const footMaterial = new BABYLON.StandardMaterial("footMaterial", this.battle3D.scene);
    footMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    footMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    footMaterial.specularPower = 100;

    // 左脚
    const leftFoot = BABYLON.MeshBuilder.CreateCylinder("leftFoot", { diameter: 0.3, height: 0.1, tessellation: 6 }, this.battle3D.scene);
    leftFoot.material = footMaterial;
    leftFoot.position.x = -0.2;
    leftFoot.position.y = -1.05;
    leftFoot.position.z = 0;
    leftFoot.rotation.x = Math.PI / 2;
    leftFoot.parent = player;

    // 右脚
    const rightFoot = BABYLON.MeshBuilder.CreateCylinder("rightFoot", { diameter: 0.3, height: 0.1, tessellation: 6 }, this.battle3D.scene);
    rightFoot.material = footMaterial;
    rightFoot.position.x = 0.2;
    rightFoot.position.y = -1.05;
    rightFoot.position.z = 0;
    rightFoot.rotation.x = Math.PI / 2;
    rightFoot.parent = player;

    // 存储玩家模型
    this.battle3D.player = player;
};

// 创建敌人3D模型
EndlessWinterGame.prototype.createEnemyModel = function() {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;
    const enemy = this.gameState.enemy;
    const enemyName = enemy ? String(enemy.name || '') : '';
    const isBoss = enemyName.startsWith('BOSS') || (enemy && enemy.isBoss);
    const isElite = enemyName.startsWith('精英') || (enemy && enemy.isElite);

    // 确定缩放倍率
    const scale = isBoss ? SIZES.ENEMY_SCALE_BOSS : (isElite ? SIZES.ENEMY_SCALE_ELITE : SIZES.ENEMY_SCALE_NORMAL);

    // 识别动物类别
    const category = this.getEnemyCategory ? this.getEnemyCategory(enemyName) : 'HUMANOID';

    // 根据敌人名称关键词匹配颜色
    const colorMap = [
        { keywords: ['狼', '豹', '狮'], r: 0.5, g: 0.5, b: 0.55 },
        { keywords: ['熊', '牛'], r: 0.45, g: 0.28, b: 0.15 },
        { keywords: ['蛇', '蜥', '虫', '蠕'], r: 0.25, g: 0.6, b: 0.2 },
        { keywords: ['火', '熔岩', '凤凰'], r: 0.9, g: 0.3, b: 0.1 },
        { keywords: ['冰', '雪', '霜'], r: 0.6, g: 0.82, b: 0.95 },
        { keywords: ['龙', '麒麟'], r: 0.35, g: 0.15, b: 0.55 },
        { keywords: ['树', '花', '藤', '木'], r: 0.2, g: 0.5, b: 0.15 },
        { keywords: ['水', '蛟', '鲛', '鱼', '蟹', '虾', '龟'], r: 0.15, g: 0.4, b: 0.7 },
        { keywords: ['沙', '沙漠'], r: 0.85, g: 0.75, b: 0.55 },
        { keywords: ['石', '岩', '山'], r: 0.55, g: 0.52, b: 0.48 },
        { keywords: ['蝙蝠', '幽灵', '暗影', '洞'], r: 0.3, g: 0.2, b: 0.4 },
        { keywords: ['仙', '天', '云', '鹤'], r: 0.9, g: 0.85, b: 0.95 },
        { keywords: ['妖', '精', '怪', '魔'], r: 0.6, g: 0.2, b: 0.3 },
    ];
    let bodyColor = { r: 0.8, g: 0.2, b: 0.2 };
    for (const entry of colorMap) {
        if (entry.keywords.some(kw => enemyName.includes(kw))) {
            bodyColor = entry;
            break;
        }
    }

    let color;
    if (isBoss) {
        color = new BABYLON.Color3(0.8, 0.2, 0.8);
    } else if (isElite) {
        color = new BABYLON.Color3(0.9, 0.75, 0.1);
    } else {
        color = new BABYLON.Color3(bodyColor.r, bodyColor.g, bodyColor.b);
    }

    const material = new BABYLON.StandardMaterial("enemyBattleMaterial_" + Date.now(), scene);
    material.diffuseColor = color;
    material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material.specularPower = 32;
    if (isBoss) {
        material.emissiveColor = new BABYLON.Color3(0.2, 0.05, 0.2);
    } else if (isElite) {
        material.emissiveColor = new BABYLON.Color3(0.15, 0.12, 0.02);
    }

    const enemyGroup = new BABYLON.TransformNode("enemyBattleGroup", scene);

    // 根据动物类别构建外形
    this.buildEnemyByCategory(enemyGroup, category, material, scene);

    // Boss额外添加角
    if (isBoss) {
        const hornMat = new BABYLON.StandardMaterial("battleHornMat", scene);
        hornMat.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.3);
        const horn1 = BABYLON.MeshBuilder.CreateCylinder("battleHorn1", { diameterTop: 0.1, diameterBottom: 0.3, height: 0.8, tessellation: 6 }, scene);
        horn1.parent = enemyGroup;
        horn1.position.set(-0.4, 2.2, 0);
        horn1.rotation.z = -0.3;
        horn1.material = hornMat;
        const horn2 = BABYLON.MeshBuilder.CreateCylinder("battleHorn2", { diameterTop: 0.1, diameterBottom: 0.3, height: 0.8, tessellation: 6 }, scene);
        horn2.parent = enemyGroup;
        horn2.position.set(0.4, 2.2, 0);
        horn2.rotation.z = 0.3;
        horn2.material = hornMat;
    }

    // 应用类型缩放
    enemyGroup.scaling.setAll(scale);

    // 设置位置（右侧）
    enemyGroup.position.x = 2;
    // 飞行类敌人（鸟、幽灵）稍微浮空，其他敌人站在地面上
    const isFlying = category === 'BIRD' || category === 'GHOST';
    enemyGroup.position.y = isFlying ? -0.7 : -1;
    enemyGroup.position.z = 0;

    // 存储敌人模型和是否飞行标记
    this.battle3D.enemy = enemyGroup;
    this.battle3D.enemyIsFlying = isFlying;
};

// 创建血条
EndlessWinterGame.prototype.createHealthBars = function() {
    // 确保battle3D存在
    if (!this.battle3D) {
        console.error('createHealthBars: battle3D不存在');
        return;
    }
    
    // 创建玩家血条（红色）
    const playerHealthBar = this.createHealthBar(0xff0000); // 红色血条
    playerHealthBar.position.x = 0;
    playerHealthBar.position.y = 1.1; // 默认血条位置
    playerHealthBar.position.z = 0;
    playerHealthBar.isVisible = true; // 确保血条可见
    if (this.battle3D.player) {
        playerHealthBar.parent = this.battle3D.player;
    }
    this.battle3D.playerHealthBar = playerHealthBar;

    // 创建玩家灵力条（蓝色）
    const playerEnergyBar = this.createHealthBar(0x0000ff); // 蓝色灵力条
    playerEnergyBar.position.x = 0;
    playerEnergyBar.position.y = 0.95; // 默认灵力条位置，更贴近血条
    playerEnergyBar.position.z = 0;
    playerEnergyBar.isVisible = true; // 确保灵力条可见
    if (this.battle3D.player) {
        playerEnergyBar.parent = this.battle3D.player;
    }
    this.battle3D.playerEnergyBar = playerEnergyBar;

    // 创建敌人血条（红色）
    if (this.battle3D.enemy) {
        // 根据敌人类型获取缩放倍率（用于反缩放血条）
        const enemy = this.gameState.enemy;
        const isBoss = enemy && (enemy.name.startsWith('BOSS') || enemy.isBoss);
        const isElite = enemy && (enemy.name.startsWith('精英') || enemy.isElite);
        const scale = isBoss ? SIZES.ENEMY_SCALE_BOSS : (isElite ? SIZES.ENEMY_SCALE_ELITE : SIZES.ENEMY_SCALE_NORMAL);

        // 根据敌人类别确定血条高度
        const baseName = enemy && (enemy.baseName || enemy.name.replace(/^(BOSS|精英)/, ''));
        const category = this.getEnemyCategory ? this.getEnemyCategory(baseName || '') : 'HUMANOID';
        const healthBarY = SIZES.getHealthBarY(category);

        // 血条反缩放，保持视觉大小一致
        const enemyHealthBar = this.createHealthBar(0xff0000);
        enemyHealthBar.scaling.x = 0.5 / scale;
        enemyHealthBar.scaling.y = 1.0 / scale;
        enemyHealthBar.scaling.z = 0.5 / scale;
        enemyHealthBar.position.x = 0;
        enemyHealthBar.position.y = healthBarY;
        enemyHealthBar.position.z = 0;
        enemyHealthBar.isVisible = true;
        enemyHealthBar.parent = this.battle3D.enemy;
        this.battle3D.enemyHealthBar = enemyHealthBar;

        // 创建敌人灵力条（蓝色，Boss专用）
        if (this.gameState.enemy && (this.gameState.enemy.isBoss || this.gameState.enemy.energy > 0)) {
            const enemyEnergyBar = this.createHealthBar(0x0000ff);
            enemyEnergyBar.scaling.x = 0.5 / scale;
            enemyEnergyBar.scaling.y = 1.0 / scale;
            enemyEnergyBar.scaling.z = 0.5 / scale;
            enemyEnergyBar.position.x = 0;
            enemyEnergyBar.position.y = healthBarY - 0.15; // 略低于血条
            enemyEnergyBar.position.z = 0;
            enemyEnergyBar.isVisible = true;
            enemyEnergyBar.parent = this.battle3D.enemy;
            this.battle3D.enemyEnergyBar = enemyEnergyBar;
        }
    }

    this.updateHealthBars();
    
};

// 创建单个血条（简单的2D平面血条）
EndlessWinterGame.prototype.createHealthBar = function(color = 0xff0000) {
    if (!this.battle3D || !this.battle3D.scene) {
        console.error('createHealthBar: battle3D或scene不存在');
        return;
    }

    // 创建血条填充（没有背景）
    const fill = BABYLON.MeshBuilder.CreatePlane("healthBarFill", { width: 1.0, height: 0.15 }, this.battle3D.scene);
    const fillMaterial = new BABYLON.StandardMaterial("healthBarFillMaterial", this.battle3D.scene);
    
    // 直接使用Color3构造函数设置颜色
    if (color === 0xff0000) {
        // 红色血条
        fillMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        fillMaterial.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
    } else if (color === 0x0000ff) {
        // 蓝色灵力条
        fillMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);
        fillMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0.5);
    } else {
        // 其他颜色
        const hexColor = '#' + color.toString(16).padStart(6, '0');
        console.log('createHealthBar: 颜色转换', color, '->', hexColor);
        fillMaterial.diffuseColor = BABYLON.Color3.FromHexString(hexColor);
        fillMaterial.emissiveColor = BABYLON.Color3.FromHexString(hexColor);
    }
    
    fillMaterial.alpha = 1.0;
    fill.material = fillMaterial;
    fill.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    fill.renderingGroupId = 1; // 使用渲染组1，确保血条在场景物体之上
    fill.isPickable = false;
    fill.isVisible = true;
    
    // 设置锚点在左边，这样缩放时会从右边开始减少
    fill.setPivotPoint(new BABYLON.Vector3(-0.5, 0, 0));

    // 存储填充部分用于后续更新
    fill.fill = fill; // 自己作为填充部分

    return fill;
};

// 更新血条显示
EndlessWinterGame.prototype.updateHealthBars = function() {
    if (!this.battle3D) {
        return;
    }
    // 更新玩家血条
    if (this.battle3D.playerHealthBar) {
        const playerHealthPercent = Math.max(0, this.gameState.player.hp / this.gameState.player.maxHp);
        this.battle3D.playerHealthBar.scaling.x = playerHealthPercent;
        this.battle3D.playerHealthBar.position.x = 0; // 固定位置，从左边开始减少
    }

    // 更新玩家灵力条
    if (this.battle3D.playerEnergyBar) {
        const playerEnergyPercent = Math.max(0, this.gameState.player.energy / this.gameState.player.maxEnergy);
        this.battle3D.playerEnergyBar.scaling.x = playerEnergyPercent;
        this.battle3D.playerEnergyBar.position.x = 0; // 固定位置，从左边开始减少
    }

    // 更新所有敌人血条（探险场景）
    if (this.battle3D.enemies && this.battle3D.enemies.length > 0) {
        this.battle3D.enemies.forEach(enemy => {
            if (enemy.healthBar && enemy.info) {
                const enemyHealthPercent = Math.max(0, enemy.info.hp / enemy.info.maxHp);
                // 获取敌人缩放倍率，保持血条反缩放
                const eScale = String(enemy.info.name || '').startsWith('BOSS') ? SIZES.ENEMY_SCALE_BOSS :
                              (String(enemy.info.name || '').startsWith('精英') ? SIZES.ENEMY_SCALE_ELITE : SIZES.ENEMY_SCALE_NORMAL);
                enemy.healthBar.scaling.x = enemyHealthPercent / eScale;
                enemy.healthBar.position.x = 0;
            }
        });
    }

    // 更新当前选中敌人的血条（战斗场景）
    if (this.gameState.enemy && this.gameState.enemy.name) {
        // 获取战斗场景敌人缩放倍率
        const bScale = String(this.gameState.enemy.name).startsWith('BOSS') ? SIZES.ENEMY_SCALE_BOSS :
                      (String(this.gameState.enemy.name).startsWith('精英') ? SIZES.ENEMY_SCALE_ELITE : SIZES.ENEMY_SCALE_NORMAL);

        if (this.battle3D.enemyHealthBar) {
            const enemyHealthPercent = Math.max(0, this.gameState.enemy.hp / this.gameState.enemy.maxHp);
            this.battle3D.enemyHealthBar.scaling.x = enemyHealthPercent / bScale;
            this.battle3D.enemyHealthBar.position.x = 0;
        }

        if (this.battle3D.enemyEnergyBar) {
            const enemyEnergyPercent = Math.max(0, this.gameState.enemy.energy / (this.gameState.enemy.maxEnergy || 100));
            this.battle3D.enemyEnergyBar.scaling.x = enemyEnergyPercent / bScale;
            this.battle3D.enemyEnergyBar.position.x = 0;
        }
    }
};