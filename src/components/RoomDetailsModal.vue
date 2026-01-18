<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="modal">
      <h2>{{ roomName }}</h2>
      <h3 v-if="!isGlobal">Members:</h3>

      <ul v-if="!isGlobal" class="member-list">
        <li v-for="user in users" :key="user.uuid || user.username" class="member-item" :class="{
          'is-owner': user.uuid === ownerUuid,
          'selectable': isTransferringOwnership && user.uuid !== ownerUuid,
          'dimmed': isTransferringOwnership && user.uuid === currentUserUuid
        }" @click="handleUserClick(user)">
          <img :src="getAvatarUrl(user.uuid)" @error="handleAvatarError" class="avatar" alt="avatar" />
          <span class="member-name">{{ user.username }}</span>
        </li>
      </ul>

      <p v-else class="global-tag">
        <i class="fa-solid fa-earth"></i>
        {{ $t('chat-room-global') }}
      </p>

      <div class="buttons">
        <button v-if="!isGlobal && !isOwner && !isTransferringOwnership" class="btn" @click="requestLeave"
          :disabled="isLoading">
          {{ $t('chat-room-actions-leave') }}
        </button>

        <button v-if="isOwner && !isTransferringOwnership" class="btn delete-btn" @click="requestDelete"
          :disabled="isLoading || isTransferringOwnership">
          {{ $t('chat-room-actions-delete') }}
        </button>

        <button v-if="!isGlobal && isOwner" class="btn ownership-btn" :class="{ 'active': isTransferringOwnership }"
          @click="toggleTransferMode" :disabled="isLoading">
          {{ isTransferringOwnership ? $t('shared-cancel') : $t('chat-room-actions-ownership') }}
        </button>
      </div>

      <div class="actions">
        <button @click="emit('close')" class="secondary">
          {{ $t('shared-close') }}
        </button>
      </div>
    </div>
  </div>

  <ConfirmModal v-if="modalState.visible" :title="modalState.title" :message="modalState.message"
    :confirm-label="modalState.confirmLabel" :confirm-button-class="modalState.isDanger ? 'btn-danger' : ''"
    @yes="handleConfirmAction" @no="closeConfirmModal" />

</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive } from 'vue';
import { UserProfile } from '../types';
import { deleteRoom, leaveRoom, listMembers, transferOwnership } from '../api/rooms';
import { getAuthData, getAvatarUrl } from '../store.ts';
import defaultAvatar from '../assets/default-avatar.png';
import ConfirmModal from './ConfirmModal.vue';
import { useFluent } from 'fluent-vue';

const { $t } = useFluent()

const props = defineProps<{ roomUuid: string, roomName: string, isGlobal: boolean, ownerUuid: string }>()
const emit = defineEmits(['close', 'room-changed']);

const users = ref<UserProfile[]>([]);
const isLoading = ref(false);
const currentUserUuid = ref<string>('');

const isTransferringOwnership = ref(false);
const targetTransferUser = ref<UserProfile | null>(null);

type ActionType = 'leave' | 'delete' | 'transfer' | null;

const modalState = reactive({
  visible: false,
  type: null as ActionType,
  title: '',
  message: '',
  confirmLabel: '',
  isDanger: false
});

const requestLeave = () => {
  modalState.type = 'leave';
  modalState.title = $t('chat-room-actions-leave');
  modalState.message = $t('chat-room-actions-leave-confirm');
  modalState.confirmLabel = $t('shared-leave');
  modalState.isDanger = false;
  modalState.visible = true;
};

const requestDelete = () => {
  modalState.type = 'delete';
  modalState.title = $t('chat-room-actions-delete');
  modalState.message = $t('chat-room-actions-delete-confirm');
  modalState.confirmLabel = $t('shared-delete');
  modalState.isDanger = true;
  modalState.visible = true;
};

const toggleTransferMode = () => {
  isTransferringOwnership.value = !isTransferringOwnership.value;
};

const handleUserClick = (user: UserProfile) => {
  if (!isTransferringOwnership.value || user.uuid === currentUserUuid.value) {
    return;
  }

  targetTransferUser.value = user;

  modalState.type = 'transfer';
  modalState.title = $t('chat-room-actions-ownership');
  modalState.message = $t('chat-room-actions-ownership-confirm', { user: user.username });
  modalState.confirmLabel = $t('shared-confirm');
  modalState.isDanger = true;
  modalState.visible = true;
};

const closeConfirmModal = () => {
  modalState.visible = false;
  modalState.type = null;
  targetTransferUser.value = null;
};

const handleConfirmAction = async () => {
  const actionType = modalState.type;
  const userToTransfer = targetTransferUser.value;

  closeConfirmModal();
  isTransferringOwnership.value = false;

  isLoading.value = true;

  try {
    if (actionType === 'leave') {
      await leaveRoom(props.roomUuid);
      emit('room-changed');
      emit('close');
    } else if (actionType === 'delete') {
      await deleteRoom(props.roomUuid);
      emit('room-changed');
      emit('close');
    } else if (actionType === 'transfer' && userToTransfer) {
      console.log("ownership")
      await transferOwnership(props.roomUuid, userToTransfer.uuid);
      emit('room-changed');
      emit('close');
    }
  } catch (error) {
    console.error(`Failed to ${actionType} room:`, error);
  } finally {
    isLoading.value = false;
  }
};

const isOwner = computed(() => {
  return currentUserUuid.value === props.ownerUuid;
});

onMounted(async () => {
  const auth = await getAuthData();
  currentUserUuid.value = auth.user?.uuid || 'undefined';

  if (!props.isGlobal) {
    users.value = await listMembers(props.roomUuid);
  }
});

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
  z-index: 500;
}

.modal {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.member-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
}

.member-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding: 5px;
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
}

.member-name {
  font-size: 0.85rem;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-item.is-owner .avatar {
  border: 2px solid var(--accent);
}

.member-item.is-owner .member-name {
  color: var(--accent);
  font-weight: 600;
}

.member-item.dimmed {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(1);
}

.member-item.selectable {
  cursor: pointer;
  background-color: rgba(var(--accent-rgb, 100, 100, 255), 0.1);
  border: 1px solid var(--border);
}

.member-item.selectable:hover {
  background-color: var(--accent);
  color: var(--bg);
}

.member-item.selectable:hover .member-name {
  color: var(--bg);
}

.global-tag {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.buttons {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 22px;
}

.btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  font-size: 0.9rem;
  color: var(--text);
  background-color: transparent;
  border-radius: var(--radius);
  width: fit-content;
  border: 1px solid var(--accent);
  transition: all 0.2s ease;
}

.btn:hover {
  color: var(--accent)
}

.btn:hover i {
  color: var(--accent)
}

.btn i {
  font-size: 1.25rem;
}

.delete-btn {
  border: 1px solid var(--error);
}

.delete-btn:hover {
  color: var(--error)
}

.delete-btn:hover i {
  color: var(--error)
}

.ownership-btn {
  border: 1px solid var(--accent-second);
}

.ownership-btn:hover,
.ownership-btn.active {
  background-color: var(--accent-second);
  color: white;
}

.ownership-btn:hover i {
  color: white;
}
</style>
