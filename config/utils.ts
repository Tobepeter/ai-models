import { ossEnable, isGithub, isProd } from './env'

// 获取 base 路径
export const getBasePath = () => {
	if (!isProd) return '/'

	// NOTE: 注意，oss 优先级最高
	if (ossEnable) {
		return '/ai-models/'
	}

	// 如果在 GitHub Actions 中构建，使用仓库名作为 base path
	if (isGithub) {
		return getGithubBasePath()
	}

	// 默认 GitHub Pages 路径
	return '/ai-models/'
}

/**
 * 计算 github 仓库的 base path
 *
 * 网上了解的规则，不确定是全面
 *
 * 格式固定为 <owner>/<repository>
 *
 * url 友好
 * 1. 大写转小写，如 My-Repo 转 my-repo
 * 2. 空格转 -，如 my-repo 转 my-repo
 */
export const getGithubBasePath = () => {
	let result = '/'
	if (!isGithub) {
		console.error('not in github actions')
		return result
	}

	const repository = process.env.GITHUB_REPOSITORY || ''
	const repoName = repository.split('/')[1] || ''

	if (!repoName) {
		console.error('GITHUB_REPOSITORY is not set or not valid')
		return result
	}

	result = repoName.toLowerCase()
	result = result.replace(/\s+/g, '-')
	result = result.replace(/[^a-z0-9-]/g, '')

	return `/${result}/`
}
