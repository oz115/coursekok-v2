<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { ICON_NAMES } from './index'
import type { IconName } from './index'

const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number | string
    strokeWidth?: number
    color?: string
  }>(),
  {
    size: 20,
    strokeWidth: 2,
    color: 'currentColor',
  },
)

const componentName = computed(() => `Icon${props.name.charAt(0).toUpperCase()}${props.name.slice(1)}`)
const dynamicIcon = computed(() => {
  if (!ICON_NAMES.includes(props.name)) return null
  return defineAsyncComponent(() => import(/* @vite-ignore */ `./${componentName.value}.vue`))
})
</script>

<template>
  <component
    :is="dynamicIcon"
    v-if="dynamicIcon"
    :size="props.size"
    :stroke-width="props.strokeWidth"
    :color="props.color"
  />
  <span v-else :style="{ display: 'inline-block', width: `${props.size}px`, height: `${props.size}px` }" />
</template>
