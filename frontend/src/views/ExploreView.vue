<script setup>
/**
 * ExploreView.vue — 여행지 탐색 뷰
 * ─────────────────────────────────────────────────────────────
 * 원본: raw-wireframe/output/scripts/Explore_여행지_탐색.js
 *
 * 구조:
 *   Hero (검색창 + 마스코트) → 지역 FilterChip → 카테고리 Tabs
 *   → 정렬 SegmentedControl → PlaceCard 그리드 → PlaceDetailOverlay
 *
 * 전역 상태 연결 (AppLayout에서 provide):
 *   - inject('basket')       : Set<placeId>
 *   - inject('toggleBasket') : (place) => void
 *   - inject('navigate')     : (view) => void
 *
 * React → Vue 매핑:
 *   - React.useState → ref()
 *   - 파생 필터 로직 → computed()
 *   - 카테고리 개수 카운트 → computed()
 */

import { ref, computed, inject } from 'vue'
import { places, regions, categories } from '@/data/mockData.js'
import Tabs from '@/components/navigation/Tabs.vue'
import FilterChip from '@/components/data-display/FilterChip.vue'
import SegmentedControl from '@/components/navigation/SegmentedControl.vue'
import PlaceCard from '@/components/data-display/PlaceCard.vue'
import Mascot from '@/components/brand/Mascot.vue'
import PlaceDetailOverlay from '@/components/domain/PlaceDetailOverlay.vue'

// ── 전역 상태 주입 ─────────────────────────────────────────────────────────
const basket      = inject('basket', ref(new Set()))
const toggleBasket = inject('toggleBasket', () => {})

// ── 필터 상태 ──────────────────────────────────────────────────────────────
const region   = ref('제주')
const cat      = ref('all')
const sort     = ref('추천순')
const query    = ref('')

// ── 카테고리 레이블 매핑 ────────────────────────────────────────────────────
const catLabel = { all: null, spot: '관광지', food: '음식점', stay: '숙박', fest: '축제' }

// ── 카테고리별 개수 (computed) ─────────────────────────────────────────────
const counts = computed(() =>
  places.reduce((m, p) => { m[p.cat] = (m[p.cat] || 0) + 1; return m }, {})
)

// ── 탭 아이템 (computed) ───────────────────────────────────────────────────
const tabItems = computed(() => [
  { value: 'all',  label: '전체' },
  { value: 'spot', label: '관광지', count: counts.value['관광지'] },
  { value: 'food', label: '음식점', count: counts.value['음식점'] },
  { value: 'stay', label: '숙박',   count: counts.value['숙박'] },
  { value: 'fest', label: '축제',   count: counts.value['축제'] },
])

// ── 필터링된 장소 목록 (computed) ─────────────────────────────────────────
const filteredPlaces = computed(() => {
  let list = places.filter((p) => !catLabel[cat.value] || p.cat === catLabel[cat.value])
  if (query.value.trim()) {
    const q = query.value.trim()
    list = list.filter((p) => (p.title + p.region + p.tags.join()).includes(q))
  }
  if (sort.value === '평점순') {
    list = [...list].sort((a, b) => b.rating - a.rating)
  }
  return list
})

// ── PlaceDetailOverlay 상태 ────────────────────────────────────────────────
const selectedPlace = ref(null)
const openPlace = (p) => { selectedPlace.value = p }
const closePlace = () => { selectedPlace.value = null }

const isInBasket = computed(() =>
  selectedPlace.value ? basket.value.has(selectedPlace.value.id) : false
)

const handleToggleSave = (place) => {
  toggleBasket(place)
  // 오버레이가 열려있을 때도 saved 상태 즉시 반영
}
</script>

<template>
  <div style="max-width: 1200px; margin: 0 auto; padding: 28px 24px 80px;">

    <!-- ── Hero 섹션 ─────────────────────────────────────────────────────── -->
    <div
      style="
        position: relative; overflow: hidden;
        border-radius: var(--radius-2xl);
        background: linear-gradient(135deg, #FFE2D6 0%, #FFF9F4 55%, #D2E7FF 130%);
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
          display: flex; align-items: center; gap: 10; margin-top: 22px;
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
            placeholder="제주, 성산일출봉, 고기국수…"
            style="
              flex: 1; border: none; outline: none; background: transparent;
              font-size: 16px; font-family: var(--font-sans); min-width: 0;
            "
          />
          <button style="
            width: 44px; height: 44px; border-radius: 50%; border: none;
            background: var(--coral-500); color: #fff; cursor: pointer;
            display: flex; align-items: center; justify-content: center; flex: none;
            box-shadow: var(--shadow-primary);
          ">
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

    <!-- ── 지역 FilterChip 가로 스크롤 ─────────────────────────────────── -->
    <div style="
      display: flex; align-items: center; gap: 10;
      overflow-x: auto; padding-bottom: 6px; margin-bottom: 18px;
    ">
      <FilterChip
        v-for="r in regions"
        :key="r"
        :selected="region === r"
        @click="region = r"
      >
        <template v-if="r !== '전체'" #left-icon>
          <!-- Pin 아이콘 -->
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </template>
        {{ r }}
      </FilterChip>
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
        v-for="p in filteredPlaces"
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
        v-if="filteredPlaces.length === 0"
        style="
          grid-column: 1 / -1; text-align: center;
          padding: 60px 20px; color: var(--text-muted);
        "
      >
        <Mascot variant="wink" :size="80" />
        <p style="margin-top: 12px; font-size: 15px;">
          검색 결과가 없어요. 다른 키워드로 찾아보세요.
        </p>
      </div>
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
