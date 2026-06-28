<template>
    <ul :class="{ 'is-compact': isCompact }">
        <li v-for="(m, i) in messages" :key="m.uuid || i" class="message"
            :class="{ 'is-me': m.sender_uuid === currentUserUuid }">
            <div class="sender-info">
                <img :src="getAvatarUrl(m.sender_uuid)" @error="handleAvatarError" class="avatar clickable"
                    @click.stop="openUserProfile(m)" />
                <div class="sender clickable" @click.stop="openUserProfile(m)">
                    {{ m.sender }}
                </div>
                <span class="timestamp">{{ m.sent_at }}</span>
            </div>

            <div class="message-content">
                <!-- Text content of the message -->
                <div v-if="m.content" class="text-body">{{ m.content }}</div>

                <!-- Attachments Section -->
                <div v-if="m.attachments && m.attachments.length > 0" class="attachments-container">
                    <div v-for="att in m.attachments" :key="att.uuid" class="attachment-wrapper">

                        <!-- Image Rendering -->
                        <div v-if="att.file_type === 'image'" class="image-attachment">
                            <div class="media-container">
                                <!-- Loading / Error states -->
                                <div v-if="loadStatus[att.uuid] !== 'loaded'" class="media-placeholder"
                                    :class="{ 'is-error': loadStatus[att.uuid] === 'error' }">
                                    <div v-if="loadStatus[att.uuid] === 'error'" class="error-text">
                                        <i class="fa-solid fa-circle-exclamation"></i>
                                        <span>Failed to load image</span>
                                        <button class="retry-btn" @click.stop="retryAttachment(att.uuid)">
                                            <p><i class="fa-solid fa-rotate-right"></i>Try again.</p>
                                        </button>
                                    </div>
                                    <div v-else class="spinner"></div>
                                </div>

                                <!-- UPDATED: triggerViewer now takes the message and specific attachment -->
                                <img :src="getFileUrl(att.uuid)" loading="lazy" @load="loadStatus[att.uuid] = 'loaded'"
                                    @error="loadStatus[att.uuid] = 'error'" @click="triggerViewer(m, att)"
                                    :class="{ 'is-visible': loadStatus[att.uuid] === 'loaded' }" />
                            </div>
                        </div>

                        <!-- Video Rendering -->
                        <div v-else-if="att.file_type === 'video'" class="video-attachment">
                            <div class="media-container">
                                <!-- Loading / Error states -->
                                <div v-if="loadStatus[att.uuid] !== 'loaded'" class="media-placeholder"
                                    :class="{ 'is-error': loadStatus[att.uuid] === 'error' }">
                                    <div v-if="loadStatus[att.uuid] === 'error'" class="error-text">
                                        <i class="fa-solid fa-circle-exclamation"></i>
                                        <span>Failed to load video</span>
                                        <button class="retry-btn" @click.stop="retryAttachment(att.uuid)">
                                            <i class="fa-solid fa-rotate-right"></i>
                                            <p>Try again.</p>
                                        </button>
                                    </div>
                                    <div v-else class="spinner"></div>
                                </div>

                                <video controls :src="getFileUrl(att.uuid)"
                                    @loadeddata="loadStatus[att.uuid] = 'loaded'"
                                    @error="loadStatus[att.uuid] = 'error'"
                                    :class="{ 'is-visible': loadStatus[att.uuid] === 'loaded' }">
                                </video>
                            </div>
                        </div>

                        <!-- Text File Preview -->
                        <div v-else-if="att.file_type === 'textfile'" class="textfile-attachment">
                            <div class="file-header">
                                <i class="fa-solid fa-file-lines"></i>
                                <span class="file-name">{{ formatFileName(att.file_name) }}</span>
                                <!-- <a :href="getFileUrl(att.uuid)" download class="download-link"> -->
                                <button class="download-btn" @click="openInBrowser(att.uuid)" title="Open in browser">
                                    <i class="fa-solid fa-download"></i>
                                </button>
                            </div>
                            <pre class="preview-box">{{ textPreviews[att.uuid] || '...' }}</pre>
                        </div>

                        <!-- Generic Binary File -->
                        <div v-else class="generic-attachment">
                            <i class="fa-solid fa-file-export"></i>
                            <span class="file-name">{{ formatFileName(att.file_name) }}</span>
                            <!-- <a :href="getFileUrl(att.uuid)" download class="download-link"> -->
                            <button class="download-btn" @click="openInBrowser(att.uuid)">
                                <i class="fa-solid fa-download"></i>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </li>
    </ul>

    <UserProfileModal v-if="selectedUser" :username="selectedUser.name" :user-uuid="selectedUser.uuid"
        @close="selectedUser = null" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Message } from '../types'
import { getAvatarUrl, getCompactLayoutPreference } from '../store.ts'
import defaultAvatar from '../assets/default-avatar.png'
import { getAuthData } from '../store.ts';
import UserProfileModal from './UserProfileModal.vue';
import { API } from '../main.ts';
import { openUrl } from '@tauri-apps/plugin-opener';

// Viewer imports
import 'viewerjs/dist/viewer.css'
import { api as viewerApi } from 'v-viewer'

const props = defineProps<{ messages: Message[] }>()

const loadStatus = ref<Record<string, 'loading' | 'loaded' | 'error'>>({})
const retrySeeds = ref<Record<string, number>>({})
const currentUserUuid = ref<string | null>(null)
const isCompact = ref(false)
const selectedUser = ref<{ name: string, uuid: string } | null>(null)
const textPreviews = ref<Record<string, string>>({})

const viewerOptions: any = {
    toolbar: {
        zoomIn: 4,
        zoomOut: 4,
        oneToOne: 4,
        reset: 4,
        prev: 4, // Enabled
        play: { show: 4, size: 'large' },
        next: 4, // Enabled
        rotateLeft: 4,
        rotateRight: 4,
        flipHorizontal: 4,
        flipVertical: 4,
    },
    title: false,
    navbar: true, // Enabled navbar so user sees there are multiple images
    transition: true,
    fullscreen: true
}

// UPDATED: Logic to gather sibling images
const triggerViewer = (message: Message, clickedAttachment: any) => {
    if (!message.attachments) return;

    // 1. Get all attachments in this message that are images
    const imageAttachments = message.attachments.filter(a => a.file_type === 'image');

    // 2. Convert them to URLs
    const imageUrls = imageAttachments.map(a => getFileUrl(a.uuid));

    // 3. Find the index of the image that was actually clicked
    const initialIndex = imageAttachments.findIndex(a => a.uuid === clickedAttachment.uuid);

    viewerApi({
        options: {
            ...viewerOptions,
            initialViewIndex: initialIndex >= 0 ? initialIndex : 0
        },
        images: imageUrls,
    })
}

onMounted(async () => {
    const auth = await getAuthData()
    if (auth.user) {
        currentUserUuid.value = auth.user.uuid
    }
    isCompact.value = await getCompactLayoutPreference()
})

const openInBrowser = async (fileUuid: string) => {
    const url = getFileUrl(fileUuid);
    try {
        await openUrl(url);
    } catch (err) {
        console.error("Failed to open external browser:", err);
    }
};

const getFileUrl = (fileUuid: string) => {
    let url = `${API}/uploads/${fileUuid}`;
    if (retrySeeds.value[fileUuid]) {
        url += `?t=${retrySeeds.value[fileUuid]}`;
    }
    return url;
}

const retryAttachment = (fileUuid: string) => {
    loadStatus.value[fileUuid] = 'loading';
    retrySeeds.value[fileUuid] = Date.now();
}

const formatFileName = (name: string) => {
    const parts = name.split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : name;
}

const handleAvatarError = (event: Event) => {
    const img = event.target as HTMLImageElement;
    img.src = defaultAvatar;
};

const openUserProfile = (message: Message) => {
    selectedUser.value = {
        name: message.sender,
        uuid: message.sender_uuid
    }
}

watch(() => props.messages, (newMessages) => {
    newMessages.forEach(m => {
        m.attachments?.forEach(async (att) => {
            if (att.file_type === 'textfile' && !textPreviews.value[att.uuid]) {
                try {
                    const response = await fetch(getFileUrl(att.uuid));
                    if (response.ok) {
                        const text = await response.text();
                        textPreviews.value[att.uuid] = text.length > 1000
                            ? text.substring(0, 1000) + '...'
                            : text;
                    }
                } catch (e) {
                    textPreviews.value[att.uuid] = "Could not load preview.";
                }
            }
        })
    })
}, { immediate: true, deep: true });
</script>

<style scoped>
ul {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0;
    margin: 0;
    list-style: none;
}

.message {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 0;
    max-width: 85%;
    width: fit-content;
    align-self: flex-start;
    border-radius: var(--radius);
    background: var(--panel-accent);
    overflow: hidden;
}

.sender-info {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 0.7rem;
    border-bottom: 1px solid var(--border);
    width: 100%;
    padding: 5px 18px;
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.clickable {
    cursor: pointer;
    transition: opacity 0.2s;
}

.clickable:hover {
    opacity: 0.8;
}

.sender.clickable:hover {
    text-decoration: underline;
}

.message-content {
    padding: 10px 18px;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.message.is-me {
    align-self: flex-end;
    align-items: flex-end;
}

.message.is-me .sender-info {
    flex-direction: row-reverse;
    text-align: right;
}

.message.is-me .message-content {
    text-align: right;
    align-items: flex-end;
}

/* Attachments */
.attachments-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.attachment-wrapper {
    max-width: 100%;
}

/* Unified Media Container (Images & Videos) */
.media-container {
    position: relative;
    min-width: 200px;
    min-height: 120px;
    background: var(--panel-bg);
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
}

.media-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: 1;
}

.image-attachment img,
.video-attachment video {
    max-width: 100%;
    max-height: 400px;
    border-radius: 4px;
    display: block;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.image-attachment img {
    cursor: pointer;
}

.image-attachment img.is-visible,
.video-attachment video.is-visible {
    opacity: 1;
}

/* Loading & Error UI */
.spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--accent, #7289da);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.error-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #ff4444;
    font-size: 0.8rem;
    padding: 10px;
}

.retry-btn,
.download-btn {
    font-size: 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text);
    padding: 0;
    transition: color 0.25s;
}

.retry-btn i {
    margin-right: 8px;
}

.retry-btn i:hover {
    color: var(--muted);
}

.retry-btn:hover i {
    color: var(--accent);
}

.retry-btn:hover {
    color: var(--accent);
}

/* Text file preview styling */
.textfile-attachment {
    background: var(--panel-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    max-width: 500px;
    text-align: left;
}

.file-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid var(--border);
}

.file-name {
    flex: 1;
    font-size: 0.85rem;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.preview-box {
    margin: 0;
    padding: 10px;
    font-size: 0.8rem;
    max-height: 150px;
    overflow-y: auto;
    font-family: 'Courier New', Courier, monospace;
    background: transparent;
    color: var(--text);
    white-space: pre-wrap;
}

.generic-attachment {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 15px;
    background: var(--panel-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    min-width: 200px;
}

.download-link {
    color: var(--accent);
    transition: transform 0.1s;
}

.download-link:hover {
    transform: scale(1.1);
}

/* Compact Mode */
ul.is-compact .message {
    background: transparent;
    max-width: 95%;
}

ul.is-compact .sender-info {
    border-bottom: none;
    padding: 5px 18px 0 18px;
}

ul.is-compact .message-content {
    padding: 5px 10px 10px 50px;
}

ul.is-compact .message.is-me .message-content {
    padding-right: 50px;
    padding-left: 0;
    text-align: right;
}

.sender {
    font-weight: bold;
    font-size: 1.1rem;
}

.timestamp {
    font-weight: normal;
    opacity: 0.7;
    font-size: 0.7rem;
}
</style>
