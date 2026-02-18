import { addBookmark, getBookmarks, getHistory } from './profileApi';

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
});
