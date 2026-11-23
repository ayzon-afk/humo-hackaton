<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { Plus, SearchX } from 'lucide-vue-next';
import { useItemsStore } from '@/stores/items';
import { useToast } from '@/composables/useToast';
import { statusLabels, statusOrder } from '@/config/labels';
import PageHeader from '@/components/ui/PageHeader.vue';
import SegmentedControl from '@/components/ui/SegmentedControl.vue';
import SearchField from '@/components/ui/SearchField.vue';
import SkeletonRows from '@/components/ui/SkeletonRows.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import SheetPanel from '@/components/ui/SheetPanel.vue';
import ItemTable from '@/components/items/ItemTable.vue';
import ItemForm from '@/components/items/ItemForm.vue';

const store = useItemsStore();
const { items, loading, freshIds } = storeToRefs(store);
const { push } = useToast();
const route = useRoute();

const q = ref(route.query.q || '');
const status = ref(null);
const sheetOpen = ref(false);
const saving = ref(false);
const formRef = ref(null);

watch(
  () => route.query.q,
  (v) => (q.value = v || ''),
);

const filters = computed(() => [
  { value: null, label: 'Все', count: items.value.length },
  ...statusOrder.map((s) => ({
    value: s,
    label: statusLabels[s],
    count: items.value.filter((x) => x.status === s).length,
  })),
]);

const visible = computed(() => {
  const needle = q.value.trim().toLowerCase();
  return items.value.filter(
    (x) =>
      (!status.value || x.status === status.value) &&
      (!needle || `${x.title} ${x.description || ''}`.toLowerCase().includes(needle)),
  );
});

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

async function changeStatus(item, next) {
  try {
    await store.update(item.id, { status: next });
  } catch (e) {
    push(e.message, 'error');
  }
}

async function remove(item) {
  try {
    await store.remove(item.id);
    push('Запись удалена', 'info');
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
  <div>
    <PageHeader title="Записи">
      <button class="btn btn-primary" @click="sheetOpen = true"><Plus aria-hidden="true" />Новая запись</button>
    </PageHeader>

    <div class="toolbar">
      <SegmentedControl v-model="status" :options="filters" label="Фильтр по статусу" />
      <div class="flex-1" />
      <SearchField v-model="q" class="w-full sm:w-64" placeholder="Найти запись" />
    </div>

    <section class="card">
      <SkeletonRows v-if="loading && !items.length" />
      <EmptyState
        v-else-if="!items.length"
        title="Добавьте первую запись"
        text="Записи появятся здесь и сразу на карте и в обзоре."
      >
        <button class="btn btn-primary" @click="sheetOpen = true"><Plus aria-hidden="true" />Новая запись</button>
      </EmptyState>
      <EmptyState
        v-else-if="!visible.length"
        :icon="SearchX"
        title="Ничего не найдено"
        text="Попробуйте другой запрос или фильтр."
      />
      <ItemTable v-else :items="visible" :fresh-ids="freshIds" @status="changeStatus" @remove="remove" />
    </section>

    <SheetPanel v-model="sheetOpen" title="Новая запись" eyebrow="Записи" @submit="save">
      <ItemForm ref="formRef" />
      <template #footer>
        <button class="btn btn-ghost" @click="sheetOpen = false">Отмена</button>
        <button class="btn btn-primary" :aria-busy="saving" @click="save">
          <span v-if="saving" class="spinner" />Добавить запись
        </button>
      </template>
    </SheetPanel>
  </div>
</template>
