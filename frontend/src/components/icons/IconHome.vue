<script setup>
/**
 * IconHome
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

const svgInner = `<path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/>`
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
