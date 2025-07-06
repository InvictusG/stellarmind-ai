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

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '缺少有效的认证token' },
        { status: 401 }
      )
    }

    const token = authorization.split(' ')[1]

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
      
      // 查找用户
      const user = USERS_DB.find(u => u.id === decoded.userId)
      
      if (!user) {
        return NextResponse.json(
          { message: '用户不存在' },
          { status: 401 }
        )
      }

      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        subscription: user.subscription || 'free'
      })

    } catch (jwtError) {
      return NextResponse.json(
        { message: 'Token无效或已过期' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Token验证错误:', error)
    return NextResponse.json(
      { message: '验证失败，请重试' },
      { status: 500 }
    )
  }
} 