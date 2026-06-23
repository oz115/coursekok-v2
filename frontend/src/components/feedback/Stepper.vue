<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  /** 총 스텝 개수 */
  steps: {
    type: Number,
    default: 3
  },
  /** 활성화된 현재 스텝 인덱스 (0-based) */
  current: {
    type: Number,
    default: 0
  },
  /** 각 스텝의 텍스트 레이블 배열 (선택사항) */
  labels: {
    type: Array,
    default: null
  }
})

const attrs = useAttrs()
const rootStyle = computed(() => {
  return [
    {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    attrs.style
  ]
})
</script>

<template>
  <div :class="$attrs.class" :style="rootStyle">
    <!-- Horizontal Dots Indicators -->
    <div style="display: flex; align-items: center; gap: 6px">
      <span
        v-for="(_, i) in Array.from({ length: steps })"
        :key="i"
        :style="{
          width: i === current ? '26px' : '9px',
          height: '9px',
          flex: 'none',
          borderRadius: 'var(--radius-pill)',
          background: (i <= current) ? 'var(--primary)' : 'var(--gray-200)',
          transition: 'all var(--dur-base) var(--ease-spring)'
        }"
      />
    </div>

    <!-- Optional Label Text -->
    <div
      v-if="labels && labels[current] !== undefined"
      style="
        font-size: var(--fs-caption);
        color: var(--text-muted);
        font-family: var(--font-sans);
      "
    >
      <b style="color: var(--primary)">{{ current + 1 }}</b>
      / {{ steps }} &middot; {{ labels[current] }}
    </div>
  </div>
</template>
