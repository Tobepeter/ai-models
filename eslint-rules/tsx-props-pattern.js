/**
 * ESLint 自定义规则：TSX 组件参数规范
 *
 * 目标：强制 TSX 文件中的 React 组件遵循以下规范：
 * 1. 组件函数只能有 0 或 1 个参数
 * 2. 如果有参数，必须命名为 'props'
 * 3. 不能在函数签名中直接解构参数
 * 4. 解构操作应该在函数体内进行
 *
 * 示例：
 * ❌ const MyComponent = ({ title, content }) => {} // 不能直接解构
 * ❌ const MyComponent = (data) => {}                // 参数名必须是 props
 * ❌ const MyComponent = (props, context) => {}     // 只能有一个参数
 * ✅ const MyComponent = (props) => { const { title } = props; }
 */
export default {
	meta: {
		type: 'suggestion', // 规则类型：建议性规则
		docs: {
			description: 'TSX 文件中的组件函数参数必须命名为 props 且只能有一个参数',
			category: 'Stylistic Issues', // 分类：代码风格问题
		},
		fixable: 'code', // 支持自动修复（仅限简单的参数名修改）
		schema: [
			{
				// 规则配置选项的 JSON Schema
				type: 'object',
				properties: {},
				additionalProperties: false,
			},
		],
	},

	create(context) {
		// 获取当前检查文件的路径
		const filename = context.getFilename()

		// 只检查 .tsx 文件（React 组件文件）
		const isTsxFile = filename.endsWith('.tsx')

		/**
		 * 判断函数是否为 React 组件
		 * React 组件的特征：
		 * 1. 函数名以大写字母开头（约定）
		 * 2. 或者是默认导出的函数
		 *
		 * @param {Object} node - AST 函数节点
		 * @returns {boolean} 是否为 React 组件
		 */
		function isReactComponent(node) {
			// 情况1: function MyComponent() {} - 函数声明
			if (node.type === 'FunctionDeclaration') {
				return node.id && /^[A-Z]/.test(node.id.name)
			}

			// 情况2: const MyComponent = () => {} - 箭头函数
			if (node.type === 'ArrowFunctionExpression') {
				const parent = node.parent

				// 变量声明：const MyComponent = () => {}
				if (parent.type === 'VariableDeclarator' && parent.id.name) {
					return /^[A-Z]/.test(parent.id.name)
				}

				// 默认导出：export default () => {}
				if (parent.type === 'ExportDefaultDeclaration') {
					return true
				}
			}

			return false
		}

		/**
		 * 检查组件函数的参数是否符合规范
		 *
		 * @param {Object} node - AST 函数节点
		 */
		function checkComponentParams(node) {
			// 只检查 TSX 文件中的 React 组件
			if (!isTsxFile || !isReactComponent(node)) {
				return
			}

			const params = node.params // 获取函数参数列表

			// 1. 检查参数数量
			if (params.length === 0) {
				return // 无参数组件是允许的，如：const Loading = () => <div>Loading...</div>
			}

			if (params.length > 1) {
				// 错误：参数过多
				// 例如：const MyComponent = (props, context) => {}
				context.report({
					node,
					message: 'React 组件只能有一个参数',
				})
				return
			}

			const param = params[0] // 获取第一个（也是唯一的）参数

			// 2. 检查参数是否为解构模式
			if (param.type === 'ObjectPattern') {
				// 错误：在函数签名中直接解构
				// 例如：const MyComponent = ({ title, content }) => {}
				context.report({
					node: param,
					message: 'React 组件参数不能在函数签名中解构，应使用 props 参数名并在函数体内解构',
				})
				return
			}

			// NOTE: 不检查参数是否是props，有的tsx是一些函数的自定义人renderer，但是参数解构是很丑陋的
		}

		// 返回 ESLint 要监听的 AST 节点选择器
		return {
			// 监听所有函数声明和箭头函数表达式
			'FunctionDeclaration, ArrowFunctionExpression': checkComponentParams,
		}
	},
}
