import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PropsWithChildren, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { queryClient } from './api/query-client'
import { router } from './router/router'
import { isDev } from './utils/env'
import { useTheme } from './hooks/use-theme.ts'

// NOTE: 不是很喜欢这个功能
const enableStrict = false

// NOTE: 位置有遮挡，需要时候再开启
const enableReactQueryDevtools = false

const StrictWrapper = (props: PropsWithChildren) => {
	return enableStrict ? <StrictMode>{props.children}</StrictMode> : props.children
}

const Main = () => {
	useTheme()
	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			{isDev && enableReactQueryDevtools && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	)
}

createRoot(document.getElementById('root')).render(
	<StrictWrapper>
		<Main />
	</StrictWrapper>
)
