import type { AiPlan, JournalEntry, PlaceCategory, PlanDay } from '@/data/mockData'

export interface CostRow {
  label: string
  icon: string
  v: number
  color: string
}

export interface CostSummary {
  rows: CostRow[]
  perPerson: number
  total: number
  fixed: number
  max: number
}

export const won = (n: number) => `${(n || 0).toLocaleString('ko-KR')} KRW`

export const catColor: Record<PlaceCategory, string> = {
  Spot: 'var(--coral-500)',
  Food: 'var(--amber-500)',
  Stay: 'var(--sky-500)',
  Festival: 'var(--mint-500)',
}

export const catTone = (category: PlaceCategory) =>
  category === 'Food' ? 'amber' : category === 'Stay' ? 'sky' : category === 'Festival' ? 'mint' : 'coral'

export const catSoft: Record<PlaceCategory, string> = {
  Spot: 'var(--coral-50)',
  Food: 'var(--amber-50)',
  Stay: 'var(--sky-50)',
  Festival: 'var(--mint-50)',
}

export function calcCost(
  days: PlanDay[],
  fixedCost: Partial<AiPlan['fixedCost']> = {},
  people = 1,
): CostSummary {
  const sum: Record<PlaceCategory | 'move', number> = {
    Spot: 0,
    Food: 0,
    Stay: 0,
    Festival: 0,
    move: 0,
  }

  days.forEach((day) => {
    day.items.forEach((item) => {
      sum[item.cat] += item.cost || 0
      sum.move += item.move?.cost || 0
    })
  })

  const fixed = (fixedCost.rental || 0) + (fixedCost.fuel || 0)
  const perPerson = sum.Spot + sum.Food + sum.Stay + sum.Festival + sum.move
  const total = perPerson * people + fixed
  const rows: CostRow[] = [
    { label: 'Stay', icon: 'bed', v: sum.Stay, color: 'var(--sky-500)' },
    { label: 'Food', icon: 'utensils', v: sum.Food, color: 'var(--amber-500)' },
    { label: 'Tickets', icon: 'ticket', v: sum.Spot + sum.Festival, color: 'var(--coral-500)' },
    { label: 'Transport', icon: 'car', v: sum.move + fixed, color: 'var(--mint-500)' },
  ]

  return { rows, perPerson, total, fixed, max: Math.max(...rows.map((row) => row.v), 1) }
}

export const uid = () => `u${Math.random().toString(36).slice(2, 8)}`

export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

export function applyIntent(plan: AiPlan, text: string): { plan: AiPlan; reply: string } {
  const next = clone(plan)
  const compact = text.toLowerCase().replace(/\s/g, '')

  if (/(cheap|budget|lower|reduce)/.test(compact)) {
    next.days.forEach((day) => {
      day.items.forEach((item) => {
        if (item.cat === 'Stay' && item.cost > 90000) {
          item.title = 'Budget Guesthouse'
          item.note = 'Lower-cost stay option'
          item.cost = 55000
        }
      })
    })
    return { plan: next, reply: 'I changed the stay to a lower-cost option.' }
  }

  if (/(cafe|coffee)/.test(compact)) {
    const day = next.days[0]
    if (!day) return { plan: next, reply: 'There is no day to update.' }
    day.items.splice(Math.max(1, day.items.length - 1), 0, {
      time: '16:00',
      title: 'Ocean View Cafe',
      cat: 'Food',
      note: 'Coffee break with a view',
      img: '/images/img_cafejeju.jpg',
      cost: 8000,
      move: { mode: 'Car', time: '10 min', cost: 0 },
    })
    return { plan: next, reply: 'I added an ocean view cafe stop.' }
  }

  if (/(slow|relax|free)/.test(compact)) {
    const firstDay = next.days[0]
    if (!firstDay) return { plan: next, reply: 'There is no day to update.' }
    const target = next.days.reduce((a, b) => (b.items.length > a.items.length ? b : a), firstDay)
    if (target.items.length > 1) target.items.pop()
    return { plan: next, reply: 'I removed one stop to make the route more relaxed.' }
  }

  return { plan: next, reply: 'Try asking for a cheaper stay, a cafe stop, or a slower route.' }
}

export type JournalMap = Record<string, JournalEntry[]>
