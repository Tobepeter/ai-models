import { CrudQueryBase } from './crud-query-base'

/**
 * 认证相关的查询构建器
 * 提供认证业务相关的专门查询方法
 */
class AuthCrudQuery extends CrudQueryBase {
  /* 按用户ID过滤 */
  userId(userId: string | number) {
    // 假设数据中包含userId字段
    return this
  }

  /* 按登录状态过滤 */
  loginStatus(status: string) {
    // 假设数据中包含status字段
    return this
  }

  /* 按权限级别过滤 */
  permissionLevel(level: string) {
    // 假设数据中包含level字段
    return this
  }

  /* 按会话状态过滤 */
  sessionStatus(status: string) {
    // 假设数据中包含sessionStatus字段
    return this
  }

  /* 登录记录查询 */
  static forLogin() {
    return new AuthCrudQuery().category('auth-login')
  }

  /* 会话记录查询 */
  static forSession() {
    return new AuthCrudQuery().category('auth-session')
  }

  /* 权限配置查询 */
  static forPermission() {
    return new AuthCrudQuery().category('auth-permission')
  }
}

export const authCrudQuery = new AuthCrudQuery()
export { AuthCrudQuery }