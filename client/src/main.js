import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'leaflet/dist/leaflet.css';
import './styles/index.css';
import App from './App.vue';
import { router } from './router';
import { initTheme } from './composables/useTheme';

initTheme();
createApp(App).use(createPinia()).use(router).mount('#app');
