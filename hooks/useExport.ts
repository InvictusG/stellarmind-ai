'use client'

import { useState, useCallback } from 'react'
import { SessionData } from '@/lib/database'
import { 
  exportSession, 
  batchExportSessions,
  ExportOptions, 
  ExportResult 
} from '@/utils/exportUtils'

/**
 * 导出管理自定义Hook
 * 提供统一的导出接口和状态管理
 */
export function useExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportHistory, setExportHistory] = useState<ExportResult[]>([])

  // ==================== 单个会话导出 ====================

  /**
   * 导出单个会话
   */
  const exportSingleSession = useCallback(async (
    session: SessionData,
    options: ExportOptions
  ): Promise<ExportResult> => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      setExportProgress(30)
      const result = await exportSession(session, options)
      setExportProgress(100)

      // 记录导出历史
      if (result.success) {
        setExportHistory(prev => [result, ...prev.slice(0, 9)]) // 只保留最近10次
      }

      return result
    } catch (error) {
      console.error('导出失败:', error)
      return {
        success: false,
        fileName: '',
        error: error instanceof Error ? error.message : '导出失败'
      }
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }, [])

  // ==================== 批量导出 ====================

  /**
   * 批量导出多个会话
   */
  const exportMultipleSessions = useCallback(async (
    sessions: SessionData[],
    options: ExportOptions
  ): Promise<ExportResult[]> => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      const results: ExportResult[] = []
      const total = sessions.length

      for (let i = 0; i < sessions.length; i++) {
        const session = sessions[i]
        setExportProgress(Math.round((i / total) * 100))

        const result = await exportSession(session, {
          ...options,
          customFileName: session.title
        })
        
        results.push(result)

        // 添加延迟避免浏览器阻塞
        if (i < sessions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      setExportProgress(100)

      // 记录成功的导出
      const successfulExports = results.filter(r => r.success)
      setExportHistory(prev => [...successfulExports, ...prev].slice(0, 20))

      return results
    } catch (error) {
      console.error('批量导出失败:', error)
      return []
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }, [])

  // ==================== 快捷导出方法 ====================

  /**
   * 快速导出为PNG
   */
  const exportAsPNG = useCallback(async (
    session: SessionData,
    quality: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<ExportResult> => {
    return exportSingleSession(session, {
      format: 'png',
      quality,
      includeTimestamp: true
    })
  }, [exportSingleSession])

  /**
   * 快速导出为PDF
   */
  const exportAsPDF = useCallback(async (
    session: SessionData,
    includeMetadata = true
  ): Promise<ExportResult> => {
    return exportSingleSession(session, {
      format: 'pdf',
      includeMetadata,
      includeTimestamp: true,
      orientation: 'landscape',
      pageSize: 'A4'
    })
  }, [exportSingleSession])

  /**
   * 快速导出为JSON
   */
  const exportAsJSON = useCallback(async (
    session: SessionData,
    includeMetadata = true
  ): Promise<ExportResult> => {
    return exportSingleSession(session, {
      format: 'json',
      includeMetadata,
      includeTimestamp: true
    })
  }, [exportSingleSession])

  /**
   * 快速导出为CSV
   */
  const exportAsCSV = useCallback(async (
    session: SessionData
  ): Promise<ExportResult> => {
    return exportSingleSession(session, {
      format: 'csv',
      includeTimestamp: true
    })
  }, [exportSingleSession])

  // ==================== 导出模板 ====================

  /**
   * 获取导出预设模板
   */
  const getExportTemplates = useCallback(() => {
    return {
      presentation: {
        name: '演示文档',
        description: '适合展示和分享的高质量导出',
        options: {
          format: 'pdf' as const,
          quality: 'high' as const,
          includeMetadata: true,
          includeTimestamp: true,
          orientation: 'landscape' as const,
          pageSize: 'A4' as const
        }
      },
      archive: {
        name: '归档备份',
        description: '完整的数据备份，包含所有信息',
        options: {
          format: 'json' as const,
          includeMetadata: true,
          includeTimestamp: true
        }
      },
      social: {
        name: '社交媒体',
        description: '适合在社交媒体分享的图片',
        options: {
          format: 'png' as const,
          quality: 'high' as const,
          includeTimestamp: false
        }
      },
      analysis: {
        name: '数据分析',
        description: '适合进一步分析的结构化数据',
        options: {
          format: 'csv' as const,
          includeTimestamp: true
        }
      }
    }
  }, [])

  /**
   * 使用模板导出
   */
  const exportWithTemplate = useCallback(async (
    session: SessionData,
    templateName: keyof ReturnType<typeof getExportTemplates>
  ): Promise<ExportResult> => {
    const templates = getExportTemplates()
    const template = templates[templateName]
    
    if (!template) {
      throw new Error(`未找到模板: ${templateName}`)
    }

    return exportSingleSession(session, template.options)
  }, [exportSingleSession, getExportTemplates])

  // ==================== 导出统计 ====================

  /**
   * 获取导出统计信息
   */
  const getExportStats = useCallback(() => {
    const stats = exportHistory.reduce((acc, result) => {
      if (result.success) {
        const format = result.fileName.split('.').pop() || 'unknown'
        acc[format] = (acc[format] || 0) + 1
        acc.total += 1
      } else {
        acc.failed += 1
      }
      return acc
    }, { total: 0, failed: 0 } as Record<string, number>)

    return {
      totalExports: stats.total,
      failedExports: stats.failed,
      successRate: stats.total > 0 ? ((stats.total / (stats.total + stats.failed)) * 100).toFixed(1) : '0',
      formatBreakdown: Object.entries(stats)
        .filter(([key]) => !['total', 'failed'].includes(key))
        .reduce((acc, [format, count]) => {
          acc[format] = count
          return acc
        }, {} as Record<string, number>)
    }
  }, [exportHistory])

  // ==================== 导出队列管理 ====================

  /**
   * 清除导出历史
   */
  const clearExportHistory = useCallback(() => {
    setExportHistory([])
  }, [])

  /**
   * 取消正在进行的导出
   */
  const cancelExport = useCallback(() => {
    setIsExporting(false)
    setExportProgress(0)
  }, [])

  return {
    // 状态
    isExporting,
    exportProgress,
    exportHistory,

    // 基础导出方法
    exportSingleSession,
    exportMultipleSessions,

    // 快捷导出方法
    exportAsPNG,
    exportAsPDF,
    exportAsJSON,
    exportAsCSV,

    // 模板导出
    getExportTemplates,
    exportWithTemplate,

    // 统计和管理
    getExportStats,
    clearExportHistory,
    cancelExport,
  }
} 