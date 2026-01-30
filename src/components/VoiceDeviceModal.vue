<template>
    <div class="backdrop" @click.self="$emit('close')">
        <div class="modal">

            <div v-if="step === 1" class="step-container">
                <h3>{{ $t('chat-voice-select-host') || 'Select Audio System' }}</h3>
                <div v-if="loadingHosts" class="loading">Loading systems...</div>

                <div v-else class="list">
                    <button @click="selectHost(null)" class="item default">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                        <span>Automatic (Default)</span>
                    </button>

                    <button v-for="host in hosts" :key="host" @click="selectHost(host)" class="item">
                        <i class="fa-solid fa-server"></i>
                        <span>{{ host }}</span>
                    </button>
                </div>
            </div>

            <div v-else class="step-container">
                <div class="header">
                    <button class="back-btn" @click="step = 1">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>
                    <h3>{{ selectedHost }} Devices</h3>
                </div>

                <div v-if="loadingDevices" class="loading">Scanning devices...</div>

                <div v-else class="list">
                    <button @click="selectDevice(null)" class="item default">
                        <i class="fa-solid fa-star"></i>
                        <span>Default Device</span>
                    </button>

                    <button v-for="device in devices" :key="device[0]" @click="selectDevice(device[0])" class="item">
                        <i class="fa-solid fa-microphone"></i>
                        <div class="device-details">
                            <span class="device-name">{{ device[1] }}</span>
                        </div>
                    </button>
                </div>
            </div>

            <div class="actions">
                <button class="secondary" @click="$emit('close')">Cancel</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { voiceActions } from '../voice';

const emit = defineEmits(['close', 'select']);

const step = ref(1);
const hosts = ref<string[]>([]);
const devices = ref<string[]>([]); // Array of [id, name] tuples
const selectedHost = ref<string | null>(null);

const loadingHosts = ref(false);
const loadingDevices = ref(false);

onMounted(async () => {
    loadingHosts.value = true;
    hosts.value = await voiceActions.getHosts();
    loadingHosts.value = false;
});

async function selectHost(host: string | null) {
    selectedHost.value = host;

    // Default
    if (host === null) {
        emit('select', { host: null, device: null });
        return;
    }

    step.value = 2;
    loadingDevices.value = true;
    devices.value = await voiceActions.getDevices(host);
    loadingDevices.value = false;
}

function selectDevice(deviceId: string | null) {
    emit('select', { host: selectedHost.value, device: deviceId });
}
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
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.step-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.header {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.back-btn {
    background: transparent;
    border: none;
    color: var(--text);
    cursor: pointer;
    font-size: 1.1rem;
    padding: 0.5rem;
    border-radius: 50%;
}

.back-btn:hover {
    background: var(--panel-hover);
}

.list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 5px;
}

.item {
    background: none;
    text-align: left;
    font-weight: 500;
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius);

    display: flex;
    align-items: center;
    padding: 0.8rem;
    gap: 0.8rem;
    transition: all 0.2s ease;
    min-width: 0;
}

.item:hover {
    border-color: var(--accent-color);
    background: var(--panel-hover);
}

.device-details {
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.device-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.5rem;
    border-top: 1px solid var(--border);
    padding-top: 1rem;
}

.loading {
    text-align: center;
    color: var(--muted);
    padding: 2rem;
}
</style>
