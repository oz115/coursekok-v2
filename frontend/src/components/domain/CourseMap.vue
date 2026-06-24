<script setup>
/**
 * CourseMap.vue — 코스(일정)를 지도 위에 동선으로 보여주는 뷰
 * ─────────────────────────────────────────────────────────────
 * 원본: raw-wireframe/output/scripts/CourseMap.js
 *
 * 프로토타입용 스타일라이즈드 벡터 지도.
 * 프로덕션에서는 <svg> 대신 Kakao/Naver Map SDK 컨테이너를 마운트하고
 * COORD 객체의 값을 실제 위·경도로 교체하면 됩니다.
 *
 * Props:
 *   - days       : Array<{ day, theme, items: Array<{title, cat, time, img}> }>
 *   - activeDay  : Number | 'all' — 특정 날만 표시하거나 전체 표시
 *   - height     : Number — SVG 렌더 높이(px)
 *
 * Emits:
 *   - select     : (stop | null) — 핀 클릭 시 선택된 장소 객체를 상위로 전달
 *
 * React → Vue 생명주기 매핑:
 *   - React.useState(null) → ref(null)
 *   - JSX 내부 중첩 컴포넌트(MapBackground) → <svg> 블록을 template에 직접 인라인
 *     (Vue SFC는 render function 합성보다 template 재사용이 관용적)
 *   - onClick → @click (네이티브 이벤트 폴스루)
 */

import { ref, computed } from 'vue'
import Badge from '@/components/core/Badge.vue'

// ── Props & Emits ─────────────────────────────────────────────────────────────
const props = defineProps({
  /** 일자별 코스 데이터 */
  days: {
    type: Array,
    required: true,
  },
  /** 표시할 날짜 인덱스, 또는 'all'로 전체 표시 */
  activeDay: {
    type: [Number, String],
    default: 'all',
  },
  /** SVG 렌더 높이 (px) */
  height: {
    type: Number,
    default: 360,
  },
})

const emit = defineEmits(['select'])

// ── 데모(제주) 장소별 좌표 ─────────────────────────────────────────────────────
// 0..100(x) · 0..72(y) SVG viewBox 기준
const COORD = {
  '협재 해변':        { x: 20, y: 27 },
  '오션뷰 카페':      { x: 23, y: 22 },
  '올레 국수':        { x: 27, y: 33 },
  '제주 들불축제':    { x: 31, y: 41 },
  '카멜리아 힐':      { x: 33, y: 49 },
  '바다뷰 스테이':    { x: 45, y: 55 },
  '제주 게스트하우스': { x: 45, y: 55 },
  '사려니 숲길':      { x: 58, y: 34 },
  '제주 흑돼지 맛집': { x: 69, y: 43 },
  '해녀의 부엌':      { x: 75, y: 31 },
  '성산일출봉':       { x: 86, y: 39 },
}

/** 좌표 없는 장소는 인덱스 기반 분산 배치로 폴백 */
const fallback = (i) => ({ x: 22 + (i * 13) % 60, y: 26 + (i * 19) % 30 })
const coordOf  = (title, i, item) => {
  if (item && item.map_x !== undefined && item.map_y !== undefined) {
    const lon = parseFloat(item.map_x);
    const lat = parseFloat(item.map_y);
    if (!isNaN(lon) && !isNaN(lat) && lon > 124 && lon < 130 && lat > 32 && lat < 39) {
      const x = 10 + ((lon - 126.1) / (127.0 - 126.1)) * (90 - 10);
      const y = 65 - ((lat - 33.1) / (33.6 - 33.1)) * (65 - 15);
      return { x, y };
    }
  }
  return COORD[title] || fallback(i);
}

// ── 일자별 색상 토큰 ──────────────────────────────────────────────────────────
const DAYC    = ['var(--coral-500)', 'var(--sky-500)', 'var(--mint-500)', 'var(--amber-500)']

// ── 반응형 상태 ───────────────────────────────────────────────────────────────
/** 현재 선택된 핀 { di: dayIndex, ii: itemIndex } | null */
const sel = ref(null)

// ── 계산된 값 ─────────────────────────────────────────────────────────────────
/** 실제 화면에 표시할 day 인덱스 배열 */
const shownDays = computed(() =>
  props.activeDay === 'all'
    ? props.days.map((_, i) => i)
    : [props.activeDay]
)

/** 선택된 핀의 장소 데이터 */
const selStop = computed(() =>
  sel.value ? props.days[sel.value.di]?.items[sel.value.ii] : null
)

// ── 핀 클릭 핸들러 ────────────────────────────────────────────────────────────
function togglePin(di, ii) {
  const isSel = sel.value && sel.value.di === di && sel.value.ii === ii
  if (isSel) {
    sel.value = null
    emit('select', null)
  } else {
    sel.value = { di, ii }
    emit('select', props.days[di].items[ii])
  }
}

function closeInfo() {
  sel.value = null
  emit('select', null)
}

/** 동선 경로 SVG path d 속성 계산 */
function buildPath(di) {
  const pts = props.days[di].items.map((it, ii) => coordOf(it.title, ii, it))
  if (pts.length < 2) return null
  return pts.map((p, k) => `${k === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')
}
</script>

<template>
  <div
    style="
      position: relative;
      border-radius: var(--radius-xl);
      overflow: hidden;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      background: linear-gradient(165deg, #EAF6FF, #E9FBF4);
    "
  >
    <!-- 도트 텍스처 레이어 -->
    <div
      aria-hidden="true"
      style="
        position: absolute; inset: 0; opacity: 0.35;
        background-image: radial-gradient(#CDE8FB 1.5px, transparent 1.5px);
        background-size: 16px 16px;
      "
    />

    <!-- 메인 SVG 지도 -->
    <svg
      viewBox="0 0 100 72"
      preserveAspectRatio="xMidYMid meet"
      :style="{ position: 'relative', width: '100%', height: `${height}px`, display: 'block' }"
    >
      <!-- ── 지도 배경 (제주 실루엣) ───────────────────────────────────────── -->
      <g>
        <!-- 바다 잔물결 -->
        <g stroke="#BFE3FB" stroke-width="0.5" stroke-linecap="round" opacity="0.7" fill="none">
          <path d="M6 10 q3 -2 6 0 t6 0" /><path d="M78 12 q3 -2 6 0 t6 0" />
          <path d="M8 62 q3 -2 6 0 t6 0" /><path d="M80 60 q3 -2 6 0 t6 0" />
        </g>

        <!-- 섬 본체 -->
        <path
          d="M12 36 C12 24 26 17 40 16 C54 15 66 16 78 20 C88 23 92 30 91 38
             C90 48 78 55 62 57 C46 59 30 58 20 52 C14 48 12 42 12 36 Z"
          fill="#FBF4EC" stroke="#F2D9C8" stroke-width="0.8" stroke-linejoin="round"
        />

        <!-- 해안 모래 톤 -->
        <path
          d="M12 36 C12 24 26 17 40 16 C54 15 66 16 78 20 C88 23 92 30 91 38
             C90 48 78 55 62 57 C46 59 30 58 20 52 C14 48 12 42 12 36 Z"
          fill="none" stroke="#FFE9DC" stroke-width="2.4" stroke-linejoin="round" opacity="0.6"
        />

        <!-- 녹지(숲) -->
        <ellipse cx="58" cy="35" rx="9" ry="6" fill="#DDF3E8" opacity="0.8" />
        <ellipse cx="34" cy="48" rx="6" ry="4" fill="#DDF3E8" opacity="0.7" />

        <!-- 한라산 -->
        <circle cx="50" cy="37" r="9" fill="#E7F6EE" />
        <circle cx="50" cy="37" r="5.5" fill="#CDEBDC" />
        <path d="M47 39 l3 -5 3 5 z" fill="#9FD9BC" />

        <!-- 일주도로(점선 링) -->
        <path
          d="M20 34 C22 25 34 21 46 21 C60 21 74 23 82 30 C86 34 84 42 74 47 C60 53 40 53 28 48 C20 44 18 40 20 34 Z"
          fill="none" stroke="#E7D6C6" stroke-width="0.7" stroke-dasharray="1.4 1.6"
        />

        <!-- 오름 점들 -->
        <g fill="#CDEBDC">
          <circle cx="40" cy="30" r="1.1" />
          <circle cx="66" cy="44" r="1.1" />
          <circle cx="28" cy="40" r="1" />
          <circle cx="72" cy="36" r="1" />
        </g>
      </g>

      <!-- ── 동선(점선 경로) ───────────────────────────────────────────────── -->
      <template v-for="di in shownDays" :key="'route-' + di">
        <path
          v-if="buildPath(di)"
          :d="buildPath(di)"
          fill="none"
          :stroke="DAYC[di % 4]"
          stroke-width="1"
          stroke-dasharray="2 1.8"
          stroke-linecap="round"
          opacity="0.85"
        />
      </template>

      <!-- ── 장소 핀 ────────────────────────────────────────────────────────── -->
      <template v-for="di in shownDays" :key="'pins-day-' + di">
        <g
          v-for="(item, ii) in days[di].items"
          :key="`pin-${di}-${ii}`"
          style="cursor: pointer"
          @click="togglePin(di, ii)"
        >
          <!-- 선택 시 후광 효과 -->
          <circle
            v-if="sel && sel.di === di && sel.ii === ii"
            :cx="coordOf(item.title, ii, item).x"
            :cy="coordOf(item.title, ii, item).y"
            r="4.6"
            :fill="DAYC[di % 4]"
            opacity="0.22"
          />

          <!-- 핀 원 -->
          <circle
            :cx="coordOf(item.title, ii, item).x"
            :cy="coordOf(item.title, ii, item).y"
            :r="(sel && sel.di === di && sel.ii === ii) ? 3.2 : 2.6"
            :fill="DAYC[di % 4]"
            stroke="#fff"
            stroke-width="0.7"
            style="transition: r 0.15s"
          />

          <!-- 핀 번호 레이블 -->
          <text
            :x="coordOf(item.title, ii, item).x"
            :y="coordOf(item.title, ii, item).y + 0.9"
            text-anchor="middle"
            font-size="2.4"
            font-weight="800"
            fill="#fff"
            style="pointer-events: none; font-family: var(--font-sans)"
          >{{ ii + 1 }}</text>
        </g>
      </template>
    </svg>

    <!-- ── 범례 ────────────────────────────────────────────────────────────── -->
    <div style="position: absolute; top: 12px; left: 12px; display: flex; gap: 6px; flex-wrap: wrap;">
      <span
        v-for="di in shownDays"
        :key="'legend-' + di"
        style="
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 9px; border-radius: var(--radius-pill);
          background: rgba(255,255,255,0.9); backdrop-filter: blur(4px);
          box-shadow: var(--shadow-xs); font-size: 11.5px; font-weight: 700;
          color: var(--text-secondary);
        "
      >
        <span
          :style="{
            width: '8px', height: '8px', borderRadius: '50%',
            background: DAYC[di % 4]
          }"
        />
        DAY {{ days[di].day }}
      </span>
    </div>

    <!-- ── 선택 정보 패널 / 안내 힌트 ───────────────────────────────────────── -->
    <div style="position: absolute; left: 12px; right: 12px; bottom: 12px;">
      <!-- 장소가 선택됐을 때 -->
      <div
        v-if="selStop"
        style="
          display: flex; align-items: center; gap: 11px; padding: 10px;
          background: var(--surface); border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md); border: 1px solid var(--border-subtle);
        "
      >
        <!-- 번호 뱃지 -->
        <span
          :style="{
            width: '26px', height: '26px', borderRadius: '50%',
            background: DAYC[sel.di % 4], color: '#fff',
            fontWeight: 800, fontSize: '13px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flex: 'none',
          }"
        >{{ sel.ii + 1 }}</span>

        <!-- 썸네일 -->
        <img
          :src="selStop.img"
          alt=""
          style="width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover; flex: none;"
        />

        <!-- 장소 정보 -->
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 7px;">
            <b style="font-size: 14.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              {{ selStop.title }}
            </b>
            <Badge tone="neutral" size="sm">{{ selStop.cat }}</Badge>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px; white-space: nowrap;">
            DAY {{ days[sel.di].day }} · {{ selStop.time }}
          </div>
        </div>

        <!-- 닫기 버튼 -->
        <button
          aria-label="닫기"
          @click="closeInfo"
          style="
            border: none; background: var(--gray-50);
            width: 26px; height: 26px; border-radius: 50%;
            cursor: pointer; color: var(--text-muted);
            display: flex; align-items: center; justify-content: center; flex: none;
          "
        >
          <!-- X 아이콘 (SVG 인라인) -->
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- 아무것도 선택 안 됐을 때 힌트 -->
      <div
        v-else
        style="
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 12px;
          background: rgba(255,255,255,0.9); backdrop-filter: blur(4px);
          border-radius: var(--radius-pill); box-shadow: var(--shadow-xs);
          font-size: 12.5px; font-weight: 600; color: var(--text-secondary);
        "
      >
        <!-- Pin 아이콘 -->
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--coral-500)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        번호 핀을 눌러 장소를 확인하세요
      </div>
    </div>
  </div>
</template>
