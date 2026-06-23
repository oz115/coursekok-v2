<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue'
import { aiPlan, places, tripLogs } from '@/data/mockData'
import type { AiPlan, Place, TripLog } from '@/data/mockData'
import { useAuthStore } from '@/stores/auth'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import Avatar from '@/components/data-display/Avatar.vue'
import Toast from '@/components/feedback/Toast.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import ExploreView from '@/views/ExploreView.vue'
import AIPlannerView from '@/views/AIPlannerView.vue'
import MyTripsView from '@/views/MyTripsView.vue'
import TodayTripView from '@/views/TodayTripView.vue'

type ViewKey = 'explore' | 'planner' | 'trips' | 'today'
type ToastState = { tone?: string; message: string; icon?: string; action?: { label: string; onClick: () => void } }
type SavedTrip = TripLog & { plan?: AiPlan; people?: number }

const nav: { key: ViewKey; label: string }[] = [
  { key: 'explore', label: 'Explore' },
  { key: 'planner', label: 'AI Planner' },
  { key: 'trips', label: 'My Trips' },
  { key: 'today', label: 'Today' },
]

const viewMap = {
  explore: ExploreView,
  planner: AIPlannerView,
  trips: MyTripsView,
  today: TodayTripView,
}

const auth = useAuthStore()
const activeView = ref<ViewKey>('explore')
const activeComponent = computed(() => viewMap[activeView.value])
const basket = ref(new Set<string>())
const drawerOpen = ref(false)
const savedTrips = ref<SavedTrip[]>([])
const currentTrip = ref<SavedTrip | null>(null)
const toast = ref<ToastState | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const userName = computed(() => auth.user?.nickname || auth.user?.name || auth.user?.email || 'User')
const basketPlaces = computed(() => places.filter((place) => basket.value.has(place.id)))

function navigate(view: ViewKey) {
  activeView.value = view
}

function toggleBasket(place: Place) {
  const next = new Set(basket.value)
  if (next.has(place.id)) next.delete(place.id)
  else next.add(place.id)
  basket.value = next
}

function savePlan(plan: AiPlan & { people?: number }) {
  const base = tripLogs[0]
  if (!base) return

  const nextTrip: SavedTrip = {
    ...base,
    id: `trip_${Date.now()}`,
    title: `${plan.period} ${plan.style} route`,
    cover: places[0]?.img ?? base.cover,
    region: 'Jeju',
    days: plan.days.length,
    places: plan.days.reduce((total, day) => total + day.items.length, 0),
    visibility: 'private',
    plan,
    people: plan.people,
  }

  savedTrips.value = [
    ...savedTrips.value,
    nextTrip,
  ]
}

function startTrip(trip: SavedTrip) {
  currentTrip.value = trip
  navigate('today')
}

function showToast(config: ToastState) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = config
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 3200)
}

async function handleLogout() {
  await auth.logout()
  activeView.value = 'explore'
  drawerOpen.value = false
}

provide('basket', basket)
provide('basketPlaces', basketPlaces)
provide('toggleBasket', toggleBasket)
provide('savedTrips', savedTrips)
provide('savePlan', savePlan)
provide('currentTrip', currentTrip)
provide('startTrip', startTrip)
provide('navigate', navigate)
provide('showToast', showToast)
provide('basePlan', aiPlan)

onMounted(() => {
  void auth.bootstrap()
})
</script>

<template>
  <div v-if="!auth.initialized" class="app-loading">Preparing CourseKok...</div>

  <OnboardingView v-else-if="!auth.isAuthenticated" @complete="navigate('explore')" />

  <div v-else class="app-shell">
    <header class="topbar">
      <button class="brand-button" type="button" @click="navigate('explore')">
        <img src="/images/markSvg.svg" alt="" />
        <strong>CourseKok</strong>
      </button>

      <nav class="nav-tabs">
        <button
          v-for="item in nav"
          :key="item.key"
          type="button"
          :class="{ active: activeView === item.key }"
          @click="navigate(item.key)"
        >
          {{ item.label }}
        </button>
      </nav>

      <div class="topbar-spacer" />

      <button class="basket-button" type="button" @click="drawerOpen = true">
        Basket
        <Badge v-if="basket.size" tone="coral" solid size="sm">{{ basket.size }}</Badge>
      </button>
      <button class="logout-button" type="button" @click="handleLogout">Logout</button>
      <Avatar :name="userName" :size="40" :ring="true" />
    </header>

    <main>
      <component :is="activeComponent" />
    </main>

    <div v-if="drawerOpen" class="drawer-backdrop" @click="drawerOpen = false" />
    <aside class="basket-drawer" :class="{ open: drawerOpen }">
      <div class="drawer-head">
        <h2>Travel Basket</h2>
        <Badge tone="coral" solid>{{ basketPlaces.length }}</Badge>
        <button type="button" @click="drawerOpen = false">Close</button>
      </div>

      <div class="drawer-list">
        <p v-if="basketPlaces.length === 0" class="empty-state">Add places from Explore first.</p>
        <article v-for="place in basketPlaces" :key="place.id" class="basket-item">
          <img :src="place.img" alt="" />
          <div>
            <strong>{{ place.title }}</strong>
            <span>{{ place.region }}</span>
          </div>
          <button type="button" @click="toggleBasket(place)">Remove</button>
        </article>
      </div>

      <div class="drawer-footer">
        <Button variant="ai" size="lg" :full-width="true" :disabled="basketPlaces.length === 0" @click="drawerOpen = false; navigate('planner')">
          Build AI Route
        </Button>
      </div>
    </aside>

    <Teleport to="body">
      <div v-if="toast" class="toast-host">
        <Toast :tone="toast.tone" :message="toast.message" :action="toast.action" />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.app-loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--bg-base);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-weight: 700;
}

.app-shell {
  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-sans);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 68px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 249, 244, 0.92);
  backdrop-filter: blur(12px);
}

.brand-button,
.nav-tabs button,
.basket-button,
.logout-button,
.drawer-head button,
.basket-item button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-sans);
}

.brand-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  color: var(--text-primary);
}

.brand-button img {
  width: 32px;
  height: 32px;
}

.nav-tabs {
  display: flex;
  gap: 4px;
}

.nav-tabs button {
  height: 38px;
  padding: 0 14px;
  border-radius: var(--radius-pill);
  color: var(--text-secondary);
  font-weight: 700;
}

.nav-tabs button.active {
  background: var(--coral-50);
  color: var(--coral-700);
}

.topbar-spacer {
  flex: 1;
}

.basket-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--surface);
  color: var(--text-secondary);
  font-weight: 700;
}

.logout-button {
  color: var(--text-muted);
  font-weight: 700;
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: var(--overlay-scrim);
}

.basket-drawer {
  position: fixed;
  inset: 0 0 0 auto;
  z-index: 51;
  width: min(400px, 92vw);
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
  box-shadow: var(--shadow-xl);
  transform: translateX(100%);
  transition: transform var(--dur-slow) var(--ease-out);
}

.basket-drawer.open {
  transform: translateX(0);
}

.drawer-head,
.drawer-footer {
  padding: 18px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
}

.drawer-head h2 {
  flex: 1;
  font-size: 18px;
}

.drawer-list {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  color: var(--text-muted);
  text-align: center;
  margin-top: 40px;
}

.basket-item {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--surface);
}

.basket-item img {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.basket-item div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.basket-item span {
  color: var(--text-muted);
  font-size: 13px;
}

.drawer-footer {
  border-top: 1px solid var(--border);
  border-bottom: none;
}

.toast-host {
  position: fixed;
  left: 50%;
  bottom: 36px;
  transform: translateX(-50%);
  z-index: 70;
}
</style>
