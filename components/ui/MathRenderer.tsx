import React, { useEffect, useRef, useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface MathRendererProps {
  content: string
  className?: string
  showCursor?: boolean
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', showCursor = false }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // 使用useMemo缓存渲染结果，提高性能
  const renderedContent = useMemo(() => {
    if (!content) return ''

    // 先处理块级数学公式（双个$$），需要先处理以避免与单个$冲突
    let processedContent = content.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
      try {
        // 预处理块级公式
        let processedFormula = formula.trim()
          .replace(/\\frac\{1\}\{\\sqrt\{2\}\}/g, '\\frac{1}{\\sqrt{2}}')
          .replace(/\\Phi\^\{\\dagger\}/g, '\\Phi^{\\dagger}')

        return `<div class="math-block">${katex.renderToString(processedFormula, { 
          throwOnError: false,
          displayMode: true,
          strict: false,
          macros: {
            "\\hbar": "\\bar{h}",
            "\\ket": "|#1\\rangle",
            "\\bra": "\\langle#1|",
            "\\braket": "\\langle#1\\rangle"
          }
        })}</div>`
      } catch (error) {
        console.warn('KaTeX渲染失败（块级）:', formula, error)
        return `<div class="math-fallback" style="font-family: 'Times New Roman', serif; text-align: center; margin: 1em 0; font-size: 1.1em;">$$${formula}$$</div>`
      }
    })

    // 再处理行内数学公式（单个$），更强的错误处理
    processedContent = processedContent.replace(/\$([^$\n]+)\$/g, (match, formula) => {
      try {
        // 预处理一些常见的量子力学符号
        let processedFormula = formula.trim()
          .replace(/\\psi\\rangle/g, '\\psi\\rangle')
          .replace(/\\alpha\\|0\\rangle/g, '\\alpha|0\\rangle')  
          .replace(/\\beta\\|1\\rangle/g, '\\beta|1\\rangle')
          .replace(/\\|([^\\|]+)\\rangle/g, '|$1\\rangle')
          .replace(/\\Phi\^\{\\dagger\}/g, '\\Phi^{\\dagger}')

        return `<span class="math-inline">${katex.renderToString(processedFormula, { 
          throwOnError: false,
          displayMode: false,
          strict: false,
          macros: {
            "\\hbar": "\\bar{h}",
            "\\ket": "|#1\\rangle",
            "\\bra": "\\langle#1|",
            "\\braket": "\\langle#1\\rangle"
          }
        })}</span>`
      } catch (error) {
        console.warn('KaTeX渲染失败（行内）:', formula, error)
        // 如果KaTeX失败，至少保持格式
        return `<span class="math-fallback" style="font-family: 'Times New Roman', serif; font-style: italic;">$${formula}$</span>`
      }
    })

    // 处理普通文本（换行）
    processedContent = processedContent.replace(/\n/g, '<br/>')

    // 添加打字机光标（确保不会与数学公式冲突）
    if (showCursor) {
      processedContent += '<span class="typing-cursor"> |</span>'
    }

    return processedContent
  }, [content])

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = renderedContent
  }, [renderedContent])

  return (
    <div 
      ref={containerRef}
      className={`math-content ${className}`}
      style={{
        lineHeight: '1.6',
        fontSize: '15px'
      }}
    />
  )
}

export default MathRenderer 