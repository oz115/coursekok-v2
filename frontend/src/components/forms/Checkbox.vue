<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: ''
  }
})

const modelValue = defineModel({
  type: Boolean,
  default: false
})

const autoId = `checkbox-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || autoId)

const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { class: _, style: __, ...rest } = attrs
  return rest
})
</script>

<template>
  <label
    :class="$attrs.class"
    :style="[{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontSize: 'var(--fs-body)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)'
    }, $attrs.style]"
  >
    <span style="position: relative; display: inline-flex; width: 22px; height: 22px; flex: none">
      <input
        :id="inputId"
        type="checkbox"
        v-bind="inputAttrs"
        v-model="modelValue"
        :disabled="disabled"
        style="position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: inherit"
      />
      <span
        aria-hidden="true"
        :style="{
          width: '22px',
          height: '22px',
          borderRadius: 'var(--radius-xs)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: modelValue ? 'var(--primary)' : 'var(--surface)',
          border: `1.5px solid ${modelValue ? 'var(--primary)' : 'var(--border-strong)'}`,
          transition: 'all var(--dur-fast) var(--ease-spring)'
        }"
      >
        <svg
          v-if="modelValue"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          stroke-width="3.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    </span>
    <span v-if="label">{{ label }}</span>
  </label>
</template>
