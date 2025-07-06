'use client'

import React, { useState, useEffect } from 'react'
import ModernSettingsDialog from '@/components/settings/ModernSettingsDialog'

export default function ClientStateWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Listen for global event to open settings
  useEffect(() => {
    const handleOpenSettings = () => setIsSettingsOpen(true)
    document.addEventListener('openSettings', handleOpenSettings)
    return () => {
      document.removeEventListener('openSettings', handleOpenSettings)
    }
  }, [])

  return (
    <>
      {children}
      
      {/* Render the settings dialog, managed by client-side state */}
      {mounted && (
        <ModernSettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  )
} 