import { apiEndpoints, apiUrl } from './endpoints';

const authHeaders = (cred) => ({
  'Content-Type': 'application/json',
  ...(cred ? { Authorization: `Bearer ${cred}` } : {}),
});

export const uploadInputNodes = ({ cred, payload }) => {
  return fetch(apiUrl(apiEndpoints.uploadInputNodes()), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify(payload),
  });
};

export const updateWaitingUSES = ({ cred, database, user }) => {
  return fetch(apiUrl('/updateWaitingUSES'), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({ database, user }),
  });
};

export const getWaitingUSESStatus = ({ cred, taskId, user }) => {
  return fetch(apiUrl(apiEndpoints.waitingUsesStatus()), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({ taskId, user }),
  });
};

export const getUploadInputNodesStatus = ({ cred, taskId, user, cursor = 0 }) => {
  return fetch(apiUrl(apiEndpoints.uploadInputNodesStatus()), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({ taskId, user, cursor }),
  });
};

export const cancelUploadInputNodes = ({ cred, taskId, user, cursor = 0 }) => {
  return fetch(apiUrl(apiEndpoints.uploadInputNodesCancel()), {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({ taskId, user, cursor }),
  });
};

export const getUploadProperties = ({ cred, database }) => {
  return fetch(apiUrl(apiEndpoints.uploadProperties(database)), {
    method: 'GET',
    headers: authHeaders(cred),
  });
};
