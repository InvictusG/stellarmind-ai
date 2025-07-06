# API设置指南

## 🔧 修复"API配置失败"问题

### 问题分析

如果你看到"API配置失败"或"请先配置API密钥"的提示，这通常是由以下原因造成的：

1. **尚未添加API密钥**：项目初始状态下没有配置任何API密钥
2. **API密钥格式错误**：输入的密钥格式不正确
3. **网络连接问题**：验证API密钥时网络连接失败
4. **API提供商服务异常**：目标API服务暂时不可用

### 解决方案

#### 1. 添加API密钥

**方式一：通过UI界面配置**
1. 点击右上角的"未配置"按钮或设置图标
2. 选择你要使用的AI提供商（OpenAI、Claude、Gemini等）
3. 输入有效的API密钥
4. 点击"保存"按钮

**方式二：通过环境变量配置**
1. 在项目根目录创建 `.env.local` 文件
2. 添加你的API密钥：
```env
# OpenAI配置
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_BASE_URL=https://api.openai.com/v1

# 其他提供商（可选）
CLAUDE_API_KEY=sk-ant-your-claude-key-here
GEMINI_API_KEY=your-gemini-key-here
ZHIPU_API_KEY=your-zhipu-key-here
```
3. 重启开发服务器

#### 2. API密钥格式要求

**OpenAI**
- 格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- 长度：通常51个字符
- 获取：https://platform.openai.com/api-keys

**Claude (Anthropic)**
- 格式：`sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- 获取：https://console.anthropic.com/

**Google Gemini**
- 格式：`AIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- 获取：https://makersuite.google.com/app/apikey

**智谱清言**
- 格式：自定义格式
- 获取：https://open.bigmodel.cn/

#### 3. 验证API密钥

添加API密钥后，系统会自动验证：
- ✅ **验证成功**：密钥有效，可以正常使用
- ❌ **验证失败**：检查密钥格式、网络连接、账户余额

### 常见错误及解决方法

#### 错误1：认证失败（401）
```
认证失败，请检查API密钥是否正确
```
**解决方法**：
- 检查API密钥是否完整、正确
- 确认没有多余的空格或特殊字符
- 验证API密钥是否已过期

#### 错误2：权限不足（403）
```
API密钥权限不足
```
**解决方法**：
- 检查API密钥是否有相应的使用权限
- 确认账户余额是否充足
- 联系API提供商确认权限设置

#### 错误3：请求超时
```
请求超时，请检查网络连接
```
**解决方法**：
- 检查网络连接是否正常
- 尝试使用代理或VPN
- 稍后重试验证

#### 错误4：服务器错误（5xx）
```
API服务器错误，请稍后再试
```
**解决方法**：
- 等待一段时间后重试
- 查看API提供商的服务状态页面
- 尝试使用其他API提供商

### 快速测试

1. **本地测试**：
   - 打开浏览器访问 http://localhost:3000
   - 检查右上角API状态指示器
   - 绿色勾号 = 配置成功，黄色感叹号 = 需要配置

2. **功能测试**：
   - 输入一个简单问题（如"什么是人工智能？"）
   - 点击"探索"按钮
   - 查看是否正常生成思维导图

### 技术支持

如果按照上述步骤仍然无法解决问题，请：

1. 查看浏览器控制台的错误信息
2. 检查网络连接状态
3. 确认API提供商服务状态
4. 联系开发团队获取支持

---

💡 **提示**：推荐先使用OpenAI的API进行测试，它的兼容性和稳定性最好。 