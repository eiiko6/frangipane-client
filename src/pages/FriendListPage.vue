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

            <!-- Loading State -->
            <div class="wait-container" v-if="isLoading">
                <p class="wait-msg">{{ $t('friends-connecting') }}</p>
            </div>

            <!-- Empty / Error / Retry State -->
            <div class="wait-container" v-else-if="!friends || friends.length === 0">
                <p class="wait-msg">{{ $t('friends-list-empty') || 'No friends yet' }}</p>
                <button class="retry-btn" @click="loadFriends()">
                    <i class="fa-solid fa-rotate-right"></i>
                </button>
            </div>

            <!-- Content State -->
            <div class="friends" v-else>
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
import { useErrorTranslator } from '../errors'

const friends = ref<Friend[]>([])
const username = ref('')
const errorMessage = ref('')
const isLoading = ref(true)

const { translateError } = useErrorTranslator();

const selectedFriend = ref<Friend | null>(null)

async function loadFriends() {
    isLoading.value = true
    try {
        friends.value = await fetchFriends()
    } catch (err) {
        console.error("Failed to fetch friends", err)
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
    await loadFriends()
})

const openProfile = (friend: Friend) => {
    selectedFriend.value = friend
}

const handleAvatarError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    img.src = defaultAvatar;
};

async function send() {
    if (!username.value) return

    try {
        await sendFriendRequest(username.value)
        username.value = ''
        errorMessage.value = ''
        await loadFriends()
    } catch (err: any) {
        errorMessage.value = translateError(err);
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
    position: relative;
    min-width: 250px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
}

.wait-container {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    align-items: center;
    justify-content: center;
    padding: 2rem 0;
    width: 100%;
}

.wait-msg {
    color: var(--muted);
    font-size: 1.1rem;
    text-align: center;
}

.retry-btn {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    cursor: pointer;
}

.retry-btn:hover {
    background: var(--panel-hover);
}

.friend {
    width: 100%;
    box-sizing: border-box;
    background: var(--panel-light);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 0.5rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.2rem;
    cursor: pointer;
}

.friend:hover p {
    text-decoration: underline;
}

.friends-list h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
}

.avatar {
    height: 42px;
    width: 42px;
}
</style>
