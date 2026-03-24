/**
 * AudioManager 单元测试
 *
 * 测试目标：
 * 1. 事件监听器正确注册
 * 2. 战斗事件触发对应音效
 * 3. 音效配置可扩展
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventManager } from '../../src/core/EventManager.js';
import { AudioManager } from '../../src/audio/AudioManager.js';

describe('AudioManager', () => {
  let eventManager;
  let audioManager;
  let mockGame;

  beforeEach(() => {
    eventManager = new EventManager();

    // Mock AudioSystem
    mockGame = {
      audioSystem: {
        playSound: vi.fn(),
        playSkillSound: vi.fn(),
        stopBattleMusic: vi.fn()
      }
    };

    audioManager = new AudioManager(mockGame);
  });

  afterEach(() => {
    if (audioManager) {
      audioManager.destroy();
    }
    eventManager.clear();
  });

  // ========== 初始化测试 ==========

  describe('初始化', () => {
    test('应该成功创建AudioManager实例', () => {
      expect(audioManager).toBeDefined();
      expect(audioManager.game).toBe(mockGame);
    });

    test('应该包含音效配置映射', () => {
      expect(audioManager.soundConfig).toBeDefined();
      expect(audioManager.soundConfig['battle:attack']).toBeDefined();
      expect(audioManager.soundConfig['battle:victory']).toBeDefined();
    });

    test('应该包含技能音效映射', () => {
      expect(audioManager.skillSoundMap).toBeDefined();
      expect(audioManager.skillSoundMap['defense']).toBe('skill-defense-sound');
      expect(audioManager.skillSoundMap['heal']).toBe('skill-heal-sound');
    });
  });

  // ========== init() 测试 ==========

  describe('init()', () => {
    test('应该成功初始化并注册监听器', () => {
      audioManager.init(eventManager);

      expect(audioManager.eventManager).toBe(eventManager);
      expect(audioManager.listeners.length).toBeGreaterThan(0);
    });

    test('没有eventManager时应该输出警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      audioManager.init(null);

      expect(consoleSpy).toHaveBeenCalledWith('AudioManager: eventManager未提供');
    });
  });

  // ========== 战斗音效测试 ==========

  describe('战斗音效', () => {
    beforeEach(() => {
      audioManager.init(eventManager);
    });

    test('battle:attack 事件应该触发攻击音效', () => {
      eventManager.emit('battle:attack', {
        attacker: 'player',
        target: 'enemy'
      });

      expect(mockGame.audioSystem.playSound).toHaveBeenCalledWith('attack-sound', 1, 200);
    });

    test('battle:victory 事件应该触发胜利音效', () => {
      eventManager.emit('battle:victory', {
        enemy: 'test-enemy',
        isBoss: false
      });

      expect(mockGame.audioSystem.playSound).toHaveBeenCalledWith('victory-sound', 1, 1000);
    });

    test('battle:defeat 事件应该触发失败音效', () => {
      eventManager.emit('battle:defeat', {
        enemy: 'test-enemy'
      });

      expect(mockGame.audioSystem.playSound).toHaveBeenCalledWith('defeat-sound', 1, 1000);
    });

    test('battle:skill 事件应该根据技能类型播放音效', () => {
      eventManager.emit('battle:skill', {
        skillType: 'defense',
        skillId: 'skill-1',
        skillTreeType: 'defense'
      });

      expect(mockGame.audioSystem.playSound).toHaveBeenCalledWith('skill-defense-sound', 0.7, 300);
    });

    test('battle:skill 事件有soundUrl时应该调用playSkillSound', () => {
      const testUrl = 'https://example.com/skill.mp3';
      eventManager.emit('battle:skill', {
        skillType: 'attack',
        soundUrl: testUrl
      });

      expect(mockGame.audioSystem.playSkillSound).toHaveBeenCalledWith(testUrl);
    });
  });

  // ========== 音效委托测试 ==========

  describe('音效播放委托', () => {
    test('playSound 应该委托给 audioSystem', () => {
      audioManager.playSound('test-sound', 0.5, 500);

      expect(mockGame.audioSystem.playSound).toHaveBeenCalledWith('test-sound', 0.5, 500);
    });

    test('playSkillSound 应该委托给 audioSystem', () => {
      const testUrl = 'https://example.com/skill.mp3';
      audioManager.playSkillSound(testUrl);

      expect(mockGame.audioSystem.playSkillSound).toHaveBeenCalledWith(testUrl);
    });

    test('stopBattleMusic 应该委托给 audioSystem', () => {
      audioManager.stopBattleMusic();

      expect(mockGame.audioSystem.stopBattleMusic).toHaveBeenCalled();
    });

    test('audioSystem未初始化时应该输出警告', () => {
      const badManager = new AudioManager({});
      const consoleSpy = vi.spyOn(console, 'warn');

      badManager.playSound('test');

      expect(consoleSpy).toHaveBeenCalledWith('AudioManager: audioSystem未初始化');
    });
  });

  // ========== 自定义音效映射测试 ==========

  describe('自定义音效映射', () => {
    test('应该能够添加自定义音效映射', () => {
      audioManager.init(eventManager);

      audioManager.addSoundMapping('custom:event', {
        soundId: 'custom-sound',
        volume: 0.8,
        timeout: 1000
      });

      eventManager.emit('custom:event', {});

      expect(mockGame.audioSystem.playSound).toHaveBeenCalledWith('custom-sound', 0.8, 1000);
    });
  });

  // ========== 清理测试 ==========

  describe('destroy()', () => {
    test('应该清理所有监听器', () => {
      audioManager.init(eventManager);
      const initialCount = audioManager.listeners.length;

      audioManager.destroy();

      expect(audioManager.listeners.length).toBe(0);
    });

    test('清理后不应该再响应事件', () => {
      audioManager.init(eventManager);
      audioManager.destroy();

      eventManager.emit('battle:attack', {});

      expect(mockGame.audioSystem.playSound).not.toHaveBeenCalled();
    });
  });

  // ========== 集成测试 ==========

  describe('集成测试', () => {
    test('完整流程：初始化 → 触发事件 → 播放音效', () => {
      // 初始化
      audioManager.init(eventManager);

      // 触发攻击事件
      eventManager.emit('battle:attack', { attacker: 'player' });

      // 验证音效播放
      expect(mockGame.audioSystem.playSound).toHaveBeenCalledWith('attack-sound', 1, 200);

      // 触发技能事件
      eventManager.emit('battle:skill', { skillType: 'heal', skillTreeType: 'heal' });

      // 验证音效播放
      expect(mockGame.audioSystem.playSound).toHaveBeenCalledWith('skill-heal-sound', 0.6, 300);
    });

    test('多次事件触发应该多次播放音效', () => {
      audioManager.init(eventManager);

      eventManager.emit('battle:attack', {});
      eventManager.emit('battle:attack', {});
      eventManager.emit('battle:attack', {});

      expect(mockGame.audioSystem.playSound).toHaveBeenCalledTimes(3);
    });
  });
});
