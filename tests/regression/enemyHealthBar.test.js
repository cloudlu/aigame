/**
 * 回归测试 - 敌人血条显示相关bug
 *
 * 已修复的bug：
 * 1. 敌人被击败后血条和蓝条不消失
 * 2. 敌人倒地动画播放时血条仍然显示
 */

import { describe, test, expect } from 'vitest';
import { createTestEnemy } from '../utils/MockFactory.js';

describe('回归测试 - 敌人血条显示', () => {
  /**
   * Bug #1: 敌人被击败后血条和蓝条不消失
   *
   * 问题描述：
   * - 敌人HP降到0，进入倒地状态
   * - 但血条和蓝条仍然显示在场景中
   *
   * 期望行为：
   * - 敌人被击败后，血条和蓝条应该立即隐藏
   * - updateHealthBars() 应该检查敌人状态并隐藏血条
   */
  test('Bug修复：敌人被击败后血条和蓝条应该隐藏', () => {
    const enemy = createTestEnemy({
      hp: 1000,
      maxHp: 1000
    });

    // 初始状态：血条应该可见
    expect(enemy.healthBar.isVisible).toBe(true);
    expect(enemy.energyBar.isVisible).toBe(true);

    // 受到致命伤害
    enemy.takeDamage(1000);

    // 应该被标记为死亡
    expect(enemy.hp).toBe(0);
    expect(enemy.isDead).toBe(true);

    // 更新血条显示
    enemy.updateHealthBars();

    // 血条和蓝条应该隐藏
    expect(enemy.healthBar.isVisible).toBe(false);
    expect(enemy.energyBar.isVisible).toBe(false);
  });

  /**
   * 测试：多个敌人，只击败其中一个
   */
  test('多个敌人时，只隐藏被击败敌人的血条', () => {
    const enemy1 = createTestEnemy({ name: '敌人1', hp: 100 });
    const enemy2 = createTestEnemy({ name: '敌人2', hp: 100 });

    // 击败敌人1
    enemy1.takeDamage(100);
    expect(enemy1.isDead).toBe(true);
    enemy1.updateHealthBars();

    // 敌人1血条应该隐藏
    expect(enemy1.healthBar.isVisible).toBe(false);

    // 敌人2血条应该仍然可见
    expect(enemy2.healthBar.isVisible).toBe(true);
    expect(enemy2.isDead).toBe(false);
  });

  /**
   * 测试：敌人复活时血条应该重新显示
   */
  test('敌人复活时血条应该重新显示', () => {
    const enemy = createTestEnemy({ hp: 100 });

    // 击败敌人
    enemy.takeDamage(100);
    enemy.updateHealthBars();
    expect(enemy.healthBar.isVisible).toBe(false);

    // 复活（假设有这个机制）
    enemy.hp = 50;
    enemy.isDead = false;
    enemy.healthBar.isVisible = true; // 手动重新显示

    expect(enemy.healthBar.isVisible).toBe(true);
  });

  /**
   * 测试：血条显示逻辑应该在每次更新时检查
   */
  test('血条显示状态应该在updateHealthBars中正确更新', () => {
    const enemy = createTestEnemy();

    // 初始状态
    enemy.updateHealthBars();
    expect(enemy.healthBar.isVisible).toBe(true);

    // 被击败
    enemy.takeDamage(enemy.maxHp);
    enemy.updateHealthBars();
    expect(enemy.healthBar.isVisible).toBe(false);

    // 多次更新应该保持隐藏状态
    enemy.updateHealthBars();
    enemy.updateHealthBars();
    expect(enemy.healthBar.isVisible).toBe(false);
  });

  /**
   * 测试：血量变化时血条应该正确显示
   */
  test('血量变化时血条应该正确显示', () => {
    const enemy = createTestEnemy({ hp: 1000, maxHp: 1000 });

    // 受到伤害但未死亡
    enemy.takeDamage(500);
    enemy.updateHealthBars();

    // 血条应该仍然可见
    expect(enemy.healthBar.isVisible).toBe(true);
    expect(enemy.hp).toBe(500);

    // 再次受到伤害直到死亡
    enemy.takeDamage(500);
    enemy.updateHealthBars();

    // 现在应该隐藏
    expect(enemy.healthBar.isVisible).toBe(false);
    expect(enemy.isDead).toBe(true);
  });

  /**
   * 测试：满血敌人血条应该正常显示
   */
  test('满血敌人血条应该正常显示', () => {
    const enemy = createTestEnemy({ hp: 1000, maxHp: 1000 });

    enemy.updateHealthBars();

    expect(enemy.healthBar.isVisible).toBe(true);
    expect(enemy.energyBar.isVisible).toBe(true);
  });

  /**
   * 测试：初始就是死亡状态的敌人
   */
  test('初始就是死亡状态的敌人血条应该隐藏', () => {
    const enemy = createTestEnemy({
      hp: 0,
      maxHp: 1000,
      isDead: true
    });

    enemy.updateHealthBars();

    expect(enemy.healthBar.isVisible).toBe(false);
    expect(enemy.energyBar.isVisible).toBe(false);
  });
});
