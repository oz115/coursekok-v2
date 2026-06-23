<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    size?: 'sm' | 'md' | 'lg'
    variant?: 'soft' | 'solid' | 'ghost' | 'glass'
    disabled?: boolean
  }>(),
  {
    label: '',
    size: 'md',
    variant: 'soft',
    disabled: false,
  },
)

const sizes = { sm: 32, md: 40, lg: 48 } as const
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :disabled="disabled"
    :style="{
      width: `${sizes[size]}px`,
      height: `${sizes[size]}px`,
      borderRadius: '50%',
      border: variant === 'ghost' ? 'none' : '1px solid var(--border)',
      background: variant === 'solid' ? 'var(--primary)' : variant === 'ghost' ? 'transparent' : 'var(--surface)',
      color: variant === 'solid' ? '#fff' : 'var(--text-secondary)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }"
  >
    <slot />
  </button>
</template>
