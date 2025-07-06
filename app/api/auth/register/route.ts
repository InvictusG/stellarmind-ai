import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
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
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: '邮箱、密码和姓名不能为空' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // 检查用户是否已存在
    const existingUser = USERS_DB.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (existingUser) {
      return NextResponse.json(
        { message: '该邮箱已被注册' },
        { status: 409 }
      )
    }

    // 创建新用户
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscription: 'free'
    }

    // 保存到模拟数据库
    USERS_DB.push(newUser)

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        subscription: newUser.subscription
      },
      token
    })

  } catch (error) {
    console.error('注册错误:', error)
    return NextResponse.json(
      { message: '注册失败，请重试' },
      { status: 500 }
    )
  }
} 