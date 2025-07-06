import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '@/types'

// 模拟数据库 - 生产环境应使用真实数据库
const USERS_DB: User[] = [
  // 演示用户
  {
    id: 'demo_user_001',
    email: 'demo@stellarmind.ai',
    name: '演示用户',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    subscription: 'pro'
  }
]

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: '邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = USERS_DB.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 401 }
      )
    }

    // 验证密码 - 演示用户使用固定密码
    const isValidPassword = (email === 'demo@stellarmind.ai' && password === 'demo123')

    if (!isValidPassword) {
      return NextResponse.json(
        { message: '密码错误' },
        { status: 401 }
      )
    }

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        subscription: user.subscription || 'free'
      },
      token
    })

  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json(
      { message: '登录失败，请重试' },
      { status: 500 }
    )
  }
} 