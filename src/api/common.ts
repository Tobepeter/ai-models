/** 基础API响应结构 */
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data?: T
}

/** 后端固定的基础模型结构 */
export interface BaseModel {
  id: number
  created_at: string
  updated_at: string
}

/** 分页信息 */
export interface Pagination {
  current: number
  pageSize: number
  total: number
}

/** 分页响应结构 */
export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: Pagination
}

/** 分页请求参数 */
export interface PaginationRequest {
  page?: number
  limit?: number
  current?: number
  pageSize?: number
}

/** 通用查询条件 */
export interface QueryConditions extends PaginationRequest {
  [key: string]: any
}

/** 通用ID参数 */
export interface IdParam {
  id: number
}

/** 批量操作请求 */
export interface BatchRequest {
  ids: number[]
}

/** 计数响应 */
export interface CountResponse {
  count: number
}

/** 通用成功响应 */
export interface SuccessResponse {
  success: boolean
  message?: string
}
