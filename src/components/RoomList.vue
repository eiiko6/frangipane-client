<template>
  <Teleport to="body">
    <CreateRoomModal v-if="showCreate" @close="showCreate = false" @created="rooms.push($event)" />
  </Teleport>

  <div class="room-list">
    <header class="rooms-header">
      <h2>{{ $t('chat-room-list-title') }}</h2>
      <button class="create-btn" @click="showCreate = true" :title="$t('chat-create-title')">
        <i class="fa-solid fa-plus"></i>
      </button>
    </header>

    <div class="wait-container" v-if="!rooms || rooms.length === 0">
      <p class="wait-msg">{{ $t('chat-room-list-connecting') }}</p>
      <button class="retry-btn" @click="refreshRooms()">
        <i class="fa-solid fa-rotate-right"></i>
      </button>
    </div>

    <div class="scroll-area">
      <router-link v-for="room in rooms" :key="room.uuid" :to="`/rooms/${room.uuid}`" class="btn room-item"
        :class="{ active: route.params.uuid === room.uuid }" @click="emit('select-room')">
        <div class="room-content-wrapper">
          <div class="room-info">
            <span class="room-name">{{ room.name }}</span>
            <span class="room-owner">{{ $t('chat-room-owner', { owner: room.owner_name }) }}</span>
          </div>
          <div v-if="unreadCounts[room.uuid] && unreadCounts[room.uuid] > 0" class="unread-badge">
            {{ unreadCounts[room.uuid] > 99 ? '99+' : unreadCounts[room.uuid] }}
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchRooms } from '../api/rooms';
import type { Room } from '../types';
import CreateRoomModal from './CreateRoomModal.vue';

const emit = defineEmits(['select-room']);

const route = useRoute();
const showCreate = ref(false);
const rooms = ref<Room[]>([]);
const unreadCounts = ref<Record<string, number>>({});

async function refreshRooms() {
  const fetchedRooms = await fetchRooms();
  rooms.value = fetchedRooms;

  fetchedRooms.forEach(room => {
    console.log(`Unread count for room ${room.name}: ${room.unread_count}`);

    // If the room isn't the currently active one, store the count
    if (room.unread_count && route.params.uuid !== room.uuid) {
      unreadCounts.value[room.uuid] = room.unread_count;
    } else {
      unreadCounts.value[room.uuid] = 0;
    }
  });
}

const incrementUnread = (roomUuid: string) => {
  if (route.params.uuid === roomUuid) return;

  const current = unreadCounts.value[roomUuid] || 0;
  unreadCounts.value[roomUuid] = current + 1;
};

defineExpose({ incrementUnread });

watch(
  () => route.params.uuid,
  (newUuid) => {
    if (typeof newUuid === 'string') {
      unreadCounts.value[newUuid] = 0;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  // rooms.value = await fetchRooms();
  await refreshRooms()
});
</script>

<style scoped>
.room-list {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  user-select: none;
  -webkit-user-select: none;
}

.wait-container {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}

.wait-msg {
  color: var(--muted);
  font-size: 1.1rem;
  z-index: 5;
  pointer-events: none;
  text-align: center;
}

.retry-btn {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.room-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.unread-badge {
  background-color: var(--accent);
  color: black;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: 8px;
}

.rooms-header {
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.rooms-header h2 {
  /* font-size: 1rem; */
  margin: 0;
  margin-left: 45px;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.room-item {
  display: block;
  padding: 0.75rem 1rem;
  margin-bottom: 0.25rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--muted);
  transition: all 0.2s;
}

.room-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
}

.room-item.active {
  /* border: 1px solid var(--border); */
  background: var(--panel-accent);
  color: var(--accent);
}

.room-item.active .room-owner {
  color: var(--text);
}

.room-info {
  display: flex;
  flex-direction: column;
}

.room-name {
  font-weight: 500;
}

.room-owner {
  font-size: 0.75rem;
  opacity: 0.6;
}

.create-btn {
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

.create-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
