import { addBookmark, confirmApiKeyCreation, getBookmarks, getHistory, requestApiKeyCreation } from './profileApi';

describe('profileApi bookmark/history normalization', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    process.env.REACT_APP_API_URL = 'http://api.test';
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('addBookmark sends normalized required fields for legacy/whitespace inputs', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', bookmarks: [] })
    });

    await addBookmark({
      userId: ' 42 ',
      database: ' SocioMap ',
      cmid: ' SM100 ',
      cmname: ' Example ',
      cred: 'token-123'
    });

    const [, options] = global.fetch.mock.calls[0];
    const payload = JSON.parse(options.body);

    expect(payload).toEqual({
      userId: '42',
      database: 'sociomap',
      cmid: 'SM100',
      cmname: 'Example'
    });
  });

  test('getBookmarks normalizes legacy key casing from API payload', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bookmarks: [
          { CMID: 'SM1', CMName: 'Alpha', Database: 'SocioMap' },
          { cmid: 'AM2', cmname: 'Beta', database: 'archamap' }
        ]
      })
    });

    const out = await getBookmarks({ userId: '42', cred: 'token-123' });
    expect(out.bookmarks[0]).toMatchObject({ cmid: 'SM1', cmname: 'Alpha', database: 'sociomap' });
    expect(out.bookmarks[1]).toMatchObject({ cmid: 'AM2', cmname: 'Beta', database: 'archamap' });
  });

  test('getHistory normalizes legacy key casing from API payload', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        history: [{ CMID: 'SM9', CMName: 'Legacy', Database: 'SocioMap' }]
      })
    });

    const out = await getHistory({ userId: '42', cred: 'token-123' });
    expect(out.history[0]).toMatchObject({ cmid: 'SM9', cmname: 'Legacy', database: 'sociomap' });
  });

  test('requestApiKeyCreation and confirmApiKeyCreation call expected endpoints', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ requestId: 'apikey_123', maskedEmail: 'ad***@example.org' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ apiKey: 'cmk_abc', apiKeyCreatedAt: '2026-02-18T00:00:00Z' })
      });

    await requestApiKeyCreation({ userId: '42', cred: 'token-123' });
    await confirmApiKeyCreation({
      userId: '42',
      requestId: 'apikey_123',
      verificationCode: '123456',
      cred: 'token-123'
    });

    const [requestUrl, requestOptions] = global.fetch.mock.calls[0];
    expect(requestUrl).toContain('/profile/request-api-key');
    expect(requestOptions.headers.Authorization).toBe('Bearer token-123');

    const [confirmUrl, confirmOptions] = global.fetch.mock.calls[1];
    expect(confirmUrl).toContain('/profile/confirm-api-key');
    expect(JSON.parse(confirmOptions.body)).toEqual({
      userId: '42',
      requestId: 'apikey_123',
      verificationCode: '123456'
    });
  });
});
