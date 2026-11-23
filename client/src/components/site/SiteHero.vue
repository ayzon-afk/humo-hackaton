<script setup>
import { ChevronDown } from 'lucide-vue-next';
import { project } from '@/config/project';
</script>

<template>
  <header class="hero site-container">
    <span class="eyebrow reveal">{{ project.team }} · Humo Arena Hackathon</span>
    <h1 class="display reveal reveal-2">{{ project.name }}</h1>
    <p class="lead reveal reveal-3">{{ project.tagline }}</p>
    <div class="actions reveal reveal-3">
      <RouterLink to="/login" class="btn btn-primary btn-lg btn-pill">Попробовать</RouterLink>
      <a href="#how" class="link-arrow">Как это работает</a>
    </div>
    <a href="#how" class="scroll-hint reveal reveal-3" aria-label="Листайте вниз">
      Листайте<ChevronDown aria-hidden="true" />
    </a>
  </header>
</template>
