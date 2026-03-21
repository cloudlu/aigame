// VIP系统模块 (vipSystem.js)
// 充值验证、VIP等级计算、特权加成

class VIPSystem {
    constructor(game) {
        this.game = game;
        this.rechargeCodes = [];
    }

    // 从服务端加载充值套餐信息（不含密码）
    async loadRechargeCodes() {
        try {
            const token = localStorage.getItem('cultivationToken');
            if (!token) return;

            const response = await fetch('/api/recharge/packages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.rechargeCodes = result.packages;
                    console.log(`[VIP] 已加载${this.rechargeCodes.length}个充值套餐`);
                }
            } else {
                console.error('[VIP] 充值套餐加载失败:', response.status);
            }
        } catch (e) {
            console.error('[VIP] 充值套餐加载异常:', e);
        }
    }

    // 获取充值码列表
    getRechargeCodes() {
        return this.rechargeCodes;
    }

    // VIP 12级配置
    static VIP_LEVELS = [
        { level: 0,  requiredJade: 0,     label: '普通修士', attackBonus: 0,  defenseBonus: 0,  hpBonus: 0,  critBonus: 0  },
        { level: 1,  requiredJade: 60,    label: '入门弟子', attackBonus: 3,  defenseBonus: 0,  hpBonus: 0,  critBonus: 0  },
        { level: 2,  requiredJade: 360,   label: '外门弟子', attackBonus: 5,  defenseBonus: 2,  hpBonus: 0,  critBonus: 0  },
        { level: 3,  requiredJade: 680,   label: '内门弟子', attackBonus: 8,  defenseBonus: 4,  hpBonus: 3,  critBonus: 0  },
        { level: 4,  requiredJade: 1280,  label: '精英弟子', attackBonus: 10, defenseBonus: 6,  hpBonus: 5,  critBonus: 2  },
        { level: 5,  requiredJade: 2000,  label: '核心弟子', attackBonus: 13, defenseBonus: 8,  hpBonus: 7,  critBonus: 3  },
        { level: 6,  requiredJade: 3280,  label: '长老候选', attackBonus: 16, defenseBonus: 10, hpBonus: 10, critBonus: 4  },
        { level: 7,  requiredJade: 5000,  label: '执事长老', attackBonus: 18, defenseBonus: 12, hpBonus: 12, critBonus: 5  },
        { level: 8,  requiredJade: 6480,  label: '副掌门',   attackBonus: 22, defenseBonus: 15, hpBonus: 15, critBonus: 6  },
        { level: 9,  requiredJade: 10000, label: '掌门',     attackBonus: 25, defenseBonus: 18, hpBonus: 18, critBonus: 7  },
        { level: 10, requiredJade: 15000, label: '太上长老', attackBonus: 30, defenseBonus: 20, hpBonus: 20, critBonus: 8  },
        { level: 11, requiredJade: 20000, label: '圣者',     attackBonus: 35, defenseBonus: 25, hpBonus: 25, critBonus: 10 },
        { level: 12, requiredJade: 30000, label: '仙尊',     attackBonus: 40, defenseBonus: 30, hpBonus: 30, critBonus: 12 }
    ];

    // 获取当前VIP等级
    getLevel() {
        const totalRecharged = this.game.gameState?.vip?.totalRecharged || 0;
        let currentLevel = 0;
        for (const vipLevel of VIPSystem.VIP_LEVELS) {
            if (totalRecharged >= vipLevel.requiredJade) {
                currentLevel = vipLevel.level;
            } else {
                break;
            }
        }
        return currentLevel;
    }

    // 获取当前VIP等级配置
    getVIPInfo() {
        const level = this.getLevel();
        return VIPSystem.VIP_LEVELS[level];
    }

    // 获取当前等级的加成对象
    getBonus() {
        const info = this.getVIPInfo();
        return {
            attackBonus: info.attackBonus,
            defenseBonus: info.defenseBonus,
            hpBonus: info.hpBonus,
            critBonus: info.critBonus
        };
    }

    // 验证充值码（调用服务端API）
    async recharge(code) {
        try {
            const token = localStorage.getItem('cultivationToken');
            if (!token) {
                return { success: false, jade: 0, message: '请先登录！' };
            }

            const response = await fetch('/api/recharge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            });

            const result = await response.json();

            if (result.success) {
                // 更新本地gameState
                this.game.gameState.resources.jade = result.totalJade;
                this.game.gameState.vip.level = result.vipLevel;
                this.game.gameState.vip.totalRecharged += result.jade;

                // VIP升级提示
                if (result.vipLeveledUp) {
                    this.game.addBattleLog(`恭喜！VIP等级提升至VIP${result.vipLevel}·${result.vipInfo.label}！`);
                }
            }

            return result;
        } catch (e) {
            console.error('[充值] 请求失败:', e);
            return { success: false, jade: 0, message: '网络错误，请稍后重试' };
        }
    }

    // 增加仙玉并自动升级VIP
    addJade(amount) {
        if (!this.game.gameState.vip) {
            this.game.gameState.vip = { level: 0, totalRecharged: 0 };
        }
        this.game.gameState.resources.jade = (this.game.gameState.resources.jade || 0) + amount;
        this.game.gameState.vip.totalRecharged += amount;
        const newLevel = this.getLevel();
        if (newLevel > this.game.gameState.vip.level) {
            const oldLevel = this.game.gameState.vip.level;
            this.game.gameState.vip.level = newLevel;
            return { leveledUp: true, oldLevel, newLevel, info: VIPSystem.VIP_LEVELS[newLevel] };
        }
        this.game.gameState.vip.level = newLevel;
        return { leveledUp: false };
    }

    // 将VIP加成叠加到基础属性上（返回新对象，不修改原对象）
    applyBonuses(baseStats) {
        const bonus = this.getBonus();
        return {
            attack: Math.floor(baseStats.attack * (1 + bonus.attackBonus / 100)),
            defense: Math.floor(baseStats.defense * (1 + bonus.defenseBonus / 100)),
            hp: Math.floor(baseStats.hp * (1 + bonus.hpBonus / 100)),
            maxHp: Math.floor(baseStats.maxHp * (1 + bonus.hpBonus / 100)),
            criticalRate: baseStats.criticalRate + bonus.critBonus
        };
    }
}

// 挂载到全局（浏览器环境）
if (typeof window !== 'undefined') {
    window.VIPSystem = VIPSystem;
}

// 导出（Node/Vitest 环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VIPSystem };
}
