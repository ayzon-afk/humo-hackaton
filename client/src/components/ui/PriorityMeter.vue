<script setup>
defineProps({ value: { type: Number, default: 0 } });
</script>

<template>
  <span
    class="priority"
    :class="{ high: value >= 5 }"
    :title="`Приоритет ${value} из 5`"
    role="img"
    :aria-label="`Приоритет ${value} из 5`"
  >
    <i v-for="n in 5" :key="n" :class="{ on: n <= value }" />
  </span>
</template>
