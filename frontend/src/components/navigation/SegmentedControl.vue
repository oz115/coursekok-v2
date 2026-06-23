<script setup lang="ts">
import { computed, watchEffect } from 'vue'

type Option = string | { value: string; label: string }

const props = withDefaults(
  defineProps<{
    options?: Option[]
    size?: 'sm' | 'md'
  }>(),
  {
    options: () => [],
    size: 'md',
  },
)

const modelValue = defineModel<string | undefined>({ default: undefined })

const opts = computed(() =>
  props.options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option)),
)

watchEffect(() => {
  if (modelValue.value === undefined && opts.value.length > 0) {
    modelValue.value = opts.value[0]?.value
  }
})

const height = computed(() => (props.size === 'sm' ? 34 : 40))
</script>

<template>
  <div
    :style="{
      display: 'inline-flex',
      gap: '3px',
      padding: '4px',
      background: 'var(--gray-100)',
      borderRadius: 'var(--radius-pill)',
      minHeight: `${height}px`,
    }"
  >
    <button
      v-for="option in opts"
      :key="option.value"
      type="button"
      @click="modelValue = option.value"
      :style="{
        border: 'none',
        borderRadius: 'var(--radius-pill)',
        padding: props.size === 'sm' ? '0 12px' : '0 16px',
        background: modelValue === option.value ? 'var(--surface)' : 'transparent',
        color: modelValue === option.value ? 'var(--coral-600)' : 'var(--text-secondary)',
        fontWeight: 700,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        boxShadow: modelValue === option.value ? 'var(--shadow-xs)' : 'none',
      }"
    >
      {{ option.label }}
    </button>
  </div>
</template>
