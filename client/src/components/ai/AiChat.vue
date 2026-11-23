<script setup>
import { nextTick, ref } from 'vue';
import { ArrowUp } from 'lucide-vue-next';
import { aiApi } from '@/api/ai';
import ChatMessage from './ChatMessage.vue';

const props = defineProps({
  system: { type: String, default: '' },
  greeting: { type: String, default: 'Привет! Чем помочь?' },
  suggestions: { type: Array, default: () => [] },
});

const messages = ref([{ role: 'assistant', content: props.greeting }]);
const input = ref('');
const loading = ref(false);
const box = ref(null);

async function scrollDown() {
  await nextTick();
  box.value?.scrollTo({ top: box.value.scrollHeight, behavior: 'smooth' });
}

async function send(text = input.value) {
  text = text.trim();
  if (!text || loading.value) return;
  messages.value.push({ role: 'user', content: text });
  input.value = '';
  loading.value = true;
  scrollDown();
  try {
    const { reply } = await aiApi.chat(messages.value.slice(1), props.system || undefined);
    messages.value.push({ role: 'assistant', content: reply });
  } catch (e) {
    messages.value.push({ role: 'assistant', content: `Не получилось ответить: ${e.message}` });
  } finally {
    loading.value = false;
    scrollDown();
  }
}
</script>

<template>
  <div class="card chat">
    <div ref="box" class="chat-scroll">
      <ChatMessage v-for="(m, i) in messages" :key="i" v-bind="m" />
      <div v-if="loading" class="bubble assistant typing" aria-label="Печатает"><i /><i /><i /></div>
    </div>
    <div v-if="suggestions.length && messages.length === 1" class="suggestions">
      <button v-for="s in suggestions" :key="s" class="btn btn-secondary btn-sm btn-pill" @click="send(s)">{{ s }}</button>
    </div>
    <form class="composer" @submit.prevent="send()">
      <input v-model="input" class="input" placeholder="Сообщение" aria-label="Сообщение" />
      <button class="btn btn-primary" :disabled="!input.trim() || loading" aria-label="Отправить"><ArrowUp /></button>
    </form>
  </div>
</template>
