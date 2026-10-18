import api from './axiosInstance'

export function signup(payload) {
  return api.post('/auth/signup', payload)
}

export function signin(payload) {
  return api.post('/auth/signin', payload)
}

export function signout() {
  return api.post('/auth/signout')
}
