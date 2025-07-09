import axios from 'axios'

export const api = axios.create({
	baseURL: process.env.VITE_API_URL || 'http://localhost:3000/api',
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
})

// 请求拦截器
api.interceptors.request.use(
	(config) => {
		// 在这里可以添加认证 token
		const token = localStorage.getItem('token')
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

// 响应拦截器
api.interceptors.response.use(
	(response) => {
		return response
	},
	(error) => {
		// 处理错误响应
		if (error.response?.status === 401) {
			// 处理未授权
			localStorage.removeItem('token')
			window.location.href = '/login'
		}
		return Promise.reject(error)
	}
)
