<script setup>
import { computed, inject, ref, onMounted } from 'vue'
import { aiPlan, places, tripLogs } from '@/data/mockData.js'
import { useTripsStore } from '@/stores/trips.js'
import { useTripLogStore } from '@/stores/triplog.js'
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

onMounted(() => tripsStore.fetchTrips())

const fallbackTrip = {
  ...tripLogs[0],
  id: 'sample-trip',
  title: '제주 동쪽 2박 3일',
  region: '제주',
  period: '2박 3일',
  cover: '/images/img_jejueast.jpg',
  plan: aiPlan,
  visibility: 'private',
}

const trips = computed(() => tripsStore.trips.length ? tripsStore.trips : [fallbackTrip])
const selectedTrip = ref(null)
const reviewByPlace = ref({})
const excludedPlaces = ref(new Set())
const addedPlaces = ref([])
const editingPlace = ref(null)
const publishOpen = ref(false)
const diaryTitle = ref('')
const diaryStory = ref('')
const diaryMood = ref('행복했어요')
const visibility = ref('private')
const isPublic = computed({
  get: () => visibility.value === 'public',
  set: (value) => { visibility.value = value ? 'public' : 'private' },
})

const tripDays = computed(() => selectedTrip.value?.plan?.days || aiPlan.days)
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
  return review?.title?.trim() || review?.memo?.trim() || review?.rating || review?.photos?.length
}).length)

function hasMemory(stop) {
  const memory = reviewByPlace.value[stop.key]
  return Boolean(memory?.title?.trim() || memory?.memo?.trim() || memory?.rating || memory?.photos?.length)
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
  diaryTitle.value = selectedTrip.value.title || ''
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
        title: '',
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

function addUnplannedPlace(place) {
  if (allStops.value.some((stop) => stop.title === place.title)) return
  const stop = {
    ...place,
    key: `added-${place.id}-${Date.now()}`,
    planned: false,
  }
  addedPlaces.value = [...addedPlaces.value, stop]
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

async function publishTripLog() {
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
        dayNumber: 1,
      }
    })
  const photos = activeStops.value
    .filter((stop) => hasMemory(stop))
    .flatMap((stop) => reviewByPlace.value[stop.key]?.photos || [])

  try {
    await tripLogStore.publish({
      tripId: typeof selectedTrip.value.id === 'number' ? selectedTrip.value.id : null,
      title: diaryTitle.value.trim() || selectedTrip.value.title,
      content: diaryStory.value.trim() || `${diaryMood.value}. 오래 기억하고 싶은 여행 이야기예요.`,
      region: selectedTrip.value.region || '제주',
      travelStyle: selectedTrip.value.style || diaryMood.value,
      mood: diaryMood.value,
      coverImage: photos[0] || selectedTrip.value.cover || selectedTrip.value.coverImage || '',
      isPublic: true,
      placeLogs,
    })
    publishOpen.value = false
    showToast({ tone: 'success', message: '여행 기록이 TripLog에 공개됐어요.' })
    navigate('triplog')
  } catch {
    showToast({ tone: 'default', message: '발행에 실패했어요. 다시 시도해주세요.' })
  }
}

function saveDiary() {
  showToast({ tone: 'success', message: '나만의 여행 일기로 저장했어요.' })
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

        <div class="trip-list">
          <article v-for="trip in trips" :key="trip.id" class="trip-card" @click="openTrip(trip)">
            <img :src="trip.cover" :alt="trip.title">
            <div class="trip-card-body">
              <div class="badges">
                <Badge tone="coral">{{ trip.region || '제주' }}</Badge>
                <Badge tone="neutral">{{ trip.period || '2박 3일' }}</Badge>
              </div>
              <h2>{{ trip.title }}</h2>
              <p>실제로 다녀온 장소와 그날의 사진, 감정, 이야기를 자유롭게 기록할 수 있어요.</p>
              <div class="card-meta">
                <span><KkIcon name="calendar" :size="15" /> {{ trip.plan?.days?.length || trip.days || 3 }}일</span>
                <span><KkIcon name="pin" :size="15" /> {{ trip.places || 9 }}곳</span>
              </div>
            </div>
            <div class="card-action"><span>여행 기록하기</span><KkIcon name="chevronR" :size="20" /></div>
          </article>
        </div>
      </template>

      <template v-else>
        <button class="back" type="button" @click="backToList">
          <KkIcon name="chevronL" :size="18" /> 내 여행
        </button>

        <header class="trip-hero">
          <img :src="selectedTrip.cover" :alt="selectedTrip.title">
          <div class="trip-shade" />
          <div class="trip-title">
            <span>{{ selectedTrip.region || '제주' }} · {{ selectedTrip.period || '2박 3일' }}</span>
            <h1>{{ selectedTrip.title }}</h1>
            <p>{{ selectedTrip.region || '여행' }}에서 남긴 기록</p>
          </div>
        </header>

        <div class="workspace">
          <main>
            <section class="diary-editor">
              <div class="diary-heading">
                <span><KkIcon name="image" :size="17" /> MY TRAVEL STORY</span>
                <h2>여행 이야기</h2>
              </div>
              <input v-model="diaryTitle" class="diary-title-input" placeholder="여행 일기 제목을 적어주세요">
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
                rows="7"
                placeholder="이번 여행에서 남기고 싶은 이야기를 적어보세요."
              />
            </section>

            <section class="saved-course">
              <div class="section-title">
                <div><span>SAVED COURSE</span><h2>저장한 코스</h2></div>
                <Button variant="ghost" size="sm" @click="navigate('planner')">일정 보기</Button>
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
                  <span>MEMORY PLACES</span>
                  <h2>장소별 기록</h2>
                </div>
                <Badge tone="neutral">{{ activeStops.length }}곳</Badge>
              </header>
              <article
                v-for="stop in allStops"
                :key="stop.key"
                class="place-row"
                :class="{ excluded: excludedPlaces.has(stop.key) }"
              >
                <img :src="stop.img" :alt="stop.title">
                <div class="place-copy">
                  <div>
                    <strong>{{ stop.title }}</strong>
                    <Badge v-if="!stop.planned" tone="mint" size="sm">새로 담은 장소</Badge>
                  </div>
                  <span>{{ stop.cat }} · {{ stop.region || selectedTrip.region || '여행 장소' }}</span>
                  <b v-if="reviewByPlace[stop.key]?.title">{{ reviewByPlace[stop.key].title }}</b>
                  <p v-if="reviewByPlace[stop.key]?.memo">{{ reviewByPlace[stop.key].memo }}</p>
                </div>
                <div v-if="reviewByPlace[stop.key]?.rating" class="saved-rating">
                  <KkIcon name="star" :size="15" /> {{ reviewByPlace[stop.key].rating }}
                </div>
                <button class="skip-button" type="button" @click="toggleExcluded(stop)">
                  {{ excludedPlaces.has(stop.key) ? '다시 포함' : '안 갔어요' }}
                </button>
                <button class="review-button" type="button" @click="openReview(stop)">
                  <KkIcon :name="hasMemory(stop) ? 'pencil' : 'plus'" :size="16" />
                  {{ hasMemory(stop) ? '추억 수정' : '추억 기록' }}
                </button>
              </article>
            </section>

            <section class="add-place">
              <div>
                <strong>계획에 없던 장소도 다녀왔나요?</strong>
                <p>일정에 없던 장소도 내 여행 일기에 자유롭게 추가할 수 있어요.</p>
              </div>
              <div class="candidate-row">
                <button
                  v-for="place in places.filter((candidate) => !allStops.some((stop) => stop.title === candidate.title)).slice(0, 3)"
                  :key="place.id"
                  type="button"
                  @click="addUnplannedPlace(place)"
                >
                  <KkIcon name="plus" :size="14" /> {{ place.title }}
                </button>
              </div>
            </section>
          </main>

          <aside class="summary">
            <div class="save-head">
              <div><strong>여행 기록</strong><span>{{ reviewCount }}개 장소</span></div>
              <label class="visibility-toggle">
                <span>{{ isPublic ? 'TripLog 공개' : '나만 보기' }}</span>
                <Switch v-model="isPublic" aria-label="TripLog 공개 여부" />
              </label>
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
              <p>사진과 함께 기억하고 싶은 장면을 남겨보세요.</p>
            </div>
            <label for="memory-title">이 장면의 제목</label>
            <input
              id="memory-title"
              v-model="reviewByPlace[editingPlace.key].title"
              class="memory-title-input"
              placeholder="예: 비가 와서 더 좋았던 협재의 오후"
            >
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
.my-trips{min-height:calc(100vh - 68px);background:var(--bg-base)}.shell{width:min(100%,1160px);margin:0 auto;padding:34px 20px 80px}.hero{display:flex;align-items:end;justify-content:space-between;gap:28px;padding:30px 34px;margin-bottom:22px;border-radius:28px;background:linear-gradient(125deg,#fff1e9,#fff 62%,#e9faf5);border:1px solid #f6e5da}.eyebrow{color:var(--coral-600);font-size:12px;font-weight:900;letter-spacing:.12em}.hero h1{margin:6px 0;font-size:31px;font-weight:900}.hero p{color:var(--text-secondary)}.flow{display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:999px;background:#fff;color:var(--text-muted);font-size:12px;font-weight:800;box-shadow:var(--shadow-sm);white-space:nowrap}.flow strong{color:var(--mint-700)}.trip-list{display:grid;gap:16px}.trip-card{display:grid;grid-template-columns:190px 1fr auto;min-height:170px;overflow:hidden;border:1px solid var(--border-subtle);border-radius:22px;background:#fff;box-shadow:var(--shadow-sm);cursor:pointer;transition:.16s ease}.trip-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)}.trip-card>img{width:100%;height:100%;object-fit:cover}.trip-card-body{padding:22px}.badges{display:flex;gap:6px}.trip-card h2{margin:10px 0 6px;font-size:21px}.trip-card p{color:var(--text-secondary);font-size:14px}.card-meta{display:flex;gap:16px;margin-top:15px;color:var(--text-muted);font-size:13px;font-weight:700}.card-meta span{display:inline-flex;align-items:center;gap:5px}.card-action{display:flex;align-items:center;gap:6px;padding:24px;color:var(--coral-600);font-weight:800}.back{display:inline-flex;align-items:center;gap:5px;margin-bottom:14px;border:0;background:transparent;color:var(--text-secondary);font-weight:800;cursor:pointer}.trip-hero{position:relative;height:240px;overflow:hidden;border-radius:26px}.trip-hero>img{width:100%;height:100%;object-fit:cover}.trip-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(25,20,16,.82),rgba(25,20,16,.12))}.trip-title{position:absolute;left:30px;bottom:27px;width:min(620px,80%);color:#fff}.trip-title span{font-size:13px;font-weight:800;opacity:.88}.trip-title h1{margin:7px 0;color:#fff;font-size:30px;font-weight:900}.trip-title p{color:rgba(255,255,255,.84)}.workspace{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:22px;margin-top:22px;align-items:start}.guide-card{display:flex;align-items:center;gap:13px;padding:16px 18px;margin-bottom:24px;border:1px solid var(--sky-100);border-radius:18px;background:linear-gradient(110deg,var(--sky-50),#fff)}.guide-icon{display:grid;width:42px;height:42px;place-items:center;flex:none;border-radius:13px;background:var(--sky-500);color:#fff}.guide-card>div:nth-child(2){flex:1}.guide-card strong{font-size:15px}.guide-card p{margin-top:2px;color:var(--text-secondary);font-size:13px}.day-section{margin-bottom:26px}.day-section>header{display:flex;align-items:center;gap:9px;margin-bottom:11px}.day-section>header span{padding:5px 9px;border-radius:8px;background:var(--coral-500);color:#fff;font-size:12px;font-weight:900}.day-section h2{font-size:18px}.place-row{display:flex;align-items:center;gap:13px;padding:12px;margin-bottom:8px;border:1px solid var(--border-subtle);border-radius:16px;background:#fff;transition:opacity .16s}.place-row.excluded{opacity:.45;background:var(--gray-50)}.place-row>img{width:60px;height:60px;border-radius:12px;object-fit:cover;flex:none}.place-copy{min-width:0;flex:1}.place-copy>div{display:flex;align-items:center;gap:7px}.place-copy strong{font-size:15px}.place-copy span,.place-copy p{display:block;margin-top:3px;color:var(--text-muted);font-size:12.5px}.place-copy p{overflow:hidden;color:var(--text-secondary);text-overflow:ellipsis;white-space:nowrap}.saved-rating{display:inline-flex;align-items:center;gap:3px;color:var(--amber-600);font-size:13px;font-weight:900}.skip-button,.review-button{height:36px;border-radius:10px;padding:0 11px;font-size:12px;font-weight:800;cursor:pointer;white-space:nowrap}.skip-button{border:1px solid var(--border);background:#fff;color:var(--text-muted)}.review-button{display:inline-flex;align-items:center;gap:5px;border:0;background:var(--coral-50);color:var(--coral-700)}.add-place{padding:18px;border:1.5px dashed var(--mint-200);border-radius:18px;background:var(--mint-50)}.add-place p{margin-top:3px;color:var(--text-secondary);font-size:13px}.candidate-row{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}.candidate-row button{display:inline-flex;align-items:center;gap:4px;padding:8px 11px;border:1px solid var(--mint-200);border-radius:999px;background:#fff;color:var(--mint-700);font-size:12px;font-weight:800;cursor:pointer}.summary{position:sticky;top:90px;padding:22px;text-align:center;border:1px solid var(--border-subtle);border-radius:22px;background:#fff;box-shadow:var(--shadow-sm)}.summary-label{display:block;color:var(--text-muted);font-size:12px;font-weight:800}.summary>strong{display:block;margin:4px 0 10px;font-size:32px;color:var(--coral-600)}.progress{height:8px;overflow:hidden;border-radius:999px;background:var(--gray-100)}.progress span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--coral-500),var(--mint-400))}.summary p{margin:10px 0 18px;color:var(--text-secondary);font-size:13px}.summary small{display:block;margin-top:11px;color:var(--text-muted);line-height:1.5}.modal-backdrop{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:20px;background:rgba(25,20,16,.55)}.review-modal{width:min(520px,96vw);overflow:hidden;border-radius:24px;background:#fff;box-shadow:var(--shadow-xl)}.review-modal>header{display:flex;align-items:center;gap:13px;padding:16px 18px;border-bottom:1px solid var(--border-subtle)}.review-modal header img{width:58px;height:58px;border-radius:12px;object-fit:cover}.review-modal header div{flex:1}.review-modal header span{color:var(--coral-600);font-size:12px;font-weight:900}.review-modal header h2{margin-top:2px;font-size:20px}.review-modal header button{border:0;background:transparent;color:var(--text-muted);cursor:pointer}.review-form{padding:20px}.review-form>label{display:block;margin:15px 0 8px;font-size:13px;font-weight:800}.review-form>label:first-child{margin-top:0}.review-form textarea{width:100%;padding:12px;margin-bottom:18px;resize:vertical;border:1px solid var(--border);border-radius:13px;font:inherit;line-height:1.55}.photos{display:flex;gap:8px}.photos>div,.photo-add{position:relative;width:82px;height:82px;border-radius:12px;overflow:hidden}.photos img{width:100%;height:100%;object-fit:cover}.photos>div button{position:absolute;top:4px;right:4px;width:22px;height:22px;border:0;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;cursor:pointer}.photo-add{display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:5px;margin:0!important;border:1.5px dashed var(--coral-200);background:var(--coral-50);color:var(--coral-700);font-size:11px!important;cursor:pointer}.photo-add input{display:none}.publish-modal{width:min(430px,94vw);padding:28px;text-align:center;border-radius:24px;background:#fff;box-shadow:var(--shadow-xl)}.publish-modal h2{margin:6px 0 8px;font-size:22px}.publish-modal p{color:var(--text-secondary);line-height:1.6}.publish-modal>div{display:flex;justify-content:center;gap:9px;margin-top:20px}@media(max-width:820px){.hero{align-items:start;flex-direction:column}.flow{max-width:100%;overflow-x:auto}.trip-card{grid-template-columns:120px 1fr}.card-action{display:none}.workspace{grid-template-columns:1fr}.summary{position:static}.guide-card{align-items:flex-start;flex-wrap:wrap}.place-row{flex-wrap:wrap}.place-copy{min-width:calc(100% - 76px)}}
.diary-editor{padding:26px;margin-bottom:28px;border:1px solid #eadfd7;border-radius:22px;background:linear-gradient(145deg,#fffdfb,#fff8f3);box-shadow:var(--shadow-sm)}.diary-heading span{display:inline-flex;align-items:center;gap:6px;color:var(--coral-600);font-size:11px;font-weight:900;letter-spacing:.1em}.diary-heading h2{margin:8px 0 5px;font-size:22px}.diary-heading p{color:var(--text-secondary);font-size:13.5px}.diary-title-input,.memory-title-input{width:100%;border:0;border-bottom:2px solid var(--coral-100);background:transparent;color:var(--text-primary);font-family:var(--font-sans);font-weight:800;outline:none}.diary-title-input{padding:18px 2px 10px;margin-top:8px;font-size:23px}.memory-title-input{padding:11px 12px;border:1px solid var(--border);border-radius:12px;background:#fff;font-size:16px}.diary-title-input:focus{border-color:var(--coral-400)}.mood-row{display:flex;flex-wrap:wrap;gap:7px;margin:15px 0}.mood-row button{padding:7px 11px;border:1px solid var(--border);border-radius:999px;background:#fff;color:var(--text-muted);font-size:12px;font-weight:800;cursor:pointer}.mood-row button.active{border-color:var(--coral-300);background:var(--coral-50);color:var(--coral-700)}.diary-editor>textarea{width:100%;padding:15px;border:1px solid var(--border-subtle);border-radius:15px;background:rgba(255,255,255,.76);font:inherit;line-height:1.8;resize:vertical;outline:none}.diary-editor>textarea:focus{border-color:var(--coral-300);box-shadow:0 0 0 3px var(--coral-50)}.memory-section{margin-bottom:26px}.memory-section>header{display:flex;align-items:flex-end;justify-content:space-between;gap:15px;margin-bottom:13px}.memory-section>header span{color:var(--mint-700);font-size:11px;font-weight:900;letter-spacing:.1em}.memory-section>header h2{margin:4px 0;font-size:20px}.memory-section>header p{color:var(--text-muted);font-size:13px}.place-copy>b{display:block;margin-top:6px;color:var(--text-primary);font-size:13px}.visibility-box{padding:14px;margin:0 0 15px;border-radius:15px;background:var(--gray-50);text-align:left}.visibility-box>label{display:block;margin-bottom:9px;font-size:12px;font-weight:900}.visibility-box>div{width:100%}.visibility-box small{display:block;margin-top:9px!important;min-height:36px;color:var(--text-muted);font-size:11px;line-height:1.5}.summary>strong{font-size:22px}.memory-modal{width:min(680px,96vw)}.writing-guide{display:flex;align-items:flex-start;gap:9px;padding:12px 13px;margin-bottom:17px;border-radius:13px;background:var(--sky-50);color:var(--sky-700)}.writing-guide p{font-size:13px;line-height:1.55}.optional-rating{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:13px 0 17px;border-top:1px solid var(--border-subtle)}.optional-rating strong,.optional-rating span{display:block}.optional-rating strong{font-size:13px}.optional-rating span{margin-top:2px;color:var(--text-muted);font-size:11px}
.saved-course{padding:20px;margin-bottom:26px;border:1px solid var(--border-subtle);border-radius:18px;background:#fff}.section-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}.section-title span{color:var(--coral-600);font-size:11px;font-weight:900;letter-spacing:.1em}.section-title h2{margin-top:3px;font-size:18px}.course-places{display:flex;flex-wrap:wrap;gap:7px}.course-places span{display:inline-flex;align-items:center;gap:4px;padding:7px 10px;border-radius:999px;background:var(--gray-50);color:var(--text-secondary);font-size:12px;font-weight:700}.summary{padding:16px;text-align:left}.save-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}.save-head strong,.save-head span{display:block}.save-head strong{font-size:15px}.save-head span{margin-top:2px;color:var(--text-muted);font-size:11px}.visibility-toggle{display:flex;align-items:center;gap:8px}.visibility-toggle>span{color:var(--text-secondary);font-size:12px;font-weight:800}.visibility-toggle :deep(label){gap:0!important}.writing-guide{background:var(--coral-50);color:var(--coral-700)}
</style>
