<script setup lang="ts">
/**
 * ExploreView.vue — 여행지 탐색 뷰 (REST API 연동 및 지역 선택기 구현)
 */

import { ref, computed, inject, watch, onMounted, onUnmounted } from 'vue'
import type { CSSProperties, Ref } from 'vue'
import { getPlaces, getPlaceDetail, getSidos, getSigungus } from '@/api/place.js'
import Tabs from '@/components/navigation/Tabs.vue'
import SegmentedControl from '@/components/navigation/SegmentedControl.vue'
import PlaceCard from '@/components/data-display/PlaceCard.vue'
import Mascot from '@/components/brand/Mascot.vue'
import PlaceDetailOverlay from '@/components/domain/PlaceDetailOverlay.vue'

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

interface PlaceDetailResponse {
  id: number
  contentTypeId: number
  title: string
  ldongRegnNm: string
  ldongSignguNm: string
  rating: number | null
  views: number
  tel?: string | null
  overview?: string | null
  firstImage?: string | null
  firstImage2?: string | null
  lclsSystm1?: string | null
  lclsSystm2?: string | null
  lclsSystm3?: string | null
  mapX?: number | null
  mapY?: number | null
}

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
  mapX: number
  mapY: number
  firstImage?: string | null
  firstImage2?: string | null
  views: number
  rating: number | null
}

import attractionFallback from '@/assets/images/place-attraction.svg'
import foodFallback from '@/assets/images/place-food.svg'
import stayFallback from '@/assets/images/place-stay.svg'
import festivalFallback from '@/assets/images/place-festival.svg'
import defaultFallback from '@/assets/images/place-default.svg'

// ── 유효성 검증 및 폴백 이미지 ──────────────────────────────────────────────
const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false
  if (!/^https?:\/\//i.test(trimmed)) return false
  if (/noImage/i.test(trimmed) || /no-image/i.test(trimmed) || /img_not_found/i.test(trimmed)) return false
  return true
}

const getFallbackImage = (category: string): string => {
  if (category === '관광지') return attractionFallback
  if (category === '음식점') return foodFallback
  if (category === '숙박') return stayFallback
  if (category === '축제') return festivalFallback
  return defaultFallback
}

// ── 전역 상태 주입 ─────────────────────────────────────────────────────────
const basket      = inject<Ref<Set<number>>>('basket', ref(new Set()))
const toggleBasket = inject<(place: { id: number }) => void>('toggleBasket')

// ── 필터 및 API 검색 상태 ──────────────────────────────────────────────────
const cat      = ref('all')
const sort     = ref('추천순')
const query    = ref('')

// 페이징 및 목록 상태
const placesList = ref<PlaceSummary[]>([])
const currentPage = ref(0)
const hasMore = ref(true)
const isLoading = ref(false)

// 지역 필터 상태
const sidos = ref<Region[]>([])
const sigungus = ref<Region[]>([])
const selectedSido = ref<Region | null>(null)
const selectedSigungu = ref<Region | null>(null)
const isRegionModalOpen = ref(false)

// ── 숏컷 지역 필터 ──────────────────────────────────────────────────────────
const shortcutSidos = ['서울특별시', '경기도', '강원특별자치도', '부산광역시', '전라남도']

const selectShortcutSido = async (sidoName: string) => {
  if (selectedSido.value?.name === sidoName && !selectedSigungu.value) {
    selectedSido.value = null
    selectedSigungu.value = null
    sigungus.value = []
    fetchPlacesData(true)
    return
  }

  const targetSido = sidos.value.find(s => s.name === sidoName)
  if (!targetSido) return

  selectedSido.value = targetSido
  selectedSigungu.value = null
  sigungus.value = []

  try {
    const list = await getSigungus(targetSido.code)
    sigungus.value = list
  } catch (err) {
    console.error('Failed to fetch sigungus:', err)
  }

  fetchPlacesData(true)
}

// ── 카테고리 레이블 및 ID 매핑 ──────────────────────────────────────────────
const catToContentTypeId: Record<string, number | null> = {
  all: null,
  spot: 12,
  food: 39,
  stay: 32,
  fest: 15
}

const getCategoryLabel = (contentTypeId: number | null): string => {
  if (contentTypeId === 12) return '관광지'
  if (contentTypeId === 39) return '음식점'
  if (contentTypeId === 32) return '숙박'
  if (contentTypeId === 15) return '축제'
  return '관광지'
}

// ── 탭 아이템 정의 ──────────────────────────────────────────────────────────
const tabItems = [
  { value: 'all',  label: '전체' },
  { value: 'spot', label: '관광지' },
  { value: 'food', label: '음식점' },
  { value: 'stay', label: '숙박' },
  { value: 'fest', label: '축제' },
]

// ── 지역 선택 버튼 라벨 ─────────────────────────────────────────────────────
const selectedRegionLabel = computed(() => {
  if (!selectedSido.value) return '전체 지역'
  if (!selectedSigungu.value) return `${selectedSido.value.name} 전체`
  return `${selectedSido.value.name} ${selectedSigungu.value.name}`
})

// ── REST API 데이터 호출 로직 ────────────────────────────────────────────────
const fetchPlacesData = async (resetPage = false) => {
  // ── 이미지 사전 검증 함수 (HTTP 404 확인) ────────────────────────────────────────
  const checkImageUrl = (url: string) => {
    return new Promise((resolve) => {
      if (!url) return resolve(false)
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
    })
  }

  // Validate and possibly replace image URLs after fetching list
  const validatePlaceImages = async (list: PlaceSummary[]) => {
    for (const item of list) {
      const valid = await checkImageUrl(item.firstImage ?? '')
      if (!valid) {
        // Mark as invalid; mapping will use fallback based on category
        item.firstImage = null
      }
    }
  }

  if (resetPage) {
    currentPage.value = 0
    placesList.value = []
    hasMore.value = true
  }

  if (isLoading.value || !hasMore.value) return
  isLoading.value = true

  try {
    const params = {
      keyword: query.value.trim() || null,
      ldongRegnCd: selectedSido.value?.code || null,
      ldongSignguCd: selectedSigungu.value?.code || null,
      contentTypeId: catToContentTypeId[cat.value],
      sortBy: sort.value === '평점순' ? 'rating' : 'views',
      page: currentPage.value,
      size: 20
    }

    const response = await getPlaces(params)
    if (response && response.content) {
      const newPlaces = response.content
      // 사전 이미지 검증 수행
      await validatePlaceImages(newPlaces)
      if (resetPage) {
        placesList.value = newPlaces
      } else {
        placesList.value = [...placesList.value, ...newPlaces]
      }
      currentPage.value++
      hasMore.value = !response.last
    } else {
      hasMore.value = false
    }
  } catch (err) {
    console.error('Failed to fetch places:', err)
    hasMore.value = false
  } finally {
    isLoading.value = false
  }
}

// ── 이벤트 핸들러 및 필터 조작 ──────────────────────────────────────────────
const handleSearch = () => {
  fetchPlacesData(true)
}

const selectSido = async (sido: Region | null) => {
  selectedSido.value = sido
  selectedSigungu.value = null
  sigungus.value = []

  if (sido) {
    try {
      const list = await getSigungus(sido.code)
      sigungus.value = list
    } catch (err) {
      console.error('Failed to fetch sigungus:', err)
    }
  } else {
    // '전체' 선택 시 모달을 닫고 조회 실행
    isRegionModalOpen.value = false
    fetchPlacesData(true)
  }
}

const selectSigungu = (sigungu: Region | null) => {
  selectedSigungu.value = sigungu
  isRegionModalOpen.value = false
  fetchPlacesData(true)
}

// 지역 선택 드롭다운 외부 클릭 감지 처리
const closeDropdown = (e: MouseEvent) => {
  const container = document.querySelector('.region-selector-container')
  if (container && e.target && !container.contains(e.target as Node)) {
    isRegionModalOpen.value = false
  }
}

// 카테고리/정렬 상태 변화 시 데이터 갱신
watch([cat, sort], () => {
  fetchPlacesData(true)
})

// ── 데이터 매핑 (PlaceCard 렌더용) ─────────────────────────────────────────
const mappedPlaces = computed(() => {
  return placesList.value.map(p => {
    const category = getCategoryLabel(p.contentTypeId)
    const hasValidImg = isValidImageUrl(p.firstImage)
    return {
      id: p.id,
      title: p.title,
      region: `${p.ldongRegnNm} ${p.ldongSignguNm}`,
      cat: category,
      rating: p.rating ?? undefined,
      reviews: p.views ?? undefined,
      img: (hasValidImg ? p.firstImage : getFallbackImage(category)) || '',
      meta: `조회 ${p.views}`
    }
  })
})

// ── 생명주기 훅 ─────────────────────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener('click', closeDropdown)
  try {
    const list = await getSidos()
    sidos.value = list
  } catch (err) {
    console.error('Failed to load sidos:', err)
  }
  fetchPlacesData(true)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})

// ── 지역 드롭다운 아이템 스타일 ──────────────────────────────────────────────
const getRegionItemStyle = (isSelected: boolean): CSSProperties => {
  return {
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    fontWeight: isSelected ? '700' : '500',
    color: isSelected ? 'var(--coral-600)' : 'var(--text-primary)',
    background: isSelected ? 'var(--coral-50)' : 'transparent',
    cursor: 'pointer',
    transition: 'background var(--dur-fast) var(--ease-out)',
    marginBottom: '2px',
    textAlign: 'left'
  }
}

const handleMouseOver = (e: Event) => {
  const target = e.currentTarget as HTMLElement
  if (target) target.style.background = 'var(--gray-50)'
}

const handleMouseLeave = (e: Event, isSelected: boolean) => {
  const target = e.currentTarget as HTMLElement
  if (target) target.style.background = isSelected ? 'var(--coral-50)' : 'transparent'
}

// ── PlaceDetailOverlay 연동 상태 ──────────────────────────────────────────────
const selectedPlace = ref<PlaceDetail | null>(null)
const isDetailLoading = ref(false)

const openPlace = async (p: { id: number }) => {
  if (isDetailLoading.value) return
  isDetailLoading.value = true
  try {
    const detail = (await getPlaceDetail(p.id)) as unknown as PlaceDetailResponse
    const catLabel = getCategoryLabel(detail.contentTypeId)
    
    const imgValid = isValidImageUrl(detail.firstImage)
    const finalImg = imgValid ? detail.firstImage : getFallbackImage(catLabel)
    
    // 목록 내 항목의 이미지도 동적 갱신하여 싱크 맞춤
    const listIndex = placesList.value.findIndex(item => item.id === detail.id)
    if (listIndex !== -1) {
      const placeItem = placesList.value[listIndex]
      if (placeItem) {
        placeItem.firstImage = finalImg
      }
    }
    
    selectedPlace.value = {
      id: detail.id,
      title: detail.title,
      region: `${detail.ldongRegnNm} ${detail.ldongSignguNm}`,
      cat: catLabel,
      rating: detail.rating,
      reviews: detail.views,
      meta: detail.tel || '연락처 정보 없음',
      desc: detail.overview || '상세 소개 내용이 준비되지 않았습니다.',
      img: finalImg || '',
      tags: detail.lclsSystm3 ? ([detail.lclsSystm1, detail.lclsSystm2, detail.lclsSystm3].filter(Boolean) as string[]) : [],
      lat: detail.mapY ?? null,
      lng: detail.mapX ?? null
    }
  } catch (err) {
    console.error('Failed to load place detail:', err)
  } finally {
    isDetailLoading.value = false
  }
}

const closePlace = () => { selectedPlace.value = null }

const isInBasket = computed(() =>
  selectedPlace.value && basket.value ? basket.value.has(selectedPlace.value.id) : false
)

const handleToggleSave = (place: { id: number }) => {
  if (toggleBasket) {
    toggleBasket(place)
  }
}
</script>

<template>
  <div style="max-width: 1200px; margin: 0 auto; padding: 28px 24px 80px;">

    <!-- ── Hero 섹션 ─────────────────────────────────────────────────────── -->
    <div
      style="
        position: relative; overflow: hidden;
        border-radius: var(--radius-2xl);
        background: linear-gradient(135deg, #FFE2D6 0%, #FFFFFF 55%, #D2E7FF 130%);
        padding: 40px 44px; margin-bottom: 28px;
      "
    >
      <div style="max-width: 560px;">
        <div style="
          font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
          color: var(--coral-600); text-transform: uppercase; margin-bottom: 12px;
        ">한국관광공사 인증 여행지 · TripLog</div>

        <h1 style="font-size: 40px; font-weight: 800; line-height: 1.15; letter-spacing: -0.02em;">
          콕! 찍어 담는<br />나만의 여행 코스
        </h1>
        <p style="font-size: 17px; color: var(--text-secondary); margin-top: 14px; line-height: 1.6;">
          가고 싶은 장소를 저장하면, AI가 일정에 맞게 코스를 만들어드려요.
        </p>

        <!-- 검색창 -->
        <div style="
          display: flex; align-items: center; gap: 10px; margin-top: 22px;
          padding: 6px 6px 6px 18px;
          background: var(--surface); border-radius: var(--radius-pill);
          box-shadow: var(--shadow-md); max-width: 460px;
        ">
          <!-- 검색 아이콘 -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex: none;">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="query"
            @keyup.enter="handleSearch"
            placeholder="경복궁, 해운대, 고기국수…"
            style="
              flex: 1; border: none; outline: none; background: transparent;
              font-size: 16px; font-family: var(--font-sans); min-width: 0;
            "
          />
          <button 
            @click="handleSearch"
            style="
              width: 44px; height: 44px; border-radius: 50%; border: none;
              background: var(--coral-500); color: #fff; cursor: pointer;
              display: flex; align-items: center; justify-content: center; flex: none;
              box-shadow: var(--shadow-primary);
            "
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 마스코트 -->
      <div style="position: absolute; right: 36px; bottom: -8px; opacity: 0.96;">
        <Mascot :size="150" />
      </div>
    </div>

    <!-- ── 지역 필터 선택기 ────────────────────────────────────────────── -->
    <div class="region-selector-container" style="position: relative; display: flex; align-items: center; gap: 12px; margin-bottom: 24px; z-index: 10;">
      <button 
        @click="isRegionModalOpen = !isRegionModalOpen"
        style="
          padding: 10px 18px;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          background: var(--surface);
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: var(--shadow-sm);
          transition: all var(--dur-base) var(--ease-out);
        "
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--coral-500)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span>{{ selectedRegionLabel }}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <!-- 숏컷 지역 버튼들 -->
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <button
          v-for="name in shortcutSidos"
          :key="name"
          @click="selectShortcutSido(name)"
          class="shortcut-btn"
          :class="{ active: selectedSido?.name === name && !selectedSigungu }"
        >
          {{ name }}
        </button>
      </div>

      <!-- 지역 선택 드롭다운 패널 -->
      <div v-if="isRegionModalOpen" style="
        position: absolute;
        z-index: 100;
        top: 100%;
        left: 100px;
        margin-top: 8px;
        background: var(--surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        display: flex;
        padding: 16px;
        gap: 16px;
        min-width: 340px;
        max-width: 450px;
      ">
        <!-- 시도 컬럼 -->
        <div style="flex: 1; max-height: 260px; overflow-y: auto; border-right: 1px solid var(--border-subtle); padding-right: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; padding-left: 8px; text-transform: uppercase;">시도 선택</div>
          <div 
            @click="selectSido(null)"
            :style="getRegionItemStyle(selectedSido === null)"
            @mouseover="handleMouseOver"
            @mouseleave="handleMouseLeave($event, selectedSido === null)"
          >
            전체
          </div>
          <div 
            v-for="sido in sidos" 
            :key="sido.code"
            @click="selectSido(sido)"
            :style="getRegionItemStyle(selectedSido?.code === sido.code)"
            @mouseover="handleMouseOver"
            @mouseleave="handleMouseLeave($event, selectedSido?.code === sido.code)"
          >
            {{ sido.name }}
          </div>
        </div>

        <!-- 시군구 컬럼 -->
        <div style="flex: 1; max-height: 260px; overflow-y: auto; padding-left: 4px;">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; padding-left: 8px; text-transform: uppercase;">시군구 선택</div>
          <template v-if="selectedSido">
            <div 
              @click="selectSigungu(null)"
              :style="getRegionItemStyle(selectedSigungu === null)"
              @mouseover="handleMouseOver"
              @mouseleave="handleMouseLeave($event, selectedSigungu === null)"
            >
              전체
            </div>
            <div 
              v-for="sigungu in sigungus" 
              :key="sigungu.code"
              @click="selectSigungu(sigungu)"
              :style="getRegionItemStyle(selectedSigungu?.code === sigungu.code)"
              @mouseover="handleMouseOver"
              @mouseleave="handleMouseLeave($event, selectedSigungu?.code === sigungu.code)"
            >
              {{ sigungu.name }}
            </div>
          </template>
          <div v-else style="color: var(--text-muted); font-size: 13px; text-align: center; padding-top: 36px;">
            시도를 먼저 선택해 주세요.
          </div>
        </div>
      </div>
    </div>

    <!-- ── 카테고리 탭 + 정렬 ─────────────────────────────────────────── -->
    <div style="
      display: flex; align-items: flex-end; justify-content: space-between;
      gap: 16px; margin-bottom: 22px; flex-wrap: wrap;
    ">
      <Tabs v-model="cat" :items="tabItems" />
      <SegmentedControl
        v-model="sort"
        :options="['추천순', '평점순']"
        size="sm"
      />
    </div>

    <!-- ── PlaceCard 그리드 ───────────────────────────────────────────── -->
    <div style="
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(248px, 1fr));
      gap: 20px;
    ">
      <PlaceCard
        v-for="p in mappedPlaces"
        :key="p.id"
        :image="p.img"
        :category="p.cat"
        :title="p.title"
        :region="p.region"
        :rating="p.rating"
        :reviewCount="p.reviews"
        :meta="p.meta"
        :saved="basket.has(p.id)"
        @update:saved="handleToggleSave(p)"
        @click="openPlace(p)"
      />

      <!-- 결과 없음 -->
      <div
        v-if="mappedPlaces.length === 0 && !isLoading"
        style="
          grid-column: 1 / -1; text-align: center;
          padding: 60px 20px; color: var(--text-muted);
        "
      >
        <Mascot variant="wink" :size="80" />
        <p style="margin-top: 12px; font-size: 15px;">
          검색 결과가 없어요. 다른 조건으로 찾아보세요.
        </p>
      </div>
    </div>

    <!-- ── 페이징 더 보기 버튼 ───────────────────────────────────────────── -->
    <div v-if="hasMore" style="display: flex; justify-content: center; margin-top: 32px;">
      <button 
        @click="fetchPlacesData(false)"
        :disabled="isLoading"
        style="
          padding: 10px 28px;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-pill);
          background: var(--surface);
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: var(--shadow-sm);
          transition: all var(--dur-base) var(--ease-out);
        "
      >
        <span v-if="isLoading">불러오는 중...</span>
        <span v-else>더 보기</span>
      </button>
    </div>
  </div>

  <!-- PlaceDetailOverlay (Teleport to body) -->
  <PlaceDetailOverlay
    :place="selectedPlace"
    :saved="isInBasket"
    @close="closePlace"
    @toggle-save="handleToggleSave"
  />
</template>

<style scoped>
.shortcut-btn {
  padding: 8px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-pill);
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--dur-fast) var(--ease-out);
}

.shortcut-btn:hover {
  background: var(--gray-50);
  color: var(--text-primary);
  border-color: var(--border-medium);
}

.shortcut-btn.active {
  border: 1px solid var(--coral-300);
  background: var(--coral-50);
  color: var(--coral-600);
  font-weight: 700;
}

.shortcut-btn.active:hover {
  background: var(--coral-100);
}
</style>
