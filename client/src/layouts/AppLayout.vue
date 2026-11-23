<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '@/components/layout/Sidebar.vue';
import Topbar from '@/components/layout/Topbar.vue';
import IncomingCall from '@/components/operator/IncomingCall.vue';
import { operatorConfig } from '@/config/operator';
import { useAuthStore } from '@/stores/auth';
import { useOperatorStore } from '@/stores/operator';

const navOpen = ref(false);
const route = useRoute();
const auth = useAuthStore();

// AI-управляющий может «позвонить» на любой странице CRM
useOperatorStore().subscribe(() => operatorConfig.deciderRoles.includes(auth.user?.role));
watch(
  () => route.fullPath,
  () => (navOpen.value = false),
);
</script>

<template>
  <div class="shell" :class="{ 'nav-open': navOpen }">
    <Sidebar />
    <div class="scrim" @click="navOpen = false" />
    <div class="main">
      <Topbar @menu="navOpen = true" />
      <main class="content">
        <RouterView v-slot="{ Component }">
          <Transition name="page" appear>
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
    <IncomingCall />
  </div>
</template>
