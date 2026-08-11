export const COOKIE_CONSENT_KEY = "cookieConsent";
export const COOKIE_CONSENT_CHANGED_EVENT = "catmapper:cookie-consent-changed";
const LEGACY_COOKIE_CONSENT_KEY = "cookie-consent";

const ACCEPTED = "accepted";
const REJECTED = "rejected";

const normalizeConsent = (value) => {
  if (value === ACCEPTED || value === "true") return ACCEPTED;
  if (value === REJECTED || value === "false") return REJECTED;
  return null;
};

export const getCookieConsent = () => {
  const currentValue = normalizeConsent(localStorage.getItem(COOKIE_CONSENT_KEY));
  if (currentValue) return currentValue;
  return normalizeConsent(localStorage.getItem(LEGACY_COOKIE_CONSENT_KEY));
};

export const setCookieConsent = (value) => {
  if (value !== ACCEPTED && value !== REJECTED) return;
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
  localStorage.setItem(LEGACY_COOKIE_CONSENT_KEY, value === ACCEPTED ? "true" : "false");
  document.cookie = `cookieConsent=${value}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: value }));
};

export const clearCookieConsent = () => {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  localStorage.removeItem(LEGACY_COOKIE_CONSENT_KEY);
  document.cookie = "cookieConsent=; path=/; max-age=0; SameSite=Lax";
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: null }));
};

export const isCookieConsentAccepted = () => getCookieConsent() === ACCEPTED;
