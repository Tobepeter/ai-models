import { CrudQueryBase } from './crud-query-base'

/**
 * 用户相关的查询构建器
 * 提供用户业务相关的专门查询方法
 */
class UserCrudQuery extends CrudQueryBase {
  /* 按用户名过滤 */
  username(username: string) {
    // 假设数据中包含username字段
    return this
  }

  /* 按用户角色过滤 */
  role(role: string) {
    // 假设数据中包含role字段
    return this
  }

  /* 按用户状态过滤 */
  userStatus(status: string) {
    // 假设数据中包含status字段
    return this
  }

  /* 按操作类型过滤 */
  actionType(type: string) {
    // 假设数据中包含actionType字段
    return this
  }

  /* 用户资料查询 */
  static forProfile() {
    return new UserCrudQuery().category('user-profile')
  }

  /* 用户偏好查询 */
  static forPreference() {
    return new UserCrudQuery().category('user-preference')
  }

  /* 操作记录查询 */
  static forAction() {
    return new UserCrudQuery().category('user-action')
  }
}

export const userCrudQuery = new UserCrudQuery()
export { UserCrudQuery }