/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { getOssPlugin } from './config/oss'

// https://vite.dev/config/
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// OSS 配置
const enableOss = false // 先设置为 false，不启用 OSS 上传

// GitHub Pages 配置
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'
const isProduction = process.env.NODE_ENV === 'production'

// 获取 base 路径
const getBasePath = () => {
	if (!isProduction) return '/'

	// 如果在 GitHub Actions 中构建，使用仓库名作为 base path
	if (isGitHubActions) {
		const repository = process.env.GITHUB_REPOSITORY || ''
		const repoName = repository.split('/')[1] || 'ai-models'
		return `/${repoName}/`
	}

	// 如果启用了 OSS，使用 OSS 路径
	if (enableOss) {
		return '/ai-models/'
	}

	// 默认 GitHub Pages 路径
	return '/ai-models/'
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		// NOTE: 有点奇怪的类型问题
		// @ts-ignore
		...getOssPlugin(), // OSS 上传插件配置 
	],
	// 根据环境设置 base 路径
	base: getBasePath(),
	server: {
		host: '0.0.0.0', // 允许局域网访问
		port: 5173,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	assetsInclude: ['**/*.md'],
	test: {
		projects: [
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({
						configDir: path.join(dirname, '.storybook'),
					}),
				],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: 'playwright',
						instances: [
							{
								browser: 'chromium',
							},
						],
					},
					setupFiles: ['.storybook/vitest.setup.ts'],
				},
			},
		],
	},
})
