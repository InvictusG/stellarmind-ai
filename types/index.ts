import React from 'react';
import type { APIKeyConfig } from '@/utils/apiKeyManager'

/**
 * 全局类型定义文件
 * 定义整个应用中用到的核心数据结构和类型
 */

// ==================== 思维导图节点相关类型 ====================

/**
 * 思维导图节点数据结构
 */
export interface MindMapNode {
  id: string;                    // 节点唯一标识
  question: string;              // 问题内容
  answer: string;                // AI回答内容
  level: number;                 // 节点深度层级（从0开始）
  parentId?: string;             // 父节点ID
  children: string[];            // 子节点ID数组
  position: { x: number; y: number }; // 节点在画布中的位置
  isCollapsed: boolean;          // 是否折叠子节点
  isGenerating: boolean;         // 是否正在生成中
  createdAt: Date;              // 创建时间
  updatedAt: Date;              // 更新时间
  metadata?: {                   // 节点元数据
    confidence?: number;         // AI回答置信度
    sources?: string[];          // 引用来源
    tags?: string[];            // 标签
    isBookmarked?: boolean;     // 是否收藏
  };
}

/**
 * 思维导图边连接数据结构
 */
export interface MindMapEdge {
  id: string;                    // 边唯一标识
  source: string;                // 源节点ID
  target: string;                // 目标节点ID
  type: string;                  // 边类型（straight, smoothstep, bezier等）
  animated?: boolean;            // 是否显示动画
  style?: Record<string, any>;   // 自定义样式
}

// ==================== 应用状态相关类型 ====================

/**
 * 应用视图模式
 */
export type ViewMode = 'mindmap' | 'chat';

/**
 * 主题模式
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * AI模型配置
 */
export interface AIModelConfig {
  provider: 'openai' | 'claude' | 'custom';  // AI提供商
  model: string;                              // 模型名称
  apiKey?: string;                           // API密钥
  baseURL?: string;                          // 自定义API基础URL
  temperature: number;                       // 创造性程度（0-1）
  maxTokens: number;                        // 最大Token数
}

/**
 * 探索参数配置
 */
export interface ExploreConfig {
  depth: number;                 // 递归深度（1-5）
  breadth: number;              // 分支广度（1-5）
  model: AIModelConfig;         // AI模型配置
  autoGenerate: boolean;        // 是否自动生成分支
  showThinking: boolean;        // 是否显示思考过程
}

/**
 * 用户会话数据
 */
export interface ChatSession {
  id: string;                    // 会话ID
  title: string;                // 会话标题
  initialQuestion: string;      // 初始问题
  nodes: MindMapNode[];         // 所有节点
  edges: MindMapEdge[];         // 所有边
  config: ExploreConfig;        // 探索配置
  createdAt: Date;              // 创建时间
  updatedAt: Date;              // 更新时间
  isArchived: boolean;          // 是否归档
}

// ==================== API相关类型 ====================

/**
 * API请求基础类型
 */
export interface APIRequest {
  question: string;              // 用户问题
  parentNodeId?: string;        // 父节点ID（用于分支扩展）
  config: ExploreConfig;        // 探索配置
  sessionId?: string;           // 会话ID
}

/**
 * API响应数据结构
 */
export interface APIResponse {
  success: boolean;              // 请求是否成功
  data?: any;                   // 响应数据
  error?: string;               // 错误信息
  timestamp: number;            // 响应时间戳
}

/**
 * 流式响应数据结构
 */
export interface StreamResponse {
  type: 'node' | 'edge' | 'complete' | 'error'; // 响应类型
  data: MindMapNode | MindMapEdge | string;      // 响应数据
  sessionId: string;                             // 会话ID
  timestamp: number;                             // 时间戳
}

// ==================== UI组件相关类型 ====================

/**
 * 组件基础Props
 */
export interface BaseProps {
  className?: string;            // 自定义CSS类名
  children?: any;               // 子组件
}

/**
 * 浮动操作栏配置
 */
export interface FloatingAction {
  id: string;                    // 操作ID
  icon: any;                    // 图标组件
  label: string;                // 操作标签
  onClick: () => void;          // 点击回调
  disabled?: boolean;           // 是否禁用
  shortcut?: string;            // 快捷键
}

/**
 * 导出选项
 */
export interface ExportOptions {
  format: 'markdown' | 'png' | 'pdf' | 'json'; // 导出格式
  includeMetadata: boolean;                     // 是否包含元数据
  selectedNodesOnly: boolean;                   // 是否仅导出选中节点
}

// ==================== 错误处理相关类型 ====================

/**
 * 应用错误类型
 */
export interface AppError {
  code: string;                  // 错误代码
  message: string;              // 错误信息
  details?: any;                // 错误详情
  timestamp: number;            // 错误时间
  stack?: string;               // 错误堆栈
}

/**
 * 错误边界状态
 */
export interface ErrorBoundaryState {
  hasError: boolean;            // 是否有错误
  error?: AppError;            // 错误信息
}

// ==================== 工具函数相关类型 ====================

/**
 * 节点布局算法配置
 */
export interface LayoutConfig {
  direction: 'TB' | 'BT' | 'LR' | 'RL';  // 布局方向
  nodeSpacing: number;                     // 节点间距
  levelSpacing: number;                    // 层级间距
  algorithm: 'dagre' | 'elk' | 'custom';  // 布局算法
}

/**
 * 动画配置
 */
export interface AnimationConfig {
  duration: number;              // 动画时长（毫秒）
  easing: string;               // 缓动函数
  delay?: number;               // 延迟时间
}

// ==================== 本地存储相关类型 ====================

/**
 * 本地存储数据结构
 */
export interface LocalStorageData {
  sessions: ChatSession[];       // 历史会话
  bookmarks: MindMapNode[];     // 收藏节点
  preferences: {                // 用户偏好设置
    theme: ThemeMode;
    defaultConfig: ExploreConfig;
    shortcuts: Record<string, string>;
  };
  version: string;              // 数据版本号
}

// ==================== React Flow相关类型扩展 ====================

/**
 * 自定义节点数据类型（扩展React Flow）
 */
export interface CustomNodeData {
  node: MindMapNode;            // 思维导图节点数据
  onExpand?: (nodeId: string) => void;      // 展开回调
  onCollapse?: (nodeId: string) => void;    // 折叠回调
  onBookmark?: (nodeId: string) => void;    // 收藏回调
  onCopy?: (nodeId: string) => void;        // 复制回调
  onAskMore?: (nodeId: string) => void;     // 追问回调
}

/**
 * 自定义边数据类型（扩展React Flow）
 */
export interface CustomEdgeData {
  edge: MindMapEdge;            // 思维导图边数据
  isAnimated?: boolean;         // 是否显示动画
}

// ==================== 事件相关类型 ====================

/**
 * 自定义事件类型
 */
export interface CustomEvent<T = any> {
  type: string;                 // 事件类型
  payload: T;                   // 事件载荷
  timestamp: number;            // 事件时间戳
  source?: string;              // 事件来源
}

/**
 * 节点操作事件类型
 */
export type NodeEvent = 
  | CustomEvent<{ nodeId: string; action: 'expand' }>
  | CustomEvent<{ nodeId: string; action: 'collapse' }>
  | CustomEvent<{ nodeId: string; action: 'bookmark' }>
  | CustomEvent<{ nodeId: string; action: 'copy' }>
  | CustomEvent<{ nodeId: string; action: 'delete' }>
  | CustomEvent<{ nodeId: string; question: string; action: 'ask_more' }>;

/**
 * AI模型提供商
 */
export type ModelProvider = 
  | 'OpenAI' 
  | 'Anthropic' 
  | 'Google' 
  | 'DeepSeek' 
  | 'Llama (Meta)' 
  | 'Grok (xAI)' 
  | 'Qwen (Alibaba)'
  | 'Mistral AI';

/**
 * 快捷键配置
 */
export interface ShortcutConfig {
  key: string;                  // 按键组合
  description: string;          // 快捷键描述
  action: () => void;          // 执行动作
  global?: boolean;            // 是否全局快捷键
}

/**
 * 快捷键上下文
 */
export interface ShortcutContext {
  mode: ViewMode;              // 当前视图模式
  selectedNodes: string[];     // 选中的节点
  isGenerating: boolean;       // 是否正在生成
}

export interface Card {
  id: string
  type: 'question' | 'answer'
  content: string
  level: number
  x: number
  y: number
  width: number
  height: number
  parentId?: string
  children: string[]
  isExpanded: boolean
  isGenerating: boolean
  canExpand: boolean
  isTyping: boolean
  displayedContent: string
  isNew?: boolean
}

export interface Node extends Card {}

export interface Edge {
  source: string
  target: string
}

export interface LLMModel {
  id: string;
  name: string;
  description: string;
  provider: ModelProvider;
}

// 用户系统
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
  subscription?: 'free' | 'pro' | 'enterprise'
}

// 会话管理
export interface Session {
  id: string
  userId: string
  title: string
  cards: { [key: string]: Card }
  createdAt: string
  updatedAt: string
  isPublic?: boolean
  tags?: string[]
}

// 用户配置
export interface UserConfig {
  userId: string
  apiKeys: APIKeyConfig[]
  preferences: {
    theme: 'dark' | 'light'
    language: 'zh' | 'en'
    defaultReadingLevel: string
  }
}