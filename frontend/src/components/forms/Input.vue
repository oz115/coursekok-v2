<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    label?: string
    hint?: string
    error?: string
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    id?: string
  }>(),
  {
    label: '',
    hint: '',
    error: '',
    size: 'md',
    disabled: false,
    id: '',
  },
)

const modelValue = defineModel<string>({ default: '' })
const attrs = useAttrs()
const focused = ref(false)
const autoId = `input-${Math.random().toString(36).slice(2, 9)}`
const inputId = computed(() => props.id || autoId)
const heights = { sm: 'var(--control-sm)', md: 'var(--control-md)', lg: 'var(--control-lg)' } as const
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
</script>

<template>
  <div :class="$attrs.class" :style="$attrs.style" class="field">
    <label v-if="label" :for="inputId">{{ label }}</label>
    <div
      class="control"
      :style="{
        height: heights[size],
        borderColor: error ? 'var(--danger)' : focused ? 'var(--coral-400)' : 'var(--border)',
        opacity: disabled ? 0.6 : 1,
      }"
    >
      <slot name="left-icon" />
      <input
        :id="inputId"
        v-bind="inputAttrs"
        v-model="modelValue"
        :disabled="disabled"
        @focus="focused = true"
        @blur="focused = false"
      />
      <slot name="right-icon" />
    </div>
    <span v-if="hint || error" :class="{ error: Boolean(error) }">{{ error || hint }}</span>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

label {
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
}

.control {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
}

input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
}

span {
  font-size: var(--fs-caption);
  color: var(--text-muted);
}

span.error {
  color: var(--danger);
}
</style>
