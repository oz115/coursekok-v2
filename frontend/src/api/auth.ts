import { apiRequest } from './http'

export interface SignupPayload {
  nickname: string
  email: string
  password: string
  marketingConsent: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthUser {
  id?: string | number
  nickname?: string
  name?: string
  email?: string
}

export interface AuthResponse {
  accessToken?: string
  access_token?: string
  token?: string
  user?: AuthUser
  member?: AuthUser
  data?: AuthResponse
}

export function signup(payload: SignupPayload) {
  return apiRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: payload,
  })
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function logout(accessToken?: string | null) {
  return apiRequest<null>('/auth/logout', {
    method: 'POST',
    accessToken,
  })
}

export function me(accessToken?: string | null) {
  return apiRequest<AuthResponse>('/auth/me', {
    method: 'GET',
    accessToken,
  })
}

export function refresh() {
  return apiRequest<AuthResponse>('/auth/refresh', {
    method: 'POST',
  })
}
