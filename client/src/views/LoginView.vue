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
  <div class="min-h-screen flex items-center justify-center p-4">
    <form class="card bg-base-200 w-full max-w-sm" @submit.prevent="submit">
      <div class="card-body gap-3">
        <h2 class="text-2xl font-black">{{ project.name }}</h2>
        <input v-model="email" type="email" class="input input-bordered w-full" placeholder="Email" />
        <input v-model="password" type="password" class="input input-bordered w-full" placeholder="Пароль" />
        <p v-if="error" class="text-error text-sm">{{ error }}</p>
        <button class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-sm" />Войти
        </button>
      </div>
    </form>
  </div>
</template>
