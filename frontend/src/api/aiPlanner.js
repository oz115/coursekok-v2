import { apiRequest } from './http.js'
import { useAuthStore } from '@/stores/auth.js'

function token() {
  return useAuthStore().accessToken
}

/**
 * AI 여행 코스 추천 받기
 * @param {object} payload 
 */
export function getAICourse(payload) {
  return apiRequest('/ai-planner', {
    method: 'POST',
    body: payload,
    accessToken: token()
  })
}

/**
 * 수동 여행 계획 AI 피드백 받기
 * @param {object} payload
 */
export function getAIPlanFeedback(payload) {
  return apiRequest('/ai-planner/feedback', {
    method: 'POST',
    body: payload,
    accessToken: token()
  })
}
