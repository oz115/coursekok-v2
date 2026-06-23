<script setup>
import { computed, useAttrs } from 'vue'
import KkIcon from '../icons/KkIcon.vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  /** 노출할 알림 메시지 */
  message: {
    type: String,
    required: true
  },
  /** 톤 스타일 변형: default | success | ai */
  tone: {
    type: String,
    default: 'default',
    validator: v => ['default', 'success', 'ai'].includes(v)
  },
  /** 아이콘 이름 (KkIcon에 등록된 명칭, e.g. 'check') */
  icon: {
    type: String,
    default: ''
  },
  /** 액션 버튼 정보: { label: string, onClick: function } */
  action: {
    type: Object,
    default: null
  }
})

const tones = {
  default: {
    bg: 'var(--gray-900)',
    fg: '#fff',
    accent: 'var(--coral-400)'
  },
  success: {
    bg: 'var(--gray-900)',
    fg: '#fff',
    accent: 'var(--mint-400)'
  },
  ai: {
    bg: 'var(--gray-900)',
    fg: '#fff',
    accent: 'var(--sky-400)'
  }
}

const currentTone = computed(() => tones[props.tone] || tones.default)

const attrs = useAttrs()
const rootStyle = computed(() => {
  return [
    {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      maxWidth: '420px',
      background: currentTone.value.bg,
      color: currentTone.value.fg,
      borderRadius: 'var(--radius-pill)',
      boxShadow: 'var(--shadow-lg)',
      fontFamily: 'var(--font-sans)',
      animation: 'kok-fade-up var(--dur-base) var(--ease-out)'
    },
    attrs.style
  ]
})
</script>

<template>
  <div role="status" :class="$attrs.class" :style="rootStyle">
    <!-- Icon Circle Indicator -->
    <span
      v-if="$slots.icon || icon"
      :style="{
        width: '24px',
        height: '24px',
        flex: 'none',
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: currentTone.accent,
        color: 'var(--gray-900)'
      }"
    >
      <slot name="icon">
        <KkIcon v-if="icon" :name="icon" :size="14" />
      </slot>
    </span>

    <!-- Message Text -->
    <span
      style="
        font-size: var(--fs-body);
        font-weight: var(--fw-medium);
        line-height: 1.3;
      "
    >
      {{ message }}
    </span>

    <!-- Action Text Button -->
    <button
      v-if="action && action.label"
      type="button"
      @click="action.onClick"
      style="
        margin-left: 4px;
        border: none;
        background: none;
        cursor: pointer;
        font-weight: var(--fw-bold);
        font-size: var(--fs-body-sm);
        font-family: var(--font-sans);
        white-space: nowrap;
        transition: opacity var(--dur-fast) var(--ease-out);
      "
      :style="{
        color: currentTone.accent
      }"
      @mouseenter="e => e.target.style.opacity = '0.85'"
      @mouseleave="e => e.target.style.opacity = '1'"
    >
      {{ action.label }}
    </button>
  </div>
</template>
