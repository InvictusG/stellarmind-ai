'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface LoginResponse {
  success: boolean
  error?: string
  user?: User
  token?: string
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('stellarmind_token')
        if (token) {
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const user = await response.json()
            setAuthState({
              user,
              isLoading: false,
              isAuthenticated: true
            })
          } else {
            localStorage.removeItem('stellarmind_token')
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false
            })
          }
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      } catch (error) {
        console.error('认证初始化失败:', error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    initAuth()
  }, [])

  // 登录
  const login = useCallback(async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        const { user, token } = data
        localStorage.setItem('stellarmind_token', token)
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        })
        return { success: true, user, token }
      } else {
        return { success: false, error: data.message || '登录失败' }
      }
    } catch (error) {
      return { success: false, error: '网络错误，请重试' }
    }
  }, [])

  // 注册
  const register = useCallback(async (email: string, password: string, name: string): Promise<LoginResponse> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (response.ok) {
        const { user, token } = data
        localStorage.setItem('stellarmind_token', token)
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        })
        return { success: true, user, token }
      } else {
        return { success: false, error: data.message || '注册失败' }
      }
    } catch (error) {
      return { success: false, error: '网络错误，请重试' }
    }
  }, [])

  // 登出
  const logout = useCallback(() => {
    localStorage.removeItem('stellarmind_token')
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    })
  }, [])

  // 更新用户信息
  const updateUser = useCallback(async (updates: Partial<User>) => {
    try {
      const token = localStorage.getItem('stellarmind_token')
      if (!token) return { success: false, error: '未登录' }

      const response = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setAuthState(prev => ({
          ...prev,
          user: updatedUser
        }))
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.message }
      }
    } catch (error) {
      return { success: false, error: '更新失败，请重试' }
    }
  }, [])

  // 获取授权token
  const getToken = useCallback(() => {
    return localStorage.getItem('stellarmind_token')
  }, [])

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    getToken
  }
}