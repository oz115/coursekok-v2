import { apiRequest } from './http.js'
import { useAuthStore } from '@/stores/auth.js'

function token() {
  return useAuthStore().accessToken
}

export function createTripShare(tripId) {
  return apiRequest(`/trips/${tripId}/share`, {
    method: 'POST',
    accessToken: token(),
  })
}

export function getSharedTrip(shareToken) {
  return apiRequest(`/shared-trips/${shareToken}`, { method: 'GET' })
}

export function addTripComment(shareToken, data) {
  return apiRequest(`/shared-trips/${shareToken}/comments`, {
    method: 'POST',
    body: data,
  })
}
