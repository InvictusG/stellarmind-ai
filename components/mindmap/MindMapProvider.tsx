'use client'

import React from 'react'
import { ReactFlowProvider } from 'reactflow'
import MindMapCanvas from './MindMapCanvas'

/**
 * 思维导图提供器组件
 * 包装React Flow Provider，为思维导图画布提供必要的上下文
 */
interface MindMapProviderProps {
  children?: React.ReactNode
}

export default function MindMapProvider({ children }: MindMapProviderProps) {
  return (
    <ReactFlowProvider>
      {children || <MindMapCanvas />}
    </ReactFlowProvider>
  )
} 