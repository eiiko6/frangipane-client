<template>
  <ul>
    <li v-for="(m, i) in messages" :key="i" class="message" :class="{ 'is-me': m.sender_uuid === currentUserUuid }">
      <div class="sender-info">
        <img :src="getAvatarUrl(m.sender_uuid)" @error="handleAvatarError" class="avatar" />
        <div class="sender">{{ m.sender }}</div>
        <span class="timestamp">{{ m.sent_at }}</span>
      </div>
      <div class="message-content">{{ m.content }}</div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Message } from '../types'
import { getAvatarUrl } from '../store.ts'
import defaultAvatar from '../assets/default-avatar.png'
import { getAuthData } from '../store.ts';

defineProps<{ messages: Message[] }>()

const currentUserUuid = ref<string | null>(null)

onMounted(async () => {
  const auth = await getAuthData()
  if (auth.user) {
    currentUserUuid.value = auth.user.uuid
  }
})

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = defaultAvatar;
};
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
  /* gap: 0.5rem; */
  background: var(--panel-accent);
  padding: 0;
  max-width: 80%;
  width: fit-content;
  align-self: flex-start;
  /* border: 1px solid var(--border); */
  border-radius: var(--radius);
}

.sender-info {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.7rem;
  /* border: 1px solid var(--border); */
  border-bottom: 1px solid var(--border);
  /* border-radius: var(--radius) var(--radius) 0 0; */
  /* background-color: rgba(255, 255, 255, 0.02); */
  width: 100%;
  padding: 5px 18px;
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
  padding-left: 10px;
}

.sender {
  font-weight: bold;
  font-size: 1.1rem;
  /* flex: 1; */
}

.timestamp {
  font-weight: normal;
  opacity: 0.7;
  font-size: 0.7rem;
}

.message-content {
  padding: 10px;
  padding-left: 1rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
  display: block;
}
</style>
