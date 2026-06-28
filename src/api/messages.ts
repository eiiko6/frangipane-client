import { apiFetch } from './client'
import type { Message } from '../types'

export async function getWsToken(): Promise<string> {
    const res = await apiFetch<{ token: string }>(`/ws/issue-token`);
    return res.token;
}

export function fetchMessages(roomUuid: string, before?: string, limit: number = 30) {
    let url = `/messages/${roomUuid}?limit=${limit}`;
    if (before) {
        url += `&before=${before}`;
    }
    return apiFetch<Message[]>(url);
}

export function sendMessage(roomUuid: string, content: string) {
    return apiFetch<Message>(`/messages/${roomUuid}`, {
        method: 'POST',
        body: JSON.stringify({
            message_type: 'text',
            content,
        }),
    })
}

export function uploadMessage(roomUuid: string, content: string, files: File[]) {
    const formData = new FormData();
    formData.append('content', content);
    files.forEach(file => {
        formData.append('file', file);
    });

    return apiFetch<Message>(`/messages/${roomUuid}/upload`, {
        method: 'POST',
        body: formData,
    });
}
