// 导入装备系统
if (typeof module !== 'undefined' && module.exports) {
    const EquipmentSystem = require('./equipment');
    const SkillTreeSystem = require('./skillTreeSystem');
} else {
    // 浏览器环境，EquipmentSystem 和 SkillTreeSystem 已经通过 script 标签加载
}

// 游戏核心数据结构和状态管理
class EndlessWinterGame {
    constructor() {
        // 游戏状态 - 只初始化基本结构
        this.gameState = {
            // 用户信息
            user: [],
            // 玩家属性 - 留空，由登录获取或创建新用户时初始化
            player: {},
            // 资源系统 - 留空，由登录获取或创建新用户时初始化
            resources: {},
            // 游戏设置 - 留空，由登录获取或创建新用户时从metadata初始化
            settings: {},
            // 战斗状态
            battle: {
                inBattle: false,
                battleLog: []
            }
        };
        
        // 游戏计时器
        this.timers = {
            resourceTimer: null,
            autoPlayTimer: null,
            autoBattleTimer: null,
            autoCollectTimer: null,
            afkTimer: null
        };
        
        // 初始化装备系统
        this.equipmentSystem = new EquipmentSystem(this);

        // 初始化技能树系统
        this.skillTreeSystem = new SkillTreeSystem(this);
        
        // 初始化游戏
        this.initGame();
    }
    
    // 初始化游戏
    initGame() {
        // 设置默认选中的装备槽位
        this.selectedRefineSlot = 'weapon';
        
        // 初始化3D场景相关变量
        this.isMoving = false;
        this.mouseTarget = null;
        
        // 检查保存的登录状态（异步）
        this.loadUserFromSession();
    }
    
    // 登录成功后初始化游戏
    initAfterLogin() {
        // 登录和加载完成后继续初始化
        this.preloadImages();
        
        // 加载纹理（提前加载，确保3D场景初始化时纹理已准备好）
        this.loadTextures();
        
        // 确保所有装备都有refineLevel属性
            for (const slot in this.gameState.player.equipment) {
                const item = this.gameState.player.equipment[slot];
                if (item && item.refineLevel === undefined) {
                    item.refineLevel = 0;
                }
            }

            // 数据迁移：确保玩家有 inventory 结构（v1.15+ 新增）
            if (!this.gameState.player.inventory) {
                this.gameState.player.inventory = {
                    consumables: {},
                    waypoints: []
                };
            }

            if (!this.gameState.player.inventory.waypoints) {
                this.gameState.player.inventory.waypoints = [];
            }

            // 自动解锁起始地图的传送点
            if (!this.gameState.player.inventory.waypoints.includes('xianxia-mountain')) {
                this.gameState.player.inventory.waypoints.push('xianxia-mountain');
            }

            // 初始化地图邻接表
            this.adjacencyMap = this.buildAdjacencyMap(this.getConnections());

            // 计算初始装备效果
            this.equipmentSystem.calculateEquipmentEffects();
        
        // 延迟执行需要map.js的方法
        setTimeout(() => {
            // 只有在没有保存的场景怪物数据时才生成新的
            if (typeof this.generateMiniMap === 'function') {
                this.generateMiniMap();
            }
            
            // 初始化3D战斗场景
            if (typeof this.initMap3DScene === 'function') {
                this.initMap3DScene();
            }
            
            // 更新 UI 和绑定事件
            this.updateMapBackgroundUI(); // 设置初始地图背景
            this.updateCharacterBodyImage();
            this.updateUI();
            this.updateAdminControls(); // 根据用户角色更新管理控制按钮
            this.bindEvents();
            // 开始资源生成
            this.startResourceGeneration();
        }, 100);
    }
    
    // 从服务器获取游戏元数据
    async fetchGameMetadata() {
        try {
            // 获取token
            const token = localStorage.getItem('endlessWinterToken');
            if (!token) {
                throw new Error('用户未登录，无法获取游戏数据');
            }
            
            // 确保使用正确的端口和路径
            const response = await fetch('/api/metadata', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // 检查响应结构
            if (!data.success || !data.metadata) {
                throw new Error('无效的元数据响应');
            }
            
            const metadata = data.metadata;

            // 保存metadata引用供后续使用
            this.metadata = metadata;
            
            // 添加辅助方法
            this.metadata.getSkillById = function(skillId) {
                // 从技能树系统中查找技能
                if (this.skillTrees) {
                    for (let skillTree of this.skillTrees) {
                        // 在技能树的等级中查找
                        if (skillTree.levels) {
                            for (let level of skillTree.levels) {
                                // 检查是否匹配技能树ID或技能名称
                                if (skillTree.id === skillId || level.name === skillId) {
                                    return {
                                        ...level,
                                        id: skillTree.id,
                                        treeName: skillTree.name,
                                        type: skillTree.type,
                                        realmRequired: skillTree.realmRequired
                                    };
                                }
                            }
                        }
                    }
                }
                return null;
            };

            // 更新游戏状态中的元数据
          
            if (metadata.dropRates) {
                this.metadata.dropRates = metadata.dropRates;
            }

            this.addBattleLog('从服务器加载游戏数据成功！');
        } catch (error) {
            console.error('获取元数据失败:', error);
            throw error;
        }
    }
    
    // 预加载图片
    preloadImages() {
        // 预加载人物形象图片
        const maleCharacter = new Image();
        maleCharacter.src = 'Images/male-character.png';
        
        const femaleCharacter = new Image();
        femaleCharacter.src = 'Images/female-character.png';
        
        const defaultCharacter = new Image();
        defaultCharacter.src = 'Images/default-character.png';
        
        // 预加载装备图片
        const weaponImage = new Image();
        weaponImage.src = 'Images/weapon-sword.png';
        
        const armorImage = new Image();
        armorImage.src = 'Images/armor-chestplate.png';
        
        const helmetImage = new Image();
        helmetImage.src = 'Images/helmet.png';
        
        const bootsImage = new Image();
        bootsImage.src = 'Images/boots.png';
        
        const accessoryImage = new Image();
        accessoryImage.src = 'Images/accessory-necklace.png';

        this.addBattleLog('图片预加载中...');
    }
    
    // 加载纹理
    loadTextures() {
        // 存储纹理
        this.textures = {};
    }
    
    // 更新地图背景
    updateMapBackground() {
        // 不再自动随等级切换地图，玩家需要主动选择移动
        // 只在初始化时设置默认地图
        if (this.gameState.currentBackgroundIndex === undefined) {
            this.gameState.currentBackgroundIndex = 0; // 默认山峰（武者起始地图）
            this.updateMapBackgroundUI();
        }
    }
    
    // 更新地图背景UI
    updateMapBackgroundUI() {
        if (this.metadata.mapBackgrounds.length > 0) {
            const currentBackground = this.metadata.mapBackgrounds[this.gameState.currentBackgroundIndex];
            if (currentBackground) {
                // 更新当前地图名称显示
                const mapNameElement = document.getElementById('current-map-name');
                if (mapNameElement) {
                    mapNameElement.textContent = currentBackground.name;
                }

                // 更新3D场景背景
                if (this.battle3D) {
                    // 辅助函数：转换色值为hex字符串
                    const toHexColor = (color) => {
                        if (typeof color === 'number') {
                            return '#' + color.toString(16).padStart(6, '0');
                        }
                        return color;
                    };

                    // 更新天空颜色
                    this.battle3D.scene.clearColor = new BABYLON.Color4.FromHexString(toHexColor(currentBackground.skyColor), 1);

                    // 更新雾效
                    if (this.battle3D.scene.fogMode === BABYLON.Scene.FOGMODE_LINEAR) {
                        this.battle3D.scene.fogColor = new BABYLON.Color3.FromHexString(toHexColor(currentBackground.fogColor));
                        this.battle3D.scene.fogStart = currentBackground.fogNear;
                        this.battle3D.scene.fogEnd = currentBackground.fogFar;
                    } else {
                        this.battle3D.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
                        this.battle3D.scene.fogColor = new BABYLON.Color3.FromHexString(toHexColor(currentBackground.fogColor));
                        this.battle3D.scene.fogStart = currentBackground.fogNear;
                        this.battle3D.scene.fogEnd = currentBackground.fogFar;
                    }
                }

                // 更新2D地图背景图片
                const backgroundElement = document.querySelector('#map-background img');
                if (backgroundElement && currentBackground.imageUrl) {
                    backgroundElement.src = currentBackground.imageUrl;
                }
            }
        }
    }

    // ===== 地图移动系统 =====

    // 获取地图连接定义（线性路线）
    getConnections() {
        return [
            ["xianxia-mountain", "xianxia-beach"],
            ["xianxia-beach", "xianxia-plains"],
            ["xianxia-plains", "xianxia-canyon"],
            ["xianxia-canyon", "xianxia-desert"],
            ["xianxia-desert", "xianxia-lake"],
            ["xianxia-lake", "xianxia-forest"],
            ["xianxia-forest", "xianxia-volcano"],
            ["xianxia-volcano", "xianxia-cave"],
            ["xianxia-cave", "xianxia-heaven"]
        ];
    }

    // 构建邻接表（双向）
    buildAdjacencyMap(connections) {
        const adjacencyMap = {};

        connections.forEach(([mapA, mapB]) => {
            if (!adjacencyMap[mapA]) adjacencyMap[mapA] = [];
            if (!adjacencyMap[mapB]) adjacencyMap[mapB] = [];

            adjacencyMap[mapA].push(mapB);
            adjacencyMap[mapB].push(mapA);
        });

        return adjacencyMap;
    }

    // 检查两个地图是否相邻
    isAdjacentMap(currentMapType, targetMapType) {
        if (currentMapType === targetMapType) return false;

        if (!this.adjacencyMap) {
            this.adjacencyMap = this.buildAdjacencyMap(this.getConnections());
        }

        const adjacentMaps = this.adjacencyMap[currentMapType] || [];
        return adjacentMaps.includes(targetMapType);
    }

    // 移动到指定地图
    travelToMap(targetMapType, options = {}) {
        // 解构选项参数
        const {
            bypassAdjacentCheck = false,  // 允许传送绕过
            teleportType = null           // 'waypoint', 'item', 'admin', null
        } = options;

        const playerRealm = this.gameState.player.realm.currentRealm;
        const realmRequirement = this.metadata.mapRealmRequirements[targetMapType];
        const currentMapType = this.metadata.mapBackgrounds[
            this.gameState.currentBackgroundIndex
        ]?.type;

        // 检查1：境界限制
        if (!realmRequirement) {
            this.addBattleLog('找不到目标地图的境界需求配置！');
            return false;
        }

        if (playerRealm < realmRequirement.realm) {
            this.addBattleLog(`境界不足！需要达到 ${realmRequirement.name} 期才能进入该地图。`);
            return false;
        }

        // 检查2：相邻地图限制（可被传送绕过）
        if (!bypassAdjacentCheck && currentMapType !== targetMapType) {
            if (!this.isAdjacentMap(currentMapType, targetMapType)) {
                // 获取相邻地图列表用于友好提示
                if (!this.adjacencyMap) {
                    this.adjacencyMap = this.buildAdjacencyMap(this.getConnections());
                }
                const adjacentMaps = this.adjacencyMap[currentMapType] || [];
                const adjacentNames = adjacentMaps.map(mapType => {
                    const map = this.metadata.mapBackgrounds.find(bg => bg.type === mapType);
                    return map ? map.name : mapType;
                }).join('、');

                this.addBattleLog(`只能移动到相邻的地图！当前可到达: ${adjacentNames}`);
                this.addBattleLog(`提示: 使用传送道具可以到达更远的地图`);
                return false;
            }
        }

        // 检查3：能量消耗（传送点免费，正常移动消耗10点）
        const energyCost = teleportType === 'waypoint' ? 0 : 10;

        if (this.gameState.player.energy < energyCost) {
            this.addBattleLog(`灵力不足！需要 ${energyCost} 点灵力才能移动。`);
            return false;
        }

        // 查找目标地图索引
        const targetIndex = this.metadata.mapBackgrounds.findIndex(
            bg => bg.type === targetMapType
        );

        if (targetIndex === -1) {
            this.addBattleLog('找不到目标地图！');
            return false;
        }

        // 执行移动
        this.gameState.player.energy -= energyCost;
        this.gameState.currentBackgroundIndex = targetIndex;
        this.updateMapBackgroundUI();
        this.generateMiniMap();

        const mapInfo = this.metadata.mapBackgrounds[targetIndex];

        // 根据移动类型显示不同消息
        if (teleportType === 'waypoint') {
            this.addBattleLog(`通过传送点，瞬间到达 ${mapInfo.name}！`);
        } else if (teleportType === 'item') {
            this.addBattleLog(`使用传送符，传送到了 ${mapInfo.name}！`);
        } else {
            this.addBattleLog(`消耗 ${energyCost} 灵力，移动到了 ${mapInfo.name}！`);
        }

        // 首次访问处理
        this.onMapVisit(targetMapType);

        this.updateUI();
        return true;
    }

    // 获取当前可进入的地图列表
    getAvailableMaps() {
        const playerRealm = this.gameState.player.realm.currentRealm;
        const currentMapType = this.metadata.mapBackgrounds[this.gameState.currentBackgroundIndex]?.type;

        return this.metadata.mapBackgrounds.map((mapBg, index) => {
            const realmReq = this.metadata.mapRealmRequirements[mapBg.type] || { realm: 0, name: "武者" };
            const isUnlocked = playerRealm >= realmReq.realm;
            const isCurrent = mapBg.type === currentMapType;

            return {
                index,
                type: mapBg.type,
                name: mapBg.name,
                realmRequired: realmReq.realm,
                realmName: realmReq.name,
                isUnlocked,
                isCurrent
            };
        });
    }

    // 地图首次访问处理
    onMapVisit(mapType) {
        // 确保玩家有 inventory 结构
        if (!this.gameState.player.inventory) {
            this.gameState.player.inventory = {
                consumables: {},
                waypoints: []
            };
        }

        if (!this.gameState.player.inventory.waypoints) {
            this.gameState.player.inventory.waypoints = [];
        }

        // 首次访问解锁传送点
        if (!this.gameState.player.inventory.waypoints.includes(mapType)) {
            this.gameState.player.inventory.waypoints.push(mapType);

            const map = this.metadata.mapBackgrounds.find(bg => bg.type === mapType);
            this.addBattleLog(`解锁了 ${map.name} 的传送点！`);

            // 首次探索奖励
            const bonus = { exp: 100, spiritCrystal: 50 };
            this.gameState.player.exp += bonus.exp;
            this.gameState.resources.spiritCrystal += bonus.spiritCrystal;
            this.addBattleLog(`首次探索！获得 ${bonus.exp} 经验和 ${bonus.spiritCrystal} 灵石`);
        }
    }

    // 传送到已解锁的传送点
    teleportToWaypoint(mapType) {
        // 确保有传送点数据
        if (!this.gameState.player.inventory || !this.gameState.player.inventory.waypoints) {
            this.addBattleLog('尚未解锁任何传送点！');
            return false;
        }

        if (!this.gameState.player.inventory.waypoints.includes(mapType)) {
            this.addBattleLog('尚未解锁该地图的传送点！');
            return false;
        }

        return this.travelToMap(mapType, {
            bypassAdjacentCheck: true,
            teleportType: 'waypoint'
        });
    }

    // 显示地图选择面板 - 绝对定位（配合背景图片）
    showMapSelectionPanel() {
        const maps = this.getAvailableMaps();

        // 地图节点位置（基于背景图片的地理布局 - 百分比坐标）
        const mapPositions = {
            "xianxia-mountain": { x: 5, y: 80, name: "山峰" },   
            "xianxia-beach":    { x: 8,  y: 25, name: "海滩" },   
            "xianxia-forest":   { x: 50, y: 36, name: "森林" },   
            "xianxia-plains":   { x: 22, y: 28, name: "平原" },   
            "xianxia-lake":     { x: 60, y: 55, name: "湖泊" },   
            "xianxia-canyon":   { x: 42, y: 55, name: "峡谷" },   
            "xianxia-desert":   { x: 42, y: 72, name: "沙漠" },   
            "xianxia-cave":     { x: 78, y: 28, name: "洞穴" },   
            "xianxia-heaven":   { x: 95, y: 15, name: "仙境" },   
            "xianxia-volcano":  { x: 68, y: 38, name: "火山" }    
        };

        // 连接线定义（按路线顺序：山峰→海滩→平原→峡谷→沙漠→湖泊→森林→火山→洞穴→仙境）
        const connections = [
            ["xianxia-mountain", "xianxia-beach"],
            ["xianxia-beach", "xianxia-plains"],
            ["xianxia-plains", "xianxia-canyon"],
            ["xianxia-canyon", "xianxia-desert"],
            ["xianxia-desert", "xianxia-lake"],
            ["xianxia-lake", "xianxia-forest"],
            ["xianxia-forest", "xianxia-volcano"],
            ["xianxia-volcano", "xianxia-cave"],
            ["xianxia-cave", "xianxia-heaven"]
        ];

        // 构建HTML
        let html = `
        <style>
            .world-map-container {
                position: relative;
                width: 100%;
                height: 520px;
                border-radius: 12px;
                overflow: hidden;
            }
            .world-map-bg {
                position: absolute;
                inset: 0;
                opacity: 0.55;
            }
            .world-map-bg img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .map-svg-layer {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            .map-connection {
                stroke: rgba(150, 180, 220, 0.3);
                stroke-width: 1;
                fill: none;
            }
            .map-connection.active {
                stroke: rgba(96, 165, 250, 0.4);
                stroke-width: 1.5;
            }
            .map-node-abs {
                position: absolute;
                width: 65px;
                height: 65px;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 11px;
                text-align: center;
                transform: translate(-50%, -50%);
                pointer-events: auto;
                backdrop-filter: blur(8px);
                z-index: 10;
            }
            .map-node-abs.unlocked {
                background: linear-gradient(135deg, rgba(30, 64, 175, 0.92), rgba(59, 130, 246, 0.92));
                border: 3px solid #60a5fa;
                color: white;
                box-shadow: 0 0 18px rgba(59, 130, 246, 0.6);
            }
            .map-node-abs.unlocked:hover {
                transform: translate(-50%, -50%) scale(1.25);
                box-shadow: 0 0 35px rgba(59, 130, 246, 1);
                z-index: 20;
            }
            .map-node-abs.current {
                background: linear-gradient(135deg, rgba(5, 150, 105, 0.95), rgba(16, 185, 129, 0.95));
                border: 4px solid #34d399;
                animation: pulse-glow 2s infinite;
                box-shadow: 0 0 30px rgba(16, 185, 129, 0.9);
            }
            .map-node-abs.locked {
                background: rgba(55, 65, 81, 0.85);
                border: 3px solid #4b5563;
                color: #9ca3af;
                cursor: not-allowed;
            }
            .map-node-abs .name {
                font-weight: bold;
                font-size: 12px;
                line-height: 1.2;
                text-shadow: 0 1px 3px rgba(0,0,0,0.8);
            }
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); }
                50% { box-shadow: 0 0 45px rgba(16, 185, 129, 1); }
            }
        </style>
        <div class="world-map-container">
            <!-- 背景图片 -->
            <div class="world-map-bg">
                <img src="Images/world_map.jpg" alt="世界地图" onerror="this.parentElement.style.opacity=0">
            </div>

            <!-- SVG连接线层 -->
            <svg class="map-svg-layer" viewBox="0 0 100 100" preserveAspectRatio="none">`;

        // 绘制连接线
        connections.forEach(([from, to]) => {
            const fromPos = mapPositions[from];
            const toPos = mapPositions[to];
            if (!fromPos || !toPos) return;

            const fromMap = maps.find(m => m.type === from);
            const toMap = maps.find(m => m.type === to);
            const isActive = (fromMap?.isUnlocked || toMap?.isUnlocked);

            html += `<line class="map-connection ${isActive ? 'active' : ''}"
                x1="${fromPos.x}" y1="${fromPos.y}"
                x2="${toPos.x}" y2="${toPos.y}"/>`;
        });

        html += '</svg>';

        // 绘制地图节点
        Object.entries(mapPositions).forEach(([mapType, pos]) => {
            const map = maps.find(m => m.type === mapType);
            if (!map) return;

            let nodeClass = 'locked';
            let prefix = '🔒';
            if (map.isCurrent) {
                nodeClass = 'current';
                prefix = '📍';
            } else if (map.isUnlocked) {
                nodeClass = 'unlocked';
                prefix = '';
            }

            if (map.isUnlocked && !map.isCurrent) {
                html += `<div class="map-node-abs ${nodeClass}"
                    style="left: ${pos.x}%; top: ${pos.y}%;"
                    onclick="game.travelToMap('${mapType}')">
                    <span class="name">${pos.name}</span>
                </div>`;
            } else {
                html += `<div class="map-node-abs ${nodeClass}"
                    style="left: ${pos.x}%; top: ${pos.y}%;">
                    <span class="name">${prefix}${pos.name}</span>
                </div>`;
            }
        });

        html += '</div>';
        html += '<p class="text-center text-sm text-gray-400 mt-3">💡 点击节点移动 | 消耗 10 灵力 | 📍=当前位置</p>';

        // 显示在模态框中
        this.showSimpleMapModal(html);
    }

    // 简单地图选择弹窗
    showSimpleMapModal(html) {
        // 创建临时模态框
        let modal = document.createElement('div');
        modal.id = 'temp-map-modal';
        modal.className = 'fixed inset-0 bg-black/85 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="relative bg-gray-900/98 rounded-xl p-5 w-[95vw] max-w-5xl mx-4 max-h-[90vh] overflow-auto border border-gray-600 shadow-2xl">
                <!-- 标题 -->
                <div class="text-center mb-4 relative z-10">
                    <h2 class="text-2xl font-bold text-white">🗺️ 修仙世界</h2>
                    <p class="text-sm text-gray-400">沿着灵脉探索各个神秘区域</p>
                </div>
                <!-- 内容区域 -->
                <div class="relative z-10">
                    ${html}
                </div>
                <!-- 关闭按钮 -->
                <button onclick="document.getElementById('temp-map-modal').remove()"
                    class="relative z-10 mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                    关闭地图
                </button>
            </div>
        `;
        document.body.appendChild(modal);

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 检查保存的登录状态
    async loadUserFromSession() {
        try {
            // 从 localStorage 中获取 token 和用户信息
            const token = localStorage.getItem('endlessWinterToken');
            const userStr = localStorage.getItem('endlessWinterUser');

            if (token && userStr) {
                try {
                    const userInfo = JSON.parse(userStr);

                    // 设置用户信息
                    this.gameState.user = {
                        loggedIn: true,
                        username: userInfo.username,
                        userId: userInfo.userId,
                        gender: userInfo.gender,
                        role: userInfo.role || 'player'
                    };

                    // 加载游戏状态（等待完成）
                    await this.loadGame();

                    // 显示登录成功消息
                    this.addBattleLog(`登录成功！欢迎回来，${userInfo.username}！`);

                    // 登录成功后初始化游戏
                    this.initAfterLogin();
                } catch (parseError) {
                    console.error('解析用户信息失败:', parseError);
                    // 解析失败，重定向到登录页面
                    window.location.href = 'login.html';
                }
            } else {
                // 未登录，重定向到登录页面
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('检查登录状态失败:', error);
            // 发生错误，重定向到登录页面
            window.location.href = 'login.html';
        }
    }
    
    // 更新管理员控制按钮的显示状态
    updateAdminControls() {
        const isAdmin = this.gameState.user.role === 'admin';
        console.debug("新功能，待开发！");
    }
    
    // 更新UI显示
    updateUI() {
        // 确保gameState和resources对象存在
        if (!this.gameState) {
            this.gameState = {};
        }
        if (!this.gameState.resources) {
            this.gameState.resources = {
                spiritWood: 0,
                spiritWoodRate: 1,
                blackIron: 0,
                blackIronRate: 0.5,
                spiritCrystal: 0,
                spiritCrystalRate: 0.2
            };
        }
        if (!this.gameState.player) {
            this.gameState.player = {
                energy: 100,
                maxEnergy: 100
            };
        }
        
        // 更新资源显示
        const energyElement = document.getElementById('energy');
        if (energyElement) {
            const energyCurrent = Math.floor(this.gameState.player.energy || 0);
            const energyMax = this.gameState.player.maxEnergy || 100;
            energyElement.textContent = `${energyCurrent}/${energyMax}`;
            // 使用元数据中的回复速率，如果没有则使用默认值2
            const energyRegenRate = this.metadata.player?.regenRates?.energy || 2;
            energyElement.setAttribute('data-tooltip', `灵力恢复: +${energyRegenRate}/秒`);
        }
        const spiritWoodElement = document.getElementById('spiritWood');
        if (spiritWoodElement) {
            spiritWoodElement.textContent = Math.floor(this.gameState.resources.spiritWood || 0);
        }
        const spiritWoodRateElement = document.getElementById('spiritWood-rate');
        if (spiritWoodRateElement) {
            spiritWoodRateElement.textContent = `+${this.gameState.resources.spiritWoodRate || 0}/秒`;
        }
        const blackIronElement = document.getElementById('blackIron');
        if (blackIronElement) {
            blackIronElement.textContent = Math.floor(this.gameState.resources.blackIron || 0);
        }
        const blackIronRateElement = document.getElementById('blackIron-rate');
        if (blackIronRateElement) {
            blackIronRateElement.textContent = `+${this.gameState.resources.blackIronRate || 0}/秒`;
        }
        const spiritCrystalElement = document.getElementById('spiritCrystal');
        if (spiritCrystalElement) {
            spiritCrystalElement.textContent = Math.floor(this.gameState.resources.spiritCrystal || 0);
        }
        const spiritCrystalRateElement = document.getElementById('spiritCrystal-rate');
        if (spiritCrystalRateElement) {
            spiritCrystalRateElement.textContent = `+${this.gameState.resources.spiritCrystalRate || 0}/秒`;
        }
        
        // 计算装备效果
        this.equipmentSystem.calculateEquipmentEffects();
        
        // 计算境界加成
        let realmBonus = { attack: 0, defense: 0, hp: 0, luck: 0 };
        if (this.metadata.realmConfig) {
            realmBonus = this.calculateRealmBonus();
        }
        
        // 计算最终属性（基础属性 + 装备效果 + 境界加成）
        const finalAttack = this.gameState.player.attack + this.gameState.player.equipmentEffects.attack + realmBonus.attack;
        const finalDefense = this.gameState.player.defense + this.gameState.player.equipmentEffects.defense + realmBonus.defense;
        const finalHp = this.gameState.player.hp + this.gameState.player.equipmentEffects.hp + realmBonus.hp;
        const finalLuck = this.gameState.player.luck + this.gameState.player.equipmentEffects.luck + realmBonus.luck;
        const finalSpeed = this.gameState.player.speed + (this.gameState.player.equipmentEffects.speed || 0) + (realmBonus.speed || 0);
        
        // 更新玩家属性显示
            const levelElement = document.getElementById('level');
            if (levelElement) {
                if (this.metadata.realmConfig) {
                    const realm = this.gameState.player.realm;
                    const realmName = this.metadata.realmConfig[realm.currentRealm].name;
                    const stageConfig = this.metadata.realmConfig[realm.currentRealm].stages[realm.currentStage - 1];
                    const stageName = stageConfig.name;
                    levelElement.textContent = `${realmName} ${stageName} ${realm.currentStage}阶 ${realm.currentLevel}级`;
                } else {
                    levelElement.textContent = this.calculateTotalLevel();
                }
            }
            const expElement = document.getElementById('exp');
            if (expElement) {
                expElement.textContent = this.gameState.player.exp;
            }
            const maxExpElement = document.getElementById('max-exp');
            if (maxExpElement) {
                maxExpElement.textContent = this.gameState.player.maxExp;
            }
            // 更新经验条
            const expBarElement = document.getElementById('exp-bar');
            if (expBarElement) {
                const expPercentage = (this.gameState.player.exp / this.gameState.player.maxExp) * 100;
                expBarElement.style.width = `${Math.min(expPercentage, 100)}%`;
            }
            // 更新突破石显示
            const breakthroughStonesElement = document.getElementById('breakthrough-stones');
            if (breakthroughStonesElement) {
                breakthroughStonesElement.textContent = `突破石: ${this.gameState.resources.breakthroughStones || 0}`;
            }
            // 更新突破按钮状态
            const breakthroughBtnElement = document.getElementById('breakthrough-btn');
            if (breakthroughBtnElement && this.metadata.realmConfig) {
                const realm = this.gameState.player.realm;
                const currentStageConfig = this.metadata.realmConfig[realm.currentRealm].stages[realm.currentStage - 1];
                const requiredStones = currentStageConfig.breakthroughStones;
                const hasEnoughLevel = realm.currentLevel >= currentStageConfig.levelCap;
                const hasEnoughStones = (this.gameState.resources.breakthroughStones || 0) >= requiredStones;
                
                if (hasEnoughLevel && hasEnoughStones) {
                    breakthroughBtnElement.disabled = false;
                    breakthroughBtnElement.setAttribute('data-tooltip', `突破到下一级需要${requiredStones}个突破石`);
                } else {
                    breakthroughBtnElement.disabled = true;
                    if (!hasEnoughLevel) {
                        breakthroughBtnElement.setAttribute('data-tooltip', `需要达到${currentStageConfig.levelCap}级才能突破`);
                    } else {
                        breakthroughBtnElement.setAttribute('data-tooltip', `需要${requiredStones}个突破石才能突破`);
                    }
                }
            }
            const attackElement = document.getElementById('attack');
            if (attackElement) {
                const baseAttack = this.gameState.player.baseAttack || (this.gameState.player.attack - this.gameState.player.equipmentEffects.attack);
                const baseFinalAttack = baseAttack + this.gameState.player.equipmentEffects.attack;
                if (this.gameState.player.tempAttack) {
                    attackElement.innerHTML = `${Math.floor(baseFinalAttack)}<span class="text-yellow-400">(${Math.floor(finalAttack)})</span>`;
                } else {
                    attackElement.textContent = Math.floor(finalAttack);
                }
            }
            const defenseElement = document.getElementById('defense');
            if (defenseElement) {
                const baseDefense = this.gameState.player.baseDefense || (this.gameState.player.defense - this.gameState.player.equipmentEffects.defense);
                const baseFinalDefense = baseDefense + this.gameState.player.equipmentEffects.defense;
                if (this.gameState.player.tempDefense) {
                    defenseElement.innerHTML = `${Math.floor(baseFinalDefense)}<span class="text-yellow-400">(${Math.floor(finalDefense)})</span>`;
                } else {
                    defenseElement.textContent = Math.floor(finalDefense);
                }
            }
            const hpElement = document.getElementById('hp');
            if (hpElement) {
                const maxHp = this.gameState.player.maxHp + this.gameState.player.equipmentEffects.hp + realmBonus.hp;
                hpElement.textContent = `${Math.floor(finalHp)}/${Math.floor(maxHp)}`;
                // 更新生命值恢复提示（每秒钟恢复1%最大生命值）
                hpElement.setAttribute('data-tooltip', `生命值恢复: +${Math.floor(maxHp * 0.01)}/秒`);
            }
            const luckElement = document.getElementById('luck');
            if (luckElement) {
                const baseLuck = this.gameState.player.baseLuck || (this.gameState.player.luck - this.gameState.player.equipmentEffects.luck);
                const baseFinalLuck = baseLuck + this.gameState.player.equipmentEffects.luck + realmBonus.luck;
                if (this.gameState.player.tempLuck) {
                    luckElement.innerHTML = `${Math.floor(baseFinalLuck)}<span class="text-yellow-400">(${Math.floor(finalLuck)})</span>`;
                } else {
                    luckElement.textContent = Math.floor(finalLuck);
                }
            }
            const speedElement = document.getElementById('speed');
            if (speedElement) {
                const baseSpeed = this.gameState.player.baseSpeed || (this.gameState.player.speed - (this.gameState.player.equipmentEffects.speed || 0));
                const baseFinalSpeed = baseSpeed + (this.gameState.player.equipmentEffects.speed || 0) + (realmBonus.speed || 0);
                if (this.gameState.player.tempSpeed) {
                    speedElement.innerHTML = `${Math.floor(baseFinalSpeed)}<span class="text-yellow-400">(${Math.floor(finalSpeed)})</span>`;
                } else {
                    speedElement.textContent = Math.floor(finalSpeed);
                }
            }
        
        // 更新装备栏显示
        for (const slot in this.gameState.player.equipment) {
            const item = this.gameState.player.equipment[slot];
            const equipmentElement = document.getElementById(`equipment-${slot}`);
            if (equipmentElement) {
                if (item) {
                    // 显示装备名称和精炼等级
                    let displayName = item.name;
                    if (item.refineLevel && item.refineLevel > 0) {
                        displayName += ` +${item.refineLevel}`;
                    }
                    equipmentElement.textContent = displayName;
                    // 根据装备稀有度设置颜色
                    const colorClass = this.equipmentSystem.getEquipmentColorClass(item);
                    equipmentElement.className = `text-sm ${colorClass}`;
                    // 设置装备属性的tooltip
                    const statsDescription = this.equipmentSystem.getStatsDescription(item.stats);
                    const levelDisplay = item.realmName ? item.realmName : item.level;
                    const tooltipText = `${item.name}\n等级: ${levelDisplay}\n品质: ${item.rarityDisplayName || '白色'}\n精炼: +${item.refineLevel || 0}\n属性: ${statsDescription}`;
                    equipmentElement.setAttribute('data-tooltip', tooltipText);
                } else {
                    equipmentElement.textContent = '无';
                    equipmentElement.className = 'text-sm';
                    equipmentElement.setAttribute('data-tooltip', '未装备');
                }
            }
        }
        
        // 重新初始化tooltip
        this.initTooltips();
        
        // 更新人物装备显示
        this.equipmentSystem.updateCharacterEquipmentDisplay();
        
        // 更新挂机时间显示
        const afkTimeElement = document.getElementById('afk-time');
        if (afkTimeElement) {
            afkTimeElement.textContent = this.formatTime(this.gameState.settings.afkTime);
        }
        const collectedResourcesElement = document.getElementById('collected-resources');
        if (collectedResourcesElement) {
            collectedResourcesElement.textContent = this.gameState.settings.collectedResources;
        }
        
        // 更新战斗日志
        this.updateBattleLog();
        
        // 更新用户信息
        const currentUserNav = document.getElementById('current-user-nav');
        if (currentUserNav) {
            currentUserNav.textContent = this.gameState.user.username;
        }
        const survivorName = document.getElementById('survivor-name');
        if (survivorName) {
            survivorName.textContent = this.gameState.user.username;
        }
        
        // 更新精炼信息
        this.equipmentSystem.updateRefineInfo(this.selectedRefineSlot);
        
    }
    
    // 格式化时间
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 开始资源生成
    startResourceGeneration() {
        this.timers.resourceTimer = setInterval(() => {
            this.generateResources();
        }, 1000);
    }
    
    // 停止战斗音乐（移至 audio.js）
    stopBattleMusic() {
        // placeholder to avoid undefined calls
    }
    
    // 生成资源
    generateResources() {
        // 获取资源速率，添加默认值
        const spiritWoodRate = this.gameState.resources.spiritWoodRate || 1;
        const blackIronRate = this.gameState.resources.blackIronRate || 0.5;
        const spiritCrystalRate = this.gameState.resources.spiritCrystalRate || 0.2;
        
        // 生成灵木
        this.gameState.resources.spiritWood += spiritWoodRate;
        
        // 生成玄铁
        this.gameState.resources.blackIron += blackIronRate;
        
        // 生成灵石
        this.gameState.resources.spiritCrystal += spiritCrystalRate;
        
        // 生命自动恢复
        if (this.gameState.player.hp < this.gameState.player.maxHp) {
            // 使用元数据中的回复速率，如果没有则使用默认值0.5
            const hpRegenRate = this.metadata.player?.regenRates?.hp || 0.5;
            this.gameState.player.hp = Math.min(
                this.gameState.player.hp + hpRegenRate,
                this.gameState.player.maxHp
            );
        }
        
        // 灵力自动恢复
        if (this.gameState.player && this.gameState.player.energy !== undefined && this.gameState.player.maxEnergy !== undefined) {
            if (this.gameState.player.energy < this.gameState.player.maxEnergy) {
                // 使用元数据中的回复速率，如果没有则使用默认值2
                const energyRegenRate = this.metadata.player?.regenRates?.energy || 2;
                this.gameState.player.energy = Math.min(
                    this.gameState.player.energy + energyRegenRate,
                    this.gameState.player.maxEnergy
                );
            }
        } else {
            // 确保灵力属性存在
            if (!this.gameState.player) {
                this.gameState.player = {};
            }
            if (this.gameState.player.energy === undefined) {
                this.gameState.player.energy = 100;
            }
            if (this.gameState.player.maxEnergy === undefined) {
                this.gameState.player.maxEnergy = 100;
            }
        }
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        if (typeof this.updateHealthBars === 'function') {
            this.updateHealthBars();
        }
    }
    

    // 绑定事件
    bindEvents() {
        
        // 安全的事件绑定函数
        const bindEvent = (selector, event, callback) => {
            try {
                const element = document.querySelector(selector);
                if (element) {
                    element.addEventListener(event, callback);
                    (`成功绑定 ${event} 事件到 ${selector}`);
                } else {
                    (`未找到元素 ${selector}`);
                }
            } catch (error) {
                console.error(`绑定事件到 ${selector} 时出错:`, error);
            }
        };
        
        // 关闭战斗模态窗口按钮
        bindEvent('#close-battle-modal', 'click', () => {
            this.closeBattleModal();
        });
        
        // 攻击按钮
        bindEvent('#attack-btn', 'click', () => {
            this.attackEnemy();
        });
        
        // 自动战斗按钮
        bindEvent('#auto-battle-btn', 'click', () => {
            this.toggleAutoBattle();
        });
        
        // 自动收集资源按钮
        bindEvent('#auto-collect-btn', 'click', () => {
            this.toggleAutoCollect();
        });
        
        // 自动战斗目标颜色设置
        bindEvent('#auto-battle-green', 'change', () => {
            this.updateAutoBattleTargetColors();
        });
        bindEvent('#auto-battle-yellow', 'change', () => {
            this.updateAutoBattleTargetColors();
        });
        bindEvent('#auto-battle-red', 'change', () => {
            this.updateAutoBattleTargetColors();
        });
        
        // 自动收集资源类型设置
        bindEvent('#auto-collect-spiritWood', 'change', () => {
            this.updateAutoCollectResourceTypes();
        });
        bindEvent('#auto-collect-blackIron', 'change', () => {
            this.updateAutoCollectResourceTypes();
        });
        bindEvent('#auto-collect-spiritCrystal', 'change', () => {
            this.updateAutoCollectResourceTypes();
        });
        
        // 自动挂机开关
        bindEvent('#auto挂机', 'change', (e) => {
            this.toggleAutoPlay(e.target.checked);
        });
        
        // 资源收集按钮
        bindEvent('#collect-spiritWood', 'click', () => {
            this.collectResource('spiritWood');
        });
        
        bindEvent('#collect-blackIron', 'click', () => {
            this.collectResource('blackIron');
        });
        
        bindEvent('#collect-spiritCrystal', 'click', () => {
            this.collectResource('spiritCrystal');
        });
        
        // 用户相关按钮
        
        bindEvent('#logout-btn', 'click', () => {
            this.logout();
        });
        
        // 装备相关按钮
        bindEvent('#equip-item-btn', 'click', () => {
            this.showEquipMenu();
        });
        
        bindEvent('#unequip-item-btn', 'click', () => {
            this.showUnequipMenu();
        });
        
        // 背包按钮
        bindEvent('#open-inventory-btn', 'click', () => {
            this.showInventory();
        });
        
        // 突破按钮
        bindEvent('#breakthrough-btn', 'click', () => {
            this.attemptBreakthrough();
        });

        // 技能树按钮
        bindEvent('#skill-tree-btn', 'click', () => {
            this.openSkillTreeModal();
        });

        // 关闭技能树模态窗口
        bindEvent('#close-skill-tree-modal', 'click', () => {
            this.closeSkillTreeModal();
        });
        
        // 关闭技能树模态窗口
        bindEvent('#close-skill-tree-modal', 'click', () => {
            this.closeSkillTreeModal();
        });

        // 点击模态窗口外部关闭
        const skillTreeModal = document.getElementById('skill-tree-modal');
        if (skillTreeModal) {
            skillTreeModal.addEventListener('click', (e) => {
                if (e.target === skillTreeModal) {
                    this.closeSkillTreeModal();
                }
            });
        }

        // 关闭技能详情面板
        bindEvent('#close-skill-detail', 'click', () => {
            const placeholder = document.getElementById('skill-detail-placeholder');
            const content = document.getElementById('skill-detail-content');

            if (content) content.classList.add('hidden');
            if (placeholder) placeholder.classList.remove('hidden');
        });

        // 为装备槽位添加点击事件
        try {
            const equipmentSlots = document.querySelectorAll('.equipment-slot');
            equipmentSlots.forEach(slot => {
                slot.addEventListener('click', () => {
                        const selectedSlot = slot.dataset.slot;
                        this.equipmentSystem.updateRefineInfo(selectedSlot);
                        this.equipmentSystem.updateRefreshInfo(selectedSlot);
                        // 存储当前选中的装备槽位
                        this.selectedRefineSlot = selectedSlot;
                        // 更新装备槽位的样式
                        document.querySelectorAll('.equipment-slot').forEach(s => {
                            s.classList.remove('border-accent');
                        });
                        slot.classList.add('border-accent');
                    });
                
                // 添加双击事件来卸下装备
                slot.addEventListener('dblclick', () => {
                    const selectedSlot = slot.dataset.slot;
                    const item = this.gameState.player.equipment[selectedSlot];
                    if (item) {
                        this.unequipItem(selectedSlot);
                    }
                });
            });
            (`成功绑定 ${equipmentSlots.length} 个装备槽位事件`);
        } catch (error) {
            console.error('绑定装备槽位事件时出错:', error);
        }
        
        // 精炼装备按钮
        bindEvent('#refine-weapon-btn', 'click', () => {
            const slot = this.selectedRefineSlot || 'weapon';
            this.equipmentSystem.refineEquipment(slot);
        });

        // 刷新装备属性按钮
        bindEvent('#refresh-equipment-btn', 'click', () => {
            const slot = this.selectedRefineSlot || 'weapon';
            this.equipmentSystem.previewRefreshStats(slot);
        });



        // 一键装备最好的装备按钮
        bindEvent('#auto-equip-btn', 'click', () => {
            this.equipmentSystem.autoEquipBestGear();
        });
        
        // 特殊技按钮
        bindEvent('#skill-0', 'click', () => {
            this.useSkill();
        });

        bindEvent('#skill-1', 'click', () => {
            this.useSkill();
        });

        bindEvent('#skill-2', 'click', () => {
            this.useSkill();
        });


        bindEvent('#skill-3', 'click', () => {
            this.useSkill();
        });

        bindEvent('#skill-4', 'click', () => {
            this.useSkill();
        });

        bindEvent('#skill-5', 'click', () => {
            this.useSkill();
        });

        // 商店购买按钮
        bindEvent('#buy-health-potion', 'click', () => {
            this.buyShopItem('health_potion');
        });
        
        bindEvent('#buy-energy-potion', 'click', () => {
            this.buyShopItem('energy_potion');
        });
        
        bindEvent('#buy-attack-potion', 'click', () => {
            this.buyShopItem('attack_potion');
        });
        
        bindEvent('#buy-defense-potion', 'click', () => {
            this.buyShopItem('defense_potion');
        });

        bindEvent('#buy-speed-potion', 'click', () => {
            this.buyShopItem('speed_potion');
        });

        bindEvent('#buy-luck-potion', 'click', () => {
            this.buyShopItem('luck_potion');
        });

        bindEvent('#buy-white-equipment-box', 'click', () => {
            this.buyShopItem('white_equipment_box');
        });
        
        // 注销账号按钮
        bindEvent('#delete-account-btn', 'click', () => {
            this.deleteAccount();
        });
        
        // 设置按钮下拉菜单
        bindEvent('#settings-btn', 'click', () => {
            console.log('点击设置按钮');
            const dropdown = document.getElementById('settings-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('hidden');
            }
        });
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', (e) => {
            const settingsBtn = document.getElementById('settings-btn');
            const dropdown = document.getElementById('settings-dropdown');
            if (settingsBtn && dropdown && !settingsBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
        
        // 刷新敌人按钮
        bindEvent('#refresh-enemy-btn', 'click', () => {
            // 不再随机切换地图，只刷新当前地图的敌人
            this.generateMiniMap();
            const currentMap = this.metadata.mapBackgrounds[this.gameState.currentBackgroundIndex];
            this.addBattleLog(`刷新了${currentMap ? currentMap.name : '当前地图'}的敌人！`);
            this.updateUI();
        });

        // 地图移动按钮
        bindEvent('#travel-map-btn', 'click', () => {
            this.showMapSelectionPanel();
        });
        
        // 初始化所有按钮的tooltip
        this.initTooltips();
        
        // 添加键盘事件监听器，控制3D人物移动和关闭模态窗口
        document.addEventListener('keydown', (e) => {
            // ESC键关闭战斗模态
            if (e.key === 'Escape') {
                const battleModal = document.getElementById('battle-modal');
                if (battleModal && !battleModal.classList.contains('hidden')) {
                    this.closeBattleModal();
                    //this.restoreUILayout();
                    return;
                }
            }
            this.handleKeyPress(e);
        });
        
        // 添加页面卸载时保存数据的事件监听器
        window.addEventListener('beforeunload', () => {
            this.saveGameState();
        });
        
        // 添加定期保存机制
        setInterval(() => {
            this.saveGameState();
        }, 60000); // 每60秒自动保存
        
    }
    




    // 隐藏敌人血条
    hideEnemyHealthBars() {
        if (!this.battle3D || !this.battle3D.enemies) return;

        // 隐藏所有预生成敌人的血条
        for (const enemy of this.battle3D.enemies) {
            if (enemy.active && enemy.healthBar) {
                enemy.healthBar.isVisible = false;
            }
        }

        // 隐藏当前战斗的敌人血条
        if (this.battle3D.enemyHealthBar) {
            this.battle3D.enemyHealthBar.isVisible = false;
        }

        // 隐藏Boss的灵力条
        if (this.battle3D.enemyEnergyBar) {
            this.battle3D.enemyEnergyBar.isVisible = false;
        }
    }    
    
    // 保存当前UI布局状态
    saveUILayout() {
        // 保存UI元素的显示状态（不保存人物属性卡片，因为它始终显示）
        this.uiState = {
            resourceGrid: document.querySelector('[class*="grid-cols-3"]') ? document.querySelector('[class*="grid-cols-3"]').style.display : 'grid',
            afkSection: document.querySelector('[class*="grid-cols-3"]') ? document.querySelector('[class*="grid-cols-3"]').style.display : 'grid'
        };
    }
    
    // 切换到战斗UI布局
    switchToBattleUILayout() {
        // 保留人物属性卡片显示
        // 隐藏资源栏和挂机区域
        const resourceBars = document.querySelector('[class*="grid-cols-3"]');
        if (resourceBars) {
            resourceBars.style.display = 'none';
        }
        
        // 调整3D战斗场景容器大小
        const battle3DContainer = document.getElementById('map-3d-container');
        if (battle3DContainer) {
            battle3DContainer.style.height = '600px';
            battle3DContainer.style.width = '100%';
        }
    }
    
    // 显示玩家被击败的动画（倒地效果）
    showPlayerDefeatedAnimation() {
        if (!this.battle3D || !this.battle3D.player) return;
        
        const player = this.battle3D.player;
        
        // 玩家倒地动画
        let animationProgress = 0;
        const animationDuration = 1000; // 动画持续时间（毫秒）
        const startTime = Date.now();
        const originalPosition = player.position.clone();
        const originalRotation = player.rotation.clone();
        
        const defeatAnimation = () => {
            const elapsed = Date.now() - startTime;
            animationProgress = Math.min(elapsed / animationDuration, 1);
            
            // 玩家逐渐倒下
            const fallProgress = animationProgress;
            
            // 位置：逐渐降低
            player.position.y = originalPosition.y - fallProgress * 1.5;
            
            // 旋转：逐渐向前倒下
            player.rotation.z = originalRotation.z + fallProgress * Math.PI / 2;
            
            if (animationProgress < 1) {
                requestAnimationFrame(defeatAnimation);
            }
        };
        
        defeatAnimation();
    }

    // 检查升级
    checkLevelUp() {
   
        if (this.gameState.player.exp >= this.gameState.player.maxExp) {
            const realm = this.gameState.player.realm;
            const currentRealmConfig = this.metadata.realmConfig[realm.currentRealm];
            const currentStageConfig = currentRealmConfig.stages[realm.currentStage - 1];
            
            // 检查是否达到当前阶段的等级上限
            if (realm.currentLevel < currentStageConfig.levelCap) {
                // 升级
                realm.currentLevel++;
                this.gameState.player.exp -= this.gameState.player.maxExp;
                this.gameState.player.maxExp = Math.floor(this.gameState.player.maxExp * 1.5);
                
                // 提升属性
                this.gameState.player.attack += 3;
                this.gameState.player.defense += 2;
                this.gameState.player.maxHp += 20;
                this.gameState.player.hp = this.gameState.player.maxHp;
                this.gameState.player.luck += 1;
                
                // 提升灵力上限
                this.gameState.player.maxEnergy += 10;
                this.gameState.player.energy = this.gameState.player.maxEnergy; // 升级时充满灵力
                
                // 提升资源产出率
                this.gameState.resources.spiritWoodRate += 0.2;
                this.gameState.resources.blackIronRate += 0.1;
                this.gameState.resources.spiritCrystalRate += 0.05;
                
                // 播放升级声音
                this.playSound('levelup-sound', 1, 2000);
                
                this.addBattleLog(`恭喜你升级到${realm.currentLevel}级！灵力上限提升了10点！`);
                
                // 触发升级动画
                this.triggerLevelUpAnimation();
                
                console.log('升级逻辑执行完成');
            } else {
                // 达到当前阶段等级上限，提示突破
                this.addBattleLog(`已达到${currentStageConfig.name}等级上限，需要突破到下一阶段！`);
                this.gameState.player.exp = this.gameState.player.maxExp; // 保持经验值不变
            }
        }
    }
    
    // 触发升级动画
    triggerLevelUpAnimation() {
        const levelElement = document.getElementById('level');
        levelElement.classList.add('level-up-animation');
        setTimeout(() => {
            levelElement.classList.remove('level-up-animation');
        }, 1000);
    }
    
    // 根据性别更新人物形象
    updateCharacterBodyImage() {
        const characterBodyElement = document.getElementById('character-body');
        if (characterBodyElement) {
            const timestamp = new Date().getTime();
            if (this.gameState.user.loggedIn && this.gameState.user.gender) {
                if (this.gameState.user.gender === '男') {
                    characterBodyElement.src = `Images/male-character-${this.gameState.player.realm.currentRealm + 1}.png?${timestamp}`;
                } else if (this.gameState.user.gender === '女') {
                    characterBodyElement.src = `Images/female-character-${this.gameState.player.realm.currentRealm + 1}.png?${timestamp}`;
                }
            }
        }
    }
    
    // 更新人物装备显示

    
    // 计算境界加成
    calculateRealmBonus() {
        const realm = this.gameState.player.realm;
        const currentRealmConfig = this.metadata.realmConfig[realm.currentRealm];
        const currentStageConfig = currentRealmConfig.stages[realm.currentStage - 1];
        
        // 基础加成（当前阶段）
        const baseBonus = currentStageConfig.bonus;
        
        // 累计加成（前面所有阶段）
        let totalBonus = { attack: 0, defense: 0, hp: 0, luck: 0 };
        
        // 计算当前境界之前所有境界的加成
        for (let i = 0; i < realm.currentRealm; i++) {
            const previousRealm = this.metadata.realmConfig[i];
            const maxStage = previousRealm.stages[previousRealm.stages.length - 1];
            totalBonus.attack += maxStage.bonus.attack;
            totalBonus.defense += maxStage.bonus.defense;
            totalBonus.hp += maxStage.bonus.hp;
            totalBonus.luck += maxStage.bonus.luck;
        }
        
        // 计算当前境界之前所有阶段的加成
        for (let i = 0; i < realm.currentStage - 1; i++) {
            const previousStage = currentRealmConfig.stages[i];
            totalBonus.attack += previousStage.bonus.attack;
            totalBonus.defense += previousStage.bonus.defense;
            totalBonus.hp += previousStage.bonus.hp;
            totalBonus.luck += previousStage.bonus.luck;
        }
        
        // 添加当前阶段的加成
        totalBonus.attack += baseBonus.attack;
        totalBonus.defense += baseBonus.defense;
        totalBonus.hp += baseBonus.hp;
        totalBonus.luck += baseBonus.luck;
        
        return totalBonus;
    }
    
    // 计算总等级（基于境界、阶段和当前等级）
    calculateTotalLevel() {
        const realm = this.gameState.player.realm;
        const realmConfig = this.metadata.realmConfig;

        // 累加之前所有境界的等级
        let totalLevel = 0;
        for (let i = 0; i < realm.currentRealm; i++) {
            const currentRealmConfig = realmConfig[i];
            if (currentRealmConfig && currentRealmConfig.stages) {
                for (const stage of currentRealmConfig.stages) {
                    totalLevel += stage.levelCap;
                }
            }
        }

        // 累加当前境界之前阶段的等级
        const currentRealmConfig = realmConfig[realm.currentRealm];
        if (currentRealmConfig && currentRealmConfig.stages) {
            for (let i = 0; i < realm.currentStage - 1; i++) {
                totalLevel += currentRealmConfig.stages[i].levelCap;
            }
        }

        // 加上当前阶段的当前等级
        totalLevel += realm.currentLevel;

        return totalLevel;
    }



    // 清理装备的colorClass属性

    
    // 获取突破所需突破石数量
    getRequiredBreakthroughStones(realmIndex, stage) {
        // 从realmConfig中获取突破石数量
        const realmConfig = this.metadata.realmConfig[realmIndex];
        const stageConfig = realmConfig.stages[stage - 1];
        return stageConfig.breakthroughStones;
    }

    // 尝试突破
    attemptBreakthrough() {
        const realm = this.gameState.player.realm;
        const currentRealmConfig = this.metadata.realmConfig[realm.currentRealm];
        const currentStageConfig = currentRealmConfig.stages[realm.currentStage - 1];
        
        // 检查等级是否达到上限
        if (realm.currentLevel < currentStageConfig.levelCap) {
            this.addBattleLog('等级未达到当前阶段上限，无法突破！');
            return false;
        }
        
        // 检查突破石是否足够
        const requiredStones = this.getRequiredBreakthroughStones(realm.currentRealm, realm.currentStage);
        if (this.gameState.resources.breakthroughStones < requiredStones) {
            this.addBattleLog('突破石不足，无法突破！');
            return false;
        }
        
        // 执行突破
        this.gameState.resources.breakthroughStones -= requiredStones;
        
        // 更新境界/阶段/等级
        if (realm.currentStage < 10) {
            // 同一境界内突破
            realm.currentStage++;
            realm.currentLevel = 1;
        } else {
            // 突破到下一个大境界
            if (realm.currentRealm < this.metadata.realmConfig.length - 1) {
                realm.currentRealm++;
                realm.currentStage = 1;
                realm.currentLevel = 1;
            } else {
                // 已达到最高境界
                this.addBattleLog('已达到最高境界，无法继续突破！');
                return false;
            }
        }
        
        // 发放突破奖励
        this.addBattleLog('突破成功！');
        this.updateCharacterBodyImage();
        this.updateUI();
        return true;
    }

    // ==================== 技能树系统 ====================

    // 打开技能树模态窗口
    openSkillTreeModal() {
        const modal = document.getElementById('skill-tree-modal');
        if (!modal) {
            console.error('技能树模态窗口未找到');
            return;
        }

        // 更新模态窗口信息
        this.updateSkillTreeModal();

        // 显示模态窗口
        modal.classList.remove('hidden');
    }

    // 关闭技能树模态窗口
    closeSkillTreeModal() {
        const modal = document.getElementById('skill-tree-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        // 隐藏技能详情面板
        const detailPanel = document.getElementById('skill-detail-panel');
        if (detailPanel) {
            detailPanel.classList.add('hidden');
        }
    }

    // 更新技能树模态窗口内容
    updateSkillTreeModal() {
        // 更新顶部信息
        const realmName = this.metadata.realmConfig?.[this.gameState.player.realm.currentRealm]?.name || '未知境界';
        document.getElementById('skill-tree-realm').textContent = realmName + '境';
        document.getElementById('skill-tree-energy').textContent =
            `${Math.floor(this.gameState.player.energy)}/${this.gameState.player.maxEnergy}`;

        // 生成境界Tabs
        this.generateRealmTabs();

        // 默认显示当前境界的技能树
        this.showRealmSkillTree(this.gameState.player.realm.currentRealm);
    }

    // 生成境界选择Tabs
    generateRealmTabs() {
        const tabsContainer = document.getElementById('skill-realm-tabs');
        if (!tabsContainer) return;

        tabsContainer.innerHTML = '';
        const currentRealm = this.gameState.player.realm.currentRealm;

        // 只显示当前已达到的境界
        this.metadata.realmConfig.forEach((realmConfig, realmIndex) => {
            if (realmIndex > currentRealm) return;

            const tab = document.createElement('button');
            tab.className = `px-4 py-2 border-b-2 transition-colors font-semibold text-sm ${
                realmIndex === currentRealm
                    ? 'border-purple text-purple'
                    : 'border-transparent text-light/50 hover:text-light/80'
            }`;
            tab.textContent = realmConfig.name + '境';
            tab.dataset.realm = realmIndex;

            tab.addEventListener('click', () => {
                this.showRealmSkillTree(realmIndex);
                // 更新tab样式
                tabsContainer.querySelectorAll('button').forEach(t => {
                    t.classList.remove('border-purple', 'text-purple');
                    t.classList.add('border-transparent', 'text-light/50');
                });
                tab.classList.remove('border-transparent', 'text-light/50');
                tab.classList.add('border-purple', 'text-purple');
            });

            tabsContainer.appendChild(tab);
        });
    }

    // 显示指定境界的技能树
    showRealmSkillTree(realmIndex) {
        const container = document.getElementById('skill-tree-container');
        if (!container) return;

        // 创建技能树可视化
        container.innerHTML = `
            <div class="relative w-full h-full">
                <!-- 背景图片 -->
                <div class="absolute inset-0 bg-gradient-radial from-purple/10 to-dark/50">
                    <img src="Images/skill-tree.jpg"
                         alt="技能树"
                         class="w-full h-full object-contain opacity-80"
                         onerror="this.style.display='none'">
                </div>

                <!-- 技能节点叠加层 -->
                <div id="skill-nodes-layer" class="absolute inset-0">
                    <!-- 节点将在这里动态生成 -->
                </div>
            </div>
        `;

        // 生成技能节点
        this.generateSkillNodes(realmIndex);
    }

    // 生成技能节点
    generateSkillNodes(realmIndex) {
        const nodesLayer = document.getElementById('skill-nodes-layer');
        if (!nodesLayer) return;

        // 获取该境界的所有技能树
        const realmSkillTrees = this.metadata.skillTrees.filter(tree => tree.realmRequired === realmIndex);

        // 按类型分配位置（四个方向）
        const positions = [
            { type: 'attack', x: '50%', y: '13%', label: '攻击技能' },
            { type: 'defense', x: '78%', y: '50%', label: '防御技能' },
            { type: 'recovery', x: '22%', y: '50%', label: '恢复技能' },
            { type: 'special', x: '50%', y: '86%', label: '特殊技能' }
        ];

        positions.forEach(pos => {
            const skillTree = realmSkillTrees.find(tree => tree.type === pos.type);
            if (!skillTree) return;

            const currentLevel = this.gameState.player.skills.levels?.[skillTree.id] || 0;
            const maxLevel = skillTree.levels.length;
            const isUnlocked = currentLevel > 0;
            const canUpgrade = this.canUpgradeSkill(skillTree, currentLevel);

            // 创建节点
            const node = document.createElement('div');
            node.className = `absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                isUnlocked ? 'skill-node-active' : 'skill-node-locked'
            } ${canUpgrade.canUpgrade ? 'skill-node-upgradeable' : ''}`;
            node.style.left = pos.x;
            node.style.top = pos.y;

            // 节点图标
            const iconColors = {
                'attack': '#f87171',
                'defense': '#fbbf24',
                'recovery': '#4ade80',
                'special': '#a78bfa'
            };

            node.innerHTML = `
                <div class="relative">
                    <!-- 外圈光环 -->
                    <div class="absolute inset-0 rounded-full ${isUnlocked ? 'animate-pulse' : ''}"
                         style="background: radial-gradient(circle, ${iconColors[pos.type]}40 0%, transparent 70%);
                                width: 120px; height: 120px; left: -12px; top: -12px;"></div>

                    <!-- 节点本体 -->
                    <div class="w-24 h-24 rounded-full border-4 flex items-center justify-center relative ${
                        isUnlocked
                            ? 'border-purple bg-purple/30'
                            : 'border-light/20 bg-dark/50'
                    } ${canUpgrade.canUpgrade ? 'ring-2 ring-yellow/50 ring-offset-2 ring-offset-dark' : ''}">
                        ${isUnlocked
                            ? `<img src="Images/skill-${skillTree.levels[currentLevel - 1]?.imageId || 1}.jpg"
                                    alt="${skillTree.name}"
                                    class="w-full h-full rounded-full object-cover"
                                    onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fa fa-magic text-4xl text-purple\\'></i>'">`
                            : `<i class="fa fa-lock text-3xl text-light/30"></i>`
                        }
                    </div>

                    <!-- 等级标签 -->
                    <div class="absolute left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-base font-bold shadow-lg z-10 ${
                        isUnlocked
                            ? 'bg-purple/90 text-white'
                            : 'bg-dark/90 text-light/50'
                    }" style="bottom: -28px;">
                        Lv.${currentLevel}/${maxLevel}
                    </div>

                    <!-- 升级提示 -->
                    ${canUpgrade.canUpgrade ? `
                        <div class="absolute -top-2 -right-2 w-8 h-8 bg-yellow rounded-full flex items-center justify-center animate-bounce">
                            <i class="fa fa-arrow-up text-base text-dark"></i>
                        </div>
                    ` : ''}
                </div>
            `;

            // 点击事件
            node.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showSkillDetail(skillTree, realmIndex, node);
            });

            nodesLayer.appendChild(node);
        });
    }

    // 显示技能详情面板
    showSkillDetail(skillTree, realmIndex, nodeElement) {
        const detailPanel = document.getElementById('skill-detail-panel');
        if (!detailPanel) return;

        const currentLevel = this.gameState.player.skills.levels?.[skillTree.id] || 0;
        const maxLevel = skillTree.levels.length;
        const currentSkill = currentLevel > 0 ? skillTree.levels[currentLevel - 1] : null;
        const nextSkill = currentLevel < maxLevel ? skillTree.levels[currentLevel] : null;
        const canUpgrade = this.canUpgradeSkill(skillTree, currentLevel);

        // 更新详情面板内容
        document.getElementById('skill-detail-name').textContent = skillTree.name;

        // 等级显示
        document.getElementById('skill-detail-level').textContent =
            currentLevel > 0 ? `Lv.${currentLevel}` : '未学习';

        document.getElementById('skill-detail-type').textContent =
            `${this.metadata.realmConfig[realmIndex].name}境 · ${
                skillTree.type === 'attack' ? '攻击技能' :
                skillTree.type === 'defense' ? '防御技能' :
                skillTree.type === 'recovery' ? '恢复技能' : '特殊技能'
            }`;

        document.getElementById('skill-detail-desc').textContent =
            currentSkill?.description || '未学习此技能';

        // 技能属性 - 改为紧凑的标签式显示
        const statsDiv = document.getElementById('skill-detail-stats');
        statsDiv.innerHTML = '';
        if (currentSkill) {
            const stats = [];

            if (currentSkill.damageMultiplier) {
                stats.push(`<span class="px-2 py-1 bg-red/20 text-red-200 rounded">伤害 ${currentSkill.damageMultiplier}x</span>`);
            }
            if (currentSkill.defenseBonus) {
                stats.push(`<span class="px-2 py-1 bg-blue/20 text-blue-200 rounded">减伤 ${Math.round(currentSkill.defenseBonus * 100)}%</span>`);
            }
            if (currentSkill.healPercentage) {
                stats.push(`<span class="px-2 py-1 bg-green/20 text-green-200 rounded">恢复 ${Math.round(currentSkill.healPercentage * 100)}%</span>`);
            }
            if (currentSkill.dodgeBonus) {
                stats.push(`<span class="px-2 py-1 bg-yellow/20 text-yellow-200 rounded">闪避 +${Math.round(currentSkill.dodgeBonus * 100)}%</span>`);
            }
            stats.push(`<span class="px-2 py-1 bg-purple/20 text-purple-200 rounded">消耗 ${currentSkill.energyCost}</span>`);

            statsDiv.innerHTML = stats.join('');
        }

        // 升级成本 - 更紧凑的显示
        const costDiv = document.getElementById('skill-upgrade-cost');
        if (nextSkill && canUpgrade.canUpgrade) {
            costDiv.innerHTML = `<span class="text-purple">${nextSkill.energyCost} 灵力</span>`;
        } else if (currentLevel >= maxLevel) {
            costDiv.innerHTML = '<span class="text-accent text-xs">已满级</span>';
        } else {
            costDiv.innerHTML = `<span class="text-red/60 text-xs">${canUpgrade.reason}</span>`;
        }

        // 升级按钮
        const upgradeBtn = document.getElementById('skill-upgrade-btn');
        upgradeBtn.disabled = !canUpgrade.canUpgrade;

        if (canUpgrade.canUpgrade) {
            upgradeBtn.className = 'px-4 py-1.5 bg-gradient-to-r from-purple/40 to-purple/60 hover:from-purple/50 hover:to-purple/70 text-white text-xs rounded-full transition-all font-semibold shadow-sm hover:shadow-md hover:shadow-purple/30';
            upgradeBtn.textContent = '升级';
        } else {
            upgradeBtn.className = 'px-4 py-1.5 bg-dark/50 text-light/40 text-xs rounded-full cursor-not-allowed';
            upgradeBtn.textContent = currentLevel >= maxLevel ? '已满级' : '无法升级';
        }

        // 移除旧的点击事件监听器
        const newUpgradeBtn = upgradeBtn.cloneNode(true);
        upgradeBtn.parentNode.replaceChild(newUpgradeBtn, upgradeBtn);

        // 添加新的点击事件
        if (canUpgrade.canUpgrade) {
            newUpgradeBtn.addEventListener('click', () => {
                this.upgradeSkill(skillTree.id);
                // 重新生成节点和更新详情
                this.generateSkillNodes(realmIndex);
                this.showSkillDetail(skillTree, realmIndex, nodeElement);
            });
        }

        // 显示详情内容
        const placeholder = document.getElementById('skill-detail-placeholder');
        const content = document.getElementById('skill-detail-content');

        if (placeholder) placeholder.classList.add('hidden');
        if (content) content.classList.remove('hidden');
    }

    // 检查是否可以升级技能
    canUpgradeSkill(skillTree, currentLevel) {
        const player = this.gameState.player;
        const nextSkill = skillTree.levels[currentLevel];

        // 检查是否满级
        if (currentLevel >= skillTree.levels.length) {
            return { canUpgrade: false, reason: '已满级' };
        }

        // 检查境界要求
        if (player.realm.currentRealm < skillTree.realmRequired) {
            return { canUpgrade: false, reason: '境界不足' };
        }

        // 检查阶段要求
        if (nextSkill.stageRequired && player.realm.currentStage < nextSkill.stageRequired) {
            const realmName = this.metadata.realmConfig[player.realm.currentRealm]?.stages[nextSkill.stageRequired - 1]?.name || nextSkill.stageRequired;
            return { canUpgrade: false, reason: `需要${realmName}阶段` };
        }

        // 检查灵力消耗
        if (player.energy < nextSkill.energyCost) {
            return { canUpgrade: false, reason: `灵力不足 (需要${nextSkill.energyCost})` };
        }

        return { canUpgrade: true, reason: '' };
    }

    // 升级技能
    upgradeSkill(skillTreeId) {
        if (!this.skillTreeSystem) {
            console.error('技能树系统未初始化');
            return false;
        }

        const success = this.skillTreeSystem.upgradeSkillTree(skillTreeId);

        if (success) {
            // 更新UI
            this.updateUI();
            this.addBattleLog('技能升级成功！');
        }

        return success;
    }

    // 根据稀有度和类型获取装备颜色

    // 切换自动战斗
    toggleAutoBattle() {
        this.gameState.settings.autoBattleSettings.enabled = !this.gameState.settings.autoBattleSettings.enabled;
        const btn = document.getElementById('auto-battle-btn');
        
        if (this.gameState.settings.autoBattleSettings.enabled) {
            btn.innerHTML = '<i class="fa fa-pause mr-1"></i> 停止自动战斗';
            btn.setAttribute('data-tooltip', '停止自动战斗');
            this.startAutoBattle();
        } else {
            btn.innerHTML = '<img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=auto%20battle%20button%20winter%20theme%20green%20crystal%20style%20clean%20minimal&image_size=square" alt="自动战斗" class="w-full h-full object-cover">';
            btn.setAttribute('data-tooltip', '自动进行战斗，消耗灵力');
            this.stopAutoBattle();
        }
    }
    
    // 切换自动收集资源
    toggleAutoCollect() {
        this.gameState.settings.autoCollectSettings.enabled = !this.gameState.settings.autoCollectSettings.enabled;
        const btn = document.getElementById('auto-collect-btn');
        
        if (this.gameState.settings.autoCollectSettings.enabled) {
            btn.innerHTML = '<i class="fa fa-pause mr-1"></i> 停止自动收集';
            btn.setAttribute('data-tooltip', '停止自动收集');
            this.startAutoCollect();
        } else {
            btn.innerHTML = '<img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=auto%20collect%20resources%20button%20winter%20theme%20blue%20crystal%20style%20clean%20minimal&image_size=square" alt="自动收集" class="w-full h-full object-cover">';
            btn.setAttribute('data-tooltip', '自动收集资源，消耗灵力');
            this.stopAutoCollect();
        }
    }
    
    // 更新自动战斗目标颜色
    updateAutoBattleTargetColors() {
        const targetColors = [];
        if (document.getElementById('auto-battle-green').checked) {
            targetColors.push('green');
        }
        if (document.getElementById('auto-battle-yellow').checked) {
            targetColors.push('yellow');
        }
        if (document.getElementById('auto-battle-red').checked) {
            targetColors.push('red');
        }
        this.gameState.settings.autoBattleSettings.targetColors = targetColors;
    }
    
    // 更新自动收集资源类型
    updateAutoCollectResourceTypes() {
        const resourceTypes = [];
        if (document.getElementById('auto-collect-spiritWood').checked) {
            resourceTypes.push('spiritWood');
        }
        if (document.getElementById('auto-collect-blackIron').checked) {
            resourceTypes.push('blackIron');
        }
        if (document.getElementById('auto-collect-spiritCrystal').checked) {
            resourceTypes.push('spiritCrystal');
        }
        this.gameState.settings.autoCollectSettings.resourceTypes = resourceTypes;
    }
    
    // 开始自动战斗
    startAutoBattle() {
        if (!this.timers.autoBattleTimer) {
            this.timers.autoBattleTimer = setInterval(() => {
                // 检查自动战斗是否启用
                if (this.gameState.settings.autoBattleSettings.enabled && this.gameState.player.energy >= 10) {
                    // 检查当前敌人是否符合目标颜色
                    const enemyPower = this.gameState.enemy.attack * 2 + this.gameState.enemy.defense * 1.5 + this.gameState.enemy.maxHp * 0.1;
                    const playerAttack = this.gameState.player.attack + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.attack : 0);
                    const playerDefense = this.gameState.player.defense + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.defense : 0);
                    const playerHp = this.gameState.player.maxHp + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.hp : 0);
                    const playerPower = playerAttack * 2 + playerDefense * 1.5 + playerHp * 0.1;
                    
                    let enemyColor = 'red'; // 默认红色
                    if (this.gameState.enemy.isBoss) {
                        enemyColor = 'purple';
                    } else if (this.gameState.enemy.isElite) {
                        enemyColor = 'yellow';
                    } else {
                        const powerRatio = enemyPower / playerPower;
                        if (powerRatio < 0.7) {
                            enemyColor = 'green';
                        } else if (powerRatio < 1.3) {
                            enemyColor = 'yellow';
                        } else {
                            enemyColor = 'red';
                        }
                    }
                    
                    // 检查当前敌人颜色是否在目标颜色列表中
                    if (this.gameState.settings.autoBattleSettings.targetColors.includes(enemyColor)) {
                        this.attackEnemy();
                    }
                }
            }, 1000);
        }
    }
    
    // 停止自动战斗
    stopAutoBattle() {
        if (this.timers.autoBattleTimer) {
            clearInterval(this.timers.autoBattleTimer);
            this.timers.autoBattleTimer = null;
        }
    }
    
    // 切换自动挂机
    toggleAutoPlay(enabled) {
        this.gameState.settings.autoPlay = enabled;
        
        if (enabled) {
            this.startAutoPlay();
            this.startAfkTimer();
        } else {
            this.stopAutoPlay();
            this.stopAfkTimer();
        }
    }
    
    // 开始自动收集资源
    startAutoCollect() {
        if (!this.timers.autoCollectTimer) {
            this.timers.autoCollectTimer = setInterval(() => {
                // 检查自动收集是否启用
                if (this.gameState.settings.autoCollectSettings.enabled) {
                    // 收集指定类型的资源
                    for (const resourceType of this.gameState.settings.autoCollectSettings.resourceTypes) {
                        if (this.gameState.player.energy >= 5) {
                            this.collectResource(resourceType);
                        }
                    }
                }
            }, 2000);
        }
    }
    
    // 停止自动收集资源
    stopAutoCollect() {
        if (this.timers.autoCollectTimer) {
            clearInterval(this.timers.autoCollectTimer);
            this.timers.autoCollectTimer = null;
        }
    }
    
    // 开始自动挂机
    startAutoPlay() {
        if (!this.timers.autoPlayTimer) {
            this.timers.autoPlayTimer = setInterval(() => {
                // 自动收集资源（如果启用）
                if (this.gameState.settings.autoCollectSettings.enabled) {
                    for (const resourceType of this.gameState.settings.autoCollectSettings.resourceTypes) {
                        if (this.gameState.player.energy >= 5) {
                            this.collectResource(resourceType);
                        }
                    }
                }
                
                // 自动战斗（如果启用）
                if (this.gameState.settings.autoBattleSettings.enabled && this.gameState.player.energy >= 10) {
                    // 检查当前敌人是否符合目标颜色
                    const enemyPower = this.gameState.enemy.attack * 2 + this.gameState.enemy.defense * 1.5 + this.gameState.enemy.maxHp * 0.1;
                    const playerAttack = this.gameState.player.attack + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.attack : 0);
                    const playerDefense = this.gameState.player.defense + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.defense : 0);
                    const playerHp = this.gameState.player.maxHp + (this.gameState.player.equipmentEffects ? this.gameState.player.equipmentEffects.hp : 0);
                    const playerPower = playerAttack * 2 + playerDefense * 1.5 + playerHp * 0.1;
                    
                    let enemyColor = 'red'; // 默认红色
                    if (this.gameState.enemy.isBoss) {
                        enemyColor = 'purple';
                    } else if (this.gameState.enemy.isElite) {
                        enemyColor = 'yellow';
                    } else {
                        const powerRatio = enemyPower / playerPower;
                        if (powerRatio < 0.7) {
                            enemyColor = 'green';
                        } else if (powerRatio < 1.3) {
                            enemyColor = 'yellow';
                        } else {
                            enemyColor = 'red';
                        }
                    }
                    
                    // 检查当前敌人颜色是否在目标颜色列表中
                    if (this.gameState.settings.autoBattleSettings.targetColors.includes(enemyColor)) {
                        this.attackEnemy();
                    }
                }
            }, 3000);
        }
    }
    
    // 停止自动挂机
    stopAutoPlay() {
        if (this.timers.autoPlayTimer) {
            clearInterval(this.timers.autoPlayTimer);
            this.timers.autoPlayTimer = null;
        }
        // 停止自动收集资源
        this.stopAutoCollect();
        // 停止自动战斗
        this.stopAutoBattle();
    }
    
    // 开始挂机计时器
    startAfkTimer() {
        if (!this.timers.afkTimer) {
            this.timers.afkTimer = setInterval(() => {
                this.gameState.settings.afkTime++;
                this.updateUI();
            }, 1000);
        }
    }
    
    // 停止挂机计时器
    stopAfkTimer() {
        if (this.timers.afkTimer) {
            clearInterval(this.timers.afkTimer);
            this.timers.afkTimer = null;
        }
    }
    
    // 收集资源
    collectResource(type) {
        if (this.gameState.player.energy < 5) {
            this.addBattleLog('灵力不足，无法收集资源！');
            return;
        }
        
        // 消耗灵力
        this.gameState.player.energy -= 5;
        
        // 显示进度条动画
        const progressBar = document.getElementById(`${type}-progress`);
        if (progressBar) {
            // 重置进度条
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
            
            // 触发重排
            void progressBar.offsetWidth;
            
            // 恢复过渡效果
            progressBar.style.transition = '';
            
            // 增加到100%
            progressBar.style.width = '100%';
            
            // 收集资源
            let amount = 0;
            const spiritWoodRate = this.gameState.resources.spiritWoodRate || 1;
            const blackIronRate = this.gameState.resources.blackIronRate || 0.5;
            const spiritCrystalRate = this.gameState.resources.spiritCrystalRate || 0.2;
            
            switch (type) {
                case 'spiritWood':
                    amount = Math.floor(spiritWoodRate * 10 + Math.random() * 5);
                    this.gameState.resources.spiritWood += amount;
                    break;
                case 'blackIron':
                    amount = Math.floor(blackIronRate * 10 + Math.random() * 3);
                    this.gameState.resources.blackIron += amount;
                    break;
                case 'spiritCrystal':
                    amount = Math.floor(spiritCrystalRate * 10 + Math.random() * 2);
                    this.gameState.resources.spiritCrystal += amount;
                    break;
            }
            
            this.gameState.settings.collectedResources += amount;
            this.addBattleLog(`收集了${amount}${type === 'spiritWood' ? '灵木' : type === 'blackIron' ? '玄铁' : '灵石'}！`);
            
            // 更新UI
            this.updateUI();
            
            // 等待动画完成后重置进度条
            setTimeout(() => {
                // 禁用过渡效果，瞬间重置进度条
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';
                
                // 恢复过渡效果，以便下次使用
                setTimeout(() => {
                    progressBar.style.transition = '';
                }, 100);
            }, 500); // 等待动画完成（与CSS transition duration一致）
        }
    }

    // 添加战斗日志
    addBattleLog(message) {
        // 确保battle对象存在
        if (!this.gameState.battle) {
            this.gameState.battle = {
                inBattle: false,
                battleLog: []
            };
        }
        // 确保battleLog数组存在
        if (!this.gameState.battle.battleLog) {
            this.gameState.battle.battleLog = [];
        }
        this.gameState.battle.battleLog.push(message);
        // 限制日志长度
        if (this.gameState.battle.battleLog.length > 10) {
            this.gameState.battle.battleLog.shift();
        }
    }

    // ==================== 模态框工具函数 ====================

    // 显示选择模态框
    showSelectionModal(title, description, items, onSelect) {
        const modal = document.getElementById('selection-modal');
        const titleElement = document.getElementById('selection-modal-title');
        const descElement = document.getElementById('selection-modal-description');
        const contentElement = document.getElementById('selection-modal-content');

        titleElement.textContent = title;
        descElement.textContent = description || '';

        // 清空内容
        contentElement.innerHTML = '';

        // 添加选项
        items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'bg-dark/50 hover:bg-dark/70 border border-glass/50 rounded-lg p-3 cursor-pointer transition-all flex items-center';
            itemElement.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-3 text-accent font-bold">
                    ${index + 1}
                </div>
                <div class="flex-1">
                    <div class="text-light font-medium">${item.name}</div>
                    <div class="text-light/60 text-sm">${item.description || ''}</div>
                </div>
                <i class="fa fa-chevron-right text-light/40"></i>
            `;
            itemElement.addEventListener('click', () => {
                this.hideSelectionModal();
                if (onSelect) onSelect(index);
            });
            contentElement.appendChild(itemElement);
        });

        // 显示模态框
        modal.classList.remove('hidden');

        // 绑定关闭事件
        document.getElementById('close-selection-modal').onclick = () => this.hideSelectionModal();
        document.getElementById('cancel-selection').onclick = () => this.hideSelectionModal();
    }

    // 隐藏选择模态框
    hideSelectionModal() {
        const modal = document.getElementById('selection-modal');
        modal.classList.add('hidden');
    }

    // 显示提示模态框
    showAlertModal(title, message, type = 'info') {
        const modal = document.getElementById('alert-modal');
        const titleElement = document.getElementById('alert-modal-title');
        const messageElement = document.getElementById('alert-modal-message');
        const iconElement = document.getElementById('alert-modal-icon');

        titleElement.textContent = title;
        messageElement.textContent = message;

        // 根据类型设置图标
        const icons = {
            info: 'fa-info-circle text-accent',
            warning: 'fa-exclamation-triangle text-warning',
            error: 'fa-times-circle text-danger',
            success: 'fa-check-circle text-success'
        };
        iconElement.className = `fa ${icons[type] || icons.info} text-2xl mr-3`;

        modal.classList.remove('hidden');

        // 绑定关闭事件
        document.getElementById('close-alert-modal').onclick = () => this.hideAlertModal();
    }

    // 隐藏提示模态框
    hideAlertModal() {
        const modal = document.getElementById('alert-modal');
        modal.classList.add('hidden');
    }

    // 显示获得装备的弹框
    showEquipmentObtainModal(equipment, boxName, callback) {
        // 移除已存在的模态框
        const existingModal = document.getElementById('equipment-obtain-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // 获取装备颜色
        const colorClass = this.equipmentSystem.getEquipmentColorClass(equipment);
        const borderColor = this.equipmentSystem.getEquipmentColor(equipment.rarity, 'color');

        // 获取装备属性描述
        const statsDesc = this.equipmentSystem.getStatsDescription(equipment.stats);

        // 装备类型名称
        const typeNames = {
            weapon: '武器',
            armor: '护甲',
            helmet: '头盔',
            boots: '靴子',
            pants: '裤子',
            accessory: '饰品'
        };
        const typeName = typeNames[equipment.type] || '装备';

        const modalHtml = `
            <div id="equipment-obtain-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div class="bg-dark border border-glass rounded-xl p-6 max-w-md w-full mx-4">
                    <h3 class="text-xl font-bold text-accent mb-4 text-center">
                        <i class="fa fa-gift mr-2"></i> ${boxName}
                    </h3>

                    <div class="bg-dark/50 rounded-lg p-4 mb-4 border-2" style="border-color: ${borderColor}">
                        <div class="text-center mb-3">
                            <div class="text-lg font-bold ${colorClass}">${equipment.name}</div>
                            <div class="text-sm text-light/60">${equipment.realmName || '等级' + equipment.level} · ${equipment.rarityDisplayName || '白色'}${typeName}</div>
                        </div>

                        <div class="text-sm text-light/80 text-center">
                            ${statsDesc || '无属性'}
                        </div>
                    </div>

                    <div class="text-center text-sm text-light/60 mb-4">
                        点击确认后将自动装备或放入背包
                    </div>

                    <button id="confirm-equipment-obtain" class="w-full bg-accent hover:bg-accent/80 rounded-lg px-4 py-2 text-white font-medium transition-all flex items-center justify-center">
                        <i class="fa fa-check mr-2"></i> 确认
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 绑定确认按钮事件
        document.getElementById('confirm-equipment-obtain').addEventListener('click', () => {
            // 移除模态框
            const modal = document.getElementById('equipment-obtain-modal');
            if (modal) {
                modal.remove();
            }
            // 执行回调
            if (callback) {
                callback(true);
            }
        });
    }

    // 更新战斗日志UI
    updateBattleLog() {
        const battleLogContainer = document.getElementById('battle-log');
        const battleLogElement = battleLogContainer.querySelector('div');
        battleLogElement.innerHTML = '';
        
        if (this.gameState.battle.battleLog.length === 0) {
            battleLogElement.innerHTML = '<p class="text-light/70">探索日志...</p>';
            return;
        }
        
        this.gameState.battle.battleLog.forEach(log => {
            const logElement = document.createElement('p');
            logElement.textContent = log;
            battleLogElement.appendChild(logElement);
        });
        
        // 滚动到底部
        battleLogElement.scrollTop = battleLogElement.scrollHeight;
    }
    

    // 加载游戏
    async loadGame() {
        try {
            // 保存用户信息
            const userInfo = { ...this.gameState.user };

            // 只从服务器加载
            if (this.gameState.user.loggedIn) {
                const serverGameState = await this.loadFromServer();
                if (serverGameState) {
                    if (serverGameState.success && serverGameState.gameState) {
                        this.addBattleLog('从服务器加载游戏成功！');
                        // 保留用户信息，只更新游戏的其他部分
                        const { user, ...gameData } = serverGameState.gameState;

                        // 补充缺失的资源属性
                        if (gameData.resources) {
                            gameData.resources.spiritWood = gameData.resources.spiritWood || 0;
                            gameData.resources.spiritWoodRate = gameData.resources.spiritWoodRate || 1;
                            gameData.resources.blackIron = gameData.resources.blackIron || 0;
                            gameData.resources.blackIronRate = gameData.resources.blackIronRate || 0.5;
                            gameData.resources.spiritCrystal = gameData.resources.spiritCrystal || 0;
                            gameData.resources.spiritCrystalRate = gameData.resources.spiritCrystalRate || 0.2;
                            gameData.resources.breakthroughStones = gameData.resources.breakthroughStones || 0;
                        }

                        this.gameState = { ...gameData, user: userInfo };

                        // 先加载 metadata（初始化需要从 metadata 读取配置）
                        await this.fetchGameMetadata();

                        // 检查是否是新玩家，需要初始化
                        if (this.gameState.player?.isNewPlayer) {
                            console.log('检测到新玩家，开始初始化游戏状态...');
                            this.initializeNewPlayer();
                            delete this.gameState.player.isNewPlayer; // 移除标记
                            this.saveGameState(); // 保存初始化后的状态
                        }

                        // 清理装备的colorClass属性
                        this.equipmentSystem.cleanupEquipmentColorClass();

                        // 检查临时状态是否过期
                        this.checkTemporaryStats();
                    } else {
                        // 如果token无效，重定向到登录页面
                        if (serverGameState.error === 'Invalid token' || serverGameState.error === 'No token provided') {
                            console.warn('Token无效，正在退出登录...');
                            this.logout();
                            return null;
                        }
                    }
                } else {
                    console.error('服务器端加载失败:', serverGameState.error);
                    this.logout();
                }
            } else {
                this.addBattleLog('访客模式无法加载游戏！');
                return null;
            }
        } catch (error) {
            this.addBattleLog('游戏加载失败！');
            console.error('加载游戏失败:', error);
        }
    }
    
    // 计算武器精炼所需材料

    

    

    
    // 保存游戏状态
    async saveGameState() {
        try {
            if (this.gameState.user.loggedIn) {
                const currentUserId = this.gameState.user.userId;
                // 只使用服务器端保存
                const token = localStorage.getItem('endlessWinterToken');

                const response = await fetch('http://localhost:3002/api/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ gameState: this.gameState })
                });
                
                const result = await response.json();
                if (!result.success) {
                    console.error('服务器端保存失败:', result.error);
                    // 如果token无效，重定向到登录页面
                    if (result.error === 'Invalid token' || result.error === 'No token provided') {
                        this.logout();
                    }
                }
            }
        } catch (error) {
            console.error('保存游戏状态失败:', error);
        }
    }
    
    // 从服务器加载
    async loadFromServer() {
        try {
            const token = localStorage.getItem('endlessWinterToken');
            
            const response = await fetch('http://localhost:3002/api/load', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            return await response.json();
            
        } catch (error) {
            console.error('服务器端加载出错:', error);
            return null;
        }
    }

    // 初始化新玩家
    initializeNewPlayer() {
        console.log('正在初始化新玩家数据...');

        // 1. 初始化玩家属性（从metadata）
        if (this.metadata.player?.initialStats) {
            Object.assign(this.gameState.player, this.metadata.player.initialStats);
        }

        // 2. 初始化资源
        if (this.metadata.resources?.types) {
            this.gameState.resources = {};
            this.metadata.resources.types.forEach(resource => {
                this.gameState.resources[resource.name] = resource.initialAmount || 0;
                this.gameState.resources[`${resource.name}Rate`] = resource.baseRate || 0;
            });
        }

        // 3. 初始化装备和背包
        this.gameState.player.equipment = {};
        this.gameState.player.equipmentEffects = {};
        this.gameState.player.inventory = {
            items: [],          // 装备和物品
            consumables: {},    // 消耗品
            waypoints: []       // 解锁的传送点
        };

        // 4. 初始化技能（使用新的技能树系统）
        if (this.metadata.skillTrees && this.skillTreeSystem) {
            this.skillTreeSystem.initializeDefaultSkillTrees();
        }

        // 5. 初始化设置（从metadata）
        if (this.metadata.player?.defaultSettings) {
            this.gameState.settings = JSON.parse(JSON.stringify(this.metadata.player.defaultSettings));
        }

        // 6. 初始化战斗状态
        if (this.metadata.player?.defaultBattleState) {
            this.gameState.battle = JSON.parse(JSON.stringify(this.metadata.player.defaultBattleState));
        }

        // 7. 计算初始装备效果
        this.equipmentSystem.calculateEquipmentEffects();

        // 8. 初始化地图状态
        this.gameState.currentBackgroundIndex = 0;
        this.gameState.sceneMonsters = [];

        console.log('新玩家初始化完成');
        this.addBattleLog('欢迎来到无尽寒冬的世界！');
    }

    // 显示合成菜单
    showCraftMenu() {
        // 直接打开背包，因为合成功能已经整合到背包中
        this.showInventory();
    }
    
    // 初始化合成界面
    initCraftInterface() {
        // 清空所有槽位
        const slots = document.querySelectorAll('[craft-data-slot]');
        slots.forEach(slot => {
            slot.innerHTML = '<div class="text-xs text-light/60">拖放装备</div>';
            slot.dataset.itemId = '';
        });
        
        // 清空结果槽位
        const resultSlot = document.getElementById('craft-result-slot');
        resultSlot.innerHTML = '<div class="text-xs text-light/60">合成结果</div>';
        
        // 重置成功率
        document.getElementById('craft-success-rate').textContent = '0%';
        
        // 禁用合成按钮
        const confirmCraftBtn = document.getElementById('confirm-craft');
        if (confirmCraftBtn) {
            confirmCraftBtn.disabled = true;
            confirmCraftBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        
        // 绑定拖放事件
        this.bindDragAndDrop();
    }
    
    // 绑定拖放事件
    bindDragAndDrop() {
        const inventoryItems = document.querySelectorAll('#inventory-equipment > div, #inventory-consumables > div');
        const craftSlots = document.querySelectorAll('[craft-data-slot]');
        
        // 为背包物品添加拖拽事件
        inventoryItems.forEach(itemElement => {
            itemElement.draggable = true;
            itemElement.addEventListener('dragstart', (e) => {
                const index = itemElement.dataset.index;
                e.dataTransfer.setData('text/plain', index);
            });
        });
        
        // 为合成槽位添加拖放事件
        craftSlots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('border-accent');
            });
            
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('border-accent');
            });
            
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('border-accent');
                const index = e.dataTransfer.getData('text/plain');
                this.dropItemToCraftSlot(index, slot);
            });
        });
    }
    
    // 处理物品拖放到合成槽位
    dropItemToCraftSlot(index, slot) {
        const inventory = this.gameState.player.inventory;
        const item = inventory[index];
        
        // 检查是否是装备
        if (!((item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || 
             item.type === 'helmet' || item.type === 'boots' || item.type === 'accessory') || 
            item.equipmentType)) {
            this.addBattleLog('只能合成装备！');
            return;
        }
        
        // 显示装备信息
        const itemType = item.equipmentType || item.type;
        const rarityColor = this.equipmentSystem.getRarityColor(item.rarity || 'white');

        slot.innerHTML = `
            <div class="text-xs ${rarityColor} text-center">
                <i class="fa ${this.equipmentSystem.getEquipmentIcon(itemType)}"></i><br>
                ${item.name}
            </div>
        `;
        
        slot.dataset.itemId = index;
        
        // 更新成功率
        this.updateCraftSuccessRate();
    }
    
    // 获取装备图标


    // 更新合成成功率
    updateCraftSuccessRate() {
        const slots = document.querySelectorAll('[craft-data-slot]');
        const items = [];
        const confirmCraftBtn = document.getElementById('confirm-craft');
        const rateElement = document.getElementById('craft-success-rate');

        // 收集所有放入槽位的物品
        slots.forEach(slot => {
            const itemId = slot.dataset.itemId;
            if (itemId) {
                const item = this.gameState.player.inventory[itemId];
                if (item) {
                    items.push(item);
                }
            }
        });

        // 检查是否有3个物品
        if (items.length !== 3) {
            rateElement.textContent = '需要3件装备';
            rateElement.title = '';
            // 禁用合成按钮
            if (confirmCraftBtn) {
                confirmCraftBtn.disabled = true;
                confirmCraftBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
            return;
        }

        // 检查物品是否相同类型、等级和品质
        const firstItem = items[0];
        const firstType = firstItem.equipmentType || firstItem.type;
        const firstLevel = firstItem.level || 1;
        const firstRarity = firstItem.rarity || 'white';

        let mismatchDetails = [];
        const isValid = items.every((item) => {
            const itemType = item.equipmentType || item.type;
            const itemLevel = item.level || 1;
            const itemRarity = item.rarity || 'white';

            if (itemType !== firstType) {
                mismatchDetails.push(`${item.name}: 类型(${itemType})`);
            }
            if (itemLevel !== firstLevel) {
                mismatchDetails.push(`${item.name}: 等级(${itemLevel})`);
            }
            if (itemRarity !== firstRarity) {
                mismatchDetails.push(`${item.name}: 品质(${itemRarity})`);
            }
            return itemType === firstType && itemLevel === firstLevel && itemRarity === firstRarity;
        });

        if (isValid) {
            // 计算成功率（根据品质）
            let successRate = 70; // 基础成功率

            switch (firstRarity) {
                case 'white':
                    successRate = 90;
                    break;
                case 'blue':
                    successRate = 80;
                    break;
                case 'purple':
                    successRate = 70;
                    break;
                case 'gold':
                    successRate = 60;
                    break;
                case 'rainbow':
                    successRate = 50;
                    break;
            }

            rateElement.textContent = `${successRate}%`;
            rateElement.title = '';
            // 启用合成按钮
            if (confirmCraftBtn) {
                confirmCraftBtn.disabled = false;
                confirmCraftBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        } else {
            rateElement.textContent = '条件不满足';
            rateElement.title = mismatchDetails.join('\n');
            // 禁用合成按钮
            if (confirmCraftBtn) {
                confirmCraftBtn.disabled = true;
                confirmCraftBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
    }
    
    // 执行合成
    performCraft(skipInventoryUpdate = false) {
        const slots = document.querySelectorAll('[craft-data-slot]');
        const itemIds = [];
        const items = [];
        
        // 收集所有放入槽位的物品
        slots.forEach(slot => {
            const itemId = slot.dataset.itemId;
            if (itemId) {
                itemIds.push(parseInt(itemId));
                const item = this.gameState.player.inventory[itemId];
                if (item) {
                    items.push(item);
                }
            }
        });
        
        // 检查是否有3个物品
        if (items.length !== 3) {
            this.addBattleLog('需要3个装备才能合成！');
            return;
        }

        // 检查物品是否相同类型、等级和品质
        const firstItem = items[0];
        const firstType = firstItem.equipmentType || firstItem.type;
        const firstLevel = firstItem.level || 1;
        const firstRarity = firstItem.rarity || 'white';

        let mismatchReason = '';
        const isValid = items.every((item) => {
            const itemType = item.equipmentType || item.type;
            const itemLevel = item.level || 1;
            const itemRarity = item.rarity || 'white';

            if (itemType !== firstType) {
                mismatchReason = `类型不匹配: ${items[0].name}(${firstType}) vs ${item.name}(${itemType})`;
                return false;
            }
            if (itemLevel !== firstLevel) {
                mismatchReason = `等级不匹配: ${items[0].name}(Lv.${firstLevel}) vs ${item.name}(Lv.${itemLevel})`;
                return false;
            }
            if (itemRarity !== firstRarity) {
                mismatchReason = `品质不匹配: ${items[0].name}(${firstRarity}) vs ${item.name}(${itemRarity})`;
                return false;
            }
            return true;
        });

        if (!isValid) {
            this.addBattleLog(`合成失败！${mismatchReason}`);
            return;
        }
        
        // 计算成功率
        let successRate = 70;
        switch (firstRarity) {
            case 'white':
                successRate = 90;
                break;
            case 'blue':
                successRate = 80;
                break;
            case 'purple':
                successRate = 70;
                break;
            case 'gold':
                successRate = 60;
                break;
            case 'rainbow':
                successRate = 50;
                break;
        }
        
        // 从背包中移除物品（从后往前移除，避免索引混乱）
        itemIds.sort((a, b) => b - a);
        itemIds.forEach(id => {
            this.gameState.player.inventory.splice(id, 1);
        });
        
        // 生成新装备
        const newRarity = this.getNextRarity(firstRarity);
        const newEquipment = this.equipmentSystem.generateEquipment(firstType, firstLevel, newRarity);
        
        // 合成结果
        const resultSlot = document.getElementById('craft-result-slot');
        
        if (Math.random() * 100 < successRate) {
            // 合成成功
            this.gameState.player.inventory.push(newEquipment);
            this.addBattleLog(`合成成功！获得了${newEquipment.rarityDisplayName} ${newEquipment.name}！`);
            
            // 播放合成成功声音
            const successSound = document.getElementById('craft-success-sound');
            if (successSound) {
                successSound.currentTime = 0;
                successSound.play();
                // 2秒后停止播放
                setTimeout(() => {
                    successSound.pause();
                    successSound.currentTime = 0;
                }, 2000);
            }
            
            // 显示合成成功动画，使用装备品质对应的颜色
            const newEquipmentColorClass = this.equipmentSystem.getEquipmentColorClass(newEquipment);
            resultSlot.innerHTML = `
                <div class="text-xs ${newEquipmentColorClass} text-center animate-pulse">
                    <i class="fa ${this.equipmentSystem.getEquipmentIcon(firstType)}"></i><br>
                    ${newEquipment.name}
                </div>
            `;
        } else {
            // 合成失败，返回一个原品质的装备
            const failedEquipment = this.equipmentSystem.generateEquipment(firstType, firstLevel, firstRarity);
            this.gameState.player.inventory.push(failedEquipment);
            this.addBattleLog(`合成失败！获得了${failedEquipment.rarityDisplayName} ${failedEquipment.name}！`);
            
            // 播放合成失败声音
            const failSound = document.getElementById('craft-fail-sound');
            if (failSound) {
                failSound.currentTime = 0;
                failSound.play();
                // 2秒后停止播放
                setTimeout(() => {
                    failSound.pause();
                    failSound.currentTime = 0;
                }, 2000);
            }
            
            // 显示合成失败动画，使用装备品质对应的颜色
            const failedEquipmentColorClass = this.equipmentSystem.getEquipmentColorClass(failedEquipment);
            resultSlot.innerHTML = `
                <div class="text-xs ${failedEquipmentColorClass} text-center animate-pulse">
                    <i class="fa ${this.equipmentSystem.getEquipmentIcon(firstType)}"></i><br>
                    ${failedEquipment.name}
                </div>
            `;
        }
        
        // 更新UI
        this.updateUI();
        
        // 3秒后重新显示背包，更新物品（如果不是一键合成模式）
        if (!skipInventoryUpdate) {
            setTimeout(() => {
                this.showInventory();
            }, 3000);
        }
    }
    
    // 获取下一个品质
    getNextRarity(rarity) {
        const rarityOrder = ['white', 'blue', 'purple', 'gold', 'rainbow'];
        const currentIndex = rarityOrder.indexOf(rarity);
        return rarityOrder[Math.min(currentIndex + 1, rarityOrder.length - 1)];
    }

    // 获取可用于合成的3件装备（公共方法）
    getCraftableEquipmentIndices(inventory) {
        // 按类型、等级、品质分组装备，排除正在穿戴的装备
        const equipmentGroups = {};
        inventory.forEach((item, index) => {
            // 检查装备是否正在穿戴
            const isEquipped = this.equipmentSystem.isEquipmentEquipped(item);
            if (isEquipped) {
                return; // 跳过正在穿戴的装备
            }

            if (item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' ||
                item.type === 'helmet' || item.type === 'boots' || item.type === 'accessory' ||
                item.equipmentType) {
                const type = item.equipmentType || item.type;
                const level = item.level || 1;
                const rarity = item.rarity || 'white';
                const key = `${type}_${level}_${rarity}`;

                if (!equipmentGroups[key]) {
                    equipmentGroups[key] = [];
                }
                equipmentGroups[key].push(index);
            }
        });

        // 找到有3个或以上相同类型、等级、品质装备的组
        for (const key in equipmentGroups) {
            if (equipmentGroups[key].length >= 3) {
                return equipmentGroups[key].slice(0, 3);
            }
        }

        return null;
    }

    // 一键添加装备到合成槽
    autoAddToCraftSlots() {
        const inventory = this.gameState.player.inventory;
        const craftSlots = document.querySelectorAll('[craft-data-slot]');

        // 清空现有槽位
        craftSlots.forEach(slot => {
            slot.innerHTML = '<div class="text-xs text-light/60">拖放装备</div>';
        });

        // 使用公共方法获取符合条件的3件装备
        const selectedIndices = this.getCraftableEquipmentIndices(inventory);

        if (!selectedIndices) {
            this.addBattleLog('没有找到符合条件的3件装备（相同类型、等级、品质且未穿戴）！');
            return;
        }

        // 添加到槽位
        for (let i = 0; i < selectedIndices.length; i++) {
            const index = selectedIndices[i];
            const slot = craftSlots[i];
            const item = inventory[index];
            const itemType = item.equipmentType || item.type;
            const rarityColor = this.equipmentSystem.getRarityColor(item.rarity || 'white');

            if (slot) {
                slot.innerHTML = `
                    <div class="text-xs ${rarityColor} text-center">
                        <i class="fa ${this.equipmentSystem.getEquipmentIcon(itemType)}"></i><br>
                        ${item.name}
                    </div>
                `;
                slot.dataset.itemId = index;
            }
        }

        // 更新成功率
        this.updateCraftSuccessRate();

        this.addBattleLog(`已添加3件装备到合成槽！`);
    }


    // 一键合成相关变量
    isAutoCrafting = false;
    autoCraftInterval = null;
    
    // 一键合成功能
    async autoCraft() {
        // 检查是否已经在进行一键合成
        if (this.isAutoCrafting) {
            return;
        }
        
        this.isAutoCrafting = true;
        let craftedCount = 0;
        
        // 添加停止按钮
        const autoCraftBtn = document.getElementById('auto-craft');
        if (autoCraftBtn) {
            autoCraftBtn.innerHTML = '<i class="fa fa-stop"></i> 停止合成';
            autoCraftBtn.onclick = () => this.stopAutoCraft();
        }
        
        try {
            // 循环合成，直到没有可合成的装备为止
            while (this.isAutoCrafting) {
                const craftSlots = document.querySelectorAll('[craft-data-slot]');
                const currentInventory = this.gameState.player.inventory || [];

                // 清空所有合成槽位
                craftSlots.forEach(slot => {
                    slot.innerHTML = '<div class="text-xs text-light/60">拖放装备</div>';
                    slot.dataset.itemId = '';
                });

                // 使用公共方法获取符合条件的3件装备
                const indices = this.getCraftableEquipmentIndices(currentInventory);

                if (!indices) {
                    break; // 没有可合成的装备
                }

                // 动态显示装备放入圆圈（每个间隔200ms）
                for (let i = 0; i < indices.length; i++) {
                    if (!this.isAutoCrafting) break;

                    const index = indices[i];
                    const slot = craftSlots[i];
                    const item = currentInventory[index];
                    const itemType = item.equipmentType || item.type;
                    const rarityColor = this.equipmentSystem.getRarityColor(item.rarity || 'white');

                    // 确保槽位存在
                    if (slot) {
                        slot.innerHTML = `
                            <div class="text-xs ${rarityColor} text-center">
                                <i class="fa ${this.equipmentSystem.getEquipmentIcon(itemType)}"></i><br>
                                ${item.name}
                            </div>
                        `;
                        slot.dataset.itemId = index;
                    }

                    // 等待200ms
                    await new Promise(resolve => setTimeout(resolve, 200));
                }

                if (!this.isAutoCrafting) break;

                // 更新成功率
                this.updateCraftSuccessRate();

                // 等待500ms
                await new Promise(resolve => setTimeout(resolve, 500));

                if (!this.isAutoCrafting) break;

                // 执行合成，跳过背包更新
                this.performCraft(true);
                craftedCount++;

                // 等待2秒后进行下一次合成，给用户足够时间看到合成结果
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            if (craftedCount > 0) {
                this.addBattleLog(`一键合成完成！共合成了${craftedCount}次装备。`);
            } else {
                this.addBattleLog('没有足够的装备进行合成！');
            }
        } finally {
            // 恢复一键合成按钮
            if (autoCraftBtn) {
                autoCraftBtn.innerHTML = '<i class="fa fa-magic"></i> 一键合成';
                autoCraftBtn.onclick = () => this.autoCraft();
            }
            this.isAutoCrafting = false;
            
            // 一键合成完成后更新背包显示
            setTimeout(() => {
                this.showInventory();
            }, 1000);
        }
    }
    
    // 停止一键合成
    stopAutoCraft() {
        this.isAutoCrafting = false;
        const autoCraftBtn = document.getElementById('auto-craft');
        if (autoCraftBtn) {
            autoCraftBtn.innerHTML = '<i class="fa fa-magic"></i> 一键合成';
            autoCraftBtn.onclick = () => this.autoCraft();
        }
        this.addBattleLog('一键合成已停止！');
    }
    
    // 检查装备是否正在穿戴

    // 检查可合成的装备
    checkCraftableEquipment() {
        const inventory = this.gameState.player.inventory || [];
        const equipmentByTypeLevelRarity = {};
        
        // 按类型、等级和品质分组装备
        inventory.forEach(item => {
            // 检查是否是装备类型
            if ((item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || 
                 item.type === 'helmet' || item.type === 'boots' || item.type === 'accessory') || 
                item.equipmentType) {
                const equipmentType = item.equipmentType || item.type;
                const level = item.level || 1;
                const rarity = item.rarity || 'white';
                const key = `${equipmentType}_${level}_${rarity}`;
                
                if (!equipmentByTypeLevelRarity[key]) {
                    equipmentByTypeLevelRarity[key] = {
                        type: equipmentType,
                        level: level,
                        rarity: rarity,
                        items: [],
                        typeName: this.getEquipmentTypeName(equipmentType)
                    };
                }
                
                equipmentByTypeLevelRarity[key].items.push(item);
            }
        });
        
        // 筛选出有至少3个同类型、同等级、同品质装备的组合
        return Object.values(equipmentByTypeLevelRarity).filter(craftable => {
            return craftable.items.length >= 3;
        });
    }
    
    // 获取装备类型的中文名称
    getEquipmentTypeName(type) {
        const typeNames = {
            weapon: '武器',
            armor: '护甲',
            helmet: '头盔',
            boots: '靴子',
            accessory: '饰品'
        };
        return typeNames[type] || type;
    }
    
    // 获取品质的中文名称
    getRarityDisplayName(rarity) {
        const rarityNames = {
            white: '',
            blue: '蓝色',
            purple: '紫色',
            gold: '金色',
            rainbow: '彩色'
        };
        return rarityNames[rarity] || '';
    }
    
    // 合成装备
    craftEquipment(craftable) {
        // 从背包中取出3个装备
        const inventory = this.gameState.player.inventory;
        const itemsToRemove = [];
        const originalItems = [];
        
        for (let i = 0; i < inventory.length && itemsToRemove.length < 3; i++) {
            const item = inventory[i];
            if ((item.type === 'equipment' || item.equipmentType) && 
                (item.equipmentType || item.type) === craftable.type && 
                (item.level || 1) === craftable.level &&
                (item.rarity || 'white') === craftable.rarity) {
                itemsToRemove.push(i);
                originalItems.push(item);
            }
        }
        
        // 移除选中的装备（从后往前移除，避免索引混乱）
        itemsToRemove.reverse().forEach(index => {
            inventory.splice(index, 1);
        });
        
        // 确定合成后的品质（根据原始装备品质升级）
        const baseRarity = craftable.rarity || 'white';
        const newRarity = this.getNextRarity(baseRarity);
        
        // 检查合成是否成功
        const success = this.checkCraftSuccess(baseRarity);
        
        if (success) {
            // 合成成功：生成新装备（同等级，更高品质）
            const newEquipment = this.generateCraftedEquipment(craftable.type, craftable.level, newRarity);
            
            // 检查并自动穿戴更好的装备
            const equipped = this.checkAndEquipBetterGear(newEquipment);
            if (!equipped) {
                // 将新装备添加到背包
                inventory.push(newEquipment);
                this.addBattleLog(`成功合成${craftable.typeName}！`);
                this.addBattleLog(`消耗了3个${craftable.level}级${this.getRarityDisplayName(baseRarity)}${craftable.typeName}，获得了1个${craftable.level}级${this.getRarityDisplayName(newRarity)}${newEquipment.name}，已放入背包！`);
            } else {
                this.addBattleLog(`成功合成${craftable.typeName}！`);
                this.addBattleLog(`消耗了3个${craftable.level}级${this.getRarityDisplayName(baseRarity)}${craftable.typeName}，获得了1个${craftable.level}级${this.getRarityDisplayName(newRarity)}${newEquipment.name}，属性更好，已自动装备！`);
            }
        } else {
            // 合成失败：返还一个原品质的装备
            const failedEquipment = this.generateCraftedEquipment(craftable.type, craftable.level, baseRarity);
            inventory.push(failedEquipment);
            this.addBattleLog(`合成${craftable.typeName}失败！`);
            this.addBattleLog(`消耗了3个${craftable.level}级${this.getRarityDisplayName(baseRarity)}${craftable.typeName}，只获得了1个${craftable.level}级${this.getRarityDisplayName(baseRarity)}${failedEquipment.name}！`);
        }
        
    }
    
    // 自动合成装备

    

    
    // 计算合成装备属性的公共函数（用于合成装备，随机选择属性）
    calculateCraftedEquipmentStats(template, level, rarityInfo) {
        // 计算属性（基础属性 * 等级 * 品质倍数）
        const stats = {};

        // 获取该品质的属性数量
        const statCount = rarityInfo.statCount || 3;

        // 获取所有基础属性的键
        const statKeys = Object.keys(template.baseStats);

        // 随机选择指定数量的属性
        const selectedStats = [];
        const tempKeys = [...statKeys];

        for (let i = 0; i < statCount && tempKeys.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * tempKeys.length);
            selectedStats.push(tempKeys.splice(randomIndex, 1)[0]);
        }

        // 为选中的属性计算值
        for (const stat of selectedStats) {
            let value = template.baseStats[stat] * level * rarityInfo.multiplier;

            // 为基础属性较低的装备类型增加额外系数
            if (template.type === 'boots') {
                // 靴子基础属性较低，增加额外系数
                value *= 1.5;
            }

            // 使用Math.max确保最低属性值
            const minValue = level; // 最低值至少为装备等级
            stats[stat] = Math.max(minValue, Math.floor(value));
        }

        return stats;
    }

    // 生成合成后的装备
    generateCraftedEquipment(type, level, rarity) {
        // 装备模板
        const template = this.metadata.equipmentTemplates.find(t => t.type === type);
        if (!template) {
            return null;
        }

        // 使用指定的品质
        const rarityInfo = this.metadata.equipmentRarities.find(r => r.name === rarity);

        // 使用公共函数计算装备属性
        const stats = this.calculateCraftedEquipmentStats(template, level, rarityInfo);
        
        // 生成装备名称
        const prefixIndex = Math.floor(Math.random() * template.namePrefixes.length);
        const suffixIndex = Math.floor(Math.random() * template.nameSuffixes.length);
        const name = template.namePrefixes[prefixIndex] + template.nameSuffixes[suffixIndex];
        
        // 创建装备对象
        return {
            id: `${type}_${level}_${Date.now()}`,
            name: name,
            type: type,
            equipmentType: type,
            level: level,
            stats: stats,
            rarity: rarity,
            rarityDisplayName: rarityInfo.displayName,
            rarityMultiplier: rarityInfo.multiplier,
            refineLevel: 0
        };
    }
    
    // 获取下一个品质（固定升级路径）
    getNextRarity(currentRarity) {
        const rarityOrder = ['white', 'blue', 'purple', 'gold', 'rainbow'];
        const currentIndex = rarityOrder.indexOf(currentRarity);
        
        if (currentIndex < rarityOrder.length - 1) {
            return rarityOrder[currentIndex + 1];
        }
        
        // 已经是最高品质，返回当前品质
        return currentRarity;
    }
    
    // 检查合成是否成功
    checkCraftSuccess(currentRarity) {
        const successRates = {
            white: 1.0,    // 白色到蓝色：100%成功
            blue: 0.8,     // 蓝色到紫色：80%成功
            purple: 0.6,   // 紫色到黄金：60%成功
            gold: 0.4,     // 黄金到彩色：40%成功
            rainbow: 1.0   // 彩色已经是最高品质，返回当前品质
        };

        const successRate = successRates[currentRarity] || 1.0;
        return Math.random() < successRate;
    }
    
    // 登出
    async logout() {
        try {
            // 保存当前用户的游戏状态到服务器
            if (this.gameState.user.loggedIn) {
                const currentUserId = this.gameState.user.userId;
                await this.saveToServer(currentUserId, this.gameState);
            }
            
            // 调用服务器端登出API
            const token = localStorage.getItem('endlessWinterToken');
            if (token) {
                await fetch('http://localhost:3002/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            
            // 清除localStorage中的token和用户信息
            localStorage.removeItem('endlessWinterToken');
            localStorage.removeItem('endlessWinterUser');
            
            // 立即重定向到登录页面，添加logout参数以触发强制清除
            // 使用 replace 方法避免浏览器历史记录问题
            setTimeout(() => {
                // 使用 replace 方法确保不会回到已登录状态，并添加logout参数
                window.location.replace('login.html?logout=true');
            }, 100);
        } catch (error) {
            console.error('登出错误:', error);
            // 即使出错，也要清除本地存储并重定向到登录页面
            localStorage.removeItem('endlessWinterToken');
            localStorage.removeItem('endlessWinterUser');
            window.location.replace('login.html?logout=true');
        }
    }
    
    // 注销用户
    async deleteAccount() {
        try {
            const username = this.gameState.user.username;
            const self = this; // 保存this引用

            // 创建密码输入模态框
            const modalHtml = `
                <div id="password-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div class="bg-dark border border-glass rounded-xl p-6 max-w-md w-full">
                        <h3 class="text-xl font-bold text-accent mb-4">确认注销账号</h3>
                        <p class="text-light mb-4">请输入密码以确认注销账号：</p>
                        <div class="mb-4">
                            <input type="password" id="delete-password" class="w-full bg-dark/50 border border-glass rounded-lg px-4 py-2 text-light focus:outline-none">
                        </div>
                        <div class="flex space-x-3">
                            <button id="cancel-delete" class="flex-1 bg-dark border border-glass rounded-lg px-4 py-2 text-light hover:bg-dark/80 flex items-center justify-center">
                                <i class="fa fa-times mr-2"></i>取消
                            </button>
                            <button id="confirm-delete" class="flex-1 bg-danger rounded-lg px-4 py-2 text-white hover:bg-danger/80 flex items-center justify-center">
                                <i class="fa fa-trash mr-2"></i>确认注销
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // 添加模态框到页面
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // 获取模态框元素
            const modal = document.getElementById('password-modal');
            const passwordInput = document.getElementById('delete-password');
            const cancelBtn = document.getElementById('cancel-delete');
            const confirmBtn = document.getElementById('confirm-delete');

            // 聚焦密码输入框
            passwordInput.focus();

            // 回车键确认
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                }
            });

            // 取消按钮点击事件
            cancelBtn.addEventListener('click', function() {
                modal.remove();
            });

            // 确认按钮点击事件
            confirmBtn.addEventListener('click', async function() {
                const password = passwordInput.value;

                if (!password) {
                    self.showAlertModal('提示', '请输入密码', 'warning');
                    return;
                }

                const token = localStorage.getItem('endlessWinterToken');

                try {
                    const response = await fetch('http://localhost:3002/api/delete-account', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ username, password })
                    });

                    const result = await response.json();
                    modal.remove();

                    if (result.success) {
                        self.addBattleLog('账号注销成功！');
                        // 清除本地存储的token和用户信息
                        localStorage.removeItem('endlessWinterToken');
                        localStorage.removeItem('endlessWinterUser');
                        // 重定向到登录页面
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 2000);
                    } else {
                        self.addBattleLog(`注销失败：${result.error}`);
                    }
                } catch (error) {
                    console.error('注销用户失败:', error);
                    self.addBattleLog('注销用户失败，请稍后再试');
                    modal.remove();
                }
            });
        } catch (error) {
            console.error('注销用户失败:', error);
            this.addBattleLog('注销用户失败，请稍后再试');
        }
    }

    // 计算装备效果

    
    // 显示装备菜单
    showEquipMenu() {
        // 确保背包存在
        if (!this.gameState.player.inventory) {
            this.gameState.player.inventory = [];
        }

        // 过滤背包中可用的装备（玩家等级 >= 装备等级）
        const availableEquipment = this.gameState.player.inventory.filter(
            item => item.level <= this.calculateTotalLevel()
        );

        if (availableEquipment.length === 0) {
            this.showAlertModal('提示', '背包中没有可用的装备！', 'warning');
            return;
        }

        // 创建选项列表
        const items = availableEquipment.map(item => ({
            name: item.name,
            description: `${item.type} | 等级: ${item.level} | ${this.equipmentSystem.getStatsDescription(item.stats)}`
        }));

        // 显示选择模态框
        this.showSelectionModal('选择要装备的物品', '点击选择要装备的物品', items, (index) => {
            const selectedItem = availableEquipment[index];
            // 从背包中移除装备
            const inventoryIndex = this.gameState.player.inventory.indexOf(selectedItem);
            if (inventoryIndex > -1) {
                this.gameState.player.inventory.splice(inventoryIndex, 1);
            }
            // 装备物品
            this.equipItem(selectedItem);
        });
    }

    // 显示卸下装备菜单
    showUnequipMenu() {
        // 获取已装备的物品
        const equippedItems = [];
        for (const slot in this.gameState.player.equipment) {
            const item = this.gameState.player.equipment[slot];
            if (item) {
                equippedItems.push({ ...item, slot });
            }
        }

        if (equippedItems.length === 0) {
            this.showAlertModal('提示', '没有已装备的物品！', 'warning');
            return;
        }

        // 创建选项列表
        const items = equippedItems.map(item => ({
            name: item.name,
            description: `${item.slot} | ${this.equipmentSystem.getStatsDescription(item.stats)}`
        }));

        // 显示选择模态框
        this.showSelectionModal('选择要卸下的物品', '点击选择要卸下的物品', items, (index) => {
            this.unequipItem(equippedItems[index].slot);
        });
    }
    
    // 装备物品
    equipItem(item) {
        // 检查是否已有同类型装备
        const existingItem = this.gameState.player.equipment[item.type];
        
        // 装备新物品
        this.gameState.player.equipment[item.type] = item;
        
        // 如果有旧装备，将其放回背包
        if (existingItem) {
            // 确保背包存在
            if (!this.gameState.player.inventory) {
                this.gameState.player.inventory = [];
            }
            // 将旧装备放回背包
            this.gameState.player.inventory.push(existingItem);
        }
        
        // 计算装备效果
        this.equipmentSystem.calculateEquipmentEffects();
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        if (typeof this.updateHealthBars === 'function') {
            this.updateHealthBars();
        }
        
        // 添加日志
        if (existingItem) {
            this.addBattleLog(`卸下了 ${existingItem.name}，装备了 ${item.name}！`);
        } else {
            this.addBattleLog(`装备了 ${item.name}！`);
        }
    }
    
    // 卸下物品
    unequipItem(slot) {
        const item = this.gameState.player.equipment[slot];
        if (item) {
            // 卸下物品
            this.gameState.player.equipment[slot] = null;
            
            // 将卸下的装备放回背包
            this.gameState.player.inventory.push(item);
            
            // 计算装备效果
            this.equipmentSystem.calculateEquipmentEffects();
            
            // 更新UI
            this.updateUI();
            
            // 添加日志
            this.addBattleLog(`卸下了 ${item.name}，已放回背包！`);
        }
    }
    
    // 比较装备好坏
    compareEquipment(newItem, currentItem) {
        if (!currentItem) {
            // 当前没有装备，新装备更好
            return true;
        }
        
        // 计算装备评分
        const calculateScore = (item) => {
            let score = 0;
            if (item.stats) {
                // 权重设置
                const weights = {
                    attack: 2,     // 攻击权重最高
                    defense: 1.5,  // 防御次之
                    hp: 0.5,       // 生命值次之
                    luck: 1        // 幸运值
                };
                
                for (const stat in item.stats) {
                    if (weights[stat]) {
                        score += item.stats[stat] * weights[stat];
                    }
                }
            }
            // 考虑装备品质加成
            if (item.rarityMultiplier) {
                score *= item.rarityMultiplier;
            }
            return score;
        };
        
        const newScore = calculateScore(newItem);
        const currentScore = calculateScore(currentItem);
        
        return newScore > currentScore;
    }
    
    // 检查并自动穿戴更好的装备
    checkAndEquipBetterGear(item) {
        // 检查当前是否有同类型装备
        const currentItem = this.gameState.player.equipment[item.type];
        
        // 比较装备好坏
        if (this.compareEquipment(item, currentItem)) {
            // 从背包中移除新装备
            const inventoryIndex = this.gameState.player.inventory.indexOf(item);
            if (inventoryIndex > -1) {
                this.gameState.player.inventory.splice(inventoryIndex, 1);
            }
            
            // 装备新物品
            this.equipItem(item);
            
            return true;
        }
        
        return false;
    }
    
    // 购买商店物品
    buyShopItem(itemId) {
        const item = this.metadata.shop.items.find(item => item.id === itemId);
        
        if (!item) {
            this.addBattleLog('无效的商品！');
            return;
        }
        
        // 检查灵木是否足够
        if (this.gameState.resources.spiritWood < item.price) {
            this.addBattleLog(`灵木不足，无法购买 ${item.name}！`);
            return;
        }
        
        // 扣除灵木
        this.gameState.resources.spiritWood -= item.price;
        
        if (item.type === 'consumable') {
            // 药水类物品放入背包
            this.gameState.player.inventory.push(item);
            this.addBattleLog(`购买了 ${item.name}，已放入背包！`);
        } else if (item.type === 'random_equipment') {
            // 随机装备箱：根据玩家境界生成随机白色装备
            const realm = this.gameState.player.realm;
            const equipmentLevel = realm.currentRealm + 1;

            // 随机选择装备类型
            const types = ['weapon', 'armor', 'helmet', 'boots', 'pants', 'accessory'];
            const randomType = types[Math.floor(Math.random() * types.length)];

            // 使用装备系统生成随机装备
            const equipment = this.equipmentSystem.generateEquipment(
                randomType,
                equipmentLevel,
                item.rarity || 'white'
            );

            // 显示获得装备的弹框
            this.showEquipmentObtainModal(equipment, item.name, (confirmed) => {
                // 检查并自动穿戴更好的装备
                const equipped = this.checkAndEquipBetterGear(equipment);
                if (!equipped) {
                    this.gameState.player.inventory.push(equipment);
                    this.addBattleLog(`${equipment.name} 已放入背包！`);
                } else {
                    this.addBattleLog(`${equipment.name} 属性更好，已自动装备！`);
                }

                // 更新UI
                this.updateUI();

                // 更新血条显示
                if (typeof this.updateHealthBars === 'function') {
                    this.updateHealthBars();
                }
            });
            return; // 提前返回，UI更新在回调中处理
        } else if (item.type === 'equipment') {
            // 固定装备类物品（保留兼容性）
            const equipment = {
                id: item.id,
                name: item.name,
                type: item.equipmentType,
                equipmentType: item.equipmentType,
                level: item.level,
                stats: item.stats,
                description: item.description,
                rarity: 'white',
            rarityDisplayName: '白色',
            rarityMultiplier: 1
            };

            // 检查并自动穿戴更好的装备
            const equipped = this.checkAndEquipBetterGear(equipment);
            if (!equipped) {
                this.gameState.player.inventory.push(equipment);
                this.addBattleLog(`购买了 ${item.name}，已放入背包！`);
            } else {
                this.addBattleLog(`购买了 ${item.name}，属性更好，已自动装备！`);
            }
        }
        
        // 更新UI
        this.updateUI();
        
        // 更新血条显示
        if (typeof this.updateHealthBars === 'function') {
            this.updateHealthBars();
        }
    }
    
    // 重置临时状态
    resetTemporaryStats() {
        // 重置临时攻击和防御状态
        if (this.gameState.player) {
            // 移除临时状态属性
            delete this.gameState.player.baseAttack;
            delete this.gameState.player.baseDefense;
            delete this.gameState.player.baseSpeed;
            delete this.gameState.player.baseLuck;
            delete this.gameState.player.tempAttack;
            delete this.gameState.player.tempDefense;
            delete this.gameState.player.tempSpeed;
            delete this.gameState.player.tempLuck;
            delete this.gameState.player.tempAttackExpires;
            delete this.gameState.player.tempDefenseExpires;
            delete this.gameState.player.tempSpeedExpires;
            delete this.gameState.player.tempLuckExpires;
        }
    }

    // 检查临时状态是否过期
    checkTemporaryStats() {
        if (!this.gameState.player) return;
        
        const now = Date.now();
        
        // 检查攻击药水效果
        if (this.gameState.player.tempAttackExpires) {
            const attackExpires = this.gameState.player.tempAttackExpires;
            if (now > attackExpires) {
                // 攻击药水效果已过期
                if (this.gameState.player.baseAttack) {
                    this.gameState.player.attack = this.gameState.player.baseAttack;
                }
                delete this.gameState.player.baseAttack;
                delete this.gameState.player.tempAttack;
                delete this.gameState.player.tempAttackExpires;
            } else {
                // 攻击药水效果仍然有效，重新设置计时器
                const remainingTime = attackExpires - now;
                setTimeout(() => {
                    if (this.gameState.player && this.gameState.player.baseAttack) {
                        this.gameState.player.attack = this.gameState.player.baseAttack;
                        this.gameState.player.tempAttack = null;
                        this.gameState.player.tempAttackExpires = null;
                        this.addBattleLog('攻击药水的效果消失了！');
                        this.updateUI();
                    }
                }, remainingTime);
            }
        }
        
        // 检查防御药水效果
        if (this.gameState.player.tempDefenseExpires) {
            const defenseExpires = this.gameState.player.tempDefenseExpires;
            if (now > defenseExpires) {
                // 防御药水效果已过期
                if (this.gameState.player.baseDefense) {
                    this.gameState.player.defense = this.gameState.player.baseDefense;
                }
                delete this.gameState.player.baseDefense;
                delete this.gameState.player.tempDefense;
                delete this.gameState.player.tempDefenseExpires;
            } else {
                // 防御药水效果仍然有效，重新设置计时器
                const remainingTime = defenseExpires - now;
                setTimeout(() => {
                    if (this.gameState.player && this.gameState.player.baseDefense) {
                        this.gameState.player.defense = this.gameState.player.baseDefense;
                        this.gameState.player.tempDefense = null;
                        this.gameState.player.tempDefenseExpires = null;
                        this.addBattleLog('防御药水的效果消失了！');
                        this.updateUI();
                    }
                }, remainingTime);
            }
        }

        // 检查速度药水效果
        if (this.gameState.player.tempSpeedExpires) {
            const speedExpires = this.gameState.player.tempSpeedExpires;
            if (now > speedExpires) {
                if (this.gameState.player.baseSpeed) {
                    this.gameState.player.speed = this.gameState.player.baseSpeed;
                }
                delete this.gameState.player.baseSpeed;
                delete this.gameState.player.tempSpeed;
                delete this.gameState.player.tempSpeedExpires;
            } else {
                const remainingTime = speedExpires - now;
                setTimeout(() => {
                    if (this.gameState.player && this.gameState.player.baseSpeed) {
                        this.gameState.player.speed = this.gameState.player.baseSpeed;
                        this.gameState.player.tempSpeed = null;
                        this.gameState.player.tempSpeedExpires = null;
                        this.addBattleLog('速度药水的效果消失了！');
                        this.updateUI();
                    }
                }, remainingTime);
            }
        }

        // 检查幸运药水效果
        if (this.gameState.player.tempLuckExpires) {
            const luckExpires = this.gameState.player.tempLuckExpires;
            if (now > luckExpires) {
                if (this.gameState.player.baseLuck) {
                    this.gameState.player.luck = this.gameState.player.baseLuck;
                }
                delete this.gameState.player.baseLuck;
                delete this.gameState.player.tempLuck;
                delete this.gameState.player.tempLuckExpires;
            } else {
                const remainingTime = luckExpires - now;
                setTimeout(() => {
                    if (this.gameState.player && this.gameState.player.baseLuck) {
                        this.gameState.player.luck = this.gameState.player.baseLuck;
                        this.gameState.player.tempLuck = null;
                        this.gameState.player.tempLuckExpires = null;
                        this.addBattleLog('幸运药水的效果消失了！');
                        this.updateUI();
                    }
                }, remainingTime);
            }
        }
    }

    // 使用消耗品
    useConsumable(item) {
        switch (item.effect) {
            case 'heal':
                // 恢复生命值
                const healAmount = Math.floor(this.gameState.player.maxHp * item.value);
                this.gameState.player.hp = Math.min(this.gameState.player.hp + healAmount, this.gameState.player.maxHp);
                this.addBattleLog(`使用了 ${item.name}，恢复了 ${healAmount} 点生命值！`);
                break;
            case 'energy':
                // 恢复灵力
                this.gameState.player.energy = this.gameState.player.maxEnergy;
                this.addBattleLog(`使用了 ${item.name}，灵力恢复满了！`);
                break;
            case 'attack':
                // 临时提升攻击力
                if (!this.gameState.player.baseAttack) {
                    this.gameState.player.baseAttack = this.gameState.player.attack;
                }
                const attackMultiplier = 1 + item.value;
                this.gameState.player.attack = this.gameState.player.baseAttack * attackMultiplier;
                this.gameState.player.tempAttack = this.gameState.player.attack;
                this.gameState.player.tempAttackExpires = Date.now() + 30000; // 30秒后过期
                this.addBattleLog(`使用了 ${item.name}，攻击力提升了 ${item.value * 100}%，持续30秒！`);
                // 30秒后效果消失
                setTimeout(() => {
                    if (this.gameState.player.baseAttack) {
                        this.gameState.player.attack = this.gameState.player.baseAttack;
                        this.gameState.player.tempAttack = null;
                        this.gameState.player.tempAttackExpires = null;
                    }
                    this.addBattleLog(`${item.name}的效果消失了！`);
                    this.updateUI();
                }, 30000);
                break;
            case 'defense':
                // 临时提升防御力
                if (!this.gameState.player.baseDefense) {
                    this.gameState.player.baseDefense = this.gameState.player.defense;
                }
                const defenseMultiplier = 1 + item.value;
                this.gameState.player.defense = this.gameState.player.baseDefense * defenseMultiplier;
                this.gameState.player.tempDefense = this.gameState.player.defense;
                this.gameState.player.tempDefenseExpires = Date.now() + 30000; // 30秒后过期
                this.addBattleLog(`使用了 ${item.name}，防御力提升了 ${item.value * 100}%，持续30秒！`);
                // 30秒后效果消失
                setTimeout(() => {
                    if (this.gameState.player.baseDefense) {
                        this.gameState.player.defense = this.gameState.player.baseDefense;
                        this.gameState.player.tempDefense = null;
                        this.gameState.player.tempDefenseExpires = null;
                    }
                    this.addBattleLog(`${item.name}的效果消失了！`);
                    this.updateUI();
                }, 30000);
                break;
            case 'speed':
                // 临时提升速度
                if (!this.gameState.player.baseSpeed) {
                    this.gameState.player.baseSpeed = this.gameState.player.speed;
                }
                const speedMultiplier = 1 + item.value;
                this.gameState.player.speed = this.gameState.player.baseSpeed * speedMultiplier;
                this.gameState.player.tempSpeed = this.gameState.player.speed;
                this.gameState.player.tempSpeedExpires = Date.now() + 30000; // 30秒后过期
                this.addBattleLog(`使用了 ${item.name}，速度提升了 ${item.value * 100}%，持续30秒！`);
                // 30秒后效果消失
                setTimeout(() => {
                    if (this.gameState.player.baseSpeed) {
                        this.gameState.player.speed = this.gameState.player.baseSpeed;
                        this.gameState.player.tempSpeed = null;
                        this.gameState.player.tempSpeedExpires = null;
                    }
                    this.addBattleLog(`${item.name}的效果消失了！`);
                    this.updateUI();
                }, 30000);
                break;
            case 'luck':
                // 临时提升幸运
                if (!this.gameState.player.baseLuck) {
                    this.gameState.player.baseLuck = this.gameState.player.luck;
                }
                const luckMultiplier = 1 + item.value;
                this.gameState.player.luck = this.gameState.player.baseLuck * luckMultiplier;
                this.gameState.player.tempLuck = this.gameState.player.luck;
                this.gameState.player.tempLuckExpires = Date.now() + 30000; // 30秒后过期
                this.addBattleLog(`使用了 ${item.name}，幸运提升了 ${item.value * 100}%，持续30秒！`);
                // 30秒后效果消失
                setTimeout(() => {
                    if (this.gameState.player.baseLuck) {
                        this.gameState.player.luck = this.gameState.player.baseLuck;
                        this.gameState.player.tempLuck = null;
                        this.gameState.player.tempLuckExpires = null;
                    }
                    this.addBattleLog(`${item.name}的效果消失了！`);
                    this.updateUI();
                }, 30000);
                break;
        }
    }

    // 使用药水
    usePotion() {
        // 过滤背包中的药水
        const potions = this.gameState.player.inventory.filter(
            item => item.type === 'consumable'
        );

        if (potions.length === 0) {
            this.showAlertModal('提示', '背包中没有药水！', 'warning');
            return;
        }

        // 创建选项列表
        const items = potions.map(potion => ({
            name: potion.name,
            description: potion.description || ''
        }));

        // 显示选择模态框
        this.showSelectionModal('选择要使用的药水', '点击选择要使用的药水', items, (index) => {
            const selectedPotion = potions[index];
            // 从背包中移除药水
            const inventoryIndex = this.gameState.player.inventory.indexOf(selectedPotion);
            if (inventoryIndex > -1) {
                this.gameState.player.inventory.splice(inventoryIndex, 1);
            }
            // 使用药水
            this.useConsumable(selectedPotion);
            // 更新UI
            this.updateUI();
        });
    }

    // 显示分解确认模态框
    showDisassembleModal(item, inventory, index) {
        const returns = this.equipmentSystem.calculateDisassembleReturns(item);
        const itemName = item.name || '未知装备';
        const woodAmount = returns.spiritWood || 0;
        const ironAmount = returns.blackIron || 0;
        const crystalAmount = returns.spiritCrystal || 0;

        const modal = document.getElementById('disassemble-modal');
        const infoDiv = document.getElementById('disassemble-modal-info');
        const confirmBtn = document.getElementById('confirm-disassemble');
        const cancelBtn = document.getElementById('cancel-disassemble');

        // 设置分解信息
        infoDiv.innerHTML = `
            <div class="mb-3">
                <span class="text-light/60">装备：</span>
                <span class="text-white font-medium">${itemName}</span>
            </div>
            <div class="bg-dark/30 rounded p-3 mb-3">
                <p class="text-sm text-light/70 mb-2">分解可获得：</p>
                <div class="flex justify-around">
                    <div class="text-center">
                        <i class="fa fa-wood text-accent mb-1"></i>
                        <p class="text-sm text-light/60">灵木</p>
                        <p class="text-lg font-bold text-success">${woodAmount}</p>
                    </div>
                    <div class="text-center">
                        <i class="fa fa-iron text-accent mb-1"></i>
                        <p class="text-sm text-light/60">玄铁</p>
                        <p class="text-lg font-bold text-success">${ironAmount}</p>
                    </div>
                    <div class="text-center">
                        <i class="fa fa-gem text-accent mb-1"></i>
                        <p class="text-sm text-light/60">灵石</p>
                        <p class="text-lg font-bold text-success">${crystalAmount}</p>
                    </div>
                </div>
            </div>
        `;

        // 移除旧的事件监听器
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        // 添加新的事件监听器
        newConfirmBtn.addEventListener('click', () => {
            inventory.splice(index, 1);
            this.gameState.resources.spiritWood += woodAmount;
            this.gameState.resources.blackIron += ironAmount;
            this.gameState.resources.spiritCrystal += crystalAmount;
            this.addBattleLog(`分解 ${itemName} 获得了 ${woodAmount} 灵木, ${ironAmount} 玄铁, ${crystalAmount} 灵石！`);
            this.updateUI();
            this.showInventory();
            modal.classList.add('hidden');
        });

        newCancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // 点击模态框外部关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        };

        // 显示模态框
        modal.classList.remove('hidden');
    }

    // 显示背包
    showInventory() {
        try {
            // 确保背包存在
            if (!this.gameState.player.inventory) {
                this.gameState.player.inventory = [];
            }
            
            const inventory = this.gameState.player.inventory;
            const inventoryModal = document.getElementById('inventory-modal');
            const inventoryEquipment = document.getElementById('inventory-equipment');
            const inventoryConsumables = document.getElementById('inventory-consumables');
            
            // 清空物品列表
            inventoryEquipment.innerHTML = '';
            inventoryConsumables.innerHTML = '';
            
            if (inventory.length === 0) {
                // 显示空背包消息
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'col-span-full text-center py-16 text-light/70';
                emptyMessage.textContent = '背包是空的！';
                inventoryEquipment.appendChild(emptyMessage);
            } else {
                // 分类物品
                const equipmentItems = inventory.filter(item => item.type !== 'consumable');
                const consumableItems = inventory.filter(item => item.type === 'consumable');
                
                // 创建装备物品格子
                if (equipmentItems.length === 0) {
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'col-span-full text-center py-16 text-light/70';
                    emptyMessage.textContent = '没有装备！';
                    inventoryEquipment.appendChild(emptyMessage);
                } else {
                    equipmentItems.forEach((item, index) => {
                        // 找到原始索引
                        const originalIndex = inventory.indexOf(item);
                        this.createItemElement(item, originalIndex, inventoryEquipment);
                    });
                }
                
                // 创建消耗品物品格子
                if (consumableItems.length === 0) {
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'col-span-full text-center py-16 text-light/70';
                    emptyMessage.textContent = '没有消耗品！';
                    inventoryConsumables.appendChild(emptyMessage);
                } else {
                    consumableItems.forEach((item, index) => {
                        // 找到原始索引
                        const originalIndex = inventory.indexOf(item);
                        this.createItemElement(item, originalIndex, inventoryConsumables);
                    });
                }
            }
            
            // 绑定Tab切换事件
            document.getElementById('tab-equipment').onclick = () => {
                // 切换到装备Tab
                document.getElementById('tab-equipment').classList.add('text-accent', 'border-accent');
                document.getElementById('tab-equipment').classList.remove('text-light/60');
                document.getElementById('tab-consumables').classList.add('text-light/60');
                document.getElementById('tab-consumables').classList.remove('text-accent', 'border-accent');
                
                // 显示装备区域，隐藏消耗品区域
                document.getElementById('inventory-equipment').classList.remove('hidden');
                document.getElementById('inventory-consumables').classList.add('hidden');
            };
            
            document.getElementById('tab-consumables').onclick = () => {
                // 切换到消耗品Tab
                document.getElementById('tab-consumables').classList.add('text-accent', 'border-accent');
                document.getElementById('tab-consumables').classList.remove('text-light/60');
                document.getElementById('tab-equipment').classList.add('text-light/60');
                document.getElementById('tab-equipment').classList.remove('text-accent', 'border-accent');
                
                // 显示消耗品区域，隐藏装备区域
                document.getElementById('inventory-consumables').classList.remove('hidden');
                document.getElementById('inventory-equipment').classList.add('hidden');
            };
            
            // 显示模态框
            inventoryModal.classList.remove('hidden');
            
            // 初始化合成界面
            this.initCraftInterface();
            
            // 绑定清空按钮事件
            document.getElementById('clear-craft').onclick = () => {
                this.initCraftInterface();
            };
            
            // 绑定合成按钮事件
            document.getElementById('confirm-craft').onclick = () => {
                this.performCraft();
            };
            
            // 绑定一键合成按钮事件
            document.getElementById('auto-craft').onclick = () => {
                this.autoCraft();
            };

            // 绑定一键添加按钮事件
            document.getElementById('auto-add').onclick = () => {
                this.autoAddToCraftSlots();
            };
            
            // 绑定关闭按钮事件
            document.getElementById('close-inventory').addEventListener('click', () => {
                inventoryModal.classList.add('hidden');
            });
            
            // 点击模态框外部关闭
            inventoryModal.addEventListener('click', (e) => {
                if (e.target === inventoryModal) {
                    inventoryModal.classList.add('hidden');
                }
            });
        } catch (error) {
            console.error('显示背包失败:', error);
        }
    }
    
    // 创建物品元素
    createItemElement(item, index, container) {
        const itemElement = document.createElement('div');
        itemElement.className = 'bg-dark/30 rounded p-0.5 hover:bg-dark/40 transition-colors border border-dark/50 shadow-sm cursor-pointer aspect-square flex flex-col items-center justify-center';
        itemElement.dataset.index = index;

        // 物品品质颜色
        const rarityColor = item.type === 'consumable' ? 'text-white' : this.equipmentSystem.getEquipmentColorClass(item);

        // 消耗品显示图片
        if (item.type === 'consumable') {
            // 根据药水类型获取图片
            const potionImages = {
                'health_potion': 'Images/health-potion.jpg',
                'energy_potion': 'Images/energy-potion.jpg',
                'attack_potion': 'Images/attack-potion.jpg',
                'defense_potion': 'Images/defense-potion.jpg',
                'speed_potion': 'Images/speed-potion.jpg',
                'luck_potion': 'Images/lucky-potion.jpg'
            };
            const imagePath = potionImages[item.id] || 'Images/potion-default.jpg';

            itemElement.innerHTML = `
                <img src="${imagePath}" alt="${item.name}" class="w-full h-full object-cover rounded">
            `;
        } else {
            // 装备显示图标
            let itemIcon = 'fa-box';
            if (item.type === 'weapon') {
                itemIcon = 'fa-sword';
            } else if (item.type === 'armor') {
                itemIcon = 'fa-shield';
            } else if (item.type === 'helmet') {
                itemIcon = 'fa-hat-wizard';
            } else if (item.type === 'boots') {
                itemIcon = 'fa-boot';
            } else if (item.type === 'accessory') {
                itemIcon = 'fa-gem';
            } else if (item.type === 'pants') {
                itemIcon = 'fa-user';
            }

            itemElement.innerHTML = `
                <div class="text-xs ${rarityColor} mb-0.5">
                    <i class="fa ${itemIcon}"></i>
                </div>
                <div class="text-[8px] text-center ${rarityColor} truncate w-full">
                    ${item.name}
                </div>
            `;
        }

        // 绑定鼠标悬停事件
        itemElement.addEventListener('mouseenter', (e) => {
            // 创建提示框
            const tooltip = document.createElement('div');
            tooltip.className = 'absolute z-50 bg-dark/90 border border-accent/50 rounded p-2 text-xs text-white shadow-lg';
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
            tooltip.style.pointerEvents = 'none';
            tooltip.id = 'item-tooltip';

            // 生成物品信息
            let info = `<div class="font-bold mb-1 ${rarityColor}">${item.name}</div>`;
            if (item.type === 'consumable') {
                info += `<div class="text-light/70">类型: 消耗品</div>`;
                info += `<div class="text-light/60 mt-1">${item.description || '无描述'}</div>`;
            } else {
                info += `<div class="text-light/70">类型: 装备 (${this.equipmentSystem.getSlotDisplayName(item.type)})</div>`;
                info += `<div class="text-light/70">等级: ${item.realmName || item.level || 1}</div>`;
                if (item.stats) {
                    info += `<div class="text-light/60 mt-1">${this.equipmentSystem.getStatsDescription(item.stats)}</div>`;
                }
                info += `<div class="text-light/70 mt-1">品质: <span class="${rarityColor}">${item.rarityDisplayName || '白色'}</span></div>`;
                if (item.refineLevel && item.refineLevel > 0) {
                    info += `<div class="text-light/70">精炼: +${item.refineLevel}</div>`;
                }
            }
            tooltip.innerHTML = info;

            // 添加到文档
            document.body.appendChild(tooltip);
        });
        
        // 绑定鼠标离开事件
        itemElement.addEventListener('mouseleave', () => {
            // 移除提示框
            const tooltip = document.getElementById('item-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
        
        // 绑定鼠标移动事件
        itemElement.addEventListener('mousemove', (e) => {
            // 更新提示框位置
            const tooltip = document.getElementById('item-tooltip');
            if (tooltip) {
                tooltip.style.left = `${e.pageX + 10}px`;
                tooltip.style.top = `${e.pageY + 10}px`;
            }
        });
        
        // 绑定拖拽事件
        itemElement.draggable = true;
        itemElement.addEventListener('dragstart', (e) => {
            const index = itemElement.dataset.index;
            e.dataTransfer.setData('text/plain', index);
        });
        
        // 绑定左键点击事件
        itemElement.addEventListener('click', (e) => {
            // 检查是否是拖拽操作
            if (e.defaultPrevented) {
                return; // 如果是拖拽操作，不执行点击事件
            }
            
            e.stopPropagation(); // 阻止事件冒泡
            
            const inventory = this.gameState.player.inventory;
            
            if (item.type === 'consumable') {
                // 消耗品直接使用
                inventory.splice(index, 1);
                this.useConsumable(item);
                this.updateUI();
                this.showInventory();
            } else {
                // 显示操作菜单
                const contextMenu = document.getElementById('context-menu');
                
                // 计算鼠标位置，确保菜单在可视区域内
                let left = e.clientX;
                let top = e.clientY;
                
                // 获取菜单尺寸
                const menuWidth = contextMenu.offsetWidth;
                const menuHeight = contextMenu.offsetHeight;
                
                // 检查是否会超出屏幕右侧
                if (left + menuWidth > window.innerWidth) {
                    left = window.innerWidth - menuWidth - 10;
                }
                
                // 检查是否会超出屏幕底部
                if (top + menuHeight > window.innerHeight) {
                    top = window.innerHeight - menuHeight - 10;
                }
                
                // 设置菜单位置
                contextMenu.style.left = `${left}px`;
                contextMenu.style.top = `${top}px`;
                contextMenu.style.position = 'fixed';
                contextMenu.style.zIndex = '9999';
                contextMenu.classList.remove('hidden');
                
                // 绑定菜单选项点击事件
                document.getElementById('context-use').onclick = () => {
                    // 使用/装备
                    const equippedItem = this.gameState.player.equipment[item.type];
                    inventory.splice(index, 1);
                    this.equipItem(item);
                    this.updateUI();
                    this.showInventory();
                    contextMenu.classList.add('hidden');
                };
                
                document.getElementById('context-disassemble').onclick = () => {
                    // 分解 - 使用自定义模态框
                    contextMenu.classList.add('hidden');
                    this.showDisassembleModal(item, inventory, index);
                };
                
                document.getElementById('context-drop').onclick = () => {
                    // 丢弃
                    const confirmDrop = confirm(`确定要丢弃 ${item.name} 吗？`);
                    if (confirmDrop) {
                        inventory.splice(index, 1);
                        this.addBattleLog(`已丢弃 ${item.name}！`);
                        this.updateUI();
                        this.showInventory();
                    }
                    contextMenu.classList.add('hidden');
                };
            }
        });
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', (e) => {
            const contextMenu = document.getElementById('context-menu');
            if (contextMenu && !contextMenu.contains(e.target)) {
                contextMenu.classList.add('hidden');
            }
        });
        
        container.appendChild(itemElement);
    }
    
    // 获取属性描述

    
    // 初始化tooltip
    initTooltips() {
        // 移除所有现有的tooltip
        document.querySelectorAll('.custom-tooltip').forEach(tooltip => {
            tooltip.remove();
        });
        
        // 找到所有带有data-tooltip属性的元素
        const elements = document.querySelectorAll('[data-tooltip]');
        
        elements.forEach(element => {
            // 检查元素是否已经有tooltip事件监听器
            if (element._hasTooltipListeners) {
                return; // 跳过已添加监听器的元素
            }
            
            // 标记元素已添加tooltip监听器
            element._hasTooltipListeners = true;
            
            // 添加鼠标悬停事件
            element.addEventListener('mouseenter', (e) => {
                const tooltipText = element.getAttribute('data-tooltip');
                if (!tooltipText) return;
                
                // 检查元素是否已经有一个tooltip元素存在
                if (element._tooltip) {
                    return; // 跳过已存在tooltip的元素
                }
                
                // 创建tooltip元素
                const tooltip = document.createElement('div');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = tooltipText;
                
                // 设置tooltip样式
                tooltip.style.position = 'fixed';
                tooltip.style.backgroundColor = 'rgba(30, 41, 59, 0.9)';
                tooltip.style.color = '#f1f5f9';
                tooltip.style.padding = '6px 10px';
                tooltip.style.borderRadius = '6px';
                tooltip.style.fontSize = '12px';
                tooltip.style.whiteSpace = 'nowrap';
                tooltip.style.zIndex = '9999';
                tooltip.style.border = '1px solid rgba(96, 165, 250, 0.5)';
                tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                tooltip.style.pointerEvents = 'none';
                
                // 计算tooltip位置
                const rect = element.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top - 30}px`;
                tooltip.style.transform = 'translateX(-50%)';
                
                // 添加到文档
                document.body.appendChild(tooltip);
                
                // 存储tooltip引用
                element._tooltip = tooltip;
            });
            
            // 添加鼠标离开事件
            element.addEventListener('mouseleave', () => {
                if (element._tooltip) {
                    element._tooltip.remove();
                    delete element._tooltip;
                }
            });
            
            // 添加鼠标移动事件，使tooltip跟随鼠标
            element.addEventListener('mousemove', (e) => {
                if (element._tooltip) {
                    element._tooltip.style.left = `${e.clientX}px`;
                    element._tooltip.style.top = `${e.clientY - 20}px`;
                    element._tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
                }
            });
        });
    }
};

// 检查Babylon.js是否加载完成
function checkBabylonJsLoaded() {
    if (typeof BABYLON !== 'undefined') {
        window.game = new EndlessWinterGame();
    } else {
        setTimeout(checkBabylonJsLoaded, 100);
    }
}

// 初始化游戏
window.onload = function() {
    checkBabylonJsLoaded();
};
