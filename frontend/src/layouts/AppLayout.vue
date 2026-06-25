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
 *   - publishedTripLogs / publishTripLog
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

import { ref, computed, provide, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { places } from '@/data/mockData.js'
import { useAuthStore } from '@/stores/auth.js'
import { useTripsStore } from '@/stores/trips.js'
import { getSavedPlaces, savePlace, deleteSavedPlace } from '@/api/savedPlace.js'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import Avatar from '@/components/data-display/Avatar.vue'
import Mascot from '@/components/brand/Mascot.vue'
import Toast from '@/components/feedback/Toast.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import LoginModal from '@/components/auth/LoginModal.vue'
import attractionFallback from '@/assets/images/place-attraction.svg'
import foodFallback from '@/assets/images/place-food.svg'
import stayFallback from '@/assets/images/place-stay.svg'
import festivalFallback from '@/assets/images/place-festival.svg'
import defaultFallback from '@/assets/images/place-default.svg'

// ── 네비게이션 정의 ────────────────────────────────────────────────────────
const NAV = [
  { key: 'explore', label: '여행지 탐색' },
  { key: 'planner', label: 'AI 플래너' },
  { key: 'trips', label: '내 여행' },
  { key: 'triplog', label: 'TripLog' },
  { key: 'lounge', label: '라운지' },
]

const VALID_VIEWS = new Set([...NAV.map((n) => n.key), 'mypage'])
const PROTECTED_VIEWS = new Set(['planner', 'trips', 'mypage'])

// ── 라우터 기반 활성 뷰 ───────────────────────────────────────────────────
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const userName = computed(() => auth.user?.nickname || auth.user?.name || auth.user?.email || '나')
const userProfileImage = computed(() => auth.user?.profileImage || '')
const activeView = computed(() => route.name || 'explore')

// ── 첫 방문 판별 ──────────────────────────────────────────────────────────
const hasVisited = ref(!!localStorage.getItem('kok_visited'))

function onOnboardingComplete() {
  localStorage.setItem('kok_visited', '1')
  hasVisited.value = true
  router.push({ name: 'explore' })
}

function onOnboardingSkip() {
  localStorage.setItem('kok_visited', '1')
  hasVisited.value = true
  router.push({ name: 'explore' })
}

// ── 로그인 모달 ───────────────────────────────────────────────────────────
const showLoginModal = ref(false)

// 보호된 라우트에서 ?showLogin=1 쿼리로 리다이렉트된 경우 자동 오픈
watch(
  () => route.query.showLogin,
  (val) => {
    if (val === '1' && !auth.isAuthenticated) {
      showLoginModal.value = true
      router.replace({ ...route, query: {} })
    }
  },
  { immediate: true },
)

function onLoginSuccess() {
  showLoginModal.value = false
}

function onNeedSignup() {
  showLoginModal.value = false
  // hasVisited를 초기화해서 온보딩(회원가입 화면)으로 이동
  localStorage.removeItem('kok_visited')
  hasVisited.value = false
}

function navigate(view) {
  if (!VALID_VIEWS.has(view)) return
  if (PROTECTED_VIEWS.has(view) && !auth.isAuthenticated) {
    showLoginModal.value = true
    return
  }
  router.push({ name: view })
}

// ── 여행 바구니 상태 ──────────────────────────────────────────────────────
const basket = ref(new Set())
const savedPlacesList = ref([])

function fallbackPlaceImage(typeId) {
  if (typeId === 39) return foodFallback
  if (typeId === 32) return stayFallback
  if (typeId === 15) return festivalFallback
  if (typeId === 12) return attractionFallback
  return defaultFallback
}

const basketPlaces = computed(() => {
  if (auth.isAuthenticated) {
    return savedPlacesList.value.map((item) => {
      const p = item.place
      return {
        id: p.id,
        title: p.title,
        img: p.firstImage?.startsWith?.('http') ? p.firstImage : fallbackPlaceImage(p.contentTypeId),
        firstImage: p.firstImage,
        contentTypeId: p.contentTypeId,
        cat: p.contentTypeId === 39 ? '음식점' : '관광지',
        mapX: p.mapX,
        mapY: p.mapY
      }
    })
  }
  return places.filter((p) => basket.value.has(p.id))
})

// 로그인 시 백엔드에서 찜 목록을 가져와 동기화
async function fetchSavedPlaces() {
  if (!auth.isAuthenticated) {
    basket.value = new Set()
    savedPlacesList.value = []
    return
  }
  try {
    const data = await getSavedPlaces({ size: 100 })
    if (data && data.content) {
      savedPlacesList.value = data.content
      basket.value = new Set(data.content.map((item) => item.place.id))
    }
  } catch (error) {
    console.error('찜 목록 동기화 실패:', error)
  }
}

// 로그인 상태 감시 및 찜 목록 자동 갱신
watch(
  () => auth.isAuthenticated,
  (newVal) => {
    if (newVal) {
      fetchSavedPlaces()
    } else {
      basket.value = new Set()
      savedPlacesList.value = []
    }
  },
  { immediate: true }
)

async function toggleBasket(place) {
  if (!auth.isAuthenticated) {
    showLoginModal.value = true
    return
  }

  const isSaved = basket.value.has(place.id)

  try {
    if (isSaved) {
      await deleteSavedPlace(place.id)
      showToast({ message: '바구니에서 장소를 제거했습니다.', tone: 'success' })
    } else {
      await savePlace(place.id)
      showToast({ message: '바구니에 장소를 추가했습니다.', tone: 'success' })
    }
    await fetchSavedPlaces() // 상태 재동기화
  } catch (error) {
    console.error('바구니 처리 오류:', error)
    if (error.status === 400) {
      showToast({ message: error.message || '이미 바구니에 담긴 장소입니다.', tone: 'error' })
    } else {
      showToast({ message: '요청 처리에 실패했습니다. 다시 시도해 주세요.', tone: 'error' })
    }
  }
}

// ── 바구니 서랍 상태 ──────────────────────────────────────────────────────
const drawerOpen = ref(false)

// ── 저장된 여행 목록 ──────────────────────────────────────────────────────
const tripsStore = useTripsStore()
const savedTrips = computed(() => tripsStore.trips)

async function savePlan(plan) {
  return await tripsStore.saveTrip(plan)
}

async function clearBasket() {
  if (!auth.isAuthenticated || savedPlacesList.value.length === 0) return
  try {
    await Promise.all(savedPlacesList.value.map(item => deleteSavedPlace(item.place.id)))
    await fetchSavedPlaces()
  } catch (error) {
    console.error('바구니 초기화 실패:', error)
  }
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
provide('navigate', navigate)
provide('showToast', showToast)
provide('auth', auth)
provide('refreshBasket', fetchSavedPlaces)
provide('clearBasket', clearBasket)

// ── AI 코스 짜기 버튼 (BasketDrawer에서) ─────────────────────────────────
function goToPlanner() {
  drawerOpen.value = false
  navigate('planner')
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
    v-else-if="!auth.isAuthenticated && !hasVisited"
    @complete="onOnboardingComplete"
    @skip="onOnboardingSkip"
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
        background: var(--app-chrome);
        border-bottom: 1px solid var(--border);
      "
    >
      <div
        style="
          max-width: 1500px;
          margin: 0 auto;
          height: 68px;
          padding: 0 30px;
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

        <!-- 로그인 상태: 마이페이지 아바타 -->
        <button
          v-if="auth.isAuthenticated"
          @click="navigate('mypage')"
          aria-label="마이페이지"
          :style="{
            border: 'none',
            background: 'transparent',
            padding: '2px',
            borderRadius: '50%',
            cursor: 'pointer',
            boxShadow: activeView === 'mypage' ? '0 0 0 3px var(--coral-100)' : 'none',
          }"
        >
          <Avatar :name="userName" :src="userProfileImage" :size="40" :ring="true" />
        </button>

        <!-- 비로그인: 로그인 버튼 -->
        <button
          v-else
          @click="showLoginModal = true"
          style="
            height: 40px;
            padding: 0 18px;
            border: none;
            border-radius: var(--radius-pill);
            background: var(--coral-500);
            color: #fff;
            font-family: var(--font-sans);
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
          "
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          로그인
        </button>
      </div>
    </header>

    <!-- ══════════════ 메인 콘텐츠 ══════════════ -->
    <main>
      <RouterView />
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

    <!-- ══════════════ 로그인 모달 ══════════════ -->
    <Teleport to="body">
      <LoginModal
        v-if="showLoginModal"
        @success="onLoginSuccess"
        @close="showLoginModal = false"
        @need-signup="onNeedSignup"
      />
    </Teleport>
  </div>
</template>
