import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { QuickEdit } from '@/components/common/quick-edit'
import { notify } from '@/components/common/notify'

export default function TestQuickAction() {
	const [bioValue, setBioValue] = useState('这是一个可编辑的个性签名示例')
	const [titleValue, setTitleValue] = useState('可编辑标题')
	const [emptyValue, setEmptyValue] = useState('')

	return (
		<div className="p-6 space-y-6 max-w-4xl">
			<div className="text-xl font-semibold mb-4">QuickEdit 组件测试</div>

			{/* QuickEdit 基础用法 */}
			<Card>
				<CardHeader>
					<CardTitle>QuickEdit - 基础用法</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<div className="text-sm font-medium mb-2">个性签名</div>
						<QuickEdit
							value={bioValue}
							placeholder="请输入个性签名..."
							maxLength={50}
							showCharCount={true}
							onSubmit={(newValue, originalValue) => {
								setBioValue(newValue)
								notify.success(`签名已更新: ${newValue}`)
								console.log('onSubmit:', { newValue, originalValue })
							}}
							onCancel={(originalValue) => {
								notify.info('取消编辑')
								console.log('onCancel:', originalValue)
							}}
							onSubmitChange={(newValue, originalValue) => {
								console.log('onSubmitChange - 内容有变化:', { newValue, originalValue })
							}}
							textClassName="text-sm text-muted-foreground"
						/>
					</div>
				</CardContent>
			</Card>

			{/* QuickEdit 不同样式 */}
			<Card>
				<CardHeader>
					<CardTitle>QuickEdit - 样式变化</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<div className="text-sm font-medium mb-2">标题（左侧图标）</div>
						<QuickEdit
							value={titleValue}
							placeholder="请输入标题..."
							iconPosition="left"
							onSubmit={(newValue) => {
								setTitleValue(newValue)
								notify.success('标题已更新')
							}}
							textClassName="text-lg font-semibold"
						/>
					</div>

					<div>
						<div className="text-sm font-medium mb-2">无图标版本（hover 提示可编辑）</div>
						<QuickEdit
							value={emptyValue}
							placeholder="点击这里编辑..."
							showEditIcon={false}
							onSubmit={(newValue) => {
								setEmptyValue(newValue)
								notify.success('内容已保存')
							}}
							textClassName="text-sm italic text-muted-foreground"
							containerClassName="border border-dashed border-gray-300 rounded p-2"
						/>
					</div>
				</CardContent>
			</Card>

			{/* QuickEdit 高级功能 */}
			<Card>
				<CardHeader>
					<CardTitle>QuickEdit - 高级功能演示</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<div className="text-sm font-medium mb-2">模拟异步保存</div>
						<QuickEdit
							value="异步保存示例"
							placeholder="输入内容..."
							onSubmit={async (newValue) => {
								// 模拟异步保存
								notify.info('正在保存...')
								await new Promise((resolve) => setTimeout(resolve, 1000))
								notify.success('保存成功!')
								console.log('异步保存完成:', newValue)
							}}
							onSubmitChange={async (newValue, originalValue) => {
								console.log('内容变化，触发自动保存:', { newValue, originalValue })
							}}
						/>
					</div>

					<div>
						<div className="text-sm font-medium mb-2">限制字符长度（最多10字符）</div>
						<QuickEdit
							value="短文本"
							placeholder="最多10个字符..."
							maxLength={10}
							showCharCount={true}
							onSubmit={(newValue) => {
								notify.success(`保存成功: ${newValue}`)
							}}
						/>
					</div>

					<div>
						<div className="text-sm font-medium mb-2">不允许空值（用户名场景）</div>
						<QuickEdit
							value="用户名不能为空"
							placeholder="输入用户名..."
							allowEmpty={false}
							onSubmit={(newValue) => {
								notify.success(`用户名更新: ${newValue}`)
							}}
							textClassName="font-medium"
						/>
					</div>
				</CardContent>
			</Card>

			{/* 使用说明 */}
			<Card>
				<CardHeader>
					<CardTitle>使用说明</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-muted-foreground space-y-2">
						<p>
							<strong>基本交互：</strong>
						</p>
						<ul className="list-disc list-inside space-y-1 ml-4">
							<li>有编辑图标时：只能点击图标触发编辑</li>
							<li>无编辑图标时：点击文本触发编辑，hover 显示可编辑提示</li>
							<li>按 Enter 键提交编辑</li>
							<li>按 ESC 键取消编辑</li>
							<li>失去焦点时自动提交</li>
						</ul>

						<p className="pt-2">
							<strong>回调函数：</strong>
						</p>
						<ul className="list-disc list-inside space-y-1 ml-4">
							<li>
								<code>onSubmit</code>: 每次提交时触发
							</li>
							<li>
								<code>onCancel</code>: 取消编辑时触发
							</li>
							<li>
								<code>onSubmitChange</code>: 只有内容真正变化时才触发
							</li>
						</ul>

						<p className="pt-2">
							<strong>特殊功能：</strong>
						</p>
						<ul className="list-disc list-inside space-y-1 ml-4">
							<li>
								<code>allowEmpty={false}</code>: 不允许空值，空值时会回滚到原始内容
							</li>
							<li>
								<code>maxLength</code>: 字符长度限制，默认15字符
							</li>
							<li>
								<code>showCharCount</code>: 显示字符计数
							</li>
							<li>
								<code>noAutoTrim</code>: 禁用自动去除首尾空格
							</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
