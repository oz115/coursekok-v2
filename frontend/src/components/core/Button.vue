<script setup>
/**
 * Button.vue — 코스콕 Button 컴포넌트
 * ─────────────────────────────────────────────────
 * 원본: DesignSystem_3a93b9.js > components/core/Button.jsx
 *
 * 코스콕의 주요 액션 버튼. 5가지 variant와 3가지 사이즈, hover/press
 * 마이크로 애니메이션을 지원한다.
 *
 * Props 설계 원칙:
 *   - `variant` : 5종 (primary/secondary/ghost/ai/danger) — 색상 책임을 컴포넌트 내부로 캡슐화
 *   - `size`    : sm | md | lg 3단계 — 높이·패딩·폰트 연동
 *   - `fullWidth`, `disabled`, `type` : 표준 button 속성 미러링
 *   - leftIcon / rightIcon : slot으로 설계하여 아이콘 컴포넌트를 유연하게 교체 가능
 *
 * Emit 설계:
 *   - `click` 이벤트를 그대로 상위로 전달 (Vue의 네이티브 이벤트 폴스루 활용)
 *   - disabled 시 자동으로 이벤트 차단 (pointer-events: none + disabled 속성)
 *
 * 사용 예시:
 *   <Button @click="handleSave">저장하기</Button>
 *   <Button variant="ai" size="lg" full-width>AI 일정 만들기</Button>
 *   <Button variant="secondary" :disabled="loading">
 *     <template #left-icon><IconBookmark /></template>
 *     담기
 *   </Button>
 */

import { ref, computed } from 'vue'

const props = defineProps({
  /** 시각적 스타일 변형 */
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost', 'ai', 'danger'].includes(v),
  },
  /** 크기 */
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  /** 부모 너비 100% 차지 여부 */
  fullWidth: {
    type: Boolean,
    default: false,
  },
  /** 비활성화 */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** HTML button type 속성 */
  type: {
    type: String,
    default: 'button',
  },
})

// ── 인터랙션 상태 ─────────────────────────────────────────────────────────────
const isHovered = ref(false)
const isPressed = ref(false)

const onMouseEnter = () => { if (!props.disabled) isHovered.value = true }
const onMouseLeave = () => { isHovered.value = false; isPressed.value = false }
const onMouseDown  = () => { if (!props.disabled) isPressed.value = true }
const onMouseUp    = () => { isPressed.value = false }

// ── 크기 토큰 ──────────────────────────────────────────────────────────────────
const SIZES = {
  sm: { height: 'var(--control-sm)', padding: '0 14px', fontSize: 'var(--fs-body-sm)', gap: '6px', iconSize: 16 },
  md: { height: 'var(--control-md)', padding: '0 20px', fontSize: 'var(--fs-body)',    gap: '8px', iconSize: 18 },
  lg: { height: 'var(--control-lg)', padding: '0 28px', fontSize: 'var(--fs-body-lg)', gap: '8px', iconSize: 20 },
}

// ── 색상 팔레트 ────────────────────────────────────────────────────────────────
// hover 여부에 따라 동적으로 변경되는 항목은 computed 내부에서 isHovered 참조
const getPalette = (variant, hovered) => {
  const h = hovered
  return {
    primary:   { bg: h ? 'var(--primary-hover)' : 'var(--primary)',                            color: 'var(--on-primary)',   border: 'transparent',          shadow: 'var(--shadow-primary)', filter: 'none' },
    ai:        { bg: 'linear-gradient(120deg, var(--ai-from), var(--ai-to))',                   color: '#fff',               border: 'transparent',          shadow: 'var(--shadow-ai)',      filter: h ? 'brightness(1.04)' : 'none' },
    secondary: { bg: h ? 'var(--surface-sunken)' : 'var(--surface)',                           color: 'var(--text-primary)', border: 'var(--border-strong)', shadow: 'var(--shadow-xs)',      filter: 'none' },
    ghost:     { bg: h ? 'var(--primary-soft)' : 'transparent',                                color: 'var(--primary)',      border: 'transparent',          shadow: 'none',                  filter: 'none' },
    danger:    { bg: h ? 'var(--danger-hover)' : 'var(--danger)',                              color: 'var(--on-danger)',    border: 'transparent',          shadow: 'none',                  filter: 'none' },
  }[variant] || {}
}

// ── 계산된 스타일 ──────────────────────────────────────────────────────────────
const rootStyle = computed(() => {
  const s = SIZES[props.size] || SIZES.md
  const p = getPalette(props.variant, isHovered.value)

  return {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            s.gap,
    height:         s.height,
    padding:        s.padding,
    width:          props.fullWidth ? '100%' : 'auto',
    fontSize:       s.fontSize,
    fontWeight:     'var(--fw-semibold)',
    fontFamily:     'var(--font-sans)',
    letterSpacing:  'var(--ls-tight)',
    color:          p.color,
    background:     p.bg,
    border:         `1.5px solid ${p.border}`,
    borderRadius:   'var(--radius-pill)',
    boxShadow:      props.disabled ? 'none' : p.shadow,
    filter:         props.disabled ? 'none' : p.filter,
    cursor:         props.disabled ? 'not-allowed' : 'pointer',
    opacity:        props.disabled ? 0.5 : 1,
    // 스프링 press 효과 — 원본의 transform: scale(0.97) 재현
    transform:      (isPressed.value && !props.disabled) ? 'scale(0.97)' : 'scale(1)',
    transition:     [
      'transform var(--dur-fast) var(--ease-spring)',
      'background var(--dur-fast) var(--ease-out)',
      'box-shadow var(--dur-fast) var(--ease-out)',
    ].join(', '),
    whiteSpace:     'nowrap',
  }
})

/** 슬롯에 전달할 아이콘 권장 크기 */
const iconSize = computed(() => (SIZES[props.size] || SIZES.md).iconSize)

// ── expose (parent에서 ref 접근 시 사용) ──────────────────────────────────────
defineExpose({ iconSize })
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :style="rootStyle"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  >
    <!--
      left-icon slot: 왼쪽 아이콘 영역
      예: <template #left-icon><IconBookmark :size="iconSize" /></template>
    -->
    <slot name="left-icon" />

    <!-- 기본 콘텐츠 (텍스트 레이블) -->
    <slot />

    <!--
      right-icon slot: 오른쪽 아이콘 영역 (chevron, arrowR 등)
      예: <template #right-icon><IconArrowR :size="iconSize" /></template>
    -->
    <slot name="right-icon" />
  </button>
</template>
