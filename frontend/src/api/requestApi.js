import api from './axiosInstance'

export function createResourceRequest(payload) {
  return api.post('/resource-requests', payload)
}

export function listResourceRequests() {
  return api.get('/resource-requests')
}
