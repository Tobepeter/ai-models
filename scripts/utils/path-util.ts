import { isProd, ossBucket, ossEnable, ossPrefix, ossRegion } from './env'

class PathUtil {
	/**
	 * 资源定位地址
	 *
	 * 注意：vite 的 base 路径，其实指的是资源的路径
	 * routerBase 不一定是这个值，比如资源都放在 OSS 上
	 */
	getBaseUrl() {
		if (!isProd) return '/'

		if (ossEnable) {
			return this.getOssBasePrefix()
		}

		return '/'
	}

	/** OSS地址 */
	getOssBase() {
		return `https://${ossBucket}.${ossRegion}.aliyuncs.com`
	}

	/** 项目的upload目录 */
	getOssBasePrefix() {
		// NOTE: https有连个斜杠，用 path.join 会去掉一个，url需要手动拼接
		return `${this.getOssBase()}/${ossPrefix}`
	}
}

export const pathUtil = new PathUtil()
