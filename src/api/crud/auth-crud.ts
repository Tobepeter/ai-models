import { CrudBase } from './crud-base'

/**
 * 认证相关的CRUD操作
 * 用于管理用户会话、登录记录、权限配置等数据
 */
class AuthCrudApi extends CrudBase {
  constructor() {
    super()
  }

  /* 创建登录记录 */
  async createLoginRecord(data: any) {
    return this.create(data, 'auth-login')
  }

  /* 创建会话记录 */
  async createSessionRecord(data: any) {
    return this.create(data, 'auth-session')
  }

  /* 创建权限配置 */
  async createPermissionConfig(data: any) {
    return this.create(data, 'auth-permission')
  }

  /* 获取登录记录列表 */
  async getLoginList(conditions = {}) {
    return this.getList({ ...conditions, category: 'auth-login' })
  }

  /* 获取会话记录列表 */
  async getSessionList(conditions = {}) {
    return this.getList({ ...conditions, category: 'auth-session' })
  }

  /* 获取权限配置列表 */
  async getPermissionList(conditions = {}) {
    return this.getList({ ...conditions, category: 'auth-permission' })
  }
}

export const authCrudApi = new AuthCrudApi()