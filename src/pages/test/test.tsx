import { isDev } from '@/utils/env'
import { TestImagePreview } from './components/test-image-preview'
import { TestVideoPreview } from './components/test-video-preview'

export const Test = () => {
	return (
		<>
			{isDev && (
				<>
					{/* <TestShadcn /> */}
					{/* <TestDummy /> */}
					{/* <TestImagePreview /> */}
					<TestVideoPreview />
				</>
			)}
		</>
	)
}
