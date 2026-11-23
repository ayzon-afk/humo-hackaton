<script setup>
import { Menu } from 'lucide-vue-next';
import { project } from '@/config/project';

// Только на телефоне: кнопка меню + логотип
defineEmits(['menu']);
</script>

<template>
  <header class="topbar">
    <button class="btn btn-ghost btn-icon menu-btn" aria-label="Открыть меню" @click="$emit('menu')"><Menu /></button>
    <span class="brand-mark">{{ project.name.charAt(0) }}</span>
    <span class="brand-name">{{ project.name }}</span>
  </header>
</template>
