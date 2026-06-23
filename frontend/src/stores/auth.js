import { defineStore } from 'pinia'
import * as authApi from '@/api/auth.js'

function pickAccessToken(payload) {
  return payload?.accessToken ?? payload?.access_token ?? payload?.token ?? payload?.data?.accessToken ?? null
}

function pickUser(payload) {
  return payload?.user ?? payload?.member ?? payload?.data?.user ?? payload?.data?.member ?? payload ?? null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
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
    setSession(payload) {
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
            // Refresh token may not exist on the first visit. Continue with /me fallback.
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

    async signup(payload) {
      this.loading = true
      this.error = ''

      try {
        const result = await authApi.signup(payload)
        this.setSession(result)
        if (!this.user) this.setSession(await authApi.me(this.accessToken))
        return result
      } catch (error) {
        this.clearSession()
        this.error = error.message || '회원가입에 실패했습니다.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(payload) {
      this.loading = true
      this.error = ''

      try {
        const result = await authApi.login(payload)
        this.setSession(result)
        if (!this.user) this.setSession(await authApi.me(this.accessToken))
        return result
      } catch (error) {
        this.clearSession()
        this.error = error.message || '로그인에 실패했습니다.'
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
