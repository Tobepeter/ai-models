import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { Test } from '@/pages/test/Test'

export const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: 'test',
				element: <Test />,
			},
		],
	},
])
