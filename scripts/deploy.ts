import { Command } from 'commander'
import { config } from 'dotenv-flow'
import { deployTool } from './utils/deploy-tool.ts'

config()

/** 执行部署流程 */
const deploy = async (steps: string[]) => {
	const isAll = steps.length === 0 || steps.includes('all')
	try {
		if (isAll || steps.includes('build')) {
			deployTool.build()
		}

		if (isAll || steps.includes('zip')) {
			await deployTool.zipDist()
		}

		if (isAll || steps.includes('upload')) {
			await deployTool.uploadToServer()
		}

		if (isAll || steps.includes('clear')) {
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
program.option('-s, --steps <steps>', '指定执行步骤: build,zip,upload,clear', 'build,zip,upload,clear').option('-v, --verbose', '显示详细日志', false)

program.action((options) => {
	const steps = options.steps ? options.steps.split(',').map((s: string) => s.trim()) : []

	// 验证步骤参数
	const validSteps = ['build', 'zip', 'upload', 'clear']
	const invalidSteps = steps.filter((step) => !validSteps.includes(step))
	if (invalidSteps.length > 0) {
		console.error(`❌ 无效的步骤: ${invalidSteps.join(', ')}`)
		console.error(`✅ 有效的步骤: ${validSteps.join(', ')}`)
		process.exit(1)
	}

	// 配置部署工具
	const config: any = {
		host: process.env.SERVER_HOST,
		verbose: options.verbose,
	}

	if (options.host) {
		config.host = options.host
	}
	if (options.username) {
		config.username = options.username
	}
	if (options.privateKey) {
		config.privateKeyPath = options.privateKey
	}
	if (options.target) {
		deployTool.targetDeployFolder = options.target
	}

	deployTool.init(config)

	// 执行部署
	deploy(steps).catch((error) => {
		console.error('部署失败:', error)
		process.exit(1)
	})
})

program.parse(process.argv)
