import { looksLikeAuthFailure, SESSION_EXPIRED_MESSAGE, signalAuthInvalid } from '../utils/authSession';
import { apiEndpoints, apiUrl } from './endpoints';

const normalizeScalar = (value) => (value == null ? '' : String(value).trim());

const normalizeDatabase = (value) => {
  const raw = normalizeScalar(value);
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (lower === 'sociomap') return 'sociomap';
  if (lower === 'archamap') return 'archamap';
  return raw;
};

const normalizeLibraryEntry = (entry) => {
  const row = entry || {};
  const cmid = normalizeScalar(row.cmid || row.CMID);
  const cmname = normalizeScalar(row.cmname || row.CMName);
  const database = normalizeDatabase(row.database || row.Database || row.db);
  return {
    ...row,
    cmid,
    cmname,
    database
  };
};

const parseError = async (response) => {
  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }
  if (response.status === 401 || response.status === 403) {
    signalAuthInvalid(SESSION_EXPIRED_MESSAGE);
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }
  const message = payload?.error || payload?.message || `Request failed with status ${response.status}`;
  if (looksLikeAuthFailure(message)) {
    signalAuthInvalid(SESSION_EXPIRED_MESSAGE);
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }
  throw new Error(message);
};

const requestJson = async (url, options = {}) => {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
  } catch (error) {
    // Browsers usually throw TypeError('Failed to fetch') on CORS/preflight/network failures.
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('failed to fetch') || message.includes('networkerror')) {
      throw new Error('Request blocked by network/CORS. Please refresh login and try again. If it persists, contact support.');
    }
    throw new Error(error?.message || 'Unexpected network error.');
  }

  if (!response.ok) {
    await parseError(response);
  }

  return response.json();
};

const ensureAuth = ({ userId, cred }) => {
  if (!userId) {
    throw new Error('Missing userId. User must be logged in.');
  }
  if (!cred) {
    signalAuthInvalid(SESSION_EXPIRED_MESSAGE);
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }
};

const authHeaders = (cred) => ({
  Authorization: `Bearer ${cred}`
});

export const getUserProfile = async ({ userId, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(apiUrl(apiEndpoints.profile(userId)), {
    method: 'GET',
    headers: authHeaders(cred)
  });
};

export const getUserActivity = async ({ userId, database, cred }) => {
  ensureAuth({ userId, cred });
  const params = new URLSearchParams({ database });
  return requestJson(`${apiUrl(`/users/${encodeURIComponent(userId)}/activity`)}?${params.toString()}`, {
    method: 'GET',
    headers: authHeaders(cred)
  });
};

export const getBookmarks = async ({ userId, cred }) => {
  ensureAuth({ userId, cred });
  const data = await requestJson(apiUrl(apiEndpoints.bookmarks(userId)), {
    method: 'GET',
    headers: authHeaders(cred)
  });
  return {
    ...data,
    bookmarks: (data.bookmarks || []).map(normalizeLibraryEntry)
  };
};

export const addBookmark = async ({ userId, database, cmid, cmname, cred, item }) => {
  const normalizedUserId = normalizeScalar(userId);
  const normalizedItem = normalizeLibraryEntry(item || {});
  const normalizedDatabase = normalizeDatabase(database || normalizedItem.database);
  const normalizedCmid = normalizeScalar(cmid || normalizedItem.cmid);
  const normalizedCmname = normalizeScalar(cmname || normalizedItem.cmname);

  if (!normalizedDatabase || !normalizedCmid) {
    throw new Error('Missing required bookmark fields (database and CMID).');
  }

  ensureAuth({ userId, cred });
  return requestJson(apiUrl('/users/bookmarks'), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({
      userId: normalizedUserId,
      database: normalizedDatabase,
      cmid: normalizedCmid,
      cmname: normalizedCmname
    })
  });
};

export const removeBookmarks = async ({ userId, items, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(apiUrl('/users/bookmarks/remove'), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({ userId, items })
  });
};

export const getHistory = async ({ userId, cred }) => {
  ensureAuth({ userId, cred });
  const data = await requestJson(apiUrl(apiEndpoints.history(userId)), {
    method: 'GET',
    headers: authHeaders(cred)
  });
  return {
    ...data,
    history: (data.history || []).map(normalizeLibraryEntry)
  };
};

export const addHistoryItem = async ({ userId, database, cmid, cmname, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(apiUrl('/users/history'), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({ userId, database, cmid, cmname })
  });
};

export const requestProfileUpdate = async ({ userId, updates, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(apiUrl('/profile-update-requests'), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({
      userId,
      updates
    })
  });
};

export const confirmProfileUpdate = async ({ userId, requestId, verificationCode, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(apiUrl('/profile-update-confirmations'), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({
      userId,
      requestId,
      verificationCode
    })
  });
};

export const requestPasswordChange = async ({ userId, currentPassword, newPassword, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(apiUrl('/password-change-requests'), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({
      userId,
      currentPassword,
      newPassword
    })
  });
};

export const confirmPasswordChange = async ({ userId, requestId, verificationCode, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(apiUrl('/password-change-confirmations'), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({
      userId,
      requestId,
      verificationCode
    })
  });
};

export const requestApiKeyCreation = async ({ userId, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(apiUrl('/api-key-requests'), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({
      userId
    })
  });
};

export const confirmApiKeyCreation = async ({ userId, requestId, verificationCode, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(apiUrl('/api-key-confirmations'), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({
      userId,
      requestId,
      verificationCode
    })
  });
};

export const requestForgotPassword = async ({ user, email, newPassword }) => {
  const normalizedUser = normalizeScalar(user);
  const normalizedEmail = normalizeScalar(email);
  if (!normalizedUser && !normalizedEmail) {
    throw new Error('Username or email is required.');
  }
  if (!newPassword) {
    throw new Error('New password is required.');
  }

  return requestJson(apiUrl('/password-reset-requests'), {
    method: 'POST',
    body: JSON.stringify({
      user: normalizedUser,
      email: normalizedEmail,
      newPassword
    })
  });
};

export const confirmForgotPassword = async ({ user, email, requestId, verificationCode }) => {
  const normalizedUser = normalizeScalar(user);
  const normalizedEmail = normalizeScalar(email);
  if ((!normalizedUser && !normalizedEmail) || !requestId || !verificationCode) {
    throw new Error('Missing required confirmation fields.');
  }

  return requestJson(apiUrl('/password-reset-confirmations'), {
    method: 'POST',
    body: JSON.stringify({
      user: normalizedUser,
      email: normalizedEmail,
      requestId,
      verificationCode
    })
  });
};
