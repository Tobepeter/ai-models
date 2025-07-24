/** 登录请求参数 */
export interface LoginRequest {
	username: string
	password: string
}

/** 注册请求参数 */
export interface RegisterRequest {
	username: string
	email: string
	password: string
	confirmPassword: string
}

/** 修改密码请求参数 */
export interface ChangePasswordRequest {
	oldPassword: string
	newPassword: string
	confirmPassword: string
}

/** 用户信息 */
export interface AuthUser {
	id: number
	username: string
	email: string
	avatar?: string
	isActive: boolean
	createdAt: string
	updatedAt: string
}

/** 登录响应 */
export interface LoginResponse {
	user: AuthUser
	token: string
}

/** 注册响应 */
export interface RegisterResponse {
	user: AuthUser
	token: string
}

/** 认证状态 */
export interface AuthState {
	isAuthenticated: boolean
	user: AuthUser | null
	token: string | null
	isLoading: boolean
	error: string | null
}

/** API响应基础结构 */
export interface ApiResponse<T = any> {
	code: number
	msg: string
	data?: T
}

/** 表单验证错误 */
export interface FormErrors {
	username?: string
	email?: string
	password?: string
	confirmPassword?: string
	oldPassword?: string
	newPassword?: string
	general?: string
}
