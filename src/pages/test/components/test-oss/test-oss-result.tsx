import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OssUploadResult } from '@/utils/oss/oss-types'

/**
 * OSS测试结果组件
 * 以JSON格式显示最后的上传结果
 */
export const TestOssResult = ({ result }: TestOssResultProps) => {
	if (!result) return null

	return (
		<Card>
			<CardHeader>
				<CardTitle>最后上传结果</CardTitle>
			</CardHeader>
			<CardContent>
				<pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
					{JSON.stringify(result, null, 2)}
				</pre>
			</CardContent>
		</Card>
	)
}

export type TestOssResultProps = {
	result: OssUploadResult | null
}
