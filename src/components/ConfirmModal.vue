<template>
    <div class="backdrop" @click.self="emit('no')">
        <div class="modal">
            <h2>{{ title }}</h2>
            <p v-if="message">{{ message }}</p>

            <div class="actions">
                <button @click="emit('no')" class="secondary">
                    {{ cancelLabel || $t('shared-cancel') || 'Cancel' }}
                </button>
                <button @click="emit('yes')" :class="['btn', confirmButtonClass]">
                    {{ confirmLabel || $t('shared-confirm') || 'Confirm' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmButtonClass?: string;
}>();

const emit = defineEmits(['yes', 'no']);
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

.modal h2 {
    margin: 0;
    font-size: 1.25rem;
}

.modal p {
    margin: 0;
    color: var(--text-muted);
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

.btn {
    cursor: pointer;
    padding: 8px 16px;
    border-radius: var(--radius);
    border: 1px solid var(--accent);
    background: transparent;
    color: var(--text);
}

.secondary {
    cursor: pointer;
    padding: 8px 16px;
    border-radius: var(--radius);
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
}

.btn-danger {
    border-color: var(--error);
    color: var(--error);
}

.btn-danger:hover {
    background-color: var(--error);
    color: white;
}
</style>
