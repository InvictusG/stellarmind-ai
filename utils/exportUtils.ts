/**
 * 导出工具模块
 * 支持PNG、PDF、JSON、CSV等多种格式的导出功能
 */

import { SessionData } from '@/lib/database'
import { MindMapNode, MindMapEdge } from '@/types'

// ==================== 类型定义 ====================

export interface ExportOptions {
  format: 'png' | 'pdf' | 'json' | 'csv' | 'svg' | 'html'
  quality?: 'low' | 'medium' | 'high'
  includeMetadata?: boolean
  includeTimestamp?: boolean
  customFileName?: string
  pageSize?: 'A4' | 'A3' | 'Letter' | 'Legal'
  orientation?: 'portrait' | 'landscape'
}

export interface ExportResult {
  success: boolean
  fileName: string
  downloadUrl?: string
  data?: string | Blob
  error?: string
}

// ==================== 工具函数 ====================

/**
 * 生成文件名
 */
function generateFileName(
  baseName: string, 
  format: string, 
  includeTimestamp = true
): string {
  const timestamp = includeTimestamp 
    ? new Date().toISOString().slice(0, 19).replace(/[:\-T]/g, '')
    : ''
  
  const sanitizedName = baseName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')
  return `${sanitizedName}${timestamp ? `_${timestamp}` : ''}.${format}`
}

/**
 * 创建下载链接
 */
function createDownloadLink(
  data: Blob | string, 
  fileName: string, 
  mimeType: string
): string {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType })
  return URL.createObjectURL(blob)
}

/**
 * 触发文件下载
 */
function triggerDownload(url: string, fileName: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // 清理URL对象
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

// ==================== PNG导出 ====================

/**
 * 导出为PNG图片
 */
export async function exportToPNG(
  session: SessionData,
  options: ExportOptions = { format: 'png' }
): Promise<ExportResult> {
  try {
    // 获取思维导图画布元素
    const canvasElement = document.querySelector('#mindmap-canvas') as HTMLElement
    
    if (!canvasElement) {
      throw new Error('找不到思维导图画布元素')
    }

    // 动态导入html2canvas
    const html2canvas = (await import('html2canvas')).default
    
    // 设置导出质量
    const scale = options.quality === 'high' ? 3 : options.quality === 'medium' ? 2 : 1
    
    // 生成canvas
    const canvas = await html2canvas(canvasElement, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: canvasElement.scrollWidth,
      height: canvasElement.scrollHeight,
    })
    
    // 转换为PNG blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve({
            success: false,
            fileName: '',
            error: 'PNG生成失败'
          })
          return
        }
        
        const fileName = generateFileName(
          options.customFileName || session.title,
          'png',
          options.includeTimestamp
        )
        
        const downloadUrl = createDownloadLink(blob, fileName, 'image/png')
        
        // 自动触发下载
        triggerDownload(downloadUrl, fileName)
        
        resolve({
          success: true,
          fileName,
          downloadUrl,
          data: blob
        })
      }, 'image/png', options.quality === 'high' ? 1 : 0.8)
    })
  } catch (error) {
    console.error('PNG导出失败:', error)
    return {
      success: false,
      fileName: '',
      error: error instanceof Error ? error.message : 'PNG导出失败'
    }
  }
}

// ==================== PDF导出 ====================

/**
 * 导出为PDF文档
 */
export async function exportToPDF(
  session: SessionData,
  options: ExportOptions = { format: 'pdf' }
): Promise<ExportResult> {
  try {
    // 动态导入jsPDF
    const { jsPDF } = await import('jspdf')
    
    // 创建PDF文档
    const pdf = new jsPDF({
      orientation: options.orientation || 'landscape',
      unit: 'mm',
      format: options.pageSize || 'a4'
    })
    
    // 设置字体（支持中文）
    pdf.addFont('https://fonts.googleapis.com/css2?family=Noto+Sans+SC', 'NotoSansSC', 'normal')
    pdf.setFont('NotoSansSC')
    
    // 添加标题
    pdf.setFontSize(20)
    pdf.text(session.title, 20, 20)
    
    // 添加描述
    if (session.description) {
      pdf.setFontSize(12)
      pdf.text(session.description, 20, 35)
    }
    
    // 添加创建时间
    if (options.includeTimestamp) {
      pdf.setFontSize(10)
      pdf.text(`创建时间: ${session.createdAt.toLocaleString('zh-CN')}`, 20, 45)
      pdf.text(`更新时间: ${session.updatedAt.toLocaleString('zh-CN')}`, 20, 52)
    }
    
    // 获取思维导图图片
    const canvasElement = document.querySelector('#mindmap-canvas') as HTMLElement
    
    if (canvasElement) {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(canvasElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      
      // 计算图片在PDF中的尺寸
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      
      const maxWidth = pageWidth - (margin * 2)
      const maxHeight = pageHeight - 70 // 为标题和描述留出空间
      
      const imgRatio = canvas.width / canvas.height
      let imgWidth = maxWidth
      let imgHeight = imgWidth / imgRatio
      
      if (imgHeight > maxHeight) {
        imgHeight = maxHeight
        imgWidth = imgHeight * imgRatio
      }
      
      // 添加图片到PDF
      pdf.addImage(imgData, 'PNG', margin, 60, imgWidth, imgHeight)
    }
    
    // 添加节点文本信息
    if (session.nodes.length > 0) {
      pdf.addPage()
      pdf.setFontSize(16)
      pdf.text('问题详情', 20, 20)
      
      let yPosition = 35
      const lineHeight = 7
      
      session.nodes.forEach((node, index) => {
        // 检查是否需要新页面
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }
        
        pdf.setFontSize(12)
        pdf.setFont('NotoSansSC', 'bold')
        pdf.text(`${index + 1}. ${node.question}`, 20, yPosition)
        yPosition += lineHeight
        
        if (node.answer) {
          pdf.setFont('NotoSansSC', 'normal')
          pdf.setFontSize(10)
          
          // 处理长文本换行
          const textLines = pdf.splitTextToSize(node.answer, 170)
          textLines.forEach((line: string) => {
            if (yPosition > 250) {
              pdf.addPage()
              yPosition = 20
            }
            pdf.text(line, 25, yPosition)
            yPosition += lineHeight - 1
          })
        }
        
        yPosition += lineHeight
      })
    }
    
    // 添加元数据
    if (options.includeMetadata && session.metadata) {
      pdf.addPage()
      pdf.setFontSize(16)
      pdf.text('统计信息', 20, 20)
      
      pdf.setFontSize(10)
      let yPos = 35
      pdf.text(`查看次数: ${session.metadata.viewCount}`, 20, yPos)
      yPos += 7
      pdf.text(`点赞数: ${session.metadata.likeCount}`, 20, yPos)
      yPos += 7
      pdf.text(`是否收藏: ${session.metadata.bookmarked ? '是' : '否'}`, 20, yPos)
    }
    
    // 生成PDF
    const pdfBlob = pdf.output('blob')
    const fileName = generateFileName(
      options.customFileName || session.title,
      'pdf',
      options.includeTimestamp
    )
    
    const downloadUrl = createDownloadLink(pdfBlob, fileName, 'application/pdf')
    
    // 自动触发下载
    triggerDownload(downloadUrl, fileName)
    
    return {
      success: true,
      fileName,
      downloadUrl,
      data: pdfBlob
    }
  } catch (error) {
    console.error('PDF导出失败:', error)
    return {
      success: false,
      fileName: '',
      error: error instanceof Error ? error.message : 'PDF导出失败'
    }
  }
}

// ==================== JSON导出 ====================

/**
 * 导出为JSON格式
 */
export async function exportToJSON(
  session: SessionData,
  options: ExportOptions = { format: 'json' }
): Promise<ExportResult> {
  try {
    // 构建导出数据
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        nodes: session.nodes,
        edges: session.edges,
        config: session.config,
        tags: session.tags,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
        ...(options.includeMetadata && session.metadata && {
          metadata: session.metadata
        })
      }
    }
    
    // 格式化JSON字符串
    const jsonString = JSON.stringify(exportData, null, 2)
    const fileName = generateFileName(
      options.customFileName || session.title,
      'json',
      options.includeTimestamp
    )
    
    const downloadUrl = createDownloadLink(
      jsonString, 
      fileName, 
      'application/json'
    )
    
    // 自动触发下载
    triggerDownload(downloadUrl, fileName)
    
    return {
      success: true,
      fileName,
      downloadUrl,
      data: jsonString
    }
  } catch (error) {
    console.error('JSON导出失败:', error)
    return {
      success: false,
      fileName: '',
      error: error instanceof Error ? error.message : 'JSON导出失败'
    }
  }
}

// ==================== CSV导出 ====================

/**
 * 导出为CSV格式
 */
export async function exportToCSV(
  session: SessionData,
  options: ExportOptions = { format: 'csv' }
): Promise<ExportResult> {
  try {
    // 构建CSV头部
    const headers = ['序号', '问题', '答案', '节点类型', '创建时间']
    
    // 构建CSV数据行
    const rows = session.nodes.map((node, index) => [
      (index + 1).toString(),
      `"${node.question.replace(/"/g, '""')}"`, // 转义双引号
      `"${node.answer?.replace(/"/g, '""') || ''}"`,
      'question', // 默认节点类型
      node.createdAt ? new Date(node.createdAt).toLocaleString('zh-CN') : ''
    ])
    
    // 组合CSV内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    // 添加BOM以支持中文显示
    const csvWithBOM = '\uFEFF' + csvContent
    
    const fileName = generateFileName(
      options.customFileName || session.title,
      'csv',
      options.includeTimestamp
    )
    
    const downloadUrl = createDownloadLink(
      csvWithBOM,
      fileName,
      'text/csv;charset=utf-8'
    )
    
    // 自动触发下载
    triggerDownload(downloadUrl, fileName)
    
    return {
      success: true,
      fileName,
      downloadUrl,
      data: csvWithBOM
    }
  } catch (error) {
    console.error('CSV导出失败:', error)
    return {
      success: false,
      fileName: '',
      error: error instanceof Error ? error.message : 'CSV导出失败'
    }
  }
}

// ==================== SVG导出 ====================

/**
 * 导出为SVG格式
 */
export async function exportToSVG(
  session: SessionData,
  options: ExportOptions = { format: 'svg' }
): Promise<ExportResult> {
  try {
    // 获取SVG元素（如果使用SVG渲染思维导图）
    const svgElement = document.querySelector('#mindmap-canvas svg') as SVGElement
    
    if (!svgElement) {
      throw new Error('找不到SVG元素')
    }
    
    // 克隆SVG元素
    const clonedSvg = svgElement.cloneNode(true) as SVGElement
    
    // 设置SVG的宽高
    const bbox = (svgElement as any).getBBox()
    clonedSvg.setAttribute('width', bbox.width.toString())
    clonedSvg.setAttribute('height', bbox.height.toString())
    clonedSvg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`)
    
    // 获取SVG字符串
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(clonedSvg)
    
    // 添加XML声明
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`
    
    const fileName = generateFileName(
      options.customFileName || session.title,
      'svg',
      options.includeTimestamp
    )
    
    const downloadUrl = createDownloadLink(
      svgContent,
      fileName,
      'image/svg+xml'
    )
    
    // 自动触发下载
    triggerDownload(downloadUrl, fileName)
    
    return {
      success: true,
      fileName,
      downloadUrl,
      data: svgContent
    }
  } catch (error) {
    console.error('SVG导出失败:', error)
    return {
      success: false,
      fileName: '',
      error: error instanceof Error ? error.message : 'SVG导出失败'
    }
  }
}

// ==================== 统一导出接口 ====================

/**
 * 统一导出函数
 */
export async function exportSession(
  session: SessionData,
  options: ExportOptions
): Promise<ExportResult> {
  switch (options.format) {
    case 'png':
      return await exportToPNG(session, options)
    case 'pdf':
      return await exportToPDF(session, options)
    case 'json':
      return await exportToJSON(session, options)
    case 'csv':
      return await exportToCSV(session, options)
    case 'svg':
      return await exportToSVG(session, options)
    default:
      return {
        success: false,
        fileName: '',
        error: `不支持的导出格式: ${options.format}`
      }
  }
}

// ==================== 批量导出 ====================

/**
 * 批量导出多个会话
 */
export async function batchExportSessions(
  sessions: SessionData[],
  options: ExportOptions
): Promise<ExportResult[]> {
  const results: ExportResult[] = []
  
  for (const session of sessions) {
    const result = await exportSession(session, {
      ...options,
      customFileName: options.customFileName || session.title
    })
    results.push(result)
    
    // 添加延迟避免浏览器阻塞
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  return results
} 