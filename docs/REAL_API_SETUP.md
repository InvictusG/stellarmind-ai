# 🔑 真实API密钥获取与配置指南

## 📋 目录
1. [OpenAI API密钥](#openai-api密钥)
2. [其他API提供商](#其他api提供商)
3. [配置步骤](#配置步骤)
4. [费用说明](#费用说明)
5. [常见问题](#常见问题)

## 🤖 OpenAI API密钥

### 获取步骤

1. **访问OpenAI开发者平台**
   - 网址：https://platform.openai.com
   - ⚠️ 注意：不是chatgpt.com，而是platform.openai.com

2. **登录或注册账户**
   - 使用现有的OpenAI账户登录
   - 如果没有账户，点击"Sign up"注册

3. **进入API密钥页面**
   - 登录后点击右上角的设置图标（齿轮）
   - 在左侧菜单中找到"API keys"

4. **创建新的API密钥**
   - 点击"Create new secret key"按钮
   - 为密钥取一个有意义的名字（如："思维导图项目"）
   - 选择权限（建议选择所有权限）
   - 点击"Create secret key"

5. **保存API密钥**
   - ⚠️ **重要**：复制显示的API密钥并立即保存
   - 这个密钥只会显示一次，无法再次查看
   - 格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 充值账户

⚠️ **重要提醒**：OpenAI API不提供免费使用，需要充值

1. **进入计费页面**
   - 在platform.openai.com左侧菜单点击"Billing"
   - 点击"Add payment method"

2. **添加付款方式**
   - 添加信用卡或借记卡
   - 最低充值金额：$5 USD

3. **查看费用**
   - GPT-3.5-turbo：约$0.002/1K tokens
   - GPT-4：约$0.03/1K tokens
   - 1000个token大约750个英文单词

## 🌟 其他API提供商

### Claude (Anthropic)

1. **获取地址**：https://console.anthropic.com/
2. **注册并验证**账户
3. **创建API密钥**
4. **格式**：`sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
5. **费用**：按使用量计费，有免费额度

### Google Gemini

1. **获取地址**：https://makersuite.google.com/app/apikey
2. **使用Google账户登录**
3. **创建API密钥**
4. **格式**：`AIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
5. **免费额度**：每月有一定免费调用次数

### 智谱清言

1. **获取地址**：https://open.bigmodel.cn/
2. **注册账户并实名认证**
3. **创建API密钥**
4. **免费额度**：新用户有免费tokens

## ⚙️ 配置步骤

### 方式一：环境变量配置（推荐）

1. **复制环境变量模板**
   ```bash
   cp env.example .env.local
   ```

2. **编辑.env.local文件**
   ```env
   # OpenAI配置（必需）
   OPENAI_API_KEY=sk-your-real-openai-key-here
   OPENAI_BASE_URL=https://api.openai.com/v1
   
   # Claude配置（可选）
   CLAUDE_API_KEY=sk-ant-your-real-claude-key-here
   
   # Gemini配置（可选）
   GEMINI_API_KEY=AIyour-real-gemini-key-here
   
   # 智谱配置（可选）
   ZHIPU_API_KEY=your-real-zhipu-key-here
   ```

3. **重启开发服务器**
   ```bash
   npm run dev
   ```

### 方式二：UI界面配置

1. **启动项目**
   ```bash
   npm run dev
   ```

2. **打开浏览器**
   - 访问：http://localhost:3000

3. **配置API密钥**
   - 点击右上角的"未配置"按钮
   - 选择API提供商
   - 粘贴你的API密钥
   - 点击"保存"

## 💰 费用说明

### OpenAI定价（2024年）

| 模型 | 输入价格 | 输出价格 | 适用场景 |
|------|---------|---------|----------|
| GPT-3.5-turbo | $0.002/1K tokens | $0.002/1K tokens | 日常对话、简单分析 |
| GPT-4-turbo | $0.010/1K tokens | $0.030/1K tokens | 复杂推理、创作 |
| GPT-4o | $0.005/1K tokens | $0.015/1K tokens | 平衡性能与成本 |

### 使用量估算

- **轻度使用**（10次对话/天）：约$2-5/月
- **中度使用**（50次对话/天）：约$10-20/月  
- **重度使用**（200次对话/天）：约$40-80/月

### 免费替代方案

如果暂时无法充值，可以尝试：

1. **Gemini**：每月有免费配额
2. **Claude**：新用户有免费额度
3. **智谱清言**：国内用户友好，有免费tokens
4. **本地模型**：使用Ollama运行本地模型

## ❓ 常见问题

### Q1：为什么我的OpenAI API密钥不工作？

**A1：** 检查以下几点：
- 确保已充值至少$5到账户
- API密钥格式正确（以sk-开头）
- 没有超出使用限制
- 网络连接正常

### Q2：如何避免意外的高额费用？

**A2：** 设置使用限制：
- 在OpenAI控制台设置每月支出限制
- 定期检查使用情况
- 使用较便宜的模型（如GPT-3.5-turbo）

### Q3：国内用户如何使用OpenAI API？

**A3：** 可能需要：
- 使用VPN或代理
- 使用支持的付款方式
- 或选择国内替代方案（智谱、文心一言等）

### Q4：API密钥安全吗？

**A4：** 安全建议：
- 不要在代码中硬编码API密钥
- 使用环境变量存储
- 定期轮换API密钥
- 不要分享或上传到Git仓库

### Q5：如何测试API密钥是否有效？

**A5：** 项目内置验证功能：
1. 添加API密钥后，系统会自动验证
2. 绿色勾号 = 验证成功
3. 红色叉号 = 验证失败，检查密钥和网络

## 🆘 技术支持

如果遇到问题：

1. **检查控制台错误**：按F12查看浏览器控制台
2. **查看API状态**：访问对应API提供商的状态页面
3. **联系客服**：各API提供商都有客服支持
4. **社区求助**：在相关技术社区寻求帮助

---

💡 **小贴士**：建议从最便宜的GPT-3.5-turbo开始测试，确认功能正常后再升级到更强的模型。 