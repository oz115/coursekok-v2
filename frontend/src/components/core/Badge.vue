<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    tone?: 'neutral' | 'coral' | 'sky' | 'mint' | 'amber' | 'red'
    solid?: boolean
    size?: 'sm' | 'md'
  }>(),
  {
    tone: 'neutral',
    solid: false,
    size: 'md',
  },
)

const tones = {
  neutral: { soft: ['var(--gray-100)', 'var(--gray-700)'], solid: ['var(--gray-800)', '#fff'] },
  coral: { soft: ['var(--coral-100)', 'var(--coral-700)'], solid: ['var(--coral-500)', '#fff'] },
  sky: { soft: ['var(--sky-100)', 'var(--sky-700)'], solid: ['var(--sky-500)', '#fff'] },
  mint: { soft: ['var(--mint-100)', 'var(--mint-700)'], solid: ['var(--mint-500)', '#fff'] },
  amber: { soft: ['var(--amber-100)', 'var(--amber-600)'], solid: ['var(--amber-500)', '#fff'] },
  red: { soft: ['var(--red-100)', 'var(--red-700)'], solid: ['var(--red-500)', '#fff'] },
} as const

const sizes = {
  sm: { height: '20px', padding: '2px 8px', fontSize: '11px' },
  md: { height: '24px', padding: '3px 10px', fontSize: 'var(--fs-micro)' },
} as const

const rootStyle = computed(() => {
  const palette = tones[props.tone][props.solid ? 'solid' : 'soft']
  const size = sizes[props.size]

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    height: size.height,
    padding: size.padding,
    fontSize: size.fontSize,
    fontWeight: 'var(--fw-semibold)',
    fontFamily: 'var(--font-sans)',
    color: palette[1],
    background: palette[0],
    borderRadius: 'var(--radius-pill)',
    whiteSpace: 'nowrap',
    lineHeight: 1,
  }
})
</script>

<template>
  <span :style="rootStyle">
    <slot name="left-icon" />
    <slot />
  </span>
</template>
