<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'ai' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    fullWidth?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    fullWidth: false,
    disabled: false,
    type: 'button',
  },
)

const sizes = {
  sm: { height: 'var(--control-sm)', padding: '0 14px', fontSize: 'var(--fs-body-sm)' },
  md: { height: 'var(--control-md)', padding: '0 20px', fontSize: 'var(--fs-body)' },
  lg: { height: 'var(--control-lg)', padding: '0 28px', fontSize: 'var(--fs-body-lg)' },
} as const

const variants = {
  primary: { bg: 'var(--primary)', color: 'var(--on-primary)', border: 'transparent', shadow: 'var(--shadow-primary)' },
  ai: { bg: 'linear-gradient(120deg, var(--ai-from), var(--ai-to))', color: '#fff', border: 'transparent', shadow: 'var(--shadow-ai)' },
  secondary: { bg: 'var(--surface)', color: 'var(--text-primary)', border: 'var(--border-strong)', shadow: 'var(--shadow-xs)' },
  ghost: { bg: 'transparent', color: 'var(--primary)', border: 'transparent', shadow: 'none' },
  danger: { bg: 'var(--danger)', color: 'var(--on-danger)', border: 'transparent', shadow: 'none' },
} as const

const rootStyle = computed(() => {
  const size = sizes[props.size]
  const variant = variants[props.variant]

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: size.height,
    padding: size.padding,
    width: props.fullWidth ? '100%' : 'auto',
    fontSize: size.fontSize,
    fontWeight: 'var(--fw-semibold)',
    fontFamily: 'var(--font-sans)',
    color: variant.color,
    background: variant.bg,
    border: `1.5px solid ${variant.border}`,
    borderRadius: 'var(--radius-pill)',
    boxShadow: props.disabled ? 'none' : variant.shadow,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    opacity: props.disabled ? 0.5 : 1,
    whiteSpace: 'nowrap',
  }
})
</script>

<template>
  <button :type="type" :disabled="disabled" :style="rootStyle">
    <slot name="left-icon" />
    <slot />
    <slot name="right-icon" />
  </button>
</template>
