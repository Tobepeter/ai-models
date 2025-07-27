export interface TestComponent {
	path: string
	name: string
	load: () => Promise<React.ComponentType>
}

export interface TestComponentMap {
	[key: string]: TestComponent
}

export interface TestCache {
	[key: string]: React.ComponentType
}