import { apiRequest } from './http.js'
import { useAuthStore } from '@/stores/auth.js'

function token() {
  return useAuthStore().accessToken
}

/** 라운지 스팟 목록 (badge: POPULAR | RECOMMENDED | SEASONAL | 미입력=전체) */
export function getSpots({ badge = '', page = 0, size = 12 } = {}) {
  const params = new URLSearchParams({ page, size })
  if (badge) params.set('badge', badge)
  return apiRequest(`/lounge?${params}`, { method: 'GET' })
}

/** 라운지 스팟 상세 (리뷰 첫 페이지 포함) */
export function getSpotDetail(id, { reviewPage = 0, reviewSize = 10 } = {}) {
  return apiRequest(`/lounge/${id}?reviewPage=${reviewPage}&reviewSize=${reviewSize}`, { method: 'GET' })
}

/** 라운지 스팟 추가 (관리자 전용) */
export function createSpot(data) {
  return apiRequest('/lounge', { method: 'POST', body: data, accessToken: token() })
}

/** 라운지 스팟 수정 (관리자 전용) */
export function updateSpot(id, data) {
  return apiRequest(`/lounge/${id}`, { method: 'PUT', body: data, accessToken: token() })
}

/** 라운지 스팟 삭제 (관리자 전용) */
export function deleteSpot(id) {
  return apiRequest(`/lounge/${id}`, { method: 'DELETE', accessToken: token() })
}

/** 스팟 리뷰 목록 */
export function getReviews(spotId, page = 0) {
  return apiRequest(`/lounge/${spotId}/reviews?page=${page}&size=10`, { method: 'GET' })
}

/** 리뷰 작성 */
export function createReview(spotId, data) {
  return apiRequest(`/lounge/${spotId}/reviews`, { method: 'POST', body: data, accessToken: token() })
}

/** 리뷰 수정 */
export function updateReview(spotId, reviewId, data) {
  return apiRequest(`/lounge/${spotId}/reviews/${reviewId}`, { method: 'PUT', body: data, accessToken: token() })
}

/** 리뷰 삭제 */
export function deleteReview(spotId, reviewId) {
  return apiRequest(`/lounge/${spotId}/reviews/${reviewId}`, { method: 'DELETE', accessToken: token() })
}
