<script setup lang="ts">
type Option = string | { value: string; label: string }

withDefaults(
  defineProps<{
    label?: string
    options?: Option[]
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
  }>(),
  {
    label: '',
    options: () => [],
    size: 'md',
    disabled: false,
  },
)

const modelValue = defineModel<string>({ default: '' })
const heights = { sm: 'var(--control-sm)', md: 'var(--control-md)', lg: 'var(--control-lg)' } as const
const normalize = (option: Option) => (typeof option === 'string' ? { value: option, label: option } : option)
</script>

<template>
  <label class="field">
    <span v-if="label">{{ label }}</span>
    <select v-model="modelValue" :disabled="disabled" :style="{ height: heights[size] }">
      <option v-for="option in options.map(normalize)" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

span {
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
}

select {
  padding: 0 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
  font: inherit;
}
</style>
