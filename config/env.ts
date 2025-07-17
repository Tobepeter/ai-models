import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import packageJson from '../package.json'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../')

export const isGithub = process.env.GITHUB_ACTIONS === 'true'
export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'

export const repoName = packageJson.name
export const repoVersion = packageJson.version

export const ossEnable = process.env.OSS_DEPLOY_ENABLE === 'true'
export const ossBucket = process.env.OSS_BUCKET || ''
export const ossRegion = process.env.OSS_REGION || ''
export const ossAccessKeyId = process.env.OSS_ACCESS_KEY_ID || ''
export const ossAccessKeySecret = process.env.OSS_ACCESS_KEY_SECRET || ''

// NOTE: 这个暂时不让配置，防止 oss 弄得太乱了
export const ossPrefix = `/web/${repoName}/`

export const githubRepository = process.env.GITHUB_REPOSITORY

export const projectRootDir = projectRoot
