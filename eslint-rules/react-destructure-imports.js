/**
 * ESLint 自定义规则：React 导入解构规范
 *
 * 目标：强制使用 React 解构导入，不允许 React.ReactNode 这种写法
 *
 * 示例：
 * ❌ React.ReactNode
 * ❌ React.CSSProperties
 * ✅ import { ReactNode, CSSProperties } from 'react'
 */
export default {
	meta: {
		type: 'suggestion',
		docs: {
			description: '强制使用 React 解构导入，不允许 React.* 成员访问',
			category: 'Best Practices',
		},
		fixable: false,
		schema: [],
	},

	create(context) {
		// 常见的需要解构导入的 React 成员
		const commonReactMembers = [
			'ReactNode',
			'ReactElement',
			'FC',
			'Component',
			'ComponentType',
			'PropsWithChildren',
			'CSSProperties',
			'HTMLAttributes',
			'RefObject',
			'useState',
			'useEffect',
			'useContext',
			'useReducer',
			'useCallback',
			'useMemo',
			'useRef',
			'createElement',
			'Fragment',
			'memo',
			'forwardRef',
		]

		/* 报告 React.* 使用 */
		function reportReactMember(node, memberName) {
			if (commonReactMembers.includes(memberName)) {
				context.report({
					node,
					message: `不建议使用 'React.${memberName}'，请改为解构导入: import { ${memberName} } from 'react'`,
				})
			}
		}

		return {
			// 检查表达式中的 React.* 用法
			MemberExpression: (node) => {
				if (node.object?.type === 'Identifier' && node.object.name === 'React' && node.property?.type === 'Identifier') {
					reportReactMember(node, node.property.name)
				}
			},

			// 检查类型注解中的 React.* 用法
			TSTypeReference: (node) => {
				if (node.typeName?.type === 'TSQualifiedName' && node.typeName.left?.type === 'Identifier' && node.typeName.left.name === 'React' && node.typeName.right?.type === 'Identifier') {
					reportReactMember(node, node.typeName.right.name)
				}
			},
		}
	},
}
