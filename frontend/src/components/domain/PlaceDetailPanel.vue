<script setup>
import { ref } from 'vue'
import KkIcon from '@/components/icons/KkIcon.vue'
import Rating from '@/components/data-display/Rating.vue'

defineProps({
  place: { type: Object, required: true },
  saved: { type: Boolean, required: true },
})

const emit = defineEmits(['back', 'toggleSave'])

const isLeaving = ref(false)

function handleBack() {
  if (isLeaving.value) return
  isLeaving.value = true
  window.setTimeout(() => {
    emit('back')
  }, 220)
}
</script>

<template>
  <section class="detail-panel" :class="{ 'detail-panel--leaving': isLeaving }">
    <button type="button" class="back-button" @click="handleBack">
      <KkIcon name="chevronL" :size="17" />
      장소 목록으로
    </button>

    <div class="detail-cover">
      <img :src="place.img" :alt="place.title" />
      <div class="cover-gradient" />
      <div class="cover-copy">
        <span>{{ place.cat }}</span>
        <h2>{{ place.title }}</h2>
        <p><KkIcon name="pin" :size="15" /> {{ place.region }}</p>
      </div>
    </div>

    <div class="detail-body">
      <div class="detail-meta">
        <Rating
          :model-value="place.rating"
          :show-value="true"
          :count="place.reviews"
          :size="18"
          :readonly="true"
        />
        <span class="meta-divider" />
        <span><KkIcon name="check" :size="15" /> 관광공사 인증</span>
      </div>

      <p class="detail-description">{{ place.desc }}</p>

      <div v-if="place.tags.length" class="detail-tags">
        <span v-for="tag in place.tags" :key="tag">#{{ tag }}</span>
      </div>

      <div class="detail-actions">
        <button
          type="button"
          class="save-detail-button"
          :class="{ saved }"
          @click="$emit('toggleSave')"
        >
          <KkIcon :name="saved ? 'check' : 'bookmark'" :size="18" />
          {{ saved ? '여행 바구니에 담김' : '여행 바구니에 담기' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.detail-panel {
  overflow: hidden;
  margin-top: 30px;
  border: 1px solid var(--border-subtle);
  border-radius: 22px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  animation: detail-enter 220ms var(--ease-out);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 16px 18px 12px;
  padding: 7px 9px;
  border: 0;
  border-radius: 9px;
  background: var(--gray-50);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
}

.detail-cover {
  position: relative;
  height: 300px;
  margin: 0 18px;
  overflow: hidden;
  border-radius: 18px;
  background: var(--gray-100);
}

.detail-cover > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(26, 22, 17, 0.72), transparent 58%);
}

.cover-copy {
  position: absolute;
  right: 22px;
  bottom: 20px;
  left: 22px;
  color: #fff;
}

.cover-copy > span {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 999px;
  background: var(--coral-500);
  font-size: 11px;
  font-weight: 900;
}

.cover-copy h2 {
  margin-top: 9px;
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 900;
  line-height: 1.2;
}

.cover-copy p {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 13px;
}

.detail-body {
  padding: 22px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.detail-meta > span:last-child {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--mint-600);
  font-size: 12px;
  font-weight: 800;
}

.meta-divider {
  width: 1px;
  height: 17px;
  background: var(--border);
}

.detail-description {
  margin-top: 20px;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.8;
  white-space: pre-line;
}

.detail-tags {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.detail-tags span {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--gray-50);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
}

.detail-actions {
  position: sticky;
  bottom: 10px;
  margin-top: 24px;
  padding-top: 12px;
  background: linear-gradient(transparent, #fff 28%);
}

.save-detail-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  min-height: 48px;
  border: 0;
  border-radius: 14px;
  background: var(--coral-500);
  box-shadow: 0 8px 20px rgba(255, 107, 61, 0.2);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 900;
}

.save-detail-button.saved {
  background: var(--mint-600);
  box-shadow: 0 8px 20px rgba(6, 165, 130, 0.18);
}

.detail-panel--leaving {
  pointer-events: none;
  animation: detail-leave 220ms var(--ease-out) forwards;
}

@keyframes detail-enter {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
}

@keyframes detail-leave {
  to {
    opacity: 0;
    transform: translateX(-18px);
  }
}

@media (max-width: 640px) {
  .detail-panel {
    margin-top: 22px;
  }

  .detail-cover {
    height: 240px;
    margin: 0 12px;
  }

  .detail-body {
    padding: 18px;
  }
}
</style>
