<script setup lang="ts">
import Mascot from './Mascot.vue'

withDefaults(
  defineProps<{
    variant?: string
    tone?: 'default' | 'coral' | 'ai'
    size?: number
  }>(),
  {
    variant: 'default',
    tone: 'default',
    size: 70,
  },
)
</script>

<template>
  <div class="bubble-row">
    <Mascot :variant="variant" :size="size" />
    <div :class="['bubble', tone]">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.bubble-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.bubble {
  padding: 12px 14px;
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.bubble.coral {
  background: var(--coral-50);
  border-color: var(--coral-100);
}

.bubble.ai {
  background: var(--sky-50);
  border-color: var(--sky-100);
}
</style>
