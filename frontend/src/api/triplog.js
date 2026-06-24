import { apiRequest } from './http.js'
import { useAuthStore } from '@/stores/auth.js'

function token() {
  return useAuthStore().accessToken
}

/** 공개 피드 목록 */
export function getFeed({ filter = 'recent', page = 0, size = 12 } = {}) {
  return apiRequest(`/trip-logs?filter=${filter}&page=${page}&size=${size}`, { method: 'GET' })
}

/** 여행기 발행 */
export function createTripLog(data) {
  return apiRequest('/trip-logs', { method: 'POST', body: data, accessToken: token() })
}

/** 여행기 상세 조회 */
export function getTripLogDetail(id) {
  return apiRequest(`/trip-logs/${id}`, { method: 'GET', accessToken: token() })
}

/** 여행기 수정 */
export function updateTripLog(id, data) {
  return apiRequest(`/trip-logs/${id}`, { method: 'PUT', body: data, accessToken: token() })
}

/** 여행기 삭제 */
export function deleteTripLog(id) {
  return apiRequest(`/trip-logs/${id}`, { method: 'DELETE', accessToken: token() })
}

/** 좋아요 ON */
export function likeTripLog(id) {
  return apiRequest(`/trip-logs/${id}/likes`, { method: 'POST', accessToken: token() })
}

/** 좋아요 OFF */
export function unlikeTripLog(id) {
  return apiRequest(`/trip-logs/${id}/likes`, { method: 'DELETE', accessToken: token() })
}

/** 북마크 ON */
export function bookmarkTripLog(id) {
  return apiRequest(`/trip-logs/${id}/bookmarks`, { method: 'POST', accessToken: token() })
}

/** 북마크 OFF */
export function unbookmarkTripLog(id) {
  return apiRequest(`/trip-logs/${id}/bookmarks`, { method: 'DELETE', accessToken: token() })
}

/** 댓글 목록 */
export function getComments(id, page = 0) {
  return apiRequest(`/trip-logs/${id}/comments?page=${page}&size=20`, { method: 'GET' })
}

/** 댓글 작성 */
export function addComment(id, content) {
  return apiRequest(`/trip-logs/${id}/comments`, {
    method: 'POST',
    body: { content },
    accessToken: token(),
  })
}

/** 댓글 삭제 */
export function deleteComment(id, commentId) {
  return apiRequest(`/trip-logs/${id}/comments/${commentId}`, {
    method: 'DELETE',
    accessToken: token(),
  })
}
