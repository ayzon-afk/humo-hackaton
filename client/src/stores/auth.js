import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
  const token = ref(localStorage.getItem('token'));
  const isAuth = computed(() => Boolean(token.value));
  const isAdmin = computed(() => user.value?.role === 'admin');

  function save(data) {
    user.value = data.user;
    token.value = data.token;
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  }

  async function login(email, password) {
    save(await authApi.login(email, password));
  }

  async function register(payload) {
    save(await authApi.register(payload));
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  return { user, token, isAuth, isAdmin, login, register, logout };
});
