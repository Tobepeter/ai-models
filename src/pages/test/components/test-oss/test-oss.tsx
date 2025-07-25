import { ossAccessKeyId, ossAccessKeySecret, ossReadAccess, ossWriteAccess } from '@/utils/env'
import { ossApiClient } from '@/utils/oss/oss-api-client'
import { ossClient } from '@/utils/oss/oss-client'
import { ossStsClient } from '@/utils/oss/oss-sts-client'
import { OssAccessType, OssUploadResult } from '@/utils/oss/oss-types'
import { useMount } from 'ahooks'
import { type Credentials } from 'ali-oss'
import { useRef, useState } from 'react'
import { TestOssConfigInfo } from './test-oss-config-info'
import { TestOssFileUpload } from './test-oss-file-upload'
import { TestOssHeader } from './test-oss-header'
import { TestOssPermissions } from './test-oss-permissions'
import { TestOssResult } from './test-oss-result'
import { TestOssUploadProgress } from './test-oss-upload-progress'
import { TestOssUrlPreview } from './test-oss-url-preview'

/**
 * OSS功能测试页面
 * 提供文件上传、权限配置、URL预览等功能
 */
export const TestOSS = () => {
	const [uploading, setUploading] = useState(false)
	const [progress, setProgress] = useState(0)
	const [status, setStatus] = useState('unknown')
	const [result, setResult] = useState<OssUploadResult | null>(null)
	const fileRef = useRef<HTMLInputElement>(null)

	const [sts, setSts] = useState<Credentials | null>(null)
	const [loading, setLoading] = useState(false)

	const [path, setPath] = useState('test/avatar.jpeg')
	const [preview, setPreview] = useState('')

	const [readPerm, setReadPerm] = useState<OssAccessType>(ossReadAccess)
	const [writePerm, setWritePerm] = useState<OssAccessType>(ossWriteAccess)
	const [akDialogOpen, setAkDialogOpen] = useState(false)
	const [currAkId, setCurrAkId] = useState(ossAccessKeyId)
	const [currAkSecret, setCurrAkSecret] = useState(ossAccessKeySecret)

	const [backendSignMode, setBackendSignMode] = useState(ossApiClient.signMode)

	const handleReadPermChange = (newPerm: OssAccessType) => {
		setReadPerm(newPerm)
		ossClient.changeReadAccess(newPerm)
		console.log('[权限测试] 读权限已更新:', newPerm)
	}

	const handleWritePermChange = (newPerm: OssAccessType) => {
		setWritePerm(newPerm)
		ossClient.changeWriteAccess(newPerm)
		console.log('[权限测试] 写权限已更新:', newPerm)
	}

	const handleBackendSignModeChange = (enabled: boolean) => {
		setBackendSignMode(enabled)
		ossApiClient.setSignMode(enabled)
		console.log('[后端签名模式] 已更新:', enabled)
	}

	const handleSaveAkConfig = () => {
		ossClient.update({
			accessKeyId: currAkId,
			accessKeySecret: currAkSecret,
		})
		setAkDialogOpen(false)
	}

	// 检查OSS服务器状态
	const checkStatus = async () => {
		// TODO: 实现服务器状态检查
		setStatus('running')
	}

	// 获取STS临时凭证
	const getSts = async (): Promise<Credentials> => {
		try {
			setLoading(true)
			// 使用STS客户端获取凭证
			const credentials = await ossStsClient.getValidStsToken()
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
	const getValidSts = async (): Promise<Credentials> => {
		const credentials = await ossStsClient.getValidStsToken()
		setSts(credentials)
		return credentials
	}

	useMount(() => {
		ossClient.init()
		checkStatus()
		getValidSts().catch(console.error)
	})

	// OSS上传函数
	const upload = async (file: File) => {
		try {
			setUploading(true)
			setProgress(0)

			const uploadResult = await ossClient.uploadFile(file)

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
			// 获取文件URL
			const signedUrl = await ossClient.getFileUrl(path)
			if (signedUrl) {
				setPreview(signedUrl)
			} else {
				alert('获取文件URL失败')
			}
		} catch (error) {
			const { message } = error instanceof Error ? error : { message: '未知错误' }
			alert(`获取文件URL失败: ${message}`)
		}
	}

	return (
		<div className="p-6 space-y-6">
			<TestOssHeader />

			<TestOssConfigInfo 
				status={status}
				sts={sts}
				loading={loading}
				onCheckStatus={checkStatus}
				onGetSts={getSts}
			/>

			<TestOssUploadProgress 
				uploading={uploading}
				progress={progress}
			/>

			<TestOssFileUpload
				uploading={uploading}
				result={result}
				fileRef={fileRef}
				onUpload={handleUpload}
				onSelectFile={selectFile}
				onDeleteResult={deleteResult}
			/>

			<TestOssUrlPreview
				path={path}
				preview={preview}
				onPathChange={setPath}
				onGetSignedUrl={getSignedUrl}
			/>

			<TestOssPermissions
				readPermission={readPerm}
				writePermission={writePerm}
				backendSignMode={backendSignMode}
				akDialogOpen={akDialogOpen}
				currAccessKeyId={currAkId}
				currAccessKeySecret={currAkSecret}
				onReadPermissionChange={handleReadPermChange}
				onWritePermissionChange={handleWritePermChange}
				onBackendSignModeChange={handleBackendSignModeChange}
				onAkDialogOpenChange={setAkDialogOpen}
				onAccessKeyIdChange={setCurrAkId}
				onAccessKeySecretChange={setCurrAkSecret}
				onSaveAkConfig={handleSaveAkConfig}
			/>

			<TestOssResult result={result} />
		</div>
	)
}
