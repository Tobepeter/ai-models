import { useState } from 'react'
import numeral from 'numeral'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

/**
 * 测试 numeral.js 数字格式化库的各种用法
 */
const TestNumeralJs = () => {
  const [customValue, setCustomValue] = useState('1234567.89')
  const [customFormat, setCustomFormat] = useState('0,0.00')

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // 格式化示例数据
  const formatExamples = [
    { value: 1234.567, format: '0,0', description: '千位分隔符' },
    { value: 1234.567, format: '0,0.00', description: '两位小数' },
    { value: 1234.567, format: '0,0.0000', description: '四位小数' },
    { value: 0.1234, format: '0.00%', description: '百分比' },
    { value: 1234567, format: '0.0a', description: '简化单位' },
    { value: 1234567, format: '0,0a', description: '千位分隔+简化单位' },
    { value: -1234.567, format: '0,0.00', description: '负数' },
    { value: 1234567, format: '0b', description: '字节单位' },
    { value: 1024, format: '0.00b', description: '字节单位(小数)' },
  ]

  // 货币格式示例
  const currencyExamples = [
    { value: 1234.567, format: '$0,0.00', description: '美元格式' },
    { value: 1234.567, format: '¥0,0.00', description: '人民币格式' },
    { value: 1234.567, format: '€0,0.00', description: '欧元格式' },
    { value: 1234567, format: '$0,0a', description: '简化美元' },
    { value: -1234.567, format: '($0,0.00)', description: '负数括号表示' },
  ]

  // 时间格式示例
  const timeExamples = [
    { value: 3661, format: '00:00:00', description: '时分秒格式' },
    { value: 123.45, format: '00:00', description: '分秒格式' },
    { value: 7265, format: '0:00:00', description: '时分秒(不补零)' },
  ]

  // 序数示例
  const ordinalExamples = [
    { value: 1, format: '0o', description: '序数词' },
    { value: 2, format: '0o', description: '序数词' },
    { value: 3, format: '0o', description: '序数词' },
    { value: 21, format: '0o', description: '序数词' },
    { value: 22, format: '0o', description: '序数词' },
    { value: 23, format: '0o', description: '序数词' },
    { value: 101, format: '0o', description: '序数词' },
    { value: 102, format: '0o', description: '序数词' },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Numeral.js 格式化展示</h1>
        <p className="text-muted-foreground">数字格式化库的各种用法示例</p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">基础格式</TabsTrigger>
          <TabsTrigger value="currency">货币格式</TabsTrigger>
          <TabsTrigger value="time">时间格式</TabsTrigger>
          <TabsTrigger value="ordinal">序数词</TabsTrigger>
          <TabsTrigger value="custom">自定义</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基础数字格式化</CardTitle>
              <CardDescription>常见的数字格式化用法</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formatExamples.map((example, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{example.description}</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(numeral(example.value).format(example.format))}
                      >
                        复制
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      原值: {example.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      格式: {example.format}
                    </div>
                    <Separator />
                    <div className="text-lg font-mono">
                      {numeral(example.value).format(example.format)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>货币格式化</CardTitle>
              <CardDescription>各种货币格式化示例</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currencyExamples.map((example, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{example.description}</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(numeral(example.value).format(example.format))}
                      >
                        复制
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      原值: {example.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      格式: {example.format}
                    </div>
                    <Separator />
                    <div className="text-lg font-mono">
                      {numeral(example.value).format(example.format)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>时间格式化</CardTitle>
              <CardDescription>将秒数转换为时间格式</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeExamples.map((example, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{example.description}</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(numeral(example.value).format(example.format))}
                      >
                        复制
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      原值: {example.value} 秒
                    </div>
                    <div className="text-sm text-muted-foreground">
                      格式: {example.format}
                    </div>
                    <Separator />
                    <div className="text-lg font-mono">
                      {numeral(example.value).format(example.format)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ordinal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>序数词格式化</CardTitle>
              <CardDescription>数字转换为序数词（1st, 2nd, 3rd...）</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ordinalExamples.map((example, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">第{example.value}个</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(numeral(example.value).format(example.format))}
                      >
                        复制
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      原值: {example.value}
                    </div>
                    <Separator />
                    <div className="text-lg font-mono">
                      {numeral(example.value).format(example.format)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>自定义格式化</CardTitle>
              <CardDescription>试试你自己的数值和格式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-value">数值</Label>
                  <Input
                    id="custom-value"
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="输入数值，如 1234567.89"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-format">格式</Label>
                  <Input
                    id="custom-format"
                    type="text"
                    value={customFormat}
                    onChange={(e) => setCustomFormat(e.target.value)}
                    placeholder="输入格式，如 0,0.00"
                  />
                </div>
              </div>
              
              <div className="p-6 bg-muted/50 rounded-lg">
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">格式化结果:</div>
                  <div className="text-2xl font-mono font-bold">
                    {(() => {
                      try {
                        const num = parseFloat(customValue)
                        if (isNaN(num)) return '请输入有效数字'
                        return numeral(num).format(customFormat)
                      } catch (error) {
                        return '格式错误'
                      }
                    })()}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const num = parseFloat(customValue)
                      if (!isNaN(num)) {
                        copyToClipboard(numeral(num).format(customFormat))
                      }
                    }}
                  >
                    复制结果
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">常用格式参考:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted/30 rounded font-mono">0,0 - 千位分隔符</div>
                  <div className="p-2 bg-muted/30 rounded font-mono">0,0.00 - 两位小数</div>
                  <div className="p-2 bg-muted/30 rounded font-mono">0.00% - 百分比</div>
                  <div className="p-2 bg-muted/30 rounded font-mono">$0,0.00 - 美元</div>
                  <div className="p-2 bg-muted/30 rounded font-mono">0.0a - 简化单位</div>
                  <div className="p-2 bg-muted/30 rounded font-mono">0b - 字节单位</div>
                  <div className="p-2 bg-muted/30 rounded font-mono">0o - 序数词</div>
                  <div className="p-2 bg-muted/30 rounded font-mono">00:00:00 - 时间</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TestNumeralJs