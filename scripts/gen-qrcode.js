import fse from 'fs-extra'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv-flow'
import { qrcodeHelper } from './utils/qrcode-helper.js'

config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置
const outputDir = path.join(__dirname, '../temp/qrcode/')

/** 获取本机内网IP地址 */
function getLocalIP() {
	const interfaces = os.networkInterfaces()

	for (const name of Object.keys(interfaces)) {
		for (const iface of interfaces[name]) {
			if (iface.family === 'IPv4' && !iface.internal) {
				return iface.address
			}
		}
	}

	return 'localhost'
}

/** 生成二维码 */
async function generateQRCode() {
	console.log('开始生成二维码...')
	fse.ensureDirSync(outputDir)

	const ip = getLocalIP()
	const port = process.env.VITE_PORT || 5173
	const outputs = [
		{ url: `http://${ip}:${port}`, file: 'vite.png' },
		{ url: 'https://tobeei.com', file: 'tobeei.png' },
	]

	try {
		for (const output of outputs) {
			const { file, url } = output
			const outputFile = path.join(outputDir, file)
			await qrcodeHelper.generateQRCodeWithText(url, outputFile)
			console.log(`- ${file} 已生成，位置: ${outputFile}`)
		}

		console.log(`✅ 二维码全部生成成功!`)
	} catch (error) {
		console.error('❌ 生成二维码失败')
		console.error(error)
	}
}

generateQRCode()
