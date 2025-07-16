import fse from 'fs-extra'
import path from 'path'
import QRCode from 'qrcode'
import { createCanvas, loadImage } from 'canvas'

/**
 * 二维码生成助手
 */
class QRCodeHelper {
	config = {
		qrWidth: 300,
		qrMargin: 2,
		errorCorrectionLevel: 'M',
		qrColor: {
			dark: '#000000',
			light: '#FFFFFF',
		},

		enableText: true,
		fontSize: 16,
		fontFamily: 'Arial',
	}

	/** 在二维码底部添加文字 */
	async addText(qrPath, outputPath, text) {
		const qrImage = await loadImage(qrPath)
		const qrWidth = qrImage.width
		const qrHeight = qrImage.height

		const fontSize = this.config.fontSize
		const padH = fontSize + 2
		const newHeight = qrHeight + padH

		const canvas = createCanvas(qrWidth, newHeight)
		const ctx = canvas.getContext('2d')

		// 设置白色背景
		ctx.fillStyle = '#FFFFFF'
		ctx.fillRect(0, 0, qrWidth, newHeight)

		// 绘制二维码到顶部
		ctx.drawImage(qrImage, 0, 0)

		ctx.fillStyle = '#000000'
		ctx.font = `${fontSize}px ${this.config.fontFamily}`
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		const fontX = qrWidth / 2
		const fontY = qrHeight + padH / 2
		ctx.fillText(text, fontX, fontY)

		// 保存图片
		const buffer = canvas.toBuffer('image/png')
		await fse.writeFile(outputPath, buffer)
	}

	/** 生成带文字的二维码 */
	async generateQRCodeWithText(url, filename) {
		fse.ensureDirSync(path.dirname(filename)) // 确保目录存在

		// 生成原始二维码
		// NOTE: IDE 会提示，"await" 对此表达式的类型没有影响。ts(80007)
		//  这个 await 其实是有用的，只是这里很多重载，其实是支持 Promise<void> 的
		await QRCode.toFile(filename, url, {
			type: 'png',
			width: this.config.qrWidth,
			margin: this.config.qrMargin,
			color: this.config.qrColor,
			errorCorrectionLevel: this.config.errorCorrectionLevel,
		})

		// 在二维码底部添加文字，覆盖原文件
		if (this.config.enableText) {
			await this.addText(filename, filename, url)
		}
	}
}

export const qrcodeHelper = new QRCodeHelper()
