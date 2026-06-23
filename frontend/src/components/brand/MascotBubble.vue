<script setup>
import { computed, useAttrs } from 'vue'
import Mascot from './Mascot.vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  /** Mascot 감정 상태: default | saved | cheer | guide | wink */
  variant: {
    type: String,
    default: 'default'
  },
  /** 캐릭터 크기 (세로 및 말풍선 오프셋 계산의 기준점) */
  size: {
    type: Number,
    default: 96
  },
  /** 말풍선의 의미론적 색상 톤: default | coral | ai */
  tone: {
    type: String,
    default: 'default',
    validator: v => ['default', 'coral', 'ai'].includes(v)
  }
})

const tones = {
  default: {
    bg: 'var(--surface)',
    border: 'var(--border)',
    fg: 'var(--text-primary)'
  },
  coral: {
    bg: 'var(--coral-50)',
    border: 'var(--coral-200)',
    fg: 'var(--coral-800)'
  },
  ai: {
    bg: 'var(--sky-50)',
    border: 'var(--sky-200)',
    fg: 'var(--sky-800)'
  }
}

const currentTone = computed(() => tones[props.tone] || tones.default)
const bubbleMargin = computed(() => props.size * 0.18)

const attrs = useAttrs()
const rootStyle = computed(() => {
  return [
    {
      display: 'inline-flex',
      alignItems: 'flex-end',
      gap: '4px'
    },
    attrs.style
  ]
})
</script>

<template>
  <div :class="$attrs.class" :style="rootStyle">
    <!-- Character Assembly -->
    <Mascot
      :variant="variant"
      :size="size"
      style="flex: none;"
    />

    <!-- Speech Bubble Wrapper -->
    <div
      :style="{
        position: 'relative',
        marginBottom: `${bubbleMargin}px`
      }"
    >
      <!-- Message Content Box -->
      <div
        :style="{
          background: currentTone.bg,
          color: currentTone.fg,
          border: `1.5px solid ${currentTone.border}`,
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          fontSize: 'var(--fs-body)',
          fontFamily: 'var(--font-sans)',
          lineHeight: 'var(--lh-normal)',
          fontWeight: 'var(--fw-medium)',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '280px'
        }"
      >
        <slot />
      </div>

      <!-- Bubble Pointer Tip -->
      <span
        :style="{
          position: 'absolute',
          left: '-7px',
          bottom: '14px',
          width: '14px',
          height: '14px',
          background: currentTone.bg,
          borderLeft: `1.5px solid ${currentTone.border}`,
          borderBottom: `1.5px solid ${currentTone.border}`,
          transform: 'rotate(45deg)'
        }"
      />
    </div>
  </div>
</template>
