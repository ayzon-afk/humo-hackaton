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
      { path: 'items/:id', component: () => import('@/views/ItemDetailView.vue'), props: true },
      { path: 'map', component: () => import('@/views/MapPageView.vue') },
      { path: 'ai', component: () => import('@/views/AiView.vue') },
      { path: 'team', component: () => import('@/views/TeamView.vue') },
      { path: 'settings', component: () => import('@/views/SettingsView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, _from, saved) => saved || (to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 }),
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.matched.some((r) => r.meta.auth) && !auth.isAuth) return '/login';
});
