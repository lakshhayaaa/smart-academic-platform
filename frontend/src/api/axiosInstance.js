import axios from 'axios'
import { getStoredToken } from '../utils/storage'

let onUnauthorized = null

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 60000,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    const isAuthRoute = url.includes('/auth/signin') || url.includes('/auth/signup')
    if (status === 401 && !isAuthRoute) {
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

export default api
