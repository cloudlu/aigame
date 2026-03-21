// 怪物与地图难度分析脚本
import fs from 'fs';

// 读取 game-metadata.js
const content = fs.readFileSync('game-metadata.js', 'utf8');

// 提取 enemyTypes
const enemyTypesMatch = content.match(/enemyTypes:\s*\[([\s\S]*?)\n\s*\],/);
if (!enemyTypesMatch) {
    console.error('无法提取 enemyTypes');
    process.exit(1);
}

// 解析每个怪物
const enemyTypes = [];
const enemyRegex = /{\s*name:\s*"([^"]+)",\s*baseHp:\s*(\d+),\s*baseAttack:\s*(\d+),\s*baseDefense:\s*(\d+),[\s\S]*?expMultiplier:\s*([\d.]+),/g;
let match;
while ((match = enemyRegex.exec(enemyTypesMatch[1])) !== null) {
    enemyTypes.push({
        name: match[1],
        baseHp: parseInt(match[2]),
        baseAttack: parseInt(match[3]),
        baseDefense: parseInt(match[4]),
        expMultiplier: parseFloat(match[5])
    });
}

// 提取 mapEnemyMapping
const mapEnemyMatch = content.match(/mapEnemyMapping:\s*\{([\s\S]*?)\n\s*\},/);
if (!mapEnemyMatch) {
    console.error('无法提取 mapEnemyMapping');
    process.exit(1);
}

// 解析地图敌人映射
const mapEnemyMapping = {};
const mapRegex = /"([^"]+)":\s*\[([^\]]+)\]/g;
while ((match = mapRegex.exec(mapEnemyMatch[1])) !== null) {
    const mapName = match[1];
    const enemies = match[2].match(/"([^"]+)"/g).map(s => s.replace(/"/g, ''));
    mapEnemyMapping[mapName] = enemies;
}

// 提取地图境界需求
const mapRealmMatch = content.match(/mapRealmRequirements:\s*\{([\s\S]*?)\n\s*\},/);
const mapRealmRequirements = {};
const realmRegex = /"([^"]+)":\s*\{\s*realm:\s*(\d+)/g;
while ((match = realmRegex.exec(mapRealmMatch[1])) !== null) {
    mapRealmRequirements[match[1]] = parseInt(match[2]);
}

// 境界名称
const realmNames = ['武者', '炼气', '筑基', '金丹', '元婴', '化神'];

// 计算怪物最终属性（基于公式）
function calculateEnemyStats(baseHp, baseAtk, baseDef, level, bonus = 0) {
    const finalHp = Math.floor((baseHp + (level - 1) * baseHp * 0.5) * (1 + bonus));
    const finalAtk = Math.floor((baseAtk + (level - 1) * baseAtk * 0.3) * (1 + bonus));
    const finalDef = Math.floor((baseDef + (level - 1) * baseDef * 0.3) * (1 + bonus));
    return { hp: finalHp, atk: finalAtk, def: finalDef };
}

// 估算玩家在不同境界的属性
function estimatePlayerStats(realm, stage, level) {
    // 基于game.js的玩家属性成长公式估算
    const totalLevel = realm * 30 + stage * 10 + level;
    const baseHp = 100 + totalLevel * 10;
    const baseAtk = 10 + totalLevel * 2;
    const baseDef = 5 + totalLevel * 1;
    return { hp: baseHp, atk: baseAtk, def: baseDef };
}

// 分析每个地图
console.log('\n=== 🗺️ 地图难度分析 ===\n');

const analysis = {};
Object.entries(mapEnemyMapping).forEach(([mapName, enemies]) => {
    const realm = mapRealmRequirements[mapName] || 0;
    const realmName = realmNames[realm] || `境界${realm}`;

    // 玩家在该地图的预估等级范围
    const playerMinLevel = realm * 30 + 1;
    const playerMaxLevel = realm * 30 + 30;
    const avgPlayerLevel = Math.floor((playerMinLevel + playerMaxLevel) / 2);

    // 估算玩家属性
    const playerStats = estimatePlayerStats(realm, 1, 15);

    // 分析该地图的怪物
    const mapEnemies = enemies.map(enemyName => {
        const enemyData = enemyTypes.find(e => e.name === enemyName);
        if (!enemyData) {
            return { name: enemyName, found: false };
        }

        // 计算普通怪、精英、Boss的属性
        const normalStats = calculateEnemyStats(enemyData.baseHp, enemyData.baseAttack, enemyData.baseDefense, avgPlayerLevel, 0);
        const eliteStats = calculateEnemyStats(enemyData.baseHp, enemyData.baseAttack, enemyData.baseDefense, avgPlayerLevel, 0.5);
        const bossStats = calculateEnemyStats(enemyData.baseHp, enemyData.baseAttack, enemyData.baseDefense, avgPlayerLevel, 1.0);

        // 计算难度评分
        const normalDifficulty = (normalStats.hp / playerStats.hp * 0.4 + normalStats.atk / playerStats.def * 0.6).toFixed(2);
        const eliteDifficulty = (eliteStats.hp / playerStats.hp * 0.4 + eliteStats.atk / playerStats.def * 0.6).toFixed(2);
        const bossDifficulty = (bossStats.hp / playerStats.hp * 0.4 + bossStats.atk / playerStats.def * 0.6).toFixed(2);

        return {
            name: enemyName,
            baseHp: enemyData.baseHp,
            baseAtk: enemyData.baseAttack,
            baseDef: enemyData.baseDefense,
            normal: { ...normalStats, difficulty: normalDifficulty },
            elite: { ...eliteStats, difficulty: eliteDifficulty },
            boss: { ...bossStats, difficulty: bossDifficulty },
            found: true
        };
    });

    // 计算平均难度
    const validEnemies = mapEnemies.filter(e => e.found);
    const avgNormalDifficulty = validEnemies.length > 0
        ? (validEnemies.reduce((sum, e) => sum + parseFloat(e.normal.difficulty), 0) / validEnemies.length).toFixed(2)
        : 0;

    analysis[mapName] = {
        realm,
        realmName,
        playerStats,
        avgPlayerLevel,
        enemies: mapEnemies,
        avgDifficulty: avgNormalDifficulty,
        notFound: mapEnemies.filter(e => !e.found).map(e => e.name)
    };
});

// 输出分析结果
Object.entries(analysis).forEach(([mapName, data]) => {
    console.log(`\n📍 ${mapName} (${data.realmName}境 - Realm ${data.realm})`);
    console.log(`   玩家预估: Lv.${data.avgPlayerLevel} | HP:${data.playerStats.hp} ATK:${data.playerStats.atk} DEF:${data.playerStats.def}`);
    console.log(`   平均难度: ${data.avgDifficulty}`);

    const validEnemies = data.enemies.filter(e => e.found);

    // 按基础HP排序
    validEnemies.sort((a, b) => a.baseHp - b.baseHp);

    console.log('\n   怪物列表 (按强度排序):');
    validEnemies.forEach((enemy, i) => {
        const diffRating = parseFloat(enemy.normal.difficulty);
        let rating = '';
        if (diffRating < 0.5) rating = '🟢 简单';
        else if (diffRating < 1.0) rating = '🟡 中等';
        else if (diffRating < 1.5) rating = '🟠 困难';
        else if (diffRating < 2.5) rating = '🔴 很难';
        else rating = '💀 极难';

        console.log(`   ${(i+1).toString().padStart(2)}. ${enemy.name.padEnd(12)} | 基础HP:${enemy.baseHp.toString().padStart(4)} | 普通:${enemy.normal.hp.toString().padStart(4)}HP | 难度:${enemy.normal.difficulty} ${rating}`);
    });

    if (data.notFound.length > 0) {
        console.log(`\n   ⚠️  未找到数据的怪物: ${data.notFound.join(', ')}`);
    }
});

// 统计问题
console.log('\n\n=== ⚠️ 平衡性问题汇总 ===\n');

let problemCount = 0;
Object.entries(analysis).forEach(([mapName, data]) => {
    const validEnemies = data.enemies.filter(e => e.found);
    const tooStrong = validEnemies.filter(e => parseFloat(e.normal.difficulty) > 2.0);
    const tooWeak = validEnemies.filter(e => parseFloat(e.normal.difficulty) < 0.3);

    if (tooStrong.length > 0) {
        problemCount++;
        console.log(`❌ ${mapName} (${data.realmName}境) - 过强的怪物:`);
        tooStrong.forEach(e => {
            console.log(`   • ${e.name}: 难度=${e.normal.difficulty} (基础HP:${e.baseHp} → 最终HP:${e.normal.hp})`);
        });
        console.log(`   💡 建议: 移至更高境界地图或降低基础属性\n`);
    }

    if (tooWeak.length > 0) {
        problemCount++;
        console.log(`⚠️  ${mapName} (${data.realmName}境) - 过弱的怪物:`);
        tooWeak.forEach(e => {
            console.log(`   • ${e.name}: 难度=${e.normal.difficulty} (基础HP:${e.baseHp})`);
        });
        console.log(`   💡 建议: 移至更低境界地图或提高基础属性\n`);
    }
});

if (problemCount === 0) {
    console.log('✅ 所有地图的怪物难度都在合理范围内！');
}

console.log('\n=== 📊 难度评级标准 ===');
console.log('0.0-0.5: 🟢 简单 (适合新手)');
console.log('0.5-1.0: 🟡 中等 (标准难度)');
console.log('1.0-1.5: 🟠 困难 (需要策略)');
console.log('1.5-2.5: 🔴 很难 (高级玩家)');
console.log('2.5+:    💀 极难 (不推荐出现在该境界)');
