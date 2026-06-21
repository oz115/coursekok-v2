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

const modelValue = defineModel({
  type: String,
  default: ''
})

const focus = ref(false)
const autoId = `input-${Math.random().toString(36).substring(2, 9)}`
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
const inputAttrs = computed(() => {
  const { class: _, style: __, ...rest } = attrs
  return rest
})
</script>

<template>
  <div :class="$attrs.class" :style="[{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }, $attrs.style]">
    <label
      v-if="label"
      :for="inputId"
      style="font-size: var(--fs-body-sm); font-weight: var(--fw-semibold); color: var(--text-secondary); font-family: var(--font-sans)"
    >
      {{ label }}
    </label>
    
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        height: heights[size],
        padding: '0 14px',
        background: disabled ? 'var(--gray-50)' : 'var(--surface)',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focus && !error ? '0 0 0 3px var(--coral-100)' : 'none',
        transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
        opacity: disabled ? 0.6 : 1
      }"
    >
      <span v-if="$slots['left-icon']" style="color: var(--text-muted); display: inline-flex">
        <slot name="left-icon" />
      </span>
      
      <input
        :id="inputId"
        v-bind="inputAttrs"
        v-model="modelValue"
        :disabled="disabled"
        @focus="focus = true"
        @blur="focus = false"
        style="flex: 1; border: none; outline: none; background: transparent; font-size: var(--fs-body); font-family: var(--font-sans); color: var(--text-primary); min-width: 0"
      />
      
      <span v-if="$slots['right-icon']" style="color: var(--text-muted); display: inline-flex">
        <slot name="right-icon" />
      </span>
    </div>
    
    <span
      v-if="hint || error"
      :style="{ fontSize: 'var(--fs-caption)', color: error ? 'var(--danger)' : 'var(--text-muted)' }"
    >
      {{ error || hint }}
    </span>
  </div>
</template>
