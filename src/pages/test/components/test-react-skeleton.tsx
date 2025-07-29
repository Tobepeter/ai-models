import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const TestReactSkeleton = () => {
  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-4">React Loading Skeleton 示例</h2>
      
      {/* 基础骨架屏 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">基础骨架屏</h3>
        <div className="space-y-2">
          <Skeleton height={20} />
          <Skeleton height={20} width="80%" />
          <Skeleton height={20} width="60%" />
        </div>
      </div>

      {/* 圆形头像骨架屏 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">头像和文本</h3>
        <div className="flex items-center space-x-3">
          <Skeleton circle height={40} width={40} />
          <div className="flex-1 space-y-2">
            <Skeleton height={16} width="30%" />
            <Skeleton height={14} width="50%" />
          </div>
        </div>
      </div>

      {/* 卡片骨架屏 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">卡片骨架屏</h3>
        <div className="border rounded-lg p-4 space-y-3">
          <Skeleton height={200} />
          <div className="space-y-2">
            <Skeleton height={20} />
            <Skeleton height={16} width="70%" />
            <div className="flex justify-between">
              <Skeleton height={16} width="20%" />
              <Skeleton height={16} width="15%" />
            </div>
          </div>
        </div>
      </div>

      {/* 列表骨架屏 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">列表骨架屏</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Skeleton circle height={32} width={32} />
              <div className="flex-1 space-y-2">
                <Skeleton height={16} />
                <Skeleton height={14} width="60%" />
              </div>
              <Skeleton height={24} width={60} />
            </div>
          ))}
        </div>
      </div>

      {/* 自定义主题 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">自定义主题</h3>
        <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
          <div className="space-y-2">
            <Skeleton height={20} />
            <Skeleton height={20} width="70%" />
            <Skeleton height={20} width="50%" />
          </div>
        </SkeletonTheme>
      </div>

      {/* 深色主题 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">深色主题</h3>
        <SkeletonTheme baseColor="#374151" highlightColor="#4b5563">
          <div className="bg-gray-800 p-4 rounded-lg space-y-2">
            <Skeleton height={20} />
            <Skeleton height={20} width="80%" />
            <Skeleton height={20} width="60%" />
          </div>
        </SkeletonTheme>
      </div>

      {/* 模拟真实内容 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">模拟真实内容布局</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton height={150} />
              <div className="p-4 space-y-3">
                <Skeleton height={18} />
                <Skeleton height={14} count={2} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton circle height={24} width={24} />
                    <Skeleton height={14} width={80} />
                  </div>
                  <Skeleton height={14} width={60} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestReactSkeleton