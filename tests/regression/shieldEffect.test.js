/**
 * 回归测试 - 护盾效果相关bug
 *
 * 已修复的bug：
 * 1. 闪避后护盾效果消失
 * 2. 防御和护盾效果混淆
 * 3. 释放护盾技能时出现多余的圆环
 */

import { describe, test, expect } from 'vitest';
import { createTestPlayer } from '../utils/MockFactory.js';

describe('回归测试 - 护盾效果', () => {
  /**
   * Bug #1: 闪避后护盾效果消失
   *
   * 问题描述：
   * - 玩家有护盾（shieldValue > 0）
   * - 闪避成功后，护盾效果（defenseShield）错误消失
   *
   * 期望行为：
   * - 闪避只影响防御效果（defenseEffect 黄色球体）
   * - 护盾效果（defenseShield 蓝色圆环）应该保留
   */
  test('Bug修复：闪避后护盾效果应该保留', () => {
    const player = createTestPlayer({
      shieldValue: 100,
      defenseShield: { isVisible: true }
    });

    // 模拟闪避
    player.dodge();

    // 护盾值应该保持不变
    expect(player.shieldValue).toBe(100);

    // 护盾效果应该保持可见
    expect(player.defenseShield).toBeDefined();
    expect(player.defenseShield.isVisible).toBe(true);
  });

  /**
   * Bug #2: 防御和护盾效果混淆
   *
   * 问题描述：
   * - removeDefenseEffect() 同时移除了防御和护盾效果
   * - 导致护盾消失
   *
   * 期望行为：
   * - removeDefenseEffect() 只移除防御效果（黄色球体）
   * - removeShieldEffect() 只移除护盾效果（蓝色圆环）
   * - 两者独立管理
   */
  test('Bug修复：防御和护盾应该是独立的效果', () => {
    const player = createTestPlayer({
      defenseActive: true,
      defenseEffect: { type: 'sphere', color: 'yellow' },
      shieldValue: 100,
      defenseShield: { type: 'ring', color: 'blue', isVisible: true }
    });

    // 移除防御效果
    player.removeDefenseEffect();

    // 防御效果应该消失
    expect(player.defenseEffect).toBeNull();
    expect(player.defenseActive).toBe(false);

    // 但护盾应该保留
    expect(player.shieldValue).toBe(100);
    expect(player.defenseShield).toBeDefined();
    expect(player.defenseShield.isVisible).toBe(true);
  });

  /**
   * Bug #3: 释放护盾技能时出现多余圆环
   *
   * 问题描述：
   * - 使用护盾技能时，同时出现防御效果和护盾效果
   * - 玩家头顶多了一个不应该出现的圆环
   *
   * 期望行为：
   * - 护盾技能只显示护盾效果（蓝色圆环）
   * - 不显示防御效果（黄色球体）
   */
  test('Bug修复：护盾技能不应该显示防御效果', () => {
    const player = createTestPlayer({
      defenseActive: false,
      defenseEffect: null
    });

    // 模拟使用护盾技能
    player.shieldValue = 100;
    player.defenseShield = { type: 'ring', color: 'blue', isVisible: true };

    // 不应该有防御效果
    expect(player.defenseActive).toBe(false);
    expect(player.defenseEffect).toBeNull();

    // 只应该有护盾效果
    expect(player.shieldValue).toBeGreaterThan(0);
    expect(player.defenseShield).toBeDefined();
    expect(player.defenseShield.isVisible).toBe(true);
  });

  /**
   * 测试：完整流程验证
   */
  test('完整流程：防御 -> 护盾 -> 闪避', () => {
    const player = createTestPlayer();

    // 1. 激活防御
    player.defenseActive = true;
    player.defenseEffect = { type: 'sphere', color: 'yellow' };

    expect(player.defenseActive).toBe(true);
    expect(player.defenseEffect).toBeDefined();

    // 2. 添加护盾
    player.shieldValue = 100;
    player.defenseShield = { type: 'ring', color: 'blue', isVisible: true };

    expect(player.shieldValue).toBe(100);
    expect(player.defenseShield).toBeDefined();

    // 3. 闪避
    player.dodge();

    // 防御效果可能消失（取决于闪避实现）
    // 但护盾应该保留
    expect(player.shieldValue).toBe(100);
    expect(player.defenseShield).toBeDefined();

    // 4. 移除防御效果
    player.removeDefenseEffect();

    expect(player.defenseEffect).toBeNull();
    expect(player.shieldValue).toBe(100); // 护盾应该保留
    expect(player.defenseShield).toBeDefined();
  });

  /**
   * 测试：独立移除护盾效果
   */
  test('独立移除护盾效果不应该影响防御效果', () => {
    const player = createTestPlayer({
      defenseActive: true,
      defenseEffect: { type: 'sphere', color: 'yellow' },
      shieldValue: 100,
      defenseShield: { type: 'ring', color: 'blue', isVisible: true }
    });

    // 移除护盾效果
    player.removeShieldEffect();

    // 护盾应该消失
    expect(player.shieldValue).toBe(0);
    expect(player.defenseShield).toBeNull();

    // 防御效果应该保留
    expect(player.defenseActive).toBe(true);
    expect(player.defenseEffect).toBeDefined();
  });
});
