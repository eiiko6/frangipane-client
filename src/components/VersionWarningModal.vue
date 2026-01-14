<template>
  <div class="backdrop">
    <div class="modal">
      <h2>{{ $t('warning-wrongversion-title') }}</h2>
      <p>{{ $t('warning-wrongversion-message', {
        appVersion: appVersion, expectedBackendVersion: expectedBackendVersion,
        backendVersion: backendVersion
      }) }}</p>

      <div class="actions">
        <button @click="emit('close')" class="secondary">
          {{ $t('warning-wrongversion-dismiss') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ appVersion: string, expectedBackendVersion: string, backendVersion: string }>()
const emit = defineEmits(['close']);
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
