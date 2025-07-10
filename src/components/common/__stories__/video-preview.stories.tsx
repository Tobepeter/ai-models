import type { Meta, StoryObj } from '@storybook/react'
import { VideoPreview } from '../video-preview'

const meta: Meta<typeof VideoPreview> = {
	title: 'Components/VideoPreview',
	component: VideoPreview,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		url: {
			control: 'text',
			description: '视频URL',
		},
		notEditable: {
			control: 'boolean',
			description: '是否可编辑',
		},
		className: {
			control: 'text',
			description: '自定义样式类名',
		},
		onUpload: {
			action: 'uploaded',
			description: '文件上传回调',
		},
		onDelete: {
			action: 'deleted',
			description: '删除回调',
		},
	},
}

export default meta
type Story = StoryObj<typeof meta>

// 示例视频URL
const SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

export const Default: Story = {
	args: {
		url: SAMPLE_VIDEO,
	},
}

export const NotEditable: Story = {
	args: {
		url: SAMPLE_VIDEO,
		notEditable: true,
	},
}

export const EmptyState: Story = {
	args: {
		url: undefined,
	},
}

export const EmptyEditable: Story = {
	args: {
		url: undefined,
	},
}

export const CustomSlot: Story = {
	args: {
		url: SAMPLE_VIDEO,
		children: <div className="w-40 h-40 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">自定义视频插槽</div>,
	},
}

export const CustomSlotEditable: Story = {
	args: {
		url: SAMPLE_VIDEO,
		children: <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">点击播放</div>,
	},
}

export const NoVideo: Story = {
	args: {
		url: undefined,
	},
}

export const WithCustomClassName: Story = {
	args: {
		url: SAMPLE_VIDEO,
		className: 'border-4 border-red-500 rounded-xl',
	},
}

export const CustomSize: Story = {
	args: {
		url: SAMPLE_VIDEO,
		size: 200,
	},
}

export const CustomDimensions: Story = {
	args: {
		url: SAMPLE_VIDEO,
		width: 300,
		height: 180,
	},
}

export const MultipleVideos: Story = {
	render: () => (
		<div className="flex gap-4 flex-wrap">
			<VideoPreview url={SAMPLE_VIDEO} />
			<VideoPreview url={SAMPLE_VIDEO} notEditable />
			<VideoPreview />
			<VideoPreview notEditable />
		</div>
	),
}

export const WithSlotVariations: Story = {
	render: () => (
		<div className="flex gap-4 flex-wrap">
			<VideoPreview url={SAMPLE_VIDEO}>
				<div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">圆形</div>
			</VideoPreview>
			<VideoPreview url={SAMPLE_VIDEO}>
				<div className="w-24 h-16 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs">矩形</div>
			</VideoPreview>
			<VideoPreview url={SAMPLE_VIDEO}>
				<div className="w-32 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">长条形</div>
			</VideoPreview>
		</div>
	),
}

export const WithCallback: Story = {
	args: {
		url: SAMPLE_VIDEO,
		onUpload: (file: File) => {
			console.log('上传的文件:', file)
		},
		onDelete: () => {
			console.log('删除视频')
		},
		onChange: (url: string | undefined) => {
			console.log('URL变化:', url)
		},
	},
}
