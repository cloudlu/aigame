// 地图相关逻辑模块 (mapLogic.js)
// 包含小地图创建、渲染和敌人分布等功能

// 生成小地图并初始化场景怪物数据
EndlessWinterGame.prototype.generateMiniMap = function() {
    const mapGrid = document.getElementById('map-grid');
    if (!mapGrid) return;
    mapGrid.innerHTML = '';

    // 清空场景怪物数据
    this.gameState.sceneMonsters = [];
    const totalCells = 25;
    const enemyDistribution = this.createEnemyDistribution(totalCells);
    const playerCell = 12;
    let enemyIndex = 0;
    for (let i = 0; i < totalCells; i++) {
        const gridCell = document.createElement('div');
        gridCell.className = 'bg-dark/30 rounded flex items-center justify-center';
        gridCell.dataset.cellIndex = i;
        
        // 计算格子在3D空间中的位置
        const row = Math.floor(i / 5);
        const col = i % 5;
        const x = (col - 2) * 4; // 每个格子4单位宽度
        const z = (row - 2) * 4; // 每个格子4单位高度
        
        // 在非玩家位置生成敌人
        if (i !== playerCell && enemyIndex < enemyDistribution.length) {
            const enemyInfo = this.createEnemy(enemyDistribution, enemyIndex, x, z, i);
            enemyIndex++;
            // 存储到场景怪物数据中
            this.gameState.sceneMonsters.push(enemyInfo);
            // 使用通用方法创建敌人图标
            const enemyIcon = this.createEnemyIcon(enemyInfo);
            gridCell.appendChild(enemyIcon);
        }
        
        mapGrid.appendChild(gridCell);
    }
    
    // 更新地图背景
    this.updateMapBackground();
};

// 根据格子总数生成敌人分布
// 现在包含普通、精英和BOSS的比例，并随机打乱顺序
EndlessWinterGame.prototype.createEnemyDistribution = function(totalCells) {
    const availableCells = totalCells - 1; // 减去玩家位置

    // 计算敌人数量和类型
    const totalEnemies = Math.max(10, Math.floor(availableCells * 0.8)); // 至少10个敌人，最多80%的格子
    const bossCount = Math.ceil(totalEnemies * 0.1); // 10% BOSS
    const eliteCount = Math.ceil(totalEnemies * 0.3); // 30% 精英
    const normalCount = totalEnemies - bossCount - eliteCount; // 剩下的普通怪

    // 创建敌人分布数组
    const enemyDistribution = [];

    // 添加BOSS
    for (let i = 0; i < bossCount; i++) {
        enemyDistribution.push('boss');
    }

    // 添加精英
    for (let i = 0; i < eliteCount; i++) {
        enemyDistribution.push('elite');
    }

    // 添加普通怪
    for (let i = 0; i < normalCount; i++) {
        enemyDistribution.push('normal');
    }

    // 随机打乱分布顺序
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
    
    // 生成5x5的地图格子
    for (let i = 0; i < 25; i++) {
        const gridCell = document.createElement('div');
        gridCell.className = 'bg-dark/30 rounded flex items-center justify-center';
        gridCell.dataset.cellIndex = i;
        
        // 检查当前格子是否有敌人
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
    let enemyPower = enemyInfo.attack * 2 + (enemyInfo.defense || 0) * 1.5 + enemyInfo.maxHp * 0.1;
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
    
    enemyIcon.addEventListener('click', () => {
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
    // 生成随机敌人等级（与玩家等级相近）
    const playerLevel = this.gameState.player.level;
    const enemyLevel = Math.max(1, Math.min(playerLevel + 3, playerLevel + Math.floor(Math.random() * 3) - 1));

    // 生成随机敌人属性
    const baseAttack = enemyLevel * 8;
    const baseDefense = enemyLevel * 2;
    const baseHp = enemyLevel * 30;

    // 根据分布生成敌人类型
    const enemyType = enemyDistribution[enemyIndex];
    let isElite = false;
    let isBoss = false;
    let bonus = 0;

    if (enemyType === 'boss') {
        // BOSS
        isBoss = true;
        bonus = 1.0;
    } else if (enemyType === 'elite') {
        // 精英怪
        isElite = true;
        bonus = 0.5;
    }

    // 计算最终属性
    const finalAttack = Math.floor(baseAttack * (1 + bonus));
    const finalDefense = Math.floor(baseDefense * (1 + bonus));
    const finalHp = Math.floor(baseHp * (1 + bonus));

    // 根据当前地图类型和玩家等级选择敌人
    const currentBackground = this.gameState.mapBackgrounds[this.gameState.currentBackgroundIndex];
    let mapType = currentBackground ? currentBackground.type : null;

    // 从地图敌人映射中获取当前地图的敌人列表
    const mapEnemies = this.gameState.mapEnemyMapping && this.gameState.mapEnemyMapping[mapType] ? 
        this.gameState.mapEnemyMapping[mapType] : 
        this.gameState.enemyTypes.map(enemy => enemy.name);
    
    // 随机选择一个敌人名称
    const randomEnemyName = mapEnemies[Math.floor(Math.random() * mapEnemies.length)];
    
    // 从enemyTypes中找到对应的敌人类型
    let selectedEnemyType = this.gameState.enemyTypes.find(enemy => enemy.name === randomEnemyName);
    
    // 如果找不到对应敌人，使用等级逻辑选择默认类型
    if (!selectedEnemyType) {
        let enemyTypeIndex = 0;
        if (enemyLevel >= 5) {
            enemyTypeIndex = Math.min(Math.floor(enemyLevel / 5), this.gameState.enemyTypes.length - 1);
        } else {
            enemyTypeIndex = Math.floor(Math.random() * Math.min(enemyLevel, this.gameState.enemyTypes.length));
        }
        const randomFactor = Math.random();
        if (randomFactor > 0.7 && enemyTypeIndex < this.gameState.enemyTypes.length - 1) {
            enemyTypeIndex++;
        }
        selectedEnemyType = this.gameState.enemyTypes[enemyTypeIndex];
    }
    
    // 创建敌人信息对象
    return {
        level: enemyLevel,
        hp: finalHp,
        maxHp: finalHp,
        attack: finalAttack,
        defense: finalDefense,
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
        position: { x, z }, // 存储3D空间中的位置
        cellIndex: i // 存储对应的2D格子索引
    };
};

// 保存地图场景状态
EndlessWinterGame.prototype.saveMapState = function() {
    this.mapState = {
        playerPosition: this.battle3D ? this.battle3D.player.position.clone() : null,
        enemies: this.battle3D ? this.battle3D.enemies.filter(e => e.active) : [],
        sceneMonsters: JSON.parse(JSON.stringify(this.gameState.sceneMonsters))
    };
};

// 检查玩家与预生成敌人的碰撞，如果发生则进入战斗
EndlessWinterGame.prototype.checkEnemyCollision = function() {
    if (!this.battle3D || !this.battle3D.player || !this.battle3D.enemies) return;
    const playerPos = this.battle3D.player.position;
    let enemyEncountered = false;
    for (let i = 0; i < this.battle3D.enemies.length; i++) {
        const enemy = this.battle3D.enemies[i];
        if (enemy.active) {
            const enemyPos = enemy.model.position;
            const distance = Math.sqrt(
                Math.pow(playerPos.x - enemyPos.x, 2) +
                Math.pow(playerPos.z - enemyPos.z, 2)
            );
            if (distance < 0.5) {
                this.showAttackConfirmation(enemy.info);
                enemyEncountered = true;
                break;
            }
        }
    }
    if (!enemyEncountered) {
        this.gameState.battle.inBattle = false;
        this.hideEnemyInfo();
        this.gameState.enemy = null;
    }
};
