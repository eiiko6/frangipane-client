import { UpdateUserResponse } from '../types';
import { apiFetch } from './client'
// import { upload } from '@tauri-apps/plugin-upload';
import { getAuthData } from '../store';
import { API } from '../main.ts';

export function updateSettings(username: string, email: string, password: string) {
  return apiFetch<UpdateUserResponse>('/account/settings', {
    method: 'PUT',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function uploadAvatar(
  fileData: Uint8Array,
  onProgress: (progress: number, total: number) => void
) {
  const auth = await getAuthData();
  const url = `${API}/account/upload-avatar`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    xhr.setRequestHeader('Authorization', `Bearer ${auth.token}`);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');

    // Handle Progress
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded, event.total);
        }
      };
    }

    // Handle Response
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));

    xhr.send(fileData);
  });
}

export function getAvatar(uuid: string): string {
  return `${API}/account/get-avatar/${uuid}`;
}
