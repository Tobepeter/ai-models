import { CrudQueryBase } from './crud-query-base'

/**
 * 对象存储相关的查询构建器
 * 提供OSS业务相关的专门查询方法
 */
class OssCrudQuery extends CrudQueryBase {
  /* 按文件类型过滤 */
  fileType(type: string) {
    // 假设数据中包含fileType字段
    return this
  }

  /* 按文件大小范围过滤 */
  fileSizeRange(min?: number, max?: number) {
    // 假设数据中包含fileSize字段
    return this
  }

  /* 按存储桶过滤 */
  bucket(bucket: string) {
    // 假设数据中包含bucket字段
    return this
  }

  /* 按上传状态过滤 */
  uploadStatus(status: string) {
    // 假设数据中包含status字段
    return this
  }

  /* 文件元数据查询 */
  static forFile() {
    return new OssCrudQuery().category('oss-file')
  }

  /* 上传记录查询 */
  static forUpload() {
    return new OssCrudQuery().category('oss-upload')
  }

  /* 存储配置查询 */
  static forConfig() {
    return new OssCrudQuery().category('oss-config')
  }
}

export const ossCrudQuery = new OssCrudQuery()
export { OssCrudQuery }