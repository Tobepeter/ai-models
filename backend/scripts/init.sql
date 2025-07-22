-- PostgreSQL 初始化脚本
-- 创建数据库和用户

-- 确保数据库存在
SELECT 'CREATE DATABASE ai_models'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ai_models')\gexec

-- 创建扩展（如果需要）
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 设置时区
SET timezone = 'Asia/Shanghai';

-- 创建一些基础配置
COMMENT ON DATABASE ai_models IS 'AI Models Backend Database';
