<script setup lang="ts">
import { ref, computed, useAttrs } from 'vue'
import type { StyleValue } from 'vue'
import Badge from '../core/Badge.vue'
import Rating from './Rating.vue'

import attractionFallback from '@/assets/images/place-attraction.svg'
import foodFallback from '@/assets/images/place-food.svg'
import stayFallback from '@/assets/images/place-stay.svg'
import festivalFallback from '@/assets/images/place-festival.svg'
import defaultFallback from '@/assets/images/place-default.svg'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  /** 장소 썸네일 이미지 URL */
  image: {
    type: String,
    default: ''
  },
  /** 카테고리: 관광지 | 음식점 | 숙박 | 축제 */
  category: {
    type: String,
    default: '관광지'
  },
  /** 장소 타이틀 */
  title: {
    type: String,
    required: true
  },
  /** 지역 텍스트 */
  region: {
    type: String,
    required: true
  },
  /** 평점 수치 (e.g. 4.5) */
  rating: {
    type: Number,
    default: null
  },
  /** 리뷰 개수 */
  reviewCount: {
    type: Number,
    default: null
  },
  /** 우측 하단 기타 텍스트 (e.g. '도보 10분') */
  meta: {
    type: String,
    default: ''
  },
  /** 북마크 저장 상태 제어 */
  saved: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:saved'])

const getFallbackImage = (category: string) => {
  if (category === '관광지') return attractionFallback
  if (category === '음식점') return foodFallback
  if (category === '숙박') return stayFallback
  if (category === '축제') return festivalFallback
  return defaultFallback
}

const handleImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = getFallbackImage(props.category)
}

const isHovered = ref(false)
const isPopped = ref(false)

const catToTone: Record<string, string> = {
  '관광지': 'coral',
  '음식점': 'amber',
  '숙박': 'sky',
  '축제': 'mint'
}
const badgeTone = computed(() => catToTone[props.category] || 'coral')

const handleSave = (e: Event) => {
  e.stopPropagation()
  isPopped.value = true
  setTimeout(() => {
    isPopped.value = false
  }, 360)
  emit('update:saved', !props.saved)
}

const attrs = useAttrs()
const rootStyle = computed(() => {
  const h = isHovered.value
  const hasClick = attrs.onClick != null
  return [
    {
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      boxShadow: h ? 'var(--shadow-lg)' : 'var(--shadow-md)',
      transform: h ? 'translateY(-3px)' : 'translateY(0)',
      transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      cursor: hasClick ? 'pointer' : 'default',
      display: 'flex',
      flexDirection: 'column' as const
    },
    attrs.style as StyleValue
  ] as StyleValue
})
</script>

<template>
  <div
    v-bind="$attrs"
    :style="rootStyle"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Photo Aspect Container -->
    <div
      style="
        position: relative;
        aspect-ratio: 4 / 3;
        background: var(--gray-100);
        overflow: hidden;
      "
    >
      <img
        v-if="image"
        :src="image"
        :alt="title"
        @error="handleImgError"
        style="width: 100%; height: 100%; object-fit: cover;"
      />

      <!-- Category Badge Composite Assembly -->
      <Badge
        :tone="badgeTone"
        solid
        size="sm"
        style="
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
        "
      >
        {{ category }}
      </Badge>

      <!-- Bookmark Heart/Save Trigger -->
      <button
        type="button"
        :aria-label="saved ? '저장 취소' : '장소 저장'"
        @click="handleSave"
        style="
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          backdrop-filter: blur(6px);
          box-shadow: var(--shadow-sm);
          transition: transform var(--dur-base) var(--ease-spring), background var(--dur-fast) var(--ease-out);
        "
        :style="{
          background: saved ? 'var(--primary)' : 'rgba(255,255,255,0.9)',
          transform: isPopped ? 'scale(1.18)' : 'scale(1)'
        }"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          :fill="saved ? '#fff' : 'none'"
          :stroke="saved ? '#fff' : 'var(--gray-700)'"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>

    <!-- Description Details Area -->
    <div
      style="
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: 6px;
      "
    >
      <h3
        style="
          font-size: var(--fs-title);
          font-weight: var(--fw-bold);
          color: var(--text-primary);
          letter-spacing: var(--ls-tight);
          margin: 0;
        "
      >
        {{ title }}
      </h3>

      <!-- Region (Map Pin Pin) -->
      <div
        style="
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: var(--fs-body-sm);
          color: var(--text-muted);
        "
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="flex: none"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>{{ region }}</span>
      </div>

      <!-- Rating Rating Assembly & Meta Info Row -->
      <div
        v-if="rating != null || meta"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 2px;
        "
      >
        <!-- Rating Component Assembly -->
        <Rating
          v-if="rating != null"
          :model-value="rating"
          readonly
          show-value
          :count="reviewCount"
          :size="14"
        />

        <span
          v-if="meta"
          style="
            font-size: var(--fs-caption);
            color: var(--text-muted);
          "
        >
          {{ meta }}
        </span>
      </div>
    </div>
  </div>
</template>
