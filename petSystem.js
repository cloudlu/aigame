// 宠物系统模块 (petSystem.js)
// 宠物管理：创建、激活、战斗、经验/升级

class PetSystem {
    constructor(game) {
        this.game = game;
    }

    // 品质配置
    static QUALITIES = [
        { id: 0, name: '凡品', multiplier: 1.0, color: '#9ca3af' },   // gray
        { id: 1, name: '灵品', multiplier: 1.3, color: '#a78bfa' },   // purple
        { id: 2, name: '仙品', multiplier: 1.7, color: '#fbbf24' },   // gold
        { id: 3, name: '神品', multiplier: 2.2, color: '#f87171' },   // rainbow/red
    ];

    // 品质抽取概率 (凡品60% / 灵品25% / 仙品12% / 神品3%)
    static QUALITY_WEIGHTS = [60, 25, 12, 3];

    /**
     * 初始化（旧存档兼容）
     */
    init() {
        if (!this.game.persistentState.player.pets) {
            this.game.persistentState.player.pets = {
                owned: [],
                activePetId: null
            };
        }
        // 旧存档迁移：补 quality 字段
        const owned = this.game.persistentState.player.pets.owned;
        if (owned) {
            owned.forEach(pet => {
                if (pet.quality === undefined) pet.quality = 0;
            });
        }
        console.log('✅ PetSystem初始化完成');
    }

    // ========== 宠物创建 ==========

    /**
     * 随机抽取品质（加权随机）
     */
    _rollQuality() {
        const weights = PetSystem.QUALITY_WEIGHTS;
        const total = weights.reduce((s, w) => s + w, 0);
        let roll = Math.random() * total;
        for (let i = 0; i < weights.length; i++) {
            roll -= weights[i];
            if (roll <= 0) return i;
        }
        return 0;
    }

    /**
     * 从元数据创建宠物实例
     */
    createPetInstance(petTypeId, forceQuality) {
        const petType = this.game.metadata.petTypes?.find(p => p.id === petTypeId);
        if (!petType) {
            console.error(`❌ 宠物类型未找到: ${petTypeId}`);
            return null;
        }

        const quality = forceQuality !== undefined ? forceQuality : this._rollQuality();

        const instance = {
            instanceId: 'pet_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
            typeId: petTypeId,
            name: petType.evolutionStages[0],
            quality: quality,
            level: 1,
            exp: 0,
            maxExp: this._calcMaxExp(1)
        };

        return instance;
    }

    /**
     * 计算宠物当前属性
     */
    getPetStats(petInstance) {
        const petType = this.game.metadata.petTypes?.find(p => p.id === petInstance.typeId);
        if (!petType) return { hp: 100, attack: 10, defense: 5, speed: 8, critRate: 5, critDamage: 1.5 };

        const level = petInstance.level || 1;
        const base = petType.baseStats;
        const growth = petType.growthPerLevel;

        // 品质加成
        const quality = petInstance.quality || 0;
        const qualityMultiplier = PetSystem.QUALITIES[quality]?.multiplier || 1.0;

        return {
            hp: Math.floor((base.hp + (level - 1) * growth.hp) * qualityMultiplier),
            attack: Math.floor((base.attack + (level - 1) * growth.attack) * qualityMultiplier),
            defense: Math.floor((base.defense + (level - 1) * growth.defense) * qualityMultiplier),
            speed: Math.floor((base.speed + (level - 1) * growth.speed) * qualityMultiplier),
            critRate: (base.critRate + (level - 1) * growth.critRate) * qualityMultiplier,
            critDamage: petType.critDamage || 1.5
        };
    }

    /**
     * 获取宠物进化阶段显示名
     */
    getEvolutionStage(petInstance) {
        const petType = this.game.metadata.petTypes?.find(p => p.id === petInstance.typeId);
        if (!petType) return petInstance.name;

        let stage = 0;
        for (let i = petType.evolveLevels.length - 1; i >= 0; i--) {
            if (petInstance.level >= petType.evolveLevels[i]) {
                stage = i;
                break;
            }
        }
        return petType.evolutionStages[stage] || petType.evolutionStages[0];
    }

    // ========== 宠物管理 ==========

    /**
     * 获取当前激活的宠物实例
     */
    getActivePet() {
        const pets = this.game.persistentState.player.pets;
        if (!pets || !pets.owned || pets.owned.length === 0) return null;

        // 如果没有设置出战宠物，自动选第一只
        if (!pets.activePetId && pets.owned.length > 0) {
            pets.activePetId = pets.owned[0].instanceId;
        }

        return pets.owned.find(p => p.instanceId === pets.activePetId) || null;
    }

    /**
     * 设置出战宠物
     */
    setActivePet(instanceId) {
        this.game.persistentState.player.pets.activePetId = instanceId;
        this.game.saveGameState();
    }

    /**
     * 添加宠物到拥有列表
     */
    addPet(petInstance) {
        if (!petInstance) return;
        this.game.persistentState.player.pets.owned.push(petInstance);
        this.game.saveGameState();
    }

    /**
     * 放生宠物 — 回收灵石（品质×等级×5）+ 突破石（品质×2）
     */
    releasePet(instanceId) {
        const pets = this.game.persistentState.player.pets;
        const index = pets.owned.findIndex(p => p.instanceId === instanceId);
        if (index === -1) return { success: false, message: '宠物不存在！' };

        const pet = pets.owned[index];
        if (pet.instanceId === pets.activePetId) {
            return { success: false, message: '出战宠物不能放生，请先休息！' };
        }

        // 计算回收资源（上限为购买价的40%，防止套利）
        const qualityMultiplier = PetSystem.QUALITIES[pet.quality || 0]?.multiplier || 1.0;
        const jadeReturnRaw = Math.floor(qualityMultiplier * pet.level * 5);
        const purchasePrice = this._getPetPurchasePrice(pet.typeId);
        const jadeReturn = Math.min(jadeReturnRaw, Math.floor(purchasePrice * 0.4));
        const stoneReturn = Math.floor(qualityMultiplier * 2);

        // 发放资源
        if (jadeReturn > 0) {
            this.game.persistentState.resources.jade = (this.game.persistentState.resources.jade || 0) + jadeReturn;
        }
        if (stoneReturn > 0) {
            this.game.persistentState.resources.breakthroughStones =
                (this.game.persistentState.resources.breakthroughStones || 0) + stoneReturn;
        }

        // 移除宠物
        pets.owned.splice(index, 1);
        this.game.saveGameState();

        return {
            success: true,
            message: `放生【${pet.name}】，获得仙玉+${jadeReturn}，突破石+${stoneReturn}`,
            jade: jadeReturn,
            stones: stoneReturn
        };
    }

    /**
     * 喂食宠物 — 将目标宠物作为狗粮喂给出战宠物
     * 提供的经验 = 目标等级 × 品质倍率 × 30
     */
    feedPetToActive(fodderId) {
        const pets = this.game.persistentState.player.pets;
        const activePet = this.getActivePet();
        if (!activePet) return { success: false, message: '没有出战宠物！' };

        const fodderIndex = pets.owned.findIndex(p => p.instanceId === fodderId);
        if (fodderIndex === -1) return { success: false, message: '狗粮宠物不存在！' };

        const fodder = pets.owned[fodderIndex];
        if (fodder.instanceId === pets.activePetId) {
            return { success: false, message: '不能喂食出战宠物！' };
        }
        if (fodder.instanceId === activePet.instanceId) {
            return { success: false, message: '不能喂食自己！' };
        }

        // 计算经验
        const qualityMultiplier = PetSystem.QUALITIES[fodder.quality || 0]?.multiplier || 1.0;
        const expGain = Math.floor(fodder.level * qualityMultiplier * 30);

        // 移除狗粮
        pets.owned.splice(fodderIndex, 1);

        // 给出战宠物加经验
        this.grantExpToActivePet(expGain);

        return {
            success: true,
            message: `喂食【${fodder.name}】，${activePet.name}获得${expGain}经验！`,
            expGain: expGain
        };
    }

    // ========== 经验/升级 ==========

    /**
     * 给激活的宠物增加经验
     */
    grantExpToActivePet(amount) {
        const pet = this.getActivePet();
        if (!pet) return;

        pet.exp += amount;
        let leveled = false;

        while (pet.exp >= pet.maxExp && pet.level < 100) {
            pet.exp -= pet.maxExp;
            pet.level++;
            pet.maxExp = this._calcMaxExp(pet.level);
            leveled = true;

            // 检查进化
            const newName = this.getEvolutionStage(pet);
            if (newName !== pet.name) {
                this.game.showNotification(`宠物进化！${pet.name} → ${newName}`, 'success');
                pet.name = newName;
            }
        }

        if (leveled) {
            const stats = this.getPetStats(pet);
            this.game.addBattleLog(`宠物【${pet.name}】升级到 Lv.${pet.level}！HP:${stats.hp} 攻击:${stats.attack}`);
        }

        this.game.saveGameState();
    }

    _calcMaxExp(level) {
        return Math.floor(50 + level * 30 + level * level * 2);
    }

    // ========== 战斗集成 ==========

    /**
     * 构建战斗数据对象（给 transientState.pets）
     */
    buildBattlePet(petInstance) {
        const stats = this.getPetStats(petInstance);
        const petType = this.game.metadata.petTypes?.find(p => p.id === petInstance.typeId);
        const qualityInfo = PetSystem.QUALITIES[petInstance.quality || 0];

        return {
            id: petInstance.instanceId,
            name: petInstance.name,
            qualityName: qualityInfo?.name || '凡品',
            qualityColor: qualityInfo?.color || '#9ca3af',
            type: petType?.type || '兽',
            hp: stats.hp,
            maxHp: stats.hp,
            attack: stats.attack,
            defense: stats.defense,
            speed: stats.speed,
            criticalRate: stats.critRate,
            critDamage: stats.critDamage,
            skills: [],
            energy: 100,
            maxEnergy: 100,
            level: petInstance.level,
            color: petType?.color || { r: 0.3, g: 0.7, b: 0.4 }
        };
    }

    /**
     * 战斗开始时激活宠物
     */
    activatePetForBattle() {
        const pet = this.getActivePet();
        if (!pet) return;

        const battlePet = this.buildBattlePet(pet);
        this.game.transientState.pets = [battlePet];

        // 创建3D模型
        if (typeof this.game.createPetModel === 'function') {
            this.game.createPetModel(battlePet);
        }

        // 显示血条面板
        const petPanel = document.getElementById('pet-health-panel');
        if (petPanel) petPanel.classList.remove('hidden');

        this.updatePetHealthPanel();
    }

    /**
     * 更新宠物血条DOM
     */
    updatePetHealthPanel() {
        const pets = this.game.transientState.pets;
        if (!pets || pets.length === 0) return;

        const pet = pets[0];
        const qualityInfo = PetSystem.QUALITIES[pet.quality || 0];
        const nameEl = document.getElementById('pet-name');
        const barEl = document.getElementById('pet-hp-bar');
        const textEl = document.getElementById('pet-hp-text');

        if (nameEl) {
            const qualityBadge = `<span style="color:${pet.qualityColor}">${pet.qualityName || '凡品'}</span>`;
            nameEl.innerHTML = `${pet.name} <span class="text-xs">${qualityBadge}</span> Lv.${pet.level || 1}`;
        }
        if (barEl && pet.maxHp > 0) {
            const percent = Math.max(0, (pet.hp / pet.maxHp) * 100);
            barEl.style.width = percent + '%';
            // 颜色随HP变化
            if (percent > 50) barEl.className = 'h-full bg-green-500 transition-all duration-300';
            else if (percent > 25) barEl.className = 'h-full bg-yellow-500 transition-all duration-300';
            else barEl.className = 'h-full bg-red-500 transition-all duration-300';
        }
        if (textEl) textEl.textContent = `${Math.max(0, Math.floor(pet.hp))}/${pet.maxHp}`;

        // 宠物死亡时隐藏
        const petPanel = document.getElementById('pet-health-panel');
        if (petPanel && pet.hp <= 0) {
            nameEl.textContent = `${pet.name} (已倒下)`;
        }
    }

    /**
     * 战斗结束时清理
     */
    deactivatePet() {
        this.game.transientState.pets = [];
        const petPanel = document.getElementById('pet-health-panel');
        if (petPanel) petPanel.classList.add('hidden');
    }

    // ========== 宠物管理UI ==========

    /**
     * 渲染宠物管理面板
     */
    renderPetManagementPanel() {
        const pets = this.game.persistentState.player.pets;
        const container = document.getElementById('pet-management-content');
        if (!container) return;

        if (!pets.owned || pets.owned.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">还没有灵兽，通过主线任务或灵石商店获取</p>';
            return;
        }

        let html = '<div class="space-y-2">';
        pets.owned.forEach(pet => {
            const stats = this.getPetStats(pet);
            const isActive = pet.instanceId === pets.activePetId;
            const petType = this.game.metadata.petTypes?.find(t => t.id === pet.typeId);
            const qualityInfo = PetSystem.QUALITIES[pet.quality || 0];

            html += `
            <div class="flex items-center justify-between p-2 rounded ${isActive ? 'bg-green-900/40 border border-green-500/50' : 'bg-gray-800/50 border border-gray-700/50'}">
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span class="font-bold ${isActive ? 'text-green-400' : 'text-gray-200'} text-sm">${pet.name}</span>
                        <span class="text-xs px-1 rounded" style="background:${qualityInfo.color}22; color:${qualityInfo.color}">${qualityInfo.name}</span>
                        <span class="text-xs text-gray-500">Lv.${pet.level}</span>
                        ${isActive ? '<span class="text-xs text-green-500">[出战]</span>' : ''}
                    </div>
                    <div class="text-xs text-gray-500 mt-0.5">
                        HP:${stats.hp} 攻:${stats.attack} 防:${stats.defense} 速:${stats.speed} 暴击:${stats.critRate.toFixed(1)}%
                    </div>
                    <div class="w-full h-1 bg-gray-700 rounded mt-1">
                        <div class="h-full bg-blue-500 rounded" style="width:${pet.maxExp > 0 ? (pet.exp / pet.maxExp * 100) : 0}%"></div>
                    </div>
                    <div class="text-xs text-gray-600">EXP: ${pet.exp}/${pet.maxExp}</div>
                </div>
                <div class="ml-2 flex gap-1">
                    ${isActive
                        ? `<button onclick="game.petSystem.setActivePet(null); game.petSystem.renderPetManagementPanel();" class="text-xs px-2 py-1 bg-gray-600 rounded hover:bg-gray-500">休息</button>`
                        : `<button onclick="game.petSystem.setActivePet('${pet.instanceId}'); game.petSystem.renderPetManagementPanel();" class="text-xs px-2 py-1 bg-green-700 rounded hover:bg-green-600">出战</button>
                           <button onclick="game.petSystem._handleFeed('${pet.instanceId}')" class="text-xs px-2 py-1 bg-blue-700 rounded hover:bg-blue-600">喂食</button>
                           <button onclick="game.petSystem._handleRelease('${pet.instanceId}')" class="text-xs px-2 py-1 bg-red-800 rounded hover:bg-red-700">放生</button>`
                    }
                </div>
            </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * 处理喂食操作（带确认）
     */
    _handleFeed(fodderId) {
        const pets = this.game.persistentState.player.pets;
        const activePet = this.getActivePet();
        const fodder = pets.owned.find(p => p.instanceId === fodderId);
        if (!activePet || !fodder) return;

        const qualityMultiplier = PetSystem.QUALITIES[fodder.quality || 0]?.multiplier || 1.0;
        const expGain = Math.floor(fodder.level * qualityMultiplier * 30);
        const qualityName = PetSystem.QUALITIES[fodder.quality || 0]?.name || '凡品';

        const confirmed = confirm(`确认将【${qualityName} ${fodder.name}】Lv.${fodder.level} 喂给【${activePet.name}】？\n预计获得 ${expGain} 经验`);
        if (!confirmed) return;

        const result = this.feedPetToActive(fodderId);
        if (result.success) {
            this.game.showNotification(result.message, 'success');
        } else {
            this.game.showNotification(result.message, 'error');
        }
        this.renderPetManagementPanel();
    }

    /**
     * 处理放生操作（带确认）
     */
    _handleRelease(instanceId) {
        const pets = this.game.persistentState.player.pets;
        const pet = pets.owned.find(p => p.instanceId === instanceId);
        if (!pet) return;

        const qualityMultiplier = PetSystem.QUALITIES[pet.quality || 0]?.multiplier || 1.0;
        const jadeReturn = Math.floor(qualityMultiplier * pet.level * 5);
        const stoneReturn = Math.floor(qualityMultiplier * 2);
        const qualityName = PetSystem.QUALITIES[pet.quality || 0]?.name || '凡品';

        const confirmed = confirm(`确认放生【${qualityName} ${pet.name}】Lv.${pet.level}？\n回收：仙玉+${jadeReturn}，突破石+${stoneReturn}`);
        if (!confirmed) return;

        const result = this.releasePet(instanceId);
        if (result.success) {
            this.game.showNotification(result.message, 'success');
        } else {
            this.game.showNotification(result.message, 'error');
        }
        this.renderPetManagementPanel();
    }
}

// 挂载到全局（浏览器环境）
if (typeof window !== 'undefined') {
    window.PetSystem = PetSystem;
}

// 导出（Node/Vitest 环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PetSystem };
}
