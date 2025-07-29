import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

// 基础表单 Schema
const basicFormSchema = z.object({
	username: z
		.string()
		.min(3, '用户名至少需要3个字符')
		.max(20, '用户名不能超过20个字符')
		.regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
	email: z.string().email('请输入有效的邮箱地址'),
	password: z
		.string()
		.min(6, '密码至少需要6个字符')
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
	age: z.number().min(1, '年龄必须大于0').max(120, '年龄不能超过120'),
	bio: z.string().max(500, '个人简介不能超过500个字符').optional(),
	country: z.string().min(1, '请选择国家/地区'),
	gender: z.enum(['male', 'female', 'other']),
	hobbies: z.array(z.string()).min(1, '请至少选择一个爱好'),
	terms: z.boolean().refine((val) => val, '请同意服务条款'),
})

// 高级表单 Schema
const advancedFormSchema = z.object({
	firstName: z
		.string()
		.min(1, '姓是必填的')
		.regex(/^[\u4e00-\u9fa5a-zA-Z]+$/, '姓只能包含中文或英文字母'),
	lastName: z
		.string()
		.min(1, '名是必填的')
		.regex(/^[\u4e00-\u9fa5a-zA-Z]+$/, '名只能包含中文或英文字母'),
	phone: z
		.string()
		.regex(/^1[3-9]\d{9}$/, '请输入有效的手机号')
		.optional()
		.or(z.literal('')),
	website: z
		.string()
		.regex(/^https?:\/\/.+/, '请输入有效的网站地址（需以 http:// 或 https:// 开头）')
		.optional()
		.or(z.literal('')),
	skills: z.array(z.string()).min(1, '请至少选择一项技能'),
	experience: z.string().min(1, '请选择工作经验'),
	salary: z.number().min(0, '薪资不能为负数').max(1000, '薪资不能超过1000K'),
	newsletter: z.boolean(),
})

type BasicFormData = z.infer<typeof basicFormSchema>
type AdvancedFormData = z.infer<typeof advancedFormSchema>

/**
 * shadcn/ui Form 组件展示
 */
const TestShadcnForm = () => {
	const [submittedData, setSubmittedData] = useState<any>(null)

	// 基础表单
	const basicForm = useForm<BasicFormData>({
		resolver: zodResolver(basicFormSchema),
		defaultValues: {
			username: '',
			email: '',
			password: '',
			age: 18,
			bio: '',
			country: '',
			gender: 'male',
			hobbies: [],
			terms: false,
		},
		mode: 'onChange',
	})

	// 高级表单
	const advancedForm = useForm<AdvancedFormData>({
		resolver: zodResolver(advancedFormSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			phone: '',
			website: '',
			skills: [],
			experience: '',
			salary: 0,
			newsletter: true,
		},
		mode: 'onBlur', // 保持 onBlur 模式
	})

	const onBasicSubmit = (data: BasicFormData) => {
		console.log('基础表单提交:', data)
		setSubmittedData({ type: 'basic', data })
	}

	const onAdvancedSubmit = (data: AdvancedFormData) => {
		console.log('高级表单提交:', data)
		setSubmittedData({ type: 'advanced', data })
	}

	return (
		<div className="w-full max-w-6xl mx-auto p-4 space-y-6">
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold">shadcn/ui Form 组件展示</h1>
				<p className="text-muted-foreground">使用 shadcn/ui Form 组件 + react-hook-form + zod 进行表单验证</p>
			</div>

			<Tabs defaultValue="basic" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="basic">基础表单</TabsTrigger>
					<TabsTrigger value="advanced">高级表单</TabsTrigger>
					<TabsTrigger value="result">提交结果</TabsTrigger>
				</TabsList>

				<TabsContent value="basic" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>基础表单示例</CardTitle>
							<CardDescription>使用 shadcn/ui Form 组件展示标准表单布局和间距</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...basicForm}>
								<form onSubmit={basicForm.handleSubmit(onBasicSubmit)} className="space-y-6">
									{/* 用户名 */}
									<FormField
										control={basicForm.control}
										name="username"
										render={({ field }) => (
											<FormItem>
												<FormLabel>用户名</FormLabel>
												<FormControl>
													<Input placeholder="请输入用户名" {...field} />
												</FormControl>
												<FormDescription>用户名只能包含字母、数字和下划线，长度 3-20 字符</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 邮箱 */}
									<FormField
										control={basicForm.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>邮箱地址</FormLabel>
												<FormControl>
													<Input type="email" placeholder="请输入邮箱地址" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 密码 */}
									<FormField
										control={basicForm.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>密码</FormLabel>
												<FormControl>
													<Input type="password" placeholder="请输入密码" {...field} />
												</FormControl>
												<FormDescription>密码至少6位，必须包含大小写字母和数字</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 年龄 */}
									<FormField
										control={basicForm.control}
										name="age"
										render={({ field }) => (
											<FormItem>
												<FormLabel>年龄</FormLabel>
												<FormControl>
													<Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 国家 */}
									<FormField
										control={basicForm.control}
										name="country"
										render={({ field }) => (
											<FormItem>
												<FormLabel>国家/地区</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="请选择国家/地区" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="china">中国</SelectItem>
														<SelectItem value="usa">美国</SelectItem>
														<SelectItem value="japan">日本</SelectItem>
														<SelectItem value="korea">韩国</SelectItem>
														<SelectItem value="other">其他</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 性别 */}
									<FormField
										control={basicForm.control}
										name="gender"
										render={({ field }) => (
											<FormItem className="space-y-3">
												<FormLabel>性别</FormLabel>
												<FormControl>
													<RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
														<FormItem className="flex items-center space-x-3 space-y-0">
															<FormControl>
																<RadioGroupItem value="male" />
															</FormControl>
															<FormLabel className="font-normal">男</FormLabel>
														</FormItem>
														<FormItem className="flex items-center space-x-3 space-y-0">
															<FormControl>
																<RadioGroupItem value="female" />
															</FormControl>
															<FormLabel className="font-normal">女</FormLabel>
														</FormItem>
														<FormItem className="flex items-center space-x-3 space-y-0">
															<FormControl>
																<RadioGroupItem value="other" />
															</FormControl>
															<FormLabel className="font-normal">其他</FormLabel>
														</FormItem>
													</RadioGroup>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 爱好 */}
									<FormField
										control={basicForm.control}
										name="hobbies"
										render={() => (
											<FormItem>
												<div className="mb-4">
													<FormLabel className="text-base">爱好</FormLabel>
													<FormDescription>请选择你的爱好</FormDescription>
												</div>
												{['阅读', '音乐', '运动', '旅行', '编程', '摄影'].map((hobby) => (
													<FormField
														key={hobby}
														control={basicForm.control}
														name="hobbies"
														render={({ field }) => {
															return (
																<FormItem key={hobby} className="flex flex-row items-start space-x-3 space-y-0">
																	<FormControl>
																		<Checkbox
																			checked={field.value?.includes(hobby)}
																			onCheckedChange={(checked) => {
																				return checked ? field.onChange([...field.value, hobby]) : field.onChange(field.value?.filter((value) => value !== hobby))
																			}}
																		/>
																	</FormControl>
																	<FormLabel className="font-normal">{hobby}</FormLabel>
																</FormItem>
															)
														}}
													/>
												))}
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 个人简介 */}
									<FormField
										control={basicForm.control}
										name="bio"
										render={({ field }) => (
											<FormItem>
												<FormLabel>个人简介</FormLabel>
												<FormControl>
													<Textarea placeholder="请输入个人简介" className="resize-none" {...field} />
												</FormControl>
												<FormDescription>简要描述你的个人情况，最多500字符 ({field.value?.length || 0}/500)</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 服务条款 */}
									<FormField
										control={basicForm.control}
										name="terms"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>同意服务条款</FormLabel>
													<FormDescription>
														我已阅读并同意 <span className="text-primary underline cursor-pointer">服务条款</span>
													</FormDescription>
												</div>
											</FormItem>
										)}
									/>

									{/* 提交按钮 */}
									<div className="flex space-x-4">
										<Button type="submit" disabled={basicForm.formState.isSubmitting}>
											{basicForm.formState.isSubmitting ? '提交中...' : '提交基础表单'}
										</Button>
										<Button type="button" variant="outline" onClick={() => basicForm.reset()}>
											重置表单
										</Button>
									</div>

									{/* 表单状态显示 */}
									<div className="grid grid-cols-2 gap-4 pt-4 border-t">
										<div className="space-y-2">
											<h4 className="text-sm font-medium">表单状态</h4>
											<div className="flex gap-2 flex-wrap">
												<Badge variant={basicForm.formState.isDirty ? 'default' : 'secondary'}>{basicForm.formState.isDirty ? '已修改' : '未修改'}</Badge>
												<Badge variant={basicForm.formState.isValid ? 'default' : 'destructive'}>{basicForm.formState.isValid ? '验证通过' : '验证失败'}</Badge>
												<Badge variant={basicForm.formState.isSubmitting ? 'default' : 'secondary'}>{basicForm.formState.isSubmitting ? '提交中' : '未提交'}</Badge>
											</div>
										</div>
										<div className="space-y-2">
											<h4 className="text-sm font-medium">错误统计</h4>
											<p className="text-sm text-destructive">{Object.keys(basicForm.formState.errors).length} 个错误</p>
										</div>
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="advanced" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>高级表单示例</CardTitle>
							<CardDescription>展示复杂表单布局和高级验证功能 (onBlur 模式 + skills 字段 onChange 验证)</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...advancedForm}>
								<form onSubmit={advancedForm.handleSubmit(onAdvancedSubmit)} className="space-y-6">
									{/* 姓名 - 并排布局 */}
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={advancedForm.control}
											name="firstName"
											render={({ field }) => (
												<FormItem>
													<FormLabel>姓</FormLabel>
													<FormControl>
														<Input placeholder="请输入姓" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={advancedForm.control}
											name="lastName"
											render={({ field }) => (
												<FormItem>
													<FormLabel>名</FormLabel>
													<FormControl>
														<Input placeholder="请输入名" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									{/* 手机号 - 可选字段 */}
									<FormField
										control={advancedForm.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>手机号 (可选)</FormLabel>
												<FormControl>
													<Input placeholder="请输入手机号" {...field} />
												</FormControl>
												<FormDescription>请输入有效的中国大陆手机号</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 个人网站 */}
									<FormField
										control={advancedForm.control}
										name="website"
										render={({ field }) => (
											<FormItem>
												<FormLabel>个人网站 (可选)</FormLabel>
												<FormControl>
													<Input placeholder="https://example.com" {...field} />
												</FormControl>
												<FormDescription>请输入完整的网站地址</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 技能 */}
									<FormField
										control={advancedForm.control}
										name="skills"
										render={() => (
											<FormItem>
												<div className="mb-4">
													<FormLabel className="text-base">技能</FormLabel>
													<FormDescription>请至少选择一项技能 (单独使用 onChange 验证)</FormDescription>
												</div>
												<div className="grid grid-cols-3 gap-3">
													{['JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js', 'Python', 'Java', 'Go', 'Rust'].map((skill) => (
														<FormField
															key={skill}
															control={advancedForm.control}
															name="skills"
															render={({ field }) => (
																<FormItem key={skill} className="flex flex-row items-start space-x-3 space-y-0">
																	<FormControl>
																		<Checkbox
																			checked={field.value?.includes(skill)}
																			onCheckedChange={(checked) => {
																				const newSkills = checked ? [...field.value, skill] : field.value?.filter((value) => value !== skill)
																				field.onChange(newSkills)
																				// 手动触发 skills 字段的验证 (实现单字段 onChange 验证)
																				advancedForm.trigger('skills')
																			}}
																		/>
																	</FormControl>
																	<FormLabel className="text-sm font-normal">{skill}</FormLabel>
																</FormItem>
															)}
														/>
													))}
												</div>
												<FormField control={advancedForm.control} name="skills" render={() => <FormMessage />} />
											</FormItem>
										)}
									/>

									{/* 工作经验 */}
									<FormField
										control={advancedForm.control}
										name="experience"
										render={({ field }) => (
											<FormItem>
												<FormLabel>工作经验</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="请选择工作经验" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="0-1">0-1年</SelectItem>
														<SelectItem value="1-3">1-3年</SelectItem>
														<SelectItem value="3-5">3-5年</SelectItem>
														<SelectItem value="5-10">5-10年</SelectItem>
														<SelectItem value="10+">10年以上</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 期望薪资 */}
									<FormField
										control={advancedForm.control}
										name="salary"
										render={({ field }) => (
											<FormItem>
												<FormLabel>期望薪资 (K/月)</FormLabel>
												<FormControl>
													<Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
												</FormControl>
												<FormDescription>请输入合理的薪资期望</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* 订阅邮件 */}
									<FormField
										control={advancedForm.control}
										name="newsletter"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>邮件订阅</FormLabel>
													<FormDescription>订阅我们的邮件通知，获取最新资讯和更新</FormDescription>
												</div>
											</FormItem>
										)}
									/>

									{/* 提交按钮 */}
									<div className="flex space-x-4">
										<Button type="submit" disabled={advancedForm.formState.isSubmitting}>
											{advancedForm.formState.isSubmitting ? '提交中...' : '提交高级表单'}
										</Button>
										<Button type="button" variant="outline" onClick={() => advancedForm.reset()}>
											重置表单
										</Button>
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="result" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>提交结果</CardTitle>
							<CardDescription>查看最近提交的表单数据</CardDescription>
						</CardHeader>
						<CardContent>
							{submittedData ? (
								<div className="space-y-4">
									<Alert>
										<CheckCircle className="w-4 h-4" />
										<AlertDescription>{submittedData.type === 'basic' ? '基础表单' : '高级表单'} 提交成功！</AlertDescription>
									</Alert>
									<div className="bg-muted p-4 rounded-lg">
										<pre className="text-sm overflow-auto">{JSON.stringify(submittedData.data, null, 2)}</pre>
									</div>
								</div>
							) : (
								<Alert>
									<AlertTriangle className="w-4 h-4" />
									<AlertDescription>还没有提交任何表单，请先提交一个表单查看结果。</AlertDescription>
								</Alert>
							)}
						</CardContent>
					</Card>

					{/* shadcn/ui Form 组件说明 */}
					<Card>
						<CardHeader>
							<CardTitle>shadcn/ui Form 组件特点</CardTitle>
							<CardDescription>了解 shadcn/ui Form 组件的优势</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-3">
									<h4 className="font-semibold">布局优势</h4>
									<ul className="text-sm space-y-1 text-muted-foreground">
										<li>• 统一的表单项间距 (FormItem)</li>
										<li>• 标准化的标签样式 (FormLabel)</li>
										<li>• 自动错误状态处理</li>
										<li>• 可访问性标准支持</li>
									</ul>
								</div>
								<div className="space-y-3">
									<h4 className="font-semibold">开发体验</h4>
									<ul className="text-sm space-y-1 text-muted-foreground">
										<li>• 与 react-hook-form 深度集成</li>
										<li>• 支持 zod schema 验证</li>
										<li>• TypeScript 类型安全</li>
										<li>• 声明式表单结构</li>
									</ul>
								</div>
								<div className="space-y-3">
									<h4 className="font-semibold">组件结构</h4>
									<ul className="text-sm space-y-1 text-muted-foreground">
										<li>• FormField: 字段控制器</li>
										<li>• FormItem: 表单项容器</li>
										<li>• FormControl: 输入控件包装</li>
										<li>• FormMessage: 错误信息显示</li>
									</ul>
								</div>
								<div className="space-y-3">
									<h4 className="font-semibold">样式特点</h4>
									<ul className="text-sm space-y-1 text-muted-foreground">
										<li>• 基于 Tailwind CSS</li>
										<li>• 主题色彩自适应</li>
										<li>• 响应式布局支持</li>
										<li>• 暗色模式兼容</li>
									</ul>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}

export default TestShadcnForm
