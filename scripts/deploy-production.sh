#!/bin/bash

# StellarMind AI 生产环境一键部署脚本
# 使用方法: ./scripts/deploy-production.sh

set -e

echo "🚀 开始部署StellarMind AI到stellarmindai.com生产环境..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}请不要使用root用户运行此脚本${NC}"
   exit 1
fi

# 检查域名配置
echo -e "${BLUE}检查域名配置...${NC}"
if ! dig +short stellarmindai.com > /dev/null; then
    echo -e "${YELLOW}警告: stellarmindai.com域名可能未正确配置${NC}"
    read -p "是否继续部署? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 更新系统
echo -e "${BLUE}更新系统包...${NC}"
sudo apt update && sudo apt upgrade -y

# 安装必要依赖
echo -e "${BLUE}安装系统依赖...${NC}"
sudo apt install -y nginx nodejs npm postgresql postgresql-contrib certbot python3-certbot-nginx ufw

# 检查Node.js版本
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}正在升级Node.js到18.x版本...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 安装PM2进程管理器
echo -e "${BLUE}安装PM2进程管理器...${NC}"
sudo npm install -g pm2

# 配置防火墙
echo -e "${BLUE}配置防火墙...${NC}"
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# 创建应用目录
echo -e "${BLUE}创建应用目录...${NC}"
sudo mkdir -p /var/www/stellarmind
sudo chown -R $USER:$USER /var/www/stellarmind

# 如果目录已存在，备份当前版本
if [ -d "/var/www/stellarmind/.git" ]; then
    echo -e "${YELLOW}备份当前版本...${NC}"
    cp -r /var/www/stellarmind /var/www/stellarmind_backup_$(date +%Y%m%d_%H%M%S)
fi

# 克隆或更新项目
if [ ! -d "/var/www/stellarmind/.git" ]; then
    echo -e "${BLUE}克隆项目代码...${NC}"
    git clone . /var/www/stellarmind
else
    echo -e "${BLUE}更新项目代码...${NC}"
    cd /var/www/stellarmind
    git fetch origin
    git reset --hard origin/main
fi

cd /var/www/stellarmind

# 安装项目依赖
echo -e "${BLUE}安装项目依赖...${NC}"
npm ci

# 构建项目
echo -e "${BLUE}构建生产版本...${NC}"
npm run build

# 配置PostgreSQL
echo -e "${BLUE}配置PostgreSQL数据库...${NC}"
sudo -u postgres psql -c "CREATE DATABASE stellarmind_db;" 2>/dev/null || echo "数据库已存在"
sudo -u postgres psql -c "CREATE USER stellarmind WITH PASSWORD 'stellarmind_2024_secure';" 2>/dev/null || echo "用户已存在"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE stellarmind_db TO stellarmind;"

# 创建数据库表
echo -e "${BLUE}创建数据库表...${NC}"
sudo -u postgres psql -d stellarmind_db << 'EOF'
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255),
  avatar VARCHAR(500),
  subscription VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  cards JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  tags JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_configs (
  user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  api_keys JSONB NOT NULL DEFAULT '[]',
  preferences JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_configs_user_id ON user_configs(user_id);
EOF

# 生成随机JWT密钥
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# 配置环境变量
echo -e "${BLUE}配置环境变量...${NC}"
cat > .env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://stellarmind:stellarmind_2024_secure@localhost:5432/stellarmind_db
JWT_SECRET=${JWT_SECRET}
NEXTAUTH_URL=https://stellarmindai.com
NEXTAUTH_SECRET=${JWT_SECRET}

# API Keys - 用户需要自行配置
# OPENAI_API_KEY=sk-your-openai-key
# ANTHROPIC_API_KEY=sk-your-anthropic-key
# DEEPSEEK_API_KEY=sk-your-deepseek-key
EOF

# 配置Nginx
echo -e "${BLUE}配置Nginx...${NC}"
sudo tee /etc/nginx/sites-available/stellarmindai.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name stellarmindai.com www.stellarmindai.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name stellarmindai.com www.stellarmindai.com;

    # 临时自签名证书，稍后会被Let's Encrypt替换
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
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
        proxy_read_timeout 86400;
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
    add_header Content-Security-Policy "default-src 'self' http: https: ws: wss: data: blob: 'unsafe-inline' 'unsafe-eval'" always;
}
EOF

# 启用站点
sudo ln -sf /etc/nginx/sites-available/stellarmindai.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
if sudo nginx -t; then
    echo -e "${GREEN}Nginx配置正确${NC}"
    sudo systemctl reload nginx
else
    echo -e "${RED}Nginx配置错误，请检查${NC}"
    exit 1
fi

# 启动应用
echo -e "${BLUE}启动StellarMind AI应用...${NC}"
pm2 delete stellarmind 2>/dev/null || true
pm2 start npm --name "stellarmind" -- start
pm2 save
pm2 startup

# 配置SSL证书
echo -e "${BLUE}配置Let's Encrypt SSL证书...${NC}"
if sudo certbot --nginx -d stellarmindai.com -d www.stellarmindai.com --non-interactive --agree-tos --email admin@stellarmindai.com; then
    echo -e "${GREEN}SSL证书配置成功${NC}"
else
    echo -e "${YELLOW}SSL证书配置失败，使用临时证书${NC}"
fi

# 设置自动续期
sudo crontab -l 2>/dev/null | grep -v certbot | sudo crontab -
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | sudo crontab -

# 创建监控脚本
echo -e "${BLUE}创建监控脚本...${NC}"
sudo tee /usr/local/bin/stellarmind-monitor.sh > /dev/null << 'EOF'
#!/bin/bash
# 检查应用状态
if ! pm2 show stellarmind > /dev/null 2>&1; then
    echo "$(date): StellarMind应用已停止，正在重启..." | sudo tee -a /var/log/stellarmind-monitor.log
    cd /var/www/stellarmind && pm2 start npm --name "stellarmind" -- start
fi

# 检查Nginx状态
if ! systemctl is-active --quiet nginx; then
    echo "$(date): Nginx已停止，正在重启..." | sudo tee -a /var/log/stellarmind-monitor.log
    sudo systemctl start nginx
fi
EOF

sudo chmod +x /usr/local/bin/stellarmind-monitor.sh

# 添加监控任务
sudo crontab -l 2>/dev/null | grep -v stellarmind-monitor | sudo crontab -
(sudo crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/stellarmind-monitor.sh") | sudo crontab -

# 创建备份脚本
echo -e "${BLUE}创建自动备份脚本...${NC}"
sudo tee /usr/local/bin/stellarmind-backup.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/stellarmind"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
sudo -u postgres pg_dump stellarmind_db > $BACKUP_DIR/db_backup_$DATE.sql

# 备份应用文件
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/stellarmind

# 删除7天前的备份
find $BACKUP_DIR -type f -mtime +7 -delete

echo "$(date): 备份完成 - $DATE" | sudo tee -a /var/log/stellarmind-backup.log
EOF

sudo chmod +x /usr/local/bin/stellarmind-backup.sh

# 添加每日备份任务
sudo crontab -l 2>/dev/null | grep -v stellarmind-backup | sudo crontab -
(sudo crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/stellarmind-backup.sh") | sudo crontab -

# 创建更新脚本
echo -e "${BLUE}创建更新脚本...${NC}"
tee /var/www/stellarmind/update.sh > /dev/null << 'EOF'
#!/bin/bash
echo "🔄 更新StellarMind AI..."

cd /var/www/stellarmind

# 备份当前版本
cp -r . ../stellarmind_backup_$(date +%Y%m%d_%H%M%S)

# 拉取最新代码
git fetch origin
git reset --hard origin/main

# 安装依赖
npm ci

# 构建应用
npm run build

# 重启服务
pm2 reload stellarmind

echo "✅ 更新完成！"
EOF

chmod +x /var/www/stellarmind/update.sh

echo -e "${GREEN}🎉 StellarMind AI部署完成！${NC}"
echo
echo -e "${BLUE}访问地址:${NC}"
echo "  HTTP:  http://stellarmindai.com"
echo "  HTTPS: https://stellarmindai.com"
echo
echo -e "${BLUE}管理命令:${NC}"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs stellarmind"
echo "  重启应用: pm2 reload stellarmind"
echo "  更新应用: cd /var/www/stellarmind && ./update.sh"
echo
echo -e "${BLUE}监控和日志:${NC}"
echo "  应用监控: pm2 monit"
echo "  系统日志: sudo tail -f /var/log/stellarmind-monitor.log"
echo "  备份日志: sudo tail -f /var/log/stellarmind-backup.log"
echo "  Nginx日志: sudo tail -f /var/log/nginx/access.log"
echo
echo -e "${YELLOW}重要提醒:${NC}"
echo "  1. 请在 .env.production 文件中配置你的API密钥"
echo "  2. 演示账号: demo@stellarmind.ai / demo123"
echo "  3. 数据库密码: stellarmind_2024_secure"
echo "  4. 首次部署后请重启应用: pm2 reload stellarmind"
echo
echo -e "${GREEN}恭喜！StellarMind AI现已成功部署到生产环境！${NC}" 