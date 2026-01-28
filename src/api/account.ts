import { UpdateUserResponse } from '../types';
import { apiFetch, ApiError } from './client'
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
                if (xhr.status === 413) {
                    reject(new ApiError('FILE_TOO_LARGE', 'File too large'));
                    return;
                }

                try {
                    const res = JSON.parse(xhr.responseText);
                    if (res && res.code && res.message) {
                        reject(new ApiError(res.code, res.message));
                        return;
                    }
                } catch (e) {
                }

                reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
            }
        };

        xhr.onerror = () => {
            if (xhr.status === 413) {
                reject(new ApiError('FILE_TOO_LARGE', 'File too large'));
                return;
            }

            reject(new ApiError("UPLOAD_FAILED", "Failed uploading file."));
        };

        xhr.send(fileData);
    });
}
