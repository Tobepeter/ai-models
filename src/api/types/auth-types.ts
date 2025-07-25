import { UserResp } from './user-types'

/** 登录请求参数 */
export interface AuthLoginReq {
  username: string
  password: string
}

/** 注册请求参数 */
export interface AuthRegisterReq {
  username: string
  email: string
  password: string
  confirmPassword: string
}

/** 修改密码请求参数 */
export interface AuthChangePasswordReq {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

/** 登录响应 */
export interface AuthLoginResp {
  user: UserResp
  token: string
}

/** 注册响应 */
export interface AuthRegisterResp {
  user: UserResp
  token: string
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

/** JWT Token Claims */
export interface TokenClaims {
  user_id: number
  username: string
  exp: number
  iat: number
}
