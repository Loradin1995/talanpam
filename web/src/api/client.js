// Kliyan API pwòp platfòm nan — ranplase @base44/sdk.
// Jere JWT (access + refresh) ak tout apèl REST bay backend Node/Express la.

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const ACCESS_KEY = 'mondialito_access_token';
const REFRESH_KEY = 'mondialito_refresh_token';

export function getAccessToken() { return localStorage.getItem(ACCESS_KEY); }
export function getRefreshToken() { return localStorage.getItem(REFRESH_KEY); }
export function setSession({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}
export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) { clearSession(); return false; }
  const data = await res.json();
  setSession(data);
  return true;
}

async function request(path, { method = 'GET', body, isForm = false, _retried = false } = {}) {
  const headers = {};
  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isForm) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 401 && !_retried && getRefreshToken()) {
    const refreshed = await tryRefresh();
    if (refreshed) return request(path, { method, body, isForm, _retried: true });
  }

  let data = null;
  try { data = await res.json(); } catch { /* pa gen kò repons */ }

  if (!res.ok) {
    const err = new Error(data?.error || `http_${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  auth: {
    register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
    verifyOtp: (payload) => request('/auth/verify-otp', { method: 'POST', body: payload }),
    resendOtp: (email) => request('/auth/resend-otp', { method: 'POST', body: { email } }),
    login: async (email, password) => {
      const session = await request('/auth/login', { method: 'POST', body: { email, password } });
      setSession(session);
      return session;
    },
    logout: async () => {
      const refreshToken = getRefreshToken();
      try { await request('/auth/logout', { method: 'POST', body: { refreshToken } }); } catch { /* ignore */ }
      clearSession();
    },
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: payload }),
    me: () => request('/auth/me'),
  },
  wallet: {
    me: () => request('/wallet/me'),
    transactions: (type) => request(`/wallet/me/transactions${type ? `?type=${type}` : ''}`),
    withdraw: (amount) => request('/wallet/withdraw', { method: 'POST', body: { amount } }),
  },
  kyc: {
    me: () => request('/kyc/me'),
    submit: (formData) => request('/kyc/me', { method: 'POST', body: formData, isForm: true }),
  },
  games: {
    list: () => request('/games'),
  },
  tournaments: {
    list: (gameSlug) => request(`/tournaments${gameSlug ? `?gameSlug=${gameSlug}` : ''}`),
    detail: (id) => request(`/tournaments/${id}`),
    join: (id) => request(`/tournaments/${id}/join`, { method: 'POST' }),
    startAttempt: (id) => request(`/tournaments/${id}/start-attempt`, { method: 'POST' }),
    submitScore: (id, score, rawResult) => request(`/tournaments/${id}/submit-score`, { method: 'POST', body: { score, rawResult } }),
  },
  matches: {
    rooms: (gameSlug) => request(`/matches/rooms${gameSlug ? `?gameSlug=${gameSlug}` : ''}`),
    mine: () => request('/matches/mine'),
    detail: (id) => request(`/matches/${id}`),
    join: (roomId) => request(`/matches/rooms/${roomId}/join`, { method: 'POST' }),
    move: (id, moveType, payload) => request(`/matches/${id}/move`, { method: 'POST', body: { moveType, payload } }),
    claimTimeout: (id) => request(`/matches/${id}/claim-timeout`, { method: 'POST' }),
    cancelWaiting: (id) => request(`/matches/${id}/cancel-waiting`, { method: 'POST' }),
  },
  admin: {
    searchAccount: (accountId) => request(`/admin/deposits/search/${accountId}`),
    creditDeposit: (userId, amount) => request('/admin/deposits/credit', { method: 'POST', body: { userId, amount } }),
    recentDeposits: () => request('/admin/deposits/recent'),
    withdrawals: () => request('/admin/withdrawals'),
    approveWithdrawal: (id) => request(`/admin/withdrawals/${id}/approve`, { method: 'POST' }),
    rejectWithdrawal: (id) => request(`/admin/withdrawals/${id}/reject`, { method: 'POST' }),
    kycList: () => request('/admin/kyc'),
    reviewKyc: (id, status, adminNote) => request(`/admin/kyc/${id}/review`, { method: 'POST', body: { status, adminNote } }),
    banUser: (id) => request(`/admin/users/${id}/ban`, { method: 'POST' }),
    unbanUser: (id) => request(`/admin/users/${id}/unban`, { method: 'POST' }),
    settings: () => request('/admin/settings'),
    saveSetting: (key, value, label, category) => request(`/admin/settings/${key}`, { method: 'PUT', body: { value, label, category } }),
    auditLog: () => request('/admin/audit-log'),
    tournaments: () => request('/admin/tournaments'),
    createTournament: (data) => request('/admin/tournaments', { method: 'POST', body: data }),
    updateTournament: (id, data) => request(`/admin/tournaments/${id}`, { method: 'PUT', body: data }),
    rooms: () => request('/admin/rooms'),
    createRoom: (data) => request('/admin/rooms', { method: 'POST', body: data }),
    updateRoom: (id, data) => request(`/admin/rooms/${id}`, { method: 'PUT', body: data }),
    liveMatches: () => request('/admin/matches/live'),
    cancelMatch: (id) => request(`/admin/matches/${id}/cancel`, { method: 'POST' }),
    forceWinMatch: (id, winnerId) => request(`/admin/matches/${id}/force-win`, { method: 'POST', body: { winnerId } }),
    reports: (days) => request(`/admin/reports?days=${days}`),
  },
};
