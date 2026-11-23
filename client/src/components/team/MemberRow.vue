<script setup>
import { roleLabels, roleOptions } from '@/config/roles';
import { initials } from '@/composables/useFormat';

defineProps({ member: { type: Object, required: true }, editable: Boolean, isMe: Boolean });
defineEmits(['role']);
</script>

<template>
  <li class="list-row">
    <span class="avatar" style="width: 36px; height: 36px">{{ initials(member.name) }}</span>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium truncate">
        {{ member.name }} <span v-if="isMe" class="text-tertiary font-normal">· вы</span>
      </div>
      <div class="text-xs text-tertiary truncate">{{ member.email }}</div>
    </div>
    <select
      v-if="editable"
      class="select"
      style="width: 170px; height: 32px"
      :value="member.role"
      :aria-label="`Роль: ${member.name}`"
      @change="$emit('role', member, $event.target.value)"
    >
      <option v-for="r in roleOptions" :key="r.value" :value="r.value">{{ r.label }}</option>
    </select>
    <span v-else class="text-sm text-secondary">{{ roleLabels[member.role] || member.role }}</span>
  </li>
</template>
