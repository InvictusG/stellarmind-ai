'use client'

import { useCallback } from 'react'
import { useMindMapStore } from '@/store/mindmapStore'
import { MindMapNode, MindMapEdge } from '@/types'

// A utility to handle Server-Sent Events (SSE) from a fetch stream
async function processSseStream(
  stream: ReadableStream<Uint8Array>,
  onData: (data: any) => void
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep the last partial line in buffer

    for (const line of lines) {
      if (line.startsWith('data:')) {
        try {
          const json = JSON.parse(line.substring(5).trim());
          onData(json);
        } catch (e) {
          console.error('Failed to parse SSE data:', line, e);
        }
      }
    }
  }
}

/**
 * 探索相关的自定义Hook
 * 处理AI API调用、节点生成和思维导图更新
 */
export function useExploration() {
  const {
    nodes,
    isGenerating,
    addNode,
    addEdge,
    setIsGenerating,
    clearSession,
  } = useMindMapStore(
    (state) => ({
      nodes: state.nodes,
      isGenerating: state.isGenerating,
      addNode: state.addNode,
      addEdge: state.addEdge,
      setIsGenerating: state.setIsGenerating,
      clearSession: state.clearSession,
    })
  );

  /**
   * 开始新的探索 - 这是与新后端对接的唯一入口
   */
  const startExploration = useCallback(async (
    initialQuestion: string,
    readingLevel: string = '大学🎓'
  ): Promise<void> => {
    if (isGenerating) {
      console.warn("An exploration is already in progress.");
      return;
    }
    
    clearSession(); // 开始新探索前清空画布
    setIsGenerating(true);

    try {
      const response = await fetch('/api/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: initialQuestion,
          readingLevel: readingLevel 
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      if (!response.body) {
        throw new Error('Response body is missing');
      }

      await processSseStream(response.body, (event) => {
        switch (event.type) {
          case 'node':
            // 创建标准的MindMapNode对象
            const newNode: MindMapNode = {
              id: event.data.id,
              question: event.data.nodeType === 'question' ? event.data.content : '',
              answer: event.data.nodeType === 'answer' ? event.data.content : '',
              level: event.data.level,
              parentId: event.data.parentId,
              children: [],
              position: { x: 0, y: 0 },
              isCollapsed: false,
              isGenerating: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            addNode(newNode);
            break;

          case 'edge':
            // 后端发送的边数据已经符合MindMapEdge的基本结构
            const newEdge: MindMapEdge = {
              ...event.data,
              id: `edge-${event.data.source}-${event.data.target}`,
              type: 'smoothstep',
              animated: true,
            };
            addEdge(newEdge);
            break;

          case 'error':
            console.error('Error from exploration stream:', event.data.message);
            setIsGenerating(false);
            // Optionally, update UI to show error
            break;

          case 'done':
            console.log('Exploration complete.');
            setIsGenerating(false);
            break;
        }
      });

    } catch (error) {
      console.error('Failed to start exploration:', error);
      setIsGenerating(false);
      // TODO: Add user-facing error notification
    }
  }, [clearSession, setIsGenerating, addNode, addEdge, isGenerating]);
  
  return {
    isGenerating,
    startExploration,
    stopGeneration: () => setIsGenerating(false),
    nodeCount: nodes.length,
    maxDepthReached: nodes.length > 0 ? Math.max(...nodes.map(n => n.level || 0)) : 0,
  };
} 