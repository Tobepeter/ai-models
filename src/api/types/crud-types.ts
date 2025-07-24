import { BaseModel, PaginatedResponse, QueryConditions, BatchRequest } from '../common'

/** CRUD记录基础结构 */
export interface CRUDRecord extends BaseModel {
  data: string
}

/** 创建请求 */
export interface CreateRequest {
  data: string
}

/** 更新请求 */
export interface UpdateRequest {
  data: string
}

/** 批量删除请求 */
export interface BatchDeleteRequest extends BatchRequest {}

/** CRUD分页响应 */
export interface CRUDPaginatedResponse extends PaginatedResponse<CRUDRecord> {}

/** CRUD查询条件 */
export interface CRUDQueryConditions extends QueryConditions {
  data?: string
  created_at_start?: string
  created_at_end?: string
  updated_at_start?: string
  updated_at_end?: string
}