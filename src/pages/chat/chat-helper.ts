import { aiAgentConfig } from '@/utils/ai-agent/ai-agent-config'
import { aiAgentMgr } from '@/utils/ai-agent/ai-agent-mgr'
import { AIPlatform, MediaType, PlatformConfig } from '@/utils/ai-agent/types'
import { useChatStore } from './chat-store'
import { ElementType } from 'react'
import { MessageCircle, Image, Volume2, Film } from 'lucide-react'

class ChatHelper {
	switchPlatform(platform: AIPlatform) {
		const store = useChatStore.getState()
		aiAgentMgr.switchPlatform(platform)

		// 如果没有model，默认选一个
		let currModel = aiAgentMgr.getModel()
		let currMediaType = aiAgentMgr.getModelMedia()
		if (!currModel) {
			const mediaList: MediaType[] = ['text', 'image', 'audio', 'video']
			for (const media of mediaList) {
				currModel = this.pickModel(media)
				if (currModel) {
					currMediaType = media
					break
				}
			}
		}

		store.setData({
			currPlatform: platform,
			currModel: currModel,
			currMediaType: currMediaType,
		})
	}

	setModel(model: string) {
		const store = useChatStore.getState()
		aiAgentMgr.setModel(model)
		store.setData({
			currModel: model,
			currMediaType: aiAgentMgr.getModelMedia(),
		})
	}

	setMedia(media: MediaType) {
		const store = useChatStore.getState()

		// 先找找有没有合适的model
		const model = this.pickModel(media)
		if (!model) {
			console.error(`[ChatHelper] setMedia but no model for ${media} on ${store.currPlatform}`)
			return
		}

		store.setData({
			currMediaType: media,
			currModel: model,
		})
	}

	pickModel(media: MediaType) {
		const platformConfig = aiAgentMgr.getPlatformConfig()
		return platformConfig.models[media][0]
	}

	mediaConfig: Record<MediaType, { icon: ElementType; label: string; emoji: string }> = {
		text: { icon: MessageCircle, label: '文本', emoji: '💬' },
		image: { icon: Image, label: '图片', emoji: '🖼️' },
		audio: { icon: Volume2, label: '音频', emoji: '🔊' },
		video: { icon: Film, label: '视频', emoji: '🎥' },
	}

	getModelOptions() {
		const platformConfig = aiAgentMgr.getPlatformConfig()
		const options: { value: string; label: string }[] = []

		const mediaTypes = Object.keys(platformConfig.models) as MediaType[]
		for (const mediaType of mediaTypes) {
			const models = platformConfig.models[mediaType]
			models.forEach((model) => {
				const suffix = this.mediaConfig[mediaType].emoji
				const label = `${model} ${suffix}`
				options.push({
					value: model,
					label,
				})
			})
		}
		return options
	}

	/** 获取平台显示名称 */
	getPlatformDisplayName(platform: AIPlatform): string {
		switch (platform) {
			case AIPlatform.Mock:
				return 'Mock (本地测试)'
			case AIPlatform.Silicon:
				return 'SiliconFlow'
			case AIPlatform.OpenRouter:
				return 'OpenRouter'
			default:
				return platform
		}
	}
}

export const chatHelper = new ChatHelper()
