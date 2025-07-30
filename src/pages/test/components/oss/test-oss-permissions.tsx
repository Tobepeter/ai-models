import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { OssAccessType } from '@/utils/oss/oss-types'
import { ossAccessKeyId } from '@/utils/env'

/**
 * OSS权限配置组件
 * 配置读写权限、后端签名模式和AK密钥
 */
export const TestOssPermissions = (props: TestOssPermissionsProps) => {
	const {
		readPermission,
		writePermission,
		backendSignMode,
		akDialogOpen,
		currAccessKeyId,
		currAccessKeySecret,
		onReadPermissionChange,
		onWritePermissionChange,
		onBackendSignModeChange,
		onAkDialogOpenChange,
		onAccessKeyIdChange,
		onAccessKeySecretChange,
		onSaveAkConfig,
	} = props
	return (
		<Card data-slot="test-oss-permissions">
			<CardHeader>
				<CardTitle>权限测试</CardTitle>
				<CardDescription>配置和测试不同的OSS权限模式</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* 读权限选择 */}
					<div className="space-y-2">
						<Label>读权限</Label>
						<Select value={readPermission} onValueChange={(val) => onReadPermissionChange?.(val as OssAccessType)}>
							<SelectTrigger>
								<SelectValue placeholder="选择读权限模式" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={OssAccessType.Sts}>STS - 临时凭证</SelectItem>
								<SelectItem value={OssAccessType.Api}>API - 后端代理</SelectItem>
								<SelectItem value={OssAccessType.Pub}>PUB - 公共访问</SelectItem>
								<SelectItem value={OssAccessType.Ak} disabled={!ossAccessKeyId}>
									AK - 访问密钥 {!ossAccessKeyId && '(未配置)'}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* 写权限选择 */}
					<div className="space-y-2">
						<Label>写权限</Label>
						<Select value={writePermission} onValueChange={(val) => onWritePermissionChange?.(val as OssAccessType)}>
							<SelectTrigger>
								<SelectValue placeholder="选择写权限模式" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={OssAccessType.Sts}>STS - 临时凭证</SelectItem>
								<SelectItem value={OssAccessType.Api}>API - 后端代理</SelectItem>
								<SelectItem value={OssAccessType.Pub}>PUB - 公共访问</SelectItem>
								<SelectItem value={OssAccessType.Ak} disabled={!ossAccessKeyId}>
									AK - 访问密钥 {!ossAccessKeyId && '(未配置)'}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* 后端签名模式配置 */}
					<div className="space-y-2">
						<Label>后端签名模式</Label>
						<div className="flex items-center space-x-2 h-10 px-3 py-2 border border-input bg-background rounded-md">
							<Switch id="backend-sign-mode" checked={backendSignMode} onCheckedChange={onBackendSignModeChange} />
							<Label htmlFor="backend-sign-mode" className="text-sm">
								{backendSignMode ? '启用' : '禁用'}
							</Label>
						</div>
						<div className="text-xs text-gray-500">启用后使用后端签名URL，禁用后使用后端代理模式</div>
					</div>
				</div>

				{/* AK配置按钮 */}
				<div className="flex items-center gap-4 pt-2">
					<Dialog open={akDialogOpen} onOpenChange={onAkDialogOpenChange}>
						<DialogTrigger asChild>
							<Button variant="outline" disabled={!!ossAccessKeyId}>
								{ossAccessKeyId ? 'AK已配置' : '配置AK'}
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>配置访问密钥</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="access-key-id">Access Key ID</Label>
									<Input id="access-key-id" placeholder="请输入Access Key ID" value={currAccessKeyId} onChange={(e) => onAccessKeyIdChange?.(e.target.value)} />
								</div>
								<div className="space-y-2">
									<Label htmlFor="access-key-secret">Access Key Secret</Label>
									<Input id="access-key-secret" type="password" placeholder="请输入Access Key Secret" value={currAccessKeySecret} onChange={(e) => onAccessKeySecretChange?.(e.target.value)} />
								</div>
								<div className="flex justify-end gap-2">
									<Button variant="outline" onClick={() => onAkDialogOpenChange?.(false)}>
										取消
									</Button>
									<Button onClick={onSaveAkConfig} disabled={!currAccessKeyId || !currAccessKeySecret}>
										保存
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>

					{/* 当前配置显示 */}
					<div className="text-sm text-muted-foreground">
						<p>当前AK状态: {ossAccessKeyId ? '已配置' : '未配置'}</p>
						{ossAccessKeyId && <p>Access Key ID: {ossAccessKeyId.slice(0, 8)}***</p>}
					</div>
				</div>

				{/* 权限配置信息 */}
				<div className="space-y-2 pt-2 border-t">
					<Label>当前权限配置</Label>
					<div className="text-sm text-muted-foreground space-y-1">
						<p>读权限: {readPermission}</p>
						<p>写权限: {writePermission}</p>
						<p>后端签名模式: {backendSignMode ? '启用' : '禁用'}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export interface TestOssPermissionsProps {
	readPermission: OssAccessType
	writePermission: OssAccessType
	backendSignMode: boolean
	akDialogOpen: boolean
	currAccessKeyId: string
	currAccessKeySecret: string
	onReadPermissionChange?: (permission: OssAccessType) => void
	onWritePermissionChange?: (permission: OssAccessType) => void
	onBackendSignModeChange?: (enabled: boolean) => void
	onAkDialogOpenChange?: (open: boolean) => void
	onAccessKeyIdChange?: (value: string) => void
	onAccessKeySecretChange?: (value: string) => void
	onSaveAkConfig?: () => void
}
