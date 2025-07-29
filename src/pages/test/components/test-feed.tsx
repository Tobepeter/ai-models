import { Feed } from '@/pages/feed/feed'

/**
 * 信息流测试组件
 */
export default function TestFeed() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-4xl">
				<div className="py-6">
					<h1 className="text-2xl font-bold mb-6">信息流测试</h1>

					<div className="bg-card rounded-lg border shadow-sm overflow-hidden">
						<Feed />
					</div>

					<div className="mt-6 p-4 bg-muted rounded-lg">
						<h2 className="text-lg font-semibold mb-2">功能说明</h2>
						<ul className="text-sm text-muted-foreground space-y-1">
							<li>• 自动加载初始数据（20条模拟帖子）</li>
							<li>• 滚动到底部自动加载更多</li>
							<li>• 点击右上角刷新按钮可以刷新数据</li>
							<li>• 点击❤️可以点赞/取消点赞（带动画效果，定宽防跳动）</li>
							<li>• 点击💬可以展开/收起评论区</li>
							<li>• 评论区支持输入评论和回复（@用户名）</li>
							<li>• 长文本会自动折叠，点击"展开全文"查看完整内容</li>
							<li>• 图片支持懒加载和点击预览</li>
							<li>• 用户头像、状态emoji、时间格式化等</li>
							<li>• 数字格式化：1000→1k, 1000000→1M</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}
