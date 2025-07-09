import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import TestPage from '@/pages/TestPage'

export const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: 'test',
				element: <TestPage />,
			},
		],
	},
])
