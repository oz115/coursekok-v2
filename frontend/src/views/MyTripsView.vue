<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { aiPlan, journalSeed, places, tripLogs } from '@/data/mockData'
import type { AiPlan, JournalEntry, PlanDay, PlanItem, Place, TripLog } from '@/data/mockData'
import { catColor, catTone, clone, uid } from '@/composables/useKitUtils'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import Card from '@/components/data-display/Card.vue'
import CourseMap from '@/components/domain/CourseMap.vue'
import JournalBlock from '@/components/domain/JournalBlock.vue'
import Switch from '@/components/forms/Switch.vue'

type SavedTrip = TripLog & { plan?: AiPlan }
type Navigate = (view: 'explore' | 'planner' | 'trips' | 'today') => void

const savedTrips = inject<{ value: SavedTrip[] }>('savedTrips', ref<SavedTrip[]>([]))
const startTrip = inject<(trip: SavedTrip) => void>('startTrip', () => undefined)
const showToast = inject<(config: { tone?: string; message: string; icon?: string }) => void>('showToast', () => undefined)
const navigate = inject<Navigate>('navigate', () => undefined)

const trips = computed(() => (savedTrips.value.length ? savedTrips.value : tripLogs))
const selectedTrip = ref<SavedTrip | null>(null)
const days = ref<PlanDay[]>([])
const journal = ref<Record<string, JournalEntry[]>>({})
const visibility = ref<'public' | 'private'>('private')
const courseView = ref<'list' | 'map'>('list')
const addingDay = ref<number | null>(null)

function initDetail(trip: SavedTrip) {
  days.value = clone(trip.plan?.days ?? aiPlan.days).map((day) => ({
    ...day,
    items: day.items.map((item) => ({ ...item, uid: item.uid || uid() })),
  }))

  const nextJournal: Record<string, JournalEntry[]> = {}
  days.value.forEach((day) => {
    day.items.forEach((item) => {
      const seed = journalSeed[item.title]
      if (item.uid && seed) nextJournal[item.uid] = clone(seed)
    })
  })

  journal.value = nextJournal
  visibility.value = trip.visibility ?? 'private'
  courseView.value = 'list'
  addingDay.value = null
}

function openTrip(trip: SavedTrip) {
  selectedTrip.value = trip
  initDetail(trip)
}

function deleteItem(dayIndex: number, itemIndex: number) {
  days.value[dayIndex]?.items.splice(itemIndex, 1)
}

function moveItem(dayIndex: number, itemIndex: number, direction: -1 | 1) {
  const items = days.value[dayIndex]?.items
  if (!items) return
  const target = itemIndex + direction
  if (target < 0 || target >= items.length) return
  const copy = [...items]
  const current = copy[itemIndex]
  const next = copy[target]
  if (!current || !next) return
  copy[itemIndex] = next
  copy[target] = current
  const day = days.value[dayIndex]
  if (day) day.items = copy
}

function addItem(dayIndex: number, place: Place) {
  const item: PlanItem = {
    uid: uid(),
    time: 'TBD',
    title: place.title,
    cat: place.cat,
    note: place.desc.slice(0, 48),
    img: place.img,
    cost: 0,
    move: { mode: 'Car', time: '15 min', cost: 0 },
  }
  const day = days.value[dayIndex]
  if (day) day.items.push(item)
  addingDay.value = null
}

function applyVisibility(value: 'public' | 'private') {
  visibility.value = value
  showToast({ tone: value === 'public' ? 'success' : 'info', message: value === 'public' ? 'Trip is public.' : 'Trip is private.' })
}

function getCandidates(dayIndex: number) {
  const existing = new Set(days.value[dayIndex]?.items.map((item) => item.title))
  return places.filter((place) => !existing.has(place.title))
}

const totalPhotos = computed(() =>
  Object.values(journal.value).reduce((total, entries) => total + entries.length, 0),
)
</script>

<template>
  <div class="page">
    <template v-if="!selectedTrip">
      <section class="hero">
        <div>
          <h1>My Trips</h1>
          <p>Review saved routes, edit stops, and start today's trip.</p>
        </div>
        <Badge tone="coral" solid>{{ trips.length }} trips</Badge>
      </section>

      <div class="trip-list">
        <Card v-for="trip in trips" :key="trip.id" padding="none" :interactive="true" @click="openTrip(trip)">
          <article class="trip-card">
            <img :src="trip.cover" alt="" />
            <div>
              <div class="badges">
                <Badge tone="coral">{{ trip.region }}</Badge>
                <Badge tone="neutral">{{ trip.period }}</Badge>
              </div>
              <h2>{{ trip.title }}</h2>
              <p>{{ trip.days }} days - {{ trip.places }} places</p>
            </div>
          </article>
        </Card>
      </div>
    </template>

    <template v-else>
      <button class="back-button" type="button" @click="selectedTrip = null">Back to trips</button>

      <section class="cover">
        <img :src="selectedTrip.cover" alt="" />
        <div>
          <Badge tone="coral" solid>{{ selectedTrip.region }}</Badge>
          <h1>{{ selectedTrip.title }}</h1>
        </div>
      </section>

      <button class="start-card" type="button" @click="startTrip(selectedTrip); navigate('today')">
        <strong>Start trip</strong>
        <span>Open today's route checklist.</span>
      </button>

      <section class="visibility-card">
        <div>
          <strong>{{ visibility === 'public' ? 'Public TripLog' : 'Private trip' }}</strong>
          <p>{{ visibility === 'public' ? 'Other travelers can use this route.' : 'Only you can see this route.' }}</p>
        </div>
        <Switch :model-value="visibility === 'public'" @update:model-value="(value) => applyVisibility(value ? 'public' : 'private')" />
      </section>

      <div class="section-head">
        <h2>Route and journal</h2>
        <Badge tone="coral" size="sm">{{ totalPhotos }} entries</Badge>
        <div class="spacer" />
        <button type="button" :class="{ active: courseView === 'list' }" @click="courseView = 'list'">List</button>
        <button type="button" :class="{ active: courseView === 'map' }" @click="courseView = 'map'">Map</button>
      </div>

      <CourseMap v-if="courseView === 'map'" :days="days" :height="400" />

      <div v-else class="day-list">
        <section v-for="(day, dayIndex) in days" :key="day.day" class="day-card">
          <header>
            <strong>Day {{ day.day }}</strong>
            <span>{{ day.theme }}</span>
          </header>

          <article v-for="(item, itemIndex) in day.items" :key="item.uid" class="stop-row">
            <span :style="{ background: catColor[item.cat] }" />
            <img :src="item.img" alt="" />
            <div>
              <b>{{ item.time }} {{ item.title }}</b>
              <Badge :tone="catTone(item.cat)" size="sm">{{ item.cat }}</Badge>
            </div>
            <button type="button" :disabled="itemIndex === 0" @click="moveItem(dayIndex, itemIndex, -1)">Up</button>
            <button type="button" :disabled="itemIndex === day.items.length - 1" @click="moveItem(dayIndex, itemIndex, 1)">Down</button>
            <button type="button" @click="deleteItem(dayIndex, itemIndex)">Delete</button>
            <details>
              <summary>Journal</summary>
              <JournalBlock :entries="journal[item.uid || ''] || []" @update:entries="(entries) => item.uid && (journal[item.uid] = entries)" />
            </details>
          </article>

          <div v-if="addingDay === dayIndex" class="candidate-panel">
            <button v-for="place in getCandidates(dayIndex)" :key="place.id" type="button" @click="addItem(dayIndex, place)">
              {{ place.title }}
            </button>
          </div>

          <Button v-else variant="secondary" @click="addingDay = dayIndex">Add place</Button>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px 90px;
}

.hero,
.visibility-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px;
  border-radius: var(--radius-xl);
  background: var(--coral-50);
  margin-bottom: 22px;
}

.hero h1,
.cover h1 {
  font-size: 28px;
  font-weight: 800;
}

.hero p,
.visibility-card p,
.trip-card p {
  color: var(--text-secondary);
}

.trip-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.trip-card {
  display: grid;
  grid-template-columns: 156px 1fr;
}

.trip-card img {
  width: 156px;
  height: 128px;
  object-fit: cover;
}

.trip-card > div {
  padding: 16px;
}

.badges {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.back-button,
.section-head button,
.stop-row button,
.candidate-panel button {
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface);
  cursor: pointer;
  padding: 6px 10px;
}

.cover {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl);
  margin-bottom: 18px;
}

.cover img {
  width: 100%;
  height: 210px;
  object-fit: cover;
}

.cover div {
  position: absolute;
  left: 22px;
  bottom: 18px;
  color: #fff;
}

.start-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 18px;
  margin-bottom: 18px;
  border: 1px solid var(--coral-100);
  border-radius: var(--radius-lg);
  background: var(--surface);
  text-align: left;
  cursor: pointer;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 22px 0 14px;
}

.spacer {
  flex: 1;
}

.section-head button.active {
  background: var(--coral-50);
  color: var(--coral-700);
}

.day-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.day-card {
  padding: 16px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.day-card header {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.stop-row {
  display: grid;
  grid-template-columns: 10px 46px 1fr auto auto auto;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
}

.stop-row > span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.stop-row img {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.stop-row details {
  grid-column: 3 / -1;
}

.candidate-panel {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px;
  border: 1px dashed var(--coral-200);
  border-radius: var(--radius-md);
}
</style>
