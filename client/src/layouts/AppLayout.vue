<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '@/components/layout/Sidebar.vue';
import Topbar from '@/components/layout/Topbar.vue';

const navOpen = ref(false);
const route = useRoute();
watch(() => route.fullPath, () => (navOpen.value = false));
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
  </div>
</template>
