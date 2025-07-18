class OssConfig {
	serverUrl = 'http://localhost:3001'
	stsAheadMin = 5 // sts提前过期时间，分钟

	get apiBaseUrl() {
		return `${this.serverUrl}/api/oss`
	}
}

export const ossConfig = new OssConfig()
