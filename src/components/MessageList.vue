<template>
  <ul :class="{ 'is-compact': isCompact }">
    <li v-for="(m, i) in messages" :key="i" class="message" :class="{ 'is-me': m.sender_uuid === currentUserUuid }">
      <div class="sender-info">
        <img :src="getAvatarUrl(m.sender_uuid)" @error="handleAvatarError" class="avatar clickable"
          @click.stop="openUserProfile(m)" />
        <div class="sender clickable" @click.stop="openUserProfile(m)">
          {{ m.sender }}
        </div>
        <span class="timestamp">{{ m.sent_at }}</span>
      </div>
      <div class="message-content">{{ m.content }}</div>
    </li>
  </ul>

  <UserProfileModal v-if="selectedUser" :username="selectedUser.name" :user-uuid="selectedUser.uuid"
    @close="selectedUser = null" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Message } from '../types'
import { getAvatarUrl, getCompactLayoutPreference } from '../store.ts'
import defaultAvatar from '../assets/default-avatar.png'
import { getAuthData } from '../store.ts';
import UserProfileModal from './UserProfileModal.vue';

defineProps<{ messages: Message[] }>()

const currentUserUuid = ref<string | null>(null)
const isCompact = ref(false)

const selectedUser = ref<{ name: string, uuid: string } | null>(null)

onMounted(async () => {
  const auth = await getAuthData()
  if (auth.user) {
    currentUserUuid.value = auth.user.uuid
  }
  isCompact.value = await getCompactLayoutPreference()
})

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = defaultAvatar;
};

const openUserProfile = (message: Message) => {
  selectedUser.value = {
    name: message.sender,
    uuid: message.sender_uuid
  }
}
</script>

<style scoped>
ul {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 0;
  max-width: 80%;
  width: fit-content;
  align-self: flex-start;
  border-radius: var(--radius);
  background: var(--panel-accent);
}

.sender-info {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.7rem;
  border-bottom: 1px solid var(--border);
  width: 100%;
  padding: 5px 18px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}

.clickable:hover {
  opacity: 0.8;
}

.sender.clickable:hover {
  text-decoration: underline;
}

.message-content {
  padding: 10px;
  padding-left: 1rem;
  padding-right: 1rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
  display: block;
}

.message.is-me {
  align-self: flex-end;
  align-items: flex-end;
}

.message.is-me .sender-info {
  flex-direction: row-reverse;
  text-align: right;
}

.message.is-me .message-content {
  text-align: right;
  padding-right: 1rem;
}

ul.is-compact .message {
  background: transparent;
  max-width: 90%;
}

ul.is-compact .sender-info {
  border-bottom: none;
  padding: 5px 18px 0 18px;
}

ul.is-compact .message-content {
  padding: 5px 10px 10px 50px;
}

ul.is-compact .message.is-me .message-content {
  padding-right: 50px;
  padding-left: 0;
  text-align: right;
}

.sender {
  font-weight: bold;
  font-size: 1.1rem;
}

.timestamp {
  font-weight: normal;
  opacity: 0.7;
  font-size: 0.7rem;
}
</style>
