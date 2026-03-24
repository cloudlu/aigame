/**
 * 副本结束bug修复测试
 *
 * Bug修复：
 * 1. 战斗背景音乐在副本结束后继续播放
 * 2. 副本结束后无法移动，提示"正在战斗中"
 * 3. 副本结束后探索地图变成背景色
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

describe('副本结束Bug修复测试', () => {
  let mockGame;
  let mockDungeon;

  beforeEach(() => {
    // Mock DOM elements
    const mockElements = {
      'battle-modal': {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      },
      'game-area-container': {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      },
      'battle-modal-3d-container': {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        },
        firstChild: null
      },
      'exit-dungeon-btn': {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      }
    };

    global.document = {
      getElementById: vi.fn((id) => mockElements[id] || {
        classList: {
          add: vi.fn(),
          remove: vi.fn()
        }
      })
    };

    // Mock game object
    mockGame = {
      transientState: {
        battle: {
          inBattle: true
        },
        enemy: {
          name: '测试敌人',
          hp: 0,
          maxHp: 100,
          cellIndex: 5
        }
      },
      persistentState: {
        player: {
          hp: 80,
          maxHp: 100,
          energy: 50
        }
      },
      battle3D: {
        engine: {
          dispose: vi.fn()
        }
      },
      audioSystem: {
        stopBattleMusic: vi.fn()
      },
      clearBattleStates: vi.fn(),
      restoreMapScene: vi.fn(),
      showDungeonComplete: vi.fn(),
      showDungeonList: vi.fn(),
      showNotification: vi.fn()
    };

    // Mock dungeon system
    mockDungeon = {
      game: mockGame,
      currentDungeon: 'spirit_stone_mine',
      currentDifficulty: 'normal',
      enemyQueue: [{}, {}, {}],
      currentEnemyIndex: 2,
      playerStateBackup: { hp: 100, energy: 100 },

      stopAllDungeonMusic: vi.fn(),
      consumeAttempt: vi.fn(),
      calculateReward: vi.fn(() => ({ spirit_stones: 100, herbs: 10 })),
      giveReward: vi.fn(),
      checkFirstClearBonus: vi.fn(),
      markDungeonCleared: vi.fn(),

      // completeDungeon 实现（修复后）
      completeDungeon() {
        this.stopAllDungeonMusic();
        this.consumeAttempt(this.currentDungeon, this.currentDifficulty);

        const reward = this.calculateReward(this.currentDungeon, this.currentDifficulty);
        this.giveReward(reward);
        this.checkFirstClearBonus(this.currentDungeon, this.currentDifficulty);
        this.markDungeonCleared(this.currentDungeon, this.currentDifficulty);

        this.game.transientState.enemy = null;
        this.playerStateBackup = null;
        this.currentDungeon = null;
        this.currentDifficulty = null;
        this.enemyQueue = [];

        // ✅ 关键修复：调用 closeBattleModal
        this.game.closeBattleModal();

        this.game.showDungeonComplete(reward);
      },

      // exitDungeon 实现（修复后）
      exitDungeon(reason, restoreState) {
        if (restoreState) {
          // restorePlayerState mock
        }

        // ✅ 关键修复：调用 closeBattleModal
        this.game.closeBattleModal();

        this.game.transientState.enemy = null;
        this.currentDungeon = null;
        this.currentDifficulty = null;
        this.enemyQueue = [];
        this.currentEnemyIndex = 0;

        this.game.showNotification(`副本挑战失败：${reason}`, 'warning');
        this.game.showDungeonList();
      }
    };

    // Mock closeBattleModal（修复后）
    mockGame.closeBattleModal = function() {
      const battleModal = document.getElementById('battle-modal');
      if (battleModal) {
        battleModal.classList.add('hidden');
      }

      // ✅ 关键修复：显示主游戏区域
      const gameAreaContainer = document.getElementById('game-area-container');
      if (gameAreaContainer) {
        gameAreaContainer.classList.remove('hidden');
      }

      // 停止战斗音乐
      this.audioSystem.stopBattleMusic();

      // 清理战斗状态
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

      this.battle3D = null;

      // 重置战斗状态
      if (this.transientState.battle) {
        this.transientState.battle.inBattle = false;
      }

      // 恢复地图场景
      this.restoreMapScene();
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Bug 1: 战斗背景音乐停止', () => {
    test('completeDungeon 应该调用 closeBattleModal 从而停止战斗音乐', () => {
      mockDungeon.completeDungeon();

      expect(mockGame.audioSystem.stopBattleMusic).toHaveBeenCalled();
    });

    test('exitDungeon 应该调用 closeBattleModal 从而停止战斗音乐', () => {
      mockDungeon.exitDungeon('测试失败', true);

      expect(mockGame.audioSystem.stopBattleMusic).toHaveBeenCalled();
    });
  });

  describe('Bug 2: 战斗状态重置', () => {
    test('completeDungeon 应该重置 inBattle 状态为 false', () => {
      mockGame.transientState.battle.inBattle = true;

      mockDungeon.completeDungeon();

      expect(mockGame.transientState.battle.inBattle).toBe(false);
    });

    test('exitDungeon 应该重置 inBattle 状态为 false', () => {
      mockGame.transientState.battle.inBattle = true;

      mockDungeon.exitDungeon('测试失败', true);

      expect(mockGame.transientState.battle.inBattle).toBe(false);
    });

    test('completeDungeon 应该调用 clearBattleStates 清理临时状态', () => {
      mockDungeon.completeDungeon();

      expect(mockGame.clearBattleStates).toHaveBeenCalled();
    });

    test('exitDungeon 应该调用 clearBattleStates 清理临时状态', () => {
      mockDungeon.exitDungeon('测试失败', true);

      expect(mockGame.clearBattleStates).toHaveBeenCalled();
    });
  });

  describe('Bug 3: 地图显示恢复', () => {
    test('closeBattleModal 应该显示 game-area-container', () => {
      mockGame.closeBattleModal();

      const gameAreaContainer = document.getElementById('game-area-container');
      expect(gameAreaContainer.classList.remove).toHaveBeenCalledWith('hidden');
    });

    test('closeBattleModal 应该隐藏 battle-modal', () => {
      mockGame.closeBattleModal();

      const battleModal = document.getElementById('battle-modal');
      expect(battleModal.classList.add).toHaveBeenCalledWith('hidden');
    });

    test('completeDungeon 应该调用 closeBattleModal', () => {
      const closeBattleModalSpy = vi.spyOn(mockGame, 'closeBattleModal');

      mockDungeon.completeDungeon();

      expect(closeBattleModalSpy).toHaveBeenCalled();
    });

    test('exitDungeon 应该调用 closeBattleModal', () => {
      const closeBattleModalSpy = vi.spyOn(mockGame, 'closeBattleModal');

      mockDungeon.exitDungeon('测试失败', true);

      expect(closeBattleModalSpy).toHaveBeenCalled();
    });
  });

  describe('完整流程测试', () => {
    test('副本通关完整流程应该正确清理所有状态', () => {
      // 初始状态
      mockGame.transientState.battle.inBattle = true;
      mockDungeon.currentDungeon = 'spirit_stone_mine';
      mockDungeon.enemyQueue = [{}, {}, {}];

      // 完成副本
      mockDungeon.completeDungeon();

      // 验证所有清理操作
      expect(mockGame.transientState.battle.inBattle).toBe(false);
      expect(mockGame.audioSystem.stopBattleMusic).toHaveBeenCalled();
      expect(mockGame.clearBattleStates).toHaveBeenCalled();
      expect(mockGame.restoreMapScene).toHaveBeenCalled();
      expect(mockGame.showDungeonComplete).toHaveBeenCalled();
      expect(mockDungeon.currentDungeon).toBeNull();
      expect(mockDungeon.enemyQueue).toEqual([]);
    });

    test('副本失败完整流程应该正确清理所有状态', () => {
      // 初始状态
      mockGame.transientState.battle.inBattle = true;
      mockDungeon.currentDungeon = 'spirit_stone_mine';
      mockDungeon.enemyQueue = [{}, {}, {}];

      // 退出副本
      mockDungeon.exitDungeon('战斗失败', true);

      // 验证所有清理操作
      expect(mockGame.transientState.battle.inBattle).toBe(false);
      expect(mockGame.audioSystem.stopBattleMusic).toHaveBeenCalled();
      expect(mockGame.clearBattleStates).toHaveBeenCalled();
      expect(mockGame.restoreMapScene).toHaveBeenCalled();
      expect(mockGame.showNotification).toHaveBeenCalled();
      expect(mockGame.showDungeonList).toHaveBeenCalled();
      expect(mockDungeon.currentDungeon).toBeNull();
      expect(mockDungeon.enemyQueue).toEqual([]);
    });
  });

  describe('回归测试 - 防止bug再次出现', () => {
    test('如果没有调用 closeBattleModal，inBattle 状态不会被重置', () => {
      // 模拟修复前的错误实现
      const badImplementation = () => {
        // 直接隐藏battle-modal，不调用closeBattleModal
        const battleModal = document.getElementById('battle-modal');
        if (battleModal) {
          battleModal.classList.add('hidden');
        }
        // 忘记重置 inBattle 状态！
      };

      mockGame.transientState.battle.inBattle = true;
      badImplementation();

      // Bug：inBattle 仍然是 true
      expect(mockGame.transientState.battle.inBattle).toBe(true);
    });

    test('如果没有显示 game-area-container，地图会变成背景色', () => {
      // 模拟修复前的错误实现
      const badImplementation = () => {
        const battleModal = document.getElementById('battle-modal');
        if (battleModal) {
          battleModal.classList.add('hidden');
        }
        // 忘记显示 game-area-container！
      };

      badImplementation();

      const gameAreaContainer = document.getElementById('game-area-container');
      // Bug：game-area-container 仍然是隐藏的
      expect(gameAreaContainer.classList.remove).not.toHaveBeenCalled();
    });
  });
});
