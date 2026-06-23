<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '@/components/core/Button.vue'
import Stepper from '@/components/feedback/Stepper.vue'
import Input from '@/components/forms/Input.vue'
import Checkbox from '@/components/forms/Checkbox.vue'
import Mascot from '@/components/brand/Mascot.vue'
import KkIcon from '@/components/icons/KkIcon.vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{
  complete: []
}>()

const auth = useAuthStore()
const currentStep = ref(0)
const authMode = ref<'signup' | 'login'>('signup')
const agreeRequired = ref(false)
const agreeMarketing = ref(false)
const nickname = ref('')
const email = ref('')
const password = ref('')
const formError = ref('')

const steps = [
  {
    icon: 'compass',
    title: 'Explore trusted places',
    desc: 'Find spots, food, stays, and festivals by region and category.',
    mascot: 'default',
  },
  {
    icon: 'bookmark',
    title: 'Save places you like',
    desc: 'Add places to your travel basket before building a route.',
    mascot: 'saved',
  },
  {
    icon: 'sparkles',
    title: 'Let AI build the route',
    desc: 'Turn saved places into a day-by-day course with cost and movement details.',
    mascot: 'guide',
  },
] as const

const signupScreen = computed(() => currentStep.value >= steps.length)
const step = computed(() => steps[Math.min(currentStep.value, steps.length - 1)] ?? steps[0])
const isLogin = computed(() => authMode.value === 'login')

function openSignup() {
  authMode.value = 'signup'
  currentStep.value = steps.length
}

function openLogin() {
  authMode.value = 'login'
  currentStep.value = steps.length
  formError.value = ''
}

async function submitAuth() {
  formError.value = ''

  try {
    if (isLogin.value) {
      await auth.login({ email: email.value, password: password.value })
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
    formError.value = error instanceof Error ? error.message : 'Authentication failed.'
  }
}
</script>

<template>
  <div class="onboarding-overlay">
    <div class="onboarding-wrap">
      <header class="onboarding-header">
        <div class="brand">
          <img src="/images/markSvg.svg" alt="" />
          <b>Course<span>Kok</span></b>
        </div>
        <button v-if="!signupScreen" class="skip-button" type="button" @click="openSignup">
          Skip
        </button>
      </header>

      <section class="onboarding-card">
        <div v-if="!signupScreen" class="step-screen">
          <div class="scene">
            <Mascot :variant="step.mascot" :size="130" />
            <div class="scene-icon">
              <KkIcon :name="step.icon" :size="26" />
            </div>
          </div>

          <div class="step-copy">
            <div class="step-label">STEP {{ currentStep + 1 }}</div>
            <h1>{{ step.title }}</h1>
            <p>{{ step.desc }}</p>
          </div>

          <div class="step-footer">
            <Stepper :steps="steps.length" :current="currentStep" />
            <div class="step-buttons">
              <Button v-if="currentStep > 0" variant="ghost" @click="currentStep -= 1">Back</Button>
              <Button variant="primary" @click="currentStep += 1">
                {{ currentStep === steps.length - 1 ? 'Start' : 'Next' }}
              </Button>
            </div>
          </div>
        </div>

        <div v-else class="signup-screen">
          <button class="back-button" type="button" @click="currentStep = steps.length - 1">
            <KkIcon name="chevronL" :size="18" />
            Back
          </button>

          <h2>{{ isLogin ? 'Log in' : 'Create account' }}</h2>
          <p class="signup-desc">
            {{ isLogin ? 'Continue planning your trips.' : 'Create an account to save your routes.' }}
          </p>

          <form class="signup-form" @submit.prevent="submitAuth">
            <Input v-if="!isLogin" v-model="nickname" label="Nickname" placeholder="Travel name" required>
              <template #left-icon><KkIcon name="user" :size="18" /></template>
            </Input>

            <Input v-model="email" label="Email" type="email" placeholder="you@example.com" required>
              <template #left-icon><KkIcon name="mail" :size="18" /></template>
            </Input>

            <Input v-model="password" label="Password" type="password" placeholder="At least 8 characters" required minlength="8">
              <template #left-icon><KkIcon name="lock" :size="18" /></template>
            </Input>

            <div v-if="!isLogin" class="agreements">
              <Checkbox v-model="agreeRequired" label="I agree to the required terms." />
              <Checkbox v-model="agreeMarketing" label="Send me travel updates." />
            </div>

            <p v-if="formError || auth.error" class="form-error">{{ formError || auth.error }}</p>

            <Button variant="primary" size="lg" :full-width="true" :disabled="auth.loading || (!isLogin && !agreeRequired)" type="submit">
              {{ auth.loading ? 'Processing...' : isLogin ? 'Log in' : 'Start CourseKok' }}
            </Button>

            <div class="login-link">
              <template v-if="isLogin">
                No account?
                <a href="#" @click.prevent="authMode = 'signup'">Sign up</a>
              </template>
              <template v-else>
                Already have an account?
                <a href="#" @click.prevent="openLogin">Log in</a>
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--bg-base);
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

.onboarding-card {
  padding: 24px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl);
  background: var(--surface);
  box-shadow: var(--shadow-lg);
}

.scene {
  position: relative;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xl);
  background: var(--coral-50);
  overflow: hidden;
}

.scene-icon {
  position: absolute;
  top: 26px;
  right: 30px;
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--surface);
  box-shadow: var(--shadow-md);
  color: var(--coral-500);
}

.step-copy {
  padding: 24px 6px 8px;
}

.step-label {
  font-size: 13px;
  font-weight: 800;
  color: var(--coral-600);
  margin-bottom: 8px;
}

.step-copy h1,
.signup-screen h2 {
  font-size: 25px;
  font-weight: 800;
}

.step-copy p,
.signup-desc {
  margin-top: 10px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.step-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 18px;
}

.step-buttons,
.signup-form,
.agreements {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
}

.signup-form {
  margin-top: 22px;
}

.form-error {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 13px;
  font-weight: 700;
}

.login-link {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

.login-link a {
  color: var(--coral-600);
  font-weight: 700;
}
</style>
