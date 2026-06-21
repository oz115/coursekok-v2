<script setup>
import { ref, computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  /** 카드 내부 패딩 사이즈: none | sm | md | lg */
  padding: {
    type: String,
    default: 'md',
    validator: v => ['none', 'sm', 'md', 'lg'].includes(v)
  },
  /** true일 때 마우스 호버 리프트업 및 그림자 강조 인터랙션 제공 */
  interactive: {
    type: Boolean,
    default: false
  }
})

const isHovered = ref(false)

const pads = {
  none: 0,
  sm: 'var(--space-4)',
  md: 'var(--space-5)',
  lg: 'var(--space-6)'
}

const attrs = useAttrs()

const rootStyle = computed(() => {
  const h = isHovered.value
  return [
    {
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: h ? 'var(--shadow-lg)' : 'var(--shadow-md)',
      padding: pads[props.padding],
      border: '1px solid var(--border-subtle)',
      transform: h ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      cursor: props.interactive ? 'pointer' : 'default',
      display: 'block'
    },
    attrs.style
  ]
})
</script>

<template>
  <div
    v-bind="$attrs"
    :style="rootStyle"
    @mouseenter="interactive && (isHovered = true)"
    @mouseleave="interactive && (isHovered = false)"
  >
    <!-- Card Content Slot -->
    <slot />
  </div>
</template>
