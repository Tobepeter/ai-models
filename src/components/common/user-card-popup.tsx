import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { UserCard } from '@/pages/user/components/user-card'
import { useState, PropsWithChildren } from 'react'

/** 用户卡片悬停弹窗组件 */
export const UserCardPopup = (props: PropsWithChildren<UserCardPopupProps>) => {
	const { userData, className, children } = props
	const [isOpen, setIsOpen] = useState(false)
	const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
	const [leaveTimeout, setLeaveTimeout] = useState<NodeJS.Timeout | null>(null)

	// 处理鼠标悬停
	const handleMouseEnter = () => {
		// 清除离开的定时器
		if (leaveTimeout) {
			clearTimeout(leaveTimeout)
			setLeaveTimeout(null)
		}
		
		if (hoverTimeout) clearTimeout(hoverTimeout)
		const timeout = setTimeout(() => {
			setIsOpen(true)
		}, 200) // 200ms 延迟显示
		setHoverTimeout(timeout)
	}

	// 处理鼠标离开
	const handleMouseLeave = () => {
		if (hoverTimeout) {
			clearTimeout(hoverTimeout)
			setHoverTimeout(null)
		}
		
		// 增加离开延迟，给用户时间移动到 Popover
		const timeout = setTimeout(() => {
			setIsOpen(false)
		}, 300) // 300ms 延迟关闭
		setLeaveTimeout(timeout)
	}

	// Popover 内部的鼠标事件
	const handlePopoverEnter = () => {
		// 鼠标进入 Popover 时，取消关闭
		if (leaveTimeout) {
			clearTimeout(leaveTimeout)
			setLeaveTimeout(null)
		}
	}

	const handlePopoverLeave = () => {
		// 鼠标离开 Popover 时，立即关闭
		setIsOpen(false)
	}

	return (
		<Popover open={isOpen}>
			<PopoverTrigger asChild>
				<div
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					{children}
				</div>
			</PopoverTrigger>
			<PopoverContent 
				className={`w-80 p-0 ${className || ''}`}
				onMouseEnter={handlePopoverEnter}
				onMouseLeave={handlePopoverLeave}
			>
				<UserCard 
					readonly 
					userData={userData} 
					className="border-0 shadow-none" 
				/>
			</PopoverContent>
		</Popover>
	)
}

export interface UserCardPopupProps {
	userData: {
		username: string
		email: string
		avatar: string
		extra?: string
	} // 用户数据
	className?: string // Popover 额外样式
}