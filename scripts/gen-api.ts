import { spawn } from 'child_process'
import chokidar from 'chokidar'
import { Command } from 'commander'
import { existsSync, mkdirSync } from 'fs'
import { debounce } from 'lodash-es'
import { join } from 'path'
import { generateApi } from 'swagger-typescript-api'
import { projectRoot } from './utils/env'
import { genApiTool } from './utils/gen-api-tool'

const program = new Command()

program.option('-w, --watch', '监听 backend/**/*.go 文件变更，自动生成 swagger 并更新 api types')
program.option('-r, --remote', '使用远程 swagger 地址而非本地文件')
program.option('-s, --skip-swag', '跳过 swagger 生成步骤，直接使用现有的 swagger.json')
program.parse()

const opts = program.opts()
const useLocal = !opts.remote // 默认使用本地，除非指定 --remote
const bePath = join(projectRoot, 'backend')
const skipSwag = opts.skipSwag

// 配置常量
const DEBOUNCE_DELAY = 500 // 防抖延迟 (ms)

const cfg = {
	local: join(bePath, 'docs/swagger.json'),
	remote: 'http://localhost:8080/swagger/doc.json', // gin-swagger 标准地址
	outDir: join(projectRoot, 'src/api/swagger'),
	outFile: 'generated.ts', // 新的输出文件名
}

const apiGenOpts = {
	httpClientType: 'axios', // 使用 axios 作为 HTTP 客户端
	generateClient: true, // 生成客户端代码
	hooks: {
		// 移除长前缀
		onFormatTypeName: (typeName: string, rawTypeName?: string) => {
			// console.log('typeName', typeName)
			let result = typeName
				.replace(/^AiModelsBackendInternalModels/, '') // 移除包路径前缀
				.replace(/^AiModelsBackendPkgResponse/, '') // 移除通用response
				.replace(/^AiModelsBackend/, '')
			if (!result) {
				result = typeName
			}
			return result
		},
	},
	cleanOutput: false, // 不清除输出目录，避免删除其他文件
	extractRequestParams: true, // 提取请求参数
	extractRequestBody: true, // 提取请求体
	extractResponseBody: true, // 提取响应体
	unwrapResponseData: true, // 解包响应数据
}

// 生成 swagger 文件
async function genSwagger() {
	return new Promise<void>((resolve, reject) => {
		console.log('📋 生成 swagger 文档...')
		const proc = spawn('make', ['swagger'], {
			cwd: bePath,
			stdio: useLocal ? 'pipe' : 'inherit', // 本地模式时减少输出噪音
			shell: true,
		})

		let output = ''
		if (useLocal && proc.stdout) {
			proc.stdout.on('data', (data) => {
				output += data.toString()
			})
		}

		proc.on('close', (code) => {
			if (code === 0) {
				console.log('✅ swagger 文档生成成功')
				resolve()
			} else {
				console.error('❌ make swagger 失败，退出码:', code)
				if (output) console.error('输出:', output)
				reject(new Error(`make swagger 失败，退出码: ${code}`))
			}
		})

		proc.on('error', (error) => {
			console.error('❌ 执行 make swagger 时出错:', error)
			reject(error)
		})
	})
}

// 生成 api types 文件
async function genApiTypes() {
	console.log('🔧 生成 TypeScript API 类型...')
	if (!existsSync(cfg.outDir)) mkdirSync(cfg.outDir, { recursive: true })

	let src: any
	if (useLocal) {
		if (!existsSync(cfg.local)) {
			throw new Error(`swagger文件不存在: ${cfg.local}`)
		}
		src = { input: cfg.local }
		console.log('📁 使用本地swagger:', cfg.local.replace(projectRoot, '.'))
	} else {
		src = { url: cfg.remote }
		console.log('🌐 使用远程swagger:', cfg.remote)
	}

	try {
		const { files } = await generateApi({
			fileName: cfg.outFile,
			output: cfg.outDir,
			...src,
			...apiGenOpts,
		})
		console.log('✅ TypeScript API 类型生成完成:')
		files.forEach((f) => console.log('  -', f.fileName || 'generated'))

		// 使用 AST 增强生成的代码
		const generatedFilePath = join(cfg.outDir, cfg.outFile)
		if (existsSync(generatedFilePath)) {
			await genApiTool.enhanceGeneratedTypes(generatedFilePath)
		}
	} catch (e) {
		console.error('❌ API 类型生成失败:', e)
		throw e
	}
}

// 主函数
async function main() {
	try {
		if (useLocal && !skipSwag) {
			try {
				await genSwagger()
			} catch (swaggerError) {
				console.warn('⚠️  Swagger 生成失败，将尝试使用现有的 swagger.json 文件:', swaggerError.message)
			}
		}
		await genApiTypes()
	} catch (error) {
		console.error('❌ 生成过程失败:', error)
		if (!opts.watch) {
			process.exit(1)
		}
		throw error
	}
}

// 监听并运行
async function watchAndRun() {
	const watcher = chokidar.watch(bePath, {
		ignoreInitial: true,
		cwd: projectRoot,
	})

	let running = false
	let pending = false

	const trigger = async () => {
		if (running) {
			pending = true
			return
		}
		running = true
		try {
			console.log('\n🔄 检测到变更，重新生成 swagger 和 api types...')
			const startTime = Date.now()
			await main()
			const duration = Date.now() - startTime
			console.log(`✅ 生成完成 (耗时: ${duration}ms)，等待下一次变更...\n`)
		} catch (e) {
			console.error('❌ 自动生成失败:', e)
		} finally {
			running = false
			if (pending) {
				pending = false
				trigger()
			}
		}
	}

	const debouncedFn = debounce(trigger, DEBOUNCE_DELAY, {
		leading: true,
		trailing: false,
	})

	watcher.on('all', (event, filePath) => {
		if (!filePath.endsWith('.go')) {
			return
		}

		if (filePath.includes('docs/')) {
			return
		}

		console.log('🔄 检测到变更:', filePath)
		const relativePath = filePath.replace(projectRoot, '.')
		console.log(`📝 [${event}] ${relativePath}`)
		debouncedFn()
	})

	watcher.on('ready', () => {
		console.log('初始扫描完成，开始监听变更...')
		const watchedPaths = watcher.getWatched()
		console.log('监听的文件/目录:', Object.keys(watchedPaths).length)
		console.log('注意：只会响应 .go 文件的变更')
	})

	watcher.on('error', (error) => {
		console.error('❌ 文件监听错误:', error)
	})

	process.on('SIGINT', () => {
		console.log('\n🛑 正在停止监听...')
		watcher.close()
		process.exit(0)
	})

	console.log('🚀 启动时生成一次...')
	await main()
	console.log('👀 已启动监听，按 Ctrl+C 退出')
}

// 入口函数
async function run() {
	console.log('🚀 AI Models API 生成器 v2 (with AST enhancements)')
	console.log('模式:', useLocal ? '本地' : '远程')
	if (skipSwag) {
		console.log('ⓘ 跳过 Swagger 生成步骤')
	}

	if (opts.watch) {
		console.log('📂 监听模式启动...')
		await watchAndRun()
	} else {
		console.log('🔄 单次生成模式...')
		await main()
		console.log('🎉 生成完成!')
	}
}

// 启动脚本
run().catch((error) => {
	console.error('❌ 脚本执行失败:', error)
	process.exit(1)
})
