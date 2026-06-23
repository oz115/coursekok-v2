<script setup lang="ts">
import { computed, ref } from 'vue'
import Badge from '@/components/core/Badge.vue'
import type { PlanDay, PlanItem } from '@/data/mockData'

const props = withDefaults(
  defineProps<{
    days: PlanDay[]
    activeDay?: number | 'all'
    height?: number
  }>(),
  {
    activeDay: 'all',
    height: 360,
  },
)

const emit = defineEmits<{
  select: [item: PlanItem | null]
}>()

const selected = ref<{ dayIndex: number; itemIndex: number } | null>(null)

const visibleDays = computed(() =>
  props.activeDay === 'all' ? props.days.map((_, index) => index) : [props.activeDay],
)

const point = (index: number) => ({
  x: 14 + ((index * 17) % 72),
  y: 20 + ((index * 23) % 42),
})

function toggle(dayIndex: number, itemIndex: number) {
  const same = selected.value?.dayIndex === dayIndex && selected.value?.itemIndex === itemIndex
  selected.value = same ? null : { dayIndex, itemIndex }
  emit('select', selected.value ? props.days[dayIndex]?.items[itemIndex] ?? null : null)
}
</script>

<template>
  <div
    :style="{
      position: 'relative',
      height: `${height}px`,
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-subtle)',
      background: 'linear-gradient(135deg, var(--sky-50), var(--mint-50))',
      overflow: 'hidden',
    }"
  >
    <svg viewBox="0 0 100 72" preserveAspectRatio="none" style="position: absolute; inset: 0; width: 100%; height: 100%">
      <template v-for="dayIndex in visibleDays" :key="dayIndex">
        <polyline
          :points="days[dayIndex]?.items.map((_, index) => `${point(index).x},${point(index).y}`).join(' ')"
          fill="none"
          stroke="var(--coral-300)"
          stroke-width="1.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />
      </template>
    </svg>

    <template v-for="dayIndex in visibleDays" :key="`pins-${dayIndex}`">
      <button
        v-for="(item, itemIndex) in days[dayIndex]?.items"
        :key="`${dayIndex}-${itemIndex}`"
        type="button"
        @click="toggle(dayIndex, itemIndex)"
        :style="{
          position: 'absolute',
          left: `${point(itemIndex).x}%`,
          top: `${point(itemIndex).y}%`,
          transform: 'translate(-50%, -50%)',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: '2px solid var(--surface)',
          background: selected?.dayIndex === dayIndex && selected?.itemIndex === itemIndex ? 'var(--coral-600)' : 'var(--coral-500)',
          color: '#fff',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-md)',
        }"
      >
        {{ itemIndex + 1 }}
      </button>
    </template>

    <div style="position: absolute; left: 16px; right: 16px; bottom: 16px; display: flex; gap: 8px; flex-wrap: wrap">
      <Badge v-for="dayIndex in visibleDays" :key="`legend-${dayIndex}`" tone="coral" size="sm">
        Day {{ days[dayIndex]?.day }} - {{ days[dayIndex]?.theme }}
      </Badge>
    </div>
  </div>
</template>
