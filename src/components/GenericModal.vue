<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
                <div class="modal-content">
                    <div class="modal-body">
                        <i class="fas fa-exclamation-circle icon"></i>
                        <p>{{ message }}</p>
                    </div>
                    <div class="modal-footer">
                        <button @click="$emit('close')">{{ $t('ok') || 'OK' }}</button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
defineProps<{
    show: boolean;
    message: string;
}>();

defineEmits(['close']);
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    /* Higher than everything */
}

.modal-content {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    min-width: 300px;
    max-width: 450px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.modal-body {
    display: flex;
    align-items: center;
    gap: 15px;
    color: var(--text);
    margin-bottom: 20px;
}

.icon {
    color: var(--accent);
    font-size: 1.5rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
}

button {
    background: var(--accent);
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: var(--radius);
    cursor: pointer;
    font-weight: bold;
}

button:hover {
    background: var(--accent-hover);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
