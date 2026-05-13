const API_PREFIX = '/api';

const trimTrailingSlashes = (value = '') => String(value || '').replace(/\/+$/, '');

const trimLeadingSlashes = (value = '') => String(value || '').replace(/^\/+/, '');

/**
 * Return the configured API origin without the REST prefix.
 *
 * The deployment value historically points at https://api.catmapper.org.
 * Keeping the prefix logic here lets first-party callers move to /api
 * without requiring an environment-variable migration.
 */
export const apiOrigin = () => {
  const rawBase = trimTrailingSlashes(process.env.REACT_APP_API_URL || '');
  return rawBase.endsWith(API_PREFIX) ? rawBase.slice(0, -API_PREFIX.length) : rawBase;
};

/**
 * Return the canonical REST API base URL.
 */
export const apiBaseUrl = () => `${apiOrigin()}${API_PREFIX}`;

/**
 * Build an absolute URL for a REST API path.
 */
export const apiUrl = (path = '') => {
  const normalizedPath = trimLeadingSlashes(path);
  if (!normalizedPath) {
    return apiBaseUrl();
  }
  if (normalizedPath === trimLeadingSlashes(API_PREFIX)) {
    return apiBaseUrl();
  }
  if (normalizedPath.startsWith(`${trimLeadingSlashes(API_PREFIX)}/`)) {
    return `${apiOrigin()}/${normalizedPath}`;
  }
  return `${apiBaseUrl()}/${normalizedPath}`;
};

export const apiEndpoints = {
  csvBackupUrls: (database) => `/databases/${encodeURIComponent(database)}/downloads/csv-urls`,
  nodeDetails: (database, cmid) => `/databases/${encodeURIComponent(database)}/nodes/${encodeURIComponent(cmid)}`,
  nodeLogs: (database, cmid) => `/databases/${encodeURIComponent(database)}/nodes/${encodeURIComponent(cmid)}/logs`,
  uploadInputNodes: () => '/uploads/input-nodes',
  uploadInputNodesStatus: () => '/uploads/input-nodes/status',
  uploadInputNodesCancel: () => '/uploads/input-nodes/cancel',
  waitingUsesStatus: () => '/uploads/waiting-uses/status',
  uploadProperties: (database) => `/databases/${encodeURIComponent(database)}/metadata/upload-properties`,
  profile: (userId) => `/users/${encodeURIComponent(userId)}/profile`,
  bookmarks: (userId) => `/users/${encodeURIComponent(userId)}/bookmarks`,
  history: (userId) => `/users/${encodeURIComponent(userId)}/history`,
  translations: () => '/translations',
  translationTasks: () => '/translation-tasks',
  translationTaskStatus: () => '/translation-tasks/status',
  translationTaskCancel: () => '/translation-tasks/cancel',
};
