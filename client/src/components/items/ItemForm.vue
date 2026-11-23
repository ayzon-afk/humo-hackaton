<script setup>
import { reactive, ref, watch } from 'vue';
import { WandSparkles } from 'lucide-vue-next';
import { aiApi } from '@/api/ai';
import { categoryLabels } from '@/config/labels';

// Форма без кнопки отправки: кнопка живёт в футере панели (SheetPanel)
const props = defineProps({ point: Object });
const form = reactive({ title: '', description: '', category: 'city', priority: 3, lat: null, lng: null });
const aiLoading = ref(false);
const error = ref('');

watch(
  () => props.point,
  (p) => p && Object.assign(form, { lat: p.lat, lng: p.lng }),
  { immediate: true },
);

// AI сам определяет категорию, приоритет и название по описанию
async function autoFill() {
  if (!form.description.trim()) return (error.value = 'Сначала опиши запись — AI заполнит остальное');
  error.value = '';
  aiLoading.value = true;
  try {
    const { result } = await aiApi.analyze(
      form.description,
      `Определи category (одно из: ${Object.keys(categoryLabels).join(', ')}), priority (1-5) и короткий title.`,
    );
    if (result.category in categoryLabels) form.category = result.category;
    if (result.priority) form.priority = Math.min(5, Math.max(1, Number(result.priority)));
    if (result.title && !form.title) form.title = result.title;
  } finally {
    aiLoading.value = false;
  }
}

function validate() {
  if (!form.title.trim()) {
    error.value = 'Добавь название';
    return null;
  }
  return { ...form };
}

function reset() {
  Object.assign(form, { title: '', description: '', priority: 3 });
  error.value = '';
}

defineExpose({ validate, reset });
</script>

<template>
  <div class="flex flex-col gap-5">
    <label class="field">
      <span class="label">Описание</span>
      <textarea v-model="form.description" class="textarea" rows="4" placeholder="Что произошло и где" />
    </label>

    <button type="button" class="btn btn-secondary self-start" :aria-busy="aiLoading" @click="autoFill">
      <span v-if="aiLoading" class="spinner" /><WandSparkles v-else aria-hidden="true" />
      Заполнить с AI
    </button>

    <label class="field">
      <span class="label">Название</span>
      <input v-model="form.title" class="input" placeholder="Коротко, 3–5 слов" @input="error = ''" />
    </label>

    <div class="grid grid-cols-2 gap-3">
      <label class="field">
        <span class="label">Категория</span>
        <select v-model="form.category" class="select">
          <option v-for="(label, key) in categoryLabels" :key="key" :value="key">{{ label }}</option>
        </select>
      </label>
      <label class="field">
        <span class="label">Приоритет</span>
        <select v-model.number="form.priority" class="select">
          <option v-for="n in 5" :key="n" :value="n">{{ n }} из 5</option>
        </select>
      </label>
    </div>

    <p class="hint">
      {{ form.lat ? `Точка: ${form.lat.toFixed(4)}, ${form.lng.toFixed(4)}` : 'Точку на карте можно выбрать на странице «Карта»' }}
    </p>
    <p v-if="error" class="error-text">{{ error }}</p>
  </div>
</template>
