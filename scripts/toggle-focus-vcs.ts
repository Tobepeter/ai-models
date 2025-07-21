import fs from 'fs'
import path from 'path'
import * as jsonc from 'jsonc-parser'
import { projectRoot } from './utils/env.ts'

const settingsPath = path.join(projectRoot, '.vscode', 'settings.json')
const excludes = [
	// == prettier break ==
	'.claude',
	'.cursor',
	'.env*',
	'.github',
	'.storybook',
	// 'backend/**',
	'dist/',
	'docs/',
	'node_modules/',
	'public/',
	// 'temp/',
	'.gitignore',
	'.prettierignore',
	'CLAUDE.md',
	'components.json',
	'eslint.config.js',
	'package-lock.json',
	'prettier.config.js',
	'README.md',
	'tsconfig.app.json',
	'tsconfig.json',
	'tsconfig.node.json',
	'vite.config.ts',
	'vitest.shims.d.ts',
].sort()

/**
 * vscode文件隐藏
 *
 * 一键聚焦模式，方便快速阅读代码
 */
function toggleFocus() {
	if (!fs.existsSync(settingsPath)) {
		console.warn('.vscode/settings.json not found')
		return
	}

	const content = fs.readFileSync(settingsPath, 'utf-8')
	const settings = jsonc.parse(content) || {}
	const hasExclude = settings['files.exclude']

	let edits: jsonc.Edit[]
	if (hasExclude) {
		edits = jsonc.modify(content, ['files.exclude'], undefined, {})
		console.log('Files restored')
	} else {
		const excludeMap: Record<string, boolean> = {}
		excludes.forEach((item) => (excludeMap[item] = true))
		edits = jsonc.modify(content, ['files.exclude'], excludeMap, {})
		console.log('Files hidden')
	}

	const updated = jsonc.applyEdits(content, edits)

	const formatEdits = jsonc.format(updated, undefined, { tabSize: 2, insertSpaces: true })
	const output = jsonc.applyEdits(updated, formatEdits)
	fs.writeFileSync(settingsPath, output)
}

toggleFocus()
