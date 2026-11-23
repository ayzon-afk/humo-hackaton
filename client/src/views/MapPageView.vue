<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { MapPin } from 'lucide-vue-next';
import { useItemsStore } from '@/stores/items';
import { useToast } from '@/composables/useToast';
import { themeColors } from '@/components/charts/registerCharts';
import { statusOrder, statusTone } from '@/config/labels';
import PageHeader from '@/components/ui/PageHeader.vue';
import StatusLabel from '@/components/ui/StatusLabel.vue';
import SheetPanel from '@/components/ui/SheetPanel.vue';
import MapView from '@/components/map/MapView.vue';
import ItemForm from '@/components/items/ItemForm.vue';

const store = useItemsStore();
const { items } = storeToRefs(store);
const { push } = useToast();
const picked = ref(null);
const selected = ref(null);
const sheetOpen = ref(false);
const saving = ref(false);
const formRef = ref(null);

const toneColor = () => {
  const css = getComputedStyle(document.documentElement);
  const c = themeColors();
  return {
    info: c.accent,
    warning: css.getPropertyValue('--warning').trim(),
    success: css.getPropertyValue('--success').trim(),
  };
};
const points = computed(() => {
  const colors = toneColor();
  return items.value.map((x) => ({ ...x, color: colors[statusTone[x.status]] }));
});

function pick(point) {
  picked.value = point;
  sheetOpen.value = true;
}

async function save() {
  const data = formRef.value?.validate();
  if (!data) return;
  saving.value = true;
  try {
    await store.create(data);
    formRef.value.reset();
    sheetOpen.value = false;
  } catch (e) {
    push(e.message, 'error');
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  store.fetch();
  store.subscribe();
});
</script>

<template>
  <div>
    <PageHeader title="Карта" subtitle="Нажмите на карту, чтобы добавить запись в этой точке" />

    <div class="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div class="card p-1.5">
        <MapView :points="points" height="68vh" @pick="pick" @select="selected = $event" />
      </div>

      <aside class="card self-start">
        <div class="card-header">
          <span class="card-title">{{ selected ? 'Выбрано' : 'Легенда' }}</span>
        </div>
        <div v-if="selected" class="card-body flex flex-col gap-3">
          <div class="font-medium">{{ selected.title }}</div>
          <p class="text-sm text-secondary">{{ selected.description || 'Без описания' }}</p>
          <StatusLabel :status="selected.status" />
          <button class="btn btn-secondary btn-sm self-start" @click="selected = null">Закрыть</button>
        </div>
        <ul v-else class="list mt-3 mb-2">
          <li v-for="s in statusOrder" :key="s" class="list-row">
            <StatusLabel :status="s" class="flex-1" />
            <span class="num text-sm text-secondary">{{ items.filter((x) => x.status === s).length }}</span>
          </li>
          <li class="list-row text-xs text-tertiary">
            <MapPin class="w-4 h-4" aria-hidden="true" />{{ items.length }} точек на карте
          </li>
        </ul>
      </aside>
    </div>

    <SheetPanel v-model="sheetOpen" title="Новая запись" eyebrow="Точка на карте" @submit="save">
      <ItemForm ref="formRef" :point="picked" />
      <template #footer>
        <button class="btn btn-ghost" @click="sheetOpen = false">Отмена</button>
        <button class="btn btn-primary" :aria-busy="saving" @click="save">
          <span v-if="saving" class="spinner" />Добавить запись
        </button>
      </template>
    </SheetPanel>
  </div>
</template>
