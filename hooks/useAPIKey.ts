'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  getAPIKeys, 
  addAPIKey, 
  updateAPIKey, 
  deleteAPIKey, 
  setDefaultAPIKey, 
  clearAllAPIKeys,
  updateLastUsed,
  validateAPIKey,
  type APIKeyConfig, 
  type APIProvider, 
  type ValidationResult,
  STORAGE_KEYS
} from '@/utils/apiKeyManager'

/**
 * API密钥管理Hook
 */
export function useAPIKey() {
  const [configs, setConfigs] = useState<APIKeyConfig[]>([])
  const [currentConfig, setCurrentConfig] = useState<APIKeyConfig | null>(null)
  const [defaultConfig, setDefaultConfig] = useState<APIKeyConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({})
  const [mounted, setMounted] = useState(false)

  // 刷新配置函数
  const refreshConfigs = useCallback(() => {
    console.log('🔄 refreshConfigs 被调用')
    
    if (typeof window === 'undefined') {
      console.log('🚫 非浏览器环境，跳过配置加载')
      return
    }

    try {
      const stored = getAPIKeys()
      console.log('📚 从localStorage读取配置:', stored.length, '个')
      
      setConfigs(stored)
      
      // 设置默认配置
      const defaultConf = stored.find((config: APIKeyConfig) => config.isDefault) || stored[0] || null
      setDefaultConfig(defaultConf)
      setCurrentConfig(defaultConf)
      
      console.log('🎯 设置默认配置:', defaultConf ? `${defaultConf.provider} (${defaultConf.name})` : '无')
      
    } catch (error) {
      console.error('❌ refreshConfigs 失败:', error)
      setConfigs([])
      setDefaultConfig(null)
      setCurrentConfig(null)
    }
  }, [])

  // 初始化加载
  useEffect(() => {
    console.log('🚀 useAPIKey 初始化')
    
    if (typeof window !== 'undefined') {
      // 设置mounted状态
      setMounted(true)
      console.log('✅ mounted 设置为 true')
      
      // 直接加载配置，避免循环依赖
      try {
        const stored = getAPIKeys()
        console.log('📚 从localStorage读取配置:', stored.length, '个')
        
        setConfigs(stored)
        
        // 设置默认配置
        const defaultConf = stored.find((config: APIKeyConfig) => config.isDefault) || stored[0] || null
        setDefaultConfig(defaultConf)
        setCurrentConfig(defaultConf)
        
        console.log('🎯 设置默认配置:', defaultConf ? `${defaultConf.provider} (${defaultConf.name})` : '无')
        
      } catch (error) {
        console.error('❌ 配置加载失败:', error)
        setConfigs([])
        setDefaultConfig(null)
        setCurrentConfig(null)
      }
      
      console.log('✅ 初始化完成')
    } else {
      console.log('⚠️ 服务端环境，跳过初始化')
    }
  }, [])

  // 监听 localStorage 变化
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 处理 storage 事件（跨标签页）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.API_KEYS) {
        console.log('📡 检测到其他标签页的配置变化')
        refreshConfigs()
      }
    }

    // 处理自定义事件（同一标签页）
    const handleLocalChange = () => {
      console.log('📡 检测到同一标签页的配置变化')
      refreshConfigs()
    }

    // 监听 storage 事件（跨标签页）
    window.addEventListener('storage', handleStorageChange)
    // 监听自定义事件（同一标签页）
    window.addEventListener('apiConfigUpdated', handleLocalChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('apiConfigUpdated', handleLocalChange)
    }
  }, [refreshConfigs])

  // 添加API KEY
  const handleAddAPIKey = useCallback(async (
    provider: APIProvider,
    apiKey: string,
    baseURL?: string,
    name?: string
  ): Promise<APIKeyConfig> => {
    try {
      const newConfig = addAPIKey(provider, apiKey, baseURL, name)
      refreshConfigs()
      
      // 自动验证新添加的 API KEY
      console.log('🔍 自动验证新添加的 API KEY...')
      setTimeout(async () => {
        try {
          const result = await validateAPIKey(newConfig)
          console.log('✅ 自动验证结果:', result)
          await updateAPIKey(newConfig.id, { isValid: result.isValid })
          refreshConfigs()
        } catch (error) {
          console.error('❌ 自动验证失败:', error)
        }
      }, 100) // 延迟一点确保配置已保存
      
      return newConfig
    } catch (error) {
      console.error('添加失败:', error)
      throw error
    }
  }, [refreshConfigs])

  // 更新API KEY
  const handleUpdateAPIKey = useCallback(async (
    id: string,
    updates: Partial<APIKeyConfig>
  ): Promise<void> => {
    try {
      updateAPIKey(id, updates)
      refreshConfigs()
    } catch (error) {
      console.error('更新失败:', error)
      throw error
    }
  }, [refreshConfigs])

  // 删除API KEY
  const handleDeleteAPIKey = useCallback(async (id: string): Promise<void> => {
    try {
      deleteAPIKey(id)
      refreshConfigs()
    } catch (error) {
      console.error('删除失败:', error)
      throw error
    }
  }, [refreshConfigs])

  // 设置默认
  const handleSetDefault = useCallback(async (id: string): Promise<void> => {
    try {
      setDefaultAPIKey(id)
      refreshConfigs()
    } catch (error) {
      console.error('设置默认失败:', error)
      throw error
    }
  }, [refreshConfigs])

  // 验证API KEY
  const handleValidateAPIKey = useCallback(async (config: APIKeyConfig): Promise<ValidationResult> => {
    setIsLoading(true)
    
    try {
      const result = await validateAPIKey(config)
      setValidationResults(prev => ({ ...prev, [config.id]: result }))
      await handleUpdateAPIKey(config.id, { isValid: result.isValid })
      return result
    } catch (error) {
      console.error('验证失败:', error)
      const errorResult: ValidationResult = { isValid: false, message: '验证失败' }
      setValidationResults(prev => ({ ...prev, [config.id]: errorResult }))
      return errorResult
    } finally {
      setIsLoading(false)
    }
  }, [handleUpdateAPIKey])

  // 批量验证
  const validateAllAPIKeys = useCallback(async (): Promise<void> => {
    if (configs.length === 0) return
    setIsLoading(true)
    
    try {
      const promises = configs.map((config: APIKeyConfig) => handleValidateAPIKey(config))
      await Promise.all(promises)
    } catch (error) {
      console.error('批量验证失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [configs, handleValidateAPIKey])

  // 清除所有
  const handleClearAll = useCallback(async (): Promise<void> => {
    try {
      clearAllAPIKeys()
      setConfigs([])
      setCurrentConfig(null)
      setDefaultConfig(null)
      setValidationResults({})
    } catch (error) {
      console.error('清除失败:', error)
      throw error
    }
  }, [])

  // 标记为已使用
  const markAsUsed = useCallback((id: string): void => {
    try {
      updateLastUsed(id)
      refreshConfigs()
    } catch (error) {
      console.error('更新使用时间失败:', error)
    }
  }, [refreshConfigs])

  // 计算属性
  const hasValidKey = mounted && configs.some((config: APIKeyConfig) => 
    config.apiKey && config.apiKey.trim().length > 0 && config.isValid === true
  )

  const validKeyCount = mounted ? configs.filter((config: APIKeyConfig) => 
    config.apiKey && config.apiKey.trim().length > 0 && config.isValid === true
  ).length : 0

  const getConfigsByProvider = useCallback((provider: APIProvider): APIKeyConfig[] => {
    return configs.filter((config: APIKeyConfig) => config.provider === provider)
  }, [configs])

  const validationStats = {
    total: configs.length,
    valid: configs.filter((c: APIKeyConfig) => c.isValid === true).length,
    invalid: configs.filter((c: APIKeyConfig) => c.isValid === false).length,
    unknown: configs.filter((c: APIKeyConfig) => c.isValid === undefined).length,
  }

  return {
    configs,
    currentConfig,
    isLoading,
    validationResults,
    mounted,
    hasValidKey,
    validKeyCount,
    validationStats,
    addAPIKey: handleAddAPIKey,
    updateAPIKey: handleUpdateAPIKey,
    deleteAPIKey: handleDeleteAPIKey,
    setDefaultAPIKey: handleSetDefault,
    validateAPIKey: handleValidateAPIKey,
    validateAllAPIKeys,
    clearAllAPIKeys: handleClearAll,
    markAsUsed,
    getConfigsByProvider,
    refreshConfigs,
    defaultConfig,
    setCurrentConfig,
  }
} 