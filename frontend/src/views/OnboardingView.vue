<script setup>
import { computed, ref } from 'vue'
import Button from '@/components/core/Button.vue'
import Stepper from '@/components/feedback/Stepper.vue'
import Input from '@/components/forms/Input.vue'
import Checkbox from '@/components/forms/Checkbox.vue'
import Mascot from '@/components/brand/Mascot.vue'
import KkIcon from '@/components/icons/KkIcon.vue'
import { useAuthStore } from '@/stores/auth.js'

const emit = defineEmits(['complete'])
const auth = useAuthStore()

const currentStep = ref(0)
const authMode = ref('signup')
const agreeRequired = ref(false)
const agreeMarketing = ref(false)
const nickname = ref('')
const email = ref('')
const password = ref('')
const formError = ref('')

const steps = [
  {
    icon: 'compass',
    tint: 'var(--coral-500)',
    soft: 'var(--coral-50)',
    title: '여행지를 둘러보세요',
    desc: '한국관광공사가 인증한 관광지·맛집·숙소·축제를 지역과 카테고리로 쉽게 찾아봐요.',
    mascot: 'default',
  },
  {
    icon: 'bookmark',
    tint: 'var(--mint-500)',
    soft: 'var(--mint-50)',
    title: '가고 싶은 곳을 콕 저장하세요',
    desc: '마음에 드는 장소를 여행 바구니에 콕! 담아두면 코스의 재료가 돼요.',
    mascot: 'saved',
  },
  {
    icon: 'sparkles',
    tint: 'var(--sky-500)',
    soft: 'var(--sky-50)',
    title: 'AI가 코스를 만들어드려요',
    desc: '저장한 장소와 여행 기간·스타일에 맞춰 AI가 Day별 일정을 짜드려요.',
    mascot: 'guide',
  },
  {
    icon: 'copy',
    tint: 'var(--amber-500)',
    soft: 'var(--amber-50)',
    title: 'TripLog에서 코스를 담아오세요',
    desc: '다른 여행자의 기록이 마음에 들면, 그 코스를 그대로 내 계획으로 가져올 수 있어요.',
    mascot: 'cheer',
  },
]

const signup = computed(() => currentStep.value >= steps.length)
const step = computed(() => steps[Math.min(currentStep.value, steps.length - 1)])
const isLogin = computed(() => authMode.value === 'login')

function next() {
  currentStep.value += 1
}

function openSignup() {
  authMode.value = 'signup'
  currentStep.value = steps.length
}

function openLogin() {
  authMode.value = 'login'
  formError.value = ''
}

async function submitAuth() {
  formError.value = ''

  try {
    if (isLogin.value) {
      await auth.login({
        email: email.value,
        password: password.value,
      })
    } else {
      await auth.signup({
        nickname: nickname.value,
        email: email.value,
        password: password.value,
        marketingConsent: agreeMarketing.value,
      })
    }

    emit('complete')
  } catch (error) {
    formError.value = error.message || '인증 처리에 실패했습니다.'
  }
}
</script>

<template>
  <div class="onboarding-overlay">
    <div class="onboarding-wrap">
      <header class="onboarding-header">
        <div class="brand">
          <img src="/images/markSvg.svg" alt="" />
          <b>코스<span>콕</span></b>
        </div>

        <button
          v-if="!signup"
          class="skip-button"
          type="button"
          @click="openSignup"
        >
          건너뛰기
        </button>
      </header>

      <section class="onboarding-card">
        <div v-if="!signup" :key="currentStep" class="step-screen">
          <div class="scene" :style="{ background: step.soft }">
            <div class="scene-ring" :style="{ borderColor: step.tint }" />
            <Mascot :variant="step.mascot" :size="130" />
            <div v-if="currentStep === 0" class="mascot-name-tag">
              안녕, 나는 <b>콕이</b>야
            </div>
            <div class="scene-icon" :style="{ color: step.tint }">
              <KkIcon :name="step.icon" :size="26" />
            </div>
          </div>

          <div class="step-copy">
            <div class="step-label" :style="{ color: step.tint }">STEP {{ currentStep + 1 }}</div>
            <h1>{{ step.title }}</h1>
            <p>{{ step.desc }}</p>
          </div>

          <div class="step-footer">
            <Stepper :steps="steps.length" :current="currentStep" />
            <div class="step-buttons">
              <Button
                v-if="currentStep > 0"
                variant="ghost"
                @click="currentStep -= 1"
              >
                이전
              </Button>
              <Button variant="primary" @click="next">
                {{ currentStep === steps.length - 1 ? '시작하기' : '다음' }}
                <template #right-icon>
                  <KkIcon name="arrowR" :size="18" />
                </template>
              </Button>
            </div>
          </div>
        </div>

        <div v-else class="signup-screen">
          <button class="back-button" type="button" @click="currentStep = steps.length - 1">
            <KkIcon name="chevronL" :size="18" />
            뒤로
          </button>

          <h2>{{ isLogin ? '로그인' : '회원가입' }}</h2>
          <p class="signup-desc">
            {{ isLogin ? '다시 만나서 반가워요. 코스를 이어서 확인해요.' : '30초면 끝나요. 콕이가 기다리고 있어요!' }}
          </p>

          <form class="signup-form" @submit.prevent="submitAuth">
            <Input
              v-if="!isLogin"
              v-model="nickname"
              label="닉네임"
              placeholder="여행자 닉네임"
              required
            >
              <template #left-icon>
                <KkIcon name="user" :size="18" />
              </template>
            </Input>

            <Input v-model="email" label="이메일" type="email" placeholder="you@example.com" required>
              <template #left-icon>
                <KkIcon name="mail" :size="18" />
              </template>
            </Input>

            <Input
              v-model="password"
              label="비밀번호"
              type="password"
              placeholder="8자 이상"
              hint="영문·숫자 포함 8자 이상"
              required
              minlength="8"
            >
              <template #left-icon>
                <KkIcon name="lock" :size="18" />
              </template>
            </Input>

            <div v-if="!isLogin" class="agreements">
              <Checkbox
                v-model="agreeRequired"
                label="(필수) 이용약관 및 개인정보 처리방침에 동의합니다"
              />
              <Checkbox
                v-model="agreeMarketing"
                label="(선택) 새로운 여행지·이벤트 알림 받기"
              />
            </div>

            <p v-if="formError || auth.error" class="form-error">
              {{ formError || auth.error }}
            </p>

            <Button
              variant="primary"
              size="lg"
              :full-width="true"
              :disabled="auth.loading || (!isLogin && !agreeRequired)"
              type="submit"
            >
              {{ auth.loading ? '처리 중...' : isLogin ? '로그인' : '코스콕 시작하기' }}
            </Button>

            <div class="login-link">
              <template v-if="isLogin">
                아직 계정이 없나요?
                <a href="#" @click.prevent="authMode = 'signup'">회원가입</a>
              </template>
              <template v-else>
                이미 계정이 있나요?
                <a href="#" @click.prevent="openLogin">로그인</a>
              </template>
            </div>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.onboarding-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  font-family: var(--font-sans);
}

.onboarding-wrap {
  width: min(460px, 100%);
}

.onboarding-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand img {
  width: 30px;
  height: 30px;
}

.brand b {
  font-size: 19px;
  letter-spacing: 0;
  color: var(--text-primary);
}

.brand span {
  color: var(--coral-500);
}

.skip-button,
.back-button {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-muted);
  font-family: var(--font-sans);
}

.skip-button {
  font-size: 14px;
  font-weight: 600;
}

.onboarding-card {
  background: var(--surface);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-subtle);
  padding: 24px;
}

.step-screen {
  animation: kok-fade-up var(--dur-base) var(--ease-out);
}

.scene {
  position: relative;
  height: 240px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.scene-ring {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 2px dashed;
  opacity: 0.25;
}

.scene-icon {
  position: absolute;
  top: 26px;
  right: 30px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--surface);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mascot-name-tag {
  position: absolute;
  left: 28px;
  bottom: 24px;
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 13px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--coral-100);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.mascot-name-tag b {
  color: var(--coral-600);
  margin: 0 2px;
}

.step-copy {
  padding: 24px 6px 8px;
}

.step-label {
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 8px;
}

.step-copy h1 {
  font-size: 25px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.25;
}

.step-copy p {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.65;
  margin-top: 12px;
}

.step-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 18px;
}

.step-buttons {
  display: flex;
  gap: 8px;
}

.signup-screen {
  animation: kok-fade-up var(--dur-base) var(--ease-out);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  margin-bottom: 14px;
}

.signup-screen h2 {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0;
}

.signup-desc {
  color: var(--text-secondary);
  font-size: 15px;
  margin-top: 6px;
  margin-bottom: 22px;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.agreements {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 2px;
}

.form-error {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
}

.login-link a {
  color: var(--coral-600);
  font-weight: 700;
}

@media (max-width: 480px) {
  .onboarding-overlay {
    align-items: flex-start;
    padding: 16px;
  }

  .onboarding-card {
    padding: 20px;
  }

  .scene {
    height: 220px;
  }

  .step-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .step-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
