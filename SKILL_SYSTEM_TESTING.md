# 技能系统测试指南

## 重构完成内容

### 1. 数据结构重构
- ✅ **game-metadata.js**: 定义了全部6个境界45个技能（使用境界索引0-5组织）
- ✅ **game.js**: player.skills只存储ID，不再存储完整技能对象
- ✅ **combatlogic.js**: useSkill()从gameMetadata获取技能详情
- ✅ **battle3d.js**: UI显示当前境界装备的技能

### 2. 数据流设计
```
game-metadata.js (技能定义)
    ↓ getSkillById(skillId)
combatlogic.js (技能执行)
    ↑
game.js (player.skills存储ID)
```

---

## 测试步骤

### 测试1: 检查metadata技能定义

打开浏览器控制台（F12），输入以下命令：

```javascript
// 1. 检查gameMetadata是否正确加载
console.log('gameMetadata存在:', !!game.gameMetadata);

// 2. 检查技能定义是否存在
console.log('技能定义存在:', !!game.gameMetadata.skills);

// 3. 检查武者境技能（应该是5个）
console.log('武者境技能:', game.gameMetadata.skills[0]);
console.log('武者境技能数量:', game.gameMetadata.skills[0].length);

// 4. 测试getSkillById方法
const skill = game.gameMetadata.getSkillById('heavyStrike');
console.log('重击技能详情:', skill);

// 5. 测试getSkillImageUrl方法
const imageUrl = game.gameMetadata.getSkillImageUrl('heavyStrike');
console.log('重击技能图片URL:', imageUrl);
```

**预期结果：**
- 武者境技能数量：5
- 重击技能详情应包含：id, name, description, energyCost, damageMultiplier, realmRequired, stageRequired, imageId
- 图片URL应为："Images/skill-1.png"

---

### 测试2: 检查玩家技能数据结构

```javascript
// 1. 检查玩家技能结构
console.log('玩家技能:', game.gameState.player.skills);

// 2. 检查learned结构
console.log('已学习技能:', game.gameState.player.skills.learned);

// 3. 检查equipped结构
console.log('已装备技能:', game.gameState.player.skills.equipped);

// 4. 检查武者境（realm 0）装备的技能
console.log('武者境装备技能ID:', game.gameState.player.skills.equipped[0]);
```

**预期结果：**
- learned应该是一个对象，每个境界都是数组
- equipped应该是一个对象，包含每个境界的技能ID
- 武者境装备技能ID应为："heavyStrike"（如果默认装备了第一个技能）

---

### 测试3: 测试技能使用

```javascript
// 1. 进入战斗（如果还没在战斗中）
game.startBattle();

// 2. 检查useSkill函数是否存在
console.log('useSkill函数存在:', typeof game.useSkill === 'function');

// 3. 检查当前境界
console.log('当前境界:', game.gameState.player.realm.currentRealm);
console.log('当前阶段:', game.gameState.player.realm.currentStage);

// 4. 检查当前装备的技能
const currentRealm = game.gameState.player.realm.currentRealm;
const equippedSkillId = game.gameState.player.skills.equipped[currentRealm];
console.log('当前装备技能ID:', equippedSkillId);

// 5. 获取技能详情
const skillDetails = game.gameMetadata.getSkillById(equippedSkillId);
console.log('当前装备技能详情:', skillDetails);

// 6. 检查能量是否足够
console.log('当前能量:', game.gameState.player.energy);
console.log('技能消耗:', skillDetails ? skillDetails.energyCost : 'N/A');

// 7. 尝试使用技能
game.useSkill();
```

**预期结果：**
- useSkill函数应该存在
- 应该能够获取到当前装备的技能ID
- 应该能够从metadata获取技能详情
- 如果能量足够，技能应该成功使用并显示战斗日志

---

### 测试4: 测试技能效果

#### 4.1 测试伤害技能（重击）

```javascript
// 确保在战斗中
if (!game.gameState.battle.inBattle) {
    game.startBattle();
}

// 记录敌人当前HP
const enemyHpBefore = game.gameState.enemy.hp;
console.log('敌人HP（使用技能前）:', enemyHpBefore);

// 使用技能
game.useSkill();

// 检查敌人HP变化（等待技能执行完成）
setTimeout(() => {
    const enemyHpAfter = game.gameState.enemy.hp;
    console.log('敌人HP（使用技能后）:', enemyHpAfter);
    console.log('造成伤害:', enemyHpBefore - enemyHpAfter);
}, 1000);
```

#### 4.2 测试治疗技能

```javascript
// 先学习并装备耐力恢复技能
game.gameState.player.skills.learned[0].push('enduranceRecovery');
game.gameState.player.skills.equipped[0] = 'enduranceRecovery';

// 记录玩家当前HP
const playerHpBefore = game.gameState.player.hp;
console.log('玩家HP（使用技能前）:', playerHpBefore);

// 使用技能
game.useSkill();

// 检查HP变化
setTimeout(() => {
    const playerHpAfter = game.gameState.player.hp;
    console.log('玩家HP（使用技能后）:', playerHpAfter);
    console.log('恢复HP:', playerHpAfter - playerHpBefore);
}, 1000);
```

---

### 测试5: 测试所有境界技能定义

```javascript
// 测试所有境界
const realmNames = ['武者', '炼气', '筑基', '金丹', '元婴', '化神'];
const skillCounts = [5, 8, 8, 8, 8, 8];

realmNames.forEach((realmName, index) => {
    const skills = game.gameMetadata.skills[index];
    console.log(`${realmName}境技能数量:`, skills ? skills.length : 0);
    console.log(`${realmName}境技能列表:`, skills ? skills.map(s => s.name) : []);

    // 验证技能数量
    if (skills && skills.length === skillCounts[index]) {
        console.log(`✅ ${realmName}境技能数量正确`);
    } else {
        console.error(`❌ ${realmName}境技能数量错误，预期${skillCounts[index]}个`);
    }
});
```

---

### 测试6: 测试技能阶段要求

```javascript
// 检查每个技能的阶段要求
const warriorSkills = game.gameMetadata.skills[0];
warriorSkills.forEach(skill => {
    console.log(`${skill.name} - 阶段要求: ${skill.stageRequired}, 境界要求: ${skill.realmRequired}`);
});

// 预期结果：
// 重击 - 阶段要求: 1, 境界要求: 0
// 耐力恢复 - 阶段要求: 4, 境界要求: 0
// 铁布衫 - 阶段要求: 7, 境界要求: 0
// 武者之怒 - 阶段要求: 10, 境界要求: 0
// 闪避 - 阶段要求: 10, 境界要求: 0
```

---

## 常见问题排查

### 问题1: "找不到技能"错误

**原因：** player.skills.equipped中没有对应境界的技能ID

**解决方法：**
```javascript
// 手动装备一个技能
game.gameState.player.skills.equipped[0] = 'heavyStrike';
```

### 问题2: "当前境界没有装备技能"错误

**原因：** player.skills.equipped[currentRealm]为undefined

**解决方法：**
```javascript
// 检查当前境界
const currentRealm = game.gameState.player.realm.currentRealm;
console.log('当前境界:', currentRealm);

// 手动装备技能
game.gameState.player.skills.equipped[currentRealm] = 'heavyStrike';
```

### 问题3: 技能按钮不显示

**原因：** battle3d.js中的UI更新逻辑可能有问题

**解决方法：**
```javascript
// 手动触发UI更新
game.updateUI();

// 或重新初始化战斗场景
if (game.gameState.battle.inBattle) {
    game.endBattle();
    setTimeout(() => game.startBattle(), 500);
}
```

### 问题4: gameMetadata未定义

**原因：** metadata还没有加载完成

**解决方法：**
```javascript
// 检查metadata是否加载
if (!game.gameMetadata) {
    console.log('等待metadata加载...');
    setTimeout(() => {
        console.log('gameMetadata:', game.gameMetadata);
    }, 2000);
}
```

---

## 测试清单

- [ ] 测试1: metadata技能定义正确
- [ ] 测试2: 玩家技能数据结构正确
- [ ] 测试3: 技能使用功能正常
- [ ] 测试4: 技能效果正常（伤害/治疗/防御/闪避）
- [ ] 测试5: 所有境界技能定义完整
- [ ] 测试6: 技能阶段要求正确
- [ ] 测试7: 战斗UI显示正确
- [ ] 测试8: 能量消耗和恢复正常

---

## 下一步计划

完成测试后：

1. ✅ **修复发现的问题**
2. ⬜ **实现技能学习与装备系统**（独立功能）
3. ⬜ **设计技能图片资源**（25张图片）
4. ⬜ **优化技能平衡性**

---

## 更新日志

- **2026-03-05**: 完成技能系统重构，创建测试指南
