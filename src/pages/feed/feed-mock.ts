import { feedUtil } from './feed-util'
import { type FeedPost, type Comment } from './feed-store'
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
	'这个想法不错',
	'我觉得可以试试',
	'有同样的感受',
	'写得真好',
	'深有同感',
	'值得思考',
	'很有启发',
	'说出了我的心声',
	'非常认同',
	'学习了',
	'收藏了',
	'转发给朋友看看',
	'太真实了',
	'笑死我了',
	'确实是这样',
	'我也想试试',
	'好羡慕啊',
	'太厉害了',
	'佩服佩服',
	'加油！',
]

/* 回复内容模板 */
const REPLY_TEMPLATES = [
	'哈哈，是的',
	'同意你的看法',
	'我也这么觉得',
	'说得对',
	'确实如此',
	'有道理',
	'学到了',
	'谢谢分享',
	'受教了',
	'很棒的观点',
	'我也有同感',
	'说得太好了',
	'完全赞同',
	'很有意思',
	'值得深思',
]

/**
 * 信息流Mock管理器
 * 处理Mock数据生成相关的工作
 */
class FeedMock {
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
				showComments: false, // 控制评论输入框的展开状态
				comments: this.generateMockComments(postId, Math.floor(Math.random() * 15 + 5)), // 5-20条评论
			}

			posts.push(post)
		}

		return posts
	}

	/* 生成模拟评论 */
	generateMockComments(postId: string, count: number): Comment[] {
		const comments: Comment[] = []
		const now = Date.now()

		for (let i = 0; i < count; i++) {
			const timestamp = now - i * 1000 * 60 * Math.random() * 120 // 2小时内随机时间
			const isReply = i > 2 && Math.random() > 0.6 // 40%概率是回复（前3条不是回复）

			const comment: Comment = {
				id: feedUtil.generatePostId(),
				postId,
				userId: feedUtil.generateUserId(),
				username: this.randomName(),
				avatar: this.randomAvatar(),
				content: isReply ? this.randomReplyContent() : this.randomCommentContent(),
				replyTo: isReply ? comments[Math.floor(Math.random() * Math.min(i, 10))].username : undefined, // 回复最近10条中的一条
				createdAt: new Date(timestamp).toISOString(),
				likeCount: Math.floor(Math.random() * 100),
				isLiked: Math.random() > 0.85,
			}

			comments.push(comment)
		}

		return comments.reverse() // 最早的评论在前
	}

	/* 生成单个评论 - 用于添加新评论 */
	generateComment(postId: string, content: string, replyTo?: string): Comment {
		return {
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

	private randomCommentContent(): string {
		return COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)]
	}

	private randomReplyContent(): string {
		return REPLY_TEMPLATES[Math.floor(Math.random() * REPLY_TEMPLATES.length)]
	}
}

export const feedMock = new FeedMock()