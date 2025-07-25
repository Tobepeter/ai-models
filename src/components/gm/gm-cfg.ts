export interface GMCommandItem {
	label: string
	command: string
	variant: 'default' | 'outline' | 'ghost' | 'secondary'
}

export interface GMCommandGroup {
	groupName: string
	list: GMCommandItem[]
}

class GMCfg {
	gmPort = 4755
	ports = [5173, 3000, 6006, this.gmPort] // 端口配置

	// 重连配置
	reconnect = {
		initialDelay: 1000, // 初始延迟 1s
		maxDelay: 30000, // 最大延迟 30s
		multiplier: 2, // 指数倍数
		jitterMax: 0.3, // 最大抖动 30%
		maxAttempts: 10, // 最大重连次数，0 表示无限制
	}

	// 命令组配置
	cmds: GMCommandGroup[] = [
		{
			groupName: '开发服务器',
			list: [
				{ label: '开发', command: 'npm run dev', variant: 'default' },
				{ label: 'Mock', command: 'npm run mock-server', variant: 'outline' },
				{ label: 'OSS', command: 'npm run oss-server', variant: 'ghost' },
			],
		},
		{
			groupName: '构建相关',
			list: [
				{ label: '构建', command: 'npm run build', variant: 'outline' },
				{ label: '预览', command: 'npm run preview', variant: 'outline' },
				{ label: '格式化', command: 'npm run format', variant: 'outline' },
			],
		},
		{
			groupName: '开发工具',
			list: [
				{ label: '二维码', command: 'npm run gen-qrcode', variant: 'outline' },
				{ label: '切换焦点', command: 'npm run tog-focus', variant: 'ghost' },
			],
		},
		{
			groupName: '部署相关',
			list: [
				{ label: '部署', command: 'npm run deploy', variant: 'secondary' },
				{ label: '后端', command: 'npm run deploy:be', variant: 'secondary' },
				{ label: 'Nginx', command: 'npm run deploy:nginx', variant: 'secondary' },
			],
		},
		{
			groupName: '密钥管理',
			list: [
				{ label: '同步', command: 'npm run secrets:sync', variant: 'ghost' },
				{ label: '加密', command: 'npm run secrets:encrypt', variant: 'ghost' },
				{ label: '解密', command: 'npm run secrets:decrypt', variant: 'ghost' },
			],
		},
	]
}

export const gmCfg = new GMCfg()
