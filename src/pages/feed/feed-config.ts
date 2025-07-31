export const feedConfig = {
	// 评论相关配置
	commentPageSize: 20, // 评论分页大小
	commentPreloadCount: 5, // 首页预加载评论数
	commentVirtualScrollThreshold: 50, // 启用虚拟滚动的评论数阈值
	commentItemHeight: 46, // 评论项预估高度
	commentAutoLoadDistance: 200, // 自动加载距离（px）

	// Feed相关配置
	feedPageSize: 20, // Feed分页大小
	feedAutoLoadDistance: 200, // 自动加载距离（px）

	// UI相关配置
	virtualScrollHeight: 300, // 虚拟滚动容器高度

	// 更多操作菜单配置
	moreActions: [
		{
			key: 'report',
			label: '举报',
			icon: 'Flag',
			onClick: (userId: string) => {
				console.log('举报用户:', userId)
			}
		},
		{
			key: 'delete',
			label: '删除',
			icon: 'Trash2',
			onClick: (userId: string) => {
				console.log('删除帖子:', userId)
			}
		}
	]
}
