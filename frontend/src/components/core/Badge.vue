<script setup>
/**
 * Badge.vue — 코스콕 Badge 컴포넌트
 * ─────────────────────────────────────────────────
 * 원본: DesignSystem_3a93b9.js > components/core/Badge.jsx
 *
 * 상태(tone)에 따른 색상 + soft/solid 두 가지 채움 방식을 지원하는
 * 컴팩트 레이블 컴포넌트.
 *
 * Props 설계 원칙:
 *   - `tone`  : 의미론적 색상 제어 (중립·강조·위험 등) → 하드코딩 색상 사용 금지
 *   - `solid` : boolean으로 채움 방식만 분리 → variant 폭발 방지
 *   - `size`  : sm | md 두 단계만 지원 (Badge 특성상 대형 불필요)
 *   - `leftIcon` : Vue slot 대신 prop으로 받아 아이콘 컴포넌트를 직접 전달 가능
 *
 * 사용 예시:
 *   <Badge tone="coral">관광지</Badge>
 *   <Badge tone="sky" solid>추천</Badge>
 *   <Badge tone="mint" size="sm" :left-icon="IconStar">4.8</Badge>
 */

import { computed } from 'vue'

const props = defineProps({
  /** 색상 팔레트 키 */
  tone: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'coral', 'sky', 'mint', 'amber', 'red'].includes(v),
  },
  /** true: solid(채운), false(기본): soft(연한) */
  solid: {
    type: Boolean,
    default: false,
  },
  /** 크기 */
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md'].includes(v),
  },
})

// ── 색상 팔레트 ────────────────────────────────────────────────────────────────
// [background, foreground] 쌍 — CSS 변수 토큰을 사용하여 테마 변경 대응
const TONES = {
  neutral: { soft: ['var(--gray-100)', 'var(--gray-700)'],   solid: ['var(--gray-800)', '#fff'] },
  coral:   { soft: ['var(--coral-100)', 'var(--coral-700)'], solid: ['var(--coral-500)', '#fff'] },
  sky:     { soft: ['var(--sky-100)', 'var(--sky-700)'],     solid: ['var(--sky-500)', '#fff'] },
  mint:    { soft: ['var(--mint-100)', 'var(--mint-700)'],   solid: ['var(--mint-500)', '#fff'] },
  amber:   { soft: ['var(--amber-100)', 'var(--amber-600)'], solid: ['var(--amber-500)', '#fff'] },
  red:     { soft: ['var(--red-100)', 'var(--red-700)'],     solid: ['var(--red-500)', '#fff'] },
}

// ── 크기 토큰 ──────────────────────────────────────────────────────────────────
const SIZES = {
  sm: { fontSize: '11px',              padding: '2px 8px',   height: '20px' },
  md: { fontSize: 'var(--fs-micro)',   padding: '3px 10px',  height: '24px' },
}

// ── 계산된 스타일 ──────────────────────────────────────────────────────────────
const palette = computed(() => (TONES[props.tone] || TONES.neutral))
const colors  = computed(() => props.solid ? palette.value.solid : palette.value.soft)
const sizeVal = computed(() => SIZES[props.size] || SIZES.md)

const rootStyle = computed(() => ({
  display:       'inline-flex',
  alignItems:    'center',
  gap:           '4px',
  height:        sizeVal.value.height,
  padding:       sizeVal.value.padding,
  fontSize:      sizeVal.value.fontSize,
  fontWeight:    'var(--fw-semibold)',
  fontFamily:    'var(--font-sans)',
  letterSpacing: 'var(--ls-tight)',
  color:         colors.value[1],
  background:    colors.value[0],
  borderRadius:  'var(--radius-pill)',
  whiteSpace:    'nowrap',
  lineHeight:    1,
}))
</script>

<template>
  <span :style="rootStyle">
    <!--
      leftIcon slot: 아이콘 컴포넌트를 직접 삽입하거나 생략 가능.
      예: <Badge><template #left-icon><IconStar :size="12" /></template>4.8</Badge>
    -->
    <slot name="left-icon" />
    <slot />
  </span>
</template>
