# 🚀 StellarMind AI 部署到 stellarmindai.com

## 📋 快速部署检查清单

✅ **已完成的功能**
- [x] 多用户认证系统 (JWT Token)
- [x] 用户注册/登录功能  
- [x] 数据隔离和安全
- [x] 演示账号系统
- [x] API密钥管理
- [x] 会话管理
- [x] 数学公式渲染
- [x] Perplexity风格UI
- [x] 多媒体文件上传
- [x] 6级阅读层级
- [x] 第一性原理AI思维
- [x] 完整的部署脚本

## 🎯 一键部署方案

### 方案一：Vercel部署（推荐）

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 部署到Vercel
vercel --prod

# 3. 添加自定义域名
vercel domains add stellarmindai.com
vercel domains add www.stellarmindai.com

# 4. 配置DNS记录
# A记录：@ -> 76.76.19.19
# CNAME记录：www -> cname.vercel-dns.com
```

**优势**：
- 零配置SSL证书
- 全球CDN加速
- 自动扩缩容
- 简单易用

### 方案二：云服务器部署

```bash
# 在Ubuntu服务器上运行
./scripts/deploy-production.sh
```

**包含功能**：
- 自动安装依赖（Nginx、PostgreSQL、PM2）
- 数据库配置和初始化
- SSL证书自动申请
- 防火墙配置
- 自动监控和备份
- 更新脚本

## 🌐 DNS配置

### 基本配置

在域名注册商添加以下DNS记录：

```
类型: A
名称: @
值: YOUR_SERVER_IP
TTL: 600

类型: A
名称: www  
值: YOUR_SERVER_IP
TTL: 600
```

### 验证DNS
```bash
# 检查解析
dig stellarmindai.com
ping stellarmindai.com

# 在线工具
# https://dnschecker.org/
```

## 🔐 多用户隔离架构

### 认证系统
- **JWT Token认证**：7天有效期
- **用户注册**：邮箱验证
- **演示账号**：demo@stellarmind.ai / demo123
- **密码安全**：bcrypt加密

### 数据隔离
- **用户级隔离**：每个用户只能访问自己的数据
- **会话管理**：用户会话独立存储
- **API密钥隔离**：用户API配置独立
- **权限控制**：严格的API访问控制

### 数据库设计
```sql
-- 用户表
users (id, email, name, subscription, created_at)

-- 会话表 
sessions (id, user_id, title, cards, is_public, created_at)

-- 用户配置表
user_configs (user_id, api_keys, preferences)
```

## 🎨 功能特性

### 🧠 AI功能
- **第一性原理思维**：从基础概念递进分析
- **6级阅读层级**：从幼儿园到博士级别适配
- **数学公式渲染**：LaTeX/KaTeX专业级渲染
- **多模态支持**：文档、图片、语音上传

### 💫 用户体验
- **Perplexity风格UI**：现代化输入界面
- **实时打字效果**：流畅的内容生成动画
- **智能连接线**：动态SVG思维导图连接
- **响应式设计**：完美适配桌面和移动端

### 🔒 安全特性  
- **HTTPS强制**：SSL证书自动配置
- **XSS防护**：完整的安全头配置
- **CSRF保护**：Token验证机制
- **输入验证**：严格的数据验证
- **SQL注入防护**：参数化查询

## 📊 性能优化

### 前端优化
- **代码分割**：Next.js自动优化
- **静态资源缓存**：1年缓存策略
- **图片懒加载**：提升页面加载速度
- **Bundle分析**：最小化包体积

### 后端优化
- **数据库索引**：查询性能优化
- **连接池**：数据库连接管理
- **缓存策略**：Redis缓存热点数据
- **负载均衡**：PM2集群模式

## 🔧 运维管理

### 监控系统
```bash
# 应用状态
pm2 status
pm2 monit

# 系统监控
sudo tail -f /var/log/stellarmind-monitor.log

# 性能监控
htop
iotop
```

### 备份策略
- **自动备份**：每日2AM自动备份
- **数据库备份**：PostgreSQL dump
- **文件备份**：完整应用目录
- **备份保留**：7天滚动清理

### 更新部署
```bash
# 无停机更新
cd /var/www/stellarmind
./update.sh

# 手动更新
git pull origin main
npm run build
pm2 reload stellarmind
```

## 🚨 故障排除

### 常见问题

#### 1. 域名无法访问
```bash
# 检查DNS解析
nslookup stellarmindai.com

# 检查服务器状态
pm2 status
sudo systemctl status nginx
```

#### 2. SSL证书问题
```bash
# 重新申请证书
sudo certbot --nginx -d stellarmindai.com

# 检查证书有效期
sudo certbot certificates
```

#### 3. 数据库连接失败
```bash
# 检查PostgreSQL
sudo systemctl status postgresql

# 测试连接
psql -h localhost -U stellarmind -d stellarmind_db
```

#### 4. API调用失败
- 检查API密钥配置
- 验证网络连接
- 查看应用日志：`pm2 logs stellarmind`

## 🎯 部署后验证

### 功能测试清单

✅ **基础功能**
- [ ] 域名正常访问：https://stellarmindai.com
- [ ] 用户注册/登录
- [ ] 演示账号登录：demo@stellarmind.ai / demo123
- [ ] API密钥配置
- [ ] 问题提交和AI回答
- [ ] 数学公式正常渲染

✅ **高级功能**  
- [ ] 文件上传（PDF、图片）
- [ ] 语音录制功能
- [ ] 6级阅读层级选择
- [ ] 思维导图节点展开
- [ ] 连接线正常显示
- [ ] 重置和返回功能

✅ **性能测试**
- [ ] 页面加载速度 < 3秒
- [ ] AI回答响应 < 10秒
- [ ] 打字动画流畅
- [ ] 移动端兼容性

✅ **安全测试**
- [ ] HTTPS证书有效
- [ ] 用户数据隔离
- [ ] API访问控制
- [ ] XSS防护有效

## 📈 运营数据

### 用户增长指标
- **注册用户数**：用户表统计
- **活跃用户数**：最近30天登录
- **会话创建数**：每日会话统计  
- **问题提交数**：AI调用次数

### 性能指标
- **平均响应时间**：< 200ms
- **可用性**：> 99.9%
- **错误率**：< 0.1%
- **并发用户数**：支持1000+

## 🎊 部署完成

恭喜！🎉 你的StellarMind AI现已成功部署到stellarmindai.com！

**访问地址**：https://stellarmindai.com
**演示账号**：demo@stellarmind.ai / demo123

现在你拥有一个：
- ✨ 专业级AI知识图谱平台
- 🔐 支持多用户并发访问
- 🧠 第一性原理思维能力
- 📊 完整的数据分析和可视化
- 🚀 企业级性能和安全标准

开始你的AI知识探索之旅吧！🌟 