<script setup>
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
</script>

<template>
  <div class="drawer lg:drawer-open">
    <input id="app-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col min-h-screen">
      <Navbar />
      <main class="flex-1 p-4 lg:p-6">
        <RouterView />
      </main>
    </div>
    <Sidebar />
  </div>
</template>
