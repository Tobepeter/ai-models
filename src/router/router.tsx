import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { Test } from '@/pages/test/test'
import { Chat } from '@/pages/chat/chat'
import { ChatHub } from '@/pages/chat-hub/chat-hub'
import { Doc } from '@/pages/docs/doc'

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
])
