import { CRUDQueryConditions } from '../types/crud-types'

/**
 * CRUD查询构建器
 * 提供通用的查询条件构建方法
 */
class CrudQuery {
  private conditions: CRUDQueryConditions = {}

  /* 设置分类过滤 */
  category(category: string) {
    this.conditions.category = category
    return this
  }

  /* 设置分页 */
  page(page: number, limit?: number) {
    this.conditions.page = page
    if (limit) this.conditions.limit = limit
    return this
  }

  /* 设置每页数量 */
  limit(limit: number) {
    this.conditions.limit = limit
    return this
  }

  /* 设置数据内容过滤 */
  data(data: string) {
    this.conditions.data = data
    return this
  }

  /* 设置创建时间范围 */
  createdAtRange(start?: string, end?: string) {
    if (start) this.conditions.created_at_start = start
    if (end) this.conditions.created_at_end = end
    return this
  }

  /* 设置更新时间范围 */
  updatedAtRange(start?: string, end?: string) {
    if (start) this.conditions.updated_at_start = start
    if (end) this.conditions.updated_at_end = end
    return this
  }

  /* 重置查询条件 */
  reset() {
    this.conditions = {}
    return this
  }

  /* 获取查询条件 */
  getConditions(): CRUDQueryConditions {
    return { ...this.conditions }
  }

  /* 构建查询条件 */
  build(): CRUDQueryConditions {
    return this.getConditions()
  }
}

export const crudQuery = new CrudQuery()
export { CrudQuery }