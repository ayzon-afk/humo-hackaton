<script setup>
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useItemsStore } from '@/stores/items';
import { useToast } from '@/composables/useToast';
import ItemTable from '@/components/items/ItemTable.vue';
import LoadingBlock from '@/components/ui/LoadingBlock.vue';
import EmptyState from '@/components/ui/EmptyState.vue';

const store = useItemsStore();
const { items, loading } = storeToRefs(store);
const { push } = useToast();
const q = ref('');

let timer;
watch(q, (value) => {
  clearTimeout(timer);
  timer = setTimeout(() => store.fetch(value ? { q: value } : undefined), 300);
});

async function changeStatus(item, status) {
  try {
    await store.update(item.id, { status });
  } catch (e) {
    push(e.message, 'error');
  }
}

async function remove(item) {
  try {
    await store.remove(item.id);
  } catch (e) {
    push(e.message, 'error');
  }
}

onMounted(() => {
  store.fetch();
  store.subscribe();
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-3 items-center justify-between">
      <h1 class="text-2xl font-black">Записи</h1>
      <input v-model="q" class="input input-bordered w-full max-w-xs" placeholder="Поиск..." />
    </div>
    <LoadingBlock v-if="loading && !items.length" />
    <EmptyState v-else-if="!items.length" />
    <ItemTable v-else :items="items" @status="changeStatus" @remove="remove" />
  </div>
</template>
