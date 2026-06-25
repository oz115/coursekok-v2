<script setup>
import { computed, inject, ref, onMounted, watch } from 'vue'
import { useTripsStore } from '@/stores/trips.js'
import { useTripLogStore } from '@/stores/triplog.js'
import PageHeader from '@/components/layout/PageHeader.vue'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import KkIcon from '@/components/icons/KkIcon.vue'
import Rating from '@/components/data-display/Rating.vue'
import Switch from '@/components/forms/Switch.vue'
import Mascot from '@/components/brand/Mascot.vue'

const navigate = inject('navigate', () => {})
const showToast = inject('showToast', () => {})

const tripsStore = useTripsStore()
const tripLogStore = useTripLogStore()

onMounted(() => tripsStore.fetchTrips())

const trips = computed(() => tripsStore.trips)

// ──── 화면 모드 ────────────────────────────────────────────
const viewMode = ref('list') // 'list' | 'detail' | 'diary'
const detailTab = ref('plan') // 'plan' | 'record'
const selectedTrip = ref(null)
const sortOrder = ref('default') // 'default' | 'date-asc' | 'created-desc'

// ──── 무드 상수 ────────────────────────────────────────────
const MOODS = [
  { label: '행복했어요', emoji: '😊' },
  { label: '설렜어요', emoji: '✨' },
  { label: '편안했어요', emoji: '🌿' },
  { label: '잊지 못해요', emoji: '💛' },
]

// ──── 여행 상태 판단 ────────────────────────────────────────
function getTripStatus(trip) {
  if (trip.tripLogId && trip.tripLogIsPublic) return 'published'
  if (trip.tripLogId) return 'logged'
  if (!trip.startDate) return 'no-date'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [sy, sm, sd] = String(trip.startDate).split('-').map(Number)
  const start = new Date(sy, sm - 1, sd)
  if (today < start) return 'upcoming'
  if (trip.endDate) {
    const [ey, em, ed] = String(trip.endDate).split('-').map(Number)
    if (today > new Date(ey, em - 1, ed)) return 'past'
  }
  return 'ongoing'
}

const STATUS_CTA = {
  upcoming: '일정 보기',
  ongoing: '오늘 일정 보기',
  past: '여행 기록 남기기',
  logged: '이어서 기록하기',
  published: 'TripLog 보기',
  'no-date': '일정 보기',
}

const STATUS_BADGE = {
  upcoming: { label: '다가오는 여행', tone: 'sky' },
  ongoing: { label: '여행 중', tone: 'mint' },
  past: { label: '기록 없음', tone: 'coral' },
  logged: { label: '기록 완료', tone: 'neutral' },
  published: { label: 'TripLog 공개', tone: 'mint' },
  'no-date': { label: '날짜 미정', tone: 'neutral' },
}

const selectedTripStatus = computed(() =>
  selectedTrip.value ? getTripStatus(selectedTrip.value) : null,
)

// ──── 섹션 그루핑 + 정렬 ──────────────────────────────────
function applySort(list) {
  if (sortOrder.value === 'date-asc') {
    return [...list].sort((a, b) => {
      if (!a.startDate) return 1
      if (!b.startDate) return -1
      return new Date(a.startDate) - new Date(b.startDate)
    })
  }
  if (sortOrder.value === 'created-desc') {
    return [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }
  return list
}

const ongoingTrips = computed(() => applySort(trips.value.filter(t => getTripStatus(t) === 'ongoing')))
const upcomingTrips = computed(() => applySort(trips.value.filter(t => getTripStatus(t) === 'upcoming')))
const pastTrips = computed(() => applySort(trips.value.filter(t => ['past', 'logged', 'published'].includes(getTripStatus(t)))))
const noDateTrips = computed(() => applySort(trips.value.filter(t => getTripStatus(t) === 'no-date')))
const planningTrips = computed(() => applySort([...upcomingTrips.value, ...noDateTrips.value]))

const selectedStage = ref('planning')
const stageWasSelected = ref(false)
const tripStages = computed(() => [
  {
    value: 'planning',
    label: '여행 계획',
    count: planningTrips.value.length,
    description: '다가오는 일정과 날짜 미정 여행',
    icon: 'calendar',
  },
  {
    value: 'ongoing',
    label: '여행 중',
    count: ongoingTrips.value.length,
    description: '지금 바로 확인할 오늘의 일정',
    icon: 'plane',
  },
  {
    value: 'past',
    label: '지난 여행',
    count: pastTrips.value.length,
    description: '후기를 남기고 다시 보는 기록',
    icon: 'camera',
  },
])

const activeStageTrips = computed(() => {
  if (selectedStage.value === 'ongoing') return ongoingTrips.value
  if (selectedStage.value === 'past') return pastTrips.value
  return planningTrips.value
})

const activeStageMeta = computed(
  () => tripStages.value.find(stage => stage.value === selectedStage.value) || tripStages.value[0],
)

watch(
  () => tripsStore.loading,
  (loading) => {
    if (!loading && !stageWasSelected.value && ongoingTrips.value.length) selectedStage.value = 'ongoing'
  },
)

function selectStage(stage) {
  stageWasSelected.value = true
  selectedStage.value = stage
}

function tripTimingLabel(trip) {
  const status = getTripStatus(trip)
  if (status === 'ongoing') {
    if (!trip.endDate) return '현재 여행 중'
    const end = new Date(`${trip.endDate}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const remaining = Math.max(0, Math.round((end - today) / 86400000))
    return remaining === 0 ? '오늘 여행 마지막 날' : `여행 ${remaining}일 남음`
  }
  if (status === 'upcoming') {
    const start = new Date(`${trip.startDate}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days = Math.max(0, Math.round((start - today) / 86400000))
    return days === 0 ? '오늘 출발' : `출발 D-${days}`
  }
  if (status === 'no-date') return '날짜를 정하면 일정이 더 정확해져요'
  if (status === 'published') return 'TripLog에 공개한 여행'
  if (status === 'logged') return '작성한 기록이 있어요'
  return '여행 기록을 남겨보세요'
}

// ──── 내비게이션 ────────────────────────────────────────────
async function openDetail(trip) {
  try {
    const detail = await tripsStore.getTripDetail(trip.id)
    selectedTrip.value = {
      ...detail,
      cover: detail.coverImage,
      visibility: detail.isPublic ? 'public' : 'private',
      tripLogId: trip.tripLogId,
      tripLogIsPublic: trip.tripLogIsPublic,
    }
  } catch {
    selectedTrip.value = { ...trip, cover: trip.coverImage }
  }
  detailTab.value = 'plan'
  viewMode.value = 'detail'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openDiary() {
  reviewByPlace.value = {}
  excludedPlaces.value = new Set()
  addedPlaces.value = []
  editingPlace.value = null
  diaryTitle.value = ''
  diaryStory.value = ''
  diaryMood.value = '행복했어요'
  visibility.value = selectedTrip.value?.tripLogId
    ? (selectedTrip.value.tripLogIsPublic ? 'public' : 'private')
    : 'public'
  viewMode.value = 'diary'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function backToList() {
  viewMode.value = 'list'
  selectedTrip.value = null
  editingPlace.value = null
}

function backToDetail() {
  viewMode.value = 'detail'
  editingPlace.value = null
}

// ──── 날짜 헬퍼 ────────────────────────────────────────────
function formatDateRange(startDate, endDate) {
  if (!startDate) return '날짜 미정'
  const fmt = (d) => {
    const [y, m, day] = String(d).split('-')
    return `${y}.${m}.${day}`
  }
  return endDate ? `${fmt(startDate)} ~ ${fmt(endDate)}` : fmt(startDate)
}

function formatDateOffset(startDate, offset) {
  if (!startDate) return ''
  const [y, m, d] = String(startDate).split('-').map(Number)
  const date = new Date(y, m - 1, d + offset)
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

function computePeriod(startDate, endDate) {
  if (!startDate || !endDate) return null
  const [sy, sm, sd] = String(startDate).split('-').map(Number)
  const [ey, em, ed] = String(endDate).split('-').map(Number)
  const nights = Math.round((new Date(ey, em - 1, ed) - new Date(sy, sm - 1, sd)) / 86400000)
  if (nights <= 0) return '당일치기'
  return `${nights}박 ${nights + 1}일`
}

function displayPeriod(trip) {
  return computePeriod(trip.startDate, trip.endDate) || trip.period || null
}

// ──── 여행 기록 에디터 상태 ────────────────────────────────
const reviewByPlace = ref({})
const excludedPlaces = ref(new Set())
const addedPlaces = ref([])
const editingPlace = ref(null)
const publishOpen = ref(false)
const newPlaceName = ref('')
const diaryTitle = ref('')
const diaryStory = ref('')
const diaryMood = ref('행복했어요')
const visibility = ref('private')
const isPublic = computed({
  get: () => visibility.value === 'public',
  set: (v) => { visibility.value = v ? 'public' : 'private' },
})

const INTERNAL_TRAVEL_STYLES = new Set([
  String.fromCharCode(0xc218, 0xb3d9, 0xacc4, 0xd68d),
  'manualplan',
])

function publicTravelStyle(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  const key = text.replace(/\s+/g, '').toLowerCase()
  return INTERNAL_TRAVEL_STYLES.has(key) ? '' : text
}

const tripDays = computed(() =>
  selectedTrip.value?.plan?.days ??
  selectedTrip.value?.plan?.day_plans ??
  []
)

const allStops = computed(() => {
  const planned = tripDays.value.flatMap((day, di) =>
    (day.items ?? day.places ?? []).map((item, ii) => ({ ...item, key: `planned-${di}-${ii}`, planned: true })),
  )
  return [...planned, ...addedPlaces.value]
})
const activeStops = computed(() => allStops.value.filter((s) => !excludedPlaces.value.has(s.key)))
const reviewCount = computed(() => activeStops.value.filter((s) => {
  const r = reviewByPlace.value[s.key]
  return r?.memo?.trim() || r?.rating || r?.photos?.length
}).length)
const photoCount = computed(() =>
  activeStops.value.reduce((c, s) => c + (reviewByPlace.value[s.key]?.photos?.length || 0), 0),
)
const writingProgress = computed(() => {
  const steps = [Boolean(diaryTitle.value.trim()), Boolean(diaryStory.value.trim()), reviewCount.value > 0]
  return Math.round((steps.filter(Boolean).length / 3) * 100)
})

function hasMemory(stop) {
  const m = reviewByPlace.value[stop.key]
  return Boolean(m?.memo?.trim() || m?.rating || m?.photos?.length)
}

function openReview(stop) {
  editingPlace.value = stop
  if (!reviewByPlace.value[stop.key]) {
    reviewByPlace.value = {
      ...reviewByPlace.value,
      [stop.key]: { rating: 0, memo: '', photos: [] },
    }
  }
}

function saveReview() {
  editingPlace.value = null
  showToast({ tone: 'success', message: '이 장소의 추억을 기록에 담았어요.' })
}

function toggleExcluded(stop) {
  const next = new Set(excludedPlaces.value)
  if (next.has(stop.key)) next.delete(stop.key)
  else next.add(stop.key)
  excludedPlaces.value = next
}

function addUnplannedByName() {
  const name = newPlaceName.value.trim()
  if (!name) return
  if (allStops.value.some((s) => s.title === name)) {
    showToast({ tone: 'default', message: '이미 추가된 장소예요.' })
    return
  }
  const stop = { title: name, key: `added-custom-${Date.now()}`, planned: false, img: '', cat: '방문 장소' }
  addedPlaces.value = [...addedPlaces.value, stop]
  newPlaceName.value = ''
  openReview(stop)
}

function compressImage(file, maxPx = 800, quality = 0.65) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

async function onPhotoInput(event) {
  const files = Array.from(event.target.files || []).slice(0, 4)
  const key = editingPlace.value.key
  for (const file of files) {
    const cur = reviewByPlace.value[key]
    if ((cur.photos || []).length >= 4) break
    const compressed = await compressImage(file)
    reviewByPlace.value = {
      ...reviewByPlace.value,
      [key]: { ...cur, photos: [...(cur.photos || []), compressed].slice(0, 4) },
    }
  }
  event.target.value = ''
}

function removePhoto(index) {
  const key = editingPlace.value.key
  const cur = reviewByPlace.value[key]
  reviewByPlace.value = {
    ...reviewByPlace.value,
    [key]: { ...cur, photos: cur.photos.filter((_, i) => i !== index) },
  }
}

function dayNumberFromKey(key) {
  const match = key?.match(/^planned-(\d+)-/)
  return match ? Number(match[1]) + 1 : 1
}

function buildTripLogPayload(isPublicFlag) {
  const placeLogs = activeStops.value
    .filter(hasMemory)
    .map((stop, i) => {
      const r = reviewByPlace.value[stop.key]
      return {
        placeTitle: stop.title,
        placeCategory: stop.cat,
        placeImage: stop.img,
        reviewContent: r?.memo || '',
        imageUrl: r?.photos?.[0] || '',
        rating: r?.rating || null,
        visitOrder: i + 1,
        dayNumber: dayNumberFromKey(stop.key),
      }
    })
  const photos = activeStops.value.filter(hasMemory).flatMap((s) => reviewByPlace.value[s.key]?.photos || [])
  const rawCover = photos[0] || selectedTrip.value.cover || selectedTrip.value.coverImage || ''
  const safeCover = rawCover.startsWith('data:') ? '' : rawCover
  return {
    tripId: typeof selectedTrip.value.id === 'number' ? selectedTrip.value.id : null,
    title: diaryTitle.value.trim() || selectedTrip.value.title,
    content: diaryStory.value.trim() || `${diaryMood.value}. 오래 기억하고 싶은 여행 이야기예요.`,
    region: selectedTrip.value.region || '',
    travelStyle: publicTravelStyle(selectedTrip.value.travelStyle || selectedTrip.value.style),
    mood: diaryMood.value,
    coverImage: safeCover,
    isPublic: isPublicFlag,
    placeLogs,
  }
}

async function publishTripLog() {
  try {
    const created = await tripLogStore.publish(buildTripLogPayload(true))
    if (created?.id) {
      tripLogStore.pendingLogId = created.id
      selectedTrip.value = { ...selectedTrip.value, tripLogId: created.id, tripLogIsPublic: true }
    }
    publishOpen.value = false
    showToast({ tone: 'success', message: '여행 기록이 TripLog에 공개됐어요.' })
    navigate('triplog')
  } catch {
    showToast({ tone: 'default', message: '발행에 실패했어요. 다시 시도해주세요.' })
  }
}

async function saveDiary() {
  try {
    const saved = await tripLogStore.publish(buildTripLogPayload(false))
    if (saved?.id) {
      selectedTrip.value = { ...selectedTrip.value, tripLogId: saved.id, tripLogIsPublic: false }
    }
    showToast({ tone: 'success', message: '나만의 여행 기록으로 저장했어요.' })
    backToDetail()
  } catch {
    showToast({ tone: 'default', message: '저장에 실패했어요. 다시 시도해주세요.' })
  }
}
</script>

<template>
  <section class="my-trips">
    <div class="shell">

      <!-- ───────── 목록 ───────── -->
      <template v-if="viewMode === 'list'">
        <PageHeader
          eyebrow="MY TRIPS"
          title="내 여행"
          description="준비부터 여행 중 일정, 다녀온 뒤의 기록까지 여행의 흐름대로 관리하세요."
          tone="trips"
        >
          <template #aside>
            <div class="trip-header-aside">
              <div class="trip-summary">
                <strong>{{ trips.length }}</strong>
                <span>전체 여행</span>
              </div>
              <Button variant="primary" size="sm" @click="navigate('planner')">
                <template #left-icon><KkIcon name="plus" :size="15" /></template>
                새 여행
              </Button>
            </div>
          </template>
        </PageHeader>
        

        <div v-if="tripsStore.loading" class="loading-state">
          <div v-for="n in 3" :key="n" class="loading-card" />
        </div>

        <div v-else-if="trips.length === 0" class="empty-state">
          <Mascot variant="wink" :size="110" :pop="true" />
          <div class="empty-copy">
            <h3>여행 일정이 없으시네요!</h3>
            <p>AI 플래너를 활용해서 나만의 여행을 만들거나<br>더 다양한 여행을 계획해보세요.</p>
          </div>
          <div class="popular-row">
            <span class="popular-label"><KkIcon name="pin" :size="13" /> 인기 여행지</span>
            <div class="popular-chips">
              <button
                v-for="dest in ['제주', '부산', '경주', '강릉', '여수', '전주']"
                :key="dest"
                type="button"
                @click="navigate('planner')"
              >{{ dest }}</button>
            </div>
          </div>
          <Button variant="primary" size="lg" @click="navigate('planner')">AI 플래너로 여행 만들기</Button>
        </div>

        <template v-else>
          <nav class="trip-stage-nav" aria-label="여행 상태">
            <button
              v-for="stage in tripStages"
              :key="stage.value"
              type="button"
              :class="['trip-stage-button', `trip-stage-button--${stage.value}`, { active: selectedStage === stage.value }]"
              :aria-current="selectedStage === stage.value ? 'page' : undefined"
              @click="selectStage(stage.value)"
            >
              <span class="trip-stage-icon"><KkIcon :name="stage.icon" :size="19" /></span>
              <span class="trip-stage-copy">
                <strong>{{ stage.label }}</strong>
                <small>{{ stage.description }}</small>
              </span>
              <span class="trip-stage-count">{{ stage.count }}</span>
            </button>
          </nav>

          <!-- 정렬 컨트롤 -->
          <div class="list-header">
            <div>
              <strong class="active-stage-title">{{ activeStageMeta.label }}</strong>
              <span class="total-count">{{ activeStageTrips.length }}개의 여행</span>
            </div>
            <div class="sort-tabs">
              <button :class="{ active: sortOrder === 'default' }" type="button" @click="sortOrder = 'default'">기본</button>
              <button :class="{ active: sortOrder === 'date-asc' }" type="button" @click="sortOrder = 'date-asc'">임박순</button>
              <button :class="{ active: sortOrder === 'created-desc' }" type="button" @click="sortOrder = 'created-desc'">최신순</button>
            </div>
          </div>

          <div class="trip-list">
            <article
              v-for="trip in activeStageTrips"
              :key="trip.id"
              class="trip-card"
              :class="{
                'ongoing-card': selectedStage === 'ongoing',
                'past-card': selectedStage === 'past',
              }"
              @click="openDetail(trip)"
            >
              <div class="trip-card-status">
                <span>{{ tripTimingLabel(trip) }}</span>
              </div>
              <div class="trip-card-body">
                <div class="badges">
                  <Badge tone="coral">{{ trip.region || '여행' }}</Badge>
                  <Badge tone="neutral">{{ displayPeriod(trip) || '날짜 미정' }}</Badge>
                  <Badge v-if="trip.style" tone="mint">{{ trip.style }}</Badge>
                </div>
                <h2>{{ trip.title }}</h2>
                <div class="card-meta">
                  <span v-if="trip.startDate"><KkIcon name="calendar" :size="14" />{{ formatDateRange(trip.startDate, trip.endDate) }}</span>
                  <span v-else><KkIcon name="calendar" :size="14" />날짜 미정</span>
                  <span><KkIcon name="check" :size="14" />{{ STATUS_BADGE[getTripStatus(trip)].label }}</span>
                </div>
              </div>
              <div class="card-action">
                <span>{{ STATUS_CTA[getTripStatus(trip)] }}</span>
                <KkIcon name="chevronR" :size="20" />
              </div>
            </article>

            <div v-if="activeStageTrips.length === 0" class="stage-empty">
              <span class="stage-empty-icon"><KkIcon :name="activeStageMeta.icon" :size="24" /></span>
              <strong>{{ activeStageMeta.label }}에 해당하는 여행이 없어요.</strong>
              <p v-if="selectedStage === 'planning'">새 일정을 만들면 이곳에서 준비 과정을 이어갈 수 있어요.</p>
              <p v-else-if="selectedStage === 'ongoing'">여행 날짜가 되면 오늘 필요한 일정이 여기에 표시돼요.</p>
              <p v-else>다녀온 여행은 기록을 남겨 오래 보관할 수 있어요.</p>
            </div>

          </div>
        </template>
      </template>

      <!-- ───────── 여행 상세 ───────── -->
      <template v-else-if="viewMode === 'detail'">
        <div class="editor-topbar">
          <button class="back" type="button" @click="backToList">
            <KkIcon name="chevronL" :size="18" /> 내 여행
          </button>
          <Badge :tone="STATUS_BADGE[selectedTripStatus]?.tone || 'neutral'">
            {{ STATUS_BADGE[selectedTripStatus]?.label }}
          </Badge>
        </div>

        <header class="trip-hero" :class="{ 'no-cover': !selectedTrip.cover }">
          <img v-if="selectedTrip.cover" :src="selectedTrip.cover" :alt="selectedTrip.title">
          <div v-if="selectedTrip.cover" class="trip-shade" />
          <div class="trip-title">
            <span>
              {{ selectedTrip.region || '' }}
              <template v-if="selectedTrip.region && (computePeriod(selectedTrip.startDate, selectedTrip.endDate) || selectedTrip.period)"> · </template>
              {{ computePeriod(selectedTrip.startDate, selectedTrip.endDate) || selectedTrip.period || '' }}
            </span>
            <h1>{{ selectedTrip.title }}</h1>
            <p v-if="selectedTrip.startDate">{{ formatDateRange(selectedTrip.startDate, selectedTrip.endDate) }}</p>
          </div>
        </header>

        <div class="detail-tabs">
          <button :class="{ active: detailTab === 'plan' }" type="button" @click="detailTab = 'plan'">
            <KkIcon name="calendar" :size="15" /> 여행 일정
          </button>
          <button :class="{ active: detailTab === 'record' }" type="button" @click="detailTab = 'record'">
            <KkIcon name="pencil" :size="15" /> 여행 기록
            <span v-if="selectedTrip.tripLogId" class="tab-dot" />
          </button>
        </div>

        <!-- 여행 일정 탭 -->
        <div v-if="detailTab === 'plan'" class="detail-content">
          <div v-if="tripDays.length" class="plan-days">
            <div v-for="(day, i) in tripDays" :key="i" class="plan-day">
              <div class="plan-day-header">
                <span class="day-badge">Day {{ i + 1 }}</span>
                <span v-if="selectedTrip.startDate" class="day-date">
                  {{ formatDateOffset(selectedTrip.startDate, i) }}
                </span>
              </div>
              <div class="plan-places">
                <template v-for="(item, j) in (day.items ?? day.places ?? [])" :key="j">
                  <div class="plan-place-row">
                    <img v-if="item.img" :src="item.img" :alt="item.title" class="place-thumb">
                    <div v-else class="place-thumb place-thumb--empty">
                      <KkIcon name="pin" :size="16" />
                    </div>
                    <div class="place-info">
                      <span class="place-cat">{{ item.cat }}</span>
                      <strong>{{ item.title }}</strong>
                      <p v-if="item.memo || item.note" class="place-memo">{{ item.memo || item.note }}</p>
                    </div>
                  </div>
                  <div v-if="j < (day.items ?? day.places ?? []).length - 1" class="place-connector" />
                </template>
              </div>
            </div>
          </div>
          <div v-else class="plan-empty">
            <KkIcon name="calendar" :size="36" />
            <p>저장된 여행 일정 정보가 없어요.</p>
          </div>
        </div>

        <!-- 여행 기록 탭 -->
        <div v-else class="detail-content">
          <div v-if="!selectedTrip.tripLogId" class="record-empty">
            <Mascot variant="wink" :size="90" />
            <div>
              <h3>아직 남긴 여행 기록이 없어요.</h3>
              <p>실제로 다녀온 장소와 기억을 남겨보세요.</p>
            </div>
            <Button
              v-if="['past', 'ongoing', 'no-date'].includes(selectedTripStatus)"
              variant="primary"
              size="md"
              @click="openDiary"
            >여행 기록 남기기</Button>
          </div>
          <div v-else class="record-exists">
            <div class="record-exists-inner">
              <div class="record-check"><KkIcon name="check" :size="18" /></div>
              <div>
                <strong>여행 기록이 있어요.</strong>
                <span>{{ selectedTrip.tripLogIsPublic ? 'TripLog에 공개된 기록이에요.' : '나만 보는 기록이에요.' }}</span>
              </div>
            </div>
            <Button variant="ghost" size="md" @click="openDiary">기록 이어서 쓰기</Button>
          </div>
        </div>

        <!-- 하단 CTA: record 탭에서는 숨김 (탭 안에 이미 CTA 존재) -->
        <div class="detail-footer">
          <Button
            v-if="selectedTripStatus === 'published'"
            variant="primary"
            size="lg"
            :full-width="true"
            @click="navigate('triplog')"
          >TripLog에서 보기</Button>
          <Button
            v-else-if="selectedTripStatus === 'logged'"
            variant="primary"
            size="lg"
            :full-width="true"
            @click="openDiary"
          >이어서 기록하기</Button>
          <Button
            v-else-if="['past', 'ongoing', 'no-date'].includes(selectedTripStatus) && detailTab !== 'record'"
            variant="primary"
            size="lg"
            :full-width="true"
            @click="openDiary"
          >여행 기록 남기기</Button>
        </div>
      </template>

      <!-- ───────── 여행 기록 에디터 ───────── -->
      <template v-else>
        <div class="editor-topbar">
          <button class="back" type="button" @click="backToDetail">
            <KkIcon name="chevronL" :size="18" /> {{ selectedTrip?.title || '여행 상세' }}
          </button>
          <div class="editor-state">
            <span class="autosave-dot" />
            여행 기록 작성 중
          </div>
        </div>


        <div class="workspace">
          <main class="journal-canvas">
            <section class="diary-editor">
              <div class="diary-heading">
                <span><KkIcon name="pencil" :size="16" /> 나의 여행 이야기</span>
                <p>완벽한 글보다 그날의 온도와 기분을 편하게 남겨보세요.</p>
              </div>
              <input
                v-model="diaryTitle"
                class="diary-title-input"
                placeholder="이 여행을 한 문장으로 기억한다면?"
              >
              <div class="mood-row">
                <button
                  v-for="m in MOODS"
                  :key="m.label"
                  type="button"
                  :class="{ active: diaryMood === m.label }"
                  @click="diaryMood = m.label"
                >{{ m.emoji }} {{ m.label }}</button>
              </div>
              <textarea
                v-model="diaryStory"
                rows="10"
                placeholder="여행을 떠나게 된 이유부터 기억나는 장면, 함께 나눈 대화까지 자유롭게 적어보세요.&#10;&#10;예) 계획 없이 걷다가 만난 작은 골목이 이번 여행에서 가장 오래 기억에 남았다."
              />
              <div class="writing-hint">
                <KkIcon name="sparkles" :size="15" />
                날짜 순서대로 쓰지 않아도 괜찮아요. 가장 선명한 장면부터 시작해보세요.
              </div>
            </section>

            <section class="saved-course">
              <div class="section-title">
                <div><span>TRAVEL ROUTE</span><h2>이번 여행의 발자국</h2></div>
                <Badge tone="neutral">{{ allStops.filter((s) => s.planned).length }}곳</Badge>
              </div>
              <div class="course-places">
                <span v-for="stop in allStops.filter((s) => s.planned)" :key="stop.key">
                  <KkIcon name="pin" :size="13" /> {{ stop.title }}
                </span>
              </div>
            </section>

            <section class="memory-section">
              <header>
                <div>
                  <span>SCENES FROM THE TRIP</span>
                  <h2>장소마다 남은 장면</h2>
                  <p>사진 한 장과 짧은 문장만으로도 충분한 여행 기록이 돼요.</p>
                </div>
                <Badge tone="coral">{{ reviewCount }}/{{ activeStops.length }} 기록</Badge>
              </header>
              <article
                v-for="stop in allStops"
                :key="stop.key"
                class="memory-card"
                :class="{ excluded: excludedPlaces.has(stop.key) }"
              >
                <div class="memory-visual">
                  <img :src="reviewByPlace[stop.key]?.photos?.[0] || stop.img" :alt="stop.title">
                  <span v-if="reviewByPlace[stop.key]?.photos?.length" class="photo-count">
                    <KkIcon name="camera" :size="13" />
                    {{ reviewByPlace[stop.key].photos.length }}
                  </span>
                </div>
                <div class="memory-copy">
                  <div class="memory-place-head">
                    <div>
                      <span>{{ stop.cat }} · {{ stop.region || selectedTrip.region || '여행 장소' }}</span>
                      <h3>{{ stop.title }}</h3>
                    </div>
                    <Badge v-if="!stop.planned" tone="mint" size="sm">우연히 발견</Badge>
                  </div>
                  <template v-if="hasMemory(stop)">
                    <p>{{ reviewByPlace[stop.key]?.memo || '사진으로 남긴 여행의 한 장면이에요.' }}</p>
                  </template>
                  <p v-else class="memory-empty-copy">이곳에서 무엇을 보고, 먹고, 느꼈나요?</p>
                  <div class="memory-card-actions">
                    <button class="skip-button" type="button" @click="toggleExcluded(stop)">
                      {{ excludedPlaces.has(stop.key) ? '다시 포함' : '안 갔어요' }}
                    </button>
                    <button class="review-button" type="button" @click="openReview(stop)">
                      <KkIcon :name="hasMemory(stop) ? 'pencil' : 'camera'" :size="16" />
                      {{ hasMemory(stop) ? '기록 다듬기' : '이 장면 기록하기' }}
                    </button>
                  </div>
                </div>
                <div v-if="reviewByPlace[stop.key]?.rating" class="saved-rating">
                  <KkIcon name="star" :size="15" /> {{ reviewByPlace[stop.key].rating }}
                </div>
              </article>
            </section>

            <section class="add-place">
              <div>
                <strong>계획에 없던 장소도 다녀왔나요?</strong>
                <p>일정에 없던 장소도 내 여행 기록에 자유롭게 추가할 수 있어요.</p>
              </div>
              <div class="add-place-input">
                <input
                  v-model="newPlaceName"
                  placeholder="장소 이름을 입력해 주세요"
                  @keyup.enter="addUnplannedByName"
                />
                <button type="button" :disabled="!newPlaceName.trim()" @click="addUnplannedByName">
                  <KkIcon name="plus" :size="14" /> 추가
                </button>
              </div>
            </section>
          </main>

          <aside class="summary">
            <div class="summary-mascot">
              <Mascot variant="guide" :size="58" />
              <div>
                <span>WRITING PROGRESS</span>
                <strong>{{ writingProgress }}% 완성</strong>
              </div>
            </div>
            <div class="progress"><span :style="{ width: `${writingProgress}%` }" /></div>
            <div class="journal-stats">
              <div><strong>{{ reviewCount }}</strong><span>기록한 장소</span></div>
              <div><strong>{{ photoCount }}</strong><span>담은 사진</span></div>
            </div>
            <div class="writing-checklist">
              <span :class="{ done: diaryTitle.trim() }"><KkIcon name="check" :size="13" /> 여행 제목</span>
              <span :class="{ done: diaryStory.trim() }"><KkIcon name="check" :size="13" /> 여행 이야기</span>
              <span :class="{ done: reviewCount > 0 }"><KkIcon name="check" :size="13" /> 장소별 장면</span>
            </div>
            <div class="visibility-card">
              <div>
                <strong>{{ isPublic ? 'TripLog에 공개' : '나만 보는 기록' }}</strong>
                <span>{{ isPublic ? '다른 여행자와 이야기를 나눠요.' : '나만 볼 수 있게 안전하게 저장해요.' }}</span>
              </div>
              <Switch v-model="isPublic" aria-label="TripLog 공개 여부" />
            </div>
            <Button
              v-if="visibility === 'private'"
              variant="primary"
              size="lg"
              :full-width="true"
              @click="saveDiary"
            >나만 보기로 저장</Button>
            <Button
              v-else
              variant="primary"
              size="lg"
              :full-width="true"
              @click="publishOpen = true"
            >저장하고 TripLog에 공개</Button>
          </aside>
        </div>
      </template>
    </div>

    <Teleport to="body">
      <div v-if="editingPlace" class="modal-backdrop" @click.self="editingPlace = null">
        <section class="review-modal memory-modal">
          <header>
            <img :src="editingPlace.img" :alt="editingPlace.title">
            <div><span>TRAVEL MEMORY</span><h2>{{ editingPlace.title }}에서의 기억</h2></div>
            <button type="button" aria-label="닫기" @click="editingPlace = null"><KkIcon name="x" :size="20" /></button>
          </header>
          <div class="review-form">
            <div class="writing-guide">
              <KkIcon name="sparkles" :size="18" />
              <p>사진과 함께 이 장소에서 느꼈던 이야기를 편하게 남겨보세요.</p>
            </div>
            <label>사진</label>
            <div class="photos">
              <div v-for="(photo, index) in reviewByPlace[editingPlace.key].photos" :key="index">
                <img :src="photo" alt=""><button type="button" @click="removePhoto(index)">×</button>
              </div>
              <label class="photo-add">
                <KkIcon name="camera" :size="21" /> 사진 추가
                <input type="file" accept="image/*" multiple @change="onPhotoInput">
              </label>
            </div>
            <label for="place-review">그곳에서의 이야기</label>
            <textarea
              id="place-review"
              v-model="reviewByPlace[editingPlace.key].memo"
              rows="8"
              placeholder="그날의 날씨, 함께한 사람, 우연히 생긴 일, 마음에 남은 대화와 감정을 여행 일기처럼 자유롭게 적어보세요."
            />
            <div class="optional-rating">
              <div>
                <strong>이 장소에 대한 만족도</strong>
                <span>원할 때만 남겨도 돼요.</span>
              </div>
              <Rating v-model="reviewByPlace[editingPlace.key].rating" :size="23" />
            </div>
            <Button variant="primary" size="lg" :full-width="true" @click="saveReview">이 추억을 기록에 담기</Button>
          </div>
        </section>
      </div>

      <div v-if="publishOpen" class="modal-backdrop" @click.self="publishOpen = false">
        <section class="publish-modal">
          <Mascot variant="cheer" :size="86" />
          <h2>나의 여행 기록을 TripLog에 공개할까요?</h2>
          <p>여행 전체 이야기와 {{ reviewCount }}개의 장소별 추억이 다른 여행자에게 공개됩니다. 공개 후에도 다시 나만 보기로 바꿀 수 있어요.</p>
          <div>
            <Button variant="ghost" size="lg" @click="publishOpen = false">조금 더 작성하기</Button>
            <Button variant="primary" size="lg" @click="publishTripLog">공개하기</Button>
          </div>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.my-trips{min-height:calc(100vh - 68px);background:var(--bg-base)}.shell{width:min(100%,1190px);margin:0 auto;padding:34px 20px 80px}.trip-header-aside{display:flex;align-items:center;gap:18px}.trip-summary{min-width:108px;padding-right:18px;border-right:1px solid var(--border);text-align:right}.trip-summary strong,.trip-summary span{display:block}.trip-summary strong{font-size:26px;line-height:1;color:var(--text-primary)}.trip-summary span{margin-top:6px;color:var(--text-muted);font-size:12px;font-weight:700}

.trip-stage-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 26px}.trip-stage-button{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:12px;min-height:82px;padding:14px 15px;border:1px solid var(--border-subtle);border-radius:17px;background:#fff;color:var(--text-secondary);text-align:left;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease,background .16s ease}.trip-stage-button:hover{transform:translateY(-2px);border-color:var(--coral-200);box-shadow:var(--shadow-sm)}.trip-stage-button.active{border-color:var(--coral-300);background:linear-gradient(120deg,#fff,var(--coral-50));box-shadow:0 8px 22px rgba(255,107,61,.1)}.trip-stage-button--ongoing.active{border-color:var(--mint-300);background:linear-gradient(120deg,#fff,var(--mint-50));box-shadow:0 8px 22px rgba(6,165,130,.1)}.trip-stage-button--past.active{border-color:var(--gray-300);background:linear-gradient(120deg,#fff,var(--gray-50));box-shadow:var(--shadow-sm)}.trip-stage-icon{display:grid;width:42px;height:42px;place-items:center;border-radius:13px;background:var(--gray-50);color:var(--text-muted)}.trip-stage-button.active .trip-stage-icon{background:var(--coral-500);color:#fff}.trip-stage-button--ongoing.active .trip-stage-icon{background:var(--mint-500)}.trip-stage-button--past.active .trip-stage-icon{background:var(--gray-700)}.trip-stage-copy{min-width:0}.trip-stage-copy strong,.trip-stage-copy small{display:block}.trip-stage-copy strong{color:var(--text-primary);font-size:14px;font-weight:900}.trip-stage-copy small{overflow:hidden;margin-top:4px;color:var(--text-muted);font-size:10.5px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.trip-stage-count{display:grid;min-width:27px;height:27px;padding:0 7px;place-items:center;border-radius:999px;background:var(--gray-100);color:var(--text-secondary);font-size:11px;font-weight:900}.trip-stage-button.active .trip-stage-count{background:#fff;color:var(--coral-700);box-shadow:var(--shadow-xs)}.trip-stage-button--ongoing.active .trip-stage-count{color:var(--mint-700)}

/* ── 목록 컨트롤 ── */
.list-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}.list-header>div:first-child{display:flex;align-items:baseline;gap:9px}.active-stage-title{font-size:16px;font-weight:900}.total-count{color:var(--text-muted);font-size:12px;font-weight:700}.sort-tabs{display:flex;gap:4px;padding:3px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb}.sort-tabs button{height:30px;padding:0 12px;border:0;border-radius:7px;background:transparent;color:var(--text-muted);font-size:12px;font-weight:700;cursor:pointer;transition:.15s}.sort-tabs button.active{background:#fff;color:var(--coral-600);box-shadow:0 1px 3px rgba(15,23,42,.08)}

/* ── 섹션 구분선 ── */
.section-divider{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 0;margin:18px 0 10px}.section-divider::before,.section-divider::after{content:'';flex:1;height:1px;background:#e5e7eb}.section-label{display:flex;align-items:center;gap:5px;padding:0 10px;white-space:nowrap;color:#374151;font-size:13px;font-weight:800}.section-count{min-width:22px;height:22px;border-radius:999px;background:#e5e7eb;color:#6b7280;font-size:11px;font-weight:800;text-align:center;line-height:22px}.ongoing-divider .section-label{color:var(--mint-700)}.ongoing-divider::before,.ongoing-divider::after{background:var(--mint-100)}.past-divider .section-label{color:#9ca3af}.past-divider::before,.past-divider::after{background:#f3f4f6}

/* ── 여행 카드 ── */
.trip-list{display:grid;gap:10px}.trip-card{display:grid;grid-template-columns:1fr auto;overflow:hidden;border:1px solid var(--border-subtle);border-left:4px solid var(--coral-300);border-radius:18px;background:#fff;box-shadow:var(--shadow-sm);cursor:pointer;transition:.16s ease}.trip-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)}.ongoing-card{border-left-color:var(--mint-400);background:linear-gradient(to right,#f0fdf9,#fff 40%)}.past-card{border-left-color:#d1d5db;opacity:.8}.past-card:hover{opacity:1}.trip-card-body{padding:16px 18px}.badges{display:flex;flex-wrap:wrap;gap:6px}.trip-card h2{margin:8px 0 0;font-size:17px}.card-meta{display:flex;gap:14px;margin-top:8px;color:var(--text-muted);font-size:12px;font-weight:700}.card-meta span{display:inline-flex;align-items:center;gap:4px}.card-action{display:flex;align-items:center;gap:5px;padding:16px 18px;color:var(--coral-600);font-size:13px;font-weight:800;white-space:nowrap}

.trip-card{grid-template-columns:156px minmax(0,1fr) auto;border-left-width:1px}.trip-card-status{display:flex;align-items:center;padding:16px;border-right:1px solid var(--border-subtle);background:var(--coral-50);color:var(--coral-700);font-size:12px;font-weight:900}.ongoing-card .trip-card-status{background:var(--mint-50);color:var(--mint-700)}.past-card .trip-card-status{background:var(--gray-50);color:var(--text-secondary)}.past-card{opacity:1}.ongoing-card .card-action{color:var(--mint-700)}.stage-empty{display:grid;min-height:190px;place-items:center;align-content:center;gap:8px;padding:28px;border:1px dashed var(--border);border-radius:18px;background:rgba(255,255,255,.58);text-align:center}.stage-empty-icon{display:grid;width:48px;height:48px;place-items:center;border-radius:15px;background:var(--gray-100);color:var(--text-muted)}.stage-empty strong{font-size:15px}.stage-empty p{color:var(--text-muted);font-size:13px}

/* ── 공통 back / topbar ── */
.back{display:inline-flex;align-items:center;gap:5px;margin-bottom:14px;border:0;background:transparent;color:var(--text-secondary);font-weight:800;cursor:pointer}.editor-topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px}.editor-topbar .back{margin:0}.editor-state{display:inline-flex;align-items:center;gap:7px;padding:7px 11px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;color:#6b7280;font-size:11px;font-weight:700}.autosave-dot{width:7px;height:7px;border-radius:50%;background:#22a06b}

/* ── detail 헤더 (trip-hero) ── */
.trip-hero{position:relative;height:176px;overflow:hidden;border-radius:18px;border:1px solid #e5e7eb;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.05)}.trip-hero>img{position:absolute;right:0;width:40%;height:100%;object-fit:cover}.trip-hero.no-cover{display:flex;align-items:center}.trip-shade{position:absolute;inset:0;background:linear-gradient(90deg,#fff 0%,#fff 54%,rgba(255,255,255,.75) 68%,rgba(255,255,255,0) 88%)}.trip-title{position:absolute;top:50%;right:auto;bottom:auto;left:28px;width:55%;color:#111827;transform:translateY(-50%)}.trip-title span{color:#6b7280;font-size:11px;font-weight:700;letter-spacing:0}.trip-title h1{overflow:hidden;max-width:500px;margin:7px 0;color:#111827;font-size:25px;line-height:1.25;text-overflow:ellipsis;white-space:nowrap}.trip-title p{color:#6b7280;font-size:13px}

.autosave-dot-sm{width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block}

/* ── workspace ── */
.workspace{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:24px;margin-top:24px;align-items:start}.journal-canvas{min-width:0;padding:30px;border:1px solid #e5e7eb;border-radius:18px;background:#fffbf8;box-shadow:0 1px 3px rgba(15,23,42,.04)}.diary-editor{padding:4px 2px 32px;margin:0 0 30px;border:0;border-bottom:1px solid #e5e7eb;border-radius:0;background:transparent;box-shadow:none}.diary-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.diary-heading span{display:inline-flex;align-items:center;gap:6px;color:#374151;font-size:12px;letter-spacing:0}.diary-heading p{max-width:330px;color:#9ca3af;font-size:12px;line-height:1.55;text-align:right}.diary-title-input{width:100%;padding:24px 2px 14px;margin-top:10px;border:0;border-bottom:1px solid #d1d5db;background:transparent;color:var(--text-primary);font-family:var(--font-sans);font-size:30px;font-weight:800;line-height:1.35;outline:none}.diary-title-input::placeholder{color:#b6bbc3}

/* ── 무드 버튼 (이모지 + 컬러) ── */
.mood-row{display:flex;flex-wrap:wrap;gap:7px;margin:18px 0}.mood-row button{padding:8px 14px;border:1.5px solid #e5e7eb;border-radius:999px;background:#fff;color:#4b5563;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;letter-spacing:-.01em}.mood-row button:hover{border-color:var(--coral-300);color:var(--coral-600);background:var(--coral-50)}.mood-row button.active{border-color:transparent;background:linear-gradient(135deg,#f97316,#ec4899);color:#fff;box-shadow:0 4px 12px rgba(249,115,22,.25);transform:translateY(-1px)}

.diary-editor>textarea{width:100%;min-height:260px;padding:20px;border:1px solid #eceff3;border-radius:12px;background:#fff;font:inherit;font-size:16px;line-height:2;resize:vertical;outline:none}.diary-editor>textarea:focus{border-color:#a5b4fc;box-shadow:0 0 0 3px rgba(165,180,252,.15)}.writing-hint{display:flex;align-items:center;gap:6px;margin-top:12px;color:#6b7280;font-size:11px;font-weight:600}.saved-course{padding:18px 20px;margin-bottom:34px;border:1px solid #e5e7eb;border-radius:14px;background:#fafafa}.section-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}.section-title span{color:#6b7280;font-size:11px;font-weight:900;letter-spacing:.1em}.section-title h2{margin-top:3px;font-size:18px}.course-places{display:flex;flex-wrap:wrap;gap:7px}.course-places span{display:inline-flex;align-items:center;gap:4px;padding:7px 10px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;color:var(--text-secondary);font-size:12px;font-weight:700}.memory-section{margin-bottom:26px}.memory-section>header{display:flex;align-items:flex-end;justify-content:space-between;gap:15px;margin-bottom:18px}.memory-section>header span{color:#6b7280;font-size:11px;font-weight:900;letter-spacing:.1em}.memory-section>header h2{margin:4px 0;font-size:20px}.memory-section>header p{color:var(--text-muted);font-size:13px}.memory-card{position:relative;display:grid;grid-template-columns:170px minmax(0,1fr);gap:20px;min-height:180px;margin-bottom:14px;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#fff;transition:border-color .16s,box-shadow .16s}.memory-card:hover{border-color:#cbd5e1;box-shadow:0 4px 14px rgba(15,23,42,.07)}.memory-card.excluded{opacity:.45;filter:grayscale(.5)}.memory-visual{position:relative;min-height:180px;background:#f3f4f6}.memory-visual>img{width:100%;height:100%;min-height:180px;object-fit:cover}.photo-count{position:absolute;right:10px;bottom:10px;display:inline-flex;align-items:center;gap:4px;padding:5px 8px;border-radius:999px;background:rgba(17,24,39,.72);color:#fff;font-size:10px;font-weight:700;backdrop-filter:blur(6px)}.memory-copy{display:flex;min-width:0;flex-direction:column;padding:20px 20px 16px 0}.memory-place-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.memory-place-head span{color:#6b7280;font-size:10px;font-weight:700}.memory-place-head h3{margin-top:5px;font-size:19px}.memory-copy>p{display:-webkit-box;overflow:hidden;margin-top:16px;color:#4b5563;font-size:13px;line-height:1.7;-webkit-box-orient:vertical;-webkit-line-clamp:3;line-clamp:3}.memory-empty-copy{color:#9ca3af!important}.memory-card-actions{display:flex;justify-content:flex-end;gap:7px;margin-top:auto;padding-top:14px}.saved-rating{position:absolute;top:14px;left:14px;display:inline-flex;align-items:center;gap:3px;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.94);color:var(--amber-600);font-size:13px;font-weight:900;box-shadow:0 1px 3px rgba(15,23,42,.1)}.skip-button,.review-button{height:36px;border-radius:10px;padding:0 11px;font-size:12px;font-weight:800;cursor:pointer;white-space:nowrap}.skip-button{border:1px solid var(--border);background:#fff;color:var(--text-muted)}.review-button{display:inline-flex;align-items:center;gap:5px;border:0;background:var(--coral-50);color:var(--coral-700)}.add-place{margin-top:8px;padding:22px;border:1.5px dashed #d1d5db;border-radius:14px;background:#fafafa}.add-place p{margin-top:3px;color:var(--text-secondary);font-size:13px}.add-place-input{display:flex;gap:8px;margin-top:13px}.add-place-input input{flex:1;height:40px;padding:0 12px;border:1px solid var(--mint-200);border-radius:10px;background:#fff;color:var(--text-primary);font:inherit;font-size:13px;outline:none}.add-place-input input:focus{border-color:var(--mint-400);box-shadow:0 0 0 3px rgba(31,191,152,.1)}.add-place-input button{display:inline-flex;align-items:center;gap:5px;height:40px;padding:0 14px;border:0;border-radius:10px;background:var(--mint-500);color:#fff;font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap}.add-place-input button:disabled{background:var(--gray-200);color:var(--gray-400);cursor:default}

/* ── summary 사이드바 ── */
.summary{position:sticky;top:90px;padding:20px;overflow:hidden;border:1px solid #e5e7eb;border-radius:18px;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.05)}.summary-mascot{display:flex;align-items:center;gap:10px;margin:-8px -4px 12px}.summary-mascot>div{min-width:0}.summary-mascot span,.summary-mascot strong{display:block}.summary-mascot span{color:#6b7280;font-size:9px;font-weight:800;letter-spacing:.08em}.summary-mascot strong{margin-top:3px;font-size:17px}.progress{height:8px;overflow:hidden;border-radius:999px;background:var(--gray-100)}.progress span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#f97316,#ec4899,#8b5cf6);transition:width .3s}.journal-stats{display:grid;grid-template-columns:repeat(2,1fr);margin:16px 0;overflow:hidden;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa}.journal-stats div{padding:13px;text-align:center}.journal-stats div+div{border-left:1px solid #e5e7eb}.journal-stats strong,.journal-stats span{display:block}.journal-stats strong{color:#111827;font-size:20px}.journal-stats span{margin-top:2px;color:#9ca3af;font-size:10px}.writing-checklist{display:grid;gap:7px;margin-bottom:16px}.writing-checklist span{display:flex;align-items:center;gap:7px;color:#c1c5cc;font-size:11px;font-weight:700}.writing-checklist span svg{padding:2px;border-radius:50%;background:#f3f4f6}.writing-checklist span.done{color:#16835d}.writing-checklist span.done svg{background:#eaf7f1}.visibility-card{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px;padding:13px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa}.visibility-card strong,.visibility-card span{display:block}.visibility-card strong{font-size:12px}.visibility-card span{margin-top:3px;color:#9ca3af;font-size:10px;line-height:1.45}

/* ── 모달 ── */
.modal-backdrop{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:20px;background:rgba(25,20,16,.55)}.review-modal{width:min(520px,96vw);overflow:hidden;border-radius:24px;background:#fff;box-shadow:var(--shadow-xl)}.review-modal>header{display:flex;align-items:center;gap:13px;padding:16px 18px;border-bottom:1px solid var(--border-subtle)}.review-modal header img{width:58px;height:58px;border-radius:12px;object-fit:cover}.review-modal header div{flex:1}.review-modal header span{color:var(--coral-600);font-size:12px;font-weight:900}.review-modal header h2{margin-top:2px;font-size:20px}.review-modal header button{border:0;background:transparent;color:var(--text-muted);cursor:pointer}.review-form{padding:20px}.review-form>label{display:block;margin:15px 0 8px;font-size:13px;font-weight:800}.review-form textarea{width:100%;padding:12px;resize:vertical;border:1px solid var(--border);border-radius:13px;font:inherit;line-height:1.55;margin-bottom:18px}.photos{display:flex;gap:8px}.photos>div,.photo-add{position:relative;width:82px;height:82px;border-radius:12px;overflow:hidden}.photos img{width:100%;height:100%;object-fit:cover}.photos>div button{position:absolute;top:4px;right:4px;width:22px;height:22px;border:0;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;cursor:pointer}.photo-add{display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:5px;margin:0!important;border:1.5px dashed var(--coral-200);background:var(--coral-50);color:var(--coral-700);font-size:11px!important;cursor:pointer}.photo-add input{display:none}.writing-guide{display:flex;align-items:flex-start;gap:9px;padding:12px 13px;margin-bottom:17px;border-radius:13px;background:linear-gradient(135deg,#f0f0ff,#fef3ff);color:#6d28d9}.writing-guide p{font-size:13px;line-height:1.55}.optional-rating{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:13px 0 17px;border-top:1px solid var(--border-subtle)}.optional-rating strong,.optional-rating span{display:block}.optional-rating strong{font-size:13px}.optional-rating span{margin-top:2px;color:var(--text-muted);font-size:11px}.memory-modal{width:min(680px,96vw)}.publish-modal{width:min(430px,94vw);padding:28px;text-align:center;border-radius:24px;background:#fff;box-shadow:var(--shadow-xl)}.publish-modal h2{margin:6px 0 8px;font-size:22px}.publish-modal p{color:var(--text-secondary);line-height:1.6}.publish-modal>div{display:flex;justify-content:center;gap:9px;margin-top:20px}

/* ── empty & loading ── */
.empty-state{display:flex;flex-direction:column;align-items:center;gap:22px;padding:70px 40px;border-radius:28px;background:linear-gradient(135deg,#fff9f6,#fff 50%,#f0fdf9);border:1px solid #f0e4dd;text-align:center}.empty-copy h3{margin:0 0 8px;font-size:22px;font-weight:00}.empty-copy p{color:var(--text-secondary);font-size:15px;line-height:1.7}.popular-row{display:flex;flex-direction:column;align-items:center;gap:10px}.popular-label{display:inline-flex;align-items:center;gap:5px;color:var(--coral-600);font-size:12px;font-weight:900;letter-spacing:.1em}.popular-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}.popular-chips button{padding:8px 18px;border:1px solid var(--border);border-radius:999px;background:#fff;color:var(--text-secondary);font-size:13px;font-weight:800;cursor:pointer;transition:.15s}.popular-chips button:hover{border-color:var(--coral-300);background:var(--coral-50);color:var(--coral-700)}.plan-more-card{display:flex;align-items:center;gap:16px;padding:20px 24px;margin-top:8px;border:1.5px dashed var(--coral-200);border-radius:22px;background:linear-gradient(110deg,#fff9f6,#fff);cursor:pointer;transition:.16s}.plan-more-card:hover{border-color:var(--coral-400);background:var(--coral-50);transform:translateY(-2px)}.plan-more-copy{flex:1}.plan-more-copy strong{display:block;font-size:16px;font-weight:900}.plan-more-copy p{margin-top:4px;color:var(--text-secondary);font-size:13px}.plan-more-cta{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;color:var(--coral-600);font-size:13px;font-weight:900}.loading-state{display:grid;gap:16px}.loading-card{height:82px;border-radius:18px;background:linear-gradient(90deg,var(--gray-100) 25%,var(--gray-50) 50%,var(--gray-100) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ── 여행 상세 탭 ── */
.detail-tabs{display:flex;margin:20px 0 0;border-bottom:2px solid var(--border-subtle)}.detail-tabs button{display:inline-flex;align-items:center;gap:6px;padding:11px 20px;border:0;border-bottom:2.5px solid transparent;background:transparent;color:var(--text-muted);font-size:14px;font-weight:800;cursor:pointer;margin-bottom:-2px;transition:color .15s,border-color .15s}.detail-tabs button.active{border-bottom-color:var(--coral-500);color:var(--coral-600)}.tab-dot{width:6px;height:6px;border-radius:50%;background:var(--mint-500)}.detail-content{padding:24px 0 8px}.plan-days{display:grid;gap:20px}.plan-day{padding:20px 22px;border:1px solid var(--border-subtle);border-radius:18px;background:#fff}.plan-day-header{display:flex;align-items:center;gap:10px;margin-bottom:16px}.day-badge{padding:5px 11px;border-radius:999px;background:var(--coral-500);color:#fff;font-size:12px;font-weight:900}.day-date{color:var(--text-muted);font-size:13px;font-weight:700}.plan-places{display:grid;gap:0}.plan-place-row{display:flex;align-items:flex-start;gap:14px;padding:10px 0}.place-thumb{width:52px;height:52px;border-radius:12px;object-fit:cover;flex:none}.place-thumb--empty{display:flex;align-items:center;justify-content:center;background:var(--gray-100);color:var(--text-muted)}.place-info{flex:1;min-width:0;padding-top:2px}.place-cat{display:block;color:var(--text-muted);font-size:11px;font-weight:700;margin-bottom:3px;letter-spacing:.04em}.place-info strong{display:block;font-size:15px;font-weight:800}.place-memo{margin-top:4px;color:var(--text-secondary);font-size:12px;line-height:1.5}.place-connector{width:2px;height:14px;margin:0 0 0 25px;background:var(--border-subtle);border-radius:1px}.plan-empty{display:flex;flex-direction:column;align-items:center;gap:12px;padding:48px 20px;text-align:center;color:var(--text-muted)}.plan-empty p{font-size:14px}.record-empty{display:flex;flex-direction:column;align-items:center;gap:20px;padding:52px 20px;text-align:center}.record-empty h3{margin:0 0 6px;font-size:20px;font-weight:800}.record-empty p{color:var(--text-secondary);font-size:14px}.record-exists{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 22px;border:1px solid var(--border-subtle);border-radius:18px;background:#fff}.record-exists-inner{display:flex;align-items:center;gap:13px;flex:1}.record-check{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:var(--mint-50);color:var(--mint-600);flex:none}.record-exists-inner strong,.record-exists-inner span{display:block}.record-exists-inner strong{font-size:15px;font-weight:800}.record-exists-inner span{margin-top:3px;color:var(--text-muted);font-size:12px}.detail-footer{padding:24px 0 0;border-top:1px solid var(--border-subtle);margin-top:16px}

@media(max-width:820px){.trip-stage-nav{grid-template-columns:1fr}.trip-stage-button{min-height:68px}.trip-card{grid-template-columns:128px minmax(0,1fr)}.trip-hero{height:170px}.trip-title{left:24px}.trip-title h1{font-size:23px}.journal-canvas{padding:22px}.diary-heading{align-items:flex-start;flex-direction:column;gap:5px}.diary-heading p{text-align:left}.memory-card{grid-template-columns:120px minmax(0,1fr)}.memory-visual,.memory-visual>img{min-height:190px}.memory-copy{padding:16px 16px 14px 0}.card-action{display:none}.workspace{grid-template-columns:1fr}.summary{position:static}}
@media(max-width:560px){.shell{padding-right:16px;padding-left:16px}.trip-stage-button{grid-template-columns:38px minmax(0,1fr) auto;padding:12px}.trip-stage-icon{width:38px;height:38px}.trip-card{grid-template-columns:1fr}.trip-card-status{padding:10px 16px;border-right:0;border-bottom:1px solid var(--border-subtle)}.card-meta{flex-direction:column;gap:5px}.editor-state{display:none}.trip-hero{height:150px}.trip-hero>img{width:46%;opacity:.55}.trip-shade{background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,.96) 64%,rgba(255,255,255,.3))}.trip-title{right:16px;left:18px;width:auto}.trip-title h1{max-width:70%;font-size:20px}.trip-title p{display:none}.workspace{margin-top:16px}.journal-canvas{padding:18px 14px}.diary-title-input{font-size:24px}.memory-card{grid-template-columns:1fr}.memory-visual,.memory-visual>img{height:190px;min-height:190px}.memory-copy{padding:17px}.memory-card-actions{justify-content:stretch}.memory-card-actions button{flex:1}.photos{flex-wrap:wrap}.detail-tabs button{padding:11px 14px;font-size:13px}.record-exists{flex-direction:column;align-items:flex-start}.sort-tabs button{padding:0 8px;font-size:11px}.list-header{flex-direction:column;align-items:flex-start;gap:8px}}
</style>
