import { BaseModel, PaginatedResponse, QueryConditions, BatchRequest } from '../common'

/** CRUD记录基础结构 */
export interface CrudRecord extends BaseModel {
  category: string
  data: string
}

/** 创建请求 */
export interface CreateRequest {
  category?: string // 业务分类，可选，默认为general
  data: string
}

/** 更新请求 */
export interface UpdateRequest {
  category?: string // 业务分类，可选
  data: string
}

/** 批量删除请求 */
export interface BatchDeleteRequest extends BatchRequest {}

/** CRUD分页响应 */
export interface CRUDPaginatedResponse extends PaginatedResponse<CrudRecord> {}

/** CRUD查询条件 */
export interface CRUDQueryConditions extends QueryConditions {
  category?: string // 按业务分类过滤
  data?: string
  created_at_start?: string
  created_at_end?: string
  updated_at_start?: string
  updated_at_end?: string
}