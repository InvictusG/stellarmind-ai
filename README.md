# AI思维导图探索器

一个现代化的AI链式自问自答思维导图Web应用，让AI帮你递归探索任何问题。

## 📋 项目概述

这是一个基于Next.js 14构建的现代化Web应用，用户输入一个问题后，AI会自动递归生成多分支"问题-答案"链，以可交互思维导图和对话气泡流两种方式呈现。产品目标是超越[Whybot](https://whybot-khaki.vercel.app/?ref=theresanaiforthat)的用户体验。

## ✨ 核心功能

### 基础功能
- 🧠 **AI递归思维导图**: 自动生成多层级问答分支
- 💬 **双视图模式**: 思维导图 + 气泡对话流
- 🎨 **现代化UI**: 深浅色主题，流畅动画，响应式设计
- 📱 **移动端适配**: 完整的移动端交互体验
- ⚡ **实时流式**: 支持流式AI响应，实时更新
- 🔧 **高度定制**: 可调节深度、广度、模型参数

### 数据管理
- 💾 **会话持久化**: 本地存储 + 云端同步
- 🔍 **智能搜索**: 全文搜索会话内容和标签
- 🏷️ **标签系统**: 灵活的标签分类和过滤
- 📊 **统计分析**: 会话数据统计和使用分析

### 用户系统
- 👤 **多种登录**: 邮箱注册 + Google OAuth
- 👥 **访客模式**: 无需注册即可体验
- ⚙️ **个人设置**: 主题、语言、默认配置
- 🔐 **数据安全**: 本地优先 + 加密存储

### 分享协作
- 🔗 **链接分享**: 生成分享链接，权限控制
- 📱 **二维码**: 移动端便捷分享
- 🌐 **社交媒体**: 一键分享到Twitter、Facebook等
- ⭐ **收藏管理**: 收藏重要会话，批量操作

### 多格式导出
- 🖼️ **PNG导出**: 高质量图片，多种清晰度
- 📄 **PDF文档**: 包含完整内容的专业文档
- 📊 **数据导出**: JSON/CSV格式，便于分析
- 🎨 **SVG矢量**: 可编辑的矢量图形
- 📦 **批量导出**: 支持多个会话同时导出

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **UI库**: React 18 + TypeScript
- **样式**: Tailwind CSS + shadcn/ui组件
- **状态管理**: Zustand
- **可视化**: React Flow (思维导图)
- **动画**: Framer Motion
- **图标**: Lucide React

### 后端
- **API**: Next.js API Routes
- **AI集成**: OpenAI API (支持自定义模型)
- **流式响应**: Server-Sent Events (SSE)

### 开发工具
- **类型检查**: TypeScript
- **代码规范**: ESLint + Prettier
- **构建工具**: Next.js内置Webpack
- **包管理**: npm/yarn

## 📁 项目结构

```
ai-mindmap-explorer/
├── app/                      # Next.js 14 App Router目录
│   ├── globals.css          # 全局样式
│   ├── layout.tsx           # 根布局组件
│   ├── page.tsx             # 首页组件
│   ├── explore/             # 探索页面
│   │   └── page.tsx         # 探索主页面
│   └── api/                 # API路由
│       └── explore/         # AI探索API
├── components/              # 可复用组件
│   ├── ui/                  # 基础UI组件
│   ├── mindmap/             # 思维导图相关组件
│   ├── chat/                # 对话流相关组件
│   └── layout/              # 布局相关组件
├── hooks/                   # 自定义React Hooks
├── store/                   # Zustand状态管理
├── utils/                   # 工具函数
├── types/                   # TypeScript类型定义
├── styles/                  # 样式文件
├── lib/                     # 第三方库配置
└── public/                  # 静态资源
```

### 目录说明

- **`app/`**: Next.js 14的App Router目录，包含所有页面和API路由
- **`components/`**: 可复用的React组件，按功能模块划分
- **`hooks/`**: 自定义Hook，处理状态逻辑和副作用
- **`store/`**: Zustand状态管理，全局状态定义
- **`utils/`**: 纯函数工具，不依赖React的通用逻辑
- **`types/`**: TypeScript类型定义，确保类型安全
- **`lib/`**: 第三方库的配置和初始化

## 🚀 快速开始

### 环境要求

- Node.js 18.17+ 
- npm 9+ 或 yarn 1.22+

### 安装依赖

```bash
# 克隆项目
git clone [repository-url]
cd ai-mindmap-explorer

# 安装依赖
npm install
# 或
yarn install
```

### 环境配置

创建 `.env.local` 文件：

```env
# OpenAI API配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
# 或
yarn build
yarn start
```

## 📝 开发规范

### 代码结构

- **组件**: 使用函数式组件 + TypeScript
- **样式**: Tailwind CSS优先，自定义CSS使用CSS Modules
- **状态**: 本地状态用useState，全局状态用Zustand
- **类型**: 严格的TypeScript类型定义
- **注释**: 完整的中文注释，说明业务逻辑

### 文件命名

- **组件**: PascalCase (如 `MindMapNode.tsx`)
- **Hook**: camelCase + use前缀 (如 `useNodeLayout.ts`)
- **工具函数**: camelCase (如 `layoutUtils.ts`)
- **类型**: PascalCase + 接口Interface后缀 (如 `MindMapNode`)

### Git提交规范

```
feat: 新功能
fix: 修复Bug
docs: 文档更新
style: 代码格式化
refactor: 代码重构
test: 测试相关
chore: 构建配置等
```

## 🔧 核心技术实现

### 自动布局算法

使用Dagre算法实现思维导图节点的自动布局，确保：
- 节点间距合理，不重叠
- 分支层次清晰
- 支持动态扩展

### 流式AI响应

通过Server-Sent Events实现：
- 实时接收AI生成内容
- 逐步渲染新节点和连接
- 支持中断和恢复

### 状态管理架构

基于Zustand的模块化状态管理：
- 节点数据管理
- UI状态管理  
- 用户偏好设置
- 会话历史记录

## 📦 部署

### Vercel部署

1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 自动部署

### Docker部署

```bash
# 构建镜像
docker build -t ai-mindmap-explorer .

# 运行容器
docker run -p 3000:3000 ai-mindmap-explorer
```

## 🤝 贡献指南

1. Fork本仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'feat: add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建Pull Request

## 📄 License

本项目采用 MIT 协议 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [React Flow](https://reactflow.dev/) - 强大的图形化库
- [Tailwind CSS](https://tailwindcss.com/) - 优秀的CSS框架
- [Zustand](https://github.com/pmndrs/zustand) - 轻量级状态管理
- [Lucide](https://lucide.dev/) - 精美的图标库

---

如有问题或建议，欢迎提Issue或联系开发者。 