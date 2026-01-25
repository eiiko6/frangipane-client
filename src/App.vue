<template>
  <div id="page" :class="{ 'is-mobile': currentPlatform === 'android' || currentPlatform === 'ios' }">
    <div v-if="currentPlatform != 'android' && currentPlatform != 'ios'" data-tauri-drag-region class="titlebar">
      <div class="titlebar-button" @click="minimize">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect fill="currentColor" width="10" height="1" x="1" y="6" />
        </svg>
      </div>
      <div class="titlebar-button" @click="toggleMaximize">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect fill="none" stroke="currentColor" stroke-width="1" width="9" height="9" x="1.5" y="1.5" />
        </svg>
      </div>
      <div class="titlebar-button" id="close-btn" @click="close">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path fill="currentColor"
            d="M11 1.57L10.43 1 6 5.43 1.57 1 1 1.57 5.43 6 1 10.43 1.57 11 6 6.57 10.43 11 11 10.43 6.57 6z" />
        </svg>
      </div>
    </div>

    <main id="content">
      <router-view />
    </main>

    <VersionWarningModal v-if="showVersionWarningModal" :appVersion="appVersion" :backendVersion="backendVersion"
      :expectedBackendVersion="expectedBackendVersion" @close="showVersionWarningModal = false" />

    <VoiceControl />

    <footer v-if="!$route.meta.hideNavbar">
      <Navbar />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Navbar from './components/Navbar.vue'
import VersionWarningModal from './components/VersionWarningModal.vue'
import { apiFetch } from './api/client'
import { VersionResponse } from './types'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { platform } from '@tauri-apps/plugin-os';
import VoiceControl from './components/VoiceControl.vue'

const currentPlatform = ref('')

const appWindow = getCurrentWindow()

const showVersionWarningModal = ref(false)
const backendVersion = ref('')

const appVersion = __APP_VERSION__
const expectedBackendVersion = __BACKEND_VERSION__

const isFullScreen = ref(false)

onMounted(async () => {
  backendVersion.value = (await getBackendVersion()).version
  if (backendVersion.value !== expectedBackendVersion) {
    showVersionWarningModal.value = true
  }

  currentPlatform.value = platform()
})

const minimize = () => appWindow.minimize()
const toggleMaximize = () => {
  appWindow.setFullscreen(!isFullScreen.value)
  isFullScreen.value = !isFullScreen.value
}
const close = () => appWindow.close()

async function getBackendVersion() {
  return await apiFetch<VersionResponse>('/version')
}
</script>

<style scoped>
#page {
  background: var(--bg);
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

#content {
  width: 100%;
  max-width: 1100px;
  /* padding: 2rem; */
  padding: calc(20px + 1.8rem) 1.8rem calc(1.8rem - 10px) 1.8rem;

  flex: 1;
  overflow-y: auto;
}

.titlebar {
  height: 30px;
  background: var(--panel);
  user-select: none;
  display: flex;
  justify-content: flex-end;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}

.titlebar-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 45px;
  height: 30px;
  transition: background-color 0.2s;
  color: var(--text-color);
  cursor: pointer;
}

.titlebar-button:hover {
  background: var(--panel-accent)
}

#close-btn:hover {
  background: #e81123;
  color: white;
}

footer {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-bottom: calc(1.8rem - 10px);
  background: var(--bg);
}

@media (max-width: 720px) {
  #content {
    padding: 12px;
    padding-top: calc(30px + 10px);
  }

  .is-mobile #content {
    padding-top: 30px;
  }

  .is-mobile footer {
    padding-bottom: 56px;
  }
}
</style>
