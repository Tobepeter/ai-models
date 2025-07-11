import { ChatMsg } from '@/pages/chat/components/chat-msg'
import { Msg } from '@/pages/chat/chat-type'
import { dummy } from '@/utils/dummy'
import { v4 as uuidv4 } from 'uuid'

/**
 * 聊天消息组件测试
 */
export const TestChatMsg = () => {
	const testMsgs: Msg[] = [
		// 用户文本消息
		{
			id: uuidv4(),
			type: 'user',
			content: '你好，我想了解一下 AI 的工作原理。',
			mediaType: 'text',
			timestamp: Date.now(),
			status: 'success',
		},
		// 长文本消息		
		{
			id: uuidv4(),
			type: 'user',
			content: '你好，我想了解一下 AI 的工作原理。'.repeat(20),
			mediaType: 'text',
			timestamp: Date.now(),
			status: 'success',
		},
		// 包含换行的文本消息
		{
			id: uuidv4(),
			type: 'user',
			content: '请帮我分析一下这个复杂的问题：\n\n1. 人工智能在未来十年内会如何影响各个行业？\n2. 机器学习和深度学习的区别是什么？\n3. 自然语言处理技术的发展趋势如何？\n\n特别是在以下几个方面：\n- 医疗健康领域的应用\n- 金融科技的创新\n- 教育行业的变革\n- 制造业的智能化升级\n\n希望能得到详细的分析和建议，谢谢！',
			mediaType: 'text',
			timestamp: Date.now(),
			status: 'success',
		},
		// 助手文本消息
		{
			id: uuidv4(),
			type: 'assistant',
			content: '你好！AI 的工作原理主要基于机器学习和深度学习技术。简单来说，AI 系统通过大量数据训练，学习识别模式和规律，然后根据这些学习到的知识来处理新的输入和生成相应的输出。',
			mediaType: 'text',
			timestamp: Date.now(),
			status: 'success',
		},
		// 用户图片消息
		{
			id: uuidv4(),
			type: 'user',
			content: '帮我分析一下这张图片',
			mediaType: 'image',
			timestamp: Date.now(),
			status: 'success',
			mediaData: {
				url: dummy.getImage('landscape'),
				filename: 'test-image.jpg',
				size: '45KB',
			},
		},
		// 助手生成中状态
		{
			id: uuidv4(),
			type: 'assistant',
			content: '',
			mediaType: 'image',
			timestamp: Date.now(),
			status: 'pending',
		},
		// 助手生成失败
		{
			id: uuidv4(),
			type: 'assistant',
			content: '',
			mediaType: 'text',
			timestamp: Date.now(),
			status: 'error',
			error: '网络连接失败，请稍后重试',
		},
		// 用户音频消息
		{
			id: uuidv4(),
			type: 'user',
			content: '请听一下这段音频',
			mediaType: 'audio',
			timestamp: Date.now(),
			status: 'success',
			mediaData: {
				url: dummy.audio,
				filename: 'audio-sample.wav',
				duration: '0:15',
			},
		},
		// 助手视频生成中
		{
			id: uuidv4(),
			type: 'assistant',
			content: '',
			mediaType: 'video',
			timestamp: Date.now(),
			status: 'pending',
		},
		// 助手成功生成视频
		{
			id: uuidv4(),
			type: 'assistant',
			content: '',
			mediaType: 'video',
			timestamp: Date.now(),
			status: 'success',
			mediaData: {
				url: dummy.video,
				filename: 'generated-video.mp4',
				duration: '0:30',
				size: '1.2MB',
			},
		},
	]

	return (
		<div className="p-4 max-w-4xl mx-auto">
			<h2 className="text-xl font-semibold mb-4">聊天消息组件测试</h2>
			<div className="space-y-4">
				{testMsgs.map((msg) => (
					<div key={msg.id} className="border rounded-lg p-4">
						<div className="text-sm text-muted-foreground mb-2">
							{msg.type === 'user' ? '用户' : '助手'} - {msg.mediaType} - {msg.status}
						</div>
						<ChatMsg msg={msg} />
					</div>
				))}
			</div>
		</div>
	)
} 