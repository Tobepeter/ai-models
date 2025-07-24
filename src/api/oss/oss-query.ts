import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ossApi } from './oss-api'
import { SignRequest, HashifyNameRequest, FileDeleteRequest, FileUrlRequest } from '../types/api-types'

/** OSS相关React Query hooks */

/** 获取STS临时凭证 */
export const useSTSCredentials = () => {
  return useQuery({
    queryKey: ['oss', 'sts'],
    queryFn: ossApi.getSTSCredentials,
    staleTime: 50 * 60 * 1000, // 50分钟，STS凭证通常1小时过期
    refetchOnWindowFocus: false,
  })
}

/** 获取文件列表 */
export const useFileList = () => {
  return useQuery({
    queryKey: ['oss', 'files'],
    queryFn: ossApi.getFileList,
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

/** 获取上传签名 */
export const useSignToUpload = () => {
  return useMutation({
    mutationFn: ossApi.signToUpload,
    onError: (error) => {
      console.error('获取上传签名失败:', error)
    },
  })
}

/** 获取下载签名 */
export const useSignToFetch = () => {
  return useMutation({
    mutationFn: ossApi.signToFetch,
    onError: (error) => {
      console.error('获取下载签名失败:', error)
    },
  })
}

/** 生成哈希文件名 */
export const useHashifyName = () => {
  return useMutation({
    mutationFn: ossApi.hashifyName,
    onError: (error) => {
      console.error('生成哈希文件名失败:', error)
    },
  })
}

/** 上传文件 */
export const useUploadFile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ file, objectKey }: { file: File; objectKey?: string }) => 
      ossApi.uploadFile(file, objectKey),
    onSuccess: () => {
      // 上传成功后刷新文件列表
      queryClient.invalidateQueries({ queryKey: ['oss', 'files'] })
    },
    onError: (error) => {
      console.error('上传文件失败:', error)
    },
  })
}

/** 删除文件 */
export const useDeleteFile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ossApi.deleteFile,
    onSuccess: () => {
      // 删除成功后刷新文件列表
      queryClient.invalidateQueries({ queryKey: ['oss', 'files'] })
    },
    onError: (error) => {
      console.error('删除文件失败:', error)
    },
  })
}

/** 获取文件URL */
export const useGetFileURL = () => {
  return useMutation({
    mutationFn: ossApi.getFileURL,
    onError: (error) => {
      console.error('获取文件URL失败:', error)
    },
  })
}
