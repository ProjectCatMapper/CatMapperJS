export const COOKIE_CONSENT_KEY = "cookieConsent";
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
};

export const isCookieConsentAccepted = () => getCookieConsent() === ACCEPTED;

