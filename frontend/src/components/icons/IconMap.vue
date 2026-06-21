<script setup>
/**
 * IconMap
 * Lucide-style icon — 24×24 viewBox, stroke="currentColor"
 * Auto-generated from coursekok raw-wireframe icon set.
 *
 * Props:
 *   size        (Number|String) — px 단위, default 20
 *   strokeWidth (Number)        — default 2
 *   color       (String)        — default 'currentColor'
 */
const props = defineProps({
  size:        { type: [Number, String], default: 20 },
  strokeWidth: { type: Number,           default: 2  },
  color:       { type: String,           default: 'currentColor' },
})

const svgInner = `<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14"/><path d="M15 6v14"/>`
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
