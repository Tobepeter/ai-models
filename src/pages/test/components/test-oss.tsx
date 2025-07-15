import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ossClient } from '@/utils/oss/oss-client'
import { ossConfig } from '@/utils/oss/oss-config'
import { STSCredentials, UploadResult } from '@/utils/oss/oss-types'
import { useMount } from 'ahooks'
import { useRef, useState } from 'react'

/**
 * OSS功能测试页面
 */
export const TestOSS = () => {
	const [uploading, setUploading] = useState(false)
	const [progress, setProgress] = useState(0)
	const [status, setStatus] = useState('unknown')
	const [result, setResult] = useState<UploadResult | null>(null)
	const fileRef = useRef<HTMLInputElement>(null)

	// STS凭证缓存
	const [sts, setSts] = useState<STSCredentials | null>(null)
	const [loading, setLoading] = useState(false)

	// OSS路径预览相关状态
	const [path, setPath] = useState('test/avatar.jpeg')
	const [preview, setPreview] = useState('')

	// 检查OSS服务器状态
	const checkStatus = async () => {
		const active = await ossClient.checkServerStatus()
		setStatus(active ? 'running' : 'error')
	}

	// 获取STS临时凭证
	const getSts = async (): Promise<STSCredentials> => {
		try {
			setLoading(true)
			const credentials = await ossClient.getStsCredentials()
			setSts(credentials)
			return credentials
		} catch (error) {
			console.error('[STS] 获取凭证失败:', error)
			throw error
		} finally {
			setLoading(false)
		}
	}

	// 检查并获取有效的STS凭证
	const getValidSts = async (): Promise<STSCredentials> => {
		const credentials = await ossClient.getValidStsCredentials()
		setSts(credentials)
		return credentials
	}

	useMount(() => {
		checkStatus()
		getValidSts().catch(console.error)
	})

	// OSS上传函数
	const upload = async (file: File) => {
		try {
			setUploading(true)
			setProgress(0)

			const uploadResult = await ossClient.uploadFile(file, setProgress)

			setResult(uploadResult)
			return uploadResult
		} catch (error) {
			console.error('OSS上传失败:', error)
			throw error
		} finally {
			setUploading(false)
			setProgress(0)
		}
	}

	// 删除OSS文件
	const deleteFile = async (key: string) => {
		await ossClient.deleteFile(key)
	}

	// 文件上传处理
	const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		try {
			await upload(file)
		} catch (error) {
			const { message } = error instanceof Error ? error : { message: '未知错误' }
			alert(`文件上传失败: ${message}`)
		}
	}

	// 选择文件
	const selectFile = () => {
		fileRef.current?.click()
	}

	// 删除上传结果
	const deleteResult = async () => {
		if (!result) return

		try {
			await deleteFile(result.objectKey)
			setResult(null)
		} catch (error) {
			const { message } = error instanceof Error ? error : { message: '未知错误' }
			alert(`删除失败: ${message}`)
		}
	}

	// 获取OSS签名URL
	const getSignedUrl = async () => {
		if (!path.trim()) {
			alert('请输入OSS路径')
			return
		}

		try {
			// 确保STS凭证有效
			await getValidSts()
			// 获取签名URL
			const signedUrl = ossClient.getOssUrl(path)
			if (signedUrl) {
				setPreview(signedUrl)
			} else {
				alert('获取签名URL失败，请检查STS凭证')
			}
		} catch (error) {
			const { message } = error instanceof Error ? error : { message: '未知错误' }
			alert(`获取签名URL失败: ${message}`)
		}
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">阿里云OSS功能测试</h1>
			</div>

			{/* 配置信息 */}
			<Card>
				<CardContent className="pt-6">
					<div className="grid grid-cols-2 gap-6">
						<Card>
							<CardContent className="p-4">
								<div className="space-y-1">
									<div>
										<strong>OSS服务器:</strong> {ossConfig.serverUrl}
									</div>
									<div>
										<strong>OSS区域:</strong> {ossConfig.region}
									</div>
									<div>
										<strong>OSS存储桶:</strong> {ossConfig.bucket}
									</div>
									<div className="text-sm text-gray-600 mt-2">
										请确保OSS服务器正在运行: <code>npm run oss-server</code>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex flex-col gap-2">
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm" onClick={checkStatus}>
											检查服务器状态
										</Button>
										<Badge variant={status === 'running' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}>
											{status === 'running' ? '服务器运行中' : status === 'error' ? '服务器错误' : '未知状态'}
										</Badge>
									</div>
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm" onClick={() => getSts()} disabled={loading}>
											{loading ? '获取中...' : '刷新STS'}
										</Button>
										<Badge variant={sts ? 'default' : 'secondary'}>{sts ? `STS有效(${new Date(sts.expiration).toLocaleTimeString()})` : 'STS未获取'}</Badge>
									</div>
								</div>
							</CardContent>
						</Card>
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
								<div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
							</div>
							<div>{progress}%</div>
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
							<Button onClick={selectFile} disabled={uploading}>
								{uploading ? '上传中...' : '选择文件'}
							</Button>
							{result && (
								<Button variant="outline" onClick={deleteResult}>
									删除文件
								</Button>
							)}
						</div>

						<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

						{result && (
							<div className="space-y-4">
								<div className="space-y-2">
									<div className="text-sm font-medium">上传结果:</div>
									<div className="text-xs text-gray-600 space-y-1">
										<div>
											<strong>ObjectKey:</strong> {result.objectKey}
										</div>
										<div>
											<strong>访问URL:</strong> {result.url}
										</div>
										<div>
											<strong>文件大小:</strong> {(result.size / 1024).toFixed(2)} KB
										</div>
										<div>
											<strong>上传时间:</strong> {new Date(result.uploadTime).toLocaleString()}
										</div>
									</div>
								</div>

								<div className="border rounded p-2">
									<img
										src={result.url}
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
					<CardTitle>OSS签名URL获取</CardTitle>
					<CardDescription>输入OSS路径，获取STS签名的临时访问链接</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="oss-path">OSS路径</Label>
							<div className="flex gap-2">
								<Input
									id="oss-path"
									placeholder="例如: images/1234567890_abc123.jpg"
									value={path}
									onChange={(e) => setPath(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											getSignedUrl()
										}
									}}
								/>
								<Button onClick={getSignedUrl}>获取URL</Button>
							</div>
							<div className="text-xs text-gray-500">输入OSS路径后点击获取URL按钮将生成带STS签名的临时访问链接</div>
						</div>

						{preview && (
							<div className="space-y-4">
								<div className="space-y-2">
									<div className="text-sm font-medium">签名URL结果:</div>
									<div className="text-xs text-gray-600">
										<a href={preview} target="_blank">
											{preview}
										</a>
									</div>
								</div>

								<div className="border rounded p-2">
									<img
										src={preview}
										alt="OSS签名URL图片"
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
			{result && (
				<Card>
					<CardHeader>
						<CardTitle>最后上传结果</CardTitle>
					</CardHeader>
					<CardContent>
						<pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
					</CardContent>
				</Card>
			)}
		</div>
	)
}

