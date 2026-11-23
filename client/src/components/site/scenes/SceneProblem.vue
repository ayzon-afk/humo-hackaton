<script setup>
import { computed } from 'vue';
import { project } from '@/config/project';

// Сцена 1: хаос. Чем дальше листаешь — тем больше непрочитанных сообщений.
const props = defineProps({ progress: { type: Number, default: 0 } });

const MESSAGES = [
  { text: 'Когда это починят?', time: '09:14', x: 8, y: 14 },
  { text: 'Пишу уже третий раз', time: '10:02', x: 58, y: 8 },
  { text: 'Кто за это отвечает?', time: '11:47', x: 64, y: 62 },
  { text: 'Срочно! Очень опасно', time: '12:30', x: 4, y: 66 },
  { text: 'Есть новости?', time: '13:05', x: 36, y: 80 },
  { text: 'Отправил фото в чат', time: '14:21', x: 70, y: 34 },
  { text: 'Ответа нет неделю', time: '15:40', x: 2, y: 40 },
];

const visible = computed(() => Math.max(2, Math.ceil(props.progress * MESSAGES.length)));
</script>

<template>
  <div class="scene scene-problem">
    <div
      v-for="(m, i) in MESSAGES"
      :key="m.text"
      class="msg"
      :class="{ show: i < visible }"
      :style="{ left: `${m.x}%`, top: `${m.y}%`, transitionDelay: `${i * 30}ms` }"
    >
      <span class="msg-text">{{ m.text }}</span>
      <span class="msg-meta">{{ m.time }} · не прочитано</span>
    </div>
    <div class="problem-stat">
      <span class="stat-xl">{{ project.problem.stat }}</span>
      <span class="problem-text">{{ project.problem.text }}</span>
    </div>
  </div>
</template>
