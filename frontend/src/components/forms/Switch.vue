<script setup lang="ts">
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

const autoId = `switch-${Math.random().toString(36).substring(2, 9)}`
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
    <span style="position: relative; display: inline-flex; width: 46px; height: 28px; flex: none">
      <input
        :id="inputId"
        type="checkbox"
        role="switch"
        v-bind="inputAttrs"
        v-model="modelValue"
        :disabled="disabled"
        style="position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: inherit"
      />
      <span
        aria-hidden="true"
        :style="{
          width: '46px',
          height: '28px',
          borderRadius: 'var(--radius-pill)',
          background: modelValue ? 'var(--primary)' : 'var(--gray-300)',
          transition: 'background var(--dur-base) var(--ease-out)'
        }"
      />
      <span
        aria-hidden="true"
        :style="{
          position: 'absolute',
          top: '3px',
          left: modelValue ? '21px' : '3px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: '#fff',
          boxShadow: 'var(--shadow-sm)',
          transition: 'left var(--dur-base) var(--ease-spring)'
        }"
      />
    </span>
    <span v-if="label">{{ label }}</span>
  </label>
</template>
