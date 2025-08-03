import { notify } from '@/components/common/notify'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/api/api'
import { useUserStore } from '@/store/user-store'
import { jwt } from '@/utils/jwt'
import { useState } from 'react'

/**
 * Token刷新机制测试组件
 * 用于测试自动token刷新功能和避免死循环
 */
export default function TestTokenRefresh() {
	const [loading, setLoading] = useState(false)
	const [testResults, setTestResults] = useState<string[]>([])
	const { token, refreshToken, tokenPayload, setData, clear } = useUserStore()

	const addResult = (result: string) => {
		setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
	}

	// 测试正常API调用
	const testNormalApi = async () => {
		setLoading(true)
		try {
			addResult('开始测试正常API调用...')
			const response = await api.users.getProfile()
			if (response?.data) {
				addResult('✅ 正常API调用成功')
			} else {
				addResult('❌ 正常API调用失败 - 无数据')
			}
		} catch (error) {
			addResult(`❌ 正常API调用失败: ${error}`)
		} finally {
			setLoading(false)
		}
	}

	// 测试手动刷新token
	const testManualRefresh = async () => {
		setLoading(true)
		try {
			addResult('开始测试手动刷新token...')
			const response = await api.users.refreshToken()
			if (response?.data?.token) {
				const newToken = response.data.token
				setData({ token: newToken })
				addResult('✅ 手动刷新token成功')
			} else {
				addResult('❌ 手动刷新token失败 - 无token返回')
			}
		} catch (error) {
			addResult(`❌ 手动刷新token失败: ${error}`)
		} finally {
			setLoading(false)
		}
	}

	// 模拟token过期场景
	const testExpiredToken = async () => {
		setLoading(true)
		try {
			addResult('开始测试过期token自动刷新...')

			// 保存原始token
			const originalToken = token

			// 设置一个过期的token (修改exp时间)
			if (tokenPayload) {
				const expiredPayload = { ...tokenPayload, exp: Math.floor(Date.now() / 1000) - 3600 } // 1小时前过期
				// 这里我们不能直接生成过期token，所以我们模拟一个无效token
				const fakeExpiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDAsInVzZXJfaWQiOjF9.invalid'
				setData({ token: fakeExpiredToken })

				addResult('已设置过期token，尝试调用API...')

				// 尝试调用API，应该触发自动刷新
				const response = await api.users.getProfile()
				if (response?.data) {
					addResult('✅ 过期token自动刷新成功，API调用正常')
				} else {
					addResult('❌ 过期token处理失败')
					// 恢复原始token
					setData({ token: originalToken })
				}
			} else {
				addResult('❌ 无法获取当前token payload')
			}
		} catch (error) {
			addResult(`❌ 过期token测试失败: ${error}`)
		} finally {
			setLoading(false)
		}
	}

	// 测试无token场景
	const testNoToken = async () => {
		setLoading(true)
		try {
			addResult('开始测试无token场景...')

			// 保存原始token
			const originalToken = token

			// 清除token
			setData({ token: '' })
			addResult('已清除token，尝试调用需要认证的API...')

			// 尝试调用需要认证的API
			const response = await api.users.getProfile()
			if (response?.data) {
				addResult('❌ 无token时API调用不应该成功')
			} else {
				addResult('✅ 无token时API调用正确失败')
			}

			// 恢复原始token
			setData({ token: originalToken })
			addResult('已恢复原始token')
		} catch (error) {
			addResult(`✅ 无token测试符合预期: ${error}`)
		} finally {
			setLoading(false)
		}
	}

	// 清除测试结果
	const clearResults = () => {
		setTestResults([])
	}

	// 获取token状态信息
	const getTokenInfo = () => {
		if (!token) return '无token'
		if (!tokenPayload) return 'token解析失败'

		const isValid = jwt.isValid(tokenPayload)
		const expTime = new Date(tokenPayload.exp * 1000).toLocaleString()

		return `Token状态: ${isValid ? '有效' : '已过期'}, 过期时间: ${expTime}`
	}

	return (
		<Card className="w-full max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle>Token刷新机制测试</CardTitle>
				<CardDescription>测试自动token刷新功能，验证401错误处理和避免死循环机制</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Token状态信息 */}
				<div className="p-4 bg-muted rounded-lg">
					<h3 className="font-medium mb-2">当前Token状态</h3>
					<p className="text-sm text-muted-foreground">{getTokenInfo()}</p>
					{tokenPayload && <p className="text-sm text-muted-foreground mt-1">用户ID: {tokenPayload.user_id}</p>}
				</div>

				{/* 测试按钮 */}
				<div className="flex flex-wrap gap-2">
					<Button onClick={testNormalApi} disabled={loading}>
						测试正常API调用
					</Button>
					<Button onClick={testManualRefresh} disabled={loading}>
						测试手动刷新Token
					</Button>
					<Button onClick={testExpiredToken} disabled={loading} variant="outline">
						测试过期Token自动刷新
					</Button>
					<Button onClick={testNoToken} disabled={loading} variant="outline">
						测试无Token场景
					</Button>
					<Button onClick={clearResults} variant="secondary">
						清除结果
					</Button>
				</div>

				{/* 测试结果 */}
				{testResults.length > 0 && (
					<div className="p-4 bg-muted rounded-lg">
						<h3 className="font-medium mb-2">测试结果</h3>
						<div className="space-y-1 max-h-60 overflow-y-auto">
							{testResults.map((result, index) => (
								<div key={index} className="text-sm font-mono text-foreground">
									{result}
								</div>
							))}
						</div>
					</div>
				)}

				{/* 说明文档 */}
				<div className="p-4 bg-blue-50/50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
					<h3 className="font-medium mb-2">测试说明</h3>
					<ul className="text-sm text-muted-foreground space-y-1">
						<li>
							• <strong>正常API调用</strong>: 测试当前token是否可以正常调用API
						</li>
						<li>
							• <strong>手动刷新Token</strong>: 测试手动调用refresh token接口
						</li>
						<li>
							• <strong>过期Token自动刷新</strong>: 模拟token过期，测试自动刷新机制
						</li>
						<li>
							• <strong>无Token场景</strong>: 测试没有token时的处理逻辑
						</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	)
}
