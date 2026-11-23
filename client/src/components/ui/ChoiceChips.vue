<script setup>
// options: [{ value, label }] — выбор одного варианта чипами
const model = defineModel();
defineProps({ options: { type: Array, required: true }, label: String });
</script>

<template>
  <div class="chips" role="group" :aria-label="label">
    <button v-for="o in options" :key="o.value" type="button" class="chip" :aria-pressed="model === o.value" @click="model = o.value">
      {{ o.label }}
    </button>
  </div>
</template>
