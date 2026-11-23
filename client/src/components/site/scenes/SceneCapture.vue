<script setup>
import { computed } from 'vue';
import { Check, WandSparkles } from 'lucide-vue-next';

// Сцена 2: форма заполняется сама — текст «печатается» вместе с прокруткой, потом AI раскладывает по полям.
const props = defineProps({ progress: { type: Number, default: 0 } });

const DESCRIPTION = 'Большая яма на дороге у метро Чиланзар, машины объезжают по встречке';
const RESULT = { title: 'Яма у метро Чиланзар', category: 'Транспорт', priority: 5 };
const CATEGORIES = ['Транспорт', 'Экология', 'Город'];

const typed = computed(() => DESCRIPTION.slice(0, Math.round(DESCRIPTION.length * Math.min(1, props.progress / 0.45))));
const aiWorking = computed(() => props.progress > 0.45 && props.progress < 0.6);
const filled = computed(() => props.progress >= 0.6);
const sent = computed(() => props.progress >= 0.85);
</script>

<template>
  <div class="scene scene-capture">
    <div class="device">
      <div class="device-title">Новое обращение</div>
      <div class="device-heading" :class="{ ghost: !filled }">{{ filled ? RESULT.title : 'Название' }}</div>
      <div class="device-text">{{ typed }}<span v-if="!filled" class="caret" /></div>

      <div class="device-ai" :class="{ working: aiWorking, done: filled }">
        <WandSparkles aria-hidden="true" />
        {{ filled ? 'AI заполнил поля' : aiWorking ? 'AI анализирует…' : 'Заполнить с AI' }}
      </div>

      <div class="device-chips">
        <span v-for="c in CATEGORIES" :key="c" class="chip" :aria-pressed="filled && c === RESULT.category">{{
          c
        }}</span>
      </div>
      <div class="device-priority">
        <span v-for="n in 5" :key="n" :class="{ on: filled && n <= RESULT.priority }" />
      </div>

      <div class="device-send" :class="{ sent }">
        <template v-if="sent"><Check aria-hidden="true" />Отправлено</template>
        <template v-else>Отправить</template>
      </div>
    </div>
  </div>
</template>
