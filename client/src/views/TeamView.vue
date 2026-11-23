<script setup>
import { computed, onMounted, ref } from 'vue';
import { UserPlus } from 'lucide-vue-next';
import { usersApi } from '@/api/users';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { roleLabels } from '@/config/roles';
import PageHeader from '@/components/ui/PageHeader.vue';
import SkeletonRows from '@/components/ui/SkeletonRows.vue';
import SheetPanel from '@/components/ui/SheetPanel.vue';
import MemberRow from '@/components/team/MemberRow.vue';
import InviteForm from '@/components/team/InviteForm.vue';

const auth = useAuthStore();
const { push } = useToast();
const members = ref(null);
const sheetOpen = ref(false);
const saving = ref(false);
const formRef = ref(null);

const summary = computed(() => {
  const list = members.value || [];
  return Object.keys(roleLabels).map((role) => ({ role, count: list.filter((m) => m.role === role).length }));
});

async function load() {
  members.value = await usersApi.list();
}

async function changeRole(member, role) {
  try {
    const updated = await usersApi.update(member.id, { role });
    members.value = members.value.map((m) => (m.id === updated.id ? updated : m));
    push(`${member.name}: ${roleLabels[role]}`, 'success');
  } catch (e) {
    push(e.message, 'error');
    await load(); // вернуть прежнее значение в селекте
  }
}

async function invite() {
  const data = formRef.value?.validate();
  if (!data) return;
  saving.value = true;
  try {
    members.value = [...members.value, await usersApi.create(data)];
    formRef.value.reset();
    sheetOpen.value = false;
    push('Сотрудник добавлен', 'success');
  } catch (e) {
    push(e.message, 'error');
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <PageHeader title="Команда" subtitle="Кто работает в системе и с какими правами">
      <button v-if="auth.isAdmin" class="btn btn-primary" @click="sheetOpen = true">
        <UserPlus aria-hidden="true" />Добавить
      </button>
    </PageHeader>

    <div class="grid gap-4 lg:grid-cols-[1fr_280px]">
      <section class="card">
        <SkeletonRows v-if="!members" :rows="3" />
        <ul v-else class="list py-2">
          <MemberRow
            v-for="m in members"
            :key="m.id"
            :member="m"
            :editable="auth.isAdmin"
            :is-me="m.id === auth.user?.id"
            @role="changeRole"
          />
        </ul>
      </section>

      <aside class="card self-start">
        <div class="card-header"><span class="card-title">Роли</span></div>
        <ul class="list mt-3 mb-2">
          <li v-for="s in summary" :key="s.role" class="list-row">
            <span class="flex-1 text-sm">{{ roleLabels[s.role] }}</span>
            <span class="num font-medium">{{ s.count }}</span>
          </li>
        </ul>
      </aside>
    </div>

    <SheetPanel v-model="sheetOpen" title="Новый сотрудник" eyebrow="Команда" @submit="invite">
      <InviteForm ref="formRef" />
      <template #footer>
        <button class="btn btn-ghost" @click="sheetOpen = false">Отмена</button>
        <button class="btn btn-primary" :aria-busy="saving" @click="invite">
          <span v-if="saving" class="spinner" />Добавить сотрудника
        </button>
      </template>
    </SheetPanel>
  </div>
</template>
