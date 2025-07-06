'use client'

import { useState, useCallback } from 'react'
import { SessionData } from '@/lib/database'

// ==================== 类型定义 ====================

interface ShareOptions {
  type: 'link' | 'image' | 'pdf' | 'json'
  isPublic: boolean
  includeMetadata: boolean
  permissions: 'view' | 'edit' | 'admin'
}

interface ShareResult {
  shareUrl: string
  shareId: string
  qrCode?: string
  expireAt?: Date
}

/**
 * 分享和收藏功能Hook
 */
export function useShare() {
  const [isSharing, setIsSharing] = useState(false)
  const [shareHistory, setShareHistory] = useState<ShareResult[]>([])

  // ==================== 分享功能 ====================

  /**
   * 分享会话链接
   */
  const shareSession = useCallback(async (
    session: SessionData, 
    options: ShareOptions
  ): Promise<ShareResult> => {
    setIsSharing(true)
    
    try {
      // 生成分享ID
      const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // 构建分享数据
      const shareData = {
        sessionId: session.id,
        title: session.title,
        description: session.description,
        nodes: session.nodes,
        edges: session.edges,
        config: session.config,
        shareId,
        createdAt: new Date(),
        shareOptions: options,
        metadata: options.includeMetadata ? session.metadata : undefined
      }
      
      // 发送到分享API
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      })
      
      if (!response.ok) {
        throw new Error('分享失败')
      }
      
      const result = await response.json()
      
      // 生成分享链接
      const shareUrl = `${window.location.origin}/share/${shareId}`
      
      const shareResult: ShareResult = {
        shareUrl,
        shareId,
        qrCode: result.qrCode,
        expireAt: result.expireAt ? new Date(result.expireAt) : undefined
      }
      
      // 保存到分享历史
      setShareHistory(prev => [shareResult, ...prev])
      
      return shareResult
    } catch (error) {
      console.error('分享失败:', error)
      throw error
    } finally {
      setIsSharing(false)
    }
  }, [])

  /**
   * 复制分享链接到剪贴板
   */
  const copyShareLink = useCallback(async (shareUrl: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      // 可以添加提示信息
    } catch (error) {
      console.error('复制到剪贴板失败:', error)
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }, [])

  /**
   * 生成分享二维码
   */
  const generateQRCode = useCallback(async (shareUrl: string): Promise<string> => {
    try {
      const response = await fetch('/api/qrcode/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: shareUrl }),
      })
      
      if (!response.ok) {
        throw new Error('生成二维码失败')
      }
      
      const { qrCode } = await response.json()
      return qrCode
    } catch (error) {
      console.error('生成二维码失败:', error)
      // 降级方案：使用第三方服务
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
    }
  }, [])

  /**
   * 分享到社交媒体
   */
  const shareToSocial = useCallback((
    platform: 'twitter' | 'facebook' | 'linkedin' | 'telegram',
    shareUrl: string,
    title: string,
    description?: string
  ): void => {
    const text = `${title}${description ? ` - ${description}` : ''}`
    
    let shareUrlFinal = ''
    
    switch (platform) {
      case 'twitter':
        shareUrlFinal = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'facebook':
        shareUrlFinal = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'linkedin':
        shareUrlFinal = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case 'telegram':
        shareUrlFinal = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`
        break
    }
    
    if (shareUrlFinal) {
      window.open(shareUrlFinal, '_blank', 'width=600,height=400')
    }
  }, [])

  // ==================== 收藏功能 ====================

  /**
   * 切换收藏状态
   */
  const toggleBookmark = useCallback(async (session: SessionData): Promise<boolean> => {
    try {
      const newBookmarkStatus = !session.metadata?.bookmarked
      
      const response = await fetch('/api/sessions/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          bookmarked: newBookmarkStatus
        }),
      })
      
      if (!response.ok) {
        throw new Error('更新收藏状态失败')
      }
      
      // 更新本地会话数据
      if (session.metadata) {
        session.metadata.bookmarked = newBookmarkStatus
      }
      
      return newBookmarkStatus
    } catch (error) {
      console.error('更新收藏状态失败:', error)
      throw error
    }
  }, [])

  /**
   * 批量管理收藏
   */
  const batchBookmark = useCallback(async (
    sessionIds: string[], 
    bookmarked: boolean
  ): Promise<void> => {
    try {
      const response = await fetch('/api/sessions/batch-bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionIds,
          bookmarked
        }),
      })
      
      if (!response.ok) {
        throw new Error('批量收藏操作失败')
      }
    } catch (error) {
      console.error('批量收藏操作失败:', error)
      throw error
    }
  }, [])

  // ==================== 获取分享信息 ====================

  /**
   * 获取分享链接信息
   */
  const getShareInfo = useCallback(async (shareId: string): Promise<SessionData | null> => {
    try {
      const response = await fetch(`/api/share/${shareId}`)
      
      if (!response.ok) {
        return null
      }
      
      return await response.json()
    } catch (error) {
      console.error('获取分享信息失败:', error)
      return null
    }
  }, [])

  /**
   * 获取用户的分享历史
   */
  const getShareHistory = useCallback(async (): Promise<ShareResult[]> => {
    try {
      const response = await fetch('/api/share/history')
      
      if (!response.ok) {
        throw new Error('获取分享历史失败')
      }
      
      const history = await response.json()
      setShareHistory(history)
      return history
    } catch (error) {
      console.error('获取分享历史失败:', error)
      return []
    }
  }, [])

  /**
   * 删除分享链接
   */
  const deleteShare = useCallback(async (shareId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/share/${shareId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('删除分享链接失败')
      }
      
      // 从本地历史中移除
      setShareHistory(prev => prev.filter(share => share.shareId !== shareId))
    } catch (error) {
      console.error('删除分享链接失败:', error)
      throw error
    }
  }, [])

  // ==================== 分享统计 ====================

  /**
   * 获取分享统计信息
   */
  const getShareStats = useCallback(async (shareId: string): Promise<{
    views: number
    clicks: number
    countries: string[]
    referrers: string[]
  }> => {
    try {
      const response = await fetch(`/api/share/${shareId}/stats`)
      
      if (!response.ok) {
        throw new Error('获取分享统计失败')
      }
      
      return await response.json()
    } catch (error) {
      console.error('获取分享统计失败:', error)
      return {
        views: 0,
        clicks: 0,
        countries: [],
        referrers: []
      }
    }
  }, [])

  return {
    // 状态
    isSharing,
    shareHistory,
    
    // 分享功能
    shareSession,
    copyShareLink,
    generateQRCode,
    shareToSocial,
    
    // 收藏功能
    toggleBookmark,
    batchBookmark,
    
    // 获取信息
    getShareInfo,
    getShareHistory,
    deleteShare,
    getShareStats,
  }
} 