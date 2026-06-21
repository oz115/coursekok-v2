<script setup>
/**
 * JournalBlock.vue — 여행 장소별 기록(추억) CRUD 블록
 * ─────────────────────────────────────────────────────────────
 * 원본: raw-wireframe/output/scripts/Journal.js
 *
 * Props:
 *   - entries     : Array<{ id, photos, text, rating }> — 초기 기록 배열
 *
 * Emits:
 *   - update:entries : 변경된 entries 배열 전체 (v-model 지원)
 *
 * 내부 구성:
 *   - EntryEditor : 새 기록 작성 / 기존 기록 수정 폼
 *   - EntryView   : 저장된 기록 읽기(수정·삭제 버튼 포함)
 *
 * React → Vue 주요 변환 포인트:
 *   ┌─────────────────────────────────────────────────────────┐
 *   │ React                  │ Vue 3                          │
 *   ├─────────────────────────────────────────────────────────┤
 *   │ React.useState(null)   │ ref(null)                      │
 *   │ React.useState([])     │ ref([])                        │
 *   │ onChange(newEntries)   │ emit('update:entries', ...)    │
 *   │ 중첩 컴포넌트          │ 동일 SFC 내 <template> 분리    │
 *   │ onSave / onCancel prop │ emit('save') / emit('cancel')  │
 *   └─────────────────────────────────────────────────────────┘
 *
 * PhotoUploader · StarPick (원본 window.Kit 의존):
 *   프로토타입 원본은 window.Kit.PhotoUploader / StarPick을 사용하나,
 *   현재 Vue 마이그레이션 단계에서는 자체 인라인 구현체로 대체한다.
 *   - PhotoUploader → 로컬 파일 input + ObjectURL 미리보기
 *   - StarPick → Rating.vue (기존 컴포넌트 재사용, readonly 해제)
 */

import { ref, computed } from 'vue'
import Button from '@/components/core/Button.vue'
import Rating from '@/components/data-display/Rating.vue'

// ── Props & Emits ─────────────────────────────────────────────────────────────
const props = defineProps({
  /** 초기 기록 배열 — v-model:entries 지원 */
  entries: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:entries'])

// ── 유틸리티 ──────────────────────────────────────────────────────────────────
const uid = () => 'e' + Math.random().toString(36).slice(2, 8)

// ── 에디터 모드 상태 ──────────────────────────────────────────────────────────
// null: 닫힘, 'new': 새 항목 작성, string(id): 해당 항목 수정 중
const mode = ref(null)

// ── 에디터 폼 로컬 상태 ───────────────────────────────────────────────────────
// EntryEditor를 별도 SFC로 분리하는 대신 동일 파일에 ref + computed로 관리.
// 이유: 단일 파일 내 상태가 작고, 부모-자식 prop 드릴링을 줄이기 위함.
const editorPhotos = ref([])
const editorText   = ref('')
const editorRating = ref(5)

/** 현재 수정 중인 기존 항목 (있으면 initial 데이터로 사용) */
const editingEntry = computed(() =>
  typeof mode.value === 'string' && mode.value !== 'new'
    ? props.entries.find((e) => e.id === mode.value) ?? null
    : null
)

/** 저장 버튼 활성화 조건 */
const canSave = computed(
  () => editorText.value.trim().length > 0 || editorPhotos.value.length > 0
)

// ── 에디터 열기 / 닫기 ────────────────────────────────────────────────────────
function openNew() {
  editorPhotos.value = []
  editorText.value   = ''
  editorRating.value = 5
  mode.value = 'new'
}

function openEdit(entry) {
  editorPhotos.value = [...(entry.photos ?? [])]
  editorText.value   = entry.text ?? ''
  editorRating.value = entry.rating ?? 5
  mode.value = entry.id
}

function cancelEditor() {
  mode.value = null
}

// ── CRUD 핸들러 ───────────────────────────────────────────────────────────────
// React의 `onChange([...entries, newEntry])` 패턴을 Vue emit으로 1:1 치환.
// 상위 컴포넌트에서 v-model:entries="journalEntries" 로 바인딩.

function saveEntry() {
  const entry = {
    id: editingEntry.value ? editingEntry.value.id : uid(),
    photos: [...editorPhotos.value],
    text: editorText.value.trim(),
    rating: editorRating.value,
  }

  if (editingEntry.value) {
    // 수정
    emit('update:entries', props.entries.map((e) => (e.id === entry.id ? entry : e)))
  } else {
    // 추가
    emit('update:entries', [...props.entries, entry])
  }

  mode.value = null
}

function deleteEntry(id) {
  emit('update:entries', props.entries.filter((e) => e.id !== id))
}

// ── 사진 업로드 (PhotoUploader 대체) ─────────────────────────────────────────
// 원본 window.Kit.PhotoUploader는 내부 base64 변환 로직을 사용하지만,
// Vue 환경에서는 FileReader API + Object URL로 동일 UX를 구현한다.
const MAX_PHOTOS = 4

function onPhotoInput(event) {
  const files = Array.from(event.target.files ?? [])
  const remaining = MAX_PHOTOS - editorPhotos.value.length
  files.slice(0, remaining).forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      editorPhotos.value = [...editorPhotos.value, e.target.result]
    }
    reader.readAsDataURL(file)
  })
  // input을 초기화해서 동일 파일 재선택 가능하게 함
  event.target.value = ''
}

function removePhoto(index) {
  editorPhotos.value = editorPhotos.value.filter((_, i) => i !== index)
}

// ── 아이콘 버튼 공용 스타일 ──────────────────────────────────────────────────
const iconBtnStyle = {
  border: 'none',
  background: 'var(--gray-50)',
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 10px;">

    <!-- ── 저장된 기록 목록 ──────────────────────────────────────────────── -->
    <template v-for="entry in entries" :key="entry.id">

      <!-- 수정 모드일 때: EntryEditor -->
      <div
        v-if="mode === entry.id"
        style="
          background: var(--coral-50);
          border-radius: var(--radius-lg);
          border: 1.5px solid var(--coral-100);
          padding: 16px;
        "
      >
        <!-- 만족도 별점 -->
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--coral-700);">만족도</span>
          <Rating v-model="editorRating" :size="24" />
        </div>

        <!-- 사진 업로더 -->
        <div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
            <div
              v-for="(src, i) in editorPhotos"
              :key="i"
              style="position: relative; width: 72px; height: 72px;"
            >
              <img
                :src="src"
                alt=""
                style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm);"
              />
              <button
                @click="removePhoto(i)"
                style="
                  position: absolute; top: -6px; right: -6px;
                  width: 20px; height: 20px; border-radius: 50%;
                  border: none; background: var(--gray-800); color: #fff;
                  cursor: pointer; display: flex; align-items: center; justify-content: center;
                  font-size: 11px;
                "
              >✕</button>
            </div>

            <!-- 사진 추가 버튼 (최대 4장) -->
            <label
              v-if="editorPhotos.length < MAX_PHOTOS"
              style="
                width: 72px; height: 72px;
                border: 1.5px dashed var(--border);
                border-radius: var(--radius-sm);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                cursor: pointer; color: var(--text-muted); font-size: 11px; gap: 4px;
              "
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              사진 추가
              <input type="file" accept="image/*" multiple style="display: none;" @change="onPhotoInput" />
            </label>
          </div>
        </div>

        <!-- 텍스트 입력 -->
        <textarea
          v-model="editorText"
          rows="3"
          placeholder="이곳에서의 순간을 기록해보세요. 무엇이 좋았나요?"
          style="
            width: 100%; margin-top: 12px;
            padding: 12px 14px;
            border: 1.5px solid var(--border);
            border-radius: var(--radius-md);
            resize: vertical; font-size: 14.5px;
            font-family: var(--font-sans); line-height: 1.6;
            outline: none; background: var(--surface);
            box-sizing: border-box;
          "
        />

        <!-- 에디터 액션 버튼 -->
        <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px;">
          <Button variant="ghost" size="sm" @click="cancelEditor">취소</Button>
          <Button
            variant="primary"
            size="sm"
            :disabled="!canSave"
            @click="saveEntry"
          >
            <template #left-icon>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </template>
            수정 완료
          </Button>
        </div>
      </div>

      <!-- 읽기 모드: EntryView -->
      <div
        v-else
        style="
          background: var(--surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-xs);
          padding: 14px;
        "
      >
        <!-- 별점 + 수정/삭제 버튼 행 -->
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <Rating :model-value="entry.rating" :size="16" :readonly="true" />
          <div style="flex: 1;" />
          <!-- 수정 버튼 -->
          <button :style="iconBtnStyle" @click="openEdit(entry)" aria-label="수정">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <!-- 삭제 버튼 -->
          <button :style="iconBtnStyle" @click="deleteEntry(entry.id)" aria-label="삭제">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>

        <!-- 첨부 사진 그리드 -->
        <div
          v-if="entry.photos && entry.photos.length > 0"
          style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;"
        >
          <img
            v-for="(src, i) in entry.photos"
            :key="i"
            :src="src"
            alt=""
            style="
              width: calc(33.333% - 6px); max-width: 150px;
              aspect-ratio: 1; object-fit: cover;
              border-radius: var(--radius-md);
            "
          />
        </div>

        <!-- 텍스트 기록 -->
        <p
          v-if="entry.text"
          style="
            font-size: 14.5px; color: var(--text-secondary);
            line-height: 1.65; white-space: pre-wrap;
          "
        >{{ entry.text }}</p>
      </div>
    </template>

    <!-- ── 새 기록 작성 에디터 ────────────────────────────────────────────── -->
    <div
      v-if="mode === 'new'"
      style="
        background: var(--coral-50);
        border-radius: var(--radius-lg);
        border: 1.5px solid var(--coral-100);
        padding: 16px;
      "
    >
      <!-- 만족도 별점 -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <span style="font-size: 13px; font-weight: 700; color: var(--coral-700);">만족도</span>
        <Rating v-model="editorRating" :size="24" />
      </div>

      <!-- 사진 업로더 -->
      <div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
          <div
            v-for="(src, i) in editorPhotos"
            :key="i"
            style="position: relative; width: 72px; height: 72px;"
          >
            <img
              :src="src"
              alt=""
              style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm);"
            />
            <button
              @click="removePhoto(i)"
              style="
                position: absolute; top: -6px; right: -6px;
                width: 20px; height: 20px; border-radius: 50%;
                border: none; background: var(--gray-800); color: #fff;
                cursor: pointer; display: flex; align-items: center; justify-content: center;
                font-size: 11px;
              "
            >✕</button>
          </div>
          <label
            v-if="editorPhotos.length < MAX_PHOTOS"
            style="
              width: 72px; height: 72px;
              border: 1.5px dashed var(--border);
              border-radius: var(--radius-sm);
              display: flex; flex-direction: column; align-items: center; justify-content: center;
              cursor: pointer; color: var(--text-muted); font-size: 11px; gap: 4px;
            "
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            사진 추가
            <input type="file" accept="image/*" multiple style="display: none;" @change="onPhotoInput" />
          </label>
        </div>
      </div>

      <!-- 텍스트 입력 -->
      <textarea
        v-model="editorText"
        rows="3"
        placeholder="이곳에서의 순간을 기록해보세요. 무엇이 좋았나요?"
        style="
          width: 100%; margin-top: 12px;
          padding: 12px 14px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          resize: vertical; font-size: 14.5px;
          font-family: var(--font-sans); line-height: 1.6;
          outline: none; background: var(--surface);
          box-sizing: border-box;
        "
      />

      <!-- 에디터 액션 버튼 -->
      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px;">
        <Button variant="ghost" size="sm" @click="cancelEditor">취소</Button>
        <Button
          variant="primary"
          size="sm"
          :disabled="!canSave"
          @click="saveEntry"
        >
          <template #left-icon>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </template>
          기록 저장
        </Button>
      </div>
    </div>

    <!-- ── 기록 추가 버튼 (에디터가 닫혀 있을 때) ────────────────────────── -->
    <button
      v-else
      @click="openNew"
      style="
        display: flex; align-items: center; justify-content: center; gap: 7px;
        width: 100%; padding: 11px 0;
        border-radius: var(--radius-md);
        border: 1.5px dashed var(--coral-200);
        background: transparent;
        color: var(--coral-600);
        cursor: pointer; font-weight: 700; font-size: 13.5px;
        font-family: var(--font-sans);
        transition: background var(--dur-fast) var(--ease-out);
      "
    >
      <!-- Camera 아이콘 -->
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
      {{ entries.length ? '기록 더 남기기' : '사진·후기 기록하기' }}
    </button>

  </div>
</template>
