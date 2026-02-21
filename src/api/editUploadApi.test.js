import { uploadInputNodes, updateWaitingUSES } from './editUploadApi';

describe('editUploadApi auth headers', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'ok' }),
    });
    process.env.REACT_APP_API_URL = 'http://api.test';
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('uploadInputNodes sends bearer authorization when token is available', async () => {
    await uploadInputNodes({
      cred: 'token-123',
      payload: { database: 'ArchaMap', user: '200' },
    });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('http://api.test/uploadInputNodes');
    expect(options.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token-123',
    });
  });

  test('updateWaitingUSES sends bearer authorization and user in payload', async () => {
    await updateWaitingUSES({
      cred: 'token-abc',
      database: 'SocioMap',
      user: '42',
    });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('http://api.test/updateWaitingUSES');
    expect(options.headers.Authorization).toBe('Bearer token-abc');
    expect(JSON.parse(options.body)).toEqual({ database: 'SocioMap', user: '42' });
  });
});
