<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Check } from 'lucide-vue-next';
import { project } from '@/config/project';

// Финал как в видео: кнопка превращается в подтверждение, затем открывается демо
const router = useRouter();
const confirmed = ref(false);

function start() {
  if (confirmed.value) return;
  confirmed.value = true;
  setTimeout(() => router.push('/login'), 700);
}
</script>

<template>
  <section class="section section-muted">
    <div class="site-container cta">
      <h2 class="headline">Попробуйте {{ project.name }}</h2>
      <p class="lead">Демо уже работает. Без установки и регистрации.</p>
      <button type="button" class="btn btn-lg btn-pill cta-button" :class="{ confirmed }" @click="start">
        <Transition name="swap" mode="out-in">
          <span v-if="confirmed" key="ok" class="flex items-center gap-2"
            ><Check aria-hidden="true" />Открываем демо</span
          >
          <span v-else key="go">Открыть демо</span>
        </Transition>
      </button>
    </div>
  </section>
</template>
