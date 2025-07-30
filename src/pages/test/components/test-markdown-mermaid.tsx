import { Markdown } from '@/components/common/markdown'

/**
 * Markdown Mermaid 图表测试
 */
const TestMarkdownMermaid = () => {
	const mermaidCases = [
		{
			title: '流程图 (Flowchart)',
			content: `## 简单流程图
\`\`\`mermaid
flowchart TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主页]
    B -->|否| D[跳转登录页]
    D --> E[用户输入]
    E --> F{验证通过?}
    F -->|是| C
    F -->|否| G[显示错误]
    G --> E
    C --> H[结束]
\`\`\``,
		},
		{
			title: '时序图 (Sequence Diagram)',
			content: `## API 调用时序图
\`\`\`mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant A as API服务
    participant D as 数据库
    
    U->>F: 点击登录
    F->>A: POST /login
    A->>D: 查询用户
    D-->>A: 返回用户信息
    A-->>F: 返回JWT Token
    F-->>U: 登录成功
    
    Note over F,A: Token 有效期 24小时
\`\`\``,
		},
		{
			title: '甘特图 (Gantt Chart)',
			content: `## 项目进度甘特图
\`\`\`mermaid
gantt
    title Markdown 功能开发计划
    dateFormat  YYYY-MM-DD
    section 基础功能
    安装依赖           :done,    dep1, 2024-01-01, 1d
    创建组件           :done,    comp1, after dep1, 2d
    基础语法支持       :done,    basic, after comp1, 3d
    section 高级功能
    代码高亮           :done,    highlight, after basic, 2d
    Mermaid支持        :active,  mermaid, after highlight, 3d
    数学公式           :         math, after mermaid, 2d
    section 优化
    性能优化           :         perf, after math, 3d
    样式优化           :         style, after perf, 2d
\`\`\``,
		},
		{
			title: '类图 (Class Diagram)',
			content: `## 聊天系统类图
\`\`\`mermaid
classDiagram
    class ChatMsg {
        +string id
        +string type
        +string content
        +MediaType mediaType
        +number timestamp
        +MsgStatus status
        +string error
        +MediaData mediaData
    }
    
    class ChatStore {
        +Msg[] msgList
        +MediaType currMediaType
        +boolean isLoading
        +addMsg(msg)
        +updateMsg(id, updates)
        +genAIResp(input, type)
    }
    
    class Markdown {
        +string content
        +boolean noMarkdown
        +render()
    }
    
    ChatStore --> ChatMsg : manages
    ChatMsg --> Markdown : uses
\`\`\``,
		},
		{
			title: '状态图 (State Diagram)',
			content: `## 消息状态流转
\`\`\`mermaid
stateDiagram-v2
    [*] --> Pending : 创建消息
    Pending --> Generating : 开始生成
    Generating --> Success : 生成完成
    Generating --> Error : 生成失败
    Error --> Pending : 重试
    Success --> [*] : 完成
    
    note right of Generating
        流式输出阶段
        实时更新内容
    end note
\`\`\``,
		},
		{
			title: '饼图 (Pie Chart)',
			content: `## 技术栈占比
\`\`\`mermaid
pie title 项目技术栈分布
    "React" : 35
    "TypeScript" : 25
    "Tailwind CSS" : 20
    "Vite" : 10
    "其他库" : 10
\`\`\``,
		},
		{
			title: 'Git 分支图',
			content: `## Git 工作流
\`\`\`mermaid
gitGraph
    commit id: "初始化项目"
    branch feature/markdown
    checkout feature/markdown
    commit id: "添加基础组件"
    commit id: "实现代码高亮"
    commit id: "添加Mermaid支持"
    checkout main
    merge feature/markdown
    commit id: "发布v1.0"
    branch feature/optimization
    checkout feature/optimization
    commit id: "性能优化"
    commit id: "样式优化"
\`\`\``,
		},
		{
			title: '复杂流程图',
			content: `## AI 对话处理流程
\`\`\`mermaid
flowchart LR
    A[用户输入] --> B{输入类型}
    B -->|文本| C[文本处理]
    B -->|图片| D[图片处理]
    B -->|音频| E[音频处理]
    B -->|视频| F[视频处理]
    
    C --> G[AI模型调用]
    D --> H[图片生成模型]
    E --> I[音频生成模型]
    F --> J[视频生成模型]
    
    G --> K{流式输出?}
    K -->|是| L[实时渲染]
    K -->|否| M[完整渲染]
    
    H --> N[图片展示]
    I --> O[音频播放]
    J --> P[视频播放]
    
    L --> Q[Markdown解析]
    M --> Q
    Q --> R[最终展示]
    
    N --> R
    O --> R
    P --> R
\`\`\``,
		},
	]

	return (
		<div className="p-4 max-w-6xl mx-auto" data-slot="test-markdown-mermaid">
			<h2 className="text-2xl font-bold mb-6">Mermaid 图表测试</h2>
			<div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
				<p className="text-sm text-yellow-800">
					<strong>注意</strong>: Mermaid 包体积较大 (~500KB)，已标记为待优化项目。 当前使用暗色主题，后续需要适配主题切换。
				</p>
			</div>
			<div className="space-y-8">
				{mermaidCases.map((testCase, idx) => (
					<div key={idx} className="border rounded-lg p-4">
						<h3 className="text-lg font-semibold mb-4">{testCase.title}</h3>
						<div className="bg-muted/50 rounded-md p-4">
							<Markdown content={testCase.content} />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default TestMarkdownMermaid
