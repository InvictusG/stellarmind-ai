# StellarMind AI - Vercel 部署指南

## 🚀 快速部署到 Vercel

### 第一步：准备代码仓库

1. **创建 GitHub 仓库**
   ```bash
   # 在 GitHub 创建新仓库 stellarmind-ai
   # 然后连接本地仓库
   git remote add origin https://github.com/你的用户名/stellarmind-ai.git
   git branch -M main
   git push -u origin main
   ```

2. **推送代码到 GitHub**
   ```bash
   git push origin main
   ```

### 第二步：Vercel 部署

1. **访问 Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 使用 GitHub 账户登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 `stellarmind-ai` 仓库
   - 点击 "Import"

3. **配置部署设置**
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
   - **Development Command**: `npm run dev`

### 第三步：环境变量配置

在 Vercel 项目设置中添加以下环境变量：

| 名称 | 值 | 说明 |
|------|----|----- |
| `JWT_SECRET` | `your-super-secret-jwt-key-here-make-it-very-long-and-random` | JWT令牌加密密钥 |
| `NODE_ENV` | `production` | 运行环境 |
| `NEXT_PUBLIC_APP_URL` | `https://stellarmindai.com` | 应用公开URL |

⚠️ **重要**: JWT_SECRET 必须是一个安全的随机字符串，建议至少32位

### 第四步：域名配置

1. **在 Vercel 中添加域名**
   - 进入项目设置 → Domains
   - 添加 `stellarmindai.com`
   - 添加 `www.stellarmindai.com`

2. **DNS 配置**
   在域名注册商处设置以下 DNS 记录：
   
   ```
   类型: A
   名称: @
   值: 76.76.19.61 (Vercel IP)
   
   类型: CNAME  
   名称: www
   值: cname.vercel-dns.com
   ```

   或者使用 Vercel 的 nameservers：
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

### 第五步：SSL 证书

Vercel 会自动为你的域名配置免费的 SSL 证书：
- ✅ HTTPS 自动启用
- ✅ 证书自动更新
- ✅ HTTP 自动重定向到 HTTPS

### 第六步：部署验证

1. **访问网站**
   - https://stellarmindai.com
   - https://www.stellarmindai.com

2. **测试功能**
   - ✅ 用户注册/登录
   - ✅ API 配置功能
   - ✅ 思维导图生成
   - ✅ 数学公式渲染

## 🔧 高级配置

### 性能优化

1. **启用 Analytics**
   ```bash
   # 在 Vercel 项目中启用
   - Web Analytics
   - Speed Insights
   ```

2. **缓存优化**
   ```json
   // vercel.json 已配置
   {
     "headers": [
       {
         "source": "/api/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "s-maxage=60"
           }
         ]
       }
     ]
   }
   ```

### 监控配置

1. **日志监控**
   - Vercel Functions 日志自动收集
   - 在 Vercel Dashboard 查看实时日志

2. **错误监控**
   ```bash
   # 可选：集成 Sentry
   npm install @sentry/nextjs
   ```

### 安全设置

1. **CORS 配置**
   ```json
   // 已在 vercel.json 中配置
   "headers": [
     {
       "source": "/api/(.*)",
       "headers": [
         {
           "key": "Access-Control-Allow-Origin",
           "value": "https://stellarmindai.com"
         }
       ]
     }
   ]
   ```

2. **CSP 头部**
   ```javascript
   // next.config.js 可添加
   const nextConfig = {
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             {
               key: 'X-Frame-Options',
               value: 'DENY'
             }
           ]
         }
       ]
     }
   }
   ```

## 🚨 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 检查 Node.js 版本
   "engines": {
     "node": ">=18.0.0"
   }
   ```

2. **API 路由 404**
   - 确保 API 路由文件在 `app/api/` 目录
   - 检查文件命名 `route.ts`

3. **环境变量问题**
   - 客户端变量必须以 `NEXT_PUBLIC_` 开头
   - 服务端变量在 Vercel 设置中配置

4. **DNS 传播延迟**
   - DNS 更改可能需要 24-48 小时生效
   - 使用 `nslookup stellarmindai.com` 检查

### 部署检查清单

- [ ] ✅ 代码推送到 GitHub
- [ ] ✅ Vercel 项目创建
- [ ] ✅ 环境变量配置
- [ ] ✅ 域名添加
- [ ] ✅ DNS 配置
- [ ] ✅ SSL 证书激活
- [ ] ✅ 网站访问测试
- [ ] ✅ 功能测试完成

## 📞 技术支持

如果遇到部署问题：

1. **Vercel 文档**: https://vercel.com/docs
2. **Next.js 文档**: https://nextjs.org/docs
3. **项目 Issues**: GitHub 仓库 Issues 页面

## 🎉 部署完成

恭喜！🎊 StellarMind AI 现已成功部署到：

- **主域名**: https://stellarmindai.com  
- **备用域名**: https://www.stellarmindai.com
- **Vercel 域名**: https://你的项目名.vercel.app

现在用户可以：
- 🔐 注册账户并登录
- ⚙️ 配置 AI API 密钥
- 🧠 创建第一性原理知识图谱
- 📱 在任何设备上使用
- 🔒 享受企业级安全保护

**下一步**: 在社交媒体分享你的 AI 知识图谱平台！ 🚀 