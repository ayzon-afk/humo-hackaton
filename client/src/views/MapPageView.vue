<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useItemsStore } from '@/stores/items';
import { useToast } from '@/composables/useToast';
import MapView from '@/components/map/MapView.vue';
import ItemForm from '@/components/items/ItemForm.vue';

const STATUS_COLORS = { new: '#38bdf8', in_progress: '#fbbf24', done: '#34d399' };

const store = useItemsStore();
const { items } = storeToRefs(store);
const { push } = useToast();
const picked = ref(null);

const points = computed(() =>
  items.value.map((x) => ({ ...x, color: STATUS_COLORS[x.status] })),
);

async function add(data) {
  if (!data.lat) return push('Сначала кликни по карте', 'warning');
  try {
    await store.create(data);
    picked.value = null;
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
  <div class="grid lg:grid-cols-3 gap-4">
    <div class="lg:col-span-2">
      <MapView :points="points" height="75vh" @pick="picked = $event" />
    </div>
    <ItemForm :point="picked" @submit="add" />
  </div>
</template>
