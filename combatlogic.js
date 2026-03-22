// 战斗逻辑模块 (combatlogic.js)
// 包含战斗计算、技能系统、伤害计算、升级检查等

// ==================== 战斗控制 ====================

// 攻击敌人（玩家回合）
EndlessCultivationGame.prototype.attackEnemy = function() {
    // 只有在战斗模式中才能使用普通攻击
    if (!this.transientState.battle.inBattle) {
        this.addBattleLog('只有在战斗模式中才能使用普通攻击！');
        return;
    }

    // 确保战斗场景已初始化
    if (!this.battle3D || !this.battle3D.player || !this.battle3D.enemy) {
        this.addBattleLog('战斗场景未初始化！');
        return;
    }

    // 获取实际属性（包含装备和境界加成）
    const playerStats = this.getActualStats();
    const enemyStats = this.getEnemyActualStats();

    const finalAttack = playerStats.attack;
    const finalDefense = playerStats.defense;
    const finalAccuracy = playerStats.accuracy;
    const finalDodge = playerStats.dodgeRate;
    const finalCriticalRate = playerStats.criticalRate;
    const playerCritDamage = playerStats.critDamage;
    const playerTenacity = playerStats.tenacity || 0;

    const enemyAttack = enemyStats.attack;
    const enemyDefense = enemyStats.defense;
    const enemyAccuracy = enemyStats.accuracy;
    const enemyDodge = enemyStats.dodgeRate;
    const enemyCriticalRate = enemyStats.criticalRate;
    const enemyCritDamage = enemyStats.critDamage;

    // 预计算所有伤害和命中（动画前确定随机值）
    // 注意：accuracy/dodgeRate/criticalRate 内部是小数格式（0.05表示5%），判定时乘100转为百分比
    const playerHitChance = Math.min(95, Math.max(5, finalAccuracy * 100 - enemyDodge * 100));
    const playerHit = Math.random() * 100 < playerHitChance;
    // 暴击判定：命中后才判定暴击
    const playerCrit = playerHit && Math.random() * 100 < finalCriticalRate * 100;
    // 暴击伤害：使用新的随机系统
    let playerCritResult = null;
    const playerDamage = playerCrit
        ? (() => {
            playerCritResult = this.rollCritDamage(playerCritDamage);
            return Math.max(1, Math.floor(finalAttack * playerCritResult.multiplier) - enemyDefense);
        })()
        : Math.max(1, finalAttack - enemyDefense);

    // 敌人伤害预计算（使用统一函数，避免代码重复）
    const {
        enemyHit,
        enemyDamage,
        enemyCrit,
        enemyCritResult,
        tenacityReduction
    } = this.calculateEnemyAttack(finalDefense, enemyAccuracy, finalDodge, false);

        // 播放攻击动画
    this.playAttackAnimation(
        // === 碰撞回调：玩家到达敌人位置时（撞击感） ===
        () => {
            if (playerHit) {
                // ✅ 命中时创建冲击特效（在敌人躯干位置）
                if (this.battle3D.enemy) {
                    const hitPosition = this.battle3D.enemy.position.clone();
                    hitPosition.y = 1.0; // ✅ 躯干高度

                    // 暴击时金色冲击波，普通攻击白色冲击波
                    const effectColor = playerCrit ? '#ffcc00' : '#ffffff';
                    this.createAttackEffect(hitPosition, effectColor);
                }

                // ✅ Debug: 攻击前的敌人HP
                console.log('=== [攻击敌人] 攻击前 ===');
                console.log('敌人名称:', this.transientState.enemy.name);
                console.log('敌人HP:', this.transientState.enemy.hp, '/', this.transientState.enemy.maxHp);
                console.log('伤害值:', playerDamage);

                this.transientState.enemy.hp -= playerDamage;
                if (this.transientState.enemy.hp < 0) this.transientState.enemy.hp = 0;

                console.log('攻击后HP:', this.transientState.enemy.hp);

                // 暴击显示
                if (playerCrit) {
                    this.showDamage(this.battle3D.enemy, playerDamage, 'crit');
                    const critPercent = Math.floor((playerCritResult.multiplier - 1) * 100);
                    this.addBattleLog(`💥暴击！(+${critPercent}%) 你对${this.transientState.enemy.name}造成了${playerDamage}点伤害！`);

                    // ✅ 暴击爆炸特效
                    if (this.battle3D && this.battle3D.enemy) {
                        const critPosition = this.battle3D.enemy.position.clone();
                        critPosition.y = 1.0;
                        this.createCriticalHitEffect(critPosition, 'gold');
                    }

                    // ✅ 暴击时相机震动 + 光照闪光
                    this.cameraShake(0.08, 250);
                    this.lightFlash(3.0, 200, new BABYLON.Color3(1.0, 0.9, 0.6));
                } else {
                    this.showDamage(this.battle3D.enemy, playerDamage, 'red');
                    this.addBattleLog(`你对${this.transientState.enemy.name}造成了${playerDamage}点伤害！`);
                }
                this.playEnemyHitAnimation();

                console.log('检查敌人是否死亡，当前HP:', this.transientState.enemy.hp, '<= 0 ?', this.transientState.enemy.hp <= 0);
                if (this.transientState.enemy.hp <= 0) {
                    console.log('✅ 敌人HP归零，调用enemyDefeated');
                    // ✅ 敌人死亡爆炸特效
                    if (this.battle3D && this.battle3D.enemy) {
                        const deathPosition = this.battle3D.enemy.position.clone();
                        deathPosition.y = 1.0;
                        this.createKillEffect(deathPosition);
                    }
                    // ✅ 击杀时强烈震动 + 白色闪光
                    this.cameraShake(0.12, 400);
                    this.lightFlash(4.0, 300, new BABYLON.Color3(1.0, 0.95, 0.9));
                    this.enemyDefeated();
                    return;
                }
            } else {
                this.addBattleLog(`你的攻击被${this.transientState.enemy.name}闪避了！`);
                this.showDodge(this.battle3D.enemy, '闪避！');
                // ✅ 闪避残影特效
                if (this.battle3D && this.battle3D.enemy) {
                    const dodgePosition = this.battle3D.enemy.position.clone();
                    dodgePosition.y = 1.0;
                    this.createDodgeEffect(dodgePosition);
                }
            }
        },
        // === 结束回调：玩家返回后，触发敌人反击 ===
        () => {
            if (this.transientState.enemy.hp <= 0) return;

            // 播放敌人攻击动画（先播放动画，在碰撞回调中判定闪避/防御/伤害）
            this.playEnemyAttackAnimation(
                // 敌人碰撞回调：敌人到达玩家位置时，先判定闪避再消耗状态
                () => {
                    if (!enemyHit) {
                        // 闪避成功，不消耗任何防御状态
                        this.addBattleLog(`你闪避了${this.transientState.enemy.name}的攻击！`);
                        this.showDodge(this.battle3D.player, '闪避！');
                    } else if (this.persistentState.player.immuneNextAttack) {
                        this.persistentState.player.immuneNextAttack = false;
                        this.addBattleLog(`你完全免疫了${this.transientState.enemy.name}的攻击！`);
                    } else if (this.persistentState.player.defenseActive) {
                        let finalEnemyDamage = Math.max(1, Math.floor(enemyDamage * 0.5));
                        if (this.transientState.enemy.isBoss && this.transientState.enemy.energy >= 50) {
                            const skillDamage = Math.floor(enemyDamage * 1.5);
                            finalEnemyDamage = Math.max(1, Math.floor((skillDamage) * 0.5));
                            this.transientState.enemy.energy -= 50;
                            this.addBattleLog(`${this.transientState.enemy.name}释放了技能，对你造成了${finalEnemyDamage}点伤害！（防御减免50%）`);
                        } else if (enemyCrit) {
                            const critPercent = Math.floor((enemyCritResult.multiplier - 1) * 100);
                            const reductionText = tenacityReduction > 0 ? ` 韧性减免${Math.floor(tenacityReduction * 100)}%` : '';
                            this.addBattleLog(`💥暴击！(+${critPercent}%) ${this.transientState.enemy.name}！对你造成了${finalEnemyDamage}点伤害！（防御减免50%${reductionText}）`);
                        } else {
                            this.addBattleLog(`${this.transientState.enemy.name}对你造成了${finalEnemyDamage}点伤害！（防御减免50%）`);
                        }
                        this.persistentState.player.defenseActive = false;
                        this.removeDefenseEffect();

                        // 护盾吸收
                        let actualDamage = finalEnemyDamage;
                        if (this.persistentState.player.shieldValue && this.persistentState.player.shieldValue > 0) {
                            if (this.persistentState.player.shieldValue >= actualDamage) {
                                this.persistentState.player.shieldValue -= actualDamage;
                                this.addBattleLog(`护盾吸收了${actualDamage}点伤害！剩余护盾：${this.persistentState.player.shieldValue}`);
                                actualDamage = 0;
                            } else {
                                const absorbed = this.persistentState.player.shieldValue;
                                actualDamage -= this.persistentState.player.shieldValue;
                                this.persistentState.player.shieldValue = 0;
                                this.addBattleLog(`护盾吸收了${absorbed}点伤害，护盾破碎！剩余伤害：${actualDamage}`);

                                // ✅ 护盾破碎特效
                                if (this.battle3D && this.battle3D.player) {
                                    const shieldBreakPosition = this.battle3D.player.position.clone();
                                    shieldBreakPosition.y = 1.0;
                                    this.createShieldBreakEffect(shieldBreakPosition);
                                }
                            }
                        }
                        if (actualDamage > 0) {
                            this.persistentState.player.hp -= actualDamage;
                            if (this.persistentState.player.hp < 0) this.persistentState.player.hp = 0;
                            this.playPlayerHitAnimation();
                            this.showDamage(this.battle3D.player, actualDamage, 'red');
                        }
                    } else {
                        let finalEnemyDamage = enemyDamage;
                        if (this.transientState.enemy.isBoss && this.transientState.enemy.energy >= 50) {
                            const skillDamage = Math.floor(enemyDamage * 1.5);
                            finalEnemyDamage = skillDamage;
                            this.transientState.enemy.energy -= 50;
                            this.addBattleLog(`${this.transientState.enemy.name}释放了技能，对你造成了${finalEnemyDamage}点伤害！`);
                        } else if (enemyCrit) {
                            const critPercent = Math.floor((enemyCritResult.multiplier - 1) * 100);
                            const reductionText = tenacityReduction > 0 ? ` 韧性减免${Math.floor(tenacityReduction * 100)}%` : '';
                            this.addBattleLog(`💥暴击！(+${critPercent}%) ${this.transientState.enemy.name}！对你造成了${finalEnemyDamage}点伤害！${reductionText}`);
                        } else {
                            this.addBattleLog(`${this.transientState.enemy.name}对你造成了${finalEnemyDamage}点伤害！`);
                        }

                        // 护盾吸收
                        let actualDamage = finalEnemyDamage;
                        if (this.persistentState.player.shieldValue && this.persistentState.player.shieldValue > 0) {
                            if (this.persistentState.player.shieldValue >= actualDamage) {
                                this.persistentState.player.shieldValue -= actualDamage;
                                this.addBattleLog(`护盾吸收了${actualDamage}点伤害！剩余护盾：${this.persistentState.player.shieldValue}`);
                                actualDamage = 0;
                            } else {
                                const absorbed = this.persistentState.player.shieldValue;
                                actualDamage -= this.persistentState.player.shieldValue;
                                this.persistentState.player.shieldValue = 0;
                                this.addBattleLog(`护盾吸收了${absorbed}点伤害，护盾破碎！剩余伤害：${actualDamage}`);

                                // ✅ 护盾破碎特效
                                if (this.battle3D && this.battle3D.player) {
                                    const shieldBreakPosition = this.battle3D.player.position.clone();
                                    shieldBreakPosition.y = 1.0;
                                    this.createShieldBreakEffect(shieldBreakPosition);
                                }
                            }
                        }
                        if (actualDamage > 0) {
                            this.persistentState.player.hp -= actualDamage;
                            if (this.persistentState.player.hp < 0) this.persistentState.player.hp = 0;
                            this.playPlayerHitAnimation();
                            this.showDamage(this.battle3D.player, actualDamage, 'red');
                        }
                    }
                },
                // 敌人结束回调
                () => {
                    if (this.transientState.enemy.isBoss) {
                        this.transientState.enemy.energy = Math.min(this.transientState.enemy.energy + 20, this.transientState.enemy.maxEnergy);
                    }
                    if (this.persistentState.player.hp <= 0) {
                        this.playerDefeated();
                    }
                    this.updateUI();
                    this.updateHealthBars();
                }
            );
        }
    );

    // 播放攻击声音
    this.audioSystem.playSound('attack-sound', 1, 200);
};

// 使用技能攻击敌人（按类型使用装备的技能）
EndlessCultivationGame.prototype.useSkill = function(skillType = 'attack') {
    if (!this.transientState.battle.inBattle) {
        this.addBattleLog('只有在战斗模式中才能使用技能！');
        return;
    }

    // 获取指定类型的装备技能
    const equippedSkillId = this.persistentState.player.skills.equipped?.[skillType];

    if (!equippedSkillId) {
        const typeNames = { attack: '攻击', defense: '防御', recovery: '恢复', special: '特殊' };
        this.addBattleLog(`${typeNames[skillType] || skillType}槽位没有装备技能！右键选择技能`);
        return;
    }

    // 获取技能等级
    const skillLevel = this.persistentState.player.skills.levels?.[equippedSkillId] || 0;
    if (skillLevel === 0) {
        this.addBattleLog(`技能尚未学习！`);
        return;
    }

    // 获取技能树数据
    const skillTree = this.metadata.realmSkills?.find(tree => tree.id === equippedSkillId);
    if (!skillTree) {
        this.addBattleLog(`找不到技能树：${equippedSkillId}`);
        return;
    }

    // 获取当前等级的技能数据
    const skill = skillTree.levels[skillLevel - 1];
    if (!skill) {
        this.addBattleLog(`找不到技能数据：${equippedSkillId} Level ${skillLevel}`);
        return;
    }

    // 获取技能显示名称（优先使用baseDisplayName，否则使用name）
    const skillDisplayName = skillTree.baseDisplayName || skill.name || '未知技能';

    // 确保有足够的灵力
    if (this.persistentState.player.energy < skill.energyCost) {
        this.addBattleLog(`灵力不足！需要${skill.energyCost}灵力`);
        return;
    }

    // 播放技能声音 - 根据技能类型和元素选择音效
    if (skill.soundUrl) {
        // 如果有自定义音效URL，使用自定义音效
        this.audioSystem.playSkillSound(skill.soundUrl);
    } else {
        // 根据技能类型选择音效
        const skillTreeType = skillTree.type; // 'attack', 'defense', 'heal', 'special'
        const skillElement = this.getSkillElementType(skill);

        if (skillTreeType === 'defense') {
            // 防御系：低沉护盾音效
            this.audioSystem.playSound('skill-defense-sound', 0.7, 300);
        } else if (skillTreeType === 'heal') {
            // 恢复系：轻柔治疗音效
            this.audioSystem.playSound('skill-heal-sound', 0.6, 300);
        } else if (skillTreeType === 'special') {
            // 特殊系：风属性音效
            this.audioSystem.playSound('skill-special-sound', 0.6, 300);
        } else {
            // 攻击系：根据元素类型选择音效
            if (skillElement === 'fire') {
                this.audioSystem.playSound('skill-1-sound', 0.8, 300);
            } else if (skillElement === 'ice') {
                this.audioSystem.playSound('skill-2-sound', 0.7, 300);
            } else if (skillElement === 'thunder') {
                this.audioSystem.playSound('skill-3-sound', 0.7, 300);
            } else {
                // 默认攻击音效
                this.audioSystem.playSound('skill-0-sound', 0.7, 300);
            }
        }
    }

    // 获取实际属性（包含装备和境界加成）
    const playerStats = this.getActualStats();
    const enemyStats = this.getEnemyActualStats();

    const finalAttack = playerStats.attack;
    const finalDefense = playerStats.defense;
    const finalAccuracy = playerStats.accuracy;
    const finalDodge = playerStats.dodgeRate;
    const finalCriticalRate = playerStats.criticalRate;
    const playerCritDamage = playerStats.critDamage;
    const enemyAccuracy = enemyStats.accuracy;
    const enemyDodge = enemyStats.dodgeRate;
    const enemyDefense = enemyStats.defense;

    let playerDamage = 0;
    let hit = true;
    let isLuckyStrike = false;
    let playerCrit = false;
    let playerCritResult = null;

    // === 伤害类技能：预计算伤害，使用碰撞回调 ===
    if (skill.damageMultiplier || skill.criticalMultiplier) {
        // 预计算命中和伤害（动画前确定随机值）
        // accuracy/dodgeRate 内部是小数格式，乘100转为百分比
        const playerHitChance = Math.min(95, Math.max(5, finalAccuracy * 100 - enemyDodge * 100));
        hit = Math.random() * 100 < playerHitChance;

        if (hit) {
            if (skill.damageMultiplier) {
                // 计算技能基础伤害
                let baseSkillDamage = Math.floor(finalAttack * skill.damageMultiplier) - enemyDefense;
                if (skill.extraDamagePercent) baseSkillDamage += Math.floor(this.transientState.enemy.maxHp * skill.extraDamagePercent);
                if (skill.ignoreDefense) baseSkillDamage += Math.floor(enemyDefense * skill.ignoreDefense);

                // ✅ 暴击判定（使用玩家暴击率和暴击伤害）
                playerCrit = Math.random() * 100 < finalCriticalRate * 100;

                if (playerCrit) {
                    playerCritResult = this.rollCritDamage(playerCritDamage);
                    playerDamage = Math.max(1, Math.floor(baseSkillDamage * playerCritResult.multiplier));
                } else {
                    playerDamage = Math.max(1, baseSkillDamage);
                }
            } else if (skill.criticalMultiplier) {
                isLuckyStrike = Math.random() < skill.criticalChance;
                playerDamage = isLuckyStrike
                    ? Math.max(1, Math.floor(finalAttack * skill.criticalMultiplier) - enemyDefense)
                    : Math.max(1, finalAttack - enemyDefense);
            }
        }

        const skillEffectColor = skill.effectColor || { r: 0, g: 0.5, b: 1 };

        // ✅ 技能释放前摇能量聚集特效
        if (this.battle3D && this.battle3D.player) {
            const chargePosition = this.battle3D.player.position.clone();
            chargePosition.y = 1.0;
            const skillColor3 = new BABYLON.Color3(
                skillEffectColor.r,
                skillEffectColor.g,
                skillEffectColor.b
            );
            this.createSkillChargeEffect(chargePosition, skillColor3, 400);
        }

        // ✅ 技能释放时光照闪光
        this.lightFlash(2.5, 150, new BABYLON.Color3(
            skillEffectColor.r,
            skillEffectColor.g,
            skillEffectColor.b
        ));

        this.playSkillAttackAnimation(isLuckyStrike, skillEffectColor,
            // 碰撞回调：到达敌人时显示伤害
            () => {
                this.persistentState.player.energy -= skill.energyCost;
                this.showEnergyChange(this.battle3D.player, -skill.energyCost);

                if (hit) {
                    // ✅ 创建技能爆发特效（元素爆炸，在敌人躯干位置）
                    if (this.battle3D.enemy) {
                        const burstPosition = this.battle3D.enemy.position.clone();
                        burstPosition.y = 1.0; // ✅ 躯干高度

                        this.createSkillBurstEffect(
                            burstPosition,
                            this.getSkillElementType(skill)
                        );
                    }

                    this.showDamage(this.battle3D.enemy, playerDamage, playerCrit ? 'crit' : 'red');
                    this.playEnemyHitAnimation();
                    if (playerCrit) {
                        const critPercent = Math.floor((playerCritResult.multiplier - 1) * 100);
                        this.addBattleLog(`💥暴击！(+${critPercent}%) 你使用了${skillDisplayName}，对${this.transientState.enemy.name}造成了${playerDamage}点伤害！`);

                        // ✅ 暴击爆炸特效
                        if (this.battle3D && this.battle3D.enemy) {
                            const critPosition = this.battle3D.enemy.position.clone();
                            critPosition.y = 1.0;
                            this.createCriticalHitEffect(critPosition, 'red');
                        }

                        // ✅ 暴击时相机震动 + 红色光照闪光
                        this.cameraShake(0.1, 280);
                        this.lightFlash(3.5, 220, new BABYLON.Color3(1.0, 0.7, 0.5));
                    } else if (isLuckyStrike) {
                        this.addBattleLog(`你使用了${skillDisplayName}，触发了暴击！对${this.transientState.enemy.name}造成了${playerDamage}点伤害！`);

                        // ✅ 暴击爆炸特效
                        if (this.battle3D && this.battle3D.enemy) {
                            const critPosition = this.battle3D.enemy.position.clone();
                            critPosition.y = 1.0;
                            this.createCriticalHitEffect(critPosition, 'red');
                        }

                        // ✅ 幸运暴击也震动
                        this.cameraShake(0.1, 280);
                        this.lightFlash(3.5, 220, new BABYLON.Color3(1.0, 0.7, 0.5));
                    } else {
                        this.addBattleLog(`你使用了${skillDisplayName}，对${this.transientState.enemy.name}造成了${playerDamage}点伤害！`);
                    }
                } else {
                    this.addBattleLog(`你的${skillDisplayName}被${this.transientState.enemy.name}闪避了！`);
                    this.showDodge(this.battle3D.enemy, '闪避！');
                    // ✅ 闪避残影特效
                    if (this.battle3D && this.battle3D.enemy) {
                        const dodgePosition = this.battle3D.enemy.position.clone();
                        dodgePosition.y = 1.0;
                        this.createDodgeEffect(dodgePosition);
                    }
                }
            },
            // 结束回调：应用状态、触发反击
            () => {
                if (playerDamage > 0 && hit) {
                    this.transientState.enemy.hp -= playerDamage;
                    if (this.transientState.enemy.hp < 0) this.transientState.enemy.hp = 0;
                    if (this.transientState.enemy.hp <= 0) {
                        // ✅ 技能击杀特效
                        if (this.battle3D && this.battle3D.enemy) {
                            const killPosition = this.battle3D.enemy.position.clone();
                            killPosition.y = 1.0;
                            this.createKillEffect(killPosition);
                        }
                        // ✅ 技能击杀时强烈震动 + 彩色闪光
                        this.cameraShake(0.12, 400);
                        this.lightFlash(4.0, 300, new BABYLON.Color3(
                            skillEffectColor.r,
                            skillEffectColor.g,
                            skillEffectColor.b
                        ));
                        this.enemyDefeated();
                        return;
                    }
                }
                // 应用buff/debuff等效果
                if (skill.energyRecover) {
                    const recoverAmount = Math.min(skill.energyRecover, this.persistentState.player.maxEnergy - this.persistentState.player.energy);
                    this.persistentState.player.energy += recoverAmount;
                    if (recoverAmount > 0) this.addBattleLog(`恢复了${recoverAmount}点灵力！`);
                }
                if (skill.immuneNextAttack) { this.persistentState.player.immuneNextAttack = true; this.addBattleLog(`你获得了免疫状态，下次攻击将被完全抵挡！`); }
                if (skill.shield) {
                    this.persistentState.player.shieldValue = (this.persistentState.player.shieldValue || 0) + skill.shield;
                    this.addBattleLog(`获得了${skill.shield}点护盾！当前护盾：${this.persistentState.player.shieldValue}`);
                    // ✅ 创建护盾特效
                    if (typeof this.createDefenseEffect === 'function') {
                        this.createDefenseEffect();
                    }
                }
                if (skill.effects && skill.effects.length > 0) this.processSkillEffects(skill.effects);
                if (skill.buffs && skill.buffs.length > 0) {
                    if (!this.persistentState.player.buffs) this.persistentState.player.buffs = [];
                    skill.buffs.forEach(b => this.persistentState.player.buffs.push({ type: b.type, value: b.value, turns: b.turns }));
                    this.addBattleLog(`获得了${skill.buffs.length}个持续增益效果！`);
                }
                if (skill.debuffs && skill.debuffs.length > 0) {
                    if (!this.transientState.enemy.debuffs) this.transientState.enemy.debuffs = [];
                    skill.debuffs.forEach(d => this.transientState.enemy.debuffs.push({ type: d.type, value: d.value, turns: d.turns }));
                    this.addBattleLog(`对敌人施加了${skill.debuffs.length}个减益效果！`);
                }
                // 敌人反击
                this.triggerEnemyCounterattack(finalDefense, enemyAccuracy, finalDodge);
            }
        );
        return;
    }

    // === 非伤害类技能：使用原有逻辑 ===
    // 技能效果处理函数
    const handleSkillEffect = () => {
        // 消耗灵力
        this.persistentState.player.energy -= skill.energyCost;
        // 显示灵力消耗
        this.showEnergyChange(this.battle3D.player, -skill.energyCost);

        if (skill.defenseBonus) {
            this.persistentState.player.defenseActive = true;
            this.persistentState.player.defenseBonusValue = skill.defenseBonus;
            this.addBattleLog(`你使用了${skillDisplayName}，防御姿态已激活！下次受到的伤害减少${Math.floor(skill.defenseBonus * 100)}%！`);
        } else if (skill.healPercentage) {
            // 使用公共方法获取实际最大血量
            const actualMaxHp = this.getActualStats().maxHp;
            const healAmount = Math.floor(actualMaxHp * skill.healPercentage);
            this.persistentState.player.hp = Math.min(this.persistentState.player.hp + healAmount, actualMaxHp);
            this.addBattleLog(`你使用了${skillDisplayName}，恢复了${healAmount}点生命值！`);
            this.showDamage(this.battle3D.player, healAmount, 'green');
            // ✅ 创建治疗特效（绿色光华）
            if (typeof this.createHealEffect === 'function') {
                this.createHealEffect();
            }
        } else if (skill.dodgeBonus) {
            this.persistentState.player.dodgeActive = true;
            this.persistentState.player.dodgeBonus = skill.dodgeBonus;
            this.addBattleLog(`你使用了${skillDisplayName}，提高了闪避率！`);
            // ✅ 创建闪避技能释放特效（风属性残影）
            if (this.battle3D && this.battle3D.player && typeof this.createDodgeEffect === 'function') {
                const playerPosition = this.battle3D.player.position.clone();
                playerPosition.y = 1.0;
                this.createDodgeEffect(playerPosition);
            }
        }

        if (skill.energyRecover) {
            const recoverAmount = Math.min(skill.energyRecover, this.persistentState.player.maxEnergy - this.persistentState.player.energy);
            this.persistentState.player.energy += recoverAmount;
            this.addBattleLog(`恢复了${recoverAmount}点灵力！`);
        }
        if (skill.immuneNextAttack) { this.persistentState.player.immuneNextAttack = true; this.addBattleLog(`你获得了免疫状态，下次攻击将被完全抵挡！`); }
        if (skill.shield) {
            this.persistentState.player.shieldValue = (this.persistentState.player.shieldValue || 0) + skill.shield;
            this.addBattleLog(`获得了${skill.shield}点护盾！当前护盾：${this.persistentState.player.shieldValue}`);
            // ✅ 创建护盾特效
            if (typeof this.createDefenseEffect === 'function') {
                this.createDefenseEffect();
            }
        }
        if (skill.effects && skill.effects.length > 0) this.processSkillEffects(skill.effects);
        if (skill.buffs && skill.buffs.length > 0) {
            if (!this.persistentState.player.buffs) this.persistentState.player.buffs = [];
            skill.buffs.forEach(b => this.persistentState.player.buffs.push({ type: b.type, value: b.value, turns: b.turns }));
            this.addBattleLog(`获得了${skill.buffs.length}个持续增益效果！`);
        }
        if (skill.debuffs && skill.debuffs.length > 0) {
            if (!this.transientState.enemy.debuffs) this.transientState.enemy.debuffs = [];
            skill.debuffs.forEach(d => this.transientState.enemy.debuffs.push({ type: d.type, value: d.value, turns: d.turns }));
            this.addBattleLog(`对敌人施加了${skill.debuffs.length}个减益效果！`);
        }

        this.updateUI();
        this.updateHealthBars();
    };

    if (skill.defenseBonus) {
        this.playDefenseAnimation(handleSkillEffect);
    } else {
        handleSkillEffect();
    }
};

/**
 * 计算敌人攻击（统一函数，避免代码重复）
 * @param {number} finalDefense - 玩家防御力
 * @param {number} enemyAccuracy - 敌人命中率（小数格式，如0.95表示95%）
 * @param {number} finalDodge - 玩家闪避率（小数格式，如0.50表示50%）
 * @param {boolean} useDodgeBonus - 是否使用闪避技能加成（默认false）
 * @returns {Object} { enemyHit, enemyDamage, enemyCrit, enemyCritResult, tenacityReduction }
 */
EndlessCultivationGame.prototype.calculateEnemyAttack = function(finalDefense, enemyAccuracy, finalDodge, useDodgeBonus = false) {
    const enemyStats = this.getEnemyActualStats();
    const playerStats = this.getActualStats();
    const enemyAttack = enemyStats.attack;
    const enemyCriticalRate = enemyStats.criticalRate;
    const enemyCritDamage = enemyStats.critDamage;
    const playerTenacity = playerStats.tenacity || 0;

    // 敌人伤害计算
    const enemyMinDamage = Math.floor(enemyAttack * 0.2);
    const enemyBaseDamage = Math.max(enemyMinDamage, enemyAttack - finalDefense);

    // 命中判定
    let enemyHitChance = Math.min(95, Math.max(5, (enemyAccuracy - finalDodge) * 100));

    // 闪避技能加成（仅在useDodgeBonus=true时生效）
    if (useDodgeBonus && this.persistentState.player.dodgeActive && this.persistentState.player.dodgeBonus) {
        enemyHitChance -= this.persistentState.player.dodgeBonus * 100;
        enemyHitChance = Math.max(5, enemyHitChance);
        this.persistentState.player.dodgeActive = false;
        this.persistentState.player.dodgeBonus = 0;
    }

    const enemyHit = Math.random() * 100 < enemyHitChance;

    // 暴击判定和伤害（应用韧性减免）
    let enemyCritResult = null;
    let tenacityReduction = 0;
    const enemyCrit = enemyHit && Math.random() * 100 < enemyCriticalRate * 100;
    const enemyDamage = enemyCrit
        ? (() => {
            enemyCritResult = this.rollCritDamage(enemyCritDamage);
            // 韧性减免：reduction = tenacity / (tenacity + 1)
            tenacityReduction = playerTenacity / (playerTenacity + 1);
            const reducedMultiplier = enemyCritResult.multiplier * (1 - tenacityReduction);
            return Math.max(1, Math.floor(enemyBaseDamage * Math.max(reducedMultiplier, 1.1)));
        })()
        : enemyBaseDamage;

    return {
        enemyHit,
        enemyDamage,
        enemyCrit,
        enemyCritResult,
        tenacityReduction
    };
};

// 敌人反击通用函数（供技能使用）
EndlessCultivationGame.prototype.triggerEnemyCounterattack = function(finalDefense, enemyAccuracy, finalDodge) {
    // 敌人反击（使用统一函数计算）
    const {
        enemyHit,
        enemyDamage,
        enemyCrit,
        enemyCritResult,
        tenacityReduction
    } = this.calculateEnemyAttack(finalDefense, enemyAccuracy, finalDodge, true);
    let isImmune = false;
    let finalEnemyDamage = enemyDamage;

    this.playEnemyAttackAnimation(
        // 碰撞回调
        () => {
            if (!enemyHit) {
                this.addBattleLog(`你闪避了${this.transientState.enemy.name}的攻击！`);
                this.showDodge(this.battle3D.player, '闪避！');
            } else if (this.persistentState.player.immuneNextAttack) {
                this.persistentState.player.immuneNextAttack = false;
                this.addBattleLog(`你完全免疫了${this.transientState.enemy.name}的攻击！`);
                isImmune = true;
            } else if (this.persistentState.player.defenseActive) {
                const reductionRate = this.persistentState.player.defenseBonusValue || 0.5;
                finalEnemyDamage = Math.max(1, Math.floor(enemyDamage * (1 - reductionRate)));
                if (this.transientState.enemy.isBoss && this.transientState.enemy.energy >= 50) {
                    finalEnemyDamage = Math.max(1, Math.floor(enemyDamage * 1.5 * (1 - reductionRate)));  // 技能伤害×1.5，然后防御减免
                    this.transientState.enemy.energy -= 50;
                    this.addBattleLog(`${this.transientState.enemy.name}释放了技能，对你造成了${finalEnemyDamage}点伤害！（防御减免${Math.floor(reductionRate * 100)}%）`);
                } else if (enemyCrit) {
                    const critPercent = Math.floor((enemyCritResult.multiplier - 1) * 100);
                    const reductionText = tenacityReduction > 0 ? ` 韧性减免${Math.floor(tenacityReduction * 100)}%` : '';
                    this.addBattleLog(`💥暴击！(+${critPercent}%) ${this.transientState.enemy.name}！对你造成了${finalEnemyDamage}点伤害！（防御减免${Math.floor(reductionRate * 100)}%${reductionText}）`);
                } else {
                    this.addBattleLog(`${this.transientState.enemy.name}对你造成了${finalEnemyDamage}点伤害！（防御减免${Math.floor(reductionRate * 100)}%）`);
                }
                this.persistentState.player.defenseActive = false;
                this.persistentState.player.defenseBonusValue = 0;
                this.removeDefenseEffect();
            } else {
                if (this.transientState.enemy.isBoss && this.transientState.enemy.energy >= 50) {
                    const skillDmg = Math.floor(enemyDamage * 1.5);
                    finalEnemyDamage = enemyDamage + skillDmg;
                    this.transientState.enemy.energy -= 50;
                    this.addBattleLog(`${this.transientState.enemy.name}释放了技能，对你造成了${finalEnemyDamage}点伤害！`);
                } else if (enemyCrit) {
                    finalEnemyDamage = enemyDamage;
                    const critPercent = Math.floor((enemyCritResult.multiplier - 1) * 100);
                    const reductionText = tenacityReduction > 0 ? ` 韧性减免${Math.floor(tenacityReduction * 100)}%` : '';
                    this.addBattleLog(`💥暴击！(+${critPercent}%) ${this.transientState.enemy.name}！对你造成了${finalEnemyDamage}点伤害！${reductionText}`);
                } else {
                    finalEnemyDamage = enemyDamage;
                    this.addBattleLog(`${this.transientState.enemy.name}对你造成了${finalEnemyDamage}点伤害！`);
                }
            }

            if (!isImmune && enemyHit) {
                let actualDamage = finalEnemyDamage;
                if (this.persistentState.player.shieldValue && this.persistentState.player.shieldValue > 0) {
                    if (this.persistentState.player.shieldValue >= actualDamage) {
                        this.persistentState.player.shieldValue -= actualDamage;
                        this.addBattleLog(`护盾吸收了${actualDamage}点伤害！剩余护盾：${this.persistentState.player.shieldValue}`);
                        actualDamage = 0;
                    } else {
                        const absorbed = this.persistentState.player.shieldValue;
                        actualDamage -= this.persistentState.player.shieldValue;
                        this.persistentState.player.shieldValue = 0;
                        this.addBattleLog(`护盾吸收了${absorbed}点伤害，护盾破碎！剩余伤害：${actualDamage}`);

                        // ✅ 护盾破碎特效
                        if (this.battle3D && this.battle3D.player) {
                            const shieldBreakPosition = this.battle3D.player.position.clone();
                            shieldBreakPosition.y = 1.0;
                            this.createShieldBreakEffect(shieldBreakPosition);
                        }
                    }
                }
                if (actualDamage > 0) {
                    this.persistentState.player.hp -= actualDamage;
                    if (this.persistentState.player.hp < 0) this.persistentState.player.hp = 0;
                    this.playPlayerHitAnimation();
                    this.showDamage(this.battle3D.player, actualDamage, 'red');
                }
            }
        },
        // 结束回调
        () => {
            if (this.transientState.enemy.isBoss) {
                this.transientState.enemy.energy = Math.min(this.transientState.enemy.energy + 20, this.transientState.enemy.maxEnergy);
            }
            if (this.persistentState.player.hp <= 0) this.playerDefeated();
            this.updateUI();
            this.updateHealthBars();
        }
    );
};

// 敌人被击败
EndlessCultivationGame.prototype.enemyDefeated = function() {
    // 图鉴：记录击杀敌人
    if (this.collectionSystem) {
        this.collectionSystem.recordEnemy(this.transientState.enemy);
    }

    // 显示敌人倒地的画面
    this.showEnemyDefeatedAnimation();

    // 设置敌人被击败状态
    if (this.battle3D) {
        this.battle3D.enemyDefeated = true;
    }

    // 播放胜利声音
    this.audioSystem.playSound('victory-sound', 1, 1000);

    // 获得经验
    const expMultiplier = this.transientState.enemy.expMultiplier || 1;
    const expGained = Math.floor(this.transientState.enemy.level * 20 * expMultiplier);
    this.persistentState.player.exp += expGained;

    // 精英怪额外提示
    if (this.transientState.enemy.isElite) {
        this.addBattleLog(`你击败了${this.transientState.enemy.name}！`);
        this.addBattleLog(`精英敌人奖励翻倍！获得了${expGained}点经验！`);
    } else {
        this.addBattleLog(`你击败了${this.transientState.enemy.name}，获得了${expGained}点经验！`);
    }

    // 获得资源（v2.0资源系统统一 - 使用新资源）
    const resourceMultiplier = this.transientState.enemy.resourceMultiplier || 1;
    const herbsGained = Math.floor((this.transientState.enemy.level * 5 + Math.random() * 5) * resourceMultiplier);
    const ironGained = Math.floor((this.transientState.enemy.level * 2 + Math.random() * 3) * resourceMultiplier);
    const spiritStonesGained = Math.floor((this.transientState.enemy.level * 1 + Math.random() * 2) * resourceMultiplier);

    this.persistentState.resources.herbs += herbsGained;
    this.persistentState.resources.iron += ironGained;
    this.persistentState.resources.spiritStones += spiritStonesGained;

    this.addBattleLog(`获得了${herbsGained}灵草，${ironGained}玄铁，${spiritStonesGained}灵石！`);

    // 杀死敌人恢复灵力
    const killEnergyRecovery = 15;
    this.persistentState.player.energy = Math.min(this.persistentState.player.energy + killEnergyRecovery, this.persistentState.player.maxEnergy);
    this.addBattleLog(`杀死敌人恢复了${killEnergyRecovery}点灵力！`);

    // 杀死敌人恢复生命值
    const hpRecoveryPercent = 0.35; // 恢复35%最大HP（从20%提升）
    const hpRecovery = Math.floor(this.persistentState.player.maxHp * hpRecoveryPercent);
    const actualHpRecovered = Math.min(hpRecovery, this.persistentState.player.maxHp - this.persistentState.player.hp);
    if (actualHpRecovered > 0) {
        this.persistentState.player.hp += actualHpRecovered;
        this.addBattleLog(`战斗胜利恢复了${actualHpRecovered}点生命值！`);
        this.showDamage(this.battle3D.player, actualHpRecovered, 'green');
    }

    // 装备掉落
    const droppedEquipment = this.equipmentSystem.generateEquipmentDrop();
    if (droppedEquipment) {
        // 图鉴：记录获取装备
        if (this.collectionSystem) {
            this.collectionSystem.recordEquipment(droppedEquipment);
        }
        const equipped = this.checkAndEquipBetterGear(droppedEquipment);
        if (!equipped) {
            this.persistentState.player.inventory.push(droppedEquipment);
            this.addBattleLog(`获得了${droppedEquipment.rarityDisplayName} ${droppedEquipment.name}，已放入背包！`);
        } else {
            this.addBattleLog(`获得了${droppedEquipment.rarityDisplayName} ${droppedEquipment.name}，属性更好，已自动装备！`);
        }
    } else {
        this.addBattleLog(`敌人没有掉落装备。`);
    }

    // 突破石掉落（只有BOSS有几率掉落）
    if (this.transientState.enemy.isBoss) {
        const realm = this.persistentState.player.realm;
        let dropChance = 0;
        
        // 根据境界和阶段计算掉落概率
        if (realm.currentRealm === 0) {
            // 武者境界
            if (realm.currentStage === 10) {
                // 武者巅峰级别，低概率掉落
                dropChance = 0.05; // 5%
            } else {
                // 武者非巅峰级别，不掉落
                dropChance = 0;
            }
        } else {
            // 炼气及以上境界，随着境界提高，掉落概率增加
            dropChance = 0.05 + (realm.currentRealm * 0.05); // 5% + 每提高一个境界增加5%
            dropChance = Math.min(dropChance, 0.5); // 最高50%概率
        }
        
        // 检查是否掉落突破石
        if (Math.random() < dropChance) {
            // 掉落1-3个突破石
            const stonesGained = Math.floor(Math.random() * 3) + 1;
            this.persistentState.resources.breakthroughStones = (this.persistentState.resources.breakthroughStones || 0) + stonesGained;
            this.addBattleLog(`获得了${stonesGained}个突破石！`);
        }
    }

    // 主线任务进度追踪 - 击杀敌人
    if (this.mainQuestSystem) {
        const enemy = this.transientState.enemy;
        this.mainQuestSystem.trackMainQuestProgress('enemy_killed', {
            name: enemy.name,
            isBoss: enemy.isBoss || false,
            isElite: enemy.isElite || false,
            type: enemy.isBoss ? 'boss' : (enemy.isElite ? 'elite' : 'normal')
        });
    }

    // 每日任务进度追踪 - 击杀敌人
    if (this.dailyQuestSystem) {
        const enemy = this.transientState.enemy;
        this.dailyQuestSystem.trackDailyQuestProgress('enemy_killed', {
            name: enemy.name,
            isBoss: enemy.isBoss || false,
            isElite: enemy.isElite || false,
            type: enemy.isBoss ? 'boss' : (enemy.isElite ? 'elite' : 'normal')
        });
    }

    // 检查升级
    this.checkLevelUp();

    // 更新UI
    this.updateUI();
    this.updateHealthBars();

    // ========== 副本战斗胜利处理 ==========
    // 如果是副本战斗，通知副本系统
    if (this.dungeon && this.dungeon.currentDungeon) {
        // 副本战斗胜利，不立即关闭战斗界面
        setTimeout(() => {
            this.dungeon.onBattleVictory();
        }, 1500);
    } else {
        // 普通战斗结束，延迟后关闭战斗模态窗口并返回主界面
        setTimeout(() => {
            this.closeBattleModal();
        }, 3000);
    }
};

// 玩家被击败
EndlessCultivationGame.prototype.playerDefeated = function() {
    if (this.battle3D) {
        this.battle3D.playerDefeated = true;
    }

    // 播放玩家倒地动画
    this.showPlayerDefeatedAnimation();

    // 播放失败声音
    this.audioSystem.playSound('defeat-sound', 1, 1000);

    this.addBattleLog(`你被${this.transientState.enemy.name}击败了！`);

    // 经验损失惩罚（损失20%经验）
    const expLoss = Math.floor(this.persistentState.player.exp * 0.2);
    this.persistentState.player.exp = Math.floor(this.persistentState.player.exp * 0.8);
    this.addBattleLog(`你失去了 ${expLoss} 点经验！(20%)`);

    // 重置玩家HP和灵力
    this.persistentState.player.hp = this.persistentState.player.maxHp;
    this.persistentState.player.energy = this.persistentState.player.maxEnergy;

    // 重置敌人HP/灵力
    this.transientState.enemy.hp = this.transientState.enemy.maxHp;
    this.transientState.enemy.energy = this.transientState.enemy.maxEnergy;

    // 更新UI
    this.updateUI();
    if (typeof this.updateHealthBars === 'function') {
        this.updateHealthBars();
    }

    // ========== 副本战斗失败处理 ==========
    // 如果是副本战斗，通知副本系统
    if (this.dungeon && this.dungeon.currentDungeon) {
        // 副本战斗失败
        setTimeout(() => {
            this.dungeon.onBattleDefeat();
        }, 2000);
    } else {
        // 普通战斗失败，关闭战斗模态窗口
        setTimeout(() => {
            this.closeBattleModal();
        }, 2000);
    }
};

// ==================== 升级系统 ====================

// 检查升级 - 使用 game.js 中的实现
// 注意：此函数在 game.js 中已有完整实现，这里保留为空以避免覆盖

// 尝试突破境界 - 使用 game.js 中的实现
// 注意：此函数在 game.js 中已有完整实现，这里保留为空以避免覆盖

// 触发升级动画 - 使用 game.js 中的实现
// 注意：此函数在 game.js 中已有完整实现，这里保留为空以避免覆盖

// 装备掉落 - 使用 equipmentSystem.generateEquipmentDrop()
// 注意：此函数已移至 equipment.js

// ==================== 战斗UI管理 ====================

// 关闭战斗模态窗口
EndlessCultivationGame.prototype.closeBattleModal = function() {
    const battleModal = document.getElementById('battle-modal');
    if (battleModal) {
        battleModal.classList.add('hidden');
    }

    // 停止战斗音乐
    this.audioSystem.stopBattleMusic();

    // ✅ 先清理所有战斗临时状态（必须在清理引擎之前）
    if (typeof this.clearBattleStates === 'function') {
        this.clearBattleStates();
    }

    // 清理3D场景
    if (this.battle3D && this.battle3D.engine) {
        try {
            this.battle3D.engine.dispose();
        } catch (e) {
            console.log('清理战斗场景引擎时出错:', e);
        }
    }

    // 清理容器
    const container = document.getElementById('battle-modal-3d-container');
    if (container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    // ✅ 然后清理 battle3D 对象
    this.battle3D = null;

    // ✅ 最后重置战斗状态
    if (this.transientState.battle) {
        this.transientState.battle.inBattle = false;
    }

    // 恢复地图场景
    this.restoreMapScene();
};

// 显示敌人被击败动画
EndlessCultivationGame.prototype.showEnemyDefeatedAnimation = function() {
    if (!this.battle3D || !this.battle3D.enemy) return;

    const enemy = this.battle3D.enemy;
    const originalPosition = enemy.position.clone();
    const originalRotation = enemy.rotation.clone();

    let animationProgress = 0;
    const animationDuration = 1000;
    const startTime = Date.now();

    const defeatAnimation = () => {
        const elapsed = Date.now() - startTime;
        animationProgress = Math.min(elapsed / animationDuration, 1);

        const fallProgress = animationProgress;

        enemy.position.y = originalPosition.y - fallProgress * 1.5;
        enemy.rotation.z = originalRotation.z + fallProgress * Math.PI / 2;

        if (animationProgress < 1) {
            requestAnimationFrame(defeatAnimation);
        }
    };

    defeatAnimation();
};

// ==================== 自动战斗 ====================

// 切换自动战斗
EndlessCultivationGame.prototype.toggleAutoBattle = function() {
    this.persistentState.settings.autoBattle = !this.persistentState.settings.autoBattle;

    if (this.persistentState.settings.autoBattle) {
        this.startAutoBattle();
        this.addBattleLog('已开启自动战斗');
    } else {
        this.stopAutoBattle();
        this.addBattleLog('已关闭自动战斗');
    }
};

// 开始自动战斗
EndlessCultivationGame.prototype.startAutoBattle = function() {
    if (!this.transientState.battle.inBattle) return;

    this.persistentState.settings.autoBattle = true;
    this.transientState.battle.autoBattleLoop = setInterval(() => {
        // 简单的自动攻击逻辑
        if (Math.random() < 0.3) {
            this.attackEnemy();
        }
    }, 1000);
};

// 停止自动战斗
EndlessCultivationGame.prototype.stopAutoBattle = function() {
    this.persistentState.settings.autoBattle = false;
    if (this.transientState.battle.autoBattleLoop) {
        clearInterval(this.transientState.battle.autoBattleLoop);
        this.transientState.battle.autoBattleLoop = null;
    }
};

// ==================== 技能效果处理 ====================

// 处理技能组合效果
EndlessCultivationGame.prototype.processSkillEffects = function(effects) {
    for (const effect of effects) {
        switch (effect.type) {
            case 'dodgeBonus':
                this.persistentState.player.dodgeActive = true;
                this.persistentState.player.dodgeBonus = effect.value;
                this.addBattleLog(`闪避率提升${Math.floor(effect.value * 100)}%！`);
                break;
            case 'energyRecover':
                const recoverAmount = Math.min(effect.value, this.persistentState.player.maxEnergy - this.persistentState.player.energy);
                this.persistentState.player.energy += recoverAmount;
                this.addBattleLog(`恢复了${recoverAmount}点灵力！`);
                break;
            case 'defenseBonus':
                this.persistentState.player.defenseActive = true;
                this.persistentState.player.defenseBonusValue = effect.value;
                this.addBattleLog(`防御提升，下次受伤减少${Math.floor(effect.value * 100)}%！`);
                break;
            case 'accuracyBonus':
                this.persistentState.player.tempAccuracyBonus = (this.persistentState.player.tempAccuracyBonus || 0) + effect.value;
                this.addBattleLog(`命中提升${Math.floor(effect.value * 100)}%！`);
                break;
            case 'healPercentage':
                // 使用公共方法获取实际最大血量
                const actualMaxHp = this.getActualStats().maxHp;
                const healAmount = Math.floor(actualMaxHp * effect.value);
                this.persistentState.player.hp = Math.min(this.persistentState.player.hp + healAmount, actualMaxHp);
                this.addBattleLog(`恢复了${healAmount}点生命值！`);
                this.showDamage(this.battle3D.player, healAmount, 'green');
                break;
            case 'allStatsBonus':
                // 全属性加成
                if (!this.persistentState.player.buffs) {
                    this.persistentState.player.buffs = [];
                }
                this.persistentState.player.buffs.push({
                    type: 'allStatsBonus',
                    value: effect.value,
                    turns: effect.turns || 3
                });
                this.addBattleLog(`全属性提升${Math.floor(effect.value * 100)}%，持续${effect.turns || 3}回合！`);
                break;
        }
    }
};

// 处理回合开始时的buff效果
EndlessCultivationGame.prototype.processBuffsAtTurnStart = function() {
    if (!this.persistentState.player.buffs || this.persistentState.player.buffs.length === 0) {
        return;
    }

    for (const buff of this.persistentState.player.buffs) {
        switch (buff.type) {
            case 'damageBonus':
                // 伤害加成已在使用技能时应用
                break;
            case 'allStatsBonus':
                // 全属性加成
                this.persistentState.player.tempAttackBonus = (this.persistentState.player.tempAttackBonus || 0) + buff.value;
                this.persistentState.player.tempDefenseBonus = (this.persistentState.player.tempDefenseBonus || 0) + buff.value;
                break;
            case 'skillCostReduce':
                // 技能消耗减少
                this.persistentState.player.tempSkillCostReduce = buff.value;
                break;
        }
    }
};

// 处理回合结束时的buff/debuff衰减
EndlessCultivationGame.prototype.processBuffDecay = function() {
    // 处理玩家buff衰减
    if (this.persistentState.player.buffs) {
        this.persistentState.player.buffs = this.persistentState.player.buffs.filter(buff => {
            buff.turns--;
            if (buff.turns <= 0) {
                this.addBattleLog(`${buff.type}效果已消失`);
                return false;
            }
            return true;
        });
    }

    // 处理敌人debuff衰减
    if (this.transientState.enemy.debuffs) {
        this.transientState.enemy.debuffs = this.transientState.enemy.debuffs.filter(debuff => {
            debuff.turns--;
            if (debuff.turns <= 0) {
                this.addBattleLog(`敌人的${debuff.type}效果已消失`);
                return false;
            }
            return true;
        });
    }

    // 清除临时加成
    this.persistentState.player.tempAttackBonus = 0;
    this.persistentState.player.tempDefenseBonus = 0;
    this.persistentState.player.tempAccuracyBonus = 0;
    this.persistentState.player.tempSkillCostReduce = 0;
};

/**
 * 清理所有战斗临时状态（退出战斗时统一调用）
 * 用途：战斗胜利、战斗失败、手动退出战斗时都会调用此函数
 */
EndlessCultivationGame.prototype.clearBattleStates = function() {
    console.log('清理战斗临时状态...');

    // ✅ 清理玩家战斗状态
    if (this.persistentState.player) {
        this.persistentState.player.shieldValue = 0;  // 护盾值
        this.persistentState.player.defenseActive = false;  // 防御姿态
        this.persistentState.player.defenseBonusValue = 0;  // 防御加成
        this.persistentState.player.dodgeActive = false;  // 闪避姿态
        this.persistentState.player.dodgeBonus = 0;  // 闪避加成
        this.persistentState.player.immuneNextAttack = false;  // 免疫下次攻击
        this.persistentState.player.buffs = [];  // 持续增益
        this.persistentState.player.tempAttackBonus = 0;  // 临时攻击加成
        this.persistentState.player.tempDefenseBonus = 0;  // 临时防御加成
        this.persistentState.player.tempAccuracyBonus = 0;  // 临时命中加成
        this.persistentState.player.tempSkillCostReduce = 0;  // 临时技能消耗减少
    }

    // ✅ 清理敌人战斗状态
    if (this.transientState.enemy) {
        this.transientState.enemy.debuffs = [];  // 持续减益
    }

    // ✅ 移除防御特效（护盾等）
    if (typeof this.removeDefenseEffect === 'function') {
        this.removeDefenseEffect();
    }
};

// ==================== 技能特效辅助函数 ====================

/**
 * 根据技能属性获取元素类型（用于特效）
 * @param {Object} skill - 技能对象
 * @returns {string} 元素类型 ('fire', 'ice', 'thunder', 'wind')
 */
EndlessCultivationGame.prototype.getSkillElementType = function(skill) {
    if (!skill || !skill.effectColor) return 'wind';

    const color = skill.effectColor;

    // 红色系 -> 火元素
    if (color.r > 0.7 && color.g < 0.5 && color.b < 0.5) {
        return 'fire';
    }
    // 蓝色系 -> 冰元素
    else if (color.b > 0.7 && color.r < 0.5 && color.g < 0.7) {
        return 'ice';
    }
    // 黄色/紫色系 -> 雷元素
    else if ((color.r > 0.7 && color.g > 0.7) || (color.r > 0.5 && color.b > 0.5)) {
        return 'thunder';
    }
    // 绿色/白色系 -> 风元素
    else {
        return 'wind';
    }
};
