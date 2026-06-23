<script setup lang="ts">
import Button from '@/components/core/Button.vue'
import Badge from '@/components/core/Badge.vue'

const props = withDefaults(
  defineProps<{
    place?: Record<string, any> | null
    saved?: boolean
  }>(),
  {
    place: null,
    saved: false,
  },
)

const emit = defineEmits<{
  close: []
  'toggle-save': []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="props.place" class="overlay" @click.self="emit('close')">
      <section class="panel">
        <img :src="props.place.img" :alt="props.place.title" />
        <div class="body">
          <div class="head">
            <Badge tone="coral" solid>{{ props.place.cat }}</Badge>
            <button type="button" @click="emit('close')">Close</button>
          </div>
          <h2>{{ props.place.title }}</h2>
          <p class="region">{{ props.place.region }} - {{ props.place.meta }}</p>
          <p>{{ props.place.desc }}</p>
          <div class="tags">
            <span v-for="tag in props.place.tags" :key="tag">{{ tag }}</span>
          </div>
          <Button variant="primary" :full-width="true" @click="emit('toggle-save')">
            {{ saved ? 'Remove from basket' : 'Add to basket' }}
          </Button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 75;
  display: grid;
  place-items: center;
  padding: 20px;
  background: var(--overlay-scrim);
}

.panel {
  width: min(520px, 94vw);
  overflow: hidden;
  border-radius: var(--radius-2xl);
  background: var(--surface);
  box-shadow: var(--shadow-xl);
}

.panel > img {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.body {
  padding: 20px;
}

.head,
.tags {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.head {
  justify-content: space-between;
}

.head button {
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

h2 {
  margin-top: 12px;
  font-size: 26px;
  font-weight: 800;
}

.region {
  color: var(--text-muted);
  margin: 4px 0 12px;
}

.tags {
  margin: 16px 0;
}

.tags span {
  padding: 5px 9px;
  border-radius: var(--radius-pill);
  background: var(--gray-100);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}
</style>
