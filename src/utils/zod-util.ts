import { z } from 'zod'

// Zod 验证规则工具类，提供中文错误消息
class ZodUtil {
	private initialized = false

	// 初始化 zod v4 内置国际化
	async init() {
		if (this.initialized) return

		try {
			// 尝试使用 zod v4 内置中文支持 (路径可能不对，先测试)
			// const { default: zhLocale } = await import('zod/locales/zh')
			// z.config({ localeError: zhLocale })
			console.log('暂时跳过内置国际化，使用自定义错误消息')
		} catch {
			console.log('使用自定义中文错误消息')
		}
	}

	// 创建用户名验证规则（使用内置国际化或回退到自定义消息）
	username() {
		if (this.initialized) {
			// 使用内置国际化
			return z
				.string()
				.min(3)
				.max(20)
				.regex(/^[a-zA-Z0-9_]+$/)
		}
		// 回退到自定义中文错误消息 (zod v4 API)
		return z
			.string({ message: '用户名不能为空' })
			.min(3, '用户名至少需要3个字符')
			.max(20, '用户名不能超过20个字符')
			.regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
	}

	// 创建密码验证规则（使用内置国际化或回退到自定义消息）
	password() {
		if (this.initialized) {
			// 使用内置国际化
			return z
				.string()
				.min(6)
				.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		}
		// 回退到自定义中文错误消息 (zod v4 API)
		return z
			.string({ message: '密码不能为空' })
			.min(6, '密码至少需要6个字符')
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字')
	}
}

export const zodUtil = new ZodUtil()
