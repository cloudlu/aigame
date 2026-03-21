// 敌人模型模块 (enemy-models.js)
// 包含所有敌人3D模型的创建逻辑
// 根据敌人名称自动识别动物类别，创建对应外形
// 敌人类型缩放：普通=1倍，精英=2倍，Boss=3倍

// 根据敌人名称识别动物类别
EndlessCultivationGame.prototype.getEnemyCategory = function(enemyName) {
    const categories = [
        { category: 'QUAD', keywords: ['狼', '熊', '豹', '狮', '牛', '鹿', '兽', '狐'] },
        { category: 'SERPENT', keywords: ['蛇', '蜥', '虫', '蠕虫', '蚯蚓'] },
        { category: 'BIRD', keywords: ['雕', '鹰', '鹤', '凤凰', '蝙蝠', '秃鹫', '鸟'] },
        { category: 'AQUA', keywords: ['鱼', '蟹', '虾', '龟', '蛟', '鲛', '海马', '贝壳'] },
        { category: 'PLANT', keywords: ['树精', '花妖', '藤', '仙人掌'] },
        { category: 'GOLEM', keywords: ['石精', '岩怪', '石怪', '巨人'] },
        { category: 'GHOST', keywords: ['幽灵', '暗影', '风魔', '火灵', '雷兽', '云兽', '沙暴', '仙鹤'] },
        { category: 'HUMANOID', keywords: ['妖', '魔', '精', '怪', '仙', '将', '王', '人', '魈', '领主'] },
    ];
    for (const entry of categories) {
        if (entry.keywords.some(kw => enemyName.includes(kw))) {
            return entry.category;
        }
    }
    return 'HUMANOID'; // 默认人形
};

// 根据类别和类型缩放创建敌人组（探险场景）
EndlessCultivationGame.prototype.createEnemyGroup = function(enemyInfo) {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;
    const GROUND_Y = this.battle3D.GROUND_Y;
    const enemyName = String(enemyInfo.name || '');
    const isBoss = enemyName.startsWith('BOSS') || enemyInfo.isBoss;
    const isElite = enemyName.startsWith('精英') || enemyInfo.isElite;

    // 确定缩放倍率
    const scale = isBoss ? SIZES.ENEMY_SCALE_BOSS : (isElite ? SIZES.ENEMY_SCALE_ELITE : SIZES.ENEMY_SCALE_NORMAL);

    // 识别动物类别
    const category = this.getEnemyCategory(enemyName);

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
    let bodyColor = { r: 0.45, g: 0.5, b: 0.55 }; // 默认灰蓝色
    for (const entry of colorMap) {
        if (entry.keywords.some(kw => enemyName.includes(kw))) {
            bodyColor = entry;
            break;
        }
    }

    // Boss/精英覆盖颜色
    let color;
    if (isBoss) {
        color = new BABYLON.Color3(0.8, 0.2, 0.8);  // 紫红色
    } else if (isElite) {
        color = new BABYLON.Color3(0.9, 0.75, 0.1);  // 金色
    } else {
        color = new BABYLON.Color3(bodyColor.r, bodyColor.g, bodyColor.b);
    }

    const material = new BABYLON.StandardMaterial("enemyMaterial_" + Date.now(), scene);
    material.diffuseColor = color;
    material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    material.specularPower = 32;
    if (isBoss) {
        material.emissiveColor = new BABYLON.Color3(0.2, 0.05, 0.2); // Boss发光
    } else if (isElite) {
        material.emissiveColor = new BABYLON.Color3(0.15, 0.12, 0.02);
    }

    const enemyGroup = new BABYLON.TransformNode("enemyGroup", scene);

    // 根据动物类别创建不同外形
    this.buildEnemyByCategory(enemyGroup, category, material, scene);

    // 应用类型缩放
    enemyGroup.scaling.setAll(scale);

    enemyGroup.position.x = enemyInfo.position.x;
    enemyGroup.position.z = enemyInfo.position.z;
    enemyGroup.position.y = (enemyInfo.isFlying && enemyInfo.position.y) ?
        GROUND_Y + enemyInfo.position.y : GROUND_Y;

    return enemyGroup;
};

// 根据动物类别构建敌人外形
EndlessCultivationGame.prototype.buildEnemyByCategory = function(group, category, material, scene) {
    switch (category) {
        case 'QUAD': this.buildQuadEnemy(group, material, scene); break;
        case 'SERPENT': this.buildSerpentEnemy(group, material, scene); break;
        case 'BIRD': this.buildBirdEnemy(group, material, scene); break;
        case 'AQUA': this.buildAquaEnemy(group, material, scene); break;
        case 'PLANT': this.buildPlantEnemy(group, material, scene); break;
        case 'GOLEM': this.buildGolemEnemy(group, material, scene); break;
        case 'GHOST': this.buildGhostEnemy(group, material, scene); break;
        default: this.buildHumanoidEnemy(group, material, scene); break;
    }
};

// 四足兽类（狼、熊、豹、狮、牛、鹿、狐）
EndlessCultivationGame.prototype.buildQuadEnemy = function(group, material, scene) {
    // 身体：横置椭球
    const body = BABYLON.MeshBuilder.CreateSphere("quadBody", {
        diameterX: SIZES.QUAD_BODY_LENGTH,
        diameterY: SIZES.QUAD_BODY_HEIGHT,
        diameterZ: SIZES.QUAD_BODY_WIDTH, segments: 8
    }, scene);
    body.parent = group;
    body.position.y = SIZES.QUAD_LEG_HEIGHT + SIZES.QUAD_BODY_HEIGHT / 2;
    body.material = material;

    // 头部
    const head = BABYLON.MeshBuilder.CreateSphere("quadHead", { diameter: SIZES.QUAD_HEAD_SIZE, segments: 8 }, scene);
    head.parent = group;
    head.position.set(0, SIZES.QUAD_LEG_HEIGHT + SIZES.QUAD_BODY_HEIGHT * 0.6, SIZES.QUAD_BODY_LENGTH / 2 + SIZES.QUAD_HEAD_SIZE / 3);
    head.material = material;

    // 四条腿
    const legMat = new BABYLON.StandardMaterial("quadLegMat", scene);
    legMat.diffuseColor = material.diffuseColor.clone();
    legMat.diffuseColor.r *= 0.8;
    legMat.diffuseColor.g *= 0.8;
    legMat.diffuseColor.b *= 0.8;
    const legPositions = [
        [-SIZES.QUAD_BODY_WIDTH * 0.35, 0, SIZES.QUAD_BODY_LENGTH * 0.25],
        [SIZES.QUAD_BODY_WIDTH * 0.35, 0, SIZES.QUAD_BODY_LENGTH * 0.25],
        [-SIZES.QUAD_BODY_WIDTH * 0.35, 0, -SIZES.QUAD_BODY_LENGTH * 0.25],
        [SIZES.QUAD_BODY_WIDTH * 0.35, 0, -SIZES.QUAD_BODY_LENGTH * 0.25],
    ];
    legPositions.forEach((pos, i) => {
        const leg = BABYLON.MeshBuilder.CreateCylinder("quadLeg" + i, {
            diameter: SIZES.QUAD_LEG_RADIUS * 2, height: SIZES.QUAD_LEG_HEIGHT, tessellation: 6
        }, scene);
        leg.parent = group;
        leg.position.set(pos[0], SIZES.QUAD_LEG_HEIGHT / 2, pos[2]);
        leg.material = legMat;
    });

    // 尾巴
    const tail = BABYLON.MeshBuilder.CreateCylinder("quadTail", {
        diameterTop: 0.02, diameterBottom: SIZES.QUAD_LEG_RADIUS * 1.5, height: SIZES.QUAD_TAIL_LENGTH, tessellation: 6
    }, scene);
    tail.parent = group;
    tail.position.set(0, SIZES.QUAD_LEG_HEIGHT + SIZES.QUAD_BODY_HEIGHT * 0.3, -SIZES.QUAD_BODY_LENGTH / 2 - SIZES.QUAD_TAIL_LENGTH / 2);
    tail.rotation.x = 0.5;
    tail.material = legMat;

    // 眼睛
    const eyeMat = new BABYLON.StandardMaterial("quadEyeMat", scene);
    eyeMat.diffuseColor = new BABYLON.Color3(0.9, 0.15, 0.1);
    eyeMat.emissiveColor = new BABYLON.Color3(0.2, 0.02, 0);
    const eye1 = BABYLON.MeshBuilder.CreateSphere("quadEye1", { diameter: SIZES.QUAD_EYE_SIZE }, scene);
    eye1.parent = group;
    eye1.position.set(-SIZES.QUAD_HEAD_SIZE * 0.25, SIZES.QUAD_LEG_HEIGHT + SIZES.QUAD_BODY_HEIGHT * 0.65, SIZES.QUAD_BODY_LENGTH / 2 + SIZES.QUAD_HEAD_SIZE * 0.4);
    eye1.material = eyeMat;
    const eye2 = BABYLON.MeshBuilder.CreateSphere("quadEye2", { diameter: SIZES.QUAD_EYE_SIZE }, scene);
    eye2.parent = group;
    eye2.position.set(SIZES.QUAD_HEAD_SIZE * 0.25, SIZES.QUAD_LEG_HEIGHT + SIZES.QUAD_BODY_HEIGHT * 0.65, SIZES.QUAD_BODY_LENGTH / 2 + SIZES.QUAD_HEAD_SIZE * 0.4);
    eye2.material = eyeMat;
};

// 蛇虫类（蛇、蜥蜴、虫、蠕虫）
EndlessCultivationGame.prototype.buildSerpentEnemy = function(group, material, scene) {
    // 身体：多节弯曲的球体
    const segments = 6;
    const segLength = SIZES.SERPENT_LENGTH / segments;
    for (let i = 0; i < segments; i++) {
        const radius = i === 0 ? SIZES.SERPENT_HEAD_SIZE / 2 : SIZES.SERPENT_BODY_RADIUS;
        const seg = BABYLON.MeshBuilder.CreateSphere("serpentSeg" + i, {
            diameter: radius * 2, segments: 6
        }, scene);
        seg.parent = group;
        const zPos = SIZES.SERPENT_LENGTH / 2 - i * segLength;
        const yOffset = Math.sin(i * 0.8) * 0.15;
        seg.position.set(0, SIZES.SERPENT_BODY_RADIUS + yOffset, zPos);
        seg.material = material;
    }

    // 头部（更大）
    const head = BABYLON.MeshBuilder.CreateSphere("serpentHead", {
        diameter: SIZES.SERPENT_HEAD_SIZE, segments: 8
    }, scene);
    head.parent = group;
    head.position.set(0, SIZES.SERPENT_BODY_RADIUS + 0.15, SIZES.SERPENT_LENGTH / 2 + SIZES.SERPENT_HEAD_SIZE / 4);
    head.scaling.z = 1.2;
    head.material = material;

    // 眼睛
    const eyeMat = new BABYLON.StandardMaterial("serpentEyeMat", scene);
    eyeMat.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
    eyeMat.emissiveColor = new BABYLON.Color3(0.3, 0.2, 0);
    const eye1 = BABYLON.MeshBuilder.CreateSphere("serpentEye1", { diameter: SIZES.SERPENT_EYE_SIZE }, scene);
    eye1.parent = group;
    eye1.position.set(-SIZES.SERPENT_HEAD_SIZE * 0.25, SIZES.SERPENT_BODY_RADIUS + 0.25, SIZES.SERPENT_LENGTH / 2 + SIZES.SERPENT_HEAD_SIZE * 0.35);
    eye1.material = eyeMat;
    const eye2 = BABYLON.MeshBuilder.CreateSphere("serpentEye2", { diameter: SIZES.SERPENT_EYE_SIZE }, scene);
    eye2.parent = group;
    eye2.position.set(SIZES.SERPENT_HEAD_SIZE * 0.25, SIZES.SERPENT_BODY_RADIUS + 0.25, SIZES.SERPENT_LENGTH / 2 + SIZES.SERPENT_HEAD_SIZE * 0.35);
    eye2.material = eyeMat;
};

// 飞行类（雕、鹰、鹤、凤凰、蝙蝠）
EndlessCultivationGame.prototype.buildBirdEnemy = function(group, material, scene) {
    // 身体
    const body = BABYLON.MeshBuilder.CreateSphere("birdBody", {
        diameterX: SIZES.BIRD_BODY_LENGTH,
        diameterY: SIZES.BIRD_BODY_HEIGHT,
        diameterZ: SIZES.BIRD_BODY_WIDTH, segments: 8
    }, scene);
    body.parent = group;
    body.position.y = SIZES.HUMANOID_LEG_HEIGHT + SIZES.BIRD_BODY_HEIGHT + SIZES.BIRD_BODY_HEIGHT / 2;
    body.material = material;

    // 头部
    const head = BABYLON.MeshBuilder.CreateSphere("birdHead", { diameter: SIZES.BIRD_HEAD_SIZE, segments: 8 }, scene);
    head.parent = group;
    head.position.set(0, body.position.y + SIZES.BIRD_BODY_HEIGHT * 0.3, SIZES.BIRD_BODY_LENGTH / 2 + SIZES.BIRD_HEAD_SIZE / 3);
    head.material = material;

    // 翅膀（左右各一个扁平板）
    const wingMat = new BABYLON.StandardMaterial("birdWingMat", scene);
    wingMat.diffuseColor = material.diffuseColor.clone();
    wingMat.alpha = 0.85;
    const wing1 = BABYLON.MeshBuilder.CreateBox("birdWing1", {
        width: SIZES.BIRD_WING_WIDTH, height: SIZES.BIRD_WING_HEIGHT, depth: SIZES.BIRD_BODY_LENGTH * 0.6
    }, scene);
    wing1.parent = group;
    wing1.position.set(-SIZES.BIRD_WING_WIDTH / 2 - SIZES.BIRD_BODY_WIDTH / 2, body.position.y, 0);
    wing1.material = wingMat;
    const wing2 = BABYLON.MeshBuilder.CreateBox("birdWing2", {
        width: SIZES.BIRD_WING_WIDTH, height: SIZES.BIRD_WING_HEIGHT, depth: SIZES.BIRD_BODY_LENGTH * 0.6
    }, scene);
    wing2.parent = group;
    wing2.position.set(SIZES.BIRD_WING_WIDTH / 2 + SIZES.BIRD_BODY_WIDTH / 2, body.position.y, 0);
    wing2.material = wingMat;

    // 喙
    const beak = BABYLON.MeshBuilder.CreateCylinder("birdBeak", {
        diameterTop: 0, diameterBottom: SIZES.BIRD_BEAK_SIZE, height: SIZES.BIRD_BEAK_SIZE * 2, tessellation: 4
    }, scene);
    beak.parent = group;
    beak.position.set(0, head.position.y - SIZES.BIRD_HEAD_SIZE * 0.15, head.position.z + SIZES.BIRD_HEAD_SIZE / 2 + SIZES.BIRD_BEAK_SIZE);
    beak.rotation.x = Math.PI / 2;
    beak.material = new BABYLON.StandardMaterial("beakMat", scene);
    beak.material.diffuseColor = new BABYLON.Color3(0.9, 0.7, 0.2);

    // 眼睛
    const eyeMat = new BABYLON.StandardMaterial("birdEyeMat", scene);
    eyeMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    const eye1 = BABYLON.MeshBuilder.CreateSphere("birdEye1", { diameter: SIZES.BIRD_EYE_SIZE }, scene);
    eye1.parent = group;
    eye1.position.set(-SIZES.BIRD_HEAD_SIZE * 0.3, head.position.y + SIZES.BIRD_HEAD_SIZE * 0.1, head.position.z + SIZES.BIRD_HEAD_SIZE * 0.3);
    eye1.material = eyeMat;
    const eye2 = BABYLON.MeshBuilder.CreateSphere("birdEye2", { diameter: SIZES.BIRD_EYE_SIZE }, scene);
    eye2.parent = group;
    eye2.position.set(SIZES.BIRD_HEAD_SIZE * 0.3, head.position.y + SIZES.BIRD_HEAD_SIZE * 0.1, head.position.z + SIZES.BIRD_HEAD_SIZE * 0.3);
    eye2.material = eyeMat;
};

// 水生类（鱼、蟹、虾、龟、蛟、鲛人）
EndlessCultivationGame.prototype.buildAquaEnemy = function(group, material, scene) {
    // 身体：鱼形椭球
    const body = BABYLON.MeshBuilder.CreateSphere("aquaBody", {
        diameterX: SIZES.AQUA_BODY_LENGTH,
        diameterY: SIZES.AQUA_BODY_HEIGHT,
        diameterZ: SIZES.AQUA_BODY_WIDTH, segments: 8
    }, scene);
    body.parent = group;
    body.position.y = SIZES.AQUA_BODY_HEIGHT / 2 + 0.1;
    body.material = material;

    // 头部
    const head = BABYLON.MeshBuilder.CreateSphere("aquaHead", { diameter: SIZES.AQUA_HEAD_SIZE, segments: 8 }, scene);
    head.parent = group;
    head.position.set(0, SIZES.AQUA_BODY_HEIGHT * 0.6, SIZES.AQUA_BODY_LENGTH / 2 + SIZES.AQUA_HEAD_SIZE / 4);
    head.material = material;

    // 鳍/爪（左右）
    const finMat = new BABYLON.StandardMaterial("aquaFinMat", scene);
    finMat.diffuseColor = material.diffuseColor.clone();
    finMat.alpha = 0.7;
    const fin1 = BABYLON.MeshBuilder.CreateBox("aquaFin1", {
        width: SIZES.AQUA_FIN_WIDTH, height: 0.04, depth: SIZES.AQUA_BODY_LENGTH * 0.3
    }, scene);
    fin1.parent = group;
    fin1.position.set(-SIZES.AQUA_FIN_WIDTH / 2 - SIZES.AQUA_BODY_WIDTH / 2, SIZES.AQUA_BODY_HEIGHT * 0.4, 0);
    fin1.rotation.z = 0.3;
    fin1.material = finMat;
    const fin2 = BABYLON.MeshBuilder.CreateBox("aquaFin2", {
        width: SIZES.AQUA_FIN_WIDTH, height: 0.04, depth: SIZES.AQUA_BODY_LENGTH * 0.3
    }, scene);
    fin2.parent = group;
    fin2.position.set(SIZES.AQUA_FIN_WIDTH / 2 + SIZES.AQUA_BODY_WIDTH / 2, SIZES.AQUA_BODY_HEIGHT * 0.4, 0);
    fin2.rotation.z = -0.3;
    fin2.material = finMat;

    // 眼睛
    const eyeMat = new BABYLON.StandardMaterial("aquaEyeMat", scene);
    eyeMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.9);
    eyeMat.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.2);
    const eye1 = BABYLON.MeshBuilder.CreateSphere("aquaEye1", { diameter: SIZES.AQUA_EYE_SIZE }, scene);
    eye1.parent = group;
    eye1.position.set(-SIZES.AQUA_HEAD_SIZE * 0.3, SIZES.AQUA_BODY_HEIGHT * 0.6, SIZES.AQUA_BODY_LENGTH / 2 + SIZES.AQUA_HEAD_SIZE * 0.3);
    eye1.material = eyeMat;
    const eye2 = BABYLON.MeshBuilder.CreateSphere("aquaEye2", { diameter: SIZES.AQUA_EYE_SIZE }, scene);
    eye2.parent = group;
    eye2.position.set(SIZES.AQUA_HEAD_SIZE * 0.3, SIZES.AQUA_BODY_HEIGHT * 0.6, SIZES.AQUA_BODY_LENGTH / 2 + SIZES.AQUA_HEAD_SIZE * 0.3);
    eye2.material = eyeMat;
};

// 植物类（树精、花妖、仙人掌）
EndlessCultivationGame.prototype.buildPlantEnemy = function(group, material, scene) {
    // 树干/茎
    const trunk = BABYLON.MeshBuilder.CreateCylinder("plantTrunk", {
        diameterTop: SIZES.PLANT_TRUNK_RADIUS * 1.5,
        diameterBottom: SIZES.PLANT_TRUNK_RADIUS * 2,
        height: SIZES.PLANT_TRUNK_HEIGHT, tessellation: 6
    }, scene);
    trunk.parent = group;
    trunk.position.y = SIZES.PLANT_TRUNK_HEIGHT / 2;
    trunk.material = material;

    // 树冠/花冠
    const crown = BABYLON.MeshBuilder.CreateSphere("plantCrown", {
        diameter: SIZES.PLANT_CROWN_SIZE * 2, segments: 8
    }, scene);
    crown.parent = group;
    crown.position.y = SIZES.PLANT_TRUNK_HEIGHT + SIZES.PLANT_CROWN_SIZE * 0.6;
    crown.material = material;

    // 眼睛（在树干上）
    const eyeMat = new BABYLON.StandardMaterial("plantEyeMat", scene);
    eyeMat.diffuseColor = new BABYLON.Color3(1, 0.9, 0.2);
    eyeMat.emissiveColor = new BABYLON.Color3(0.3, 0.25, 0);
    const eye1 = BABYLON.MeshBuilder.CreateSphere("plantEye1", { diameter: SIZES.PLANT_EYE_SIZE }, scene);
    eye1.parent = group;
    eye1.position.set(-SIZES.PLANT_TRUNK_RADIUS * 0.6, SIZES.PLANT_TRUNK_HEIGHT * 0.55, SIZES.PLANT_TRUNK_RADIUS * 0.9);
    eye1.material = eyeMat;
    const eye2 = BABYLON.MeshBuilder.CreateSphere("plantEye2", { diameter: SIZES.PLANT_EYE_SIZE }, scene);
    eye2.parent = group;
    eye2.position.set(SIZES.PLANT_TRUNK_RADIUS * 0.6, SIZES.PLANT_TRUNK_HEIGHT * 0.55, SIZES.PLANT_TRUNK_RADIUS * 0.9);
    eye2.material = eyeMat;
};

// 岩石/巨人类（石精、岩怪、巨人）
EndlessCultivationGame.prototype.buildGolemEnemy = function(group, material, scene) {
    // 身体：大方块
    const body = BABYLON.MeshBuilder.CreateBox("golemBody", {
        width: SIZES.GOLEM_BODY_WIDTH, height: SIZES.GOLEM_BODY_HEIGHT, depth: SIZES.GOLEM_BODY_WIDTH * 0.8
    }, scene);
    body.parent = group;
    body.position.y = SIZES.GOLEM_LEG_HEIGHT + SIZES.GOLEM_BODY_HEIGHT / 2;
    body.material = material;

    // 头部
    const head = BABYLON.MeshBuilder.CreateBox("golemHead", {
        width: SIZES.GOLEM_HEAD_SIZE, height: SIZES.GOLEM_HEAD_SIZE, depth: SIZES.GOLEM_HEAD_SIZE
    }, scene);
    head.parent = group;
    head.position.y = SIZES.GOLEM_LEG_HEIGHT + SIZES.GOLEM_BODY_HEIGHT + SIZES.GOLEM_HEAD_SIZE / 2;
    head.material = material;

    // 手臂
    const armMat = new BABYLON.StandardMaterial("golemArmMat", scene);
    armMat.diffuseColor = material.diffuseColor.clone();
    armMat.diffuseColor.r *= 0.85;
    const arm1 = BABYLON.MeshBuilder.CreateCylinder("golemArm1", {
        diameter: SIZES.GOLEM_ARM_RADIUS * 2, height: SIZES.GOLEM_ARM_LENGTH, tessellation: 6
    }, scene);
    arm1.parent = group;
    arm1.position.set(-SIZES.GOLEM_BODY_WIDTH / 2 - SIZES.GOLEM_ARM_RADIUS, SIZES.GOLEM_LEG_HEIGHT + SIZES.GOLEM_BODY_HEIGHT * 0.6, 0);
    arm1.rotation.z = 0.3;
    arm1.material = armMat;
    const arm2 = BABYLON.MeshBuilder.CreateCylinder("golemArm2", {
        diameter: SIZES.GOLEM_ARM_RADIUS * 2, height: SIZES.GOLEM_ARM_LENGTH, tessellation: 6
    }, scene);
    arm2.parent = group;
    arm2.position.set(SIZES.GOLEM_BODY_WIDTH / 2 + SIZES.GOLEM_ARM_RADIUS, SIZES.GOLEM_LEG_HEIGHT + SIZES.GOLEM_BODY_HEIGHT * 0.6, 0);
    arm2.rotation.z = -0.3;
    arm2.material = armMat;

    // 腿
    const legMat = new BABYLON.StandardMaterial("golemLegMat", scene);
    legMat.diffuseColor = material.diffuseColor.clone();
    legMat.diffuseColor.r *= 0.75;
    const leg1 = BABYLON.MeshBuilder.CreateCylinder("golemLeg1", {
        diameter: SIZES.GOLEM_LEG_RADIUS * 2, height: SIZES.GOLEM_LEG_HEIGHT, tessellation: 6
    }, scene);
    leg1.parent = group;
    leg1.position.set(-SIZES.GOLEM_BODY_WIDTH * 0.25, SIZES.GOLEM_LEG_HEIGHT / 2, 0);
    leg1.material = legMat;
    const leg2 = BABYLON.MeshBuilder.CreateCylinder("golemLeg2", {
        diameter: SIZES.GOLEM_LEG_RADIUS * 2, height: SIZES.GOLEM_LEG_HEIGHT, tessellation: 6
    }, scene);
    leg2.parent = group;
    leg2.position.set(SIZES.GOLEM_BODY_WIDTH * 0.25, SIZES.GOLEM_LEG_HEIGHT / 2, 0);
    leg2.material = legMat;

    // 眼睛
    const eyeMat = new BABYLON.StandardMaterial("golemEyeMat", scene);
    eyeMat.diffuseColor = new BABYLON.Color3(1, 0.4, 0.1);
    eyeMat.emissiveColor = new BABYLON.Color3(0.4, 0.1, 0);
    const eye1 = BABYLON.MeshBuilder.CreateSphere("golemEye1", { diameter: SIZES.GOLEM_EYE_SIZE }, scene);
    eye1.parent = group;
    eye1.position.set(-SIZES.GOLEM_HEAD_SIZE * 0.2, SIZES.GOLEM_LEG_HEIGHT + SIZES.GOLEM_BODY_HEIGHT + SIZES.GOLEM_HEAD_SIZE * 0.55, SIZES.GOLEM_HEAD_SIZE * 0.45);
    eye1.material = eyeMat;
    const eye2 = BABYLON.MeshBuilder.CreateSphere("golemEye2", { diameter: SIZES.GOLEM_EYE_SIZE }, scene);
    eye2.parent = group;
    eye2.position.set(SIZES.GOLEM_HEAD_SIZE * 0.2, SIZES.GOLEM_LEG_HEIGHT + SIZES.GOLEM_BODY_HEIGHT + SIZES.GOLEM_HEAD_SIZE * 0.55, SIZES.GOLEM_HEAD_SIZE * 0.45);
    eye2.material = eyeMat;
};

// 幽灵/元素类（幽灵、暗影、风魔、火灵、雷兽、云兽）
EndlessCultivationGame.prototype.buildGhostEnemy = function(group, material, scene) {
    // 幽灵体：上方球形 + 下方锥形尾迹
    const body = BABYLON.MeshBuilder.CreateSphere("ghostBody", {
        diameter: SIZES.GHOST_BODY_SIZE, segments: 8
    }, scene);
    body.parent = group;
    body.position.y = SIZES.GHOST_BODY_SIZE + SIZES.GHOST_TAIL_LENGTH * 0.3;
    body.material = material;

    // 下飘尾迹
    const tail = this.createConeMesh("ghostTail", {
        diameter: SIZES.GHOST_BODY_SIZE * 0.9,
        height: SIZES.GHOST_TAIL_LENGTH,
        tessellation: 8
    }, scene);
    tail.parent = group;
    tail.position.y = SIZES.GHOST_TAIL_LENGTH / 2;
    tail.material = material;

    // 半透明效果
    material.alpha = 0.75;

    // 眼睛
    const eyeMat = new BABYLON.StandardMaterial("ghostEyeMat", scene);
    eyeMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    eyeMat.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    const eye1 = BABYLON.MeshBuilder.CreateSphere("ghostEye1", { diameter: SIZES.GHOST_EYE_SIZE }, scene);
    eye1.parent = group;
    eye1.position.set(-SIZES.GHOST_BODY_SIZE * 0.2, SIZES.GHOST_BODY_SIZE + SIZES.GHOST_TAIL_LENGTH * 0.3, SIZES.GHOST_BODY_SIZE * 0.4);
    eye1.material = eyeMat;
    const eye2 = BABYLON.MeshBuilder.CreateSphere("ghostEye2", { diameter: SIZES.GHOST_EYE_SIZE }, scene);
    eye2.parent = group;
    eye2.position.set(SIZES.GHOST_BODY_SIZE * 0.2, SIZES.GHOST_BODY_SIZE + SIZES.GHOST_TAIL_LENGTH * 0.3, SIZES.GHOST_BODY_SIZE * 0.4);
    eye2.material = eyeMat;
};

// 人形类（妖、魔、精、怪、仙、将、王）
EndlessCultivationGame.prototype.buildHumanoidEnemy = function(group, material, scene) {
    // 身体
    const body = BABYLON.MeshBuilder.CreateCylinder("humanoidBody", {
        diameterTop: SIZES.HUMANOID_BODY_WIDTH * 0.8,
        diameterBottom: SIZES.HUMANOID_BODY_WIDTH,
        height: SIZES.HUMANOID_BODY_HEIGHT, tessellation: 8
    }, scene);
    body.parent = group;
    body.position.y = SIZES.HUMANOID_LEG_HEIGHT + SIZES.HUMANOID_BODY_HEIGHT / 2;
    body.material = material;

    // 头部
    const head = BABYLON.MeshBuilder.CreateSphere("humanoidHead", { diameter: SIZES.HUMANOID_HEAD_SIZE, segments: 8 }, scene);
    head.parent = group;
    head.position.y = SIZES.HUMANOID_LEG_HEIGHT + SIZES.HUMANOID_BODY_HEIGHT + SIZES.HUMANOID_HEAD_SIZE / 2;
    head.material = material;

    // 手臂
    const armMat = new BABYLON.StandardMaterial("humanoidArmMat", scene);
    armMat.diffuseColor = material.diffuseColor.clone();
    const arm1 = BABYLON.MeshBuilder.CreateCylinder("humanoidArm1", {
        diameter: SIZES.HUMANOID_ARM_RADIUS * 2, height: SIZES.HUMANOID_ARM_LENGTH, tessellation: 6
    }, scene);
    arm1.parent = group;
    arm1.position.set(-SIZES.HUMANOID_BODY_WIDTH / 2 - SIZES.HUMANOID_ARM_RADIUS, SIZES.HUMANOID_LEG_HEIGHT + SIZES.HUMANOID_BODY_HEIGHT * 0.7, 0);
    arm1.rotation.z = 0.15;
    arm1.material = armMat;
    const arm2 = BABYLON.MeshBuilder.CreateCylinder("humanoidArm2", {
        diameter: SIZES.HUMANOID_ARM_RADIUS * 2, height: SIZES.HUMANOID_ARM_LENGTH, tessellation: 6
    }, scene);
    arm2.parent = group;
    arm2.position.set(SIZES.HUMANOID_BODY_WIDTH / 2 + SIZES.HUMANOID_ARM_RADIUS, SIZES.HUMANOID_LEG_HEIGHT + SIZES.HUMANOID_BODY_HEIGHT * 0.7, 0);
    arm2.rotation.z = -0.15;
    arm2.material = armMat;

    // 腿
    const legMat = new BABYLON.StandardMaterial("humanoidLegMat", scene);
    legMat.diffuseColor = material.diffuseColor.clone();
    legMat.diffuseColor.r *= 0.8;
    legMat.diffuseColor.g *= 0.8;
    legMat.diffuseColor.b *= 0.8;
    const leg1 = BABYLON.MeshBuilder.CreateCylinder("humanoidLeg1", {
        diameter: SIZES.HUMANOID_LEG_RADIUS * 2, height: SIZES.HUMANOID_LEG_HEIGHT, tessellation: 6
    }, scene);
    leg1.parent = group;
    leg1.position.set(-SIZES.HUMANOID_BODY_WIDTH * 0.2, SIZES.HUMANOID_LEG_HEIGHT / 2, 0);
    leg1.material = legMat;
    const leg2 = BABYLON.MeshBuilder.CreateCylinder("humanoidLeg2", {
        diameter: SIZES.HUMANOID_LEG_RADIUS * 2, height: SIZES.HUMANOID_LEG_HEIGHT, tessellation: 6
    }, scene);
    leg2.parent = group;
    leg2.position.set(SIZES.HUMANOID_BODY_WIDTH * 0.2, SIZES.HUMANOID_LEG_HEIGHT / 2, 0);
    leg2.material = legMat;

    // 眼睛
    const eyeMat = new BABYLON.StandardMaterial("humanoidEyeMat", scene);
    eyeMat.diffuseColor = new BABYLON.Color3(0.9, 0.15, 0.1);
    eyeMat.emissiveColor = new BABYLON.Color3(0.2, 0.02, 0);
    const eye1 = BABYLON.MeshBuilder.CreateSphere("humanoidEye1", { diameter: SIZES.HUMANOID_EYE_SIZE }, scene);
    eye1.parent = group;
    eye1.position.set(-SIZES.HUMANOID_HEAD_SIZE * 0.25, SIZES.HUMANOID_LEG_HEIGHT + SIZES.HUMANOID_BODY_HEIGHT + SIZES.HUMANOID_HEAD_SIZE * 0.55, SIZES.HUMANOID_HEAD_SIZE * 0.4);
    eye1.material = eyeMat;
    const eye2 = BABYLON.MeshBuilder.CreateSphere("humanoidEye2", { diameter: SIZES.HUMANOID_EYE_SIZE }, scene);
    eye2.parent = group;
    eye2.position.set(SIZES.HUMANOID_HEAD_SIZE * 0.25, SIZES.HUMANOID_LEG_HEIGHT + SIZES.HUMANOID_BODY_HEIGHT + SIZES.HUMANOID_HEAD_SIZE * 0.55, SIZES.HUMANOID_HEAD_SIZE * 0.4);
    eye2.material = eyeMat;
};
