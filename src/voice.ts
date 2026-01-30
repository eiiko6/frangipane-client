import { reactive } from 'vue';
import { API_WS } from './main';
import { apiFetch } from './api/client';
import WebSocket from '@tauri-apps/plugin-websocket';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

interface VoiceState {
    status: 'disconnected' | 'connecting' | 'connected';
    currentRoomUuid: string | null;
    isMuted: boolean;
    speakingUsers: Set<string>;
    captureSampleRate: number;
    captureChannels: number;
}

export const voiceState = reactive<VoiceState>({
    status: 'disconnected',
    currentRoomUuid: null,
    isMuted: false,
    speakingUsers: new Set(),
    captureSampleRate: 48000,
    captureChannels: 1,
});

let socket: WebSocket | null = null;
let audioContext: AudioContext | null = null;
let unlistenMic: UnlistenFn | null = null;
let unlistenConfig: UnlistenFn | null = null;
let unlistenError: UnlistenFn | null = null;

let nextStartTime = 0;

async function ensureMicrophonePermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop it immediately so it releases the mic
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (err) {
        console.error("Microphone permission denied:", err);
        return true;
    }
}

// Setup global error listener
export async function initVoiceListeners() {
    if (unlistenError) return;
    unlistenError = await listen('microphone-error', (event) => {
        console.error("RUST AUDIO ERROR:", event.payload);
        voiceActions.leaveRoom();
    });
}

export const voiceActions = {
    async getHosts(): Promise<string[]> {
        try {
            return await invoke<string[]>('get_audio_hosts');
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    async getDevices(hostName: string | null): Promise<string[]> {
        try {
            return await invoke('get_input_devices', { hostName });
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    async joinRoom(roomUuid: string, hostName: string | null, deviceName: string | null) {
        if (voiceState.status === 'connected') return;

        nextStartTime = 0;
        voiceState.status = 'connecting';
        voiceState.currentRoomUuid = roomUuid;

        await initVoiceListeners();

        try {
            const res = await apiFetch<{ token: string }>('/ws/issue-token');
            const url = `${API_WS}/voice/${roomUuid}?token=${res.token}`;
            socket = await WebSocket.connect(url);

            socket.addListener((msg) => {
                if (msg.type === 'Binary') handleIncomingAudio(msg.data);
                else if (msg.type === 'Close') voiceActions.leaveRoom();
            });

            await this.startAudioCapture(hostName, deviceName);
            voiceState.status = 'connected';
        } catch (e) {
            console.error("Voice join failed", e);
            voiceActions.leaveRoom();
        }
    },

    async leaveRoom() {
        nextStartTime = 0;
        voiceState.status = 'disconnected';
        voiceState.currentRoomUuid = null;
        voiceState.speakingUsers.clear();

        await this.stopAudioCapture();

        if (socket) {
            // WebSocket plugin disconnect is async
            await socket.disconnect();
            socket = null;
        }
    },

    toggleMute() {
        voiceState.isMuted = !voiceState.isMuted;
    },

    async startAudioCapture(hostName: string | null, deviceName: string | null) {
        const hasPermission = await ensureMicrophonePermission();
        if (!hasPermission) throw new Error("Microphone permission denied");

        await new Promise(r => setTimeout(r, 200));

        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        unlistenConfig = await listen<{ sample_rate: number, channels: number }>('microphone-config', (event) => {
            voiceState.captureSampleRate = event.payload.sample_rate;
            voiceState.captureChannels = event.payload.channels;
        });

        unlistenMic = await listen<number[]>('microphone-data', (event) => {
            if (voiceState.isMuted || !socket) return;
            socket.send(event.payload).catch(console.error);
        });

        await invoke('start_microphone', { hostName, deviceName });
    },

    async stopAudioCapture() {
        try {
            await invoke('stop_microphone');
        } catch (e) { console.warn(e); }

        if (unlistenMic) { unlistenMic(); unlistenMic = null; }
        if (unlistenConfig) { unlistenConfig(); unlistenConfig = null; }

        if (audioContext) {
            await audioContext.close();
            audioContext = null;
        }
    }

};

function handleIncomingAudio(data: number[]) {
    if (!audioContext) return;

    const arrayBuffer = new Uint8Array(data).buffer;
    const audioDataOffset = 16; // Skip UUID

    if (arrayBuffer.byteLength <= audioDataOffset) return;
    const audioByteLength = arrayBuffer.byteLength - audioDataOffset;

    const pcmData = new Int16Array(arrayBuffer, audioDataOffset, audioByteLength / 2);
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
        float32Data[i] = pcmData[i] / 32768.0;
    }

    const buffer = audioContext.createBuffer(
        1,
        float32Data.length,
        voiceState.captureSampleRate
    );
    buffer.getChannelData(0).set(float32Data);

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    const now = audioContext.currentTime;

    if (nextStartTime === 0) nextStartTime = now + 0.05;

    // If drifted too far behind (lag > 0.5s), jump ahead
    if (nextStartTime < now) {
        nextStartTime = now;
    }

    if (nextStartTime > now + 5.0) {
        nextStartTime = now;
    }

    source.start(nextStartTime);
    nextStartTime += buffer.duration;

}
