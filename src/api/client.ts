import { fetch } from '@tauri-apps/plugin-http';
import { getAuthData, clearAuthData } from '../store'
import { API } from '../main.ts'
import router from '../router'

// Custom Error class to hold the backend code
export class ApiError extends Error {
    code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
    }
}

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const auth = await getAuthData()

    const isFormData = options.body instanceof FormData;

    const res = await fetch(`${API}${path}`, {
        ...options,
        method: options.method || 'GET',
        headers: {
            ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
            ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
            ...options.headers,
        },
    })

    // Invalid token?
    if (res.status === 401) {
        if (auth.token) {
            await clearAuthData()
            router.push('/login')
        }
    }

    // Handle error responses
    if (!res.ok) {
        const text = await res.text()

        try {
            const json = JSON.parse(text);
            if (json && json.code && json.message) {
                throw new ApiError(json.code, json.message);
            }
        } catch (e) {
            if (e instanceof ApiError) throw e;
        }

        throw new Error(text || res.statusText)
    }

    const responseText = await res.text()

    if (!responseText) {
        return {} as T
    }

    try {
        return JSON.parse(responseText) as T
    } catch (e) {
        return responseText as unknown as T
    }
}
