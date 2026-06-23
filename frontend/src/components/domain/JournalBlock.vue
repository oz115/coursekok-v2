<script setup lang="ts">
import { computed, ref } from 'vue'
import Rating from '@/components/data-display/Rating.vue'
import Button from '@/components/core/Button.vue'
import type { JournalEntry } from '@/data/mockData'

const props = withDefaults(
  defineProps<{
    entries?: JournalEntry[]
  }>(),
  {
    entries: () => [],
  },
)

const emit = defineEmits<{
  'update:entries': [entries: JournalEntry[]]
}>()

const text = ref('')
const rating = ref(5)
const photos = ref<string[]>([])
const canSave = computed(() => text.value.trim().length > 0 || photos.value.length > 0)

function addEntry() {
  if (!canSave.value) return
  emit('update:entries', [
    ...props.entries,
    {
      id: `j_${Date.now()}`,
      text: text.value.trim(),
      rating: rating.value,
      photos: [...photos.value],
      date: new Date().toLocaleDateString(),
    },
  ])
  text.value = ''
  rating.value = 5
  photos.value = []
}

function removeEntry(id: string) {
  emit('update:entries', props.entries.filter((entry) => entry.id !== id))
}

function onPhotoInput(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? []).slice(0, 4 - photos.value.length)
  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') photos.value = [...photos.value, reader.result]
    }
    reader.readAsDataURL(file)
  })
  input.value = ''
}
</script>

<template>
  <div class="journal">
    <article v-for="entry in entries" :key="entry.id" class="entry">
      <div class="entry-head">
        <Rating :model-value="entry.rating" readonly :size="14" />
        <span>{{ entry.date }}</span>
        <button type="button" @click="removeEntry(entry.id)">Delete</button>
      </div>
      <p>{{ entry.text }}</p>
      <div v-if="entry.photos.length" class="photos">
        <img v-for="photo in entry.photos" :key="photo" :src="photo" alt="" />
      </div>
    </article>

    <div class="editor">
      <Rating v-model="rating" :size="22" />
      <textarea v-model="text" rows="2" placeholder="Write a note..." />
      <div class="editor-row">
        <label>
          Add photos
          <input type="file" accept="image/*" multiple @change="onPhotoInput" />
        </label>
        <Button variant="primary" :disabled="!canSave" @click="addEntry">Save note</Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.journal {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entry,
.editor {
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border-subtle);
}

.entry-head,
.editor-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.entry-head span {
  color: var(--text-muted);
  font-size: 12px;
}

.entry-head button {
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--danger);
  cursor: pointer;
}

.photos {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.photos img {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

textarea {
  width: 100%;
  margin: 8px 0;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  resize: vertical;
  font-family: var(--font-sans);
}

label {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-pill);
  cursor: pointer;
  color: var(--text-secondary);
  font-weight: 700;
}

input[type='file'] {
  display: none;
}
</style>
