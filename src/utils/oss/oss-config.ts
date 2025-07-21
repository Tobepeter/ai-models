import { isDev } from '@/utils/env'
import { requestConfig } from '@/config/request-config'

class OssConfig {
	stsAheadMin = 5 // sts提前过期时间，分钟

	get apiBaseUrl() {
		const useGoDev = true
		const { devOssNode, devGo, prod } = requestConfig.serverUrls

		if (isDev) {
			return useGoDev ? devGo : devOssNode
		} else {
			return prod
		}
	}
}

export const ossConfig = new OssConfig()
