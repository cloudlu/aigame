/**
 * 示例测试 - 验证测试框架正常工作
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  createTestPlayer,
  createTestEnemy,
  createTestSkill
} from '../utils/MockFactory.js';

describe('测试框架验证', () => {
  test('Vitest 应该正常运行', () => {
    expect(1 + 1).toBe(2);
  });

  test('Mock 工厂应该创建玩家', () => {
    const player = createTestPlayer();
    expect(player).toBeDefined();
    expect(player.name).toBe('测试玩家');
    expect(player.hp).toBe(1000);
  });

  test('Mock 工厂应该支持覆盖默认值', () => {
    const player = createTestPlayer({ name: '自定义玩家', level: 20 });
    expect(player.name).toBe('自定义玩家');
    expect(player.level).toBe(20);
  });

  test('玩家应该能受到伤害', () => {
    const player = createTestPlayer({ hp: 1000 });
    player.takeDamage(100);
    expect(player.hp).toBe(900);
  });

  test('玩家HP不应该小于0', () => {
    const player = createTestPlayer({ hp: 100 });
    player.takeDamage(200);
    expect(player.hp).toBe(0);
  });
});

describe('敌人测试', () => {
  test('应该创建敌人', () => {
    const enemy = createTestEnemy();
    expect(enemy).toBeDefined();
    expect(enemy.isDead).toBe(false);
  });

  test('敌人HP为0时应该标记为死亡', () => {
    const enemy = createTestEnemy({ hp: 100 });
    enemy.takeDamage(100);
    expect(enemy.hp).toBe(0);
    expect(enemy.isDead).toBe(true);
  });

  test('敌人死亡后血条应该隐藏', () => {
    const enemy = createTestEnemy({ hp: 100 });
    enemy.takeDamage(100);
    enemy.updateHealthBars();
    expect(enemy.healthBar.isVisible).toBe(false);
    expect(enemy.energyBar.isVisible).toBe(false);
  });
});

describe('技能测试', () => {
  test('应该创建技能', () => {
    const skill = createTestSkill();
    expect(skill).toBeDefined();
    expect(skill.multiplier).toBe(1.5);
  });

  test('伤害计算应该正确', () => {
    const player = createTestPlayer({ attack: 100 });
    const skill = createTestSkill({ multiplier: 2.0 });
    const expectedDamage = player.attack * skill.multiplier;
    expect(expectedDamage).toBe(200);
  });
});
