import { aiAgentMgr } from '@/utils/ai-agent/ai-agent-mgr'
import { AIPlatform, MediaType } from '@/utils/ai-agent/types'
import { isDev } from '@/utils/env'
import { storage } from '@/utils/storage'
import { Film, Image, MessageCircle, Volume2 } from 'lucide-react'
import { ElementType } from 'react'
import { useChatStore } from './chat-store'
import { ChatPersist } from './chat-type'

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
			aiAgentMgr.setModel(currModel)
		}

		store.setData({
			currPlatform: platform,
			currModel: currModel,
			currMediaType: currMediaType,
		})
	}

	restorePersist() {
		const persistData = this.loadPersist()
		if (!persistData) {
			const defaultPlatform = isDev ? AIPlatform.Mock : AIPlatform.Silicon
			this.switchPlatform(defaultPlatform)
			return
		}
		this.switchPlatform(persistData.platform)
		this.setModel(persistData.model, true)
		this.setStream(persistData.stream ?? true, true) // 默认启用流式
	}

	setModel(model: string, fromPersist = false) {
		const store = useChatStore.getState()

		if (!aiAgentMgr.isValidModel(model)) {
			console.error(`[ChatHelper] setModel but model ${model} is not valid`)
			return
		}

		aiAgentMgr.setModel(model)
		store.setData({
			currModel: model,
			currMediaType: aiAgentMgr.getModelMedia(),
		})

		if (!fromPersist) {
			this.persist()
		}
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

		this.persist()
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

	setStream(stream: boolean, fromPersist = false) {
		const store = useChatStore.getState()
		store.setData({ currStream: stream })
		
		if (!fromPersist) {
			this.persist()
		}
	}

	persist() {
		const store = useChatStore.getState()
		const chatPersist: ChatPersist = {
			platform: store.currPlatform,
			model: store.currModel,
			stream: store.currStream,
		}
		storage.setAppData({ chatPersist })
	}

	loadPersist(): ChatPersist | null {
		const appData = storage.getAppData()
		return appData.chatPersist || null
	}
}

export const chatHelper = new ChatHelper()
