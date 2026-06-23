<script setup>
/**
 * AIPlannerView.vue — AI 플래너 뷰
 * ─────────────────────────────────────────────────────────────
 * 원본: AI_Planner_저장_장소_기반_일정_생성_챗봇_수정_이동수단경비.js
 *
 * 3단계 stage:
 *   setup   → loading (1.9초 애니메이션) → result
 *
 * 하위 섹션:
 *   - 여행 조건 설정 폼 (기간·스타일·밀도·인원)
 *   - 로딩 애니메이션 (Mascot + progress bar)
 *   - 결과: CourseMap ↔ DayTimeline 리스트 토글
 *   - CostSummary (경비 요약)
 *   - ChatDock (콜이 챗봇 수정)
 *
 * 전역 상태 주입:
 *   - inject('basketPlaces') : Place[] — 담은 장소 목록
 *   - inject('savePlan')      : (plan) => void — 내 여행으로 저장
 *   - inject('navigate')      : (view) => void
 *   - inject('showToast')     : (config) => void
 *
 * React → Vue 매핑:
 *   - React.useState('setup') → ref('setup')
 *   - React.useRef(null) for chat body scroll → ref(null) + nextTick
 *   - clone(KK.aiPlan) 초기화 → ref(clone(aiPlan))
 */

import { ref, computed, inject, nextTick } from 'vue'
import { aiPlan } from '@/data/mockData.js'
import { clone, calcCost, won, catTone, applyIntent } from '@/composables/useKitUtils.js'
import CourseMap from '@/components/domain/CourseMap.vue'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import Select from '@/components/forms/Select.vue'
import SegmentedControl from '@/components/navigation/SegmentedControl.vue'
import Mascot from '@/components/brand/Mascot.vue'

// ── 전역 주입 ───────────────────────────────────────────────────────────────
const basketPlaces = inject('basketPlaces', ref([]))
const savePlan     = inject('savePlan', () => {})
const navigate     = inject('navigate', () => {})
const showToast    = inject('showToast', () => {})

// ── 단계 상태 ──────────────────────────────────────────────────────────────
const stage = ref('setup') // 'setup' | 'loading' | 'result'

// ── 설정 값 ────────────────────────────────────────────────────────────────
const period  = ref('2박 3일')
const style   = ref('힐링')
const pace    = ref('여유롭게')
const people  = ref(2)

const periodOptions = ['당일치기', '1박 2일', '2박 3일', '3박 4일']
const styleOptions  = ['힐링', '액티비티', '미식', '감성']

// ── 코스 데이터 ────────────────────────────────────────────────────────────
const plan = ref(clone(aiPlan))

// ── 뷰 토글 (리스트 ↔ 지도) ────────────────────────────────────────────────
const resultView = ref('list')

// ── 생성 실행 ──────────────────────────────────────────────────────────────
function run() {
  if (basketPlaces.value.length === 0) return
  stage.value = 'loading'
  setTimeout(() => { stage.value = 'result' }, 1900)
}

// ── 정차지 삭제 ────────────────────────────────────────────────────────────
function removeItem(dayIdx, itemIdx) {
  plan.value = clone({
    ...plan.value,
    days: plan.value.days.map((d, di) => {
      if (di !== dayIdx) return d
      return { ...d, items: d.items.filter((_, ii) => ii !== itemIdx) }
    }),
  })
}

// ── 경비 요약 (computed) ───────────────────────────────────────────────────
const cost = computed(() =>
  calcCost(plan.value.days, plan.value.fixedCost, people.value)
)

// ── ChatDock ──────────────────────────────────────────────────────────────
const QUICK = ['숙소 저렴하게 바꿔줘', '2일차에 카페 추가', '더 여유롭게', '맛집 한 곳 더']

const msgs     = ref([{ role: 'kok', text: '코스가 마음에 드세요? 바꾸고 싶은 점을 말해주면 제가 바로 손봐드릴게요 ✨' }])
const chatText = ref('')
const chatBodyRef = ref(null)

async function sendChat(raw) {
  const v = (raw || chatText.value).trim()
  if (!v) return
  const { plan: next, reply } = applyIntent(plan.value, v)
  msgs.value = [...msgs.value, { role: 'me', text: v }, { role: 'kok', text: reply }]
  plan.value = next
  chatText.value = ''
  await nextTick()
  if (chatBodyRef.value) chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
}

// ── 카테고리 색상 ─────────────────────────────────────────────────────────
const CAT_COLOR = {
  관광지: 'var(--coral-500)', 음식점: 'var(--amber-500)',
  숙박:   'var(--sky-500)',  축제:   'var(--mint-500)',
}

// ── 인원 증감 버튼 스타일 ─────────────────────────────────────────────────
const stepBtnStyle = {
  width: '34px', height: '34px', borderRadius: '50%', border: 'none',
  background: 'var(--gray-50)', color: 'var(--text-secondary)',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}

// ── 코스 저장 → 내 여행으로 이동 ─────────────────────────────────────────
function handleSavePlan() {
  savePlan({ ...plan.value, period: period.value, style: style.value, people: people.value })
  showToast({ tone: 'success', message: '코스가 내 여행에 저장됐어요!', icon: 'check' })
  navigate('trips')
}
</script>

<template>
  <div style="max-width: 900px; margin: 0 auto; padding: 32px 24px 90px;">

    <!-- ══════════════ STAGE: SETUP ══════════════ -->
    <template v-if="stage === 'setup'">
      <!-- 헤더 배너 -->
      <div style="
        position: relative; border-radius: var(--radius-2xl); overflow: hidden;
        background: linear-gradient(120deg, var(--sky-50), var(--mint-50) 70%);
        padding: 26px 30px; margin-bottom: 22px;
        display: flex; align-items: center; gap: 16px;
      ">
        <!-- 도트 텍스처 -->
        <div aria-hidden style="
          position: absolute; inset: 0; opacity: 0.4;
          background-image: radial-gradient(var(--sky-200) 2px, transparent 2px);
          background-size: 16px 16px;
        " />

        <Mascot variant="guide" :size="92" style="position: relative; flex: none;" />

        <div style="position: relative;">
          <Badge tone="sky">
            <template #left-icon>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3l1.88 5.76H20l-4.94 3.59 1.88 5.77L12 14.52l-4.94 3.6 1.88-5.77L4.06 8.76H10.12L12 3z"/>
              </svg>
            </template>
            AI PLANNER
          </Badge>
          <h1 style="font-size: 30px; font-weight: 800; letter-spacing: -0.02em; margin-top: 8px;">
            콕이가 코스를 짜드릴게요
          </h1>
          <p style="font-size: 15.5px; color: var(--text-secondary); margin-top: 4px;">
            저장한 장소와 조건만 알려주면 이동·경비까지 한 번에!
          </p>
        </div>
      </div>

      <!-- 설정 폼 카드 -->
      <div style="
        background: var(--surface); border-radius: var(--radius-xl);
        border: 1px solid var(--border-subtle); box-shadow: var(--shadow-md); padding: 26px;
      ">
        <!-- 바구니 장소 표시 -->
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--coral-500)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          </svg>
          <span style="font-size: 13px; font-weight: 700; color: var(--text-secondary);">
            여행 바구니 · {{ basketPlaces.length }}곳
          </span>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
          <span v-if="basketPlaces.length === 0" style="color: var(--text-muted); font-size: 14px;">
            먼저 여행지 탐색에서 장소를 담아주세요.
          </span>
          <span
            v-for="p in basketPlaces"
            :key="p.id"
            style="
              display: inline-flex; align-items: center; gap: 7px;
              padding: 6px 12px 6px 6px; background: var(--coral-50);
              border-radius: var(--radius-pill); font-size: 13px; font-weight: 600;
            "
          >
            <img :src="p.img" alt="" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover;" />
            {{ p.title }}
          </span>
        </div>

        <!-- 기간 · 스타일 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 20px;">
          <Select label="여행 기간" v-model="period" :options="periodOptions.map(v => ({ value: v, label: v }))" />
          <Select label="여행 스타일" v-model="style" :options="styleOptions.map(v => ({ value: v, label: v }))" />
        </div>

        <!-- 밀도 · 인원 -->
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: end; margin-bottom: 26px;">
          <div>
            <div style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
              하루 일정 밀도
            </div>
            <SegmentedControl v-model="pace" :options="['여유롭게', '적당히', '알차게']" />
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">인원</div>
            <div style="display: flex; align-items: center; gap: 4px; border: 1.5px solid var(--border); border-radius: var(--radius-pill); padding: 3px;">
              <button :style="stepBtnStyle" @click="people = Math.max(1, people - 1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span style="width: 40px; text-align: center; font-weight: 800; font-size: 16px;">{{ people }}</span>
              <button :style="stepBtnStyle" @click="people = Math.min(9, people + 1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>

        <Button variant="ai" size="lg" :full-width="true" :disabled="basketPlaces.length === 0" @click="run">
          <template #left-icon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l1.88 5.76H20l-4.94 3.59 1.88 5.77L12 14.52l-4.94 3.6 1.88-5.77L4.06 8.76H10.12L12 3z"/>
            </svg>
          </template>
          AI로 코스 생성하기
        </Button>
      </div>
    </template>

    <!-- ══════════════ STAGE: LOADING ══════════════ -->
    <div v-else-if="stage === 'loading'" style="
      display: flex; flex-direction: column; align-items: center;
      gap: 22px; padding: 90px 0;
    ">
      <div style="animation: kok-pop 1.1s var(--ease-spring) infinite;">
        <Mascot variant="guide" :size="130" />
      </div>
      <div style="font-size: 18px; font-weight: 700; text-align: center;">
        저장한 {{ basketPlaces.length }}곳을 {{ period }} {{ style }} 코스로 짜는 중…
      </div>
      <div style="width: 220px; height: 6px; border-radius: 99px; background: var(--gray-100); overflow: hidden;">
        <div style="
          width: 100%; height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, var(--sky-500), var(--mint-400));
          animation: kokload 1.9s var(--ease-out) forwards;
        " />
      </div>
    </div>

    <!-- ══════════════ STAGE: RESULT ══════════════ -->
    <template v-else-if="stage === 'result'">
      <!-- 결과 헤더 -->
      <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
        <Mascot variant="cheer" :size="72" />
        <div style="flex: 1;">
          <Badge tone="sky">
            <template #left-icon>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.88 5.76H20l-4.94 3.59 1.88 5.77L12 14.52l-4.94 3.6 1.88-5.77L4.06 8.76H10.12L12 3z"/></svg>
            </template>
            AI 추천 코스
          </Badge>
          <h1 style="font-size: 27px; font-weight: 800; margin-top: 8px; letter-spacing: -0.02em;">
            {{ period }} {{ style }} 제주 코스
          </h1>
        </div>
        <Button variant="ghost" size="sm" @click="plan = clone(aiPlan)">
          <template #left-icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.1"/>
            </svg>
          </template>
          처음으로
        </Button>
      </div>

      <!-- 뷰 토글 헤더 -->
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
        <h2 style="font-size: 18px; font-weight: 800;">코스 한눈에 보기</h2>
        <div style="flex: 1;" />
        <!-- 리스트 / 지도 토글 -->
        <div style="
          display: inline-flex; padding: 3px; background: var(--gray-50);
          border-radius: var(--radius-pill); border: 1px solid var(--border-subtle);
        ">
          <button
            v-for="opt in [{ k: 'list', label: '리스트' }, { k: 'map', label: '지도' }]"
            :key="opt.k"
            @click="resultView = opt.k"
            :style="{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: 'var(--radius-pill)', border: 'none',
              cursor: 'pointer',
              background: resultView === opt.k ? 'var(--surface)' : 'transparent',
              color: resultView === opt.k ? 'var(--coral-600)' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-sans)',
              boxShadow: resultView === opt.k ? 'var(--shadow-xs)' : 'none',
            }"
          >{{ opt.label }}</button>
        </div>
      </div>

      <!-- 지도 뷰 -->
      <div v-if="resultView === 'map'" style="margin-bottom: 18px;">
        <CourseMap :days="plan.days" :height="380" />
      </div>

      <!-- 리스트 뷰 — DayTimeline -->
      <div v-else style="display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 18px;">
        <div
          v-for="(day, di) in plan.days"
          :key="di"
          style="
            background: var(--gray-50); border-radius: var(--radius-lg);
            border: 1px solid var(--border-subtle); overflow: hidden;
          "
        >
          <!-- 일자 헤더 -->
          <div style="
            display: flex; align-items: center; gap: 12px;
            padding: 15px 20px; background: var(--surface);
            border-bottom: 1px solid var(--border-subtle);
          ">
            <span style="
              width: 36px; height: 36px; border-radius: 50%;
              background: var(--coral-500); color: #fff;
              font-weight: 800; font-size: 16px;
              display: flex; align-items: center; justify-content: center;
              box-shadow: var(--shadow-primary);
            ">{{ day.day }}</span>
            <div>
              <div style="font-size: 11.5px; color: var(--coral-600); font-weight: 800; letter-spacing: 0.04em;">DAY {{ day.day }}</div>
              <div style="font-weight: 700; font-size: 17px;">{{ day.theme }}</div>
            </div>
            <div style="flex: 1;" />
            <Badge tone="neutral" size="sm">{{ day.items.length }}곳</Badge>
          </div>

          <!-- 정차지 목록 -->
          <div style="padding: 6px 18px 14px;">
            <template v-for="(it, ii) in day.items" :key="ii">
              <!-- 이동 수단 행 -->
              <div v-if="it.move" style="display: flex; gap: 14px;">
                <div style="width: 52px; flex: none;" />
                <div style="width: 13px; flex: none; display: flex; justify-content: center;">
                  <span style="
                    width: 2px; background: repeating-linear-gradient(var(--sky-200) 0 5px, transparent 5px 10px);
                    flex: 1; margin: 3px 0;
                  " />
                </div>
                <div style="flex: 1; padding: 7px 0;">
                  <span style="
                    display: inline-flex; align-items: center; gap: 7px;
                    padding: 5px 10px; border-radius: var(--radius-pill);
                    background: var(--sky-50); color: var(--sky-700);
                    font-size: 12.5px; font-weight: 600;
                  ">{{ it.move.mode }} · {{ it.move.time }}</span>
                </div>
              </div>

              <!-- 정차지 카드 -->
              <div style="display: flex; gap: 14px; position: relative;">
                <div style="width: 52px; flex: none; font-size: 13px; font-weight: 700; color: var(--text-secondary); padding-top: 14px;">
                  {{ it.time }}
                </div>
                <div style="
                  position: relative; flex: none;
                  display: flex; flex-direction: column; align-items: center; padding-top: 16px;
                ">
                  <span :style="{
                    width: '13px', height: '13px', borderRadius: '50%',
                    background: CAT_COLOR[it.cat],
                    border: '2.5px solid var(--surface)',
                    boxShadow: `0 0 0 1.5px ${CAT_COLOR[it.cat]}`,
                  }" />
                  <span v-if="ii < day.items.length - 1" style="flex: 1; width: 2px; background: var(--border); margin-top: 4px;" />
                </div>
                <div :style="{ flex: 1, minWidth: 0, paddingBottom: ii === day.items.length - 1 ? '4px' : '14px' }">
                  <div style="
                    display: flex; gap: 12px; padding: 12px;
                    background: var(--surface); border-radius: var(--radius-md);
                    border: 1px solid var(--border-subtle); box-shadow: var(--shadow-xs);
                  ">
                    <img :src="it.img" alt="" style="width: 58px; height: 58px; border-radius: var(--radius-sm); object-fit: cover; flex: none;" />
                    <div style="flex: 1; min-width: 0;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <b style="font-size: 15.5px;">{{ it.title }}</b>
                        <Badge :tone="catTone(it.cat)" size="sm">{{ it.cat }}</Badge>
                      </div>
                      <div style="font-size: 13px; color: var(--text-muted); margin-top: 3px;">{{ it.note }}</div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex: none;">
                      <span :style="{
                        fontSize: '13.5px', fontWeight: 700, whiteSpace: 'nowrap',
                        color: it.cost ? 'var(--text-primary)' : 'var(--mint-600)',
                      }">{{ it.cost ? won(it.cost) : '무료' }}</span>
                      <button
                        @click="removeItem(di, ii)"
                        aria-label="제외"
                        style="
                          border: none; background: var(--gray-50);
                          width: 28px; height: 28px; border-radius: 50%;
                          cursor: pointer; color: var(--text-muted);
                          display: flex; align-items: center; justify-content: center;
                        "
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 경비 요약 -->
      <div style="
        background: var(--surface); border-radius: var(--radius-lg);
        border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm);
        padding: 22px; margin-bottom: 18px;
      ">
        <div style="display: flex; align-items: center; gap: 9px; margin-bottom: 16px;">
          <span style="
            width: 34px; height: 34px; border-radius: 10px;
            background: var(--mint-50); color: var(--mint-600);
            display: flex; align-items: center; justify-content: center;
          ">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </span>
          <b style="font-size: 16px;">예상 경비</b>
          <div style="flex: 1;" />
          <span style="font-size: 12.5px; color: var(--text-muted); font-weight: 600;">{{ people }}인 기준</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
          <div v-for="row in cost.rows" :key="row.label" style="display: flex; align-items: center; gap: 12px;">
            <span style="width: 26px; flex: none; display: flex;" :style="{ color: row.color }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </span>
            <span style="font-size: 13.5px; font-weight: 600; width: 84px; flex: none;">{{ row.label }}</span>
            <div style="flex: 1; height: 7px; border-radius: 99px; background: var(--gray-50); overflow: hidden;">
              <div :style="{
                width: `${Math.max(8, (row.v / cost.max) * 100)}%`,
                height: '100%', borderRadius: '99px', background: row.color,
              }" />
            </div>
            <span style="font-size: 13.5px; font-weight: 700; width: 86px; text-align: right; flex: none;">{{ won(row.v) }}</span>
          </div>
        </div>

        <div style="display: flex; align-items: baseline; gap: 8px; padding-top: 14px; border-top: 1px dashed var(--border);">
          <b style="font-size: 15px;">총 합계</b>
          <div style="flex: 1;" />
          <b style="font-size: 24px; font-weight: 800; color: var(--coral-600); letter-spacing: -0.02em;">
            {{ won(cost.total) }}
          </b>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px; text-align: right;">
          1인 {{ won(cost.perPerson) }} · 렌터카·주유 {{ won(cost.fixed) }} 포함
        </div>
      </div>

      <!-- ChatDock -->
      <div style="
        background: var(--surface); border-radius: var(--radius-xl);
        border: 1.5px solid var(--sky-100); box-shadow: var(--shadow-md);
        overflow: hidden; margin-bottom: 22px;
      ">
        <!-- 헤더 -->
        <div style="
          display: flex; align-items: center; gap: 10px;
          padding: 14px 18px;
          background: linear-gradient(100deg, var(--sky-50), var(--mint-50));
          border-bottom: 1px solid var(--sky-100);
        ">
          <Mascot variant="guide" :size="38" />
          <div>
            <b style="font-size: 15px;">콕이에게 수정 요청하기</b>
            <div style="font-size: 12.5px; color: var(--sky-700); font-weight: 600;">대화로 코스를 자유롭게 바꿔보세요</div>
          </div>
        </div>

        <!-- 대화 목록 -->
        <div ref="chatBodyRef" style="max-height: 230px; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px;">
          <div
            v-for="(m, i) in msgs"
            :key="i"
            :style="{ display: 'flex', justifyContent: m.role === 'me' ? 'flex-end' : 'flex-start' }"
          >
            <div :style="{
              maxWidth: '78%', padding: '10px 14px', borderRadius: '16px',
              fontSize: '14.5px', lineHeight: 1.5,
              background: m.role === 'me' ? 'var(--coral-500)' : 'var(--gray-50)',
              color: m.role === 'me' ? '#fff' : 'var(--text-primary)',
              borderBottomRightRadius: m.role === 'me' ? '4px' : '16px',
              borderBottomLeftRadius: m.role === 'me' ? '16px' : '4px',
            }">{{ m.text }}</div>
          </div>
        </div>

        <!-- 빠른 선택 -->
        <div style="padding: 0 14px 12px; display: flex; gap: 7px; flex-wrap: wrap;">
          <button
            v-for="q in QUICK"
            :key="q"
            @click="sendChat(q)"
            style="
              padding: 7px 12px; border-radius: var(--radius-pill);
              border: 1px solid var(--sky-200); background: var(--sky-50);
              color: var(--sky-700); font-size: 12.5px; font-weight: 600;
              cursor: pointer; font-family: var(--font-sans);
            "
          >{{ q }}</button>
        </div>

        <!-- 입력창 -->
        <div style="display: flex; gap: 8px; align-items: center; padding: 4px 12px 14px;">
          <div style="
            flex: 1; display: flex; align-items: center; gap: 8px;
            background: var(--gray-50); border: 1.5px solid var(--border);
            border-radius: var(--radius-pill); padding: 4px 4px 4px 16px;
          ">
            <input
              v-model="chatText"
              placeholder="예) 3일차에 카페 추가해줘"
              @keydown.enter="sendChat()"
              style="
                flex: 1; border: none; outline: none; background: transparent;
                font-size: 14.5px; font-family: var(--font-sans); min-width: 0;
              "
            />
            <button
              @click="sendChat()"
              aria-label="보내기"
              :style="{
                width: '38px', height: '38px', borderRadius: '50%',
                border: 'none', cursor: 'pointer',
                background: chatText.trim() ? 'var(--coral-500)' : 'var(--gray-200)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
              }"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 하단 CTA -->
      <div style="display: flex; gap: 12px;">
        <Button variant="primary" size="lg" :full-width="true" @click="handleSavePlan">
          <template #left-icon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </template>
          이 코스로 내 여행 만들기
        </Button>
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
    </template>
  </div>
</template>

<style scoped>
@keyframes kokload { from { width: 8%; } to { width: 100%; } }
</style>
