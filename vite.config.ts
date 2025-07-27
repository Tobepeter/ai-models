/// <reference types="vitest/config" />
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import { pathUtil } from './scripts/utils/path-util'

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	plugins: [react(), tailwindcss()],
	base: pathUtil.getBaseUrl(),
	server: {
		host: '0.0.0.0', // 允许局域网访问
		port: Number(process.env.VITE_PORT) || 5173,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	define: {
		__OSS_BASE__: JSON.stringify(pathUtil.getOssBase()),
		__OSS_BASE_PREFIX__: JSON.stringify(pathUtil.getOssBasePrefix()),
		__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		__BUILD_TIME_LOCAL__: JSON.stringify(new Date().toLocaleString()),
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
