/**
 * Mock 工厂 - 用于创建测试用的模拟对象
 */

/**
 * 创建测试玩家
 */
export function createTestPlayer(overrides = {}) {
  return {
    name: '测试玩家',
    level: 10,
    hp: 1000,
    maxHp: 1000,
    mp: 500,
    maxMp: 500,
    attack: 100,
    defense: 50,
    speed: 100,
    critRate: 0.1,
    critDamage: 1.5,
    shieldValue: 0,
    defenseActive: false,
    defenseEffect: null,
    defenseShield: null,

    // 方法
    takeDamage(value) {
      this.hp = Math.max(0, this.hp - value);
    },
    heal(value) {
      this.hp = Math.min(this.maxHp, this.hp + value);
    },
    dodge() {
      // 闪避逻辑
    },
    removeDefenseEffect() {
      this.defenseEffect = null;
      this.defenseActive = false;
    },
    removeShieldEffect() {
      this.defenseShield = null;
      this.shieldValue = 0;
    },

    // 覆盖默认值
    ...overrides
  };
}

/**
 * 创建测试敌人
 */
export function createTestEnemy(overrides = {}) {
  return {
    name: '测试敌人',
    type: 'monster',
    level: 10,
    hp: 500,
    maxHp: 500,
    attack: 80,
    defense: 30,
    speed: 80,
    isDead: false,
    healthBar: { isVisible: true },
    energyBar: { isVisible: true },

    // 方法
    takeDamage(value) {
      this.hp = Math.max(0, this.hp - value);
      if (this.hp === 0) {
        this.isDead = true;
      }
    },
    updateHealthBars() {
      if (this.isDead) {
        this.healthBar.isVisible = false;
        this.energyBar.isVisible = false;
      }
    },

    // 覆盖默认值
    ...overrides
  };
}

/**
 * 创建测试技能
 */
export function createTestSkill(overrides = {}) {
  return {
    id: 'test_skill',
    name: '测试技能',
    type: 'attack',
    multiplier: 1.5,
    cost: 50,
    cooldown: 0,
    element: 'neutral',

    // 覆盖默认值
    ...overrides
  };
}

/**
 * 创建测试装备
 */
export function createTestEquipment(overrides = {}) {
  return {
    id: 'test_equipment',
    name: '测试装备',
    type: 'weapon',
    quality: 'rare',
    level: 10,
    set: null,
    stats: {
      attack: 50,
      defense: 20
    },

    // 覆盖默认值
    ...overrides
  };
}

/**
 * 创建测试副本
 */
export function createTestDungeon(overrides = {}) {
  return {
    id: 'test_dungeon',
    name: '测试副本',
    difficulty: 'easy',
    enemies: [
      createTestEnemy({ name: '敌人1' }),
      createTestEnemy({ name: '敌人2' })
    ],
    rewards: {
      exp: 1000,
      gold: 500
    },

    // 覆盖默认值
    ...overrides
  };
}

/**
 * 创建模拟的场景对象（Babylon.js Scene）
 */
export function createMockScene() {
  return {
    meshes: [],
    particles: [],
    getMeshByName: (name) => null,
    createMesh: () => ({ dispose: () => {} }),
    dispose: () => {}
  };
}

/**
 * 创建模拟的相机对象
 */
export function createMockCamera() {
  return {
    position: { x: 0, y: 0, z: 0 },
    zoomTo: () => {},
    reset: () => {},
    shake: () => {}
  };
}

/**
 * 等待指定毫秒数（用于测试异步操作）
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 断言辅助函数 - 检查数值是否在范围内
 */
export function assertInRange(value, min, max, message = '') {
  if (value < min || value > max) {
    throw new Error(
      `${message} 期望值在 ${min} 到 ${max} 之间，但得到 ${value}`
    );
  }
}

/**
 * 断言辅助函数 - 检查对象是否有指定属性
 */
export function assertHasProperties(obj, properties) {
  for (const prop of properties) {
    if (!(prop in obj)) {
      throw new Error(`对象缺少属性: ${prop}`);
    }
  }
}
