import { Command } from 'commander'
import { verbose } from './utils/env'
import { backendDeployTool } from './utils/backend-deploy-tool'

/** 执行后端部署流程 */
const deployBackend = async (steps: string[]) => {
	const isAll = steps.length === 0
	try {
		if (isAll || steps.includes('push')) {
			await backendDeployTool.deployDocker()
		}

		if (isAll || steps.includes('deploy')) {
			await backendDeployTool.deployToServer()
		}
	} catch (error: any) {
		console.error('❌ 后端部署失败:', error.message)
		throw error
	}
}

/** 执行后端管理操作 */
const manageBackend = async (action: string, options: any) => {
	try {
		switch (action) {
			case 'logs':
				await backendDeployTool.viewLogs(options.lines || 50)
				break
			case 'restart':
				await backendDeployTool.restartServices()
				break
			default:
				console.error(`❌ 未知操作: ${action}`)
				process.exit(1)
		}
	} catch (error: any) {
		console.error(`❌ 操作失败:`, error.message)
		throw error
	}
}

const program = new Command()
program.name('deploy-be').description('后端Docker镜像构建和部署工具').version('1.0.0')

program
	.option('-s, --steps <steps>', '指定执行步骤，默认执行所有步骤，可选: push,deploy', '')
	.option('-v, --verbose', '显示详细日志', false)
	.action(async (options) => {
		let steps: BackendDeploySteps[] = options.steps ? options.steps.split(',').map((s: string) => s.trim()) : []
		if (!steps.length) {
			// 默认执行所有步骤
			steps = ['push', 'deploy']
		} else {
			const validSteps: BackendDeploySteps[] = ['push', 'deploy']
			const invalidSteps = steps.filter((step) => !validSteps.includes(step))
			if (invalidSteps.length > 0) {
				console.error(`❌ 无效的步骤: ${invalidSteps.join(', ')}`)
				console.error(`✅ 有效的步骤: ${validSteps.join(', ')}`)
				process.exit(1)
			}
		}

		const finalVerbose = options.verbose || verbose

		backendDeployTool.setConfig({
			verbose: finalVerbose,
		})

		// 执行部署
		deployBackend(steps).catch((error) => {
			console.error('部署失败:', error)
			process.exit(1)
		})
	})

// 日志查看命令
program
	.command('logs')
	.description('查看服务日志')
	.option('-n, --lines <lines>', '显示的日志行数', '50')
	.option('-v, --verbose', '显示详细日志', false)
	.action(async (options) => {
		const finalVerbose = options.verbose || verbose
		backendDeployTool.setConfig({ verbose: finalVerbose })

		await manageBackend('logs', { lines: parseInt(options.lines) })
	})

// 重启服务命令
program
	.command('restart')
	.description('重启服务')
	.option('-v, --verbose', '显示详细日志', false)
	.action(async (options) => {
		const finalVerbose = options.verbose || verbose
		backendDeployTool.setConfig({ verbose: finalVerbose })

		await manageBackend('restart', {})
	})

program.parse(process.argv)

type BackendDeploySteps = 'push' | 'deploy'
