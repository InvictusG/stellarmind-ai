'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, User, Bot, ChevronDown, ChevronRight, Sparkles, Copy, Bookmark } from 'lucide-react'
import { useMindMapStore } from '@/store/mindmapStore'
import { useExploration } from '@/hooks/useExploration'

/**
 * 单个聊天气泡组件
 */
interface ChatBubbleProps {
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  isGenerating?: boolean
  followUpQuestions?: string[]
  onAskFollowUp?: (question: string) => void
}

function ChatBubble({ type, content, timestamp, isGenerating, followUpQuestions, onAskFollowUp }: ChatBubbleProps) {
  const [showFollowUps, setShowFollowUps] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* 头像 */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        type === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-secondary text-secondary-foreground'
      }`}>
        {type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* 内容区域 */}
      <div className={`flex-1 max-w-[75%] ${type === 'user' ? 'text-right' : 'text-left'}`}>
        {/* 消息气泡 */}
        <div className={`inline-block p-3 rounded-2xl ${
          type === 'user'
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-card border border-border rounded-bl-md'
        }`}>
          <div className="prose prose-sm max-w-none">
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                </div>
                <span className="text-sm opacity-75">正在思考...</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{content}</p>
            )}
          </div>
        </div>

        {/* 时间戳 */}
        <div className={`text-xs text-muted-foreground mt-1 ${
          type === 'user' ? 'text-right' : 'text-left'
        }`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* AI回答的操作按钮 */}
        {type === 'ai' && !isGenerating && (
          <div className="flex items-center gap-2 mt-2 justify-start">
            <button 
              className="p-1 hover:bg-accent rounded-md transition-colors duration-200"
              title="复制回答"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button 
              className="p-1 hover:bg-accent rounded-md transition-colors duration-200"
              title="收藏回答"
            >
              <Bookmark className="w-3 h-3" />
            </button>
            {followUpQuestions && followUpQuestions.length > 0 && (
              <button
                onClick={() => setShowFollowUps(!showFollowUps)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors duration-200"
              >
                {showFollowUps ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                后续问题 ({followUpQuestions.length})
              </button>
            )}
          </div>
        )}

        {/* 后续问题卡片 */}
        <AnimatePresence>
          {showFollowUps && followUpQuestions && followUpQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 space-y-2"
            >
              {followUpQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onAskFollowUp?.(question)}
                  className="block w-full text-left p-3 bg-accent/50 hover:bg-accent rounded-lg border border-border/50 hover:border-border transition-all duration-200 group"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 group-hover:animate-pulse" />
                    <span className="text-sm font-medium text-foreground">{question}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/**
 * 气泡对话流主组件
 */
export default function ChatBubbleFlow() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState('')
  
  // 从store获取数据
  const nodes = useMindMapStore(state => state.nodes)
  const currentSessionId = useMindMapStore(state => state.currentSessionId)
  
  // 探索功能
  const { startExploration, isGenerating } = useExploration()

  /**
   * 将思维导图节点转换为聊天消息
   */
  const chatMessages = React.useMemo(() => {
    const messages: Array<{
      id: string
      type: 'user' | 'ai'
      content: string
      timestamp: Date
      isGenerating?: boolean
      followUpQuestions?: string[]
    }> = []

    // 按创建时间排序节点
    const sortedNodes = [...nodes].sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    )

    sortedNodes.forEach((node, index) => {
      // 用户问题
      messages.push({
        id: `user-${node.id}`,
        type: 'user',
        content: node.question,
        timestamp: node.createdAt,
      })

      // AI回答
      if (node.answer) {
        // 生成后续问题（从子节点获取）
        const followUpQuestions = sortedNodes
          .filter(child => child.parentId === node.id)
          .map(child => child.question)

        messages.push({
          id: `ai-${node.id}`,
          type: 'ai',
          content: node.answer,
          timestamp: node.updatedAt,
          isGenerating: node.isGenerating,
          followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
        })
      }
    })

    return messages
  }, [nodes])

  /**
   * 自动滚动到底部
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages])

  /**
   * 处理用户输入
   */
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !currentSessionId) return

    setInputValue('')
    await startExploration(message)
  }

  /**
   * 处理后续问题点击
   */
  const handleFollowUpClick = async (question: string) => {
    await startExploration(question)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 聊天消息区域 */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      >
        {chatMessages.length === 0 ? (
          /* 空状态 */
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">开始对话</h3>
                <p className="text-sm text-muted-foreground">
                  切换到这个视图后，你可以像使用ChatGPT一样与AI对话，AI的回答下方会显示相关的后续问题供你继续探索。
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* 聊天消息列表 */
          <div className="space-y-6">
            {chatMessages.map(message => (
              <ChatBubble
                key={message.id}
                type={message.type}
                content={message.content}
                timestamp={message.timestamp}
                isGenerating={message.isGenerating}
                followUpQuestions={message.followUpQuestions}
                onAskFollowUp={handleFollowUpClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* 输入框区域 */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(inputValue)
                  }
                }}
                placeholder="输入你的问题... (Shift+Enter 换行)"
                className="w-full min-h-[44px] max-h-[120px] px-4 py-3 bg-background border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 placeholder:text-muted-foreground"
                disabled={isGenerating}
              />
              
              {/* 发送按钮 */}
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isGenerating}
                className="absolute right-2 bottom-2 w-8 h-8 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* 输入提示 */}
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>支持 Markdown 格式</span>
            <span>Enter 发送 • Shift+Enter 换行</span>
          </div>
        </div>
      </div>
    </div>
  )
} 