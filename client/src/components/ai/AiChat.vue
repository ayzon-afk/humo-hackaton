<script setup>
import { nextTick, ref } from 'vue';
import { aiApi } from '@/api/ai';
import ChatMessage from './ChatMessage.vue';

const props = defineProps({
  system: { type: String, default: '' },
  greeting: { type: String, default: 'Привет! Чем помочь?' },
});

const messages = ref([{ role: 'assistant', content: props.greeting }]);
const input = ref('');
const loading = ref(false);
const box = ref(null);

async function scrollDown() {
  await nextTick();
  box.value.scrollTop = box.value.scrollHeight;
}

async function send() {
  const text = input.value.trim();
  if (!text || loading.value) return;
  messages.value.push({ role: 'user', content: text });
  input.value = '';
  loading.value = true;
  scrollDown();
  try {
    const history = messages.value.slice(1); // без приветствия
    const { reply } = await aiApi.chat(history, props.system || undefined);
    messages.value.push({ role: 'assistant', content: reply });
  } catch (e) {
    messages.value.push({ role: 'assistant', content: `Ошибка: ${e.message}` });
  } finally {
    loading.value = false;
    scrollDown();
  }
}
</script>

<template>
  <div class="card bg-base-200 h-[70vh]">
    <div ref="box" class="card-body overflow-y-auto">
      <ChatMessage v-for="(m, i) in messages" :key="i" v-bind="m" />
      <div v-if="loading" class="chat chat-start">
        <div class="chat-bubble"><span class="loading loading-dots loading-sm" /></div>
      </div>
    </div>
    <form class="p-4 flex gap-2 border-t border-base-300" @submit.prevent="send">
      <input v-model="input" class="input input-bordered flex-1" placeholder="Напиши сообщение..." />
      <button class="btn btn-primary" :disabled="loading">Отправить</button>
    </form>
  </div>
</template>
