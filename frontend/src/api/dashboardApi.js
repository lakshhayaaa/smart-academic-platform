import api from './axiosInstance'

export function getDashboard() {
  return api.get('/dashboard')
}
