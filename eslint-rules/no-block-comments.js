/**
 * ESLint 自定义规则：禁止使用块注释
 * 
 * 目标：强制使用单行注释必须双斜杠
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: '禁止使用块注释，建议使用单行注释 //',
      category: 'Stylistic Issues',
    },
    fixable: false, // 不提供自动修复
    schema: [{
      type: 'object',
      properties: {
        allowJSDoc: {
          type: 'boolean',
          description: '是否允许 JSDoc 注释 (/** */)'
        },
      },
      additionalProperties: false
    }]
  },
  
  create(context) {
    // 获取规则配置选项
    const options = context.options[0] || {}
    const allowJSDoc = options.allowJSDoc !== false // 默认允许 JSDoc
    
    /**
     * 判断注释是否为 JSDoc 注释
     * @param {string} commentValue - 注释内容
     * @returns {boolean} 是否为 JSDoc 注释
     */
    function isJSDocComment(commentValue) {
      // JSDoc 注释以 * 开头，如 /** 注释内容 */
      return commentValue.startsWith('*')
    }
    
    /**
     * 检查块注释节点
     * @param {Object} comment - ESLint 注释节点
     */
    function checkBlockComment(comment) {
      // 只检查块注释 (Block)，不检查行注释 (Line)
      if (comment.type !== 'Block') return
      
      const commentValue = comment.value
      const isJSDoc = isJSDocComment(commentValue)
      
      // 如果允许 JSDoc 且当前是 JSDoc 注释，则跳过
      if (allowJSDoc && isJSDoc) return
      
      // 判断注释类型用于错误消息
      const commentType = isJSDoc ? 'JSDoc 注释' : '块注释'
      const suggestion = isJSDoc 
        ? '建议使用标准 JSDoc 格式或改为单行注释 //'
        : '建议改为单行注释 //'
      
      // 获取注释内容预览（用于错误消息）
      const preview = commentValue.trim().substring(0, 20)
      const previewText = preview.length < commentValue.trim().length 
        ? `${preview}...` 
        : preview
      
      context.report({
        loc: {
          start: comment.loc.start,
          end: comment.loc.end
        },
        message: `不允许使用${commentType}：/*${previewText}*/，${suggestion}`
      })
    }
    
    // 返回 ESLint 程序节点，用于获取注释
    return {
      Program() {
        // 获取源代码对象
        const sourceCode = context.getSourceCode()
        
        // 获取所有注释节点
        const comments = sourceCode.getAllComments()
        
        // 检查每个注释
        comments.forEach(checkBlockComment)
      }
    }
  }
}