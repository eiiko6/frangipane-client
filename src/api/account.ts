import { UpdateUserResponse } from '../types';
import { apiFetch } from './client'
import { upload } from '@tauri-apps/plugin-upload';
import { getAuthData } from '../authStore';
import { API } from '../main.ts';

export function updateSettings(username: string, email: string, password: string) {
  return apiFetch<UpdateUserResponse>('/account/settings', {
    method: 'PUT',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function uploadAvatar(
  filePath: string,
  onProgress: (progress: number, total: number) => void
) {
  const auth = await getAuthData();
  const url = `${API}/account/upload-avatar`;
  const headers = new Map<string, string>([
    ['Authorization', `Bearer ${auth.token}`],
    ['Content-Type', 'application/octet-stream']
  ]);

  return upload(
    url,
    filePath,
    ({ progress, total }) => {
      onProgress(progress, total);
    },
    headers
  );
}

export function getAvatar(uuid: string): string {
  return `${API}/account/get-avatar/${uuid}`;
}
