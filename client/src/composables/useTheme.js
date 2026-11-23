import { ref } from 'vue';

const theme = ref('light');

function apply(value) {
  theme.value = value;
  document.documentElement.dataset.theme = value;
  try {
    localStorage.setItem('theme', value);
  } catch {}
}

/** По умолчанию светлая (лучше читается на проекторе). Выбор пользователя запоминается. */
export function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem('theme');
  } catch {}
  apply(saved === 'dark' ? 'dark' : 'light');
}

export function useTheme() {
  const toggle = () => apply(theme.value === 'dark' ? 'light' : 'dark');
  const setTheme = (value) => apply(value === 'dark' ? 'dark' : 'light');
  return { theme, toggle, setTheme };
}
