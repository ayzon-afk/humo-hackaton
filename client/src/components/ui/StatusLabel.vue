<script setup>
import { statusLabels, statusTone } from '@/config/labels';

defineProps({ status: String, interactive: Boolean });
defineEmits(['click']);
</script>

<template>
  <button
    v-if="interactive"
    type="button"
    class="status"
    :data-tone="statusTone[status]"
    title="Сменить статус"
    @click="$emit('click')"
  >
    {{ statusLabels[status] || status }}
  </button>
  <span v-else class="status" :data-tone="statusTone[status]">{{ statusLabels[status] || status }}</span>
</template>
