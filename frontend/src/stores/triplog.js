import { defineStore } from 'pinia'
import * as triplogApi from '@/api/triplog.js'

export const useTripLogStore = defineStore('triplog', {
  state: () => ({
    feed: [],
    myLogs: [],
    myLogsLoading: false,
    pendingLogId: null,
    currentLog: null,
    comments: [],
    filter: 'recent',
    page: 0,
    hasMore: true,
    loading: false,
    error: null,
  }),

  actions: {
    /** 피드 처음부터 로드 (필터 변경 시) */
    async loadFeed(filter = 'recent') {
      this.filter = filter
      this.page = 0
      this.hasMore = true
      this.loading = true
      this.error = null
      try {
        const res = await triplogApi.getFeed({ filter, page: 0 })
        this.feed = res.content ?? res.data ?? res
        this.hasMore = !res.last
        this.page = 1
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    /** 다음 페이지 로드 (무한 스크롤) */
    async loadMore() {
      if (!this.hasMore || this.loading) return
      this.loading = true
      try {
        const res = await triplogApi.getFeed({ filter: this.filter, page: this.page })
        const items = res.content ?? res.data ?? res
        this.feed = [...this.feed, ...items]
        this.hasMore = !res.last
        this.page++
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    /** 내 여행기 목록 (공개 + 비공개) */
    async loadMyLogs() {
      this.myLogsLoading = true
      this.error = null
      try {
        const res = await triplogApi.getMyTripLogs()
        this.myLogs = Array.isArray(res) ? res : (res.content ?? res.data ?? [])
      } catch (e) {
        this.error = e.message
      } finally {
        this.myLogsLoading = false
      }
    },

    /** 상세 조회 */
    async loadDetail(id) {
      this.loading = true
      this.error = null
      try {
        this.currentLog = await triplogApi.getTripLogDetail(id)
        return this.currentLog
      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    /** 여행기 발행 */
    async publish(data) {
      this.loading = true
      this.error = null
      try {
        const created = await triplogApi.createTripLog(data)
        if (created.isPublic) {
          this.feed = [created, ...this.feed]
        }
        return created
      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    /** 좋아요 토글 */
    async toggleLike(id) {
      try {
        const res = await (this._isLiked(id)
          ? triplogApi.unlikeTripLog(id)
          : triplogApi.likeTripLog(id))
        this._updateFeedItem(id, { liked: res.liked, likeCount: this._item(id)?.likeCount + (res.liked ? 1 : -1) })
        if (this.currentLog?.id === id) {
          this.currentLog.liked = res.liked
          this.currentLog.likeCount += res.liked ? 1 : -1
        }
        return res.liked
      } catch (e) {
        this.error = e.message
      }
    },

    /** 북마크 토글 */
    async toggleBookmark(id) {
      try {
        const res = await (this._isBookmarked(id)
          ? triplogApi.unbookmarkTripLog(id)
          : triplogApi.bookmarkTripLog(id))
        this._updateFeedItem(id, { bookmarked: res.bookmarked, copyCount: this._item(id)?.copyCount + (res.bookmarked ? 1 : -1) })
        if (this.currentLog?.id === id) {
          this.currentLog.bookmarked = res.bookmarked
          this.currentLog.copyCount += res.bookmarked ? 1 : -1
        }
        return res.bookmarked
      } catch (e) {
        this.error = e.message
      }
    },

    /** 내 여행기 삭제 */
    async deleteMyLog(id) {
      try {
        await triplogApi.deleteTripLog(id)
        this.myLogs = this.myLogs.filter((l) => l.id !== id)
        this.feed = this.feed.filter((l) => l.id !== id)
      } catch (e) {
        this.error = e.message
        throw e
      }
    },

    /** 내 여행기 수정 */
    async updateMyLog(id, data) {
      try {
        const updated = await triplogApi.updateTripLog(id, data)
        const idx = this.myLogs.findIndex((l) => l.id === id)
        if (idx >= 0) this.myLogs[idx] = { ...this.myLogs[idx], ...updated }
        return updated
      } catch (e) {
        this.error = e.message
        throw e
      }
    },

    /** 공개 여부 변경 */
    async updateMyLogVisibility(id, isPublic) {
      try {
        const updated = await triplogApi.updateTripLogVisibility(id, isPublic)
        const idx = this.myLogs.findIndex((l) => l.id === id)
        if (idx >= 0) this.myLogs[idx] = updated
        return updated
      } catch (e) {
        this.error = e.message
        throw e
      }
    },

    /** 댓글 목록 로드 */
    async loadComments(id, page = 0) {
      try {
        const res = await triplogApi.getComments(id, page)
        this.comments = res.content ?? res.data ?? res
      } catch (e) {
        this.error = e.message
      }
    },

    /** 댓글 작성 */
    async addComment(id, content) {
      try {
        const comment = await triplogApi.addComment(id, content)
        this.comments = [comment, ...this.comments]
        return comment
      } catch (e) {
        this.error = e.message
        throw e
      }
    },

    /** 댓글 삭제 */
    async deleteComment(id, commentId) {
      try {
        await triplogApi.deleteComment(id, commentId)
        this.comments = this.comments.filter((c) => c.id !== commentId)
      } catch (e) {
        this.error = e.message
      }
    },

    // ── 내부 헬퍼 ────────────────────────────────────────────────────────
    _item(id)           { return this.feed.find((f) => f.id === id) },
    _isLiked(id)        { return this._item(id)?.liked ?? this.currentLog?.liked ?? false },
    _isBookmarked(id)   { return this._item(id)?.bookmarked ?? this.currentLog?.bookmarked ?? false },
    _updateFeedItem(id, patch) {
      const idx = this.feed.findIndex((f) => f.id === id)
      if (idx >= 0) this.feed[idx] = { ...this.feed[idx], ...patch }
    },
  },
})
