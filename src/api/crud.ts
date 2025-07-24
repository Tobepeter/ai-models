import { axiosClient } from './axios-client'
import {
  CRUDRecord,
  CRUDPaginatedResponse,
  CRUDQueryConditions
} from './types/crud-types'
import { CountResponse, ApiResponse } from './common'

/**
 * 通用CRUD API客户端
 * 提供标准的增删改查操作
 */
export class CRUDApi {
  private baseUrl = '/crud'

  /**
   * 创建记录
   * @param data 要存储的数据（会自动序列化为JSON字符串）
   */
  async create<T = any>(data: T): Promise<CRUDRecord> {
    const response = await axiosClient.post<ApiResponse<CRUDRecord>>(this.baseUrl, {
      data: JSON.stringify(data)
    })
    if (response.data.code !== 200) throw new Error(response.data.msg || '创建失败')
    return response.data.data!
  }

  /**
   * 根据ID获取记录
   * @param id 记录ID
   */
  async getById(id: number): Promise<CRUDRecord> {
    const response = await axiosClient.get<ApiResponse<CRUDRecord>>(`${this.baseUrl}/${id}`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取失败')
    return response.data.data!
  }

  /**
   * 根据ID获取记录并解析数据
   * @param id 记录ID
   */
  async getByIdParsed<T = any>(id: number): Promise<T> {
    const record = await this.getById(id)
    return JSON.parse(record.data)
  }

  /**
   * 获取记录列表
   * @param conditions 查询条件
   */
  async getList(conditions: CRUDQueryConditions = {}): Promise<CRUDPaginatedResponse> {
    const params = new URLSearchParams()

    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })

    const response = await axiosClient.get<ApiResponse<CRUDPaginatedResponse>>(`${this.baseUrl}?${params}`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取列表失败')
    return response.data.data!
  }

  /**
   * 获取记录列表并解析所有数据
   * @param conditions 查询条件
   */
  async getListParsed<T = any>(conditions: CRUDQueryConditions = {}): Promise<CRUDPaginatedResponse> {
    const result = await this.getList(conditions)

    const parsedData = result.data.map(record => ({
      id: record.id,
      created_at: record.created_at,
      updated_at: record.updated_at,
      ...JSON.parse(record.data)
    }))

    return {
      data: parsedData,
      pagination: result.pagination
    }
  }

  /**
   * 更新记录
   * @param id 记录ID
   * @param data 要更新的数据（会自动序列化为JSON字符串）
   */
  async update<T = any>(id: number, data: T): Promise<CRUDRecord> {
    const response = await axiosClient.put<ApiResponse<CRUDRecord>>(`${this.baseUrl}/${id}`, {
      data: JSON.stringify(data)
    })
    if (response.data.code !== 200) throw new Error(response.data.msg || '更新失败')
    return response.data.data!
  }

  /**
   * 删除记录（软删除）
   * @param id 记录ID
   */
  async delete(id: number): Promise<void> {
    const response = await axiosClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '删除失败')
  }

  /**
   * 批量删除记录
   * @param ids 记录ID数组
   */
  async batchDelete(ids: number[]): Promise<void> {
    const response = await axiosClient.post<ApiResponse<void>>(`${this.baseUrl}/batch-delete`, { ids })
    if (response.data.code !== 200) throw new Error(response.data.msg || '批量删除失败')
  }

  /**
   * 获取记录总数
   * @param conditions 查询条件
   */
  async getCount(conditions: Omit<CRUDQueryConditions, 'page' | 'limit'> = {}): Promise<number> {
    const params = new URLSearchParams()

    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })

    const response = await axiosClient.get<ApiResponse<CountResponse>>(`${this.baseUrl}/count?${params}`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取计数失败')
    return response.data.data!.count
  }
}

/** 导出单例实例 */
export const crudApi = new CRUDApi()

/** 便捷的类型化CRUD操作类 */
export class TypedCRUDApi<T = any> {
  constructor(private api: CRUDApi = crudApi) {}

  async create(data: T): Promise<CRUDRecord> {
    return this.api.create(data)
  }

  async getById(id: number): Promise<T> {
    return this.api.getByIdParsed<T>(id)
  }

  async getList(conditions: CRUDQueryConditions = {}): Promise<CRUDPaginatedResponse> {
    return this.api.getListParsed<T>(conditions)
  }

  async update(id: number, data: T): Promise<CRUDRecord> {
    return this.api.update(id, data)
  }

  async delete(id: number): Promise<void> {
    return this.api.delete(id)
  }

  async batchDelete(ids: number[]): Promise<void> {
    return this.api.batchDelete(ids)
  }

  async getCount(conditions: Omit<CRUDQueryConditions, 'page' | 'limit'> = {}): Promise<number> {
    return this.api.getCount(conditions)
  }
}

/**
 * 创建类型化的CRUD API实例
 * @example
 * interface UserData {
 *   name: string
 *   email: string
 * }
 * 
 * const userCrud = createTypedCRUD<UserData>()
 * const user = await userCrud.create({ name: 'John', email: 'john@example.com' })
 */
export function createTypedCRUD<T = any>(): TypedCRUDApi<T> {
  return new TypedCRUDApi<T>()
}
