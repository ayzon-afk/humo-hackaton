<script setup>
defineProps({ role: String, content: String });
</script>

<template>
  <div class="bubble" :class="role">{{ content }}</div>
</template>
