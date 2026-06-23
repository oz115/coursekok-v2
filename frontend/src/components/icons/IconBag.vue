<script setup lang="ts">
/**
 * IconBag
 * Lucide-style icon ??24횞24 viewBox, stroke="currentColor"
 * Auto-generated from coursekok raw-wireframe icon set.
 *
 * Props:
 *   size        (Number|String) ??px ?⑥쐞, default 20
 *   strokeWidth (Number)        ??default 2
 *   color       (String)        ??default 'currentColor'
 */
const props = defineProps({
  size:        { type: [Number, String], default: 20 },
  strokeWidth: { type: Number,           default: 2  },
  color:       { type: String,           default: 'currentColor' },
})

const svgInner = `<path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>`
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="props.color"
    :stroke-width="props.strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    style="display: block; flex-shrink: 0;"
    v-html="svgInner"
  />
</template>
