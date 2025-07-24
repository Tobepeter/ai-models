import { isDev } from '@/utils/env'
import { requestConfig } from '@/config/request-config'

class OssConfig {
	stsAheadMin = 5 // sts提前过期时间，分钟

	get apiBaseUrl() {
		const useGoDev = true
		const { devOssNode, serverUrl } = requestConfig

		if (isDev && useGoDev) {
			return devOssNode
		} else {
			return serverUrl
		}
	}
}

export const ossConfig = new OssConfig()
