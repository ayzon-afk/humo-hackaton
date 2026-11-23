<script setup>
// options: [{ value, label, count? }]
const model = defineModel({ type: [String, Number, Boolean], default: null });
defineProps({ options: { type: Array, required: true }, block: Boolean, label: String });
</script>

<template>
  <div class="segmented" :class="{ block }" role="group" :aria-label="label">
    <button
      v-for="o in options"
      :key="o.value ?? 'all'"
      type="button"
      :aria-pressed="model === o.value"
      @click="model = o.value"
    >
      {{ o.label }}<span v-if="o.count != null" class="count">{{ o.count }}</span>
    </button>
  </div>
</template>
