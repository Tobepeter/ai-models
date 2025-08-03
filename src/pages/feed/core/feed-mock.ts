import { feedUtil } from './feed-util'
import type { AppFeedPost, AppFeedComment } from '../feed-types'
import { dummy } from '@/utils/dummy'
import { random } from 'node-emoji'
import { faker } from '@faker-js/faker/locale/zh_CN'

const { number, datatype } = faker
const { arrayElement } = faker.helpers

// Mock评论分页结果
export interface MockCommentPageResult {
	comments: AppFeedComment[]
	next_cursor?: string
	has_more: boolean
	total: number
}

// 内容生成模板类型
// prettier-ignore
const CONTENT_TYPES = [
	'weather', 'movie', 'travel', 'learning', 'food', 'work', 
	'family', 'reading', 'photo', 'sport', 'cafe', 'hobby',
	'friend', 'skill', 'home', 'fitness', 'achievement', 'pet',
	'discovery', 'gift', 'mood', 'tech', 'music', 'art'
] as const

// 评论情感类型
// prettier-ignore
const COMMENT_SENTIMENTS = [
	'positive', 'supportive', 'funny', 'grateful', 'agree',
	'amazed', 'thoughtful', 'encouraging', 'relatable'
] as const

/**
 * 信息流Mock管理器
 */
class FeedMock {
	// 生成模拟数据 - 可配置时间基准点
	genPosts(count: number, beforeTimestamp?: number): AppFeedPost[] {
		const posts: AppFeedPost[] = []
		const now = beforeTimestamp || Date.now()

		for (let i = 0; i < count; i++) {
			const timestamp = now - i * 1000 * 60 * number.int({ min: 1, max: 60 }) // 随机时间间隔
			const post = this.genSinglePost(timestamp)
			posts.push(post)
		}

		return posts
	}

	// 生成单个帖子
	genSinglePost(timestamp?: number): AppFeedPost {
		const now = timestamp || Date.now()
		const postId = feedUtil.generatePostId()
		const totalComments = number.int({ min: 5, max: 100 })
		const preloadedCount = Math.min(totalComments, number.int({ min: 3, max: 8 }))

		// 生成预加载评论
		const preloadedComments = this.genComments(postId, preloadedCount, now)
		const preloadedCommentsCursor = preloadedCount < totalComments ? this.genCommentCursor(preloadedComments[preloadedComments.length - 1]) : undefined

		const post: AppFeedPost = {
			id: postId,
			user_id: feedUtil.generateUserId(),
			username: faker.person.fullName(),
			avatar: this.randomAvatar(),
			status: datatype.boolean({ probability: 0.7 }) ? random().emoji : undefined,
			content: datatype.boolean({ probability: 0.8 }) ? this.randomContent() : undefined,
			image_url: datatype.boolean({ probability: 0.6 }) ? this.randomImage() : undefined,
			created_at: new Date(now).toISOString(),
			like_count: number.int({ min: 0, max: 1000 }),
			comment_count: totalComments,
			preloaded_comments: preloadedComments,
			is_liked: datatype.boolean({ probability: 0.3 }),
			isExpanded: false,
		} as AppFeedPost & { preloaded_comments_cursor?: string } // 临时类型扩展

		// 添加mock字段
		;(post as any).preloaded_comments_cursor = preloadedCommentsCursor

		return post
	}

	// 创建用户自定义的帖子
	createUserPost(content: string, image?: string): AppFeedPost {
		const postId = feedUtil.generatePostId()
		const now = Date.now()

		return {
			id: postId,
			user_id: 'current-user', // 当前用户ID
			username: '我', // 当前用户名
			avatar: this.randomAvatar(),
			status: undefined, // 不支持心情状态
			content,
			image_url: image,
			created_at: new Date(now).toISOString(),
			like_count: 0,
			comment_count: 0,
			preloaded_comments: [],
			is_liked: false,
			isExpanded: false,
		}
	}

	// 生成模拟评论
	genComments(postId: string, count: number, baseTimestamp?: number): AppFeedComment[] {
		const comments: AppFeedComment[] = []
		const now = baseTimestamp || Date.now()

		for (let i = 0; i < count; i++) {
			const timestamp = now - i * 1000 * 60 * number.int({ min: 1, max: 120 }) // 2小时内随机时间
			const isReply = i > 2 && datatype.boolean({ probability: 0.4 }) // 40%概率是回复

			const comment: AppFeedComment = {
				id: feedUtil.generatePostId(),
				post_id: postId,
				user_id: feedUtil.generateUserId(),
				username: faker.person.fullName(),
				avatar: this.randomAvatar(),
				content: this.randomCommentContent(isReply),
				reply_to: isReply ? comments[number.int({ min: 0, max: Math.min(i - 1, 9) })].username : undefined,
				created_at: new Date(timestamp).toISOString(),
				like_count: number.int({ min: 0, max: 100 }),
				isLiked: datatype.boolean({ probability: 0.15 }),
			}

			comments.push(comment)
		}

		return comments.reverse() // 最早的评论在前
	}

	// 生成单个评论 - 用于添加新评论
	genComment(postId: string, content: string, replyTo?: string): AppFeedComment {
		return {
			id: feedUtil.generatePostId(),
			post_id: postId,
			user_id: 'current_user_id',
			username: '当前用户',
			avatar: dummy.images.avatar,
			content,
			reply_to: replyTo,
			created_at: new Date().toISOString(),
			like_count: 0,
			isLiked: false,
		}
	}

	// 生成评论cursor
	genCommentCursor(comment: AppFeedComment) {
		const timestamp = new Date(comment.created_at).getTime()
		return `comment_${comment.id}_${timestamp}`
	}

	// 解析评论cursor
	parseCommentCursor(cursor: string): { commentId: string; timestamp: number } | null {
		const match = cursor.match(/^comment_(.+)_(\d+)$/)
		if (!match) return null
		return {
			commentId: match[1],
			timestamp: parseInt(match[2], 10),
		}
	}

	// 生成评论分页数据
	genCommentPage(postId: string, cursor?: string, limit = 20): MockCommentPageResult {
		const totalComments = number.int({ min: 20, max: 150 })
		let startTimestamp = Date.now() - 1000 * 60 * 60 * 24 // 1天前开始

		// 如果有cursor，从cursor位置开始
		if (cursor) {
			const parsed = this.parseCommentCursor(cursor)
			if (parsed) {
				startTimestamp = parsed.timestamp - 1000 * 60 // 从cursor时间前1分钟开始
			}
		}

		const comments = this.genComments(postId, limit, startTimestamp)
		const hasMore = comments.length >= limit && number.int({ min: 1, max: 10 }) > 3 // 70%概率有更多
		const nextCursor = hasMore && comments.length > 0 ? this.genCommentCursor(comments[comments.length - 1]) : undefined

		return {
			comments,
			next_cursor: nextCursor,
			has_more: hasMore,
			total: totalComments,
		}
	}

	// 随机生成头像URL
	private randomAvatar() {
		const staticAvatars = [dummy.images.avatar, dummy.images.avatarFemale, dummy.images.avatarMale]
		const dynamicAvatar = `https://i.pravatar.cc/150?img=${number.int({ min: 1, max: 70 })}`
		return arrayElement([...staticAvatars, dynamicAvatar])
	}

	// 随机生成帖子内容
	private randomContent() {
		const contentType = arrayElement(CONTENT_TYPES)
		const result = this.genContentByType(contentType)

		// 30%概率生成长内容
		if (datatype.boolean({ probability: 0.3 })) {
			const additionalType = arrayElement(CONTENT_TYPES.filter((t) => t !== contentType))
			return result + ' ' + this.genContentByType(additionalType)
		}

		return result
	}

	// 根据类型生成特定内容
	private genContentByType(type: (typeof CONTENT_TYPES)[number]) {
		switch (type) {
			case 'weather':
				return `今天${arrayElement(['天气真不错', '阳光明媚', '微风习习', '下了小雨'])}，${arrayElement(['心情也特别好', '很适合出门', '在家也很舒服'])}！`
			case 'movie':
				return `刚刚看了${arrayElement(['一部很棒的电影', '一个有趣的纪录片', '经典老片'])}，${arrayElement(['强烈推荐', '值得一看', '感动到了'])}。`
			case 'travel':
				return `${arrayElement(['周末', '昨天', '今天'])}和${arrayElement(['朋友们', '家人', '同事'])}一起去${arrayElement(['爬山', '海边', '公园', '古镇'])}，${arrayElement(['风景超美', '很放松', '收获满满'])}的。`
			case 'food':
				return `今天${arrayElement(['做了', '尝试了', '品尝了'])}${arrayElement(['一道新菜', '家常菜', '特色小吃'])}，${arrayElement(['味道还不错', '超级好吃', '下次还要做'])}呢。`
			case 'work':
				return `${arrayElement(['工作', '项目', '任务'])}虽然${arrayElement(['忙碌', '有挑战', '紧张'])}，但是${arrayElement(['很有成就感', '学到很多', '团队配合很好'])}。`
			case 'reading':
				return `读了${arrayElement(['一本很有意思的书', '最新的小说', '技术文章'])}，${arrayElement(['收获颇丰', '很有启发', '推荐给大家'])}。`
			case 'photo':
				return `今天的${arrayElement(['日落', '云彩', '风景', '花朵'])}特别美，忍不住拍了${arrayElement(['很多照片', '好几张', '一堆'])}。`
			case 'sport':
				return `${arrayElement(['运动', '健身', '跑步', '瑜伽'])}完之后感觉${arrayElement(['整个人都精神了', '很舒服', '充满活力'])}。`
			default:
				return faker.lorem.sentence({ min: 8, max: 15 })
		}
	}

	// 随机生成图片URL
	private randomImage() {
		const staticImages = [dummy.images.landscape, dummy.images.portrait, dummy.images.square]
		const dynamicImages = [dummy.getImage('landscape'), dummy.getImage('portrait'), dummy.getImage('square')]
		return arrayElement([...staticImages, ...dynamicImages])
	}

	// 随机生成评论内容
	private randomCommentContent(isReply = false) {
		const sentiment = arrayElement(COMMENT_SENTIMENTS)
		return this.genCommentContent(sentiment, isReply)
	}

	// 根据情感类型生成评论内容
	private genCommentContent(sentiment: (typeof COMMENT_SENTIMENTS)[number], isReply = false) {
		if (isReply) {
			switch (sentiment) {
				case 'positive':
					return faker.helpers.arrayElement(['哈哈，是的', '同意你的看法', '说得对'])
				case 'supportive':
					return faker.helpers.arrayElement(['我也这么觉得', '确实如此', '完全赞同'])
				case 'funny':
					return faker.helpers.arrayElement(['哈哈哈', '笑死我了', '太搞笑了'])
				case 'grateful':
					return faker.helpers.arrayElement(['谢谢分享', '学到了', '受教了'])
				case 'agree':
					return faker.helpers.arrayElement(['有道理', '很棒的观点', '我也有同感'])
				default:
					return faker.helpers.arrayElement(['说得太好了', '很有意思', '值得深思'])
			}
		}

		switch (sentiment) {
			case 'positive':
				return faker.helpers.arrayElement(['说得很对！', '太棒了！', '很不错呢'])
			case 'supportive':
				return faker.helpers.arrayElement(['支持！', '赞同你的观点', '完全同意'])
			case 'funny':
				return faker.helpers.arrayElement(['哈哈哈，太有趣了', '笑死我了', '确实是这样'])
			case 'grateful':
				return faker.helpers.arrayElement(['学到了，谢谢分享', '受益匪浅', '收藏了'])
			case 'agree':
				return faker.helpers.arrayElement(['同感，我也是这样想的', '确实如此', '很有道理'])
			case 'amazed':
				return faker.helpers.arrayElement(['太厉害了', '佩服佩服', '好羡慕啊'])
			case 'thoughtful':
				return faker.helpers.arrayElement(['值得思考', '很有启发', '说到心坎里了'])
			case 'encouraging':
				return faker.helpers.arrayElement(['加油！', '期待更多分享', '继续努力'])
			case 'relatable':
				return faker.helpers.arrayElement(['我也遇到过类似的情况', '有同样的感受', '说出了我的心声'])
			default:
				return faker.helpers.arrayElement(['写得真好', '深有同感', '非常认同'])
		}
	}

	// 获取刷新延迟
	getRefreshDelay() {
		return number.int({ min: 800, max: 1200 })
	}

	// 获取加载更多延迟
	getLoadMoreDelay() {
		return number.int({ min: 500, max: 1000 })
	}

	// 获取点赞操作延迟
	getLikeDelay() {
		return number.int({ min: 200, max: 500 })
	}

	// 获取评论操作延迟
	getCommentDelay() {
		return number.int({ min: 300, max: 800 })
	}
}

export const feedMock = new FeedMock()
