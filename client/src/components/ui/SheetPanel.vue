<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { X } from 'lucide-vue-next';

const open = defineModel({ type: Boolean, default: false });
defineProps({ title: String, eyebrow: String });
const emit = defineEmits(['submit']);
const panel = ref(null);

// Esc — закрыть, Ctrl/⌘ + Enter — отправить
function onKey(e) {
  if (!open.value) return;
  if (e.key === 'Escape') open.value = false;
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) emit('submit');
}

// Фокус сразу в первое поле с [autofocus]
watch(open, async (v) => {
  if (!v) return;
  await nextTick();
  panel.value?.querySelector('[autofocus]')?.focus();
});

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="sheet-scrim" @click.self="open = false">
        <section ref="panel" class="sheet" role="dialog" aria-modal="true" :aria-label="title">
          <header class="sheet-header">
            <div>
              <div v-if="eyebrow" class="eyebrow-sm">{{ eyebrow }}</div>
              <h2>{{ title }}</h2>
            </div>
            <button class="btn btn-ghost btn-icon btn-sm" aria-label="Закрыть" @click="open = false"><X /></button>
          </header>
          <div class="sheet-body"><slot /></div>
          <footer v-if="$slots.footer" class="sheet-footer"><slot name="footer" /></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
