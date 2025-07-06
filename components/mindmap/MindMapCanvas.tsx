'use client'

import React, { useCallback, useEffect, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
  ConnectionMode,
  Connection,
  MarkerType,
  Panel
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useMindMapStore, selectNodes, selectEdges } from '@/store/mindmapStore'
import { useExploration } from '@/hooks/useExploration'
import { mindMapNodesToReactFlowNodes, mindMapEdgesToReactFlowEdges, autoLayoutNodes, filterCollapsedNodes } from '@/utils/layoutUtils'
import MindMapNode from './MindMapNode'
import { Sparkles, Target, Zap } from 'lucide-react'

// 注册自定义节点类型
const nodeTypes: NodeTypes = {
  mindmapNode: MindMapNode,
}

/**
 * 思维导图画布组件
 * 使用React Flow渲染可交互的思维导图
 */
export default function MindMapCanvas() {
  const { fitView, setCenter } = useReactFlow()
  
  // 从store获取状态
  const mindMapNodes = useMindMapStore(selectNodes)
  const mindMapEdges = useMindMapStore(selectEdges)
  const selectedNodeIds = useMindMapStore(state => state.selectedNodeIds)
  const setSelectedNodes = useMindMapStore(state => state.setSelectedNodes)
  
  // 探索功能
  const { 
    startExploration, 
    isGenerating,
    nodeCount 
  } = useExploration()

  // 转换为React Flow节点和边
  const visibleNodes = useMemo(() => {
    const reactFlowNodes = mindMapNodesToReactFlowNodes(mindMapNodes)
    const reactFlowEdges = mindMapEdgesToReactFlowEdges(mindMapEdges)
    const filtered = filterCollapsedNodes(reactFlowNodes, reactFlowEdges, mindMapNodes)
    return filtered.filteredNodes
  }, [mindMapNodes, mindMapEdges])

  const reactFlowNodes = useMemo(() => {
    const nodes = mindMapNodesToReactFlowNodes(mindMapNodes)
    const edges = mindMapEdgesToReactFlowEdges(mindMapEdges)
    const filtered = filterCollapsedNodes(nodes, edges, mindMapNodes)
    return autoLayoutNodes(filtered.filteredNodes, filtered.filteredEdges)
  }, [mindMapNodes, mindMapEdges])

  const reactFlowEdges = useMemo(() => {
    return mindMapEdgesToReactFlowEdges(mindMapEdges).filter(edge => {
      // 只显示可见节点的边
      const sourceVisible = reactFlowNodes.some(n => n.id === edge.source)
      const targetVisible = reactFlowNodes.some(n => n.id === edge.target)
      return sourceVisible && targetVisible
    })
  }, [mindMapEdges, reactFlowNodes])

  // 使用React Flow的状态管理
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // 同步React Flow节点状态
  useEffect(() => {
    setNodes(reactFlowNodes)
  }, [reactFlowNodes, setNodes])

  // 同步React Flow边状态
  useEffect(() => {
    setEdges(reactFlowEdges)
  }, [reactFlowEdges, setEdges])

  /**
   * 处理节点选择
   */
  const handleSelectionChange = useCallback((elements: { nodes: Node[]; edges: Edge[] }) => {
    const selectedIds = elements.nodes.map(node => node.id)
    setSelectedNodes(selectedIds)
  }, [setSelectedNodes])

  /**
   * 处理连接创建（暂时禁用）
   */
  const onConnect = useCallback((params: Connection) => {
    // 暂时不允许手动创建连接
    console.log('手动连接暂时禁用', params)
  }, [])

  /**
   * 适应视图到所有节点
   */
  const handleFitView = useCallback(() => {
    fitView({ 
      padding: 0.1,
      includeHiddenNodes: false,
      duration: 800
    })
  }, [fitView])

  /**
   * 定位到根节点
   */
  const handleFocusRoot = useCallback(() => {
    const rootNode = nodes.find(n => !mindMapNodes.find(mn => mn.id === n.id)?.parentId)
    if (rootNode) {
      setCenter(rootNode.position.x, rootNode.position.y, { zoom: 1, duration: 800 })
    }
  }, [nodes, mindMapNodes, setCenter])

  /**
   * 快速生成示例分支
   */
  const handleQuickExplore = useCallback(() => {
    if (selectedNodeIds.length > 0) {
      const selectedNodeId = selectedNodeIds[0]
      const selectedNode = mindMapNodes.find(n => n.id === selectedNodeId)
      if (selectedNode) {
        startExploration(selectedNode.question || selectedNode.answer || '继续探索')
      }
    } else if (nodes.length > 0) {
      // 如果没有选中节点，选择第一个节点
      const firstNode = mindMapNodes.find(n => n.id === nodes[0].id)
      if (firstNode) {
        startExploration(firstNode.question || firstNode.answer || '继续探索')
      }
    }
  }, [selectedNodeIds, nodes, mindMapNodes, startExploration])

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        
        // 视觉样式
        defaultEdgeOptions={{
          style: { 
            stroke: 'hsl(var(--border))',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--border))',
          },
        }}
        
        // 交互选项
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        
        // 键盘快捷键
        deleteKeyCode={null} // 禁用删除键
        multiSelectionKeyCode="Shift"
      >
        {/* 背景网格 */}
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="hsl(var(--muted))"
        />
        
        {/* 控制面板 */}
        <Controls 
          position="bottom-right"
          className="bg-card/80 backdrop-blur-sm border border-border rounded-lg"
        />
        
        {/* 小地图 */}
        <MiniMap 
          position="top-right"
          className="bg-card/80 backdrop-blur-sm border border-border rounded-lg"
          nodeColor="hsl(var(--primary))"
          nodeStrokeWidth={2}
          maskColor="hsl(var(--background) / 0.8)"
        />

        {/* 工具面板 */}
        <Panel position="top-left">
          <div className="flex flex-col space-y-2">
            {/* 视图控制按钮 */}
            <button
              onClick={handleFitView}
              className="flex items-center space-x-2 px-3 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:bg-card transition-colors duration-200"
              title="适应视图"
            >
              <Target className="w-4 h-4" />
              <span className="text-sm">适应视图</span>
            </button>

            {/* 定位根节点 */}
            <button
              onClick={handleFocusRoot}
              className="flex items-center space-x-2 px-3 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:bg-card transition-colors duration-200"
              title="定位根节点"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">定位根节点</span>
            </button>

            {/* 快速探索 */}
            <button
              onClick={handleQuickExplore}
              disabled={isGenerating || nodes.length === 0}
              className="flex items-center space-x-2 px-3 py-2 bg-primary/80 hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="快速探索选中节点"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">
                {isGenerating ? '生成中...' : '快速探索'}
              </span>
            </button>
          </div>
        </Panel>

        {/* 状态提示面板 */}
        {nodeCount === 0 && (
          <Panel position="top-center">
            <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-3">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-foreground">
                    AI正在思考中...
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  即将为您生成智能思维导图
                </p>
              </div>
            </div>
          </Panel>
        )}

        {/* 节点统计信息 */}
        {nodeCount > 0 && (
          <Panel position="bottom-left">
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>节点: <span className="text-foreground font-medium">{nodeCount}</span></span>
                <span>边: <span className="text-foreground font-medium">{reactFlowEdges.length}</span></span>
                <span>选中: <span className="text-foreground font-medium">{selectedNodeIds.length}</span></span>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
} 