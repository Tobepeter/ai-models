import { useState } from 'react'
import { format, parseISO, addMinutes, addHours, addDays, differenceInMinutes, startOfDay, endOfDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { feedUtil } from '@/pages/feed/feed-util'

/**
 * date-fns 测试组件
 */
export default function TestDateFns() {
	const [customTime, setCustomTime] = useState('')
	const currentTime = new Date()

	// 生成不同时间点进行测试
	const testTimes = [
		{ label: '刚刚', time: new Date() },
		{ label: '30秒前', time: addMinutes(currentTime, -0.5) },
		{ label: '5分钟前', time: addMinutes(currentTime, -5) },
		{ label: '30分钟前', time: addMinutes(currentTime, -30) },
		{ label: '2小时前', time: addHours(currentTime, -2) },
		{ label: '12小时前', time: addHours(currentTime, -12) },
		{ label: '1天前', time: addDays(currentTime, -1) },
		{ label: '3天前', time: addDays(currentTime, -3) },
		{ label: '8天前', time: addDays(currentTime, -8) },
		{ label: '30天前', time: addDays(currentTime, -30) },
	]

	/* 自定义时间格式化函数，使用 date-fns */
	const formatRelativeTime = (timestamp: string | Date) => {
		const now = new Date()
		const time = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp
		const diffInMinutes = differenceInMinutes(now, time)

		if (diffInMinutes < 1) return '刚刚'
		if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`
		if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}天前`
		return format(time, 'MM-dd')
	}

	return (
		<div className="space-y-6 p-6" data-slot="test-date-fns">
			<div>
				<h2 className="text-2xl font-bold mb-2">date-fns 功能测试</h2>
				<p className="text-muted-foreground">测试 date-fns 基础功能和相对时间格式化</p>
			</div>

			{/* 基础功能测试 */}
			<Card>
				<CardHeader>
					<CardTitle>基础功能测试</CardTitle>
					<CardDescription>date-fns 常用功能展示</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>当前时间</Label>
							<div className="p-2 bg-muted rounded text-sm font-mono">{format(currentTime, 'yyyy-MM-dd HH:mm:ss')}</div>
						</div>
						<div>
							<Label>ISO 格式</Label>
							<div className="p-2 bg-muted rounded text-sm font-mono">{currentTime.toISOString()}</div>
						</div>
						<div>
							<Label>中文格式</Label>
							<div className="p-2 bg-muted rounded text-sm font-mono">{format(currentTime, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}</div>
						</div>
						<div>
							<Label>今日开始/结束</Label>
							<div className="p-2 bg-muted rounded text-sm font-mono">
								{format(startOfDay(currentTime), 'HH:mm')} ~ {format(endOfDay(currentTime), 'HH:mm')}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 相对时间测试 Card */}
			<Card>
				<CardHeader>
					<CardTitle>相对时间格式化测试</CardTitle>
					<CardDescription>对比 feedUtil.formatTime 和自定义实现的相对时间格式化效果</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
							<div>时间描述</div>
							<div>实际时间</div>
							<div>feedUtil 结果</div>
							<div>自定义结果</div>
						</div>

						{testTimes.map((item, index) => (
							<div key={index} className="grid grid-cols-4 gap-2 text-sm">
								<div className="font-medium">{item.label}</div>
								<div className="font-mono text-muted-foreground">{format(item.time, 'MM-dd HH:mm')}</div>
								<div className="p-1 bg-blue-50 rounded font-medium text-blue-700">{feedUtil.formatTime(item.time.toISOString())}</div>
								<div className="p-1 bg-green-50 rounded font-medium text-green-700">{formatRelativeTime(item.time)}</div>
							</div>
						))}
					</div>

					<Separator className="my-6" />

					{/* 自定义时间测试 */}
					<div className="space-y-3">
						<Label htmlFor="custom-time">自定义时间测试</Label>
						<div className="flex gap-2">
							<Input id="custom-time" placeholder="输入 ISO 时间格式，如: 2024-01-01T10:30:00Z" value={customTime} onChange={(e) => setCustomTime(e.target.value)} className="flex-1" />
							<Button onClick={() => setCustomTime(new Date().toISOString())} variant="outline">
								当前时间
							</Button>
						</div>

						{customTime && (
							<div className="space-y-2">
								<div className="p-3 bg-muted rounded">
									<div className="text-sm text-muted-foreground mb-1">输入时间:</div>
									<div className="font-mono text-sm">{customTime}</div>
								</div>
								<div className="grid grid-cols-2 gap-2">
									<div className="p-3 bg-blue-50 rounded">
										<div className="text-sm text-blue-600 mb-1">feedUtil 结果:</div>
										<div className="font-medium text-blue-700">
											{(() => {
												try {
													return feedUtil.formatTime(customTime)
												} catch (error) {
													return '格式错误'
												}
											})()}
										</div>
									</div>
									<div className="p-3 bg-green-50 rounded">
										<div className="text-sm text-green-600 mb-1">自定义结果:</div>
										<div className="font-medium text-green-700">
											{(() => {
												try {
													return formatRelativeTime(customTime)
												} catch (error) {
													return '格式错误'
												}
											})()}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* API 对比 */}
			<Card>
				<CardHeader>
					<CardTitle>date-fns vs dayjs API 对比</CardTitle>
					<CardDescription>常用操作的 API 对比展示</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-6">
						<div>
							<h4 className="font-medium mb-3 text-blue-700">date-fns (函数式)</h4>
							<div className="space-y-2 text-sm font-mono bg-blue-50 p-3 rounded">
								<div>format(date, 'yyyy-MM-dd')</div>
								<div>parseISO('2024-01-01')</div>
								<div>addDays(date, 7)</div>
								<div>differenceInMinutes(a, b)</div>
								<div>startOfDay(date)</div>
							</div>
						</div>
						<div>
							<h4 className="font-medium mb-3 text-orange-700">dayjs (链式)</h4>
							<div className="space-y-2 text-sm font-mono bg-orange-50 p-3 rounded">
								<div>dayjs(date).format('YYYY-MM-DD')</div>
								<div>dayjs('2024-01-01')</div>
								<div>dayjs(date).add(7, 'day')</div>
								<div>dayjs(a).diff(b, 'minute')</div>
								<div>dayjs(date).startOf('day')</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
