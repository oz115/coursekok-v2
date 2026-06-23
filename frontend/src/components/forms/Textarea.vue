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
  rows: {
    type: Number,
    default: 4
  },
  maxLength: {
    type: Number,
    default: undefined
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
const autoId = `textarea-${Math.random().toString(36).substring(2, 9)}`
const inputId = computed(() => props.id || autoId)

const borderColor = computed(() =>
  props.error ? 'var(--danger)' : focus.value ? 'var(--coral-400)' : 'var(--border)'
)

const len = computed(() => (modelValue.value ? modelValue.value.length : 0))

const attrs = useAttrs()
const textareaAttrs = computed(() => {
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
    
    <textarea
      :id="inputId"
      v-bind="textareaAttrs"
      v-model="modelValue"
      :rows="rows"
      :maxlength="maxLength"
      :disabled="disabled"
      @focus="focus = true"
      @blur="focus = false"
      :style="{
        width: '100%',
        resize: 'vertical',
        padding: '12px 14px',
        fontSize: 'var(--fs-body)',
        fontFamily: 'var(--font-sans)',
        lineHeight: 'var(--lh-relaxed)',
        color: 'var(--text-primary)',
        background: disabled ? 'var(--gray-50)' : 'var(--surface)',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        outline: 'none',
        boxShadow: focus && !error ? '0 0 0 3px var(--coral-100)' : 'none',
        transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
      }"
    />
    
    <div style="display: flex; justify-content: space-between">
      <span :style="{ fontSize: 'var(--fs-caption)', color: error ? 'var(--danger)' : 'var(--text-muted)' }">
        {{ error || hint }}
      </span>
      <span v-if="maxLength !== undefined" style="font-size: var(--fs-caption); color: var(--text-muted)">
        {{ len }}/{{ maxLength }}
      </span>
    </div>
  </div>
</template>
