import { defineStore } from 'pinia'
import * as tripApi from '@/api/trip.js'

function parseTripPlan(detail) {
  if (!detail?.aiPlanSnapshot) return null
  try {
    return JSON.parse(detail.aiPlanSnapshot)
  } catch {
    return null
  }
}

function toTripPayload(plan, fallback = {}) {
  return {
    title: plan.title || `${plan.period || ''} ${plan.style || ''} 코스`.trim(),
    startDate: plan.startDate || fallback.startDate || '',
    endDate: plan.endDate || fallback.endDate || '',
    region: plan.region || fallback.region || '',
    period: plan.period || fallback.period || '',
    style: plan.style || fallback.style || '',
    coverImage: plan.coverImage || fallback.coverImage || '',
    aiPlanSnapshot: JSON.stringify(plan),
  }
}

export const useTripsStore = defineStore('trips', {
  state: () => ({
    trips: [],
    loading: false,
    error: null,
  }),

  actions: {
    /** 내 여행 목록 불러오기 */
    async fetchTrips() {
      this.loading = true
      this.error = null
      try {
        this.trips = await tripApi.getMyTrips()
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    /**
     * AI 플랜 저장
     * @param {object} plan - AIPlannerView에서 넘어오는 플랜 객체
     * @returns {object} 저장된 trip (id 포함)
     */
    async saveTrip(plan) {
      this.loading = true
      this.error = null
      try {
        const saved = await tripApi.saveTrip(toTripPayload(plan))
        // 목록 맨 앞에 추가
        this.trips = [saved, ...this.trips]
        return saved
      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    /** 여행 상세 (aiPlanSnapshot 파싱 포함) */
    async getTripDetail(tripId) {
      try {
        const detail = await tripApi.getTripDetail(tripId)
        detail.plan = parseTripPlan(detail)
        return detail
      } catch (e) {
        this.error = e.message
        throw e
      }
    },

    /** 여행 수정 */
    async updateTrip(tripId, plan, fallback = {}) {
      this.loading = true
      this.error = null
      try {
        const updated = await tripApi.updateTrip(tripId, toTripPayload(plan, fallback))
        updated.plan = parseTripPlan(updated)
        this.trips = this.trips.map((trip) => (trip.id === tripId ? { ...trip, ...updated } : trip))
        return updated
      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    /** 여행 삭제 */
    async deleteTrip(tripId) {
      try {
        await tripApi.deleteTrip(tripId)
        this.trips = this.trips.filter((t) => t.id !== tripId)
      } catch (e) {
        this.error = e.message
        throw e
      }
    },
  },
})
