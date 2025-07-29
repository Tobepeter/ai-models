import { z } from 'zod'
import type { UserCreateRequest } from '@/api/swagger/generated'
import { zodUtil } from '@/utils/zod-util'

/* 注册表单验证Schema - 字段名与后端UserCreateRequest保持一致 */
export const registerSchema = z
	.object({
		username: zodUtil.username(),
		email: z.email(), // 使用 zod v4 新的顶层 API
		password: zodUtil.password(),
		confirmPassword: z.string().min(1), // 前端专用验证字段，使用自动中文提示
	} satisfies Record<keyof UserCreateRequest, z.ZodType> & { confirmPassword: z.ZodType })
	.refine((data) => data.password === data.confirmPassword, {
		message: '两次输入的密码不一致',
		path: ['confirmPassword'],
	})

export type RegisterFormData = z.infer<typeof registerSchema>
