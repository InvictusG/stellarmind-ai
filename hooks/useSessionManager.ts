'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMindMapStore } from '@/store/mindmapStore'
import { 
  SessionData,
  saveSessionLocally,
  getLocalSessions,
  getSessionById,
  deleteSessionLocally,
  setCurrentSession,
  getCurrentSessionId,
  searchSessions,
  filterSessionsByTags,
  getAllTags,
  exportSessions,
  importSessions,
  syncSessionToCloud
} from '@/lib/database'

/**
 * 会话管理自定义Hook
 * 提供会话的增删改查、搜索、导入导出等功能
 */
export function useSessionManager() {
  const store = useMindMapStore()
  const { 
    currentSessionId, 
    nodes, 
    edges, 
    config,
    createNewSession: storeCreateNewSession,
    loadSession: storeLoadSession,
    clearSession: storeClearSession
  } = store

  // ==================== 状态管理 ====================
  
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [currentSession, setCurrentSessionData] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // ==================== 初始化 ====================

  /**
   * 加载会话列表
   */
  const loadSessions = useCallback(() => {
    try {
      const localSessions = getLocalSessions()
      setSessions(localSessions)
      
      // 如果有当前会话ID，加载对应的会话数据
      const currentId = getCurrentSessionId()
      if (currentId && localSessions.length > 0) {
        const session = localSessions.find(s => s.id === currentId)
        if (session) {
          setCurrentSessionData(session)
        }
      }
    } catch (error) {
      console.error('加载会话列表失败:', error)
    }
  }, [])

  /**
   * 组件挂载时加载数据
   */
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  /**
   * 当store中的数据变化时，自动保存当前会话
   */
  useEffect(() => {
    if (currentSessionId && nodes.length > 0) {
      autoSaveCurrentSession()
    }
  }, [currentSessionId, nodes, edges, config])

  // ==================== 会话操作 ====================

  /**
   * 创建新会话
   */
  const createNewSession = useCallback(async (
    title: string,
    initialQuestion?: string,
    description?: string,
    tags: string[] = []
  ): Promise<SessionData> => {
    setIsLoading(true)
    
    try {
      // 生成会话ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // 创建会话数据
      const sessionData: SessionData = {
        id: sessionId,
        title,
        description,
        nodes: [],
        edges: [],
        config,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        tags,
        metadata: {
          viewCount: 0,
          likeCount: 0,
          bookmarked: false
        }
      }
      
      // 保存到本地存储
      saveSessionLocally(sessionData)
      
      // 更新状态
      setSessions(prev => [sessionData, ...prev])
      setCurrentSessionData(sessionData)
      setCurrentSession(sessionId)
      
      // 如果有初始问题，创建store会话
      if (initialQuestion) {
        storeCreateNewSession(initialQuestion)
      }
      
      return sessionData
    } catch (error) {
      console.error('创建会话失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [config, storeCreateNewSession])

  /**
   * 加载指定会话
   */
  const loadSession = useCallback(async (sessionId: string): Promise<void> => {
    setIsLoading(true)
    
    try {
      const sessionData = getSessionById(sessionId)
      if (!sessionData) {
        throw new Error('会话不存在')
      }
      
      // 更新当前会话
      setCurrentSessionData(sessionData)
      setCurrentSession(sessionId)
      
      // 加载到store
      storeLoadSession(sessionId)
      
      // 更新查看次数
      if (sessionData.metadata) {
        sessionData.metadata.viewCount += 1
        saveSessionLocally(sessionData)
        loadSessions() // 刷新列表
      }
    } catch (error) {
      console.error('加载会话失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [storeLoadSession, loadSessions])

  /**
   * 保存当前会话
   */
  const saveCurrentSession = useCallback(async (): Promise<void> => {
    if (!currentSessionId || !currentSession) return
    
    try {
      const updatedSession: SessionData = {
        ...currentSession,
        nodes,
        edges,
        config,
        updatedAt: new Date()
      }
      
      saveSessionLocally(updatedSession)
      setCurrentSessionData(updatedSession)
      loadSessions() // 刷新列表
      
      // 尝试同步到云端
      await syncSessionToCloud(updatedSession)
    } catch (error) {
      console.error('保存会话失败:', error)
    }
  }, [currentSessionId, currentSession, nodes, edges, config, loadSessions])

  /**
   * 自动保存当前会话
   */
  const autoSaveCurrentSession = useCallback(() => {
    if (currentSession && nodes.length > 0) {
      // 防抖保存，避免频繁操作
      setTimeout(saveCurrentSession, 1000)
    }
  }, [currentSession, nodes.length, saveCurrentSession])

  /**
   * 删除会话
   */
  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    setIsLoading(true)
    
    try {
      deleteSessionLocally(sessionId)
      setSessions(prev => prev.filter(session => session.id !== sessionId))
      
      // 如果删除的是当前会话，清空当前状态
      if (sessionId === currentSessionId) {
        setCurrentSessionData(null)
        setCurrentSession(null)
        storeClearSession()
      }
    } catch (error) {
      console.error('删除会话失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentSessionId, storeClearSession])

  /**
   * 复制会话
   */
  const duplicateSession = useCallback(async (sessionId: string): Promise<SessionData> => {
    const originalSession = getSessionById(sessionId)
    if (!originalSession) {
      throw new Error('会话不存在')
    }
    
    const newSession: SessionData = {
      ...originalSession,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `${originalSession.title} (副本)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        viewCount: 0,
        likeCount: 0,
        bookmarked: false
      }
    }
    
    saveSessionLocally(newSession)
    setSessions(prev => [newSession, ...prev])
    
    return newSession
  }, [])

  /**
   * 更新会话元数据
   */
  const updateSessionMetadata = useCallback(async (
    sessionId: string, 
    updates: Partial<Omit<SessionData, 'id' | 'nodes' | 'edges'>>
  ): Promise<void> => {
    const session = getSessionById(sessionId)
    if (!session) {
      throw new Error('会话不存在')
    }
    
    const updatedSession: SessionData = {
      ...session,
      ...updates,
      updatedAt: new Date()
    }
    
    saveSessionLocally(updatedSession)
    setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s))
    
    if (sessionId === currentSessionId) {
      setCurrentSessionData(updatedSession)
    }
  }, [currentSessionId])

  // ==================== 搜索和过滤 ====================

  /**
   * 搜索会话
   */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  /**
   * 设置标签过滤
   */
  const handleTagFilter = useCallback((tags: string[]) => {
    setSelectedTags(tags)
  }, [])

  /**
   * 获取过滤后的会话列表
   */
  const filteredSessions = useCallback(() => {
    let result = sessions
    
    // 按搜索查询过滤
    if (searchQuery.trim()) {
      result = searchSessions(searchQuery, result)
    }
    
    // 按标签过滤
    if (selectedTags.length > 0) {
      result = filterSessionsByTags(selectedTags, result)
    }
    
    // 按更新时间倒序排列
    return result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }, [sessions, searchQuery, selectedTags])

  // ==================== 导入导出 ====================

  /**
   * 导出会话
   */
  const exportSessionsData = useCallback((sessionIds?: string[]): string => {
    return exportSessions(sessionIds)
  }, [])

  /**
   * 导入会话
   */
  const importSessionsData = useCallback(async (data: string): Promise<number> => {
    const count = importSessions(data)
    loadSessions() // 刷新列表
    return count
  }, [loadSessions])

  // ==================== 统计信息 ====================

  /**
   * 获取会话统计信息
   */
  const getSessionStats = useCallback(() => {
    const totalSessions = sessions.length
    const totalNodes = sessions.reduce((sum, session) => sum + session.nodes.length, 0)
    const totalQuestions = sessions.reduce((sum, session) => 
      sum + session.nodes.filter(node => node.question).length, 0
    )
    const bookmarkedSessions = sessions.filter(session => session.metadata?.bookmarked).length
    
    return {
      totalSessions,
      totalNodes,
      totalQuestions,
      bookmarkedSessions,
      availableTags: getAllTags()
    }
  }, [sessions])

  // ==================== 返回接口 ====================

  return {
    // 状态
    sessions: filteredSessions(),
    currentSession,
    isLoading,
    searchQuery,
    selectedTags,
    
    // 会话操作
    createNewSession,
    loadSession,
    saveCurrentSession,
    deleteSession,
    duplicateSession,
    updateSessionMetadata,
    
    // 搜索和过滤
    handleSearch,
    handleTagFilter,
    availableTags: getAllTags(),
    
    // 导入导出
    exportSessionsData,
    importSessionsData,
    
    // 工具方法
    refreshSessions: loadSessions,
    getSessionStats,
    
    // 状态信息
    hasCurrentSession: !!currentSession,
    sessionCount: sessions.length,
  }
} 