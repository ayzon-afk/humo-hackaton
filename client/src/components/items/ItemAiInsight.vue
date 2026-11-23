<script setup>
import { ref } from 'vue';
import { WandSparkles } from 'lucide-vue-next';
import { aiApi } from '@/api/ai';

const props = defineProps({ item: { type: Object, required: true } });
const result = ref(null);
const loading = ref(false);

/** Просим AI коротко оценить запись и предложить следующий шаг */
async function analyze() {
  loading.value = true;
  try {
    const text = `${props.item.title}. ${props.item.description || ''}`;
    const { result: r } = await aiApi.analyze(
      text,
      'Верни summary (1 предложение: суть проблемы) и recommendation (1 предложение: что сделать первым).',
    );
    result.value = r;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="card">
    <div class="card-header">
      <span class="card-title">AI-анализ</span>
      <button class="btn btn-secondary btn-sm" :aria-busy="loading" @click="analyze">
        <span v-if="loading" class="spinner" /><WandSparkles v-else aria-hidden="true" />
        {{ result ? 'Обновить' : 'Проанализировать' }}
      </button>
    </div>
    <div class="card-body">
      <div v-if="result" class="ai-result">
        <p><strong>Суть.</strong> {{ result.summary || result.description || '—' }}</p>
        <p><strong>Первый шаг.</strong> {{ result.recommendation || 'Назначить ответственного и взять в работу.' }}</p>
      </div>
      <p v-else class="text-sm text-secondary">AI прочитает запись и подскажет, что сделать первым.</p>
    </div>
  </section>
</template>
