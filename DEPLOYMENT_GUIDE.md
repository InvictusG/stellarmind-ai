# StellarMind AI 部署指南

将WhyBot部署到stellarmindai.com域名的完整指南。

## 🎯 部署概述

本项目现已支持多用户系统，包含用户认证、会话隔离、数据安全等企业级功能。

## 📋 系统要求

### 服务器配置
- **CPU**: 2核心以上
- **内存**: 4GB以上  
- **存储**: 20GB以上SSD
- **操作系统**: Ubuntu 20.04+ / CentOS 8+
- **Node.js**: 18.0+
- **数据库**: PostgreSQL 14+ 或 MySQL 8.0+

### 域名配置
- 主域名：`stellarmindai.com`
- SSL证书（推荐Let's Encrypt）

## 🚀 一键部署脚本

### 1. 准备部署脚本

```bash
#!/bin/bash
# deploy.sh - StellarMind AI一键部署脚本

set -e

echo "🚀 开始部署StellarMind AI到生产环境..."

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装依赖
sudo apt install -y nginx nodejs npm postgresql postgresql-contrib certbot python3-certbot-nginx

# 安装PM2进程管理器
sudo npm install -g pm2

# 克隆项目
git clone https://github.com/yourusername/whybot.git /var/www/stellarmind
cd /var/www/stellarmind

# 安装依赖
npm install

# 构建项目
npm run build

# 配置环境变量
cat > .env.production << EOF
NODE_ENV=production
DATABASE_URL=postgresql://stellarmind:your_password@localhost:5432/stellarmind_db
JWT_SECRET=your_super_secret_jwt_key_here
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
EOF

# 启动应用
pm2 start npm --name "stellarmind" -- start
pm2 save
pm2 startup

echo "✅ 应用部署完成！"
```

### 2. 数据库配置

```sql
-- 创建数据库
CREATE DATABASE stellarmind_db;

-- 创建用户
CREATE USER stellarmind WITH PASSWORD 'your_secure_password';

-- 授权
GRANT ALL PRIVILEGES ON DATABASE stellarmind_db TO stellarmind;

-- 用户表
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255),
  avatar VARCHAR(500),
  subscription VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 会话表
CREATE TABLE sessions (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  cards JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  tags JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户配置表
CREATE TABLE user_configs (
  user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  api_keys JSONB NOT NULL DEFAULT '[]',
  preferences JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
CREATE INDEX idx_user_configs_user_id ON user_configs(user_id);
```

### 3. Nginx配置

```nginx
# /etc/nginx/sites-available/stellarmindai.com
server {
    listen 80;
    server_name stellarmindai.com www.stellarmindai.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name stellarmindai.com www.stellarmindai.com;

    # SSL配置
    ssl_certificate /etc/letsencrypt/live/stellarmindai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stellarmindai.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 反向代理到Next.js应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

## 🏗️ 云平台部署

### Vercel部署（推荐）

1. **连接仓库**
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod

# 配置自定义域名
vercel domains add stellarmindai.com
```

2. **环境变量配置**
```bash
# 在Vercel Dashboard中设置
NODE_ENV=production
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
```

### Docker部署

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/stellarmind
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - db
      - redis

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: stellarmind
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 🔧 多用户架构配置

### 1. 数据隔离策略

```typescript
// lib/auth-middleware.ts
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export async function getUserFromRequest(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  
  if (!token) return null
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

// 确保每个API调用都检查用户权限
export async function requireAuth(request: NextRequest) {
  const userId = await getUserFromRequest(request)
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}
```

### 2. 会话管理

```typescript
// lib/session-manager.ts
export class SessionManager {
  static async getUserSessions(userId: string) {
    // 只返回用户自己的会话
    return await db.session.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })
  }

  static async createSession(userId: string, title: string) {
    return await db.session.create({
      data: {
        id: generateId(),
        userId,
        title,
        cards: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  }
}
```

## 🔒 安全配置

### 1. 环境变量
```env
# .env.production
NODE_ENV=production

# 数据库
DATABASE_URL=postgresql://username:password@host:5432/database

# JWT密钥（使用强密码）
JWT_SECRET=your_super_long_random_jwt_secret_key_here

# API密钥
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-xxx
DEEPSEEK_API_KEY=sk-xxx

# 允许的域名
ALLOWED_ORIGINS=https://stellarmindai.com,https://www.stellarmindai.com
```

### 2. 防火墙配置
```bash
# UFW防火墙设置
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

## 📊 监控与日志

### 1. PM2监控
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs stellarmind

# 查看监控面板
pm2 monit
```

### 2. 日志配置
```javascript
// next.config.js
module.exports = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    instrumentationHook: true,
  }
}
```

## 🔄 CI/CD自动部署

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🎯 性能优化

### 1. 缓存策略
```typescript
// lib/cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function cacheUserSession(userId: string, sessionData: any) {
  await redis.setex(`session:${userId}`, 3600, JSON.stringify(sessionData))
}

export async function getCachedSession(userId: string) {
  const data = await redis.get(`session:${userId}`)
  return data ? JSON.parse(data) : null
}
```

### 2. 数据库优化
```sql
-- 添加必要的索引
CREATE INDEX CONCURRENTLY idx_sessions_user_created ON sessions(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- 分区表（针对大量数据）
CREATE TABLE sessions_partitioned (
  LIKE sessions INCLUDING ALL
) PARTITION BY RANGE (created_at);
```

## 🔧 维护指南

### 1. 数据备份
```bash
# 数据库备份
pg_dump stellarmind_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 应用备份
tar -czf app_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/stellarmind
```

### 2. 更新部署
```bash
# 无停机更新
cd /var/www/stellarmind
git pull origin main
npm install
npm run build
pm2 reload stellarmind
```

## 🚨 故障排除

### 常见问题

1. **端口冲突**
```bash
# 检查端口占用
sudo netstat -tulpn | grep :3000
# 杀死进程
sudo kill -9 PID
```

2. **SSL证书问题**
```bash
# 续期证书
sudo certbot renew
# 重启Nginx
sudo systemctl reload nginx
```

3. **数据库连接失败**
```bash
# 检查PostgreSQL状态
sudo systemctl status postgresql
# 重启数据库
sudo systemctl restart postgresql
```

## 📞 技术支持

- **项目仓库**: https://github.com/yourusername/whybot
- **问题反馈**: Issues页面
- **邮箱支持**: support@stellarmindai.com

---

🎉 恭喜！你的StellarMind AI现已成功部署到生产环境，支持多用户并发访问，数据安全隔离！ 