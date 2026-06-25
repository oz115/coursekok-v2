<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import * as loungeApi from '@/api/lounge.js'

const auth = inject('auth')
const showToast = inject('showToast', () => {})

// ── 상태 ──────────────────────────────────────────────────────────────────
const spots = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(0)
const selectedBadge = ref('')
const selectedSpot = ref(null)
const detailLoading = ref(false)

const reviewText = ref('')
const reviewRating = ref(5)
const reviewSubmitting = ref(false)
const editingReview = ref(null)

// ── 배지 필터 ─────────────────────────────────────────────────────────────
const BADGE_FILTERS = [
  { key: '', label: '전체' },
  { key: 'POPULAR', label: '인기 여행지' },
  { key: 'RECOMMENDED', label: '추천 여행지' },
  { key: 'SEASONAL', label: '계절 여행지' },
]

const BADGE_META = {
  POPULAR: { label: '🔥 인기', color: '#C73E1D', bg: '#FFE2D6' },
  RECOMMENDED: { label: '💎 추천', color: '#154FAC', bg: '#D2E7FF' },
  SEASONAL: { label: '🍃 계절', color: '#066B57', bg: '#C2F3E4' },
}

// ── 로드 ──────────────────────────────────────────────────────────────────
async function loadSpots(reset = false) {
  if (loading.value) return
  if (reset) {
    spots.value = []
    page.value = 0
    hasMore.value = true
  }
  if (!hasMore.value) return

  loading.value = true
  try {
    const res = await loungeApi.getSpots({ badge: selectedBadge.value, page: page.value, size: 12 })
    const items = res.content ?? []
    spots.value = reset ? items : [...spots.value, ...items]
    hasMore.value = !res.isLast
    page.value++
  } catch (e) {
    showToast('스팟 목록을 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
}

watch(selectedBadge, () => loadSpots(true))
onMounted(() => loadSpots(true))

// ── 스팟 상세 열기 ────────────────────────────────────────────────────────
async function openSpot(spot) {
  detailLoading.value = true
  selectedSpot.value = { ...spot, reviews: null }
  resetReviewForm()
  try {
    const detail = await loungeApi.getSpotDetail(spot.id)
    selectedSpot.value = detail
  } catch (e) {
    showToast('상세 정보를 불러오지 못했습니다.')
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  selectedSpot.value = null
  resetReviewForm()
}

// ── 리뷰 ──────────────────────────────────────────────────────────────────
function resetReviewForm() {
  reviewText.value = ''
  reviewRating.value = 5
  editingReview.value = null
}

function startEditReview(review) {
  editingReview.value = review
  reviewRating.value = review.rating
  reviewText.value = review.content
}

async function submitReview() {
  if (!reviewText.value.trim()) return
  if (!auth?.isAuthenticated) {
    showToast('로그인 후 리뷰를 작성할 수 있습니다.')
    return
  }

  reviewSubmitting.value = true
  try {
    const payload = { rating: reviewRating.value, content: reviewText.value.trim() }
    if (editingReview.value) {
      await loungeApi.updateReview(selectedSpot.value.id, editingReview.value.id, payload)
      showToast('리뷰가 수정되었습니다.')
    } else {
      await loungeApi.createReview(selectedSpot.value.id, payload)
      showToast('리뷰가 등록되었습니다.')
    }
    resetReviewForm()
    const detail = await loungeApi.getSpotDetail(selectedSpot.value.id)
    selectedSpot.value = detail
    const idx = spots.value.findIndex(s => s.id === detail.id)
    if (idx !== -1) {
      spots.value[idx] = {
        ...spots.value[idx],
        reviewCount: detail.reviewCount,
        averageRating: detail.averageRating,
      }
    }
  } catch (e) {
    showToast(e.data?.message ?? '리뷰 저장에 실패했습니다.')
  } finally {
    reviewSubmitting.value = false
  }
}

async function deleteReview(review) {
  if (!confirm('리뷰를 삭제하시겠습니까?')) return
  try {
    await loungeApi.deleteReview(selectedSpot.value.id, review.id)
    showToast('리뷰가 삭제되었습니다.')
    const detail = await loungeApi.getSpotDetail(selectedSpot.value.id)
    selectedSpot.value = detail
    const idx = spots.value.findIndex(s => s.id === detail.id)
    if (idx !== -1) {
      spots.value[idx] = {
        ...spots.value[idx],
        reviewCount: detail.reviewCount,
        averageRating: detail.averageRating,
      }
    }
  } catch (e) {
    showToast('리뷰 삭제에 실패했습니다.')
  }
}

// ── 유틸 ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return '오늘'
  if (diff < 7) return `${diff}일 전`
  if (diff < 30) return `${Math.floor(diff / 7)}주 전`
  return `${Math.floor(diff / 30)}개월 전`
}

const isMyReview = (review) =>
  auth?.user && review.authorId === auth.user.id

const currentReviews = computed(() =>
  selectedSpot.value?.reviews?.content ?? []
)
</script>

<template>
  <div style="max-width: 1200px; margin: 0 auto; padding: 32px 24px; min-height: 100vh">

    <!-- 헤더 -->
    <div style="margin-bottom: 28px">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px">
        <div style="width: 4px; height: 26px; background: var(--coral-500); border-radius: 3px; flex: none"></div>
        <h1 style="font-size: 26px; font-weight: 800; color: var(--gray-900); margin: 0">
          라운지
        </h1>
      </div>
      <p style="color: var(--text-secondary); font-size: 15px; margin: 0 0 0 14px">
        코스콕이 엄선한 인기·추천 여행지를 만나보세요
      </p>
    </div>

    <!-- 배지 필터 -->
    <div style="display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap">
      <button
        v-for="f in BADGE_FILTERS"
        :key="f.key"
        @click="selectedBadge = f.key"
        :style="{
          padding: '8px 18px',
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          fontWeight: selectedBadge === f.key ? 700 : 500,
          fontSize: '14px',
          background: selectedBadge === f.key ? 'var(--coral-500)' : 'var(--surface)',
          color: selectedBadge === f.key ? '#fff' : 'var(--text-secondary)',
          transition: 'all 0.15s',
          fontFamily: 'var(--font-sans)',
          border: selectedBadge === f.key ? 'none' : '1px solid var(--border)',
          boxShadow: selectedBadge === f.key ? '0 2px 8px rgba(255,107,61,0.3)' : 'none',
        }"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- 스팟 카드 그리드 -->
    <div
      v-if="spots.length > 0"
      style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px"
    >
      <div
        v-for="spot in spots"
        :key="spot.id"
        @click="openSpot(spot)"
        style="
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        "
        @mouseenter="$event.currentTarget.style.transform='translateY(-4px)'; $event.currentTarget.style.boxShadow='0 10px 28px rgba(0,0,0,0.11)'"
        @mouseleave="$event.currentTarget.style.transform=''; $event.currentTarget.style.boxShadow=''"
      >
        <!-- 커버 이미지 -->
        <div style="position: relative; width: 100%; height: 180px; background: var(--surface)">
          <img
            v-if="spot.placeImage"
            :src="spot.placeImage"
            :alt="spot.placeTitle"
            style="width: 100%; height: 100%; object-fit: cover"
          />
          <div
            v-else
            style="width: 100%; height: 100%; display: grid; place-items: center; color: var(--text-tertiary); font-size: 32px"
          >
            🏞️
          </div>

          <!-- 이미지 하단 그라데이션 -->
          <div
            style="
              position: absolute; inset: 0;
              background: linear-gradient(to top, rgba(0,0,0,0.22) 0%, transparent 50%);
              pointer-events: none;
            "
          ></div>

          <!-- 배지 -->
          <span
            v-if="BADGE_META[spot.badge]"
            :style="{
              position: 'absolute',
              top: '10px',
              left: '10px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '12px',
              fontWeight: 700,
              color: BADGE_META[spot.badge].color,
              background: BADGE_META[spot.badge].bg,
            }"
          >
            {{ BADGE_META[spot.badge].label }}
          </span>
        </div>

        <!-- 카드 본문 -->
        <div style="padding: 16px">
          <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 4px; color: var(--gray-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
            {{ spot.placeTitle }}
          </h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
            {{ spot.placeAddress }}
          </p>

          <!-- 큐레이터 한마디 -->
          <p
            v-if="spot.curatorNote"
            style="
              font-size: 13px; color: var(--text-secondary);
              border-left: 2.5px solid var(--coral-300);
              padding-left: 9px;
              margin: 0 0 12px;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              line-height: 1.5;
            "
          >
            {{ spot.curatorNote }}
          </p>

          <!-- 통계 -->
          <div style="display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--text-secondary)">
            <span style="color: #F5A623; font-weight: 600">
              ★ {{ spot.averageRating > 0 ? spot.averageRating.toFixed(1) : '-' }}
            </span>
            <span>리뷰 {{ spot.reviewCount }}개</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div
      v-else-if="!loading"
      style="text-align: center; padding: 80px 0; color: var(--text-secondary)"
    >
      <div style="font-size: 48px; margin-bottom: 12px">🏖️</div>
      <p style="font-size: 16px">아직 등록된 라운지 스팟이 없습니다.</p>
    </div>

    <!-- 더보기 / 로딩 -->
    <div style="text-align: center; margin-top: 32px">
      <div v-if="loading" style="color: var(--text-secondary); font-size: 14px">불러오는 중...</div>
      <button
        v-else-if="hasMore"
        @click="loadSpots()"
        style="
          padding: 10px 28px;
          border: 1px solid var(--border);
          border-radius: var(--radius-pill);
          background: #fff;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 14px;
          font-family: var(--font-sans);
        "
      >
        더보기
      </button>
    </div>
  </div>

  <!-- ── 스팟 상세 사이드 패널 ── -->
  <Teleport to="body">
    <div
      v-if="selectedSpot"
      @click.self="closeDetail"
      style="
        position: fixed; inset: 0; z-index: 100;
        background: rgba(0,0,0,0.4);
        display: flex; justify-content: flex-end;
      "
    >
      <div
        style="
          width: min(560px, 100vw);
          height: 100%;
          background: #fff;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        "
      >
        <!-- 패널 헤더 -->
        <div style="position: sticky; top: 0; background: #fff; z-index: 1; padding: 20px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between">
          <span style="font-weight: 700; font-size: 16px; color: var(--gray-900)">장소 상세</span>
          <button
            @click="closeDetail"
            style="border: none; background: none; cursor: pointer; font-size: 22px; color: var(--text-secondary); line-height: 1"
          >×</button>
        </div>

        <!-- 로딩 -->
        <div v-if="detailLoading" style="flex: 1; display: grid; place-items: center; color: var(--text-secondary)">
          불러오는 중...
        </div>

        <!-- 본문 -->
        <div v-else style="padding: 24px; flex: 1">

          <!-- 이미지 -->
          <div style="width: 100%; height: 220px; border-radius: 12px; overflow: hidden; background: var(--surface); margin-bottom: 20px">
            <img
              v-if="selectedSpot.placeImage"
              :src="selectedSpot.placeImage"
              :alt="selectedSpot.placeTitle"
              style="width: 100%; height: 100%; object-fit: cover"
            />
            <div v-else style="width: 100%; height: 100%; display: grid; place-items: center; font-size: 48px">🏞️</div>
          </div>

          <!-- 배지 + 제목 -->
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px">
            <span
              v-if="BADGE_META[selectedSpot.badge]"
              :style="{
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '12px',
                fontWeight: 700,
                color: BADGE_META[selectedSpot.badge].color,
                background: BADGE_META[selectedSpot.badge].bg,
              }"
            >
              {{ BADGE_META[selectedSpot.badge].label }}
            </span>
            <span style="font-size: 20px; font-weight: 800; color: var(--gray-900)">
              {{ selectedSpot.placeTitle }}
            </span>
          </div>

          <p style="font-size: 14px; color: var(--text-secondary); margin: 0 0 12px">
            {{ selectedSpot.placeAddress }}
          </p>

          <!-- 통계 -->
          <div style="display: flex; gap: 16px; font-size: 14px; color: var(--text-secondary); margin-bottom: 16px">
            <span style="color: #F5A623; font-weight: 600">
              ★ {{ selectedSpot.averageRating > 0 ? selectedSpot.averageRating.toFixed(1) : '-' }}
            </span>
            <span>리뷰 {{ selectedSpot.reviewCount }}개</span>
          </div>

          <!-- 큐레이터 한마디 -->
          <div
            v-if="selectedSpot.curatorNote"
            style="
              background: var(--coral-50);
              border-left: 3px solid var(--coral-500);
              padding: 12px 16px;
              border-radius: 0 8px 8px 0;
              margin-bottom: 20px;
              font-size: 14px;
              color: var(--gray-800);
              line-height: 1.6;
            "
          >
            <span style="font-weight: 700; color: var(--coral-600)">큐레이터 한마디</span><br/>
            {{ selectedSpot.curatorNote }}
          </div>

          <!-- 장소 소개 -->
          <div v-if="selectedSpot.placeOverview" style="margin-bottom: 24px">
            <h3 style="font-size: 15px; font-weight: 700; color: var(--gray-900); margin: 0 0 8px">장소 소개</h3>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin: 0">
              {{ selectedSpot.placeOverview }}
            </p>
          </div>

          <!-- 구분선 -->
          <hr style="border: none; border-top: 1px solid var(--border); margin: 20px 0" />

          <!-- 리뷰 섹션 -->
          <h3 style="font-size: 15px; font-weight: 700; color: var(--gray-900); margin: 0 0 16px">
            방문 리뷰 ({{ selectedSpot.reviewCount }})
          </h3>

          <!-- 리뷰 작성 폼 -->
          <div
            v-if="auth?.isAuthenticated && !selectedSpot.myReviewExists || editingReview"
            style="
              background: var(--surface);
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 20px;
            "
          >
            <p style="font-size: 14px; font-weight: 600; color: var(--gray-800); margin: 0 0 10px">
              {{ editingReview ? '리뷰 수정' : '리뷰 작성' }}
            </p>
            <!-- 별점 -->
            <div style="display: flex; gap: 6px; margin-bottom: 10px">
              <button
                v-for="n in 5"
                :key="n"
                @click="reviewRating = n"
                style="border: none; background: none; cursor: pointer; font-size: 24px; padding: 0; line-height: 1"
                :style="{ color: n <= reviewRating ? '#F5A623' : '#ddd' }"
              >★</button>
            </div>
            <!-- 텍스트 -->
            <textarea
              v-model="reviewText"
              placeholder="이 장소에 대한 경험을 공유해주세요."
              rows="3"
              style="
                width: 100%;
                border: 1px solid var(--border);
                border-radius: 8px;
                padding: 10px 12px;
                font-size: 14px;
                font-family: var(--font-sans);
                resize: vertical;
                outline: none;
                box-sizing: border-box;
                color: var(--gray-900);
              "
            />
            <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px">
              <button
                v-if="editingReview"
                @click="resetReviewForm"
                style="
                  padding: 7px 16px; border: 1px solid var(--border);
                  border-radius: var(--radius-pill); background: #fff;
                  font-size: 13px; cursor: pointer; color: var(--text-secondary);
                  font-family: var(--font-sans);
                "
              >취소</button>
              <button
                @click="submitReview"
                :disabled="reviewSubmitting || !reviewText.trim()"
                style="
                  padding: 7px 20px;
                  border: none;
                  border-radius: var(--radius-pill);
                  background: var(--coral-500);
                  color: #fff;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  font-family: var(--font-sans);
                "
                :style="{ opacity: reviewSubmitting || !reviewText.trim() ? 0.5 : 1 }"
              >
                {{ reviewSubmitting ? '저장 중...' : (editingReview ? '수정 완료' : '등록') }}
              </button>
            </div>
          </div>

          <!-- 비로그인 안내 -->
          <div
            v-else-if="!auth?.isAuthenticated"
            style="
              text-align: center;
              padding: 16px;
              background: var(--surface);
              border-radius: 12px;
              margin-bottom: 20px;
              font-size: 14px;
              color: var(--text-secondary);
            "
          >
            로그인하면 리뷰를 작성할 수 있어요.
          </div>

          <!-- 이미 작성한 경우 -->
          <div
            v-else-if="selectedSpot.myReviewExists && !editingReview"
            style="
              text-align: center;
              padding: 12px;
              background: var(--surface);
              border-radius: 12px;
              margin-bottom: 20px;
              font-size: 13px;
              color: var(--text-secondary);
            "
          >
            이미 리뷰를 작성하셨습니다. 아래에서 수정하거나 삭제할 수 있어요.
          </div>

          <!-- 리뷰 목록 -->
          <div
            v-if="currentReviews.length > 0"
            style="display: flex; flex-direction: column; gap: 14px"
          >
            <div
              v-for="review in currentReviews"
              :key="review.id"
              style="
                border: 1px solid var(--border);
                border-radius: 12px;
                padding: 14px 16px;
                background: #fff;
              "
            >
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px">
                <div style="display: flex; align-items: center; gap: 8px">
                  <div
                    style="
                      width: 32px; height: 32px; border-radius: 50%;
                      background: var(--coral-100);
                      display: grid; place-items: center;
                      font-size: 13px; font-weight: 700; color: var(--coral-600);
                      overflow: hidden; flex: none;
                    "
                  >
                    <img
                      v-if="review.authorProfileImage"
                      :src="review.authorProfileImage"
                      style="width: 100%; height: 100%; object-fit: cover"
                    />
                    <span v-else>{{ review.authorNickname?.charAt(0) }}</span>
                  </div>
                  <div>
                    <p style="font-size: 13px; font-weight: 600; color: var(--gray-900); margin: 0">{{ review.authorNickname }}</p>
                    <p style="font-size: 12px; color: var(--text-tertiary); margin: 0">{{ formatDate(review.createdAt) }}</p>
                  </div>
                </div>
                <!-- 본인 리뷰 수정/삭제 -->
                <div v-if="isMyReview(review)" style="display: flex; gap: 6px">
                  <button
                    @click="startEditReview(review)"
                    style="border: none; background: none; cursor: pointer; font-size: 12px; color: var(--text-secondary); padding: 2px 6px"
                  >수정</button>
                  <button
                    @click="deleteReview(review)"
                    style="border: none; background: none; cursor: pointer; font-size: 12px; color: #e53e3e; padding: 2px 6px"
                  >삭제</button>
                </div>
              </div>
              <div style="color: #F5A623; font-size: 14px; margin-bottom: 6px">
                {{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}
              </div>
              <p style="font-size: 14px; color: var(--gray-800); margin: 0; line-height: 1.6">{{ review.content }}</p>
            </div>
          </div>

          <div v-else style="text-align: center; padding: 24px 0; color: var(--text-secondary); font-size: 14px">
            아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
