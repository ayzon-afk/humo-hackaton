<script setup>
import { useToast } from '@/composables/useToast';

const { toasts } = useToast();
</script>

<template>
  <div class="toast toast-end toast-bottom z-50">
    <div v-for="t in toasts" :key="t.id" class="alert" :class="`alert-${t.type}`">
      <span>{{ t.text }}</span>
    </div>
  </div>
</template>
