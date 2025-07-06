# StellarMind AI - 一键部署到 Vercel 脚本 (Windows PowerShell)
# 作者: StellarMind AI Team
# 版本: 1.0.0

Write-Host "🚀 StellarMind AI - 一键部署到 Vercel" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# 检查是否安装了必要的工具
Write-Host "📋 检查部署环境..." -ForegroundColor Yellow

# 检查 Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git 未安装，请先安装 Git" -ForegroundColor Red
    Write-Host "下载地址: https://git-scm.com/download/win" -ForegroundColor Blue
    exit 1
}

# 检查 Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js 未安装，请先安装 Node.js" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/zh-cn" -ForegroundColor Blue
    exit 1
}

# 检查 npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm 未安装，请先安装 npm" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 环境检查通过" -ForegroundColor Green

# 检查是否在项目根目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查是否是 StellarMind AI 项目
$packageContent = Get-Content "package.json" -Raw
if (-not ($packageContent -like "*stellarmind-ai*")) {
    Write-Host "❌ 这不是 StellarMind AI 项目" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 项目验证通过" -ForegroundColor Green

# 安装依赖
Write-Host "📦 安装项目依赖..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 依赖安装完成" -ForegroundColor Green

# 构建项目
Write-Host "🔨 构建项目..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 项目构建失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 项目构建成功" -ForegroundColor Green

# 检查 Git 状态
Write-Host "📝 准备代码仓库..." -ForegroundColor Yellow

# 初始化 Git（如果需要）
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git 仓库初始化完成" -ForegroundColor Green
}

# 设置 Git 用户信息（如果需要）
$gitUserName = git config user.name
if (-not $gitUserName) {
    git config user.name "StellarMind AI"
    git config user.email "stellarmind@example.com"
    Write-Host "✅ Git 用户信息配置完成" -ForegroundColor Green
}

# 添加并提交所有文件
git add .
git commit -m "feat: 准备部署 StellarMind AI 到 Vercel"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 代码提交完成" -ForegroundColor Green
} else {
    Write-Host "⚠️ 没有新的更改需要提交" -ForegroundColor Yellow
}

Write-Host "✅ 代码准备完成" -ForegroundColor Green

# 生成随机 JWT 密钥
$jwtSecret = [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# 提示用户下一步操作
Write-Host ""
Write-Host "🎯 接下来的手动步骤：" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 📂 创建 GitHub 仓库:" -ForegroundColor White
Write-Host "   - 访问 https://github.com/new" -ForegroundColor Blue
Write-Host "   - 仓库名称: stellarmind-ai" -ForegroundColor Green
Write-Host "   - 设置为 Public（推荐）" -ForegroundColor Green
Write-Host "   - 不要添加 README, .gitignore 或 license" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. 🔗 连接到 GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/你的用户名/stellarmind-ai.git" -ForegroundColor Blue
Write-Host "   git branch -M main" -ForegroundColor Blue
Write-Host "   git push -u origin main" -ForegroundColor Blue
Write-Host ""
Write-Host "3. 🚀 部署到 Vercel:" -ForegroundColor White
Write-Host "   - 访问 https://vercel.com" -ForegroundColor Blue
Write-Host "   - 用 GitHub 账户登录" -ForegroundColor Green
Write-Host "   - 点击 'New Project'" -ForegroundColor Green
Write-Host "   - 选择 'stellarmind-ai' 仓库" -ForegroundColor Green
Write-Host "   - 点击 'Import'" -ForegroundColor Green
Write-Host ""
Write-Host "4. ⚙️ 配置环境变量（在 Vercel 项目设置中）:" -ForegroundColor White
Write-Host "   JWT_SECRET = $jwtSecret" -ForegroundColor Green
Write-Host "   NODE_ENV = production" -ForegroundColor Green
Write-Host "   NEXT_PUBLIC_APP_URL = https://stellarmindai.com" -ForegroundColor Green
Write-Host ""
Write-Host "5. 🌐 配置域名:" -ForegroundColor White
Write-Host "   - 在 Vercel 项目设置 → Domains" -ForegroundColor Blue
Write-Host "   - 添加 stellarmindai.com" -ForegroundColor Green
Write-Host "   - 添加 www.stellarmindai.com" -ForegroundColor Green
Write-Host ""
Write-Host "📖 完整部署指南: .\VERCEL_DEPLOYMENT.md" -ForegroundColor Magenta
Write-Host ""
Write-Host "🎉 准备工作完成！请按照上述步骤完成部署。" -ForegroundColor Green
Write-Host "💡 如需帮助，请查看 VERCEL_DEPLOYMENT.md 文档" -ForegroundColor Yellow

# 暂停以便用户查看信息
Write-Host ""
Write-Host "按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 