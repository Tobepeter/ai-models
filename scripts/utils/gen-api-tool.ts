import { existsSync, readFileSync, writeFileSync } from 'fs'

/**
 * API 生成工具类
 * 处理 swagger 生成的类型修复和后处理
 */
class GenApiTool {
	/** 修复生成的 Response 类型，目前swagger不支持go泛型，会报错，只能自己代码替换了 */
	async fixResponseTypes(generatedFilePath: string) {
		if (!existsSync(generatedFilePath)) {
			console.warn('⚠️  生成的文件不存在，跳过类型修复')
			return
		}

		console.log('🔧 修复 Response 类型中的 any 问题...')

		let content = readFileSync(generatedFilePath, 'utf-8')

		// 1. 将 Response 接口改为泛型
		content = content.replace(
			/export interface Response \{[\s\S]*?\}/,
			`export interface Response<T = any> {
  code?: number;
  data?: T;
  message?: string;
}`
		)

		// 2. 处理所有的 Response & { ... } 模式
		// 使用更精确的正则表达式来匹配完整的类型定义
		content = content.replace(/export type (\w+) = Response & \{([\s\S]*?)\};/g, (match, typeName, fieldsContent) => {
			// 提取 data 字段的类型
			const dataMatch = fieldsContent.match(/data\?\s*:\s*([\s\S]*?)(\s*[;}])/s)
			if (dataMatch && dataMatch[1]) {
				let dataType = dataMatch[1].trim()
				// 移除末尾的分号或其他符号
				dataType = dataType.replace(/[;,\s]*$/, '')
				return `export type ${typeName} = Response<${dataType}>;`
			}
			// 如果没有找到 data 字段，返回原格式
			return match
		})

		writeFileSync(generatedFilePath, content, 'utf-8')
		console.log('✅ Response 类型修复完成')
	}
}

export const genApiTool = new GenApiTool()
