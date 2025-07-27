import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMount } from 'ahooks'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormItem, FormLabel, FormInput, FormPwd } from '@/components/common/form'
import { Cover } from '@/components/common/cover'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { useUserStore } from '@/store/user-store'
import { authApi } from '@/api/auth/auth-api'
import { notify } from '@/components/common/notify'
import type { UserCreateRequest } from '@/api/types/generated'

type FormErrors = Record<string, string | undefined>
type RegisterForm = UserCreateRequest & { confirmPassword: string }

export const Register = () => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { token } = useUserStore()

	const [form, setForm] = useState<RegisterForm>({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	})
	const [errors, setErrors] = useState<FormErrors>({})
	const [isLoading, setIsLoading] = useState(false)

	// 获取重定向地址
	const redirectTo = searchParams.get('redirect') || '/'

	// 已登录用户重定向
	useMount(() => {
		if (token) navigate(redirectTo, { replace: true })
	})

	const validate = (): boolean => {
		const newErrors: FormErrors = {}

		// 用户名验证
		if (!form.username.trim()) {
			newErrors.username = '请输入用户名'
		} else if (form.username.length < 3) {
			newErrors.username = '用户名至少3个字符'
		} else if (form.username.length > 50) {
			newErrors.username = '用户名不能超过50个字符'
		}

		// 邮箱验证
		if (!form.email.trim()) {
			newErrors.email = '请输入邮箱'
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
			newErrors.email = '请输入有效的邮箱地址'
		}

		// 密码验证
		if (!form.password) {
			newErrors.password = '请输入密码'
		} else if (form.password.length < 6) {
			newErrors.password = '密码至少6个字符'
		}

		// 确认密码验证
		if (!form.confirmPassword) {
			newErrors.confirmPassword = '请确认密码'
		} else if (form.password !== form.confirmPassword) {
			newErrors.confirmPassword = '两次输入的密码不一致'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validate()) return
		setIsLoading(true)

		try {
			const { confirmPassword, ...registerData } = form
			const result = await authApi.register(registerData)

			// 注册成功
			if (result) {
				// 显示成功提示
				notify.success('注册成功！', {
					description: '欢迎加入AI智能体验',
					duration: 3000,
				})

				// 静默刷新用户信息（不等待结果）
				// authApi.refreshUserInfo()

				// 直接跳转
				navigate(redirectTo, { replace: true })
			}
		} catch (error) {
			// API拦截器已经处理了错误显示，这里不需要额外处理
			console.error('Register failed:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleChange = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((prev) => ({ ...prev, [field]: e.target.value }))
		// 清除对应字段的错误
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }))
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
			<Cover />

			<Card className="w-full max-w-md shadow-lg border-0 bg-card/95 backdrop-blur relative">
				{/* 主题切换按钮 */}
				<div className="absolute top-4 right-4 z-10">
					<ThemeToggle />
				</div>
				<CardHeader className="text-center space-y-3 pb-6">
					<CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">注册账户</CardTitle>
					<CardDescription className="text-base text-muted-foreground">创建您的账户，开始AI智能体验</CardDescription>
				</CardHeader>
				<CardContent className="px-6 pb-6">
					<form onSubmit={handleSubmit} className="flex flex-col gap-5">
						{/* 用户名 */}
						<FormItem>
							<FormLabel htmlFor="username" required>
								用户名
							</FormLabel>
							<FormInput
								id="username"
								placeholder="请输入用户名（3-50个字符）"
								value={form.username}
								onChange={handleChange('username')}
								disabled={isLoading}
								error={errors.username}
								autoComplete="username"
							/>
						</FormItem>

						{/* 邮箱 */}
						<FormItem>
							<FormLabel htmlFor="email" required tips="随便填写就行，不会真的进行邮箱验证码验证">
								邮箱地址
							</FormLabel>
							<FormInput id="email" type="email" placeholder="请输入邮箱地址" value={form.email} onChange={handleChange('email')} disabled={isLoading} error={errors.email} autoComplete="email" />
						</FormItem>

						{/* 密码 */}
						<FormItem>
							<FormLabel htmlFor="password" required>
								设置密码
							</FormLabel>
							<FormPwd
								id="password"
								placeholder="请输入密码（至少6个字符）"
								value={form.password}
								onChange={handleChange('password')}
								disabled={isLoading}
								error={errors.password}
								autoComplete="new-password"
							/>
						</FormItem>

						{/* 确认密码 */}
						<FormItem>
							<FormLabel htmlFor="confirmPassword" required>
								确认密码
							</FormLabel>
							<FormPwd
								id="confirmPassword"
								placeholder="请再次输入密码"
								value={form.confirmPassword}
								onChange={handleChange('confirmPassword')}
								disabled={isLoading}
								error={errors.confirmPassword}
								autoComplete="new-password"
							/>
						</FormItem>

						{/* 注册按钮 */}
						<Button
							type="submit"
							className="w-full h-11 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200"
							disabled={isLoading}
						>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isLoading ? '创建账户中...' : '创建账户'}
						</Button>

						{/* 登录链接 */}
						<div className="text-center pt-2">
							<span className="text-sm text-muted-foreground">已有账户？</span>
							<Link to={redirectTo === '/' ? '/login' : `/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-sm text-primary hover:text-primary/80 font-medium ml-1 transition-colors">
								立即登录
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
