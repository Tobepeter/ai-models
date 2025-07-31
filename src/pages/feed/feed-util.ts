import { differenceInMinutes, format, parseISO } from 'date-fns'
import { truncate } from 'lodash-es'
import { type FeedComment } from './feed-types'

/**
 * 信息流工具类 - 提供时间格式化、内容处理、分页游标等功能
 * 使用 date-fns 处理时间，lodash 处理字符串和防抖
 */
class FeedUtil {
	readonly MAX_CONTENT_LENGTH = 200 // 内容最大长度

	/* 格式化时间为中文相对时间 */
	formatTime(timestamp: string) {
		const now = new Date()
		const time = parseISO(timestamp)
		const diffInMinutes = differenceInMinutes(now, time)

		if (diffInMinutes < 1) return '刚刚'
		if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前` // 24小时内
		if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}天前` // 7天内
		return format(time, 'MM-dd') // 超过7天显示日期
	}

	truncateContent(content: string, maxLength: number = this.MAX_CONTENT_LENGTH) {
		return truncate(content, { length: maxLength, omission: '...' })
	}

	needsTruncate(content: string) {
		return content.length > this.MAX_CONTENT_LENGTH
	}

	extractHashtags(content: string): string[] {
		const hashtagRegex = /#[\u4e00-\u9fa5a-zA-Z0-9_]+/g // 支持中文话题标签
		return content.match(hashtagRegex) || []
	}

	genCursor(timestamp: number, postId: string) {
		return `${timestamp}_${postId}` // 格式: timestamp_postId
	}

	parseCursor(cursor: string): { timestamp: number; id: string } | null {
		try {
			const [timestampStr, id] = cursor.split('_')
			const timestamp = parseInt(timestampStr, 10)

			if (isNaN(timestamp) || !id) return null
			return { timestamp, id }
		} catch {
			return null
		}
	}

	generateUserId() {
		return `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
	}

	generatePostId() {
		return `post_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
	}

	async delay(min: number = 500, max: number = 1500): Promise<void> {
		const delay = Math.floor(Math.random() * (max - min + 1)) + min
		return new Promise((resolve) => setTimeout(resolve, delay))
	}

	/* 格式化数字显示 - 类似 numeral.js: 1000->1k, 1000000->1M, >999M显示999M+ */
	formatCount(count: number) {
		if (count < 1000) return count.toString()

		if (count < 1000000) {
			const k = count / 1000
			return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`
		}

		if (count < 999000000) {
			const m = count / 1000000
			return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`
		}

		return '999M+'
	}

	isValidImageUrl(url: string) {
		try {
			const urlObj = new URL(url)
			const pathname = urlObj.pathname.toLowerCase()
			return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(pathname) // 支持常见图片格式
		} catch {
			return false
		}
	}

	/** 创建新评论 */
	createComment(postId: string, content: string, replyTo?: string): FeedComment {
		return {
			id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
			postId,
			userId: 'current-user', // TODO: 从用户状态获取
			username: '当前用户', // TODO: 从用户状态获取
			avatar: '/placeholder-avatar.jpg', // TODO: 从用户状态获取
			content,
			replyTo,
			createdAt: new Date().toISOString(),
			likeCount: 0,
			isLiked: false,
		}
	}
}

export const feedUtil = new FeedUtil()
