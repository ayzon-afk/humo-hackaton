<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { MapPin, WandSparkles } from 'lucide-vue-next';
import { aiApi } from '@/api/ai';
import { categoryLabels } from '@/config/labels';
import ChoiceChips from '@/components/ui/ChoiceChips.vue';
import SegmentedControl from '@/components/ui/SegmentedControl.vue';

// Форма без кнопки отправки: кнопка живёт в футере панели (SheetPanel)
const props = defineProps({ point: Object });
const form = reactive({ title: '', description: '', category: 'city', priority: 3, lat: null, lng: null });
const aiLoading = ref(false);
const aiDone = ref(false);
const error = ref('');

const categoryOptions = computed(() => Object.entries(categoryLabels).map(([value, label]) => ({ value, label })));
const priorityOptions = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }));

watch(
  () => props.point,
  (p) => p && Object.assign(form, { lat: p.lat, lng: p.lng }),
  { immediate: true },
);

// AI сам определяет категорию, приоритет и название по описанию
async function autoFill() {
  if (!form.description.trim()) return (error.value = 'Опиши ситуацию — AI заполнит остальное');
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
    aiDone.value = true;
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
  aiDone.value = false;
}

defineExpose({ validate, reset });
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <input
        v-model="form.title"
        class="title-input"
        placeholder="Название"
        aria-label="Название"
        autofocus
        @input="error = ''"
      />
      <textarea
        v-model="form.description"
        class="textarea"
        rows="3"
        placeholder="Опишите ситуацию: что, где, когда"
        aria-label="Описание"
      />
    </div>

    <div class="ai-assist">
      <p>
        {{
          aiDone
            ? 'Готово — проверьте категорию и приоритет'
            : 'AI сам определит категорию, приоритет и название по описанию'
        }}
      </p>
      <button type="button" class="btn btn-sm" :aria-busy="aiLoading" @click="autoFill">
        <span v-if="aiLoading" class="spinner" /><WandSparkles v-else aria-hidden="true" />
        Заполнить
      </button>
    </div>

    <div class="field">
      <span class="label">Категория</span>
      <ChoiceChips v-model="form.category" :options="categoryOptions" label="Категория" />
    </div>

    <div class="field">
      <span class="label">Приоритет</span>
      <SegmentedControl v-model="form.priority" :options="priorityOptions" block label="Приоритет" />
    </div>

    <div v-if="form.lat" class="point-row">
      <MapPin aria-hidden="true" />{{ form.lat.toFixed(4) }}, {{ form.lng.toFixed(4) }}
    </div>
    <p v-if="error" class="error-text">{{ error }}</p>
  </div>
</template>
