import App from '@/App'
import { AppLayout } from '@/components/layout/app-layout'
import { Login } from '@/pages/auth/login'
import { Register } from '@/pages/auth/register'
import { ChatHub } from '@/pages/chat-hub/chat-hub'
import { Chat } from '@/pages/chat/chat'
import { Crud } from '@/pages/crud/crud'
import { Doc } from '@/pages/docs/doc'
import { Home } from '@/pages/home/home'
import { Test } from '@/pages/test/test'
import { User } from '@/pages/user/user'
import { Todo } from '@/pages/todo/todo'
import { ossBase, ossBasePrefix } from '@/utils/env'
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom'

/** 路由handle类型约束 */
export interface RouteHandle {
	title?: string
}

type CustomRouteObject = RouteObject & { handle?: RouteHandle }

/** 应用路由配置数组 */
export const routes: CustomRouteObject[] = [
	{
		path: '',
		element: <Home />,
		handle: { title: '首页' },
		index: true,
	},
	{
		path: 'home',
		element: <Navigate to="/" replace />,
	},
	{
		path: 'chat',
		element: <Chat />,
		handle: { title: 'AI助手' },
	},
	{
		path: 'chat-hub',
		element: <ChatHub />,
		handle: { title: 'AI对比助手' },
	},
	{
		path: 'crud',
		element: <Crud />,
		handle: { title: '通用型CRUD体验' },
	},
	{
		path: 'user',
		element: <User />,
		handle: { title: '用户中心' },
	},
	{
		path: 'todo',
		element: <Todo />,
		handle: { title: 'TODO管理' },
	},
	{
		path: 'test',
		element: <Test />,
		handle: { title: '测试页面' },
	},
	{
		path: 'doc',
		element: <Doc />,
		handle: { title: '文档' },
	},
]

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
				// 认证页面 - 不需要应用布局，已登录用户会被重定向
				{
					path: 'login',
					element: <Login />,
				},
				{
					path: 'register',
					element: <Register />,
				},
				// 应用主体 - 需要应用布局和认证
				{
					path: '/',
					element: <AppLayout />,
					children: routes,
				},
			],
		},
	],
	{
		basename: getBasename(),
	}
)
