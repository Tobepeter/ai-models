import { Command } from 'commander'
import { deployTool } from './utils/deploy-tool.ts'
import { ossEnable } from './utils/env'
import { ossAPI } from './utils/oss-api'

/** 执行部署流程 */
const deploy = async (steps: string[]) => {
	const isAll = steps.length === 0
	try {
		// 初始化 OSS API（如果启用）
		if (ossEnable) {
			ossAPI.init()
			console.log('📡 使用 OSS 部署模式')
		} else {
			console.log('🖥️ 使用服务器部署模式')
		}

		if (isAll || steps.includes('build')) {
			deployTool.build()
		}

		// oss 模式不需要打包
		if ((isAll && !ossEnable) || steps.includes('zip')) {
			await deployTool.zipDist()
		}

		if (isAll || steps.includes('upload')) {
			await deployTool.upload()
		}

		// oss 模式不需要删除zip文件
		if ((isAll && !ossEnable) || steps.includes('clear')) {
			deployTool.clearZipFile()
		}

		console.log('🎉 部署完成！')
	} catch (error: any) {
		console.error('❌ 部署失败:', error.message)
		throw error
	}
}

const program = new Command()
program.name('deploy-tool').description('前端项目部署工具').version('1.0.0')
program.option('-s, --steps <steps>', '指定执行步骤，默认不包含build, 可选: build,zip,upload,clear', '')
program.option('--dry-run', '只打印日志，不执行实际操作（目前只支持oss模式）', false)
program.option('-v, --verbose', '显示详细日志', false)

program.action((options) => {
	const { dryRun } = options
	let steps: BuildSteps[] = options.steps ? options.steps.split(',').map((s: string) => s.trim()) : []
	if (!steps.length) {
		// 默认不包含 build
		steps = ['zip', 'upload', 'clear']
	} else {
		const validSteps: BuildSteps[] = ['build', 'zip', 'upload', 'clear']
		const invalidSteps = steps.filter((step) => !validSteps.includes(step))
		if (invalidSteps.length > 0) {
			console.error(`❌ 无效的步骤: ${invalidSteps.join(', ')}`)
			console.error(`✅ 有效的步骤: ${validSteps.join(', ')}`)
			process.exit(1)
		}
	}

	deployTool.config.dryRun = dryRun

	// 执行部署
	deploy(steps).catch((error) => {
		console.error('部署失败:', error)
		process.exit(1)
	})
})

program.parse(process.argv)

type BuildSteps = 'build' | 'zip' | 'upload' | 'clear'
