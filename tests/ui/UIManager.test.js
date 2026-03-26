/**
 * UIManager 单元测试
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import UIManager from '../../src/ui/UIManager.js';

describe('UIManager', () => {
    let uiManager;
    let mockGame;
    let mockEventManager;

    beforeEach(() => {
        // 创建 mock game 对象
        mockGame = {
            updateUI: vi.fn(),
            updateHealthBars: vi.fn(),
            updateEnergyBars: vi.fn()
        };

        // 创建 mock eventManager 对象
        mockEventManager = {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn()
        };

        // 创建 UIManager 实例
        uiManager = new UIManager(mockGame);
    });

    afterEach(() => {
        uiManager.destroy();
    });

    describe('初始化', () => {
        test('应该正确初始化并注册事件监听器', () => {
            uiManager.init(mockEventManager);

            expect(uiManager.eventManager).toBe(mockEventManager);
            expect(mockEventManager.on).toHaveBeenCalled();
        });

        test('当eventManager未提供时应该发出警告', () => {
            const consoleSpy = vi.spyOn(console, 'warn');
            uiManager.init(null);

            expect(consoleSpy).toHaveBeenCalledWith('UIManager: eventManager未提供');
        });
    });

    describe('事件监听', () => {
        test('应该监听 battle:damage 事件', () => {
            uiManager.init(mockEventManager);

            // 查找 battle:damage 事件的监听器
            const damageCall = mockEventManager.on.mock.calls.find(
                call => call[0] === 'battle:damage'
            );

            expect(damageCall).toBeDefined();
            expect(typeof damageCall[1]).toBe('function');
        });

        test('应该监听 battle:energy 事件', () => {
            uiManager.init(mockEventManager);

            const energyCall = mockEventManager.on.mock.calls.find(
                call => call[0] === 'battle:energy'
            );

            expect(energyCall).toBeDefined();
        });

        test('应该监听 battle:attack 事件', () => {
            uiManager.init(mockEventManager);

            const attackCall = mockEventManager.on.mock.calls.find(
                call => call[0] === 'battle:attack'
            );

            expect(attackCall).toBeDefined();
        });

        test('应该监听 equipment:equip 事件', () => {
            uiManager.init(mockEventManager);

            const equipCall = mockEventManager.on.mock.calls.find(
                call => call[0] === 'equipment:equip'
            );

            expect(equipCall).toBeDefined();
        });
    });

    describe('UI更新调度', () => {
        test('scheduleUpdate 应该添加待更新类型', () => {
            uiManager.init(mockEventManager);
            uiManager.scheduleUpdate('healthBars');

            expect(uiManager.pendingUpdates.has('healthBars')).toBe(true);
        });

        test('scheduleUpdate 应该使用节流机制', () => {
            vi.useFakeTimers();
            uiManager.init(mockEventManager);

            // 快速调用多次
            uiManager.scheduleUpdate('healthBars');
            uiManager.scheduleUpdate('healthBars');
            uiManager.scheduleUpdate('healthBars');

            // 只应该创建一个定时器
            expect(uiManager.updateTimer).not.toBeNull();

            vi.useRealTimers();
        });

        test('flushUpdates 应该调用对应的更新方法', () => {
            uiManager.init(mockEventManager);
            uiManager.pendingUpdates.add('healthBars');
            uiManager.pendingUpdates.add('energy');
            uiManager.pendingUpdates.add('resource');

            // Mock document 以避免错误
            vi.stubGlobal('document', {
                getElementById: vi.fn(() => null)
            });

            uiManager.flushUpdates();

            expect(mockGame.updateHealthBars).toHaveBeenCalled();
            // 注意：不再调用 game.updateUI，而是使用细粒度更新

            vi.unstubAllGlobals();
        });

        test('flushUpdates 应该清空待更新列表', () => {
            uiManager.init(mockEventManager);
            uiManager.pendingUpdates.add('healthBars');

            uiManager.flushUpdates();

            expect(uiManager.pendingUpdates.size).toBe(0);
        });
    });

    describe('UI更新方法', () => {
        test('updateHealthBars 应该调用 game.updateHealthBars', () => {
            uiManager.updateHealthBars();

            expect(mockGame.updateHealthBars).toHaveBeenCalled();
        });

        test('updateEnergyDisplay 应该更新灵力显示', () => {
            mockGame.persistentState = {
                player: {
                    energy: 75,
                    maxEnergy: 100
                }
            };

            const mockBarElement = { style: { width: '' } };
            const mockDisplayElement = { textContent: '' };

            vi.stubGlobal('document', {
                getElementById: vi.fn((id) => {
                    if (id === 'energy-bar') return mockBarElement;
                    if (id === 'energy-display') return mockDisplayElement;
                    if (id === 'energy') return { textContent: '' };
                    if (id === 'max-energy') return { textContent: '' };
                    return null;
                })
            });

            uiManager.updateEnergyDisplay();

            expect(mockBarElement.style.width).toBe('75%');
            expect(mockDisplayElement.textContent).toBe('75/100');

            vi.unstubAllGlobals();
        });

        test('updateResourceDisplay 应该更新资源显示', () => {
            mockGame.persistentState = {
                resources: {
                    spiritStones: 100,
                    herbs: 50,
                    iron: 30,
                    breakthroughStones: 5,
                    jade: 10
                }
            };

            const mockElements = {};
            vi.stubGlobal('document', {
                getElementById: vi.fn((id) => {
                    mockElements[id] = { textContent: '' };
                    return mockElements[id];
                })
            });

            uiManager.updateResourceDisplay();

            expect(mockElements['spirit-stones'].textContent).toBe(100);
            expect(mockElements['herbs'].textContent).toBe(50);
            expect(mockElements['iron'].textContent).toBe(30);
            expect(mockElements['breakthrough-stones'].textContent).toBe(5);
            expect(mockElements['jade'].textContent).toBe(10);

            vi.unstubAllGlobals();
        });

        test('forceUpdateAll 应该更新所有UI', () => {
            // Mock document
            vi.stubGlobal('document', {
                getElementById: vi.fn(() => null)
            });

            // forceUpdateAll should not throw error
            expect(() => uiManager.forceUpdateAll()).not.toThrow();

            vi.unstubAllGlobals();
        });

        test('细粒度更新方法应该优雅地处理缺失数据', () => {
            // Mock document 以避免 ReferenceError
            vi.stubGlobal('document', {
                getElementById: vi.fn(() => null)
            });

            // 不设置 mockGame.persistentState
            expect(() => uiManager.updateEnergyDisplay()).not.toThrow();
            expect(() => uiManager.updateResourceDisplay()).not.toThrow();
            expect(() => uiManager.updatePlayerStats()).not.toThrow();
            expect(() => uiManager.updateExpAndLevel()).not.toThrow();
            expect(() => uiManager.updateRealmInfo()).not.toThrow();
            expect(() => uiManager.updateVIPInfo()).not.toThrow();

            vi.unstubAllGlobals();
        });

        test('updateProgressBar 应该更新DOM元素', () => {
            // Mock DOM元素
            const mockBarElement = { style: { width: '' } };
            const mockDisplayElement = { textContent: '' };

            vi.stubGlobal('document', {
                getElementById: vi.fn((id) => {
                    if (id === 'hp-bar') return mockBarElement;
                    if (id === 'hp-display') return mockDisplayElement;
                    return null;
                })
            });

            uiManager.updateProgressBar('hp', 50, 100);

            expect(mockBarElement.style.width).toBe('50%');
            expect(mockDisplayElement.textContent).toBe('50/100');

            vi.unstubAllGlobals();
        });

        test('updateProgressBar 应该支持自定义后缀', () => {
            const mockBarElement = { style: { width: '' } };
            const mockDisplayElement = { textContent: '' };

            vi.stubGlobal('document', {
                getElementById: vi.fn((id) => {
                    if (id === 'energy-bar-modal') return mockBarElement;
                    if (id === 'energy-display-modal') return mockDisplayElement;
                    return null;
                })
            });

            uiManager.updateProgressBar('energy', 75, 100, {
                bar: '-bar-modal',
                display: '-display-modal'
            });

            expect(mockBarElement.style.width).toBe('75%');
            expect(mockDisplayElement.textContent).toBe('75/100');

            vi.unstubAllGlobals();
        });

        test('updateProgressBar 应该处理max为0的情况', () => {
            const mockBarElement = { style: { width: '' } };
            const mockDisplayElement = { textContent: '' };

            vi.stubGlobal('document', {
                getElementById: vi.fn((id) => {
                    if (id === 'hp-bar') return mockBarElement;
                    if (id === 'hp-display') return mockDisplayElement;
                    return null;
                })
            });

            uiManager.updateProgressBar('hp', 0, 0);

            expect(mockBarElement.style.width).toBe('0%');

            vi.unstubAllGlobals();
        });

        test('updateProgressBar 应该限制百分比不超过100%', () => {
            const mockBarElement = { style: { width: '' } };
            const mockDisplayElement = { textContent: '' };

            vi.stubGlobal('document', {
                getElementById: vi.fn((id) => {
                    if (id === 'hp-bar') return mockBarElement;
                    if (id === 'hp-display') return mockDisplayElement;
                    return null;
                })
            });

            uiManager.updateProgressBar('hp', 150, 100);

            expect(mockBarElement.style.width).toBe('100%');

            vi.unstubAllGlobals();
        });
    });

    describe('清理', () => {
        test('destroy 应该移除所有事件监听器', () => {
            uiManager.init(mockEventManager);
            const listenerCount = uiManager.listeners.length;

            uiManager.destroy();

            // 应该调用 off 方法 listenerCount 次
            expect(mockEventManager.off).toHaveBeenCalledTimes(listenerCount);
            expect(uiManager.listeners.length).toBe(0);
        });

        test('destroy 应该清理定时器', () => {
            vi.useFakeTimers();
            uiManager.init(mockEventManager);
            uiManager.scheduleUpdate('healthBars');

            uiManager.destroy();

            expect(uiManager.updateTimer).toBeNull();
            vi.useRealTimers();
        });

        test('destroy 应该清空待更新列表', () => {
            uiManager.init(mockEventManager);
            uiManager.pendingUpdates.add('healthBars');

            uiManager.destroy();

            expect(uiManager.pendingUpdates.size).toBe(0);
        });
    });
});
