import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMount } from 'ahooks'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormItem, FormLabel, FormInput, FormPwd } from '@/components/common/form'
import { useUserStore } from '@/store/user-store'
import { useRegister } from '@/api/auth'
import { FormErrors, RegisterRequest } from '@/api/types/auth-types'

export const Register = () => {
	const navigate = useNavigate()
	const { isAuthenticated, setAuth, setAuthError, authError } = useUserStore()
	const registerMutation = useRegister()

	const [form, setForm] = useState<RegisterRequest>({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	})
	const [errors, setErrors] = useState<FormErrors>({})

	// 已登录用户重定向
	useMount(() => {
		if (isAuthenticated) navigate('/', { replace: true })
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
		setAuthError(null)

		if (!validate()) return

		try {
			const result = await registerMutation.mutateAsync(form)
			setAuth(result.user, result.token)
			navigate('/', { replace: true })
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : '注册失败'
			setAuthError(errorMsg)
		}
	}

	const handleChange = (field: keyof RegisterRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((prev) => ({ ...prev, [field]: e.target.value }))
		// 清除对应字段的错误
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }))
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4 relative">
			<Card className="w-full max-w-md shadow-lg border-0 bg-card/95 backdrop-blur relative z-10">
				<CardHeader className="text-center space-y-3 pb-6">
					<CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">注册账户</CardTitle>
					<CardDescription className="text-base text-muted-foreground">创建您的账户，开始AI智能体验</CardDescription>
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
							<FormInput
								id="username"
								placeholder="请输入用户名（3-50个字符）"
								value={form.username}
								onChange={handleChange('username')}
								disabled={registerMutation.isPending}
								error={errors.username}
								autoComplete="username"
							/>
						</FormItem>

						{/* 邮箱 */}
						<FormItem>
							<FormLabel htmlFor="email" required>
								邮箱地址
							</FormLabel>
							<FormInput id="email" type="email" placeholder="请输入邮箱地址" value={form.email} onChange={handleChange('email')} disabled={registerMutation.isPending} error={errors.email} autoComplete="email" />
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
								disabled={registerMutation.isPending}
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
								disabled={registerMutation.isPending}
								error={errors.confirmPassword}
								autoComplete="new-password"
							/>
						</FormItem>

						{/* 注册按钮 */}
						<Button
							type="submit"
							className="w-full h-11 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200"
							disabled={registerMutation.isPending}
						>
							{registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{registerMutation.isPending ? '创建账户中...' : '创建账户'}
						</Button>

						{/* 登录链接 */}
						<div className="text-center pt-2">
							<span className="text-sm text-muted-foreground">已有账户？</span>
							<Link to="/login" className="text-sm text-primary hover:text-primary/80 font-medium ml-1 transition-colors">
								立即登录
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
