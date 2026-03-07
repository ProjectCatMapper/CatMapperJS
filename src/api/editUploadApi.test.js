import {
  uploadInputNodes,
  updateWaitingUSES,
  getWaitingUSESStatus,
  getUploadInputNodesStatus,
  cancelUploadInputNodes,
  getUploadProperties,
} from './editUploadApi';

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

  test('getWaitingUSESStatus sends bearer authorization and task id payload', async () => {
    await getWaitingUSESStatus({
      cred: 'token-xyz',
      taskId: 'task-001',
      user: '42',
    });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('http://api.test/uploadWaitingUSESStatus');
    expect(options.headers.Authorization).toBe('Bearer token-xyz');
    expect(JSON.parse(options.body)).toEqual({ taskId: 'task-001', user: '42' });
  });

  test('getUploadInputNodesStatus sends bearer authorization and cursor payload', async () => {
    await getUploadInputNodesStatus({
      cred: 'token-upload',
      taskId: 'upload-001',
      user: '42',
      cursor: 12,
    });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('http://api.test/uploadInputNodesStatus');
    expect(options.headers.Authorization).toBe('Bearer token-upload');
    expect(JSON.parse(options.body)).toEqual({ taskId: 'upload-001', user: '42', cursor: 12 });
  });

  test('cancelUploadInputNodes sends bearer authorization and task id payload', async () => {
    await cancelUploadInputNodes({
      cred: 'token-upload',
      taskId: 'upload-002',
      user: '42',
      cursor: 3,
    });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('http://api.test/uploadInputNodesCancel');
    expect(options.headers.Authorization).toBe('Bearer token-upload');
    expect(JSON.parse(options.body)).toEqual({ taskId: 'upload-002', user: '42', cursor: 3 });
  });

  test('getUploadProperties sends bearer authorization to metadata endpoint', async () => {
    await getUploadProperties({
      cred: 'token-upload',
      database: 'archamap',
    });

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('http://api.test/metadata/uploadProperties/archamap');
    expect(options.method).toBe('GET');
    expect(options.headers.Authorization).toBe('Bearer token-upload');
  });
});
