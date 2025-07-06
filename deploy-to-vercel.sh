#!/bin/bash

# StellarMind AI - 一键部署到 Vercel 脚本
# 作者: StellarMind AI Team
# 版本: 1.0.0

echo "🚀 StellarMind AI - 一键部署到 Vercel"
echo "======================================"

# 检查是否安装了必要的工具
echo "📋 检查部署环境..."

# 检查 Git
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装，请先安装 Git"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ 环境检查通过"

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 检查是否是 StellarMind AI 项目
if ! grep -q "whybot" package.json; then
    echo "❌ 这不是 StellarMind AI 项目"
    exit 1
fi

echo "✅ 项目验证通过"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 项目构建失败"
    exit 1
fi

echo "✅ 项目构建成功"

# 检查 Git 状态
echo "📝 准备代码仓库..."

# 初始化 Git（如果需要）
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git 仓库初始化完成"
fi

# 设置 Git 用户信息（如果需要）
if [ -z "$(git config user.name)" ]; then
    git config user.name "StellarMind AI"
    git config user.email "stellarmind@example.com"
    echo "✅ Git 用户信息配置完成"
fi

# 添加并提交所有文件
git add .
git commit -m "feat: 准备部署 StellarMind AI 到 Vercel" || echo "⚠️ 没有新的更改需要提交"

echo "✅ 代码准备完成"

# 提示用户下一步操作
echo ""
echo "🎯 接下来的手动步骤："
echo "======================================"
echo ""
echo "1. 📂 创建 GitHub 仓库:"
echo "   - 访问 https://github.com/new"
echo "   - 仓库名称: stellarmind-ai"
echo "   - 设置为 Public（推荐）"
echo "   - 不要添加 README, .gitignore 或 license"
echo ""
echo "2. 🔗 连接到 GitHub:"
echo "   git remote add origin https://github.com/你的用户名/stellarmind-ai.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. 🚀 部署到 Vercel:"
echo "   - 访问 https://vercel.com"
echo "   - 用 GitHub 账户登录"
echo "   - 点击 'New Project'"
echo "   - 选择 'stellarmind-ai' 仓库"
echo "   - 点击 'Import'"
echo ""
echo "4. ⚙️ 配置环境变量（在 Vercel 项目设置中）:"
echo "   JWT_SECRET = $(openssl rand -base64 32 2>/dev/null || echo 'your-super-secret-jwt-key-here-make-it-very-long-and-random')"
echo "   NODE_ENV = production"
echo "   NEXT_PUBLIC_APP_URL = https://stellarmindai.com"
echo ""
echo "5. 🌐 配置域名:"
echo "   - 在 Vercel 项目设置 → Domains"
echo "   - 添加 stellarmindai.com"
echo "   - 添加 www.stellarmindai.com"
echo ""
echo "📖 完整部署指南: ./VERCEL_DEPLOYMENT.md"
echo ""
echo "🎉 准备工作完成！请按照上述步骤完成部署。"
echo "💡 如需帮助，请查看 VERCEL_DEPLOYMENT.md 文档" 