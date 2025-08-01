import { ossClient } from '@/utils/oss/oss-client'
import { userApi } from '@/api/user/user-api'
import { useUserStore } from '@/store/user-store'
import { OssAccessType } from '@/utils/oss/oss-types'
import { ossPubClient } from '@/utils/oss/oss-pub-client'

/* 用户扩展字段类型定义 */
export interface UserExtra {
	bio?: string // 个人简介
	status?: string // 状态表情，限制1个emoji
}

/* 解析用户扩展字段 */
export const parseUserExtra = (extra?: string): UserExtra => {
	if (!extra) return {}
	try {
		return JSON.parse(extra) as UserExtra
	} catch {
		return {}
	}
}

/* 序列化用户扩展字段 */
export const stringifyUserExtra = (extra: UserExtra) => {
	return JSON.stringify(extra)
}

class UserUtil {
	// 上传用户头像
	async uploadAvatar(file: File) {
		const { info: user } = useUserStore.getState()

		// 上传新头像到 OSS
		const result = await ossClient.uploadFile(file)
		if (!result) throw new Error('Upload failed')

		// sts 的url是签名的，需要转为公共读url
		let url = result.url
		if (ossClient.write === OssAccessType.Sts) {
			url = ossPubClient.getPublicUrl(result.objectKey)
		}

		// 更新后端用户资料
		const res = await userApi.updateProfile({
			avatar: url,
			avatar_oss_key: result.objectKey,
		})

		// 后端通用处理错误会返回null
		// 注意：旧头像文件的清理现在由后端自动处理

		return result
	}

	// 更新用户个人简介
	async updateBio(bio: string) {
		const { info: user } = useUserStore.getState()
		const currentExtra = parseUserExtra(user?.extra)

		// 限制为20个词
		const trimmedBio = bio.trim()
		const words = trimmedBio.split(/\s+/).filter((w) => w.length > 0)
		const validBio = words.length <= 20 ? trimmedBio : words.slice(0, 20).join(' ')

		const newExtra: UserExtra = {
			...currentExtra,
			bio: validBio || undefined,
		}

		return await userApi.updateProfile({
			extra: stringifyUserExtra(newExtra),
		})
	}

	// 更新用户状态表情
	async updateStatus(status: string) {
		const { info: user } = useUserStore.getState()
		const currentExtra = parseUserExtra(user?.extra)

		// 限制为1个emoji
		const trimmedStatus = status.trim()
		const validStatus = trimmedStatus.length <= 2 ? trimmedStatus : trimmedStatus.slice(0, 2)

		const newExtra: UserExtra = {
			...currentExtra,
			status: validStatus || undefined,
		}

		return await userApi.updateProfile({
			extra: stringifyUserExtra(newExtra),
		})
	}

	isLogin() {
		return !!useUserStore.getState().token
	}
}

export const userUtil = new UserUtil()
