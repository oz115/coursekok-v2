<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import { categories, places, regions } from '@/data/mockData'
import type { CategoryKey, Place } from '@/data/mockData'
import Tabs from '@/components/navigation/Tabs.vue'
import FilterChip from '@/components/data-display/FilterChip.vue'
import SegmentedControl from '@/components/navigation/SegmentedControl.vue'
import PlaceCard from '@/components/data-display/PlaceCard.vue'
import Mascot from '@/components/brand/Mascot.vue'
import PlaceDetailOverlay from '@/components/domain/PlaceDetailOverlay.vue'

const basket = inject<Ref<Set<string>>>('basket', ref(new Set<string>()))
const toggleBasket = inject<(place: Place) => void>('toggleBasket', () => undefined)

const region = ref('Jeju')
const category = ref<'all' | CategoryKey>('all')
const sort = ref('Recommended')
const query = ref('')
const selectedPlace = ref<Place | null>(null)

const categoryLabel = {
  all: null,
  spot: 'Spot',
  food: 'Food',
  stay: 'Stay',
  fest: 'Festival',
} as const

const counts = computed(() =>
  places.reduce<Record<string, number>>((acc, place) => {
    acc[place.cat] = (acc[place.cat] || 0) + 1
    return acc
  }, {}),
)

const tabItems = computed(() =>
  categories.map((item) => ({
    value: item.key,
    label: item.label,
    count: item.key === 'all' ? undefined : counts.value[item.label],
  })),
)

const filteredPlaces = computed(() => {
  let list = places.filter((place) => !categoryLabel[category.value] || place.cat === categoryLabel[category.value])
  const keyword = query.value.trim().toLowerCase()
  if (keyword) {
    list = list.filter((place) => `${place.title} ${place.region} ${place.tags.join(' ')}`.toLowerCase().includes(keyword))
  }
  if (sort.value === 'Rating') {
    list = [...list].sort((a, b) => b.rating - a.rating)
  }
  return list
})

const isInBasket = computed(() => (selectedPlace.value ? basket.value.has(selectedPlace.value.id) : false))
</script>

<template>
  <div class="page">
    <section class="hero">
      <div>
        <p class="eyebrow">CourseKok</p>
        <h1>Build a route from places you actually want.</h1>
        <p>Search places, save candidates, then let the planner turn them into a route.</p>
        <div class="search-box">
          <input v-model="query" placeholder="Search Jeju, beach, noodles..." />
        </div>
      </div>
      <Mascot :size="150" />
    </section>

    <div class="filters">
      <FilterChip v-for="item in regions" :key="item" :selected="region === item" @click="region = item">
        {{ item }}
      </FilterChip>
    </div>

    <div class="section-head">
      <Tabs v-model="category" :items="tabItems" />
      <SegmentedControl v-model="sort" :options="['Recommended', 'Rating']" size="sm" />
    </div>

    <div class="place-grid">
      <PlaceCard
        v-for="place in filteredPlaces"
        :key="place.id"
        :image="place.img"
        :category="place.cat"
        :title="place.title"
        :region="place.region"
        :rating="place.rating"
        :review-count="place.reviews"
        :meta="place.meta"
        :saved="basket.has(place.id)"
        @update:saved="toggleBasket(place)"
        @click="selectedPlace = place"
      />

      <div v-if="filteredPlaces.length === 0" class="empty-state">
        <Mascot variant="wink" :size="80" />
        <p>No places found.</p>
      </div>
    </div>

    <PlaceDetailOverlay
      :place="selectedPlace"
      :saved="isInBasket"
      @close="selectedPlace = null"
      @toggle-save="selectedPlace && toggleBasket(selectedPlace)"
    />
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 24px 80px;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 36px 40px;
  margin-bottom: 26px;
  border-radius: var(--radius-2xl);
  background: linear-gradient(135deg, var(--coral-50), var(--sky-50));
}

.eyebrow {
  color: var(--coral-600);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero h1 {
  max-width: 560px;
  font-size: 38px;
  line-height: 1.16;
  font-weight: 800;
}

.hero p {
  max-width: 560px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.search-box {
  margin-top: 20px;
  max-width: 460px;
  padding: 0 18px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  box-shadow: var(--shadow-md);
}

.search-box input {
  width: 100%;
  height: 48px;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: 16px;
}

.filters,
.section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.section-head {
  justify-content: space-between;
}

.place-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(248px, 1fr));
  gap: 20px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}
</style>
