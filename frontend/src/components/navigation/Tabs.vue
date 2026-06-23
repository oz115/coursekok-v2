<script setup lang="ts">
interface TabItem {
  value: string
  label: string
  count?: number
}

withDefaults(
  defineProps<{
    items?: TabItem[]
  }>(),
  {
    items: () => [],
  },
)

const modelValue = defineModel<string>({ default: '' })
</script>

<template>
  <div class="tabs">
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      :class="{ active: modelValue === item.value }"
      @click="modelValue = item.value"
    >
      {{ item.label }}
      <span v-if="item.count != null">{{ item.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: var(--radius-pill);
  background: var(--gray-100);
}

button {
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-sans);
  font-weight: 700;
  padding: 8px 14px;
}

button.active {
  background: var(--surface);
  color: var(--coral-600);
  box-shadow: var(--shadow-xs);
}

span {
  margin-left: 5px;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
