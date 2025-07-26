import { api } from '@/api'
import { notify } from '@/components/common/notify'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * 错误处理测试组件
 * 测试 noErrorToast 功能和业务错误处理
 */
export const TestErrorHandling = () => {
	const testConfigs = [
		{
			label: 'HTTP 500 错误 (默认处理)',
			description: '会显示错误 toast',
			onClick: () => {
				api.test.errCodeDetail('500').catch(() => {
					console.log('HTTP 500 错误处理完成')
				})
			},
		},
		{
			label: 'HTTP 400 错误 (noErrorToast)',
			description: '不会显示错误 toast，返回 null',
			onClick: () => {
				api.test.errCodeDetail('400', { noErrorToast: true }).then((res: any) => {
					console.log('noErrorToast 测试结果:', res?.data)
					notify.info('测试完成', {
						description: `返回结果: ${res?.data === null ? 'null' : 'data'}`,
					})
				})
			},
		},
		{
			label: '业务错误 (code !== 0)',
			description: '模拟业务逻辑错误',
			onClick: () => {
				// 模拟一个业务错误响应
				console.log('模拟业务错误...')
				notify.error('业务错误', {
					description: '用户余额不足，无法完成操作',
					duration: 4000,
				})
			},
		},
		{
			label: '业务错误 (noErrorToast)',
			description: '业务错误但不显示 toast',
			onClick: () => {
				console.log('模拟业务错误 (noErrorToast)...')
				notify.info('测试完成', {
					description: '业务错误已处理，但未显示错误提示',
				})
			},
		},
		{
			label: '网络超时错误',
			description: '测试网络错误处理',
			onClick: () => {
				api.test.errNetworkDetail('timeout').catch(() => {
					console.log('网络超时错误处理完成')
				})
			},
		},
		{
			label: '权限错误',
			description: '测试权限不足错误',
			onClick: () => {
				api.test.errBusinessDetail('permission').catch(() => {
					console.log('权限错误处理完成')
				})
			},
		},
	]

	return (
		<Card>
			<CardHeader>
				<CardTitle>错误处理测试</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{testConfigs.map((config, idx) => (
						<div key={idx} className="space-y-2">
							<Button onClick={config.onClick} className="w-full">
								{config.label}
							</Button>
							<p className="text-sm text-muted-foreground">{config.description}</p>
						</div>
					))}
				</div>

				<div className="mt-6 p-4 bg-muted rounded-lg">
					<h4 className="font-medium mb-2">功能说明：</h4>
					<ul className="text-sm space-y-1">
						<li>
							• <strong>noErrorToast: false</strong> (默认) - 自动显示错误提示
						</li>
						<li>
							• <strong>noErrorToast: true</strong> - 不显示错误提示，返回 null
						</li>
						<li>
							• <strong>HTTP 错误</strong> - 网络请求失败 (4xx, 5xx)
						</li>
						<li>
							• <strong>业务错误</strong> - HTTP 200 但 response.code !== 0
						</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	)
}
