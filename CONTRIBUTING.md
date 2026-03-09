# 贡献指南

感谢您考虑为无尽战斗项目做出贡献！

## 如何贡献

### 报告Bug

如果您发现了bug，请通过以下方式报告：

1. 检查是否已有相同的issue
2. 创建新的issue，包含：
   - 清晰的标题
   - 详细的描述
   - 重现步骤
   - 预期行为
   - 实际行为
   - 截图（如果适用）
   - 环境信息（浏览器、操作系统等）

### 建议新功能

我们欢迎任何改进建议！

1. 创建issue描述您的想法
2. 说明为什么这个功能有用
3. 如果可能，提供实现思路

### 提交代码

#### 开发流程

1. **Fork 项目**
   ```bash
   git clone https://github.com/your-username/endlessWinter.git
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **进行修改**
   - 遵循代码规范
   - 添加必要的注释
   - 测试您的修改

4. **提交更改**
   ```bash
   git add .
   git commit -m "Add some AmazingFeature"
   ```

5. **推送到分支**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **创建 Pull Request**
   - 清晰描述您的更改
   - 关联相关的issue
   - 等待审核

#### 代码规范

- 使用有意义的变量名和函数名
- 添加清晰的注释
- 遵循ES6+语法
- 保持代码简洁易读
- 避免重复代码

#### 提交信息规范

使用清晰的提交信息：

- `feat:` 新功能
- `fix:` Bug修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

示例：
```
feat: 添加新的技能树系统
fix: 修复装备强化计算错误
docs: 更新API文档
```

### 代码审核标准

您的代码将会被审核以下方面：

- 功能是否正常工作
- 代码质量和可读性
- 是否遵循项目规范
- 是否有足够的注释
- 是否有测试（如果适用）
- 是否有安全问题

### 测试

在提交PR前，请确保：

1. 代码能正常运行
2. 没有引入新的bug
3. 不影响现有功能
4. 在多个浏览器中测试（Chrome、Firefox、Edge）

### 文档

如果您的更改影响：

- 用户界面：更新用户文档
- API：更新API文档
- 配置：更新配置说明
- 依赖：更新安装说明

## 开发环境设置

### 前置要求

- Node.js >= 14.0.0
- npm >= 6.0.0
- 现代浏览器
- 代码编辑器（推荐VSCode）

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/your-username/endlessWinter.git
cd endlessWinter

# 安装依赖
npm install

# 启动开发服务器
npm start
```

### 项目结构

```
endlessWinter/
├── index.html          # 主页面
├── game.js            # 游戏核心
├── server.js          # 服务器
├── game-metadata.js   # 游戏元数据
└── ...
```

## 社区准则

- 尊重所有贡献者
- 建设性的批评和讨论
- 专注于对项目最有利的事情
- 友好和包容的环境

## 许可证

通过贡献代码，您同意您的代码将以MIT许可证发布。

## 需要帮助？

如果您有任何问题：

1. 查看现有文档
2. 搜索现有issues
3. 创建新的issue提问

---

再次感谢您的贡献！

**维护者**: 无尽战斗开发团队
