<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'soft',
    validator: v => ['soft', 'solid', 'ghost', 'glass'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v)
  },
  round: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const hover = ref(false)
const pressed = ref(false)

const sizes = { sm: 32, md: 40, lg: 48 }
const dim = computed(() => sizes[props.size] || sizes.md)

const palettes = computed(() => {
  const h = hover.value
  const ps = {
    soft: {
      bg: h ? 'var(--gray-100)' : 'var(--gray-50)',
      color: 'var(--text-secondary)',
      border: 'transparent',
      shadow: 'none'
    },
    solid: {
      bg: h ? 'var(--primary-hover)' : 'var(--primary)',
      color: 'var(--on-primary)',
      border: 'transparent',
      shadow: 'var(--shadow-sm)'
    },
    ghost: {
      bg: h ? 'var(--gray-50)' : 'transparent',
      color: 'var(--text-secondary)',
      border: 'transparent',
      shadow: 'none'
    },
    glass: {
      bg: h ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.82)',
      color: 'var(--gray-900)',
      border: 'transparent',
      shadow: 'var(--shadow-sm)',
      blur: true
    }
  }
  return ps[props.variant] || ps.soft
})
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    @mouseenter="hover = true"
    @mouseleave="hover = false; pressed = false"
    @mousedown="pressed = true"
    @mouseup="pressed = false"
    :style="{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${dim}px`,
      height: `${dim}px`,
      flex: 'none',
      color: palettes.color,
      background: palettes.bg,
      border: `1px solid ${palettes.border}`,
      borderRadius: round ? 'var(--radius-pill)' : 'var(--radius-md)',
      boxShadow: palettes.shadow,
      backdropFilter: palettes.blur ? 'blur(8px)' : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transform: pressed && !disabled ? 'scale(0.92)' : 'scale(1)',
      transition: 'transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-out)'
    }"
  >
    <slot />
  </button>
</template>
