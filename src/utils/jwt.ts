import { jwtDecode, JwtPayload } from 'jwt-decode'

export interface JwtPayloadApp extends JwtPayload {
	user_id: number
}

class Jwt {
	parse(t: string) {
		try {
			if (!t) return null
			return jwtDecode<JwtPayloadApp>(t)
		} catch {
			return null
		}
	}

	isValid(obj: JwtPayloadApp) {
		const exp = obj.exp * 1000 // jwt是秒级
		return exp > Date.now()
	}
}

export const jwt = new Jwt()
