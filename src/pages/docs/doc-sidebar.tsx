import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'
import { docMgr } from './doc-mgr'
import type { DocFile } from './doc-types'

export const DocSidebar = (props: DocSidebarProps) => {
	const { selectedItem, onDocSelect } = props
	const [searchQuery, setSearchQuery] = useState('')

	const sideBarConfigs = docMgr.filterSidebarConfig(searchQuery) || {}

	return (
		<Sidebar>
			<SidebarHeader>
				<h2 className="text-lg font-semibold">文档浏览</h2>
				<div className="mt-2">
					<Input type="text" placeholder="搜索文档..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full" />
				</div>
			</SidebarHeader>
			{/* NOTE：默认的滚动条样式很丑，用 shdacn 的，所有外层hidden，内存scroll */}
			<SidebarContent className="overflow-hidden">
				<ScrollArea className="h-full">
					{Object.entries(sideBarConfigs).map(([key, items]) => (
						<SidebarGroup key={key}>
							<SidebarGroupLabel>{key}</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{items.map((item) => (
										<SidebarMenuItem key={item.file}>
											<SidebarMenuButton isActive={selectedItem?.file === item.file} onClick={() => onDocSelect(item.path)} title={item.file}>
												{item.file}
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					))}
				</ScrollArea>
			</SidebarContent>
		</Sidebar>
	)
}

export type DocSidebarProps = {
	selectedItem: DocFile | null
	onDocSelect: (path: string) => void
}
