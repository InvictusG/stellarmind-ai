'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import { FileQuestion, MessageSquare } from 'lucide-react'
import { MindMapNode } from '@/types'

/**
 * 新版思维导图节点组件 (V2)
 * 严格遵循单一职责原则，一个节点只显示一个问题或一个答案。
 * 节点样式由 nodeType ('question' | 'answer') 决定。
 */
const MindMapNodeComponent = memo<NodeProps<MindMapNode>>(({ data, selected }) => {
  const { question, answer, level } = data;

  // 确定节点类型和内容
  const isQuestion = question && !answer;
  const nodeType = isQuestion ? 'question' : 'answer';
  const content = isQuestion ? question : answer;

  /**
   * 根据节点类型和层级获取颜色主题
   */
  const getNodeTheme = (level: number, type: 'question' | 'answer') => {
    const themes = {
      question: [
        'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/70 dark:border-blue-800 dark:text-blue-100',
        'bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-950/70 dark:border-purple-800 dark:text-purple-100',
        'bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950/70 dark:border-orange-800 dark:text-orange-100',
      ],
      answer: [
        'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800/70 dark:border-gray-700 dark:text-gray-300',
        'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/60 dark:border-green-800 dark:text-green-200',
        'bg-pink-50 border-pink-200 text-pink-900 dark:bg-pink-950/70 dark:border-pink-800 dark:text-pink-100',
      ]
    };
    const themeSet = themes[type] || themes.question;
    return themeSet[level % themeSet.length];
  }

  /**
   * 获取节点大小类名
   */
  const getNodeSize = (level: number) => {
    if (level === 0) return 'min-w-[300px] max-w-[350px] text-lg font-bold';
    if (level < 3) return 'min-w-[250px] max-w-[320px]';
    return 'min-w-[220px] max-w-[300px]';
  }

  const Icon = isQuestion ? FileQuestion : MessageSquare;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        ${getNodeSize(level)}
        ${getNodeTheme(level, nodeType)}
        ${selected ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900' : ''}
        rounded-lg border-2 shadow-md hover:shadow-lg
        transition-all duration-300 cursor-pointer
        overflow-hidden
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-primary !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-primary !border-2 !border-background"
      />

      <div className="flex items-start space-x-3 p-4">
        <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${isQuestion ? 'text-primary' : 'text-green-500'}`} />
        <p className="text-sm font-medium leading-relaxed">
          {content}
        </p>
      </div>
    </motion.div>
  );
});

MindMapNodeComponent.displayName = 'MindMapNode';

export default MindMapNodeComponent; 