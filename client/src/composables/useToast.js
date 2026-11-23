import { ref } from 'vue';

const toasts = ref([]);
let counter = 0;

/** tone: 'success' | 'error' | 'info' */
export function useToast() {
  function push(text, tone = 'info', ms = 3200) {
    const id = ++counter;
    toasts.value.push({ id, text, tone });
    setTimeout(() => (toasts.value = toasts.value.filter((t) => t.id !== id)), ms);
  }
  return { toasts, push };
}
