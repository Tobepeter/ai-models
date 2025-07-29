import { useFeedStore, type FeedPost, type Comment } from './feed-store'
import { feedUtil } from './feed-util'
import { dummy } from '@/utils/dummy'

/* 中文姓名列表 */
const CHINESE_NAMES = [
	'张伟',
	'王芳',
	'李娜',
	'刘洋',
	'陈静',
	'杨帆',
	'赵雷',
	'黄敏',
	'周杰',
	'吴琳',
	'徐强',
	'朱丽',
	'胡斌',
	'郭敏',
	'林峰',
	'何静',
	'高伟',
	'梁芳',
	'宋涛',
	'唐丽',
	'韩磊',
	'冯娟',
	'于勇',
	'董敏',
	'薛峰',
	'白雪',
	'石磊',
	'罗丽',
	'毛伟',
	'贺芳',
	'龙涛',
	'叶静',
	'方磊',
	'孔丽',
	'左伟',
	'崔芳',
	'成涛',
	'戴静',
	'谭磊',
	'邹丽',
]

/* 中文内容模板 */
const CONTENT_TEMPLATES = [
	'今天天气真不错，心情也特别好！',
	'刚刚看了一部很棒的电影，强烈推荐给大家。',
	'周末和朋友们一起去爬山，风景超美的。',
	'最近在学习新技能，感觉很充实。',
	'今天做了一道新菜，味道还不错呢。',
	'工作虽然忙碌，但是很有成就感。',
	'和家人一起度过了愉快的晚餐时光。',
	'读了一本很有意思的书，收获颇丰。',
	'今天的日落特别美，忍不住拍了很多照片。',
	'运动完之后感觉整个人都精神了。',
	'发现了一家很棒的咖啡店，环境超赞。',
	'最近迷上了摄影，到处拍拍拍。',
	'和老朋友重聚，聊了很多有趣的话题。',
	'今天学会了一个新技能，很有成就感。',
	'周末在家整理房间，看着干净整洁的空间心情很好。',
	'尝试了新的健身方式，感觉很不错。',
	'今天的工作效率特别高，提前完成了任务。',
	'和宠物一起玩耍的时光总是那么快乐。',
	'发现了一个很有意思的地方，下次还要再去。',
	'今天收到了朋友的惊喜礼物，太开心了！',
]

/* 评论内容模板 */
const COMMENT_TEMPLATES = [
	'说得很对！',
	'同感，我也是这样想的。',
	'哈哈哈，太有趣了',
	'学到了，谢谢分享',
	'支持！',
	'赞同你的观点',
	'确实如此',
	'我也遇到过类似的情况',
	'很有道理',
	'期待更多分享',
	'太棒了！',
	'受益匪浅',
	'说到心坎里了',
	'完全同意',
	'很实用的建议',
]

/**
 * 信息流管理器 - 处理数据加载和状态管理
 * 支持无限滚动、下拉刷新、点赞和评论等功能
 */
class FeedManager {
	private getStore() {
		return useFeedStore.getState()
	}

	/* 初始化加载信息流数据 */

	async loadInitial(): Promise<FeedPost[]> {
		const store = this.getStore()

		try {
			store.setLoading(true)
			store.clearError()

			await feedUtil.delay(800, 1200) // 模拟网络延迟

			const posts = this.generateMockPosts(20)

			// 设置分页游标为最后一条数据的时间戳
			const lastPost = posts[posts.length - 1]
			const cursor = lastPost ? feedUtil.generateCursor(new Date(lastPost.createdAt).getTime(), lastPost.id) : null

			store.setData({ posts, cursor, hasMore: true, loading: false })
			return posts
		} catch (error) {
			console.error('[FeedManager] 加载初始数据失败:', error)
			store.setError('加载失败，请重试')
			store.setLoading(false)
			return []
		}
	}

	/* 加载更多数据 - 用于无限滚动 */
	async loadMore(): Promise<FeedPost[]> {
		const store = this.getStore()
		const { cursor, hasMore, loading } = store

		if (!hasMore || loading) return [] // 早期返回避免重复请求

		try {
			store.setLoading(true)
			store.clearError()

			await feedUtil.delay(500, 1000)

			// 解析游标获取时间基准点
			let beforeTimestamp = Date.now()
			if (cursor) {
				const parsed = feedUtil.parseCursor(cursor)
				if (parsed) beforeTimestamp = parsed.timestamp
			}

			const posts = this.generateMockPosts(15, beforeTimestamp) // 生成更早的数据

			if (posts.length === 0) {
				store.setData({ hasMore: false, loading: false })
				return []
			}

			// 更新游标为新的最后一条
			const lastPost = posts[posts.length - 1]
			const newCursor = feedUtil.generateCursor(new Date(lastPost.createdAt).getTime(), lastPost.id)

			store.appendPosts(posts)
			store.setData({
				cursor: newCursor,
				hasMore: posts.length >= 15, // 数据不足说明已经没有更多
				loading: false,
			})

			return posts
		} catch (error) {
			console.error('[FeedManager] 加载更多数据失败:', error)
			store.setError('加载失败，请重试')
			store.setLoading(false)
			return []
		}
	}

	/* 下拉刷新数据 */
	async refresh(): Promise<FeedPost[]> {
		const store = this.getStore()

		try {
			store.setRefreshing(true)
			store.clearError()

			await feedUtil.delay(800, 1200)

			const posts = this.generateMockPosts(10) // 生成新的数据

			// 重置所有状态
			const lastPost = posts[posts.length - 1]
			const cursor = lastPost ? feedUtil.generateCursor(new Date(lastPost.createdAt).getTime(), lastPost.id) : null

			store.setData({ posts, cursor, hasMore: true, refreshing: false })
			return posts
		} catch (error) {
			console.error('[FeedManager] 刷新数据失败:', error)
			store.setError('刷新失败，请重试')
			store.setRefreshing(false)
			return []
		}
	}

	/* 切换点赞状态 - 使用乐观更新 */
	async toggleLike(postId: string): Promise<void> {
		const store = this.getStore()

		try {
			store.toggleLike(postId) // 先更新UI，再发请求
			await feedUtil.delay(200, 500)
			console.log(`[FeedManager] 切换点赞状态: ${postId}`)
		} catch (error) {
			console.error('[FeedManager] 切换点赞失败:', error)
			store.toggleLike(postId) // 失败时回滚
		}
	}

	toggleExpand(postId: string): void {
		this.getStore().toggleExpand(postId) // 切换内容展开状态
	}

	toggleComments(postId: string): void {
		this.getStore().toggleComments(postId) // 切换评论区展开状态
	}

	/* 添加评论 */
	async addComment(postId: string, content: string, replyTo?: string): Promise<void> {
		const store = this.getStore()

		try {
			await feedUtil.delay(300, 800)

			const comment: Comment = {
				id: feedUtil.generatePostId(),
				postId,
				userId: 'current_user_id',
				username: '当前用户',
				avatar: dummy.images.avatar,
				content,
				replyTo,
				createdAt: new Date().toISOString(),
				likeCount: 0,
				isLiked: false,
			}

			store.addComment(postId, comment)
			console.log(`[FeedManager] 添加评论成功: ${postId}`)
		} catch (error) {
			console.error('[FeedManager] 添加评论失败:', error)
		}
	}

	/* 生成模拟数据 - 可配置时间基准点 */
	generateMockPosts(count: number, beforeTimestamp?: number): FeedPost[] {
		const posts: FeedPost[] = []
		const now = beforeTimestamp || Date.now()

		for (let i = 0; i < count; i++) {
			const timestamp = now - i * 1000 * 60 * Math.random() * 60 // 递减时间戳
			const postId = feedUtil.generatePostId()

			const post: FeedPost = {
				id: postId,
				userId: feedUtil.generateUserId(),
				username: this.randomName(),
				avatar: this.randomAvatar(),
				status: Math.random() > 0.3 ? feedUtil.randomStatus() : undefined, // 70%概率有状态
				content: Math.random() > 0.2 ? this.randomContent() : undefined, // 80%概率有内容
				image: Math.random() > 0.4 ? this.randomImage() : undefined, // 60%概率有图片
				createdAt: new Date(timestamp).toISOString(),
				likeCount: Math.floor(Math.random() * 1000),
				commentCount: Math.floor(Math.random() * 100),
				isLiked: Math.random() > 0.7,
				isExpanded: false,
				showComments: false,
				comments: this.generateMockComments(postId, Math.floor(Math.random() * 5)),
			}

			posts.push(post)
		}

		return posts
	}

	private randomName(): string {
		return CHINESE_NAMES[Math.floor(Math.random() * CHINESE_NAMES.length)]
	}

	private randomAvatar(): string {
		const avatars = [dummy.images.avatar, dummy.images.avatarFemale, dummy.images.avatarMale, 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70 + 1)]
		return avatars[Math.floor(Math.random() * avatars.length)]
	}

	private randomContent(): string {
		const template = CONTENT_TEMPLATES[Math.floor(Math.random() * CONTENT_TEMPLATES.length)]

		// 30%概率生成长内容
		if (Math.random() > 0.7) {
			const additionalContent = CONTENT_TEMPLATES.filter((t) => t !== template)
				.slice(0, Math.floor(Math.random() * 3 + 1))
				.join(' ')
			return template + ' ' + additionalContent
		}

		return template
	}

	private randomImage(): string {
		const images = [dummy.images.landscape, dummy.images.portrait, dummy.images.square, dummy.getImage('landscape'), dummy.getImage('portrait'), dummy.getImage('square')]
		return images[Math.floor(Math.random() * images.length)]
	}

	private generateMockComments(postId: string, count: number): Comment[] {
		const comments: Comment[] = []
		const now = Date.now()

		for (let i = 0; i < count; i++) {
			const timestamp = now - i * 1000 * 60 * Math.random() * 30 // 30分钟内随机时间
			const isReply = i > 0 && Math.random() > 0.7 // 30%概率是回复

			const comment: Comment = {
				id: feedUtil.generatePostId(),
				postId,
				userId: feedUtil.generateUserId(),
				username: this.randomName(),
				avatar: this.randomAvatar(),
				content: this.randomCommentContent(),
				replyTo: isReply ? comments[Math.floor(Math.random() * i)].username : undefined,
				createdAt: new Date(timestamp).toISOString(),
				likeCount: Math.floor(Math.random() * 50),
				isLiked: Math.random() > 0.8,
			}

			comments.push(comment)
		}

		return comments.reverse() // 最早的评论在前
	}

	private randomCommentContent(): string {
		return COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)]
	}
}

export const feedMgr = new FeedManager()
