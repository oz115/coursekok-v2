<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { getPlaceDetail, getPlaces, getSidos, getSigungus } from '@/api/place.js'
import ExploreMap from '@/components/domain/ExploreMap.vue'
import KkIcon from '@/components/icons/KkIcon.vue'
import Mascot from '@/components/brand/Mascot.vue'
import PlaceDetailPanel from '@/components/domain/PlaceDetailPanel.vue'

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

interface MapViewport {
  level: number
  minLng: number
  maxLng: number
  minLat: number
  maxLat: number
}

interface SavedPlace {
  id: number
  title: string
  region: string
  cat: string
  img: string
  contentTypeId?: number
  lat?: number | null
  lng?: number | null
  views?: number
  rating?: number | null
}

const basket = inject<Ref<Set<number>>>('basket', ref(new Set<number>()))
const basketPlaces = inject<Ref<SavedPlace[]>>('basketPlaces', ref([]))
const toggleBasket = inject<(place: Record<string, unknown>) => void>('toggleBasket')

const query = ref('')
const category = ref('all')
const sortBy = ref('views')
const places = ref<PlaceSummary[]>([])
const viewportPlaces = ref<PlaceSummary[]>([])
const sidos = ref<Region[]>([])
const sigungus = ref<Region[]>([])
const selectedSido = ref<Region | null>(null)
const selectedSigungu = ref<Region | null>(null)
const selectedPlaceId = ref<number | null>(null)
const selectedFromMap = ref(false)
const detailOpenedFromMap = ref(false)
const mapFocusTarget = ref<{
  id: number
  lat: number
  lng: number
  token: number
} | null>(null)
const selectedPlace = ref<PlaceDetail | null>(null)
const isLoading = ref(false)
const isMapLoading = ref(false)
const isDetailLoading = ref(false)
const hasMore = ref(false)
const currentPage = ref(0)
const errorMessage = ref('')
const isRegionPickerOpen = ref(false)
const regionPickerEl = ref<HTMLElement | null>(null)
const isViewportMode = ref(false)
const hasMapInteraction = ref(false)
const viewportTotal = ref(0)
const lastViewport = ref<MapViewport | null>(null)
let requestSequence = 0
let mapRequestSequence = 0
let mapFocusSequence = 0

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

function mapPlace(place: PlaceSummary) {
  return {
    ...place,
    cat: categoryLabel(place.contentTypeId),
    region: [place.ldongRegnNm, place.ldongSignguNm].filter(Boolean).join(' '),
    img: imageFor(place),
    lat: place.mapY ? Number(place.mapY) : null,
    lng: place.mapX ? Number(place.mapX) : null,
  }
}

const mappedPlaces = computed(() => places.value.map(mapPlace))
const mappedViewportPlaces = computed(() => viewportPlaces.value.map(mapPlace))
const savedPlaceIds = computed(() => Array.from(basket.value))
const mappedSavedPlaces = computed(() =>
  basketPlaces.value
    .filter((place) => place.lat && place.lng)
    .map((place) => ({
      ...place,
      contentTypeId: place.contentTypeId ?? 12,
      address: '',
      ldongRegnNm: '',
      ldongSignguNm: '',
      mapX: place.lng ?? null,
      mapY: place.lat ?? null,
      firstImage: place.img,
      views: place.views ?? 0,
      rating: place.rating ?? null,
      lat: place.lat ?? null,
      lng: place.lng ?? null,
    })),
)
const mapSelectedPlace = ref<ReturnType<typeof mapPlace> | null>(null)
const selectedSummary = computed(
  () =>
    mappedPlaces.value.find((place) => place.id === selectedPlaceId.value) ??
    mappedViewportPlaces.value.find((place) => place.id === selectedPlaceId.value) ??
    (mapSelectedPlace.value?.id === selectedPlaceId.value ? mapSelectedPlace.value : null),
)
const mapDisplayPlaces = computed(() => {
  const basePlaces = isViewportMode.value ? mappedViewportPlaces.value : mappedPlaces.value
  const persistentPlace =
    mappedPlaces.value.find((place) => place.id === selectedPlaceId.value) ??
    (mapSelectedPlace.value?.id === selectedPlaceId.value ? mapSelectedPlace.value : null)
  const combined = [...basePlaces]

  mappedSavedPlaces.value.forEach((place) => {
    if (!combined.some((item) => item.id === place.id)) combined.push(place)
  })

  if (persistentPlace && !combined.some((place) => place.id === persistentPlace.id)) {
    combined.push(persistentPlace)
  }

  return combined
})

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
      if (reset) {
        selectedPlaceId.value = null
        selectedFromMap.value = false
        detailOpenedFromMap.value = false
        mapFocusTarget.value = null
        mapSelectedPlace.value = null
        selectedPlace.value = null
      }
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

async function fetchViewportPlaces(viewport: MapViewport) {
  lastViewport.value = viewport

  if (viewport.level > 8) {
    isViewportMode.value = false
    viewportPlaces.value = []
    viewportTotal.value = 0
    return
  }

  const requestId = ++mapRequestSequence
  isViewportMode.value = true
  isMapLoading.value = true
  try {
    const response = await getPlaces({
      keyword: query.value.trim() || null,
      ldongRegnCd: selectedSido.value?.code || null,
      ldongSignguCd: selectedSigungu.value?.code || null,
      contentTypeId: contentTypeId.value,
      sortBy: sortBy.value,
      minLng: viewport.minLng,
      maxLng: viewport.maxLng,
      minLat: viewport.minLat,
      maxLat: viewport.maxLat,
      page: 0,
      size: 40,
    })
    if (requestId === mapRequestSequence) {
      viewportPlaces.value = response?.content ?? []
      viewportTotal.value = response?.totalElements ?? viewportPlaces.value.length
    }
  } catch (error) {
    console.error('Failed to load places in map viewport:', error)
  } finally {
    if (requestId === mapRequestSequence) isMapLoading.value = false
  }
}

async function handleMapViewport(viewport: MapViewport) {
  hasMapInteraction.value = true
  await fetchViewportPlaces(viewport)
}

function resetViewportMode() {
  isViewportMode.value = false
  viewportPlaces.value = []
  viewportTotal.value = 0
  lastViewport.value = null
}

async function submitSearch() {
  await fetchPlaces()
  if (isViewportMode.value && lastViewport.value) {
    await fetchViewportPlaces(lastViewport.value)
  }
}

async function selectSido(region: Region | null) {
  resetViewportMode()
  hasMapInteraction.value = false
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

async function chooseSido(region: Region | null) {
  await selectSido(region)
  if (!region) isRegionPickerOpen.value = false
}

async function selectPopularRegion(name: string) {
  const normalizedName = normalizeRegionName(name)
  const region = sidos.value.find(
    (item) => normalizeRegionName(item.name) === normalizedName,
  )
  if (region) await selectSido(region)
}

async function selectSigungu(region: Region | null) {
  resetViewportMode()
  hasMapInteraction.value = false
  selectedSigungu.value = region
  await fetchPlaces()
}

async function chooseSigungu(region: Region | null) {
  await selectSigungu(region)
  isRegionPickerOpen.value = false
}

function closeRegionPicker(event: MouseEvent) {
  if (!regionPickerEl.value?.contains(event.target as Node)) {
    isRegionPickerOpen.value = false
  }
}

function selectMapPlace(id: number) {
  const place =
    mappedViewportPlaces.value.find((item) => item.id === id) ??
    mappedPlaces.value.find((item) => item.id === id)

  if (!place) return

  if (selectedFromMap.value && selectedPlaceId.value === id) {
    void openPlace(place, false)
    return
  }

  selectedPlaceId.value = id
  selectedFromMap.value = true
  mapSelectedPlace.value = place
  selectedPlace.value = null
}

async function openPlace(place: (typeof mappedPlaces.value)[number], moveMap = true) {
  if (isDetailLoading.value) return
  selectedPlaceId.value = place.id
  selectedFromMap.value = false
  detailOpenedFromMap.value = !moveMap
  mapSelectedPlace.value = place
  if (moveMap && place.lat && place.lng) {
    mapFocusTarget.value = {
      id: place.id,
      lat: place.lat,
      lng: place.lng,
      token: ++mapFocusSequence,
    }
  }
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
    firstImage: place.firstImage,
    cat: place.cat,
    contentTypeId: place.contentTypeId,
    lat: place.lat,
    lng: place.lng,
    views: place.views,
    rating: place.rating,
  })
}

function closePlaceDetail() {
  selectedPlace.value = null
  selectedFromMap.value = detailOpenedFromMap.value
}

watch([category, sortBy], async () => {
  await fetchPlaces()
  if (isViewportMode.value && lastViewport.value) {
    await fetchViewportPlaces(lastViewport.value)
  }
})

onMounted(async () => {
  window.addEventListener('click', closeRegionPicker)
  try {
    sidos.value = await getSidos()
  } catch (error) {
    console.error('Failed to load regions:', error)
  }
  await fetchPlaces()
})

onUnmounted(() => {
  window.removeEventListener('click', closeRegionPicker)
})
</script>

<template>
  <section class="explore-page">
    <div class="explore-shell">
      <aside class="map-column">
        <header class="discovery-hero">
          <div class="hero-content">
            <div class="hero-copy">
              <span class="eyebrow"><KkIcon name="sparkles" :size="14" /> 장소를 콕콕!</span>
              <h1>오늘은 어디로<br />떠나볼까요?</h1>
              <p>지도에서 지역을 둘러보고 마음에 드는 장소를 골라보세요.</p>
            </div>
            <div class="mascot-stage" aria-hidden="true">
              <span class="mascot-orbit mascot-orbit-one" />
              <span class="mascot-orbit mascot-orbit-two" />
              <Mascot variant="default" :size="108" class="hero-mascot" />
            </div>
          </div>

          <form class="search-box" @submit.prevent="submitSearch">
            <KkIcon name="search" :size="20" />
            <input v-model="query" placeholder="지역, 관광지, 맛집을 검색해 보세요" />
            <button type="submit" aria-label="검색">
              <KkIcon name="arrowR" :size="19" />
            </button>
          </form>
        </header>

        <div class="map-panel">
          <ExploreMap
            :places="mapDisplayPlaces"
            :selected-id="selectedPlaceId"
            :saved-ids="savedPlaceIds"
            :focus="hasMapInteraction ? null : mapFocus"
            :focus-target="mapFocusTarget"
            :auto-fit="!hasMapInteraction"
            :compact-markers="isViewportMode"
            @select="selectMapPlace"
            @viewport-changed="handleMapViewport"
          />

          <div class="map-topbar">
            <div>
              <span class="map-kicker">
                {{ isViewportMode ? '확대해서 찾은 장소' : '현재 보고 있는 지역' }}
              </span>
              <strong>{{ isViewportMode ? '현재 지도 영역' : selectedRegionLabel }}</strong>
            </div>
            <span class="result-count">
              {{
                isMapLoading
                  ? '찾는 중'
                  : isViewportMode && viewportTotal > mapDisplayPlaces.length
                    ? `${mapDisplayPlaces.length}+곳`
                    : `${mapDisplayPlaces.length}곳`
              }}
            </span>
          </div>

          <div class="map-tip">
            <KkIcon :name="isViewportMode ? 'search' : 'pin'" :size="16" />
            {{
              isViewportMode
                ? viewportTotal > 40
                  ? '더 확대하면 장소를 더 정확하게 볼 수 있어요'
                  : '지도를 움직이면 주변 장소를 다시 찾아요'
                : '지도를 확대하면 이 주변 장소를 최대 40개 보여드려요'
            }}
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

          <div ref="regionPickerEl" class="region-picker">
            <button
              type="button"
              class="region-picker-trigger"
              :class="{ open: isRegionPickerOpen }"
              @click="isRegionPickerOpen = !isRegionPickerOpen"
            >
              <span class="trigger-icon"><KkIcon name="pin" :size="18" /></span>
              <span class="trigger-copy">
                <small>지역 선택</small>
                <strong>{{ selectedRegionLabel }}</strong>
              </span>
              <KkIcon
                name="chevronD"
                :size="17"
                class="trigger-chevron"
                :class="{ rotated: isRegionPickerOpen }"
              />
            </button>

            <div v-if="isRegionPickerOpen" class="region-picker-panel">
              <div class="region-column">
                <span class="region-column-title">시·도 선택</span>
                <div class="region-options">
                  <button
                    type="button"
                    :class="{ active: !selectedSido }"
                    @click="chooseSido(null)"
                  >
                    전체
                  </button>
                  <button
                    v-for="region in sidos"
                    :key="region.code"
                    type="button"
                    :class="{ active: selectedSido?.code === region.code }"
                    @click="chooseSido(region)"
                  >
                    {{ region.name }}
                  </button>
                </div>
              </div>

              <div class="region-divider" />

              <div class="region-column">
                <span class="region-column-title">시·군·구 선택</span>
                <div v-if="selectedSido" class="region-options">
                  <button
                    type="button"
                    :class="{ active: !selectedSigungu }"
                    @click="chooseSigungu(null)"
                  >
                    전체
                  </button>
                  <button
                    v-for="region in sigungus"
                    :key="region.code"
                    type="button"
                    :class="{ active: selectedSigungu?.code === region.code }"
                    @click="chooseSigungu(region)"
                  >
                    {{ region.name }}
                  </button>
                </div>
                <div v-else class="region-empty">
                  <KkIcon name="pin" :size="22" />
                  <span>시·도를 먼저 선택해 주세요</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PlaceDetailPanel
          v-if="selectedPlace"
          :place="selectedPlace"
          :saved="basket.has(selectedPlace.id)"
          @back="closePlaceDetail"
          @toggle-save="selectedSummary && toggleSave(selectedSummary)"
        />

        <section v-else class="places-section">
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

          <article
            v-if="selectedFromMap && selectedSummary"
            class="map-selection-card"
            tabindex="0"
            @click="openPlace(selectedSummary, false)"
            @keyup.enter="openPlace(selectedSummary, false)"
          >
            <img :src="selectedSummary.img" :alt="selectedSummary.title" />
            <div>
              <span><KkIcon name="map" :size="13" /> 지도에서 선택한 장소</span>
              <h3>{{ selectedSummary.title }}</h3>
              <p><KkIcon name="pin" :size="14" /> {{ selectedSummary.region }}</p>
              <small>한 번 더 누르면 상세 정보를 볼 수 있어요</small>
            </div>
            <KkIcon name="chevronR" :size="18" />
          </article>

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

      </main>
    </div>
  </section>

</template>

<style scoped>
.explore-page {
  min-height: calc(100vh - 68px);
  background:
    radial-gradient(circle at 8% 6%, rgba(255, 214, 194, 0.28), transparent 22%),
    radial-gradient(circle at 90% 15%, rgba(194, 243, 228, 0.2), transparent 20%),
    #f6f4f1;
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
  border-right: 1px solid rgba(226, 220, 213, 0.72);
  background: transparent;
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
  background: transparent;
}

.discovery-hero {
  position: relative;
  overflow: hidden;
  flex: none;
  width: 100%;
  padding: 24px;
  border: 1px solid var(--border-subtle);
  border-radius: 22px;
  background:
    radial-gradient(circle at 93% 16%, rgba(255, 226, 214, 0.82), transparent 31%),
    linear-gradient(145deg, #ffffff 0%, #fffdfa 62%, #fff5ef 100%);
  box-shadow: var(--shadow-sm);
}

.hero-content {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 126px;
  gap: 16px;
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

.discovery-hero .eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--coral-600);
}

.discovery-hero h1 {
  margin-top: 7px;
  color: var(--text-primary);
  font-size: clamp(28px, 2.5vw, 37px);
  font-weight: 900;
  line-height: 1.15;
}

.discovery-hero p {
  max-width: 380px;
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.65;
}

.mascot-stage {
  position: relative;
  display: grid;
  min-height: 120px;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 242, 237, 0.7);
}

.mascot-stage::after {
  position: absolute;
  right: 8px;
  bottom: 3px;
  width: 46px;
  height: 10px;
  border-radius: 50%;
  background: rgba(151, 78, 46, 0.1);
  filter: blur(3px);
  content: '';
}

.hero-mascot {
  position: relative;
  z-index: 2;
  margin-bottom: -14px;
  filter: drop-shadow(0 8px 8px rgba(132, 75, 48, 0.13));
  transform: rotate(3deg);
}

.mascot-orbit {
  position: absolute;
  border-radius: 50%;
}

.mascot-orbit-one {
  top: 12px;
  right: 9px;
  width: 12px;
  height: 12px;
  background: var(--mint-200);
}

.mascot-orbit-two {
  top: 28px;
  left: 7px;
  width: 7px;
  height: 7px;
  background: var(--amber-300);
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

.search-box:focus-within {
  border-color: var(--coral-300);
  background: #fff;
  box-shadow: 0 0 0 3px var(--coral-50);
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
  font-weight: 800;
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

.region-picker {
  position: relative;
  margin-top: 12px;
}

.region-picker-trigger {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  min-height: 58px;
  padding: 8px 13px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: #fff;
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.region-picker-trigger:hover,
.region-picker-trigger.open {
  border-color: var(--coral-400);
  box-shadow: 0 0 0 3px var(--coral-50);
}

.trigger-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  flex: none;
  border-radius: 12px;
  background: var(--coral-50);
  color: var(--coral-600);
}

.trigger-copy {
  display: grid;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.trigger-copy small {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 800;
}

.trigger-copy strong {
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-chevron {
  color: var(--text-muted);
  transition: transform 180ms ease;
}

.trigger-chevron.rotated {
  transform: rotate(180deg);
}

.region-picker-panel {
  position: absolute;
  top: calc(100% + 9px);
  right: 0;
  left: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
  gap: 16px;
  height: min(310px, calc(100vh - 180px));
  max-height: 310px;
  padding: 16px;
  border: 1px solid #eadfd7;
  border-radius: 20px;
  background: #fffdfb;
  box-shadow: 0 18px 44px rgba(52, 39, 31, 0.18);
}

.region-column {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
}

.region-column-title {
  flex: none;
  padding: 2px 9px 9px;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 900;
}

.region-divider {
  width: 1px;
  height: 100%;
  background: var(--border);
}

.region-options {
  display: grid;
  min-height: 0;
  flex: 1;
  align-content: start;
  gap: 3px;
  overflow-y: auto;
  padding-right: 5px;
  overscroll-behavior: contain;
  scrollbar-color: #d7cec5 transparent;
  scrollbar-gutter: stable;
}

.region-options::-webkit-scrollbar {
  width: 7px;
}

.region-options::-webkit-scrollbar-thumb {
  border: 0;
  border-radius: 999px;
  background: #d7cec5;
}

.region-options::-webkit-scrollbar-track {
  background: transparent;
}

.region-options button {
  width: 100%;
  padding: 9px 11px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
}

.region-options button:hover {
  background: var(--gray-50);
  color: var(--text-primary);
}

.region-options button.active {
  background: var(--coral-50);
  color: var(--coral-600);
  font-weight: 900;
}

.region-empty {
  display: grid;
  flex: 1;
  place-items: center;
  align-content: center;
  gap: 7px;
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
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

.map-selection-card {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr) 24px;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
  padding: 10px;
  border: 1px solid var(--coral-200);
  border-radius: 17px;
  background: linear-gradient(100deg, var(--coral-50), #fff 72%);
  box-shadow: 0 8px 22px rgba(72, 50, 39, 0.08);
  cursor: pointer;
}

.map-selection-card > img {
  width: 78px;
  height: 70px;
  border-radius: 12px;
  object-fit: cover;
}

.map-selection-card > div {
  min-width: 0;
}

.map-selection-card span,
.map-selection-card p {
  display: flex;
  align-items: center;
  gap: 4px;
}

.map-selection-card span {
  color: var(--coral-600);
  font-size: 10px;
  font-weight: 900;
}

.map-selection-card h3 {
  overflow: hidden;
  margin-top: 4px;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-selection-card p {
  overflow: hidden;
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-selection-card small {
  display: block;
  margin-top: 4px;
  color: var(--coral-600);
  font-size: 10px;
  font-weight: 700;
}

.map-selection-card > svg {
  color: var(--coral-500);
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
  font-weight: 700;
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
    grid-template-columns: minmax(0, 1fr) 92px;
  }

  .region-picker-panel {
    grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
    gap: 10px;
    height: min(300px, calc(100vh - 170px));
    padding: 12px;
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
