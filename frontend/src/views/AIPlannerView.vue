<script setup lang="ts">
import { computed, inject, nextTick, ref, type Ref } from 'vue'
import { aiPlan } from '@/data/mockData'
import type { AiPlan, Place } from '@/data/mockData'
import { applyIntent, calcCost, catTone, clone, won } from '@/composables/useKitUtils'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import CourseMap from '@/components/domain/CourseMap.vue'
import Mascot from '@/components/brand/Mascot.vue'
import SegmentedControl from '@/components/navigation/SegmentedControl.vue'

type Navigate = (view: 'explore' | 'planner' | 'trips' | 'today') => void
type Toast = (config: { tone?: string; message: string; icon?: string }) => void

const basketPlaces = inject<Ref<Place[]>>('basketPlaces', ref<Place[]>([]))
const savePlan = inject<(plan: AiPlan & { people: number }) => void>('savePlan', () => undefined)
const navigate = inject<Navigate>('navigate', () => undefined)
const showToast = inject<Toast>('showToast', () => undefined)

const stage = ref<'setup' | 'loading' | 'result'>('setup')
const period = ref('2 nights 3 days')
const style = ref('Relaxed')
const pace = ref('Easy')
const people = ref(2)
const resultView = ref<'list' | 'map'>('list')
const plan = ref<AiPlan>(clone(aiPlan))
const chatText = ref('')
const chatBodyRef = ref<HTMLElement | null>(null)
const messages = ref([
  { role: 'kok', text: 'Tell me what you want to change: cheaper, cafe, or slower.' },
])

const cost = computed(() => calcCost(plan.value.days, plan.value.fixedCost, people.value))

function run() {
  if (basketPlaces.value.length === 0) return
  stage.value = 'loading'
  window.setTimeout(() => {
    stage.value = 'result'
  }, 700)
}

function removeItem(dayIndex: number, itemIndex: number) {
  plan.value = {
    ...plan.value,
    days: plan.value.days.map((day, index) =>
      index === dayIndex ? { ...day, items: day.items.filter((_, item) => item !== itemIndex) } : day,
    ),
  }
}

async function sendChat(raw?: string) {
  const value = (raw || chatText.value).trim()
  if (!value) return
  const result = applyIntent(plan.value, value)
  plan.value = result.plan
  messages.value = [...messages.value, { role: 'me', text: value }, { role: 'kok', text: result.reply }]
  chatText.value = ''
  await nextTick()
  if (chatBodyRef.value) chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
}

function handleSavePlan() {
  savePlan({ ...plan.value, period: period.value, style: style.value, people: people.value })
  showToast({ tone: 'success', message: 'Route saved to My Trips.' })
  navigate('trips')
}
</script>

<template>
  <div class="page">
    <template v-if="stage === 'setup'">
      <section class="planner-hero">
        <Mascot variant="guide" :size="100" />
        <div>
          <Badge tone="sky">AI Planner</Badge>
          <h1>Turn saved places into a route.</h1>
          <p>Select conditions and CourseKok will produce a day-by-day plan.</p>
        </div>
      </section>

      <section class="setup-card">
        <h2>Saved places</h2>
        <div class="saved-list">
          <span v-if="basketPlaces.length === 0" class="muted">Add places from Explore first.</span>
          <span v-for="place in basketPlaces" :key="place.id" class="saved-pill">
            <img :src="place.img" alt="" />
            {{ place.title }}
          </span>
        </div>

        <div class="form-grid">
          <label>
            Period
            <select v-model="period">
              <option>Day trip</option>
              <option>1 night 2 days</option>
              <option>2 nights 3 days</option>
            </select>
          </label>
          <label>
            Style
            <select v-model="style">
              <option>Relaxed</option>
              <option>Food</option>
              <option>Activity</option>
            </select>
          </label>
        </div>

        <div class="controls-row">
          <SegmentedControl v-model="pace" :options="['Easy', 'Balanced', 'Packed']" />
          <div class="people-control">
            <button type="button" @click="people = Math.max(1, people - 1)">-</button>
            <strong>{{ people }}</strong>
            <button type="button" @click="people = Math.min(9, people + 1)">+</button>
          </div>
        </div>

        <Button variant="ai" size="lg" :full-width="true" :disabled="basketPlaces.length === 0" @click="run">
          Build route
        </Button>
      </section>
    </template>

    <section v-else-if="stage === 'loading'" class="loading-state">
      <Mascot variant="guide" :size="130" />
      <b>Building your route...</b>
    </section>

    <template v-else>
      <div class="result-head">
        <div>
          <Badge tone="sky">AI Route</Badge>
          <h1>{{ period }} {{ style }} route</h1>
        </div>
        <SegmentedControl v-model="resultView" :options="['list', 'map']" size="sm" />
      </div>

      <CourseMap v-if="resultView === 'map'" :days="plan.days" :height="380" />

      <div v-else class="day-list">
        <section v-for="(day, dayIndex) in plan.days" :key="day.day" class="day-card">
          <header>
            <strong>Day {{ day.day }}</strong>
            <span>{{ day.theme }}</span>
          </header>
          <article v-for="(item, itemIndex) in day.items" :key="`${item.time}-${item.title}`" class="route-item">
            <img :src="item.img" alt="" />
            <div>
              <div class="item-title">
                <b>{{ item.time }} {{ item.title }}</b>
                <Badge :tone="catTone(item.cat)" size="sm">{{ item.cat }}</Badge>
              </div>
              <p>{{ item.note }}</p>
              <small v-if="item.move">{{ item.move.mode }} - {{ item.move.time }}</small>
            </div>
            <strong>{{ item.cost ? won(item.cost) : 'Free' }}</strong>
            <button type="button" @click="removeItem(dayIndex, itemIndex)">Remove</button>
          </article>
        </section>
      </div>

      <section class="cost-card">
        <h2>Estimated cost</h2>
        <div v-for="row in cost.rows" :key="row.label" class="cost-row">
          <span>{{ row.label }}</span>
          <div><span :style="{ width: `${Math.max(8, (row.v / cost.max) * 100)}%`, background: row.color }" /></div>
          <strong>{{ won(row.v) }}</strong>
        </div>
        <footer>
          <span>Total</span>
          <strong>{{ won(cost.total) }}</strong>
        </footer>
      </section>

      <section class="chat-card">
        <div ref="chatBodyRef" class="messages">
          <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
            {{ message.text }}
          </div>
        </div>
        <div class="quick-actions">
          <button type="button" @click="sendChat('make it cheaper')">Cheaper</button>
          <button type="button" @click="sendChat('add cafe')">Add cafe</button>
          <button type="button" @click="sendChat('slower route')">Slower</button>
        </div>
        <form class="chat-input" @submit.prevent="sendChat()">
          <input v-model="chatText" placeholder="Ask for a route change..." />
          <Button variant="primary" type="submit">Send</Button>
        </form>
      </section>

      <Button variant="primary" size="lg" :full-width="true" @click="handleSavePlan">Save to My Trips</Button>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px 90px;
}

.planner-hero,
.setup-card,
.day-card,
.cost-card,
.chat-card {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.planner-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  margin-bottom: 18px;
  background: linear-gradient(120deg, var(--sky-50), var(--mint-50));
}

.planner-hero h1,
.result-head h1 {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 800;
}

.planner-hero p,
.muted {
  color: var(--text-secondary);
}

.setup-card,
.cost-card,
.chat-card {
  padding: 22px;
}

.saved-list,
.controls-row,
.quick-actions,
.chat-input,
.result-head,
.cost-row,
.cost-card footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.saved-list {
  flex-wrap: wrap;
  margin: 12px 0 22px;
}

.saved-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px 6px 6px;
  border-radius: var(--radius-pill);
  background: var(--coral-50);
  font-weight: 700;
}

.saved-pill img {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 18px;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 700;
  color: var(--text-secondary);
}

.form-grid select {
  height: 42px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: 0 12px;
}

.controls-row {
  justify-content: space-between;
  margin-bottom: 20px;
}

.people-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.people-control button {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: var(--gray-100);
  cursor: pointer;
}

.loading-state {
  min-height: 360px;
  display: grid;
  place-items: center;
  gap: 14px;
}

.result-head {
  justify-content: space-between;
  margin-bottom: 18px;
}

.day-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.day-card {
  overflow: hidden;
}

.day-card header {
  display: flex;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-subtle);
}

.route-item {
  display: grid;
  grid-template-columns: 58px 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px 18px;
}

.route-item img {
  width: 58px;
  height: 58px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.route-item p {
  color: var(--text-muted);
  margin-top: 3px;
}

.route-item button,
.quick-actions button {
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface);
  cursor: pointer;
  padding: 6px 10px;
}

.cost-card {
  margin: 18px 0;
}

.cost-row {
  margin-top: 12px;
}

.cost-row > span {
  width: 96px;
}

.cost-row div {
  flex: 1;
  height: 7px;
  border-radius: var(--radius-pill);
  background: var(--gray-100);
  overflow: hidden;
}

.cost-row div span {
  display: block;
  height: 100%;
}

.cost-card footer {
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed var(--border);
}

.messages {
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.message {
  max-width: 78%;
  padding: 10px 12px;
  border-radius: 14px;
  background: var(--gray-100);
}

.message.me {
  align-self: flex-end;
  background: var(--coral-500);
  color: #fff;
}

.quick-actions {
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.chat-input input {
  flex: 1;
  height: 42px;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 0 14px;
}
</style>
