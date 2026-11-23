<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { LogOut } from 'lucide-vue-next';
import { navSections } from '@/config/nav';
import { initials as toInitials } from '@/composables/useFormat';
import { project } from '@/config/project';
import { useAuthStore } from '@/stores/auth';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';

const auth = useAuthStore();
const router = useRouter();
const initials = computed(() => toInitials(auth.user?.name));

function logout() {
  auth.logout();
  router.push('/');
}
</script>

<template>
  <aside class="sidebar">
    <RouterLink to="/" class="brand">
      <span class="brand-mark">{{ project.name.charAt(0) }}</span>
      <span class="brand-name">{{ project.name }}</span>
    </RouterLink>

    <nav class="nav" aria-label="Основное меню">
      <template v-for="group in navSections" :key="group.section">
        <div class="nav-section">{{ group.section }}</div>
        <RouterLink
          v-for="link in group.links"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :exact-active-class="link.exact ? 'active' : ''"
          :active-class="link.exact ? '' : 'active'"
        >
          <component :is="link.icon" aria-hidden="true" />
          {{ link.label }}
        </RouterLink>
      </template>
    </nav>

    <div class="sidebar-footer">
      <span class="avatar">{{ initials }}</span>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium truncate">{{ auth.user?.name }}</div>
        <div class="text-xs text-tertiary truncate">{{ auth.user?.email }}</div>
      </div>
      <ThemeToggle class="btn-sm" />
      <button class="btn btn-ghost btn-icon btn-sm" aria-label="Выйти" title="Выйти" @click="logout">
        <LogOut />
      </button>
    </div>
  </aside>
</template>
