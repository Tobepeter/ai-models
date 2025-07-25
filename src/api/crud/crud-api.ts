import { axClient } from '../ax-client'
import { CrudRecord, CRUDPaginatedResponse, CRUDQueryConditions } from '../types/crud-types'
import { CountResponse, ApiResp } from '../common'

// 通用的增删改查
class CrudApi {
	private baseUrl = '/crud'

	// 创建记录
	async create<T = any>(data: T, category?: string) {
		const res = await axClient.post<ApiResp<CrudRecord>>(this.baseUrl, {
			category,
			data: JSON.stringify(data),
		})
		if (res.data.code !== 200) throw new Error(res.data.msg || '创建失败')
		return res.data.data!
	}

	// 根据ID获取记录(原始数据)
	async getByIdRaw(id: number) {
		const res = await axClient.get<ApiResp<CrudRecord>>(`${this.baseUrl}/${id}`)
		if (res.data.code !== 200) throw new Error(res.data.msg || '获取失败')
		return res.data.data!
	}

	// 根据ID获取记录(解析数据)
	async getById(id: number) {
		const rec = await this.getByIdRaw(id)
		return JSON.parse(rec.data)
	}

	// 获取记录列表 - 原始数据
	async getListRaw(conds: CRUDQueryConditions = {}) {
		const params = new URLSearchParams()
		Object.entries(conds).forEach(([k, v]) => {
			if (v !== undefined && v !== null) params.append(k, String(v))
		})
		const res = await axClient.get<ApiResp<CRUDPaginatedResponse>>(`${this.baseUrl}?${params}`)
		if (res.data.code !== 200) throw new Error(res.data.msg || '获取列表失败')
		return res.data.data!
	}

	// 获取记录列表 - 解析数据
	async getList(conds: CRUDQueryConditions = {}) {
		const r = await this.getListRaw(conds)
		const data = r.data.map((rec) => ({
			id: rec.id,
			category: rec.category,
			created_at: rec.created_at,
			updated_at: rec.updated_at,
			...JSON.parse(rec.data),
		}))
		return {
			data,
			pagination: r.pagination,
		}
	}

	// 更新记录
	async update<T = any>(id: number, data: T, category?: string) {
		const res = await axClient.put<ApiResp<CrudRecord>>(`${this.baseUrl}/${id}`, {
			category,
			data: JSON.stringify(data),
		})
		if (res.data.code !== 200) throw new Error(res.data.msg || '更新失败')
		return res.data.data!
	}

	// 删除记录（软删除）
	async delete(id: number) {
		const res = await axClient.delete<ApiResp<void>>(`${this.baseUrl}/${id}`)
		if (res.data.code !== 200) throw new Error(res.data.msg || '删除失败')
	}

	// 批量删除记录
	async batchDelete(ids: number[]) {
		const res = await axClient.post<ApiResp<void>>(`${this.baseUrl}/batch-delete`, { ids })
		if (res.data.code !== 200) throw new Error(res.data.msg || '批量删除失败')
	}

	// 获取记录总数
	async getCount(conds: Omit<CRUDQueryConditions, 'page' | 'limit'> = {}) {
		const params = new URLSearchParams()
		Object.entries(conds).forEach(([k, v]) => {
			if (v !== undefined && v !== null) params.append(k, String(v))
		})
		const res = await axClient.get<ApiResp<CountResponse>>(`${this.baseUrl}/count?${params}`)
		if (res.data.code !== 200) throw new Error(res.data.msg || '获取计数失败')
		return res.data.data!.count
	}
}

export const crudApi = new CrudApi()
