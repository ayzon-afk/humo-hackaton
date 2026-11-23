<script setup>
import { CircleAlert, Info, TriangleAlert } from 'lucide-vue-next';
import { categoryLabels } from '@/config/labels';

defineProps({ alerts: { type: Array, default: () => [] } });

const ICONS = { critical: CircleAlert, warning: TriangleAlert, info: Info };
const TONES = { critical: 'danger', warning: 'warning', info: 'info' };

/** Ключи категорий в тексте алерта → человеческие названия */
const humanize = (text) => text.replace(/«([^»]+)»/g, (_, key) => `«${categoryLabels[key] || key}»`);
</script>

<template>
  <ul v-if="alerts.length" class="list">
    <li v-for="a in alerts" :key="a.key" class="list-row alert-row" :data-tone="TONES[a.level]">
      <component :is="ICONS[a.level]" class="alert-icon" aria-hidden="true" />
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium">{{ a.title }}</div>
        <div class="text-xs text-secondary">{{ humanize(a.detail) }}</div>
      </div>
    </li>
  </ul>
  <p v-else class="text-sm text-secondary px-6 pb-5">Всё спокойно — тревог нет.</p>
</template>
