import { useMount } from 'ahooks'
import { useState } from 'react'
import { z, ZodError } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Zod v4 国际化配置 - 支持运行时动态切换

interface TestResult {
	status: 'success' | 'error'
	msg: string
	desc?: string
	code?: string
}

interface TestCase {
	name: string
	schema: z.ZodSchema
	testValues: { value: string; desc: string }[]
}

interface LocaleOption {
	label: string
	value: string
	config: () => void
}

export default function TestZodI18n() {
	const [selectedTest, setSelectedTest] = useState(0)
	const [testValue, setTestValue] = useState('')
	const [results, setResults] = useState<TestResult[]>([])
	const [currentLocale, setCurrentLocale] = useState('zhCN')

	const localeOptions: LocaleOption[] = [
		{ label: '中文 (简体)', value: 'zhCN', config: () => z.config(z.locales?.zhCN?.() || z.locales.en()) },
		{ label: '中文 (繁体)', value: 'zhTW', config: () => z.config(z.locales?.zhTW?.() || z.locales.en()) },
		{ label: 'English', value: 'en', config: () => z.config(z.locales.en()) },
	]

	const testCases: TestCase[] = [
		{
			name: 'Email 验证',
			schema: z.email(),
			testValues: [
				{ value: 'invalid', desc: '无效邮箱' },
				{ value: 'test@', desc: '不完整邮箱' },
				{ value: 'valid@test.com', desc: '有效邮箱' },
			],
		},
		{
			name: 'URL 验证',
			schema: z.url(),
			testValues: [
				{ value: 'invalid-url', desc: '无效URL' },
				{ value: 'http://', desc: '不完整URL' },
				{ value: 'https://test.com', desc: '有效URL' },
			],
		},
		{
			name: 'String Min/Max 验证',
			schema: z.string().min(3).max(10),
			testValues: [
				{ value: 'ab', desc: '太短 (2字符)' },
				{ value: 'abcdefghijk', desc: '太长 (11字符)' },
				{ value: 'valid', desc: '有效长度' },
			],
		},
		{
			name: 'Number 验证',
			schema: z.coerce.number().min(1).max(100),
			testValues: [
				{ value: '0', desc: '小于最小值' },
				{ value: '101', desc: '大于最大值' },
				{ value: 'not-number', desc: '非数字' },
				{ value: '50', desc: '有效数字' },
			],
		},
		{
			name: 'Required 验证',
			schema: z.string().min(1),
			testValues: [
				{ value: '', desc: '空字符串' },
				{ value: 'not-empty', desc: '非空字符串' },
			],
		},
		{
			name: 'Date 验证',
			schema: z.coerce.date(),
			testValues: [
				{ value: 'invalid-date', desc: '无效日期' },
				{ value: '2024-13-45', desc: '错误日期格式' },
				{ value: '2024-01-15', desc: '有效日期' },
			],
		},
	]

	// 切换语言配置
	const handleLocaleChange = (locale: string) => {
		setCurrentLocale(locale)
		const option = localeOptions.find((opt) => opt.value === locale)
		if (option) {
			option.config()
			console.log(`已切换到语言: ${option.label}`)
			// 清空之前的结果，重新测试会显示新语言的错误信息
			setResults([])
		}
	}

	useMount(() => {
		console.log('z.locales 可用语言:', z.locales ? Object.keys(z.locales) : 'undefined')
		// 默认设置为中文
		handleLocaleChange('zhCN')
	})

	const runSingleTest = (value: string) => {
		try {
			testCases[selectedTest].schema.parse(value)
			setResults([{ status: 'success', msg: '✅ 验证通过' }])
		} catch (e: any) {
			const zodErr = e as ZodError
			console.log('完整错误对象:', zodErr)

			if (zodErr.issues && zodErr.issues.length > 0) {
				const issue = zodErr.issues[0]
				setResults([
					{
						status: 'error',
						msg: issue.message || '验证失败',
						code: issue.code,
					},
				])
			} else {
				setResults([{ status: 'error', msg: '未知验证错误' }])
			}
		}
	}

	const runAllTests = () => {
		const currentTest = testCases[selectedTest]
		const allResults: TestResult[] = []

		currentTest.testValues.forEach(({ value, desc }) => {
			try {
				currentTest.schema.parse(value)
				allResults.push({
					status: 'success',
					msg: '✅ 验证通过',
					desc,
				})
			} catch (e: any) {
				const zodErr = e as ZodError
				if (zodErr.issues && zodErr.issues.length > 0) {
					const issue = zodErr.issues[0]
					allResults.push({
						status: 'error',
						msg: issue.message || '验证失败',
						code: issue.code,
						desc,
					})
				} else {
					allResults.push({
						status: 'error',
						msg: '未知验证错误',
						desc,
					})
				}
			}
		})

		setResults(allResults)
	}

	return (
		<div className="space-y-4 p-4">
			<h2 className="text-lg font-semibold">Zod v4 国际化错误消息测试</h2>

			<div className="space-y-2">
				<h3 className="font-medium">选择语言:</h3>
				<select value={currentLocale} onChange={(e) => handleLocaleChange(e.target.value)} className="border rounded px-2 py-1 min-w-32">
					{localeOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<div className="text-sm text-gray-600">
					当前语言: {localeOptions.find((opt) => opt.value === currentLocale)?.label}
					{currentLocale !== 'en' && ' (如不支持会回退到英文)'}
				</div>
			</div>

			<div className="space-y-2">
				<h3 className="font-medium">选择测试类型:</h3>
				<select value={selectedTest} onChange={(e) => setSelectedTest(Number(e.target.value))} className="border rounded px-2 py-1">
					{testCases.map((test, idx) => (
						<option key={idx} value={idx}>
							{test.name}
						</option>
					))}
				</select>
			</div>

			<div className="space-y-2">
				<h3 className="font-medium">手动测试:</h3>
				<div className="flex gap-2">
					<Input value={testValue} onChange={(e) => setTestValue(e.target.value)} placeholder="输入测试值" />
					<Button onClick={() => runSingleTest(testValue)}>单个测试</Button>
					<Button onClick={runAllTests} variant="outline">
						批量测试
					</Button>
				</div>
			</div>

			<div className="space-y-2">
				<h3 className="font-medium">测试用例:</h3>
				<div className="grid grid-cols-3 gap-2">
					{testCases[selectedTest].testValues.map(({ value, desc }, idx) => (
						<Button key={idx} variant="outline" size="sm" onClick={() => runSingleTest(value)}>
							{desc}: "{value}"
						</Button>
					))}
				</div>
			</div>

			{results.length > 0 && (
				<div className="space-y-2">
					<h3 className="font-medium">验证结果:</h3>
					{results.map((result, idx) => (
						<div key={idx} className={`text-sm p-2 rounded ${result.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
							<div className="flex items-center gap-2">
								<span className="font-mono text-xs px-1 bg-gray-200 rounded">{result.status}</span>
								{result.desc && <span className="font-medium">{result.desc}:</span>}
							</div>
							<div>{result.msg}</div>
							{result.code && <div className="text-xs mt-1 opacity-75">错误代码: {result.code}</div>}
						</div>
					))}
				</div>
			)}

			<div className="text-sm text-gray-600 mt-6">
				<p className="font-medium mb-2">测试说明：</p>
				<ul className="list-disc ml-4 space-y-1">
					<li>使用上方下拉框切换错误消息语言 (支持中文简体、繁体、英文)</li>
					<li>选择不同验证类型查看错误消息语言差异</li>
					<li>点击测试用例按钮快速测试验证效果</li>
					<li>查看控制台完整错误对象结构</li>
					<li>切换语言后，重新测试将显示对应语言的错误信息</li>
					<li>如目标语言不支持，会自动回退到英文显示</li>
				</ul>
			</div>
		</div>
	)
}
