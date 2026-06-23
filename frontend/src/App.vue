<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Icons import
import IconStar from './components/icons/IconStar.vue'
import IconHeart from './components/icons/IconHeart.vue'
import IconSearch from './components/icons/IconSearch.vue'
import IconCheck from './components/icons/IconCheck.vue'
import IconUser from './components/icons/IconUser.vue'
import IconArrowR from './components/icons/IconArrowR.vue'
import IconWand from './components/icons/IconWand.vue'
import IconBell from './components/icons/IconBell.vue'
import IconTrash from './components/icons/IconTrash.vue'
import IconFilter from './components/icons/IconFilter.vue'

// Core Components
import Button from './components/core/Button.vue'
import Badge from './components/core/Badge.vue'

// Form Components
import Input from './components/forms/Input.vue'
import Checkbox from './components/forms/Checkbox.vue'
import Switch from './components/forms/Switch.vue'
import Textarea from './components/forms/Textarea.vue'
import Select from './components/forms/Select.vue'

// Data Display Components
import Avatar from './components/data-display/Avatar.vue'
import Rating from './components/data-display/Rating.vue'
import IconButton from './components/data-display/IconButton.vue'
import FilterChip from './components/data-display/FilterChip.vue'

// Navigation & Feedback Components
import Tabs from './components/navigation/Tabs.vue'
import SegmentedControl from './components/navigation/SegmentedControl.vue'
import Stepper from './components/feedback/Stepper.vue'
import Toast from './components/feedback/Toast.vue'

// New: Layout & Brand Components
import Card from './components/data-display/Card.vue'
import PlaceCard from './components/data-display/PlaceCard.vue'
import Mascot from './components/brand/Mascot.vue'
import MascotBubble from './components/brand/MascotBubble.vue'

// Domain Components
import CourseMap from './components/domain/CourseMap.vue'
import PlaceDetailOverlay from './components/domain/PlaceDetailOverlay.vue'
import JournalBlock from './components/domain/JournalBlock.vue'

// Domain data
import { aiPlan, places, journalSeed } from './data/mockData.js'

// ── 테마 상태 ─────────────────────────────────────────────────────────────
const isDark = ref(false)
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

// ── 대화형 상태 (Reactive States) ──────────────────────────────────────────
// Buttons
const btnClickCount = ref(0)
const handleBtnClick = () => {
  btnClickCount.value++
}

// Form Controls
const textVal = ref('제주공항 근처 카페 맛집')
const errorVal = ref('')
const checkVal = ref(false)
const switchVal1 = ref(false)
const switchVal2 = ref(true)
const textareaVal = ref(
  '여기에 여행 코스에 대한 콕! 찍어둔 팁을 자세하게 적어주세요. 예컨대, 일몰 시간에 가야 가장 예쁩니다.',
)
const selectVal = ref('jeju')

const selectOptions = [
  { value: 'jeju', label: '제주도 (Jeju)' },
  { value: 'seoul', label: '서울특별시 (Seoul)' },
  { value: 'busan', label: '부산광역시 (Busan)' },
  { value: 'gyeongju', label: '경주시 (Gyeongju)' },
]

// Data Displays
const ratingVal1 = ref(4)
const filterChips = ref([
  { id: 'all', label: '전체', count: 142, selected: true },
  { id: 'nature', label: '자연/힐링', count: 48, selected: false },
  { id: 'food', label: '맛집/카페', count: 56, selected: false },
  { id: 'activity', label: '액티비티', count: 19, selected: false },
  { id: 'culture', label: '역사/문화', count: 19, selected: false },
])

const toggleChip = (chip) => {
  if (chip.id === 'all') {
    filterChips.value.forEach((c) => (c.selected = c.id === 'all'))
  } else {
    chip.selected = !chip.selected
    const others = filterChips.value.filter((c) => c.id !== 'all')
    const anySelected = others.some((c) => c.selected)
    const allChip = filterChips.value.find((c) => c.id === 'all')
    if (allChip) allChip.selected = !anySelected
  }
}

// Navigation & Feedback
const activeTab = ref('info')
const tabItems = [
  { value: 'info', label: '상세 정보', count: null },
  { value: 'review', label: '리뷰', count: 128 },
  { value: 'qna', label: '문의사항', count: 5 },
]

const segValue1 = ref('fast')
const segValue2 = ref('nature')
const segOptions1 = [
  { value: 'fast', label: '빠른 코스' },
  { value: 'relax', label: '여유로운 코스' },
]
const segOptions2 = [
  { value: 'nature', label: '자연' },
  { value: 'city', label: '도시' },
  { value: 'theme', label: '테마파크' },
]

const currentStep = ref(0)
const onboardingSteps = ['기본 정보 설정', '관광지 콕! 찍기', '최적화 일정 확인']

// Toast States
const demoToast = ref(null)
const fireToast = (tone, message, iconName) => {
  demoToast.value = {
    tone,
    message,
    icon: iconName,
    action: {
      label: '실행취소',
      onClick: () => {
        alert('동작이 취소되었습니다.')
        demoToast.value = null
      },
    },
  }
  setTimeout(() => {
    demoToast.value = null
  }, 3200)
}

// New: Layout & Brand States
const cardClickCount = ref(0)
const placeSaved = ref(false)
const placeSaved2 = ref(true)
const placeCardClickMsg = ref('장소 카드를 클릭해보세요.')

const mascotVariant = ref('default')
const mascotPop = ref(false)
const triggerMascotPop = () => {
  mascotPop.value = true
  setTimeout(() => {
    mascotPop.value = false
  }, 480)
}

const bubbleText = ref('안녕하세요! 제주도 숨은 비경을 AI 플래닝으로 똑똑하게 가이드해 드릴게요.')
const bubbleTone = ref('default')

// ── Domain Component States ────────────────────────────────────────────────
// CourseMap
const mapActiveDay = ref('all')

// PlaceDetailOverlay
const overlayPlace = ref(null)
const overlaySaved = ref(false)
const openOverlay = (place) => {
  overlayPlace.value = place
}
const closeOverlay = () => {
  overlayPlace.value = null
}
const toggleSave = (place) => {
  overlaySaved.value = !overlaySaved.value
}

// JournalBlock
const journalEntries = ref(journalSeed['협재 해변'] ?? [])
</script>

<template>
  <!-- /app 라우트는 RouterView가 AppLayout을 렌더링 -->
  <RouterView v-if="route.path.startsWith('/app')" />

  <!-- 그 외 모든 경로는 기존 UI Kit 갤러리 -->
  <div v-else class="gallery-wrapper">
    <!-- Header -->
    <header class="gallery-header">
      <div class="header-container">
        <div class="logo-area">
          <span class="logo-kkok">콕!</span>
          <h1 class="logo-title">CourseKok UI Kit Gallery</h1>
        </div>
        <div class="header-actions">
          <button @click="toggleTheme" class="theme-toggle-btn" aria-label="Toggle dark mode">
            <!-- Sun / Moon Icon -->
            <svg
              v-if="isDark"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <svg
              v-else
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <span>{{ isDark ? '라이트 모드로 보기' : '다크 모드로 보기' }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Sticky Navigation -->
    <nav class="gallery-nav">
      <div class="nav-container">
        <a href="#section-core" class="nav-link">Core Actions</a>
        <a href="#section-forms" class="nav-link">Form Controls</a>
        <a href="#section-data" class="nav-link">Data Display</a>
        <a href="#section-nav-feedback" class="nav-link">Navigation & Feedback</a>
        <a href="#section-brand-layout" class="nav-link">Brand & Layout</a>
      </div>
    </nav>

    <!-- Main Container -->
    <main class="gallery-main">
      <!-- Intro Card -->
      <section class="intro-section">
        <div class="intro-card">
          <h2>코스콕(CourseKok) 컴포넌트 갤러리</h2>
          <p>
            Vue 3 Composition API로 새롭게 태어난 디자인 시스템의 마이그레이션 결과물입니다. 각
            컴포넌트의 <strong>기본 상태(Default)</strong>와 <strong>변형 상태(Variants)</strong>를
            브라우저에서 직접 테스트해보고, 실시간 반응성을 대화형 데모 영역에서 확인하실 수
            있습니다.
          </p>
        </div>
      </section>

      <!-- 1. CORE ACTIONS SECTION -->
      <section id="section-core" class="gallery-section">
        <div class="section-title-wrap">
          <span class="ds-eyebrow">Category 01</span>
          <h2>Core Actions & Labels</h2>
        </div>

        <div class="card-grid">
          <!-- Button Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>Button <span class="badge-tag">core/Button.vue</span></h3>
              <p>기본 액션 버튼. 5개 variant, 3개 크기, 비활성 상태 및 슬롯 기반 아이콘 지원.</p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo</span>
                <div class="demo-flex">
                  <Button variant="primary" @click="handleBtnClick">
                    <template #left-icon><IconCheck :size="18" /></template>
                    클릭해 보세요!
                  </Button>
                  <div class="interactive-status">
                    클릭 횟수: <strong class="highlight-text">{{ btnClickCount }}</strong>
                  </div>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">Variants Showcase</span>

                <div class="variant-group">
                  <h4 class="group-title">Variants (MD Size)</h4>
                  <div class="variant-flex wrap">
                    <div class="variant-item">
                      <span class="variant-label">Primary</span>
                      <Button variant="primary">기본 버튼</Button>
                    </div>
                    <div class="variant-item">
                      <span class="variant-label">AI Highlight</span>
                      <Button variant="ai">
                        <template #left-icon><IconWand :size="18" /></template>
                        AI 코스 만들기
                      </Button>
                    </div>
                    <div class="variant-item">
                      <span class="variant-label">Secondary</span>
                      <Button variant="secondary">보조 버튼</Button>
                    </div>
                    <div class="variant-item">
                      <span class="variant-label">Ghost</span>
                      <Button variant="ghost">고스트 버튼</Button>
                    </div>
                    <div class="variant-item">
                      <span class="variant-label">Danger</span>
                      <Button variant="danger">삭제하기</Button>
                    </div>
                  </div>
                </div>

                <div class="variant-group">
                  <h4 class="group-title">Sizes</h4>
                  <div class="variant-flex items-center gap-16">
                    <div class="variant-item">
                      <span class="variant-label">Small (SM)</span>
                      <Button variant="primary" size="sm">Small</Button>
                    </div>
                    <div class="variant-item">
                      <span class="variant-label">Medium (MD)</span>
                      <Button variant="primary" size="md">Medium</Button>
                    </div>
                    <div class="variant-item">
                      <span class="variant-label">Large (LG)</span>
                      <Button variant="primary" size="lg">Large</Button>
                    </div>
                  </div>
                </div>

                <div class="variant-group">
                  <h4 class="group-title">States</h4>
                  <div class="variant-flex wrap">
                    <div class="variant-item">
                      <span class="variant-label">Disabled Primary</span>
                      <Button variant="primary" disabled>사용 불가</Button>
                    </div>
                    <div class="variant-item">
                      <span class="variant-label">Disabled Secondary</span>
                      <Button variant="secondary" disabled>사용 불가</Button>
                    </div>
                    <div class="variant-item">
                      <span class="variant-label">Icon Slots</span>
                      <Button variant="secondary">
                        <template #left-icon><IconSearch :size="18" /></template>
                        검색
                        <template #right-icon><IconArrowR :size="18" /></template>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Badge Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>Badge <span class="badge-tag">core/Badge.vue</span></h3>
              <p>의미론적 톤(tone)을 지닌 정적 라벨. Soft/Solid 스타일 및 아이콘 지원.</p>
            </div>

            <div class="card-body">
              <div class="showcase-block">
                <span class="demo-label">Soft Badges (Default)</span>
                <div class="variant-flex wrap gap-8">
                  <Badge tone="neutral">neutral</Badge>
                  <Badge tone="coral">coral</Badge>
                  <Badge tone="sky">sky</Badge>
                  <Badge tone="mint">mint</Badge>
                  <Badge tone="amber">amber</Badge>
                  <Badge tone="red">red</Badge>
                </div>
              </div>

              <div class="showcase-block margin-top-20">
                <span class="demo-label">Solid Badges</span>
                <div class="variant-flex wrap gap-8">
                  <Badge tone="neutral" solid>neutral</Badge>
                  <Badge tone="coral" solid>coral</Badge>
                  <Badge tone="sky" solid>sky</Badge>
                  <Badge tone="mint" solid>mint</Badge>
                  <Badge tone="amber" solid>amber</Badge>
                  <Badge tone="red" solid>red</Badge>
                </div>
              </div>

              <div class="showcase-block margin-top-20">
                <span class="demo-label">Sizes & With Icons</span>
                <div class="variant-flex wrap items-center gap-12">
                  <div class="variant-item">
                    <span class="variant-label">SM Size</span>
                    <Badge tone="coral" size="sm">관광명소</Badge>
                  </div>
                  <div class="variant-item">
                    <span class="variant-label">MD Size</span>
                    <Badge tone="coral" size="md">관광명소</Badge>
                  </div>
                  <div class="variant-item">
                    <span class="variant-label">With Icon (Soft)</span>
                    <Badge tone="mint">
                      <template #left-icon>
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </template>
                      저장됨
                    </Badge>
                  </div>
                  <div class="variant-item">
                    <span class="variant-label">With Icon (Solid)</span>
                    <Badge tone="amber" solid>
                      <template #left-icon>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path
                            d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.3l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z"
                          />
                        </svg>
                      </template>
                      4.8
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. FORM CONTROLS SECTION -->
      <section id="section-forms" class="gallery-section">
        <div class="section-title-wrap">
          <span class="ds-eyebrow">Category 02</span>
          <h2>Form Controls & Inputs</h2>
        </div>

        <div class="card-grid">
          <!-- Input Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>Input <span class="badge-tag">forms/Input.vue</span></h3>
              <p>
                레이블, 힌트, 에러메시지, 아이콘 슬롯과 v-model 바인딩을 지원하는 텍스트 입력창.
              </p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo</span>
                <div class="demo-form-layout">
                  <Input
                    v-model="textVal"
                    label="여행지 검색"
                    placeholder="검색어를 입력해보세요"
                    hint="예: 제주도, 해운대, 경주 불국사"
                    :error="errorVal"
                  >
                    <template #left-icon><IconSearch :size="18" /></template>
                  </Input>

                  <div class="demo-form-controls">
                    <Input
                      v-model="errorVal"
                      label="[데모] 에러 메시지 테스트"
                      placeholder="여기에 적으면 검색 필드에 에러가 표시됩니다."
                      size="sm"
                    />
                  </div>

                  <div class="value-display">
                    입력 값: <span class="value-string">"{{ textVal }}"</span>
                  </div>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">Sizes & States</span>
                <div class="form-showcase-column">
                  <Input label="Small Input" size="sm" placeholder="Small size input" />
                  <Input label="Medium Input (Default)" size="md" placeholder="Medium size input" />
                  <Input label="Large Input" size="lg" placeholder="Large size input" />
                  <Input label="Disabled State" disabled placeholder="입력할 수 없습니다." />
                </div>
              </div>
            </div>
          </div>

          <!-- Select Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>Select <span class="badge-tag">forms/Select.vue</span></h3>
              <p>네이티브 select를 캡슐화한 폼 요소. 커스텀 스타일 화살표와 상태 옵션 제공.</p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo</span>
                <div class="demo-form-layout">
                  <Select
                    v-model="selectVal"
                    label="대표 관광 도시 선택"
                    :options="selectOptions"
                    placeholder="도시를 선택해주세요"
                    hint="코스콕이 지원하는 지역 카테고리입니다"
                  />
                  <div class="value-display">
                    선택 값: <span class="value-string">"{{ selectVal }}"</span>
                  </div>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">Variants & States</span>
                <div class="form-showcase-column">
                  <Select label="Small Size" size="sm" :options="['서울', '부산', '제주']" />
                  <Select label="Disabled State" disabled :options="['서울', '부산', '제주']" />
                  <Select
                    label="Error State"
                    error="반드시 도시를 선택해야 합니다!"
                    :options="selectOptions"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Textarea Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>Textarea <span class="badge-tag">forms/Textarea.vue</span></h3>
              <p>글자 수 제한 카운터와 자동 리사이징 높이를 제공하는 여러 줄 입력창.</p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo</span>
                <div class="demo-form-layout">
                  <Textarea
                    v-model="textareaVal"
                    label="상세 여행 계획 코멘트"
                    placeholder="여행지에 대한 꿀팁을 적어주세요."
                    :rows="4"
                    :maxLength="200"
                    hint="남은 글자 수를 실시간으로 확인할 수 있습니다."
                  />
                  <div class="value-display">
                    입력 길이: <span class="highlight-text">{{ textareaVal.length }}</span> / 200자
                  </div>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">States</span>
                <div class="form-showcase-column">
                  <Textarea
                    label="Disabled State"
                    disabled
                    placeholder="비활성화된 텍스트 에어리어입니다."
                  />
                  <Textarea
                    label="Error State"
                    error="올바르지 않은 표현이 포함되어 있습니다."
                    placeholder="내용을 수정해 주세요."
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Checkbox & Switch Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>Checkbox & Switch <span class="badge-tag">forms/</span></h3>
              <p>참/거짓(boolean) 형태의 상태를 선택하기 위한 토글 컨트롤러.</p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo</span>
                <div class="toggle-demo-grid">
                  <div class="toggle-demo-box">
                    <Checkbox v-model="checkVal" label="위치 정보 수집 동의 (필수)" />
                    <div class="value-display-sm">
                      Checkbox: <span class="highlight-text">{{ checkVal }}</span>
                    </div>
                  </div>

                  <div class="toggle-demo-box">
                    <Switch v-model="switchVal1" label="마케팅 혜택 알림 받기" />
                    <div class="value-display-sm">
                      Switch: <span class="highlight-text">{{ switchVal1 }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">States Showcase</span>

                <div class="variant-group">
                  <h4 class="group-title">Checkbox States</h4>
                  <div class="variant-flex wrap gap-16">
                    <Checkbox :model-value="false" label="Unchecked" />
                    <Checkbox :model-value="true" label="Checked" />
                    <Checkbox :model-value="false" disabled label="Unchecked Disabled" />
                    <Checkbox :model-value="true" disabled label="Checked Disabled" />
                  </div>
                </div>

                <div class="variant-group margin-top-20">
                  <h4 class="group-title">Switch States</h4>
                  <div class="variant-flex wrap gap-16">
                    <Switch :model-value="false" label="Off" />
                    <Switch :model-value="true" label="On" />
                    <Switch :model-value="false" disabled label="Off Disabled" />
                    <Switch :model-value="true" disabled label="On Disabled" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. DATA DISPLAY SECTION -->
      <section id="section-data" class="gallery-section">
        <div class="section-title-wrap">
          <span class="ds-eyebrow">Category 03</span>
          <h2>Data Display & Status</h2>
        </div>

        <div class="card-grid">
          <!-- Avatar Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>Avatar <span class="badge-tag">data-display/Avatar.vue</span></h3>
              <p>사용자 프로필. 이미지 로딩 실패 시 이름 기반 이니셜 생성 및 링 데코레이션 지원.</p>
            </div>

            <div class="card-body">
              <div class="showcase-block">
                <span class="demo-label">Image Avatars (With different sizes)</span>
                <div class="avatar-row">
                  <div class="avatar-show-item">
                    <Avatar src="https://picsum.photos/id/1012/100/100" name="홍길동" size="32" />
                    <span>32px</span>
                  </div>
                  <div class="avatar-show-item">
                    <Avatar src="https://picsum.photos/id/1025/100/100" name="김철수" size="44" />
                    <span>44px</span>
                  </div>
                  <div class="avatar-show-item">
                    <Avatar
                      src="https://picsum.photos/id/64/100/100"
                      name="이영희"
                      size="64"
                      ring
                    />
                    <span>64px (Ring)</span>
                  </div>
                  <div class="avatar-show-item">
                    <Avatar
                      src="https://picsum.photos/id/1062/150/150"
                      name="박민수"
                      size="80"
                      ring
                    />
                    <span>80px (Ring)</span>
                  </div>
                </div>
              </div>

              <div class="showcase-block margin-top-20">
                <span class="demo-label">Initial Fallbacks (Automatic color selection)</span>
                <div class="avatar-row">
                  <div class="avatar-show-item">
                    <Avatar name="홍길동" size="40" />
                    <span>"홍"</span>
                  </div>
                  <div class="avatar-show-item">
                    <Avatar name="김철수" size="40" />
                    <span>"김"</span>
                  </div>
                  <div class="avatar-show-item">
                    <Avatar name="David" size="48" ring />
                    <span>"D" (Ring)</span>
                  </div>
                  <div class="avatar-show-item">
                    <Avatar name="Sonia" size="48" ring />
                    <span>"S" (Ring)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rating Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>Rating <span class="badge-tag">data-display/Rating.vue</span></h3>
              <p>코스 및 맛집 별점 표시 및 평가용 별점 컴포넌트. Readonly 및 값 표시 지원.</p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo (Click to rate)</span>
                <div class="demo-flex flex-col gap-10">
                  <div class="rating-interactive-row">
                    <Rating v-model="ratingVal1" :size="32" show-value :count="238" />
                  </div>
                  <div class="value-display-sm">
                    현재 선택 별점: <span class="highlight-text">{{ ratingVal1 }}</span> / 5.0
                  </div>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">Variants Showcase</span>

                <div class="variant-group">
                  <h4 class="group-title">Readonly / Display mode</h4>
                  <div class="rating-display-list">
                    <div class="rating-display-item">
                      <span>4.5점 표시 (Readonly)</span>
                      <Rating :model-value="4.5" readonly show-value />
                    </div>
                    <div class="rating-display-item">
                      <span>3.2점 표시 (Readonly + Count)</span>
                      <Rating :model-value="3.2" readonly :count="1200" show-value />
                    </div>
                    <div class="rating-display-item">
                      <span>10 Stars Max (Rating)</span>
                      <Rating :model-value="7" :max="10" :size="20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- IconButton Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>IconButton <span class="badge-tag">data-display/IconButton.vue</span></h3>
              <p>단일 아이콘을 위한 원형/사각형 버튼. Soft, Solid, Ghost, Glass 등 4개 스타일.</p>
            </div>

            <div class="card-body">
              <div class="showcase-block">
                <span class="demo-label">Variants (Round Circle)</span>
                <div class="variant-flex wrap gap-12">
                  <div class="variant-item-center">
                    <IconButton variant="soft"><IconHeart :size="20" /></IconButton>
                    <span class="micro-label">Soft</span>
                  </div>
                  <div class="variant-item-center">
                    <IconButton variant="solid"><IconStar :size="20" /></IconButton>
                    <span class="micro-label">Solid</span>
                  </div>
                  <div class="variant-item-center">
                    <IconButton variant="ghost"><IconBell :size="20" /></IconButton>
                    <span class="micro-label">Ghost</span>
                  </div>
                  <div class="variant-item-center">
                    <IconButton variant="glass" style="background: rgba(0, 0, 0, 0.05)"
                      ><IconSearch :size="20"
                    /></IconButton>
                    <span class="micro-label">Glass (on BG)</span>
                  </div>
                </div>
              </div>

              <div class="showcase-block margin-top-20">
                <span class="demo-label">Sizes & Shapes</span>
                <div class="variant-flex wrap items-center gap-16">
                  <div class="variant-item-center">
                    <IconButton size="sm" variant="solid"><IconUser :size="14" /></IconButton>
                    <span class="micro-label">sm (32px)</span>
                  </div>
                  <div class="variant-item-center">
                    <IconButton size="md" variant="solid"><IconUser :size="18" /></IconButton>
                    <span class="micro-label">md (40px)</span>
                  </div>
                  <div class="variant-item-center">
                    <IconButton size="lg" variant="solid"><IconUser :size="22" /></IconButton>
                    <span class="micro-label">lg (48px)</span>
                  </div>
                  <div class="variant-item-center">
                    <IconButton variant="solid" :round="false"><IconTrash :size="18" /></IconButton>
                    <span class="micro-label">Square (Round: false)</span>
                  </div>
                  <div class="variant-item-center">
                    <IconButton variant="solid" disabled><IconHeart :size="18" /></IconButton>
                    <span class="micro-label">Disabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- FilterChip Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>FilterChip <span class="badge-tag">data-display/FilterChip.vue</span></h3>
              <p>
                검색 조건이나 코스 필터에 쓰이는 토글 가능한 필터 칩. 선택 여부에 따라 다이내믹
                변경.
              </p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo (Click to filter)</span>
                <div class="chip-container">
                  <FilterChip
                    v-for="chip in filterChips"
                    :key="chip.id"
                    :selected="chip.selected"
                    :count="chip.count"
                    @click="toggleChip(chip)"
                  >
                    <template #left-icon v-if="chip.id === 'all'">
                      <IconFilter :size="14" />
                    </template>
                    {{ chip.label }}
                  </FilterChip>
                </div>
                <div class="value-display-sm margin-top-12">
                  선택된 카테고리:
                  <span class="chip-selection-list">
                    {{
                      filterChips
                        .filter((c) => c.selected)
                        .map((c) => c.label)
                        .join(', ') || '없음'
                    }}
                  </span>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">States Showcase</span>
                <div class="variant-flex wrap gap-12">
                  <div class="variant-item">
                    <span class="variant-label">Unselected (Default)</span>
                    <FilterChip :selected="false">관광지</FilterChip>
                  </div>
                  <div class="variant-item">
                    <span class="variant-label">Selected</span>
                    <FilterChip :selected="true">숙소</FilterChip>
                  </div>
                  <div class="variant-item">
                    <span class="variant-label">With Count</span>
                    <FilterChip :selected="false" :count="24">숙소</FilterChip>
                  </div>
                  <div class="variant-item">
                    <span class="variant-label">Selected with Count</span>
                    <FilterChip :selected="true" :count="24">숙소</FilterChip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. NAVIGATION & FEEDBACK SECTION -->
      <section id="section-nav-feedback" class="gallery-section">
        <div class="section-title-wrap">
          <span class="ds-eyebrow">Category 04</span>
          <h2>Navigation & Feedback</h2>
        </div>

        <div class="card-grid">
          <!-- Tabs Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>Tabs <span class="badge-tag">navigation/Tabs.vue</span></h3>
              <p>하단 슬라이드 바를 지닌 가로 탭 바. 개별 아이템 카운터 표시 및 v-model 제어.</p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo</span>
                <div class="demo-flex flex-col gap-10">
                  <Tabs v-model="activeTab" :items="tabItems" style="width: 100%" />
                  <div class="value-display">
                    활성화된 탭 ID: <span class="value-string">"{{ activeTab }}"</span>
                  </div>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">Variants Showcase</span>
                <div class="variant-group">
                  <h4 class="group-title">Static/Uncontrolled default</h4>
                  <Tabs
                    :items="[
                      { value: 'tab1', label: '여행 코스' },
                      { value: 'tab2', label: '주변 관광지' },
                      { value: 'tab3', label: '주변 맛집' },
                    ]"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- SegmentedControl Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>
                SegmentedControl <span class="badge-tag">navigation/SegmentedControl.vue</span>
              </h3>
              <p>
                2~4개 옵션 선택을 위한 필 토글. 활성 버튼 밑으로 흰색 배경이 이동하는 스프링
                애니메이션 탑재.
              </p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo</span>
                <div class="demo-flex flex-col gap-10">
                  <SegmentedControl
                    v-model="segValue1"
                    :options="segOptions1"
                    style="width: 100%"
                  />
                  <div class="value-display">
                    선택 값 1: <span class="value-string">"{{ segValue1 }}"</span>
                  </div>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">Sizes & Variations</span>

                <div class="variant-group">
                  <h4 class="group-title">Small size (SM) & 3 Options</h4>
                  <div class="demo-flex flex-col gap-10">
                    <SegmentedControl
                      v-model="segValue2"
                      :options="segOptions2"
                      size="sm"
                      style="width: 100%"
                    />
                    <div class="value-display">
                      선택 값 2: <span class="value-string">"{{ segValue2 }}"</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stepper Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>Stepper <span class="badge-tag">feedback/Stepper.vue</span></h3>
              <p>온보딩 및 다단계 폼용 수평 바. 진행도 점(Dot) 애니메이션 및 레이블 텍스트 제공.</p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo</span>
                <div class="demo-flex flex-col gap-10">
                  <Stepper
                    :steps="onboardingSteps.length"
                    :current="currentStep"
                    :labels="onboardingSteps"
                  />

                  <div class="demo-flex margin-top-12">
                    <Button
                      variant="secondary"
                      size="sm"
                      :disabled="currentStep === 0"
                      @click="currentStep--"
                      >이전 단계</Button
                    >
                    <Button
                      variant="primary"
                      size="sm"
                      :disabled="currentStep === onboardingSteps.length - 1"
                      @click="currentStep++"
                      >다음 단계</Button
                    >
                  </div>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">Variants Showcase</span>

                <div class="variant-group">
                  <h4 class="group-title">No Labels (4 steps, current: index 2)</h4>
                  <Stepper :steps="4" :current="2" />
                </div>
              </div>
            </div>
          </div>

          <!-- Toast Card -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>Toast <span class="badge-tag">feedback/Toast.vue</span></h3>
              <p>
                임시 안내용 알림 토스트. Default, Success, AI 세 가지 톤과 좌측 아이콘, 우측 버튼
                액션 지원.
              </p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo (Click to fire)</span>
                <div class="variant-flex wrap gap-8">
                  <Button
                    variant="secondary"
                    size="sm"
                    @click="fireToast('default', '일정이 보관함에 복사되었습니다.', 'copy')"
                  >
                    기본 토스트 띄우기
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    @click="fireToast('success', '성공적으로 저장되었습니다.', 'check')"
                  >
                    성공 토스트 띄우기
                  </Button>
                  <Button
                    variant="ai"
                    size="sm"
                    @click="
                      fireToast('ai', 'AI가 최적화된 여행 코스를 정밀 분석 중입니다...', 'wand')
                    "
                  >
                    AI 토스트 띄우기
                  </Button>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">Static Showcase (Tone Variants)</span>
                <div class="demo-flex flex-col gap-10">
                  <Toast tone="default" message="기본 안내 알림 토스트입니다." icon="bell" />
                  <Toast
                    tone="success"
                    message="원하는 관광지를 콕! 보관함에 담았습니다."
                    icon="check"
                  />
                  <Toast
                    tone="ai"
                    message="AI 일정 분석 및 로드 플래닝이 시작됩니다."
                    icon="wand"
                  />

                  <Toast
                    tone="success"
                    message="코스가 완벽하게 생성되었습니다."
                    icon="check"
                    :action="{ label: '되돌리기', onClick: () => alert('되돌리기 클릭!') }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. BRAND & LAYOUT SECTION (NEW!) -->
      <section id="section-brand-layout" class="gallery-section">
        <div class="section-title-wrap">
          <span class="ds-eyebrow">Category 05</span>
          <h2>Brand & Layout Cards</h2>
        </div>

        <div class="card-grid">
          <!-- Card Component -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>Card <span class="badge-tag">data-display/Card.vue</span></h3>
              <p>기본적인 표면 컨테이너. 패딩 제어 및 마우스 호버 리프트업 인터랙션 지원.</p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo (Hover & Click)</span>
                <div class="demo-flex flex-col gap-10">
                  <Card
                    interactive
                    padding="md"
                    @click="cardClickCount++"
                    style="width: 100%; border-color: var(--coral-300)"
                  >
                    <div style="text-align: center; padding: 10px 0">
                      <h4 style="margin-bottom: 8px; color: var(--coral-600)">인터랙티브 카드</h4>
                      <p style="font-size: var(--fs-body-sm); color: var(--text-secondary)">
                        마우스를 올리면 위로 살짝 올라갑니다. 클릭해보세요!
                      </p>
                    </div>
                  </Card>
                  <div class="value-display">
                    카드 클릭 횟수: <span class="highlight-text">{{ cardClickCount }}</span>
                  </div>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">Padding Variants</span>
                <div class="form-showcase-column">
                  <Card padding="sm" style="background: var(--surface-sunken)">
                    <span class="variant-label">Small Padding (sm: 16px)</span>
                  </Card>
                  <Card padding="md" style="background: var(--surface-sunken)">
                    <span class="variant-label">Medium Padding (md: 20px)</span>
                  </Card>
                  <Card padding="lg" style="background: var(--surface-sunken)">
                    <span class="variant-label">Large Padding (lg: 24px)</span>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <!-- PlaceCard Component -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>PlaceCard <span class="badge-tag">data-display/PlaceCard.vue</span></h3>
              <p>
                코스콕의 시그니처 장소 카드. 내부적으로 Badge와 Rating 하위 컴포넌트를 조립해 개발.
              </p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo (Bookmark Toggle)</span>
                <div
                  style="display: flex; gap: 20px; align-items: flex-start; justify-content: center"
                >
                  <PlaceCard
                    v-model:saved="placeSaved"
                    image="https://picsum.photos/id/1015/300/225"
                    category="관광지"
                    title="성산일출봉"
                    region="제주 서귀포시 성산읍"
                    :rating="4.8"
                    :reviewCount="1402"
                    meta="일몰 뷰 명소"
                    @click="placeCardClickMsg = '성산일출봉 카드를 클릭하셨습니다!'"
                    style="width: 260px"
                  />

                  <div style="flex: 1; display: flex; flex-direction: column; gap: 12px">
                    <div class="value-display">
                      북마크 상태:
                      <strong class="highlight-text">{{
                        placeSaved ? '저장됨 (true)' : '미저장 (false)'
                      }}</strong>
                    </div>
                    <div class="value-display">
                      클릭 이벤트:
                      <span style="font-size: var(--fs-caption)">{{ placeCardClickMsg }}</span>
                    </div>
                    <Button variant="secondary" size="sm" @click="placeSaved = !placeSaved">
                      외부에서 북마크 토글
                    </Button>
                  </div>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">Category Assembly & Tone Variants</span>
                <div class="variant-flex wrap gap-16" style="justify-content: center">
                  <PlaceCard
                    :saved="placeSaved2"
                    @update:saved="(val) => (placeSaved2 = val)"
                    category="음식점"
                    title="제주 늘봄흑돼지"
                    region="제주 제주시 노형동"
                    :rating="4.2"
                    :reviewCount="324"
                    meta="식사시간 웨이팅 있음"
                    style="width: 220px"
                  />
                  <PlaceCard
                    :saved="false"
                    category="숙박"
                    title="해비치 호텔 & 리조트"
                    region="제주 서귀포시 표선면"
                    :rating="4.9"
                    :reviewCount="588"
                    meta="바다 전망 최상"
                    style="width: 220px"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Mascot Component -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>Mascot <span class="badge-tag">brand/Mascot.vue</span></h3>
              <p>
                공식 마스코트 '콕이' 인라인 SVG 벡터 컴포넌트. 감정 상태에 따라 얼굴/팔/반짝이
                실시간 동기화.
              </p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo (Variant switcher + Pop trigger)</span>
                <div class="demo-flex flex-col gap-16" style="align-items: center">
                  <Mascot :variant="mascotVariant" :pop="mascotPop" :size="130" />

                  <div style="display: flex; flex-direction: column; gap: 8px; width: 100%">
                    <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap">
                      <Button
                        v-for="v in ['default', 'saved', 'cheer', 'guide', 'wink']"
                        :key="v"
                        variant="secondary"
                        size="sm"
                        :style="
                          mascotVariant === v
                            ? { borderColor: 'var(--coral-500)', color: 'var(--coral-600)' }
                            : {}
                        "
                        @click="mascotVariant = v"
                      >
                        {{ v }}
                      </Button>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      @click="triggerMascotPop"
                      style="align-self: center; margin-top: 4px"
                    >
                      스프링 Pop 모션 재생 (pop: true)
                    </Button>
                  </div>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">Static Mascot Showcase</span>
                <div
                  class="variant-flex wrap gap-16"
                  style="justify-content: center; align-items: flex-end"
                >
                  <div class="variant-item-center">
                    <Mascot variant="wink" :size="80" />
                    <span class="micro-label">wink (인사)</span>
                  </div>
                  <div class="variant-item-center">
                    <Mascot variant="cheer" :size="80" />
                    <span class="micro-label">cheer (기쁨/성공)</span>
                  </div>
                  <div class="variant-item-center">
                    <Mascot variant="guide" :size="80" />
                    <span class="micro-label">guide (AI 길안내)</span>
                  </div>
                  <div class="variant-item-center">
                    <Mascot variant="saved" :size="80" />
                    <span class="micro-label">saved (콕! 저장)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- MascotBubble Component -->
          <div class="gallery-card">
            <div class="card-header">
              <h3>MascotBubble <span class="badge-tag">brand/MascotBubble.vue</span></h3>
              <p>
                Mascot을 조립한 캐릭터 말풍선 컴포넌트. AI 팁 안내 및 Onboarding 가이드용 3개 말풍선
                톤 제공.
              </p>
            </div>

            <div class="card-body">
              <div class="demo-block">
                <span class="demo-label">Interactive Demo</span>
                <div class="demo-flex flex-col gap-12">
                  <MascotBubble
                    :variant="mascotVariant"
                    :tone="bubbleTone"
                    :size="90"
                    style="width: 100%"
                  >
                    {{ bubbleText || '(말풍선 텍스트가 비어 있습니다)' }}
                  </MascotBubble>

                  <div
                    style="
                      width: 100%;
                      display: flex;
                      flex-direction: column;
                      gap: 8px;
                      border-top: 1px dashed var(--border);
                      padding-top: 12px;
                    "
                  >
                    <Input v-model="bubbleText" label="말풍선 문구 변경" size="sm" />

                    <div style="display: flex; gap: 8px; align-items: center">
                      <span style="font-size: var(--fs-caption); color: var(--text-secondary)"
                        >말풍선 톤:</span
                      >
                      <SegmentedControl
                        v-model="bubbleTone"
                        :options="['default', 'coral', 'ai']"
                        size="sm"
                        style="flex: 1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="showcase-block">
                <span class="demo-label">Tone Showcase (Light mode design matching)</span>
                <div class="demo-flex flex-col gap-10">
                  <MascotBubble variant="wink" tone="default" :size="70">
                    일반적인 온보딩 가이드 멘트나 기본 캐릭터 안내 메시지 영역입니다.
                  </MascotBubble>
                  <MascotBubble variant="saved" tone="coral" :size="70">
                    성공적으로 제주 코스가 보관함에 콕! 찍혔습니다. 마이페이지에서 다시 볼 수
                    있어요!
                  </MascotBubble>
                  <MascotBubble variant="guide" tone="ai" :size="70">
                    동선 최적화 결과, 도보 거리가 기존 계획 대비 25% 가량 크게 절감되었습니다!
                  </MascotBubble>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Global Floating Toaster Overlay (for interactive demo) -->
    <div
      v-if="demoToast"
      style="
        position: fixed;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: auto;
      "
    >
      <Toast
        :tone="demoToast.tone"
        :message="demoToast.message"
        :icon="demoToast.icon"
        :action="demoToast.action"
      />
    </div>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- Section 6: Domain Components                                        -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <section class="gallery-section">
      <div class="section-header">
        <h2>6. Domain Components</h2>
        <p class="section-sub">
          비즈니스 도메인 컴포넌트 — 아토믹 UI를 조립해 실제 서비스 로직을 구현합니다.
        </p>
      </div>

      <!-- CourseMap -->
      <div class="gallery-card">
        <div class="card-header">
          <h3>CourseMap <span class="badge-tag">domain/CourseMap.vue</span></h3>
          <p>
            코스(일정)를 벡터 지도 위에 동선으로 시각화. 핀 클릭 시 장소 상세 패널 표시.
            프로덕션에서는 SVG를 Kakao Map SDK로 교체.
          </p>
        </div>
        <div class="card-body">
          <div class="demo-block">
            <span class="demo-label">DAY 필터</span>
            <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap">
              <button
                v-for="opt in [
                  ['all', '전체'],
                  [0, 'DAY 1'],
                  [1, 'DAY 2'],
                  [2, 'DAY 3'],
                ]"
                :key="opt[0]"
                @click="mapActiveDay = opt[0]"
                :style="{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border-strong)',
                  background: mapActiveDay === opt[0] ? 'var(--coral-500)' : 'var(--surface)',
                  color: mapActiveDay === opt[0] ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '13px',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all var(--dur-fast) var(--ease-out)',
                }"
              >
                {{ opt[1] }}
              </button>
            </div>
            <CourseMap
              :days="aiPlan.days"
              :active-day="mapActiveDay"
              :height="340"
              @select="
                (stop) =>
                  stop &&
                  openOverlay({
                    ...stop,
                    region: '제주',
                    rating: 4.8,
                    reviews: 320,
                    desc: '코스 중 선택된 장소입니다.',
                    tags: ['제주', '추천'],
                    meta: '차로 10분',
                  })
              "
            />
          </div>
        </div>
      </div>

      <!-- PlaceDetailOverlay -->
      <div class="gallery-card">
        <div class="card-header">
          <h3>PlaceDetailOverlay <span class="badge-tag">domain/PlaceDetailOverlay.vue</span></h3>
          <p>
            장소 상세 정보를 보여주는 모달 오버레이. ESC 키 닫기 · 바디 스크롤 잠금 · Teleport 지원.
          </p>
        </div>
        <div class="card-body">
          <div class="demo-block">
            <span class="demo-label">장소를 선택해 오버레이 열기</span>
            <div style="display: flex; gap: 12px; flex-wrap: wrap">
              <button
                v-for="place in places.slice(0, 4)"
                :key="place.id"
                @click="(openOverlay(place), (overlaySaved = false))"
                :style="{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--border-strong)',
                  background: 'var(--surface)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--text-primary)',
                  transition: 'all var(--dur-fast) var(--ease-out)',
                }"
              >
                📍 {{ place.title }}
              </button>
            </div>
            <div class="value-display" style="margin-top: 12px">
              열린 장소:
              <strong class="highlight-text">{{
                overlayPlace ? overlayPlace.title : '없음'
              }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- JournalBlock -->
      <div class="gallery-card">
        <div class="card-header">
          <h3>JournalBlock <span class="badge-tag">domain/JournalBlock.vue</span></h3>
          <p>
            여행 장소별 사진·후기 기록 CRUD 블록. v-model:entries로 상태 완전 제어. PhotoUploader는
            FileReader API로 대체.
          </p>
        </div>
        <div class="card-body">
          <div class="demo-block">
            <span class="demo-label">협재 해변 기록 (시드 1개 포함)</span>
            <JournalBlock v-model:entries="journalEntries" />
            <div class="value-display" style="margin-top: 12px">
              기록 수: <strong class="highlight-text">{{ journalEntries.length }}개</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PlaceDetailOverlay (Teleport to body) -->
    <PlaceDetailOverlay
      :place="overlayPlace"
      :saved="overlaySaved"
      @close="closeOverlay"
      @toggle-save="toggleSave"
    />

    <!-- Footer -->
    <footer class="gallery-footer">
      <p>© 2026 CourseKok Team. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
/* ── Layout & Wrapper ────────────────────────────────────────────────── */
.gallery-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-sans);
}

.gallery-header {
  background: var(--surface);
  border-bottom: 1.5px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-xs);
  transition: all var(--dur-base) var(--ease-out);
}

.header-container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 16px var(--gutter);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-kkok {
  background: linear-gradient(120deg, var(--coral-500), var(--coral-600));
  color: #fff;
  font-size: var(--fs-title);
  font-weight: var(--fw-extrabold);
  padding: 4px 10px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  display: inline-block;
  transform: rotate(-3deg);
}

.logo-title {
  font-size: var(--fs-h4);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
}

.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--surface-sunken);
  color: var(--text-secondary);
  border: 1.5px solid var(--border);
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out);
}

.theme-toggle-btn:hover {
  background: var(--border-subtle);
  color: var(--text-primary);
  border-color: var(--border-strong);
}

/* ── Sticky Nav ──────────────────────────────────────────────────────── */
.gallery-nav {
  background: var(--surface);
  border-bottom: 1.5px solid var(--border);
  position: sticky;
  top: 74px; /* header height */
  z-index: 90;
  box-shadow: var(--shadow-xs);
}

.nav-container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--gutter);
  display: flex;
  gap: 24px;
}

.nav-link {
  color: var(--text-secondary);
  font-weight: var(--fw-semibold);
  font-size: var(--fs-body-sm);
  padding: 14px 0;
  border-bottom: 3px solid transparent;
  transition: all var(--dur-fast) var(--ease-out);
}

.nav-link:hover {
  color: var(--primary);
  text-decoration: none;
}

.nav-link:focus-visible,
.nav-link:active {
  border-bottom-color: var(--primary);
  color: var(--primary);
}

/* ── Main Layout ─────────────────────────────────────────────────────── */
.gallery-main {
  flex: 1;
  max-width: var(--container-max);
  width: 100%;
  margin: 0 auto;
  padding: 32px var(--gutter);
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.intro-section {
  width: 100%;
}

.intro-card {
  background: linear-gradient(135deg, var(--coral-50) 0%, rgba(255, 255, 255, 0.7) 100%);
  border: 1.5px solid var(--coral-100);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-sm);
}

/* Dark theme specific card style adjustment */
[data-theme='dark'] .intro-card {
  background: linear-gradient(135deg, #2a1f1a 0%, #1e1b18 100%);
  border: 1.5px solid #4a2d21;
}

.intro-card h2 {
  font-size: var(--fs-h2);
  color: var(--coral-600);
  margin-bottom: 12px;
}

.intro-card p {
  color: var(--text-secondary);
  font-size: var(--fs-body-lg);
  line-height: var(--lh-relaxed);
}

.intro-card strong {
  color: var(--text-primary);
  font-weight: var(--fw-bold);
}

.gallery-section {
  scroll-margin-top: 140px; /* Header + Nav offset */
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title-wrap h2 {
  font-size: var(--fs-h2);
  font-weight: var(--fw-extrabold);
  color: var(--text-primary);
}

/* ── Cards Grid ──────────────────────────────────────────────────────── */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 32px;
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

.gallery-card {
  background: var(--surface);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow var(--dur-base) var(--ease-out);
}

.gallery-card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  padding: 24px;
  border-bottom: 1.5px solid var(--border-subtle);
  background: var(--surface-sunken);
}

.card-header h3 {
  font-size: var(--fs-h3);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.badge-tag {
  font-size: var(--fs-micro);
  font-family: var(--font-mono);
  font-weight: var(--fw-regular);
  background: var(--border-strong);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: var(--radius-xs);
}

.card-header p {
  margin-top: 8px;
  font-size: var(--fs-body-sm);
  color: var(--text-muted);
  line-height: var(--lh-snug);
}

.card-body {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Demo Blocks ─────────────────────────────────────────────────────── */
.demo-block {
  background: var(--surface-sunken);
  border: 1.5px dashed var(--border-strong);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-label {
  font-size: 11px;
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  color: var(--primary);
  letter-spacing: var(--ls-caps);
  margin-bottom: 4px;
  display: block;
}

.demo-flex {
  display: flex;
  align-items: center;
  gap: 16px;
}

.demo-flex.flex-col {
  flex-direction: column;
  align-items: flex-start;
}

.interactive-status {
  font-size: var(--fs-body-sm);
  color: var(--text-secondary);
}

.highlight-text {
  color: var(--coral-500);
  font-weight: var(--fw-bold);
}

.showcase-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Showcase Items ──────────────────────────────────────────────────── */
.variant-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 16px;
}

.variant-group:first-of-type {
  border-top: none;
  padding-top: 0;
}

.group-title {
  font-size: var(--fs-caption);
  font-weight: var(--fw-bold);
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.variant-flex {
  display: flex;
  gap: 12px;
}

.variant-flex.wrap {
  flex-wrap: wrap;
}

.variant-flex.gap-8 {
  gap: 8px;
}
.variant-flex.gap-12 {
  gap: 12px;
}
.variant-flex.gap-16 {
  gap: 16px;
}

.variant-flex.items-center {
  align-items: center;
}

.variant-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.variant-item-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.variant-label {
  font-size: 11px;
  color: var(--text-muted);
}

.micro-label {
  font-size: 10px;
  color: var(--text-muted);
  text-align: center;
}

.margin-top-12 {
  margin-top: 12px;
}
.margin-top-20 {
  margin-top: 20px;
}

/* ── Form Controls Specific Styles ───────────────────────────────────── */
.demo-form-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-form-controls {
  padding-top: 12px;
  border-top: 1px dashed var(--border);
}

.value-display {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 8px 12px;
  border-radius: var(--radius-xs);
  font-size: var(--fs-caption);
  font-family: var(--font-mono);
  color: var(--text-secondary);
  width: 100%;
}

.value-display-sm {
  font-size: var(--fs-caption);
  font-family: var(--font-mono);
  color: var(--text-secondary);
}

.value-string {
  color: var(--success);
  font-weight: var(--fw-semibold);
}

.form-showcase-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toggle-demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 480px) {
  .toggle-demo-grid {
    grid-template-columns: 1fr;
  }
}

.toggle-demo-box {
  background: var(--surface);
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Data Display Specific Styles ────────────────────────────────────── */
.avatar-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.avatar-show-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-show-item span {
  font-size: var(--fs-micro);
  color: var(--text-muted);
}

.rating-interactive-row {
  background: var(--surface);
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  display: inline-flex;
}

.rating-display-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rating-display-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--fs-body-sm);
  color: var(--text-secondary);
  background: var(--surface-sunken);
  padding: 8px 12px;
  border-radius: var(--radius-md);
}

.chip-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-selection-list {
  font-weight: var(--fw-bold);
  color: var(--coral-500);
}

/* ── Footer ──────────────────────────────────────────────────────────── */
.gallery-footer {
  background: var(--surface);
  border-top: 1.5px solid var(--border-subtle);
  text-align: center;
  padding: 24px var(--gutter);
  color: var(--text-muted);
  font-size: var(--fs-caption);
  transition: all var(--dur-base) var(--ease-out);
}
</style>
