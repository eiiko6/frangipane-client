<template>
  <div class="container-div">
    <textarea ref="textareaRef" v-model="content" @input="handleInput" @keydown="handleKeydown" rows="1"
      :placeholder="$t('chat-input-placeholder')"></textarea>

    <button class="send-btn" @click="submit" :disabled="!content.trim()">
      <i class="fas fa-paper-plane"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { saveMessageDraft, getMessageDraft } from '../store'

const content = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const emit = defineEmits<{ (e: 'send', content: string): void }>()

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

function submit() {
  if (!content.value.trim()) return
  emit('send', content.value)
  content.value = ''
  saveMessageDraft('')
  resize()
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

.send-btn {
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
</style>
