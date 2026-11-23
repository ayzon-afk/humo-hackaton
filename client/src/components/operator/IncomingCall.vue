<script setup>
import { computed, watch } from 'vue';
import { Bot, Check, Mic, Phone, PhoneOff, X } from 'lucide-vue-next';
import { operatorConfig } from '@/config/operator';
import { useOperatorStore } from '@/stores/operator';
import { useRingtone } from '@/composables/useRingtone';
import { useVoiceConfirm } from '@/composables/useVoiceConfirm';
import { formatNumber, humanizeKeys } from '@/composables/useFormat';

// «Звонок» от AI: агент заметил проблему и спрашивает решение голосом. Живёт поверх любой страницы CRM.
const store = useOperatorStore();
const ringtone = useRingtone();
const { phase, heard, outcome, run, hear, decide, cancel } = useVoiceConfirm();

const proposal = computed(() => store.incoming);
const LABELS = {
  idle: 'Входящий звонок',
  speaking: 'Говорит',
  listening: 'Слушаю — скажите «да» или «нет»',
  waiting: 'Ответьте голосом или кнопкой',
  working: 'Выполняю',
  done: 'Готово',
};
const OUTCOME_TONE = { done: 'success', failed: 'danger', rejected: 'info' };

watch(proposal, (p, previous) => {
  if (p && !previous) ringtone.start();
  // решение приняли на другом устройстве, пока звонок ещё звонил
  if (p && p.status !== 'pending' && phase.value === 'idle') close();
});

function answer() {
  ringtone.stop();
  run(proposal.value);
}

function close() {
  ringtone.stop();
  cancel();
  store.incoming = null; // предложение остаётся в списке «Ждут решения»
}

watch(phase, (p) => p === 'done' && setTimeout(close, 3500));
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="proposal" class="sheet-scrim call-scrim">
        <section class="call" role="alertdialog" aria-modal="true" :aria-label="LABELS.idle">
          <div class="call-avatar" :class="{ ringing: phase === 'idle', live: phase === 'listening' }">
            <Bot aria-hidden="true" />
          </div>
          <div class="call-who">
            <span class="eyebrow-sm">{{ LABELS[phase] }}</span>
            <h2>{{ operatorConfig.name }}</h2>
          </div>

          <p class="call-text">
            {{ humanizeKeys(phase === 'idle' ? proposal.reason || proposal.summary : proposal.speech) }}
          </p>
          <p v-if="proposal.amount" class="call-amount num">
            {{ formatNumber(proposal.amount) }} {{ operatorConfig.currency }}
          </p>
          <p v-if="heard" class="call-heard">Вы: «{{ heard }}»</p>
          <p v-if="outcome" class="status call-result" :data-tone="OUTCOME_TONE[outcome.status]">
            {{ outcome.result }}
          </p>

          <div v-if="phase === 'idle'" class="call-actions">
            <button class="call-btn decline" aria-label="Позже" @click="close"><PhoneOff /></button>
            <button class="call-btn accept" aria-label="Ответить" @click="answer"><Phone /></button>
          </div>
          <div v-else-if="phase !== 'done'" class="call-actions">
            <button class="call-btn decline" aria-label="Нет" :disabled="phase === 'working'" @click="decide(false)">
              <X />
            </button>
            <button class="call-btn neutral" aria-label="Сказать ещё раз" :disabled="phase !== 'waiting'" @click="hear">
              <Mic />
            </button>
            <button class="call-btn accept" aria-label="Да" :disabled="phase === 'working'" @click="decide(true)">
              <Check />
            </button>
          </div>
          <button v-else class="btn btn-secondary btn-block" @click="close">Закрыть</button>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
