import { defineStore } from 'pinia';
import { ref } from 'vue';
import { operatorApi } from '@/api/operator';
import { getSocket } from '@/realtime/socket';

/** AI-управляющий: счёт, склад, решения, которые ждут человека, и входящий «звонок» */
export const useOperatorStore = defineStore('operator', () => {
  const state = ref(null);
  const incoming = ref(null); // предложение агента, по которому сейчас «звоним»
  let subscribed = false;

  async function load() {
    state.value = await operatorApi.state();
  }

  async function decide(proposal, approve) {
    const updated = await (approve ? operatorApi.confirm(proposal.id) : operatorApi.reject(proposal.id));
    await load(); // баланс, склад и журнал поменялись
    return updated;
  }

  /** Подписка на живые события. canDecide — может ли текущий пользователь принимать решения. */
  function subscribe(canDecide) {
    if (subscribed) return;
    subscribed = true;
    const socket = getSocket();

    socket.on('operator:proposal', (proposal) => {
      if (state.value && !state.value.pending.some((p) => p.id === proposal.id)) state.value.pending.unshift(proposal);
      // звоним только по инициативе агента: на свою команду человек и так смотрит в экран
      if (proposal.source === 'agent' && canDecide() && !incoming.value) incoming.value = proposal;
    });
    socket.on('operator:resolved', (proposal) => {
      if (incoming.value?.id === proposal.id) incoming.value = { ...incoming.value, status: proposal.status };
      if (state.value) load();
    });
    socket.on('inventory:updated', (item) => {
      if (state.value) state.value.stock = state.value.stock.map((i) => (i.id === item.id ? item : i));
    });
  }

  return { state, incoming, load, decide, subscribe };
});
