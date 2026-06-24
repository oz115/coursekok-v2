<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { addTripComment, getSharedTrip } from '@/api/tripCollaboration.js'
import KkIcon from '@/components/icons/KkIcon.vue'
import Mascot from '@/components/brand/Mascot.vue'

const route = useRoute()
const sharedTrip = ref(null)
const loading = ref(true)
const error = ref('')
const nickname = ref(localStorage.getItem('coursekok_collab_nickname') || '')
const activeTarget = ref(null)
const commentText = ref('')
const preference = ref('OK')
const submitting = ref(false)
const copied = ref(false)

const plan = computed(() => {
  if (!sharedTrip.value?.aiPlanSnapshot) return { days: [] }
  try {
    return JSON.parse(sharedTrip.value.aiPlanSnapshot)
  } catch {
    return { days: [] }
  }
})

const days = computed(() =>
  (plan.value.days || []).map((day, dayIndex) => ({
    ...day,
    dayNumber: day.day || dayIndex + 1,
    items: (day.items || []).map((item, itemIndex) => ({
      ...item,
      targetKey: `day-${dayIndex + 1}-item-${itemIndex + 1}`,
    })),
  })),
)

const allItems = computed(() => days.value.flatMap((day) => day.items))
const comments = computed(() => sharedTrip.value?.comments || [])
const commentsByTarget = computed(() =>
  comments.value.reduce((groups, comment) => {
    ;(groups[comment.targetKey] ||= []).push(comment)
    return groups
  }, {}),
)

const preferenceCounts = computed(() =>
  comments.value.reduce(
    (counts, comment) => {
      counts[comment.preference] += 1
      return counts
    },
    { MUST: 0, OK: 0, SKIP: 0 },
  ),
)

const estimatedDistance = computed(() => Math.max(24, allItems.value.length * 18))
const peopleCount = computed(() => {
  const names = new Set(comments.value.map((comment) => comment.nickname))
  return Math.max(2, names.size || 0)
})
const transportOptions = computed(() => {
  const distance = estimatedDistance.value
  const people = peopleCount.value
  const rentalTotal = 78000 + distance * 190
  const transitTotal = people * (9000 + allItems.value.length * 1400)
  const taxiTotal = Math.round(distance * 2100)
  return [
    {
      key: 'rental',
      icon: 'car',
      name: '렌터카',
      label: '동선이 긴 일정에 추천',
      time: `${Math.max(2, Math.round(distance / 32))}시간 내외`,
      total: rentalTotal,
      perPerson: Math.round(rentalTotal / people),
      detail: `예상 ${distance}km · 유류/주차 포함`,
      recommended: allItems.value.length >= 5,
    },
    {
      key: 'transit',
      icon: 'bus',
      name: '대중교통',
      label: '비용을 아끼고 싶다면',
      time: `${Math.max(3, Math.round(distance / 18))}시간 내외`,
      total: transitTotal,
      perPerson: Math.round(transitTotal / people),
      detail: `환승 약 ${Math.max(2, days.value.length * 2)}회`,
      recommended: allItems.value.length < 5,
    },
    {
      key: 'taxi',
      icon: 'route',
      name: '택시 혼합',
      label: '운전 부담 없는 선택',
      time: `${Math.max(2, Math.round(distance / 27))}시간 내외`,
      total: taxiTotal,
      perPerson: Math.round(taxiTotal / people),
      detail: '핵심 구간 택시 + 도보',
      recommended: false,
    },
  ]
})

const aiSummary = computed(() => {
  const counts = preferenceCounts.value
  if (!comments.value.length) {
    return '아직 친구 의견이 없어요. 일정 카드에서 선호도와 코멘트를 남겨보세요.'
  }
  const parts = []
  if (counts.MUST) parts.push(`꼭 가고 싶은 의견 ${counts.MUST}개`)
  if (counts.SKIP) parts.push(`제외를 검토할 의견 ${counts.SKIP}개`)
  parts.push(`${comments.value.length}개의 의견이 모였어요`)
  return `${parts.join(', ')}. 의견이 많은 장소부터 동선을 다시 조정해보세요.`
})

onMounted(loadTrip)

async function loadTrip() {
  loading.value = true
  error.value = ''
  try {
    sharedTrip.value = await getSharedTrip(route.params.token)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function openComment(item) {
  activeTarget.value = item
  commentText.value = ''
  preference.value = 'OK'
}

async function submitComment() {
  const name = nickname.value.trim()
  const content = commentText.value.trim()
  if (!name || !content || !activeTarget.value) return
  submitting.value = true
  try {
    localStorage.setItem('coursekok_collab_nickname', name)
    const created = await addTripComment(route.params.token, {
      targetKey: activeTarget.value.targetKey,
      nickname: name,
      content,
      preference: preference.value,
    })
    sharedTrip.value = {
      ...sharedTrip.value,
      comments: [...comments.value, created],
    }
    activeTarget.value = null
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}

async function copyShareLink() {
  await navigator.clipboard.writeText(window.location.href)
  copied.value = true
  window.setTimeout(() => { copied.value = false }, 1800)
}

function money(value) {
  return `${Math.round(value).toLocaleString()}원`
}

function preferenceLabel(value) {
  return { MUST: '꼭 가요', OK: '괜찮아요', SKIP: '빼도 돼요' }[value] || value
}
</script>

<template>
  <main class="collab-page">
    <div v-if="loading" class="state-card">
      <Mascot variant="guide" :size="74" />
      <p>친구들의 여행 계획을 불러오고 있어요.</p>
    </div>

    <div v-else-if="error && !sharedTrip" class="state-card error">
      <KkIcon name="lock" :size="34" />
      <h1>공유된 여행을 열 수 없어요</h1>
      <p>{{ error }}</p>
    </div>

    <div v-else class="collab-shell">
      <header class="collab-header">
        <a class="brand" href="/">
          <span>콕</span>
          코스콕
        </a>
        <button type="button" class="copy-button" @click="copyShareLink">
          <KkIcon :name="copied ? 'check' : 'copy'" :size="16" />
          {{ copied ? '링크 복사됨' : '친구 초대' }}
        </button>
      </header>

      <section class="trip-hero">
        <div class="hero-copy">
          <span class="eyebrow">TOGETHER TRIP</span>
          <h1>{{ sharedTrip.title }}</h1>
          <p>{{ sharedTrip.ownerNickname }}님이 만든 {{ sharedTrip.region }} 여행에 의견을 보태주세요.</p>
          <div class="hero-tags">
            <span>{{ sharedTrip.region }}</span>
            <span>{{ sharedTrip.period }}</span>
            <span v-if="sharedTrip.style">{{ sharedTrip.style }}</span>
          </div>
        </div>
        <Mascot variant="cheer" :size="104" />
      </section>

      <section class="ai-brief">
        <div class="ai-icon"><KkIcon name="sparkles" :size="20" /></div>
        <div>
          <span>AI 의견 브리핑</span>
          <strong>{{ aiSummary }}</strong>
        </div>
        <div class="brief-counts">
          <span class="must">꼭 가요 {{ preferenceCounts.MUST }}</span>
          <span>괜찮아요 {{ preferenceCounts.OK }}</span>
          <span class="skip">빼도 돼요 {{ preferenceCounts.SKIP }}</span>
        </div>
      </section>

      <div class="collab-grid">
        <section class="itinerary">
          <header class="section-head">
            <div>
              <span>ITINERARY</span>
              <h2>일정에 의견 남기기</h2>
            </div>
            <small>{{ comments.length }}개의 의견</small>
          </header>

          <div v-if="!days.length" class="empty-plan">
            저장된 세부 일정이 없어요.
          </div>

          <article v-for="day in days" :key="day.dayNumber" class="day-card">
            <header>
              <span>DAY {{ day.dayNumber }}</span>
              <h3>{{ day.title || `${day.dayNumber}일차 여행` }}</h3>
            </header>

            <div v-for="(item, index) in day.items" :key="item.targetKey" class="schedule-item">
              <div class="time">{{ item.time || `${10 + index * 2}:00` }}</div>
              <div class="route-line"><span /></div>
              <div class="place">
                <div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.cat || item.category || '여행 장소' }}</p>
                </div>
                <button type="button" @click="openComment(item)">
                  <KkIcon name="message" :size="15" />
                  의견
                </button>
                <div v-if="commentsByTarget[item.targetKey]?.length" class="comment-preview">
                  <div v-for="comment in commentsByTarget[item.targetKey]" :key="comment.id">
                    <span :class="comment.preference.toLowerCase()">
                      {{ preferenceLabel(comment.preference) }}
                    </span>
                    <strong>{{ comment.nickname }}</strong>
                    <p>{{ comment.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <aside class="decision-panel">
          <section class="transport-card">
            <header>
              <span>MOVE SMART</span>
              <h2>이 일정, 어떻게 이동할까요?</h2>
              <p>{{ peopleCount }}명 기준 예상치예요.</p>
            </header>
            <article
              v-for="option in transportOptions"
              :key="option.key"
              :class="{ recommended: option.recommended }"
            >
              <div class="transport-title">
                <span><KkIcon :name="option.icon" :size="18" /></span>
                <div>
                  <strong>{{ option.name }}</strong>
                  <small>{{ option.label }}</small>
                </div>
                <b v-if="option.recommended">추천</b>
              </div>
              <dl>
                <div><dt>이동시간</dt><dd>{{ option.time }}</dd></div>
                <div><dt>예상 총비용</dt><dd>{{ money(option.total) }}</dd></div>
                <div><dt>1인 예상</dt><dd>{{ money(option.perPerson) }}</dd></div>
              </dl>
              <p>{{ option.detail }}</p>
            </article>
            <small class="estimate-note">실제 교통·대여 가격이 아닌 일정 기반 기획용 예상치입니다.</small>
          </section>
        </aside>
      </div>
    </div>

    <div v-if="activeTarget" class="modal-backdrop" @click.self="activeTarget = null">
      <form class="comment-modal" @submit.prevent="submitComment">
        <button type="button" class="modal-close" @click="activeTarget = null">
          <KkIcon name="x" :size="20" />
        </button>
        <span class="eyebrow">SCHEDULE COMMENT</span>
        <h2>{{ activeTarget.title }}</h2>
        <p>이 일정에 대한 선호와 이유를 친구들에게 알려주세요.</p>

        <label>
          이름
          <input v-model="nickname" maxlength="30" placeholder="친구들이 알아볼 이름" />
        </label>

        <div class="preference-row">
          <button
            v-for="option in [
              { value: 'MUST', label: '꼭 가요' },
              { value: 'OK', label: '괜찮아요' },
              { value: 'SKIP', label: '빼도 돼요' },
            ]"
            :key="option.value"
            type="button"
            :class="[option.value.toLowerCase(), { active: preference === option.value }]"
            @click="preference = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <label>
          코멘트
          <textarea v-model="commentText" maxlength="500" rows="4" placeholder="시간, 비용, 장소에 대한 의견을 적어주세요." />
        </label>
        <button class="submit-comment" type="submit" :disabled="submitting || !nickname.trim() || !commentText.trim()">
          {{ submitting ? '등록 중...' : '의견 남기기' }}
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
*{box-sizing:border-box}.collab-page{min-height:100vh;background:#f7f4f1;color:var(--text-primary);font-family:var(--font-sans)}.collab-shell{width:min(1180px,100%);margin:0 auto;padding:0 22px 80px}.collab-header{display:flex;align-items:center;justify-content:space-between;height:72px}.brand{display:flex;align-items:center;gap:8px;color:var(--text-primary);font-size:18px;font-weight:900;text-decoration:none}.brand span{display:grid;width:34px;height:34px;place-items:center;border-radius:11px;background:var(--coral-500);color:#fff;font-size:13px}.copy-button{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 15px;border:1px solid var(--border);border-radius:12px;background:#fff;color:var(--text-secondary);font-weight:800;cursor:pointer}.trip-hero{display:flex;align-items:center;justify-content:space-between;min-height:210px;padding:34px 42px;overflow:hidden;border:1px solid #f0ded3;border-radius:28px;background:linear-gradient(120deg,#fff 0%,#fff6f1 58%,#e9faf5);box-shadow:var(--shadow-sm)}.hero-copy{min-width:0}.eyebrow{color:var(--coral-600);font-size:11px;font-weight:900;letter-spacing:.12em}.trip-hero h1{margin:9px 0 8px;font-size:clamp(27px,4vw,40px);letter-spacing:-.03em}.trip-hero p{color:var(--text-secondary)}.hero-tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:18px}.hero-tags span{padding:7px 10px;border-radius:999px;background:#fff;color:var(--text-secondary);font-size:12px;font-weight:800;box-shadow:var(--shadow-xs)}.ai-brief{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:14px;padding:18px 20px;margin:20px 0;border:1px solid var(--sky-100);border-radius:18px;background:var(--sky-50)}.ai-icon{display:grid;width:42px;height:42px;place-items:center;border-radius:13px;background:var(--sky-500);color:#fff}.ai-brief>div:nth-child(2){display:grid;gap:3px}.ai-brief>div:nth-child(2) span{color:var(--sky-700);font-size:11px;font-weight:900}.ai-brief strong{font-size:14px;line-height:1.5}.brief-counts{display:flex;gap:6px}.brief-counts span{padding:6px 8px;border-radius:8px;background:#fff;color:var(--text-muted);font-size:10px;font-weight:900}.brief-counts .must{color:var(--mint-700)}.brief-counts .skip{color:var(--red-600)}.collab-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:22px;align-items:start}.itinerary,.transport-card{padding:25px;border:1px solid var(--border-subtle);border-radius:22px;background:#fff;box-shadow:var(--shadow-sm)}.section-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:22px}.section-head span,.transport-card header>span{color:var(--coral-600);font-size:10px;font-weight:900;letter-spacing:.11em}.section-head h2,.transport-card h2{margin-top:4px;font-size:21px}.section-head small{color:var(--text-muted);font-weight:800}.day-card+ .day-card{margin-top:26px}.day-card>header{display:flex;align-items:center;gap:9px;padding-bottom:12px;border-bottom:1px solid var(--border-subtle)}.day-card>header span{padding:6px 9px;border-radius:8px;background:var(--coral-500);color:#fff;font-size:11px;font-weight:900}.day-card h3{font-size:16px}.schedule-item{display:grid;grid-template-columns:54px 22px minmax(0,1fr);padding-top:15px}.time{padding-top:3px;color:var(--text-muted);font-size:12px;font-weight:800}.route-line{position:relative;display:flex;justify-content:center}.route-line::after{position:absolute;top:16px;bottom:-16px;width:2px;background:var(--mint-100);content:''}.schedule-item:last-child .route-line::after{display:none}.route-line span{position:relative;z-index:1;width:10px;height:10px;margin-top:5px;border:3px solid var(--mint-500);border-radius:50%;background:#fff}.place{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;padding:0 0 16px}.place strong{font-size:15px}.place>div>p{margin-top:3px;color:var(--text-muted);font-size:11px}.place>button{display:inline-flex;align-items:center;gap:4px;height:32px;padding:0 10px;border:1px solid var(--coral-100);border-radius:9px;background:var(--coral-50);color:var(--coral-700);font-size:11px;font-weight:900;cursor:pointer}.comment-preview{grid-column:1/-1;display:grid;gap:6px;margin-top:5px}.comment-preview>div{display:grid;grid-template-columns:auto auto minmax(0,1fr);gap:6px;align-items:center;padding:9px 10px;border-radius:10px;background:var(--gray-50);font-size:11px}.comment-preview span{padding:3px 6px;border-radius:6px;background:#fff;color:var(--text-muted);font-weight:900}.comment-preview span.must{color:var(--mint-700)}.comment-preview span.skip{color:var(--red-600)}.comment-preview p{overflow:hidden;color:var(--text-secondary);text-overflow:ellipsis;white-space:nowrap}.decision-panel{position:sticky;top:20px}.transport-card header p{margin:5px 0 16px;color:var(--text-muted);font-size:12px}.transport-card article{padding:15px;margin-top:10px;border:1px solid var(--border);border-radius:15px}.transport-card article.recommended{border-color:var(--coral-300);background:var(--coral-50)}.transport-title{display:flex;align-items:center;gap:9px}.transport-title>span{display:grid;width:36px;height:36px;place-items:center;border-radius:10px;background:#fff;color:var(--coral-600)}.transport-title>div{display:grid;gap:2px;flex:1}.transport-title small{color:var(--text-muted);font-size:10px}.transport-title b{padding:4px 7px;border-radius:7px;background:var(--coral-500);color:#fff;font-size:9px}.transport-card dl{display:grid;gap:6px;margin:13px 0}.transport-card dl div{display:flex;justify-content:space-between;font-size:11px}.transport-card dt{color:var(--text-muted)}.transport-card dd{font-weight:900}.transport-card article>p{color:var(--text-muted);font-size:10px}.estimate-note{display:block;margin-top:13px;color:var(--text-muted);font-size:10px;line-height:1.5}.state-card{display:grid;min-height:100vh;place-items:center;align-content:center;gap:10px;padding:30px;text-align:center}.state-card p{color:var(--text-secondary)}.modal-backdrop{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:20px;background:rgba(25,20,16,.55)}.comment-modal{position:relative;width:min(470px,100%);padding:28px;border-radius:24px;background:#fff;box-shadow:var(--shadow-xl)}.modal-close{position:absolute;top:18px;right:18px;border:0;background:transparent;color:var(--text-muted);cursor:pointer}.comment-modal h2{margin:6px 0}.comment-modal>p{margin-bottom:20px;color:var(--text-secondary);font-size:13px}.comment-modal label{display:grid;gap:7px;margin-top:15px;font-size:12px;font-weight:900}.comment-modal input,.comment-modal textarea{width:100%;padding:12px;border:1px solid var(--border);border-radius:12px;font:inherit;outline:none}.comment-modal input:focus,.comment-modal textarea:focus{border-color:var(--coral-300);box-shadow:0 0 0 3px var(--coral-50)}.preference-row{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:15px}.preference-row button{height:39px;border:1px solid var(--border);border-radius:10px;background:#fff;color:var(--text-secondary);font-weight:800;cursor:pointer}.preference-row button.active.must{border-color:var(--mint-400);background:var(--mint-50);color:var(--mint-700)}.preference-row button.active.ok{border-color:var(--sky-300);background:var(--sky-50);color:var(--sky-700)}.preference-row button.active.skip{border-color:var(--red-300);background:var(--red-50);color:var(--red-700)}.submit-comment{width:100%;height:46px;margin-top:20px;border:0;border-radius:12px;background:var(--coral-500);color:#fff;font-weight:900;cursor:pointer}.submit-comment:disabled{background:var(--gray-300);cursor:default}.empty-plan{padding:40px;border:1px dashed var(--border);border-radius:15px;color:var(--text-muted);text-align:center}
@media(max-width:850px){.collab-grid{grid-template-columns:1fr}.decision-panel{position:static}.ai-brief{grid-template-columns:auto 1fr}.brief-counts{grid-column:1/-1;flex-wrap:wrap}.trip-hero{padding:28px}.trip-hero>svg,.trip-hero>:last-child{max-width:86px}.decision-panel{order:-1}}@media(max-width:560px){.collab-shell{padding:0 14px 50px}.trip-hero{min-height:190px;padding:24px 20px}.trip-hero>:last-child{display:none}.ai-brief{padding:15px}.itinerary,.transport-card{padding:18px}.schedule-item{grid-template-columns:45px 18px minmax(0,1fr)}.comment-preview>div{grid-template-columns:auto 1fr}.comment-preview p{grid-column:1/-1;white-space:normal}}
</style>
