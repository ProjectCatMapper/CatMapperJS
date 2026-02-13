const API_BASE = process.env.REACT_APP_API_URL;

const parseError = async (response) => {
  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }
  throw new Error(payload?.error || payload?.message || `Request failed with status ${response.status}`);
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

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
    throw new Error('Missing credentials. Please log in again.');
  }
};

export const getUserProfile = async ({ userId, cred }) => {
  ensureAuth({ userId, cred });

  const params = new URLSearchParams({
    credentials: JSON.stringify(cred)
  });

  return requestJson(`${API_BASE}/profile/${encodeURIComponent(userId)}?${params.toString()}`, {
    method: 'GET'
  });
};

export const getUserActivity = async ({ userId, database, cred }) => {
  ensureAuth({ userId, cred });
  const params = new URLSearchParams({
    credentials: JSON.stringify(cred),
    database
  });
  return requestJson(`${API_BASE}/profile/activity/${encodeURIComponent(userId)}?${params.toString()}`, {
    method: 'GET'
  });
};

export const getBookmarks = async ({ userId, cred }) => {
  ensureAuth({ userId, cred });
  const params = new URLSearchParams({
    credentials: JSON.stringify(cred)
  });
  return requestJson(`${API_BASE}/profile/bookmarks/${encodeURIComponent(userId)}?${params.toString()}`, {
    method: 'GET'
  });
};

export const addBookmark = async ({ userId, database, cmid, cmname, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(`${API_BASE}/profile/bookmarks/add`, {
    method: 'POST',
    body: JSON.stringify({ userId, database, cmid, cmname, credentials: cred })
  });
};

export const removeBookmarks = async ({ userId, items, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(`${API_BASE}/profile/bookmarks/remove`, {
    method: 'POST',
    body: JSON.stringify({ userId, items, credentials: cred })
  });
};

export const getHistory = async ({ userId, cred }) => {
  ensureAuth({ userId, cred });
  const params = new URLSearchParams({
    credentials: JSON.stringify(cred)
  });
  return requestJson(`${API_BASE}/profile/history/${encodeURIComponent(userId)}?${params.toString()}`, {
    method: 'GET'
  });
};

export const addHistoryItem = async ({ userId, database, cmid, cmname, cred }) => {
  ensureAuth({ userId, cred });
  return requestJson(`${API_BASE}/profile/history/add`, {
    method: 'POST',
    body: JSON.stringify({ userId, database, cmid, cmname, credentials: cred })
  });
};

export const requestProfileUpdate = async ({ userId, updates, cred }) => {
  return requestJson(`${API_BASE}/profile/request-update`, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      updates,
      credentials: cred
    })
  });
};

export const confirmProfileUpdate = async ({ userId, requestId, verificationCode, cred }) => {
  return requestJson(`${API_BASE}/profile/confirm-update`, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      requestId,
      verificationCode,
      credentials: cred
    })
  });
};

export const requestPasswordChange = async ({ userId, currentPassword, newPassword, cred }) => {
  return requestJson(`${API_BASE}/profile/request-password-change`, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      currentPassword,
      newPassword,
      credentials: cred
    })
  });
};

export const confirmPasswordChange = async ({ userId, requestId, verificationCode, cred }) => {
  return requestJson(`${API_BASE}/profile/confirm-password-change`, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      requestId,
      verificationCode,
      credentials: cred
    })
  });
};
