<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="modal">
      <!-- <h2>User Profile</h2> -->

      <div class="profile-content">
        <img :src="getAvatarUrl(userUuid)" @error="handleAvatarError" class="avatar-large" />

        <div class="info-group">
          <label>{{ $t('profile-username') }}</label>
          <div class="info-value">{{ username }}</div>
        </div>

        <div class="info-group">
          <label>{{ $t('profile-userid') }}</label>
          <div class="info-value uuid">{{ userUuid }}</div>
        </div>
      </div>

      <div class="actions">
        <!-- Friend Button -->
        <div v-if="!isMe && !isLoading" class="friend-actions">
          <button v-if="isFriend" class="btn-danger" @click="requestRemoveFriend" :disabled="isActionLoading">
            {{ $t('profile-remove-friend') }}
          </button>

          <button v-else class="btn-primary" @click="handleAddFriend" :disabled="isActionLoading || requestSent">
            {{ requestSent ? $t('profile-request-sent') : $t('profile-add-friend') }}
          </button>
        </div>

        <button type="button" @click="emit('close')" class="secondary">
          {{ $t('shared-close') }}
        </button>
      </div>
    </div>
  </div>

  <ConfirmModal v-if="modalState.visible" :title="modalState.title" :message="modalState.message"
    :confirm-label="modalState.confirmLabel" :confirm-button-class="modalState.isDanger ? 'btn-danger' : ''"
    @yes="handleConfirmRemove" @no="closeConfirmModal" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { getAvatarUrl, getAuthData } from '../store.ts'
import { checkIsFriend, removeFriend, sendFriendRequest } from '../api/friends'
import defaultAvatar from '../assets/default-avatar.png'
import ConfirmModal from './ConfirmModal.vue'
import { useFluent } from 'fluent-vue'

const { $t } = useFluent()

const props = defineProps<{
  username: string
  userUuid: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const currentUserUuid = ref<string | null>(null)
const isFriend = ref(false)
const isLoading = ref(true)
const isActionLoading = ref(false)
const requestSent = ref(false)

// Confirm Modal State
const modalState = reactive({
  visible: false,
  title: '',
  message: '',
  confirmLabel: '',
  isDanger: false
});

const isMe = computed(() => currentUserUuid.value === props.userUuid)

onMounted(async () => {
  try {
    const auth = await getAuthData()
    if (auth.user) {
      currentUserUuid.value = auth.user.uuid
    }

    // Only check if not self
    if (currentUserUuid.value && currentUserUuid.value !== props.userUuid) {
      isFriend.value = await checkIsFriend(props.userUuid)
    }
  } catch (error) {
    console.error("Failed to check friend status", error)
  } finally {
    isLoading.value = false
  }
})

const handleAddFriend = async () => {
  isActionLoading.value = true
  try {
    await sendFriendRequest(props.username)
    requestSent.value = true
  } catch (error) {
    console.error("Failed to send friend request", error)
  } finally {
    isActionLoading.value = false
  }
}

const requestRemoveFriend = () => {
  modalState.title = $t('profile-remove-friend');
  modalState.message = $t('profile-remove-friend-confirm', { user: props.username });
  modalState.confirmLabel = $t('shared-delete'); // or 'shared-confirm'
  modalState.isDanger = true;
  modalState.visible = true;
};

const closeConfirmModal = () => {
  modalState.visible = false;
};

const handleConfirmRemove = async () => {
  closeConfirmModal();
  isActionLoading.value = true;

  try {
    await removeFriend(props.userUuid)
    isFriend.value = false
  } catch (error) {
    console.error("Failed to remove friend", error)
  } finally {
    isActionLoading.value = false
  }
};

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = defaultAvatar;
};
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.avatar-large {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}

.info-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 500;
  background: var(--panel-accent);
  padding: 0.75rem;
  border-radius: var(--radius);
  word-break: break-all;
}

.info-value.uuid {
  font-family: monospace;
  font-size: 0.9rem;
  opacity: 0.8;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.friend-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary {
  background-color: var(--accent);
  color: var(--bg);
  border: 1px solid var(--accent);
  padding: 8px 16px;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--accent-hover);
}

.btn-danger {
  background-color: transparent;
  border: 1px solid var(--error);
  color: var(--error);
  padding: 8px 16px;
  border-radius: var(--radius);
  cursor: pointer;
}

.btn-danger:hover:not(:disabled) {
  background-color: var(--error);
  color: white;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary {
  margin-left: auto;
}
</style>
