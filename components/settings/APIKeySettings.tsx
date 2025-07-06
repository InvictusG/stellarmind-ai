'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  Key, 
  Check, 
  X, 
  Loader2, 
  Plus, 
  Trash2, 
  Star,
  ChevronDown,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react'
import { useAPIKey } from '@/hooks/useAPIKey'
import { APIProvider, API_PROVIDERS, APIKeyConfig } from '@/utils/apiKeyManager'

/**
 * API KEY设置主组件
 * 采用简洁的Claude风格设计，支持多个提供商
 */
export default function APIKeySettings() {
  const {
    configs,
    currentConfig,
    isLoading,
    validationResults,
    hasValidKey,
    validKeyCount,
    addAPIKey,
    updateAPIKey,
    deleteAPIKey,
    setDefaultAPIKey,
    validateAPIKey,
    clearAllAPIKeys
  } = useAPIKey()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  /**
   * 如果没有任何配置，自动展开
   */
  useEffect(() => {
    if (configs.length === 0) {
      setIsExpanded(true)
      setShowAddForm(true)
    }
  }, [configs.length])

  return (
    <div className="space-y-4">
      {/* 设置标题和状态 */}
      <div 
        className="flex items-center justify-between p-4 bg-card border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Key className="w-5 h-5 text-muted-foreground" />
          <div>
            <h3 className="font-medium text-foreground">API密钥设置</h3>
            <p className="text-sm text-muted-foreground">
              {hasValidKey 
                ? `已配置 ${validKeyCount} 个有效密钥` 
                : '尚未配置API密钥'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasValidKey && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* 展开内容 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* 现有配置列表 */}
            {configs.length > 0 && (
              <div className="space-y-3">
                {configs.map((config) => (
                  <APIKeyCard
                    key={config.id}
                    config={config}
                    validationResult={validationResults[config.id]}
                    isLoading={isLoading}
                    onUpdate={updateAPIKey}
                    onDelete={deleteAPIKey}
                    onSetDefault={setDefaultAPIKey}
                    onValidate={validateAPIKey}
                  />
                ))}
              </div>
            )}

            {/* 添加新配置 */}
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
                className="w-full p-4 border-2 border-dashed border-border hover:border-primary/50 rounded-lg text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>添加API密钥</span>
              </button>
            )}

            {/* 操作按钮 */}
            {configs.length > 0 && (
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <button
                  onClick={clearAllAPIKeys}
                  className="text-sm text-destructive hover:text-destructive/80 transition-colors"
                >
                  清除所有配置
                </button>
                
                <div className="text-xs text-muted-foreground">
                  密钥仅保存在本地浏览器中
                </div>
              </div>
            )}

            {/* 帮助信息 */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• API密钥仅存储在本地浏览器中，不会上传到服务器</p>
                  <p>• 点击"验证"按钮可以测试密钥是否有效</p>
                  <p>• 标记为"默认"的密钥将用于新的AI对话</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * 单个API KEY配置卡片
 */
interface APIKeyCardProps {
  config: APIKeyConfig
  validationResult?: { isValid: boolean; message: string }
  isLoading: boolean
  onUpdate: (id: string, updates: Partial<APIKeyConfig>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onSetDefault: (id: string) => Promise<void>
  onValidate: (config: APIKeyConfig) => Promise<{ isValid: boolean; message: string }>
}

function APIKeyCard({ 
  config, 
  validationResult, 
  isLoading, 
  onUpdate, 
  onDelete, 
  onSetDefault, 
  onValidate 
}: APIKeyCardProps) {
  const [showKey, setShowKey] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(config.name)
  const [editBaseURL, setEditBaseURL] = useState(config.baseURL || '')
  const [editApiKey, setEditApiKey] = useState(config.apiKey)
  const [validating, setValidating] = useState(false)

  const provider = API_PROVIDERS[config.provider]

  /**
   * 处理验证
   */
  const handleValidate = async () => {
    setValidating(true)
    try {
      await onValidate(config)
    } finally {
      setValidating(false)
    }
  }

  /**
   * 保存编辑
   */
  const handleSaveEdit = async () => {
    if (editName.trim() && editApiKey.trim()) {
      await onUpdate(config.id, {
        name: editName.trim(),
        baseURL: editBaseURL.trim() || undefined,
        apiKey: editApiKey.trim()
      })
      setIsEditing(false)
    }
  }

  /**
   * 遮掩API KEY显示
   */
  const maskedKey = config.apiKey.length > 8 
    ? `${config.apiKey.substring(0, 4)}${'*'.repeat(config.apiKey.length - 8)}${config.apiKey.substring(config.apiKey.length - 4)}`
    : '*'.repeat(config.apiKey.length)

  return (
    <motion.div
      layout
      className="bg-card border border-border rounded-lg p-4 space-y-3"
    >
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{provider.icon}</span>
          <div>
            {isEditing ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="font-medium bg-background border border-border rounded px-2 py-1 text-sm"
                autoFocus
              />
            ) : (
              <h4 className="font-medium text-foreground">{config.name}</h4>
            )}
            <p className="text-xs text-muted-foreground">{provider.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {config.isDefault && (
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
          )}
          {validationResult && (
            validationResult.isValid ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <X className="w-4 h-4 text-red-500" />
            )
          )}
        </div>
      </div>

      {/* API KEY显示 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <input
              type="text"
              value={editApiKey}
              onChange={(e) => setEditApiKey(e.target.value)}
              className="flex-1 bg-background border border-border rounded px-3 py-2 font-mono text-sm"
              placeholder="输入API密钥"
            />
          ) : (
            <div className="flex-1 bg-muted rounded px-3 py-2 font-mono text-sm">
              {showKey ? config.apiKey : maskedKey}
            </div>
          )}
          {!isEditing && (
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-2 hover:bg-accent rounded transition-colors"
              title={showKey ? '隐藏密钥' : '显示密钥'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* 自定义Base URL */}
        {isEditing && (
          <input
            value={editBaseURL}
            onChange={(e) => setEditBaseURL(e.target.value)}
            placeholder="API Base URL（可选）"
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
          />
        )}

        {/* 验证结果 */}
        {validationResult && (
          <div className={`text-xs p-2 rounded ${
            validationResult.isValid 
              ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
          }`}>
            {validationResult.message}
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors flex items-center space-x-1"
              >
                <Check className="w-3 h-3" />
                <span>保存</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditName(config.name)
                  setEditBaseURL(config.baseURL || '')
                  setEditApiKey(config.apiKey)
                }}
                className="text-sm bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors flex items-center space-x-1"
              >
                <X className="w-3 h-3" />
                <span>取消</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleValidate}
                disabled={validating || isLoading}
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
              >
                {validating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                <span>验证</span>
              </button>
              
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 transition-colors flex items-center space-x-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>编辑</span>
              </button>
              
              {!config.isDefault && (
                <button
                  onClick={() => onSetDefault(config.id)}
                  className="text-sm bg-yellow-600 text-white px-3 py-1.5 rounded hover:bg-yellow-700 transition-colors flex items-center space-x-1"
                >
                  <Star className="w-3 h-3" />
                  <span>设为默认</span>
                </button>
              )}
            </>
          )}
        </div>
        
        <button
          onClick={() => onDelete(config.id)}
          className="text-sm bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors flex items-center space-x-1"
        >
          <Trash2 className="w-3 h-3" />
          <span>删除</span>
        </button>
      </div>
    </motion.div>
  )
}

/**
 * 添加API KEY表单
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

  const selectedProvider = API_PROVIDERS[provider]

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(
        provider,
        apiKey.trim(),
        baseURL.trim() || undefined,
        name.trim() || undefined
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-4 space-y-4"
      onSubmit={handleSubmit}
    >
      <h4 className="font-medium text-foreground">添加新的API密钥</h4>
      
      {/* 选择提供商 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">提供商</label>
        <select
          value={provider}
          onChange={(e) => {
            const newProvider = e.target.value as APIProvider
            setProvider(newProvider)
            setBaseURL(API_PROVIDERS[newProvider].baseURL)
          }}
          className="w-full bg-background border border-border rounded px-3 py-2"
        >
          {Object.entries(API_PROVIDERS).map(([key, config]) => (
            <option key={key} value={key}>
              {config.icon} {config.name}
            </option>
          ))}
        </select>
      </div>

      {/* API密钥输入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">API密钥</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setAPIKey(e.target.value)}
          placeholder={selectedProvider.placeholder}
          className="w-full bg-background border border-border rounded px-3 py-2 font-mono"
          required
        />
      </div>

      {/* 自定义名称 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">名称（可选）</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`我的${selectedProvider.name}`}
          className="w-full bg-background border border-border rounded px-3 py-2"
        />
      </div>

      {/* 自定义Base URL */}
      {provider === 'custom' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">API Base URL</label>
          <input
            type="url"
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
            placeholder="https://api.example.com/v1"
            className="w-full bg-background border border-border rounded px-3 py-2"
            required
          />
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!apiKey.trim() || isSubmitting}
          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
          <span>添加</span>
        </button>
      </div>
    </motion.form>
  )
} 