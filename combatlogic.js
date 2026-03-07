// 战斗逻辑模块 (combatlogic.js)
// 包含战斗计算、技能系统、伤害计算、升级检查等

// ==================== 战斗控制 ====================

// 攻击敌人（玩家回合）
EndlessWinterGame.prototype.attackEnemy = function() {
    // 只有在战斗模式中才能使用普通攻击
    if (!this.gameState.battle.inBattle) {
        this.addBattleLog('只有在战斗模式中才能使用普通攻击！');
        return;
    }

    // 确保战斗场景已初始化
    if (!this.battle3D || !this.battle3D.player || !this.battle3D.enemy) {
        this.addBattleLog('战斗场景未初始化！');
        return;
    }

    // 计算装备效果
    this.equipmentSystem.calculateEquipmentEffects();

    // 计算最终属性
    const finalAttack = this.gameState.player.attack + this.gameState.player.equipmentEffects.attack;
    const finalDefense = this.gameState.player.defense + this.gameState.player.equipmentEffects.defense;
    const finalAccuracy = (this.gameState.player.accuracy || 100) + (this.gameState.player.equipmentEffects.accuracy || 0);
    const finalDodge = (this.gameState.player.dodge || 5) + (this.gameState.player.equipmentEffects.dodgeRate || 0);
    const enemyAccuracy = this.gameState.enemy.accuracy || 90;
    const enemyDodge = this.gameState.enemy.dodge || 10;

    // 计算伤害
    const playerDamage = Math.max(1, finalAttack - this.gameState.enemy.defense);
    const enemyDamage = Math.max(1, this.gameState.enemy.attack - finalDefense);

    // 玩家攻击命中判断
    const playerHitChance = Math.min(95, finalAccuracy - enemyDodge);
    const playerHit = Math.random() * 100 < playerHitChance;

    // 播放3D攻击动画，在动画结束后执行后续逻辑
    this.playAttackAnimation(() => {
        if (playerHit) {
            // 敌人受到伤害
            this.gameState.enemy.hp -= playerDamage;
            // 确保敌人血量不会小于0
            if (this.gameState.enemy.hp < 0) {
                this.gameState.enemy.hp = 0;
            }

            // 显示敌人伤害
            this.showDamage(this.battle3D.enemy, playerDamage, 'red');
            this.addBattleLog(`你对${this.gameState.enemy.name}造成了${playerDamage}点伤害！`);

            // 检查敌人是否死亡
            if (this.gameState.enemy.hp <= 0) {
                this.enemyDefeated();
                return;
            }
        } else {
            this.addBattleLog(`你的攻击被${this.gameState.enemy.name}闪避了！`);
            this.showDodge(this.battle3D.enemy, '闪避！');
        }

        // 敌人反击
        this.playEnemyAttackAnimation();
        let finalEnemyDamage = enemyDamage;

        // 敌人攻击命中判断
        const enemyHitChance = Math.min(95, enemyAccuracy - finalDodge);
        const enemyHit = Math.random() * 100 < enemyHitChance;

        if (enemyHit) {
            // 检查防御状态
            if (this.gameState.player.defenseActive) {
                finalEnemyDamage = Math.max(1, Math.floor(finalEnemyDamage * 0.5));
                if (this.gameState.enemy.isBoss && this.gameState.enemy.energy >= 50) {
                    const skillDamage = Math.floor(enemyDamage * 1.5);
                    finalEnemyDamage = Math.max(1, Math.floor((enemyDamage + skillDamage) * 0.5));
                    this.gameState.enemy.energy -= 50;
                    this.addBattleLog(`${this.gameState.enemy.name}释放了技能，对你造成了${finalEnemyDamage}点伤害！（防御减免50%）`);
                } else {
                    this.addBattleLog(`${this.gameState.enemy.name}对你造成了${finalEnemyDamage}点伤害！（防御减免50%）`);
                }
                this.gameState.player.defenseActive = false;
                this.removeDefenseEffect();
            } else {
                if (this.gameState.enemy.isBoss && this.gameState.enemy.energy >= 50) {
                    const skillDamage = Math.floor(enemyDamage * 1.5);
                    finalEnemyDamage = enemyDamage + skillDamage;
                    this.gameState.enemy.energy -= 50;
                    this.addBattleLog(`${this.gameState.enemy.name}释放了技能，对你造成了${finalEnemyDamage}点伤害！`);
                } else {
                    this.addBattleLog(`${this.gameState.enemy.name}对你造成了${finalEnemyDamage}点伤害！`);
                }
            }

            // 玩家受到伤害
            this.gameState.player.hp -= finalEnemyDamage;
            if (this.gameState.player.hp < 0) {
                this.gameState.player.hp = 0;
            }

            // 播放玩家受击动画
            this.playPlayerHitAnimation();
            this.showDamage(this.battle3D.player, finalEnemyDamage, 'red');
        } else {
            this.addBattleLog(`你闪避了${this.gameState.enemy.name}的攻击！`);
            this.showDodge(this.battle3D.player, '闪避！');
        }

        // BOSS能量恢复
        if (this.gameState.enemy.isBoss) {
            this.gameState.enemy.energy = Math.min(this.gameState.enemy.energy + 20, this.gameState.enemy.maxEnergy);
        }

        // 检查玩家是否死亡
        if (this.gameState.player.hp <= 0) {
            this.playerDefeated();
        }

        // 更新UI
        this.updateUI();
        this.updateHealthBars();
    });

    // 播放攻击声音
    this.playSound('attack-sound', 1, 200);
};

// 使用技能攻击敌人（使用当前境界装备的技能）
EndlessWinterGame.prototype.useSkill = function() {
    if (!this.gameState.battle.inBattle) {
        this.addBattleLog('只有在战斗模式中才能使用技能！');
        return;
    }

    // 获取当前境界的装备技能
    const currentRealm = this.gameState.player.realm.currentRealm;
    const equippedSkills = this.gameState.player.skills.equipped;
    const skillId = equippedSkills[currentRealm];

    if (!skillId) {
        this.addBattleLog('当前境界没有装备技能！');
        return;
    }

    // 使用新的技能树系统获取技能详情
    let skill = this.skillTreeSystem.getCurrentSkill();

    if (!skill) {
        this.addBattleLog(`找不到技能：${skillId}`);
        return;
    }

    // 确保有足够的能量
    if (this.gameState.player.energy < skill.energyCost) {
        this.addBattleLog(`能量不足！需要${skill.energyCost}能量`);
        return;
    }

    // 播放技能声音 - 使用技能特定的音效
    if (skill.soundUrl) {
        this.playSkillSound(skill.soundUrl);
    } else {
        // 后备音效
        this.playSound('skill-0-sound', 1, 300);
    }

    // 计算装备效果
    this.equipmentSystem.calculateEquipmentEffects();
    const finalAttack = this.gameState.player.attack + this.gameState.player.equipmentEffects.attack;
    const finalDefense = this.gameState.player.defense + this.gameState.player.equipmentEffects.defense;
    const finalAccuracy = (this.gameState.player.accuracy || 100) + (this.gameState.player.equipmentEffects.accuracy || 0);
    const finalDodge = (this.gameState.player.dodge || 5) + (this.gameState.player.equipmentEffects.dodgeRate || 0);
    const enemyAccuracy = this.gameState.enemy.accuracy || 90;
    const enemyDodge = this.gameState.enemy.dodge || 10;

    let playerDamage = 0;
    let hit = true;

    // 技能效果处理函数
    const handleSkillEffect = () => {
        // 消耗能量
        this.gameState.player.energy -= skill.energyCost;
        
        // 显示能量消耗
        this.showEnergyChange(this.battle3D.player, -skill.energyCost);
        
        // 根据技能类型计算伤害
        if (skill.damageMultiplier) {
            // 技能攻击命中判断
            const playerHitChance = Math.min(95, finalAccuracy - enemyDodge);
            hit = Math.random() * 100 < playerHitChance;

            if (hit) {
                playerDamage = Math.max(1, Math.floor(finalAttack * skill.damageMultiplier) - this.gameState.enemy.defense);
                // 额外伤害（百分比敌人最大生命）
                if (skill.extraDamagePercent) {
                    const extraDamage = Math.floor(this.gameState.enemy.maxHp * skill.extraDamagePercent);
                    playerDamage += extraDamage;
                }
                // 无视防御
                if (skill.ignoreDefense) {
                    const ignoredDefense = Math.floor(this.gameState.enemy.defense * skill.ignoreDefense);
                    playerDamage += ignoredDefense;
                }
                this.addBattleLog(`你使用了${skill.name}，对${this.gameState.enemy.name}造成了${playerDamage}点伤害！`);
            } else {
                this.addBattleLog(`你的${skill.name}被${this.gameState.enemy.name}闪避了！`);
                this.showDodge(this.battle3D.enemy, '闪避！');
            }
        } else if (skill.defenseBonus) {
            // 防御姿态
            this.gameState.player.defenseActive = true;
            this.gameState.player.defenseBonusValue = skill.defenseBonus;
            this.addBattleLog(`你使用了${skill.name}，防御姿态已激活！下次受到的伤害减少${Math.floor(skill.defenseBonus * 100)}%！`);
        } else if (skill.healPercentage) {
            const healAmount = Math.floor(this.gameState.player.maxHp * skill.healPercentage);
            this.gameState.player.hp = Math.min(this.gameState.player.hp + healAmount, this.gameState.player.maxHp);
            this.addBattleLog(`你使用了${skill.name}，恢复了${healAmount}点生命值！`);
            this.showDamage(this.battle3D.player, healAmount, 'green');
        } else if (skill.criticalMultiplier) {
            // 技能攻击命中判断
            const playerHitChance = Math.min(95, finalAccuracy - enemyDodge);
            hit = Math.random() * 100 < playerHitChance;

            if (hit) {
                // 幸运一击
                if (Math.random() < skill.criticalChance) {
                    playerDamage = Math.max(1, Math.floor(finalAttack * skill.criticalMultiplier) - this.gameState.enemy.defense);
                    this.addBattleLog(`你使用了${skill.name}，触发了暴击！对${this.gameState.enemy.name}造成了${playerDamage}点伤害！`);
                } else {
                    playerDamage = Math.max(1, finalAttack - this.gameState.enemy.defense);
                    this.addBattleLog(`你使用了${skill.name}，但没有触发暴击，对${this.gameState.enemy.name}造成了${playerDamage}点伤害！`);
                }
            } else {
                this.addBattleLog(`你的${skill.name}被${this.gameState.enemy.name}闪避了！`);
                this.showDodge(this.battle3D.enemy, '闪避！');
            }
        } else if (skill.dodgeBonus) {
            // 闪避技能
            this.gameState.player.dodgeActive = true;
            this.gameState.player.dodgeBonus = skill.dodgeBonus;
            this.addBattleLog(`你使用了${skill.name}，提高了闪避率！`);
        }

        // 新增：能量恢复
        if (skill.energyRecover) {
            const recoverAmount = Math.min(skill.energyRecover, this.gameState.player.maxEnergy - this.gameState.player.energy);
            this.gameState.player.energy += recoverAmount;
            this.addBattleLog(`恢复了${recoverAmount}点能量！`);
        }

        // 新增：免疫下次攻击
        if (skill.immuneNextAttack) {
            this.gameState.player.immuneNextAttack = true;
            this.addBattleLog(`你获得了免疫状态，下次攻击将被完全抵挡！`);
        }

        // 新增：组合效果处理
        if (skill.effects && skill.effects.length > 0) {
            this.processSkillEffects(skill.effects);
        }

        // 新增：添加持续buff
        if (skill.buffs && skill.buffs.length > 0) {
            if (!this.gameState.player.buffs) {
                this.gameState.player.buffs = [];
            }
            skill.buffs.forEach(buff => {
                this.gameState.player.buffs.push({
                    type: buff.type,
                    value: buff.value,
                    turns: buff.turns
                });
            });
            this.addBattleLog(`获得了${skill.buffs.length}个持续增益效果！`);
        }

        // 新增：添加敌人debuff
        if (skill.debuffs && skill.debuffs.length > 0) {
            if (!this.gameState.enemy.debuffs) {
                this.gameState.enemy.debuffs = [];
            }
            skill.debuffs.forEach(debuff => {
                this.gameState.enemy.debuffs.push({
                    type: debuff.type,
                    value: debuff.value,
                    turns: debuff.turns
                });
            });
            this.addBattleLog(`对敌人施加了${skill.debuffs.length}个减益效果！`);
        }

        if (playerDamage > 0) {
            this.gameState.enemy.hp -= playerDamage;
            if (this.gameState.enemy.hp < 0) {
                this.gameState.enemy.hp = 0;
            }
            this.showDamage(this.battle3D.enemy, playerDamage, 'red');
        }

        // 检查敌人是否死亡
        if (this.gameState.enemy.hp <= 0) {
            this.enemyDefeated();
            return;
        }

        // 敌人反击（技能攻击、生命恢复和闪避不触发反击）
        if (!skill.defenseBonus && !skill.healPercentage && !skill.dodgeBonus) {
            this.playEnemyAttackAnimation();

            let finalEnemyDamage = Math.max(1, this.gameState.enemy.attack - finalDefense);

            // 敌人攻击命中判断
            let enemyHitChance = Math.min(95, enemyAccuracy - finalDodge);
            
            // 检查是否有闪避加成
            if (this.gameState.player.dodgeActive && this.gameState.player.dodgeBonus) {
                enemyHitChance -= this.gameState.player.dodgeBonus * 100;
                enemyHitChance = Math.max(5, enemyHitChance); // 最低5%命中几率
                this.gameState.player.dodgeActive = false;
                this.gameState.player.dodgeBonus = 0;
            }
            
            const enemyHit = Math.random() * 100 < enemyHitChance;

            if (enemyHit) {
                if (this.gameState.player.defenseActive) {
                    const reductionRate = this.gameState.player.defenseBonusValue || 0.5;
                    finalEnemyDamage = Math.max(1, Math.floor(finalEnemyDamage * (1 - reductionRate)));
                    if (this.gameState.enemy.isBoss && this.gameState.enemy.energy >= 50) {
                        const skillDamage = Math.floor(finalEnemyDamage * 1.5);
                        finalEnemyDamage = Math.max(1, Math.floor((finalEnemyDamage + skillDamage) * (1 - reductionRate)));
                        this.gameState.enemy.energy -= 50;
                        this.addBattleLog(`${this.gameState.enemy.name}释放了技能，对你造成了${finalEnemyDamage}点伤害！（防御减免${Math.floor(reductionRate * 100)}%）`);
                    } else {
                        this.addBattleLog(`${this.gameState.enemy.name}对你造成了${finalEnemyDamage}点伤害！（防御减免${Math.floor(reductionRate * 100)}%）`);
                    }
                    this.gameState.player.defenseActive = false;
                    this.gameState.player.defenseBonusValue = 0;
                    this.removeDefenseEffect();
                } else {
                    if (this.gameState.enemy.isBoss && this.gameState.enemy.energy >= 50) {
                        const skillDamage = Math.floor(finalEnemyDamage * 1.5);
                        finalEnemyDamage = finalEnemyDamage + skillDamage;
                        this.gameState.enemy.energy -= 50;
                        this.addBattleLog(`${this.gameState.enemy.name}释放了技能，对你造成了${finalEnemyDamage}点伤害！`);
                    } else {
                        this.addBattleLog(`${this.gameState.enemy.name}对你造成了${finalEnemyDamage}点伤害！`);
                    }
                }

                this.gameState.player.hp -= finalEnemyDamage;
                if (this.gameState.player.hp < 0) {
                    this.gameState.player.hp = 0;
                }

                this.playPlayerHitAnimation();
                this.showDamage(this.battle3D.player, finalEnemyDamage, 'red');
            } else {
                this.addBattleLog(`你闪避了${this.gameState.enemy.name}的攻击！`);
            }

            // BOSS能量恢复
            if (this.gameState.enemy.isBoss) {
                this.gameState.enemy.energy = Math.min(this.gameState.enemy.energy + 20, this.gameState.enemy.maxEnergy);
            }
        }

        // 检查玩家是否死亡
        if (this.gameState.player.hp <= 0) {
            this.playerDefeated();
        }

        // 更新UI
        this.updateUI();
        this.updateHealthBars();
    };

    // 播放技能动画，在动画结束后执行技能效果
    const skillEffectColor = skill.effectColor || { r: 0, g: 0.5, b: 1 }; // 默认蓝色

    if (skill.damageMultiplier) {
        this.playSkillAttackAnimation(false, skillEffectColor, handleSkillEffect);
    } else if (skill.defenseBonus) {
        this.playDefenseAnimation(handleSkillEffect);
    } else if (skill.criticalMultiplier) {
        this.playSkillAttackAnimation(true, skillEffectColor, handleSkillEffect); // 传入true表示是幸运一击
    } else if (skill.healPercentage) {
        // 直接执行治疗效果
        handleSkillEffect();
    } else if (skill.dodgeBonus) {
        // 直接执行闪避效果
        handleSkillEffect();
    } else if (skill.effects) {
        // 复合效果技能
        handleSkillEffect();
    } else if (skill.energyRecover) {
        // 能量恢复技能
        handleSkillEffect();
    }
};

// 敌人被击败
EndlessWinterGame.prototype.enemyDefeated = function() {
    // 显示敌人倒地的画面
    this.showEnemyDefeatedAnimation();

    // 设置敌人被击败状态
    if (this.battle3D) {
        this.battle3D.enemyDefeated = true;
    }

    // 播放胜利声音
    this.playSound('victory-sound', 1, 1000);

    // 获得经验
    const expMultiplier = this.gameState.enemy.expMultiplier || 1;
    const expGained = Math.floor(this.gameState.enemy.level * 20 * expMultiplier);
    this.gameState.player.exp += expGained;

    // 精英怪额外提示
    if (this.gameState.enemy.isElite) {
        this.addBattleLog(`你击败了${this.gameState.enemy.name}！`);
        this.addBattleLog(`精英敌人奖励翻倍！获得了${expGained}点经验！`);
    } else {
        this.addBattleLog(`你击败了${this.gameState.enemy.name}，获得了${expGained}点经验！`);
    }

    // 获得资源
    const resourceMultiplier = this.gameState.enemy.resourceMultiplier || 1;
    const woodGained = Math.floor((this.gameState.enemy.level * 5 + Math.random() * 5) * resourceMultiplier);
    const ironGained = Math.floor((this.gameState.enemy.level * 2 + Math.random() * 3) * resourceMultiplier);
    const crystalGained = Math.floor((this.gameState.enemy.level * 1 + Math.random() * 2) * resourceMultiplier);

    this.gameState.resources.spiritWood += woodGained;
    this.gameState.resources.blackIron += ironGained;
    this.gameState.resources.spiritCrystal += crystalGained;

    this.addBattleLog(`获得了${woodGained}灵木，${ironGained}玄铁，${crystalGained}灵晶！`);

    // 杀死敌人恢复能量
    const killEnergyRecovery = 15;
    this.gameState.player.energy = Math.min(this.gameState.player.energy + killEnergyRecovery, this.gameState.player.maxEnergy);
    this.addBattleLog(`杀死敌人恢复了${killEnergyRecovery}点能量！`);

    // 杀死敌人恢复生命值
    const hpRecoveryPercent = 0.2; // 恢复20%最大HP
    const hpRecovery = Math.floor(this.gameState.player.maxHp * hpRecoveryPercent);
    const actualHpRecovered = Math.min(hpRecovery, this.gameState.player.maxHp - this.gameState.player.hp);
    if (actualHpRecovered > 0) {
        this.gameState.player.hp += actualHpRecovered;
        this.addBattleLog(`战斗胜利恢复了${actualHpRecovered}点生命值！`);
        this.showDamage(this.battle3D.player, actualHpRecovered, 'green');
    }

    // 装备掉落
    const droppedEquipment = this.equipmentSystem.generateEquipmentDrop();
    if (droppedEquipment) {
        const equipped = this.checkAndEquipBetterGear(droppedEquipment);
        if (!equipped) {
            this.gameState.player.inventory.push(droppedEquipment);
            this.addBattleLog(`获得了${droppedEquipment.rarityDisplayName} ${droppedEquipment.name}，已放入背包！`);
        } else {
            this.addBattleLog(`获得了${droppedEquipment.rarityDisplayName} ${droppedEquipment.name}，属性更好，已自动装备！`);
        }
    } else {
        this.addBattleLog(`敌人没有掉落装备。`);
    }

    // 突破石掉落（只有BOSS有几率掉落）
    if (this.gameState.enemy.isBoss) {
        const realm = this.gameState.player.realm;
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
            this.gameState.resources.breakthroughStones = (this.gameState.resources.breakthroughStones || 0) + stonesGained;
            this.addBattleLog(`获得了${stonesGained}个突破石！`);
        }
    }

    // 检查升级
    this.checkLevelUp();

    // 更新UI
    this.updateUI();
    this.updateHealthBars();

    // 战斗结束，延迟后关闭战斗模态窗口并返回主界面
    setTimeout(() => {
        this.closeBattleModal();
    }, 3000);
};

// 玩家被击败
EndlessWinterGame.prototype.playerDefeated = function() {
    if (this.battle3D) {
        this.battle3D.playerDefeated = true;
    }

    // 播放玩家倒地动画
    this.showPlayerDefeatedAnimation();

    // 播放失败声音
    this.playSound('defeat-sound', 1, 1000);

    this.addBattleLog(`你被${this.gameState.enemy.name}击败了！`);

    // 关闭战斗模态窗口
    setTimeout(() => {
        this.closeBattleModal();
    }, 2000);
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
EndlessWinterGame.prototype.closeBattleModal = function() {
    const battleModal = document.getElementById('battle-modal');
    if (battleModal) {
        battleModal.classList.add('hidden');
    }

    // 停止战斗音乐
    this.stopBattleMusic();

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

    // 设置战斗状态为false
    if (this.gameState.battle) {
        this.gameState.battle.inBattle = false;
    }

    this.battle3D = null;

    // 恢复地图场景
    this.restoreMapScene();
};

// 显示敌人被击败动画
EndlessWinterGame.prototype.showEnemyDefeatedAnimation = function() {
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
EndlessWinterGame.prototype.toggleAutoBattle = function() {
    this.gameState.settings.autoBattle = !this.gameState.settings.autoBattle;

    if (this.gameState.settings.autoBattle) {
        this.startAutoBattle();
        this.addBattleLog('已开启自动战斗');
    } else {
        this.stopAutoBattle();
        this.addBattleLog('已关闭自动战斗');
    }
};

// 开始自动战斗
EndlessWinterGame.prototype.startAutoBattle = function() {
    if (!this.gameState.battle.inBattle) return;

    this.gameState.settings.autoBattle = true;
    this.gameState.battle.autoBattleLoop = setInterval(() => {
        // 简单的自动攻击逻辑
        if (Math.random() < 0.3) {
            this.attackEnemy();
        }
    }, 1000);
};

// 停止自动战斗
EndlessWinterGame.prototype.stopAutoBattle = function() {
    this.gameState.settings.autoBattle = false;
    if (this.gameState.battle.autoBattleLoop) {
        clearInterval(this.gameState.battle.autoBattleLoop);
        this.gameState.battle.autoBattleLoop = null;
    }
};

// ==================== 技能效果处理 ====================

// 处理技能组合效果
EndlessWinterGame.prototype.processSkillEffects = function(effects) {
    for (const effect of effects) {
        switch (effect.type) {
            case 'dodgeBonus':
                this.gameState.player.dodgeActive = true;
                this.gameState.player.dodgeBonus = effect.value;
                this.addBattleLog(`闪避率提升${Math.floor(effect.value * 100)}%！`);
                break;
            case 'energyRecover':
                const recoverAmount = Math.min(effect.value, this.gameState.player.maxEnergy - this.gameState.player.energy);
                this.gameState.player.energy += recoverAmount;
                this.addBattleLog(`恢复了${recoverAmount}点能量！`);
                break;
            case 'defenseBonus':
                this.gameState.player.defenseActive = true;
                this.gameState.player.defenseBonusValue = effect.value;
                this.addBattleLog(`防御提升，下次受伤减少${Math.floor(effect.value * 100)}%！`);
                break;
            case 'accuracyBonus':
                this.gameState.player.tempAccuracyBonus = (this.gameState.player.tempAccuracyBonus || 0) + effect.value;
                this.addBattleLog(`命中提升${Math.floor(effect.value * 100)}%！`);
                break;
            case 'healPercentage':
                const healAmount = Math.floor(this.gameState.player.maxHp * effect.value);
                this.gameState.player.hp = Math.min(this.gameState.player.hp + healAmount, this.gameState.player.maxHp);
                this.addBattleLog(`恢复了${healAmount}点生命值！`);
                this.showDamage(this.battle3D.player, healAmount, 'green');
                break;
            case 'allStatsBonus':
                // 全属性加成
                if (!this.gameState.player.buffs) {
                    this.gameState.player.buffs = [];
                }
                this.gameState.player.buffs.push({
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
EndlessWinterGame.prototype.processBuffsAtTurnStart = function() {
    if (!this.gameState.player.buffs || this.gameState.player.buffs.length === 0) {
        return;
    }

    for (const buff of this.gameState.player.buffs) {
        switch (buff.type) {
            case 'damageBonus':
                // 伤害加成已在使用技能时应用
                break;
            case 'allStatsBonus':
                // 全属性加成
                this.gameState.player.tempAttackBonus = (this.gameState.player.tempAttackBonus || 0) + buff.value;
                this.gameState.player.tempDefenseBonus = (this.gameState.player.tempDefenseBonus || 0) + buff.value;
                break;
            case 'skillCostReduce':
                // 技能消耗减少
                this.gameState.player.tempSkillCostReduce = buff.value;
                break;
        }
    }
};

// 处理回合结束时的buff/debuff衰减
EndlessWinterGame.prototype.processBuffDecay = function() {
    // 处理玩家buff衰减
    if (this.gameState.player.buffs) {
        this.gameState.player.buffs = this.gameState.player.buffs.filter(buff => {
            buff.turns--;
            if (buff.turns <= 0) {
                this.addBattleLog(`${buff.type}效果已消失`);
                return false;
            }
            return true;
        });
    }

    // 处理敌人debuff衰减
    if (this.gameState.enemy.debuffs) {
        this.gameState.enemy.debuffs = this.gameState.enemy.debuffs.filter(debuff => {
            debuff.turns--;
            if (debuff.turns <= 0) {
                this.addBattleLog(`敌人的${debuff.type}效果已消失`);
                return false;
            }
            return true;
        });
    }

    // 清除临时加成
    this.gameState.player.tempAttackBonus = 0;
    this.gameState.player.tempDefenseBonus = 0;
    this.gameState.player.tempAccuracyBonus = 0;
    this.gameState.player.tempSkillCostReduce = 0;
};
