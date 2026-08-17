import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/endpoints', () => ({ apiUrl: (path) => `/api${path}` }));

import {
  clearNavigationTrail,
  getNavigationTrailSessionId,
  recordNavigationTrailEvent,
} from './navigationTrail';
import { setCookieConsent } from './cookieConsent';

describe('first-party navigation trail', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    global.fetch = vi.fn(() => Promise.resolve({ ok: true }));
    vi.stubGlobal('crypto', { randomUUID: () => '00000000-0000-4000-8000-000000000001' });
  });

  it('does not create a session or send an event without analytics consent', async () => {
    await expect(recordNavigationTrailEvent()).resolves.toBe(false);
    expect(getNavigationTrailSessionId()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('records full URLs after analytics consent is accepted', async () => {
    setCookieConsent('accepted');

    await expect(recordNavigationTrailEvent({
      url: 'https://catmapper.org/SocioMap/explore?dataset=example&view=table',
      occurredAt: '2026-08-17T18:42:45.000Z',
    })).resolves.toBe(true);

    expect(fetch).toHaveBeenCalledWith('/api/navigation-trail/events', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        sessionId: '00000000-0000-4000-8000-000000000001',
        url: 'https://catmapper.org/SocioMap/explore?dataset=example&view=table',
        occurredAt: '2026-08-17T18:42:45.000Z',
      }),
    }));
  });

  it('deletes the stored trail when consent is withdrawn', async () => {
    sessionStorage.setItem('catmapper:navigation-trail:session-id', '00000000-0000-4000-8000-000000000001');

    await expect(clearNavigationTrail()).resolves.toBe(true);

    expect(sessionStorage.getItem('catmapper:navigation-trail:session-id')).toBeNull();
    expect(fetch).toHaveBeenCalledWith('/api/navigation-trail/00000000-0000-4000-8000-000000000001', expect.objectContaining({ method: 'DELETE' }));
  });
});
