import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import packageJson from '../../package.json'
import dotenv from 'dotenv-flow'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
export const projectRoot = path.resolve(__dirname, '../../')

export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'
export const isMock = isDev && process.env.VITE_MOCK_MODE === 'true'
export const port = Number(process.env.VITE_PORT) || 5173

export const verbose = process.env.VERBOSE === 'true'

export const repoName = packageJson.name
export const repoVersion = packageJson.version

export const ossEnable = process.env.OSS_DEPLOY_ENABLE === 'true'

export const ossBucket = process.env.VITE_OSS_BUCKET || ''
export const ossRegion = process.env.VITE_OSS_REGION || ''
export const ossAccessKeyId = process.env.VITE_OSS_ACCESS_KEY_ID || ''
export const ossAccessKeySecret = process.env.VITE_OSS_ACCESS_KEY_SECRET || ''
export const ossRoleArn = process.env.OSS_ROLE_ARN || ''

// NOTE: 这个暂时不让配置，防止 oss 弄得太乱了
// OSS prefix 不能以 / 开头，必须以 / 结尾
export const ossPrefix = `web/${repoName}/`

export const isGithub = process.env.GITHUB_ACTIONS === 'true'
export const githubRepository = process.env.GITHUB_REPOSITORY

export const serverHost = process.env.SERVER_HOST || ''

// Docker 部署配置
export const dockerRegistry = process.env.DOCKER_REGISTRY || ''
export const dockerRegistryVpc = process.env.DOCKER_REGISTRY_VPC || ''
export const dockerNamespace = process.env.DOCKER_NAMESPACE || ''
export const dockerImageName = process.env.DOCKER_IMAGE_NAME || ''
export const dockerUsername = process.env.DOCKER_USERNAME || ''
export const dockerPassword = process.env.DOCKER_PASSWORD || ''
