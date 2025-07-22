import { Command } from 'commander'
import { sshServerTool } from './utils/ssh-server-tool'

const program = new Command()

program.name('ssh-server').description('SSH 服务器密钥管理工具').version('1.0.0')

program
	.option('-c, --comment <comment>', '密钥备注')
	.option('--upload', '生成后自动上传公钥到服务器')
	.option('-k, --known-hosts', '生成 known_hosts 文件')
	.option('--dry-run', '生成后自动上传公钥到服务器，只显示信息')

program.action(async (options) => {
	const { comment, upload, knownHosts, dryRun } = options

	if (knownHosts) {
		await sshServerTool.genKnownHosts()
		return
	}

	await sshServerTool.genKeyPair({
		comment,
		upload,
		dryRun,
	})
})

program.parse()
