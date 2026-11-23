import { ref } from 'vue';
import { operatorConfig } from '@/config/operator';
import { useOperatorStore } from '@/stores/operator';
import { useToast } from '@/composables/useToast';
import { humanizeKeys } from '@/composables/useFormat';
import { useVoice } from '@/composables/useVoice';

/** «да» / «нет» / null — по словам из config/operator.js */
export function parseAnswer(text) {
  const phrase = ` ${text.toLowerCase().replace(/[.,!?]/g, ' ')} `;
  if (operatorConfig.noWords.some((w) => phrase.includes(` ${w} `))) return 'no';
  if (operatorConfig.yesWords.some((w) => phrase.includes(` ${w} `))) return 'yes';
  return null;
}

/**
 * Подтверждение голосом: AI проговаривает предложение, слушает «да/нет», выполняет и озвучивает итог.
 * Кнопки «Да/Нет» работают на любом шаге — на случай шума в зале или браузера без микрофона.
 * phase: idle → speaking → listening → waiting (ждём кнопку) → working → done
 */
export function useVoiceConfirm() {
  const store = useOperatorStore();
  const { push } = useToast();
  const { speak, listen, stopAll, canListen } = useVoice();
  const phase = ref('idle');
  const heard = ref('');
  const outcome = ref(null);
  let current = null;

  async function decide(approve) {
    if (!current || ['working', 'done'].includes(phase.value)) return;
    stopAll();
    phase.value = 'working';
    try {
      outcome.value = await store.decide(current, approve);
    } catch (e) {
      outcome.value = { status: 'failed', result: e.message };
      push(e.message, 'error');
    }
    phase.value = 'done';
    await speak(approve || outcome.value.status === 'failed' ? outcome.value.result : 'Хорошо, не делаю.');
  }

  async function hear() {
    if (!canListen) {
      phase.value = 'waiting';
      return;
    }
    phase.value = 'listening';
    try {
      heard.value = await listen();
    } catch (e) {
      push(e.message, 'error');
    }
    if (phase.value !== 'listening') return; // уже нажали кнопку
    const answer = parseAnswer(heard.value);
    if (answer) return decide(answer === 'yes');
    phase.value = 'waiting';
    await speak('Не расслышал. Скажите ещё раз или нажмите кнопку.');
  }

  async function run(proposal) {
    current = proposal;
    heard.value = '';
    outcome.value = null;
    phase.value = 'speaking';
    await speak(humanizeKeys(proposal.speech));
    if (phase.value === 'speaking') await hear();
  }

  function cancel() {
    stopAll();
    current = null;
    phase.value = 'idle';
  }

  return { phase, heard, outcome, run, hear, decide, cancel };
}
