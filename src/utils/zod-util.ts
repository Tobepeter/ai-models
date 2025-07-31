import { z } from 'zod'
import { faker } from '@faker-js/faker'

// 自定义错误配置映射
const customErrorMap: z.ZodErrorMap = (issue) => {
	switch (issue.code) {
		case z.ZodIssueCode.too_small:
			if (issue.type === 'string') return { message: `至少需要${issue.minimum}个字符` }
			if (issue.type === 'number') return { message: `数值不能小于${issue.minimum}` }
			if (issue.type === 'array') return { message: `至少需要 ${issue.minimum} 个元素` }
			return { message: `长度不足，至少需要 ${issue.minimum}` }

		case z.ZodIssueCode.too_big:
			if (issue.type === 'string') return { message: `最多允许 ${issue.maximum} 个字符` }
			if (issue.type === 'number') return { message: `数值不能大于 ${issue.maximum}` }
			if (issue.type === 'array') return { message: `最多允许 ${issue.maximum} 个元素` }
			return { message: `长度超限，最多允许 ${issue.maximum}` }

		case z.ZodIssueCode.invalid_string:
			if (issue.validation === 'email') return { message: '请输入有效的邮箱地址' }
			if (issue.validation === 'url') return { message: '请输入有效的网址' }
			if (issue.validation === 'regex') return { message: '格式不正确' }
			return { message: '格式不正确' }

		case z.ZodIssueCode.invalid_type:
			return { message: `需要输入${getTypeInChinese(issue.expected)}` }

		case z.ZodIssueCode.unrecognized_keys:
			return { message: `不识别的字段: ${issue.keys.join(', ')}` }
		case z.ZodIssueCode.custom:
			return { message: '输入无效' }
		default:
			return { message: '输入无效' }
	}
}

// 类型转换为中文
function getTypeInChinese(type: string) {
	const typeMap: Record<string, string> = {
		string: '文本',
		number: '数字',
		boolean: '布尔值',
		date: '日期',
		bigint: '大整数',
		symbol: '符号',
		undefined: '未定义值',
		null: '空值',
		array: '数组',
		object: '对象',
		unknown: '未知类型',
		promise: '异步对象',
		void: '空值',
		never: '无效值',
		map: '映射',
		set: '集合',
	}
	return typeMap[type] || '有效值'
}

// Zod 验证规则工具类，提供中文错误消息
class ZodUtil {
	init() {
		z.setErrorMap(customErrorMap)
	}

	// 创建用户名验证规则
	username() {
		return z
			.string()
			.min(3)
			.max(20)
			.regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
	}

	// 密码验证规则
	password() {
		return z.string().min(6)
		// .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字')
	}

	// 手机号验证规则
	phone() {
		return z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号')
	}

	genUserName() {
		// 生成5-8字符的用户名，叠加随机字符
		const targetLength = faker.number.int({ min: 5, max: 8 })
		let username = ''
		while (username.length < targetLength) {
			username += faker.string.alphanumeric(1)
		}
		return username
	}

	genPassword() {
		// 生成符合 zod 规则的密码：至少6位，包含大小写字母和数字
		return faker.internet.password({ length: 8, memorable: true, pattern: /[a-zA-Z0-9]/ })
	}

	genPhone() {
		// 生成符合中国手机号格式的号码：1开头，第二位3-9，共11位
		const secondDigit = faker.number.int({ min: 3, max: 9 })
		const remaining = faker.string.numeric(9)
		return `1${secondDigit}${remaining}`
	}

	genEmail() {
		// 生成标准邮箱格式
		return faker.internet.email()
	}
}
export const zodUtil = new ZodUtil()
