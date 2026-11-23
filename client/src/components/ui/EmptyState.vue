<script setup>
import { Inbox } from 'lucide-vue-next';

defineProps({
  title: { type: String, default: 'Здесь пока пусто' },
  text: String,
  icon: { type: [Object, Function], default: () => Inbox },
});
</script>

<template>
  <div class="empty">
    <component :is="icon" aria-hidden="true" />
    <h3>{{ title }}</h3>
    <p v-if="text">{{ text }}</p>
    <slot />
  </div>
</template>
