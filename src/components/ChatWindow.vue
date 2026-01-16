<template>
  <InvitePeopleModal v-if="showInviteModal && isSocketConnected" :room_uuid="props.uuid"
    @close="showInviteModal = false" />

  <div v-if="uuid === 'none'" class="no-room">
    <div class="empty-state">
      <i class="fa-solid fa-comments"></i>
      <p>{{ $t('chat-no-room') }}</p>
    </div>
  </div>

  <div v-else class="chat-container">
    <h2 class="room-name">{{ currentRoom?.name }}</h2>

    <div class="messages-container" ref="messageListRef" @scroll="handleScroll">
      <MessageList v-if="messages.length > 0 || isSocketConnected" :messages="messages" />
    </div>

    <p v-if="messages.length === 0" class="wait-msg">{{ $t('chat-connecting') }}</p>

    <div class="input-container">
      <button v-if="isOwner && !currentRoom?.global" class="invite-btn" @click="showInviteModal = true"
        :title="$t('chat-invite-title')">
        <i class="fa-solid fa-users"></i>
      </button>

      <div v-if="connectionError" class="connection-error">
        <p>{{ connectionError }}</p>
        <button class="retry-btn" @click="retryConnection">
          <i class="fa-solid fa-rotate-right"></i>
        </button>
      </div>

      <MessageInput v-if="isSocketConnected" ref="messageInputRef" @send="onSend" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import { fetchMessages, sendMessage } from "../api/messages";
import type { Message, Room, User } from "../types";
import { API_WS } from '../main.ts';
import { apiFetch } from '../api/client';
import MessageList from "./MessageList.vue";
import MessageInput from "./MessageInput.vue";
import InvitePeopleModal from './InvitePeopleModal.vue';
import WebSocket from '@tauri-apps/plugin-websocket';
import { getAuthData } from "../store.ts";
import { fetchRoomInfo } from "../api/rooms.ts";
import { useFluent } from 'fluent-vue';

const { $t } = useFluent();

const emit = defineEmits<{
  // (e: 'send', content: string): void
  (e: 'notification', roomUuid: string): void
}>();

const props = defineProps<{ uuid: string }>();

// UI State
const messages = ref<Message[]>([]);
const messageListRef = ref<HTMLElement | null>(null);
const messageInputRef = ref<InstanceType<typeof MessageInput> | null>(null);
const currentUser = ref<User | null>(null);
const currentRoom = ref<Room | null>(null);
const connectionError = ref<string | null>(null);

// Pagination State
const isLoadingMore = ref(false);
const hasMore = ref(true);
const showInviteModal = ref(false);

// WebSocket State
let socket: WebSocket | null = null;
const isSocketConnected = ref(false);
let unlistenSocket: (() => void) | null = null;

const isOwner = computed(() => {
  if (!currentUser.value || !currentRoom.value) return false;
  return currentUser.value.uuid === currentRoom.value.owner_uuid;
});

onMounted(async () => {
  await connectGlobalWebSocket();

  await loadRoomData();

  window.addEventListener('keydown', handleGlobalKeyDown);
});

onUnmounted(async () => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
  await cleanupWebSocket();
});

// Watch for room switches.
watch(() => props.uuid, async (newUuid, oldUuid) => {
  if (newUuid !== oldUuid) {
    await loadRoomData();
  }
});

async function retryConnection() {
  await cleanupWebSocket();
  await connectGlobalWebSocket();
  await loadRoomData();
}

async function loadRoomData() {
  messages.value = [];
  currentRoom.value = null;
  hasMore.value = true;
  connectionError.value = null;

  if (props.uuid === 'none') return;

  try {
    const [msgs, roomInfo, auth] = await Promise.all([
      fetchMessages(props.uuid, undefined, 40),
      fetchRoomInfo(props.uuid),
      getAuthData()
    ]);

    messages.value = msgs;
    currentRoom.value = roomInfo;
    currentUser.value = auth.user;
    if (msgs.length < 40) hasMore.value = false;

    await nextTick();
    scrollToBottom();
  } catch (err) {
    console.error("Room data load failed:", err);
  }
}

async function connectGlobalWebSocket() {
  if (isSocketConnected.value) return;

  try {
    // Get a one-time token for the connection
    const res = await apiFetch<{ token: string }>('/ws/messages/issue-token');
    const wsToken = res.token;

    const url = `${API_WS}/messages?token=${wsToken}`;
    socket = await WebSocket.connect(url);

    isSocketConnected.value = true;
    connectionError.value = null;

    unlistenSocket = socket.addListener((msg) => {
      if (msg.type === 'Text') {
        try {
          const data: Message = JSON.parse(msg.data);

          // Filter messages for the currenty open room
          if (data.room_uuid === props.uuid) {
            // Deduplicate
            if (!messages.value.some(m => m.uuid === data.uuid)) {
              messages.value.push(data);
              nextTick().then(scrollToBottomIfAtEnd);
            }
          } else {
            // Notifications for other rooms
            emit('notification', data.room_uuid);
          }

        } catch (e) {
          console.error("Error parsing message:", e);
        }
      } else if (msg.type === 'Close') {
        isSocketConnected.value = false;
      }
    });

  } catch (err) {
    console.error("WS Connect failed:", err);
    isSocketConnected.value = false;
    connectionError.value = "Live chat disconnected.";
  }
}

async function cleanupWebSocket() {
  isSocketConnected.value = false;

  if (unlistenSocket) {
    unlistenSocket();
    unlistenSocket = null;
  }

  if (socket) {
    const tempSocket = socket;
    socket = null;
    try {
      await tempSocket.disconnect();
    } catch (err) {
      console.warn("Socket cleanup warning:", err);
    }
  }
}

async function handleScroll() {
  const el = messageListRef.value;
  if (!el) return;

  if (el.scrollTop < 50 && !isLoadingMore.value && hasMore.value) {
    await loadMore();
  }
}

async function loadMore() {
  if (messages.value.length === 0) return;

  isLoadingMore.value = true;
  const oldestMsgUuid = messages.value[0].uuid;

  try {
    const olderMsgs = await fetchMessages(props.uuid, oldestMsgUuid, 30);

    if (olderMsgs.length === 0) {
      hasMore.value = false;
      return;
    }

    const el = messageListRef.value;
    const previousScrollHeight = el?.scrollHeight || 0;

    messages.value = [...olderMsgs, ...messages.value];

    await nextTick();

    if (el) {
      el.scrollTop = el.scrollHeight - previousScrollHeight;
    }

    if (olderMsgs.length < 30) hasMore.value = false;
  } catch (err) {
    console.error("Failed to load more messages:", err);
  } finally {
    isLoadingMore.value = false;
  }
}

function scrollToBottom() {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
  }
}

function scrollToBottomIfAtEnd() {
  const el = messageListRef.value;
  if (!el) return;
  const threshold = 150;
  const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  if (isAtBottom) scrollToBottom();
}

const handleGlobalKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    const active = document.activeElement?.tagName.toLowerCase();
    const isTyping = active === 'input' || active === 'textarea';
    if (!isTyping && messageInputRef.value) {
      event.preventDefault();
      messageInputRef.value.focus();
    }
  }
};

async function onSend(content: string) {
  if (props.uuid === 'none') return;
  await sendMessage(props.uuid, content);
}
</script>

<style scoped>
.chat-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  scroll-behavior: auto;
}

.wait-msg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  color: var(--muted);
  font-size: 1.1rem;
  z-index: 10;
  pointer-events: none;
  text-align: center;
}

.input-container {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  padding: 10px;
  border-top: 1px solid var(--border);
}

:deep(.input-container > *:last-child) {
  flex: 1;
}

.room-name {
  margin: 15px 0;
  text-align: center;
}

.invite-btn {
  margin: 0;
  padding: 18px;
  width: 28px;
  height: 28px;
  border-radius: var(--radius);
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.connection-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
}

.retry-btn {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.no-room {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}

.empty-state {
  text-align: center;
  font-size: 1.2rem;
  user-select: none;
  -webkit-user-select: none;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}
</style>
