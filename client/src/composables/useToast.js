import { ref } from 'vue';

const toasts = ref([]);
let counter = 0;

export function useToast() {
  function push(text, type = 'info', ms = 3500) {
    const id = ++counter;
    toasts.value.push({ id, text, type });
    setTimeout(() => (toasts.value = toasts.value.filter((t) => t.id !== id)), ms);
  }
  return { toasts, push };
}
