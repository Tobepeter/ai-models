import { truncate } from 'lodash-es'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import data from '@emoji-mart/data'

dayjs.extend(relativeTime) // 配置中文相对时间
dayjs.locale('zh-cn')

/**
 * 信息流工具类 - 提供时间格式化、内容处理、分页游标等功能
 * 使用 dayjs 处理时间，lodash 处理字符串和防抖
 */
class FeedUtil {
	readonly MAX_CONTENT_LENGTH = 200 // 内容最大长度
	readonly STATUS_EMOJIS = this.getAllEmojis()

	/* 从emoji-mart数据中获取所有表情 */
	getAllEmojis(): string[] {
		const emojis: string[] = []
		const emojiMartData = data as any

		const categories = emojiMartData.categories || []
		const emojiMapping = emojiMartData.emojis || {}

		for (const category of categories) {
			const categoryEmojis = category.emojis || []
			for (const emojiId of categoryEmojis) {
				const emoji = emojiMapping[emojiId]
				if (emoji?.skins?.[0]?.native) {
					emojis.push(emoji.skins[0].native)
				}
			}
		}


		return emojis.length > 0 ? emojis : ['😀', '😃', '😄'] // 回退到默认表情
	}

	/* 格式化时间为中文相对时间 */
	formatTime(timestamp: string) {
		const now = dayjs()
		const time = dayjs(timestamp)
		const diffInMinutes = now.diff(time, 'minute')

		if (diffInMinutes < 1) return '刚刚'
		if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前` // 24小时内
		if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}天前` // 7天内
		return time.format('MM-DD') // 超过7天显示日期
	} // console.log(emojis) // 遍历所有分类

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

	generateCursor(timestamp: number, postId: string) {
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

	randomStatus() {
		return this.STATUS_EMOJIS[Math.floor(Math.random() * this.STATUS_EMOJIS.length)]
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
}

export const feedUtil = new FeedUtil()
