import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PropsWithChildren, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { queryClient } from './lib/react-query'
import { router } from './router/router'
import { isDev } from './utils/env'

const StrictWrapper = (props: PropsWithChildren) => {
	// NOTE: 不是很喜欢这个功能
	const enableStrict = false
	return enableStrict ? <StrictMode>{props.children}</StrictMode> : props.children
}

createRoot(document.getElementById('root')).render(
	<StrictWrapper>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			{isDev && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	</StrictWrapper>
)
