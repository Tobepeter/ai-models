import { CSSProperties, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

/**
 * Mermaid 图表组件
 */
const MermaidChart = ({ chart }: { chart: string }) => {
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (ref.current) {
			// TODO: 包体积优化 - Mermaid (~500KB，按需加载)
			mermaid.initialize({
				startOnLoad: true,
				theme: 'dark', // TODO: 深色模式适配
				securityLevel: 'loose', // TODO: XSS 防护评估
			})

			const id = `mermaid-${uuidv4()}`
			ref.current.innerHTML = `<div id="${id}">${chart}</div>`

			mermaid.run({ nodes: [ref.current.querySelector(`#${id}`)!] })
		}
	}, [chart])

	return <div ref={ref} className="my-4" />
}

/**
 * Markdown 渲染组件
 *
 * 关于streaming:
 * streaming 我尝试做一些动画，不过失败了
 * 貌似内部每次所有内容都是重新创建的，状态是无法维持的
 */
export const Markdown = (props: MarkdownProps) => {
	const { content, className, style, noMarkdown = false } = props

	if (noMarkdown) {
		return (
			<div className={cn('text-sm whitespace-pre-wrap', className)} style={style}>
				{content}
			</div>
		)
	}

	return (
		<div className={cn('markdown-content text-sm', className)} style={style}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					// 代码块组件
					code: (props: any) => {
						const { node, inline, className, children, ...restProps } = props
						const match = /language-(\w+)/.exec(className || '')
						const language = match ? match[1] : ''

						// Mermaid 图表处理
						if (!inline && language === 'mermaid') {
							return <MermaidChart chart={String(children)} />
						}

						// 普通代码块
						return !inline && match ? (
							<SyntaxHighlighter style={oneDark as any} language={language} PreTag="div" className="rounded-md" {...restProps}>
								{String(children).replace(/\n$/, '')}
							</SyntaxHighlighter>
						) : (
							<code className={cn('bg-muted px-1 py-0.5 rounded text-sm', className)} {...restProps}>
								{children}
							</code>
						)
					},
					// 标题组件
					h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>,
					h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0">{children}</h2>,
					h3: ({ children }) => <h3 className="text-lg font-medium mb-2 mt-4 first:mt-0">{children}</h3>,
					h4: ({ children }) => <h4 className="text-base font-medium mb-2 mt-3 first:mt-0">{children}</h4>,
					h5: ({ children }) => <h5 className="text-sm font-medium mb-1 mt-2 first:mt-0">{children}</h5>,
					h6: ({ children }) => <h6 className="text-sm font-medium mb-1 mt-2 first:mt-0">{children}</h6>,
					// 段落组件
					p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
					// 列表组件
					ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
					ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
					li: ({ children }) => <li className="leading-relaxed">{children}</li>,
					// 引用块
					blockquote: ({ children }) => <blockquote className="border-l-4 border-muted-foreground/20 pl-4 italic mb-4 text-muted-foreground">{children}</blockquote>,
					// 链接
					a: ({ children, href }) => (
						<a href={href} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
							{children}
						</a>
					),
					// 表格
					table: ({ children }) => (
						<div className="overflow-x-auto mb-4">
							<table className="min-w-full border border-border rounded-md">{children}</table>
						</div>
					),
					thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
					tbody: ({ children }) => <tbody>{children}</tbody>,
					tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
					th: ({ children }) => <th className="px-3 py-2 text-left font-medium">{children}</th>,
					td: ({ children }) => <td className="px-3 py-2">{children}</td>,
					// 分割线
					hr: () => <hr className="my-6 border-border" />,
					// 强调
					strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
					em: ({ children }) => <em className="italic">{children}</em>,
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	)
}

export type MarkdownProps = {
	content: string
	className?: string
	style?: CSSProperties
	noMarkdown?: boolean
}
