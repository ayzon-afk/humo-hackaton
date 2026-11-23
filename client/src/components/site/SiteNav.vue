<script setup>
import { project } from '@/config/project';
</script>

<template>
  <nav class="site-nav" aria-label="Навигация по сайту">
    <div class="site-container">
      <RouterLink to="/" class="brand"
        ><span class="brand-mark">{{ project.name.charAt(0) }}</span
        ><span class="brand-name">{{ project.name }}</span></RouterLink
      >
      <div class="flex-1" />
      <a href="#how" class="link">Как работает</a>
      <a href="#features" class="link">Возможности</a>
      <RouterLink to="/login" class="btn btn-primary btn-sm btn-pill">Открыть демо</RouterLink>
    </div>
  </nav>
</template>
