<script setup>
import { reactive, ref } from 'vue';
import { roleOptions } from '@/config/roles';
import ChoiceChips from '@/components/ui/ChoiceChips.vue';

const form = reactive({ name: '', email: '', password: '', role: 'user' });
const error = ref('');

function validate() {
  if (form.name.trim().length < 2) return ((error.value = 'Укажите имя'), null);
  if (!/^\S+@\S+\.\S+$/.test(form.email)) return ((error.value = 'Проверьте email'), null);
  if (form.password.length < 6) return ((error.value = 'Пароль — минимум 6 символов'), null);
  error.value = '';
  return { ...form };
}

function reset() {
  Object.assign(form, { name: '', email: '', password: '', role: 'user' });
}

defineExpose({ validate, reset });
</script>

<template>
  <div class="flex flex-col gap-5">
    <input v-model="form.name" class="title-input" placeholder="Имя и фамилия" aria-label="Имя и фамилия" autofocus />
    <label class="field"
      ><span class="label">Email</span
      ><input v-model="form.email" type="email" class="input" placeholder="name@company.uz"
    /></label>
    <label class="field"
      ><span class="label">Временный пароль</span
      ><input v-model="form.password" type="text" class="input" placeholder="Минимум 6 символов"
    /></label>
    <div class="field">
      <span class="label">Роль</span><ChoiceChips v-model="form.role" :options="roleOptions" label="Роль" />
    </div>
    <p v-if="error" class="error-text">{{ error }}</p>
  </div>
</template>
