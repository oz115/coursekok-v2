<script setup>
/**
 * KkIcon.vue — 코스콕 범용 아이콘 래퍼
 * ─────────────────────────────────────────────────
 * 원본 React 코드의 <Icon name="pin" /> 패턴을
 * Vue 3에서 <KkIcon name="pin" /> 로 그대로 대체한다.
 *
 * 사용법:
 *   <KkIcon name="pin" :size="24" color="var(--coral-500)" />
 *
 * Props:
 *   name        (String, required) — ICON_NAMES 에 정의된 아이콘 이름 (camelCase)
 *   size        (Number|String)    — px 단위 크기, default 20
 *   strokeWidth (Number)           — default 2
 *   color       (String)           — default 'currentColor'
 */
import { defineAsyncComponent, computed } from 'vue'
import { ICON_NAMES } from './index.js'

const props = defineProps({
  name:        { type: String, required: true },
  size:        { type: [Number, String], default: 20 },
  strokeWidth: { type: Number,           default: 2  },
  color:       { type: String,           default: 'currentColor' },
})

// camelCase 아이콘 이름 → PascalCase 컴포넌트 파일명
const toComponentName = (name) => 'Icon' + name.charAt(0).toUpperCase() + name.slice(1)

// 동적 import: 빌드 타임에 chunk splitting 가능
const DynamicIcon = computed(() => {
  const compName = toComponentName(props.name)
  if (!ICON_NAMES.includes(props.name)) {
    console.warn(`[KkIcon] 알 수 없는 아이콘 이름: "${props.name}". ICON_NAMES 목록을 확인하세요.`)
    return null
  }
  return defineAsyncComponent(() =>
    import(/* @vite-ignore */ `./${compName}.vue`)
  )
})
</script>

<template>
  <component
    :is="DynamicIcon"
    v-if="DynamicIcon"
    :size="props.size"
    :stroke-width="props.strokeWidth"
    :color="props.color"
  />
  <!-- fallback: 알 수 없는 아이콘 — 같은 크기의 빈 박스 -->
  <span
    v-else
    :style="{ display: 'inline-block', width: props.size + 'px', height: props.size + 'px' }"
    aria-hidden="true"
  />
</template>
