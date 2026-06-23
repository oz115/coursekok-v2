<script setup>
/**
 * IconWalk
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

const svgInner = `<circle cx="13" cy="4.5" r="1.6"/><path d="M11 8l2.5-1 2 3 2 1"/><path d="M13.5 7l-1 4 2 2 1 5"/><path d="M12.5 11l-3 2-1 4"/>`
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
