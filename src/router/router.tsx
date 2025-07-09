import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { Test } from '@/pages/test/test'
import { Chat } from '@/pages/chat/chat'

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
		],
	},
])
