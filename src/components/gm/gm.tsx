import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FloatBtn } from '@/components/common/float-btn'
import { ProcessOutput } from './process-output'
import { gmCfg, type GMCommandItem } from './gm-cfg'
import { gmMgr, type ProcessLog, type PortStatus } from './gm-mgr'
import { useMemoizedFn, useMount } from 'ahooks'
import { useState } from 'react'

// GM 应用管理面板
export const GM = () => {
	const [ports, setPorts] = useState<PortStatus[]>([])
	const [procs, setProcs] = useState<ProcessLog[]>([])
	const [wsConn, setWsConn] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	// 初始化 GM Manager
	const initGMMgr = useMemoizedFn(() => {
		gmMgr.setCallbacks({
			onConnChange: setWsConn,
			onProcUpdate: setProcs,
			onPortUpdate: setPorts,
		})
		gmMgr.connect()
		gmMgr.fetchPortStatus()
	})

	// 执行命令
	const execCmd = useMemoizedFn((command: string) => {
		gmMgr.execCmd(command)
	})

	// 终止进程
	const killProc = useMemoizedFn((processId: string) => {
		gmMgr.killProc(processId)
	})

	// 清空日志
	const clearLogs = useMemoizedFn(() => {
		gmMgr.clearLogs()
	})

	// 初始化
	useMount(() => {
		initGMMgr()

		// 定时刷新端口状态
		const interval = setInterval(() => {
			gmMgr.fetchPortStatus()
		}, 5000)

		return () => {
			clearInterval(interval)
			gmMgr.disconnect()
		}
	})

	return (
		<>
			{/* 悬浮按钮 */}
			<FloatBtn title="GM" onClick={() => setIsOpen(true)} defaultPos={{ x: 20, y: 100 }} />

			{/* 弹窗面板 */}
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="max-w-[95vw] max-h-[85vh] w-[95vw] min-w-[1200px]">
					<DialogHeader>
						<DialogTitle>GM Panel</DialogTitle>
					</DialogHeader>

					<div className="grid grid-cols-5 gap-6 max-h-[75vh]">
						{/* 左侧：控制面板 */}
						<div className="col-span-2 space-y-4">
							<ScrollArea className="max-h-[70vh] pr-2">
								{/* 连接状态 */}
								<div className="flex items-center gap-2 mb-4">
									<span className="text-sm font-medium">GM Server:</span>
									<Badge variant={wsConn ? 'default' : 'destructive'}>{wsConn ? '已连接' : '未连接'}</Badge>
								</div>

								{/* 端口状态 */}
								<div className="space-y-2 mb-4">
									<div className="text-sm font-medium">端口状态</div>
									<div className="grid grid-cols-2 gap-2">
										{ports.map((port) => (
											<Badge key={port.port} variant={port.active ? 'default' : 'secondary'} className="justify-center text-xs">
												{port.port}: {port.active ? '活跃' : '空闲'}
											</Badge>
										))}
									</div>
								</div>

								{/* 常用命令 */}
								<div className="space-y-3">
									<div className="text-sm font-medium">常用命令</div>

									{gmCfg.cmds.map((group, gIdx) => (
										<div key={gIdx} className="space-y-2">
											<div className="text-xs text-muted-foreground">{group.groupName}</div>
											<div className="grid grid-cols-3 gap-1">
												{group.list.map((cmd: GMCommandItem, cIdx: number) => (
													<Button key={cIdx} size="sm" variant={cmd.variant} onClick={() => execCmd(cmd.command)} className="text-xs">
														{cmd.label}
													</Button>
												))}
												{/* 填充空位，保持网格对齐 */}
												{Array.from({ length: (3 - (group.list.length % 3)) % 3 }).map((_, idx) => (
													<div key={`empty-${idx}`}></div>
												))}
											</div>
										</div>
									))}
								</div>
							</ScrollArea>
						</div>

						{/* 右侧：进程输出 */}
						<ProcessOutput processes={procs} onKillProc={killProc} onClearLogs={clearLogs} />
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
