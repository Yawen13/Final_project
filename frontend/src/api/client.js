// Shared HTTP plumbing for the Unfinished backend (the Express server on the
// Backend-Monica branch).
//
// VITE_API_BASE_URL points at it — see .env.example, e.g.
//   VITE_API_BASE_URL=http://localhost:3000/api
// the /api prefix included, because every path in src/api/ is relative to it.
//
// With the variable unset `hasBackend` is false and each module falls back to
// placeholder data, so the app still runs and demos before the server is up.

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const API_BASE = RAW_BASE.replace(/\/+$/, '');
export const hasBackend = API_BASE !== '';

// The messages endpoints are still being built (the backend only serves
// /auth and /users so far), so those calls stay on their placeholder store
// even when API_BASE is set — otherwise the Messages page would just 404.
// Set VITE_MESSAGES_API=on in .env.local once they ship.
export const messagesUseApi = hasBackend && import.meta.env.VITE_MESSAGES_API === 'on';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError('Could not reach the server. Is the backend running?', 0);
  }

  if (!response.ok) {
    // The backend reports failures as { message } — that text ("Invalid
    // username or password") is friendlier than a status code.
    let message = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      if (body && typeof body.message === 'string') message = body.message;
    } catch {
      // Non-JSON error body; keep the status-code message.
    }
    throw new ApiError(message, response.status);
  }

  return response.status === 204 ? null : response.json();
}
