import { Command } from 'commander'
import { sshServerTool } from './utils/ssh-server/ssh-server-tool'

const program = new Command()

program.name('ssh-server').description('SSH 服务器密钥管理工具').version('1.0.0')

program
	.option('-c, --comment <comment>', '密钥备注')
	.option('--upload', '生成后自动上传公钥到服务器')
	.option('--sync-git', '生成后显示 GitHub Secrets 设置命令')
	.option('--dry-run', '生成后自动上传公钥到服务器，只显示信息')

program.action(async (options) => {
	const { comment, upload, syncGit, dryRun } = options
	await sshServerTool.generateKeyPair({
		comment,
		upload,
		syncGit,
		dryRun,
	})
})

program.parse()
