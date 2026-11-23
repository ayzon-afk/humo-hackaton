import { onBeforeUnmount } from 'vue';

/** Мелодия входящего звонка через Web Audio (без аудиофайлов) + вибрация на телефоне. */
export function useRingtone() {
  let context = null;
  let timer = null;

  function tone(frequency, start) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.36);
  }

  function ring() {
    navigator.vibrate?.([400, 200, 400]);
    try {
      context ??= new AudioContext();
      context.resume();
      const t = context.currentTime;
      tone(660, t);
      tone(880, t + 0.4);
    } catch {
      // браузер не дал включить звук до первого клика — звонок всё равно виден на экране
    }
  }

  function start() {
    stop();
    ring();
    timer = setInterval(ring, 2000);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    navigator.vibrate?.(0);
  }

  onBeforeUnmount(() => {
    stop();
    context?.close();
  });

  return { start, stop };
}
