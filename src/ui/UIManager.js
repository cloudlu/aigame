/**
 * UIManager - 统一的UI管理系统
 *
 * 职责：
 * - 监听游戏事件，自动更新UI
 * - 消除分散在各个模块中的UI更新代码
 * - 提供统一的UI更新接口
 * - 细粒度UI更新（按需更新，不更新所有）
 *
 * 架构演进：
 * - 阶段1：委托机制（已实现）- game.js 委托给 UIManager
 * - 阶段2：细粒度更新（进行中）- 拆分 updateUI 为多个小方法
 * - 阶段3：完全迁移（未来）- UI逻辑完全在 UIManager 中
 */

class UIManager {
    constructor(game) {
        this.game = game;
        this.eventManager = null;
        this.listeners = [];

        // UI更新节流（防止频繁更新）
        this.updateTimer = null;
        this.pendingUpdates = new Set();
        this.updateDelay = 50; // 50ms节流
    }

    /**
     * 初始化 - 注册所有UI更新事件监听器
     */
    init(eventManager) {
        if (!eventManager) {
            console.warn('UIManager: eventManager未提供');
            return;
        }

        this.eventManager = eventManager;

        // ========== 战斗系统UI更新（细粒度）==========
        this.addListener('battle:damage', () => this.scheduleUpdate('healthBars'));
        this.addListener('battle:energy', () => this.scheduleUpdate('energy'));
        this.addListener('battle:attack', () => this.scheduleUpdate('playerStats'));
        this.addListener('battle:skill', () => this.scheduleUpdate('playerStats'));
        this.addListener('battle:victory', () => this.scheduleUpdate('expAndLevel', 'resource', 'playerStats'));
        this.addListener('battle:defeat', () => this.scheduleUpdate('playerStats'));
        this.addListener('battle:dodge', () => this.scheduleUpdate('healthBars'));
        this.addListener('battle:log', () => this.scheduleUpdate('battleLog'));

        // ========== 装备系统UI更新（细粒度）==========
        this.addListener('equipment:equip', () => this.scheduleUpdate('playerStats'));
        this.addListener('equipment:check', () => this.scheduleUpdate('playerStats'));

        // ========== 玩家状态UI更新 ==========
        // 可以扩展更多事件...

        console.log('✅ UIManager 初始化完成（细粒度更新模式）');
    }

    /**
     * 添加事件监听器（记录以便清理）
     */
    addListener(eventName, callback) {
        if (!this.eventManager) {
            console.warn(`UIManager: 无法添加监听器 ${eventName}，eventManager未初始化`);
            return;
        }

        this.eventManager.on(eventName, callback);
        this.listeners.push({ eventName, callback });
    }

    /**
     * 调度UI更新（带节流，支持多个更新类型）
     */
    scheduleUpdate(...updateTypes) {
        updateTypes.forEach(type => this.pendingUpdates.add(type));

        // 如果已经有定时器，不需要重复创建
        if (this.updateTimer) {
            return;
        }

        // 设置节流定时器
        this.updateTimer = setTimeout(() => {
            this.flushUpdates();
            this.updateTimer = null;
        }, this.updateDelay);
    }

    /**
     * 执行所有待处理的UI更新（细粒度）
     */
    flushUpdates() {
        // 优先级：先更新紧急的（血条），再更新次要的（资源）
        const updateOrder = [
            'healthBars',
            'energy',
            'playerStats',
            'expAndLevel',
            'resource',
            'realm',
            'vip',
            'battleLog'
        ];

        // 按优先级执行更新
        updateOrder.forEach(updateType => {
            if (this.pendingUpdates.has(updateType)) {
                this.executeUpdate(updateType);
            }
        });

        // 清空待处理列表
        this.pendingUpdates.clear();
    }

    /**
     * 执行具体的UI更新
     */
    executeUpdate(updateType) {
        switch (updateType) {
            case 'healthBars':
                this.updateHealthBars();
                break;
            case 'energy':
                this.updateEnergyDisplay();
                break;
            case 'playerStats':
                this.updatePlayerStats();
                break;
            case 'expAndLevel':
                this.updateExpAndLevel();
                break;
            case 'resource':
                this.updateResourceDisplay();
                break;
            case 'realm':
                this.updateRealmInfo();
                break;
            case 'vip':
                this.updateVIPInfo();
                break;
            case 'battleLog':
                this.updateBattleLog();
                break;
            default:
                console.warn(`UIManager: 未知的更新类型 ${updateType}`);
        }
    }

    // ==================== 细粒度UI更新方法 ====================

    /**
     * 更新血条（高频调用）
     */
    updateHealthBars() {
        if (typeof this.game.updateHealthBars === 'function') {
            try {
                this.game.updateHealthBars();
            } catch (error) {
                console.error('UIManager: 更新血条失败', error);
            }
        }
    }

    /**
     * 更新灵力显示（中频调用）
     */
    updateEnergyDisplay() {
        const player = this.game.persistentState?.player;
        if (!player) return;

        const energyCurrent = player.energy || 0;
        const energyMax = player.maxEnergy || 100;

        // 更新进度条（主页和人物面板）
        this.updateProgressBar('energy', energyCurrent, energyMax);
        this.updateProgressBar('energy', energyCurrent, energyMax, {
            bar: '-bar-modal',
            display: '-display-modal'
        });

        // 更新文本元素
        this.updateElement('energy', Math.floor(energyCurrent));
        this.updateElement('max-energy', energyMax);
    }

    /**
     * 更新资源显示（低频调用）
     */
    updateResourceDisplay() {
        const resources = this.game.persistentState?.resources;
        if (!resources) return;

        this.updateElement('spirit-stones', Math.floor(resources.spiritStones || 0));
        this.updateElement('herbs', Math.floor(resources.herbs || 0));
        this.updateElement('iron', Math.floor(resources.iron || 0));
        this.updateElement('breakthrough-stones', resources.breakthroughStones || 0);
        this.updateElement('jade', resources.jade || 0);
    }

    /**
     * 更新玩家属性（中频调用）
     */
    updatePlayerStats() {
        if (typeof this.game.getActualStats !== 'function') return;

        const stats = this.game.getActualStats();
        const player = this.game.persistentState?.player;
        if (!player) return;

        // 更新攻击、防御
        this.updateElement('attack', Math.floor(stats.attack));
        this.updateElement('defense', Math.floor(stats.defense));

        // 更新HP
        const hp = player.hp;
        const maxHp = stats.maxHp;
        this.updateElement('hp-display', `${Math.floor(hp)}/${Math.floor(maxHp)}`);
        this.updateElement('hp', Math.floor(hp));
        this.updateElement('max-hp', Math.floor(maxHp));

        // 更新血条
        this.updateProgressBar('hp', hp, maxHp);
        this.updateProgressBar('hp', hp, maxHp, {
            bar: '-bar-modal',
            display: '-display-modal'
        });
    }

    /**
     * 更新经验和等级（低频调用）
     */
    updateExpAndLevel() {
        const player = this.game.persistentState?.player;
        if (!player) return;

        // 更新经验值
        this.updateElement('exp', player.exp);
        this.updateElement('max-exp', player.maxExp);

        // 更新经验条
        const expBarElement = document.getElementById('exp-bar');
        if (expBarElement) {
            const expPercentage = (player.exp / player.maxExp) * 100;
            expBarElement.style.width = `${Math.min(expPercentage, 100)}%`;
        }

        // 更新等级显示
        const levelElement = document.getElementById('level');
        if (levelElement && this.game.metadata?.realmConfig) {
            const realm = player.realm;
            const realmName = this.game.metadata.realmConfig[realm.currentRealm].name;
            const stageConfig = this.game.metadata.realmConfig[realm.currentRealm].stages[realm.currentStage - 1];
            const stageName = stageConfig.name;
            levelElement.textContent = `${realmName} ${stageName} ${realm.currentStage}阶 ${realm.currentLevel}级`;
        }
    }

    /**
     * 更新境界信息（低频调用）
     */
    updateRealmInfo() {
        const player = this.game.persistentState?.player;
        if (!player?.realm || !this.game.metadata?.realmConfig) return;

        const realm = player.realm;
        const realmName = this.game.metadata.realmConfig[realm.currentRealm].name;
        const stageConfig = this.game.metadata.realmConfig[realm.currentRealm].stages[realm.currentStage - 1];
        const stageName = stageConfig.name;

        // 更新导航栏
        this.updateElement('nav-realm-name', `${realmName}期`);
        this.updateElement('nav-realm-stage', `· ${stageName}`);
        this.updateElement('nav-realm-level', `（${realm.currentStage}阶）`);

        // 更新人物面板
        this.updateElement('realm-display', `${realmName}期 · ${stageName}`);
    }

    /**
     * 更新VIP信息（低频调用）
     */
    updateVIPInfo() {
        const vipLevel = this.game.persistentState?.vip?.level || 0;
        const vipBadgeElement = document.getElementById('nav-vip-badge');

        if (vipBadgeElement) {
            if (vipLevel > 0 && this.game.vipSystem?.getVIPInfo) {
                const vipInfo = this.game.vipSystem.getVIPInfo();
                vipBadgeElement.textContent = `VIP${vipLevel}·${vipInfo.label}`;
                vipBadgeElement.style.display = 'flex';
            } else {
                vipBadgeElement.style.display = 'none';
            }
        }
    }

    /**
     * 更新战斗日志
     */
    updateBattleLog() {
        // 战斗日志通常已经在 addBattleLog 中更新了
        // 这里可以预留扩展
    }

    // ==================== 通用UI辅助方法 ====================

    /**
     * 更新进度条（核心UI组件）
     */
    updateProgressBar(elementPrefix, current, max, suffixes = { bar: '-bar', display: '-display' }) {
        const percentage = max > 0 ? (current / max) * 100 : 0;

        const barElement = document.getElementById(elementPrefix + suffixes.bar);
        if (barElement) {
            barElement.style.width = `${Math.min(percentage, 100)}%`;
        }

        const displayElement = document.getElementById(elementPrefix + suffixes.display);
        if (displayElement) {
            displayElement.textContent = `${Math.floor(current)}/${Math.floor(max)}`;
        }
    }

    /**
     * 更新DOM元素文本（辅助方法）
     */
    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * 立即强制更新所有UI（不节流，仅用于特殊情况）
     */
    forceUpdateAll() {
        console.warn('UIManager: forceUpdateAll() 被调用，这会更新所有UI（性能较低）');
        this.updateEnergyDisplay();
        this.updateResourceDisplay();
        this.updatePlayerStats();
        this.updateExpAndLevel();
        this.updateRealmInfo();
        this.updateVIPInfo();
    }

    /**
     * 清理所有监听器
     */
    destroy() {
        if (!this.eventManager) {
            return;
        }

        // 清理定时器
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }

        // 移除所有监听器
        this.listeners.forEach(({ eventName, callback }) => {
            this.eventManager.off(eventName, callback);
        });

        this.listeners = [];
        this.pendingUpdates.clear();

        console.log('UIManager 已清理');
    }
}

// 导出 - 支持浏览器和Node环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
} else if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}
