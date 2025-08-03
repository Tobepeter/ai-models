import { Empty } from '@/components/common/empty'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

/** 渲染错误页面组件 */
export const ErrorBoundary = () => {
  const navigate = useNavigate()

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" data-slot="error-boundary">
      <Empty
        icon={<AlertTriangle className="h-16 w-16 text-destructive" />}
        title="页面出错了"
        desc="抱歉，页面渲染时发生了错误\n请尝试刷新页面或返回首页"
        buttonText="刷新页面"
        onClickButton={handleReload}
      />
      <div className="mt-4">
        <button
          onClick={handleGoHome}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          返回首页
        </button>
      </div>
    </div>
  )
}
