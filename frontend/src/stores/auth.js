import { defineStore } from 'pinia'
import * as authApi from '@/api/auth.js'
import { registerRefreshCallback, registerUnauthorizedCallback } from '@/api/http.js'

function pickAccessToken(payload) {
  return payload?.accessToken ?? payload?.access_token ?? payload?.token ?? payload?.data?.accessToken ?? null
}

function pickUser(payload) {
  return payload?.user ?? payload?.member ?? payload?.data?.user ?? payload?.data?.member ?? null
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
    isAuthenticated: (state) => Boolean(state.user && state.accessToken),
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

    _registerCallbacks() {
      // 401 발생 시 refresh 토큰으로 accessToken을 갱신해 반환
      registerRefreshCallback(async () => {
        const result = await authApi.refresh()
        const newToken = pickAccessToken(result)
        if (newToken) this.accessToken = newToken
        return newToken
      })

      // refresh도 실패하면 세션 초기화
      registerUnauthorizedCallback(() => {
        this.clearSession()
        this.initialized = true
      })
    },

    async bootstrap() {
      this._registerCallbacks()
      this.loading = true
      this.error = ''

      try {
        // refresh 토큰 쿠키로 accessToken 복구 시도
        if (!this.accessToken) {
          try {
            this.setSession(await authApi.refresh())
          } catch {
            // 최초 방문이거나 쿠키 만료 — 정상 케이스
          }
        }

        if (this.accessToken) {
          this.setSession(await authApi.me(this.accessToken))
        }
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
        await authApi.signup(payload)
        // 회원가입 후 바로 로그인
        const result = await authApi.login({ email: payload.email, password: payload.password })
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
