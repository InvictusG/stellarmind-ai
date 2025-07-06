# StellarMind AI - 基于第一性原理的AI知识图谱平台

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fstellarmind-ai&env=JWT_SECRET,NODE_ENV,NEXT_PUBLIC_APP_URL&envDescription=Required%20environment%20variables&envLink=https%3A%2F%2Fgithub.com%2Fyour-username%2Fstellarmind-ai%2Fblob%2Fmain%2FVERCEL_DEPLOYMENT.md&project-name=stellarmind-ai&repository-name=stellarmind-ai)

**🚀 一键部署到 Vercel，3分钟上线你的 AI 知识图谱平台！**

[🌐 在线演示](https://stellarmindai.com) | [📖 部署指南](./VERCEL_DEPLOYMENT.md) | [🐛 问题反馈](https://github.com/your-username/stellarmind-ai/issues)

</div>

---

## 🚀 快速部署

### 方法一：一键部署 ⚡️

1. 点击上方 **"Deploy with Vercel"** 按钮
2. 用 GitHub 账户登录 Vercel
3. 配置环境变量（自动提示）
4. 点击 Deploy 开始部署
5. 添加你的域名 `stellarmindai.com`

### 方法二：手动部署 🛠️

```bash
# 1. 克隆项目
git clone https://github.com/your-username/stellarmind-ai.git
cd stellarmind-ai

# 2. 运行一键部署脚本
chmod +x deploy-to-vercel.sh
./deploy-to-vercel.sh

# 3. 按照脚本提示完成部署
```

### 方法三：本地开发 💻

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问 http://localhost:3000
```

---

## 🎯 项目愿景

StellarMind AI 是一个革命性的AI知识探索平台，通过第一性原理的方法论，帮助用户深度理解复杂概念和现象。不同于传统的问答系统，StellarMind AI 专注于"为什么"而不是"是什么"，引导用户进行深层思考。

## 📋 项目概述

这是一个基于Next.js 14构建的现代化Web应用，用户输入一个问题后，AI会自动递归生成多分支"问题-答案"链，以可交互思维导图和对话气泡流两种方式呈现。产品致力于提供最佳的AI知识探索体验。

## ✨ 核心功能

### 🧠 第一性原理分析
- **AI深度思考**: 基于第一性原理的问题分解
- **层层递进**: 从基础概念到复杂理论的自然演进
- **智能追问**: AI自动生成深入探索的关键问题

### 🎯 智能输入体验
- **Perplexity风格界面**: 现代化双层输入设计
- **多媒体支持**: 文档📄、图片🖼️、语音🎤录制
- **6级阅读适配**: 从幼儿园🧸到博士👨‍🎓的内容深度

### 🔬 数学公式渲染
- **LaTeX完美支持**: 像Overleaf一样渲染数学公式
- **量子力学符号**: 支持|ψ⟩、⟨φ|、⟨ψ|φ⟩等专业符号
- **智能降级**: 渲染失败时优雅显示

### 🗺️ 知识图谱可视化
- **动态连线**: 实时显示节点关系，蓝色发光效果
- **无限画布**: 支持大规模知识网络展示
- **重置功能**: 一键回到原始问题重新探索

### 👥 多用户系统
- **JWT认证**: 企业级安全登录体系
- **数据隔离**: 每个用户的知识图谱完全独立
- **演示账号**: demo@stellarmind.ai / demo123

### 🎨 **现代化UI**: 深浅色主题，流畅动画，响应式设计
- 📱 **移动端适配**: 完整的移动端交互体验
- ⚡ **实时流式**: 支持流式AI响应，实时更新
- 🔧 **高度定制**: 可调节深度、广度、模型参数

### 💾 **会话持久化**: 本地存储 + 云端同步
- 🔍 **智能搜索**: 全文搜索会话内容和标签
- 🏷️ **标签系统**: 灵活的标签分类和过滤
- 📊 **统计分析**: 会话数据统计和使用分析

### 🤝 **链接分享**: 生成分享链接，权限控制
- 📱 **二维码**: 移动端便捷分享
- 🌐 **社交媒体**: 一键分享到Twitter、Facebook等
- ⭐ **收藏管理**: 收藏重要会话，批量操作

### 🖼️ **PNG导出**: 高质量图片，多种清晰度
- 📄 **PDF文档**: 包含完整内容的专业文档
- 📊 **数据导出**: JSON/CSV格式，便于分析
- 🎨 **SVG矢量**: 可编辑的矢量图形
- 📦 **批量导出**: 支持多个会话同时导出

## 🏗️ 技术架构

### 前端技术栈
- **Next.js 14**: App Router + TypeScript
- **Tailwind CSS**: 现代化样式设计
- **KaTeX**: 专业数学公式渲染
- **Framer Motion**: 流畅动画效果

### 后端架构
- **Serverless API**: Vercel Functions
- **JWT认证**: 无状态安全验证
- **多模型支持**: OpenAI、Claude、DeepSeek等

### 部署平台
- **Vercel**: 零配置部署，全球CDN
- **自动HTTPS**: SSL证书自动配置
- **域名绑定**: 支持自定义域名

## 📚 使用指南

### 1. 配置 AI 模型
```
设置 → API配置 → 选择提供商 → 输入API密钥
支持：OpenAI、Claude、Google Gemini、DeepSeek等
```

### 2. 开始探索
```
输入问题 → 选择阅读层级 → 点击🚀发送
系统自动生成第一性原理分析 + 深入问题
```

### 3. 深度学习
```
点击问题卡片 → 查看AI分析
点击❓按钮 → 继续深入探索
使用🔄重置按钮 → 重新开始
```

## 🔧 环境变量配置

在 Vercel 项目设置中配置：

```env
# JWT 安全密钥（必须）
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random

# 运行环境
NODE_ENV=production

# 应用URL
NEXT_PUBLIC_APP_URL=https://stellarmindai.com
```

## 🌟 亮点特性

### 💡 创新体验
- **第一性原理引擎**: 独特的AI思维分析方法
- **递进式探索**: 避免传统chatbot的浅层问答
- **可视化思维**: 知识图谱直观展示思考过程

### 🚀 性能优化
- **服务端渲染**: SEO友好，首屏加载快
- **组件懒加载**: 按需加载，节省资源
- **数学公式缓存**: 避免重复渲染计算

### 🔒 安全可靠
- **企业级认证**: JWT + 密码哈希
- **API密钥加密**: 客户端安全存储
- **HTTPS强制**: 全站SSL加密

## 📈 路线图

### 🎯 即将推出
- [ ] **GPT-4V 图像分析**: 上传图片进行AI分析
- [ ] **语音输入优化**: 实时语音转文字
- [ ] **知识库集成**: 连接外部文档库
- [ ] **协作功能**: 多人共享知识图谱

### 🔮 未来规划
- [ ] **移动端APP**: React Native应用
- [ ] **API开放平台**: 第三方集成支持
- [ ] **企业级部署**: 私有化部署方案
- [ ] **AI Agent**: 自主学习智能体

## 🤝 贡献指南

我们欢迎社区贡献！

### 开发环境搭建
```bash
# Fork 项目到你的 GitHub
git clone https://github.com/your-username/stellarmind-ai.git
cd stellarmind-ai

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 提交规范
- `feat: 新功能`
- `fix: 修复问题` 
- `docs: 文档更新`
- `style: 代码格式`
- `refactor: 重构代码`
- `test: 测试相关`

## 📄 开源协议

本项目采用 [MIT License](./LICENSE) 开源协议。

## 🙏 致谢

特别感谢以下开源项目：
- [Next.js](https://nextjs.org/) - React应用框架
- [KaTeX](https://katex.org/) - 数学公式渲染
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Vercel](https://vercel.com/) - 部署平台

## 🙏 致谢

- [React Flow](https://reactflow.dev/) - 强大的图形化库
- [Lucide](https://lucide.dev/) - 精美的图标库

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！**

[🌟 Star this repo](https://github.com/InvictusG/stellarmind-ai) | [🐛 Report Bug](https://github.com/InvictusG/stellarmind-ai/issues) | [💡 Request Feature](https://github.com/InvictusG/stellarmind-ai/issues)

**StellarMind AI - 让AI帮你进行第一性原理思考** 🚀

</div>

---
