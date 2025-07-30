export interface DocFile {
	path: string // 路径
	folder: string // 文件夹最后一级
	file: string // 文件名，不包含.md
	load: () => Promise<string>
}

export type DocFileMap = Record<string, DocFile>

export type DocCache = Record<string, string> // key: path, value: content

export type DocFileGroup = Record<string, DocFile[]> // key: folder, value: DocFile[]
