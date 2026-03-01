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

    // 更新技能按钮状态
    if (this.gameState.player && this.gameState.player.skills) {
        for (let i = 0; i < this.gameState.player.skills.length; i++) {
            const skill = this.gameState.player.skills[i];
            const skillButton = document.getElementById(`skill-${i}`);
            if (skillButton) {
                if (this.calculateTotalLevel() >= skill.levelRequired) {
                    console.log(`技能 ${skill.name} 可用（等级满足）`);
                    // 等级满足，显示并启用技能按钮
                    skillButton.style.display = 'flex';
                    skillButton.disabled = false;
                    skillButton.classList.remove('bg-dark/50', 'cursor-not-allowed');
                    skillButton.classList.add('bg-accent', 'hover:bg-accent/80');
                } else {
                    console.log(`技能 ${skill.name} 不可用（等级不满足）`);
                    // 等级不足，隐藏技能按钮
                    skillButton.style.display = 'none';
                }
            }
        }
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
EndlessWinterGame.prototype.playSkillAttackAnimation = function(isLuckyStrike = false, callback) {
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
            
            // 根据是否是幸运一击设置不同的颜色
            if (isLuckyStrike) {
                // 幸运一击特效（金色）
                skillMaterial.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
                skillMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
            } else {
                // 普通技能特效（蓝色）
                skillMaterial.diffuseColor = new BABYLON.Color3(0, 0.5, 1);
                skillMaterial.emissiveColor = new BABYLON.Color3(0, 0.5, 1);
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

// 显示能量变化
EndlessWinterGame.prototype.showEnergyChange = function(target, amount) {
    if (!this.battle3D || !this.battle3D.scene) return;

    // 使用HTML元素显示能量变化
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
        dodgeElement.style.left = `${screenPoint.x * engine.getRenderWidth()}px`;
        dodgeElement.style.top = `${(1 - screenPoint.y) * engine.getRenderHeight()}px`;
        dodgeElement.style.transform = 'translate(-50%, -50%)';
        
        // 动画（向上飘动并消失）
        const startTime = Date.now();
        const duration = 1000;
        
        const animateDodge = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 向上移动
            dodgeElement.style.transform = `translate(-50%, -${50 + progress * 100}px)`;
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
