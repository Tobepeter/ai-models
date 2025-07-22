import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { readFileSync, writeFileSync } from 'fs'

const algorithm = 'aes-256-gcm'
const secretKeyBytes = 32

/**
 * 加密解密工具
 * 提供文件加密和解密功能
 */
class CryptoUtil {
	/** 加密文件 */
	async encryptFile(inputFile: string, outputFile: string, key: string) {
		if (!this.isSecretKeyValid(key)) {
			throw new Error('Invalid secret key')
		}

		const keyBuffer = Buffer.from(key, 'hex')
		const iv = randomBytes(16)
		const cipher = createCipheriv(algorithm, keyBuffer, iv) as any

		const inputData = readFileSync(inputFile)
		let encrypted = cipher.update(inputData)
		encrypted = Buffer.concat([encrypted, cipher.final()])

		const authTag = cipher.getAuthTag()
		const result = Buffer.concat([iv, authTag, encrypted])
		writeFileSync(outputFile, result)
	}

	/** 解密文件 */
	async decryptFile(inputFile: string, outputFile: string, key: string) {
		if (!this.isSecretKeyValid(key)) {
			throw new Error('Invalid secret key')
		}

		const keyBuffer = Buffer.from(key, 'hex')
		const data = readFileSync(inputFile)

		const iv = data.subarray(0, 16)
		const authTag = data.subarray(16, 32)
		const encrypted = data.subarray(32)

		const decipher = createDecipheriv(algorithm, keyBuffer, iv) as any
		decipher.setAuthTag(authTag)

		let decrypted = decipher.update(encrypted)
		decrypted = Buffer.concat([decrypted, decipher.final()])

		writeFileSync(outputFile, decrypted)
	}

	async genSecretKey() {
		const key = randomBytes(secretKeyBytes).toString('hex')
		return key
	}

	async isSecretKeyValid(key: string) {
		return key.length === secretKeyBytes * 2
	}
}

export const cryptoUtil = new CryptoUtil()
