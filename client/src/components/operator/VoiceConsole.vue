<script setup>
import { nextTick, ref } from 'vue';
import { ArrowUp, Mic, Square, Volume2 } from 'lucide-vue-next';
import { operatorApi } from '@/api/operator';
import { operatorConfig } from '@/config/operator';
import { useToast } from '@/composables/useToast';
import { useVoice } from '@/composables/useVoice';
import { useVoiceConfirm } from '@/composables/useVoiceConfirm';
import { humanizeKeys } from '@/composables/useFormat';
import ChatMessage from '@/components/ai/ChatMessage.vue';

// Голосовое управление: сказал → AI ответил голосом → если нужно действие, спросил «да/нет»
const { push } = useToast();
const { speaking, listening, speak, listen, stopAll, canListen } = useVoice();
const { phase, run: confirmByVoice, decide } = useVoiceConfirm();

const messages = ref([{ role: 'assistant', content: operatorConfig.greeting }]);
const input = ref('');
const loading = ref(false);
const box = ref(null);

async function say(role, content) {
  messages.value.push({ role, content: humanizeKeys(content) });
  await nextTick();
  box.value?.scrollTo({ top: box.value.scrollHeight, behavior: 'smooth' });
}

async function ask(text = input.value) {
  text = text.trim();
  if (!text || loading.value) return;
  input.value = '';
  say('user', text);
  loading.value = true;
  try {
    const { reply, proposals } = await operatorApi.command(text);
    say('assistant', reply);
    // есть действие — спрашиваем подтверждение голосом, иначе просто зачитываем ответ
    if (proposals.length) await confirmByVoice(proposals[0]);
    else await speak(reply);
  } catch (e) {
    push(e.message, 'error');
  } finally {
    loading.value = false;
  }
}

async function talk() {
  if (speaking.value || listening.value) return stopAll();
  try {
    const heard = await listen();
    if (heard) ask(heard);
  } catch (e) {
    push(e.message, 'error');
  }
}

async function briefing() {
  try {
    const { text } = await operatorApi.briefing();
    say('assistant', text);
    await speak(text);
  } catch (e) {
    push(e.message, 'error');
  }
}
</script>

<template>
  <section class="card chat voice">
    <div class="card-header">
      <span class="card-title">Голосовое управление</span>
      <button class="btn btn-ghost btn-sm" @click="briefing"><Volume2 aria-hidden="true" />Брифинг</button>
    </div>

    <div ref="box" class="chat-scroll">
      <ChatMessage v-for="(m, i) in messages" :key="i" v-bind="m" />
      <div v-if="loading" class="bubble assistant typing" aria-label="Думает"><i /><i /><i /></div>
    </div>

    <div v-if="['speaking', 'listening', 'waiting'].includes(phase)" class="voice-confirm">
      <span class="text-sm">{{ phase === 'listening' ? 'Слушаю «да» или «нет»' : 'Подтвердите' }}</span>
      <button class="btn btn-ghost btn-sm" @click="decide(false)">Нет</button>
      <button class="btn btn-secondary btn-sm" @click="decide(true)">Да, выполнить</button>
    </div>
    <div v-else-if="messages.length === 1" class="suggestions">
      <button
        v-for="s in operatorConfig.suggestions"
        :key="s"
        class="btn btn-secondary btn-sm btn-pill"
        @click="ask(s)"
      >
        {{ s }}
      </button>
    </div>

    <form class="composer" @submit.prevent="ask()">
      <button
        v-if="canListen"
        type="button"
        class="btn btn-primary mic"
        :class="{ live: listening }"
        :aria-label="listening || speaking ? 'Остановить' : 'Сказать голосом'"
        @click="talk"
      >
        <Square v-if="listening || speaking" /><Mic v-else />
      </button>
      <input v-model="input" class="input" placeholder="Скажите или напишите команду" aria-label="Команда" />
      <button class="btn btn-secondary" :disabled="!input.trim() || loading" aria-label="Отправить"><ArrowUp /></button>
    </form>
  </section>
</template>
