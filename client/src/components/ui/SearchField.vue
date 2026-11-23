<script setup>
import { Search } from 'lucide-vue-next';

const model = defineModel({ type: String, default: '' });
defineProps({ placeholder: { type: String, default: 'Поиск' } });
defineEmits(['submit']);
</script>

<template>
  <label class="search">
    <Search aria-hidden="true" />
    <input v-model="model" type="search" class="input" :placeholder="placeholder" :aria-label="placeholder" @keydown.enter="$emit('submit', model)" />
  </label>
</template>
