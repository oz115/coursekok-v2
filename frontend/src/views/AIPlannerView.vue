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
import CourseMap from '@/components/domain/CourseMap.vue'
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
  <div style="width: min(100%, 1190px); margin: 0 auto; padding: 34px 20px 90px;">

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
      <!-- 결과 헤더 -->
      <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
        <Mascot variant="cheer" :size="72" />
        <div style="flex: 1;">
          <Badge tone="sky">
            <template #left-icon>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.88 5.76H20l-4.94 3.59 1.88 5.77L12 14.52l-4.94 3.6 1.88-5.77L4.06 8.76H10.12L12 3z"/></svg>
            </template>
            실시간 AI 추천 코스
          </Badge>
          <h1 style="font-size: 25px; font-weight: 800; margin-top: 8px; letter-spacing: -0.02em;">
            {{ startDate }} ~ {{ endDate }} ({{ plan.period }}) AI 코스
          </h1>
          <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
            이동 수단: {{ transportation }} | 스타일: {{ travelStyles.join(', ') }} | 인원: {{ people }}인
          </p>
        </div>
        <Button variant="ghost" size="sm" @click="stage = 'setup'">
          <template #left-icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.1"/>
            </svg>
          </template>
          처음으로
        </Button>
      </div>

      <!-- 2컬럼 레이아웃 컨테이너 -->
      <div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
        
        <!-- 좌측 컬럼 (일정 리스트 및 경비 요약, 저장 버튼) -->
        <div style="flex: 1.6; min-width: 320px; display: flex; flex-direction: column; gap: 20px;">
          <!-- 리스트 뷰 — DayTimeline -->
          <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
            <div
              v-for="(day, di) in plan.days"
              :key="di"
              style="
                background: var(--gray-50); border-radius: var(--radius-lg);
                border: 1px solid var(--border-subtle); overflow: hidden;
              "
            >
              <!-- 일자 헤더 -->
              <div style="
                display: flex; align-items: center; gap: 12px;
                padding: 15px 20px; background: var(--surface);
                border-bottom: 1px solid var(--border-subtle);
              ">
                <span style="
                  width: 36px; height: 36px; border-radius: 50%;
                  background: var(--coral-500); color: #fff;
                  font-weight: 800; font-size: 16px;
                  display: flex; align-items: center; justify-content: center;
                  box-shadow: var(--shadow-primary);
                ">{{ day.day }}</span>
                <div>
                  <div style="font-size: 11.5px; color: var(--coral-600); font-weight: 800; letter-spacing: 0.04em;">DAY {{ day.day }}</div>
                  <div style="font-weight: 700; font-size: 17px;">{{ day.theme }}</div>
                </div>
                <div style="flex: 1;" />
                <Badge tone="neutral" size="sm">{{ day.items.length }}곳</Badge>
              </div>

              <!-- 정차지 목록 -->
              <div style="padding: 6px 18px 14px;">
                <template v-for="(it, ii) in day.items" :key="ii">
                  <!-- 이동 수단 행 -->
                  <div v-if="it.move" style="display: flex; gap: 14px;">
                    <div style="width: 52px; flex: none;" />
                    <div style="width: 13px; flex: none; display: flex; justify-content: center;">
                      <span style="
                        width: 2px; background: repeating-linear-gradient(var(--sky-200) 0 5px, transparent 5px 10px);
                        flex: 1; margin: 3px 0;
                      " />
                    </div>
                    <div style="flex: 1; padding: 7px 0; display: flex; align-items: center; justify-content: space-between;">
                      <span style="
                        display: inline-flex; align-items: center; gap: 7px;
                        padding: 5px 10px; border-radius: var(--radius-pill);
                        background: var(--sky-50); color: var(--sky-700);
                        font-size: 12.5px; font-weight: 600;
                      ">
                        <span v-if="it.move.mode === '차'">🚗</span>
                        <span v-else-if="it.move.mode === '버스'">🚌</span>
                        <span v-else>🚶</span>
                        {{ it.move.mode }} · {{ it.move.time }}
                      </span>
                      <span v-if="it.move.cost > 0" style="font-size: 12.5px; font-weight: 700; color: var(--text-muted); margin-right: 14px;">
                        통행/택시 요금: {{ won(it.move.cost) }}
                      </span>
                    </div>
                  </div>

                  <!-- 정차지 카드 -->
                  <div style="display: flex; gap: 14px; position: relative;">
                    <div style="width: 52px; flex: none; font-size: 13px; font-weight: 700; color: var(--text-secondary); padding-top: 14px;">
                      {{ it.time }}
                    </div>
                    <div style="
                      position: relative; flex: none;
                      display: flex; flex-direction: column; align-items: center; padding-top: 16px;
                    ">
                      <span :style="{
                        width: '13px', height: '13px', borderRadius: '50%',
                        background: CAT_COLOR[it.cat] || 'var(--coral-500)',
                        border: '2.5px solid var(--surface)',
                        boxShadow: `0 0 0 1.5px ${CAT_COLOR[it.cat] || 'var(--coral-500)'}`,
                      }" />
                      <span v-if="ii < day.items.length - 1" style="flex: 1; width: 2px; background: var(--border); margin-top: 4px;" />
                    </div>
                    <div :style="{ flex: 1, minWidth: 0, paddingBottom: ii === day.items.length - 1 ? '4px' : '14px' }">
                      <div style="
                        display: flex; gap: 12px; padding: 12px;
                        background: var(--surface); border-radius: var(--radius-md);
                        border: 1px solid var(--border-subtle); box-shadow: var(--shadow-xs);
                      ">
                        <img :src="it.img" alt="" style="width: 58px; height: 58px; border-radius: var(--radius-sm); object-fit: cover; flex: none;" />
                        <div style="flex: 1; min-width: 0;">
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <b style="font-size: 15.5px;">{{ it.title }}</b>
                            <Badge :tone="catTone(it.cat)" size="sm">{{ it.cat }}</Badge>
                          </div>
                          <div style="font-size: 13px; color: var(--text-muted); margin-top: 3px; line-height: 1.4;">{{ it.note }}</div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex: none;">
                          <span :style="{
                            fontSize: '13.5px', fontWeight: 700, whiteSpace: 'nowrap',
                            color: it.cat === '숙박' || it.cost > 0 ? 'var(--text-primary)' : 'var(--mint-600)',
                          }">
                            {{ it.cat === '숙박' ? won(it.cost * people) : it.cost ? won(it.cost) : '무료' }}
                          </span>
                          <button
                            @click="removeItem(di, ii)"
                            aria-label="제외"
                            style="
                              border: none; background: var(--gray-50);
                              width: 28px; height: 28px; border-radius: 50%;
                              cursor: pointer; color: var(--text-muted);
                              display: flex; align-items: center; justify-content: center;
                            "
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
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
          <div style="
            background: var(--surface); border-radius: var(--radius-lg);
            border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm);
            padding: 22px;
          ">
            <div style="display: flex; align-items: center; gap: 9px; margin-bottom: 16px;">
              <span style="
                width: 34px; height: 34px; border-radius: 10px;
                background: var(--mint-50); color: var(--mint-600);
                display: flex; align-items: center; justify-content: center;
              ">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </span>
              <b style="font-size: 16px;">예상 경비</b>
              <div style="flex: 1;" />
              <span style="font-size: 12.5px; color: var(--text-muted); font-weight: 600;">{{ people }}인 기준</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
              <div v-for="row in cost.rows" :key="row.label" style="display: flex; align-items: center; gap: 12px;">
                <span style="width: 26px; flex: none; display: flex;" :style="{ color: row.color }">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </span>
                <span style="font-size: 13.5px; font-weight: 600; width: 84px; flex: none;">{{ row.label }}</span>
                <div style="flex: 1; height: 7px; border-radius: 99px; background: var(--gray-50); overflow: hidden;">
                  <div :style="{
                    width: `${Math.max(8, (row.v / cost.max) * 100)}%`,
                    height: '100%', borderRadius: '99px', background: row.color,
                  }" />
                </div>
                <span style="font-size: 13.5px; font-weight: 700; width: 86px; text-align: right; flex: none;">{{ won(row.v) }}</span>
              </div>
            </div>

            <div style="display: flex; align-items: baseline; gap: 8px; padding-top: 14px; border-top: 1px dashed var(--border);">
              <b style="font-size: 15px;">총 합계</b>
              <div style="flex: 1;" />
              <b style="font-size: 24px; font-weight: 800; color: var(--coral-600); letter-spacing: -0.02em;">
                {{ won(cost.total) }}
              </b>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px; text-align: right;">
              1인 {{ won(cost.perPerson) }} · 렌터카·주유 {{ won(cost.fixed) }} 포함
            </div>
          </div>

          <!-- 하단 CTA 저장/공유 -->
          <div style="display: flex; gap: 12px;">
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
        </div>

        <!-- 우측 컬럼 (동선 지도 상시 렌더링 및 콕이 수정 챗봇) -->
        <div style="flex: 1.4; min-width: 320px; display: flex; flex-direction: column; gap: 20px; position: sticky; top: 20px; align-self: flex-start;">
          
          <!-- 지도 카드 및 일차 필터 탭 -->
          <div style="
            background: var(--surface); border-radius: var(--radius-xl);
            border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm);
            padding: 16px;
          ">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
              <h2 style="font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 6px; margin: 0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--coral-500)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                  <line x1="9" y1="3" x2="9" y2="18"/>
                  <line x1="15" y1="6" x2="15" y2="21"/>
                </svg>
                여행 동선 지도
              </h2>

              <!-- 일차 필터 탭 -->
              <div style="
                display: inline-flex; padding: 2.5px; background: var(--gray-50);
                border-radius: var(--radius-pill); border: 1px solid var(--border-subtle);
              ">
                <button
                  @click="activeDayFilter = 'all'"
                  :style="{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '4px 10px', borderRadius: 'var(--radius-pill)', border: 'none',
                    cursor: 'pointer',
                    background: activeDayFilter === 'all' ? 'var(--surface)' : 'transparent',
                    color: activeDayFilter === 'all' ? 'var(--coral-600)' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: '11.5px', fontFamily: 'var(--font-sans)',
                    boxShadow: activeDayFilter === 'all' ? 'var(--shadow-xs)' : 'none',
                  }"
                >전체</button>
                <button
                  v-for="(day, idx) in plan.days"
                  :key="idx"
                  @click="activeDayFilter = idx"
                  :style="{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '4px 10px', borderRadius: 'var(--radius-pill)', border: 'none',
                    cursor: 'pointer',
                    background: activeDayFilter === idx ? 'var(--surface)' : 'transparent',
                    color: activeDayFilter === idx ? 'var(--coral-600)' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: '11.5px', fontFamily: 'var(--font-sans)',
                    boxShadow: activeDayFilter === idx ? 'var(--shadow-xs)' : 'none',
                  }"
                >DAY {{ day.day }}</button>
              </div>
            </div>

            <!-- 지도 상시 노출 -->
            <CourseMap :days="plan.days" :active-day="activeDayFilter" :height="380" />
          </div>

          <!-- ChatDock (콕이 수정 챗봇) -->
          <div style="
            background: var(--surface); border-radius: var(--radius-xl);
            border: 1.5px solid var(--sky-100); box-shadow: var(--shadow-md);
            overflow: hidden;
          ">
            <!-- 헤더 -->
            <div style="
              display: flex; align-items: center; gap: 10px;
              padding: 14px 18px;
              background: linear-gradient(100deg, var(--sky-50), var(--mint-50));
              border-bottom: 1px solid var(--sky-100);
            ">
              <Mascot variant="guide" :size="38" />
              <div>
                <b style="font-size: 15px;">콕이에게 수정 요청하기</b>
                <div style="font-size: 12.5px; color: var(--sky-700); font-weight: 600;">대화로 코스를 자유롭게 바꿔보세요</div>
              </div>
            </div>

            <!-- 대화 목록 -->
            <div ref="chatBodyRef" style="max-height: 200px; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px;">
              <div
                v-for="(m, i) in msgs"
                :key="i"
                :style="{ display: 'flex', justifyContent: m.role === 'me' ? 'flex-end' : 'flex-start' }"
              >
                <div :style="{
                  maxWidth: '78%', padding: '10px 14px', borderRadius: '16px',
                  fontSize: '14.5px', lineHeight: 1.5,
                  background: m.role === 'me' ? 'var(--coral-500)' : 'var(--gray-50)',
                  color: m.role === 'me' ? '#fff' : 'var(--text-primary)',
                  borderBottomRightRadius: m.role === 'me' ? '4px' : '16px',
                  borderBottomLeftRadius: m.role === 'me' ? '16px' : '4px',
                }">{{ m.text }}</div>
              </div>
            </div>

            <!-- 빠른 선택 -->
            <div style="padding: 0 14px 12px; display: flex; gap: 7px; flex-wrap: wrap;">
              <button
                v-for="q in QUICK"
                :key="q"
                @click="sendChat(q)"
                style="
                  padding: 7px 12px; border-radius: var(--radius-pill);
                  border: 1px solid var(--sky-200); background: var(--sky-50);
                  color: var(--sky-700); font-size: 12.5px; font-weight: 600;
                  cursor: pointer; font-family: var(--font-sans);
                "
              >{{ q }}</button>
            </div>

            <!-- 입력창 -->
            <div style="display: flex; gap: 8px; align-items: center; padding: 4px 12px 14px;">
              <div style="
                flex: 1; display: flex; align-items: center; gap: 8px;
                background: var(--gray-50); border: 1.5px solid var(--border);
                border-radius: var(--radius-pill); padding: 4px 4px 4px 16px;
              ">
                <input
                  v-model="chatText"
                  placeholder="예) 3일차에 카페 추가해줘"
                  @keydown.enter="sendChat()"
                  style="
                    flex: 1; border: none; outline: none; background: transparent;
                    font-size: 14.5px; font-family: var(--font-sans); min-width: 0;
                  "
                />
                <button
                  @click="sendChat()"
                  aria-label="보내기"
                  :style="{
                    width: '38px', height: '38px', borderRadius: '50%',
                    border: 'none', cursor: 'pointer',
                    background: chatText.trim() ? 'var(--coral-500)' : 'var(--gray-200)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                  }"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
@keyframes kokload { from { width: 8%; } to { width: 100%; } }
</style>
