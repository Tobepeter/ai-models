/// <reference types="vitest/config" />
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import packageJson from './package.json'

const isDev = process.env.NODE_ENV === 'development'
const ossEnable = process.env.VITE_OSS_DEPLOY_ENABLE === 'true'
const ossBucket = process.env.VITE_OSS_BUCKET || ''
const ossRegion = process.env.VITE_OSS_REGION || ''

const repoName = packageJson.name

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	plugins: [react(), tailwindcss()],
	base: getBaseUrl(),
	server: {
		host: '0.0.0.0', // 允许局域网访问
		port: Number(process.env.VITE_PORT) || 5173,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		projects: [
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({
						configDir: path.join(__dirname, '.storybook'),
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

function getBaseUrl() {
	if (isDev) {
		return '/'
	}

	if (ossEnable) {
		const base = `https://${ossBucket}.${ossRegion}.aliyuncs.com`
		return `${base}/web/${repoName}/`
	}

	return '/'
}
