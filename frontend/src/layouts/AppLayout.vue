<script setup>
/**
 * AppLayout.vue — 앱 최상위 레이아웃
 * ─────────────────────────────────────────────────────────────
 * 원본: raw-wireframe/output/scripts/App_shell.js
 *
 * 책임:
 *   1. NavBar  — 스티키 상단 네비게이션 (뷰 전환)
 *   2. BasketDrawer — 슬라이드인 사이드 서랍 (담은 장소 목록)
 *   3. Toaster — 전역 Toast 알림
 *   4. <component :is> — 활성 뷰 동적 렌더링
 *
 * 전역 상태 (provide):
 *   - basket / basketPlaces / toggleBasket
 *   - savedTrips / savePlan
 *   - currentTrip / startTrip
 *   - navigate(view)
 *   - showToast(config)
 *
 * ─────────────── State Lifting 설계 원칙 ───────────────
 * React의 중앙 App 컴포넌트가 state를 들어올려(Lifting) prop으로
 * 자식에 전달하는 패턴을 Vue에서는 provide/inject로 대체한다.
 *
 * React 패턴:
 *   <AIPlanner basketPlaces={basketPlaces} onSavePlan={savePlan} />
 *
 * Vue 패턴:
 *   provide('basketPlaces', basketPlaces)  ← AppLayout
 *   const basketPlaces = inject('basketPlaces') ← AIPlannerView
 *
 * 이 방식은 중간 컴포넌트(NavBar 등)가 불필요한 prop을 받지 않아도 되는
 * "prop drilling 회피"의 정석적 해법이다.
 * ─────────────────────────────────────────────────────────────
 *
 * React → Vue 주요 변환:
 *   - React.useState('explore')          → ref('explore')
 *   - React.useState(new Set())          → ref(new Set())
 *   - window.Shell.NavBar / BasketDrawer → 이 파일에 template 인라인
 *   - window.Shell.Toaster               → Toast.vue 직접 조합
 */

import { ref, computed, provide, onMounted } from 'vue'
import { places, tripLogs } from '@/data/mockData.js'
import { useAuthStore } from '@/stores/auth.js'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import Avatar from '@/components/data-display/Avatar.vue'
import Mascot from '@/components/brand/Mascot.vue'
import Toast from '@/components/feedback/Toast.vue'
import OnboardingView from '@/views/OnboardingView.vue'

// ── 뷰 컴포넌트 (lazy import) ─────────────────────────────────────────────
import ExploreView from '@/views/ExploreView.vue'
import AIPlannerView from '@/views/AIPlannerView.vue'
import MyTripsView from '@/views/MyTripsView.vue'
import TodayTripView from '@/views/TodayTripView.vue'
import TripLogView from '@/views/TripLogView.vue'

// ── 네비게이션 정의 ────────────────────────────────────────────────────────
const NAV = [
  { key: 'explore', label: '여행지 탐색' },
  { key: 'planner', label: 'AI 플래너' },
  { key: 'trips', label: '내 여행' },
  { key: 'triplog', label: 'TripLog' },
  { key: 'today', label: '오늘의 여행' },
]

// 뷰 키 → 컴포넌트 매핑
const VIEW_MAP = {
  explore: ExploreView,
  planner: AIPlannerView,
  trips: MyTripsView,
  triplog: TripLogView,
  today: TodayTripView,
}

// ── 활성 뷰 상태 ──────────────────────────────────────────────────────────
const activeView = ref('explore')
const activeComponent = computed(() => VIEW_MAP[activeView.value] || ExploreView)
const auth = useAuthStore()
const userName = computed(() => auth.user?.nickname || auth.user?.name || auth.user?.email || '나')

function navigate(view) {
  if (VIEW_MAP[view]) activeView.value = view
}

function enterApp() {
  navigate('explore')
}

// ── 여행 바구니 상태 ──────────────────────────────────────────────────────
const basket = ref(new Set())
const basketPlaces = computed(() => places.filter((p) => basket.value.has(p.id)))

function toggleBasket(place) {
  const next = new Set(basket.value)
  if (next.has(place.id)) next.delete(place.id)
  else next.add(place.id)
  basket.value = next
}

// ── 바구니 서랍 상태 ──────────────────────────────────────────────────────
const drawerOpen = ref(false)

// ── 저장된 여행 목록 ──────────────────────────────────────────────────────
const savedTrips = ref([])

function savePlan(plan) {
  savedTrips.value = [
    ...savedTrips.value,
    {
      ...plan,
      id: 'trip_' + Date.now(),
      title: `${plan.period} ${plan.style} 제주 코스`,
      cover: places[0].img,
      region: '제주',
      days: plan.days.length,
      places: plan.days.reduce((a, d) => a + d.items.length, 0),
      visibility: 'private',
    },
  ]
}

// ── 오늘의 여행 (현재 진행 여행) ─────────────────────────────────────────
const currentTrip = ref(null)

function startTrip(trip) {
  currentTrip.value = trip
  navigate('today')
}

// ── Toast 알림 ────────────────────────────────────────────────────────────
const toast = ref(null)
let toastTimer = null

function showToast(config) {
  clearTimeout(toastTimer)
  toast.value = config
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 3200)
}

// ── Provide: 모든 하위 뷰에서 inject 가능 ──────────────────────────────────
provide('basket', basket)
provide('basketPlaces', basketPlaces)
provide('toggleBasket', toggleBasket)
provide('savedTrips', savedTrips)
provide('savePlan', savePlan)
provide('currentTrip', currentTrip)
provide('startTrip', startTrip)
provide('navigate', navigate)
provide('showToast', showToast)
provide('auth', auth)

// ── AI 코스 짜기 버튼 (BasketDrawer에서) ─────────────────────────────────
function goToPlanner() {
  drawerOpen.value = false
  navigate('planner')
}

async function handleLogout() {
  await auth.logout()
  drawerOpen.value = false
  activeView.value = 'explore'
}

onMounted(() => {
  auth.bootstrap()
})
</script>

<template>
  <div
    v-if="!auth.initialized"
    style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-base);
      color: var(--text-secondary);
      font-family: var(--font-sans);
      font-weight: 700;
    "
  >
    코스콕을 준비하는 중...
  </div>

  <OnboardingView
    v-else-if="!auth.isAuthenticated"
    @complete="enterApp"
  />

  <div
    v-else
    style="
      min-height: 100vh;
      background: var(--bg-base);
      color: var(--text-primary);
      font-family: var(--font-sans);
    "
  >
    <!-- ══════════════ NavBar ══════════════ -->
    <header
      style="
        position: sticky;
        top: 0;
        z-index: 40;
        background: #FFFCFA;
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border);
      "
    >
      <div
        style="
          max-width: 1200px;
          margin: 0 auto;
          height: 68px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 24px;
        "
      >
        <!-- 로고 -->
        <button
          @click="navigate('explore')"
          style="
            display: flex;
            align-items: center;
            gap: 8px;
            border: none;
            background: none;
            cursor: pointer;
            padding: 0;
          "
        >
          <span
            style="
              width: 30px;
              height: 30px;
              border-radius: 9px;
              background: linear-gradient(135deg, var(--coral-500), var(--coral-400));
              display: grid;
              place-items: center;
              overflow: hidden;
              flex: none;
              box-shadow: 0 4px 10px rgba(255, 107, 61, 0.22);
            "
          >
            <Mascot variant="default" :size="21" style="width: 21px; height: 25px; transform: translateY(2px);" />
          </span>
          <span
            style="
              font-weight: 800;
              font-size: 18px;
              letter-spacing: -0.02em;
              color: var(--gray-900);
            "
          >
            코스<span style="color: var(--coral-500)">콕</span>
          </span>
        </button>

        <!-- 네비게이션 -->
        <nav style="display: flex; gap: 4px; margin-left: 8px">
          <button
            v-for="n in NAV"
            :key="n.key"
            @click="navigate(n.key)"
            :style="{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              height: '40px',
              padding: '0 14px',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              background: activeView === n.key ? 'var(--coral-50)' : 'transparent',
              color: activeView === n.key ? 'var(--coral-700)' : 'var(--text-secondary)',
              fontWeight: activeView === n.key ? 700 : 500,
              fontSize: '15px',
              fontFamily: 'var(--font-sans)',
              transition: 'background var(--dur-fast) var(--ease-out)',
              whiteSpace: 'nowrap',
            }"
          >
            {{ n.label }}
          </button>
        </nav>

        <div style="flex: 1" />

        <!-- 바구니 버튼 -->
        <button
          @click="drawerOpen = true"
          aria-label="여행 바구니"
          style="
            position: relative;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 1px solid var(--border);
            background: var(--surface);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
          "
        >
          <!-- Bag 아이콘 -->
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
          </svg>
          <!-- 뱃지 -->
          <span
            v-if="basket.size > 0"
            style="
              position: absolute;
              top: -4px;
              right: -4px;
              min-width: 20px;
              height: 20px;
              padding: 0 5px;
              border-radius: var(--radius-pill);
              background: var(--coral-500);
              color: #fff;
              font-size: 11px;
              font-weight: 800;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: var(--shadow-primary);
            "
            >{{ basket.size }}</span
          >
        </button>

        <button
          @click="handleLogout"
          style="
            border: none;
            background: transparent;
            color: var(--text-muted);
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
          "
        >
          로그아웃
        </button>

        <!-- 아바타 -->
        <Avatar :name="userName" :size="40" :ring="true" />
      </div>
    </header>

    <!-- ══════════════ 메인 콘텐츠 (동적 뷰 전환) ══════════════ -->
    <!--
      React의 조건부 렌더링 (if view === 'explore' return <Explore />) 을
      Vue의 <component :is="..."> 로 대체한다.
      이 패턴은 컴포넌트 레지스트리를 통해 O(1) 조회하며,
      각 뷰가 unmount 시 상태를 초기화해야 할 경우 <keep-alive>로 래핑 가능.
    -->
    <main>
      <component :is="activeComponent" />
    </main>

    <!-- ══════════════ BasketDrawer ══════════════ -->
    <!-- 스크림(backdrop) -->
    <div
      @click="drawerOpen = false"
      :style="{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'var(--overlay-scrim)',
        opacity: drawerOpen ? 1 : 0,
        pointerEvents: drawerOpen ? 'auto' : 'none',
        transition: 'opacity var(--dur-base) var(--ease-out)',
      }"
    />

    <!-- 서랍 패널 -->
    <aside
      :style="{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '400px',
        maxWidth: '92vw',
        zIndex: 51,
        background: 'var(--bg-base)',
        boxShadow: 'var(--shadow-xl)',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform var(--dur-slow) var(--ease-out)',
        display: 'flex',
        flexDirection: 'column',
      }"
    >
      <!-- 서랍 헤더 -->
      <div
        style="
          padding: 20px 22px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border);
        "
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--coral-500)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
        </svg>
        <h2 style="font-size: 19px; font-weight: 800">여행 바구니</h2>
        <Badge tone="coral" :solid="true">{{ basketPlaces.length }}</Badge>
        <div style="flex: 1" />
        <button
          @click="drawerOpen = false"
          aria-label="닫기"
          style="border: none; background: none; cursor: pointer; color: var(--text-muted)"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- 서랍 목록 -->
      <div
        style="
          flex: 1;
          overflow-y: auto;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        "
      >
        <!-- 빈 상태 -->
        <div
          v-if="basketPlaces.length === 0"
          style="text-align: center; color: var(--text-muted); padding: 40px 0; font-size: 15px"
        >
          아직 담은 장소가 없어요.<br />마음에 드는 곳을 콕 찍어보세요.
        </div>

        <!-- 장소 카드 -->
        <div
          v-for="p in basketPlaces"
          :key="p.id"
          style="
            display: flex;
            gap: 12px;
            padding: 10px;
            background: var(--surface);
            border-radius: var(--radius-md);
            border: 1px solid var(--border-subtle);
            align-items: center;
          "
        >
          <img
            :src="p.img"
            alt=""
            style="
              width: 64px;
              height: 64px;
              border-radius: var(--radius-sm);
              object-fit: cover;
              flex: none;
            "
          />
          <div style="flex: 1; min-width: 0">
            <div style="font-weight: 700; font-size: 15px">{{ p.title }}</div>
            <div style="font-size: 13px; color: var(--text-muted); margin-top: 2px">
              {{ p.region }}
            </div>
          </div>
          <button
            @click="toggleBasket(p)"
            aria-label="빼기"
            style="border: none; background: none; cursor: pointer; color: var(--text-muted)"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <!-- AI 코스 짜기 버튼 -->
      <div style="padding: 18px; border-top: 1px solid var(--border); background: var(--surface)">
        <Button
          variant="ai"
          size="lg"
          :full-width="true"
          :disabled="basketPlaces.length === 0"
          @click="goToPlanner"
        >
          <template #left-icon>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M12 3l1.88 5.76H20l-4.94 3.59 1.88 5.77L12 14.52l-4.94 3.6 1.88-5.77L4.06 8.76H10.12L12 3z"
              />
            </svg>
          </template>
          {{ basketPlaces.length }}곳으로 AI 코스 짜기
        </Button>
      </div>
    </aside>

    <!-- ══════════════ Toaster ══════════════ -->
    <Teleport to="body">
      <div
        v-if="toast"
        style="
          position: fixed;
          left: 50%;
          bottom: 36px;
          transform: translateX(-50%);
          z-index: 70;
          pointer-events: auto;
        "
      >
        <Toast :tone="toast.tone" :message="toast.message" :action="toast.action" />
      </div>
    </Teleport>
  </div>
</template>
