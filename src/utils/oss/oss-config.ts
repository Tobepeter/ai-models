class OssConfig {
	serverUrl = 'http://localhost:3001'
	region = 'oss-cn-shenzhen'
	bucket = 'tobeei-bucket'
	stsAheadMin = 5 // sts提前过期时间，分钟

	get endpoint() {
		return `https://${this.region}.aliyuncs.com`
	}

	get apiBaseUrl() {
		return `${this.serverUrl}/api/oss`
	}
}

export const ossConfig = new OssConfig()
