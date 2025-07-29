//
// ESLint 自定义规则：禁止简单返回值类型注解
//
// 目标：移除函数中不必要的简单返回值类型注解，让 TypeScript 自动推断类型
//
// 检测的简单类型：
// - void：无返回值函数
// - string：字符串返回值
// - number：数字返回值
// - boolean：布尔返回值
// - Promise<void>：异步无返回值函数
//
// 原理：这些简单类型可以被 TypeScript 自动推断，显式标注是冗余的
//
// 示例：
// ❌ function getName(): string { return 'hello' }
// ❌ const isValid = (): boolean => true
// ❌ async function save(): Promise<void> { await api.save() }
// ❌ const onClick = (): void => { console.log('click') }
//
// ✅ function getName() { return 'hello' }           // 自动推断为 string
// ✅ const isValid = () => true                      // 自动推断为 boolean
// ✅ async function save() { await api.save() }      // 自动推断为 Promise<void>
// ✅ const onClick = () => { console.log('click') }  // 自动推断为 void
//
export default {
  meta: {
    type: 'suggestion',  // 规则类型：建议性规则
    docs: {
      description: '禁止使用简单的返回值类型注解',
      category: 'Stylistic Issues',  // 分类：代码风格问题
    },
    fixable: 'code',  // 支持自动修复
    schema: []        // 无额外配置选项
  },
  
  create(context) {
    //
// 检查函数的返回值类型注解是否为简单类型
// @param {Object} node - AST 函数节点
//
    function checkReturnType(node) {
      // 如果函数没有返回值类型注解，跳过检查
      if (!node.returnType) return
      
      const { typeAnnotation } = node.returnType
      let typeName = ''
      
      // 根据 TypeScript AST 节点类型判断返回值类型
      switch (typeAnnotation?.type) {
        case 'TSVoidKeyword':
          // 处理 void 类型：() => void
          typeName = 'void'
          break
        case 'TSStringKeyword':
          // 处理 string 类型：() => string  
          typeName = 'string'
          break
        case 'TSNumberKeyword':
          // 处理 number 类型：() => number
          typeName = 'number'
          break
        case 'TSBooleanKeyword':
          // 处理 boolean 类型：() => boolean
          typeName = 'boolean'
          break
        case 'TSTypeReference':
          // 处理类型引用，特别检查 Promise<void>
          if (typeAnnotation.typeName?.name === 'Promise' &&
              typeAnnotation.typeParameters?.params?.[0]?.type === 'TSVoidKeyword') {
            typeName = 'Promise<void>'
          } else {
            return // 其他复杂类型（如自定义类型）不处理
          }
          break
        default:
          return // 其他复杂类型不处理
      }
      
      // 报告问题并提供自动修复
      context.report({
        node: node.returnType,
        message: `Remove simple return type annotation: ${typeName}`,
        fix(fixer) {
          // 自动修复：移除整个返回值类型注解
          return fixer.remove(node.returnType)
        }
      })
    }
    
    // 返回 ESLint 要监听的 AST 节点选择器
    return {
      // 监听所有类型的函数：函数声明、箭头函数、函数表达式、方法定义
      'FunctionDeclaration, ArrowFunctionExpression, FunctionExpression, MethodDefinition > FunctionExpression': checkReturnType
    }
  }
}