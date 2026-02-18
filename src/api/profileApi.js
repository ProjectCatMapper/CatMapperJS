const API_BASE = process.env.REACT_APP_API_URL;

const parseError = async (response) => {
  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }
  if (response.status === 401 || response.status === 403) {
    throw new Error(payload?.error || 'Authentication failed. Please log in again.');
  }
  throw new Error(payload?.error || payload?.message || `Request failed with status ${response.status}`);
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
  return requestJson(`${API_BASE}/profile/bookmarks/${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: authHeaders(cred)
  });
};

export const addBookmark = async ({ userId, database, cmid, cmname, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(`${API_BASE}/profile/bookmarks/add`, {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({ userId, database, cmid, cmname })
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
  return requestJson(`${API_BASE}/profile/history/${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: authHeaders(cred)
  });
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
