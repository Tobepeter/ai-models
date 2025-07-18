import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { Test } from '@/pages/test/test'
import { Chat } from '@/pages/chat/chat'
import { ChatHub } from '@/pages/chat-hub/chat-hub'
import { Doc } from '@/pages/docs/doc'
import { ossBase, ossBasePrefix } from '@/utils/env'

const getBasename = () => {
	const l = window.location

	// == github pages ==
	const isGithub = l.origin.includes('github.io')
	if (isGithub) {
		const split = l.pathname.split('/')
		if (split[1]) {
			return '/' + split[1] + '/'
		}
	}

	// == oss ==
	// NOTE: 其实不行，在默认域名，oss所有文件都是下载的，index.html 也不例外
	// 搜索阿里云文档：如何配置访问OSS文件时的预览行为？
	// TODO：不知道oss是否能支持fallback行为
	// NOTE: ossBase包含https://，但是l.hostname不包含
	if (ossBase.includes(l.hostname)) {
		return ossBasePrefix.slice(ossBase.length)
	}

	return '/'
}

export const router = createBrowserRouter(
	[
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
	],
	{
		basename: getBasename(),
	}
)
