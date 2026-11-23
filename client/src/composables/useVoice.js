import { ref } from 'vue';
import { operatorConfig } from '@/config/operator';

/**
 * Голос AI: синтез речи (говорит) и распознавание (слушает) — встроены в браузер, ключи не нужны.
 * Распознавание есть в Chrome, Edge и Safari, микрофон работает только по HTTPS или на localhost.
 * Где не поддерживается — интерфейс остаётся на кнопках.
 */
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
export const canSpeak = 'speechSynthesis' in window;
export const canListen = Boolean(Recognition);

const speaking = ref(false);
const listening = ref(false);
let utterance = null; // держим ссылку: иначе Chrome может потерять событие end
let recognition = null;

const ERRORS = {
  'not-allowed': 'Нет доступа к микрофону — разрешите его в браузере',
  'service-not-allowed': 'Нет доступа к микрофону — разрешите его в браузере',
  network: 'Для распознавания речи нужен интернет',
  'audio-capture': 'Микрофон не найден',
};

function pickVoice() {
  const lang = operatorConfig.voiceLang.slice(0, 2);
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith(lang));
  return voices.find((v) => /google|natural|online/i.test(v.name)) ?? voices[0] ?? null;
}

/** Произнести текст. Promise завершается, когда AI договорил. */
function speak(text) {
  if (!canSpeak || !text) return Promise.resolve();
  window.speechSynthesis.cancel();
  return new Promise((resolve) => {
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = operatorConfig.voiceLang;
    utterance.rate = operatorConfig.voiceRate;
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = utterance.onerror = () => {
      speaking.value = false;
      resolve();
    };
    speaking.value = true;
    window.speechSynthesis.speak(utterance);
  });
}

/** Послушать одну фразу. Возвращает распознанный текст ('' — если промолчали). */
function listen({ timeoutMs = 8000 } = {}) {
  if (!canListen) return Promise.reject(new Error('Браузер не распознаёт речь — ответьте кнопкой'));
  recognition?.abort();
  return new Promise((resolve, reject) => {
    const current = new Recognition();
    recognition = current;
    current.lang = operatorConfig.voiceLang;
    current.interimResults = false;
    current.maxAlternatives = 1;
    let heard = '';
    const timer = setTimeout(() => current.stop(), timeoutMs);
    current.onresult = (event) => (heard = event.results[0][0].transcript);
    current.onerror = (event) => {
      if (ERRORS[event.error]) reject(new Error(ERRORS[event.error]));
    };
    current.onend = () => {
      clearTimeout(timer);
      listening.value = false;
      if (recognition === current) recognition = null;
      resolve(heard.trim());
    };
    listening.value = true;
    current.start();
  });
}

function stopAll() {
  if (canSpeak) window.speechSynthesis.cancel();
  recognition?.abort();
}

export function useVoice() {
  return { speaking, listening, speak, listen, stopAll, canSpeak, canListen };
}
