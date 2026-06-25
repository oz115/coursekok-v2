<script setup>
import { computed, inject, onMounted, ref } from 'vue'
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

onMounted(() => tripLogStore.loadMyLogs())

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

async function openMyLog(log) {
  showMyLogPanel.value = true
  selectedMyLog.value = null
  selectedMyLogLoading.value = true
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

// ── TripLog 수정 모달 ─────────────────────────────────────────────────
const editingLog = ref(null)
const editLogTitle = ref('')
const editLogContent = ref('')
const editLogIsPublic = ref(true)
const editLogSaving = ref(false)

function openEditLog(log) {
  editingLog.value = log
  editLogTitle.value = log.title || ''
  editLogContent.value = log.content || ''
  editLogIsPublic.value = log.isPublic ?? true
}

function closeEditLog() { editingLog.value = null }

async function saveEditLog() {
  if (!editLogTitle.value.trim()) { showToast({ tone: 'default', message: '제목을 입력해 주세요.' }); return }
  editLogSaving.value = true
  try {
    await tripLogStore.updateMyLog(editingLog.value.id, {
      title: editLogTitle.value.trim(),
      content: editLogContent.value.trim(),
      region: editingLog.value.region,
      isPublic: editLogIsPublic.value,
      travelStyle: editingLog.value.travelStyle,
      coverImage: editingLog.value.coverImage,
      mood: editingLog.value.mood,
    })
    showToast({ tone: 'success', message: '여행 기록이 수정됐어요.' })
    closeEditLog()
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
  <!-- ── 내 TripLog 상세 모달 ── -->
  <Teleport to="body">
    <div v-if="showMyLogPanel" class="overlay" @click.self="closeMyLog">
      <div class="panel mylog-panel">
        <div class="panel-header">
          <span class="panel-title">여행 기록</span>
          <div class="panel-actions">
            <button
              v-if="selectedMyLog"
              type="button"
              class="vis-chip"
              :class="selectedMyLog.isPublic ? 'is-public' : 'is-private'"
              @click="toggleDetailVisibility"
            >{{ selectedMyLog.isPublic ? '비공개로 전환' : '공개로 전환' }}</button>
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
          <div class="mylog-cover" :class="{ 'no-img': !selectedMyLog.coverImage }">
            <img v-if="selectedMyLog.coverImage" :src="selectedMyLog.coverImage" :alt="selectedMyLog.title" />
            <div v-else class="mylog-cover-blank">
              <KkIcon name="image" :size="36" color="#b8b0a8" />
              <span>{{ selectedMyLog.region }}</span>
            </div>
          </div>

          <div class="mylog-body">
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
            <div v-if="selectedMyLog.placeLogs?.length" class="mylog-places">
              <h3>여행의 기록</h3>
              <div v-for="pl in selectedMyLog.placeLogs" :key="pl.id" class="mylog-place">
                <div class="mylog-place-head">
                  <span v-if="pl.placeCategory" class="place-cat">{{ pl.placeCategory }}</span>
                  <strong>{{ pl.placeTitle }}</strong>
                </div>
                <img v-if="pl.imageUrl" :src="pl.imageUrl" :alt="pl.placeTitle" class="mylog-place-img" />
                <p v-if="pl.reviewContent">{{ pl.reviewContent }}</p>
              </div>
            </div>
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

  <!-- ── TripLog 수정 모달 ── -->
  <Teleport to="body">
    <div v-if="editingLog" class="overlay" @click.self="closeEditLog">
      <div class="panel edit-log-panel">
        <div class="panel-header">
          <span class="panel-title">여행 기록 수정</span>
          <button type="button" class="icon-btn" @click="closeEditLog">
            <KkIcon name="x" :size="18" />
          </button>
        </div>
        <div class="edit-body">
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
            rows="5"
          />

          <div class="visibility-row">
            <span class="vis-label">공개 설정</span>
            <button
              type="button"
              class="vis-chip"
              :class="editLogIsPublic ? 'is-private' : 'is-public'"
              @click="editLogIsPublic = !editLogIsPublic"
            >
              {{ editLogIsPublic ? '공개' : '나만 보기' }}
            </button>
          </div>
        </div>
        <div class="panel-footer">
          <button type="button" class="btn btn-ghost" @click="closeEditLog">취소</button>
          <button type="button" class="btn btn-primary" :disabled="editLogSaving" @click="saveEditLog">
            {{ editLogSaving ? '저장 중...' : '저장' }}
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
        <div class="profile-avatar-wrap">
          <Avatar :name="userName" :src="userProfileImage" :size="80" :ring="true" />
        </div>
        <div class="profile-info">
          <span class="profile-label">MY PAGE</span>
          <h1>{{ userName }}</h1>
          <p>{{ userEmail }}</p>
        </div>
        <div class="profile-mascot" aria-hidden="true">
          <Mascot variant="saved" :size="76" />
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
                <p>나만 보기 포함 전체 여행 기록이에요.</p>
              </div>
              <button type="button" class="section-more" @click="navigate('triplog')">
                피드 보기 <KkIcon name="chevronR" :size="15" />
              </button>
            </div>

            <div v-if="tripLogStore.myLogsLoading" class="empty-box">불러오는 중...</div>
            <div v-else-if="tripLogStore.myLogs.length === 0" class="empty-box">
              <Mascot variant="wink" :size="48" />
              <p>아직 작성한 여행 기록이 없어요.<br>첫 TripLog를 남겨보세요!</p>
            </div>
            <div v-else class="log-grid">
              <article
                v-for="log in tripLogStore.myLogs.slice(0, 6)"
                :key="log.id"
                class="log-card"
                @click="openMyLog(log)"
              >
                <div class="log-thumb" :class="{ 'no-img': !log.coverImage }">
                  <img v-if="log.coverImage" :src="log.coverImage" :alt="log.title" />
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

        <!-- 사이드 메뉴 -->
        <aside class="side-menu">
          <button type="button" @click="openProfileEdit">
            <KkIcon name="user" :size="20" />
            <span class="menu-text">
              <strong>프로필 편집</strong>
              <small>닉네임 · 프로필 사진 변경</small>
            </span>
            <KkIcon name="chevronR" :size="16" color="var(--text-muted)" />
          </button>
          <button type="button" @click="navigate('triplog')">
            <KkIcon name="route" :size="20" />
            <span class="menu-text">
              <strong>TripLog 피드</strong>
              <small>공개된 여행 기록 탐색</small>
            </span>
            <KkIcon name="chevronR" :size="16" color="var(--text-muted)" />
          </button>
          <button type="button" class="menu-logout" @click="logout">
            <KkIcon name="undo" :size="20" />
            <span class="menu-text">
              <strong>로그아웃</strong>
              <small>현재 계정에서 나갑니다</small>
            </span>
          </button>
        </aside>
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
.edit-log-panel { width: min(520px, 96vw); }

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
  border: 1px solid var(--border-subtle); border-radius: 22px;
  background: #fff; overflow: hidden;
}
.profile-card::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 4px; background: var(--coral-500);
}
.profile-avatar-wrap { flex: 0 0 auto; }
.profile-info { flex: 1; min-width: 0; }
.profile-label {
  display: inline-block; margin-bottom: 4px;
  font-size: 11px; font-weight: 900; letter-spacing: .1em; color: var(--coral-500);
}
.profile-info h1 { margin: 0 0 3px; font-size: 24px; font-weight: 900; }
.profile-info p { margin: 0; color: var(--text-muted); font-size: 13px; }
.profile-mascot { flex: 0 0 auto; align-self: flex-end; margin-bottom: -8px; }

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
.content-grid { display: grid; grid-template-columns: minmax(0,1fr) 260px; gap: 20px; align-items: start; }

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

/* ── 사이드 메뉴 ── */
.side-menu {
  border: 1px solid var(--border-subtle); border-radius: 18px;
  background: #fff; overflow: hidden;
}
.side-menu button {
  display: flex; align-items: center; width: 100%;
  gap: 12px; padding: 15px 16px;
  border: 0; border-bottom: 1px solid var(--border-subtle);
  background: #fff; text-align: left; cursor: pointer; font-family: inherit;
}
.side-menu button:last-child { border-bottom: 0; }
.side-menu button:hover { background: var(--gray-50); }
.menu-text { flex: 1; }
.menu-text strong { display: block; font-size: 14px; font-weight: 800; color: var(--text-primary); }
.menu-text small  { display: block; margin-top: 2px; font-size: 11px; color: var(--text-muted); }
.menu-logout .menu-text strong { color: #ef4444; }

/* ── 반응형 ── */
@media (max-width: 820px) {
  .profile-mascot { display: none; }
  .content-grid { grid-template-columns: 1fr; }
  .log-grid { grid-template-columns: repeat(2, 1fr); }
  .saved-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .profile-card { padding: 18px; }
  .log-grid { grid-template-columns: 1fr; }
}
</style>
