import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMount } from 'ahooks'
import { Loader2, CheckCircle2, AlertCircle, Dices } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Cover } from '@/components/common/cover'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { useUserStore } from '@/store/user-store'
import { authApi } from '@/api/auth/auth-api'
import { notify } from '@/components/common/notify'
import { registerSchema, type RegisterFormData } from './schema/register-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useFieldCheck } from './hooks/use-field-check'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { zodUtil } from '@/utils/zod-util'

export const Register = () => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { token } = useUserStore()
	const { checkField, checkSubmitConflict } = useFieldCheck()

	// 字段检查状态
	const [fieldStates, setFieldStates] = useState<{
		username: { checking: boolean; exists?: boolean }
		email: { checking: boolean; exists?: boolean }
	}>({
		username: { checking: false },
		email: { checking: false },
	})

	// 获取重定向地址
	const redirectTo = searchParams.get('redirect') || '/'

	// 已登录用户重定向
	useMount(() => {
		if (token) navigate(redirectTo, { replace: true })
	})

	// 使用react-hook-form + zod
	const form = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
		mode: 'onBlur', // 失焦时验证
	})

	// 字段检查函数
	const handleFieldCheck = async (field: 'username' | 'email', value: string) => {
		if (!value.trim()) {
			setFieldStates((prev) => ({
				...prev,
				[field]: { checking: false },
			}))
			return
		}

		// 设置检查状态
		setFieldStates((prev) => ({
			...prev,
			[field]: { checking: true },
		}))

		const exists = await checkField(field, value)

		setFieldStates((prev) => ({
			...prev,
			[field]: { checking: false, exists: exists ?? undefined },
		}))
	}

	// 随机填充表单数据
	const handleRandomFill = () => {
		form.setValue('username', zodUtil.genUserName())
		form.setValue('email', zodUtil.genEmail())
		const password = zodUtil.genPassword()
		form.setValue('password', password)
		form.setValue('confirmPassword', password)
	}

	const handleSubmit = async (data: RegisterFormData) => {
		// 检查是否有字段检查正在进行
		if (checkSubmitConflict()) {
			return
		}

		try {
			const { confirmPassword, ...registerData } = data
			// @ts-ignore 可选和非可选冲突了，有空想想如何修复
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
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4 relative" data-slot="register">
			<Cover />

			<Card className="w-full max-w-md shadow-lg border-0 bg-card/95 backdrop-blur relative">
				{/* 随机按钮 */}
				<div className="absolute top-4 left-4 z-10">
					<Button variant="ghost" size="sm" className="text-primary/70 hover:text-primary hover:bg-primary/10" onClick={handleRandomFill}>
						<Dices className="h-4 w-4 mr-1" />
						随机
					</Button>
				</div>
				{/* 主题切换按钮 */}
				<div className="absolute top-4 right-4 z-10">
					<ThemeToggle />
				</div>
				<CardHeader className="text-center space-y-3 pb-6">
					<CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">注册账户</CardTitle>
				</CardHeader>
				<CardContent className="px-6 pb-6">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
							{/* 用户名 */}
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center gap-2">
											<FormLabel>用户名</FormLabel>
											{fieldStates.username.checking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
										</div>
										<FormControl>
											<div className="relative">
												<Input
													placeholder="请输入用户名（3-20个字符）"
													autoComplete="username"
													disabled={form.formState.isSubmitting}
													{...field}
													onBlur={(e) => {
														field.onBlur()
														handleFieldCheck('username', e.target.value)
													}}
												/>
											</div>
										</FormControl>
										<FormMessage>{fieldStates.username.exists === true && '用户名已被使用'}</FormMessage>
									</FormItem>
								)}
							/>

							{/* 邮箱 */}
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center gap-2">
											<FormLabel>邮箱地址</FormLabel>
											{fieldStates.email.checking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
										</div>
										<FormControl>
											<div className="relative">
												<Input
													type="email"
													placeholder="请输入邮箱地址"
													autoComplete="email"
													disabled={form.formState.isSubmitting}
													{...field}
													onBlur={(e) => {
														field.onBlur()
														handleFieldCheck('email', e.target.value)
													}}
												/>
											</div>
										</FormControl>
										<FormMessage>{fieldStates.email.exists === true && '邮箱已被使用'}</FormMessage>
									</FormItem>
								)}
							/>

							{/* 密码 */}
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>设置密码</FormLabel>
										<FormControl>
											<PasswordInput placeholder="请输入密码（至少6个字符）" autoComplete="new-password" disabled={form.formState.isSubmitting} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* 确认密码 */}
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>确认密码</FormLabel>
										<FormControl>
											<PasswordInput placeholder="请再次输入密码" autoComplete="new-password" disabled={form.formState.isSubmitting} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* 注册按钮 */}
							<Button
								type="submit"
								className="w-full h-11 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200"
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{form.formState.isSubmitting ? '创建账户中...' : '创建账户'}
							</Button>

							{/* 登录链接 */}
							<div className="text-center pt-2">
								<span className="text-sm text-muted-foreground">已有账户？</span>
								<Link
									to={redirectTo === '/' ? '/login' : `/login?redirect=${encodeURIComponent(redirectTo)}`}
									className="text-sm text-primary hover:text-primary/80 font-medium ml-1 transition-colors"
								>
									立即登录
								</Link>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
