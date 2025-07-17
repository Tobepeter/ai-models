import path from 'path'
import { ossEnable, ossBucket, ossRegion, ossAccessKeyId, ossAccessKeySecret, ossPrefix, projectRootDir, repoName, isDev } from './env'
import VitePluginOss from 'vite-plugin-oss'

export const getOssPlugin = () => {
	if (isDev) return [] // 开发环境不启用 oss
	if (!checkOssValid()) return []
	const distFolder = path.resolve(projectRootDir, 'dist')

	const ossFrom = path.join(distFolder, '**')

	const setOssPath = (filePath: string) => {
		const relPath = path.relative(distFolder, filePath)
		const msg = validateOssRelPath(relPath)

		// 如果路径不合法，直接退出
		if (msg) {
			console.error(`[oss] ${msg}`)
			process.exit(1)
		}

    // - 关于 index.html
    // 其实可以排除 index.html，不过上传了当做归档用吧
    // 用 oss 默认地址访问这个 index 在 spa 是看不了的

    // TODO: 有条件可以 oss 清空 prefix 目录
    //  或者版本控制（云资源紧张可以轮换机制）

		// NOTE: 注意，如果自定义 setOssPath 函数，会忽略 dist 作为 prefix
		//  某种角度可以理解 setOssPath 其实是和 dist 参数是互斥的
		const ossPath = path.join(ossPrefix!, relPath)
		return path.posix.normalize(ossPath)
	}

	return [
		VitePluginOss({
			from: ossFrom, // 上传源目录
			dist: ossPrefix, // OSS 目标目录
			region: ossRegion, // OSS 区域
			accessKeyId: ossAccessKeyId,
			accessKeySecret: ossAccessKeySecret,
			bucket: ossBucket,
			// deleteOrigin: true, // 删除源文件
			// deleteEmptyDir: true, // 删除空目录, 需要配合 deleteOrigin 使用
			// test: true, // 测试模式，不实际上传
			quitWpOnError: true, // 如果上传失败，直接退出

			/**
			 * 关于 setOssPath 函数
			 *
			 * 其实这个函数不是必须的
			 * 网上查阅资料，默认 fast-glob 并不支持获取 relative dir
			 *
			 * 貌似是 oss 插件自己做的
			 * 比如 from: my-dir/**
			 * 会自动获取字符串提取类似方式，理解 my-dir 作为相对目录
			 *
			 */
			setOssPath,
		}),
	]
}

export const checkOssValid = () => {
	if (!ossEnable) return false

	if (!ossBucket || !ossRegion || !ossAccessKeyId || !ossAccessKeySecret) {
		console.error('[oss] config is not valid, please check your oss config')
		return false
	}

	if (!checkOssPrefixValid()) {
		return false
	}

	return true
}

export const checkOssPrefixValid = () => {
	if (!ossPrefix) {
		console.error('[oss] prefix is not set, please check your oss config')
		return false
	}

	if (ossPrefix === '/') {
		console.error('[oss] not support upload to oss root directory')
		return false
	}

	// 不能用 / 开头
	if (ossPrefix.startsWith('/')) {
		console.error('[oss] prefix must not start with /')
		return false
	}

  // 自己的规则，必须从特定目录开始，且包含项目名称
  const myPrefixRule = `/web/${repoName}/`

	// 必须以 / 结尾
	if (!ossPrefix.endsWith('/')) {
		console.error('[oss] prefix must end with /')
		return false
	}

	// 必须是 posix 路径
	if (ossPrefix.includes('\\')) {
		console.error('[oss] prefix must be a posix path')
		return false
	}

	return true
}

/**
 * 验证相对路径是否合法
 *
 * NOTE：其实配置上下面的问题大概不会触发
 */
export const validateOssRelPath = (relPath: string) => {
	// 不能包含 ../
	if (relPath.includes('../')) {
		return '[oss] relPath must not contain ../'
	}

	// 不能是绝对路径（在 windows 下，不同盘符的目录会出现）
	if (path.isAbsolute(relPath)) {
		return '[oss] relPath must not be an absolute path'
	}

	// 不能是当前目录（虽然一般不会触发）
	if (relPath === '.') {
		return '[oss] relPath must not be .'
	}

	return ''
}
