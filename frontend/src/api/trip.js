import { apiRequest } from './http.js'
import { useAuthStore } from '@/stores/auth.js'

function token() {
  return useAuthStore().accessToken
}

/** 내 여행 목록 조회 */
export function getMyTrips() {
  return apiRequest('/trips', { method: 'GET', accessToken: token() })
}

/** AI 플랜 저장 */
export function saveTrip(data) {
  return apiRequest('/trips', { method: 'POST', body: data, accessToken: token() })
}

/** 여행 상세 조회 (aiPlanSnapshot 포함) */
export function getTripDetail(tripId) {
  return apiRequest(`/trips/${tripId}`, { method: 'GET', accessToken: token() })
}

/** 여행 정보 및 일정 수정 */
export function updateTrip(tripId, data) {
  return apiRequest(`/trips/${tripId}`, { method: 'PUT', body: data, accessToken: token() })
}

/** 여행 삭제 */
export function deleteTrip(tripId) {
  return apiRequest(`/trips/${tripId}`, { method: 'DELETE', accessToken: token() })
}
