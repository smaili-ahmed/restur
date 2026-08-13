const BASE = '/api';

const TOKEN_KEY = 'cyberguard_access_token';

const safeStorage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

let accessToken = safeStorage.get(TOKEN_KEY);

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) safeStorage.set(TOKEN_KEY, token);
  else safeStorage.remove(TOKEN_KEY);
};

export const getAccessToken = () => accessToken;

export class ApiError extends Error {
  constructor(message, code, status, details) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE}${path}`, { credentials: 'include', ...options, headers });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    throw new ApiError(data?.message || 'Request failed.', data?.code || 'ERROR', res.status, data?.details);
  }
  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),

  requestOtp: (email, password) => request('/auth/request-otp', { method: 'POST', body: { email, password } }),
  verifyOtp: (pendingToken, code) => request('/auth/verify-otp', { method: 'POST', body: { pendingToken, code } }),
  resendOtp: (pendingToken) => request('/auth/resend-otp', { method: 'POST', body: { pendingToken } }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (pendingToken, code, newPassword) => request('/auth/reset-password', { method: 'POST', body: { pendingToken, code, newPassword } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  myConnections: () => request('/connections/mine'),
};
