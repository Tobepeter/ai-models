import { Cover } from '@/components/common/cover'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useUserStore } from '@/store/user-store'
import { authApi } from '@/api/auth/auth-api'
import { loginSchema, type LoginFormData } from './schema/login-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMount } from 'ahooks'
import { Loader2 } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

export const Login = () => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { token } = useUserStore()

	// 获取重定向地址
	const redirectTo = searchParams.get('redirect') || '/'

	// 如果已登录，重定向到目标页面
	useMount(() => {
		if (token) {
			navigate(redirectTo, { replace: true })
		}
	})

	// 使用react-hook-form + zod
	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: '',
			password: '',
		},
		mode: 'onBlur', // 失焦时验证
	})

	const handleSubmit = async (data: LoginFormData) => {
		try {
			const result = await authApi.login(data)
			// 登录成功后跳转到重定向地址，使用replace清空回退历史
			if (result) {
				navigate(redirectTo, { replace: true })
			}
		} catch (err) {
			// API拦截器已经处理了错误显示，这里不需要额外处理
			console.error('Login failed:', err)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4 relative" data-slot="login">
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
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
							{/* 用户名 */}
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>用户名</FormLabel>
										<FormControl>
											<Input placeholder="请输入用户名" autoComplete="username" disabled={form.formState.isSubmitting} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* 密码 */}
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>密码</FormLabel>
										<FormControl>
											<PasswordInput placeholder="请输入密码" autoComplete="current-password" disabled={form.formState.isSubmitting} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* 登录按钮 */}
							<Button
								type="submit"
								className="w-full h-11 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200"
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{form.formState.isSubmitting ? '登录中...' : '立即登录'}
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
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
