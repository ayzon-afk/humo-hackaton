import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppLayout from '@/layouts/AppLayout.vue';

const routes = [
  { path: '/', component: () => import('@/views/LandingView.vue') },
  { path: '/login', component: () => import('@/views/LoginView.vue') },
  {
    path: '/app',
    component: AppLayout,
    meta: { auth: true },
    children: [
      { path: '', component: () => import('@/views/DashboardView.vue') },
      { path: 'items', component: () => import('@/views/ItemsView.vue') },
      { path: 'map', component: () => import('@/views/MapPageView.vue') },
      { path: 'ai', component: () => import('@/views/AiView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.matched.some((r) => r.meta.auth) && !auth.isAuth) return '/login';
});
