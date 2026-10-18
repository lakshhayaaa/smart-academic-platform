import api from './axiosInstance'

export function registerCourse(payload) {
  return api.post('/courses/register', payload)
}
