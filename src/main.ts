import { createApp } from 'vue'
import router from './router.ts'
import App from './App.vue'
import { validateToken, initTheme } from './store.ts'
import { fluent, setLanguage } from './i18n'
import './base.css'
import { getLocalePreference } from './store.ts'
import { invoke } from '@tauri-apps/api/core'

export function logJS(msg: any) {
    invoke('log', { message: typeof msg === 'string' ? msg : JSON.stringify(msg) }).catch(() => { });
}

async function init() {
    await validateToken()

    const app = createApp(App)
    app.use(router)
    app.use(fluent)

    const savedLocale = await getLocalePreference();
    const osLocale = navigator.language;

    await initTheme();

    if (savedLocale) {
        setLanguage(savedLocale);
    } else {
        setLanguage(osLocale);
    }

    // await createChannel({
    //     id: 'messages',
    //     name: 'Messages',
    //     description: 'Notifications for new messages',
    //     importance: Importance.High,
    //     visibility: Visibility.Private,
    //     lights: true,
    //     lightColor: '#ff0000',
    //     vibration: true,
    //     sound: 'notification_sound',
    // });

    // window.addEventListener("error", (event) => {
    //     logJS(`Uncaught JS Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
    // });
    //
    // window.addEventListener("unhandledrejection", (event) => {
    //     logJS(`Unhandled Promise Rejection: ${JSON.stringify(event.reason)}`);
    // });

    app.mount('#app')
}

init()

// export const API = 'http://127.0.0.1:8080'
export const API = 'http://192.168.1.183:8080'
// export const API = 'https://alatreon.org/frangipane'
// export const API_WS = 'ws://127.0.0.1:8080/ws'
export const API_WS = 'ws://192.168.1.183:8080/ws'
// export const API_WS = 'wss://alatreon.org/frangipane/ws'
