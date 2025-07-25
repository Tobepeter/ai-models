import { aiAgentMgr } from '@/utils/ai-agent/ai-agent-mgr'
import { AIPlatform, MediaType } from '@/utils/ai-agent/types'
import { isDev } from '@/utils/env'
import { storage, storageKeys } from '@/utils/storage'
import { Film, Image, MessageCircle, Volume2 } from 'lucide-react'
import { ElementType } from 'react'
import { useChatStore } from './chat-store'
import { ChatPersist } from './chat-type'

class ChatHelper {
	// 切换平台 自动选择model 和 mediaType
	changePlatf(platform: AIPlatform) {
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

	// 恢复持久化数据
	restorePersist() {
		const data = this.loadPersist()
		if (!data) {
			const defPf = isDev ? AIPlatform.Mock : AIPlatform.Silicon
			this.changePlatf(defPf)
			return
		}
		const { platform, model, stream } = data
		this.changePlatf(platform)
		this.setModel(model, true)
		this.setStream(stream ?? true, true) // 默认启用流式
	}

	// 设置model 自动选择mediaType
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

	// 设置mediaType 自动选择model
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

	// 根据mediaType 选择model
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
		useChatStore.setState({ currStream: stream })

		if (!fromPersist) {
			this.persist()
		}
	}

	persist() {
		const s = useChatStore.getState()
		const chatPersist: ChatPersist = {
			platform: s.currPlatform,
			model: s.currModel,
			stream: s.currStream,
		}
		// storage.setAppData({ chatPersist })
		localStorage.setItem(storageKeys.chat, JSON.stringify(chatPersist))
	}

	loadPersist(): ChatPersist | null {
		try {
			const chatPersist = localStorage.getItem(storageKeys.chat)
			return chatPersist ? JSON.parse(chatPersist) : null
		} catch (e) {
			console.error(`[ChatHelper] loadPersist error: ${e}`)
			return null
		}
	}
}

export const chatHelper = new ChatHelper()
