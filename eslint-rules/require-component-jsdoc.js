/**
 * ESLint custom rule: require JSDoc for React components with props
 */
export default {
	meta: {
		type: 'suggestion',
		docs: {
			description: '带有 props 参数的 React 组件必须有 JSDoc 注释',
			category: 'Best Practices',
		},
		fixable: null, // 不提供自动修复（JSDoc 内容需要人工编写）
		schema: [],
	},

	create(context) {
		const filename = context.getFilename()
		const isTsxFile = filename.endsWith('.tsx')

		// 获取源代码对象，用于检查注释
		const sourceCode = context.getSourceCode()

		/**
		 * 判断函数节点是否为 React 组件
		 * @param {Object} node - AST 函数节点
		 * @returns {boolean} 是否为 React 组件
		 */
		function isReactComponent(node) {
			// 函数声明：function MyComponent() {}
			if (node.type === 'FunctionDeclaration') {
				return node.id && /^[A-Z]/.test(node.id.name)
			}

			// 箭头函数：const MyComponent = () => {}
			if (node.type === 'ArrowFunctionExpression') {
				const parent = node.parent

				// 变量声明形式
				if (parent.type === 'VariableDeclarator' && parent.id.name) {
					return /^[A-Z]/.test(parent.id.name)
				}

				// 默认导出形式
				if (parent.type === 'ExportDefaultDeclaration') {
					return true
				}
			}

			return false
		}

		/**
		 * 检查函数是否有 props 参数
		 * @param {Object} node - AST 函数节点
		 * @returns {boolean} 是否有名为 'props' 的参数
		 */
		function hasPropsParameter(node) {
			const params = node.params
			return params.length === 1 && 
				   params[0].type === 'Identifier' && 
				   params[0].name === 'props'
		}

		/**
		 * 检查函数是否有 JSDoc 注释
		 * @param {Object} node - AST 函数节点
		 * @returns {boolean} 是否有 JSDoc 注释
		 */
		function hasJSDocComment(node) {
			// 对于箭头函数，需要检查变量声明的注释
			let targetNode = node
			if (node.type === 'ArrowFunctionExpression' && node.parent.type === 'VariableDeclarator') {
				// 找到包含变量声明的语句
				let parent = node.parent
				while (parent && parent.type !== 'VariableDeclaration') {
					parent = parent.parent
				}
				if (parent) targetNode = parent
			}

			// 获取节点前的注释
			const comments = sourceCode.getCommentsBefore(targetNode)
			
			// 检查是否有 JSDoc 风格的注释（以 /** 开头）
			return comments.some(comment => 
				comment.type === 'Block' && comment.value.startsWith('*')
			)
		}

		/**
		 * 检查组件是否需要 JSDoc 并报告错误
		 * @param {Object} node - AST 函数节点
		 */
		function checkComponentJSDoc(node) {
			// 只检查 TSX 文件中的 React 组件
			if (!isTsxFile || !isReactComponent(node)) {
				return
			}

			// 只检查有 props 参数的组件
			if (!hasPropsParameter(node)) {
				return
			}

			// 检查是否有 JSDoc 注释
			if (!hasJSDocComment(node)) {
				const componentName = getComponentName(node)
				context.report({
					node,
					message: `React 组件 '${componentName}' 有 props 参数但缺少 JSDoc 注释`,
				})
			}
		}

		/**
		 * 获取组件名称用于错误报告
		 * @param {Object} node - AST 函数节点
		 * @returns {string} 组件名称
		 */
		function getComponentName(node) {
			if (node.type === 'FunctionDeclaration' && node.id) {
				return node.id.name
			}

			if (node.type === 'ArrowFunctionExpression') {
				const parent = node.parent
				if (parent.type === 'VariableDeclarator' && parent.id.name) {
					return parent.id.name
				}
				if (parent.type === 'ExportDefaultDeclaration') {
					return 'default export'
				}
			}

			return 'unknown'
		}

		return {
			'FunctionDeclaration, ArrowFunctionExpression': checkComponentJSDoc,
		}
	},
}