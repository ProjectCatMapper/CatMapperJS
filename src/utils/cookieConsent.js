export const COOKIE_CONSENT_KEY = "cookieConsent";
export const COOKIE_CONSENT_CHANGED_EVENT = "catmapper:cookie-consent-changed";
export const COOKIE_CONSENT_VERSION = "2026-08-navigation-trail";
const LEGACY_COOKIE_CONSENT_KEY = "cookie-consent";
const CONSENT_VERSION_KEY = "catmapper:cookie-consent-version";

const ACCEPTED = "accepted";
const REJECTED = "rejected";

const normalizeConsent = (value) => {
  if (value === ACCEPTED || value === "true") return ACCEPTED;
  if (value === REJECTED || value === "false") return REJECTED;
  return null;
};

export const getCookieConsent = () => {
  if (localStorage.getItem(CONSENT_VERSION_KEY) !== COOKIE_CONSENT_VERSION) return null;
  const currentValue = normalizeConsent(localStorage.getItem(COOKIE_CONSENT_KEY));
  if (currentValue) return currentValue;
  return normalizeConsent(localStorage.getItem(LEGACY_COOKIE_CONSENT_KEY));
};

export const setCookieConsent = (value) => {
  if (value !== ACCEPTED && value !== REJECTED) return;
  localStorage.setItem(CONSENT_VERSION_KEY, COOKIE_CONSENT_VERSION);
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
  localStorage.setItem(LEGACY_COOKIE_CONSENT_KEY, value === ACCEPTED ? "true" : "false");
  document.cookie = `cookieConsent=${value}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: value }));
};

export const clearCookieConsent = () => {
  localStorage.removeItem(CONSENT_VERSION_KEY);
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  localStorage.removeItem(LEGACY_COOKIE_CONSENT_KEY);
  document.cookie = "cookieConsent=; path=/; max-age=0; SameSite=Lax";
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: null }));
};

export const isCookieConsentAccepted = () => getCookieConsent() === ACCEPTED;
