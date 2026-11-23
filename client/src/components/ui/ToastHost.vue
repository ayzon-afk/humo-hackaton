<script setup>
import { Check, CircleAlert, Info } from 'lucide-vue-next';
import { useToast } from '@/composables/useToast';

const { toasts } = useToast();
const icons = { success: Check, error: CircleAlert, info: Info };
</script>

<template>
  <TransitionGroup name="toast" tag="div" class="toasts" aria-live="polite">
    <div v-for="t in toasts" :key="t.id" class="toast" :data-tone="t.tone">
      <component :is="icons[t.tone] || Info" aria-hidden="true" />
      {{ t.text }}
    </div>
  </TransitionGroup>
</template>
