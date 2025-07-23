import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GitCompare, MessageSquare, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const Home = () => {
	const navigate = useNavigate()

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* Chat 卡片 */}
				<Card 
					className="cursor-pointer hover:shadow-lg transition-shadow"
					onClick={() => navigate('/chat')}
				>
					<CardHeader>
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								<MessageSquare className="h-6 w-6 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg">AI 助手</CardTitle>
								<CardDescription>智能对话与创作</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							支持文本对话、图像生成、音频创作和视频制作，满足您的各种创意需求。
						</p>
					</CardContent>
				</Card>

				{/* ChatHub 卡片 */}
				<Card 
					className="cursor-pointer hover:shadow-lg transition-shadow"
					onClick={() => navigate('/chat-hub')}
				>
					<CardHeader>
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-secondary/10 rounded-lg">
								<GitCompare className="h-6 w-6 text-secondary-foreground" />
							</div>
							<div>
								<CardTitle className="text-lg">AI 对比</CardTitle>
								<CardDescription>多模型同时对比</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							同时使用多个AI模型回答相同问题，对比不同模型的回答质量和风格。
						</p>
					</CardContent>
				</Card>

				{/* User 卡片 */}
				<Card 
					className="cursor-pointer hover:shadow-lg transition-shadow"
					onClick={() => navigate('/user')}
				>
					<CardHeader>
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-accent/10 rounded-lg">
								<User className="h-6 w-6 text-accent-foreground" />
							</div>
							<div>
								<CardTitle className="text-lg">用户中心</CardTitle>
								<CardDescription>个人信息与设置</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							管理个人信息、查看使用记录、调整应用设置和偏好配置。
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
