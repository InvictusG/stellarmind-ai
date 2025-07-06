import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// import ModernAppLayout from '../components/layout/ModernAppLayout' // 彻底移除
import React, { useState, useEffect } from 'react' // 导入React Hooks
import ModernSettingsDialog from '@/components/settings/ModernSettingsDialog' // 导入设置对话框
import ClientStateWrapper from '@/components/layout/ClientStateWrapper' // 引入新的客户端包装器

// 配置Inter字体
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
})

// 页面元数据配置
export const metadata: Metadata = {
  title: 'StellarMind - The Observatory of Thought',
  description: 'From a single question, a universe of understanding.',
  keywords: ['AI', '思维导图', '问答', '递归探索', 'ChatGPT', '知识图谱'],
  authors: [{ name: 'AI思维导图探索器团队' }],
  robots: 'index, follow',
  openGraph: {
    title: 'AI思维导图探索器',
    description: '让AI帮你递归探索任何问题',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI思维导图探索器',
    description: '让AI帮你递归探索任何问题',
  },
}

// 单独的viewport配置
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

/**
 * 根布局组件
 * 提供全局的HTML结构、字体配置和主题支持
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 移除所有 state 和 effect
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 预连接到必要的外部资源以提升性能 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* 设置主题色 */}
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        
        {/* 设置图标 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body 
        className={`${inter.variable} font-sans antialiased min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
        suppressHydrationWarning
      >
        <ClientStateWrapper>
          {/* 恢复原状，不再需要 ModernAppLayout 或 Header 包装 */}
          {children}
        </ClientStateWrapper>
      </body>
    </html>
  )
} 