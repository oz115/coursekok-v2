<script setup>
import { computed, inject, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTripsStore } from '@/stores/trips.js'
import { useTripLogStore } from '@/stores/triplog.js'
import { createTripShare } from '@/api/tripCollaboration.js'
import Badge from '@/components/core/Badge.vue'
import Button from '@/components/core/Button.vue'
import KkIcon from '@/components/icons/KkIcon.vue'
import Rating from '@/components/data-display/Rating.vue'
import Switch from '@/components/forms/Switch.vue'
import Mascot from '@/components/brand/Mascot.vue'

const navigate = inject('navigate', () => {})
const showToast = inject('showToast', () => {})

const tripsStore = useTripsStore()
const tripLogStore = useTripLogStore()
const router = useRouter()
const sharingTripId = ref(null)

onMounted(() => tripsStore.fetchTrips())

const trips = computed(() => tripsStore.trips)
const selectedTrip = ref(null)
const reviewByPlace = ref({})
const excludedPlaces = ref(new Set())
const addedPlaces = ref([])
const editingPlace = ref(null)
const publishOpen = ref(false)
const newPlaceName = ref('')
const diaryTitle = ref('')
const diaryStory = ref('')
const diaryMood = ref('행복했어요')
const visibility = ref('private')
const isPublic = computed({
  get: () => visibility.value === 'public',
  set: (value) => { visibility.value = value ? 'public' : 'private' },
})

const tripDays = computed(() => selectedTrip.value?.plan?.days ?? [])
const allStops = computed(() => {
  const planned = tripDays.value.flatMap((day, dayIndex) =>
    day.items.map((item, itemIndex) => ({
      ...item,
      key: `planned-${dayIndex}-${itemIndex}`,
      planned: true,
    })),
  )
  return [...planned, ...addedPlaces.value]
})
const activeStops = computed(() => allStops.value.filter((stop) => !excludedPlaces.value.has(stop.key)))
const reviewCount = computed(() => activeStops.value.filter((stop) => {
  const review = reviewByPlace.value[stop.key]
  return review?.memo?.trim() || review?.rating || review?.photos?.length
}).length)
const photoCount = computed(() =>
  activeStops.value.reduce(
    (count, stop) => count + (reviewByPlace.value[stop.key]?.photos?.length || 0),
    0,
  ),
)
const writingProgress = computed(() => {
  const steps = [
    Boolean(diaryTitle.value.trim()),
    Boolean(diaryStory.value.trim()),
    reviewCount.value > 0,
  ]
  return Math.round((steps.filter(Boolean).length / steps.length) * 100)
})

function hasMemory(stop) {
  const memory = reviewByPlace.value[stop.key]
  return Boolean(memory?.memo?.trim() || memory?.rating || memory?.photos?.length)
}

async function openCollaboration(trip) {
  sharingTripId.value = trip.id
  try {
    const shared = await createTripShare(trip.id)
    await router.push({ name: 'trip-collaboration', params: { token: shared.token } })
  } catch {
    showToast({ tone: 'default', message: '공유 여행방을 만들지 못했어요. 다시 시도해주세요.' })
  } finally {
    sharingTripId.value = null
  }
}

async function openTrip(trip) {
  try {
    const detail = await tripsStore.getTripDetail(trip.id)
    selectedTrip.value = { ...detail, cover: detail.coverImage, visibility: detail.isPublic ? 'public' : 'private' }
  } catch {
    selectedTrip.value = { ...trip, cover: trip.coverImage }
  }
  reviewByPlace.value = {}
  excludedPlaces.value = new Set()
  addedPlaces.value = []
  editingPlace.value = null
  diaryTitle.value = ''
  diaryStory.value = ''
  diaryMood.value = '행복했어요'
  visibility.value = selectedTrip.value.visibility || 'private'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function backToList() {
  selectedTrip.value = null
  editingPlace.value = null
}

function openReview(stop) {
  editingPlace.value = stop
  if (!reviewByPlace.value[stop.key]) {
    reviewByPlace.value = {
      ...reviewByPlace.value,
      [stop.key]: {
        rating: 0,
        memo: '',
        photos: [],
        mood: '기억에 남아요',
      },
    }
  }
}

function saveReview() {
  editingPlace.value = null
  showToast({ tone: 'success', message: '이 장소의 추억을 일기장에 담았어요.' })
}

function toggleExcluded(stop) {
  const next = new Set(excludedPlaces.value)
  if (next.has(stop.key)) next.delete(stop.key)
  else next.add(stop.key)
  excludedPlaces.value = next
}

function addUnplannedByName() {
  const name = newPlaceName.value.trim()
  if (!name) return
  if (allStops.value.some((stop) => stop.title === name)) {
    showToast({ tone: 'default', message: '이미 추가된 장소예요.' })
    return
  }
  const stop = {
    title: name,
    key: `added-custom-${Date.now()}`,
    planned: false,
    img: '',
    cat: '방문 장소',
  }
  addedPlaces.value = [...addedPlaces.value, stop]
  newPlaceName.value = ''
  openReview(stop)
}

function onPhotoInput(event) {
  const files = Array.from(event.target.files || []).slice(0, 4)
  const key = editingPlace.value.key
  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      const current = reviewByPlace.value[key]
      reviewByPlace.value = {
        ...reviewByPlace.value,
        [key]: { ...current, photos: [...current.photos, loadEvent.target.result].slice(0, 4) },
      }
    }
    reader.readAsDataURL(file)
  })
  event.target.value = ''
}

function removePhoto(index) {
  const key = editingPlace.value.key
  const current = reviewByPlace.value[key]
  reviewByPlace.value = {
    ...reviewByPlace.value,
    [key]: { ...current, photos: current.photos.filter((_, photoIndex) => photoIndex !== index) },
  }
}

function dayNumberFromKey(key) {
  const match = key?.match(/^planned-(\d+)-/)
  return match ? Number(match[1]) + 1 : 1
}

function buildTripLogPayload(isPublic) {
  const placeLogs = activeStops.value
    .filter((stop) => hasMemory(stop))
    .map((stop, visitIdx) => {
      const review = reviewByPlace.value[stop.key]
      return {
        placeTitle: stop.title,
        placeCategory: stop.cat,
        placeImage: stop.img,
        reviewContent: review?.memo || '',
        imageUrl: review?.photos?.[0] || '',
        rating: review?.rating || null,
        visitOrder: visitIdx + 1,
        dayNumber: dayNumberFromKey(stop.key),
      }
    })
  const photos = activeStops.value
    .filter((stop) => hasMemory(stop))
    .flatMap((stop) => reviewByPlace.value[stop.key]?.photos || [])
  // Data URL은 VARCHAR(2048) 초과로 DB 오류 발생 → 일반 URL만 허용
  const rawCover = photos[0] || selectedTrip.value.cover || selectedTrip.value.coverImage || ''
  const safeCover = rawCover.startsWith('data:') ? '' : rawCover
  return {
    tripId: typeof selectedTrip.value.id === 'number' ? selectedTrip.value.id : null,
    title: diaryTitle.value.trim() || selectedTrip.value.title,
    content: diaryStory.value.trim() || `${diaryMood.value}. 오래 기억하고 싶은 여행 이야기예요.`,
    region: selectedTrip.value.region || '제주',
    travelStyle: selectedTrip.value.style || diaryMood.value,
    mood: diaryMood.value,
    coverImage: safeCover,
    isPublic,
    placeLogs,
  }
}

async function publishTripLog() {
  try {
    const created = await tripLogStore.publish(buildTripLogPayload(true))
    if (created?.id) tripLogStore.pendingLogId = created.id
    publishOpen.value = false
    showToast({ tone: 'success', message: '여행 기록이 TripLog에 공개됐어요.' })
    navigate('triplog')
  } catch {
    showToast({ tone: 'default', message: '발행에 실패했어요. 다시 시도해주세요.' })
  }
}

async function saveDiary() {
  try {
    await tripLogStore.publish(buildTripLogPayload(false))
    showToast({ tone: 'success', message: '나만의 여행 일기로 저장했어요.' })
  } catch {
    showToast({ tone: 'default', message: '저장에 실패했어요. 다시 시도해주세요.' })
  }
}
</script>

<template>
  <section class="my-trips">
    <div class="shell">
      <template v-if="!selectedTrip">
        <header class="hero">
          <div>
            <span class="eyebrow">MY TRIP</span>
            <h2>내 여행</h2>
            <p>계획한 일정 위에 사진과 이야기를 더해 나만의 여행 일기를 만들어보세요.</p>
          </div>
          <Badge tone="mint">여행 일기</Badge>
        </header>

        <div v-if="tripsStore.loading" class="loading-state">
          <div class="loading-card" v-for="n in 3" :key="n" />
        </div>

        <div v-else-if="trips.length === 0" class="empty-state">
          <Mascot variant="wink" :size="110" :pop="true" />
          <div class="empty-copy">
            <h3>여행 일정이 없으시네요!</h3>
            <p>AI 플래너를 활용해서 나만의 여행을 만들거나<br>더 다양한 여행을 계획해보세요.</p>
          </div>
          <div class="popular-row">
            <span class="popular-label"><KkIcon name="pin" :size="13" /> 인기 여행지</span>
            <div class="popular-chips">
              <button
                v-for="dest in ['제주', '부산', '경주', '강릉', '여수', '전주']"
                :key="dest"
                type="button"
                @click="navigate('planner')"
              >{{ dest }}</button>
            </div>
          </div>
          <Button variant="primary" size="lg" @click="navigate('planner')">AI 플래너로 여행 만들기</Button>
        </div>

        <div v-else class="trip-list" >
          <article v-for="trip in trips" :key="trip.id" class="trip-card" @click="openTrip(trip)">
            <div class="trip-card-body">
              <div class="badges">
                <Badge tone="coral">{{ trip.region || '제주' }}</Badge>
                <Badge tone="neutral">{{ trip.period || '2박 3일' }}</Badge>
                <Badge v-if="trip.style" tone="mint">{{ trip.style }}</Badge>
              </div>
              <h2>{{ trip.title }}</h2>
              <div class="card-meta">
                <span><KkIcon name="calendar" :size="15" /> {{ trip.plan?.days?.length || trip.days || '-' }}일</span>
                <span v-if="trip.places"><KkIcon name="pin" :size="15" /> {{ trip.places }}곳</span>
              </div>
            </div>
            <div class="card-action">
              <button type="button" :disabled="sharingTripId === trip.id" @click.stop="openCollaboration(trip)">
                <KkIcon name="users" :size="15" />
                {{ sharingTripId === trip.id ? '여는 중' : '친구와 같이 짜기' }}
              </button>
              <span>여행 기록하기</span><KkIcon name="chevronR" :size="20" />
            </div>
          </article>

          <div class="plan-more-card" role="button" tabindex="0" @click="navigate('planner')" @keydown.enter="navigate('planner')">
            <Mascot variant="cheer" :size="64" />
            <div class="plan-more-copy">
              <strong>더 다양한 여행을 계획해보세요!</strong>
              <p>AI 플래너로 새 여행 일정을 뚝딱 만들 수 있어요.</p>
            </div>
            <span class="plan-more-cta">일정 만들기 <KkIcon name="chevronR" :size="16" /></span>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="editor-topbar">
          <button class="back" type="button" @click="backToList">
            <KkIcon name="chevronL" :size="18" /> 내 여행
          </button>
          <div class="editor-state">
            <span class="autosave-dot" />
            작성 중인 여행 일기
          </div>
        </div>

        <header class="trip-hero" :class="{ 'no-cover': !selectedTrip.cover }">
          <img v-if="selectedTrip.cover" :src="selectedTrip.cover" :alt="selectedTrip.title">
          <div v-if="selectedTrip.cover" class="trip-shade" />
          <div class="trip-title">
            <span>{{ selectedTrip.region || '여행' }} · {{ selectedTrip.period || '2박 3일' }}</span>
            <h1>{{ selectedTrip.title }}</h1>
            <p>사진과 이야기를 더해 나만의 여행 기록을 완성해보세요.</p>
          </div>
        </header>

        <div class="workspace">
          <main class="journal-canvas">
            <section class="diary-editor">
              <div class="diary-heading">
                <span><KkIcon name="pencil" :size="16" /> 나의 여행 이야기</span>
                <p>완벽한 글보다 그날의 온도와 기분을 편하게 남겨보세요.</p>
              </div>
              <input
                v-model="diaryTitle"
                class="diary-title-input"
                placeholder="이 여행을 한 문장으로 기억한다면?"
              >
              <div class="mood-row">
                <button
                  v-for="mood in ['행복했어요', '설렜어요', '편안했어요', '잊지 못해요']"
                  :key="mood"
                  type="button"
                  :class="{ active: diaryMood === mood }"
                  @click="diaryMood = mood"
                >{{ mood }}</button>
              </div>
              <textarea
                v-model="diaryStory"
                rows="10"
                placeholder="여행을 떠나게 된 이유부터 기억나는 장면, 함께 나눈 대화까지 자유롭게 적어보세요.&#10;&#10;예) 계획 없이 걷다가 만난 작은 골목이 이번 여행에서 가장 오래 기억에 남았다."
              />
              <div class="writing-hint">
                <KkIcon name="sparkles" :size="15" />
                날짜 순서대로 쓰지 않아도 괜찮아요. 가장 선명한 장면부터 시작해보세요.
              </div>
            </section>

            <section class="saved-course">
              <div class="section-title">
                <div><span>TRAVEL ROUTE</span><h2>이번 여행의 발자국</h2></div>
                <Badge tone="neutral">{{ allStops.filter((item) => item.planned).length }}곳</Badge>
              </div>
              <div class="course-places">
                <span v-for="stop in allStops.filter((item) => item.planned)" :key="stop.key">
                  <KkIcon name="pin" :size="13" /> {{ stop.title }}
                </span>
              </div>
            </section>

            <section class="memory-section">
              <header>
                <div>
                  <span>SCENES FROM THE TRIP</span>
                  <h2>장소마다 남은 장면</h2>
                  <p>사진 한 장과 짧은 문장만으로도 충분한 여행 기록이 돼요.</p>
                </div>
                <Badge tone="coral">{{ reviewCount }}/{{ activeStops.length }} 기록</Badge>
              </header>
              <article
                v-for="stop in allStops"
                :key="stop.key"
                class="memory-card"
                :class="{ excluded: excludedPlaces.has(stop.key) }"
              >
                <div class="memory-visual">
                  <img
                    :src="reviewByPlace[stop.key]?.photos?.[0] || stop.img"
                    :alt="stop.title"
                  >
                  <span v-if="reviewByPlace[stop.key]?.photos?.length" class="photo-count">
                    <KkIcon name="camera" :size="13" />
                    {{ reviewByPlace[stop.key].photos.length }}
                  </span>
                </div>
                <div class="memory-copy">
                  <div class="memory-place-head">
                    <div>
                      <span>{{ stop.cat }} · {{ stop.region || selectedTrip.region || '여행 장소' }}</span>
                      <h3>{{ stop.title }}</h3>
                    </div>
                    <Badge v-if="!stop.planned" tone="mint" size="sm">우연히 발견</Badge>
                  </div>
                  <template v-if="hasMemory(stop)">
                    <p>{{ reviewByPlace[stop.key]?.memo || '사진으로 남긴 여행의 한 장면이에요.' }}</p>
                  </template>
                  <p v-else class="memory-empty-copy">
                    이곳에서 무엇을 보고, 먹고, 느꼈나요?
                  </p>
                  <div class="memory-card-actions">
                    <button class="skip-button" type="button" @click="toggleExcluded(stop)">
                      {{ excludedPlaces.has(stop.key) ? '다시 포함' : '안 갔어요' }}
                    </button>
                    <button class="review-button" type="button" @click="openReview(stop)">
                      <KkIcon :name="hasMemory(stop) ? 'pencil' : 'camera'" :size="16" />
                      {{ hasMemory(stop) ? '기록 다듬기' : '이 장면 기록하기' }}
                    </button>
                  </div>
                </div>
                <div v-if="reviewByPlace[stop.key]?.rating" class="saved-rating">
                  <KkIcon name="star" :size="15" /> {{ reviewByPlace[stop.key].rating }}
                </div>
              </article>
            </section>

            <section class="add-place">
              <div>
                <strong>계획에 없던 장소도 다녀왔나요?</strong>
                <p>일정에 없던 장소도 내 여행 일기에 자유롭게 추가할 수 있어요.</p>
              </div>
              <div class="add-place-input">
                <input
                  v-model="newPlaceName"
                  placeholder="장소 이름을 입력해 주세요"
                  @keyup.enter="addUnplannedByName"
                />
                <button type="button" :disabled="!newPlaceName.trim()" @click="addUnplannedByName">
                  <KkIcon name="plus" :size="14" /> 추가
                </button>
              </div>
            </section>
          </main>

          <aside class="summary">
            <div class="summary-mascot">
              <Mascot variant="guide" :size="58" />
              <div>
                <span>WRITING PROGRESS</span>
                <strong>{{ writingProgress }}% 완성</strong>
              </div>
            </div>
            <div class="progress"><span :style="{ width: `${writingProgress}%` }" /></div>
            <div class="journal-stats">
              <div><strong>{{ reviewCount }}</strong><span>기록한 장소</span></div>
              <div><strong>{{ photoCount }}</strong><span>담은 사진</span></div>
            </div>
            <div class="writing-checklist">
              <span :class="{ done: diaryTitle.trim() }"><KkIcon name="check" :size="13" /> 여행 제목</span>
              <span :class="{ done: diaryStory.trim() }"><KkIcon name="check" :size="13" /> 여행 이야기</span>
              <span :class="{ done: reviewCount > 0 }"><KkIcon name="check" :size="13" /> 장소별 장면</span>
            </div>
            <div class="visibility-card">
              <div>
                <strong>{{ isPublic ? 'TripLog에 공개' : '나만 보는 일기' }}</strong>
                <span>{{ isPublic ? '다른 여행자와 이야기를 나눠요.' : '나만 볼 수 있게 안전하게 저장해요.' }}</span>
              </div>
              <Switch v-model="isPublic" aria-label="TripLog 공개 여부" />
            </div>
            <Button
              v-if="visibility === 'private'"
              variant="primary"
              size="lg"
              :full-width="true"
              @click="saveDiary"
            >나만의 일기로 저장</Button>
            <Button
              v-else
              variant="primary"
              size="lg"
              :full-width="true"
              @click="publishOpen = true"
            >저장하고 TripLog에 공개</Button>
          </aside>
        </div>
      </template>
    </div>

    <Teleport to="body">
      <div v-if="editingPlace" class="modal-backdrop" @click.self="editingPlace = null">
        <section class="review-modal memory-modal">
          <header>
            <img :src="editingPlace.img" :alt="editingPlace.title">
            <div><span>TRAVEL MEMORY</span><h2>{{ editingPlace.title }}에서의 기억</h2></div>
            <button type="button" aria-label="닫기" @click="editingPlace = null"><KkIcon name="x" :size="20" /></button>
          </header>
          <div class="review-form">
            <div class="writing-guide">
              <KkIcon name="sparkles" :size="18" />
              <p>사진과 함께 이 장소에서 느꼈던 이야기를 편하게 남겨보세요.</p>
            </div>
            <label>사진</label>
            <div class="photos">
              <div v-for="(photo, index) in reviewByPlace[editingPlace.key].photos" :key="index">
                <img :src="photo" alt=""><button type="button" @click="removePhoto(index)">×</button>
              </div>
              <label class="photo-add">
                <KkIcon name="camera" :size="21" /> 사진 추가
                <input type="file" accept="image/*" multiple @change="onPhotoInput">
              </label>
            </div>
            <label for="place-review">그곳에서의 이야기</label>
            <textarea
              id="place-review"
              v-model="reviewByPlace[editingPlace.key].memo"
              rows="8"
              placeholder="그날의 날씨, 함께한 사람, 우연히 생긴 일, 마음에 남은 대화와 감정을 여행 일기처럼 자유롭게 적어보세요."
            />
            <div class="optional-rating">
              <div>
                <strong>이 장소에 대한 만족도</strong>
                <span>원할 때만 남겨도 돼요.</span>
              </div>
              <Rating v-model="reviewByPlace[editingPlace.key].rating" :size="23" />
            </div>
            <Button variant="primary" size="lg" :full-width="true" @click="saveReview">이 추억을 일기장에 담기</Button>
          </div>
        </section>
      </div>

      <div v-if="publishOpen" class="modal-backdrop" @click.self="publishOpen = false">
        <section class="publish-modal">
          <Mascot variant="cheer" :size="86" />
          <h2>나의 여행 일기를 TripLog에 공개할까요?</h2>
          <p>여행 전체 이야기와 {{ reviewCount }}개의 장소별 추억이 다른 여행자에게 공개됩니다. 공개 후에도 다시 나만 보기로 바꿀 수 있어요.</p>
          <div>
            <Button variant="ghost" size="lg" @click="publishOpen = false">조금 더 작성하기</Button>
            <Button variant="primary" size="lg" @click="publishTripLog">공개하기</Button>
          </div>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.my-trips{min-height:calc(100vh - 68px);background:var(--bg-base)}.shell{width:min(100%,1160px);margin:0 auto;padding:34px 20px 80px}.hero{display:flex;align-items:end;justify-content:space-between;gap:28px;padding:30px 34px;margin-bottom:22px;border-radius:28px;background:linear-gradient(125deg,#fff1e9,#fff 62%,#e9faf5);border:1px solid #f6e5da}.eyebrow{color:var(--coral-600);font-size:12px;font-weight:900;letter-spacing:.12em}.hero h1{margin:6px 0;font-size:31px;font-weight:900}.hero p{color:var(--text-secondary)}.flow{display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:999px;background:#fff;color:var(--text-muted);font-size:12px;font-weight:800;box-shadow:var(--shadow-sm);white-space:nowrap}.flow strong{color:var(--mint-700)}.trip-list{display:grid;gap:16px}.trip-card{display:grid;grid-template-columns:1fr auto;overflow:hidden;border:1px solid var(--border-subtle);border-left:4px solid var(--coral-300);border-radius:18px;background:#fff;box-shadow:var(--shadow-sm);cursor:pointer;transition:.16s ease}.trip-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)}.trip-card-body{padding:16px 18px}.badges{display:flex;flex-wrap:wrap;gap:6px}.trip-card h2{margin:8px 0 0;font-size:17px}.card-meta{display:flex;gap:14px;margin-top:8px;color:var(--text-muted);font-size:12px;font-weight:700}.card-meta span{display:inline-flex;align-items:center;gap:4px}.card-action{display:flex;align-items:center;gap:5px;padding:16px 18px;color:var(--coral-600);font-size:13px;font-weight:800}.back{display:inline-flex;align-items:center;gap:5px;margin-bottom:14px;border:0;background:transparent;color:var(--text-secondary);font-weight:800;cursor:pointer}.trip-hero{position:relative;height:240px;overflow:hidden;border-radius:26px;background:linear-gradient(135deg,#d8f6f5 0%,#fde9df 100%)}.trip-hero>img{width:100%;height:100%;object-fit:cover}.trip-hero.no-cover{display:flex;align-items:flex-end}.trip-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(25,20,16,.82),rgba(25,20,16,.12))}.trip-title{position:absolute;left:30px;bottom:27px;width:min(620px,80%);color:#fff}.trip-title span{font-size:13px;font-weight:800;opacity:.88}.trip-title h1{margin:7px 0;color:#fff;font-size:30px;font-weight:900}.trip-title p{color:rgba(255,255,255,.84)}.trip-title--dark{position:static;padding:26px 30px;color:var(--text-primary)}.trip-title--dark span{opacity:1;color:var(--coral-600)}.trip-title--dark h1{color:var(--text-primary)}.trip-title--dark p{color:var(--text-secondary)}.workspace{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:22px;margin-top:22px;align-items:start}.guide-card{display:flex;align-items:center;gap:13px;padding:16px 18px;margin-bottom:24px;border:1px solid var(--sky-100);border-radius:18px;background:linear-gradient(110deg,var(--sky-50),#fff)}.guide-icon{display:grid;width:42px;height:42px;place-items:center;flex:none;border-radius:13px;background:var(--sky-500);color:#fff}.guide-card>div:nth-child(2){flex:1}.guide-card strong{font-size:15px}.guide-card p{margin-top:2px;color:var(--text-secondary);font-size:13px}.day-section{margin-bottom:26px}.day-section>header{display:flex;align-items:center;gap:9px;margin-bottom:11px}.day-section>header span{padding:5px 9px;border-radius:8px;background:var(--coral-500);color:#fff;font-size:12px;font-weight:900}.day-section h2{font-size:18px}.place-row{display:flex;align-items:center;gap:13px;padding:12px;margin-bottom:8px;border:1px solid var(--border-subtle);border-radius:16px;background:#fff;transition:opacity .16s}.place-row.excluded{opacity:.45;background:var(--gray-50)}.place-row>img{width:60px;height:60px;border-radius:12px;object-fit:cover;flex:none}.place-copy{min-width:0;flex:1}.place-copy>div{display:flex;align-items:center;gap:7px}.place-copy strong{font-size:15px}.place-copy span,.place-copy p{display:block;margin-top:3px;color:var(--text-muted);font-size:12.5px}.place-copy p{overflow:hidden;color:var(--text-secondary);text-overflow:ellipsis;white-space:nowrap}.saved-rating{display:inline-flex;align-items:center;gap:3px;color:var(--amber-600);font-size:13px;font-weight:900}.skip-button,.review-button{height:36px;border-radius:10px;padding:0 11px;font-size:12px;font-weight:800;cursor:pointer;white-space:nowrap}.skip-button{border:1px solid var(--border);background:#fff;color:var(--text-muted)}.review-button{display:inline-flex;align-items:center;gap:5px;border:0;background:var(--coral-50);color:var(--coral-700)}.add-place{padding:18px;border:1.5px dashed var(--mint-200);border-radius:18px;background:var(--mint-50)}.add-place p{margin-top:3px;color:var(--text-secondary);font-size:13px}.candidate-row{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}.candidate-row button{display:inline-flex;align-items:center;gap:4px;padding:8px 11px;border:1px solid var(--mint-200);border-radius:999px;background:#fff;color:var(--mint-700);font-size:12px;font-weight:800;cursor:pointer}.summary{position:sticky;top:90px;padding:22px;text-align:center;border:1px solid var(--border-subtle);border-radius:22px;background:#fff;box-shadow:var(--shadow-sm)}.summary-label{display:block;color:var(--text-muted);font-size:12px;font-weight:800}.summary>strong{display:block;margin:4px 0 10px;font-size:32px;color:var(--coral-600)}.progress{height:8px;overflow:hidden;border-radius:999px;background:var(--gray-100)}.progress span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--coral-500),var(--mint-400))}.summary p{margin:10px 0 18px;color:var(--text-secondary);font-size:13px}.summary small{display:block;margin-top:11px;color:var(--text-muted);line-height:1.5}.modal-backdrop{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:20px;background:rgba(25,20,16,.55)}.review-modal{width:min(520px,96vw);overflow:hidden;border-radius:24px;background:#fff;box-shadow:var(--shadow-xl)}.review-modal>header{display:flex;align-items:center;gap:13px;padding:16px 18px;border-bottom:1px solid var(--border-subtle)}.review-modal header img{width:58px;height:58px;border-radius:12px;object-fit:cover}.review-modal header div{flex:1}.review-modal header span{color:var(--coral-600);font-size:12px;font-weight:900}.review-modal header h2{margin-top:2px;font-size:20px}.review-modal header button{border:0;background:transparent;color:var(--text-muted);cursor:pointer}.review-form{padding:20px}.review-form>label{display:block;margin:15px 0 8px;font-size:13px;font-weight:800}.review-form>label:first-child{margin-top:0}.review-form textarea{width:100%;padding:12px;margin-bottom:18px;resize:vertical;border:1px solid var(--border);border-radius:13px;font:inherit;line-height:1.55}.photos{display:flex;gap:8px}.photos>div,.photo-add{position:relative;width:82px;height:82px;border-radius:12px;overflow:hidden}.photos img{width:100%;height:100%;object-fit:cover}.photos>div button{position:absolute;top:4px;right:4px;width:22px;height:22px;border:0;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;cursor:pointer}.photo-add{display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:5px;margin:0!important;border:1.5px dashed var(--coral-200);background:var(--coral-50);color:var(--coral-700);font-size:11px!important;cursor:pointer}.photo-add input{display:none}.publish-modal{width:min(430px,94vw);padding:28px;text-align:center;border-radius:24px;background:#fff;box-shadow:var(--shadow-xl)}.publish-modal h2{margin:6px 0 8px;font-size:22px}.publish-modal p{color:var(--text-secondary);line-height:1.6}.publish-modal>div{display:flex;justify-content:center;gap:9px;margin-top:20px}@media(max-width:820px){.hero{align-items:start;flex-direction:column}.flow{max-width:100%;overflow-x:auto}.card-action{display:none}.workspace{grid-template-columns:1fr}.summary{position:static}.guide-card{align-items:flex-start;flex-wrap:wrap}.place-row{flex-wrap:wrap}.place-copy{min-width:calc(100% - 76px)}}
.diary-editor{padding:26px;margin-bottom:28px;border:1px solid #eadfd7;border-radius:22px;background:linear-gradient(145deg,#fffdfb,#fff8f3);box-shadow:var(--shadow-sm)}.diary-heading span{display:inline-flex;align-items:center;gap:6px;color:var(--coral-600);font-size:11px;font-weight:900;letter-spacing:.1em}.diary-heading h2{margin:8px 0 5px;font-size:22px}.diary-heading p{color:var(--text-secondary);font-size:13.5px}.diary-title-input,.memory-title-input{width:100%;border:0;border-bottom:2px solid var(--coral-100);background:transparent;color:var(--text-primary);font-family:var(--font-sans);font-weight:800;outline:none}.diary-title-input{padding:18px 2px 10px;margin-top:8px;font-size:23px}.memory-title-input{padding:11px 12px;border:1px solid var(--border);border-radius:12px;background:#fff;font-size:16px}.diary-title-input:focus{border-color:var(--coral-400)}.mood-row{display:flex;flex-wrap:wrap;gap:7px;margin:15px 0}.mood-row button{padding:7px 11px;border:1px solid var(--border);border-radius:999px;background:#fff;color:var(--text-muted);font-size:12px;font-weight:800;cursor:pointer}.mood-row button.active{border-color:var(--coral-300);background:var(--coral-50);color:var(--coral-700)}.diary-editor>textarea{width:100%;padding:15px;border:1px solid var(--border-subtle);border-radius:15px;background:rgba(255,255,255,.76);font:inherit;line-height:1.8;resize:vertical;outline:none}.diary-editor>textarea:focus{border-color:var(--coral-300);box-shadow:0 0 0 3px var(--coral-50)}.memory-section{margin-bottom:26px}.memory-section>header{display:flex;align-items:flex-end;justify-content:space-between;gap:15px;margin-bottom:13px}.memory-section>header span{color:var(--mint-700);font-size:11px;font-weight:900;letter-spacing:.1em}.memory-section>header h2{margin:4px 0;font-size:20px}.memory-section>header p{color:var(--text-muted);font-size:13px}.place-copy>b{display:block;margin-top:6px;color:var(--text-primary);font-size:13px}.visibility-box{padding:14px;margin:0 0 15px;border-radius:15px;background:var(--gray-50);text-align:left}.visibility-box>label{display:block;margin-bottom:9px;font-size:12px;font-weight:900}.visibility-box>div{width:100%}.visibility-box small{display:block;margin-top:9px!important;min-height:36px;color:var(--text-muted);font-size:11px;line-height:1.5}.summary>strong{font-size:22px}.memory-modal{width:min(680px,96vw)}.writing-guide{display:flex;align-items:flex-start;gap:9px;padding:12px 13px;margin-bottom:17px;border-radius:13px;background:var(--sky-50);color:var(--sky-700)}.writing-guide p{font-size:13px;line-height:1.55}.optional-rating{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:13px 0 17px;border-top:1px solid var(--border-subtle)}.optional-rating strong,.optional-rating span{display:block}.optional-rating strong{font-size:13px}.optional-rating span{margin-top:2px;color:var(--text-muted);font-size:11px}
.saved-course{padding:20px;margin-bottom:26px;border:1px solid var(--border-subtle);border-radius:18px;background:#fff}.section-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}.section-title span{color:var(--coral-600);font-size:11px;font-weight:900;letter-spacing:.1em}.section-title h2{margin-top:3px;font-size:18px}.course-places{display:flex;flex-wrap:wrap;gap:7px}.course-places span{display:inline-flex;align-items:center;gap:4px;padding:7px 10px;border-radius:999px;background:var(--gray-50);color:var(--text-secondary);font-size:12px;font-weight:700}.summary{padding:16px;text-align:left}.save-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}.save-head strong,.save-head span{display:block}.save-head strong{font-size:15px}.save-head span{margin-top:2px;color:var(--text-muted);font-size:11px}.visibility-toggle{display:flex;align-items:center;gap:8px}.visibility-toggle>span{color:var(--text-secondary);font-size:12px;font-weight:800}.visibility-toggle :deep(label){gap:0!important}.writing-guide{background:var(--coral-50);color:var(--coral-700)}
.empty-state{display:flex;flex-direction:column;align-items:center;gap:22px;padding:70px 40px;border-radius:28px;background:linear-gradient(135deg,#fff9f6,#fff 50%,#f0fdf9);border:1px solid #f0e4dd;text-align:center}.empty-copy h3{margin:0 0 8px;font-size:22px;font-weight:900}.empty-copy p{color:var(--text-secondary);font-size:15px;line-height:1.7}.popular-row{display:flex;flex-direction:column;align-items:center;gap:10px}.popular-label{display:inline-flex;align-items:center;gap:5px;color:var(--coral-600);font-size:12px;font-weight:900;letter-spacing:.1em}.popular-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}.popular-chips button{padding:8px 18px;border:1px solid var(--border);border-radius:999px;background:#fff;color:var(--text-secondary);font-size:13px;font-weight:800;cursor:pointer;transition:.15s ease}.popular-chips button:hover{border-color:var(--coral-300);background:var(--coral-50);color:var(--coral-700)}
.plan-more-card{display:flex;align-items:center;gap:16px;padding:20px 24px;border:1.5px dashed var(--coral-200);border-radius:22px;background:linear-gradient(110deg,#fff9f6,#fff);cursor:pointer;transition:.16s ease}.plan-more-card:hover{border-color:var(--coral-400);background:var(--coral-50);transform:translateY(-2px)}.plan-more-copy{flex:1}.plan-more-copy strong{display:block;font-size:16px;font-weight:900;color:var(--text-primary)}.plan-more-copy p{margin-top:4px;color:var(--text-secondary);font-size:13px}.plan-more-cta{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;color:var(--coral-600);font-size:13px;font-weight:900}
.loading-state{display:grid;gap:16px}.loading-card{height:82px;border-radius:18px;background:linear-gradient(90deg,var(--gray-100) 25%,var(--gray-50) 50%,var(--gray-100) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.add-place-input{display:flex;gap:8px;margin-top:13px}.add-place-input input{flex:1;height:40px;padding:0 12px;border:1px solid var(--mint-200);border-radius:10px;background:#fff;color:var(--text-primary);font:inherit;font-size:13px;outline:none}.add-place-input input:focus{border-color:var(--mint-400);box-shadow:0 0 0 3px rgba(31,191,152,.1)}.add-place-input button{display:inline-flex;align-items:center;gap:5px;height:40px;padding:0 14px;border:0;border-radius:10px;background:var(--mint-500);color:#fff;font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap}.add-place-input button:disabled{background:var(--gray-200);color:var(--gray-400);cursor:default}

/* 여행 기록 에디터 */
.editor-topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px}.editor-topbar .back{margin:0}.editor-state{display:inline-flex;align-items:center;gap:7px;padding:7px 11px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;color:#6b7280;font-size:11px;font-weight:700}.autosave-dot{width:7px;height:7px;border-radius:50%;background:#22a06b}.trip-hero{height:176px;border:1px solid #e5e7eb;border-radius:18px;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.05)}.trip-hero>img{position:absolute;right:0;width:40%;height:100%;opacity:1}.trip-shade{background:linear-gradient(90deg,#fff 0%,#fff 54%,rgba(255,255,255,.75) 68%,rgba(255,255,255,0) 88%)}.trip-title{top:50%;right:auto;bottom:auto;left:28px;width:55%;color:#111827;transform:translateY(-50%)}.trip-title span{color:#6b7280;font-size:11px;font-weight:700;letter-spacing:0}.trip-title h1{overflow:hidden;max-width:500px;margin:7px 0;color:#111827;font-size:25px;line-height:1.25;text-overflow:ellipsis;white-space:nowrap}.trip-title p{color:#6b7280;font-size:13px}.workspace{grid-template-columns:minmax(0,1fr) 300px;gap:24px;margin-top:24px}.journal-canvas{min-width:0;padding:30px;border:1px solid #e5e7eb;border-radius:18px;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.04)}.diary-editor{padding:4px 2px 32px;margin:0 0 30px;border:0;border-bottom:1px solid #e5e7eb;border-radius:0;background:transparent;box-shadow:none}.diary-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.diary-heading span{color:#374151;font-size:12px;letter-spacing:0}.diary-heading p{max-width:330px;color:#9ca3af;font-size:12px;line-height:1.55;text-align:right}.diary-title-input{padding:24px 2px 14px;margin-top:10px;border-bottom:1px solid #d1d5db;font-size:30px;line-height:1.35}.diary-title-input::placeholder{color:#b6bbc3}.mood-row{margin:18px 0}.mood-row button{padding:8px 13px;border-color:#e5e7eb;color:#6b7280;transition:border-color .15s ease,background .15s ease,color .15s ease}.mood-row button:hover{border-color:var(--coral-300);color:var(--coral-600)}.mood-row button.active{border-color:var(--coral-500);background:var(--coral-500);color:#fff;box-shadow:0 4px 10px rgba(255,107,61,.2)}.diary-editor>textarea{min-height:260px;padding:20px;border:1px solid #eceff3;border-radius:12px;background:#fafafa;font-size:16px;line-height:2}.diary-editor>textarea:focus{border-color:#9ca3af;box-shadow:0 0 0 3px rgba(156,163,175,.12)}.writing-hint{display:flex;align-items:center;gap:6px;margin-top:12px;color:#6b7280;font-size:11px;font-weight:600}.saved-course{padding:18px 20px;margin-bottom:34px;border:1px solid #e5e7eb;border-radius:14px;background:#fafafa}.section-title span{color:#6b7280}.course-places span{border:1px solid #e5e7eb;background:#fff;box-shadow:none}.memory-section>header{margin-bottom:18px}.memory-section>header span{color:#6b7280}.memory-section>header h2{font-size:24px}.memory-card{position:relative;display:grid;grid-template-columns:170px minmax(0,1fr);gap:20px;min-height:180px;margin-bottom:14px;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#fff;box-shadow:none;transition:border-color .16s ease,box-shadow .16s ease}.memory-card:hover{border-color:#cbd5e1;box-shadow:0 4px 14px rgba(15,23,42,.07);transform:none}.memory-card.excluded{opacity:.45;filter:grayscale(.5)}.memory-visual{position:relative;min-height:180px;background:#f3f4f6}.memory-visual>img{width:100%;height:100%;min-height:180px;object-fit:cover}.photo-count{position:absolute;right:10px;bottom:10px;display:inline-flex;align-items:center;gap:4px;padding:5px 8px;border-radius:999px;background:rgba(17,24,39,.72);color:#fff;font-size:10px;font-weight:700;backdrop-filter:blur(6px)}.memory-copy{display:flex;min-width:0;flex-direction:column;padding:20px 20px 16px 0}.memory-place-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.memory-place-head span{color:#6b7280;font-size:10px;font-weight:700;letter-spacing:0}.memory-place-head h3{margin-top:5px;font-size:19px}.memory-copy>p{display:-webkit-box;overflow:hidden;margin-top:16px;color:#4b5563;font-size:13px;line-height:1.7;-webkit-box-orient:vertical;-webkit-line-clamp:3}.memory-copy>.memory-empty-copy{color:#9ca3af;font-style:normal}.memory-card-actions{display:flex;justify-content:flex-end;gap:7px;margin-top:auto;padding-top:14px}.memory-card .saved-rating{position:absolute;top:14px;left:14px;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 1px 3px rgba(15,23,42,.1)}.add-place{margin-top:8px;padding:22px;border-color:#d1d5db;border-radius:14px;background:#fafafa}.summary{padding:20px;overflow:hidden;border-color:#e5e7eb;border-radius:18px;box-shadow:0 1px 3px rgba(15,23,42,.05)}.summary-mascot{display:flex;align-items:center;gap:10px;margin:-8px -4px 12px}.summary-mascot>div{min-width:0}.summary-mascot span,.summary-mascot strong{display:block}.summary-mascot span{color:#6b7280;font-size:9px;font-weight:800;letter-spacing:.08em}.summary-mascot strong{margin-top:3px;font-size:17px}.journal-stats{display:grid;grid-template-columns:repeat(2,1fr);margin:16px 0;overflow:hidden;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa}.journal-stats div{padding:13px;text-align:center}.journal-stats div+div{border-left:1px solid #e5e7eb}.journal-stats strong,.journal-stats span{display:block}.journal-stats strong{color:#111827;font-size:20px}.journal-stats span{margin-top:2px;color:#9ca3af;font-size:10px}.writing-checklist{display:grid;gap:7px;margin-bottom:16px}.writing-checklist span{display:flex;align-items:center;gap:7px;color:#c1c5cc;font-size:11px;font-weight:700}.writing-checklist span svg{padding:2px;border-radius:50%;background:#f3f4f6}.writing-checklist span.done{color:#16835d}.writing-checklist span.done svg{background:#eaf7f1}.visibility-card{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px;padding:13px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa}.visibility-card strong,.visibility-card span{display:block}.visibility-card strong{font-size:12px}.visibility-card span{margin-top:3px;color:#9ca3af;font-size:10px;line-height:1.45}

@media(max-width:820px){.trip-hero{height:170px}.trip-title{left:24px}.trip-title h1{font-size:23px}.journal-canvas{padding:22px}.diary-heading{align-items:flex-start;flex-direction:column;gap:5px}.diary-heading p{text-align:left}.memory-card{grid-template-columns:120px minmax(0,1fr)}.memory-visual,.memory-visual>img{min-height:190px}.memory-copy{padding:16px 16px 14px 0}}
@media(max-width:560px){.editor-state{display:none}.trip-hero{height:150px}.trip-hero>img{width:46%;opacity:.55}.trip-shade{background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,.96) 64%,rgba(255,255,255,.3))}.trip-title{right:16px;left:18px;width:auto}.trip-title h1{max-width:70%;font-size:20px}.trip-title p{display:none}.workspace{margin-top:16px}.journal-canvas{padding:18px 14px}.diary-title-input{font-size:24px}.memory-card{grid-template-columns:1fr}.memory-visual,.memory-visual>img{height:190px;min-height:190px}.memory-copy{padding:17px}.memory-card .saved-rating{top:12px}.memory-card-actions{justify-content:stretch}.memory-card-actions button{flex:1}.photos{flex-wrap:wrap}}
.card-action button{display:inline-flex;align-items:center;gap:5px;height:34px;padding:0 11px;border:1px solid var(--mint-200);border-radius:10px;background:var(--mint-50);color:var(--mint-700);font-family:inherit;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap}.card-action button:hover{border-color:var(--mint-400);background:#fff}.card-action button:disabled{opacity:.55;cursor:default}.card-action>span{white-space:nowrap}
</style>
