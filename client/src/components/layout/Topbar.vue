<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Menu } from 'lucide-vue-next';
import SearchField from '@/components/ui/SearchField.vue';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';

defineEmits(['menu']);
const router = useRouter();
const query = ref('');
const search = (q) => router.push({ path: '/app/items', query: q ? { q } : {} });
const scrolled = ref(false);
const onScroll = () => (scrolled.value = window.scrollY > 4);
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <header class="topbar" :class="{ scrolled }">
    <button class="btn btn-ghost btn-icon menu-btn" aria-label="Открыть меню" @click="$emit('menu')">
      <Menu />
    </button>
    <SearchField v-model="query" class="w-full max-w-xs" placeholder="Поиск по записям" @submit="search" />
    <div class="flex-1" />
    <ThemeToggle />
  </header>
</template>
