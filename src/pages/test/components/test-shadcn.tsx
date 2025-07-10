import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Heart, Star, Users, Settings, Mail } from 'lucide-react'

export const TestShadcn = () => {
	return (
		<div className="space-y-8">
			{/* 按钮展示 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Heart className="h-5 w-5" />
						按钮组件
					</CardTitle>
					<CardDescription>各种样式的按钮组件</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2">
						<Button>默认按钮</Button>
						<Button variant="secondary">次要按钮</Button>
						<Button variant="outline">边框按钮</Button>
						<Button variant="destructive">危险按钮</Button>
						<Button variant="ghost">幽灵按钮</Button>
						<Button variant="link">链接按钮</Button>
						<Button size="sm">小按钮</Button>
						<Button size="lg">大按钮</Button>
					</div>
				</CardContent>
			</Card>

			{/* 表单组件 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						表单组件
					</CardTitle>
					<CardDescription>输入框、选择器等表单组件</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">用户名</label>
							<Input placeholder="请输入用户名" />
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">邮箱</label>
							<Input type="email" placeholder="请输入邮箱" />
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">选择城市</label>
						<Select>
							<SelectTrigger>
								<SelectValue placeholder="选择一个城市" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="beijing">北京</SelectItem>
								<SelectItem value="shanghai">上海</SelectItem>
								<SelectItem value="guangzhou">广州</SelectItem>
								<SelectItem value="shenzhen">深圳</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">消息内容</label>
						<Textarea placeholder="请输入你的消息..." />
					</div>
				</CardContent>
			</Card>

			{/* 标签页组件 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						标签页组件
					</CardTitle>
					<CardDescription>展示不同内容的标签页</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="overview" className="w-full">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="overview">概览</TabsTrigger>
							<TabsTrigger value="analytics">分析</TabsTrigger>
							<TabsTrigger value="reports">报告</TabsTrigger>
						</TabsList>
						<TabsContent value="overview" className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<h4 className="font-medium">总用户数</h4>
									<p className="text-2xl font-bold">10,482</p>
									<Badge variant="secondary">+2.1%</Badge>
								</div>
								<div className="space-y-2">
									<h4 className="font-medium">活跃用户</h4>
									<p className="text-2xl font-bold">8,924</p>
									<Badge>+5.2%</Badge>
								</div>
								<div className="space-y-2">
									<h4 className="font-medium">转化率</h4>
									<p className="text-2xl font-bold">12.4%</p>
									<Badge variant="destructive">-0.8%</Badge>
								</div>
							</div>
						</TabsContent>
						<TabsContent value="analytics" className="space-y-4">
							<div className="space-y-4">
								<h4 className="font-medium">流量分析</h4>
								<Progress value={75} className="w-full" />
								<p className="text-sm text-muted-foreground">本月流量增长 75%</p>
							</div>
						</TabsContent>
						<TabsContent value="reports" className="space-y-4">
							<div className="space-y-4">
								<h4 className="font-medium">月度报告</h4>
								<div className="space-y-2">
									<div className="flex items-center space-x-2">
										<Checkbox id="report1" />
										<label htmlFor="report1" className="text-sm">
											用户行为报告
										</label>
									</div>
									<div className="flex items-center space-x-2">
										<Checkbox id="report2" />
										<label htmlFor="report2" className="text-sm">
											财务报告
										</label>
									</div>
									<div className="flex items-center space-x-2">
										<Checkbox id="report3" />
										<label htmlFor="report3" className="text-sm">
											技术报告
										</label>
									</div>
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* 手风琴组件 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						手风琴组件
					</CardTitle>
					<CardDescription>可折叠的内容区域</CardDescription>
				</CardHeader>
				<CardContent>
					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="item-1">
							<AccordionTrigger>什么是 React？</AccordionTrigger>
							<AccordionContent>
								React 是一个用于构建用户界面的 JavaScript 库。它由 Facebook 开发， 主要用于构建单页应用程序（SPA）。React 使用组件化的方法， 让开发者可以构建可复用的 UI 组件。
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-2">
							<AccordionTrigger>什么是 TypeScript？</AccordionTrigger>
							<AccordionContent>TypeScript 是 JavaScript 的超集，它添加了静态类型检查。 TypeScript 可以帮助开发者在编译时发现错误，提高代码质量和开发效率。</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-3">
							<AccordionTrigger>什么是 Tailwind CSS？</AccordionTrigger>
							<AccordionContent>
								Tailwind CSS 是一个实用程序优先的 CSS 框架，它提供了大量的预定义类， 可以快速构建自定义用户界面。与传统的 CSS 框架不同， Tailwind CSS 不提供预设计的组件，而是提供构建块。
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</CardContent>
			</Card>

			{/* 开关和进度条 */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>开关组件</CardTitle>
						<CardDescription>切换开关状态</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center space-x-2">
							<Switch id="airplane-mode" />
							<label htmlFor="airplane-mode" className="text-sm">
								飞行模式
							</label>
						</div>
						<div className="flex items-center space-x-2">
							<Switch id="notifications" />
							<label htmlFor="notifications" className="text-sm">
								通知
							</label>
						</div>
						<div className="flex items-center space-x-2">
							<Switch id="dark-mode" />
							<label htmlFor="dark-mode" className="text-sm">
								深色模式
							</label>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>进度条</CardTitle>
						<CardDescription>显示任务进度</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>项目完成度</span>
								<span>65%</span>
							</div>
							<Progress value={65} />
						</div>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>下载进度</span>
								<span>42%</span>
							</div>
							<Progress value={42} />
						</div>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>上传进度</span>
								<span>88%</span>
							</div>
							<Progress value={88} />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* 徽章展示 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Star className="h-5 w-5" />
						徽章组件
					</CardTitle>
					<CardDescription>显示状态和标签</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2">
						<Badge>默认</Badge>
						<Badge variant="secondary">次要</Badge>
						<Badge variant="outline">边框</Badge>
						<Badge variant="destructive">危险</Badge>
						<Badge className="bg-green-500 text-white">成功</Badge>
						<Badge className="bg-yellow-500 text-black">警告</Badge>
						<Badge className="bg-blue-500 text-white">信息</Badge>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
