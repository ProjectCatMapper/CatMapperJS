const MOCK_USERS_KEY = 'catmapper_mock_users_v1';
const PROFILE_REQUESTS_KEY = 'catmapper_mock_profile_requests_v1';
const PASSWORD_REQUESTS_KEY = 'catmapper_mock_password_requests_v1';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return 'your registered email';
  const [name, domain] = email.split('@');
  if (!name || !domain) return 'your registered email';
  const prefix = name.length <= 2 ? `${name[0]}*` : `${name.slice(0, 2)}***`;
  return `${prefix}@${domain}`;
};

const randomId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const randomCode = () => String(Math.floor(100000 + Math.random() * 900000));

const sanitizeProfile = (profile) => ({
  userId: profile.userId,
  firstName: profile.firstName || '',
  lastName: profile.lastName || '',
  username: profile.username || '',
  email: profile.email || '',
  database: profile.database || '',
  intendedUse: profile.intendedUse || '',
  createdAt: profile.createdAt || new Date().toISOString(),
  updatedAt: profile.updatedAt || new Date().toISOString(),
  passwordLastChangedAt: profile.passwordLastChangedAt || new Date().toISOString()
});

const ensureUser = ({ userId, database, cred }) => {
  if (!userId) {
    throw new Error('Missing userId. User must be logged in.');
  }

  const users = readJson(MOCK_USERS_KEY, {});
  if (!users[userId]) {
    users[userId] = {
      userId,
      firstName: cred?.firstName || '',
      lastName: cred?.lastName || '',
      username: cred?.user || cred?.username || '',
      email: cred?.email || '',
      database: database || cred?.database || '',
      intendedUse: cred?.intendedUse || '',
      password: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordLastChangedAt: new Date().toISOString()
    };
    writeJson(MOCK_USERS_KEY, users);
  }

  return users;
};

export const getUserProfile = async ({ userId, database, cred }) => {
  await wait(150);
  const users = ensureUser({ userId, database, cred });
  return sanitizeProfile(users[userId]);
};

export const requestProfileUpdate = async ({ userId, updates }) => {
  await wait(200);

  const users = ensureUser({ userId });
  const current = users[userId];

  const requests = readJson(PROFILE_REQUESTS_KEY, {});
  const requestId = randomId('profile');
  const verificationCode = randomCode();

  requests[requestId] = {
    userId,
    updates,
    verificationCode,
    createdAt: new Date().toISOString()
  };
  writeJson(PROFILE_REQUESTS_KEY, requests);

  return {
    requestId,
    maskedEmail: maskEmail(updates.email || current.email),
    debugVerificationCode: verificationCode
  };
};

export const confirmProfileUpdate = async ({ userId, requestId, verificationCode }) => {
  await wait(200);

  const users = ensureUser({ userId });
  const requests = readJson(PROFILE_REQUESTS_KEY, {});
  const request = requests[requestId];

  if (!request || request.userId !== userId) {
    throw new Error('Profile update request not found. Please request a new verification email.');
  }

  if (request.verificationCode !== verificationCode) {
    throw new Error('Invalid verification code.');
  }

  users[userId] = {
    ...users[userId],
    ...request.updates,
    updatedAt: new Date().toISOString()
  };

  delete requests[requestId];

  writeJson(MOCK_USERS_KEY, users);
  writeJson(PROFILE_REQUESTS_KEY, requests);

  return sanitizeProfile(users[userId]);
};

export const requestPasswordChange = async ({ userId, currentPassword, newPassword }) => {
  await wait(200);

  const users = ensureUser({ userId });
  const current = users[userId];

  if ((current.password || '') && current.password !== currentPassword) {
    throw new Error('Current password is incorrect.');
  }

  const requests = readJson(PASSWORD_REQUESTS_KEY, {});
  const requestId = randomId('password');
  const verificationCode = randomCode();

  requests[requestId] = {
    userId,
    newPassword,
    verificationCode,
    createdAt: new Date().toISOString()
  };
  writeJson(PASSWORD_REQUESTS_KEY, requests);

  return {
    requestId,
    maskedEmail: maskEmail(current.email),
    debugVerificationCode: verificationCode
  };
};

export const confirmPasswordChange = async ({ userId, requestId, verificationCode }) => {
  await wait(200);

  const users = ensureUser({ userId });
  const requests = readJson(PASSWORD_REQUESTS_KEY, {});
  const request = requests[requestId];

  if (!request || request.userId !== userId) {
    throw new Error('Password change request not found. Please request a new verification email.');
  }

  if (request.verificationCode !== verificationCode) {
    throw new Error('Invalid verification code.');
  }

  users[userId] = {
    ...users[userId],
    password: request.newPassword,
    passwordLastChangedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  delete requests[requestId];

  writeJson(MOCK_USERS_KEY, users);
  writeJson(PASSWORD_REQUESTS_KEY, requests);

  return {
    passwordLastChangedAt: users[userId].passwordLastChangedAt
  };
};
