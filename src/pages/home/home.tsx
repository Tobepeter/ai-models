import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { GitCompare, MessageSquare, User, Database, LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface NavCard {
	title: string
	path: string
	icon: LucideIcon
}

const navCards: NavCard[] = [
	{
		title: 'AI 助手',
		path: '/chat',
		icon: MessageSquare,
	},
	{
		title: 'AI 对比',
		path: '/chat-hub',
		icon: GitCompare,
	},
	{
		title: '通用型CRUD体验',
		path: '/crud',
		icon: Database,
	},
	{
		title: '用户中心',
		path: '/user',
		icon: User,
	},
]

export const Home = () => {
	const navigate = useNavigate()

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{navCards.map((card) => {
					const Icon = card.icon
					return (
						<Card 
							key={card.path}
							className="cursor-pointer hover:shadow-lg transition-shadow"
							onClick={() => navigate(card.path)}
						>
							<CardHeader className="text-center">
								<div className="flex flex-col items-center space-y-3">
									<Icon className="h-12 w-12" />
									<CardTitle className="text-lg">{card.title}</CardTitle>
								</div>
							</CardHeader>
						</Card>
					)
				})}
			</div>
		</div>
	)
}
