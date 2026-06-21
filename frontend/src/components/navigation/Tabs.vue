<script setup>
import { computed, useAttrs, watchEffect } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const modelValue = defineModel({
  default: undefined
})

// 만약 modelValue가 없으면 첫 번째 아이템의 value로 초기값 설정
watchEffect(() => {
  if (modelValue.value === undefined && props.items && props.items.length > 0) {
    modelValue.value = props.items[0].value
  }
})

const attrs = useAttrs()
const rootStyle = computed(() => {
  return [
    {
      display: 'flex',
      gap: 'var(--space-6)',
      borderBottom: '1.5px solid var(--border)',
    },
    attrs.style
  ]
})

const select = (val) => {
  modelValue.value = val
}
</script>

<template>
  <div role="tablist" :class="$attrs.class" :style="rootStyle">
    <button
      v-for="item in items"
      :key="item.value"
      role="tab"
      :aria-selected="item.value === modelValue"
      @click="select(item.value)"
      style="
        position: relative;
        appearance: none;
        border: none;
        background: none;
        padding: 12px 2px;
        cursor: pointer;
        font-size: var(--fs-body);
        font-family: var(--font-sans);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: color var(--dur-fast) var(--ease-out);
      "
      :style="{
        fontWeight: item.value === modelValue ? 'var(--fw-bold)' : 'var(--fw-medium)',
        color: item.value === modelValue ? 'var(--text-primary)' : 'var(--text-muted)'
      }"
    >
      {{ item.label }}
      <span
        v-if="item.count != null"
        :style="{
          fontSize: '12px',
          fontWeight: 'var(--fw-bold)',
          color: item.value === modelValue ? 'var(--primary)' : 'var(--text-muted)',
          transition: 'color var(--dur-fast) var(--ease-out)'
        }"
      >
        {{ item.count }}
      </span>

      <!-- Active Underline indicator -->
      <span
        :style="{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '-1.5px',
          height: '3px',
          borderRadius: '3px 3px 0 0',
          background: item.value === modelValue ? 'var(--primary)' : 'transparent',
          transition: 'background var(--dur-fast) var(--ease-out)'
        }"
      />
    </button>
  </div>
</template>
