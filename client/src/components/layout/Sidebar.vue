<script setup>
import { navLinks } from '@/config/nav';
import { project } from '@/config/project';
</script>

<template>
  <aside class="drawer-side z-20">
    <label for="app-drawer" class="drawer-overlay" />
    <div class="w-64 min-h-full bg-base-200 p-4 flex flex-col gap-4">
      <RouterLink to="/" class="text-xl font-black tracking-tight px-2">{{ project.name }}</RouterLink>
      <ul class="menu w-full gap-1">
        <li v-for="link in navLinks" :key="link.to">
          <RouterLink :to="link.to" exact-active-class="menu-active">
            <span>{{ link.icon }}</span>{{ link.label }}
          </RouterLink>
        </li>
      </ul>
      <div class="mt-auto text-xs opacity-50 px-2">by {{ project.team }}</div>
    </div>
  </aside>
</template>
