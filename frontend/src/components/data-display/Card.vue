<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    padding?: 'none' | 'sm' | 'md' | 'lg'
    interactive?: boolean
  }>(),
  {
    padding: 'md',
    interactive: false,
  },
)

const paddingMap = {
  none: '0',
  sm: '12px',
  md: '18px',
  lg: '24px',
} as const
</script>

<template>
  <div
    :style="{
      padding: paddingMap[props.padding],
      background: 'var(--surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      cursor: interactive ? 'pointer' : 'default',
      overflow: 'hidden',
    }"
  >
    <slot />
  </div>
</template>
