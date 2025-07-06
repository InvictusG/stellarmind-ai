'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Menu,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAPIKey } from '@/hooks/useAPIKey'
import ModernSettingsDialog from '@/components/settings/ModernSettingsDialog'

interface ModernAppLayoutProps {
  children: React.ReactNode
}

export default function ModernAppLayout({ children }: ModernAppLayoutProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // 使用useAPIKey hook，但在未mounted时有fallback
  let hasValidKey = false
  let validKeyCount = 0
  
  try {
    const apiKeyData = useAPIKey()
    if (mounted) {
      hasValidKey = apiKeyData.hasValidKey
      validKeyCount = apiKeyData.validKeyCount
    }
  } catch (error) {
    // 忽略SSR错误
    console.log('SSR: useAPIKey hook not available yet')
  }

  // 标记组件已挂载
  useEffect(() => {
    setMounted(true)
  }, [])

  // 监听设置打开事件
  useEffect(() => {
    const handleOpenSettings = () => {
      console.log('收到openSettings事件')
      setIsSettingsOpen(true)
    }

    document.addEventListener('openSettings', handleOpenSettings)
    return () => {
      document.removeEventListener('openSettings', handleOpenSettings)
    }
  }, [])

  // 强制打开设置的函数
  const forceOpenSettings = () => {
    console.log('强制打开设置对话框')
    setIsSettingsOpen(true)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 简洁的头部导航 */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-gray-900 font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                StellarMind
              </span>
            </div>

            {/* 右侧操作区 */}
            <div className="flex items-center space-x-3">
              {/* API状态指示器 - 只在客户端挂载后显示 */}
              {mounted && (
                <button
                  onClick={forceOpenSettings}
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors text-sm"
                  title={hasValidKey ? `已配置 ${validKeyCount} 个API密钥` : '需要配置API密钥'}
                >
                  {hasValidKey ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {validKeyCount} API已配置
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        未配置API
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* 设置按钮 */}
              <button
                onClick={() => {
                  console.log('设置按钮被点击')
                  setIsSettingsOpen(true)
                }}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                title="设置"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main>
        {children}
      </main>

      {/* 设置对话框 */}
      {mounted && (
        <ModernSettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => {
            console.log('关闭设置对话框')
            setIsSettingsOpen(false)
          }}
        />
      )}

      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-50">
          设置状态: {isSettingsOpen ? '开启' : '关闭'} | 挂载: {mounted ? '是' : '否'}
        </div>
      )}
    </div>
  )
} 