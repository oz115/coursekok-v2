<script setup>
import { computed, inject, onMounted } from 'vue'
import { places } from '@/data/mockData.js'
import { useTripLogStore } from '@/stores/triplog.js'
import Avatar from '@/components/data-display/Avatar.vue'
import Badge from '@/components/core/Badge.vue'
import KkIcon from '@/components/icons/KkIcon.vue'

const auth = inject('auth')
const navigate = inject('navigate', () => {})
const showToast = inject('showToast', () => {})
const tripLogStore = useTripLogStore()

const userName = computed(() => auth?.user?.nickname || auth?.user?.name || '여행자')
const userEmail = computed(() => auth?.user?.email || 'traveler@coursekok.com')
const publicCount = computed(() => tripLogStore.myLogs.filter((l) => l.isPublic).length)
const privateCount = computed(() => tripLogStore.myLogs.filter((l) => !l.isPublic).length)

onMounted(() => tripLogStore.loadMyLogs())

function openMyLog(log) {
  tripLogStore.pendingLogId = log.id
  navigate('triplog')
}

async function toggleVisibility(log) {
  const next = !log.isPublic
  try {
    await tripLogStore.updateMyLogVisibility(log.id, next)
    showToast({ tone: 'success', message: next ? 'TripLog에 공개됐어요.' : '나만 보기로 변경했어요.' })
  } catch {
    showToast({ tone: 'default', message: '변경에 실패했어요. 다시 시도해주세요.' })
  }
}

async function logout() {
  await auth.logout()
  navigate('explore')
}
</script>

<template>
  <section class="mypage">
    <div class="shell">
      <header class="profile">
        <Avatar :name="userName" :size="86" :ring="true" />
        <div><span>MY PAGE</span><h1>{{ userName }}</h1><p>{{ userEmail }}</p></div>
        <button type="button"><KkIcon name="pencil" :size="16" /> 프로필 편집</button>
      </header>

      <div class="stats">
        <div><strong>{{ publicCount }}</strong><span>공개한 TripLog</span></div>
        <div><strong>{{ privateCount }}</strong><span>나만 보기</span></div>
        <div><strong>{{ tripLogStore.myLogs.length }}</strong><span>전체 기록</span></div>
      </div>

      <div class="content">
        <main>
          <section class="section">
            <div class="section-head">
              <div><h2>내 TripLog</h2><p>나만 보기와 공개 기록을 모두 확인하세요.</p></div>
              <button type="button" @click="navigate('triplog')">피드 보기 <KkIcon name="chevronR" :size="16" /></button>
            </div>
            <div v-if="tripLogStore.myLogsLoading" class="log-empty">불러오는 중...</div>
            <div v-else-if="tripLogStore.myLogs.length === 0" class="log-empty">아직 작성한 여행 기록이 없어요.</div>
            <div v-else class="log-grid">
              <article v-for="log in tripLogStore.myLogs.slice(0, 6)" :key="log.id" class="log-article" @click="openMyLog(log)">
                <div class="log-thumb" :class="{ 'no-img': !log.coverImage }">
                  <img v-if="log.coverImage" :src="log.coverImage" :alt="log.title">
                  <span v-else class="log-thumb-placeholder">{{ log.region }}</span>
                </div>
                <div class="log-info">
                  <div class="log-badge-row">
                    <Badge :tone="log.isPublic ? 'mint' : 'neutral'">{{ log.isPublic ? '공개' : '나만보기' }}</Badge>
                    <Badge tone="coral">{{ log.region }}</Badge>
                  </div>
                  <h3>{{ log.title }}</h3>
                  <span>좋아요 {{ log.likeCount }} · 댓글 {{ log.commentCount }}</span>
                  <button
                    class="vis-toggle"
                    :class="log.isPublic ? 'is-public' : 'is-private'"
                    type="button"
                    @click.stop="toggleVisibility(log)"
                  >{{ log.isPublic ? '비공개로 전환' : 'TripLog에 공개' }}</button>
                </div>
              </article>
            </div>
          </section>

          <section class="section">
            <div class="section-head"><div><h2>좋아요한 장소·코스</h2><p>다음 여행에 참고하려고 모아둔 항목이에요.</p></div></div>
            <div class="saved-row">
              <article v-for="place in places.slice(0, 4)" :key="place.id">
                <img :src="place.img" :alt="place.title">
                <div><strong>{{ place.title }}</strong><span>{{ place.region }}</span></div>
                <KkIcon name="heart" :size="18" color="var(--coral-500)" />
              </article>
            </div>
          </section>
        </main>

        <aside>
          <button type="button"><KkIcon name="user" :size="20" /><span><strong>프로필 편집</strong><small>닉네임과 소개를 수정해요</small></span><KkIcon name="chevronR" :size="17" /></button>
          <button type="button"><KkIcon name="bell" :size="20" /><span><strong>알림 설정</strong><small>댓글과 좋아요 알림을 관리해요</small></span><KkIcon name="chevronR" :size="17" /></button>
          <button type="button"><KkIcon name="lock" :size="20" /><span><strong>공개 범위</strong><small>여행 기록 기본 공개 설정</small></span><KkIcon name="chevronR" :size="17" /></button>
          <button type="button" class="logout" @click="logout"><KkIcon name="undo" :size="20" /><span><strong>로그아웃</strong><small>현재 계정에서 나갑니다</small></span></button>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mypage{min-height:calc(100vh - 68px);background:var(--bg-base)}.shell{width:min(100%,1160px);margin:0 auto;padding:36px 20px 80px}.profile{display:flex;align-items:center;gap:20px;padding:27px 30px;border:1px solid #f1e4db;border-radius:26px;background:linear-gradient(120deg,#fff0e8,#fff 65%,#e9faf5)}.profile>div{flex:1}.profile span{color:var(--coral-600);font-size:12px;font-weight:900;letter-spacing:.12em}.profile h1{margin:4px 0 2px;font-size:28px;font-weight:900}.profile p{color:var(--text-muted)}.profile button,.section-head button{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:11px;background:#fff;color:var(--text-secondary);font-weight:800;cursor:pointer}.profile button{height:42px;padding:0 14px}.stats{display:grid;grid-template-columns:repeat(3,1fr);margin:18px 0 24px;overflow:hidden;border:1px solid var(--border-subtle);border-radius:18px;background:#fff}.stats div{padding:18px;text-align:center;border-right:1px solid var(--border-subtle)}.stats div:last-child{border-right:0}.stats strong,.stats span{display:block}.stats strong{color:var(--coral-600);font-size:24px}.stats span{margin-top:2px;color:var(--text-muted);font-size:12px;font-weight:700}.content{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:22px;align-items:start}.section{padding:22px;margin-bottom:18px;border:1px solid var(--border-subtle);border-radius:20px;background:#fff}.section-head{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:16px}.section-head h2{font-size:19px}.section-head p{margin-top:3px;color:var(--text-muted);font-size:13px}.section-head button{padding:8px 10px;font-size:12px}.log-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.log-grid article{overflow:hidden;border:1px solid var(--border-subtle);border-radius:15px}.log-grid img{width:100%;aspect-ratio:1.5;object-fit:cover}.log-grid article div{padding:11px}.log-grid h3{min-height:39px;margin:7px 0;font-size:14px}.log-grid article span:last-child{color:var(--text-muted);font-size:11px}.log-badge-row{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:5px}.log-empty{padding:24px;text-align:center;color:var(--text-muted);font-size:14px}.log-article{cursor:pointer;transition:transform .14s}.log-article:hover{transform:translateY(-2px)}.log-thumb{width:100%;aspect-ratio:1.5;overflow:hidden;position:relative;border-radius:12px 12px 0 0;background:linear-gradient(135deg,#d8f6f5,#fde9df)}.log-thumb img{width:100%;height:100%;object-fit:cover}.log-thumb.no-img{display:flex;align-items:center;justify-content:center}.log-thumb-placeholder{font-size:13px;font-weight:900;color:var(--mint-700)}.log-info{padding:11px}.vis-toggle{display:block;width:100%;margin-top:8px;padding:6px 0;border-radius:8px;border:0;font-size:11px;font-weight:800;cursor:pointer}.vis-toggle.is-public{background:var(--gray-100);color:var(--text-muted)}.vis-toggle.is-private{background:var(--mint-50);color:var(--mint-700)}.saved-row{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.saved-row article{display:flex;align-items:center;gap:10px;padding:9px;border:1px solid var(--border-subtle);border-radius:13px}.saved-row img{width:52px;height:52px;border-radius:10px;object-fit:cover}.saved-row article div{min-width:0;flex:1}.saved-row strong,.saved-row span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.saved-row strong{font-size:13px}.saved-row span{margin-top:2px;color:var(--text-muted);font-size:11px}aside{overflow:hidden;border:1px solid var(--border-subtle);border-radius:20px;background:#fff;box-shadow:var(--shadow-sm)}aside button{display:flex;align-items:center;width:100%;gap:11px;padding:16px;border:0;border-bottom:1px solid var(--border-subtle);background:#fff;color:var(--text-secondary);text-align:left;cursor:pointer}aside button:last-child{border-bottom:0}aside button:hover{background:var(--gray-50)}aside button span{flex:1}aside strong,aside small{display:block}aside strong{color:var(--text-primary);font-size:14px}aside small{margin-top:2px;color:var(--text-muted)}aside .logout,aside .logout strong{color:var(--red-500)}@media(max-width:820px){.profile{align-items:flex-start;flex-wrap:wrap}.content{grid-template-columns:1fr}.log-grid,.saved-row{grid-template-columns:1fr}}
</style>
