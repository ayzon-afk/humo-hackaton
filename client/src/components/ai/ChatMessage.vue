<script setup>
defineProps({ role: String, content: String });
</script>

<template>
  <div class="chat" :class="role === 'user' ? 'chat-end' : 'chat-start'">
    <div class="chat-bubble whitespace-pre-wrap" :class="role === 'user' ? 'chat-bubble-primary' : ''">
      {{ content }}
    </div>
  </div>
</template>
