<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { getPlaceDetail, getPlaces, getSidos, getSigungus } from '@/api/place.js'
import ExploreMap from '@/components/domain/ExploreMap.vue'
import KkIcon from '@/components/icons/KkIcon.vue'
import Mascot from '@/components/brand/Mascot.vue'
import PlaceDetailOverlay from '@/components/domain/PlaceDetailOverlay.vue'

import attractionFallback from '@/assets/images/place-attraction.svg'
import foodFallback from '@/assets/images/place-food.svg'
import stayFallback from '@/assets/images/place-stay.svg'
import festivalFallback from '@/assets/images/place-festival.svg'
import defaultFallback from '@/assets/images/place-default.svg'

interface Region {
  code: string
  name: string
}

interface PlaceSummary {
  id: number
  contentTypeId: number
  title: string
  address: string
  ldongRegnNm: string
  ldongSignguNm: string
  mapX: number | null
  mapY: number | null
  firstImage?: string | null
  views: number
  rating: number | null
}

interface PlaceDetail {
  id: number
  title: string
  region: string
  cat: string
  rating: number | null
  reviews: number | null
  meta: string
  desc: string
  img: string
  tags: string[]
  lat: number | null
  lng: number | null
}

const basket = inject<Ref<Set<number>>>('basket', ref(new Set<number>()))
const toggleBasket = inject<(place: Record<string, unknown>) => void>('toggleBasket')
const navigate = inject<(view: string) => void>('navigate')

const query = ref('')
const category = ref('all')
const sortBy = ref('views')
const places = ref<PlaceSummary[]>([])
const sidos = ref<Region[]>([])
const sigungus = ref<Region[]>([])
const selectedSido = ref<Region | null>(null)
const selectedSigungu = ref<Region | null>(null)
const selectedPlaceId = ref<number | null>(null)
const selectedPlace = ref<PlaceDetail | null>(null)
const isLoading = ref(false)
const isDetailLoading = ref(false)
const hasMore = ref(false)
const currentPage = ref(0)
const errorMessage = ref('')
let requestSequence = 0

const categories = [
  { value: 'all', label: '전체', icon: 'compass', contentTypeId: null },
  { value: 'spot', label: '관광지', icon: 'mountain', contentTypeId: 12 },
  { value: 'food', label: '맛집', icon: 'utensils', contentTypeId: 39 },
  { value: 'stay', label: '숙소', icon: 'bed', contentTypeId: 32 },
  { value: 'fest', label: '축제', icon: 'sparkles', contentTypeId: 15 },
]

const popularRegions = ['서울', '부산', '강원특별자치도', '경상북도', '전북특별자치도', '제주특별자치도']

function normalizeRegionName(name = '') {
  return name
    .replace(/특별자치도|특별자치시|특별시|광역시|자치도|도$/g, '')
    .trim()
}

function shortRegionName(name: string) {
  return normalizeRegionName(name)
}

const regionCenters: Record<string, { lat: number; lng: number; level: number }> = {
  서울: { lat: 37.5665, lng: 126.978, level: 8 },
  부산: { lat: 35.1796, lng: 129.0756, level: 9 },
  인천: { lat: 37.4563, lng: 126.7052, level: 9 },
  대구: { lat: 35.8714, lng: 128.6014, level: 9 },
  대전: { lat: 36.3504, lng: 127.3845, level: 9 },
  광주: { lat: 35.1595, lng: 126.8526, level: 9 },
  울산: { lat: 35.5384, lng: 129.3114, level: 9 },
  세종: { lat: 36.4801, lng: 127.289, level: 9 },
  경기도: { lat: 37.4138, lng: 127.5183, level: 11 },
  강원특별자치도: { lat: 37.8228, lng: 128.1555, level: 11 },
  충청북도: { lat: 36.8, lng: 127.7, level: 11 },
  충청남도: { lat: 36.5184, lng: 126.8, level: 11 },
  전북특별자치도: { lat: 35.7175, lng: 127.153, level: 11 },
  전라남도: { lat: 34.8679, lng: 126.991, level: 11 },
  경상북도: { lat: 36.4919, lng: 128.8889, level: 11 },
  경상남도: { lat: 35.4606, lng: 128.2132, level: 11 },
  제주특별자치도: { lat: 33.489, lng: 126.4983, level: 10 },
}

const contentTypeId = computed(
  () => categories.find((item) => item.value === category.value)?.contentTypeId ?? null,
)

const selectedRegionLabel = computed(() => {
  if (selectedSigungu.value) return `${selectedSido.value?.name} ${selectedSigungu.value.name}`
  if (selectedSido.value) return selectedSido.value.name
  return '대한민국 전체'
})

const mapFocus = computed(() => {
  if (!selectedSido.value) return null
  const exact = regionCenters[selectedSido.value.name]
  if (exact) return exact
  const normalizedName = normalizeRegionName(selectedSido.value.name)
  const centerKey = Object.keys(regionCenters).find(
    (name) => normalizeRegionName(name) === normalizedName,
  )
  return centerKey ? regionCenters[centerKey] : null
})

function categoryLabel(typeId: number) {
  if (typeId === 39) return '음식점'
  if (typeId === 32) return '숙박'
  if (typeId === 15) return '축제'
  return '관광지'
}

function fallbackImage(typeId: number) {
  if (typeId === 39) return foodFallback
  if (typeId === 32) return stayFallback
  if (typeId === 15) return festivalFallback
  if (typeId === 12) return attractionFallback
  return defaultFallback
}

function imageFor(place: PlaceSummary) {
  return place.firstImage?.startsWith('http') ? place.firstImage : fallbackImage(place.contentTypeId)
}

const mappedPlaces = computed(() =>
  places.value.map((place) => ({
    ...place,
    cat: categoryLabel(place.contentTypeId),
    region: [place.ldongRegnNm, place.ldongSignguNm].filter(Boolean).join(' '),
    img: imageFor(place),
    lat: place.mapY ? Number(place.mapY) : null,
    lng: place.mapX ? Number(place.mapX) : null,
  })),
)

const selectedSummary = computed(
  () => mappedPlaces.value.find((place) => place.id === selectedPlaceId.value) ?? null,
)

async function fetchPlaces(reset = true) {
  const requestId = ++requestSequence
  if (reset) {
    currentPage.value = 0
    places.value = []
  }

  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await getPlaces({
      keyword: query.value.trim() || null,
      ldongRegnCd: selectedSido.value?.code || null,
      ldongSignguCd: selectedSigungu.value?.code || null,
      contentTypeId: contentTypeId.value,
      sortBy: sortBy.value,
      page: currentPage.value,
      size: 12,
    })
    const nextPlaces = response?.content ?? []
    if (requestId === requestSequence) {
      places.value = reset ? nextPlaces : [...places.value, ...nextPlaces]
      currentPage.value += 1
      hasMore.value = !response?.last
      if (reset) selectedPlaceId.value = null
    }
  } catch (error) {
    console.error('Failed to fetch places:', error)
    if (requestId === requestSequence) {
      errorMessage.value = '여행지 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
      hasMore.value = false
    }
  } finally {
    if (requestId === requestSequence) isLoading.value = false
  }
}

async function selectSido(region: Region | null) {
  selectedSido.value = region
  selectedSigungu.value = null
  sigungus.value = []
  if (region) {
    try {
      sigungus.value = await getSigungus(region.code)
    } catch (error) {
      console.error('Failed to fetch sigungus:', error)
    }
  }
  await fetchPlaces()
}

async function selectPopularRegion(name: string) {
  const normalizedName = normalizeRegionName(name)
  const region = sidos.value.find(
    (item) => normalizeRegionName(item.name) === normalizedName,
  )
  if (region) await selectSido(region)
}

async function selectSigungu(region: Region | null) {
  selectedSigungu.value = region
  await fetchPlaces()
}

function selectMapPlace(id: number) {
  selectedPlaceId.value = id
  document.querySelector(`[data-place-id="${id}"]`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  })
}

async function openPlace(place: (typeof mappedPlaces.value)[number]) {
  if (isDetailLoading.value) return
  selectedPlaceId.value = place.id
  isDetailLoading.value = true
  try {
    const detail = await getPlaceDetail(place.id)
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

function toggleSave(place: (typeof mappedPlaces.value)[number]) {
  toggleBasket?.({
    id: place.id,
    title: place.title,
    region: place.region,
    img: place.img,
    cat: place.cat,
  })
}

watch([category, sortBy], () => fetchPlaces())

onMounted(async () => {
  try {
    sidos.value = await getSidos()
  } catch (error) {
    console.error('Failed to load regions:', error)
  }
  await fetchPlaces()
})
</script>

<template>
  <section class="explore-page">
    <div class="explore-shell">
      <aside class="map-column">
        <header class="discovery-hero">
          <div class="hero-content">
            <div class="hero-copy">
              <span class="eyebrow">오늘은 어디로 콕?</span>
              <h1>가고 싶은 곳을<br />지도에서 먼저 찾아보세요.</h1>
              <p>여행지를 검색하거나 지도를 둘러보며 다음 목적지를 발견해 보세요.</p>
            </div>
            <div class="mascot-stage">
              <span class="mascot-bubble">제가 같이 찾아드릴게요!</span>
              <Mascot variant="guide" :size="116" class="hero-mascot" />
            </div>
          </div>

          <form class="search-box" @submit.prevent="fetchPlaces()">
            <KkIcon name="search" :size="20" />
            <input v-model="query" placeholder="지역, 관광지, 맛집을 검색해 보세요" />
            <button type="submit" aria-label="검색">
              <KkIcon name="arrowR" :size="19" />
            </button>
          </form>
        </header>

        <div class="map-panel">
          <ExploreMap
            :places="mappedPlaces"
            :selected-id="selectedPlaceId"
            :focus="mapFocus"
            @select="selectMapPlace"
          />

          <div class="map-topbar">
            <div>
              <span class="map-kicker">현재 보고 있는 지역</span>
              <strong>{{ selectedRegionLabel }}</strong>
            </div>
            <span class="result-count">{{ mappedPlaces.length }}곳</span>
          </div>

          <div class="map-tip">
            <KkIcon name="pin" :size="16" />
            마커를 누르면 오른쪽 카드가 선택돼요
          </div>
        </div>
      </aside>

      <main class="discovery-panel">
        <section class="region-section filter-card">
          <div class="section-heading">
            <div>
              <span>여행지 필터</span>
              <h2>원하는 여행지를 좁혀보세요</h2>
            </div>
            <button v-if="selectedSido" type="button" class="reset-button" @click="selectSido(null)">
              전국 보기
            </button>
          </div>

          <div class="filter-categories" aria-label="여행지 카테고리">
            <button
              v-for="item in categories"
              :key="item.value"
              type="button"
              :class="{ active: category === item.value }"
              @click="category = item.value"
            >
              <KkIcon :name="item.icon" :size="16" />
              {{ item.label }}
            </button>
          </div>

          <div class="region-chips">
            <button
              v-for="name in popularRegions"
              :key="name"
              type="button"
              :class="{ active: normalizeRegionName(selectedSido?.name) === normalizeRegionName(name) }"
              @click="selectPopularRegion(name)"
            >
              {{ shortRegionName(name) }}
            </button>
          </div>

          <div class="region-selectors">
            <label>
              <span>시·도</span>
              <div class="select-control">
                <select
                  :value="selectedSido?.code || ''"
                  @change="selectSido(sidos.find((item) => item.code === ($event.target as HTMLSelectElement).value) || null)"
                >
                  <option value="">전국</option>
                  <option v-for="region in sidos" :key="region.code" :value="region.code">
                    {{ region.name }}
                  </option>
                </select>
                <KkIcon name="chevronD" :size="16" />
              </div>
            </label>
            <label>
              <span>시·군·구</span>
              <div class="select-control" :class="{ disabled: !selectedSido }">
                <select
                  :value="selectedSigungu?.code || ''"
                  :disabled="!selectedSido"
                  @change="selectSigungu(sigungus.find((item) => item.code === ($event.target as HTMLSelectElement).value) || null)"
                >
                  <option value="">전체</option>
                  <option v-for="region in sigungus" :key="region.code" :value="region.code">
                    {{ region.name }}
                  </option>
                </select>
                <KkIcon name="chevronD" :size="16" />
              </div>
            </label>
          </div>
        </section>

        <section class="places-section">
          <div class="section-heading place-heading">
            <div>
              <span>{{ selectedRegionLabel }} 추천</span>
              <h2>지금 눈여겨볼 여행지</h2>
            </div>
            <div class="sort-control">
              <button :class="{ active: sortBy === 'views' }" @click="sortBy = 'views'">인기순</button>
              <button :class="{ active: sortBy === 'rating' }" @click="sortBy = 'rating'">평점순</button>
            </div>
          </div>

          <div v-if="isLoading && mappedPlaces.length === 0" class="status-card">
            <Mascot :size="58" />
            <p>여행지를 지도에 콕 찍고 있어요.</p>
          </div>

          <div v-else-if="errorMessage" class="status-card">
            <KkIcon name="map" :size="28" />
            <p>{{ errorMessage }}</p>
            <button type="button" @click="fetchPlaces()">다시 불러오기</button>
          </div>

          <div v-else-if="mappedPlaces.length === 0" class="status-card">
            <Mascot variant="wink" :size="64" />
            <p>조건에 맞는 여행지가 없어요. 지역이나 카테고리를 바꿔보세요.</p>
          </div>

          <div v-else class="place-list">
            <article
              v-for="place in mappedPlaces"
              :key="place.id"
              :data-place-id="place.id"
              class="place-row"
              :class="{ selected: selectedPlaceId === place.id }"
              tabindex="0"
              @click="openPlace(place)"
              @focus="selectedPlaceId = place.id"
              @keyup.enter="openPlace(place)"
            >
              <img :src="place.img" :alt="place.title" />
              <div class="place-copy">
                <div class="place-meta">
                  <span :class="`category category-${place.contentTypeId}`">{{ place.cat }}</span>
                  <span v-if="place.rating" class="rating">
                    <KkIcon name="star" :size="13" />
                    {{ place.rating.toFixed(1) }}
                  </span>
                </div>
                <h3>{{ place.title }}</h3>
                <p><KkIcon name="pin" :size="14" /> {{ place.region }}</p>
                <small>조회 {{ place.views?.toLocaleString() || 0 }}</small>
              </div>
              <button
                type="button"
                class="save-button"
                :class="{ saved: basket.has(place.id) }"
                :aria-label="basket.has(place.id) ? '여행 바구니에서 빼기' : '여행 바구니에 담기'"
                @click.stop="toggleSave(place)"
              >
                <KkIcon name="bookmark" :size="18" />
              </button>
            </article>
          </div>

          <button
            v-if="hasMore && !isLoading"
            type="button"
            class="more-button"
            @click="fetchPlaces(false)"
          >
            여행지 더 보기
            <KkIcon name="chevronD" :size="16" />
          </button>
        </section>

        <aside v-if="selectedSummary" class="selected-cta">
          <div>
            <span>지도에서 선택한 곳</span>
            <strong>{{ selectedSummary.title }}</strong>
          </div>
          <button type="button" @click="openPlace(selectedSummary)">자세히 보기</button>
          <button type="button" class="planner-link" @click="navigate?.('planner')">
            코스 만들기
          </button>
        </aside>
      </main>
    </div>
  </section>

  <PlaceDetailOverlay
    :place="selectedPlace"
    :saved="selectedPlace ? basket.has(selectedPlace.id) : false"
    @close="selectedPlace = null"
    @toggle-save="selectedSummary && toggleSave(selectedSummary)"
  />
</template>

<style scoped>
.explore-page {
  min-height: calc(100vh - 68px);
  background: #f7f5f0;
}

.explore-shell {
  display: grid;
  grid-template-columns: minmax(520px, 1.08fr) minmax(500px, 0.92fr);
  width: min(1500px, 100%);
  min-height: calc(100vh - 68px);
  margin: 0 auto;
}

.map-column {
  position: sticky;
  top: 68px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 68px);
  min-height: 680px;
  padding: 24px 30px;
  border-right: 1px solid var(--border);
  background: #f7f5f0;
}

.map-panel {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 24px;
  background: #e9f0e9;
  box-shadow: var(--shadow-sm);
}

.map-panel::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  box-shadow: inset -18px 0 28px rgba(50, 59, 51, 0.06);
  content: '';
}

.map-topbar,
.map-tip {
  position: absolute;
  z-index: 3;
}

.map-topbar {
  top: 22px;
  right: 22px;
  left: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 15px;
  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(12px);
}

.map-topbar div {
  display: grid;
  gap: 2px;
}

.map-kicker {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 800;
}

.map-topbar strong {
  font-size: 16px;
}

.result-count {
  padding: 6px 9px;
  border-radius: 999px;
  background: var(--coral-50);
  color: var(--coral-700);
  font-size: 12px;
  font-weight: 900;
}

.filter-categories {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.filter-categories button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 39px;
  padding: 0 13px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
}

.filter-categories button.active {
  border-color: var(--coral-500);
  background: var(--coral-500);
  color: #fff;
  box-shadow: 0 5px 14px rgba(255, 107, 61, 0.2);
}

.map-tip {
  bottom: 22px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 13px;
  border-radius: 999px;
  background: rgba(38, 43, 38, 0.84);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  transform: translateX(-50%);
  white-space: nowrap;
  backdrop-filter: blur(8px);
}

.discovery-panel {
  position: relative;
  min-width: 0;
  padding: 24px 30px 120px;
  background: #fffdfb;
}

.discovery-hero {
  position: relative;
  overflow: hidden;
  flex: none;
  width: 100%;
  padding: 22px;
  border: 1px solid var(--border-subtle);
  border-radius: 22px;
  background:
    radial-gradient(circle at 88% 28%, rgba(255, 199, 176, 0.42), transparent 28%),
    #fff;
  box-shadow: var(--shadow-sm);
}

.discovery-hero::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--coral-500), var(--amber-300), var(--mint-300));
  content: '';
}

.hero-content {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 152px;
  gap: 14px;
  align-items: center;
}

.hero-copy {
  min-width: 0;
}

.eyebrow,
.section-heading span {
  color: var(--coral-600);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.discovery-hero h1 {
  margin-top: 7px;
  font-size: clamp(25px, 2.4vw, 34px);
  font-weight: 900;
  line-height: 1.15;
}

.discovery-hero p {
  max-width: 440px;
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.65;
}

.mascot-stage {
  position: relative;
  display: grid;
  min-height: 128px;
  place-items: end center;
}

.mascot-bubble {
  position: absolute;
  top: 0;
  right: 0;
  padding: 7px 10px;
  border: 1px solid var(--coral-100);
  border-radius: 12px 12px 4px 12px;
  background: var(--coral-50);
  color: var(--coral-700);
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}

.hero-mascot {
  margin-bottom: -22px;
  filter: drop-shadow(0 9px 10px rgba(105, 59, 38, 0.12));
  transform: rotate(3deg);
}

.search-box {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 50px;
  margin-top: 18px;
  padding: 5px 5px 5px 17px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--gray-50);
  box-shadow: none;
  color: var(--text-muted);
}

.search-box input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  color: var(--text-primary);
  font: inherit;
}

.search-box button {
  display: grid;
  width: 43px;
  height: 43px;
  place-items: center;
  border: 0;
  border-radius: 13px;
  background: var(--coral-500);
  color: #fff;
  cursor: pointer;
}

.region-section,
.places-section {
  margin-top: 30px;
}

.filter-card {
  margin-top: 0;
  padding: 22px;
  border: 1px solid var(--border-subtle);
  border-radius: 22px;
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 15px;
}

.section-heading h2 {
  margin-top: 3px;
  font-size: 20px;
  font-weight: 900;
}

.reset-button {
  border: 0;
  background: transparent;
  color: var(--coral-600);
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
}

.region-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.region-chips button {
  flex: none;
  padding: 9px 13px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 750;
}

.region-chips button.active {
  border-color: var(--coral-300);
  background: var(--coral-50);
  color: var(--coral-700);
}

.region-selectors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
}

.region-selectors label {
  display: grid;
  gap: 7px;
  padding: 0;
  background: transparent;
}

.region-selectors label span {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 800;
}

.select-control {
  position: relative;
  display: flex;
  align-items: center;
  height: 45px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--gray-50);
  color: var(--text-muted);
  transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;
}

.select-control:focus-within {
  border-color: var(--coral-400);
  background: #fff;
  box-shadow: 0 0 0 3px var(--coral-50);
}

.select-control.disabled {
  opacity: 0.55;
}

.select-control select {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  padding: 0 38px 0 13px;
  appearance: none;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.select-control select:disabled {
  cursor: not-allowed;
}

.select-control > :last-child {
  position: absolute;
  right: 12px;
  pointer-events: none;
}

.place-heading {
  align-items: center;
}

.sort-control {
  display: flex;
  padding: 3px;
  border-radius: 10px;
  background: var(--gray-100);
}

.sort-control button {
  padding: 6px 9px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 11px;
  font-weight: 800;
}

.sort-control button.active {
  background: #fff;
  box-shadow: var(--shadow-xs);
  color: var(--text-primary);
}

.place-list {
  display: grid;
  gap: 10px;
}

.place-row {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr) 40px;
  gap: 14px;
  align-items: center;
  padding: 11px;
  border: 1px solid var(--border-subtle);
  border-radius: 17px;
  background: #fff;
  cursor: pointer;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.place-row:hover,
.place-row.selected {
  border-color: var(--coral-200);
  box-shadow: 0 8px 22px rgba(72, 50, 39, 0.09);
  transform: translateY(-1px);
}

.place-row.selected {
  background: linear-gradient(90deg, #fff8f4, #fff);
}

.place-row > img {
  width: 104px;
  height: 88px;
  border-radius: 13px;
  object-fit: cover;
  background: var(--gray-100);
}

.place-copy {
  min-width: 0;
}

.place-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category {
  color: var(--coral-600);
  font-size: 11px;
  font-weight: 900;
}

.category-39 { color: var(--amber-600); }
.category-32 { color: var(--sky-600); }
.category-15 { color: var(--mint-600); }

.rating {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--amber-600);
  font-size: 11px;
  font-weight: 900;
}

.place-copy h3 {
  overflow: hidden;
  margin-top: 4px;
  font-size: 16px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.place-copy p {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.place-copy small {
  display: block;
  margin-top: 4px;
  color: var(--gray-400);
  font-size: 10px;
}

.save-button {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  color: var(--text-muted);
  cursor: pointer;
}

.save-button.saved {
  border-color: var(--coral-500);
  background: var(--coral-500);
  color: #fff;
}

.more-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
}

.status-card {
  display: grid;
  min-height: 180px;
  place-items: center;
  align-content: center;
  gap: 8px;
  padding: 24px;
  border: 1px dashed var(--border);
  border-radius: 18px;
  color: var(--text-muted);
  text-align: center;
}

.status-card button {
  padding: 8px 12px;
  border: 0;
  border-radius: 10px;
  background: var(--coral-500);
  color: #fff;
  cursor: pointer;
  font-weight: 800;
}

.selected-cta {
  position: fixed;
  right: max(24px, calc((100vw - 1500px) / 2 + 24px));
  bottom: 22px;
  z-index: 12;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 9px;
  align-items: center;
  width: min(570px, calc(44vw - 36px));
  padding: 11px 12px 11px 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 17px;
  background: rgba(36, 31, 27, 0.92);
  box-shadow: var(--shadow-xl);
  color: #fff;
  backdrop-filter: blur(14px);
}

.selected-cta div {
  min-width: 0;
}

.selected-cta span,
.selected-cta strong {
  display: block;
}

.selected-cta span {
  color: rgba(255, 255, 255, 0.62);
  font-size: 10px;
  font-weight: 700;
}

.selected-cta strong {
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-cta button {
  padding: 9px 11px;
  border: 0;
  border-radius: 10px;
  background: var(--coral-500);
  color: #fff;
  cursor: pointer;
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
}

.selected-cta .planner-link {
  background: rgba(255, 255, 255, 0.12);
}

@media (max-width: 1050px) {
  .explore-shell {
    grid-template-columns: 1fr;
  }

  .map-column {
    position: relative;
    top: 0;
    height: auto;
    min-height: 0;
    padding: 20px;
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }

  .map-panel {
    height: 52vh;
    min-height: 480px;
    flex: none;
  }

  .selected-cta {
    right: 20px;
    left: 20px;
    width: auto;
  }
}

@media (max-width: 640px) {
  .map-column {
    gap: 12px;
    padding: 14px;
  }

  .map-panel {
    height: 46vh;
    min-height: 420px;
  }

  .filter-categories {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 3px;
    scrollbar-width: none;
  }

  .map-topbar {
    right: 14px;
    left: 14px;
  }

  .discovery-panel {
    padding: 18px 16px 120px;
  }

  .discovery-hero {
    padding: 22px 18px;
  }

  .hero-mascot {
    margin-bottom: -18px;
  }

  .hero-content {
    grid-template-columns: minmax(0, 1fr) 120px;
  }

  .mascot-bubble {
    display: none;
  }

  .region-selectors {
    grid-template-columns: 1fr;
  }

  .place-row {
    grid-template-columns: 86px minmax(0, 1fr) 36px;
    gap: 10px;
  }

  .place-row > img {
    width: 86px;
    height: 78px;
  }

  .selected-cta {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .selected-cta .planner-link {
    display: none;
  }
}
</style>
