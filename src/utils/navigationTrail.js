import { apiUrl } from '../api/endpoints';
import { isCookieConsentAccepted } from './cookieConsent';

const SESSION_KEY = 'catmapper:navigation-trail:session-id';

const newSessionId = () => {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return null;
};

export const getNavigationTrailSessionId = () => {
  if (!isCookieConsentAccepted()) return null;
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const sessionId = newSessionId();
  if (!sessionId) return null;
  sessionStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
};

export const recordNavigationTrailEvent = ({ url = window.location.href, occurredAt = new Date().toISOString() } = {}) => {
  const sessionId = getNavigationTrailSessionId();
  if (!sessionId) return Promise.resolve(false);
  return fetch(apiUrl('/navigation-trail/events'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, url, occurredAt }),
    keepalive: true,
  }).then((response) => response.ok).catch(() => false);
};

export const clearNavigationTrail = () => {
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  if (!sessionId) return Promise.resolve(false);
  return fetch(apiUrl(`/navigation-trail/${encodeURIComponent(sessionId)}`), {
    method: 'DELETE',
    keepalive: true,
  }).then((response) => response.ok).catch(() => false);
};
