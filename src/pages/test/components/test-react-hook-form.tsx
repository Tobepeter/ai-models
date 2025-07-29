import { useForm } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface BasicFormData {
	username: string
	email: string
	password: string
	confirmPassword: string
	age: number
	bio: string
	country: string
	hobbies: string[]
	gender: string
	terms: boolean
}

interface AdvancedFormData {
	firstName: string
	lastName: string
	phone: string
	website: string
	skills: string[]
	experience: string
	salary: number
	newsletter: boolean
}

/**
 * React Hook Form 学习示例组件
 */
const TestReactHookForm = () => {
	const [showPassword, setShowPassword] = useState(false)
	const [submittedData, setSubmittedData] = useState<any>(null)

	// 基础表单
	const basicForm = useForm<BasicFormData>({
		defaultValues: {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
			age: 18,
			bio: '',
			country: '',
			hobbies: [],
			gender: 'male',
			terms: false,
		},
		mode: 'onChange', // 实时验证
	})

	// 高级表单 - 带复杂验证
	const advancedForm = useForm<AdvancedFormData>({
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
		mode: 'onBlur', // 失焦验证
	})

	const onBasicSubmit = (data: BasicFormData) => {
		console.log('基础表单提交:', data)
		setSubmittedData({ type: 'basic', data })
	}

	const onAdvancedSubmit = (data: AdvancedFormData) => {
		console.log('高级表单提交:', data)
		setSubmittedData({ type: 'advanced', data })
	}

	const handleHobbyChange = (hobby: string, checked: boolean) => {
		const currentHobbies = basicForm.getValues('hobbies') || []
		if (checked) {
			basicForm.setValue('hobbies', [...currentHobbies, hobby])
		} else {
			basicForm.setValue(
				'hobbies',
				currentHobbies.filter((h) => h !== hobby)
			)
		}
	}

	const handleSkillChange = (skill: string, checked: boolean) => {
		const currentSkills = advancedForm.getValues('skills') || []
		if (checked) {
			advancedForm.setValue('skills', [...currentSkills, skill])
		} else {
			advancedForm.setValue(
				'skills',
				currentSkills.filter((s) => s !== skill)
			)
		}
	}

	return (
		<div className="w-full max-w-6xl mx-auto p-4 space-y-6">
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold">React Hook Form 学习示例</h1>
				<p className="text-muted-foreground">学习 React Hook Form 的各种功能和用法</p>
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
							<CardDescription>展示基本的表单字段类型和验证</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={basicForm.handleSubmit(onBasicSubmit)} className="space-y-6">
								{/* 用户名 */}
								<div className="space-y-2">
									<Label htmlFor="username">用户名 *</Label>
									<Input
										id="username"
										{...basicForm.register('username', {
											required: '用户名是必填的',
											minLength: { value: 3, message: '用户名至少需要3个字符' },
											maxLength: { value: 20, message: '用户名不能超过20个字符' },
											pattern: {
												value: /^[a-zA-Z0-9_]+$/,
												message: '用户名只能包含字母、数字和下划线',
											},
										})}
										placeholder="请输入用户名"
										className={basicForm.formState.errors.username ? 'border-red-500' : ''}
									/>
									{basicForm.formState.errors.username && (
										<p className="text-sm text-red-500 flex items-center gap-1">
											<AlertCircle className="w-4 h-4" />
											{basicForm.formState.errors.username.message}
										</p>
									)}
								</div>

								{/* 邮箱 */}
								<div className="space-y-2">
									<Label htmlFor="email">邮箱 *</Label>
									<Input
										id="email"
										type="email"
										{...basicForm.register('email', {
											required: '邮箱是必填的',
											pattern: {
												value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
												message: '请输入有效的邮箱地址',
											},
										})}
										placeholder="请输入邮箱"
										className={basicForm.formState.errors.email ? 'border-red-500' : ''}
									/>
									{basicForm.formState.errors.email && (
										<p className="text-sm text-red-500 flex items-center gap-1">
											<AlertCircle className="w-4 h-4" />
											{basicForm.formState.errors.email.message}
										</p>
									)}
								</div>

								{/* 密码 - 带显示/隐藏功能 */}
								<div className="space-y-2">
									<Label htmlFor="password">密码 *</Label>
									<div className="relative">
										<Input
											id="password"
											type={showPassword ? 'text' : 'password'}
											{...basicForm.register('password', {
												required: '密码是必填的',
												minLength: { value: 6, message: '密码至少需要6个字符' },
												pattern: {
													value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
													message: '密码必须包含大小写字母和数字',
												},
											})}
											placeholder="请输入密码"
											className={basicForm.formState.errors.password ? 'border-red-500 pr-10' : 'pr-10'}
										/>
										<Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2" onClick={() => setShowPassword(!showPassword)}>
											{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
										</Button>
									</div>
									{basicForm.formState.errors.password && (
										<p className="text-sm text-red-500 flex items-center gap-1">
											<AlertCircle className="w-4 h-4" />
											{basicForm.formState.errors.password.message}
										</p>
									)}
								</div>

								{/* 确认密码 */}
								<div className="space-y-2">
									<Label htmlFor="confirmPassword">确认密码 *</Label>
									<Input
										id="confirmPassword"
										type="password"
										{...basicForm.register('confirmPassword', {
											required: '请确认密码',
											validate: (value) => {
												const password = basicForm.getValues('password')
												return value === password || '两次输入的密码不一致'
											},
										})}
										placeholder="请再次输入密码"
										className={basicForm.formState.errors.confirmPassword ? 'border-red-500' : ''}
									/>
									{basicForm.formState.errors.confirmPassword && (
										<p className="text-sm text-red-500 flex items-center gap-1">
											<AlertCircle className="w-4 h-4" />
											{basicForm.formState.errors.confirmPassword.message}
										</p>
									)}
								</div>

								{/* 年龄 - 数字输入 */}
								<div className="space-y-2">
									<Label htmlFor="age">年龄</Label>
									<Input
										id="age"
										type="number"
										{...basicForm.register('age', {
											min: { value: 1, message: '年龄必须大于0' },
											max: { value: 120, message: '年龄不能超过120' },
											valueAsNumber: true,
										})}
										placeholder="请输入年龄"
										className={basicForm.formState.errors.age ? 'border-red-500' : ''}
									/>
									{basicForm.formState.errors.age && (
										<p className="text-sm text-red-500 flex items-center gap-1">
											<AlertCircle className="w-4 h-4" />
											{basicForm.formState.errors.age.message}
										</p>
									)}
								</div>

								{/* 国家 - 下拉选择 */}
								<div className="space-y-2">
									<Label>国家/地区</Label>
									<Select value={basicForm.watch('country')} onValueChange={(value) => basicForm.setValue('country', value)}>
										<SelectTrigger className={basicForm.formState.errors.country ? 'border-red-500' : ''}>
											<SelectValue placeholder="请选择国家/地区" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="china">中国</SelectItem>
											<SelectItem value="usa">美国</SelectItem>
											<SelectItem value="japan">日本</SelectItem>
											<SelectItem value="korea">韩国</SelectItem>
											<SelectItem value="other">其他</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* 性别 - 单选按钮 */}
								<div className="space-y-3">
									<Label>性别</Label>
									<RadioGroup value={basicForm.watch('gender')} onValueChange={(value: string) => basicForm.setValue('gender', value)} className="flex space-x-6">
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="male" id="male" />
											<Label htmlFor="male">男</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="female" id="female" />
											<Label htmlFor="female">女</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="other" id="other" />
											<Label htmlFor="other">其他</Label>
										</div>
									</RadioGroup>
								</div>

								{/* 爱好 - 复选框 */}
								<div className="space-y-3">
									<Label>爱好</Label>
									<div className="grid grid-cols-2 gap-3">
										{['阅读', '音乐', '运动', '旅行', '编程', '摄影'].map((hobby) => (
											<div key={hobby} className="flex items-center space-x-2">
												<Checkbox id={hobby} checked={basicForm.watch('hobbies')?.includes(hobby) || false} onCheckedChange={(checked) => handleHobbyChange(hobby, checked as boolean)} />
												<Label htmlFor={hobby}>{hobby}</Label>
											</div>
										))}
									</div>
								</div>

								{/* 个人简介 - 文本域 */}
								<div className="space-y-2">
									<Label htmlFor="bio">个人简介</Label>
									<Textarea
										id="bio"
										{...basicForm.register('bio', {
											maxLength: { value: 500, message: '个人简介不能超过500个字符' },
										})}
										placeholder="请输入个人简介"
										rows={4}
										className={basicForm.formState.errors.bio ? 'border-red-500' : ''}
									/>
									<div className="flex justify-between text-sm text-muted-foreground">
										<span>{basicForm.formState.errors.bio?.message}</span>
										<span>{basicForm.watch('bio')?.length || 0}/500</span>
									</div>
								</div>

								{/* 服务条款 - 必选复选框 */}
								<div className="flex items-center space-x-2">
									<Checkbox
										id="terms"
										{...basicForm.register('terms', {
											required: '请同意服务条款',
										})}
										className={basicForm.formState.errors.terms ? 'border-red-500' : ''}
									/>
									<Label htmlFor="terms" className="text-sm">
										我已阅读并同意 <span className="text-blue-500 underline cursor-pointer">服务条款</span>
									</Label>
								</div>
								{basicForm.formState.errors.terms && (
									<p className="text-sm text-red-500 flex items-center gap-1">
										<AlertCircle className="w-4 h-4" />
										{basicForm.formState.errors.terms.message}
									</p>
								)}

								{/* 提交按钮 */}
								<div className="flex space-x-4">
									<Button type="submit" disabled={!basicForm.formState.isValid || basicForm.formState.isSubmitting}>
										{basicForm.formState.isSubmitting ? '提交中...' : '提交基础表单'}
									</Button>
									<Button type="button" variant="outline" onClick={() => basicForm.reset()}>
										重置表单
									</Button>
								</div>

								{/* 表单状态显示 */}
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div className="space-y-2">
										<Label>表单状态</Label>
										<div className="space-y-1">
											<Badge variant={basicForm.formState.isDirty ? 'default' : 'secondary'}>{basicForm.formState.isDirty ? '已修改' : '未修改'}</Badge>
											<Badge variant={basicForm.formState.isValid ? 'default' : 'destructive'}>{basicForm.formState.isValid ? '验证通过' : '验证失败'}</Badge>
											<Badge variant={basicForm.formState.isSubmitting ? 'default' : 'secondary'}>{basicForm.formState.isSubmitting ? '提交中' : '未提交'}</Badge>
										</div>
									</div>
									<div className="space-y-2">
										<Label>错误数量</Label>
										<p className="text-red-500">{Object.keys(basicForm.formState.errors).length} 个错误</p>
									</div>
								</div>
							</form>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="advanced" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>高级表单示例</CardTitle>
							<CardDescription>展示复杂验证、动态字段和自定义验证规则</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={advancedForm.handleSubmit(onAdvancedSubmit)} className="space-y-6">
								{/* 姓名 - 并排输入 */}
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="firstName">姓 *</Label>
										<Input
											id="firstName"
											{...advancedForm.register('firstName', {
												required: '姓是必填的',
												pattern: {
													value: /^[\u4e00-\u9fa5a-zA-Z]+$/,
													message: '姓只能包含中文或英文字母',
												},
											})}
											placeholder="请输入姓"
											className={advancedForm.formState.errors.firstName ? 'border-red-500' : ''}
										/>
										{advancedForm.formState.errors.firstName && <p className="text-sm text-red-500">{advancedForm.formState.errors.firstName.message}</p>}
									</div>
									<div className="space-y-2">
										<Label htmlFor="lastName">名 *</Label>
										<Input
											id="lastName"
											{...advancedForm.register('lastName', {
												required: '名是必填的',
												pattern: {
													value: /^[\u4e00-\u9fa5a-zA-Z]+$/,
													message: '名只能包含中文或英文字母',
												},
											})}
											placeholder="请输入名"
											className={advancedForm.formState.errors.lastName ? 'border-red-500' : ''}
										/>
										{advancedForm.formState.errors.lastName && <p className="text-sm text-red-500">{advancedForm.formState.errors.lastName.message}</p>}
									</div>
								</div>

								{/* 手机号 - 自定义验证 */}
								<div className="space-y-2">
									<Label htmlFor="phone">手机号</Label>
									<Input
										id="phone"
										{...advancedForm.register('phone', {
											pattern: {
												value: /^1[3-9]\d{9}$/,
												message: '请输入有效的手机号',
											},
										})}
										placeholder="请输入手机号"
										className={advancedForm.formState.errors.phone ? 'border-red-500' : ''}
									/>
									{advancedForm.formState.errors.phone && <p className="text-sm text-red-500">{advancedForm.formState.errors.phone.message}</p>}
								</div>

								{/* 网站 - URL 验证 */}
								<div className="space-y-2">
									<Label htmlFor="website">个人网站</Label>
									<Input
										id="website"
										{...advancedForm.register('website', {
											pattern: {
												value: /^https?:\/\/.+/,
												message: '请输入有效的网站地址（需以 http:// 或 https:// 开头）',
											},
										})}
										placeholder="https://example.com"
										className={advancedForm.formState.errors.website ? 'border-red-500' : ''}
									/>
									{advancedForm.formState.errors.website && <p className="text-sm text-red-500">{advancedForm.formState.errors.website.message}</p>}
								</div>

								{/* 技能 - 多选复选框 */}
								<div className="space-y-3">
									<Label>技能 (至少选择一项) *</Label>
									<div className="grid grid-cols-3 gap-3">
										{['JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js', 'Python', 'Java', 'Go', 'Rust'].map((skill) => (
											<div key={skill} className="flex items-center space-x-2">
												<Checkbox id={skill} checked={advancedForm.watch('skills')?.includes(skill) || false} onCheckedChange={(checked) => handleSkillChange(skill, checked as boolean)} />
												<Label htmlFor={skill}>{skill}</Label>
											</div>
										))}
									</div>
									{(advancedForm.watch('skills')?.length || 0) === 0 && advancedForm.formState.errors.skills && <p className="text-sm text-red-500">请至少选择一项技能</p>}
								</div>

								{/* 工作经验 */}
								<div className="space-y-2">
									<Label>工作经验</Label>
									<Select value={advancedForm.watch('experience')} onValueChange={(value) => advancedForm.setValue('experience', value)}>
										<SelectTrigger>
											<SelectValue placeholder="请选择工作经验" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="0-1">0-1年</SelectItem>
											<SelectItem value="1-3">1-3年</SelectItem>
											<SelectItem value="3-5">3-5年</SelectItem>
											<SelectItem value="5-10">5-10年</SelectItem>
											<SelectItem value="10+">10年以上</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* 期望薪资 - 数字验证 */}
								<div className="space-y-2">
									<Label htmlFor="salary">期望薪资 (K/月)</Label>
									<Input
										id="salary"
										type="number"
										{...advancedForm.register('salary', {
											min: { value: 0, message: '薪资不能为负数' },
											max: { value: 1000, message: '薪资不能超过1000K' },
											valueAsNumber: true,
										})}
										placeholder="请输入期望薪资"
										className={advancedForm.formState.errors.salary ? 'border-red-500' : ''}
									/>
									{advancedForm.formState.errors.salary && <p className="text-sm text-red-500">{advancedForm.formState.errors.salary.message}</p>}
								</div>

								{/* 订阅邮件 */}
								<div className="flex items-center space-x-2">
									<Checkbox id="newsletter" {...advancedForm.register('newsletter')} />
									<Label htmlFor="newsletter">订阅我们的邮件通知</Label>
								</div>

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
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="result" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>表单提交结果</CardTitle>
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
									<AlertCircle className="w-4 h-4" />
									<AlertDescription>还没有提交任何表单，请先提交一个表单查看结果。</AlertDescription>
								</Alert>
							)}
						</CardContent>
					</Card>

					{/* React Hook Form 特性说明 */}
					<Card>
						<CardHeader>
							<CardTitle>React Hook Form 主要特性</CardTitle>
							<CardDescription>了解这个强大的表单库的核心功能</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-3">
									<h4 className="font-semibold">性能优化</h4>
									<ul className="text-sm space-y-1 text-muted-foreground">
										<li>• 最小化重新渲染</li>
										<li>• 非受控组件模式</li>
										<li>• 订阅机制优化</li>
									</ul>
								</div>
								<div className="space-y-3">
									<h4 className="font-semibold">验证功能</h4>
									<ul className="text-sm space-y-1 text-muted-foreground">
										<li>• 内置验证规则</li>
										<li>• 自定义验证函数</li>
										<li>• 异步验证支持</li>
									</ul>
								</div>
								<div className="space-y-3">
									<h4 className="font-semibold">开发体验</h4>
									<ul className="text-sm space-y-1 text-muted-foreground">
										<li>• TypeScript 支持</li>
										<li>• 简洁的 API</li>
										<li>• 丰富的配置选项</li>
									</ul>
								</div>
								<div className="space-y-3">
									<h4 className="font-semibold">集成能力</h4>
									<ul className="text-sm space-y-1 text-muted-foreground">
										<li>• UI 组件库集成</li>
										<li>• 第三方验证库</li>
										<li>• 表单构建器</li>
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

export default TestReactHookForm
