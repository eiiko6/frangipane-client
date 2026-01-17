<template>
    <div class="backdrop" @click.self="emit('close')">
        <div class="modal">
            <h2>{{ roomName }}</h2>
            <h3 v-if="!isGlobal">Members:</h3>

            <ul v-if="!isGlobal" class="member-list">
                <li v-for="user in users" :key="user.uuid || user.username" class="member-item">
                    <img :src="getAvatarUrl(user.uuid)" @error="handleAvatarError" class="avatar" alt="avatar" />
                    <span class="member-name">{{ user.username }}</span>
                </li>
            </ul>

            <p v-else class="global-tag">
                <i class="fa-solid fa-earth"></i>
                {{ $t('chat-room-global') }}
            </p>

            <div class="buttons">
                <button v-if="!isGlobal && !isOwner" class="btn" @click="requestLeave" :disabled="isLoading">
                    {{ $t('chat-room-actions-leave') }}
                </button>

                <button v-if="isOwner" class="btn delete-btn" @click="requestDelete" :disabled="isLoading">
                    {{ $t('chat-room-actions-delete') }}
                </button>

                <!-- <button class="btn ownership-btn">{{ $t('chat-room-actions-ownership') }}</button> -->
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
import { deleteRoom, leaveRoom, listMembers } from '../api/rooms';
import { getAuthData, getAvatarUrl } from '../store.ts';
import defaultAvatar from '../assets/default-avatar.png';
import ConfirmModal from './ConfirmModal.vue';
import { useFluent } from 'fluent-vue';

const { $t } = useFluent()

const props = defineProps<{ roomUuid: string, roomName: string, isGlobal: boolean }>()
const emit = defineEmits(['close', 'room-changed']);

const users = ref<UserProfile[]>([]);
const isLoading = ref(false);
const currentUserUuid = ref<string>('');

type ActionType = 'leave' | 'delete' | null;

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

const closeConfirmModal = () => {
    modalState.visible = false;
    modalState.type = null;
};

const handleConfirmAction = async () => {
    const actionType = modalState.type;

    closeConfirmModal();

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
        }
    } catch (error) {
        console.error(`Failed to ${actionType} room:`, error);
    } finally {
        isLoading.value = false;
    }
};

const isOwner = computed(() => {
    return true; // Logic placeholder
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

.secondary {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
    padding: 8px 16px;
    border-radius: var(--radius);
    cursor: pointer;
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
}

.avatar {
    width: 48px;
    height: 48px;
}

.member-name {
    font-size: 0.85rem;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

.ownership-btn:hover {
    color: var(--accent-second)
}

.ownership-btn:hover i {
    color: var(--accent-second)
}
</style>
