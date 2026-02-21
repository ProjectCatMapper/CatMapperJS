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
