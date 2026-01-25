import { apiFetch } from './api/client'
import type { LoginResponse, User } from './types'
import { ref, computed } from 'vue'
import { fetchFriendRequests } from './api/friends'
import { fetchRoomInvites } from './api/rooms'
import type { FriendRequest, RoomInvite } from './types'
import { load, Store } from '@tauri-apps/plugin-store'
import { UpdateUserResponse } from './types'
import { reactive } from 'vue'
import { API } from './main'
import { applyTheme } from './themeLoader.ts';

let store: Store | null = null
export const initAuth = getAuthData

async function getStore() {
    if (!store) store = await load('store.json')
    return store
}

export async function getAuthData() {
    const s = await getStore()
    const token = await s.get<string>('token')
    const user = await s.get<User>('user')
    return { token: token || null, user: user || null, isAuthenticated: !!token }
}

export async function saveAuthData(token: string, user: User) {
    const s = await getStore()
    await s.set('token', token)
    await s.set('user', user)
    await s.save()
}

export async function clearAuthData() {
    const s = await getStore()
    s.clear()
    await s.save()
}

export async function updateLocalUser(newData: UpdateUserResponse, uuid?: string) {
    const updatedUser = {
        username: newData.username,
        email: newData.email,
        uuid,
        avatar_url: `${getAvatar(uuid || '')}?t=${Date.now()}`
    }

    const s = await getStore()
    await s.set('user', updatedUser)
    await s.save()
}

export async function refreshLocalUser() {
    const s = await getStore()
    const user = await s.get<User>('user')

    if (user) {
        user.avatar_url = `${getAvatar(user.uuid)}?t=${Date.now()}`

        await s.set('user', user)
        await s.save()
    }
}

export async function setLastRoom(uuid: string) {
    if (!uuid || uuid === 'none') return
    const s = await getStore()
    await s.set('last_room_uuid', uuid)
    await s.save()
}

export async function getLastRoom(): Promise<string | null> {
    const s = await getStore()
    return (await s.get<string>('last_room_uuid')) ?? null
}

export async function saveLocalePreference(locale: string) {
    const s = await getStore()
    await s.set('language', locale)
    await s.save()
}

export async function getLocalePreference(): Promise<string | null> {
    const s = await getStore()
    return (await s.get<string>('language')) ?? null
}


export async function login(email: string, username: string, password: string) {
    const res: LoginResponse = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, username, password }),
    })

    let user: User = {
        uuid: res.uuid,
        username: res.username,
        email: res.email,
        avatar_url: getAvatar(res.uuid)
    };
    await saveAuthData(res.token, user)
    return { token: res.token, uuid: res.uuid, isAuthenticated: true }
}

export async function logout() {
    await clearAuthData()
    return { token: null, uuid: null, isAuthenticated: false }
}

export async function validateToken(): Promise<boolean> {
    const auth = await getAuthData()
    if (!auth.token) return false

    try {
        await apiFetch('/validate-token')
        return true
    } catch (e) {
        return false
    }
}

export async function register(email: string, username: string, password: string) {
    const response: LoginResponse = await apiFetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
    });

    await login(email, username, password)
    return response;
}

const requests = ref<FriendRequest[]>([])
const invites = ref<RoomInvite[]>([])

export function useNotifications() {
    const totalCount = computed(() => requests.value.length + invites.value.length)

    async function refreshNotifications() {
        const auth = await getAuthData()
        if (!auth.token) {
            return
        }

        try {
            const [fReqs, rInvs] = await Promise.all([
                fetchFriendRequests(),
                fetchRoomInvites()
            ])
            requests.value = fReqs
            invites.value = rInvs
        } catch (err) {
            console.error("Failed to fetch notifications", err)
        }
    }

    return {
        requests,
        invites,
        totalCount,
        refreshNotifications
    }
}

// A reactive object to store the last updated timestamp for each user
const avatarTimestamps = reactive<Record<string, number>>({})


export function getAvatar(uuid: string): string {
    return `${API}/account/get-avatar/${uuid}`;
}

// Generates the avatar URL with a timestamp
export function getAvatarUrl(uuid: string | undefined | null) {
    if (!uuid) return ''

    if (!avatarTimestamps[uuid]) {
        avatarTimestamps[uuid] = Date.now()
    }

    return `${getAvatar(uuid)}?t=${avatarTimestamps[uuid]}`
}

export function refreshAvatar(uuid: string) {
    avatarTimestamps[uuid] = Date.now()
}

// ==== Color themes ====

export async function saveThemePreference(themeId: string) {
    const s = await getStore();
    await s.set('theme', themeId);
    await s.save();
    applyTheme(themeId);
}

export async function initTheme() {
    const s = await getStore();
    const themeId = (await s.get<string>('theme')) || 'default';
    applyTheme(themeId);
}

export async function getThemePreference(): Promise<string> {
    const s = await getStore()
    return (await s.get<string>('theme')) ?? 'default'
}

export async function applyStoredTheme() {
    const theme = await getThemePreference();
    document.documentElement.setAttribute('data-theme', theme);
}

// ==== Layout ====

export async function saveCompactLayoutPreference(enabled: boolean) {
    const s = await getStore();
    await s.set('compact_layout', enabled);
    await s.save();
}

export async function getCompactLayoutPreference(): Promise<boolean> {
    const s = await getStore();
    return (await s.get<boolean>('compact_layout')) ?? false;
}

// ==== Message draft ====

export async function saveMessageDraft(text: string) {
    const s = await getStore()
    await s.set('message_draft', text)
    await s.save()
}

export async function getMessageDraft(): Promise<string> {
    const s = await getStore()
    return (await s.get<string>('message_draft')) ?? ''
}
