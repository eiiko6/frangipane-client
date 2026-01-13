<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="modal">
      <h2>{{ $t('settings-upload-avatar-title') || 'Upload Avatar' }}</h2>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div class="drop-zone" :class="{ 'is-dragging': isDragging }" @click="pickFile">
        <div v-if="!previewUrl" class="drop-content">
          <i class="fa-solid fa-cloud-arrow-up"></i>
          <p>{{ $t('settings-upload-prompt') || 'Drag an image here or click to browse' }}</p>
        </div>

        <div v-else class="preview-container">
          <img :src="previewUrl" alt="Avatar preview" />
          <div class="overlay">
            <span>{{ $t('settings-change-photo') || 'Change Photo' }}</span>
          </div>
        </div>
      </div>

      <div v-if="isSubmitting" class="progress-container">
        <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
      </div>

      <div class="actions">
        <button type="button" @click="emit('close')" class="secondary" :disabled="isSubmitting">
          {{ $t('shared-cancel') }}
        </button>

        <button @click="handleUpload" :disabled="isSubmitting || !selectedPath">
          {{ isSubmitting ? $t('shared-uploading') || 'Uploading...' : $t('shared-save') || 'Save Avatar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { uploadAvatar } from '../api/account';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-dialog';
// import { convertFileSrc } from '@tauri-apps/api/core'; 
import { readFile } from '@tauri-apps/plugin-fs';
import { refreshLocalUser } from '../store.ts';
import { getAuthData } from '../store.ts';
import { refreshAvatar } from '../store.ts';

const emit = defineEmits(['close', 'updated']);

const isDragging = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');
const uploadProgress = ref(0);

const selectedPath = ref<string | null>(null);
const previewUrl = ref<string | null>(null);

let unlistenDrag: UnlistenFn;
let unlistenHover: UnlistenFn;
let unlistenLeave: UnlistenFn;

onMounted(async () => {
  unlistenHover = await listen('tauri://drag-enter', () => isDragging.value = true);
  unlistenLeave = await listen('tauri://drag-leave', () => isDragging.value = false);
  unlistenDrag = await listen<{ paths: string[] }>('tauri://drag-drop', (event) => {
    isDragging.value = false;
    const path = event.payload.paths[0];
    if (path && isImage(path)) setFile(path);
    else errorMessage.value = "Please drop a valid image file.";
  });
});

onUnmounted(() => {
  if (unlistenDrag) unlistenDrag();
  if (unlistenHover) unlistenHover();
  if (unlistenLeave) unlistenLeave();
  // Clean up
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

async function pickFile() {
  try {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Image', extensions: ['png', 'jpeg', 'jpg', 'webp'] }]
    });

    if (selected && typeof selected === 'string') {
      await setFile(selected);
    }
  } catch (err) {
    console.error(err);
  }
}

// Async function to read file and create blob URL
async function setFile(path: string) {
  try {
    selectedPath.value = path;

    const contents = await readFile(path);
    const blob = new Blob([contents]);

    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);

    previewUrl.value = URL.createObjectURL(blob);

    errorMessage.value = '';
  } catch (e) {
    console.error("Error reading file:", e);
    errorMessage.value = "Could not read image file.";
  }
}

function isImage(path: string) {
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(path);
}

async function handleUpload() {
  if (!selectedPath.value) return;

  isSubmitting.value = true;
  errorMessage.value = '';
  uploadProgress.value = 0;

  try {
    const fileBytes = await readFile(selectedPath.value);

    await uploadAvatar(fileBytes, (progress, total) => {
      uploadProgress.value = Math.round((progress / total) * 100);
    });

    await refreshLocalUser();

    // Trigger global UI refresh
    const auth = await getAuthData();
    if (auth.user) {
      refreshAvatar(auth.user.uuid);
    }

    emit('updated');
    emit('close');
  } catch (err: any) {
    console.error("Upload failed:", err);
    errorMessage.value = err.message || 'Failed to upload avatar';
    isSubmitting.value = false;
  }
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
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.drop-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.02);
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone * {
  pointer-events: none;
}

.drop-zone.is-dragging {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.1);
  transform: scale(1.02);
}

.drop-zone:hover {
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.05);
}

.drop-content i {
  font-size: 2.5rem;
  color: var(--muted);
  margin-bottom: 1rem;
}

.preview-container {
  position: relative;
  width: 120px;
  height: 120px;
}

.preview-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid var(--accent);
}

.progress-container {
  width: 100%;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
  margin-top: -10px;
}

.progress-bar {
  height: 100%;
  background: var(--accent);
  transition: width 0.2s ease;
}

.drop-zone.is-dragging {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb), 0.1);
  transform: scale(1.02);
  pointer-events: none;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-container:hover .overlay {
  opacity: 1;
}

.overlay span {
  font-size: 0.8rem;
  color: white;
}

.error-message {
  color: var(--error);
  font-size: 0.9rem;
  word-break: break-all;
  overflow-wrap: anywhere;
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
}
</style>
