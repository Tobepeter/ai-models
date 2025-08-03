import { Empty } from '@/components/common/empty'
import { useNavigate } from 'react-router-dom'
import { FileX } from 'lucide-react'

/** 404页面组件 */
export const NotFound = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center" data-slot="not-found">
      <Empty
        icon={<FileX className="h-16 w-16 text-muted-foreground" />}
        title="页面未找到"
        desc="抱歉，您访问的页面不存在\n请检查网址是否正确"
        buttonText="返回首页"
        onClickButton={handleGoHome}
      />
    </div>
  )
}
