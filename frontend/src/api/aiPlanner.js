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

/**
 * 두 장소 사이의 카카오 모빌리티 경로 조회
 * Vite 개발 프록시(/kakao-mobility)를 통해 직접 Kakao Mobility API를 호출합니다.
 * @param {{ originX: number, originY: number, destinationX: number, destinationY: number }} payload
 * @returns {Promise<{ success: boolean, vertexes?: number[], distance?: number, duration?: number }>}
 */
export async function getPlannerDirections({ originX, originY, destinationX, destinationY }) {
  const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY
  if (!KAKAO_REST_KEY) {
    console.warn('[getPlannerDirections] VITE_KAKAO_REST_API_KEY가 설정되지 않았습니다.')
    return { success: false }
  }

  const origin = `${originX},${originY}`
  const destination = `${destinationX},${destinationY}`

  // 개발 서버에서는 Vite proxy(/kakao-mobility)를 통해 호출
  // 프로덕션에서도 같은 경로 사용 (프록시 설정 필요 시 nginx 등에서 처리)
  const url = `/kakao-mobility/v1/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&priority=RECOMMEND`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `KakaoAK ${KAKAO_REST_KEY}`,
      },
    })

    if (!response.ok) {
      const text = await response.text()
      console.warn('[getPlannerDirections] Kakao Mobility API 오류:', response.status, text)
      return { success: false }
    }

    const data = await response.json()
    const route = data?.routes?.[0]
    if (!route || route.result_code !== 0) {
      console.warn('[getPlannerDirections] 경로 탐색 실패:', route?.result_code, route?.result_msg)
      return { success: false }
    }

    // sections → roads → vertexes flat 배열 추출
    const vertexes = []
    const sections = route.sections || []
    for (const section of sections) {
      for (const road of section.roads || []) {
        const vx = road.vertexes || []
        if (vx.length < 2) continue
        // 인접 road 간 중복 끝점/시작점 제거
        let startIdx = 0
        if (vertexes.length >= 2) {
          const lastLng = vertexes[vertexes.length - 2]
          const lastLat = vertexes[vertexes.length - 1]
          if (Math.abs(lastLng - vx[0]) < 0.000001 && Math.abs(lastLat - vx[1]) < 0.000001) {
            startIdx = 2
          }
        }
        for (let i = startIdx; i < vx.length; i++) {
          vertexes.push(vx[i])
        }
      }
    }

    const summary = route.summary || {}
    return {
      success: true,
      vertexes,
      distance: summary.distance || 0,
      duration: summary.duration || 0,
      taxi_fare: summary.fare?.taxi || 0,
      toll_fare: summary.fare?.toll || 0,
    }
  } catch (error) {
    console.warn('[getPlannerDirections] fetch 오류:', error)
    return { success: false }
  }
}

