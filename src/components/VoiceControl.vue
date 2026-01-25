<template>
    <div v-if="voiceState.status !== 'disconnected'" class="voice-bar">
        <div class="voice-info">
            <div class="status-indicator" :class="voiceState.status"></div>
            <div class="details">
                <span class="room-label">Voice Connected</span>
                <span class="speaking-label" v-if="speakersList.length > 0">
                    Speaking: {{ speakersList.length }}
                </span>
                <span class="speaking-label" v-else>Room Quiet</span>
            </div>
        </div>

        <div class="voice-controls">
            <button class="control-btn" :class="{ 'active': voiceState.isMuted }" @click="voiceActions.toggleMute()">
                <i class="fa-solid" :class="voiceState.isMuted ? 'fa-microphone-slash' : 'fa-microphone'"></i>
            </button>

            <button class="control-btn hangup" @click="voiceActions.leaveRoom()">
                <i class="fa-solid fa-phone-slash"></i>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { voiceState, voiceActions } from '../voice'; // Ensure this path points to your voice.ts

const speakersList = computed(() => Array.from(voiceState.speakingUsers));
</script>

<style scoped>
.device-select {
    background: transparent;
    color: var(--text);
    border: none;
    font-size: 0.8rem;
    max-width: 150px;
    opacity: 0.8;
    cursor: pointer;
}

.device-select:hover {
    opacity: 1;
}

.voice-bar {
    background-color: var(--panel-accent);
    border-top: 1px solid var(--border);
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    z-index: 90;
}

.voice-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--muted);
}

.status-indicator.connected {
    background-color: #4ade80;
    /* Green */
    box-shadow: 0 0 5px #4ade80;
}

.status-indicator.connecting {
    background-color: #facc15;
    /* Yellow */
    animation: pulse 1s infinite;
}

.status-indicator.error {
    background-color: #f87171;
}

.details {
    display: flex;
    flex-direction: column;
}

.room-label {
    font-size: 0.85rem;
    font-weight: bold;
}

.speaking-label {
    font-size: 0.75rem;
    color: var(--muted);
}

.voice-controls {
    display: flex;
    gap: 10px;
}

.control-btn {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text);
    transition: all 0.2s;
}

.control-btn:hover {
    background: var(--panel-hover);
}

.control-btn.active {
    background: var(--panel-hover);
    color: #f87171;
}

.control-btn.hangup {
    color: #f87171;
    border-color: #f87171;
}

.control-btn.hangup:hover {
    background: #f87171;
    color: white;
}

@keyframes pulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }

    100% {
        opacity: 1;
    }
}
</style>
