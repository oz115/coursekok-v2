import { apiRequest } from './http.js'

/**
 * 관광지 목록 검색
 */
export function getPlaces(params = {}) {
  const queryParams = new URLSearchParams()
  if (params.keyword) queryParams.append('keyword', params.keyword)
  if (params.ldongRegnCd) queryParams.append('ldongRegnCd', params.ldongRegnCd)
  if (params.ldongSignguCd) queryParams.append('ldongSignguCd', params.ldongSignguCd)
  if (params.contentTypeId !== undefined && params.contentTypeId !== null) {
    queryParams.append('contentTypeId', params.contentTypeId)
  }
  if (params.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params.minLng !== undefined) queryParams.append('minLng', params.minLng)
  if (params.maxLng !== undefined) queryParams.append('maxLng', params.maxLng)
  if (params.minLat !== undefined) queryParams.append('minLat', params.minLat)
  if (params.maxLat !== undefined) queryParams.append('maxLat', params.maxLat)
  if (params.page !== undefined) queryParams.append('page', params.page)
  if (params.size !== undefined) queryParams.append('size', params.size)

  const queryString = queryParams.toString()
  return apiRequest(`/places${queryString ? '?' + queryString : ''}`, {
    method: 'GET'
  })
}

/**
 * 관광지 상세 조회
 */
export function getPlaceDetail(id) {
  return apiRequest(`/places/${id}`, {
    method: 'GET'
  })
}

/**
 * 시도 목록 조회
 */
export function getSidos() {
  return apiRequest('/places/regions/sido', {
    method: 'GET'
  })
}

/**
 * 시군구 목록 조회
 */
export function getSigungus(sidoCode) {
  return apiRequest(`/places/regions/sigungu?sidoCode=${sidoCode}`, {
    method: 'GET'
  })
}
