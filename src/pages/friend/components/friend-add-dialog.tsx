import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useDebounceFn } from 'ahooks'
import { Search, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { friendMgr } from '../core/friend-mgr'
import { friendStoreActions, useFriendStore } from '../friend-store'

export const FriendAddDialog = () => {
	const store = useFriendStore()
	const [selectedUser, setSelectedUser] = useState<string | null>(null)

	const form = useForm<FormData>({
		defaultValues: {
			searchKeyword: '',
			message: '',
		},
	})

	const { watch } = form
	const searchKeyword = watch('searchKeyword')

	// 防抖搜索
	const { run: searchUsers } = useDebounceFn(
		(keyword: string) => {
			friendMgr.searchUsers(keyword)
		},
		{ wait: 300 }
	)

	const handleSearch = (value: string) => {
		form.setValue('searchKeyword', value)
		searchUsers(value)
	}

	const handleSendRequest = async () => {
		if (!selectedUser) return

		try {
			const message = form.getValues('message')
			await friendMgr.sendFriendRequest(selectedUser, message)
			// 重置状态
			form.reset()
			setSelectedUser(null)
			friendStoreActions.setSearchUsersResult([])
		} catch (error) {
			console.error('发送好友申请失败:', error)
		}
	}

	const handleClose = () => {
		friendStoreActions.toggleAddDialog(false)
		// 清理状态
		form.reset()
		setSelectedUser(null)
		friendStoreActions.setSearchUsersResult([])
	}

	return (
		<Dialog open={store.show_add_dialog} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<UserPlus className="w-5 h-5" />
						添加好友
					</DialogTitle>
					<DialogDescription>搜索用户名、ID或手机号来添加好友</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<div className="space-y-4">
						{/* 搜索框 */}
						<FormField
							control={form.control}
							name="searchKeyword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>搜索用户</FormLabel>
									<FormControl>
										<div className="relative">
											<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
											<Input
												{...field}
												placeholder="输入用户名、ID或手机号"
												className="pl-10"
												onChange={(e) => {
													field.onChange(e)
													handleSearch(e.target.value)
												}}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* 搜索结果 - 固定高度避免跳出 */}
						<FormItem>
							<FormLabel>搜索结果</FormLabel>
							<ScrollArea className="h-48 border rounded-md">
								<div className="p-2 space-y-1">
									{store.search_users_result.length === 0 ? (
										<div className="flex items-center justify-center h-32 text-muted-foreground text-sm">{searchKeyword ? '未找到相关用户' : '输入关键词搜索用户'}</div>
									) : (
										store.search_users_result.map((user) => (
											<div
												key={user.id}
												className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-accent transition-colors ${selectedUser === user.id ? 'bg-accent' : ''}`}
												onClick={() => setSelectedUser(user.id)}
											>
												<UserAvatar src={user.avatar} username={user.username} size={32} />
												<div className="ml-3 flex-1">
													<p className="text-sm font-medium">{user.username}</p>
													<p className="text-xs text-muted-foreground">ID: {user.id}</p>
												</div>
												{user.is_online && <div className="w-2 h-2 bg-green-500 rounded-full" />}
											</div>
										))
									)}
								</div>
							</ScrollArea>
						</FormItem>

						{/* 申请留言 */}
						<FormField
							control={form.control}
							name="message"
							render={({ field }) => (
								<FormItem>
									<FormLabel>申请留言（可选）</FormLabel>
									<FormControl>
										<Textarea {...field} placeholder="介绍一下自己，增加通过几率" className="min-h-[80px]" maxLength={200} />
									</FormControl>
									<p className="text-xs text-muted-foreground text-right">{field.value?.length || 0}/200</p>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</Form>

				<DialogFooter className="flex-row justify-end space-x-2">
					<Button variant="outline" onClick={handleClose}>
						取消
					</Button>
					<Button onClick={handleSendRequest} disabled={!selectedUser || store.adding_friend_loading}>
						{store.adding_friend_loading ? '发送中...' : '发送申请'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

/**
 * 添加好友弹窗组件
 */
interface FormData {
	searchKeyword: string
	message: string
}
