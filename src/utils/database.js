export const DEFAULT_DATABASE = 'sociomap';
export const SUPPORTED_DATABASES = ['sociomap', 'archamap'];

export const normalizeDatabase = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
};

export const isValidDatabase = (value) => {
  return SUPPORTED_DATABASES.includes(normalizeDatabase(value));
};

export const ensureDatabase = (value, fallback = DEFAULT_DATABASE) => {
  return isValidDatabase(value) ? normalizeDatabase(value) : fallback;
};

export const rewritePathWithDatabase = (pathname, database = DEFAULT_DATABASE) => {
  const safeDatabase = ensureDatabase(database);
  if (!pathname || pathname === '/') {
    return `/${safeDatabase}`;
  }

  const segments = pathname.split('/');
  if (segments.length > 1) {
    segments[1] = safeDatabase;
  } else {
    segments.push(safeDatabase);
  }

  return segments.join('/') || `/${safeDatabase}`;
};
