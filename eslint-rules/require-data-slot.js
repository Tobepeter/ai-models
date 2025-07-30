/**
 * ESLint 自定义规则：要求 React 组件的顶级元素添加 data-slot 属性
 * 
 * 目标：强制 TSX 文件中的 React 组件在返回的第一个非 Fragment 元素上添加 data-slot 属性
 * 用于提升调试体验和组件定位能力
 * 
 * 规范：
 * 1. 检查 React 组件的 return 语句
 * 2. 如果返回的是 JSX 元素（非 Fragment），必须包含 data-slot 属性
 * 3. data-slot 的值应该是 kebab-case 格式的组件名
 * 
 * 示例：
 * ❌ return <div className="feed-item">...</div>
 * ✅ return <div data-slot="feed-item" className="feed-item">...</div>
 * ✅ return <article data-slot="feed-item">...</article>
 * ✅ return <>...</> // Fragment 不需要 data-slot
 */
export default {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'React 组件的顶级元素必须包含 data-slot 属性',
			category: 'Best Practices',
		},
		fixable: 'code', // 支持自动修复
		schema: [
			{
				type: 'object',
				properties: {
					autoFix: {
						type: 'boolean',
						description: '是否自动生成 data-slot 值',
						default: true,
					},
				},
				additionalProperties: false,
			},
		],
	},

	create(context) {
		const filename = context.getFilename()
		const isTsxFile = filename.endsWith('.tsx')
		const options = context.options[0] || {}
		const autoFix = options.autoFix !== false

		if (!isTsxFile) return {}

		/**
		 * 判断函数节点是否为 React 组件
		 */
		function isReactComponent(node) {
			if (node.type === 'FunctionDeclaration') {
				return node.id && /^[A-Z]/.test(node.id.name)
			}

			if (node.type === 'ArrowFunctionExpression') {
				const parent = node.parent
				if (parent.type === 'VariableDeclarator' && parent.id.name) {
					return /^[A-Z]/.test(parent.id.name)
				}
				if (parent.type === 'ExportDefaultDeclaration') {
					return true
				}
			}

			return false
		}

		/**
		 * 获取组件名称
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
			}

			return null
		}

		/**
		 * 将组件名转换为 kebab-case
		 */
		function toKebabCase(str) {
			return str
				.replace(/([a-z])([A-Z])/g, '$1-$2')
				.toLowerCase()
		}

		/**
		 * 检查 JSX 元素是否有 data-slot 属性
		 */
		function hasDataSlot(jsxElement) {
			if (!jsxElement.openingElement) return false
			
			return jsxElement.openingElement.attributes.some(attr => 
				attr.type === 'JSXAttribute' && 
				attr.name && 
				attr.name.name === 'data-slot'
			)
		}

		/**
		 * 检查是否为 Fragment
		 */
		function isFragment(jsxElement) {
			if (!jsxElement.openingElement) return false
			
			const elementName = jsxElement.openingElement.name
			return (
				elementName.type === 'JSXFragment' ||
				(elementName.type === 'JSXIdentifier' && elementName.name === 'Fragment') ||
				(elementName.type === 'JSXMemberExpression' && 
				 elementName.object.name === 'React' && 
				 elementName.property.name === 'Fragment')
			)
		}

		/**
		 * 查找组件的返回语句中的顶级 JSX 元素
		 */
		function findTopLevelJSXElement(node) {
			const body = node.body

			// 处理箭头函数直接返回 JSX 的情况
			if (body.type === 'JSXElement' || body.type === 'JSXFragment') {
				return body
			}

			// 处理函数体中的 return 语句
			if (body.type === 'BlockStatement') {
				for (const stmt of body.body) {
					if (stmt.type === 'ReturnStatement' && stmt.argument) {
						if (stmt.argument.type === 'JSXElement' || stmt.argument.type === 'JSXFragment') {
							return stmt.argument
						}
					}
				}
			}

			return null
		}

		/**
		 * 检查组件的 data-slot 要求
		 */
		function checkComponentDataSlot(node) {
			if (!isReactComponent(node)) return

			const topLevelJSX = findTopLevelJSXElement(node)
			if (!topLevelJSX) return

			// Fragment 不需要 data-slot
			if (topLevelJSX.type === 'JSXFragment' || isFragment(topLevelJSX)) {
				return
			}

			// 检查是否有 data-slot 属性
			if (!hasDataSlot(topLevelJSX)) {
				const componentName = getComponentName(node)
				const suggestedSlot = componentName ? toKebabCase(componentName) : 'component'

				context.report({
					node: topLevelJSX.openingElement,
					message: `React 组件的顶级元素缺少 data-slot 属性，建议使用 data-slot="${suggestedSlot}"`,
					fix: autoFix ? (fixer) => {
						// 自动修复：在开标签中添加 data-slot 属性
						const openingElement = topLevelJSX.openingElement
						const lastAttr = openingElement.attributes[openingElement.attributes.length - 1]
						
						if (lastAttr) {
							// 在最后一个属性后添加
							return fixer.insertTextAfter(lastAttr, ` data-slot="${suggestedSlot}"`)
						} else {
							// 在标签名后添加
							return fixer.insertTextAfter(openingElement.name, ` data-slot="${suggestedSlot}"`)
						}
					} : null,
				})
			}
		}

		return {
			'FunctionDeclaration, ArrowFunctionExpression': checkComponentDataSlot,
		}
	},
}
