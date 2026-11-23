<script setup>
import AiChat from '@/components/ai/AiChat.vue';
import PageHeader from '@/components/ui/PageHeader.vue';

// Системный промпт = «личность» AI под тему хакатона
const SYSTEM =
  'Ты AI-ассистент проекта. Отвечай кратко, по делу, на языке пользователя (русский/узбекский/английский).';
const SUGGESTIONS = ['Что важно сегодня?', 'Сделай сводку за неделю', 'Какие записи срочные?'];
</script>

<template>
  <div class="max-w-3xl">
    <PageHeader title="Ассистент" subtitle="Задайте вопрос о данных — ответ за пару секунд" />
    <AiChat
      :system="SYSTEM"
      :suggestions="SUGGESTIONS"
      greeting="Здравствуйте! Я помогу разобраться в данных. Спросите что угодно."
    />
  </div>
</template>
