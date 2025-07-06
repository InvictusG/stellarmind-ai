import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { MindMapNode, MindMapEdge, ExploreConfig, ViewMode } from '@/types'

/**
 * 思维导图应用状态接口
 */
interface MindMapState {
  // === 基础状态 ===
  currentSessionId: string | null
  viewMode: ViewMode
  isGenerating: boolean
  
  // === 数据状态 ===
  nodes: MindMapNode[]
  edges: MindMapEdge[]
  selectedNodeIds: string[]
  
  // === 配置状态 ===
  config: ExploreConfig
  
  // === UI状态 ===
  showSettings: boolean
  showHistory: boolean
  floatingToolbarPosition: { x: number; y: number } | null
  
  // === 操作方法 ===
  // 基础操作
  setViewMode: (mode: ViewMode) => void
  setIsGenerating: (generating: boolean) => void
  setSelectedNodes: (nodeIds: string[]) => void
  
  // 节点操作
  addNode: (node: MindMapNode) => void
  updateNode: (nodeId: string, updates: Partial<MindMapNode>) => void
  removeNode: (nodeId: string) => void
  toggleNodeCollapse: (nodeId: string) => void
  
  // 边操作
  addEdge: (edge: MindMapEdge) => void
  removeEdge: (edgeId: string) => void
  
  // 会话操作
  createNewSession: (initialQuestion: string) => void
  clearSession: () => void
  loadSession: (sessionId: string) => void
  
  // 配置操作
  updateConfig: (updates: Partial<ExploreConfig>) => void
  
  // UI操作
  toggleSettings: () => void
  toggleHistory: () => void
  setFloatingToolbar: (position: { x: number; y: number } | null) => void
}

/**
 * 默认探索配置
 */
const defaultConfig: ExploreConfig = {
  depth: 3,
  breadth: 3,
  model: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
  },
  autoGenerate: true,
  showThinking: false,
}

/**
 * 生成唯一ID的工具函数
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 创建思维导图状态管理store
 */
export const useMindMapStore = create<MindMapState>()(
  devtools(
    persist(
      (set, get) => ({
        // === 初始状态 ===
        currentSessionId: null,
        viewMode: 'mindmap',
        isGenerating: false,
        
        nodes: [],
        edges: [],
        selectedNodeIds: [],
        
        config: defaultConfig,
        
        showSettings: false,
        showHistory: false,
        floatingToolbarPosition: null,
        
        // === 基础操作方法 ===
        setViewMode: (mode) => {
          set({ viewMode: mode }, false, 'setViewMode')
        },
        
        setIsGenerating: (generating) => {
          set({ isGenerating: generating }, false, 'setIsGenerating')
        },
        
        setSelectedNodes: (nodeIds) => {
          set({ selectedNodeIds: nodeIds }, false, 'setSelectedNodes')
        },
        
        // === 节点操作方法 ===
        addNode: (node) => {
          set((state) => ({
            nodes: [...state.nodes, node],
          }), false, 'addNode')
        },
        
        updateNode: (nodeId, updates) => {
          set((state) => ({
            nodes: state.nodes.map(node =>
              node.id === nodeId ? { ...node, ...updates, updatedAt: new Date() } : node
            ),
          }), false, 'updateNode')
        },
        
        removeNode: (nodeId) => {
          set((state) => {
            // 同时移除相关的边
            const filteredEdges = state.edges.filter(
              edge => edge.source !== nodeId && edge.target !== nodeId
            )
            const filteredNodes = state.nodes.filter(node => node.id !== nodeId)
            
            return {
              nodes: filteredNodes,
              edges: filteredEdges,
              selectedNodeIds: state.selectedNodeIds.filter(id => id !== nodeId),
            }
          }, false, 'removeNode')
        },
        
        toggleNodeCollapse: (nodeId) => {
          set((state) => ({
            nodes: state.nodes.map(node =>
              node.id === nodeId 
                ? { ...node, isCollapsed: !node.isCollapsed, updatedAt: new Date() }
                : node
            ),
          }), false, 'toggleNodeCollapse')
        },
        
        // === 边操作方法 ===
        addEdge: (edge) => {
          set((state) => ({
            edges: [...state.edges, edge],
          }), false, 'addEdge')
        },
        
        removeEdge: (edgeId) => {
          set((state) => ({
            edges: state.edges.filter(edge => edge.id !== edgeId),
          }), false, 'removeEdge')
        },
        
        // === 会话操作方法 ===
        createNewSession: (initialQuestion) => {
          const sessionId = generateId()
          const rootNode: MindMapNode = {
            id: generateId(),
            question: initialQuestion,
            answer: '', // 将由AI填充
            level: 0,
            children: [],
            position: { x: 0, y: 0 },
            isCollapsed: false,
            isGenerating: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          set({
            currentSessionId: sessionId,
            nodes: [rootNode],
            edges: [],
            selectedNodeIds: [],
            isGenerating: true,
          }, false, 'createNewSession')
        },
        
        clearSession: () => {
          set({
            currentSessionId: null,
            nodes: [],
            edges: [],
            selectedNodeIds: [],
            isGenerating: false,
          }, false, 'clearSession')
        },
        
        loadSession: (sessionId) => {
          // TODO: 从本地存储或API加载会话数据
          set({
            currentSessionId: sessionId,
          }, false, 'loadSession')
        },
        
        // === 配置操作方法 ===
        updateConfig: (updates) => {
          set((state) => ({
            config: { ...state.config, ...updates },
          }), false, 'updateConfig')
        },
        
        // === UI操作方法 ===
        toggleSettings: () => {
          set((state) => ({
            showSettings: !state.showSettings,
          }), false, 'toggleSettings')
        },
        
        toggleHistory: () => {
          set((state) => ({
            showHistory: !state.showHistory,
          }), false, 'toggleHistory')
        },
        
        setFloatingToolbar: (position) => {
          set({ floatingToolbarPosition: position }, false, 'setFloatingToolbar')
        },
      }),
      {
        name: 'mindmap-storage',
        // 只持久化用户配置和历史数据，不持久化临时UI状态
        partialize: (state) => ({
          config: state.config,
          // TODO: 添加历史会话数据持久化
        }),
      }
    ),
    {
      name: 'mindmap-store',
    }
  )
)

/**
 * 选择器函数，用于组件中获取特定状态片段
 */
export const selectNodes = (state: MindMapState) => state.nodes
export const selectEdges = (state: MindMapState) => state.edges
export const selectViewMode = (state: MindMapState) => state.viewMode
export const selectIsGenerating = (state: MindMapState) => state.isGenerating
export const selectConfig = (state: MindMapState) => state.config
export const selectSelectedNodes = (state: MindMapState) => state.selectedNodeIds 