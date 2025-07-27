import { join } from 'path'
import { Project, InterfaceDeclaration, SyntaxKind } from 'ts-morph'
import { projectRoot } from './env'

/**
 * API 生成工具类
 * 处理 swagger 生成的类型修复和后处理
 */
class GenApiTool {
	/**
	 * 使用 ts-morph 增强生成的 TypeScript 代码
	 */
	async enhanceGeneratedTypes(filePath: string) {
		console.log('🔧 使用 AST 增强 TypeScript 类型...')

		const project = new Project({
			tsConfigFilePath: join(projectRoot, 'tsconfig.json'),
		})

		const sourceFile = project.addSourceFileAtPath(filePath)

		// 1. 找到 Response 接口，为 data 属性添加泛型 T
		this.enhanceResponseInterface(sourceFile)

		// 2. 找到继承 Response 且有 {data: dataType} 的接口，改为 Response<dataType>
		this.enhanceResponseExtensions(sourceFile)

		await sourceFile.save()
		console.log('✅ AST 增强完成')
	}

	/**
	 * 找到名为 "Response" 的接口，为 data 属性添加泛型 T
	 * 
	 * eg. Response -> Response<T>
	 */
	private enhanceResponseInterface(sourceFile: any) {
		const interfaces = sourceFile.getInterfaces()

		interfaces.forEach((interfaceDecl: InterfaceDeclaration) => {
			const name = interfaceDecl.getName()

			// 只处理名为 "Response" 的接口
			if (name === 'Response') {
				// 添加泛型参数 T
				if (interfaceDecl.getTypeParameters().length === 0) {
					interfaceDecl.addTypeParameter('T = any')
				}

				// 查找 data 属性并设置为泛型 T
				const dataProperty = interfaceDecl.getProperty('data')
				if (dataProperty) {
					dataProperty.setType('T')
				}
			}
		})
	}

	/**
	 * 找到继承 Response 且有 {data: dataType} 的接口，改为 Response<dataType>
	 * 
	 * eg. type MyType = Resposne & {data: OtherType} -> Response<OtherType>
	 */
	private enhanceResponseExtensions(sourceFile: any) {
		// 处理 type aliases 如: export type PostTestData = Response & { data: SomeType }
		const typeAliases = sourceFile.getTypeAliases()

		typeAliases.forEach((typeAlias: any) => {
			const typeNode = typeAlias.getTypeNode()
			if (typeNode) {
				// 检查是否是交叉类型 (intersection type)
				if (typeNode.getKind() === SyntaxKind.IntersectionType) {
					const intersectionTypes = typeNode.getTypeNodes()

					let hasResponse = false
					let dataType = null

					// 遍历交叉类型的各个部分
					intersectionTypes.forEach((typeRef: any) => {
						// 检查是否包含 Response
						if (typeRef.getText() === 'Response') {
							hasResponse = true
						}

						// 检查是否是对象类型且包含 data 字段
						if (typeRef.getKind() === SyntaxKind.TypeLiteral) {
							const members = typeRef.getMembers()
							members.forEach((member: any) => {
								if (member.getName && member.getName() === 'data') {
									// 获取 data 字段的类型
									const typeAnnotation = member.getTypeNode()
									if (typeAnnotation) {
										dataType = typeAnnotation.getText()
									}
								}
							})
						}
					})

					// 如果同时包含 Response 和 data 字段，进行转换
					if (hasResponse && dataType) {
						typeAlias.setType(`Response<${dataType}>`)
						// console.log(`✅ AST转换 ${typeAlias.getName()}: Response & {data: ${dataType}} → Response<${dataType}>`)
					}
				}
			}
		})
	}
}

export const genApiTool = new GenApiTool()
