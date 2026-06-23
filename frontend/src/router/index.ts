import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/app',
    },
    {
      path: '/app',
      component: AppLayout,
      meta: { title: '코스콕', requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // bootstrap이 아직 안 됐으면 완료까지 대기 (새로고침 시)
  if (!auth.initialized) {
    await auth.bootstrap()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    // AppLayout 내부에서 OnboardingView를 렌더링하므로 리다이렉트 없이 통과
    // 인증 여부는 AppLayout의 v-else-if 가드가 처리
    return true
  }
})

export default router
