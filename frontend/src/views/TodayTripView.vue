<script setup>
/**
 * TodayTripView.vue — 오늘의 여행 뷰
 * ─────────────────────────────────────────────────────────────
 * 원본: raw-wireframe/output/scripts/오늘의_여행.js
 *
 * 두 모드:
 *   'live'  — 오늘 동선 체크인 (NextStopCard + TodayList)
 *   'album' — 다녀온 곳 사진 앨범 + 후기 편집 + TripLog 공개
 *
 * CaptureSheet: Teleport to body 모달 (체크인 시 별점+사진+메모 입력)
 *
 * 전역 주입:
 *   - inject('currentTrip') : Trip | null — 오늘 진행 중인 여행
 *   - inject('showToast')   : (cfg) => void
 *   - inject('navigate')    : (view) => void
 *
 * React → Vue 매핑:
 *   - React.useState({})   → ref({}) (visited 기록)
 *   - React.useState(null) → ref(null) (capture 모달)
 *   - PhotoUploader (window.Kit) → 자체 file input + FileReader
 *   - StarPick → Rating.vue (readonly false)
 */

import { ref, computed, inject } from 'vue'
import { aiPlan } from '@/data/mockData.js'
import { catColor, catTone } from '@/composables/useKitUtils.js'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import Mascot from '@/components/brand/Mascot.vue'
import Rating from '@/components/data-display/Rating.vue'

// ── 전역 주입 ──────────────────────────────────────────────────────────────
const currentTrip = inject('currentTrip', ref(null))
const showToast   = inject('showToast', () => {})
const navigate    = inject('navigate', () => {})

// ── 기본 여행 데이터 ──────────────────────────────────────────────────────
const baseTrip = computed(() =>
  currentTrip.value || {
    title: '제주 힐링 코스',
    cover: 'https://picsum.photos/seed/hyeopjae/800/600',
    region: '제주', period: '2박 3일',
  }
)
const days = computed(() =>
  baseTrip.value.plan?.days ?? aiPlan.days
)

// ── 모드 / 일자 상태 ──────────────────────────────────────────────────────
const mode    = ref('live')  // 'live' | 'album'
const di      = ref(0)       // 현재 일자 인덱스

// ── 방문 기록: { 'di-ii': { rating, photos, memo } } ─────────────────────
const visited = ref({})
const keyOf = (dayIdx, itemIdx) => `${dayIdx}-${itemIdx}`

// ── 현재 일정 아이템 ───────────────────────────────────────────────────────
const items = computed(() => days.value[di.value].items)
const nextIi = computed(() =>
  items.value.findIndex((_, ii) => !visited.value[keyOf(di.value, ii)])
)
const nextStop = computed(() =>
  nextIi.value >= 0 ? items.value[nextIi.value] : null
)
const doneCount = computed(() =>
  items.value.filter((_, ii) => visited.value[keyOf(di.value, ii)]).length
)
const totalVisited = computed(() => Object.keys(visited.value).length)
const totalStops = computed(() => days.value.reduce((a, d) => a + d.items.length, 0))

// ── 체크인 모달 ───────────────────────────────────────────────────────────
const capture = ref(null) // { di, ii } | null

function openCapture() {
  capture.value = { di: di.value, ii: nextIi.value }
  captureRating.value = 5
  capturePhotos.value = []
  captureMemo.value = ''
}

// 체크인 기록 로컬 상태
const captureRating = ref(5)
const capturePhotos = ref([])
const captureMemo   = ref('')

function commitCapture(rec) {
  visited.value = {
    ...visited.value,
    [keyOf(capture.value.di, capture.value.ii)]: rec,
  }
  capture.value = null
}

function skipCapture() {
  commitCapture({ rating: 0, photos: [], memo: '' })
}

// ── Album 앨범 데이터 ─────────────────────────────────────────────────────
const visitedStops = computed(() => {
  const stops = []
  days.value.forEach((d, dayIdx) =>
    d.items.forEach((it, ii) => {
      const rec = visited.value[keyOf(dayIdx, ii)]
      if (rec) stops.push({ dayIdx, ii, it, rec })
    })
  )
  return stops
})

const allPhotos = computed(() =>
  visitedStops.value.flatMap((s) => s.rec.photos || [])
)
const ratings = computed(() =>
  visitedStops.value.map((s) => s.rec.rating).filter(Boolean)
)
const avgRating = computed(() =>
  ratings.value.length
    ? (ratings.value.reduce((a, b) => a + b, 0) / ratings.value.length).toFixed(1)
    : null
)
const albumCover = computed(() =>
  allPhotos.value[0] ||
  baseTrip.value.cover ||
  (visitedStops.value[0]?.it.img)
)

// ── 메모 수정 ─────────────────────────────────────────────────────────────
function setMemo(k, val) {
  visited.value = {
    ...visited.value,
    [k]: { ...visited.value[k], memo: val },
  }
}

// ── 공개 ─────────────────────────────────────────────────────────────────
function handlePublish() {
  showToast({ tone: 'success', message: 'TripLog에 공개됐어요! 🎉', icon: 'globe' })
  navigate('triplog')
}

// ── 사진 업로드 ────────────────────────────────────────────────────────────
function onCapturePhotoInput(e) {
  const files = Array.from(e.target.files ?? []).slice(0, 3 - capturePhotos.value.length)
  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      capturePhotos.value = [...capturePhotos.value, ev.target.result]
    }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

function removeCapturePhoto(i) {
  capturePhotos.value = capturePhotos.value.filter((_, idx) => idx !== i)
}
</script>

<template>
  <div style="max-width: 880px; margin: 0 auto; padding: 28px 24px 90px;">

    <!-- ── 헤더 ─────────────────────────────────────────────────────────── -->
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: var(--coral-600); margin-bottom: 4px;">
          {{ baseTrip.region }} · {{ baseTrip.period }}
        </div>
        <h1 style="font-size: 27px; font-weight: 800; letter-spacing: -0.02em;">
          {{ baseTrip.title }}
        </h1>
      </div>

      <!-- live ↔ album 토글 -->
      <div style="
        display: inline-flex; padding: 4px; background: var(--gray-100);
        border-radius: var(--radius-pill); flex: none;
      ">
        <button
          v-for="opt in [
            { k: 'live',  label: '오늘 일정' },
            { k: 'album', label: `여행 기록${totalVisited ? ' ' + totalVisited : ''}` },
          ]"
          :key="opt.k"
          @click="mode = opt.k"
          :style="{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '8px 16px', borderRadius: 'var(--radius-pill)',
            border: 'none', cursor: 'pointer',
            background: mode === opt.k ? 'var(--surface)' : 'transparent',
            color: mode === opt.k ? 'var(--coral-600)' : 'var(--text-secondary)',
            fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
            boxShadow: mode === opt.k ? 'var(--shadow-xs)' : 'none',
            transition: 'background var(--dur-fast)',
          }"
        >{{ opt.label }}</button>
      </div>
    </div>

    <!-- ══════════════ LIVE 모드 ══════════════ -->
    <template v-if="mode === 'live'">
      <!-- DAY 선택 + 진행 카운트 -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 18px; flex-wrap: wrap;">
        <button
          v-for="(d, i) in days"
          :key="i"
          @click="di = i"
          :style="{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            height: '38px', padding: '0 15px', borderRadius: 'var(--radius-pill)',
            cursor: 'pointer',
            border: '1px solid ' + (di === i ? 'transparent' : 'var(--border)'),
            background: di === i ? 'var(--coral-500)' : 'var(--surface)',
            color: di === i ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-sans)',
          }"
        >
          <svg
            v-if="d.items.every((_, ii) => visited[keyOf(i, ii)])"
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            :stroke="di === i ? '#fff' : 'var(--mint-500)'"
            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
          ><polyline points="20 6 9 17 4 12"/></svg>
          DAY {{ d.day }}
        </button>
        <div style="flex: 1;" />
        <span style="font-size: 13.5px; font-weight: 700; color: var(--text-secondary);">
          오늘 {{ doneCount }}/{{ items.length }} 곳
        </span>
      </div>

      <!-- 진행 바 -->
      <div style="
        height: 8px; border-radius: var(--radius-pill);
        background: var(--gray-100); overflow: hidden; margin-bottom: 22px;
      ">
        <div :style="{
          height: '100%',
          width: `${items.length ? (doneCount / items.length) * 100 : 0}%`,
          background: 'linear-gradient(90deg, var(--coral-400), var(--coral-500))',
          borderRadius: 'var(--radius-pill)',
          transition: 'width var(--dur-slow) var(--ease-spring)',
        }" />
      </div>

      <!-- 다음 목적지 카드 -->
      <div v-if="nextStop" style="
        position: relative; border-radius: var(--radius-2xl); overflow: hidden;
        box-shadow: var(--shadow-md); border: 1px solid var(--border-subtle);
      ">
        <img :src="nextStop.img" alt="" style="width: 100%; height: 290px; object-fit: cover; display: block;" />
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(26,22,17,0.84), rgba(26,22,17,0.05) 58%);" />

        <!-- 지금 향할 곳 뱃지 -->
        <div style="
          position: absolute; top: 16px; left: 16px;
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 13px; border-radius: var(--radius-pill);
          background: rgba(255,255,255,0.92); backdrop-filter: blur(6px);
          font-size: 12.5px; font-weight: 800; color: var(--coral-600);
        ">
          <span style="
            width: 7px; height: 7px; border-radius: 50%;
            background: var(--coral-500);
            animation: kok-pulse 1.8s infinite;
          " />
          지금 향할 곳
        </div>

        <!-- 정차지 정보 -->
        <div style="position: absolute; left: 20px; right: 20px; bottom: 18px; color: #fff;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 7px;">
            <span style="
              width: 26px; height: 26px; border-radius: 50%;
              background: var(--coral-500); color: #fff;
              font-weight: 800; font-size: 13px;
              display: flex; align-items: center; justify-content: center; flex: none;
            ">{{ nextIi + 1 }}</span>
            <span style="font-size: 13px; font-weight: 700; opacity: 0.92;">{{ nextStop.time }}</span>
            <span style="
              display: inline-flex; align-items: center; gap: 5px;
              padding: 3px 9px; border-radius: var(--radius-pill);
              background: rgba(255,255,255,0.2); font-size: 12px; font-weight: 700;
            ">
              <span :style="{ width: '7px', height: '7px', borderRadius: '50%', background: catColor[nextStop.cat] }" />
              {{ nextStop.cat }}
            </span>
          </div>
          <h2 style="font-size: 28px; font-weight: 800; letter-spacing: -0.02em;">{{ nextStop.title }}</h2>
          <p style="font-size: 14.5px; opacity: 0.9; margin-top: 4px;">{{ nextStop.note }}</p>

          <!-- 이동 수단 -->
          <div v-if="nextStop.move" style="
            display: inline-flex; align-items: center; gap: 7px;
            margin-top: 12px; padding: 7px 13px;
            border-radius: var(--radius-pill);
            background: rgba(255,255,255,0.16); backdrop-filter: blur(4px);
            font-size: 13px; font-weight: 700;
          ">
            {{ nextStop.move.mode }} · {{ nextStop.move.time }}
          </div>

          <div style="margin-top: 16px;">
            <Button variant="primary" size="lg" :full-width="true" @click="openCapture">
              <template #left-icon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </template>
              여기 도착! 콕 체크인
            </Button>
          </div>
        </div>
      </div>

      <!-- 모두 완료 -->
      <div v-else style="
        position: relative; text-align: center; padding: 36px 24px;
        border-radius: var(--radius-2xl);
        background: linear-gradient(135deg, var(--mint-50), var(--sky-50));
        border: 1px solid var(--mint-100); overflow: hidden;
      ">
        <div aria-hidden style="
          position: absolute; inset: 0; opacity: 0.4;
          background-image: radial-gradient(var(--mint-200) 2px, transparent 2px);
          background-size: 16px 16px;
        " />
        <div style="position: relative;">
          <Mascot variant="cheer" :size="104" :pop="true" />
          <h2 style="font-size: 23px; font-weight: 800; margin-top: 8px; letter-spacing: -0.02em;">
            DAY {{ days[di].day }} 코스를 모두 다녀왔어요!
          </h2>
          <p style="font-size: 15px; color: var(--text-secondary); margin-top: 6px;">
            오늘의 추억이 여행 기록에 차곡차곡 담겼어요.
          </p>
          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 18px; flex-wrap: wrap;">
            <Button
              v-if="di < days.length - 1"
              variant="secondary" size="lg"
              @click="di++"
            >
              <template #left-icon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </template>
              다음 날 일정 보기
            </Button>
            <Button variant="primary" size="lg" @click="mode = 'album'">
              <template #left-icon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </template>
              여행 기록 보기
            </Button>
          </div>
        </div>
      </div>

      <!-- 오늘 동선 리스트 -->
      <div style="margin-top: 26px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <h3 style="font-size: 16.5px; font-weight: 800;">DAY {{ days[di].day }} 동선</h3>
          <Badge tone="neutral" size="sm">{{ days[di].theme }}</Badge>
        </div>
        <div style="display: flex; flex-direction: column;">
          <div
            v-for="(it, ii) in items"
            :key="ii"
            style="display: flex; align-items: center; gap: 12px; padding: 12px 4px;"
          >
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; flex: none;">
              <span :style="{
                width: '30px', height: '30px', borderRadius: '50%', flex: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '13px',
                background: visited[keyOf(di, ii)]
                  ? 'var(--mint-500)'
                  : (!visited[keyOf(di, ii)] && items.slice(0, ii).every((_, k) => visited[keyOf(di, k)]))
                    ? 'var(--coral-500)' : 'var(--gray-100)',
                color: (visited[keyOf(di, ii)] || (!visited[keyOf(di, ii)] && items.slice(0, ii).every((_, k) => visited[keyOf(di, k)]))) ? '#fff' : 'var(--text-muted)',
              }">
                <svg v-if="visited[keyOf(di, ii)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <template v-else>{{ ii + 1 }}</template>
              </span>
              <span v-if="ii < items.length - 1" style="width: 2px; height: 22px; background: var(--border); margin-top: 2px;" />
            </div>

            <!-- 썸네일 -->
            <div style="width: 46px; height: 46px; border-radius: var(--radius-sm); overflow: hidden; flex: none;">
              <img
                :src="visited[keyOf(di, ii)]?.photos?.[0] || it.img"
                alt=""
                :style="{
                  width: '100%', height: '100%', objectFit: 'cover',
                  filter: visited[keyOf(di, ii)]
                    ? 'none'
                    : items.slice(0, ii).every((_, k) => visited[keyOf(di, k)])
                      ? 'none' : 'grayscale(0.35) opacity(0.7)',
                }"
              />
            </div>

            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; gap: 7px;">
                <b style="font-size: 15px;" :style="{ color: visited[keyOf(di, ii)] ? 'var(--text-primary)' : 'var(--text-muted)' }">
                  {{ it.title }}
                </b>
                <span v-if="visited[keyOf(di, ii)]?.rating" style="
                  display: inline-flex; align-items: center; gap: 3px;
                  font-size: 12.5px; font-weight: 700; color: var(--amber-600);
                ">
                  ⭐ {{ visited[keyOf(di, ii)].rating }}
                </span>
              </div>
              <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 1px;">
                {{ it.time }} ·
                {{ visited[keyOf(di, ii)] ? '다녀옴' : items.slice(0, ii).every((_, k) => visited[keyOf(di, k)]) ? '다음 차례' : '예정' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════ ALBUM 모드 ══════════════ -->
    <template v-else>
      <!-- 앨범 없을 때 -->
      <div v-if="visitedStops.length === 0" style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <Mascot variant="wink" :size="92" />
        <p style="font-size: 15.5px; margin-top: 12px; line-height: 1.6;">
          아직 다녀온 곳이 없어요.<br />오늘 일정에서 콕 체크인하면 이곳에 추억이 쌓여요.
        </p>
      </div>

      <template v-else>
        <!-- 앨범 커버 헤더 -->
        <div style="position: relative; border-radius: var(--radius-2xl); overflow: hidden; margin-bottom: 20px;">
          <img :src="albumCover" alt="" style="width: 100%; height: 200px; object-fit: cover;" />
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(26,22,17,0.78), transparent 64%);" />
          <div style="position: absolute; left: 22px; right: 22px; bottom: 18px; color: #fff;">
            <Badge tone="mint" :solid="true">여행 기록</Badge>
            <h1 style="font-size: 27px; font-weight: 800; letter-spacing: -0.02em; margin-top: 8px;">
              {{ baseTrip.title }}
            </h1>
            <div style="display: flex; gap: 16px; margin-top: 8px; font-size: 13.5px; font-weight: 600; opacity: 0.94;">
              <span>📍 {{ visitedStops.length }}곳 다녀옴</span>
              <span>📷 사진 {{ allPhotos.length }}장</span>
              <span v-if="avgRating">⭐ 평균 {{ avgRating }}</span>
            </div>
          </div>
        </div>

        <!-- 일자별 타임라인 -->
        <div v-for="(d, dayIdx) in days" :key="dayIdx" style="margin-bottom: 8px;">
          <template v-if="d.items.some((_, ii) => visited[keyOf(dayIdx, ii)])">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
              <span style="
                width: 30px; height: 30px; border-radius: 50%;
                background: var(--coral-500); color: #fff;
                font-weight: 800; font-size: 14px;
                display: flex; align-items: center; justify-content: center;
              ">{{ d.day }}</span>
              <b style="font-size: 16.5px;">DAY {{ d.day }} · {{ d.theme }}</b>
            </div>

            <div
              v-for="(it, ii) in d.items"
              :key="ii"
            >
              <template v-if="visited[keyOf(dayIdx, ii)]">
                <div style="display: flex; gap: 14px; margin-bottom: 4px;">
                  <!-- 타임라인 도트 -->
                  <div style="display: flex; flex-direction: column; align-items: center; flex: none;">
                    <span :style="{
                      width: '11px', height: '11px', borderRadius: '50%',
                      background: catColor[it.cat],
                      border: '2.5px solid var(--surface)',
                    }" />
                    <span style="flex: 1; width: 2px; background: var(--border); margin-top: 4px;" />
                  </div>

                  <div style="flex: 1; padding-bottom: 22px; min-width: 0;">
                    <!-- 정차지 메타 -->
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <span style="font-size: 12.5px; font-weight: 700; color: var(--text-muted);">{{ it.time }}</span>
                      <b style="font-size: 16px;">{{ it.title }}</b>
                      <Badge :tone="catTone(it.cat)" size="sm">{{ it.cat }}</Badge>
                      <div style="flex: 1;" />
                      <Rating
                        :model-value="visited[keyOf(dayIdx, ii)].rating || 0"
                        :size="15"
                        :readonly="true"
                      />
                    </div>

                    <!-- 사진 그리드 -->
                    <div
                      v-if="visited[keyOf(dayIdx, ii)].photos?.length > 0"
                      :style="{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.min(visited[keyOf(dayIdx, ii)].photos.length, 3)}, 1fr)`,
                        gap: '7px', marginBottom: '10px',
                      }"
                    >
                      <img
                        v-for="(src, pi) in visited[keyOf(dayIdx, ii)].photos"
                        :key="pi"
                        :src="src"
                        alt=""
                        style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-md);"
                      />
                    </div>

                    <!-- 메모 textarea -->
                    <textarea
                      :value="visited[keyOf(dayIdx, ii)].memo || ''"
                      @input="(e) => setMemo(keyOf(dayIdx, ii), e.target.value)"
                      rows="2"
                      placeholder="이곳에서의 추억을 적어보세요…"
                      style="
                        width: 100%; padding: 10px 12px;
                        border: 1px solid var(--border-subtle);
                        border-radius: var(--radius-md); resize: vertical;
                        font-size: 14px; font-family: var(--font-sans); line-height: 1.6;
                        outline: none; box-sizing: border-box; background: var(--gray-50);
                      "
                    />
                  </div>
                </div>
              </template>
            </div>
          </template>
        </div>

        <!-- TripLog 공개 CTA -->
        <div style="
          display: flex; align-items: center; gap: 14px;
          padding: 18px 20px; border-radius: var(--radius-xl);
          background: var(--mint-50); border: 1px solid var(--mint-100); margin-top: 8px;
        ">
          <Mascot variant="cheer" :size="56" style="flex: none;" />
          <div style="flex: 1;">
            <b style="font-size: 15.5px;">이 기록, 다른 여행자와 나눠볼까요?</b>
            <div style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">
              TripLog에 올리면 내 코스와 사진이 커뮤니티에 공유돼요.
            </div>
          </div>
          <Button variant="primary" size="lg" @click="handlePublish">
            <template #left-icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </template>
            TripLog에 공개
          </Button>
        </div>
      </template>
    </template>
  </div>

  <!-- ── CaptureSheet 모달 (Teleport) ────────────────────────────────────── -->
  <Teleport to="body">
    <div
      v-if="capture"
      @click.self="capture = null"
      style="
        position: fixed; inset: 0; z-index: 80;
        background: var(--overlay-scrim);
        display: flex; align-items: center; justify-content: center; padding: 20px;
      "
    >
      <div
        @click.stop
        style="
          width: 460px; max-width: 94vw;
          background: var(--surface); border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-xl); overflow: hidden;
          animation: kok-fade-up var(--dur-base) var(--ease-spring);
        "
      >
        <!-- 커버 -->
        <div style="position: relative; height: 116px; overflow: hidden;">
          <img :src="days[capture.di].items[capture.ii].img" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(26,22,17,0.72), transparent 70%);" />
          <div style="position: absolute; left: 18px; bottom: 14px; color: #fff;">
            <div style="font-size: 12.5px; font-weight: 700; opacity: 0.9;">✔ 도착 체크인</div>
            <h3 style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; margin-top: 2px;">
              {{ days[capture.di].items[capture.ii].title }}
            </h3>
          </div>
          <button
            @click="capture = null"
            aria-label="닫기"
            style="
              position: absolute; top: 12px; right: 12px;
              width: 32px; height: 32px; border-radius: 50%;
              border: none; background: rgba(0,0,0,0.35); color: #fff;
              cursor: pointer; display: flex; align-items: center; justify-content: center;
            "
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- 입력 영역 -->
        <div style="padding: 20px;">
          <!-- 별점 -->
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
            <span style="font-size: 14px; font-weight: 700;">이곳, 어땠어요?</span>
            <Rating v-model="captureRating" :size="26" />
          </div>

          <!-- 사진 업로더 -->
          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;">
            <div
              v-for="(src, i) in capturePhotos"
              :key="i"
              style="position: relative; width: 80px; height: 80px;"
            >
              <img :src="src" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md);" />
              <button
                @click="removeCapturePhoto(i)"
                style="
                  position: absolute; top: -7px; right: -7px;
                  width: 24px; height: 24px; border-radius: 50%;
                  border: 2px solid var(--surface); background: var(--gray-900); color: #fff;
                  cursor: pointer; display: flex; align-items: center; justify-content: center;
                "
              >✕</button>
            </div>
            <label
              v-if="capturePhotos.length < 3"
              style="
                width: 80px; height: 80px; border-radius: var(--radius-md);
                cursor: pointer; border: 2px dashed var(--coral-200);
                background: var(--coral-50); color: var(--coral-600);
                display: flex; flex-direction: column; align-items: center;
                justify-content: center; gap: 5px; font-weight: 700; font-size: 12px;
              "
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              사진
              <input type="file" accept="image/*" multiple style="display: none;" @change="onCapturePhotoInput" />
            </label>
          </div>

          <!-- 메모 -->
          <textarea
            v-model="captureMemo"
            rows="2"
            placeholder="한 줄 메모 — 무엇이 좋았나요? (선택)"
            style="
              width: 100%; margin-top: 0; padding: 11px 13px;
              border: 1.5px solid var(--border); border-radius: var(--radius-md);
              resize: vertical; font-size: 14.5px; font-family: var(--font-sans);
              line-height: 1.55; outline: none; box-sizing: border-box;
            "
          />

          <!-- 액션 버튼 -->
          <div style="display: flex; gap: 10px; margin-top: 16px;">
            <Button variant="ghost" size="lg" @click="skipCapture">기록 없이 체크인</Button>
            <div style="flex: 1;" />
            <Button
              variant="primary"
              size="lg"
              @click="commitCapture({ rating: captureRating, photos: capturePhotos, memo: captureMemo.trim() })"
            >
              <template #left-icon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </template>
              다녀왔어요
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
