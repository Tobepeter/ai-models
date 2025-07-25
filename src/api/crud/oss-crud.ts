import { CrudBase } from './crud-base'

/**
 * 对象存储相关的CRUD操作
 * 用于管理文件元数据、上传记录、存储配置等数据
 */
class OssCrudApi extends CrudBase {
  constructor() {
    super()
  }

  /* 创建文件元数据 */
  async createFileMetadata(data: any) {
    return this.create(data, 'oss-file')
  }

  /* 创建上传记录 */
  async createUploadRecord(data: any) {
    return this.create(data, 'oss-upload')
  }

  /* 创建存储配置 */
  async createStorageConfig(data: any) {
    return this.create(data, 'oss-config')
  }

  /* 获取文件元数据列表 */
  async getFileList(conditions = {}) {
    return this.getList({ ...conditions, category: 'oss-file' })
  }

  /* 获取上传记录列表 */
  async getUploadList(conditions = {}) {
    return this.getList({ ...conditions, category: 'oss-upload' })
  }

  /* 获取存储配置列表 */
  async getStorageConfigList(conditions = {}) {
    return this.getList({ ...conditions, category: 'oss-config' })
  }
}

export const ossCrudApi = new OssCrudApi()