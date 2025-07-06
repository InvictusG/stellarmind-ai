import dagre from 'dagre'
import { Node, Edge, Position, MarkerType } from 'reactflow'
import { MindMapNode, MindMapEdge } from '@/types'

/**
 * 节点布局配置
 */
export interface LayoutOptions {
  direction: 'TB' | 'BT' | 'LR' | 'RL'  // 布局方向
  nodeWidth: number                      // 节点宽度
  nodeHeight: number                     // 节点高度
  rankSep: number                        // 层级间距
  nodeSep: number                        // 节点间距
  edgeSep: number                        // 边间距
  marginX: number                        // 水平边距
  marginY: number                        // 垂直边距
}

/**
 * 默认布局配置
 */
export const defaultLayoutOptions: LayoutOptions = {
  direction: 'TB',      // 从上到下
  nodeWidth: 300,       // 节点宽度
  nodeHeight: 120,      // 节点高度
  rankSep: 80,          // 层级间距
  nodeSep: 50,          // 节点间距
  edgeSep: 10,          // 边间距
  marginX: 50,          // 水平边距
  marginY: 50,          // 垂直边距
}

/**
 * 创建Dagre图实例
 */
function createDagreGraph(options: LayoutOptions): dagre.graphlib.Graph {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  
  // 设置图的配置
  dagreGraph.setGraph({
    rankdir: options.direction,
    ranksep: options.rankSep,
    nodesep: options.nodeSep,
    edgesep: options.edgeSep,
    marginx: options.marginX,
    marginy: options.marginY,
  })
  
  return dagreGraph
}

/**
 * 将思维导图节点转换为React Flow节点
 */
export function mindMapNodesToReactFlowNodes(
  mindMapNodes: MindMapNode[]
): Node[] {
  return mindMapNodes.map((node) => ({
    id: node.id,
    type: 'mindmapNode',
    position: node.position,
    data: { node },
    // 根据节点层级设置不同的大小
    style: {
      width: Math.max(250, Math.min(400, node.question.length * 8 + 100)),
      height: Math.max(100, Math.min(200, node.answer.length * 2 + 80)),
    },
    // 设置节点的连接点位置
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  }))
}

/**
 * 将思维导图边转换为React Flow边
 */
export function mindMapEdgesToReactFlowEdges(
  mindMapEdges: MindMapEdge[]
): Edge[] {
  return mindMapEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: edge.animated || false,
    style: {
      stroke: 'hsl(var(--border))',
      strokeWidth: 2,
      ...edge.style,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'hsl(var(--border))',
    },
  }))
}

/**
 * 使用Dagre算法自动布局节点
 * 
 * @param nodes - React Flow节点数组
 * @param edges - React Flow边数组  
 * @param options - 布局选项
 * @returns 布局后的节点数组
 */
export function autoLayoutNodes(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = defaultLayoutOptions
): Node[] {
  // 创建Dagre图实例
  const dagreGraph = createDagreGraph(options)
  
  // 添加节点到Dagre图
  nodes.forEach((node) => {
    const nodeWidth = node.style?.width as number || options.nodeWidth
    const nodeHeight = node.style?.height as number || options.nodeHeight
    
    dagreGraph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
    })
  })
  
  // 添加边到Dagre图
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })
  
  // 执行布局计算
  dagre.layout(dagreGraph)
  
  // 更新节点位置
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const nodeWidth = node.style?.width as number || options.nodeWidth
    const nodeHeight = node.style?.height as number || options.nodeHeight
    
    return {
      ...node,
      position: {
        // Dagre返回的是节点中心点位置，需要转换为左上角位置
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })
  
  return layoutedNodes
}

/**
 * 计算思维导图的边界盒
 * 
 * @param nodes - 节点数组
 * @returns 边界盒信息
 */
export function calculateBoundingBox(nodes: Node[]): {
  x: number
  y: number
  width: number
  height: number
} {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }
  
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  
  nodes.forEach((node) => {
    const nodeWidth = node.style?.width as number || defaultLayoutOptions.nodeWidth
    const nodeHeight = node.style?.height as number || defaultLayoutOptions.nodeHeight
    
    const x1 = node.position.x
    const y1 = node.position.y
    const x2 = x1 + nodeWidth
    const y2 = y1 + nodeHeight
    
    minX = Math.min(minX, x1)
    minY = Math.min(minY, y1)
    maxX = Math.max(maxX, x2)
    maxY = Math.max(maxY, y2)
  })
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

/**
 * 获取节点的子节点ID列表
 * 
 * @param nodeId - 父节点ID
 * @param edges - 边数组
 * @returns 子节点ID数组
 */
export function getChildNodeIds(nodeId: string, edges: Edge[]): string[] {
  return edges
    .filter(edge => edge.source === nodeId)
    .map(edge => edge.target)
}

/**
 * 获取节点的父节点ID
 * 
 * @param nodeId - 子节点ID
 * @param edges - 边数组
 * @returns 父节点ID，如果没有父节点则返回null
 */
export function getParentNodeId(nodeId: string, edges: Edge[]): string | null {
  const parentEdge = edges.find(edge => edge.target === nodeId)
  return parentEdge ? parentEdge.source : null
}

/**
 * 获取节点的深度层级
 * 
 * @param nodeId - 节点ID
 * @param edges - 边数组
 * @param rootNodeId - 根节点ID
 * @returns 节点深度（根节点为0）
 */
export function getNodeDepth(
  nodeId: string, 
  edges: Edge[], 
  rootNodeId?: string
): number {
  // 如果没有指定根节点，尝试找到根节点
  if (!rootNodeId) {
    const allTargets = new Set(edges.map(edge => edge.target))
    const allSources = new Set(edges.map(edge => edge.source))
    const rootNodes = Array.from(allSources).filter(id => !allTargets.has(id))
    rootNodeId = rootNodes[0]
  }
  
  if (!rootNodeId || nodeId === rootNodeId) {
    return 0
  }
  
  const parentId = getParentNodeId(nodeId, edges)
  if (!parentId) {
    return 0
  }
  
  return 1 + getNodeDepth(parentId, edges, rootNodeId)
}

/**
 * 检查节点是否折叠
 * 
 * @param nodeId - 节点ID
 * @param mindMapNodes - 思维导图节点数组
 * @returns 是否折叠
 */
export function isNodeCollapsed(nodeId: string, mindMapNodes: MindMapNode[]): boolean {
  const node = mindMapNodes.find(n => n.id === nodeId)
  return node?.isCollapsed || false
}

/**
 * 过滤掉折叠节点的子节点
 * 
 * @param nodes - 所有节点
 * @param edges - 所有边
 * @param mindMapNodes - 思维导图节点数据
 * @returns 过滤后的节点和边
 */
export function filterCollapsedNodes(
  nodes: Node[],
  edges: Edge[],
  mindMapNodes: MindMapNode[]
): { filteredNodes: Node[]; filteredEdges: Edge[] } {
  // 找到所有折叠的节点
  const collapsedNodeIds = new Set(
    mindMapNodes
      .filter(node => node.isCollapsed)
      .map(node => node.id)
  )
  
  // 递归找到所有被隐藏的节点ID
  const hiddenNodeIds = new Set<string>()
  
  function addHiddenDescendants(nodeId: string) {
    const children = getChildNodeIds(nodeId, edges)
    children.forEach(childId => {
      hiddenNodeIds.add(childId)
      addHiddenDescendants(childId)
    })
  }
  
  // 为每个折叠节点添加其所有后代节点到隐藏列表
  collapsedNodeIds.forEach(nodeId => {
    addHiddenDescendants(nodeId)
  })
  
  // 过滤节点和边
  const filteredNodes = nodes.filter(node => !hiddenNodeIds.has(node.id))
  const filteredEdges = edges.filter(edge => 
    !hiddenNodeIds.has(edge.source) && !hiddenNodeIds.has(edge.target)
  )
  
  return { filteredNodes, filteredEdges }
}

/**
 * 动画更新节点位置
 * 
 * @param oldNodes - 旧节点数组
 * @param newNodes - 新节点数组
 * @param duration - 动画持续时间（毫秒）
 * @returns Promise，动画完成时resolve
 */
export function animateNodePositions(
  oldNodes: Node[],
  newNodes: Node[],
  duration: number = 300
): Promise<Node[]> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const oldPositions = new Map(oldNodes.map(node => [node.id, node.position]))
    
    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // 使用缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      const animatedNodes = newNodes.map(node => {
        const oldPosition = oldPositions.get(node.id)
        if (!oldPosition) {
          return node
        }
        
        const deltaX = node.position.x - oldPosition.x
        const deltaY = node.position.y - oldPosition.y
        
        return {
          ...node,
          position: {
            x: oldPosition.x + deltaX * easeProgress,
            y: oldPosition.y + deltaY * easeProgress,
          },
        }
      })
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        resolve(newNodes)
      }
    }
    
    animate()
  })
} 