<script setup>
import { Sparkles, Zap, MapPin, ShieldCheck, ChartLine, Users } from 'lucide-vue-next';
import { project } from '@/config/project';
import '@/styles/site.css';

// Иконки, доступные в project.features (добавь нужную сюда)
const icons = { Sparkles, Zap, MapPin, ShieldCheck, ChartLine, Users };
</script>

<template>
  <div class="site">
    <nav class="site-nav">
      <div class="site-container">
        <RouterLink to="/" class="brand"><span class="brand-mark">{{ project.name.charAt(0) }}</span><span class="brand-name">{{ project.name }}</span></RouterLink>
        <div class="flex-1" />
        <a href="#problem" class="link">Проблема</a>
        <a href="#features" class="link">Решение</a>
        <RouterLink to="/login" class="btn btn-primary btn-sm btn-pill">Открыть демо</RouterLink>
      </div>
    </nav>

    <header class="site-container hero">
      <span class="eyebrow reveal">{{ project.team }} · Humo Arena Hackathon</span>
      <h1 class="display reveal reveal-2">{{ project.name }}</h1>
      <p class="lead reveal reveal-3" style="max-width: 640px">{{ project.tagline }}</p>
      <div class="actions reveal reveal-3">
        <RouterLink to="/login" class="btn btn-primary btn-lg btn-pill">Попробовать</RouterLink>
        <a href="#problem" class="link-arrow">Узнать больше</a>
      </div>
    </header>

    <section id="problem" class="section section-muted">
      <div class="site-container text-center flex flex-col items-center gap-6">
        <div class="stat-xl">{{ project.problem.stat }}</div>
        <p class="lead" style="max-width: 620px">{{ project.problem.text }}</p>
      </div>
    </section>

    <section id="features" class="section">
      <div class="site-container">
        <h2 class="headline text-center">Как это работает</h2>
        <div class="tiles">
          <div v-for="f in project.features" :key="f.title" class="tile" style="background: var(--bg)">
            <component :is="icons[f.icon] || Sparkles" aria-hidden="true" />
            <h3>{{ f.title }}</h3>
            <p>{{ f.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="site-footer"><div class="site-container">© 2026 {{ project.name }} · {{ project.team }}</div></footer>
  </div>
</template>
