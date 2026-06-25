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

import { ref, computed, inject, nextTick, watch, onMounted } from 'vue'
import { aiPlan } from '@/data/mockData.js'
import { clone, calcCost, won, catTone } from '@/composables/useKitUtils.js'
import PlannerMap from '@/components/domain/PlannerMap.vue'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import SegmentedControl from '@/components/navigation/SegmentedControl.vue'
import Mascot from '@/components/brand/Mascot.vue'
import { getAICourse, getAIPlanFeedback } from '@/api/aiPlanner.js'
import { getPlaceDetail, getPlaces, getSidos, getSigungus } from '@/api/place.js'
import PlaceDetailPanel from '@/components/domain/PlaceDetailPanel.vue'
import attractionFallback from '@/assets/images/place-attraction.svg'
import foodFallback from '@/assets/images/place-food.svg'
import stayFallback from '@/assets/images/place-stay.svg'
import festivalFallback from '@/assets/images/place-festival.svg'
import defaultFallback from '@/assets/images/place-default.svg'

// ── 전역 주입 ───────────────────────────────────────────────────────────────
const basketPlaces = inject('basketPlaces', ref([]))
const savePlan     = inject('savePlan', () => {})
const navigate     = inject('navigate', () => {})
const showToast    = inject('showToast', () => {})
const toggleBasket = inject('toggleBasket', async () => {})

// ── 단계 상태 ──────────────────────────────────────────────────────────────
const stage = ref('setup') // 'setup' | 'loading' | 'result'
const isManual = ref(false) // 수동 계획 모드 여부

// ── 수동 계획 AI 피드백 상태 ───────────────────────────────────────────────
const isManualFeedbackLoading = ref(false)

function categoryLabel(typeId) {
  if (typeId === 39) return '음식점'
  if (typeId === 32) return '숙박'
  if (typeId === 15) return '축제'
  return '관광지'
}

function fallbackImage(typeId) {
  if (typeId === 39) return foodFallback
  if (typeId === 32) return stayFallback
  if (typeId === 15) return festivalFallback
  if (typeId === 12) return attractionFallback
  return defaultFallback
}

function typeIdFromCategory(cat) {
  if (cat === '음식점') return 39
  if (cat === '숙박') return 32
  if (cat === '축제') return 15
  if (cat === '관광지') return 12
  return null
}

function isUsableImageUrl(value) {
  return typeof value === 'string' && value.trim() && value !== 'null' && value !== 'undefined'
}

function fallbackImageForCategory(cat) {
  return fallbackImage(typeIdFromCategory(cat))
}

function firstImageFor(place, fallbackTypeId = null) {
  if (isUsableImageUrl(place?.img)) return place.img
  if (place?.firstImage?.startsWith?.('http')) return place.firstImage
  if (place?.firstImage2?.startsWith?.('http')) return place.firstImage2
  return fallbackImage(place?.contentTypeId ?? fallbackTypeId ?? typeIdFromCategory(place?.cat))
}

function planItemImageFor(source, cat = '관광지', fallbackTypeId = null) {
  const image = firstImageFor(source, fallbackTypeId ?? typeIdFromCategory(cat))
  return isUsableImageUrl(image) ? image : fallbackImageForCategory(cat)
}

function handlePlanImgError(event, cat) {
  event.target.src = fallbackImageForCategory(cat)
}

// ── 설정 값 ────────────────────────────────────────────────────────────────
// 출발일: 오늘 날짜 YYYY-MM-DD
const startDate = ref(new Date().toISOString().split('T')[0])
// 도착일: 오늘 기준 2일 뒤 (2박 3일 기본값)
const endDate = ref(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

// 여행 스타일 (다중 선택 배열)
const travelStyles = ref(['힐링'])
const styleOptions = ['힐링', '액티비티', '미식', '감성', '야경', '역사', '핫플레이스']

// 하루 일정 밀도 (pace)
const pace = ref('적당히')

// 인원 (headcount)
const people = ref(2)

// 주 이동 수단 (transportation) - 필수
const transportation = ref('자차')
const transportationOptions = ['자차', '대중교통', '도보']

// 추가 요청사항
const additionalRequests = ref('')

// 지역 선택: 최소 1개 필수, 시군구는 선택 사항
const sidos = ref([])
const sigungus = ref([])
const selectedSidoCode = ref('')
const selectedSigunguCode = ref('')
const selectedRegions = ref([])
const isRegionLoading = ref(false)
const defaultRegionPlaceId = ref(null)

// 로딩 텍스트 상태
const loadingText = ref('AI 추천 코스를 생성하고 있습니다...')

// ── 코스 데이터 ────────────────────────────────────────────────────────────
const plan = ref(clone(aiPlan))
const aiFeedbackPlan = ref(null)
const activePlanView = ref('original')
const activePlan = computed({
  get() {
    return activePlanView.value === 'ai' && aiFeedbackPlan.value ? aiFeedbackPlan.value : plan.value
  },
  set(nextPlan) {
    if (activePlanView.value === 'ai' && aiFeedbackPlan.value) {
      aiFeedbackPlan.value = nextPlan
    } else {
      plan.value = nextPlan
    }
  },
})
const hasAiFeedbackPlan = computed(() => Boolean(aiFeedbackPlan.value?.days?.length))

function resetAiFeedbackPlan() {
  aiFeedbackPlan.value = null
  activePlanView.value = 'original'
}

function switchPlanView(view) {
  if (view === 'ai' && !hasAiFeedbackPlan.value) return
  activePlanView.value = view
  if (activeDayFilter.value !== 'all' && activeDayFilter.value >= activePlan.value.days.length) {
    activeDayFilter.value = 'all'
  }
}

// ── 지도 일차 필터 및 상태 ────────────────────────────────────────────────
const activeDayFilter = ref('all')
const surroundingPlaces = ref([])
const isSurroundingLoading = ref(false)

const selectedPlace = ref(null)
const isDetailLoading = ref(false)

const travelStylesStr = computed({
  get() {
    return travelStyles.value.join(', ')
  },
  set(val) {
    travelStyles.value = val.split(',').map(s => s.trim()).filter(Boolean)
  }
})

const regionLabel = computed(() => {
  if (selectedRegions.value.length === 0) return '지역 미선택'
  return selectedRegions.value.map(region => {
    return region.sigunguName ? `${region.sidoName} ${region.sigunguName}` : `${region.sidoName} 전체`
  }).join(', ')
})

function regionKey(region) {
  return `${region.ldongRegnCd}:${region.ldongSignguCd || ''}`
}

function selectedRegionPayload() {
  return selectedRegions.value.map(region => ({
    ldongRegnCd: region.ldongRegnCd,
    ldongSignguCd: region.ldongSignguCd || null,
  }))
}

async function loadSidos() {
  try {
    sidos.value = await getSidos()
  } catch (error) {
    console.error('Failed to load sidos:', error)
  }
}

async function loadSigungus(sidoCode) {
  if (!sidoCode) {
    sigungus.value = []
    selectedSigunguCode.value = ''
    return
  }

  isRegionLoading.value = true
  try {
    sigungus.value = await getSigungus(sidoCode)
  } catch (error) {
    console.error('Failed to load sigungus:', error)
    sigungus.value = []
  } finally {
    isRegionLoading.value = false
  }
}

function addSelectedRegion() {
  const sido = sidos.value.find(item => item.code === selectedSidoCode.value)
  if (!sido) {
    showToast({ tone: 'default', message: '시도를 먼저 선택해주세요.' })
    return
  }

  const sigungu = sigungus.value.find(item => item.code === selectedSigunguCode.value)
  const region = {
    ldongRegnCd: sido.code,
    ldongSignguCd: sigungu?.code || null,
    sidoName: sido.name,
    sigunguName: sigungu?.name || '',
  }

  if (selectedRegions.value.some(item => regionKey(item) === regionKey(region))) {
    showToast({ tone: 'default', message: '이미 추가한 지역입니다.' })
    return
  }

  selectedRegions.value.push(region)
}

function removeSelectedRegion(region) {
  selectedRegions.value = selectedRegions.value.filter(item => regionKey(item) !== regionKey(region))
}

async function setDefaultRegionFromBasket(force = false) {
  const firstPlace = basketPlaces.value[0]
  if (!firstPlace?.id) {
    defaultRegionPlaceId.value = null
    return
  }
  if (!force && selectedRegions.value.length > 0) return
  if (!force && defaultRegionPlaceId.value === firstPlace.id) return

  try {
    const detail = await getPlaceDetail(firstPlace.id)
    if (!detail?.ldongRegnCd) return

    const sidoName = detail.ldongRegnNm || sidos.value.find(item => item.code === detail.ldongRegnCd)?.name || detail.ldongRegnCd
    const region = {
      ldongRegnCd: detail.ldongRegnCd,
      ldongSignguCd: detail.ldongSignguCd || null,
      sidoName,
      sigunguName: detail.ldongSignguNm || '',
    }

    selectedSidoCode.value = region.ldongRegnCd
    await loadSigungus(region.ldongRegnCd)
    selectedSigunguCode.value = region.ldongSignguCd || ''

    if (!selectedRegions.value.some(item => regionKey(item) === regionKey(region))) {
      selectedRegions.value = [region]
    }
    defaultRegionPlaceId.value = firstPlace.id
  } catch (error) {
    console.error('Failed to set default region from basket:', error)
  }
}

onMounted(async () => {
  await loadSidos()
  await setDefaultRegionFromBasket()
})

async function openPlaceDetail(placeId) {
  if (isDetailLoading.value) return
  isDetailLoading.value = true
  try {
    const detail = await getPlaceDetail(placeId)
    selectedPlace.value = {
      id: detail.id,
      title: detail.title,
      region: [detail.ldongRegnNm, detail.ldongSignguNm].filter(Boolean).join(' '),
      cat: categoryLabel(detail.contentTypeId),
      rating: detail.rating,
      reviews: detail.views,
      meta: detail.tel || '연락처 정보 없음',
      desc: detail.overview || '상세 소개가 준비 중인 여행지예요.',
      img: detail.firstImage?.startsWith('http') ? detail.firstImage : fallbackImage(detail.contentTypeId),
      tags: [detail.lclsSystm1Name, detail.lclsSystm2Name, detail.lclsSystm3Name].filter(Boolean),
      lat: detail.mapY ? Number(detail.mapY) : null,
      lng: detail.mapX ? Number(detail.mapX) : null,
    }
  } catch (error) {
    console.error('Failed to load place detail:', error)
  } finally {
    isDetailLoading.value = false
  }
}

function closePlaceDetail() {
  selectedPlace.value = null
}

function onSelectMapPlace({ item }) {
  const placeId = item.place_id || item.id
  if (placeId) {
    openPlaceDetail(placeId)
  }
}

function openPlanItemDetail(item) {
  const placeId = item?.place_id || item?.id
  if (placeId) {
    openPlaceDetail(placeId)
  }
}

async function fetchSurroundingPlaces(viewport) {
  if (!viewport) return
  isSurroundingLoading.value = true
  try {
    const response = await getPlaces({
      minLng: viewport.minLng,
      maxLng: viewport.maxLng,
      minLat: viewport.minLat,
      maxLat: viewport.maxLat,
      size: 30
    })
    surroundingPlaces.value = response?.content || []
  } catch (error) {
    console.error('Failed to fetch surrounding places:', error)
  } finally {
    isSurroundingLoading.value = false
  }
}

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
        img: planItemImageFor(res, cat, res.contentTypeId),
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
            img: fallbackImage(12),
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
              cost: p.transport.estimated_cost || 0,
              path: p.transport.path || null
            }
          }
          
          items.push({
            place_id: p.place_id,
            title: p.title,
            cat: detail.cat || '관광지',
            time: time,
            img: planItemImageFor(detail, detail.cat || '관광지', p.contentTypeId),
            note: detail.note || p.title + ' 방문',
            userPlan: p.userPlan || p.description || p.reason || p.comment || p.note || '',
            cost: (function() {
              const cat = detail.cat || '관광지'
              if (cat === '음식점') {
                return (Math.floor(Math.random() * 13) + 8) * 1000
              } else if (cat === '관광지' || cat === '축제') {
                return Math.random() < 0.3 ? 0 : (Math.floor(Math.random() * 13) + 3) * 1000
              }
              return 0
            })(),
            map_x: p.map_x !== undefined ? p.map_x : p.mapX,
            map_y: p.map_y !== undefined ? p.map_y : p.mapY,
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
          img: fallbackImage(32),
          note: acc.reason || ''
        }
        
        let moveInfo = null
        if (acc.transport) {
          moveInfo = {
            mode: acc.transport.type === '자차' ? '차' : acc.transport.type === '대중교통' ? '버스' : '도보',
            time: acc.transport.route_descrption ? acc.transport.route_descrption.replace('카카오 추천 경로 이동 (약 ', '').replace(' 소요)', '') : '10분',
            raw_desc: acc.transport.route_descrption,
            cost: acc.transport.estimated_cost || 0,
            path: acc.transport.path || null
          }
        }
        
        items.push({
          place_id: acc.place_id,
          title: acc.title,
          cat: '숙박',
          time: '20:30',
          img: planItemImageFor(detail, '숙박', acc.contentTypeId),
          note: acc.reason || detail.note || '하루를 마무리하는 추천 숙소',
          userPlan: acc.userPlan || acc.description || acc.reason || acc.comment || acc.note || '',
          cost: Math.round((150000 / people.value) / 1000) * 1000,
          map_x: acc.map_x !== undefined ? acc.map_x : acc.mapX,
          map_y: acc.map_y !== undefined ? acc.map_y : acc.mapY,
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
    region: regionLabel.value,
    regions: selectedRegionPayload(),
    period: `${resultDays.length - 1}박 ${resultDays.length}일`,
    style: travelStyles.value.join(', '),
    days: resultDays,
    fixedCost: { rental: 80000, fuel: 30000 }
  }
}

// ── 생성 실행 ──────────────────────────────────────────────────────────────
async function run() {
  if (selectedRegions.value.length === 0) {
    showToast({ tone: 'default', message: '여행할 지역을 최소 1개 이상 선택해주세요.' })
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
    regions: selectedRegionPayload(),
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
      resetAiFeedbackPlan()
      plan.value = await convertAiResponseToPlan(data)
      plan.value.title = plan.value.title || defaultTripTitle()
      isManual.value = false
      stage.value = 'result'
      activeDayFilter.value = 'all'
      resetManualFeedbackChat()
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

// ── 수동 계획 수립 로직 ───────────────────────────────────────────────────────
function recalculateAllDaysInfo(targetPlan = activePlan.value) {
  if (!targetPlan || !targetPlan.days) return
  targetPlan.days.forEach(day => {
    const times = ['09:30', '13:00', '16:00', '18:30', '20:30']
    day.items.forEach((item, index) => {
      if (!item.time) item.time = times[index] || '21:00'
      if (item.cost === undefined || item.cost === null) {
        if (item.cat === '숙박') {
          item.cost = Math.round((150000 / people.value) / 1000) * 1000
        } else if (item.cat === '음식점') {
          item.cost = (Math.floor(Math.random() * 13) + 8) * 1000
        } else if (item.cat === '관광지' || item.cat === '축제') {
          item.cost = Math.random() < 0.3 ? 0 : (Math.floor(Math.random() * 13) + 3) * 1000
        } else {
          item.cost = 0
        }
      }
      
      if (index === 0) {
        item.move = null
      } else {
        if (!item.move) {
          item.move = {
            mode: '차',
            time: '15분',
            cost: 0,
            path: null
          }
        }
        const modeMap = { '자차': '차', '대중교통': '버스', '도보': '도보' }
        item.move.mode = modeMap[transportation.value] || '차'
      }
    })
  })
}

function startManualPlan() {
  if (selectedRegions.value.length === 0) {
    showToast({ tone: 'default', message: '여행할 지역을 최소 1개 이상 선택해주세요.' })
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
  
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  
  const resultDays = []
  for (let i = 1; i <= diffDays; i++) {
    resultDays.push({
      day: i,
      theme: `${i}일차 일정`,
      items: []
    })
  }
  
  // 바구니에 있는 모든 장소를 마지막 날에 추가
  if (basketPlaces.value.length > 0 && resultDays.length > 0) {
    const lastDay = resultDays[resultDays.length - 1]
    basketPlaces.value.forEach((place) => {
      lastDay.items.push(createManualPlanItem(place, lastDay.items.length))
    })
  }
  
  resetAiFeedbackPlan()
  plan.value = {
    region: regionLabel.value,
    regions: selectedRegionPayload(),
    period: `${diffDays - 1}박 ${diffDays}일`,
    style: '수동 계획',
    days: resultDays,
    fixedCost: { rental: 0, fuel: 0 }
  }
  plan.value.title = defaultTripTitle()
  
  isManual.value = true
  stage.value = 'result'
  activeDayFilter.value = 'all'
  resetManualFeedbackChat()
}

// ── 바구니 상태 확인 및 토글 함수 ──────────────────────────────────────────────────
function isPlaceInBasket(placeId) {
  return basketPlaces.value.some(p => String(p.id) === String(placeId))
}

function normalizeBasketPlace(place) {
  const id = place.id || place.place_id
  return {
    ...place,
    id,
    title: place.title,
    cat: place.cat || '관광지',
    img: planItemImageFor(place, place.cat || categoryLabel(place.contentTypeId), place.contentTypeId),
    address: place.address || '',
    note: place.note || '',
    mapX: place.mapX !== undefined ? place.mapX : place.map_x,
    mapY: place.mapY !== undefined ? place.mapY : place.map_y,
  }
}

function createManualPlanItem(place, orderIndex = 0) {
  const normalized = normalizeBasketPlace(place)
  let placeCost = 0
  if (normalized.cat === '숙박') {
    placeCost = Math.round((150000 / people.value) / 1000) * 1000
  } else if (normalized.cat === '음식점') {
    placeCost = (Math.floor(Math.random() * 13) + 8) * 1000
  } else if (normalized.cat === '관광지' || normalized.cat === '축제') {
    placeCost = Math.random() < 0.3 ? 0 : (Math.floor(Math.random() * 13) + 3) * 1000
  }

  return {
    place_id: normalized.id,
    title: normalized.title,
    cat: normalized.cat,
    time: ['09:30', '13:00', '16:00', '18:30', '20:30'][orderIndex] || '21:00',
    img: normalized.img,
    note: normalized.note || `${normalized.title} 방문`,
    cost: placeCost,
    map_x: normalized.mapX,
    map_y: normalized.mapY,
    move: orderIndex > 0 ? {
      mode: transportation.value === '대중교통' ? '버스' : transportation.value === '도보' ? '도보' : '차',
      time: '15분',
      cost: 0,
      path: null
    } : null
  }
}

async function togglePlaceInBasket(place) {
  await toggleBasket(normalizeBasketPlace(place))
}

// basketPlaces watch
watch(basketPlaces, (newVal) => {
  if (newVal.length > 0 && selectedRegions.value.length === 0) {
    setDefaultRegionFromBasket()
  }

  if (!isManual.value || !plan.value || !plan.value.days || plan.value.days.length === 0) return
  
  const currentItemIds = []
  plan.value.days.forEach(d => {
    d.items.forEach(it => {
      currentItemIds.push(String(it.place_id))
    })
  })
  
  const lastDayIndex = plan.value.days.length - 1
  const lastDay = plan.value.days[lastDayIndex]
  
  newVal.forEach(p => {
    const pIdStr = String(p.id)
    if (!currentItemIds.includes(pIdStr)) {
      lastDay.items.push(createManualPlanItem(p, lastDay.items.length))
    }
  })
  
  const basketIds = newVal.map(p => String(p.id))
  plan.value.days.forEach(d => {
    d.items = d.items.filter(it => basketIds.includes(String(it.place_id)))
  })
  
  recalculateAllDaysInfo(plan.value)
  plan.value = clone(plan.value)
}, { deep: true })

watch(selectedSidoCode, (sidoCode) => {
  selectedSigunguCode.value = ''
  loadSigungus(sidoCode)
})

watch(startDate, (newStart, oldStart) => {
  if (!newStart || !oldStart) return
  const diff = new Date(newStart).getTime() - new Date(oldStart).getTime()
  if (isNaN(diff)) return
  const currentEnd = new Date(endDate.value)
  const nextEnd = new Date(currentEnd.getTime() + diff)
  endDate.value = nextEnd.toISOString().split('T')[0]
})

// ── 드래그앤드롭 상태 ─────────────────────────────────────────────────────────────
const draggedDayIdx = ref(null)
const draggedItemIdx = ref(null)
const isDragging = ref(false)
const dragOverDayIdx = ref(null)
const dragOverItemIdx = ref(null)
const collapsedDayKeys = ref(new Set())

function dayCollapseKey(day, index) {
  return day?.day ?? index
}

function isDayCollapsed(day, index) {
  return collapsedDayKeys.value.has(dayCollapseKey(day, index))
}

function toggleDayCollapsed(day, index) {
  const key = dayCollapseKey(day, index)
  const next = new Set(collapsedDayKeys.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  collapsedDayKeys.value = next
}

function selectDayFilter(filter) {
  activeDayFilter.value = filter

  if (!isManual.value) return
  if (filter === 'all') {
    collapsedDayKeys.value = new Set()
    return
  }

  const next = new Set()
  activePlan.value.days.forEach((day, index) => {
    if (index !== filter) next.add(dayCollapseKey(day, index))
  })
  collapsedDayKeys.value = next
}

const isDragOver = (di, ii) => {
  return dragOverDayIdx.value === di && dragOverItemIdx.value === ii && !(draggedDayIdx.value === di && draggedItemIdx.value === ii)
}

function onDragStart(event, dayIdx, itemIdx) {
  if (event.target?.closest?.('input, button, textarea, select')) {
    event.preventDefault()
    return
  }
  draggedDayIdx.value = dayIdx
  draggedItemIdx.value = itemIdx
  isDragging.value = true
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', `${dayIdx},${itemIdx}`)
}

function onDragEnd() {
  draggedDayIdx.value = null
  draggedItemIdx.value = null
  isDragging.value = false
  dragOverDayIdx.value = null
  dragOverItemIdx.value = null
}

function onDragOver(event, dayIdx, itemIdx) {
  event.preventDefault()
  dragOverDayIdx.value = dayIdx
  dragOverItemIdx.value = itemIdx
}

function onDragOverDay(event, dayIdx) {
  event.preventDefault()
  dragOverDayIdx.value = dayIdx
  dragOverItemIdx.value = -1
}

function onDragLeave() {
  dragOverDayIdx.value = null
  dragOverItemIdx.value = null
}

function onDrop(event, targetDayIdx, targetItemIdx) {
  event.preventDefault()
  
  const fromDayIdx = draggedDayIdx.value
  const fromItemIdx = draggedItemIdx.value
  
  if (fromDayIdx === null || fromItemIdx === null) return
  if (fromDayIdx === targetDayIdx && fromItemIdx === targetItemIdx) return
  
  const fromDay = activePlan.value.days[fromDayIdx]
  const targetDay = activePlan.value.days[targetDayIdx]
  
  const [draggedItem] = fromDay.items.splice(fromItemIdx, 1)
  
  if (targetItemIdx === -1) {
    targetDay.items.push(draggedItem)
  } else {
    targetDay.items.splice(targetItemIdx, 0, draggedItem)
  }
  
  recalculateAllDaysInfo()
  activePlan.value = clone(activePlan.value)
  onDragEnd()
}

function onDropOnDay(event, targetDayIdx) {
  if (event.defaultPrevented) return
  event.preventDefault()
  
  const fromDayIdx = draggedDayIdx.value
  const fromItemIdx = draggedItemIdx.value
  
  if (fromDayIdx === null || fromItemIdx === null) return
  
  const fromDay = activePlan.value.days[fromDayIdx]
  const targetDay = activePlan.value.days[targetDayIdx]
  
  if (fromDayIdx === targetDayIdx && fromItemIdx === fromDay.items.length - 1) {
    onDragEnd()
    return
  }
  
  const [draggedItem] = fromDay.items.splice(fromItemIdx, 1)
  targetDay.items.push(draggedItem)
  
  recalculateAllDaysInfo()
  activePlan.value = clone(activePlan.value)
  onDragEnd()
}

// addPlaceToPlan removed in favor of basket sync

// ── 일차 동적 추가 및 삭제 로직 ──────────────────────────────────────────────────
function addDayToPlan() {
  const newDayNum = activePlan.value.days.length + 1
  activePlan.value.days.push({
    day: newDayNum,
    theme: `${newDayNum}일차 일정`,
    items: []
  })
  
  if (endDate.value) {
    const currentEnd = new Date(endDate.value)
    const nextEnd = new Date(currentEnd.getTime() + 24 * 60 * 60 * 1000)
    endDate.value = nextEnd.toISOString().split('T')[0]
  }
  
  const totalDays = activePlan.value.days.length
  activePlan.value.period = `${totalDays - 1}박 ${totalDays}일`
  
  activePlan.value = clone(activePlan.value)
  showToast({ tone: 'success', message: `${newDayNum}일차가 추가되었습니다.`, icon: 'check' })
}

function removeDayFromPlan(dayNum) {
  if (activePlan.value.days.length <= 1) {
    showToast({ tone: 'default', message: '최소 1일 이상의 일정은 유지해야 합니다.' })
    return
  }
  
  const newDays = activePlan.value.days.filter((d) => d.day !== dayNum)
  
  newDays.forEach((d, idx) => {
    const newNum = idx + 1
    d.day = newNum
    d.theme = `${newNum}일차 일정`
  })
  
  activePlan.value.days = newDays
  
  if (endDate.value) {
    const currentEnd = new Date(endDate.value)
    const prevEnd = new Date(currentEnd.getTime() - 24 * 60 * 60 * 1000)
    endDate.value = prevEnd.toISOString().split('T')[0]
  }
  
  const totalDays = activePlan.value.days.length
  activePlan.value.period = `${totalDays - 1}박 ${totalDays}일`
  
  if (activeDayFilter.value !== 'all') {
    const activeIdx = Number(activeDayFilter.value)
    if (activeIdx >= totalDays) {
      activeDayFilter.value = 'all'
    }
  }
  
  activePlan.value = clone(activePlan.value)
  showToast({ tone: 'success', message: `DAY ${dayNum} 일차가 삭제되었습니다.`, icon: 'check' })
}

// Unused old map selection helpers removed

// ── 정차지 삭제 ────────────────────────────────────────────────────────────
async function removeItem(dayIdx, itemIdx) {
  const item = activePlan.value.days[dayIdx].items[itemIdx]
  if (item && isManual.value) {
    const bIdx = basketPlaces.value.findIndex(p => String(p.id) === String(item.place_id))
    if (bIdx > -1) {
      await toggleBasket(normalizeBasketPlace(item))
    } else {
      activePlan.value = clone({
        ...activePlan.value,
        days: activePlan.value.days.map((d, di) => {
          if (di !== dayIdx) return d
          return { ...d, items: d.items.filter((_, ii) => ii !== itemIdx) }
        }),
      })
      recalculateAllDaysInfo()
    }
  } else {
    activePlan.value = clone({
      ...activePlan.value,
      days: activePlan.value.days.map((d, di) => {
        if (di !== dayIdx) return d
        return { ...d, items: d.items.filter((_, ii) => ii !== itemIdx) }
      }),
    })
  }
}

// ── 경비 요약 (computed) ───────────────────────────────────────────────────
const cost = computed(() =>
  calcCost(activePlan.value.days, activePlan.value.fixedCost, people.value)
)

// ── ChatDock ──────────────────────────────────────────────────────────────
const MANUAL_FEEDBACK_QUICK = ['동선이 괜찮은지 봐줘', '시간 간격을 현실적으로 조정해줘', '예상 비용을 점검해줘', '하루 일정을 더 여유롭게 바꿔줘']

const manualFeedbackMsgs = ref([])
const manualFeedbackText = ref('')
const manualFeedbackBodyRef = ref(null)
const isFeedbackSidebarOpen = ref(false)

function resetManualFeedbackChat() {
  manualFeedbackMsgs.value = [
    { role: 'kok', text: '직접 짠 일정을 기준으로 동선, 시간, 비용, 장소별 계획을 함께 다듬어볼게요. 궁금한 점을 편하게 물어보세요.' },
  ]
  manualFeedbackText.value = ''
  isFeedbackSidebarOpen.value = false
}

async function toggleFeedbackSidebar() {
  isFeedbackSidebarOpen.value = !isFeedbackSidebarOpen.value
  if (!isFeedbackSidebarOpen.value) return
  await nextTick()
  if (manualFeedbackBodyRef.value) manualFeedbackBodyRef.value.scrollTop = manualFeedbackBodyRef.value.scrollHeight
}

function normalizeFeedbackPlan(nextPlan) {
  if (!nextPlan || !Array.isArray(nextPlan.days)) return null
  return {
    ...activePlan.value,
    ...nextPlan,
    days: nextPlan.days.map((day, dayIndex) => ({
      ...day,
      day: day.day || dayIndex + 1,
      theme: day.theme || `${dayIndex + 1}일차 일정`,
      items: Array.isArray(day.items) ? day.items.map((item, itemIndex) => ({
        ...item,
        time: item.time || ['09:30', '13:00', '16:00', '18:30', '20:30'][itemIndex] || '21:00',
        img: planItemImageFor(item, item.cat || '관광지', item.contentTypeId),
        userPlan: item.userPlan || item.description || item.reason || item.comment || item.note || '',
        cost: (function() {
          const parsed = Number(item.cost)
          if (Number.isFinite(parsed) && parsed > 0) {
            return Math.round(parsed / 1000) * 1000
          }
          const cat = item.cat || '관광지'
          if (cat === '숙박') {
            return Math.round((150000 / people.value) / 1000) * 1000
          } else if (cat === '음식점') {
            return (Math.floor(Math.random() * 13) + 8) * 1000
          } else if (cat === '관광지' || cat === '축제') {
            return Math.random() < 0.3 ? 0 : (Math.floor(Math.random() * 13) + 3) * 1000
          }
          return 0
        })(),
      })) : [],
    })),
  }
}

async function sendManualFeedback(raw) {
  const message = (raw || manualFeedbackText.value).trim()
  if (!message || isManualFeedbackLoading.value) return

  const previousMessages = manualFeedbackMsgs.value.slice(-8)
  manualFeedbackMsgs.value = [...manualFeedbackMsgs.value, { role: 'me', text: message }]
  manualFeedbackText.value = ''
  isManualFeedbackLoading.value = true

  try {
    const response = await getAIPlanFeedback({
      plan: clone(activePlan.value),
      message,
      messages: previousMessages,
      headcount: people.value,
      transportation: transportation.value,
    })

    const nextPlan = normalizeFeedbackPlan(response?.plan)
    if (nextPlan) {
      aiFeedbackPlan.value = clone(nextPlan)
      activePlanView.value = 'ai'
      recalculateAllDaysInfo()
    }

    manualFeedbackMsgs.value = [
      ...manualFeedbackMsgs.value,
      { role: 'kok', text: response?.reply || 'AI 추천 일정을 만들었어요. 상단 토글에서 작성 중 일정과 번갈아 볼 수 있어요.' },
    ]
  } catch (error) {
    console.error('Failed to get manual plan feedback:', error)
    manualFeedbackMsgs.value = [
      ...manualFeedbackMsgs.value,
      { role: 'kok', text: 'AI 피드백을 불러오지 못했어요. 잠시 뒤 다시 시도해주세요.' },
    ]
  } finally {
    isManualFeedbackLoading.value = false
    await nextTick()
    if (manualFeedbackBodyRef.value) manualFeedbackBodyRef.value.scrollTop = manualFeedbackBodyRef.value.scrollHeight
  }
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

function displayedStopCost(item) {
  if (!item.cost) return 0
  return item.cat === '숙박' ? Math.round(item.cost * people.value) : item.cost
}

function updateStopCost(item, rawValue) {
  const nextCost = Math.max(0, Number(rawValue) || 0)
  item.cost = item.cat === '숙박' ? Math.round(nextCost / Math.max(1, people.value)) : nextCost
  activePlan.value = clone(activePlan.value)
}

function updateStopTime(item, rawValue) {
  item.time = rawValue
}

function normalizeStopTime(item) {
  const raw = String(item.time || '').trim()
  const compact = raw.replace(/[^0-9]/g, '')
  if (compact.length === 3 || compact.length === 4) {
    const padded = compact.padStart(4, '0')
    const hours = Math.min(23, Number(padded.slice(0, 2)))
    const minutes = Math.min(59, Number(padded.slice(2, 4)))
    item.time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }
}

const isSaveModalOpen = ref(false)
const tripTitleInput = ref('')
const isSavingPlan = ref(false)
const isPlacePlanModalOpen = ref(false)
const placePlanTarget = ref(null)
const placePlanInput = ref('')

function openPlacePlanModal(item) {
  placePlanTarget.value = item
  placePlanInput.value = item.userPlan || ''
  isPlacePlanModalOpen.value = true
}

function closePlacePlanModal() {
  isPlacePlanModalOpen.value = false
  placePlanTarget.value = null
  placePlanInput.value = ''
}

function savePlacePlan() {
  if (!placePlanTarget.value) return
  placePlanTarget.value.userPlan = placePlanInput.value.trim()
  activePlan.value = clone(activePlan.value)
  closePlacePlanModal()
  showToast({ tone: 'success', message: '장소 계획을 저장했어요.', icon: 'check' })
}

function defaultTripTitle() {
  const firstPlace = activePlan.value?.days?.flatMap((day) => day.items || [])?.[0]?.title
  return [firstPlace, activePlan.value.period, activePlan.value.style].filter(Boolean).join(' · ') || '나의 여행 계획'
}

function openSavePlanModal() {
  if (!activePlan.value.title) activePlan.value.title = defaultTripTitle()
  tripTitleInput.value = activePlan.value.title
  isSaveModalOpen.value = true
}

function closeSavePlanModal() {
  if (isSavingPlan.value) return
  isSaveModalOpen.value = false
}

// ── AI에서 충분히 다듬은 코스를 내 여행에 보관 ───────────────────────────
async function handleSavePlan() {
  const title = tripTitleInput.value.trim()
  if (!title) {
    showToast({ tone: 'default', message: '여행 이름을 입력해주세요.' })
    return
  }

  isSavingPlan.value = true
  try {
    activePlan.value.title = title
    await savePlan({ 
      ...activePlan.value,
      title,
      period: activePlan.value.period, 
      style: activePlan.value.style, 
      region: regionLabel.value,
      regions: selectedRegionPayload(),
      people: people.value,
      startDate: startDate.value,
      endDate: endDate.value
    })
    isSaveModalOpen.value = false
    showToast({ tone: 'success', message: '최종 일정이 내 여행에 저장됐어요!', icon: 'check' })
    navigate('trips')
  } catch {
    showToast({ tone: 'default', message: '저장에 실패했어요. 다시 시도해주세요.' })
  } finally {
    isSavingPlan.value = false
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
            필요하다면 여행지 탐색에서 꼭 넣고 싶은 장소를 담아주세요.
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

        <!-- 지역 선택 -->
        <div style="margin-bottom: 24px;">
          <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
            여행 지역 <span style="color: var(--coral-500)">*</span>
          </label>
          <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; gap: 10px; align-items: center;">
            <select
              v-model="selectedSidoCode"
              style="
                width: 100%; height: 42px; border: 1.5px solid var(--border);
                border-radius: var(--radius-md); padding: 0 12px;
                font-size: 14.5px; font-family: var(--font-sans); background: var(--surface);
              "
            >
              <option value="">시도 선택</option>
              <option v-for="sido in sidos" :key="sido.code" :value="sido.code">
                {{ sido.name }}
              </option>
            </select>
            <select
              v-model="selectedSigunguCode"
              :disabled="!selectedSidoCode || isRegionLoading"
              style="
                width: 100%; height: 42px; border: 1.5px solid var(--border);
                border-radius: var(--radius-md); padding: 0 12px;
                font-size: 14.5px; font-family: var(--font-sans); background: var(--surface);
              "
            >
              <option value="">시군구 선택 안함</option>
              <option v-for="sigungu in sigungus" :key="sigungu.code" :value="sigungu.code">
                {{ sigungu.name }}
              </option>
            </select>
            <Button variant="secondary" size="md" @click="addSelectedRegion">
              추가
            </Button>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;">
            <span
              v-if="selectedRegions.length === 0"
              style="color: var(--text-muted); font-size: 13px;"
            >
              AI가 참고할 지역을 최소 1개 추가해주세요.
            </span>
            <button
              v-for="region in selectedRegions"
              :key="regionKey(region)"
              type="button"
              @click="removeSelectedRegion(region)"
              style="
                display: inline-flex; align-items: center; gap: 6px;
                padding: 7px 11px; border: 1px solid var(--sky-100);
                border-radius: var(--radius-pill); background: var(--sky-50);
                color: var(--sky-700); font-size: 13px; font-weight: 700;
                cursor: pointer; font-family: var(--font-sans);
              "
              :aria-label="`${region.sidoName} ${region.sigunguName || '전체'} 지역 제거`"
            >
              {{ region.sidoName }} {{ region.sigunguName || '전체' }}
              <span style="font-size: 15px; line-height: 1;">×</span>
            </button>
          </div>
        </div>

        <!-- 2컬럼 그리드 레이아웃 구조 -->
        <div class="grid grid-cols-2 gap-4" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
          <!-- [Row 1] Column 1: 출발일 입력 양식 -->
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
          <!-- [Row 1] Column 2: 도착일 입력 양식 -->
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

          <!-- [Row 2] Column 1: 주 이동 수단 선택 영역 -->
          <div>
            <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
              주 이동 수단 <span style="color: var(--coral-500)">*</span>
            </label>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button
                v-for="trans in transportationOptions"
                :key="trans"
                type="button"
                @click="transportation = trans"
                class="py-1.5 px-3 text-sm"
                :style="{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid',
                  borderColor: transportation === trans ? 'var(--sky-500)' : 'var(--border)',
                  background: transportation === trans ? 'var(--sky-50)' : 'var(--surface)',
                  color: transportation === trans ? 'var(--sky-700)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '14px',
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
          <!-- [Row 2] Column 2: 여행 스타일 선택 영역 -->
          <div>
            <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
              여행 스타일
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

          <!-- [Row 3] Column 1: 인원 입력/선택 양식 (수직으로 왼쪽 정렬) -->
          <div>
            <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">인원</label>
            <div style="display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--border); border-radius: var(--radius-pill); padding: 3px; background: var(--surface); width: fit-content;">
              <button type="button" :style="stepBtnStyle" @click="people = Math.max(1, people - 1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span style="width: 40px; text-align: center; font-weight: 800; font-size: 16px;">{{ people }}</span>
              <button type="button" :style="stepBtnStyle" @click="people = Math.min(9, people + 1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
          <!-- [Row 3] Column 2: 하루 일정 밀도 선택 양식 -->
          <div>
            <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
              하루 일정 밀도
            </label>
            <SegmentedControl v-model="pace" :options="['여유롭게', '적당히', '알차게']" />
          </div>
        </div>

        <!-- 추가 요청사항 입력칸 -->
        <div style="margin-top: 16px; margin-bottom: 24px;">
          <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">추가 요청사항</label>
          <textarea
            v-model="additionalRequests"
            placeholder="예: 조용한 객실, 바다가 보이는 카페 추천 등 추가로 원하는 스타일이나 조건을 입력해주세요."
            style="
              width: 100%; height: 80px; border: 1.5px solid var(--border);
              border-radius: var(--radius-md); padding: 10px 12px;
              font-size: 14.5px; font-family: var(--font-sans); background: var(--surface);
              resize: none; outline: none; transition: border-color 0.2s;
              width: 100%;
            "
            @focus="$event.target.style.borderColor = 'var(--coral-500)'"
            @blur="$event.target.style.borderColor = 'var(--border)'"
          />
        </div>

        <!-- 하단 액션 버튼 -->
        <div class="flex gap-4" style="display: flex; gap: 16px;">
          <Button variant="secondary" size="lg" style="flex: 1;" @click="startManualPlan">
            직접 짤래요
          </Button>
          <Button variant="primary" size="lg" style="flex: 1;" :disabled="selectedRegions.length === 0" @click="run">
            <template #left-icon>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3l1.88 5.76H20l-4.94 3.59 1.88 5.77L12 14.52l-4.94 3.6 1.88-5.77L4.06 8.76H10.12L12 3z"/>
              </svg>
            </template>
            AI로 실제 코스 생성하기
          </Button>
        </div>
      </div>
    </template>

    <!-- ══════════════ STAGE: LOADING ══════════════ -->
    <div v-else-if="stage === 'loading'" style="
      display: flex; flex-direction: column; align-items: center;
      gap: 22px; padding: 90px 0;
    ">
      <div class="kok-dance-container">
        <Mascot variant="guide" :size="130" />
      </div>
      <div style="font-size: 18px; font-weight: 700; text-align: center; color: var(--text-primary);">
        {{ loadingText }}
      </div>
      <div style="font-size: 14px; color: var(--text-secondary); text-align: center; max-width: 400px; line-height: 1.5;">
        선택한 {{ regionLabel }} 지역과 {{ basketPlaces.length }}곳의 관심 장소, 카카오모빌리티 실측 경로 정보를 바탕으로 최적의 일정 및 예상 경비를 조합 중입니다. 잠시만 기다려주세요!
      </div>
      <div class="kok-loading-container">
        <div class="kok-loading-bar" />
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
              <div class="result-meta-content">
                <input
                  v-model="activePlan.title"
                  class="result-meta-title-input"
                  maxlength="60"
                  placeholder="여행 이름을 입력해주세요"
                  aria-label="여행 이름"
                />
                <div class="result-meta-grid">
                  <div class="result-meta-field result-meta-field--date">
                    <span class="result-meta-label">날짜</span>
                    <div class="result-meta-value">
                      <input
                        type="date"
                        v-model="startDate"
                        class="result-meta-date-input"
                        aria-label="시작 날짜"
                      />
                      <span class="result-meta-end-date">~ {{ endDate }}</span>
                    </div>
                  </div>

                  <div class="result-meta-field result-meta-field--people">
                    <span class="result-meta-label">인원</span>
                    <div class="result-meta-value">
                      <input
                        type="number"
                        v-model.number="people"
                        class="result-meta-people-input"
                        min="1"
                        max="99"
                        aria-label="인원"
                      />
                      <span>인</span>
                    </div>
                  </div>

                  <div class="result-meta-field result-meta-field--region">
                    <span class="result-meta-label">지역</span>
                    <div class="result-region-editor">
                      <span class="result-meta-text-display">
                        {{ regionLabel }}
                      </span>
                      <div class="result-region-add">
                        <select
                          v-model="selectedSidoCode"
                          class="result-region-select"
                          aria-label="추가할 시도 선택"
                        >
                          <option value="">시도</option>
                          <option v-for="sido in sidos" :key="sido.code" :value="sido.code">
                            {{ sido.name }}
                          </option>
                        </select>
                        <select
                          v-model="selectedSigunguCode"
                          class="result-region-select"
                          :disabled="!selectedSidoCode || isRegionLoading"
                          aria-label="추가할 시군구 선택"
                        >
                          <option value="">시군구 전체</option>
                          <option v-for="sigungu in sigungus" :key="sigungu.code" :value="sigungu.code">
                            {{ sigungu.name }}
                          </option>
                        </select>
                        <button
                          type="button"
                          class="result-region-add-btn"
                          @click="addSelectedRegion"
                        >
                          추가
                        </button>
                      </div>
                    </div>
                  </div>

                  <label class="result-meta-field result-meta-field--style">
                    <span class="result-meta-label">스타일</span>
                    <span class="result-meta-value">
                      <input
                        type="text"
                        v-model="travelStylesStr"
                        class="result-meta-text-input"
                        placeholder="예: 힐링, 미식"
                        aria-label="여행 스타일"
                      />
                    </span>
                  </label>

                  <label class="result-meta-field result-meta-field--request">
                    <span class="result-meta-label">요구사항</span>
                    <span class="result-meta-value">
                      <input
                        type="text"
                        v-model="additionalRequests"
                        class="result-meta-text-input"
                        placeholder="예: 바다가 보이는 숙소"
                        aria-label="추가 요구사항"
                      />
                    </span>
                  </label>
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
              :style="activeDayFilter === 'all' ? {
                backgroundColor: 'var(--coral-500)',
                borderColor: 'var(--coral-500)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(255, 107, 61, 0.22)'
              } : {
                borderColor: 'var(--coral-500)',
                color: 'var(--coral-500)'
              }"
              @click="selectDayFilter('all')"
            >전체</button>
            <button
              v-for="(day, idx) in activePlan.days"
              :key="idx"
              class="result-day-tab"
              :class="{ active: activeDayFilter === idx }"
              :style="activeDayFilter === idx ? {
                backgroundColor: ['#ff6b3d','#2a7bf0','#06a582','#f59e0b','#a855f7'][idx % 5],
                borderColor: ['#ff6b3d','#2a7bf0','#06a582','#f59e0b','#a855f7'][idx % 5],
                color: '#fff',
                boxShadow: `0 4px 12px ${['rgba(255, 107, 61, 0.22)','rgba(42, 123, 240, 0.22)','rgba(6, 165, 130, 0.22)','rgba(245, 158, 11, 0.22)','rgba(168, 85, 247, 0.22)'][idx % 5]}`
              } : {
                borderColor: ['#ff6b3d','#2a7bf0','#06a582','#f59e0b','#a855f7'][idx % 5],
                color: ['#ff6b3d','#2a7bf0','#06a582','#f59e0b','#a855f7'][idx % 5]
              }"
              @click="selectDayFilter(idx)"
            >DAY {{ day.day }}</button>
          </div>

          <!-- 카카오 지도 패널 -->
          <div class="result-map-panel">
            <PlannerMap
              :days="activePlan.days"
              :active-day="activeDayFilter"
              :surrounding-places="surroundingPlaces"
              @viewport-changed="fetchSurroundingPlaces"
              @select-place="onSelectMapPlace"
            />

            <!-- 지도 오버레이: 범례 -->
            <div class="result-map-legend">
              <span
                v-for="(day, idx) in (activeDayFilter === 'all' ? activePlan.days : [activePlan.days[activeDayFilter]])"
                :key="idx"
                class="result-legend-badge"
              >
                <span class="result-legend-dot" :style="{ background: ['#ff6b3d','#2a7bf0','#06a582','#f59e0b','#a855f7'][activePlan.days.indexOf(day) % 5] }" />
                DAY {{ day.day }}
              </span>
            </div>

            <div class="result-map-tip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              번호 핀을 클릭해 장소를 확인하세요
            </div>
          </div>

        </aside>

        <!-- ── 오른쪽 컬럼: 날짜별 여행 계획 (스크롤) 혹은 장소 상세 패널 ── -->
        <main v-if="selectedPlace" class="result-plan-col">
          <PlaceDetailPanel
            :place="selectedPlace"
            :saved="isPlaceInBasket(selectedPlace.id)"
            @back="closePlaceDetail"
            @toggle-save="togglePlaceInBasket(selectedPlace)"
          />
        </main>
        <main v-else class="result-plan-col">
          <div class="plan-view-toggle" role="group" aria-label="여행 일정 보기 전환">
            <button
              type="button"
              :class="{ active: activePlanView === 'original' }"
              @click="switchPlanView('original')"
            >
              작성 중 일정
            </button>
            <button
              type="button"
              :class="{ active: activePlanView === 'ai' }"
              :disabled="!hasAiFeedbackPlan"
              @click="switchPlanView('ai')"
            >
              AI 추천 일정
            </button>
          </div>

          <!-- DayTimeline -->
          <div class="result-days-list">
            <div
              v-for="(day, di) in activePlan.days"
              :key="di"
              class="result-day-card"
            >
              <!-- 일자 헤더 -->
              <div class="result-day-header">
                <span
                  class="result-day-num"
                  :style="{
                    background: ['#ff6b3d','#2a7bf0','#06a582','#f59e0b','#a855f7'][di % 5],
                    boxShadow: `0 4px 10px ${['rgba(255, 107, 61, 0.25)','rgba(42, 123, 240, 0.25)','rgba(6, 165, 130, 0.25)','rgba(245, 158, 11, 0.25)','rgba(168, 85, 247, 0.25)'][di % 5]}`
                  }"
                >{{ day.day }}</span>
                <div>
                  <div
                    class="result-day-label"
                    :style="{ color: ['#ff6b3d','#2a7bf0','#06a582','#f59e0b','#a855f7'][di % 5] }"
                  >DAY {{ day.day }}</div>
                  <div class="result-day-theme">{{ day.theme }}</div>
                </div>
                <div style="flex: 1;" />
                <div style="display: flex; align-items: center; gap: 8px;">
                  <Badge tone="neutral" size="sm">{{ day.items.length }}곳</Badge>
                  <button
                    type="button"
                    class="result-day-toggle"
                    :aria-expanded="!isDayCollapsed(day, di)"
                    @click="toggleDayCollapsed(day, di)"
                  >
                    <span>{{ isDayCollapsed(day, di) ? '펼치기' : '접기' }}</span>
                    <span class="result-day-toggle-icon" :class="{ 'is-collapsed': isDayCollapsed(day, di) }">⌃</span>
                  </button>
                  <button
                    v-if="activePlan.days.length > 1"
                    type="button"
                    style="
                      color: var(--coral-500); padding: 4.5px 9px; font-size: 12.5px;
                      border: 1.5px solid var(--coral-200); background: var(--coral-50);
                      border-radius: var(--radius-sm); cursor: pointer; font-weight: 700;
                      transition: all 0.15s; font-family: var(--font-sans);
                    "
                    onmouseover="this.style.background='var(--coral-100)'"
                    onmouseout="this.style.background='var(--coral-50)'"
                    @click.stop="removeDayFromPlan(day.day)"
                  >
                    삭제
                  </button>
                </div>
              </div>

              <!-- 정차지 목록 -->
              <div
                v-if="!isDayCollapsed(day, di)"
                class="result-day-items"
                :class="{
                  'result-day-items--empty': day.items.length === 0,
                  'result-day-items--drag-over': dragOverDayIdx === di && dragOverItemIdx === -1
                }"
                @dragover="onDragOverDay($event, di)"
                @dragleave="onDragLeave"
                @drop="onDropOnDay($event, di)"
              >
                <div v-if="day.items.length === 0" class="result-empty-day">
                  <div class="result-empty-day-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </div>
                  <div>
                    <div class="result-empty-day-title">아직 비어 있는 일정입니다</div>
                    <div class="result-empty-day-copy">다른 일차의 장소를 이곳으로 드래그해 추가할 수 있어요.</div>
                  </div>
                </div>
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
                  <div
                    class="result-stop-row"
                    :class="{
                      'dragging': draggedDayIdx === di && draggedItemIdx === ii,
                      'drag-over': isDragOver(di, ii)
                    }"
                    draggable="true"
                    @dragstart="onDragStart($event, di, ii)"
                    @dragend="onDragEnd"
                    @dragover="onDragOver($event, di, ii)"
                    @dragleave="onDragLeave"
                    @drop.stop="onDrop($event, di, ii)"
                  >
                    <label class="result-stop-time">
                      <span class="result-stop-time-label">도착</span>
                      <input
                        class="result-stop-time-input"
                        type="text"
                        inputmode="numeric"
                        maxlength="5"
                        placeholder="09:30"
                        :value="it.time"
                        aria-label="도착 예정 시간"
                        @input="updateStopTime(it, $event.target.value)"
                        @blur="normalizeStopTime(it)"
                        @mousedown.stop
                        @click.stop
                      />
                    </label>
                    <div class="result-stop-track">
                      <span class="result-stop-dot" :style="{ background: CAT_COLOR[it.cat] || 'var(--coral-500)', boxShadow: `0 0 0 1.5px ${CAT_COLOR[it.cat] || 'var(--coral-500)'}` }" />
                      <span v-if="ii < day.items.length - 1" class="result-stop-line" />
                    </div>
                    <div :class="['result-stop-body', { 'result-stop-body--last': ii === day.items.length - 1 }]">
                      <div
                        class="result-stop-card"
                        role="button"
                        tabindex="0"
                        :aria-label="`${it.title} 상세 정보 보기`"
                        @click="openPlanItemDetail(it)"
                        @keydown.enter.prevent="openPlanItemDetail(it)"
                        @keydown.space.prevent="openPlanItemDetail(it)"
                      >
                        <img :src="planItemImageFor(it, it.cat)" alt="" class="result-stop-img" @error="handlePlanImgError($event, it.cat)" />
                        <div class="result-stop-info">
                          <div class="result-stop-meta">
                            <b class="result-stop-name">{{ it.title }}</b>
                            <Badge :tone="catTone(it.cat)" size="sm">{{ it.cat }}</Badge>
                          </div>
                          <div class="result-stop-note">{{ it.note }}</div>
                          <div v-if="it.userPlan" class="result-stop-user-plan">{{ it.userPlan }}</div>
                        </div>
                        <div class="result-stop-actions">
                          <label class="result-stop-cost-edit" @click.stop>
                            <span class="result-stop-cost-label">예상 비용</span>
                            <span class="result-stop-cost-field">
                              <input
                                class="result-stop-cost-input"
                                type="number"
                                min="0"
                                step="1000"
                                :value="displayedStopCost(it)"
                                aria-label="예상 비용"
                                @input="updateStopCost(it, $event.target.value)"
                                @mousedown.stop
                                @click.stop
                              />
                              <span>원</span>
                            </span>
                          </label>
                          <button class="result-stop-plan-btn" type="button" @click.stop="openPlacePlanModal(it)">
                            {{ it.userPlan ? '계획 수정' : '계획 작성' }}
                          </button>
                          <button class="result-stop-remove" @click.stop="removeItem(di, ii)" aria-label="제외">
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

          <!-- 일차 추가 버튼 -->
          <div style="margin-bottom: 24px;">
            <Button
              variant="secondary"
              size="lg"
              :full-width="true"
              style="
                border: 2px dashed var(--border); background: var(--surface);
                color: var(--text-secondary); font-weight: 700;
              "
              @click="addDayToPlan"
            >
              ➕ 일차 추가 (DAY {{ activePlan.days.length + 1 }})
            </Button>
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
            <Button variant="primary" size="lg" :full-width="true" @click="openSavePlanModal">
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

      <button
        type="button"
        class="koki-feedback-toggle"
        :class="{ 'is-open': isFeedbackSidebarOpen }"
        :aria-expanded="isFeedbackSidebarOpen"
        aria-controls="ai-feedback-sidebar"
        :aria-label="isFeedbackSidebarOpen ? 'AI 계획 피드백 닫기' : 'AI 계획 피드백 열기'"
        @click="toggleFeedbackSidebar"
      >
        <span v-if="!isFeedbackSidebarOpen" class="koki-feedback-bubble" aria-hidden="true">
          콕이가 도와줄까요?
        </span>
        <Mascot variant="guide" :size="44" />
      </button>

      <aside
        id="ai-feedback-sidebar"
        class="feedback-sidebar"
        :class="{ 'is-open': isFeedbackSidebarOpen }"
        aria-label="AI 계획 피드백"
      >
        <div class="result-chatdock feedback-sidebar-panel">
          <div class="chatdock-header">
            <Mascot variant="guide" :size="40" />
            <div>
              <b class="chatdock-title">콕이에게 물어보세요!</b>
              <div class="chatdock-sub">현재 입력한 일정으로 AI와 함께 다듬어보세요</div>
            </div>
          </div>

          <div ref="manualFeedbackBodyRef" class="chatdock-body manual-feedback-body">
            <div
              v-for="(m, i) in manualFeedbackMsgs"
              :key="i"
              :class="['chatdock-row', m.role === 'me' ? 'chatdock-row--me' : 'chatdock-row--kok']"
            >
              <div :class="['chatdock-bubble', m.role === 'me' ? 'bubble--me' : 'bubble--kok']">{{ m.text }}</div>
            </div>
            <div v-if="isManualFeedbackLoading" class="chatdock-row chatdock-row--kok">
              <div class="chatdock-bubble bubble--kok">계획을 살펴보고 있어요...</div>
            </div>
          </div>

          <div class="chatdock-quick">
            <button
              v-for="q in MANUAL_FEEDBACK_QUICK"
              :key="q"
              type="button"
              class="chatdock-quick-btn"
              :disabled="isManualFeedbackLoading"
              @click="sendManualFeedback(q)"
            >
              {{ q }}
            </button>
          </div>

          <div class="chatdock-input-row">
            <div class="chatdock-input-wrap">
              <input
                v-model="manualFeedbackText"
                placeholder="예) 2일차 동선이 너무 빡빡한지 봐줘"
                class="chatdock-input"
                :disabled="isManualFeedbackLoading"
                @keydown.enter="sendManualFeedback()"
              />
              <button
                type="button"
                aria-label="보내기"
                :disabled="isManualFeedbackLoading"
                :class="['chatdock-send', manualFeedbackText.trim() ? 'chatdock-send--active' : '']"
                @click="sendManualFeedback()"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </template>

    <div v-if="isPlacePlanModalOpen" class="save-modal-backdrop" @click.self="closePlacePlanModal">
      <form class="save-modal place-plan-modal" @submit.prevent="savePlacePlan">
        <div class="save-modal-header">
          <div>
            <span class="save-modal-kicker">장소 계획</span>
            <h2>{{ placePlanTarget?.title || '장소' }}에서의 계획</h2>
          </div>
          <button type="button" class="save-modal-close" aria-label="닫기" @click="closePlacePlanModal">×</button>
        </div>
        <label class="save-modal-label" for="place-plan-input">무엇을 할지, 어떻게 갈지 적어주세요</label>
        <textarea
          id="place-plan-input"
          v-model="placePlanInput"
          class="place-plan-textarea"
          maxlength="300"
          placeholder="예: 버스로 이동해서 도착 후 전망대 먼저 보고, 근처 카페에서 30분 쉬기"
          autofocus
        />
        <div class="save-modal-actions">
          <Button variant="secondary" type="button" @click="closePlacePlanModal">취소</Button>
          <Button variant="primary" type="submit">저장하기</Button>
        </div>
      </form>
    </div>
    <div v-if="isSaveModalOpen" class="save-modal-backdrop" @click.self="closeSavePlanModal">
      <form class="save-modal" @submit.prevent="handleSavePlan">
        <div class="save-modal-header">
          <div>
            <span class="save-modal-kicker">내 여행 저장</span>
            <h2>여행 이름을 정해주세요</h2>
          </div>
          <button type="button" class="save-modal-close" aria-label="닫기" @click="closeSavePlanModal">×</button>
        </div>
        <label class="save-modal-label" for="trip-title-input">여행 이름</label>
        <input
          id="trip-title-input"
          v-model="tripTitleInput"
          class="save-modal-input"
          maxlength="60"
          placeholder="예: 제주 동쪽 2박 3일"
          autocomplete="off"
          autofocus
        />
        <div class="save-modal-actions">
          <Button variant="secondary" type="button" :disabled="isSavingPlan" @click="closeSavePlanModal">취소</Button>
          <Button variant="primary" type="submit" :disabled="isSavingPlan || !tripTitleInput.trim()">
            {{ isSavingPlan ? '저장 중...' : '저장하기' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@keyframes kokload { from { width: 5%; } to { width: 93%; } }
@keyframes kokshimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.kok-dance-container {
  animation: kok-dance 1.2s infinite ease-in-out;
  display: flex;
  justify-content: center;
  align-items: center;
}

@keyframes kok-dance {
  0%, 100% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
  25% {
    transform: translateY(-14px) scale(1.05) rotate(-6deg);
  }
  50% {
    transform: translateY(0) scale(0.98) rotate(0deg);
  }
  75% {
    transform: translateY(-14px) scale(1.05) rotate(6deg);
  }
}

.kok-loading-container {
  width: 260px;
  height: 6px;
  border-radius: 99px;
  background: var(--gray-100);
  overflow: hidden;
  margin-top: 8px;
  position: relative;
}

.kok-loading-bar {
  width: 0%;
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--sky-500), var(--mint-400), var(--sky-500));
  background-size: 200% 100%;
  animation: kokload 8s cubic-bezier(0.05, 0.8, 0.1, 1) forwards, kokshimmer 2s infinite linear;
}

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

.result-shell--manual {
  grid-template-areas:
    "header"
    "tabs"
    "map"
    "plan";
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto auto 430px auto;
  gap: 14px;
  align-items: start;
  width: min(1180px, 100%);
  padding: 22px 24px 110px;
}

.result-shell--manual .result-map-col {
  display: contents;
}

.result-shell--manual .result-map-header {
  grid-area: header;
}

.result-shell--manual .result-day-tabs {
  grid-area: tabs;
}

.result-shell--manual .result-map-panel {
  grid-area: map;
  height: 430px;
  min-height: 430px;
}

.result-shell--manual .result-plan-col {
  grid-area: plan;
  padding: 0;
  overflow: visible;
}

.koki-feedback-toggle {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 122;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  padding: 0;
  border: 1.5px solid var(--sky-100);
  border-radius: 50%;
  background: var(--surface);
  color: var(--sky-800);
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 900;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
}

.koki-feedback-bubble {
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  width: max-content;
  max-width: calc(100vw - 48px);
  padding: 8px 12px;
  border: 1px solid var(--sky-100);
  border-radius: 16px;
  background: var(--surface);
  color: var(--sky-800);
  box-shadow: var(--shadow-md);
  font-size: 13px;
  font-weight: 850;
  line-height: 1.2;
  white-space: nowrap;
  pointer-events: none;
}

.koki-feedback-bubble::after {
  content: '';
  position: absolute;
  right: 20px;
  bottom: -6px;
  width: 10px;
  height: 10px;
  border-right: 1px solid var(--sky-100);
  border-bottom: 1px solid var(--sky-100);
  background: var(--surface);
  transform: rotate(45deg);
}

.koki-feedback-toggle:hover,
.koki-feedback-toggle.is-open {
  transform: translateY(-2px);
  background: var(--sky-50);
  box-shadow: var(--shadow-xl);
}

.feedback-sidebar {
  position: fixed;
  top: 68px;
  right: 0;
  bottom: 0;
  z-index: 121;
  width: min(460px, calc(100vw - 28px));
  padding: 18px 18px 96px;
  transform: translateX(calc(100% + 24px));
  transition: transform 0.24s var(--ease-out);
  pointer-events: none;
}

.feedback-sidebar.is-open {
  transform: translateX(0);
  pointer-events: auto;
}

.feedback-sidebar-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 24px;
  box-shadow: var(--shadow-xl);
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
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  flex: none;
}

.result-map-header-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.result-meta-content {
  min-width: 0;
  flex: 1;
}

.result-meta-title {
  font-size: 20px;
  font-weight: 800;
  margin-top: 4px;
  letter-spacing: -0.02em;
}

.result-meta-title-input {
  display: block;
  width: min(100%, 560px);
  margin: 0 0 12px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 21px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.25;
  outline: none;
  transition: all 0.15s;
}

.result-meta-title-input:hover {
  background: rgba(0, 0, 0, 0.03);
  border-color: var(--border-subtle);
}

.result-meta-title-input:focus {
  background: var(--surface);
  border-color: var(--coral-400);
  box-shadow: 0 0 0 3px rgba(255, 107, 61, 0.12);
}

.result-meta-grid {
  display: grid;
  grid-template-columns: minmax(190px, 1.25fr) minmax(88px, 0.6fr);
  gap: 10px;
  width: min(100%, 620px);
}

.result-meta-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: var(--shadow-xs);
}

.result-meta-field--region,
.result-meta-field--style,
.result-meta-field--request {
  grid-column: 1 / -1;
}

.result-meta-label {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 850;
  line-height: 1;
}

.result-meta-value {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 750;
}

.result-meta-date-input {
  min-width: 128px;
  font-size: 14px;
  font-weight: 800;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-primary);
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: all 0.15s;
}

.result-meta-date-input:hover {
  background: rgba(0, 0, 0, 0.04);
  border-color: var(--border-subtle);
}

.result-meta-date-input:focus {
  background: var(--surface);
  border-color: var(--coral-400);
  box-shadow: 0 0 0 2px rgba(255, 107, 61, 0.1);
}

.result-meta-end-date {
  font-size: 13px;
  font-weight: 750;
  color: var(--text-secondary);
  padding: 2px 0;
  white-space: nowrap;
}

.result-meta-people-input {
  width: 42px;
  font-size: 15px;
  font-weight: 850;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-primary);
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  text-align: center;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: all 0.15s;
}

.result-meta-people-input:hover {
  background: rgba(0, 0, 0, 0.04);
  border-color: var(--border-subtle);
}

.result-meta-people-input:focus {
  background: var(--surface);
  border-color: var(--coral-400);
  box-shadow: 0 0 0 2px rgba(255, 107, 61, 0.1);
}

.result-meta-text-input {
  width: 100%;
  min-width: 0;
  font-size: 13px;
  font-weight: 750;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-primary);
  padding: 2px 6px;
  margin-left: -6px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  outline: none;
  transition: all 0.15s;
}

.result-meta-text-input:hover {
  background: rgba(0, 0, 0, 0.04);
  border-color: var(--border-subtle);
}

.result-meta-text-input:focus {
  background: var(--surface);
  border-color: var(--coral-400);
  box-shadow: 0 0 0 2px rgba(255, 107, 61, 0.1);
}

.result-meta-text-display {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 750;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-region-editor {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.result-region-editor .result-meta-text-display {
  flex: 1;
  min-width: 120px;
}

.result-region-add {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
}

.result-region-select {
  height: 32px;
  min-width: 92px;
  max-width: 128px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 12.5px;
  font-weight: 750;
  outline: none;
  padding: 0 8px;
}

.result-region-select:disabled {
  cursor: not-allowed;
  color: var(--text-muted);
  background: var(--gray-50);
}

.result-region-select:focus {
  border-color: var(--coral-400);
  box-shadow: 0 0 0 2px rgba(255, 107, 61, 0.1);
}

.result-region-add-btn {
  height: 32px;
  padding: 0 11px;
  border: 1px solid var(--coral-200);
  border-radius: var(--radius-sm);
  background: var(--coral-50);
  color: var(--coral-700);
  font-family: var(--font-sans);
  font-size: 12.5px;
  font-weight: 850;
  cursor: pointer;
  white-space: nowrap;
}

.result-region-add-btn:hover {
  border-color: var(--coral-400);
  background: #fff;
}

@media (max-width: 1180px) {
  .result-region-editor {
    align-items: stretch;
    flex-direction: column;
  }

  .result-region-add {
    flex-wrap: wrap;
  }
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
  font-family: var(--font-sans);
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

.result-shell--manual .chatdock-title,
.feedback-sidebar .chatdock-title {
  font-size: 18px;
  font-weight: 900;
}

.result-shell--manual .chatdock-sub,
.feedback-sidebar .chatdock-sub {
  margin-top: 2px;
  font-size: 14px;
  line-height: 1.45;
}

.chatdock-body {
  max-height: 160px;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.manual-feedback-body {
  flex: 1;
  min-height: 0;
  max-height: none;
  padding: 16px;
  gap: 12px;
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
  font-family: inherit;
  word-break: keep-all;
}

.manual-feedback-body .chatdock-bubble {
  max-width: 88%;
  padding: 14px 16px;
  font-size: 16.5px;
  line-height: 1.7;
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
  font-family: inherit;
}

.result-shell--manual .chatdock-quick,
.feedback-sidebar .chatdock-quick {
  padding: 0 14px 12px;
  gap: 8px;
}

.result-shell--manual .chatdock-quick-btn,
.feedback-sidebar .chatdock-quick-btn {
  padding: 9px 14px;
  font-size: 14.5px;
  font-weight: 750;
}

.chatdock-quick-btn:disabled,
.chatdock-send:disabled {
  cursor: wait;
  opacity: 0.55;
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
  font-family: inherit;
  min-width: 0;
}

.result-shell--manual .chatdock-input-wrap,
.feedback-sidebar .chatdock-input-wrap {
  padding: 7px 7px 7px 16px;
}

.result-shell--manual .chatdock-input,
.feedback-sidebar .chatdock-input {
  font-size: 16px;
  font-weight: 650;
}

.result-shell--manual .chatdock-send,
.feedback-sidebar .chatdock-send {
  width: 44px;
  height: 44px;
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

.trip-title-edit-input {
  width: 100%;
  margin-top: 6px;
  padding: 10px 12px;
  border: 1.5px solid transparent;
  border-bottom-color: var(--coral-100);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 0;
  outline: none;
  transition: border-color 0.16s, box-shadow 0.16s, background 0.16s;
}

.trip-title-edit-input:hover {
  border-color: var(--border-subtle);
  background: var(--gray-50);
}

.trip-title-edit-input:focus {
  border-color: var(--coral-400);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 107, 61, 0.12);
}

.result-plan-period-date {
  margin-top: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 750;
}

.plan-view-toggle {
  display: inline-flex;
  gap: 5px;
  padding: 5px;
  margin: 0 0 18px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-pill);
  background: var(--gray-50);
  font-family: var(--font-sans);
}

.plan-view-toggle button {
  min-width: 118px;
  height: 36px;
  padding: 0 14px;
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 13px;
  font-weight: 850;
  cursor: pointer;
  transition: background 0.16s, color 0.16s, box-shadow 0.16s;
}

.plan-view-toggle button.active {
  background: var(--surface);
  color: var(--coral-700);
  box-shadow: var(--shadow-xs);
}

.plan-view-toggle button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
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

.result-day-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.16s;
}

.result-day-toggle:hover {
  border-color: var(--sky-200);
  background: var(--sky-50);
  color: var(--sky-700);
}

.result-day-toggle-icon {
  display: inline-block;
  font-size: 13px;
  line-height: 1;
  transition: transform 0.16s;
}

.result-day-toggle-icon.is-collapsed {
  transform: rotate(180deg);
}

.result-day-theme {
  font-weight: 700;
  font-size: 16px;
}

.result-day-items {
  padding: 14px 18px 18px;
}

.result-day-items--empty {
  min-height: 156px;
  display: flex;
  align-items: stretch;
}

.result-day-items--drag-over {
  border-radius: var(--radius-md);
  background: var(--sky-50);
  box-shadow: inset 0 0 0 2px var(--sky-300);
}

.result-empty-day {
  flex: 1;
  min-height: 132px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 22px;
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-secondary);
  text-align: left;
}

.result-empty-day-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  background: var(--sky-50);
  color: var(--sky-600);
}

.result-empty-day-title {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 850;
}

.result-empty-day-copy {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.45;
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
  padding: 3px 0 9px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.result-move-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--sky-100);
  background: rgba(240, 247, 255, 0.9);
  color: var(--sky-700);
  font-size: 12.5px;
  font-weight: 750;
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
  gap: 14px;
  position: relative;
}

.result-stop-time {
  width: 78px;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 10px;
}

.result-stop-time-label {
  padding-left: 2px;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.result-stop-time-input {
  width: 76px;
  height: 38px;
  padding: 0 9px;
  border: 1px solid rgba(186, 230, 253, 0.85);
  border-radius: 10px;
  background: #ffffff;
  color: var(--sky-700);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 900;
  outline: none;
  box-shadow: 0 5px 12px rgba(42, 123, 240, 0.08);
}

.result-stop-time-input::placeholder {
  color: var(--sky-300);
}

.result-stop-time-input:hover {
  border-color: var(--sky-300);
  background: #fff;
}

.result-stop-time-input:focus {
  border-color: var(--sky-500);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(42, 123, 240, 0.14);
}

.result-stop-track {
  position: relative;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 18px;
}

.result-stop-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid var(--surface);
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
  padding-bottom: 12px;
}

.result-stop-body--last {
  padding-bottom: 4px;
}

.result-stop-card {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr) 132px;
  gap: 14px;
  align-items: center;
  min-height: 126px;
  padding: 12px 14px 12px 12px;
  border: 1px solid rgba(226, 220, 213, 0.78);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(31, 42, 36, 0.06);
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;
  cursor: pointer;
}

.result-stop-card:hover {
  transform: translateY(-1px);
  border-color: rgba(42, 123, 240, 0.22);
  box-shadow: 0 12px 28px rgba(31, 42, 36, 0.09);
}

.result-stop-card:focus-visible {
  outline: none;
  border-color: var(--coral-400);
  box-shadow:
    0 0 0 3px rgba(255, 107, 61, 0.13),
    0 14px 30px rgba(31, 42, 36, 0.11);
}

.result-stop-img {
  width: 108px;
  height: 102px;
  border-radius: 9px;
  object-fit: cover;
  background: var(--gray-50);
  box-shadow: inset 0 0 0 1px rgba(31, 42, 36, 0.06);
}

.result-stop-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  align-self: stretch;
  justify-content: center;
  padding: 2px 0;
}

.result-stop-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.result-stop-name {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 15.5px;
  font-weight: 900;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-stop-note {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.result-stop-user-plan {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 10px;
  padding: 8px 10px;
  border: 1px solid rgba(6, 165, 130, 0.14);
  border-radius: 8px;
  background: rgba(237, 250, 245, 0.72);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.result-stop-actions {
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 9px 8px;
  flex: none;
  width: 132px;
  align-self: stretch;
  padding: 2px 0;
}

.result-stop-cost-edit {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 5px;
  color: var(--text-primary);
  white-space: nowrap;
  grid-column: 1 / -1;
}

.result-stop-cost-label {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 850;
  text-align: left;
}

.result-stop-cost-field {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid rgba(255, 107, 61, 0.14);
  border-radius: 9px;
  background: rgba(255, 247, 243, 0.76);
  color: var(--coral-700);
  font-size: 12px;
  font-weight: 850;
  box-shadow: none;
}

.result-stop-cost-edit:focus-within .result-stop-cost-field {
  border-color: var(--coral-500);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 107, 61, 0.13);
}

.result-stop-cost-input {
  width: 72px;
  border: none;
  background: transparent;
  color: inherit;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 850;
  text-align: right;
  outline: none;
}

.result-stop-cost-input::-webkit-outer-spin-button,
.result-stop-cost-input::-webkit-inner-spin-button {
  margin: 0;
}

.result-stop-plan-btn {
  height: 34px;
  min-width: 0;
  padding: 0 10px;
  border: 1px solid var(--mint-200);
  border-radius: 9px;
  background: var(--mint-50);
  color: var(--mint-700);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: none;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    transform 0.15s ease;
}

.result-stop-plan-btn:hover {
  border-color: var(--mint-400);
  background: #fff;
  transform: translateY(-1px);
}

.result-stop-remove {
  border: 1px solid var(--border-subtle);
  background: var(--surface);
  width: 34px;
  height: 34px;
  border-radius: 9px;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.result-stop-remove:hover {
  border-color: var(--coral-200);
  background: var(--coral-50);
  color: var(--coral-600);
}

@media (max-width: 1120px) {
  .result-stop-card {
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 12px;
  }

  .result-stop-img {
    width: 96px;
    height: 92px;
  }

  .result-stop-actions {
    grid-column: 1 / -1;
    width: 100%;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: end;
    padding-top: 2px;
  }

  .result-stop-cost-edit {
    grid-column: auto;
  }

  .result-stop-cost-field {
    justify-content: flex-start;
  }
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

.save-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(31, 42, 36, 0.38);
}

.save-modal {
  width: min(420px, 100%);
  padding: 22px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--surface);
  box-shadow: var(--shadow-lg);
}

.save-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.save-modal-kicker {
  display: block;
  margin-bottom: 5px;
  color: var(--coral-500);
  font-size: 12px;
  font-weight: 800;
}

.save-modal h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 21px;
  font-weight: 800;
}

.save-modal-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--gray-50);
  color: var(--text-secondary);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.save-modal-label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.save-modal-input {
  width: 100%;
  height: 46px;
  padding: 0 13px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 15px;
  outline: none;
}

.save-modal-input:focus {
  border-color: var(--coral-500);
  box-shadow: 0 0 0 3px rgba(255, 107, 61, 0.14);
}

.save-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.place-plan-modal {
  width: min(520px, 100%);
}

.place-plan-textarea {
  width: 100%;
  min-height: 150px;
  padding: 12px 13px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 14.5px;
  line-height: 1.55;
  resize: vertical;
  outline: none;
}

.place-plan-textarea:focus {
  border-color: var(--coral-500);
  box-shadow: 0 0 0 3px rgba(255, 107, 61, 0.14);
}
/* ── 드래그앤드롭 피드백 스타일 ── */
.result-stop-row {
  transition: border-top 0.15s ease-in-out, margin-top 0.15s ease-in-out;
}
.result-stop-row.dragging {
  opacity: 0.35;
  border: 1.5px dashed var(--gray-300);
  background: var(--gray-50);
}
.result-stop-row.drag-over {
  border-top: 4px solid var(--coral-500);
  margin-top: -4px;
}
</style>
