import { apiRequest } from './http.js'

export function signup(payload) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: payload,
  })
}

export function login(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function logout(accessToken) {
  return apiRequest('/auth/logout', {
    method: 'POST',
    accessToken,
  })
}

export function me(accessToken) {
  return apiRequest('/auth/me', {
    method: 'GET',
    accessToken,
  })
}

export function refresh() {
  return apiRequest('/auth/refresh', {
    method: 'POST',
  })
}
