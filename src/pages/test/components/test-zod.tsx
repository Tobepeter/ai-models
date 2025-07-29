import { useState } from 'react'
import { z } from 'zod'

// 基础类型验证
const basicSchema = z.object({
	name: z.string().min(1, '姓名不能为空'),
	age: z.number().min(0, '年龄不能为负数').max(120, '年龄不能超过120'),
	email: z.email('邮箱格式不正确'),
	isActive: z.boolean(),
})

// 复杂类型验证
const userSchema = z.object({
	id: z.uuid({ message: 'ID必须是UUID格式' }),
	profile: z.object({
		firstName: z.string().min(1),
		lastName: z.string().min(1),
		bio: z.string().optional(), // 可选字段
	}),
	tags: z.array(z.string()).min(1, '至少需要一个标签'),
	role: z.enum(['admin', 'user', 'guest']),
	createdAt: z.date(),
	metadata: z.record(z.string(), z.any()), // 键值对
})

// 联合类型
const messageSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('text'),
		content: z.string(),
	}),
	z.object({
		type: z.literal('image'),
		url: z.url('URL格式不正确'),
		alt: z.string().optional(),
	}),
])

// 条件验证
const passwordSchema = z
	.object({
		password: z.string().min(8, '密码至少8位'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: '密码确认不匹配',
		path: ['confirmPassword'],
	})

// 转换和预处理
const numberStringSchema = z.string().transform((val) => parseInt(val, 10))
const trimmedStringSchema = z.string().transform((val) => val.trim())

// TypeScript 类型推断示例
type BasicUser = z.infer<typeof basicSchema> // 从 schema 推断类型
type User = z.infer<typeof userSchema>
type Message = z.infer<typeof messageSchema>

export default function TestZod() {
	const [results, setResults] = useState<string[]>([])

	const addResult = (msg: string) => {
		setResults((prev) => [...prev, msg])
	}

	const clearResults = () => setResults([])

	// 测试基础验证
	const testBasicValidation = () => {
		try {
			const validData = {
				name: 'John Doe',
				age: 25,
				email: 'john@example.com',
				isActive: true,
			}
			const result = basicSchema.parse(validData)
			addResult(`✅ 基础验证成功: ${JSON.stringify(result)}`)
		} catch (error) {
			if (error instanceof z.ZodError) {
				addResult(`❌ 基础验证失败: ${error.issues.map((e) => e.message).join(', ')}`)
			}
		}

		// 测试失败情况
		try {
			const invalidData = {
				name: '',
				age: -5,
				email: 'invalid-email',
				isActive: 'yes', // 错误类型
			}
			basicSchema.parse(invalidData)
		} catch (error) {
			if (error instanceof z.ZodError) {
				addResult(`❌ 预期的验证错误: ${error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`)
			}
		}
	}

	// 测试安全解析
	const testSafeParse = () => {
		const data = { name: 'Test', age: 'not-a-number', email: 'test@test.com', isActive: true }
		const result = basicSchema.safeParse(data)

		if (result.success) {
			addResult(`✅ SafeParse 成功: ${JSON.stringify(result.data)}`)
		} else {
			addResult(`❌ SafeParse 失败: ${result.error.issues.map((e) => e.message).join(', ')}`)
		}
	}

	// 测试部分验证
	const testPartialValidation = () => {
		const partialSchema = basicSchema.partial() // 所有字段变为可选
		const data = { name: 'John' } // 只提供部分数据

		try {
			const result = partialSchema.parse(data)
			addResult(`✅ 部分验证成功: ${JSON.stringify(result)}`)
		} catch (error) {
			if (error instanceof z.ZodError) {
				addResult(`❌ 部分验证失败: ${error.issues.map((e) => e.message).join(', ')}`)
			}
		}
	}

	// 测试数据转换
	const testTransformation = () => {
		try {
			const stringNumber = '123'
			const result = numberStringSchema.parse(stringNumber)
			addResult(`✅ 字符串转数字: "${stringNumber}" -> ${result} (类型: ${typeof result})`)

			const messyString = '  hello world  '
			const trimmed = trimmedStringSchema.parse(messyString)
			addResult(`✅ 字符串去空格: "${messyString}" -> "${trimmed}"`)
		} catch (error) {
			addResult(`❌ 转换失败: ${error}`)
		}
	}

	// 测试联合类型
	const testUnionTypes = () => {
		const textMessage = { type: 'text' as const, content: 'Hello world' }
		const imageMessage = { type: 'image' as const, url: 'https://example.com/image.jpg', alt: 'Example' }

		try {
			const text = messageSchema.parse(textMessage)
			const image = messageSchema.parse(imageMessage)
			addResult(`✅ 联合类型验证成功: 文本消息和图片消息`)
		} catch (error) {
			if (error instanceof z.ZodError) {
				addResult(`❌ 联合类型验证失败: ${error.issues.map((e) => e.message).join(', ')}`)
			}
		}
	}

	// 测试条件验证
	const testConditionalValidation = () => {
		const validPassword = { password: 'password123', confirmPassword: 'password123' }
		const invalidPassword = { password: 'password123', confirmPassword: 'different' }

		try {
			passwordSchema.parse(validPassword)
			addResult(`✅ 密码验证成功`)
		} catch (error) {
			if (error instanceof z.ZodError) {
				addResult(`❌ 密码验证失败: ${error.issues.map((e) => e.message).join(', ')}`)
			}
		}

		try {
			passwordSchema.parse(invalidPassword)
		} catch (error) {
			if (error instanceof z.ZodError) {
				addResult(`❌ 预期的密码不匹配错误: ${error.issues.map((e) => e.message).join(', ')}`)
			}
		}
	}

	// 测试默认值
	const testDefaultValues = () => {
		const schemaWithDefaults = z.object({
			name: z.string(),
			role: z.string().default('user'),
			isActive: z.boolean().default(true),
			count: z.number().default(0),
		})

		const data = { name: 'John' }
		const result = schemaWithDefaults.parse(data)
		addResult(`✅ 默认值测试: ${JSON.stringify(result)}`)
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">Zod 验证库使用示例</h1>

			<div className="grid grid-cols-2 gap-4 mb-6">
				<button onClick={testBasicValidation} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
					基础验证测试
				</button>

				<button onClick={testSafeParse} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
					安全解析测试
				</button>

				<button onClick={testPartialValidation} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
					部分验证测试
				</button>

				<button onClick={testTransformation} className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
					数据转换测试
				</button>

				<button onClick={testUnionTypes} className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600">
					联合类型测试
				</button>

				<button onClick={testConditionalValidation} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
					条件验证测试
				</button>

				<button onClick={testDefaultValues} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
					默认值测试
				</button>

				<button onClick={clearResults} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
					清空结果
				</button>
			</div>

			<div className="bg-gray-100 p-4 rounded-lg">
				<h2 className="text-lg font-semibold mb-3">测试结果:</h2>
				<div className="space-y-2 max-h-96 overflow-y-auto">
					{results.length === 0 ? (
						<p className="text-gray-500">点击上面的按钮开始测试</p>
					) : (
						results.map((result, idx) => (
							<div key={idx} className="p-2 bg-white rounded text-sm font-mono">
								{result}
							</div>
						))
					)}
				</div>
			</div>

			<div className="mt-6 text-sm text-gray-600">
				<h3 className="font-semibold mb-2">Zod 主要特性:</h3>
				<ul className="list-disc list-inside space-y-1">
					<li>类型安全的运行时验证</li>
					<li>自动 TypeScript 类型推断</li>
					<li>丰富的验证规则和错误信息</li>
					<li>数据转换和预处理</li>
					<li>联合类型和条件验证</li>
					<li>可组合的 schema 设计</li>
				</ul>
			</div>
		</div>
	)
}
