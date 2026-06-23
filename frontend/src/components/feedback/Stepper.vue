<script setup lang="ts">
withDefaults(
  defineProps<{
    steps: number
    current: number
  }>(),
  {
    steps: 1,
    current: 0,
  },
)
</script>

<template>
  <div class="stepper" role="progressbar" :aria-valuenow="current + 1" :aria-valuemin="1" :aria-valuemax="steps">
    <span
      v-for="index in steps"
      :key="index"
      :class="{ active: index - 1 <= current }"
    />
  </div>
</template>

<style scoped>
.stepper {
  display: inline-flex;
  gap: 6px;
}

.stepper span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gray-200);
}

.stepper span.active {
  background: var(--coral-500);
}
</style>
