<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: string
    size?: number
    pop?: boolean
  }>(),
  {
    variant: 'default',
    size: 96,
    pop: false,
  },
)
</script>

<template>
  <div
    :class="{ pop }"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: variant === 'guide' ? 'var(--sky-100)' : variant === 'cheer' ? 'var(--mint-100)' : 'var(--coral-100)',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--coral-600)',
      fontWeight: 900,
      fontSize: `${Math.max(18, size / 4)}px`,
      boxShadow: 'var(--shadow-md)',
      flex: 'none',
    }"
    aria-hidden="true"
  >
    K
  </div>
</template>

<style scoped>
.pop {
  animation: kok-pop 480ms var(--ease-spring);
}
</style>
