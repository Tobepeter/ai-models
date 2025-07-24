import { FormInput, FormItem, FormLabel, FormPwd } from '@/components/common/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Cover } from '@/components/common/cover'
import { useUserStore } from '@/store/user-store'
import { useLogin } from '@/api/auth'
import { FormErrors, LoginRequest } from '@/api/types/auth-types'
import { useMount } from 'ahooks'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export const Login = () => {
	const navigate = useNavigate()
	const { isAuthenticated, setAuth, setAuthError, authError } = useUserStore()
	const loginMutation = useLogin()

	const [form, setForm] = useState<LoginRequest>({
		username: '',
		password: '',
	})
	const [errors, setErrors] = useState<FormErrors>({})

	// 如果已登录，重定向到首页
	useMount(() => {
		if (isAuthenticated) {
			navigate('/', { replace: true })
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
		setAuthError(null)

		if (!validate()) return

		try {
			const result = await loginMutation.mutateAsync(form)
			setAuth(result.user, result.token)
			navigate('/', { replace: true })
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : '登录失败'
			setAuthError(errorMsg)
		}
	}

	const handleChange = (field: keyof LoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((prev) => ({ ...prev, [field]: e.target.value }))
		// 清除对应字段的错误
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }))
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Cover />

			<Card className="w-full max-w-md shadow-lg border-0 bg-card/95 backdrop-blur">
				<CardHeader className="text-center space-y-3 pb-6">
					<CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">欢迎回来</CardTitle>
					<CardDescription className="text-base text-muted-foreground">登录您的账户，继续AI智能体验</CardDescription>
				</CardHeader>
				<CardContent className="px-6 pb-6">
					<form onSubmit={handleSubmit} className="flex flex-col gap-5">
						{/* 全局错误提示 */}
						{authError && (
							<Alert variant="destructive">
								<AlertDescription>{authError}</AlertDescription>
							</Alert>
						)}

						{/* 用户名 */}
						<FormItem>
							<FormLabel htmlFor="username" required>
								用户名
							</FormLabel>
							<FormInput id="username" placeholder="请输入用户名" value={form.username} onChange={handleChange('username')} disabled={loginMutation.isPending} error={errors.username} autoComplete="username" />
						</FormItem>

						{/* 密码 */}
						<FormItem>
							<FormLabel htmlFor="password" required>
								密码
							</FormLabel>
							<FormPwd id="password" placeholder="请输入密码" value={form.password} onChange={handleChange('password')} disabled={loginMutation.isPending} error={errors.password} autoComplete="current-password" />
						</FormItem>

						{/* 登录按钮 */}
						<Button
							type="submit"
							className="w-full h-11 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200"
							disabled={loginMutation.isPending}
						>
							{loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{loginMutation.isPending ? '登录中...' : '立即登录'}
						</Button>

						{/* 注册链接 */}
						<div className="text-center pt-2">
							<span className="text-sm text-muted-foreground">还没有账户？</span>
							<Link to="/register" className="text-sm text-primary hover:text-primary/80 font-medium ml-1 transition-colors">
								立即注册
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
