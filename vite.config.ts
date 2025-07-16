/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// OSS 配置
const enableOss = false // 先设置为 false，不启用 OSS 上传

// 动态导入 OSS 插件
const getOssPlugin = () => {
	if (!enableOss) return []

	// 只有在启用 OSS 时才导入插件
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const VitePluginOss = require('vite-plugin-oss')

	return [
		VitePluginOss({
			from: './dist/**', // 上传源目录
			dist: '/ai-models', // OSS 目标目录
			region: 'oss-cn-shenzhen', // OSS 区域
			accessKeyId: process.env.OSS_ACCESS_KEY_ID || '', // AccessKey ID
			accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '', // AccessKey Secret
			bucket: 'tobeei-bucket', // 存储桶名称
			setOssPath: (filePath: string) => {
				// 设置文件在 OSS 上的路径
				const index = filePath.lastIndexOf('dist')
				const path = filePath.substring(index + 4)
				return path.replace(/\\/g, '/')
			},
		}),
	]
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		// OSS 上传插件配置
		...getOssPlugin(),
	],
	// 根据环境设置 base 路径
	base: process.env.NODE_ENV === 'production' ? (enableOss ? '/ai-models/' : '/ai-models/') : '/',
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
