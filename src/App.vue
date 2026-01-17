<template>
    <div id="page">
        <main id="content">
            <router-view />
        </main>

        <VersionWarningModal v-if="showVersionWarningModal" :appVersion="appVersion" :backendVersion="backendVersion"
            :expectedBackendVersion="expectedBackendVersion" @close="showVersionWarningModal = false" />

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

const showVersionWarningModal = ref(false)
const backendVersion = ref('')

const appVersion = __APP_VERSION__
const expectedBackendVersion = __BACKEND_VERSION__

onMounted(async () => {
    backendVersion.value = (await getBackendVersion()).version
    if (backendVersion.value !== expectedBackendVersion) {
        showVersionWarningModal.value = true
    }
})

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
    padding: 2rem;

    flex: 1;
    overflow-y: auto;
}

footer {
    width: 100%;
    display: flex;
    justify-content: center;
    padding-bottom: 24px;
    background: var(--bg);
}

@media (max-width: 720px) {
    #content {
        padding: 12px;
        padding-top: 30px;
    }

    footer {
        padding-bottom: 56px;
    }
}
</style>
