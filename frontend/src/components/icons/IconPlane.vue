<script setup lang="ts">
/**
 * IconPlane
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

const svgInner = `<path d="M10.2 4.2a1.4 1.4 0 0 1 2.4 0l1.6 5.1 6 2.4a1 1 0 0 1 0 1.8l-6 2.4-1.6 5.1a1.4 1.4 0 0 1-2.4 0L8.6 16l-3.4-.4a1 1 0 0 1-.6-1.7L7 12 5 9.9a1 1 0 0 1 .6-1.7L9 7.8z"/>`
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
