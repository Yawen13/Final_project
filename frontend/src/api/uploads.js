// Uploads a picked file and resolves with a URL the post can store.
// On the deployed backend the file goes to POST /api/uploads (Firebase
// Storage); with no backend configured it stays a data URL in localStorage.

import { API_BASE, ApiError, hasBackend } from './client';

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadMedia(file) {
  if (!hasBackend) return readAsDataUrl(file);

  const form = new FormData();
  form.append('file', file);

  let response;
  try {
    response = await fetch(`${API_BASE}/uploads`, { method: 'POST', body: form });
  } catch {
    throw new ApiError('Could not reach the server. Is the backend running?', 0);
  }

  if (!response.ok) {
    let message = `Upload failed (${response.status}).`;
    try {
      const body = await response.json();
      if (body && typeof body.message === 'string') message = body.message;
      else if (body && typeof body.error === 'string') message = body.error;
    } catch {
      // Non-JSON error body; keep the status-code message.
    }
    throw new ApiError(message, response.status);
  }

  const body = await response.json();
  return body.url;
}
