import express, { Express } from 'express'
import cors from 'cors'
import OSS from 'ali-oss'
import dotenv from 'dotenv-flow'

const { STS } = OSS

dotenv.config()

const { OSS_REGION, OSS_BUCKET, OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, OSS_ROLE_ARN } = process.env

if (!OSS_REGION || !OSS_BUCKET || !OSS_ACCESS_KEY_ID || !OSS_ACCESS_KEY_SECRET || !OSS_ROLE_ARN) {
	console.error('❌ 缺少必要的环境变量:')
	process.exit(1)
}

const PORT = 3001
const app: Express = express()

const ERROR_CODE = 101 // 暂时写死

app.use(cors())
app.use(express.json())

// 创建OSS客户端
const client = new OSS({
	region: OSS_REGION,
	accessKeyId: OSS_ACCESS_KEY_ID,
	accessKeySecret: OSS_ACCESS_KEY_SECRET,
	bucket: OSS_BUCKET,
})

// 创建STS客户端
const sts = new STS({
	accessKeyId: OSS_ACCESS_KEY_ID,
	accessKeySecret: OSS_ACCESS_KEY_SECRET,
})

// 获取STS临时凭证
app.post('/api/oss/sts', async (req, res) => {
	try {
		const result = await sts.assumeRole(
			OSS_ROLE_ARN, // 角色ARN
			'', // 自定义权限
			3600 // 过期时间(秒)
		)

		const { credentials } = result

		res.json({
			code: 0,
			msg: 'success',
			data: {
				accessKeyId: credentials.AccessKeyId,
				accessKeySecret: credentials.AccessKeySecret,
				stsToken: credentials.SecurityToken,
				expiration: credentials.Expiration,
			},
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
app.post('/api/oss/signature', async (req, res) => {
	try {
		const { fileName, fileType } = req.body

		if (!fileName) {
			return res.status(400).json({
				success: false,
				error: '文件名不能为空',
			})
		}

		// 生成唯一文件名
		const timestamp = Date.now()
		const randomStr = Math.random().toString(36).substring(2)
		const ext = fileName.split('.').pop()
		const uniqueFileName = `${timestamp}_${randomStr}.${ext}`

		// 根据文件类型确定路径前缀
		let pathPrefix = 'files/'
		if (fileType?.startsWith('image/')) {
			pathPrefix = 'images/'
		} else if (fileType?.startsWith('video/')) {
			pathPrefix = 'videos/'
		}

		const objectKey = pathPrefix + uniqueFileName

		// 生成上传URL
		const url = client.signatureUrl(objectKey, {
			method: 'PUT',
			expires: 3600, // 1小时有效期
			'Content-Type': fileType,
		})

		res.json({
			code: 0,
			msg: 'success',
			data: {
				uploadUrl: url,
				objectKey,
				accessUrl: `https://${OSS_BUCKET}.${OSS_REGION}.aliyuncs.com/${objectKey}`,
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

		await client.delete(objectKey)

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
		const canPublic = false

		let maxKeysInt = parseInt(maxKeys as string, 10)
		if (isNaN(maxKeysInt)) {
			maxKeysInt = 100
		}

		const result = await client.list(
			{
				prefix: prefix as string, // 匹配path前缀
				'max-keys': maxKeysInt, // 最大返回数量
			},
			{}
		)

		const getUrlPublic = (name: string) => {
			return `https://${OSS_BUCKET}.${OSS_REGION}.aliyuncs.com/${name}`
		}

		const getUrlSigned = (name: string) => {
			return client.signatureUrl(name, {
				method: 'GET',
				expires: 3600,
			})
		}

		const getUrl = canPublic ? getUrlPublic : getUrlSigned

		const files =
			result.objects?.map((obj) => ({
				name: obj.name, // 文件名，包含路径（无前导 /）
				size: obj.size,
				lastModified: obj.lastModified,
				url: getUrl(obj.name),
			})) || []

		res.json({
			code: 0,
			msg: 'success',
			data: {
				files,
				isTruncated: result.isTruncated,
				nextMarker: result.nextMarker,
			},
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

app.listen(PORT, () => {
	console.log(`OSS服务器运行在 http://localhost:${PORT}`)
})
