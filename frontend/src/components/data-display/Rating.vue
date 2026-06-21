<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 5
  },
  size: {
    type: [Number, String],
    default: 18
  },
  showValue: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: null
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const hover = ref(null)
const display = computed(() => hover.value != null ? hover.value : props.modelValue)

const handleRate = (val) => {
  if (!props.readonly) {
    emit('update:modelValue', val)
  }
}

const handleMouseEnter = (val) => {
  if (!props.readonly) {
    hover.value = val
  }
}
</script>

<template>
  <span
    :style="{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    }"
  >
    <span
      style="display: inline-flex; gap: 2px"
      @mouseleave="hover = null"
    >
      <svg
        v-for="i in max"
        :key="i"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        :style="{
          cursor: !readonly ? 'pointer' : 'default',
          display: 'block',
          flex: 'none'
        }"
        :fill="(i - 1) < Math.round(display) ? 'var(--star)' : 'var(--gray-200)'"
        @mouseenter="handleMouseEnter(i)"
        @click="handleRate(i)"
      >
        <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.3l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z" />
      </svg>
    </span>
    
    <b
      v-if="showValue"
      style="font-size: var(--fs-body-sm); font-weight: var(--fw-bold); color: var(--text-primary)"
    >
      {{ modelValue.toFixed(1) }}
    </b>
    <span
      v-if="count != null"
      style="font-size: var(--fs-caption); color: var(--text-muted)"
    >
      ({{ count.toLocaleString() }})
    </span>
  </span>
</template>
