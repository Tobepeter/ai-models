import cors from 'cors'
import express from 'express'
import multer from 'multer'
import rateLimit from 'express-rate-limit'
import { ossAPI } from './utils/oss-api'

const PORT = 3001
const ERROR_CODE = 101
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const app = express()

// 速率限制配置
const uploadLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15分钟
	max: 100, // 限制每个IP 15分钟内最多100次上传
	message: {
		code: ERROR_CODE,
		msg: '上传请求过于频繁，请稍后再试',
		error: 'RATE_LIMIT_EXCEEDED'
	}
})

const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15分钟
	max: 1000, // 限制每个IP 15分钟内最多1000次请求
	message: {
		code: ERROR_CODE,
		msg: '请求过于频繁，请稍后再试',
		error: 'RATE_LIMIT_EXCEEDED'
	}
})

// 配置 multer 用于文件上传
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: MAX_FILE_SIZE,
	},
})

// 文件验证函数
const validateFile = (file: Express.Multer.File) => {
	// 文件大小验证
	if (file.size > MAX_FILE_SIZE) {
		throw new Error('文件大小不能超过10MB')
	}

	// 文件类型白名单验证
	const allowedTypes = [
		'image/', 'video/', 'audio/',
		'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument',
		'text/', 'application/json', 'application/zip', 'application/x-rar-compressed'
	]

	if (!allowedTypes.some(type => file.mimetype.startsWith(type))) {
		throw new Error(`不支持的文件类型: ${file.mimetype}`)
	}

	// 文件名验证
	if (!file.originalname || file.originalname.length > 255) {
		throw new Error('文件名无效或过长')
	}
}

app.use(cors())
app.use(express.json())
app.use(generalLimiter) // 应用通用速率限制

ossAPI.init()

// 获取STS临时凭证
app.post('/api/oss/sts', async (req, res) => {
	try {
		const result = await ossAPI.getStsToken()
		const { credentials } = result

		res.json({
			code: 0,
			msg: 'success',
			data: { credentials },
		})
	} catch (error: any) {
		console.error('获取STS凭证失败:', error)
		res.status(500).json({
			code: ERROR_CODE,
			msg: `获取STS凭证失败: ${error.message}`,
			error: error.message,
		})
	}
})

// 生成上传签名
app.post('/api/oss/sign-to-upload', async (req, res) => {
	try {
		const { objectKey, fileType } = req.body

		if (!objectKey) {
			return res.status(400).json({
				code: ERROR_CODE,
				msg: 'objectKey不能为空',
				error: 'objectKey不能为空',
			})
		}

		const signedUrl = ossAPI.signToUpload(objectKey, fileType || 'application/octet-stream')

		res.json({
			code: 0,
			msg: 'success',
			data: {
				signedUrl,
				objectKey,
			},
		})
	} catch (error: any) {
		res.status(500).json({
			code: ERROR_CODE,
			msg: `生成上传签名失败: ${error.message}`,
			error: error.message,
		})
	}
})

// 生成获取签名
app.post('/api/oss/sign-to-fetch', async (req, res) => {
	try {
		const { objectKey } = req.body

		if (!objectKey) {
			return res.status(400).json({
				code: ERROR_CODE,
				msg: 'objectKey不能为空',
				error: 'objectKey不能为空',
			})
		}

		const signedUrl = ossAPI.signToFetch(objectKey)

		res.json({
			code: 0,
			msg: 'success',
			data: {
				signedUrl,
				objectKey,
			},
		})
	} catch (error: any) {
		res.status(500).json({
			code: ERROR_CODE,
			msg: `生成获取签名失败: ${error.message}`,
			error: error.message,
		})
	}
})

// 生成对象键
app.post('/api/oss/hashify-name', async (req, res) => {
	try {
		const { fileName } = req.body

		if (!fileName) {
			return res.status(400).json({
				code: ERROR_CODE,
				msg: '文件名不能为空',
				error: '文件名不能为空',
			})
		}

		const hashifyName = ossAPI.hashifyName(fileName)

		res.json({
			code: 0,
			msg: 'success',
			data: {
				hashifyName,
			},
		})
	} catch (error: any) {
		res.status(500).json({
			code: ERROR_CODE,
			msg: `生成对象键失败: ${error.message}`,
			error: error.message,
		})
	}
})

// 获取文件列表
app.get('/api/oss/files', async (req, res) => {
	try {
		const { prefix = '', maxKeys } = req.query

		let maxKeysInt = parseInt(maxKeys as string, 10)
		if (isNaN(maxKeysInt)) {
			maxKeysInt = 100
		}

		const result = await ossAPI.getFileList(prefix as string, maxKeysInt)

		res.json({
			code: 0,
			msg: 'success',
			data: result,
		})
	} catch (error: any) {
		console.error('获取文件列表失败:', error)
		res.status(500).json({
			code: ERROR_CODE,
			msg: `获取文件列表失败: ${error.message}`,
			error: error.message,
		})
	}
})

// ============================================================================
// 代理模式接口 - 后端全权代理操作
// ============================================================================

// 直接上传文件
app.post('/api/oss/upload', uploadLimiter, upload.single('file'), async (req, res) => {
	try {
		const file = req.file
		if (!file) {
			return res.status(400).json({
				code: ERROR_CODE,
				msg: '文件不能为空',
				error: '文件不能为空',
			})
		}

		// 文件验证
		try {
			validateFile(file)
		} catch (validationError: any) {
			return res.status(400).json({
				code: ERROR_CODE,
				msg: validationError.message,
				error: 'FILE_VALIDATION_FAILED',
			})
		}

		// 获取可选参数
		const { prefix, fileName, noPreview } = req.body

		// 确定最终文件名
		const finalFileName = fileName || file.originalname

		// 生成哈希化文件名
		const hashifyName = ossAPI.hashifyName(finalFileName)

		// 生成最终的 objectKey
		let objectKey = hashifyName
		if (prefix) {
			// 确保 prefix 以 / 结尾
			const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`
			objectKey = normalizedPrefix + hashifyName
		}

		// 上传文件到OSS
		await ossAPI.uploadFile(file.buffer, objectKey, file.mimetype)
		console.log(`[OSS] 代理模式上传成功: ${objectKey}, 大小: ${file.size}, 类型: ${file.mimetype}, IP: ${req.ip}`)

		// 根据 noPreview 参数决定是否获取URL
		let url: string | undefined = undefined
		if (noPreview !== 'true') {
			url = ossAPI.getFileUrl(objectKey)
		}

		res.json({
			code: 0,
			msg: 'success',
			data: {
				objectKey,
				url,
				size: file.size,
				type: file.mimetype,
				uploadTime: new Date().toISOString(),
			},
		})
	} catch (error: any) {
		console.error(`[OSS] 代理模式上传失败: IP: ${req.ip}`, error)
		res.status(500).json({
			code: ERROR_CODE,
			msg: `上传失败: ${error.message}`,
			error: error.message,
		})
	}
})

// 删除文件
app.post('/api/oss/delete', async (req, res) => {
	try {
		const { objectKey } = req.body
		if (!objectKey) {
			return res.status(400).json({
				code: ERROR_CODE,
				msg: 'objectKey不能为空',
			})
		}

		await ossAPI.deleteFile(objectKey)
		res.json({
			code: 0,
			msg: 'success',
		})
	} catch (error: any) {
		res.status(500).json({
			code: ERROR_CODE,
			msg: `删除失败: ${error.message}`,
			error: error.message,
		})
	}
})

// 获取文件URL
app.post('/api/oss/get-url', async (req, res) => {
	try {
		const { objectKey } = req.body
		if (!objectKey) {
			return res.status(400).json({
				code: ERROR_CODE,
				msg: 'objectKey不能为空',
			})
		}

		const url = ossAPI.getFileUrl(objectKey)
		res.json({
			code: 0,
			msg: 'success',
			data: { url, objectKey },
		})
	} catch (error: any) {
		res.status(500).json({
			code: ERROR_CODE,
			msg: `获取URL失败: ${error.message}`,
			error: error.message,
		})
	}
})

app.listen(PORT, () => {
	console.log(`OSS服务器运行在 http://localhost:${PORT}`)
})
