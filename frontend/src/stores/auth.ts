import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import type { AuthResponse, AuthUser, LoginPayload, SignupPayload } from '@/api/auth'

interface AuthState {
  initialized: boolean
  loading: boolean
  user: AuthUser | null
  accessToken: string | null
  error: string
}

function pickAccessToken(payload: AuthResponse | null | undefined): string | null {
  return payload?.accessToken ?? payload?.access_token ?? payload?.token ?? payload?.data?.accessToken ?? null
}

function pickUser(payload: AuthResponse | null | undefined): AuthUser | null {
  return payload?.user ?? payload?.member ?? payload?.data?.user ?? payload?.data?.member ?? null
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    initialized: false,
    loading: false,
    user: null,
    accessToken: null,
    error: '',
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user),
  },

  actions: {
    setSession(payload: AuthResponse | null) {
      const token = pickAccessToken(payload)
      const user = pickUser(payload)

      if (token) this.accessToken = token
      if (user) this.user = user
    },

    clearSession() {
      this.user = null
      this.accessToken = null
    },

    async bootstrap() {
      this.loading = true
      this.error = ''

      try {
        if (!this.accessToken) {
          try {
            this.setSession(await authApi.refresh())
          } catch {
            // Refresh token may not exist on the first visit.
          }
        }

        this.setSession(await authApi.me(this.accessToken))
      } catch {
        this.clearSession()
      } finally {
        this.initialized = true
        this.loading = false
      }
    },

    async signup(payload: SignupPayload) {
      this.loading = true
      this.error = ''

      try {
        const result = await authApi.signup(payload)
        this.setSession(result)
        if (!this.user) this.setSession(await authApi.me(this.accessToken))
        return result
      } catch (error) {
        this.clearSession()
        this.error = errorMessage(error, '?뚯썝媛?낆뿉 ?ㅽ뙣?덉뒿?덈떎.')
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(payload: LoginPayload) {
      this.loading = true
      this.error = ''

      try {
        const result = await authApi.login(payload)
        this.setSession(result)
        if (!this.user) this.setSession(await authApi.me(this.accessToken))
        return result
      } catch (error) {
        this.clearSession()
        this.error = errorMessage(error, '濡쒓렇?몄뿉 ?ㅽ뙣?덉뒿?덈떎.')
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      this.error = ''

      try {
        await authApi.logout(this.accessToken)
      } finally {
        this.clearSession()
        this.loading = false
      }
    },
  },
})
