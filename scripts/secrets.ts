import { Command } from 'commander'
import { secretsEnvTool } from './utils/secrets/secrets-env-tool'
import { secretsTool } from './utils/secrets/secrets-tool'

const program = new Command()
program.name('secrets').description('项目secrets统一管理，使用 process.env.SECRETS_KEY 进行解密').version('1.0.0')

program.option('-e, --encrypt', '加密文件夹')
program.option('-d, --decrypt', '解密文件夹')
program.option('-g, --genkey', '生成密钥')
program.option('--cicd', '配置cicd环境')
program.option('--sync', '同步secrets配置')

program.action(async () => {
	const { encrypt, decrypt, genkey, cicd, sync } = program.opts()
	if (encrypt) {
		await secretsTool.encrypt()
	}
	if (decrypt) {
		await secretsTool.decrypt()
	}
	if (genkey) {
		await secretsTool.generateKey()
	}
	if (cicd) {
		await secretsTool.prepareInCICD()
	}
	if (sync) {
		await secretsEnvTool.syncSecrets()
	}
})

program.parse()
