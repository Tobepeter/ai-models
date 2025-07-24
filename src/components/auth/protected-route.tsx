import { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'

/**
 * 路由保护组件
 * 根据认证状态决定是否允许访问页面
 */
export const ProtectedRoute = (props: ProtectedRouteProps) => {
	const { children, requireAuth = true, redirectTo = '/login' } = props

	const { isAuthenticated } = useAuthStore()
	const location = useLocation()

	// 如果需要认证但用户未登录，重定向到登录页
	if (requireAuth && !isAuthenticated) {
		return <Navigate to={redirectTo} state={{ from: location }} replace />
	}

	// 如果不需要认证但用户已登录，可以选择重定向到首页
	// 这里主要用于登录/注册页面，已登录用户不应该再看到这些页面
	if (!requireAuth && isAuthenticated) {
		const from = location.state?.from?.pathname || '/'
		return <Navigate to={from} replace />
	}

	return <>{children}</>
}

export interface ProtectedRouteProps extends PropsWithChildren {
	requireAuth?: boolean // 是否需要认证，默认为true
	redirectTo?: string // 重定向路径，默认为/login
}
