<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { aiPlan } from '@/data/mockData'
import type { AiPlan } from '@/data/mockData'
import { catColor, catTone } from '@/composables/useKitUtils'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import Mascot from '@/components/brand/Mascot.vue'
import Rating from '@/components/data-display/Rating.vue'

type Trip = {
  title: string
  cover: string
  region: string
  period: string
  plan?: AiPlan
}

interface VisitRecord {
  rating: number
  photos: string[]
  memo: string
}

const currentTrip = inject<{ value: Trip | null }>('currentTrip', ref<Trip | null>(null))
const showToast = inject<(config: { tone?: string; message: string; icon?: string }) => void>('showToast', () => undefined)
const navigate = inject<(view: 'explore' | 'planner' | 'trips' | 'today') => void>('navigate', () => undefined)

const baseTrip = computed<Trip>(() =>
  currentTrip.value ?? {
    title: 'Jeju relaxed route',
    cover: '/images/img_hyeopjae.jpg',
    region: 'Jeju',
    period: '2 nights 3 days',
    plan: aiPlan,
  },
)

const days = computed(() => baseTrip.value.plan?.days ?? aiPlan.days)
const mode = ref<'live' | 'album'>('live')
const dayIndex = ref(0)
const visited = ref<Record<string, VisitRecord>>({})
const capture = ref<{ dayIndex: number; itemIndex: number } | null>(null)
const captureRating = ref(5)
const capturePhotos = ref<string[]>([])
const captureMemo = ref('')

const keyOf = (day: number, item: number) => `${day}-${item}`
const items = computed(() => days.value[dayIndex.value]?.items ?? [])
const nextIndex = computed(() => items.value.findIndex((_, index) => !visited.value[keyOf(dayIndex.value, index)]))
const nextStop = computed(() => (nextIndex.value >= 0 ? items.value[nextIndex.value] : null))
const doneCount = computed(() => items.value.filter((_, index) => visited.value[keyOf(dayIndex.value, index)]).length)
const visitedStops = computed(() => {
  const result: { dayIndex: number; itemIndex: number; rec: VisitRecord; title: string }[] = []
  days.value.forEach((day, dIndex) => {
    day.items.forEach((item, iIndex) => {
      const rec = visited.value[keyOf(dIndex, iIndex)]
      if (rec) result.push({ dayIndex: dIndex, itemIndex: iIndex, rec, title: item.title })
    })
  })
  return result
})
const avgRating = computed(() => {
  const ratings = visitedStops.value.map((stop) => stop.rec.rating).filter(Boolean)
  return ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null
})

const captureItem = computed(() =>
  capture.value ? days.value[capture.value.dayIndex]?.items[capture.value.itemIndex] ?? null : null,
)

function stopCategory(stop: { dayIndex: number; itemIndex: number }) {
  return days.value[stop.dayIndex]?.items[stop.itemIndex]?.cat ?? 'Spot'
}

function openCapture() {
  if (nextIndex.value < 0) return
  capture.value = { dayIndex: dayIndex.value, itemIndex: nextIndex.value }
  captureRating.value = 5
  capturePhotos.value = []
  captureMemo.value = ''
}

function commitCapture(record: VisitRecord) {
  if (!capture.value) return
  visited.value = {
    ...visited.value,
    [keyOf(capture.value.dayIndex, capture.value.itemIndex)]: record,
  }
  capture.value = null
}

function skipCapture() {
  commitCapture({ rating: 0, photos: [], memo: '' })
}

function onPhotoInput(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? []).slice(0, 3 - capturePhotos.value.length)
  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') capturePhotos.value = [...capturePhotos.value, reader.result]
    }
    reader.readAsDataURL(file)
  })
  input.value = ''
}

function handlePublish() {
  showToast({ tone: 'success', message: 'TripLog published.' })
  navigate('trips')
}
</script>

<template>
  <div class="page">
    <header class="page-head">
      <div>
        <p>{{ baseTrip.region }} - {{ baseTrip.period }}</p>
        <h1>{{ baseTrip.title }}</h1>
      </div>
      <div class="mode-tabs">
        <button type="button" :class="{ active: mode === 'live' }" @click="mode = 'live'">Today</button>
        <button type="button" :class="{ active: mode === 'album' }" @click="mode = 'album'">Album {{ visitedStops.length || '' }}</button>
      </div>
    </header>

    <template v-if="mode === 'live'">
      <div class="day-tabs">
        <button v-for="(day, index) in days" :key="day.day" type="button" :class="{ active: dayIndex === index }" @click="dayIndex = index">
          Day {{ day.day }}
        </button>
        <span>{{ doneCount }}/{{ items.length }} done</span>
      </div>

      <div class="progress">
        <span :style="{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%` }" />
      </div>

      <section v-if="nextStop" class="next-card">
        <img :src="nextStop.img" alt="" />
        <div>
          <Badge :tone="catTone(nextStop.cat)" solid>{{ nextStop.cat }}</Badge>
          <h2>{{ nextStop.title }}</h2>
          <p>{{ nextStop.time }} - {{ nextStop.note }}</p>
          <small v-if="nextStop.move">{{ nextStop.move.mode }} - {{ nextStop.move.time }}</small>
          <Button variant="primary" size="lg" :full-width="true" @click="openCapture">Check in</Button>
        </div>
      </section>

      <section v-else class="done-card">
        <Mascot variant="cheer" :size="96" />
        <h2>Day {{ days[dayIndex]?.day }} is complete.</h2>
        <Button v-if="dayIndex < days.length - 1" variant="secondary" @click="dayIndex += 1">Next day</Button>
        <Button variant="primary" @click="mode = 'album'">View album</Button>
      </section>

      <section class="timeline">
        <h3>Day {{ days[dayIndex]?.day }} route</h3>
        <article v-for="(item, index) in items" :key="`${item.time}-${item.title}`" class="timeline-row">
          <span :class="{ done: visited[keyOf(dayIndex, index)] }">{{ index + 1 }}</span>
          <img :src="visited[keyOf(dayIndex, index)]?.photos?.[0] || item.img" alt="" />
          <div>
            <b>{{ item.title }}</b>
            <small>{{ item.time }} - {{ visited[keyOf(dayIndex, index)] ? 'done' : 'planned' }}</small>
          </div>
        </article>
      </section>
    </template>

    <template v-else>
      <section v-if="visitedStops.length === 0" class="empty-album">
        <Mascot variant="wink" :size="92" />
        <p>No checked-in stops yet.</p>
      </section>

      <template v-else>
        <section class="album-cover">
          <img :src="baseTrip.cover" alt="" />
          <div>
            <Badge tone="mint" solid>TripLog</Badge>
            <h1>{{ baseTrip.title }}</h1>
            <p>{{ visitedStops.length }} stops checked in <span v-if="avgRating">- avg {{ avgRating }}</span></p>
          </div>
        </section>

        <div class="album-list">
          <article v-for="stop in visitedStops" :key="`${stop.dayIndex}-${stop.itemIndex}`" class="album-row">
            <span :style="{ background: catColor[stopCategory(stop)] }" />
            <div>
              <b>{{ stop.title }}</b>
              <Rating :model-value="stop.rec.rating" :readonly="true" :size="15" />
              <p>{{ stop.rec.memo || 'No memo' }}</p>
            </div>
          </article>
        </div>

        <Button variant="primary" size="lg" @click="handlePublish">Publish TripLog</Button>
      </template>
    </template>

    <Teleport to="body">
      <div v-if="capture && captureItem" class="modal-backdrop" @click.self="capture = null">
        <section class="capture-modal">
          <img :src="captureItem.img" alt="" />
          <div class="capture-body">
            <h2>{{ captureItem.title }}</h2>
            <div class="rating-row">
              <span>Rating</span>
              <Rating v-model="captureRating" :size="26" />
            </div>
            <div class="photo-row">
              <img v-for="photo in capturePhotos" :key="photo" :src="photo" alt="" />
              <label v-if="capturePhotos.length < 3">
                Photo
                <input type="file" accept="image/*" multiple @change="onPhotoInput" />
              </label>
            </div>
            <textarea v-model="captureMemo" rows="3" placeholder="Memo..." />
            <div class="modal-actions">
              <Button variant="ghost" @click="skipCapture">Skip memo</Button>
              <Button variant="primary" @click="commitCapture({ rating: captureRating, photos: capturePhotos, memo: captureMemo.trim() })">
                Save check-in
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page {
  max-width: 880px;
  margin: 0 auto;
  padding: 28px 24px 90px;
}

.page-head,
.mode-tabs,
.day-tabs,
.timeline-row,
.album-row,
.rating-row,
.modal-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-head {
  justify-content: space-between;
  margin-bottom: 18px;
}

.page-head p {
  color: var(--text-muted);
  font-weight: 700;
}

.page-head h1 {
  font-size: 27px;
  font-weight: 800;
}

.mode-tabs,
.day-tabs {
  flex-wrap: wrap;
}

.mode-tabs button,
.day-tabs button {
  border: none;
  border-radius: var(--radius-pill);
  background: var(--gray-100);
  padding: 8px 14px;
  cursor: pointer;
  font-weight: 700;
}

.mode-tabs button.active,
.day-tabs button.active {
  background: var(--coral-500);
  color: #fff;
}

.progress {
  height: 8px;
  border-radius: var(--radius-pill);
  background: var(--gray-100);
  overflow: hidden;
  margin: 18px 0 22px;
}

.progress span {
  display: block;
  height: 100%;
  background: var(--coral-500);
}

.next-card,
.done-card,
.timeline,
.empty-album,
.album-list {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--surface);
  overflow: hidden;
  margin-bottom: 22px;
}

.next-card {
  position: relative;
}

.next-card > img,
.album-cover > img {
  width: 100%;
  height: 280px;
  object-fit: cover;
}

.next-card > div {
  padding: 20px;
}

.next-card h2 {
  font-size: 28px;
  font-weight: 800;
  margin: 8px 0;
}

.next-card p,
.timeline small,
.album-row p {
  color: var(--text-secondary);
}

.done-card,
.empty-album {
  text-align: center;
  padding: 36px 24px;
}

.timeline {
  padding: 18px;
}

.timeline h3 {
  margin-bottom: 12px;
}

.timeline-row {
  padding: 10px 0;
}

.timeline-row > span {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--gray-100);
  font-weight: 800;
}

.timeline-row > span.done {
  background: var(--mint-500);
  color: #fff;
}

.timeline-row img {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.timeline-row div {
  display: flex;
  flex-direction: column;
}

.album-cover {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl);
  margin-bottom: 20px;
}

.album-cover div {
  position: absolute;
  left: 22px;
  bottom: 18px;
  color: #fff;
}

.album-list {
  padding: 18px;
}

.album-row {
  align-items: flex-start;
  padding: 12px 0;
}

.album-row > span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 6px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 20px;
  background: var(--overlay-scrim);
}

.capture-modal {
  width: min(460px, 94vw);
  overflow: hidden;
  border-radius: var(--radius-2xl);
  background: var(--surface);
  box-shadow: var(--shadow-xl);
}

.capture-modal > img {
  width: 100%;
  height: 130px;
  object-fit: cover;
}

.capture-body {
  padding: 20px;
}

.photo-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 12px 0;
}

.photo-row img,
.photo-row label {
  width: 78px;
  height: 78px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.photo-row label {
  display: grid;
  place-items: center;
  border: 2px dashed var(--coral-200);
  background: var(--coral-50);
  color: var(--coral-600);
  font-weight: 700;
  cursor: pointer;
}

.photo-row input {
  display: none;
}

textarea {
  width: 100%;
  padding: 11px 13px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  resize: vertical;
  font-family: var(--font-sans);
}

.modal-actions {
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
