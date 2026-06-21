<script setup>
import { computed, useAttrs, watchEffect } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md'].includes(v)
  }
})

const modelValue = defineModel({
  default: undefined
})

const opts = computed(() => {
  return props.options.map(o => typeof o === 'string' ? { value: o, label: o } : o)
})

// modelValue가 설정되지 않았다면 첫 번째 옵션을 디폴트로 지정
watchEffect(() => {
  if (modelValue.value === undefined && opts.value && opts.value.length > 0) {
    modelValue.value = opts.value[0].value
  }
})

const activeIndex = computed(() => {
  return Math.max(0, opts.value.findIndex(o => o.value === modelValue.value))
})

const attrs = useAttrs()
const h = computed(() => props.size === 'sm' ? 34 : 40)

const rootStyle = computed(() => {
  return [
    {
      position: 'relative',
      display: 'inline-flex',
      padding: '4px',
      background: 'var(--gray-100)',
      borderRadius: 'var(--radius-pill)',
      height: `${h.value}px`,
      boxSizing: 'border-box'
    },
    attrs.style
  ]
})

const thumbStyle = computed(() => {
  const len = opts.value.length || 1
  return {
    position: 'absolute',
    top: '4px',
    bottom: '4px',
    left: '4px',
    width: `calc((100% - 8px) / ${len})`,
    transform: `translateX(${activeIndex.value * 100}%)`,
    background: 'var(--surface)',
    borderRadius: 'var(--radius-pill)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'transform var(--dur-base) var(--ease-spring)'
  }
})

const select = (val) => {
  modelValue.value = val
}
</script>

<template>
  <div :class="$attrs.class" :style="rootStyle">
    <!-- Sliding coral/surface background thumb -->
    <span aria-hidden="true" :style="thumbStyle" />

    <!-- Segments -->
    <button
      v-for="o in opts"
      :key="o.value"
      type="button"
      @click="select(o.value)"
      style="
        position: relative;
        z-index: 1;
        flex: 1;
        border: none;
        background: none;
        cursor: pointer;
        padding: 0 16px;
        font-family: var(--font-sans);
        white-space: nowrap;
        transition: color var(--dur-fast) var(--ease-out);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      "
      :style="{
        fontSize: size === 'sm' ? 'var(--fs-body-sm)' : 'var(--fs-body)',
        fontWeight: o.value === modelValue ? 'var(--fw-bold)' : 'var(--fw-medium)',
        color: o.value === modelValue ? 'var(--text-primary)' : 'var(--text-muted)'
      }"
    >
      {{ o.label }}
    </button>
  </div>
</template>
