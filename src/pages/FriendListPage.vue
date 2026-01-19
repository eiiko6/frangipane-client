<template>
  <div class="friends-page">
    <header class="friends-header">
      <h1>{{ $t('friends-title') }}</h1>

      <form class="friend-request-form" @submit.prevent="send">
        <h3>{{ $t('friends-add-title') }}</h3>
        <div class="input-container">
          <input v-model="username" :placeholder="$t('auth-username')" autofocus />
          <button type="submit">{{ $t('friends-send-request') }}</button>
        </div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
    </header>

    <div class="friends-list">
      <h2>{{ $t('friends-list-header') }}</h2>
      <div class="friends">
        <button class="friend" v-for="friend in friends" :key="friend.uuid" @click="openProfile(friend)">
          <img :src="getAvatarUrl(friend.uuid)" @error="handleAvatarError" class="avatar" />
          <p>{{ friend.username }}</p>
        </button>
      </div>
    </div>

    <UserProfileModal v-if="selectedFriend" :username="selectedFriend.username" :user-uuid="selectedFriend.uuid"
      @close="selectedFriend = null" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchFriends, sendFriendRequest } from '../api/friends'
import type { Friend } from '../types'
import { getAvatarUrl } from '../store'
import defaultAvatar from '../assets/default-avatar.png'
import UserProfileModal from '../components/UserProfileModal.vue'

const friends = ref<Friend[]>([])
const username = ref('')
const errorMessage = ref('')

const selectedFriend = ref<Friend | null>(null)

onMounted(async () => {
  friends.value = await fetchFriends()
})

const openProfile = (friend: Friend) => {
  selectedFriend.value = friend
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = defaultAvatar;
};

async function send() {
  if (!username.value) {
    // errorMessage.value = 'Username is required.'
    return
  }

  try {
    await sendFriendRequest(username.value)
    username.value = ''
    errorMessage.value = ''
    friends.value = await fetchFriends()
  } catch (err: any) {
    errorMessage.value = err
  }
}
</script>

<style scoped>
.friends-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.friends-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.friend-request-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-container {
  display: flex;
  gap: 0.5rem;
}

.friend-request-form input {
  padding: 0.5rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  flex-grow: 1;
}

.friend-request-form button {
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
}

.error-message {
  color: var(--error);
  font-size: 0.9rem;
}

.friends-list {
  min-width: 250px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
}

.friend {
  width: 100%;
  box-sizing: border-box;
  background: var(--panel-light);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  /* padding: 0.75rem 1rem; */
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.2rem;
  margin: 0 0 0.5rem 0;
}

.friend:hover p {
  text-decoration: underline;
}

/* .friend:hover { */
/*   background-color: var(--panel-hover); */
/* } */

.friends-list h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.avatar {
  height: 42px;
  width: 42px;
}
</style>
