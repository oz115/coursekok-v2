<script setup>
/**
 * MyTripsView.vue — 내 여행 뷰
 * ─────────────────────────────────────────────────────────────
 * 원본: My_Trips_내_여행.js
 *
 * 두 화면 전환:
 *   TripCard 목록 → TripDetail (v-if selectedTrip)
 *
 * TripDetail 내:
 *   - 코스 편집 (StopRow 드래그 재정렬 + 추가/삭제)
 *   - JournalBlock per 정차지
 *   - 공개/비공개 Switch
 *   - CourseMap ↔ 리스트 뷰 토글
 *
 * 전역 주입:
 *   - inject('savedTrips')  : Trip[]
 *   - inject('startTrip')   : (trip) => void → TodayTripView로 이동
 *   - inject('navigate')    : (view) => void
 *   - inject('showToast')   : (cfg) => void
 *
 * React → Vue:
 *   - React.useState([]) → ref([])
 *   - draggable HTML5 DnD → dragstart / dragover / drop 이벤트 + ref
 */

import { ref, computed, inject } from 'vue'
import { aiPlan, tripLogs, places, journalSeed } from '@/data/mockData.js'
import { clone, uid, catTone, catColor } from '@/composables/useKitUtils.js'
import Card from '@/components/data-display/Card.vue'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import CourseMap from '@/components/domain/CourseMap.vue'
import JournalBlock from '@/components/domain/JournalBlock.vue'
import Switch from '@/components/forms/Switch.vue'

// ── 전역 주입 ──────────────────────────────────────────────────────────────
const savedTrips  = inject('savedTrips', ref([]))
const startTrip   = inject('startTrip', () => {})
const navigate    = inject('navigate', () => {})
const showToast   = inject('showToast', () => {})

// 목 데이터 폴백 — savedTrips가 비어있으면 tripLogs[0]를 사용
const trips = computed(() =>
  savedTrips.value && savedTrips.value.length ? savedTrips.value : [tripLogs[0]]
)

// ── 목록 ↔ 상세 전환 ─────────────────────────────────────────────────────
const selectedTrip = ref(null)
const openTrip  = (trip) => { selectedTrip.value = trip; initDetail(trip) }
const closeTrip = () => { selectedTrip.value = null }

// ── TripDetail 로컬 상태 ─────────────────────────────────────────────────
const days        = ref([])
const journal     = ref({})    // { uid: JournalEntry[] }
const visibility  = ref('private')
const courseView  = ref('list')
const addingDay   = ref(null)  // dayIdx | null

// drag & drop
const dragFrom  = ref({ dayIdx: null, itemIdx: null })
const dragOver  = ref(null)

function initDetail(trip) {
  const baseDays = clone(
    trip.plan?.days ? trip.plan.days : aiPlan.days
  ).map((d) => ({
    ...d,
    items: d.items.map((it) => ({ ...it, uid: it.uid || uid() })),
  }))
  days.value = baseDays

  // journalSeed 초기화
  const j = {}
  baseDays.forEach((d) =>
    d.items.forEach((it) => {
      if (journalSeed[it.title]) j[it.uid] = clone(journalSeed[it.title])
    })
  )
  journal.value = j
  visibility.value = trip.visibility || 'private'
  courseView.value = 'list'
  addingDay.value = null
}

// ── 정차지 CRUD ───────────────────────────────────────────────────────────
function deleteItem(dayIdx, itemIdx) {
  days.value[dayIdx].items.splice(itemIdx, 1)
}

function moveItem(dayIdx, itemIdx, dir) {
  const arr = days.value[dayIdx].items
  const to = itemIdx + dir
  if (to < 0 || to >= arr.length) return
  const copy = [...arr]
  ;[copy[itemIdx], copy[to]] = [copy[to], copy[itemIdx]]
  days.value[dayIdx].items = copy
}

function addItem(dayIdx, place) {
  days.value[dayIdx].items.push({
    uid: uid(), time: '시간 미정',
    title: place.title, cat: place.cat,
    note: (place.desc || '').slice(0, 24),
    img: place.img,
    move: { mode: '차', time: '15분', cost: 0 },
  })
  addingDay.value = null
}

// ── 공개 설정 토글 ─────────────────────────────────────────────────────────
function applyVisibility(v) {
  visibility.value = v
  showToast({
    tone: v === 'public' ? 'success' : 'info',
    message: v === 'public' ? 'TripLog에 공개됐어요!' : '비공개로 전환됐어요.',
    icon: v === 'public' ? 'globe' : 'lock',
  })
}

// ── DnD ────────────────────────────────────────────────────────────────────
function onDragStart(dayIdx, itemIdx) {
  dragFrom.value = { dayIdx, itemIdx }
}
function onDragOver(dayIdx, itemIdx) {
  if (dragFrom.value.dayIdx === dayIdx) dragOver.value = itemIdx
}
function onDrop(dayIdx, itemIdx) {
  const { dayIdx: from, itemIdx: fromIdx } = dragFrom.value
  if (from === dayIdx && fromIdx != null && fromIdx !== itemIdx) {
    const arr = [...days.value[dayIdx].items]
    const [moved] = arr.splice(fromIdx, 1)
    arr.splice(itemIdx, 0, moved)
    days.value[dayIdx].items = arr
  }
  dragFrom.value = { dayIdx: null, itemIdx: null }
  dragOver.value = null
}

// ── 사진 총수 계산 ────────────────────────────────────────────────────────
const totalPhotos = computed(() =>
  Object.values(journal.value).reduce(
    (a, arr) => a + arr.reduce((b, e) => b + (e.photos?.length || 0), 0),
    0
  )
)

// ── 바구니에 없는 장소 후보 ────────────────────────────────────────────────
function getCandidates(dayIdx) {
  const have = new Set(days.value[dayIdx].items.map((x) => x.title))
  return places.filter((p) => !have.has(p.title))
}

// ── 아이콘 SVG helpers ────────────────────────────────────────────────────
const miniBtn = {
  border: 'none', background: 'transparent',
  width: '28px', height: '24px', borderRadius: '6px',
  cursor: 'pointer', color: 'var(--text-muted)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
</script>

<template>
  <div style="max-width: 840px; margin: 0 auto; padding: 32px 24px 90px;">

    <!-- ══════════ 목록 뷰 ══════════ -->
    <template v-if="!selectedTrip">
      <!-- 헤더 배너 -->
      <div style="
        position: relative; border-radius: var(--radius-2xl); overflow: hidden;
        background: linear-gradient(120deg, var(--coral-50), #FFF9F4 70%);
        padding: 24px 26px; margin-bottom: 22px;
      ">
        <div aria-hidden style="
          position: absolute; inset: 0; opacity: 0.4;
          background-image: radial-gradient(var(--coral-200) 2px, transparent 2px);
          background-size: 16px 16px;
        " />
        <div style="position: relative; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h1 style="font-size: 29px; font-weight: 800; letter-spacing: -0.02em;">내 여행</h1>
            <p style="color: var(--text-secondary); font-size: 15.5px; margin-top: 4px;">
              코스를 다듬고, 사진과 글로 추억을 남겨보세요.
            </p>
          </div>
          <Badge tone="coral" :solid="true">{{ trips.length }}개의 여행</Badge>
        </div>
      </div>

      <!-- 여행 카드 목록 -->
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <Card
          v-for="(trip, i) in trips"
          :key="i"
          padding="none"
          :interactive="true"
          style="overflow: hidden;"
          @click="openTrip(trip)"
        >
          <div style="display: flex;">
            <!-- 커버 이미지 -->
            <div style="position: relative; width: 156px; flex: none;">
              <img :src="trip.cover" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
              <span :style="{
                position: 'absolute', top: '10px', left: '10px',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '4px 9px', borderRadius: 'var(--radius-pill)',
                background: trip.visibility === 'public' ? 'var(--mint-500)' : 'rgba(26,22,17,0.6)',
                color: '#fff', fontSize: '11px', fontWeight: 700,
                whiteSpace: 'nowrap', backdropFilter: 'blur(4px)',
              }">
                <svg v-if="trip.visibility === 'public'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                {{ trip.visibility === 'public' ? '공개' : '비공개' }}
              </span>
            </div>
            <!-- 정보 -->
            <div style="padding: 16px 18px; flex: 1;">
              <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                <Badge tone="coral">{{ trip.region }}</Badge>
                <Badge tone="neutral">{{ trip.period }}</Badge>
              </div>
              <h3 style="font-size: 19px; font-weight: 700; letter-spacing: -0.01em;">{{ trip.title }}</h3>
              <div style="display: flex; gap: 16px; margin-top: 10px; color: var(--text-muted); font-size: 13px;">
                <span>📅 {{ trip.days }}일</span>
                <span>📍 {{ trip.places }}곳</span>
              </div>
            </div>
            <div style="align-self: center; padding-right: 16px; color: var(--text-muted);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </Card>
      </div>
    </template>

    <!-- ══════════ 상세 뷰 (TripDetail) ══════════ -->
    <template v-else>
      <!-- 뒤로가기 -->
      <button
        @click="closeTrip"
        style="
          display: inline-flex; align-items: center; gap: 6px;
          border: none; background: none; cursor: pointer;
          color: var(--text-secondary); font-size: 15px; font-weight: 600; margin-bottom: 16px;
        "
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        내 여행
      </button>

      <!-- 커버 헤더 -->
      <div style="position: relative; border-radius: var(--radius-xl); overflow: hidden; margin-bottom: 18px;">
        <img :src="selectedTrip.cover" alt="" style="width: 100%; height: 190px; object-fit: cover;" />
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(26,22,17,0.66), transparent 60%);" />
        <div style="position: absolute; left: 22px; bottom: 18px; right: 22px;">
          <div style="display: flex; gap: 6px; margin-bottom: 8px;">
            <Badge tone="coral" :solid="true">{{ selectedTrip.region || '제주' }}</Badge>
            <Badge tone="neutral" :solid="true">{{ selectedTrip.period || '2박 3일' }}</Badge>
          </div>
          <h1 style="color: #fff; font-size: 27px; font-weight: 800; letter-spacing: -0.02em;">
            {{ selectedTrip.title }}
          </h1>
        </div>
      </div>

      <!-- 여행 시작 CTA -->
      <button
        @click="startTrip(selectedTrip)"
        style="
          display: flex; align-items: center; gap: 13px; width: 100%; text-align: left;
          cursor: pointer; padding: 16px 18px; border-radius: var(--radius-lg);
          border: 1px solid var(--coral-100);
          background: linear-gradient(120deg, var(--coral-50), #FFF9F4 80%);
          margin-bottom: 22px; font-family: var(--font-sans);
        "
      >
        <span style="
          width: 44px; height: 44px; border-radius: 12px; flex: none;
          display: flex; align-items: center; justify-content: center;
          background: var(--coral-500); color: #fff;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        </span>
        <div style="flex: 1;">
          <b style="font-size: 15.5px;">여행 시작하기</b>
          <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
            여행 당일, 동선을 따라가며 콕 체크인하고 추억을 남겨요.
          </div>
        </div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--coral-400)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <!-- 공개 설정 -->
      <div :style="{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '16px 18px', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        background: visibility === 'public' ? 'var(--mint-50)' : 'var(--surface)',
        boxShadow: 'var(--shadow-sm)', marginBottom: '22px',
        transition: 'background var(--dur-base)',
      }">
        <span :style="{
          width: '42px', height: '42px', borderRadius: '12px', flex: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: visibility === 'public' ? 'var(--mint-100)' : 'var(--gray-50)',
          color: visibility === 'public' ? 'var(--mint-600)' : 'var(--text-muted)',
        }">
          <svg v-if="visibility === 'public'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>
        <div style="flex: 1;">
          <b style="font-size: 15.5px;">{{ visibility === 'public' ? 'TripLog에 공개 중' : '나만 보기 (비공개)' }}</b>
          <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
            {{ visibility === 'public'
              ? '다른 여행자가 커뮤니티에서 내 코스와 기록을 볼 수 있어요.'
              : '공개하면 TripLog 커뮤니티에 올라가 다른 사람도 참고할 수 있어요.' }}
          </div>
        </div>
        <Switch
          :model-value="visibility === 'public'"
          @update:model-value="v => applyVisibility(v ? 'public' : 'private')"
        />
      </div>

      <!-- 코스 & 기록 헤더 -->
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;">
        <h2 style="font-size: 19px; font-weight: 800; white-space: nowrap;">코스 &amp; 기록</h2>
        <Badge tone="coral" size="sm">사진 {{ totalPhotos }}장</Badge>
        <div style="flex: 1;" />
        <!-- 뷰 토글 -->
        <div style="
          display: inline-flex; padding: 3px; background: var(--gray-50);
          border-radius: var(--radius-pill); border: 1px solid var(--border-subtle);
        ">
          <button
            v-for="opt in [{ k: 'list', label: '리스트' }, { k: 'map', label: '지도' }]"
            :key="opt.k"
            @click="courseView = opt.k"
            :style="{
              padding: '6px 14px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
              background: courseView === opt.k ? 'var(--surface)' : 'transparent',
              color: courseView === opt.k ? 'var(--coral-600)' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-sans)',
              boxShadow: courseView === opt.k ? 'var(--shadow-xs)' : 'none',
            }"
          >{{ opt.label }}</button>
        </div>
      </div>

      <!-- 지도 뷰 -->
      <div v-if="courseView === 'map'" style="margin-bottom: 22px;">
        <CourseMap :days="days" :height="400" />
        <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 10px; text-align: center;">
          리스트로 전환하면 순서 변경·장소 추가/삭제와 추억 기록을 남길 수 있어요.
        </p>
      </div>

      <!-- 리스트 뷰 — 편집 가능 StopRow -->
      <template v-else>
        <div style="font-size: 12.5px; color: var(--text-muted); font-weight: 600; margin-bottom: 14px; text-align: right;">
          끌거나 ▲▼로 순서 변경 · 추가/삭제 가능
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 22px;">
          <div v-for="(day, di) in days" :key="di">
            <!-- 일자 레이블 -->
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <span style="
                width: 30px; height: 30px; border-radius: 50%;
                background: var(--coral-500); color: #fff;
                font-weight: 800; font-size: 14px;
                display: flex; align-items: center; justify-content: center;
              ">{{ day.day }}</span>
              <b style="font-size: 16px;">DAY {{ day.day }} · {{ day.theme }}</b>
            </div>

            <!-- 정차지 목록 -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div
                v-for="(it, ii) in day.items"
                :key="it.uid"
                draggable="true"
                @dragstart="onDragStart(di, ii)"
                @dragover.prevent="onDragOver(di, ii)"
                @drop.prevent="onDrop(di, ii)"
                :style="{
                  background: dragOver.value === ii && dragFrom.value.dayIdx === di
                    ? 'var(--coral-50)' : 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-xs)', overflow: 'hidden',
                  transition: 'background var(--dur-fast)',
                }"
              >
                <!-- 정차지 헤더 -->
                <div style="display: flex; align-items: center; gap: 11px; padding: 12px 14px;">
                  <!-- 드래그 핸들 -->
                  <span style="color: var(--gray-300); cursor: grab; flex: none;" title="끌어서 순서 변경">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="18" x2="16" y2="18"/>
                    </svg>
                  </span>
                  <span style="font-size: 12.5px; font-weight: 700; color: var(--text-secondary); width: 42px; flex: none;">{{ it.time }}</span>
                  <span :style="{ width: '9px', height: '9px', borderRadius: '50%', background: catColor[it.cat], flex: 'none' }" />
                  <img :src="it.img" alt="" style="width: 46px; height: 46px; border-radius: var(--radius-sm); object-fit: cover; flex: none;" />
                  <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 7px;">
                      <b style="font-size: 15px;">{{ it.title }}</b>
                      <Badge :tone="catTone(it.cat)" size="sm">{{ it.cat }}</Badge>
                    </div>
                  </div>
                  <!-- 순서 버튼 -->
                  <div style="display: flex; flex-direction: column; gap: 2px; flex: none;">
                    <button :style="{ ...miniBtn, opacity: ii === 0 ? 0.3 : 1 }" :disabled="ii === 0" @click="moveItem(di, ii, -1)" aria-label="위로">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                    </button>
                    <button :style="{ ...miniBtn, opacity: ii === day.items.length - 1 ? 0.3 : 1 }" :disabled="ii === day.items.length - 1" @click="moveItem(di, ii, 1)" aria-label="아래로">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                  </div>
                  <!-- 삭제 버튼 -->
                  <button :style="{ ...miniBtn, color: 'var(--red-500)', flex: 'none' }" @click="deleteItem(di, ii)" aria-label="장소 삭제">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>

                <!-- 기록 토글 -->
                <details style="border-top: 1px solid var(--border-subtle);">
                  <summary style="
                    display: flex; align-items: center; gap: 8px; width: 100%;
                    padding: 9px 16px; background: var(--gray-50);
                    cursor: pointer; color: var(--text-secondary);
                    font-size: 13px; font-weight: 700; font-family: var(--font-sans);
                    list-style: none;
                  ">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                    </svg>
                    {{ journal[it.uid]?.length ? `내 기록 ${journal[it.uid].length}개` : '이곳에서의 추억 기록하기' }}
                  </summary>
                  <div style="padding: 14px; background: var(--coral-50);">
                    <JournalBlock
                      :entries="journal[it.uid] || []"
                      @update:entries="(en) => journal[it.uid] = en"
                    />
                  </div>
                </details>
              </div>
            </div>

            <!-- 장소 추가 패널 -->
            <div v-if="addingDay === di" style="
              background: var(--surface); border-radius: var(--radius-lg);
              border: 1.5px dashed var(--coral-200); padding: 14px; margin-top: 8px;
            ">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <b style="font-size: 14px;">이 날에 추가할 장소</b>
                <div style="flex: 1;" />
                <button :style="miniBtn" @click="addingDay = null" aria-label="닫기">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px;">
                <button
                  v-for="p in getCandidates(di)"
                  :key="p.id"
                  @click="addItem(di, p)"
                  style="
                    display: flex; align-items: center; gap: 9px; padding: 8px;
                    border-radius: var(--radius-md); border: 1px solid var(--border-subtle);
                    background: var(--surface); cursor: pointer; text-align: left;
                    font-family: var(--font-sans);
                  "
                >
                  <img :src="p.img" alt="" style="width: 38px; height: 38px; border-radius: var(--radius-sm); object-fit: cover; flex: none;" />
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ p.title }}</div>
                    <div style="font-size: 11.5px; color: var(--text-muted);">{{ p.cat }}</div>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--coral-500)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </button>
                <span v-if="getCandidates(di).length === 0" style="font-size: 13px; color: var(--text-muted); padding: 8px;">추가할 수 있는 장소를 모두 넣었어요.</span>
              </div>
            </div>

            <!-- 장소 추가 버튼 -->
            <button
              v-else
              @click="addingDay = di"
              style="
                display: flex; align-items: center; justify-content: center; gap: 7px;
                width: 100%; margin-top: 10px; padding: 11px 0;
                border-radius: var(--radius-md); border: 1.5px dashed var(--border);
                background: transparent; color: var(--text-secondary);
                cursor: pointer; font-weight: 700; font-size: 13.5px; font-family: var(--font-sans);
              "
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {{ day.day }}일차에 장소 추가
            </button>
          </div>
        </div>
      </template>

      <!-- 하단 CTA -->
      <div style="display: flex; gap: 12px; margin-top: 8px;">
        <Button
          :variant="visibility === 'public' ? 'secondary' : 'primary'"
          size="lg"
          :full-width="true"
          @click="applyVisibility(visibility === 'public' ? 'private' : 'public')"
        >
          <template #left-icon>
            <svg v-if="visibility === 'public'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </template>
          {{ visibility === 'public' ? '공개 중 · 비공개로 전환' : 'TripLog에 공개하기' }}
        </Button>
        <Button variant="secondary" size="lg">
          <template #left-icon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </template>
          공유
        </Button>
      </div>
    </template>
  </div>
</template>
