<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeft, Trash2 } from 'lucide-vue-next';
import { crudApi } from '@/api/crud';
import { project } from '@/config/project';
import { categoryLabels, statusLabels, statusOrder, statusTone } from '@/config/labels';
import { formatDateTime } from '@/composables/useFormat';
import { useToast } from '@/composables/useToast';
import { themeColors } from '@/components/charts/registerCharts';
import SegmentedControl from '@/components/ui/SegmentedControl.vue';
import PriorityMeter from '@/components/ui/PriorityMeter.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import MapView from '@/components/map/MapView.vue';
import ItemHistory from '@/components/items/ItemHistory.vue';
import ItemAiInsight from '@/components/items/ItemAiInsight.vue';

const props = defineProps({ id: { type: String, required: true } });
const api = crudApi(project.mainCollection);
const router = useRouter();
const { push } = useToast();

const item = ref(null);
const notFound = ref(false);

const statusOptions = statusOrder.map((s) => ({ value: s, label: statusLabels[s] }));
const point = computed(() =>
  item.value?.lat ? [{ ...item.value, color: themeColors().accent, tone: statusTone[item.value.status] }] : [],
);

async function load() {
  try {
    item.value = await api.get(props.id);
  } catch {
    notFound.value = true;
  }
}

async function setStatus(status) {
  if (status === item.value.status) return;
  try {
    item.value = await api.update(item.value.id, { status });
    push(`Статус: ${statusLabels[status]}`, 'success');
  } catch (e) {
    push(e.message, 'error');
  }
}

async function remove() {
  try {
    await api.remove(item.value.id);
    push('Запись удалена', 'info');
    router.push('/app/items');
  } catch (e) {
    push(e.message, 'error');
  }
}

onMounted(load);
</script>

<template>
  <div>
    <RouterLink to="/app/items" class="back-link"><ChevronLeft aria-hidden="true" />Записи</RouterLink>

    <EmptyState v-if="notFound" title="Запись не найдена" text="Возможно, её удалили." />
    <div v-else-if="!item" class="card skeleton h-64" />

    <template v-else>
      <div class="page-header">
        <div>
          <h1>{{ item.title }}</h1>
          <p>{{ categoryLabels[item.category] || item.category }} · {{ formatDateTime(item.createdAt) }}</p>
        </div>
        <button class="btn btn-danger" @click="remove"><Trash2 aria-hidden="true" />Удалить</button>
      </div>

      <div class="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div class="flex flex-col gap-4">
          <section class="card card-body flex flex-col gap-3">
            <span class="card-title">Статус</span>
            <SegmentedControl
              :model-value="item.status"
              :options="statusOptions"
              block
              label="Статус"
              @update:model-value="setStatus"
            />
          </section>

          <section class="card card-body flex flex-col gap-2">
            <span class="card-title">Описание</span>
            <p class="text-secondary" style="white-space: pre-wrap">
              {{ item.description || 'Описание не добавлено.' }}
            </p>
          </section>

          <ItemAiInsight :item="item" />

          <section class="card card-body flex flex-col gap-4">
            <span class="card-title">История</span>
            <ItemHistory :history="item.history" />
          </section>
        </div>

        <aside class="flex flex-col gap-4">
          <section class="card card-body flex flex-col gap-4">
            <span class="card-title">Детали</span>
            <dl class="props">
              <dt>Категория</dt>
              <dd>{{ categoryLabels[item.category] || item.category || '—' }}</dd>
              <dt>Приоритет</dt>
              <dd><PriorityMeter :value="item.priority || 0" /></dd>
              <dt>Создано</dt>
              <dd class="num">{{ formatDateTime(item.createdAt) }}</dd>
              <dt v-if="item.updatedAt">Обновлено</dt>
              <dd v-if="item.updatedAt" class="num">{{ formatDateTime(item.updatedAt) }}</dd>
            </dl>
          </section>
          <section v-if="item.lat" class="card p-1.5">
            <MapView :points="point" height="240px" focus />
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>
