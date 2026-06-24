import { apiRequest } from './http.js'
import { useAuthStore } from '@/stores/auth.js'

function token() {
  return useAuthStore().accessToken
}

/**
 * 찜한 장소 목록 조회
 */
export function getSavedPlaces(params = {}) {
  const queryParams = new URLSearchParams()
  if (params.page !== undefined) queryParams.append('page', params.page)
  if (params.size !== undefined) queryParams.append('size', params.size)
  
  const queryString = queryParams.toString()
  return apiRequest(`/saved-places${queryString ? '?' + queryString : ''}`, {
    method: 'GET',
    accessToken: token()
  })
}

/**
 * 찜한 장소(바구니)에 장소를 추가합니다.
 */
export function savePlace(placeId) {
  return apiRequest('/saved-places', {
    method: 'POST',
    body: { placeId },
    accessToken: token()
  })
}

/**
 * 찜한 장소(바구니)에서 장소를 삭제합니다.
 */
export function deleteSavedPlace(placeId) {
  return apiRequest(`/saved-places?placeId=${placeId}`, {
    method: 'DELETE',
    accessToken: token()
  })
}
