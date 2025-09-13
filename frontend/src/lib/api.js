const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function isColdStartStatus(status) {
  return [502, 503, 504, 522, 523, 524].includes(status);
}

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // important for httpOnly cookie
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error('Backend is waking up...');
    err.code = 'BACKEND_OFFLINE';
    throw err;
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (isColdStartStatus(res.status)) {
      const err = new Error('Backend is waking up...');
      err.code = 'BACKEND_OFFLINE';
      throw err;
    }
    const msg = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, b) => request(p, { method: 'POST', body: b }),
  put: (p, b) => request(p, { method: 'PUT', body: b }),
  delete: (p) => request(p, { method: 'DELETE' }),
  health: async () => {
    try {
      const res = await fetch(BASE_URL + '/health', { credentials: 'include' });
      if (!res.ok) return false;
      const body = await res.json().catch(() => ({}));
      return body?.status === 'ok';
    } catch {
      return false;
    }
  }
};
