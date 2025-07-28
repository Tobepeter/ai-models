import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const UserStatistic = () => {
  const statistics = [
    { label: '文本对话次数', value: '128 次' },
    { label: '图像生成次数', value: '45 次' },
    { label: '音频生成次数', value: '12 次' },
    { label: '视频生成次数', value: '8 次' },
    { label: 'AI对比使用', value: '23 次' },
    { label: '本月活跃天数', value: '15 天' },
    { label: '总使用天数', value: '89 天' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>使用统计(随便mock的）</CardTitle>
        <CardDescription>您的AI助手使用情况</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {statistics.map((stat, idx) => (
          <div key={stat.label}>
            <div className="flex justify-between items-center">
              <span className="text-sm">{stat.label}</span>
              <span className="font-medium">{stat.value}</span>
            </div>
            {idx < statistics.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}