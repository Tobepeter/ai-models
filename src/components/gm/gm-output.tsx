import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type GMLog } from './gm-store'

interface GMOutputProps {
	logs: GMLog[]
	onKillProc: (procId: string) => void
	onClearLogs: () => void
}

/**
 * 进程输出组件
 */
export const GMOutput = (props: GMOutputProps) => {
	const { logs, onKillProc, onClearLogs } = props

	return (
		<div className="col-span-3 flex flex-col">
			<div className="flex justify-between items-center mb-2">
				<span className="text-sm font-medium">命令输出</span>
				<Button size="sm" variant="outline" onClick={onClearLogs}>
					清空日志
				</Button>
			</div>
			
			<div className="flex-1 border rounded bg-muted/30 overflow-hidden">
				<ScrollArea className="h-[75vh]">
					<div className="p-3">
						{logs.length === 0 ? (
							<div className="text-sm text-muted-foreground text-center py-8">
								暂无运行进程
							</div>
						) : (
							logs.map(proc => (
								<div key={proc.processId} className="mb-4 border rounded bg-background overflow-hidden">
									<div className="flex justify-between items-center p-3 bg-muted/50 border-b">
										<span className="font-medium text-sm font-mono">{proc.command}</span>
										<div className="flex gap-2">
											<Badge variant={
												proc.status === 'running' ? 'default' :
												proc.status === 'finished' ? 'secondary' : 'destructive'
											}>
												{proc.status}
											</Badge>
											{proc.status === 'running' && (
												<Button
													size="sm"
													variant="destructive"
													onClick={() => onKillProc(proc.processId)}
													className="h-6 px-2 text-xs"
												>
													终止
												</Button>
											)}
										</div>
									</div>
									<div className="bg-black text-green-400 p-4 font-mono text-xs min-h-[200px] max-h-[400px] overflow-y-auto">
										{proc.logs.length === 0 ? (
											<div className="text-gray-500">等待输出...</div>
										) : (
											proc.logs.map((log, idx) => (
												<div key={idx} className="whitespace-pre-wrap leading-relaxed">
													{log}
												</div>
											))
										)}
									</div>
								</div>
							))
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	)
}
