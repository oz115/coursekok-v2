<script setup>
import { computed, getCurrentInstance, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  /** 마스코트 표정/행동 변형: default | saved | cheer | guide | wink */
  variant: {
    type: String,
    default: 'default',
    validator: v => ['default', 'saved', 'cheer', 'guide', 'wink'].includes(v)
  },
  /** 크기 (가로 기준, 높이는 1.2배 자동 계산) */
  size: {
    type: Number,
    default: 120
  },
  /** true일 때 스프링 바운스 애니메이션 재생 */
  pop: {
    type: Boolean,
    default: false
  },
  /** 지도 마커 등에서 사용할 몸체 색상 */
  color: {
    type: String,
    default: ''
  }
})

const w = computed(() => props.size)
const h = computed(() => props.size * 1.2)
const hasArms = computed(() => ['cheer', 'guide', 'wink'].includes(props.variant))
const instanceId = getCurrentInstance()?.uid ?? Math.random().toString(36).slice(2)
const gradientId = computed(() => `kb-${props.variant}-${instanceId}`)
const bodyColors = computed(() => {
  if (!props.color) {
    return {
      light: '#FF8159',
      main: '#FF6B3D',
      dark: '#F0522A'
    }
  }

  return {
    light: props.color,
    main: props.color,
    dark: props.color
  }
})

const attrs = useAttrs()
const rootStyle = computed(() => {
  return [
    {
      display: 'inline-block',
      width: `${w.value}px`,
      height: `${h.value}px`,
      lineHeight: 0,
      animation: props.pop ? 'kok-pop var(--dur-slow) var(--ease-spring)' : 'none'
    },
    attrs.style
  ]
})
</script>

<template>
  <span :class="$attrs.class" :style="rootStyle">
    <svg
      viewBox="0 0 200 250"
      :width="w"
      :height="h"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="콕이"
    >
      <defs>
        <radialGradient
          :id="gradientId"
          cx="42%"
          cy="34%"
          r="78%"
        >
          <stop offset="0%" :stop-color="bodyColors.light" />
          <stop offset="60%" :stop-color="bodyColors.main" />
          <stop offset="100%" :stop-color="bodyColors.dark" />
        </radialGradient>
      </defs>

      <!-- Shadow under character -->
      <ellipse
        cx="100"
        cy="224"
        rx="42"
        ry="10"
        fill="#1A1611"
        opacity="0.10"
      />

      <!-- Arms Group -->
      <g v-if="hasArms" fill="#FF7A4D">
        <!-- cheer arms -->
        <template v-if="variant === 'cheer'">
          <rect x="-8.5" y="0" width="17" height="48" rx="8.5" transform="translate(58 150) rotate(150)" />
          <circle cx="0" cy="48" r="10.5" transform="translate(58 150) rotate(150)" />
          <rect x="-8.5" y="0" width="17" height="48" rx="8.5" transform="translate(142 150) rotate(-150)" />
          <circle cx="0" cy="48" r="10.5" transform="translate(142 150) rotate(-150)" />
        </template>

        <!-- guide arms -->
        <!-- <template v-else-if="variant === 'guide'">
          <rect x="-8" y="0" width="16" height="40" rx="8" transform="translate(58 150) rotate(28)" />
          <circle cx="0" cy="40" r="9.5" transform="translate(58 150) rotate(28)" />
          <rect x="-8" y="0" width="16" height="52" rx="8" transform="translate(146 150) rotate(-145)" />
          <circle cx="0" cy="52" r="10" transform="translate(146 150) rotate(-145)" />
        </template> -->

        <!-- wink arms -->
        <template v-else-if="variant === 'wink'">
          <rect x="-8" y="0" width="16" height="38" rx="8" transform="translate(50 158) rotate(22)" />
          <circle cx="0" cy="38" r="9.5" transform="translate(50 158) rotate(22)" />
          <rect x="-8" y="0" width="16" height="46" rx="8" transform="translate(148 148) rotate(-138)" />
          <circle cx="0" cy="46" r="10" transform="translate(148 148) rotate(-138)" />
        </template>
      </g>

      <!-- Sparkles Group -->
      <g v-if="variant !== 'default'">
        <!-- saved sparkles -->
        <template v-if="variant === 'saved'">
          <path d="M44 70 l2.5 7 7 2.5 -7 2.5 -2.5 7 -2.5 -7 -7 -2.5 7 -2.5 z" fill="#1FBF98" />
          <path d="M158 50 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" fill="#FFD166" />
        </template>

        <!-- cheer sparkles -->
        <template v-else-if="variant === 'cheer'">
          <path d="M150 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" fill="#FFD166" />
          <path d="M38 58 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4 z" fill="#7AD0FF" />
          <circle cx="170" cy="92" r="4" fill="#4FD6B2" />
        </template>

        <!-- guide sparkles -->
        <template v-else-if="variant === 'guide'">
          <path d="M158 50 l3.4 9 9 3.4 -9 3.4 -3.4 9 -3.4 -9 -9 -3.4 9 -3.4 z" fill="#FFD166" />
          <path d="M138 36 l2 5.2 5.2 2 -5.2 2 -2 5.2 -2 -5.2 -5.2 -2 5.2 -2 z" fill="#7AD0FF" />
        </template>

        <!-- wink sparkles -->
        <template v-else-if="variant === 'wink'">
          <path d="M150 44 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" fill="#FFD166" />
        </template>
      </g>

      <!-- Pin Base Body -->
      <path
        d="M100 218 C 70 176 40 150 40 96 A 60 60 0 1 1 160 96 C 160 150 130 176 100 218 Z"
        :fill="`url(#${gradientId})`"
      />

      <!-- Face Inner White Area -->
      <ellipse cx="100" cy="98" rx="50" ry="44" fill="#FFF9F4" />

      <!-- Blushing Cheeks -->
      <circle cx="70" cy="110" r="9" fill="#FFC7B0" />
      <circle cx="130" cy="110" r="9" fill="#FFC7B0" />

      <!-- Face Features (Eyes & Mouth) -->
      <!-- saved face -->
      <template v-if="variant === 'saved'">
        <path d="M76 94 Q 84 86 92 94" stroke="#2E2924" stroke-width="5" stroke-linecap="round" fill="none" />
        <circle cx="116" cy="94" r="8" fill="#2E2924" />
        <circle cx="119" cy="91" r="2.6" fill="#FFFFFF" />
        <path d="M86 108 Q 100 124 114 108 Z" fill="#2E2924" />
      </template>

      <!-- cheer face -->
      <template v-else-if="variant === 'cheer'">
        <path d="M75 96 Q 84 86 93 96" stroke="#2E2924" stroke-width="5" stroke-linecap="round" fill="none" />
        <path d="M107 96 Q 116 86 125 96" stroke="#2E2924" stroke-width="5" stroke-linecap="round" fill="none" />
        <path d="M86 108 Q 100 126 114 108 Z" fill="#2E2924" />
        <path d="M93 116 Q 100 121 107 116 Z" fill="#FF7A6B" />
      </template>

      <!-- wink face -->
      <template v-else-if="variant === 'wink'">
        <circle cx="84" cy="94" r="8" fill="#2E2924" />
        <circle cx="87" cy="91" r="2.6" fill="#FFFFFF" />
        <path d="M108 95 Q 116 88 124 95" stroke="#2E2924" stroke-width="5" stroke-linecap="round" fill="none" />
        <path d="M88 110 Q 100 121 112 110" stroke="#2E2924" stroke-width="4.5" stroke-linecap="round" fill="none" />
      </template>

      <!-- default & guide face (open eyes + gentle smile) -->
      <template v-else>
        <circle cx="84" cy="94" r="8" fill="#2E2924" />
        <circle cx="116" cy="94" r="8" fill="#2E2924" />
        <circle cx="87" cy="91" r="2.6" fill="#FFFFFF" />
        <circle cx="119" cy="91" r="2.6" fill="#FFFFFF" />
        <path d="M90 110 Q 100 120 110 110" stroke="#2E2924" stroke-width="4.5" stroke-linecap="round" fill="none" />
      </template>
    </svg>
  </span>
</template>
