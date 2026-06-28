<template>
    <div class="input-wrapper">
        <!-- Attachment Preview Bar -->
        <div v-if="selectedFiles.length > 0" class="attachment-previews">
            <div v-for="(file, index) in selectedFiles" :key="index" class="preview-item">
                <span class="file-name">{{ file.name }}</span>
                <button @click="removeFile(index)" class="remove-btn">×</button>
            </div>
            <div v-if="selectedFiles.length >= 8" class="limit-reached">
                {{ $t('chat-max-attachments') }} (8)
            </div>
        </div>

        <div class="container-div" ref="menuContainer">
            <div class="attachment-menu-container">
                <!-- Popup Menu -->
                <div v-if="showMenu" class="attachment-popup">
                    <button @click="triggerPicker('image/*')">
                        <i class="fas fa-image"></i> {{ $t('chat-attach-image') }}
                    </button>
                    <button @click="triggerPicker('*/*')">
                        <i class="fas fa-file"></i> {{ $t('chat-attach-file') }}
                    </button>
                    <button @click="triggerPicker('image/*', true)" class="mobile-only">
                        <i class="fas fa-camera"></i> {{ $t('chat-attach-camera') }}
                    </button>
                </div>
            </div>

            <input type="file" ref="fileInput" style="display: none" multiple @change="handleFileChange" />

            <textarea ref="textareaRef" v-model="content" @input="handleInput" @keydown="handleKeydown" rows="1"
                :placeholder="$t('chat-input-placeholder')"></textarea>

            <div class="message-actions">
                <button class="plus-btn" @click="showMenu = !showMenu" :disabled="selectedFiles.length >= 8">
                    <i class="fas fa-plus"></i>
                </button>

                <button class="send-btn" @click="submit" :disabled="!content.trim() && selectedFiles.length === 0">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { saveMessageDraft, getMessageDraft } from '../store'
import { useFluent } from 'fluent-vue';

const { $t } = useFluent();

const MAX_FILES = 8;
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const content = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const showMenu = ref(false)
const selectedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const menuContainer = ref<HTMLElement | null>(null)

const emit = defineEmits<{ (e: 'send', content: string, files?: File[]): void }>()

onMounted(async () => {
    const saved = await getMessageDraft()
    if (saved) { content.value = saved; resize() }

    document.addEventListener('mousedown', closeMenu)
    window.addEventListener('keydown', closeMenu)
})

onUnmounted(() => {
    document.removeEventListener('mousedown', closeMenu)
    window.removeEventListener('keydown', closeMenu)
})

const closeMenu = (e: KeyboardEvent | MouseEvent) => {
    // Close on Escape key
    if (e instanceof KeyboardEvent && e.key === 'Escape') {
        showMenu.value = false
    }
    // Close on click outside
    if (e instanceof MouseEvent &&
        showMenu.value &&
        menuContainer.value &&
        !menuContainer.value.contains(e.target as Node)) {
        showMenu.value = false
    }
}

function triggerPicker(accept: string, capture = false) {
    if (!fileInput.value) return

    if (accept === '*/*') {
        fileInput.value.removeAttribute('accept')
    } else {
        fileInput.value.accept = accept
    }

    if (capture) {
        fileInput.value.setAttribute('capture', 'environment')
    } else {
        fileInput.value.removeAttribute('capture')
    }

    fileInput.value.click()
    showMenu.value = false
}

function handleFileChange(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;

    const newFiles = Array.from(files);

    if (selectedFiles.value.length + newFiles.length > MAX_FILES) {
        alert($t('chat-error-too-many-files', { max: MAX_FILES }));
    }

    for (const file of newFiles) {
        if (selectedFiles.value.length >= MAX_FILES) break;

        if (file.size > MAX_SIZE_BYTES) {
            alert($t('chat-error-file-too-large', { name: file.name, max: MAX_SIZE_MB }));
            continue;
        }

        selectedFiles.value.push(file);
    }

    if (fileInput.value) fileInput.value.value = '';
}

function removeFile(index: number) {
    selectedFiles.value.splice(index, 1)
}

function submit() {
    if (!content.value.trim() && selectedFiles.value.length === 0) return
    emit('send', content.value, selectedFiles.value)
    content.value = ''
    selectedFiles.value = []
    saveMessageDraft('')
    resize()
}

defineExpose({
    focus: () => {
        textareaRef.value?.focus()
    }
})

onMounted(async () => {
    const saved = await getMessageDraft()
    if (saved) {
        content.value = saved
        resize()
    }
})

function handleInput() {
    resize()
    saveMessageDraft(content.value)
}

function resize() {
    nextTick(() => {
        if (textareaRef.value) {
            textareaRef.value.style.height = 'auto'
            textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
        }
    })
}

function handleKeydown(e: KeyboardEvent) {
    if ((e.shiftKey || e.altKey) && e.key === 'Enter') {
        const textarea = e.target as HTMLTextAreaElement
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        content.value = content.value.substring(0, start) + '\n' + content.value.substring(end)
        nextTick(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 1
        })
        resize()

        saveMessageDraft(content.value)

        e.preventDefault()
    } else if (!e.shiftKey && !e.altKey && e.key === 'Enter') {
        submit()
        e.preventDefault()
    }
}
</script>

<style scoped>
.container-div {
    position: relative;
    width: 100%;
    display: flex;
    align-items: flex-end;
}

textarea {
    width: 100%;
    resize: none;
    overflow: hidden;
    padding: 0.5rem;
    font-size: 1rem;
    line-height: 1.4;
    box-sizing: border-box;
    background: transparent;
    border: none;
    color: inherit;
    outline: none;
    flex: 1;
}

.send-btn,
.plus-btn {
    margin-right: 0.8rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text);
    padding: 0;
    transition: color 0.2s;
    font-size: 1.2rem;
}

.send-btn:hover:not(:disabled) {
    color: var(--accent);
}

.send-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.input-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: var(--panel-bg);
}

.attachment-previews {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
    border-bottom: 1px solid var(--border);
}

.preview-item {
    background: var(--panel-accent);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 5px;
}

.attachment-menu-container {
    position: relative;
}

.attachment-popup {
    position: absolute;
    bottom: 100%;
    left: 0;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 5px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 100;
    min-width: 250px;
    margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.attachment-popup button {
    background: transparent;
    border: none;
    color: var(--text);
    padding: 10px;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
}

.attachment-popup button:hover {
    background: var(--panel-hover);
}

.limit-reached {
    color: var(--danger);
    font-size: 0.7rem;
    align-self: center;
}
</style>
