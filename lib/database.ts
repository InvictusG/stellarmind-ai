/**
 * 数据库操作工具
 * 支持本地存储和云端同步的会话历史管理
 */

import { MindMapNode, MindMapEdge, ExploreConfig } from '@/types'

// ==================== 类型定义 ====================

/**
 * 会话数据结构
 */
export interface SessionData {
  id: string
  title: string
  description?: string
  nodes: MindMapNode[]
  edges: MindMapEdge[]
  config: ExploreConfig
  createdAt: Date
  updatedAt: Date
  userId?: string
  isPublic: boolean
  tags: string[]
  metadata?: {
    viewCount: number
    likeCount: number
    bookmarked: boolean
  }
}

/**
 * 用户数据结构
 */
export interface UserData {
  id: string
  email?: string
  name?: string
  avatar?: string
  createdAt: Date
  lastLoginAt: Date
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    defaultConfig: ExploreConfig
  }
}

// ==================== 本地存储操作 ====================

const STORAGE_KEYS = {
  SESSIONS: 'whybot_sessions',
  USER_DATA: 'whybot_user_data',
  CURRENT_SESSION: 'whybot_current_session'
} as const

/**
 * 序列化数据
 */
function serializeData<T>(data: T): string {
  return JSON.stringify(data, (key, value) => {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() }
    }
    return value
  })
}

/**
 * 反序列化数据
 */
function deserializeData<T>(data: string): T {
  return JSON.parse(data, (key, value) => {
    if (value && typeof value === 'object' && value.__type === 'Date') {
      return new Date(value.value)
    }
    return value
  })
}

/**
 * 保存会话到本地存储
 */
export function saveSessionLocally(session: SessionData): void {
  try {
    const sessions = getLocalSessions()
    const existingIndex = sessions.findIndex(s => s.id === session.id)
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = { ...session, updatedAt: new Date() }
    } else {
      sessions.push(session)
    }
    
    localStorage.setItem(STORAGE_KEYS.SESSIONS, serializeData(sessions))
  } catch (error) {
    console.error('保存会话失败:', error)
    throw new Error('会话保存失败')
  }
}

/**
 * 从本地存储获取所有会话
 */
export function getLocalSessions(): SessionData[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS)
    return stored ? deserializeData<SessionData[]>(stored) : []
  } catch (error) {
    console.error('获取会话列表失败:', error)
    return []
  }
}

/**
 * 根据ID获取会话
 */
export function getSessionById(id: string): SessionData | null {
  const sessions = getLocalSessions()
  return sessions.find(session => session.id === id) || null
}

/**
 * 删除会话
 */
export function deleteSessionLocally(id: string): void {
  try {
    const sessions = getLocalSessions()
    const filteredSessions = sessions.filter(session => session.id !== id)
    localStorage.setItem(STORAGE_KEYS.SESSIONS, serializeData(filteredSessions))
  } catch (error) {
    console.error('删除会话失败:', error)
    throw new Error('删除会话失败')
  }
}

/**
 * 设置当前活跃会话
 */
export function setCurrentSession(sessionId: string | null): void {
  try {
    if (sessionId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId)
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION)
    }
  } catch (error) {
    console.error('设置当前会话失败:', error)
  }
}

/**
 * 获取当前活跃会话ID
 */
export function getCurrentSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION)
  } catch (error) {
    console.error('获取当前会话失败:', error)
    return null
  }
}

// ==================== 云端同步操作 ====================

/**
 * 同步会话到云端
 */
export async function syncSessionToCloud(session: SessionData): Promise<void> {
  try {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    })
    
    if (!response.ok) {
      throw new Error('云端同步失败')
    }
  } catch (error) {
    console.error('云端同步失败:', error)
    // 云端同步失败时，仍然保存到本地
    saveSessionLocally(session)
  }
}

/**
 * 从云端获取会话列表
 */
export async function getCloudSessions(): Promise<SessionData[]> {
  try {
    const response = await fetch('/api/sessions')
    
    if (!response.ok) {
      throw new Error('获取云端会话失败')
    }
    
    const data = await response.json()
    return data.sessions || []
  } catch (error) {
    console.error('获取云端会话失败:', error)
    // 失败时返回本地会话
    return getLocalSessions()
  }
}

// ==================== 用户数据操作 ====================

/**
 * 保存用户数据
 */
export function saveUserData(userData: UserData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, serializeData(userData))
  } catch (error) {
    console.error('保存用户数据失败:', error)
  }
}

/**
 * 获取用户数据
 */
export function getUserData(): UserData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA)
    return stored ? deserializeData<UserData>(stored) : null
  } catch (error) {
    console.error('获取用户数据失败:', error)
    return null
  }
}

/**
 * 清除用户数据
 */
export function clearUserData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION)
  } catch (error) {
    console.error('清除用户数据失败:', error)
  }
}

// ==================== 搜索和过滤 ====================

/**
 * 搜索会话
 */
export function searchSessions(query: string, sessions?: SessionData[]): SessionData[] {
  const sessionList = sessions || getLocalSessions()
  const searchTerm = query.toLowerCase()
  
  return sessionList.filter(session => 
    session.title.toLowerCase().includes(searchTerm) ||
    session.description?.toLowerCase().includes(searchTerm) ||
    session.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    session.nodes.some(node => 
      node.question.toLowerCase().includes(searchTerm) ||
      node.answer.toLowerCase().includes(searchTerm)
    )
  )
}

/**
 * 按标签过滤会话
 */
export function filterSessionsByTags(tags: string[], sessions?: SessionData[]): SessionData[] {
  const sessionList = sessions || getLocalSessions()
  
  return sessionList.filter(session =>
    tags.some(tag => session.tags.includes(tag))
  )
}

/**
 * 获取所有使用过的标签
 */
export function getAllTags(): string[] {
  const sessions = getLocalSessions()
  const allTags = sessions.flatMap(session => session.tags)
  return Array.from(new Set(allTags)).sort()
}

// ==================== 导入导出 ====================

/**
 * 导出会话数据
 */
export function exportSessions(sessionIds?: string[]): string {
  const sessions = getLocalSessions()
  const exportData = sessionIds 
    ? sessions.filter(session => sessionIds.includes(session.id))
    : sessions
  
  return serializeData({
    version: '1.0',
    exportDate: new Date(),
    sessions: exportData
  })
}

/**
 * 导入会话数据
 */
export function importSessions(data: string): number {
  try {
    const importData = deserializeData<{
      version: string
      exportDate: Date
      sessions: SessionData[]
    }>(data)
    
    if (!importData.sessions || !Array.isArray(importData.sessions)) {
      throw new Error('无效的导入数据格式')
    }
    
    const existingSessions = getLocalSessions()
    const newSessions = importData.sessions.filter(session =>
      !existingSessions.some(existing => existing.id === session.id)
    )
    
    const mergedSessions = [...existingSessions, ...newSessions]
    localStorage.setItem(STORAGE_KEYS.SESSIONS, serializeData(mergedSessions))
    
    return newSessions.length
  } catch (error) {
    console.error('导入会话失败:', error)
    throw new Error('导入数据格式错误')
  }
} 