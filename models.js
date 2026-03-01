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

    // 创建敌人身体
    const enemy = BABYLON.MeshBuilder.CreateCylinder("enemy", { diameterTop: 0.8, diameterBottom: 1, height: 0.8, tessellation: 8 }, this.battle3D.scene);
    const enemyMaterial = new BABYLON.StandardMaterial("enemyMaterial", this.battle3D.scene);
    enemyMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
    enemyMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    enemyMaterial.specularPower = 100;
    enemy.material = enemyMaterial;

    // 创建敌人头部
    const enemyHead = BABYLON.MeshBuilder.CreateSphere("enemyHead", { diameter: 0.6 }, this.battle3D.scene);
    const enemyHeadMaterial = new BABYLON.StandardMaterial("enemyHeadMaterial", this.battle3D.scene);
    enemyHeadMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.3, 0.3);
    enemyHeadMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    enemyHeadMaterial.specularPower = 100;
    enemyHead.material = enemyHeadMaterial;
    enemyHead.position.y = 0.5;
    enemyHead.parent = enemy;

    // 创建敌人眼睛
    const enemyEyeMaterial = new BABYLON.StandardMaterial("enemyEyeMaterial", this.battle3D.scene);
    enemyEyeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

    const leftEye = BABYLON.MeshBuilder.CreateSphere("leftEye", { diameter: 0.1 }, this.battle3D.scene);
    leftEye.material = enemyEyeMaterial;
    leftEye.position.x = -0.1;
    leftEye.position.y = 0.6;
    leftEye.position.z = 0.3;
    leftEye.parent = enemy;

    const rightEye = BABYLON.MeshBuilder.CreateSphere("rightEye", { diameter: 0.1 }, this.battle3D.scene);
    rightEye.material = enemyEyeMaterial;
    rightEye.position.x = 0.1;
    rightEye.position.y = 0.6;
    rightEye.position.z = 0.3;
    rightEye.parent = enemy;

    // 创建敌人嘴巴
    const enemyMouth = BABYLON.MeshBuilder.CreateCylinder("enemyMouth", { diameter: 0.15, height: 0.05, tessellation: 8 }, this.battle3D.scene);
    const enemyMouthMaterial = new BABYLON.StandardMaterial("enemyMouthMaterial", this.battle3D.scene);
    enemyMouthMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    enemyMouth.material = enemyMouthMaterial;
    enemyMouth.position.y = 0.4;
    enemyMouth.position.z = 0.3;
    enemyMouth.parent = enemy;

    // 设置敌人位置（右侧）
    enemy.position.x = 2;
    enemy.position.y = 0;
    enemy.position.z = 0;

    // 存储敌人模型
    this.battle3D.enemy = enemy;
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

    // 创建玩家能量条（蓝色）
    const playerEnergyBar = this.createHealthBar(0x0000ff); // 蓝色能量条
    playerEnergyBar.position.x = 0;
    playerEnergyBar.position.y = 0.95; // 默认能量条位置，更贴近血条
    playerEnergyBar.position.z = 0;
    playerEnergyBar.isVisible = true; // 确保能量条可见
    if (this.battle3D.player) {
        playerEnergyBar.parent = this.battle3D.player;
    }
    this.battle3D.playerEnergyBar = playerEnergyBar;

    // 创建敌人血条（红色）
    if (this.battle3D.enemy) {
        const enemyHealthBar = this.createHealthBar(0xff0000); // 红色血条
        enemyHealthBar.position.x = 0;
        enemyHealthBar.position.y = 1.1; // 默认血条位置
        enemyHealthBar.position.z = 0;
        enemyHealthBar.isVisible = true; // 确保血条可见
        enemyHealthBar.parent = this.battle3D.enemy;
        this.battle3D.enemyHealthBar = enemyHealthBar;

        // 创建敌人能量条（蓝色）
        if (this.gameState.enemy && (this.gameState.enemy.isBoss || this.gameState.enemy.energy > 0)) {
            const enemyEnergyBar = this.createHealthBar(0x0000ff); // 蓝色能量条
            enemyEnergyBar.position.x = 0;
            enemyEnergyBar.position.y = 0.95; // 默认能量条位置，更贴近血条
            enemyEnergyBar.position.z = 0;
            enemyEnergyBar.isVisible = true; // 确保能量条可见
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
        // 蓝色能量条
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

    // 更新玩家能量条
    if (this.battle3D.playerEnergyBar) {
        const playerEnergyPercent = Math.max(0, this.gameState.player.energy / this.gameState.player.maxEnergy);
        this.battle3D.playerEnergyBar.scaling.x = playerEnergyPercent;
        this.battle3D.playerEnergyBar.position.x = 0; // 固定位置，从左边开始减少
    }

    // 更新所有敌人血条
    if (this.battle3D.enemies && this.battle3D.enemies.length > 0) {
        this.battle3D.enemies.forEach(enemy => {
            if (enemy.healthBar && enemy.info) {
                const enemyHealthPercent = Math.max(0, enemy.info.hp / enemy.info.maxHp);
                enemy.healthBar.scaling.x = enemyHealthPercent;
                enemy.healthBar.position.x = 0; // 固定位置，从左边开始减少
            }
        });
    }
    
    // 更新当前选中敌人的血条（如果有）
    if (this.gameState.enemy && this.gameState.enemy.name) {
        // 更新敌人血条
        if (this.battle3D.enemyHealthBar) {
            const enemyHealthPercent = Math.max(0, this.gameState.enemy.hp / this.gameState.enemy.maxHp);
            this.battle3D.enemyHealthBar.scaling.x = enemyHealthPercent;
            this.battle3D.enemyHealthBar.position.x = 0; // 固定位置，从左边开始减少
        }
        
        // 更新敌人能量条
        if (this.battle3D.enemyEnergyBar) {
            const enemyEnergyPercent = Math.max(0, this.gameState.enemy.energy / (this.gameState.enemy.maxEnergy || 100));
            this.battle3D.enemyEnergyBar.scaling.x = enemyEnergyPercent;
            this.battle3D.enemyEnergyBar.position.x = 0; // 固定位置，从左边开始减少
        }
    }
};