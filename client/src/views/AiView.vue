<script setup>
import AiChat from '@/components/ai/AiChat.vue';

// Системный промпт = «личность» AI под тему хакатона
const SYSTEM = 'Ты AI-ассистент проекта. Отвечай кратко, по делу, на языке пользователя (русский/узбекский/английский).';
</script>

<template>
  <div class="flex flex-col gap-4 max-w-3xl">
    <h1 class="text-2xl font-black">AI-ассистент</h1>
    <AiChat :system="SYSTEM" greeting="Привет! Я AI-ассистент проекта. Задай вопрос." />
  </div>
</template>
