<script setup>
import { Moon, Sun } from 'lucide-vue-next';
import { useTheme } from '@/composables/useTheme';

const { theme, toggle } = useTheme();
</script>

<template>
  <button
    class="btn btn-ghost btn-icon"
    :aria-label="theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'"
    :title="theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'"
    @click="toggle"
  >
    <Sun v-if="theme === 'dark'" />
    <Moon v-else />
  </button>
</template>
