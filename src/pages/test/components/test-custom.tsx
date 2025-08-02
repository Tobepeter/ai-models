import { UserCard } from '@/pages/user/components/user-card'
import { UserCardPopup } from '@/components/common/user-card-popup'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarDays, MessageSquare, ThumbsUp } from 'lucide-react'

/**
 * 用户悬停卡片测试 - 模拟 feed 评论中的用户悬停效果
 */
const TestCustom = () => {
	// 模拟用户数据
	const mockUsers = [
		{
			id: 1,
			username: 'alice_dev',
			email: 'alice@example.com',
			avatar: 'https://github.com/shadcn.png',
			extra: JSON.stringify({ bio: '前端开发工程师，热爱 React 和 TypeScript', status: '🚀' })
		},
		{
			id: 2,
			username: 'bob_designer',
			email: 'bob@example.com',
			avatar: '',
			extra: JSON.stringify({ bio: 'UI/UX 设计师，追求简洁美观的设计', status: '🎨' })
		},
		{
			id: 3,
			username: 'charlie_pm',
			email: 'charlie@example.com',
			avatar: '',
			extra: JSON.stringify({ bio: '产品经理，专注用户体验和产品创新', status: '💡' })
		},
		{
			id: 4,
			username: 'diana_backend',
			email: 'diana@example.com',
			avatar: '',
			extra: JSON.stringify({ bio: '后端工程师，专精 Go 和微服务架构', status: '⚡' })
		}
	]

	// 模拟评论数据
	const mockComments = [
		{ id: 1, userId: 1, content: '这个功能设计得很棒！交互体验很流畅。', timestamp: '2分钟前', likes: 12 },
		{ id: 2, userId: 2, content: '同意！UI 设计也很精美，配色和布局都很舒服。', timestamp: '5分钟前', likes: 8 },
		{ id: 3, userId: 3, content: '从产品角度来看，这个需求解决了用户的核心痛点。', timestamp: '10分钟前', likes: 15 },
		{ id: 4, userId: 4, content: '技术实现上有什么难点吗？性能表现如何？', timestamp: '15分钟前', likes: 6 },
		{ id: 5, userId: 1, content: '主要是状态管理和组件复用方面需要仔细设计。', timestamp: '18分钟前', likes: 9 }
	]

	return (
		<div className="p-6 max-w-4xl mx-auto" data-slot="test-custom">
			<div className="space-y-6">
				<h1 className="text-2xl font-bold">用户悬停卡片测试</h1>
				<p className="text-gray-600">模拟 feed 评论中的用户悬停效果，鼠标悬停在用户名上查看用户卡片</p>

				{/* 评论列表 */}
				<div className="space-y-4">
					<h2 className="text-lg font-semibold">📝 评论列表</h2>
					<div className="bg-white border rounded-lg divide-y">
						{mockComments.map((comment) => {
							const user = mockUsers.find(u => u.id === comment.userId)
							if (!user) return null

							return (
								<div key={comment.id} className="p-4">
									<div className="flex gap-3">
										{/* 头像 */}
										<Avatar className="h-8 w-8 flex-shrink-0">
											<AvatarImage src={user.avatar} alt={user.username} />
											<AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
										</Avatar>

										{/* 评论内容 */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												{/* 用户名 - 支持悬停显示卡片 */}
												<UserCardPopup userData={user}>
													<button className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
														{user.username}
													</button>
												</UserCardPopup>
												<span className="text-gray-500 text-sm">•</span>
												<span className="text-gray-500 text-sm">{comment.timestamp}</span>
											</div>
											<p className="text-gray-800 mb-2">{comment.content}</p>
											<div className="flex items-center gap-4">
												<button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
													<ThumbsUp className="h-4 w-4" />
													<span className="text-sm">{comment.likes}</span>
												</button>
												<button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
													<MessageSquare className="h-4 w-4" />
													<span className="text-sm">回复</span>
												</button>
											</div>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				</div>

				{/* 用户卡片展示 */}
				<div className="space-y-4">
					<h2 className="text-lg font-semibold">👥 用户卡片展示</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{mockUsers.map((user) => (
							<UserCard 
								key={user.id} 
								readonly 
								userData={user}
								className="bg-gray-50"
							/>
						))}
					</div>
				</div>

				{/* 使用说明 */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<h3 className="font-medium text-blue-900 mb-2">💡 使用说明</h3>
					<ul className="text-blue-800 text-sm space-y-1">
						<li>• 鼠标悬停在评论列表中的用户名上，会显示用户信息卡片</li>
						<li>• UserCardPopup 组件封装了悬停逻辑，可在任何地方复用</li>
						<li>• 支持自定义触发器 children，灵活适应不同场景</li>
						<li>• 内置防闪烁机制：200ms 延迟显示，300ms 延迟关闭</li>
						<li>• UserCard 组件支持 readonly 模式，隐藏所有编辑功能</li>
					</ul>
				</div>
			</div>
		</div>
	)
}

export default TestCustom

export interface UserCardProps {
  readonly?: boolean
  userData?: {
    username: string
    email: string
    avatar: string
    extra?: string
  }
  className?: string
}
