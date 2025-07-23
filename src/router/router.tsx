import React, { ReactElement } from 'react'
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom'
import App from '@/App'
import { AppLayout } from '@/components/layout/app-layout'
import { Test } from '@/pages/test/test'
import { Chat } from '@/pages/chat/chat'
import { ChatHub } from '@/pages/chat-hub/chat-hub'
import { Doc } from '@/pages/docs/doc'
import { Home } from '@/pages/home/home'
import { User } from '@/pages/user/user'
import { ossBase, ossBasePrefix } from '@/utils/env'

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
		path: 'user',
		element: <User />,
		handle: { title: '用户中心' },
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
