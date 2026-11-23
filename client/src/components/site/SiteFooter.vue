<script setup>
import { project } from '@/config/project';
</script>

<template>
  <footer class="site-footer">
    <div class="site-container flex justify-between gap-4 flex-wrap">
      <span>© 2026 {{ project.name }}</span>
      <span>Сделано командой {{ project.team }}</span>
    </div>
  </footer>
</template>
