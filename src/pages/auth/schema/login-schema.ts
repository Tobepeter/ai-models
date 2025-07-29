import { z } from 'zod'
import type { UserLoginRequest } from '@/api/swagger/generated'
import { zodUtil } from '@/utils/zod-util'

/* 登录表单验证Schema - 字段名与后端UserLoginRequest保持一致 */
export const loginSchema = z.object({
	username: z.string().min(1), // 使用自动中文提示
	password: z.string().min(1), // 使用自动中文提示
} satisfies Record<keyof UserLoginRequest, z.ZodType>)

export type LoginFormData = z.infer<typeof loginSchema>
