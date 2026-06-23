<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  size: {
    type: [Number, String],
    default: 40
  },
  ring: {
    type: Boolean,
    default: false
  }
})

const err = ref(false)
const initial = computed(() => props.name.trim().charAt(0).toUpperCase() || '?')
const palette = ['var(--coral-500)', 'var(--sky-500)', 'var(--mint-500)', 'var(--amber-500)']
const bg = computed(() => palette[(props.name.charCodeAt(0) || 0) % palette.length])
const sizeNum = computed(() => Number(props.size))
</script>

<template>
  <span
    :style="{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${sizeNum}px`,
      height: `${sizeNum}px`,
      flex: 'none',
      borderRadius: '50%',
      overflow: 'hidden',
      background: bg,
      color: '#fff',
      fontWeight: 'var(--fw-bold)',
      fontSize: `${Math.round(sizeNum * 0.42)}px`,
      fontFamily: 'var(--font-sans)',
      boxShadow: ring ? '0 0 0 2px var(--surface), 0 0 0 4px var(--coral-300)' : 'none'
    }"
  >
    <img
      v-if="src && !err"
      :src="src"
      :alt="name"
      @error="err = true"
      style="width: 100%; height: 100%; object-fit: cover"
    />
    <template v-else>
      {{ initial }}
    </template>
  </span>
</template>
