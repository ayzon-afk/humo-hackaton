<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { project } from '@/config/project';

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push('/');
}
</script>

<template>
  <header class="navbar bg-base-100 border-b border-base-300 px-4">
    <label for="app-drawer" class="btn btn-ghost btn-square lg:hidden">☰</label>
    <span class="font-bold text-lg lg:hidden">{{ project.name }}</span>
    <div class="flex-1" />
    <div class="flex items-center gap-3">
      <span class="text-sm opacity-70">{{ auth.user?.name }}</span>
      <button class="btn btn-sm btn-ghost" @click="logout">Выйти</button>
    </div>
  </header>
</template>
