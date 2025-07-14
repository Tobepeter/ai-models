import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'

class OssClient {
	OSS_SERVER_URL = 'http://localhost:3001'
	OSS_REGION = 'oss-cn-shenzhen'
	OSS_BUCKET = 'tobeei-bucket'

	private stsCredentials: STSCredentials | null = null

	// 检查OSS服务器状态
	async checkServerStatus(): Promise<'running' | 'error'> {
		try {
			const response = await axios.get(`${this.OSS_SERVER_URL}/api/oss/files?maxKeys=1`)
			if (response.data.code === 0) {
				return 'running'
			} else {
				return 'error'
			}
		} catch (error) {
			return 'error'
		}
	}

	// 获取STS临时凭证
	async getStsCredentials(): Promise<STSCredentials> {
		try {
			const response = await axios.post<STSResponse>(`${this.OSS_SERVER_URL}/api/oss/sts`)

			const { data } = response
			if (data.code !== 0) {
				throw new Error(data.msg || '获取STS凭证失败')
			}

			// 适配新的API响应格式
			const credentials: STSCredentials = {
				accessKeyId: data.data.accessKeyId,
				accessKeySecret: data.data.accessKeySecret,
				securityToken: data.data.stsToken,
				expiration: data.data.expiration,
				region: this.OSS_REGION,
				bucket: this.OSS_BUCKET,
				endpoint: `https://${this.OSS_REGION}.aliyuncs.com`,
			}
			this.stsCredentials = credentials

			// 缓存到localStorage，提前5分钟过期
			const cacheData = {
				credentials,
				expiry: new Date(credentials.expiration).getTime() - 5 * 60 * 1000,
			}
			localStorage.setItem('oss_sts_cache', JSON.stringify(cacheData))

			console.log('[STS] 获取新凭证成功，过期时间:', new Date(credentials.expiration).toLocaleString())
			return credentials
		} catch (error) {
			console.error('[STS] 获取凭证失败:', error)
			throw error
		}
	}

	// 检查并获取有效的STS凭证
	async getValidStsCredentials(): Promise<STSCredentials> {
		// 检查内存缓存
		if (this.stsCredentials) {
			const expiry = new Date(this.stsCredentials.expiration).getTime() - 5 * 60 * 1000
			if (Date.now() < expiry) {
				console.log('[STS] 使用内存缓存凭证')
				return this.stsCredentials
			}
		}

		// 检查localStorage缓存
		try {
			const cached = localStorage.getItem('oss_sts_cache')
			if (cached) {
				const { credentials, expiry } = JSON.parse(cached)
				if (Date.now() < expiry) {
					console.log('[STS] 使用localStorage缓存凭证')
					this.stsCredentials = credentials
					return credentials
				}
			}
		} catch (error) {
			console.warn('[STS] 解析缓存失败:', error)
		}

		// 获取新凭证
		console.log('[STS] 缓存过期或不存在，获取新凭证')
		return await this.getStsCredentials()
	}

	// 上传文件到OSS
	async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<UploadResult> {
		try {
			// 1. 获取有效的STS凭证
			const credentials = await this.getValidStsCredentials()

			// 2. 生成文件名和路径
			const timestamp = Date.now()
			const randomStr = Math.random().toString(36).substring(2)
			const ext = file.name.split('.').pop()
			const fileName = `${timestamp}_${randomStr}.${ext}`

			// 根据文件类型确定路径前缀
			let pathPrefix = 'files/'
			if (file.type.startsWith('image/')) {
				pathPrefix = 'images/'
			} else if (file.type.startsWith('video/')) {
				pathPrefix = 'videos/'
			}

			const objectKey = pathPrefix + fileName
			const accessUrl = `https://${credentials.bucket}.${credentials.region}.aliyuncs.com/${objectKey}`

			// 3. 使用STS凭证创建OSS客户端并上传文件
			const OSS = (await import('ali-oss')).default
			const ossClient = new OSS({
				region: credentials.region,
				accessKeyId: credentials.accessKeyId,
				accessKeySecret: credentials.accessKeySecret,
				stsToken: credentials.securityToken,
				bucket: credentials.bucket,
			})

			console.log('[OSS] 使用STS凭证上传文件:', {
				objectKey,
				accessUrl,
				credentials: {
					accessKeyId: credentials.accessKeyId,
					securityToken: credentials.securityToken,
					expiration: credentials.expiration,
				},
			})

			// 使用OSS SDK上传文件
			const uploadResult = await ossClient.put(objectKey, file, {
				progress: (p: any) => {
					onProgress?.(Math.round(p * 100))
				},
			} as any)

			console.log('[OSS] 上传成功:', uploadResult)

			// 返回结果
			const result: UploadResult = {
				url: accessUrl,
				objectKey,
				size: file.size,
				type: file.type,
				uploadTime: new Date().toISOString(),
			}

			return result
		} catch (error) {
			console.error('OSS上传失败:', error)
			throw error
		}
	}

	// 删除OSS文件
	async deleteFile(objectKey: string): Promise<void> {
		try {
			const response = await axios.delete<DeleteResponse>(`${this.OSS_SERVER_URL}/api/oss/file`, {
				data: { objectKey },
			})

			const { data } = response
			if (data.code !== 0) {
				throw new Error(data.msg || '删除文件失败')
			}
		} catch (error) {
			console.error('OSS删除失败:', error)
			throw error
		}
	}

	// 获取当前STS凭证状态
	getStsCredentialsStatus(): { hasCredentials: boolean; expiration?: string } {
		if (this.stsCredentials) {
			return {
				hasCredentials: true,
				expiration: this.stsCredentials.expiration,
			}
		}
		return { hasCredentials: false }
	}
}

const ossClient = new OssClient()

/**
 * OSS功能测试页面
 */
export const TestOSS = () => {
	const [uploading, setUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [serverStatus, setServerStatus] = useState<'unknown' | 'running' | 'error'>('unknown')
	const [lastUploadResult, setLastUploadResult] = useState<UploadResult | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// STS凭证缓存
	const [stsCredentials, setStsCredentials] = useState<STSCredentials | null>(null)
	const [stsLoading, setStsLoading] = useState(false)

	// OSS路径预览相关状态
	const [ossPath, setOssPath] = useState<string>('test/avatar.jpeg')
	const [previewUrl, setPreviewUrl] = useState<string>('')

	// 检查OSS服务器状态
	const checkServerStatus = async () => {
		const status = await ossClient.checkServerStatus()
		setServerStatus(status)
	}

	// 获取STS临时凭证
	const getStsCredentials = async (): Promise<STSCredentials> => {
		try {
			setStsLoading(true)
			const credentials = await ossClient.getStsCredentials()
			setStsCredentials(credentials)
			return credentials
		} catch (error) {
			console.error('[STS] 获取凭证失败:', error)
			throw error
		} finally {
			setStsLoading(false)
		}
	}

	// 检查并获取有效的STS凭证
	const getValidStsCredentials = async (): Promise<STSCredentials> => {
		const credentials = await ossClient.getValidStsCredentials()
		setStsCredentials(credentials)
		return credentials
	}

	// 组件挂载时初始化
	useEffect(() => {
		// 检查服务器状态
		checkServerStatus()

		// 预加载STS凭证
		getValidStsCredentials().catch((error) => {
			console.error('[STS] 预加载凭证失败:', error)
		})

		// 设置默认预览
		if (ossPath) {
			const fullUrl = `https://${ossClient.OSS_BUCKET}.${ossClient.OSS_REGION}.aliyuncs.com/${ossPath}`
			setPreviewUrl(fullUrl)
		}
	}, [])

	// OSS上传函数
	const uploadToOSS = async (file: File, type: 'image' | 'video') => {
		try {
			setUploading(true)
			setUploadProgress(0)

			const result = await ossClient.uploadFile(file, (percent) => {
				setUploadProgress(percent)
			})

			setLastUploadResult(result)
			return result
		} catch (error) {
			console.error('OSS上传失败:', error)
			throw error
		} finally {
			setUploading(false)
			setUploadProgress(0)
		}
	}

	// 删除OSS文件
	const deleteFromOSS = async (objectKey: string) => {
		await ossClient.deleteFile(objectKey)
	}

	// 文件上传处理
	const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		try {
			await uploadToOSS(file, 'image')
		} catch (error) {
			const { message } = error instanceof Error ? error : { message: '未知错误' }
			alert(`文件上传失败: ${message}`)
		}
	}

	// 选择文件
	const handleSelectFile = () => {
		fileInputRef.current?.click()
	}

	// 删除上传结果
	const handleDeleteResult = async () => {
		if (!lastUploadResult) return

		const { objectKey } = lastUploadResult
		try {
			await deleteFromOSS(objectKey)
			setLastUploadResult(null)
		} catch (error) {
			const { message } = error instanceof Error ? error : { message: '未知错误' }
			alert(`删除失败: ${message}`)
		}
	}

	// OSS路径预览处理
	const handlePreviewOssPath = () => {
		if (!ossPath.trim()) {
			alert('请输入OSS路径')
			return
		}

		// 构建完整的OSS访问URL
		const fullUrl = `https://${ossClient.OSS_BUCKET}.${ossClient.OSS_REGION}.aliyuncs.com/${ossPath}`
		setPreviewUrl(fullUrl)
	}

	// 清空OSS路径预览
	const handleClearPreview = () => {
		setOssPath('')
		setPreviewUrl('')
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">阿里云OSS功能测试</h1>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={checkServerStatus}>
						检查服务器状态
					</Button>
					<Badge variant={serverStatus === 'running' ? 'default' : serverStatus === 'error' ? 'destructive' : 'secondary'}>
						{serverStatus === 'running' ? '服务器运行中' : serverStatus === 'error' ? '服务器错误' : '未知状态'}
					</Badge>

					<Button variant="outline" size="sm" onClick={() => getStsCredentials()} disabled={stsLoading}>
						{stsLoading ? '获取中...' : '刷新STS'}
					</Button>
					<Badge variant={stsCredentials ? 'default' : 'secondary'}>{stsCredentials ? `STS有效(${new Date(stsCredentials.expiration).toLocaleTimeString()})` : 'STS未获取'}</Badge>
				</div>
			</div>

			{/* 配置信息 */}
			<Card>
				<CardContent className="pt-6">
					<div className="space-y-1">
						<div>
							<strong>OSS服务器:</strong> {ossClient.OSS_SERVER_URL}
						</div>
						<div>
							<strong>OSS区域:</strong> {ossClient.OSS_REGION}
						</div>
						<div>
							<strong>OSS存储桶:</strong> {ossClient.OSS_BUCKET}
						</div>
						<div className="text-sm text-gray-600 mt-2">
							请确保OSS服务器正在运行: <code>npm run oss-server</code>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 上传进度 */}
			{uploading && (
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<div>上传中...</div>
							<div className="flex-1 bg-gray-200 rounded-full h-2">
								<div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
							</div>
							<div>{uploadProgress}%</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* 文件上传测试 */}
			<Card>
				<CardHeader>
					<CardTitle>文件上传测试</CardTitle>
					<CardDescription>选择文件上传到阿里云OSS，获取objectKey进行访问</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="flex gap-2">
							<Button onClick={handleSelectFile} disabled={uploading}>
								{uploading ? '上传中...' : '选择文件'}
							</Button>
							{lastUploadResult && (
								<Button variant="outline" onClick={handleDeleteResult}>
									删除文件
								</Button>
							)}
						</div>

						<input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

						{lastUploadResult && (
							<div className="space-y-4">
								<div className="space-y-2">
									<div className="text-sm font-medium">上传结果:</div>
									<div className="text-xs text-gray-600 space-y-1">
										<div>
											<strong>ObjectKey:</strong> {lastUploadResult.objectKey}
										</div>
										<div>
											<strong>访问URL:</strong> {lastUploadResult.url}
										</div>
										<div>
											<strong>文件大小:</strong> {(lastUploadResult.size / 1024).toFixed(2)} KB
										</div>
										<div>
											<strong>上传时间:</strong> {new Date(lastUploadResult.uploadTime).toLocaleString()}
										</div>
									</div>
								</div>

								<div className="border rounded p-2">
									<img
										src={lastUploadResult.url}
										alt="上传的图片"
										className="max-w-full max-h-64 object-contain"
										onError={(e) => {
											e.currentTarget.style.display = 'none'
											e.currentTarget.nextElementSibling!.textContent = '图片加载失败'
										}}
									/>
									<div className="text-red-500 text-sm hidden">图片加载失败</div>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* OSS路径预览测试 */}
			<Card>
				<CardHeader>
					<CardTitle>OSS路径预览</CardTitle>
					<CardDescription>输入OSS路径，直接预览图片</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="oss-path">OSS路径</Label>
							<div className="flex gap-2">
								<Input
									id="oss-path"
									placeholder="例如: images/1234567890_abc123.jpg"
									value={ossPath}
									onChange={(e) => setOssPath(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											handlePreviewOssPath()
										}
									}}
								/>
								<Button onClick={handlePreviewOssPath}>预览</Button>
								<Button variant="outline" onClick={handleClearPreview}>
									清空
								</Button>
							</div>
							<div className="text-xs text-gray-500">
								完整URL: https://{ossClient.OSS_BUCKET}.{ossClient.OSS_REGION}.aliyuncs.com/{ossPath || 'your-path'}
							</div>
						</div>

						{previewUrl && (
							<div className="space-y-4">
								<div className="space-y-2">
									<div className="text-sm font-medium">预览结果:</div>
									<div className="text-xs text-gray-600">
										<strong>完整URL:</strong> {previewUrl}
									</div>
								</div>

								<div className="border rounded p-2">
									<img
										src={previewUrl}
										alt="OSS图片预览"
										className="max-w-full max-h-64 object-contain"
										onError={(e) => {
											e.currentTarget.style.display = 'none'
											e.currentTarget.nextElementSibling!.textContent = '图片加载失败或路径不存在'
										}}
									/>
									<div className="text-red-500 text-sm hidden">图片加载失败或路径不存在</div>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* 上传结果 */}
			{lastUploadResult && (
				<Card>
					<CardHeader>
						<CardTitle>最后上传结果</CardTitle>
					</CardHeader>
					<CardContent>
						<pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(lastUploadResult, null, 2)}</pre>
					</CardContent>
				</Card>
			)}
		</div>
	)
}

// ==================== 后端接口类型定义 ====================

/** 通用API响应格式 */
interface BaseResponse<T> {
	code: number
	msg: string
	data?: T
}

/** STS凭证信息 */
interface STSCredentials {
	accessKeyId: string // 访问密钥ID
	accessKeySecret: string // 访问密钥
	securityToken: string // 安全令牌
	expiration: string // 过期时间
	region: string // 区域
	bucket: string // 存储桶
	endpoint: string // 终端节点
}

/** 后端STS响应数据 */
interface STSResponseData {
	accessKeyId: string
	accessKeySecret: string
	stsToken: string
	expiration: string
}

/** STS响应 */
interface STSResponse extends BaseResponse<STSResponseData> {}

/** 上传签名响应 */
interface SignatureResponse
	extends BaseResponse<{
		uploadUrl: string
		accessUrl: string
		objectKey: string
	}> {}

/** 删除文件响应 */
interface DeleteResponse extends BaseResponse<void> {}

/** 文件列表响应 */
interface FileListResponse
	extends BaseResponse<{
		files: FileInfo[]
		isTruncated: boolean
		nextMarker?: string
	}> {}

/** 文件信息 */
interface FileInfo {
	name: string
	size: number
	lastModified: string
	url: string
}

/** 上传结果 */
interface UploadResult {
	url: string
	objectKey: string
	size: number
	type: string
	uploadTime: string
}
