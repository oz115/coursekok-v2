<script setup>
import { computed, inject, ref, onMounted } from 'vue'
import Mascot from '@/components/brand/Mascot.vue'
import KkIcon from '@/components/icons/KkIcon.vue'
import Avatar from '@/components/data-display/Avatar.vue'
import { useTripLogStore } from '@/stores/triplog.js'
import PageHeader from '@/components/layout/PageHeader.vue'

const auth = inject('auth')
const showToast = inject('showToast', () => {})
const refreshBasket = inject('refreshBasket', () => {})
const tripLogStore = useTripLogStore()
const selectedFilter = ref('전체')
const selectedLog = ref(null)
const commentText = ref('')
const currentPage = ref(0)

const totalPages = computed(() => tripLogStore.totalPages)

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
    authorProfileImage: log.authorProfileImage || log.profileImage || '',
    cover: log.coverImage || log.cover || '',
    likes: log.likeCount ?? log.likes ?? 0,
    saves: log.copyCount ?? log.saves ?? 0,
    comments: log.commentCount ?? log.comments ?? 0,
    style: log.travelStyle || log.style || '',
    date: log.createdAt ? formatDate(log.createdAt) : (log.date || ''),
    ageDays,
    photos: log.photos?.length ? log.photos : [log.coverImage || log.cover].filter(Boolean),
    userImages: log.userImages || [],
    placeImages: log.placeImages || [],
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

const isMyLog = computed(() => {
  if (!auth?.user?.id || !selectedLog.value?.authorId) return false
  return Number(auth.user.id) === Number(selectedLog.value.authorId)
})

const filteredLogs = computed(() => {
  const list = feed.value
  switch (selectedFilter.value) {
    case '당일치기': return list.filter((log) => tripDayCount(log) === 1)
    case '1박 2일':  return list.filter((log) => tripDayCount(log) === 2)
    case '맛집 위주': return list.filter(isFoodTrip)
    default: return list
  }
})

onMounted(async () => {
  tripLogStore.loadFeed('recent')
  if (tripLogStore.pendingLogId) {
    const id = tripLogStore.pendingLogId
    tripLogStore.pendingLogId = null
    await openTripLogById(id)
  }
})

function selectFilter(filter) {
  selectedFilter.value = filter
  currentPage.value = 0
  const apiFilter = API_FILTER_MAP[filter]
  if (apiFilter) tripLogStore.loadFeed(apiFilter, 0)
}

function goToPage(page) {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  const apiFilter = API_FILTER_MAP[selectedFilter.value] ?? 'recent'
  tripLogStore.loadFeed(apiFilter, page)
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
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

async function saveCourse(tripLog, event) {
  event.stopPropagation()
  if (!auth?.isAuthenticated) {
    showToast({ message: '로그인이 필요한 서비스입니다.', tone: 'default' })
    return
  }
  const { bookmarked: nowBookmarked, savedPlaceCount } = await tripLogStore.toggleBookmark(tripLog.id)
  if (selectedLog.value?.id === tripLog.id) {
    selectedLog.value = {
      ...selectedLog.value,
      bookmarked: nowBookmarked,
      saves: selectedLog.value.saves + (nowBookmarked ? 1 : -1),
    }
  }
  if (nowBookmarked && savedPlaceCount > 0) {
    await refreshBasket()
  }
  if (!nowBookmarked) {
    showToast({ tone: 'default', message: '담기를 취소했어요.' })
  } else if (savedPlaceCount > 0) {
    showToast({ tone: 'success', message: `코스를 담고 장소 ${savedPlaceCount}개를 내 장바구니에 추가했어요!` })
  } else {
    showToast({ tone: 'success', message: `"${tripLog.title}" 코스를 담았어요.` })
  }
}

async function toggleMyLogVisibility() {
  if (!selectedLog.value) return
  const next = !selectedLog.value.isPublic
  try {
    await tripLogStore.updateMyLogVisibility(selectedLog.value.id, next)
    selectedLog.value = { ...selectedLog.value, isPublic: next }
    showToast({ tone: 'success', message: next ? 'TripLog에 공개됐어요.' : '나만 보기로 변경했어요.' })
  } catch {
    showToast({ tone: 'default', message: '변경에 실패했어요.' })
  }
}

async function openTripLogById(id) {
  try {
    const detail = await tripLogStore.loadDetail(id)
    const normalized = normalizeTripLog(detail)
    const tripPlan = detail.tripPlan?.length
      ? detail.tripPlan.map((day) => ({
          dayNumber: day.dayNumber,
          tripDate: day.tripDate,
          places: (day.tripPlaces || []).map((tp) => ({
            id: tp.id,
            placeId: tp.place?.id,
            name: tp.place?.title || '',
            category: tp.place?.contentTypeId,
            image: tp.place?.firstImage || '',
            memo: tp.memo || '',
            visitOrder: tp.visitOrder,
            startTime: tp.startTime,
          })),
        }))
      : []
    // tripPlan 있으면 route를 계획 장소 전체에서 추출
    const planRoute = tripPlan.flatMap((d) => d.places.map((p) => p.name)).filter(Boolean)
    selectedLog.value = {
      ...normalized,
      story: detail.content || '',
      route: planRoute.length > 0 ? planRoute : (detail.placeLogs?.map((pl) => pl.placeTitle).filter(Boolean) || normalized.route),
      tripPlan,
    }
    await tripLogStore.loadComments(id)
  } catch {
    // 로드 실패 시 무시
  }
  commentText.value = ''
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
}

async function openTripLog(tripLog) {
  await openTripLogById(tripLog.id)
  if (!selectedLog.value) selectedLog.value = tripLog
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
  // 1순위: 사용자가 직접 첨부한 이미지 (커버 + 장소별 업로드)
  const userPhotos = [
    tripLog.cover,
    ...(tripLog.userImages || []),
    ...(tripLog.memories || []).flatMap((memory) => memory.photos || []),
  ].filter(Boolean)
  const unique = [...new Set(userPhotos)]
  if (unique.length > 0) return unique.slice(0, 3)
  // 2순위: 코스에 담긴 장소 대표 이미지
  const placePhotos = [
    ...(tripLog.placeImages || []),
    ...(tripLog.memories || []).map((memory) => memory.image),
  ].filter(Boolean)
  return [...new Set(placePhotos)].slice(0, 3)
}

function journalPhotoCount(tripLog) {
  return new Set([
    ...(tripLog.photos || []),
    tripLog.cover,
    ...(tripLog.memories || []).flatMap((memory) => memory.photos || []),
  ].filter(Boolean)).size
}

function hasJournalPhotos(tripLog) {
  return journalPhotoCount(tripLog) > 0
}

function onCardImageError(event) {
  event.target.style.opacity = '0'
}

function cardTags(tripLog) {
  return [tripLog.style, tripLog.mood].filter(Boolean)
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
            <div class="detail-heading">
              <div class="detail-kicker">
                <span v-if="selectedLog.region">{{ selectedLog.region }}</span>
                <span v-if="selectedLog.period">{{ selectedLog.period }}</span>
                <span v-if="selectedLog.style">{{ selectedLog.style }}</span>
              </div>
              <h1>{{ selectedLog.title }}</h1>
              <div class="detail-author">
                <Avatar
                  :src="selectedLog.authorProfileImage"
                  :name="selectedLog.author"
                  :size="46"
                  :ring="true"
                />
                <div>
                  <span>{{ selectedLog.author }}</span>
                  <strong>{{ selectedLog.date }} · 여행 기록</strong>
                </div>
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
              <button
                v-if="isMyLog"
                type="button"
                class="detail-vis-toggle"
                :class="selectedLog.isPublic ? 'is-public' : 'is-private'"
                @click="toggleMyLogVisibility"
              >
                {{ selectedLog.isPublic ? '비공개로 전환' : 'TripLog에 공개' }}
              </button>
            </div>
          </header>

          <div class="blog-detail-grid">
            <article class="blog-post">
              <figure v-if="selectedLog.cover" class="detail-main-image">
                <img :src="selectedLog.cover" :alt="selectedLog.title">
              </figure>

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
                    <span v-if="stop.rating" class="blog-place-rating">
                      <KkIcon
                        v-for="n in 5"
                        :key="n"
                        name="star"
                        :size="13"
                        :filled="n <= Math.round(stop.rating)"
                        :color="n <= Math.round(stop.rating) ? '#f59e0b' : '#d1d5db'"
                      />
                    </span>
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
                      @error="e => e.target.style.display = 'none'"
                    >
                  </div>

                  <p v-if="stopNote(stop)">{{ stopNote(stop) }}</p>
                </article>
              </section>
            </article>

            <aside class="course-aside">
              <div class="aside-card">
                <div class="aside-head">
                  <strong>{{ selectedLog.tripPlan?.length ? '여행 계획' : (selectedLog.memories?.length ? '이 여행에 담긴 장소' : '이 후기의 코스') }}</strong>
                  <span>{{ selectedLog.period }}</span>
                </div>

                <!-- tripPlan 있을 때: 일차별 계획 장소 표시 (Issue 3, 4) -->
                <template v-if="selectedLog.tripPlan?.length">
                  <div
                    v-for="day in selectedLog.tripPlan"
                    :key="day.dayNumber"
                    class="aside-day"
                  >
                    <div class="aside-day-label">DAY {{ day.dayNumber }}</div>
                    <ol class="aside-route">
                      <li v-for="(place, idx) in day.places" :key="place.id || idx">
                        <span class="aside-order">{{ place.visitOrder || idx + 1 }}</span>
                        {{ place.name }}
                      </li>
                    </ol>
                  </div>
                </template>

                <!-- tripPlan 없을 때: 기존 route 표시 -->
                <ol v-else class="aside-route">
                  <li v-for="(spot, index) in selectedLog.route" :key="spot">
                    <span v-if="!selectedLog.memories?.length">{{ index + 1 }}</span>
                    <KkIcon v-else name="pin" :size="14" />
                    {{ spot }}
                  </li>
                </ol>

                <button
                  v-if="!isMyLog"
                  type="button"
                  class="aside-save"
                  :class="{ bookmarked: selectedLog.bookmarked }"
                  @click="saveCourse(selectedLog, $event)"
                >
                  <KkIcon name="copy" :size="16" />
                  {{ selectedLog.bookmarked ? '코스 담음' : '코스 담기' }}
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
              <div v-if="detailComments.length === 0" class="comment-empty">
                <Mascot variant="wink" :size="48" />
                <p>아직 댓글이 없어요. 첫 번째로 이 여행에 댓글을 남겨보세요!</p>
              </div>
              <div v-else class="comment-list">
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
      <PageHeader
        eyebrow="TRIPLOG"
        title="여행자들의 트립로그"
        description="실제 여행자의 사진과 후기를 살펴보고, 마음에 드는 코스는 다음 여행에 활용해 보세요."
        tone="community"
      >
        <template #aside>
          <div class="page-log-count">
            <strong>{{ feed.length }}</strong>
            <span>공개된 여행 이야기</span>
          </div>
        </template>
        <template #character>
          <Mascot variant="wink" :size="80" color="#1FBF98" class="page-header-koki" />
        </template>
      </PageHeader>

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
          :class="{ 'trip-card--fallback-image': !hasJournalPhotos(tripLog) }"
          tabindex="0"
          @click="openTripLog(tripLog)"
          @keyup.enter="openTripLog(tripLog)"
        >
          <header class="card-head">
            <div class="author-block">
              <Avatar
                :src="tripLog.authorProfileImage"
                :name="tripLog.author"
                :size="40"
                :ring="true"
              />
              <div>
                <strong>{{ tripLog.author }}님의 여행기</strong>
                <span>{{ tripLog.date }}<template v-if="tripLog.region"> · {{ tripLog.region }}</template><template v-if="tripLog.period"> {{ tripLog.period }}</template></span>
              </div>
            </div>
            <span v-if="tripLog.rating" class="rating-pill">
              <KkIcon name="star" :size="12" />
              {{ tripLog.rating }}
            </span>
          </header>

          <div
            class="photo-panel"
            :class="{
              single: cardPhotos(tripLog).length === 1,
              empty: cardPhotos(tripLog).length === 0,
            }"
          >
            <img
              v-for="(photo, index) in cardPhotos(tripLog)"
              :key="`${tripLog.id}-${index}`"
              :src="photo"
              :alt="`${tripLog.title} 사진 ${index + 1}`"
              @error="onCardImageError"
            >
            <span v-if="cardPhotos(tripLog).length" class="photo-badge">
              <KkIcon name="image" :size="13" />
              <template v-if="journalPhotoCount(tripLog)">여행 기록 · 사진 {{ journalPhotoCount(tripLog) }}장</template>
              <template v-else>여행 장소 이미지</template>
            </span>
          </div>

          <div class="card-body">
            <h2>{{ tripLog.title }}</h2>
            <div v-if="cardTags(tripLog).length" class="card-tags">
              <span v-for="tag in cardTags(tripLog)" :key="tag" class="card-tag">#{{ tag }}</span>
            </div>
            <p v-if="tripLog.excerpt">{{ tripLog.excerpt }}</p>
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

            <button
              type="button"
              class="save-button"
              :class="{ bookmarked: tripLog.bookmarked }"
              @click="saveCourse(tripLog, $event)"
            >
              <KkIcon name="copy" :size="15" />
              {{ tripLog.bookmarked ? '담은 코스' : '코스 담기' }}
            </button>
          </footer>
        </article>
      </div>

      <div v-if="filteredLogs.length === 0" class="empty-state">
        <Mascot variant="wink" :size="80" />
        <p>아직 해당 조건의 TripLog가 없어요.<br>다른 필터를 선택하거나 첫 번째 여행 기록을 남겨보세요!</p>
      </div>

      <!-- 페이지네이션 (Issue 1) — 서버사이드 필터일 때만 표시 -->
      <nav v-if="totalPages > 1 && API_FILTER_MAP[selectedFilter]" class="pagination" aria-label="페이지 탐색">
        <button
          type="button"
          class="page-btn page-btn--arrow"
          :disabled="currentPage === 0"
          @click="goToPage(currentPage - 1)"
        >
          <KkIcon name="chevronL" :size="16" />
        </button>
        <button
          v-for="p in totalPages"
          :key="p - 1"
          type="button"
          class="page-btn"
          :class="{ active: currentPage === p - 1 }"
          @click="goToPage(p - 1)"
        >
          {{ p }}
        </button>
        <button
          type="button"
          class="page-btn page-btn--arrow"
          :disabled="currentPage >= totalPages - 1"
          @click="goToPage(currentPage + 1)"
        >
          <KkIcon name="chevronR" :size="16" />
        </button>
      </nav>
      </template>
    </div>
  </section>
</template>

<style scoped>
.triplog-page {
  min-height: 100%;
  background: var(--bg-base);
  color: var(--text-primary);
}

.triplog-shell {
  width: min(100%, 1190px);
  margin: 0 auto;
  padding: 34px 20px 64px;
}

.page-log-count {
  min-width: 110px;
  padding: 14px 18px;
  border-left: 1px solid var(--border);
  text-align: right;
}

.page-log-count strong,
.page-log-count span {
  display: block;
}

.page-log-count strong {
  color: var(--text-primary);
  font-size: 26px;
  line-height: 1;
}

.page-log-count span {
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
}

.triplog-hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 138px;
  padding: 28px 44px;
  overflow: hidden;
  border-radius: 26px;
  background: var(--bg-base);
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
  background: var(--coral-500);
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 72px 20px;
  color: #8a8178;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  line-height: 1.7;
}

.comment-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.6;
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

.detail-cover--no-image {
  min-height: 220px;
  background: #fff;
  display: flex;
  align-items: flex-end;
}

.detail-cover img {
  width: 100%;
  height: 360px;
  object-fit: cover;
}

.detail-cover-shade {
  position: absolute;
  inset: 0;
  background: rgba(26, 22, 17, 0.36);
}

.detail-title {
  position: absolute;
  left: 34px;
  right: 34px;
  bottom: 30px;
  color: #fff;
}

.detail-title--light {
  position: static;
  padding: 28px 34px;
  color: var(--text-primary);
}

.detail-title--light h1 {
  color: var(--text-primary) !important;
}

.detail-title--light p {
  color: var(--text-secondary) !important;
}

.detail-title--light .detail-author span {
  color: var(--text-primary) !important;
}

.detail-title--light .detail-author strong {
  color: var(--text-muted) !important;
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
  background: #fff;
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

.blog-place-rating {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.blog-place-rating .star-on {
  color: #f59e0b;
}

.blog-place-rating .star-off {
  color: #d1d5db;
}

.blog-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.blog-photo-grid.single {
  grid-template-columns: 1fr;
}

.blog-photo-grid img {
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 16px;
  object-fit: cover;
  display: block;
}

.blog-photo-grid.single img {
  aspect-ratio: 16/9;
  max-height: 420px;
  object-fit: contain;
  background: var(--gray-50);
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
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
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
}

.detail-vis-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 40px;
  margin-left: auto;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}

/* ── 페이지네이션 (Issue 1) ─────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 36px;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 38px;
  padding: 0 6px;
  border: 1px solid #eadfd6;
  border-radius: 10px;
  background: #fff;
  color: #5f5a55;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: border-color 140ms, background 140ms, color 140ms;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--mint-300);
  background: var(--mint-50);
  color: var(--mint-700);
}

.page-btn.active {
  border-color: var(--mint-500);
  background: var(--mint-500);
  color: #fff;
}

.page-btn:disabled {
  opacity: .35;
  cursor: default;
}

.page-btn--arrow {
  min-width: 38px;
}

/* ── aside 일차별 그룹 (Issue 3, 4) ──────────────────────── */
.aside-day {
  margin-bottom: 12px;
}

.aside-day-label {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 9px;
  margin-bottom: 8px;
  border-radius: 999px;
  background: var(--mint-50);
  color: var(--mint-700);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .08em;
}

.aside-order {
  display: grid;
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 50%;
  background: var(--mint-50);
  color: var(--mint-700);
  font-size: 11px;
  font-weight: 900;
}

.detail-vis-toggle.is-private {
  background: var(--mint-50);
  color: var(--mint-700);
}

.detail-vis-toggle.is-public {
  background: var(--gray-100);
  color: var(--text-muted);
}

.aside-vis-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  gap: 7px;
  border: 0;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}

.aside-vis-toggle.is-private {
  background: var(--mint-50);
  color: var(--mint-700);
}

.aside-vis-toggle.is-public {
  background: var(--gray-100);
  color: var(--text-muted);
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

.route-spot--style {
  opacity: 0.75;
  font-weight: 700;
}

.photo-placeholder {
  position: relative;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fff;
  overflow: hidden;
}

.photo-placeholder-region {
  font-size: 26px;
  font-weight: 900;
  color: var(--mint-700);
  opacity: 0.5;
  letter-spacing: -0.02em;
}

.photo-placeholder-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 800;
  color: var(--text-muted);
}

/* 2026 TripLog editorial redesign */
.triplog-page {
  background: #FFFCFA;
}

.triplog-shell {
  width: min(100%, 1180px);
  padding-top: 44px;
}

.triplog-hero {
  min-height: 0;
  padding: 10px 2px 28px;
  overflow: visible;
  border-bottom: 1px solid #dededb;
  border-radius: 0;
  background: transparent;
}

.triplog-hero::after {
  display: none;
}

.hero-copy {
  flex: 1;
}

.hero-badge {
  height: auto;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: var(--coral-600);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .14em;
}

.triplog-hero h1 {
  margin: 12px 0 8px;
  color: #171717;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  letter-spacing: -.035em;
}

.triplog-hero p {
  color: #777;
  font-size: 15px;
  font-weight: 400;
}

.hero-side {
  display: grid;
  align-self: flex-end;
  padding-bottom: 5px;
  text-align: right;
}

.hero-side strong {
  color: #222;
  font-size: 28px;
  font-weight: 600;
}

.hero-side span {
  color: #999;
  font-size: 11px;
}

.filter-row {
  margin: 20px 0 24px;
  gap: 7px;
}

.filter-chip {
  height: 34px;
  padding: 0 13px;
  border-color: #ddd;
  border-radius: 8px;
  color: #666;
  font-size: 12px;
  font-weight: 600;
  box-shadow: none;
}

.filter-chip.active {
  border-color: var(--coral-500);
  background: var(--coral-500);
  color: #fff;
}

.triplog-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.trip-card {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  border-color: #e2e2df;
  border-radius: 14px;
  box-shadow: none;
}

.trip-card:hover,
.trip-card:focus-visible {
  border-color: #c9c9c5;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, .07);
}

.photo-panel {
  order: 0;
  height: 190px;
  background: #ececea;
}

.photo-badge {
  top: auto;
  right: 10px;
  bottom: 10px;
  left: auto;
  height: 24px;
  padding: 0 8px;
  font-size: 10px;
}

.card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 18px 18px 14px;
}

.card-meta-line {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 9px;
  color: #8a8a86;
  font-size: 11px;
  font-weight: 600;
}

.card-meta-line span + span::before {
  margin: 0 7px;
  color: #ccc;
  content: '·';
}

.card-body h2 {
  margin: 0;
  color: #222;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -.02em;
}

.card-body p {
  min-height: 0;
  margin: 9px 0 14px;
  color: #717171;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.65;
}

.route-band {
  min-height: auto;
  margin-top: auto;
  padding: 9px 10px;
  border: 1px solid #ededeb;
  border-radius: 9px;
  background: #fafafa;
  color: #666;
}

.route-spot {
  font-size: 10px;
  font-weight: 600;
}

.card-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.card-author .avatar {
  width: 26px;
  height: 26px;
  border: 0;
  background: #eee;
  box-shadow: none;
  color: #555;
  font-size: 11px;
}

.card-author strong {
  color: #555;
  font-size: 11px;
  font-weight: 600;
}

.card-author .rating-pill {
  height: auto;
  margin-left: auto;
  padding: 0;
  background: transparent;
  font-size: 11px;
}

.trip-card--no-image {
  min-height: 290px;
  border-top: 3px solid var(--coral-400);
}

.trip-card--no-image .card-body {
  padding-top: 22px;
}

.trip-card--no-image .card-body h2 {
  font-size: 22px;
}

.trip-card--no-image .card-body p {
  -webkit-line-clamp: 4;
}

.card-foot {
  padding: 12px 18px 15px;
  border-top: 0;
}

.stats {
  font-size: 11px;
  font-weight: 600;
}

.save-button {
  min-width: auto;
  height: 30px;
  padding: 0 11px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  box-shadow: none;
  color: #555;
  font-size: 11px;
  font-weight: 700;
}

.save-button:hover {
  border-color: var(--coral-400);
  background: var(--coral-50);
  color: var(--coral-700);
}

.save-button.bookmarked {
  border-color: var(--coral-400);
  background: var(--coral-500);
  color: #fff;
  box-shadow: 0 4px 10px rgba(255, 107, 61, 0.22);
}

.detail-save.bookmarked,
.aside-save.bookmarked {
  background: var(--coral-400);
}

.detail-back {
  margin-bottom: 22px;
  color: #777;
  font-size: 13px;
  font-weight: 600;
}

.detail-layout {
  gap: 20px;
}

.detail-hero-card {
  overflow: visible;
  border: 0;
  border-bottom: 1px solid #ddd;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.detail-heading {
  max-width: 830px;
  padding: 4px 0 26px;
}

.detail-kicker {
  display: flex;
  gap: 7px;
  margin-bottom: 15px;
}

.detail-kicker span {
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #777;
  font-size: 10px;
  font-weight: 600;
}

.detail-heading h1 {
  margin: 0 0 22px;
  color: #171717;
  font-size: clamp(30px, 5vw, 48px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -.04em;
}

.detail-author .avatar.large {
  width: 36px;
  height: 36px;
  border: 0;
  background: #e9e9e7;
  box-shadow: none;
  color: #555;
  font-size: 13px;
}

.detail-author span {
  color: #333;
  font-size: 12px;
  font-weight: 700;
}

.detail-author strong {
  color: #999;
  font-size: 11px;
  font-weight: 500;
}

.detail-summary {
  padding: 13px 0;
  border-top: 1px solid #e5e5e2;
}

.detail-summary span,
.detail-reaction {
  color: #777;
  font-size: 12px;
  font-weight: 600;
}

.blog-detail-grid {
  grid-template-columns: minmax(0, 1fr) 270px;
  gap: 26px;
}

.blog-post {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.detail-main-image {
  margin: 0 0 32px;
  overflow: hidden;
  border-radius: 12px;
  background: #eee;
}

.detail-main-image img {
  display: block;
  width: 100%;
  max-height: 560px;
  object-fit: cover;
}

.blog-intro {
  padding: 0 0 30px;
  border-bottom: 1px solid #ddd;
  border-radius: 0;
  background: transparent;
  color: #444;
  font-size: 17px;
  font-weight: 400;
  line-height: 2;
}

.published-story {
  font-size: 17px !important;
  font-weight: 400;
  line-height: 2 !important;
}

.blog-day {
  margin-top: 36px;
  padding-top: 0;
  border-top: 0;
}

.blog-day-head span {
  height: auto;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: var(--coral-600);
  font-size: 10px;
  letter-spacing: .1em;
}

.blog-day-head h2 {
  margin-top: 6px;
  font-size: 24px;
  font-weight: 700;
}

.blog-place-title span {
  color: #999;
  font-weight: 600;
}

.blog-place-title h3 {
  font-size: 20px;
  font-weight: 700;
}

.blog-place p {
  color: #555;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.9;
}

.aside-card,
.detail-section {
  border-color: #e2e2df;
  border-radius: 14px;
  box-shadow: none;
}

.aside-head strong,
.section-head h2 {
  font-weight: 700;
}

.aside-route li {
  color: #666;
  font-size: 12px;
  font-weight: 500;
}

.comment-section {
  padding: 22px;
}

@media (max-width: 720px) {
  .triplog-hero {
    padding: 4px 0 22px;
  }

  .hero-side {
    display: none;
  }

  .triplog-hero h1 {
    font-size: 29px;
  }

  .detail-heading h1 {
    font-size: 32px;
  }

  .blog-detail-grid {
    gap: 18px;
  }
}

/* 코스콕 메인 화면과 톤 통일 */
.triplog-page {
  background: #FFFCFA;
}

.triplog-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 132px;
  padding: 24px 30px;
  border: 1px solid var(--border-subtle);
  border-radius: 22px;
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.triplog-hero .hero-mascot {
  position: relative;
  width: 76px;
  flex: 0 0 76px;
  transform: translateY(7px);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--coral-600);
}

.triplog-hero h1 {
  margin: 8px 0 6px;
  color: var(--text-primary);
  font-size: 29px;
  font-weight: 800;
  letter-spacing: -.02em;
}

.triplog-hero p {
  color: var(--text-secondary);
  font-size: 14px;
}

.hero-side {
  min-width: 116px;
  padding: 14px 17px;
  border: 1px solid var(--mint-100);
  border-radius: 16px;
  background: rgba(255, 255, 255, .82);
  text-align: center;
}

.hero-side strong {
  color: var(--mint-700);
}

.hero-side span {
  color: var(--text-muted);
}

.filter-chip {
  border-color: var(--border);
  background: #fff;
  color: var(--text-secondary);
}

.filter-chip:hover {
  border-color: var(--coral-200);
  background: var(--coral-50);
  color: var(--coral-700);
}

.filter-chip.active {
  border-color: var(--coral-500);
  background: var(--coral-500);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 107, 61, .18);
}

.trip-card {
  border-color: var(--border-subtle);
  background: #fff;
  box-shadow: var(--shadow-xs);
}

.trip-card:hover,
.trip-card:focus-visible {
  border-color: var(--coral-200);
  box-shadow: 0 10px 26px rgba(72, 50, 39, .09);
}

.card-meta-line span:first-child {
  color: var(--coral-600);
  font-weight: 800;
}

.card-body h2 {
  color: var(--text-primary);
}

.card-body p {
  color: var(--text-secondary);
}

.route-band {
  border-color: var(--mint-100);
  background: var(--mint-50);
  color: var(--mint-700);
}

.card-author {
  border-color: var(--border-subtle);
}

.card-author .avatar {
  background: var(--coral-50);
  color: var(--coral-700);
}

.trip-card--no-image {
  border-top-color: var(--coral-400);
  background: #fff;
}

.save-button {
  border-color: var(--coral-200);
  background: var(--coral-50);
  color: var(--coral-700);
}

.detail-hero-card {
  padding: 28px 30px 0;
  border: 1px solid var(--border-subtle);
  border-radius: 22px;
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.detail-heading {
  padding-bottom: 24px;
}

.detail-kicker span {
  border-color: var(--coral-100);
  background: var(--coral-50);
  color: var(--coral-700);
}

.detail-heading h1 {
  color: var(--text-primary);
}

.detail-author .avatar.large {
  background: var(--coral-50);
  color: var(--coral-700);
}

.detail-summary {
  border-color: var(--border-subtle);
}

.blog-detail-grid {
  margin-top: 2px;
}

.blog-post {
  padding: 26px;
  border: 1px solid var(--border-subtle);
  border-radius: 22px;
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.detail-main-image {
  border-radius: 17px;
}

.blog-intro {
  padding: 2px 2px 28px;
  border-color: var(--border-subtle);
  color: var(--text-secondary);
}

.blog-day {
  padding: 0 2px;
}

.blog-day-head span {
  color: var(--coral-600);
}

.blog-day-head h2,
.blog-place-title h3 {
  color: var(--text-primary);
}

.blog-place-title span {
  color: var(--mint-700);
}

.blog-photo-grid img {
  border-radius: 15px;
}

.blog-place p {
  color: var(--text-secondary);
}

.aside-card,
.detail-section {
  border-color: var(--border-subtle);
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.aside-head span {
  color: var(--coral-600);
}

.aside-route li span {
  background: var(--mint-50);
  color: var(--mint-700);
}

.comment-form {
  border-color: var(--coral-100);
  background: var(--coral-50);
}

.comment-item {
  border-color: var(--border-subtle);
  background: #fff;
}

.comment-avatar {
  background: var(--mint-50);
  color: var(--mint-700);
}

@media (max-width: 720px) {
  .triplog-hero {
    padding: 22px 20px;
  }

  .triplog-hero .hero-mascot {
    width: 60px;
    flex-basis: 60px;
  }

  .detail-hero-card {
    padding: 22px 20px 0;
  }

  .blog-post {
    padding: 20px;
  }
}

/* TripLog feed refresh */
.triplog-hero {
  justify-content: space-between;
  min-height: 166px;
  padding: 28px 34px 28px 38px;
  overflow: hidden;
  border-color: #dceee9;
  background-color: #f3fbf9;
  background-image: radial-gradient(circle, rgba(31, 191, 152, .24) 1.5px, transparent 1.5px);
  background-size: 17px 17px;
  box-shadow: 0 10px 30px rgba(44, 87, 77, .08);
}

.triplog-hero::after {
  display: none;
}

.triplog-hero .hero-copy {
  max-width: 610px;
}

.triplog-hero .hero-badge {
  background: var(--mint-100);
  color: var(--mint-700);
}

.triplog-hero h1 {
  margin-top: 9px;
  font-size: clamp(29px, 3vw, 38px);
  letter-spacing: -.035em;
}

.triplog-hero p {
  max-width: 580px;
  color: #47645e;
  line-height: 1.6;
}

.hero-visual {
  position: relative;
  width: 310px;
  height: 116px;
  flex: 0 0 310px;
}

.hero-visual .hero-mascot {
  position: absolute;
  z-index: 4;
  right: 116px;
  bottom: -17px;
  width: 92px;
  filter: drop-shadow(0 8px 9px rgba(96, 65, 44, .14));
  transform: rotate(-4deg);
}

.hero-photo {
  position: absolute;
  overflow: hidden;
  border: 5px solid #fff;
  border-radius: 17px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(37, 72, 64, .17);
}

.hero-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-photo--one {
  top: 2px;
  right: 8px;
  width: 132px;
  height: 90px;
  transform: rotate(5deg);
}

.hero-photo--two {
  top: 28px;
  right: 92px;
  width: 105px;
  height: 76px;
  transform: rotate(-7deg);
}

.hero-count {
  position: absolute;
  z-index: 5;
  right: 0;
  bottom: -8px;
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid rgba(31, 191, 152, .18);
  border-radius: 12px;
  background: rgba(255, 255, 255, .94);
  box-shadow: 0 6px 16px rgba(37, 72, 64, .1);
}

.hero-count strong {
  color: var(--coral-600);
  font-size: 19px;
}

.hero-count span {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 800;
}

.triplog-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.trip-card {
  border-radius: 22px;
  box-shadow: 0 8px 24px rgba(42, 33, 24, .09);
}

.card-head {
  min-height: 72px;
  padding: 13px 16px 12px;
}

.card-head .avatar {
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.photo-panel {
  height: 196px;
}

.photo-panel.empty {
  display: block;
  background: #ffe9dc;
}

.photo-panel img {
  background: #ffe9dc;
}

.card-body {
  padding: 14px 17px 8px;
}

.card-body h2 {
  margin-bottom: 6px;
  font-size: 20px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 8px;
}

.card-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--mint-50);
  color: var(--mint-700);
  font-size: 11px;
  font-weight: 800;
}

.card-body p {
  margin-bottom: 0;
  line-height: 1.6;
}

.card-foot {
  margin: 0 17px;
  padding: 10px 0 13px;
}

@media (max-width: 1060px) {
  .triplog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .hero-visual {
    width: 250px;
    flex-basis: 250px;
    transform: translateX(18px);
  }
}

@media (max-width: 600px) {
  .triplog-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .triplog-hero {
    min-height: auto;
    padding: 25px 22px;
  }

  .hero-visual {
    display: none;
  }

  .photo-panel {
    height: 205px;
  }

  .card-head {
    min-height: 68px;
  }
}
</style>
