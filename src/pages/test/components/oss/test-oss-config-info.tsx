import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { type Credentials } from 'ali-oss'
import { ossConfig } from '@/utils/oss/oss-config'
import { ossRegion, ossBucket } from '@/utils/env'

/**
 * OSS配置信息组件
 * 显示OSS服务器配置和STS状态信息
 */
export const TestOssConfigInfo = (props: TestOssConfigInfoProps) => {
	const { status, sts, loading, onCheckStatus, onGetSts } = props
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="grid grid-cols-2 gap-6">
					<Card>
						<CardContent className="p-4">
							<div className="space-y-1">
								<div>
									<strong>OSS区域:</strong> {ossRegion}
								</div>
								<div>
									<strong>OSS存储桶:</strong> {ossBucket}
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="flex flex-col gap-2">
								<div className="flex items-center gap-2">
									<Button variant="outline" size="sm" onClick={onCheckStatus}>
										检查服务器状态
									</Button>
									<Badge variant={status === 'running' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}>
										{status === 'running' ? '服务器运行中' : status === 'error' ? '服务器错误' : '未知状态'}
									</Badge>
								</div>
								<div className="flex items-center gap-2">
									<Button variant="outline" size="sm" onClick={() => onGetSts?.()} disabled={loading}>
										{loading ? '获取中...' : '刷新STS'}
									</Button>
									<Badge variant={sts ? 'default' : 'secondary'}>{sts ? `STS有效(${new Date(sts.Expiration).toLocaleTimeString()})` : 'STS未获取'}</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</CardContent>
		</Card>
	)
}

export interface TestOssConfigInfoProps {
	status: string
	sts: Credentials | null
	loading: boolean
	onCheckStatus?: () => void
	onGetSts?: () => Promise<Credentials>
}
