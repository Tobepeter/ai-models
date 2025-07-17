import path from 'path'
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
			return this.getOssPrefixBase()
		}

		return '/'
	}

	/** OSS地址 */
	getOssBase() {
		return `https://${ossBucket}.${ossRegion}.aliyuncs.com`
	}

	/** 项目的upload目录 */
	getOssPrefixBase() {
		const base = this.getOssBase()
		return path.join(base, ossPrefix)
	}
}

export const pathUtil = new PathUtil()
