import MagicString from 'magic-string'
import type { Plugin } from 'vite'

interface AutoWindowInjectOptions {
  /** 文件匹配模式，默认匹配 *-util.ts */
  include?: RegExp
  /** 是否在生产环境启用，默认仅开发环境 */
  enableInProduction?: boolean
}

/**
 * Vite插件：自动将导出的变量注入到window对象中，方便调试
 * 
 * 特性：
 * - 仅处理匹配的文件（默认 *-util.ts）
 * - 防止覆盖已存在的window属性
 * - 保持sourcemap映射
 * - 仅在开发环境启用（可配置）
 */
export function autoWindowInjectPlugin(options: AutoWindowInjectOptions = {}): Plugin {
  const {
    include = /-util\.ts$/,
    enableInProduction = false
  } = options

  return {
    name: 'auto-window-inject',
    transform(code: string, id: string) {
      // 仅在开发环境启用（除非明确配置）
      if (!enableInProduction && process.env.NODE_ENV === 'production') {
        return
      }

      // 检查文件是否匹配
      if (!include.test(id)) {
        return
      }

      // 提取所有export const导出
      const exports = extractExports(code)
      if (exports.length === 0) {
        return
      }

      console.log(`[auto-window-inject] 找到 ${exports.length} 个导出变量:`, exports, `文件: ${id}`)

      // 生成注入代码，包含冲突检查
      const s = new MagicString(code)
      const injectionCode = generateInjectionCode(exports, id)
      
      s.append(injectionCode)

      return {
        code: s.toString(),
        map: s.generateMap({
          source: id,
          file: id,
          includeContent: true
        })
      }
    }
  }
}

/**
 * 提取export const声明的变量名
 */
function extractExports(code: string): string[] {
  const exports: string[] = []
  
  // 匹配 export const varName 或 export { varName }
  const exportConstRegex = /export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
  const exportBraceRegex = /export\s*\{\s*([^}]+)\s*\}/g
  
  let match
  
  // 提取 export const
  while ((match = exportConstRegex.exec(code)) !== null) {
    exports.push(match[1])
  }
  
  // 提取 export { ... }
  while ((match = exportBraceRegex.exec(code)) !== null) {
    const exportList = match[1]
      .split(',')
      .map(item => item.trim().split(/\s+as\s+/)[0].trim()) // 处理 as 重命名
      .filter(name => name && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name))
    
    exports.push(...exportList)
  }
  
  return [...new Set(exports)] // 去重
}

/**
 * 生成window注入代码，包含冲突检查
 */
function generateInjectionCode(exports: string[], filePath: string): string {
  const fileName = filePath.split('/').pop() || 'unknown'
  
  const injections = exports.map(varName => `
    if (typeof window !== 'undefined') {
      if (window.hasOwnProperty('${varName}')) {
        console.warn('[auto-window-inject] 冲突警告: window.${varName} 已存在，跳过注入 (来源: ${fileName})')
      } else {
        window.${varName} = ${varName}
        // console.log('[auto-window-inject] 注入成功: window.${varName} (来源: ${fileName})')
      }
    }`).join('')

  return `

// === Auto Window Injection (开发调试用) ===
// 文件: ${fileName}
// 导出变量: ${exports.join(', ')}
${injections}
// === End Auto Window Injection ===`
}