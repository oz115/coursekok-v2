<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: number
    readonly?: boolean
    showValue?: boolean
    count?: number | null
    size?: number
  }>(),
  {
    modelValue: 0,
    readonly: false,
    showValue: false,
    count: null,
    size: 18,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<template>
  <div style="display: inline-flex; align-items: center; gap: 4px">
    <button
      v-for="value in 5"
      :key="value"
      type="button"
      :disabled="readonly"
      @click="emit('update:modelValue', value)"
      :style="{
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: readonly ? 'default' : 'pointer',
        color: value <= Math.round(modelValue) ? 'var(--amber-500)' : 'var(--gray-300)',
        fontSize: `${size}px`,
        lineHeight: 1,
      }"
    >
      ★
    </button>
    <span v-if="showValue" style="font-size: var(--fs-caption); color: var(--text-muted)">
      {{ modelValue.toFixed(1) }}<template v-if="count != null"> ({{ count }})</template>
    </span>
  </div>
</template>
