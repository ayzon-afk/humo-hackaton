<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ShoppingCart } from 'lucide-vue-next';
import { operatorApi } from '@/api/operator';
import { operatorConfig } from '@/config/operator';
import { useOperatorStore } from '@/stores/operator';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { formatNumber } from '@/composables/useFormat';
import PageHeader from '@/components/ui/PageHeader.vue';
import VoiceConsole from '@/components/operator/VoiceConsole.vue';
import ProposalList from '@/components/operator/ProposalList.vue';
import ActionLog from '@/components/operator/ActionLog.vue';
import StockList from '@/components/operator/StockList.vue';

const store = useOperatorStore();
const { state } = storeToRefs(store);
const auth = useAuthStore();
const { push } = useToast();
const selling = ref(false);

const canDecide = computed(() => operatorConfig.deciderRoles.includes(auth.user?.role));

async function decide(proposal, approve) {
  try {
    const result = await store.decide(proposal, approve);
    push(result.result, result.status === 'failed' ? 'error' : 'success');
  } catch (e) {
    push(e.message, 'error');
  }
}

/** Сценарий для сцены: товар «продали» → через секунду AI звонит */
async function demoSale() {
  selling.value = true;
  try {
    const { item } = await operatorApi.demoSale();
    push(`Продано: ${item.name}, осталось ${item.quantity} ${item.unit}`, 'info');
  } catch (e) {
    push(e.message, 'error');
  } finally {
    selling.value = false;
  }
}

onMounted(() => store.load().catch((e) => push(e.message, 'error')));
</script>

<template>
  <div>
    <PageHeader :title="operatorConfig.name" :subtitle="operatorConfig.subtitle">
      <button v-if="canDecide" class="btn btn-ghost" :aria-busy="selling" @click="demoSale">
        <span v-if="selling" class="spinner" /><ShoppingCart v-else aria-hidden="true" />Демо: продажа
      </button>
    </PageHeader>

    <div class="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div class="flex flex-col gap-4">
        <VoiceConsole />

        <section class="card">
          <div class="card-header">
            <span class="card-title">Ждут вашего решения</span>
            <span class="text-xs text-tertiary num">{{ state?.pending.length ?? 0 }}</span>
          </div>
          <div v-if="!state" class="card-body"><div class="skeleton h-12" /></div>
          <ProposalList v-else :proposals="state.pending" :can-decide="canDecide" class="mt-2 mb-2" @decide="decide" />
        </section>

        <section class="card">
          <div class="card-header pb-4"><span class="card-title">Что сделал AI</span></div>
          <ActionLog :history="state?.history || []" />
        </section>
      </div>

      <aside class="flex flex-col gap-4">
        <section class="card card-body flex flex-col gap-1">
          <span class="metric-label">На счёте</span>
          <span class="metric-value num">{{ state ? formatNumber(state.balance) : '—' }}</span>
          <span class="text-xs text-tertiary">
            {{ state?.currency }} · лимит на одно действие {{ formatNumber(state?.maxAmount) }}
          </span>
        </section>

        <section class="card">
          <div class="card-header"><span class="card-title">Склад</span></div>
          <div v-if="!state" class="card-body"><div class="skeleton h-32" /></div>
          <StockList v-else :items="state.stock" class="mt-2 mb-2" />
        </section>
      </aside>
    </div>
  </div>
</template>
