export const AUTH_INVALID_EVENT = 'catmapper-auth-invalid';
export const AUTH_INVALID_NOTICE_KEY = 'catmapper.auth.invalid.notice';
export const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please log in again.";

const AUTH_FAILURE_MARKERS = [
  'missing credentials',
  'missing credential fields',
  'invalid credentials',
  'credential invalid',
  'credentials do not match',
  'does not match authenticated api key/token owner',
  'user is not verified',
  'user is not authorized',
  'authentication failed',
  'auth fail',
  'invalid token',
  'signature expired',
  'session expired',
];

export const looksLikeAuthFailure = (message) => {
  const normalized = String(message || '').toLowerCase();
  if (!normalized) return false;
  return AUTH_FAILURE_MARKERS.some((marker) => normalized.includes(marker));
};

export const setAuthInvalidNotice = (message = SESSION_EXPIRED_MESSAGE) => {
  try {
    localStorage.setItem(AUTH_INVALID_NOTICE_KEY, message);
  } catch (_err) {
    // ignore storage errors
  }
};

export const consumeAuthInvalidNotice = () => {
  try {
    const notice = localStorage.getItem(AUTH_INVALID_NOTICE_KEY);
    localStorage.removeItem(AUTH_INVALID_NOTICE_KEY);
    return notice || '';
  } catch (_err) {
    return '';
  }
};

export const signalAuthInvalid = (message = SESSION_EXPIRED_MESSAGE) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_INVALID_EVENT, { detail: { message } }));
  }
};
