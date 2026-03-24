/**
 * useSkill 事件化重构测试
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { eventManager } from '../../src/core/EventManager.js';

describe('useSkill 事件化测试', () => {
  let mockGame;

  beforeEach(() => {
    eventManager.clear();

    mockGame = {
      transientState: {
        battle: {
          inBattle: true
        },
        enemy: {
          name: '测试敌人',
          hp: 100,
          maxHp: 100
        }
      },
      persistentState: {
        player: {
          hp: 100,
          maxHp: 100,
          energy: 50,
          maxEnergy: 100,
          skills: {
            equipped: {
              attack: 'fireball'
            },
            levels: {
              fireball: 3
            }
          }
        }
      },
      battle3D: {
        player: {},
        enemy: {},
        scene: {}
      },
      metadata: {
        realmSkills: [
          {
            id: 'fireball',
            baseDisplayName: '火球术',
            type: 'attack',
            levels: [
              { energyCost: 10, damageMultiplier: 1.5 },
              { energyCost: 15, damageMultiplier: 2.0 },
              { energyCost: 20, damageMultiplier: 2.5 }
            ]
          }
        ]
      },

      useSkill(skillType = 'attack') {
        // 获取指定类型的装备技能
        const equippedSkillId = this.persistentState.player.skills.equipped?.[skillType];
        if (!equippedSkillId) return false;

        const skillLevel = this.persistentState.player.skills.levels?.[equippedSkillId] || 0;
        if (skillLevel === 0) return false;

        const skillTree = this.metadata.realmSkills?.find(tree => tree.id === equippedSkillId);
        if (!skillTree) return false;

        const skill = skillTree.levels[skillLevel - 1];
        if (!skill) return false;

        const skillDisplayName = skillTree.baseDisplayName || '未知技能';

        // 触发事件
        if (typeof eventManager !== 'undefined' && eventManager) {
          eventManager.emit('battle:skill', {
            skillType,
            skillId: equippedSkillId,
            skillName: skillDisplayName,
            energyCost: skill.energyCost,
            timestamp: Date.now()
          });
        }

        return true;
      }
    };
  });

  afterEach(() => {
    eventManager.clear();
  });

  test('useSkill 应该触发 battle:skill 事件', () => {
    const callback = vi.fn();
    eventManager.on('battle:skill', callback);

    mockGame.useSkill('attack');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'battle:skill',
        data: expect.objectContaining({
          skillType: 'attack',
          skillId: 'fireball',
          skillName: '火球术'
        })
      })
    );
  });

  test('事件数据应该包含技能信息', () => {
    const callback = vi.fn();
    eventManager.on('battle:skill', callback);

    mockGame.useSkill('attack');

    const eventData = callback.mock.calls[0][0];
    expect(eventData.data.skillType).toBe('attack');
    expect(eventData.data.skillId).toBe('fireball');
    expect(eventData.data.skillName).toBe('火球术');
    expect(eventData.data.energyCost).toBe(20); // level 3 的消耗
  });

  test('事件数据应该包含时间戳', () => {
    const callback = vi.fn();
    eventManager.on('battle:skill', callback);

    const beforeTime = Date.now();
    mockGame.useSkill('attack');
    const afterTime = Date.now();

    const eventData = callback.mock.calls[0][0];
    expect(eventData.data.timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(eventData.data.timestamp).toBeLessThanOrEqual(afterTime);
  });

  test('不同技能类型应该触发不同事件', () => {
    const callback = vi.fn();
    eventManager.on('battle:skill', callback);

    mockGame.persistentState.player.skills.equipped.defense = 'shield';
    mockGame.persistentState.player.skills.levels.shield = 2;
    mockGame.metadata.realmSkills.push({
      id: 'shield',
      baseDisplayName: '护盾术',
      type: 'defense',
      levels: [
        { energyCost: 10, shield: 50 },
        { energyCost: 15, shield: 100 }
      ]
    });

    mockGame.useSkill('attack');
    mockGame.useSkill('defense');

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1,
      expect.objectContaining({
        data: expect.objectContaining({
          skillType: 'attack',
          skillName: '火球术'
        })
      })
    );
    expect(callback).toHaveBeenNthCalledWith(2,
      expect.objectContaining({
        data: expect.objectContaining({
          skillType: 'defense',
          skillName: '护盾术'
        })
      })
    );
  });

  test('多个监听器应该都能接收到事件', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    eventManager.on('battle:skill', listener1);
    eventManager.on('battle:skill', listener2);

    mockGame.useSkill('attack');

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  test('事件监听器可以访问技能详细信息', () => {
    let skillInfo = null;

    eventManager.on('battle:skill', (event) => {
      skillInfo = {
        type: event.data.skillType,
        name: event.data.skillName,
        cost: event.data.energyCost
      };
    });

    mockGame.useSkill('attack');

    expect(skillInfo).toEqual({
      type: 'attack',
      name: '火球术',
      cost: 20
    });
  });

  test('模拟战斗技能使用场景', () => {
    const skills = [];

    eventManager.on('battle:skill', (event) => {
      skills.push({
        name: event.data.skillName,
        cost: event.data.energyCost
      });
    });

    // 模拟连续使用技能
    mockGame.useSkill('attack');
    mockGame.useSkill('attack');
    mockGame.useSkill('attack');

    expect(skills).toHaveLength(3);
    expect(skills[0].name).toBe('火球术');
    expect(skills[0].cost).toBe(20);
  });

  test('事件监听器可以用于统计技能使用', () => {
    const stats = { skillCount: 0, totalEnergyCost: 0, lastSkill: null };

    eventManager.on('battle:skill', (event) => {
      stats.skillCount++;
      stats.totalEnergyCost += event.data.energyCost;
      stats.lastSkill = event.data.skillName;
    });

    mockGame.useSkill('attack');
    mockGame.useSkill('attack');

    expect(stats.skillCount).toBe(2);
    expect(stats.totalEnergyCost).toBe(40); // 20 * 2
    expect(stats.lastSkill).toBe('火球术');
  });
});
