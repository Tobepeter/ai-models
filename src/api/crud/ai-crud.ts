import { CrudBase } from './crud-base'

/**
 * AI相关的CRUD操作
 * 用于管理AI模型、配置、历史记录等数据
 */
class AiCrudApi extends CrudBase {
  constructor() {
    super()
  }

  /* 创建AI配置 */
  async createConfig(data: any) {
    return this.create(data, 'ai-config')
  }

  /* 创建AI对话记录 */
  async createChatRecord(data: any) {
    return this.create(data, 'ai-chat')
  }

  /* 创建AI模型记录 */
  async createModelRecord(data: any) {
    return this.create(data, 'ai-model')
  }

  /* 获取AI配置列表 */
  async getConfigList(conditions = {}) {
    return this.getList({ ...conditions, category: 'ai-config' })
  }

  /* 获取AI对话记录列表 */
  async getChatList(conditions = {}) {
    return this.getList({ ...conditions, category: 'ai-chat' })
  }

  /* 获取AI模型记录列表 */
  async getModelList(conditions = {}) {
    return this.getList({ ...conditions, category: 'ai-model' })
  }
}

export const aiCrudApi = new AiCrudApi()