<script setup lang="ts">
import Button from '@/components/core/Button.vue'

withDefaults(
  defineProps<{
    tone?: string
    message: string
    icon?: string
    action?: { label: string; onClick: () => void }
  }>(),
  {
    tone: 'default',
    icon: '',
    action: undefined,
  },
)
</script>

<template>
  <div class="toast">
    <span>{{ message }}</span>
    <Button v-if="action" variant="ghost" size="sm" @click="action.onClick">{{ action.label }}</Button>
  </div>
</template>

<style scoped>
.toast {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 8px 12px 8px 16px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-lg);
  color: var(--text-primary);
  font-weight: 700;
}
</style>
