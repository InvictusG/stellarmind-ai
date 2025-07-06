# stellarmindai.com DNS配置指南

本指南将帮助你正确配置stellarmindai.com域名，确保能够成功访问你的StellarMind AI应用。

## 🌐 DNS记录配置

### 基本DNS记录设置

在你的域名注册商（如阿里云、腾讯云、Cloudflare等）的DNS管理界面中添加以下记录：

#### A记录配置
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

#### CNAME记录配置（可选）
如果使用CDN或负载均衡器：
```
类型: CNAME
名称: www
值: stellarmindai.com
TTL: 600
```

### 子域名配置（可选）

#### API子域名
```
类型: A
名称: api
值: YOUR_SERVER_IP
TTL: 600
```

#### 管理后台子域名
```
类型: A
名称: admin
值: YOUR_SERVER_IP
TTL: 600
```

## 🔧 不同平台的DNS配置

### 1. 阿里云DNS配置

1. 登录阿里云控制台
2. 进入"域名与网站" > "云解析DNS"
3. 找到stellarmindai.com域名，点击"解析设置"
4. 添加记录：
   - **记录类型**: A
   - **主机记录**: @
   - **解析线路**: 默认
   - **记录值**: 你的服务器IP地址
   - **TTL**: 10分钟

5. 添加www记录：
   - **记录类型**: A
   - **主机记录**: www
   - **解析线路**: 默认
   - **记录值**: 你的服务器IP地址
   - **TTL**: 10分钟

### 2. 腾讯云DNS配置

1. 登录腾讯云控制台
2. 进入"域名与网站" > "DNS解析DNSPod"
3. 找到stellarmindai.com，点击"解析"
4. 添加记录设置（同阿里云）

### 3. Cloudflare DNS配置

1. 登录Cloudflare Dashboard
2. 选择stellarmindai.com域名
3. 进入"DNS"选项卡
4. 点击"Add record"
5. 配置：
   - **Type**: A
   - **Name**: @
   - **IPv4 address**: 你的服务器IP
   - **Proxy status**: 🟠 Proxied (推荐开启CDN)

6. 添加www记录（同上）

### 4. 名空域名DNS配置

1. 登录域名注册商控制台
2. 找到域名管理
3. 进入DNS设置
4. 添加A记录指向服务器IP

## 🚀 云平台部署DNS配置

### Vercel部署

如果使用Vercel部署，DNS配置更简单：

1. **添加域名到Vercel项目**
```bash
vercel --prod
vercel domains add stellarmindai.com
vercel domains add www.stellarmindai.com
```

2. **配置DNS记录**
```
类型: A
名称: @
值: 76.76.19.19
TTL: 600

类型: CNAME
名称: www
值: cname.vercel-dns.com
TTL: 600
```

### Netlify部署

1. **添加自定义域名**
   - 进入站点设置
   - 点击"Add custom domain"
   - 输入stellarmindai.com

2. **配置DNS**
```
类型: A
名称: @
值: 75.2.60.5
TTL: 600

类型: CNAME
名称: www
值: your-site-name.netlify.app
TTL: 600
```

### 阿里云/腾讯云服务器

使用云服务器时，直接使用服务器的公网IP：

```bash
# 查看服务器公网IP
curl ifconfig.me

# 或者
curl ipinfo.io/ip
```

## 🔍 DNS配置验证

### 1. 使用dig命令验证
```bash
# 验证主域名
dig stellarmindai.com

# 验证www子域名
dig www.stellarmindai.com

# 检查NS记录
dig NS stellarmindai.com
```

### 2. 使用nslookup验证
```bash
# Windows/Linux
nslookup stellarmindai.com
nslookup www.stellarmindai.com
```

### 3. 在线DNS检查工具

推荐使用以下在线工具验证DNS配置：

- **DNS Checker**: https://dnschecker.org/
- **What's My DNS**: https://www.whatsmydns.net/
- **DNS Propagation Checker**: https://www.dnsmap.io/

### 4. ping测试
```bash
# 测试域名是否解析正确
ping stellarmindai.com
ping www.stellarmindai.com
```

## ⏰ DNS传播时间

DNS记录的生效时间：
- **本地ISP**: 几分钟到2小时
- **全球传播**: 24-48小时
- **TTL影响**: TTL值越小，更新越快

## 🛠️ 常见问题解决

### 1. 域名不解析

**问题**: ping域名无法解析
**解决**:
```bash
# 清除本地DNS缓存
# Windows
ipconfig /flushdns

# macOS
sudo dscacheutil -flushcache

# Linux
sudo systemd-resolve --flush-caches
```

### 2. www域名无法访问

**问题**: stellarmindai.com能访问，www.stellarmindai.com无法访问
**解决**: 检查是否添加了www的A记录或CNAME记录

### 3. SSL证书错误

**问题**: HTTPS访问提示证书错误
**解决**: 
```bash
# 重新申请SSL证书
sudo certbot --nginx -d stellarmindai.com -d www.stellarmindai.com

# 检查证书状态
sudo certbot certificates
```

### 4. DNS记录冲突

**问题**: 多个DNS服务商记录冲突
**解决**: 确保只在一个DNS服务商设置记录，删除其他地方的记录

## 📧 高级配置

### 邮箱服务配置

如果需要使用admin@stellarmindai.com等邮箱：

```
类型: MX
名称: @
值: mail.stellarmindai.com
优先级: 10
TTL: 600

类型: A
名称: mail
值: YOUR_MAIL_SERVER_IP
TTL: 600
```

### CDN加速配置

使用Cloudflare CDN：
1. 域名nameserver指向Cloudflare
2. 开启"Proxied"状态（橙色云朵）
3. 配置缓存规则和安全设置

## 🔄 部署后DNS验证脚本

创建验证脚本：

```bash
#!/bin/bash
# dns-check.sh

echo "🔍 检查stellarmindai.com DNS配置..."

# 检查主域名
echo "检查主域名解析:"
dig +short stellarmindai.com

# 检查www子域名
echo "检查www子域名解析:"
dig +short www.stellarmindai.com

# 检查HTTP访问
echo "检查HTTP访问:"
curl -I http://stellarmindai.com

# 检查HTTPS访问
echo "检查HTTPS访问:"
curl -I https://stellarmindai.com

echo "✅ DNS检查完成"
```

## 📞 技术支持

如果DNS配置遇到问题：

1. **检查域名状态**: 确保域名未过期
2. **联系注册商**: 确认DNS服务正常
3. **等待传播**: DNS更改需要时间生效
4. **查看日志**: 检查服务器nginx错误日志

---

🎯 完成DNS配置后，你就可以通过https://stellarmindai.com访问你的StellarMind AI应用了！ 