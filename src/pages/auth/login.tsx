import { Cover } from '@/components/common/cover'
import { FormInput, FormItem, FormLabel, FormPwd } from '@/components/common/form'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/store/user-store'
import { authApi } from '@/api/auth/auth-api'
import type { UserLoginRequest } from '@/api/types/generated'
import { useMount } from 'ahooks'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

type FormErrors = Record<string, string | undefined>

export const Login = () => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { token } = useUserStore()

	const [form, setForm] = useState<UserLoginRequest>({
		username: '',
		password: '',
	})
	const [errors, setErrors] = useState<FormErrors>({})
	const [isLoading, setIsLoading] = useState(false)

	// 获取重定向地址
	const redirectTo = searchParams.get('redirect') || '/'

	// 如果已登录，重定向到目标页面
	useMount(() => {
		if (token) {
			navigate(redirectTo, { replace: true })
		}
	})

	const validate = (): boolean => {
		const newErrors: FormErrors = {}

		if (!form.username.trim()) {
			newErrors.username = '请输入用户名'
		}

		if (!form.password) {
			newErrors.password = '请输入密码'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validate()) return

		setIsLoading(true)
		try {
			const result = await authApi.login(form)
			// 登录成功后跳转到重定向地址，使用replace清空回退历史
			if (result) {
				navigate(redirectTo, { replace: true })
			}
		} catch (err) {
			// API拦截器已经处理了错误显示，这里不需要额外处理
			console.error('Login failed:', err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleChange = (field: keyof UserLoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
					<CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">欢迎回来</CardTitle>
					<CardDescription className="text-base text-muted-foreground">登录您的账户，继续AI智能体验</CardDescription>
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
								placeholder="请输入用户名"
								value={form.username}
								onChange={handleChange('username')}
								disabled={isLoading}
								error={errors.username}
								autoComplete="username"
							/>
						</FormItem>

						{/* 密码 */}
						<FormItem>
							<FormLabel htmlFor="password" required>
								密码
							</FormLabel>
							<FormPwd
								id="password"
								placeholder="请输入密码"
								value={form.password}
								onChange={handleChange('password')}
								disabled={isLoading}
								error={errors.password}
								autoComplete="current-password"
							/>
						</FormItem>

						{/* 登录按钮 */}
						<Button
							type="submit"
							className="w-full h-11 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200"
							disabled={isLoading}
						>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isLoading ? '登录中...' : '立即登录'}
						</Button>

						{/* 注册链接 */}
						<div className="text-center pt-2">
							<span className="text-sm text-muted-foreground">还没有账户？</span>
							<Link
								to={redirectTo === '/' ? '/register' : `/register?redirect=${encodeURIComponent(redirectTo)}`}
								className="text-sm text-primary hover:text-primary/80 font-medium ml-1 transition-colors"
							>
								立即注册
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
