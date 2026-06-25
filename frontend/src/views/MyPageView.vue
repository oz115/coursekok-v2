<script setup>
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { useTripLogStore } from '@/stores/triplog.js'
import Avatar from '@/components/data-display/Avatar.vue'
import KkIcon from '@/components/icons/KkIcon.vue'
import Mascot from '@/components/brand/Mascot.vue'
import Badge from '@/components/core/Badge.vue'

const auth = inject('auth')
const navigate = inject('navigate', () => {})
const showToast = inject('showToast', () => {})
const basketPlaces = inject('basketPlaces', ref([]))
const tripLogStore = useTripLogStore()

const userName = computed(() => auth?.user?.nickname || auth?.user?.name || '여행자')
const userEmail = computed(() => auth?.user?.email || '')
const userProfileImage = computed(() => auth?.user?.profileImage || '')
const publicCount = computed(() => tripLogStore.myLogs.filter((l) => l.isPublic).length)
const privateCount = computed(() => tripLogStore.myLogs.filter((l) => !l.isPublic).length)

const activeLogTab = ref('all')
const showAllLogs = ref(false)
const filteredMyLogs = computed(() => {
  if (activeLogTab.value === 'private') return tripLogStore.myLogs.filter((l) => !l.isPublic)
  return tripLogStore.myLogs
})
const visibleMyLogs = computed(() =>
  showAllLogs.value ? filteredMyLogs.value : filteredMyLogs.value.slice(0, 4)
)
watch(activeLogTab, () => { showAllLogs.value = false })

const showMoreMenu = ref(false)
function closeMoreMenu() { showMoreMenu.value = false }

onMounted(() => {
  tripLogStore.loadMyLogs()
  document.addEventListener('click', closeMoreMenu)
})
onUnmounted(() => document.removeEventListener('click', closeMoreMenu))

function formatDate(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return '오늘'
  if (diff < 7) return `${diff}일 전`
  if (diff < 30) return `${Math.floor(diff / 7)}주 전`
  return `${Math.floor(diff / 30)}개월 전`
}

// ── 내 TripLog 상세 모달 ──────────────────────────────────────────────
const showMyLogPanel = ref(false)
const selectedMyLog = ref(null)
const selectedMyLogLoading = ref(false)
const editMode = ref(false)

async function openMyLog(log) {
  showMyLogPanel.value = true
  selectedMyLog.value = null
  selectedMyLogLoading.value = true
  editMode.value = false
  try {
    selectedMyLog.value = await tripLogStore.loadDetail(log.id)
  } catch {
    showToast({ tone: 'default', message: '기록을 불러오지 못했어요.' })
    showMyLogPanel.value = false
  } finally {
    selectedMyLogLoading.value = false
  }
}

function closeMyLog() {
  showMyLogPanel.value = false
  selectedMyLog.value = null
  editMode.value = false
}

function thumbUrl(log) {
  if (log.coverImage) return log.coverImage
  if (log.userImages?.length) return log.userImages[0]
  if (log.placeImages?.length) return log.placeImages[0]
  return null
}

async function toggleDetailVisibility() {
  if (!selectedMyLog.value) return
  const next = !selectedMyLog.value.isPublic
  try {
    await tripLogStore.updateMyLogVisibility(selectedMyLog.value.id, next)
    selectedMyLog.value = { ...selectedMyLog.value, isPublic: next }
    showToast({ tone: 'success', message: next ? 'TripLog에 공개됐어요.' : '나만 보기로 변경했어요.' })
  } catch {
    showToast({ tone: 'default', message: '변경에 실패했어요. 다시 시도해주세요.' })
  }
}

// ── 프로필 편집 모달 ─────────────────────────────────────────────────
const profileEditOpen = ref(false)
const profileNickname = ref('')
const profileImagePreview = ref('')
const profileSaving = ref(false)
const profileFileInput = ref(null)

function openProfileEdit() {
  profileNickname.value = auth?.user?.nickname || ''
  profileImagePreview.value = auth?.user?.profileImage || ''
  profileEditOpen.value = true
}

function closeProfileEdit() {
  profileEditOpen.value = false
}

function onProfileImagePick(e) {
  const file = e.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    showToast({ tone: 'default', message: '이미지 파일만 선택할 수 있어요.' })
    return
  }

  const img = new Image()
  const objectUrl = URL.createObjectURL(file)

  img.onload = () => {
    const MAX = 300
    let w = img.naturalWidth
    let h = img.naturalHeight
    if (w > MAX || h > MAX) {
      if (w >= h) { h = Math.round((h * MAX) / w); w = MAX }
      else         { w = Math.round((w * MAX) / h); h = MAX }
    }
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(img, 0, 0, w, h)
    const compressed = canvas.toDataURL('image/jpeg', 0.6)

    // base64 크기가 100KB 초과 시 거부 (TEXT 컬럼 보호)
    if (compressed.length > 100 * 1024) {
      showToast({ tone: 'default', message: '이미지가 너무 커요. 더 작은 사진을 선택해 주세요.' })
      URL.revokeObjectURL(objectUrl)
      return
    }

    profileImagePreview.value = compressed
    URL.revokeObjectURL(objectUrl)
  }

  img.onerror = () => {
    showToast({ tone: 'default', message: '이미지를 불러오지 못했어요. 다른 파일을 선택해 주세요.' })
    URL.revokeObjectURL(objectUrl)
  }

  img.src = objectUrl
}

async function saveProfile() {
  const nick = profileNickname.value.trim()
  if (!nick) { showToast({ tone: 'default', message: '닉네임을 입력해 주세요.' }); return }
  if (nick.length < 2 || nick.length > 20) { showToast({ tone: 'default', message: '닉네임은 2~20자 사이로 입력해 주세요.' }); return }
  profileSaving.value = true
  try {
    await auth.updateProfile({ nickname: nick, profileImage: profileImagePreview.value || null })
    showToast({ tone: 'success', message: '프로필이 업데이트됐어요!' })
    closeProfileEdit()
  } catch {
    showToast({ tone: 'default', message: '저장에 실패했어요. 다시 시도해주세요.' })
  } finally {
    profileSaving.value = false
  }
}

// ── TripLog 수정 (상세 패널 인라인) ──────────────────────────────────
const editLogTitle = ref('')
const editLogContent = ref('')
const editLogIsPublic = ref(true)
const editLogSaving = ref(false)

function startEdit() {
  if (!selectedMyLog.value) return
  editLogTitle.value = selectedMyLog.value.title || ''
  editLogContent.value = selectedMyLog.value.content || ''
  editLogIsPublic.value = selectedMyLog.value.isPublic ?? true
  editMode.value = true
}

async function openEditLog(log) {
  await openMyLog(log)
  if (selectedMyLog.value) startEdit()
}

function closeEditLog() {
  editMode.value = false
}

async function saveEditLog() {
  if (!editLogTitle.value.trim()) { showToast({ tone: 'default', message: '제목을 입력해 주세요.' }); return }
  editLogSaving.value = true
  try {
    await tripLogStore.updateMyLog(selectedMyLog.value.id, {
      title: editLogTitle.value.trim(),
      content: editLogContent.value.trim(),
      region: selectedMyLog.value.region,
      isPublic: editLogIsPublic.value,
      travelStyle: selectedMyLog.value.travelStyle,
      coverImage: selectedMyLog.value.coverImage,
      mood: selectedMyLog.value.mood,
    })
    selectedMyLog.value = {
      ...selectedMyLog.value,
      title: editLogTitle.value.trim(),
      content: editLogContent.value.trim(),
      isPublic: editLogIsPublic.value,
    }
    showToast({ tone: 'success', message: '여행 기록이 수정됐어요.' })
    editMode.value = false
  } catch {
    showToast({ tone: 'default', message: '수정에 실패했어요. 다시 시도해주세요.' })
  } finally {
    editLogSaving.value = false
  }
}

// ── TripLog 삭제 확인 ─────────────────────────────────────────────────
const deletingLog = ref(null)
const deleteConfirmLoading = ref(false)

function confirmDeleteLog(log) { deletingLog.value = log }
function closeDeleteConfirm() { deletingLog.value = null }

async function executeDeleteLog() {
  if (!deletingLog.value) return
  deleteConfirmLoading.value = true
  try {
    await tripLogStore.deleteMyLog(deletingLog.value.id)
    showToast({ tone: 'success', message: '여행 기록이 삭제됐어요.' })
    closeDeleteConfirm()
  } catch {
    showToast({ tone: 'default', message: '삭제에 실패했어요. 다시 시도해주세요.' })
  } finally {
    deleteConfirmLoading.value = false
  }
}

async function logout() {
  await auth.logout()
  navigate('explore')
}
</script>

<template>
  <!-- ── 내 TripLog 상세 / 수정 패널 ── -->
  <Teleport to="body">
    <div v-if="showMyLogPanel" class="overlay" @click.self="closeMyLog">
      <div class="panel mylog-panel">
        <div class="panel-header">
          <span class="panel-title">{{ editMode ? '여행 기록 수정' : '여행 기록' }}</span>
          <div class="panel-actions">
            <template v-if="selectedMyLog && !editMode">
              <button
                type="button"
                class="vis-chip"
                :class="selectedMyLog.isPublic ? 'is-public' : 'is-private'"
                @click="toggleDetailVisibility"
              >{{ selectedMyLog.isPublic ? '비공개로 전환' : '공개로 전환' }}</button>
              <button type="button" class="edit-trigger-btn" @click="startEdit">
                <KkIcon name="pencil" :size="13" /> 수정
              </button>
            </template>
            <button type="button" class="icon-btn" aria-label="닫기" @click="closeMyLog">
              <KkIcon name="x" :size="18" />
            </button>
          </div>
        </div>

        <div v-if="selectedMyLogLoading" class="panel-loading">
          <Mascot variant="default" :size="52" />
          <p>기록을 불러오는 중이에요...</p>
        </div>

        <template v-else-if="selectedMyLog">
          <div v-if="thumbUrl(selectedMyLog)" class="mylog-cover">
            <img :src="thumbUrl(selectedMyLog)" :alt="selectedMyLog.title" />
          </div>

          <div class="mylog-body">
            <!-- 편집 모드 -->
            <template v-if="editMode">
              <label class="edit-label">제목</label>
              <input
                v-model="editLogTitle"
                class="edit-input"
                type="text"
                placeholder="여행의 제목을 입력해 주세요"
                maxlength="60"
              />
              <label class="edit-label" style="margin-top:16px">내용</label>
              <textarea
                v-model="editLogContent"
                class="edit-textarea"
                placeholder="여행에 대한 이야기를 적어보세요"
                rows="6"
              />
              <div class="visibility-row">
                <span class="vis-label">공개 설정</span>
                <button
                  type="button"
                  class="vis-chip"
                  :class="editLogIsPublic ? 'is-private' : 'is-public'"
                  @click="editLogIsPublic = !editLogIsPublic"
                >{{ editLogIsPublic ? '공개' : '나만 보기' }}</button>
              </div>
            </template>

            <!-- 보기 모드 -->
            <template v-else>
              <div class="mylog-badges">
                <Badge :tone="selectedMyLog.isPublic ? 'mint' : 'neutral'">{{ selectedMyLog.isPublic ? '공개' : '나만보기' }}</Badge>
                <Badge tone="coral">{{ selectedMyLog.region }}</Badge>
              </div>
              <h2 class="mylog-title">{{ selectedMyLog.title }}</h2>
              <p class="mylog-meta">
                <template v-if="selectedMyLog.travelStyle">{{ selectedMyLog.travelStyle }} · </template>
                {{ formatDate(selectedMyLog.createdAt) }}
              </p>
              <div v-if="selectedMyLog.content" class="mylog-story">{{ selectedMyLog.content }}</div>
            </template>

            <!-- 장소 기록 (보기/편집 공통) -->
            <div v-if="selectedMyLog.placeLogs?.length" class="mylog-places">
              <h3>여행의 기록</h3>
              <div v-for="pl in selectedMyLog.placeLogs" :key="pl.id" class="mylog-place">
                <div class="mylog-place-head">
                  <span v-if="pl.placeCategory" class="place-cat">{{ pl.placeCategory }}</span>
                  <strong>{{ pl.placeTitle }}</strong>
                </div>
                <img
                  v-if="pl.imageUrl || pl.placeImage"
                  :src="pl.imageUrl || pl.placeImage"
                  :alt="pl.placeTitle"
                  class="mylog-place-img"
                />
                <p v-if="pl.reviewContent">{{ pl.reviewContent }}</p>
              </div>
            </div>
          </div>

          <!-- 편집 모드 저장/취소 -->
          <div v-if="editMode" class="panel-footer">
            <button type="button" class="btn btn-ghost" @click="closeEditLog">취소</button>
            <button type="button" class="btn btn-primary" :disabled="editLogSaving" @click="saveEditLog">
              {{ editLogSaving ? '저장 중...' : '저장' }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>

  <!-- ── 프로필 편집 모달 ── -->
  <Teleport to="body">
    <div v-if="profileEditOpen" class="overlay" @click.self="closeProfileEdit">
      <div class="panel profile-edit-panel">
        <div class="panel-header">
          <span class="panel-title">프로필 편집</span>
          <button type="button" class="icon-btn" aria-label="닫기" @click="closeProfileEdit">
            <KkIcon name="x" :size="18" />
          </button>
        </div>
        <div class="edit-body">
          <div class="avatar-edit-wrap">
            <Avatar
              :name="profileNickname || userName"
              :src="profileImagePreview"
              :size="96"
              :ring="true"
            />
            <button
              type="button"
              class="avatar-camera-btn"
              aria-label="프로필 사진 변경"
              @click="profileFileInput?.click()"
            >
              <KkIcon name="camera" :size="16" />
            </button>
            <input
              ref="profileFileInput"
              type="file"
              accept="image/*"
              class="hidden-file"
              @change="onProfileImagePick"
            />
          </div>
          <p class="avatar-hint">카메라 버튼을 눌러 사진을 변경하세요</p>

          <label class="edit-label">닉네임</label>
          <input
            v-model="profileNickname"
            class="edit-input"
            type="text"
            placeholder="닉네임을 입력해 주세요"
            maxlength="20"
            @keyup.enter="saveProfile"
          />
          <p class="edit-hint">2~20자 이내 ({{ profileNickname.length }}/20)</p>
        </div>
        <div class="panel-footer">
          <button type="button" class="btn btn-ghost" @click="closeProfileEdit">취소</button>
          <button type="button" class="btn btn-primary" :disabled="profileSaving" @click="saveProfile">
            {{ profileSaving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>


  <!-- ── TripLog 삭제 확인 ── -->
  <Teleport to="body">
    <div v-if="deletingLog" class="overlay" @click.self="closeDeleteConfirm">
      <div class="panel delete-panel">
        <Mascot variant="guide" :size="64" class="delete-mascot" />
        <h3 class="delete-title">이 여행 기록을 삭제할까요?</h3>
        <p class="delete-desc">삭제하면 복구할 수 없어요.</p>
        <div class="delete-actions">
          <button type="button" class="btn btn-ghost" @click="closeDeleteConfirm">취소</button>
          <button type="button" class="btn btn-danger" :disabled="deleteConfirmLoading" @click="executeDeleteLog">
            {{ deleteConfirmLoading ? '삭제 중...' : '삭제' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ── 마이페이지 본문 ── -->
  <section class="mypage">
    <div class="shell">

      <!-- 프로필 카드 -->
      <header class="profile-card">
        <button type="button" class="avatar-edit-trigger" aria-label="프로필 편집" @click="openProfileEdit">
          <Avatar :name="userName" :src="userProfileImage" :size="80" :ring="true" />
          <span class="avatar-edit-overlay">
            <KkIcon name="pencil" :size="16" color="#fff" />
          </span>
        </button>
        <div class="profile-info">
          <span class="profile-label">MY PAGE</span>
          <h1>{{ userName }}</h1>
          <p>{{ userEmail }}</p>
        </div>
        <div class="more-menu-wrap" @click.stop>
          <button type="button" class="more-btn" aria-label="더보기" @click="showMoreMenu = !showMoreMenu">
            <KkIcon name="dots" :size="18" />
          </button>
          <div v-if="showMoreMenu" class="more-dropdown">
            <button type="button" class="more-item logout" @click="logout">
              <KkIcon name="undo" :size="15" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <!-- 통계 -->
      <div class="stats-row">
        <div class="stat-item">
          <strong>{{ tripLogStore.myLogs.length }}</strong>
          <span>전체 기록</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <strong>{{ publicCount }}</strong>
          <span>공개</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <strong>{{ privateCount }}</strong>
          <span>나만 보기</span>
        </div>
      </div>

      <!-- 본문 2단 -->
      <div class="content-grid">
        <main>
          <!-- 내 TripLog -->
          <section class="content-section">
            <div class="section-head">
              <div>
                <h2>내 TripLog</h2>
                <p>{{ activeLogTab === 'private' ? '나만 보기로 저장한 일기예요.' : '나만 보기 포함 전체 여행 기록이에요.' }}</p>
              </div>
              <button
                v-if="filteredMyLogs.length > 4"
                type="button"
                class="section-more"
                @click="showAllLogs = !showAllLogs"
              >
                {{ showAllLogs ? '접기' : '전체보기' }}
                <KkIcon :name="showAllLogs ? 'chevronU' : 'chevronD'" :size="15" />
              </button>
            </div>

            <div class="log-tabs">
              <button
                type="button"
                class="log-tab"
                :class="{ active: activeLogTab === 'all' }"
                @click="activeLogTab = 'all'"
              >전체 <span class="tab-count">{{ tripLogStore.myLogs.length }}</span></button>
              <button
                type="button"
                class="log-tab"
                :class="{ active: activeLogTab === 'private' }"
                @click="activeLogTab = 'private'"
              >나만보기 <span class="tab-count">{{ privateCount }}</span></button>
            </div>

            <div v-if="tripLogStore.myLogsLoading" class="empty-box">불러오는 중...</div>
            <div v-else-if="filteredMyLogs.length === 0" class="empty-box">
              <Mascot variant="wink" :size="48" />
              <p v-if="activeLogTab === 'private'">비공개로 저장한 기록이 없어요.<br>일기처럼 나만 보기로 기록해보세요!</p>
              <p v-else>아직 작성한 여행 기록이 없어요.<br>첫 TripLog를 남겨보세요!</p>
            </div>
            <div v-else class="log-grid">
              <article
                v-for="log in visibleMyLogs"
                :key="log.id"
                class="log-card"
                @click="openMyLog(log)"
              >
                <div class="log-thumb" :class="{ 'no-img': !thumbUrl(log) }">
                  <img v-if="thumbUrl(log)" :src="thumbUrl(log)" :alt="log.title" />
                  <div v-else class="log-thumb-blank">
                    <KkIcon name="image" :size="28" color="#c4bdb5" />
                    <span>{{ log.region }}</span>
                  </div>
                  <span class="vis-badge" :class="log.isPublic ? 'pub' : 'priv'">
                    {{ log.isPublic ? '공개' : '비공개' }}
                  </span>
                </div>
                <div class="log-body">
                  <p class="log-region">{{ log.region }}</p>
                  <h3 class="log-title">{{ log.title }}</h3>
                  <div class="log-stats">
                    <span><KkIcon name="heart" :size="12" /> {{ log.likeCount ?? 0 }}</span>
                    <span><KkIcon name="message" :size="12" /> {{ log.commentCount ?? 0 }}</span>
                  </div>
                  <div class="log-actions">
                    <button type="button" class="log-action-btn" @click.stop="openEditLog(log)">
                      <KkIcon name="pencil" :size="13" /> 수정
                    </button>
                    <button type="button" class="log-action-btn danger" @click.stop="confirmDeleteLog(log)">
                      <KkIcon name="trash" :size="13" /> 삭제
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- 저장한 장소 -->
          <section class="content-section">
            <div class="section-head">
              <div>
                <h2>저장한 장소</h2>
                <p>여행 바구니에 담아둔 장소예요.</p>
              </div>
              <button type="button" class="section-more" @click="navigate('explore')">
                탐색하기 <KkIcon name="chevronR" :size="15" />
              </button>
            </div>
            <div v-if="basketPlaces.length === 0" class="empty-box empty-box--row">
              <KkIcon name="bookmark" :size="22" color="var(--text-muted)" />
              <p>아직 담아둔 장소가 없어요.<br>여행지 탐색에서 마음에 드는 곳을 담아보세요.</p>
            </div>
            <div v-else class="saved-grid">
              <article v-for="place in basketPlaces.slice(0, 4)" :key="place.id" class="saved-card">
                <img :src="place.img" :alt="place.title" />
                <div class="saved-info">
                  <strong>{{ place.title }}</strong>
                  <span>{{ place.cat || place.region || '장소' }}</span>
                </div>
                <KkIcon name="bookmark" :size="16" color="var(--coral-500)" />
              </article>
            </div>
          </section>
        </main>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── 공통 오버레이 / 패널 ── */
.overlay {
  position: fixed; inset: 0; z-index: 200;
  display: grid; place-items: center; padding: 20px;
  background: rgba(20,16,12,.55); backdrop-filter: blur(6px);
}
.panel {
  position: relative; width: min(680px, 96vw);
  border-radius: 22px; background: #fff;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
  overflow: hidden;
}
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}
.panel-title { font-size: 15px; font-weight: 900; color: var(--text-primary); }
.panel-actions { display: flex; align-items: center; gap: 8px; }
.panel-footer {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 8px; padding: 14px 20px;
  border-top: 1px solid var(--border-subtle);
}
.icon-btn {
  display: grid; place-items: center; width: 34px; height: 34px;
  border: 1px solid var(--border); border-radius: 50%;
  background: #fff; color: var(--text-muted); cursor: pointer;
}
.icon-btn:hover { background: var(--gray-50); }

/* 공개/비공개 칩 */
.vis-chip {
  display: inline-flex; align-items: center;
  height: 30px; padding: 0 12px; border: 0; border-radius: 999px;
  font-size: 12px; font-weight: 800; cursor: pointer;
}
.vis-chip.is-public  { background: var(--gray-100); color: var(--text-muted); }
.vis-chip.is-private { background: #e6f6f4; color: var(--mint-700); }

/* ── TripLog 상세 패널 ── */
.mylog-panel { max-height: 88vh; overflow-y: auto; }
.mylog-panel::-webkit-scrollbar { width: 5px; }
.mylog-panel::-webkit-scrollbar-thumb { border-radius: 99px; background: var(--gray-200); }

.panel-loading {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 60px 20px;
  color: var(--text-muted); font-size: 14px; font-weight: 700; text-align: center;
}
.mylog-cover { width: 100%; height: 240px; overflow: hidden; background: #f2f1ef; }
.mylog-cover img { width: 100%; height: 100%; object-fit: cover; }
.mylog-cover-blank {
  width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; color: var(--text-muted); font-size: 14px; font-weight: 700;
}
.mylog-body { padding: 22px 24px 28px; }
.mylog-badges { display: flex; gap: 6px; margin-bottom: 12px; }
.mylog-title { margin: 0 0 8px; font-size: 22px; font-weight: 900; letter-spacing: -.01em; }
.mylog-meta { margin: 0 0 18px; color: var(--text-muted); font-size: 13px; font-weight: 600; }
.mylog-story {
  white-space: pre-line; padding: 16px 18px; border-radius: 12px;
  background: var(--gray-50); color: #4f4740;
  font-size: 14px; line-height: 1.8; font-weight: 500; margin-bottom: 22px;
}
.mylog-places h3 { font-size: 15px; font-weight: 900; margin: 0 0 12px; }
.mylog-place {
  padding: 14px; border: 1px solid var(--border-subtle);
  border-radius: 12px; background: #fff; margin-bottom: 10px;
}
.mylog-place-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.place-cat { color: var(--coral-500); font-size: 11px; font-weight: 900; }
.mylog-place-head strong { font-size: 15px; font-weight: 800; }
.mylog-place-img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 9px; margin-bottom: 8px; }
.mylog-place p { color: #5f574f; font-size: 14px; line-height: 1.65; margin: 0; }

/* ── 프로필 편집 패널 ── */
.profile-edit-panel { width: min(440px, 96vw); }

.edit-trigger-btn {
  display: inline-flex; align-items: center; gap: 5px;
  height: 30px; padding: 0 12px; border: 1px solid var(--border);
  border-radius: 8px; background: #fff; color: var(--text-secondary);
  font-size: 12px; font-weight: 800; font-family: inherit; cursor: pointer;
}
.edit-trigger-btn:hover { background: var(--gray-50); }

.edit-body { padding: 24px 24px 8px; }

.avatar-edit-wrap { position: relative; width: fit-content; margin: 0 auto 8px; }
.avatar-camera-btn {
  position: absolute; bottom: 2px; right: 2px;
  display: grid; place-items: center; width: 30px; height: 30px;
  border: 2px solid #fff; border-radius: 50%;
  background: var(--coral-500); color: #fff; cursor: pointer;
}
.avatar-camera-btn:hover { background: var(--coral-600); }
.hidden-file { display: none; }
.avatar-hint { text-align: center; font-size: 12px; color: var(--text-muted); margin-bottom: 20px; }

.edit-label { display: block; font-size: 13px; font-weight: 800; color: var(--text-secondary); margin-bottom: 6px; }
.edit-input {
  width: 100%; box-sizing: border-box; height: 44px;
  padding: 0 14px; border: 1.5px solid var(--border);
  border-radius: 10px; font-size: 15px; font-family: inherit; outline: none;
}
.edit-input:focus { border-color: var(--coral-400); }
.edit-textarea {
  width: 100%; box-sizing: border-box;
  padding: 12px 14px; border: 1.5px solid var(--border);
  border-radius: 10px; font-size: 14px; font-family: inherit;
  line-height: 1.6; resize: vertical; outline: none;
}
.edit-textarea:focus { border-color: var(--coral-400); }
.edit-hint { margin: 5px 0 0; font-size: 11px; color: var(--text-muted); }

.visibility-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 16px; padding: 12px 14px;
  border: 1.5px solid var(--border); border-radius: 10px;
}
.vis-label { font-size: 14px; font-weight: 700; color: var(--text-secondary); }

/* ── 삭제 확인 패널 ── */
.delete-panel { width: min(360px, 96vw); padding: 36px 28px 28px; text-align: center; }
.delete-mascot { display: block; margin: 0 auto 16px; }
.delete-title { margin: 0 0 6px; font-size: 18px; font-weight: 900; }
.delete-desc { margin: 0 0 24px; color: var(--text-muted); font-size: 14px; }
.delete-actions { display: flex; gap: 8px; justify-content: center; }

/* ── 공통 버튼 ── */
.btn {
  height: 40px; padding: 0 18px; border: 0; border-radius: 10px;
  font-size: 14px; font-weight: 800; font-family: inherit; cursor: pointer;
}
.btn:disabled { opacity: .55; cursor: not-allowed; }
.btn-ghost { background: var(--gray-100); color: var(--text-secondary); }
.btn-ghost:hover:not(:disabled) { background: var(--gray-200); }
.btn-primary { background: var(--coral-500); color: #fff; }
.btn-primary:hover:not(:disabled) { background: var(--coral-600); }
.btn-danger { background: #fee2e2; color: #ef4444; }
.btn-danger:hover:not(:disabled) { background: #fecaca; }

/* ── 마이페이지 본문 ── */
.mypage { min-height: calc(100vh - 68px); background: var(--bg-base); }
.shell { width: min(100%, 1160px); margin: 0 auto; padding: 36px 20px 80px; }

/* 프로필 카드 */
.profile-card {
  position: relative; display: flex; align-items: center; gap: 20px;
  padding: 24px 28px; margin-bottom: 16px;
  border: 1px solid rgba(255, 115, 70, 0.25); border-radius: 22px;
  background: linear-gradient(110deg, #fff5f0 0%, #fff9f7 40%, #fff 75%);
  overflow: hidden;
}
.profile-card::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 5px; background: linear-gradient(180deg, var(--coral-500) 0%, #ff9f6b 100%);
  border-radius: 0 3px 3px 0;
}
.profile-avatar-wrap { flex: 0 0 auto; }
.profile-info { flex: 1; min-width: 0; }
.profile-label {
  display: inline-block; margin-bottom: 4px;
  font-size: 11px; font-weight: 900; letter-spacing: .1em; color: var(--coral-500);
}
.profile-info h1 { margin: 0 0 3px; font-size: 24px; font-weight: 900; }
.profile-info p { margin: 0; color: var(--text-muted); font-size: 13px; }
/* 아바타 편집 트리거 */
.avatar-edit-trigger {
  position: relative; flex: 0 0 auto;
  border: 0; background: none; padding: 0; cursor: pointer; border-radius: 50%;
}
.avatar-edit-overlay {
  position: absolute; inset: 0; border-radius: 50%;
  display: grid; place-items: center;
  background: rgba(0,0,0,.38);
  opacity: 0; transition: opacity .15s;
}
.avatar-edit-trigger:hover .avatar-edit-overlay { opacity: 1; }

/* ··· 더보기 메뉴 */
.more-menu-wrap { position: absolute; top: 16px; right: 18px; }
.more-btn {
  display: grid; place-items: center; width: 34px; height: 34px;
  border: 1px solid var(--border); border-radius: 50%;
  background: #fff; color: var(--text-muted); cursor: pointer;
  transition: background .12s;
}
.more-btn:hover { background: var(--gray-50); }
.more-dropdown {
  position: absolute; top: calc(100% + 6px); right: 0;
  min-width: 130px; border: 1px solid var(--border-subtle);
  border-radius: 12px; background: #fff;
  box-shadow: 0 8px 24px rgba(0,0,0,.12); overflow: hidden; z-index: 10;
}
.more-item {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 11px 14px; border: 0; background: none;
  font-size: 13px; font-weight: 800; font-family: inherit;
  cursor: pointer; text-align: left;
}
.more-item:hover { background: var(--gray-50); }
.more-item.logout { color: #ef4444; }
.more-item.logout:hover { background: #fff5f5; }

/* 통계 */
.stats-row {
  display: flex; align-items: center;
  padding: 16px 24px; margin-bottom: 22px;
  border: 1px solid var(--border-subtle); border-radius: 16px; background: #fff;
}
.stat-item { flex: 1; text-align: center; }
.stat-item strong { display: block; font-size: 22px; font-weight: 900; color: var(--coral-600); }
.stat-item span { margin-top: 2px; display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); }
.stat-divider { width: 1px; height: 36px; background: var(--border-subtle); }

/* 본문 그리드 */
.content-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }

/* 섹션 */
.content-section {
  padding: 20px; margin-bottom: 16px;
  border: 1px solid var(--border-subtle); border-radius: 18px; background: #fff;
}
.section-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.section-head h2 { margin: 0 0 3px; font-size: 17px; font-weight: 900; }
.section-head p { margin: 0; color: var(--text-muted); font-size: 12px; }
.section-more {
  flex: 0 0 auto; display: inline-flex; align-items: center; gap: 4px;
  height: 32px; padding: 0 10px; border: 1px solid var(--border);
  border-radius: 9px; background: #fff; color: var(--text-secondary);
  font-size: 12px; font-weight: 800; cursor: pointer; white-space: nowrap;
}
.section-more:hover { background: var(--gray-50); }

/* 빈 상태 */
.empty-box {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 32px 20px;
  text-align: center; color: var(--text-muted); font-size: 14px; font-weight: 600;
}
.empty-box p { margin: 0; line-height: 1.6; }
.empty-box--row { flex-direction: row; text-align: left; padding: 20px; }

/* ── 로그 탭 ── */
.log-tabs {
  display: flex; gap: 6px; margin-bottom: 14px;
}
.log-tab {
  display: inline-flex; align-items: center; gap: 5px;
  height: 32px; padding: 0 13px; border: 1.5px solid var(--border);
  border-radius: 999px; background: #fff;
  font-size: 12px; font-weight: 800; font-family: inherit;
  color: var(--text-secondary); cursor: pointer; transition: all .14s;
}
.log-tab:hover { background: var(--gray-50); }
.log-tab.active {
  border-color: var(--coral-500); background: var(--coral-500); color: #fff;
}
.tab-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 4px; border-radius: 999px;
  font-size: 10px; font-weight: 900;
  background: rgba(255,255,255,.25); color: inherit;
}
.log-tab:not(.active) .tab-count { background: var(--gray-100); color: var(--text-muted); }

/* ── 로그 카드 ── */
.log-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.log-card {
  border: 1px solid var(--border-subtle); border-radius: 14px;
  overflow: hidden; cursor: pointer; background: #fff;
  transition: box-shadow .14s, transform .14s;
}
.log-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.09); }

.log-thumb {
  position: relative; width: 100%; aspect-ratio: 4/3;
  overflow: hidden; background: #f2f1ef;
}
.log-thumb img { width: 100%; height: 100%; object-fit: cover; }
.log-thumb-blank {
  width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
}
.log-thumb-blank span { font-size: 12px; font-weight: 700; color: #c4bdb5; }

.vis-badge {
  position: absolute; top: 8px; left: 8px;
  padding: 3px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 800;
}
.vis-badge.pub  { background: rgba(236,253,245,.9); color: #065f46; }
.vis-badge.priv { background: rgba(243,244,246,.9); color: #6b7280; }

.log-body { padding: 11px 12px 12px; }
.log-region { margin: 0 0 2px; font-size: 11px; font-weight: 800; color: var(--coral-500); }
.log-title {
  margin: 0 0 6px; font-size: 13px; font-weight: 800; line-height: 1.4;
  overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
}
.log-stats { display: flex; gap: 10px; color: var(--text-muted); font-size: 11px; font-weight: 600; margin-bottom: 10px; }
.log-stats span { display: inline-flex; align-items: center; gap: 3px; }

.log-actions { display: flex; gap: 6px; }
.log-action-btn {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  height: 28px; border: 1px solid var(--border); border-radius: 7px;
  background: #fff; color: var(--text-secondary);
  font-size: 11px; font-weight: 800; cursor: pointer; font-family: inherit;
}
.log-action-btn:hover { background: var(--gray-50); }
.log-action-btn.danger { color: #ef4444; border-color: #fecaca; }
.log-action-btn.danger:hover { background: #fff5f5; }

/* 저장한 장소 */
.saved-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.saved-card {
  display: flex; align-items: center; gap: 10px; padding: 10px;
  border: 1px solid var(--border-subtle); border-radius: 12px;
}
.saved-card img { width: 48px; height: 48px; border-radius: 9px; object-fit: cover; flex: 0 0 auto; }
.saved-info { min-width: 0; flex: 1; }
.saved-info strong {
  display: block; font-size: 13px; font-weight: 800;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.saved-info span { display: block; margin-top: 2px; font-size: 11px; color: var(--text-muted); }


/* ── 반응형 ── */
@media (max-width: 820px) {
  .log-grid { grid-template-columns: repeat(2, 1fr); }
  .saved-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .profile-card { padding: 18px; gap: 14px; }
  .log-grid { grid-template-columns: 1fr; }
}
</style>
