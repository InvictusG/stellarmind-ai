/**
 * API KEY 管理工具
 * 提供本地存储、验证、类型管理等功能
 */

// ==================== 类型定义 ====================

/**
 * 支持的API提供商类型
 */
export type APIProvider = 'openai' | 'claude' | 'gemini' | 'zhipu' | 'deepseek' | 'custom'

/**
 * API KEY配置接口
 */
export interface APIKeyConfig {
  id: string                    // 配置ID
  provider: APIProvider         // 提供商类型
  name: string                 // 显示名称
  apiKey: string               // API密钥
  baseURL?: string             // 自定义API基础URL
  isDefault: boolean           // 是否为默认配置
  createdAt: Date             // 创建时间
  lastUsed?: Date             // 最后使用时间
  isValid?: boolean           // 验证状态
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean             // 是否有效
  message: string             // 结果消息
  details?: any               // 详细信息
}

// ==================== 常量配置 ====================

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  API_KEYS: 'whybot_api_keys',
  DEFAULT_KEY: 'whybot_default_api_key'
} as const

/**
 * API提供商配置
 */
export const API_PROVIDERS: Record<APIProvider, {
  name: string
  icon: string
  baseURL: string
  placeholder: string
  testEndpoint: string
}> = {
  openai: {
    name: 'OpenAI',
    icon: '🤖',
    baseURL: 'https://api.openai.com/v1',
    placeholder: 'sk-...',
    testEndpoint: '/models'
  },
  claude: {
    name: 'Claude (Anthropic)',
    icon: '🎭',
    baseURL: 'https://api.anthropic.com/v1',
    placeholder: 'sk-ant-...',
    testEndpoint: '/messages'
  },
  gemini: {
    name: 'Google Gemini',
    icon: '💎',
    baseURL: 'https://generativelanguage.googleapis.com/v1',
    placeholder: 'AI...',
    testEndpoint: '/models'
  },
  zhipu: {
    name: '智谱清言',
    icon: '🧠',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    placeholder: '...',
    testEndpoint: '/chat/completions'
  },
  deepseek: {
    name: 'DeepSeek',
    icon: '🔍',
    baseURL: 'https://api.deepseek.com/v1',
    placeholder: 'sk-...',
    testEndpoint: '/models'
  },
  custom: {
    name: '自定义',
    icon: '⚙️',
    baseURL: '',
    placeholder: '自定义API密钥',
    testEndpoint: '/models'
  }
}

// ==================== 工具函数 ====================

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 序列化日期对象
 */
function serializeConfig(config: APIKeyConfig): any {
  return {
    ...config,
    createdAt: config.createdAt.toISOString(),
    lastUsed: config.lastUsed?.toISOString()
  }
}

/**
 * 反序列化日期对象
 */
function deserializeConfig(data: any): APIKeyConfig {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    lastUsed: data.lastUsed ? new Date(data.lastUsed) : undefined
  }
}

/**
 * 检查是否在浏览器环境
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

// ==================== 本地存储操作 ====================

/**
 * 获取所有API KEY配置
 */
export function getAPIKeys(): APIKeyConfig[] {
  try {
    if (!isBrowser()) return []
    
    const stored = localStorage.getItem(STORAGE_KEYS.API_KEYS)
    if (!stored) return []
    
    const configs = JSON.parse(stored)
    return configs.map(deserializeConfig)
  } catch (error) {
    console.error('获取API KEY配置失败:', error)
    return []
  }
}

/**
 * 保存API KEY配置到本地存储
 */
function saveAPIKeys(configs: APIKeyConfig[]): void {
  if (!isBrowser()) return
  
  try {
    const serialized = configs.map(serializeConfig)
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(serialized))
    
    // 触发自定义事件，通知同一标签页的其他组件
    window.dispatchEvent(new Event('apiConfigUpdated'))
    
    console.log('API KEY配置已保存')
  } catch (error) {
    console.error('保存API KEY配置失败:', error)
    throw new Error('保存配置失败')
  }
}

/**
 * 获取默认API KEY配置
 */
export function getDefaultAPIKey(): APIKeyConfig | null {
  if (!isBrowser()) return null
  
  const configs = getAPIKeys()
  return configs.find(config => config.isDefault) || configs[0] || null
}

/**
 * 设置默认API KEY
 */
export function setDefaultAPIKey(id: string): void {
  const configs = getAPIKeys()
  
  // 清除所有默认标记
  configs.forEach(config => {
    config.isDefault = false
  })
  
  // 设置新的默认配置
  const targetConfig = configs.find(config => config.id === id)
  if (targetConfig) {
    targetConfig.isDefault = true
    saveAPIKeys(configs)
  } else {
    throw new Error('找不到指定的API KEY配置')
  }
}

// ==================== CRUD 操作 ====================

/**
 * 添加新的API KEY配置
 */
export function addAPIKey(
  provider: APIProvider,
  apiKey: string,
  baseURL?: string,
  name?: string
): APIKeyConfig {
  const configs = getAPIKeys()
  
  // 生成配置名称
  const providerConfig = API_PROVIDERS[provider]
  const configName = name || `${providerConfig.name} (${new Date().toLocaleDateString()})`
  
  // 创建新配置
  const newConfig: APIKeyConfig = {
    id: generateId(),
    provider,
    name: configName,
    apiKey: apiKey.trim(),
    baseURL: baseURL?.trim() || providerConfig.baseURL,
    isDefault: configs.length === 0, // 第一个配置自动设为默认
    createdAt: new Date()
  }
  
  // 添加到配置列表
  configs.push(newConfig)
  saveAPIKeys(configs)
  
  return newConfig
}

/**
 * 更新API KEY配置
 */
export function updateAPIKey(id: string, updates: Partial<APIKeyConfig>): void {
  const configs = getAPIKeys()
  const configIndex = configs.findIndex(config => config.id === id)
  
  if (configIndex === -1) {
    throw new Error('找不到指定的API KEY配置')
  }
  
  // 更新配置
  configs[configIndex] = {
    ...configs[configIndex],
    ...updates,
    id, // 确保ID不被更改
    lastUsed: new Date() // 更新最后使用时间
  }
  
  saveAPIKeys(configs)
}

/**
 * 删除API KEY配置
 */
export function deleteAPIKey(id: string): void {
  const configs = getAPIKeys()
  const configIndex = configs.findIndex(config => config.id === id)
  
  if (configIndex === -1) {
    throw new Error('找不到指定的API KEY配置')
  }
  
  const deletedConfig = configs[configIndex]
  configs.splice(configIndex, 1)
  
  // 如果删除的是默认配置，将第一个配置设为默认
  if (deletedConfig.isDefault && configs.length > 0) {
    configs[0].isDefault = true
  }
  
  saveAPIKeys(configs)
}

/**
 * 清除所有API KEY配置
 */
export function clearAllAPIKeys(): void {
  try {
    if (!isBrowser()) return
    
    localStorage.removeItem(STORAGE_KEYS.API_KEYS)
    localStorage.removeItem(STORAGE_KEYS.DEFAULT_KEY)
  } catch (error) {
    console.error('清除API KEY配置失败:', error)
    throw new Error('清除配置失败')
  }
}

/**
 * 更新最后使用时间
 */
export function updateLastUsed(id: string): void {
  const configs = getAPIKeys()
  const config = configs.find(config => config.id === id)
  
  if (config) {
    config.lastUsed = new Date()
    saveAPIKeys(configs)
  }
}

// ==================== 验证功能 ====================

/**
 * 验证API KEY是否有效
 */
export async function validateAPIKey(config: APIKeyConfig): Promise<ValidationResult> {
  try {
    const providerConfig = API_PROVIDERS[config.provider]
    const baseURL = config.baseURL || providerConfig.baseURL
    
    // 构造测试请求
    const testURL = `${baseURL}${providerConfig.testEndpoint}`
    
    // 根据不同提供商构造不同的请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    switch (config.provider) {
      case 'openai':
        headers['Authorization'] = `Bearer ${config.apiKey}`
        break
      case 'claude':
        headers['x-api-key'] = config.apiKey
        headers['anthropic-version'] = '2023-06-01'
        break
      case 'gemini':
        headers['Authorization'] = `Bearer ${config.apiKey}`
        break
      case 'zhipu':
        headers['Authorization'] = `Bearer ${config.apiKey}`
        break
      case 'deepseek':
        headers['Authorization'] = `Bearer ${config.apiKey}`
        break
      case 'custom':
        headers['Authorization'] = `Bearer ${config.apiKey}`
        break
    }
    
    // 发送测试请求
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时
    
    try {
      const response = await fetch(testURL, {
        method: 'GET',
        headers,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        return {
          isValid: true,
          message: 'API密钥验证成功'
        }
      } else {
        let errorMessage = '无效的API密钥'
        
        if (response.status === 401) {
          errorMessage = '认证失败，请检查API密钥是否正确'
        } else if (response.status === 403) {
          errorMessage = 'API密钥权限不足'
        } else if (response.status === 429) {
          errorMessage = 'API请求频率过高，请稍后再试'
        } else if (response.status >= 500) {
          errorMessage = 'API服务器错误，请稍后再试'
        }
        
        return {
          isValid: false,
          message: errorMessage,
          details: {
            status: response.status,
            statusText: response.statusText
          }
        }
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          isValid: false,
          message: '请求超时，请检查网络连接'
        }
      }
      
      throw error // 重新抛出其他错误，让外层catch处理
    }
  } catch (error) {
    console.error('验证API KEY失败:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        isValid: false,
        message: '网络连接失败，请检查网络设置'
      }
    }
    
    return {
      isValid: false,
      message: '验证过程中发生未知错误'
    }
  }
}

// ==================== 实用功能 ====================

/**
 * 检查是否有有效的API KEY
 */
export function hasValidAPIKey(): boolean {
  if (!isBrowser()) return false
  
  const configs = getAPIKeys()
  return configs.some(config => config.isValid === true)
}

/**
 * 获取指定提供商的配置
 */
export function getAPIKeysByProvider(provider: APIProvider): APIKeyConfig[] {
  const configs = getAPIKeys()
  return configs.filter(config => config.provider === provider)
}

/**
 * 根据ID获取配置
 */
export function getAPIKeyById(id: string): APIKeyConfig | null {
  const configs = getAPIKeys()
  return configs.find(config => config.id === id) || null
}

/**
 * 导出配置（用于备份）
 */
export function exportConfigs(): string {
  const configs = getAPIKeys()
  return JSON.stringify(configs.map(serializeConfig), null, 2)
}

/**
 * 导入配置（用于恢复）
 */
export function importConfigs(data: string): number {
  try {
    const importedConfigs = JSON.parse(data)
    const validConfigs = importedConfigs
      .map(deserializeConfig)
      .filter((config: APIKeyConfig) => 
        config.id && config.provider && config.apiKey
      )
    
    if (validConfigs.length === 0) {
      throw new Error('没有找到有效的配置数据')
    }
    
    // 合并到现有配置
    const existingConfigs = getAPIKeys()
    const mergedConfigs = [...existingConfigs, ...validConfigs]
    
    saveAPIKeys(mergedConfigs)
    return validConfigs.length
  } catch (error) {
    console.error('导入配置失败:', error)
    throw new Error('导入配置数据格式错误')
  }
} 