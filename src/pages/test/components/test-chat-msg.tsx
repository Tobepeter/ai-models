import { ChatMsg } from '@/pages/chat/components/chat-msg'
import { Msg } from '@/pages/chat/chat-type'
import { dummy } from '@/utils/dummy'
import { v4 as uuidv4 } from 'uuid'

/**
 * 聊天消息组件测试
 */
const TestChatMsg = () => {
	const testMsgs: Msg[] = [
		// 用户文本消息
		{
			id: uuidv4(),
			type: 'user',
			content: '你好，我想了解一下 AI 的工作原理。',
			mediaType: 'text',
			timestamp: Date.now(),
			status: 'success',
		},
		// 长文本消息
		{
			id: uuidv4(),
			type: 'user',
			content: '你好，我想了解一下 AI 的工作原理。'.repeat(20),
			mediaType: 'text',
			timestamp: Date.now(),
			status: 'success',
		},
		// 包含换行的文本消息
		{
			id: uuidv4(),
			type: 'user',
			content:
				'请帮我分析一下这个复杂的问题：\n\n1. 人工智能在未来十年内会如何影响各个行业？\n2. 机器学习和深度学习的区别是什么？\n3. 自然语言处理技术的发展趋势如何？\n\n特别是在以下几个方面：\n- 医疗健康领域的应用\n- 金融科技的创新\n- 教育行业的变革\n- 制造业的智能化升级\n\n希望能得到详细的分析和建议，谢谢！',
			mediaType: 'text',
			timestamp: Date.now(),
			status: 'success',
		},
		// 助手文本消息
		{
			id: uuidv4(),
			type: 'assistant',
			content: '你好！AI 的工作原理主要基于机器学习和深度学习技术。简单来说，AI 系统通过大量数据训练，学习识别模式和规律，然后根据这些学习到的知识来处理新的输入和生成相应的输出。',
			mediaType: 'text',
			timestamp: Date.now(),
			status: 'success',
		},
		// 用户图片消息
		{
			id: uuidv4(),
			type: 'user',
			content: '帮我分析一下这张图片',
			mediaType: 'image',
			timestamp: Date.now(),
			status: 'success',
			mediaData: {
				url: dummy.getImage('landscape'),
				filename: 'test-image.jpg',
				size: '45KB',
			},
		},
		// 助手生成中状态
		{
			id: uuidv4(),
			type: 'assistant',
			content: '',
			mediaType: 'image',
			timestamp: Date.now(),
			status: 'pending',
		},
		// 助手生成失败
		{
			id: uuidv4(),
			type: 'assistant',
			content: '',
			mediaType: 'text',
			timestamp: Date.now(),
			status: 'error',
			error: '网络连接失败，请稍后重试',
		},
		// 用户音频消息
		{
			id: uuidv4(),
			type: 'user',
			content: '请听一下这段音频',
			mediaType: 'audio',
			timestamp: Date.now(),
			status: 'success',
			mediaData: {
				url: dummy.audio,
				filename: 'audio-sample.wav',
				duration: '0:15',
			},
		},
		// 助手视频生成中
		{
			id: uuidv4(),
			type: 'assistant',
			content: '',
			mediaType: 'video',
			timestamp: Date.now(),
			status: 'pending',
		},
		// 助手成功生成视频
		{
			id: uuidv4(),
			type: 'assistant',
			content: '',
			mediaType: 'video',
			timestamp: Date.now(),
			status: 'success',
			mediaData: {
				url: dummy.video,
				filename: 'generated-video.mp4',
				duration: '0:30',
				size: '1.2MB',
			},
		},
		// 助手markdown - 基础语法
		{
			id: uuidv4(),
			type: 'assistant',
			content: `# AI 技术概述

人工智能（AI）是一个快速发展的领域，涵盖了多个技术分支：

## 主要技术分类

### 1. 机器学习 (Machine Learning)
- **监督学习**: 使用标记数据训练模型
- **无监督学习**: 从未标记数据中发现模式
- **强化学习**: 通过奖励机制学习最优策略

### 2. 深度学习 (Deep Learning)
深度学习是机器学习的一个子集，使用多层神经网络来模拟人脑的工作方式。

\`\`\`python
# 简单的神经网络示例
import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')
])
\`\`\`

## 应用领域

| 领域 | 应用 | 成熟度 |
|------|------|--------|
| 计算机视觉 | 图像识别、目标检测 | ⭐⭐⭐⭐⭐ |
| 自然语言处理 | 机器翻译、文本生成 | ⭐⭐⭐⭐ |
| 语音识别 | 语音助手、转录 | ⭐⭐⭐⭐ |

> **注意**: AI 技术仍在快速发展中，新的突破不断涌现。

---

想了解更多信息，可以访问 [OpenAI](https://openai.com) 或 [Google AI](https://ai.google)。`,
			mediaType: 'text',
			timestamp: Date.now(),
			status: 'success',
		},
		// 助手markdown - 代码示例
		{
			id: uuidv4(),
			type: 'assistant',
			content: `## 代码实现示例

以下是一个简单的机器学习模型训练过程：

### 数据预处理
\`\`\`javascript
// 数据清洗和预处理
const preprocessData = (rawData) => {
  return rawData
    .filter(item => item.value !== null)
    .map(item => ({
      ...item,
      normalizedValue: item.value / 100
    }))
}

const cleanData = preprocessData(rawData)
console.log(\`处理后的数据量: \${cleanData.length}\`)
\`\`\`

### 模型训练
\`\`\`python
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# 准备数据
X_train, X_test, y_train, y_test = train_test_split(
    features, labels, test_size=0.2, random_state=42
)

# 训练模型
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# 评估性能
accuracy = model.score(X_test, y_test)
print(f"模型准确率: {accuracy:.2%}")
\`\`\`

### TypeScript 类型定义
\`\`\`typescript
interface ModelConfig {
  learningRate: number
  epochs: number
  batchSize: number
}

interface TrainingResult {
  accuracy: number
  loss: number
  trainingTime: number
}

class AIModel {
  private config: ModelConfig

  constructor(config: ModelConfig) {
    this.config = config
  }

  async train(data: TrainingData[]): Promise<TrainingResult> {
    // 训练逻辑实现
    return {
      accuracy: 0.95,
      loss: 0.05,
      trainingTime: 1200
    }
  }
}
\`\`\`

这些代码展示了从数据预处理到模型训练的完整流程。`,
			mediaType: 'text',
			timestamp: Date.now(),
			status: 'success',
		},
		// 助手markdown - Mermaid图表
		{
			id: uuidv4(),
			type: 'assistant',
			content: `## AI 系统架构图

下面是一个典型的 AI 系统架构流程：

\`\`\`mermaid
flowchart TD
    A[数据收集] --> B[数据预处理]
    B --> C[特征工程]
    C --> D[模型选择]
    D --> E[模型训练]
    E --> F{验证结果}
    F -->|准确率低| G[调整参数]
    G --> E
    F -->|准确率高| H[模型部署]
    H --> I[在线预测]
    I --> J[结果监控]
    J --> K{性能下降?}
    K -->|是| L[重新训练]
    L --> E
    K -->|否| I
\`\`\`

### 数据流时序图

\`\`\`mermaid
sequenceDiagram
    participant U as 用户
    participant API as API网关
    participant ML as ML服务
    participant DB as 数据库

    U->>API: 发送预测请求
    API->>ML: 转发请求
    ML->>DB: 查询历史数据
    DB-->>ML: 返回数据
    ML->>ML: 模型推理
    ML-->>API: 返回预测结果
    API-->>U: 响应结果

    Note over ML,DB: 模型可能需要实时学习
\`\`\`

### 系统组件关系图

\`\`\`mermaid
classDiagram
    class DataProcessor {
        +clean(data)
        +normalize(data)
        +validate(data)
    }

    class MLModel {
        +train(dataset)
        +predict(input)
        +evaluate(testData)
    }

    class APIService {
        +handleRequest()
        +validateInput()
        +formatResponse()
    }

    DataProcessor --> MLModel : provides clean data
    MLModel --> APIService : provides predictions
    APIService --> DataProcessor : requests validation
\`\`\`

这些图表展示了 AI 系统的完整工作流程和组件关系。`,
			mediaType: 'text',
			timestamp: Date.now(),
			status: 'success',
		},
	]

	return (
		<div className="p-4 max-w-4xl mx-auto" data-slot="test-chat-msg">
			<h2 className="text-xl font-semibold mb-4">聊天消息组件测试</h2>
			<div className="space-y-4">
				{testMsgs.map((msg) => (
					<div key={msg.id} className="border rounded-lg p-4">
						<div className="text-sm text-muted-foreground mb-2">
							{msg.type === 'user' ? '用户' : '助手'} - {msg.mediaType} - {msg.status}
						</div>
						<ChatMsg msg={msg} />
					</div>
				))}
			</div>
		</div>
	)
}

export default TestChatMsg
