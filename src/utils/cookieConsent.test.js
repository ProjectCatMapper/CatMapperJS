import { beforeEach, describe, expect, it } from 'vitest';
import {
  COOKIE_CONSENT_VERSION,
  clearCookieConsent,
  getCookieConsent,
  setCookieConsent,
} from './cookieConsent';

describe('cookie consent versioning', () => {
  beforeEach(() => localStorage.clear());

  it('renews consent recorded before the navigation-trail purpose', () => {
    localStorage.setItem('cookieConsent', 'accepted');

    expect(getCookieConsent()).toBeNull();
  });

  it('returns consent recorded for the current purpose version', () => {
    setCookieConsent('accepted');

    expect(localStorage.getItem('catmapper:cookie-consent-version')).toBe(COOKIE_CONSENT_VERSION);
    expect(getCookieConsent()).toBe('accepted');
  });

  it('clears the current consent version', () => {
    setCookieConsent('rejected');
    clearCookieConsent();

    expect(getCookieConsent()).toBeNull();
  });
});
