<script setup>
import { reactive, ref, watch } from 'vue';
import { aiApi } from '@/api/ai';
import { categoryLabels } from '@/config/labels';

const props = defineProps({ point: Object }); // { lat, lng } с карты
const emit = defineEmits(['submit']);

const form = reactive({ title: '', description: '', category: 'city', priority: 3, lat: null, lng: null });
const aiLoading = ref(false);

watch(
  () => props.point,
  (p) => p && Object.assign(form, { lat: p.lat, lng: p.lng }),
  { immediate: true },
);

// Вау-кнопка: AI сам заполняет категорию и приоритет по описанию
async function autoFill() {
  if (!form.description) return;
  aiLoading.value = true;
  try {
    const { result } = await aiApi.analyze(
      form.description,
      `Определи category (одно из: ${Object.keys(categoryLabels).join(', ')}), priority (1-5) и короткий title.`,
    );
    if (result.category in categoryLabels) form.category = result.category;
    if (result.priority) form.priority = Number(result.priority);
    if (result.title && !form.title) form.title = result.title;
  } finally {
    aiLoading.value = false;
  }
}

function submit() {
  emit('submit', { ...form });
  Object.assign(form, { title: '', description: '' });
}
</script>

<template>
  <form class="card bg-base-200 self-start" @submit.prevent="submit">
    <div class="card-body gap-3">
      <h3 class="card-title">Новая запись</h3>
      <input v-model="form.title" class="input input-bordered w-full" placeholder="Название" required />
      <textarea v-model="form.description" class="textarea textarea-bordered w-full" rows="3" placeholder="Описание" />
      <button type="button" class="btn btn-sm btn-secondary" :disabled="aiLoading" @click="autoFill">
        <span v-if="aiLoading" class="loading loading-spinner loading-xs" />🤖 Заполнить с AI
      </button>
      <div class="grid grid-cols-2 gap-2">
        <select v-model="form.category" class="select select-bordered">
          <option v-for="(label, key) in categoryLabels" :key="key" :value="key">{{ label }}</option>
        </select>
        <input v-model.number="form.priority" type="number" min="1" max="5" class="input input-bordered" />
      </div>
      <p class="text-xs opacity-60">
        {{ form.lat ? `📍 ${form.lat.toFixed(4)}, ${form.lng.toFixed(4)}` : 'Кликни по карте, чтобы выбрать точку' }}
      </p>
      <button class="btn btn-primary">Добавить</button>
    </div>
  </form>
</template>
