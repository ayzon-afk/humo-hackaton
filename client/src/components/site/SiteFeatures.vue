<script setup>
import { ChartLine, MapPin, ShieldCheck, Sparkles, Users, Zap } from 'lucide-vue-next';
import { project } from '@/config/project';

// Иконки, доступные в project.features (добавь нужную сюда)
const ICONS = { Sparkles, Zap, MapPin, ShieldCheck, ChartLine, Users };
</script>

<template>
  <section id="features" class="section">
    <div class="site-container">
      <span class="eyebrow">Возможности</span>
      <h2 class="headline mt-2">Всё нужное. Ничего лишнего.</h2>
      <div class="tiles">
        <article v-for="f in project.features" :key="f.title" class="tile">
          <component :is="ICONS[f.icon] || Sparkles" aria-hidden="true" />
          <h3>{{ f.title }}</h3>
          <p>{{ f.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
