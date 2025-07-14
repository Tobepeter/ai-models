# 阿里云OSS STS配置说明

## 概述

本项目使用阿里云OSS的STS（Security Token Service）临时凭证来实现安全的文件上传功能。STS可以提供临时访问凭证，避免在前端暴露长期访问密钥。

## 配置步骤

### 1. 创建RAM用户

1. 登录阿里云控制台，进入RAM控制台
2. 创建RAM用户，获取AccessKey ID和AccessKey Secret
3. 为用户授予`AliyunSTSAssumeRoleAccess`权限

### 2. 创建RAM角色

1. 在RAM控制台创建角色，选择"阿里云账号"作为可信实体
2. 配置信任策略，允许上述RAM用户扮演此角色
3. 为角色授予OSS相关权限（如`AliyunOSSFullAccess`或自定义权限）

### 3. 配置环境变量

在项目根目录创建`.env.local`文件：

```env
# 阿里云OSS配置
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret  
OSS_ROLE_ARN=acs:ram::your_account_id:role/your-role-name
```

### 4. 启动OSS服务器

```bash
npm run oss-server
```

## 安全特性

1. **临时凭证**：STS提供的临时凭证有时间限制，默认1小时过期
2. **最小权限**：角色只授予必要的OSS操作权限
3. **无密钥暴露**：前端不会接触到长期访问密钥
4. **权限控制**：可以通过STS策略限制访问的资源范围

## 工作流程

1. 前端向后端请求STS临时凭证
2. 后端使用RAM用户身份调用STS服务
3. STS返回临时凭证（AccessKeyId、AccessKeySecret、SecurityToken）
4. 前端使用临时凭证直接上传文件到OSS
5. 临时凭证过期后自动失效

## 故障排除

### 常见错误

1. **NoSuchRole**: 检查角色ARN是否正确
2. **AssumeRolePermissionDenied**: 检查用户是否有扮演角色的权限
3. **InvalidPolicy**: 检查权限策略格式是否正确
4. **TokenExpired**: 临时凭证已过期，需要重新获取

### 调试建议

1. 检查环境变量是否正确配置
2. 验证RAM用户权限
3. 确认角色信任策略包含正确的用户
4. 查看控制台日志获取详细错误信息