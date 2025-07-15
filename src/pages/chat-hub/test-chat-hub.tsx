import { useChatHubStore } from './chat-hub-store'
import { chatHubMgr } from './chat-hub-mgr'

/**
 * ChatHub 测试组件
 */
export const TestChatHub = () => {
	const { models, toggleModel } = useChatHubStore()
	const selectedModels = models.filter(m => m.enabled)

	return (
		<div className="p-4 space-y-4">
			<h2 className="text-lg font-semibold">ChatHub 测试</h2>

			{/* 全部模型列表 */}
			<div>
				<h3 className="text-md font-medium mb-2">全部模型 ({models.length})</h3>
				<div className="grid grid-cols-2 gap-2">
					{models.map((model) => (
						<div key={model.id} className="flex items-center gap-2 p-2 border rounded">
							<input type="checkbox" checked={model.enabled} onChange={() => toggleModel(model.id)} />
							<span className="text-sm">
								{model.name} ({model.platform})
							</span>
						</div>
					))}
				</div>
			</div>

			{/* 选中的模型 */}
			<div>
				<h3 className="text-md font-medium mb-2">已选中模型 ({selectedModels.length})</h3>
				<div className="space-y-1">
					{selectedModels.map((model) => (
						<div key={model.id} className="text-sm p-2 bg-blue-50 rounded">
							{model.name} - {model.platform}/{model.model}
						</div>
					))}
				</div>
			</div>

			{/* 测试按钮 */}
			<div className="space-x-2">
				<button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => console.log('Agent缓存:', chatHubMgr)}>
					查看Agent缓存
				</button>
				<button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => chatHubMgr.clearCache()}>
					清空缓存
				</button>
			</div>
		</div>
	)
}
