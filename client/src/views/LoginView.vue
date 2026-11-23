<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { project } from '@/config/project';

const auth = useAuthStore();
const router = useRouter();
const email = ref('admin@demo.uz');
const password = ref('admin123');
const error = ref('');
const loading = ref(false);

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(email.value, password.value);
    router.push('/app');
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen grid place-items-center p-6">
    <form class="w-full max-w-sm flex flex-col gap-6" @submit.prevent="submit">
      <div class="flex flex-col items-center gap-4 text-center">
        <span class="brand-mark" style="width: 52px; height: 52px; border-radius: 14px; font-size: 24px">{{ project.name.charAt(0) }}</span>
        <div>
          <h1>Вход в {{ project.name }}</h1>
          <p class="text-secondary mt-1">Войдите, чтобы продолжить</p>
        </div>
      </div>
      <div class="card card-body flex flex-col gap-4">
        <label class="field"><span class="label">Email</span><input v-model="email" type="email" class="input" autocomplete="email" /></label>
        <label class="field"><span class="label">Пароль</span><input v-model="password" type="password" class="input" autocomplete="current-password" /></label>
        <p v-if="error" class="error-text">{{ error }}</p>
        <button class="btn btn-primary btn-lg btn-block" :aria-busy="loading"><span v-if="loading" class="spinner" />Войти</button>
      </div>
      <RouterLink to="/" class="text-sm text-center">На главную</RouterLink>
    </form>
  </div>
</template>
