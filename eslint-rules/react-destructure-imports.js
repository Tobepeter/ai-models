/**
 * ESLint 自定义规则：React 导入解构规范
 * 
 * 目标：强制使用 React 解构导入，不允许 React.ReactNode 这种写法
 * 
 * 规范：
 * 1. 检查是否使用了 React.* 的成员访问
 * 2. 建议改为解构导入 
 * 3. 支持常见的 React 类型和组件
 * 
 * 示例：
 * ❌ React.ReactNode
 * ❌ React.FC
 * ❌ React.useState
 * ✅ import { ReactNode, FC, useState } from 'react'
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: '强制使用 React 解构导入，不允许 React.* 成员访问',
      category: 'Best Practices',
    },
    fixable: false, // 自动修复需要分析导入，比较复杂
    schema: [{
      type: 'object',
      properties: {},
      additionalProperties: false
    }]
  },
  
  create(context) {
    /**
     * 检查成员访问表达式
     * @param {Object} node - AST 成员访问节点
     */
    function checkMemberExpression(node) {
      // 检查是否为 React.* 形式的访问
      if (
        node.object &&
        node.object.type === 'Identifier' &&
        node.object.name === 'React' &&
        node.property &&
        node.property.type === 'Identifier'
      ) {
        const memberName = node.property.name
        
        // 常见的需要解构导入的 React 成员
        const commonReactMembers = [
          // 类型
          'ReactNode', 'ReactElement', 'FC', 'Component', 'ComponentType',
          'PropsWithChildren', 'CSSProperties', 'HTMLAttributes', 'RefObject',
          
          // Hooks
          'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback',
          'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect',
          
          // 其他常用
          'createElement', 'cloneElement', 'Fragment', 'StrictMode',
          'Suspense', 'lazy', 'memo', 'forwardRef'
        ]
        
        if (commonReactMembers.includes(memberName)) {
          context.report({
            node,
            message: `不建议使用 'React.${memberName}'，请改为解构导入: import { ${memberName} } from 'react'`,
            data: {
              memberName
            }
          })
        }
      }
    }
    
    // 返回 ESLint 要监听的 AST 节点选择器
    return {
      // 监听成员访问表达式：React.ReactNode
      'MemberExpression': checkMemberExpression
    }
  }
}