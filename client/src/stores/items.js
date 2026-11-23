import { defineStore } from 'pinia';
import { ref } from 'vue';
import { crudApi } from '@/api/crud';
import { getSocket } from '@/realtime/socket';
import { project } from '@/config/project';
import { useToast } from '@/composables/useToast';

const NAME = project.mainCollection;
const api = crudApi(NAME);

export const useItemsStore = defineStore('items', () => {
  const items = ref([]);
  const loading = ref(false);
  let subscribed = false;

  async function fetch(params) {
    loading.value = true;
    try {
      items.value = await api.list(params);
    } finally {
      loading.value = false;
    }
  }

  const create = (data) => api.create(data);
  const update = (id, data) => api.update(id, data);
  const remove = (id) => api.remove(id);

  // Realtime: все открытые экраны обновляются сами
  function subscribe() {
    if (subscribed) return;
    subscribed = true;
    const socket = getSocket();
    const { push } = useToast();

    socket.on(`${NAME}:created`, (item) => {
      if (!items.value.some((x) => x.id === item.id)) items.value.unshift(item);
      push(`Новая запись: ${item.title || 'без названия'}`, 'success');
    });
    socket.on(`${NAME}:updated`, (item) => {
      const i = items.value.findIndex((x) => x.id === item.id);
      if (i !== -1) items.value[i] = item;
    });
    socket.on(`${NAME}:deleted`, ({ id }) => {
      items.value = items.value.filter((x) => x.id !== id);
    });
  }

  return { items, loading, fetch, create, update, remove, subscribe };
});
