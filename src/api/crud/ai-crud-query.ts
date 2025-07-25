import { CrudQueryBase } from './crud-query-base'

/**
 * AI相关的查询构建器
 * 提供AI业务相关的专门查询方法
 */
class AiCrudQuery extends CrudQueryBase {
  /* 按AI模型类型过滤 */
  modelType(type: string) {
    // 假设数据中包含modelType字段
    return this
  }

  /* 按AI提供商过滤 */
  provider(provider: string) {
    // 假设数据中包含provider字段
    return this
  }

  /* 按对话状态过滤 */
  chatStatus(status: string) {
    // 假设数据中包含status字段
    return this
  }

  /* 按配置类型过滤 */
  configType(type: string) {
    // 假设数据中包含configType字段
    return this
  }

  /* AI配置查询 */
  static forConfig() {
    return new AiCrudQuery().category('ai-config')
  }

  /* AI对话查询 */
  static forChat() {
    return new AiCrudQuery().category('ai-chat')
  }

  /* AI模型查询 */
  static forModel() {
    return new AiCrudQuery().category('ai-model')
  }
}

export const aiCrudQuery = new AiCrudQuery()
export { AiCrudQuery }