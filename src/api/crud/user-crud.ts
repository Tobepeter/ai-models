import { CrudBase } from './crud-base'

/**
 * 用户相关的CRUD操作
 * 用于管理用户资料、偏好设置、操作记录等数据
 */
class UserCrudApi extends CrudBase {
  constructor() {
    super()
  }

  /* 创建用户资料 */
  async createUserProfile(data: any) {
    return this.create(data, 'user-profile')
  }

  /* 创建用户偏好 */
  async createUserPreference(data: any) {
    return this.create(data, 'user-preference')
  }

  /* 创建操作记录 */
  async createUserAction(data: any) {
    return this.create(data, 'user-action')
  }

  /* 获取用户资料列表 */
  async getProfileList(conditions = {}) {
    return this.getList({ ...conditions, category: 'user-profile' })
  }

  /* 获取用户偏好列表 */
  async getPreferenceList(conditions = {}) {
    return this.getList({ ...conditions, category: 'user-preference' })
  }

  /* 获取操作记录列表 */
  async getActionList(conditions = {}) {
    return this.getList({ ...conditions, category: 'user-action' })
  }
}

export const userCrudApi = new UserCrudApi()