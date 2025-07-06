'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Settings, 
  Key, 
  Palette, 
  Zap, 
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  Shield
} from 'lucide-react'
import { useAPIKey } from '@/hooks/useAPIKey'
import { APIProvider, API_PROVIDERS } from '@/utils/apiKeyManager'

/**
 * 现代化设置对话框组件
 */
interface ModernSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

type SettingsTab = 'api' | 'appearance' | 'advanced' | 'help'

export default function ModernSettingsDialog({ isOpen, onClose }: ModernSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('api')
  const [mounted, setMounted] = useState(false)
  
  // 只在客户端挂载后才使用useAPIKey
  const apiKeyData = useAPIKey()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // 在未挂载时显示加载状态
  if (!mounted) {
    return null
  }

  const {
    configs,
    hasValidKey,
    validKeyCount,
    addAPIKey,
    deleteAPIKey,
    setDefaultAPIKey,
    validateAPIKey
  } = apiKeyData

  const tabs = [
    {
      id: 'api' as SettingsTab,
      name: 'API密钥',
      icon: Key,
      badge: hasValidKey ? `${validKeyCount}` : undefined,
    },
    {
      id: 'appearance' as SettingsTab,
      name: '外观',
      icon: Palette,
    },
    {
      id: 'advanced' as SettingsTab,
      name: '高级',
      icon: Zap,
    },
    {
      id: 'help' as SettingsTab,
      name: '帮助',
      icon: HelpCircle,
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  设置
                </h2>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex h-[calc(85vh-88px)]">
              {/* 左侧导航 */}
              <div className="w-60 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <nav className="p-4 space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{tab.name}</span>
                        {tab.badge && (
                          <span className="ml-auto px-2 py-1 text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* 右侧内容 */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {activeTab === 'api' && <APIKeyPanel />}
                  {activeTab === 'appearance' && <AppearancePanel />}
                  {activeTab === 'advanced' && <AdvancedPanel />}
                  {activeTab === 'help' && <HelpPanel />}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * API密钥配置面板
 */
function APIKeyPanel() {
  const { configs, addAPIKey, deleteAPIKey, setDefaultAPIKey, validateAPIKey } = useAPIKey()
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* 面板标题 */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          API密钥管理
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          配置AI服务提供商的API密钥，支持多个平台同时使用。
        </p>
      </div>

      {/* 状态概览 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div className="text-2xl font-semibold text-slate-900 dark:text-white">
            {configs.length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            已配置密钥
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div className="text-2xl font-semibold text-slate-900 dark:text-white">
            {configs.filter(c => c.isValid).length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            验证通过
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div className="text-2xl font-semibold text-slate-900 dark:text-white">
            {configs.filter(c => c.isDefault).length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            默认配置
          </div>
        </div>
      </div>

      {/* API密钥列表 */}
      <div className="space-y-3">
        {configs.map((config) => (
          <APIKeyCard
            key={config.id}
            config={config}
            onDelete={deleteAPIKey}
            onSetDefault={setDefaultAPIKey}
            onValidate={validateAPIKey}
          />
        ))}
      </div>

      {/* 添加新密钥 */}
      {showAddForm ? (
        <AddAPIKeyForm
          onSubmit={async (provider, apiKey, baseURL, name) => {
            await addAPIKey(provider, apiKey, baseURL, name)
            setShowAddForm(false)
          }}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>添加新的API密钥</span>
        </button>
      )}

      {/* 安全提示 */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <p className="font-medium text-slate-900 dark:text-white mb-1">安全提示</p>
            <p>API密钥仅存储在本地浏览器中，不会上传到服务器。请定期检查使用情况和余额。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * API密钥卡片组件
 */
interface APIKeyCardProps {
  config: any
  onDelete: (id: string) => Promise<void>
  onSetDefault: (id: string) => Promise<void>
  onValidate: (config: any) => Promise<any>
}

function APIKeyCard({ config, onDelete, onSetDefault, onValidate }: APIKeyCardProps) {
  const [showKey, setShowKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const provider = API_PROVIDERS[config.provider as APIProvider]

  const handleValidate = async () => {
    setIsValidating(true)
    try {
      await onValidate(config)
    } finally {
      setIsValidating(false)
    }
  }

  const maskedKey = config.apiKey.length > 8 
    ? `${config.apiKey.substring(0, 4)}${'*'.repeat(config.apiKey.length - 8)}${config.apiKey.substring(config.apiKey.length - 4)}`
    : '*'.repeat(config.apiKey.length)

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{provider.icon}</div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-slate-900 dark:text-white">
                {config.name}
              </h4>
              {config.isDefault && (
                <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                  默认
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {provider.name} • 创建于 {new Date(config.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center space-x-2">
          {config.isValid === true && (
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">已验证</span>
            </div>
          )}
          {config.isValid === false && (
            <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">验证失败</span>
            </div>
          )}
        </div>
      </div>

      {/* API密钥显示 */}
      <div className="mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2 font-mono text-sm">
            {showKey ? config.apiKey : maskedKey}
          </div>
          <button
            onClick={() => setShowKey(!showKey)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={showKey ? '隐藏密钥' : '显示密钥'}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(config.apiKey)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="复制密钥"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleValidate}
            disabled={isValidating}
            className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {isValidating ? '验证中...' : '验证'}
          </button>
          
          {!config.isDefault && (
            <button
              onClick={() => onSetDefault(config.id)}
              className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              设为默认
            </button>
          )}
        </div>

        <button
          onClick={() => onDelete(config.id)}
          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
          title="删除密钥"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/**
 * 添加API密钥表单
 */
interface AddAPIKeyFormProps {
  onSubmit: (provider: APIProvider, apiKey: string, baseURL?: string, name?: string) => Promise<void>
  onCancel: () => void
}

function AddAPIKeyForm({ onSubmit, onCancel }: AddAPIKeyFormProps) {
  const [provider, setProvider] = useState<APIProvider>('openai')
  const [apiKey, setAPIKey] = useState('')
  const [baseURL, setBaseURL] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCustomURL, setShowCustomURL] = useState(false)

  const selectedProvider = API_PROVIDERS[provider]

  // 需要显示自定义URL输入的提供商
  const needsCustomURL = provider === 'custom' || provider === 'deepseek'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(
        provider,
        apiKey.trim(),
        (needsCustomURL || showCustomURL) ? baseURL.trim() || selectedProvider.baseURL : selectedProvider.baseURL,
        name.trim() || undefined
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-medium text-slate-900 dark:text-white">
          添加新的API密钥
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 提供商选择 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            选择AI提供商
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(API_PROVIDERS).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setProvider(key as APIProvider)
                  setBaseURL(config.baseURL)
                  if (key === 'custom' || key === 'deepseek') {
                    setShowCustomURL(true)
                  } else {
                    setShowCustomURL(false)
                  }
                }}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  provider === key
                    ? 'border-slate-400 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <div className="font-medium">{config.name}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* API密钥输入 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            API密钥
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setAPIKey(e.target.value)}
            placeholder={`输入你的${selectedProvider.name} API密钥`}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            required
          />
        </div>

        {/* 自定义URL输入 - 仅在特定提供商或手动开启时显示 */}
        {(needsCustomURL || showCustomURL) && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              自定义API基础URL
              {provider === 'deepseek' && (
                <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">
                  (DeepSeek必需)
                </span>
              )}
            </label>
            <input
              type="url"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder={provider === 'deepseek' ? 'https://api.deepseek.com/v1' : '输入API基础URL'}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              required={needsCustomURL}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              例如: https://api.deepseek.com/v1 或其他兼容的API地址
            </p>
          </div>
        )}

        {/* 显示/隐藏自定义URL选项 */}
        {!needsCustomURL && (
          <div>
            <button
              type="button"
              onClick={() => setShowCustomURL(!showCustomURL)}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline"
            >
              {showCustomURL ? '隐藏自定义URL' : '使用自定义API URL'}
            </button>
          </div>
        )}

        {/* 自定义名称 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            自定义名称（可选）
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="为这个配置起个名字"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!apiKey.trim() || isSubmitting || (needsCustomURL && !baseURL.trim())}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>添加中...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>添加密钥</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

/**
 * 外观设置面板
 */
function AppearancePanel() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          外观设置
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          自定义应用的外观和主题偏好。
        </p>
      </div>
      
      <div className="text-center py-12">
        <Palette className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">外观设置功能开发中...</p>
      </div>
    </div>
  )
}

/**
 * 高级设置面板
 */
function AdvancedPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          高级设置
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          调整应用的性能和行为参数。
        </p>
      </div>
      
      <div className="text-center py-12">
        <Zap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">高级设置功能开发中...</p>
      </div>
    </div>
  )
}

/**
 * 帮助支持面板
 */
function HelpPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          帮助与支持
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          获取使用指南和技术支持。
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="font-medium text-slate-900 dark:text-white mb-2">
            快速入门
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            了解如何使用StellarMind AI进行思维导图探索
          </p>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="font-medium text-slate-900 dark:text-white mb-2">
            API配置指南
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            详细的API密钥获取和配置说明
          </p>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="font-medium text-slate-900 dark:text-white mb-2">
            技术支持
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            遇到问题？我们来帮助你
          </p>
        </div>
      </div>

      {/* 版本信息 */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
        <div className="text-slate-600 dark:text-slate-400 text-sm">
                          StellarMind AI v1.0.0 - AI知识图谱平台
        </div>
      </div>
    </div>
  )
} 