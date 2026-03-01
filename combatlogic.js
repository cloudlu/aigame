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
    this.calculateEquipmentEffects();

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

// 使用技能攻击敌人
EndlessWinterGame.prototype.useSkill = function(skillIndex) {
    if (!this.gameState.battle.inBattle) {
        this.addBattleLog('只有在战斗模式中才能使用技能！');
        return;
    }
    
    // 检查技能是否允许在当前境界使用
    let skill = this.gameState.player.skills[skillIndex];
    if (!skill) {
        this.addBattleLog(`找不到技能：${skillIndex}`);
        return;
    }
    
    // 检查境界要求
    if (skill.realmRequired && this.gameState.player.realm.currentRealm < skill.realmRequired) {
        this.addBattleLog('当前境界无法使用此技能！');
        return;
    }
    
    // 确保有足够的能量
    if (!skill) {
        this.addBattleLog(`找不到技能：${skillIndex}`);
        return;
    }
    
    if (this.gameState.player.energy < skill.energyCost) {
        this.addBattleLog(`能量不足！需要${skill.energyCost}能量`);
        return;
    }
    // 播放技能声音
    this.playSound(`skill-${skillIndex}-sound`, 1, 300);

    // 计算装备效果
    this.calculateEquipmentEffects();
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
                this.addBattleLog(`你使用了${skill.name}，对${this.gameState.enemy.name}造成了${playerDamage}点伤害！`);
            } else {
                this.addBattleLog(`你的${skill.name}被${this.gameState.enemy.name}闪避了！`);
                this.showDodge(this.battle3D.enemy, '闪避！');
            }
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
                    finalEnemyDamage = Math.max(1, Math.floor(finalEnemyDamage * 0.5));
                    if (this.gameState.enemy.isBoss && this.gameState.enemy.energy >= 50) {
                        const skillDamage = Math.floor(finalEnemyDamage * 1.5);
                        finalEnemyDamage = Math.max(1, Math.floor((finalEnemyDamage + skillDamage) * 0.5));
                        this.gameState.enemy.energy -= 50;
                        this.addBattleLog(`${this.gameState.enemy.name}释放了技能，对你造成了${finalEnemyDamage}点伤害！（防御减免50%）`);
                    } else {
                        this.addBattleLog(`${this.gameState.enemy.name}对你造成了${finalEnemyDamage}点伤害！（防御减免50%）`);
                    }
                    this.gameState.player.defenseActive = false;
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
    if (skill.damageMultiplier) {
        this.playSkillAttackAnimation(false, handleSkillEffect);
    } else if (skill.defenseBonus) {
        this.playDefenseAnimation(handleSkillEffect);
    } else if (skill.criticalMultiplier) {
        this.playSkillAttackAnimation(true, handleSkillEffect); // 传入true表示是幸运一击
    } else if (skill.healPercentage) {
        // 直接执行治疗效果
        handleSkillEffect();
    } else if (skill.dodgeBonus) {
        // 直接执行闪避效果
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

    // 装备掉落
    const droppedEquipment = this.generateEquipmentDrop();
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

// ==================== 装备掉落 ====================

// 生成装备掉落 - 使用 game.js 中的实现
// 注意：此函数在 game.js 中已有完整实现，这里保留为空以避免覆盖

// 获取稀有度数据
EndlessWinterGame.prototype.getRarityData = function(rarity) {
    const rarityData = this.gameState.equipmentRarities.find(r => r.name === rarity);
    if (!rarityData) return null;

    const template = this.gameState.equipmentTemplates[Math.floor(Math.random() * this.gameState.equipmentTemplates.length)];
    const randomBonus = Math.floor(Math.random() * 5) + 1; // 1-5的随机加成
    
    // 根据装备类型和稀有度生成属性
    const stats = {};
    const baseValue = 5 + this.gameState.player.realm.currentLevel * 2;
    const rarityMultiplier = rarityData.multiplier || 1;
    
    // 根据装备类型生成不同的属性
    switch (template.type) {
        case 'weapon':
            stats.attack = Math.floor(baseValue * rarityMultiplier * (1 + randomBonus / 10));
            stats.accuracy = Math.floor(5 * rarityMultiplier);
            break;
        case 'armor':
            stats.defense = Math.floor(baseValue * rarityMultiplier * (1 + randomBonus / 10));
            stats.maxHp = Math.floor(20 * rarityMultiplier);
            break;
        case 'helmet':
            stats.defense = Math.floor((baseValue * 0.7) * rarityMultiplier * (1 + randomBonus / 10));
            stats.maxHp = Math.floor(15 * rarityMultiplier);
            break;
        case 'boots':
            stats.defense = Math.floor((baseValue * 0.5) * rarityMultiplier * (1 + randomBonus / 10));
            stats.speed = Math.floor(3 * rarityMultiplier);
            break;
        case 'gloves':
            stats.attack = Math.floor((baseValue * 0.7) * rarityMultiplier * (1 + randomBonus / 10));
            stats.accuracy = Math.floor(8 * rarityMultiplier);
            break;
        case 'ring':
            // 戒指可以提供多种属性
            stats.attack = Math.floor((baseValue * 0.5) * rarityMultiplier * (1 + randomBonus / 10));
            stats.defense = Math.floor((baseValue * 0.5) * rarityMultiplier * (1 + randomBonus / 10));
            stats.maxHp = Math.floor(10 * rarityMultiplier);
            break;
        default:
            // 默认属性
            stats.attack = Math.floor(baseValue * 0.5 * rarityMultiplier * (1 + randomBonus / 10));
            stats.defense = Math.floor(baseValue * 0.5 * rarityMultiplier * (1 + randomBonus / 10));
    }

    return {
        id: `${template.type}_${rarity}_${Date.now()}`,
        name: this.generateEquipmentName(template.type, rarityData),
        type: template.type,
        level: this.gameState.player.realm.currentLevel,
        refineLevel: 0,
        stats: stats,
        description: `${rarityData.displayName}品质的${template.type}`,
        rarity: rarity,
        rarityDisplayName: rarityData.displayName,
        rarityMultiplier: rarityData.multiplier
    };
};

// 生成装备名称
EndlessWinterGame.prototype.generateEquipmentName = function(type, rarityData) {
    const prefixes = ['普通的', '坚固的', '精良的', '优秀的', '卓越的', '传奇的'];
    const suffixes = this.gameState.equipmentTemplates.find(t => t.type === type)?.nameSuffixes || ['物品'];

    const prefix = prefixes[Math.min(Math.floor(Math.random() * prefixes.length), prefixes.length - 1)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${prefix}${suffix}`;
};

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
