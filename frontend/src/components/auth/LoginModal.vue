<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import Button from '@/components/core/Button.vue'
import Input from '@/components/forms/Input.vue'
import Checkbox from '@/components/forms/Checkbox.vue'
import KkIcon from '@/components/icons/KkIcon.vue'
import Mascot from '@/components/brand/Mascot.vue'

const emit = defineEmits(['success', 'close', 'need-signup'])

const auth = useAuthStore()
const SAVED_EMAIL_KEY = 'kok_saved_email'

const email = ref('')
const password = ref('')
const rememberEmail = ref(false)
const formError = ref('')

onMounted(() => {
  const saved = localStorage.getItem(SAVED_EMAIL_KEY)
  if (saved) {
    email.value = saved
    rememberEmail.value = true
  }
})

async function submit() {
  formError.value = ''
  try {
    await auth.login({ email: email.value, password: password.value })
    if (rememberEmail.value) {
      localStorage.setItem(SAVED_EMAIL_KEY, email.value)
    } else {
      localStorage.removeItem(SAVED_EMAIL_KEY)
    }
    emit('success')
  } catch (e) {
    formError.value = e.message || '이메일 또는 비밀번호를 확인해 주세요.'
  }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-panel">
      <button class="close-btn" type="button" aria-label="닫기" @click="emit('close')">
        <KkIcon name="x" :size="20" />
      </button>

      <div class="modal-brand">
        <Mascot variant="default" :size="52" />
        <div>
          <h2>다시 만나서 반가워요!</h2>
          <p>로그인하고 여행을 이어가세요.</p>
        </div>
      </div>

      <form class="login-form" @submit.prevent="submit">
        <Input
          v-model="email"
          label="이메일"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          required
        >
          <template #left-icon>
            <KkIcon name="mail" :size="18" />
          </template>
        </Input>

        <Input
          v-model="password"
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력해 주세요"
          autocomplete="current-password"
          required
        >
          <template #left-icon>
            <KkIcon name="lock" :size="18" />
          </template>
        </Input>

        <div class="remember-row">
          <Checkbox v-model="rememberEmail" label="이메일 저장" />
        </div>

        <p v-if="formError || auth.error" class="form-error">
          {{ formError || auth.error }}
        </p>

        <Button
          variant="primary"
          size="lg"
          :full-width="true"
          :disabled="auth.loading"
          type="submit"
        >
          {{ auth.loading ? '로그인 중...' : '로그인' }}
        </Button>
      </form>

      <div class="signup-link">
        아직 계정이 없나요?
        <a href="#" @click.prevent="emit('need-signup')">회원가입</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(25, 20, 16, 0.5);
  backdrop-filter: blur(4px);
}

.modal-panel {
  position: relative;
  width: min(420px, 100%);
  padding: 32px 28px 28px;
  border-radius: 24px;
  background: var(--bg-base);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-subtle);
  animation: kok-fade-up var(--dur-base) var(--ease-out);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: var(--gray-100);
  color: var(--text-muted);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background var(--dur-fast);
}

.close-btn:hover {
  background: var(--gray-200);
}

.modal-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 26px;
}

.modal-brand h2 {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.modal-brand p {
  margin-top: 4px;
  font-size: 14px;
  color: var(--text-secondary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.remember-row {
  margin-top: -2px;
}

.form-error {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
  margin-bottom: 2px;
}

.signup-link {
  margin-top: 18px;
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
}

.signup-link a {
  color: var(--coral-600);
  font-weight: 700;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
