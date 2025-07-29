/**
 * ESLint 自定义规则：Props children 使用规范
 * 
 * 目标：强制 TSX 文件中带有 Props 后缀的接口如果包含 children，
 * 应该使用 PropsWithChildren<T> 而不是手动定义 children 属性
 * 
 * 规范：
 * 1. 检查以 Props 结尾的 interface/type 定义
 * 2. 如果包含 children 属性，提示使用 PropsWithChildren
*  3. 使用使用放到组件props上，如 export const MyComponent = (props: PropsWithChildren<T>) => { ... }
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'TSX 文件中带有 Props 后缀的类型如果包含 children，应使用 PropsWithChildren',
      category: 'Best Practices',
    },
    fixable: false, // children 的重构比较复杂，不提供自动修复
    schema: [{
      type: 'object',
      properties: {
      },
      additionalProperties: false
    }]
  },
  
  create(context) {
    // 获取当前检查文件的路径
    const filename = context.getFilename()
    
    // 只检查 .tsx 文件
    const isTsxFile = filename.endsWith('.tsx')
    
    if (!isTsxFile) return {}
    
    /**
     * 检查类型名是否以 Props 结尾
     * @param {string} name - 类型名称
     * @returns {boolean} 是否为 Props 类型
     */
    function isPropsType(name) {
      return name && name.endsWith('Props')
    }
    
    /**
     * 检查对象类型中是否包含 children 属性
     * @param {Object} typeNode - TypeScript 类型节点
     * @returns {Object|null} children 属性节点或 null
     */
    function findChildrenProperty(typeNode) {
      if (!typeNode) return null
      
      // 处理对象类型字面量：{ title: string; children: ReactNode }
      if (typeNode.type === 'TSTypeLiteral') {
        return typeNode.members.find(member => 
          member.type === 'TSPropertySignature' &&
          member.key &&
          member.key.name === 'children'
        )
      }
      
      // 处理接口体：interface Props { children: ReactNode }
      if (typeNode.type === 'TSInterfaceBody') {
        return typeNode.body.find(member =>
          member.type === 'TSPropertySignature' &&
          member.key &&
          member.key.name === 'children'
        )
      }
      
      return null
    }
    
    /**
     * 检查接口声明
     * @param {Object} node - AST 接口节点
     */
    function checkInterfaceDeclaration(node) {
      const interfaceName = node.id.name
      
      // 只检查以 Props 结尾的接口
      if (!isPropsType(interfaceName)) {
        return
      }
      
      // 检查接口体中是否有 children 属性
      const childrenProp = findChildrenProperty(node.body)
      
      if (childrenProp) {
        context.report({
          node: childrenProp,
          message: `接口 '${interfaceName}' 包含 children 属性，建议使用 PropsWithChildren<T> 或 extends PropsWithChildren`,
          data: {
            interfaceName
          }
        })
      }
    }
    
    /**
     * 检查类型别名声明
     * @param {Object} node - AST 类型别名节点
     */
    function checkTypeAliasDeclaration(node) {
      const typeName = node.id.name
      
      // 只检查以 Props 结尾的类型
      if (!isPropsType(typeName)) {
        return
      }
      
      // 检查类型定义中是否有 children 属性
      const childrenProp = findChildrenProperty(node.typeAnnotation)
      
      if (childrenProp) {
        context.report({
          node: childrenProp,
          message: `类型 '${typeName}' 包含 children 属性，建议使用 PropsWithChildren<T>`,
          data: {
            typeName
          }
        })
      }
    }
    
    // 返回 ESLint 要监听的 AST 节点选择器
    return {
      // 监听接口声明：interface MyProps { ... }
      'TSInterfaceDeclaration': checkInterfaceDeclaration,
      
      // 监听类型别名声明：type MyProps = { ... }
      'TSTypeAliasDeclaration': checkTypeAliasDeclaration
    }
  }
}