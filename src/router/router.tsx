import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { Test } from '@/pages/test/test'
import { Chat } from '@/pages/chat/chat'
import { ChatHub } from '@/pages/chat-hub/chat-hub'
import { Doc } from '@/pages/docs/doc'

// 获取 base URL，用于 GitHub Pages
const getBasename = () => {
	const base = import.meta.env.BASE_URL || '/'
	// 如果 base 是 /，则返回空字符串（React Router 的默认行为）
	// 如果 base 是 /ai-models/，则返回 /ai-models
	return base === '/' ? '' : base.replace(/\/$/, '')
}

export const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: 'test',
				element: <Test />,
			},
			{
				path: 'chat',
				element: <Chat />,
			},
			{
				path: 'chat-hub',
				element: <ChatHub />,
			},
			{
				path: 'doc',
				element: <Doc />,
			},
		],
	},
], {
	basename: getBasename(),
})
