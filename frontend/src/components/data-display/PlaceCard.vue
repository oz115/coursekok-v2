<script setup lang="ts">
import { computed, ref } from 'vue'
import Badge from '@/components/core/Badge.vue'
import Rating from '@/components/data-display/Rating.vue'
import type { PlaceCategory } from '@/data/mockData'

const props = withDefaults(
  defineProps<{
    image?: string
    category?: PlaceCategory
    title: string
    region: string
    rating?: number | null
    reviewCount?: number | null
    meta?: string
    saved?: boolean
  }>(),
  {
    image: '',
    category: 'Spot',
    rating: null,
    reviewCount: null,
    meta: '',
    saved: false,
  },
)

const emit = defineEmits<{
  'update:saved': [value: boolean]
}>()

const hovered = ref(false)
const tone = computed(() => {
  if (props.category === 'Food') return 'amber'
  if (props.category === 'Stay') return 'sky'
  if (props.category === 'Festival') return 'mint'
  return 'coral'
})
</script>

<template>
  <article
    :style="{
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-md)',
      transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      transition: 'transform var(--dur-base), box-shadow var(--dur-base)',
      cursor: 'pointer',
    }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <div style="position: relative; aspect-ratio: 4 / 3; background: var(--gray-100); overflow: hidden">
      <img v-if="image" :src="image" :alt="title" style="width: 100%; height: 100%; object-fit: cover" />
      <Badge :tone="tone" solid size="sm" style="position: absolute; top: 12px; left: 12px">
        {{ category }}
      </Badge>
      <button
        type="button"
        :aria-label="saved ? 'Remove from basket' : 'Add to basket'"
        @click.stop="emit('update:saved', !saved)"
        :style="{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '38px',
          height: '38px',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          background: saved ? 'var(--primary)' : 'rgba(255,255,255,0.9)',
          color: saved ? '#fff' : 'var(--gray-700)',
        }"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" :fill="saved ? '#fff' : 'none'" stroke="currentColor" stroke-width="2.2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>

    <div style="padding: var(--space-4); display: flex; flex-direction: column; gap: 6px">
      <h3 style="font-size: var(--fs-title); font-weight: var(--fw-bold); margin: 0">{{ title }}</h3>
      <div style="font-size: var(--fs-body-sm); color: var(--text-muted)">{{ region }}</div>
      <div v-if="rating != null || meta" style="display: flex; align-items: center; justify-content: space-between; gap: 8px">
        <Rating v-if="rating != null" :model-value="rating" readonly show-value :count="reviewCount" :size="14" />
        <span v-if="meta" style="font-size: var(--fs-caption); color: var(--text-muted)">{{ meta }}</span>
      </div>
    </div>
  </article>
</template>
