<script setup>
import { ref } from 'vue'

const props = defineProps({
  selected: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: null
  }
})

const hover = ref(false)
</script>

<template>
  <button
    type="button"
    :aria-pressed="selected"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    :style="{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      height: '38px',
      padding: '0 16px',
      fontSize: 'var(--fs-body-sm)',
      fontWeight: 'var(--fw-semibold)',
      fontFamily: 'var(--font-sans)',
      color: selected ? 'var(--coral-700)' : 'var(--text-secondary)',
      background: selected ? 'var(--coral-50)' : hover ? 'var(--gray-50)' : 'var(--surface)',
      border: `1.5px solid ${selected ? 'var(--coral-400)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-pill)',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all var(--dur-fast) var(--ease-out)'
    }"
  >
    <slot name="left-icon" />
    <slot />
    <span
      v-if="count != null"
      :style="{
        fontSize: '11px',
        fontWeight: 'var(--fw-bold)',
        color: selected ? 'var(--coral-600)' : 'var(--text-muted)'
      }"
    >
      {{ count }}
    </span>
  </button>
</template>
