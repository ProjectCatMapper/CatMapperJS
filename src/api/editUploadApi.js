const getApiBase = () => process.env.REACT_APP_API_URL;

const authHeaders = (cred) => ({
  'Content-Type': 'application/json',
  ...(cred ? { Authorization: `Bearer ${cred}` } : {}),
});

export const uploadInputNodes = ({ cred, payload }) => {
  return fetch(`${getApiBase()}/uploadInputNodes`, {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify(payload),
  });
};

export const updateWaitingUSES = ({ cred, database, user }) => {
  return fetch(`${getApiBase()}/updateWaitingUSES`, {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({ database, user }),
  });
};

export const getWaitingUSESStatus = ({ cred, taskId, user }) => {
  return fetch(`${getApiBase()}/uploadWaitingUSESStatus`, {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({ taskId, user }),
  });
};

export const getUploadInputNodesStatus = ({ cred, taskId, user, cursor = 0 }) => {
  return fetch(`${getApiBase()}/uploadInputNodesStatus`, {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({ taskId, user, cursor }),
  });
};

export const cancelUploadInputNodes = ({ cred, taskId, user, cursor = 0 }) => {
  return fetch(`${getApiBase()}/uploadInputNodesCancel`, {
    method: 'POST',
    headers: authHeaders(cred),
    body: JSON.stringify({ taskId, user, cursor }),
  });
};

export const getUploadProperties = ({ cred, database }) => {
  return fetch(`${getApiBase()}/metadata/uploadProperties/${database}`, {
    method: 'GET',
    headers: authHeaders(cred),
  });
};
