// 战斗场景模块 (battle3d.js)
// 包含战斗3D场景、动画、特效和结束逻辑

// ==================== 战斗场景初始化 ====================

// 创建单独的3D战斗场景
EndlessWinterGame.prototype.createBattleScene = function(enemyInfo) {
    // 播放战斗音乐
    this.playSound('battle-music');

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

    // 清空容器
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

    // 设置火山背景
    scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.05, 1);

    // 创建相机
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 6, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(container, false); // 禁用鼠标控制，防止地图移动
    camera.setPosition(new BABYLON.Vector3(0, 2, 6));
    // 禁用相机的旋转和移动
    camera.upperRadiusLimit = 6;
    camera.lowerRadiusLimit = 6;
    camera.upperBetaLimit = Math.PI / 2.5;
    camera.lowerBetaLimit = Math.PI / 2.5;
    camera.upperAlphaLimit = -Math.PI / 2;
    camera.lowerAlphaLimit = -Math.PI / 2;

    // 添加灯光
    const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
    ambientLight.intensity = 1;
    ambientLight.diffuse = new BABYLON.Color3(0.25, 0.125, 0.125);

    const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(5, 5, 3), scene);
    directionalLight.intensity = 1.5;
    directionalLight.diffuse = new BABYLON.Color3(1, 0.667, 0.4);

    const pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 2, 0), scene);
    pointLight.intensity = 1.5;
    pointLight.diffuse = new BABYLON.Color3(1, 0.25, 0);

    // 创建地面
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 15, height: 15 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.75, 0.85, 0.95);
    groundMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 0.7);
    groundMaterial.shininess = 30;
    ground.material = groundMaterial;
    ground.position.y = -1;

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
            if (pickResult.hit && pickResult.pickedMesh && pickResult.pickedMesh.name === 'player') {
                // 显示玩家信息工具提示
                playerTooltip = document.createElement('div');
                playerTooltip.className = 'absolute bg-dark/90 text-white p-2 rounded text-xs z-50 pointer-events-none';
                playerTooltip.style.position = 'fixed';
                playerTooltip.style.left = `${pointerInfo.event.clientX + 10}px`;
                playerTooltip.style.top = `${pointerInfo.event.clientY + 10}px`;
                
                // 计算临时命中和闪避率
                const calculateHitChance = () => {
                    const baseHit = 90; // 基础命中率 90%
                    const playerSpeed = this.gameState.player.speed || 0;
                    const luck = this.gameState.player.luck || 0;
                    // 每10点速度增加1%命中，每10点幸运增加1%命中
                    const hitBonus = Math.floor(playerSpeed / 10) + Math.floor(luck / 10);
                    const finalHit = Math.min(99, baseHit + hitBonus);
                    return finalHit;
                };
                
                const calculateDodgeChance = () => {
                    const baseDodge = 10; // 基础闪避率 10%
                    const playerSpeed = this.gameState.player.speed || 0;
                    const luck = this.gameState.player.luck || 0;
                    // 每8点速度增加1%闪避，每15点幸运增加1%闪避
                    const dodgeBonus = Math.floor(playerSpeed / 8) + Math.floor(luck / 15);
                    const finalDodge = Math.min(50, baseDodge + dodgeBonus);
                    return finalDodge;
                };
                
                const hitChance = calculateHitChance();
                const dodgeChance = calculateDodgeChance();
                
                // 构建工具提示内容
                playerTooltip.innerHTML = `
                    <div class="font-bold">${this.gameState.user?.username || '玩家'}</div>
                    <div>等级: ${this.calculateTotalLevel()}</div>
                    <div>生命值: ${this.gameState.player.hp}/${this.gameState.player.maxHp}</div>
                    <div>灵力: ${this.gameState.player.energy}/${this.gameState.player.maxEnergy}</div>
                    <div>攻击: ${this.gameState.player.attack}</div>
                    <div>防御: ${this.gameState.player.defense}</div>
                    <div>速度: ${this.gameState.player.speed || 0}</div>
                    <div>幸运: ${this.gameState.player.luck || 0}</div>
                    <div>命中率: ${hitChance}%</div>
                    <div>闪避率: ${dodgeChance}%</div>
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
            if (pickResult.hit && pickResult.pickedMesh && pickResult.pickedMesh.name === 'enemy') {
                // 显示敌人信息工具提示
                enemyTooltip = document.createElement('div');
                enemyTooltip.className = 'absolute bg-dark/90 text-white p-2 rounded text-xs z-50 pointer-events-none';
                enemyTooltip.style.position = 'fixed';
                enemyTooltip.style.left = `${pointerInfo.event.clientX + 10}px`;
                enemyTooltip.style.top = `${pointerInfo.event.clientY + 10}px`;
                
                // 计算敌人临时命中和闪避率
                const calculateEnemyHitChance = () => {
                    const baseHit = 90; // 基础命中率 90%
                    const enemySpeed = this.gameState.enemy.speed || 0;
                    const enemyLuck = this.gameState.enemy.luck || 0;
                    // 每10点速度增加1%命中，每10点幸运增加1%命中
                    const hitBonus = Math.floor(enemySpeed / 10) + Math.floor(enemyLuck / 10);
                    const finalHit = Math.min(99, baseHit + hitBonus);
                    return finalHit;
                };
                
                const calculateEnemyDodgeChance = () => {
                    const baseDodge = 10; // 基础闪避率 10%
                    const enemySpeed = this.gameState.enemy.speed || 0;
                    const enemyLuck = this.gameState.enemy.luck || 0;
                    // 每8点速度增加1%闪避，每15点幸运增加1%闪避
                    const dodgeBonus = Math.floor(enemySpeed / 8) + Math.floor(enemyLuck / 15);
                    const finalDodge = Math.min(50, baseDodge + dodgeBonus);
                    return finalDodge;
                };
                
                const enemyHitChance = calculateEnemyHitChance();
                const enemyDodgeChance = calculateEnemyDodgeChance();
                
                // 构建工具提示内容
                enemyTooltip.innerHTML = `
                    <div class="font-bold">${this.gameState.enemy.name}</div>
                    <div>等级: ${this.gameState.enemy.level}</div>
                    <div>生命值: ${this.gameState.enemy.hp}/${this.gameState.enemy.maxHp}</div>
                    ${this.gameState.enemy.isBoss || this.gameState.enemy.energy > 0 ? `<div>灵力: ${this.gameState.enemy.energy}/${this.gameState.enemy.maxEnergy || 100}</div>` : ''}
                    <div>攻击: ${this.gameState.enemy.attack}</div>
                    <div>防御: ${this.gameState.enemy.defense || 0}</div>
                    <div>速度: ${this.gameState.enemy.speed || 0}</div>
                    <div>幸运: ${this.gameState.enemy.luck || 0}</div>
                    <div>命中率: ${enemyHitChance}%</div>
                    <div>闪避率: ${enemyDodgeChance}%</div>
                `;
                
                document.body.appendChild(enemyTooltip);
            }
        }
    });

    // 初始化 battle3D 对象（战斗模式专用）
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
        enemies: [],
        defenseEffect: null
    };

    // 创建玩家和敌人模型
    this.createPlayerModel();
    // 设置玩家位置（左侧）
    if (this.battle3D.player) {
        this.battle3D.player.position.x = -2;
        this.battle3D.player.position.y = 0;
        this.battle3D.player.position.z = 0;
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
        attackButton.className = 'btn-primary bg-primary hover:bg-primary/80 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition-all';
        attackButton.setAttribute('data-tooltip', '对敌人进行普通攻击，不消耗灵力');
        attackButton.innerHTML = '<img src="Images/skill-0.jpg" alt="普通攻击" class="w-full h-full object-cover">';
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
            skillButton.className = 'btn-primary bg-accent hover:bg-accent/80 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition-all';
            skillButton.setAttribute('data-skill-type', skillType);

            if (skill && skillTree) {
                // 有装备的技能
                const realmName = this.metadata.realmConfig?.[skillTree.realmRequired]?.name || '未知境界';
                const skillDisplayName = skill.displayName || skill.name;
                skillButton.setAttribute('data-tooltip', `${skillDisplayName}: ${skill.description || ''}，消耗${skill.energyCost}灵力，${realmName} (右键切换)`);
                const skillImage = `Images/skill-${skill.imageId || equippedSkillId.replace('skill-', '')}.jpg`;
                skillButton.innerHTML = `<img src="${skillImage}" alt="${skillDisplayName}" class="w-full h-full object-cover">`;
            } else {
                // 没有装备技能
                skillButton.setAttribute('data-tooltip', `${skillTypeConfig.defaultName}（未装备）- 点击或右键选择技能`);
                skillButton.innerHTML = `<img src="Images/${skillTypeConfig.icon}" alt="${skillTypeConfig.defaultName}" class="w-full h-full object-cover opacity-50">`;
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
EndlessWinterGame.prototype.fadeInBattleScene = function() {
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
EndlessWinterGame.prototype.playAttackAnimation = function(callback) {
    if (!this.battle3D || !this.battle3D.player || !this.battle3D.enemy || this.battle3D.isAttacking) {
        if (callback) callback();
        return;
    }

    this.battle3D.isAttacking = true;
    const player = this.battle3D.player;
    const enemy = this.battle3D.enemy;

    // 攻击动画（向右侧敌人冲刺）
    const startTime = Date.now();
    const animationDuration = 500;
    const originalX = player.position.x;

    const animateAttack = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // 向右侧冲刺然后后退，只移动一次
        if (progress < 0.5) {
            // 向右侧冲刺（0到1的过程），增加移动距离以碰到敌人
            player.position.x = originalX + Math.sin(progress * Math.PI) * 3.5;
        } else {
            // 后退（1到0的过程）
            player.position.x = originalX + Math.sin((1 - progress) * Math.PI) * 3.5;
        }

        if (progress < 1) {
            requestAnimationFrame(animateAttack);
        } else {
            // 重置位置
            player.position.x = originalX;
            this.battle3D.isAttacking = false;
            if (callback) callback();
        }
    };

    animateAttack();

    // 播放攻击声音
    this.playSound('attack-sound', 1, 200);
};

// 播放玩家技能攻击动画
EndlessWinterGame.prototype.playSkillAttackAnimation = function(isLuckyStrike = false, skillColor = { r: 0, g: 0.5, b: 1 }, callback) {
    if (!this.battle3D || !this.battle3D.player || !this.battle3D.enemy || this.battle3D.isAttacking) {
        if (callback) callback();
        return;
    }

    this.battle3D.isAttacking = true;
    const player = this.battle3D.player;
    const enemy = this.battle3D.enemy;

    // 技能动画（旋转攻击）
    const startTime = Date.now();
    const animationDuration = 800;
    const originalX = player.position.x;

    const animateSkill = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // 旋转
        player.rotation.y = progress * Math.PI * 2;
        // 向右侧冲刺，增加移动距离以碰到敌人
        player.position.x = originalX + Math.sin(progress * Math.PI) * 3.5;

        // 添加技能效果
        if (progress > 0.3 && progress < 0.7 && this.battle3D.scene) {
            // 创建技能特效
            const skillEffect = BABYLON.MeshBuilder.CreateSphere("skillEffect", { diameter: 0.5 }, this.battle3D.scene);
            const skillMaterial = new BABYLON.StandardMaterial("skillMaterial", this.battle3D.scene);

            // 根据是否是幸运一击或技能特定颜色设置不同的颜色
            if (isLuckyStrike) {
                // 幸运一击特效（金色）
                skillMaterial.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
                skillMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
            } else {
                // 使用技能特定的颜色
                skillMaterial.diffuseColor = new BABYLON.Color3(skillColor.r, skillColor.g, skillColor.b);
                skillMaterial.emissiveColor = new BABYLON.Color3(skillColor.r, skillColor.g, skillColor.b);
            }

            skillMaterial.alpha = 0.8;
            skillEffect.material = skillMaterial;
            skillEffect.position.x = player.position.x;
            skillEffect.position.y = player.position.y;
            skillEffect.position.z = player.position.z;

            // 动画效果
            const effectStartTime = Date.now();
            const effectDuration = 300;

            const animateEffect = () => {
                const effectElapsed = Date.now() - effectStartTime;
                const effectProgress = Math.min(effectElapsed / effectDuration, 1);

                skillEffect.scaling.x = 1 + effectProgress * 2;
                skillEffect.scaling.y = 1 + effectProgress * 2;
                skillEffect.scaling.z = 1 + effectProgress * 2;
                skillMaterial.alpha = 0.8 - effectProgress * 0.8;

                if (effectProgress < 1) {
                    requestAnimationFrame(animateEffect);
                } else {
                    // 清理特效
                    if (skillEffect) {
                        skillEffect.dispose();
                    }
                }
            };

            animateEffect();
        }

        if (progress < 1) {
            requestAnimationFrame(animateSkill);
        } else {
            // 重置
            player.rotation.y = 0;
            player.position.x = originalX;
            this.battle3D.isAttacking = false;
            if (callback) callback();
        }
    };

    animateSkill();
};

// 播放玩家防御动画
EndlessWinterGame.prototype.playDefenseAnimation = function(callback) {
    if (!this.battle3D || !this.battle3D.player) {
        if (callback) callback();
        return;
    }

    const player = this.battle3D.player;
    const originalY = player.position.y;
    const startTime = Date.now();
    const animationDuration = 1000;

    // 添加防御特效（光圈）
    if (this.battle3D.scene) {
        // 清理之前的防御特效
        if (this.battle3D.defenseEffect) {
            this.battle3D.defenseEffect.dispose();
        }

        const defenseEffect = BABYLON.MeshBuilder.CreateSphere("defenseEffect", { diameter: 1.2 }, this.battle3D.scene);
        const defenseMaterial = new BABYLON.StandardMaterial("defenseMaterial", this.battle3D.scene);
        defenseMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
        defenseMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);
        defenseMaterial.alpha = 0.5;
        defenseEffect.material = defenseMaterial;
        defenseEffect.position.x = player.position.x;
        defenseEffect.position.y = player.position.y;
        defenseEffect.position.z = player.position.z;

        // 动画效果
        const effectStartTime = Date.now();
        const effectDuration = 500;

        const animateEffect = () => {
            const effectElapsed = Date.now() - effectStartTime;
            const effectProgress = Math.min(effectElapsed / effectDuration, 1);

            defenseEffect.scaling.x = 1 + effectProgress * 1.5;
            defenseEffect.scaling.y = 1 + effectProgress * 1.5;
            defenseEffect.scaling.z = 1 + effectProgress * 1.5;

            if (effectProgress < 1) {
                requestAnimationFrame(animateEffect);
            }
        };

        animateEffect();

        // 存储防御特效
        this.battle3D.defenseEffect = defenseEffect;
    }

    const animateDefense = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        if (progress < 1) {
            // 防御姿态（身体后仰，高度降低）
            player.position.y = originalY - Math.sin(progress * Math.PI) * 0.5;
            player.rotation.x = -Math.sin(progress * Math.PI) * 0.3;
        } else {
            player.position.y = originalY;
            player.rotation.x = 0;
            if (callback) callback();
        }

        if (progress < 1) {
            requestAnimationFrame(animateDefense);
        }
    };

    animateDefense();
};

// 播放敌人攻击动画
EndlessWinterGame.prototype.playEnemyAttackAnimation = function() {
    console.log('playEnemyAttackAnimation 被调用');
    if (!this.battle3D) {
        console.log('playEnemyAttackAnimation: battle3D 不存在');
        return;
    }
    if (!this.battle3D.enemy) {
        console.log('playEnemyAttackAnimation: enemy 不存在');
        return;
    }

    // 强制设置isAttacking为true，确保动画可以执行
    this.battle3D.isAttacking = true;
    const enemy = this.battle3D.enemy;
    console.log('敌人初始位置:', enemy.position.x, enemy.position.y, enemy.position.z);

    // 攻击动画（向前突进）
    const startTime = Date.now();
    const animationDuration = 600; // 延长动画时间
    const originalX = enemy.position.x;

    const animateAttack = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        if (progress < 0.5) {
            // 向玩家方向移动，增加移动距离
            enemy.position.x = originalX - Math.sin(progress * Math.PI) * 2.5;
        } else {
            // 退回原位
            enemy.position.x = originalX - Math.sin((1 - progress) * Math.PI) * 2.5;
        }

        if (progress < 1) {
            requestAnimationFrame(animateAttack);
        } else {
            enemy.position.x = originalX;
            console.log('敌人攻击结束，回到初始位置:', enemy.position.x);
            // 敌人攻击结束后，移除防御特效
            if (this.battle3D.defenseEffect) {
                this.battle3D.defenseEffect.dispose();
                this.battle3D.defenseEffect = null;
            }
            this.battle3D.isAttacking = false;
        }
    };

    animateAttack();
};

// 播放敌人受击动画
EndlessWinterGame.prototype.playEnemyHitAnimation = function() {
    if (!this.battle3D || !this.battle3D.enemy) return;

    const enemy = this.battle3D.enemy;
    const originalY = enemy.position.y;
    const startTime = Date.now();
    const animationDuration = 300;

    const animateHit = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // 受击效果（向上跳跃后落下）
        enemy.position.y = originalY + Math.sin(progress * Math.PI) * 0.5;

        if (progress < 1) {
            requestAnimationFrame(animateHit);
        } else {
            enemy.position.y = originalY;
        }
    };

    animateHit();
};

// 播放玩家受击动画
EndlessWinterGame.prototype.playPlayerHitAnimation = function() {
    if (!this.battle3D || !this.battle3D.player) return;

    const player = this.battle3D.player;
    const originalY = player.position.y;
    const startTime = Date.now();
    const animationDuration = 300;

    const animateHit = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        player.position.y = originalY + Math.sin(progress * Math.PI) * 0.5;

        if (progress < 1) {
            requestAnimationFrame(animateHit);
        } else {
            player.position.y = originalY;
        }
    };

    animateHit();
};

// ==================== 战斗特效 ====================

// 创建攻击特效
EndlessWinterGame.prototype.createAttackEffect = function(targetPosition, color = '#ff0000') {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    // 创建发光的光环
    const ring = BABYLON.MeshBuilder.CreateRing("attackRing", { diameter: 1, tessellation: 32 }, scene);
    const ringMaterial = new BABYLON.StandardMaterial("ringMaterial", scene);
    ringMaterial.emissiveColor = BABYLON.Color3.FromHexString(color);
    ring.material = ringMaterial;

    ring.position = targetPosition.clone();
    ring.position.y = 1.5;
    ring.scaling = new BABYLON.Vector3(0, 0, 1);
    ring.isVisible = false;

    // 动画
    const startTime = Date.now();
    const duration = 300;

    const animateRing = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 1) {
            // 扩散效果
            ring.scaling.x = 1 + progress * 3;
            ring.scaling.y = 1 + progress * 3;
            ring.isVisible = true;
            ring.material.opacity = 1 - progress;

            requestAnimationFrame(animateRing);
        } else {
            // 清理
            ring.dispose();
        }
    };

    animateRing();
};

// 创建防御特效
EndlessWinterGame.prototype.createDefenseEffect = function() {
    if (!this.battle3D || !this.battle3D.player) return;

    const player = this.battle3D.player;
    const scene = this.battle3D.scene;

    // 创建护盾效果
    const shield = BABYLON.MeshBuilder.CreateTorus("defenseShield", { diameter: 2, thickness: 0.1 }, scene);
    const shieldMaterial = new BABYLON.StandardMaterial("shieldMaterial", scene);
    shieldMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.5, 1);
    shieldMaterial.opacity = 0.5;
    shield.material = shieldMaterial;

    shield.position = player.position.clone();
    shield.position.y = 1.5;
    shield.rotation.x = Math.PI / 2;

    // 存储在 battle3D 中以便移除
    this.battle3D.defenseShield = shield;

    // 3秒后移除
    setTimeout(() => {
        if (this.battle3D.defenseShield) {
            this.battle3D.defenseShield.dispose();
            this.battle3D.defenseShield = null;
        }
    }, 3000);
};

// 移除防御特效
EndlessWinterGame.prototype.removeDefenseEffect = function() {
    if (this.battle3D.defenseShield) {
        this.battle3D.defenseShield.dispose();
        this.battle3D.defenseShield = null;
    }
};

// 创建火焰特效
EndlessWinterGame.prototype.createFireEffects = function() {
    if (!this.battle3D || !this.battle3D.scene) return;

    const scene = this.battle3D.scene;

    // 创建喷火效果（在敌人位置）
    this.battle3D.fireEffects = [];

    for (let i = 0; i < 5; i++) {
        const fire = BABYLON.MeshBuilder.CreateCylinder(`fire${i}`, {
            diameterTop: 0.2,
            diameterBottom: 0.5,
            height: 1
        }, scene);

        const fireMaterial = new BABYLON.StandardMaterial(`fireMaterial${i}`, scene);
        fireMaterial.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
        fire.material = fireMaterial;

        fire.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 10,
            0,
            (Math.random() - 0.5) * 10
        );
        fire.position.y = -0.5;

        fire.isVisible = false;
        this.battle3D.fireEffects.push(fire);
    }
};

// 显示伤害数字
EndlessWinterGame.prototype.showDamage = function(target, amount, type = 'red') {
    if (!this.battle3D || !this.battle3D.scene) return;

    // 使用HTML元素显示伤害数字
    const damageElement = document.createElement('div');
    damageElement.className = 'absolute pointer-events-none';
    damageElement.style.fontSize = '24px';
    damageElement.style.fontWeight = 'bold';
    damageElement.style.color = type === 'red' ? 'red' : type === 'green' ? 'green' : 'white';
    damageElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    damageElement.style.zIndex = '9999';
    damageElement.style.position = 'absolute';
    // 对于红色伤害，添加减号
    damageElement.textContent = (type === 'red' ? '-' : '') + amount.toString();
    
    // 获取战斗模态窗口
    const battleModal = document.getElementById('battle-modal');
    if (battleModal) {
        battleModal.appendChild(damageElement);
        
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
        damageElement.style.left = `${screenPoint.x * engine.getRenderWidth()}px`;
        damageElement.style.top = `${(1 - screenPoint.y) * engine.getRenderHeight()}px`;
        damageElement.style.transform = 'translate(-50%, -50%)';
        
        // 动画（向上飘动并消失）
        const startTime = Date.now();
        const duration = 1000;
        
        const animateDamage = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 向上移动
            damageElement.style.transform = `translate(-50%, -${50 + progress * 100}px)`;
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
EndlessWinterGame.prototype.showEnergyChange = function(target, amount) {
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
    energyElement.textContent = amount > 0 ? `+${amount}` : amount.toString();
    
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
EndlessWinterGame.prototype.showDodge = function(target, text) {
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
EndlessWinterGame.prototype.animateBattle3D = function() {
    if (!this.battle3D) return;

    // 玩家和敌人动画
    if (this.battle3D.player) {
        const time = Date.now() * 0.003;
        this.battle3D.player.position.y = Math.sin(time) * 0.05;
    }

    if (this.battle3D.enemy) {
        this.battle3D.enemy.rotation.y += 0.005;
        const time = Date.now() * 0.003;
        this.battle3D.enemy.position.y = Math.sin(time + 1) * 0.05;
    }

    // 火焰动画
    if (this.battle3D.fireEffects) {
        this.battle3D.fireEffects.forEach((fire, index) => {
            fire.isVisible = true;
            fire.scaling.y = 1 + Math.sin(Date.now() * 0.01 + index) * 0.5;
            fire.rotation.z += 0.05;
        });
    }
};

// ==================== 技能选择菜单 ====================

// 显示技能选择菜单
EndlessWinterGame.prototype.showSkillSelectionMenu = function(skillType, event) {
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
EndlessWinterGame.prototype.updateBattleSkillButtons = function() {
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
            const skillImage = `Images/skill-${skill.imageId || equippedSkillId.replace('skill-', '')}.jpg`;
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
