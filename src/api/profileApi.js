const API_BASE = process.env.REACT_APP_API_URL;

const signalAuthInvalid = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('catmapper-auth-invalid'));
  }
};

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
    signalAuthInvalid();
    throw new Error(payload?.error || 'Authentication failed. Please log in again.');
  }
  const message = payload?.error || payload?.message || `Request failed with status ${response.status}`;
  const normalized = String(message).toLowerCase();
  if (
    normalized.includes('missing credentials') ||
    (normalized.includes('credential') && normalized.includes('invalid')) ||
    normalized.includes('credentials do not match') ||
    normalized.includes('user is not verified') ||
    (normalized.includes('auth') && normalized.includes('fail'))
  ) {
    signalAuthInvalid();
    throw new Error('Session expired or invalid credentials. Please log in again.');
  }
  throw new Error(message);
};

const requestJson = async (url, options = {}) => {
  let response;
  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
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
    signalAuthInvalid();
    throw new Error('Missing authentication token. Please log in again.');
  }
};

const authHeaders = (cred) => ({
  Authorization: `Bearer ${cred}`
});

export const getUserProfile = async ({ userId, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(`${API_BASE}/profile/${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: authHeaders(cred)
  });
};

export const getUserActivity = async ({ userId, database, cred }) => {
  ensureAuth({ userId, cred });
  const params = new URLSearchParams({ database });
  return requestJson(`${API_BASE}/profile/activity/${encodeURIComponent(userId)}?${params.toString()}`, {
    method: 'GET',
    headers: authHeaders(cred)
  });
};

export const getBookmarks = async ({ userId, cred }) => {
  ensureAuth({ userId, cred });
  const data = await requestJson(`${API_BASE}/profile/bookmarks/${encodeURIComponent(userId)}`, {
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
  return requestJson(`${API_BASE}/profile/bookmarks/add`, {
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
  return requestJson(`${API_BASE}/profile/bookmarks/remove`, {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({ userId, items })
  });
};

export const getHistory = async ({ userId, cred }) => {
  ensureAuth({ userId, cred });
  const data = await requestJson(`${API_BASE}/profile/history/${encodeURIComponent(userId)}`, {
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
  return requestJson(`${API_BASE}/profile/history/add`, {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({ userId, database, cmid, cmname })
  });
};

export const requestProfileUpdate = async ({ userId, updates, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(`${API_BASE}/profile/request-update`, {
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
  return requestJson(`${API_BASE}/profile/confirm-update`, {
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
  return requestJson(`${API_BASE}/profile/request-password-change`, {
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
  return requestJson(`${API_BASE}/profile/confirm-password-change`, {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({
      userId,
      requestId,
      verificationCode
    })
  });
};

export const requestForgotPassword = async ({ user, newPassword }) => {
  const normalizedUser = normalizeScalar(user);
  if (!normalizedUser) {
    throw new Error('Username is required.');
  }
  if (!newPassword) {
    throw new Error('New password is required.');
  }

  return requestJson(`${API_BASE}/forgot-password/request`, {
    method: 'POST',
    body: JSON.stringify({
      user: normalizedUser,
      newPassword
    })
  });
};

export const confirmForgotPassword = async ({ user, requestId, verificationCode }) => {
  const normalizedUser = normalizeScalar(user);
  if (!normalizedUser || !requestId || !verificationCode) {
    throw new Error('Missing required confirmation fields.');
  }

  return requestJson(`${API_BASE}/forgot-password/confirm`, {
    method: 'POST',
    body: JSON.stringify({
      user: normalizedUser,
      requestId,
      verificationCode
    })
  });
};
