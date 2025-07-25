import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { notify } from '@/components/common/notify'
import { useState } from 'react'

export const TestNotify = () => {
	const [loadingId, setLoadingId] = useState<string | number | null>(null)

	const btnConfigs = [
		{
			label: '成功通知',
			onClick: () => {
				notify.success('操作成功！', {
					description: '数据已成功保存到服务器',
					duration: 3000,
				})
			},
		},
		{
			label: '错误通知',
			onClick: () => {
				notify.error('操作失败！', {
					description: '网络连接出现问题，请稍后重试',
					duration: 4000,
					action: {
						label: '重试',
						onClick: () => notify.info('正在重新尝试...'),
					},
				})
			},
		},
		{
			label: '警告通知',
			onClick: () => {
				notify.warning('注意事项', {
					description: '此操作可能会影响其他用户',
					duration: 3000,
				})
			},
		},
		{
			label: '信息通知',
			onClick: () => {
				notify.info('系统提示', {
					description: '系统将在5分钟后进行维护更新',
					duration: 3000,
				})
			},
		},
		{
			label: '加载通知',
			onClick: () => {
				const id = notify.loading('正在处理中...', {
					description: '请稍等片刻',
				})
				setLoadingId(id)
				setTimeout(() => {
					notify.success('处理完成！')
					setLoadingId(null)
				}, 3000)
			},
			disabled: !!loadingId,
		},
		{
			label: '自定义通知',
			onClick: () => {
				notify.custom(
					(id) => (
						<div>
							<div>🚀 自定义通知</div>
							<div className="text-xs">这是一个自定义样式的通知</div>
						</div>
					),
					{
						duration: 4000,
					}
				)
			},
		},
		{
			label: 'Promise通知',
			onClick: () => {
				const mockPromise = new Promise<string>((resolve, reject) => {
					setTimeout(() => {
						if (Math.random() > 0.5) {
							resolve('成功')
						} else {
							reject(new Error('失败'))
						}
					}, 2000)
				})

				notify.promise(mockPromise, {
					loading: '正在上传文件...',
					success: '文件上传成功！',
					error: '文件上传失败，请重试',
				})
			},
		},
		{
			label: '确认对话框',
			onClick: () => {
				notify.confirm({
					title: '确认删除',
					description: '此操作将永久删除该项目，是否继续？',
					confirmText: '删除',
					cancelText: '取消',
					onConfirm: () => {
						notify.success('项目已删除')
					},
					onCancel: () => {
						notify.info('操作已取消')
					},
				})
			},
		},
		{
			label: '批量通知测试',
			onClick: () => {
				notify.success('第一个通知')
				setTimeout(() => notify.warning('第二个通知'), 500)
				setTimeout(() => notify.error('第三个通知'), 1000)
				setTimeout(() => notify.info('第四个通知'), 1500)
			},
			full: true,
		},
	]

	return (
		<Card>
			<CardHeader>
				<CardTitle>通知系统测试</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-2">
					{btnConfigs.map((btn, idx) => (
						<Button key={btn.label} onClick={btn.onClick} disabled={btn.disabled} className={btn.full ? 'w-full' : ''}>
							{btn.label}
						</Button>
					))}
				</div>
				<div className="mt-6">
					<p className="text-sm">
						<strong>使用说明：</strong>
						<br />
						• Toast 通知会出现在右上角
						<br />
						• 支持成功、错误、警告、信息四种类型
						<br />
						• 错误通知支持重试按钮
						<br />
						• 确认对话框会覆盖整个屏幕
						<br />• Promise 通知会自动处理加载态
					</p>
				</div>
			</CardContent>
		</Card>
	)
}
