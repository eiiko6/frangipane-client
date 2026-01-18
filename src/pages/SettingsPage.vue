<template>
  <div class="settings-page">
    <h1>{{ $t('settings-title') }}</h1>

    <UpdateAccountModal v-if="showUpdateModal" :user="user" @close="showUpdateModal = false" @updated="fetchUserData" />
    <UploadAvatarModal v-if="showAvatarModal" @close="showAvatarModal = false" />

    <h2>{{ $t('settings-account') }}</h2>
    <div v-if="user" class="info-card">
      <div class="avatar-display">
        <img :src="getAvatarUrl(user.uuid)" @error="handleAvatarError" class="avatar-img" />

        <button class="update-btn" @click="showAvatarModal = true">
          {{ $t('settings-upload-avatar-btn') || 'Change Avatar' }}
        </button>
      </div>

      <div class="info-display">
        <div class="left">
          <p><strong>{{ $t('settings-label-username') }}</strong> {{ user.username }}</p>
          <p><strong>{{ $t('settings-label-email') }}</strong> {{ user.email }}</p>
        </div>

        <button class="update-btn" @click="showUpdateModal = true">{{ $t('settings-update-btn') }}</button>
      </div>
    </div>
    <div v-else class="loading-state">
      <p>{{ $t('settings-loading') }}</p>
    </div>

    <h2>{{ $t('settings-language') }}</h2>
    <div class="input-group">
      <div class="lang-grid">
        <button v-for="lang in languages" :key="lang.code" class="lang-btn"
          :class="{ active: currentLang === lang.code }" @click="changeLanguage(lang.code)">
          {{ lang.name }}
        </button>
      </div>
    </div>

    <h2>{{ $t('settings-appearance') || 'Appearance' }}</h2>
    <div class="theme-grid">
      <button v-for="theme in availableThemes" :key="theme.id" class="theme-btn"
        :class="{ active: currentTheme === theme.id }" @click="changeTheme(theme.id)">
        {{ theme.name }}
      </button>
    </div>

    <div class="setting-checkbox">
      <label class="checkbox-label">
        <input type="checkbox" v-model="useCompactLayout" @change="toggleCompactLayout" />
        <span>{{ $t('settings-compact-layout') || 'Use Compact Layout' }} (WIP)</span>
      </label>
    </div>

    <button class="logout-btn" @click="logout">
      <i class="fa-solid fa-right-from-bracket"></i>
      <span>{{ $t('settings-logout-btn') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { logout as authLogout } from '../store.ts'
import { saveThemePreference, getThemePreference } from "../store.ts"
import { getAuthData } from "../store.ts"
import { saveCompactLayoutPreference, getCompactLayoutPreference } from "../store.ts"
import type { User } from "../types"
import UpdateAccountModal from '../components/UpdateAccountModal.vue'
import { useFluent } from 'fluent-vue'
import { saveLocalePreference, getLocalePreference } from "../store.ts"
import { getSupportedLanguagesMetadata, setLanguage } from '../i18n'
import UploadAvatarModal from '../components/UploadAvatarModal.vue'
import defaultAvatar from '../assets/default-avatar.png'
import { getAvatarUrl } from '../store.ts'
import { getAvailableThemes } from '../themeLoader';

const { $t } = useFluent()

const showAvatarModal = ref(false)

const router = useRouter()
const availableThemes = getAvailableThemes();

const user = ref<User | null>(null)
const showUpdateModal = ref(false)
const currentLang = ref('')

const languages = computed(() => getSupportedLanguagesMetadata())
const currentTheme = ref('default');
const useCompactLayout = ref(false)

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = defaultAvatar;
};

async function fetchUserData() {
  try {
    const auth = await getAuthData()
    user.value = auth.user
  } catch (err) {
    console.error("Failed to load user data:", err)
  }
}

onMounted(async () => {
  const pref = await getLocalePreference()
  currentLang.value = pref || (navigator.language.split('-')[0])
  currentTheme.value = await getThemePreference()
  useCompactLayout.value = await getCompactLayoutPreference()

  fetchUserData()
})

async function changeLanguage(code: string) {
  const actual = setLanguage(code)
  currentLang.value = actual
  await saveLocalePreference(actual)
}

async function changeTheme(theme: string) {
  currentTheme.value = theme
  await saveThemePreference(theme)
}

async function toggleCompactLayout() {
  await saveCompactLayoutPreference(useCompactLayout.value)
}

function logout() {
  authLogout()
  router.push('/login')
}
</script>

<style scoped>
.settings-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

h2 {
  margin-top: 20px;
}

.info-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 1rem;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
}

.avatar-display,
.info-display {
  display: flex;
  /* border: 1px solid var(--border); */
  /* border-radius: var(--radius); */
  /* background-color: rgba(255, 255, 255, 0.02); */
  /* padding: 1rem; */
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}

/* .update-btn { */
/*   position: absolute; */
/*   right: 10px; */
/*   top: 10px; */
/* } */

.lang-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.lang-btn {
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--text);
  margin: 0;
}

.lang-btn:hover:not(.active) {
  background: rgba(var(--accent-rgb), 0.1);
  border-color: var(--accent);
}

.lang-btn.active {
  background: var(--accent);
  color: #000;
  border-color: var(--accent);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.theme-btn {
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--text);
  margin: 0;
  padding: 12px;
  font-size: 0.9rem;
}

.theme-btn.active {
  background: var(--accent);
  color: var(--bg);
  border-color: var(--accent);
}

.theme-btn:hover:not(.active) {
  background: rgba(var(--accent-rgb), 0.1);
  border-color: var(--accent);
}

.setting-checkbox {
  padding: 10px;
  margin-top: 15px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
}

.logout-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
  padding: 10px 20px;
  color: var(--text);
  background-color: transparent;
  border: 1px solid var(--error);
  border-radius: var(--radius);
  width: fit-content;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  color: var(--error);
}

.logout-btn:hover i {
  color: var(--error);
}

.logout-btn i {
  font-size: 1.25rem;
}

.loading-state {
  padding: 2rem;
  text-align: center;
  color: var(--muted);
}

@media screen and (max-width: 720px) {

  .avatar-display,
  .info-display {
    justify-content: center;
  }
}
</style>
