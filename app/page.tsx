'use client'

import MindMapProvider from '@/components/mindmap/MindMapProvider'
import ModernAppLayout from '@/components/layout/ModernAppLayout'
import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from '@/components/auth/LoginForm'

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <div className="text-xl font-medium text-gray-700">正在加载...</div>
        </div>
      </div>
    )
  }

  // 未登录显示登录页面
  if (!isAuthenticated) {
    return <LoginForm />
  }

  // 已登录显示主应用
  return (
    <MindMapProvider>
      <ModernAppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              欢迎使用 StellarMind AI
            </h1>
            <p className="text-gray-600 mb-8">
              基于第一性原理的AI知识图谱平台
            </p>
            {/* 这里可以添加主要功能界面 */}
          </div>
        </div>
      </ModernAppLayout>
    </MindMapProvider>
  )
} 