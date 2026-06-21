<script setup>
/**
 * PlaceDetailOverlay.vue — 장소 상세 오버레이
 * ─────────────────────────────────────────────────────────────
 * 원본: raw-wireframe/output/scripts/PlaceDetail_overlay.js
 *
 * Props:
 *   - place       : Object | null — 표시할 장소 데이터
 *   - saved       : Boolean — 현재 저장(담기) 여부
 *
 * Emits:
 *   - close       : 오버레이 닫기 요청
 *   - toggle-save : (place) — 저장/해제 토글 요청
 *
 * React → Vue 생명주기 매핑:
 *   - 조건부 렌더링 `if (!place) return null` → v-if="place"
 *   - 고정 포지션 스크림(backdrop) onClick → @click="emit('close')"
 *   - CSS 애니메이션 'kok-fade-up' → 동일 클래스를 index.css에서 정의
 *   - PropTypes → defineProps + validator
 *
 * 접근성:
 *   - ESC 키로 닫기 지원 (onMounted/onUnmounted로 keydown 이벤트 등록)
 *   - 오버레이 열릴 때 body 스크롤 잠금 (overflow: hidden 토글)
 */

import { onMounted, onUnmounted, watch } from 'vue'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import Rating from '@/components/data-display/Rating.vue'
import IconButton from '@/components/data-display/IconButton.vue'

// ── Props & Emits ─────────────────────────────────────────────────────────────
const props = defineProps({
  /** 표시할 장소 데이터. null이면 오버레이 미표시. */
  place: {
    type: Object,
    default: null,
  },
  /** 현재 저장(담기) 상태 */
  saved: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'toggle-save'])

// ── ESC 키 & 바디 스크롤 잠금 ────────────────────────────────────────────────
// onMounted에서 이벤트를 등록하고 onUnmounted에서 반드시 해제한다.
// React의 useEffect(() => { ... return cleanup; }, [place]) 패턴을 Vue의
// watch + onMounted/onUnmounted 조합으로 재현한다.

function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

// place prop 변화에 따라 body 스크롤을 잠그거나 해제한다.
// 의존성 배열 대신 Vue watch()의 두 번째 인자 getter로 명시적으로 감시.
watch(
  () => props.place,
  (val) => {
    document.body.style.overflow = val ? 'hidden' : ''
  }
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  // 이미 place가 있는 상태에서 마운트됐을 경우도 처리
  if (props.place) document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = '' // 클린업: 잠금 반드시 해제
})
</script>

<template>
  <!-- v-if로 place가 null이면 아무것도 렌더하지 않음 -->
  <Teleport to="body">
    <div
      v-if="place"
      style="
        position: fixed; inset: 0; z-index: 60;
        display: flex; justify-content: center; align-items: flex-start;
        overflow-y: auto;
      "
    >
      <!-- 스크림(backdrop) — 클릭 시 닫기 -->
      <div
        style="position: fixed; inset: 0; background: var(--overlay-scrim);"
        @click="emit('close')"
      />

      <!-- 모달 패널 -->
      <div
        class="kok-fade-up"
        style="
          position: relative;
          width: min(720px, 94vw);
          margin: 48px 0;
          background: var(--surface);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          animation: kok-fade-up var(--dur-base) var(--ease-out);
        "
      >
        <!-- ── 커버 이미지 영역 ──────────────────────────────────────────── -->
        <div style="position: relative; height: 320px;">
          <img
            :src="place.img"
            :alt="place.title"
            style="width: 100%; height: 100%; object-fit: cover;"
          />

          <!-- 이미지 하단 그라데이션 오버레이 -->
          <div
            style="
              position: absolute; inset: 0;
              background: linear-gradient(to top, rgba(26,22,17,0.5), transparent 45%);
            "
          />

          <!-- 닫기 버튼 -->
          <div style="position: absolute; top: 16px; right: 16px;">
            <IconButton variant="glass" aria-label="닫기" @click="emit('close')">
              <!-- X 아이콘 인라인 SVG -->
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </IconButton>
          </div>

          <!-- 장소 메타 정보 (이미지 위 오버레이) -->
          <div style="position: absolute; left: 22px; bottom: 18px; right: 22px;">
            <Badge tone="coral" :solid="true">{{ place.cat }}</Badge>
            <h1 style="
              color: #fff; font-size: 32px; font-weight: 800;
              margin-top: 10px; letter-spacing: -0.02em;
            ">{{ place.title }}</h1>
            <div style="
              display: flex; align-items: center; gap: 6px;
              color: rgba(255,255,255,0.92); font-size: 15px; margin-top: 4px;
            ">
              <!-- Pin 아이콘 -->
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {{ place.region }}
            </div>
          </div>
        </div>

        <!-- ── 본문 콘텐츠 영역 ─────────────────────────────────────────── -->
        <div style="padding: 24px;">
          <!-- 평점 · 메타 정보 행 -->
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 18px; flex-wrap: wrap;">
            <Rating :model-value="place.rating" :show-value="true" :count="place.reviews" :size="20" :readonly="true" />

            <span style="width: 1px; height: 18px; background: var(--border);" />

            <!-- 소요 시간 -->
            <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 14px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ place.meta }}
            </span>

            <!-- 관광공사 인증 -->
            <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--mint-600); font-size: 14px; font-weight: 600;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              관광공사 인증
            </span>
          </div>

          <!-- 장소 설명 -->
          <p style="font-size: 16px; line-height: 1.7; color: var(--text-secondary); margin-bottom: 18px;">
            {{ place.desc }}
          </p>

          <!-- 해시태그 -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 22px;">
            <span
              v-for="tag in place.tags"
              :key="tag"
              style="
                padding: 6px 12px;
                background: var(--gray-50);
                border-radius: var(--radius-pill);
                font-size: 13px;
                color: var(--text-secondary);
                font-weight: 500;
              "
            >#{{ tag }}</span>
          </div>

          <!-- 지도 플레이스홀더 (프로덕션: Kakao Map SDK 컨테이너 교체) -->
          <div
            style="
              height: 150px; border-radius: var(--radius-md); margin-bottom: 22px;
              position: relative; overflow: hidden;
              background: repeating-linear-gradient(
                45deg,
                var(--gray-50), var(--gray-50) 14px,
                var(--gray-100) 14px, var(--gray-100) 28px
              );
              border: 1px solid var(--border);
              display: flex; align-items: center; justify-content: center;
            "
          >
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--text-muted);">
              <!-- Map 아이콘 -->
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" y1="2" x2="8" y2="18"/>
                <line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
              <span style="font-size: 13px;">지도 영역 (Kakao/관광공사 좌표)</span>
            </div>
          </div>

          <!-- 액션 버튼 행 -->
          <div style="display: flex; gap: 12px;">
            <!-- 저장/담기 버튼 — saved 상태에 따라 variant 전환 -->
            <Button
              :variant="saved ? 'secondary' : 'primary'"
              size="lg"
              :full-width="true"
              @click="emit('toggle-save', place)"
            >
              <template #left-icon>
                <!-- Check 또는 Bookmark 아이콘 -->
                <svg v-if="saved" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </template>
              {{ saved ? '바구니에 담김' : '장소 저장' }}
            </Button>

            <!-- 공유 버튼 -->
            <Button variant="secondary" size="lg">
              <template #left-icon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </template>
              공유
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes kok-fade-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
