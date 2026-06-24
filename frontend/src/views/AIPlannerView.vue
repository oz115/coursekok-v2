<script setup>
/**
 * AIPlannerView.vue — AI 플래너 뷰
 * ─────────────────────────────────────────────────────────────
 * 3단계 stage:
 *   setup   → loading → result
 *
 * 하위 섹션:
 *   - 여행 조건 설정 폼 (기간·스타일·밀도·인원·이동수단·추가요청)
 *   - 로딩 애니메이션 (Mascot + progress bar)
 *   - 결과: 2컬럼 레이아웃 (CourseMap ↔ DayTimeline 리스트 및 콕이 수정 챗봇)
 *   - CostSummary (경비 요약)
 *   - ChatDock (콜이 챗봇 수정)
 *
 * 전역 상태 주입:
 *   - inject('basketPlaces') : Place[] — 담은 장소 목록
 *   - inject('savePlan')      : (plan) => void — 내 여행으로 저장
 *   - inject('navigate')      : (view) => void
 *   - inject('showToast')     : (config) => void
 */

import { ref, computed, inject, nextTick } from 'vue'
import { aiPlan } from '@/data/mockData.js'
import { clone, calcCost, won, catTone, applyIntent } from '@/composables/useKitUtils.js'
import PlannerMap from '@/components/domain/PlannerMap.vue'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import SegmentedControl from '@/components/navigation/SegmentedControl.vue'
import Mascot from '@/components/brand/Mascot.vue'
import { getAICourse } from '@/api/aiPlanner.js'
import { getPlaceDetail } from '@/api/place.js'

// ── 전역 주입 ───────────────────────────────────────────────────────────────
const basketPlaces = inject('basketPlaces', ref([]))
const savePlan     = inject('savePlan', () => {})
const navigate     = inject('navigate', () => {})
const showToast    = inject('showToast', () => {})

// ── 단계 상태 ──────────────────────────────────────────────────────────────
const stage = ref('setup') // 'setup' | 'loading' | 'result'

// ── 설정 값 ────────────────────────────────────────────────────────────────
// 출발일: 오늘 날짜 YYYY-MM-DD
const startDate = ref(new Date().toISOString().split('T')[0])
// 도착일: 오늘 기준 2일 뒤 (2박 3일 기본값)
const endDate = ref(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

// 여행 스타일 (다중 선택 배열)
const travelStyles = ref(['힐링'])
const styleOptions = ['힐링', '액티비티', '미식', '감성', '야경', '역사']

// 하루 일정 밀도 (pace)
const pace = ref('적당히')

// 인원 (headcount)
const people = ref(2)

// 주 이동 수단 (transportation) - 필수
const transportation = ref('자차')
const transportationOptions = ['자차', '대중교통', '도보']

// 추가 요청사항
const additionalRequests = ref('')

// 로딩 텍스트 상태
const loadingText = ref('AI 추천 코스를 생성하고 있습니다...')

// ── 코스 데이터 ────────────────────────────────────────────────────────────
const plan = ref(clone(aiPlan))

// ── 지도 일차 필터 및 상태 ────────────────────────────────────────────────
const activeDayFilter = ref('all')

// 스타일 토글
function toggleStyle(st) {
  const idx = travelStyles.value.indexOf(st)
  if (idx > -1) {
    if (travelStyles.value.length > 1) {
      travelStyles.value.splice(idx, 1)
    } else {
      showToast({ tone: 'default', message: '최소 한 개의 스타일은 선택해야 합니다.' })
    }
  } else {
    travelStyles.value.push(st)
  }
}

// AI 응답 DTO -> 프론트엔드 Plan 변환 파서
async function convertAiResponseToPlan(aiData) {
  // 1. 필요한 모든 place_id 목록 수집
  const neededIds = new Set()
  if (aiData && aiData.day_plans) {
    aiData.day_plans.forEach(day => {
      if (day.places) {
        day.places.forEach(p => {
          if (p.place_id) neededIds.add(p.place_id)
        })
      }
      if (day.accommodation && day.accommodation.place_id) {
        neededIds.add(day.accommodation.place_id)
      }
    })
  }

  // 2. basketPlaces에서 찾을 수 있는 정보 캐싱
  const cachedPlaces = {}
  basketPlaces.value.forEach(p => {
    cachedPlaces[p.id] = p
  })

  // 3. 캐시에 없는 ID만 API 상세 조회 수행
  const apiPromises = []
  const apiIds = []
  neededIds.forEach(id => {
    if (!cachedPlaces[id]) {
      apiIds.push(id)
      apiPromises.push(getPlaceDetail(id).catch(err => {
        console.error(`ID ${id} 상세조회 실패:`, err)
        return null
      }))
    }
  })

  const apiResults = await Promise.all(apiPromises)
  const fetchedPlaces = {}
  apiResults.forEach((res, index) => {
    if (res) {
      const id = apiIds[index]
      let cat = '관광지'
      if (res.contentTypeId === 32) cat = '숙박'
      else if (res.contentTypeId === 39) cat = '음식점'
      else if (res.contentTypeId === 15) cat = '축제'
      
      fetchedPlaces[id] = {
        id: res.id,
        title: res.title,
        cat: cat,
        img: res.firstImage || `https://picsum.photos/seed/${res.id}/800/600`,
        address: res.address,
        note: res.overview ? res.overview.substring(0, 45) + '...' : ''
      }
    }
  })

  // 4. 최종 변환 수행
  const resultDays = []
  
  if (aiData && aiData.day_plans) {
    aiData.day_plans.forEach((dp, idx) => {
      const items = []
      
      // 관광지 리스트 처리
      if (dp.places) {
        dp.places.forEach((p, pIdx) => {
          const detail = cachedPlaces[p.place_id] || fetchedPlaces[p.place_id] || {
            id: p.place_id,
            title: p.title,
            cat: '관광지',
            img: `https://picsum.photos/seed/${p.place_id}/800/600`,
            note: ''
          }
          
          // 가상 시간대
          const times = ['09:30', '13:00', '16:00', '18:30']
          const time = times[pIdx] || '19:00'
          
          // 이동 수단 정보
          let moveInfo = null
          if (p.transport) {
            moveInfo = {
              mode: p.transport.type === '자차' ? '차' : p.transport.type === '대중교통' ? '버스' : '도보',
              time: p.transport.route_descrption ? p.transport.route_descrption.replace('카카오 추천 경로 이동 (약 ', '').replace(' 소요)', '') : '15분',
              raw_desc: p.transport.route_descrption,
              cost: p.transport.estimated_cost || 0
            }
          }
          
          items.push({
            place_id: p.place_id,
            title: p.title,
            cat: detail.cat || '관광지',
            time: time,
            img: detail.img,
            note: detail.note || p.title + ' 방문',
            cost: 0,
            map_x: p.map_x,
            map_y: p.map_y,
            move: moveInfo
          })
        })
      }
      
      // 숙소 처리
      if (dp.accommodation) {
        const acc = dp.accommodation
        const detail = cachedPlaces[acc.place_id] || fetchedPlaces[acc.place_id] || {
          id: acc.place_id,
          title: acc.title,
          cat: '숙박',
          img: `https://picsum.photos/seed/${acc.place_id}/800/600`,
          note: acc.reason || ''
        }
        
        let moveInfo = null
        if (acc.transport) {
          moveInfo = {
            mode: acc.transport.type === '자차' ? '차' : acc.transport.type === '대중교통' ? '버스' : '도보',
            time: acc.transport.route_descrption ? acc.transport.route_descrption.replace('카카오 추천 경로 이동 (약 ', '').replace(' 소요)', '') : '10분',
            raw_desc: acc.transport.route_descrption,
            cost: acc.transport.estimated_cost || 0
          }
        }
        
        items.push({
          place_id: acc.place_id,
          title: acc.title,
          cat: '숙박',
          time: '20:30',
          img: detail.img,
          note: acc.reason || detail.note || '하루를 마무리하는 추천 숙소',
          cost: Math.round(150000 / people.value),
          map_x: acc.map_x,
          map_y: acc.map_y,
          move: moveInfo
        })
      }
      
      const theme = dp.theme || (idx === 0 ? '여행의 시작, 첫째 날' : idx === 1 ? '알찬 즐길거리, 둘째 날' : '여행의 마무리, 마지막 날')
      
      resultDays.push({
        day: dp.day_number || (idx + 1),
        theme: theme,
        items: items
      })
    })
  }
  
  return {
    period: `${resultDays.length - 1}박 ${resultDays.length}일`,
    style: travelStyles.value.join(', '),
    days: resultDays,
    fixedCost: { rental: 80000, fuel: 30000 }
  }
}

// ── 생성 실행 ──────────────────────────────────────────────────────────────
async function run() {
  if (basketPlaces.value.length === 0) {
    showToast({ tone: 'default', message: '먼저 여행 바구니에 최소 1개 이상의 장소를 담아주세요.' })
    return
  }
  
  if (!startDate.value || !endDate.value) {
    showToast({ tone: 'default', message: '출발일과 도착일을 모두 설정해주세요.' })
    return
  }
  
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  if (end < start) {
    showToast({ tone: 'default', message: '도착일은 출발일보다 빠를 수 없습니다.' })
    return
  }
  
  stage.value = 'loading'
  loadingText.value = 'AI가 최적의 여행 코스를 탐색하는 중...'
  
  const payload = {
    startDate: startDate.value,
    endDate: endDate.value,
    headcount: people.value,
    travelStyles: travelStyles.value,
    transportation: transportation.value,
    additionalRequests: additionalRequests.value,
    savedPlaceIds: basketPlaces.value.map(p => {
      const parsed = parseInt(p.id)
      return isNaN(parsed) ? p.id : parsed
    })
  }
  
  try {
    const res = await getAICourse(payload)
    let data = res
    if (typeof res === 'string') {
      try {
        data = JSON.parse(res)
      } catch (e) {
        console.error('JSON 파싱 오류', e)
      }
    }
    
    if (data && data.day_plans && data.day_plans.length > 0) {
      plan.value = await convertAiResponseToPlan(data)
      stage.value = 'result'
      activeDayFilter.value = 'all'
    } else {
      showToast({ tone: 'default', message: 'AI 코스 생성 결과가 올바르지 않습니다. 다시 시도해주세요.' })
      stage.value = 'setup'
    }
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error)
    showToast({ tone: 'default', message: 'API 호출 오류로 코스를 생성하지 못했습니다.' })
    stage.value = 'setup'
  }
}

// ── 정차지 삭제 ────────────────────────────────────────────────────────────
function removeItem(dayIdx, itemIdx) {
  plan.value = clone({
    ...plan.value,
    days: plan.value.days.map((d, di) => {
      if (di !== dayIdx) return d
      return { ...d, items: d.items.filter((_, ii) => ii !== itemIdx) }
    }),
  })
}

// ── 경비 요약 (computed) ───────────────────────────────────────────────────
const cost = computed(() =>
  calcCost(plan.value.days, plan.value.fixedCost, people.value)
)

// ── ChatDock ──────────────────────────────────────────────────────────────
const QUICK = ['숙소 저렴하게 바꿔줘', '2일차에 카페 추가', '더 여유롭게', '맛집 한 곳 더']

const msgs     = ref([{ role: 'kok', text: '코스가 마음에 드세요? 바꾸고 싶은 점을 말해주면 제가 바로 손봐드릴게요 ✨' }])
const chatText = ref('')
const chatBodyRef = ref(null)

async function sendChat(raw) {
  const v = (raw || chatText.value).trim()
  if (!v) return
  const { plan: next, reply } = applyIntent(plan.value, v)
  msgs.value = [...msgs.value, { role: 'me', text: v }, { role: 'kok', text: reply }]
  plan.value = next
  chatText.value = ''
  await nextTick()
  if (chatBodyRef.value) chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
}

// ── 카테고리 색상 ─────────────────────────────────────────────────────────
const CAT_COLOR = {
  관광지: 'var(--coral-500)', 음식점: 'var(--amber-500)',
  숙박:   'var(--sky-500)',  축제:   'var(--mint-500)',
}

// ── 인원 증감 버튼 스타일 ─────────────────────────────────────────────────
const stepBtnStyle = {
  width: '34px', height: '34px', borderRadius: '50%', border: 'none',
  background: 'var(--gray-50)', color: 'var(--text-secondary)',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}

// ── AI에서 충분히 다듬은 코스를 내 여행에 보관 ───────────────────────────
async function handleSavePlan() {
  try {
    await savePlan({ 
      ...plan.value, 
      period: plan.value.period, 
      style: plan.value.style, 
      people: people.value,
      startDate: startDate.value,
      endDate: endDate.value
    })
    showToast({ tone: 'success', message: '최종 일정이 내 여행에 저장됐어요!', icon: 'check' })
    navigate('trips')
  } catch {
    showToast({ tone: 'default', message: '저장에 실패했어요. 다시 시도해주세요.' })
  }
}
</script>

<template>
  <div :class="stage === 'result' ? 'planner-result-root' : 'planner-setup-root'">

    <!-- ══════════════ STAGE: SETUP ══════════════ -->
    <template v-if="stage === 'setup'">
      <!-- 헤더 배너 -->
      <div style="
        position: relative; border-radius: var(--radius-2xl); overflow: hidden;
        background: linear-gradient(120deg, var(--sky-50), var(--mint-50) 70%);
        padding: 26px 30px; margin-bottom: 22px;
        display: flex; align-items: center; gap: 16px;
      ">
        <div aria-hidden style="
          position: absolute; inset: 0; opacity: 0.4;
          background-image: radial-gradient(var(--sky-200) 2px, transparent 2px);
          background-size: 16px 16px;
        " />

        <Mascot variant="guide" :size="92" style="position: relative; flex: none;" />

        <div style="position: relative;">
          <Badge tone="sky">
            <template #left-icon>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3l1.88 5.76H20l-4.94 3.59 1.88 5.77L12 14.52l-4.94 3.6 1.88-5.77L4.06 8.76H10.12L12 3z"/>
              </svg>
            </template>
            AI PLANNER
          </Badge>
          <h1 style="font-size: 30px; font-weight: 800; letter-spacing: -0.02em; margin-top: 8px;">
            콕이가 코스를 짜드릴게요
          </h1>
          <p style="font-size: 15.5px; color: var(--text-secondary); margin-top: 4px;">
            저장한 장소와 조건만 알려주면 이동·경비까지 한 번에!
          </p>
        </div>
      </div>

      <!-- 설정 폼 카드 -->
      <div style="
        background: var(--surface); border-radius: var(--radius-xl);
        border: 1px solid var(--border-subtle); box-shadow: var(--shadow-md); padding: 26px;
      ">
        <!-- 바구니 장소 표시 -->
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--coral-500)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          </svg>
          <span style="font-size: 13px; font-weight: 700; color: var(--text-secondary);">
            여행 바구니 · {{ basketPlaces.length }}곳
          </span>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
          <span v-if="basketPlaces.length === 0" style="color: var(--text-muted); font-size: 14px;">
            먼저 여행지 탐색에서 장소를 담아주세요.
          </span>
          <span
            v-for="p in basketPlaces"
            :key="p.id"
            style="
              display: inline-flex; align-items: center; gap: 7px;
              padding: 6px 12px 6px 6px; background: var(--coral-50);
              border-radius: var(--radius-pill); font-size: 13px; font-weight: 600;
            "
          >
            <img :src="p.img" alt="" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover;" />
            {{ p.title }}
          </span>
        </div>

        <!-- 1. 기간 선택 (출발일 / 도착일) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 20px;">
          <div>
            <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
              출발일
            </label>
            <input
              type="date"
              v-model="startDate"
              style="
                width: 100%; height: 42px; border: 1.5px solid var(--border);
                border-radius: var(--radius-md); padding: 0 12px;
                font-size: 14.5px; font-family: var(--font-sans); background: var(--surface);
              "
            />
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
              도착일
            </label>
            <input
              type="date"
              v-model="endDate"
              style="
                width: 100%; height: 42px; border: 1.5px solid var(--border);
                border-radius: var(--radius-md); padding: 0 12px;
                font-size: 14.5px; font-family: var(--font-sans); background: var(--surface);
              "
            />
          </div>
        </div>

        <!-- 2. 여행 스타일 다중 선택 -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
            여행 스타일 (중복 선택 가능)
          </label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button
              v-for="st in styleOptions"
              :key="st"
              type="button"
              @click="toggleStyle(st)"
              :style="{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                border: '1.5px solid',
                borderColor: travelStyles.includes(st) ? 'var(--coral-500)' : 'var(--border)',
                background: travelStyles.includes(st) ? 'var(--coral-50)' : 'var(--surface)',
                color: travelStyles.includes(st) ? 'var(--coral-600)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }"
            >
              {{ st }}
            </button>
          </div>
        </div>

        <!-- 3. 주 이동 수단 선택 (필수) -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
            주 이동 수단 <span style="color: var(--coral-500)">*</span>
          </label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button
              v-for="trans in transportationOptions"
              :key="trans"
              type="button"
              @click="transportation = trans"
              :style="{
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid',
                borderColor: transportation === trans ? 'var(--sky-500)' : 'var(--border)',
                background: transportation === trans ? 'var(--sky-50)' : 'var(--surface)',
                color: transportation === trans ? 'var(--sky-700)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '14.5px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flex: 1,
                textAlign: 'center',
              }"
            >
              <span style="margin-right: 6px;">
                <span v-if="trans === '자차'">🚗</span>
                <span v-else-if="trans === '대중교통'">🚌</span>
                <span v-else-if="trans === '도보'">🚶</span>
              </span>
              {{ trans }}
            </button>
          </div>
        </div>

        <!-- 4. 밀도 및 인원 조절 -->
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: end; margin-bottom: 20px;">
          <div>
            <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
              하루 일정 밀도
            </label>
            <SegmentedControl v-model="pace" :options="['여유롭게', '적당히', '알차게']" />
          </div>
          <div>
            <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">인원</label>
            <div style="display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--border); border-radius: var(--radius-pill); padding: 3px; background: var(--surface);">
              <button type="button" :style="stepBtnStyle" @click="people = Math.max(1, people - 1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span style="width: 40px; text-align: center; font-weight: 800; font-size: 16px;">{{ people }}</span>
              <button type="button" :style="stepBtnStyle" @click="people = Math.min(9, people + 1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 5. 추가 요청사항 -->
        <div style="margin-bottom: 26px;">
          <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
            추가 요청사항
          </label>
          <textarea
            v-model="additionalRequests"
            placeholder="예: 부모님과 함께하는 가족 여행이라 휠체어 이동이 편하고 경사가 완만한 곳 위주로 경로를 잡아주세요. 맛집 위주로 부탁합니다."
            style="
              width: 100%; height: 80px; border: 1.5px solid var(--border);
              border-radius: var(--radius-md); padding: 10px 12px;
              font-size: 14px; font-family: var(--font-sans); background: var(--surface);
              resize: none; outline: none; transition: border-color 0.2s;
            "
          />
        </div>

        <Button variant="ai" size="lg" :full-width="true" :disabled="basketPlaces.length === 0" @click="run">
          <template #left-icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l1.88 5.76H20l-4.94 3.59 1.88 5.77L12 14.52l-4.94 3.6 1.88-5.77L4.06 8.76H10.12L12 3z"/>
            </svg>
          </template>
          AI로 실제 코스 생성하기
        </Button>
      </div>
    </template>

    <!-- ══════════════ STAGE: LOADING ══════════════ -->
    <div v-else-if="stage === 'loading'" style="
      display: flex; flex-direction: column; align-items: center;
      gap: 22px; padding: 90px 0;
    ">
      <div style="animation: kok-pop 1.1s var(--ease-spring) infinite;">
        <Mascot variant="guide" :size="130" />
      </div>
      <div style="font-size: 18px; font-weight: 700; text-align: center; color: var(--text-primary);">
        {{ loadingText }}
      </div>
      <div style="font-size: 14px; color: var(--text-secondary); text-align: center; max-width: 400px; line-height: 1.5;">
        선택한 {{ basketPlaces.length }}곳과 카카오모빌리티 실측 경로 정보를 바탕으로 최적의 일정 및 예상 경비를 조합 중입니다. 잠시만 기다려주세요!
      </div>
      <div style="width: 260px; height: 6px; border-radius: 99px; background: var(--gray-100); overflow: hidden; margin-top: 8px;">
        <div style="
          width: 100%; height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, var(--sky-500), var(--mint-400));
          animation: kokload 1.9s var(--ease-out) forwards;
        " />
      </div>
    </div>

    <!-- ══════════════ STAGE: RESULT ══════════════ -->
    <template v-else-if="stage === 'result'">
      <!-- ExploreView 스타일 2컬럼: 왼쪽 지도(sticky), 오른쪽 일정 스크롤 -->
      <div class="result-shell">

        <!-- ── 왼쪽 컬럼: 카카오맵 + 이동 동선 (sticky) ── -->
        <aside class="result-map-col">
          <!-- 헤더 배너 -->
          <div class="result-map-header">
            <div class="result-map-header-left">
              <Mascot variant="cheer" :size="52" />
              <div>
                <Badge tone="sky">
                  <template #left-icon>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.88 5.76H20l-4.94 3.59 1.88 5.77L12 14.52l-4.94 3.6 1.88-5.77L4.06 8.76H10.12L12 3z"/></svg>
                  </template>
                  AI 추천 코스
                </Badge>
                <div class="result-meta-title">{{ plan.period }} 여행 동선</div>
                <div class="result-meta-sub">
                  {{ transportation }} · {{ travelStyles.join(', ') }} · {{ people }}인
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" @click="stage = 'setup'">
              <template #left-icon>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.1"/>
                </svg>
              </template>
              처음으로
            </Button>
          </div>

          <!-- 일차 필터 탭 -->
          <div class="result-day-tabs">
            <button
              class="result-day-tab"
              :class="{ active: activeDayFilter === 'all' }"
              @click="activeDayFilter = 'all'"
            >전체</button>
            <button
              v-for="(day, idx) in plan.days"
              :key="idx"
              class="result-day-tab"
              :class="{ active: activeDayFilter === idx }"
              @click="activeDayFilter = idx"
            >DAY {{ day.day }}</button>
          </div>

          <!-- 카카오 지도 패널 -->
          <div class="result-map-panel">
            <PlannerMap :days="plan.days" :active-day="activeDayFilter" />

            <!-- 지도 오버레이: 범례 -->
            <div class="result-map-legend">
              <span
                v-for="(day, idx) in (activeDayFilter === 'all' ? plan.days : [plan.days[activeDayFilter]])"
                :key="idx"
                class="result-legend-badge"
              >
                <span class="result-legend-dot" :style="{ background: ['#ff6b3d','#2a7bf0','#06a582','#f59e0b','#a855f7'][plan.days.indexOf(day) % 5] }" />
                DAY {{ day.day }}
              </span>
            </div>

            <div class="result-map-tip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              번호 핀을 클릭해 장소를 확인하세요
            </div>
          </div>

          <!-- ChatDock (콕이 수정 챗봇) -->
          <div class="result-chatdock">
            <div class="chatdock-header">
              <Mascot variant="guide" :size="36" />
              <div>
                <b class="chatdock-title">콕이에게 수정 요청하기</b>
                <div class="chatdock-sub">대화로 코스를 자유롭게 바꿔보세요</div>
              </div>
            </div>

            <div ref="chatBodyRef" class="chatdock-body">
              <div
                v-for="(m, i) in msgs"
                :key="i"
                :class="['chatdock-row', m.role === 'me' ? 'chatdock-row--me' : 'chatdock-row--kok']"
              >
                <div :class="['chatdock-bubble', m.role === 'me' ? 'bubble--me' : 'bubble--kok']">{{ m.text }}</div>
              </div>
            </div>

            <div class="chatdock-quick">
              <button
                v-for="q in QUICK"
                :key="q"
                class="chatdock-quick-btn"
                @click="sendChat(q)"
              >{{ q }}</button>
            </div>

            <div class="chatdock-input-row">
              <div class="chatdock-input-wrap">
                <input
                  v-model="chatText"
                  placeholder="예) 3일차에 카페 추가해줘"
                  @keydown.enter="sendChat()"
                  class="chatdock-input"
                />
                <button
                  @click="sendChat()"
                  aria-label="보내기"
                  :class="['chatdock-send', chatText.trim() ? 'chatdock-send--active' : '']"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- ── 오른쪽 컬럼: 날짜별 여행 계획 (스크롤) ── -->
        <main class="result-plan-col">
          <!-- 날짜 구간 표시 -->
          <div class="result-plan-period">
            <span class="result-plan-period-label">여행 일정</span>
            <h1 class="result-plan-period-title">{{ startDate }} ~ {{ endDate }}</h1>
          </div>

          <!-- DayTimeline -->
          <div class="result-days-list">
            <div
              v-for="(day, di) in plan.days"
              :key="di"
              class="result-day-card"
            >
              <!-- 일자 헤더 -->
              <div class="result-day-header">
                <span class="result-day-num">{{ day.day }}</span>
                <div>
                  <div class="result-day-label">DAY {{ day.day }}</div>
                  <div class="result-day-theme">{{ day.theme }}</div>
                </div>
                <div style="flex: 1;" />
                <Badge tone="neutral" size="sm">{{ day.items.length }}곳</Badge>
              </div>

              <!-- 정차지 목록 -->
              <div class="result-day-items">
                <template v-for="(it, ii) in day.items" :key="ii">
                  <!-- 이동 수단 행 -->
                  <div v-if="it.move" class="result-move-row">
                    <div class="result-move-gutter" />
                    <div class="result-move-line-wrap">
                      <span class="result-move-dotline" />
                    </div>
                    <div class="result-move-info">
                      <span class="result-move-badge">
                        <span v-if="it.move.mode === '차'">🚗</span>
                        <span v-else-if="it.move.mode === '버스'">🚌</span>
                        <span v-else>🚶</span>
                        {{ it.move.mode }} · {{ it.move.time }}
                      </span>
                      <span v-if="it.move.cost > 0" class="result-move-cost">
                        통행/택시 요금: {{ won(it.move.cost) }}
                      </span>
                    </div>
                  </div>

                  <!-- 정차지 카드 -->
                  <div class="result-stop-row">
                    <div class="result-stop-time">{{ it.time }}</div>
                    <div class="result-stop-track">
                      <span class="result-stop-dot" :style="{ background: CAT_COLOR[it.cat] || 'var(--coral-500)', boxShadow: `0 0 0 1.5px ${CAT_COLOR[it.cat] || 'var(--coral-500)'}` }" />
                      <span v-if="ii < day.items.length - 1" class="result-stop-line" />
                    </div>
                    <div :class="['result-stop-body', { 'result-stop-body--last': ii === day.items.length - 1 }]">
                      <div class="result-stop-card">
                        <img :src="it.img" alt="" class="result-stop-img" />
                        <div class="result-stop-info">
                          <div class="result-stop-meta">
                            <b class="result-stop-name">{{ it.title }}</b>
                            <Badge :tone="catTone(it.cat)" size="sm">{{ it.cat }}</Badge>
                          </div>
                          <div class="result-stop-note">{{ it.note }}</div>
                        </div>
                        <div class="result-stop-actions">
                          <span class="result-stop-cost" :class="{ 'result-stop-cost--free': it.cat !== '숙박' && !it.cost }">
                            {{ it.cat === '숙박' ? won(it.cost * people) : it.cost ? won(it.cost) : '무료' }}
                          </span>
                          <button class="result-stop-remove" @click="removeItem(di, ii)" aria-label="제외">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- 예상 경비 요약 -->
          <div class="result-cost-card">
            <div class="result-cost-header">
              <span class="result-cost-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </span>
              <b class="result-cost-title">예상 경비</b>
              <div style="flex: 1;" />
              <span class="result-cost-people">{{ people }}인 기준</span>
            </div>
            <div class="result-cost-rows">
              <div v-for="row in cost.rows" :key="row.label" class="result-cost-row">
                <span class="result-cost-dot" :style="{ color: row.color }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                </span>
                <span class="result-cost-label">{{ row.label }}</span>
                <div class="result-cost-bar-bg">
                  <div class="result-cost-bar-fill" :style="{ width: `${Math.max(8, (row.v / cost.max) * 100)}%`, background: row.color }" />
                </div>
                <span class="result-cost-val">{{ won(row.v) }}</span>
              </div>
            </div>
            <div class="result-cost-total">
              <b>총 합계</b>
              <div style="flex: 1;" />
              <b class="result-cost-total-num">{{ won(cost.total) }}</b>
            </div>
            <div class="result-cost-note">1인 {{ won(cost.perPerson) }} · 렌터카·주유 {{ won(cost.fixed) }} 포함</div>
          </div>

          <!-- 저장/공유 버튼 -->
          <div class="result-cta-row">
            <Button variant="primary" size="lg" :full-width="true" @click="handleSavePlan">
              <template #left-icon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </template>
              최종 일정으로 내 여행에 저장
            </Button>
            <Button variant="secondary" size="lg">
              <template #left-icon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </template>
              공유
            </Button>
          </div>
        </main>
      </div>
    </template>
  </div>
</template>

<style scoped>
@keyframes kokload { from { width: 8%; } to { width: 100%; } }

/* ── 루트 컨테이너 ── */
.planner-setup-root {
  width: min(100%, 1190px);
  margin: 0 auto;
  padding: 34px 20px 90px;
}

.planner-result-root {
  width: 100%;
  min-height: calc(100vh - 68px);
}

/* ── 결과 2컬럼 쉘 (ExploreView .explore-shell 패턴) ── */
.result-shell {
  display: grid;
  grid-template-columns: minmax(480px, 1fr) minmax(460px, 0.9fr);
  width: min(1540px, 100%);
  min-height: calc(100vh - 68px);
  margin: 0 auto;
}

/* ── 왼쪽 지도 컬럼 ── */
.result-map-col {
  position: sticky;
  top: 68px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: calc(100vh - 68px);
  min-height: 680px;
  padding: 22px 24px;
  border-right: 1px solid rgba(226, 220, 213, 0.72);
  overflow: hidden;
}

/* 헤더 */
.result-map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  flex: none;
}

.result-map-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-meta-title {
  font-size: 20px;
  font-weight: 800;
  margin-top: 4px;
  letter-spacing: -0.02em;
}

.result-meta-sub {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* 일차 필터 탭 */
.result-day-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex: none;
}

.result-day-tab {
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.18s;
}

.result-day-tab.active {
  border-color: var(--coral-500);
  background: var(--coral-500);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 107, 61, 0.22);
}

/* 지도 패널 */
.result-map-panel {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  background: #e9f0e9;
}

.result-map-legend {
  position: absolute;
  top: 14px;
  left: 14px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  z-index: 3;
}

.result-legend-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.93);
  backdrop-filter: blur(6px);
  box-shadow: var(--shadow-xs);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-secondary);
}

.result-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

.result-map-tip {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 13px;
  border-radius: 999px;
  background: rgba(38, 43, 38, 0.84);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  backdrop-filter: blur(8px);
  z-index: 3;
}

/* ChatDock */
.result-chatdock {
  flex: none;
  border-radius: var(--radius-xl);
  border: 1.5px solid var(--sky-100);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  background: var(--surface);
}

.chatdock-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(100deg, var(--sky-50), var(--mint-50));
  border-bottom: 1px solid var(--sky-100);
}

.chatdock-title {
  font-size: 14px;
}

.chatdock-sub {
  font-size: 12px;
  color: var(--sky-700);
  font-weight: 600;
}

.chatdock-body {
  max-height: 160px;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chatdock-row {
  display: flex;
}

.chatdock-row--me { justify-content: flex-end; }
.chatdock-row--kok { justify-content: flex-start; }

.chatdock-bubble {
  max-width: 80%;
  padding: 9px 13px;
  border-radius: 14px;
  font-size: 13.5px;
  line-height: 1.5;
}

.bubble--me {
  background: var(--coral-500);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.bubble--kok {
  background: var(--gray-50);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}

.chatdock-quick {
  padding: 0 12px 10px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chatdock-quick-btn {
  padding: 6px 11px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--sky-200);
  background: var(--sky-50);
  color: var(--sky-700);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
}

.chatdock-input-row {
  padding: 0 12px 12px;
}

.chatdock-input-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--gray-50);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 4px 4px 4px 14px;
}

.chatdock-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13.5px;
  font-family: var(--font-sans);
  min-width: 0;
}

.chatdock-send {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: var(--gray-200);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  transition: background 0.15s;
}

.chatdock-send--active {
  background: var(--coral-500);
}

/* ── 오른쪽 일정 컬럼 ── */
.result-plan-col {
  min-width: 0;
  padding: 22px 28px 100px;
  overflow-y: auto;
}

/* 여행 구간 표시 */
.result-plan-period {
  margin-bottom: 20px;
}

.result-plan-period-label {
  font-size: 12px;
  font-weight: 900;
  color: var(--coral-600);
  letter-spacing: 0.06em;
}

.result-plan-period-title {
  font-size: 22px;
  font-weight: 800;
  margin-top: 4px;
  letter-spacing: -0.02em;
}

/* 일정 리스트 */
.result-days-list {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.result-day-card {
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
}

.result-day-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-subtle);
}

.result-day-num {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--coral-500);
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-primary);
  flex: none;
}

.result-day-label {
  font-size: 11px;
  color: var(--coral-600);
  font-weight: 800;
  letter-spacing: 0.04em;
}

.result-day-theme {
  font-weight: 700;
  font-size: 16px;
}

.result-day-items {
  padding: 6px 16px 12px;
}

/* 이동 수단 행 */
.result-move-row {
  display: flex;
  gap: 12px;
}

.result-move-gutter {
  width: 48px;
  flex: none;
}

.result-move-line-wrap {
  width: 13px;
  flex: none;
  display: flex;
  justify-content: center;
}

.result-move-dotline {
  width: 2px;
  background: repeating-linear-gradient(var(--sky-200) 0 5px, transparent 5px 10px);
  flex: 1;
  margin: 3px 0;
}

.result-move-info {
  flex: 1;
  padding: 6px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-move-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: var(--radius-pill);
  background: var(--sky-50);
  color: var(--sky-700);
  font-size: 12.5px;
  font-weight: 600;
}

.result-move-cost {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  margin-right: 12px;
}

/* 정차지 행 */
.result-stop-row {
  display: flex;
  gap: 12px;
  position: relative;
}

.result-stop-time {
  width: 48px;
  flex: none;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-secondary);
  padding-top: 14px;
}

.result-stop-track {
  position: relative;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16px;
}

.result-stop-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2.5px solid var(--surface);
  flex: none;
}

.result-stop-line {
  flex: 1;
  width: 2px;
  background: var(--border);
  margin-top: 4px;
}

.result-stop-body {
  flex: 1;
  min-width: 0;
  padding-bottom: 14px;
}

.result-stop-body--last {
  padding-bottom: 4px;
}

.result-stop-card {
  display: flex;
  gap: 10px;
  padding: 11px;
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-xs);
}

.result-stop-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex: none;
}

.result-stop-info {
  flex: 1;
  min-width: 0;
}

.result-stop-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.result-stop-name {
  font-size: 15px;
}

.result-stop-note {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-top: 3px;
  line-height: 1.4;
}

.result-stop-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  flex: none;
}

.result-stop-cost {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.result-stop-cost--free {
  color: var(--mint-600);
}

.result-stop-remove {
  border: none;
  background: var(--gray-50);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 경비 요약 카드 */
.result-cost-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
  padding: 20px;
  margin-bottom: 16px;
}

.result-cost-header {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 14px;
}

.result-cost-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--mint-50);
  color: var(--mint-600);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.result-cost-title {
  font-size: 15px;
}

.result-cost-people {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

.result-cost-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.result-cost-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-cost-dot {
  width: 22px;
  flex: none;
  display: flex;
}

.result-cost-label {
  font-size: 13px;
  font-weight: 600;
  width: 72px;
  flex: none;
}

.result-cost-bar-bg {
  flex: 1;
  height: 6px;
  border-radius: 99px;
  background: var(--gray-50);
  overflow: hidden;
}

.result-cost-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s var(--ease-out);
}

.result-cost-val {
  font-size: 13px;
  font-weight: 700;
  width: 80px;
  text-align: right;
  flex: none;
}

.result-cost-total {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
  font-size: 14px;
}

.result-cost-total-num {
  font-size: 22px;
  font-weight: 800;
  color: var(--coral-600);
  letter-spacing: -0.02em;
}

.result-cost-note {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 5px;
  text-align: right;
}

/* CTA 버튼 */
.result-cta-row {
  display: flex;
  gap: 12px;
}
</style>
