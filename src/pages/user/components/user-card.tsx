import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileUpload } from '@/components/common/file-upload'
import { AppEmojiPicker } from '@/components/common/app-emoji-picker'
import { QuickEdit } from '@/components/common/quick-edit'
import { useUserStore, userState } from '@/store/user-store'
import { userUtil, parseUserExtra } from '../user-util'
import { userApi } from '@/api/user/user-api'
import { notify } from '@/components/common/notify'
import { LogIn, Upload, Smile } from 'lucide-react'
import { useState } from 'react'
import { MyAvatar } from './my-avatar'
import { PropsWithChildren } from 'react'

/** 用户信息卡片组件，支持编辑和只读模式 */
export const UserCard = (props: PropsWithChildren<UserCardProps>) => {
	const { readonly = false, userData, className } = props
	const { info: user, goLogin } = useUserStore()
	const [avatarLoading, setAvatarLoading] = useState(false)

	const isLoggedIn = userUtil.isLogin()
	const displayUser = isLoggedIn && user ? user : userState.info // 默认使用 userState.info，如果已登录且有用户信息则使用 user
	const userExtra = parseUserExtra(displayUser?.extra)
	const canEdit = !readonly && isLoggedIn // 只读模式下不允许编辑

	const handleAvatarUpload = async (file: File) => {
		setAvatarLoading(true)
		const result = await userUtil.uploadAvatar(file)
		if (result) {
			notify.success('头像上传成功')
		}
		setAvatarLoading(false)
	}

	const handleUsernameSubmit = async (newValue: string, _originalValue: string) => {
		if (newValue.length > 10) {
			notify.error('用户名不能超过10个字符')
			return
		}

		const result = await userApi.updateProfile({ username: newValue })
		if (result) {
			notify.success('用户名修改成功')
		}
	}

	const handleBioSubmit = async (newValue: string, _originalValue: string) => {
		const result = await userUtil.updateBio(newValue)
		// 不通知用户，静默更新
		if (result) {
			// notify.success('个人简介更新成功')
		}
	}

	// Status 选择功能
	const handleStatusSelect = async (emoji: string) => {
		const result = await userUtil.updateStatus(emoji)
		// 不通知用户，静默更新
		if (result) {
			// notify.success('状态更新成功')
		}
	}

	const handleStatusClear = async () => {
		const result = await userUtil.updateStatus('')
		// 不通知用户，静默更新
		if (result) {
			// notify.success('状态已清除')
		}
	}

	return (
		<Card data-slot="user-card" className={className}>
			<CardHeader className="pb-4">
				{/* 头部区域：头像 + 基本信息 */}
				<div className="flex items-start space-x-4">
					{/* 头像区域 */}
					<div className="flex flex-col items-center">
						<MyAvatar size={64} userData={readonly ? userData : undefined} />
						{canEdit && (
							<FileUpload onUpload={handleAvatarUpload}>
								<Button variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs" disabled={avatarLoading}>
									<Upload className="h-3 w-3 mr-1" />
									{avatarLoading ? '上传中' : '更换'}
								</Button>
							</FileUpload>
						)}
					</div>

					{/* 用户信息区域 */}
					<div className="flex-1 min-w-0">
						{/* 用户名编辑 */}
						<div className="mb-1">
							{canEdit ? (
								<QuickEdit value={displayUser.username} maxLength={10} allowEmpty={false} onSubmitChange={handleUsernameSubmit} textClassName="text-lg font-semibold" containerClassName="w-fit" />
							) : (
								<CardTitle className="text-lg truncate">{displayUser.username}</CardTitle>
							)}
						</div>

						{/* 邮箱和状态表情 */}
						<CardDescription className="flex items-center gap-2 mb-2">
							<span className="truncate">{displayUser.email}</span>
							{canEdit && (
								<>
									{userExtra.status ? (
										<AppEmojiPicker
											onEmojiSelect={handleStatusSelect}
											onClear={handleStatusClear}
											trigger={
												<Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
													<span className="text-xl">{userExtra.status}</span>
												</Button>
											}
										/>
									) : (
										<AppEmojiPicker
											onEmojiSelect={handleStatusSelect}
											trigger={
												<Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground flex-shrink-0">
													<Smile className="h-4 w-4" />
												</Button>
											}
										/>
									)}
								</>
							)}
							{/* 只读模式下显示状态但不可编辑 */}
							{readonly && userExtra.status && <span className="text-xl flex-shrink-0">{userExtra.status}</span>}
						</CardDescription>

						{/* 签名区域 */}
						{(canEdit || (readonly && userExtra.bio)) && (
							<div className="flex items-center gap-2">
								<div className="text-sm text-muted-foreground font-medium flex-shrink-0">签名</div>
								{canEdit ? (
									<QuickEdit
										value={userExtra.bio || ''}
										placeholder="此人很懒得签名..."
										maxLength={50}
										showCharCount={true}
										onSubmitChange={handleBioSubmit}
										textClassName="text-sm text-muted-foreground"
										containerClassName="w-fit"
									/>
								) : (
									<span className="text-sm text-muted-foreground">{userExtra.bio || '此人很懒得签名...'}</span>
								)}
							</div>
						)}

						{!canEdit && !readonly && <p className="text-sm text-muted-foreground">请登录以查看详细信息</p>}
					</div>

					{/* 登录按钮 */}
					{!isLoggedIn && !readonly && (
						<Button onClick={() => goLogin()} size="sm" className="flex-shrink-0">
							<LogIn className="h-4 w-4 mr-2" />
							登录
						</Button>
					)}
				</div>
			</CardHeader>
		</Card>
	)
}

export interface UserCardProps {
	readonly?: boolean // 只读模式，用于展示其他用户信息
	userData?: {
		username: string
		email: string
		avatar: string
		extra?: string
	} // 外部传入的用户数据
	className?: string
}
