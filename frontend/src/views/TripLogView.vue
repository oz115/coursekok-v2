<script setup>
import { computed, inject, ref, onMounted } from 'vue'
import Mascot from '@/components/brand/Mascot.vue'
import KkIcon from '@/components/icons/KkIcon.vue'
import { useTripLogStore } from '@/stores/triplog.js'

const showToast = inject('showToast', () => {})
const tripLogStore = useTripLogStore()
const selectedFilter = ref('전체')
const selectedLog = ref(null)
const commentText = ref('')

const filters = ['전체', '요즘 인기', '최신 기록', '사진 많은', '따라가기 좋은', '당일치기', '1박 2일', '맛집 위주']

const API_FILTER_MAP = {
  '전체': 'recent',
  '요즘 인기': 'popular',
  '최신 기록': 'recent',
  '사진 많은': 'photo',
  '따라가기 좋은': 'route',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return '오늘'
  if (diff < 7) return `${diff}일 전`
  if (diff < 30) return `${Math.floor(diff / 7)}주 전`
  return `${Math.floor(diff / 30)}개월 전`
}

function normalizeTripLog(log) {
  const ageDays = log.createdAt ? Math.floor((Date.now() - new Date(log.createdAt)) / 86400000) : (log.ageDays ?? 0)
  return {
    ...log,
    author: log.authorNickname || log.author || '알 수 없음',
    cover: log.coverImage || log.cover || '',
    likes: log.likeCount ?? log.likes ?? 0,
    saves: log.copyCount ?? log.saves ?? 0,
    comments: log.commentCount ?? log.comments ?? 0,
    style: log.travelStyle || log.style || '',
    date: log.createdAt ? formatDate(log.createdAt) : (log.date || ''),
    ageDays,
    photos: log.photos?.length ? log.photos : [log.coverImage || log.cover].filter(Boolean),
    route: log.route || [],
    excerpt: log.content || log.excerpt || '',
    memories: log.placeLogs?.map((pl) => ({
      key: String(pl.id),
      place: pl.placeTitle,
      title: pl.placeTitle,
      category: pl.placeCategory,
      image: pl.placeImage,
      photos: pl.imageUrl ? [pl.imageUrl] : [],
      memo: pl.reviewContent,
      rating: pl.rating,
    })) || log.memories || [],
  }
}

const feed = computed(() => tripLogStore.feed.map(normalizeTripLog))

const filteredLogs = computed(() => {
  const list = feed.value
  switch (selectedFilter.value) {
    case '당일치기': return list.filter((log) => tripDayCount(log) === 1)
    case '1박 2일':  return list.filter((log) => tripDayCount(log) === 2)
    case '맛집 위주': return list.filter(isFoodTrip)
    default: return list
  }
})

onMounted(() => tripLogStore.loadFeed('recent'))

function selectFilter(filter) {
  selectedFilter.value = filter
  const apiFilter = API_FILTER_MAP[filter]
  if (apiFilter) tripLogStore.loadFeed(apiFilter)
}

const detailStops = computed(() => {
  if (!selectedLog.value) return []
  if (selectedLog.value.memories?.length) return selectedLog.value.memories
  return selectedLog.value.route.map((spot, index) => ({
    place: spot,
    photos: getStopPhotos(selectedLog.value, index),
    memo: getStopNote(selectedLog.value, spot, index),
  }))
})

const detailDays = computed(() => {
  if (!selectedLog.value) return []
  if (selectedLog.value.memories?.length) {
    return [{ day: null, title: '여행의 기록', stops: selectedLog.value.memories }]
  }
  const stops = detailStops.value
  const dayCount = Math.max(1, Math.min(selectedLog.value.days || 1, stops.length || 1))
  const perDay = Math.ceil(stops.length / dayCount)

  return Array.from({ length: dayCount }, (_, dayIndex) => ({
    day: dayIndex + 1,
    title: getDayTitle(selectedLog.value, dayIndex),
    stops: stops.slice(dayIndex * perDay, (dayIndex + 1) * perDay),
  })).filter((day) => day.stops.length)
})

const detailComments = computed(() =>
  tripLogStore.comments.map((c) => ({
    ...c,
    author: c.nickname || c.author || '익명',
    text: c.content || c.text || '',
    time: c.createdAt ? formatDate(c.createdAt) : (c.time || ''),
  }))
)

function tripDayCount(log) {
  if (Number.isFinite(log.days)) return Number(log.days)
  if (log.period === '당일치기') return 1
  const nightMatch = log.period?.match(/(\d+)박/)
  return nightMatch ? Number(nightMatch[1]) + 1 : 0
}

function isFoodTrip(log) {
  const text = [
    log.style,
    log.title,
    log.excerpt,
    ...(log.tags || []),
    ...(log.memories || []).map((memory) => memory.category),
  ].join(' ')
  return /미식|맛집|음식|카페|먹방|식당/.test(text)
}

async function toggleLike(tripLog, event) {
  event.stopPropagation()
  const nowLiked = await tripLogStore.toggleLike(tripLog.id)
  if (selectedLog.value?.id === tripLog.id && nowLiked !== undefined) {
    selectedLog.value = {
      ...selectedLog.value,
      liked: nowLiked,
      likes: selectedLog.value.likes + (nowLiked ? 1 : -1),
    }
  }
}

function saveCourse(tripLog, event) {
  event.stopPropagation()
  tripLog.saves += 1
  showToast({
    tone: 'success',
    message: `"${tripLog.title}" 코스를 담았어요.`,
    icon: 'copy',
  })
}

async function openTripLog(tripLog) {
  try {
    const detail = await tripLogStore.loadDetail(tripLog.id)
    const normalized = normalizeTripLog(detail)
    selectedLog.value = {
      ...normalized,
      story: detail.content || '',
      route: detail.placeLogs?.map((pl) => pl.placeTitle).filter(Boolean) || normalized.route,
    }
    await tripLogStore.loadComments(tripLog.id)
  } catch {
    selectedLog.value = tripLog
  }
  commentText.value = ''
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}

function closeTripLog() {
  selectedLog.value = null
  tripLogStore.comments = []
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}

async function submitComment() {
  const text = commentText.value.trim()
  if (!text || !selectedLog.value) return
  await tripLogStore.addComment(selectedLog.value.id, text)
  if (selectedLog.value) {
    selectedLog.value = { ...selectedLog.value, comments: (selectedLog.value.comments || 0) + 1 }
  }
  commentText.value = ''
}

function cardPhotos(tripLog) {
  return (tripLog.photos?.length ? tripLog.photos : [tripLog.cover]).slice(0, 3)
}

function stopTitle(stop) {
  return stop.place || stop.title
}

function stopPhotos(stop) {
  return stop.photos?.length ? stop.photos : [stop.image].filter(Boolean)
}

function stopNote(stop) {
  return stop.memo || stop.note
}

function getStopPhotos(log, index) {
  const photos = log.photos?.length ? log.photos : [log.cover]
  const primary = photos[index + 1] || photos[index] || log.cover
  const secondary = photos[index + 2] || photos[0] || primary
  return [...new Set([primary, secondary])].slice(0, 2)
}

function getDayTitle(log, dayIndex) {
  const titles = {
    제주: ['바다와 일출', '숲과 로컬', '마무리 산책'],
    부산: ['시장과 로컬 맛집', '해변 근처 먹방'],
    강릉: ['카페거리와 바다멍'],
  }
  return titles[log.region]?.[dayIndex] || `${log.region} 여행 기록`
}

function getStopNote(log, spot, index) {
  const notes = {
    '협재 해변': '햇빛이 강해지기 전 오전에 걸으면 물빛이 가장 선명해요.',
    성산일출봉: '일출 시간보다 30분 정도 먼저 도착하면 여유롭게 올라갈 수 있어요.',
    '사려니 숲길': '긴 코스가 부담되면 입구 근처만 걸어도 충분히 숲 분위기를 느낄 수 있어요.',
    자갈치시장: '점심 피크 전에 가면 좌석 잡기가 훨씬 수월했어요.',
    밀면집: '맵기 조절이 가능해서 여행 동행자 취향을 맞추기 좋았어요.',
    돼지국밥: '저녁 마무리 코스로 든든하고 이동 동선도 짧았어요.',
    안목해변: '바다 앞 카페 자리는 오전에 가장 여유로웠어요.',
    커피거리: '카페마다 분위기가 달라 한 곳만 정하지 말고 천천히 둘러보는 걸 추천해요.',
    경포호: '해 질 무렵 산책하면 바다와는 다른 조용한 분위기가 좋아요.',
  }
  return notes[spot] || `${log.region} 여행에서 기억에 남았던 ${index + 1}번째 코스예요.`
}
</script>

<template>
  <section class="triplog-page">
    <div class="triplog-shell">
      <template v-if="selectedLog">
        <button type="button" class="detail-back" @click="closeTripLog">
          <KkIcon name="chevronL" :size="18" />
          TripLog
        </button>

        <article class="detail-layout">
          <header class="detail-hero-card">
            <div class="detail-cover">
              <img :src="selectedLog.cover" :alt="selectedLog.title">
              <div class="detail-cover-shade" />
              <div class="detail-title">
                <div class="detail-author">
                  <div class="avatar large">{{ selectedLog.author.charAt(0) }}</div>
                  <div>
                    <span>{{ selectedLog.author }}님의 여행기</span>
                    <strong>{{ selectedLog.date }} · {{ selectedLog.region }} · {{ selectedLog.period }}</strong>
                  </div>
                </div>
                <h1>{{ selectedLog.title }}</h1>
                <p>{{ selectedLog.excerpt }}</p>
              </div>
            </div>

            <div class="detail-summary">
              <span v-if="selectedLog.rating"><KkIcon name="star" :size="16" /> {{ selectedLog.rating }}</span>
              <button
                type="button"
                class="detail-reaction"
                :class="{ liked: selectedLog.liked }"
                :aria-label="selectedLog.liked ? '좋아요 취소' : '좋아요'"
                :aria-pressed="selectedLog.liked"
                @click="toggleLike(selectedLog, $event)"
              >
                <KkIcon name="heart" :size="17" />
                {{ selectedLog.likes }}
              </button>
              <span><KkIcon name="message" :size="16" /> {{ selectedLog.comments }}</span>
              <span><KkIcon name="bookmark" :size="16" /> {{ selectedLog.saves }}</span>
              <button type="button" class="detail-save" @click="saveCourse(selectedLog, $event)">
                <KkIcon name="copy" :size="16" />
                이 코스 담기
              </button>
            </div>
          </header>

          <div class="blog-detail-grid">
            <article class="blog-post">
              <div class="blog-intro">
                <p v-if="selectedLog.story" class="published-story">{{ selectedLog.story }}</p>
                <p v-else>
                  {{ selectedLog.author }}님이 직접 다녀온 {{ selectedLog.region }} 여행 후기예요.
                  사진과 장소별 메모를 보면서 코스 분위기를 확인해보세요.
                </p>
              </div>

              <section v-for="day in detailDays" :key="day.day" class="blog-day">
                <header class="blog-day-head">
                  <span v-if="day.day">DAY {{ day.day }}</span>
                  <span v-else>MEMORIES</span>
                  <h2>{{ day.title }}</h2>
                </header>

                <article v-for="stop in day.stops" :key="stop.key || stopTitle(stop)" class="blog-place">
                  <div class="blog-place-title">
                    <span v-if="stop.category">{{ stop.category }}</span>
                    <h3>{{ stopTitle(stop) }}</h3>
                  </div>

                  <div
                    v-if="stopPhotos(stop).length"
                    class="blog-photo-grid"
                    :class="{ single: stopPhotos(stop).length === 1 }"
                  >
                    <img
                      v-for="(photo, photoIndex) in stopPhotos(stop)"
                      :key="`${stopTitle(stop)}-${photoIndex}`"
                      :src="photo"
                      :alt="`${stopTitle(stop)} 여행 사진 ${photoIndex + 1}`"
                    >
                  </div>

                  <h4 v-if="stop.title && stop.place">{{ stop.title }}</h4>
                  <p>{{ stopNote(stop) }}</p>
                </article>
              </section>
            </article>

            <aside class="course-aside">
              <div class="aside-card">
                <div class="aside-head">
                  <strong>{{ selectedLog.memories?.length ? '이 여행에 담긴 장소' : '이 후기의 코스' }}</strong>
                  <span>{{ selectedLog.period }}</span>
                </div>
                <ol class="aside-route">
                  <li v-for="(spot, index) in selectedLog.route" :key="spot">
                    <span v-if="!selectedLog.memories?.length">{{ index + 1 }}</span>
                    <KkIcon v-else name="pin" :size="14" />
                    {{ spot }}
                  </li>
                </ol>
                <button type="button" class="aside-save" @click="saveCourse(selectedLog, $event)">
                  <KkIcon name="copy" :size="16" />
                  내 여행에 담기
                </button>
              </div>
            </aside>

            <section class="detail-section comment-section">
              <div class="section-head">
                <h2>댓글</h2>
                <span>{{ detailComments.length }}</span>
              </div>
              <form class="comment-form" @submit.prevent="submitComment">
                <div class="comment-avatar me">나</div>
                <textarea
                  v-model="commentText"
                  rows="2"
                  placeholder="여행 기록에 댓글을 남겨보세요."
                  aria-label="댓글 작성"
                />
                <button type="submit" :disabled="!commentText.trim()">
                  <KkIcon name="send" :size="16" />
                  등록
                </button>
              </form>
              <div class="comment-list">
                <div v-for="comment in detailComments" :key="comment.id" class="comment-item">
                  <div class="comment-avatar">{{ comment.author.charAt(0) }}</div>
                  <div>
                    <div class="comment-meta">
                      <strong>{{ comment.author }}</strong>
                      <span>{{ comment.time }}</span>
                    </div>
                    <p>{{ comment.text }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </article>
      </template>

      <template v-else>
      <header class="triplog-hero">
        <div class="hero-mascot" aria-hidden="true">
          <Mascot variant="cheer" :size="72" />
        </div>

        <div class="hero-copy">
          <span class="hero-badge">
            <KkIcon name="users" :size="13" />
            TRIPLOG 커뮤니티
          </span>
          <h1>여행자들의 진짜 여행 기록</h1>
          <p>사진과 후기가 담긴 코스를 구경하고, 마음에 들면 그대로 담아오세요</p>
        </div>
      </header>

      <nav class="filter-row" aria-label="TripLog 필터">
        <button
          v-for="filter in filters"
          :key="filter"
          type="button"
          class="filter-chip"
          :class="{ active: selectedFilter === filter }"
          @click="selectFilter(filter)"
        >
          <KkIcon
            v-if="filter !== '전체'"
            :name="{
              '요즘 인기': 'sparkles',
              '최신 기록': 'clock',
              '사진 많은': 'image',
              '따라가기 좋은': 'route',
              '당일치기': 'sun',
              '1박 2일': 'calendar',
              '맛집 위주': 'utensils',
            }[filter]"
            :size="15"
          />
          {{ filter }}
        </button>
      </nav>

      <div class="triplog-grid">
        <article
          v-for="tripLog in filteredLogs"
          :key="tripLog.id"
          class="trip-card"
          tabindex="0"
          @click="openTripLog(tripLog)"
          @keyup.enter="openTripLog(tripLog)"
        >
          <div class="card-head">
            <div class="author-block">
              <div class="avatar">{{ tripLog.author.charAt(0) }}</div>
              <div>
                <strong>{{ tripLog.author }}님의 여행기</strong>
                <span>{{ tripLog.date }} · {{ tripLog.region }} · {{ tripLog.period }}</span>
              </div>
            </div>

            <span v-if="tripLog.rating" class="rating-pill">
              <KkIcon name="star" :size="13" />
              {{ tripLog.rating }}
            </span>
          </div>

          <div class="photo-panel" :class="{ single: cardPhotos(tripLog).length === 1 }">
            <img
              v-for="(photo, index) in cardPhotos(tripLog)"
              :key="`${tripLog.id}-${index}`"
              :src="photo"
              :alt="`${tripLog.title} 사진 ${index + 1}`"
            >
            <span class="photo-badge">
              <KkIcon name="image" :size="13" />
              여행 기록 · 사진 {{ tripLog.photos?.length || 1 }}장
            </span>
          </div>

          <div class="card-body">
            <h2>{{ tripLog.title }}</h2>
            <p>{{ tripLog.excerpt }}</p>

            <div class="route-band" :class="{ memories: tripLog.memories?.length }">
              <template v-for="(spot, index) in tripLog.route.slice(0, 3)" :key="spot">
                <span class="route-spot">
                  <KkIcon name="route" :size="14" />
                  {{ spot }}
                </span>
                <KkIcon
                  v-if="!tripLog.memories?.length && index < tripLog.route.slice(0, 3).length - 1"
                  name="chevronR"
                  :size="13"
                  class="route-arrow"
                />
              </template>
            </div>
          </div>

          <footer class="card-foot">
            <div class="stats">
              <button
                type="button"
                class="stat-button"
                :class="{ liked: tripLog.liked }"
                @click="toggleLike(tripLog, $event)"
              >
                <KkIcon name="heart" :size="17" />
                {{ tripLog.likes }}
              </button>
              <span><KkIcon name="message" :size="16" /> {{ tripLog.comments }}</span>
              <span><KkIcon name="bookmark" :size="16" /> {{ tripLog.saves }}</span>
            </div>

            <button type="button" class="save-button" @click="saveCourse(tripLog, $event)">
              <KkIcon name="copy" :size="15" />
              코스 담기
            </button>
          </footer>
        </article>
      </div>

      <div v-if="filteredLogs.length === 0" class="empty-state">
        <KkIcon name="message" :size="28" />
        <p>아직 해당 조건의 TripLog가 없어요.</p>
      </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.triplog-page {
  min-height: 100%;
  background: #FFFCFA;
  color: var(--text-primary);
}

.triplog-shell {
  width: min(100%, 1190px);
  margin: 0 auto;
  padding: 34px 20px 64px;
}

.triplog-hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 138px;
  padding: 28px 44px;
  overflow: hidden;
  border-radius: 26px;
  background:
    radial-gradient(circle, rgba(31, 191, 152, 0.2) 2px, transparent 2.2px) 0 0 / 18px 18px,
    linear-gradient(135deg, #d8f6f5 0%, #d9eefc 100%);
}

.triplog-hero::after {
  content: '';
  position: absolute;
  inset: auto 36px 18px auto;
  width: 210px;
  height: 54px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.34);
  filter: blur(18px);
}

.hero-mascot {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 82px;
  transform: translateY(8px);
}

.hero-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(31, 191, 152, 0.16);
  color: #16866f;
  font-size: 12px;
  font-weight: 800;
}

.triplog-hero h1 {
  margin: 10px 0 7px;
  font-size: 28px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: 0;
}

.triplog-hero p {
  margin: 0;
  color: #52706f;
  font-size: 15px;
  font-weight: 600;
}

.filter-row {
  display: flex;
  gap: 10px;
  margin: 22px 0 18px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-row::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  padding: 0 18px;
  border: 1px solid #eadfd6;
  border-radius: 999px;
  background: #fff;
  color: #5f5a55;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(33, 25, 18, 0.04);
  transition: border-color 160ms ease, color 160ms ease, background 160ms ease;
}

.filter-chip.active {
  border-color: var(--mint-300);
  background: var(--mint-50);
  color: var(--mint-700);
}

.triplog-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  align-items: start;
}

.trip-card {
  overflow: hidden;
  border: 1px solid #eee5dd;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(42, 33, 24, 0.1);
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.trip-card:hover,
.trip-card:focus-visible {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(42, 33, 24, 0.14);
  outline: none;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 62px;
  padding: 12px 15px 10px;
}

.author-block {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 10px;
}

.avatar {
  display: grid;
  flex: 0 0 auto;
  width: 43px;
  height: 43px;
  place-items: center;
  border: 3px solid #fff0e8;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--coral-500), #ff8b68);
  color: #fff;
  font-size: 19px;
  font-weight: 900;
  box-shadow: 0 0 0 2px var(--coral-500);
}

.author-block strong,
.author-block span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.author-block strong {
  color: #2b2520;
  font-size: 14px;
  font-weight: 900;
}

.author-block span {
  margin-top: 2px;
  color: #8a8178;
  font-size: 12px;
  font-weight: 700;
}

.rating-pill {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 4px;
  height: 27px;
  padding: 0 10px;
  border-radius: 999px;
  background: #fff7e8;
  color: #e79416;
  font-size: 13px;
  font-weight: 900;
}

.photo-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  grid-template-rows: 1fr 1fr;
  height: 190px;
  overflow: hidden;
  background: #efe8df;
}

.photo-panel.single {
  display: block;
}

.photo-panel img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-panel:not(.single) img:first-of-type {
  grid-row: 1 / 3;
}

.photo-panel:not(.single) img:nth-of-type(2),
.photo-panel:not(.single) img:nth-of-type(3) {
  border-left: 2px solid #fff;
}

.photo-panel:not(.single) img:nth-of-type(3) {
  border-top: 2px solid #fff;
}

.photo-badge {
  position: absolute;
  top: 13px;
  left: 13px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 27px;
  padding: 0 11px;
  border-radius: 999px;
  background: rgba(40, 48, 45, 0.72);
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  backdrop-filter: blur(8px);
}

.card-body {
  padding: 17px 15px 12px;
}

.card-body h2 {
  margin: 0 0 7px;
  color: #211b16;
  font-size: 18px;
  line-height: 1.25;
  font-weight: 900;
  letter-spacing: 0;
}

.card-body p {
  display: -webkit-box;
  min-height: 40px;
  margin: 0 0 14px;
  overflow: hidden;
  color: #706960;
  font-size: 14px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.route-band {
  display: flex;
  align-items: center;
  min-height: 40px;
  gap: 5px;
  padding: 0 13px;
  overflow: hidden;
  border-radius: 13px;
  background: #f6faf8;
  color: var(--mint-700);
}

.route-spot {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 5px;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.route-arrow {
  flex: 0 0 auto;
  color: #f09a80;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 15px 15px;
  border-top: 1px solid #f0e8e1;
}

.stats {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 13px;
  color: #8a8178;
  font-size: 13px;
  font-weight: 800;
}

.stats span,
.stat-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: inherit;
}

.stat-button {
  border: 0;
  background: transparent;
  padding: 0;
  font: inherit;
  cursor: pointer;
}

.stat-button.liked {
  color: var(--coral-500);
}

.stat-button.liked svg,
.detail-reaction.liked svg {
  fill: currentColor;
}

.save-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  gap: 6px;
  min-width: 104px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: var(--coral-500);
  color: #fff;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(255, 107, 61, 0.28);
}

.save-button:hover {
  background: var(--coral-600);
}

.empty-state {
  display: grid;
  place-items: center;
  gap: 10px;
  padding: 72px 20px;
  color: #8a8178;
  font-weight: 800;
}

.detail-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  margin-bottom: 18px;
  border: 0;
  background: transparent;
  color: #706960;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
}

.detail-layout {
  display: grid;
  gap: 22px;
}

.detail-hero-card,
.detail-section {
  overflow: hidden;
  border: 1px solid #eee5dd;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(42, 33, 24, 0.08);
}

.detail-cover {
  position: relative;
  min-height: 360px;
  overflow: hidden;
}

.detail-cover img {
  width: 100%;
  height: 360px;
  object-fit: cover;
}

.detail-cover-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(26, 22, 17, 0.76) 0%, rgba(26, 22, 17, 0.22) 58%, transparent 100%);
}

.detail-title {
  position: absolute;
  left: 34px;
  right: 34px;
  bottom: 30px;
  color: #fff;
}

.detail-title h1 {
  max-width: 760px;
  margin: 16px 0 8px;
  color: #fff;
  font-size: 34px;
  line-height: 1.18;
  font-weight: 900;
  letter-spacing: 0;
}

.detail-title p {
  max-width: 720px;
  color: rgba(255, 255, 255, 0.86);
  font-size: 16px;
  font-weight: 700;
}

.detail-author {
  display: flex;
  align-items: center;
  gap: 13px;
}

.avatar.large {
  width: 52px;
  height: 52px;
  font-size: 22px;
}

.detail-author span,
.detail-author strong {
  display: block;
}

.detail-author span {
  font-size: 14px;
  font-weight: 900;
}

.detail-author strong {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  font-weight: 800;
}

.detail-summary {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 20px;
}

.detail-summary span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #7a7168;
  font-size: 14px;
  font-weight: 900;
}

.detail-reaction {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #7a7168;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}

.detail-reaction.liked {
  color: var(--coral-500);
}

.detail-save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 40px;
  margin-left: auto;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: var(--coral-500);
  color: #fff;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(255, 107, 61, 0.28);
}

.blog-detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 22px;
  align-items: start;
}

.blog-post,
.detail-section {
  padding: 22px;
}

.blog-post,
.course-aside,
.comment-section {
  min-width: 0;
}

.blog-post {
  border: 1px solid #eee5dd;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(42, 33, 24, 0.08);
}

.comment-section {
  grid-column: 1 / -1;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.section-head h2 {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0;
}

.section-head span {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--mint-50);
  color: var(--mint-700);
  font-size: 12px;
  font-weight: 900;
}

.blog-intro {
  padding: 20px 22px;
  border-radius: 18px;
  background: linear-gradient(120deg, #f6faf8, #eef8f6);
  color: #514940;
  font-size: 16px;
  line-height: 1.75;
  font-weight: 700;
}

.blog-day {
  margin-top: 34px;
  padding-top: 28px;
  border-top: 1px solid #f0e8e1;
}

.blog-day-head {
  margin-bottom: 22px;
}

.blog-day-head span {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 11px;
  border-radius: 999px;
  background: var(--mint-50);
  color: var(--mint-700);
  font-size: 12px;
  font-weight: 900;
}

.blog-day-head h2 {
  margin-top: 10px;
  color: #211b16;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0;
}

.blog-place + .blog-place {
  margin-top: 34px;
}

.blog-place-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 13px;
}

.blog-place-title span {
  color: var(--mint-700);
  font-size: 13px;
  font-weight: 900;
}

.blog-place-title h3 {
  color: #211b16;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0;
}

.blog-photo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.blog-photo-grid.single {
  grid-template-columns: 1fr;
}

.blog-photo-grid img {
  width: 100%;
  height: 240px;
  border-radius: 16px;
  object-fit: cover;
}

.blog-place p {
  color: #4f4740;
  font-size: 16px;
  line-height: 1.8;
  font-weight: 600;
}

.course-aside {
  position: sticky;
  top: 90px;
}

.aside-card {
  padding: 18px;
  border: 1px solid #eee5dd;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(42, 33, 24, 0.08);
}

.aside-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.aside-head strong {
  font-size: 17px;
  font-weight: 900;
}

.aside-head span {
  color: var(--mint-700);
  font-size: 12px;
  font-weight: 900;
}

.aside-route {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0 0 16px;
  list-style: none;
}

.aside-route li {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #514940;
  font-size: 14px;
  font-weight: 800;
}

.aside-route li span {
  display: grid;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 50%;
  background: var(--mint-50);
  color: var(--mint-700);
  font-size: 12px;
  font-weight: 900;
}

.aside-save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  gap: 7px;
  border: 0;
  border-radius: 999px;
  background: var(--coral-500);
  color: #fff;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(255, 107, 61, 0.28);
}

.comment-list {
  display: grid;
  gap: 12px;
}

.comment-form {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 14px;
  margin-bottom: 16px;
  border: 1px solid var(--coral-100);
  border-radius: 16px;
  background: var(--coral-50);
}

.comment-form textarea {
  width: 100%;
  min-height: 46px;
  padding: 11px 13px;
  resize: vertical;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  color: var(--text-primary);
  font: inherit;
  line-height: 1.5;
  outline: none;
}

.comment-form textarea:focus {
  border-color: var(--coral-300);
  box-shadow: 0 0 0 3px rgba(255, 107, 61, 0.1);
}

.comment-form button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 40px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: var(--coral-500);
  color: #fff;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

.comment-form button:disabled {
  background: var(--gray-300);
  cursor: default;
}

.comment-avatar.me {
  background: var(--coral-100);
  color: var(--coral-700);
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  border: 1px solid #f0e8e1;
  border-radius: 16px;
  background: #fafafa;
}

.comment-avatar {
  display: grid;
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 50%;
  background: var(--mint-50);
  color: var(--mint-700);
  font-weight: 900;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.comment-meta strong {
  font-size: 14px;
  font-weight: 900;
}

.comment-meta span {
  color: #958b82;
  font-size: 12px;
  font-weight: 800;
}

.comment-item p {
  color: #5f574f;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 1060px) {
  .triplog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .blog-detail-grid {
    grid-template-columns: 1fr;
  }

  .course-aside {
    position: static;
  }
}

@media (max-width: 720px) {
  .triplog-shell {
    padding: 22px 16px 48px;
  }

  .triplog-hero {
    align-items: flex-start;
    padding: 24px;
  }

  .hero-mascot {
    width: 66px;
    transform: translate(-4px, 14px);
  }

  .triplog-hero h1 {
    font-size: 24px;
  }

  .triplog-hero p {
    font-size: 14px;
  }

  .triplog-grid {
    grid-template-columns: 1fr;
  }

  .detail-cover,
  .detail-cover img {
    height: 320px;
    min-height: 320px;
  }

  .detail-title {
    left: 22px;
    right: 22px;
    bottom: 24px;
  }

  .detail-title h1 {
    font-size: 27px;
  }

  .detail-summary {
    flex-wrap: wrap;
  }

  .detail-save {
    width: 100%;
    margin-left: 0;
  }

  .comment-form {
    grid-template-columns: 38px minmax(0, 1fr);
  }

  .comment-form button {
    grid-column: 2;
    justify-self: end;
  }

  .blog-photo-grid {
    grid-template-columns: 1fr 1fr;
  }

  .blog-photo-grid img {
    height: 170px;
  }
}

@media (max-width: 460px) {
  .triplog-hero {
    display: block;
  }

  .hero-mascot {
    margin-bottom: -10px;
  }

  .card-foot {
    align-items: flex-start;
    flex-direction: column;
  }

  .save-button {
    width: 100%;
  }

  .blog-photo-grid {
    grid-template-columns: 1fr;
  }

  .blog-photo-grid img {
    height: 210px;
  }
}

.published-story {
  white-space: pre-line;
  font-size: 16px !important;
  line-height: 1.9 !important;
}

.blog-place h4 {
  margin: 4px 0 9px;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 900;
}

.route-band.memories {
  flex-wrap: wrap;
  padding-top: 9px;
  padding-bottom: 9px;
}

.route-band.memories .route-spot {
  padding: 5px 8px;
  border-radius: 999px;
  background: #fff;
}
</style>
