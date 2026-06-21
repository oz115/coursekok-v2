<script setup>
/**
 * IconStar
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

const svgInner = `<path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.3l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z"/>`
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
