import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/app/explore',
    },
    {
      path: '/share/trips/:token',
      name: 'trip-collaboration',
      component: () => import('@/views/TripCollaborationView.vue'),
    },
    {
      path: '/app',
      component: AppLayout,
      meta: { requiresAuth: true },
      redirect: '/app/explore',
      children: [
        {
          path: 'explore',
          name: 'explore',
          component: () => import('@/views/ExploreView.vue'),
        },
        {
          path: 'planner',
          name: 'planner',
          component: () => import('@/views/AIPlannerView.vue'),
        },
        {
          path: 'trips',
          name: 'trips',
          component: () => import('@/views/MyTripsView.vue'),
        },
        {
          path: 'triplog',
          name: 'triplog',
          component: () => import('@/views/TripLogView.vue'),
        },
        {
          path: 'mypage',
          name: 'mypage',
          component: () => import('@/views/MyPageView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.bootstrap()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return true
  }
})

export default router
