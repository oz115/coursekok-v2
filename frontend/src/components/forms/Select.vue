<script setup>
import { ref, computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
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

const modelValue = defineModel()

const focus = ref(false)
const autoId = `select-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || autoId)

const heights = {
  sm: 'var(--control-sm)',
  md: 'var(--control-md)',
  lg: 'var(--control-lg)'
}

const borderColor = computed(() =>
  props.error ? 'var(--danger)' : focus.value ? 'var(--coral-400)' : 'var(--border)'
)

const attrs = useAttrs()
const selectAttrs = computed(() => {
  const { class: _, style: __, ...rest } = attrs
  return rest
})
</script>

<template>
  <div :class="$attrs.class" :style="[{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }, $attrs.style]">
    <label
      v-if="label"
      :for="inputId"
      style="font-size: var(--fs-body-sm); font-weight: var(--fw-semibold); color: var(--text-secondary)"
    >
      {{ label }}
    </label>
    
    <div
      :style="{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: heights[size],
        background: disabled ? 'var(--gray-50)' : 'var(--surface)',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focus && !error ? '0 0 0 3px var(--coral-100)' : 'none',
        transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
        opacity: disabled ? 0.6 : 1
      }"
    >
      <select
        :id="inputId"
        v-bind="selectAttrs"
        v-model="modelValue"
        :disabled="disabled"
        @focus="focus = true"
        @blur="focus = false"
        style="appearance: none; -webkit-appearance: none; border: none; outline: none; background: transparent; width: 100%; height: 100%; padding: 0 38px 0 14px; font-size: var(--fs-body); font-family: var(--font-sans); color: var(--text-primary); cursor: pointer"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="o in options"
          :key="typeof o === 'string' ? o : o.value"
          :value="typeof o === 'string' ? o : o.value"
        >
          {{ typeof o === 'string' ? o : o.label }}
        </option>
      </select>
      
      <svg
        style="position: absolute; right: 14px; pointer-events: none"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text-muted)"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
    
    <span
      v-if="hint || error"
      :style="{ fontSize: 'var(--fs-caption)', color: error ? 'var(--danger)' : 'var(--text-muted)' }"
    >
      {{ error || hint }}
    </span>
  </div>
</template>
