# 角色立绘系统

**版本**: v1.0
**最后更新**: 2026-03-21

---

## 概述

游戏剧情系统支持10个主要角色，每个角色配有AI生成的立绘，在对话场景中显示。

---

## 角色清单

| 编号 | 角色名 | 英文名 | 境界 | 作用 | 文件名 |
|-----|--------|--------|------|------|--------|
| 1 | 旁白 | Narrator | 全程 | 故事叙述者 | character_01_narrator.jpg |
| 2 | 村长 | Village Chief | 武者境 | 开场引导 | character_02_village_chief.jpg |
| 3 | 神秘旅者 | Mysterious Traveler | 武者境 | 引导入门 | character_03_mysterious_traveler.jpg |
| 4 | 师尊 | Master | 武者境 | 伴随角色 | character_04_master.jpg |
| 5 | 师兄 | Senior Brother | 炼气境 | 伴随角色 | character_05_senior_brother.jpg |
| 6 | 弟子 | Disciple | 筑基境 | 伴随角色 | character_06_disciple.jpg |
| 7 | 长老 | Elder | 金丹境 | 伴随角色 | character_07_elder.jpg |
| 8 | 故友 | Old Friend | 元婴境 | 伴随角色 | character_08_old_friend.jpg |
| 9 | 天道之音 | Voice of Heavenly Dao | 化神境 | 伴随角色 | character_09_heavenly_dao.jpg |
| 10 | 系统 | System | 最终 | 系统提示 | character_10_system.jpg |

---

## 文件结构

```
assets/characters/
├── character_01_narrator.jpg         (1.8MB)  - 旁白
├── character_02_village_chief.jpg     (1.8MB)  - 村长
├── character_03_mysterious_traveler.jpg (76KB)  - 神秘旅者
├── character_04_master.jpg            (81KB)  - 师尊
├── character_05_senior_brother.jpg    (1.6MB)  - 师兄
├── character_06_disciple.jpg          (1.5MB)  - 弟子
├── character_07_elder.jpg             (104KB) - 长老
├── character_08_old_friend.jpg        (100KB) - 故友
├── character_09_heavenly_dao.jpg      (138KB) - 天道之音
└── character_10_system.jpg            (1.6MB)  - 系统
```

**总大小**: ~8.7 MB

---

## 角色设计规范

### 统一标准

- **画风**: 仙侠古风 + 唯美写实
- **尺寸比例**: 2:3（竖版）
- **分辨率**: 8K 或 4K
- **格式**: JPG（可转换为PNG去背景）
- **构图**: 半身像或四分之三身像

### 服装配色方案

| 角色 | 主色调 | 辅助色 | 纹饰 |
|-----|--------|--------|------|
| 旁白 | 白色 | 银色、淡金 | 云纹、符文 |
| 村长 | 棕色 | 灰色、白色 | 无（粗布） |
| 神秘旅者 | 深蓝 | 银色、青色 | 银色刺绣 |
| 师尊 | 白色 | 金色 | 金色镶边 |
| 师兄 | 蓝色 | 白色 | 波浪纹 |
| 弟子 | 绿色 | 青色 | 简单纹路 |
| 长老 | 紫色 | 金色 | 星辰纹 |
| 故友 | 黑红 | 金色 | 火焰纹 |
| 天道之音 | 金白 | 星光色 | 光之纹路 |
| 系统 | 蓝白 | 金色 | 几何符文 |

---

## 技术实现

### HTML结构

```html
<!-- 剧情覆盖层 -->
<div id="story-overlay" class="fixed inset-0 bg-black/85 flex items-center justify-center z-[200] hidden">
    <!-- 文本框+立绘组合布局 -->
    <div class="flex items-end gap-6 max-w-5xl w-full mx-6">
        <!-- 角色立绘（左侧） -->
        <div id="story-speaker-image-container" class="flex-shrink-0 w-auto">
            <img id="story-speaker-image" class="max-h-[40vh] max-w-[280px] object-contain rounded-2xl shadow-2xl"
                 style="display: none;">
        </div>

        <!-- 文本框（右侧） -->
        <div class="flex-1 bg-dark-card/95 backdrop-blur-sm border border-gold/30 rounded-xl p-8 shadow-2xl min-w-[400px]">
            <div id="story-speaker" class="text-gold/80 text-sm font-medium mb-3"></div>
            <div id="story-text" class="text-white/90 text-base leading-relaxed"></div>
        </div>
    </div>
</div>
```

### JavaScript代码

```javascript
// 显示剧情页面
showStoryOverlay(scene, pageIndex) {
    const speakerImageEl = document.getElementById('story-speaker-image');
    const page = scene.pages[pageIndex];

    // 显示角色立绘
    if (speakerImageEl && page.speakerImage) {
        speakerImageEl.src = page.speakerImage;
        speakerImageEl.style.display = 'block';
        speakerImageEl.style.animation = 'fadeIn 0.5s ease-out';
    }
}
```

### 剧情配置示例

```javascript
// game-metadata.js
storyScenes: {
    'seek_master_complete': {
        chapter: 0,
        title: '拜师',
        pages: [
            {
                text: '你来到了山顶的门派，云雾缭绕中，一座古朴的大殿矗立眼前。',
                speaker: '旁白',
                speakerImage: 'assets/characters/character_01_narrator.jpg'
            },
            {
                text: '入门弟子先从基础功法修炼起，等到武者初期修炼有成，便可下山历练。',
                speaker: '师尊',
                speakerImage: 'assets/characters/character_04_master.jpg'
            }
        ]
    }
}
```

---

## 视觉效果

### CSS特效

```css
/* 角色立绘特效 */
#story-speaker-image {
    /* 金色发光边框 */
    filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.4))
            drop-shadow(0 0 40px rgba(251, 191, 36, 0.2));

    /* 底部渐变透明 */
    -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
}

/* 淡入动画 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
```

### 布局参数

- **位置**: 文本框左侧
- **最大高度**: 40vh
- **最大宽度**: 280px
- **底部对齐**: 与文本框底部对齐
- **圆角**: rounded-2xl（16px）
- **阴影**: shadow-2xl

---

## AI生成指南

### 推荐工具

**付费方案**:
- **Midjourney** - 质量最高 ⭐⭐⭐⭐⭐
- **DALL-E 3** (ChatGPT Plus) - 最简单 ⭐⭐⭐⭐

**免费方案**:
- **通义万相** - 免费，中文支持
- **文心一格** - 免费额度
- **LiblibAI** - 完全免费

### 提示词示例

**师尊**:
```
仙侠游戏立绘，睿智的修仙门派师尊，外表50岁左右，
身穿白色道袍，金色镶边，长须飘飘，慈祥而威严的表情，
手持一把木质练习剑，站在云海之上的山峰顶端，
金色晨光照耀，仙侠宗师风范，唯美写实风格，
精细的面部刻画，半身像构图，竖版2:3比例，8K高清画质
```

完整提示词见：[CHARACTER_PROMPTS.md](../../CHARACTER_PROMPTS.md)

---

## 使用统计

### 对话分布

| 角色 | 对话条数 | 百分比 |
|-----|---------|--------|
| 旁白 | 114 | 78.6% |
| 师尊 | 12 | 8.3% |
| 天道之音 | 6 | 4.1% |
| 长老 | 5 | 3.4% |
| 故友 | 3 | 2.1% |
| 其他 | 5 | 3.5% |
| **总计** | **145** | **100%** |

### 出场阶段

- **第一卷（武者境）**: 村长、神秘旅者、师尊
- **第二卷（炼气境）**: 师兄
- **第三卷（筑基境）**: 弟子
- **第四卷（金丹境）**: 长老
- **第五卷（元婴境）**: 故友
- **第六卷（化神境）**: 天道之音
- **最终关卡**: 系统

---

## 优化建议

### 未来扩展

1. **多表情系统**
   - 为每个角色生成多个表情版本
   - 根据剧情自动切换表情
   - 示例：`character_04_master_happy.jpg`

2. **立绘位置动态切换**
   - 根据角色立场调整位置（左/右）
   - 支持两个角色同时显示

3. **动画效果**
   - 角色出场动画（滑入/缩放）
   - 表情切换过渡动画
   - 微动作（呼吸、眨眼）

---

## 参考资料

- **CHARACTER_PROMPTS.md** - 完整AI生成提示词
- **game-metadata.js** - 剧情配置（第3740行起）
- **mainQuest.js** - 剧情显示逻辑
- **index.html** - 剧情UI结构

---

## 更新历史

### v1.0 (2026-03-21)
- ✅ 10个角色立绘完整集成
- ✅ 145条对话添加立绘支持
- ✅ 左侧布局，40vh高度
- ✅ 金色发光边框效果
- ✅ 底部渐变透明效果

---

**维护者**: 开发团队
**相关系统**: [主线剧情](./main-story.md) | [地图系统](./map-system.md)