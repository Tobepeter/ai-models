/**
 * 下载文件工具函数
 *
 * 必须要用blob，chrome如果不用blob，每次一定会打开新标签而不是下载
 */
export const download = async (url: string, filename: string) => {
	try {
		const response = await fetch(url)
		const blob = await response.blob()
		downloadBlob(blob, filename)
	} catch (error) {
		console.error('下载文件失败:', error)
	}
}

export const downloadUrl = (url: string, filename: string) => {
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	link.style.display = 'none'
	// NOTE: 必须这么设置，否则chrome还是打开一个新的标签
	link.target = '_self'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}

export const downloadBlob = (blob: Blob, filename: string) => {
	const url = URL.createObjectURL(blob)
	downloadUrl(url, filename)
	URL.revokeObjectURL(url)
}

export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
	const url = canvas.toDataURL()
	downloadUrl(url, filename)
}
