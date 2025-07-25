import { UserResp } from '@/api/types/user-types'
import { JwtPayloadApp, jwt } from '@/utils/jwt'
import { storageKeys } from '@/utils/storage'
import { Nullable } from '@/utils/types'
import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'

const defaultUser: UserResp = {
	id: 0,
	username: 'anonymous',
	email: 'anonymous@example.com',
	avatar: '',
	role: 'user',
	is_active: false,
	created_at: '',
	updated_at: '',
}

// 初始状态
const userState = {
	info: defaultUser,
	token: '',
	tokenPayload: null as Nullable<JwtPayloadApp>,
}

type UserState = typeof userState

const stateCreator = () => {
	return combine(userState, (set, get) => ({
		setData: (data: Partial<UserState>) => set(data),
		setToken: (token: string) => {
			if (!token) {
				set({ tokenPayload: null, token })
				return
			}

			const payload = jwt.parse(token)
			if (payload && jwt.isValid(payload)) {
				set({ tokenPayload: payload, token })
			}
		},
		clear: () => set(userState),
	}))
}

export const useUserStore = create(
	persist(stateCreator(), {
		name: storageKeys.user,
		partialize: (state) => ({
			info: state.info,
			token: state.token,
		}),
	})
)

export type UserStore = ReturnType<ReturnType<typeof stateCreator>>
