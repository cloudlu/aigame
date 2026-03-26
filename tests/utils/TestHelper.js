/**
 * 测试工具函数
 * 提供创建测试对象、模拟游戏环境等辅助功能
 */

import { vi } from 'vitest';

/**
 * 创建模拟游戏对象
 */
export function createMockGame(overrides = {}) {
    return {
        persistentState: {
            player: {
                hp: 100,
                maxHp: 100,
                attack: 10,
                defense: 5,
                speed: 10,
                luck: 5,
                exp: 0,
                maxExp: 100,
                level: 1,
                realm: {
                    currentRealm: 0,
                    currentStage: 1,
                    currentLevel: 1
                },
                equipment: {},
                inventory: [],
                ...overrides.persistentState?.player
            },
            resources: {
                spiritStones: 0,
                jade: 0,
                herbs: 0,
                iron: 0,
                breakthroughStones: 0,
                ...overrides.persistentState?.resources
            },
            collection: {
                enemies: [],
                equipmentTypes: [],
                rewardedCategories: [],
                ...overrides.persistentState?.collection
            },
            ...overrides.persistentState
        },
        transientState: {
            enemy: null,
            sceneMonsters: [],
            battle: { inBattle: false, battleLog: [] },
            ...overrides.transientState
        },
        metadata: {
            equipmentRarities: [
                { name: 'white', displayName: '白色', multiplier: 1.0, statCount: 1 },
                { name: 'blue', displayName: '蓝色', multiplier: 1.5, statCount: 2 },
                { name: 'purple', displayName: '紫色', multiplier: 2.2, statCount: 3 },
                { name: 'gold', displayName: '黄金', multiplier: 3.2, statCount: 4 },
                { name: 'rainbow', displayName: '彩色', multiplier: 4.5, statCount: 5 }
            ],
            equipmentTemplates: [
                {
                    type: 'weapon',
                    nameSuffixes: ['铁剑', '钢刀', '木枪', '木棍', '石斧', '木杖']
                },
                {
                    type: 'helmet',
                    nameSuffixes: ['布冠', '布帽', '皮盔', '头巾', '铁环', '布带']
                }
            ],
            realmConfig: [
                { name: '武者' },
                { name: '炼气' },
                { name: '筑基' },
                { name: '金丹' },
                { name: '元婴' },
                { name: '化神' }
            ],
            mapNames: {
                'map1': '测试地图1',
                'map2': '测试地图2'
            },
            mapEnemyMapping: {
                'map1': ['enemy1', 'enemy2'],
                'map2': ['enemy3', 'enemy4']
            },
            mapRealmRequirements: {
                'map1': { realm: 0, name: '武者' },
                'map2': { realm: 1, name: '炼气' }
            },
            ...overrides.metadata
        },
        addBattleLog: vi.fn(),
        updateUI: vi.fn(),
        saveGame: vi.fn(),
        equipmentSystem: {
            generateEquipment: vi.fn((type, level, rarity) => ({
                id: `${type}_${level}_${rarity}_${Date.now()}`,
                type,
                level,
                rarity,
                name: `测试${type}`,
                suffix: '测试',
                stats: { attack: 10, defense: 5 }
            }))
        },
        ...overrides
    };
}

/**
 * 创建测试装备对象
 */
export function createTestEquipment(overrides = {}) {
    return {
        id: 'test_weapon_1',
        name: '测试武器',
        type: 'weapon',
        suffix: '铁剑',
        level: 1,
        realmName: '武者',
        refineLevel: 0,
        stats: {
            attack: 10,
            defense: 5
        },
        rarity: 'white',
        rarityDisplayName: '白色',
        rarityMultiplier: 1.0,
        ...overrides
    };
}

/**
 * 创建测试敌人对象
 */
export function createTestEnemy(overrides = {}) {
    return {
        name: '测试敌人',
        baseName: '测试敌人',
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 5,
        speed: 10,
        isElite: false,
        isBoss: false,
        ...overrides
    };
}

/**
 * 创建测试玩家对象
 */
export function createTestPlayer(overrides = {}) {
    return {
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 5,
        speed: 10,
        luck: 5,
        exp: 0,
        maxExp: 100,
        level: 1,
        realm: {
            currentRealm: 0,
            currentStage: 1,
            currentLevel: 1
        },
        equipment: {},
        inventory: [],
        ...overrides
    };
}

/**
 * 等待指定毫秒数
 */
export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 模拟事件管理器
 */
export function createMockEventManager() {
    const listeners = new Map();

    return {
        on: vi.fn((eventName, callback) => {
            if (!listeners.has(eventName)) {
                listeners.set(eventName, []);
            }
            listeners.get(eventName).push(callback);
        }),
        emit: vi.fn((eventName, data) => {
            const callbacks = listeners.get(eventName);
            if (callbacks) {
                callbacks.forEach(cb => cb(data));
            }
        }),
        off: vi.fn((eventName, callback) => {
            const callbacks = listeners.get(eventName);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) callbacks.splice(index, 1);
            }
        }),
        once: vi.fn((eventName, callback) => {
            const wrapper = (data) => {
                callback(data);
                this.off(eventName, wrapper);
            };
            this.on(eventName, wrapper);
        }),
        clear: vi.fn(() => {
            listeners.clear();
        }),
        listeners
    };
}
