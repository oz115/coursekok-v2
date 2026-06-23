/**
 * src/composables/useKitUtils.js
 * ─────────────────────────────────────────────────────────────
 * 원본: raw-wireframe/output/scripts/shared_kit_helpers_vibe_reusable_bits_ac.js
 *
 * 공통 유틸리티 함수·상수를 ES 모듈 named export로 제공한다.
 * Vue 컴포넌트 내부에서 import { won, catColor, ... } from '@/composables/useKitUtils'
 * 형태로 사용한다.
 */

// ── 통화 포맷 ───────────────────────────────────────────────────────────────
export const won = (n) => (n || 0).toLocaleString('ko-KR') + '원'

// ── 카테고리 색상 매핑 ────────────────────────────────────────────────────────
export const catColor = {
  관광지: 'var(--coral-500)',
  음식점: 'var(--amber-500)',
  숙박:   'var(--sky-500)',
  축제:   'var(--mint-500)',
}

export const catTone = (c) =>
  c === '음식점' ? 'amber' : c === '숙박' ? 'sky' : c === '축제' ? 'mint' : 'coral'

export const catSoft = {
  관광지: 'var(--coral-50)',
  음식점: 'var(--amber-50)',
  숙박:   'var(--sky-50)',
  축제:   'var(--mint-50)',
}

// ── 경비 합계 계산 ────────────────────────────────────────────────────────────
/**
 * @param {Array} days  - aiPlan.days 구조
 * @param {Object} fixedCost - { rental, fuel }
 * @param {number} people
 * @returns {{ rows, perPerson, total }}
 */
export function calcCost(days, fixedCost = {}, people = 1) {
  const sum = { 관광지: 0, 음식점: 0, 숙박: 0, 축제: 0, move: 0 }
  days.forEach((d) =>
    d.items.forEach((it) => {
      sum[it.cat] = (sum[it.cat] || 0) + (it.cost || 0)
      if (it.move) sum.move += it.move.cost || 0
    })
  )
  const fixed = (fixedCost.rental || 0) + (fixedCost.fuel || 0)
  const perPerson = sum.관광지 + sum.음식점 + sum.숙박 + sum.축제 + sum.move
  const total = perPerson * people + fixed

  const rows = [
    { label: '숙박',      icon: 'bed',     v: sum.숙박,                   color: 'var(--sky-500)' },
    { label: '식비',      icon: 'utensils', v: sum.음식점,                 color: 'var(--amber-500)' },
    { label: '관광·입장', icon: 'ticket',   v: sum.관광지 + sum.축제,      color: 'var(--coral-500)' },
    { label: '교통·렌터카', icon: 'car',   v: sum.move + fixed,            color: 'var(--mint-500)' },
  ]
  const max = Math.max(...rows.map((r) => r.v), 1)

  return { rows, perPerson, total, fixed, max }
}

// ── UID 생성 ──────────────────────────────────────────────────────────────────
export const uid = () => 'u' + Math.random().toString(36).slice(2, 8)

// ── deep clone ────────────────────────────────────────────────────────────────
export const clone = (o) => JSON.parse(JSON.stringify(o))

// ── AI Planner 챗봇 의도 처리 ─────────────────────────────────────────────────
const img = (seed) => `https://picsum.photos/seed/${seed}/800/600`

export function applyIntent(plan, text) {
  const p = clone(plan)
  const t = text.replace(/\s/g, '')

  // 저렴하게
  if (/(저렴|아껴|싸게|줄여|예산|비용)/.test(t)) {
    let changed = false
    p.days.forEach((d) =>
      d.items.forEach((it) => {
        if (it.cat === '숙박' && it.cost > 90000) {
          it.title = '제주 게스트하우스'
          it.note = '가성비 좋은 감성 숙소'
          it.cost = 55000
          changed = true
        }
      })
    )
    return {
      plan: p,
      reply: changed
        ? '숙소를 가성비 게스트하우스로 바꿨어요. 1박에 12.5만원 아꼈네요! 💸 경비가 확 줄었어요.'
        : '이미 알뜰한 코스예요. 식비를 줄여볼까요?',
    }
  }
  // 카페 추가
  if (/(카페|커피|디저트)/.test(t)) {
    const dayIdx = /3일|셋|day3/i.test(t) ? 2 : /2일|둘|day2/i.test(t) ? 1 : 0
    const d = p.days[dayIdx] || p.days[0]
    d.items.splice(Math.max(1, d.items.length - 1), 0, {
      time: '16:00', title: '오션뷰 카페', cat: '음식점',
      note: '바다 보며 커피 한 잔', img: img('cafejeju'), cost: 8000,
      move: { mode: '차', time: '10분', cost: 0 },
    })
    return { plan: p, reply: `${d.day}일차에 바다 보이는 카페를 넣었어요 ☕ 오후 일정에 여유가 생겼죠?` }
  }
  // 맛집
  if (/(맛집|음식|먹|식당|점심|저녁)/.test(t)) {
    const d = p.days[1] || p.days[0]
    d.items.splice(d.items.length - 1, 0, {
      time: '18:30', title: '제주 흑돼지 맛집', cat: '음식점',
      note: '두툼한 근고기 한 점', img: img('blackpork'), cost: 22000,
      move: { mode: '차', time: '15분', cost: 0 },
    })
    return { plan: p, reply: '근처 흑돼지 맛집을 추가했어요 🐷 저녁이 든든해지겠네요!' }
  }
  // 여유롭게
  if (/(여유|천천|느긋|줄이|빼)/.test(t)) {
    const target = p.days.reduce((a, b) => (b.items.length > a.items.length ? b : a), p.days[0])
    if (target.items.length > 1) {
      const removed = target.items.pop()
      return { plan: p, reply: `${target.day}일차에서 '${removed.title}'를 빼서 한결 여유로워졌어요 🌿 쉬엄쉬엄 다녀오세요.` }
    }
  }
  return {
    plan: p,
    reply: '이렇게 적어보세요 — "숙소 저렴하게", "2일차에 카페 추가", "더 여유롭게" 처럼요. 바로 코스를 손봐드릴게요!',
  }
}
