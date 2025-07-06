'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSessionManager } from '@/hooks/useSessionManager'
import { useAuth } from '@/hooks/useAuth'
import { useShare } from '@/hooks/useShare'
import { useExport } from '@/hooks/useExport'
import { SessionData } from '@/lib/database'

// 图标组件
const IconSearch = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const IconFilter = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
)

const IconDownload = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const IconShare = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
)

const IconBookmark = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
)

const IconMore = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
)

/**
 * 会话卡片组件
 */
interface SessionCardProps {
  session: SessionData
  onLoad: (sessionId: string) => void
  onShare: (session: SessionData) => void
  onExport: (session: SessionData) => void
  onBookmark: (session: SessionData) => void
  onDelete: (sessionId: string) => void
}

function SessionCard({ 
  session, 
  onLoad, 
  onShare, 
  onExport, 
  onBookmark, 
  onDelete 
}: SessionCardProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-4">
        {/* 头部信息 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {session.title}
            </h3>
            {session.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {session.description}
              </p>
            )}
          </div>
          
          {/* 收藏状态 */}
          <button
            onClick={() => onBookmark(session)}
            className={`ml-2 p-1 rounded transition-colors ${
              session.metadata?.bookmarked 
                ? 'text-blue-600 hover:text-blue-700' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <IconBookmark />
          </button>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-500">
          <span>{session.nodes.length} 个节点</span>
          <span>查看 {session.metadata?.viewCount || 0} 次</span>
          <span>{new Date(session.updatedAt).toLocaleDateString('zh-CN')}</span>
        </div>

        {/* 标签 */}
        {session.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {session.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {session.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{session.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onLoad(session.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            打开会话
          </button>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <IconMore />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onShare(session)
                        setShowActions(false)
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <IconShare />
                      <span className="ml-2">分享会话</span>
                    </button>
                    <button
                      onClick={() => {
                        onExport(session)
                        setShowActions(false)
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <IconDownload />
                      <span className="ml-2">导出会话</span>
                    </button>
                    <button
                      onClick={() => {
                        onDelete(session.id)
                        setShowActions(false)
                      }}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <span className="ml-2">删除会话</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * 主仪表板组件
 */
export function SessionDashboard() {
  const { user, isAuthenticated } = useAuth()
  const sessionManager = useSessionManager()
  const shareManager = useShare()
  const exportManager = useExport()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null)

  // 过滤和搜索状态
  const [filterBookmarked, setFilterBookmarked] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string>('')

  // 处理分享
  const handleShare = async (session: SessionData) => {
    setSelectedSession(session)
    setShowShareDialog(true)
  }

  // 处理导出
  const handleExport = async (session: SessionData) => {
    setSelectedSession(session)
    setShowExportDialog(true)
  }

  // 处理收藏
  const handleBookmark = async (session: SessionData) => {
    try {
      await shareManager.toggleBookmark(session)
      sessionManager.refreshSessions()
    } catch (error) {
      console.error('收藏操作失败:', error)
    }
  }

  // 过滤会话
  const filteredSessions = sessionManager.sessions.filter(session => {
    if (filterBookmarked && !session.metadata?.bookmarked) return false
    if (selectedTag && !session.tags.includes(selectedTag)) return false
    return true
  })

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
          <p className="text-gray-600 mb-6">登录后可以查看和管理您的会话历史</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">会话管理</h1>
              <p className="text-gray-600 mt-2">
                管理您的思维导图会话，包括查看、分享、导出和收藏
              </p>
            </div>
            
            {/* 统计信息 */}
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {sessionManager.sessionCount}
              </div>
              <div className="text-sm text-gray-500">总会话数</div>
            </div>
          </div>
        </div>

        {/* 搜索和过滤栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconSearch />
              </div>
              <input
                type="text"
                placeholder="搜索会话..."
                value={sessionManager.searchQuery}
                onChange={(e) => sessionManager.handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 过滤选项 */}
            <div className="flex items-center space-x-4">
              {/* 标签过滤 */}
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">所有标签</option>
                {sessionManager.availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>

              {/* 收藏过滤 */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filterBookmarked}
                  onChange={(e) => setFilterBookmarked(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">仅显示收藏</span>
              </label>

              {/* 视图切换 */}
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  网格
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  列表
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 会话列表 */}
        {sessionManager.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">加载中...</span>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无会话</h3>
            <p className="text-gray-500">
              {sessionManager.searchQuery || selectedTag || filterBookmarked 
                ? '没有找到符合条件的会话' 
                : '开始创建您的第一个思维导图会话吧！'
              }
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            <AnimatePresence>
              {filteredSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onLoad={sessionManager.loadSession}
                  onShare={handleShare}
                  onExport={handleExport}
                  onBookmark={handleBookmark}
                  onDelete={sessionManager.deleteSession}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 导出对话框 */}
      {showExportDialog && selectedSession && (
        <ExportDialog
          session={selectedSession}
          isOpen={showExportDialog}
          onClose={() => {
            setShowExportDialog(false)
            setSelectedSession(null)
          }}
          exportManager={exportManager}
        />
      )}

      {/* 分享对话框 */}
      {showShareDialog && selectedSession && (
        <ShareDialog
          session={selectedSession}
          isOpen={showShareDialog}
          onClose={() => {
            setShowShareDialog(false)
            setSelectedSession(null)
          }}
          shareManager={shareManager}
        />
      )}
    </div>
  )
}

// 导出对话框组件（简化版，实际需要更详细的实现）
function ExportDialog({ 
  session, 
  isOpen, 
  onClose, 
  exportManager 
}: {
  session: SessionData
  isOpen: boolean
  onClose: () => void
  exportManager: ReturnType<typeof useExport>
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium mb-4">导出会话</h3>
        <div className="space-y-3">
          <button
            onClick={() => exportManager.exportAsPNG(session)}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            导出为 PNG 图片
          </button>
          <button
            onClick={() => exportManager.exportAsPDF(session)}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            导出为 PDF 文档
          </button>
          <button
            onClick={() => exportManager.exportAsJSON(session)}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            导出为 JSON 数据
          </button>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

// 分享对话框组件（简化版）
function ShareDialog({ 
  session, 
  isOpen, 
  onClose, 
  shareManager 
}: {
  session: SessionData
  isOpen: boolean
  onClose: () => void
  shareManager: ReturnType<typeof useShare>
}) {
  if (!isOpen) return null

  const handleShare = async () => {
    try {
      const result = await shareManager.shareSession(session, {
        type: 'link',
        isPublic: true,
        includeMetadata: false,
        permissions: 'view'
      })
      
      // 复制链接
      await shareManager.copyShareLink(result.shareUrl)
      alert('分享链接已复制到剪贴板！')
      onClose()
    } catch (error) {
      console.error('分享失败:', error)
      alert('分享失败，请稍后重试')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium mb-4">分享会话</h3>
        <p className="text-gray-600 mb-6">
          生成分享链接，其他人可以查看您的思维导图
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            生成分享链接
          </button>
        </div>
      </div>
    </div>
  )
} 