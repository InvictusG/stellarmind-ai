'use client'

import React, { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import ModernSettingsDialog from '@/components/settings/ModernSettingsDialog'
// import { MainNav } from "@/components/layout/main-nav";
// import { MobileNav } from "@/components/layout/mobile-nav";
// import { ModeToggle } from "@/components/layout/mode-toggle";
// import { UserNav } from "@/components/layout/user-nav";
import { ModelSelector } from "@/components/layout/ModelSelector";

export default function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* The ModelSelector is placed right after the title */}
            <h1 className="text-xl font-bold text-white">StellarMind</h1>
            <ModelSelector />
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              title="设置"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 设置对话框 */}
      {mounted && (
        <ModernSettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  )
} 