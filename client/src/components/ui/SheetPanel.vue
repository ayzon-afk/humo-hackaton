<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { X } from 'lucide-vue-next';

const open = defineModel({ type: Boolean, default: false });
defineProps({ title: String });

const onKey = (e) => e.key === 'Escape' && (open.value = false);
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="sheet-scrim" @click.self="open = false">
        <section class="sheet" role="dialog" aria-modal="true" :aria-label="title">
          <header class="sheet-header">
            <h3>{{ title }}</h3>
            <button class="btn btn-ghost btn-icon btn-sm" aria-label="Закрыть" @click="open = false"><X /></button>
          </header>
          <div class="sheet-body"><slot /></div>
          <footer v-if="$slots.footer" class="sheet-footer"><slot name="footer" /></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
