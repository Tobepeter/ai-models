import type { Meta, StoryObj } from '@storybook/react-vite'
import { ImagePreview } from '../image-preview'

const meta: Meta<typeof ImagePreview> = {
	title: 'Components/ImagePreview',
	component: ImagePreview,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		url: {
			control: 'text',
			description: '图片URL',
		},
		noEditable: {
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

// 示例图片URL
const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'

export const Default: Story = {
	args: {
		url: SAMPLE_IMAGE,
	},
}

export const Editable: Story = {
	args: {
		url: SAMPLE_IMAGE,
		noEditable: true,
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
		url: SAMPLE_IMAGE,
		children: <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">自定义插槽内容</div>,
	},
}

export const CustomSlotEditable: Story = {
	args: {
		url: SAMPLE_IMAGE,
		children: <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">点击预览</div>,
	},
}

export const NoImage: Story = {
	args: {
		url: undefined,
	},
}

export const WithCustomClassName: Story = {
	args: {
		url: SAMPLE_IMAGE,
		className: 'border-4 border-blue-500 rounded-xl',
	},
}

export const MultipleImages: Story = {
	render: () => (
		<div className="flex gap-4 flex-wrap">
			<ImagePreview url={SAMPLE_IMAGE} />
			<ImagePreview url={SAMPLE_IMAGE} noEditable />
			<ImagePreview />
			<ImagePreview noEditable />
		</div>
	),
}

export const WithSlotVariations: Story = {
	render: () => (
		<div className="flex gap-4 flex-wrap">
			<ImagePreview url={SAMPLE_IMAGE}>
				<div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">圆形</div>
			</ImagePreview>
			<ImagePreview url={SAMPLE_IMAGE}>
				<div className="w-24 h-16 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs">矩形</div>
			</ImagePreview>
			<ImagePreview url={SAMPLE_IMAGE}>
				<div className="w-32 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">长条形</div>
			</ImagePreview>
		</div>
	),
}
