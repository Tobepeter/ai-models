import { Command } from 'commander'
import { deployNginxTool } from './utils/nginx/deploy-nginx-tool'

const program = new Command()
program.name('deploy-nginx').description('Nginx 配置部署工具').version('1.0.0')
program.option('--file <target>', '部署配置文件', 'default.conf')
program.option('--remove <target>', '删除配置文件')

program.action(async (options) => {
	const { file, remove } = options
	try {
		if (remove) {
			await deployNginxTool.removeFile(remove)
		} else {
			if (!file) {
				console.error('❌ 请指定配置文件')
				process.exit(1)
			}
			await deployNginxTool.deployFile(file)
		}
	} catch (error: any) {
		console.error('❌ 操作失败:', error.message)
		process.exit(1)
	}
})

program.parse()
