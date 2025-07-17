import cors from 'cors'
import express from 'express'
import { ossAPI } from './utils/oss-api'

const PORT = 3001
const app = express()

const ERROR_CODE = 101

app.use(cors())
app.use(express.json())

ossAPI.init()

// 获取STS临时凭证
app.post('/api/oss/sts', async (req, res) => {
	try {
		const result = await ossAPI.getStsToken()
		const { credentials } = result

		// 直接返回 ali-oss 格式的 credentials
		res.json({
			code: 0,
			msg: 'success',
			data: credentials, // 原样返回 credentials
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

// 删除文件
app.delete('/api/oss/file', async (req, res) => {
	try {
		const { objectKey } = req.body

		if (!objectKey) {
			return res.status(400).json({
				code: ERROR_CODE,
				msg: 'objectKey不能为空',
				error: 'objectKey不能为空',
			})
		}

		await ossAPI.deleteFile(objectKey)

		res.json({
			code: 0,
			msg: 'success',
		})
	} catch (error: any) {
		console.error('删除文件失败:', error)
		res.status(500).json({
			code: ERROR_CODE,
			msg: `删除文件失败: ${error.message}`,
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

// API模式接口 - 直接上传文件
app.post('/api/oss/upload', async (req, res) => {
	try {
		// TODO: 需要添加 multer 中间件处理文件上传
		res.status(501).json({
			code: ERROR_CODE,
			msg: 'API模式上传接口待实现',
			error: 'NOT_IMPLEMENTED'
		})
	} catch (error: any) {
		res.status(500).json({
			code: ERROR_CODE,
			msg: `上传失败: ${error.message}`,
			error: error.message
		})
	}
})

// API模式接口 - 删除文件
app.post('/api/oss/delete', async (req, res) => {
	try {
		const { objectKey } = req.body
		if (!objectKey) {
			return res.status(400).json({
				code: ERROR_CODE,
				msg: 'objectKey不能为空'
			})
		}

		await ossAPI.deleteFile(objectKey)
		res.json({
			code: 0,
			msg: 'success'
		})
	} catch (error: any) {
		res.status(500).json({
			code: ERROR_CODE,
			msg: `删除失败: ${error.message}`,
			error: error.message
		})
	}
})

// API模式接口 - 获取文件URL
app.post('/api/oss/get-url', async (req, res) => {
	try {
		const { objectKey } = req.body
		if (!objectKey) {
			return res.status(400).json({
				code: ERROR_CODE,
				msg: 'objectKey不能为空'
			})
		}

		const url = ossAPI.getFileUrl(objectKey)
		res.json({
			code: 0,
			msg: 'success',
			data: { url, objectKey }
		})
	} catch (error: any) {
		res.status(500).json({
			code: ERROR_CODE,
			msg: `获取URL失败: ${error.message}`,
			error: error.message
		})
	}
})

app.listen(PORT, () => {
	console.log(`OSS服务器运行在 http://localhost:${PORT}`)
})
